// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-051
// Implements: REQ-F-ODDSDLC-055

import { uniquePresentSorted as uniqueSorted } from "../shared/collections.js";

export const SDLC_ASSURANCE_LEDGER_DIMENSIONS = Object.freeze([
  "materialization",
  "semantic_convergence",
  "obligation_carry",
  "requirement_fulfillment",
  "ambiguity",
  "capability",
  "shallow_realization",
  "component_depth",
  "design_completeness"
] as const);

export type SdlcAssuranceLedgerDimension =
  (typeof SDLC_ASSURANCE_LEDGER_DIMENSIONS)[number];

export type SdlcAssuranceLedgerVerdict =
  | "satisfied"
  | "open_gap"
  | "fp_escalation"
  | "blocked"
  | "reprice_required"
  | "not_applicable";

export type SdlcTraversalRequirementSatisfactionStatus =
  | "close_allowed"
  | "retry_same_edge"
  | "fp_escalation"
  | "blocked"
  | "reprice_required"
  | "not_applicable";

export const SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF =
  "fd-mechanics://odd-sdlc/assurance/closed-fd-mechanics/v1" as const;

export const SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CHECKS = Object.freeze([
  "carrier_shape",
  "ref_resolution",
  "path_containment",
  "file_existence",
  "digest_or_byte_count_validation",
  "replay_predecessor_completeness",
  "declared_deterministic_validator_result",
  "required_evidence_presence"
] as const);

export type SdlcAssuranceClosedFdMechanicsCheck =
  (typeof SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CHECKS)[number];

export interface SdlcAssuranceClosedFdMechanicsClass {
  readonly kind: "sdlc_assurance_closed_fd_mechanics_class";
  readonly classRef: typeof SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF;
  readonly checks: readonly SdlcAssuranceClosedFdMechanicsCheck[];
}

export const SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS =
  Object.freeze({
    kind: "sdlc_assurance_closed_fd_mechanics_class" as const,
    classRef: SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF,
    checks: SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CHECKS
  }) satisfies SdlcAssuranceClosedFdMechanicsClass;

export type SdlcAssuranceLawfulReentryPoint =
  | "same_edge_retry"
  | "escalate_to_fp"
  | "repair_worker_output"
  | "requirement_reprice"
  | "design_reframe"
  | "operator_blocked";

export interface SdlcAssuranceLedgerReason {
  readonly kind: "sdlc_assurance_ledger_reason";
  readonly code: string;
  readonly message: string;
  readonly evidenceRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
  readonly fdMechanicsClassRef: string;
  readonly lawfulReentryPoint: SdlcAssuranceLawfulReentryPoint;
}

export interface SdlcAssuranceLedger {
  readonly kind: "sdlc_assurance_ledger";
  readonly dimension: SdlcAssuranceLedgerDimension;
  readonly verdict: SdlcAssuranceLedgerVerdict;
  readonly required: boolean;
  readonly reasons: readonly SdlcAssuranceLedgerReason[];
  readonly evidenceRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
  readonly fdMechanicsClassRef: string;
  readonly carryForwardObligationRefs: readonly string[];
}

export interface SdlcAssuranceLedgerInput {
  readonly dimension: SdlcAssuranceLedgerDimension;
  readonly verdict: SdlcAssuranceLedgerVerdict;
  readonly required?: boolean;
  readonly reasons?: readonly SdlcAssuranceLedgerReason[];
  readonly evidenceRefs?: readonly string[];
  readonly predecessorRefs?: readonly string[];
  readonly fdMechanicsClassRef?: string;
  readonly carryForwardObligationRefs?: readonly string[];
}

export interface SdlcTraversalRetryHandoff {
  readonly kind: "sdlc_traversal_retry_handoff";
  readonly obligationRefs: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface SdlcTraversalRequirementSatisfaction {
  readonly kind: "sdlc_traversal_requirement_satisfaction";
  readonly status: SdlcTraversalRequirementSatisfactionStatus;
  readonly ledgers: readonly SdlcAssuranceLedger[];
  readonly missingRequiredDimensions: readonly SdlcAssuranceLedgerDimension[];
  readonly blockingReasons: readonly SdlcAssuranceLedgerReason[];
  readonly repriceReasons: readonly SdlcAssuranceLedgerReason[];
  readonly gapReasons: readonly SdlcAssuranceLedgerReason[];
  readonly fpEscalationReasons: readonly SdlcAssuranceLedgerReason[];
  readonly predecessorCompletenessReasons: readonly SdlcAssuranceLedgerReason[];
  readonly satisfiedDimensions: readonly SdlcAssuranceLedgerDimension[];
  readonly notApplicableDimensions: readonly SdlcAssuranceLedgerDimension[];
  readonly retryHandoff: SdlcTraversalRetryHandoff;
}

export interface SdlcAssuranceFoldInput {
  readonly ledgers: readonly SdlcAssuranceLedger[];
  readonly requiredDimensions?: readonly SdlcAssuranceLedgerDimension[];
}

export function makeSdlcAssuranceLedger(
  input: SdlcAssuranceLedgerInput
): SdlcAssuranceLedger {
  const reasons = Object.freeze([...(input.reasons ?? [])]);
  const evidenceRefs = Object.freeze([...(input.evidenceRefs ?? [])]);
  const predecessorRefs = uniqueSorted(
    input.predecessorRefs ?? [
      ...evidenceRefs,
      ...reasons.flatMap((reason) => [
        ...reason.predecessorRefs,
        ...reason.evidenceRefs
      ])
    ]
  );
  return Object.freeze({
    kind: "sdlc_assurance_ledger" as const,
    dimension: input.dimension,
    verdict: input.verdict,
    required: input.required ?? true,
    reasons,
    evidenceRefs,
    predecessorRefs,
    fdMechanicsClassRef:
      input.fdMechanicsClassRef ?? SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF,
    carryForwardObligationRefs: Object.freeze([
      ...(input.carryForwardObligationRefs ?? [])
    ])
  });
}

export function makeSdlcAssuranceLedgerReason(input: {
  readonly code: string;
  readonly message: string;
  readonly evidenceRefs?: readonly string[];
  readonly predecessorRefs?: readonly string[];
  readonly fdMechanicsClassRef?: string;
  readonly lawfulReentryPoint: SdlcAssuranceLawfulReentryPoint;
}): SdlcAssuranceLedgerReason {
  const evidenceRefs = Object.freeze([...(input.evidenceRefs ?? [])]);
  return Object.freeze({
    kind: "sdlc_assurance_ledger_reason" as const,
    code: input.code,
    message: input.message,
    evidenceRefs,
    predecessorRefs: uniqueSorted(input.predecessorRefs ?? evidenceRefs),
    fdMechanicsClassRef:
      input.fdMechanicsClassRef ?? SDLC_ASSURANCE_CLOSED_FD_MECHANICS_CLASS_REF,
    lawfulReentryPoint: input.lawfulReentryPoint
  });
}
