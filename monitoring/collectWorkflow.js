import mongoose from 'mongoose';

import {WorkflowRun} from './models/WorkflowRun.js';

function requiredEnvironmentVariable(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Falta la variable de entorno obligatoria: ${name}`
    );
  }

  return value;
}

function calculateDuration(startedAt, completedAt) {
  if (!startedAt || !completedAt) {
    return 0;
  }

  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 0;
  }

  return Math.max(
    0,
    Math.round((end - start) / 1000)
  );
}

async function githubRequest(endpoint) {
  const token = requiredEnvironmentVariable('GH_TOKEN');

  const response = await fetch(
    `https://api.github.com${endpoint}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'ci-bake-actions-monitor'
      }
    }
  );

  if (!response.ok) {
    const responseBody = await response.text();

    throw new Error(
      `GitHub API respondió ${response.status}: ${responseBody}`
    );
  }

  return response.json();
}

function mapStep(step) {
  return {
    number: step.number,
    name: step.name,
    status: step.status || null,
    conclusion: step.conclusion || null,
    startedAt: step.started_at
      ? new Date(step.started_at)
      : null,
    completedAt: step.completed_at
      ? new Date(step.completed_at)
      : null,
    durationSeconds: calculateDuration(
      step.started_at,
      step.completed_at
    )
  };
}

function mapJob(job) {
  return {
    jobId: job.id,
    name: job.name,
    status: job.status || null,
    conclusion: job.conclusion || null,
    runnerName: job.runner_name || null,
    runnerGroupName: job.runner_group_name || null,
    startedAt: job.started_at
      ? new Date(job.started_at)
      : null,
    completedAt: job.completed_at
      ? new Date(job.completed_at)
      : null,
    durationSeconds: calculateDuration(
      job.started_at,
      job.completed_at
    ),
    htmlUrl: job.html_url || null,
    steps: (job.steps || []).map(mapStep)
  };
}

async function collectWorkflow() {
  const repository =
    requiredEnvironmentVariable('SOURCE_REPOSITORY');

  const sourceRunId =
    requiredEnvironmentVariable('SOURCE_RUN_ID');

  const mongoUri =
    requiredEnvironmentVariable('MONGODB_URI');

  const [owner, repositoryName] = repository.split('/');

  if (!owner || !repositoryName) {
    throw new Error(
      'SOURCE_REPOSITORY debe tener el formato usuario/repositorio'
    );
  }

  console.log('========================================');
  console.log('RECOLECTANDO WORKFLOW');
  console.log('========================================');
  console.log('Repositorio:', repository);
  console.log('Run ID:', sourceRunId);

  await mongoose.connect(mongoUri);

  try {
    const run = await githubRequest(
      `/repos/${owner}/${repositoryName}/actions/runs/${sourceRunId}`
    );

    const jobsResponse = await githubRequest(
      `/repos/${owner}/${repositoryName}/actions/runs/${sourceRunId}/jobs?per_page=100`
    );

    const jobs = jobsResponse.jobs.map(mapJob);

    const startedAt =
      run.run_started_at || run.created_at;

    const completedAt = run.updated_at;

    const workflowData = {
      runId: run.id,
      workflowId: run.workflow_id,
      workflowName: run.name,
      runNumber: run.run_number,
      runAttempt: run.run_attempt || 1,
      repositoryName: repository,
      actor: run.actor?.login || null,
      branchName: run.head_branch || null,
      commitSha: run.head_sha || null,
      eventName: run.event || null,
      status: run.status || null,
      conclusion: run.conclusion || null,
      startedAt: startedAt
        ? new Date(startedAt)
        : null,
      completedAt: completedAt
        ? new Date(completedAt)
        : null,
      durationSeconds: calculateDuration(
        startedAt,
        completedAt
      ),
      htmlUrl: run.html_url || null,
      jobs
    };

    await WorkflowRun.findOneAndUpdate(
      {
        runId: run.id
      },
      workflowData,
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    const totalSteps = jobs.reduce(
      (total, job) => total + job.steps.length,
      0
    );

    console.log('========================================');
    console.log('WORKFLOW GUARDADO CORRECTAMENTE');
    console.log('========================================');
    console.log('Workflow:', run.name);
    console.log('Estado:', run.status);
    console.log('Conclusión:', run.conclusion);
    console.log('Jobs guardados:', jobs.length);
    console.log('Steps guardados:', totalSteps);
  } finally {
    await mongoose.disconnect();
  }
}

collectWorkflow().catch((error) => {
  console.error('========================================');
  console.error('ERROR AL GUARDAR EL WORKFLOW');
  console.error('========================================');
  console.error(error);

  process.exitCode = 1;
});