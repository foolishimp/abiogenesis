import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";

import type { AgentTransportContract } from "./carriers.js";
import {
  runAgentActorWorkerCallout,
  type TracedProcessExecutorProfile,
  type TracedProcessOutcome,
  type TracedProcessPaths
} from "../traced_process/index.js";

export type AgentTransportFailureClass =
  | "transport_failure"
  | "no_output"
  | "contract_failure";

export interface AgentTransportRequest {
  readonly contract: AgentTransportContract;
  readonly prompt: string;
  readonly responseJsonSchema?: unknown;
  readonly cwd: string;
  readonly archiveRoot: string;
  readonly label: string;
  readonly timeoutMs?: number;
  readonly executorProfile?: TracedProcessExecutorProfile;
  readonly terminalSessionKey?: string;
  readonly terminalPollMs?: number;
  readonly outputPath?: string;
  readonly promptPath?: string;
  readonly stdoutPath?: string;
  readonly stderrPath?: string;
  readonly transportPath?: string;
  readonly traceRoot?: string;
  readonly workerRef?: string;
  readonly actorRef?: string;
}

export interface AgentTransportResult {
  readonly agentKey: string;
  readonly workerRef: string;
  readonly actorRef: string | null;
  readonly command: string;
  readonly args: readonly string[];
  readonly executorProfile: TracedProcessExecutorProfile;
  readonly terminalSessionId: string | null;
  readonly outcome: TracedProcessOutcome;
  readonly outputPath: string;
  readonly status: number | null;
  readonly signal: string | null;
  readonly error: string | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly text: string;
  readonly timedOut: boolean;
  readonly inactivityTimedOut: boolean;
  readonly failureClass: AgentTransportFailureClass | null;
  readonly structuredEventCount: number;
  readonly apiRetryCount: number;
  readonly toolCallCount: number;
  readonly finalOutput: string;
  readonly traceRoot: string | null;
  readonly tracePaths: TracedProcessPaths | null;
  readonly traceResultPath: string | null;
}

function stringEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      out[key] = value;
    }
  }
  return out;
}

export function sanitizeAgentTransportEnvironment(
  contract: AgentTransportContract,
  source: Readonly<Record<string, string>> = stringEnv()
): Record<string, string> {
  const prefixes = contract.sanitizedEnvironmentPolicy.prefixes.filter(
    (prefix) => prefix.length > 0
  );
  const env: Record<string, string> = {};
  outer: for (const [key, value] of Object.entries(source)) {
    for (const prefix of prefixes) {
      if (key.startsWith(prefix)) {
        continue outer;
      }
    }
    env[key] = value;
  }
  return env;
}

export function renderAgentTransportArgs(
  template: readonly string[],
  replacements: {
    readonly prompt: string;
    readonly outputPath: string;
  }
): readonly string[] {
  return template.map((arg) =>
    arg
      .replaceAll("{prompt}", replacements.prompt)
      .replaceAll("{output_path}", replacements.outputPath)
  );
}

export function claudeStreamJsonArgs(
  prompt: string,
  responseJsonSchema?: unknown
): readonly string[] {
  void prompt;
  const args = [
    "-p",
    "--safe-mode",
    "--disable-slash-commands",
    "--no-session-persistence",
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    "bypassPermissions",
    "--tools",
    ""
  ];
  if (responseJsonSchema !== undefined) {
    args.push("--json-schema", JSON.stringify(responseJsonSchema));
  }
  return Object.freeze(args);
}

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function defaultPath(request: AgentTransportRequest, suffix: string): string {
  return join(request.archiveRoot, `${request.label}${suffix}`);
}

function outputPathFor(request: AgentTransportRequest): string {
  return request.outputPath ?? defaultPath(request, "-output.txt");
}

function executorProfileFor(
  request: AgentTransportRequest
): TracedProcessExecutorProfile | undefined {
  return request.executorProfile;
}

function collectPlainTransportText(stdout: string, outputPath: string): string {
  if (existsSync(outputPath)) {
    const output = readFileSync(outputPath, "utf8");
    if (output.trim().length > 0) {
      return output;
    }
  }
  return stdout;
}

function environmentForAgentTransport(
  contract: AgentTransportContract
): Record<string, string> {
  const env = sanitizeAgentTransportEnvironment(contract);
  if (contract.agentKey === "claude") {
    delete env["CLAUDE_CODE_ENABLE_EXPERIMENTAL_ADVISOR_TOOL"];
    env["CLAUDE_CODE_DISABLE_ADVISOR_TOOL"] = "1";
  }
  return env;
}

function hasTransportFailureSignal(input: {
  readonly timedOut: boolean;
  readonly inactivityTimedOut: boolean;
  readonly error: string | null;
  readonly text: string;
  readonly stderr: string;
  readonly outcome: TracedProcessOutcome;
  readonly parser: "generic-text" | "claude-stream-json";
  readonly structuredEventCount: number;
  readonly apiRetryCount: number;
}): boolean {
  return (
    input.timedOut ||
    input.inactivityTimedOut ||
    input.outcome.kind === "executor_unavailable" ||
    input.outcome.kind === "launch_failed" ||
    input.outcome.kind === "process_error" ||
    input.outcome.kind === "lost_terminal" ||
    (input.parser === "claude-stream-json" && input.structuredEventCount === 0) ||
    (input.text.trim().length === 0 && input.stderr.trim().length === 0) ||
    input.apiRetryCount > 0 ||
    /API Error:/iu.test(input.text) ||
    /API Error:/iu.test(input.stderr) ||
    /ETIMEDOUT|ECONNRESET|ConnectionRefused|FailedToOpenSocket/iu.test(
      input.error ?? ""
    )
  );
}

function hasToolTranscriptMarker(text: string): boolean {
  return (
    text.includes("**Use Tool:") ||
    text.includes("**Tool Results:") ||
    text.includes("<function_calls>") ||
    text.includes("<invoke name=")
  );
}

function classifyFailure(input: {
  readonly status: number | null;
  readonly timedOut: boolean;
  readonly inactivityTimedOut: boolean;
  readonly error: string | null;
  readonly text: string;
  readonly stderr: string;
  readonly outcome: TracedProcessOutcome;
  readonly parser: "generic-text" | "claude-stream-json";
  readonly structuredEventCount: number;
  readonly apiRetryCount: number;
  readonly toolCallCount: number;
}): AgentTransportFailureClass | null {
  if (input.status !== 0 && hasTransportFailureSignal(input)) {
    return "transport_failure";
  }
  if (input.toolCallCount > 0) {
    return "contract_failure";
  }
  if (hasToolTranscriptMarker(input.text)) {
    return "contract_failure";
  }
  if (input.status === 0) {
    return input.text.trim().length === 0 ? "no_output" : null;
  }
  return "contract_failure";
}

function writeTransportArtifacts(
  request: AgentTransportRequest,
  result: AgentTransportResult
): void {
  mkdirSync(request.archiveRoot, { recursive: true });
  writeFileSync(
    request.promptPath ?? defaultPath(request, "-prompt.txt"),
    request.prompt,
    "utf8"
  );
  writeFileSync(result.outputPath, result.text, "utf8");
  writeFileSync(
    request.stdoutPath ?? defaultPath(request, "-stdout.log"),
    result.stdout,
    "utf8"
  );
  writeFileSync(
    request.stderrPath ?? defaultPath(request, "-stderr.log"),
    result.stderr,
    "utf8"
  );
  writeJson(
    request.transportPath ?? defaultPath(request, "-transport.json"),
    result
  );
}

export async function runAgentTransport(
  request: AgentTransportRequest
): Promise<AgentTransportResult> {
  mkdirSync(request.archiveRoot, { recursive: true });
  const outputPath = outputPathFor(request);
  const traceRoot = request.traceRoot ?? defaultPath(request, ".trace");
  const executorProfile = executorProfileFor(request);
  const isClaude = request.contract.agentKey === "claude";
  const workerRef = request.workerRef ?? request.contract.agentKey;
  const args = isClaude
    ? claudeStreamJsonArgs(request.prompt, request.responseJsonSchema)
    : renderAgentTransportArgs(request.contract.argsTemplate, {
        prompt: request.prompt,
        outputPath
      });
  const traced = await runAgentActorWorkerCallout({
    agentCalloutKind: "agent_worker",
    workerRef,
    ...(request.actorRef === undefined ? {} : { actorRef: request.actorRef }),
    command: request.contract.command,
    args,
    cwd: request.cwd,
    env: environmentForAgentTransport(request.contract),
    archiveRoot: traceRoot,
    label: request.label,
    parser: isClaude ? "claude-stream-json" : "generic-text",
    ...(isClaude ? { stdin: request.prompt } : {}),
    ...(executorProfile === undefined
      ? {}
      : { executorProfile }),
    ...(request.terminalSessionKey === undefined
      ? {}
      : { terminalSessionKey: request.terminalSessionKey }),
    ...(request.terminalPollMs === undefined
      ? {}
      : { terminalPollMs: request.terminalPollMs }),
    ...(request.timeoutMs === undefined ? {} : { timeoutMs: request.timeoutMs })
  });
  const text =
    isClaude && traced.finalOutput.trim().length > 0
      ? traced.finalOutput
      : collectPlainTransportText(traced.stdout, outputPath);
  const result: AgentTransportResult = {
    agentKey: request.contract.agentKey,
    workerRef,
    actorRef: request.actorRef ?? null,
    command: traced.command,
    args: traced.args,
    executorProfile: traced.executorProfile,
    terminalSessionId: traced.terminalSessionId,
    outcome: traced.outcome,
    outputPath,
    status: traced.status,
    signal: traced.signal,
    error: traced.error,
    stdout: traced.stdout,
    stderr: traced.stderr,
    text,
    timedOut: traced.timedOut,
    inactivityTimedOut: traced.inactivityTimedOut,
    failureClass: classifyFailure({
      status: traced.status,
      timedOut: traced.timedOut,
      inactivityTimedOut: traced.inactivityTimedOut,
      error: traced.error,
      text,
      stderr: traced.stderr,
      outcome: traced.outcome,
      parser: isClaude ? "claude-stream-json" : "generic-text",
      structuredEventCount: traced.structuredEventCount,
      apiRetryCount: traced.apiRetryEvents.length,
      toolCallCount: traced.toolCallEvents.length
    }),
    structuredEventCount: traced.structuredEventCount,
    apiRetryCount: traced.apiRetryEvents.length,
    toolCallCount: traced.toolCallEvents.length,
    finalOutput: isClaude ? traced.finalOutput : text,
    traceRoot,
    tracePaths: traced.paths,
    traceResultPath: traced.paths.result
  };
  writeTransportArtifacts(request, result);
  return result;
}
