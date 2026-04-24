// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import {
  emit,
  ingestResultArtifact,
  type ResultIngestOutcome,
  type RuntimeEventSink
} from "../../../abg/m03/index.js";
import { admitPublicResultAssessmentRequest } from "./admission.js";
import {
  constructPublicResultAssessmentOutcome,
  constructRejectedPublicResultAssessmentOutcome,
  constructRuntimeEventsForResultAssessment
} from "./constructors.js";
import type {
  PublicResultAssessmentOutcome,
  PublicResultAssessmentRequest
} from "./carriers.js";

interface AssessmentIngressRouteBinding {
  readonly request: PublicResultAssessmentRequest;
  readonly ingestOutcome: ResultIngestOutcome;
}

function assertRuntimeEventSink(
  eventSink: RuntimeEventSink | undefined
): RuntimeEventSink {
  if (typeof eventSink !== "function") {
    throw new TypeError(
      "resultAssessment.eventSink must be provided explicitly to preserve runtime observability"
    );
  }
  return eventSink;
}

function bindAssessmentIngress(
  request: PublicResultAssessmentRequest
): AssessmentIngressRouteBinding {
  return Object.freeze({
    request,
    ingestOutcome: ingestResultArtifact(request.dispatchRequest, request.artifact)
  });
}

export function resultAssessmentFromRequest(
  request: PublicResultAssessmentRequest,
  eventSink: RuntimeEventSink
): PublicResultAssessmentOutcome {
  const sink = assertRuntimeEventSink(eventSink);
  const binding = bindAssessmentIngress(request);

  switch (binding.ingestOutcome.kind) {
    case "accepted": {
      const emitted = emit(
        constructRuntimeEventsForResultAssessment(binding.request),
        sink
      );
      return constructPublicResultAssessmentOutcome({
        request: binding.request,
        emitted
      });
    }
    case "rejected":
      return constructRejectedPublicResultAssessmentOutcome({
        ingestKind: "rejected",
        reason: binding.ingestOutcome.detail
      });
    case "transport_failure":
      return constructRejectedPublicResultAssessmentOutcome({
        ingestKind: "transport_failure",
        reason: binding.ingestOutcome.detail
      });
    default: {
      const exhaustive: never = binding.ingestOutcome;
      throw new TypeError(
        `Unsupported result-assessment ingest outcome ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

export function resultAssessment(
  input: unknown,
  eventSink: RuntimeEventSink
): PublicResultAssessmentOutcome {
  const request = admitPublicResultAssessmentRequest(input);
  return resultAssessmentFromRequest(request, eventSink);
}
