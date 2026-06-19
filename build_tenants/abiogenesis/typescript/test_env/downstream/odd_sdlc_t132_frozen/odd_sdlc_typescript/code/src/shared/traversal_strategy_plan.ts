export type OddSdlcDefaultTraversalStrategy =
  | "full_breadth"
  | "steel_thread"
  | "targeted_repair";

export type OddSdlcTraversalSameEdgeUntil =
  | "foldback_closed"
  | "retry_budget_exhausted";

export interface OddSdlcTraversalContinuationConfig {
  readonly sameEdgeUntil: OddSdlcTraversalSameEdgeUntil;
  readonly maxAttemptsWithoutNewSignal: number;
  readonly maxTotalAttempts: number;
}

export interface OddSdlcTraversalStrategyPlanConfig {
  readonly kind: "sdlc_traversal_strategy_plan";
  readonly planVersion: "ts-strategy-plan-v1";
  readonly planRef: string;
  readonly defaultStrategy: OddSdlcDefaultTraversalStrategy;
  readonly edgeStrategies: Readonly<Record<string, OddSdlcDefaultTraversalStrategy>>;
  readonly edgeScopeRefs?: Readonly<Record<string, readonly string[]>>;
  readonly edgeContinuationConfigs?: Readonly<
    Record<string, OddSdlcTraversalContinuationConfig>
  >;
}

export const ODD_SDLC_TRAVERSAL_STRATEGY_PROFILE_VALUES = Object.freeze([
  "default_full_wave",
  "steel_thread_after_requirements"
] as const);

const ODD_SDLC_DEFAULT_TRAVERSAL_EDGE_STRATEGIES: Readonly<
  Record<string, OddSdlcDefaultTraversalStrategy>
> = Object.freeze({
  derive_intent_surface: "full_breadth",
  derive_product_surface: "full_breadth",
  derive_goal_surface: "full_breadth",
  derive_requirement_surface: "full_breadth",
  intent_surface: "full_breadth",
  product_surface: "full_breadth",
  goal_surface: "full_breadth",
  requirement_surface: "full_breadth",
  derive_feature_decomp_surface: "full_breadth",
  derive_design_surface: "full_breadth",
  derive_scenario_surface: "full_breadth",
  derive_implementation_design_surface: "full_breadth",
  derive_component_code_surface: "full_breadth",
  derive_code_surface: "full_breadth",
  Fg_materialize_declared_product_asset: "full_breadth",
  derive_test_design_surface: "full_breadth",
  derive_component_test_surface: "full_breadth",
  derive_uat_test_source_surface: "full_breadth",
  prepare_test_execution_surface: "full_breadth",
  derive_test_execution_result_surface: "full_breadth",
  qualify_component_test_execution_surface: "full_breadth",
  derive_component_repair_schedule_surface: "full_breadth",
  derive_test_run_archive_surface: "full_breadth",
  derive_release_depth_parity_surface: "full_breadth",
  prepare_release_surface: "full_breadth",
  prepare_build_execution_surface: "full_breadth",
  derive_build_execution_result_surface: "full_breadth",
  prepare_deployment_surface: "full_breadth",
  derive_deployment_result_surface: "full_breadth",
  derive_deployed_environment_surface: "full_breadth",
  derive_runtime_observation_surface: "full_breadth",
  derive_retrofit_plan_surface: "full_breadth",
  feature_decomp_surface: "full_breadth",
  design_surface: "full_breadth",
  scenario_surface: "full_breadth",
  implementation_design_surface: "full_breadth",
  derive_lite_design_adr_surface: "steel_thread",
  derive_lite_component_code_surface: "steel_thread",
  code_surface: "full_breadth",
  test_execution_result_surface: "full_breadth",
  test_run_archive_surface: "full_breadth",
  release_surface: "full_breadth"
});

const STEEL_THREAD_AFTER_REQUIREMENTS_EDGE_NAMES = Object.freeze([
  "derive_feature_decomp_surface",
  "derive_design_surface",
  "derive_scenario_surface",
  "derive_implementation_design_surface",
  "derive_component_code_surface",
  "qualify_component_realization_surface",
  "derive_code_surface",
  "Fg_materialize_declared_product_asset",
  "derive_test_design_surface",
  "derive_component_test_surface",
  "derive_uat_test_source_surface",
  "prepare_test_execution_surface",
  "derive_test_execution_result_surface",
  "qualify_component_test_execution_surface",
  "derive_component_repair_schedule_surface",
  "derive_test_run_archive_surface",
  "derive_release_depth_parity_surface",
  "prepare_release_surface",
  "prepare_build_execution_surface",
  "derive_build_execution_result_surface",
  "prepare_deployment_surface",
  "derive_deployment_result_surface",
  "derive_deployed_environment_surface",
  "derive_runtime_observation_surface",
  "derive_retrofit_plan_surface",
  "feature_decomp_surface",
  "design_surface",
  "scenario_surface",
  "implementation_design_surface",
  "code_surface",
  "test_execution_result_surface",
  "test_run_archive_surface",
  "release_surface"
] as const);

const CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG =
  Object.freeze({
    sameEdgeUntil: "foldback_closed" as const,
    maxAttemptsWithoutNewSignal: 10,
    maxTotalAttempts: 64
  }) satisfies OddSdlcTraversalContinuationConfig;

const ODD_SDLC_DEFAULT_TRAVERSAL_CONTINUATION_CONFIGS: Readonly<
  Record<string, OddSdlcTraversalContinuationConfig>
> = Object.freeze({
  derive_component_code_surface: CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  qualify_component_realization_surface:
    CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  derive_code_surface: CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  derive_test_design_surface: CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  derive_component_test_surface: CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  derive_uat_test_source_surface: CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  prepare_test_execution_surface: CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  derive_test_execution_result_surface:
    CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  qualify_component_test_execution_surface:
    CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  derive_component_repair_schedule_surface:
    CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  derive_test_run_archive_surface: CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  derive_lite_component_code_surface:
    CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG,
  Fg_materialize_declared_product_asset:
    CODE_BUILDER_RETRY_YIELD_CONTINUATION_CONFIG
});

function steelThreadAfterRequirementsStrategies(): Readonly<
  Record<string, OddSdlcDefaultTraversalStrategy>
> {
  const strategies: Record<string, OddSdlcDefaultTraversalStrategy> = {
    ...ODD_SDLC_DEFAULT_TRAVERSAL_EDGE_STRATEGIES
  };
  for (const edgeName of STEEL_THREAD_AFTER_REQUIREMENTS_EDGE_NAMES) {
    strategies[edgeName] = "steel_thread";
  }
  return Object.freeze(strategies);
}

function deriveDefaultEdgeScopeRefs(input: {
  readonly edgeStrategies: Readonly<Record<string, OddSdlcDefaultTraversalStrategy>>;
}): Readonly<Record<string, readonly string[]>> {
  const refs: Record<string, readonly string[]> = {};
	  for (const [edgeName, strategy] of Object.entries(input.edgeStrategies)) {
	    if (strategy !== "full_breadth") {
	      refs[edgeName] = Object.freeze([
	        `schedule://odd_sdlc/${edgeName}/primary`
	      ]);
	    }
	  }
  return Object.freeze(refs);
}

export const ODD_SDLC_DEFAULT_TRAVERSAL_STRATEGY_PLAN = Object.freeze({
  kind: "sdlc_traversal_strategy_plan" as const,
  planVersion: "ts-strategy-plan-v1" as const,
  planRef: "strategy-plan://odd_sdlc/typescript/default-full-wave",
  defaultStrategy: "full_breadth" as const,
  edgeStrategies: ODD_SDLC_DEFAULT_TRAVERSAL_EDGE_STRATEGIES,
  edgeScopeRefs: deriveDefaultEdgeScopeRefs({
    edgeStrategies: ODD_SDLC_DEFAULT_TRAVERSAL_EDGE_STRATEGIES
  }),
  edgeContinuationConfigs: ODD_SDLC_DEFAULT_TRAVERSAL_CONTINUATION_CONFIGS
}) satisfies OddSdlcTraversalStrategyPlanConfig;

const ODD_SDLC_STEEL_THREAD_AFTER_REQUIREMENTS_EDGE_STRATEGIES =
  steelThreadAfterRequirementsStrategies();

export const ODD_SDLC_STEEL_THREAD_AFTER_REQUIREMENTS_TRAVERSAL_STRATEGY_PLAN =
  Object.freeze({
    kind: "sdlc_traversal_strategy_plan" as const,
    planVersion: "ts-strategy-plan-v1" as const,
    planRef:
      "strategy-plan://odd_sdlc/typescript/steel-thread-after-requirements",
    defaultStrategy: "full_breadth" as const,
    edgeStrategies: ODD_SDLC_STEEL_THREAD_AFTER_REQUIREMENTS_EDGE_STRATEGIES,
    edgeScopeRefs: deriveDefaultEdgeScopeRefs({
      edgeStrategies: ODD_SDLC_STEEL_THREAD_AFTER_REQUIREMENTS_EDGE_STRATEGIES
    }),
    edgeContinuationConfigs: ODD_SDLC_DEFAULT_TRAVERSAL_CONTINUATION_CONFIGS
  }) satisfies OddSdlcTraversalStrategyPlanConfig;

export function resolveOddSdlcTraversalStrategyPlan(
  profile: string | null | undefined
): OddSdlcTraversalStrategyPlanConfig {
  if (
    profile === null ||
    profile === undefined ||
    profile === "" ||
    profile === "default_full_wave"
  ) {
    return ODD_SDLC_DEFAULT_TRAVERSAL_STRATEGY_PLAN;
  }
  if (profile === "steel_thread_after_requirements") {
    return ODD_SDLC_STEEL_THREAD_AFTER_REQUIREMENTS_TRAVERSAL_STRATEGY_PLAN;
  }
  throw new TypeError(
    `unknown odd_sdlc traversal strategy profile: ${profile}`
  );
}

export function activeOddSdlcTraversalStrategyPlan(): OddSdlcTraversalStrategyPlanConfig {
  return resolveOddSdlcTraversalStrategyPlan(
    process.env["ODD_SDLC_TS_TRAVERSAL_STRATEGY_PROFILE"]
  );
}

export function defaultSdlcTraversalStrategyForName(
  name: string,
  plan: OddSdlcTraversalStrategyPlanConfig = activeOddSdlcTraversalStrategyPlan()
): OddSdlcDefaultTraversalStrategy {
  return (
    plan.edgeStrategies[name] ??
    plan.defaultStrategy
  );
}

export function defaultSdlcTraversalScopeRefsForName(
  name: string,
  plan: OddSdlcTraversalStrategyPlanConfig = activeOddSdlcTraversalStrategyPlan()
): readonly string[] {
  const scopedRefs = plan.edgeScopeRefs?.[name];
  if (scopedRefs !== undefined) {
    return Object.freeze([...scopedRefs]);
  }
  return Object.freeze([
    `schedule://odd_sdlc/${name}/primary`
  ]);
}

export function defaultSdlcTraversalContinuationConfigForName(
  name: string,
  plan: OddSdlcTraversalStrategyPlanConfig = activeOddSdlcTraversalStrategyPlan()
): OddSdlcTraversalContinuationConfig | null {
  const config = plan.edgeContinuationConfigs?.[name];
  if (config === undefined) {
    return null;
  }
  return Object.freeze({ ...config });
}
