// Implements: REQ-F-ODDSDLC-033
// Implements: REQ-F-ODDSDLC-034
// Implements: REQ-F-ODDSDLC-035
// Implements: REQ-F-ODDSDLC-036
// Implements: REQ-F-ODDSDLC-037

import type { SdlcGapStatus } from "../projection/index.js";

export const SDLC_TRIAGE_FRAMEWORK_LAYER_VALUES = Object.freeze([
  "intent",
  "goals",
  "product",
  "requirements",
  "design",
  "code",
  "test",
  "release",
  "runtime"
] as const);

export type SdlcTriageFrameworkLayer =
  (typeof SDLC_TRIAGE_FRAMEWORK_LAYER_VALUES)[number];

export const SDLC_TRIAGE_CONDITION_VALUES = Object.freeze([
  "unmet_requirement",
  "trace_only_closure",
  "open_gap",
  "stale_analysis",
  "capability_missing",
  "approval_required",
  "unclassified_gap",
  "no_lawful_route",
  "gap_retired"
] as const);

export type SdlcTriageCondition =
  (typeof SDLC_TRIAGE_CONDITION_VALUES)[number];

export const SDLC_TRIAGE_PROCESS_OUTCOME_VALUES = Object.freeze([
  "route_selected",
  "constitutional_reprice_required",
  "defer",
  "no_lawful_route",
  "gap_retired",
  "unclassified_gap"
] as const);

export type SdlcTriageProcessOutcome =
  (typeof SDLC_TRIAGE_PROCESS_OUTCOME_VALUES)[number];

export const SDLC_TRIAGE_RE_ENTRY_LAYER_VALUES = Object.freeze([
  "intent",
  "goals",
  "product",
  "requirements",
  "design",
  "code",
  "test",
  "none"
] as const);

export type SdlcTriageReEntryLayer =
  (typeof SDLC_TRIAGE_RE_ENTRY_LAYER_VALUES)[number];

export const SDLC_ROUTE_KIND_VALUES = Object.freeze([
  "fixed_vector_repair",
  "declared_dynamic_family",
  "constitutional_reprice",
  "defer",
  "no_lawful_route",
  "gap_retired"
] as const);

export type SdlcRouteKind = (typeof SDLC_ROUTE_KIND_VALUES)[number];

export type SdlcRequirementTransformLineageStatus =
  | "lineage_observed"
  | "lineage_absent"
  | "lineage_authority_failure";

export type SdlcRequirementTransformLineageSource =
  | "requirement_transform_authority"
  | "closure_register_fallback";

export interface SdlcRequirementTransformLineage {
  readonly kind: "sdlc_requirement_transform_lineage";
  readonly requirementId: string;
  readonly currentEdge: string | null;
  readonly transformLineageRef: string;
  readonly immediateTransformObligationRef: string;
  readonly transformInputAuthorityRef: string;
  readonly transformOutputExpectationRef: string;
  readonly predecessorTransformRefs: readonly string[];
  readonly lineageDepth: number;
  readonly sourceInputUris: readonly string[];
  readonly lineageSource: SdlcRequirementTransformLineageSource;
  readonly lineageAuthorityRefs: readonly string[];
  readonly lineageBasisRefs: readonly string[];
  readonly lineageStatus: SdlcRequirementTransformLineageStatus;
  readonly emittedRuntimeEventKinds: readonly [];
}

export interface SdlcGapObservation {
  readonly kind: "sdlc_gap_observation";
  readonly observationId: string;
  readonly analysisRef: string;
  readonly gapStatus: SdlcGapStatus;
  readonly currentEdge: string | null;
  readonly requirementPressureIds: readonly string[];
  readonly requirementOpenReasonCodes: readonly string[];
  readonly requirementOpenReasonRefs: readonly string[];
  readonly requirementTransformLineage: readonly SdlcRequirementTransformLineage[];
  readonly evidenceRefs: readonly string[];
  readonly freshnessToken: string;
  readonly emittedRuntimeEventKinds: readonly [];
}

export interface SdlcTriageClassification {
  readonly kind: "sdlc_triage_classification";
  readonly observationId: string;
  readonly frameworkLayer: SdlcTriageFrameworkLayer;
  readonly frameworkCondition: SdlcTriageCondition;
  readonly domainMeaning: string;
  readonly processOutcome: SdlcTriageProcessOutcome;
  readonly ambiguityCarried: boolean;
  readonly evidenceRefs: readonly string[];
  readonly emittedRuntimeEventKinds: readonly [];
}

export interface SdlcRouteBinding {
  readonly kind: "sdlc_route_binding";
  readonly routeId: string;
  readonly observationId: string;
  readonly reEntryLayer: SdlcTriageReEntryLayer;
  readonly routeKind: SdlcRouteKind;
  readonly targetGraphFunction: string | null;
  readonly lawfulStartTarget: {
    readonly kind: "graph_function" | "none";
    readonly handle: string | null;
  };
  readonly routeEligibility: "eligible" | "blocked";
  readonly preservedSignals: readonly string[];
  readonly mayApplyConstitutionalChange: false;
  readonly emittedRuntimeEventKinds: readonly [];
}

export interface SdlcConstitutionalRepricingProposal {
  readonly kind: "sdlc_constitutional_repricing_proposal";
  readonly proposalId: string;
  readonly observationId: string;
  readonly targetSurface: "GOALS.md" | "INTENT.md" | "PRODUCT.md" | "requirements";
  readonly proposedChangeSummary: string;
  readonly approvalRequired: true;
  readonly approvalOutcome: "approve" | "approve_with_edits" | "reject" | "defer" | null;
  readonly proposalApplied: false;
  readonly emittedRuntimeEventKinds: readonly [];
}

export interface SdlcTicketWorkItemRoute {
  readonly kind: "sdlc_ticket_work_item_route";
  readonly workItemRef: string;
  readonly routeBindingId: string;
  readonly ticketAuthority: "TICKET_METHOD";
  readonly ticketStatus: "proposed";
  readonly lawfulReEntryPoint: string;
  readonly writesTicket: false;
  readonly emittedRuntimeEventKinds: readonly [];
}

export interface SdlcGapRetirement {
  readonly kind: "sdlc_gap_retirement";
  readonly observationId: string;
  readonly status: "gap_retired" | "gap_still_open";
  readonly unresolvedRequirementIds: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly emittedRuntimeEventKinds: readonly [];
}
