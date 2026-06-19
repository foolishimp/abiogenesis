// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-014
// Implements: REQ-F-ODDSDLC-015
// Implements: REQ-F-ODDSDLC-021
// Implements: REQ-F-ODDSDLC-038
// Implements: REQ-F-ODDSDLC-057

import {
  FG_GRAPH_CODE_BUILDER,
  FG_SINGLE_TYPED_TRAVERSAL,
  REUSABLE_GRAPH_FUNCTION_CATALOG,
  type SdlcReusableGraphFunctionCatalogEntry
} from "./library.js";

export interface SdlcFunctionCatalogEntry {
  readonly kind: "sdlc_function_catalog_entry";
  readonly catalogRole: "product_specialization";
  readonly graphTrackPublication: "default" | "overlay_only";
  readonly workCategoryGovernanceCategory: SdlcWorkCategoryGovernanceCategory;
  readonly name: string;
  readonly intent: string;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly backingGraphFunction: string;
  readonly specializesGraphFunction:
    | typeof FG_SINGLE_TYPED_TRAVERSAL
    | typeof FG_GRAPH_CODE_BUILDER;
  readonly transformContractRef: string;
  readonly evaluationContractRef: string;
}

export interface SdlcExecutiveProgramEntry {
  readonly kind: "sdlc_executive_program_entry";
  readonly name: string;
  readonly intent: string;
  readonly steps: readonly string[];
  readonly outputs: readonly string[];
  readonly backingGraphFunction: string;
}

export type SdlcWorkCategoryGovernanceCategory =
  | "requirements_build"
  | "design_build"
  | "coding_build"
  | "uat_test_case_build"
  | "unit_test_build";

export interface SdlcGraphFunctionCatalog {
  readonly kind: "sdlc_graph_function_catalog";
  readonly libraryFunctions: readonly SdlcReusableGraphFunctionCatalogEntry[];
  readonly functions: readonly SdlcFunctionCatalogEntry[];
  readonly executives: readonly SdlcExecutiveProgramEntry[];
}

export const FG_BOOTSTRAP_REQUIREMENTS_EXECUTIVE =
  "bootstrap_requirements" as const;
export const FG_SOLUTION_ARCHITECTURE_EXECUTIVE =
  "solution_architecture" as const;
export const FG_LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE =
  "lite_design_module_implementation" as const;
export const FG_FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE =
  "framework_smoke_min_fp" as const;
export const FG_DERIVE_LITE_DESIGN_ADR_SURFACE =
  "derive_lite_design_adr_surface" as const;
export const FG_DERIVE_LITE_COMPONENT_CODE_SURFACE =
  "derive_lite_component_code_surface" as const;
export const FG_DERIVE_LITE_TEST_DESIGN_SURFACE =
  "derive_lite_test_design_surface" as const;
export const FG_DERIVE_LITE_COMPONENT_TEST_SURFACE =
  "derive_lite_component_test_surface" as const;
export const FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE =
  "derive_lite_uat_test_source_surface" as const;
export const FG_PREPARE_TEST_EXECUTION_SURFACE =
  "prepare_test_execution_surface" as const;
export const FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE =
  "derive_test_execution_result_surface" as const;
export const FG_DERIVE_UAT_TEST_SOURCE_SURFACE =
  "derive_uat_test_source_surface" as const;
export const FG_BOOTSTRAP_SDLC_ENTRY =
  "Fg_bootstrap_sdlc_entry" as const;
export const FG_DECOMPOSE_DEPTH_BETWEEN_NODES =
  "Fg_decompose_depth_between_nodes" as const;

export const BOOTSTRAP_REQUIREMENTS_EXECUTIVE_STEPS = Object.freeze([
  "derive_intent_surface",
  "derive_product_surface",
  "derive_goal_surface",
  "derive_requirement_surface"
] as const);

export const SOLUTION_ARCHITECTURE_EXECUTIVE_STEPS = Object.freeze([
  "derive_uat_testcases_surface",
  "derive_testcase_authority_surface",
  "derive_feature_decomp_surface",
  "derive_design_surface",
  "derive_scenario_surface",
  "derive_implementation_design_surface"
] as const);

export const LITE_DESIGN_MODULE_IMPLEMENTATION_EXECUTIVE_STEPS = Object.freeze([
  FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
  FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
  FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
  FG_PREPARE_TEST_EXECUTION_SURFACE,
  FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE
] as const);

export const FRAMEWORK_SMOKE_MIN_FP_EXECUTIVE_STEPS = Object.freeze([
  FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
  FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
  FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
  FG_PREPARE_TEST_EXECUTION_SURFACE,
  FG_DERIVE_TEST_EXECUTION_RESULT_SURFACE
] as const);

export const OPTIMISING_FUNCTION_CATALOG = Object.freeze([
  entry({
    name: FG_BOOTSTRAP_SDLC_ENTRY,
    intent: "Admit type.unstructured workspace/source pressure into a typed SDLC entry node, proportionality report, or explicit generic F_P fallback before public start dispatch.",
    inputs: ["type.unstructured"],
    outputs: ["sdlc_bootstrap_traversal_outcome"],
    workCategoryGovernanceCategory: "requirements_build",
    graphTrackPublication: "overlay_only"
  }),
  entry({
    name: FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
    intent: "Decompose residual feature-depth pressure between existing graph nodes into an admitted decomposition trace register and depth traversal outcome for ABG-owned child traversal foldback.",
    inputs: [
      "source_node_ref",
      "target_node_ref",
      "parent_obligation_ref",
      "graph_catalog_digest_ref",
      "edge_contract_refs",
      "depth_policy_ref",
      "evidence_policy_ref"
    ],
    outputs: ["sdlc_depth_traversal_outcome"],
    workCategoryGovernanceCategory: "design_build",
    graphTrackPublication: "overlay_only"
  })
]);

function entry(input: {
  readonly name: string;
  readonly intent: string;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly workCategoryGovernanceCategory: SdlcWorkCategoryGovernanceCategory;
  readonly graphTrackPublication?: SdlcFunctionCatalogEntry["graphTrackPublication"];
  readonly specializesGraphFunction?: SdlcFunctionCatalogEntry["specializesGraphFunction"];
}): SdlcFunctionCatalogEntry {
  return Object.freeze({
    kind: "sdlc_function_catalog_entry",
    catalogRole: "product_specialization",
    graphTrackPublication: input.graphTrackPublication ?? "default",
    workCategoryGovernanceCategory: input.workCategoryGovernanceCategory,
    name: input.name,
    intent: input.intent,
    inputs: Object.freeze([...input.inputs]),
    outputs: Object.freeze([...input.outputs]),
    backingGraphFunction: input.name,
    specializesGraphFunction: input.specializesGraphFunction ?? FG_SINGLE_TYPED_TRAVERSAL,
    transformContractRef: `transform://odd_sdlc/${input.name}`,
    evaluationContractRef: `evaluation://odd_sdlc/${input.name}`
  });
}

export const SDLC_REUSABLE_GRAPH_FUNCTION_CATALOG =
  REUSABLE_GRAPH_FUNCTION_CATALOG;

export const OPTIMIZED_FULL_TRAVERSAL_EXECUTIVE_STEPS = Object.freeze([
  "derive_intent_surface",
  "derive_product_surface",
  "derive_goal_surface",
  "derive_requirement_surface",
  "derive_uat_testcases_surface",
  "derive_testcase_authority_surface",
  "derive_feature_decomp_surface",
  "derive_design_surface",
  "derive_scenario_surface",
  "derive_implementation_design_surface",
  "derive_component_code_surface",
  "qualify_component_realization_surface",
  "derive_code_surface",
  "derive_test_design_surface",
  "derive_component_test_surface",
  FG_DERIVE_UAT_TEST_SOURCE_SURFACE,
  "prepare_test_execution_surface",
  "derive_test_execution_result_surface",
  "qualify_component_test_execution_surface",
  "derive_component_repair_schedule_surface",
  "derive_test_run_archive_surface",
  "derive_release_depth_parity_surface",
  "prepare_release_surface"
] as const);

export const BOOTSTRAP_RELEASE_FUNCTION_CATALOG = Object.freeze([
  entry({
    name: "derive_intent_surface",
    intent: "Derive or revise intent from the bound bootstrap inputs.",
    inputs: ["input_set"],
    outputs: ["intent_surface"],
    workCategoryGovernanceCategory: "requirements_build"
  }),
  entry({
    name: "derive_product_surface",
    intent: "Derive product definition from bootstrap inputs and intent.",
    inputs: ["input_set", "intent_surface"],
    outputs: ["product_surface"],
    workCategoryGovernanceCategory: "requirements_build"
  }),
  entry({
    name: "derive_goal_surface",
    intent: "Derive current goals from input, intent, and product surfaces.",
    inputs: ["input_set", "intent_surface", "product_surface"],
    outputs: ["goal_surface"],
    workCategoryGovernanceCategory: "requirements_build"
  }),
  entry({
    name: "derive_requirement_surface",
    intent: "Derive the requirement family surface for the current wave.",
    inputs: ["input_set", "intent_surface", "product_surface", "goal_surface"],
    outputs: ["requirement_surface"],
    workCategoryGovernanceCategory: "requirements_build"
  }),
  entry({
    name: "derive_uat_testcases_surface",
    intent: "Derive UAT testcase pressure directly from requirements before solution design so tests can constrain design instead of being reconstructed from it.",
    inputs: ["requirement_surface"],
    outputs: ["uat_testcases_surface"],
    workCategoryGovernanceCategory: "uat_test_case_build"
  }),
  entry({
    name: "derive_testcase_authority_surface",
    intent: "Derive testcase authority that binds UAT testcase rows to requirement pressure before design and implementation planning.",
    inputs: ["requirement_surface", "uat_testcases_surface"],
    outputs: ["testcase_authority_surface"],
    workCategoryGovernanceCategory: "uat_test_case_build"
  }),
  entry({
    name: "derive_feature_decomp_surface",
    intent: "Derive feature decomposition from current requirements.",
    inputs: ["requirement_surface", "uat_testcases_surface"],
    outputs: ["feature_decomp_surface"],
    workCategoryGovernanceCategory: "design_build"
  }),
  entry({
    name: "derive_design_surface",
    intent: "Derive design from requirements, UAT pressure, testcase authority, and feature decomposition.",
    inputs: [
      "requirement_surface",
      "uat_testcases_surface",
      "testcase_authority_surface",
      "feature_decomp_surface"
    ],
    outputs: ["design_surface"],
    workCategoryGovernanceCategory: "design_build"
  }),
  entry({
    name: "derive_scenario_surface",
    intent: "Derive UAT-bound scenario bundles from requirements, testcase authority, UAT pressure, and design.",
    inputs: [
      "requirement_surface",
      "uat_testcases_surface",
      "testcase_authority_surface",
      "design_surface"
    ],
    outputs: ["scenario_surface"],
    workCategoryGovernanceCategory: "design_build"
  }),
  entry({
    name: "derive_implementation_design_surface",
    intent: "Derive the composite implementation plan carrier from design and scenarios, including stack profile, module rows, aggregate domain model rows, component topology rows, sunny-day sequence rows, realization schedule rows, and file target rows.",
    inputs: ["design_surface", "scenario_surface"],
    outputs: ["implementation_design_surface"],
    workCategoryGovernanceCategory: "design_build"
  }),
  entry({
    name: "derive_component_code_surface",
    intent: "Materialize or repair component-shaped implementation source code through the graph-code-builder contract from the composite implementation plan carrier and any admitted component repair schedule.",
    inputs: ["implementation_design_surface"],
    outputs: ["component_code_surface"],
    workCategoryGovernanceCategory: "coding_build",
    specializesGraphFunction: FG_GRAPH_CODE_BUILDER
  }),
  entry({
    name: "qualify_component_realization_surface",
    intent: "Qualify component code against the declared implementation component topology.",
    inputs: [
      "implementation_design_surface",
      "component_code_surface"
    ],
    outputs: ["component_realization_qualification_surface"],
    workCategoryGovernanceCategory: "coding_build"
  }),
  entry({
    name: "derive_code_surface",
    intent: "Derive the aggregate governed code surface from the composite implementation plan carrier, component code, and component realization qualification.",
    inputs: [
      "implementation_design_surface",
      "component_code_surface",
      "component_realization_qualification_surface"
    ],
    outputs: ["code_surface"],
    workCategoryGovernanceCategory: "coding_build"
  }),
	  entry({
	    name: "derive_test_design_surface",
	    intent: "Derive the composite test plan carrier from design, scenarios, testcase authority, implementation topology, test data, and expected-result bindings without requiring completed component code.",
	    inputs: [
      "design_surface",
      "scenario_surface",
      "uat_testcases_surface",
      "testcase_authority_surface",
      "implementation_design_surface"
    ],
    outputs: ["test_design_surface"],
    workCategoryGovernanceCategory: "unit_test_build"
  }),
  entry({
    name: "derive_component_test_surface",
    intent: "Materialize module-definition-dependent unit and component test source through the graph-code-builder contract from requirement/testcase authority, selected tenant/build authority, test design, and implementation design; component code is consumed by downstream qualification rather than as a blanket generation precondition.",
    inputs: [
      "requirement_surface",
      "testcase_authority_surface",
      "selected_tenant_surface",
      "test_design_surface",
      "implementation_design_surface"
    ],
    outputs: ["component_test_surface"],
    workCategoryGovernanceCategory: "unit_test_build",
    specializesGraphFunction: FG_GRAPH_CODE_BUILDER
  }),
  entry({
    name: FG_DERIVE_UAT_TEST_SOURCE_SURFACE,
    intent: "Materialize requirement-specific UAT executable test source through the graph-code-builder contract from requirements, UAT testcase authority, selected tenant/build authority, and test design; implementation module definitions are not a blanket precondition for UAT test-source generation.",
    inputs: [
      "requirement_surface",
      "uat_testcases_surface",
      "testcase_authority_surface",
      "selected_tenant_surface",
      "test_design_surface"
    ],
    outputs: ["uat_test_source_surface"],
    workCategoryGovernanceCategory: "unit_test_build",
    specializesGraphFunction: FG_GRAPH_CODE_BUILDER
  }),
  entry({
    name: "prepare_test_execution_surface",
    intent: "Prepare declared framework or command-side test execution transition surface from the admitted composite test plan.",
    inputs: ["test_design_surface"],
    outputs: ["test_execution_surface"],
    workCategoryGovernanceCategory: "unit_test_build"
  }),
  entry({
    name: "derive_test_execution_result_surface",
    intent: "Admit governed framework execution evidence and observed test results over generated implementation source, unit/component tests, and UAT test source before archive publication.",
    inputs: [
      "test_execution_surface",
      "test_design_surface",
      "component_code_surface",
      "component_test_surface",
      "uat_test_source_surface"
    ],
    outputs: ["test_execution_result_surface"],
    workCategoryGovernanceCategory: "unit_test_build"
  }),
  entry({
    name: "qualify_component_test_execution_surface",
    intent: "Verify observed test results against expected results in the composite test plan, materialized component tests, UAT test source, and generated implementation source.",
    inputs: [
      "test_execution_result_surface",
      "test_design_surface",
      "component_code_surface",
      "uat_test_source_surface",
      "component_test_surface"
    ],
    outputs: ["component_test_qualification_surface"],
    workCategoryGovernanceCategory: "unit_test_build"
  }),
  entry({
    name: "derive_component_repair_schedule_surface",
    intent: "Derive a bounded component repair schedule from admitted component execution failure rows, execution result truth, and component realization qualification.",
    inputs: [
      "component_test_qualification_surface",
      "test_execution_result_surface",
      "component_realization_qualification_surface"
    ],
    outputs: ["component_repair_schedule_surface"],
    workCategoryGovernanceCategory: "unit_test_build"
  }),
  entry({
    name: "derive_test_run_archive_surface",
    intent: "Derive governed test run archive surface from admitted test execution result truth and component repair schedule state.",
    inputs: [
      "test_design_surface",
      "test_execution_result_surface",
      "component_test_qualification_surface",
      "component_repair_schedule_surface"
    ],
    outputs: ["test_run_archive_surface"],
    workCategoryGovernanceCategory: "unit_test_build"
  }),
  entry({
    name: "derive_release_depth_parity_surface",
    intent: "Derive release depth parity and co-affirmation evidence from component realization, component tests, and admitted test run archive truth.",
    inputs: [
      "implementation_design_surface",
      "component_realization_qualification_surface",
      "component_test_qualification_surface",
      "component_repair_schedule_surface",
      "test_run_archive_surface"
    ],
    outputs: ["release_depth_parity_surface"],
    workCategoryGovernanceCategory: "unit_test_build"
  }),
  entry({
    name: "prepare_release_surface",
    intent: "Prepare release readiness from requirements, design, code, tests, and archive evidence.",
    inputs: [
      "requirement_surface",
      "uat_testcases_surface",
      "testcase_authority_surface",
      "design_surface",
      "scenario_surface",
      "code_surface",
      "test_design_surface",
      "test_run_archive_surface",
      "component_repair_schedule_surface",
      "release_depth_parity_surface"
    ],
    outputs: ["release_surface"],
    workCategoryGovernanceCategory: "design_build"
  })
]);

export const OPERATIONAL_FUNCTION_CATALOG = Object.freeze([
  entry({
    name: "prepare_build_execution_surface",
    intent: "Prepare command-side build transition surface.",
    inputs: ["release_surface"],
    outputs: ["build_execution_surface"],
    workCategoryGovernanceCategory: "coding_build"
  }),
  entry({
    name: "derive_build_execution_result_surface",
    intent: "Admit returned build result or pending build state.",
    inputs: ["build_execution_surface"],
    outputs: ["build_execution_result_surface"],
    workCategoryGovernanceCategory: "coding_build"
  }),
  entry({
    name: "prepare_deployment_surface",
    intent: "Prepare command-side deployment transition surface.",
    inputs: ["release_surface"],
    outputs: ["deployment_surface"],
    workCategoryGovernanceCategory: "coding_build"
  }),
  entry({
    name: "derive_deployment_result_surface",
    intent: "Admit returned deployment result or pending deployment state.",
    inputs: ["deployment_surface"],
    outputs: ["deployment_result_surface"],
    workCategoryGovernanceCategory: "coding_build"
  }),
  entry({
    name: "derive_deployed_environment_surface",
    intent: "Project current deployed environment from deployment result.",
    inputs: ["deployment_result_surface"],
    outputs: ["deployed_environment_surface"],
    workCategoryGovernanceCategory: "coding_build"
  }),
  entry({
    name: "derive_runtime_observation_surface",
    intent: "Bind returned runtime evidence back into the worksite.",
    inputs: ["deployment_result_surface", "test_run_archive_surface"],
    outputs: ["runtime_observation_surface"],
    workCategoryGovernanceCategory: "unit_test_build"
  }),
  entry({
    name: "derive_retrofit_plan_surface",
    intent: "Plan the next retrofit wave from runtime observation and release state.",
    inputs: ["runtime_observation_surface", "release_surface"],
    outputs: ["retrofit_plan_surface"],
    workCategoryGovernanceCategory: "design_build"
  })
]);

export const TRIAGE_FUNCTION_CATALOG = Object.freeze([
  entry({
    name: "observe_gap_pressure",
    intent: "Project current gap pressure from gap dossier and requirement closure truth.",
    inputs: ["sdlc_gap_dossier", "sdlc_requirement_closure_register"],
    outputs: ["gap_observation_surface"],
    workCategoryGovernanceCategory: "design_build"
  }),
  entry({
    name: "classify_gap_triage",
    intent: "Classify observed pressure into framework layer, condition, and process outcome.",
    inputs: ["gap_observation_surface"],
    outputs: ["gap_triage_surface"],
    workCategoryGovernanceCategory: "design_build"
  }),
  entry({
    name: "bind_gap_route",
    intent: "Bind triage classification to lawful re-entry and public start target.",
    inputs: ["gap_observation_surface", "gap_triage_surface"],
    outputs: ["gap_route_surface"],
    workCategoryGovernanceCategory: "design_build"
  }),
  entry({
    name: "propose_constitutional_repricing",
    intent: "Publish a gated constitutional repricing proposal without applying it.",
    inputs: ["gap_triage_surface"],
    outputs: ["repricing_proposal_surface"],
    workCategoryGovernanceCategory: "requirements_build"
  }),
  entry({
    name: "route_ticket_work_item",
    intent: "Project ticket/work-item routing under TICKET_METHOD authority.",
    inputs: ["gap_route_surface"],
    outputs: ["ticket_work_item_route_surface"],
    workCategoryGovernanceCategory: "design_build"
  }),
  entry({
    name: "retire_gap_after_loopback",
    intent: "Publish gap retirement state after loopback over renewed closure truth.",
    inputs: ["gap_observation_surface", "sdlc_requirement_closure_register"],
    outputs: ["gap_retirement_surface"],
    workCategoryGovernanceCategory: "design_build"
  })
]);

export const LITE_FUNCTION_CATALOG = Object.freeze([
  entry({
    name: FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
    intent: "Derive a compact design/ADR authority surface for a bounded implementation slice without expanding the full solution architecture graph.",
    inputs: ["input_set"],
    outputs: ["implementation_design_surface"],
    workCategoryGovernanceCategory: "design_build",
    graphTrackPublication: "overlay_only"
  }),
  entry({
    name: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    intent: "Materialize a bounded component implementation from the lite composite implementation design carrier.",
    inputs: ["implementation_design_surface"],
    outputs: ["component_code_surface"],
    workCategoryGovernanceCategory: "coding_build",
    graphTrackPublication: "overlay_only",
    specializesGraphFunction: FG_GRAPH_CODE_BUILDER
  }),
  entry({
    name: FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
    intent: "Derive proportional test-design authority for a bounded lite/smoke slice from the lite implementation design carrier before generated tests or execution proof.",
    inputs: ["implementation_design_surface"],
    outputs: ["test_design_surface"],
    workCategoryGovernanceCategory: "unit_test_build",
    graphTrackPublication: "overlay_only"
  }),
  entry({
    name: FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
    intent: "Materialize proportional unit/component test source through the graph-code-builder contract for a bounded lite/smoke implementation slice.",
    inputs: ["implementation_design_surface", "test_design_surface"],
    outputs: ["component_test_surface"],
    workCategoryGovernanceCategory: "unit_test_build",
    graphTrackPublication: "overlay_only",
    specializesGraphFunction: FG_GRAPH_CODE_BUILDER
  }),
  entry({
    name: FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
    intent: "Materialize proportional UAT executable test source through the graph-code-builder contract for a bounded lite/smoke implementation slice.",
    inputs: ["implementation_design_surface", "test_design_surface"],
    outputs: ["uat_test_source_surface"],
    workCategoryGovernanceCategory: "unit_test_build",
    graphTrackPublication: "overlay_only",
    specializesGraphFunction: FG_GRAPH_CODE_BUILDER
  })
]);

export const SDLC_FUNCTION_CATALOG = Object.freeze([
  ...OPTIMISING_FUNCTION_CATALOG,
  ...BOOTSTRAP_RELEASE_FUNCTION_CATALOG,
  ...LITE_FUNCTION_CATALOG,
  ...OPERATIONAL_FUNCTION_CATALOG,
  ...TRIAGE_FUNCTION_CATALOG
]);
