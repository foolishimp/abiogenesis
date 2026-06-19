// Implements: REQ-F-ODDSDLC-033
// Implements: REQ-F-ODDSDLC-034
// Implements: REQ-F-ODDSDLC-035

import type {
  SdlcRouteKind,
  SdlcTriageCondition,
  SdlcTriageFrameworkLayer,
  SdlcTriageProcessOutcome,
  SdlcTriageReEntryLayer
} from "./carriers.js";

export type SdlcTriageClassificationCondition =
  | "converged_without_requirement_pressure"
  | "intent_authority_failure"
  | "goals_authority_failure"
  | "product_authority_failure"
  | "requirement_lineage_authority_failure"
  | "design_pressure_present"
  | "code_pressure_present"
  | "test_pressure_present"
  | "requirement_pressure_present"
  | "open_or_partial_gap"
  | "fallback";

export interface SdlcTriageClassificationPolicyEntry {
  readonly kind: "sdlc_triage_classification_policy_entry";
  readonly condition: SdlcTriageClassificationCondition;
  readonly frameworkLayer: SdlcTriageFrameworkLayer;
  readonly frameworkCondition: SdlcTriageCondition;
  readonly processOutcome: SdlcTriageProcessOutcome;
  readonly domainMeaning: string;
}

export type SdlcTriageTargetStrategy =
  | "none"
  | "propose_constitutional_repricing"
  | "derive_design_surface"
  | "derive_code_surface"
  | "derive_requirement_surface"
  | "derive_test_run_archive_surface"
  | "current_edge";

export interface SdlcTriageRoutePolicyEntry {
  readonly kind: "sdlc_triage_route_policy_entry";
  readonly routePolicy:
    | "gap_retired"
    | "intent_reprice"
    | "goals_reprice"
    | "product_reprice"
    | "requirements_pressure"
    | "design_repair"
    | "code_repair"
    | "test_repair"
    | "default_repair";
  readonly reEntryLayer: SdlcTriageReEntryLayer | "classification_layer_or_code";
  readonly routeKind: SdlcRouteKind;
  readonly targetStrategy: SdlcTriageTargetStrategy;
}

export const SDLC_TRIAGE_CLASSIFICATION_POLICY = Object.freeze([
  Object.freeze({
    kind: "sdlc_triage_classification_policy_entry",
    condition: "converged_without_requirement_pressure",
    frameworkLayer: "release",
    frameworkCondition: "gap_retired",
    processOutcome: "gap_retired",
    domainMeaning: "gap is closed at current authority basis"
  }),
  Object.freeze({
    kind: "sdlc_triage_classification_policy_entry",
    condition: "intent_authority_failure",
    frameworkLayer: "intent",
    frameworkCondition: "approval_required",
    processOutcome: "constitutional_reprice_required",
    domainMeaning:
      "the current intent authority is missing, stale, ambiguous, contradictory, or insufficient for the observed worksite"
  }),
  Object.freeze({
    kind: "sdlc_triage_classification_policy_entry",
    condition: "goals_authority_failure",
    frameworkLayer: "goals",
    frameworkCondition: "approval_required",
    processOutcome: "constitutional_reprice_required",
    domainMeaning:
      "the current goals authority is missing, stale, ambiguous, contradictory, or insufficient for the observed worksite"
  }),
  Object.freeze({
    kind: "sdlc_triage_classification_policy_entry",
    condition: "product_authority_failure",
    frameworkLayer: "product",
    frameworkCondition: "approval_required",
    processOutcome: "constitutional_reprice_required",
    domainMeaning:
      "the current product authority or declared product target is missing, ambiguous, contradictory, or insufficient"
  }),
  Object.freeze({
    kind: "sdlc_triage_classification_policy_entry",
    condition: "requirement_lineage_authority_failure",
    frameworkLayer: "requirements",
    frameworkCondition: "approval_required",
    processOutcome: "route_selected",
    domainMeaning:
      "current edge has a transform obligation, but its requirement input authority lineage is missing, stale, ambiguous, or contradictory"
  }),
  Object.freeze({
    kind: "sdlc_triage_classification_policy_entry",
    condition: "design_pressure_present",
    frameworkLayer: "design",
    frameworkCondition: "open_gap",
    processOutcome: "route_selected",
    domainMeaning:
      "requirement authority exists but the design or module binding needed before implementation is missing or insufficient"
  }),
  Object.freeze({
    kind: "sdlc_triage_classification_policy_entry",
    condition: "code_pressure_present",
    frameworkLayer: "code",
    frameworkCondition: "open_gap",
    processOutcome: "route_selected",
    domainMeaning:
      "requirement authority exists but generated product/code evidence is missing or unsatisfied"
  }),
  Object.freeze({
    kind: "sdlc_triage_classification_policy_entry",
    condition: "test_pressure_present",
    frameworkLayer: "test",
    frameworkCondition: "trace_only_closure",
    processOutcome: "route_selected",
    domainMeaning:
      "requirement authority has trace or plan evidence but still lacks behavioral proof"
  }),
  Object.freeze({
    kind: "sdlc_triage_classification_policy_entry",
    condition: "requirement_pressure_present",
    frameworkLayer: "requirements",
    frameworkCondition: "unmet_requirement",
    processOutcome: "route_selected",
    domainMeaning:
      "unresolved requirement pressure must re-enter before implementation closure"
  }),
  Object.freeze({
    kind: "sdlc_triage_classification_policy_entry",
    condition: "open_or_partial_gap",
    frameworkLayer: "code",
    frameworkCondition: "open_gap",
    processOutcome: "route_selected",
    domainMeaning: "current ABG edge remains open and needs a declared start target"
  }),
  Object.freeze({
    kind: "sdlc_triage_classification_policy_entry",
    condition: "fallback",
    frameworkLayer: "runtime",
    frameworkCondition: "unclassified_gap",
    processOutcome: "unclassified_gap",
    domainMeaning: "no totalized domain route matched the observation"
  })
] as const satisfies readonly SdlcTriageClassificationPolicyEntry[]);

export const SDLC_TRIAGE_ROUTE_POLICY = Object.freeze([
  Object.freeze({
    kind: "sdlc_triage_route_policy_entry",
    routePolicy: "gap_retired",
    reEntryLayer: "none",
    routeKind: "gap_retired",
    targetStrategy: "none"
  }),
  Object.freeze({
    kind: "sdlc_triage_route_policy_entry",
    routePolicy: "intent_reprice",
    reEntryLayer: "intent",
    routeKind: "constitutional_reprice",
    targetStrategy: "propose_constitutional_repricing"
  }),
  Object.freeze({
    kind: "sdlc_triage_route_policy_entry",
    routePolicy: "goals_reprice",
    reEntryLayer: "goals",
    routeKind: "constitutional_reprice",
    targetStrategy: "propose_constitutional_repricing"
  }),
  Object.freeze({
    kind: "sdlc_triage_route_policy_entry",
    routePolicy: "product_reprice",
    reEntryLayer: "product",
    routeKind: "constitutional_reprice",
    targetStrategy: "propose_constitutional_repricing"
  }),
  Object.freeze({
    kind: "sdlc_triage_route_policy_entry",
    routePolicy: "design_repair",
    reEntryLayer: "design",
    routeKind: "fixed_vector_repair",
    targetStrategy: "derive_design_surface"
  }),
  Object.freeze({
    kind: "sdlc_triage_route_policy_entry",
    routePolicy: "code_repair",
    reEntryLayer: "code",
    routeKind: "fixed_vector_repair",
    targetStrategy: "derive_code_surface"
  }),
  Object.freeze({
    kind: "sdlc_triage_route_policy_entry",
    routePolicy: "test_repair",
    reEntryLayer: "test",
    routeKind: "fixed_vector_repair",
    targetStrategy: "derive_test_run_archive_surface"
  }),
  Object.freeze({
    kind: "sdlc_triage_route_policy_entry",
    routePolicy: "requirements_pressure",
    reEntryLayer: "requirements",
    routeKind: "fixed_vector_repair",
    targetStrategy: "derive_requirement_surface"
  }),
  Object.freeze({
    kind: "sdlc_triage_route_policy_entry",
    routePolicy: "default_repair",
    reEntryLayer: "classification_layer_or_code",
    routeKind: "fixed_vector_repair",
    targetStrategy: "current_edge"
  })
] as const satisfies readonly SdlcTriageRoutePolicyEntry[]);
