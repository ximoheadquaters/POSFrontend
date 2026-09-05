export function logStage(stage, error, context = {}) {
  const details = {
    stage,
    message: error?.message || String(error || "Unknown error"),
    code: error?.code,
    status: error?.response?.status || error?.status,
    ...context,
  };

  console.error(`[Ximo] ${stage}`, details);
}