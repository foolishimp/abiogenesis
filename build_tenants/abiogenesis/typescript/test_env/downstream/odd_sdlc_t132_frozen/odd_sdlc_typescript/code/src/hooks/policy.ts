// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-015
// Implements: REQ-F-ODDSDLC-057

import type {
  SdlcHookEdgeClass,
  SdlcWorkOperation
} from "./carriers.js";

export interface SdlcHookTargetPolicyEntry {
  readonly kind: "sdlc_hook_target_policy_entry";
  readonly targetAssetType: string;
  readonly edgeClass: SdlcHookEdgeClass;
  readonly defaultOperation: SdlcWorkOperation;
}

function policyEntry(input: {
  readonly targetAssetType: string;
  readonly edgeClass: SdlcHookEdgeClass;
  readonly defaultOperation?: SdlcWorkOperation;
}): SdlcHookTargetPolicyEntry {
  return Object.freeze({
    kind: "sdlc_hook_target_policy_entry",
    targetAssetType: input.targetAssetType,
    edgeClass: input.edgeClass,
    defaultOperation: input.defaultOperation ?? "generate"
  });
}

export const SDLC_HOOK_TARGET_POLICY = Object.freeze([
  policyEntry({
    targetAssetType: "sdlc_bootstrap_traversal_outcome",
    edgeClass: "bootstrap_specification"
  }),
  policyEntry({
    targetAssetType: "sdlc_depth_traversal_outcome",
    edgeClass: "design"
  }),
  policyEntry({
    targetAssetType: "project_bootstrap_surface",
    edgeClass: "bootstrap_specification"
  }),
  policyEntry({
    targetAssetType: "intent_surface",
    edgeClass: "bootstrap_specification"
  }),
  policyEntry({
    targetAssetType: "product_surface",
    edgeClass: "bootstrap_specification"
  }),
  policyEntry({
    targetAssetType: "goal_surface",
    edgeClass: "bootstrap_specification"
  }),
  policyEntry({
    targetAssetType: "requirement_surface",
    edgeClass: "bootstrap_specification"
  }),
  policyEntry({
    targetAssetType: "uat_testcases_surface",
    edgeClass: "design"
  }),
  policyEntry({
    targetAssetType: "testcase_authority_surface",
    edgeClass: "design"
  }),
  policyEntry({
    targetAssetType: "feature_decomp_surface",
    edgeClass: "design"
  }),
  policyEntry({
    targetAssetType: "design_surface",
    edgeClass: "design"
  }),
  policyEntry({
    targetAssetType: "scenario_surface",
    edgeClass: "design"
  }),
  policyEntry({
    targetAssetType: "implementation_design_surface",
    edgeClass: "design"
  }),
  policyEntry({
    targetAssetType: "test_design_surface",
    edgeClass: "design"
  }),
  policyEntry({
    targetAssetType: "component_code_surface",
    edgeClass: "implementation"
  }),
  policyEntry({
    targetAssetType: "component_realization_qualification_surface",
    edgeClass: "qualification",
    defaultOperation: "qualify"
  }),
  policyEntry({
    targetAssetType: "code_surface",
    edgeClass: "implementation"
  }),
  policyEntry({
    targetAssetType: "component_test_surface",
    edgeClass: "qualification"
  }),
  policyEntry({
    targetAssetType: "uat_test_source_surface",
    edgeClass: "qualification"
  }),
  policyEntry({
    targetAssetType: "test_run_archive_surface",
    edgeClass: "qualification",
    defaultOperation: "qualify"
  }),
  policyEntry({
    targetAssetType: "component_test_qualification_surface",
    edgeClass: "qualification",
    defaultOperation: "qualify"
  }),
  policyEntry({
    targetAssetType: "component_repair_schedule_surface",
    edgeClass: "qualification",
    defaultOperation: "qualify"
  }),
  policyEntry({
    targetAssetType: "release_depth_parity_surface",
    edgeClass: "release",
    defaultOperation: "qualify"
  }),
  policyEntry({
    targetAssetType: "release_surface",
    edgeClass: "release",
    defaultOperation: "release"
  }),
  policyEntry({
    targetAssetType: "build_execution_surface",
    edgeClass: "release"
  }),
  policyEntry({
    targetAssetType: "test_execution_surface",
    edgeClass: "release"
  }),
  policyEntry({
    targetAssetType: "deployment_surface",
    edgeClass: "release",
    defaultOperation: "deploy"
  }),
  policyEntry({
    targetAssetType: "build_execution_result_surface",
    edgeClass: "operational_return",
    defaultOperation: "return"
  }),
  policyEntry({
    targetAssetType: "test_execution_result_surface",
    edgeClass: "operational_return",
    defaultOperation: "return"
  }),
  policyEntry({
    targetAssetType: "deployment_result_surface",
    edgeClass: "operational_return"
  }),
  policyEntry({
    targetAssetType: "deployed_environment_surface",
    edgeClass: "operational_return"
  }),
  policyEntry({
    targetAssetType: "runtime_observation_surface",
    edgeClass: "operational_return",
    defaultOperation: "return"
  }),
  policyEntry({
    targetAssetType: "retrofit_plan_surface",
    edgeClass: "operational_return",
    defaultOperation: "retrofit"
  }),
  policyEntry({
    targetAssetType: "gap_observation_surface",
    edgeClass: "operational_return"
  }),
  policyEntry({
    targetAssetType: "gap_triage_surface",
    edgeClass: "operational_return"
  }),
  policyEntry({
    targetAssetType: "gap_route_surface",
    edgeClass: "operational_return"
  }),
  policyEntry({
    targetAssetType: "repricing_proposal_surface",
    edgeClass: "operational_return"
  }),
  policyEntry({
    targetAssetType: "ticket_work_item_route_surface",
    edgeClass: "operational_return"
  }),
  policyEntry({
    targetAssetType: "gap_retirement_surface",
    edgeClass: "operational_return"
  })
] as const);

export function hookTargetPolicyForTarget(
  targetAssetType: string
): SdlcHookTargetPolicyEntry {
  const matched = SDLC_HOOK_TARGET_POLICY.find(
    (entry) => entry.targetAssetType === targetAssetType
  );
  if (matched === undefined) {
    throw new TypeError(
      `SdlcHookTargetPolicy: missing policy for target ${targetAssetType}`
    );
  }
  return matched;
}

export function defaultOperationForTarget(
  targetAssetType: string
): SdlcWorkOperation {
  return hookTargetPolicyForTarget(targetAssetType).defaultOperation;
}
