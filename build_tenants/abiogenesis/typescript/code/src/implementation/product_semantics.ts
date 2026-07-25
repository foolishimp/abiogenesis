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
  isConsensusActionEvaluationBasis,
  isConsensusActionEvaluationProjection,
  isConsensusEscalationDecision,
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
  isConsensusSubject,
  isTicketConsensusProjection,
  isReviewFindings,
  resolveConsensusJudgmentRelation,
} from "../gtl/consensus.js";
import {
  EXECUTIVE_IDS,
  isExecutiveDeclarationDraft,
  isExecutiveObserverReport,
  isExecutiveReplaySnapshot,
  isExecutiveTuningInput,
  resolveExecutiveJudgmentRelation,
} from "../gtl/executive.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ProductSemanticsProvider } from "./contracts.js";

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
    contractRef === CONSENSUS_IDS.escalationRequestContractRef &&
    isConsensusResultCandidate(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === CONSENSUS_IDS.escalationDecisionContractRef &&
    isConsensusEscalationDecision(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === EXECUTIVE_IDS.replaySnapshotContractRef &&
    isExecutiveReplaySnapshot(value)
  ) {
    return deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === EXECUTIVE_IDS.tuningSignalContractRef &&
    isExecutiveTuningInput(value)
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
    case "review_findings":
      return isReviewFindings(value);
    case "consensus_round_policy":
      return isConsensusRoundPolicy(value);
    case "consensus_round_outcome":
      return isConsensusRoundOutcome(value);
    case "consensus_result":
      return isConsensusResultCandidate(value);
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
    case "consensus_reviewer_task":
      return isConsensusReviewerTask(value);
    case "consensus_findings_vector":
      return isConsensusFindingsVector(value);
    case "consensus_escalation_decision":
      return isConsensusEscalationDecision(value);
    case "ticket_consensus_projection":
      return isTicketConsensusProjection(value);
    case "executive_replay_snapshot":
      return isExecutiveReplaySnapshot(value);
    case "executive_observer_report":
      return isExecutiveObserverReport(value);
    case "executive_tuning_input":
      return isExecutiveTuningInput(value);
    case "executive_declaration_draft":
      return isExecutiveDeclarationDraft(value);
    case "consensus_failure":
      return isRecord(value) && value.kind === "consensus_failure";
    case "consensus_refusal":
      return isRecord(value) && value.kind === "consensus_refusal";
    case "executive_failure":
      return isRecord(value) && value.kind === "executive_failure";
    case "executive_refusal":
      return isRecord(value) && value.kind === "executive_refusal";
    default:
      return false;
  }
}

function resolveSystemJudgmentRelation(predicateRef: string) {
  return resolveConsensusJudgmentRelation(predicateRef) ??
    resolveExecutiveJudgmentRelation(predicateRef);
}

export const ABI5_SYSTEM_PRODUCT_SEMANTICS = Object.freeze({
  kind: "product_semantics_provider" as const,
  schemaVersion: "5.0.0" as const,
  bindingRef: CONSENSUS_IDS.productSemanticsBindingRef,
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  admitInput: admitSystemInput,
  validateContractValue: validateSystemContractValue,
  resolveJudgmentRelation: resolveSystemJudgmentRelation,
}) satisfies ProductSemanticsProvider;
