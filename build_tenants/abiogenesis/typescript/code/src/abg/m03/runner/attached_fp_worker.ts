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
import {
  constructAuthoritySnapshotAdmittedEvent,
  constructEvidenceAdmittedEvent,
  constructPayloadObservedEvent,
  constructPayloadValidatedEvent,
  constructRetryProgressRecordedEvent,
  deriveRetryRepairDecision,
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

function payloadRefForAssessment(input: {
  readonly request: DispatchRequest;
  readonly assessmentId: string;
  readonly evidenceRef: string;
}): string {
  return `payload:fp_result:${JSON.stringify({
    basisId: input.request.basisId,
    dispatchRef: input.request.dispatchRef,
    resultRef: input.request.resultRef,
    assessmentId: input.assessmentId,
    evidenceRef: input.evidenceRef
  })}`;
}

function digestForAssessment(input: {
  readonly request: DispatchRequest;
  readonly assessmentId: string;
  readonly evidenceRef: string;
}): string {
  return `digest:fp_result:${JSON.stringify({
    resultRef: input.request.resultRef,
    assessmentId: input.assessmentId,
    evidenceRef: input.evidenceRef
  })}`;
}

function payloadEventsForAcceptedResult(input: {
  readonly basis: ExecutionBasis;
  readonly request: DispatchRequest;
  readonly artifact: ResultArtifact;
  readonly transition: FpDispatchTransition;
}): readonly RuntimeEvent[] {
  const payload = input.artifact.artifactPayload;
  if (payload === null) {
    return Object.freeze([]);
  }
  const authorityRefs = payload.fulfillmentAssessments.map(
    (assessment) => assessment.id
  );
  const authorityDigest = `authority:fp_result:${JSON.stringify({
    graphFunctionId: input.request.graphFunctionId,
    edge: payload.edge,
    authorityRefs
  })}`;
  const inputDigest = `input:fp_result:${JSON.stringify({
    basisId: input.request.basisId,
    dispatchRef: input.request.dispatchRef,
    resultRef: input.request.resultRef
  })}`;
  const events: RuntimeEvent[] = [
    constructAuthoritySnapshotAdmittedEvent({
      basis: input.basis,
      vectorIndex: input.transition.vectorIndex,
      authoritySnapshotRef: `authority-snapshot:fp_result:${input.request.resultRef}`,
      authorityRefs,
      inputRefs: [input.request.resultRef],
      authorityDigest,
      inputDigest,
      providerRefs: [
        payload.workerId ?? input.request.workerId,
        payload.backendId ?? input.request.backendId
      ],
      policyRefs: [input.basis.resolvedPolicy.resolvedPolicyBundleRef]
    })
  ];

  for (const assessment of payload.fulfillmentAssessments) {
    const evidenceRefs =
      assessment.evidenceRefs.length === 0
        ? [`evidence:fp_result:${assessment.id}`]
        : assessment.evidenceRefs;
    for (const evidenceRef of evidenceRefs) {
      const payloadRef = payloadRefForAssessment({
        request: input.request,
        assessmentId: assessment.id,
        evidenceRef
      });
      const digest = digestForAssessment({
        request: input.request,
        assessmentId: assessment.id,
        evidenceRef
      });
      events.push(
        constructPayloadObservedEvent({
          basis: input.basis,
          vectorIndex: input.transition.vectorIndex,
          payloadRef,
          payloadClass: "evidence",
          contractRef: "contract://abg/fp-result-evidence",
          digest,
          producerRef: payload.actor,
          sourceEventRef: input.request.resultRef,
          authorityRef: assessment.id,
          inputDigest,
          policyRefs: [input.basis.resolvedPolicy.resolvedPolicyBundleRef]
        }),
        constructPayloadValidatedEvent({
          basis: input.basis,
          vectorIndex: input.transition.vectorIndex,
          payloadRef,
          contractRef: "contract://abg/fp-result-evidence",
          digest,
          validationRef: `validation:fp_result:${payloadRef}`,
          evidenceRef,
          policyRefs: [input.basis.resolvedPolicy.resolvedPolicyBundleRef]
        }),
        constructEvidenceAdmittedEvent({
          basis: input.basis,
          vectorIndex: input.transition.vectorIndex,
          evidenceRef,
          payloadRef,
          authorityRef: assessment.id,
          authorityDigest,
          inputDigest,
          providerRefs: [
            payload.workerId ?? input.request.workerId,
            payload.backendId ?? input.request.backendId
          ],
          policyRefs: [input.basis.resolvedPolicy.resolvedPolicyBundleRef],
          complete: true,
          shallow: false
        })
      );
    }
  }

  return Object.freeze(events);
}

function progressSignalRefsForBlockedResult(input: {
  readonly reason: string;
  readonly artifact: ResultArtifact;
}): readonly string[] {
  const refs: string[] = [];
  if (input.artifact.runtimeFailure !== null) {
    refs.push(
      `runtime_failure:${input.artifact.runtimeFailure.failureClass}:${input.artifact.runtimeFailure.detail}`
    );
  }
  if (input.artifact.artifactPayload !== null) {
    for (const assessment of input.artifact.artifactPayload.fulfillmentAssessments) {
      for (const reason of assessment.blockingReasons) {
        refs.push(`blocking_reason:${assessment.id}:${reason}`);
      }
      for (const evidenceRef of assessment.evidenceRefs) {
        refs.push(evidenceRef);
      }
      if (assessment.fulfillmentStatus !== "fulfilled") {
        refs.push(
          `fulfillment_status:${assessment.id}:${assessment.fulfillmentStatus}:${assessment.fulfillmentDetail}`
        );
      }
    }
  }
  if (refs.length === 0) {
    refs.push(`blocked:${input.reason}`);
  }
  return Object.freeze(refs);
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
      resultRef: input.outcome.resultRef ?? input.request.resultRef,
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
  outcome: ResultIngestOutcome
): BlockedAttachedResult | null {
  switch (outcome.kind) {
    case "accepted": {
      const payload = outcome.artifact.artifactPayload;
      if (payload === null) {
        return Object.freeze({
          artifact: outcome.artifact,
          reason: "accepted artifact has no fulfillment payload",
          progressSignalRefs: progressSignalRefsForBlockedResult({
            reason: "accepted artifact has no fulfillment payload",
            artifact: outcome.artifact
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
            `${assessment.id}:${assessment.fulfillmentStatus}:${assessment.fulfillmentDetail}`
        )
        .join("; ");
      return Object.freeze({
        artifact: outcome.artifact,
        reason,
        progressSignalRefs: progressSignalRefsForBlockedResult({
          reason,
          artifact: outcome.artifact
        })
      });
    }
    case "rejected":
      return Object.freeze({
        artifact: outcome.artifact,
        reason: outcome.detail,
        progressSignalRefs: progressSignalRefsForBlockedResult({
          reason: outcome.detail,
          artifact: outcome.artifact
        })
      });
    case "runtime_failure":
      return Object.freeze({
        artifact: outcome.artifact,
        reason: `${outcome.failureClass}: ${outcome.detail}`,
        progressSignalRefs: progressSignalRefsForBlockedResult({
          reason: `${outcome.failureClass}: ${outcome.detail}`,
          artifact: outcome.artifact
        })
      });
    default: {
      const exhaustive: never = outcome;
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
  readonly maxAttempts?: number | undefined;
}): AttachedFpResultDecision {
  const request = dispatchRequestForTransition(input.transition);
  const artifact = admitAttachedResultArtifact({
    request,
    outcome: input.outcome
  });
  const ingestOutcome = ingestResultArtifact(request, artifact);
  const blocked = blockedResultFromIngestOutcome(ingestOutcome);
  if (blocked === null) {
    return Object.freeze({
      kind: "accepted",
      dispatchRequest: request,
      artifact,
      payloadEvents: payloadEventsForAcceptedResult({
        basis: input.basis,
        request,
        artifact,
        transition: input.transition
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
