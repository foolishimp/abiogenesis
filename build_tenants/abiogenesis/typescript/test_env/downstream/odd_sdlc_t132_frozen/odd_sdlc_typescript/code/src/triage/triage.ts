// Implements: REQ-F-ODDSDLC-033
// Implements: REQ-F-ODDSDLC-034
// Implements: REQ-F-ODDSDLC-035
// Implements: REQ-F-ODDSDLC-036
// Implements: REQ-F-ODDSDLC-037

import type {
  SdlcGapDossier,
  SdlcRequirementClosureRegister
} from "../projection/index.js";
import type { SdlcRequirementTransformAuthority } from "../workspace/index.js";
import type {
  SdlcConstitutionalRepricingProposal,
  SdlcGapObservation,
  SdlcGapRetirement,
  SdlcRequirementTransformLineage,
  SdlcRouteBinding,
  SdlcTicketWorkItemRoute,
  SdlcTriageClassification,
  SdlcTriageCondition,
  SdlcTriageFrameworkLayer,
  SdlcTriageProcessOutcome,
  SdlcTriageReEntryLayer
} from "./carriers.js";
import {
  SDLC_TRIAGE_CLASSIFICATION_POLICY,
  SDLC_TRIAGE_ROUTE_POLICY,
  type SdlcTriageClassificationCondition,
  type SdlcTriageRoutePolicyEntry
} from "./policy.js";
import { uniqueSorted } from "../shared/collections.js";

const EMPTY_RUNTIME_EVENT_KINDS: readonly [] = Object.freeze([]);
const EMPTY_LINEAGE_AUTHORITY_REFS: readonly string[] = Object.freeze([]);

function observationId(input: {
  readonly analysisRef: string;
  readonly currentEdge: string | null;
  readonly requirementPressureIds: readonly string[];
}): string {
  return `observation:${input.analysisRef}:${input.currentEdge ?? "none"}:${input.requirementPressureIds.join(",")}`;
}

function openReasonRefsForRequirement(input: {
  readonly requirementId: string;
  readonly openReasons: readonly string[];
}): readonly string[] {
  return Object.freeze(
    input.openReasons.map(
      (reason) =>
        `requirement-open://odd-sdlc/${encodeURIComponent(input.requirementId)}/${encodeURIComponent(reason)}`
    )
  );
}

function isRequirementLineageAuthorityFailureReason(reason: string): boolean {
  return (
    reason === "no_imported_requirement_authority" ||
    reason === "requirement_authority_missing" ||
    reason === "requirement_authority_ambiguous" ||
    reason === "requirement_authority_contradictory" ||
    reason === "requirement_lineage_missing" ||
    reason === "requirement_lineage_stale" ||
    reason === "authority_input_ambiguous" ||
    reason.startsWith("ambiguous_requirement_authority") ||
    reason.startsWith("contradictory_requirement_authority") ||
    reason.startsWith("stale_requirement_authority") ||
    reason.startsWith("stale_requirement_lineage")
  );
}

function isIntentAuthorityFailureReason(reason: string): boolean {
  return (
    reason === "intent_surface_missing" ||
    reason === "intent_authority_missing" ||
    reason === "intent_authority_ambiguous" ||
    reason === "intent_authority_contradictory" ||
    reason === "intent_renewal_required" ||
    reason === "constitutional_intent_insufficient" ||
    reason.startsWith("stale_intent_authority") ||
    reason.startsWith("ambiguous_intent_authority") ||
    reason.startsWith("contradictory_intent_authority")
  );
}

function isGoalsAuthorityFailureReason(reason: string): boolean {
  return (
    reason === "goals_surface_missing" ||
    reason === "goal_authority_missing" ||
    reason === "goal_authority_ambiguous" ||
    reason === "goal_authority_contradictory" ||
    reason === "goals_renewal_required" ||
    reason === "current_goals_insufficient" ||
    reason.startsWith("stale_goal_authority") ||
    reason.startsWith("ambiguous_goal_authority") ||
    reason.startsWith("contradictory_goal_authority")
  );
}

function isProductAuthorityFailureReason(reason: string): boolean {
  return (
    reason === "product_surface_missing" ||
    reason === "product_authority_missing" ||
    reason === "product_authority_ambiguous" ||
    reason === "product_authority_contradictory" ||
    reason === "product_asset_model_missing" ||
    reason === "declared_product_target_missing" ||
    reason === "target_binding_required_before_next_action" ||
    reason.startsWith("stale_product_authority") ||
    reason.startsWith("ambiguous_product_authority") ||
    reason.startsWith("contradictory_product_authority")
  );
}

function isDesignPressureReason(reason: string): boolean {
  return (
    reason === "design_surface_missing" ||
    reason === "design_link_missing" ||
    reason === "design_authority_missing" ||
    reason === "module_design_missing" ||
    reason === "implementation_design_missing" ||
    reason === "design_reframe_required" ||
    reason.startsWith("design_completeness_") ||
    reason.startsWith("design_module_schema_missing") ||
    reason.startsWith("design_entity_missing") ||
    reason.startsWith("design_state_diagram_missing")
  );
}

function predecessorTransformRefsFor(
  lineageBasisRefs: readonly string[]
): readonly string[] {
  return uniqueSorted(
    lineageBasisRefs.filter(
      (ref) =>
        ref.startsWith("transform-obligation://") ||
        ref.startsWith("requirement-transform://") ||
        ref.startsWith("requirement-lineage://")
    )
  );
}

function transformLineageFor(input: {
  readonly closureRegister: SdlcRequirementClosureRegister;
  readonly currentEdge: string | null;
  readonly requirementTransformAuthorities?: readonly SdlcRequirementTransformAuthority[];
}): readonly SdlcRequirementTransformLineage[] {
  const encodedEdge = encodeURIComponent(input.currentEdge ?? "none");
  const transformAuthorityByRequirementId = new Map(
    (input.requirementTransformAuthorities ?? []).map((authority) => [
      authority.requirementId,
      authority
    ])
  );
  return Object.freeze(
    input.closureRegister.entries
      .filter((entry) => entry.fulfillmentStatus !== "fulfilled")
      .map((entry) => {
        const encodedRequirementId = encodeURIComponent(entry.requirementId);
        const transformAuthority =
          transformAuthorityByRequirementId.get(entry.requirementId) ?? null;
        const lineageAuthorityRefs =
          transformAuthority === null
            ? EMPTY_LINEAGE_AUTHORITY_REFS
            : uniqueSorted([
                transformAuthority.transformRef,
                transformAuthority.transformInputAuthorityRef,
                transformAuthority.transformOutputAuthorityRef,
                ...transformAuthority.predecessorTransformRefs
              ]);
        const lineageBasisRefs = uniqueSorted([
          ...entry.sourceInputUris,
          ...entry.evidenceRefs,
          ...(transformAuthority === null
            ? []
            : [
                ...transformAuthority.sourceInputUris,
                ...transformAuthority.evidenceRefs,
                ...lineageAuthorityRefs
              ]),
          ...openReasonRefsForRequirement({
            requirementId: entry.requirementId,
            openReasons: entry.openReasons
          }),
          `requirement://${entry.requirementId}`
        ]);
        const predecessorTransformRefs =
          transformAuthority?.predecessorTransformRefs ??
          predecessorTransformRefsFor(lineageBasisRefs);
        const hasLineageAuthorityFailure =
          entry.openReasons.some(isRequirementLineageAuthorityFailureReason) ||
          transformAuthority?.status === "stale" ||
          transformAuthority?.status === "ambiguous" ||
          transformAuthority?.status === "contradictory";
        const lineageStatus = hasLineageAuthorityFailure
          ? "lineage_authority_failure"
          : transformAuthority === null &&
              entry.sourceInputUris.length === 0 &&
              entry.evidenceRefs.length === 0
            ? "lineage_absent"
            : "lineage_observed";
        return Object.freeze({
          kind: "sdlc_requirement_transform_lineage" as const,
          requirementId: entry.requirementId,
          currentEdge: input.currentEdge,
          transformLineageRef:
            `requirement-lineage://odd-sdlc/${encodedEdge}/${encodedRequirementId}`,
          immediateTransformObligationRef:
            `transform-obligation://odd-sdlc/${encodedEdge}/${encodedRequirementId}`,
          transformInputAuthorityRef:
            transformAuthority?.transformOutputAuthorityRef ??
            `requirement-authority://odd-sdlc/${encodedRequirementId}/An`,
          transformOutputExpectationRef:
            `requirement-expectation://odd-sdlc/${encodedEdge}/${encodedRequirementId}/Bn`,
          predecessorTransformRefs,
          lineageDepth: predecessorTransformRefs.length + 1,
          sourceInputUris: uniqueSorted([
            ...entry.sourceInputUris,
            ...(transformAuthority?.sourceInputUris ?? [])
          ]),
          lineageSource:
            transformAuthority === null
              ? "closure_register_fallback" as const
              : "requirement_transform_authority" as const,
          lineageAuthorityRefs,
          lineageBasisRefs,
          lineageStatus,
          emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
        });
      })
  );
}

export function observeSdlcGapPressure(input: {
  readonly gapDossier: SdlcGapDossier;
  readonly closureRegister: SdlcRequirementClosureRegister;
  readonly requirementTransformAuthorities?: readonly SdlcRequirementTransformAuthority[];
  readonly analysisRef: string;
}): SdlcGapObservation {
  const requirementPressureIds = input.closureRegister.unresolvedRequirementIds;
  const requirementOpenReasonCodes = uniqueSorted(
    input.closureRegister.entries
      .filter((entry) => entry.fulfillmentStatus !== "fulfilled")
      .flatMap((entry) => entry.openReasons)
  );
  const requirementOpenReasonRefs = uniqueSorted(
    input.closureRegister.entries
      .filter((entry) => entry.fulfillmentStatus !== "fulfilled")
      .flatMap((entry) => openReasonRefsForRequirement({
        requirementId: entry.requirementId,
        openReasons: entry.openReasons
      }))
  );
  const currentEdge = input.gapDossier.edge;
  const requirementTransformLineage = transformLineageFor({
    closureRegister: input.closureRegister,
    currentEdge,
    ...(input.requirementTransformAuthorities === undefined
      ? {}
      : {
          requirementTransformAuthorities: input.requirementTransformAuthorities
        })
  });
  return Object.freeze({
    kind: "sdlc_gap_observation",
    observationId: observationId({
      analysisRef: input.analysisRef,
      currentEdge,
      requirementPressureIds
    }),
    analysisRef: input.analysisRef,
    gapStatus: input.gapDossier.status,
    currentEdge,
    requirementPressureIds,
    requirementOpenReasonCodes,
    requirementOpenReasonRefs,
    requirementTransformLineage,
    evidenceRefs: uniqueSorted([
      ...input.gapDossier.evidenceRefs,
      ...requirementOpenReasonRefs,
      ...requirementTransformLineage.flatMap((lineage) => lineage.lineageBasisRefs),
      ...requirementPressureIds.map((requirementId) => `requirement://${requirementId}`)
    ]),
    freshnessToken: `${input.analysisRef}:${input.gapDossier.status}:${currentEdge ?? "none"}`,
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}

function observationCondition(
  observation: SdlcGapObservation
): SdlcTriageClassificationCondition {
  if (
    observation.gapStatus === "converged" &&
    observation.requirementPressureIds.length === 0
  ) {
    return "converged_without_requirement_pressure";
  }
  if (observation.requirementOpenReasonCodes.some(isIntentAuthorityFailureReason)) {
    return "intent_authority_failure";
  }
  if (observation.requirementOpenReasonCodes.some(isGoalsAuthorityFailureReason)) {
    return "goals_authority_failure";
  }
  if (observation.requirementOpenReasonCodes.some(isProductAuthorityFailureReason)) {
    return "product_authority_failure";
  }
  if (
    observation.requirementTransformLineage.some(
      (lineage) => lineage.lineageStatus !== "lineage_observed"
    ) ||
    observation.requirementOpenReasonCodes.some(
      isRequirementLineageAuthorityFailureReason
    )
  ) {
    return "requirement_lineage_authority_failure";
  }
  if (observation.requirementOpenReasonCodes.some(isDesignPressureReason)) {
    return "design_pressure_present";
  }
  if (
    observation.requirementOpenReasonCodes.some(
      (reason) =>
        reason === "no_generated_asset_lineage" ||
        reason === "generated_asset_contract_unsatisfied"
    )
  ) {
    return "code_pressure_present";
  }
  if (
    observation.requirementOpenReasonCodes.some(
      (reason) =>
        reason === "behavioral_evidence_missing" ||
        reason === "behavioral_evidence_not_bound_to_satisfied_generated_asset" ||
        reason === "proof_claim_missing"
    )
  ) {
    return "test_pressure_present";
  }
  if (observation.requirementPressureIds.length > 0) {
    return "requirement_pressure_present";
  }
  if (observation.gapStatus === "open" || observation.gapStatus === "partial") {
    return "open_or_partial_gap";
  }
  return "fallback";
}

function classifyObservation(observation: SdlcGapObservation): {
  readonly frameworkLayer: SdlcTriageFrameworkLayer;
  readonly frameworkCondition: SdlcTriageCondition;
  readonly processOutcome: SdlcTriageProcessOutcome;
  readonly domainMeaning: string;
} {
  const condition = observationCondition(observation);
  const policy = SDLC_TRIAGE_CLASSIFICATION_POLICY.find(
    (entry) => entry.condition === condition
  );
  if (policy === undefined) {
    throw new TypeError(`SdlcTriagePolicy: missing classification policy ${condition}`);
  }
  return {
    frameworkLayer: policy.frameworkLayer,
    frameworkCondition: policy.frameworkCondition,
    processOutcome: policy.processOutcome,
    domainMeaning: policy.domainMeaning
  };
}

export function classifySdlcGapObservation(input: {
  readonly observation: SdlcGapObservation;
  readonly ambiguityCarried?: boolean;
}): SdlcTriageClassification {
  const classification = classifyObservation(input.observation);
  return Object.freeze({
    kind: "sdlc_triage_classification",
    observationId: input.observation.observationId,
    frameworkLayer: classification.frameworkLayer,
    frameworkCondition: classification.frameworkCondition,
    domainMeaning: classification.domainMeaning,
    processOutcome: classification.processOutcome,
    ambiguityCarried: input.ambiguityCarried ?? false,
    evidenceRefs: Object.freeze([...input.observation.evidenceRefs]),
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}

function routePolicyFor(
  classification: SdlcTriageClassification
): SdlcTriageRoutePolicyEntry {
  let policyName: SdlcTriageRoutePolicyEntry["routePolicy"];
  if (classification.processOutcome === "gap_retired") {
    policyName = "gap_retired";
  } else if (classification.frameworkLayer === "intent") {
    policyName = "intent_reprice";
  } else if (classification.frameworkLayer === "goals") {
    policyName = "goals_reprice";
  } else if (classification.frameworkLayer === "product") {
    policyName = "product_reprice";
  } else if (classification.frameworkLayer === "requirements") {
    policyName = "requirements_pressure";
  } else if (classification.frameworkLayer === "design") {
    policyName = "design_repair";
  } else if (classification.frameworkLayer === "code") {
    policyName = "code_repair";
  } else if (classification.frameworkLayer === "test") {
    policyName = "test_repair";
  } else {
    policyName = "default_repair";
  }
  const policy = SDLC_TRIAGE_ROUTE_POLICY.find(
    (entry) => entry.routePolicy === policyName
  );
  if (policy === undefined) {
    throw new TypeError(`SdlcTriagePolicy: missing route policy ${policyName}`);
  }
  return policy;
}

function classificationLayerOrCode(
  classification: SdlcTriageClassification
): SdlcTriageReEntryLayer {
  if (
    classification.frameworkLayer === "intent" ||
    classification.frameworkLayer === "goals" ||
    classification.frameworkLayer === "product" ||
    classification.frameworkLayer === "requirements" ||
    classification.frameworkLayer === "design" ||
    classification.frameworkLayer === "code" ||
    classification.frameworkLayer === "test"
  ) {
    return classification.frameworkLayer;
  }
  return "code";
}

function reEntryLayerFor(input: {
  readonly classification: SdlcTriageClassification;
  readonly routePolicy: SdlcTriageRoutePolicyEntry;
}): SdlcTriageReEntryLayer {
  return input.routePolicy.reEntryLayer === "classification_layer_or_code"
    ? classificationLayerOrCode(input.classification)
    : input.routePolicy.reEntryLayer;
}

function targetGraphFunctionFor(input: {
  readonly routePolicy: SdlcTriageRoutePolicyEntry;
  readonly observation: SdlcGapObservation;
}): string | null {
  if (input.routePolicy.targetStrategy === "none") {
    return null;
  }
  if (input.routePolicy.targetStrategy === "propose_constitutional_repricing") {
    return "propose_constitutional_repricing";
  }
  if (input.routePolicy.targetStrategy === "derive_design_surface") {
    return "derive_design_surface";
  }
  if (input.routePolicy.targetStrategy === "derive_requirement_surface") {
    return "derive_requirement_surface";
  }
  if (input.routePolicy.targetStrategy === "derive_code_surface") {
    return "derive_code_surface";
  }
  if (input.routePolicy.targetStrategy === "derive_test_run_archive_surface") {
    return "derive_test_run_archive_surface";
  }
  return input.observation.currentEdge;
}

export function bindSdlcRoute(input: {
  readonly observation: SdlcGapObservation;
  readonly classification: SdlcTriageClassification;
}): SdlcRouteBinding {
  const routePolicy = routePolicyFor(input.classification);
  const reEntryLayer = reEntryLayerFor({
    classification: input.classification,
    routePolicy
  });
  const targetGraphFunction = targetGraphFunctionFor({
    routePolicy,
    observation: input.observation
  });
  const routeKind = routePolicy.routeKind;
  return Object.freeze({
    kind: "sdlc_route_binding",
    routeId: `route:${input.observation.observationId}`,
    observationId: input.observation.observationId,
    reEntryLayer,
    routeKind,
    targetGraphFunction,
    lawfulStartTarget: Object.freeze({
      kind: targetGraphFunction === null ? "none" : "graph_function",
      handle: targetGraphFunction
    }),
    routeEligibility: targetGraphFunction === null && routeKind !== "gap_retired" ? "blocked" : "eligible",
    preservedSignals: uniqueSorted([
      input.classification.frameworkCondition,
      ...input.observation.requirementPressureIds
    ]),
    mayApplyConstitutionalChange: false,
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}

export function proposeSdlcConstitutionalRepricing(input: {
  readonly classification: SdlcTriageClassification;
  readonly targetSurface: SdlcConstitutionalRepricingProposal["targetSurface"];
  readonly proposedChangeSummary: string;
}): SdlcConstitutionalRepricingProposal {
  if (input.classification.processOutcome !== "constitutional_reprice_required") {
    throw new TypeError(
      `SdlcConstitutionalRepricing: ${input.classification.observationId} is ${input.classification.processOutcome}, not constitutional_reprice_required`
    );
  }
  return Object.freeze({
    kind: "sdlc_constitutional_repricing_proposal",
    proposalId: `repricing:${input.classification.observationId}:${input.targetSurface}`,
    observationId: input.classification.observationId,
    targetSurface: input.targetSurface,
    proposedChangeSummary: input.proposedChangeSummary,
    approvalRequired: true,
    approvalOutcome: null,
    proposalApplied: false,
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}

export function routeSdlcTicketWorkItem(input: {
  readonly routeBinding: SdlcRouteBinding;
  readonly workItemRef: string;
  readonly lawfulReEntryPoint: string;
}): SdlcTicketWorkItemRoute {
  return Object.freeze({
    kind: "sdlc_ticket_work_item_route",
    workItemRef: input.workItemRef,
    routeBindingId: input.routeBinding.routeId,
    ticketAuthority: "TICKET_METHOD",
    ticketStatus: "proposed",
    lawfulReEntryPoint: input.lawfulReEntryPoint,
    writesTicket: false,
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}

export function retireSdlcGapAfterLoopback(input: {
  readonly observation: SdlcGapObservation;
  readonly closureRegister: SdlcRequirementClosureRegister;
  readonly evidenceRefs: readonly string[];
}): SdlcGapRetirement {
  const unresolvedRequirementIds = input.closureRegister.unresolvedRequirementIds;
  const status =
    input.observation.gapStatus === "converged" && unresolvedRequirementIds.length === 0
      ? "gap_retired"
      : "gap_still_open";
  return Object.freeze({
    kind: "sdlc_gap_retirement",
    observationId: input.observation.observationId,
    status,
    unresolvedRequirementIds,
    evidenceRefs: uniqueSorted(input.evidenceRefs),
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}
