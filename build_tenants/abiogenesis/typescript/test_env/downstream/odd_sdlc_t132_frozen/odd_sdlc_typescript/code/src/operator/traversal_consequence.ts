// Implements: T-136
// Implements: T-138

import type {
  AllowedConsequenceTraversalCatalog,
  ConsequenceTraversalAction,
  GtlAdmittedStateRef,
  GtlConsequenceProjectionRef
} from "@abiogenesis/typescript-tenant";
import {
  admitConsequenceTraversalActionForAllowedCatalog,
  constructConsequenceTraversalAction
} from "@abiogenesis/typescript-tenant";
import type {
  SdlcEdgeAssuranceCloseDecision,
  SdlcTargetCarrierClosureStatus
} from "./edge_gain_closure.js";
import type { SdlcSelectedAbgFnCompositionIdentity } from "./composition_identity.js";
import type { SdlcTraversalStrategyDecision } from "./carriers.js";
import { uniqueSorted } from "../shared/collections.js";
import { sdlcPublishedTraversalTargetRef } from "../graph/boundary_refs.js";

export type SdlcEdgeClosureDisposition =
  | "close"
  | "yield"
  | "retry"
  | "repair"
  | "re-enter"
  | "reprice"
  | "block";

export type SdlcYieldKind =
  | "process_active_under_liveness_observer"
  | "budget_checkpoint_with_admitted_progress"
  | "awaiting_external_execution_evidence"
  | "awaiting_fh_input"
  | "partial_product_evidence_admitted_current_edge_should_resume"
  | "nonlocal_repair_surface_admitted_upstream_reentry"
  | "operator_requested_bounded_stop";

export type SdlcNextActionBasisKind =
  | "initial_selection"
  | "post_yield_resume"
  | "post_close_graph_continuation"
  | "post_retry"
  | "post_repair"
  | "post_reenter"
  | "post_reprice"
  | "post_block";

export interface SdlcTraversalConsequenceRefs {
  readonly kind: "sdlc_traversal_consequence_refs";
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly constructionIntentRef: string;
  readonly worksiteEvidenceRef: string;
  readonly edgeFulfillmentLedgerRef: string;
  readonly edgeClosureDecisionRef: string;
  readonly nextActionProjectionRef: string;
  readonly admittedStateRef: string;
  readonly consequenceProjectionRef: string;
}

export interface SdlcConstructionIntent {
  readonly kind: "sdlc_construction_intent";
  readonly intentRef: string;
  readonly intentEventRefs: readonly string[];
  readonly productAssetModelRef: string;
  readonly selectedPriorityRowRef: string;
  readonly nextActionProjectionRef: string;
  readonly selectedActionRef: string;
  readonly basisRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}

export interface SdlcWorksiteEvidence {
  readonly kind: "sdlc_worksite_evidence";
  readonly evidenceBundleRef: string;
  readonly intentRef: string;
  readonly invocationRef: string;
  readonly processEventRefs: readonly string[];
  readonly productEvidenceRefs: readonly string[];
  readonly admittedProgressRefs: readonly string[];
  readonly livenessProjectionRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}

export interface SdlcEdgeFulfillmentCounts {
  readonly expected: number;
  readonly fulfilled: number;
  readonly partial: number;
  readonly blocked: number;
  readonly unfulfilled: number;
  readonly missing: number;
  readonly extra: number;
}

export type SdlcObligationCarryDirection =
  | "edge_local"
  | "downstream_transformation_set";

export type SdlcEdgeFulfillmentAssessmentStatus =
  | "fulfilled"
  | "partial"
  | "blocked"
  | "unassessed";

export interface SdlcEdgeFulfillmentAssessmentInput {
  readonly obligationId: string;
  readonly fulfillmentStatus: SdlcEdgeFulfillmentAssessmentStatus;
  readonly evidenceRefs?: readonly string[];
  readonly carryDirection?: SdlcObligationCarryDirection;
  readonly downstreamGraphFunctionRefs?: readonly string[];
  readonly targetBindingRefs?: readonly string[];
}

export interface SdlcEdgeFulfillmentCountProjection {
  readonly counts: SdlcEdgeFulfillmentCounts;
  readonly assessmentCount: number;
  readonly edgeLocalObligationIds: readonly string[];
  readonly downstreamTransformationSetRefs: readonly string[];
  readonly downstreamPressureRefs: readonly string[];
  readonly downstreamTargetBindingRefs: readonly string[];
  readonly nonConvergedReasonRefs: readonly string[];
}

export interface SdlcEdgeFulfillmentLedger {
  readonly kind: "sdlc_edge_fulfillment_ledger";
  readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly ledgerRef: string;
  readonly ledgerVersionRef: string;
  readonly overlayRef: string | null;
  readonly overlayBindingRef: string | null;
  readonly graphCatalogDigestRef: string | null;
  readonly edgeAssuranceContractRef: string | null;
  readonly edgeAssuranceContractDigest: string | null;
  readonly targetCarrierContractRef: string | null;
  readonly targetCarrierContractDigest: string | null;
  readonly targetCarrierAdmissionStatus: SdlcTargetCarrierClosureStatus;
  readonly targetCarrierAdmissionRef: string | null;
  readonly edgeGainRef: string | null;
  readonly edgeResidualPressureRefs: readonly string[];
  readonly edgeRef: string;
  readonly attemptRef: string;
  readonly targetBindingRefs: readonly string[];
  readonly evidenceBundleRefs: readonly string[];
  readonly materializationRefs: readonly string[];
  readonly livenessProjectionRefs: readonly string[];
  readonly admissionRefs: readonly string[];
  readonly downstreamTransformationSetRefs: readonly string[];
  readonly downstreamPressureRefs: readonly string[];
  readonly downstreamTargetBindingRefs: readonly string[];
  readonly counts: SdlcEdgeFulfillmentCounts;
  readonly assessmentCount: number;
  readonly carryConverged: boolean;
  readonly fulfillmentConverged: boolean;
  readonly admitted: boolean;
  readonly targetCertificationPassed: boolean;
  readonly fdRecheckPassed: boolean;
  readonly edgeConverged: boolean;
  readonly predecessorRefs: readonly string[];
}

export interface SdlcYieldResumeBasis {
  readonly kind: "sdlc_yield_resume_basis";
  readonly yieldKind: SdlcYieldKind;
  readonly resumeBasisRef: string;
  readonly currentEdgeRef: string;
  readonly admittedProgressRefs: readonly string[];
  readonly livenessProjectionRef: string | null;
  readonly resumePolicyRef: string | null;
}

export interface SdlcEdgeClosureDecision {
  readonly kind: "sdlc_edge_closure_decision";
  readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly decisionRef: string;
  readonly ledgerRef: string;
  readonly ledgerVersionRef: string;
  readonly overlayRef: string | null;
  readonly overlayBindingRef: string | null;
  readonly graphCatalogDigestRef: string | null;
  readonly edgeAssuranceContractRef: string | null;
  readonly edgeAssuranceContractDigest: string | null;
  readonly targetCarrierContractRef: string | null;
  readonly targetCarrierContractDigest: string | null;
  readonly targetCarrierAdmissionStatus: SdlcTargetCarrierClosureStatus;
  readonly targetCarrierAdmissionRef: string | null;
  readonly edgeGainRef: string | null;
  readonly edgeClosureFunctionRef: string | null;
  readonly edgeAssuranceDecisionRef?: string | null;
  readonly edgeResidualPressureRefs: readonly string[];
  readonly disposition: SdlcEdgeClosureDisposition;
  readonly basisRefs: readonly string[];
  readonly reasonRefs: readonly string[];
  readonly yieldResumeBasis: SdlcYieldResumeBasis | null;
  readonly predecessorRefs: readonly string[];
}

export interface SdlcEdgeClosurePolicy {
  readonly kind: "sdlc_edge_closure_policy";
  readonly policyRef: string;
  readonly dispositionPrecedence: readonly SdlcEdgeClosureDisposition[];
}

export type SdlcOverlaySegmentDisposition =
  | "overlay_segment_complete"
  | "product_converged"
  | "blocked";

export interface SdlcOverlaySegmentCompletion {
  readonly kind: "sdlc_overlay_segment_completion";
  readonly completionRef: string;
  readonly overlayRef: string;
  readonly overlayBindingRef: string;
  readonly graphCatalogDigestRef: string | null;
  readonly closureDecisionRef: string;
  readonly ledgerRef: string;
  readonly stopDisposition: SdlcOverlaySegmentDisposition;
  readonly terminalAssetTypes: readonly string[];
  readonly terminalGraphFunctionRefs: readonly string[];
  readonly remainingGraphPressureRefs: readonly string[];
  readonly remainingRequirementPressureRefs: readonly string[];
  readonly remainingAssetPressureRefs: readonly string[];
  readonly nextEligibleOverlayRefs: readonly string[];
  readonly productConverged: boolean;
  readonly predecessorRefs: readonly string[];
}

export interface SdlcNextActionProjection {
  readonly kind: "sdlc_next_action_projection";
  readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly evaluationFunction: "evaluate_next";
  readonly nextActionBasisKind: SdlcNextActionBasisKind;
  readonly nextActionProjectionRef: string;
  readonly intentEventRefs: readonly string[];
  readonly productAssetModelRef: string;
  readonly gapPressureRefs: readonly string[];
  readonly targetBindingRefs: readonly string[];
  readonly closureDecisionRef: string | null;
  readonly overlayRef: string | null;
  readonly overlayBindingRef: string | null;
  readonly graphCatalogDigestRef: string | null;
  readonly edgeAssuranceContractRef: string | null;
  readonly edgeAssuranceContractDigest: string | null;
  readonly edgeGainRef: string | null;
  readonly edgeResidualPressureRefs: readonly string[];
  readonly overlaySegmentCompletionRef: string | null;
  readonly overlayStopDisposition: SdlcOverlaySegmentDisposition | null;
  readonly remainingGraphPressureRefs: readonly string[];
  readonly remainingRequirementPressureRefs: readonly string[];
  readonly remainingAssetPressureRefs: readonly string[];
  readonly nextEligibleOverlayRefs: readonly string[];
  readonly observationRef: string;
  readonly policyRefs: readonly string[];
  readonly actionCatalogRefs: readonly string[];
  readonly selectedActionRef: string | null;
  readonly nextGraphFunctionRef: string | null;
  readonly nextGraphVectorRef: string | null;
  readonly choosesNextTraversal: boolean;
  readonly readOnly: boolean;
  readonly predecessorRefs: readonly string[];
}

export interface SdlcTraversalConsequenceReplay {
  readonly kind: "sdlc_traversal_consequence_replay";
  readonly refs: SdlcTraversalConsequenceRefs;
  readonly constructionIntent: SdlcConstructionIntent;
  readonly worksiteEvidence: SdlcWorksiteEvidence;
  readonly edgeFulfillmentLedger: SdlcEdgeFulfillmentLedger;
  readonly edgeClosureDecision: SdlcEdgeClosureDecision;
  readonly nextActionProjection: SdlcNextActionProjection;
  readonly admittedStateRef: GtlAdmittedStateRef;
  readonly consequenceProjection: GtlConsequenceProjectionRef;
}

export interface SdlcConsequenceTraversalActionBinding {
  readonly kind: "sdlc_consequence_traversal_action_binding";
  readonly bindingVersion: "ts-consequence-traversal-action-v1";
  readonly bindingRef: string;
  readonly strategyDecisionRef: string;
  readonly consequenceProjectionRef: string;
  readonly edgeClosureDecisionRef: string;
  readonly nextActionProjectionRef: string;
  readonly selectedActionRef: string;
  readonly selectedGraphFunctionRef: string;
  readonly selectedGraphVectorRef: string;
  readonly reentryTargetRef: string;
  readonly traversalAction: ConsequenceTraversalAction;
  readonly requiredAuthorityRefs: readonly string[];
  readonly proportionalityBasisRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
}

function requireNonEmptyString(value: string, label: string): string {
  if (value.trim().length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
  return value;
}

function nonNegativeInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer`);
  }
  return value;
}

function obligationReasonRef(input: {
  readonly obligationId: string;
  readonly reason: string;
}): string {
  return [
    "obligation://odd-sdlc",
    encodeURIComponent(input.obligationId),
    encodeURIComponent(input.reason)
  ].join("/");
}

function obligationDownstreamPressureRef(obligationId: string): string {
  return obligationReasonRef({
    obligationId,
    reason: "downstream_transformation_set"
  });
}

function edgeScopedPressureRef(input: {
  readonly pressureKind: string;
  readonly edgeRef: string;
  readonly reason: string;
}): string {
  return [
    "pressure://odd-sdlc",
    encodeURIComponent(input.pressureKind),
    encodeURIComponent(input.edgeRef),
    encodeURIComponent(input.reason)
  ].join("/");
}

function targetCarrierAdmissionPressureRefs(input: {
  readonly edgeRef: string;
  readonly status: SdlcTargetCarrierClosureStatus;
}): readonly string[] {
  if (input.status === "missing" || input.status === "rejected") {
    return Object.freeze([
      edgeScopedPressureRef({
        pressureKind: "target-carrier",
        edgeRef: input.edgeRef,
        reason:
          input.status === "missing"
            ? "missing_admission"
            : "rejected_admission"
      })
    ]);
  }
  return Object.freeze([]);
}

function nonEmptyUniqueSorted(
  values: readonly string[],
  label: string
): readonly string[] {
  const refs = uniqueSorted(values.filter((value) => value.trim().length > 0));
  if (refs.length === 0) {
    throw new TypeError(`${label} must contain at least one ref`);
  }
  return refs;
}

function firstNonEmpty(
  values: readonly (string | null | undefined)[],
  label: string
): string {
  const found = values.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  );
  if (found === undefined) {
    throw new TypeError(`${label} must resolve to a non-empty ref`);
  }
  return found;
}

function requireAbsoluteGraphReentryTarget(ref: string): string {
  const normalized = requireNonEmptyString(ref, "reentryTargetRef");
  if (!/^graph-reentry-point:\/\/[^/]+\/\d+$/u.test(normalized)) {
    throw new TypeError(
      "reentryTargetRef must be an absolute graph-reentry-point URI with a numeric vector index"
    );
  }
  return normalized;
}

function traversalStrategyDecisionRef(
  decision: SdlcTraversalStrategyDecision
): string {
  return [
    "strategy-decision://odd-sdlc",
    encodeURIComponent(decision.edgeName),
    encodeURIComponent(decision.targetAssetType),
    encodeURIComponent(decision.selectedStrategy),
    encodeURIComponent(decision.decisionSource)
  ].join("/");
}

function requireRefsContain(input: {
  readonly refs: readonly string[];
  readonly requiredRefs: readonly string[];
  readonly label: string;
}): void {
  const refs = new Set(input.refs);
  const missing = input.requiredRefs.filter((ref) => !refs.has(ref));
  if (missing.length > 0) {
    throw new TypeError(`${input.label} missing predecessor refs: ${missing.join(", ")}`);
  }
}

function edgeConvergedFromCounts(counts: SdlcEdgeFulfillmentCounts): boolean {
  return (
    carryConvergedFromCounts(counts) &&
    fulfillmentConvergedFromCounts(counts)
  );
}

function carryConvergedFromCounts(counts: SdlcEdgeFulfillmentCounts): boolean {
  return counts.missing === 0 && counts.extra === 0;
}

function fulfillmentConvergedFromCounts(
  counts: SdlcEdgeFulfillmentCounts
): boolean {
  return (
    counts.expected >= 0 &&
    counts.fulfilled === counts.expected &&
    counts.partial === 0 &&
    counts.blocked === 0 &&
    counts.unfulfilled === 0
  );
}

export function deriveSdlcEdgeFulfillmentCountsFromAssessments(input: {
  readonly declaredObligationIds: readonly string[];
  readonly assessments: readonly SdlcEdgeFulfillmentAssessmentInput[];
}): SdlcEdgeFulfillmentCountProjection {
  const declaredObligationIds = uniqueSorted(
    input.declaredObligationIds.filter((obligationId) => obligationId.trim().length > 0)
  );
  if (declaredObligationIds.length === 0) {
    const extraRefs = input.assessments
      .filter((assessment) => assessment.obligationId.trim().length > 0)
      .map((assessment) =>
        obligationReasonRef({
          obligationId: assessment.obligationId,
          reason: "extra"
        })
      );
    const counts = Object.freeze({
      expected: 1,
      fulfilled: 0,
      partial: 0,
      blocked: 1,
      unfulfilled: 0,
      missing: 0,
      extra: extraRefs.length
    });
    return Object.freeze({
      counts,
      assessmentCount: input.assessments.length,
      edgeLocalObligationIds: Object.freeze([]),
      downstreamTransformationSetRefs: Object.freeze([]),
      downstreamPressureRefs: Object.freeze([]),
      downstreamTargetBindingRefs: Object.freeze([]),
      nonConvergedReasonRefs: uniqueSorted([
        obligationReasonRef({
          obligationId: "declared_obligation_set",
          reason: "no_declared_obligations"
        }),
        ...extraRefs
      ])
    });
  }

  const declared = new Set(declaredObligationIds);
  const assessmentByObligationId = new Map<
    string,
    SdlcEdgeFulfillmentAssessmentInput
  >();
  const downstreamAssessmentByObligationId = new Map<
    string,
    SdlcEdgeFulfillmentAssessmentInput
  >();
  const duplicateRefs: string[] = [];
  const extraRefs: string[] = [];
  const downstreamOwnershipMissingRefs: string[] = [];

  for (const assessment of input.assessments) {
    if (!declared.has(assessment.obligationId)) {
      extraRefs.push(
        obligationReasonRef({
          obligationId: assessment.obligationId,
          reason: "extra"
        })
      );
      continue;
    }
    const carryDirection = assessment.carryDirection ?? "edge_local";
    if (carryDirection === "downstream_transformation_set") {
      const hasDownstreamOwnership =
        (assessment.downstreamGraphFunctionRefs?.length ?? 0) > 0 &&
        (assessment.targetBindingRefs?.length ?? 0) > 0;
      if (hasDownstreamOwnership) {
        if (
          downstreamAssessmentByObligationId.has(assessment.obligationId) ||
          assessmentByObligationId.has(assessment.obligationId)
        ) {
          duplicateRefs.push(
            obligationReasonRef({
              obligationId: assessment.obligationId,
              reason: "duplicate"
            })
          );
          continue;
        }
        downstreamAssessmentByObligationId.set(assessment.obligationId, assessment);
        continue;
      }
      downstreamOwnershipMissingRefs.push(
        obligationReasonRef({
          obligationId: assessment.obligationId,
          reason: "downstream_ownership_missing"
        })
      );
    }
    if (assessmentByObligationId.has(assessment.obligationId)) {
      duplicateRefs.push(
        obligationReasonRef({
          obligationId: assessment.obligationId,
          reason: "duplicate"
        })
      );
      continue;
    }
    assessmentByObligationId.set(assessment.obligationId, assessment);
  }

  let fulfilled = 0;
  let partial = 0;
  let blocked = 0;
  let unfulfilled = 0;
  const nonConvergedReasonRefs: string[] = [];
  const edgeLocalObligationIds = declaredObligationIds.filter(
    (obligationId) => !downstreamAssessmentByObligationId.has(obligationId)
  );

  for (const obligationId of edgeLocalObligationIds) {
    const assessment = assessmentByObligationId.get(obligationId);
    if (assessment === undefined) {
      nonConvergedReasonRefs.push(
        obligationReasonRef({ obligationId, reason: "missing" })
      );
      continue;
    }
    if (assessment.fulfillmentStatus === "fulfilled") {
      fulfilled += 1;
      continue;
    }
    if (assessment.fulfillmentStatus === "partial") {
      partial += 1;
    } else if (assessment.fulfillmentStatus === "blocked") {
      blocked += 1;
    } else {
      unfulfilled += 1;
    }
    nonConvergedReasonRefs.push(
      obligationReasonRef({
        obligationId,
        reason: assessment.fulfillmentStatus
      })
    );
  }

  const missing = edgeLocalObligationIds.length - assessmentByObligationId.size;
  const downstreamAssessments = [...downstreamAssessmentByObligationId.values()];
  const downstreamPressureRefs = uniqueSorted(
    downstreamAssessments.flatMap((assessment) => [
      obligationDownstreamPressureRef(assessment.obligationId),
      ...(assessment.evidenceRefs ?? []),
      ...(assessment.downstreamGraphFunctionRefs ?? [])
    ])
  );
  const downstreamTargetBindingRefs = uniqueSorted(
    downstreamAssessments.flatMap(
      (assessment) => assessment.targetBindingRefs ?? []
    )
  );
  const counts = Object.freeze({
    expected: edgeLocalObligationIds.length,
    fulfilled,
    partial,
    blocked,
    unfulfilled,
    missing,
    extra: extraRefs.length + duplicateRefs.length
  });
  return Object.freeze({
    counts,
    assessmentCount: input.assessments.length,
    edgeLocalObligationIds: uniqueSorted(edgeLocalObligationIds),
    downstreamTransformationSetRefs: uniqueSorted(
      downstreamAssessments.map((assessment) =>
        obligationDownstreamPressureRef(assessment.obligationId)
      )
    ),
    downstreamPressureRefs,
    downstreamTargetBindingRefs,
    nonConvergedReasonRefs: uniqueSorted([
      ...nonConvergedReasonRefs,
      ...extraRefs,
      ...duplicateRefs,
      ...downstreamOwnershipMissingRefs
    ])
  });
}

export const SDLC_DEFAULT_EDGE_CLOSURE_POLICY: SdlcEdgeClosurePolicy =
  Object.freeze({
    kind: "sdlc_edge_closure_policy" as const,
    policyRef: "closure-policy://odd-sdlc/default-edge-closure",
    dispositionPrecedence: Object.freeze([
      "close",
      "yield",
      "reprice",
      "repair",
      "re-enter",
      "retry",
      "block"
    ] satisfies readonly SdlcEdgeClosureDisposition[])
  });

function validateClosurePolicy(policy: SdlcEdgeClosurePolicy): void {
  const allowed = new Set<SdlcEdgeClosureDisposition>([
    "close",
    "yield",
    "retry",
    "repair",
    "re-enter",
    "reprice",
    "block"
  ]);
  const seen = new Set<string>();
  for (const disposition of policy.dispositionPrecedence) {
    if (!allowed.has(disposition)) {
      throw new TypeError(`unknown closure disposition in policy: ${disposition}`);
    }
    if (seen.has(disposition)) {
      throw new TypeError(`duplicate closure disposition in policy: ${disposition}`);
    }
    seen.add(disposition);
  }
  if (!seen.has("block")) {
    throw new TypeError("closure policy must include block fallback");
  }
}

function dispositionFromPolicy(input: {
  readonly policy: SdlcEdgeClosurePolicy;
  readonly candidates: ReadonlySet<SdlcEdgeClosureDisposition>;
}): SdlcEdgeClosureDisposition {
  validateClosurePolicy(input.policy);
  for (const disposition of input.policy.dispositionPrecedence) {
    if (input.candidates.has(disposition)) {
      return disposition;
    }
  }
  return "block";
}

function decodedRefForClosureClassification(input: string): string {
  let decoded = input;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        return decoded;
      }
      decoded = next;
    } catch {
      return decoded;
    }
  }
  return decoded;
}

function edgeAssuranceReasonSupportsRepairReentry(ref: string): boolean {
  const decoded = decodedRefForClosureClassification(ref);
  return (
    decoded.includes("component_repair_schedule_repair_required") ||
    decoded.includes("component_repair_schedule_row:") ||
    decoded.includes("test_execution_result_failed")
  );
}

function assertYieldProgressNotOnlyLiveness(input: {
  readonly admittedProgressRefs: readonly string[];
  readonly livenessProjectionRef: string | null;
  readonly ledgerLivenessProjectionRefs: readonly string[];
}): void {
  const livenessRefs = new Set([
    ...input.ledgerLivenessProjectionRefs,
    ...(input.livenessProjectionRef === null ? [] : [input.livenessProjectionRef])
  ]);
  if (input.admittedProgressRefs.every((ref) => livenessRefs.has(ref))) {
    throw new TypeError("yield requires admitted progress beyond liveness refs");
  }
}

export function constructSdlcConstructionIntent(input: {
  readonly intentRef: string;
  readonly intentEventRefs: readonly string[];
  readonly productAssetModelRef: string;
  readonly selectedPriorityRowRef: string;
  readonly nextActionProjectionRef: string;
  readonly selectedActionRef: string;
  readonly basisRefs: readonly string[];
  readonly predecessorRefs?: readonly string[];
}): SdlcConstructionIntent {
  const intentEventRefs = nonEmptyUniqueSorted(
    input.intentEventRefs,
    "intentEventRefs"
  );
  const productAssetModelRef = requireNonEmptyString(
    input.productAssetModelRef,
    "productAssetModelRef"
  );
  return Object.freeze({
    kind: "sdlc_construction_intent" as const,
    intentRef: requireNonEmptyString(input.intentRef, "intentRef"),
    intentEventRefs,
    productAssetModelRef,
    selectedPriorityRowRef: requireNonEmptyString(
      input.selectedPriorityRowRef,
      "selectedPriorityRowRef"
    ),
    nextActionProjectionRef: requireNonEmptyString(
      input.nextActionProjectionRef,
      "nextActionProjectionRef"
    ),
    selectedActionRef: requireNonEmptyString(
      input.selectedActionRef,
      "selectedActionRef"
    ),
    basisRefs: uniqueSorted(input.basisRefs),
    predecessorRefs: uniqueSorted([
      ...intentEventRefs,
      productAssetModelRef,
      input.selectedPriorityRowRef,
      input.nextActionProjectionRef,
      ...input.basisRefs,
      ...(input.predecessorRefs ?? [])
    ])
  });
}

export function constructSdlcWorksiteEvidence(input: {
  readonly evidenceBundleRef: string;
  readonly intentRef: string;
  readonly invocationRef: string;
  readonly processEventRefs?: readonly string[];
  readonly productEvidenceRefs?: readonly string[];
  readonly admittedProgressRefs?: readonly string[];
  readonly livenessProjectionRefs?: readonly string[];
  readonly predecessorRefs?: readonly string[];
}): SdlcWorksiteEvidence {
  const evidence = Object.freeze({
    kind: "sdlc_worksite_evidence" as const,
    evidenceBundleRef: requireNonEmptyString(
      input.evidenceBundleRef,
      "evidenceBundleRef"
    ),
    intentRef: requireNonEmptyString(input.intentRef, "intentRef"),
    invocationRef: requireNonEmptyString(input.invocationRef, "invocationRef"),
    processEventRefs: uniqueSorted(input.processEventRefs ?? []),
    productEvidenceRefs: uniqueSorted(input.productEvidenceRefs ?? []),
    admittedProgressRefs: uniqueSorted(input.admittedProgressRefs ?? []),
    livenessProjectionRefs: uniqueSorted(input.livenessProjectionRefs ?? []),
    predecessorRefs: uniqueSorted([
      input.intentRef,
      input.invocationRef,
      ...(input.predecessorRefs ?? [])
    ])
  });
  requireRefsContain({
    refs: evidence.predecessorRefs,
    requiredRefs: [evidence.intentRef, evidence.invocationRef],
    label: evidence.evidenceBundleRef
  });
  return evidence;
}

export function constructSdlcEdgeFulfillmentLedger(input: {
  readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity;
  readonly ledgerRef: string;
  readonly ledgerVersionRef: string;
  readonly overlayRef?: string | null;
  readonly overlayBindingRef?: string | null;
  readonly graphCatalogDigestRef?: string | null;
  readonly edgeAssuranceContractRef?: string | null;
  readonly edgeAssuranceContractDigest?: string | null;
  readonly targetCarrierContractRef?: string | null;
  readonly targetCarrierContractDigest?: string | null;
  readonly targetCarrierAdmissionStatus?: SdlcTargetCarrierClosureStatus | null;
  readonly targetCarrierAdmissionRef?: string | null;
  readonly edgeGainRef?: string | null;
  readonly edgeResidualPressureRefs?: readonly string[];
  readonly edgeRef: string;
  readonly attemptRef: string;
  readonly targetBindingRefs: readonly string[];
  readonly evidenceBundleRefs: readonly string[];
  readonly materializationRefs?: readonly string[];
  readonly livenessProjectionRefs?: readonly string[];
  readonly admissionRefs?: readonly string[];
  readonly downstreamTransformationSetRefs?: readonly string[];
  readonly downstreamPressureRefs?: readonly string[];
  readonly downstreamTargetBindingRefs?: readonly string[];
  readonly counts: SdlcEdgeFulfillmentCounts;
  readonly assessmentCount?: number;
  readonly admitted?: boolean;
  readonly targetCertificationPassed?: boolean;
  readonly fdRecheckPassed?: boolean;
  readonly predecessorRefs?: readonly string[];
}): SdlcEdgeFulfillmentLedger {
  const counts = Object.freeze({
    expected: nonNegativeInteger(input.counts.expected, "counts.expected"),
    fulfilled: nonNegativeInteger(input.counts.fulfilled, "counts.fulfilled"),
    partial: nonNegativeInteger(input.counts.partial, "counts.partial"),
    blocked: nonNegativeInteger(input.counts.blocked, "counts.blocked"),
    unfulfilled: nonNegativeInteger(
      input.counts.unfulfilled,
      "counts.unfulfilled"
    ),
    missing: nonNegativeInteger(input.counts.missing, "counts.missing"),
    extra: nonNegativeInteger(input.counts.extra, "counts.extra")
  });
  const targetBindingRefs = nonEmptyUniqueSorted(
    input.targetBindingRefs,
    "targetBindingRefs"
  );
  const evidenceBundleRefs = nonEmptyUniqueSorted(
    input.evidenceBundleRefs,
    "evidenceBundleRefs"
  );
  const carryConverged = carryConvergedFromCounts(counts);
  const fulfillmentConverged = fulfillmentConvergedFromCounts(counts);
  const admitted = input.admitted ?? true;
  const targetCertificationPassed = input.targetCertificationPassed ?? true;
  const fdRecheckPassed = input.fdRecheckPassed ?? true;
  const downstreamTransformationSetRefs = uniqueSorted(
    input.downstreamTransformationSetRefs ?? []
  );
  const downstreamPressureRefs = uniqueSorted(input.downstreamPressureRefs ?? []);
  const downstreamTargetBindingRefs = uniqueSorted(
    input.downstreamTargetBindingRefs ?? []
  );
  const targetCarrierIdentityDeclared =
    (input.targetCarrierContractRef !== undefined &&
      input.targetCarrierContractRef !== null) ||
    (input.edgeAssuranceContractRef !== undefined &&
      input.edgeAssuranceContractRef !== null);
  const targetCarrierAdmissionStatus: SdlcTargetCarrierClosureStatus =
    input.targetCarrierAdmissionStatus === undefined ||
    input.targetCarrierAdmissionStatus === null
      ? targetCarrierIdentityDeclared
        ? "missing"
        : "not_required"
      : input.targetCarrierAdmissionStatus;
  const edgeRef = requireNonEmptyString(input.edgeRef, "edgeRef");
  const selectedComposition = input.selectedComposition;
  const targetCarrierPressureRefs = targetCarrierAdmissionPressureRefs({
    edgeRef,
    status: targetCarrierAdmissionStatus
  });
  const edgeResidualPressureRefs = uniqueSorted([
    ...(input.edgeResidualPressureRefs ?? []),
    ...targetCarrierPressureRefs
  ]);
  const ledger = Object.freeze({
    kind: "sdlc_edge_fulfillment_ledger" as const,
    selectedComposition,
    compositionRef: selectedComposition.compositionRef,
    compositionDigest: selectedComposition.compositionDigest,
    compositionSelectionRef: selectedComposition.compositionSelectionRef,
    selectedRegimeBindingRef: selectedComposition.selectedRegimeBindingRef,
    ledgerRef: requireNonEmptyString(input.ledgerRef, "ledgerRef"),
    ledgerVersionRef: requireNonEmptyString(
      input.ledgerVersionRef,
      "ledgerVersionRef"
    ),
    overlayRef:
      input.overlayRef === undefined || input.overlayRef === null
        ? null
        : requireNonEmptyString(input.overlayRef, "overlayRef"),
    overlayBindingRef:
      input.overlayBindingRef === undefined || input.overlayBindingRef === null
        ? null
        : requireNonEmptyString(input.overlayBindingRef, "overlayBindingRef"),
    graphCatalogDigestRef:
      input.graphCatalogDigestRef === undefined ||
      input.graphCatalogDigestRef === null
        ? null
        : requireNonEmptyString(input.graphCatalogDigestRef, "graphCatalogDigestRef"),
    edgeAssuranceContractRef:
      input.edgeAssuranceContractRef === undefined ||
      input.edgeAssuranceContractRef === null
        ? null
        : requireNonEmptyString(
            input.edgeAssuranceContractRef,
            "edgeAssuranceContractRef"
          ),
    edgeAssuranceContractDigest:
      input.edgeAssuranceContractDigest === undefined ||
      input.edgeAssuranceContractDigest === null
        ? null
        : requireNonEmptyString(
            input.edgeAssuranceContractDigest,
            "edgeAssuranceContractDigest"
          ),
    targetCarrierContractRef:
      input.targetCarrierContractRef === undefined ||
      input.targetCarrierContractRef === null
        ? null
        : requireNonEmptyString(
            input.targetCarrierContractRef,
            "targetCarrierContractRef"
          ),
    targetCarrierContractDigest:
      input.targetCarrierContractDigest === undefined ||
      input.targetCarrierContractDigest === null
        ? null
        : requireNonEmptyString(
            input.targetCarrierContractDigest,
            "targetCarrierContractDigest"
          ),
    targetCarrierAdmissionStatus,
    targetCarrierAdmissionRef:
      input.targetCarrierAdmissionRef === undefined ||
      input.targetCarrierAdmissionRef === null
        ? null
        : requireNonEmptyString(
            input.targetCarrierAdmissionRef,
            "targetCarrierAdmissionRef"
          ),
    edgeGainRef:
      input.edgeGainRef === undefined || input.edgeGainRef === null
        ? null
        : requireNonEmptyString(input.edgeGainRef, "edgeGainRef"),
    edgeResidualPressureRefs,
    edgeRef,
    attemptRef: requireNonEmptyString(input.attemptRef, "attemptRef"),
    targetBindingRefs,
    evidenceBundleRefs,
    materializationRefs: uniqueSorted(input.materializationRefs ?? []),
    livenessProjectionRefs: uniqueSorted(input.livenessProjectionRefs ?? []),
    admissionRefs: uniqueSorted(input.admissionRefs ?? []),
    downstreamTransformationSetRefs,
    downstreamPressureRefs,
    downstreamTargetBindingRefs,
    counts,
    assessmentCount: nonNegativeInteger(
      input.assessmentCount ?? evidenceBundleRefs.length,
      "assessmentCount"
    ),
    carryConverged,
    fulfillmentConverged,
    admitted,
    targetCertificationPassed,
    fdRecheckPassed,
    edgeConverged:
      edgeConvergedFromCounts(counts) &&
      admitted &&
      targetCertificationPassed &&
      fdRecheckPassed &&
      edgeResidualPressureRefs.length === 0,
    predecessorRefs: uniqueSorted([
      ...targetBindingRefs,
      selectedComposition.compositionRef,
      selectedComposition.compositionDigest,
      selectedComposition.compositionSelectionRef,
      ...(selectedComposition.selectedRegimeBindingRef === null
        ? []
        : [selectedComposition.selectedRegimeBindingRef]),
      ...downstreamTargetBindingRefs,
      ...downstreamTransformationSetRefs,
      ...downstreamPressureRefs,
      ...evidenceBundleRefs,
      ...(input.overlayRef === undefined || input.overlayRef === null
        ? []
        : [input.overlayRef]),
      ...(input.overlayBindingRef === undefined || input.overlayBindingRef === null
        ? []
        : [input.overlayBindingRef]),
      ...(input.graphCatalogDigestRef === undefined ||
      input.graphCatalogDigestRef === null
        ? []
        : [input.graphCatalogDigestRef]),
      ...(input.edgeAssuranceContractRef === undefined ||
      input.edgeAssuranceContractRef === null
        ? []
        : [input.edgeAssuranceContractRef]),
      ...(input.edgeAssuranceContractDigest === undefined ||
      input.edgeAssuranceContractDigest === null
        ? []
        : [input.edgeAssuranceContractDigest]),
      ...(input.targetCarrierContractRef === undefined ||
      input.targetCarrierContractRef === null
        ? []
        : [input.targetCarrierContractRef]),
      ...(input.targetCarrierContractDigest === undefined ||
      input.targetCarrierContractDigest === null
        ? []
        : [input.targetCarrierContractDigest]),
      ...(input.targetCarrierAdmissionRef === undefined ||
      input.targetCarrierAdmissionRef === null
        ? []
        : [input.targetCarrierAdmissionRef]),
      ...(input.edgeGainRef === undefined || input.edgeGainRef === null
        ? []
        : [input.edgeGainRef]),
      ...edgeResidualPressureRefs,
      ...(input.predecessorRefs ?? [])
    ])
  });
  requireRefsContain({
    refs: ledger.predecessorRefs,
    requiredRefs: [...ledger.targetBindingRefs, ...ledger.evidenceBundleRefs],
    label: ledger.ledgerRef
  });
  return ledger;
}

export function deriveSdlcEdgeClosureDecision(input: {
  readonly decisionRef: string;
  readonly ledger: SdlcEdgeFulfillmentLedger;
  readonly edgeClosureFunctionRef?: string | null;
  readonly edgeAssuranceCloseDecision?: SdlcEdgeAssuranceCloseDecision | null;
  readonly currentEdgeLawful: boolean;
  readonly retryReasonRefs?: readonly string[];
  readonly repairReasonRefs?: readonly string[];
  readonly reenterReasonRefs?: readonly string[];
  readonly repriceReasonRefs?: readonly string[];
  readonly blockReasonRefs?: readonly string[];
  readonly yieldResumeBasis?: Omit<SdlcYieldResumeBasis, "kind"> | null;
  readonly closurePolicy?: SdlcEdgeClosurePolicy;
}): SdlcEdgeClosureDecision {
  const yieldResumeBasis =
    input.yieldResumeBasis === undefined ? null : input.yieldResumeBasis;
  if (yieldResumeBasis !== null) {
    if (!input.currentEdgeLawful) {
      throw new TypeError("yield requires the current edge to remain lawful");
    }
    requireNonEmptyString(yieldResumeBasis.resumeBasisRef, "resumeBasisRef");
    requireNonEmptyString(yieldResumeBasis.currentEdgeRef, "currentEdgeRef");
    const admittedProgressRefs = nonEmptyUniqueSorted(
      yieldResumeBasis.admittedProgressRefs,
      "admittedProgressRefs"
    );
    assertYieldProgressNotOnlyLiveness({
      admittedProgressRefs,
      livenessProjectionRef: yieldResumeBasis.livenessProjectionRef,
      ledgerLivenessProjectionRefs: input.ledger.livenessProjectionRefs
    });
  }
  const edgeAssuranceCloseDecision = input.edgeAssuranceCloseDecision ?? null;
  if (edgeAssuranceCloseDecision !== null) {
    if (
      input.ledger.edgeAssuranceContractRef !== null &&
      edgeAssuranceCloseDecision.contractRef !== input.ledger.edgeAssuranceContractRef
    ) {
      throw new TypeError("edge assurance close decision contract ref drift");
    }
    if (
      input.ledger.edgeAssuranceContractDigest !== null &&
      edgeAssuranceCloseDecision.contractDigest !==
        input.ledger.edgeAssuranceContractDigest
    ) {
      throw new TypeError("edge assurance close decision contract digest drift");
    }
    if (
      input.ledger.edgeGainRef !== null &&
      edgeAssuranceCloseDecision.gainRef !== input.ledger.edgeGainRef
    ) {
      throw new TypeError("edge assurance close decision gain ref drift");
    }
    if (
      input.ledger.targetCarrierContractRef !== null &&
      edgeAssuranceCloseDecision.targetCarrierContractRef !==
        input.ledger.targetCarrierContractRef
    ) {
      throw new TypeError("edge assurance close decision target carrier ref drift");
    }
    if (
      input.ledger.targetCarrierContractDigest !== null &&
      edgeAssuranceCloseDecision.targetCarrierContractDigest !==
        input.ledger.targetCarrierContractDigest
    ) {
      throw new TypeError("edge assurance close decision target carrier digest drift");
    }
    if (
      edgeAssuranceCloseDecision.targetCarrierAdmissionStatus !==
      input.ledger.targetCarrierAdmissionStatus
    ) {
      throw new TypeError("edge assurance close decision target carrier admission drift");
    }
  }
  const retryReasonRefs = uniqueSorted(input.retryReasonRefs ?? []);
  const repairReasonRefs = uniqueSorted(input.repairReasonRefs ?? []);
  const reenterReasonRefs = uniqueSorted(input.reenterReasonRefs ?? []);
  const repriceReasonRefs = uniqueSorted(input.repriceReasonRefs ?? []);
  const blockReasonRefs = uniqueSorted(input.blockReasonRefs ?? []);
  const openReasonRefs = uniqueSorted([
    ...retryReasonRefs,
    ...repairReasonRefs,
    ...reenterReasonRefs,
    ...repriceReasonRefs,
    ...blockReasonRefs
  ]);
  const closureAllowed = openReasonRefs.length === 0;
  const candidates = new Set<SdlcEdgeClosureDisposition>(["block"]);
  if (edgeAssuranceCloseDecision === null) {
    if (closureAllowed && input.ledger.edgeConverged) {
      candidates.add("close");
    }
  } else if (
    closureAllowed &&
    edgeAssuranceCloseDecision.disposition === "close" &&
    input.ledger.edgeConverged
  ) {
    candidates.add("close");
  } else if (edgeAssuranceCloseDecision.disposition === "retry") {
    candidates.add("retry");
  }
  if (edgeAssuranceCloseDecision?.disposition === "block") {
    if (retryReasonRefs.length > 0) {
      candidates.add("retry");
    }
    if (
      repairReasonRefs.length > 0 &&
      edgeAssuranceCloseDecision.reasonRefs.some(
        (ref) =>
          ref.includes("/target-carrier/") ||
          edgeAssuranceReasonSupportsRepairReentry(ref)
      )
    ) {
      candidates.add("repair");
    }
  } else {
    if (yieldResumeBasis !== null) {
      candidates.add("yield");
    }
    if (repriceReasonRefs.length > 0) {
      candidates.add("reprice");
    }
    if (repairReasonRefs.length > 0) {
      candidates.add("repair");
    }
    if (reenterReasonRefs.length > 0) {
      candidates.add("re-enter");
    }
    if (retryReasonRefs.length > 0) {
      candidates.add("retry");
    }
  }
  const policy = input.closurePolicy ?? SDLC_DEFAULT_EDGE_CLOSURE_POLICY;
  const disposition = dispositionFromPolicy({ policy, candidates });
  const reasonRefs = uniqueSorted([
    ...(edgeAssuranceCloseDecision?.reasonRefs ?? []),
    ...retryReasonRefs,
    ...repairReasonRefs,
    ...reenterReasonRefs,
    ...repriceReasonRefs,
    ...blockReasonRefs,
    ...(yieldResumeBasis?.admittedProgressRefs ?? [])
  ]);
  const normalizedYieldResumeBasis =
    yieldResumeBasis === null
      ? null
      : Object.freeze({
          kind: "sdlc_yield_resume_basis" as const,
          yieldKind: yieldResumeBasis.yieldKind,
          resumeBasisRef: yieldResumeBasis.resumeBasisRef,
          currentEdgeRef: yieldResumeBasis.currentEdgeRef,
          admittedProgressRefs: nonEmptyUniqueSorted(
            yieldResumeBasis.admittedProgressRefs,
            "admittedProgressRefs"
          ),
          livenessProjectionRef: yieldResumeBasis.livenessProjectionRef,
          resumePolicyRef: yieldResumeBasis.resumePolicyRef
        });
  return Object.freeze({
    kind: "sdlc_edge_closure_decision" as const,
    selectedComposition: input.ledger.selectedComposition,
    compositionRef: input.ledger.compositionRef,
    compositionDigest: input.ledger.compositionDigest,
    compositionSelectionRef: input.ledger.compositionSelectionRef,
    selectedRegimeBindingRef: input.ledger.selectedRegimeBindingRef,
    decisionRef: requireNonEmptyString(input.decisionRef, "decisionRef"),
    ledgerRef: input.ledger.ledgerRef,
    ledgerVersionRef: input.ledger.ledgerVersionRef,
    overlayRef: input.ledger.overlayRef,
    overlayBindingRef: input.ledger.overlayBindingRef,
    graphCatalogDigestRef: input.ledger.graphCatalogDigestRef,
    edgeAssuranceContractRef: input.ledger.edgeAssuranceContractRef,
    edgeAssuranceContractDigest: input.ledger.edgeAssuranceContractDigest,
    targetCarrierContractRef: input.ledger.targetCarrierContractRef,
    targetCarrierContractDigest: input.ledger.targetCarrierContractDigest,
    targetCarrierAdmissionStatus: input.ledger.targetCarrierAdmissionStatus,
    targetCarrierAdmissionRef: input.ledger.targetCarrierAdmissionRef,
    edgeGainRef: input.ledger.edgeGainRef,
    edgeClosureFunctionRef:
      input.edgeClosureFunctionRef === undefined ||
      input.edgeClosureFunctionRef === null
        ? null
        : requireNonEmptyString(
            input.edgeClosureFunctionRef,
            "edgeClosureFunctionRef"
          ),
    edgeAssuranceDecisionRef: edgeAssuranceCloseDecision?.decisionRef ?? null,
    edgeResidualPressureRefs: input.ledger.edgeResidualPressureRefs,
    disposition,
    basisRefs: uniqueSorted([
      input.ledger.compositionRef,
      input.ledger.compositionDigest,
      input.ledger.compositionSelectionRef,
      ...(input.ledger.selectedRegimeBindingRef === null
        ? []
        : [input.ledger.selectedRegimeBindingRef]),
      input.ledger.ledgerRef,
      input.ledger.ledgerVersionRef,
      policy.policyRef,
      ...(input.ledger.edgeAssuranceContractRef === null
        ? []
        : [input.ledger.edgeAssuranceContractRef]),
      ...(input.ledger.edgeAssuranceContractDigest === null
        ? []
        : [input.ledger.edgeAssuranceContractDigest]),
      ...(input.ledger.targetCarrierContractRef === null
        ? []
        : [input.ledger.targetCarrierContractRef]),
      ...(input.ledger.targetCarrierContractDigest === null
        ? []
        : [input.ledger.targetCarrierContractDigest]),
      ...(input.ledger.targetCarrierAdmissionRef === null
        ? []
        : [input.ledger.targetCarrierAdmissionRef]),
      ...(input.ledger.edgeGainRef === null ? [] : [input.ledger.edgeGainRef]),
      ...(input.edgeClosureFunctionRef === undefined ||
      input.edgeClosureFunctionRef === null
        ? []
        : [input.edgeClosureFunctionRef]),
      ...(edgeAssuranceCloseDecision === null
        ? []
        : [
            edgeAssuranceCloseDecision.decisionRef,
            ...edgeAssuranceCloseDecision.basisRefs,
            edgeAssuranceCloseDecision.residualPressureRef
          ]),
      ...input.ledger.edgeResidualPressureRefs,
      ...input.ledger.predecessorRefs,
      ...(normalizedYieldResumeBasis === null
        ? []
        : [
            normalizedYieldResumeBasis.resumeBasisRef,
            normalizedYieldResumeBasis.currentEdgeRef,
            ...normalizedYieldResumeBasis.admittedProgressRefs,
            ...(normalizedYieldResumeBasis.livenessProjectionRef === null
              ? []
              : [normalizedYieldResumeBasis.livenessProjectionRef]),
            ...(normalizedYieldResumeBasis.resumePolicyRef === null
              ? []
              : [normalizedYieldResumeBasis.resumePolicyRef])
          ])
    ]),
    reasonRefs,
    yieldResumeBasis: normalizedYieldResumeBasis,
    predecessorRefs: uniqueSorted([
      input.ledger.compositionRef,
      input.ledger.compositionDigest,
      input.ledger.compositionSelectionRef,
      input.ledger.ledgerRef,
      input.ledger.ledgerVersionRef,
      policy.policyRef,
      ...(input.ledger.overlayRef === null ? [] : [input.ledger.overlayRef]),
      ...(input.ledger.overlayBindingRef === null
        ? []
        : [input.ledger.overlayBindingRef]),
      ...(input.ledger.graphCatalogDigestRef === null
        ? []
        : [input.ledger.graphCatalogDigestRef]),
      ...(input.ledger.edgeAssuranceContractRef === null
        ? []
        : [input.ledger.edgeAssuranceContractRef]),
      ...(input.ledger.edgeAssuranceContractDigest === null
        ? []
        : [input.ledger.edgeAssuranceContractDigest]),
      ...(input.ledger.targetCarrierContractRef === null
        ? []
        : [input.ledger.targetCarrierContractRef]),
      ...(input.ledger.targetCarrierContractDigest === null
        ? []
        : [input.ledger.targetCarrierContractDigest]),
      ...(input.ledger.targetCarrierAdmissionRef === null
        ? []
        : [input.ledger.targetCarrierAdmissionRef]),
      ...(input.ledger.edgeGainRef === null ? [] : [input.ledger.edgeGainRef]),
      ...(edgeAssuranceCloseDecision === null
        ? []
        : [
            edgeAssuranceCloseDecision.decisionRef,
            edgeAssuranceCloseDecision.residualPressureRef
          ]),
      ...input.ledger.edgeResidualPressureRefs,
      ...input.ledger.predecessorRefs
    ])
  });
}

export function constructSdlcOverlaySegmentCompletion(input: {
  readonly completionRef: string;
  readonly closureDecision: SdlcEdgeClosureDecision;
  readonly stopDisposition: SdlcOverlaySegmentDisposition;
  readonly terminalAssetTypes: readonly string[];
  readonly terminalGraphFunctionRefs: readonly string[];
  readonly remainingGraphPressureRefs?: readonly string[];
  readonly remainingRequirementPressureRefs?: readonly string[];
  readonly remainingAssetPressureRefs?: readonly string[];
  readonly nextEligibleOverlayRefs?: readonly string[];
  readonly predecessorRefs?: readonly string[];
}): SdlcOverlaySegmentCompletion {
  if (input.closureDecision.overlayRef === null) {
    throw new TypeError("overlay segment completion requires overlayRef");
  }
  if (input.closureDecision.overlayBindingRef === null) {
    throw new TypeError("overlay segment completion requires overlayBindingRef");
  }
  if (
    input.stopDisposition === "overlay_segment_complete" &&
    input.closureDecision.disposition !== "close"
  ) {
    throw new TypeError("overlay segment completion requires a close disposition");
  }
  if (
    input.stopDisposition === "product_converged" &&
    input.closureDecision.disposition !== "close"
  ) {
    throw new TypeError("product convergence requires a close disposition");
  }
  const terminalAssetTypes = nonEmptyUniqueSorted(
    input.terminalAssetTypes,
    "terminalAssetTypes"
  );
  const terminalGraphFunctionRefs = nonEmptyUniqueSorted(
    input.terminalGraphFunctionRefs,
    "terminalGraphFunctionRefs"
  );
  const remainingGraphPressureRefs = uniqueSorted(input.remainingGraphPressureRefs ?? []);
  const remainingRequirementPressureRefs = uniqueSorted(
    input.remainingRequirementPressureRefs ?? []
  );
  const remainingAssetPressureRefs = uniqueSorted(input.remainingAssetPressureRefs ?? []);
  const nextEligibleOverlayRefs = uniqueSorted(input.nextEligibleOverlayRefs ?? []);
  if (
    input.stopDisposition === "product_converged" &&
    (remainingGraphPressureRefs.length > 0 ||
      remainingRequirementPressureRefs.length > 0 ||
      remainingAssetPressureRefs.length > 0 ||
      nextEligibleOverlayRefs.length > 0)
  ) {
    throw new TypeError("product convergence cannot carry remaining overlay pressure");
  }
  const productConverged =
    input.stopDisposition === "product_converged" &&
    remainingGraphPressureRefs.length === 0 &&
    remainingRequirementPressureRefs.length === 0 &&
    remainingAssetPressureRefs.length === 0 &&
    nextEligibleOverlayRefs.length === 0;
  return Object.freeze({
    kind: "sdlc_overlay_segment_completion" as const,
    completionRef: requireNonEmptyString(input.completionRef, "completionRef"),
    overlayRef: input.closureDecision.overlayRef,
    overlayBindingRef: input.closureDecision.overlayBindingRef,
    graphCatalogDigestRef: input.closureDecision.graphCatalogDigestRef,
    closureDecisionRef: input.closureDecision.decisionRef,
    ledgerRef: input.closureDecision.ledgerRef,
    stopDisposition: input.stopDisposition,
    terminalAssetTypes,
    terminalGraphFunctionRefs,
    remainingGraphPressureRefs,
    remainingRequirementPressureRefs,
    remainingAssetPressureRefs,
    nextEligibleOverlayRefs,
    productConverged,
    predecessorRefs: uniqueSorted([
      input.closureDecision.decisionRef,
      input.closureDecision.ledgerRef,
      input.closureDecision.overlayRef,
      input.closureDecision.overlayBindingRef,
      ...(input.closureDecision.graphCatalogDigestRef === null
        ? []
        : [input.closureDecision.graphCatalogDigestRef]),
      ...terminalGraphFunctionRefs,
      ...remainingGraphPressureRefs,
      ...remainingRequirementPressureRefs,
      ...remainingAssetPressureRefs,
      ...nextEligibleOverlayRefs,
      ...(input.predecessorRefs ?? [])
    ])
  });
}

export function constructSdlcNextActionProjection(input: {
  readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity;
  readonly nextActionProjectionRef: string;
  readonly nextActionBasisKind?: SdlcNextActionBasisKind;
  readonly intentEventRefs: readonly string[];
  readonly productAssetModelRef: string;
  readonly gapPressureRefs: readonly string[];
  readonly targetBindingRefs: readonly string[];
  readonly closureDecision?: SdlcEdgeClosureDecision | null;
  readonly overlayRef?: string | null;
  readonly overlayBindingRef?: string | null;
  readonly graphCatalogDigestRef?: string | null;
  readonly edgeAssuranceContractRef?: string | null;
  readonly edgeAssuranceContractDigest?: string | null;
  readonly edgeGainRef?: string | null;
  readonly edgeResidualPressureRefs?: readonly string[];
  readonly overlaySegmentCompletion?: SdlcOverlaySegmentCompletion | null;
  readonly observationRef: string;
  readonly policyRefs: readonly string[];
  readonly actionCatalogRefs: readonly string[];
  readonly selectedActionRef?: string | null;
  readonly nextGraphFunctionRef?: string | null;
  readonly nextGraphVectorRef?: string | null;
  readonly readOnly?: boolean;
}): SdlcNextActionProjection {
  const selectedActionRef = input.selectedActionRef ?? null;
  const nextActionProjectionRef = requireNonEmptyString(
    input.nextActionProjectionRef,
    "nextActionProjectionRef"
  );
  const selectedComposition = input.selectedComposition;
  const nextGraphFunctionRef = input.nextGraphFunctionRef ?? null;
  const nextGraphVectorRef = input.nextGraphVectorRef ?? null;
  const intentEventRefs = nonEmptyUniqueSorted(
    input.intentEventRefs,
    "intentEventRefs"
  );
  const productAssetModelRef = requireNonEmptyString(
    input.productAssetModelRef,
    "productAssetModelRef"
  );
  const gapPressureRefs = nonEmptyUniqueSorted(
    input.gapPressureRefs,
    "gapPressureRefs"
  );
  const targetBindingRefs = nonEmptyUniqueSorted(
    input.targetBindingRefs,
    "targetBindingRefs"
  );
  const nextActionBasisKind =
    input.nextActionBasisKind ??
    nextActionBasisKindForClosure(input.closureDecision ?? null);
  validateNextActionBasis({
    nextActionBasisKind,
    closureDecision: input.closureDecision ?? null
  });
  const closureDecisionRef = input.closureDecision?.decisionRef ?? null;
  const overlayRef = input.overlayRef ?? input.closureDecision?.overlayRef ?? null;
  const overlayBindingRef =
    input.overlayBindingRef ?? input.closureDecision?.overlayBindingRef ?? null;
  const graphCatalogDigestRef =
    input.graphCatalogDigestRef ??
    input.closureDecision?.graphCatalogDigestRef ??
    null;
  const edgeAssuranceContractRef =
    input.edgeAssuranceContractRef ??
    input.closureDecision?.edgeAssuranceContractRef ??
    null;
  const edgeAssuranceContractDigest =
    input.edgeAssuranceContractDigest ??
    input.closureDecision?.edgeAssuranceContractDigest ??
    null;
  const edgeGainRef =
    input.edgeGainRef ?? input.closureDecision?.edgeGainRef ?? null;
  const edgeResidualPressureRefs = uniqueSorted([
    ...(input.edgeResidualPressureRefs ?? []),
    ...(input.closureDecision?.edgeResidualPressureRefs ?? [])
  ]);
  const overlaySegmentCompletion = input.overlaySegmentCompletion ?? null;
  if (overlaySegmentCompletion !== null) {
    if (overlayRef !== overlaySegmentCompletion.overlayRef) {
      throw new TypeError("overlay segment completion overlayRef mismatch");
    }
    if (overlayBindingRef !== overlaySegmentCompletion.overlayBindingRef) {
      throw new TypeError("overlay segment completion overlayBindingRef mismatch");
    }
    if (
      closureDecisionRef !== null &&
      closureDecisionRef !== overlaySegmentCompletion.closureDecisionRef
    ) {
      throw new TypeError("overlay segment completion closure decision mismatch");
    }
  }
  if (
    (nextActionBasisKind === "post_yield_resume" ||
      nextActionBasisKind === "post_reprice" ||
      nextActionBasisKind === "post_block") &&
    selectedActionRef !== null
  ) {
    throw new TypeError(
      `${nextActionBasisKind} basis cannot select a next action`
    );
  }
  return Object.freeze({
    kind: "sdlc_next_action_projection" as const,
    selectedComposition,
    compositionRef: selectedComposition.compositionRef,
    compositionDigest: selectedComposition.compositionDigest,
    compositionSelectionRef: selectedComposition.compositionSelectionRef,
    selectedRegimeBindingRef: selectedComposition.selectedRegimeBindingRef,
    evaluationFunction: "evaluate_next" as const,
    nextActionBasisKind,
    nextActionProjectionRef,
    intentEventRefs,
    productAssetModelRef,
    gapPressureRefs,
    targetBindingRefs,
    closureDecisionRef,
    overlayRef,
    overlayBindingRef,
    graphCatalogDigestRef,
    edgeAssuranceContractRef,
    edgeAssuranceContractDigest,
    edgeGainRef,
    edgeResidualPressureRefs,
    overlaySegmentCompletionRef: overlaySegmentCompletion?.completionRef ?? null,
    overlayStopDisposition: overlaySegmentCompletion?.stopDisposition ?? null,
    remainingGraphPressureRefs:
      overlaySegmentCompletion?.remainingGraphPressureRefs ?? Object.freeze([]),
    remainingRequirementPressureRefs:
      overlaySegmentCompletion?.remainingRequirementPressureRefs ?? Object.freeze([]),
    remainingAssetPressureRefs:
      overlaySegmentCompletion?.remainingAssetPressureRefs ?? Object.freeze([]),
    nextEligibleOverlayRefs:
      overlaySegmentCompletion?.nextEligibleOverlayRefs ?? Object.freeze([]),
    observationRef: requireNonEmptyString(input.observationRef, "observationRef"),
    policyRefs: uniqueSorted(input.policyRefs),
    actionCatalogRefs: uniqueSorted(input.actionCatalogRefs),
    selectedActionRef,
    nextGraphFunctionRef,
    nextGraphVectorRef,
    choosesNextTraversal:
      selectedActionRef !== null &&
      nextGraphFunctionRef !== null &&
      nextGraphVectorRef !== null,
    readOnly: input.readOnly ?? false,
    predecessorRefs: uniqueSorted([
      selectedComposition.compositionRef,
      selectedComposition.compositionDigest,
      selectedComposition.compositionSelectionRef,
      ...(selectedComposition.selectedRegimeBindingRef === null
        ? []
        : [selectedComposition.selectedRegimeBindingRef]),
      ...intentEventRefs,
      productAssetModelRef,
      ...gapPressureRefs,
      ...targetBindingRefs,
      ...(closureDecisionRef === null ? [] : [closureDecisionRef]),
      ...(overlayRef === null ? [] : [overlayRef]),
      ...(overlayBindingRef === null ? [] : [overlayBindingRef]),
      ...(graphCatalogDigestRef === null ? [] : [graphCatalogDigestRef]),
      ...(edgeAssuranceContractRef === null ? [] : [edgeAssuranceContractRef]),
      ...(edgeAssuranceContractDigest === null
        ? []
        : [edgeAssuranceContractDigest]),
      ...(edgeGainRef === null ? [] : [edgeGainRef]),
      ...edgeResidualPressureRefs,
      ...(overlaySegmentCompletion === null
        ? []
        : [
            overlaySegmentCompletion.completionRef,
            ...overlaySegmentCompletion.predecessorRefs
          ]),
      input.observationRef,
      ...input.policyRefs,
      ...input.actionCatalogRefs
    ])
  });
}

function byRef<T>(
  values: readonly T[],
  refOf: (value: T) => string,
  ref: string,
  label: string
): T {
  const found = values.find((value) => refOf(value) === ref);
  if (found === undefined) {
    throw new TypeError(`${label} not found: ${ref}`);
  }
  return found;
}

function firstBySortedRef<T>(
  values: readonly T[],
  refOf: (value: T) => string,
  label: string
): T {
  const sorted = [...values].sort((left, right) =>
    refOf(left).localeCompare(refOf(right))
  );
  const first = sorted[0];
  if (first === undefined) {
    throw new TypeError(`${label} must contain at least one row`);
  }
  return first;
}

function nextActionBasisKindForClosure(
  closureDecision: SdlcEdgeClosureDecision | null
): SdlcNextActionBasisKind {
  if (closureDecision === null) {
    return "initial_selection";
  }
  switch (closureDecision.disposition) {
    case "close":
      return "post_close_graph_continuation";
    case "yield":
      return "post_yield_resume";
    case "retry":
      return "post_retry";
    case "repair":
      return "post_repair";
    case "re-enter":
      return "post_reenter";
    case "reprice":
      return "post_reprice";
    case "block":
      return "post_block";
  }
}

function validateNextActionBasis(input: {
  readonly nextActionBasisKind: SdlcNextActionBasisKind;
  readonly closureDecision: SdlcEdgeClosureDecision | null;
}): void {
  if (input.nextActionBasisKind === "initial_selection") {
    if (input.closureDecision !== null) {
      throw new TypeError("initial_selection basis cannot cite a closure decision");
    }
    return;
  }
  if (input.closureDecision === null) {
    throw new TypeError(`${input.nextActionBasisKind} basis requires a closure decision`);
  }
  const expected = nextActionBasisKindForClosure(input.closureDecision);
  if (input.nextActionBasisKind !== expected) {
    throw new TypeError(
      `${input.nextActionBasisKind} basis does not match ${input.closureDecision.disposition} closure decision`
    );
  }
}

export function replaySdlcTraversalConsequence(input: {
  readonly constructionIntents: readonly SdlcConstructionIntent[];
  readonly worksiteEvidence: readonly SdlcWorksiteEvidence[];
  readonly edgeFulfillmentLedgers: readonly SdlcEdgeFulfillmentLedger[];
  readonly edgeClosureDecisions: readonly SdlcEdgeClosureDecision[];
  readonly nextActionProjections: readonly SdlcNextActionProjection[];
  readonly finalNextActionProjectionRef?: string;
  readonly abgTraversalTransitionRef: string;
}): SdlcTraversalConsequenceReplay {
  const nextActionProjection =
    input.finalNextActionProjectionRef === undefined
      ? firstBySortedRef(
          input.nextActionProjections,
          (projection) => projection.nextActionProjectionRef,
          "nextActionProjections"
        )
      : byRef(
          input.nextActionProjections,
          (projection) => projection.nextActionProjectionRef,
          input.finalNextActionProjectionRef,
          "nextActionProjection"
        );
  if (nextActionProjection.closureDecisionRef === null) {
    throw new TypeError(
      `${nextActionProjection.nextActionProjectionRef} is an initial next-action projection and cannot replay an action consequence`
    );
  }
  const edgeClosureDecision = byRef(
    input.edgeClosureDecisions,
    (decision) => decision.decisionRef,
    nextActionProjection.closureDecisionRef,
    "edgeClosureDecision"
  );
  requireRefsContain({
    refs: nextActionProjection.predecessorRefs,
    requiredRefs: [
      ...nextActionProjection.intentEventRefs,
      nextActionProjection.productAssetModelRef,
      ...nextActionProjection.gapPressureRefs,
      ...nextActionProjection.targetBindingRefs,
      edgeClosureDecision.decisionRef,
      nextActionProjection.observationRef,
      ...nextActionProjection.policyRefs,
      ...nextActionProjection.actionCatalogRefs
    ],
    label: nextActionProjection.nextActionProjectionRef
  });
  const edgeFulfillmentLedger = byRef(
    input.edgeFulfillmentLedgers,
    (ledger) => ledger.ledgerVersionRef,
    edgeClosureDecision.ledgerVersionRef,
    "edgeFulfillmentLedger"
  );
  if (
    edgeClosureDecision.targetCarrierContractRef !==
      edgeFulfillmentLedger.targetCarrierContractRef ||
    edgeClosureDecision.targetCarrierContractDigest !==
      edgeFulfillmentLedger.targetCarrierContractDigest ||
    edgeClosureDecision.targetCarrierAdmissionStatus !==
      edgeFulfillmentLedger.targetCarrierAdmissionStatus ||
    edgeClosureDecision.targetCarrierAdmissionRef !==
      edgeFulfillmentLedger.targetCarrierAdmissionRef
  ) {
    throw new TypeError("edge closure decision target carrier identity drift");
  }
  if (
    edgeClosureDecision.compositionRef !== edgeFulfillmentLedger.compositionRef ||
    edgeClosureDecision.compositionDigest !==
      edgeFulfillmentLedger.compositionDigest ||
    edgeClosureDecision.compositionSelectionRef !==
      edgeFulfillmentLedger.compositionSelectionRef ||
    edgeClosureDecision.selectedRegimeBindingRef !==
      edgeFulfillmentLedger.selectedRegimeBindingRef ||
    nextActionProjection.compositionRef !== edgeClosureDecision.compositionRef ||
    nextActionProjection.compositionDigest !==
      edgeClosureDecision.compositionDigest ||
    nextActionProjection.compositionSelectionRef !==
      edgeClosureDecision.compositionSelectionRef ||
    nextActionProjection.selectedRegimeBindingRef !==
      edgeClosureDecision.selectedRegimeBindingRef
  ) {
    throw new TypeError("traversal consequence selected composition identity drift");
  }
  requireRefsContain({
    refs: edgeClosureDecision.predecessorRefs,
    requiredRefs: [
      edgeFulfillmentLedger.ledgerRef,
      edgeFulfillmentLedger.ledgerVersionRef
    ],
    label: edgeClosureDecision.decisionRef
  });
  requireRefsContain({
    refs: edgeFulfillmentLedger.predecessorRefs,
    requiredRefs: [
      ...edgeFulfillmentLedger.targetBindingRefs,
      ...edgeFulfillmentLedger.evidenceBundleRefs
    ],
    label: edgeFulfillmentLedger.ledgerRef
  });
  requireRefsContain({
    refs: edgeFulfillmentLedger.targetBindingRefs,
    requiredRefs: nextActionProjection.targetBindingRefs,
    label: edgeFulfillmentLedger.ledgerRef
  });
  const worksiteEvidenceRows = edgeFulfillmentLedger.evidenceBundleRefs.map(
    (evidenceRef) => {
      const evidence = byRef(
        input.worksiteEvidence,
        (row) => row.evidenceBundleRef,
        evidenceRef,
        "worksiteEvidence"
      );
      requireRefsContain({
        refs: evidence.predecessorRefs,
        requiredRefs: [evidence.intentRef, evidence.invocationRef],
        label: evidence.evidenceBundleRef
      });
      return evidence;
    }
  );
  const worksiteEvidence = worksiteEvidenceRows[0];
  if (worksiteEvidence === undefined) {
    throw new TypeError("edge fulfillment ledger must reference worksite evidence");
  }
  const intentRefs = uniqueSorted(
    worksiteEvidenceRows.map((evidence) => evidence.intentRef)
  );
  if (intentRefs.length !== 1) {
    throw new TypeError(
      `${edgeFulfillmentLedger.ledgerRef} references evidence from multiple intents: ${intentRefs.join(", ")}`
    );
  }
  const constructionIntent = byRef(
    input.constructionIntents,
    (intent) => intent.intentRef,
    intentRefs[0] ?? "",
    "constructionIntent"
  );
  requireRefsContain({
    refs: constructionIntent.predecessorRefs,
    requiredRefs: [
      constructionIntent.selectedPriorityRowRef,
      constructionIntent.nextActionProjectionRef,
      ...constructionIntent.intentEventRefs,
      constructionIntent.productAssetModelRef
    ],
    label: constructionIntent.intentRef
  });
  requireRefsContain({
    refs: constructionIntent.intentEventRefs,
    requiredRefs: nextActionProjection.intentEventRefs,
    label: constructionIntent.intentRef
  });
  requireRefsContain({
    refs: [constructionIntent.productAssetModelRef],
    requiredRefs: [nextActionProjection.productAssetModelRef],
    label: constructionIntent.intentRef
  });
  const traversalTransitionRef = requireNonEmptyString(
    input.abgTraversalTransitionRef,
    "abgTraversalTransitionRef"
  );
  const admittedStateRef = Object.freeze({
    compositionRef: nextActionProjection.compositionRef,
    compositionDigest: nextActionProjection.compositionDigest,
    compositionSelectionRef: nextActionProjection.compositionSelectionRef,
    graphCallRef: constructionIntent.intentRef,
    frameRef: worksiteEvidence.invocationRef,
    eventRefs: uniqueSorted([
      ...constructionIntent.intentEventRefs,
      ...worksiteEvidence.processEventRefs
    ]),
    ledgerRefs: uniqueSorted([
      edgeFulfillmentLedger.ledgerVersionRef,
      edgeClosureDecision.decisionRef
    ]),
    projectionRefs: uniqueSorted([
      traversalTransitionRef,
      nextActionProjection.nextActionProjectionRef
    ])
  } satisfies GtlAdmittedStateRef);
  const consequenceProjection = Object.freeze({
    consequenceRef:
      `consequence://odd-sdlc/${encodeURIComponent(nextActionProjection.nextActionProjectionRef)}`,
    compositionRef: nextActionProjection.compositionRef,
    compositionDigest: nextActionProjection.compositionDigest,
    compositionSelectionRef: nextActionProjection.compositionSelectionRef,
    assuranceDecisionRef:
      edgeClosureDecision.edgeAssuranceDecisionRef ?? edgeClosureDecision.decisionRef,
    traversalTransitionRef,
    domainReadModelRefs: uniqueSorted([
      edgeFulfillmentLedger.ledgerVersionRef,
      edgeClosureDecision.decisionRef,
      traversalTransitionRef,
      nextActionProjection.nextActionProjectionRef
    ])
  } satisfies GtlConsequenceProjectionRef);
  return Object.freeze({
    kind: "sdlc_traversal_consequence_replay" as const,
    refs: Object.freeze({
      kind: "sdlc_traversal_consequence_refs" as const,
      compositionRef: nextActionProjection.compositionRef,
      compositionDigest: nextActionProjection.compositionDigest,
      compositionSelectionRef: nextActionProjection.compositionSelectionRef,
      selectedRegimeBindingRef: nextActionProjection.selectedRegimeBindingRef,
      constructionIntentRef: constructionIntent.intentRef,
      worksiteEvidenceRef: worksiteEvidence.evidenceBundleRef,
      edgeFulfillmentLedgerRef: edgeFulfillmentLedger.ledgerVersionRef,
      edgeClosureDecisionRef: edgeClosureDecision.decisionRef,
      nextActionProjectionRef: nextActionProjection.nextActionProjectionRef,
      admittedStateRef: admittedStateRef.frameRef,
      consequenceProjectionRef: consequenceProjection.consequenceRef
    }),
    constructionIntent,
    worksiteEvidence,
    edgeFulfillmentLedger,
    edgeClosureDecision,
    nextActionProjection,
    admittedStateRef,
    consequenceProjection
  });
}

export function constructSdlcConsequenceTraversalActionBinding(input: {
  readonly replay: SdlcTraversalConsequenceReplay;
  readonly traversalStrategyDecision: SdlcTraversalStrategyDecision;
  readonly bindingRef?: string | undefined;
  readonly actionRef?: string | undefined;
  readonly parentObligationRef?: string | undefined;
  readonly sourceNodeRef: string;
  readonly targetNodeRef: string;
  readonly graphSpanRef?: string | null | undefined;
  readonly reentryTargetRef: string;
  readonly targetOutcomeRef?: string | undefined;
  readonly selectedOverlayRef?: string | null | undefined;
  readonly selectedCandidateFamilyRef?: string | null | undefined;
  readonly selectedRefinementBoundaryRef?: string | null | undefined;
  readonly selectedTraversalTargetRef?: string | null | undefined;
  readonly inputAssetRefs?: readonly string[] | undefined;
  readonly expectedOutputAssetRefs?: readonly string[] | undefined;
  readonly requiredAuthorityRefs?: readonly string[] | undefined;
  readonly proportionalityBasisRefs?: readonly string[] | undefined;
  readonly evidencePolicyRef?: string | undefined;
  readonly foldbackPolicyRef?: string | undefined;
  readonly allowedConsequenceTraversalCatalog?:
    | AllowedConsequenceTraversalCatalog
    | undefined;
}): SdlcConsequenceTraversalActionBinding {
  const { replay, traversalStrategyDecision } = input;
  const { edgeClosureDecision, nextActionProjection } = replay;
  if (edgeClosureDecision.disposition !== "re-enter") {
    throw new TypeError(
      "SDLC consequence traversal action binding requires a re-enter closure decision"
    );
  }
  if (nextActionProjection.nextActionBasisKind !== "post_reenter") {
    throw new TypeError(
      "SDLC consequence traversal action binding requires post_reenter next-action basis"
    );
  }
  if (!nextActionProjection.choosesNextTraversal) {
    throw new TypeError(
      "SDLC consequence traversal action binding requires an explicit selected next traversal"
    );
  }
  if (traversalStrategyDecision.selectedStrategy === "full_breadth") {
    throw new TypeError(
      "SDLC consequence traversal action binding requires a depth-scoped traversal strategy"
    );
  }
  const decisionRef = traversalStrategyDecisionRef(traversalStrategyDecision);
  const selectedActionRef = firstNonEmpty(
    [nextActionProjection.selectedActionRef],
    "selectedActionRef"
  );
  const selectedGraphFunctionRef = firstNonEmpty(
    [nextActionProjection.nextGraphFunctionRef],
    "selectedGraphFunctionRef"
  );
  const selectedGraphVectorRef = firstNonEmpty(
    [nextActionProjection.nextGraphVectorRef],
    "selectedGraphVectorRef"
  );
  const reentryTargetRef = requireAbsoluteGraphReentryTarget(input.reentryTargetRef);
  const parentObligationRef =
    input.parentObligationRef ??
    firstNonEmpty(
      [
        ...edgeClosureDecision.reasonRefs,
        ...nextActionProjection.gapPressureRefs,
        ...nextActionProjection.edgeResidualPressureRefs
      ],
      "parentObligationRef"
    );
  const selectedTraversalTargetRef =
    input.selectedTraversalTargetRef ??
    sdlcPublishedTraversalTargetRef({
      graphFunctionRef: selectedGraphFunctionRef,
      graphVectorRef: selectedGraphVectorRef
    });
  const requiredAuthorityRefs = nonEmptyUniqueSorted(
    [
      selectedGraphFunctionRef,
      selectedGraphVectorRef,
      selectedTraversalTargetRef,
      edgeClosureDecision.decisionRef,
      edgeClosureDecision.ledgerVersionRef,
      nextActionProjection.nextActionProjectionRef,
      decisionRef,
      ...nextActionProjection.targetBindingRefs,
      ...nextActionProjection.policyRefs,
      ...nextActionProjection.actionCatalogRefs,
      ...traversalStrategyDecision.basisRefs,
      ...(input.requiredAuthorityRefs ?? [])
    ],
    "requiredAuthorityRefs"
  );
  const proportionalityBasisRefs = nonEmptyUniqueSorted(
    [
      traversalStrategyDecision.strategyPlanRef,
      ...(traversalStrategyDecision.strategyDirectiveRef === null
        ? []
        : [traversalStrategyDecision.strategyDirectiveRef]),
      ...traversalStrategyDecision.basisRefs,
      ...edgeClosureDecision.reasonRefs,
      ...nextActionProjection.gapPressureRefs,
      ...nextActionProjection.edgeResidualPressureRefs,
      ...(input.proportionalityBasisRefs ?? [])
    ],
    "proportionalityBasisRefs"
  );
  const actionRef =
    input.actionRef ??
    [
      "action://odd-sdlc/consequence-traversal",
      encodeURIComponent(nextActionProjection.nextActionProjectionRef)
    ].join("/");
  const bindingRef =
    input.bindingRef ??
    [
      "binding://odd-sdlc/consequence-traversal",
      encodeURIComponent(nextActionProjection.nextActionProjectionRef)
    ].join("/");
  const traversalAction = constructConsequenceTraversalAction({
    actionRef,
    consequenceRef: replay.consequenceProjection.consequenceRef,
    strategyDecisionRef: decisionRef,
    parentObligationRef,
    actionKind: "reenter_graph_span",
    selectedTraversalFamily: "depth_traversal",
    selectedGraphFunctionRef,
    selectedOverlayRef: input.selectedOverlayRef ?? nextActionProjection.overlayRef,
    selectedCandidateFamilyRef: input.selectedCandidateFamilyRef ?? null,
    selectedRefinementBoundaryRef:
      input.selectedRefinementBoundaryRef ?? null,
    selectedTraversalTargetRef,
    sourceNodeRef: requireNonEmptyString(input.sourceNodeRef, "sourceNodeRef"),
    targetNodeRef: requireNonEmptyString(input.targetNodeRef, "targetNodeRef"),
    graphVectorRef: selectedGraphVectorRef,
    graphSpanRef: input.graphSpanRef ?? nextActionProjection.compositionRef,
    reentryTargetRef,
    targetOutcomeRef:
      input.targetOutcomeRef ?? nextActionProjection.nextActionProjectionRef,
    inputAssetRefs: nonEmptyUniqueSorted(
      [
        nextActionProjection.productAssetModelRef,
        ...replay.worksiteEvidence.productEvidenceRefs,
        ...replay.worksiteEvidence.admittedProgressRefs,
        ...(input.inputAssetRefs ?? [])
      ],
      "inputAssetRefs"
    ),
    expectedOutputAssetRefs: nonEmptyUniqueSorted(
      [
        ...nextActionProjection.targetBindingRefs,
        ...(input.expectedOutputAssetRefs ?? [])
      ],
      "expectedOutputAssetRefs"
    ),
    requiredAuthorityRefs,
    proportionalityBasisRefs,
    evidencePolicyRef:
      input.evidencePolicyRef ??
      firstNonEmpty(
        [
          ...nextActionProjection.policyRefs,
          "evidence-policy://odd-sdlc/consequence-traversal/default"
        ],
        "evidencePolicyRef"
      ),
    foldbackPolicyRef:
      input.foldbackPolicyRef ??
      firstNonEmpty(
        [
          nextActionProjection.overlayBindingRef,
          nextActionProjection.overlayRef,
          "foldback-policy://odd-sdlc/consequence-traversal/default"
        ],
        "foldbackPolicyRef"
      )
  });
  if (input.allowedConsequenceTraversalCatalog !== undefined) {
    admitConsequenceTraversalActionForAllowedCatalog({
      catalog: input.allowedConsequenceTraversalCatalog,
      action: traversalAction
    });
  }
  return Object.freeze({
    kind: "sdlc_consequence_traversal_action_binding" as const,
    bindingVersion: "ts-consequence-traversal-action-v1" as const,
    bindingRef,
    strategyDecisionRef: decisionRef,
    consequenceProjectionRef: replay.consequenceProjection.consequenceRef,
    edgeClosureDecisionRef: edgeClosureDecision.decisionRef,
    nextActionProjectionRef: nextActionProjection.nextActionProjectionRef,
    selectedActionRef,
    selectedGraphFunctionRef,
    selectedGraphVectorRef,
    reentryTargetRef,
    traversalAction,
    requiredAuthorityRefs,
    proportionalityBasisRefs,
    predecessorRefs: uniqueSorted([
      decisionRef,
      traversalStrategyDecision.strategyPlanRef,
      ...traversalStrategyDecision.basisRefs,
      replay.constructionIntent.intentRef,
      replay.worksiteEvidence.evidenceBundleRef,
      replay.edgeFulfillmentLedger.ledgerVersionRef,
      edgeClosureDecision.decisionRef,
      nextActionProjection.nextActionProjectionRef,
      replay.consequenceProjection.consequenceRef,
      selectedActionRef,
      selectedGraphFunctionRef,
      selectedGraphVectorRef,
      reentryTargetRef,
      ...requiredAuthorityRefs,
      ...proportionalityBasisRefs
    ])
  });
}

export function assertSdlcTraversalConsequenceReplayable(input: {
  readonly constructionIntents: readonly SdlcConstructionIntent[];
  readonly worksiteEvidence: readonly SdlcWorksiteEvidence[];
  readonly edgeFulfillmentLedgers: readonly SdlcEdgeFulfillmentLedger[];
  readonly edgeClosureDecisions: readonly SdlcEdgeClosureDecision[];
  readonly nextActionProjections: readonly SdlcNextActionProjection[];
  readonly finalNextActionProjectionRef?: string;
  readonly abgTraversalTransitionRef: string;
}): SdlcTraversalConsequenceReplay {
  return replaySdlcTraversalConsequence(input);
}
