// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import { admitPublicLiveStatusRequest } from "./admission.js";
import {
  constructAttentionPublicLiveStatusProjection,
  constructIdlePublicLiveStatusProjection,
  constructProjectionResultAssessmentRef,
  constructProjectionTraceRef,
  constructPublicLiveStatusProjection,
  constructReadyPublicLiveStatusProjection
} from "./constructors.js";
import type {
  ProjectionResultAssessmentRef,
  PublicLiveStatusProjection,
  PublicLiveStatusRequest
} from "./carriers.js";
import type { PublicRuntimeIdentityProjection } from "../contracts/carriers.js";

function deriveTargetHandle(request: PublicLiveStatusRequest): string | null {
  if (request.controlRequest !== null) {
    return request.controlRequest.startRequest.startIntent.target.handle;
  }
  if (request.startRequest !== null) {
    return request.startRequest.startIntent.target.handle;
  }
  return null;
}

function deriveRuntimeIdentity(
  request: PublicLiveStatusRequest
): PublicRuntimeIdentityProjection | null {
  if (request.controlOutcome !== null && request.controlOutcome.runtimeIdentity !== null) {
    return request.controlOutcome.runtimeIdentity;
  }
  if (request.startOutcome !== null && request.startOutcome.runtimeIdentity !== null) {
    return request.startOutcome.runtimeIdentity;
  }
  return null;
}

function deriveActiveEdge(request: PublicLiveStatusRequest): string | null {
  const artifactPayload = request.resultAssessmentRequest?.artifact.artifactPayload;
  if (artifactPayload !== null && artifactPayload !== undefined) {
    return artifactPayload.edge;
  }
  return null;
}

function deriveResultAssessmentRef(
  request: PublicLiveStatusRequest
): ProjectionResultAssessmentRef | null {
  if (request.resultAssessmentRequest === null) {
    return null;
  }
  if (request.resultAssessmentOutcome === null) {
    return constructProjectionResultAssessmentRef({
      status: null,
      failureClass: null,
      valid: null,
      publishedLedgerRef: request.resultAssessmentRequest.publishedLedgerRef.ref,
      assessedCount: null
    });
  }
  switch (request.resultAssessmentOutcome.kind) {
    case "accepted":
      return constructProjectionResultAssessmentRef({
        status: "accepted",
        failureClass: null,
        valid: true,
        publishedLedgerRef: request.resultAssessmentRequest.publishedLedgerRef.ref,
        assessedCount: request.resultAssessmentOutcome.assessedCount
      });
    case "rejected":
      return constructProjectionResultAssessmentRef({
        status: request.resultAssessmentOutcome.ingestKind,
        failureClass: request.resultAssessmentOutcome.failureClass,
        valid: false,
        publishedLedgerRef: request.resultAssessmentRequest.publishedLedgerRef.ref,
        assessedCount: null
      });
    default: {
      const exhaustive: never = request.resultAssessmentOutcome;
      throw new TypeError(
        `Unsupported result-assessment projection ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function deriveTraceSourceKinds(
  request: PublicLiveStatusRequest
): readonly string[] {
  const sourceKinds: string[] = [];
  if (request.startRequest !== null) {
    sourceKinds.push("start_request");
  }
  if (request.startOutcome !== null) {
    sourceKinds.push(`start_outcome:${request.startOutcome.kind}`);
  }
  if (request.controlRequest !== null) {
    sourceKinds.push("control_request");
  }
  if (request.controlOutcome !== null) {
    sourceKinds.push(`control_outcome:${request.controlOutcome.kind}`);
  }
  if (request.resultAssessmentRequest !== null) {
    sourceKinds.push("result_assessment_request");
  }
  if (request.resultAssessmentOutcome !== null) {
    sourceKinds.push(`result_assessment_outcome:${request.resultAssessmentOutcome.kind}`);
  }
  return Object.freeze(sourceKinds);
}

export function projectLiveStatusFromRequest(
  request: PublicLiveStatusRequest
): PublicLiveStatusProjection {
  const trace = constructProjectionTraceRef(deriveTraceSourceKinds(request));
  const runtimeIdentity = deriveRuntimeIdentity(request);
  const resultAssessment = deriveResultAssessmentRef(request);
  const targetHandle = deriveTargetHandle(request);
  const activeEdge = deriveActiveEdge(request);

  if (request.resultAssessmentOutcome !== null) {
    if (request.resultAssessmentOutcome.kind === "accepted") {
      return constructPublicLiveStatusProjection(
        constructReadyPublicLiveStatusProjection({
          request,
          trace,
          runtimeIdentity,
          resultAssessment,
          targetHandle,
          activeEdge,
          runStatus: "assessed"
        })
      );
    }
    return constructPublicLiveStatusProjection(
      constructAttentionPublicLiveStatusProjection({
        request,
        trace,
        runtimeIdentity,
        resultAssessment,
        targetHandle,
        activeEdge,
        runStatus:
          request.resultAssessmentOutcome.ingestKind === "runtime_failure"
            ? request.resultAssessmentOutcome.failureClass ??
              (() => {
                throw new TypeError(
                  "Runtime failure result assessment requires failureClass"
                );
              })()
            : "rejected",
        reason: request.resultAssessmentOutcome.reason
      })
    );
  }

  if (request.controlOutcome !== null) {
    switch (request.controlOutcome.kind) {
      case "converged":
        return constructPublicLiveStatusProjection(
          constructReadyPublicLiveStatusProjection({
            request,
            trace,
            runtimeIdentity,
            resultAssessment,
            targetHandle,
            activeEdge,
            runStatus: "converged"
          })
        );
      case "yielded":
        return constructPublicLiveStatusProjection(
          constructAttentionPublicLiveStatusProjection({
            request,
            trace,
            runtimeIdentity,
            resultAssessment,
            targetHandle,
            activeEdge,
            runStatus: "yielded",
            reason: request.controlOutcome.stopDetail.kind
          })
        );
      case "dispatch_required":
      case "human_gate_required":
        return constructPublicLiveStatusProjection(
          constructAttentionPublicLiveStatusProjection({
            request,
            trace,
            runtimeIdentity,
            resultAssessment,
            targetHandle,
            activeEdge,
            runStatus: "blocked",
            reason: request.controlOutcome.kind
          })
        );
      case "blocked":
        return constructPublicLiveStatusProjection(
          constructAttentionPublicLiveStatusProjection({
            request,
            trace,
            runtimeIdentity,
            resultAssessment,
            targetHandle,
            activeEdge,
            runStatus: "blocked",
            reason: request.controlOutcome.stopDetail.kind
          })
        );
      case "rejected":
        return constructPublicLiveStatusProjection(
          constructAttentionPublicLiveStatusProjection({
            request,
            trace,
            runtimeIdentity,
            resultAssessment,
            targetHandle,
            activeEdge,
            runStatus: "rejected",
            reason: request.controlOutcome.reason
          })
        );
      default: {
        const exhaustive: never = request.controlOutcome;
        throw new TypeError(
          `Unsupported control projection ${JSON.stringify(exhaustive)}`
        );
      }
    }
  }

  if (request.startOutcome !== null) {
    switch (request.startOutcome.kind) {
      case "advanced":
        return constructPublicLiveStatusProjection(
          constructReadyPublicLiveStatusProjection({
            request,
            trace,
            runtimeIdentity,
            resultAssessment,
            targetHandle,
            activeEdge,
            runStatus: "active"
          })
        );
      case "converged":
        return constructPublicLiveStatusProjection(
          constructReadyPublicLiveStatusProjection({
            request,
            trace,
            runtimeIdentity,
            resultAssessment,
            targetHandle,
            activeEdge,
            runStatus: "converged"
          })
        );
      case "blocked":
        return constructPublicLiveStatusProjection(
          constructAttentionPublicLiveStatusProjection({
            request,
            trace,
            runtimeIdentity,
            resultAssessment,
            targetHandle,
            activeEdge,
            runStatus: "blocked",
            reason: request.startOutcome.stopPredicate
          })
        );
      case "yielded":
        return constructPublicLiveStatusProjection(
          constructAttentionPublicLiveStatusProjection({
            request,
            trace,
            runtimeIdentity,
            resultAssessment,
            targetHandle,
            activeEdge,
            runStatus: "yielded",
            reason: request.startOutcome.stopDetail.terminalKind ?? "yielded"
          })
        );
      case "rejected":
        return constructPublicLiveStatusProjection(
          constructAttentionPublicLiveStatusProjection({
            request,
            trace,
            runtimeIdentity,
            resultAssessment,
            targetHandle,
            activeEdge,
            runStatus: "rejected",
            reason: request.startOutcome.reason
          })
        );
      default: {
        const exhaustive: never = request.startOutcome;
        throw new TypeError(
          `Unsupported start projection ${JSON.stringify(exhaustive)}`
        );
      }
    }
  }

  return constructPublicLiveStatusProjection(
    constructIdlePublicLiveStatusProjection({
      request,
      trace,
      runtimeIdentity,
      resultAssessment,
      targetHandle,
      activeEdge
    })
  );
}

export function projectLiveStatus(
  input: unknown
): PublicLiveStatusProjection {
  const request = admitPublicLiveStatusRequest(input);
  return projectLiveStatusFromRequest(request);
}
