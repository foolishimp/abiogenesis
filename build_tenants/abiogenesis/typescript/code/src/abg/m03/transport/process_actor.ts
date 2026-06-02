import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { performance } from "node:perf_hooks";
import {
  runAgentActorWorkerCallout,
  type TracedProcessExecutorProfile,
  type TracedProcessParser,
  type TracedProcessResult
} from "../../../shared/traced_process/index.js";
import type {
  ActorInvocation,
  RuntimeActivityProbeSource,
  RuntimeActivityProbeObservedEvent,
  RuntimeExternalInterruptionSource,
  RuntimeEvent
} from "../contracts/carriers.js";
import {
  constructActorProcessExitedEvent,
  constructActorProcessHeartbeatEvent,
  constructActorProcessSignalSentEvent,
  constructActorProcessStartFailedEvent,
  constructActorProcessStartedEvent,
  constructActorProcessStreamObservedEvent,
  constructActorProcessTimeoutEvent,
  constructRuntimeActivityProbeObservedEvent,
  constructRuntimeExternalInterruptionObservedEvent
} from "../contracts/event_factories.js";
import {
  constructRuntimeSystemProbeContract,
  type RuntimeSystemProbeContract
} from "../contracts/runtime_liveness.js";
import { emit, type RuntimeEventSink } from "../events/index.js";

export interface SupervisedProcessEnvironmentPolicy {
  readonly prefixes: readonly string[];
}

export interface SupervisedProcessActorRequest {
  readonly invocation: ActorInvocation;
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly environmentPolicy?: SupervisedProcessEnvironmentPolicy | undefined;
  readonly stdin?: string | null | undefined;
  readonly stdoutPath: string;
  readonly stderrPath: string;
  readonly stdoutRef: string;
  readonly stderrRef: string;
  readonly processStartedPath?: string | undefined;
  readonly processEventsPath?: string | undefined;
  readonly parser?: TracedProcessParser | undefined;
  readonly executorProfile?: TracedProcessExecutorProfile | undefined;
  readonly terminalSessionKey?: string | undefined;
  readonly terminalScreenCommand?: string | undefined;
  readonly terminalPollMs?: number | undefined;
  readonly timeoutMs?: number | undefined;
  readonly inactivityTimeoutMs?: number | undefined;
  readonly terminationGraceMs?: number | undefined;
  readonly heartbeatMs?: number | undefined;
  readonly eventSink?: RuntimeEventSink | undefined;
}

export interface SupervisedProcessActorResult {
  readonly kind: "supervised_process_actor_result";
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly pid: number | null;
  readonly status: number | null;
  readonly signal: string | null;
  readonly outcome: TracedProcessResult["outcome"];
  readonly elapsedMs: number;
  readonly timedOut: boolean;
  readonly stdoutPath: string;
  readonly stderrPath: string;
  readonly error: string | null;
  readonly events: readonly RuntimeEvent[];
  readonly probeContracts: readonly RuntimeSystemProbeContract[];
}

const DEFAULT_TIMEOUT_MS = 1000 * 60 * 30;
const DEFAULT_TERMINATION_GRACE_MS = 1000 * 10;
const DEFAULT_HEARTBEAT_MS = 1000 * 30;
const PROCESS_ACTOR_SYSTEM_REF = "runtime-system:abg:process_actor";

function inferredParserForActorRequest(
  request: SupervisedProcessActorRequest
): TracedProcessParser {
  if (request.parser !== undefined) {
    return request.parser;
  }
  const command = request.command.toLowerCase();
  const args = request.args.map((arg) => arg.toLowerCase());
  if (
    command.split(/[\\/]/u).at(-1)?.includes("claude") === true &&
    args.includes("stream-json")
  ) {
    return "claude-stream-json";
  }
  return "generic-text";
}

function executorProfileFor(
  request: SupervisedProcessActorRequest
): TracedProcessExecutorProfile | undefined {
  return request.executorProfile;
}

function roundElapsedMs(startedAt: number): number {
  return Math.max(0, Math.round(performance.now() - startedAt));
}

function sanitizedEnvironment(input: {
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly policy: SupervisedProcessEnvironmentPolicy | undefined;
}): Readonly<Record<string, string>> {
  const prefixes = input.policy?.prefixes ?? Object.freeze([]);
  const sanitized: Record<string, string> = {};
  outer: for (const [key, value] of Object.entries(input.environment)) {
    if (value === undefined) {
      continue;
    }
    for (const prefix of prefixes) {
      if (prefix.length > 0 && key.startsWith(prefix)) {
        continue outer;
      }
    }
    sanitized[key] = value;
  }
  return Object.freeze(sanitized);
}

function appendJsonLine(path: string | undefined, payload: RuntimeEvent): void {
  if (path === undefined) {
    return;
  }
  appendFileSync(path, `${JSON.stringify(payload)}\n`, "utf8");
}

function writeJson(path: string | undefined, payload: unknown): void {
  if (path === undefined) {
    return;
  }
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function normalizeExitStatus(status: number | null): number | null {
  if (status === null) {
    return null;
  }
  if (status < 0) {
    return null;
  }
  return status;
}

function streamProbeSource(input: {
  readonly executorProfile: TracedProcessExecutorProfile | undefined;
  readonly streamName: "stdout" | "stderr";
}): RuntimeActivityProbeSource {
  if (input.executorProfile === "pty-terminal") {
    return "pty_transcript";
  }
  return input.streamName === "stdout"
    ? "local_spawn_stdout"
    : "local_spawn_stderr";
}

function runtimeActivityProbe(input: {
  readonly invocation: ActorInvocation;
  readonly probeSource: RuntimeActivityProbeSource;
  readonly activityRef: string;
  readonly elapsedMs: number;
  readonly evidenceRefs: readonly string[];
  readonly detail: string | null;
}): RuntimeActivityProbeObservedEvent {
  return constructRuntimeActivityProbeObservedEvent({
    basisId: input.invocation.basisId,
    graphFunctionId: input.invocation.graphFunctionId,
    runId: input.invocation.runId,
    workKey: input.invocation.workKey,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
    workerId: input.invocation.workerId,
    backendId: input.invocation.backendId,
    systemRef: PROCESS_ACTOR_SYSTEM_REF,
    probeRef: `runtime-probe:abg:process_actor:${input.probeSource}`,
    probeSource: input.probeSource,
    activityRef: input.activityRef,
    elapsedMs: input.elapsedMs,
    observedAtMs: input.elapsedMs,
    evidenceRefs: input.evidenceRefs,
    detail: input.detail,
    causationEventRefs: input.invocation.causationEventRefs,
    correlationId: input.invocation.correlationId
  });
}

function runtimeExternalInterruption(input: {
  readonly invocation: ActorInvocation;
  readonly interruptionSource: RuntimeExternalInterruptionSource;
  readonly interruptionRef: string;
  readonly signal: string | null;
  readonly elapsedMs: number;
  readonly evidenceRefs: readonly string[];
  readonly detail: string | null;
}): RuntimeEvent {
  return constructRuntimeExternalInterruptionObservedEvent({
    basisId: input.invocation.basisId,
    graphFunctionId: input.invocation.graphFunctionId,
    runId: input.invocation.runId,
    workKey: input.invocation.workKey,
    graphCallId: input.invocation.graphCallId,
    frameId: input.invocation.frameId,
    vectorIndex: input.invocation.vectorIndex,
    edge: input.invocation.edge,
    actorInvocationId: input.invocation.actorInvocationId,
    workerId: input.invocation.workerId,
    backendId: input.invocation.backendId,
    systemRef: PROCESS_ACTOR_SYSTEM_REF,
    interruptionRef: input.interruptionRef,
    interruptionSource: input.interruptionSource,
    signal: input.signal,
    elapsedMs: input.elapsedMs,
    observedAtMs: input.elapsedMs,
    evidenceRefs: input.evidenceRefs,
    detail: input.detail,
    causationEventRefs: input.invocation.causationEventRefs,
    correlationId: input.invocation.correlationId
  });
}

export async function invokeSupervisedProcessActor(
  request: SupervisedProcessActorRequest
): Promise<SupervisedProcessActorResult> {
  mkdirSync(dirname(request.stdoutPath), { recursive: true });
  mkdirSync(dirname(request.stderrPath), { recursive: true });
  writeFileSync(request.stdoutPath, "", "utf8");
  writeFileSync(request.stderrPath, "", "utf8");
  if (request.processEventsPath !== undefined) {
    mkdirSync(dirname(request.processEventsPath), { recursive: true });
    writeFileSync(request.processEventsPath, "", "utf8");
  }

  const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const inactivityTimeoutMs = request.inactivityTimeoutMs;
  const terminationGraceMs =
    request.terminationGraceMs ?? DEFAULT_TERMINATION_GRACE_MS;
  const heartbeatMs = request.heartbeatMs ?? DEFAULT_HEARTBEAT_MS;
  const startedAt = performance.now();
  const events: RuntimeEvent[] = [];
  const probeContractsByRef = new Map<string, RuntimeSystemProbeContract>();
  const eventSink: RuntimeEventSink = (event) => {
    if (event.kind === "runtime_activity_probe_observed") {
      probeContractsByRef.set(
        event.probeRef,
        constructRuntimeSystemProbeContract({
          probeRef: event.probeRef,
          systemRef: event.systemRef,
          source: event.probeSource,
          basisId: event.basisId,
          graphFunctionId: event.graphFunctionId,
          graphCallId: event.graphCallId,
          frameId: event.frameId,
          vectorIndex: event.vectorIndex,
          edge: event.edge,
          actorInvocationId: event.actorInvocationId,
          evidenceRefs: event.evidenceRefs
        })
      );
    }
    appendJsonLine(request.processEventsPath, event);
    events.push(event);
    request.eventSink?.(event);
  };
  const traceRoot = request.processEventsPath === undefined
    ? `${request.stdoutPath}.trace`
    : `${request.processEventsPath}.trace`;
  let pid: number | null = null;
  let timedOut = false;
  let inactivityTimedOut = false;
  let errorMessage: string | null = null;
  let stdoutChunkIndex = 0;
  let stderrChunkIndex = 0;
  let heartbeatIndex = 0;
  let closed = false;
  let processStartObserved = false;
  const executorProfile = executorProfileFor(request);

  const heartbeatTimer =
    heartbeatMs > 0
      ? setInterval(() => {
          if (closed) {
            return;
          }
          const elapsedMs = roundElapsedMs(startedAt);
          const heartbeatEvent = constructActorProcessHeartbeatEvent({
            invocation: request.invocation,
            heartbeatIndex,
            elapsedMs
          });
          emit(
            [
              heartbeatEvent,
              runtimeActivityProbe({
                invocation: request.invocation,
                probeSource: "actor_process_heartbeat",
                activityRef:
                  `actor-process-heartbeat:${request.invocation.actorInvocationId}:${heartbeatIndex}`,
                elapsedMs,
                evidenceRefs: [
                  `event:${heartbeatEvent.kind}:${request.invocation.actorInvocationId}:${heartbeatIndex}`
                ],
                detail: "supervised actor heartbeat"
              })
            ],
            eventSink
          );
          heartbeatIndex += 1;
        }, heartbeatMs)
      : null;

  let traced: TracedProcessResult;
  try {
    traced = await runAgentActorWorkerCallout({
      agentCalloutKind: "agent_actor",
      actorRef: request.invocation.actorInvocationId,
      workerRef: request.invocation.workerId,
      command: request.command,
      args: request.args,
      cwd: request.cwd,
      env: sanitizedEnvironment({
        environment: request.environment,
        policy: request.environmentPolicy
      }),
      archiveRoot: traceRoot,
      label: request.invocation.actorInvocationId,
      parser: inferredParserForActorRequest(request),
      ...(executorProfile === undefined
        ? {}
        : { executorProfile }),
      ...(request.terminalSessionKey === undefined
        ? {}
        : { terminalSessionKey: request.terminalSessionKey }),
      ...(request.terminalScreenCommand === undefined
        ? {}
        : { terminalScreenCommand: request.terminalScreenCommand }),
      ...(request.terminalPollMs === undefined
        ? {}
        : { terminalPollMs: request.terminalPollMs }),
      stdin: request.stdin ?? null,
      timeoutMs,
      ...(inactivityTimeoutMs === undefined ? {} : { inactivityTimeoutMs }),
      terminationGraceMs,
      onProcessStarted: (event) => {
        processStartObserved = true;
        pid = event.pid;
        const elapsedMs = roundElapsedMs(startedAt);
        const startedEvent = constructActorProcessStartedEvent({
          invocation: request.invocation,
          command: request.command,
          args: request.args,
          cwd: request.cwd,
          pid,
          terminalSessionId: event.terminalSessionId,
          timeoutMs,
          stdoutRef: request.stdoutRef,
          stderrRef: request.stderrRef
        });
        writeJson(request.processStartedPath, startedEvent);
        emit(
          [
            startedEvent,
            runtimeActivityProbe({
              invocation: request.invocation,
              probeSource: "actor_process_lifecycle",
              activityRef:
                `actor-process-started:${request.invocation.actorInvocationId}`,
              elapsedMs,
              evidenceRefs: [request.stdoutRef, request.stderrRef],
              detail: "supervised actor process started"
            })
          ],
          eventSink
        );
      },
      onStdoutChunk: (chunk, event) => {
        appendFileSync(request.stdoutPath, chunk, "utf8");
        const elapsedMs = roundElapsedMs(startedAt);
        const streamEvent = constructActorProcessStreamObservedEvent({
          invocation: request.invocation,
          streamName: "stdout",
          streamRef: request.stdoutRef,
          chunkIndex: stdoutChunkIndex,
          byteLength: event.byteLength
        });
        emit(
          [
            streamEvent,
            runtimeActivityProbe({
              invocation: request.invocation,
              probeSource: streamProbeSource({
                executorProfile,
                streamName: "stdout"
              }),
              activityRef:
                `actor-process-stream:${request.invocation.actorInvocationId}:stdout:${stdoutChunkIndex}`,
              elapsedMs,
              evidenceRefs: [request.stdoutRef],
              detail: `stdout chunk bytes=${event.byteLength}`
            })
          ],
          eventSink
        );
        stdoutChunkIndex += 1;
      },
      onStderrChunk: (chunk, event) => {
        appendFileSync(request.stderrPath, chunk, "utf8");
        const elapsedMs = roundElapsedMs(startedAt);
        const streamEvent = constructActorProcessStreamObservedEvent({
          invocation: request.invocation,
          streamName: "stderr",
          streamRef: request.stderrRef,
          chunkIndex: stderrChunkIndex,
          byteLength: event.byteLength
        });
        emit(
          [
            streamEvent,
            runtimeActivityProbe({
              invocation: request.invocation,
              probeSource: streamProbeSource({
                executorProfile,
                streamName: "stderr"
              }),
              activityRef:
                `actor-process-stream:${request.invocation.actorInvocationId}:stderr:${stderrChunkIndex}`,
              elapsedMs,
              evidenceRefs: [request.stderrRef],
              detail: `stderr chunk bytes=${event.byteLength}`
            })
          ],
          eventSink
        );
        stderrChunkIndex += 1;
      },
      onTimeout: () => {
        timedOut = true;
        const elapsedMs = roundElapsedMs(startedAt);
        const timeoutEvent = constructActorProcessTimeoutEvent({
          invocation: request.invocation,
          timeoutMs,
          elapsedMs
        });
        emit(
          [
            timeoutEvent,
            runtimeExternalInterruption({
              invocation: request.invocation,
              interruptionSource: "harness_safety_cap",
              interruptionRef:
                `runtime-interruption:${request.invocation.actorInvocationId}:timeout:${elapsedMs}`,
              signal: null,
              elapsedMs,
              evidenceRefs: [
                `event:${timeoutEvent.kind}:${request.invocation.actorInvocationId}:${elapsedMs}`
              ],
              detail: `timeoutMs=${timeoutMs}`
            })
          ],
          eventSink
        );
      },
      onInactivityTimeout: (event) => {
        inactivityTimedOut = true;
        const elapsedMs = roundElapsedMs(startedAt);
        emit(
          runtimeExternalInterruption({
            invocation: request.invocation,
            interruptionSource: "harness_safety_cap",
            interruptionRef:
              `runtime-interruption:${request.invocation.actorInvocationId}:inactivity:${elapsedMs}`,
            signal: null,
            elapsedMs,
            evidenceRefs: [
              `inactivity:${request.invocation.actorInvocationId}:${event.inactivityTimeoutMs ?? "unknown"}`
            ],
            detail:
              `inactivityTimeoutMs=${event.inactivityTimeoutMs ?? "unknown"}; elapsedSinceLastOutputMs=${event.elapsedSinceLastOutputMs}`
          }),
          eventSink
        );
      },
      onSignalSent: (event) => {
        const elapsedMs = roundElapsedMs(startedAt);
        const signalEvent = constructActorProcessSignalSentEvent({
          invocation: request.invocation,
          signal: event.signal,
          elapsedMs
        });
        emit(
          [
            signalEvent,
            runtimeExternalInterruption({
              invocation: request.invocation,
              interruptionSource:
                timedOut || inactivityTimedOut ? "harness_safety_cap" : "host_signal",
              interruptionRef:
                `runtime-interruption:${request.invocation.actorInvocationId}:signal:${event.signal}:${elapsedMs}`,
              signal: event.signal,
              elapsedMs,
              evidenceRefs: [
                `event:${signalEvent.kind}:${request.invocation.actorInvocationId}:${event.signal}:${elapsedMs}`
              ],
              detail: timedOut
                ? "supervisor signal after timeout"
                : inactivityTimedOut
                  ? "supervisor signal after inactivity timeout"
                  : "supervisor signal"
            })
          ],
          eventSink
        );
      },
      onProcessError: (event) => {
        errorMessage = event.error;
      }
    });
  } finally {
    closed = true;
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
    }
  }
  const elapsedMs = roundElapsedMs(startedAt);
  const normalizedStatus = normalizeExitStatus(traced.status);
  const finalError = errorMessage ?? traced.error;
  if (!processStartObserved) {
    const startFailure =
      traced.outcome.kind === "executor_unavailable" ||
      traced.outcome.kind === "launch_failed" ||
      traced.outcome.kind === "process_error"
        ? traced.outcome
        : null;
    if (startFailure !== null) {
      emit(
        constructActorProcessStartFailedEvent({
          invocation: request.invocation,
          command: request.command,
          args: request.args,
          cwd: request.cwd,
          timeoutMs,
          stdoutRef: request.stdoutRef,
          stderrRef: request.stderrRef,
          terminalSessionId: traced.terminalSessionId,
          failureKind: startFailure.kind,
          detail:
            startFailure.kind === "executor_unavailable"
              ? `${startFailure.reason}: ${startFailure.detail}`
              : startFailure.detail
        }),
        eventSink
      );
    }
  }
  emit(
    constructActorProcessExitedEvent({
      invocation: request.invocation,
      status: normalizedStatus,
      signal: traced.signal,
      elapsedMs,
      timedOut: timedOut || traced.timedOut,
      error: finalError
    }),
    eventSink
  );
  return Object.freeze({
    kind: "supervised_process_actor_result",
    command: request.command,
    args: Object.freeze([...request.args]),
    cwd: request.cwd,
    pid,
    status: normalizedStatus,
    signal: traced.signal,
    outcome: traced.outcome,
    elapsedMs,
    timedOut: timedOut || traced.timedOut,
    stdoutPath: request.stdoutPath,
    stderrPath: request.stderrPath,
    error: finalError,
    events: Object.freeze([...events]),
    probeContracts: Object.freeze([...probeContractsByRef.values()])
  });
}
