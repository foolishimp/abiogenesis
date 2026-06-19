import {
  admitSdlcAssetFamily,
  admitSdlcAssetType,
  admitSdlcWorkActDescriptor
} from "./admission.js";

export const SOFTWARE_DOMAIN_ASSET_FAMILIES = Object.freeze([
  admitSdlcAssetFamily({
    name: "worksite_inputs",
    description: "Operator-supplied and constitutional inputs that open a bounded software-domain wave of work.",
    lifecycleRole: "entry",
    representativeAssetTypes: [
      "intent_doc",
      "product_doc",
      "goal_surface",
      "requirement_surface",
      "uat_testcases_surface",
      "testcase_authority_surface",
      "work_request_surface"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcAssetFamily({
    name: "solution_design",
    description: "Structured design, decomposition, and scenario surfaces that define what is being built and how it will be qualified.",
    lifecycleRole: "design",
    representativeAssetTypes: [
      "feature_decomp_surface",
      "design_surface",
      "scenario_surface",
      "uat_testcases_surface",
      "testcase_authority_surface"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcAssetFamily({
    name: "implementation_branch",
    description: "Composite implementation design, code, and qualification surfaces for the active software branch under construction.",
    lifecycleRole: "build",
    representativeAssetTypes: [
      "implementation_design_surface",
      "component_code_surface",
      "component_realization_qualification_surface",
      "code_surface"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcAssetFamily({
    name: "qualification_branch",
    description: "Composite test design, materialized test source, execution, verification, repair, and archived evidence surfaces used to qualify the active software branch.",
    lifecycleRole: "qualification",
    representativeAssetTypes: [
      "test_design_surface",
      "component_test_surface",
      "uat_test_source_surface",
      "test_execution_surface",
      "test_execution_result_surface",
      "component_test_qualification_surface",
      "component_repair_schedule_surface",
      "test_run_archive_surface"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcAssetFamily({
    name: "release_readiness",
    description: "Release-oriented decision surfaces that summarize whether the current software branch is qualified for launch.",
    lifecycleRole: "release",
    representativeAssetTypes: [
      "release_surface",
      "release_document_surface"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcAssetFamily({
    name: "deployment_records",
    description: "Governed records describing how a qualified software branch is launched into an operating environment.",
    lifecycleRole: "deployment",
    representativeAssetTypes: [
      "deployment_record_surface",
      "deployment_surface",
      "deployment_result_surface",
      "deployed_environment_surface"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcAssetFamily({
    name: "runtime_evidence",
    description: "Operational observations, incidents, and comparative evidence returned from launched software back into the worksite.",
    lifecycleRole: "operation",
    representativeAssetTypes: [
      "runtime_observation_surface",
      "operational_evidence_surface",
      "build_execution_surface",
      "build_execution_result_surface",
      "test_execution_surface",
      "test_execution_result_surface"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcAssetFamily({
    name: "retrofit_plans",
    description: "Maintenance and retrofit planning surfaces that govern corrective work, upgrades, and relaunch decisions.",
    lifecycleRole: "retrofit",
    representativeAssetTypes: [
      "maintenance_plan_surface",
      "retrofit_design_surface",
      "retrofit_plan_surface"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcAssetFamily({
    name: "governance_loop",
    description: "Observation, triage, route, repricing, ticket-route, and retirement surfaces for the homeostatic governance loop.",
    lifecycleRole: "operation",
    representativeAssetTypes: [
      "gap_observation_surface",
      "gap_triage_surface",
      "gap_route_surface",
      "repricing_proposal_surface",
      "ticket_work_item_route_surface",
      "gap_retirement_surface"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcAssetFamily({
    name: "builder_scenario_contracts",
    description: "Bootstrap, lifecycle graph, graph-function selection, and lawful action contracts that drive guided installed live-build lanes.",
    lifecycleRole: "entry",
    representativeAssetTypes: [
      "bootstrap_start_document_surface",
      "scenario_contract_surface",
      "lifecycle_graph_surface",
      "graph_function_selection_surface",
      "lawful_action_menu_surface",
      "operator_workspace_dialogue_surface",
      "deployed_domain_surface"
    ],
    realizationStatus: "active_t131_t133_contract"
  }),
  admitSdlcAssetFamily({
    name: "installed_traversal_run",
    description: "Installed-workspace runtime and operator-run archives that make a live traversal diagnosable from the sandbox that executed it.",
    lifecycleRole: "build",
    representativeAssetTypes: [
      "installed_runtime_surface",
      "operator_run_archive_surface",
      "worker_invocation_surface",
      "worker_process_trace_surface",
      "runtime_liveness_projection_surface"
    ],
    realizationStatus: "active_t133_proof_structure"
  }),
  admitSdlcAssetFamily({
    name: "consequence_chain",
    description: "Replay-visible construction consequence surfaces from observed worksite through intent, fulfillment, closure, next-action projection, product materialization, and execution proof.",
    lifecycleRole: "build",
    representativeAssetTypes: [
      "worksite_evidence_surface",
      "construction_intent_surface",
      "edge_fulfillment_ledger_surface",
      "edge_closure_decision_surface",
      "next_action_projection_surface",
      "product_materialization_manifest_surface",
      "materialized_product_file_surface",
      "execution_proof_surface"
    ],
    realizationStatus: "active_t002_t133_contract"
  })
]);

export const SOFTWARE_DOMAIN_WORK_ACT_TYPES = Object.freeze([
  admitSdlcWorkActDescriptor({
    name: "generate",
    description: "Construct new governed artifacts for the current bounded branch of work.",
    mutatesWorkspace: true,
    producesGovernedEvidence: true,
    typicalAssetFamilies: [
      "solution_design",
      "implementation_branch",
      "qualification_branch"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcWorkActDescriptor({
    name: "adopt",
    description: "Bring existing artifacts under governed provenance without pretending they were freshly generated in this workspace.",
    mutatesWorkspace: true,
    producesGovernedEvidence: true,
    typicalAssetFamilies: [
      "implementation_branch",
      "qualification_branch",
      "runtime_evidence"
    ],
    realizationStatus: "declared_domain_contract"
  }),
  admitSdlcWorkActDescriptor({
    name: "import",
    description: "Register external artifacts or evidence into the worksite with explicit provenance and scope.",
    mutatesWorkspace: true,
    producesGovernedEvidence: true,
    typicalAssetFamilies: [
      "worksite_inputs",
      "runtime_evidence"
    ],
    realizationStatus: "declared_domain_contract"
  }),
  admitSdlcWorkActDescriptor({
    name: "qualify",
    description: "Produce governed evidence and authority surfaces that determine whether the current branch is fit for downstream use.",
    mutatesWorkspace: true,
    producesGovernedEvidence: true,
    typicalAssetFamilies: [
      "qualification_branch",
      "release_readiness"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcWorkActDescriptor({
    name: "release",
    description: "Stabilize a bounded branch as ready for launch into a deployment environment.",
    mutatesWorkspace: true,
    producesGovernedEvidence: true,
    typicalAssetFamilies: [
      "release_readiness",
      "deployment_records"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcWorkActDescriptor({
    name: "deploy",
    description: "Launch a qualified branch into service and record the governed deployment state.",
    mutatesWorkspace: true,
    producesGovernedEvidence: true,
    typicalAssetFamilies: [
      "deployment_records",
      "runtime_evidence"
    ],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcWorkActDescriptor({
    name: "observe",
    description: "Return governed operational evidence from a launched branch back to the active worksite.",
    mutatesWorkspace: true,
    producesGovernedEvidence: true,
    typicalAssetFamilies: ["runtime_evidence"],
    realizationStatus: "active_first_slice"
  }),
  admitSdlcWorkActDescriptor({
    name: "retrofit",
    description: "Repair, extend, or reconfigure the active branch using returned operational evidence.",
    mutatesWorkspace: true,
    producesGovernedEvidence: true,
    typicalAssetFamilies: [
      "retrofit_plans",
      "implementation_branch",
      "qualification_branch"
    ],
    realizationStatus: "active_first_slice"
  })
]);

export const SOFTWARE_DOMAIN_ASSET_TYPES = Object.freeze(
  [
    "intent_doc",
    "product_doc",
    "goal_surface",
    "requirement_surface",
    "uat_testcases_surface",
    "testcase_authority_surface",
    "work_request_surface",
    "feature_decomp_surface",
    "design_surface",
    "scenario_surface",
    "implementation_design_surface",
    "component_code_surface",
    "component_realization_qualification_surface",
    "code_surface",
    "test_design_surface",
    "component_test_surface",
    "uat_test_source_surface",
    "component_test_qualification_surface",
    "component_repair_schedule_surface",
    "test_run_archive_surface",
    "release_surface",
    "release_document_surface",
    "deployment_record_surface",
    "deployment_surface",
    "deployment_result_surface",
    "deployed_environment_surface",
    "build_execution_surface",
    "build_execution_result_surface",
    "test_execution_surface",
    "test_execution_result_surface",
    "runtime_observation_surface",
    "operational_evidence_surface",
    "maintenance_plan_surface",
    "retrofit_design_surface",
    "retrofit_plan_surface",
    "gap_observation_surface",
    "gap_triage_surface",
    "gap_route_surface",
    "repricing_proposal_surface",
    "ticket_work_item_route_surface",
    "gap_retirement_surface",
    "bootstrap_start_document_surface",
    "scenario_contract_surface",
    "lifecycle_graph_surface",
    "graph_function_selection_surface",
    "lawful_action_menu_surface",
    "operator_workspace_dialogue_surface",
    "deployed_domain_surface",
    "installed_runtime_surface",
    "operator_run_archive_surface",
    "worker_invocation_surface",
    "worker_process_trace_surface",
    "runtime_liveness_projection_surface",
    "worksite_evidence_surface",
    "construction_intent_surface",
    "edge_fulfillment_ledger_surface",
    "edge_closure_decision_surface",
    "next_action_projection_surface",
    "product_materialization_manifest_surface",
    "materialized_product_file_surface",
    "execution_proof_surface"
  ].map((name) =>
    admitSdlcAssetType({
      name,
      description: `Software-domain asset type ${name}.`,
      semanticFacets: ["software_domain", "governed_asset"],
      libraryLevel: "generic",
      mutableDefault: true,
      proofHints: ["typed_identity", "provenance"],
      closureHints: ["traceable_checkpoint"]
    })
  )
);
