import type {
  ContinuationReopenedEvent,
  ContinuationRepairLink,
  ContinuationTerminatedEvent,
  ExecutionBasis,
  RetryAttemptEscalatedEvent,
  RetryAttemptOpenedEvent,
  RetryAttemptStoppedEvent,
  RetryBudgetState,
  RetryProgressRecordedEvent,
  RetryRepairDecision,
  RetryRepairEscalatedDecision,
  RetryRepairPlannedDecision,
  RetryRepairPlannedEvent,
  RetryRepairStoppedDecision,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "./carriers.js";
import {
  countRetryAttemptsForVector,
  manifestSeenInProjection,
  sourceProjectionRef
} from "./projection.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger,
  assertProjectionBasis,
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";

export interface RetryRepairDecisionInput {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly failedVectorIndex: number;
  readonly priorManifestId: string;
  readonly candidateManifestId: string;
  readonly maxAttempts: number;
  readonly observedAttemptCount?: number;
  readonly stationary: boolean;
  readonly escalationSubjectRef?: string | null;
  readonly continuationRepair?: ContinuationRepairLink | null;
}

function constructRetryBudgetState(input: {
  readonly observedAttemptCount: number;
  readonly maxAttempts: number;
  readonly stationary: boolean;
}): RetryBudgetState {
  assertNonNegativeInteger(input.observedAttemptCount, "observedAttemptCount");
  assertNonNegativeInteger(input.maxAttempts, "maxAttempts");
  return Object.freeze({
    observedAttemptCount: input.observedAttemptCount,
    maxAttempts: input.maxAttempts,
    remainingAttempts: Math.max(
      input.maxAttempts - input.observedAttemptCount,
      0
    ),
    stationary: input.stationary
  });
}

function normalizeContinuationRepair(
  continuationRepair: ContinuationRepairLink | null | undefined
): ContinuationRepairLink | null {
  if (continuationRepair === undefined || continuationRepair === null) {
    return null;
  }
  assertNonEmptyString(
    continuationRepair.terminatedContinuationId,
    "ContinuationRepairLink.terminatedContinuationId"
  );
  assertNonEmptyString(
    continuationRepair.reopenedContinuationId,
    "ContinuationRepairLink.reopenedContinuationId"
  );
  if (
    continuationRepair.terminatedContinuationId ===
    continuationRepair.reopenedContinuationId
  ) {
    throw new TypeError("Continuation repair must open a fresh continuation");
  }
  return Object.freeze({
    terminatedContinuationId: continuationRepair.terminatedContinuationId,
    reopenedContinuationId: continuationRepair.reopenedContinuationId
  });
}

export function deriveRetryRepairDecision(
  input: RetryRepairDecisionInput
): RetryRepairDecision {
  assertProjectionBasis(input.basis, input.projection, "RetryRepairDecision");
  assertVectorIndexInRange(input.basis, input.failedVectorIndex);
  assertNonEmptyString(input.priorManifestId, "priorManifestId");
  assertNonEmptyString(input.candidateManifestId, "candidateManifestId");
  if (
    input.candidateManifestId === input.priorManifestId ||
    manifestSeenInProjection(input.projection, input.candidateManifestId)
  ) {
    throw new TypeError(
      "RetryRepairDecision rejects stale manifest redispatch as current truth"
    );
  }

  const replayAttemptCount = countRetryAttemptsForVector(
    input.projection,
    input.failedVectorIndex
  );
  if (
    input.observedAttemptCount !== undefined &&
    input.observedAttemptCount !== replayAttemptCount
  ) {
    throw new TypeError(
      "RetryRepairDecision rejects caller-local retry count drift"
    );
  }
  const observedAttemptCount = replayAttemptCount;
  const budget = constructRetryBudgetState({
    observedAttemptCount,
    maxAttempts: input.maxAttempts,
    stationary: input.stationary
  });
  const edge = vectorEdge(input.basis, input.failedVectorIndex);

  if (observedAttemptCount >= input.maxAttempts || input.stationary) {
    const reason = input.stationary
      ? "stationary_retry"
      : "retry_budget_exhausted";
    const escalationSubjectRef = input.escalationSubjectRef ?? null;
    if (escalationSubjectRef !== null) {
      assertNonEmptyString(escalationSubjectRef, "escalationSubjectRef");
      return Object.freeze({
        kind: "retry_escalated",
        basis: input.basis,
        vectorIndex: input.failedVectorIndex,
        edge,
        budget,
        approvalSubjectRef: escalationSubjectRef,
        gateReason: reason
      } satisfies RetryRepairEscalatedDecision);
    }
    return Object.freeze({
      kind: "retry_stopped",
      basis: input.basis,
      vectorIndex: input.failedVectorIndex,
      edge,
      budget,
      reason
    } satisfies RetryRepairStoppedDecision);
  }

  const attemptIndex = observedAttemptCount + 1;
  const projectionRef = sourceProjectionRef(input.projection);
  const retryRunId = `${input.basis.runId ?? `run:${input.basis.id}`}:retry:${attemptIndex}`;
  const retryCallId = `${input.projection.graphCallId ?? graphCallIdForBasis(input.basis)}:retry:${attemptIndex}`;

  return Object.freeze({
    kind: "retry_planned",
    basis: input.basis,
    vectorIndex: input.failedVectorIndex,
    edge,
    attempt: Object.freeze({
      runId: retryRunId,
      callId: retryCallId,
      manifestId: input.candidateManifestId,
      attemptIndex
    }),
    budget,
    promptRegeneration: Object.freeze({
      workspaceRoot: input.basis.workspaceRoot,
      basisId: input.basis.id,
      graphFunctionId: input.basis.graphFunction.id,
      vectorIndex: input.failedVectorIndex,
      edge,
      sourceProjectionRef: projectionRef
    }),
    manifestRegeneration: Object.freeze({
      priorManifestId: input.priorManifestId,
      currentManifestId: input.candidateManifestId,
      sourceProjectionRef: projectionRef
    }),
    continuationRepair: normalizeContinuationRepair(input.continuationRepair)
  } satisfies RetryRepairPlannedDecision);
}

export function constructRetryRepairPlannedEvent(
  decision: RetryRepairPlannedDecision
): RetryRepairPlannedEvent {
  return Object.freeze({
    kind: "retry_repair_planned",
    basisId: decision.basis.id,
    graphCallId: decision.attempt.callId,
    frameId: frameIdForBasis(decision.basis),
    vectorIndex: decision.vectorIndex,
    edge: decision.edge,
    retryRunId: decision.attempt.runId,
    retryCallId: decision.attempt.callId,
    manifestId: decision.attempt.manifestId,
    priorManifestId: decision.manifestRegeneration.priorManifestId,
    sourceProjectionRef: decision.manifestRegeneration.sourceProjectionRef,
    attemptIndex: decision.attempt.attemptIndex,
    maxAttempts: decision.budget.maxAttempts
  });
}

export function constructRetryAttemptOpenedEvent(
  decision: RetryRepairPlannedDecision
): RetryAttemptOpenedEvent {
  return Object.freeze({
    kind: "retry_attempt_opened",
    basisId: decision.basis.id,
    graphCallId: decision.attempt.callId,
    frameId: frameIdForBasis(decision.basis),
    vectorIndex: decision.vectorIndex,
    edge: decision.edge,
    retryRunId: decision.attempt.runId,
    retryCallId: decision.attempt.callId,
    manifestId: decision.attempt.manifestId
  });
}

export function constructRetryAttemptStoppedEvent(
  decision: RetryRepairStoppedDecision
): RetryAttemptStoppedEvent {
  return Object.freeze({
    kind: "retry_attempt_stopped",
    basisId: decision.basis.id,
    graphCallId: graphCallIdForBasis(decision.basis),
    frameId: frameIdForBasis(decision.basis),
    vectorIndex: decision.vectorIndex,
    edge: decision.edge,
    reason: decision.reason,
    observedAttemptCount: decision.budget.observedAttemptCount,
    maxAttempts: decision.budget.maxAttempts
  });
}

export function constructRetryAttemptEscalatedEvent(
  decision: RetryRepairEscalatedDecision
): RetryAttemptEscalatedEvent {
  return Object.freeze({
    kind: "retry_attempt_escalated",
    basisId: decision.basis.id,
    graphCallId: graphCallIdForBasis(decision.basis),
    frameId: frameIdForBasis(decision.basis),
    vectorIndex: decision.vectorIndex,
    edge: decision.edge,
    approvalSubjectRef: decision.approvalSubjectRef,
    gateReason: decision.gateReason,
    observedAttemptCount: decision.budget.observedAttemptCount,
    maxAttempts: decision.budget.maxAttempts
  });
}

export function constructRetryProgressRecordedEvent(input: {
  readonly decision: RetryRepairPlannedDecision;
  readonly progressSignalRefs: readonly string[];
  readonly stationary: boolean;
}): RetryProgressRecordedEvent {
  for (const [index, signalRef] of input.progressSignalRefs.entries()) {
    assertNonEmptyString(signalRef, `progressSignalRefs[${index}]`);
  }
  return Object.freeze({
    kind: "retry_progress_recorded",
    basisId: input.decision.basis.id,
    graphCallId: input.decision.attempt.callId,
    frameId: frameIdForBasis(input.decision.basis),
    vectorIndex: input.decision.vectorIndex,
    edge: input.decision.edge,
    retryRunId: input.decision.attempt.runId,
    progressSignalRefs: freezeStringArray(input.progressSignalRefs),
    stationary: input.stationary
  });
}

export function constructContinuationTerminatedEvent(
  decision: RetryRepairPlannedDecision
): ContinuationTerminatedEvent {
  if (decision.continuationRepair === null) {
    throw new TypeError("ContinuationTerminatedEvent requires continuation repair");
  }
  return Object.freeze({
    kind: "continuation_terminated",
    basisId: decision.basis.id,
    graphCallId: decision.attempt.callId,
    frameId: frameIdForBasis(decision.basis),
    vectorIndex: decision.vectorIndex,
    edge: decision.edge,
    continuationId: decision.continuationRepair.terminatedContinuationId,
    causedByRetryRunId: decision.attempt.runId,
    reason: "retry_repair"
  });
}

export function constructContinuationReopenedEvent(
  decision: RetryRepairPlannedDecision
): ContinuationReopenedEvent {
  if (decision.continuationRepair === null) {
    throw new TypeError("ContinuationReopenedEvent requires continuation repair");
  }
  return Object.freeze({
    kind: "continuation_reopened",
    basisId: decision.basis.id,
    graphCallId: decision.attempt.callId,
    frameId: frameIdForBasis(decision.basis),
    vectorIndex: decision.vectorIndex,
    edge: decision.edge,
    continuationId: decision.continuationRepair.reopenedContinuationId,
    closedContinuationId: decision.continuationRepair.terminatedContinuationId,
    causedByRetryRunId: decision.attempt.runId
  });
}

export function runtimeEventsForRetryRepairDecision(
  decision: RetryRepairDecision
): readonly RuntimeEvent[] {
  switch (decision.kind) {
    case "retry_planned":
      return Object.freeze([
        constructRetryRepairPlannedEvent(decision),
        constructRetryAttemptOpenedEvent(decision),
        ...(decision.continuationRepair === null
          ? []
          : [
              constructContinuationTerminatedEvent(decision),
              constructContinuationReopenedEvent(decision)
            ])
      ]);
    case "retry_stopped":
      return Object.freeze([constructRetryAttemptStoppedEvent(decision)]);
    case "retry_escalated":
      return Object.freeze([constructRetryAttemptEscalatedEvent(decision)]);
    default: {
      const exhaustive: never = decision;
      throw new TypeError(
        `Unsupported retry repair decision ${JSON.stringify(exhaustive)}`
      );
    }
  }
}
