export function selectedExecutorProfile() {
  const raw = process.env["ABG_TS_AGENT_EXECUTOR_PROFILE"];
  if (raw === undefined || raw.trim().length === 0) {
    return undefined;
  }
  const normalized = raw.trim();
  if (normalized === "local-spawn" || normalized === "pty-terminal") {
    return normalized;
  }
  throw new Error(
    `unsupported ABG_TS_AGENT_EXECUTOR_PROFILE=${raw}; expected local-spawn or pty-terminal`
  );
}

export function executorProfileFields() {
  const executorProfile = selectedExecutorProfile();
  return executorProfile === undefined ? {} : { executorProfile };
}
