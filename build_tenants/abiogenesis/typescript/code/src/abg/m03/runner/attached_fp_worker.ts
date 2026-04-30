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
  TerminalKind
} from "../contracts/carriers.js";
import type { FpDispatchOutcome } from "../contracts/plugins.js";
import type { FpTransformRequest, FpTransformResult } from "../contracts/index.js";
import {
  admitFpTransformResultForRequest,
  constructRetryProgressRecordedEvent,
  constructFpTransformResult,
  deriveRetryRepairDecision,
  runtimeEventsForFpTransformResult,
  runtimeEventsForRetryRepairDecision
} from "../contracts/index.js";
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

export interface AttachedFpResultAcceptedDecision {
  readonly kind: "accepted";
  readonly dispatchRequest: DispatchRequest;
  readonly artifact: ResultArtifact;
  readonly payloadEvents: readonly RuntimeEvent[];
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
  | AttachedFpResultAcceptedDecision
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
  transition: FpDispatchTransition
): DispatchRequest {
  const request = dispatchRequestsForTransition(transition)[0];
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
      evidenceCandidates: evidenceCandidatesForArtifact({
        transformRequest: input.transformRequest,
        artifact: input.artifact
      })
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

function payloadEventsForAcceptedResult(input: {
  readonly basis: ExecutionBasis;
  readonly transformRequest: FpTransformRequest;
  readonly artifact: ResultArtifact;
}): readonly RuntimeEvent[] {
  return runtimeEventsForFpTransformResult({
    basis: input.basis,
    request: input.transformRequest,
    result: scopedTransformResult({
      transformRequest: input.transformRequest,
      artifact: input.artifact,
      status: "returned"
    })
  });
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
  if (input.outcome.attachedResultArtifact === null) {
    throw new TypeError("attached F_P result decision requires an attached artifact");
  }
  try {
    return admitResultArtifact(
      input.request,
      input.outcome.attachedResultArtifact,
      "FpDispatchOutcome.attachedResultArtifact"
    );
  } catch (error) {
    return constructResultArtifact({
      basisId: input.request.basisId,
      dispatchRef: input.request.dispatchRef,
      resultRef: input.request.resultRef,
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
  readonly transition: FpDispatchTransition;
  readonly request: DispatchRequest;
  readonly outcome: FpDispatchOutcome;
  readonly maxAttempts: number;
}): RetryRepairDecision {
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
    maxAttempts: input.maxAttempts,
    stationary: false,
    escalationSubjectRef: input.basis.resolvedPolicy.approvalSubjectRef,
    continuationRepair: continuationRepairForRetry({
      basis: input.basis,
      projection: input.projection,
      vectorIndex: input.transition.vectorIndex
    })
  });
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

export function deriveAttachedFpResultDecision(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly transition: FpDispatchTransition;
  readonly outcome: FpDispatchOutcome;
  readonly transformRequest: FpTransformRequest;
  readonly maxAttempts?: number | undefined;
}): AttachedFpResultDecision {
  const request = dispatchRequestForTransition(input.transition);
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
      kind: "accepted",
      dispatchRequest: request,
      artifact,
      payloadEvents: payloadEventsForAcceptedResult({
        basis: input.basis,
        artifact,
        transformRequest: input.transformRequest
      })
    });
  }

  const retryDecision = retryDecisionForBlockedResult({
    basis: input.basis,
    projection: input.projection,
    transition: input.transition,
    request,
    outcome: input.outcome,
    maxAttempts: input.maxAttempts ?? DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS
  });
  const retryEvents = retryEventsForBlockedResult({
    retryDecision,
    progressSignalRefs: blocked.progressSignalRefs
  });

  switch (retryDecision.kind) {
    case "retry_planned":
      return Object.freeze({
        kind: "retry_planned",
        dispatchRequest: request,
        artifact: blocked.artifact,
        retryDecision,
        retryEvents,
        reason: blocked.reason
      });
    case "retry_stopped":
      return Object.freeze({
        kind: "retry_stopped",
        dispatchRequest: request,
        artifact: blocked.artifact,
        retryDecision,
        retryEvents,
        terminalKind: "gap_stop",
        reason: retryDecision.reason
      });
    case "retry_escalated":
      return Object.freeze({
        kind: "retry_escalated",
        dispatchRequest: request,
        artifact: blocked.artifact,
        retryDecision,
        retryEvents,
        terminalKind: "yielded",
        reason: retryDecision.gateReason
      });
    default: {
      const exhaustive: never = retryDecision;
      throw new TypeError(
        `Unsupported retry decision ${JSON.stringify(exhaustive)}`
      );
    }
  }
}
