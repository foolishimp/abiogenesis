import { isGovernanceWorkState, retainedGovernanceWorkInput, constructGovernanceWorkState, governanceRef, governanceContract, GOVERNANCE_OPERATIONS, isFramedSynthesisTask, isFramedSynthesisResult, isFramedSynthesisJudgment } from "./default_library.js";
import { isRegisteredGraphChoice } from "../gtl/registered_selection.js";
import { isRetainedGraphInput } from "./worksite_preparation_contracts.js";
import { isDeepStrictEqual as governanceSame } from "node:util";
import type { NativeJudgmentProofOperations } from "../implementation/contracts.js";
import { NATIVE_WORK_REACQUISITION_IDS as reacquireIds, isNativeWorksiteCommandReacquisitionRequest } from "./worksite_command_execution.js";
import { nativeWorkReacquisitionResultMatches } from "../abg/native_work_reacquisition.js";
import { isRecord } from "../shared/admission_predicates.js";
import { NATIVE_WORKSPACE_WORK_IDS as nativeIds, isNativeWorkspaceWorkTask, nativeWorkspaceWorkResultContractRef, isNativeWorkspaceWorkReport,
  isNativeWorkspaceWorkObservation, isNativeWorkspaceWorkFailure, resolveNativeWorkspaceWorkJudgmentRelation } from "./native_workspace_work.js";
import { WORKSITE_PRESERVED_RESULT_IDS, isWorksitePreservedResultArtifact, resolveWorksitePreservedResultJudgmentRelation } from "./worksite_construction_recovery.js";
import { WORKSITE_REVISION_IDS, isWorksiteRevisionCommandExecutionTask } from "./worksite_revision.js";
import { isWorksiteRevisionCommandExecutionObservation, isWorksiteRevisionCommandExecutionWorkerResult } from "./worksite_command_execution.js";
import { SEMANTIC_REVISION_IDS as revisionIds } from "../gtl/semantic_revision_identity.js";
import { isSemanticRevisionRequest, isSemanticRevisionEnvelope, isSemanticRevisionSelection, isSemanticRevisionSelectionInput, deriveRevisionAsset, deriveRevisionAssessment,
  isSemanticJobRevisionEnvelope, deriveJobRevisionAsset, deriveJobRevisionAssessment, isNativeSemanticRevisionIntake, evaluateNativeSemanticRevisionRelation } from "./semantic_revision.js";
import { SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
import { evaluateNativeSemanticRelation, isSemanticJobInput, isSemanticJobEnvelope, isSemanticJobAssetCandidate, isSemanticJobDesignResponse, evaluateSemanticJobRelation } from "./semantic_job.js";
import { isWorksiteFileParentsRequest, isWorksiteFileParentsSuccess, isWorksiteFileParentsFailure } from "./worksite_effect.js";
import { isSemanticStageEnvelope, isSemanticAssetCandidate, isSemanticAssessmentCandidate, deriveSemanticAsset, deriveSemanticAssessment, deriveSemanticWorksitePreparation } from "./semantic_stage.js";
import { REQUIREMENT_HANDOFF_IDS } from "../gtl/requirement_handoff.js";
import { isRequirementHandoffInput, isRequirementHandoffOutput } from "./requirement_handoff.js";
import {
  admitWorksitePreparationInput, isWorksitePreparationInput, preparationConstructionTasks, rederiveWorksiteCommandTask,
  validateWorksitePreparationContractValue, resolveWorksitePreparationJudgmentRelation,
} from "./worksite_preparation.js";
import {
  WORKSITE_C0_IDS,
  isWorksiteFileReplaceOutput,
  resolveWorksiteC0JudgmentRelation,
} from "../gtl/index.js";
import {
  WORKSITE_COMMAND_EXECUTION_IDS,
  isWorksiteCommandExecutionFailure,
  isWorksiteCommandExecutionObservation,
  isC2WorksiteCommandExecutionTask, isNativeWorksiteCommandExecutionTask, isNativeWorksiteCommandExecutionObservation, isObservedWorksiteCommandExecutionTask, isObservedWorksiteCommandExecutionObservation,
  isWorksiteCommandExecutionWorkerResult,
  resolveWorksiteCommandExecutionJudgmentRelation,
} from "./worksite_command_execution.js";
import { isWorksiteFileReplaceRequest } from "./worksite_effect.js";
import {
  WORKSITE_BRANCH_CONSTRUCTION_IDS,
  isWorksiteBranchConstructionBranchApplicationFailure,
  isWorksiteBranchConstructionFailure,
  isWorksiteBranchConstructionOutputVector,
  isWorksiteBranchConstructionTask,
  isWorksiteBranchConstructionVector,
  resolveWorksiteBranchConstructionJudgmentRelation,
} from "./worksite_branch_construction.js";
import {
  WORKSITE_CONSTRUCTION_IDS,
  isWorksiteCandidateBundle,
  isWorksiteConstructionFailure,
  isWorksiteConstructionVectorApplicationFailure,
  isWorksiteConstructionResult,
  isWorksiteConstructionTask,
  isWorksiteConstructionWorkerResult,
  isWorksiteFileReplaceOutputVector,
  isWorksiteFileReplaceVector,
  resolveWorksiteConstructionJudgmentRelation,
} from "./worksite_construction.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "./contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ProductSemanticsProvider } from "./semantics.js";
import { canonicalEquals } from "../shared/value/index.js";

function admitInput(
  contractRef: string,
  value: unknown,
): Readonly<Record<string, JsonValue>> | null {
  if (contractRef === reacquireIds.requestContractRef && isNativeWorksiteCommandReacquisitionRequest(value))
    return deepFreeze(value);
  if (contractRef === nativeIds.taskContractRef && isNativeWorkspaceWorkTask(value))
    return deepFreeze(value);
  if (contractRef === WORKSITE_PRESERVED_RESULT_IDS.artifactContractRef && isWorksitePreservedResultArtifact(value)) {
    return deepFreeze(value);
  }
  if (contractRef === WORKSITE_REVISION_IDS.taskContractRef && isWorksiteRevisionCommandExecutionTask(value)) return deepFreeze(value);
  const preparation = admitWorksitePreparationInput(contractRef, value);
  if (preparation !== null) return preparation;
  if (
    contractRef === WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef &&
    isC2WorksiteCommandExecutionTask(value)
  ) {
    return deepFreeze(value);
  }
  if (
    contractRef === WORKSITE_C0_IDS.inputContractRef &&
    isWorksiteFileReplaceRequest(value)
  ) {
    return deepFreeze(value);
  }
  if (
    contractRef === WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef &&
    isWorksiteBranchConstructionTask(value)
  ) {
    return deepFreeze(value);
  }
  if (
    contractRef === WORKSITE_BRANCH_CONSTRUCTION_IDS.vectorContractRef &&
    isWorksiteBranchConstructionVector(value)
  ) {
    return deepFreeze(value);
  }
  if (
    contractRef ===
        WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef &&
    isWorksiteBranchConstructionOutputVector(value)
  ) {
    return deepFreeze(value);
  }
  if (
    contractRef === WORKSITE_CONSTRUCTION_IDS.taskContractRef &&
    isWorksiteConstructionTask(value)
  ) {
    return deepFreeze(value);
  }
  if (
    contractRef === WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef &&
    isWorksiteCandidateBundle(value)
  ) {
    return deepFreeze(value);
  }
  if (
    contractRef === WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef &&
    isWorksiteFileReplaceVector(value)
  ) {
    return deepFreeze(value);
  }
  if (
    contractRef ===
        WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef &&
    isWorksiteFileReplaceOutputVector(value)
  ) {
    return deepFreeze(value);
  }
  return null;
}

export const ABI5_PRODUCT_SEMANTICS = Object.freeze({
  kind: "product_semantics_provider" as const,
  schemaVersion: "5.0.0" as const,
  bindingRef: "product-semantics://abiogenesis/conformance@5",
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  admitInput,
  validateContractValue(
    valueKind: string,
    value: unknown,
  ): value is Readonly<Record<string, JsonValue>> {
    return (valueKind === "native_workspace_work_task" && isNativeWorkspaceWorkTask(value)) ||
      (valueKind === "native_workspace_work_report" && isNativeWorkspaceWorkReport(value)) ||
      (valueKind === "native_workspace_work_observation" && isNativeWorkspaceWorkObservation(value)) ||
      (valueKind === "native_workspace_work_failure" && isNativeWorkspaceWorkFailure(value)) ||
      (valueKind === "native_worksite_command_reacquisition_request" && isNativeWorksiteCommandReacquisitionRequest(value)) ||
      (valueKind === "worksite_preserved_result_artifact" && isWorksitePreservedResultArtifact(value)) ||
      validateWorksitePreparationContractValue(valueKind, value) ||
      (valueKind === "worksite_file_parents_request" && isWorksiteFileParentsRequest(value)) ||
      (valueKind === "worksite_file_parents_result" && isWorksiteFileParentsSuccess(value)) ||
      (valueKind === "worksite_effect_refusal" && isWorksiteFileParentsFailure(value)) ||
      (valueKind === "worksite_file_replace_request" &&
        isWorksiteFileReplaceRequest(value)) ||
      (valueKind === "worksite_file_replace_output" &&
        isWorksiteFileReplaceOutput(value)) ||
      (valueKind === "worksite_construction_task" &&
        isWorksiteConstructionTask(value)) ||
      (valueKind === "worksite_construction_worker_result" &&
        isWorksiteConstructionWorkerResult(value)) ||
      (valueKind === "worksite_candidate_bundle" &&
        isWorksiteCandidateBundle(value)) ||
      (valueKind === "worksite_file_replace_vector" &&
        isWorksiteFileReplaceVector(value)) ||
      (valueKind === "worksite_file_replace_output_vector" &&
        isWorksiteFileReplaceOutputVector(value)) ||
      (valueKind === "worksite_construction_result" &&
        isWorksiteConstructionResult(value)) ||
      (valueKind === "worksite_construction_failure" &&
        isWorksiteConstructionFailure(value)) ||
      (valueKind === "worksite_construction_vector_application_failure" &&
        isWorksiteConstructionVectorApplicationFailure(value)) ||
      (valueKind === "worksite_branch_construction_task" &&
        isWorksiteBranchConstructionTask(value)) ||
      (valueKind === "worksite_branch_construction_vector" &&
        isWorksiteBranchConstructionVector(value)) ||
      (valueKind === "worksite_branch_construction_output_vector" &&
        isWorksiteBranchConstructionOutputVector(value)) ||
      (valueKind === "worksite_branch_construction_failure" &&
        isWorksiteBranchConstructionFailure(value)) ||
      (valueKind ===
          "worksite_branch_construction_branch_application_failure" &&
        isWorksiteBranchConstructionBranchApplicationFailure(value)) ||
      (valueKind === "worksite_revision_command_execution_task" && isWorksiteRevisionCommandExecutionTask(value)) ||
      (valueKind === "worksite_revision_command_execution_observation" && isWorksiteRevisionCommandExecutionObservation(value)) ||
      (valueKind === "worksite_command_execution_task" &&
        isC2WorksiteCommandExecutionTask(value)) ||
      (valueKind === "worksite_command_execution_worker_result" &&
        isWorksiteCommandExecutionWorkerResult(value)) ||
      (valueKind === "worksite_revision_command_execution_worker_result" &&
        isWorksiteRevisionCommandExecutionWorkerResult(value)) ||
      (valueKind === "worksite_command_execution_observation" &&
        (isWorksiteCommandExecutionObservation(value) || isNativeWorksiteCommandExecutionObservation(value) || isObservedWorksiteCommandExecutionObservation(value))) ||
      (valueKind === "worksite_command_execution_failure" &&
        isWorksiteCommandExecutionFailure(value));
  },
  resolveJudgmentRelation: (predicateRef: string) =>
    (predicateRef === reacquireIds.predicateRef ? Object.freeze({ predicateRef,
      advanceReasonRef: "reason://abiogenesis/worksite/native-reacquisition/current@5",
      rejectionReasonRef: "reason://abiogenesis/worksite/native-reacquisition/unjoined@5",
      evaluate: (input: unknown, output: unknown, currentOwnerPrefix?: import("../abg/event_store.js").DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations,
        historicalSource?: import("../abg/terminal_result_contracts.js").AbgHistoricalGraphCallSourceResource) =>
        nativeProof?.nativeWorkReacquisition !== undefined ? nativeProof.nativeWorkReacquisition()
          : nativeWorkReacquisitionResultMatches(input, output, currentOwnerPrefix, historicalSource) }) : null) ??
    resolveNativeWorkspaceWorkJudgmentRelation(predicateRef) ??
      resolveWorksitePreservedResultJudgmentRelation(predicateRef) ?? resolveWorksiteC0JudgmentRelation(predicateRef) ??
      resolveWorksiteConstructionJudgmentRelation(predicateRef) ??
      resolveWorksiteBranchConstructionJudgmentRelation(predicateRef) ??
      resolveWorksiteCommandExecutionJudgmentRelation(predicateRef) ??
      resolveWorksitePreparationJudgmentRelation(predicateRef),
  resolveProbabilisticWorkerContracts(basis: Readonly<{
    inputContractRef: string;
    outputContractRef: string;
    input: Readonly<Record<string, JsonValue>>;
  }>) {
    if (basis.inputContractRef === nativeIds.taskContractRef && basis.outputContractRef === nativeIds.observationContractRef &&
      isNativeWorkspaceWorkTask(basis.input)) return Object.freeze({ instructionContractRef: nativeIds.taskContractRef,
        resultContractRef: nativeWorkspaceWorkResultContractRef(basis.input) });
    if (basis.inputContractRef === WORKSITE_REVISION_IDS.taskContractRef && basis.outputContractRef === WORKSITE_REVISION_IDS.observationContractRef &&
      isWorksiteRevisionCommandExecutionTask(basis.input)) return Object.freeze({ instructionContractRef: WORKSITE_REVISION_IDS.taskContractRef,
        resultContractRef: WORKSITE_REVISION_IDS.workerResultContractRef });
    if (
      basis.inputContractRef === WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef &&
      basis.outputContractRef === WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef &&
      isC2WorksiteCommandExecutionTask(basis.input)
    ) {
      return Object.freeze({
        instructionContractRef: WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef,
        resultContractRef: WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef,
      });
    }
    if (
      basis.inputContractRef === WORKSITE_CONSTRUCTION_IDS.taskContractRef &&
      basis.outputContractRef ===
        WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef &&
      isWorksiteConstructionTask(basis.input)
    ) {
      return Object.freeze({
        instructionContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef,
        resultContractRef: WORKSITE_CONSTRUCTION_IDS.workerResultContractRef,
      });
    }
    return Object.freeze({
      instructionContractRef: basis.inputContractRef,
      resultContractRef: basis.outputContractRef,
    });
  },
  validateInvocationBasis(
    basis: Parameters<
      NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>
    >[0],
  ) {
    if (isNativeWorkspaceWorkTask(basis.input)) return basis.sourceResultBasis === null &&
      basis.input.workspaceBinding.bindingId === basis.workspaceBindingId &&
      basis.input.workspaceBinding.bindingDigest === basis.workspaceBindingDigest &&
      basis.input.workspaceBinding.workspaceId === basis.workspaceId;
    if (isNativeWorksiteCommandReacquisitionRequest(basis.input)) return basis.sourceResultBasis === null &&
      basis.input.workspaceBinding.bindingId === basis.workspaceBindingId &&
      basis.input.workspaceBinding.bindingDigest === basis.workspaceBindingDigest &&
      basis.input.workspaceBinding.workspaceId === basis.workspaceId;
    if (isWorksitePreparationInput(basis.input)) {
      const tasks = preparationConstructionTasks(basis.input);
      return basis.sourceResultBasis === null && tasks.length > 0 && tasks.every((task) =>
        task.workspaceBinding.bindingId === basis.workspaceBindingId &&
        task.workspaceBinding.bindingDigest === basis.workspaceBindingDigest &&
        task.workspaceBinding.workspaceId === basis.workspaceId);
    }
    if (isC2WorksiteCommandExecutionTask(basis.input)) {
      const source = basis.sourceResultBasis;
      if (isObservedWorksiteCommandExecutionTask(basis.input)) return source === null &&
        basis.input.workspaceBinding.bindingId === basis.workspaceBindingId &&
        basis.input.workspaceBinding.bindingDigest === basis.workspaceBindingDigest &&
        basis.input.workspaceBinding.workspaceId === basis.workspaceId;
      if (isNativeWorksiteCommandExecutionTask(basis.input)) return source !== null &&
        source.sourceGraphFunctionRef === nativeIds.graphFunctionRef && source.sourceResultContractRef === nativeIds.observationContractRef &&
        source.sourceResultValueDigest === sha256Canonical(basis.input.sourceNativeWork) &&
        sha256Canonical(source.sourceResultValue) === source.sourceResultValueDigest &&
        source.sourceCCallRef === basis.input.sourceNativeWork.provenance.cCallRef &&
        source.sourceWorkspaceId === basis.workspaceId && source.workspaceBindingId === basis.workspaceBindingId &&
        source.workspaceBindingDigest === basis.workspaceBindingDigest &&
        basis.input.workspaceBinding.bindingId === basis.workspaceBindingId &&
        basis.input.workspaceBinding.bindingDigest === basis.workspaceBindingDigest;
      return source !== null &&
        basis.input.workspaceBinding.bindingId === basis.workspaceBindingId &&
        basis.input.workspaceBinding.bindingDigest === basis.workspaceBindingDigest &&
        basis.input.workspaceBinding.workspaceId === basis.workspaceId &&
        (
          source.sourceGraphFunctionRef ===
            WORKSITE_CONSTRUCTION_IDS.graphFunctionRef ||
          source.sourceGraphFunctionRef ===
            WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerGraphFunctionRef
        ) &&
        source.sourceResultContractRef === WORKSITE_CONSTRUCTION_IDS.resultContractRef &&
        source.sourceResultValueDigest === sha256Canonical(
          basis.input.sourceConstructionResult,
        ) &&
        sha256Canonical(source.sourceResultValue) === source.sourceResultValueDigest &&
        canonicalEquals(
          source.sourceResultValue,
          basis.input.sourceConstructionResult,
        ) &&
        source.sourceWorkspaceId === basis.workspaceId &&
        source.workspaceBindingId === basis.workspaceBindingId &&
        source.workspaceBindingDigest === basis.workspaceBindingDigest;
    }
    if (
      isWorksiteBranchConstructionVector(basis.input) ||
      isWorksiteBranchConstructionOutputVector(basis.input)
    ) return false;
    if (isWorksiteBranchConstructionTask(basis.input)) {
      return basis.sourceResultBasis === null &&
        basis.input.workspaceBinding.bindingId === basis.workspaceBindingId &&
        basis.input.workspaceBinding.bindingDigest ===
          basis.workspaceBindingDigest &&
        basis.input.workspaceBinding.workspaceId === basis.workspaceId;
    }
    return !isWorksiteConstructionTask(basis.input) ||
      (
        basis.sourceResultBasis === null &&
        basis.input.workspaceBinding.bindingId === basis.workspaceBindingId &&
        basis.input.workspaceBinding.bindingDigest ===
          basis.workspaceBindingDigest &&
        basis.input.workspaceBinding.workspaceId === basis.workspaceId
      );
  },
}) satisfies ProductSemanticsProvider;

/**
 * C2 publishes independently from the retained C1 module, so its declaration
 * closure needs a distinct semantics coordinate even though both resolve the
 * same ABI-owned contract laws.
 */
export const ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS = Object.freeze({
  ...ABI5_PRODUCT_SEMANTICS,
  bindingRef: "product-semantics://abiogenesis/worksite/command-execution@5",
}) satisfies ProductSemanticsProvider;

export const ABI5_NATIVE_WORKSPACE_WORK_PRODUCT_SEMANTICS = Object.freeze({
  ...ABI5_PRODUCT_SEMANTICS, bindingRef: nativeIds.semanticsBindingRef,
  validateResultEvidenceLineage(basis: Parameters<NonNullable<ProductSemanticsProvider["validateResultEvidenceLineage"]>>[0]) {
    if (basis.outputContractRef !== nativeIds.observationContractRef) return true;
    if (!isNativeWorkspaceWorkObservation(basis.value) || basis.admittedEvidence.length !== 1) return false;
    const p = basis.value.provenance, e = basis.admittedEvidence[0]!;
    return e.evidenceClass === "probabilistic_transport" && e.cCallRef === p.cCallRef &&
      e.transportDigest === p.transportDigest && e.outputDigest === sha256Canonical(basis.value);
  },
}) satisfies ProductSemanticsProvider;

export const ABI5_REQUIREMENT_HANDOFF_PRODUCT_SEMANTICS: ProductSemanticsProvider = Object.freeze({
  kind: "product_semantics_provider", schemaVersion: "5.0.0", bindingRef: "product-semantics://abiogenesis/requirement-handoff@5",
  packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
  admitInput(contractRef: string, value: unknown) {
    return contractRef === REQUIREMENT_HANDOFF_IDS.inputContractRef && isRequirementHandoffInput(value)
      ? deepFreeze(value) : null;
  },
  validateContractValue(valueKind: string, value: unknown): value is Readonly<Record<string, JsonValue>> {
    return valueKind === "requirement_handoff_input" ? isRequirementHandoffInput(value)
      : valueKind === "requirement_handoff_output" && isRequirementHandoffOutput(value);
  },
  resolveJudgmentRelation(predicateRef: string) {
    return predicateRef === REQUIREMENT_HANDOFF_IDS.judgmentPredicateRef ? {
      predicateRef, advanceReasonRef: "reason://abiogenesis/requirement-handoff/transferred@5",
      rejectionReasonRef: "reason://abiogenesis/requirement-handoff/refused@5",
      evaluate(input: unknown, output: unknown) {
        return isRequirementHandoffInput(input) && isRequirementHandoffOutput(output) && canonicalEquals(input, output.source);
      },
    } : null;
  },
});

export const ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS: ProductSemanticsProvider = Object.freeze({
  ...ABI5_PRODUCT_SEMANTICS,
  bindingRef: SEMANTIC_STAGE_IDS.semanticsBindingRef,
  admitInput(contractRef: string, value: unknown) {
    if ((contractRef === revisionIds.nativeIntakeContractRef && isNativeSemanticRevisionIntake(value)) || (contractRef === revisionIds.selectionContractRef && isSemanticRevisionSelection(value)) || (contractRef === revisionIds.selectionInputContractRef && isSemanticRevisionSelectionInput(value)) || (contractRef === revisionIds.requestContractRef && isSemanticRevisionRequest(value)) ||
      (contractRef === revisionIds.envelopeContractRef && (isSemanticRevisionEnvelope(value) || isSemanticJobRevisionEnvelope(value)))) return deepFreeze(value);
    if (contractRef === SEMANTIC_STAGE_IDS.jobInputContractRef && isSemanticJobInput(value)) return deepFreeze(value);
    return contractRef === SEMANTIC_STAGE_IDS.envelopeContractRef && (isSemanticStageEnvelope(value) || isSemanticJobEnvelope(value))
      ? deepFreeze(value)
      : ABI5_REQUIREMENT_HANDOFF_PRODUCT_SEMANTICS.admitInput(contractRef, value) ?? ABI5_PRODUCT_SEMANTICS.admitInput(contractRef, value);
  },
  validateContractValue(valueKind: string, value: unknown): value is Readonly<Record<string, JsonValue>> {
    return (valueKind === "native_semantic_revision_intake" && isNativeSemanticRevisionIntake(value)) || (valueKind === "semantic_revision_selection_input" && isSemanticRevisionSelectionInput(value)) || (valueKind === "semantic_revision_request" && isSemanticRevisionRequest(value)) ||
      (valueKind === "semantic_revision_envelope" && (isSemanticRevisionEnvelope(value) || isSemanticJobRevisionEnvelope(value))) ||
      (valueKind === "semantic_revision_selection" && isSemanticRevisionSelection(value)) ||
      (valueKind === "semantic_stage_assessment_candidate" && isSemanticAssessmentCandidate(value)) ||
      (valueKind === "semantic_job_input" && isSemanticJobInput(value)) ||
      (valueKind === "semantic_stage_envelope" && (isSemanticStageEnvelope(value) || isSemanticJobEnvelope(value))) ||
      (valueKind === "semantic_stage_worker_result" && (isSemanticAssetCandidate(value) || isSemanticJobAssetCandidate(value) || isSemanticJobDesignResponse(value) || isSemanticAssessmentCandidate(value))) ||
      (valueKind === "semantic_stage_failure" && isRecord(value) && value.kind === valueKind && value.schemaVersion === "5.0.0" &&
        typeof value.failureClass === "string" && typeof value.diagnosticRef === "string") ||
      ABI5_REQUIREMENT_HANDOFF_PRODUCT_SEMANTICS.validateContractValue(valueKind, value) || ABI5_PRODUCT_SEMANTICS.validateContractValue(valueKind, value);
  },
  resolveProbabilisticWorkerContracts(basis: Parameters<NonNullable<ProductSemanticsProvider["resolveProbabilisticWorkerContracts"]>>[0]) {
    if (basis.inputContractRef === revisionIds.selectionInputContractRef && basis.outputContractRef === revisionIds.selectionContractRef && isSemanticRevisionSelectionInput(basis.input)) return { instructionContractRef: revisionIds.selectionInputContractRef, resultContractRef: revisionIds.selectionRawContractRef };
    if (basis.inputContractRef === revisionIds.envelopeContractRef && basis.outputContractRef === revisionIds.envelopeContractRef && (isSemanticRevisionEnvelope(basis.input) || isSemanticJobRevisionEnvelope(basis.input)))
      return { instructionContractRef: revisionIds.envelopeContractRef, resultContractRef: SEMANTIC_STAGE_IDS.workerContractRef };
    return basis.inputContractRef === SEMANTIC_STAGE_IDS.envelopeContractRef && basis.outputContractRef === SEMANTIC_STAGE_IDS.envelopeContractRef && (isSemanticStageEnvelope(basis.input) || isSemanticJobEnvelope(basis.input))
      ? { instructionContractRef: SEMANTIC_STAGE_IDS.envelopeContractRef, resultContractRef: SEMANTIC_STAGE_IDS.workerContractRef }
      : ABI5_PRODUCT_SEMANTICS.resolveProbabilisticWorkerContracts(basis);
  },
  resolveJudgmentRelation(predicateRef: string) {
    if ([revisionIds.nativeIntakePredicateRef,revisionIds.nativeRequestPredicateRef,revisionIds.nativeConstructionPredicateRef,revisionIds.nativeExecutionPredicateRef,revisionIds.nativeEvidencePredicateRef].some(ref=>ref===predicateRef))
      return {predicateRef,advanceReasonRef:"reason://abiogenesis/semantic-revision/native-source-satisfied@5",rejectionReasonRef:"reason://abiogenesis/semantic-revision/native-source-refused@5",
        evaluate:(input:unknown,output:unknown)=>evaluateNativeSemanticRevisionRelation(predicateRef,input,output) === true};
    if (predicateRef === revisionIds.stepPredicateRef) {
      return { predicateRef, advanceReasonRef: "reason://abiogenesis/semantic-revision/step-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/semantic-revision/step-refused@5",
        evaluate(input: unknown, output: unknown) {
          try {
            const matches = (ref: string, before: unknown, after: unknown) =>
              ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS.resolveJudgmentRelation(ref)?.evaluate(before, after) === true;
            const native = evaluateNativeSemanticRevisionRelation(predicateRef,input,output);
            if (native !== null) return native;
            // These are typed carrier relations. The existing native owners
            // authenticate the request, historical bridge and C2 predecessors.
            const evidenceMatches = (envelope: unknown, observation: unknown) => {
              if ((!isSemanticRevisionEnvelope(envelope) && !isSemanticJobRevisionEnvelope(envelope)) || !isWorksiteRevisionCommandExecutionObservation(observation)) return false;
              const evidence = envelope.current.evidence;
              // Result digests identify ABG's admitted CCall result body, not
              // the embedded value alone. Authentic lookup remains native.
              const resultCoordinate = (ref: unknown, digest: unknown) => isSha256Digest(digest) &&
                ref === `result://abiogenesis/${digest.slice("sha256:".length)}`;
              return evidence !== null && envelope.current.worksite !== null &&
                evidence.kind === "semantic_worksite_evidence" &&
                observation.task.revisionBasisRef === envelope.revisionBasis.basisRef &&
                observation.task.revisionBasisDigest === envelope.revisionBasis.basisDigest &&
                canonicalEquals(observation.task.workspaceAuthorityBasis, envelope.current.worksite.workspaceAuthorityBasis) &&
                canonicalEquals(observation.task.workspaceBinding, envelope.current.worksite.workspaceBinding) &&
                canonicalEquals(observation.task.capabilityGrant, envelope.current.worksite.capabilityGrant) &&
                canonicalEquals(evidence.constructionResult, observation.task.sourceConstructionResult) &&
                resultCoordinate(evidence.constructionResultRef, evidence.constructionResultDigest) &&
                resultCoordinate(evidence.executionResultRef, evidence.executionResultDigest) &&
                matches(revisionIds.evidenceInputPredicateRef, observation, envelope);
            };
            if (isSemanticRevisionRequest(input)) return matches(revisionIds.projectionPredicateRef, input, output);
            if (isWorksiteRevisionCommandExecutionObservation(input)) return evidenceMatches(output, input);
            if (isWorksitePreparationInput(input) && input.kind === "worksite_revision_command_preparation_input" &&
              isWorksiteRevisionCommandExecutionObservation(output)) {
              const task = rederiveWorksiteCommandTask({ kind: "worksite_revision_command_preparation_bound_input", schemaVersion: "5.0.0",
                entry: input, source: output.task.sourceConstructionResult }, output.task);
              return canonicalEquals(task, output.task) &&
                resolveWorksiteCommandExecutionJudgmentRelation(WORKSITE_REVISION_IDS.judgmentPredicateRef)?.evaluate(task, output) === true;
            }
            if (!isSemanticRevisionEnvelope(input) && !isSemanticJobRevisionEnvelope(input)) return false;
            if (isWorksitePreparationInput(output) && output.kind === "worksite_revision_command_preparation_input") {
              const worksite = input.current.worksite;
              return worksite !== null && input.current.evidence === null &&
                output.revisionBasisRef === input.revisionBasis.basisRef && output.revisionBasisDigest === input.revisionBasis.basisDigest &&
                canonicalEquals(output.constructionTask.workspaceAuthorityBasis, worksite.workspaceAuthorityBasis) &&
                canonicalEquals(output.constructionTask.workspaceBinding, worksite.workspaceBinding) &&
                canonicalEquals(output.constructionTask.capabilityGrant, worksite.capabilityGrant) &&
                matches(revisionIds.bridgePredicateRef, input, output);
            }
            if ((!isSemanticRevisionEnvelope(output) && !isSemanticJobRevisionEnvelope(output)) || !canonicalEquals(input.revisionBasis, output.revisionBasis)) return false;
            if (canonicalEquals(input, output)) {
              // A byte-preserving terminal is not enough: all declared stages
              // must be assessed, and a worksite chain must carry its C2 evidence.
              // Failed command observations remain honest completed observations.
              return matches(SEMANTIC_STAGE_IDS.lifecyclePredicateRef, input.current, output.current) &&
                (output.current.worksite === null || evidenceMatches(output, output.current.evidence?.executionObservation));
            }
            const next = (isSemanticJobRevisionEnvelope(input) ? input.current.declaration : input.current.lifecycle).stages[input.current.assets.length];
            if (next !== undefined && output.current.assets.length === input.current.assets.length + 1 &&
              output.current.assets.at(-1)?.stageRef === next.declarationRef) {
              return matches(revisionIds.authorPredicateRef, input, output) || matches(revisionIds.assessorPredicateRef, input, output);
            }
            const previous = input.current.assets.at(-1), assessed = output.current.assets.at(-1);
            return previous?.assessment === null && assessed?.assetRef === previous.assetRef &&
              output.current.assets.length === input.current.assets.length && matches(revisionIds.assessorPredicateRef, input, output);
          } catch { return false; }
        } };
    }
    if ([revisionIds.selectionPredicateRef, revisionIds.projectionPredicateRef, revisionIds.authorPredicateRef, revisionIds.assessorPredicateRef, revisionIds.bridgePredicateRef,
      revisionIds.evidenceInputPredicateRef, revisionIds.terminalPredicateRef].some(r => r === predicateRef)) {
      return { predicateRef, advanceReasonRef: "reason://abiogenesis/semantic-revision/relation-satisfied@5", rejectionReasonRef: "reason://abiogenesis/semantic-revision/relation-refused@5",
        evaluate(input: unknown, output: unknown) {
          try {
            if (predicateRef === revisionIds.selectionPredicateRef) return isSemanticRevisionSelectionInput(input) && isSemanticRevisionSelection(output) && canonicalEquals(input.parent, output.parent) && canonicalEquals(input.causes, output.causes);
            if (predicateRef === revisionIds.projectionPredicateRef) return isSemanticRevisionRequest(input) && (isSemanticRevisionEnvelope(output) || isSemanticJobRevisionEnvelope(output)) && canonicalEquals(input, output.revisionBasis.request);
            if (predicateRef === revisionIds.bridgePredicateRef) return (isSemanticRevisionEnvelope(input) || isSemanticJobRevisionEnvelope(input)) && isWorksitePreparationInput(output) && output.kind === "worksite_revision_command_preparation_input";
            if (predicateRef === revisionIds.evidenceInputPredicateRef) return isWorksiteRevisionCommandExecutionObservation(input) && (isSemanticRevisionEnvelope(output) || isSemanticJobRevisionEnvelope(output)) && output.current.evidence?.executionObservation !== undefined && canonicalEquals(input, output.current.evidence?.executionObservation);
            if (isSemanticJobRevisionEnvelope(input) || isSemanticJobRevisionEnvelope(output)) {
              if (!isSemanticJobRevisionEnvelope(input) || !isSemanticJobRevisionEnvelope(output)) return false;
              if (predicateRef === revisionIds.terminalPredicateRef) return canonicalEquals(input, output);
              const asset = output.current.assets.at(-1);
              if (asset === undefined) return false;
              if (predicateRef === revisionIds.authorPredicateRef) return canonicalEquals(deriveJobRevisionAsset(input, asset.stageRef, asset.candidate, asset.source), output);
              if (asset.assessment?.disposition !== "satisfied") return false;
              const prior = input.current.assets.at(-1)?.assetRef === asset.assetRef ? input : deriveJobRevisionAsset(input, asset.stageRef, asset.candidate, asset.source);
              return prior !== null && canonicalEquals(deriveJobRevisionAssessment(prior, asset.stageRef, asset.assessment.candidate, asset.assessment.source), output);
            }
            if (!isSemanticRevisionEnvelope(input) || !isSemanticRevisionEnvelope(output)) return false;
            if (predicateRef === revisionIds.terminalPredicateRef) return canonicalEquals(input, output);
            const asset = output.current.assets.at(-1);
            if (asset === undefined) return false;
            if (predicateRef === revisionIds.authorPredicateRef) return canonicalEquals(deriveRevisionAsset(input, asset.stageRef, asset.candidate, asset.source), output);
            if (asset.assessment?.disposition !== "satisfied") return false;
            const prior = input.current.assets.at(-1)?.assetRef === asset.assetRef ? input : deriveRevisionAsset(input, asset.stageRef, asset.candidate, asset.source);
            return prior !== null && canonicalEquals(deriveRevisionAssessment(prior, asset.stageRef, asset.assessment.candidate, asset.assessment.source), output);
          } catch { return false; }
        } };
    }
    const ids = SEMANTIC_STAGE_IDS;
    if ([ids.nativeAuthorTaskPredicateRef, ids.nativeAuthorFoldPredicateRef, ids.nativeAssessorTaskPredicateRef,
      ids.nativeAssessorFoldPredicateRef, ids.nativeConstructionTaskPredicateRef, ids.nativeExecutionTaskPredicateRef,
      ids.nativeEvidencePredicateRef, ids.nativeStagePredicateRef, ids.nativeStepPredicateRef].some(ref => ref === predicateRef)) {
      return { predicateRef, advanceReasonRef: "reason://abiogenesis/semantic-stage/native-source-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/semantic-stage/native-source-refused@5",
        evaluate: (input: unknown, output: unknown) => evaluateNativeSemanticRelation(predicateRef, input, output) === true };
    }
    if (![ids.authorPredicateRef, ids.assessorPredicateRef, ids.lifecyclePredicateRef, ids.lifecycleStepPredicateRef, ids.bridgePredicateRef, ids.evidenceInputPredicateRef, ids.terminalPredicateRef,
      ids.jobIntakePredicateRef, ids.jobContextPredicateRef, ids.jobPlanPredicateRef, ids.jobBridgePredicateRef].some(ref => ref === predicateRef)) {
      return ABI5_REQUIREMENT_HANDOFF_PRODUCT_SEMANTICS.resolveJudgmentRelation(predicateRef) ?? ABI5_PRODUCT_SEMANTICS.resolveJudgmentRelation(predicateRef);
    }
    return { predicateRef, advanceReasonRef: "reason://abiogenesis/semantic-stage/relation-satisfied@5",
      rejectionReasonRef: "reason://abiogenesis/semantic-stage/relation-refused@5",
      evaluate(input: unknown, output: unknown) {
        try {
          const job = evaluateSemanticJobRelation(predicateRef, input, output);
          if (job !== null) return job;
          if (predicateRef === ids.lifecycleStepPredicateRef) {
            const matches = (ref: string, before: unknown, after: unknown) =>
              ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS.resolveJudgmentRelation(ref)?.evaluate(before, after) === true;
            if (isSemanticStageEnvelope(input) && isSemanticStageEnvelope(output)) {
              // The terminal wire projection is byte preserving. Its executed
              // foldback still requires the one full lifecycle completion law.
              if (canonicalEquals(input, output)) return matches(ids.lifecyclePredicateRef, input, output);
              const next = input.lifecycle.stages[input.assets.length];
              return next !== undefined && output.assets.length === input.assets.length + 1 &&
                output.assets.at(-1)?.stageRef === next.declarationRef &&
                matches(ids.assessorPredicateRef, input, output);
            }
            if (isSemanticStageEnvelope(input)) return matches(ids.bridgePredicateRef, input, output);
            if (isWorksiteCommandExecutionObservation(input)) return matches(ids.evidenceInputPredicateRef, input, output);
            if (isWorksitePreparationInput(input) && input.kind === "worksite_command_preparation_input" &&
              isWorksiteCommandExecutionObservation(output)) {
              const task = rederiveWorksiteCommandTask({ kind: "worksite_command_preparation_bound_input", schemaVersion: "5.0.0",
                entry: input, source: output.task.sourceConstructionResult }, output.task);
              return canonicalEquals(task, output.task) &&
                resolveWorksiteCommandExecutionJudgmentRelation(WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef)?.evaluate(task, output) === true;
            }
            return false;
          }
          if (predicateRef === ids.bridgePredicateRef) return isSemanticStageEnvelope(input) &&
            isWorksitePreparationInput(output) && output.kind === "worksite_command_preparation_input" &&
            canonicalEquals(deriveSemanticWorksitePreparation(input, output.constructionTask), output);
          if (!isSemanticStageEnvelope(output)) return false;
          if (predicateRef === ids.evidenceInputPredicateRef) return isWorksiteCommandExecutionObservation(input) && output.evidence !== null && canonicalEquals(output.evidence.executionObservation, input);
          if (!isSemanticStageEnvelope(input)) return false;
          if (predicateRef === ids.terminalPredicateRef) return canonicalEquals(input, output);
          const asset = output.assets.at(-1);
          if (asset === undefined) return false;
          if (predicateRef === ids.authorPredicateRef) return canonicalEquals(deriveSemanticAsset(input, asset.stageRef, asset.candidate, asset.source), output);
          if (predicateRef === ids.assessorPredicateRef) {
            if (asset.assessment?.disposition !== "satisfied") return false;
            const assessmentInput = input.assets.at(-1)?.assetRef === asset.assetRef ? input
              : deriveSemanticAsset(input, asset.stageRef, asset.candidate, asset.source);
            return assessmentInput !== null && canonicalEquals(
              deriveSemanticAssessment(assessmentInput, asset.stageRef,
                asset.assessment.candidate, asset.assessment.source),
              output,
            );
          }
          return canonicalEquals(input.sourceHandoff, output.sourceHandoff) && canonicalEquals(input.lifecycle, output.lifecycle) &&
            canonicalEquals(input.taskData, output.taskData) && canonicalEquals(input.evaluationData, output.evaluationData) && canonicalEquals(input.worksite, output.worksite) &&
            (!output.lifecycle.stages.some(stage => stage.bodyCapabilities.includes("application_assessment")) || output.evidence !== null) &&
            output.assets.length === output.lifecycle.stages.length &&
            output.lifecycle.stages.every((stage, i) => output.assets[i]?.stageRef === stage.declarationRef && output.assets[i]?.assessment?.disposition === "satisfied");
        } catch { return false; }
      } };
  },
  validateInvocationBasis(basis: Parameters<NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>>[0]) {
    if (isSemanticJobInput(basis.input)) return basis.sourceResultBasis === null;
    if (isSemanticJobEnvelope(basis.input)) return false; // only admitted native children carry job envelopes
    if (!isSemanticStageEnvelope(basis.input)) return ABI5_PRODUCT_SEMANTICS.validateInvocationBasis(basis);
    const worksite = basis.input.worksite;
    return basis.sourceResultBasis === null && (worksite === null || (worksite.workspaceBinding.bindingId === basis.workspaceBindingId &&
      worksite.workspaceBinding.bindingDigest === basis.workspaceBindingDigest && worksite.workspaceBinding.workspaceId === basis.workspaceId) ||
      // An exact historical Design may enter a new ordinary tail invocation.
      // The native leaf admission authenticates its whole prior value before
      // dispatch and derives current bounds; this raw shape grants no effects.
      (worksite.workspaceBinding.workspaceId === basis.workspaceId && basis.input.assets.length > 0 &&
        basis.input.assets.every(asset => asset.assessment?.disposition === "satisfied") &&
        basis.input.assets.at(-1)?.candidate.worksiteDesign !== null));
  },
});

/** Distinct D2 contract interpretation; existing D1 owner remains singular. */
export const ABI5_SEMANTIC_REVISION_PRODUCT_SEMANTICS: ProductSemanticsProvider = Object.freeze({ ...ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS, bindingRef: revisionIds.semanticsBindingRef });

export const ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS: ProductSemanticsProvider = Object.freeze({
  ...ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS,
  bindingRef: governanceRef("semantics", "default"),
  validateInvocationBasis(basis: Parameters<NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>>[0]) {
    if (!isGovernanceWorkState(basis.input))
      return ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS.validateInvocationBasis?.(basis) ?? basis.sourceResultBasis === null;
    const source = basis.sourceResultBasis;
    const currentUse = typeof basis.currentSourceUse === "function" ? basis.currentSourceUse() : null;
    return source === null ? governanceSame(basis.input, constructGovernanceWorkState(basis.input.original)) :
      source.sourceResultContractRef === governanceContract("state") && source.sourceWorkspaceId === basis.workspaceId &&
      (source.workspaceBindingId === basis.workspaceBindingId && source.workspaceBindingDigest === basis.workspaceBindingDigest ||
        currentUse !== null && currentUse.sourceBasisRef === source.basisRef &&
        currentUse.sourceBasisDigest === source.basisDigest && currentUse.currentWorkspaceBindingId === basis.workspaceBindingId &&
        currentUse.currentWorkspaceBindingDigest === basis.workspaceBindingDigest) &&
      governanceSame(basis.input, retainedGovernanceWorkInput(source.sourceResultValue));
  },
  admitInput(contractRef: string, value: unknown) {
    if (contractRef === governanceContract("state") && isGovernanceWorkState(value) ||
      contractRef === governanceContract("selection-task") && isFramedSynthesisTask(value) ||
      contractRef === governanceContract("synthesis") && isFramedSynthesisResult(value) ||
      contractRef === "contract://abiogenesis/worksite/retained-graph-input@5" && isRetainedGraphInput(value))
      return value as unknown as Readonly<Record<string, JsonValue>>;
    return ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS.admitInput(contractRef, value);
  },
  validateContractValue(kind: string, value: unknown): value is Readonly<Record<string, JsonValue>> {
    if (kind === "governance_work_state") return isGovernanceWorkState(value);
    if (kind === "framed_synthesis_task") return isFramedSynthesisTask(value);
    if (kind === "framed_synthesis_result") return isFramedSynthesisResult(value);
    if (kind === "framed_synthesis_response") return isFramedSynthesisJudgment(value);
    if (kind === "registered_graph_choice") return isRegisteredGraphChoice(value);
    if (kind === "retained_graph_input") return isRetainedGraphInput(value);
    if (kind === "governance_failure" || kind === "governance_refusal") return typeof value === "object" && value !== null && "kind" in value && value.kind === kind;
    return ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS.validateContractValue(kind, value);
  },
  resolveProbabilisticWorkerContracts(basis: Readonly<{ inputContractRef: string; outputContractRef: string; input: Readonly<Record<string, JsonValue>> }>) {
    if (basis.inputContractRef === governanceContract("selection-task") && isFramedSynthesisTask(basis.input))
      return { instructionContractRef: basis.inputContractRef, resultContractRef: governanceContract("native-response") };
    return ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS.resolveProbabilisticWorkerContracts?.(basis) ?? null;
  },
  resolveJudgmentRelation(predicateRef: string) {
    const operation = GOVERNANCE_OPERATIONS.find(n => governanceRef("predicate", n) === predicateRef);
    if (operation === undefined) return ABI5_WORKSITE_COMMAND_EXECUTION_PRODUCT_SEMANTICS.resolveJudgmentRelation(predicateRef);
    return { predicateRef, advanceReasonRef: governanceRef("reason", "conserved"), rejectionReasonRef: governanceRef("reason", "gap"),
      evaluate(input: unknown, output: unknown) {
        if (operation === "select") return isFramedSynthesisTask(input) && isFramedSynthesisResult(output) && governanceSame(input.state, output.state);
        if (operation === "project-choice") return isFramedSynthesisResult(input) && isRegisteredGraphChoice(output) && output.disposition === "selected";
        if (operation === "prepare-selection") return isGovernanceWorkState(input) && isFramedSynthesisTask(output) && governanceSame(output.state, input);
        if (operation === "prepare-native") return isGovernanceWorkState(input) && isNativeWorkspaceWorkTask(output);
        if (operation === "prepare-testing") return isGovernanceWorkState(input) && isC2WorksiteCommandExecutionTask(output);
        const state = isRetainedGraphInput(input) ? input.entry : input;
        return isGovernanceWorkState(state) && isGovernanceWorkState(output) && governanceSame(state.original, output.original);
      } };
  },
});
