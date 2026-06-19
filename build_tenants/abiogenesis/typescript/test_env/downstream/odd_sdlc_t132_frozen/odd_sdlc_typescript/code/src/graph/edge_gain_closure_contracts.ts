// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-014
// Implements: REQ-F-ODDSDLC-015
// Implements: REQ-F-ODDSDLC-063
// Implements: REQ-F-ODDSDLC-064
// Implements: REQ-F-ODDSDLC-068
// Investigates: T-164

import {
  FG_BOOTSTRAP_SDLC_ENTRY,
  FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
  FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
  FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
  FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
  FG_DERIVE_UAT_TEST_SOURCE_SURFACE
} from "./catalog.js";
import {
  CONFORM_PROJECT_INPUTS,
  CONFORM_PROJECT_OUTPUTS,
  FG_AMBIGUITY_ASSURANCE_LEDGER,
  FG_CAPABILITY_ASSURANCE_LEDGER,
  FG_CONFORM_PROJECT,
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_GRAPH_CODE_BUILDER,
  FG_INGRESS_PROJECT,
  FG_MATERIALIZATION_ASSURANCE_LEDGER,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  FG_OBLIGATION_CARRY_ASSURANCE_LEDGER,
  FG_REQUIREMENT_FULFILLMENT_ASSURANCE_LEDGER,
  FG_SEMANTIC_CONVERGENCE_ASSURANCE_LEDGER,
  FG_SHALLOW_REALIZATION_ASSURANCE_LEDGER,
  FG_SINGLE_TYPED_TRAVERSAL,
  FG_TRAVERSAL_ASSURANCE_FOLD,
  GRAPH_CODE_BUILDER_INPUTS,
  INGRESS_PROJECT_INPUTS,
  INGRESS_PROJECT_OUTPUTS,
  PROJECT_AUTHORITY_CONFORMANCE_INPUTS,
  PROJECT_AUTHORITY_CONFORMANCE_OUTPUTS
} from "./library.js";

export type SdlcEdgeGainClosureCategory =
  | "conformance"
  | "authority_synthesis"
  | "solution_formalisation"
  | "implementation_encoding"
  | "implementation_qualification"
  | "test_formalisation_and_planning"
  | "test_encoding_and_execution"
  | "repair_archive_release_qualification"
  | "operational_transition_and_return"
  | "project_ingress"
  | "assurance_measurement"
  | "governance_projection"
  | "generic_traversal_library";

export type SdlcEdgeClosureClassification =
  | "close_capable"
  | "library_only"
  | "projection_only"
  | "no_close";

export type SdlcEdgeSourceAssetPolicy = "strict" | "subset_allowed";

export type SdlcEdgeCompositionRole =
  | "prerequisite"
  | "intermediate"
  | "terminal"
  | "proof"
  | "operational"
  | "measuring_tool"
  | "projection"
  | "library";

export interface SdlcEdgeGainClosureFunctionPack {
  readonly deriveObligationsRef: string;
  readonly admitEvidenceRef: string;
  readonly measureGainRef: string;
  readonly closeEdgeRef: string;
  readonly deriveResidualPressureRef: string;
  readonly composePathGainRef: string | null;
}

export interface SdlcEdgeGainClosureCategoryTemplate {
  readonly kind: "sdlc_edge_gain_closure_category_template";
  readonly category: SdlcEdgeGainClosureCategory;
  readonly functionPack: SdlcEdgeGainClosureFunctionPack;
  readonly defaultLedgerInputKinds: readonly string[];
  readonly defaultThresholdPolicyRef: string;
  readonly deterministicOptimizationRefs: readonly string[];
}

export interface SdlcEdgeGainClosureContract {
  readonly kind: "sdlc_edge_gain_closure_contract";
  readonly edgeRef: string;
  readonly category: SdlcEdgeGainClosureCategory;
  readonly closureClassification: SdlcEdgeClosureClassification;
  readonly sourceAssetPolicy: SdlcEdgeSourceAssetPolicy;
  readonly sourceAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly targetOutcomeRef: string;
  readonly authorityBasisRefs: readonly string[];
  readonly obligationDerivationRef: string;
  readonly evidencePolicyRef: string;
  readonly metricFunctionRef: string;
  readonly thresholdPolicyRef: string;
  readonly ledgerInputKinds: readonly string[];
  readonly closureFunctionRef: string;
  readonly residualPressureFunctionRef: string;
  readonly compositionRole: SdlcEdgeCompositionRole;
  readonly proofLaneRefs: readonly string[];
  readonly deterministicOptimizationRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
}

export type SdlcEdgeGainClosureDiagnosticCode =
  | "ambiguous_edge_gain_closure_contract"
  | "duplicate_edge_gain_closure_contract"
  | "missing_edge_gain_closure_contract"
  | "unregistered_edge_gain_closure_contract";

export class SdlcEdgeGainClosureContractError extends TypeError {
  readonly code: SdlcEdgeGainClosureDiagnosticCode;

  constructor(input: {
    readonly code: SdlcEdgeGainClosureDiagnosticCode;
    readonly message: string;
  }) {
    super(`${input.code}: ${input.message}`);
    this.name = "SdlcEdgeGainClosureContractError";
    this.code = input.code;
  }
}

const COMMON_LEDGER_INPUT_KINDS = Object.freeze([
  "sdlc_edge_fulfillment_ledger",
  "sdlc_edge_closure_decision",
  "sdlc_next_action_projection"
] as const);

const CATEGORY_ORDER = Object.freeze([
  "conformance",
  "authority_synthesis",
  "solution_formalisation",
  "implementation_encoding",
  "implementation_qualification",
  "test_formalisation_and_planning",
  "test_encoding_and_execution",
  "repair_archive_release_qualification",
  "operational_transition_and_return",
  "project_ingress",
  "assurance_measurement",
  "governance_projection",
  "generic_traversal_library"
] as const satisfies readonly SdlcEdgeGainClosureCategory[]);

function categoryFunctionPack(
  category: SdlcEdgeGainClosureCategory
): SdlcEdgeGainClosureFunctionPack {
  const base = `function://odd-sdlc/edge-gain/${category}`;
  return Object.freeze({
    deriveObligationsRef: `${base}/derive-obligations`,
    admitEvidenceRef: `${base}/admit-evidence`,
    measureGainRef: `${base}/measure-gain`,
    closeEdgeRef: `${base}/close-edge`,
    deriveResidualPressureRef: `${base}/derive-residual-pressure`,
    composePathGainRef: `${base}/compose-path-gain`
  });
}

function template(
  category: SdlcEdgeGainClosureCategory,
  deterministicOptimizationRefs: readonly string[]
): SdlcEdgeGainClosureCategoryTemplate {
  return Object.freeze({
    kind: "sdlc_edge_gain_closure_category_template" as const,
    category,
    functionPack: categoryFunctionPack(category),
    defaultLedgerInputKinds: COMMON_LEDGER_INPUT_KINDS,
    defaultThresholdPolicyRef: `threshold://odd-sdlc/${category}/all-required-obligations`,
    deterministicOptimizationRefs: Object.freeze([...deterministicOptimizationRefs])
  });
}

export const SDLC_EDGE_GAIN_CLOSURE_CATEGORY_TEMPLATES = Object.freeze(
  CATEGORY_ORDER.map((category) =>
    template(category, deterministicOptimizationsForCategory(category))
  )
);

function deterministicOptimizationsForCategory(
  category: SdlcEdgeGainClosureCategory
): readonly string[] {
  switch (category) {
    case "conformance":
      return Object.freeze([
        "fd://odd-sdlc/workspace-topology",
        "fd://odd-sdlc/project-constraints"
      ]);
    case "authority_synthesis":
      return Object.freeze([
        "fd://odd-sdlc/authority-surface-shape",
        "fd://odd-sdlc/imported-source-trace"
      ]);
    case "solution_formalisation":
      return Object.freeze([
        "fd://odd-sdlc/design-surface-shape",
        "fd://odd-sdlc/design-trace-coverage"
      ]);
    case "implementation_encoding":
      return Object.freeze([
        "fd://odd-sdlc/materialized-file-manifest",
        "fd://odd-sdlc/compiler-or-linter-when-declared"
      ]);
    case "implementation_qualification":
      return Object.freeze([
        "fd://odd-sdlc/component-depth-register",
        "fd://odd-sdlc/topology-to-code-consistency"
      ]);
    case "test_formalisation_and_planning":
      return Object.freeze([
        "fd://odd-sdlc/test-plan-shape",
        "fd://odd-sdlc/test-allocation-coverage"
      ]);
    case "test_encoding_and_execution":
      return Object.freeze([
        "fd://odd-sdlc/test-file-manifest",
        "fd://odd-sdlc/test-execution-result"
      ]);
    case "repair_archive_release_qualification":
      return Object.freeze([
        "fd://odd-sdlc/archive-completeness",
        "fd://odd-sdlc/release-depth-parity"
      ]);
    case "operational_transition_and_return":
      return Object.freeze([
        "fd://odd-sdlc/operational-result-admission",
        "fd://odd-sdlc/runtime-return-probe"
      ]);
    case "project_ingress":
      return Object.freeze([
        "fd://odd-sdlc/ingress-source-ledger",
        "fd://odd-sdlc/project-ingress-contract"
      ]);
    case "assurance_measurement":
      return Object.freeze([
        "fd://odd-sdlc/assurance-ledger-shape",
        "fd://odd-sdlc/assurance-ledger-source-consistency"
      ]);
    case "governance_projection":
      return Object.freeze([
        "fd://odd-sdlc/gap-dossier-shape",
        "fd://odd-sdlc/governance-route-consistency"
      ]);
    case "generic_traversal_library":
      return Object.freeze([
        "fd://odd-sdlc/typed-traversal-contract-shape",
        "fd://odd-sdlc/traversal-evaluation-contract-shape"
      ]);
  }
}

function templateFor(
  category: SdlcEdgeGainClosureCategory
): SdlcEdgeGainClosureCategoryTemplate {
  const found = SDLC_EDGE_GAIN_CLOSURE_CATEGORY_TEMPLATES.find(
    (candidate) => candidate.category === category
  );
  if (found === undefined) {
    throw new TypeError(`${category}: missing gain/closure template`);
  }
  return found;
}

function contract(input: {
  readonly edgeRef: string;
  readonly category: SdlcEdgeGainClosureCategory;
  readonly closureClassification: SdlcEdgeClosureClassification;
  readonly sourceAssetPolicy?: SdlcEdgeSourceAssetPolicy;
  readonly sourceAssetTypes: readonly string[];
  readonly targetAssetType: string;
  readonly compositionRole: SdlcEdgeCompositionRole;
  readonly authorityBasisRefs: readonly string[];
  readonly proofLaneRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
}): SdlcEdgeGainClosureContract {
  const categoryTemplate = templateFor(input.category);
  return Object.freeze({
    kind: "sdlc_edge_gain_closure_contract" as const,
    edgeRef: input.edgeRef,
    category: input.category,
    closureClassification: input.closureClassification,
    sourceAssetPolicy: input.sourceAssetPolicy ?? "strict",
    sourceAssetTypes: Object.freeze([...input.sourceAssetTypes]),
    targetAssetType: input.targetAssetType,
    targetOutcomeRef: `outcome://odd-sdlc/${input.edgeRef}/${input.targetAssetType}`,
    authorityBasisRefs: Object.freeze([...input.authorityBasisRefs]),
    obligationDerivationRef: categoryTemplate.functionPack.deriveObligationsRef,
    evidencePolicyRef: categoryTemplate.functionPack.admitEvidenceRef,
    metricFunctionRef: categoryTemplate.functionPack.measureGainRef,
    thresholdPolicyRef: categoryTemplate.defaultThresholdPolicyRef,
    ledgerInputKinds: categoryTemplate.defaultLedgerInputKinds,
    closureFunctionRef: categoryTemplate.functionPack.closeEdgeRef,
    residualPressureFunctionRef:
      categoryTemplate.functionPack.deriveResidualPressureRef,
    compositionRole: input.compositionRole,
    proofLaneRefs: Object.freeze([...input.proofLaneRefs]),
    deterministicOptimizationRefs:
      categoryTemplate.deterministicOptimizationRefs,
    residualPressureRefs: Object.freeze([...input.residualPressureRefs])
  });
}

const AUTHORITY_REFS = Object.freeze([
  "authority://odd-sdlc/specification",
  "authority://odd-sdlc/imported-sources"
] as const);

const DESIGN_REFS = Object.freeze([
  "authority://odd-sdlc/requirements",
  "authority://odd-sdlc/design-method"
] as const);

const IMPLEMENTATION_REFS = Object.freeze([
  "authority://odd-sdlc/implementation-design",
  "authority://odd-sdlc/module-authority"
] as const);

const TEST_REFS = Object.freeze([
  "authority://odd-sdlc/test-design",
  "authority://odd-sdlc/testcase-authority"
] as const);

const RELEASE_REFS = Object.freeze([
  "authority://odd-sdlc/release-readiness",
  "authority://odd-sdlc/runtime-return"
] as const);

const ASSURANCE_REFS = Object.freeze([
  "authority://odd-sdlc/edge-assurance",
  "authority://odd-sdlc/ledger-measurement"
] as const);

const GOVERNANCE_REFS = Object.freeze([
  "authority://odd-sdlc/gap-analysis",
  "authority://odd-sdlc/governance-routing"
] as const);

const LIBRARY_REFS = Object.freeze([
  "authority://odd-sdlc/graph-library",
  "authority://odd-sdlc/typed-traversal-contract"
] as const);

function secondaryOutputEdgeRef(edgeRef: string, targetAssetType: string): string {
  return `${edgeRef}__${targetAssetType}`;
}

function secondaryOutputContracts(input: {
  readonly edgeRef: string;
  readonly category: SdlcEdgeGainClosureCategory;
  readonly closureClassification: SdlcEdgeClosureClassification;
  readonly sourceAssetTypes: readonly string[];
  readonly targetAssetTypes: readonly string[];
  readonly compositionRole: SdlcEdgeCompositionRole;
  readonly authorityBasisRefs: readonly string[];
  readonly proofLaneRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
}): readonly SdlcEdgeGainClosureContract[] {
  return Object.freeze(
    input.targetAssetTypes.slice(1).map((targetAssetType) =>
      contract({
        edgeRef: secondaryOutputEdgeRef(input.edgeRef, targetAssetType),
        category: input.category,
        closureClassification: input.closureClassification,
        sourceAssetTypes: input.sourceAssetTypes,
        targetAssetType,
        compositionRole: input.compositionRole,
        authorityBasisRefs: input.authorityBasisRefs,
        proofLaneRefs: input.proofLaneRefs,
        residualPressureRefs: input.residualPressureRefs
      })
    )
  );
}

export const SDLC_EDGE_GAIN_CLOSURE_CONTRACTS = Object.freeze([
  contract({
    edgeRef: FG_BOOTSTRAP_SDLC_ENTRY,
    category: "conformance",
    closureClassification: "close_capable",
    sourceAssetTypes: ["type.unstructured"],
    targetAssetType: "sdlc_bootstrap_traversal_outcome",
    compositionRole: "prerequisite",
    authorityBasisRefs: [
      "authority://odd-sdlc/t165-optimising-overlay",
      "authority://odd-sdlc/public-start"
    ],
    proofLaneRefs: ["test://odd-sdlc/t165/bootstrap-entry-optimising-overlay"],
    residualPressureRefs: [
      "pressure://odd-sdlc/t165/bootstrap-entry-generic-fp-fallback"
    ]
  }),
  contract({
    edgeRef: FG_DECOMPOSE_DEPTH_BETWEEN_NODES,
    category: "solution_formalisation",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "source_node_ref",
      "target_node_ref",
      "parent_obligation_ref",
      "graph_catalog_digest_ref",
      "edge_contract_refs",
      "depth_policy_ref",
      "evidence_policy_ref"
    ],
    targetAssetType: "sdlc_depth_traversal_outcome",
    compositionRole: "intermediate",
    authorityBasisRefs: [
      "authority://odd-sdlc/t200-depth-traversal",
      "authority://odd-sdlc/decomposition-trace-register"
    ],
    proofLaneRefs: ["test://odd-sdlc/t200/depth-traversal-catalog"],
    residualPressureRefs: [
      "pressure://odd-sdlc/t200/residual-feature-depth"
    ]
  }),
  contract({
    edgeRef: FG_SINGLE_TYPED_TRAVERSAL,
    category: "generic_traversal_library",
    closureClassification: "library_only",
    sourceAssetTypes: [
      "typed_source_asset",
      "target_type_surface",
      "traversal_transform_contract",
      "traversal_evaluation_contract"
    ],
    targetAssetType: "typed_traversal_closure_surface",
    compositionRole: "library",
    authorityBasisRefs: LIBRARY_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/generic-traversal-library"]
  }),
  contract({
    edgeRef: FG_INGRESS_PROJECT,
    category: "project_ingress",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "ingress_source_set",
      "project_type_surface",
      "project_ingress_contract"
    ],
    targetAssetType: "project_surface",
    compositionRole: "prerequisite",
    authorityBasisRefs: ["authority://odd-sdlc/project-ingress"],
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/project-ingress"]
  }),
  ...secondaryOutputContracts({
    edgeRef: FG_INGRESS_PROJECT,
    category: "project_ingress",
    closureClassification: "close_capable",
    sourceAssetTypes: INGRESS_PROJECT_INPUTS,
    targetAssetTypes: INGRESS_PROJECT_OUTPUTS,
    compositionRole: "prerequisite",
    authorityBasisRefs: ["authority://odd-sdlc/project-ingress"],
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/project-ingress"]
  }),
  contract({
    edgeRef: FG_CONFORM_PROJECT,
    category: "conformance",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "ingress_source_set",
      "source_input_ledger",
      "project_constraints_source",
      "project_topology_policy"
    ],
    targetAssetType: "conform_project_profile",
    compositionRole: "prerequisite",
    authorityBasisRefs: ["authority://odd-sdlc/workspace-topology"],
    proofLaneRefs: ["test://odd-sdlc/t164/conformance"],
    residualPressureRefs: ["pressure://odd-sdlc/conformance"]
  }),
  ...secondaryOutputContracts({
    edgeRef: FG_CONFORM_PROJECT,
    category: "conformance",
    closureClassification: "close_capable",
    sourceAssetTypes: CONFORM_PROJECT_INPUTS,
    targetAssetTypes: CONFORM_PROJECT_OUTPUTS,
    compositionRole: "prerequisite",
    authorityBasisRefs: ["authority://odd-sdlc/workspace-topology"],
    proofLaneRefs: ["test://odd-sdlc/t164/conformance"],
    residualPressureRefs: ["pressure://odd-sdlc/conformance"]
  }),
  contract({
    edgeRef: FG_CONFORM_PROJECT_AUTHORITY,
    category: "authority_synthesis",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "conform_project_profile",
      "selected_tenant_surface",
      "module_inventory_surface",
      "capability_contract_surface",
      "execution_contract_surface",
      "conformance_gap_set"
    ],
    targetAssetType: "project_bootstrap_surface",
    compositionRole: "prerequisite",
    authorityBasisRefs: AUTHORITY_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/authority"],
    residualPressureRefs: ["pressure://odd-sdlc/authority"]
  }),
  ...secondaryOutputContracts({
    edgeRef: FG_CONFORM_PROJECT_AUTHORITY,
    category: "authority_synthesis",
    closureClassification: "close_capable",
    sourceAssetTypes: PROJECT_AUTHORITY_CONFORMANCE_INPUTS,
    targetAssetTypes: PROJECT_AUTHORITY_CONFORMANCE_OUTPUTS,
    compositionRole: "prerequisite",
    authorityBasisRefs: AUTHORITY_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/authority"],
    residualPressureRefs: ["pressure://odd-sdlc/authority"]
  }),
  contract({
    edgeRef: FG_GRAPH_CODE_BUILDER,
    category: "implementation_encoding",
    closureClassification: "library_only",
    sourceAssetTypes: GRAPH_CODE_BUILDER_INPUTS,
    targetAssetType: "code_workspace_surface",
    compositionRole: "library",
    authorityBasisRefs: [
      "authority://odd-sdlc/code-builder",
      "authority://odd-sdlc/tenant-stack",
      "authority://odd-sdlc/design",
      "authority://odd-sdlc/testcase"
    ],
    proofLaneRefs: ["test://odd-sdlc/t203/code-builder"],
    residualPressureRefs: ["pressure://odd-sdlc/code-builder"]
  }),
  contract({
    edgeRef: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
    category: "implementation_encoding",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "project_authority_conformance_projection",
      "requirement_surface",
      "sdlc_target_obligation_binding",
      "product_materialization_contract",
      "worksite_surface"
    ],
    targetAssetType: "component_code_surface",
    compositionRole: "terminal",
    authorityBasisRefs: IMPLEMENTATION_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/product-materialization"],
    residualPressureRefs: ["pressure://odd-sdlc/product-materialization"]
  }),
  contract({
    edgeRef: FG_MATERIALIZATION_ASSURANCE_LEDGER,
    category: "assurance_measurement",
    closureClassification: "library_only",
    sourceAssetTypes: [
      "worker_handoff_manifest",
      "worker_result_report",
      "operator_postflight_result"
    ],
    targetAssetType: "assurance_ledger",
    compositionRole: "measuring_tool",
    authorityBasisRefs: ASSURANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/materialization-assurance"]
  }),
  contract({
    edgeRef: FG_SEMANTIC_CONVERGENCE_ASSURANCE_LEDGER,
    category: "assurance_measurement",
    closureClassification: "library_only",
    sourceAssetTypes: [
      "target_semantic_contract",
      "candidate_result_dossier",
      "semantic_claim_set"
    ],
    targetAssetType: "assurance_ledger",
    compositionRole: "measuring_tool",
    authorityBasisRefs: ASSURANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/semantic-convergence-assurance"]
  }),
  contract({
    edgeRef: FG_OBLIGATION_CARRY_ASSURANCE_LEDGER,
    category: "assurance_measurement",
    closureClassification: "library_only",
    sourceAssetTypes: [
      "prior_gap_dossier_set",
      "current_gap_dossier",
      "worker_handoff_manifest"
    ],
    targetAssetType: "assurance_ledger",
    compositionRole: "measuring_tool",
    authorityBasisRefs: ASSURANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/obligation-carry-assurance"]
  }),
  contract({
    edgeRef: FG_REQUIREMENT_FULFILLMENT_ASSURANCE_LEDGER,
    category: "assurance_measurement",
    closureClassification: "library_only",
    sourceAssetTypes: [
      "requirement_closure_register",
      "lineage_ledger",
      "candidate_result_dossier"
    ],
    targetAssetType: "assurance_ledger",
    compositionRole: "measuring_tool",
    authorityBasisRefs: ASSURANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/requirement-fulfillment-assurance"]
  }),
  contract({
    edgeRef: FG_AMBIGUITY_ASSURANCE_LEDGER,
    category: "assurance_measurement",
    closureClassification: "library_only",
    sourceAssetTypes: [
      "start_intent_surface",
      "edge_traversal_contract",
      "ambiguity_finding_set"
    ],
    targetAssetType: "assurance_ledger",
    compositionRole: "measuring_tool",
    authorityBasisRefs: ASSURANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/ambiguity-assurance"]
  }),
  contract({
    edgeRef: FG_CAPABILITY_ASSURANCE_LEDGER,
    category: "assurance_measurement",
    closureClassification: "library_only",
    sourceAssetTypes: [
      "capability_inventory",
      "generated_source_inventory",
      "candidate_result_dossier"
    ],
    targetAssetType: "assurance_ledger",
    compositionRole: "measuring_tool",
    authorityBasisRefs: ASSURANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/capability-assurance"]
  }),
  contract({
    edgeRef: FG_SHALLOW_REALIZATION_ASSURANCE_LEDGER,
    category: "assurance_measurement",
    closureClassification: "library_only",
    sourceAssetTypes: [
      "generated_source_inventory",
      "generated_test_inventory",
      "candidate_result_dossier"
    ],
    targetAssetType: "assurance_ledger",
    compositionRole: "measuring_tool",
    authorityBasisRefs: ASSURANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/shallow-realization-assurance"]
  }),
  contract({
    edgeRef: FG_TRAVERSAL_ASSURANCE_FOLD,
    category: "assurance_measurement",
    closureClassification: "library_only",
    sourceAssetTypes: [
      "materialization_assurance_ledger",
      "semantic_convergence_assurance_ledger",
      "obligation_carry_assurance_ledger",
      "requirement_fulfillment_assurance_ledger",
      "ambiguity_assurance_ledger",
      "capability_assurance_ledger",
      "shallow_realization_assurance_ledger"
    ],
    targetAssetType: "traversal_requirement_satisfaction",
    compositionRole: "measuring_tool",
    authorityBasisRefs: ASSURANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/traversal-assurance-fold"]
  }),
  contract({
    edgeRef: "derive_intent_surface",
    category: "authority_synthesis",
    closureClassification: "close_capable",
    sourceAssetTypes: ["input_set"],
    targetAssetType: "intent_surface",
    compositionRole: "prerequisite",
    authorityBasisRefs: AUTHORITY_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/authority"],
    residualPressureRefs: ["pressure://odd-sdlc/intent"]
  }),
  contract({
    edgeRef: "derive_product_surface",
    category: "authority_synthesis",
    closureClassification: "close_capable",
    sourceAssetTypes: ["input_set", "intent_surface"],
    targetAssetType: "product_surface",
    compositionRole: "prerequisite",
    authorityBasisRefs: AUTHORITY_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/authority"],
    residualPressureRefs: ["pressure://odd-sdlc/product"]
  }),
  contract({
    edgeRef: "derive_goal_surface",
    category: "authority_synthesis",
    closureClassification: "close_capable",
    sourceAssetTypes: ["input_set", "intent_surface", "product_surface"],
    targetAssetType: "goal_surface",
    compositionRole: "prerequisite",
    authorityBasisRefs: AUTHORITY_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/authority"],
    residualPressureRefs: ["pressure://odd-sdlc/goals"]
  }),
  contract({
    edgeRef: "derive_requirement_surface",
    category: "authority_synthesis",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "input_set",
      "intent_surface",
      "product_surface",
      "goal_surface"
    ],
    targetAssetType: "requirement_surface",
    compositionRole: "prerequisite",
    authorityBasisRefs: AUTHORITY_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/authority"],
    residualPressureRefs: ["pressure://odd-sdlc/requirements"]
  }),
  contract({
    edgeRef: "derive_uat_testcases_surface",
    category: "test_formalisation_and_planning",
    closureClassification: "close_capable",
    sourceAssetTypes: ["requirement_surface"],
    targetAssetType: "uat_testcases_surface",
    compositionRole: "prerequisite",
    authorityBasisRefs: TEST_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/uat-testcases"],
    residualPressureRefs: ["pressure://odd-sdlc/uat-testcases"]
  }),
  contract({
    edgeRef: "derive_testcase_authority_surface",
    category: "test_formalisation_and_planning",
    closureClassification: "close_capable",
    sourceAssetTypes: ["requirement_surface", "uat_testcases_surface"],
    targetAssetType: "testcase_authority_surface",
    compositionRole: "prerequisite",
    authorityBasisRefs: TEST_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/testcase-authority"],
    residualPressureRefs: ["pressure://odd-sdlc/testcase-authority"]
  }),
  contract({
    edgeRef: "derive_feature_decomp_surface",
    category: "solution_formalisation",
    closureClassification: "close_capable",
    sourceAssetTypes: ["requirement_surface", "uat_testcases_surface"],
    targetAssetType: "feature_decomp_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: DESIGN_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/design"],
    residualPressureRefs: ["pressure://odd-sdlc/feature-decomp"]
  }),
  contract({
    edgeRef: "derive_design_surface",
    category: "solution_formalisation",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "requirement_surface",
      "uat_testcases_surface",
      "testcase_authority_surface",
      "feature_decomp_surface"
    ],
    targetAssetType: "design_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: DESIGN_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/design"],
    residualPressureRefs: ["pressure://odd-sdlc/design"]
  }),
  contract({
    edgeRef: "derive_scenario_surface",
    category: "solution_formalisation",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "requirement_surface",
      "uat_testcases_surface",
      "testcase_authority_surface",
      "design_surface"
    ],
    targetAssetType: "scenario_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: DESIGN_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/design"],
    residualPressureRefs: ["pressure://odd-sdlc/scenario"]
  }),
  contract({
    edgeRef: "derive_implementation_design_surface",
    category: "solution_formalisation",
    closureClassification: "close_capable",
    sourceAssetTypes: ["design_surface", "scenario_surface"],
    targetAssetType: "implementation_design_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: DESIGN_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/design"],
    residualPressureRefs: ["pressure://odd-sdlc/implementation-design"]
  }),
  contract({
    edgeRef: "derive_component_code_surface",
    category: "implementation_encoding",
    closureClassification: "close_capable",
    sourceAssetTypes: ["implementation_design_surface"],
    targetAssetType: "component_code_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: IMPLEMENTATION_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/encoding"],
    residualPressureRefs: ["pressure://odd-sdlc/component-code"]
  }),
  contract({
    edgeRef: "qualify_component_realization_surface",
    category: "implementation_qualification",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "implementation_design_surface",
      "component_code_surface"
    ],
    targetAssetType: "component_realization_qualification_surface",
    compositionRole: "proof",
    authorityBasisRefs: IMPLEMENTATION_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/component-qualification"],
    residualPressureRefs: ["pressure://odd-sdlc/component-realization"]
  }),
  contract({
    edgeRef: "derive_code_surface",
    category: "implementation_encoding",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "implementation_design_surface",
      "component_code_surface",
      "component_realization_qualification_surface"
    ],
    targetAssetType: "code_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: IMPLEMENTATION_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/encoding"],
    residualPressureRefs: ["pressure://odd-sdlc/code"]
  }),
  contract({
    edgeRef: "derive_test_design_surface",
    category: "test_formalisation_and_planning",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "design_surface",
      "scenario_surface",
      "uat_testcases_surface",
      "testcase_authority_surface",
      "implementation_design_surface"
    ],
    targetAssetType: "test_design_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: TEST_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/test-planning"],
    residualPressureRefs: ["pressure://odd-sdlc/test-design"]
  }),
  contract({
    edgeRef: "derive_component_test_surface",
    category: "test_encoding_and_execution",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "requirement_surface",
      "testcase_authority_surface",
      "selected_tenant_surface",
      "test_design_surface",
      "implementation_design_surface"
    ],
    targetAssetType: "component_test_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: TEST_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/test-execution"],
    residualPressureRefs: ["pressure://odd-sdlc/component-test"]
  }),
  contract({
    edgeRef: FG_DERIVE_UAT_TEST_SOURCE_SURFACE,
    category: "test_encoding_and_execution",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "requirement_surface",
      "uat_testcases_surface",
      "testcase_authority_surface",
      "selected_tenant_surface",
      "test_design_surface"
    ],
    targetAssetType: "uat_test_source_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: TEST_REFS,
    proofLaneRefs: ["test://odd-sdlc/t203/uat-test-source"],
    residualPressureRefs: ["pressure://odd-sdlc/uat-test-source"]
  }),
  contract({
    edgeRef: "prepare_test_execution_surface",
    category: "test_encoding_and_execution",
    closureClassification: "close_capable",
    sourceAssetTypes: ["test_design_surface"],
    targetAssetType: "test_execution_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: TEST_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/test-execution"],
    residualPressureRefs: ["pressure://odd-sdlc/test-execution-command"]
  }),
  contract({
    edgeRef: "derive_test_execution_result_surface",
    category: "test_encoding_and_execution",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "test_execution_surface",
      "test_design_surface",
      "component_code_surface",
      "component_test_surface",
      "uat_test_source_surface"
    ],
    targetAssetType: "test_execution_result_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: TEST_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/test-execution"],
    residualPressureRefs: ["pressure://odd-sdlc/test-execution-result"]
  }),
  contract({
    edgeRef: "qualify_component_test_execution_surface",
    category: "test_encoding_and_execution",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "test_execution_result_surface",
      "test_design_surface",
      "component_code_surface",
      "uat_test_source_surface",
      "component_test_surface"
    ],
    targetAssetType: "component_test_qualification_surface",
    compositionRole: "proof",
    authorityBasisRefs: TEST_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/test-execution"],
    residualPressureRefs: ["pressure://odd-sdlc/component-test-qualification"]
  }),
  contract({
    edgeRef: "derive_component_repair_schedule_surface",
    category: "repair_archive_release_qualification",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "component_test_qualification_surface",
      "test_execution_result_surface",
      "component_realization_qualification_surface"
    ],
    targetAssetType: "component_repair_schedule_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: RELEASE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/release-readiness"],
    residualPressureRefs: ["pressure://odd-sdlc/component-repair"]
  }),
  contract({
    edgeRef: "derive_test_run_archive_surface",
    category: "repair_archive_release_qualification",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "test_design_surface",
      "test_execution_result_surface",
      "component_test_qualification_surface",
      "component_repair_schedule_surface"
    ],
    targetAssetType: "test_run_archive_surface",
    compositionRole: "proof",
    authorityBasisRefs: RELEASE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/release-readiness"],
    residualPressureRefs: ["pressure://odd-sdlc/test-run-archive"]
  }),
  contract({
    edgeRef: "derive_release_depth_parity_surface",
    category: "repair_archive_release_qualification",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "implementation_design_surface",
      "component_realization_qualification_surface",
      "component_test_qualification_surface",
      "component_repair_schedule_surface",
      "test_run_archive_surface"
    ],
    targetAssetType: "release_depth_parity_surface",
    compositionRole: "proof",
    authorityBasisRefs: RELEASE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/release-readiness"],
    residualPressureRefs: ["pressure://odd-sdlc/release-depth-parity"]
  }),
  contract({
    edgeRef: "prepare_release_surface",
    category: "repair_archive_release_qualification",
    closureClassification: "close_capable",
    sourceAssetTypes: [
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
    targetAssetType: "release_surface",
    compositionRole: "terminal",
    authorityBasisRefs: RELEASE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/release-readiness"],
    residualPressureRefs: ["pressure://odd-sdlc/release"]
  }),
  contract({
    edgeRef: "prepare_build_execution_surface",
    category: "operational_transition_and_return",
    closureClassification: "close_capable",
    sourceAssetTypes: ["release_surface"],
    targetAssetType: "build_execution_surface",
    compositionRole: "operational",
    authorityBasisRefs: RELEASE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/operational-return"],
    residualPressureRefs: ["pressure://odd-sdlc/build-execution"]
  }),
  contract({
    edgeRef: "derive_build_execution_result_surface",
    category: "operational_transition_and_return",
    closureClassification: "close_capable",
    sourceAssetTypes: ["build_execution_surface"],
    targetAssetType: "build_execution_result_surface",
    compositionRole: "operational",
    authorityBasisRefs: RELEASE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/operational-return"],
    residualPressureRefs: ["pressure://odd-sdlc/build-result"]
  }),
  contract({
    edgeRef: "prepare_deployment_surface",
    category: "operational_transition_and_return",
    closureClassification: "close_capable",
    sourceAssetTypes: ["release_surface"],
    targetAssetType: "deployment_surface",
    compositionRole: "operational",
    authorityBasisRefs: RELEASE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/operational-return"],
    residualPressureRefs: ["pressure://odd-sdlc/deployment-command"]
  }),
  contract({
    edgeRef: "derive_deployment_result_surface",
    category: "operational_transition_and_return",
    closureClassification: "close_capable",
    sourceAssetTypes: ["deployment_surface"],
    targetAssetType: "deployment_result_surface",
    compositionRole: "operational",
    authorityBasisRefs: RELEASE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/operational-return"],
    residualPressureRefs: ["pressure://odd-sdlc/deployment-result"]
  }),
  contract({
    edgeRef: "derive_deployed_environment_surface",
    category: "operational_transition_and_return",
    closureClassification: "close_capable",
    sourceAssetTypes: ["deployment_result_surface"],
    targetAssetType: "deployed_environment_surface",
    compositionRole: "operational",
    authorityBasisRefs: RELEASE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/operational-return"],
    residualPressureRefs: ["pressure://odd-sdlc/deployed-environment"]
  }),
  contract({
    edgeRef: "derive_runtime_observation_surface",
    category: "operational_transition_and_return",
    closureClassification: "close_capable",
    sourceAssetTypes: ["deployment_result_surface", "test_run_archive_surface"],
    targetAssetType: "runtime_observation_surface",
    compositionRole: "operational",
    authorityBasisRefs: RELEASE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/operational-return"],
    residualPressureRefs: ["pressure://odd-sdlc/runtime-observation"]
  }),
  contract({
    edgeRef: "derive_retrofit_plan_surface",
    category: "operational_transition_and_return",
    closureClassification: "close_capable",
    sourceAssetTypes: ["runtime_observation_surface", "release_surface"],
    targetAssetType: "retrofit_plan_surface",
    compositionRole: "terminal",
    authorityBasisRefs: RELEASE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/operational-return"],
    residualPressureRefs: ["pressure://odd-sdlc/retrofit-plan"]
  }),
  contract({
    edgeRef: FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
    category: "solution_formalisation",
    closureClassification: "close_capable",
    sourceAssetTypes: ["input_set"],
    targetAssetType: "implementation_design_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: DESIGN_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/lite-overlay"],
    residualPressureRefs: ["pressure://odd-sdlc/lite-design"]
  }),
  contract({
    edgeRef: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    category: "implementation_encoding",
    closureClassification: "close_capable",
    sourceAssetPolicy: "subset_allowed",
    sourceAssetTypes: ["implementation_design_surface"],
    targetAssetType: "component_code_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: IMPLEMENTATION_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/lite-overlay"],
    residualPressureRefs: [
      "pressure://odd-sdlc/lite-component-code",
      "pressure://odd-sdlc/current-full-traversal-refinement"
    ]
  }),
  contract({
    edgeRef: FG_DERIVE_LITE_TEST_DESIGN_SURFACE,
    category: "test_formalisation_and_planning",
    closureClassification: "close_capable",
    sourceAssetTypes: ["implementation_design_surface"],
    targetAssetType: "test_design_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: TEST_REFS,
    proofLaneRefs: ["test://odd-sdlc/t203/lite-test-design"],
    residualPressureRefs: [
      "pressure://odd-sdlc/lite-test-design",
      "pressure://odd-sdlc/current-full-traversal-refinement"
    ]
  }),
  contract({
    edgeRef: FG_DERIVE_LITE_COMPONENT_TEST_SURFACE,
    category: "test_encoding_and_execution",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "implementation_design_surface",
      "test_design_surface"
    ],
    targetAssetType: "component_test_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: TEST_REFS,
    proofLaneRefs: ["test://odd-sdlc/t203/lite-component-test"],
    residualPressureRefs: [
      "pressure://odd-sdlc/lite-component-test",
      "pressure://odd-sdlc/current-full-traversal-refinement"
    ]
  }),
  contract({
    edgeRef: FG_DERIVE_LITE_UAT_TEST_SOURCE_SURFACE,
    category: "test_encoding_and_execution",
    closureClassification: "close_capable",
    sourceAssetTypes: [
      "implementation_design_surface",
      "test_design_surface"
    ],
    targetAssetType: "uat_test_source_surface",
    compositionRole: "intermediate",
    authorityBasisRefs: TEST_REFS,
    proofLaneRefs: ["test://odd-sdlc/t203/lite-uat-test-source"],
    residualPressureRefs: [
      "pressure://odd-sdlc/lite-uat-test-source",
      "pressure://odd-sdlc/current-full-traversal-refinement"
    ]
  }),
  contract({
    edgeRef: "observe_gap_pressure",
    category: "governance_projection",
    closureClassification: "projection_only",
    sourceAssetTypes: [
      "sdlc_gap_dossier",
      "sdlc_requirement_closure_register"
    ],
    targetAssetType: "gap_observation_surface",
    compositionRole: "projection",
    authorityBasisRefs: GOVERNANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/gap-observation"]
  }),
  contract({
    edgeRef: "classify_gap_triage",
    category: "governance_projection",
    closureClassification: "projection_only",
    sourceAssetTypes: ["gap_observation_surface"],
    targetAssetType: "gap_triage_surface",
    compositionRole: "projection",
    authorityBasisRefs: GOVERNANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/gap-triage"]
  }),
  contract({
    edgeRef: "bind_gap_route",
    category: "governance_projection",
    closureClassification: "projection_only",
    sourceAssetTypes: ["gap_observation_surface", "gap_triage_surface"],
    targetAssetType: "gap_route_surface",
    compositionRole: "projection",
    authorityBasisRefs: GOVERNANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/gap-route"]
  }),
  contract({
    edgeRef: "propose_constitutional_repricing",
    category: "governance_projection",
    closureClassification: "projection_only",
    sourceAssetTypes: ["gap_triage_surface"],
    targetAssetType: "repricing_proposal_surface",
    compositionRole: "projection",
    authorityBasisRefs: GOVERNANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/repricing-proposal"]
  }),
  contract({
    edgeRef: "route_ticket_work_item",
    category: "governance_projection",
    closureClassification: "projection_only",
    sourceAssetTypes: ["gap_route_surface"],
    targetAssetType: "ticket_work_item_route_surface",
    compositionRole: "projection",
    authorityBasisRefs: GOVERNANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/ticket-work-item-route"]
  }),
  contract({
    edgeRef: "retire_gap_after_loopback",
    category: "governance_projection",
    closureClassification: "projection_only",
    sourceAssetTypes: [
      "gap_observation_surface",
      "sdlc_requirement_closure_register"
    ],
    targetAssetType: "gap_retirement_surface",
    compositionRole: "projection",
    authorityBasisRefs: GOVERNANCE_REFS,
    proofLaneRefs: ["test://odd-sdlc/t164/published-inventory"],
    residualPressureRefs: ["pressure://odd-sdlc/gap-retirement"]
  })
]);

export function indexSdlcEdgeGainClosureContracts(input: {
  readonly contracts: readonly SdlcEdgeGainClosureContract[];
}): ReadonlyMap<string, SdlcEdgeGainClosureContract> {
  const byEdge = new Map<string, SdlcEdgeGainClosureContract>();
  for (const contractRow of input.contracts) {
    assertUnambiguousSdlcEdgeGainClosureContract(contractRow);
    if (byEdge.has(contractRow.edgeRef)) {
      throw new SdlcEdgeGainClosureContractError({
        code: "duplicate_edge_gain_closure_contract",
        message: `${contractRow.edgeRef}: duplicate edge contract row`
      });
    }
    byEdge.set(contractRow.edgeRef, contractRow);
  }
  return byEdge;
}

function assertUnambiguousSdlcEdgeGainClosureContract(
  contractRow: SdlcEdgeGainClosureContract
): void {
  const requiredStrings: readonly unknown[] = [
    contractRow.edgeRef,
    contractRow.category,
    contractRow.closureClassification,
    contractRow.sourceAssetPolicy,
    contractRow.targetAssetType,
    contractRow.targetOutcomeRef,
    contractRow.obligationDerivationRef,
    contractRow.evidencePolicyRef,
    contractRow.metricFunctionRef,
    contractRow.thresholdPolicyRef,
    contractRow.closureFunctionRef,
    contractRow.residualPressureFunctionRef
  ];
  const requiredCollections = [
    contractRow.sourceAssetTypes,
    contractRow.authorityBasisRefs,
    contractRow.ledgerInputKinds,
    contractRow.proofLaneRefs,
    contractRow.deterministicOptimizationRefs,
    contractRow.residualPressureRefs
  ];
  if (
    requiredStrings.some(
      (value) => typeof value !== "string" || value.trim().length === 0
    ) ||
    requiredCollections.some((values) => values.length === 0)
  ) {
    throw new SdlcEdgeGainClosureContractError({
      code: "ambiguous_edge_gain_closure_contract",
      message: `${contractRow.edgeRef || "<missing-edge-ref>"}: contract row does not fully declare edge identity, authority, evidence, metric, closure, proof, and residual-pressure fields`
    });
  }
  if (
    contractRow.closureClassification !== "close_capable" &&
    contractRow.closureClassification !== "library_only" &&
    contractRow.closureClassification !== "projection_only" &&
    contractRow.closureClassification !== "no_close"
  ) {
    throw new SdlcEdgeGainClosureContractError({
      code: "ambiguous_edge_gain_closure_contract",
      message: `${contractRow.edgeRef}: contract row declares an unsupported closure classification: ${contractRow.closureClassification}`
    });
  }
  if (
    contractRow.sourceAssetPolicy !== "strict" &&
    contractRow.sourceAssetPolicy !== "subset_allowed"
  ) {
    throw new SdlcEdgeGainClosureContractError({
      code: "ambiguous_edge_gain_closure_contract",
      message: `${contractRow.edgeRef}: contract row declares an unsupported source asset policy: ${contractRow.sourceAssetPolicy}`
    });
  }
}

export function assertSdlcEdgeGainClosureContractsRegistered(input: {
  readonly publishedGraphVectorRefs: readonly string[];
  readonly contracts: readonly SdlcEdgeGainClosureContract[];
}): void {
  const published = new Set(input.publishedGraphVectorRefs);
  for (const contractRow of input.contracts) {
    if (!published.has(contractRow.edgeRef)) {
      throw new SdlcEdgeGainClosureContractError({
        code: "unregistered_edge_gain_closure_contract",
        message: `${contractRow.edgeRef}: contract row is not a published graph vector`
      });
    }
  }
}

export function assertSdlcOverlayEdgeGainClosureContracts(input: {
  readonly overlayRef: string;
  readonly graphVectorRefs: readonly string[];
  readonly contracts: readonly SdlcEdgeGainClosureContract[];
}): void {
  const byEdge = indexSdlcEdgeGainClosureContracts({
    contracts: input.contracts
  });
  for (const graphVectorRef of input.graphVectorRefs) {
    if (!byEdge.has(graphVectorRef)) {
      throw new SdlcEdgeGainClosureContractError({
        code: "missing_edge_gain_closure_contract",
        message: `${input.overlayRef}: ${graphVectorRef} has no gain/closure contract`
      });
    }
  }
}

export function assertSdlcEdgeGainClosureMatrix(input: {
  readonly overlays: readonly {
    readonly overlayRef: string;
    readonly graphVectorRefs: readonly string[];
  }[];
  readonly publishedGraphVectorRefs: readonly string[];
  readonly contracts: readonly SdlcEdgeGainClosureContract[];
}): void {
  indexSdlcEdgeGainClosureContracts({ contracts: input.contracts });
  assertSdlcEdgeGainClosureContractsRegistered({
    publishedGraphVectorRefs: input.publishedGraphVectorRefs,
    contracts: input.contracts
  });
  for (const overlay of input.overlays) {
    assertSdlcOverlayEdgeGainClosureContracts({
      overlayRef: overlay.overlayRef,
      graphVectorRefs: overlay.graphVectorRefs,
      contracts: input.contracts
    });
  }
}
