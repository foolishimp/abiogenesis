import { spawn, spawnSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";
import {
  createClaudeStreamJsonState,
  finalOutputFromClaudeStreamJsonState,
  flushClaudeStreamJson,
  observeClaudeStreamJsonChunk,
  type ClaudeStreamJsonObservation,
  type ClaudeStreamJsonState
} from "./claude_stream_json.js";

export * from "./claude_stream_json.js";

export type TracedProcessParser = "generic-text" | "claude-stream-json";
export type AgentActorWorkerCalloutKind = "agent_actor" | "agent_worker";
export type TracedProcessExecutorProfile = "local-spawn" | "pty-terminal";
export type TracedProcessStreamModel = "stdio" | "terminal-transcript";
export type TracedProcessExecutorUnavailableReason =
  | "screen_missing"
  | "screen_shell_unavailable";
export type TracedProcessOutcome =
  | {
      readonly kind: "exited";
      readonly status: number;
    }
  | {
      readonly kind: "signaled";
      readonly status: number | null;
      readonly signal: string;
    }
  | {
      readonly kind: "hard_timeout";
      readonly timeoutMs: number | null;
      readonly signal: string | null;
    }
  | {
      readonly kind: "inactivity_timeout";
      readonly inactivityTimeoutMs: number | null;
      readonly signal: string | null;
    }
  | {
      readonly kind: "executor_unavailable";
      readonly reason: TracedProcessExecutorUnavailableReason;
      readonly detail: string;
    }
  | {
      readonly kind: "launch_failed";
      readonly detail: string;
    }
  | {
      readonly kind: "process_error";
      readonly detail: string;
    }
  | {
      readonly kind: "lost_terminal";
      readonly detail: string;
    };

export interface TracedProcessRequest {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
  readonly archiveRoot: string;
  readonly label?: string;
  readonly parser?: TracedProcessParser;
  readonly executorProfile?: TracedProcessExecutorProfile;
  readonly terminalSessionKey?: string;
  readonly terminalPollMs?: number;
  readonly stdin?: string | null;
  readonly timeoutMs?: number;
  readonly terminationGraceMs?: number;
  readonly inactivityTimeoutMs?: number;
  readonly onProcessStarted?: (event: { readonly pid: number | null }) => void;
  readonly onStdoutChunk?: (
    chunk: string,
    event: { readonly byteLength: number }
  ) => void;
  readonly onStderrChunk?: (
    chunk: string,
    event: { readonly byteLength: number }
  ) => void;
  readonly onTimeout?: (event: {
    readonly timeoutMs: number | undefined;
    readonly elapsedSinceLastOutputMs: number;
  }) => void;
  readonly onInactivityTimeout?: (event: {
    readonly inactivityTimeoutMs: number | undefined;
    readonly elapsedSinceLastOutputMs: number;
  }) => void;
  readonly onSignalSent?: (event: { readonly signal: "SIGTERM" | "SIGKILL" }) => void;
  readonly onProcessError?: (event: { readonly error: string }) => void;
  readonly onProcessExited?: (event: {
    readonly status: number | null;
    readonly signal: string | null;
  }) => void;
}

export type AgentActorWorkerCalloutRequest = TracedProcessRequest &
  (
    | {
        readonly agentCalloutKind: "agent_actor";
        readonly actorRef: string;
        readonly workerRef?: string;
      }
    | {
        readonly agentCalloutKind: "agent_worker";
        readonly workerRef: string;
        readonly actorRef?: string;
      }
  );

export interface TracedProcessPaths {
  readonly meta: string;
  readonly command: string;
  readonly events: string;
  readonly stdout: string;
  readonly stderr: string;
  readonly finalOutput: string;
  readonly result: string;
  readonly terminalTranscript?: string;
}

export interface TracedProcessResult {
  readonly kind: "traced_process_result";
  readonly sessionId: string;
  readonly label: string;
  readonly executorProfile: TracedProcessExecutorProfile;
  readonly terminalSessionId: string | null;
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly parser: TracedProcessParser;
  readonly streamModel: TracedProcessStreamModel;
  // outcome is canonical. status/signal/error remain compatibility projections
  // for existing callers while downstream consumers migrate to outcome.kind.
  readonly outcome: TracedProcessOutcome;
  readonly pid: number | null;
  readonly status: number | null;
  readonly signal: string | null;
  readonly timedOut: boolean;
  readonly timeoutMs: number | null;
  readonly inactivityTimedOut: boolean;
  readonly inactivityTimeoutMs: number | null;
  readonly error: string | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly finalOutput: string;
  readonly structuredEventCount: number;
  readonly structuredParseFailureCount: number;
  readonly apiRetryEvents: readonly unknown[];
  readonly toolCallEvents: readonly unknown[];
  readonly paths: TracedProcessPaths;
}

interface TraceState {
  readonly sessionId: string;
  readonly label: string;
  readonly parser: TracedProcessParser;
  readonly executorProfile: TracedProcessExecutorProfile;
  readonly streamModel: TracedProcessStreamModel;
  readonly paths: TracedProcessPaths;
  stdout: string;
  stderr: string;
  readonly claude: ClaudeStreamJsonState;
}

interface TraceEvent {
  readonly kind: string;
  readonly eventId: string;
  readonly sessionId: string;
  readonly label: string;
  readonly createdAt: string;
  readonly payload?: unknown;
}

type ScreenTerminalCapability =
  | { readonly kind: "available" }
  | {
      readonly kind: "unavailable";
      readonly reason: TracedProcessExecutorUnavailableReason;
      readonly detail: string;
    };

let cachedScreenTerminalCapability: ScreenTerminalCapability | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function simpleId(): string {
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function commandLabel(command: string): string {
  const parts = command.split(/[\\/]/u);
  return parts.at(-1) ?? command;
}

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeEvent(state: TraceState, kind: string, payload?: unknown): void {
  const event: TraceEvent =
    payload === undefined
      ? {
          kind,
          eventId: simpleId(),
          sessionId: state.sessionId,
          label: state.label,
          createdAt: nowIso()
        }
      : {
          kind,
          eventId: simpleId(),
          sessionId: state.sessionId,
          label: state.label,
          createdAt: nowIso(),
          payload
        };
  appendFileSync(state.paths.events, `${JSON.stringify(event)}\n`, "utf8");
}

function buildPaths(archiveRoot: string): TracedProcessPaths {
  return Object.freeze({
    meta: join(archiveRoot, "meta.json"),
    command: join(archiveRoot, "command.json"),
    events: join(archiveRoot, "events.ndjson"),
    stdout: join(archiveRoot, "stdout.raw"),
    stderr: join(archiveRoot, "stderr.raw"),
    finalOutput: join(archiveRoot, "final_output.txt"),
    result: join(archiveRoot, "result.json"),
    terminalTranscript: join(archiveRoot, "terminal.transcript")
  });
}

function recordClaudeObservations(
  state: TraceState,
  observations: readonly ClaudeStreamJsonObservation[]
): void {
  for (const observation of observations) {
    if (observation.kind === "structured_event_observed") {
      writeEvent(state, observation.kind, observation.event);
      continue;
    }
    if (observation.kind === "api_retry_observed") {
      writeEvent(state, observation.kind, observation.event);
      continue;
    }
    if (observation.kind === "tool_call_observed") {
      writeEvent(state, observation.kind, observation.event);
      continue;
    }
    writeEvent(state, observation.kind, { line: observation.line });
  }
}

function consumeClaudeStdout(state: TraceState, chunk: string): void {
  recordClaudeObservations(state, observeClaudeStreamJsonChunk(state.claude, chunk));
}

function flushClaudeStdout(state: TraceState): void {
  recordClaudeObservations(state, flushClaudeStreamJson(state.claude));
}

function finalOutputFor(state: TraceState): string {
  if (state.parser === "claude-stream-json") {
    // Claude stream-json result.result is the canonical final text. Assistant
    // text chunks are only a fallback for older or degraded stream shapes.
    return finalOutputFromClaudeStreamJsonState(state.claude);
  }
  return state.stdout;
}

function numberOrNull(value: number | undefined): number | null {
  return value === undefined ? null : value;
}

function sleepSync(milliseconds: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function outcomeFromProcess(input: {
  readonly status: number | null;
  readonly signal: string | null;
  readonly timedOut: boolean;
  readonly timeoutMs: number | undefined;
  readonly inactivityTimedOut: boolean;
  readonly inactivityTimeoutMs: number | undefined;
  readonly error: string | null;
}): TracedProcessOutcome {
  if (input.timedOut) {
    return {
      kind: "hard_timeout",
      timeoutMs: numberOrNull(input.timeoutMs),
      signal: input.signal
    };
  }
  if (input.inactivityTimedOut) {
    return {
      kind: "inactivity_timeout",
      inactivityTimeoutMs: numberOrNull(input.inactivityTimeoutMs),
      signal: input.signal
    };
  }
  if (input.error !== null) {
    return { kind: "process_error", detail: input.error };
  }
  if (input.signal !== null) {
    return { kind: "signaled", status: input.status, signal: input.signal };
  }
  if (input.status !== null) {
    return { kind: "exited", status: input.status };
  }
  return {
    kind: "launch_failed",
    detail: "process ended without exit status, signal, timeout, or error"
  };
}

function screenTerminalCapability(
  probeRoot: string
): ScreenTerminalCapability {
  if (cachedScreenTerminalCapability !== null) {
    return cachedScreenTerminalCapability;
  }
  const out = spawnSync("screen", ["-ls"], { encoding: "utf8" });
  if (out.error !== undefined && out.error !== null) {
    cachedScreenTerminalCapability = {
      kind: "unavailable",
      reason: "screen_missing",
      detail: out.error.message
    };
    return cachedScreenTerminalCapability;
  }
  const probeDir = join(probeRoot, "terminal_capability_probe");
  const markerPath = join(probeDir, "marker.txt");
  const probeId = screenSafeSessionId(`abg-probe-${Date.now()}-${Math.random()}`);
  mkdirSync(probeDir, { recursive: true });
  try {
    const probe = spawnSync(
      "screen",
      [
        "-dmS",
        probeId,
        "/bin/sh",
        "-lc",
        'printf ok > "$1"',
        "abg-terminal-probe",
        markerPath
      ],
      { cwd: probeDir, encoding: "utf8" }
    );
    if (probe.status !== 0) {
      cachedScreenTerminalCapability = {
        kind: "unavailable",
        reason: "screen_shell_unavailable",
        detail: probe.stderr || probe.stdout || `screen probe exited ${String(probe.status)}`
      };
      return cachedScreenTerminalCapability;
    }
    for (let attempt = 0; attempt < 5; attempt += 1) {
      sleepSync(200);
      if (existsSync(markerPath) && readFileSync(markerPath, "utf8") === "ok") {
        cachedScreenTerminalCapability = { kind: "available" };
        return cachedScreenTerminalCapability;
      }
    }
    cachedScreenTerminalCapability = {
      kind: "unavailable",
      reason: "screen_shell_unavailable",
      detail: "screen started but /bin/sh did not write the capability probe marker"
    };
    return cachedScreenTerminalCapability;
  } finally {
    stopScreenSession(probeId);
    rmSync(probeDir, { recursive: true, force: true });
  }
}

function screenSessionLive(sessionId: string): boolean {
  const out = spawnSync("screen", ["-ls"], { encoding: "utf8" });
  const text = `${out.stdout ?? ""}${out.stderr ?? ""}`;
  const escaped = sessionId.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`\\d+\\.${escaped}\\s+\\((?:Attached|Detached)\\)`, "u").test(text);
}

function stopScreenSession(sessionId: string): void {
  spawnSync("screen", ["-S", sessionId, "-X", "quit"], { encoding: "utf8" });
}

function statusFromTerminalSentinel(
  text: string,
  sentinelPrefix: string
): number | null {
  const index = text.indexOf(sentinelPrefix);
  if (index < 0) {
    return null;
  }
  const rest = text.slice(index + sentinelPrefix.length);
  const match = rest.match(/^(\d+)/u);
  return match === null ? null : Number.parseInt(match[1] ?? "", 10);
}

function textBeforeTerminalSentinel(text: string, sentinelPrefix: string): string {
  const index = text.indexOf(sentinelPrefix);
  return index < 0 ? text : text.slice(0, index);
}

function shortStableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function screenSafeSessionId(value: string): string {
  const safe = value.replace(/[^A-Za-z0-9_.-]/gu, "_");
  if (safe.length <= 80) {
    return safe;
  }
  const digest = shortStableHash(value);
  return `${safe.slice(0, Math.max(1, 79 - digest.length))}-${digest}`;
}

export async function runTracedProcess(
  request: TracedProcessRequest
): Promise<TracedProcessResult> {
  const parser = request.parser ?? "generic-text";
  const label = request.label ?? commandLabel(request.command);
  const executorProfile = request.executorProfile ?? "local-spawn";
  const streamModel: TracedProcessStreamModel =
    executorProfile === "pty-terminal" ? "terminal-transcript" : "stdio";
  const sessionId = simpleId();
  const paths = buildPaths(request.archiveRoot);
  mkdirSync(request.archiveRoot, { recursive: true });

  const state: TraceState = {
    sessionId,
    label,
    parser,
    executorProfile,
    streamModel,
    paths,
    stdout: "",
    stderr: "",
    claude: createClaudeStreamJsonState()
  };

  writeJson(paths.meta, {
    sessionId,
    label,
    parser,
    executorProfile,
    streamModel,
    terminalSessionKey: request.terminalSessionKey ?? null,
    archiveRoot: request.archiveRoot,
    createdAt: nowIso()
  });
  writeJson(paths.command, {
    command: request.command,
    args: request.args,
    cwd: request.cwd,
    executorProfile,
    timeoutMs: numberOrNull(request.timeoutMs),
    terminationGraceMs: numberOrNull(request.terminationGraceMs),
    inactivityTimeoutMs: numberOrNull(request.inactivityTimeoutMs)
  });

  if (executorProfile === "pty-terminal") {
    return runPtyTerminalExecutor(request, state);
  }

  writeEvent(state, "process_starting", {
    command: request.command,
    args: request.args,
    cwd: request.cwd
  });

  return new Promise<TracedProcessResult>((resolve) => {
    const child = spawn(request.command, [...request.args], {
      cwd: request.cwd,
      env: { ...request.env },
      stdio: ["pipe", "pipe", "pipe"]
    });
    const pid = child.pid ?? null;
    if (request.stdin !== null && request.stdin !== undefined) {
      child.stdin.write(request.stdin);
    }
    child.stdin.end();
    let timedOut = false;
    let inactivityTimedOut = false;
    let settled = false;
    let lastOutputAt = Date.now();
    let killTimer: ReturnType<typeof setTimeout> | null = null;
    const inactivityTimeoutMs = request.inactivityTimeoutMs;
    const inactivityPollMs =
      inactivityTimeoutMs === undefined
        ? null
        : Math.min(Math.max(Math.floor(inactivityTimeoutMs / 3), 1000), 30_000);

    const sendTermination = (reason: "timeout" | "inactivity_timeout"): void => {
      child.kill("SIGTERM");
      writeEvent(state, "process_signal_sent", { signal: "SIGTERM", reason });
      request.onSignalSent?.({ signal: "SIGTERM" });
      const terminationGraceMs = request.terminationGraceMs;
      if (terminationGraceMs === undefined || terminationGraceMs <= 0) {
        return;
      }
      killTimer = setTimeout(() => {
        if (settled) {
          return;
        }
        child.kill("SIGKILL");
        writeEvent(state, "process_signal_sent", { signal: "SIGKILL", reason });
        request.onSignalSent?.({ signal: "SIGKILL" });
      }, terminationGraceMs);
    };

    const timeoutTimer =
      request.timeoutMs === undefined
        ? null
        : setTimeout(() => {
            if (settled) {
              return;
	            }
            timedOut = true;
            // hard_timeout is canonical; timeout_escalated remains for legacy traces.
            writeEvent(state, "hard_timeout", {
              timeoutMs: request.timeoutMs,
              elapsedSinceLastOutputMs: Date.now() - lastOutputAt
            });
            writeEvent(state, "timeout_escalated", {
              timeoutMs: request.timeoutMs,
              elapsedSinceLastOutputMs: Date.now() - lastOutputAt
            });
            request.onTimeout?.({
              timeoutMs: request.timeoutMs,
              elapsedSinceLastOutputMs: Date.now() - lastOutputAt
            });
            sendTermination("timeout");
          }, request.timeoutMs);

    const inactivityTimer =
      inactivityTimeoutMs === undefined || inactivityPollMs === null
        ? null
        : setInterval(() => {
            if (settled) {
              return;
            }
	            const elapsed = Date.now() - lastOutputAt;
	            if (elapsed >= inactivityTimeoutMs) {
              inactivityTimedOut = true;
              // idle is canonical; inactivity_timeout_escalated remains for legacy traces.
              writeEvent(state, "idle", {
                inactivityTimeoutMs,
                elapsedSinceLastOutputMs: elapsed
              });
              writeEvent(state, "inactivity_timeout_escalated", {
                inactivityTimeoutMs,
                elapsedSinceLastOutputMs: elapsed
              });
              request.onInactivityTimeout?.({
                inactivityTimeoutMs,
                elapsedSinceLastOutputMs: elapsed
              });
              sendTermination("inactivity_timeout");
            }
          }, inactivityPollMs);

    const cleanupTimers = (): void => {
      if (timeoutTimer !== null) {
        clearTimeout(timeoutTimer);
      }
      if (inactivityTimer !== null) {
        clearInterval(inactivityTimer);
      }
      if (killTimer !== null) {
        clearTimeout(killTimer);
      }
    };

    const finish = (
      status: number | null,
      signal: string | null,
      error: string | null
    ): void => {
      if (settled) {
        return;
      }
      settled = true;
      cleanupTimers();
      if (parser === "claude-stream-json") {
        flushClaudeStdout(state);
      }
      const finalOutput = finalOutputFor(state);
      const outcome = outcomeFromProcess({
        status,
        signal,
        timedOut,
        timeoutMs: request.timeoutMs,
        inactivityTimedOut,
        inactivityTimeoutMs: request.inactivityTimeoutMs,
        error
      });
      writeFileSync(paths.finalOutput, finalOutput, "utf8");
      const result: TracedProcessResult = {
        kind: "traced_process_result",
        sessionId,
        label,
        executorProfile,
        terminalSessionId: null,
        streamModel: state.streamModel,
        outcome,
        command: request.command,
        args: request.args,
        cwd: request.cwd,
        parser,
        pid,
        status,
        signal,
        timedOut,
        timeoutMs: numberOrNull(request.timeoutMs),
        inactivityTimedOut,
        inactivityTimeoutMs: numberOrNull(request.inactivityTimeoutMs),
        error,
        stdout: state.stdout,
        stderr: state.stderr,
        finalOutput,
        structuredEventCount: state.claude.structuredEventCount,
        structuredParseFailureCount: state.claude.structuredParseFailureCount,
        apiRetryEvents: state.claude.apiRetryEvents,
        toolCallEvents: state.claude.toolCallEvents,
        paths
      };
      writeJson(paths.result, result);
      resolve(result);
    };

    const stdout = child.stdout;
    const stderr = child.stderr;

    stdout.on("data", (chunk: string) => {
      const text = chunk;
      lastOutputAt = Date.now();
      state.stdout += text;
      appendFileSync(paths.stdout, text, "utf8");
      writeEvent(state, "stdout_chunk", {
        byteLength: text.length
      });
      request.onStdoutChunk?.(text, {
        byteLength: text.length
      });
      if (parser === "claude-stream-json") {
        consumeClaudeStdout(state, text);
      }
    });

    stderr.on("data", (chunk: string) => {
      const text = chunk;
      lastOutputAt = Date.now();
      state.stderr += text;
      appendFileSync(paths.stderr, text, "utf8");
      writeEvent(state, "stderr_chunk", {
        byteLength: text.length
      });
      request.onStderrChunk?.(text, {
        byteLength: text.length
      });
    });

    writeEvent(state, "process_started", { pid });
    request.onProcessStarted?.({ pid });

    child.once("error", (error: Error) => {
      const errorText = error.stack ?? String(error);
      writeEvent(state, "process_error", { error: errorText });
      request.onProcessError?.({ error: errorText });
      finish(null, null, errorText);
    });

    child.once("close", (status: number | null, signal: string | null) => {
      writeEvent(state, "process_exited", { status, signal });
      request.onProcessExited?.({ status, signal });
      finish(status, signal, null);
    });
  });
}

async function runPtyTerminalExecutor(
  request: TracedProcessRequest,
  state: TraceState
): Promise<TracedProcessResult> {
  const parser = state.parser;
  const paths = state.paths;
  const terminalSessionId = screenSafeSessionId(
    request.terminalSessionKey ?? `abg-${state.sessionId}`
  );
  const terminalDir = join(request.archiveRoot, "terminal_session");
  const screenLogPath = join(terminalDir, "screenlog.0");
  const sentinelPrefix = `__ABG_PTY_EXIT_${terminalSessionId}:`;
  mkdirSync(terminalDir, { recursive: true });
  writeFileSync(screenLogPath, "", "utf8");
  if (paths.terminalTranscript !== undefined) {
    writeFileSync(paths.terminalTranscript, "", "utf8");
  }

  const capability = screenTerminalCapability(request.archiveRoot);
  if (capability.kind === "unavailable") {
    const error = `pty-terminal executor unavailable: ${capability.detail}`;
    const outcome: TracedProcessOutcome = {
      kind: "executor_unavailable",
      reason: capability.reason,
      detail: capability.detail
    };
    writeEvent(state, "terminal_session_unhealthy", {
      terminalSessionId,
      reason: capability.reason,
      error
    });
    writeFileSync(paths.finalOutput, "", "utf8");
    const result: TracedProcessResult = {
      kind: "traced_process_result",
      sessionId: state.sessionId,
      label: state.label,
      executorProfile: state.executorProfile,
      terminalSessionId,
      streamModel: state.streamModel,
      outcome,
      command: request.command,
      args: request.args,
      cwd: request.cwd,
      parser,
      pid: null,
      status: null,
      signal: null,
      timedOut: false,
      timeoutMs: numberOrNull(request.timeoutMs),
      inactivityTimedOut: false,
      inactivityTimeoutMs: numberOrNull(request.inactivityTimeoutMs),
      error,
      stdout: "",
      stderr: "",
      finalOutput: "",
      structuredEventCount: 0,
      structuredParseFailureCount: 0,
      apiRetryEvents: [],
      toolCallEvents: [],
      paths
    };
    writeJson(paths.result, result);
    return result;
  }

  writeEvent(state, "terminal_session_starting", {
    terminalSessionId,
    command: request.command,
    args: request.args,
    cwd: request.cwd
  });
  writeEvent(state, "terminal_turn_started", {
    terminalSessionId,
    turnIndex: 0
  });

  const env = {
    ...request.env,
    TERM: request.env["TERM"] ?? "xterm-256color",
    ABG_PTY_SESSION_ID: terminalSessionId
  };
  const shellProgram = [
    'cd "$1" || exit 1',
    "shift",
    '"$@"',
    "code=$?",
    `printf '\\n${sentinelPrefix}%s\\n' "$code"`
  ].join("; ");
  const screenArgs = [
    "-L",
    "-dmS",
    terminalSessionId,
    "/bin/sh",
    "-lc",
    shellProgram,
    "abg-pty-terminal",
    request.cwd,
    request.command,
    ...request.args
  ];
  const spawned = spawnSync("screen", screenArgs, {
    cwd: terminalDir,
    env,
    encoding: "utf8"
  });
  if (spawned.status !== 0) {
    const error = `screen spawn failed: ${spawned.stderr || spawned.stdout || `exit ${spawned.status}`}`;
    const outcome: TracedProcessOutcome = { kind: "launch_failed", detail: error };
    writeEvent(state, "terminal_session_unhealthy", { terminalSessionId, error });
    writeFileSync(paths.finalOutput, "", "utf8");
    const result: TracedProcessResult = {
      kind: "traced_process_result",
      sessionId: state.sessionId,
      label: state.label,
      executorProfile: state.executorProfile,
      terminalSessionId,
      streamModel: state.streamModel,
      outcome,
      command: request.command,
      args: request.args,
      cwd: request.cwd,
      parser,
      pid: null,
      status: null,
      signal: null,
      timedOut: false,
      timeoutMs: numberOrNull(request.timeoutMs),
      inactivityTimedOut: false,
      inactivityTimeoutMs: numberOrNull(request.inactivityTimeoutMs),
      error,
      stdout: "",
      stderr: "",
      finalOutput: "",
      structuredEventCount: 0,
      structuredParseFailureCount: 0,
      apiRetryEvents: [],
      toolCallEvents: [],
      paths
    };
    writeJson(paths.result, result);
    return result;
  }

  writeEvent(state, "terminal_session_started", {
    terminalSessionId,
    transcriptPath: paths.terminalTranscript ?? screenLogPath
  });
  writeEvent(state, "process_started", { pid: null, terminalSessionId });
  request.onProcessStarted?.({ pid: null });

  if (request.stdin !== null && request.stdin !== undefined) {
    const sent = spawnSync("screen", ["-S", terminalSessionId, "-X", "stuff", request.stdin], {
      encoding: "utf8"
    });
    writeEvent(state, "terminal_input_written", {
      terminalSessionId,
      byteLength: request.stdin.length,
      status: sent.status
    });
  }

  return new Promise<TracedProcessResult>((resolve) => {
    const startedAt = Date.now();
    let lastOutputAt = startedAt;
    let lastAgentTextLength = 0;
    let lastTranscriptLength = 0;
    let timedOut = false;
    let inactivityTimedOut = false;
    let settled = false;
    let finalStatus: number | null = null;
    let terminalExitObservedAt: number | null = null;

    const finish = (
      status: number | null,
      signal: string | null,
      error: string | null,
      explicitOutcome?: TracedProcessOutcome
    ): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearInterval(pollTimer);
      if (parser === "claude-stream-json") {
        flushClaudeStdout(state);
      }
      const finalOutput = finalOutputFor(state);
      const outcome = explicitOutcome ?? outcomeFromProcess({
        status,
        signal,
        timedOut,
        timeoutMs: request.timeoutMs,
        inactivityTimedOut,
        inactivityTimeoutMs: request.inactivityTimeoutMs,
        error
      });
      writeFileSync(paths.finalOutput, finalOutput, "utf8");
      writeEvent(state, "terminal_turn_completed", {
        terminalSessionId,
        turnIndex: 0,
        status,
        signal
      });
      writeEvent(state, "terminal_session_closed", {
        terminalSessionId,
        status,
        signal,
        outcome
      });
      writeEvent(state, "process_exited", { status, signal, terminalSessionId });
      request.onProcessExited?.({ status, signal });
      const result: TracedProcessResult = {
        kind: "traced_process_result",
        sessionId: state.sessionId,
        label: state.label,
        executorProfile: state.executorProfile,
        terminalSessionId,
        streamModel: state.streamModel,
        outcome,
        command: request.command,
        args: request.args,
        cwd: request.cwd,
        parser,
        pid: null,
        status,
        signal,
        timedOut,
        timeoutMs: numberOrNull(request.timeoutMs),
        inactivityTimedOut,
        inactivityTimeoutMs: numberOrNull(request.inactivityTimeoutMs),
        error,
        stdout: state.stdout,
        stderr: state.stderr,
        finalOutput,
        structuredEventCount: state.claude.structuredEventCount,
        structuredParseFailureCount: state.claude.structuredParseFailureCount,
        apiRetryEvents: state.claude.apiRetryEvents,
        toolCallEvents: state.claude.toolCallEvents,
        paths
      };
      writeJson(paths.result, result);
      resolve(result);
    };

    const observeTranscript = (): void => {
      if (!existsSync(screenLogPath)) {
        return;
      }
      const transcript = readFileSync(screenLogPath, "utf8");
      if (paths.terminalTranscript !== undefined && transcript.length !== lastTranscriptLength) {
        writeFileSync(paths.terminalTranscript, transcript, "utf8");
        lastTranscriptLength = transcript.length;
      }
      const sentinelStatus = statusFromTerminalSentinel(transcript, sentinelPrefix);
      const agentText = textBeforeTerminalSentinel(transcript, sentinelPrefix);
      if (agentText.length > lastAgentTextLength) {
        const chunk = agentText.slice(lastAgentTextLength);
        lastAgentTextLength = agentText.length;
        lastOutputAt = Date.now();
        state.stdout += chunk;
        appendFileSync(paths.stdout, chunk, "utf8");
        writeEvent(state, "stdout_chunk", { byteLength: chunk.length, terminalSessionId });
        request.onStdoutChunk?.(chunk, { byteLength: chunk.length });
        if (parser === "claude-stream-json") {
          consumeClaudeStdout(state, chunk);
        }
      }
      if (sentinelStatus !== null && finalStatus === null) {
        finalStatus = sentinelStatus;
        writeEvent(state, "terminal_exit_sentinel_observed", {
          terminalSessionId,
          status: sentinelStatus
        });
      }
    };

    const pollTimer = setInterval(() => {
      observeTranscript();
      const now = Date.now();
      if (finalStatus !== null) {
        finish(finalStatus, null, null);
        return;
      }
      if (!screenSessionLive(terminalSessionId)) {
        terminalExitObservedAt = terminalExitObservedAt ?? now;
        if (now - terminalExitObservedAt >= 500) {
          observeTranscript();
          if (finalStatus === null) {
            const error =
              "pty-terminal session ended before completion sentinel was observed";
            writeEvent(state, "terminal_session_unhealthy", {
              terminalSessionId,
              reason: "lost_terminal",
              error
            });
            finish(null, null, error, { kind: "lost_terminal", detail: error });
          } else {
            finish(finalStatus, null, null);
          }
        }
        return;
      }
      if (request.timeoutMs !== undefined && now - startedAt >= request.timeoutMs) {
        timedOut = true;
        // hard_timeout is canonical; timeout_escalated remains for legacy traces.
        writeEvent(state, "hard_timeout", {
          timeoutMs: request.timeoutMs,
          elapsedSinceLastOutputMs: now - lastOutputAt,
          terminalSessionId
        });
        writeEvent(state, "timeout_escalated", {
          timeoutMs: request.timeoutMs,
          elapsedSinceLastOutputMs: now - lastOutputAt,
          terminalSessionId
        });
        request.onTimeout?.({
          timeoutMs: request.timeoutMs,
          elapsedSinceLastOutputMs: now - lastOutputAt
        });
        stopScreenSession(terminalSessionId);
        request.onSignalSent?.({ signal: "SIGTERM" });
        finish(null, "SIGTERM", null, {
          kind: "hard_timeout",
          timeoutMs: numberOrNull(request.timeoutMs),
          signal: "SIGTERM"
        });
        return;
      }
      if (
        request.inactivityTimeoutMs !== undefined &&
        now - lastOutputAt >= request.inactivityTimeoutMs
      ) {
        inactivityTimedOut = true;
        // idle is canonical; inactivity_timeout_escalated remains for legacy traces.
        writeEvent(state, "idle", {
          inactivityTimeoutMs: request.inactivityTimeoutMs,
          elapsedSinceLastOutputMs: now - lastOutputAt,
          terminalSessionId
        });
        writeEvent(state, "inactivity_timeout_escalated", {
          inactivityTimeoutMs: request.inactivityTimeoutMs,
          elapsedSinceLastOutputMs: now - lastOutputAt,
          terminalSessionId
        });
        request.onInactivityTimeout?.({
          inactivityTimeoutMs: request.inactivityTimeoutMs,
          elapsedSinceLastOutputMs: now - lastOutputAt
        });
        stopScreenSession(terminalSessionId);
        request.onSignalSent?.({ signal: "SIGTERM" });
        finish(null, "SIGTERM", null, {
          kind: "inactivity_timeout",
          inactivityTimeoutMs: numberOrNull(request.inactivityTimeoutMs),
          signal: "SIGTERM"
        });
      }
    }, request.terminalPollMs ?? 100);
  });
}

export async function runAgentActorWorkerCallout(
  request: AgentActorWorkerCalloutRequest
): Promise<TracedProcessResult> {
  return runTracedProcess(request);
}
