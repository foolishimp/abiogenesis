// Implements: T-173

import type {
  SdlcDecompositionSummary,
  SdlcMinFpPressurePreservationDecision,
  SdlcMinFpPressurePreservationMechanism,
  SdlcTraversalComplexityAssessment,
  SdlcTraversalComplexityThresholds,
  SdlcTraversalHopClass,
  SdlcTraversalHopSelection,
  SdlcTraversalOutcomeClass,
  SdlcZoomAdmissionDecision
} from "./carriers.js";
import {
  SDLC_MIN_FP_PERMITTED_OUTCOME_CLASSES
} from "../contracts/carrier_domain_catalog.js";
import { uniqueTrimmedSorted as uniqueSorted } from "../shared/collections.js";

export interface SdlcTraversalHopSelectionInput {
  readonly selectionRef: string;
  readonly outcomeClass?: SdlcTraversalOutcomeClass | undefined;
  readonly decompositionSummary?: SdlcDecompositionSummary | null | undefined;
  readonly thresholds?: SdlcTraversalComplexityThresholds | undefined;
  readonly typedTemplateAvailable?: boolean | undefined;
  readonly projectionOnlyEligible?: boolean | undefined;
  readonly bundleEligible?: boolean | undefined;
  readonly skippedEdgeRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
}

const SDLC_MIN_FP_PERMITTED_OUTCOME_CLASS_SET = Object.freeze(
  new Set<SdlcTraversalOutcomeClass>(SDLC_MIN_FP_PERMITTED_OUTCOME_CLASSES)
);

const SDLC_PROJECTION_BENIGN_BLOCKING_REASONS = Object.freeze(
  new Set<string>(["complexity_decomposition_summary_missing"])
);

// Defaults keep single-hop strictly trivial (1x1) and dual-hop tightly
// coupled (2x2). Larger or ratio-heavy stages remain staged/zoomed unless a
// product profile admits broader tolerance.
export const SDLC_DEFAULT_TRAVERSAL_COMPLEXITY_THRESHOLDS = Object.freeze({
  kind: "sdlc_traversal_complexity_thresholds" as const,
  profileRef: "profile://odd-sdlc/traversal-complexity/default",
  maxSingleHopInputObligations: 1,
  maxSingleHopOutputRows: 1,
  maxSingleHopUpstreamPerDownstreamRatio: 1,
  maxSingleHopDownstreamPerUpstreamRatio: 1,
  maxDualHopInputObligations: 2,
  maxDualHopOutputRows: 2,
  maxDualHopUpstreamPerDownstreamRatio: 2,
  maxDualHopDownstreamPerUpstreamRatio: 2,
  maxResidualRefsForSmallHop: 0,
  maxResidualOutsideSubsurfaceRefsForSmallHop: 0
} satisfies SdlcTraversalComplexityThresholds);

function decompositionSummaryRef(summary: SdlcDecompositionSummary | null): string | null {
  return summary === null
    ? null
    : `decomposition-summary://odd-sdlc/${encodeURIComponent(summary.stageId)}`;
}

function assessmentBlockingReasons(
  summary: SdlcDecompositionSummary | null
): readonly string[] {
  if (summary === null) {
    return Object.freeze(["complexity_decomposition_summary_missing"]);
  }
  return uniqueSorted(summary.blockingReasons);
}

function maxOwnedInputsPerOutput(summary: SdlcDecompositionSummary | null): number {
  if (summary === null) {
    return 0;
  }
  return summary.rows.reduce(
    (max, row) => Math.max(max, row.ownedUpstreamCount),
    0
  );
}

function rowFieldTotal(
  summary: SdlcDecompositionSummary | null,
  selector: (row: SdlcDecompositionSummary["rows"][number]) => number
): number {
  if (summary === null) {
    return 0;
  }
  return summary.rows.reduce((total, row) => total + selector(row), 0);
}

export function deriveSdlcTraversalComplexityAssessment(input: {
  readonly assessmentRef: string;
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly decompositionSummary: SdlcDecompositionSummary | null;
  readonly thresholds?: SdlcTraversalComplexityThresholds | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
}): SdlcTraversalComplexityAssessment {
  const thresholds =
    input.thresholds ?? SDLC_DEFAULT_TRAVERSAL_COMPLEXITY_THRESHOLDS;
  const summary = input.decompositionSummary;
  return Object.freeze({
    kind: "sdlc_traversal_complexity_assessment" as const,
    assessmentRef: input.assessmentRef,
    outcomeClass: input.outcomeClass,
    thresholdProfileRef: thresholds.profileRef,
    decompositionSummaryRef: decompositionSummaryRef(summary),
    inputObligationCount: summary?.upstreamCount ?? 0,
    outputRowCount: summary?.downstreamCount ?? 0,
    upstreamPerDownstreamRatio: summary?.upstreamPerDownstreamRatio ?? 0,
    downstreamPerUpstreamRatio: summary?.downstreamPerUpstreamRatio ?? 0,
    maxOwnedInputsPerOutput: maxOwnedInputsPerOutput(summary),
    residualRefCount: summary?.residualRefs.length ?? 0,
    residualOutsideSubsurfaceRefCount:
      summary?.residualOutsideSubsurfaceRefs.length ?? 0,
    publicBoundaryCount: rowFieldTotal(summary, (row) => row.publicBoundaryCount),
    substantiveDownstreamResponsibilityCount: rowFieldTotal(
      summary,
      (row) => row.substantiveResponsibilityCount
    ),
    blockingReasons: assessmentBlockingReasons(summary),
    evidenceRefs: uniqueSorted([
      ...(input.evidenceRefs ?? []),
      ...(decompositionSummaryRef(summary) === null
        ? []
        : [decompositionSummaryRef(summary) ?? ""])
    ])
  });
}

function zoomAdmissionForAssessment(
  assessment: SdlcTraversalComplexityAssessment
): SdlcZoomAdmissionDecision {
  const hardBlockReasons = assessment.blockingReasons.filter((reason) =>
    [
      "complexity_decomposition_summary_missing",
      "decomposition_residual_outside_subsurface",
      "decomposition_downstream_rows_without_upstream_basis",
      "decomposition_invalid_reference_values"
    ].includes(reason)
  );
  if (hardBlockReasons.length > 0) {
    return Object.freeze({
      kind: "sdlc_zoom_admission_decision" as const,
      disposition: "blocked" as const,
      reasonRefs: uniqueSorted(hardBlockReasons),
      selectedZoomStageRef: null
    });
  }
  if (assessment.blockingReasons.length > 0) {
    return Object.freeze({
      kind: "sdlc_zoom_admission_decision" as const,
      disposition: "zoom_required" as const,
      reasonRefs: assessment.blockingReasons,
      selectedZoomStageRef: `zoom-stage://odd-sdlc/${assessment.outcomeClass}/decomposition`
    });
  }
  return Object.freeze({
    kind: "sdlc_zoom_admission_decision" as const,
    disposition: "continue" as const,
    reasonRefs: Object.freeze([]),
    selectedZoomStageRef: null
  });
}

function smallHopClass(input: {
  readonly assessment: SdlcTraversalComplexityAssessment;
  readonly thresholds: SdlcTraversalComplexityThresholds;
}): "single_hop" | "dual_hop" | null {
  const residualOk =
    input.assessment.residualRefCount <=
      input.thresholds.maxResidualRefsForSmallHop &&
    input.assessment.residualOutsideSubsurfaceRefCount <=
      input.thresholds.maxResidualOutsideSubsurfaceRefsForSmallHop;
  if (!residualOk) {
    return null;
  }
  if (
    input.assessment.inputObligationCount <=
      input.thresholds.maxSingleHopInputObligations &&
    input.assessment.outputRowCount <= input.thresholds.maxSingleHopOutputRows &&
    input.assessment.upstreamPerDownstreamRatio <=
      input.thresholds.maxSingleHopUpstreamPerDownstreamRatio &&
    input.assessment.downstreamPerUpstreamRatio <=
      input.thresholds.maxSingleHopDownstreamPerUpstreamRatio
  ) {
    return "single_hop";
  }
  if (
    input.assessment.inputObligationCount <=
      input.thresholds.maxDualHopInputObligations &&
    input.assessment.outputRowCount <= input.thresholds.maxDualHopOutputRows &&
    input.assessment.upstreamPerDownstreamRatio <=
      input.thresholds.maxDualHopUpstreamPerDownstreamRatio &&
    input.assessment.downstreamPerUpstreamRatio <=
      input.thresholds.maxDualHopDownstreamPerUpstreamRatio
  ) {
    return "dual_hop";
  }
  return null;
}

function graphVariantRef(input: {
  readonly outcomeClass: SdlcTraversalOutcomeClass;
  readonly hopClass: SdlcTraversalHopClass;
  readonly mechanism: SdlcMinFpPressurePreservationMechanism;
}): string {
  return [
    "graph-variant://odd-sdlc",
    encodeURIComponent(input.outcomeClass),
    encodeURIComponent(input.hopClass),
    encodeURIComponent(input.mechanism)
  ].join("/");
}

function pressureDecision(input: {
  readonly mechanism: SdlcMinFpPressurePreservationMechanism;
  readonly assessment: SdlcTraversalComplexityAssessment;
  readonly skippedEdgeRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly blockingReasons: readonly string[];
}): SdlcMinFpPressurePreservationDecision {
  const preservedPressureRefs = uniqueSorted([
    ...(input.assessment.decompositionSummaryRef === null
      ? []
      : [input.assessment.decompositionSummaryRef]),
    ...input.evidenceRefs
  ]);
  const missingPreservation =
    input.mechanism !== "none" && preservedPressureRefs.length === 0;
  const blockingReasons = uniqueSorted([
    ...input.blockingReasons,
    ...(missingPreservation
      ? ["min_fp_pressure_preservation_evidence_missing"]
      : [])
  ]);
  return Object.freeze({
    kind: "sdlc_min_fp_pressure_preservation_decision" as const,
    mechanism: input.mechanism,
    preservedPressureRefs,
    skippedEdgeRefs: uniqueSorted(input.skippedEdgeRefs),
    evidenceRefs: uniqueSorted(input.evidenceRefs),
    admissionDecision: blockingReasons.length === 0 ? "admit" : "reject",
    blockingReasons
  });
}

function rejectedAlternatives(input: {
  readonly typedTemplateAvailable: boolean;
  readonly projectionOnlyEligible: boolean;
  readonly bundleEligible: boolean;
}): readonly string[] {
  const rejected: string[] = [];
  if (!input.typedTemplateAvailable) {
    rejected.push("alternative://typed-template-unavailable");
  }
  if (!input.projectionOnlyEligible) {
    rejected.push("alternative://projection-only-ineligible");
  }
  if (!input.bundleEligible) {
    rejected.push("alternative://bundle-ineligible");
  }
  return uniqueSorted(rejected);
}

export function deriveSdlcTraversalHopSelection(
  input: SdlcTraversalHopSelectionInput
): SdlcTraversalHopSelection {
  const thresholds =
    input.thresholds ?? SDLC_DEFAULT_TRAVERSAL_COMPLEXITY_THRESHOLDS;
  const outcomeClass = input.outcomeClass ?? "domain_product";
  const assessment = deriveSdlcTraversalComplexityAssessment({
    assessmentRef: `${input.selectionRef}/complexity`,
    outcomeClass,
    decompositionSummary: input.decompositionSummary ?? null,
    thresholds,
    evidenceRefs: input.evidenceRefs
  });
  const typedTemplateAvailable = input.typedTemplateAvailable ?? false;
  const projectionOnlyEligible = input.projectionOnlyEligible ?? false;
  const bundleEligible = input.bundleEligible ?? false;
  const minFpEligible = SDLC_MIN_FP_PERMITTED_OUTCOME_CLASS_SET.has(outcomeClass);
  const projectionPreservesWithoutSummary =
    projectionOnlyEligible &&
    (input.evidenceRefs?.length ?? 0) > 0 &&
    assessment.blockingReasons.every((reason) =>
      SDLC_PROJECTION_BENIGN_BLOCKING_REASONS.has(reason)
    );
  const rawZoomAdmission = zoomAdmissionForAssessment(assessment);
  const zoomAdmission: SdlcZoomAdmissionDecision = projectionPreservesWithoutSummary
    ? Object.freeze({
        kind: "sdlc_zoom_admission_decision" as const,
        disposition: "continue" as const,
        reasonRefs: Object.freeze([
          "projection_pressure_preserved_without_decomposition_summary"
        ]),
        selectedZoomStageRef: null
      })
    : rawZoomAdmission;
  const smallHop = smallHopClass({ assessment, thresholds });
  let hopClass: SdlcTraversalHopClass = "staged";
  let mechanism: SdlcMinFpPressurePreservationMechanism = "none";
  const blockingReasons: string[] = [];
  // Priority is authority-preserving: hard block/zoom wins, then replay-only
  // projections, typed templates, bundled coupled work, and finally smaller
  // outcome-class graph variants.
  if (zoomAdmission.disposition === "blocked") {
    hopClass = "blocked";
    blockingReasons.push(...zoomAdmission.reasonRefs);
  } else if (zoomAdmission.disposition === "zoom_required") {
    hopClass = "zoom_required";
  } else if (projectionOnlyEligible) {
    hopClass = "single_hop";
    mechanism = "replay_visible_projection";
  } else if (
    minFpEligible &&
    smallHop === "single_hop" &&
    typedTemplateAvailable
  ) {
    hopClass = "single_hop";
    mechanism = "typed_template";
  } else if (
    minFpEligible &&
    smallHop === "dual_hop" &&
    bundleEligible
  ) {
    hopClass = "dual_hop";
    mechanism = "bundled_fp_output";
  } else if (minFpEligible && smallHop !== null) {
    hopClass = smallHop;
    mechanism = "outcome_class_graph_variant";
  }
  const pressurePreservation = pressureDecision({
    mechanism,
    assessment,
    skippedEdgeRefs: input.skippedEdgeRefs ?? [],
    evidenceRefs: input.evidenceRefs ?? [],
    blockingReasons
  });
  return Object.freeze({
    kind: "sdlc_traversal_hop_selection" as const,
    selectionRef: input.selectionRef,
    outcomeClass,
    hopClass,
    selectedGraphVariantRef: graphVariantRef({
      outcomeClass,
      hopClass,
      mechanism
    }),
    complexityAssessment: assessment,
    zoomAdmission,
    pressurePreservation,
    rejectedAlternativeRefs: rejectedAlternatives({
      typedTemplateAvailable,
      projectionOnlyEligible,
      bundleEligible
    }),
    blockingReasons: uniqueSorted([
      ...blockingReasons,
      ...pressurePreservation.blockingReasons
    ]),
    evidenceRefs: uniqueSorted([
      ...(input.evidenceRefs ?? []),
      ...pressurePreservation.preservedPressureRefs
    ])
  });
}
