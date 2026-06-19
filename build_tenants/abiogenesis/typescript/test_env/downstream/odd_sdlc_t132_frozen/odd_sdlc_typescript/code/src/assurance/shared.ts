// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-055

import {
  makeSdlcAssuranceLedger,
  makeSdlcAssuranceLedgerReason,
  type SdlcAssuranceLawfulReentryPoint,
  type SdlcAssuranceLedger,
  type SdlcAssuranceLedgerDimension,
  type SdlcAssuranceLedgerReason,
  type SdlcAssuranceLedgerVerdict
} from "./carriers.js";
export { uniqueSorted } from "../shared/collections.js";

export function assuranceReason(input: {
  readonly code: string;
  readonly message: string;
  readonly evidenceRefs?: readonly string[];
  readonly predecessorRefs?: readonly string[];
  readonly fdMechanicsClassRef?: string;
  readonly lawfulReentryPoint: SdlcAssuranceLawfulReentryPoint;
}): SdlcAssuranceLedgerReason {
  return makeSdlcAssuranceLedgerReason(input);
}

export function assuranceLedger(input: {
  readonly dimension: SdlcAssuranceLedgerDimension;
  readonly verdict: SdlcAssuranceLedgerVerdict;
  readonly required?: boolean;
  readonly reasons?: readonly SdlcAssuranceLedgerReason[];
  readonly evidenceRefs?: readonly string[];
  readonly predecessorRefs?: readonly string[];
  readonly fdMechanicsClassRef?: string;
  readonly carryForwardObligationRefs?: readonly string[];
}): SdlcAssuranceLedger {
  return makeSdlcAssuranceLedger(input);
}

export function verdictFromReasons(input: {
  readonly blockedReasonCodes: readonly string[];
  readonly openGapReasonCodes: readonly string[];
  readonly fpEscalationReasonCodes?: readonly string[];
  readonly repriceReasonCodes?: readonly string[];
}): SdlcAssuranceLedgerVerdict {
  if (input.blockedReasonCodes.length > 0) {
    return "blocked";
  }
  if ((input.repriceReasonCodes ?? []).length > 0) {
    return "reprice_required";
  }
  if ((input.fpEscalationReasonCodes ?? []).length > 0) {
    return "fp_escalation";
  }
  if (input.openGapReasonCodes.length > 0) {
    return "open_gap";
  }
  return "satisfied";
}
