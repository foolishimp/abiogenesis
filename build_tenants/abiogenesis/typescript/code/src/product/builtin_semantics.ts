import {
  FAN_OUT_HELLO_IDS,
  FP_HELLO_IDS,
  HELLO_WORLD_IDS,
  RECURSION_HELLO_IDS,
  constructBoundedRecursionState,
  constructFpHelloInstruction,
  constructHelloWorldInput,
  isBoundedRecursionState,
  isFanOutHelloVectorInput,
  isFpHelloInstruction,
  isHelloWorldInput,
  resolveConformanceJudgmentRelation,
} from "../gtl/index.js";
import { isDeclaredConformanceValue } from "../gtl/hello_world.js";
import {
  CONSENSUS_IDS,
  bindConsensusReplay,
  isConsensusActionEvaluationBasis,
  isConsensusActionEvaluationProjection,
  isConsensusEscalationDecision,
  isConsensusEscalationRequest,
  isConsensusFinalizationState,
  isConsensusFindingsVector,
  isConsensusInvocation,
  isConsensusNextActionBasis,
  isConsensusNextActionProjection,
  isConsensusObservationSnapshot,
  isConsensusPanel,
  isConsensusResultCandidate,
  isConsensusReviewerProfile,
  isConsensusReviewerTask,
  isConsensusRoundOutcome,
  isConsensusRoundPolicy,
  isConsensusRoundState,
  isConsensusResult,
  isConsensusSubject,
  isConsensusSubmitterProfile,
  isConsensusSubmitterResponse,
  isConsensusSubmitterTask,
  isTicketConsensusProjection,
  isReviewFindings,
  resolveConsensusJudgmentRelation,
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
    return isDeclaredConformanceValue(value, valueKind);
  },
  resolveJudgmentRelation: resolveConformanceJudgmentRelation,
}) satisfies ProductSemanticsProvider;

function isRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
    contractRef === CONSENSUS_IDS.finalizationStateContractRef &&
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
  switch (valueKind) {
    case "consensus_subject":
      return isConsensusSubject(value);
    case "consensus_panel":
      return isConsensusPanel(value);
    case "consensus_reviewer_profile":
      return isConsensusReviewerProfile(value);
    case "consensus_submitter_profile":
      return isConsensusSubmitterProfile(value);
    case "review_findings":
      return isReviewFindings(value);
    case "consensus_round_policy":
      return isConsensusRoundPolicy(value);
    case "consensus_round_outcome":
      return isConsensusRoundOutcome(value);
    case "consensus_result":
      return isConsensusResultCandidate(value) || isConsensusResult(value);
    case "consensus_invocation":
      return isConsensusInvocation(value);
    case "observation_snapshot":
      return isConsensusObservationSnapshot(value);
    case "next_action_basis":
      return isConsensusNextActionBasis(value);
    case "next_action_projection":
      return isConsensusNextActionProjection(value);
    case "action_evaluation_basis":
      return isConsensusActionEvaluationBasis(value);
    case "action_evaluation_projection":
      return isConsensusActionEvaluationProjection(value);
    case "consensus_round_state":
      return isConsensusRoundState(value);
    case "consensus_finalization_state":
      return isConsensusFinalizationState(value);
    case "consensus_reviewer_task":
      return isConsensusReviewerTask(value);
    case "consensus_findings_vector":
      return isConsensusFindingsVector(value);
    case "consensus_submitter_task":
      return isConsensusSubmitterTask(value);
    case "consensus_submitter_response":
      return isConsensusSubmitterResponse(value);
    case "consensus_escalation_decision":
      return isConsensusEscalationDecision(value);
    case "ticket_consensus_projection":
      return isTicketConsensusProjection(value);
    case "consensus_failure":
      return isRecord(value) && value.kind === "consensus_failure";
    case "consensus_refusal":
      return isRecord(value) && value.kind === "consensus_refusal";
    default:
      return false;
  }
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
  admitInput: admitSystemInput,
  evaluateInteractionResponse(
    basis: Parameters<
      ProductSemanticsProvider["evaluateInteractionResponse"]
    >[0],
    responseCandidate: unknown,
  ) {
    if (
      basis.requestContractRef ===
        CONSENSUS_IDS.finalizationStateContractRef &&
      basis.responseContractRef ===
        CONSENSUS_IDS.escalationDecisionContractRef
    ) {
      if (
        !isConsensusEscalationRequest(basis.requestValue) ||
        !isConsensusEscalationDecision(responseCandidate) ||
        responseCandidate.humanActorRef !== basis.actingActorRef ||
        responseCandidate.finalizationRef !==
          basis.requestValue.finalizationRef ||
        responseCandidate.finalizationDigest !==
          basis.requestValue.finalizationDigest ||
        sha256Canonical(
          responseCandidate.finalizationState as unknown as JsonValue,
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
  validateInvocationBasis(basis: Readonly<{
    input: Readonly<Record<string, JsonValue>>;
    workspaceBindingId: string;
    workspaceBindingDigest: ReturnType<typeof sha256Canonical>;
    workspaceId: string;
    actionCatalog: JsonValue | null;
    sourceResultBasis:
      Parameters<
        NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>
      >[0]["sourceResultBasis"];
  }>) {
    if (isConsensusInvocation(basis.input)) {
      return basis.sourceResultBasis === null &&
        basis.input.subject.workspaceRef === basis.workspaceId;
    }
    if (isConsensusObservationSnapshot(basis.input)) {
      return basis.sourceResultBasis === null &&
        basis.input.workspaceBinding.workspaceBindingId ===
          basis.workspaceBindingId &&
        basis.input.workspaceBinding.workspaceBindingDigest ===
          basis.workspaceBindingDigest &&
        basis.input.consensusInvocation.subject.workspaceRef ===
          basis.workspaceId &&
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
    replayRef: string;
  }>) {
    if (!isConsensusResultCandidate(basis.value)) return basis.value;
    return bindConsensusReplay(basis.value, basis.replayRef) as unknown as JsonValue;
  },
}) satisfies ProductSemanticsProvider;
