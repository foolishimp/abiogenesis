// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import {
  type AssessedRuntimeEvent,
  type CanonicalRuntimeEvent
} from "../../../abg/m03/index.js";
import {
  constructPublicResultAssessmentOutcome,
  constructRuntimeEventsForResultAssessment
} from "./constructors.js";
import type {
  PublicResultAssessmentOutcome,
  ReplayBoundPublicResultAssessmentRequest
} from "./carriers.js";
import type {
  ReplayAdmittedResultAssessmentEvidenceAuthority
} from "./evidence_authority.js";

export type CanonicalAssessedRuntimeEvent =
  CanonicalRuntimeEvent & AssessedRuntimeEvent;

export type ResultAssessmentRuntimeEventEmitter = (
  events: readonly AssessedRuntimeEvent[]
) => readonly CanonicalAssessedRuntimeEvent[];

function assessResultWithEventWriter(
  request: ReplayBoundPublicResultAssessmentRequest,
  evidenceAuthority: ReplayAdmittedResultAssessmentEvidenceAuthority,
  emitEvents: ResultAssessmentRuntimeEventEmitter
): PublicResultAssessmentOutcome {
  const events = constructRuntimeEventsForResultAssessment(
    request,
    evidenceAuthority
  );
  const emitted = emitEvents(events);
  if (
    emitted.length !== events.length ||
    emitted.some((event) => event.kind !== "assessed")
  ) {
    throw new TypeError(
      "result assessment event writer must return assessed events only"
    );
  }
  return constructPublicResultAssessmentOutcome({
    request,
    evidenceAuthority,
    emitted
  });
}

/** @internal */
export function resultAssessmentFromReplayEvidenceWithEventWriter(
  request: ReplayBoundPublicResultAssessmentRequest,
  evidenceAuthority: ReplayAdmittedResultAssessmentEvidenceAuthority,
  emitEvents: ResultAssessmentRuntimeEventEmitter
): PublicResultAssessmentOutcome {
  if (typeof emitEvents !== "function") {
    throw new TypeError(
      "resultAssessment.emitEvents must be provided explicitly"
    );
  }
  return assessResultWithEventWriter(
    request,
    evidenceAuthority,
    emitEvents
  );
}
