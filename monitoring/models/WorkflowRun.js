import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: null
    },
    conclusion: {
      type: String,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    durationSeconds: {
      type: Number,
      default: 0
    }
  },
  {
    _id: false
  }
);

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: null
    },
    conclusion: {
      type: String,
      default: null
    },
    runnerName: {
      type: String,
      default: null
    },
    runnerGroupName: {
      type: String,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    htmlUrl: {
      type: String,
      default: null
    },
    steps: {
      type: [stepSchema],
      default: []
    }
  },
  {
    _id: false
  }
);

const workflowRunSchema = new mongoose.Schema(
  {
    runId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    workflowId: {
      type: Number,
      default: null
    },
    workflowName: {
      type: String,
      required: true
    },
    runNumber: {
      type: Number,
      default: null
    },
    runAttempt: {
      type: Number,
      default: 1
    },
    repositoryName: {
      type: String,
      required: true
    },
    actor: {
      type: String,
      default: null
    },
    branchName: {
      type: String,
      default: null
    },
    commitSha: {
      type: String,
      default: null
    },
    eventName: {
      type: String,
      default: null
    },
    status: {
      type: String,
      default: null
    },
    conclusion: {
      type: String,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    htmlUrl: {
      type: String,
      default: null
    },
    jobs: {
      type: [jobSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const WorkflowRun = mongoose.model(
  'WorkflowRun',
  workflowRunSchema
);