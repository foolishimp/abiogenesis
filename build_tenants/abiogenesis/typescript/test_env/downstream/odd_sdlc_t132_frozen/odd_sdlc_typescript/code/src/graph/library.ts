// Implements: REQ-F-GFUNC-003
// Implements: REQ-F-GFUNC-004
// Implements: REQ-F-GFUNC-005
// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-014
// Implements: REQ-F-ODDSDLC-015

export const FG_SINGLE_TYPED_TRAVERSAL =
  "Fg_single_typed_traversal" as const;

export const FG_INGRESS_PROJECT = "Fg_ingress_project" as const;

export const FG_CONFORM_PROJECT = "Fg_conform_project" as const;

export const FG_CONFORM_PROJECT_AUTHORITY = "Fg_conform_project_authority" as const;

export const FG_GRAPH_CODE_BUILDER = "Fg_graph_code_builder" as const;

export const FG_MATERIALIZE_DECLARED_PRODUCT_ASSET =
  "Fg_materialize_declared_product_asset" as const;

export const FG_MATERIALIZATION_ASSURANCE_LEDGER =
  "Fg_materialization_assurance_ledger" as const;

export const FG_SEMANTIC_CONVERGENCE_ASSURANCE_LEDGER =
  "Fg_semantic_convergence_assurance_ledger" as const;

export const FG_OBLIGATION_CARRY_ASSURANCE_LEDGER =
  "Fg_obligation_carry_assurance_ledger" as const;

export const FG_REQUIREMENT_FULFILLMENT_ASSURANCE_LEDGER =
  "Fg_requirement_fulfillment_assurance_ledger" as const;

export const FG_AMBIGUITY_ASSURANCE_LEDGER =
  "Fg_ambiguity_assurance_ledger" as const;

export const FG_CAPABILITY_ASSURANCE_LEDGER =
  "Fg_capability_assurance_ledger" as const;

export const FG_SHALLOW_REALIZATION_ASSURANCE_LEDGER =
  "Fg_shallow_realization_assurance_ledger" as const;

export const FG_TRAVERSAL_ASSURANCE_FOLD =
  "Fg_traversal_assurance_fold" as const;

export type SdlcReusableGraphFunctionName =
  | typeof FG_SINGLE_TYPED_TRAVERSAL
  | typeof FG_INGRESS_PROJECT
  | typeof FG_CONFORM_PROJECT
  | typeof FG_CONFORM_PROJECT_AUTHORITY
  | typeof FG_GRAPH_CODE_BUILDER
  | typeof FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
  | typeof FG_MATERIALIZATION_ASSURANCE_LEDGER
  | typeof FG_SEMANTIC_CONVERGENCE_ASSURANCE_LEDGER
  | typeof FG_OBLIGATION_CARRY_ASSURANCE_LEDGER
  | typeof FG_REQUIREMENT_FULFILLMENT_ASSURANCE_LEDGER
  | typeof FG_AMBIGUITY_ASSURANCE_LEDGER
  | typeof FG_CAPABILITY_ASSURANCE_LEDGER
  | typeof FG_SHALLOW_REALIZATION_ASSURANCE_LEDGER
  | typeof FG_TRAVERSAL_ASSURANCE_FOLD;

export type SdlcComputeRegime = "F_D" | "F_P" | "F_H";

export interface TypeSurfaceRef {
  readonly kind: "type_surface_ref";
  readonly name: string;
  readonly schemaRef: string;
  readonly assetKind: string;
  readonly authorityRefs: readonly string[];
}

export interface TypedAssetRef<TTypeName extends string = string> {
  readonly kind: "typed_asset_ref";
  readonly typeName: TTypeName;
  readonly assetRef: string;
  readonly digestRef: string | null;
  readonly provenanceRefs: readonly string[];
}

export interface TraversalTransformContract<
  TSourceTypeName extends string = string,
  TTargetTypeName extends string = string
> {
  readonly kind: "traversal_transform_contract";
  readonly sourceTypeNames: readonly TSourceTypeName[];
  readonly targetTypeName: TTargetTypeName;
  readonly deterministicTransformRef: string | null;
  readonly probabilisticConstructRef: string | null;
  readonly workReportContractRef: string;
  readonly capabilityRefs: readonly string[];
}

export interface TraversalEvaluationContract<
  TSourceTypeName extends string = string,
  TTargetTypeName extends string = string
> {
  readonly kind: "traversal_evaluation_contract";
  readonly sourceTypeNames: readonly TSourceTypeName[];
  readonly targetTypeName: TTargetTypeName;
  readonly preflightFdRefs: readonly string[];
  readonly capabilityFdRefs: readonly string[];
  readonly postflightFdRefs: readonly string[];
  readonly operationalFdRefs: readonly string[];
  readonly humanEscalationPolicyRef: string | null;
}

export interface TypedTraversalProgramSpec<
  TSourceTypeName extends string = string,
  TTargetTypeName extends string = string
> {
  readonly kind: "typed_traversal_program_spec";
  readonly graphFunctionName: string;
  readonly sourceTypeNames: readonly TSourceTypeName[];
  readonly targetTypeName: TTargetTypeName;
  readonly transformContractRef: string;
  readonly evaluationContractRef: string;
  readonly closureContractRef: string;
  readonly continuationPolicyRef: string;
}

export type IngressSourceStructureGrade =
  | "unstructured"
  | "loosely_structured"
  | "structured";

export interface IngressSourceLedgerEntry {
  readonly kind: "ingress_source_ledger_entry";
  readonly sourceRef: string;
  readonly relativePath: string;
  readonly digestRef: string;
  readonly detectedRole: string;
  readonly authorityMarkers: readonly string[];
}

export interface IngressSourceSet {
  readonly kind: "ingress_source_set";
  readonly workspaceRootUri: string;
  readonly structureGrade: IngressSourceStructureGrade;
  readonly sources: readonly IngressSourceLedgerEntry[];
}

export interface ProjectIngressContract {
  readonly kind: "project_ingress_contract";
  readonly graphFunctionName: typeof FG_INGRESS_PROJECT;
  readonly projectTypeRef: string;
  readonly topologyPolicyRef: string;
  readonly ambiguityPolicyRef: string;
  readonly importedAuthorityPolicyRef: string;
  readonly selectedOutputRoot: string;
  readonly activeTenant: string;
}

export interface SdlcReusableGraphFunctionCatalogEntry {
  readonly kind: "sdlc_reusable_graph_function_catalog_entry";
  readonly name: SdlcReusableGraphFunctionName;
  readonly intent: string;
  readonly graphFunctionRole: "reusable_library";
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly stableOuterContract: string;
  readonly computeOrder: readonly string[];
  readonly abgOwnedRuntimeTruth: readonly string[];
  readonly sdlcOwnedDomainTruth: readonly string[];
}

export const SINGLE_TYPED_TRAVERSAL_INPUTS = Object.freeze([
  "typed_source_asset",
  "target_type_surface",
  "traversal_transform_contract",
  "traversal_evaluation_contract"
] as const);

export const SINGLE_TYPED_TRAVERSAL_OUTPUTS = Object.freeze([
  "typed_traversal_closure_surface"
] as const);

export const INGRESS_PROJECT_INPUTS = Object.freeze([
  "ingress_source_set",
  "project_type_surface",
  "project_ingress_contract"
] as const);

export const INGRESS_PROJECT_OUTPUTS = Object.freeze([
  "project_surface",
  "source_input_ledger",
  "lineage_map",
  "ambiguity_register",
  "bootstrap_gap_set"
] as const);

export const CONFORM_PROJECT_INPUTS = Object.freeze([
  "ingress_source_set",
  "source_input_ledger",
  "project_constraints_source",
  "project_topology_policy"
] as const);

export const CONFORM_PROJECT_OUTPUTS = Object.freeze([
  "conform_project_profile",
  "selected_tenant_surface",
  "module_inventory_surface",
  "capability_contract_surface",
  "execution_contract_surface",
  "conformance_gap_set"
] as const);

export const PROJECT_AUTHORITY_CONFORMANCE_INPUTS = Object.freeze([
  "conform_project_profile",
  "selected_tenant_surface",
  "module_inventory_surface",
  "capability_contract_surface",
  "execution_contract_surface",
  "conformance_gap_set"
] as const);

export const PROJECT_AUTHORITY_CONFORMANCE_OUTPUTS = Object.freeze([
  "project_bootstrap_surface",
  "intent_surface",
  "product_surface",
  "goal_surface",
  "project_authority_conformance_projection",
  "project_authority_next_action_projection"
] as const);

export const DECLARED_PRODUCT_MATERIALIZATION_INPUTS = Object.freeze([
  "project_authority_conformance_projection",
  "requirement_surface",
  "sdlc_target_obligation_binding",
  "product_materialization_contract",
  "worksite_surface"
] as const);

export const DECLARED_PRODUCT_MATERIALIZATION_OUTPUTS = Object.freeze([
  "component_code_surface"
] as const);

export const GRAPH_CODE_BUILDER_INPUTS = Object.freeze([
  "requirements_or_uat_test_pressure",
  "selected_tenant_surface",
  "design_authority_surface",
  "code_builder_target_contract"
] as const);

export const GRAPH_CODE_BUILDER_OUTPUTS = Object.freeze([
  "code_workspace_surface"
] as const);

export const MATERIALIZATION_ASSURANCE_INPUTS = Object.freeze([
  "worker_handoff_manifest",
  "worker_result_report",
  "operator_postflight_result"
] as const);

export const SEMANTIC_CONVERGENCE_ASSURANCE_INPUTS = Object.freeze([
  "target_semantic_contract",
  "candidate_result_dossier",
  "semantic_claim_set"
] as const);

export const OBLIGATION_CARRY_ASSURANCE_INPUTS = Object.freeze([
  "prior_gap_dossier_set",
  "current_gap_dossier",
  "worker_handoff_manifest"
] as const);

export const REQUIREMENT_FULFILLMENT_ASSURANCE_INPUTS = Object.freeze([
  "requirement_closure_register",
  "lineage_ledger",
  "candidate_result_dossier"
] as const);

export const AMBIGUITY_ASSURANCE_INPUTS = Object.freeze([
  "start_intent_surface",
  "edge_traversal_contract",
  "ambiguity_finding_set"
] as const);

export const CAPABILITY_ASSURANCE_INPUTS = Object.freeze([
  "capability_inventory",
  "generated_source_inventory",
  "candidate_result_dossier"
] as const);

export const SHALLOW_REALIZATION_ASSURANCE_INPUTS = Object.freeze([
  "generated_source_inventory",
  "generated_test_inventory",
  "candidate_result_dossier"
] as const);

export const TRAVERSAL_ASSURANCE_FOLD_INPUTS = Object.freeze([
  "materialization_assurance_ledger",
  "semantic_convergence_assurance_ledger",
  "obligation_carry_assurance_ledger",
  "requirement_fulfillment_assurance_ledger",
  "ambiguity_assurance_ledger",
  "capability_assurance_ledger",
  "shallow_realization_assurance_ledger"
] as const);

export const ASSURANCE_LEDGER_OUTPUTS = Object.freeze([
  "assurance_ledger"
] as const);

export const TRAVERSAL_ASSURANCE_FOLD_OUTPUTS = Object.freeze([
  "traversal_requirement_satisfaction"
] as const);

export const REUSABLE_GRAPH_FUNCTION_CATALOG: readonly SdlcReusableGraphFunctionCatalogEntry[] =
  Object.freeze([
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_SINGLE_TYPED_TRAVERSAL,
      intent:
        "Reusable governed single-hop traversal over explicit source type, target type, transform contract, and evaluation contract.",
      graphFunctionRole: "reusable_library",
      inputs: SINGLE_TYPED_TRAVERSAL_INPUTS,
      outputs: SINGLE_TYPED_TRAVERSAL_OUTPUTS,
      stableOuterContract:
        "TypedAssetRef<A> + TypeSurfaceRef<B> + TraversalTransformContract<A,B> + TraversalEvaluationContract<A,B> -> TypedTraversalClosureSurface<B>",
      computeOrder: Object.freeze([
        "preflight:F_D",
        "construct:F_P",
        "escalate:F_H_optional",
        "postflight:F_D"
      ]),
      abgOwnedRuntimeTruth: Object.freeze([
        "graph_call",
        "frame",
        "continuation",
        "iteration",
        "retry",
        "event",
        "projection"
      ]),
      sdlcOwnedDomainTruth: Object.freeze([
        "asset_type_meaning",
        "transform_contract",
        "evaluation_contract",
        "work_report_contract",
        "closure_interpretation"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_INGRESS_PROJECT,
      intent:
        "Reusable bootstrap traversal that projects broad source input into a conformant Project typed entity with lineage, ambiguity, and gap evidence.",
      graphFunctionRole: "reusable_library",
      inputs: INGRESS_PROJECT_INPUTS,
      outputs: INGRESS_PROJECT_OUTPUTS,
      stableOuterContract:
        "IngressSourceSet + TypeSurfaceRef<Project> + ProjectIngressContract -> Project + SourceInputLedger + LineageMap + AmbiguityRegister + BootstrapGapSet",
      computeOrder: Object.freeze([
        "preflight:F_D",
        "interpret:F_P",
        "escalate:F_H_optional",
        "postflight:F_D"
      ]),
      abgOwnedRuntimeTruth: Object.freeze([
        "graph_call",
        "frame",
        "continuation",
        "iteration",
        "retry",
        "event",
        "projection"
      ]),
      sdlcOwnedDomainTruth: Object.freeze([
        "project_type_meaning",
        "ingress_contract",
        "topology_policy",
        "lineage_interpretation",
        "ambiguity_interpretation"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_CONFORM_PROJECT,
      intent:
        "Reusable deterministic conformance traversal that canonicalizes broad bootstrap documents and project constraints into the active project profile consumed by downstream SDLC graph programs.",
      graphFunctionRole: "reusable_library",
      inputs: CONFORM_PROJECT_INPUTS,
      outputs: CONFORM_PROJECT_OUTPUTS,
      stableOuterContract:
        "IngressSourceSet + SourceInputLedger + ProjectConstraintsSource + ProjectTopologyPolicy -> ConformProjectProfile + Tenant + ModuleInventory + CapabilityContracts + ExecutionContracts + ConformanceGaps",
      computeOrder: Object.freeze([
        "preflight:F_D",
        "canonicalize:F_D",
        "carry_ambiguity:F_P_optional",
        "postflight:F_D"
      ]),
      abgOwnedRuntimeTruth: Object.freeze([
        "graph_call",
        "frame",
        "continuation",
        "iteration",
        "retry",
        "event",
        "projection"
      ]),
      sdlcOwnedDomainTruth: Object.freeze([
        "project_conformance_meaning",
        "selected_tenant_truth",
        "module_inventory",
        "capability_contracts",
        "execution_contracts",
        "realization_mode"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_CONFORM_PROJECT_AUTHORITY,
      intent:
        "Audit an already loaded workspace authority surface and next-action projection without authoring replacement specification truth.",
      graphFunctionRole: "reusable_library",
      inputs: PROJECT_AUTHORITY_CONFORMANCE_INPUTS,
      outputs: PROJECT_AUTHORITY_CONFORMANCE_OUTPUTS,
      stableOuterContract:
        "ConformProjectProfile + Tenant + ModuleInventory + CapabilityContracts + ExecutionContracts + ConformanceGaps -> ProjectAuthorityConformance + Intent? + Product? + Goals? + NextActionProjection",
      computeOrder: Object.freeze([
        "observe:F_D",
        "induct:F_P",
        "project_next_action:F_P",
        "postflight:F_D"
      ]),
      abgOwnedRuntimeTruth: Object.freeze([
        "graph_call",
        "frame",
        "continuation",
        "event",
        "projection"
      ]),
      sdlcOwnedDomainTruth: Object.freeze([
        "project_authority_read_model",
        "supportable_authority_surfaces",
        "authority_gap_interpretation",
        "next_action_interpretation"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_GRAPH_CODE_BUILDER,
      intent:
        "Reusable code-builder traversal that materializes a target code workspace from admitted requirement or UAT pressure, selected tenant/build authority, design authority, and a target contract.",
      graphFunctionRole: "reusable_library",
      inputs: GRAPH_CODE_BUILDER_INPUTS,
      outputs: GRAPH_CODE_BUILDER_OUTPUTS,
      stableOuterContract:
        "RequirementOrUatPressure + SelectedTenantSurface + DesignAuthoritySurface + CodeBuilderTargetContract -> CodeWorkspaceSurface",
      computeOrder: Object.freeze([
        "preflight:F_D",
        "construct:F_P",
        "admit_evidence:F_D",
        "evaluate_action:F_P",
        "postflight:F_D"
      ]),
      abgOwnedRuntimeTruth: Object.freeze([
        "graph_call",
        "frame",
        "continuation",
        "iteration",
        "retry",
        "event",
        "projection"
      ]),
      sdlcOwnedDomainTruth: Object.freeze([
        "code_builder_target_meaning",
        "tenant_stack_authority",
        "design_authority_interpretation",
        "uat_test_authority_interpretation",
        "source_test_consumption_policy"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
      intent:
        "Materialize the declared product asset from conformed project authority, requirement transformation-set rows, target binding, and the current worksite.",
      graphFunctionRole: "reusable_library",
      inputs: DECLARED_PRODUCT_MATERIALIZATION_INPUTS,
      outputs: DECLARED_PRODUCT_MATERIALIZATION_OUTPUTS,
      stableOuterContract:
        "ProjectAuthorityConformance + RequirementSurface + SdlcTargetObligationBinding + ProductMaterializationContract + WorksiteSurface -> ComponentCodeSurface",
      computeOrder: Object.freeze([
        "observe:F_D",
        "construct:F_P",
        "admit_evidence:F_D",
        "evaluate_action:F_P",
        "postflight:F_D"
      ]),
      abgOwnedRuntimeTruth: Object.freeze([
        "graph_call",
        "frame",
        "intent",
        "event",
        "projection",
        "runtime_liveness"
      ]),
      sdlcOwnedDomainTruth: Object.freeze([
        "declared_product_target",
        "requirement_transformation_set",
        "target_obligation_binding",
        "product_materialization_contract",
        "worksite_interpretation"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_MATERIALIZATION_ASSURANCE_LEDGER,
      intent:
        "Deterministically evaluate whether a traversal materialized the declared product files under the admitted output contract.",
      graphFunctionRole: "reusable_library",
      inputs: MATERIALIZATION_ASSURANCE_INPUTS,
      outputs: ASSURANCE_LEDGER_OUTPUTS,
      stableOuterContract:
        "WorkerHandoffManifest + WorkerResultReport + OperatorPostflightResult -> MaterializationAssuranceLedger",
      computeOrder: Object.freeze(["evaluate:F_D"]),
      abgOwnedRuntimeTruth: Object.freeze(["event", "projection", "retry"]),
      sdlcOwnedDomainTruth: Object.freeze([
        "product_materialization_contract",
        "tenant_root_path_basis",
        "file_manifest_truth",
        "materialization_closure_interpretation"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_SEMANTIC_CONVERGENCE_ASSURANCE_LEDGER,
      intent:
        "Evaluate whether a traversal result covers the declared target meaning rather than merely restating it.",
      graphFunctionRole: "reusable_library",
      inputs: SEMANTIC_CONVERGENCE_ASSURANCE_INPUTS,
      outputs: ASSURANCE_LEDGER_OUTPUTS,
      stableOuterContract:
        "TargetSemanticContract + CandidateResultDossier + SemanticClaimSet -> SemanticConvergenceAssuranceLedger",
      computeOrder: Object.freeze(["evaluate:F_D"]),
      abgOwnedRuntimeTruth: Object.freeze(["event", "projection", "retry"]),
      sdlcOwnedDomainTruth: Object.freeze([
        "target_asset_meaning",
        "semantic_claim_truth",
        "semantic_gap_interpretation"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_OBLIGATION_CARRY_ASSURANCE_LEDGER,
      intent:
        "Evaluate whether prior gaps and retry obligations were closed, carried forward, or unlawfully dropped.",
      graphFunctionRole: "reusable_library",
      inputs: OBLIGATION_CARRY_ASSURANCE_INPUTS,
      outputs: ASSURANCE_LEDGER_OUTPUTS,
      stableOuterContract:
        "PriorGapDossierSet + CurrentGapDossier + WorkerHandoffManifest -> ObligationCarryAssuranceLedger",
      computeOrder: Object.freeze(["evaluate:F_D"]),
      abgOwnedRuntimeTruth: Object.freeze(["continuation", "retry", "projection"]),
      sdlcOwnedDomainTruth: Object.freeze([
        "gap_obligation_meaning",
        "retry_handoff_interpretation",
        "obligation_closure_interpretation"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_REQUIREMENT_FULFILLMENT_ASSURANCE_LEDGER,
      intent:
        "Evaluate candidate traversal evidence against admitted requirement closure truth.",
      graphFunctionRole: "reusable_library",
      inputs: REQUIREMENT_FULFILLMENT_ASSURANCE_INPUTS,
      outputs: ASSURANCE_LEDGER_OUTPUTS,
      stableOuterContract:
        "RequirementClosureRegister + LineageLedger + CandidateResultDossier -> RequirementFulfillmentAssuranceLedger",
      computeOrder: Object.freeze(["evaluate:F_D"]),
      abgOwnedRuntimeTruth: Object.freeze(["event", "projection", "retry"]),
      sdlcOwnedDomainTruth: Object.freeze([
        "requirement_authority",
        "lineage_interpretation",
        "requirement_closure_interpretation"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_AMBIGUITY_ASSURANCE_LEDGER,
      intent:
        "Turn ambiguity in authority, target meaning, evidence, or transition basis into typed traversal state.",
      graphFunctionRole: "reusable_library",
      inputs: AMBIGUITY_ASSURANCE_INPUTS,
      outputs: ASSURANCE_LEDGER_OUTPUTS,
      stableOuterContract:
        "StartIntentSurface + EdgeTraversalContract + AmbiguityFindingSet -> AmbiguityAssuranceLedger",
      computeOrder: Object.freeze(["evaluate:F_D"]),
      abgOwnedRuntimeTruth: Object.freeze(["event", "projection", "retry"]),
      sdlcOwnedDomainTruth: Object.freeze([
        "ambiguity_kind",
        "lawful_reentry_point",
        "authority_layer_interpretation"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_CAPABILITY_ASSURANCE_LEDGER,
      intent:
        "Evaluate generated product evidence against the required capability inventory.",
      graphFunctionRole: "reusable_library",
      inputs: CAPABILITY_ASSURANCE_INPUTS,
      outputs: ASSURANCE_LEDGER_OUTPUTS,
      stableOuterContract:
        "CapabilityInventory + GeneratedSourceInventory + CandidateResultDossier -> CapabilityAssuranceLedger",
      computeOrder: Object.freeze(["evaluate:F_D"]),
      abgOwnedRuntimeTruth: Object.freeze(["event", "projection", "retry"]),
      sdlcOwnedDomainTruth: Object.freeze([
        "capability_inventory_truth",
        "capability_evidence_interpretation",
        "domain_shape_depth"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_SHALLOW_REALIZATION_ASSURANCE_LEDGER,
      intent:
        "Reject placeholder, constant-success, trace-only, and identity-only realization evidence for non-trivial edges.",
      graphFunctionRole: "reusable_library",
      inputs: SHALLOW_REALIZATION_ASSURANCE_INPUTS,
      outputs: ASSURANCE_LEDGER_OUTPUTS,
      stableOuterContract:
        "GeneratedSourceInventory + GeneratedTestInventory + CandidateResultDossier -> ShallowRealizationAssuranceLedger",
      computeOrder: Object.freeze(["evaluate:F_D"]),
      abgOwnedRuntimeTruth: Object.freeze(["event", "projection", "retry"]),
      sdlcOwnedDomainTruth: Object.freeze([
        "realization_depth_interpretation",
        "shallow_pattern_detection",
        "deepening_obligation"
      ])
    }),
    Object.freeze({
      kind: "sdlc_reusable_graph_function_catalog_entry",
      name: FG_TRAVERSAL_ASSURANCE_FOLD,
      intent:
        "Fold assurance ledgers into the deterministic traversal requirement satisfaction input consumed by the total transition function.",
      graphFunctionRole: "reusable_library",
      inputs: TRAVERSAL_ASSURANCE_FOLD_INPUTS,
      outputs: TRAVERSAL_ASSURANCE_FOLD_OUTPUTS,
      stableOuterContract:
        "AssuranceLedgerSet -> TraversalRequirementSatisfaction",
      computeOrder: Object.freeze(["fold:F_D"]),
      abgOwnedRuntimeTruth: Object.freeze(["event", "projection", "retry"]),
      sdlcOwnedDomainTruth: Object.freeze([
        "ledger_precedence",
        "closure_interpretation",
        "retry_handoff_interpretation"
      ])
    })
  ]);
