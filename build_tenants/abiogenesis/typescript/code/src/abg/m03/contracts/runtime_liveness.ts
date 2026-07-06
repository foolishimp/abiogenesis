// Implements: T-129
// Implements: REQ-R-ABG3-TRANSPORT-025
// Implements: REQ-R-ABG3-TRANSPORT-026
// Implements: REQ-R-ABG3-TRANSPORT-027
// Implements: REQ-R-ABG3-TRANSPORT-028
// Implements: REQ-R-ABG3-TRANSPORT-029
// Implements: REQ-R-ABG3-EVENTS-022
// Implements: REQ-R-ABG3-PROJECTION-016
// Implements: REQ-R-ABG3-PROJECTION-017
// Implements: REQ-R-ABG3-RETRY-009

import type {
  ExecutionBasis,
  RuntimeActivityProbeSource,
  RuntimeEvent,
  RuntimeExternalInterruptionSource
} from "./carriers.js";
import { deriveIterationOutcomeFromRows } from "./iteration_state_action.js";
import {
  assertVectorIndexInRange,
  freezeStringArray
} from "./runtime_support.js";

export type RuntimeLivenessLeaseState =
  | "active"
  | "startup_silence_exceeded"
  | "inactivity_exceeded"
  | "externally_interrupted"
  | "hard_safety_cap_requires_interruption_event";

export type RuntimeInvocationDispositionAction =
  | "continue_waiting"
  | "controlled_terminate"
  | "retry"
  | "yield_continuation"
  | "block"
  | "inspect_archive"
  | "escalate"
  | "reprice_policy";

export const RUNTIME_INVOCATION_DISPOSITION_ACTION_VALUES = Object.freeze([
  "continue_waiting",
  "controlled_terminate",
  "retry",
  "yield_continuation",
  "block",
  "inspect_archive",
  "escalate",
  "reprice_policy"
] as const satisfies readonly RuntimeInvocationDispositionAction[]);

export interface RuntimeSystemProbeContract {
  readonly kind: "runtime_system_probe_contract";
  readonly probeRef: string;
  readonly systemRef: string;
  readonly source: RuntimeActivityProbeSource;
  readonly basisId: string | null;
  readonly graphFunctionId: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly vectorIndex: number | null;
  readonly edge: string | null;
  readonly actorInvocationId: string | null;
  readonly evidenceRefs: readonly string[];
}

export interface RuntimeWatchdogPolicy {
  readonly kind: "runtime_watchdog_policy";
  readonly policyRef: string;
  readonly startupSilenceLeaseMs: number;
  readonly inactivityLeaseMs: number;
  readonly terminationGraceMs: number;
  readonly hardSafetyCapMs: number | null;
  readonly nowElapsedMs: number | null;
  readonly retryBudgetRemaining: number | null;
}

export interface RuntimeLivenessActivityRow {
  readonly kind: "runtime_liveness_activity_row";
  readonly sourceEventKind: RuntimeEvent["kind"];
  readonly eventOrdinal: number;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly vectorIndex: number | null;
  readonly edge: string | null;
  readonly actorInvocationId: string | null;
  readonly workerId: string | null;
  readonly backendId: string | null;
  readonly systemRef: string;
  readonly probeRef: string;
  readonly source: RuntimeActivityProbeSource;
  readonly activityRef: string;
  readonly elapsedMs: number | null;
  readonly observedAtMs: number | null;
  readonly evidenceRefs: readonly string[];
  readonly byteLength: number | null;
  readonly detail: string | null;
}

export interface RuntimeLivenessInterruptionRow {
  readonly kind: "runtime_liveness_interruption_row";
  readonly sourceEventKind: RuntimeEvent["kind"];
  readonly eventOrdinal: number;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly vectorIndex: number | null;
  readonly edge: string | null;
  readonly actorInvocationId: string | null;
  readonly workerId: string | null;
  readonly backendId: string | null;
  readonly systemRef: string;
  readonly interruptionRef: string;
  readonly source: RuntimeExternalInterruptionSource;
  readonly signal: string | null;
  readonly elapsedMs: number | null;
  readonly observedAtMs: number | null;
  readonly evidenceRefs: readonly string[];
  readonly detail: string | null;
}

export interface RuntimeInvocationDisposition {
  readonly kind: "runtime_invocation_disposition";
  readonly dispositionRef: string;
  readonly action: RuntimeInvocationDispositionAction;
  readonly reason:
    | "activity_recent"
    | "startup_silence_exceeded"
    | "inactivity_lease_exceeded"
    | "external_interruption_observed"
    | "hard_safety_cap_requires_external_interruption_event"
    | "artifact_observed_before_failure"
    | "retry_budget_exhausted_before_dispatch";
  readonly leaseState: RuntimeLivenessLeaseState;
  readonly evidenceRefs: readonly string[];
  readonly retryBudgetRemaining: number | null;
  readonly hardSafetyCapExceeded: boolean;
  readonly requiresExternalInterruptionEvent: boolean;
}

export interface RuntimeLivenessObserverProjection {
  readonly kind: "runtime_liveness_observer_projection";
  readonly projectionRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly policyRef: string;
  readonly probeContracts: readonly RuntimeSystemProbeContract[];
  readonly activityRows: readonly RuntimeLivenessActivityRow[];
  readonly interruptionRows: readonly RuntimeLivenessInterruptionRow[];
  readonly activeSystemRefs: readonly string[];
  readonly inactiveSystemRefs: readonly string[];
  readonly interruptedSystemRefs: readonly string[];
  readonly probeCoverageRefs: readonly string[];
  readonly lastActivity: RuntimeLivenessActivityRow | null;
  readonly lastArtifactActivity: RuntimeLivenessActivityRow | null;
  readonly leaseState: RuntimeLivenessLeaseState;
  readonly hardSafetyCapExceeded: boolean;
  readonly requiresExternalInterruptionEvent: boolean;
  readonly disposition: RuntimeInvocationDisposition;
}

export interface RuntimeLivenessObserverInput {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection?: {
    readonly basisId: string;
    readonly graphFunctionId: string;
  } | undefined;
  readonly events: readonly RuntimeEvent[];
  readonly probeContracts?: readonly RuntimeSystemProbeContract[] | undefined;
  readonly policy: RuntimeWatchdogPolicy;
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return freezeStringArray([...new Set(values)].sort());
}

function eventGraphFunctionId(event: RuntimeEvent, basis: ExecutionBasis): string {
  return "graphFunctionId" in event ? event.graphFunctionId : basis.graphFunction.id;
}

function eventRunId(event: RuntimeEvent, basis: ExecutionBasis): string | null {
  return "runId" in event ? event.runId : basis.runId;
}

function eventWorkKey(event: RuntimeEvent, basis: ExecutionBasis): string | null {
  return "workKey" in event ? event.workKey : basis.workKey;
}

function eventGraphCallId(event: RuntimeEvent): string | null {
  return "graphCallId" in event ? event.graphCallId : null;
}

function eventFrameId(event: RuntimeEvent): string | null {
  return "frameId" in event ? event.frameId : null;
}

function eventVectorIndex(event: RuntimeEvent): number | null {
  return "vectorIndex" in event ? event.vectorIndex : null;
}

function eventEdge(event: RuntimeEvent): string | null {
  return "edge" in event ? event.edge : null;
}

function eventActorInvocationId(event: RuntimeEvent): string | null {
  return "actorInvocationId" in event ? event.actorInvocationId : null;
}

function eventWorkerId(event: RuntimeEvent): string | null {
  return "workerId" in event ? event.workerId : null;
}

function eventBackendId(event: RuntimeEvent): string | null {
  return "backendId" in event ? event.backendId : null;
}

function assertEventVectorWithinBasis(
  basis: ExecutionBasis,
  event: RuntimeEvent
): void {
  const vectorIndex = eventVectorIndex(event);
  if (vectorIndex !== null) {
    assertVectorIndexInRange(basis, vectorIndex);
  }
}

function systemRefForEvent(event: RuntimeEvent): string {
  return eventActorInvocationId(event) ?? eventGraphCallId(event) ?? event.kind;
}

function activityRow(input: {
  readonly basis: ExecutionBasis;
  readonly event: RuntimeEvent;
  readonly eventOrdinal: number;
  readonly source: RuntimeActivityProbeSource;
  readonly probeRef: string;
  readonly activityRef: string;
  readonly elapsedMs: number | null;
  readonly observedAtMs: number | null;
  readonly evidenceRefs: readonly string[];
  readonly byteLength?: number | null | undefined;
  readonly detail?: string | null | undefined;
  readonly systemRef?: string | null | undefined;
}): RuntimeLivenessActivityRow {
  assertEventVectorWithinBasis(input.basis, input.event);
  return Object.freeze({
    kind: "runtime_liveness_activity_row",
    sourceEventKind: input.event.kind,
    eventOrdinal: input.eventOrdinal,
    basisId:
      "basisId" in input.event && input.event.basisId !== null
        ? input.event.basisId
        : input.basis.id,
    graphFunctionId: eventGraphFunctionId(input.event, input.basis),
    runId: eventRunId(input.event, input.basis),
    workKey: eventWorkKey(input.event, input.basis),
    graphCallId: eventGraphCallId(input.event),
    frameId: eventFrameId(input.event),
    vectorIndex: eventVectorIndex(input.event),
    edge: eventEdge(input.event),
    actorInvocationId: eventActorInvocationId(input.event),
    workerId: eventWorkerId(input.event),
    backendId: eventBackendId(input.event),
    systemRef: input.systemRef ?? systemRefForEvent(input.event),
    probeRef: input.probeRef,
    source: input.source,
    activityRef: input.activityRef,
    elapsedMs: input.elapsedMs,
    observedAtMs: input.observedAtMs,
    evidenceRefs: freezeStringArray(input.evidenceRefs),
    byteLength: input.byteLength ?? null,
    detail: input.detail ?? null
  });
}

function declaredValueMatches<T>(
  declared: T | null,
  observed: T | null
): boolean {
  return declared === null || declared === observed;
}

function contractMatchesActivityRow(
  contract: RuntimeSystemProbeContract,
  row: RuntimeLivenessActivityRow
): boolean {
  return (
    contract.probeRef === row.probeRef &&
    contract.systemRef === row.systemRef &&
    contract.source === row.source &&
    declaredValueMatches(contract.basisId, row.basisId) &&
    declaredValueMatches(contract.graphFunctionId, row.graphFunctionId) &&
    declaredValueMatches(contract.graphCallId, row.graphCallId) &&
    declaredValueMatches(contract.frameId, row.frameId) &&
    declaredValueMatches(contract.vectorIndex, row.vectorIndex) &&
    declaredValueMatches(contract.edge, row.edge) &&
    declaredValueMatches(contract.actorInvocationId, row.actorInvocationId)
  );
}

function assertDeclaredProbeActivity(input: {
  readonly activityRows: readonly RuntimeLivenessActivityRow[];
  readonly probeContracts: readonly RuntimeSystemProbeContract[];
}): void {
  for (const row of input.activityRows) {
    if (row.sourceEventKind !== "runtime_activity_probe_observed") {
      continue;
    }
    if (
      !input.probeContracts.some((contract) =>
        contractMatchesActivityRow(contract, row)
      )
    ) {
      throw new TypeError(
        `RuntimeLivenessObserverProjection requires declared probe contract for ${row.probeRef}`
      );
    }
  }
}

function interruptionRow(input: {
  readonly basis: ExecutionBasis;
  readonly event: RuntimeEvent;
  readonly eventOrdinal: number;
  readonly source: RuntimeExternalInterruptionSource;
  readonly interruptionRef: string;
  readonly elapsedMs: number | null;
  readonly observedAtMs: number | null;
  readonly evidenceRefs: readonly string[];
  readonly signal?: string | null | undefined;
  readonly detail?: string | null | undefined;
  readonly systemRef?: string | null | undefined;
}): RuntimeLivenessInterruptionRow {
  assertEventVectorWithinBasis(input.basis, input.event);
  return Object.freeze({
    kind: "runtime_liveness_interruption_row",
    sourceEventKind: input.event.kind,
    eventOrdinal: input.eventOrdinal,
    basisId:
      "basisId" in input.event && input.event.basisId !== null
        ? input.event.basisId
        : input.basis.id,
    graphFunctionId: eventGraphFunctionId(input.event, input.basis),
    runId: eventRunId(input.event, input.basis),
    workKey: eventWorkKey(input.event, input.basis),
    graphCallId: eventGraphCallId(input.event),
    frameId: eventFrameId(input.event),
    vectorIndex: eventVectorIndex(input.event),
    edge: eventEdge(input.event),
    actorInvocationId: eventActorInvocationId(input.event),
    workerId: eventWorkerId(input.event),
    backendId: eventBackendId(input.event),
    systemRef: input.systemRef ?? systemRefForEvent(input.event),
    interruptionRef: input.interruptionRef,
    source: input.source,
    signal: input.signal ?? null,
    elapsedMs: input.elapsedMs,
    observedAtMs: input.observedAtMs,
    evidenceRefs: freezeStringArray(input.evidenceRefs),
    detail: input.detail ?? null
  });
}

function activityRowsForEvent(input: {
  readonly basis: ExecutionBasis;
  readonly event: RuntimeEvent;
  readonly eventOrdinal: number;
}): readonly RuntimeLivenessActivityRow[] {
  const { basis, event, eventOrdinal } = input;
  if (event.kind === "runtime_activity_probe_observed") {
    return Object.freeze([
      activityRow({
        basis,
        event,
        eventOrdinal,
        source: event.probeSource,
        probeRef: event.probeRef,
        activityRef: event.activityRef,
        elapsedMs: event.elapsedMs,
        observedAtMs: event.observedAtMs,
        evidenceRefs: event.evidenceRefs,
        detail: event.detail,
        systemRef: event.systemRef
      })
    ]);
  }
  if (event.kind === "actor_process_started") {
    return Object.freeze([
      activityRow({
        basis,
        event,
        eventOrdinal,
        source: "actor_process_lifecycle",
        probeRef: `runtime-probe:${event.actorInvocationId}:process-start`,
        activityRef: `process-start:${event.actorInvocationId}`,
        elapsedMs: 0,
        observedAtMs: null,
        evidenceRefs: [event.stdoutRef, event.stderrRef]
      })
    ]);
  }
  if (event.kind === "actor_process_stream_observed") {
    return Object.freeze([
      activityRow({
        basis,
        event,
        eventOrdinal,
        source:
          event.streamName === "stdout" ? "local_spawn_stdout" : "local_spawn_stderr",
        probeRef: `runtime-probe:${event.actorInvocationId}:${event.streamName}`,
        activityRef: `${event.streamRef}#${event.chunkIndex}`,
        elapsedMs: null,
        observedAtMs: null,
        evidenceRefs: [event.streamRef],
        byteLength: event.byteLength
      })
    ]);
  }
  if (event.kind === "actor_process_heartbeat") {
    return Object.freeze([
      activityRow({
        basis,
        event,
        eventOrdinal,
        source: "actor_process_heartbeat",
        probeRef: `runtime-probe:${event.actorInvocationId}:heartbeat`,
        activityRef: `heartbeat:${event.actorInvocationId}:${event.heartbeatIndex}`,
        elapsedMs: event.elapsedMs,
        observedAtMs: null,
        evidenceRefs: [`heartbeat:${event.actorInvocationId}:${event.heartbeatIndex}`]
      })
    ]);
  }
  if (event.kind === "actor_result_artifact_observed") {
    return Object.freeze([
      activityRow({
        basis,
        event,
        eventOrdinal,
        source: "result_artifact",
        probeRef: `runtime-probe:${event.actorInvocationId}:result-artifact`,
        activityRef: event.artifactRef,
        elapsedMs: null,
        observedAtMs: null,
        evidenceRefs: [event.artifactRef],
        detail: event.resultRef
      })
    ]);
  }
  if (event.kind === "plugin_traversal_prompt_materialized") {
    return Object.freeze([
      activityRow({
        basis,
        event,
        eventOrdinal,
        source: "structured_agent_stream",
        probeRef: `runtime-probe:${event.graphCallId}:${event.vectorIndex}:prompt`,
        activityRef: event.materializationRef,
        elapsedMs: null,
        observedAtMs: null,
        evidenceRefs: [
          event.materializationRef,
          event.renderedPromptRef,
          event.promptInputDigest
        ],
        systemRef: event.actorInvocationId ?? event.graphCallId
      })
    ]);
  }
  if (event.kind === "retry_progress_recorded") {
    return Object.freeze(
      event.progressSignalRefs.map((signalRef, index) =>
        activityRow({
          basis,
          event,
          eventOrdinal,
          source: "graph_call_frame",
          probeRef: `runtime-probe:${event.graphCallId}:${event.vectorIndex}:retry-progress`,
          activityRef: signalRef,
          elapsedMs: null,
          observedAtMs: null,
          evidenceRefs: [signalRef],
          detail: `progress-index:${index}`
        })
      )
    );
  }
  if (event.kind === "traversal_attempt_progress_observed") {
    return Object.freeze(
      [...event.artifactRefs, ...event.evidenceRefs, ...event.remainingWorkRefs].map(
        (signalRef, index) =>
          activityRow({
            basis,
            event,
            eventOrdinal,
            source: "graph_call_frame",
            probeRef: `runtime-probe:${event.graphCallId}:${event.vectorIndex}:attempt-progress`,
            activityRef: signalRef,
            elapsedMs: null,
            observedAtMs: null,
            evidenceRefs: [signalRef],
            detail: `progress-index:${index}`
          })
      )
    );
  }
  return Object.freeze([]);
}

function interruptionRowsForEvent(input: {
  readonly basis: ExecutionBasis;
  readonly event: RuntimeEvent;
  readonly eventOrdinal: number;
}): readonly RuntimeLivenessInterruptionRow[] {
  const { basis, event, eventOrdinal } = input;
  if (event.kind === "runtime_external_interruption_observed") {
    return Object.freeze([
      interruptionRow({
        basis,
        event,
        eventOrdinal,
        source: event.interruptionSource,
        interruptionRef: event.interruptionRef,
        elapsedMs: event.elapsedMs,
        observedAtMs: event.observedAtMs,
        evidenceRefs: event.evidenceRefs,
        signal: event.signal,
        detail: event.detail,
        systemRef: event.systemRef
      })
    ]);
  }
  if (event.kind === "actor_process_timeout") {
    return Object.freeze([
      interruptionRow({
        basis,
        event,
        eventOrdinal,
        source: "harness_safety_cap",
        interruptionRef: `actor-process-timeout:${event.actorInvocationId}:${event.elapsedMs}`,
        elapsedMs: event.elapsedMs,
        observedAtMs: null,
        evidenceRefs: [`timeout:${event.actorInvocationId}:${event.timeoutMs}`],
        detail: `timeoutMs=${event.timeoutMs}`
      })
    ]);
  }
  if (event.kind === "actor_process_signal_sent") {
    return Object.freeze([
      interruptionRow({
        basis,
        event,
        eventOrdinal,
        source: "host_signal",
        interruptionRef: `actor-process-signal:${event.actorInvocationId}:${event.signal}:${event.elapsedMs}`,
        elapsedMs: event.elapsedMs,
        observedAtMs: null,
        evidenceRefs: [`signal:${event.actorInvocationId}:${event.signal}`],
        signal: event.signal
      })
    ]);
  }
  if (event.kind === "actor_process_exited") {
    if (!event.timedOut && event.signal === null) {
      return Object.freeze([]);
    }
    return Object.freeze([
      interruptionRow({
        basis,
        event,
        eventOrdinal,
        source: event.timedOut ? "harness_safety_cap" : "host_signal",
        interruptionRef: `actor-process-exit:${event.actorInvocationId}:${event.elapsedMs}`,
        elapsedMs: event.elapsedMs,
        observedAtMs: null,
        evidenceRefs: [`exit:${event.actorInvocationId}:${event.elapsedMs}`],
        signal: event.signal,
        detail: event.error
      })
    ]);
  }
  return Object.freeze([]);
}

function latestActivity(
  rows: readonly RuntimeLivenessActivityRow[]
): RuntimeLivenessActivityRow | null {
  if (rows.length === 0) {
    return null;
  }
  return [...rows].sort((left, right) => {
    const leftTime = activityLeaseTime(left) ?? -1;
    const rightTime = activityLeaseTime(right) ?? -1;
    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }
    return left.eventOrdinal - right.eventOrdinal;
  }).at(-1) ?? null;
}

const RUNTIME_LEASE_PROGRESS_SOURCES = Object.freeze([
  "local_spawn_stdout",
  "local_spawn_stderr",
  "pty_transcript",
  "structured_agent_stream",
  "tool_call",
  "result_artifact"
] as const satisfies readonly RuntimeActivityProbeSource[]);

const RUNTIME_LEASE_PROGRESS_SOURCE_SET: ReadonlySet<RuntimeActivityProbeSource> =
  new Set(RUNTIME_LEASE_PROGRESS_SOURCES);

function isLeaseProgressActivity(row: RuntimeLivenessActivityRow): boolean {
  return RUNTIME_LEASE_PROGRESS_SOURCE_SET.has(row.source);
}

function activityLeaseTime(row: RuntimeLivenessActivityRow): number | null {
  return row.elapsedMs ?? row.observedAtMs;
}

function latestLeaseResetActivity(
  rows: readonly RuntimeLivenessActivityRow[]
): RuntimeLivenessActivityRow | null {
  const progressActivity = latestActivity(rows.filter(isLeaseProgressActivity));
  if (progressActivity !== null) {
    return progressActivity;
  }
  return latestActivity(
    rows.filter((row) => row.source === "actor_process_lifecycle")
  );
}

function latestArtifactActivity(
  rows: readonly RuntimeLivenessActivityRow[]
): RuntimeLivenessActivityRow | null {
  return latestActivity(
    rows.filter(
      (row) =>
        row.source === "result_artifact" ||
        row.source === "archive_write" ||
        row.source === "runtime_projection_write"
    )
  );
}

function hardSafetyCapExceeded(policy: RuntimeWatchdogPolicy): boolean {
  return (
    policy.hardSafetyCapMs !== null &&
    policy.nowElapsedMs !== null &&
    policy.nowElapsedMs >= policy.hardSafetyCapMs
  );
}

function leaseStateFor(input: {
  readonly policy: RuntimeWatchdogPolicy;
  readonly activityRows: readonly RuntimeLivenessActivityRow[];
  readonly interruptionRows: readonly RuntimeLivenessInterruptionRow[];
  readonly lastLeaseResetActivity: RuntimeLivenessActivityRow | null;
  readonly hardSafetyCapExceeded: boolean;
}): RuntimeLivenessLeaseState {
  if (input.interruptionRows.length > 0) {
    return "externally_interrupted";
  }
  if (input.hardSafetyCapExceeded) {
    return "hard_safety_cap_requires_interruption_event";
  }
  if (input.policy.nowElapsedMs === null) {
    return "active";
  }
  if (input.activityRows.length === 0) {
    return input.policy.nowElapsedMs >= input.policy.startupSilenceLeaseMs
      ? "startup_silence_exceeded"
      : "active";
  }
  const lastElapsed = input.lastLeaseResetActivity === null
    ? 0
    : activityLeaseTime(input.lastLeaseResetActivity);
  if (lastElapsed === null) {
    return input.policy.nowElapsedMs >= input.policy.inactivityLeaseMs
      ? "inactivity_exceeded"
      : "active";
  }
  return input.policy.nowElapsedMs - lastElapsed >= input.policy.inactivityLeaseMs
    ? "inactivity_exceeded"
    : "active";
}

function evidenceForDisposition(input: {
  readonly lastActivity: RuntimeLivenessActivityRow | null;
  readonly lastArtifactActivity: RuntimeLivenessActivityRow | null;
  readonly interruptionRows: readonly RuntimeLivenessInterruptionRow[];
}): readonly string[] {
  return uniqueSorted([
    ...(input.lastActivity?.evidenceRefs ?? Object.freeze([])),
    ...(input.lastArtifactActivity?.evidenceRefs ?? Object.freeze([])),
    ...input.interruptionRows.flatMap((row) => row.evidenceRefs)
  ]);
}

function dispositionFor(input: {
  readonly basis: ExecutionBasis;
  readonly policy: RuntimeWatchdogPolicy;
  readonly leaseState: RuntimeLivenessLeaseState;
  readonly lastActivity: RuntimeLivenessActivityRow | null;
  readonly lastArtifactActivity: RuntimeLivenessActivityRow | null;
  readonly interruptionRows: readonly RuntimeLivenessInterruptionRow[];
  readonly hardSafetyCapExceeded: boolean;
  readonly requiresExternalInterruptionEvent: boolean;
}): RuntimeInvocationDisposition {
  const evidenceRefs = evidenceForDisposition(input);
  const retryBudgetRemaining = input.policy.retryBudgetRemaining;
  const vectorIndex =
    input.lastActivity?.vectorIndex ??
    input.lastArtifactActivity?.vectorIndex ??
    0;
  const fold =
    input.lastArtifactActivity !== null && input.leaseState !== "active"
      ? deriveIterationOutcomeFromRows({
          vectorIndex,
          runtimeRows: [
            {
              boundary: "transport",
              status: "failed",
              reason: "runtime_failure",
              retryable: false,
              evidenceRefs
            }
          ]
        })
      : input.leaseState === "externally_interrupted" ||
          input.leaseState === "hard_safety_cap_requires_interruption_event"
        ? deriveIterationOutcomeFromRows({
            vectorIndex,
            runtimeRows: [
              {
                boundary: "transport",
                status: "failed",
                reason: "runtime_failure",
                retryable: false,
                evidenceRefs
              }
            ]
          })
        : input.leaseState === "startup_silence_exceeded" ||
            input.leaseState === "inactivity_exceeded"
          ? deriveIterationOutcomeFromRows({
              vectorIndex,
              runtimeRows: [
                {
                  boundary: "liveness",
                  status: "failed",
                  reason:
                    retryBudgetRemaining !== null && retryBudgetRemaining <= 0
                      ? "retry_exhausted"
                      : "runtime_failure",
                  retryable:
                    retryBudgetRemaining === null || retryBudgetRemaining > 0,
                  evidenceRefs
                }
              ]
            })
          : deriveIterationOutcomeFromRows({
              vectorIndex,
              runtimeRows: [
                {
                  boundary: "liveness",
                  status: "progressing",
                  reason: null,
                  retryable: false,
                  evidenceRefs
                }
              ]
            });
  const refBase = [
    input.basis.id,
    input.policy.policyRef,
    input.leaseState,
    input.lastActivity?.activityRef ?? "no-activity",
    retryBudgetRemaining ?? "unbounded"
  ].join(":");
  const common = {
    kind: "runtime_invocation_disposition" as const,
    dispositionRef: `runtime-invocation-disposition:${refBase}`,
    leaseState: input.leaseState,
    evidenceRefs,
    retryBudgetRemaining,
    hardSafetyCapExceeded: input.hardSafetyCapExceeded,
    requiresExternalInterruptionEvent: input.requiresExternalInterruptionEvent
  };
  if (input.lastArtifactActivity !== null && input.leaseState !== "active") {
    if (fold.kind !== "terminate" || fold.disposition !== "blocked") {
      throw new TypeError("Runtime liveness archive inspection did not fold to block");
    }
    return Object.freeze({
      ...common,
      action: "inspect_archive",
      reason: "artifact_observed_before_failure"
    });
  }
  if (input.leaseState === "externally_interrupted") {
    if (fold.kind !== "terminate" || fold.disposition !== "blocked") {
      throw new TypeError("Runtime liveness interruption did not fold to block");
    }
    return Object.freeze({
      ...common,
      action: "block",
      reason: "external_interruption_observed"
    });
  }
  if (input.leaseState === "hard_safety_cap_requires_interruption_event") {
    if (fold.kind !== "terminate" || fold.disposition !== "blocked") {
      throw new TypeError("Runtime liveness hard cap did not fold to block");
    }
    return Object.freeze({
      ...common,
      action: "controlled_terminate",
      reason: "hard_safety_cap_requires_external_interruption_event"
    });
  }
  if (
    input.leaseState === "startup_silence_exceeded" ||
    input.leaseState === "inactivity_exceeded"
  ) {
    if (retryBudgetRemaining !== null && retryBudgetRemaining <= 0) {
      if (fold.kind !== "terminate" || fold.disposition !== "blocked") {
        throw new TypeError("Runtime liveness retry exhaustion did not fold to block");
      }
      return Object.freeze({
        ...common,
        action: "block",
        reason: "retry_budget_exhausted_before_dispatch"
      });
    }
    if (fold.kind !== "redispatch") {
      throw new TypeError("Runtime liveness retryable lease did not fold to retry");
    }
    return Object.freeze({
      ...common,
      action: "retry",
      reason:
        input.leaseState === "startup_silence_exceeded"
          ? "startup_silence_exceeded"
          : "inactivity_lease_exceeded"
    });
  }
  if (fold.kind !== "suspend") {
    throw new TypeError("Runtime liveness active lease did not fold to suspend");
  }
  return Object.freeze({
    ...common,
    action: "continue_waiting",
    reason: "activity_recent"
  });
}

export function constructRuntimeSystemProbeContract(input: {
  readonly probeRef: string;
  readonly systemRef: string;
  readonly source: RuntimeActivityProbeSource;
  readonly basisId?: string | null | undefined;
  readonly graphFunctionId?: string | null | undefined;
  readonly graphCallId?: string | null | undefined;
  readonly frameId?: string | null | undefined;
  readonly vectorIndex?: number | null | undefined;
  readonly edge?: string | null | undefined;
  readonly actorInvocationId?: string | null | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
}): RuntimeSystemProbeContract {
  return Object.freeze({
    kind: "runtime_system_probe_contract",
    probeRef: input.probeRef,
    systemRef: input.systemRef,
    source: input.source,
    basisId: input.basisId ?? null,
    graphFunctionId: input.graphFunctionId ?? null,
    graphCallId: input.graphCallId ?? null,
    frameId: input.frameId ?? null,
    vectorIndex: input.vectorIndex ?? null,
    edge: input.edge ?? null,
    actorInvocationId: input.actorInvocationId ?? null,
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([]))
  });
}

export function constructRuntimeWatchdogPolicy(input: {
  readonly policyRef: string;
  readonly startupSilenceLeaseMs: number;
  readonly inactivityLeaseMs: number;
  readonly terminationGraceMs: number;
  readonly hardSafetyCapMs?: number | null | undefined;
  readonly nowElapsedMs?: number | null | undefined;
  readonly retryBudgetRemaining?: number | null | undefined;
}): RuntimeWatchdogPolicy {
  return Object.freeze({
    kind: "runtime_watchdog_policy",
    policyRef: input.policyRef,
    startupSilenceLeaseMs: input.startupSilenceLeaseMs,
    inactivityLeaseMs: input.inactivityLeaseMs,
    terminationGraceMs: input.terminationGraceMs,
    hardSafetyCapMs: input.hardSafetyCapMs ?? null,
    nowElapsedMs: input.nowElapsedMs ?? null,
    retryBudgetRemaining: input.retryBudgetRemaining ?? null
  });
}

export function deriveRuntimeLivenessObserverProjection(
  input: RuntimeLivenessObserverInput
): RuntimeLivenessObserverProjection {
  if (input.runtimeProjection !== undefined) {
    if (input.runtimeProjection.basisId !== input.basis.id) {
      throw new TypeError(
        "RuntimeLivenessObserverProjection requires runtime projection for the same basis"
      );
    }
    if (input.runtimeProjection.graphFunctionId !== input.basis.graphFunction.id) {
      throw new TypeError(
        "RuntimeLivenessObserverProjection requires runtime projection for the same graph function"
      );
    }
  }
  const activityRows = Object.freeze(
    input.events.flatMap((event, eventOrdinal) =>
      activityRowsForEvent({ basis: input.basis, event, eventOrdinal })
    )
  );
  const interruptionRows = Object.freeze(
    input.events.flatMap((event, eventOrdinal) =>
      interruptionRowsForEvent({ basis: input.basis, event, eventOrdinal })
    )
  );
  const probeContracts = Object.freeze([
    ...(input.probeContracts ?? Object.freeze([]))
  ]);
  assertDeclaredProbeActivity({ activityRows, probeContracts });
  const lastActivity = latestActivity(activityRows);
  const lastLeaseResetActivity = latestLeaseResetActivity(activityRows);
  const lastArtifactActivity = latestArtifactActivity(activityRows);
  const safetyExceeded = hardSafetyCapExceeded(input.policy);
  const requiresExternalInterruptionEvent =
    safetyExceeded && interruptionRows.length === 0;
  const leaseState = leaseStateFor({
    policy: input.policy,
    activityRows,
    interruptionRows,
    lastLeaseResetActivity,
    hardSafetyCapExceeded: safetyExceeded
  });
  const interruptedSystemRefs = uniqueSorted(
    interruptionRows.map((row) => row.systemRef)
  );
  const activeSystemRefs =
    leaseState === "active"
      ? uniqueSorted(activityRows.map((row) => row.systemRef))
      : Object.freeze([]);
  const inactiveSystemRefs =
    leaseState === "startup_silence_exceeded" ||
    leaseState === "inactivity_exceeded"
      ? uniqueSorted(
          activityRows.length === 0
            ? input.probeContracts?.map((contract) => contract.systemRef) ??
                Object.freeze([])
            : activityRows.map((row) => row.systemRef)
        )
      : Object.freeze([]);
  const disposition = dispositionFor({
    basis: input.basis,
    policy: input.policy,
    leaseState,
    lastActivity,
    lastArtifactActivity,
    interruptionRows,
    hardSafetyCapExceeded: safetyExceeded,
    requiresExternalInterruptionEvent
  });
  const policyIdentityRef = [
    input.policy.policyRef,
    input.policy.startupSilenceLeaseMs,
    input.policy.inactivityLeaseMs,
    input.policy.terminationGraceMs,
    input.policy.hardSafetyCapMs ?? "no-hard-cap",
    input.policy.nowElapsedMs ?? "no-now",
    input.policy.retryBudgetRemaining ?? "unbounded"
  ].join(":");
  const activityIdentityRef =
    uniqueSorted(
      activityRows.map((row) =>
        [
          row.eventOrdinal,
          row.source,
          row.activityRef,
          row.elapsedMs ?? "no-elapsed",
          row.observedAtMs ?? "no-observed",
          ...row.evidenceRefs
        ].join("@")
      )
    ).join("|") || "no-activity";
  const interruptionIdentityRef =
    uniqueSorted(
      interruptionRows.map((row) =>
        [
          row.eventOrdinal,
          row.source,
          row.interruptionRef,
          row.elapsedMs ?? "no-elapsed",
          row.observedAtMs ?? "no-observed",
          ...row.evidenceRefs
        ].join("@")
      )
    ).join("|") || "no-interruption";
  return Object.freeze({
    kind: "runtime_liveness_observer_projection",
    projectionRef: [
      "runtime-liveness-observer",
      input.basis.id,
      policyIdentityRef,
      leaseState,
      activityIdentityRef,
      interruptionIdentityRef
    ].join(":"),
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    policyRef: input.policy.policyRef,
    probeContracts,
    activityRows,
    interruptionRows,
    activeSystemRefs,
    inactiveSystemRefs,
    interruptedSystemRefs,
    probeCoverageRefs: uniqueSorted(activityRows.map((row) => row.probeRef)),
    lastActivity,
    lastArtifactActivity,
    leaseState,
    hardSafetyCapExceeded: safetyExceeded,
    requiresExternalInterruptionEvent,
    disposition
  });
}
