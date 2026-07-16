// Implements: T-267; REQ-L-GTL3-C-ALGEBRA-016;
// REQ-R-ABG3-INTERPRET-010/-023/-027. This module compiles static traversal
// result-interface and bind-conservation truth. It does not execute work,
// admit runtime output, or close a traversal.

import type {
  GraphFunction,
  GraphVector
} from "../../../gtl/m01/contracts/carriers.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import type { GtlTargetCarrierDefaultsBundle } from "../../../gtl/m01/contracts/target_carrier_contract.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  compileGraphVectorExecutionHandoff,
  type CapabilityCompatibilityAdmission,
  type GraphVectorExecutionHandoffCapabilityBlocked,
  type GraphVectorExecutionHandoffPublished,
  type GraphVectorExecutionHandoffStructuralOnly
} from "./graph_vector_execution_handoff.js";
import {
  assertCompiledHofFanOutBinding,
  assertCompiledFanInReductionBinding,
  compileHofFanOutBinding,
  type CompiledFanInReductionBinding,
  type CompiledHofFanOutBinding,
  type ExecutionHandoffCarrier
} from "./hof_batch.js";
import {
  compileHofRelation,
  type CompiledHofFanOutRelation
} from "./hof_relation_compiler.js";
import {
  assertCompiledWorkflowLiftBinding,
  type CompiledWorkflowLiftBinding
} from "./workflow_c.js";
import {
  assertCompiledCRetryBinding,
  type CompiledCRetryBinding
} from "./c_retry.js";
import {
  assertCompiledCBatchPlan,
  type CompiledCBatchPlan
} from "./c_batch.js";
import {
  assertCompiledTypedRecursePlan,
  type CompiledTypedRecursePlan
} from "./typed_recurse.js";
import type {
  AbgFnCompositionSelection,
  AbgFnComputeStageRole
} from "./fn_composition.js";
import {
  assertCompiledCProgramPlan,
  type CompiledCPlanNode,
  type CompiledCProgramPlan,
  type CompositionLocusBinding
} from "./complete_c_program.js";
import type { RuntimeRegime } from "./carriers.js";
import {
  FH_PUBLIC_OPERATION_ID_VALUES
} from "../runner/fh_interaction.js";
import {
  internalFpResultWireProfileFields,
  type FpResultWireProfile
} from "./fp_result_contract_admission.js";
import {
  assertCompiledExecutionContextContract,
  type CompiledExecutionContextContract,
  type DeclaredExecutionRequest
} from "./declared_execution_context.js";
import {
  GTL_PROGRAM_BIND_ADMISSION_STRENGTH_COMPATIBILITY_REF,
  GTL_PROGRAM_OBLIGATION_DELTA_FAMILY_VALUES,
  type GtlProgramComputeCompositionRow,
  type GtlProgramComputeStageBindingRow,
  type GtlProgramConformanceInput,
  type GtlProgramConformanceIssue,
  type GtlProgramConformanceReport,
  type GtlProgramPluginResultInterfaceRow,
  type GtlProgramStageRegimeDispositionRow,
  type GtlProgramTraversalBindConservationRow,
  typecheckGtlProgram
} from "./gtl_program_conformance.js";
import type {
  EngineComputeStagePurpose,
  EngineComputeStageRole
} from "./plugins.js";
import type {
  AdmittedTenantConformanceManifest
} from "../../../shared/abg_library/tenant_conformance_manifest.js";

export const TRAVERSAL_EXECUTION_CONTRACT_DIAGNOSTIC_ID_VALUES = Object.freeze([
  "traversal-source-invalid",
  "traversal-result-authority-invalid",
  "traversal-contract-bundle-invalid",
  "traversal-conformance-report-stale",
  "traversal-static-unit-nonconformant",
  "traversal-runtime-start-invalid"
] as const);

export type TraversalExecutionContractDiagnosticId =
  (typeof TRAVERSAL_EXECUTION_CONTRACT_DIAGNOSTIC_ID_VALUES)[number];

export interface TraversalExecutionContractDiagnostic {
  readonly kind: "traversal_execution_contract_diagnostic";
  readonly diagnosticId: TraversalExecutionContractDiagnosticId;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
}

export class TraversalExecutionContractError extends TypeError {
  public constructor(
    public readonly diagnostic: TraversalExecutionContractDiagnostic
  ) {
    super(diagnostic.actualRelation);
    this.name = "TraversalExecutionContractError";
  }
}

export type TraversalSourceCapabilityDisposition =
  | "unresolved"
  | CapabilityCompatibilityAdmission["disposition"];

export interface TraversalSourceRegimeBinding {
  readonly bindingRef: string;
  readonly stageRole: AbgFnComputeStageRole;
  readonly regime: RuntimeRegime;
  readonly order: number;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface TraversalContractWorkStage {
  readonly kind: "traversal_contract_work_stage";
  readonly ordinal: number;
  readonly programLocusRef: string;
  readonly programLocusDigest: `sha256:${string}`;
  readonly sourcePath: string;
  readonly declaredStageIndex: number | null;
  readonly domainStageRole: string | null;
  readonly instructionCategoryRefs: readonly string[];
  readonly compositionStageRole: AbgFnComputeStageRole;
  readonly regime: RuntimeRegime;
  readonly compositionRegimeBindingRef: string;
  readonly armId: string;
  readonly sequenceOrdinal: number;
  readonly taskOrdinal: number | null;
  readonly predecessorProgramLocusRefs: readonly string[];
  readonly resultBearing: boolean;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly sourceAuthorityRef: string;
  readonly sourceAuthorityDigest: `sha256:${string}`;
  readonly declaredStageDigest: `sha256:${string}`;
  readonly sourceStageDigest: `sha256:${string}`;
  readonly evidenceRefs: readonly string[];
}

export interface TraversalContractSourceBasis {
  readonly kind: "traversal_contract_source_basis";
  readonly sourceKind: "selected_program_handoff" | "structural_hof_fan_out";
  readonly sourceRef: string;
  readonly sourceDigest: `sha256:${string}`;
  readonly currentAuthorityRef: string;
  readonly currentAuthorityDigest: `sha256:${string}`;
  readonly moduleName: string;
  readonly moduleDigest: `sha256:${string}`;
  readonly graphFunctionRef: string;
  readonly graphFunctionId: string;
  readonly graphFunctionDigest: `sha256:${string}`;
  readonly declarationOwnerGraphFunctionId: string;
  readonly declarationOwnerGraphFunctionDigest: `sha256:${string}`;
  readonly graphRef: string;
  readonly graphId: string;
  readonly graphVectorRef: string;
  readonly graphVectorId: string;
  readonly graphVectorDigest: `sha256:${string}`;
  readonly sourceInputCarrierRefs: readonly string[];
  readonly sourceOutputCarrierRef: string;
  readonly selectedProgramRef: string;
  readonly selectedProgramBindingDigest: `sha256:${string}`;
  readonly completeProgramPlan: CompiledCProgramPlan;
  readonly authoredProgramNodeRefs: readonly string[];
  readonly invokingProgramLocusRefs: readonly string[];
  readonly resultBearingProgramLocusRefs: readonly string[];
  readonly planExecutionGraphFunctionRef: string;
  readonly applicationKind: "direct" | "fan_out" | "fan_in" | "recurse";
  readonly applicationConservationRefs: readonly string[];
  readonly compositionSelectionRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionClosureContractRef: string;
  readonly compositionRegimeBindings: readonly TraversalSourceRegimeBinding[];
  readonly applicationLineageRefs: readonly string[];
  readonly targetCarrierProjection:
    GraphVectorExecutionHandoffStructuralOnly["targetCarrierProjection"];
  readonly edgeClosureBinding:
    GraphVectorExecutionHandoffStructuralOnly["edgeClosureBinding"];
  readonly effectRequirementRefs: readonly string[];
  readonly workStages: readonly TraversalContractWorkStage[];
  readonly capabilityDisposition: TraversalSourceCapabilityDisposition;
  readonly startupBlockDigest: `sha256:${string}` | null;
}

export interface ProjectSelectedTraversalContractSourceInput {
  readonly kind: "selected_program_handoff";
  readonly module: Module;
  readonly executionSubjectGraphFunction: GraphFunction;
  readonly declarationOwnerGraphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
  readonly admittedTenantConformanceManifest:
    | AdmittedTenantConformanceManifest
    | null;
  readonly outcome:
    | GraphVectorExecutionHandoffPublished
    | GraphVectorExecutionHandoffCapabilityBlocked;
}

export interface ProjectStructuralHofTraversalContractSourceInput {
  readonly kind: "structural_hof_fan_out";
  readonly module: Module;
  readonly executionSubjectGraphFunction: GraphFunction;
  readonly declarationOwnerGraphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
  readonly admittedTenantConformanceManifest:
    | AdmittedTenantConformanceManifest
    | null;
  readonly outcome: GraphVectorExecutionHandoffStructuralOnly;
  readonly relation: CompiledHofFanOutRelation;
  readonly binding: CompiledHofFanOutBinding;
  readonly childExecutionHandoff: ExecutionHandoffCarrier;
}

export type ProjectTraversalContractSourceInput =
  | ProjectSelectedTraversalContractSourceInput
  | ProjectStructuralHofTraversalContractSourceInput;

export type TraversalResultAuthoritySourceKind =
  | "program_locus_contract"
  | "declared_fp_contract"
  | "declared_fh_contract"
  | "deterministic_target_contract"
  | "runtime_atom_contract";

export interface AdmittedTraversalStageResultAuthority {
  readonly kind: "admitted_traversal_stage_result_authority";
  readonly authorityRef: string;
  readonly authorityDigest: `sha256:${string}`;
  readonly sourceKind: TraversalResultAuthoritySourceKind;
  readonly sourceDigest: `sha256:${string}`;
  readonly currentSourceAuthorityRef: string;
  readonly currentSourceAuthorityDigest: `sha256:${string}`;
  readonly currentEvidenceRefs: readonly string[];
  readonly currentAuthorityWitnessDigest: `sha256:${string}`;
  readonly stageOrdinal: number;
  readonly programLocusRef: string;
  readonly programLocusDigest: `sha256:${string}`;
  readonly sourceStageDigest: `sha256:${string}`;
  readonly declaredStageTermDigest: `sha256:${string}` | null;
  readonly domainStageRole: string | null;
  readonly compositionStageRole: AbgFnComputeStageRole;
  readonly regime: RuntimeRegime;
  readonly selectedResultContractRef: string;
  readonly resultEnvelopeContractRef: string;
  readonly resultCarrierKind: string;
  readonly outputCarrierRefs: readonly string[];
  readonly producedCarrierRefs: readonly string[];
  readonly selectorAuthorityRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export type TraversalRuntimeAtomAuthority =
  | CompiledWorkflowLiftBinding
  | CompiledCRetryBinding
  | CompiledCBatchPlan
  | CompiledHofFanOutBinding
  | CompiledFanInReductionBinding
  | CompiledTypedRecursePlan;

export interface CompiledTraversalExecutionContracts {
  readonly kind: "compiled_traversal_execution_contracts";
  readonly bundleRef: string;
  readonly bundleDigest: `sha256:${string}`;
  readonly sourceDigest: `sha256:${string}`;
  readonly resultAuthorityDigests: readonly `sha256:${string}`[];
  readonly computeComposition: GtlProgramComputeCompositionRow;
  readonly computeStageBindings: readonly GtlProgramComputeStageBindingRow[];
  readonly pluginResultInterfaces:
    readonly GtlProgramPluginResultInterfaceRow[];
  readonly traversalBindConservation:
    GtlProgramTraversalBindConservationRow;
}

export interface TraversalExecutionAdmissionInvalid {
  readonly kind: "traversal_execution_admission_outcome";
  readonly status: "invalid";
  readonly runtimeAddressable: false;
  readonly effectsPermitted: false;
  readonly diagnostic: TraversalExecutionContractDiagnostic;
}

interface TraversalExecutionAdmissionSourceIdentity {
  readonly sourceKind: TraversalContractSourceBasis["sourceKind"];
  readonly sourceRef: string;
  readonly sourceDigest: `sha256:${string}`;
  readonly currentAuthorityRef: string;
  readonly currentAuthorityDigest: `sha256:${string}`;
  readonly startupBlockDigest: `sha256:${string}` | null;
  readonly graphFunctionRef: string;
  readonly graphFunctionId: string;
  readonly graphFunctionDigest: `sha256:${string}`;
  readonly capabilityDisposition: TraversalSourceCapabilityDisposition;
  readonly currentResultAuthorities:
    readonly TraversalExecutionAdmissionResultAuthorityIdentity[];
}

export interface TraversalExecutionAdmissionResultAuthorityIdentity {
  readonly sourceKind: TraversalResultAuthoritySourceKind;
  readonly stageOrdinal: number;
  readonly programLocusRef: string;
  readonly declaredStageTermDigest: `sha256:${string}` | null;
  readonly domainStageRole: string | null;
  readonly currentSourceAuthorityRef: string;
  readonly currentSourceAuthorityDigest: `sha256:${string}`;
}

interface TraversalExecutionAdmissionStaticBase
  extends TraversalExecutionAdmissionSourceIdentity {
  readonly kind: "traversal_execution_admission_outcome";
  readonly admissionRef: string;
  readonly admissionDigest: `sha256:${string}`;
  readonly bundleDigest: `sha256:${string}`;
  readonly reportRef: string;
  readonly runtimeAddressable: false;
  readonly effectsPermitted: false;
  readonly runtimeClosed: false;
  readonly resultAdmitted: false;
  readonly obligationsDischarged: false;
}

export interface TraversalExecutionAdmissionProgramBlocked
  extends TraversalExecutionAdmissionStaticBase {
  readonly status: "static_contracts_admitted_program_blocked";
  readonly blockingIssueRefs: readonly string[];
}

export interface TraversalExecutionAdmissionCapabilityBlocked
  extends TraversalExecutionAdmissionStaticBase {
  readonly status: "static_contracts_admitted_capability_blocked";
  readonly blockingIssueRefs: readonly string[];
}

export interface TraversalExecutionAdmissionRuntimeAddressable
  extends TraversalExecutionAdmissionSourceIdentity {
  readonly kind: "traversal_execution_admission_outcome";
  readonly status: "runtime_addressable_not_closed";
  readonly admissionRef: string;
  readonly admissionDigest: `sha256:${string}`;
  readonly bundleDigest: `sha256:${string}`;
  readonly reportRef: string;
  readonly runtimeAddressable: true;
  readonly effectsPermitted: false;
  readonly runtimeClosed: false;
  readonly resultAdmitted: false;
  readonly obligationsDischarged: false;
  readonly capabilityDisposition: Exclude<
    TraversalSourceCapabilityDisposition,
    "unresolved"
  >;
}

export type TraversalExecutionAdmissionOutcome =
  | TraversalExecutionAdmissionInvalid
  | TraversalExecutionAdmissionProgramBlocked
  | TraversalExecutionAdmissionCapabilityBlocked
  | TraversalExecutionAdmissionRuntimeAddressable;

function diagnostic(input: {
  readonly diagnosticId: TraversalExecutionContractDiagnosticId;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
}): TraversalExecutionContractDiagnostic {
  return Object.freeze({
    kind: "traversal_execution_contract_diagnostic" as const,
    diagnosticId: input.diagnosticId,
    actualRelation: input.actualRelation,
    evidenceRefs: Object.freeze([...input.evidenceRefs])
  });
}

function fail(input: {
  readonly diagnosticId: TraversalExecutionContractDiagnosticId;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
}): never {
  throw new TraversalExecutionContractError(diagnostic(input));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function exactGraphFunction(input: {
  readonly module: Module;
  readonly supplied: GraphFunction;
  readonly label: string;
}): GraphFunction {
  const matches = input.module.graphFunctions.filter(
    (candidate) => candidate.id === input.supplied.id
  );
  const match = matches[0];
  if (
    matches.length !== 1 ||
    match === undefined ||
    !stableJsonEquals(match, input.supplied)
  ) {
    fail({
      diagnosticId: "traversal-source-invalid",
      actualRelation: `${input.label} must resolve exactly inside the selected Module`,
      evidenceRefs: [input.module.name, input.supplied.id]
    });
  }
  return match;
}

function exactGraphVector(input: {
  readonly graphFunction: GraphFunction;
  readonly supplied: GraphVector;
}): GraphVector {
  if (input.graphFunction.template.kind !== "inline_graph") {
    fail({
      diagnosticId: "traversal-source-invalid",
      actualRelation: "traversal source GraphFunction must contain an inline Graph",
      evidenceRefs: [input.graphFunction.id]
    });
  }
  const matches = input.graphFunction.template.graph.vectors.filter(
    (candidate) => candidate.id === input.supplied.id
  );
  const match = matches[0];
  if (
    matches.length !== 1 ||
    match === undefined ||
    !stableJsonEquals(match, input.supplied)
  ) {
    fail({
      diagnosticId: "traversal-source-invalid",
      actualRelation: "traversal source GraphVector must resolve exactly inside its GraphFunction",
      evidenceRefs: [input.graphFunction.id, input.supplied.id]
    });
  }
  return match;
}

function selectedCarrier(
  outcome:
    | GraphVectorExecutionHandoffPublished
    | GraphVectorExecutionHandoffCapabilityBlocked
    | ExecutionHandoffCarrier
): GraphVectorExecutionHandoffPublished["handoff"] |
  GraphVectorExecutionHandoffCapabilityBlocked {
  if (outcome.kind === "compiled_graph_vector_execution_handoff") {
    return outcome;
  }
  return outcome.status === "published_startup_blocked"
    ? outcome.handoff
    : outcome;
}

function selectedComposition(
  carrier: ReturnType<typeof selectedCarrier>
): AbgFnCompositionSelection {
  return carrier.compositionSelection;
}

function regimeBindingProjection(
  composition: AbgFnCompositionSelection
): readonly TraversalSourceRegimeBinding[] {
  return Object.freeze(
    composition.contract.regimes.map((row) => Object.freeze({
      bindingRef: row.bindingRef,
      stageRole: row.stageRole,
      regime: row.regime,
      order: row.order,
      inputCarrierRefs: Object.freeze([...row.inputCarrierRefs]),
      outputCarrierRefs: Object.freeze([...row.outputCarrierRefs]),
      evidenceRefs: Object.freeze([...row.evidenceRefs])
    }))
  );
}

interface TraversalPlanInventory {
  readonly authoredProgramNodeRefs: readonly string[];
  readonly workStages: readonly TraversalContractWorkStage[];
  readonly resultBearingProgramLocusRefs: readonly string[];
}

function uniqueRefs(refs: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(refs)]);
}

function planInventory(plan: CompiledCProgramPlan): TraversalPlanInventory {
  assertCompiledCProgramPlan(plan);
  const authoredProgramNodeRefs: string[] = [];
  const workStages: TraversalContractWorkStage[] = [];
  let declaredStageIndex = 0;

  const invokingStage = (
    node: Extract<
      CompiledCPlanNode,
      { readonly kind: "compiled_c_stage_leaf" | "compiled_c_workflow_lift" }
    >,
    binding: CompositionLocusBinding,
    predecessorProgramLocusRefs: readonly string[]
  ): TraversalContractWorkStage => {
    const isStageLeaf = node.kind === "compiled_c_stage_leaf";
    const domainStageRole = isStageLeaf ? node.domainStageRole : null;
    const stageIndex = isStageLeaf ? declaredStageIndex++ : null;
    const instructionCategoryRefs = isStageLeaf
      ? node.instructionCategoryRefs
      : Object.freeze([]);
    const resultBearing =
      node.kind === "compiled_c_stage_leaf"
        ? node.resultBearing
        : node.resultCardinality === "one";
    const stageBasis = Object.freeze({
      kind: "traversal_contract_work_stage" as const,
      ordinal: workStages.length,
      programLocusRef: node.nodeRef,
      programLocusDigest: node.nodeDigest,
      sourcePath: node.sourcePath,
      declaredStageIndex: stageIndex,
      domainStageRole,
      instructionCategoryRefs: Object.freeze([...instructionCategoryRefs]),
      compositionStageRole: binding.compositionStageRole,
      regime: binding.regime,
      compositionRegimeBindingRef: binding.regimeBindingRef,
      armId: binding.armId,
      sequenceOrdinal: binding.sequenceOrdinal,
      taskOrdinal: binding.taskOrdinal,
      predecessorProgramLocusRefs: uniqueRefs(predecessorProgramLocusRefs),
      resultBearing,
      inputCarrierRefs: Object.freeze([node.inputCarrierRef]),
      outputCarrierRefs: Object.freeze([node.outputCarrierRef]),
      sourceAuthorityRef: node.nodeRef,
      sourceAuthorityDigest: node.nodeDigest,
      declaredStageDigest: node.sourceNodeDigest,
      evidenceRefs: Object.freeze([
        plan.planRef,
        plan.planDigest,
        binding.bindingRef,
        binding.bindingDigest
      ])
    });
    return Object.freeze({
      ...stageBasis,
      sourceStageDigest: stableSha256Digest(stageBasis)
    });
  };

  const visit = (
    node: CompiledCPlanNode,
    predecessorProgramLocusRefs: readonly string[]
  ): readonly string[] => {
    authoredProgramNodeRefs.push(node.nodeRef);
    switch (node.kind) {
      case "compiled_c_stage_leaf":
      case "compiled_c_workflow_lift": {
        const stage = invokingStage(
          node,
          node.compositionBinding,
          predecessorProgramLocusRefs
        );
        workStages.push(stage);
        return Object.freeze([stage.programLocusRef]);
      }
      case "compiled_c_identity":
        return uniqueRefs(predecessorProgramLocusRefs);
      case "compiled_c_sequence": {
        let frontier = uniqueRefs(predecessorProgramLocusRefs);
        for (const child of node.children) {
          frontier = visit(child, frontier);
        }
        return frontier;
      }
      case "compiled_c_complete_batch":
        return uniqueRefs(
          node.tasks.flatMap((task) =>
            visit(task.child, predecessorProgramLocusRefs)
          )
        );
      case "compiled_c_complete_retry":
        return visit(node.child, predecessorProgramLocusRefs);
    }
  };

  visit(plan.root, Object.freeze([]));
  if (
    authoredProgramNodeRefs.length !== plan.authoredNodeCount ||
    workStages.length !== plan.invokingLocusCount ||
    new Set(authoredProgramNodeRefs).size !== authoredProgramNodeRefs.length ||
    new Set(workStages.map((stage) => stage.programLocusRef)).size !==
      workStages.length
  ) {
    fail({
      diagnosticId: "traversal-source-invalid",
      actualRelation:
        "complete C-program plan inventory does not match its authored-node and invoking-locus census",
      evidenceRefs: [plan.planRef, plan.planDigest]
    });
  }
  const resultBearingProgramLocusRefs = Object.freeze(
    workStages
      .filter((stage) => stage.resultBearing)
      .map((stage) => stage.programLocusRef)
  );
  if (resultBearingProgramLocusRefs.length === 0) {
    fail({
      diagnosticId: "traversal-source-invalid",
      actualRelation: "complete C-program plan has no result-bearing frontier",
      evidenceRefs: [plan.planRef, plan.planDigest]
    });
  }
  return Object.freeze({
    authoredProgramNodeRefs: Object.freeze(authoredProgramNodeRefs),
    workStages: Object.freeze(workStages),
    resultBearingProgramLocusRefs
  });
}

function selectedApplication(input: {
  readonly carrier: ReturnType<typeof selectedCarrier>;
}): {
  readonly kind: TraversalContractSourceBasis["applicationKind"];
  readonly refs: readonly string[];
} {
  const recurse = input.carrier.recurseApplicationRelation;
  if (recurse !== null) {
    return Object.freeze({
      kind: "recurse" as const,
      refs: Object.freeze([
        recurse.relationRef,
        recurse.relationDigest,
        recurse.applicationRef,
        recurse.applicationLineageRef,
        recurse.applicationLineageDigest,
        recurse.executionSubjectGraphFunctionRef,
        recurse.executionSubjectGraphFunctionDigest,
        recurse.operandGraphFunctionRef,
        recurse.operandGraphFunctionDigest,
        recurse.terminationEvaluatorBinding,
        recurse.terminationEvaluatorDigest,
        ...recurse.terminationConsumedFieldRefs,
        recurse.foldbackBinding,
        recurse.foldbackAdditionalDigest
      ])
    });
  }
  const fanIn = input.carrier.fanInApplicationRelation;
  if (fanIn !== null) {
    return Object.freeze({
      kind: "fan_in" as const,
      refs: Object.freeze([
        fanIn.relationRef,
        fanIn.relationDigest,
        fanIn.applicationRef,
        fanIn.applicationLineageRef,
        fanIn.applicationLineageDigest,
        fanIn.executionSubjectGraphFunctionRef,
        fanIn.executionSubjectGraphFunctionDigest,
        fanIn.reducerGraphFunctionRef,
        fanIn.reducerGraphFunctionDigest,
        fanIn.inputVectorContractKey,
        fanIn.outputContractKey
      ])
    });
  }
  const directApplicationBasis = Object.freeze({
    kind: "direct_graph_vector_program_application" as const,
    executionSubjectGraphFunctionRef:
      input.carrier.programBinding.hostGraphFunctionRef,
    graphRef: input.carrier.programBinding.graphRef,
    graphVectorRef: input.carrier.programBinding.graphVectorRef,
    selectedProgramRef: input.carrier.programBinding.selectedProgramRef
  });
  const directApplicationDigest = stableSha256Digest(directApplicationBasis);
  return Object.freeze({
    kind: "direct" as const,
    refs: Object.freeze([
      `abg://graph-function-application/direct/${directApplicationDigest.slice("sha256:".length)}`,
      directApplicationDigest
    ])
  });
}

function sourceBasis(input: {
  readonly sourceKind: TraversalContractSourceBasis["sourceKind"];
  readonly sourceRef: string;
  readonly currentAuthorityRef: string;
  readonly currentAuthorityDigest: `sha256:${string}`;
  readonly module: Module;
  readonly graphFunction: GraphFunction;
  readonly declarationOwnerGraphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly selectedProgramRef: string;
  readonly selectedProgramBindingDigest: `sha256:${string}`;
  readonly completeProgramPlan: CompiledCProgramPlan;
  readonly authoredProgramNodeRefs: readonly string[];
  readonly resultBearingProgramLocusRefs: readonly string[];
  readonly planExecutionGraphFunctionRef: string;
  readonly applicationKind: TraversalContractSourceBasis["applicationKind"];
  readonly applicationConservationRefs: readonly string[];
  readonly composition: AbgFnCompositionSelection;
  readonly applicationLineageRefs: readonly string[];
  readonly targetCarrierProjection:
    TraversalContractSourceBasis["targetCarrierProjection"];
  readonly edgeClosureBinding:
    TraversalContractSourceBasis["edgeClosureBinding"];
  readonly effectRequirementRefs: readonly string[];
  readonly workStages: readonly TraversalContractWorkStage[];
  readonly capabilityDisposition: TraversalSourceCapabilityDisposition;
  readonly startupBlockDigest: `sha256:${string}` | null;
}): TraversalContractSourceBasis {
  if (input.graphFunction.template.kind !== "inline_graph") {
    fail({
      diagnosticId: "traversal-source-invalid",
      actualRelation: "traversal source must materialize an inline Graph",
      evidenceRefs: [input.graphFunction.id]
    });
  }
  const structural = Object.freeze({
    kind: "traversal_contract_source_basis" as const,
    sourceKind: input.sourceKind,
    sourceRef: input.sourceRef,
    moduleName: input.module.name,
    moduleDigest: stableSha256Digest(input.module),
    graphFunctionRef: input.graphFunction.name,
    graphFunctionId: input.graphFunction.id,
    graphFunctionDigest: stableSha256Digest(input.graphFunction),
    declarationOwnerGraphFunctionId: input.declarationOwnerGraphFunction.id,
    declarationOwnerGraphFunctionDigest:
      stableSha256Digest(input.declarationOwnerGraphFunction),
    graphRef: input.graphFunction.template.graph.name,
    graphId: input.graphFunction.template.graph.id,
    graphVectorRef: input.graphVector.name,
    graphVectorId: input.graphVector.id,
    graphVectorDigest: stableSha256Digest(input.graphVector),
    sourceInputCarrierRefs: Object.freeze(
      input.graphVector.source.map((node) => node.id)
    ),
    sourceOutputCarrierRef: input.graphVector.target.id,
    selectedProgramRef: input.selectedProgramRef,
    selectedProgramBindingDigest: input.selectedProgramBindingDigest,
    completeProgramPlan: input.completeProgramPlan,
    authoredProgramNodeRefs: Object.freeze([
      ...input.authoredProgramNodeRefs
    ]),
    invokingProgramLocusRefs: Object.freeze(
      input.workStages.map((stage) => stage.programLocusRef)
    ),
    resultBearingProgramLocusRefs: Object.freeze([
      ...input.resultBearingProgramLocusRefs
    ]),
    planExecutionGraphFunctionRef: input.planExecutionGraphFunctionRef,
    applicationKind: input.applicationKind,
    applicationConservationRefs: uniqueRefs(input.applicationConservationRefs),
    compositionSelectionRef: input.composition.selectionRef,
    compositionRef: input.composition.contract.contractRef,
    compositionDigest: input.composition.contract.contractDigest,
    compositionClosureContractRef:
      input.composition.contract.closureContractRef,
    compositionRegimeBindings: regimeBindingProjection(input.composition),
    applicationLineageRefs: Object.freeze([...input.applicationLineageRefs]),
    targetCarrierProjection: input.targetCarrierProjection,
    edgeClosureBinding: input.edgeClosureBinding,
    effectRequirementRefs: Object.freeze([...input.effectRequirementRefs]),
    workStages: Object.freeze([...input.workStages])
  });
  return Object.freeze({
    ...structural,
    sourceDigest: stableSha256Digest(structural),
    currentAuthorityRef: input.currentAuthorityRef,
    currentAuthorityDigest: input.currentAuthorityDigest,
    capabilityDisposition: input.capabilityDisposition,
    startupBlockDigest: input.startupBlockDigest
  });
}

export function projectTraversalContractSourceBasis(
  input: ProjectTraversalContractSourceInput
): TraversalContractSourceBasis {
  const graphFunction = exactGraphFunction({
    module: input.module,
    supplied: input.executionSubjectGraphFunction,
    label: "execution subject GraphFunction"
  });
  const declarationOwner = exactGraphFunction({
    module: input.module,
    supplied: input.declarationOwnerGraphFunction,
    label: "declaration owner GraphFunction"
  });
  const graphVector = exactGraphVector({
    graphFunction,
    supplied: input.graphVector
  });
  const recompiled = compileGraphVectorExecutionHandoff({
    graphFunction,
    graphVector,
    graphFunctions: input.module.graphFunctions,
    module: input.module,
    targetCarrierDefaults: input.targetCarrierDefaults,
    admittedTenantConformanceManifest:
      input.admittedTenantConformanceManifest
  });
  if (!stableJsonEquals(recompiled, input.outcome)) {
    fail({
      diagnosticId: "traversal-source-invalid",
      actualRelation: "T-255 source outcome did not recompile exactly",
      evidenceRefs: [graphFunction.id, graphVector.id]
    });
  }

  if (input.kind === "selected_program_handoff") {
    if (
      recompiled.status !== "published_startup_blocked" &&
      recompiled.status !== "blocked_capability"
    ) {
      fail({
        diagnosticId: "traversal-source-invalid",
        actualRelation: "selected traversal source must be a T-255 selected-program outcome",
        evidenceRefs: [graphFunction.id, graphVector.id]
      });
    }
    const carrier = selectedCarrier(recompiled);
    const composition = selectedComposition(carrier);
    if (
      composition.contract.host.graphFunctionRef !== declarationOwner.id
    ) {
      fail({
        diagnosticId: "traversal-source-invalid",
        actualRelation: "selected traversal composition owner differs from the supplied declaration owner",
        evidenceRefs: [composition.selectionRef, declarationOwner.id]
      });
    }
    const capabilityDisposition =
      recompiled.status === "published_startup_blocked"
        ? recompiled.handoff.capabilityCompatibility.disposition
        : "unresolved";
    const plan = carrier.completeProgramPlan;
    assertCompiledCProgramPlan(plan);
    const inventory = planInventory(plan);
    const application = selectedApplication({ carrier });
    return sourceBasis({
      sourceKind: input.kind,
      sourceRef: carrier.programBinding.selectedProgramRef,
      currentAuthorityRef:
        recompiled.status === "published_startup_blocked"
          ? recompiled.handoff.handoffRef
          : carrier.programBinding.selectedProgramRef,
      currentAuthorityDigest:
        recompiled.status === "published_startup_blocked"
          ? recompiled.handoff.handoffDigest
          : stableSha256Digest(recompiled),
      module: input.module,
      graphFunction,
      declarationOwnerGraphFunction: declarationOwner,
      graphVector,
      selectedProgramRef: carrier.programBinding.selectedProgramRef,
      selectedProgramBindingDigest: carrier.programBinding.bindingDigest,
      completeProgramPlan: plan,
      authoredProgramNodeRefs: inventory.authoredProgramNodeRefs,
      resultBearingProgramLocusRefs:
        inventory.resultBearingProgramLocusRefs,
      planExecutionGraphFunctionRef: plan.executionGraphFunctionRef,
      applicationKind: application.kind,
      applicationConservationRefs: application.refs,
      composition,
      applicationLineageRefs:
        carrier.applicationLineage === null
          ? Object.freeze([])
          : Object.freeze([
              carrier.applicationLineage.lineageRef,
              carrier.applicationLineage.lineageDigest
            ]),
      targetCarrierProjection: carrier.targetCarrierProjection,
      edgeClosureBinding: carrier.edgeClosureBinding,
      effectRequirementRefs: Object.freeze([...graphFunction.effects]),
      workStages: inventory.workStages,
      capabilityDisposition,
      startupBlockDigest:
        recompiled.status === "published_startup_blocked"
          ? recompiled.handoff.startupBlock.blockDigest
          : null
    });
  }

  if (recompiled.status !== "structural_only") {
    fail({
      diagnosticId: "traversal-source-invalid",
      actualRelation: "structural HOF traversal source must remain selector-free",
      evidenceRefs: [graphFunction.id, graphVector.id]
    });
  }
  const relationCompilation = compileHofRelation({
    graphFunction,
    graphFunctions: input.module.graphFunctions
  });
  if (
    !relationCompilation.accepted ||
    relationCompilation.relation === null ||
    !stableJsonEquals(relationCompilation.relation, input.relation)
  ) {
    fail({
      diagnosticId: "traversal-source-invalid",
      actualRelation: "structural HOF relation did not recompile exactly",
      evidenceRefs: [graphFunction.id]
    });
  }
  const binding = compileHofFanOutBinding({
    module: input.module,
    relation: input.relation,
    childExecutionHandoff: input.childExecutionHandoff
  });
  if (!stableJsonEquals(binding, input.binding)) {
    fail({
      diagnosticId: "traversal-source-invalid",
      actualRelation: "structural HOF binding did not recompile exactly",
      evidenceRefs: [input.relation.relationBindingRef]
    });
  }
  assertCompiledHofFanOutBinding(binding);
  const childCarrier = selectedCarrier(input.childExecutionHandoff);
  const composition = selectedComposition(childCarrier);
  if (composition.contract.host.graphFunctionRef !== declarationOwner.id) {
    fail({
      diagnosticId: "traversal-source-invalid",
      actualRelation: "structural HOF child composition owner differs from the supplied owner",
      evidenceRefs: [composition.selectionRef, declarationOwner.id]
    });
  }
  const plan = childCarrier.completeProgramPlan;
  assertCompiledCProgramPlan(plan);
  const inventory = planInventory(plan);
  const fanOutApplicationRefs = Object.freeze([
    input.relation.relationBindingRef,
    input.relation.declarationRelationRef,
    input.relation.relationDigest,
    input.binding.bindingRef,
    input.binding.bindingDigest,
    input.binding.relationBindingRef,
    input.binding.childGraphFunctionRef,
    input.binding.childGraphFunctionDigest,
    input.binding.childProgramBindingDigest,
    input.binding.inputVectorContractKey,
    input.binding.outputVectorContractKey
  ]);
  return sourceBasis({
    sourceKind: input.kind,
    sourceRef: binding.bindingRef,
    currentAuthorityRef: binding.bindingRef,
    currentAuthorityDigest: binding.bindingDigest,
    module: input.module,
    graphFunction,
    declarationOwnerGraphFunction: declarationOwner,
    graphVector,
    selectedProgramRef: childCarrier.programBinding.selectedProgramRef,
    selectedProgramBindingDigest: childCarrier.programBinding.bindingDigest,
    completeProgramPlan: plan,
    authoredProgramNodeRefs: inventory.authoredProgramNodeRefs,
    resultBearingProgramLocusRefs:
      inventory.resultBearingProgramLocusRefs,
    planExecutionGraphFunctionRef: plan.executionGraphFunctionRef,
    applicationKind: "fan_out",
    applicationConservationRefs: fanOutApplicationRefs,
    composition,
    applicationLineageRefs: Object.freeze([
      binding.relationBindingRef,
      binding.relationDigest
    ]),
    targetCarrierProjection: recompiled.targetCarrierProjection,
    edgeClosureBinding: recompiled.edgeClosureBinding,
    effectRequirementRefs: Object.freeze([...graphFunction.effects]),
    workStages: inventory.workStages,
    capabilityDisposition: "unresolved",
    startupBlockDigest: null
  });
}

function exactSourceStage(input: {
  readonly source: TraversalContractSourceBasis;
  readonly stageOrdinal: number;
}): TraversalContractWorkStage {
  const matches = input.source.workStages.filter(
    (stage) => stage.ordinal === input.stageOrdinal
  );
  const stage = matches[0];
  if (matches.length !== 1 || stage === undefined) {
    fail({
      diagnosticId: "traversal-result-authority-invalid",
      actualRelation: `stage ordinal ${String(input.stageOrdinal)} does not resolve exactly`,
      evidenceRefs: [input.source.sourceDigest]
    });
  }
  return stage;
}

function resultAuthorityBasis(
  authority: Omit<
    AdmittedTraversalStageResultAuthority,
    | "authorityRef"
    | "authorityDigest"
    | "currentSourceAuthorityRef"
    | "currentSourceAuthorityDigest"
    | "currentEvidenceRefs"
    | "currentAuthorityWitnessDigest"
  >
) {
  return Object.freeze({
    kind: authority.kind,
    sourceKind: authority.sourceKind,
    sourceDigest: authority.sourceDigest,
    stageOrdinal: authority.stageOrdinal,
    programLocusRef: authority.programLocusRef,
    programLocusDigest: authority.programLocusDigest,
    sourceStageDigest: authority.sourceStageDigest,
    declaredStageTermDigest: authority.declaredStageTermDigest,
    domainStageRole: authority.domainStageRole,
    compositionStageRole: authority.compositionStageRole,
    regime: authority.regime,
    selectedResultContractRef: authority.selectedResultContractRef,
    resultEnvelopeContractRef: authority.resultEnvelopeContractRef,
    resultCarrierKind: authority.resultCarrierKind,
    outputCarrierRefs: Object.freeze([...authority.outputCarrierRefs]),
    producedCarrierRefs: Object.freeze([...authority.producedCarrierRefs]),
    selectorAuthorityRefs: Object.freeze([...authority.selectorAuthorityRefs]),
    evidenceRefs: Object.freeze([...authority.evidenceRefs])
  });
}

function currentAuthorityWitnessBasis(
  authority: Pick<
    AdmittedTraversalStageResultAuthority,
    | "kind"
    | "sourceKind"
    | "sourceDigest"
    | "programLocusRef"
    | "sourceStageDigest"
    | "currentSourceAuthorityRef"
    | "currentSourceAuthorityDigest"
    | "currentEvidenceRefs"
  >
) {
  return Object.freeze({
    kind: authority.kind,
    sourceKind: authority.sourceKind,
    sourceDigest: authority.sourceDigest,
    programLocusRef: authority.programLocusRef,
    sourceStageDigest: authority.sourceStageDigest,
    currentSourceAuthorityRef: authority.currentSourceAuthorityRef,
    currentSourceAuthorityDigest: authority.currentSourceAuthorityDigest,
    currentEvidenceRefs: Object.freeze([...authority.currentEvidenceRefs])
  });
}

export function assertAdmittedTraversalStageResultAuthority(
  authority: AdmittedTraversalStageResultAuthority
): void {
  const expectedDigest = stableSha256Digest(resultAuthorityBasis(authority));
  const expectedCurrentAuthorityWitnessDigest = stableSha256Digest(
    currentAuthorityWitnessBasis(authority)
  );
  const expectedRef =
    `abg://traversal-stage-result-authority/${expectedDigest.slice("sha256:".length)}`;
  if (
    authority.kind !== "admitted_traversal_stage_result_authority" ||
    authority.authorityDigest !== expectedDigest ||
    authority.authorityRef !== expectedRef ||
    authority.currentAuthorityWitnessDigest !==
      expectedCurrentAuthorityWitnessDigest
  ) {
    fail({
      diagnosticId: "traversal-result-authority-invalid",
      actualRelation: "admitted traversal stage-result authority identity is invalid",
      evidenceRefs: [authority.authorityRef, authority.authorityDigest]
    });
  }
}

function sealResultAuthority(input: {
  readonly source: TraversalContractSourceBasis;
  readonly stage: TraversalContractWorkStage;
  readonly sourceKind: TraversalResultAuthoritySourceKind;
  readonly currentSourceAuthorityRef: string;
  readonly currentSourceAuthorityDigest: `sha256:${string}`;
  readonly declaredStageTermDigest: `sha256:${string}` | null;
  readonly selectedResultContractRef: string;
  readonly resultEnvelopeContractRef: string;
  readonly selectorAuthorityRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly currentEvidenceRefs: readonly string[];
}): AdmittedTraversalStageResultAuthority {
  const resultCarrierKind = input.stage.outputCarrierRefs[0];
  if (resultCarrierKind === undefined) {
    fail({
      diagnosticId: "traversal-result-authority-invalid",
      actualRelation: "result-bearing stage has no output carrier",
      evidenceRefs: [input.stage.sourceStageDigest]
    });
  }
  const structural = resultAuthorityBasis(Object.freeze({
    kind: "admitted_traversal_stage_result_authority" as const,
    sourceKind: input.sourceKind,
    sourceDigest: input.source.sourceDigest,
    stageOrdinal: input.stage.ordinal,
    programLocusRef: input.stage.programLocusRef,
    programLocusDigest: input.stage.programLocusDigest,
    sourceStageDigest: input.stage.sourceStageDigest,
    declaredStageTermDigest: input.declaredStageTermDigest,
    domainStageRole: input.stage.domainStageRole,
    compositionStageRole: input.stage.compositionStageRole,
    regime: input.stage.regime,
    selectedResultContractRef: input.selectedResultContractRef,
    resultEnvelopeContractRef: input.resultEnvelopeContractRef,
    resultCarrierKind,
    outputCarrierRefs: Object.freeze([...input.stage.outputCarrierRefs]),
    producedCarrierRefs: Object.freeze([...input.stage.outputCarrierRefs]),
    selectorAuthorityRefs: Object.freeze([...input.selectorAuthorityRefs]),
    evidenceRefs: Object.freeze([...input.evidenceRefs])
  }));
  const currentAuthority = Object.freeze({
    kind: structural.kind,
    sourceKind: structural.sourceKind,
    sourceDigest: structural.sourceDigest,
    programLocusRef: structural.programLocusRef,
    sourceStageDigest: structural.sourceStageDigest,
    currentSourceAuthorityRef: input.currentSourceAuthorityRef,
    currentSourceAuthorityDigest: input.currentSourceAuthorityDigest,
    currentEvidenceRefs: Object.freeze([...input.currentEvidenceRefs])
  });
  const authorityDigest = stableSha256Digest(structural);
  return Object.freeze({
    ...structural,
    authorityRef:
      `abg://traversal-stage-result-authority/${authorityDigest.slice("sha256:".length)}`,
    authorityDigest,
    currentSourceAuthorityRef: currentAuthority.currentSourceAuthorityRef,
    currentSourceAuthorityDigest: currentAuthority.currentSourceAuthorityDigest,
    currentEvidenceRefs: currentAuthority.currentEvidenceRefs,
    currentAuthorityWitnessDigest: stableSha256Digest(currentAuthority)
  });
}

export function admitProgramLocusTraversalStageResultAuthority(input: {
  readonly source: TraversalContractSourceBasis;
  readonly programLocusRef: string;
}): AdmittedTraversalStageResultAuthority {
  const matches = input.source.workStages.filter(
    (stage) => stage.programLocusRef === input.programLocusRef
  );
  const stage = matches[0];
  if (matches.length !== 1 || stage === undefined) {
    fail({
      diagnosticId: "traversal-result-authority-invalid",
      actualRelation:
        "program locus result authority must resolve one exact invoking locus",
      evidenceRefs: [input.source.completeProgramPlan.planRef, input.programLocusRef]
    });
  }
  const selectedResultContractRef = stage.resultBearing
    ? input.source.targetCarrierProjection.targetCarrierContractRef
    : stage.outputCarrierRefs[0]!;
  const resultEnvelopeContractRef = stage.resultBearing
    ? input.source.targetCarrierProjection.envelopeContractRef
    : stage.outputCarrierRefs[0]!;
  return sealResultAuthority({
    source: input.source,
    stage,
    sourceKind: "program_locus_contract",
    currentSourceAuthorityRef: input.source.completeProgramPlan.planRef,
    currentSourceAuthorityDigest: input.source.completeProgramPlan.planDigest,
    declaredStageTermDigest: null,
    selectedResultContractRef,
    resultEnvelopeContractRef,
    selectorAuthorityRefs: Object.freeze([
      input.source.completeProgramPlan.planRef,
      stage.programLocusRef,
      stage.sourceAuthorityRef
    ]),
    evidenceRefs: Object.freeze([
      input.source.completeProgramPlan.planDigest,
      stage.programLocusDigest,
      stage.sourceStageDigest
    ]),
    currentEvidenceRefs: Object.freeze([
      input.source.selectedProgramBindingDigest,
      input.source.compositionSelectionRef
    ])
  });
}

export function admitDeclaredTraversalStageResultAuthority(input: {
  readonly source: TraversalContractSourceBasis;
  readonly stageOrdinal: number;
  readonly contract: CompiledExecutionContextContract;
  readonly selectedResultContractRef: string;
  readonly fpWireProfile: FpResultWireProfile | null;
}): AdmittedTraversalStageResultAuthority {
  const stage = exactSourceStage(input);
  const selectedStage = input.contract.selectedStage;
  try {
    assertCompiledExecutionContextContract(input.contract);
  } catch (error: unknown) {
    fail({
      diagnosticId: "traversal-result-authority-invalid",
      actualRelation:
        "declared execution-context contract identity is not current: " +
        errorMessage(error),
      evidenceRefs: [input.contract.contractRef, input.contract.contractDigest]
    });
  }
  const publishedSource = input.source.startupBlockDigest !== null;
  const expectedSourceOutcomeStatus = publishedSource
    ? "published_startup_blocked"
    : "blocked_capability";
  const expectedPublishedHandoffRef = publishedSource
    ? input.source.currentAuthorityRef
    : null;
  const expectedResultContractRef = stage.resultBearing
    ? input.selectedResultContractRef
    : stage.outputCarrierRefs[0];
  if (
    input.source.sourceKind !== "selected_program_handoff" ||
    (stage.regime !== "F_P" && stage.regime !== "F_H") ||
    stage.declaredStageIndex === null ||
    input.contract.sourceOutcomeStatus !== expectedSourceOutcomeStatus ||
    input.contract.sourceBasisDigest !== input.source.currentAuthorityDigest ||
    input.contract.publishedHandoffRef !== expectedPublishedHandoffRef ||
    input.contract.selectedStageIndex !== stage.declaredStageIndex ||
    input.contract.selectedRegime !== stage.regime ||
    selectedStage.stageRole !== stage.domainStageRole ||
    selectedStage.defaultRegime !== stage.regime ||
    selectedStage.armId !== stage.armId ||
    selectedStage.resultBearing !== stage.resultBearing ||
    !stableJsonEquals(
      selectedStage.instructionCategoryRefs ?? Object.freeze([]),
      stage.instructionCategoryRefs
    ) ||
    input.contract.selectedProgramBinding.bindingDigest !==
      input.source.selectedProgramBindingDigest ||
    expectedResultContractRef === undefined ||
    input.selectedResultContractRef !== expectedResultContractRef ||
    (stage.resultBearing &&
      !input.contract.targetCompatibilityRefs.includes(
        input.selectedResultContractRef
      ))
  ) {
    fail({
      diagnosticId: "traversal-result-authority-invalid",
      actualRelation: "declared execution-context contract does not match the exact traversal source stage",
      evidenceRefs: [
        input.source.sourceDigest,
        input.contract.contractRef,
        stage.programLocusRef,
        stage.sourceStageDigest,
        input.contract.selectedStageDigest
      ]
    });
  }
  if (
    (stage.regime === "F_P" && input.fpWireProfile === null) ||
    (stage.regime === "F_H" && input.fpWireProfile !== null)
  ) {
    fail({
      diagnosticId: "traversal-result-authority-invalid",
      actualRelation: "declared result authority profile does not match the selected regime",
      evidenceRefs: [input.contract.contractRef]
    });
  }
  const selectorAuthorityRefs =
    stage.regime === "F_P"
      ? Object.freeze([
          input.selectedResultContractRef,
          `fp-result-wire-profile:${input.fpWireProfile ?? "invalid"}`,
          ...internalFpResultWireProfileFields(input.fpWireProfile!)
        ])
      : Object.freeze([
          input.selectedResultContractRef,
          ...FH_PUBLIC_OPERATION_ID_VALUES.map(
            (operationId) => `fh-operation:${operationId}`
          )
        ]);
  return sealResultAuthority({
    source: input.source,
    stage,
    sourceKind:
      stage.regime === "F_P"
        ? "declared_fp_contract"
        : "declared_fh_contract",
    currentSourceAuthorityRef: input.contract.contractRef,
    currentSourceAuthorityDigest: input.contract.contractDigest,
    declaredStageTermDigest: input.contract.selectedStageDigest,
    selectedResultContractRef: input.selectedResultContractRef,
    resultEnvelopeContractRef: input.selectedResultContractRef,
    selectorAuthorityRefs,
    evidenceRefs: Object.freeze([
      input.contract.selectedStageDigest,
      input.contract.targetBindingDigest
    ]),
    currentEvidenceRefs: Object.freeze([
      input.contract.declarationClosureDigest
    ])
  });
}

export function admitDeterministicTraversalStageResultAuthority(input: {
  readonly source: TraversalContractSourceBasis;
  readonly stageOrdinal: number;
}): AdmittedTraversalStageResultAuthority {
  const stage = exactSourceStage(input);
  if (stage.regime !== "F_D") {
    fail({
      diagnosticId: "traversal-result-authority-invalid",
      actualRelation: "deterministic result authority requires an F_D source stage",
      evidenceRefs: [stage.sourceStageDigest]
    });
  }
  const selectedResultContractRef = stage.resultBearing
    ? input.source.targetCarrierProjection.targetCarrierContractRef
    : stage.outputCarrierRefs[0]!;
  return sealResultAuthority({
    source: input.source,
    stage,
    sourceKind: "deterministic_target_contract",
    currentSourceAuthorityRef: stage.sourceAuthorityRef,
    currentSourceAuthorityDigest: stage.sourceAuthorityDigest,
    declaredStageTermDigest: null,
    selectedResultContractRef,
    resultEnvelopeContractRef: stage.resultBearing
      ? input.source.targetCarrierProjection.envelopeContractRef
      : stage.outputCarrierRefs[0]!,
    selectorAuthorityRefs: Object.freeze([
      stage.sourceAuthorityRef,
      input.source.targetCarrierProjection.targetCarrierContractRef
    ]),
    evidenceRefs: Object.freeze([
      stage.sourceAuthorityDigest,
      input.source.targetCarrierProjection.targetCarrierContractDigest
    ]),
    currentEvidenceRefs: Object.freeze([])
  });
}

function runtimeAtomView(atom: TraversalRuntimeAtomAuthority): {
  readonly ref: string;
  readonly digest: `sha256:${string}`;
  readonly sourceBindingRef: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
} {
  switch (atom.kind) {
    case "compiled_workflow_lift_binding":
      assertCompiledWorkflowLiftBinding(atom);
      return Object.freeze({
        ref: atom.bindingRef,
        digest: atom.bindingDigest,
        sourceBindingRef: atom.bindingRef,
        inputCarrierRef: atom.inputCarrierRef,
        outputCarrierRef: atom.outputCarrierRef
      });
    case "compiled_c_retry_binding":
      assertCompiledCRetryBinding(atom);
      return Object.freeze({
        ref: atom.bindingRef,
        digest: atom.bindingDigest,
        sourceBindingRef: atom.bindingRef,
        inputCarrierRef: atom.inputCarrierRef,
        outputCarrierRef: atom.outputCarrierRef
      });
    case "compiled_c_batch_plan":
      assertCompiledCBatchPlan(atom);
      return Object.freeze({
        ref: atom.planRef,
        digest: atom.planDigest,
        sourceBindingRef: atom.sourceBindingRef,
        inputCarrierRef: atom.inputCarrierRef,
        outputCarrierRef: atom.outputCarrierRef
      });
    case "compiled_hof_fan_out_binding":
      assertCompiledHofFanOutBinding(atom);
      return Object.freeze({
        ref: atom.bindingRef,
        digest: atom.bindingDigest,
        sourceBindingRef: atom.bindingRef,
        inputCarrierRef: atom.inputVectorContractKey,
        outputCarrierRef: atom.outputVectorContractKey
      });
    case "compiled_fan_in_reduction_binding":
      assertCompiledFanInReductionBinding(atom);
      return Object.freeze({
        ref: atom.bindingRef,
        digest: atom.bindingDigest,
        sourceBindingRef: atom.relationRef,
        inputCarrierRef: atom.inputVectorContractKey,
        outputCarrierRef: atom.outputContractKey
      });
    case "compiled_typed_recurse_plan":
      assertCompiledTypedRecursePlan(atom);
      return Object.freeze({
        ref: atom.planRef,
        digest: atom.planDigest,
        sourceBindingRef: atom.applicationRelationRef,
        inputCarrierRef: atom.inputCarrierRef,
        outputCarrierRef: atom.outputCarrierRef
      });
  }
}

export function admitRuntimeAtomTraversalStageResultAuthority(input: {
  readonly source: TraversalContractSourceBasis;
  readonly stageOrdinal: number;
  readonly atom: TraversalRuntimeAtomAuthority;
}): AdmittedTraversalStageResultAuthority {
  const stage = exactSourceStage(input);
  const atom = runtimeAtomView(input.atom);
  if (
    atom.sourceBindingRef !== stage.sourceAuthorityRef ||
    !stage.inputCarrierRefs.includes(atom.inputCarrierRef) ||
    !stage.outputCarrierRefs.includes(atom.outputCarrierRef)
  ) {
    fail({
      diagnosticId: "traversal-result-authority-invalid",
      actualRelation: "runtime atom does not preserve the exact source stage binding and carriers",
      evidenceRefs: [stage.sourceStageDigest, atom.ref, atom.digest]
    });
  }
  return sealResultAuthority({
    source: input.source,
    stage,
    sourceKind: "runtime_atom_contract",
    currentSourceAuthorityRef: atom.ref,
    currentSourceAuthorityDigest: atom.digest,
    declaredStageTermDigest: null,
    selectedResultContractRef: atom.outputCarrierRef,
    resultEnvelopeContractRef: atom.outputCarrierRef,
    selectorAuthorityRefs: Object.freeze([
      atom.ref,
      stage.sourceAuthorityRef
    ]),
    evidenceRefs: Object.freeze([
      atom.digest,
      stage.sourceAuthorityDigest
    ]),
    currentEvidenceRefs: Object.freeze([])
  });
}

function stagePurpose(role: EngineComputeStageRole): EngineComputeStagePurpose {
  switch (role) {
    case "transform":
      return "candidate_construction";
    case "evaluate":
      return "candidate_evaluation";
    case "consequence":
      return "consequence_projection";
    case "human_callout":
      return "external_human_callout";
  }
}

function regimeDispositions(input: {
  readonly regime: RuntimeRegime;
  readonly regimeBindingRef: string;
  readonly evidenceRefs: readonly string[];
}): readonly GtlProgramStageRegimeDispositionRow[] {
  return Object.freeze(
    (["F_D", "F_P", "F_H"] as const).map((regime) => {
      if (regime === input.regime) {
        return Object.freeze({
          regime,
          disposition:
            regime === "F_H" ? "external_callout" as const : "participates" as const,
          selectedRegimeBindingRefs:
            regime === "F_H"
              ? Object.freeze([])
              : Object.freeze([input.regimeBindingRef]),
          reasonRefs:
            regime === "F_H"
              ? Object.freeze(["reason://abg/external-human-callout"])
              : Object.freeze([]),
          evidenceRefs: Object.freeze([...input.evidenceRefs])
        });
      }
      return Object.freeze({
        regime,
        disposition: "not_used" as const,
        selectedRegimeBindingRefs: Object.freeze([]),
        reasonRefs: Object.freeze([
          `reason://abg/traversal-stage/${input.regime}/selected`
        ]),
        evidenceRefs: Object.freeze([...input.evidenceRefs])
      });
    })
  );
}

interface CompiledStageSeed {
  readonly role: EngineComputeStageRole;
  readonly regime: RuntimeRegime;
  readonly programLocusRef: string;
  readonly programLocusDigest: `sha256:${string}`;
  readonly sourcePath: string;
  readonly domainStageRole: string | null;
  readonly sequenceOrdinal: number;
  readonly taskOrdinal: number | null;
  readonly predecessorProgramLocusRefs: readonly string[];
  readonly resultBearing: boolean;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly regimeBindingRef: string;
  readonly selectorAuthorityRefs: readonly string[];
  readonly resultEnvelopeContractRef: string;
  readonly resultCarrierKind: string;
  readonly sourceEvidenceRefs: readonly string[];
}

function stageSeeds(input: {
  readonly source: TraversalContractSourceBasis;
  readonly authorities: readonly AdmittedTraversalStageResultAuthority[];
}): readonly CompiledStageSeed[] {
  return Object.freeze(input.source.workStages.map((work) => {
    const authorities = input.authorities.filter(
      (authority) => authority.programLocusRef === work.programLocusRef
    );
    const authority = authorities[0];
    const regimeBinding = input.source.compositionRegimeBindings.find(
      (binding) => binding.bindingRef === work.compositionRegimeBindingRef
    );
    if (
      authorities.length !== 1 ||
      authority === undefined ||
      authority.programLocusDigest !== work.programLocusDigest ||
      authority.sourceStageDigest !== work.sourceStageDigest ||
      authority.compositionStageRole !== work.compositionStageRole ||
      authority.regime !== work.regime ||
      regimeBinding === undefined ||
      regimeBinding.stageRole !== work.compositionStageRole ||
      regimeBinding.regime !== work.regime
    ) {
      fail({
        diagnosticId: "traversal-contract-bundle-invalid",
        actualRelation:
          "authored program locus lost its exact result authority or composition regime binding",
        evidenceRefs: [
          input.source.completeProgramPlan.planRef,
          work.programLocusRef,
          work.sourceStageDigest,
          work.compositionRegimeBindingRef
        ]
      });
    }
    return Object.freeze({
      role: work.compositionStageRole,
      regime: work.regime,
      programLocusRef: work.programLocusRef,
      programLocusDigest: work.programLocusDigest,
      sourcePath: work.sourcePath,
      domainStageRole: work.domainStageRole,
      sequenceOrdinal: work.sequenceOrdinal,
      taskOrdinal: work.taskOrdinal,
      predecessorProgramLocusRefs: Object.freeze([
        ...work.predecessorProgramLocusRefs
      ]),
      resultBearing: work.resultBearing,
      inputCarrierRefs: Object.freeze([...work.inputCarrierRefs]),
      outputCarrierRefs: Object.freeze([...authority.outputCarrierRefs]),
      regimeBindingRef: work.compositionRegimeBindingRef,
      selectorAuthorityRefs: Object.freeze([
        ...authority.selectorAuthorityRefs
      ]),
      resultEnvelopeContractRef: authority.resultEnvelopeContractRef,
      resultCarrierKind: authority.resultCarrierKind,
      sourceEvidenceRefs: Object.freeze([
        work.sourceStageDigest,
        authority.authorityRef,
        authority.authorityDigest
      ])
    });
  }));
}

function stageBindingRef(input: {
  readonly compositionRef: string;
  readonly programLocusRef: string;
  readonly programLocusDigest: `sha256:${string}`;
}): string {
  return `abg://traversal-stage/${stableSha256Digest(input).slice("sha256:".length)}`;
}

function traversalVectorIdentityRef(
  source: TraversalContractSourceBasis
): string {
  return (
    `${source.graphFunctionRef}/${source.graphRef}/${source.graphVectorRef}` +
    `#${source.graphFunctionId}:${source.graphId}:${source.graphVectorId}`
  );
}

function compileRows(input: {
  readonly source: TraversalContractSourceBasis;
  readonly authorities: readonly AdmittedTraversalStageResultAuthority[];
}): Omit<
  CompiledTraversalExecutionContracts,
  "kind" | "bundleRef" | "bundleDigest" | "sourceDigest" |
  "resultAuthorityDigests"
> {
  const seeds = stageSeeds(input);
  const compositionRef =
    `abg://traversal-compute-composition/${input.source.sourceDigest.slice("sha256:".length)}`;
  const compositionDigest = stableSha256Digest({
    sourceDigest: input.source.sourceDigest,
    selectedCompositionRef: input.source.compositionRef,
    selectedCompositionDigest: input.source.compositionDigest,
    stageSeeds: seeds
  });
  const stageRefs = seeds.map((seed) => stageBindingRef({
    compositionRef,
    programLocusRef: seed.programLocusRef,
    programLocusDigest: seed.programLocusDigest
  }));
  const stageRefByLocus = new Map(
    seeds.map((seed, ordinal) => [seed.programLocusRef, stageRefs[ordinal]!])
  );
  const computeStageBindings = Object.freeze(
    seeds.map((seed, ordinal): GtlProgramComputeStageBindingRow =>
      Object.freeze({
        stageBindingRef: stageRefs[ordinal]!,
        compositionRef,
        compositionDigest,
        stageRole: seed.role,
        stageNotationRef: `notation://abg/${seed.role}.C`,
        stagePurpose: stagePurpose(seed.role),
        computeMeans: seed.regime,
        inputCarrierRefs: Object.freeze([...seed.inputCarrierRefs]),
        outputCarrierRefs: Object.freeze([...seed.outputCarrierRefs]),
        predecessorStageBindingRefs: Object.freeze(
          seed.predecessorProgramLocusRefs.map((programLocusRef) => {
            const stageRef = stageRefByLocus.get(programLocusRef);
            if (stageRef === undefined) {
              fail({
                diagnosticId: "traversal-contract-bundle-invalid",
                actualRelation:
                  "authored predecessor locus does not resolve to a compiled stage binding",
                evidenceRefs: [seed.programLocusRef, programLocusRef]
              });
            }
            return stageRef;
          })
        ),
        pluginContractRefs: Object.freeze([]),
        hookRefs: Object.freeze([]),
        regimeDispositions: regimeDispositions({
          regime: seed.regime,
          regimeBindingRef: seed.regimeBindingRef,
          evidenceRefs: seed.sourceEvidenceRefs
        }),
        mayWriteLedgers: false,
        mayEmitRuntimeEvents: false,
        maySelectTraversal: false,
        mayCloseTraversal: false,
        mayOwnIterationLoop: false,
        stageKind: "authored_program_stage",
        programPlanRef: input.source.completeProgramPlan.planRef,
        programPlanDigest: input.source.completeProgramPlan.planDigest,
        programLocusRef: seed.programLocusRef,
        programLocusDigest: seed.programLocusDigest,
        sourcePath: seed.sourcePath,
        domainStageRole: seed.domainStageRole,
        sequenceOrdinal: seed.sequenceOrdinal,
        taskOrdinal: seed.taskOrdinal,
        resultBearing: seed.resultBearing,
        evidenceRefs: Object.freeze([
          input.source.sourceDigest,
          ...seed.sourceEvidenceRefs
        ])
      })
    )
  );
  const computeComposition: GtlProgramComputeCompositionRow = Object.freeze({
    compositionRef,
    compositionDigest,
    hostKind: "graph_vector",
    hostRef: traversalVectorIdentityRef(input.source),
    declarationSourceKind: "graph_vector_declaration",
    declarationSourceRef: input.source.compositionRef,
    notationRefs: uniqueRefs([
      "notation://abg/fn<A,B>",
      ...seeds.map((seed) => `notation://abg/${seed.role}.C`)
    ]),
    regimeBindingRefs: uniqueRefs([
      ...input.source.compositionRegimeBindings.map((row) => row.bindingRef),
      ...seeds.map((seed) => seed.regimeBindingRef)
    ]),
    stageBindingRefs: Object.freeze(stageRefs),
    closureContractRef: input.source.compositionClosureContractRef,
    programPlanRef: input.source.completeProgramPlan.planRef,
    programPlanDigest: input.source.completeProgramPlan.planDigest,
    authoredProgramNodeRefs: Object.freeze([
      ...input.source.authoredProgramNodeRefs
    ]),
    invokingProgramLocusRefs: Object.freeze([
      ...input.source.invokingProgramLocusRefs
    ]),
    resultBearingProgramLocusRefs: Object.freeze([
      ...input.source.resultBearingProgramLocusRefs
    ]),
    evidenceRefs: Object.freeze([
      input.source.compositionSelectionRef,
      input.source.compositionRef,
      input.source.compositionDigest
    ])
  });
  const requiredIdentityFieldRefs = Object.freeze([
    "compositionRef",
    "compositionDigest",
    "compositionSelectionRef",
    "programLocusRef",
    "stageRole",
    "computeMeans",
    "outputCarrierRefs",
    "evidenceRefs"
  ]);
  const pluginResultInterfaces = Object.freeze(
    seeds.map((seed, ordinal): GtlProgramPluginResultInterfaceRow => {
      const resultBasis = Object.freeze({
        sourceDigest: input.source.sourceDigest,
        stageBindingRef: stageRefs[ordinal],
        role: seed.role,
        programLocusRef: seed.programLocusRef,
        programLocusDigest: seed.programLocusDigest,
        resultEnvelopeContractRef: seed.resultEnvelopeContractRef,
        resultCarrierKind: seed.resultCarrierKind,
        selectorAuthorityRefs: seed.selectorAuthorityRefs
      });
      return Object.freeze({
        resultInterfaceRef:
          `abg://traversal-result-interface/${stableSha256Digest(resultBasis).slice("sha256:".length)}`,
        stageBindingRef: stageRefs[ordinal]!,
        compositionRef,
        compositionDigest,
        stageRole: seed.role,
        computeMeans: seed.regime,
        resultEnvelopeContractRef: seed.resultEnvelopeContractRef,
        resultCarrierKind: seed.resultCarrierKind,
        outputCarrierRefs: Object.freeze([...seed.outputCarrierRefs]),
        producedCarrierRefs: Object.freeze([...seed.outputCarrierRefs]),
        requiredIdentityFieldRefs,
        selectorAuthorityRefs: Object.freeze([...seed.selectorAuthorityRefs]),
        evidenceRefs: Object.freeze([
          input.source.sourceDigest,
          ...seed.sourceEvidenceRefs
        ]),
        mayWriteLedgers: false,
        mayEmitRuntimeEvents: false,
        maySelectTraversal: false,
        mayCloseTraversal: false,
        mayOwnIterationLoop: false,
        programLocusRef: seed.programLocusRef,
        programLocusDigest: seed.programLocusDigest,
        resultBearing: seed.resultBearing
      });
    })
  );
  const target = input.source.targetCarrierProjection;
  const closure = input.source.edgeClosureBinding;
  const carriedObligationRefs = Object.freeze([
    target.targetCarrierContractRef,
    closure.closurePreconditionRef,
    ...uniqueRefs(input.authorities.map(
      (authority) => authority.selectedResultContractRef
    )),
    ...input.source.effectRequirementRefs
  ]);
  const residualPressureRefs = Object.freeze([
    closure.edgeAssuranceBindingRef,
    closure.closurePreconditionRef,
    ...input.source.effectRequirementRefs
  ]);
  const conservationBasis = Object.freeze({
    sourceDigest: input.source.sourceDigest,
    targetCarrierContractRef: target.targetCarrierContractRef,
    materializationPolicyRef: target.materializationPolicyRef,
    carriedObligationRefs,
    residualPressureRefs,
    stagedAuthorityRefs: uniqueRefs([
      ...stageRefs,
      ...input.source.authoredProgramNodeRefs,
      ...input.source.invokingProgramLocusRefs,
      ...input.authorities.map((authority) => authority.authorityRef)
    ]),
    downstreamTerminalPressureRefs: Object.freeze([
      input.source.compositionClosureContractRef,
      closure.edgeRef,
      closure.edgeAssuranceBindingRef
    ])
  });
  const traversalBindConservation:
    GtlProgramTraversalBindConservationRow = Object.freeze({
      conservationRef:
        `abg://traversal-bind-conservation/${stableSha256Digest(conservationBasis).slice("sha256:".length)}`,
      graphFunctionRef: input.source.graphFunctionRef,
      graphRef: input.source.graphRef,
      graphVectorRef: input.source.graphVectorRef,
      graphFunctionId: input.source.graphFunctionId,
      graphId: input.source.graphId,
      graphVectorId: input.source.graphVectorId,
      intentLineageRefs: Object.freeze([
        input.source.sourceRef,
        input.source.selectedProgramRef,
        input.source.compositionSelectionRef,
        ...input.source.applicationLineageRefs
      ]),
      targetCarrierBindingRefs: Object.freeze([
        target.targetCarrierContractRef
      ]),
      materializationBindingRefs: Object.freeze([
        target.materializationPolicyRef
      ]),
      carriedObligationRefs,
      residualPressureRefs,
      stagedAuthorityRefs: conservationBasis.stagedAuthorityRefs,
      admissionStrengthRefs: Object.freeze([
        GTL_PROGRAM_BIND_ADMISSION_STRENGTH_COMPATIBILITY_REF
      ]),
      downstreamTerminalPressureRefs:
        conservationBasis.downstreamTerminalPressureRefs,
      programPlanRef: input.source.completeProgramPlan.planRef,
      programPlanDigest: input.source.completeProgramPlan.planDigest,
      authoredProgramNodeRefs: Object.freeze([
        ...input.source.authoredProgramNodeRefs
      ]),
      invokingProgramLocusRefs: Object.freeze([
        ...input.source.invokingProgramLocusRefs
      ]),
      resultBearingProgramLocusRefs: Object.freeze([
        ...input.source.resultBearingProgramLocusRefs
      ]),
      applicationConservationRefs: Object.freeze([
        ...input.source.applicationConservationRefs
      ]),
      allowedObligationDeltaFamilies:
        GTL_PROGRAM_OBLIGATION_DELTA_FAMILY_VALUES,
      evidenceRefs: Object.freeze([
        input.source.sourceDigest,
        input.source.completeProgramPlan.planDigest,
        ...input.authorities.map((authority) => authority.authorityDigest),
        target.targetCarrierContractDigest,
        closure.bindingDigest
      ])
    });
  return Object.freeze({
    computeComposition,
    computeStageBindings,
    pluginResultInterfaces,
    traversalBindConservation
  });
}

function bundleBasis(bundle: Omit<
  CompiledTraversalExecutionContracts,
  "bundleRef" | "bundleDigest"
>): Omit<CompiledTraversalExecutionContracts, "bundleRef" | "bundleDigest"> {
  return Object.freeze({
    kind: bundle.kind,
    sourceDigest: bundle.sourceDigest,
    resultAuthorityDigests: Object.freeze([...bundle.resultAuthorityDigests]),
    computeComposition: bundle.computeComposition,
    computeStageBindings: Object.freeze([...bundle.computeStageBindings]),
    pluginResultInterfaces: Object.freeze([...bundle.pluginResultInterfaces]),
    traversalBindConservation: bundle.traversalBindConservation
  });
}

function orderResultAuthorities(input: {
  readonly source: TraversalContractSourceBasis;
  readonly resultAuthorities:
    readonly AdmittedTraversalStageResultAuthority[];
}): readonly AdmittedTraversalStageResultAuthority[] {
  if (
    input.resultAuthorities.length !== input.source.workStages.length ||
    input.source.workStages.some((stage) =>
      input.resultAuthorities.filter(
        (authority) => authority.programLocusRef === stage.programLocusRef
      ).length !== 1
    )
  ) {
    fail({
      diagnosticId: "traversal-contract-bundle-invalid",
      actualRelation: "every source work stage requires one exact result authority",
      evidenceRefs: [input.source.sourceDigest]
    });
  }
  return Object.freeze(
    input.source.workStages.map((stage) =>
      input.resultAuthorities.find(
        (authority) => authority.programLocusRef === stage.programLocusRef
      )!
    )
  );
}

export function compileTraversalExecutionContracts(input: {
  readonly source: TraversalContractSourceBasis;
  readonly resultAuthorities:
    readonly AdmittedTraversalStageResultAuthority[];
}): CompiledTraversalExecutionContracts {
  const orderedAuthorities = orderResultAuthorities(input);
  for (const authority of orderedAuthorities) {
    assertAdmittedTraversalStageResultAuthority(authority);
    if (authority.sourceDigest !== input.source.sourceDigest) {
      fail({
        diagnosticId: "traversal-contract-bundle-invalid",
        actualRelation: "result authority belongs to a different traversal source",
        evidenceRefs: [input.source.sourceDigest, authority.authorityRef]
      });
    }
  }
  const rows = compileRows({
    source: input.source,
    authorities: orderedAuthorities
  });
  const basis = bundleBasis(Object.freeze({
    kind: "compiled_traversal_execution_contracts" as const,
    sourceDigest: input.source.sourceDigest,
    resultAuthorityDigests: Object.freeze(
      orderedAuthorities.map((authority) => authority.authorityDigest)
    ),
    ...rows
  }));
  const bundleDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    bundleRef:
      `abg://compiled-traversal-execution-contracts/${bundleDigest.slice("sha256:".length)}`,
    bundleDigest
  });
}

export function assertCompiledTraversalExecutionContracts(
  bundle: CompiledTraversalExecutionContracts
): void {
  const expected = stableSha256Digest(bundleBasis(bundle));
  if (
    bundle.kind !== "compiled_traversal_execution_contracts" ||
    bundle.bundleDigest !== expected ||
    bundle.bundleRef !==
      `abg://compiled-traversal-execution-contracts/${expected.slice("sha256:".length)}`
  ) {
    fail({
      diagnosticId: "traversal-contract-bundle-invalid",
      actualRelation: "compiled traversal execution bundle identity is invalid",
      evidenceRefs: [bundle.bundleRef, bundle.bundleDigest]
    });
  }
}

function rowOccursExactlyOnce<T>(
  rows: readonly T[],
  expected: T
): boolean {
  return rows.filter((row) => stableJsonEquals(row, expected)).length === 1;
}

function sameStringMembers(
  actual: readonly string[],
  expected: readonly string[]
): boolean {
  return actual.length === expected.length &&
    expected.every((ref) => actual.includes(ref));
}

const T267_RULE_PREFIXES = Object.freeze([
  "abg://gtl-program/traversal-unit/",
  "abg://gtl-program/traversal-bind-conservation/",
  "abg://gtl-program/compute-composition/",
  "abg://gtl-program/compute-stage/",
  "abg://gtl-program/plugin-result-interface/"
]);

function t267Issue(issue: GtlProgramConformanceIssue): boolean {
  return T267_RULE_PREFIXES.some((prefix) => issue.ruleRef.startsWith(prefix));
}

function admissionBasis<Status extends
  | "static_contracts_admitted_program_blocked"
  | "static_contracts_admitted_capability_blocked"
  | "runtime_addressable_not_closed"
>(input: {
  readonly status: Status;
  readonly source: TraversalContractSourceBasis;
  readonly resultAuthorities:
    readonly AdmittedTraversalStageResultAuthority[];
  readonly bundle: CompiledTraversalExecutionContracts;
  readonly report: GtlProgramConformanceReport;
}) {
  return Object.freeze({
    kind: "traversal_execution_admission_outcome" as const,
    status: input.status,
    sourceKind: input.source.sourceKind,
    sourceRef: input.source.sourceRef,
    sourceDigest: input.source.sourceDigest,
    currentAuthorityRef: input.source.currentAuthorityRef,
    currentAuthorityDigest: input.source.currentAuthorityDigest,
    startupBlockDigest: input.source.startupBlockDigest,
    graphFunctionRef: input.source.graphFunctionRef,
    graphFunctionId: input.source.graphFunctionId,
    graphFunctionDigest: input.source.graphFunctionDigest,
    capabilityDisposition: input.source.capabilityDisposition,
    currentResultAuthorities: Object.freeze(
      input.resultAuthorities.map((authority) => Object.freeze({
        sourceKind: authority.sourceKind,
        stageOrdinal: authority.stageOrdinal,
        programLocusRef: authority.programLocusRef,
        declaredStageTermDigest: authority.declaredStageTermDigest,
        domainStageRole: authority.domainStageRole,
        currentSourceAuthorityRef: authority.currentSourceAuthorityRef,
        currentSourceAuthorityDigest: authority.currentSourceAuthorityDigest
      }))
    ),
    bundleDigest: input.bundle.bundleDigest,
    reportRef: input.report.reportRef
  });
}

function invalidOutcome(error: unknown): TraversalExecutionAdmissionInvalid {
  const failure =
    error instanceof TraversalExecutionContractError
      ? error.diagnostic
      : diagnostic({
          diagnosticId: "traversal-static-unit-nonconformant",
          actualRelation: errorMessage(error),
          evidenceRefs: Object.freeze([])
        });
  return Object.freeze({
    kind: "traversal_execution_admission_outcome" as const,
    status: "invalid" as const,
    runtimeAddressable: false as const,
    effectsPermitted: false as const,
    diagnostic: failure
  });
}

export function admitTraversalExecution(input: {
  readonly sourceInput: ProjectTraversalContractSourceInput;
  readonly source: TraversalContractSourceBasis;
  readonly resultAuthorities:
    readonly AdmittedTraversalStageResultAuthority[];
  readonly bundle: CompiledTraversalExecutionContracts;
  readonly conformanceInput: GtlProgramConformanceInput;
  readonly report: GtlProgramConformanceReport;
}): TraversalExecutionAdmissionOutcome {
  try {
    const source = projectTraversalContractSourceBasis(input.sourceInput);
    if (!stableJsonEquals(source, input.source)) {
      fail({
        diagnosticId: "traversal-source-invalid",
        actualRelation: "submitted traversal source differs from exact reprojection",
        evidenceRefs: [source.sourceDigest, input.source.sourceDigest]
      });
    }
    const orderedResultAuthorities = orderResultAuthorities({
      source,
      resultAuthorities: input.resultAuthorities
    });
    const bundle = compileTraversalExecutionContracts({
      source,
      resultAuthorities: orderedResultAuthorities
    });
    assertCompiledTraversalExecutionContracts(input.bundle);
    if (!stableJsonEquals(bundle, input.bundle)) {
      fail({
        diagnosticId: "traversal-contract-bundle-invalid",
        actualRelation: "submitted traversal bundle differs from exact recompilation",
        evidenceRefs: [bundle.bundleDigest, input.bundle.bundleDigest]
      });
    }
    if (
      !rowOccursExactlyOnce(
        input.conformanceInput.computeCompositions ?? [],
        bundle.computeComposition
      ) ||
      bundle.computeStageBindings.some((row) =>
        !rowOccursExactlyOnce(
          input.conformanceInput.computeStageBindings ?? [],
          row
        )
      ) ||
      bundle.pluginResultInterfaces.some((row) =>
        !rowOccursExactlyOnce(
          input.conformanceInput.pluginResultInterfaces ?? [],
          row
        )
      ) ||
      !rowOccursExactlyOnce(
        input.conformanceInput.traversalBindConservation ?? [],
        bundle.traversalBindConservation
      )
    ) {
      fail({
        diagnosticId: "traversal-conformance-report-stale",
        actualRelation: "conformance input does not contain the exact traversal bundle rows once",
        evidenceRefs: [bundle.bundleDigest]
      });
    }
    const report = typecheckGtlProgram(input.conformanceInput);
    if (!stableJsonEquals(report, input.report)) {
      fail({
        diagnosticId: "traversal-conformance-report-stale",
        actualRelation: "submitted conformance report differs from exact re-typecheck",
        evidenceRefs: [report.reportRef, input.report.reportRef]
      });
    }
    const candidateUnits = report.traversalUnitProjection.units.filter(
      (unit) =>
        unit.graphFunctionId === source.graphFunctionId &&
        unit.graphId === source.graphId &&
        unit.graphVectorId === source.graphVectorId
    );
    const unitMatches = candidateUnits.filter(
      (unit) =>
        unit.targetCarrierContractRef ===
          source.targetCarrierProjection.targetCarrierContractRef &&
        unit.edgeClosureRef === source.edgeClosureBinding.edgeRef &&
        sameStringMembers(unit.computeCompositionRefs, [
          bundle.computeComposition.compositionRef
        ]) &&
        unit.conservationBasisRef ===
          bundle.traversalBindConservation.conservationRef &&
        sameStringMembers(
          unit.computeStageBindingRefs,
          bundle.computeStageBindings.map((row) => row.stageBindingRef)
        ) &&
        sameStringMembers(
          unit.pluginResultInterfaceRefs,
          bundle.pluginResultInterfaces.map((row) => row.resultInterfaceRef)
        ) &&
        sameStringMembers(
          unit.consequencePluginResultInterfaceRefs,
          bundle.pluginResultInterfaces
            .filter((row) => row.stageRole === "consequence")
            .map((row) => row.resultInterfaceRef)
        ) &&
        sameStringMembers(
          unit.resultBearingPluginResultInterfaceRefs,
          bundle.pluginResultInterfaces
            .filter((row) => row.resultBearing === true)
            .map((row) => row.resultInterfaceRef)
        ) &&
        sameStringMembers(unit.programPlanRefs, [
          source.completeProgramPlan.planRef
        ]) &&
        sameStringMembers(unit.programPlanDigests, [
          source.completeProgramPlan.planDigest
        ]) &&
        sameStringMembers(
          unit.authoredProgramNodeRefs,
          source.authoredProgramNodeRefs
        ) &&
        sameStringMembers(
          unit.invokingProgramLocusRefs,
          source.invokingProgramLocusRefs
        ) &&
        sameStringMembers(
          unit.resultBearingProgramLocusRefs,
          source.resultBearingProgramLocusRefs
        ) &&
        sameStringMembers(
          unit.applicationConservationRefs,
          source.applicationConservationRefs
        )
    );
    if (unitMatches.length !== 1 || report.issues.some(t267Issue)) {
      const candidateComparisons = candidateUnits.map((unit) => ({
        unitRef: unit.unitRef,
        targetCarrier: unit.targetCarrierContractRef ===
          source.targetCarrierProjection.targetCarrierContractRef,
        edgeClosure: unit.edgeClosureRef === source.edgeClosureBinding.edgeRef,
        composition: sameStringMembers(unit.computeCompositionRefs, [
          bundle.computeComposition.compositionRef
        ]),
        conservation: unit.conservationBasisRef ===
          bundle.traversalBindConservation.conservationRef,
        stages: sameStringMembers(
          unit.computeStageBindingRefs,
          bundle.computeStageBindings.map((row) => row.stageBindingRef)
        ),
        interfaces: sameStringMembers(
          unit.pluginResultInterfaceRefs,
          bundle.pluginResultInterfaces.map((row) => row.resultInterfaceRef)
        ),
        plan: sameStringMembers(unit.programPlanRefs, [
          source.completeProgramPlan.planRef
        ]),
        authoredNodes: sameStringMembers(
          unit.authoredProgramNodeRefs,
          source.authoredProgramNodeRefs
        ),
        invokingLoci: sameStringMembers(
          unit.invokingProgramLocusRefs,
          source.invokingProgramLocusRefs
        ),
        resultFrontier: sameStringMembers(
          unit.resultBearingProgramLocusRefs,
          source.resultBearingProgramLocusRefs
        ),
        application: sameStringMembers(
          unit.applicationConservationRefs,
          source.applicationConservationRefs
        )
      }));
      fail({
        diagnosticId: "traversal-static-unit-nonconformant",
        actualRelation:
          "exact TraversalUnit projection retains T-267 conformance issues: " +
          JSON.stringify(candidateComparisons),
        evidenceRefs: [
          source.sourceDigest,
          bundle.bundleDigest,
          report.reportRef,
          ...candidateUnits.flatMap((unit) => [
            unit.unitRef,
            ...unit.programPlanRefs,
            ...unit.programPlanDigests,
            ...unit.applicationConservationRefs
          ]),
          ...report.issues.filter(t267Issue).map((issue) => issue.ruleRef)
        ]
      });
    }

    if (!report.passed || report.issueCount !== 0) {
      const basis = admissionBasis({
        status: "static_contracts_admitted_program_blocked",
        source,
        resultAuthorities: orderedResultAuthorities,
        bundle,
        report
      });
      const admissionDigest = stableSha256Digest(basis);
      return Object.freeze({
        ...basis,
        admissionRef:
          `abg://traversal-execution-admission/${admissionDigest.slice("sha256:".length)}`,
        admissionDigest,
        runtimeAddressable: false,
        effectsPermitted: false,
        runtimeClosed: false,
        resultAdmitted: false,
        obligationsDischarged: false,
        blockingIssueRefs: Object.freeze(
          report.issues.map((issue) => issue.ruleRef)
        )
      });
    }

    if (source.capabilityDisposition === "unresolved") {
      const basis = admissionBasis({
        status: "static_contracts_admitted_capability_blocked",
        source,
        resultAuthorities: orderedResultAuthorities,
        bundle,
        report
      });
      const admissionDigest = stableSha256Digest(basis);
      return Object.freeze({
        ...basis,
        admissionRef:
          `abg://traversal-execution-admission/${admissionDigest.slice("sha256:".length)}`,
        admissionDigest,
        runtimeAddressable: false,
        effectsPermitted: false,
        runtimeClosed: false,
        resultAdmitted: false,
        obligationsDischarged: false,
        blockingIssueRefs: Object.freeze([])
      });
    }

    const basis = admissionBasis({
      status: "runtime_addressable_not_closed",
      source,
      resultAuthorities: orderedResultAuthorities,
      bundle,
      report
    });
    const admissionDigest = stableSha256Digest(basis);
    return Object.freeze({
      ...basis,
      admissionRef:
        `abg://traversal-execution-admission/${admissionDigest.slice("sha256:".length)}`,
      admissionDigest,
      runtimeAddressable: true,
      effectsPermitted: false,
      runtimeClosed: false,
      resultAdmitted: false,
      obligationsDischarged: false,
      capabilityDisposition: source.capabilityDisposition
    });
  } catch (error: unknown) {
    return invalidOutcome(error);
  }
}

function runtimeAddressableAdmissionBasis(
  admission: TraversalExecutionAdmissionRuntimeAddressable
) {
  return Object.freeze({
    kind: admission.kind,
    status: admission.status,
    sourceKind: admission.sourceKind,
    sourceRef: admission.sourceRef,
    sourceDigest: admission.sourceDigest,
    currentAuthorityRef: admission.currentAuthorityRef,
    currentAuthorityDigest: admission.currentAuthorityDigest,
    startupBlockDigest: admission.startupBlockDigest,
    graphFunctionRef: admission.graphFunctionRef,
    graphFunctionId: admission.graphFunctionId,
    graphFunctionDigest: admission.graphFunctionDigest,
    capabilityDisposition: admission.capabilityDisposition,
    currentResultAuthorities: admission.currentResultAuthorities,
    bundleDigest: admission.bundleDigest,
    reportRef: admission.reportRef
  });
}

export function assertTraversalExecutionRuntimeStart(input: {
  readonly request: DeclaredExecutionRequest;
  readonly admission: TraversalExecutionAdmissionRuntimeAddressable;
}): void {
  const { requestRef, requestDigest, ...requestBasis } = input.request;
  const expectedRequestDigest = stableSha256Digest(requestBasis);
  const expectedRequestRef =
    `abg://declared-execution-request/${expectedRequestDigest.slice("sha256:".length)}`;
  const { blockDigest, ...startupBlockBasis } = input.request.startupBlock;
  const expectedAdmissionDigest = stableSha256Digest(
    runtimeAddressableAdmissionBasis(input.admission)
  );
  const expectedAdmissionRef =
    `abg://traversal-execution-admission/${expectedAdmissionDigest.slice("sha256:".length)}`;
  const expectedAuthorityKind = input.request.regime === "F_P"
    ? "declared_fp_contract"
    : "declared_fh_contract";
  const matchingAuthorities = input.admission.currentResultAuthorities.filter(
    (authority) =>
      authority.sourceKind === expectedAuthorityKind &&
      authority.domainStageRole === input.request.stageRole &&
      authority.declaredStageTermDigest === input.request.stageTermDigest &&
      authority.currentSourceAuthorityRef ===
        input.request.contextContractRef &&
      authority.currentSourceAuthorityDigest ===
        input.request.contextContractDigest
  );

  if (
    input.request.kind !== "declared_execution_request" ||
    requestDigest !== expectedRequestDigest ||
    requestRef !== expectedRequestRef ||
    input.request.startupBlock.kind !==
      "graph_vector_traversal_startup_block" ||
    input.request.startupBlock.status !==
      "startup_blocked_awaiting_t267" ||
    input.request.startupBlock.runtimeAddressable !== false ||
    input.request.startupBlock.effectsPermitted !== false ||
    input.request.startupBlockDigest !== blockDigest ||
    stableSha256Digest(startupBlockBasis) !== blockDigest
  ) {
    fail({
      diagnosticId: "traversal-runtime-start-invalid",
      actualRelation:
        "declared execution request identity or startup-block identity is invalid",
      evidenceRefs: [requestRef, requestDigest, blockDigest]
    });
  }
  if (
    input.admission.kind !== "traversal_execution_admission_outcome" ||
    input.admission.status !== "runtime_addressable_not_closed" ||
    input.admission.runtimeAddressable !== true ||
    input.admission.effectsPermitted !== false ||
    input.admission.runtimeClosed !== false ||
    input.admission.resultAdmitted !== false ||
    input.admission.obligationsDischarged !== false ||
    input.admission.admissionDigest !== expectedAdmissionDigest ||
    input.admission.admissionRef !== expectedAdmissionRef
  ) {
    fail({
      diagnosticId: "traversal-runtime-start-invalid",
      actualRelation:
        "runtime-addressable T-267 admission identity is invalid",
      evidenceRefs: [
        input.admission.admissionRef,
        input.admission.admissionDigest
      ]
    });
  }
  if (
    input.admission.sourceKind !== "selected_program_handoff" ||
    input.admission.currentAuthorityRef !== input.request.handoffRef ||
    input.admission.startupBlockDigest !==
      input.request.startupBlockDigest ||
    matchingAuthorities.length !== 1
  ) {
    fail({
      diagnosticId: "traversal-runtime-start-invalid",
      actualRelation:
        "declared execution request and T-267 admission do not preserve one exact handoff and result authority",
      evidenceRefs: [
        requestRef,
        input.request.contextContractRef,
        input.admission.currentAuthorityRef,
        ...input.admission.currentResultAuthorities.map(
          (authority) => authority.currentSourceAuthorityRef
        )
      ]
    });
  }
  fail({
    diagnosticId: "traversal-runtime-start-invalid",
    actualRelation:
      "static T-267 conservation is addressable but startup remains blocked awaiting T-270 public routing authority",
    evidenceRefs: [
      input.request.requestRef,
      input.admission.admissionRef,
      input.admission.bundleDigest
    ]
  });
}
