// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-RETRY
// Implements: REQ-R-ABG3-CONVERGENCE

import type {
  ExecutionBasis,
  FpDispatchTransition,
  RetryRepairDecision,
  RuntimeAggregateProjection,
  RuntimeEvent,
  RuntimeFailureClass,
  TerminalKind
} from "../contracts/carriers.js";
import type { FpDispatchOutcome } from "../contracts/plugins.js";
import type {
  FpTransformRequest,
  FpTransformResult,
  IterationOutcome
} from "../contracts/index.js";
import {
  admitFpTransformResultForRequest,
  constructRetryProgressRecordedEvent,
  constructFpTransformResult,
  deriveFreshRetryContextProjection,
  deriveIterationOutcomeFromRows,
  deriveRetryRepairDecision,
  RETRYABLE_RUNTIME_FAILURE_CLASSES,
  runtimeEventsForRetryRepairDecision
} from "../contracts/index.js";
import type { IJsonValue } from "../../../shared/runtime_identity.js";
import {
  admitResultArtifact,
  constructResultArtifact,
  dispatchRequestsForTransition,
  ingestResultArtifact,
  type DispatchRequest,
  type ResultArtifact,
  type ResultIngestOutcome
} from "../transport/index.js";

export const DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS = 3;

export interface AttachedFpTargetAdmissionRequiredDecision {
  readonly kind: "target_admission_required";
  readonly dispatchRequest: DispatchRequest;
  readonly artifact: ResultArtifact;
  readonly targetValueCandidate: IJsonValue;
  readonly reason: string;
}

export interface AttachedFpResultRetryPlannedDecision {
  readonly kind: "retry_planned";
  readonly dispatchRequest: DispatchRequest;
  readonly artifact: ResultArtifact;
  readonly retryDecision: Extract<RetryRepairDecision, { readonly kind: "retry_planned" }>;
  readonly retryEvents: readonly RuntimeEvent[];
  readonly reason: string;
}

export interface AttachedFpResultRetryStoppedDecision {
  readonly kind: "retry_stopped";
  readonly dispatchRequest: DispatchRequest;
  readonly artifact: ResultArtifact;
  readonly retryDecision: Extract<RetryRepairDecision, { readonly kind: "retry_stopped" }>;
  readonly retryEvents: readonly RuntimeEvent[];
  readonly terminalKind: TerminalKind;
  readonly reason: string;
}

export interface AttachedFpResultRetryEscalatedDecision {
  readonly kind: "retry_escalated";
  readonly dispatchRequest: DispatchRequest;
  readonly artifact: ResultArtifact;
  readonly retryDecision: Extract<RetryRepairDecision, { readonly kind: "retry_escalated" }>;
  readonly retryEvents: readonly RuntimeEvent[];
  readonly terminalKind: TerminalKind;
  readonly reason: string;
}

export type AttachedFpResultDecision =
  | AttachedFpTargetAdmissionRequiredDecision
  | AttachedFpResultRetryPlannedDecision
  | AttachedFpResultRetryStoppedDecision
  | AttachedFpResultRetryEscalatedDecision;

interface BlockedAttachedResult {
  readonly artifact: ResultArtifact;
  readonly transformResult: FpTransformResult;
  readonly reason: string;
  readonly progressSignalRefs: readonly string[];
}

function dispatchRequestForTransition(
  transition: FpDispatchTransition,
  transformRequest: FpTransformRequest
): DispatchRequest {
  const request = dispatchRequestsForTransition(
    transition,
    transformRequest.selectedResultContractRef
  )[0];
  if (request === undefined) {
    throw new TypeError("attached F_P loop requires a dispatch request");
  }
  return request;
}

function candidateRetryManifestId(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
}): string {
  const attemptIndex =
    input.projection.retryAttemptRefs.filter(
      (attempt) => attempt.vectorIndex === input.vectorIndex
    ).length + 1;
  return `manifest:fp_retry:${JSON.stringify({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    attemptIndex
  })}`;
}

function continuationRepairForRetry(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
}) {
  const observedAttemptCount = input.projection.retryAttemptRefs.filter(
    (attempt) => attempt.vectorIndex === input.vectorIndex
  ).length;
  const prefix = `continuation:${input.basis.id}:${input.vectorIndex}`;
  return Object.freeze({
    terminatedContinuationId: `${prefix}:attempt:${observedAttemptCount}`,
    reopenedContinuationId: `${prefix}:attempt:${observedAttemptCount + 1}`
  });
}

function evidenceCandidatesForArtifact(input: {
  readonly transformRequest: FpTransformRequest;
  readonly artifact: ResultArtifact;
}): readonly {
  readonly candidateRef: string;
  readonly authorityRef: string;
  readonly evidenceRefs: readonly string[];
  readonly providerRefs: readonly string[];
  readonly payloadClass: string;
  readonly contractRef: string;
  readonly complete: boolean;
  readonly shallow: boolean;
}[] {
  const payload = input.artifact.artifactPayload;
  if (payload === null) {
    return Object.freeze([]);
  }
  return Object.freeze(
    payload.fulfillmentAssessments.map((assessment) =>
      Object.freeze({
        candidateRef: assessment.id,
        authorityRef: assessment.id,
        evidenceRefs: assessment.evidenceRefs,
        providerRefs: [
          payload.workerId ?? input.transformRequest.workerId,
          payload.backendId ?? input.transformRequest.backendId
        ],
        payloadClass: "evidence",
        contractRef: "contract://abg/fp-transform-evidence",
        complete:
          assessment.fulfillmentStatus === "fulfilled" &&
          assessment.evidenceRefs.length > 0,
        shallow: assessment.fulfillmentStatus !== "fulfilled"
      })
    )
  );
}

/*
 * F_P worker output is transform evidence, not closure authority. The attached
 * worker path uses fulfillment_status/blocking_reasons only to choose the
 * per-vector accepted-or-retry branch; convergence remains guarded by the ABG
 * assurance fold over projected authority/evidence ledgers.
 */
function scopedTransformResult(input: {
  readonly transformRequest: FpTransformRequest;
  readonly artifact: ResultArtifact;
  readonly status: FpTransformResult["status"];
  readonly reason?: string | null;
}): FpTransformResult {
  return admitFpTransformResultForRequest(
    input.transformRequest,
    constructFpTransformResult({
      request: input.transformRequest,
      resultRef: input.artifact.resultRef,
      artifactRef: input.artifact.resultRef,
      status: input.status,
      reason: input.reason ?? null,
      evidenceCandidates:
        input.status === "returned" || input.status === "blocked"
          ? evidenceCandidatesForArtifact({
              transformRequest: input.transformRequest,
              artifact: input.artifact
            })
          : Object.freeze([])
    })
  );
}

function progressSignalRefsForTransformResult(
  result: FpTransformResult
): readonly string[] {
  const refs: string[] = [
    `fp_transform_status:${result.status}:${result.reason ?? "no detail"}`
  ];
  switch (result.status) {
    case "returned":
      break;
    case "blocked":
      for (const candidate of result.evidenceCandidates) {
        refs.push(
          `blocking_reason:${candidate.candidateRef}:${result.reason ?? "blocked"}`
        );
        refs.push(...candidate.evidenceRefs);
      }
      break;
    case "runtime_failed":
      refs.push(`runtime_failure:${result.reason ?? "runtime failed"}`);
      break;
    case "contract_failed":
      refs.push(`payload_contract_failure:${result.reason ?? "contract failed"}`);
      break;
    default: {
      const exhaustive: never = result.status;
      throw new TypeError(`Unsupported F_P transform status ${exhaustive}`);
    }
  }
  return Object.freeze(refs);
}

function progressSignalRefsForBlockedResult(input: {
  readonly reason: string;
  readonly transformResult: FpTransformResult;
}): readonly string[] {
  const refs = progressSignalRefsForTransformResult(input.transformResult);
  if (refs.length === 0) {
    return Object.freeze([`blocked:${input.reason}`]);
  }
  return refs;
}

function errorDetail(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function admitAttachedResultArtifact(input: {
  readonly request: DispatchRequest;
  readonly outcome: FpDispatchOutcome;
}): ResultArtifact {
  if (input.outcome.status !== "dispatched") {
    throw new TypeError("attached F_P result decision requires dispatched output");
  }
  try {
    return admitResultArtifact(
      input.request,
      input.outcome.resultArtifactCandidate,
      "FpDispatchOutcome.resultArtifactCandidate"
    );
  } catch (error) {
    return constructResultArtifact({
      basisId: input.request.basisId,
      dispatchRef: input.request.dispatchRef,
      resultRef: input.request.resultRef,
      resultContractRef: input.request.selectedResultContractRef,
      artifactPayload: null,
      identityIssues: [],
      runtimeFailure: {
        failureClass: "payload_contract_failure",
        detail: errorDetail(error)
      }
    });
  }
}

function blockedResultFromIngestOutcome(
  input: {
    readonly transformRequest: FpTransformRequest;
    readonly outcome: ResultIngestOutcome;
  }
): BlockedAttachedResult | null {
  switch (input.outcome.kind) {
    case "accepted": {
      const payload = input.outcome.artifact.artifactPayload;
      if (payload === null) {
        const transformResult = scopedTransformResult({
          transformRequest: input.transformRequest,
          artifact: input.outcome.artifact,
          status: "contract_failed",
          reason: "accepted artifact has no fulfillment payload"
        });
        return Object.freeze({
          artifact: input.outcome.artifact,
          transformResult,
          reason: "accepted artifact has no fulfillment payload",
          progressSignalRefs: progressSignalRefsForBlockedResult({
            reason: "accepted artifact has no fulfillment payload",
            transformResult
          })
        });
      }
      const blockedAssessments = payload.fulfillmentAssessments.filter(
        (assessment) => assessment.fulfillmentStatus !== "fulfilled"
      );
      if (blockedAssessments.length === 0) {
        return null;
      }
      const reason = blockedAssessments
        .map(
          (assessment) =>
            `${assessment.id}:${assessment.fulfillmentStatus}:${assessment.fulfillmentDetail}:` +
            assessment.blockingReasons.join(",")
        )
        .join("; ");
      const transformResult = scopedTransformResult({
        transformRequest: input.transformRequest,
        artifact: input.outcome.artifact,
        status: "blocked",
        reason
      });
      return Object.freeze({
        artifact: input.outcome.artifact,
        transformResult,
        reason,
        progressSignalRefs: progressSignalRefsForBlockedResult({
          reason,
          transformResult
        })
      });
    }
    case "rejected": {
      const transformResult = scopedTransformResult({
        transformRequest: input.transformRequest,
        artifact: input.outcome.artifact,
        status: "contract_failed",
        reason: input.outcome.detail
      });
      return Object.freeze({
        artifact: input.outcome.artifact,
        transformResult,
        reason: input.outcome.detail,
        progressSignalRefs: progressSignalRefsForBlockedResult({
          reason: input.outcome.detail,
          transformResult
        })
      });
    }
    case "runtime_failure": {
      const reason = `${input.outcome.failureClass}: ${input.outcome.detail}`;
      const transformResult = scopedTransformResult({
        transformRequest: input.transformRequest,
        artifact: input.outcome.artifact,
        status: "runtime_failed",
        reason
      });
      return Object.freeze({
        artifact: input.outcome.artifact,
        transformResult,
        reason,
        progressSignalRefs: progressSignalRefsForBlockedResult({
          reason,
          transformResult
        })
      });
    }
    default: {
      const exhaustive: never = input.outcome;
      throw new TypeError(
        `Unsupported attached F_P ingest outcome ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function retryDecisionForBlockedResult(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly transition: FpDispatchTransition;
  readonly request: DispatchRequest;
  readonly transformRequest: FpTransformRequest;
  readonly outcome: FpDispatchOutcome;
  readonly retryable: boolean;
  readonly maxAttempts: number;
}): RetryRepairDecision {
  const retryContext = deriveFreshRetryContextProjection({
    basis: input.basis,
    runtimeProjection: input.projection,
    events: input.replayEvents,
    vectorIndex: input.transition.vectorIndex,
    suppliedFrontierRef: input.transformRequest.retryFrontierRef
  });
  if (retryContext.status !== "fresh") {
    throw new TypeError(
      `Retry repair rejects ${retryContext.status}: ${retryContext.reason ?? "retry context is not fresh"}`
    );
  }
  return deriveRetryRepairDecision({
    basis: input.basis,
    projection: input.projection,
    failedVectorIndex: input.transition.vectorIndex,
    priorManifestId: input.outcome.resultRef ?? input.request.resultRef,
    candidateManifestId: candidateRetryManifestId({
      basis: input.basis,
      projection: input.projection,
      vectorIndex: input.transition.vectorIndex
    }),
    maxAttempts: input.retryable ? input.maxAttempts : 0,
    stationary: false,
    escalationSubjectRef: input.basis.resolvedPolicy.approvalSubjectRef,
    continuationRepair: continuationRepairForRetry({
      basis: input.basis,
      projection: input.projection,
      vectorIndex: input.transition.vectorIndex
    })
  });
}

function runtimeFailureClassIsRetryable(
  failureClass: RuntimeFailureClass
): boolean {
  return RETRYABLE_RUNTIME_FAILURE_CLASSES.some(
    (candidate) => candidate === failureClass
  );
}

function retryEventsForBlockedResult(input: {
  readonly retryDecision: RetryRepairDecision;
  readonly progressSignalRefs: readonly string[];
}): readonly RuntimeEvent[] {
  const retryEvents = runtimeEventsForRetryRepairDecision(input.retryDecision);
  if (input.retryDecision.kind !== "retry_planned") {
    return retryEvents;
  }
  return Object.freeze([
    ...retryEvents,
    constructRetryProgressRecordedEvent({
      decision: input.retryDecision,
      progressSignalRefs: input.progressSignalRefs,
      stationary: false
    })
  ]);
}

function deriveBlockedResultFoldOutcome(input: {
  readonly vectorIndex: number;
  readonly retryDecision: RetryRepairDecision;
  readonly retryableRuntime: boolean;
  readonly evidenceRefs: readonly string[];
}): IterationOutcome {
  if (input.retryDecision.kind === "retry_escalated") {
    return deriveIterationOutcomeFromRows({
      vectorIndex: input.vectorIndex,
      runtimeRows: [
        {
          boundary: "worker",
          status: "handoff",
          reason: null,
          retryable: false,
          evidenceRefs: input.evidenceRefs
        }
      ]
    });
  }

  return deriveIterationOutcomeFromRows({
    vectorIndex: input.vectorIndex,
    runtimeRows: [
      {
        boundary: "worker",
        status: "failed",
        reason:
          input.retryDecision.kind === "retry_stopped" && input.retryableRuntime
            ? "retry_exhausted"
            : "runtime_failure",
        retryable:
          input.retryDecision.kind === "retry_planned" && input.retryableRuntime,
        evidenceRefs: input.evidenceRefs
      }
    ]
  });
}

function assertBlockedResultFoldAgreement(input: {
  readonly retryDecision: RetryRepairDecision;
  readonly outcome: IterationOutcome;
}): void {
  if (input.retryDecision.kind === "retry_planned") {
    if (input.outcome.kind !== "redispatch") {
      throw new TypeError(
        "Attached F_P blocked-result retry decision drifted from iteration fold"
      );
    }
    return;
  }

  if (input.retryDecision.kind === "retry_escalated") {
    if (input.outcome.kind !== "suspend") {
      throw new TypeError(
        "Attached F_P blocked-result escalation drifted from iteration fold"
      );
    }
    return;
  }

  if (
    input.outcome.kind !== "terminate" ||
    input.outcome.disposition !== "blocked"
  ) {
    throw new TypeError(
      "Attached F_P blocked-result terminal decision drifted from iteration fold"
    );
  }
}

export function deriveAttachedFpResultDecision(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly transition: FpDispatchTransition;
  readonly outcome: FpDispatchOutcome;
  readonly transformRequest: FpTransformRequest;
  readonly maxAttempts?: number | undefined;
}): AttachedFpResultDecision {
  if (input.outcome.status !== "dispatched") {
    throw new TypeError(
      "attached F_P result decision requires a dispatched outcome"
    );
  }
  const request = dispatchRequestForTransition(
    input.transition,
    input.transformRequest
  );
  const artifact = admitAttachedResultArtifact({
    request,
    outcome: input.outcome
  });
  const ingestOutcome = ingestResultArtifact(request, artifact);
  const blocked = blockedResultFromIngestOutcome({
    transformRequest: input.transformRequest,
    outcome: ingestOutcome
  });
  if (blocked === null) {
    return Object.freeze({
      kind: "target_admission_required",
      dispatchRequest: request,
      artifact,
      targetValueCandidate: input.outcome.targetValueCandidate,
      reason:
        "target_value_candidate requires exact T-255/T-270 schema admission before traversal may advance"
    });
  }

  const retryableRuntime =
    ingestOutcome.kind !== "runtime_failure" ||
    runtimeFailureClassIsRetryable(ingestOutcome.failureClass);
  const retryDecision = retryDecisionForBlockedResult({
    basis: input.basis,
    projection: input.projection,
    replayEvents: input.replayEvents,
    transition: input.transition,
    request,
    transformRequest: input.transformRequest,
    outcome: input.outcome,
    retryable: retryableRuntime,
    maxAttempts: input.maxAttempts ?? DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS
  });
  const blockedOutcome = deriveBlockedResultFoldOutcome({
    vectorIndex: input.transition.vectorIndex,
    retryDecision,
    retryableRuntime,
    evidenceRefs: [
      blocked.reason,
      blocked.artifact.resultRef,
      ...blocked.progressSignalRefs
    ]
  });
  assertBlockedResultFoldAgreement({
    retryDecision,
    outcome: blockedOutcome
  });
  const retryEvents = retryEventsForBlockedResult({
    retryDecision,
    progressSignalRefs: blocked.progressSignalRefs
  });

  if (blockedOutcome.kind === "redispatch") {
    if (retryDecision.kind !== "retry_planned") {
      throw new TypeError(
        "Attached F_P redispatch fold outcome requires a retry_planned decision"
      );
    }
    return Object.freeze({
      kind: "retry_planned",
      dispatchRequest: request,
      artifact: blocked.artifact,
      retryDecision,
      retryEvents,
      reason: blocked.reason
    });
  }

  if (blockedOutcome.kind === "suspend") {
    if (retryDecision.kind !== "retry_escalated") {
      throw new TypeError(
        "Attached F_P suspend fold outcome requires a retry_escalated decision"
      );
    }
    return Object.freeze({
      kind: "retry_escalated",
      dispatchRequest: request,
      artifact: blocked.artifact,
      retryDecision,
      retryEvents,
      terminalKind: "yielded",
      reason: retryDecision.gateReason
    });
  }

  if (blockedOutcome.kind === "terminate" && blockedOutcome.disposition === "blocked") {
    if (retryDecision.kind !== "retry_stopped") {
      throw new TypeError(
        "Attached F_P blocked fold outcome requires a retry_stopped decision"
      );
    }
    return Object.freeze({
      kind: "retry_stopped",
      dispatchRequest: request,
      artifact: blocked.artifact,
      retryDecision,
      retryEvents,
      terminalKind: "gap_stop",
      reason:
        ingestOutcome.kind === "runtime_failure" &&
        !runtimeFailureClassIsRetryable(ingestOutcome.failureClass)
          ? blocked.reason
          : retryDecision.reason
    });
  }

  throw new TypeError(
    `Unsupported attached F_P fold outcome ${JSON.stringify(blockedOutcome)}`
  );
}
