// Implements: T-280. This is a projection over admitted GTL/T-267/T-271/T-262
// authority. It does not restate their compilation or target-selection truth.

import {
  ONE_SURFACE_AUTHORITY_FUNCTION_KIND_VALUES,
  type OneSurfaceAuthorityFunctionKind
} from "./one_surface_authority.js";
import {
  oneSurfaceNativeResultSchema,
  type OneSurfaceNativeResultSchema
} from "./one_surface_contract_family.js";
import {
  type GtlProgramTargetCarrierRow,
  type GtlProgramComputeStageBindingRow,
  type GtlProgramConformanceInput,
  typecheckGtlProgram
} from "./gtl_program_conformance.js";
import {
  assertCompiledCProgramPlan,
  type CompiledCProgramPlan
} from "./complete_c_program.js";
import {
  assertAdmittedTraversalStageResultAuthority,
  assertCompiledTraversalExecutionContracts,
  type AdmittedTraversalStageResultAuthority,
  type CompiledTraversalExecutionContracts
} from "./traversal_execution_contract.js";
import {
  assertCompiledTypedRecursePlan,
  type CompiledTypedRecursePlan
} from "./typed_recurse.js";
import {
  deriveAllowedConsequenceTraversalCatalogFromGtl,
  type AllowedConsequenceTraversalCatalog
} from "./allowed_consequence_traversal_catalog.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

export const ONE_SURFACE_PROGRAM_DIAGNOSTIC_ID_VALUES = Object.freeze([
  "one_surface_authority_missing",
  "one_surface_authority_duplicate",
  "one_surface_authority_order_invalid",
  "one_surface_authority_type_mismatch",
  "one_surface_authority_cross_program",
  "one_surface_program_join_invalid",
  "one_surface_refinement_incomplete",
  "one_surface_semantic_not_realized"
] as const);

export type OneSurfaceProgramDiagnosticId =
  (typeof ONE_SURFACE_PROGRAM_DIAGNOSTIC_ID_VALUES)[number];

export interface OneSurfaceProgramDiagnostic {
  readonly kind: "one_surface_program_diagnostic";
  readonly classification: "invalid_program" | "semantic_not_realized";
  readonly diagnosticId: OneSurfaceProgramDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
}

const ONE_SURFACE_STAGE_AUTHORITY = Symbol("ONE_SURFACE_STAGE_AUTHORITY");

export interface OneSurfaceStageAuthority<
  K extends OneSurfaceAuthorityFunctionKind = OneSurfaceAuthorityFunctionKind
> {
  readonly [ONE_SURFACE_STAGE_AUTHORITY]: true;
  readonly kind: "one_surface_stage_authority";
  readonly functionKind: K;
  readonly authorityRef: string;
  readonly authorityDigest: `sha256:${string}`;
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly programMembershipRef: string;
  readonly programMembershipDigest: `sha256:${string}`;
  readonly stage: GtlProgramComputeStageBindingRow;
  readonly plan: CompiledCProgramPlan;
  readonly resultAuthority: AdmittedTraversalStageResultAuthority;
  readonly targetCarrierContract: GtlProgramTargetCarrierRow;
  readonly nativeResultSchema: OneSurfaceNativeResultSchema & {
    readonly functionKind: K;
  };
  readonly allowedConsequenceCatalog: AllowedConsequenceTraversalCatalog;
  readonly closureContract: Readonly<{
    readonly ref: string;
    readonly compositionRef: string;
    readonly compositionDigest: string;
  }>;
  readonly traversalContracts: CompiledTraversalExecutionContracts;
}

export interface OneSurfaceStageAuthorityInput<
  K extends OneSurfaceAuthorityFunctionKind = OneSurfaceAuthorityFunctionKind
> {
  readonly functionKind: K;
  readonly stage: GtlProgramComputeStageBindingRow;
  readonly plan: CompiledCProgramPlan;
  readonly resultAuthority: AdmittedTraversalStageResultAuthority;
  readonly traversalContracts: CompiledTraversalExecutionContracts;
}

const ONE_SURFACE_PROGRAM_AUTHORITY = Symbol("ONE_SURFACE_PROGRAM_AUTHORITY");

export type OneSurfaceProgramJoinKind =
  | "af13_to_af14_selection"
  | "af14_to_af15_construction_intent"
  | "af15_to_af16_action_evaluation";

export interface OneSurfaceProgramJoinEndpoint {
  readonly functionId: "AF-13" | "AF-14" | "AF-15" | "AF-16";
  readonly direction: "input" | "output";
  readonly coordinateKind: "carrier_ref" | "admission_relation_ref";
  readonly coordinateRef: string;
}

export interface OneSurfaceBindingIdentityContract {
  readonly kind: "one_surface_binding_identity_contract";
  readonly relation: "exact_identity";
  readonly sourceField: "NextActionProjection.selectedBindingRef";
  readonly targetField: "TargetObligationBinding.sourceBindingRef";
}

export interface OneSurfaceProgramJoin {
  readonly kind: "one_surface_program_join";
  readonly joinKind: OneSurfaceProgramJoinKind;
  readonly joinRef: string;
  readonly joinDigest: `sha256:${string}`;
  readonly ownership: "native" | "external_t270";
  readonly semanticType:
    | "NextActionProjection"
    | "ConstructionIntent"
    | "CompleteAdmittedEvidenceView";
  readonly source: OneSurfaceProgramJoinEndpoint;
  readonly target: OneSurfaceProgramJoinEndpoint;
  readonly bindingIdentityContract: OneSurfaceBindingIdentityContract | null;
}

export interface OneSurfaceExternalAf15Slot {
  readonly kind: "one_surface_external_af15_slot";
  readonly ownerTicket: "T-270";
  readonly functionId: "AF-15";
  readonly status: "external_unbound";
  readonly af14AdmissionRelationRef: string;
  readonly af14AdmissionRelationDigest: `sha256:${string}`;
  readonly constructionIntentInputJoinRef: string;
  readonly constructionIntentInputJoinDigest: `sha256:${string}`;
  readonly actionEvaluationOutputJoinRef: string;
  readonly actionEvaluationOutputJoinDigest: `sha256:${string}`;
  readonly actionEvaluationInputCarrierRef: string;
}

export interface OneSurfaceAf14AdmissionRelation {
  readonly kind: "one_surface_af14_admission_relation";
  readonly relationRef: string;
  readonly relationDigest: `sha256:${string}`;
  readonly status: "native_admission";
  readonly evaluateNextAuthorityRef: string;
  readonly evaluateNextResultSchema: OneSurfaceNativeResultSchema;
  readonly selectionJoinRef: string;
  readonly selectionJoinDigest: `sha256:${string}`;
  readonly admissionAuthorityRef:
    "abg://one-surface/af14/admit-construction-intent";
}

export interface OneSurfaceAuthorityProgramBinding {
  readonly [ONE_SURFACE_PROGRAM_AUTHORITY]: true;
  readonly kind: "one_surface_authority_program_binding";
  readonly bindingRef: string;
  readonly bindingDigest: `sha256:${string}`;
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly runtimeAddressable: false;
  readonly effectsPermitted: false;
  readonly runtimeAdmissionOwner: "T-270";
  readonly stages: readonly [
    OneSurfaceStageAuthority<"synthesize_model">,
    OneSurfaceStageAuthority<"eval_gap">,
    OneSurfaceStageAuthority<"evaluate_next">,
    OneSurfaceStageAuthority<"evaluate_action">
  ];
  readonly joins: readonly [
    OneSurfaceProgramJoin,
    OneSurfaceProgramJoin,
    OneSurfaceProgramJoin
  ];
  readonly af14Admission: OneSurfaceAf14AdmissionRelation;
  readonly af15Slot: OneSurfaceExternalAf15Slot;
  readonly recursePlan: CompiledTypedRecursePlan;
}

export interface OneSurfaceGtlProgramCompilationInput {
  readonly gtlProgram: GtlProgramConformanceInput;
  readonly stageAuthorities: readonly OneSurfaceStageAuthorityInput[];
  readonly recursePlan: CompiledTypedRecursePlan;
}

export type OneSurfaceProgramCompilation =
  | {
      readonly kind: "one_surface_program_compilation";
      readonly status: "compiled";
      readonly authorityProgram: OneSurfaceAuthorityProgramBinding;
      readonly diagnostics: readonly [];
    }
  | {
      readonly kind: "one_surface_program_compilation";
      readonly status: "invalid" | "semantic_not_realized";
      readonly authorityProgram: OneSurfaceAuthorityProgramBinding | null;
      readonly diagnostics: readonly OneSurfaceProgramDiagnostic[];
    };

interface OneSurfaceStageProgramMembership {
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly programMembershipRef: string;
  readonly programMembershipDigest: `sha256:${string}`;
}

function issue(input: {
  readonly id: OneSurfaceProgramDiagnosticId;
  readonly path: string;
  readonly expected: string;
  readonly actual: string;
  readonly evidenceRefs: readonly string[];
  readonly semantic?: boolean;
}): OneSurfaceProgramDiagnostic {
  return Object.freeze({
    kind: "one_surface_program_diagnostic",
    classification: input.semantic === true
      ? "semantic_not_realized"
      : "invalid_program",
    diagnosticId: input.id,
    path: input.path,
    expectedRelation: input.expected,
    actualRelation: input.actual,
    evidenceRefs: Object.freeze([...input.evidenceRefs])
  });
}

function stageBasis(input: OneSurfaceStageAuthorityInput & {
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly programMembershipRef: string;
  readonly programMembershipDigest: `sha256:${string}`;
  readonly targetCarrierContract: GtlProgramTargetCarrierRow;
  readonly nativeResultSchema: OneSurfaceNativeResultSchema;
  readonly allowedConsequenceCatalog: AllowedConsequenceTraversalCatalog;
}) {
  return Object.freeze({
    functionKind: input.functionKind,
    admittedProgramRef: input.admittedProgramRef,
    admittedProgramDigest: input.admittedProgramDigest,
    programMembershipRef: input.programMembershipRef,
    programMembershipDigest: input.programMembershipDigest,
    stageBindingRef: input.stage.stageBindingRef,
    compositionRef: input.stage.compositionRef,
    compositionDigest: input.stage.compositionDigest,
    planRef: input.plan.planRef,
    planDigest: input.plan.planDigest,
    resultAuthorityRef: input.resultAuthority.authorityRef,
    resultAuthorityDigest: input.resultAuthority.authorityDigest,
    targetCarrierContractRef:
      input.targetCarrierContract.targetCarrierContractRef,
    targetCarrierContractDigest:
      input.targetCarrierContract.targetCarrierContractDigest,
    targetCarrierGraphVectorRef: input.targetCarrierContract.graphVectorRef,
    nativeResultSchema: input.nativeResultSchema,
    allowedConsequenceCatalogRef: input.allowedConsequenceCatalog.catalogRef,
    closureContractRef:
      input.traversalContracts.computeComposition.closureContractRef,
    traversalBundleRef: input.traversalContracts.bundleRef,
    traversalBundleDigest: input.traversalContracts.bundleDigest
  });
}

function admitStage<K extends OneSurfaceAuthorityFunctionKind>(
  input: OneSurfaceStageAuthorityInput<K>,
  programMembership: OneSurfaceStageProgramMembership,
  targetCarrierContract: GtlProgramTargetCarrierRow,
  allowedConsequenceCatalog: AllowedConsequenceTraversalCatalog,
  nativeResultSchema: OneSurfaceNativeResultSchema & {
    readonly functionKind: K;
  }
): OneSurfaceStageAuthority<K> {
  assertCompiledCProgramPlan(input.plan);
  assertAdmittedTraversalStageResultAuthority(input.resultAuthority);
  assertCompiledTraversalExecutionContracts(input.traversalContracts);
  const exactStage = input.traversalContracts.computeStageBindings.filter(
    (stage) => stableJsonEquals(stage, input.stage)
  );
  if (
    exactStage.length !== 1 ||
    !input.traversalContracts.resultAuthorityDigests.includes(
      input.resultAuthority.authorityDigest
    ) ||
    input.stage.domainStageRole !== input.functionKind ||
    input.stage.programPlanRef !== input.plan.planRef ||
    input.stage.programPlanDigest !== input.plan.planDigest ||
    input.stage.programLocusRef !== input.resultAuthority.programLocusRef ||
    input.stage.programLocusDigest !== input.resultAuthority.programLocusDigest ||
    input.traversalContracts.computeComposition.compositionRef !==
      input.stage.compositionRef ||
    input.traversalContracts.computeComposition.compositionDigest !==
      input.stage.compositionDigest ||
    input.traversalContracts.computeComposition.closureContractRef.length === 0 ||
    targetCarrierContract.graphVectorRef !==
      input.traversalContracts.traversalBindConservation.graphVectorRef ||
    targetCarrierContract.targetCarrierContractRef !==
      input.resultAuthority.selectedResultContractRef ||
    targetCarrierContract.schemaRef !== nativeResultSchema.schemaRef ||
    allowedConsequenceCatalog.graphFunctionRef !==
      targetCarrierContract.graphFunctionId ||
    allowedConsequenceCatalog.graphVectorRef !==
      targetCarrierContract.graphVectorId ||
    allowedConsequenceCatalog.edgeRef !== targetCarrierContract.edgeRef
  ) {
    throw new TypeError("One Surface stage does not project one admitted traversal authority");
  }
  const basis = stageBasis({
    ...input,
    ...programMembership,
    targetCarrierContract,
    nativeResultSchema,
    allowedConsequenceCatalog
  });
  const authorityDigest = stableSha256Digest(basis);
  return Object.freeze({
    [ONE_SURFACE_STAGE_AUTHORITY]: true as const,
    kind: "one_surface_stage_authority",
    functionKind: input.functionKind,
    authorityRef:
      `abg://one-surface/stage/${input.functionKind}/` +
      authorityDigest.slice("sha256:".length),
    authorityDigest,
    ...programMembership,
    stage: input.stage,
    plan: input.plan,
    resultAuthority: input.resultAuthority,
    targetCarrierContract,
    nativeResultSchema,
    allowedConsequenceCatalog,
    closureContract: Object.freeze({
      ref: input.traversalContracts.computeComposition.closureContractRef,
      compositionRef: input.traversalContracts.computeComposition.compositionRef,
      compositionDigest: input.traversalContracts.computeComposition.compositionDigest
    }),
    traversalContracts: input.traversalContracts
  });
}

export function assertOneSurfaceStageAuthority(
  authority: OneSurfaceStageAuthority
): void {
  const expected = admitStage(
    authority,
    authority,
    authority.targetCarrierContract,
    authority.allowedConsequenceCatalog,
    authority.nativeResultSchema
  );
  if (
    authority[ONE_SURFACE_STAGE_AUTHORITY] !== true ||
    authority.authorityRef !== expected.authorityRef ||
    authority.authorityDigest !== expected.authorityDigest ||
    !stableJsonEquals(authority.closureContract, expected.closureContract)
  ) {
    throw new TypeError("One Surface stage authority seal differs");
  }
}

function exactTuple(
  stages: readonly OneSurfaceStageAuthority[]
): OneSurfaceAuthorityProgramBinding["stages"] {
  const [a, b, c, d] = stages;
  if (
    a === undefined || !stageHasKind(a, "synthesize_model") ||
    b === undefined || !stageHasKind(b, "eval_gap") ||
    c === undefined || !stageHasKind(c, "evaluate_next") ||
    d === undefined || !stageHasKind(d, "evaluate_action")
  ) {
    throw new TypeError("One Surface stage tuple differs");
  }
  return Object.freeze([a, b, c, d]);
}

function stageHasKind<K extends OneSurfaceAuthorityFunctionKind>(
  stage: OneSurfaceStageAuthority,
  kind: K
): stage is OneSurfaceStageAuthority<K> {
  return stage.functionKind === kind;
}

function programJoinRequirements(joinKind: OneSurfaceProgramJoinKind) {
  switch (joinKind) {
    case "af13_to_af14_selection":
      return Object.freeze({
        ownership: "native" as const,
        semanticType: "NextActionProjection" as const,
        sourceFunctionId: "AF-13" as const,
        sourceDirection: "output" as const,
        sourceCoordinateKind: "carrier_ref" as const,
        targetFunctionId: "AF-14" as const,
        targetDirection: "input" as const,
        targetCoordinateKind: "carrier_ref" as const,
        bindingIdentityContract: Object.freeze({
          kind: "one_surface_binding_identity_contract" as const,
          relation: "exact_identity" as const,
          sourceField: "NextActionProjection.selectedBindingRef" as const,
          targetField: "TargetObligationBinding.sourceBindingRef" as const
        })
      });
    case "af14_to_af15_construction_intent":
      return Object.freeze({
        ownership: "external_t270" as const,
        semanticType: "ConstructionIntent" as const,
        sourceFunctionId: "AF-14" as const,
        sourceDirection: "output" as const,
        sourceCoordinateKind: "admission_relation_ref" as const,
        targetFunctionId: "AF-15" as const,
        targetDirection: "input" as const,
        targetCoordinateKind: "admission_relation_ref" as const,
        bindingIdentityContract: null
      });
    case "af15_to_af16_action_evaluation":
      return Object.freeze({
        ownership: "external_t270" as const,
        semanticType: "CompleteAdmittedEvidenceView" as const,
        sourceFunctionId: "AF-15" as const,
        sourceDirection: "output" as const,
        sourceCoordinateKind: "carrier_ref" as const,
        targetFunctionId: "AF-16" as const,
        targetDirection: "input" as const,
        targetCoordinateKind: "carrier_ref" as const,
        bindingIdentityContract: null
      });
  }
}

function programJoinBasis(input: Omit<
  OneSurfaceProgramJoin,
  "kind" | "joinRef" | "joinDigest"
>) {
  return Object.freeze({
    joinKind: input.joinKind,
    ownership: input.ownership,
    semanticType: input.semanticType,
    source: input.source,
    target: input.target,
    bindingIdentityContract: input.bindingIdentityContract
  });
}

function constructOneSurfaceProgramJoin(input: {
  readonly joinKind: OneSurfaceProgramJoinKind;
  readonly sourceCoordinateRef: string;
  readonly targetCoordinateRef: string;
}): OneSurfaceProgramJoin {
  const expected = programJoinRequirements(input.joinKind);
  if (
    input.sourceCoordinateRef.length === 0 ||
    input.targetCoordinateRef.length === 0 ||
    input.sourceCoordinateRef !== input.targetCoordinateRef
  ) {
    throw new TypeError(`One Surface ${input.joinKind} coordinate differs`);
  }
  const basis = programJoinBasis({
    joinKind: input.joinKind,
    ownership: expected.ownership,
    semanticType: expected.semanticType,
    source: Object.freeze({
      functionId: expected.sourceFunctionId,
      direction: expected.sourceDirection,
      coordinateKind: expected.sourceCoordinateKind,
      coordinateRef: input.sourceCoordinateRef
    }),
    target: Object.freeze({
      functionId: expected.targetFunctionId,
      direction: expected.targetDirection,
      coordinateKind: expected.targetCoordinateKind,
      coordinateRef: input.targetCoordinateRef
    }),
    bindingIdentityContract: expected.bindingIdentityContract
  });
  const joinDigest = stableSha256Digest(basis);
  return Object.freeze({
    kind: "one_surface_program_join",
    joinRef:
      `abg://one-surface/join/${input.joinKind}/` +
      joinDigest.slice("sha256:".length),
    joinDigest,
    ...basis
  });
}

function assertOneSurfaceProgramJoin(join: OneSurfaceProgramJoin): void {
  const expected = constructOneSurfaceProgramJoin({
    joinKind: join.joinKind,
    sourceCoordinateRef: join.source.coordinateRef,
    targetCoordinateRef: join.target.coordinateRef
  });
  if (
    join.kind !== "one_surface_program_join" ||
    join.joinRef !== expected.joinRef ||
    join.joinDigest !== expected.joinDigest ||
    !stableJsonEquals(join, expected)
  ) {
    throw new TypeError("One Surface program join seal differs");
  }
}

function exactJoinTuple(
  joins: readonly OneSurfaceProgramJoin[]
): OneSurfaceAuthorityProgramBinding["joins"] {
  const [selection, constructionIntent, actionEvaluation] = joins;
  if (
    joins.length !== 3 ||
    selection?.joinKind !== "af13_to_af14_selection" ||
    constructionIntent?.joinKind !== "af14_to_af15_construction_intent" ||
    actionEvaluation?.joinKind !== "af15_to_af16_action_evaluation"
  ) {
    throw new TypeError("One Surface program join tuple differs");
  }
  return Object.freeze([selection, constructionIntent, actionEvaluation]);
}

function programBasis(input: {
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly stages: readonly OneSurfaceStageAuthority[];
  readonly joins: readonly OneSurfaceProgramJoin[];
  readonly af14Admission: OneSurfaceAf14AdmissionRelation;
  readonly af15Slot: OneSurfaceExternalAf15Slot;
  readonly recursePlan: CompiledTypedRecursePlan;
}) {
  return Object.freeze({
    admittedProgramRef: input.admittedProgramRef,
    admittedProgramDigest: input.admittedProgramDigest,
    runtimeAddressable: false,
    effectsPermitted: false,
    runtimeAdmissionOwner: "T-270",
    stageAuthorityDigests: input.stages.map((stage) => stage.authorityDigest),
    joinDigests: input.joins.map((join) => join.joinDigest),
    af14Admission: input.af14Admission,
    af15Slot: input.af15Slot,
    recursePlanRef: input.recursePlan.planRef,
    recursePlanDigest: input.recursePlan.planDigest
  });
}

export function assertOneSurfaceAuthorityProgramBinding(
  binding: OneSurfaceAuthorityProgramBinding
): void {
  binding.stages.forEach(assertOneSurfaceStageAuthority);
  if (binding.stages.some(
    (stage) =>
      stage.admittedProgramRef !== binding.admittedProgramRef ||
      stage.admittedProgramDigest !== binding.admittedProgramDigest
  )) {
    throw new TypeError("One Surface stage program membership differs");
  }
  binding.joins.forEach(assertOneSurfaceProgramJoin);
  assertCompiledTypedRecursePlan(binding.recursePlan);
  exactTuple(binding.stages);
  const [selectionJoin, constructionIntentJoin, actionEvaluationJoin] =
    exactJoinTuple(binding.joins);
  const af14Digest = stableSha256Digest({
    evaluateNextAuthorityRef: binding.af14Admission.evaluateNextAuthorityRef,
    evaluateNextResultSchema: binding.af14Admission.evaluateNextResultSchema,
    selectionJoinRef: binding.af14Admission.selectionJoinRef,
    selectionJoinDigest: binding.af14Admission.selectionJoinDigest,
    admissionAuthorityRef: binding.af14Admission.admissionAuthorityRef
  });
  if (
    binding.af14Admission.kind !== "one_surface_af14_admission_relation" ||
    binding.af14Admission.status !== "native_admission" ||
    binding.af14Admission.relationDigest !== af14Digest ||
    binding.af14Admission.relationRef !==
      `abg://one-surface/af14/relation/${af14Digest.slice("sha256:".length)}` ||
    binding.af14Admission.evaluateNextAuthorityRef !==
      binding.stages[2].authorityRef ||
    !stableJsonEquals(
      binding.af14Admission.evaluateNextResultSchema,
      binding.stages[2].nativeResultSchema
    ) ||
    selectionJoin.source.coordinateRef !==
      binding.stages[2].plan.outputCarrierRef ||
    selectionJoin.target.coordinateRef !==
      binding.stages[2].plan.outputCarrierRef ||
    binding.af14Admission.selectionJoinRef !== selectionJoin.joinRef ||
    binding.af14Admission.selectionJoinDigest !== selectionJoin.joinDigest ||
    binding.af15Slot.kind !== "one_surface_external_af15_slot" ||
    binding.af15Slot.ownerTicket !== "T-270" ||
    binding.af15Slot.functionId !== "AF-15" ||
    binding.af15Slot.status !== "external_unbound" ||
    binding.af15Slot.af14AdmissionRelationRef !==
      binding.af14Admission.relationRef ||
    binding.af15Slot.af14AdmissionRelationDigest !==
      binding.af14Admission.relationDigest ||
    constructionIntentJoin.source.coordinateRef !==
      binding.af14Admission.relationRef ||
    constructionIntentJoin.target.coordinateRef !==
      binding.af14Admission.relationRef ||
    binding.af15Slot.constructionIntentInputJoinRef !==
      constructionIntentJoin.joinRef ||
    binding.af15Slot.constructionIntentInputJoinDigest !==
      constructionIntentJoin.joinDigest ||
    actionEvaluationJoin.source.coordinateRef !==
      binding.stages[3].plan.inputCarrierRef ||
    actionEvaluationJoin.target.coordinateRef !==
      binding.stages[3].plan.inputCarrierRef ||
    binding.af15Slot.actionEvaluationOutputJoinRef !==
      actionEvaluationJoin.joinRef ||
    binding.af15Slot.actionEvaluationOutputJoinDigest !==
      actionEvaluationJoin.joinDigest ||
    binding.af15Slot.actionEvaluationInputCarrierRef !==
      binding.stages[3].plan.inputCarrierRef
  ) {
    throw new TypeError("One Surface AF-15 external slot differs");
  }
  const expected = stableSha256Digest(programBasis(binding));
  if (
    binding[ONE_SURFACE_PROGRAM_AUTHORITY] !== true ||
    binding.runtimeAddressable !== false ||
    binding.effectsPermitted !== false ||
    binding.runtimeAdmissionOwner !== "T-270" ||
    binding.bindingDigest !== expected ||
    binding.bindingRef !==
      `abg://one-surface/authority-program/${expected.slice("sha256:".length)}`
  ) {
    throw new TypeError("One Surface authority program seal differs");
  }
}

function deriveProgramAllowedConsequenceCatalog(input: {
  readonly gtlProgram: GtlProgramConformanceInput;
  readonly targetCarrierContract: GtlProgramTargetCarrierRow;
}): AllowedConsequenceTraversalCatalog | null {
  const graphFunctions = (input.gtlProgram.modules ?? []).flatMap(
    (module) => module.graphFunctions
  ).filter(
    (graphFunction) =>
      graphFunction.id === input.targetCarrierContract.graphFunctionId
  );
  if (graphFunctions.length !== 1) {
    return null;
  }
  const graphFunction = graphFunctions[0]!;
  const graph = graphFunction.template.kind === "inline_graph"
    ? graphFunction.template.graph
    : null;
  if (graph === null) {
    return null;
  }
  const vectorIndex = graph.vectors.findIndex(
    (vector) => vector.name === input.targetCarrierContract.graphVectorRef
  );
  const graphVector = graph.vectors[vectorIndex];
  if (vectorIndex < 0 || graphVector === undefined) {
    return null;
  }
  return deriveAllowedConsequenceTraversalCatalogFromGtl({
    graphFunction,
    graphVector,
    vectorIndex,
    edgeRef: input.targetCarrierContract.edgeRef
  });
}

function stageBelongsToAdmittedProgram(input: {
  readonly gtlProgram: GtlProgramConformanceInput;
  readonly stageAuthority: OneSurfaceStageAuthorityInput;
}): boolean {
  const { plan, stage } = input.stageAuthority;
  const modules = (input.gtlProgram.modules ?? []).filter(
    (module) =>
      module.name === plan.moduleName &&
      stableSha256Digest(module) === plan.moduleDigest
  );
  if (modules.length !== 1) return false;
  const graphFunctions = modules[0]!.graphFunctions.filter(
    (graphFunction) =>
      graphFunction.id === plan.executionGraphFunctionRef &&
      stableSha256Digest(graphFunction) === plan.executionGraphFunctionDigest
  );
  if (graphFunctions.length !== 1) return false;
  const graphFunction = graphFunctions[0]!;
  if (graphFunction.template.kind !== "inline_graph") return false;
  const vectors = graphFunction.template.graph.vectors.filter(
    (vector) =>
      vector.id === plan.graphVectorRef &&
      stableSha256Digest(vector) === plan.graphVectorDigest
  );
  const stages = (input.gtlProgram.computeStageBindings ?? []).filter(
    (candidate) => stableJsonEquals(candidate, stage)
  );
  return vectors.length === 1 && stages.length === 1;
}

function constructStageProgramMembership(input: {
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly stageAuthority: OneSurfaceStageAuthorityInput;
  readonly targetCarrierContract: GtlProgramTargetCarrierRow;
}): OneSurfaceStageProgramMembership {
  const basis = Object.freeze({
    admittedProgramRef: input.admittedProgramRef,
    admittedProgramDigest: input.admittedProgramDigest,
    moduleName: input.stageAuthority.plan.moduleName,
    moduleDigest: input.stageAuthority.plan.moduleDigest,
    graphFunctionRef:
      input.stageAuthority.plan.executionGraphFunctionRef,
    graphFunctionDigest:
      input.stageAuthority.plan.executionGraphFunctionDigest,
    graphVectorRef: input.stageAuthority.plan.graphVectorRef,
    graphVectorDigest: input.stageAuthority.plan.graphVectorDigest,
    stageBindingRef: input.stageAuthority.stage.stageBindingRef,
    stageBindingDigest: stableSha256Digest(input.stageAuthority.stage),
    programPlanRef: input.stageAuthority.plan.planRef,
    programPlanDigest: input.stageAuthority.plan.planDigest,
    targetCarrierContractRef:
      input.targetCarrierContract.targetCarrierContractRef,
    targetCarrierContractDigest:
      input.targetCarrierContract.targetCarrierContractDigest,
    traversalBundleRef: input.stageAuthority.traversalContracts.bundleRef,
    traversalBundleDigest: input.stageAuthority.traversalContracts.bundleDigest
  });
  const programMembershipDigest = stableSha256Digest(basis);
  return Object.freeze({
    admittedProgramRef: input.admittedProgramRef,
    admittedProgramDigest: input.admittedProgramDigest,
    programMembershipRef:
      `abg://one-surface/program-membership/` +
      programMembershipDigest.slice("sha256:".length),
    programMembershipDigest
  });
}

export async function compileOneSurfaceGtlProgramApplication(
  input: OneSurfaceGtlProgramCompilationInput
): Promise<OneSurfaceProgramCompilation> {
  const report = typecheckGtlProgram(input.gtlProgram);
  const evidenceRefs = Object.freeze([report.reportRef, report.inventoryDigest]);
  if (!report.passed) {
    return Object.freeze({
      kind: "one_surface_program_compilation",
      status: "semantic_not_realized",
      authorityProgram: null,
      diagnostics: Object.freeze([issue({
        id: "one_surface_semantic_not_realized",
        path: "$.gtlProgram",
        expected: "accepted GTL program conformance",
        actual: report.issues.map((row) => row.ruleRef).join(","),
        evidenceRefs,
        semantic: true
      })])
    });
  }
  const controls = (input.gtlProgram.runtimeBindings ?? []).filter(
    (row) => row.runtimeBindingKind === "abg_public_control_loop"
  );
  if (controls.length !== 1) {
    return Object.freeze({
      kind: "one_surface_program_compilation",
      status: "invalid",
      authorityProgram: null,
      diagnostics: Object.freeze([issue({
        id: controls.length === 0
          ? "one_surface_authority_missing"
          : "one_surface_authority_duplicate",
        path: "$.gtlProgram.runtimeBindings",
        expected: "one abg_public_control_loop",
        actual: String(controls.length),
        evidenceRefs
      })])
    });
  }
  const control = controls[0]!;
  let nativeResultSchemas: {
    readonly [Kind in OneSurfaceAuthorityFunctionKind]:
      OneSurfaceNativeResultSchema & { readonly functionKind: Kind };
  };
  try {
    const [synthesizeModel, evalGap, evaluateNext, evaluateAction] =
      await Promise.all([
        oneSurfaceNativeResultSchema("synthesize_model"),
        oneSurfaceNativeResultSchema("eval_gap"),
        oneSurfaceNativeResultSchema("evaluate_next"),
        oneSurfaceNativeResultSchema("evaluate_action")
      ]);
    nativeResultSchemas = Object.freeze({
      synthesize_model: synthesizeModel,
      eval_gap: evalGap,
      evaluate_next: evaluateNext,
      evaluate_action: evaluateAction
    });
  } catch (error: unknown) {
    return Object.freeze({
      kind: "one_surface_program_compilation",
      status: "semantic_not_realized",
      authorityProgram: null,
      diagnostics: Object.freeze([issue({
        id: "one_surface_semantic_not_realized",
        path: "$.nativeResultSchemas",
        expected: "four owner-native schema projections",
        actual: error instanceof Error ? error.message : String(error),
        evidenceRefs,
        semantic: true
      })])
    });
  }
  const diagnostics: OneSurfaceProgramDiagnostic[] = [];
  const invalidStageAuthorities = new Set<OneSurfaceStageAuthorityInput>();
  input.stageAuthorities.forEach((row, index) => {
    try {
      assertCompiledCProgramPlan(row.plan);
    } catch (error: unknown) {
      invalidStageAuthorities.add(row);
      diagnostics.push(issue({
        id: "one_surface_program_join_invalid",
        path: `$.stageAuthorities[${String(index)}].plan`,
        expected: "one sealed T-271 program plan",
        actual: error instanceof Error ? error.message : String(error),
        evidenceRefs
      }));
      return;
    }
    if (!stageBelongsToAdmittedProgram({
      gtlProgram: input.gtlProgram,
      stageAuthority: row
    })) {
      invalidStageAuthorities.add(row);
      diagnostics.push(issue({
        id: "one_surface_authority_cross_program",
        path: `$.stageAuthorities[${String(index)}]`,
        expected:
          "one exact stage, module, GraphFunction, and vector in the admitted program",
        actual: "sealed stage authority input belongs to another program structure",
        evidenceRefs: [
          ...evidenceRefs,
          row.plan.planRef,
          row.plan.planDigest,
          row.stage.stageBindingRef
        ]
      }));
    }
  });
  const byRef = new Map(
    input.stageAuthorities.map((row) => [row.stage.stageBindingRef, row])
  );
  const ordered = control.stageBindingRefs.map((ref) => byRef.get(ref));
  if (
    control.stageBindingRefs.length !== 4 ||
    input.stageAuthorities.length !== 4 ||
    byRef.size !== 4 ||
    ordered.some((row) => row === undefined)
  ) {
    diagnostics.push(issue({
      id: "one_surface_program_join_invalid",
      path: "$.stageAuthorities",
      expected: "four unique stages selected by the admitted control binding",
      actual:
        `control=${String(control.stageBindingRefs.length)}|supplied=` +
        String(input.stageAuthorities.length),
      evidenceRefs
    }));
  }
  const admitted: OneSurfaceStageAuthority[] = [];
  ordered.forEach((row, index) => {
    if (row === undefined) return;
    if (invalidStageAuthorities.has(row)) return;
    const expectedKind = ONE_SURFACE_AUTHORITY_FUNCTION_KIND_VALUES[index];
    if (row.functionKind !== expectedKind) {
      diagnostics.push(issue({
        id: "one_surface_authority_order_invalid",
        path: `$.stageAuthorities[${String(index)}]`,
        expected: expectedKind ?? "no-stage",
        actual: row.functionKind,
        evidenceRefs
      }));
      return;
    }
    const targetCarrierContracts = (input.gtlProgram.targetCarrierContracts ?? [])
      .filter(
        (candidate) =>
          candidate.graphVectorRef ===
            row.traversalContracts.traversalBindConservation.graphVectorRef &&
          candidate.targetCarrierContractRef ===
            row.resultAuthority.selectedResultContractRef
      );
    if (targetCarrierContracts.length !== 1) {
      diagnostics.push(issue({
        id: targetCarrierContracts.length === 0
          ? "one_surface_authority_missing"
          : "one_surface_authority_duplicate",
        path: `$.gtlProgram.targetCarrierContracts[${String(index)}]`,
        expected: "one exact program-owned target-carrier coordinate",
        actual: String(targetCarrierContracts.length),
        evidenceRefs: [
          row.resultAuthority.authorityRef,
          row.traversalContracts.traversalBindConservation.conservationRef
        ]
      }));
      return;
    }
    const allowedConsequenceCatalog = deriveProgramAllowedConsequenceCatalog({
      gtlProgram: input.gtlProgram,
      targetCarrierContract: targetCarrierContracts[0]!
    });
    if (allowedConsequenceCatalog === null) {
      diagnostics.push(issue({
        id: "one_surface_program_join_invalid",
        path: `$.gtlProgram.modules[${String(index)}]`,
        expected: "one exact program-owned graph function and vector",
        actual: "graph function or vector did not resolve uniquely",
        evidenceRefs: [targetCarrierContracts[0]!.graphVectorRef]
      }));
      return;
    }
    try {
      const programMembership = constructStageProgramMembership({
        admittedProgramRef: report.subjectRef,
        admittedProgramDigest: report.inventoryDigest,
        stageAuthority: row,
        targetCarrierContract: targetCarrierContracts[0]!
      });
      admitted.push(admitStage(
        row,
        programMembership,
        targetCarrierContracts[0]!,
        allowedConsequenceCatalog,
        nativeResultSchemas[row.functionKind]
      ));
    } catch (error: unknown) {
      const actual = error instanceof Error ? error.message : String(error);
      diagnostics.push(issue({
        id: "one_surface_program_join_invalid",
        path: `$.stageAuthorities[${String(index)}]`,
        expected: "one current T-267/T-271 stage authority",
        actual,
        evidenceRefs
      }));
    }
  });
  try {
    assertCompiledTypedRecursePlan(input.recursePlan);
  } catch (error: unknown) {
    diagnostics.push(issue({
      id: "one_surface_program_join_invalid",
      path: "$.recursePlan",
      expected: "one sealed T-262 recurse plan",
      actual: error instanceof Error ? error.message : String(error),
      evidenceRefs
    }));
  }
  const ownerModules = (input.gtlProgram.modules ?? []).filter(
    (module) => module.name === control.moduleRef
  );
  const recurseImports = ownerModules.flatMap((module) =>
    module.imports.filter(
      (row) =>
        row.source === input.recursePlan.moduleName &&
        row.names.includes(input.recursePlan.wrapperGraphFunctionRef)
    )
  );
  if (ownerModules.length !== 1 || recurseImports.length !== 1) {
    diagnostics.push(issue({
      id: "one_surface_semantic_not_realized",
      path: "$.recursePlan",
      expected: "one exact program-visible T-262 module and wrapper import",
      actual:
        `owners=${String(ownerModules.length)}|imports=` +
        String(recurseImports.length),
      evidenceRefs: [
        ...evidenceRefs,
        input.recursePlan.planRef,
        input.recursePlan.planDigest,
        input.recursePlan.moduleDigest
      ],
      semantic: true
    }));
  }
  if (admitted.length === 4) {
    const [af11, af12, af13, af16] = exactTuple(admitted);
    const joined =
      af12.stage.inputCarrierRefs.includes(af11.plan.outputCarrierRef) &&
      af13.stage.inputCarrierRefs.includes(af12.plan.outputCarrierRef) &&
      input.recursePlan.inputCarrierRef === af16.plan.outputCarrierRef &&
      af11.stage.inputCarrierRefs.includes(input.recursePlan.outputCarrierRef);
    if (!joined) {
      diagnostics.push(issue({
        id: "one_surface_authority_type_mismatch",
        path: "$.authorityJoins",
        expected: "AF11 -> AF12 -> AF13 and AF16 -> recurse -> AF11",
        actual: "carrier relation differs",
        evidenceRefs
      }));
    }
  }
  const refinementCount = (input.gtlProgram.modules ?? []).reduce(
    (count, module) => count + module.refinementBoundaries.length,
    0
  );
  if (refinementCount > 0) {
    diagnostics.push(issue({
      id: "one_surface_refinement_incomplete",
      path: "$.gtlProgram.modules[*].refinementBoundaries",
      expected: "each published refinement supplies the same admitted authority program",
      actual: `${String(refinementCount)} refinement boundaries await binding`,
      evidenceRefs,
      semantic: true
    }));
  }
  if (diagnostics.some((row) => row.classification === "invalid_program")) {
    return Object.freeze({
      kind: "one_surface_program_compilation",
      status: "invalid",
      authorityProgram: null,
      diagnostics: Object.freeze(diagnostics)
    });
  }
  if (admitted.length !== 4) {
    return Object.freeze({
      kind: "one_surface_program_compilation",
      status: "semantic_not_realized",
      authorityProgram: null,
      diagnostics: Object.freeze(diagnostics)
    });
  }
  const stages = exactTuple(admitted);
  const selectionJoin = constructOneSurfaceProgramJoin({
    joinKind: "af13_to_af14_selection",
    sourceCoordinateRef: stages[2].plan.outputCarrierRef,
    targetCoordinateRef: stages[2].plan.outputCarrierRef
  });
  const af14Basis = Object.freeze({
    evaluateNextAuthorityRef: stages[2].authorityRef,
    evaluateNextResultSchema: stages[2].nativeResultSchema,
    selectionJoinRef: selectionJoin.joinRef,
    selectionJoinDigest: selectionJoin.joinDigest,
    admissionAuthorityRef:
      "abg://one-surface/af14/admit-construction-intent" as const
  });
  const af14Digest = stableSha256Digest(af14Basis);
  const af14Admission = Object.freeze({
    kind: "one_surface_af14_admission_relation" as const,
    relationRef:
      `abg://one-surface/af14/relation/${af14Digest.slice("sha256:".length)}`,
    relationDigest: af14Digest,
    status: "native_admission" as const,
    ...af14Basis
  });
  const constructionIntentJoin = constructOneSurfaceProgramJoin({
    joinKind: "af14_to_af15_construction_intent",
    sourceCoordinateRef: af14Admission.relationRef,
    targetCoordinateRef: af14Admission.relationRef
  });
  const actionEvaluationJoin = constructOneSurfaceProgramJoin({
    joinKind: "af15_to_af16_action_evaluation",
    sourceCoordinateRef: stages[3].plan.inputCarrierRef,
    targetCoordinateRef: stages[3].plan.inputCarrierRef
  });
  const joins = exactJoinTuple([
    selectionJoin,
    constructionIntentJoin,
    actionEvaluationJoin
  ]);
  const af15Slot = Object.freeze({
    kind: "one_surface_external_af15_slot" as const,
    ownerTicket: "T-270" as const,
    functionId: "AF-15" as const,
    status: "external_unbound" as const,
    af14AdmissionRelationRef: af14Admission.relationRef,
    af14AdmissionRelationDigest: af14Admission.relationDigest,
    constructionIntentInputJoinRef: constructionIntentJoin.joinRef,
    constructionIntentInputJoinDigest: constructionIntentJoin.joinDigest,
    actionEvaluationOutputJoinRef: actionEvaluationJoin.joinRef,
    actionEvaluationOutputJoinDigest: actionEvaluationJoin.joinDigest,
    actionEvaluationInputCarrierRef: stages[3].plan.inputCarrierRef
  });
  diagnostics.push(issue({
    id: "one_surface_semantic_not_realized",
    path: "$.af15Slot",
    expected: "T-270 binds the admitted AF-14 intent to the AF-15 effect slot",
    actual: af15Slot.status,
    evidenceRefs: [
      af14Admission.relationRef,
      constructionIntentJoin.joinRef,
      actionEvaluationJoin.joinRef,
      af15Slot.actionEvaluationInputCarrierRef
    ],
    semantic: true
  }));
  const basis = programBasis({
    admittedProgramRef: report.subjectRef,
    admittedProgramDigest: report.inventoryDigest,
    stages,
    joins,
    af14Admission,
    af15Slot,
    recursePlan: input.recursePlan
  });
  const bindingDigest = stableSha256Digest(basis);
  const authorityProgram = Object.freeze({
    [ONE_SURFACE_PROGRAM_AUTHORITY]: true as const,
    kind: "one_surface_authority_program_binding" as const,
    bindingRef:
      `abg://one-surface/authority-program/${bindingDigest.slice("sha256:".length)}`,
    bindingDigest,
    admittedProgramRef: report.subjectRef,
    admittedProgramDigest: report.inventoryDigest,
    runtimeAddressable: false as const,
    effectsPermitted: false as const,
    runtimeAdmissionOwner: "T-270" as const,
    stages,
    joins,
    af14Admission,
    af15Slot,
    recursePlan: input.recursePlan
  });
  return Object.freeze({
    kind: "one_surface_program_compilation",
    status: "semantic_not_realized",
    authorityProgram,
    diagnostics: Object.freeze(diagnostics)
  });
}
