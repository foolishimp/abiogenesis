// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-055

import {
  SDLC_ASSURANCE_LEDGER_DIMENSIONS,
  SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF,
  makeSdlcAssuranceLedgerReason,
  type SdlcAssuranceFoldInput,
  type SdlcAssuranceLedger,
  type SdlcAssuranceLedgerDimension,
  type SdlcAssuranceLedgerReason,
  type SdlcTraversalRequirementSatisfaction,
  type SdlcTraversalRequirementSatisfactionStatus
} from "./carriers.js";
import { uniqueSorted } from "../shared/collections.js";

function requiredDimensionsFor(
  input: SdlcAssuranceFoldInput
): readonly SdlcAssuranceLedgerDimension[] {
  return Object.freeze([
    ...(input.requiredDimensions ?? SDLC_ASSURANCE_LEDGER_DIMENSIONS)
  ]);
}

function reasonsForVerdict(
  ledgers: readonly SdlcAssuranceLedger[],
  verdict: SdlcAssuranceLedger["verdict"]
): readonly SdlcAssuranceLedgerReason[] {
  return Object.freeze(
    ledgers.flatMap((ledger) =>
      ledger.verdict === verdict ? [...ledger.reasons] : []
    )
  );
}

function reasonsForLawfulReentry(
  ledgers: readonly SdlcAssuranceLedger[],
  lawfulReentryPoint: SdlcAssuranceLedgerReason["lawfulReentryPoint"]
): readonly SdlcAssuranceLedgerReason[] {
  return Object.freeze(
    ledgers.flatMap((ledger) =>
      ledger.reasons.filter(
        (reason) => reason.lawfulReentryPoint === lawfulReentryPoint
      )
    )
  );
}

function missingRequiredReasons(
  missingRequiredDimensions: readonly SdlcAssuranceLedgerDimension[]
): readonly SdlcAssuranceLedgerReason[] {
  return Object.freeze(
    missingRequiredDimensions.map((dimension) =>
      makeSdlcAssuranceLedgerReason({
        code: `missing_required_ledger:${dimension}`,
        message: `Missing required assurance ledger: ${dimension}`,
        predecessorRefs: [SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF],
        lawfulReentryPoint: "operator_blocked"
      })
    )
  );
}

function predecessorCompletenessReasons(
  ledgers: readonly SdlcAssuranceLedger[]
): readonly SdlcAssuranceLedgerReason[] {
  return Object.freeze(
    ledgers.flatMap((ledger) => {
      const reasons: SdlcAssuranceLedgerReason[] = [];
      if (ledger.predecessorRefs.length === 0) {
        reasons.push(
          makeSdlcAssuranceLedgerReason({
            code: `assurance_predecessor_refs_missing:${ledger.dimension}`,
            message: `Required assurance ledger ${ledger.dimension} lacks predecessor refs for replay.`,
            evidenceRefs: ledger.evidenceRefs,
            predecessorRefs: [ledger.fdMechanicsClassRef],
            lawfulReentryPoint: "operator_blocked"
          })
        );
      }
      if (ledger.fdMechanicsClassRef !== SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF) {
        reasons.push(
          makeSdlcAssuranceLedgerReason({
            code: `assurance_fd_mechanics_class_invalid:${ledger.dimension}`,
            message: `Required assurance ledger ${ledger.dimension} does not cite the closed F_D mechanics class.`,
            evidenceRefs: ledger.evidenceRefs,
            predecessorRefs: [
              ledger.fdMechanicsClassRef,
              SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF
            ],
            lawfulReentryPoint: "operator_blocked"
          })
        );
      }
      return reasons;
    })
  );
}

function statusFor(input: {
  readonly missingRequiredDimensions: readonly SdlcAssuranceLedgerDimension[];
  readonly predecessorCompletenessReasons: readonly SdlcAssuranceLedgerReason[];
  readonly ledgers: readonly SdlcAssuranceLedger[];
}): SdlcTraversalRequirementSatisfactionStatus {
  const gatingLedgers = input.ledgers.filter((ledger) => ledger.required !== false);
  if (input.missingRequiredDimensions.length > 0) {
    return "blocked";
  }
  if (input.predecessorCompletenessReasons.length > 0) {
    return "blocked";
  }
  if (gatingLedgers.some((ledger) => ledger.verdict === "blocked")) {
    return "blocked";
  }
  if (gatingLedgers.some((ledger) => ledger.verdict === "reprice_required")) {
    return "reprice_required";
  }
  if (gatingLedgers.some((ledger) => ledger.verdict === "fp_escalation")) {
    return "fp_escalation";
  }
  if (gatingLedgers.some((ledger) => ledger.verdict === "open_gap")) {
    return "retry_same_edge";
  }
  if (gatingLedgers.length === 0) {
    return "not_applicable";
  }
  return "close_allowed";
}

export function foldSdlcAssuranceLedgers(
  input: SdlcAssuranceFoldInput
): SdlcTraversalRequirementSatisfaction {
  const requiredDimensions = requiredDimensionsFor(input);
  const ledgerDimensions = new Set(
    input.ledgers.map((ledger) => ledger.dimension)
  );
  const missingRequiredDimensions = Object.freeze(
    requiredDimensions.filter((dimension) => !ledgerDimensions.has(dimension))
  );
  const gatingLedgers = Object.freeze(
    input.ledgers.filter((ledger) => ledger.required !== false)
  );
  const missingReasons = missingRequiredReasons(missingRequiredDimensions);
  const predecessorReasons = predecessorCompletenessReasons(gatingLedgers);
  const blockedReasons = Object.freeze([
    ...missingReasons,
    ...predecessorReasons,
    ...reasonsForVerdict(gatingLedgers, "blocked")
  ]);
  const repriceReasons = reasonsForVerdict(gatingLedgers, "reprice_required");
  const gapReasons = Object.freeze(
    reasonsForVerdict(gatingLedgers, "open_gap").filter(
      (reason) => reason.lawfulReentryPoint !== "escalate_to_fp"
    )
  );
  const fpEscalationReasons = reasonsForLawfulReentry(
    gatingLedgers,
    "escalate_to_fp"
  );
  const retryReasonCodes = Object.freeze(
    [
      ...gapReasons,
      ...blockedReasons,
      ...repriceReasons,
      ...fpEscalationReasons
    ].map(
      (reason) => reason.code
    )
  );
  const retryEvidenceRefs = uniqueSorted(
    gatingLedgers.flatMap((ledger) => [
      ...ledger.evidenceRefs,
      ...ledger.predecessorRefs,
      ledger.fdMechanicsClassRef,
      ...ledger.reasons.flatMap((reason) => reason.evidenceRefs),
      ...ledger.reasons.flatMap((reason) => reason.predecessorRefs),
      ...ledger.reasons.map((reason) => reason.fdMechanicsClassRef)
    ])
  );
  const status = statusFor({
    missingRequiredDimensions,
    predecessorCompletenessReasons: predecessorReasons,
    ledgers: input.ledgers
  });

  return Object.freeze({
    kind: "sdlc_traversal_requirement_satisfaction" as const,
    status,
    ledgers: Object.freeze([...input.ledgers]),
    missingRequiredDimensions,
    blockingReasons: blockedReasons,
    repriceReasons,
    gapReasons,
    fpEscalationReasons,
    predecessorCompletenessReasons: predecessorReasons,
    satisfiedDimensions: Object.freeze(
      input.ledgers
        .filter((ledger) => ledger.verdict === "satisfied")
        .map((ledger) => ledger.dimension)
    ),
    notApplicableDimensions: Object.freeze(
      input.ledgers
        .filter((ledger) => ledger.verdict === "not_applicable")
        .map((ledger) => ledger.dimension)
    ),
    retryHandoff: Object.freeze({
      kind: "sdlc_traversal_retry_handoff" as const,
      obligationRefs: uniqueSorted(
        input.ledgers.flatMap((ledger) => ledger.carryForwardObligationRefs)
      ),
      reasonCodes: uniqueSorted(retryReasonCodes),
      evidenceRefs: retryEvidenceRefs
    })
  });
}
