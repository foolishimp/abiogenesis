import type {
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeFailureClass
} from "./carriers.js";
import { deriveIterationOutcomeFromRows } from "./iteration_state_action.js";
import { countRetryAttemptsForVector } from "./projection.js";
import { RETRYABLE_RUNTIME_FAILURE_CLASSES } from "./workspace_zoom_foldback.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger,
  assertProjectionBasis,
  assertRuntimeFailureClass,
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";

export const TRAVERSAL_NON_PROGRESS_TIMEOUT_CLASS_VALUES = Object.freeze([
  "inactivity_timeout",
  "hard_timeout",
  "transport_exit"
] as const);

export type TraversalNonProgressTimeoutClass =
  (typeof TRAVERSAL_NON_PROGRESS_TIMEOUT_CLASS_VALUES)[number];

export const TRAVERSAL_NON_PROGRESS_CLASSIFICATION_VALUES = Object.freeze([
  "non_progress",
  "progress_without_result",
  "incomplete_runtime_archive"
] as const);

export type TraversalNonProgressClassification =
  (typeof TRAVERSAL_NON_PROGRESS_CLASSIFICATION_VALUES)[number];

export const TRAVERSAL_CONTINUATION_ACTION_VALUES = Object.freeze([
  "retry_same_edge",
  "yield_same_edge_continuation",
  "retry_exhausted",
  "inspect_runtime_archive",
  "reprice_runtime_policy",
  "blocked"
] as const);

export type TraversalContinuationAction =
  (typeof TRAVERSAL_CONTINUATION_ACTION_VALUES)[number];

export interface TraversalContinuationRetryBudget {
  readonly observedAttemptCount: number;
  readonly maxAttempts: number;
  readonly remainingAttempts: number;
  readonly stationary: boolean;
}

export interface TraversalNonProgressCarrier {
  readonly kind: "traversal_non_progress_carrier";
  readonly carrierRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly actorInvocationId: string;
  readonly attemptIndex: number;
  readonly dispatchRef: string;
  readonly resultRef: string;
  readonly pid: number | null;
  readonly processEvidenceComplete: boolean;
  readonly classification: TraversalNonProgressClassification;
  readonly timeoutClass: TraversalNonProgressTimeoutClass | null;
  readonly runtimeFailureClass: RuntimeFailureClass;
  readonly stdoutRef: string | null;
  readonly stderrRef: string | null;
  readonly stdoutBytes: number;
  readonly stderrBytes: number;
  readonly latestHeartbeatIndex: number | null;
  readonly latestHeartbeatElapsedMs: number | null;
  readonly timeoutObserved: boolean;
  readonly timeoutMs: number | null;
  readonly timeoutElapsedMs: number | null;
  readonly signalSequence: readonly {
    readonly signal: "SIGTERM" | "SIGKILL";
    readonly elapsedMs: number;
  }[];
  readonly status: number | null;
  readonly signal: string | null;
  readonly timedOut: boolean;
  readonly error: string | null;
  readonly running: boolean;
  readonly artifactObserved: boolean;
  readonly reportObserved: boolean;
  readonly progressSignalRefs: readonly string[];
  readonly streamEvidenceRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface TraversalContinuationActionProjection {
  readonly kind: "traversal_continuation_action_projection";
  readonly projectionRef: string;
  readonly sourceCarrierRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly frameLineageId: string | null;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly actorInvocationId: string;
  readonly action: TraversalContinuationAction;
  readonly publicSummaryAction: TraversalContinuationAction;
  readonly retryEligible: boolean;
  readonly terminal: boolean;
  readonly runtimeFailureClass: RuntimeFailureClass;
  readonly retryBudget: TraversalContinuationRetryBudget;
  readonly reason: string;
  readonly reasonRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface TraversalNonProgressDerivationInput {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly actorInvocationId?: string | null;
  readonly timeoutClass?: TraversalNonProgressTimeoutClass | null;
  readonly reportRefs?: readonly string[];
  readonly progressSignalRefs?: readonly string[];
  readonly evidenceRefs?: readonly string[];
}

export interface TraversalContinuationActionDerivationInput {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly carrier: TraversalNonProgressCarrier;
  readonly maxAttempts: number;
  readonly stationary?: boolean;
  readonly retryableRuntimeFailureClasses?: readonly RuntimeFailureClass[];
  readonly runtimePolicyContradiction?: boolean;
}

export interface TraversalContinuationSummary {
  readonly kind: "traversal_continuation_summary";
  readonly action: TraversalContinuationAction;
  readonly retryEligible: boolean;
  readonly terminal: boolean;
  readonly reason: string;
  readonly evidenceRefs: readonly string[];
}

function assertTimeoutClass(value: TraversalNonProgressTimeoutClass): void {
  for (const allowed of TRAVERSAL_NON_PROGRESS_TIMEOUT_CLASS_VALUES) {
    if (value === allowed) {
      return;
    }
  }
  throw new TypeError(`Unsupported traversal timeout class ${JSON.stringify(value)}`);
}

function firstNonNullGraphCallId(
  projection: RuntimeAggregateProjection,
  basis: ExecutionBasis
): string {
  return projection.graphCallId ?? graphCallIdForBasis(basis);
}

function firstNonNullFrameId(
  projection: RuntimeAggregateProjection,
  basis: ExecutionBasis
): string {
  return projection.frameId ?? frameIdForBasis(basis);
}

function uniqueNonEmptyStrings(values: readonly (string | null | undefined)[]): readonly string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (value === null || value === undefined || value.length === 0) {
      continue;
    }
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return freezeStringArray(result);
}

function latestActorInvocation(input: {
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly actorInvocationId: string | null | undefined;
}): RuntimeAggregateProjection["actorInvocationRefs"][number] {
  const matching = input.projection.actorInvocationRefs.filter(
    (invocation) =>
      invocation.vectorIndex === input.vectorIndex &&
      (input.actorInvocationId === null ||
        input.actorInvocationId === undefined ||
        invocation.actorInvocationId === input.actorInvocationId)
  );
  if (matching.length === 0) {
    throw new TypeError("Traversal non-progress requires actor invocation truth");
  }
  const latest = matching[matching.length - 1];
  if (latest === undefined) {
    throw new TypeError("Traversal non-progress requires actor invocation truth");
  }
  return latest;
}

function timeoutClassToRuntimeFailureClass(
  timeoutClass: TraversalNonProgressTimeoutClass
): RuntimeFailureClass {
  switch (timeoutClass) {
    case "inactivity_timeout":
      return "no_output";
    case "hard_timeout":
    case "transport_exit":
      return "transport_failure";
    default: {
      const exhaustive: never = timeoutClass;
      throw new TypeError(
        `Unsupported traversal timeout class ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

export function runtimeFailureClassForTraversalTimeout(
  timeoutClass: TraversalNonProgressTimeoutClass
): RuntimeFailureClass {
  assertTimeoutClass(timeoutClass);
  return timeoutClassToRuntimeFailureClass(timeoutClass);
}

function inferTimeoutClass(input: {
  readonly process:
    | RuntimeAggregateProjection["actorProcessRefs"][number]
    | undefined;
  readonly override: TraversalNonProgressTimeoutClass | null | undefined;
}): TraversalNonProgressTimeoutClass | null {
  if (input.override !== undefined && input.override !== null) {
    assertTimeoutClass(input.override);
    return input.override;
  }
  if (input.process === undefined) {
    return null;
  }
  if (input.process.timedOut && input.process.timeoutObserved) {
    return "inactivity_timeout";
  }
  if (input.process.timedOut) {
    return "hard_timeout";
  }
  if (
    !input.process.running &&
    (input.process.status !== 0 ||
      input.process.signal !== null ||
      input.process.error !== null)
  ) {
    return "transport_exit";
  }
  return null;
}

function inferRuntimeFailureClass(input: {
  readonly timeoutClass: TraversalNonProgressTimeoutClass | null;
  readonly process:
    | RuntimeAggregateProjection["actorProcessRefs"][number]
    | undefined;
  readonly classification: TraversalNonProgressClassification;
}): RuntimeFailureClass {
  if (input.timeoutClass !== null) {
    return runtimeFailureClassForTraversalTimeout(input.timeoutClass);
  }
  if (
    input.process !== undefined &&
    !input.process.running &&
    input.process.status === 0 &&
    input.classification === "non_progress"
  ) {
    return "no_output";
  }
  return "runtime_failure";
}

function streamBytesForInvocation(input: {
  readonly projection: RuntimeAggregateProjection;
  readonly actorInvocationId: string;
  readonly streamName: "stdout" | "stderr";
}): number {
  return input.projection.actorProcessStreamRefs
    .filter(
      (stream) =>
        stream.actorInvocationId === input.actorInvocationId &&
        stream.streamName === input.streamName
    )
    .reduce((total, stream) => total + stream.byteLength, 0);
}

function streamRefsForInvocation(input: {
  readonly projection: RuntimeAggregateProjection;
  readonly actorInvocationId: string;
}): readonly string[] {
  return uniqueNonEmptyStrings(
    input.projection.actorProcessStreamRefs
      .filter((stream) => stream.actorInvocationId === input.actorInvocationId)
      .map((stream) => stream.streamRef)
  );
}

function observedArtifactForInvocation(input: {
  readonly projection: RuntimeAggregateProjection;
  readonly actorInvocationId: string;
}): RuntimeAggregateProjection["observedActorArtifactRefs"][number] | undefined {
  return input.projection.observedActorArtifactRefs.find(
    (artifact) => artifact.actorInvocationId === input.actorInvocationId
  );
}

function deriveClassification(input: {
  readonly process:
    | RuntimeAggregateProjection["actorProcessRefs"][number]
    | undefined;
  readonly stdoutBytes: number;
  readonly stderrBytes: number;
  readonly progressSignalRefs: readonly string[];
}): TraversalNonProgressClassification {
  if (input.process === undefined) {
    return "incomplete_runtime_archive";
  }
  const progressObserved =
    input.stdoutBytes > 0 ||
    input.stderrBytes > 0 ||
    input.progressSignalRefs.length > 0;
  if (progressObserved) {
    return input.process.running
      ? "progress_without_result"
      : "incomplete_runtime_archive";
  }
  return "non_progress";
}

export function deriveTraversalNonProgressCarrier(
  input: TraversalNonProgressDerivationInput
): TraversalNonProgressCarrier {
  assertProjectionBasis(input.basis, input.projection, "TraversalNonProgressCarrier");
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  const invocation = latestActorInvocation({
    projection: input.projection,
    vectorIndex: input.vectorIndex,
    actorInvocationId: input.actorInvocationId
  });
  const process = input.projection.actorProcessRefs.find(
    (candidate) => candidate.actorInvocationId === invocation.actorInvocationId
  );
  const observedArtifact = observedArtifactForInvocation({
    projection: input.projection,
    actorInvocationId: invocation.actorInvocationId
  });
  const reportRefs = freezeStringArray([...(input.reportRefs ?? Object.freeze([]))]);
  const progressSignalRefs = freezeStringArray([
    ...(input.progressSignalRefs ?? Object.freeze([]))
  ]);
  if (observedArtifact !== undefined) {
    throw new TypeError(
      "Traversal non-progress cannot replace artifact salvage truth"
    );
  }
  if (reportRefs.length > 0) {
    throw new TypeError(
      "Traversal non-progress cannot replace admitted report truth"
    );
  }
  const timeoutClass = inferTimeoutClass({
    process,
    override: input.timeoutClass
  });
  const stdoutBytes = streamBytesForInvocation({
    projection: input.projection,
    actorInvocationId: invocation.actorInvocationId,
    streamName: "stdout"
  });
  const stderrBytes = streamBytesForInvocation({
    projection: input.projection,
    actorInvocationId: invocation.actorInvocationId,
    streamName: "stderr"
  });
  const streamEvidenceRefs = streamRefsForInvocation({
    projection: input.projection,
    actorInvocationId: invocation.actorInvocationId
  });
  const classification = deriveClassification({
    process,
    stdoutBytes,
    stderrBytes,
    progressSignalRefs
  });
  const runtimeFailureClass = inferRuntimeFailureClass({
    timeoutClass,
    process,
    classification
  });
  assertRuntimeFailureClass(runtimeFailureClass);
  const evidenceRefs = uniqueNonEmptyStrings([
    ...(input.evidenceRefs ?? Object.freeze([])),
    `actor_invocation:${invocation.actorInvocationId}`,
    invocation.resultRef,
    process?.stdoutRef ?? null,
    process?.stderrRef ?? null,
    ...streamEvidenceRefs,
    ...progressSignalRefs
  ]);
  const edge = vectorEdge(input.basis, input.vectorIndex);

  return Object.freeze({
    kind: "traversal_non_progress_carrier",
    carrierRef: [
      "traversal_non_progress",
      input.basis.id,
      String(input.vectorIndex),
      invocation.actorInvocationId
    ].join(":"),
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    graphCallId: firstNonNullGraphCallId(input.projection, input.basis),
    frameId: firstNonNullFrameId(input.projection, input.basis),
    frameLineageId: input.basis.frameLineageId,
    vectorIndex: input.vectorIndex,
    edge,
    actorInvocationId: invocation.actorInvocationId,
    attemptIndex: invocation.attemptIndex,
    dispatchRef: invocation.dispatchRef,
    resultRef: invocation.resultRef,
    pid: process?.pid ?? null,
    processEvidenceComplete: process !== undefined,
    classification,
    timeoutClass,
    runtimeFailureClass,
    stdoutRef: process?.stdoutRef ?? null,
    stderrRef: process?.stderrRef ?? null,
    stdoutBytes,
    stderrBytes,
    latestHeartbeatIndex: process?.latestHeartbeatIndex ?? null,
    latestHeartbeatElapsedMs: process?.latestHeartbeatElapsedMs ?? null,
    timeoutObserved: process?.timeoutObserved ?? false,
    timeoutMs: process?.timeoutMs ?? null,
    timeoutElapsedMs: process?.timeoutElapsedMs ?? null,
    signalSequence: Object.freeze([...(process?.signalSequence ?? Object.freeze([]))]),
    status: process?.status ?? null,
    signal: process?.signal ?? null,
    timedOut: process?.timedOut ?? false,
    error: process?.error ?? null,
    running: process?.running ?? false,
    artifactObserved: false,
    reportObserved: false,
    progressSignalRefs,
    streamEvidenceRefs,
    evidenceRefs
  } satisfies TraversalNonProgressCarrier);
}

function retryBudget(input: {
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly maxAttempts: number;
  readonly stationary: boolean;
}): TraversalContinuationRetryBudget {
  assertNonNegativeInteger(input.maxAttempts, "maxAttempts");
  const observedAttemptCount = countRetryAttemptsForVector(
    input.projection,
    input.vectorIndex
  );
  return Object.freeze({
    observedAttemptCount,
    maxAttempts: input.maxAttempts,
    remainingAttempts: Math.max(input.maxAttempts - observedAttemptCount, 0),
    stationary: input.stationary
  });
}

function runtimeFailureIsRetryable(input: {
  readonly runtimeFailureClass: RuntimeFailureClass;
  readonly retryableRuntimeFailureClasses: readonly RuntimeFailureClass[];
}): boolean {
  return input.retryableRuntimeFailureClasses.some(
    (failureClass) => failureClass === input.runtimeFailureClass
  );
}

function freezeRuntimeFailureClasses(
  values: readonly RuntimeFailureClass[]
): readonly RuntimeFailureClass[] {
  for (const failureClass of values) {
    assertRuntimeFailureClass(failureClass);
  }
  return Object.freeze([...values]);
}

function assertCarrierMatchesReplay(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly carrier: TraversalNonProgressCarrier;
}): void {
  const replayed = deriveTraversalNonProgressCarrier({
    basis: input.basis,
    projection: input.projection,
    vectorIndex: input.carrier.vectorIndex,
    actorInvocationId: input.carrier.actorInvocationId,
    timeoutClass: input.carrier.timeoutClass,
    progressSignalRefs: input.carrier.progressSignalRefs
  });
  const checks: readonly [string, unknown, unknown][] = Object.freeze([
    ["carrierRef", input.carrier.carrierRef, replayed.carrierRef],
    ["graphCallId", input.carrier.graphCallId, replayed.graphCallId],
    ["frameId", input.carrier.frameId, replayed.frameId],
    ["edge", input.carrier.edge, replayed.edge],
    ["attemptIndex", input.carrier.attemptIndex, replayed.attemptIndex],
    ["resultRef", input.carrier.resultRef, replayed.resultRef],
    ["processEvidenceComplete", input.carrier.processEvidenceComplete, replayed.processEvidenceComplete],
    ["classification", input.carrier.classification, replayed.classification],
    ["timeoutClass", input.carrier.timeoutClass, replayed.timeoutClass],
    ["runtimeFailureClass", input.carrier.runtimeFailureClass, replayed.runtimeFailureClass],
    ["stdoutBytes", input.carrier.stdoutBytes, replayed.stdoutBytes],
    ["stderrBytes", input.carrier.stderrBytes, replayed.stderrBytes],
    ["timeoutObserved", input.carrier.timeoutObserved, replayed.timeoutObserved],
    ["status", input.carrier.status, replayed.status],
    ["signal", input.carrier.signal, replayed.signal],
    ["timedOut", input.carrier.timedOut, replayed.timedOut],
    ["running", input.carrier.running, replayed.running],
    ["artifactObserved", input.carrier.artifactObserved, replayed.artifactObserved],
    ["reportObserved", input.carrier.reportObserved, replayed.reportObserved]
  ]);
  for (const [field, carrierValue, replayValue] of checks) {
    if (carrierValue !== replayValue) {
      throw new TypeError(
        `TraversalContinuationActionProjection rejects carrier replay drift at ${field}`
      );
    }
  }
  if (
    JSON.stringify(input.carrier.signalSequence) !==
    JSON.stringify(replayed.signalSequence)
  ) {
    throw new TypeError(
      "TraversalContinuationActionProjection rejects carrier replay drift at signalSequence"
    );
  }
}

export function deriveTraversalContinuationActionProjection(
  input: TraversalContinuationActionDerivationInput
): TraversalContinuationActionProjection {
  assertProjectionBasis(input.basis, input.projection, "TraversalContinuationActionProjection");
  assertVectorIndexInRange(input.basis, input.carrier.vectorIndex);
  if (input.carrier.basisId !== input.basis.id) {
    throw new TypeError("TraversalContinuationActionProjection rejects carrier basis drift");
  }
  if (input.carrier.graphFunctionId !== input.basis.graphFunction.id) {
    throw new TypeError(
      "TraversalContinuationActionProjection rejects carrier graph function drift"
    );
  }
  assertCarrierMatchesReplay({
    basis: input.basis,
    projection: input.projection,
    carrier: input.carrier
  });
  const retryableRuntimeFailureClasses = freezeRuntimeFailureClasses([
    ...(input.retryableRuntimeFailureClasses ?? RETRYABLE_RUNTIME_FAILURE_CLASSES)
  ]);
  const budget = retryBudget({
    projection: input.projection,
    vectorIndex: input.carrier.vectorIndex,
    maxAttempts: input.maxAttempts,
    stationary: input.stationary ?? false
  });
  const evidenceRefs = uniqueNonEmptyStrings([
    input.carrier.carrierRef,
    ...input.carrier.evidenceRefs
  ]);
  const sourceProjectionRefs = uniqueNonEmptyStrings([
    input.carrier.carrierRef
  ]);
  let inspectArchive = false;
  let inspectReason: string | null = null;
  let policyReprice = false;
  const satisfactionRows = [];
  const runtimeRows = [];
  if (input.runtimePolicyContradiction === true) {
    policyReprice = true;
    satisfactionRows.push({
      authorityRef: input.carrier.carrierRef,
      status: "unsatisfied" as const,
      reason: "missing_authority" as const,
      lifecycle: "active" as const,
      evidenceRefs,
      sourceProjectionRefs,
      reEntryPoint: "requirements" as const
    });
  } else if (!input.carrier.processEvidenceComplete) {
    inspectArchive = true;
    inspectReason = "missing_process_evidence";
    runtimeRows.push({
      boundary: "transport" as const,
      status: "failed" as const,
      reason: "runtime_failure" as const,
      retryable: false,
      evidenceRefs,
      sourceProjectionRefs
    });
  } else if (input.carrier.classification === "progress_without_result") {
    runtimeRows.push({
      boundary: "worker" as const,
      status: "progressing" as const,
      reason: null,
      retryable: false,
      evidenceRefs,
      sourceProjectionRefs
    });
  } else if (
    input.carrier.classification === "incomplete_runtime_archive"
  ) {
    inspectArchive = true;
    inspectReason = "process_progress_requires_archive_inspection";
    runtimeRows.push({
      boundary: "transport" as const,
      status: "failed" as const,
      reason: "runtime_failure" as const,
      retryable: false,
      evidenceRefs,
      sourceProjectionRefs
    });
  } else if (
    !runtimeFailureIsRetryable({
      runtimeFailureClass: input.carrier.runtimeFailureClass,
      retryableRuntimeFailureClasses
    })
  ) {
    runtimeRows.push({
      boundary: "worker" as const,
      status: "failed" as const,
      reason: "runtime_failure" as const,
      retryable: false,
      evidenceRefs,
      sourceProjectionRefs
    });
  } else if (budget.stationary || budget.observedAttemptCount >= budget.maxAttempts) {
    runtimeRows.push({
      boundary: "worker" as const,
      status: "failed" as const,
      reason: "retry_exhausted" as const,
      retryable: false,
      evidenceRefs,
      sourceProjectionRefs
    });
  } else {
    runtimeRows.push({
      boundary: "worker" as const,
      status: "failed" as const,
      reason: "runtime_failure" as const,
      retryable: true,
      evidenceRefs,
      sourceProjectionRefs
    });
  }
  const outcome = deriveIterationOutcomeFromRows({
    vectorIndex: input.carrier.vectorIndex,
    satisfactionRows,
    runtimeRows
  });
  let action: TraversalContinuationAction;
  let retryEligible = false;
  let terminal = true;
  let reason = "traversal_non_progress";
  if (outcome.kind === "suspend") {
    action = "yield_same_edge_continuation";
    terminal = false;
    reason = "progress_observed_without_result";
  } else if (outcome.kind === "redispatch") {
    action = "retry_same_edge";
    retryEligible = true;
    terminal = false;
    reason = "retryable_traversal_non_progress";
  } else if (policyReprice && outcome.reEntryPoint !== null) {
    action = "reprice_runtime_policy";
    reason = "runtime_policy_contradiction";
  } else if (inspectArchive) {
    action = "inspect_runtime_archive";
    reason = inspectReason ?? "missing_process_evidence";
  } else if (outcome.reason === "retry_exhausted") {
    action = "retry_exhausted";
    reason = budget.stationary ? "stationary_retry" : "retry_budget_exhausted";
  } else {
    action = "blocked";
    reason = "runtime_failure_class_not_retryable";
  }

  const reasonRefs = uniqueNonEmptyStrings([
    input.carrier.carrierRef,
    input.carrier.runtimeFailureClass,
    ...retryableRuntimeFailureClasses
  ]);
  const projectionRef = [
    "traversal_continuation_action",
    input.basis.id,
    String(input.carrier.vectorIndex),
    input.carrier.actorInvocationId,
    action
  ].join(":");
  assertNonEmptyString(projectionRef, "projectionRef");

  return Object.freeze({
    kind: "traversal_continuation_action_projection",
    projectionRef,
    sourceCarrierRef: input.carrier.carrierRef,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    graphCallId: input.carrier.graphCallId,
    frameId: input.carrier.frameId,
    frameLineageId: input.basis.frameLineageId,
    vectorIndex: input.carrier.vectorIndex,
    edge: input.carrier.edge,
    actorInvocationId: input.carrier.actorInvocationId,
    action,
    publicSummaryAction: action,
    retryEligible,
    terminal,
    runtimeFailureClass: input.carrier.runtimeFailureClass,
    retryBudget: budget,
    reason,
    reasonRefs,
    evidenceRefs: input.carrier.evidenceRefs
  } satisfies TraversalContinuationActionProjection);
}

export function deriveTraversalContinuationSummary(
  projection: TraversalContinuationActionProjection
): TraversalContinuationSummary {
  return Object.freeze({
    kind: "traversal_continuation_summary",
    action: projection.publicSummaryAction,
    retryEligible: projection.retryEligible,
    terminal: projection.terminal,
    reason: projection.reason,
    evidenceRefs: projection.evidenceRefs
  } satisfies TraversalContinuationSummary);
}

export function assertTraversalContinuationSummaryAgreement(input: {
  readonly projection: TraversalContinuationActionProjection;
  readonly summary: TraversalContinuationSummary;
}): void {
  if (input.summary.action !== input.projection.publicSummaryAction) {
    throw new TypeError("Traversal continuation summary action drift");
  }
  if (input.summary.retryEligible !== input.projection.retryEligible) {
    throw new TypeError("Traversal continuation summary retry eligibility drift");
  }
  if (input.summary.terminal !== input.projection.terminal) {
    throw new TypeError("Traversal continuation summary terminality drift");
  }
  if (input.summary.reason !== input.projection.reason) {
    throw new TypeError("Traversal continuation summary reason drift");
  }
}
