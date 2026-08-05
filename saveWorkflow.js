console.log("===== INFORMACIÓN DEL WORKFLOW =====");

console.log("Workflow:", process.env.GITHUB_WORKFLOW);
console.log("Run ID:", process.env.GITHUB_RUN_ID);
console.log("Run Number:", process.env.GITHUB_RUN_NUMBER);
console.log("Actor:", process.env.GITHUB_ACTOR);
console.log("Repositorio:", process.env.GITHUB_REPOSITORY);
console.log("Rama:", process.env.GITHUB_REF);
console.log("Commit:", process.env.GITHUB_SHA);
console.log("Evento:", process.env.GITHUB_EVENT_NAME);
console.log("Job:", process.env.GITHUB_JOB);