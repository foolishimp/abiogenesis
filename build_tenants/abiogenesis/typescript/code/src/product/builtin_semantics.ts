import type { NativeJudgmentProofOperations } from "../implementation/contracts.js";
import { NATIVE_WORK_REACQUISITION_IDS as reacquireIds, isNativeWorksiteCommandReacquisitionRequest } from "./worksite_command_execution.js";
import { nativeWorkReacquisitionResultMatches } from "../abg/native_work_reacquisition.js";
import { isJsonRecordShape as isRecord } from "../shared/admission_predicates.js";
import { NATIVE_WORKSPACE_WORK_IDS as nativeIds, isNativeWorkspaceWorkTask, nativeWorkspaceWorkResultContractRef, isNativeWorkspaceWorkReport,
  isNativeWorkspaceWorkObservation, isNativeWorkspaceWorkFailure, resolveNativeWorkspaceWorkJudgmentRelation } from "./native_workspace_work.js";
import { WORKSITE_PRESERVED_RESULT_IDS, isWorksitePreservedResultArtifact, resolveWorksitePreservedResultJudgmentRelation } from "./worksite_construction_recovery.js";
import { WORKSITE_REVISION_IDS, isWorksiteRevisionCommandExecutionTask } from "./worksite_revision.js";
import { WORKSITE_COMMAND_FORWARD_IDS as forwardIds } from "./worksite_command_forward_identity.js";
import { isWorksiteCommandForwardRequest,
  isWorksiteCommandForwardTask, isWorksiteCommandForwardWorkerResult } from "./worksite_command_forward.js";
import { isWorksiteCommandForwardObservation } from "./worksite_command_execution.js";
import { isWorksiteRevisionCommandExecutionObservation, isWorksiteRevisionCommandExecutionWorkerResult } from "./worksite_command_execution.js";
import { SEMANTIC_REVISION_IDS as revisionIds } from "../gtl/semantic_revision_identity.js";
import { isSemanticRevisionRequest, isSemanticRevisionEnvelope, isSemanticRevisionSelection, isSemanticRevisionSelectionInput, deriveRevisionAsset, deriveRevisionAssessment,
  isSemanticJobRevisionEnvelope, deriveJobRevisionAsset, deriveJobRevisionAssessment } from "./semantic_revision.js";
import { SEMANTIC_STAGE_IDS } from "../gtl/semantic_stage_identity.js";
import { isSemanticJobInput, isSemanticJobEnvelope, isSemanticJobAssetCandidate, isSemanticJobDesignResponse, deriveSemanticJobAsset, deriveSemanticJobAssessment, evaluateSemanticJobRelation } from "./semantic_job.js";
import { isWorksiteFileParentsRequest, isWorksiteFileParentsSuccess, isWorksiteFileParentsFailure } from "./worksite_effect.js";
import { isSemanticStageEnvelope, isSemanticAssetCandidate, isSemanticAssessmentCandidate, deriveSemanticAsset, deriveSemanticAssessment, deriveSemanticWorksitePreparation } from "./semantic_stage.js";
import { REQUIREMENT_HANDOFF_IDS } from "../gtl/requirement_handoff.js";
import { isRequirementHandoffInput, isRequirementHandoffOutput } from "./requirement_handoff.js";
import {
  admitWorksitePreparationInput, isWorksitePreparationInput, preparationConstructionTasks, prepareWorksiteCommandTask,
  validateWorksitePreparationContractValue, resolveWorksitePreparationJudgmentRelation,
} from "./worksite_preparation.js";
import {
  FAN_OUT_HELLO_IDS,
  FP_HELLO_IDS,
  HELLO_WORLD_IDS,
  RECURSION_HELLO_IDS,
  WORKSITE_C0_IDS,
  constructBoundedRecursionState,
  constructFpHelloInstruction,
  constructHelloWorldInput,
  isBoundedRecursionState,
  isFanOutHelloVectorInput,
  isFpHelloInstruction,
  isHelloWorldInput,
  resolveConformanceJudgmentRelation,
  isWorksiteFileReplaceOutput,
  resolveWorksiteC0JudgmentRelation,
} from "../gtl/index.js";
import {
  WORKSITE_COMMAND_EXECUTION_IDS,
  isWorksiteCommandExecutionFailure,
  isWorksiteCommandExecutionObservation,
  isWorksiteCommandExecutionTask, isC2WorksiteCommandExecutionTask, isNativeWorksiteCommandExecutionTask, isNativeWorksiteCommandExecutionObservation, isObservedWorksiteCommandExecutionTask, isObservedWorksiteCommandExecutionObservation,
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
import { isDeclaredConformanceValue } from "../gtl/hello_world.js";
import {
  CONSENSUS_IDS,
  bindConsensusReplay,
  consensusCatalogApplicationBindings,
  isConsensusEscalationDecision,
  isConsensusEscalationRequest,
  isConsensusInvocation,
  isConsensusObservationSnapshot,
  isConsensusReviewerInstruction,
  isConsensusReviewerProfile,
  isConsensusResultCandidate,
  isConsensusRoundPolicy,
  isConsensusRulingOverlay,
  isConsensusSubject,
  isConsensusReviewerTask,
  isConsensusSubmitterInstruction,
  isConsensusSubmitterProfile,
  isConsensusSubmitterResponse,
  isConsensusSubmitterTask,
  isReviewFindings,
  projectTicketConsensus,
  resolveConsensusJudgmentRelation,
  validateConsensusContractValue,
} from "../gtl/consensus.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "./contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ProductSemanticsProvider } from "./semantics.js";

function admitInput(
  contractRef: string,
  value: unknown,
): Readonly<Record<string, JsonValue>> | null {
  if (contractRef === reacquireIds.requestContractRef && isNativeWorksiteCommandReacquisitionRequest(value))
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  if (contractRef === nativeIds.taskContractRef && isNativeWorkspaceWorkTask(value))
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  if ((contractRef === forwardIds.requestContractRef && isWorksiteCommandForwardRequest(value)) ||
      (contractRef === forwardIds.taskContractRef && isWorksiteCommandForwardTask(value)))
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  if (contractRef === WORKSITE_PRESERVED_RESULT_IDS.artifactContractRef && isWorksitePreservedResultArtifact(value)) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (contractRef === WORKSITE_REVISION_IDS.taskContractRef && isWorksiteRevisionCommandExecutionTask(value)) return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  const preparation = admitWorksitePreparationInput(contractRef, value);
  if (preparation !== null) return preparation;
  if (contractRef === HELLO_WORLD_IDS.inputContractRef && isHelloWorldInput(value)) {
    return constructHelloWorldInput(value.subject) as unknown as Readonly<
      Record<string, JsonValue>
    >;
  }
  if (contractRef === FP_HELLO_IDS.inputContractRef && isFpHelloInstruction(value)) {
    return constructFpHelloInstruction(
      value.subject,
      value.instruction,
      value.transportLane,
    ) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef &&
    isC2WorksiteCommandExecutionTask(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === RECURSION_HELLO_IDS.inputContractRef &&
    isBoundedRecursionState(value) &&
    value.trace.length === 0 &&
    value.terminal === (value.remaining === 0)
  ) {
    return constructBoundedRecursionState(
      value.remaining,
      value.blockedChildRemaining,
    ) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === FAN_OUT_HELLO_IDS.inputVectorRef &&
    isFanOutHelloVectorInput(value) &&
    value.members.filter((member) => member.value.block).length <= 1
  ) {
    return deepFreeze({
      kind: "fan_out_hello_vector_input",
      schemaVersion: "5.0.0",
      members: value.members.map((member) => ({
        ordinal: member.ordinal,
        memberRef: member.memberRef,
        value: {
          kind: "fan_out_hello_member_input",
          schemaVersion: "5.0.0",
          block: member.value.block,
          subject: member.value.subject,
        },
      })),
    }) as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === WORKSITE_C0_IDS.inputContractRef &&
    isWorksiteFileReplaceRequest(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef &&
    isWorksiteBranchConstructionTask(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === WORKSITE_BRANCH_CONSTRUCTION_IDS.vectorContractRef &&
    isWorksiteBranchConstructionVector(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef ===
        WORKSITE_BRANCH_CONSTRUCTION_IDS.outputVectorContractRef &&
    isWorksiteBranchConstructionOutputVector(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === WORKSITE_CONSTRUCTION_IDS.taskContractRef &&
    isWorksiteConstructionTask(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef &&
    isWorksiteCandidateBundle(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === WORKSITE_CONSTRUCTION_IDS.fileReplaceVectorContractRef &&
    isWorksiteFileReplaceVector(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef ===
        WORKSITE_CONSTRUCTION_IDS.fileReplaceOutputVectorContractRef &&
    isWorksiteFileReplaceOutputVector(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
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
  evaluateInteractionResponse(
    basis: Parameters<
      ProductSemanticsProvider["evaluateInteractionResponse"]
    >[0],
    responseCandidate: unknown,
  ) {
    return admitInput(basis.responseContractRef, responseCandidate);
  },
  validateContractValue(
    valueKind: string,
    value: unknown,
  ): value is Readonly<Record<string, JsonValue>> {
    return (valueKind === "native_workspace_work_task" && isNativeWorkspaceWorkTask(value)) ||
      (valueKind === "native_workspace_work_report" && isNativeWorkspaceWorkReport(value)) ||
      (valueKind === "native_workspace_work_observation" && isNativeWorkspaceWorkObservation(value)) ||
      (valueKind === "native_workspace_work_failure" && isNativeWorkspaceWorkFailure(value)) ||
      (valueKind === "native_worksite_command_reacquisition_request" && isNativeWorksiteCommandReacquisitionRequest(value)) ||
      (valueKind === "worksite_command_forward_request" && isWorksiteCommandForwardRequest(value)) ||
      (valueKind === "worksite_command_forward_task" && isWorksiteCommandForwardTask(value)) ||
      (valueKind === "worksite_command_forward_observation" && isWorksiteCommandForwardObservation(value)) ||
      (valueKind === "worksite_command_forward_worker_result" && isWorksiteCommandForwardWorkerResult(value)) ||
      (valueKind === "worksite_preserved_result_artifact" && isWorksitePreservedResultArtifact(value)) ||
      validateWorksitePreparationContractValue(valueKind, value) ||
      isDeclaredConformanceValue(value, valueKind) ||
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
      evaluate: (input: unknown, output: unknown, currentOwnerPrefix?: import("../abg/event_store.js").DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations) =>
        nativeProof?.nativeWorkReacquisition !== undefined ? nativeProof.nativeWorkReacquisition()
          : nativeWorkReacquisitionResultMatches(input, output, currentOwnerPrefix) }) : null) ??
    resolveNativeWorkspaceWorkJudgmentRelation(predicateRef) ?? resolveWorksiteCommandForwardJudgmentRelation(predicateRef) ??
      resolveConformanceJudgmentRelation(predicateRef) ??
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
    if (basis.inputContractRef === forwardIds.taskContractRef && basis.outputContractRef === forwardIds.observationContractRef &&
      isWorksiteCommandForwardTask(basis.input)) return Object.freeze({instructionContractRef:forwardIds.taskContractRef,
        resultContractRef:forwardIds.workerResultContractRef});
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
    if (isWorksiteCommandForwardRequest(basis.input)) return basis.sourceResultBasis === null &&
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
        source.sourceResultValueDigest === sha256Canonical(basis.input.sourceNativeWork as unknown as JsonValue) &&
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
          basis.input.sourceConstructionResult as unknown as JsonValue,
        ) &&
        sha256Canonical(source.sourceResultValue) === source.sourceResultValueDigest &&
        sha256Canonical(source.sourceResultValue) === sha256Canonical(
          basis.input.sourceConstructionResult as unknown as JsonValue,
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

export const ABI5_WORKSITE_COMMAND_FORWARD_PRODUCT_SEMANTICS = Object.freeze({
  ...ABI5_PRODUCT_SEMANTICS, bindingRef:forwardIds.semanticsBindingRef,
}) satisfies ProductSemanticsProvider;

export const ABI5_NATIVE_WORKSPACE_WORK_PRODUCT_SEMANTICS = Object.freeze({
  ...ABI5_PRODUCT_SEMANTICS, bindingRef: nativeIds.semanticsBindingRef,
  validateResultEvidenceLineage(basis: Parameters<NonNullable<ProductSemanticsProvider["validateResultEvidenceLineage"]>>[0]) {
    if (basis.outputContractRef !== nativeIds.observationContractRef) return true;
    if (!isNativeWorkspaceWorkObservation(basis.value) || basis.admittedEvidence.length !== 1) return false;
    const p = basis.value.provenance, e = basis.admittedEvidence[0]!;
    return e.evidenceClass === "probabilistic_transport" && e.cCallRef === p.cCallRef &&
      e.transportDigest === p.transportDigest && e.outputDigest === sha256Canonical(basis.value as unknown as JsonValue);
  },
}) satisfies ProductSemanticsProvider;

function resolveWorksiteCommandForwardJudgmentRelation(predicateRef:string) {
  if(!([forwardIds.stepPredicateRef,forwardIds.rootPredicateRef,forwardIds.judgmentPredicateRef] as readonly string[]).includes(predicateRef))return null;
  const same=(a:unknown,b:unknown)=>sha256Canonical(a as JsonValue)===sha256Canonical(b as JsonValue);
  return Object.freeze({predicateRef,advanceReasonRef:"reason://abiogenesis/worksite/command-forward/observed@5",
    rejectionReasonRef:"reason://abiogenesis/worksite/command-forward/unjoined@5",
    evaluate:(input:unknown,output:unknown):boolean=>{
      if(predicateRef===forwardIds.stepPredicateRef&&isWorksiteCommandForwardRequest(input)&&isWorksiteCommandForwardTask(output))
        return same(output.request,input);
      if(!isWorksiteCommandForwardObservation(output))return false;
      return predicateRef===forwardIds.rootPredicateRef
        ? isWorksiteCommandForwardRequest(input)&&same(output.task.request,input)
        : isWorksiteCommandForwardTask(input)&&same(output.task,input);
    }});
}

function hasExactConsensusCatalogApplications(
  basis: Parameters<
    NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>
  >[0],
  invocation: Parameters<typeof consensusCatalogApplicationBindings>[0],
): boolean {
  const expected = consensusCatalogApplicationBindings(invocation);
  const applications = basis.catalogApplications ?? [];
  if (applications.length !== expected.length) return false;
  return expected.every((binding) => {
    const expectedKind =
      binding.handle === CONSENSUS_IDS.rulingOverlayCatalogHandle
        ? "overlay"
        : "node_type";
    const expectedContractRef =
      binding.handle === CONSENSUS_IDS.subjectCatalogHandle
        ? CONSENSUS_IDS.subjectContractRef
        : binding.handle === CONSENSUS_IDS.reviewerProfileCatalogHandle
        ? CONSENSUS_IDS.profileContractRef
        : binding.handle === CONSENSUS_IDS.reviewerInstructionCatalogHandle
        ? CONSENSUS_IDS.reviewerInstructionContractRef
        : binding.handle === CONSENSUS_IDS.submitterProfileCatalogHandle
        ? CONSENSUS_IDS.submitterProfileContractRef
        : binding.handle === CONSENSUS_IDS.submitterInstructionCatalogHandle
        ? CONSENSUS_IDS.submitterInstructionContractRef
        : binding.handle === CONSENSUS_IDS.policyCatalogHandle
        ? CONSENSUS_IDS.policyContractRef
        : CONSENSUS_IDS.rulingOverlayContractRef;
    const expectedTargetDigest = binding.nodeTypeTarget === null
      ? null
      : sha256Canonical(binding.nodeTypeTarget as unknown as JsonValue);
    const matching = applications.filter(
      (application) =>
        application.kind === "declaration_application" &&
        application.declaration !== undefined &&
        application.declaration.handle === binding.handle &&
        application.appliedValueDigest === binding.valueDigest &&
        application.declaration.declarationKind === expectedKind &&
        application.declaration.declarationOrContractRef ===
          expectedContractRef &&
        (
          binding.nodeTypeTarget === null
            ? true
            : application.targetDigest === expectedTargetDigest &&
              application.targetRef ===
                `catalog-target://abiogenesis/${expectedTargetDigest.slice("sha256:".length)}`
        ),
    );
    return matching.length === 1;
  });
}

function admitSystemInput(
  contractRef: string,
  value: unknown,
): Readonly<Record<string, JsonValue>> | null {
  if (
    contractRef === CONSENSUS_IDS.invocationContractRef &&
    isConsensusInvocation(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === CONSENSUS_IDS.observationContractRef &&
    isConsensusObservationSnapshot(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === CONSENSUS_IDS.resolutionContractRef &&
    isConsensusEscalationRequest(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === CONSENSUS_IDS.escalationDecisionContractRef &&
    isConsensusEscalationDecision(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  return null;
}

function validateSystemContractValue(
  valueKind: string,
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return validateConsensusContractValue(valueKind, value) &&
    isRecord(value);
}

function resolveSystemCatalogApplicationValue(
  basis: Readonly<{
    contractRef: string;
    value: Readonly<Record<string, JsonValue>>;
  }>,
): Readonly<{
  valueRef: string;
  programMembershipRefs: readonly string[];
}> | null {
  const value = basis.value;
  if (
    basis.contractRef === CONSENSUS_IDS.subjectContractRef &&
    isConsensusSubject(value)
  ) {
    return { valueRef: value.subjectRef, programMembershipRefs: [] };
  }
  if (
    basis.contractRef === CONSENSUS_IDS.profileContractRef &&
    isConsensusReviewerProfile(value)
  ) {
    return { valueRef: value.profileRef, programMembershipRefs: [] };
  }
  if (
    basis.contractRef === CONSENSUS_IDS.reviewerInstructionContractRef &&
    isConsensusReviewerInstruction(value)
  ) {
    return {
      valueRef: value.instructionContractRef,
      programMembershipRefs: [],
    };
  }
  if (
    basis.contractRef === CONSENSUS_IDS.submitterProfileContractRef &&
    isConsensusSubmitterProfile(value)
  ) {
    return { valueRef: value.profileRef, programMembershipRefs: [] };
  }
  if (
    basis.contractRef === CONSENSUS_IDS.submitterInstructionContractRef &&
    isConsensusSubmitterInstruction(value)
  ) {
    return {
      valueRef: value.instructionContractRef,
      programMembershipRefs: [],
    };
  }
  if (
    basis.contractRef === CONSENSUS_IDS.policyContractRef &&
    isConsensusRoundPolicy(value)
  ) {
    return { valueRef: value.policyRef, programMembershipRefs: [] };
  }
  if (
    basis.contractRef === CONSENSUS_IDS.rulingOverlayContractRef &&
    isConsensusRulingOverlay(value)
  ) {
    return {
      valueRef: value.overlayRef,
      programMembershipRefs: [value.programRef],
    };
  }
  return null;
}

function validateSystemResultEvidenceLineage(
  basis: Parameters<
    NonNullable<ProductSemanticsProvider["validateResultEvidenceLineage"]>
  >[0],
): boolean {
  if (
    basis.outputContractRef !== CONSENSUS_IDS.findingsContractRef &&
    basis.outputContractRef !== CONSENSUS_IDS.submitterResponseContractRef
  ) {
    return true;
  }
  if (
    basis.admittedEvidence.length !== 1 ||
    basis.admittedEvidence[0]?.evidenceClass !==
      "probabilistic_transport" ||
    typeof basis.admittedEvidence[0]?.transportDigest !== "string"
  ) {
    return false;
  }
  const transportDigest = basis.admittedEvidence[0].transportDigest;
  const expectedEvidenceRef =
    `transport-evidence://abg/${
      transportDigest.slice("sha256:".length)
    }`;
  if (
    basis.outputContractRef === CONSENSUS_IDS.findingsContractRef &&
    isReviewFindings(basis.value)
  ) {
    return basis.admittedEvidence[0]?.cCallRef ===
        basis.value.cCallRef &&
      basis.admittedEvidence[0]?.cCallAttempt ===
        basis.value.cCallAttempt &&
      basis.value.evidenceRefs.length === 1 &&
      basis.value.evidenceRefs[0] === expectedEvidenceRef &&
      basis.value.findings.every((finding) =>
        finding.evidenceRefs.length === 1 &&
        finding.evidenceRefs[0] === expectedEvidenceRef
      );
  }
  return basis.outputContractRef ===
      CONSENSUS_IDS.submitterResponseContractRef &&
    isConsensusSubmitterResponse(basis.value) &&
    basis.value.evidenceRefs.length === 1 &&
    basis.value.evidenceRefs[0] === expectedEvidenceRef;
}

export const ABI5_SYSTEM_PRODUCT_SEMANTICS = Object.freeze({
  kind: "product_semantics_provider" as const,
  schemaVersion: "5.0.0" as const,
  bindingRef: CONSENSUS_IDS.productSemanticsBindingRef,
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  publicResultProjectionKinds: ["result", "ticket.consensus"] as const,
  admitInput: admitSystemInput,
  evaluateInteractionResponse(
    basis: Parameters<
      ProductSemanticsProvider["evaluateInteractionResponse"]
    >[0],
    responseCandidate: unknown,
  ) {
    if (
      basis.requestContractRef ===
        CONSENSUS_IDS.resolutionContractRef &&
      basis.responseContractRef ===
        CONSENSUS_IDS.escalationDecisionContractRef
    ) {
      if (
        !isConsensusEscalationRequest(basis.requestValue) ||
        !isConsensusEscalationDecision(responseCandidate) ||
        responseCandidate.humanActorRef !== basis.actingActorRef ||
        responseCandidate.roundDecision.decisionRef !==
          basis.requestValue.decisionRef ||
        responseCandidate.roundDecision.decisionDigest !==
          basis.requestValue.decisionDigest ||
        sha256Canonical(
          responseCandidate.roundDecision as unknown as JsonValue,
        ) !==
          sha256Canonical(basis.requestValue as unknown as JsonValue)
      ) {
        return null;
      }
      return deepFreeze(responseCandidate) as unknown as Readonly<
        Record<string, JsonValue>
      >;
    }
    return admitSystemInput(basis.responseContractRef, responseCandidate);
  },
  validateContractValue: validateSystemContractValue,
  resolveCatalogApplicationValue: resolveSystemCatalogApplicationValue,
  resolveJudgmentRelation: resolveConsensusJudgmentRelation,
  validateResultEvidenceLineage: validateSystemResultEvidenceLineage,
  resolveProbabilisticWorkerContracts(basis: Readonly<{
    inputContractRef: string;
    outputContractRef: string;
    input: Readonly<Record<string, JsonValue>>;
  }>) {
    if (
      basis.inputContractRef === CONSENSUS_IDS.reviewerTaskContractRef &&
      basis.outputContractRef === CONSENSUS_IDS.findingsContractRef &&
      isConsensusReviewerTask(basis.input)
    ) {
      return Object.freeze({
        instructionContractRef:
          basis.input.profile.instructionContractRef,
        resultContractRef: basis.input.profile.resultContractRef,
      });
    }
    if (
      basis.inputContractRef === CONSENSUS_IDS.submitterTaskContractRef &&
      basis.outputContractRef === CONSENSUS_IDS.submitterResponseContractRef &&
      isConsensusSubmitterTask(basis.input)
    ) {
      return Object.freeze({
        instructionContractRef:
          basis.input.profile.instructionContractRef,
        resultContractRef: basis.input.profile.resultContractRef,
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
    if (isConsensusInvocation(basis.input)) {
      return basis.sourceResultBasis === null &&
        basis.input.subject.workspaceRef === basis.workspaceId &&
        hasExactConsensusCatalogApplications(
          basis,
          basis.input,
        );
    }
    if (isConsensusObservationSnapshot(basis.input)) {
      return basis.sourceResultBasis === null &&
        basis.input.workspaceBinding.workspaceBindingId ===
          basis.workspaceBindingId &&
        basis.input.workspaceBinding.workspaceBindingDigest ===
          basis.workspaceBindingDigest &&
        basis.input.consensusInvocation.subject.workspaceRef ===
          basis.workspaceId &&
        hasExactConsensusCatalogApplications(
          basis,
          basis.input.consensusInvocation,
        ) &&
        basis.actionCatalog !== null &&
        sha256Canonical(
          basis.input.actionCatalog as unknown as JsonValue,
        ) === sha256Canonical(basis.actionCatalog);
    }
    return basis.sourceResultBasis === null;
  },
  projectPublicResult(basis: Readonly<{
    value: JsonValue;
    admittedResultRef: string;
    admittedResultContractRef: string;
    replayRef: string;
    projectionKind: string;
  }>) {
    if (
      basis.projectionKind !== "result" &&
      basis.projectionKind !== "ticket.consensus"
    ) {
      return null;
    }
    if (!isConsensusResultCandidate(basis.value)) {
      if (basis.projectionKind !== "result") return null;
      return {
        kind: "product_public_result_projection" as const,
        schemaVersion: "5.0.0" as const,
        contractRef: basis.admittedResultContractRef,
        value: basis.value,
      };
    }
    if (
      basis.admittedResultContractRef !==
        CONSENSUS_IDS.resultCandidateContractRef
    ) {
      return null;
    }
    const result = bindConsensusReplay(
      basis.value,
      basis.admittedResultRef,
      basis.replayRef,
    );
    return {
      kind: "product_public_result_projection" as const,
      schemaVersion: "5.0.0" as const,
      contractRef: basis.projectionKind === "ticket.consensus"
        ? CONSENSUS_IDS.ticketProjectionContractRef
        : CONSENSUS_IDS.resultContractRef,
      value: (
        basis.projectionKind === "ticket.consensus"
          ? projectTicketConsensus(result)
          : result
      ) as unknown as JsonValue,
    };
  },
}) satisfies ProductSemanticsProvider;

export const ABI5_REQUIREMENT_HANDOFF_PRODUCT_SEMANTICS: ProductSemanticsProvider = Object.freeze({
  kind: "product_semantics_provider", schemaVersion: "5.0.0", bindingRef: "product-semantics://abiogenesis/requirement-handoff@5",
  packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
  admitInput(contractRef: string, value: unknown) {
    return contractRef === REQUIREMENT_HANDOFF_IDS.inputContractRef && isRequirementHandoffInput(value)
      ? deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>> : null;
  },
  evaluateInteractionResponse() { return null; },
  validateContractValue(valueKind: string, value: unknown): value is Readonly<Record<string, JsonValue>> {
    return valueKind === "requirement_handoff_input" ? isRequirementHandoffInput(value)
      : valueKind === "requirement_handoff_output" && isRequirementHandoffOutput(value);
  },
  resolveJudgmentRelation(predicateRef: string) {
    return predicateRef === REQUIREMENT_HANDOFF_IDS.judgmentPredicateRef ? {
      predicateRef, advanceReasonRef: "reason://abiogenesis/requirement-handoff/transferred@5",
      rejectionReasonRef: "reason://abiogenesis/requirement-handoff/refused@5",
      evaluate(input: unknown, output: unknown) {
        return isRequirementHandoffInput(input) && isRequirementHandoffOutput(output) && sha256Canonical(input as unknown as JsonValue) === sha256Canonical(output.source as unknown as JsonValue);
      },
    } : null;
  },
});

export const ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS: ProductSemanticsProvider = Object.freeze({
  ...ABI5_PRODUCT_SEMANTICS,
  bindingRef: SEMANTIC_STAGE_IDS.semanticsBindingRef,
  admitInput(contractRef: string, value: unknown) {
    if ((contractRef === revisionIds.selectionInputContractRef && isSemanticRevisionSelectionInput(value)) || (contractRef === revisionIds.requestContractRef && isSemanticRevisionRequest(value)) ||
      (contractRef === revisionIds.envelopeContractRef && (isSemanticRevisionEnvelope(value) || isSemanticJobRevisionEnvelope(value)))) return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
    if (contractRef === SEMANTIC_STAGE_IDS.jobInputContractRef && isSemanticJobInput(value)) return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
    return contractRef === SEMANTIC_STAGE_IDS.envelopeContractRef && (isSemanticStageEnvelope(value) || isSemanticJobEnvelope(value))
      ? deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>
      : ABI5_REQUIREMENT_HANDOFF_PRODUCT_SEMANTICS.admitInput(contractRef, value) ?? ABI5_PRODUCT_SEMANTICS.admitInput(contractRef, value);
  },
  validateContractValue(valueKind: string, value: unknown): value is Readonly<Record<string, JsonValue>> {
    return (valueKind === "semantic_revision_selection_input" && isSemanticRevisionSelectionInput(value)) || (valueKind === "semantic_revision_request" && isSemanticRevisionRequest(value)) ||
      (valueKind === "semantic_revision_envelope" && (isSemanticRevisionEnvelope(value) || isSemanticJobRevisionEnvelope(value))) ||
      (valueKind === "semantic_revision_selection" && isSemanticRevisionSelection(value)) ||
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
    if (predicateRef === revisionIds.stepPredicateRef) {
      return { predicateRef, advanceReasonRef: "reason://abiogenesis/semantic-revision/step-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/semantic-revision/step-refused@5",
        evaluate(input: unknown, output: unknown) {
          try {
            const equal = (a: unknown, b: unknown) => sha256Canonical(a as JsonValue) === sha256Canonical(b as JsonValue);
            const matches = (ref: string, before: unknown, after: unknown) =>
              ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS.resolveJudgmentRelation(ref)?.evaluate(before, after) === true;
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
                equal(observation.task.workspaceAuthorityBasis, envelope.current.worksite.workspaceAuthorityBasis) &&
                equal(observation.task.workspaceBinding, envelope.current.worksite.workspaceBinding) &&
                equal(observation.task.capabilityGrant, envelope.current.worksite.capabilityGrant) &&
                equal(evidence.constructionResult, observation.task.sourceConstructionResult) &&
                resultCoordinate(evidence.constructionResultRef, evidence.constructionResultDigest) &&
                resultCoordinate(evidence.executionResultRef, evidence.executionResultDigest) &&
                matches(revisionIds.evidenceInputPredicateRef, observation, envelope);
            };
            if (isSemanticRevisionRequest(input)) return matches(revisionIds.projectionPredicateRef, input, output);
            if (isWorksiteRevisionCommandExecutionObservation(input)) return evidenceMatches(output, input);
            if (isWorksitePreparationInput(input) && input.kind === "worksite_revision_command_preparation_input" &&
              isWorksiteRevisionCommandExecutionObservation(output)) {
              const task = prepareWorksiteCommandTask({ kind: "worksite_revision_command_preparation_bound_input", schemaVersion: "5.0.0",
                entry: input, source: output.task.sourceConstructionResult });
              return equal(task, output.task) &&
                resolveWorksiteCommandExecutionJudgmentRelation(WORKSITE_REVISION_IDS.judgmentPredicateRef)?.evaluate(task, output) === true;
            }
            if (!isSemanticRevisionEnvelope(input) && !isSemanticJobRevisionEnvelope(input)) return false;
            if (isWorksitePreparationInput(output) && output.kind === "worksite_revision_command_preparation_input") {
              const worksite = input.current.worksite;
              return worksite !== null && input.current.evidence === null &&
                output.revisionBasisRef === input.revisionBasis.basisRef && output.revisionBasisDigest === input.revisionBasis.basisDigest &&
                equal(output.constructionTask.workspaceAuthorityBasis, worksite.workspaceAuthorityBasis) &&
                equal(output.constructionTask.workspaceBinding, worksite.workspaceBinding) &&
                equal(output.constructionTask.capabilityGrant, worksite.capabilityGrant) &&
                matches(revisionIds.bridgePredicateRef, input, output);
            }
            if ((!isSemanticRevisionEnvelope(output) && !isSemanticJobRevisionEnvelope(output)) || !equal(input.revisionBasis, output.revisionBasis)) return false;
            if (equal(input, output)) {
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
            const equal = (a: unknown, b: unknown) => sha256Canonical(a as JsonValue) === sha256Canonical(b as JsonValue);
            if (predicateRef === revisionIds.selectionPredicateRef) return isSemanticRevisionSelectionInput(input) && isSemanticRevisionSelection(output) && equal(input.parent, output.parent) && equal(input.causes, output.causes);
            if (predicateRef === revisionIds.projectionPredicateRef) return isSemanticRevisionRequest(input) && (isSemanticRevisionEnvelope(output) || isSemanticJobRevisionEnvelope(output)) && equal(input, output.revisionBasis.request);
            if (predicateRef === revisionIds.bridgePredicateRef) return (isSemanticRevisionEnvelope(input) || isSemanticJobRevisionEnvelope(input)) && isWorksitePreparationInput(output) && output.kind === "worksite_revision_command_preparation_input";
            if (predicateRef === revisionIds.evidenceInputPredicateRef) return isWorksiteRevisionCommandExecutionObservation(input) && (isSemanticRevisionEnvelope(output) || isSemanticJobRevisionEnvelope(output)) && equal(input, output.current.evidence?.executionObservation);
            if (isSemanticJobRevisionEnvelope(input) || isSemanticJobRevisionEnvelope(output)) {
              if (!isSemanticJobRevisionEnvelope(input) || !isSemanticJobRevisionEnvelope(output)) return false;
              if (predicateRef === revisionIds.terminalPredicateRef) return equal(input, output);
              const asset = output.current.assets.at(-1);
              if (asset === undefined) return false;
              if (predicateRef === revisionIds.authorPredicateRef) return equal(deriveJobRevisionAsset(input, asset.stageRef, asset.candidate, asset.source), output);
              if (asset.assessment?.disposition !== "satisfied") return false;
              const prior = input.current.assets.at(-1)?.assetRef === asset.assetRef ? input : deriveJobRevisionAsset(input, asset.stageRef, asset.candidate, asset.source);
              return prior !== null && equal(deriveJobRevisionAssessment(prior, asset.stageRef, asset.assessment.candidate, asset.assessment.source), output);
            }
            if (!isSemanticRevisionEnvelope(input) || !isSemanticRevisionEnvelope(output)) return false;
            if (predicateRef === revisionIds.terminalPredicateRef) return equal(input, output);
            const asset = output.current.assets.at(-1);
            if (asset === undefined) return false;
            if (predicateRef === revisionIds.authorPredicateRef) return equal(deriveRevisionAsset(input, asset.stageRef, asset.candidate, asset.source), output);
            if (asset.assessment?.disposition !== "satisfied") return false;
            const prior = input.current.assets.at(-1)?.assetRef === asset.assetRef ? input : deriveRevisionAsset(input, asset.stageRef, asset.candidate, asset.source);
            return prior !== null && equal(deriveRevisionAssessment(prior, asset.stageRef, asset.assessment.candidate, asset.assessment.source), output);
          } catch { return false; }
        } };
    }
    const ids = SEMANTIC_STAGE_IDS;
    if (![ids.authorPredicateRef, ids.assessorPredicateRef, ids.lifecyclePredicateRef, ids.lifecycleStepPredicateRef, ids.bridgePredicateRef, ids.evidenceInputPredicateRef, ids.terminalPredicateRef,
      ids.jobIntakePredicateRef, ids.jobContextPredicateRef, ids.jobPlanPredicateRef, ids.jobBridgePredicateRef].some(ref => ref === predicateRef)) {
      return ABI5_REQUIREMENT_HANDOFF_PRODUCT_SEMANTICS.resolveJudgmentRelation(predicateRef) ?? ABI5_PRODUCT_SEMANTICS.resolveJudgmentRelation(predicateRef);
    }
    return { predicateRef, advanceReasonRef: "reason://abiogenesis/semantic-stage/relation-satisfied@5",
      rejectionReasonRef: "reason://abiogenesis/semantic-stage/relation-refused@5",
      evaluate(input: unknown, output: unknown) {
        try {
          const equal = (a: unknown, b: unknown) => sha256Canonical(a as JsonValue) === sha256Canonical(b as JsonValue);
          const job = evaluateSemanticJobRelation(predicateRef, input, output);
          if (job !== null) return job;
          if (predicateRef === ids.lifecycleStepPredicateRef) {
            const matches = (ref: string, before: unknown, after: unknown) =>
              ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS.resolveJudgmentRelation(ref)?.evaluate(before, after) === true;
            if (isSemanticStageEnvelope(input) && isSemanticStageEnvelope(output)) {
              // The terminal wire projection is byte preserving. Its executed
              // foldback still requires the one full lifecycle completion law.
              if (equal(input, output)) return matches(ids.lifecyclePredicateRef, input, output);
              const next = input.lifecycle.stages[input.assets.length];
              return next !== undefined && output.assets.length === input.assets.length + 1 &&
                output.assets.at(-1)?.stageRef === next.declarationRef &&
                matches(ids.assessorPredicateRef, input, output);
            }
            if (isSemanticStageEnvelope(input)) return matches(ids.bridgePredicateRef, input, output);
            if (isWorksiteCommandExecutionObservation(input)) return matches(ids.evidenceInputPredicateRef, input, output);
            if (isWorksitePreparationInput(input) && input.kind === "worksite_command_preparation_input" &&
              isWorksiteCommandExecutionObservation(output)) {
              const task = prepareWorksiteCommandTask({ kind: "worksite_command_preparation_bound_input", schemaVersion: "5.0.0",
                entry: input, source: output.task.sourceConstructionResult });
              return equal(task, output.task) &&
                resolveWorksiteCommandExecutionJudgmentRelation(WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef)?.evaluate(task, output) === true;
            }
            return false;
          }
          if (predicateRef === ids.bridgePredicateRef) return isSemanticStageEnvelope(input) &&
            isWorksitePreparationInput(output) && output.kind === "worksite_command_preparation_input" &&
            equal(deriveSemanticWorksitePreparation(input, output.constructionTask), output);
          if (!isSemanticStageEnvelope(output)) return false;
          if (predicateRef === ids.evidenceInputPredicateRef) return isWorksiteCommandExecutionObservation(input) && output.evidence !== null && equal(output.evidence.executionObservation, input);
          if (!isSemanticStageEnvelope(input)) return false;
          if (predicateRef === ids.terminalPredicateRef) return equal(input, output);
          const asset = output.assets.at(-1);
          if (asset === undefined) return false;
          if (predicateRef === ids.authorPredicateRef) return equal(deriveSemanticAsset(input, asset.stageRef, asset.candidate, asset.source), output);
          if (predicateRef === ids.assessorPredicateRef) {
            if (asset.assessment?.disposition !== "satisfied") return false;
            const assessmentInput = input.assets.at(-1)?.assetRef === asset.assetRef ? input
              : deriveSemanticAsset(input, asset.stageRef, asset.candidate, asset.source);
            return assessmentInput !== null && equal(deriveSemanticAssessment(assessmentInput, asset.stageRef,
              asset.assessment.candidate, asset.assessment.source), output);
          }
          return equal(input.sourceHandoff, output.sourceHandoff) && equal(input.lifecycle, output.lifecycle) &&
            equal(input.taskData, output.taskData) && equal(input.evaluationData, output.evaluationData) && equal(input.worksite, output.worksite) &&
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
