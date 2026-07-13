import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync
} from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

import type { AgentTransportContract } from "./carriers.js";
import { admitTransportAppendArgs } from "./transport_contracts.js";
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
  // B-001 downstream RCA (2026-07-14): the capability lane must ride the
  // dispatch request or it is unreachable through the real transport path —
  // the lane existed on claudeStreamJsonArgs while runAgentTransport never
  // passed it, so every stream-json claude dispatch stayed tool-less
  // regardless of the stage's declared worker-executes contract. Default
  // remains the closed-prompt proof lane.
  readonly lane?: TransportCapabilityLane;
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

// Lane law (B-001 support/4.6.x): tool posture belongs to the dispatching
// stage's declared capability lane, not to the transport shape. A
// closed-prompt proof stays tool-less; a worker-executes stage must carry
// tools or the execution-default law ("run the declared command yourself")
// is structurally unsatisfiable — an honest worker can only report that no
// execution tool was available, and a dishonest one fabricates results.
export type TransportCapabilityLane = "closed_prompt_proof" | "worker_executes";

export function claudeStreamJsonArgs(
  prompt: string,
  responseJsonSchema?: unknown,
  options?: {
    readonly lane?: TransportCapabilityLane;
    readonly appendArgs?: readonly string[];
  }
): readonly string[] {
  void prompt;
  const lane = options?.lane ?? "closed_prompt_proof";
  const args = [
    "-p",
    "--disable-slash-commands",
    "--no-session-persistence",
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    "bypassPermissions"
  ];
  // Both execution-gating flags are lane-owned: `--safe-mode` forces tool
  // approval even under bypassPermissions, so a worker-executes dispatch
  // carrying it is as unsatisfiable as one carrying `--tools ""`.
  if (lane === "closed_prompt_proof") {
    args.push("--safe-mode", "--tools", "");
  }
  if (responseJsonSchema !== undefined) {
    args.push("--json-schema", JSON.stringify(responseJsonSchema));
  }
  args.push(
    ...admitTransportAppendArgs({
      agentKey: "claude",
      ...(options?.appendArgs !== undefined
        ? { explicitArgs: options.appendArgs }
        : {})
    })
  );
  return Object.freeze(args);
}

// The dispatch-path argv composition is one exported seam so the lane wiring
// is provable at the surface runAgentTransport actually uses — a direct
// claudeStreamJsonArgs proof does not witness this path (B-001 downstream
// RCA: codex's tooled template masked the unconnected claude lane).
export function composeAgentTransportArgs(
  request: Pick<
    AgentTransportRequest,
    "contract" | "prompt" | "responseJsonSchema" | "lane"
  >,
  outputPath: string
): readonly string[] {
  if (request.contract.agentKey === "claude") {
    return claudeStreamJsonArgs(request.prompt, request.responseJsonSchema, {
      ...(request.lane !== undefined ? { lane: request.lane } : {})
    });
  }
  return renderAgentTransportArgs(request.contract.argsTemplate, {
    prompt: request.prompt,
    outputPath
  });
}

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function pathIsWithin(root: string, candidate: string): boolean {
  const rel = relative(root, candidate);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel));
}

function errorCode(error: unknown): unknown {
  return typeof error === "object" && error !== null && "code" in error
    ? Reflect.get(error, "code")
    : null;
}

function assertNoExistingSymlink(root: string, candidate: string, label: string): void {
  const rel = relative(root, candidate);
  let current = root;
  for (const component of rel === "" ? [] : rel.split(sep)) {
    current = join(current, component);
    try {
      if (lstatSync(current).isSymbolicLink()) {
        throw new TypeError(`${label} contains a symbolic-link component`);
      }
    } catch (error) {
      const code = errorCode(error);
      if (code === "ENOENT") {
        return;
      }
      throw error;
    }
  }
}

function admitArchivePath(
  lexicalRoot: string,
  admittedRoot: string,
  candidate: string,
  label: string
): string {
  const absoluteCandidate = resolve(candidate);
  const relativeCandidate = relative(lexicalRoot, absoluteCandidate);
  if (
    relativeCandidate === ".." ||
    relativeCandidate.startsWith(`..${sep}`) ||
    isAbsolute(relativeCandidate)
  ) {
    throw new TypeError(`${label} must remain beneath archiveRoot`);
  }
  const admittedCandidate = resolve(admittedRoot, relativeCandidate);
  assertNoExistingSymlink(admittedRoot, admittedCandidate, label);
  return admittedCandidate;
}

function admitAgentTransportArchivePaths(
  input: AgentTransportRequest
): AgentTransportRequest {
  mkdirSync(input.archiveRoot, { recursive: true });
  const lexicalRoot = resolve(input.archiveRoot);
  const admittedRoot = realpathSync(input.archiveRoot);
  const admitted = (path: string, label: string): string =>
    admitArchivePath(lexicalRoot, admittedRoot, path, label);
  return Object.freeze({
    ...input,
    archiveRoot: admittedRoot,
    ...(input.outputPath === undefined
      ? {}
      : { outputPath: admitted(input.outputPath, "outputPath") }),
    ...(input.promptPath === undefined
      ? {}
      : { promptPath: admitted(input.promptPath, "promptPath") }),
    ...(input.stdoutPath === undefined
      ? {}
      : { stdoutPath: admitted(input.stdoutPath, "stdoutPath") }),
    ...(input.stderrPath === undefined
      ? {}
      : { stderrPath: admitted(input.stderrPath, "stderrPath") }),
    ...(input.transportPath === undefined
      ? {}
      : { transportPath: admitted(input.transportPath, "transportPath") }),
    ...(input.traceRoot === undefined
      ? {}
      : { traceRoot: admitted(input.traceRoot, "traceRoot") })
  });
}

function defaultPath(request: AgentTransportRequest, suffix: string): string {
  const candidate = resolve(request.archiveRoot, `${request.label}${suffix}`);
  if (!pathIsWithin(request.archiveRoot, candidate)) {
    throw new TypeError("agent transport label must keep default paths beneath archiveRoot");
  }
  assertNoExistingSymlink(request.archiveRoot, candidate, "default transport path");
  return candidate;
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
  readonly lane: TransportCapabilityLane;
}): AgentTransportFailureClass | null {
  if (input.status !== 0 && hasTransportFailureSignal(input)) {
    return "transport_failure";
  }
  // B-001 downstream RCA, second seam: tool use is a contract violation ONLY
  // in the closed-prompt proof lane. A worker-executes dispatch REQUIRES tool
  // use (execution-default law) — classifying it as contract_failure would
  // fail-close every honest executing worker even with the lane argv wired.
  if (input.lane === "closed_prompt_proof") {
    if (input.toolCallCount > 0) {
      return "contract_failure";
    }
    if (hasToolTranscriptMarker(input.text)) {
      return "contract_failure";
    }
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
  for (const [label, filePath] of [
    ["promptPath", request.promptPath ?? defaultPath(request, "-prompt.txt")],
    ["outputPath", result.outputPath],
    ["stdoutPath", request.stdoutPath ?? defaultPath(request, "-stdout.log")],
    ["stderrPath", request.stderrPath ?? defaultPath(request, "-stderr.log")],
    ["transportPath", request.transportPath ?? defaultPath(request, "-transport.json")]
  ] as const) {
    assertNoExistingSymlink(request.archiveRoot, filePath, `${label} after transport`);
  }
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
  input: AgentTransportRequest
): Promise<AgentTransportResult> {
  const request = admitAgentTransportArchivePaths(input);
  mkdirSync(request.archiveRoot, { recursive: true });
  const outputPath = outputPathFor(request);
  const traceRoot = request.traceRoot ?? defaultPath(request, ".trace");
  const executorProfile = executorProfileFor(request);
  const isClaude = request.contract.agentKey === "claude";
  const workerRef = request.workerRef ?? request.contract.agentKey;
  const args = composeAgentTransportArgs(request, outputPath);
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
  // The output path is disclosed to generic workers. Re-admit it after the
  // external effect and before either reading or overwriting it, so a worker
  // cannot replace the checked target with a symlink and redirect archive IO.
  assertNoExistingSymlink(
    request.archiveRoot,
    outputPath,
    "outputPath after transport"
  );
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
      toolCallCount: traced.toolCallEvents.length,
      lane: request.lane ?? "closed_prompt_proof"
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
