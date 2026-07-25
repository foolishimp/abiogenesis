import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  C,
  cCarrier,
  cGraphFunctionRef,
  workflow,
} from "./c_algebra.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
  RootModuleArtifactBasis,
} from "./contracts.js";
import {
  fanInApplication,
  fanOutApplication,
  recurseApplication,
} from "./graph_applications.js";
import { evaluatorDeclaration, ruleDeclaration } from "./declarations.js";

export const REVIEW_RULING_KIND_VALUES = Object.freeze([
  "decision_row",
  "draft_ticket",
  "split_ticket",
  "deferment",
  "rejected_finding",
] as const);

export const CONSENSUS_ROUND_OUTCOME_VALUES = Object.freeze([
  "closed_done",
  "recurse_next_round",
  "escalate_fh",
] as const);

export const CONSENSUS_CLASSIFICATION_VALUES = Object.freeze([
  "unanimous_agreement",
  "partial_agreement_with_dissent",
  "unresolved_disagreement",
  "contract_failure",
] as const);

export type ReviewRulingKind = (typeof REVIEW_RULING_KIND_VALUES)[number];
export type ConsensusRoundOutcomeValue =
  (typeof CONSENSUS_ROUND_OUTCOME_VALUES)[number];
export type ConsensusClassification =
  (typeof CONSENSUS_CLASSIFICATION_VALUES)[number];

export const CONSENSUS_IDS = Object.freeze({
  handle: "gtl://abg/consensus/submitter-reviewer-rounds",
  ownerRef: "owner://abg/substrate",
  moduleRef: "module://abg/consensus@5",
  programRef: "program://abg/system/consensus@5",
  startRef: "start://abg/consensus/submitter-reviewer-rounds@5",
  graphFunctionRef: "graph-function://abg/consensus/submitter-reviewer-rounds",
  graphRef: "graph://abg/consensus/submitter-reviewer-rounds@5",
  nodeRef: "locus://abg/consensus/root@5",
  roundLoopGraphFunctionRef: "graph-function://abg/consensus/round-loop@5",
  roundLoopGraphRef: "graph://abg/consensus/round-loop@5",
  roundLoopNodeRef: "locus://abg/consensus/round-loop@5",
  roundGraphFunctionRef: "graph-function://abg/consensus/round@5",
  roundGraphRef: "graph://abg/consensus/round@5",
  roundNodeRef: "locus://abg/consensus/round@5",
  reviewerGraphFunctionRef: "graph-function://abg/consensus/reviewer@5",
  reviewerGraphRef: "graph://abg/consensus/reviewer@5",
  reviewerNodeRef: "locus://abg/consensus/reviewer@5",
  reducerGraphFunctionRef: "graph-function://abg/consensus/reducer@5",
  reducerGraphRef: "graph://abg/consensus/reducer@5",
  reducerNodeRef: "locus://abg/consensus/reducer@5",
  projectorGraphFunctionRef: "graph-function://abg/consensus/project-result@5",
  projectorGraphRef: "graph://abg/consensus/project-result@5",
  projectorNodeRef: "locus://abg/consensus/project-result@5",
  escalationGraphFunctionRef: "graph-function://abg/consensus/fh-escalation@5",
  escalationGraphRef: "graph://abg/consensus/fh-escalation@5",
  escalationNodeRef: "locus://abg/consensus/fh-escalation@5",
  escalationFinalizerGraphFunctionRef:
    "graph-function://abg/consensus/fh-escalation-finalizer@5",
  escalationFinalizerGraphRef:
    "graph://abg/consensus/fh-escalation-finalizer@5",
  escalationFinalizerNodeRef:
    "locus://abg/consensus/fh-escalation-finalizer@5",
  escalationStartRef: "start://abg/consensus/fh-escalation@5",
  subjectContractRef: "contract://abg/schema/consensus-subject@5",
  panelContractRef: "contract://abg/schema/consensus-panel@5",
  profileContractRef: "contract://abg/schema/consensus-reviewer-profile@5",
  findingsContractRef: "contract://abg/schema/review-findings@5",
  rulingsContractRef: "contract://abg/schema/review-rulings@5",
  policyContractRef: "contract://abg/schema/consensus-round-policy@5",
  roundOutcomeContractRef: "contract://abg/schema/consensus-round-outcome@5",
  resultContractRef: "contract://abg/schema/consensus-result@5",
  ticketProjectionContractRef:
    "contract://abg/schema/ticket-consensus-projection@5",
  invocationContractRef: "contract://abg/consensus/invocation@5",
  stateContractRef: "contract://abg/consensus/round-state@5",
  reviewerTaskContractRef: "contract://abg/consensus/reviewer-task@5",
  findingsVectorContractRef: "contract://abg/consensus/findings-vector@5",
  escalationDecisionContractRef:
    "contract://abg/consensus/fh-escalation-decision@5",
  escalationRequestContractRef:
    "contract://abg/consensus/fh-escalation-request@5",
  failureContractRef: "contract://abg/consensus/failure@5",
  refusalContractRef: "contract://abg/consensus/refusal@5",
  evidenceContractRef: "contract://abg/consensus/evidence@5",
  judgmentContractRef: "contract://abg/consensus/judgment@5",
  transitionContractRef: "contract://abg/consensus/transition@5",
  rootClosureContractRef: "closure://abg/consensus/root@5",
  childClosureContractRef: "closure://abg/consensus/child@5",
  reviewerClosureContractRef: "closure://abg/consensus/reviewer@5",
  resultClosureContractRef: "closure://abg/consensus/result@5",
  escalationClosureContractRef: "closure://abg/consensus/fh-escalation@5",
  initializerPredicateRef: "predicate://abg/consensus/initialize@5",
  roundEvaluatorPredicateRef: "predicate://abg/consensus/round-terminal@5",
  rootWorkflowPredicateRef:
    "predicate://abg/consensus/root-workflow-foldback@5",
  roundWorkflowPredicateRef:
    "predicate://abg/consensus/round-workflow-foldback@5",
  roundEvaluatorRef: "evaluator://abg/consensus/round-terminal@5",
  roundTerminationRuleRef: "rule://abg/consensus/round-terminal@5",
  reviewerPredicateRef: "predicate://abg/consensus/reviewer-attribution@5",
  reducerPredicateRef: "predicate://abg/consensus/reduce-round@5",
  projectorPredicateRef: "predicate://abg/consensus/project-result@5",
  escalationFinalizerPredicateRef:
    "predicate://abg/consensus/finalize-fh-escalation@5",
  initializerImplementationBindingRef:
    "implementation-binding://abg/consensus/initialize@5",
  initializerImplementationRef: "implementation://abg/consensus/initialize@5",
  roundEvaluatorImplementationBindingRef:
    "implementation-binding://abg/consensus/round-evaluator@5",
  roundEvaluatorImplementationRef:
    "implementation://abg/consensus/round-evaluator@5",
  reviewerImplementationBindingRef:
    "implementation-binding://abg/consensus/reviewer@5",
  reviewerImplementationRef: "implementation://abg/consensus/reviewer@5",
  reducerImplementationBindingRef:
    "implementation-binding://abg/consensus/reducer@5",
  reducerImplementationRef: "implementation://abg/consensus/reducer@5",
  projectorImplementationBindingRef:
    "implementation-binding://abg/consensus/project-result@5",
  projectorImplementationRef:
    "implementation://abg/consensus/project-result@5",
  escalationFinalizerImplementationBindingRef:
    "implementation-binding://abg/consensus/finalize-fh-escalation@5",
  escalationFinalizerImplementationRef:
    "implementation://abg/consensus/finalize-fh-escalation@5",
  roundApplicationRef: "application://abg/consensus/round-loop@5",
  roundBatchRef: "batch://abg/consensus/reviewers@5",
  interactionKind: "consensus_resolution",
  actorCapabilityRef: "capability://abg/consensus/fh-resolution@5",
  continuationContractRef: "contract://abg/consensus/continuation@5",
  productSemanticsBindingRef: "product-semantics://abiogenesis/system@5",
  rulingVocabularyRef: "abg.vocabulary.review-ruling-kind",
  roundOutcomeVocabularyRef: "abg.vocabulary.consensus-round-outcome",
});

export interface ConsensusSubject {
  readonly kind: "consensus_subject";
  readonly schemaVersion: "5.0.0";
  readonly subjectContractRef: string;
  readonly subjectRef: string;
  readonly subjectDigest: Sha256Digest;
  readonly submittingActorRef: string;
  readonly panelRef: string;
  readonly roundPolicyRef: string;
  readonly workspaceRef: string;
  readonly ticketRef: string | null;
  readonly ticketDigest: Sha256Digest | null;
}

export interface ConsensusReviewerProfile {
  readonly kind: "consensus_reviewer_profile";
  readonly schemaVersion: "5.0.0";
  readonly profileRef: string;
  readonly roleContractRef: string;
  readonly configurationDigest: Sha256Digest;
  readonly instructionContractRef: string;
  readonly resultContractRef: string;
  readonly capabilityRefs: readonly string[];
  readonly actorRef: string;
  readonly workerBindingRef: string;
}

export interface ConsensusPanel {
  readonly kind: "consensus_panel";
  readonly schemaVersion: "5.0.0";
  readonly panelRef: string;
  readonly panelDigest: Sha256Digest;
  readonly profiles: readonly ConsensusReviewerProfile[];
}

export interface ConsensusRoundPolicy {
  readonly kind: "consensus_round_policy";
  readonly schemaVersion: "5.0.0";
  readonly policyRef: string;
  readonly policyDigest: Sha256Digest;
  readonly roundBudget: number;
  readonly convergenceRuleRef: string;
  readonly disagreementRuleRef: string;
  readonly escalationRuleRef: string;
  readonly foldbackContractRef: string;
}

export interface ConsensusInvocation {
  readonly kind: "consensus_invocation";
  readonly schemaVersion: "5.0.0";
  readonly invocationRef: string;
  readonly subject: ConsensusSubject;
  readonly panel: ConsensusPanel;
  readonly policy: ConsensusRoundPolicy;
  readonly transportLane: "closed_prompt_proof" | "worker_executes";
}

export interface ConsensusReviewerTask {
  readonly kind: "consensus_reviewer_task";
  readonly schemaVersion: "5.0.0";
  readonly invocationRef: string;
  readonly roundRef: string;
  readonly roundOrdinal: number;
  readonly subject: ConsensusSubject;
  readonly panelRef: string;
  readonly policy: ConsensusRoundPolicy;
  readonly profile: ConsensusReviewerProfile;
  readonly priorRoundRefs: readonly string[];
  readonly priorFindingSetRefs: readonly string[];
  readonly priorRulings: readonly ReviewRuling[];
  readonly priorDissentProfileRefs: readonly string[];
  readonly priorEvidenceRefs: readonly string[];
  readonly transportLane: "closed_prompt_proof" | "worker_executes";
}

export interface ReviewFinding {
  readonly findingRef: string;
  readonly findingContractRef: string;
  readonly findingPayloadRef: string;
  readonly evidenceRefs: readonly string[];
}

export interface ReviewRuling {
  readonly rulingRef: string;
  readonly rulingKind: ReviewRulingKind;
  readonly findingRefs: readonly string[];
  readonly rationaleRef: string;
  readonly payloadRef: string;
}

export interface ReviewFindings {
  readonly kind: "review_findings";
  readonly schemaVersion: "5.0.0";
  readonly profileRef: string;
  readonly configurationDigest: Sha256Digest;
  readonly invocationRef: string;
  readonly roundRef: string;
  readonly roundOrdinal: number;
  readonly recommendation: "accept" | "revise";
  readonly outputDigest: Sha256Digest;
  readonly evidenceRefs: readonly string[];
  readonly findings: readonly ReviewFinding[];
  readonly residualRefs: readonly string[];
  readonly refusalRef: string | null;
  readonly task: ConsensusReviewerTask;
}

export interface ConsensusRoundOutcome {
  readonly kind: "consensus_round_outcome";
  readonly schemaVersion: "5.0.0";
  readonly roundRef: string;
  readonly outcome: ConsensusRoundOutcomeValue;
  readonly findingSetRefs: readonly string[];
  readonly rulingRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface ConsensusRoundState {
  readonly kind: "consensus_round_state";
  readonly schemaVersion: "5.0.0";
  readonly invocationRef: string;
  readonly subject: ConsensusSubject;
  readonly panel: ConsensusPanel;
  readonly policy: ConsensusRoundPolicy;
  readonly transportLane: "closed_prompt_proof" | "worker_executes";
  readonly roundOrdinal: number;
  readonly roundRefs: readonly string[];
  readonly findingSetRefs: readonly string[];
  readonly findingSets: readonly ReviewFindings[];
  readonly rulings: readonly ReviewRuling[];
  readonly dissentProfileRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly terminalOutcome: ConsensusRoundOutcome | null;
  readonly terminal: boolean;
  readonly members: readonly {
    readonly ordinal: number;
    readonly memberRef: string;
    readonly value: ConsensusReviewerTask;
  }[];
}

export interface ConsensusFindingsVector {
  readonly kind: "gtl_fan_out_vector";
  readonly schemaVersion: "5.0.0";
  readonly applicationRef: string;
  readonly members: readonly {
    readonly ordinal: number;
    readonly inputMemberRef: string;
    readonly outputMemberRef: string;
    readonly value: ReviewFindings;
  }[];
}

export interface ConsensusResultCandidate {
  readonly kind: "consensus_result";
  readonly schemaVersion: "5.0.0";
  readonly subjectRef: string;
  readonly subjectDigest: Sha256Digest;
  readonly panelRef: string;
  readonly policyRef: string;
  readonly roundRefs: readonly string[];
  readonly findingSetRefs: readonly string[];
  readonly rulings: readonly ReviewRuling[];
  readonly classification: ConsensusClassification;
  readonly dissentProfileRefs: readonly string[];
  readonly terminalOutcome: ConsensusRoundOutcome;
  readonly evidenceRefs: readonly string[];
  readonly lineageRefs: readonly string[];
  readonly resultRef: string;
  readonly replayRef: string;
  readonly contractFailureRef: string | null;
}

export interface ConsensusEscalationDecision {
  readonly kind: "consensus_escalation_decision";
  readonly schemaVersion: "5.0.0";
  readonly unresolvedResult: ConsensusResultCandidate;
  readonly unresolvedResultRef: string;
  readonly unresolvedResultDigest: Sha256Digest;
  readonly decision: "accept_with_dissent" | "reject";
  readonly humanActorRef: string;
  readonly rationaleRef: string;
}

export interface TicketConsensusProjection {
  readonly kind: "ticket_consensus_projection";
  readonly schemaVersion: "5.0.0";
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
  readonly ticketRef: string;
  readonly ticketDigest: Sha256Digest;
  readonly subjectRef: string;
  readonly subjectDigest: Sha256Digest;
  readonly panelRef: string;
  readonly policyRef: string;
  readonly roundRefs: readonly string[];
  readonly findingSetRefs: readonly string[];
  readonly rulings: readonly ReviewRuling[];
  readonly classification: ConsensusClassification;
  readonly dissentProfileRefs: readonly string[];
  readonly terminalOutcome: ConsensusRoundOutcome;
  readonly evidenceRefs: readonly string[];
  readonly lineageRefs: readonly string[];
  readonly resultRef: string;
  readonly replayRef: string;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function isRef(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isDigest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[0-9a-f]{64}$/u.test(value);
}

function uniqueRefs(value: unknown, allowEmpty = true): value is readonly string[] {
  return Array.isArray(value) &&
    (allowEmpty || value.length > 0) &&
    value.every(isRef) &&
    new Set(value).size === value.length;
}

export function constructConsensusReviewerProfile(
  input: Omit<ConsensusReviewerProfile, "configurationDigest" | "kind" | "schemaVersion">,
): Readonly<ConsensusReviewerProfile> {
  const body = {
    kind: "consensus_reviewer_profile" as const,
    schemaVersion: "5.0.0" as const,
    profileRef: input.profileRef,
    roleContractRef: input.roleContractRef,
    instructionContractRef: input.instructionContractRef,
    resultContractRef: input.resultContractRef,
    capabilityRefs: [...input.capabilityRefs],
    actorRef: input.actorRef,
    workerBindingRef: input.workerBindingRef,
  };
  const profile = deepFreeze({
    ...body,
    configurationDigest: sha256Canonical(body as unknown as JsonValue),
  });
  if (!isConsensusReviewerProfile(profile)) {
    throw new TypeError("Consensus reviewer profile is incomplete");
  }
  return profile;
}

export function constructConsensusPanel(
  panelRef: string,
  profiles: readonly Readonly<ConsensusReviewerProfile>[],
): Readonly<ConsensusPanel> {
  const body = {
    kind: "consensus_panel" as const,
    schemaVersion: "5.0.0" as const,
    panelRef,
    profiles: [...profiles],
  };
  const panel = deepFreeze({
    ...body,
    panelDigest: sha256Canonical(body as unknown as JsonValue),
  });
  if (!isConsensusPanel(panel)) {
    throw new TypeError(
      "Consensus panel requires at least two unique exact reviewer profiles",
    );
  }
  return panel;
}

export function constructConsensusRoundPolicy(
  input: Omit<ConsensusRoundPolicy, "kind" | "policyDigest" | "schemaVersion">,
): Readonly<ConsensusRoundPolicy> {
  const body = {
    kind: "consensus_round_policy" as const,
    schemaVersion: "5.0.0" as const,
    policyRef: input.policyRef,
    roundBudget: input.roundBudget,
    convergenceRuleRef: input.convergenceRuleRef,
    disagreementRuleRef: input.disagreementRuleRef,
    escalationRuleRef: input.escalationRuleRef,
    foldbackContractRef: input.foldbackContractRef,
  };
  const policy = deepFreeze({
    ...body,
    policyDigest: sha256Canonical(body as unknown as JsonValue),
  });
  if (!isConsensusRoundPolicy(policy)) {
    throw new TypeError(
      "Consensus round policy requires one positive bounded budget and exact rules",
    );
  }
  return policy;
}

export function constructConsensusSubject(
  input: Omit<ConsensusSubject, "kind" | "schemaVersion">,
): Readonly<ConsensusSubject> {
  const subject = deepFreeze({
    kind: "consensus_subject" as const,
    schemaVersion: "5.0.0" as const,
    ...input,
  });
  if (!isConsensusSubject(subject)) {
    throw new TypeError("Consensus subject requires one exact immutable identity");
  }
  return subject;
}

export function constructConsensusInvocation(
  input: Omit<ConsensusInvocation, "kind" | "schemaVersion">,
): Readonly<ConsensusInvocation> {
  const invocation = deepFreeze({
    kind: "consensus_invocation" as const,
    schemaVersion: "5.0.0" as const,
    ...input,
  });
  if (!isConsensusInvocation(invocation)) {
    throw new TypeError(
      "Consensus invocation requires one matching subject, panel, and policy",
    );
  }
  return invocation;
}

export function isConsensusSubject(value: unknown): value is ConsensusSubject {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "subjectContractRef",
      "subjectRef",
      "subjectDigest",
      "submittingActorRef",
      "panelRef",
      "roundPolicyRef",
      "workspaceRef",
      "ticketRef",
      "ticketDigest",
    ])
  ) return false;
  return value.kind === "consensus_subject" &&
    value.schemaVersion === "5.0.0" &&
    isRef(value.subjectContractRef) &&
    isRef(value.subjectRef) &&
    isDigest(value.subjectDigest) &&
    isRef(value.submittingActorRef) &&
    isRef(value.panelRef) &&
    isRef(value.roundPolicyRef) &&
    isRef(value.workspaceRef) &&
    (
      (value.ticketRef === null && value.ticketDigest === null) ||
      (isRef(value.ticketRef) && isDigest(value.ticketDigest))
    );
}

export function isConsensusReviewerProfile(
  value: unknown,
): value is ConsensusReviewerProfile {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "profileRef",
      "roleContractRef",
      "configurationDigest",
      "instructionContractRef",
      "resultContractRef",
      "capabilityRefs",
      "actorRef",
      "workerBindingRef",
    ])
  ) return false;
  return value.kind === "consensus_reviewer_profile" &&
    value.schemaVersion === "5.0.0" &&
    isRef(value.profileRef) &&
    isRef(value.roleContractRef) &&
    isDigest(value.configurationDigest) &&
    isRef(value.instructionContractRef) &&
    value.resultContractRef === CONSENSUS_IDS.findingsContractRef &&
    uniqueRefs(value.capabilityRefs) &&
    isRef(value.actorRef) &&
    isRef(value.workerBindingRef);
}

export function isConsensusPanel(value: unknown): value is ConsensusPanel {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "panelRef",
      "panelDigest",
      "profiles",
    ]) ||
    value.kind !== "consensus_panel" ||
    value.schemaVersion !== "5.0.0" ||
    !isRef(value.panelRef) ||
    !isDigest(value.panelDigest) ||
    !Array.isArray(value.profiles) ||
    value.profiles.length < 2 ||
    !value.profiles.every(isConsensusReviewerProfile)
  ) return false;
  if (
    new Set(value.profiles.map((profile) => profile.profileRef)).size !==
      value.profiles.length
  ) return false;
  const { panelDigest: _panelDigest, ...body } = value;
  return value.panelDigest ===
    sha256Canonical(body as unknown as JsonValue);
}

export function isConsensusRoundPolicy(
  value: unknown,
): value is ConsensusRoundPolicy {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "policyRef",
      "policyDigest",
      "roundBudget",
      "convergenceRuleRef",
      "disagreementRuleRef",
      "escalationRuleRef",
      "foldbackContractRef",
    ]) ||
    value.kind !== "consensus_round_policy" ||
    value.schemaVersion !== "5.0.0" ||
    !isRef(value.policyRef) ||
    !isDigest(value.policyDigest) ||
    !Number.isSafeInteger(value.roundBudget) ||
    Number(value.roundBudget) < 1 ||
    Number(value.roundBudget) > 4 ||
    !isRef(value.convergenceRuleRef) ||
    !isRef(value.disagreementRuleRef) ||
    !isRef(value.escalationRuleRef) ||
    !isRef(value.foldbackContractRef)
  ) return false;
  const { policyDigest: _policyDigest, ...body } = value;
  return value.policyDigest ===
    sha256Canonical(body as unknown as JsonValue);
}

export function isConsensusInvocation(
  value: unknown,
): value is ConsensusInvocation {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "invocationRef",
      "subject",
      "panel",
      "policy",
      "transportLane",
    ]) &&
    value.kind === "consensus_invocation" &&
    value.schemaVersion === "5.0.0" &&
    isRef(value.invocationRef) &&
    isConsensusSubject(value.subject) &&
    isConsensusPanel(value.panel) &&
    isConsensusRoundPolicy(value.policy) &&
    value.subject.panelRef === value.panel.panelRef &&
    value.subject.roundPolicyRef === value.policy.policyRef &&
    ["closed_prompt_proof", "worker_executes"].includes(
      String(value.transportLane),
    );
}

export function isConsensusReviewerTask(
  value: unknown,
): value is ConsensusReviewerTask {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "invocationRef",
      "roundRef",
      "roundOrdinal",
      "subject",
      "panelRef",
      "policy",
      "profile",
      "priorRoundRefs",
      "priorFindingSetRefs",
      "priorRulings",
      "priorDissentProfileRefs",
      "priorEvidenceRefs",
      "transportLane",
    ]) &&
    value.kind === "consensus_reviewer_task" &&
    value.schemaVersion === "5.0.0" &&
    isRef(value.invocationRef) &&
    isRef(value.roundRef) &&
    Number.isSafeInteger(value.roundOrdinal) &&
    Number(value.roundOrdinal) > 0 &&
    isConsensusSubject(value.subject) &&
    isRef(value.panelRef) &&
    value.subject.panelRef === value.panelRef &&
    isConsensusRoundPolicy(value.policy) &&
    value.subject.roundPolicyRef === value.policy.policyRef &&
    isConsensusReviewerProfile(value.profile) &&
    uniqueRefs(value.priorRoundRefs) &&
    uniqueRefs(value.priorFindingSetRefs) &&
    Array.isArray(value.priorRulings) &&
    value.priorRulings.every(isReviewRuling) &&
    uniqueRefs(value.priorDissentProfileRefs) &&
    uniqueRefs(value.priorEvidenceRefs) &&
    ["closed_prompt_proof", "worker_executes"].includes(
      String(value.transportLane),
    );
}

function isReviewFinding(value: unknown): value is ReviewFinding {
  return isRecord(value) &&
    hasExactKeys(value, [
      "findingRef",
      "findingContractRef",
      "findingPayloadRef",
      "evidenceRefs",
    ]) &&
    isRef(value.findingRef) &&
    isRef(value.findingContractRef) &&
    isRef(value.findingPayloadRef) &&
    uniqueRefs(value.evidenceRefs);
}

export function isReviewFindings(value: unknown): value is ReviewFindings {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "profileRef",
      "configurationDigest",
      "invocationRef",
      "roundRef",
      "roundOrdinal",
      "recommendation",
      "outputDigest",
      "evidenceRefs",
      "findings",
      "residualRefs",
      "refusalRef",
      "task",
    ]) ||
    value.kind !== "review_findings" ||
    value.schemaVersion !== "5.0.0" ||
    !isRef(value.profileRef) ||
    !isDigest(value.configurationDigest) ||
    !isRef(value.invocationRef) ||
    !isRef(value.roundRef) ||
    !Number.isSafeInteger(value.roundOrdinal) ||
    !["accept", "revise"].includes(String(value.recommendation)) ||
    !isDigest(value.outputDigest) ||
    !uniqueRefs(value.evidenceRefs) ||
    !Array.isArray(value.findings) ||
    !value.findings.every(isReviewFinding) ||
    !uniqueRefs(value.residualRefs) ||
    !(value.refusalRef === null || isRef(value.refusalRef)) ||
    !isConsensusReviewerTask(value.task)
  ) return false;
  if (
    value.profileRef !== value.task.profile.profileRef ||
    value.configurationDigest !== value.task.profile.configurationDigest ||
    value.invocationRef !== value.task.invocationRef ||
    value.roundRef !== value.task.roundRef ||
    value.roundOrdinal !== value.task.roundOrdinal ||
    (value.recommendation === "accept" && value.findings.length !== 0) ||
    (value.recommendation === "revise" && value.findings.length === 0)
  ) return false;
  const { outputDigest: _outputDigest, ...body } = value;
  return value.outputDigest === sha256Canonical(body as unknown as JsonValue);
}

function isReviewRuling(value: unknown): value is ReviewRuling {
  return isRecord(value) &&
    hasExactKeys(value, [
      "rulingRef",
      "rulingKind",
      "findingRefs",
      "rationaleRef",
      "payloadRef",
    ]) &&
    isRef(value.rulingRef) &&
    REVIEW_RULING_KIND_VALUES.includes(value.rulingKind as ReviewRulingKind) &&
    uniqueRefs(value.findingRefs) &&
    isRef(value.rationaleRef) &&
    isRef(value.payloadRef);
}

export function isConsensusRoundOutcome(
  value: unknown,
): value is ConsensusRoundOutcome {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "roundRef",
      "outcome",
      "findingSetRefs",
      "rulingRefs",
      "evidenceRefs",
    ]) &&
    value.kind === "consensus_round_outcome" &&
    value.schemaVersion === "5.0.0" &&
    isRef(value.roundRef) &&
    CONSENSUS_ROUND_OUTCOME_VALUES.includes(
      value.outcome as ConsensusRoundOutcomeValue,
    ) &&
    uniqueRefs(value.findingSetRefs) &&
    uniqueRefs(value.rulingRefs) &&
    uniqueRefs(value.evidenceRefs);
}

export function isConsensusRoundState(
  value: unknown,
): value is ConsensusRoundState {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "invocationRef",
      "subject",
      "panel",
      "policy",
      "transportLane",
      "roundOrdinal",
      "roundRefs",
      "findingSetRefs",
      "findingSets",
      "rulings",
      "dissentProfileRefs",
      "evidenceRefs",
      "terminalOutcome",
      "terminal",
      "members",
    ]) &&
    value.kind === "consensus_round_state" &&
    value.schemaVersion === "5.0.0" &&
    isRef(value.invocationRef) &&
    isConsensusSubject(value.subject) &&
    isConsensusPanel(value.panel) &&
    isConsensusRoundPolicy(value.policy) &&
    value.subject.panelRef === value.panel.panelRef &&
    value.subject.roundPolicyRef === value.policy.policyRef &&
    ["closed_prompt_proof", "worker_executes"].includes(
      String(value.transportLane),
    ) &&
    Number.isSafeInteger(value.roundOrdinal) &&
    Number(value.roundOrdinal) > 0 &&
    uniqueRefs(value.roundRefs) &&
    uniqueRefs(value.findingSetRefs) &&
    Array.isArray(value.findingSets) &&
    value.findingSets.every(isReviewFindings) &&
    Array.isArray(value.rulings) &&
    value.rulings.every(isReviewRuling) &&
    uniqueRefs(value.dissentProfileRefs) &&
    uniqueRefs(value.evidenceRefs) &&
    (
      value.terminalOutcome === null ||
      isConsensusRoundOutcome(value.terminalOutcome)
    ) &&
    typeof value.terminal === "boolean" &&
    value.terminal === (value.terminalOutcome !== null) &&
    Array.isArray(value.members) &&
    (
      value.terminal
        ? value.members.length === 0
        : value.members.length === value.panel.profiles.length
    ) &&
    value.members.every((member, ordinal) =>
      isRecord(member) &&
      hasExactKeys(member, ["ordinal", "memberRef", "value"]) &&
      member.ordinal === ordinal &&
      isRef(member.memberRef) &&
      isConsensusReviewerTask(member.value) &&
      member.value.profile.profileRef ===
        (value.panel as ConsensusPanel).profiles[ordinal]?.profileRef &&
      member.value.roundOrdinal === value.roundOrdinal
    );
}

export function isConsensusFindingsVector(
  value: unknown,
): value is ConsensusFindingsVector {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "applicationRef",
      "members",
    ]) &&
    value.kind === "gtl_fan_out_vector" &&
    value.schemaVersion === "5.0.0" &&
    isRef(value.applicationRef) &&
    Array.isArray(value.members) &&
    value.members.length >= 2 &&
    value.members.every((member, ordinal) =>
      isRecord(member) &&
      hasExactKeys(member, [
        "ordinal",
        "inputMemberRef",
        "outputMemberRef",
        "value",
      ]) &&
      member.ordinal === ordinal &&
      isRef(member.inputMemberRef) &&
      isRef(member.outputMemberRef) &&
      isReviewFindings(member.value)
    );
}

export function isConsensusResultCandidate(
  value: unknown,
): value is ConsensusResultCandidate {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "subjectRef",
      "subjectDigest",
      "panelRef",
      "policyRef",
      "roundRefs",
      "findingSetRefs",
      "rulings",
      "classification",
      "dissentProfileRefs",
      "terminalOutcome",
      "evidenceRefs",
      "lineageRefs",
      "resultRef",
      "replayRef",
      "contractFailureRef",
    ]) ||
    value.kind !== "consensus_result" ||
    value.schemaVersion !== "5.0.0" ||
    !isRef(value.subjectRef) ||
    !isDigest(value.subjectDigest) ||
    !isRef(value.panelRef) ||
    !isRef(value.policyRef) ||
    !uniqueRefs(value.roundRefs, false) ||
    !uniqueRefs(value.findingSetRefs) ||
    !Array.isArray(value.rulings) ||
    !value.rulings.every(isReviewRuling) ||
    !CONSENSUS_CLASSIFICATION_VALUES.includes(
      value.classification as ConsensusClassification,
    ) ||
    !uniqueRefs(value.dissentProfileRefs) ||
    !isConsensusRoundOutcome(value.terminalOutcome) ||
    !uniqueRefs(value.evidenceRefs) ||
    !uniqueRefs(value.lineageRefs, false) ||
    !isRef(value.resultRef) ||
    !isRef(value.replayRef) ||
    !(value.contractFailureRef === null || isRef(value.contractFailureRef))
  ) return false;
  return (value.classification === "contract_failure") ===
    (value.contractFailureRef !== null);
}

export function isConsensusEscalationDecision(
  value: unknown,
): value is ConsensusEscalationDecision {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "unresolvedResult",
      "unresolvedResultRef",
      "unresolvedResultDigest",
      "decision",
      "humanActorRef",
      "rationaleRef",
    ]) &&
    value.kind === "consensus_escalation_decision" &&
    value.schemaVersion === "5.0.0" &&
    isConsensusResultCandidate(value.unresolvedResult) &&
    isRef(value.unresolvedResultRef) &&
    isDigest(value.unresolvedResultDigest) &&
    value.unresolvedResult.resultRef === value.unresolvedResultRef &&
    sha256Canonical(value.unresolvedResult as unknown as JsonValue) ===
      value.unresolvedResultDigest &&
    value.unresolvedResult.terminalOutcome.outcome === "escalate_fh" &&
    ["accept_with_dissent", "reject"].includes(String(value.decision)) &&
    isRef(value.humanActorRef) &&
    isRef(value.rationaleRef);
}

export function isTicketConsensusProjection(
  value: unknown,
): value is TicketConsensusProjection {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "kind",
      "schemaVersion",
      "projectionRef",
      "projectionDigest",
      "ticketRef",
      "ticketDigest",
      "subjectRef",
      "subjectDigest",
      "panelRef",
      "policyRef",
      "roundRefs",
      "findingSetRefs",
      "rulings",
      "classification",
      "dissentProfileRefs",
      "terminalOutcome",
      "evidenceRefs",
      "lineageRefs",
      "resultRef",
      "replayRef",
    ]) ||
    value.kind !== "ticket_consensus_projection" ||
    value.schemaVersion !== "5.0.0" ||
    !isRef(value.projectionRef) ||
    !isDigest(value.projectionDigest) ||
    !isRef(value.ticketRef) ||
    !isDigest(value.ticketDigest) ||
    value.subjectRef !== value.ticketRef ||
    value.subjectDigest !== value.ticketDigest ||
    !isRef(value.panelRef) ||
    !isRef(value.policyRef) ||
    !uniqueRefs(value.roundRefs, false) ||
    !uniqueRefs(value.findingSetRefs) ||
    !Array.isArray(value.rulings) ||
    !value.rulings.every(isReviewRuling) ||
    !CONSENSUS_CLASSIFICATION_VALUES.includes(
      value.classification as ConsensusClassification,
    ) ||
    !uniqueRefs(value.dissentProfileRefs) ||
    !isConsensusRoundOutcome(value.terminalOutcome) ||
    !uniqueRefs(value.evidenceRefs) ||
    !uniqueRefs(value.lineageRefs, false) ||
    !isRef(value.resultRef) ||
    !isRef(value.replayRef)
  ) return false;
  const {
    projectionRef: _projectionRef,
    projectionDigest: _projectionDigest,
    ...body
  } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.projectionDigest === digest &&
    value.projectionRef ===
      `ticket-consensus-projection://abg/${digest.slice("sha256:".length)}`;
}

function roundRef(invocationRef: string, ordinal: number): string {
  const digest = sha256Canonical({ invocationRef, ordinal });
  return `consensus-round://abg/${digest.slice("sha256:".length)}`;
}

function reviewerTask(
  invocation: Readonly<ConsensusInvocation>,
  ordinal: number,
  profile: Readonly<ConsensusReviewerProfile>,
  priorRoundRefs: readonly string[],
  priorFindingSetRefs: readonly string[],
  priorRulings: readonly ReviewRuling[],
  priorDissentProfileRefs: readonly string[],
  priorEvidenceRefs: readonly string[],
): Readonly<ConsensusReviewerTask> {
  const currentRoundRef = roundRef(invocation.invocationRef, ordinal);
  return deepFreeze({
    kind: "consensus_reviewer_task" as const,
    schemaVersion: "5.0.0" as const,
    invocationRef: invocation.invocationRef,
    roundRef: currentRoundRef,
    roundOrdinal: ordinal,
    subject: invocation.subject,
    panelRef: invocation.panel.panelRef,
    policy: invocation.policy,
    profile,
    priorRoundRefs: [...priorRoundRefs],
    priorFindingSetRefs: [...priorFindingSetRefs],
    priorRulings: [...priorRulings],
    priorDissentProfileRefs: [...priorDissentProfileRefs],
    priorEvidenceRefs: [...priorEvidenceRefs],
    transportLane: invocation.transportLane,
  });
}

function stateMembers(
  invocation: Readonly<ConsensusInvocation>,
  ordinal: number,
  priorRoundRefs: readonly string[],
  priorFindingSetRefs: readonly string[],
  priorRulings: readonly ReviewRuling[],
  priorDissentProfileRefs: readonly string[],
  priorEvidenceRefs: readonly string[],
) {
  return invocation.panel.profiles.map((profile, index) => {
    const task = reviewerTask(
      invocation,
      ordinal,
      profile,
      priorRoundRefs,
      priorFindingSetRefs,
      priorRulings,
      priorDissentProfileRefs,
      priorEvidenceRefs,
    );
    return {
      ordinal: index,
      memberRef:
        `consensus-reviewer-task://abg/${sha256Canonical(task as unknown as JsonValue).slice("sha256:".length)}`,
      value: task,
    };
  });
}

export function initializeConsensus(
  invocation: Readonly<ConsensusInvocation>,
): Readonly<ConsensusRoundState> {
  if (!isConsensusInvocation(invocation)) {
    throw new TypeError("Consensus initialization requires one exact invocation");
  }
  return deepFreeze({
    kind: "consensus_round_state" as const,
    schemaVersion: "5.0.0" as const,
    invocationRef: invocation.invocationRef,
    subject: invocation.subject,
    panel: invocation.panel,
    policy: invocation.policy,
    transportLane: invocation.transportLane,
    roundOrdinal: 1,
    roundRefs: [],
    findingSetRefs: [],
    findingSets: [],
    rulings: [],
    dissentProfileRefs: [],
    evidenceRefs: [],
    terminalOutcome: null,
    terminal: false,
    members: stateMembers(invocation, 1, [], [], [], [], []),
  });
}

function findingSetRef(findings: Readonly<ReviewFindings>): string {
  return `finding-set://abg/${findings.outputDigest.slice("sha256:".length)}`;
}

function rulingFor(findings: Readonly<ReviewFindings>): Readonly<ReviewRuling> {
  const findingRefs = findings.findings.map((finding) => finding.findingRef);
  const body = {
    rulingKind: "decision_row" as const,
    findingRefs,
    rationaleRef: findings.recommendation === "accept"
      ? "rationale://abg/consensus/profile-acceptance@5"
      : "rationale://abg/consensus/profile-revision@5",
    payloadRef: findingSetRef(findings),
  };
  const digest = sha256Canonical(body);
  return deepFreeze({
    rulingRef: `review-ruling://abg/${digest.slice("sha256:".length)}`,
    ...body,
  });
}

export function reduceConsensusRound(
  vector: Readonly<ConsensusFindingsVector>,
): Readonly<ConsensusRoundState> {
  if (!isConsensusFindingsVector(vector)) {
    throw new TypeError("Consensus reduction requires one exact findings vector");
  }
  const findings = vector.members.map((member) => member.value);
  const first = findings[0]!;
  const task = first.task;
  if (
    findings.some((row, ordinal) =>
      row.invocationRef !== task.invocationRef ||
      row.roundRef !== task.roundRef ||
      row.roundOrdinal !== task.roundOrdinal ||
      row.task.subject.subjectRef !== task.subject.subjectRef ||
      row.task.subject.subjectDigest !== task.subject.subjectDigest ||
      row.task.panelRef !== task.panelRef ||
      row.task.policy.policyDigest !== task.policy.policyDigest ||
      row.profileRef === findings[ordinal - 1]?.profileRef
    )
  ) {
    throw new TypeError(
      "Consensus reduction requires one attributed ordered panel round",
    );
  }
  const profiles = findings.map((row) => row.task.profile);
  const panelBody = {
    kind: "consensus_panel" as const,
    schemaVersion: "5.0.0" as const,
    panelRef: task.panelRef,
    profiles,
  };
  const panel = deepFreeze({
    ...panelBody,
    panelDigest: sha256Canonical(panelBody as unknown as JsonValue),
  });
  const findingSetRefs = findings.map(findingSetRef);
  const rulings = findings.map(rulingFor);
  const rulingRefs = rulings.map((ruling) => ruling.rulingRef);
  const evidenceRefs = findings.flatMap((row) => row.evidenceRefs);
  const roundDissentProfileRefs = findings
    .filter((row) => row.recommendation === "revise")
    .map((row) => row.profileRef);
  const dissentProfileRefs = [
    ...new Set([
      ...task.priorDissentProfileRefs,
      ...roundDissentProfileRefs,
    ]),
  ];
  const outcome: ConsensusRoundOutcomeValue =
    roundDissentProfileRefs.length === 0
    ? "closed_done"
    : task.roundOrdinal >= task.policy.roundBudget
    ? "escalate_fh"
    : "recurse_next_round";
  const terminalOutcome = deepFreeze({
    kind: "consensus_round_outcome" as const,
    schemaVersion: "5.0.0" as const,
    roundRef: task.roundRef,
    outcome,
    findingSetRefs,
    rulingRefs,
    evidenceRefs,
  });
  const invocation: ConsensusInvocation = {
    kind: "consensus_invocation",
    schemaVersion: "5.0.0",
    invocationRef: task.invocationRef,
    subject: task.subject,
    panel,
    policy: task.policy,
    transportLane: task.transportLane,
  };
  const nextOrdinal = task.roundOrdinal + 1;
  return deepFreeze({
    kind: "consensus_round_state" as const,
    schemaVersion: "5.0.0" as const,
    invocationRef: task.invocationRef,
    subject: task.subject,
    panel,
    policy: task.policy,
    transportLane: task.transportLane,
    roundOrdinal: outcome === "recurse_next_round"
      ? nextOrdinal
      : task.roundOrdinal,
    roundRefs: [...task.priorRoundRefs, task.roundRef],
    findingSetRefs: [...task.priorFindingSetRefs, ...findingSetRefs],
    findingSets: findings,
    rulings: [...task.priorRulings, ...rulings],
    dissentProfileRefs,
    evidenceRefs: [...new Set([...task.priorEvidenceRefs, ...evidenceRefs])],
    terminalOutcome: outcome === "recurse_next_round" ? null : terminalOutcome,
    terminal: outcome !== "recurse_next_round",
    members: outcome === "recurse_next_round"
      ? stateMembers(
        invocation,
        nextOrdinal,
        [...task.priorRoundRefs, task.roundRef],
        [...task.priorFindingSetRefs, ...findingSetRefs],
        [...task.priorRulings, ...rulings],
        dissentProfileRefs,
        [...new Set([...task.priorEvidenceRefs, ...evidenceRefs])],
      )
      : [],
  });
}

export function projectConsensusResult(
  state: Readonly<ConsensusRoundState>,
): Readonly<ConsensusResultCandidate> {
  if (
    !isConsensusRoundState(state) ||
    !state.terminal ||
    state.terminalOutcome === null
  ) {
    throw new TypeError("Consensus result projection requires terminal round truth");
  }
  const classification: ConsensusClassification =
    state.terminalOutcome.outcome === "escalate_fh"
      ? "unresolved_disagreement"
      : state.dissentProfileRefs.length === 0
      ? "unanimous_agreement"
      : "partial_agreement_with_dissent";
  const body = {
    kind: "consensus_result" as const,
    schemaVersion: "5.0.0" as const,
    subjectRef: state.subject.subjectRef,
    subjectDigest: state.subject.subjectDigest,
    panelRef: state.panel.panelRef,
    policyRef: state.policy.policyRef,
    roundRefs: state.roundRefs,
    findingSetRefs: state.findingSetRefs,
    rulings: state.rulings,
    classification,
    dissentProfileRefs: state.dissentProfileRefs,
    terminalOutcome: state.terminalOutcome,
    evidenceRefs: state.evidenceRefs,
    lineageRefs: [
      state.invocationRef,
      state.subject.subjectRef,
      ...state.roundRefs,
    ],
    replayRef: "replay://abg/pending-runtime-admission",
    contractFailureRef: null,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ...body,
    resultRef: `consensus-result://abg/${digest.slice("sha256:".length)}`,
  });
}

export function finalizeConsensusEscalation(
  decision: Readonly<ConsensusEscalationDecision>,
): Readonly<ConsensusResultCandidate> {
  if (!isConsensusEscalationDecision(decision)) {
    throw new TypeError("Consensus escalation requires one exact human decision");
  }
  const terminalOutcome: ConsensusRoundOutcome = {
    ...decision.unresolvedResult.terminalOutcome,
    outcome: "closed_done",
  };
  const body = {
    kind: "consensus_result" as const,
    schemaVersion: "5.0.0" as const,
    subjectRef: decision.unresolvedResult.subjectRef,
    subjectDigest: decision.unresolvedResult.subjectDigest,
    panelRef: decision.unresolvedResult.panelRef,
    policyRef: decision.unresolvedResult.policyRef,
    roundRefs: decision.unresolvedResult.roundRefs,
    findingSetRefs: decision.unresolvedResult.findingSetRefs,
    rulings: decision.unresolvedResult.rulings,
    classification: decision.decision === "accept_with_dissent"
      ? "partial_agreement_with_dissent" as const
      : "unresolved_disagreement" as const,
    dissentProfileRefs: decision.unresolvedResult.dissentProfileRefs,
    terminalOutcome,
    evidenceRefs: decision.unresolvedResult.evidenceRefs,
    lineageRefs: [
      ...decision.unresolvedResult.lineageRefs,
      decision.unresolvedResultRef,
      decision.humanActorRef,
    ],
    replayRef: "replay://abg/pending-runtime-admission",
    contractFailureRef: decision.unresolvedResult.contractFailureRef,
  };
  const digest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ...body,
    resultRef:
      `consensus-result://abg/fh/${digest.slice("sha256:".length)}`,
  });
}

export function projectTicketConsensus(
  result: Readonly<ConsensusResultCandidate>,
  replayRef: string,
): Readonly<TicketConsensusProjection> {
  if (
    !isConsensusResultCandidate(result) ||
    !result.subjectRef.startsWith("ticket://") ||
    !isRef(replayRef)
  ) {
    throw new TypeError(
      "Ticket Consensus projection requires one admitted ticket result and replay",
    );
  }
  const body = {
    kind: "ticket_consensus_projection" as const,
    schemaVersion: "5.0.0" as const,
    ticketRef: result.subjectRef,
    ticketDigest: result.subjectDigest,
    subjectRef: result.subjectRef,
    subjectDigest: result.subjectDigest,
    panelRef: result.panelRef,
    policyRef: result.policyRef,
    roundRefs: result.roundRefs,
    findingSetRefs: result.findingSetRefs,
    rulings: result.rulings,
    classification: result.classification,
    dissentProfileRefs: result.dissentProfileRefs,
    terminalOutcome: result.terminalOutcome,
    evidenceRefs: result.evidenceRefs,
    lineageRefs: result.lineageRefs,
    resultRef: result.resultRef,
    replayRef,
  };
  const projectionDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ...body,
    projectionRef:
      `ticket-consensus-projection://abg/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest,
  });
}

export function resolveConsensusJudgmentRelation(predicateRef: string) {
  const relation = (
    evaluate: (input: unknown, output: unknown) => boolean,
    name: string,
  ) => Object.freeze({
    predicateRef,
    advanceReasonRef: `reason://abg/consensus/${name}-accepted@5`,
    rejectionReasonRef: `reason://abg/consensus/${name}-rejected@5`,
    evaluate,
  });
  switch (predicateRef) {
    case CONSENSUS_IDS.initializerPredicateRef:
      return relation(
        (input, output) =>
          isConsensusInvocation(input) &&
          isConsensusRoundState(output) &&
          sha256Canonical(output as unknown as JsonValue) ===
            sha256Canonical(
              initializeConsensus(input) as unknown as JsonValue,
            ),
        "initialization",
      );
    case CONSENSUS_IDS.roundEvaluatorPredicateRef:
      return relation(
        (input, output) =>
          isConsensusRoundState(input) &&
          isConsensusRoundState(output) &&
          sha256Canonical(input as unknown as JsonValue) ===
            sha256Canonical(output as unknown as JsonValue),
        "round-evaluation",
      );
    case CONSENSUS_IDS.rootWorkflowPredicateRef:
      return relation(
        (input, output) =>
          isConsensusRoundState(input) &&
          isConsensusRoundState(output) &&
          output.invocationRef === input.invocationRef &&
          output.roundOrdinal >= input.roundOrdinal &&
          output.terminal,
        "root-workflow-foldback",
      );
    case CONSENSUS_IDS.roundWorkflowPredicateRef:
      return relation(
        (input, output) =>
          (
            isConsensusReviewerTask(input) &&
            isReviewFindings(output) &&
            output.profileRef === input.profile.profileRef &&
            output.configurationDigest === input.profile.configurationDigest &&
            output.roundRef === input.roundRef
          ) ||
          (
            isConsensusFindingsVector(input) &&
            isConsensusRoundState(output) &&
            sha256Canonical(output as unknown as JsonValue) ===
              sha256Canonical(
                reduceConsensusRound(input) as unknown as JsonValue,
              )
          ),
        "round-workflow-foldback",
      );
    case CONSENSUS_IDS.reviewerPredicateRef:
      return relation(
        (input, output) =>
          isConsensusReviewerTask(input) &&
          isReviewFindings(output) &&
          output.profileRef === input.profile.profileRef &&
          output.configurationDigest === input.profile.configurationDigest &&
          output.roundRef === input.roundRef,
        "reviewer-attribution",
      );
    case CONSENSUS_IDS.reducerPredicateRef:
      return relation(
        (input, output) =>
          isConsensusFindingsVector(input) &&
          isConsensusRoundState(output) &&
          sha256Canonical(output as unknown as JsonValue) ===
            sha256Canonical(
              reduceConsensusRound(input) as unknown as JsonValue,
            ),
        "round-reduction",
      );
    case CONSENSUS_IDS.projectorPredicateRef:
      return relation(
        (input, output) =>
          isConsensusRoundState(input) &&
          isConsensusResultCandidate(output) &&
          sha256Canonical(output as unknown as JsonValue) ===
            sha256Canonical(
              projectConsensusResult(input) as unknown as JsonValue,
            ),
        "result-projection",
      );
    case CONSENSUS_IDS.escalationFinalizerPredicateRef:
      return relation(
        (input, output) =>
          isConsensusEscalationDecision(input) &&
          isConsensusResultCandidate(output) &&
          sha256Canonical(output as unknown as JsonValue) ===
            sha256Canonical(
              finalizeConsensusEscalation(input) as unknown as JsonValue,
            ),
        "fh-escalation",
      );
    default:
      return null;
  }
}

function executableRequirement(
  bindingRef: string,
  inputContractRef: string,
  outputContractRef: string,
) {
  return {
    kind: "executable_leaf_requirement" as const,
    implementationBindingRef: bindingRef,
    inputContractRef,
    outputContractRef,
    evidenceContractRef: CONSENSUS_IDS.evidenceContractRef,
    failureContractRef: CONSENSUS_IDS.failureContractRef,
    refusalContractRef: CONSENSUS_IDS.refusalContractRef,
    judgmentContractRef: CONSENSUS_IDS.judgmentContractRef,
  };
}

function leafGraphFunction(input: {
  readonly name: string;
  readonly graphRef: string;
  readonly nodeRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly bindingRef: string;
  readonly predicateRef: string;
  readonly stageRole: string;
  readonly fibre: "F_D" | "F_P";
  readonly closureContractRef: string;
  readonly retryBudget?: number;
}): GraphFunction {
  const leaf = C.of({
    input: cCarrier<Record<string, JsonValue>>(input.inputContractRef),
    output: cCarrier<Record<string, JsonValue>>(input.outputContractRef),
    programLocusRef: input.nodeRef,
    stageRole: input.stageRole,
    fibre: input.fibre,
    armId: `arm://${input.nodeRef.slice("locus://".length)}`,
    compositionRef: null,
    vectorIndex: 0,
    judgmentPredicateRef: input.predicateRef,
    resultBearing: true,
    requirement: executableRequirement(
      input.bindingRef,
      input.inputContractRef,
      input.outputContractRef,
    ),
  });
  return {
    kind: "graph_function",
    name: input.name,
    version: "5.0.0",
    environment: {
      requires: [input.inputContractRef],
      provides: [input.outputContractRef],
      carries: [input.inputContractRef, input.outputContractRef],
    },
    inputs: [input.inputContractRef],
    outputs: [input.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: input.graphRef,
      startNodeRef: input.nodeRef,
      terminalNodeRefs: [input.nodeRef],
      nodes: [{
        nodeRef: input.nodeRef,
        nodeKind: "c_locus",
        term: input.retryBudget === undefined
          ? leaf
          : C.retry(leaf, input.retryBudget),
      }],
      edges: [],
      applications: [],
    },
    effects: input.fibre === "F_P"
      ? ["effect://abg/consensus/reviewer-worker@5"]
      : [],
    declarations: {
      "abg.compute_regime": input.fibre,
      "abg.closure_contract": input.closureContractRef,
      "abg.child_closure_contract": input.closureContractRef,
      "abg.evidence_contract": CONSENSUS_IDS.evidenceContractRef,
      "abg.judgment_contract": CONSENSUS_IDS.judgmentContractRef,
      "abg.judgment_predicate": input.predicateRef,
      "abg.transition_contract": CONSENSUS_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "consensus", input.stageRole.toLowerCase()],
  };
}

function closure(
  closureContractRef: string,
  scope: ClosureContract["closureScope"],
  resultContractRef: string,
): ClosureContract {
  const common = {
    kind: "closure_contract" as const,
    closureContractRef,
    predicateRef: "predicate://abg/consensus/terminal@5",
    evidenceContractRef: CONSENSUS_IDS.evidenceContractRef,
    resultContractRef,
    refusalContractRef: CONSENSUS_IDS.refusalContractRef,
    refusalValueKind: "consensus_refusal",
    judgmentContractRef: CONSENSUS_IDS.judgmentContractRef,
    rejectionContractRef: CONSENSUS_IDS.refusalContractRef,
    transitionContractRef: CONSENSUS_IDS.transitionContractRef,
    replayProjectionRef: "projection://abg/consensus/replay@5",
    terminalKind: "completed" as const,
  };
  return scope === "run"
    ? {
      ...common,
      closureScope: "run",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ],
    }
    : {
      ...common,
      closureScope: "graph_call",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
      ],
    };
}

export function constructConsensusModulePublication(
  artifact: RootModuleArtifactBasis,
): Readonly<ModulePublication> {
  const invocationCarrier = cCarrier<ConsensusInvocation>(
    CONSENSUS_IDS.invocationContractRef,
  );
  const stateCarrier = cCarrier<ConsensusRoundState>(
    CONSENSUS_IDS.stateContractRef,
  );
  const resultCarrier = cCarrier<ConsensusResultCandidate>(
    CONSENSUS_IDS.resultContractRef,
  );
  const reviewerTaskCarrier = cCarrier<ConsensusReviewerTask>(
    CONSENSUS_IDS.reviewerTaskContractRef,
  );
  const findingsCarrier = cCarrier<ReviewFindings>(
    CONSENSUS_IDS.findingsContractRef,
  );
  const findingsVectorCarrier = cCarrier<ConsensusFindingsVector>(
    CONSENSUS_IDS.findingsVectorContractRef,
  );
  const roundLoopRef = cGraphFunctionRef({
    graphFunctionRef: CONSENSUS_IDS.roundLoopGraphFunctionRef,
    input: stateCarrier,
    output: stateCarrier,
  });
  const roundRef = cGraphFunctionRef({
    graphFunctionRef: CONSENSUS_IDS.roundGraphFunctionRef,
    input: stateCarrier,
    output: stateCarrier,
  });
  const reviewerRef = cGraphFunctionRef({
    graphFunctionRef: CONSENSUS_IDS.reviewerGraphFunctionRef,
    input: reviewerTaskCarrier,
    output: findingsCarrier,
  });
  const reducerRef = cGraphFunctionRef({
    graphFunctionRef: CONSENSUS_IDS.reducerGraphFunctionRef,
    input: findingsVectorCarrier,
    output: stateCarrier,
  });
  const recursion = recurseApplication({
    inputContractRef: CONSENSUS_IDS.stateContractRef,
    outputContractRef: CONSENSUS_IDS.stateContractRef,
    graphFunctionRef: CONSENSUS_IDS.roundGraphFunctionRef,
    terminationRuleRef: CONSENSUS_IDS.roundTerminationRuleRef,
    terminationEvaluatorRefs: [
      CONSENSUS_IDS.roundEvaluatorRef,
    ],
    terminationFieldRef: "$.terminal",
    foldback: {
      mode: "rebind",
      binding: "$",
      requiresParentEvaluation: true,
    },
    bound: 4,
  });
  const fanOut = fanOutApplication({
    inputContractRef: CONSENSUS_IDS.stateContractRef,
    outputContractRef: CONSENSUS_IDS.findingsVectorContractRef,
    batchRef: CONSENSUS_IDS.roundBatchRef,
    elementGraphFunctionRef: CONSENSUS_IDS.reviewerGraphFunctionRef,
    inputVectorRef: CONSENSUS_IDS.stateContractRef,
    outputVectorRef: CONSENSUS_IDS.findingsVectorContractRef,
    inputMemberContractRef: CONSENSUS_IDS.reviewerTaskContractRef,
    outputMemberContractRef: CONSENSUS_IDS.findingsContractRef,
  });
  const fanIn = fanInApplication({
    inputContractRef: CONSENSUS_IDS.findingsVectorContractRef,
    outputContractRef: CONSENSUS_IDS.stateContractRef,
    reducerGraphFunctionRef: CONSENSUS_IDS.reducerGraphFunctionRef,
    inputVectorRef: CONSENSUS_IDS.findingsVectorContractRef,
  });
  const initializerLeaf = C.of({
    input: invocationCarrier,
    output: stateCarrier,
    programLocusRef: "locus://abg/consensus/initialize@5",
    stageRole: "initialize",
    fibre: "F_D",
    armId: "arm://abg/consensus/initialize@5",
    compositionRef: null,
    vectorIndex: 0,
    judgmentPredicateRef: CONSENSUS_IDS.initializerPredicateRef,
    resultBearing: false,
    requirement: executableRequirement(
      CONSENSUS_IDS.initializerImplementationBindingRef,
      CONSENSUS_IDS.invocationContractRef,
      CONSENSUS_IDS.stateContractRef,
    ),
  });
  const projectorLeaf = C.of({
    input: stateCarrier,
    output: resultCarrier,
    programLocusRef: "locus://abg/consensus/project-result/root@5",
    stageRole: "project_result",
    fibre: "F_D",
    armId: "arm://abg/consensus/project-result/root@5",
    compositionRef: null,
    vectorIndex: 1,
    judgmentPredicateRef: CONSENSUS_IDS.projectorPredicateRef,
    resultBearing: false,
    requirement: executableRequirement(
      CONSENSUS_IDS.projectorImplementationBindingRef,
      CONSENSUS_IDS.stateContractRef,
      CONSENSUS_IDS.resultContractRef,
    ),
  });
  const rootGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: CONSENSUS_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [CONSENSUS_IDS.invocationContractRef],
      provides: [CONSENSUS_IDS.resultContractRef],
      carries: [
        CONSENSUS_IDS.stateContractRef,
        CONSENSUS_IDS.findingsContractRef,
        CONSENSUS_IDS.roundOutcomeContractRef,
      ],
    },
    inputs: [CONSENSUS_IDS.invocationContractRef],
    outputs: [CONSENSUS_IDS.resultContractRef],
    template: {
      kind: "inline_graph",
      graphRef: CONSENSUS_IDS.graphRef,
      startNodeRef: CONSENSUS_IDS.nodeRef,
      terminalNodeRefs: [CONSENSUS_IDS.nodeRef],
      nodes: [{
        nodeRef: CONSENSUS_IDS.nodeRef,
        nodeKind: "c_locus",
        term: C.compose(
          C.compose(initializerLeaf, workflow.C(roundLoopRef)),
          projectorLeaf,
        ),
      }],
      edges: [],
      applications: [],
    },
    effects: [],
    declarations: {
      "abg.compute_regime": "F_D+F_P",
      "abg.closure_contract": CONSENSUS_IDS.rootClosureContractRef,
      "abg.evidence_contract": CONSENSUS_IDS.evidenceContractRef,
      "abg.judgment_contract": CONSENSUS_IDS.judgmentContractRef,
      "abg.judgment_predicate": CONSENSUS_IDS.rootWorkflowPredicateRef,
      "abg.transition_contract": CONSENSUS_IDS.transitionContractRef,
      "abg.owner": CONSENSUS_IDS.ownerRef,
    },
    tags: ["abiogenesis", "system", "consensus", "direct-gtl"],
  };
  const roundEvaluator = C.of({
    input: stateCarrier,
    output: stateCarrier,
    programLocusRef: CONSENSUS_IDS.roundLoopNodeRef,
    stageRole: "round_termination",
    fibre: "F_D",
    armId: "arm://abg/consensus/round-termination@5",
    compositionRef: recursion.applicationRef,
    vectorIndex: 0,
    judgmentPredicateRef: CONSENSUS_IDS.roundEvaluatorPredicateRef,
    resultBearing: true,
    requirement: executableRequirement(
      CONSENSUS_IDS.roundEvaluatorImplementationBindingRef,
      CONSENSUS_IDS.stateContractRef,
      CONSENSUS_IDS.stateContractRef,
    ),
  });
  const roundLoopGraphFunction: GraphFunction = {
    ...leafGraphFunction({
      name: CONSENSUS_IDS.roundLoopGraphFunctionRef,
      graphRef: CONSENSUS_IDS.roundLoopGraphRef,
      nodeRef: CONSENSUS_IDS.roundLoopNodeRef,
      inputContractRef: CONSENSUS_IDS.stateContractRef,
      outputContractRef: CONSENSUS_IDS.stateContractRef,
      bindingRef: CONSENSUS_IDS.roundEvaluatorImplementationBindingRef,
      predicateRef: CONSENSUS_IDS.roundEvaluatorPredicateRef,
      stageRole: "round_termination",
      fibre: "F_D",
      closureContractRef: CONSENSUS_IDS.childClosureContractRef,
    }),
    template: {
      kind: "inline_graph",
      graphRef: CONSENSUS_IDS.roundLoopGraphRef,
      startNodeRef: CONSENSUS_IDS.roundLoopNodeRef,
      terminalNodeRefs: [CONSENSUS_IDS.roundLoopNodeRef],
      nodes: [{
        nodeRef: CONSENSUS_IDS.roundLoopNodeRef,
        nodeKind: "c_locus",
        term: roundEvaluator,
      }],
      edges: [],
      applications: [recursion],
    },
  };
  const roundGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: CONSENSUS_IDS.roundGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [CONSENSUS_IDS.stateContractRef],
      provides: [CONSENSUS_IDS.stateContractRef],
      carries: [
        CONSENSUS_IDS.reviewerTaskContractRef,
        CONSENSUS_IDS.findingsContractRef,
        CONSENSUS_IDS.findingsVectorContractRef,
      ],
    },
    inputs: [CONSENSUS_IDS.stateContractRef],
    outputs: [CONSENSUS_IDS.stateContractRef],
    template: {
      kind: "inline_graph",
      graphRef: CONSENSUS_IDS.roundGraphRef,
      startNodeRef: CONSENSUS_IDS.roundNodeRef,
      terminalNodeRefs: [CONSENSUS_IDS.roundNodeRef],
      nodes: [{
        nodeRef: CONSENSUS_IDS.roundNodeRef,
        nodeKind: "c_locus",
        term: C.compose(
          C.batch(
            [workflow.C(reviewerRef)],
            CONSENSUS_IDS.roundBatchRef,
            { input: stateCarrier, output: findingsVectorCarrier },
          ),
          workflow.C(reducerRef),
        ),
      }],
      edges: [],
      applications: [fanOut, fanIn],
    },
    effects: [],
    declarations: {
      "abg.compute_regime": "F_D+F_P",
      "abg.closure_contract": CONSENSUS_IDS.childClosureContractRef,
      "abg.child_closure_contract": CONSENSUS_IDS.childClosureContractRef,
      "abg.evidence_contract": CONSENSUS_IDS.evidenceContractRef,
      "abg.judgment_contract": CONSENSUS_IDS.judgmentContractRef,
      "abg.judgment_predicate": CONSENSUS_IDS.roundWorkflowPredicateRef,
      "abg.transition_contract": CONSENSUS_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "consensus", "round", "fan-out", "fan-in"],
  };
  const reviewerGraphFunction = leafGraphFunction({
    name: CONSENSUS_IDS.reviewerGraphFunctionRef,
    graphRef: CONSENSUS_IDS.reviewerGraphRef,
    nodeRef: CONSENSUS_IDS.reviewerNodeRef,
    inputContractRef: CONSENSUS_IDS.reviewerTaskContractRef,
    outputContractRef: CONSENSUS_IDS.findingsContractRef,
    bindingRef: CONSENSUS_IDS.reviewerImplementationBindingRef,
    predicateRef: CONSENSUS_IDS.reviewerPredicateRef,
    stageRole: "reviewer_assessment",
    fibre: "F_P",
    closureContractRef: CONSENSUS_IDS.reviewerClosureContractRef,
    retryBudget: 2,
  });
  const reducerGraphFunction = leafGraphFunction({
    name: CONSENSUS_IDS.reducerGraphFunctionRef,
    graphRef: CONSENSUS_IDS.reducerGraphRef,
    nodeRef: CONSENSUS_IDS.reducerNodeRef,
    inputContractRef: CONSENSUS_IDS.findingsVectorContractRef,
    outputContractRef: CONSENSUS_IDS.stateContractRef,
    bindingRef: CONSENSUS_IDS.reducerImplementationBindingRef,
    predicateRef: CONSENSUS_IDS.reducerPredicateRef,
    stageRole: "round_reduction",
    fibre: "F_D",
    closureContractRef: CONSENSUS_IDS.childClosureContractRef,
  });
  const projectorGraphFunction = leafGraphFunction({
    name: CONSENSUS_IDS.projectorGraphFunctionRef,
    graphRef: CONSENSUS_IDS.projectorGraphRef,
    nodeRef: CONSENSUS_IDS.projectorNodeRef,
    inputContractRef: CONSENSUS_IDS.stateContractRef,
    outputContractRef: CONSENSUS_IDS.resultContractRef,
    bindingRef: CONSENSUS_IDS.projectorImplementationBindingRef,
    predicateRef: CONSENSUS_IDS.projectorPredicateRef,
    stageRole: "result_projection",
    fibre: "F_D",
    closureContractRef: CONSENSUS_IDS.resultClosureContractRef,
  });
  const escalationDecisionCarrier = cCarrier<ConsensusEscalationDecision>(
    CONSENSUS_IDS.escalationDecisionContractRef,
  );
  const escalationRequestCarrier = cCarrier<ConsensusResultCandidate>(
    CONSENSUS_IDS.escalationRequestContractRef,
  );
  const escalationFinalizerRef = cGraphFunctionRef({
    graphFunctionRef: CONSENSUS_IDS.escalationFinalizerGraphFunctionRef,
    input: escalationDecisionCarrier,
    output: resultCarrier,
  });
  const escalationGraphFunction: GraphFunction = {
    kind: "graph_function",
    name: CONSENSUS_IDS.escalationGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [CONSENSUS_IDS.escalationRequestContractRef],
      provides: [CONSENSUS_IDS.resultContractRef],
      carries: [CONSENSUS_IDS.escalationDecisionContractRef],
    },
    inputs: [CONSENSUS_IDS.escalationRequestContractRef],
    outputs: [CONSENSUS_IDS.resultContractRef],
    template: {
      kind: "inline_graph",
      graphRef: CONSENSUS_IDS.escalationGraphRef,
      startNodeRef: CONSENSUS_IDS.escalationNodeRef,
      terminalNodeRefs: [CONSENSUS_IDS.escalationNodeRef],
      nodes: [{
        nodeRef: CONSENSUS_IDS.escalationNodeRef,
        nodeKind: "c_locus",
        term: C.compose(
          C.of({
            input: escalationRequestCarrier,
            output: escalationDecisionCarrier,
            programLocusRef: CONSENSUS_IDS.escalationNodeRef,
            stageRole: "consensus_fh_escalation",
            fibre: "F_H",
            armId: "arm://abg/consensus/fh-escalation@5",
            compositionRef: null,
            vectorIndex: 0,
            judgmentPredicateRef:
              CONSENSUS_IDS.escalationFinalizerPredicateRef,
            resultBearing: false,
            requirement: {
              kind: "interaction_leaf_requirement",
              interactionKind: CONSENSUS_IDS.interactionKind,
              actorCapabilityRef: CONSENSUS_IDS.actorCapabilityRef,
              requestContractRef:
                CONSENSUS_IDS.escalationRequestContractRef,
              responseContractRef:
                CONSENSUS_IDS.escalationDecisionContractRef,
              continuationContractRef:
                CONSENSUS_IDS.continuationContractRef,
            },
          }),
          workflow.C(escalationFinalizerRef),
        ),
      }],
      edges: [],
      applications: [],
    },
    effects: ["effect://abg/consensus/human-resolution@5"],
    declarations: {
      "abg.compute_regime": "F_H+F_D",
      "abg.closure_contract": CONSENSUS_IDS.escalationClosureContractRef,
      "abg.evidence_contract": CONSENSUS_IDS.evidenceContractRef,
      "abg.judgment_contract": CONSENSUS_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        CONSENSUS_IDS.escalationFinalizerPredicateRef,
      "abg.transition_contract": CONSENSUS_IDS.transitionContractRef,
    },
    tags: ["abiogenesis", "consensus", "fh-escalation"],
  };
  const escalationFinalizerGraphFunction = leafGraphFunction({
    name: CONSENSUS_IDS.escalationFinalizerGraphFunctionRef,
    graphRef: CONSENSUS_IDS.escalationFinalizerGraphRef,
    nodeRef: CONSENSUS_IDS.escalationFinalizerNodeRef,
    inputContractRef: CONSENSUS_IDS.escalationDecisionContractRef,
    outputContractRef: CONSENSUS_IDS.resultContractRef,
    bindingRef: CONSENSUS_IDS.escalationFinalizerImplementationBindingRef,
    predicateRef: CONSENSUS_IDS.escalationFinalizerPredicateRef,
    stageRole: "fh_escalation_finalization",
    fibre: "F_D",
    closureContractRef: CONSENSUS_IDS.resultClosureContractRef,
  });
  const graphFunctions = [
    rootGraphFunction,
    roundLoopGraphFunction,
    roundGraphFunction,
    reviewerGraphFunction,
    reducerGraphFunction,
    projectorGraphFunction,
    escalationGraphFunction,
    escalationFinalizerGraphFunction,
  ];
  const program: GtlProgram = {
    kind: "gtl_program",
    programRef: CONSENSUS_IDS.programRef,
    version: "5.0.0",
    moduleRef: CONSENSUS_IDS.moduleRef,
    starts: [{
      startRef: CONSENSUS_IDS.startRef,
      graphFunctionRef: CONSENSUS_IDS.graphFunctionRef,
    }, {
      startRef: CONSENSUS_IDS.escalationStartRef,
      graphFunctionRef: CONSENSUS_IDS.escalationGraphFunctionRef,
    }],
    callableMembership: graphFunctions.map((graphFunction) => graphFunction.name),
    closureContractRef: CONSENSUS_IDS.rootClosureContractRef,
    policies: {
      "abg.root_mode": "direct",
      "abg.owner": CONSENSUS_IDS.ownerRef,
      "abg.consensus.round_budget_max": "4",
    },
    publicAssetTargets: [{
      kind: "program_public_asset_target",
      handle: CONSENSUS_IDS.handle,
      assetRef: CONSENSUS_IDS.graphFunctionRef,
      startRef: CONSENSUS_IDS.startRef,
    }],
  };
  const contracts = [
    [CONSENSUS_IDS.subjectContractRef, "input", "consensus_subject"],
    [CONSENSUS_IDS.panelContractRef, "input", "consensus_panel"],
    [CONSENSUS_IDS.profileContractRef, "input", "consensus_reviewer_profile"],
    [CONSENSUS_IDS.findingsContractRef, "output", "review_findings"],
    [CONSENSUS_IDS.rulingsContractRef, "output", "review_rulings"],
    [CONSENSUS_IDS.policyContractRef, "input", "consensus_round_policy"],
    [CONSENSUS_IDS.roundOutcomeContractRef, "output", "consensus_round_outcome"],
    [CONSENSUS_IDS.resultContractRef, "output", "consensus_result"],
    [CONSENSUS_IDS.ticketProjectionContractRef, "output", "ticket_consensus_projection"],
    [CONSENSUS_IDS.invocationContractRef, "input", "consensus_invocation"],
    [CONSENSUS_IDS.stateContractRef, "output", "consensus_round_state"],
    [CONSENSUS_IDS.reviewerTaskContractRef, "input", "consensus_reviewer_task"],
    [CONSENSUS_IDS.findingsVectorContractRef, "output", "consensus_findings_vector"],
    [CONSENSUS_IDS.escalationRequestContractRef, "input", "consensus_result"],
    [CONSENSUS_IDS.escalationDecisionContractRef, "output", "consensus_escalation_decision"],
    [CONSENSUS_IDS.failureContractRef, "failure", "consensus_failure"],
    [CONSENSUS_IDS.refusalContractRef, "refusal", "consensus_refusal"],
    [CONSENSUS_IDS.evidenceContractRef, "evidence", "probabilistic_transport_evidence_candidate"],
    [CONSENSUS_IDS.judgmentContractRef, "judgment", "consensus_judgment"],
    [CONSENSUS_IDS.transitionContractRef, "transition", "consensus_transition"],
    [CONSENSUS_IDS.continuationContractRef, "transition", "consensus_continuation"],
  ].map(([contractRef, contractKind, valueKind]) => ({
    contractRef,
    contractVersion: "5.0.0",
    contractKind,
    valueKind,
  } as ContractDeclaration));
  const binding = (
    bindingRef: string,
    implementationRef: string,
    namedSymbol: string,
    computeRegime: "F_D" | "F_P",
    inputContractRef: string,
    outputContractRef: string,
  ): ImplementationBinding => ({
    kind: "implementation_binding",
    bindingRef,
    implementationRef,
    packageName: artifact.packageName,
    packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/consensus.js",
    namedSymbol,
    computeRegime,
    inputContractRef,
    outputContractRef,
    failureContractRef: CONSENSUS_IDS.failureContractRef,
    refusalContractRef: CONSENSUS_IDS.refusalContractRef,
  });
  const implementationBindings = [
    binding(
      CONSENSUS_IDS.initializerImplementationBindingRef,
      CONSENSUS_IDS.initializerImplementationRef,
      "realizeConsensusInitialization",
      "F_D",
      CONSENSUS_IDS.invocationContractRef,
      CONSENSUS_IDS.stateContractRef,
    ),
    binding(
      CONSENSUS_IDS.roundEvaluatorImplementationBindingRef,
      CONSENSUS_IDS.roundEvaluatorImplementationRef,
      "realizeConsensusRoundEvaluation",
      "F_D",
      CONSENSUS_IDS.stateContractRef,
      CONSENSUS_IDS.stateContractRef,
    ),
    binding(
      CONSENSUS_IDS.reviewerImplementationBindingRef,
      CONSENSUS_IDS.reviewerImplementationRef,
      "realizeConsensusReviewer",
      "F_P",
      CONSENSUS_IDS.reviewerTaskContractRef,
      CONSENSUS_IDS.findingsContractRef,
    ),
    binding(
      CONSENSUS_IDS.reducerImplementationBindingRef,
      CONSENSUS_IDS.reducerImplementationRef,
      "realizeConsensusReduction",
      "F_D",
      CONSENSUS_IDS.findingsVectorContractRef,
      CONSENSUS_IDS.stateContractRef,
    ),
    binding(
      CONSENSUS_IDS.projectorImplementationBindingRef,
      CONSENSUS_IDS.projectorImplementationRef,
      "realizeConsensusResultProjection",
      "F_D",
      CONSENSUS_IDS.stateContractRef,
      CONSENSUS_IDS.resultContractRef,
    ),
    binding(
      CONSENSUS_IDS.escalationFinalizerImplementationBindingRef,
      CONSENSUS_IDS.escalationFinalizerImplementationRef,
      "realizeConsensusEscalationFinalization",
      "F_D",
      CONSENSUS_IDS.escalationDecisionContractRef,
      CONSENSUS_IDS.resultContractRef,
    ),
  ];
  const closureContracts = [
    closure(
      CONSENSUS_IDS.rootClosureContractRef,
      "run",
      CONSENSUS_IDS.resultContractRef,
    ),
    closure(
      CONSENSUS_IDS.childClosureContractRef,
      "graph_call",
      CONSENSUS_IDS.stateContractRef,
    ),
    closure(
      CONSENSUS_IDS.reviewerClosureContractRef,
      "graph_call",
      CONSENSUS_IDS.findingsContractRef,
    ),
    closure(
      CONSENSUS_IDS.resultClosureContractRef,
      "graph_call",
      CONSENSUS_IDS.resultContractRef,
    ),
    closure(
      CONSENSUS_IDS.escalationClosureContractRef,
      "run",
      CONSENSUS_IDS.resultContractRef,
    ),
  ];
  const contribution = (
    graphFunctionRef: string,
    handle = graphFunctionRef,
  ): CatalogContribution => ({
    handle,
    kind: "graph_function",
    declarationOrContractRef: graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [CONSENSUS_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest],
  });
  const contributions = graphFunctions.map((graphFunction) =>
    contribution(
      graphFunction.name,
      graphFunction.name === CONSENSUS_IDS.graphFunctionRef
        ? CONSENSUS_IDS.handle
        : graphFunction.name,
    ));
  return deepFreeze({
    kind: "module_publication" as const,
    moduleRef: CONSENSUS_IDS.moduleRef,
    moduleVersion: "5.0.0" as const,
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: "descriptor://abg/consensus/module@5",
    contributionManifestRef:
      "contribution-manifest://abg/consensus/module@5",
    productSemanticsBinding: {
      kind: "product_semantics_binding" as const,
      bindingRef: CONSENSUS_IDS.productSemanticsBindingRef,
      packageName: artifact.packageName,
      packageVersion: artifact.packageVersion,
      modulePath: "build/code/src/implementation/product_semantics.js",
      namedSymbol: "ABI5_SYSTEM_PRODUCT_SEMANTICS",
    },
    contracts,
    evaluators: [evaluatorDeclaration({
      name: CONSENSUS_IDS.roundEvaluatorRef,
      regime: "F_D",
      description: "Evaluates the declared Consensus round terminal field.",
      binding: CONSENSUS_IDS.roundEvaluatorImplementationRef,
      consumedFieldRefs: ["$.terminal"],
      tags: ["consensus", "bounded", "recursion"],
    })],
    rules: [ruleDeclaration({
      name: CONSENSUS_IDS.roundTerminationRuleRef,
      kind: "boolean_field_termination",
      config: {
        fieldRef: "$.terminal",
        terminalValue: true,
      },
      tags: ["consensus", "bounded", "recursion"],
    })],
    implementationBindings,
    closureContracts,
    programs: [program],
    graphFunctions,
    contributions,
  });
}
