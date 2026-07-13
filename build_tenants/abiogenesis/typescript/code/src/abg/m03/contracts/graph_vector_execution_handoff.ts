// Implements: T-255; REQ-L-GTL3-C-ALGEBRA-011/-014/-016;
// REQ-R-ABG3-FN-COMP-003/-006/-007; REQ-R-ABG3-INTERPRET-010/-023;
// REQ-M-GTL3-CAPABILITY-001..015.

import {
  interfaceContract,
  materializeGraphFunction,
  nodeContractKey,
  type GraphFunction,
  type GraphVector
} from "../../../gtl/m01/contracts/carriers.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import {
  resolveTargetCarrierContractBinding,
  type GtlTargetCarrierDefaultsBundle,
  type TargetCarrierContractBinding
} from "../../../gtl/m01/contracts/target_carrier_contract.js";
import {
  cInterfaceContractRef,
  admitCProgramSyntax,
  type CAlgebraDiagnostic,
  type CProgramDeclarationNode
} from "../../../gtl/m01/algebra/c_algebra.js";
import { stableJsonEquals, stableSha256Digest } from "../../../shared/runtime_identity.js";
import { compileCAlgebraToHog } from "./c_algebra_hog_compiler.js";
import {
  isHogBatchProgram,
  isHogWorkflowProgram,
  type HogProgramDeclaration
} from "./hog_program.js";
import {
  compileWorkflowLiftBinding,
  type CompiledWorkflowLiftBinding
} from "./workflow_c.js";
import {
  compileGraphVectorCProgramSelection,
  type CompiledGraphVectorCProgramBinding,
  type GraphVectorBoundaryProjection,
  type GraphVectorCProgramDiagnostic
} from "./graph_vector_c_program_compiler.js";
import {
  compileGraphFunctionApplication,
  type CompiledFanInApplicationRelation,
  type GraphFunctionApplicationLineageProjection,
  type ProvisionalDerivedCompositionBinding
} from "./graph_function_application_compiler.js";
import {
  abgFnCompositionDeclarationRef,
  resolveAbgFnCompositionSelection,
  type AbgFnCompositionSelection
} from "./fn_composition.js";
import {
  type GtlProgramEdgeClosureRow,
  type GtlProgramTargetCarrierRow,
  typecheckGtlProgramVectorContracts
} from "./gtl_program_conformance.js";
import type {
  AdmittedTenantConformanceManifest,
  ResolvedTenantCapabilityClaim,
  TenantConformanceDigest
} from "../../../shared/abg_library/tenant_conformance_manifest.js";

export const GRAPH_VECTOR_EXECUTION_HANDOFF_DIAGNOSTIC_ID_VALUES = Object.freeze([
  "gtl-execution-handoff-vector-boundary-invalid",
  "gtl-execution-handoff-program-selection-invalid",
  "gtl-execution-handoff-program-shape-invalid",
  "gtl-execution-handoff-successor-constructor-blocked",
  "gtl-execution-handoff-application-lineage-invalid",
  "gtl-execution-handoff-composition-invalid",
  "gtl-execution-handoff-composition-owner-mismatch",
  "gtl-execution-handoff-target-carrier-invalid",
  "gtl-execution-handoff-capability-manifest-missing",
  "gtl-execution-handoff-capability-manifest-incompatible",
  "gtl-execution-handoff-traversal-conservation-blocked"
] as const);

export type GraphVectorExecutionHandoffDiagnosticId =
  (typeof GRAPH_VECTOR_EXECUTION_HANDOFF_DIAGNOSTIC_ID_VALUES)[number];

export type GraphVectorExecutionHandoffRepairAffordance =
  | "correct_reference"
  | "correct_field_shape"
  | "add_missing_declaration"
  | "complete_successor_constructor"
  | "correct_composition_owner"
  | "admit_target_carrier_defaults"
  | "publish_tenant_conformance_manifest"
  | "repair_tenant_capability_coverage"
  | "close_traversal_contract";

export interface GraphVectorExecutionHandoffDiagnostic {
  readonly kind: "graph_vector_execution_handoff_diagnostic";
  readonly classification: "invalid_program" | "semantic_not_realized";
  readonly diagnosticId: GraphVectorExecutionHandoffDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
  readonly repairAffordance: GraphVectorExecutionHandoffRepairAffordance;
}

export type CompiledGraphVectorTargetCarrierProjection =
  GtlProgramTargetCarrierRow;

export interface CompiledGraphVectorEdgeClosureBinding {
  readonly kind: "compiled_graph_vector_edge_closure_binding";
  readonly edgeRef: string;
  readonly graphFunctionId: string;
  readonly graphId: string;
  readonly graphVectorId: string;
  readonly targetAssetType: string;
  readonly targetNodeContractKey: string;
  readonly targetCarrierContractRef: string;
  readonly targetCarrierContractDigest: string;
  readonly materializationPolicyRef: string;
  readonly edgeAssuranceBindingRef: string;
  readonly closurePreconditionRef: string;
  readonly compositionClosureContractRef: string | null;
  readonly conformanceRow: GtlProgramEdgeClosureRow;
  readonly bindingDigest: `sha256:${string}`;
}

export interface TenantCapabilityCoverageRow {
  readonly effectRef: string;
  readonly capabilityId: string;
  readonly supportedDisposition: "supported" | "unsupported";
  readonly owningContractClaimRef: string;
  readonly owningContractId: string;
  readonly owningContractVersion: string;
  readonly owningContractDigest: TenantConformanceDigest;
  readonly dependentCapabilityIds: readonly string[];
}

export interface TenantCapabilityCoverageProjection {
  readonly kind: "tenant_capability_coverage_projection";
  readonly manifestId: string;
  readonly manifestVersion: string;
  readonly manifestDigest: TenantConformanceDigest;
  readonly manifestAdmissionRef: string;
  readonly manifestAdmissionDigest: TenantConformanceDigest;
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly catalogDigest: TenantConformanceDigest;
  readonly requiredEffectRefs: readonly string[];
  readonly coverageRows: readonly TenantCapabilityCoverageRow[];
  readonly projectionDigest: TenantConformanceDigest;
}

export interface CapabilityCompatibilityAdmission {
  readonly kind: "capability_compatibility_admission";
  readonly disposition:
    | "not_applicable_no_effect_requirements"
    | "compatible_exact_manifest";
  readonly coverageProjection: TenantCapabilityCoverageProjection | null;
}

export interface TraversalStartupBlock {
  readonly kind: "graph_vector_traversal_startup_block";
  readonly status: "startup_blocked_awaiting_t267";
  readonly gapFamily: "traversal_execution_contracts";
  readonly runtimeAddressable: false;
  readonly effectsPermitted: false;
  readonly authorityRefs: readonly string[];
  readonly blockDigest: TenantConformanceDigest;
}

export interface CompiledGraphVectorExecutionHandoff {
  readonly kind: "compiled_graph_vector_execution_handoff";
  readonly handoffRef: string;
  readonly handoffDigest: `sha256:${string}`;
  readonly executionSubjectGraphFunctionRef: string;
  readonly declarationOwnerGraphFunctionRef: string;
  readonly graphRef: string;
  readonly graphVectorRef: string;
  readonly programDisposition:
    | "flat_executable"
    | "workflow_sub_traversal"
    | "batch_task_family";
  readonly programBinding: CompiledGraphVectorCProgramBinding;
  readonly admittedProgram: CProgramDeclarationNode;
  readonly normalizedProgram: HogProgramDeclaration;
  readonly workflowLiftBinding: CompiledWorkflowLiftBinding | null;
  readonly compositionSelection: AbgFnCompositionSelection;
  readonly applicationLineage: GraphFunctionApplicationLineageProjection | null;
  readonly fanInApplicationRelation: CompiledFanInApplicationRelation | null;
  readonly targetCarrierBinding: TargetCarrierContractBinding;
  readonly targetCarrierProjection: CompiledGraphVectorTargetCarrierProjection;
  readonly edgeClosureBinding: CompiledGraphVectorEdgeClosureBinding;
  readonly effectRequirementRefs: readonly string[];
  readonly capabilityCompatibility: CapabilityCompatibilityAdmission;
  readonly startupBlock: TraversalStartupBlock;
}

export interface GraphVectorExecutionHandoffPublished {
  readonly kind: "graph_vector_execution_handoff_outcome";
  readonly status: "published_startup_blocked";
  readonly boundary: GraphVectorBoundaryProjection;
  readonly handoff: CompiledGraphVectorExecutionHandoff;
  readonly diagnostics: readonly GraphVectorExecutionHandoffDiagnostic[];
}

export interface GraphVectorExecutionHandoffStructuralOnly {
  readonly kind: "graph_vector_execution_handoff_outcome";
  readonly status: "structural_only";
  readonly boundary: GraphVectorBoundaryProjection;
  readonly targetCarrierBinding: TargetCarrierContractBinding;
  readonly targetCarrierProjection: CompiledGraphVectorTargetCarrierProjection;
  readonly edgeClosureBinding: CompiledGraphVectorEdgeClosureBinding;
  readonly diagnostics: readonly GraphVectorExecutionHandoffDiagnostic[];
}

export interface GraphVectorExecutionHandoffBlocked {
  readonly kind: "graph_vector_execution_handoff_outcome";
  readonly status: "blocked_successor_constructor";
  readonly boundary: GraphVectorBoundaryProjection;
  readonly programBinding: CompiledGraphVectorCProgramBinding;
  readonly targetCarrierBinding: TargetCarrierContractBinding;
  readonly targetCarrierProjection: CompiledGraphVectorTargetCarrierProjection;
  readonly edgeClosureBinding: CompiledGraphVectorEdgeClosureBinding;
  readonly sourceDiagnostics: readonly CAlgebraDiagnostic[];
  readonly diagnostics: readonly GraphVectorExecutionHandoffDiagnostic[];
}

export interface GraphVectorExecutionHandoffCapabilityBlocked {
  readonly kind: "graph_vector_execution_handoff_outcome";
  readonly status: "blocked_capability";
  readonly boundary: GraphVectorBoundaryProjection;
  readonly programBinding: CompiledGraphVectorCProgramBinding;
  readonly programDisposition:
    | "flat_executable"
    | "workflow_sub_traversal"
    | "batch_task_family";
  readonly normalizedProgram: HogProgramDeclaration;
  readonly workflowLiftBinding: CompiledWorkflowLiftBinding | null;
  readonly compositionSelection: AbgFnCompositionSelection;
  readonly applicationLineage: GraphFunctionApplicationLineageProjection | null;
  readonly fanInApplicationRelation: CompiledFanInApplicationRelation | null;
  readonly targetCarrierBinding: TargetCarrierContractBinding;
  readonly targetCarrierProjection: CompiledGraphVectorTargetCarrierProjection;
  readonly edgeClosureBinding: CompiledGraphVectorEdgeClosureBinding;
  readonly admittedManifestRef: string | null;
  readonly diagnostics: readonly GraphVectorExecutionHandoffDiagnostic[];
}

export interface GraphVectorExecutionHandoffInvalid {
  readonly kind: "graph_vector_execution_handoff_outcome";
  readonly status: "invalid";
  readonly boundary: GraphVectorBoundaryProjection | null;
  readonly sourceDiagnostics: readonly (
    | CAlgebraDiagnostic
    | GraphVectorCProgramDiagnostic
  )[];
  readonly diagnostics: readonly GraphVectorExecutionHandoffDiagnostic[];
}

export type GraphVectorExecutionHandoffOutcome =
  | GraphVectorExecutionHandoffPublished
  | GraphVectorExecutionHandoffStructuralOnly
  | GraphVectorExecutionHandoffBlocked
  | GraphVectorExecutionHandoffCapabilityBlocked
  | GraphVectorExecutionHandoffInvalid;

export interface CompileGraphVectorExecutionHandoffInput {
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly graphFunctions: readonly GraphFunction[];
  readonly module: Module;
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
  readonly admittedTenantConformanceManifest:
    | AdmittedTenantConformanceManifest
    | null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function repairAffordance(
  diagnosticId: GraphVectorExecutionHandoffDiagnosticId
): GraphVectorExecutionHandoffRepairAffordance {
  switch (diagnosticId) {
    case "gtl-execution-handoff-program-selection-invalid":
    case "gtl-execution-handoff-vector-boundary-invalid":
      return "correct_reference";
    case "gtl-execution-handoff-program-shape-invalid":
      return "correct_field_shape";
    case "gtl-execution-handoff-successor-constructor-blocked":
      return "complete_successor_constructor";
    case "gtl-execution-handoff-application-lineage-invalid":
    case "gtl-execution-handoff-composition-invalid":
      return "add_missing_declaration";
    case "gtl-execution-handoff-composition-owner-mismatch":
      return "correct_composition_owner";
    case "gtl-execution-handoff-target-carrier-invalid":
      return "admit_target_carrier_defaults";
    case "gtl-execution-handoff-capability-manifest-missing":
      return "publish_tenant_conformance_manifest";
    case "gtl-execution-handoff-capability-manifest-incompatible":
      return "repair_tenant_capability_coverage";
    case "gtl-execution-handoff-traversal-conservation-blocked":
      return "close_traversal_contract";
  }
}

function diagnostic(input: {
  readonly diagnosticId: GraphVectorExecutionHandoffDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
  readonly classification?: "invalid_program" | "semantic_not_realized";
}): GraphVectorExecutionHandoffDiagnostic {
  return Object.freeze({
    kind: "graph_vector_execution_handoff_diagnostic" as const,
    classification: input.classification ?? "invalid_program",
    diagnosticId: input.diagnosticId,
    path: input.path,
    expectedRelation: input.expectedRelation,
    actualRelation: input.actualRelation,
    evidenceRefs: Object.freeze([...input.evidenceRefs]),
    repairAffordance: repairAffordance(input.diagnosticId)
  });
}

function invalid(input: {
  readonly boundary?: GraphVectorBoundaryProjection | null | undefined;
  readonly sourceDiagnostics?: readonly (
    | CAlgebraDiagnostic
    | GraphVectorCProgramDiagnostic
  )[];
  readonly diagnostic: GraphVectorExecutionHandoffDiagnostic;
}): GraphVectorExecutionHandoffInvalid {
  return Object.freeze({
    kind: "graph_vector_execution_handoff_outcome" as const,
    status: "invalid" as const,
    boundary: input.boundary ?? null,
    sourceDiagnostics: Object.freeze([...(input.sourceDiagnostics ?? [])]),
    diagnostics: Object.freeze([input.diagnostic])
  });
}

function exactBoundary(input: {
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
}): GraphVectorBoundaryProjection {
  const graph = materializeGraphFunction(input.graphFunction);
  const matches = graph.vectors.filter(
    (candidate) => candidate.id === input.graphVector.id
  );
  if (matches.length !== 1 || !stableJsonEquals(matches[0], input.graphVector)) {
    throw new TypeError(
      `GraphVector ${input.graphVector.id} must occur exactly once and byte-equivalent in ${input.graphFunction.id}`
    );
  }
  return Object.freeze({
    hostGraphFunctionRef: input.graphFunction.id,
    graphRef: graph.id,
    graphVectorRef: input.graphVector.name,
    orderedSourceNodeContractKeys: interfaceContract(input.graphVector.source),
    targetNodeContractKey: nodeContractKey(input.graphVector.target),
    inputInterfaceCarrierRef: cInterfaceContractRef(input.graphVector.source),
    outputInterfaceCarrierRef: cInterfaceContractRef([
      input.graphVector.target
    ])
  });
}

function targetProjection(input: {
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly graphRef: string;
  readonly binding: TargetCarrierContractBinding;
}): CompiledGraphVectorTargetCarrierProjection {
  const targetAssetType = input.graphVector.target.assetSurface.kind;
  if (
    targetAssetType.length === 0 ||
    input.binding.outputCarrierKind !== targetAssetType
  ) {
    throw new TypeError(
      "target carrier output kind must equal the exact target asset-surface kind"
    );
  }
  const edgeRef = `edge://${stableSha256Digest({
    graphFunctionId: input.graphFunction.id,
    graphRef: input.graphRef,
    graphVectorId: input.graphVector.id,
    targetCarrierContractRef: input.binding.contractRef,
    targetCarrierContractDigest: input.binding.configDigest
  }).slice("sha256:".length)}`;
  const literalDomainRefs = Object.freeze([
    ...new Set([
      ...input.binding.literalDomainRefs,
      `kind:${input.binding.outputCarrierKind}`,
      `targetAssetType:${targetAssetType}`,
      `edgeRef:${edgeRef}`,
      `contractRef:${input.binding.contractRef}`
    ])
  ]);
  return Object.freeze({
    edgeRef,
    graphVectorRef: input.graphVector.name,
    graphFunctionId: input.graphFunction.id,
    graphId: input.graphRef,
    graphVectorId: input.graphVector.id,
    targetAssetType,
    targetCarrierContractRef: input.binding.contractRef,
    targetCarrierContractDigest: input.binding.configDigest,
    targetCarrierTemplateRef: input.binding.templateRef,
    outputSurfaceRef: input.binding.outputSurfaceRef,
    outputCarrierFamilyRef: input.binding.outputCarrierFamilyRef,
    outputCarrierKind: input.binding.outputCarrierKind,
    envelopeContractRef: input.binding.envelopeContractRef,
    nestedPayloadPath: input.binding.nestedPayloadPath,
    requiredFieldRefs: input.binding.requiredFieldRefs,
    optionalFieldRefs: input.binding.optionalFieldRefs,
    fixedProtocolFieldRefs: input.binding.fixedProtocolFieldRefs,
    workerFillableFieldRefs: input.binding.workerFillableFieldRefs,
    literalDomainRefs,
    enumDomainRefs: input.binding.enumDomainRefs,
    schemaRef: input.binding.schemaRef,
    admissionRef: input.binding.admissionRef,
    payloadLedgerBindingRef: input.binding.payloadLedgerBindingRef,
    edgeAssuranceBindingRef: input.binding.edgeAssuranceBindingRef,
    handoffProjectionRef: input.binding.handoffProjectionRef,
    constructionTemplateRef: input.binding.constructionTemplateRef,
    replayDigestPolicyRef: input.binding.replayDigestPolicyRef,
    materializationPolicyRef: input.binding.materializationPolicyRef,
    closurePreconditionRef: input.binding.closurePreconditionRef
  });
}

function edgeClosureBinding(input: {
  readonly boundary: GraphVectorBoundaryProjection;
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly target: CompiledGraphVectorTargetCarrierProjection;
  readonly composition: AbgFnCompositionSelection | null;
}): CompiledGraphVectorEdgeClosureBinding {
  const conformanceRow = Object.freeze({
    edgeRef: input.target.edgeRef,
    graphFunctionId: input.graphFunction.id,
    graphId: input.boundary.graphRef,
    graphVectorId: input.graphVector.id,
    targetAssetType: input.target.targetAssetType
  });
  const basis = Object.freeze({
    kind: "compiled_graph_vector_edge_closure_binding" as const,
    edgeRef: input.target.edgeRef,
    graphFunctionId: input.graphFunction.id,
    graphId: input.boundary.graphRef,
    graphVectorId: input.graphVector.id,
    targetAssetType: input.target.targetAssetType,
    targetNodeContractKey: input.boundary.targetNodeContractKey,
    targetCarrierContractRef: input.target.targetCarrierContractRef,
    targetCarrierContractDigest: input.target.targetCarrierContractDigest,
    materializationPolicyRef: input.target.materializationPolicyRef,
    edgeAssuranceBindingRef: input.target.edgeAssuranceBindingRef,
    closurePreconditionRef: input.target.closurePreconditionRef,
    compositionClosureContractRef:
      input.composition?.contract.closureContractRef ?? null,
    conformanceRow
  });
  return Object.freeze({
    ...basis,
    bindingDigest: stableSha256Digest(basis)
  });
}

function jobForGraphFunction(input: {
  readonly module: CompileGraphVectorExecutionHandoffInput["module"];
  readonly graphFunction: GraphFunction;
}) {
  const matches = input.module.jobs.filter((job) =>
    job.contracts.some(
      (contract) =>
        contract.kind === "graph_function" &&
        contract.targetId === input.graphFunction.id
    )
  );
  if (matches.length > 1) {
    throw new TypeError(
      `GraphFunction ${input.graphFunction.id} resolves to ${String(matches.length)} jobs`
    );
  }
  return matches[0] ?? null;
}

function directComposition(input: CompileGraphVectorExecutionHandoffInput) {
  const job = jobForGraphFunction(input);
  return resolveAbgFnCompositionSelection({
    vector: input.graphVector,
    graphFunction: input.graphFunction,
    job,
    roles: job?.roles ?? Object.freeze([]),
    module: {
      name: input.module.name,
      policyHooks: input.module.policyHooks
    }
  });
}

function ownerVector(input: {
  readonly owner: GraphFunction;
  readonly graphVectorRef: string;
}): GraphVector {
  const graph = materializeGraphFunction(input.owner);
  const matches = graph.vectors.filter(
    (vector) => vector.id === input.graphVectorRef
  );
  if (matches.length !== 1) {
    throw new TypeError(
      `application composition owner ${input.owner.id} has ${String(matches.length)} vectors for ${input.graphVectorRef}`
    );
  }
  return matches[0]!;
}

function exactProvisionalBinding(input: {
  readonly bindings: readonly ProvisionalDerivedCompositionBinding[];
  readonly graphVectorRef: string;
}): ProvisionalDerivedCompositionBinding {
  const vectorLocal = input.bindings.filter(
    (binding) => binding.declarationHostRef === input.graphVectorRef
  );
  if (vectorLocal.length === 1) return vectorLocal[0]!;
  const graphFunctionLocal = input.bindings.filter(
    (binding) => binding.compositionSource === "graph_function_declarations"
  );
  if (vectorLocal.length === 0 && graphFunctionLocal.length === 1) {
    return graphFunctionLocal[0]!;
  }
  throw new TypeError(
    `application lineage has ${String(vectorLocal.length)} vector-local and ${String(graphFunctionLocal.length)} GraphFunction-local composition candidates`
  );
}

function appliedComposition(input: {
  readonly compilation: ReturnType<typeof compileGraphFunctionApplication>;
  readonly graphVector: GraphVector;
  readonly graphFunctions: readonly GraphFunction[];
}): {
  readonly selection: AbgFnCompositionSelection;
  readonly declarationOwnerGraphFunctionRef: string;
  readonly lineage: GraphFunctionApplicationLineageProjection;
  readonly fanInRelation: CompiledFanInApplicationRelation | null;
} {
  const expectedDiagnostic = input.compilation.diagnostics[0];
  if (input.compilation.accepted) {
    if (
      input.compilation.diagnostics.length !== 0 ||
      input.compilation.fanInRelation === null
    ) {
      throw new TypeError(
        "accepted applied GraphFunction must carry one compiled fan-in relation and no diagnostics"
      );
    }
  } else if (
    input.compilation.diagnostics.length !== 1 ||
    expectedDiagnostic?.classification !== "semantic_not_realized" ||
    expectedDiagnostic.diagnosticId !== "gtl-application-runtime-not-realized" ||
    input.compilation.fanInRelation !== null
  ) {
    throw new TypeError(
      "unrealized applied GraphFunction must carry only the T-265 runtime-not-realized handoff diagnostic"
    );
  }
  if (input.compilation.lineage === null) {
    throw new TypeError("applied GraphFunction has no admitted application lineage");
  }
  const provisional = exactProvisionalBinding({
    bindings: input.compilation.provisionalBindings,
    graphVectorRef: input.graphVector.id
  });
  const owners = input.graphFunctions.filter(
    (candidate) => candidate.id === provisional.declarationOwnerGraphFunctionRef
  );
  if (owners.length !== 1) {
    throw new TypeError(
      `composition declaration owner ${provisional.declarationOwnerGraphFunctionRef} resolves ${String(owners.length)} times`
    );
  }
  const owner = owners[0]!;
  const vector = ownerVector({ owner, graphVectorRef: input.graphVector.id });
  const selection = resolveAbgFnCompositionSelection({
    vector,
    graphFunction: owner
  });
  if (
    selection.selectionRef !== provisional.compositionSelectionRef ||
    selection.contract.contractRef !== provisional.compositionRef ||
    selection.contract.contractDigest !== provisional.compositionDigest
  ) {
    throw new TypeError(
      "application provisional composition does not match the owner-resolved composition"
    );
  }
  return Object.freeze({
    selection,
    declarationOwnerGraphFunctionRef: owner.id,
    lineage: input.compilation.lineage,
    fanInRelation: input.compilation.fanInRelation
  });
}

function composition(input: CompileGraphVectorExecutionHandoffInput): {
  readonly selection: AbgFnCompositionSelection;
  readonly declarationOwnerGraphFunctionRef: string;
  readonly lineage: GraphFunctionApplicationLineageProjection | null;
  readonly fanInRelation: CompiledFanInApplicationRelation | null;
} {
  const application = compileGraphFunctionApplication({
    graphFunction: input.graphFunction,
    graphFunctions: input.graphFunctions
  });
  if (!application.observed) {
    return Object.freeze({
      selection: directComposition(input),
      declarationOwnerGraphFunctionRef: input.graphFunction.id,
      lineage: null,
      fanInRelation: null
    });
  }
  return appliedComposition({
    compilation: application,
    graphVector: input.graphVector,
    graphFunctions: input.graphFunctions
  });
}

function assertCompositionOwner(input: {
  readonly selection: AbgFnCompositionSelection;
  readonly required: boolean;
}): void {
  const selection = input.selection;
  const declared = selection.contract.host.owningDeclarationRef;
  if (declared === null) {
    if (input.required) {
      throw new TypeError(
        "applied composition owning declaration is required for inherited execution"
      );
    }
    return;
  }
  const expected = abgFnCompositionDeclarationRef({
    source: selection.source,
    sourceRef: selection.sourceRef
  });
  if (declared !== expected) {
    throw new TypeError(
      `composition owning declaration ${declared} does not match ${expected}`
    );
  }
}

function targetAndClosure(input: {
  readonly source: CompileGraphVectorExecutionHandoffInput;
  readonly boundary: GraphVectorBoundaryProjection;
  readonly composition: AbgFnCompositionSelection | null;
}): {
  readonly binding: TargetCarrierContractBinding;
  readonly projection: CompiledGraphVectorTargetCarrierProjection;
  readonly edgeClosure: CompiledGraphVectorEdgeClosureBinding;
} {
  const binding = resolveTargetCarrierContractBinding({
    vector: input.source.graphVector,
    defaults: input.source.targetCarrierDefaults
  });
  const projection = targetProjection({
    graphFunction: input.source.graphFunction,
    graphVector: input.source.graphVector,
    graphRef: input.boundary.graphRef,
    binding
  });
  const edgeClosure = edgeClosureBinding({
    boundary: input.boundary,
    graphFunction: input.source.graphFunction,
    graphVector: input.source.graphVector,
    target: projection,
    composition: input.composition
  });
  const projectionIssues = typecheckGtlProgramVectorContracts({
    graphFunction: input.source.graphFunction,
    graphVector: input.source.graphVector,
    targetCarrierContract: projection,
    edgeClosureContract: edgeClosure.conformanceRow
  });
  if (projectionIssues.length > 0) {
    throw new TypeError(
      `canonical target/edge projection violates existing law: ${projectionIssues
        .map((issue) => `${issue.ruleRef}: ${issue.message}`)
        .join("; ")}`
    );
  }
  return Object.freeze({
    binding,
    projection,
    edgeClosure
  });
}

const SUCCESSOR_DIAGNOSTIC_IDS = new Set<string>([
  "gtl-c-unrealized-workflow-lift",
  "gtl-c-unrealized-batch",
  "gtl-c-unrealized-retry"
]);

function capabilityById(
  manifest: AdmittedTenantConformanceManifest,
  capabilityId: string
): ResolvedTenantCapabilityClaim {
  const matches = manifest.resolvedCapabilityClaims.filter(
    (claim) => claim.capabilityId === capabilityId
  );
  if (matches.length !== 1) {
    throw new TypeError(
      `capability ${capabilityId} does not resolve exactly through admitted manifest ${manifest.manifest.manifestId}`
    );
  }
  return matches[0]!;
}

function assertSupportedCapabilityClosure(input: {
  readonly manifest: AdmittedTenantConformanceManifest;
  readonly capability: ResolvedTenantCapabilityClaim;
  readonly visited: Set<string>;
}): void {
  if (input.capability.supportedDisposition !== "supported") {
    throw new TypeError(
      `capability ${input.capability.capabilityId} is ${input.capability.supportedDisposition}`
    );
  }
  if (input.visited.has(input.capability.capabilityId)) return;
  input.visited.add(input.capability.capabilityId);
  for (const dependencyId of input.capability.dependentCapabilityIds) {
    assertSupportedCapabilityClosure({
      manifest: input.manifest,
      capability: capabilityById(input.manifest, dependencyId),
      visited: input.visited
    });
  }
}

export function projectTenantCapabilityCoverage(input: {
  readonly admittedManifest: AdmittedTenantConformanceManifest;
  readonly requiredEffectRefs: readonly string[];
}): TenantCapabilityCoverageProjection {
  if (input.admittedManifest.kind !== "admitted_tenant_conformance_manifest") {
    throw new TypeError(
      "capability coverage requires an admitted tenant-conformance manifest"
    );
  }
  const uniqueEffects = new Set(input.requiredEffectRefs);
  if (uniqueEffects.size !== input.requiredEffectRefs.length) {
    throw new TypeError("capability coverage requires unique effect refs");
  }
  const coverageRows = input.requiredEffectRefs.map((effectRef) => {
    const bindings = input.admittedManifest.manifest.effectBindings.filter(
      (binding) => binding.effectRef === effectRef
    );
    if (bindings.length !== 1) {
      throw new TypeError(
        `effect ${effectRef} does not resolve exactly through admitted manifest ${input.admittedManifest.manifest.manifestId}`
      );
    }
    const capability = capabilityById(
      input.admittedManifest,
      bindings[0]!.capabilityId
    );
    assertSupportedCapabilityClosure({
      manifest: input.admittedManifest,
      capability,
      visited: new Set<string>()
    });
    return Object.freeze({
      effectRef,
      capabilityId: capability.capabilityId,
      supportedDisposition: capability.supportedDisposition,
      owningContractClaimRef: capability.owningContractClaimRef,
      owningContractId: capability.owningContract.contractId,
      owningContractVersion: capability.owningContract.contractVersion,
      owningContractDigest: capability.owningContract.contractDigest,
      dependentCapabilityIds: Object.freeze([
        ...capability.dependentCapabilityIds
      ])
    });
  });
  const basis = Object.freeze({
    kind: "tenant_capability_coverage_projection" as const,
    manifestId: input.admittedManifest.manifest.manifestId,
    manifestVersion: input.admittedManifest.manifest.manifestVersion,
    manifestDigest: input.admittedManifest.manifest.manifestDigest,
    manifestAdmissionRef: input.admittedManifest.admissionRef,
    manifestAdmissionDigest: input.admittedManifest.admissionDigest,
    catalogId: input.admittedManifest.catalogBasis.catalogId,
    catalogVersion: input.admittedManifest.catalogBasis.catalogVersion,
    catalogDigest: input.admittedManifest.catalogBasis.catalogDigest,
    requiredEffectRefs: Object.freeze([...input.requiredEffectRefs]),
    coverageRows: Object.freeze(coverageRows)
  });
  return Object.freeze({
    ...basis,
    projectionDigest: stableSha256Digest(basis)
  });
}

function capabilityCompatibility(
  input: CompileGraphVectorExecutionHandoffInput
): CapabilityCompatibilityAdmission {
  if (input.graphFunction.effects.length === 0) {
    return Object.freeze({
      kind: "capability_compatibility_admission" as const,
      disposition: "not_applicable_no_effect_requirements" as const,
      coverageProjection: null
    });
  }
  if (input.admittedTenantConformanceManifest === null) {
    throw new TypeError("exact admitted tenant-conformance manifest is absent");
  }
  return Object.freeze({
    kind: "capability_compatibility_admission" as const,
    disposition: "compatible_exact_manifest" as const,
    coverageProjection: projectTenantCapabilityCoverage({
      admittedManifest: input.admittedTenantConformanceManifest,
      requiredEffectRefs: input.graphFunction.effects
    })
  });
}

function traversalStartupBlock(): TraversalStartupBlock {
  const basis = Object.freeze({
    kind: "graph_vector_traversal_startup_block" as const,
    status: "startup_blocked_awaiting_t267" as const,
    gapFamily: "traversal_execution_contracts" as const,
    runtimeAddressable: false as const,
    effectsPermitted: false as const,
    authorityRefs: Object.freeze([
      "REQ-L-GTL3-C-ALGEBRA-016",
      "REQ-R-ABG3-INTERPRET-010",
      "REQ-R-ABG3-INTERPRET-027"
    ])
  });
  return Object.freeze({
    ...basis,
    blockDigest: stableSha256Digest(basis)
  });
}

export function compileGraphVectorExecutionHandoff(
  input: CompileGraphVectorExecutionHandoffInput
): GraphVectorExecutionHandoffOutcome {
  let boundary: GraphVectorBoundaryProjection;
  try {
    boundary = exactBoundary(input);
  } catch (error: unknown) {
    return invalid({
      diagnostic: diagnostic({
        diagnosticId: "gtl-execution-handoff-vector-boundary-invalid",
        path: "$.graphVector",
        expectedRelation: "one exact contained GraphVector boundary",
        actualRelation: errorMessage(error),
        evidenceRefs: [input.graphFunction.id, input.graphVector.id]
      })
    });
  }

  const selection = compileGraphVectorCProgramSelection({
    graphFunction: input.graphFunction,
    graphVector: input.graphVector
  });
  if (!selection.observed) {
    try {
      const target = targetAndClosure({
        source: input,
        boundary,
        composition: null
      });
      return Object.freeze({
        kind: "graph_vector_execution_handoff_outcome" as const,
        status: "structural_only" as const,
        boundary,
        targetCarrierBinding: target.binding,
        targetCarrierProjection: target.projection,
        edgeClosureBinding: target.edgeClosure,
        diagnostics: Object.freeze([])
      });
    } catch (error: unknown) {
      return invalid({
        boundary,
        diagnostic: diagnostic({
          diagnosticId: "gtl-execution-handoff-target-carrier-invalid",
          path: "$.targetCarrier",
          expectedRelation: "one exact target-carrier and edge-closure contract",
          actualRelation: errorMessage(error),
          evidenceRefs: [input.graphFunction.id, input.graphVector.id]
        })
      });
    }
  }
  if (
    selection.binding === null ||
    selection.selectedCandidates.length !== 1
  ) {
    return invalid({
      boundary: selection.boundary ?? boundary,
      sourceDiagnostics: selection.diagnostics,
      diagnostic: diagnostic({
        diagnosticId: "gtl-execution-handoff-program-selection-invalid",
        path: "$.graphVector.declarations",
        expectedRelation: "one exact T-254 vector/program binding",
        actualRelation: selection.diagnostics
          .map((row) => row.actualRelation)
          .join("; ") || "no compiled binding",
        evidenceRefs: [input.graphFunction.id, input.graphVector.id]
      })
    });
  }

  const rawProgram = selection.selectedCandidates[0]?.candidate;
  const admission = admitCProgramSyntax(rawProgram);
  if (!admission.accepted || admission.program === null) {
    return invalid({
      boundary,
      sourceDiagnostics: admission.diagnostics,
      diagnostic: diagnostic({
        diagnosticId: "gtl-execution-handoff-program-shape-invalid",
        path: "$.selectedProgram",
        expectedRelation: "one admitted C program",
        actualRelation: admission.diagnostics.map((row) => row.message).join("; "),
        evidenceRefs: [selection.binding.bindingDigest]
      })
    });
  }

  let compositionJoin: ReturnType<typeof composition>;
  try {
    compositionJoin = composition(input);
    assertCompositionOwner({
      selection: compositionJoin.selection,
      required: compositionJoin.lineage !== null
    });
  } catch (error: unknown) {
    return invalid({
      boundary,
      diagnostic: diagnostic({
        diagnosticId: errorMessage(error).includes("owning declaration")
          ? "gtl-execution-handoff-composition-owner-mismatch"
          : "gtl-execution-handoff-composition-invalid",
        path: "$.composition",
        expectedRelation: "one exact direct or lineage-derived composition owner",
        actualRelation: errorMessage(error),
        evidenceRefs: [selection.binding.bindingDigest]
      })
    });
  }

  let target: ReturnType<typeof targetAndClosure>;
  try {
    target = targetAndClosure({
      source: input,
      boundary,
      composition: compositionJoin.selection
    });
  } catch (error: unknown) {
    return invalid({
      boundary,
      diagnostic: diagnostic({
        diagnosticId: "gtl-execution-handoff-target-carrier-invalid",
        path: "$.targetCarrier",
        expectedRelation: "one exact target-carrier and edge-closure contract",
        actualRelation: errorMessage(error),
        evidenceRefs: [selection.binding.bindingDigest]
      })
    });
  }

  const lowered = compileCAlgebraToHog(admission.program);
  if (!lowered.accepted || lowered.program === null) {
    const successorBlocked =
      lowered.diagnostics.length > 0 &&
      lowered.diagnostics.every((row) =>
        SUCCESSOR_DIAGNOSTIC_IDS.has(row.diagnosticId)
      );
    if (successorBlocked) {
      return Object.freeze({
        kind: "graph_vector_execution_handoff_outcome" as const,
        status: "blocked_successor_constructor" as const,
        boundary,
        programBinding: selection.binding,
        targetCarrierBinding: target.binding,
        targetCarrierProjection: target.projection,
        edgeClosureBinding: target.edgeClosure,
        sourceDiagnostics: lowered.diagnostics,
        diagnostics: Object.freeze([
          diagnostic({
            classification: "semantic_not_realized",
            diagnosticId:
              "gtl-execution-handoff-successor-constructor-blocked",
            path: "$.selectedProgram.term",
            expectedRelation: "successor-owned constructor runtime",
            actualRelation: lowered.diagnostics
              .map((row) => row.message)
              .join("; "),
            evidenceRefs: [selection.binding.bindingDigest]
          })
        ])
      });
    }
    return invalid({
      boundary,
      sourceDiagnostics: lowered.diagnostics,
      diagnostic: diagnostic({
        diagnosticId: "gtl-execution-handoff-program-shape-invalid",
        path: "$.selectedProgram.term",
        expectedRelation: "one admitted flat executable C program",
        actualRelation: lowered.diagnostics.map((row) => row.message).join("; "),
        evidenceRefs: [selection.binding.bindingDigest]
      })
    });
  }

  let workflowLiftBinding: CompiledWorkflowLiftBinding | null = null;
  if (isHogWorkflowProgram(lowered.program)) {
    try {
      const compositionOwners = input.module.graphFunctions.filter(
        (candidate) =>
          candidate.id === compositionJoin.declarationOwnerGraphFunctionRef
      );
      const compositionOwner = compositionOwners[0];
      if (compositionOwners.length !== 1 || compositionOwner === undefined) {
        throw new TypeError(
          `workflow.C composition owner resolves ${String(compositionOwners.length)} times in the selected Module`
        );
      }
      workflowLiftBinding = compileWorkflowLiftBinding({
        module: input.module,
        parentGraphFunction: input.graphFunction,
        compositionOwnerGraphFunction: compositionOwner,
        parentGraphVector: input.graphVector,
        programBinding: selection.binding,
        program: lowered.program,
        composition: compositionJoin.selection
      });
    } catch (error: unknown) {
      return invalid({
        boundary,
        diagnostic: diagnostic({
          diagnosticId: "gtl-execution-handoff-program-shape-invalid",
          path: "$.selectedProgram.term.workflow",
          expectedRelation:
            "one exact module-contained child GraphFunction with preserved interfaces and composition locus",
          actualRelation: errorMessage(error),
          evidenceRefs: [selection.binding.bindingDigest]
        })
      });
    }
  }
  const programDisposition = isHogWorkflowProgram(lowered.program)
    ? "workflow_sub_traversal" as const
    : isHogBatchProgram(lowered.program)
      ? "batch_task_family" as const
      : "flat_executable" as const;

  let compatibility: CapabilityCompatibilityAdmission;
  try {
    compatibility = capabilityCompatibility(input);
  } catch (error: unknown) {
    const manifestMissing =
      input.graphFunction.effects.length > 0 &&
      input.admittedTenantConformanceManifest === null;
    return Object.freeze({
      kind: "graph_vector_execution_handoff_outcome" as const,
      status: "blocked_capability" as const,
      boundary,
      programBinding: selection.binding,
      programDisposition,
      normalizedProgram: lowered.program,
      workflowLiftBinding,
      compositionSelection: compositionJoin.selection,
      applicationLineage: compositionJoin.lineage,
      fanInApplicationRelation: compositionJoin.fanInRelation,
      targetCarrierBinding: target.binding,
      targetCarrierProjection: target.projection,
      edgeClosureBinding: target.edgeClosure,
      admittedManifestRef:
        input.admittedTenantConformanceManifest?.admissionRef ?? null,
      diagnostics: Object.freeze([
        diagnostic({
          classification: "semantic_not_realized",
          diagnosticId: manifestMissing
            ? "gtl-execution-handoff-capability-manifest-missing"
            : "gtl-execution-handoff-capability-manifest-incompatible",
          path: "$.admittedTenantConformanceManifest",
          expectedRelation:
            "one admitted canonical tenant-conformance manifest with exact supported effect coverage",
          actualRelation: errorMessage(error),
          evidenceRefs: Object.freeze([
            input.graphFunction.id,
            selection.binding.bindingDigest,
            ...(input.admittedTenantConformanceManifest === null
              ? []
              : [
                  input.admittedTenantConformanceManifest.admissionRef,
                  input.admittedTenantConformanceManifest.admissionDigest
                ])
          ])
        })
      ])
    });
  }

  const startupBlock = traversalStartupBlock();
  const handoffBasis = Object.freeze({
    kind: "compiled_graph_vector_execution_handoff" as const,
    executionSubjectGraphFunctionRef: input.graphFunction.id,
    declarationOwnerGraphFunctionRef:
      compositionJoin.declarationOwnerGraphFunctionRef,
    graphRef: boundary.graphRef,
    graphVectorRef: input.graphVector.id,
    programDisposition,
    programBinding: selection.binding,
    admittedProgram: admission.program,
    normalizedProgram: lowered.program,
    workflowLiftBinding,
    compositionSelection: compositionJoin.selection,
    applicationLineage: compositionJoin.lineage,
    fanInApplicationRelation: compositionJoin.fanInRelation,
    targetCarrierBinding: target.binding,
    targetCarrierProjection: target.projection,
    edgeClosureBinding: target.edgeClosure,
    effectRequirementRefs: Object.freeze([...input.graphFunction.effects]),
    capabilityCompatibility: compatibility,
    startupBlock
  });
  const handoffDigest = stableSha256Digest(handoffBasis);
  const handoff: CompiledGraphVectorExecutionHandoff = Object.freeze({
    ...handoffBasis,
    handoffRef: `abg://graph-vector-execution-handoff/${handoffDigest.slice("sha256:".length)}`,
    handoffDigest
  });
  return Object.freeze({
    kind: "graph_vector_execution_handoff_outcome" as const,
    status: "published_startup_blocked" as const,
    boundary,
    handoff,
    diagnostics: Object.freeze([
      diagnostic({
        classification: "semantic_not_realized",
        diagnosticId:
          "gtl-execution-handoff-traversal-conservation-blocked",
        path: "$.handoff.startupBlock",
        expectedRelation:
          "T-267 admitted result-interface and bind-conservation authority",
        actualRelation:
          "published handoff remains startup-blocked before traversal and effects",
        evidenceRefs: [handoff.handoffRef, startupBlock.blockDigest]
      })
    ])
  });
}
