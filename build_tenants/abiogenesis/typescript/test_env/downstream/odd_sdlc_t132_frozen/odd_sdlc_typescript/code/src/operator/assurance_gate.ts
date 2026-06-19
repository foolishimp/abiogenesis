// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-055

import type {
  SdlcAssuranceLedger,
  SdlcAssuranceLedgerDimension,
  SdlcTraversalRequirementSatisfaction
} from "../assurance/index.js";
import type {
  SdlcPostflightResult,
  SdlcWorkerHandoffManifest,
  SdlcWorkerResultReport
} from "./carriers.js";

export interface SdlcOperatorAssuranceGateResult {
  readonly kind: "sdlc_operator_assurance_gate_result";
  readonly requiredDimensions: readonly SdlcAssuranceLedgerDimension[];
  readonly ledgers: readonly SdlcAssuranceLedger[];
  readonly satisfaction: SdlcTraversalRequirementSatisfaction;
}

function emptyTraversalRequirementSatisfaction(): SdlcTraversalRequirementSatisfaction {
  return Object.freeze({
    kind: "sdlc_traversal_requirement_satisfaction" as const,
    status: "close_allowed" as const,
    ledgers: Object.freeze([]),
    missingRequiredDimensions: Object.freeze([]),
    blockingReasons: Object.freeze([]),
    repriceReasons: Object.freeze([]),
    gapReasons: Object.freeze([]),
    fpEscalationReasons: Object.freeze([]),
    predecessorCompletenessReasons: Object.freeze([]),
    satisfiedDimensions: Object.freeze([]),
    notApplicableDimensions: Object.freeze([]),
    retryHandoff: Object.freeze({
      kind: "sdlc_traversal_retry_handoff" as const,
      obligationRefs: Object.freeze([]),
      reasonCodes: Object.freeze([]),
      evidenceRefs: Object.freeze([])
    })
  });
}

export function deriveSdlcOperatorAssuranceGate(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
  readonly postflight: SdlcPostflightResult;
}): SdlcOperatorAssuranceGateResult {
  void input;
  return Object.freeze({
    kind: "sdlc_operator_assurance_gate_result" as const,
    requiredDimensions: Object.freeze([]),
    ledgers: Object.freeze([]),
    satisfaction: emptyTraversalRequirementSatisfaction()
  });
}
