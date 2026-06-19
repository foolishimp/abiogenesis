// Implements: T-175

export interface SdlcEnvironmentReadPlan {
  readonly kind: "sdlc_environment_read_plan";
  readonly names: readonly string[];
}

export interface SdlcEnvironmentReadResult {
  readonly kind: "sdlc_environment_read_result";
  readonly values: Readonly<Record<string, string | null>>;
}

export function constructSdlcEnvironmentReadPlan(input: {
  readonly names: readonly string[];
}): SdlcEnvironmentReadPlan {
  return Object.freeze({
    kind: "sdlc_environment_read_plan" as const,
    names: Object.freeze([...new Set(input.names)].sort())
  });
}

export function executeSdlcEnvironmentReadPlan(
  plan: SdlcEnvironmentReadPlan
): SdlcEnvironmentReadResult {
  return Object.freeze({
    kind: "sdlc_environment_read_result" as const,
    values: Object.freeze(
      Object.fromEntries(
        plan.names.map((name) => [name, process.env[name] ?? null])
      )
    )
  });
}
