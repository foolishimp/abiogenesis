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
  assertCompiledTraversalExecutionFamily,
  assertTraversalExecutionFamilyRuntimeProjection,
  type CompiledTraversalExecutionFamily,
  type TraversalExecutionFamilyRuntimeProjection
} from "./traversal_execution_family.js";
import {
  cInterfaceContractRef
} from "../../../gtl/m01/algebra/c_algebra.js";
import type {
  Module,
  RefinementBoundary
} from "../../../gtl/m02/contracts/carriers.js";
import {
  deriveAllowedConsequenceTraversalCatalogFromGtl,
  type AllowedConsequenceTraversalCatalog
} from "./allowed_consequence_traversal_catalog.js";
import {
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
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

const ONE_SURFACE_REFINEMENT_APPLICATION = Symbol(
  "ONE_SURFACE_REFINEMENT_APPLICATION"
);

export interface OneSurfaceRefinementApplicationRelation {
  readonly [ONE_SURFACE_REFINEMENT_APPLICATION]: true;
  readonly kind: "one_surface_refinement_application_relation";
  readonly relationRef: string;
  readonly relationDigest: `sha256:${string}`;
  readonly ownerModuleName: string;
  readonly ownerModuleDigest: `sha256:${string}`;
  readonly refinementBoundaryRef: string;
  readonly refinementBoundaryDigest: `sha256:${string}`;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly stageAuthorityRefs: readonly [string, string, string, string];
  readonly stageAuthorityDigests: readonly [
    `sha256:${string}`,
    `sha256:${string}`,
    `sha256:${string}`,
    `sha256:${string}`
  ];
  readonly joinRefs: readonly [string, string, string];
  readonly joinDigests: readonly [
    `sha256:${string}`,
    `sha256:${string}`,
    `sha256:${string}`
  ];
  readonly recursePlanRef: string;
  readonly recursePlanDigest: `sha256:${string}`;
  readonly recurseBindingRef: string;
  readonly recurseBindingDigest: `sha256:${string}`;
  readonly runtimeAddressable: false;
  readonly effectsPermitted: false;
}

export interface OneSurfaceAppliedProgramApplicationProvenance {
  readonly kind: "one_surface_applied_program_application_provenance";
  readonly applicationRef: string;
  readonly applicationArtifactDigest: `sha256:${string}`;
  readonly admissionBasisDigest: `sha256:${string}`;
  readonly catalogBasisRef: string;
  readonly catalogViewRef: string;
  readonly catalogViewDigest: `sha256:${string}`;
  readonly selectedEntryRef: string;
  readonly executionBindingDigest: `sha256:${string}`;
  readonly compiledFamilyDigest: `sha256:${string}`;
  readonly runtimeProjectionDigest: `sha256:${string}`;
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
  readonly appliedProgramApplication:
    OneSurfaceAppliedProgramApplicationProvenance | null;
  readonly refinementApplications:
    readonly OneSurfaceRefinementApplicationRelation[];
}

export interface OneSurfaceGtlProgramCompilationInput {
  readonly gtlProgram: GtlProgramConformanceInput;
  readonly stageAuthorities: readonly OneSurfaceStageAuthorityInput[];
  readonly recursePlan: CompiledTypedRecursePlan;
}

export interface OneSurfaceAppliedProgramMember {
  readonly entryRef: string;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: `sha256:${string}`;
  readonly moduleRef: string;
  readonly moduleDigest: `sha256:${string}`;
}

export interface OneSurfaceAppliedProgramCompositionBasis {
  readonly kind: "one_surface_applied_gtl_program_composition_basis";
  readonly baseProgram: Readonly<{
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  }>;
  readonly catalogBasis: Readonly<{
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  }>;
  readonly catalogRow: Readonly<{
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  }>;
  readonly catalogView: Readonly<{
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  }>;
  readonly declaration: Readonly<{
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  }>;
  readonly programMembers: readonly OneSurfaceAppliedProgramMember[];
}

export interface OneSurfaceAppliedProgramAdmissionBasis {
  readonly kind: "one_surface_applied_program_admission_basis";
  readonly applicationRef: string;
  readonly applicationArtifactDigest: `sha256:${string}`;
  readonly compositionBasis: OneSurfaceAppliedProgramCompositionBasis;
  readonly targetProgram: Readonly<{
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  }>;
  readonly baseAuthority: Readonly<{
    readonly bindingRef: string;
    readonly bindingDigest: `sha256:${string}`;
  }>;
  readonly selectedExecution: Readonly<{
    readonly entryRef: string;
    readonly executionBindingDigest: `sha256:${string}`;
  }>;
  readonly compiler: Readonly<{
    readonly catalogBasisRef: string;
    readonly selectedEntryRef: string;
    readonly executionBindingDigest: `sha256:${string}`;
    readonly moduleDigest: `sha256:${string}`;
    readonly rootGraphFunctionDigest: `sha256:${string}`;
    readonly familyDigest: `sha256:${string}`;
    readonly runtimeProjectionDigest: `sha256:${string}`;
  }>;
  readonly basisDigest: `sha256:${string}`;
}

const ONE_SURFACE_APPLIED_PROGRAM_ADMISSION = Symbol(
  "ONE_SURFACE_APPLIED_PROGRAM_ADMISSION"
);
const ONE_SURFACE_APPLIED_PROGRAM_ADMISSION_AUTHORITY = new WeakSet<object>();

export interface OneSurfaceAppliedProgramAdmission {
  readonly [ONE_SURFACE_APPLIED_PROGRAM_ADMISSION]: true;
  readonly kind: "one_surface_applied_program_admission";
  readonly basis: OneSurfaceAppliedProgramAdmissionBasis;
}

export interface BindOneSurfaceAppliedProgramInput {
  readonly baseAuthorityProgram: OneSurfaceAuthorityProgramBinding;
  readonly applicationAdmission: OneSurfaceAppliedProgramAdmission;
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
    allowedConsequenceCatalogDigest: stableSha256Digest(
      input.allowedConsequenceCatalog
    ),
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
  if (
    input.functionKind === "evaluate_next" &&
    allowedConsequenceCatalog.rows.some((row) =>
      row.expectedOutputAssetRefs.length === 0 &&
      row.allowedActionKinds.some((actionKind) =>
        actionKind === "invoke_graph_function" ||
        actionKind === "invoke_prior_vector" ||
        actionKind === "invoke_later_vector" ||
        actionKind === "reenter_graph_span" ||
        actionKind === "repair_same_edge"
      )
    )
  ) {
    throw new TypeError(
      "One Surface effect-bearing evaluate_next traversal must declare expected output assets"
    );
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
    admittedProgramRef: programMembership.admittedProgramRef,
    admittedProgramDigest: programMembership.admittedProgramDigest,
    programMembershipRef: programMembership.programMembershipRef,
    programMembershipDigest: programMembership.programMembershipDigest,
    [ONE_SURFACE_STAGE_AUTHORITY]: true as const,
    kind: "one_surface_stage_authority",
    functionKind: input.functionKind,
    authorityRef:
      `abg://one-surface/stage/${input.functionKind}/` +
      authorityDigest.slice("sha256:".length),
    authorityDigest,
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
    {
      admittedProgramRef: authority.admittedProgramRef,
      admittedProgramDigest: authority.admittedProgramDigest,
      programMembershipRef: authority.programMembershipRef,
      programMembershipDigest: authority.programMembershipDigest
    },
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

function constructOneSurfaceAuthorityRelations(
  stages: OneSurfaceAuthorityProgramBinding["stages"]
): Readonly<{
  joins: OneSurfaceAuthorityProgramBinding["joins"];
  af14Admission: OneSurfaceAf14AdmissionRelation;
  af15Slot: OneSurfaceExternalAf15Slot;
}> {
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
  return Object.freeze({ joins, af14Admission, af15Slot });
}

function refinementApplicationBasis(
  relation: Omit<
    OneSurfaceRefinementApplicationRelation,
    | typeof ONE_SURFACE_REFINEMENT_APPLICATION
    | "relationRef"
    | "relationDigest"
  >
) {
  return Object.freeze({
    kind: relation.kind,
    ownerModuleName: relation.ownerModuleName,
    ownerModuleDigest: relation.ownerModuleDigest,
    refinementBoundaryRef: relation.refinementBoundaryRef,
    refinementBoundaryDigest: relation.refinementBoundaryDigest,
    inputCarrierRef: relation.inputCarrierRef,
    outputCarrierRef: relation.outputCarrierRef,
    admittedProgramRef: relation.admittedProgramRef,
    admittedProgramDigest: relation.admittedProgramDigest,
    stageAuthorityRefs: Object.freeze([
      relation.stageAuthorityRefs[0],
      relation.stageAuthorityRefs[1],
      relation.stageAuthorityRefs[2],
      relation.stageAuthorityRefs[3]
    ] as const),
    stageAuthorityDigests: Object.freeze([
      relation.stageAuthorityDigests[0],
      relation.stageAuthorityDigests[1],
      relation.stageAuthorityDigests[2],
      relation.stageAuthorityDigests[3]
    ] as const),
    joinRefs: Object.freeze([
      relation.joinRefs[0],
      relation.joinRefs[1],
      relation.joinRefs[2]
    ] as const),
    joinDigests: Object.freeze([
      relation.joinDigests[0],
      relation.joinDigests[1],
      relation.joinDigests[2]
    ] as const),
    recursePlanRef: relation.recursePlanRef,
    recursePlanDigest: relation.recursePlanDigest,
    recurseBindingRef: relation.recurseBindingRef,
    recurseBindingDigest: relation.recurseBindingDigest,
    runtimeAddressable: relation.runtimeAddressable,
    effectsPermitted: relation.effectsPermitted
  });
}

function constructOneSurfaceRefinementApplicationRelation(input: {
  readonly module: Module;
  readonly boundary: RefinementBoundary;
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly stages: OneSurfaceAuthorityProgramBinding["stages"];
  readonly joins: OneSurfaceAuthorityProgramBinding["joins"];
  readonly recursePlan: CompiledTypedRecursePlan;
}): OneSurfaceRefinementApplicationRelation {
  input.stages.forEach(assertOneSurfaceStageAuthority);
  input.joins.forEach(assertOneSurfaceProgramJoin);
  assertCompiledTypedRecursePlan(input.recursePlan);
  const exactBoundaries = input.module.refinementBoundaries.filter(
    (candidate) => stableJsonEquals(candidate, input.boundary)
  );
  const inputCarrierRef = cInterfaceContractRef(input.boundary.inputs);
  const outputCarrierRef = cInterfaceContractRef(input.boundary.outputs);
  if (
    exactBoundaries.length !== 1 ||
    input.admittedProgramRef.length === 0 ||
    input.admittedProgramDigest.length === 0 ||
    inputCarrierRef !== input.stages[0].plan.inputCarrierRef ||
    outputCarrierRef !== input.stages[3].plan.outputCarrierRef ||
    input.recursePlan.inputCarrierRef !== outputCarrierRef ||
    input.recursePlan.outputCarrierRef !== inputCarrierRef
  ) {
    throw new TypeError(
      "published refinement does not preserve the admitted One Surface outer contract"
    );
  }
  const basis = refinementApplicationBasis({
    kind: "one_surface_refinement_application_relation",
    ownerModuleName: input.module.name,
    ownerModuleDigest: stableSha256Digest(input.module),
    refinementBoundaryRef: input.boundary.id,
    refinementBoundaryDigest: stableSha256Digest(input.boundary),
    inputCarrierRef,
    outputCarrierRef,
    admittedProgramRef: input.admittedProgramRef,
    admittedProgramDigest: input.admittedProgramDigest,
    stageAuthorityRefs: Object.freeze([
      input.stages[0].authorityRef,
      input.stages[1].authorityRef,
      input.stages[2].authorityRef,
      input.stages[3].authorityRef
    ]),
    stageAuthorityDigests: Object.freeze([
      input.stages[0].authorityDigest,
      input.stages[1].authorityDigest,
      input.stages[2].authorityDigest,
      input.stages[3].authorityDigest
    ]),
    joinRefs: Object.freeze([
      input.joins[0].joinRef,
      input.joins[1].joinRef,
      input.joins[2].joinRef
    ]),
    joinDigests: Object.freeze([
      input.joins[0].joinDigest,
      input.joins[1].joinDigest,
      input.joins[2].joinDigest
    ]),
    recursePlanRef: input.recursePlan.planRef,
    recursePlanDigest: input.recursePlan.planDigest,
    recurseBindingRef: input.recursePlan.bindingRef,
    recurseBindingDigest: input.recursePlan.bindingDigest,
    runtimeAddressable: false,
    effectsPermitted: false
  });
  const relationDigest = stableSha256Digest(basis);
  return Object.freeze({
    [ONE_SURFACE_REFINEMENT_APPLICATION]: true as const,
    relationRef:
      `abg://one-surface/refinement-application/` +
      relationDigest.slice("sha256:".length),
    relationDigest,
    ...basis
  });
}

export function assertOneSurfaceRefinementApplicationRelation(
  relation: OneSurfaceRefinementApplicationRelation
): void {
  const basis = refinementApplicationBasis(relation);
  const expectedDigest = stableSha256Digest(basis);
  if (
    relation[ONE_SURFACE_REFINEMENT_APPLICATION] !== true ||
    relation.kind !== "one_surface_refinement_application_relation" ||
    relation.relationDigest !== expectedDigest ||
    relation.relationRef !==
      `abg://one-surface/refinement-application/` +
        expectedDigest.slice("sha256:".length) ||
    relation.stageAuthorityRefs.length !== 4 ||
    relation.stageAuthorityDigests.length !== 4 ||
    relation.joinRefs.length !== 3 ||
    relation.joinDigests.length !== 3 ||
    relation.runtimeAddressable !== false ||
    relation.effectsPermitted !== false ||
    relation.inputCarrierRef.length === 0 ||
    relation.outputCarrierRef.length === 0
  ) {
    throw new TypeError("One Surface refinement application seal differs");
  }
}

function programBasis(input: {
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly stages: readonly OneSurfaceStageAuthority[];
  readonly joins: readonly OneSurfaceProgramJoin[];
  readonly af14Admission: OneSurfaceAf14AdmissionRelation;
  readonly af15Slot: OneSurfaceExternalAf15Slot;
  readonly recursePlan: CompiledTypedRecursePlan;
  readonly appliedProgramApplication:
    OneSurfaceAppliedProgramApplicationProvenance | null;
  readonly refinementApplications:
    readonly OneSurfaceRefinementApplicationRelation[];
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
    recursePlanDigest: input.recursePlan.planDigest,
    appliedProgramApplication: input.appliedProgramApplication,
    refinementApplications: Object.freeze([
      ...input.refinementApplications
    ])
  });
}

function sealOneSurfaceAuthorityProgramBinding(input: {
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly stages: OneSurfaceAuthorityProgramBinding["stages"];
  readonly joins: OneSurfaceAuthorityProgramBinding["joins"];
  readonly af14Admission: OneSurfaceAf14AdmissionRelation;
  readonly af15Slot: OneSurfaceExternalAf15Slot;
  readonly recursePlan: CompiledTypedRecursePlan;
  readonly appliedProgramApplication:
    OneSurfaceAppliedProgramApplicationProvenance | null;
  readonly refinementApplications:
    readonly OneSurfaceRefinementApplicationRelation[];
}): OneSurfaceAuthorityProgramBinding {
  const basis = programBasis(input);
  const bindingDigest = stableSha256Digest(basis);
  return Object.freeze({
    [ONE_SURFACE_PROGRAM_AUTHORITY]: true as const,
    kind: "one_surface_authority_program_binding" as const,
    bindingRef:
      `abg://one-surface/authority-program/${bindingDigest.slice("sha256:".length)}`,
    bindingDigest,
    admittedProgramRef: input.admittedProgramRef,
    admittedProgramDigest: input.admittedProgramDigest,
    runtimeAddressable: false as const,
    effectsPermitted: false as const,
    runtimeAdmissionOwner: "T-270" as const,
    stages: input.stages,
    joins: input.joins,
    af14Admission: input.af14Admission,
    af15Slot: input.af15Slot,
    recursePlan: input.recursePlan,
    appliedProgramApplication: input.appliedProgramApplication,
    refinementApplications: Object.freeze([...input.refinementApplications])
  });
}

function constructAppliedProgramApplicationProvenance(
  admission: OneSurfaceAppliedProgramAdmission
): OneSurfaceAppliedProgramApplicationProvenance {
  assertOneSurfaceAppliedProgramAdmission(admission);
  const basis = admission.basis;
  return Object.freeze({
    kind: "one_surface_applied_program_application_provenance" as const,
    applicationRef: basis.applicationRef,
    applicationArtifactDigest: basis.applicationArtifactDigest,
    admissionBasisDigest: basis.basisDigest,
    catalogBasisRef: basis.compositionBasis.catalogBasis.ref,
    catalogViewRef: basis.compositionBasis.catalogView.ref,
    catalogViewDigest: basis.compositionBasis.catalogView.digest,
    selectedEntryRef: basis.selectedExecution.entryRef,
    executionBindingDigest: basis.selectedExecution.executionBindingDigest,
    compiledFamilyDigest: basis.compiler.familyDigest,
    runtimeProjectionDigest: basis.compiler.runtimeProjectionDigest
  });
}

function assertAppliedProgramApplicationProvenance(
  provenance: OneSurfaceAppliedProgramApplicationProvenance | null
): void {
  if (provenance === null) return;
  if (
    provenance.kind !==
      "one_surface_applied_program_application_provenance" ||
    provenance.applicationRef.length === 0 ||
    provenance.catalogBasisRef.length === 0 ||
    provenance.catalogViewRef.length === 0 ||
    provenance.selectedEntryRef.length === 0 ||
    [
      provenance.applicationArtifactDigest,
      provenance.admissionBasisDigest,
      provenance.catalogViewDigest,
      provenance.executionBindingDigest,
      provenance.compiledFamilyDigest,
      provenance.runtimeProjectionDigest
    ].some((value) => !SHA256_DIGEST_PATTERN.test(value))
  ) {
    throw new TypeError("One Surface applied-program application provenance seal differs");
  }
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
  assertAppliedProgramApplicationProvenance(
    binding.appliedProgramApplication
  );
  exactTuple(binding.stages);
  const [selectionJoin, constructionIntentJoin, actionEvaluationJoin] =
    exactJoinTuple(binding.joins);
  const expectedStageAuthorityRefs = Object.freeze(
    binding.stages.map((stage) => stage.authorityRef)
  );
  const expectedStageAuthorityDigests = Object.freeze(
    binding.stages.map((stage) => stage.authorityDigest)
  );
  const expectedJoinRefs = Object.freeze(
    binding.joins.map((join) => join.joinRef)
  );
  const expectedJoinDigests = Object.freeze(
    binding.joins.map((join) => join.joinDigest)
  );
  const refinementCoordinates = new Set<string>();
  binding.refinementApplications.forEach((relation) => {
    assertOneSurfaceRefinementApplicationRelation(relation);
    const coordinate = `${relation.ownerModuleName}\u0000${relation.refinementBoundaryRef}`;
    if (
      refinementCoordinates.has(coordinate) ||
      relation.admittedProgramRef !== binding.admittedProgramRef ||
      relation.admittedProgramDigest !== binding.admittedProgramDigest ||
      !stableJsonEquals(
        relation.stageAuthorityRefs,
        expectedStageAuthorityRefs
      ) ||
      !stableJsonEquals(
        relation.stageAuthorityDigests,
        expectedStageAuthorityDigests
      ) ||
      !stableJsonEquals(relation.joinRefs, expectedJoinRefs) ||
      !stableJsonEquals(relation.joinDigests, expectedJoinDigests) ||
      relation.recursePlanRef !== binding.recursePlan.planRef ||
      relation.recursePlanDigest !== binding.recursePlan.planDigest ||
      relation.recurseBindingRef !== binding.recursePlan.bindingRef ||
      relation.recurseBindingDigest !== binding.recursePlan.bindingDigest ||
      relation.inputCarrierRef !== binding.stages[0].plan.inputCarrierRef ||
      relation.outputCarrierRef !== binding.stages[3].plan.outputCarrierRef ||
      relation.inputCarrierRef !== binding.recursePlan.outputCarrierRef ||
      relation.outputCarrierRef !== binding.recursePlan.inputCarrierRef
    ) {
      throw new TypeError(
        "One Surface refinement application program authority differs"
      );
    }
    refinementCoordinates.add(coordinate);
  });
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

const SHA256_DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;

function appliedProgramAdmissionBasisWithoutDigest(
  basis: OneSurfaceAppliedProgramAdmissionBasis
) {
  return Object.freeze({
    kind: basis.kind,
    applicationRef: basis.applicationRef,
    applicationArtifactDigest: basis.applicationArtifactDigest,
    compositionBasis: basis.compositionBasis,
    targetProgram: basis.targetProgram,
    baseAuthority: basis.baseAuthority,
    selectedExecution: basis.selectedExecution,
    compiler: basis.compiler
  });
}

function assertAppliedProgramAdmissionBasis(
  basis: OneSurfaceAppliedProgramAdmissionBasis
): void {
  for (const [label, value] of [
    ["applicationRef", basis.applicationRef],
    ["baseProgramRef", basis.compositionBasis.baseProgram.ref],
    ["targetProgramRef", basis.targetProgram.ref],
    ["catalogBasisRef", basis.compositionBasis.catalogBasis.ref],
    ["catalogViewRef", basis.compositionBasis.catalogView.ref],
    ["selectedEntryRef", basis.selectedExecution.entryRef]
  ] as const) {
    if (typeof value !== "string" || value.length === 0) {
      throw new TypeError(`One Surface ${label} must be non-empty`);
    }
  }
  for (const [label, value] of [
    ["applicationArtifactDigest", basis.applicationArtifactDigest],
    ["baseProgramDigest", basis.compositionBasis.baseProgram.digest],
    ["targetProgramDigest", basis.targetProgram.digest],
    ["baseBindingDigest", basis.baseAuthority.bindingDigest],
    ["catalogBasisDigest", basis.compositionBasis.catalogBasis.digest],
    ["catalogRowDigest", basis.compositionBasis.catalogRow.digest],
    ["catalogViewDigest", basis.compositionBasis.catalogView.digest],
    ["declarationDigest", basis.compositionBasis.declaration.digest],
    ["executionBindingDigest", basis.selectedExecution.executionBindingDigest],
    ["compilerModuleDigest", basis.compiler.moduleDigest],
    ["compilerGraphFunctionDigest", basis.compiler.rootGraphFunctionDigest],
    ["compilerFamilyDigest", basis.compiler.familyDigest],
    ["runtimeProjectionDigest", basis.compiler.runtimeProjectionDigest],
    ["basisDigest", basis.basisDigest]
  ] as const) {
    if (typeof value !== "string" || !SHA256_DIGEST_PATTERN.test(value)) {
      throw new TypeError(`One Surface ${label} must be a sha256 digest`);
    }
  }
  if (
    basis.kind !== "one_surface_applied_program_admission_basis" ||
    basis.compositionBasis.kind !==
      "one_surface_applied_gtl_program_composition_basis" ||
    basis.targetProgram.digest !==
      stableSha256Digest(basis.compositionBasis) ||
    !basis.targetProgram.ref.endsWith(
      basis.targetProgram.digest.slice("sha256:".length)
    ) ||
    basis.targetProgram.ref === basis.compositionBasis.baseProgram.ref ||
    basis.targetProgram.digest === basis.compositionBasis.baseProgram.digest ||
    basis.applicationRef === basis.compositionBasis.baseProgram.ref ||
    basis.applicationRef === basis.targetProgram.ref ||
    basis.compiler.catalogBasisRef !== basis.compositionBasis.catalogBasis.ref ||
    basis.compiler.selectedEntryRef !== basis.selectedExecution.entryRef ||
    basis.compiler.executionBindingDigest !==
      basis.selectedExecution.executionBindingDigest ||
    basis.basisDigest !== stableSha256Digest(
      appliedProgramAdmissionBasisWithoutDigest(basis)
    )
  ) {
    throw new TypeError("One Surface applied-program admission basis differs");
  }
  const members = basis.compositionBasis.programMembers;
  if (members.length === 0) {
    throw new TypeError("One Surface applied program has no members");
  }
  const entryRefs = new Set<string>();
  let selectedCount = 0;
  let priorEntryRef: string | null = null;
  for (const member of members) {
    if (
      member.entryRef.length === 0 ||
      member.graphFunctionRef.length === 0 ||
      member.moduleRef.length === 0 ||
      !SHA256_DIGEST_PATTERN.test(member.graphFunctionDigest) ||
      !SHA256_DIGEST_PATTERN.test(member.moduleDigest)
    ) {
      throw new TypeError("One Surface applied-program member differs");
    }
    if (
      entryRefs.has(member.entryRef) ||
      (priorEntryRef !== null && member.entryRef < priorEntryRef)
    ) {
      throw new TypeError("One Surface applied-program members are duplicated");
    }
    entryRefs.add(member.entryRef);
    priorEntryRef = member.entryRef;
    if (member.entryRef === basis.selectedExecution.entryRef) {
      if (
        member.moduleDigest !== basis.compiler.moduleDigest ||
        member.graphFunctionDigest !==
          basis.compiler.rootGraphFunctionDigest
      ) {
        throw new TypeError(
          "One Surface selected member differs from compiler authority"
        );
      }
      selectedCount += 1;
    }
  }
  if (selectedCount !== 1) {
    throw new TypeError(
      "One Surface selected execution is not one applied-program member"
    );
  }
}

export function constructOneSurfaceAppliedProgramAdmission(input: {
  readonly baseAuthorityProgram: OneSurfaceAuthorityProgramBinding;
  readonly applicationRef: string;
  readonly applicationArtifact: IJsonValue;
  readonly compositionBasis: OneSurfaceAppliedProgramCompositionBasis;
  readonly targetProgram: Readonly<{
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  }>;
  readonly selectedExecution: Readonly<{
    readonly entryRef: string;
    readonly executionBindingDigest: `sha256:${string}`;
  }>;
  readonly compiled: Readonly<{
    readonly family: CompiledTraversalExecutionFamily;
    readonly runtimeProjection: TraversalExecutionFamilyRuntimeProjection;
  }>;
}): OneSurfaceAppliedProgramAdmission {
  assertOneSurfaceAuthorityProgramBinding(input.baseAuthorityProgram);
  assertCompiledTraversalExecutionFamily(input.compiled.family);
  assertTraversalExecutionFamilyRuntimeProjection(
    input.compiled.runtimeProjection
  );
  if (
    input.compiled.runtimeProjection.compactFamily.familyDigest !==
      input.compiled.family.familyDigest
  ) {
    throw new TypeError(
      "One Surface applied-program compiler projection differs"
    );
  }
  if (
    input.compositionBasis.baseProgram.ref !==
      input.baseAuthorityProgram.admittedProgramRef ||
    input.compositionBasis.baseProgram.digest !==
      input.baseAuthorityProgram.admittedProgramDigest
  ) {
    throw new TypeError("One Surface applied-program base authority differs");
  }
  if (
    typeof input.applicationArtifact !== "object" ||
    input.applicationArtifact === null ||
    Array.isArray(input.applicationArtifact)
  ) {
    throw new TypeError("One Surface applied-program artifact must be an object");
  }
  const artifact = input.applicationArtifact as Readonly<
    Record<string, IJsonValue>
  >;
  if (
    artifact["applicationRef"] !== input.applicationRef ||
    !stableJsonEquals(artifact["programBasis"], input.compositionBasis) ||
    !stableJsonEquals(artifact["target"], input.targetProgram)
  ) {
    throw new TypeError(
      "One Surface applied-program artifact authority differs"
    );
  }
  const compiler = Object.freeze({
    catalogBasisRef: input.compiled.family.catalogBasisRef,
    selectedEntryRef: input.compiled.family.selectedCatalogEntryRef,
    executionBindingDigest: input.compiled.family.executionBindingDigest,
    moduleDigest: input.compiled.family.moduleDigest,
    rootGraphFunctionDigest: input.compiled.family.rootGraphFunctionDigest,
    familyDigest: input.compiled.family.familyDigest,
    runtimeProjectionDigest: input.compiled.runtimeProjection.projectionDigest
  });
  const withoutDigest = Object.freeze({
    kind: "one_surface_applied_program_admission_basis" as const,
    applicationRef: input.applicationRef,
    applicationArtifactDigest: stableSha256Digest(input.applicationArtifact),
    compositionBasis: input.compositionBasis,
    targetProgram: input.targetProgram,
    baseAuthority: Object.freeze({
      bindingRef: input.baseAuthorityProgram.bindingRef,
      bindingDigest: input.baseAuthorityProgram.bindingDigest
    }),
    selectedExecution: input.selectedExecution,
    compiler
  });
  const basis = Object.freeze({
    ...withoutDigest,
    basisDigest: stableSha256Digest(withoutDigest)
  });
  assertAppliedProgramAdmissionBasis(basis);
  const admission = Object.freeze({
    [ONE_SURFACE_APPLIED_PROGRAM_ADMISSION]: true as const,
    kind: "one_surface_applied_program_admission" as const,
    basis
  });
  ONE_SURFACE_APPLIED_PROGRAM_ADMISSION_AUTHORITY.add(admission);
  return admission;
}

export function assertOneSurfaceAppliedProgramAdmission(
  admission: OneSurfaceAppliedProgramAdmission
): void {
  if (
    admission.kind !== "one_surface_applied_program_admission" ||
    admission[ONE_SURFACE_APPLIED_PROGRAM_ADMISSION] !== true ||
    !ONE_SURFACE_APPLIED_PROGRAM_ADMISSION_AUTHORITY.has(admission)
  ) {
    throw new TypeError("One Surface applied-program admission is not owned");
  }
  assertAppliedProgramAdmissionBasis(admission.basis);
}

function rebindOneSurfaceStage<K extends OneSurfaceAuthorityFunctionKind>(
  stage: OneSurfaceStageAuthority<K>,
  target: Readonly<{
    admittedProgramRef: string;
    admittedProgramDigest: `sha256:${string}`;
  }>
): OneSurfaceStageAuthority<K> {
  const input: OneSurfaceStageAuthorityInput<K> = Object.freeze({
    functionKind: stage.functionKind,
    stage: stage.stage,
    plan: stage.plan,
    resultAuthority: stage.resultAuthority,
    traversalContracts: stage.traversalContracts
  });
  return admitStage(
    input,
    constructStageProgramMembership({
      admittedProgramRef: target.admittedProgramRef,
      admittedProgramDigest: target.admittedProgramDigest,
      stageAuthority: input,
      targetCarrierContract: stage.targetCarrierContract
    }),
    stage.targetCarrierContract,
    stage.allowedConsequenceCatalog,
    stage.nativeResultSchema
  );
}

export function bindOneSurfaceAuthorityProgramToAppliedProgram(
  input: BindOneSurfaceAppliedProgramInput
): OneSurfaceAuthorityProgramBinding {
  assertOneSurfaceAuthorityProgramBinding(input.baseAuthorityProgram);
  assertOneSurfaceAppliedProgramAdmission(input.applicationAdmission);
  const admission = input.applicationAdmission.basis;
  if (
    admission.baseAuthority.bindingRef !==
      input.baseAuthorityProgram.bindingRef ||
    admission.baseAuthority.bindingDigest !==
      input.baseAuthorityProgram.bindingDigest ||
    admission.compositionBasis.baseProgram.ref !==
      input.baseAuthorityProgram.admittedProgramRef ||
    admission.compositionBasis.baseProgram.digest !==
      input.baseAuthorityProgram.admittedProgramDigest
  ) {
    throw new TypeError("One Surface applied-program base binding differs");
  }
  if (input.baseAuthorityProgram.refinementApplications.length !== 0) {
    throw new TypeError(
      "One Surface published refinement applications cannot be rebound without their exact owning modules"
    );
  }
  if (input.baseAuthorityProgram.appliedProgramApplication !== null) {
    throw new TypeError(
      "One Surface authority program is already derived from one AF-10 application"
    );
  }
  const target = Object.freeze({
    admittedProgramRef: admission.targetProgram.ref,
    admittedProgramDigest: admission.targetProgram.digest
  });
  const stages = exactTuple([
    rebindOneSurfaceStage(input.baseAuthorityProgram.stages[0], target),
    rebindOneSurfaceStage(input.baseAuthorityProgram.stages[1], target),
    rebindOneSurfaceStage(input.baseAuthorityProgram.stages[2], target),
    rebindOneSurfaceStage(input.baseAuthorityProgram.stages[3], target)
  ]);
  const relations = constructOneSurfaceAuthorityRelations(stages);
  const appliedProgramApplication =
    constructAppliedProgramApplicationProvenance(input.applicationAdmission);
  const binding = sealOneSurfaceAuthorityProgramBinding({
    admittedProgramRef: target.admittedProgramRef,
    admittedProgramDigest: target.admittedProgramDigest,
    stages,
    joins: relations.joins,
    af14Admission: relations.af14Admission,
    af15Slot: relations.af15Slot,
    recursePlan: input.baseAuthorityProgram.recursePlan,
    appliedProgramApplication,
    refinementApplications: Object.freeze([])
  });
  assertOneSurfaceAuthorityProgramBinding(binding);
  return binding;
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
  let recursePlanAdmitted = true;
  try {
    assertCompiledTypedRecursePlan(input.recursePlan);
  } catch (error: unknown) {
    recursePlanAdmitted = false;
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
  const recursePlanVisible =
    ownerModules.length === 1 && recurseImports.length === 1;
  if (!recursePlanVisible) {
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
  let authorityJoinsAdmitted = false;
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
    } else {
      authorityJoinsAdmitted = true;
    }
  }
  const publishedRefinements = (input.gtlProgram.modules ?? []).flatMap(
    (module, moduleIndex) => module.refinementBoundaries.map(
      (boundary, boundaryIndex) => Object.freeze({
        module,
        boundary,
        moduleIndex,
        boundaryIndex
      })
    )
  );
  if (
    publishedRefinements.length > 0 &&
    (
      admitted.length !== 4 ||
      !authorityJoinsAdmitted ||
      !recursePlanAdmitted ||
      !recursePlanVisible
    )
  ) {
    for (const published of publishedRefinements) {
      diagnostics.push(issue({
        id: "one_surface_refinement_incomplete",
        path:
          `$.gtlProgram.modules[${String(published.moduleIndex)}]` +
          `.refinementBoundaries[${String(published.boundaryIndex)}]`,
        expected:
          "the published refinement binds the same admitted authority program and T-262 recurse plan",
        actual: "parent authority relation is incomplete",
        evidenceRefs: Object.freeze([
          ...evidenceRefs,
          published.boundary.id,
          stableSha256Digest(published.boundary)
        ]),
        semantic: true
      }));
    }
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
  const relations = constructOneSurfaceAuthorityRelations(stages);
  const { joins, af14Admission, af15Slot } = relations;
  const [, constructionIntentJoin, actionEvaluationJoin] = joins;
  const refinementApplications: OneSurfaceRefinementApplicationRelation[] = [];
  if (
    authorityJoinsAdmitted &&
    recursePlanAdmitted &&
    recursePlanVisible
  ) {
    for (const published of publishedRefinements) {
      try {
        refinementApplications.push(
          constructOneSurfaceRefinementApplicationRelation({
            module: published.module,
            boundary: published.boundary,
            admittedProgramRef: report.subjectRef,
            admittedProgramDigest: report.inventoryDigest,
            stages,
            joins,
            recursePlan: input.recursePlan
          })
        );
      } catch (error: unknown) {
        diagnostics.push(issue({
          id: "one_surface_refinement_incomplete",
          path:
            `$.gtlProgram.modules[${String(published.moduleIndex)}]` +
            `.refinementBoundaries[${String(published.boundaryIndex)}]`,
          expected:
            "exact AF-11 input -> AF-16 output boundary with T-262 foldback to AF-11",
          actual: error instanceof Error ? error.message : String(error),
          evidenceRefs: Object.freeze([
            ...evidenceRefs,
            published.boundary.id,
            stableSha256Digest(published.boundary),
            input.recursePlan.planRef,
            input.recursePlan.planDigest
          ]),
          semantic: true
        }));
      }
    }
  }
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
  const authorityProgram = sealOneSurfaceAuthorityProgramBinding({
    admittedProgramRef: report.subjectRef,
    admittedProgramDigest: report.inventoryDigest,
    stages,
    joins,
    af14Admission,
    af15Slot,
    recursePlan: input.recursePlan,
    appliedProgramApplication: null,
    refinementApplications
  });
  return Object.freeze({
    kind: "one_surface_program_compilation",
    status: "semantic_not_realized",
    authorityProgram,
    diagnostics: Object.freeze(diagnostics)
  });
}
