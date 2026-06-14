// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-PAYLOAD
// Supports: REQ-L-GTL3-ASSET-SURFACE

import type {
  AssetSurface,
  Graph,
  GraphFunction,
  GraphVector,
  Node,
  Regime
} from "../../../gtl/m01/contracts/carriers.js";
import {
  interfaceContract,
  nodeContractKey,
  materializeGraphFunction
} from "../../../gtl/m01/contracts/carriers.js";
import {
  admitAssetSurface
} from "../../../gtl/m01/admission/carriers.js";
import type {
  Module
} from "../../../gtl/m02/contracts/carriers.js";
import type {
  EngineComputeStagePurpose,
  EngineComputeStageRole,
  EnginePluginContract
} from "./plugins.js";
import {
  admitEnginePluginContract,
  ENGINE_COMPUTE_STAGE_PURPOSE_VALUES,
  ENGINE_COMPUTE_STAGE_ROLE_VALUES
} from "./plugins.js";
import {
  deriveAllowedConsequenceTraversalCatalogFromGtl
} from "./allowed_consequence_traversal_catalog.js";
import {
  stableJson,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  GRAPH_REENTRY_POINT_VALUES,
  type GraphReentryPoint
} from "./carriers.js";

export type GtlProgramConformanceSurfaceKind =
  | "graph_function"
  | "graph"
  | "module"
  | "graph_vector"
  | "program_inventory"
  | "target_carrier_contract"
  | "edge_closure_contract"
  | "overlay"
  | "public_start"
  | "prompt_asset"
  | "plugin_contract"
  | "source_identity"
  | "same_object"
  | "operator_declaration"
  | "evaluator_declaration"
  | "rule_declaration"
  | "compute_composition"
  | "compute_stage_binding"
  | "hook_boundary"
  | "selection_boundary"
  | "job_binding"
  | "role_binding"
  | "external_tool_gate"
  | "runtime_binding"
  | "runtime_reentry_route"
  | "feature_coverage";

export interface GtlProgramConformanceIssue {
  readonly kind: "gtl_program_conformance_issue";
  readonly severity: "error";
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly message: string;
  readonly evidenceRefs: readonly string[];
}

export interface GtlProgramTargetCarrierRow {
  readonly edgeRef: string;
  readonly graphVectorRef: string;
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
  readonly targetAssetType: string;
  readonly targetCarrierContractRef: string;
  readonly targetCarrierContractDigest: string;
  readonly targetCarrierTemplateRef: string;
  readonly outputSurfaceRef: string;
  readonly outputCarrierFamilyRef: string;
  readonly outputCarrierKind: string;
  readonly envelopeContractRef: string;
  readonly nestedPayloadPath: string;
  readonly requiredFieldRefs: readonly string[];
  readonly optionalFieldRefs: readonly string[];
  readonly fixedProtocolFieldRefs: readonly string[];
  readonly workerFillableFieldRefs: readonly string[];
  readonly literalDomainRefs: readonly string[];
  readonly enumDomainRefs: readonly string[];
  readonly schemaRef: string;
  readonly admissionRef: string;
  readonly payloadLedgerBindingRef: string;
  readonly edgeAssuranceBindingRef: string;
  readonly handoffProjectionRef: string;
  readonly constructionTemplateRef: string;
  readonly replayDigestPolicyRef: string;
  readonly materializationPolicyRef: string;
  readonly closurePreconditionRef: string;
}

export interface GtlProgramEdgeClosureRow {
  readonly edgeRef: string;
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
  readonly targetAssetType: string;
}

export interface GtlProgramOverlayRow {
  readonly overlayRef: string;
  readonly graphFunctionRefs: readonly string[];
  readonly graphVectorRefs: readonly string[];
  readonly publicStartTargets: readonly string[];
  readonly defaultStartTarget: string;
}

export interface GtlProgramPublicStartRow {
  readonly name: string;
  readonly graphFunctionRef: string;
  readonly overlayRefs: readonly string[];
  readonly defaultForOverlayRefs: readonly string[];
}

export interface GtlProgramPromptAssetRow {
  readonly surfaceRef: string;
  readonly assetSurface: AssetSurface;
  readonly gtlNode?: Node | undefined;
  readonly renderedViewDigest?: string | null | undefined;
  readonly currentAbgFoldRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramSourceIdentityRow {
  readonly surfaceRef: string;
  readonly text: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramHostSurfaceKind =
  | "graph_function"
  | "graph_vector"
  | "operator"
  | "evaluator"
  | "rule"
  | "job"
  | "role"
  | "module"
  | "candidate_family"
  | "refinement_boundary"
  | "visible_defaults"
  | "external_tool";

export interface GtlProgramSameObjectRow {
  readonly proofRef: string;
  readonly leftRef: string;
  readonly rightRef: string;
  readonly equalityDigest: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramOperatorDeclarationRow {
  readonly operatorRef: string;
  readonly name: string;
  readonly regime: Regime;
  readonly binding: string;
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly hostRef: string;
  readonly tagRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramEvaluatorDeclarationRow {
  readonly evaluatorRef: string;
  readonly name: string;
  readonly regime: Regime;
  readonly description: string;
  readonly binding: string;
  readonly consumedFieldRefs: readonly string[];
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly hostRef: string;
  readonly tagRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramRuleDeclarationRow {
  readonly ruleRef: string;
  readonly name: string;
  readonly ruleKind: string;
  readonly configDigest: string;
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly hostRef: string;
  readonly tagRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramCompositionDeclarationSourceKind =
  | "graph_vector_declaration"
  | "graph_function_declaration"
  | "operator_declaration"
  | "evaluator_declaration"
  | "rule_declaration"
  | "job_policy_hook"
  | "role_policy_hook"
  | "module_policy_hook"
  | "visible_defaults"
  | "published_template";

export interface GtlProgramComputeCompositionRow {
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly hostRef: string;
  readonly declarationSourceKind: GtlProgramCompositionDeclarationSourceKind;
  readonly declarationSourceRef: string;
  readonly notationRefs: readonly string[];
  readonly regimeBindingRefs: readonly string[];
  readonly stageBindingRefs: readonly string[];
  readonly closureContractRef: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramStageRegimeDisposition =
  | "participates"
  | "not_used"
  | "external_callout";

export interface GtlProgramStageRegimeDispositionRow {
  readonly regime: Regime;
  readonly disposition: GtlProgramStageRegimeDisposition;
  readonly selectedRegimeBindingRefs: readonly string[];
  readonly reasonRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface GtlProgramComputeStageBindingRow {
  readonly stageBindingRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly stageRole: EngineComputeStageRole;
  readonly stageNotationRef: string;
  readonly stagePurpose: EngineComputeStagePurpose;
  readonly computeMeans: Regime;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly predecessorStageBindingRefs: readonly string[];
  readonly pluginContractRefs: readonly string[];
  readonly hookRefs: readonly string[];
  readonly regimeDispositions: readonly GtlProgramStageRegimeDispositionRow[];
  readonly mayWriteLedgers: false;
  readonly mayEmitRuntimeEvents: false;
  readonly maySelectTraversal: false;
  readonly mayCloseTraversal: false;
  readonly mayOwnIterationLoop: false;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramHookDeclarationSourceKind =
  | "graph_vector_declaration"
  | "graph_function_declaration"
  | "job_policy_hook"
  | "role_policy_hook"
  | "module_policy_hook"
  | "candidate_family_policy_hint"
  | "visible_defaults";

export interface GtlProgramHookBoundaryRow {
  readonly hookRef: string;
  readonly hookKey: string;
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly hostRef: string;
  readonly declarationSourceKind: GtlProgramHookDeclarationSourceKind;
  readonly declarationRef: string;
  readonly precedenceRank: number;
  readonly concernRefs: readonly string[];
  readonly pluginContractRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramSelectionBoundaryKind =
  | "refinement_boundary"
  | "candidate_family"
  | "subwork"
  | "synthesis";

export interface GtlProgramSelectionBoundaryRow {
  readonly boundaryRef: string;
  readonly boundaryKind: GtlProgramSelectionBoundaryKind;
  readonly hostRef: string;
  readonly inputContractRefs: readonly string[];
  readonly outputContractRefs: readonly string[];
  readonly candidateRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramJobBindingRow {
  readonly jobRef: string;
  readonly contractTargetRefs: readonly string[];
  readonly roleRefs: readonly string[];
  readonly policyHookRefs: readonly string[];
  readonly publicCallableGraphFunctionRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramRoleBindingRow {
  readonly roleRef: string;
  readonly capabilityRefs: readonly string[];
  readonly policyHookRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface GtlProgramExternalToolGateRow {
  readonly toolGateRef: string;
  readonly toolRef: string;
  readonly boundaryRef: string;
  readonly transportRef: string;
  readonly payloadContractRef: string;
  readonly admissionRef: string;
  readonly notLanguageTruthEvidenceRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramRuntimeBindingKind =
  | "abg_cli_runtime_binding"
  | "abg_public_callable_start"
  | "abg_public_control_loop";

export interface GtlProgramRuntimeBindingRow {
  readonly bindingRef: string;
  readonly runtimeBindingKind: GtlProgramRuntimeBindingKind;
  readonly moduleRef: string;
  readonly publicStartRef: string;
  readonly commandRef: string;
  readonly pluginContractRefs: readonly string[];
  readonly stageBindingRefs: readonly string[];
  readonly consumesPluginsThroughAbg: true;
  readonly forbidsProductLocalIteration: true;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export type GtlProgramRepairSurfaceDisposition =
  | "current_edge_repair"
  | "upstream_reentry"
  | "downstream_deferred"
  | "external_blocked";

export interface GtlProgramRuntimeReentryRouteRow {
  readonly routeRef: string;
  readonly repairSurfaceDisposition: GtlProgramRepairSurfaceDisposition;
  readonly selectedActionKind: "reenter_graph_span";
  readonly graphReentryPoint: GraphReentryPoint;
  readonly repairGraphFunctionRef: string;
  readonly repairGraphVectorRef: string;
  readonly repairGraphFunctionId: string;
  readonly repairGraphId: string;
  readonly repairGraphVectorId: string;
  readonly reentryTargetVectorIndex: number;
  readonly repairAssetRef: string;
  readonly targetOutcomeRef: string;
  readonly observationBindingRef: string;
  readonly lawfulBasisRefs: readonly string[];
  readonly evidenceRefs?: readonly string[] | undefined;
}

export const GTL_PROGRAM_T153_FEATURE_KINDS = Object.freeze([
  "graph_structure_interface",
  "graph_algebra_edge",
  "graph_algebra_compose",
  "graph_algebra_substitute",
  "graph_algebra_recurse",
  "graph_algebra_fan_out",
  "graph_algebra_fan_in",
  "graph_algebra_gate",
  "graph_algebra_promote",
  "graph_algebra_identity",
  "graph_algebra_same_object",
  "operator_declarations",
  "evaluator_declarations",
  "rule_declarations",
  "f_star_compute_composition",
  "hook_boundaries",
  "target_carrier_contract_law",
  "edge_closure_contract_law",
  "prompt_typed_asset_law",
  "selection_refinement_synthesis_subwork",
  "module_publication",
  "public_start_binding",
  "job_binding",
  "role_binding",
  "external_tool_gates",
  "active_source_identity"
] as const);

export type GtlProgramT153FeatureKind =
  (typeof GTL_PROGRAM_T153_FEATURE_KINDS)[number];

export type GtlProgramFeatureDisposition = "present" | "not_used";

export type GtlProgramFeatureOwnerClassification =
  | "gtl_declared"
  | "abg_admitted"
  | "abg_interpreted"
  | "downstream_product_meaning";

export interface GtlProgramFeatureCoverageRow {
  readonly featureKind: GtlProgramT153FeatureKind;
  readonly disposition: GtlProgramFeatureDisposition;
  readonly ownerClassification: GtlProgramFeatureOwnerClassification;
  readonly requirementRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly reasonRefs: readonly string[];
}

export interface GtlProgramFeatureCoverageManifest {
  readonly kind: "gtl_program_feature_coverage_manifest";
  readonly manifestRef: string;
  readonly t153RequirementRef: "REQ-L-GTL3-CONTRACT-LAW-API";
  readonly rows: readonly GtlProgramFeatureCoverageRow[];
}

export interface GtlProgramCoverageCounts {
  readonly catalogGraphFunctionCount: number;
  readonly publishedGraphFunctionCount: number;
  readonly graphVectorCount: number;
  readonly targetCarrierContractCount: number;
  readonly edgeClosureContractCount: number;
  readonly overlayCount: number;
  readonly publicStartTargetCount: number;
  readonly promptAssetCount: number;
  readonly pluginContractCount: number;
  readonly sourceIdentitySurfaceCount: number;
}

export type GtlProgramExpectedCoverage = GtlProgramCoverageCounts;

export interface GtlProgramConformanceInput {
  readonly subjectRef: string;
  readonly abiPackageVersion: string;
  readonly expectedCoverage: GtlProgramExpectedCoverage;
  readonly featureCoverageManifest: GtlProgramFeatureCoverageManifest;
  readonly catalogGraphFunctionRefs?: readonly string[] | undefined;
  readonly graphFunctions?: readonly GraphFunction[] | undefined;
  readonly modules?: readonly Module[] | undefined;
  readonly targetCarrierContracts?:
    | readonly GtlProgramTargetCarrierRow[]
    | undefined;
  readonly edgeClosureContracts?:
    | readonly GtlProgramEdgeClosureRow[]
    | undefined;
  readonly overlays?: readonly GtlProgramOverlayRow[] | undefined;
  readonly publicStartTargets?: readonly GtlProgramPublicStartRow[] | undefined;
  readonly promptAssets?: readonly GtlProgramPromptAssetRow[] | undefined;
  readonly pluginContracts?: readonly unknown[] | undefined;
  readonly sourceIdentitySurfaces?:
    | readonly GtlProgramSourceIdentityRow[]
    | undefined;
  readonly sameObjectProofs?: readonly GtlProgramSameObjectRow[] | undefined;
  readonly operatorDeclarations?:
    | readonly GtlProgramOperatorDeclarationRow[]
    | undefined;
  readonly evaluatorDeclarations?:
    | readonly GtlProgramEvaluatorDeclarationRow[]
    | undefined;
  readonly ruleDeclarations?:
    | readonly GtlProgramRuleDeclarationRow[]
    | undefined;
  readonly computeCompositions?:
    | readonly GtlProgramComputeCompositionRow[]
    | undefined;
  readonly computeStageBindings?:
    | readonly GtlProgramComputeStageBindingRow[]
    | undefined;
  readonly hookBoundaries?: readonly GtlProgramHookBoundaryRow[] | undefined;
  readonly selectionBoundaries?:
    | readonly GtlProgramSelectionBoundaryRow[]
    | undefined;
  readonly jobBindings?: readonly GtlProgramJobBindingRow[] | undefined;
  readonly roleBindings?: readonly GtlProgramRoleBindingRow[] | undefined;
  readonly externalToolGates?:
    | readonly GtlProgramExternalToolGateRow[]
    | undefined;
  readonly runtimeBindings?: readonly GtlProgramRuntimeBindingRow[] | undefined;
  readonly runtimeReentryRoutes?:
    | readonly GtlProgramRuntimeReentryRouteRow[]
    | undefined;
}

export type GtlProgramConformanceCoverage = GtlProgramCoverageCounts;

export interface GtlProgramInventoryDigests {
  readonly featureCoverageManifest: string;
  readonly catalogGraphFunctionRefs: string;
  readonly graphFunctions: string;
  readonly modules: string;
  readonly materializedVectors: string;
  readonly targetCarrierContracts: string;
  readonly edgeClosureContracts: string;
  readonly overlays: string;
  readonly publicStartTargets: string;
  readonly promptAssets: string;
  readonly pluginContracts: string;
  readonly sourceIdentitySurfaces: string;
  readonly sameObjectProofs: string;
  readonly operatorDeclarations: string;
  readonly evaluatorDeclarations: string;
  readonly ruleDeclarations: string;
  readonly computeCompositions: string;
  readonly computeStageBindings: string;
  readonly hookBoundaries: string;
  readonly selectionBoundaries: string;
  readonly jobBindings: string;
  readonly roleBindings: string;
  readonly externalToolGates: string;
  readonly runtimeBindings: string;
  readonly runtimeReentryRoutes: string;
}

export interface GtlProgramConformanceReport {
  readonly kind: "gtl_program_conformance_report";
  readonly reportRef: string;
  readonly subjectRef: string;
  readonly abiPackageVersion: string;
  readonly inventoryDigest: string;
  readonly inventoryDigests: GtlProgramInventoryDigests;
  readonly passed: boolean;
  readonly issueCount: number;
  readonly issues: readonly GtlProgramConformanceIssue[];
  readonly coverage: GtlProgramConformanceCoverage;
  readonly featureCoverageManifest: GtlProgramFeatureCoverageManifest;
}

export interface GtlProgramConformanceInputAdmission {
  readonly kind: "gtl_program_conformance_input_admission";
  readonly input: GtlProgramConformanceInput;
  readonly issues: readonly GtlProgramConformanceIssue[];
}

interface GraphVectorProjection {
  readonly graphFunctionId: string;
  readonly graphFunctionRef: string;
  readonly graphId: string;
  readonly graphRef: string;
  readonly graphVectorId: string;
  readonly vectorRef: string;
  readonly sourceAssetTypes: readonly string[];
  readonly sourceNodeContracts: readonly string[];
  readonly targetAssetType: string;
  readonly targetSchemaRef: string;
  readonly targetNodeContract: string;
  readonly operatorCount: number;
  readonly evaluatorCount: number;
  readonly hasRule: boolean;
  readonly allowsSubwork: boolean;
  readonly declarationKeyRefs: readonly string[];
}

function freezeStrings(values: readonly string[] | undefined): readonly string[] {
  return Object.freeze([...(values ?? [])]);
}

function issue(input: {
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly message: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}): GtlProgramConformanceIssue {
  return Object.freeze({
    kind: "gtl_program_conformance_issue",
    severity: "error",
    surfaceKind: input.surfaceKind,
    surfaceRef: input.surfaceRef,
    ruleRef: input.ruleRef,
    message: input.message,
    evidenceRefs: freezeStrings(input.evidenceRefs)
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "validation failed";
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

const GTL_PROGRAM_T153_FEATURE_KIND_SET = new Set<string>(
  GTL_PROGRAM_T153_FEATURE_KINDS
);

const GTL_PROGRAM_FEATURE_DISPOSITION_VALUES = new Set<string>([
  "present",
  "not_used"
]);

const GTL_PROGRAM_FEATURE_OWNER_VALUES = new Set<string>([
  "gtl_declared",
  "abg_admitted",
  "abg_interpreted",
  "downstream_product_meaning"
]);

const GTL_PROGRAM_REGIME_VALUES = new Set<string>(["F_D", "F_P", "F_H"]);

const GTL_PROGRAM_STAGE_REGIME_DISPOSITION_VALUES = new Set<string>([
  "participates",
  "not_used",
  "external_callout"
]);

const GTL_PROGRAM_COMPUTE_STAGE_ROLE_SET = new Set<string>(
  ENGINE_COMPUTE_STAGE_ROLE_VALUES
);

const GTL_PROGRAM_COMPUTE_STAGE_PURPOSE_SET = new Set<string>(
  ENGINE_COMPUTE_STAGE_PURPOSE_VALUES
);

const GTL_PROGRAM_RUNTIME_BINDING_KIND_VALUES = new Set<string>([
  "abg_cli_runtime_binding",
  "abg_public_callable_start",
  "abg_public_control_loop"
]);

const GTL_PROGRAM_REPAIR_SURFACE_DISPOSITION_VALUES = new Set<string>([
  "current_edge_repair",
  "upstream_reentry",
  "downstream_deferred",
  "external_blocked"
]);

const GTL_PROGRAM_GRAPH_REENTRY_POINT_VALUES = new Set<string>(
  GRAPH_REENTRY_POINT_VALUES
);

const GTL_PROGRAM_HOST_SURFACE_KIND_VALUES =
  new Set<string>([
    "graph_function",
    "graph_vector",
    "operator",
    "evaluator",
    "rule",
    "job",
    "role",
    "module",
    "candidate_family",
    "refinement_boundary",
    "visible_defaults",
    "external_tool"
  ]);

const GTL_PROGRAM_COMPOSITION_DECLARATION_SOURCE_KIND_VALUES =
  new Set<string>([
    "graph_vector_declaration",
    "graph_function_declaration",
    "operator_declaration",
    "evaluator_declaration",
    "rule_declaration",
    "job_policy_hook",
    "role_policy_hook",
    "module_policy_hook",
    "visible_defaults",
    "published_template"
  ]);

const GTL_PROGRAM_HOOK_DECLARATION_SOURCE_KIND_VALUES =
  new Set<string>([
    "graph_vector_declaration",
    "graph_function_declaration",
    "job_policy_hook",
    "role_policy_hook",
    "module_policy_hook",
    "candidate_family_policy_hint",
    "visible_defaults"
  ]);

const GTL_PROGRAM_SELECTION_BOUNDARY_KIND_VALUES =
  new Set<string>([
    "refinement_boundary",
    "candidate_family",
    "subwork",
    "synthesis"
  ]);

function isGtlProgramT153FeatureKind(
  value: unknown
): value is GtlProgramT153FeatureKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_T153_FEATURE_KIND_SET.has(value)
  );
}

function isGtlProgramFeatureDisposition(
  value: unknown
): value is GtlProgramFeatureDisposition {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_FEATURE_DISPOSITION_VALUES.has(value)
  );
}

function isGtlProgramFeatureOwnerClassification(
  value: unknown
): value is GtlProgramFeatureOwnerClassification {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_FEATURE_OWNER_VALUES.has(value)
  );
}

function isRegime(value: unknown): value is Regime {
  return typeof value === "string" && GTL_PROGRAM_REGIME_VALUES.has(value);
}

function isGtlProgramStageRegimeDisposition(
  value: unknown
): value is GtlProgramStageRegimeDisposition {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_STAGE_REGIME_DISPOSITION_VALUES.has(value)
  );
}

function isEngineComputeStageRole(value: unknown): value is EngineComputeStageRole {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_COMPUTE_STAGE_ROLE_SET.has(value)
  );
}

function isEngineComputeStagePurpose(
  value: unknown
): value is EngineComputeStagePurpose {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_COMPUTE_STAGE_PURPOSE_SET.has(value)
  );
}

function isGtlProgramRuntimeBindingKind(
  value: unknown
): value is GtlProgramRuntimeBindingKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_RUNTIME_BINDING_KIND_VALUES.has(value)
  );
}

function isGtlProgramRepairSurfaceDisposition(
  value: unknown
): value is GtlProgramRepairSurfaceDisposition {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_REPAIR_SURFACE_DISPOSITION_VALUES.has(value)
  );
}

function isGraphReentryPoint(value: unknown): value is GraphReentryPoint {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_GRAPH_REENTRY_POINT_VALUES.has(value)
  );
}

function isGtlProgramHostSurfaceKind(
  value: unknown
): value is GtlProgramHostSurfaceKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_HOST_SURFACE_KIND_VALUES.has(value)
  );
}

function isGtlProgramCompositionDeclarationSourceKind(
  value: unknown
): value is GtlProgramCompositionDeclarationSourceKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_COMPOSITION_DECLARATION_SOURCE_KIND_VALUES.has(value)
  );
}

function isGtlProgramHookDeclarationSourceKind(
  value: unknown
): value is GtlProgramHookDeclarationSourceKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_HOOK_DECLARATION_SOURCE_KIND_VALUES.has(value)
  );
}

function isGtlProgramSelectionBoundaryKind(
  value: unknown
): value is GtlProgramSelectionBoundaryKind {
  return (
    typeof value === "string" &&
    GTL_PROGRAM_SELECTION_BOUNDARY_KIND_VALUES.has(value)
  );
}

const T153_FEATURE_DEFAULT_REQUIREMENT_REFS:
  Readonly<Record<GtlProgramT153FeatureKind, readonly string[]>> =
  Object.freeze({
    graph_structure_interface: Object.freeze([
      "REQ-L-GTL3-GRAPH",
      "REQ-L-GTL3-GRAPHVECTOR",
      "REQ-L-GTL3-GRAPHFUNCTION"
    ]),
    graph_algebra_edge: Object.freeze(["REQ-L-GTL3-LAWS"]),
    graph_algebra_compose: Object.freeze(["REQ-L-GTL3-COMPOSE"]),
    graph_algebra_substitute: Object.freeze(["REQ-L-GTL3-SUBSTITUTE"]),
    graph_algebra_recurse: Object.freeze(["REQ-L-GTL3-RECURSE"]),
    graph_algebra_fan_out: Object.freeze(["REQ-L-GTL3-HOF"]),
    graph_algebra_fan_in: Object.freeze(["REQ-L-GTL3-HOF"]),
    graph_algebra_gate: Object.freeze(["REQ-L-GTL3-HOF"]),
    graph_algebra_promote: Object.freeze(["REQ-L-GTL3-HOF"]),
    graph_algebra_identity: Object.freeze(["REQ-L-GTL3-LAWS"]),
    graph_algebra_same_object: Object.freeze(["REQ-L-GTL3-LAWS"]),
    operator_declarations: Object.freeze(["REQ-L-GTL3-OPERATOR"]),
    evaluator_declarations: Object.freeze(["REQ-L-GTL3-EVALUATOR"]),
    rule_declarations: Object.freeze(["REQ-L-GTL3-RULE"]),
    f_star_compute_composition: Object.freeze([
      "REQ-L-GTL3-COMPUTE-NOTATION",
      "REQ-R-ABG3-FN-COMPOSITION"
    ]),
    hook_boundaries: Object.freeze(["REQ-L-GTL3-HOOKS"]),
    target_carrier_contract_law: Object.freeze([
      "REQ-L-GTL3-GRAPHVECTOR",
      "REQ-L-GTL3-CONTRACT-LAW-API"
    ]),
    edge_closure_contract_law: Object.freeze([
      "REQ-R-ABG3-ASSURANCE",
      "REQ-R-ABG3-INTERPRET"
    ]),
    prompt_typed_asset_law: Object.freeze(["REQ-L-GTL3-ASSET-SURFACE"]),
    selection_refinement_synthesis_subwork: Object.freeze([
      "REQ-L-GTL3-SELECTION-BOUNDARY",
      "REQ-L-GTL3-SYNTHESIS",
      "REQ-L-GTL3-SUBWORK"
    ]),
    module_publication: Object.freeze(["REQ-L-GTL3-MODULE"]),
    public_start_binding: Object.freeze([
      "REQ-L-GTL3-JOB",
      "REQ-R-ABG3-RUN"
    ]),
    job_binding: Object.freeze(["REQ-L-GTL3-JOB"]),
    role_binding: Object.freeze(["REQ-L-GTL3-ROLE"]),
    external_tool_gates: Object.freeze([
      "REQ-L-GTL3-HOOKS",
      "REQ-R-ABG3-TRANSPORT"
    ]),
    active_source_identity: Object.freeze(["REQ-L-GTL3-IDENTITY"])
  });

export const GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS:
  Readonly<Record<GtlProgramT153FeatureKind, GtlProgramFeatureOwnerClassification>> =
  Object.freeze({
    graph_structure_interface: "gtl_declared",
    graph_algebra_edge: "gtl_declared",
    graph_algebra_compose: "gtl_declared",
    graph_algebra_substitute: "gtl_declared",
    graph_algebra_recurse: "gtl_declared",
    graph_algebra_fan_out: "gtl_declared",
    graph_algebra_fan_in: "gtl_declared",
    graph_algebra_gate: "gtl_declared",
    graph_algebra_promote: "gtl_declared",
    graph_algebra_identity: "gtl_declared",
    graph_algebra_same_object: "gtl_declared",
    operator_declarations: "gtl_declared",
    evaluator_declarations: "gtl_declared",
    rule_declarations: "gtl_declared",
    f_star_compute_composition: "gtl_declared",
    hook_boundaries: "gtl_declared",
    target_carrier_contract_law: "gtl_declared",
    edge_closure_contract_law: "abg_admitted",
    prompt_typed_asset_law: "gtl_declared",
    selection_refinement_synthesis_subwork: "gtl_declared",
    module_publication: "gtl_declared",
    public_start_binding: "gtl_declared",
    job_binding: "gtl_declared",
    role_binding: "gtl_declared",
    external_tool_gates: "abg_admitted",
    active_source_identity: "abg_admitted"
  });

function isRecord(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function unknownArray(input: unknown): readonly unknown[] | null {
  if (!Array.isArray(input)) {
    return null;
  }
  const values: unknown[] = [];
  for (const value of input) {
    values.push(value);
  }
  return Object.freeze(values);
}

function optionalUnknownArray(
  record: Readonly<Record<string, unknown>>,
  key: string
): readonly unknown[] | null | undefined {
  if (!Object.hasOwn(record, key)) {
    return undefined;
  }
  return unknownArray(record[key]);
}

function stringArrayFromUnknown(input: unknown): readonly string[] | null {
  if (!Array.isArray(input)) {
    return null;
  }
  const values: string[] = [];
  for (const value of input) {
    if (typeof value !== "string") {
      return null;
    }
    values.push(value);
  }
  return Object.freeze(values);
}

function optionalStringArrayField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly string[] {
  if (!Object.hasOwn(input.record, input.key)) {
    return Object.freeze([]);
  }
  const values = stringArrayFromUnknown(input.record[input.key]);
  if (values === null) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/string-array",
        message: `${input.label}.${input.key} must be an array of strings`
      })
    );
    return Object.freeze([]);
  }
  return values;
}

function requiredStringArrayField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly string[] {
  if (!Object.hasOwn(input.record, input.key)) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/string-array",
        message: `${input.label}.${input.key} is required and must be an array of strings`
      })
    );
    return Object.freeze([]);
  }
  const values = stringArrayFromUnknown(input.record[input.key]);
  if (values === null) {
    input.issues.push(
      issue({
        surfaceKind: input.surfaceKind,
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/string-array",
        message: `${input.label}.${input.key} must be an array of strings`
      })
    );
    return Object.freeze([]);
  }
  return values;
}

function requiredStringField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): string {
  const value = input.record[input.key];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/string-field",
      message: `${input.label}.${input.key} must be a non-empty string`
    })
  );
  return "";
}

function requiredNonNegativeIntegerField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): number {
  const value = input.record[input.key];
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/non-negative-integer-field",
      message: `${input.label}.${input.key} must be a non-negative integer`
    })
  );
  return 0;
}

function requiredBooleanField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly expected: true;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): true;
function requiredBooleanField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly expected: false;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): false;
function requiredBooleanField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly expected: boolean;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): boolean {
  const value = input.record[input.key];
  if (value === input.expected) {
    return input.expected;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/boolean-field",
      message: `${input.label}.${input.key} must be ${String(input.expected)}`
    })
  );
  return input.expected;
}

function requiredRegimeField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): Regime {
  const value = input.record[input.key];
  if (isRegime(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/regime-field",
      message: `${input.label}.${input.key} must be F_D, F_P, or F_H`
    })
  );
  return "F_D";
}

function requiredStageRegimeDispositionField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramStageRegimeDisposition {
  const value = input.record[input.key];
  if (isGtlProgramStageRegimeDisposition(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/stage-regime-disposition-field",
      message: `${input.label}.${input.key} must be participates, not_used, or external_callout`
    })
  );
  return "not_used";
}

function requiredComputeStageRoleField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): EngineComputeStageRole {
  const value = input.record[input.key];
  if (isEngineComputeStageRole(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/compute-stage-role-field",
      message: `${input.label}.${input.key} must name an ABG compute stage role`
    })
  );
  return "transform";
}

function requiredComputeStagePurposeField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): EngineComputeStagePurpose {
  const value = input.record[input.key];
  if (isEngineComputeStagePurpose(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/compute-stage-purpose-field",
      message: `${input.label}.${input.key} must name an ABG compute stage purpose`
    })
  );
  return "candidate_construction";
}

function requiredRuntimeBindingKindField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramRuntimeBindingKind {
  const value = input.record[input.key];
  if (isGtlProgramRuntimeBindingKind(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/runtime-binding-kind-field",
      message: `${input.label}.${input.key} must name an ABG public runtime binding kind`
    })
  );
  return "abg_cli_runtime_binding";
}

function requiredRepairSurfaceDispositionField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramRepairSurfaceDisposition {
  const value = input.record[input.key];
  if (isGtlProgramRepairSurfaceDisposition(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/repair-surface-disposition-field",
      message: `${input.label}.${input.key} must classify current_edge_repair, upstream_reentry, downstream_deferred, or external_blocked`
    })
  );
  return "external_blocked";
}

function requiredGraphReentryPointField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GraphReentryPoint {
  const value = input.record[input.key];
  if (isGraphReentryPoint(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/graph-reentry-point-field",
      message: `${input.label}.${input.key} must name an ABG GraphReentryPoint`
    })
  );
  return "realization";
}

function requiredHostSurfaceKindField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramHostSurfaceKind {
  const value = input.record[input.key];
  if (isGtlProgramHostSurfaceKind(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/host-kind-field",
      message: `${input.label}.${input.key} must name a GTL/ABG host surface kind`
    })
  );
  return "module";
}

function requiredCompositionDeclarationSourceKindField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramCompositionDeclarationSourceKind {
  const value = input.record[input.key];
  if (isGtlProgramCompositionDeclarationSourceKind(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/composition-source-kind-field",
      message: `${input.label}.${input.key} must name a composition declaration source kind`
    })
  );
  return "visible_defaults";
}

function requiredHookDeclarationSourceKindField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramHookDeclarationSourceKind {
  const value = input.record[input.key];
  if (isGtlProgramHookDeclarationSourceKind(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/hook-source-kind-field",
      message: `${input.label}.${input.key} must name a hook declaration source kind`
    })
  );
  return "visible_defaults";
}

function requiredSelectionBoundaryKindField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly label: string;
  readonly subjectRef: string;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramSelectionBoundaryKind {
  const value = input.record[input.key];
  if (isGtlProgramSelectionBoundaryKind(value)) {
    return value;
  }
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/input/selection-boundary-kind-field",
      message: `${input.label}.${input.key} must name a selection/refinement/synthesis/subwork boundary kind`
    })
  );
  return "refinement_boundary";
}

function checkOptionalArrayField(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly key: string;
  readonly subjectRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): readonly unknown[] {
  const value = optionalUnknownArray(input.record, input.key);
  if (value === undefined) {
    return Object.freeze([]);
  }
  if (value === null) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/input/array-field",
        message: `${input.key} must be an array when supplied`
      })
    );
    return Object.freeze([]);
  }
  return value;
}

function isGraphFunctionLike(input: unknown): input is GraphFunction {
  return (
    isRecord(input) &&
    typeof input["name"] === "string" &&
    Array.isArray(input["inputs"]) &&
    Array.isArray(input["outputs"]) &&
    isRecord(input["environment"]) &&
    isRecord(input["template"])
  );
}

function plausibleGraphFunction(
  input: unknown,
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): GraphFunction | null {
  if (!isGraphFunctionLike(input)) {
    issues.push(
      issue({
        surfaceKind: "graph_function",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/input/graph-function",
        message: `${label} must be a GraphFunction-like object with a name`
      })
    );
    return null;
  }
  return input;
}

function isModuleLike(input: unknown): input is Module {
  return (
    isRecord(input) &&
    typeof input["name"] === "string" &&
    Array.isArray(input["graphs"]) &&
    Array.isArray(input["graphFunctions"]) &&
    Array.isArray(input["refinementBoundaries"]) &&
    Array.isArray(input["candidateFamilies"]) &&
    Array.isArray(input["jobs"]) &&
    Array.isArray(input["roles"]) &&
    Array.isArray(input["operators"]) &&
    Array.isArray(input["evaluators"]) &&
    Array.isArray(input["rules"])
  );
}

function plausibleModule(
  input: unknown,
  subjectRef: string,
  issues: GtlProgramConformanceIssue[],
  label: string
): Module | null {
  if (!isModuleLike(input)) {
    issues.push(
      issue({
        surfaceKind: "module",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/input/module",
        message: `${label} must be a Module-like object with graphFunctions`
      })
    );
    return null;
  }
  return input;
}

function isAssetSurfaceLike(input: unknown): input is AssetSurface {
  return isRecord(input) && typeof input["kind"] === "string";
}

function isNodeLike(input: unknown): input is Node {
  return (
    isRecord(input) &&
    typeof input["name"] === "string" &&
    isRecord(input["schema"]) &&
    Array.isArray(input["markov"])
  );
}

function admitExpectedCoverage(
  input: unknown,
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): GtlProgramExpectedCoverage {
  const admitted: Record<CoverageKey, number> = {
    catalogGraphFunctionCount: 0,
    publishedGraphFunctionCount: 0,
    graphVectorCount: 0,
    targetCarrierContractCount: 0,
    edgeClosureContractCount: 0,
    overlayCount: 0,
    publicStartTargetCount: 0,
    promptAssetCount: 0,
    pluginContractCount: 0,
    sourceIdentitySurfaceCount: 0
  };
  if (!isRecord(input)) {
    issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/coverage/expected-coverage-required",
        message: "GTL program typecheck requires expectedCoverage with every coverage key"
      })
    );
    return Object.freeze(admitted);
  }
  for (const key of COVERAGE_KEYS) {
    if (!Object.hasOwn(input, key)) {
      issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-required",
          message: `expectedCoverage.${key} is required`
        })
      );
      continue;
    }
    const value = input[key];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
      issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-admitted",
          message: `expectedCoverage.${key} must be a non-negative integer`
        })
      );
      continue;
    }
    admitted[key] = value;
  }
  return Object.freeze(admitted);
}

function emptyFeatureCoverageManifest(
  manifestRef: string
): GtlProgramFeatureCoverageManifest {
  return Object.freeze({
    kind: "gtl_program_feature_coverage_manifest" as const,
    manifestRef,
    t153RequirementRef: "REQ-L-GTL3-CONTRACT-LAW-API" as const,
    rows: Object.freeze([])
  });
}

function admitFeatureKind(input: {
  readonly value: unknown;
  readonly label: string;
  readonly subjectRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramT153FeatureKind | null {
  if (isGtlProgramT153FeatureKind(input.value)) {
    return input.value;
  }
  input.issues.push(
    issue({
      surfaceKind: "feature_coverage",
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/feature-coverage/feature-kind",
      message: `${input.label}.featureKind must name a T-153 feature kind`
    })
  );
  return null;
}

function admitFeatureDisposition(input: {
  readonly value: unknown;
  readonly label: string;
  readonly subjectRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramFeatureDisposition | null {
  if (isGtlProgramFeatureDisposition(input.value)) {
    return input.value;
  }
  input.issues.push(
    issue({
      surfaceKind: "feature_coverage",
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/feature-coverage/disposition",
      message: `${input.label}.disposition must be present or not_used`
    })
  );
  return null;
}

function admitFeatureOwner(input: {
  readonly value: unknown;
  readonly label: string;
  readonly subjectRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): GtlProgramFeatureOwnerClassification | null {
  if (isGtlProgramFeatureOwnerClassification(input.value)) {
    return input.value;
  }
  input.issues.push(
    issue({
      surfaceKind: "feature_coverage",
      surfaceRef: input.subjectRef,
      ruleRef: "abg://gtl-program/feature-coverage/owner-classification",
      message: `${input.label}.ownerClassification must classify GTL, ABG, or downstream ownership`
    })
  );
  return null;
}

function admitFeatureCoverageRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramFeatureCoverageRow[] {
  return Object.freeze(
    input.flatMap((entry, index) => {
      const label = `featureCoverageManifest.rows[${index}]`;
      if (!isRecord(entry)) {
        issues.push(
          issue({
            surfaceKind: "feature_coverage",
            surfaceRef: subjectRef,
            ruleRef: "abg://gtl-program/feature-coverage/row",
            message: `${label} must be an object`
          })
        );
        return [];
      }
      const featureKind = admitFeatureKind({
        value: entry["featureKind"],
        label,
        subjectRef,
        issues
      });
      const disposition = admitFeatureDisposition({
        value: entry["disposition"],
        label,
        subjectRef,
        issues
      });
      const ownerClassification = admitFeatureOwner({
        value: entry["ownerClassification"],
        label,
        subjectRef,
        issues
      });
      if (
        featureKind === null ||
        disposition === null ||
        ownerClassification === null
      ) {
        return [];
      }
      const expectedOwner =
        GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS[featureKind];
      if (ownerClassification !== expectedOwner) {
        issues.push(
          issue({
            surfaceKind: "feature_coverage",
            surfaceRef: featureKind,
            ruleRef: "abg://gtl-program/feature-coverage/owner-classification-truth",
            message: `${featureKind} ownerClassification must be ${expectedOwner}, received ${ownerClassification}`
          })
        );
      }
      const requirementRefs = requiredStringArrayField({
        record: entry,
        key: "requirementRefs",
        label,
        subjectRef,
        surfaceKind: "feature_coverage",
        issues
      });
      const evidenceRefs = requiredStringArrayField({
        record: entry,
        key: "evidenceRefs",
        label,
        subjectRef,
        surfaceKind: "feature_coverage",
        issues
      });
      const reasonRefs = optionalStringArrayField({
        record: entry,
        key: "reasonRefs",
        label,
        subjectRef,
        surfaceKind: "feature_coverage",
        issues
      });
      return [
        Object.freeze({
          featureKind,
          disposition,
          ownerClassification,
          requirementRefs,
          evidenceRefs,
          reasonRefs
        })
      ];
    })
  );
}

function admitFeatureCoverageManifest(
  input: unknown,
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): GtlProgramFeatureCoverageManifest {
  if (!isRecord(input)) {
    issues.push(
      issue({
        surfaceKind: "feature_coverage",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/feature-coverage/manifest-required",
        message: "GTL program typecheck requires featureCoverageManifest for every T-153 capability family"
      })
    );
    return emptyFeatureCoverageManifest("missing");
  }
  if (input["kind"] !== "gtl_program_feature_coverage_manifest") {
    issues.push(
      issue({
        surfaceKind: "feature_coverage",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/feature-coverage/kind",
        message: "featureCoverageManifest.kind must be gtl_program_feature_coverage_manifest"
      })
    );
  }
  if (input["t153RequirementRef"] !== "REQ-L-GTL3-CONTRACT-LAW-API") {
    issues.push(
      issue({
        surfaceKind: "feature_coverage",
        surfaceRef: subjectRef,
        ruleRef: "abg://gtl-program/feature-coverage/t153-requirement",
        message: "featureCoverageManifest.t153RequirementRef must be REQ-L-GTL3-CONTRACT-LAW-API"
      })
    );
  }
  const manifestRef = requiredStringField({
    record: input,
    key: "manifestRef",
    label: "featureCoverageManifest",
    subjectRef,
    surfaceKind: "feature_coverage",
    issues
  }) || "missing";
  const rowInputs = checkOptionalArrayField({
    record: input,
    key: "rows",
    subjectRef,
    issues
  });
  return Object.freeze({
    kind: "gtl_program_feature_coverage_manifest" as const,
    manifestRef,
    t153RequirementRef: "REQ-L-GTL3-CONTRACT-LAW-API" as const,
    rows: admitFeatureCoverageRows(rowInputs, subjectRef, issues)
  });
}

function admitTargetCarrierRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramTargetCarrierRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `targetCarrierContracts[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "target_carrier_contract",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/target-carrier-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          edgeRef: requiredStringField({
            record: row,
            key: "edgeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphVectorRef: requiredStringField({
            record: row,
            key: "graphVectorRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphFunctionId: requiredStringField({
            record: row,
            key: "graphFunctionId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphId: requiredStringField({
            record: row,
            key: "graphId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          graphVectorId: requiredStringField({
            record: row,
            key: "graphVectorId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          targetAssetType: requiredStringField({
            record: row,
            key: "targetAssetType",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          targetCarrierContractRef: requiredStringField({
            record: row,
            key: "targetCarrierContractRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          targetCarrierContractDigest: requiredStringField({
            record: row,
            key: "targetCarrierContractDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          targetCarrierTemplateRef: requiredStringField({
            record: row,
            key: "targetCarrierTemplateRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          outputSurfaceRef: requiredStringField({
            record: row,
            key: "outputSurfaceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          outputCarrierFamilyRef: requiredStringField({
            record: row,
            key: "outputCarrierFamilyRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          outputCarrierKind: requiredStringField({
            record: row,
            key: "outputCarrierKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          envelopeContractRef: requiredStringField({
            record: row,
            key: "envelopeContractRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          nestedPayloadPath: requiredStringField({
            record: row,
            key: "nestedPayloadPath",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          requiredFieldRefs: requiredStringArrayField({
            record: row,
            key: "requiredFieldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          optionalFieldRefs: requiredStringArrayField({
            record: row,
            key: "optionalFieldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          fixedProtocolFieldRefs: requiredStringArrayField({
            record: row,
            key: "fixedProtocolFieldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          workerFillableFieldRefs: requiredStringArrayField({
            record: row,
            key: "workerFillableFieldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          literalDomainRefs: requiredStringArrayField({
            record: row,
            key: "literalDomainRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          enumDomainRefs: requiredStringArrayField({
            record: row,
            key: "enumDomainRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          schemaRef: requiredStringField({
            record: row,
            key: "schemaRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          admissionRef: requiredStringField({
            record: row,
            key: "admissionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          payloadLedgerBindingRef: requiredStringField({
            record: row,
            key: "payloadLedgerBindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          edgeAssuranceBindingRef: requiredStringField({
            record: row,
            key: "edgeAssuranceBindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          handoffProjectionRef: requiredStringField({
            record: row,
            key: "handoffProjectionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          constructionTemplateRef: requiredStringField({
            record: row,
            key: "constructionTemplateRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          replayDigestPolicyRef: requiredStringField({
            record: row,
            key: "replayDigestPolicyRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          materializationPolicyRef: requiredStringField({
            record: row,
            key: "materializationPolicyRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          }),
          closurePreconditionRef: requiredStringField({
            record: row,
            key: "closurePreconditionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "target_carrier_contract",
            issues
          })
        })
      ];
    })
  );
}

function admitEdgeClosureRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramEdgeClosureRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `edgeClosureContracts[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "edge_closure_contract",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/edge-closure-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          edgeRef: requiredStringField({
            record: row,
            key: "edgeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          graphFunctionId: requiredStringField({
            record: row,
            key: "graphFunctionId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          graphId: requiredStringField({
            record: row,
            key: "graphId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          graphVectorId: requiredStringField({
            record: row,
            key: "graphVectorId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          }),
          targetAssetType: requiredStringField({
            record: row,
            key: "targetAssetType",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "edge_closure_contract",
            issues
          })
        })
      ];
    })
  );
}

function admitOverlayRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramOverlayRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `overlays[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/overlay-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          overlayRef: requiredStringField({
            record: row,
            key: "overlayRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          graphFunctionRefs: optionalStringArrayField({
            record: row,
            key: "graphFunctionRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          graphVectorRefs: optionalStringArrayField({
            record: row,
            key: "graphVectorRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          publicStartTargets: optionalStringArrayField({
            record: row,
            key: "publicStartTargets",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          }),
          defaultStartTarget: requiredStringField({
            record: row,
            key: "defaultStartTarget",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "overlay",
            issues
          })
        })
      ];
    })
  );
}

function admitPublicStartRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramPublicStartRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `publicStartTargets[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "public_start",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/public-start-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          name: requiredStringField({
            record: row,
            key: "name",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          }),
          graphFunctionRef: requiredStringField({
            record: row,
            key: "graphFunctionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          }),
          overlayRefs: optionalStringArrayField({
            record: row,
            key: "overlayRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          }),
          defaultForOverlayRefs: optionalStringArrayField({
            record: row,
            key: "defaultForOverlayRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "public_start",
            issues
          })
        })
      ];
    })
  );
}

function admitPromptAssetRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramPromptAssetRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `promptAssets[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      const gtlNode = row["gtlNode"];
      if (gtlNode !== undefined && !isNodeLike(gtlNode)) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-node",
            message: `${surfaceRef}.gtlNode must be a GTL Node object when supplied`
          })
        );
      }
      const assetSurface = row["assetSurface"];
      if (!isAssetSurfaceLike(assetSurface)) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-surface",
            message: `${surfaceRef}.assetSurface must be an AssetSurface object`
          })
        );
        return [];
      }
      const renderedViewDigest = row["renderedViewDigest"];
      if (
        renderedViewDigest !== undefined &&
        renderedViewDigest !== null &&
        typeof renderedViewDigest !== "string"
      ) {
        issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/prompt-asset-digest",
            message: `${surfaceRef}.renderedViewDigest must be null or a string`
          })
        );
      }
      return [
        Object.freeze({
          surfaceRef: requiredStringField({
            record: row,
            key: "surfaceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "prompt_asset",
            issues
          }),
          assetSurface,
          ...(isNodeLike(gtlNode) ? { gtlNode } : {}),
          ...(renderedViewDigest === null || typeof renderedViewDigest === "string"
            ? { renderedViewDigest }
            : {}),
          currentAbgFoldRefs: optionalStringArrayField({
            record: row,
            key: "currentAbgFoldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "prompt_asset",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "prompt_asset",
            issues
          })
        })
      ];
    })
  );
}

function admitSourceIdentityRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramSourceIdentityRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `sourceIdentitySurfaces[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "source_identity",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/source-identity-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          surfaceRef: requiredStringField({
            record: row,
            key: "surfaceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_identity",
            issues
          }),
          text: requiredStringField({
            record: row,
            key: "text",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_identity",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "source_identity",
            issues
          })
        })
      ];
    })
  );
}

function admitSameObjectRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramSameObjectRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `sameObjectProofs[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "same_object",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/same-object-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          proofRef: requiredStringField({
            record: row,
            key: "proofRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "same_object",
            issues
          }),
          leftRef: requiredStringField({
            record: row,
            key: "leftRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "same_object",
            issues
          }),
          rightRef: requiredStringField({
            record: row,
            key: "rightRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "same_object",
            issues
          }),
          equalityDigest: requiredStringField({
            record: row,
            key: "equalityDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "same_object",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "same_object",
            issues
          })
        })
      ];
    })
  );
}

function admitOperatorDeclarationRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramOperatorDeclarationRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `operatorDeclarations[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "operator_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/operator-declaration-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          operatorRef: requiredStringField({
            record: row,
            key: "operatorRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          name: requiredStringField({
            record: row,
            key: "name",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          regime: requiredRegimeField({
            record: row,
            key: "regime",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          binding: requiredStringField({
            record: row,
            key: "binding",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          hostKind: requiredHostSurfaceKindField({
            record: row,
            key: "hostKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          tagRefs: requiredStringArrayField({
            record: row,
            key: "tagRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "operator_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitEvaluatorDeclarationRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramEvaluatorDeclarationRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `evaluatorDeclarations[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "evaluator_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/evaluator-declaration-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          evaluatorRef: requiredStringField({
            record: row,
            key: "evaluatorRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          name: requiredStringField({
            record: row,
            key: "name",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          regime: requiredRegimeField({
            record: row,
            key: "regime",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          description: requiredStringField({
            record: row,
            key: "description",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          binding: requiredStringField({
            record: row,
            key: "binding",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          consumedFieldRefs: requiredStringArrayField({
            record: row,
            key: "consumedFieldRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          hostKind: requiredHostSurfaceKindField({
            record: row,
            key: "hostKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          tagRefs: requiredStringArrayField({
            record: row,
            key: "tagRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "evaluator_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitRuleDeclarationRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramRuleDeclarationRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `ruleDeclarations[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "rule_declaration",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/rule-declaration-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          ruleRef: requiredStringField({
            record: row,
            key: "ruleRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          name: requiredStringField({
            record: row,
            key: "name",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          ruleKind: requiredStringField({
            record: row,
            key: "ruleKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          configDigest: requiredStringField({
            record: row,
            key: "configDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          hostKind: requiredHostSurfaceKindField({
            record: row,
            key: "hostKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          tagRefs: requiredStringArrayField({
            record: row,
            key: "tagRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "rule_declaration",
            issues
          })
        })
      ];
    })
  );
}

function admitComputeCompositionRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramComputeCompositionRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `computeCompositions[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "compute_composition",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/compute-composition-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          compositionRef: requiredStringField({
            record: row,
            key: "compositionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          compositionDigest: requiredStringField({
            record: row,
            key: "compositionDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          hostKind: requiredHostSurfaceKindField({
            record: row,
            key: "hostKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          declarationSourceKind: requiredCompositionDeclarationSourceKindField({
            record: row,
            key: "declarationSourceKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          declarationSourceRef: requiredStringField({
            record: row,
            key: "declarationSourceRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          notationRefs: requiredStringArrayField({
            record: row,
            key: "notationRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          regimeBindingRefs: requiredStringArrayField({
            record: row,
            key: "regimeBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          stageBindingRefs: requiredStringArrayField({
            record: row,
            key: "stageBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          closureContractRef: requiredStringField({
            record: row,
            key: "closureContractRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_composition",
            issues
          })
        })
      ];
    })
  );
}

function admitStageRegimeDispositionRows(
  input: readonly unknown[],
  subjectRef: string,
  parentLabel: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramStageRegimeDispositionRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `${parentLabel}.regimeDispositions[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "compute_stage_binding",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/stage-regime-disposition-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          regime: requiredRegimeField({
            record: row,
            key: "regime",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          disposition: requiredStageRegimeDispositionField({
            record: row,
            key: "disposition",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          selectedRegimeBindingRefs: requiredStringArrayField({
            record: row,
            key: "selectedRegimeBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          reasonRefs: requiredStringArrayField({
            record: row,
            key: "reasonRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          evidenceRefs: requiredStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          })
        })
      ];
    })
  );
}

function admitComputeStageBindingRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramComputeStageBindingRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `computeStageBindings[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "compute_stage_binding",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/compute-stage-binding-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          stageBindingRef: requiredStringField({
            record: row,
            key: "stageBindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          compositionRef: requiredStringField({
            record: row,
            key: "compositionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          compositionDigest: requiredStringField({
            record: row,
            key: "compositionDigest",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          stageRole: requiredComputeStageRoleField({
            record: row,
            key: "stageRole",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          stageNotationRef: requiredStringField({
            record: row,
            key: "stageNotationRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          stagePurpose: requiredComputeStagePurposeField({
            record: row,
            key: "stagePurpose",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          computeMeans: requiredRegimeField({
            record: row,
            key: "computeMeans",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          inputCarrierRefs: requiredStringArrayField({
            record: row,
            key: "inputCarrierRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          outputCarrierRefs: requiredStringArrayField({
            record: row,
            key: "outputCarrierRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          predecessorStageBindingRefs: requiredStringArrayField({
            record: row,
            key: "predecessorStageBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          pluginContractRefs: requiredStringArrayField({
            record: row,
            key: "pluginContractRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          hookRefs: requiredStringArrayField({
            record: row,
            key: "hookRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          regimeDispositions: admitStageRegimeDispositionRows(
            checkOptionalArrayField({
              record: row,
              key: "regimeDispositions",
              subjectRef,
              issues
            }),
            subjectRef,
            surfaceRef,
            issues
          ),
          mayWriteLedgers: requiredBooleanField({
            record: row,
            key: "mayWriteLedgers",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          mayEmitRuntimeEvents: requiredBooleanField({
            record: row,
            key: "mayEmitRuntimeEvents",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          maySelectTraversal: requiredBooleanField({
            record: row,
            key: "maySelectTraversal",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          mayCloseTraversal: requiredBooleanField({
            record: row,
            key: "mayCloseTraversal",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          mayOwnIterationLoop: requiredBooleanField({
            record: row,
            key: "mayOwnIterationLoop",
            expected: false,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "compute_stage_binding",
            issues
          })
        })
      ];
    })
  );
}

function admitHookBoundaryRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramHookBoundaryRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `hookBoundaries[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "hook_boundary",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/hook-boundary-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          hookRef: requiredStringField({
            record: row,
            key: "hookRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          hookKey: requiredStringField({
            record: row,
            key: "hookKey",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          hostKind: requiredHostSurfaceKindField({
            record: row,
            key: "hostKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          declarationSourceKind: requiredHookDeclarationSourceKindField({
            record: row,
            key: "declarationSourceKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          declarationRef: requiredStringField({
            record: row,
            key: "declarationRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          precedenceRank: requiredNonNegativeIntegerField({
            record: row,
            key: "precedenceRank",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          concernRefs: requiredStringArrayField({
            record: row,
            key: "concernRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          pluginContractRefs: requiredStringArrayField({
            record: row,
            key: "pluginContractRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "hook_boundary",
            issues
          })
        })
      ];
    })
  );
}

function admitSelectionBoundaryRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramSelectionBoundaryRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `selectionBoundaries[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "selection_boundary",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/selection-boundary-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          boundaryRef: requiredStringField({
            record: row,
            key: "boundaryRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          boundaryKind: requiredSelectionBoundaryKindField({
            record: row,
            key: "boundaryKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          hostRef: requiredStringField({
            record: row,
            key: "hostRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          inputContractRefs: requiredStringArrayField({
            record: row,
            key: "inputContractRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          outputContractRefs: requiredStringArrayField({
            record: row,
            key: "outputContractRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          candidateRefs: requiredStringArrayField({
            record: row,
            key: "candidateRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "selection_boundary",
            issues
          })
        })
      ];
    })
  );
}

function admitJobBindingRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramJobBindingRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `jobBindings[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "job_binding",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/job-binding-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          jobRef: requiredStringField({
            record: row,
            key: "jobRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          }),
          contractTargetRefs: requiredStringArrayField({
            record: row,
            key: "contractTargetRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          }),
          roleRefs: requiredStringArrayField({
            record: row,
            key: "roleRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          }),
          policyHookRefs: requiredStringArrayField({
            record: row,
            key: "policyHookRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          }),
          publicCallableGraphFunctionRefs: requiredStringArrayField({
            record: row,
            key: "publicCallableGraphFunctionRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "job_binding",
            issues
          })
        })
      ];
    })
  );
}

function admitRoleBindingRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramRoleBindingRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `roleBindings[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "role_binding",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/role-binding-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          roleRef: requiredStringField({
            record: row,
            key: "roleRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "role_binding",
            issues
          }),
          capabilityRefs: requiredStringArrayField({
            record: row,
            key: "capabilityRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "role_binding",
            issues
          }),
          policyHookRefs: requiredStringArrayField({
            record: row,
            key: "policyHookRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "role_binding",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "role_binding",
            issues
          })
        })
      ];
    })
  );
}

function admitExternalToolGateRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramExternalToolGateRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `externalToolGates[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "external_tool_gate",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/external-tool-gate-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          toolGateRef: requiredStringField({
            record: row,
            key: "toolGateRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          toolRef: requiredStringField({
            record: row,
            key: "toolRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          boundaryRef: requiredStringField({
            record: row,
            key: "boundaryRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          transportRef: requiredStringField({
            record: row,
            key: "transportRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          payloadContractRef: requiredStringField({
            record: row,
            key: "payloadContractRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          admissionRef: requiredStringField({
            record: row,
            key: "admissionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          notLanguageTruthEvidenceRefs: requiredStringArrayField({
            record: row,
            key: "notLanguageTruthEvidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "external_tool_gate",
            issues
          })
        })
      ];
    })
  );
}

function admitRuntimeBindingRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramRuntimeBindingRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `runtimeBindings[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "runtime_binding",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/runtime-binding-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      return [
        Object.freeze({
          bindingRef: requiredStringField({
            record: row,
            key: "bindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          runtimeBindingKind: requiredRuntimeBindingKindField({
            record: row,
            key: "runtimeBindingKind",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          moduleRef: requiredStringField({
            record: row,
            key: "moduleRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          publicStartRef: requiredStringField({
            record: row,
            key: "publicStartRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          commandRef: requiredStringField({
            record: row,
            key: "commandRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          pluginContractRefs: requiredStringArrayField({
            record: row,
            key: "pluginContractRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          stageBindingRefs: requiredStringArrayField({
            record: row,
            key: "stageBindingRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          consumesPluginsThroughAbg: requiredBooleanField({
            record: row,
            key: "consumesPluginsThroughAbg",
            expected: true,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          forbidsProductLocalIteration: requiredBooleanField({
            record: row,
            key: "forbidsProductLocalIteration",
            expected: true,
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_binding",
            issues
          })
        })
      ];
    })
  );
}

function admitRuntimeReentryRouteRows(
  input: readonly unknown[],
  subjectRef: string,
  issues: GtlProgramConformanceIssue[]
): readonly GtlProgramRuntimeReentryRouteRow[] {
  return Object.freeze(
    input.flatMap((row, index) => {
      const surfaceRef = `runtimeReentryRoutes[${index}]`;
      if (!isRecord(row)) {
        issues.push(
          issue({
            surfaceKind: "runtime_reentry_route",
            surfaceRef,
            ruleRef: "abg://gtl-program/input/runtime-reentry-route-row",
            message: `${surfaceRef} must be an object`
          })
        );
        return [];
      }
      if (Object.hasOwn(row, "relativeCursorOffset")) {
        issues.push(
          issue({
            surfaceKind: "runtime_reentry_route",
            surfaceRef,
            ruleRef: "abg://gtl-program/runtime-reentry/relative-offset-not-authority",
            message: `${surfaceRef}.relativeCursorOffset is read-model shorthand and cannot be admitted as re-entry authority`
          })
        );
      }
      const selectedActionKind = requiredStringField({
        record: row,
        key: "selectedActionKind",
        label: surfaceRef,
        subjectRef,
        surfaceKind: "runtime_reentry_route",
        issues
      });
      if (selectedActionKind !== "reenter_graph_span") {
        issues.push(
          issue({
            surfaceKind: "runtime_reentry_route",
            surfaceRef,
            ruleRef: "abg://gtl-program/runtime-reentry/selected-action-kind",
            message: `${surfaceRef}.selectedActionKind must be reenter_graph_span`
          })
        );
      }
      return [
        Object.freeze({
          routeRef: requiredStringField({
            record: row,
            key: "routeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairSurfaceDisposition: requiredRepairSurfaceDispositionField({
            record: row,
            key: "repairSurfaceDisposition",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          selectedActionKind: "reenter_graph_span" as const,
          graphReentryPoint: requiredGraphReentryPointField({
            record: row,
            key: "graphReentryPoint",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairGraphFunctionRef: requiredStringField({
            record: row,
            key: "repairGraphFunctionRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairGraphVectorRef: requiredStringField({
            record: row,
            key: "repairGraphVectorRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairGraphFunctionId: requiredStringField({
            record: row,
            key: "repairGraphFunctionId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairGraphId: requiredStringField({
            record: row,
            key: "repairGraphId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairGraphVectorId: requiredStringField({
            record: row,
            key: "repairGraphVectorId",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          reentryTargetVectorIndex: requiredNonNegativeIntegerField({
            record: row,
            key: "reentryTargetVectorIndex",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          repairAssetRef: requiredStringField({
            record: row,
            key: "repairAssetRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          targetOutcomeRef: requiredStringField({
            record: row,
            key: "targetOutcomeRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          observationBindingRef: requiredStringField({
            record: row,
            key: "observationBindingRef",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          lawfulBasisRefs: requiredStringArrayField({
            record: row,
            key: "lawfulBasisRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          }),
          evidenceRefs: optionalStringArrayField({
            record: row,
            key: "evidenceRefs",
            label: surfaceRef,
            subjectRef,
            surfaceKind: "runtime_reentry_route",
            issues
          })
        })
      ];
    })
  );
}

export function admitGtlProgramConformanceInput(
  rawInput: unknown
): GtlProgramConformanceInputAdmission {
  const issues: GtlProgramConformanceIssue[] = [];
  if (!isRecord(rawInput)) {
    const input = Object.freeze({
      subjectRef: "unknown",
      abiPackageVersion: "",
      expectedCoverage: admitExpectedCoverage(undefined, "unknown", issues),
      featureCoverageManifest: emptyFeatureCoverageManifest("missing"),
      catalogGraphFunctionRefs: Object.freeze([]),
      graphFunctions: Object.freeze([]),
      modules: Object.freeze([]),
      targetCarrierContracts: Object.freeze([]),
      edgeClosureContracts: Object.freeze([]),
      overlays: Object.freeze([]),
      publicStartTargets: Object.freeze([]),
      promptAssets: Object.freeze([]),
      pluginContracts: Object.freeze([]),
      sourceIdentitySurfaces: Object.freeze([]),
      sameObjectProofs: Object.freeze([]),
      operatorDeclarations: Object.freeze([]),
      evaluatorDeclarations: Object.freeze([]),
      ruleDeclarations: Object.freeze([]),
      computeCompositions: Object.freeze([]),
      computeStageBindings: Object.freeze([]),
      hookBoundaries: Object.freeze([]),
      selectionBoundaries: Object.freeze([]),
      jobBindings: Object.freeze([]),
      roleBindings: Object.freeze([]),
      externalToolGates: Object.freeze([]),
      runtimeBindings: Object.freeze([]),
      runtimeReentryRoutes: Object.freeze([])
    });
    issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: "unknown",
        ruleRef: "abg://gtl-program/input/object",
        message: "GTL program conformance input must be an object"
      })
    );
    return Object.freeze({
      kind: "gtl_program_conformance_input_admission" as const,
      input,
      issues: Object.freeze([...issues])
    });
  }

  const subjectRef = requiredStringField({
    record: rawInput,
    key: "subjectRef",
    label: "GtlProgramConformanceInput",
    subjectRef: "unknown",
    surfaceKind: "program_inventory",
    issues
  }) || "unknown";
  const graphFunctionInputs = checkOptionalArrayField({
    record: rawInput,
    key: "graphFunctions",
    subjectRef,
    issues
  });
  const moduleInputs = checkOptionalArrayField({
    record: rawInput,
    key: "modules",
    subjectRef,
    issues
  });
  const input = Object.freeze({
    subjectRef,
    abiPackageVersion: requiredStringField({
      record: rawInput,
      key: "abiPackageVersion",
      label: "GtlProgramConformanceInput",
      subjectRef,
      surfaceKind: "program_inventory",
      issues
    }),
    expectedCoverage: admitExpectedCoverage(
      rawInput["expectedCoverage"],
      subjectRef,
      issues
    ),
    featureCoverageManifest: admitFeatureCoverageManifest(
      rawInput["featureCoverageManifest"],
      subjectRef,
      issues
    ),
    catalogGraphFunctionRefs: optionalStringArrayField({
      record: rawInput,
      key: "catalogGraphFunctionRefs",
      label: "GtlProgramConformanceInput",
      subjectRef,
      surfaceKind: "program_inventory",
      issues
    }),
    graphFunctions: Object.freeze(
      graphFunctionInputs.flatMap((entry, index) => {
        const admitted = plausibleGraphFunction(
          entry,
          subjectRef,
          issues,
          `graphFunctions[${index}]`
        );
        return admitted === null ? [] : [admitted];
      })
    ),
    modules: Object.freeze(
      moduleInputs.flatMap((entry, index) => {
        const admitted = plausibleModule(
          entry,
          subjectRef,
          issues,
          `modules[${index}]`
        );
        return admitted === null ? [] : [admitted];
      })
    ),
    targetCarrierContracts: admitTargetCarrierRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "targetCarrierContracts",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    edgeClosureContracts: admitEdgeClosureRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "edgeClosureContracts",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    overlays: admitOverlayRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "overlays",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    publicStartTargets: admitPublicStartRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "publicStartTargets",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    promptAssets: admitPromptAssetRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "promptAssets",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    pluginContracts: checkOptionalArrayField({
      record: rawInput,
      key: "pluginContracts",
      subjectRef,
      issues
    }),
    sourceIdentitySurfaces: admitSourceIdentityRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "sourceIdentitySurfaces",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    sameObjectProofs: admitSameObjectRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "sameObjectProofs",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    operatorDeclarations: admitOperatorDeclarationRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "operatorDeclarations",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    evaluatorDeclarations: admitEvaluatorDeclarationRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "evaluatorDeclarations",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    ruleDeclarations: admitRuleDeclarationRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "ruleDeclarations",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    computeCompositions: admitComputeCompositionRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "computeCompositions",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    computeStageBindings: admitComputeStageBindingRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "computeStageBindings",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    hookBoundaries: admitHookBoundaryRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "hookBoundaries",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    selectionBoundaries: admitSelectionBoundaryRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "selectionBoundaries",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    jobBindings: admitJobBindingRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "jobBindings",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    roleBindings: admitRoleBindingRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "roleBindings",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    externalToolGates: admitExternalToolGateRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "externalToolGates",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    runtimeBindings: admitRuntimeBindingRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "runtimeBindings",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    ),
    runtimeReentryRoutes: admitRuntimeReentryRouteRows(
      checkOptionalArrayField({
        record: rawInput,
        key: "runtimeReentryRoutes",
        subjectRef,
        issues
      }),
      subjectRef,
      issues
    )
  });
  return Object.freeze({
    kind: "gtl_program_conformance_input_admission" as const,
    input,
    issues: Object.freeze([...issues])
  });
}

function sameOrderedContract(
  left: readonly Node[],
  right: readonly Node[]
): boolean {
  return stableJson(interfaceContract(left)) === stableJson(interfaceContract(right));
}

function nodeContractSet(nodes: readonly Node[]): Set<string> {
  return new Set(nodes.map(nodeContractKey));
}

function contractNames(nodes: readonly Node[]): readonly string[] {
  return Object.freeze(nodes.map((node) => node.name));
}

function pushGraphInterfaceIssue(input: {
  readonly graphFunction: GraphFunction;
  readonly ruleRef: string;
  readonly message: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  input.issues.push(
    issue({
      surfaceKind: "graph_function",
      surfaceRef: input.graphFunction.name,
      ruleRef: input.ruleRef,
      message: input.message
    })
  );
}

function checkGraphFunctionInterface(input: {
  readonly graphFunction: GraphFunction;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const { graphFunction, issues } = input;
  if (!sameOrderedContract(graphFunction.inputs, graphFunction.environment.requires)) {
    pushGraphInterfaceIssue({
      graphFunction,
      issues,
      ruleRef: "abg://gtl-program/graph-function/inputs-equal-environment-requires",
      message: `GraphFunction inputs ${JSON.stringify(contractNames(graphFunction.inputs))} do not equal environment.requires ${JSON.stringify(contractNames(graphFunction.environment.requires))}`
    });
  }

  const providedContracts = nodeContractSet(graphFunction.environment.provides);
  for (const output of graphFunction.outputs) {
    if (!providedContracts.has(nodeContractKey(output))) {
      pushGraphInterfaceIssue({
        graphFunction,
        issues,
        ruleRef: "abg://gtl-program/graph-function/outputs-provided",
        message: `GraphFunction output ${JSON.stringify(output.name)} is absent from environment.provides`
      });
    }
  }
}

function pushGraphIssue(input: {
  readonly graphFunction: GraphFunction;
  readonly graph: Graph;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly message: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.surfaceRef,
      ruleRef: input.ruleRef,
      message: `${input.graphFunction.name}/${input.graph.name}: ${input.message}`
    })
  );
}

function graphVectorIdentityKey(input: {
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
}): string {
  return stableJson({
    graphFunctionId: input.graphFunctionId,
    graphId: input.graphId,
    graphVectorId: input.graphVectorId
  });
}

function graphVectorIdentityRef(input: {
  readonly graphFunctionRef?: string;
  readonly graphRef?: string;
  readonly vectorRef?: string;
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
}): string {
  const display = [
    input.graphFunctionRef ?? input.graphFunctionId,
    input.graphRef ?? input.graphId,
    input.vectorRef ?? input.graphVectorId
  ].join("/");
  return `${display}#${input.graphFunctionId}:${input.graphId}:${input.graphVectorId}`;
}

function fieldRefsMissing(
  fieldRefs: readonly string[],
  expected: readonly string[]
): readonly string[] {
  const fieldRefSet = new Set(fieldRefs);
  return Object.freeze(expected.filter((fieldRef) => !fieldRefSet.has(fieldRef)));
}

function checkTargetCarrierContractLaw(input: {
  readonly row: GtlProgramTargetCarrierRow;
  readonly vector: GraphVectorProjection;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const { row, vector } = input;
  const push = (ruleRef: string, message: string): void => {
    input.issues.push(
      issue({
        surfaceKind: "target_carrier_contract",
        surfaceRef: row.edgeRef,
        ruleRef,
        message
      })
    );
  };
  if (!row.targetCarrierContractRef.startsWith("gtl://target-carrier-contract/")) {
    push(
      "abg://gtl-program/target-carrier/gtl-ref",
      "target carrier row must publish a gtl://target-carrier-contract/ ref"
    );
  }
  if (!row.targetCarrierTemplateRef.startsWith("gtl://target-carrier-template/")) {
    push(
      "abg://gtl-program/target-carrier/template-ref",
      "target carrier row must publish a gtl://target-carrier-template/ ref"
    );
  }
  if (!row.outputCarrierFamilyRef.startsWith("gtl://target-carrier-family/")) {
    push(
      "abg://gtl-program/target-carrier/family-ref",
      "target carrier row must publish a gtl://target-carrier-family/ ref"
    );
  }
  if (!row.envelopeContractRef.startsWith("gtl://target-carrier-envelope/")) {
    push(
      "abg://gtl-program/target-carrier/envelope-ref",
      "target carrier row must publish a gtl://target-carrier-envelope/ ref"
    );
  }
  if (
    !row.outputSurfaceRef.startsWith("asset-type://") ||
    !row.outputSurfaceRef.endsWith(`/${row.targetAssetType}`)
  ) {
    push(
      "abg://gtl-program/target-carrier/output-surface",
      `outputSurfaceRef ${JSON.stringify(row.outputSurfaceRef)} does not match target asset ${JSON.stringify(row.targetAssetType)}`
    );
  }
  const missingRequiredFields = fieldRefsMissing(row.requiredFieldRefs, [
    "kind",
    "targetAssetType",
    "edgeRef",
    "contractRef",
    "contractDigest",
    row.nestedPayloadPath
  ]);
  if (missingRequiredFields.length > 0) {
    push(
      "abg://gtl-program/target-carrier/required-fields",
      `target carrier requiredFieldRefs missing ${missingRequiredFields.join(", ")}`
    );
  }
  const missingProtocolFields = fieldRefsMissing(row.fixedProtocolFieldRefs, [
    "kind",
    "targetAssetType",
    "edgeRef",
    "contractRef",
    "contractDigest"
  ]);
  if (missingProtocolFields.length > 0) {
    push(
      "abg://gtl-program/target-carrier/fixed-protocol-fields",
      `target carrier fixedProtocolFieldRefs missing ${missingProtocolFields.join(", ")}`
    );
  }
  const fixedProtocolSet = new Set(row.fixedProtocolFieldRefs);
  const workerProtocolFields = row.workerFillableFieldRefs.filter((fieldRef) =>
    fixedProtocolSet.has(fieldRef)
  );
  if (workerProtocolFields.length > 0) {
    push(
      "abg://gtl-program/target-carrier/worker-protocol-authority",
      `workerFillableFieldRefs must not include fixed protocol fields ${workerProtocolFields.join(", ")}`
    );
  }
  const literalDomainSet = new Set(row.literalDomainRefs);
  const missingLiteralDomains = [
    `kind:${row.outputCarrierKind}`,
    `targetAssetType:${row.targetAssetType}`,
    `edgeRef:${row.edgeRef}`,
    `contractRef:${row.targetCarrierContractRef}`
  ].filter((literalRef) => !literalDomainSet.has(literalRef));
  if (missingLiteralDomains.length > 0) {
    push(
      "abg://gtl-program/target-carrier/literal-domain",
      `target carrier literalDomainRefs missing ${missingLiteralDomains.join(", ")}`
    );
  }
  if (row.schemaRef !== vector.targetSchemaRef) {
    push(
      "abg://gtl-program/target-carrier/schema-ref",
      `target carrier schemaRef ${JSON.stringify(row.schemaRef)} does not match vector target schema ${JSON.stringify(vector.targetSchemaRef)}`
    );
  }
  const requiredRefPrefixes = [
    ["admissionRef", row.admissionRef, "admission://"],
    ["payloadLedgerBindingRef", row.payloadLedgerBindingRef, "payload-ledger://"],
    ["edgeAssuranceBindingRef", row.edgeAssuranceBindingRef, "edge-assurance://"],
    ["handoffProjectionRef", row.handoffProjectionRef, "handoff-projection://"],
    ["constructionTemplateRef", row.constructionTemplateRef, "construction-template://"],
    ["replayDigestPolicyRef", row.replayDigestPolicyRef, "replay-digest://"],
    ["materializationPolicyRef", row.materializationPolicyRef, "materialization://"],
    ["closurePreconditionRef", row.closurePreconditionRef, "closure-precondition://"]
  ] as const;
  for (const [fieldName, value, prefix] of requiredRefPrefixes) {
    if (!value.startsWith(prefix)) {
      push(
        `abg://gtl-program/target-carrier/${fieldName}`,
        `target carrier ${fieldName} must declare a ${prefix} ref`
      );
    }
  }
}

function checkGraphProgramClosure(input: {
  readonly graphFunction: GraphFunction;
  readonly graph: Graph;
  readonly vectorIdentityKeys: Set<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const { graphFunction, graph, vectorIdentityKeys, issues } = input;
  const declaredContracts = nodeContractSet(graph.nodes);
  const referencedContracts = new Set<string>();

  for (const graphInput of graph.inputs) {
    const graphInputContract = nodeContractKey(graphInput);
    referencedContracts.add(graphInputContract);
    if (!declaredContracts.has(graphInputContract)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/input-node-declared",
        message: `graph input ${JSON.stringify(graphInput.name)} is absent from graph.nodes`
      });
    }
  }

  for (const graphOutput of graph.outputs) {
    const graphOutputContract = nodeContractKey(graphOutput);
    referencedContracts.add(graphOutputContract);
    if (!declaredContracts.has(graphOutputContract)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/output-node-declared",
        message: `graph output ${JSON.stringify(graphOutput.name)} is absent from graph.nodes`
      });
    }
  }

  for (const vector of graph.vectors) {
    const vectorIdentity = {
      graphFunctionId: graphFunction.id,
      graphId: graph.id,
      graphVectorId: vector.id
    };
    const vectorIdentityKey = graphVectorIdentityKey(vectorIdentity);
    if (vectorIdentityKeys.has(vectorIdentityKey)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph_vector",
        surfaceRef: graphVectorIdentityRef({
          graphFunctionRef: graphFunction.name,
          graphRef: graph.name,
          vectorRef: vector.name,
          ...vectorIdentity
        }),
        ruleRef: "abg://gtl-program/graph-vector/unique-ref",
        message: `GraphVector identity ${JSON.stringify(vectorIdentity)} is declared more than once`
      });
    }
    vectorIdentityKeys.add(vectorIdentityKey);

    for (const source of vector.source) {
      const sourceContract = nodeContractKey(source);
      referencedContracts.add(sourceContract);
      if (!declaredContracts.has(sourceContract)) {
        pushGraphIssue({
          graphFunction,
          graph,
          issues,
          surfaceKind: "graph_vector",
          surfaceRef: vector.name,
          ruleRef: "abg://gtl-program/graph-vector/source-node-declared",
          message: `vector source ${JSON.stringify(source.name)} is absent from graph.nodes`
        });
      }
    }

    const targetContract = nodeContractKey(vector.target);
    referencedContracts.add(targetContract);
    if (!declaredContracts.has(targetContract)) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph_vector",
        surfaceRef: vector.name,
        ruleRef: "abg://gtl-program/graph-vector/target-node-declared",
        message: `vector target ${JSON.stringify(vector.target.name)} is absent from graph.nodes`
      });
    }
  }

  const availableContracts = nodeContractSet(graph.inputs);
  const remainingVectors = new Set<GraphVector>(graph.vectors);
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const vector of [...remainingVectors]) {
      const sourceContracts = interfaceContract(vector.source);
      if (sourceContracts.every((contract) => availableContracts.has(contract))) {
        availableContracts.add(nodeContractKey(vector.target));
        remainingVectors.delete(vector);
        progressed = true;
      }
    }
  }

  for (const vector of remainingVectors) {
    const missingSources = vector.source
      .filter((source) => !availableContracts.has(nodeContractKey(source)))
      .map((source) => source.name);
    pushGraphIssue({
      graphFunction,
      graph,
      issues,
      surfaceKind: "graph_vector",
      surfaceRef: vector.name,
      ruleRef: "abg://gtl-program/graph-vector/source-derivable",
      message: `vector sources are not derivable from graph inputs or prior vector outputs: ${JSON.stringify(missingSources)}`
    });
  }

  for (const graphOutput of graph.outputs) {
    if (!availableContracts.has(nodeContractKey(graphOutput))) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/output-derivable",
        message: `graph output ${JSON.stringify(graphOutput.name)} is not derivable from graph inputs`
      });
    }
  }

  for (const node of graph.nodes) {
    if (!referencedContracts.has(nodeContractKey(node))) {
      pushGraphIssue({
        graphFunction,
        graph,
        issues,
        surfaceKind: "graph",
        surfaceRef: graph.name,
        ruleRef: "abg://gtl-program/graph/node-reachable-or-bound",
        message: `declared node ${JSON.stringify(node.name)} is not an input, output, vector source, or vector target`
      });
    }
  }
}

function collectPublishedGraphFunctions(
  input: GtlProgramConformanceInput,
  issues: GtlProgramConformanceIssue[]
): readonly GraphFunction[] {
  const graphFunctions = [...(input.graphFunctions ?? [])];
  for (const module of input.modules ?? []) {
    graphFunctions.push(...module.graphFunctions);
  }

  const byName = new Map<string, GraphFunction>();
  for (const graphFunction of graphFunctions) {
    if (byName.has(graphFunction.name)) {
      issues.push(
        issue({
          surfaceKind: "graph_function",
          surfaceRef: graphFunction.name,
          ruleRef: "abg://gtl-program/graph-function/unique-publication",
          message: `GraphFunction ${JSON.stringify(graphFunction.name)} is published more than once`
        })
      );
      continue;
    }
    byName.set(graphFunction.name, graphFunction);
  }
  return Object.freeze([...byName.values()]);
}

function checkCatalogPublication(input: {
  readonly catalogGraphFunctionRefs: readonly string[];
  readonly publishedGraphFunctionRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const catalogRefs = new Set(input.catalogGraphFunctionRefs);
  for (const ref of catalogRefs) {
    if (!input.publishedGraphFunctionRefs.has(ref)) {
      input.issues.push(
        issue({
          surfaceKind: "graph_function",
          surfaceRef: ref,
          ruleRef: "abg://gtl-program/graph-function/catalog-published",
          message: `catalog GraphFunction ${JSON.stringify(ref)} is not published`
        })
      );
    }
  }
  for (const ref of input.publishedGraphFunctionRefs) {
    if (!catalogRefs.has(ref)) {
      input.issues.push(
        issue({
          surfaceKind: "module",
          surfaceRef: ref,
          ruleRef: "abg://gtl-program/module/no-untracked-graph-function",
          message: `published GraphFunction ${JSON.stringify(ref)} is absent from the supplied catalog`
        })
      );
    }
  }
}

function materializeGraphVectors(
  graphFunctions: readonly GraphFunction[],
  issues: GtlProgramConformanceIssue[]
): readonly GraphVectorProjection[] {
  const vectors: GraphVectorProjection[] = [];
  const vectorIdentityKeys = new Set<string>();
  for (const graphFunction of graphFunctions) {
    checkGraphFunctionInterface({ graphFunction, issues });
    try {
      const graph = materializeGraphFunction(graphFunction);
      checkGraphProgramClosure({
        graphFunction,
        graph,
        vectorIdentityKeys,
        issues
      });
      for (const vector of graph.vectors) {
        vectors.push(
          Object.freeze({
            graphFunctionId: graphFunction.id,
            graphFunctionRef: graphFunction.name,
            graphId: graph.id,
            graphRef: graph.name,
            graphVectorId: vector.id,
            vectorRef: vector.name,
            sourceAssetTypes: Object.freeze(vector.source.map((source) => source.name)),
            sourceNodeContracts: interfaceContract(vector.source),
            targetAssetType: vector.target.name,
            targetSchemaRef: vector.target.schema.ref,
            targetNodeContract: nodeContractKey(vector.target),
            operatorCount: vector.operators.length,
            evaluatorCount: vector.evaluators.length,
            hasRule: vector.rule !== null,
            allowsSubwork: vector.allowsSubwork,
            declarationKeyRefs: Object.freeze(
              vector.declarations.entries.map((entry) => entry.key)
            )
          })
        );
      }
    } catch (error: unknown) {
      issues.push(
        issue({
          surfaceKind: "graph_function",
          surfaceRef: graphFunction.name,
          ruleRef: "abg://gtl-program/graph-function/materializable-template",
          message: errorMessage(error)
        })
      );
    }
  }
  return Object.freeze(vectors);
}

function checkAllowedConsequenceTraversalDeclarations(input: {
  readonly graphFunctions: readonly GraphFunction[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  for (const graphFunction of input.graphFunctions) {
    let graph: Graph;
    try {
      graph = materializeGraphFunction(graphFunction);
    } catch {
      continue;
    }
    graph.vectors.forEach((vector, vectorIndex) => {
      try {
        deriveAllowedConsequenceTraversalCatalogFromGtl({
          graphFunction,
          graphVector: vector,
          vectorIndex,
          edgeRef: vector.name
        });
      } catch (error: unknown) {
        input.issues.push(
          issue({
            surfaceKind: "graph_vector",
            surfaceRef: vector.name,
            ruleRef:
              "abg://gtl-program/allowed-consequence-traversal/declaration",
            message: errorMessage(error),
            evidenceRefs: [
              graphFunction.name,
              graphFunction.id,
              vector.id
            ]
          })
        );
      }
    });
  }
}

function checkVectorRows(input: {
  readonly vectors: readonly GraphVectorProjection[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly edgeClosureContracts: readonly GtlProgramEdgeClosureRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const vectorByIdentity = new Map(
    input.vectors.map((vector) => [graphVectorIdentityKey(vector), vector])
  );
  const targetCarrierByIdentity = new Map<string, GtlProgramTargetCarrierRow[]>();
  for (const row of input.targetCarrierContracts) {
    const key = graphVectorIdentityKey(row);
    targetCarrierByIdentity.set(key, [
      ...(targetCarrierByIdentity.get(key) ?? []),
      row
    ]);
  }
  const edgeClosureByIdentity = new Map<string, GtlProgramEdgeClosureRow[]>();
  for (const row of input.edgeClosureContracts) {
    const key = graphVectorIdentityKey(row);
    edgeClosureByIdentity.set(key, [
      ...(edgeClosureByIdentity.get(key) ?? []),
      row
    ]);
  }

  for (const vector of input.vectors) {
    const vectorKey = graphVectorIdentityKey(vector);
    const vectorIdentity = graphVectorIdentityRef(vector);
    const targetCarriers = targetCarrierByIdentity.get(vectorKey) ?? [];
    if (targetCarriers.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "target_carrier_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/graph-vector/target-carrier-required",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has no target carrier contract row`
        })
      );
    } else if (targetCarriers.length > 1) {
      input.issues.push(
        issue({
          surfaceKind: "target_carrier_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/target-carrier/unique-vector-row",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has ${targetCarriers.length} target carrier rows`
        })
      );
    } else {
      const targetCarrier = targetCarriers[0]!;
      if (targetCarrier.graphVectorRef !== vector.vectorRef) {
        input.issues.push(
          issue({
            surfaceKind: "target_carrier_contract",
            surfaceRef: targetCarrier.edgeRef,
            ruleRef: "abg://gtl-program/target-carrier/vector-ref-match",
            message: `target carrier graphVectorRef ${JSON.stringify(targetCarrier.graphVectorRef)} does not match vector ${JSON.stringify(vector.vectorRef)}`
          })
        );
      }
      if (targetCarrier.targetAssetType !== vector.targetAssetType) {
        input.issues.push(
          issue({
            surfaceKind: "target_carrier_contract",
            surfaceRef: targetCarrier.edgeRef,
            ruleRef: "abg://gtl-program/target-carrier/target-asset-match",
            message: `target carrier target ${JSON.stringify(targetCarrier.targetAssetType)} does not match vector target ${JSON.stringify(vector.targetAssetType)}`
          })
        );
      }
      checkTargetCarrierContractLaw({
        row: targetCarrier,
        vector,
        issues: input.issues
      });
    }

    const edgeClosures = edgeClosureByIdentity.get(vectorKey) ?? [];
    if (edgeClosures.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/graph-vector/edge-closure-required",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has no edge closure contract row`
        })
      );
    } else if (edgeClosures.length > 1) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: vectorIdentity,
          ruleRef: "abg://gtl-program/edge-closure/unique-vector-row",
          message: `GraphVector ${JSON.stringify(vectorIdentity)} has ${edgeClosures.length} edge closure rows`
        })
      );
    } else {
      const edgeClosure = edgeClosures[0]!;
      if (edgeClosure.targetAssetType !== vector.targetAssetType) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: edgeClosure.edgeRef,
          ruleRef: "abg://gtl-program/edge-closure/target-asset-match",
          message: `edge closure target ${JSON.stringify(edgeClosure.targetAssetType)} does not match vector target ${JSON.stringify(vector.targetAssetType)}`
        })
      );
      }
    }
  }

  for (const row of input.targetCarrierContracts) {
    if (!vectorByIdentity.has(graphVectorIdentityKey(row))) {
      input.issues.push(
        issue({
          surfaceKind: "target_carrier_contract",
          surfaceRef: graphVectorIdentityRef({
            graphFunctionRef: row.edgeRef,
            graphRef: row.edgeRef,
            vectorRef: row.graphVectorRef,
            ...row
          }),
          ruleRef: "abg://gtl-program/target-carrier/no-orphan-row",
          message: `target carrier row ${JSON.stringify(row.edgeRef)} has no published graph vector identity`
        })
      );
    }
  }

  for (const row of input.edgeClosureContracts) {
    if (!vectorByIdentity.has(graphVectorIdentityKey(row))) {
      input.issues.push(
        issue({
          surfaceKind: "edge_closure_contract",
          surfaceRef: graphVectorIdentityRef({
            graphFunctionRef: row.edgeRef,
            graphRef: row.edgeRef,
            vectorRef: row.edgeRef,
            ...row
          }),
          ruleRef: "abg://gtl-program/edge-closure/no-orphan-row",
          message: `edge closure row ${JSON.stringify(row.edgeRef)} has no published graph vector identity`
        })
      );
    }
  }
}

function checkOverlays(input: {
  readonly overlays: readonly GtlProgramOverlayRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly graphFunctionRefs: ReadonlySet<string>;
  readonly graphVectorRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const overlayRefs = new Set(input.overlays.map((overlay) => overlay.overlayRef));
  for (const overlay of input.overlays) {
    for (const graphFunctionRef of overlay.graphFunctionRefs) {
      if (!input.graphFunctionRefs.has(graphFunctionRef)) {
        input.issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef: overlay.overlayRef,
            ruleRef: "abg://gtl-program/overlay/graph-function-resolves",
            message: `overlay names unpublished GraphFunction ${JSON.stringify(graphFunctionRef)}`
          })
        );
      }
    }
    for (const graphVectorRef of overlay.graphVectorRefs) {
      if (!input.graphVectorRefs.has(graphVectorRef)) {
        input.issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef: overlay.overlayRef,
            ruleRef: "abg://gtl-program/overlay/graph-vector-resolves",
            message: `overlay names unpublished GraphVector ${JSON.stringify(graphVectorRef)}`
          })
        );
      }
    }
    for (const target of overlay.publicStartTargets) {
      if (!input.graphFunctionRefs.has(target)) {
        input.issues.push(
          issue({
            surfaceKind: "overlay",
            surfaceRef: overlay.overlayRef,
            ruleRef: "abg://gtl-program/overlay/public-start-target-resolves",
            message: `overlay public start target ${JSON.stringify(target)} is not published`
          })
        );
      }
    }
    if (!input.graphFunctionRefs.has(overlay.defaultStartTarget)) {
      input.issues.push(
        issue({
          surfaceKind: "overlay",
          surfaceRef: overlay.overlayRef,
          ruleRef: "abg://gtl-program/overlay/default-start-target-resolves",
          message: `overlay default start target ${JSON.stringify(overlay.defaultStartTarget)} is not published`
        })
      );
    }
  }

  for (const target of input.publicStartTargets) {
    if (!input.graphFunctionRefs.has(target.graphFunctionRef)) {
      input.issues.push(
        issue({
          surfaceKind: "public_start",
          surfaceRef: target.name,
          ruleRef: "abg://gtl-program/public-start/graph-function-resolves",
          message: `public start target names unpublished GraphFunction ${JSON.stringify(target.graphFunctionRef)}`
        })
      );
    }
    for (const overlayRef of target.overlayRefs) {
      if (!overlayRefs.has(overlayRef)) {
        input.issues.push(
          issue({
            surfaceKind: "public_start",
            surfaceRef: target.name,
            ruleRef: "abg://gtl-program/public-start/overlay-resolves",
            message: `public start target names unpublished overlay ${JSON.stringify(overlayRef)}`
          })
        );
      }
    }
    for (const overlayRef of target.defaultForOverlayRefs) {
      if (!overlayRefs.has(overlayRef)) {
        input.issues.push(
          issue({
            surfaceKind: "public_start",
            surfaceRef: target.name,
            ruleRef: "abg://gtl-program/public-start/default-overlay-resolves",
            message: `public start target defaultFor names unpublished overlay ${JSON.stringify(overlayRef)}`
          })
        );
      }
    }
  }
}

function checkPromptAssets(input: {
  readonly promptAssets: readonly GtlProgramPromptAssetRow[];
  readonly abiPackageVersion: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  for (const row of input.promptAssets) {
    let admitted: AssetSurface;
    try {
      admitted = admitAssetSurface(row.assetSurface);
    } catch (error: unknown) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/asset-surface-admission",
          message: errorMessage(error),
          evidenceRefs: row.evidenceRefs
        })
      );
      continue;
    }

    if (admitted.rendererRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/renderer-ref",
          message: "prompt assets require at least one renderer ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.renderedViewDigestPolicyRef === null) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-view-digest-policy",
          message: "prompt assets require renderedViewDigestPolicyRef",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.constructorRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/constructor-ref",
          message: "prompt assets require at least one constructor ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.proofObligationRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/proof-obligation",
          message: "prompt assets require at least one proof obligation ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.outputContractRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/output-contract",
          message: "prompt assets require at least one output contract ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (admitted.authoritySlots.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/authority-slot",
          message: "prompt assets require at least one authority slot",
          evidenceRefs: row.evidenceRefs
        })
      );
    }
    if (row.gtlNode === undefined) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/gtl-node",
          message: "prompt assets require the GTL node that carries the admitted AssetSurface",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (
      (admitted.sectionKindRefs.length > 0 || admitted.clauseKindRefs.length > 0) &&
      admitted.rendererRefs.length === 0
    ) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-structure-has-renderer",
          message: "section or clause kind refs require a renderer ref",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (row.gtlNode !== undefined && stableJson(row.gtlNode.assetSurface) !== stableJson(admitted)) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/node-preserves-asset-surface",
          message: "prompt GTL node assetSurface does not match admitted prompt AssetSurface",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (row.renderedViewDigest === undefined || row.renderedViewDigest === null) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-view-digest",
          message: "prompt assets require a rendered prompt view digest",
          evidenceRefs: row.evidenceRefs
        })
      );
    } else if (!row.renderedViewDigest.startsWith("sha256:")) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/rendered-view-digest",
          message: "rendered prompt view digest must be a sha256: digest",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    if (row.evidenceRefs === undefined || row.evidenceRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "prompt_asset",
          surfaceRef: row.surfaceRef,
          ruleRef: "abg://gtl-program/prompt-asset/evidence-ref",
          message: "prompt assets require evidence refs that bind the supplied row",
          evidenceRefs: row.evidenceRefs
        })
      );
    }

    for (const foldRef of row.currentAbgFoldRefs ?? []) {
      const packageMatch = foldRef.match(
        /@abiogenesis\/typescript-tenant@([^#\s]+)/u
      );
      if (packageMatch !== null && packageMatch[1] !== input.abiPackageVersion) {
        input.issues.push(
          issue({
            surfaceKind: "prompt_asset",
            surfaceRef: row.surfaceRef,
            ruleRef: "abg://gtl-program/prompt-asset/current-abg-fold-ref",
            message: `prompt fold ref ${JSON.stringify(foldRef)} does not use @abiogenesis/typescript-tenant@${input.abiPackageVersion}`,
            evidenceRefs: row.evidenceRefs
          })
        );
      }
    }
  }
}

function checkPluginContracts(input: {
  readonly pluginContracts: readonly unknown[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const refs = new Set<string>();
  for (const contractInput of input.pluginContracts) {
    let contract: EnginePluginContract;
    let surfaceRef = "unknown";
    if (
      typeof contractInput === "object" &&
      contractInput !== null &&
      "ref" in contractInput &&
      typeof contractInput.ref === "string"
    ) {
      surfaceRef = contractInput.ref;
    }
    try {
      contract = admitEnginePluginContract(contractInput);
    } catch (error: unknown) {
      input.issues.push(
        issue({
          surfaceKind: "plugin_contract",
          surfaceRef,
          ruleRef: "abg://gtl-program/plugin-contract/admission",
          message: errorMessage(error)
        })
      );
      continue;
    }
    if (refs.has(contract.ref)) {
      input.issues.push(
        issue({
          surfaceKind: "plugin_contract",
          surfaceRef: contract.ref,
          ruleRef: "abg://gtl-program/plugin-contract/unique-ref",
          message: `plugin contract ${JSON.stringify(contract.ref)} is declared more than once`
        })
      );
    }
    refs.add(contract.ref);
    if (
      contract.maySelectNextVector ||
      contract.mayEmitRuntimeEvents ||
      contract.mayCloseTraversal ||
      contract.mayOwnIterationLoop
    ) {
      input.issues.push(
        issue({
          surfaceKind: "plugin_contract",
          surfaceRef: contract.ref,
          ruleRef: "abg://gtl-program/plugin-contract/no-engine-authority",
          message: "plugin contracts must not own traversal, event, closure, or iteration authority"
        })
      );
    }
  }
}

function normalizedVersion(value: string): string {
  return value.replaceAll("_", ".").replaceAll("-", ".");
}

function pushStaleSourceIdentityIssue(input: {
  readonly surfaceRef: string;
  readonly lineNumber: number;
  readonly ruleRef: string;
  readonly message: string;
  readonly evidenceRefs: readonly string[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  input.issues.push(
    issue({
      surfaceKind: "source_identity",
      surfaceRef: `${input.surfaceRef}:${input.lineNumber}`,
      ruleRef: input.ruleRef,
      message: input.message,
      evidenceRefs: input.evidenceRefs
    })
  );
}

function scanStaleIdentityLine(input: {
  readonly line: string;
  readonly surfaceRef: string;
  readonly lineNumber: number;
  readonly abiPackageVersion: string;
  readonly evidenceRefs: readonly string[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const currentMajorMinor = input.abiPackageVersion.match(/^\d+\.\d+/u)?.[0] ?? "";
  const versionedAbgRefPattern =
    /\bABG[-_]?(\d+(?:[._]\d+){1,2})(?:[-_]?RC\d+)?\b/giu;
  for (const match of input.line.matchAll(versionedAbgRefPattern)) {
    const token = match[0];
    const version = normalizedVersion(match[1] ?? "");
    if (!version.startsWith(currentMajorMinor)) {
      pushStaleSourceIdentityIssue({
        ...input,
        ruleRef: "abg://gtl-program/source-identity/current-abg-version",
        message: `stale ABG identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`
      });
    }
  }

  const spacedAbgRefPattern =
    /\bABG\s+(\d+(?:[._]\d+){1,2})(?:\s+RC\d+)?\b/giu;
  for (const match of input.line.matchAll(spacedAbgRefPattern)) {
    const token = match[0];
    const version = normalizedVersion(match[1] ?? "");
    if (!version.startsWith(currentMajorMinor)) {
      pushStaleSourceIdentityIssue({
        ...input,
        ruleRef: "abg://gtl-program/source-identity/current-abg-version",
        message: `stale ABG identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`
      });
    }
  }

  const compactAbgRefPattern = /\bABG(\d)(\d)\b/giu;
  for (const match of input.line.matchAll(compactAbgRefPattern)) {
    const token = match[0];
    const version = `${match[1]}.${match[2]}`;
    if (version !== currentMajorMinor) {
      pushStaleSourceIdentityIssue({
        ...input,
        ruleRef: "abg://gtl-program/source-identity/current-compact-abg-version",
        message: `stale compact ABG identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`
      });
    }
  }

  const uriAbgRefPatterns = Object.freeze([
    /\bruntime:\/\/abg\/(\d+(?:[._-]\d+){1,2})(?:\/[^\s'"`)<\]]*)?/giu,
    /\babg:\/\/(\d+(?:[._-]\d+){1,2})(?:\/[^\s'"`)<\]]*)?/giu,
    /\bruntime:\/\/abg-(\d+[-_]\d+(?:[-_]\d+)?)(?:[A-Za-z0-9._~-]*)?/giu
  ]);
  for (const pattern of uriAbgRefPatterns) {
    for (const match of input.line.matchAll(pattern)) {
      const token = match[0];
      const version = normalizedVersion(match[1] ?? "");
      if (!version.startsWith(currentMajorMinor)) {
        pushStaleSourceIdentityIssue({
          ...input,
          ruleRef: "abg://gtl-program/source-identity/current-abg-version",
          message: `stale ABG identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`
        });
      }
    }
  }

  const abiogenesisPackageRefPattern =
    /@abiogenesis\/[A-Za-z0-9._-]+@(\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?)/gu;
  for (const match of input.line.matchAll(abiogenesisPackageRefPattern)) {
    const token = match[0];
    const version = match[1] ?? "";
    if (version !== input.abiPackageVersion) {
      pushStaleSourceIdentityIssue({
        ...input,
        ruleRef: "abg://gtl-program/source-identity/current-abi-package-version",
        message: `stale ABI package identity ${JSON.stringify(token)} does not match ${input.abiPackageVersion}`
      });
    }
  }

  const staleStagePatterns = Object.freeze([
    /\bRC3\b/u,
    /\brc3StageTruth\b/u,
    /\bRC3 Stage Truth\b/u,
    /\bRC3 selected composition drift\b/u,
    /\babg-3\.9-rc3\b/iu,
    /\b3\.9\.0-rc\.13\b/u,
    /\brc13\b/iu
  ]);
  for (const pattern of staleStagePatterns) {
    if (pattern.test(input.line)) {
      pushStaleSourceIdentityIssue({
        ...input,
        ruleRef: "abg://gtl-program/source-identity/stale-stage-label",
        message: `stale ABG migration or stage label matched ${pattern}`
      });
    }
  }
}

function checkSourceIdentities(input: {
  readonly sourceIdentitySurfaces: readonly GtlProgramSourceIdentityRow[];
  readonly abiPackageVersion: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  for (const surface of input.sourceIdentitySurfaces) {
    scanStaleIdentityLine({
      line: surface.surfaceRef,
      surfaceRef: surface.surfaceRef,
      lineNumber: 0,
      abiPackageVersion: input.abiPackageVersion,
      evidenceRefs: freezeStrings(surface.evidenceRefs),
      issues: input.issues
    });
    const lines = surface.text.split(/\r?\n/u);
    lines.forEach((line, index) => {
      scanStaleIdentityLine({
        line,
        surfaceRef: surface.surfaceRef,
        lineNumber: index + 1,
        abiPackageVersion: input.abiPackageVersion,
        evidenceRefs: freezeStrings(surface.evidenceRefs),
        issues: input.issues
      });
    });
  }
}

function pushRowIssue(input: {
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly message: string;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  input.issues.push(
    issue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.surfaceRef,
      ruleRef: input.ruleRef,
      message: input.message,
      evidenceRefs: input.evidenceRefs
    })
  );
}

function checkUniqueRows(
  input: {
    readonly rows: readonly { readonly ref: string }[];
    readonly surfaceKind: GtlProgramConformanceSurfaceKind;
    readonly ruleRef: string;
    readonly label: string;
    readonly issues: GtlProgramConformanceIssue[];
  }
): void {
  const seen = new Set<string>();
  for (const row of input.rows) {
    if (seen.has(row.ref)) {
      pushRowIssue({
        surfaceKind: input.surfaceKind,
        surfaceRef: row.ref,
        ruleRef: input.ruleRef,
        message: `${input.label} ${JSON.stringify(row.ref)} is declared more than once`,
        issues: input.issues
      });
    }
    seen.add(row.ref);
  }
}

function checkDigestField(input: {
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly fieldName: string;
  readonly value: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (!input.value.startsWith("sha256:")) {
    pushRowIssue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.surfaceRef,
      ruleRef: input.ruleRef,
      message: `${input.fieldName} must be a sha256: digest`,
      issues: input.issues
    });
  }
}

function checkNonEmptyArray(input: {
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly ruleRef: string;
  readonly fieldName: string;
  readonly values: readonly string[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (input.values.length === 0) {
    pushRowIssue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.surfaceRef,
      ruleRef: input.ruleRef,
      message: `${input.fieldName} must contain at least one ref`,
      issues: input.issues
    });
  }
}

function moduleArrayEntryCount(
  modules: readonly Module[],
  key:
    | "candidateFamilies"
    | "evaluators"
    | "jobs"
    | "operators"
    | "refinementBoundaries"
    | "roles"
    | "rules"
): number {
  return modules.reduce((count, module) => {
    switch (key) {
      case "candidateFamilies":
        return count + module.candidateFamilies.length;
      case "evaluators":
        return count + module.evaluators.length;
      case "jobs":
        return count + module.jobs.length;
      case "operators":
        return count + module.operators.length;
      case "refinementBoundaries":
        return count + module.refinementBoundaries.length;
      case "roles":
        return count + module.roles.length;
      case "rules":
        return count + module.rules.length;
    }
  }, 0);
}

function modulePolicyHookCount(modules: readonly Module[]): number {
  return modules.reduce((count, module) => count + module.policyHooks.entries.length, 0);
}

function moduleJobPolicyHookCount(modules: readonly Module[]): number {
  return modules.reduce(
    (count, module) =>
      count +
      module.jobs.reduce(
        (jobCount, job) => jobCount + job.policyHooks.entries.length,
        0
      ),
    0
  );
}

function moduleRolePolicyHookCount(modules: readonly Module[]): number {
  return modules.reduce(
    (count, module) =>
      count +
      module.roles.reduce(
        (roleCount, role) => roleCount + role.policyHooks.entries.length,
        0
      ),
    0
  );
}

function moduleHasPolicyHookKey(
  modules: readonly Module[],
  key: string
): boolean {
  return modules.some((module) =>
    module.policyHooks.entries.some((entry) => entry.key === key) ||
    module.jobs.some((job) =>
      job.policyHooks.entries.some((entry) => entry.key === key)
    ) ||
    module.roles.some((role) =>
      role.policyHooks.entries.some((entry) => entry.key === key)
    )
  );
}

function hostRefs(input: {
  readonly graphFunctions: readonly GraphFunction[];
  readonly modules: readonly Module[];
  readonly vectors: readonly GraphVectorProjection[];
}): ReadonlySet<string> {
  const refs = new Set<string>(["visible_defaults"]);
  for (const graphFunction of input.graphFunctions) {
    refs.add(graphFunction.name);
    refs.add(graphFunction.id);
  }
  for (const vector of input.vectors) {
    refs.add(vector.vectorRef);
    refs.add(vector.graphVectorId);
    refs.add(graphVectorIdentityRef(vector));
  }
  for (const module of input.modules) {
    refs.add(module.name);
    for (const job of module.jobs) {
      refs.add(job.name);
      refs.add(job.id);
    }
    for (const role of module.roles) {
      refs.add(role.name);
      refs.add(role.id);
    }
    for (const operator of module.operators) {
      refs.add(operator.name);
    }
    for (const evaluator of module.evaluators) {
      refs.add(evaluator.name);
    }
    for (const rule of module.rules) {
      refs.add(rule.name);
    }
    for (const refinementBoundary of module.refinementBoundaries) {
      refs.add(refinementBoundary.name);
      refs.add(refinementBoundary.id);
    }
    for (const candidateFamily of module.candidateFamilies) {
      refs.add(candidateFamily.name);
      refs.add(candidateFamily.id);
    }
  }
  return refs;
}

function pluginContractRefs(pluginContracts: readonly unknown[]): ReadonlySet<string> {
  const refs = new Set<string>();
  for (const contract of pluginContracts) {
    if (
      typeof contract === "object" &&
      contract !== null &&
      "ref" in contract &&
      typeof contract.ref === "string"
    ) {
      refs.add(contract.ref);
    }
  }
  return refs;
}

function checkHostRef(input: {
  readonly hostRef: string;
  readonly hostKind: GtlProgramHostSurfaceKind;
  readonly knownHostRefs: ReadonlySet<string>;
  readonly surfaceKind: GtlProgramConformanceSurfaceKind;
  readonly surfaceRef: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (
    input.hostKind !== "visible_defaults" &&
    input.hostKind !== "external_tool" &&
    !input.knownHostRefs.has(input.hostRef)
  ) {
    pushRowIssue({
      surfaceKind: input.surfaceKind,
      surfaceRef: input.surfaceRef,
      ruleRef: "abg://gtl-program/declaration/host-ref-resolves",
      message: `hostRef ${JSON.stringify(input.hostRef)} does not resolve to supplied GTL program inventory`,
      issues: input.issues
    });
  }
}

function checkDeclarationRows(input: {
  readonly operatorDeclarations: readonly GtlProgramOperatorDeclarationRow[];
  readonly evaluatorDeclarations: readonly GtlProgramEvaluatorDeclarationRow[];
  readonly ruleDeclarations: readonly GtlProgramRuleDeclarationRow[];
  readonly knownHostRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.operatorDeclarations.map((row) => ({ ref: row.operatorRef })),
    surfaceKind: "operator_declaration",
    ruleRef: "abg://gtl-program/operator-declaration/unique-ref",
    label: "operator declaration",
    issues: input.issues
  });
  for (const row of input.operatorDeclarations) {
    checkHostRef({
      hostRef: row.hostRef,
      hostKind: row.hostKind,
      knownHostRefs: input.knownHostRefs,
      surfaceKind: "operator_declaration",
      surfaceRef: row.operatorRef,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "operator_declaration",
      surfaceRef: row.operatorRef,
      ruleRef: "abg://gtl-program/operator-declaration/tag-refs",
      fieldName: "tagRefs",
      values: row.tagRefs,
      issues: input.issues
    });
  }

  checkUniqueRows({
    rows: input.evaluatorDeclarations.map((row) => ({ ref: row.evaluatorRef })),
    surfaceKind: "evaluator_declaration",
    ruleRef: "abg://gtl-program/evaluator-declaration/unique-ref",
    label: "evaluator declaration",
    issues: input.issues
  });
  for (const row of input.evaluatorDeclarations) {
    checkHostRef({
      hostRef: row.hostRef,
      hostKind: row.hostKind,
      knownHostRefs: input.knownHostRefs,
      surfaceKind: "evaluator_declaration",
      surfaceRef: row.evaluatorRef,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "evaluator_declaration",
      surfaceRef: row.evaluatorRef,
      ruleRef: "abg://gtl-program/evaluator-declaration/tag-refs",
      fieldName: "tagRefs",
      values: row.tagRefs,
      issues: input.issues
    });
  }

  checkUniqueRows({
    rows: input.ruleDeclarations.map((row) => ({ ref: row.ruleRef })),
    surfaceKind: "rule_declaration",
    ruleRef: "abg://gtl-program/rule-declaration/unique-ref",
    label: "rule declaration",
    issues: input.issues
  });
  for (const row of input.ruleDeclarations) {
    checkHostRef({
      hostRef: row.hostRef,
      hostKind: row.hostKind,
      knownHostRefs: input.knownHostRefs,
      surfaceKind: "rule_declaration",
      surfaceRef: row.ruleRef,
      issues: input.issues
    });
    checkDigestField({
      surfaceKind: "rule_declaration",
      surfaceRef: row.ruleRef,
      ruleRef: "abg://gtl-program/rule-declaration/config-digest",
      fieldName: "configDigest",
      value: row.configDigest,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "rule_declaration",
      surfaceRef: row.ruleRef,
      ruleRef: "abg://gtl-program/rule-declaration/tag-refs",
      fieldName: "tagRefs",
      values: row.tagRefs,
      issues: input.issues
    });
  }
}

function checkComputeCompositionRows(input: {
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly knownHostRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.computeCompositions.map((row) => ({ ref: row.compositionRef })),
    surfaceKind: "compute_composition",
    ruleRef: "abg://gtl-program/compute-composition/unique-ref",
    label: "compute composition",
    issues: input.issues
  });
  for (const row of input.computeCompositions) {
    checkHostRef({
      hostRef: row.hostRef,
      hostKind: row.hostKind,
      knownHostRefs: input.knownHostRefs,
      surfaceKind: "compute_composition",
      surfaceRef: row.compositionRef,
      issues: input.issues
    });
    checkDigestField({
      surfaceKind: "compute_composition",
      surfaceRef: row.compositionRef,
      ruleRef: "abg://gtl-program/compute-composition/digest",
      fieldName: "compositionDigest",
      value: row.compositionDigest,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "compute_composition",
      surfaceRef: row.compositionRef,
      ruleRef: "abg://gtl-program/compute-composition/regime-bindings",
      fieldName: "regimeBindingRefs",
      values: row.regimeBindingRefs,
      issues: input.issues
    });
    for (const requiredNotation of ["fn<", "transform.C", "evaluate.C", "consequence.C"]) {
      if (!row.notationRefs.some((ref) => ref.includes(requiredNotation))) {
        pushRowIssue({
          surfaceKind: "compute_composition",
          surfaceRef: row.compositionRef,
          ruleRef: "abg://gtl-program/compute-composition/notation-ref",
          message: `notationRefs must include ${requiredNotation}`,
          issues: input.issues
        });
      }
    }
    for (const requiredStage of ["transform", "evaluate", "consequence"]) {
      if (!row.stageBindingRefs.some((ref) => ref.includes(requiredStage))) {
        pushRowIssue({
          surfaceKind: "compute_composition",
          surfaceRef: row.compositionRef,
          ruleRef: "abg://gtl-program/compute-composition/stage-binding",
          message: `stageBindingRefs must include ${requiredStage}.C`,
          issues: input.issues
        });
      }
    }
  }
}

function stageBindingRefs(
  computeStageBindings: readonly GtlProgramComputeStageBindingRow[]
): ReadonlySet<string> {
  return new Set(
    computeStageBindings.map((row) => row.stageBindingRef)
  );
}

function checkStageRegimeDispositions(input: {
  readonly row: GtlProgramComputeStageBindingRow;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const byRegime = new Map<Regime, GtlProgramStageRegimeDispositionRow[]>();
  for (const disposition of input.row.regimeDispositions) {
    byRegime.set(disposition.regime, [
      ...(byRegime.get(disposition.regime) ?? []),
      disposition
    ]);
  }
  for (const regime of ["F_D", "F_P", "F_H"] as const) {
    const rows = byRegime.get(regime) ?? [];
    if (rows.length === 0) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: input.row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/regime-disposition-required",
        message: `stage ${input.row.stageBindingRef} must declare ${regime} participation, not_used, or external_callout disposition`,
        issues: input.issues
      });
      continue;
    }
    if (rows.length > 1) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: input.row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/regime-disposition-unique",
        message: `stage ${input.row.stageBindingRef} has ${rows.length} ${regime} dispositions`,
        issues: input.issues
      });
    }
    const row = rows[0]!;
    if (
      row.disposition === "participates" &&
      row.selectedRegimeBindingRefs.length === 0
    ) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: input.row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/participating-regime-binding",
        message: `${regime} participates in ${input.row.stageBindingRef} without selectedRegimeBindingRefs`,
        issues: input.issues
      });
    }
    if (
      (row.disposition === "not_used" ||
        row.disposition === "external_callout") &&
      row.reasonRefs.length === 0
    ) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: input.row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/nonparticipation-reason",
        message: `${regime} ${row.disposition} in ${input.row.stageBindingRef} without reasonRefs`,
        issues: input.issues
      });
    }
  }
}

function checkComputeStageBindingRows(input: {
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
  readonly pluginContractRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.computeStageBindings.map((row) => ({
      ref: row.stageBindingRef
    })),
    surfaceKind: "compute_stage_binding",
    ruleRef: "abg://gtl-program/compute-stage/unique-ref",
    label: "compute stage binding",
    issues: input.issues
  });

  const compositionsByRef = new Map<string, GtlProgramComputeCompositionRow>();
  for (const row of input.computeCompositions) {
    compositionsByRef.set(row.compositionRef, row);
  }
  const stagesByRef = stageBindingRefs(input.computeStageBindings);
  for (const composition of input.computeCompositions) {
    for (const stageBindingRef of composition.stageBindingRefs) {
      if (!stagesByRef.has(stageBindingRef)) {
        pushRowIssue({
          surfaceKind: "compute_composition",
          surfaceRef: composition.compositionRef,
          ruleRef: "abg://gtl-program/compute-composition/stage-binding-resolves",
          message: `stageBindingRef ${JSON.stringify(stageBindingRef)} does not resolve to a supplied computeStageBindings row`,
          issues: input.issues
        });
      }
    }
    for (const requiredStage of ["transform", "evaluate", "consequence"] as const) {
      const hasStage = input.computeStageBindings.some(
        (row) =>
          row.compositionRef === composition.compositionRef &&
          row.stageRole === requiredStage
      );
      if (!hasStage) {
        pushRowIssue({
          surfaceKind: "compute_composition",
          surfaceRef: composition.compositionRef,
          ruleRef: "abg://gtl-program/compute-composition/required-stage-row",
          message: `${composition.compositionRef} must supply a ${requiredStage}.C computeStageBindings row`,
          issues: input.issues
        });
      }
    }
  }

  for (const row of input.computeStageBindings) {
    const composition = compositionsByRef.get(row.compositionRef);
    if (composition === undefined) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/composition-resolves",
        message: `compositionRef ${JSON.stringify(row.compositionRef)} does not resolve to a supplied computeCompositions row`,
        issues: input.issues
      });
    } else {
      if (composition.compositionDigest !== row.compositionDigest) {
        pushRowIssue({
          surfaceKind: "compute_stage_binding",
          surfaceRef: row.stageBindingRef,
          ruleRef: "abg://gtl-program/compute-stage/composition-digest",
          message: `compositionDigest for ${row.stageBindingRef} must match ${composition.compositionRef}`,
          issues: input.issues
        });
      }
      if (!composition.stageBindingRefs.includes(row.stageBindingRef)) {
        pushRowIssue({
          surfaceKind: "compute_stage_binding",
          surfaceRef: row.stageBindingRef,
          ruleRef: "abg://gtl-program/compute-stage/composition-stage-membership",
          message: `${row.stageBindingRef} is not listed by ${composition.compositionRef}.stageBindingRefs`,
          issues: input.issues
        });
      }
    }
    if (
      row.stageRole !== "human_callout" &&
      !row.stageNotationRef.includes(`${row.stageRole}.C`)
    ) {
      pushRowIssue({
        surfaceKind: "compute_stage_binding",
        surfaceRef: row.stageBindingRef,
        ruleRef: "abg://gtl-program/compute-stage/notation-ref",
        message: `stageNotationRef for ${row.stageBindingRef} must include ${row.stageRole}.C`,
        issues: input.issues
      });
    }
    checkNonEmptyArray({
      surfaceKind: "compute_stage_binding",
      surfaceRef: row.stageBindingRef,
      ruleRef: "abg://gtl-program/compute-stage/input-carriers",
      fieldName: "inputCarrierRefs",
      values: row.inputCarrierRefs,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "compute_stage_binding",
      surfaceRef: row.stageBindingRef,
      ruleRef: "abg://gtl-program/compute-stage/output-carriers",
      fieldName: "outputCarrierRefs",
      values: row.outputCarrierRefs,
      issues: input.issues
    });
    for (const predecessorRef of row.predecessorStageBindingRefs) {
      if (!stagesByRef.has(predecessorRef)) {
        pushRowIssue({
          surfaceKind: "compute_stage_binding",
          surfaceRef: row.stageBindingRef,
          ruleRef: "abg://gtl-program/compute-stage/predecessor-resolves",
          message: `predecessorStageBindingRef ${JSON.stringify(predecessorRef)} does not resolve to a supplied computeStageBindings row`,
          issues: input.issues
        });
      }
    }
    for (const pluginRef of row.pluginContractRefs) {
      if (!input.pluginContractRefs.has(pluginRef)) {
        pushRowIssue({
          surfaceKind: "compute_stage_binding",
          surfaceRef: row.stageBindingRef,
          ruleRef: "abg://gtl-program/compute-stage/plugin-contract-resolves",
          message: `pluginContractRef ${JSON.stringify(pluginRef)} does not resolve to a supplied plugin contract`,
          issues: input.issues
        });
      }
    }
    checkStageRegimeDispositions({ row, issues: input.issues });
  }
}

function checkHookBoundaryRows(input: {
  readonly hookBoundaries: readonly GtlProgramHookBoundaryRow[];
  readonly knownHostRefs: ReadonlySet<string>;
  readonly pluginContractRefs: ReadonlySet<string>;
  readonly stageBoundPluginRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.hookBoundaries.map((row) => ({
      ref: `${row.hostRef}:${row.hookKey}:${row.hookRef}`
    })),
    surfaceKind: "hook_boundary",
    ruleRef: "abg://gtl-program/hook-boundary/unique-host-hook",
    label: "hook boundary",
    issues: input.issues
  });
  for (const row of input.hookBoundaries) {
    checkHostRef({
      hostRef: row.hostRef,
      hostKind: row.hostKind,
      knownHostRefs: input.knownHostRefs,
      surfaceKind: "hook_boundary",
      surfaceRef: row.hookRef,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "hook_boundary",
      surfaceRef: row.hookRef,
      ruleRef: "abg://gtl-program/hook-boundary/concern-refs",
      fieldName: "concernRefs",
      values: row.concernRefs,
      issues: input.issues
    });
    for (const pluginRef of row.pluginContractRefs) {
      if (!input.pluginContractRefs.has(pluginRef)) {
        pushRowIssue({
          surfaceKind: "hook_boundary",
          surfaceRef: row.hookRef,
          ruleRef: "abg://gtl-program/hook-boundary/plugin-contract-resolves",
          message: `pluginContractRef ${JSON.stringify(pluginRef)} does not resolve to a supplied plugin contract`,
          issues: input.issues
        });
      }
      if (!input.stageBoundPluginRefs.has(pluginRef)) {
        pushRowIssue({
          surfaceKind: "hook_boundary",
          surfaceRef: row.hookRef,
          ruleRef: "abg://gtl-program/hook-boundary/plugin-stage-binding-resolves",
          message: `pluginContractRef ${JSON.stringify(pluginRef)} is not bound by a supplied computeStageBindings row`,
          issues: input.issues
        });
      }
    }
  }
}

function pluginRefsBoundByStages(
  rows: readonly GtlProgramComputeStageBindingRow[]
): ReadonlySet<string> {
  const refs = new Set<string>();
  for (const row of rows) {
    for (const pluginRef of row.pluginContractRefs) {
      refs.add(pluginRef);
    }
  }
  return refs;
}

function pluginRefsBoundByRuntime(
  rows: readonly GtlProgramRuntimeBindingRow[]
): ReadonlySet<string> {
  const refs = new Set<string>();
  for (const row of rows) {
    for (const pluginRef of row.pluginContractRefs) {
      refs.add(pluginRef);
    }
  }
  return refs;
}

function checkRuntimeBindingRows(input: {
  readonly runtimeBindings: readonly GtlProgramRuntimeBindingRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly modules: readonly Module[];
  readonly pluginContractRefs: ReadonlySet<string>;
  readonly computeStageBindingRefs: ReadonlySet<string>;
  readonly pluginRefsBoundByStages: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.runtimeBindings.map((row) => ({ ref: row.bindingRef })),
    surfaceKind: "runtime_binding",
    ruleRef: "abg://gtl-program/runtime-binding/unique-ref",
    label: "runtime binding",
    issues: input.issues
  });

  const moduleRefs = new Set(input.modules.flatMap((module) => [module.name]));
  const publicStartRefs = new Set(
    input.publicStartTargets.flatMap((row) => [row.name, row.graphFunctionRef])
  );
  for (const row of input.runtimeBindings) {
    if (!moduleRefs.has(row.moduleRef)) {
      pushRowIssue({
        surfaceKind: "runtime_binding",
        surfaceRef: row.bindingRef,
        ruleRef: "abg://gtl-program/runtime-binding/module-ref-resolves",
        message: `moduleRef ${JSON.stringify(row.moduleRef)} does not resolve to a supplied module`,
        issues: input.issues
      });
    }
    if (!publicStartRefs.has(row.publicStartRef)) {
      pushRowIssue({
        surfaceKind: "runtime_binding",
        surfaceRef: row.bindingRef,
        ruleRef: "abg://gtl-program/runtime-binding/public-start-ref-resolves",
        message: `publicStartRef ${JSON.stringify(row.publicStartRef)} does not resolve to a supplied public start target`,
        issues: input.issues
      });
    }
    for (const pluginRef of row.pluginContractRefs) {
      if (!input.pluginContractRefs.has(pluginRef)) {
        pushRowIssue({
          surfaceKind: "runtime_binding",
          surfaceRef: row.bindingRef,
          ruleRef: "abg://gtl-program/runtime-binding/plugin-contract-resolves",
          message: `pluginContractRef ${JSON.stringify(pluginRef)} does not resolve to a supplied plugin contract`,
          issues: input.issues
        });
      }
      if (!input.pluginRefsBoundByStages.has(pluginRef)) {
        pushRowIssue({
          surfaceKind: "runtime_binding",
          surfaceRef: row.bindingRef,
          ruleRef: "abg://gtl-program/runtime-binding/plugin-stage-binding-resolves",
          message: `pluginContractRef ${JSON.stringify(pluginRef)} is not bound to a supplied compute stage`,
          issues: input.issues
        });
      }
    }
    for (const stageBindingRef of row.stageBindingRefs) {
      if (!input.computeStageBindingRefs.has(stageBindingRef)) {
        pushRowIssue({
          surfaceKind: "runtime_binding",
          surfaceRef: row.bindingRef,
          ruleRef: "abg://gtl-program/runtime-binding/stage-binding-resolves",
          message: `stageBindingRef ${JSON.stringify(stageBindingRef)} does not resolve to a supplied compute stage`,
          issues: input.issues
        });
      }
    }
  }

  const runtimeBoundPluginRefs = pluginRefsBoundByRuntime(input.runtimeBindings);
  for (const pluginRef of input.pluginContractRefs) {
    if (!input.pluginRefsBoundByStages.has(pluginRef)) {
      pushRowIssue({
        surfaceKind: "plugin_contract",
        surfaceRef: pluginRef,
        ruleRef: "abg://gtl-program/plugin-contract/stage-binding-required",
        message: `plugin contract ${JSON.stringify(pluginRef)} is not bound by any computeStageBindings row`,
        issues: input.issues
      });
    }
    if (!runtimeBoundPluginRefs.has(pluginRef)) {
      pushRowIssue({
        surfaceKind: "plugin_contract",
        surfaceRef: pluginRef,
        ruleRef: "abg://gtl-program/plugin-contract/runtime-binding-required",
        message: `plugin contract ${JSON.stringify(pluginRef)} is not consumed by any ABG runtime binding row`,
        issues: input.issues
      });
    }
  }
}

function checkRuntimeReentryRouteRows(input: {
  readonly runtimeReentryRoutes: readonly GtlProgramRuntimeReentryRouteRow[];
  readonly vectors: readonly GraphVectorProjection[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.runtimeReentryRoutes.map((row) => ({ ref: row.routeRef })),
    surfaceKind: "runtime_reentry_route",
    ruleRef: "abg://gtl-program/runtime-reentry/unique-ref",
    label: "runtime re-entry route",
    issues: input.issues
  });

  for (const row of input.runtimeReentryRoutes) {
    if (row.repairSurfaceDisposition !== "upstream_reentry") {
      pushRowIssue({
        surfaceKind: "runtime_reentry_route",
        surfaceRef: row.routeRef,
        ruleRef: "abg://gtl-program/runtime-reentry/upstream-disposition",
        message: "runtime re-entry routes must be classified as upstream_reentry",
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
    }
    checkNonEmptyArray({
      surfaceKind: "runtime_reentry_route",
      surfaceRef: row.routeRef,
      ruleRef: "abg://gtl-program/runtime-reentry/lawful-basis",
      fieldName: "lawfulBasisRefs",
      values: row.lawfulBasisRefs,
      issues: input.issues
    });
    for (const requiredRef of [
      "REQ-R-ABG3-ITERATION-009",
      "REQ-R-ABG3-FPC-004B"
    ]) {
      if (!row.lawfulBasisRefs.includes(requiredRef)) {
        pushRowIssue({
          surfaceKind: "runtime_reentry_route",
          surfaceRef: row.routeRef,
          ruleRef: "abg://gtl-program/runtime-reentry/lawful-basis",
          message: `runtime re-entry route must cite ${requiredRef}`,
          evidenceRefs: row.evidenceRefs,
          issues: input.issues
        });
      }
    }

    const graphVectors = input.vectors.filter(
      (vector) =>
        vector.graphFunctionId === row.repairGraphFunctionId &&
        vector.graphId === row.repairGraphId
    );
    const targetVector = graphVectors[row.reentryTargetVectorIndex] ?? null;
    if (targetVector === null) {
      pushRowIssue({
        surfaceKind: "runtime_reentry_route",
        surfaceRef: row.routeRef,
        ruleRef: "abg://gtl-program/runtime-reentry/target-vector-index-resolves",
        message: `reentryTargetVectorIndex ${row.reentryTargetVectorIndex} does not resolve in graph function ${JSON.stringify(row.repairGraphFunctionRef)}`,
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
      continue;
    }

    if (
      targetVector.graphFunctionRef !== row.repairGraphFunctionRef ||
      targetVector.vectorRef !== row.repairGraphVectorRef ||
      targetVector.graphFunctionId !== row.repairGraphFunctionId ||
      targetVector.graphId !== row.repairGraphId ||
      targetVector.graphVectorId !== row.repairGraphVectorId
    ) {
      pushRowIssue({
        surfaceKind: "runtime_reentry_route",
        surfaceRef: row.routeRef,
        ruleRef: "abg://gtl-program/runtime-reentry/absolute-target-identity",
        message: `runtime re-entry route ${JSON.stringify(row.routeRef)} must resolve to the absolute target graph/vector identity at reentryTargetVectorIndex`,
        evidenceRefs: row.evidenceRefs,
        issues: input.issues
      });
    }
  }
}

function checkSelectionBoundaryRows(input: {
  readonly selectionBoundaries: readonly GtlProgramSelectionBoundaryRow[];
  readonly knownHostRefs: ReadonlySet<string>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.selectionBoundaries.map((row) => ({ ref: row.boundaryRef })),
    surfaceKind: "selection_boundary",
    ruleRef: "abg://gtl-program/selection-boundary/unique-ref",
    label: "selection boundary",
    issues: input.issues
  });
  for (const row of input.selectionBoundaries) {
    if (!input.knownHostRefs.has(row.hostRef)) {
      pushRowIssue({
        surfaceKind: "selection_boundary",
        surfaceRef: row.boundaryRef,
        ruleRef: "abg://gtl-program/selection-boundary/host-ref-resolves",
        message: `hostRef ${JSON.stringify(row.hostRef)} does not resolve to supplied GTL inventory`,
        issues: input.issues
      });
    }
    checkNonEmptyArray({
      surfaceKind: "selection_boundary",
      surfaceRef: row.boundaryRef,
      ruleRef: "abg://gtl-program/selection-boundary/input-contracts",
      fieldName: "inputContractRefs",
      values: row.inputContractRefs,
      issues: input.issues
    });
    checkNonEmptyArray({
      surfaceKind: "selection_boundary",
      surfaceRef: row.boundaryRef,
      ruleRef: "abg://gtl-program/selection-boundary/output-contracts",
      fieldName: "outputContractRefs",
      values: row.outputContractRefs,
      issues: input.issues
    });
    if (
      (row.boundaryKind === "candidate_family" ||
        row.boundaryKind === "synthesis") &&
      row.candidateRefs.length === 0
    ) {
      pushRowIssue({
        surfaceKind: "selection_boundary",
        surfaceRef: row.boundaryRef,
        ruleRef: "abg://gtl-program/selection-boundary/candidate-refs",
        message: `${row.boundaryKind} rows require candidateRefs`,
        issues: input.issues
      });
    }
  }
}

function checkWorkBindingRows(input: {
  readonly jobBindings: readonly GtlProgramJobBindingRow[];
  readonly roleBindings: readonly GtlProgramRoleBindingRow[];
  readonly graphFunctionRefs: ReadonlySet<string>;
  readonly modules: readonly Module[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const knownRoles = new Set<string>();
  const knownJobs = new Set<string>();
  for (const module of input.modules) {
    for (const role of module.roles) {
      knownRoles.add(role.name);
      knownRoles.add(role.id);
    }
    for (const job of module.jobs) {
      knownJobs.add(job.name);
      knownJobs.add(job.id);
    }
  }

  checkUniqueRows({
    rows: input.jobBindings.map((row) => ({ ref: row.jobRef })),
    surfaceKind: "job_binding",
    ruleRef: "abg://gtl-program/job-binding/unique-ref",
    label: "job binding",
    issues: input.issues
  });
  for (const row of input.jobBindings) {
    if (!knownJobs.has(row.jobRef)) {
      pushRowIssue({
        surfaceKind: "job_binding",
        surfaceRef: row.jobRef,
        ruleRef: "abg://gtl-program/job-binding/job-ref-resolves",
        message: `jobRef ${JSON.stringify(row.jobRef)} does not resolve to a supplied GTL Job`,
        issues: input.issues
      });
    }
    for (const graphFunctionRef of [
      ...row.contractTargetRefs,
      ...row.publicCallableGraphFunctionRefs
    ]) {
      if (!input.graphFunctionRefs.has(graphFunctionRef)) {
        pushRowIssue({
          surfaceKind: "job_binding",
          surfaceRef: row.jobRef,
          ruleRef: "abg://gtl-program/job-binding/graph-function-resolves",
          message: `graph function ref ${JSON.stringify(graphFunctionRef)} does not resolve to a published GraphFunction`,
          issues: input.issues
        });
      }
    }
    for (const roleRef of row.roleRefs) {
      if (!knownRoles.has(roleRef)) {
        pushRowIssue({
          surfaceKind: "job_binding",
          surfaceRef: row.jobRef,
          ruleRef: "abg://gtl-program/job-binding/role-ref-resolves",
          message: `roleRef ${JSON.stringify(roleRef)} does not resolve to a supplied GTL Role`,
          issues: input.issues
        });
      }
    }
  }

  checkUniqueRows({
    rows: input.roleBindings.map((row) => ({ ref: row.roleRef })),
    surfaceKind: "role_binding",
    ruleRef: "abg://gtl-program/role-binding/unique-ref",
    label: "role binding",
    issues: input.issues
  });
  for (const row of input.roleBindings) {
    if (!knownRoles.has(row.roleRef)) {
      pushRowIssue({
        surfaceKind: "role_binding",
        surfaceRef: row.roleRef,
        ruleRef: "abg://gtl-program/role-binding/role-ref-resolves",
        message: `roleRef ${JSON.stringify(row.roleRef)} does not resolve to a supplied GTL Role`,
        issues: input.issues
      });
    }
    checkNonEmptyArray({
      surfaceKind: "role_binding",
      surfaceRef: row.roleRef,
      ruleRef: "abg://gtl-program/role-binding/capability-refs",
      fieldName: "capabilityRefs",
      values: row.capabilityRefs,
      issues: input.issues
    });
  }
}

function checkSameObjectRows(input: {
  readonly sameObjectProofs: readonly GtlProgramSameObjectRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.sameObjectProofs.map((row) => ({ ref: row.proofRef })),
    surfaceKind: "same_object",
    ruleRef: "abg://gtl-program/same-object/unique-proof-ref",
    label: "same_object proof",
    issues: input.issues
  });
  for (const row of input.sameObjectProofs) {
    checkDigestField({
      surfaceKind: "same_object",
      surfaceRef: row.proofRef,
      ruleRef: "abg://gtl-program/same-object/equality-digest",
      fieldName: "equalityDigest",
      value: row.equalityDigest,
      issues: input.issues
    });
    if (row.leftRef === row.rightRef) {
      pushRowIssue({
        surfaceKind: "same_object",
        surfaceRef: row.proofRef,
        ruleRef: "abg://gtl-program/same-object/nontrivial-proof",
        message: "leftRef and rightRef must be distinct refs bound by the equality digest",
        issues: input.issues
      });
    }
  }
}

function checkExternalToolGateRows(input: {
  readonly externalToolGates: readonly GtlProgramExternalToolGateRow[];
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  checkUniqueRows({
    rows: input.externalToolGates.map((row) => ({ ref: row.toolGateRef })),
    surfaceKind: "external_tool_gate",
    ruleRef: "abg://gtl-program/external-tool-gate/unique-ref",
    label: "external tool gate",
    issues: input.issues
  });
  for (const row of input.externalToolGates) {
    if (!row.transportRef.startsWith("transport://")) {
      pushRowIssue({
        surfaceKind: "external_tool_gate",
        surfaceRef: row.toolGateRef,
        ruleRef: "abg://gtl-program/external-tool-gate/transport-ref",
        message: "transportRef must be a transport:// ref",
        issues: input.issues
      });
    }
    if (!row.admissionRef.startsWith("admission://")) {
      pushRowIssue({
        surfaceKind: "external_tool_gate",
        surfaceRef: row.toolGateRef,
        ruleRef: "abg://gtl-program/external-tool-gate/admission-ref",
        message: "admissionRef must be an admission:// ref",
        issues: input.issues
      });
    }
    checkNonEmptyArray({
      surfaceKind: "external_tool_gate",
      surfaceRef: row.toolGateRef,
      ruleRef: "abg://gtl-program/external-tool-gate/not-language-truth",
      fieldName: "notLanguageTruthEvidenceRefs",
      values: row.notLanguageTruthEvidenceRefs,
      issues: input.issues
    });
  }
}

const EXACT_PACKAGE_VERSION_PATTERN =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?$/u;

function checkAbiPackageVersion(input: {
  readonly subjectRef: string;
  readonly abiPackageVersion: string;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (!EXACT_PACKAGE_VERSION_PATTERN.test(input.abiPackageVersion)) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/version/exact-package-version",
        message: "abiPackageVersion must be an exact package version"
      })
    );
  }
}

type CoverageKey =
  keyof GtlProgramExpectedCoverage & keyof GtlProgramConformanceCoverage;

const COVERAGE_KEYS: readonly CoverageKey[] = Object.freeze([
  "catalogGraphFunctionCount",
  "publishedGraphFunctionCount",
  "graphVectorCount",
  "targetCarrierContractCount",
  "edgeClosureContractCount",
  "overlayCount",
  "publicStartTargetCount",
  "promptAssetCount",
  "pluginContractCount",
  "sourceIdentitySurfaceCount"
]);

function checkExpectedCoverage(input: {
  readonly subjectRef: string;
  readonly expectedCoverage: GtlProgramExpectedCoverage | undefined;
  readonly coverage: GtlProgramConformanceCoverage;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  if (input.expectedCoverage === undefined) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/coverage/expected-coverage-required",
        message: "GTL program typecheck requires explicit expectedCoverage"
      })
    );
    return;
  }

  let declaredExpectationCount = 0;
  for (const key of COVERAGE_KEYS) {
    const expected = input.expectedCoverage[key];
    if (expected === undefined) {
      continue;
    }
    declaredExpectationCount += 1;
    if (!Number.isInteger(expected) || expected < 0) {
      input.issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: input.subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-admitted",
          message: `expectedCoverage.${key} must be a non-negative integer`
        })
      );
      continue;
    }
    if (expected === 0) {
      input.issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: input.subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count-nonzero",
          message: `expectedCoverage.${key} must be greater than zero for a complete GTL program scope`
        })
      );
    }
    if (input.coverage[key] !== expected) {
      input.issues.push(
        issue({
          surfaceKind: "program_inventory",
          surfaceRef: input.subjectRef,
          ruleRef: "abg://gtl-program/coverage/expected-count",
          message: `expectedCoverage.${key} expected ${expected}, observed ${input.coverage[key]}`
        })
      );
    }
  }

  if (declaredExpectationCount === 0) {
    input.issues.push(
      issue({
        surfaceKind: "program_inventory",
        surfaceRef: input.subjectRef,
        ruleRef: "abg://gtl-program/coverage/expected-coverage-nonempty",
        message: "expectedCoverage must declare at least one surface count"
      })
    );
  }
}

const FEATURE_KINDS_WITH_DETERMINISTIC_OBSERVATION =
  new Set<GtlProgramT153FeatureKind>([
    "graph_structure_interface",
    "graph_algebra_edge",
    "graph_algebra_compose",
    "graph_algebra_substitute",
    "graph_algebra_recurse",
    "graph_algebra_fan_out",
    "graph_algebra_fan_in",
    "graph_algebra_gate",
    "graph_algebra_promote",
    "graph_algebra_identity",
    "graph_algebra_same_object",
    "operator_declarations",
    "evaluator_declarations",
    "rule_declarations",
    "f_star_compute_composition",
    "hook_boundaries",
    "target_carrier_contract_law",
    "edge_closure_contract_law",
    "prompt_typed_asset_law",
    "selection_refinement_synthesis_subwork",
    "module_publication",
    "public_start_binding",
    "job_binding",
    "role_binding",
    "external_tool_gates",
    "active_source_identity"
  ]);

function graphFunctionDeclarationHasKey(
  graphFunction: GraphFunction,
  key: string
): boolean {
  return graphFunction.declarations.entries.some((entry) => entry.key === key);
}

function graphFunctionTemplateRefStartsWith(
  graphFunction: GraphFunction,
  prefix: string
): boolean {
  return graphFunction.template.ref.startsWith(prefix);
}

function graphFunctionNameStartsWith(
  graphFunction: GraphFunction,
  prefix: string
): boolean {
  return graphFunction.name.startsWith(prefix);
}

function moduleGraphTagStartsWith(
  modules: readonly Module[],
  prefix: string
): boolean {
  return modules.some((module) =>
    module.graphs.some((graph) =>
      graph.tags.some((tag) => tag.startsWith(prefix))
    )
  );
}

function observedFeatureKinds(input: {
  readonly graphFunctions: readonly GraphFunction[];
  readonly modules: readonly Module[];
  readonly vectors: readonly GraphVectorProjection[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly edgeClosureContracts: readonly GtlProgramEdgeClosureRow[];
  readonly promptAssets: readonly GtlProgramPromptAssetRow[];
  readonly sourceIdentitySurfaces: readonly GtlProgramSourceIdentityRow[];
  readonly sameObjectProofs: readonly GtlProgramSameObjectRow[];
  readonly operatorDeclarations: readonly GtlProgramOperatorDeclarationRow[];
  readonly evaluatorDeclarations: readonly GtlProgramEvaluatorDeclarationRow[];
  readonly ruleDeclarations: readonly GtlProgramRuleDeclarationRow[];
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
  readonly hookBoundaries: readonly GtlProgramHookBoundaryRow[];
  readonly selectionBoundaries: readonly GtlProgramSelectionBoundaryRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly jobBindings: readonly GtlProgramJobBindingRow[];
  readonly roleBindings: readonly GtlProgramRoleBindingRow[];
  readonly externalToolGates: readonly GtlProgramExternalToolGateRow[];
  readonly runtimeBindings: readonly GtlProgramRuntimeBindingRow[];
  readonly runtimeReentryRoutes: readonly GtlProgramRuntimeReentryRouteRow[];
}): ReadonlySet<GtlProgramT153FeatureKind> {
  const observed = new Set<GtlProgramT153FeatureKind>();
  if (input.graphFunctions.length > 0 && input.vectors.length > 0) {
    observed.add("graph_structure_interface");
    observed.add("graph_algebra_edge");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionTemplateRefStartsWith(graphFunction, "compose:")
    )
  ) {
    observed.add("graph_algebra_compose");
  }
  if (moduleGraphTagStartsWith(input.modules, "substituted:")) {
    observed.add("graph_algebra_substitute");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionDeclarationHasKey(graphFunction, "recursion") ||
      graphFunctionNameStartsWith(graphFunction, "recurse(")
    )
  ) {
    observed.add("graph_algebra_recurse");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionNameStartsWith(graphFunction, "fan_out(")
    )
  ) {
    observed.add("graph_algebra_fan_out");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionNameStartsWith(graphFunction, "fan_in(")
    )
  ) {
    observed.add("graph_algebra_fan_in");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionDeclarationHasKey(graphFunction, "gate") ||
      graphFunctionNameStartsWith(graphFunction, "gate(")
    )
  ) {
    observed.add("graph_algebra_gate");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionTemplateRefStartsWith(graphFunction, "promote:") ||
      graphFunctionNameStartsWith(graphFunction, "promote(")
    )
  ) {
    observed.add("graph_algebra_promote");
  }
  if (
    input.graphFunctions.some((graphFunction) =>
      graphFunctionNameStartsWith(graphFunction, "identity:")
    )
  ) {
    observed.add("graph_algebra_identity");
  }
  if (input.sameObjectProofs.length > 0) {
    observed.add("graph_algebra_same_object");
  }
  if (
    input.operatorDeclarations.length > 0 ||
    input.vectors.some((vector) => vector.operatorCount > 0) ||
    moduleArrayEntryCount(input.modules, "operators") > 0
  ) {
    observed.add("operator_declarations");
  }
  if (
    input.evaluatorDeclarations.length > 0 ||
    input.vectors.some((vector) => vector.evaluatorCount > 0) ||
    moduleArrayEntryCount(input.modules, "evaluators") > 0
  ) {
    observed.add("evaluator_declarations");
  }
  if (
    input.ruleDeclarations.length > 0 ||
    input.vectors.some((vector) => vector.hasRule) ||
    moduleArrayEntryCount(input.modules, "rules") > 0
  ) {
    observed.add("rule_declarations");
  }
  if (
    input.computeCompositions.length > 0 ||
    input.computeStageBindings.length > 0 ||
    input.vectors.some((vector) =>
      vector.declarationKeyRefs.includes("abg.fn_composition")
    ) ||
    input.graphFunctions.some((graphFunction) =>
      graphFunctionDeclarationHasKey(graphFunction, "abg.fn_composition")
    ) ||
    moduleHasPolicyHookKey(input.modules, "abg.fn_composition")
  ) {
    observed.add("f_star_compute_composition");
  }
  if (
    input.hookBoundaries.length > 0 ||
    input.vectors.some((vector) => vector.declarationKeyRefs.length > 0) ||
    input.graphFunctions.some(
      (graphFunction) => graphFunction.declarations.entries.length > 0
    ) ||
    modulePolicyHookCount(input.modules) > 0 ||
    moduleJobPolicyHookCount(input.modules) > 0 ||
    moduleRolePolicyHookCount(input.modules) > 0
  ) {
    observed.add("hook_boundaries");
  }
  if (input.targetCarrierContracts.length > 0) {
    observed.add("target_carrier_contract_law");
  }
  if (input.edgeClosureContracts.length > 0) {
    observed.add("edge_closure_contract_law");
  }
  if (input.promptAssets.length > 0) {
    observed.add("prompt_typed_asset_law");
  }
  if (
    input.selectionBoundaries.length > 0 ||
    input.vectors.some((vector) => vector.allowsSubwork) ||
    moduleArrayEntryCount(input.modules, "refinementBoundaries") > 0 ||
    moduleArrayEntryCount(input.modules, "candidateFamilies") > 0
  ) {
    observed.add("selection_refinement_synthesis_subwork");
  }
  if (input.modules.length > 0) {
    observed.add("module_publication");
  }
  if (input.publicStartTargets.length > 0) {
    observed.add("public_start_binding");
  }
  if (
    input.jobBindings.length > 0 ||
    moduleArrayEntryCount(input.modules, "jobs") > 0
  ) {
    observed.add("job_binding");
  }
  if (
    input.roleBindings.length > 0 ||
    moduleArrayEntryCount(input.modules, "roles") > 0
  ) {
    observed.add("role_binding");
  }
  if (input.externalToolGates.length > 0) {
    observed.add("external_tool_gates");
  }
  if (input.sourceIdentitySurfaces.length > 0) {
    observed.add("active_source_identity");
  }
  return observed;
}

function inventoryBackedFeatureKinds(input: {
  readonly graphFunctions: readonly GraphFunction[];
  readonly modules: readonly Module[];
  readonly vectors: readonly GraphVectorProjection[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly edgeClosureContracts: readonly GtlProgramEdgeClosureRow[];
  readonly promptAssets: readonly GtlProgramPromptAssetRow[];
  readonly sourceIdentitySurfaces: readonly GtlProgramSourceIdentityRow[];
  readonly sameObjectProofs: readonly GtlProgramSameObjectRow[];
  readonly operatorDeclarations: readonly GtlProgramOperatorDeclarationRow[];
  readonly evaluatorDeclarations: readonly GtlProgramEvaluatorDeclarationRow[];
  readonly ruleDeclarations: readonly GtlProgramRuleDeclarationRow[];
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
  readonly hookBoundaries: readonly GtlProgramHookBoundaryRow[];
  readonly selectionBoundaries: readonly GtlProgramSelectionBoundaryRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly jobBindings: readonly GtlProgramJobBindingRow[];
  readonly roleBindings: readonly GtlProgramRoleBindingRow[];
  readonly externalToolGates: readonly GtlProgramExternalToolGateRow[];
  readonly runtimeBindings: readonly GtlProgramRuntimeBindingRow[];
  readonly runtimeReentryRoutes: readonly GtlProgramRuntimeReentryRouteRow[];
}): ReadonlySet<GtlProgramT153FeatureKind> {
  const backed = new Set<GtlProgramT153FeatureKind>();
  if (input.graphFunctions.length > 0 && input.vectors.length > 0) {
    backed.add("graph_structure_interface");
    backed.add("graph_algebra_edge");
  }
  const algebraObserved = observedFeatureKinds(input);
  for (const featureKind of [
    "graph_algebra_compose",
    "graph_algebra_substitute",
    "graph_algebra_recurse",
    "graph_algebra_fan_out",
    "graph_algebra_fan_in",
    "graph_algebra_gate",
    "graph_algebra_promote",
    "graph_algebra_identity"
  ] as const) {
    if (algebraObserved.has(featureKind)) {
      backed.add(featureKind);
    }
  }
  if (input.sameObjectProofs.length > 0) {
    backed.add("graph_algebra_same_object");
  }
  if (input.operatorDeclarations.length > 0) {
    backed.add("operator_declarations");
  }
  if (input.evaluatorDeclarations.length > 0) {
    backed.add("evaluator_declarations");
  }
  if (input.ruleDeclarations.length > 0) {
    backed.add("rule_declarations");
  }
  if (
    input.computeCompositions.length > 0 &&
    input.computeStageBindings.length > 0
  ) {
    backed.add("f_star_compute_composition");
  }
  if (input.hookBoundaries.length > 0) {
    backed.add("hook_boundaries");
  }
  if (input.targetCarrierContracts.length > 0) {
    backed.add("target_carrier_contract_law");
  }
  if (input.edgeClosureContracts.length > 0) {
    backed.add("edge_closure_contract_law");
  }
  if (input.promptAssets.length > 0) {
    backed.add("prompt_typed_asset_law");
  }
  if (input.selectionBoundaries.length > 0) {
    backed.add("selection_refinement_synthesis_subwork");
  }
  if (input.modules.length > 0) {
    backed.add("module_publication");
  }
  if (input.publicStartTargets.length > 0 && input.runtimeBindings.length > 0) {
    backed.add("public_start_binding");
  }
  if (input.jobBindings.length > 0) {
    backed.add("job_binding");
  }
  if (input.roleBindings.length > 0) {
    backed.add("role_binding");
  }
  if (input.externalToolGates.length > 0) {
    backed.add("external_tool_gates");
  }
  if (input.sourceIdentitySurfaces.length > 0) {
    backed.add("active_source_identity");
  }
  return backed;
}

function checkFeatureCoverage(input: {
  readonly subjectRef: string;
  readonly manifest: GtlProgramFeatureCoverageManifest;
  readonly observedFeatures: ReadonlySet<GtlProgramT153FeatureKind>;
  readonly inventoryBackedFeatures: ReadonlySet<GtlProgramT153FeatureKind>;
  readonly issues: GtlProgramConformanceIssue[];
}): void {
  const byFeature = new Map<GtlProgramT153FeatureKind, GtlProgramFeatureCoverageRow[]>();
  for (const row of input.manifest.rows) {
    byFeature.set(row.featureKind, [
      ...(byFeature.get(row.featureKind) ?? []),
      row
    ]);
  }
  for (const featureKind of GTL_PROGRAM_T153_FEATURE_KINDS) {
    const rows = byFeature.get(featureKind) ?? [];
    if (rows.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: input.manifest.manifestRef,
          ruleRef: "abg://gtl-program/feature-coverage/t153-feature-required",
          message: `featureCoverageManifest must classify T-153 feature ${featureKind}`
        })
      );
      continue;
    }
    if (rows.length > 1) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: input.manifest.manifestRef,
          ruleRef: "abg://gtl-program/feature-coverage/unique-feature-row",
          message: `featureCoverageManifest has ${rows.length} rows for ${featureKind}`
        })
      );
    }
    const row = rows[0]!;
    const requiredRefs = T153_FEATURE_DEFAULT_REQUIREMENT_REFS[featureKind];
    const suppliedRefs = new Set(row.requirementRefs);
    const missingRefs = requiredRefs.filter((ref) => !suppliedRefs.has(ref));
    if (missingRefs.length > 0) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: featureKind,
          ruleRef: "abg://gtl-program/feature-coverage/requirement-trace",
          message: `${featureKind} missing requirement refs ${missingRefs.join(", ")}`
        })
      );
    }
    if (row.disposition === "present" && row.evidenceRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: featureKind,
          ruleRef: "abg://gtl-program/feature-coverage/present-evidence",
          message: `${featureKind} marked present without evidenceRefs`
        })
      );
    }
    if (row.disposition === "not_used" && row.reasonRefs.length === 0) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: featureKind,
          ruleRef: "abg://gtl-program/feature-coverage/not-used-reason",
          message: `${featureKind} marked not_used without reasonRefs`
        })
      );
    }
    if (
      row.disposition === "not_used" &&
      FEATURE_KINDS_WITH_DETERMINISTIC_OBSERVATION.has(featureKind) &&
      input.observedFeatures.has(featureKind)
    ) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: featureKind,
          ruleRef: "abg://gtl-program/feature-coverage/not-used-contradiction",
          message: `${featureKind} marked not_used but matching inventory rows are present`
        })
      );
    }
    if (
      row.disposition === "present" &&
      FEATURE_KINDS_WITH_DETERMINISTIC_OBSERVATION.has(featureKind) &&
      !input.inventoryBackedFeatures.has(featureKind)
    ) {
      input.issues.push(
        issue({
          surfaceKind: "feature_coverage",
          surfaceRef: featureKind,
          ruleRef: "abg://gtl-program/feature-coverage/present-without-inventory",
          message: `${featureKind} marked present but no matching inventory rows were supplied`
        })
      );
    }
  }
}

function sourceIdentityDigestRows(
  rows: readonly GtlProgramSourceIdentityRow[]
): readonly {
  readonly surfaceRef: string;
  readonly textDigest: string;
  readonly evidenceRefs: readonly string[];
}[] {
  return Object.freeze(
    rows.map((row) =>
      Object.freeze({
        surfaceRef: row.surfaceRef,
        textDigest: stableSha256Digest(row.text),
        evidenceRefs: freezeStrings(row.evidenceRefs)
      })
    )
  );
}

function computeInventoryDigests(input: {
  readonly featureCoverageManifest: GtlProgramFeatureCoverageManifest;
  readonly catalogGraphFunctionRefs: readonly string[];
  readonly graphFunctions: readonly GraphFunction[];
  readonly modules: readonly Module[];
  readonly vectors: readonly GraphVectorProjection[];
  readonly targetCarrierContracts: readonly GtlProgramTargetCarrierRow[];
  readonly edgeClosureContracts: readonly GtlProgramEdgeClosureRow[];
  readonly overlays: readonly GtlProgramOverlayRow[];
  readonly publicStartTargets: readonly GtlProgramPublicStartRow[];
  readonly promptAssets: readonly GtlProgramPromptAssetRow[];
  readonly pluginContracts: readonly unknown[];
  readonly sourceIdentitySurfaces: readonly GtlProgramSourceIdentityRow[];
  readonly sameObjectProofs: readonly GtlProgramSameObjectRow[];
  readonly operatorDeclarations: readonly GtlProgramOperatorDeclarationRow[];
  readonly evaluatorDeclarations: readonly GtlProgramEvaluatorDeclarationRow[];
  readonly ruleDeclarations: readonly GtlProgramRuleDeclarationRow[];
  readonly computeCompositions: readonly GtlProgramComputeCompositionRow[];
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
  readonly hookBoundaries: readonly GtlProgramHookBoundaryRow[];
  readonly selectionBoundaries: readonly GtlProgramSelectionBoundaryRow[];
  readonly jobBindings: readonly GtlProgramJobBindingRow[];
  readonly roleBindings: readonly GtlProgramRoleBindingRow[];
  readonly externalToolGates: readonly GtlProgramExternalToolGateRow[];
  readonly runtimeBindings: readonly GtlProgramRuntimeBindingRow[];
  readonly runtimeReentryRoutes: readonly GtlProgramRuntimeReentryRouteRow[];
}): GtlProgramInventoryDigests {
  return Object.freeze({
    featureCoverageManifest: stableSha256Digest(input.featureCoverageManifest),
    catalogGraphFunctionRefs: stableSha256Digest(input.catalogGraphFunctionRefs),
    graphFunctions: stableSha256Digest(input.graphFunctions),
    modules: stableSha256Digest(input.modules),
    materializedVectors: stableSha256Digest(input.vectors),
    targetCarrierContracts: stableSha256Digest(input.targetCarrierContracts),
    edgeClosureContracts: stableSha256Digest(input.edgeClosureContracts),
    overlays: stableSha256Digest(input.overlays),
    publicStartTargets: stableSha256Digest(input.publicStartTargets),
    promptAssets: stableSha256Digest(input.promptAssets),
    pluginContracts: stableSha256Digest(input.pluginContracts),
    sourceIdentitySurfaces: stableSha256Digest(
      sourceIdentityDigestRows(input.sourceIdentitySurfaces)
    ),
    sameObjectProofs: stableSha256Digest(input.sameObjectProofs),
    operatorDeclarations: stableSha256Digest(input.operatorDeclarations),
    evaluatorDeclarations: stableSha256Digest(input.evaluatorDeclarations),
    ruleDeclarations: stableSha256Digest(input.ruleDeclarations),
    computeCompositions: stableSha256Digest(input.computeCompositions),
    computeStageBindings: stableSha256Digest(input.computeStageBindings),
    hookBoundaries: stableSha256Digest(input.hookBoundaries),
    selectionBoundaries: stableSha256Digest(input.selectionBoundaries),
    jobBindings: stableSha256Digest(input.jobBindings),
    roleBindings: stableSha256Digest(input.roleBindings),
    externalToolGates: stableSha256Digest(input.externalToolGates),
    runtimeBindings: stableSha256Digest(input.runtimeBindings),
    runtimeReentryRoutes: stableSha256Digest(input.runtimeReentryRoutes)
  });
}

export function typecheckGtlProgram(inputCandidate: unknown): GtlProgramConformanceReport {
  const admission = admitGtlProgramConformanceInput(inputCandidate);
  const input = admission.input;
  const issues: GtlProgramConformanceIssue[] = [...admission.issues];
  checkAbiPackageVersion({
    subjectRef: input.subjectRef,
    abiPackageVersion: input.abiPackageVersion,
    issues
  });
  const graphFunctions = collectPublishedGraphFunctions(input, issues);
  const publishedGraphFunctionRefs = new Set(
    graphFunctions.map((graphFunction) => graphFunction.name)
  );
  const catalogGraphFunctionRefs = uniqueSorted(input.catalogGraphFunctionRefs ?? []);
  const modules = Object.freeze([...(input.modules ?? [])]);

  if (catalogGraphFunctionRefs.length > 0) {
    checkCatalogPublication({
      catalogGraphFunctionRefs,
      publishedGraphFunctionRefs,
      issues
    });
  }

  const vectors = materializeGraphVectors(graphFunctions, issues);
  checkAllowedConsequenceTraversalDeclarations({
    graphFunctions,
    issues
  });
  const graphVectorRefs = new Set(vectors.map((vector) => vector.vectorRef));
  const targetCarrierContracts = Object.freeze([
    ...(input.targetCarrierContracts ?? [])
  ]);
  const edgeClosureContracts = Object.freeze([
    ...(input.edgeClosureContracts ?? [])
  ]);
  const overlays = Object.freeze([...(input.overlays ?? [])]);
  const publicStartTargets = Object.freeze([...(input.publicStartTargets ?? [])]);
  const promptAssets = Object.freeze([...(input.promptAssets ?? [])]);
  const pluginContracts = Object.freeze([...(input.pluginContracts ?? [])]);
  const sourceIdentitySurfaces = Object.freeze([
    ...(input.sourceIdentitySurfaces ?? [])
  ]);
  const sameObjectProofs = Object.freeze([...(input.sameObjectProofs ?? [])]);
  const operatorDeclarations = Object.freeze([
    ...(input.operatorDeclarations ?? [])
  ]);
  const evaluatorDeclarations = Object.freeze([
    ...(input.evaluatorDeclarations ?? [])
  ]);
  const ruleDeclarations = Object.freeze([...(input.ruleDeclarations ?? [])]);
  const computeCompositions = Object.freeze([
    ...(input.computeCompositions ?? [])
  ]);
  const computeStageBindings = Object.freeze([
    ...(input.computeStageBindings ?? [])
  ]);
  const hookBoundaries = Object.freeze([...(input.hookBoundaries ?? [])]);
  const selectionBoundaries = Object.freeze([
    ...(input.selectionBoundaries ?? [])
  ]);
  const jobBindings = Object.freeze([...(input.jobBindings ?? [])]);
  const roleBindings = Object.freeze([...(input.roleBindings ?? [])]);
  const externalToolGates = Object.freeze([
    ...(input.externalToolGates ?? [])
  ]);
  const runtimeBindings = Object.freeze([...(input.runtimeBindings ?? [])]);
  const runtimeReentryRoutes = Object.freeze([
    ...(input.runtimeReentryRoutes ?? [])
  ]);
  const featureCoverageManifest = input.featureCoverageManifest;
  const knownHostRefs = hostRefs({ graphFunctions, modules, vectors });
  const suppliedPluginContractRefs = pluginContractRefs(pluginContracts);
  const stageBoundPluginRefs = pluginRefsBoundByStages(computeStageBindings);
  const suppliedStageBindingRefs = stageBindingRefs(computeStageBindings);

  checkVectorRows({
    vectors,
    targetCarrierContracts,
    edgeClosureContracts,
    issues
  });
  checkOverlays({
    overlays,
    publicStartTargets,
    graphFunctionRefs: publishedGraphFunctionRefs,
    graphVectorRefs,
    issues
  });
  checkPromptAssets({
    promptAssets,
    abiPackageVersion: input.abiPackageVersion,
    issues
  });
  checkPluginContracts({
    pluginContracts,
    issues
  });
  checkSourceIdentities({
    sourceIdentitySurfaces,
    abiPackageVersion: input.abiPackageVersion,
    issues
  });
  checkSameObjectRows({
    sameObjectProofs,
    issues
  });
  checkDeclarationRows({
    operatorDeclarations,
    evaluatorDeclarations,
    ruleDeclarations,
    knownHostRefs,
    issues
  });
  checkComputeCompositionRows({
    computeCompositions,
    knownHostRefs,
    issues
  });
  checkComputeStageBindingRows({
    computeCompositions,
    computeStageBindings,
    pluginContractRefs: suppliedPluginContractRefs,
    issues
  });
  checkHookBoundaryRows({
    hookBoundaries,
    knownHostRefs,
    pluginContractRefs: suppliedPluginContractRefs,
    stageBoundPluginRefs,
    issues
  });
  checkSelectionBoundaryRows({
    selectionBoundaries,
    knownHostRefs,
    issues
  });
  checkWorkBindingRows({
    jobBindings,
    roleBindings,
    graphFunctionRefs: publishedGraphFunctionRefs,
    modules,
    issues
  });
  checkExternalToolGateRows({
    externalToolGates,
    issues
  });
  checkRuntimeBindingRows({
    runtimeBindings,
    publicStartTargets,
    modules,
    pluginContractRefs: suppliedPluginContractRefs,
    computeStageBindingRefs: suppliedStageBindingRefs,
    pluginRefsBoundByStages: stageBoundPluginRefs,
    issues
  });
  checkRuntimeReentryRouteRows({
    runtimeReentryRoutes,
    vectors,
    issues
  });
  checkFeatureCoverage({
    subjectRef: input.subjectRef,
    manifest: featureCoverageManifest,
    observedFeatures: observedFeatureKinds({
      graphFunctions,
      modules,
      vectors,
      targetCarrierContracts,
      edgeClosureContracts,
      promptAssets,
      sourceIdentitySurfaces,
      sameObjectProofs,
      operatorDeclarations,
      evaluatorDeclarations,
      ruleDeclarations,
      computeCompositions,
      computeStageBindings,
      hookBoundaries,
      selectionBoundaries,
      publicStartTargets,
      jobBindings,
      roleBindings,
      externalToolGates,
      runtimeBindings,
      runtimeReentryRoutes
    }),
    inventoryBackedFeatures: inventoryBackedFeatureKinds({
      graphFunctions,
      modules,
      vectors,
      targetCarrierContracts,
      edgeClosureContracts,
      promptAssets,
      sourceIdentitySurfaces,
      sameObjectProofs,
      operatorDeclarations,
      evaluatorDeclarations,
      ruleDeclarations,
      computeCompositions,
      computeStageBindings,
      hookBoundaries,
      selectionBoundaries,
      publicStartTargets,
      jobBindings,
      roleBindings,
      externalToolGates,
      runtimeBindings,
      runtimeReentryRoutes
    }),
    issues
  });

  const coverage = Object.freeze({
    catalogGraphFunctionCount: catalogGraphFunctionRefs.length,
    publishedGraphFunctionCount: publishedGraphFunctionRefs.size,
    graphVectorCount: vectors.length,
    targetCarrierContractCount: targetCarrierContracts.length,
    edgeClosureContractCount: edgeClosureContracts.length,
    overlayCount: overlays.length,
    publicStartTargetCount: publicStartTargets.length,
    promptAssetCount: promptAssets.length,
    pluginContractCount: pluginContracts.length,
    sourceIdentitySurfaceCount: sourceIdentitySurfaces.length
  });
  checkExpectedCoverage({
    subjectRef: input.subjectRef,
    expectedCoverage: input.expectedCoverage,
    coverage,
    issues
  });
  const inventoryDigests = computeInventoryDigests({
    featureCoverageManifest,
    catalogGraphFunctionRefs,
    graphFunctions,
    modules,
    vectors,
    targetCarrierContracts,
    edgeClosureContracts,
    overlays,
    publicStartTargets,
    promptAssets,
    pluginContracts,
    sourceIdentitySurfaces,
    sameObjectProofs,
    operatorDeclarations,
    evaluatorDeclarations,
    ruleDeclarations,
    computeCompositions,
    computeStageBindings,
    hookBoundaries,
    selectionBoundaries,
    jobBindings,
    roleBindings,
    externalToolGates,
    runtimeBindings,
    runtimeReentryRoutes
  });
  const inventoryDigest = stableSha256Digest(inventoryDigests);
  const frozenIssues = Object.freeze([...issues]);
  const reportBasis = Object.freeze({
    subjectRef: input.subjectRef,
    abiPackageVersion: input.abiPackageVersion,
    expectedCoverage: input.expectedCoverage ?? null,
    coverage,
    inventoryDigest,
    inventoryDigests,
    issues: frozenIssues
  });
  return Object.freeze({
    kind: "gtl_program_conformance_report",
    reportRef: `abg://gtl-program-conformance-report/${stableSha256Digest(reportBasis)}`,
    subjectRef: input.subjectRef,
    abiPackageVersion: input.abiPackageVersion,
    inventoryDigest,
    inventoryDigests,
    passed: frozenIssues.length === 0,
    issueCount: frozenIssues.length,
    issues: frozenIssues,
    coverage,
    featureCoverageManifest
  });
}

export function formatGtlProgramConformanceIssues(
  issues: readonly GtlProgramConformanceIssue[]
): string {
  if (issues.length === 0) {
    return "none";
  }
  return issues
    .map(
      (entry) =>
        `${entry.severity} ${entry.ruleRef} ${entry.surfaceKind}:${entry.surfaceRef} - ${entry.message}`
    )
    .join("\n");
}
