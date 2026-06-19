// Implements: T-123

import type {
  SdlcTraversalHopSelection,
  SdlcTraversalStrategy,
  SdlcTraversalStrategyDecision,
  SdlcTraversalStrategyPlan,
  SdlcWorkerRetryContext
} from "./carriers.js";
import {
  activeOddSdlcTraversalStrategyPlan
} from "../shared/traversal_strategy_plan.js";
import { uniqueTrimmedSorted as uniqueSorted } from "../shared/collections.js";

export {
  ODD_SDLC_DEFAULT_TRAVERSAL_STRATEGY_PLAN,
  ODD_SDLC_STEEL_THREAD_AFTER_REQUIREMENTS_TRAVERSAL_STRATEGY_PLAN,
  ODD_SDLC_TRAVERSAL_STRATEGY_PROFILE_VALUES,
  activeOddSdlcTraversalStrategyPlan,
  resolveOddSdlcTraversalStrategyPlan
} from "../shared/traversal_strategy_plan.js";

export function parseSdlcTraversalStrategyDirective(
  strategyDirectiveRef: string | null
): SdlcTraversalStrategy | null {
  if (strategyDirectiveRef === null) {
    return null;
  }
  if (/(?:targeted[-_]?repair|repair[-_]?local|same[-_]?edge[-_]?repair)/iu.test(strategyDirectiveRef)) {
    return "targeted_repair";
  }
  if (/(?:steel[-_]?thread|single[-_]?vertical[-_]?slice|vertical[-_]?slice)/iu.test(strategyDirectiveRef)) {
    return "steel_thread";
  }
  if (/(?:full[-_]?breadth|broad[-_]?induction|complete[-_]?breadth)/iu.test(strategyDirectiveRef)) {
    return "full_breadth";
  }
  return null;
}

function strategyForEdge(input: {
  readonly plan: SdlcTraversalStrategyPlan;
  readonly edgeName: string;
  readonly targetAssetType: string;
}): SdlcTraversalStrategy {
  return (
    input.plan.edgeStrategies[input.edgeName] ??
    input.plan.edgeStrategies[input.targetAssetType] ??
    input.plan.defaultStrategy
  );
}

function featureScopeRequired(strategy: SdlcTraversalStrategy): boolean {
  return strategy === "steel_thread" || strategy === "targeted_repair";
}

const RETRY_TARGETED_REPAIR_EDGES = new Set([
  "derive_feature_decomp_surface",
  "derive_design_surface",
  "derive_scenario_surface",
  "derive_implementation_design_surface",
  "derive_component_code_surface",
  "derive_component_test_surface",
  "derive_code_surface",
  "prepare_test_execution_surface",
  "derive_test_execution_result_surface",
  "derive_test_run_archive_surface",
  "feature_decomp_surface",
  "design_surface",
  "scenario_surface",
  "implementation_design_surface",
  "component_code_surface",
  "component_test_surface",
  "code_surface",
  "test_execution_surface",
  "test_execution_result_surface",
  "test_run_archive_surface"
]);

function retryContextSelectsTargetedRepair(input: {
  readonly edgeName: string;
  readonly targetAssetType: string;
  readonly retryContext: SdlcWorkerRetryContext | undefined;
}): boolean {
  if ((input.retryContext?.priorGapDossiers.length ?? 0) === 0) {
    return false;
  }
  return (
    RETRY_TARGETED_REPAIR_EDGES.has(input.edgeName) ||
    RETRY_TARGETED_REPAIR_EDGES.has(input.targetAssetType)
  );
}

function hopSelectionSelectsReducedStrategy(
  selection: SdlcTraversalHopSelection | null | undefined
): boolean {
  if (selection === null || selection === undefined) {
    return false;
  }
  return (
    selection.outcomeClass !== "domain_product" &&
    (selection.hopClass === "single_hop" || selection.hopClass === "dual_hop")
  );
}

export function deriveSdlcTraversalStrategyDecision(input: {
  readonly edgeName: string;
  readonly targetAssetType: string;
  readonly strategyDirectiveRef?: string | null | undefined;
  readonly selectedScheduleItemRefs?: readonly string[] | undefined;
  readonly requiredProgressArtifactRefs?: readonly string[] | undefined;
  readonly traversalHopSelection?: SdlcTraversalHopSelection | null | undefined;
  readonly retryContext?: SdlcWorkerRetryContext | undefined;
  readonly fallbackPlan?: SdlcTraversalStrategyPlan | undefined;
}): SdlcTraversalStrategyDecision {
  const fallbackPlan =
    input.fallbackPlan ?? activeOddSdlcTraversalStrategyPlan();
  const directiveRef = input.strategyDirectiveRef ?? null;
  const abgSelectedStrategy = parseSdlcTraversalStrategyDirective(directiveRef);
  const retryTargetedRepair = retryContextSelectsTargetedRepair({
    edgeName: input.edgeName,
    targetAssetType: input.targetAssetType,
    retryContext: input.retryContext
  });
  const retryBackoffApplies =
    retryTargetedRepair &&
    (abgSelectedStrategy === null || abgSelectedStrategy === "full_breadth");
  const proportionalitySelectionApplies =
    hopSelectionSelectsReducedStrategy(input.traversalHopSelection) &&
    (abgSelectedStrategy === null || abgSelectedStrategy === "full_breadth");
  const selectedStrategy =
    retryBackoffApplies
      ? "targeted_repair"
      : proportionalitySelectionApplies
        ? "steel_thread"
      : abgSelectedStrategy ??
        strategyForEdge({
          plan: fallbackPlan,
          edgeName: input.edgeName,
          targetAssetType: input.targetAssetType
        });
  const decisionSource =
    retryBackoffApplies
      ? "retry_backoff"
      : proportionalitySelectionApplies
        ? "proportionality_selection"
      : abgSelectedStrategy === null
        ? "odd_sdlc_fallback_plan"
        : "abg_selected";
  const basisRefs = uniqueSorted([
    fallbackPlan.planRef,
    ...(directiveRef === null ? [] : [directiveRef]),
    ...(input.selectedScheduleItemRefs ?? Object.freeze([])),
    ...(input.requiredProgressArtifactRefs ?? Object.freeze([])),
    ...(input.retryContext?.retryAttemptRefs.flatMap((attempt) => [
      attempt.sourceProjectionRef,
      attempt.priorAuthorityRef
    ]) ?? Object.freeze([])),
    ...(input.retryContext?.priorGapDossiers.map(
      (dossier) => dossier.currentGapDossierRef
    ) ?? Object.freeze([])),
    ...(input.traversalHopSelection === null ||
      input.traversalHopSelection === undefined
      ? []
      : [
          input.traversalHopSelection.selectionRef,
          input.traversalHopSelection.selectedGraphVariantRef,
          ...input.traversalHopSelection.evidenceRefs
        ])
  ]);
  const requiresScope = featureScopeRequired(selectedStrategy);
  return Object.freeze({
    kind: "sdlc_traversal_strategy_decision" as const,
    decisionVersion: "ts-strategy-decision-v1" as const,
    edgeName: input.edgeName,
    targetAssetType: input.targetAssetType,
    selectedStrategy,
    decisionSource,
    strategyPlanRef: fallbackPlan.planRef,
    strategyDirectiveRef: directiveRef,
    featureScopeRequired: requiresScope,
    featureScopeDerived: requiresScope,
    basisRefs
  });
}
