// Implements: T-175

import { spawnSync, type SpawnSyncOptionsWithStringEncoding } from "node:child_process";

export interface SdlcProcessRunPlan {
  readonly kind: "sdlc_process_run_plan";
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
  readonly timeoutMs: number | null;
  readonly maxBufferBytes: number | null;
}

export interface SdlcProcessRunResult {
  readonly kind: "sdlc_process_run_result";
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly status: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly errorMessage: string | null;
}

export function constructSdlcProcessRunPlan(input: {
  readonly command: string;
  readonly args?: readonly string[] | undefined;
  readonly cwd: string;
  readonly env?: Readonly<Record<string, string>> | undefined;
  readonly timeoutMs?: number | null | undefined;
  readonly maxBufferBytes?: number | null | undefined;
}): SdlcProcessRunPlan {
  return Object.freeze({
    kind: "sdlc_process_run_plan" as const,
    command: input.command,
    args: Object.freeze([...(input.args ?? [])]),
    cwd: input.cwd,
    env: Object.freeze({ ...(input.env ?? {}) }),
    timeoutMs: input.timeoutMs ?? null,
    maxBufferBytes: input.maxBufferBytes ?? null
  });
}

export function executeSdlcProcessRunPlan(
  plan: SdlcProcessRunPlan
): SdlcProcessRunResult {
  const options: SpawnSyncOptionsWithStringEncoding = {
    cwd: plan.cwd,
    env: { ...process.env, ...plan.env },
    encoding: "utf8",
    timeout: plan.timeoutMs ?? undefined,
    maxBuffer: plan.maxBufferBytes ?? undefined
  };
  const result = spawnSync(plan.command, [...plan.args], options);
  return Object.freeze({
    kind: "sdlc_process_run_result" as const,
    command: plan.command,
    args: plan.args,
    cwd: plan.cwd,
    status: result.status,
    signal: result.signal,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    errorMessage: result.error instanceof Error ? result.error.message : null
  });
}
