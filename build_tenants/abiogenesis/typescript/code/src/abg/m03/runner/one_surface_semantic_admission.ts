// Implements: T-280. These admit program-authored semantic outputs; ABG
// verifies their existing program, payload, lineage, and completeness truth.

import {
  assertAdmittedOneSurfaceAuthorityResult,
  assertEdgeFulfillmentLedger,
  assertNextActionProjection,
  assertProductAssetModel,
  assertTargetObligationBinding,
  constructOneSurfaceAuthorityInputBasis,
  constructEdgeClosureDecision,
  constructEdgeFulfillmentLedger,
  constructProductAssetModel,
  type AdmittedOneSurfaceAuthorityResult,
  type CompleteAdmittedEvidenceView,
  type EdgeFulfillmentLedger,
  type NextActionProjection,
  type OneSurfaceActionEvaluation,
  type OneSurfaceAuthorityInputBasis,
  type OneSurfaceAuthorityFunctionKind,
  type OneSurfaceRefDigest,
  type ProductAssetModel,
  type TargetObligationBinding
} from "../contracts/one_surface_authority.js";
import {
  admitOneSurfaceResultValue,
  constructOneSurfaceTypedRefusal,
  isOneSurfaceTypedRefusal,
  type OneSurfaceTypedRefusal
} from "../contracts/one_surface_contract_family.js";
import {
  constructConstructionObservationSnapshot,
  type ConstructionObservationSnapshot
} from "../contracts/construction_observation.js";
import {
  admitConstructionIntentCandidate,
  type ConstructionIntentAdmission
} from "../contracts/construction_intent.js";
import type {
  ConstructionActionCatalogProjection,
  ObservationToActionBindingProjection
} from "../contracts/construction_action_catalog.js";
import type { ConstructionPriorityProjection } from "../contracts/construction_priority.js";
import type { ConstructionGraphActionInvokedEvent } from "../contracts/carriers.js";
import type { AdmittedOutputAuthorityProjection } from "../contracts/payload_ledger.js";
import {
  deriveAssuranceClosureDecision,
  type AssuranceClosureDecision,
  type AssuranceProjection
} from "../contracts/assurance.js";
import type { EdgeAssuranceContractSelection } from "../contracts/edge_assurance_contract.js";
import {
  assertOneSurfaceAuthorityProgramBinding,
  type OneSurfaceAuthorityProgramBinding,
  type OneSurfaceStageAuthority
} from "../contracts/one_surface_program_compiler.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";

export interface OneSurfaceConstructionIntentAdmission {
  readonly kind: "one_surface_construction_intent_admission";
  readonly status: "admitted";
  readonly admissionRef: string;
  readonly admissionDigest: `sha256:${string}`;
  readonly program: OneSurfaceRefDigest;
  readonly nextAction: OneSurfaceRefDigest;
  readonly catalogView: OneSurfaceRefDigest;
  readonly workspaceBinding: OneSurfaceRefDigest;
  readonly invocationAuthority: OneSurfaceRefDigest;
  readonly targetBindingRefs: readonly string[];
  readonly constructionIntentAdmission: ConstructionIntentAdmission;
}

export interface OneSurfaceConstructionIntentRefusal {
  readonly kind: "one_surface_construction_intent_refusal";
  readonly status: "refused";
  readonly refusalRef: string;
  readonly refusalDigest: `sha256:${string}`;
  readonly program: OneSurfaceRefDigest;
  readonly nextAction: OneSurfaceRefDigest;
  readonly workspaceBinding: OneSurfaceRefDigest;
  readonly invocationAuthority: OneSurfaceRefDigest;
  readonly reasonRefs: readonly string[];
}

export type OneSurfaceConstructionIntentResult =
  | OneSurfaceConstructionIntentAdmission
  | OneSurfaceConstructionIntentRefusal;

function constructionIntentAdmissionBasis(
  admission: Omit<
    OneSurfaceConstructionIntentAdmission,
    "kind" | "admissionRef" | "admissionDigest" | "status"
  >
) {
  return Object.freeze({
    program: admission.program,
    nextAction: admission.nextAction,
    catalogView: admission.catalogView,
    workspaceBinding: admission.workspaceBinding,
    invocationAuthority: admission.invocationAuthority,
    targetBindingRefs: admission.targetBindingRefs,
    constructionIntentAdmission: admission.constructionIntentAdmission
  });
}

export function assertOneSurfaceConstructionIntentAdmission(
  admission: OneSurfaceConstructionIntentAdmission
): void {
  const digest = stableSha256Digest(constructionIntentAdmissionBasis(admission));
  if (
    admission.kind !== "one_surface_construction_intent_admission" ||
    admission.status !== "admitted" ||
    admission.constructionIntentAdmission.decision !== "admitted" ||
    admission.constructionIntentAdmission.admittedIntent === null ||
    admission.admissionDigest !== digest ||
    admission.admissionRef !==
      `abg://one-surface/intent-admission/${digest.slice("sha256:".length)}`
  ) {
    throw new TypeError("One Surface construction-intent admission seal differs");
  }
}

function constructionIntentRefusal(input: {
  readonly program: OneSurfaceAuthorityProgramBinding;
  readonly nextAction: NextActionProjection;
  readonly workspaceBinding: OneSurfaceRefDigest;
  readonly invocationAuthority: OneSurfaceRefDigest;
  readonly reasonRefs: readonly string[];
}): OneSurfaceConstructionIntentRefusal {
  const reasonRefs = uniqueStrings(
    input.reasonRefs,
    "OneSurfaceConstructionIntentRefusal.reasonRefs",
    false
  );
  const basis = Object.freeze({
    program: Object.freeze({
      ref: input.program.admittedProgramRef,
      digest: input.program.admittedProgramDigest
    }),
    nextAction: Object.freeze({
      ref: input.nextAction.projectionRef,
      digest: input.nextAction.projectionDigest
    }),
    workspaceBinding: input.workspaceBinding,
    invocationAuthority: input.invocationAuthority,
    reasonRefs
  });
  const refusalDigest = stableSha256Digest(basis);
  return Object.freeze({
    kind: "one_surface_construction_intent_refusal",
    status: "refused",
    refusalRef:
      `abg://one-surface/intent-refusal/${refusalDigest.slice("sha256:".length)}`,
    refusalDigest,
    ...basis
  });
}

function refusal<K extends OneSurfaceAuthorityFunctionKind>(
  functionKind: K,
  reason: string
): OneSurfaceTypedRefusal<K> {
  return constructOneSurfaceTypedRefusal({
    functionKind,
    judgment: "blocked",
    reasonRefs: [reason]
  });
}

function uniqueStrings(
  values: readonly string[],
  label: string,
  allowEmpty = true
): readonly string[] {
  if (!allowEmpty && values.length === 0) {
    throw new TypeError(`${label} must not be empty`);
  }
  const unique = new Set(values);
  if (
    unique.size !== values.length ||
    values.some((value) => value.length === 0)
  ) {
    throw new TypeError(`${label} must contain unique non-empty strings`);
  }
  return Object.freeze([...values]);
}

function stageHasKind<K extends OneSurfaceAuthorityFunctionKind>(
  stage: OneSurfaceStageAuthority,
  functionKind: K
): stage is OneSurfaceStageAuthority<K> {
  return stage.functionKind === functionKind;
}

function exactStage<K extends OneSurfaceAuthorityFunctionKind>(input: {
  readonly program: OneSurfaceAuthorityProgramBinding;
  readonly result: AdmittedOneSurfaceAuthorityResult<K>;
  readonly functionKind: K;
  readonly stageIndex: number;
}): OneSurfaceStageAuthority<K> | null {
  assertOneSurfaceAuthorityProgramBinding(input.program);
  assertAdmittedOneSurfaceAuthorityResult(input.result);
  const stage = input.program.stages[input.stageIndex];
  if (
    stage === undefined ||
    !stageHasKind(stage, input.functionKind) ||
    input.result.functionKind !== input.functionKind ||
    input.result.stageAuthorityRef !== stage.authorityRef ||
    input.result.stageAuthorityDigest !== stage.authorityDigest ||
    input.result.admittedOutput.status !== "admitted"
  ) {
    return null;
  }
  return stage;
}

export function oneSurfaceSynthesizeModelInputBasis(input: {
  readonly program: OneSurfaceAuthorityProgramBinding;
  readonly intentLineageRef: string;
  readonly priorModel: ProductAssetModel | null;
  readonly admittedProductTruthRefs: readonly string[];
}): OneSurfaceAuthorityInputBasis<"synthesize_model"> {
  const admittedProductTruthRefs = uniqueStrings(
    input.admittedProductTruthRefs,
    "admittedProductTruthRefs",
    false
  );
  return constructOneSurfaceAuthorityInputBasis({
    functionKind: "synthesize_model",
    inputRefs: [
      input.program.bindingRef,
      input.program.bindingDigest,
      input.intentLineageRef,
      ...(input.priorModel === null
        ? []
        : [input.priorModel.modelRef, input.priorModel.modelDigest]),
      ...admittedProductTruthRefs
    ],
    inputValue: Object.freeze({
      programRef: input.program.bindingRef,
      programDigest: input.program.bindingDigest,
      intentLineageRef: input.intentLineageRef,
      priorModelRef: input.priorModel?.modelRef ?? null,
      priorModelDigest: input.priorModel?.modelDigest ?? null,
      admittedProductTruthRefs
    })
  });
}

export function oneSurfaceEvalGapInputBasis(input: {
  readonly program: OneSurfaceAuthorityProgramBinding;
  readonly workspaceBinding: OneSurfaceRefDigest;
  readonly model: ProductAssetModel;
  readonly replayCursorRef: string;
  readonly runtimeProjectionRef: string;
  readonly observationInputRefs: readonly string[];
}): OneSurfaceAuthorityInputBasis<"eval_gap"> {
  const observationInputRefs = uniqueStrings(
    input.observationInputRefs,
    "observationInputRefs"
  );
  return constructOneSurfaceAuthorityInputBasis({
    functionKind: "eval_gap",
    inputRefs: [
      input.program.bindingRef,
      input.program.bindingDigest,
      input.workspaceBinding.ref,
      input.workspaceBinding.digest,
      input.model.modelRef,
      input.model.modelDigest,
      input.replayCursorRef,
      input.runtimeProjectionRef,
      ...observationInputRefs
    ],
    inputValue: Object.freeze({
      programRef: input.program.bindingRef,
      programDigest: input.program.bindingDigest,
      workspaceBinding: input.workspaceBinding,
      modelRef: input.model.modelRef,
      modelDigest: input.model.modelDigest,
      replayCursorRef: input.replayCursorRef,
      runtimeProjectionRef: input.runtimeProjectionRef,
      observationInputRefs
    })
  });
}

export function oneSurfaceEvaluateActionInputBasis(input: {
  readonly program: OneSurfaceAuthorityProgramBinding;
  readonly intentAdmission: OneSurfaceConstructionIntentAdmission;
  readonly targetBinding: TargetObligationBinding;
  readonly invokedEvent: ConstructionGraphActionInvokedEvent;
  readonly workspaceBinding: OneSurfaceRefDigest;
  readonly admittedEvidence: readonly AdmittedOutputAuthorityProjection[];
  readonly assuranceSelection: EdgeAssuranceContractSelection;
  readonly assuranceProjection: AssuranceProjection;
  readonly priorLedger: EdgeFulfillmentLedger | null;
}): OneSurfaceAuthorityInputBasis<"evaluate_action"> {
  const evidenceRows = [...input.admittedEvidence].sort((left, right) =>
    left.projectionRef.localeCompare(right.projectionRef)
  );
  return constructOneSurfaceAuthorityInputBasis({
    functionKind: "evaluate_action",
    inputRefs: [
      input.program.bindingRef,
      input.program.bindingDigest,
      input.intentAdmission.admissionRef,
      input.intentAdmission.admissionDigest,
      input.targetBinding.bindingRef,
      input.targetBinding.bindingDigest,
      input.invokedEvent.constructionEventRef,
      input.workspaceBinding.ref,
      input.workspaceBinding.digest,
      input.assuranceSelection.selectionRef,
      input.assuranceProjection.projectionRef,
      ...evidenceRows.flatMap((row) => [
        row.projectionRef,
        ...(row.payloadDigest === null ? [] : [row.payloadDigest])
      ]),
      ...(input.priorLedger === null
        ? []
        : [input.priorLedger.ledgerRef, input.priorLedger.ledgerDigest])
    ],
    inputValue: Object.freeze({
      programRef: input.program.bindingRef,
      programDigest: input.program.bindingDigest,
      intentAdmissionRef: input.intentAdmission.admissionRef,
      intentAdmissionDigest: input.intentAdmission.admissionDigest,
      targetBinding: input.targetBinding,
      invokedEvent: input.invokedEvent,
      workspaceBinding: input.workspaceBinding,
      admittedEvidence: evidenceRows,
      assuranceSelection: input.assuranceSelection,
      assuranceProjection: input.assuranceProjection,
      priorLedgerRef: input.priorLedger?.ledgerRef ?? null,
      priorLedgerDigest: input.priorLedger?.ledgerDigest ?? null
    })
  });
}

export function admitOneSurfaceConstructionIntent(input: {
  readonly program: OneSurfaceAuthorityProgramBinding;
  readonly nextAction: NextActionProjection;
  readonly observation: ConstructionObservationSnapshot;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly bindingProjection: ObservationToActionBindingProjection;
  readonly priorityProjection: ConstructionPriorityProjection;
  readonly workspaceBinding: OneSurfaceRefDigest;
  readonly invocationAuthority: OneSurfaceRefDigest;
}): OneSurfaceConstructionIntentResult {
  try {
    assertOneSurfaceAuthorityProgramBinding(input.program);
    assertNextActionProjection(input.nextAction);
  } catch (error: unknown) {
    return constructionIntentRefusal({
      ...input,
      reasonRefs: [
        `construction_intent_authority_invalid:${
          error instanceof Error ? error.message : String(error)
        }`
      ]
    });
  }
  const candidate = input.nextAction.intentCandidate;
  const af14Eligible =
    input.nextAction.disposition.variant === "callable_member_action" ||
    input.nextAction.disposition.variant === "internal_vector_action" ||
    input.nextAction.disposition.variant === "refinement_reentry_action" ||
    input.nextAction.disposition.variant === "repair_action";
  if (
    !af14Eligible ||
    candidate === null ||
    input.nextAction.admittedProgram.ref !== input.program.admittedProgramRef ||
    input.nextAction.admittedProgram.digest !== input.program.admittedProgramDigest ||
    input.nextAction.observationRef !== input.observation.observationId ||
    input.nextAction.actionCatalogRef !== input.actionCatalog.catalogRef ||
    input.nextAction.bindingProjectionRef !== input.bindingProjection.projectionRef ||
    input.nextAction.priorityProjectionRef !== input.priorityProjection.projectionRef ||
    input.nextAction.selectedBindingRef !== candidate.selectedBindingRef ||
    input.nextAction.selectedOutcomeRef !== candidate.selectedOutcomeRef ||
    input.nextAction.disposition.actionRef !== candidate.selectedActionRef ||
    input.nextAction.catalogView.ref.length === 0 ||
    input.nextAction.catalogView.digest.length === 0 ||
    input.workspaceBinding.ref !== input.observation.basisRef ||
    input.workspaceBinding.digest.length === 0 ||
    input.invocationAuthority.ref.length === 0 ||
    input.invocationAuthority.digest.length === 0 ||
    !input.nextAction.nextBasis.causalRefs.includes(input.workspaceBinding.ref) ||
    !input.nextAction.nextBasis.causalRefs.includes(input.workspaceBinding.digest) ||
    !input.nextAction.nextBasis.causalRefs.includes(input.invocationAuthority.ref) ||
    !input.nextAction.nextBasis.causalRefs.includes(input.invocationAuthority.digest)
  ) {
    return constructionIntentRefusal({
      ...input,
      reasonRefs: ["construction_intent_selection_authority_mismatch"]
    });
  }
  const selectedTargetBindings = input.nextAction.targetBindings.filter(
    (binding) => binding.sourceBindingRef === candidate.selectedBindingRef
  );
  if (
    selectedTargetBindings.length !== 1 ||
    selectedTargetBindings[0]!.actionRef !== candidate.selectedActionRef ||
    selectedTargetBindings[0]!.targetOutcomeRef !== candidate.selectedOutcomeRef ||
    stableSha256Digest(selectedTargetBindings[0]!.obligationRefs) !==
      stableSha256Digest([...candidate.obligationRefs].sort())
  ) {
    return constructionIntentRefusal({
      ...input,
      reasonRefs: ["construction_intent_target_obligation_mismatch"]
    });
  }
  const constructionIntentAdmission = admitConstructionIntentCandidate({
    candidate,
    observation: input.observation,
    actionCatalog: input.actionCatalog,
    bindingProjection: input.bindingProjection,
    priorityProjection: input.priorityProjection
  });
  if (
    constructionIntentAdmission.decision !== "admitted" ||
    constructionIntentAdmission.admittedIntent === null
  ) {
    return constructionIntentRefusal({
      ...input,
      reasonRefs: constructionIntentAdmission.rejectionReasonRefs.length === 0
        ? ["construction_intent_candidate_rejected"]
        : constructionIntentAdmission.rejectionReasonRefs
    });
  }
  const basis = constructionIntentAdmissionBasis({
    program: input.nextAction.admittedProgram,
    nextAction: Object.freeze({
      ref: input.nextAction.projectionRef,
      digest: input.nextAction.projectionDigest
    }),
    catalogView: input.nextAction.catalogView,
    workspaceBinding: input.workspaceBinding,
    invocationAuthority: input.invocationAuthority,
    targetBindingRefs: selectedTargetBindings.map((binding) => binding.bindingRef),
    constructionIntentAdmission
  });
  const admissionDigest = stableSha256Digest(basis);
  return Object.freeze({
    kind: "one_surface_construction_intent_admission",
    status: "admitted",
    admissionRef:
      `abg://one-surface/intent-admission/${admissionDigest.slice("sha256:".length)}`,
    admissionDigest,
    ...basis
  });
}

export function admitSynthesizeModelResult(input: {
  readonly program: OneSurfaceAuthorityProgramBinding;
  readonly result: AdmittedOneSurfaceAuthorityResult<"synthesize_model">;
  readonly intentLineageRef: string;
  readonly priorModel: ProductAssetModel | null;
  readonly admittedProductTruthRefs: readonly string[];
}): ProductAssetModel | OneSurfaceTypedRefusal<"synthesize_model"> {
  try {
    const inputBasis = oneSurfaceSynthesizeModelInputBasis(input);
    if (
      exactStage({
        program: input.program,
        result: input.result,
        functionKind: "synthesize_model",
        stageIndex: 0
      }) === null ||
      input.result.inputDigest !== inputBasis.inputDigest
    ) {
      return refusal("synthesize_model", "synthesize_model_result_authority_mismatch");
    }
    if (input.priorModel !== null) {
      assertProductAssetModel(input.priorModel);
      if (input.priorModel.intentLineageRef !== input.intentLineageRef) {
        return refusal("synthesize_model", "synthesize_model_prior_lineage_mismatch");
      }
    }
    const decoded = admitOneSurfaceResultValue(
      "synthesize_model",
      input.result.decodedValue
    );
    if (isOneSurfaceTypedRefusal(decoded)) {
      return decoded;
    }
    return constructProductAssetModel({
      intentLineageRef: input.intentLineageRef,
      priorModel: input.priorModel,
      admittedProgram: Object.freeze({
        ref: input.program.admittedProgramRef,
        digest: input.program.admittedProgramDigest
      }),
      authorityResult: Object.freeze({
        ref: input.result.resultRef,
        digest: input.result.resultDigest
      }),
      admittedProductTruthRefs: uniqueStrings(
        input.admittedProductTruthRefs,
        "admittedProductTruthRefs",
        false
      ),
      desiredAssetRefs: decoded.desiredAssetRefs,
      knownAssetRefs: decoded.knownAssetRefs
    });
  } catch (error: unknown) {
    return refusal(
      "synthesize_model",
      `synthesize_model_result_invalid:${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function admitEvalGapResult(input: {
  readonly program: OneSurfaceAuthorityProgramBinding;
  readonly result: AdmittedOneSurfaceAuthorityResult<"eval_gap">;
  readonly workspaceBinding: OneSurfaceRefDigest;
  readonly model: ProductAssetModel;
  readonly replayCursorRef: string;
  readonly runtimeProjectionRef: string;
  readonly observationInputRefs: readonly string[];
}): ConstructionObservationSnapshot | OneSurfaceTypedRefusal<"eval_gap"> {
  try {
    const inputBasis = oneSurfaceEvalGapInputBasis(input);
    const stage = exactStage({
      program: input.program,
      result: input.result,
      functionKind: "eval_gap",
      stageIndex: 1
    });
    assertProductAssetModel(input.model);
    if (
      stage === null ||
      input.result.inputDigest !== inputBasis.inputDigest ||
      input.model.admittedProgram.ref !== input.program.admittedProgramRef ||
      input.model.admittedProgram.digest !== input.program.admittedProgramDigest
    ) {
      return refusal("eval_gap", "eval_gap_result_authority_mismatch");
    }
    const decoded = admitOneSurfaceResultValue("eval_gap", input.result.decodedValue);
    if (isOneSurfaceTypedRefusal(decoded)) {
      return decoded;
    }
    const observationInputRefs = uniqueStrings(
      input.observationInputRefs,
      "observationInputRefs"
    );
    if (
      decoded.basisRef !== input.workspaceBinding.ref ||
      decoded.currentProjectionRef !== input.runtimeProjectionRef ||
      decoded.basisProjectionRef !== input.replayCursorRef ||
      ![input.model.modelRef, ...observationInputRefs].every((ref) =>
        decoded.observedStateRefs.includes(ref)
      )
    ) {
      return refusal("eval_gap", "eval_gap_input_or_catalog_basis_mismatch");
    }
    const authorityDigest = stableSha256Digest({
      programRef: input.program.admittedProgramRef,
      programDigest: input.program.admittedProgramDigest,
      resultRef: input.result.resultRef,
      resultDigest: input.result.resultDigest,
      workspaceBinding: input.workspaceBinding,
      modelRef: input.model.modelRef,
      modelDigest: input.model.modelDigest,
      replayCursorRef: input.replayCursorRef,
      runtimeProjectionRef: input.runtimeProjectionRef,
      observationInputRefs
    });
    return constructConstructionObservationSnapshot({
      ...decoded,
      actionCatalogRef:
        input.program.stages[2].allowedConsequenceCatalog.catalogRef,
      authorityDigest
    });
  } catch (error: unknown) {
    return refusal(
      "eval_gap",
      `eval_gap_result_invalid:${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function admitEvaluateActionResult(input: {
  readonly program: OneSurfaceAuthorityProgramBinding;
  readonly result: AdmittedOneSurfaceAuthorityResult<"evaluate_action">;
  readonly intentAdmission: OneSurfaceConstructionIntentAdmission;
  readonly targetBinding: TargetObligationBinding;
  readonly invokedEvent: ConstructionGraphActionInvokedEvent;
  readonly workspaceBinding: OneSurfaceRefDigest;
  readonly admittedEvidence: readonly AdmittedOutputAuthorityProjection[];
  readonly assuranceSelection: EdgeAssuranceContractSelection;
  readonly assuranceProjection: AssuranceProjection;
  readonly priorLedger: EdgeFulfillmentLedger | null;
}): OneSurfaceActionEvaluation | OneSurfaceTypedRefusal<"evaluate_action"> {
  try {
    const inputBasis = oneSurfaceEvaluateActionInputBasis(input);
    const stage = exactStage({
      program: input.program,
      result: input.result,
      functionKind: "evaluate_action",
      stageIndex: 3
    });
    if (stage === null || input.result.inputDigest !== inputBasis.inputDigest) {
      return refusal("evaluate_action", "evaluate_action_result_authority_mismatch");
    }
    const decoded = admitOneSurfaceResultValue(
      "evaluate_action",
      input.result.decodedValue
    );
    if (isOneSurfaceTypedRefusal(decoded)) {
      return decoded;
    }
    if (decoded.closureContractRef !== stage.closureContract.ref) {
      return refusal("evaluate_action", "evaluate_action_evidence_or_policy_mismatch");
    }
    assertOneSurfaceConstructionIntentAdmission(input.intentAdmission);
    assertTargetObligationBinding(input.targetBinding);
    const intent = input.intentAdmission.constructionIntentAdmission.admittedIntent;
    if (
      input.intentAdmission.status !== "admitted" ||
      intent === null ||
      input.intentAdmission.program.ref !== input.program.admittedProgramRef ||
      input.intentAdmission.program.digest !== input.program.admittedProgramDigest ||
      input.intentAdmission.workspaceBinding.ref !== input.workspaceBinding.ref ||
      input.intentAdmission.workspaceBinding.digest !== input.workspaceBinding.digest ||
      input.intentAdmission.targetBindingRefs.length !== 1 ||
      input.intentAdmission.targetBindingRefs[0] !== input.targetBinding.bindingRef ||
      input.targetBinding.sourceBindingRef !== intent?.selectedBindingRef ||
      input.targetBinding.actionRef !== intent?.selectedActionRef ||
      input.targetBinding.targetOutcomeRef !== intent?.selectedOutcomeRef ||
      stableSha256Digest(input.targetBinding.obligationRefs) !==
        stableSha256Digest([...(intent?.obligationRefs ?? [])].sort())
    ) {
      return refusal("evaluate_action", "evaluate_action_intent_or_binding_mismatch");
    }
    if (
      intent.runtimeInvocationPlanRef === null ||
      input.invokedEvent.intentId !== intent.intentId ||
      input.invokedEvent.episodeId !== intent.episodeId ||
      input.invokedEvent.iterationOrdinal !== intent.iterationOrdinal ||
      input.invokedEvent.basisProjectionRef !== intent.basisProjectionRef ||
      input.invokedEvent.correlationId !== intent.correlationId ||
      input.invokedEvent.selectedActionRef !== intent.selectedActionRef ||
      input.invokedEvent.runtimeInvocationPlanRef !== intent.runtimeInvocationPlanRef ||
      input.invokedEvent.selectedGraphFunctionRef !== intent.selectedGraphFunctionRef ||
      input.invokedEvent.selectedVectorRef !== intent.selectedVectorRef
    ) {
      return refusal("evaluate_action", "evaluate_action_invocation_causation_mismatch");
    }

    const resultScope = input.result.admittedOutput.scope;
    if (
      resultScope.basisId !== input.invokedEvent.basisId ||
      resultScope.graphFunctionId !== input.invokedEvent.graphFunctionId ||
      resultScope.graphCallId !== input.invokedEvent.graphCallId ||
      resultScope.frameId !== input.invokedEvent.frameId ||
      !sameAssuranceScope(resultScope, input.assuranceProjection.scope)
    ) {
      return refusal("evaluate_action", "evaluate_action_execution_scope_mismatch");
    }

    const contract = input.assuranceSelection.contract;
    const intentAuthorityRefs = new Set([
      ...intent.authorityRefs,
      ...intent.lawfulBasisRefs
    ]);
    const assurancePolicyRefs = new Set(
      input.assuranceProjection.authoritySnapshot.policyRefs
    );
    if (
      input.assuranceSelection.selectionRef.length === 0 ||
      contract.hookRef !== stage.closureContract.ref ||
      contract.closeDecisionSchemaRef !== stage.nativeResultSchema.schemaRef ||
      contract.targetOutcomeRef !== intent.selectedOutcomeRef ||
      contract.targetObligationBindingRefs.length !== 1 ||
      contract.targetObligationBindingRefs[0] !==
        input.targetBinding.bindingRef ||
      !contract.authoritySurfaceRefs.every((ref) => intentAuthorityRefs.has(ref)) ||
      ![contract.admissibleEvidencePolicyRef, ...contract.policyRefs].every((ref) =>
        assurancePolicyRefs.has(ref)
      ) ||
      input.assuranceProjection.authoritySnapshot.closureCapable !== true
    ) {
      return refusal("evaluate_action", "evaluate_action_evidence_or_policy_mismatch");
    }

    const evidenceRows = [...input.admittedEvidence].sort((left, right) =>
      left.projectionRef.localeCompare(right.projectionRef)
    );
    if (
      evidenceRows.length === 0 ||
      new Set(evidenceRows.map((row) => row.projectionRef)).size !==
        evidenceRows.length
    ) {
      return refusal("evaluate_action", "evaluate_action_evidence_incomplete");
    }
    const admittedKindRefs = new Set(contract.admittedEvidenceKindRefs);
    const assuranceEvidenceByRef = new Map(
      input.assuranceProjection.evidenceRows.map((row) => [row.evidenceRef, row])
    );
    if (
      assuranceEvidenceByRef.size !==
        input.assuranceProjection.evidenceRows.length
    ) {
      return refusal("evaluate_action", "evaluate_action_evidence_duplicate");
    }
    const observedKindRefs = new Set<string>();
    const evidenceRefs: string[] = [];
    for (const row of evidenceRows) {
      const evidenceKindRef = row.payloadClass ?? row.targetCarrierContractRef;
      if (
        row.status === "missing" ||
        !samePayloadScope(row.scope, resultScope) ||
        !admittedKindRefs.has(evidenceKindRef) ||
        row.evidenceRefs.length === 0 ||
        new Set(row.evidenceRefs).size !== row.evidenceRefs.length
      ) {
        return refusal("evaluate_action", "evaluate_action_evidence_incomplete");
      }
      observedKindRefs.add(evidenceKindRef);
      for (const evidenceRef of row.evidenceRefs) {
        const assuranceEvidence = assuranceEvidenceByRef.get(evidenceRef);
        if (
          assuranceEvidence === undefined ||
          row.authorityRef === null ||
          row.inputDigest === null ||
          assuranceEvidence.authorityRef !== row.authorityRef ||
          assuranceEvidence.authorityDigest !==
            input.assuranceProjection.authoritySnapshot.authorityDigest ||
          assuranceEvidence.inputDigest !== row.inputDigest ||
          row.inputDigest !==
            input.assuranceProjection.authoritySnapshot.inputDigest ||
          !input.assuranceProjection.authoritySnapshot.authorityRefs.includes(
            row.authorityRef
          )
        ) {
          return refusal(
            "evaluate_action",
            "evaluate_action_evidence_authority_mismatch"
          );
        }
        evidenceRefs.push(evidenceRef);
      }
    }
    if (new Set(evidenceRefs).size !== evidenceRefs.length) {
      return refusal("evaluate_action", "evaluate_action_evidence_duplicate");
    }
    const evidenceRefSet = new Set(evidenceRefs);
    if (
      input.targetBinding.requiredEvidenceRefs.some(
        (evidenceRef) => !evidenceRefSet.has(evidenceRef)
      )
    ) {
      return refusal("evaluate_action", "evaluate_action_evidence_incomplete");
    }
    if (
      stableSha256Digest([...observedKindRefs].sort()) !==
        stableSha256Digest([...admittedKindRefs].sort())
    ) {
      return refusal("evaluate_action", "evaluate_action_evidence_incomplete");
    }
    evidenceRefs.sort((left, right) => left.localeCompare(right));
    const assuranceEvidenceRefs = input.assuranceProjection.evidenceRows
      .map((row) => row.evidenceRef)
      .sort((left, right) => left.localeCompare(right));
    if (
      input.assuranceProjection.evidenceRows.some((row) =>
        !row.boundToScope ||
        !row.complete ||
        row.shallow ||
        row.contradictsAuthority ||
        row.deferred
      ) ||
      stableSha256Digest(assuranceEvidenceRefs) !== stableSha256Digest(evidenceRefs) ||
      stableSha256Digest([...decoded.evidenceRefs].sort()) !==
        stableSha256Digest(evidenceRefs)
    ) {
      return refusal("evaluate_action", "evaluate_action_evidence_incomplete");
    }

    const assuranceDecision = deriveAssuranceClosureDecision(
      input.assuranceProjection
    );
    if (
      !dispositionMatchesAssurance(decoded.disposition, assuranceDecision) ||
      !decoded.reasonRefs.includes(assuranceDecision.reason) ||
      (decoded.disposition === "close" &&
        evidenceRows.some((row) => row.status !== "admitted"))
    ) {
      return refusal("evaluate_action", "evaluate_action_decision_mismatch");
    }

    const projectionRefs = Object.freeze(
      evidenceRows.map((row) => row.projectionRef)
    );
    const frozenEvidenceRefs = Object.freeze([...evidenceRefs]);
    const orderedEvidenceDigest = stableSha256Digest({
      projectionRefs,
      evidenceRefs: frozenEvidenceRefs
    });
    const evidenceViewBasis = Object.freeze({
      intentRef: intent.intentId,
      invocationEventRef: input.invokedEvent.constructionEventRef,
      workspaceBinding: input.workspaceBinding,
      executionScope: Object.freeze({
        basisId: resultScope.basisId,
        graphFunctionId: resultScope.graphFunctionId,
        graphCallId: resultScope.graphCallId,
        frameId: resultScope.frameId,
        vectorIndex: resultScope.vectorIndex,
        edge: resultScope.edge
      }),
      assuranceSelectionRef: input.assuranceSelection.selectionRef,
      assuranceContractDigest: contract.configDigest,
      assuranceProjectionRef: input.assuranceProjection.projectionRef,
      admittedEvidenceProjectionRefs: projectionRefs,
      evidenceRefs: frozenEvidenceRefs,
      orderedEvidenceDigest
    });
    const evidenceViewDigest = stableSha256Digest(evidenceViewBasis);
    const evidenceView: CompleteAdmittedEvidenceView = Object.freeze({
      kind: "complete_admitted_evidence_view",
      viewRef:
        `abg://one-surface/evidence-view/${evidenceViewDigest.slice("sha256:".length)}`,
      viewDigest: evidenceViewDigest,
      ...evidenceViewBasis
    });

    if (input.priorLedger !== null) {
      assertEdgeFulfillmentLedger(input.priorLedger);
      if (
        input.priorLedger.intentRef !== intent.intentId ||
        input.priorLedger.workspaceBinding.ref !== input.workspaceBinding.ref ||
        input.priorLedger.workspaceBinding.digest !== input.workspaceBinding.digest ||
        input.priorLedger.admittedProgram.ref !== input.program.admittedProgramRef ||
        input.priorLedger.admittedProgram.digest !== input.program.admittedProgramDigest ||
        input.priorLedger.closureContractRef !== stage.closureContract.ref ||
        input.priorLedger.assuranceSelectionRef !==
          input.assuranceSelection.selectionRef ||
        input.priorLedger.evidenceViewDigest === evidenceView.viewDigest
      ) {
        return refusal("evaluate_action", "evaluate_action_prior_ledger_stale");
      }
    }

    const ledger = constructEdgeFulfillmentLedger({
      version: input.priorLedger === null ? 0 : input.priorLedger.version + 1,
      intentRef: intent.intentId,
      workspaceBinding: input.workspaceBinding,
      admittedProgram: Object.freeze({
        ref: input.program.admittedProgramRef,
        digest: input.program.admittedProgramDigest
      }),
      authorityResult: Object.freeze({
        ref: input.result.resultRef,
        digest: input.result.resultDigest
      }),
      closureContractRef: stage.closureContract.ref,
      evidenceViewRef: evidenceView.viewRef,
      evidenceViewDigest: evidenceView.viewDigest,
      assuranceSelectionRef: input.assuranceSelection.selectionRef,
      assuranceProjectionRef: input.assuranceProjection.projectionRef,
      evidenceRefs: frozenEvidenceRefs
    });
    const decision = constructEdgeClosureDecision({
      ledgerRef: ledger.ledgerRef,
      ledgerDigest: ledger.ledgerDigest,
      closureContractRef: stage.closureContract.ref,
      assuranceDecisionDigest: stableSha256Digest(assuranceDecision),
      disposition: decoded.disposition,
      reasonRefs: decoded.reasonRefs
    });
    return Object.freeze({
      kind: "one_surface_action_evaluation",
      evidenceView,
      ledger,
      decision
    });
  } catch (error: unknown) {
    return refusal(
      "evaluate_action",
      `evaluate_action_result_invalid:${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function samePayloadScope(
  left: AdmittedOutputAuthorityProjection["scope"],
  right: AdmittedOutputAuthorityProjection["scope"]
): boolean {
  return left.basisId === right.basisId &&
    left.graphFunctionId === right.graphFunctionId &&
    left.graphCallId === right.graphCallId &&
    left.frameId === right.frameId &&
    left.vectorIndex === right.vectorIndex &&
    left.edge === right.edge;
}

function sameAssuranceScope(
  payload: AdmittedOutputAuthorityProjection["scope"],
  assurance: AssuranceProjection["scope"]
): boolean {
  return payload.basisId === assurance.basisId &&
    payload.graphFunctionId === assurance.graphFunctionId &&
    payload.graphCallId === assurance.graphCallId &&
    payload.frameId === assurance.frameId &&
    payload.vectorIndex === assurance.vectorIndex &&
    payload.edge === assurance.edge;
}

function dispositionMatchesAssurance(
  disposition: OneSurfaceActionEvaluation["decision"]["disposition"],
  decision: AssuranceClosureDecision
): boolean {
  switch (decision.decision) {
    case "close":
      return disposition === "close";
    case "retry":
      return disposition === "retry" ||
        disposition === "repair" ||
        disposition === "re-enter";
    case "reprice":
      return disposition === "reprice";
    case "block":
      return disposition === "block";
    case "qualified_defer":
      return disposition === "yield";
  }
}
