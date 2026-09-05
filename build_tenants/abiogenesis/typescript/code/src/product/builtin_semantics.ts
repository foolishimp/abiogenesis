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
  isWorksiteCommandExecutionTask,
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
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ProductSemanticsProvider } from "./semantics.js";

function admitInput(
  contractRef: string,
  value: unknown,
): Readonly<Record<string, JsonValue>> | null {
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
    isWorksiteCommandExecutionTask(value)
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
    return isDeclaredConformanceValue(value, valueKind) ||
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
      (valueKind === "worksite_command_execution_task" &&
        isWorksiteCommandExecutionTask(value)) ||
      (valueKind === "worksite_command_execution_worker_result" &&
        isWorksiteCommandExecutionWorkerResult(value)) ||
      (valueKind === "worksite_command_execution_observation" &&
        isWorksiteCommandExecutionObservation(value)) ||
      (valueKind === "worksite_command_execution_failure" &&
        isWorksiteCommandExecutionFailure(value));
  },
  resolveJudgmentRelation: (predicateRef: string) =>
    resolveConformanceJudgmentRelation(predicateRef) ??
      resolveWorksiteC0JudgmentRelation(predicateRef) ??
      resolveWorksiteConstructionJudgmentRelation(predicateRef) ??
      resolveWorksiteBranchConstructionJudgmentRelation(predicateRef) ??
      resolveWorksiteCommandExecutionJudgmentRelation(predicateRef),
  resolveProbabilisticWorkerContracts(basis: Readonly<{
    inputContractRef: string;
    outputContractRef: string;
    input: Readonly<Record<string, JsonValue>>;
  }>) {
    if (
      basis.inputContractRef === WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef &&
      basis.outputContractRef === WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef &&
      isWorksiteCommandExecutionTask(basis.input)
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
    if (isWorksiteCommandExecutionTask(basis.input)) {
      const source = basis.sourceResultBasis;
      return source !== null &&
        basis.input.workspaceBinding.bindingId === basis.workspaceBindingId &&
        basis.input.workspaceBinding.bindingDigest === basis.workspaceBindingDigest &&
        basis.input.workspaceBinding.workspaceId === basis.workspaceId &&
        (
          source.sourceGraphFunctionRef ===
            WORKSITE_CONSTRUCTION_IDS.reducerGraphFunctionRef ||
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

function isRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
