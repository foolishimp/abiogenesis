import type { JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { ContractDeclaration, ModulePublication, RootModuleArtifactBasis } from "./contracts.js";
import { CONSENSUS_CLASSIFICATION_VALUES, CONSENSUS_FH_DECISION_VALUES, CONSENSUS_ROUND_OUTCOME_VALUES, REVIEW_RULING_KIND_VALUES } from "./consensus_schema.js";
export { CONSENSUS_CLASSIFICATION_VALUES, CONSENSUS_FH_DECISION_VALUES, CONSENSUS_PUBLIC_SCHEMA, CONSENSUS_REVIEWER_RESPONSE_SCHEMA, CONSENSUS_ROUND_OUTCOME_VALUES, CONSENSUS_SCHEMA_ASSET_BINDINGS, CONSENSUS_SCHEMA_REQUIRED_KEYS, CONSENSUS_SUBMITTER_RESPONSE_SCHEMA, isConsensusReviewerCandidate, isConsensusSubmitterResponseCandidate, REVIEW_RULING_KIND_VALUES, type ConsensusReviewerCandidate, type ConsensusSubmitterResponseCandidate, } from "./consensus_schema.js";
export type ReviewRulingKind = (typeof REVIEW_RULING_KIND_VALUES)[number];
export type ConsensusRoundOutcomeValue = (typeof CONSENSUS_ROUND_OUTCOME_VALUES)[number];
export type ConsensusClassification = (typeof CONSENSUS_CLASSIFICATION_VALUES)[number];
export type ConsensusFhDecision = (typeof CONSENSUS_FH_DECISION_VALUES)[number];
export type ConsensusRole = "reviewer" | "submitter";
export declare const CONSENSUS_IDS: Readonly<{
    handle: "gtl://abg/consensus/submitter-reviewer-rounds";
    ownerRef: "owner://abg/substrate";
    moduleRef: "module://abg/consensus@5";
    oneSurfaceProgramRef: "program://abg/system/consensus-one-surface@5";
    oneSurfaceStartRef: "start://abg/consensus/one-surface@5";
    oneSurfaceGraphFunctionRef: "graph-function://abg/consensus/one-surface@5";
    oneSurfaceGraphRef: "graph://abg/consensus/one-surface@5";
    oneSurfaceNodeRef: "locus://abg/consensus/one-surface@5";
    oneSurfaceCompositionRef: "composition://abg/consensus/one-surface@5";
    synthesizeModelLocusRef: "locus://abg/consensus/one-surface/synthesize-model@5";
    evalGapLocusRef: "locus://abg/consensus/one-surface/eval-gap@5";
    evaluateNextLocusRef: "locus://abg/consensus/one-surface/evaluate-next@5";
    evaluateActionLocusRef: "locus://abg/consensus/one-surface/evaluate-action@5";
    refreshModelLocusRef: "locus://abg/consensus/one-surface/refresh-model@5";
    refreshGapLocusRef: "locus://abg/consensus/one-surface/refresh-gap@5";
    refreshEvaluateNextLocusRef: "locus://abg/consensus/one-surface/refresh-evaluate-next@5";
    synthesizeModelAuthorityRef: "authority://abg/consensus/synthesize-model@5";
    evalGapAuthorityRef: "authority://abg/consensus/eval-gap@5";
    evaluateNextAuthorityRef: "authority://abg/consensus/evaluate-next@5";
    evaluateActionAuthorityRef: "authority://abg/consensus/evaluate-action@5";
    consensusActionRef: "action://abg/consensus/invoke@5";
    consensusObligationRef: "obligation://abg/consensus/result@5";
    consensusInputAssetRef: "asset://abg/consensus/invocation@5";
    consensusOutputAssetRef: "asset://abg/consensus/result@5";
    consensusExpectedDeltaRef: "delta-expectation://abg/consensus/result@5";
    consensusProgressConditionRef: "condition://abg/consensus/result-admitted@5";
    consensusStopConditionRef: "condition://abg/consensus/non-close@5";
    consensusTargetOutcomeRef: "outcome://abg/consensus/ordinary-path-result@5";
    consensusPrioritySchemeRef: "priority://abg/consensus/canonical-callable-first@5";
    consensusClosurePolicyRef: "policy://abg/consensus/complete-evidence-refresh@5";
    graphFunctionRef: "graph-function://abg/consensus/submitter-reviewer-rounds";
    graphRef: "graph://abg/consensus/submitter-reviewer-rounds@5";
    nodeRef: "locus://abg/consensus/root@5";
    roundLoopGraphFunctionRef: "graph-function://abg/consensus/round-loop@5";
    roundLoopGraphRef: "graph://abg/consensus/round-loop@5";
    roundLoopNodeRef: "locus://abg/consensus/round-loop@5";
    roundGraphFunctionRef: "graph-function://abg/consensus/round@5";
    roundGraphRef: "graph://abg/consensus/round@5";
    roundNodeRef: "locus://abg/consensus/round@5";
    reviewerGraphFunctionRef: "graph-function://abg/consensus/reviewer@5";
    reviewerGraphRef: "graph://abg/consensus/reviewer@5";
    reviewerNodeRef: "locus://abg/consensus/reviewer@5";
    submitterGraphFunctionRef: "graph-function://abg/consensus/submitter@5";
    submitterGraphRef: "graph://abg/consensus/submitter@5";
    submitterNodeRef: "locus://abg/consensus/submitter@5";
    submitterTaskGraphFunctionRef: "graph-function://abg/consensus/prepare-submitter-task@5";
    submitterTaskGraphRef: "graph://abg/consensus/prepare-submitter-task@5";
    submitterTaskNodeRef: "locus://abg/consensus/prepare-submitter-task@5";
    roundReducerGraphFunctionRef: "graph-function://abg/consensus/submitter-reviewer-fold@5";
    roundReducerGraphRef: "graph://abg/consensus/submitter-reviewer-fold@5";
    reducerGraphFunctionRef: "graph-function://abg/consensus/reducer@5";
    reducerGraphRef: "graph://abg/consensus/reducer@5";
    reducerNodeRef: "locus://abg/consensus/reducer@5";
    finalizationLoopGraphFunctionRef: "graph-function://abg/consensus/finalization-loop@5";
    finalizationLoopGraphRef: "graph://abg/consensus/finalization-loop@5";
    finalizationLoopNodeRef: "locus://abg/consensus/finalization-loop@5";
    finalizationPreparationNodeRef: "locus://abg/consensus/prepare-finalization/root@5";
    projectorGraphFunctionRef: "graph-function://abg/consensus/project-result@5";
    projectorGraphRef: "graph://abg/consensus/project-result@5";
    projectorNodeRef: "locus://abg/consensus/project-result@5";
    escalationGraphFunctionRef: "graph-function://abg/consensus/fh-escalation@5";
    escalationGraphRef: "graph://abg/consensus/fh-escalation@5";
    escalationNodeRef: "locus://abg/consensus/fh-escalation@5";
    escalationFinalizerGraphFunctionRef: "graph-function://abg/consensus/fh-escalation-finalizer@5";
    escalationFinalizerGraphRef: "graph://abg/consensus/fh-escalation-finalizer@5";
    escalationFinalizerNodeRef: "locus://abg/consensus/fh-escalation-finalizer@5";
    subjectContractRef: "contract://abg/schema/consensus-subject@5";
    subjectMaterializationContractRef: "contract://abg/consensus/subject-materialization@5";
    panelContractRef: "contract://abg/schema/consensus-panel@5";
    profileContractRef: "contract://abg/schema/consensus-reviewer-profile@5";
    reviewerInstructionContractRef: "contract://abg/consensus/reviewer-instruction@5";
    submitterProfileContractRef: "contract://abg/schema/consensus-submitter-profile@5";
    submitterInstructionContractRef: "contract://abg/consensus/submitter-instruction@5";
    submitterTaskContractRef: "contract://abg/consensus/submitter-task@5";
    submitterResponseContractRef: "contract://abg/consensus/submitter-response@5";
    findingsContractRef: "contract://abg/schema/review-findings@5";
    rulingsContractRef: "contract://abg/schema/review-rulings@5";
    rulingOverlayContractRef: "contract://abg/schema/consensus-ruling-overlay@5";
    policyContractRef: "contract://abg/schema/consensus-round-policy@5";
    roundOutcomeContractRef: "contract://abg/schema/consensus-round-outcome@5";
    resultCandidateContractRef: "contract://abg/consensus/result-candidate@5";
    resultContractRef: "contract://abg/schema/consensus-result@5";
    ticketProjectionContractRef: "contract://abg/schema/ticket-consensus-projection@5";
    invocationContractRef: "contract://abg/consensus/invocation@5";
    observationContractRef: "contract://abg/consensus/observation-snapshot@5";
    modelContractRef: "contract://abg/consensus/model-snapshot@5";
    nextActionBasisContractRef: "contract://abg/consensus/next-action-basis@5";
    nextActionContractRef: "contract://abg/consensus/next-action-projection@5";
    actionEvaluationBasisContractRef: "contract://abg/consensus/action-evaluation-basis@5";
    actionEvaluationContractRef: "contract://abg/consensus/action-evaluation@5";
    stateContractRef: "contract://abg/consensus/round-state@5";
    resolutionContractRef: "contract://abg/consensus/resolution@5";
    reviewerTaskContractRef: "contract://abg/consensus/reviewer-task@5";
    findingsVectorContractRef: "contract://abg/consensus/findings-vector@5";
    escalationDecisionContractRef: "contract://abg/consensus/fh-escalation-decision@5";
    escalationRequestContractRef: "contract://abg/consensus/fh-escalation-request@5";
    failureContractRef: "contract://abg/consensus/failure@5";
    refusalContractRef: "contract://abg/consensus/refusal@5";
    evidenceContractRef: "contract://abg/consensus/evidence@5";
    judgmentContractRef: "contract://abg/consensus/judgment@5";
    transitionContractRef: "contract://abg/consensus/transition@5";
    rootClosureContractRef: "closure://abg/consensus/root@5";
    childClosureContractRef: "closure://abg/consensus/child@5";
    reviewerClosureContractRef: "closure://abg/consensus/reviewer@5";
    submitterClosureContractRef: "closure://abg/consensus/submitter@5";
    resultClosureContractRef: "closure://abg/consensus/result@5";
    finalizationClosureContractRef: "closure://abg/consensus/finalization@5";
    oneSurfaceClosureContractRef: "closure://abg/consensus/one-surface@5";
    initializerPredicateRef: "predicate://abg/consensus/initialize@5";
    roundEvaluatorPredicateRef: "predicate://abg/consensus/round-terminal@5";
    rootWorkflowPredicateRef: "predicate://abg/consensus/root-workflow-foldback@5";
    roundWorkflowPredicateRef: "predicate://abg/consensus/round-workflow-foldback@5";
    roundReducerPredicateRef: "predicate://abg/consensus/submitter-reviewer-fold@5";
    roundEvaluatorRef: "evaluator://abg/consensus/round-terminal@5";
    roundTerminationRuleRef: "rule://abg/consensus/round-terminal@5";
    finalizationEvaluatorRef: "evaluator://abg/consensus/finalization-terminal@5";
    finalizationTerminationRuleRef: "rule://abg/consensus/finalization-terminal@5";
    convergenceRuleRef: "rule://abg/consensus/exact-agreement@5";
    disagreementRuleRef: "rule://abg/consensus/material-dispute@5";
    escalationRuleRef: "rule://abg/consensus/unresolved-to-fh@5";
    foldbackContractRef: "contract://abg/consensus/round-foldback@5";
    reviewerPredicateRef: "predicate://abg/consensus/reviewer-attribution@5";
    submitterTaskPredicateRef: "predicate://abg/consensus/prepare-submitter-task@5";
    submitterPredicateRef: "predicate://abg/consensus/submitter-attribution@5";
    reducerPredicateRef: "predicate://abg/consensus/reduce-round@5";
    projectorPredicateRef: "predicate://abg/consensus/project-result@5";
    escalationFinalizerPredicateRef: "predicate://abg/consensus/finalize-fh-escalation@5";
    finalizationPreparationPredicateRef: "predicate://abg/consensus/prepare-finalization@5";
    finalizationEvaluatorPredicateRef: "predicate://abg/consensus/finalization-terminal@5";
    oneSurfacePredicateRef: "predicate://abg/consensus/one-surface-stage@5";
    initializerImplementationBindingRef: "implementation-binding://abg/consensus/initialize@5";
    initializerImplementationRef: "implementation://abg/consensus/initialize@5";
    roundEvaluatorImplementationBindingRef: "implementation-binding://abg/consensus/round-evaluator@5";
    roundEvaluatorImplementationRef: "implementation://abg/consensus/round-evaluator@5";
    reviewerImplementationBindingRef: "implementation-binding://abg/consensus/reviewer@5";
    reviewerImplementationRef: "implementation://abg/consensus/reviewer@5";
    submitterTaskImplementationBindingRef: "implementation-binding://abg/consensus/prepare-submitter-task@5";
    submitterTaskImplementationRef: "implementation://abg/consensus/prepare-submitter-task@5";
    submitterImplementationBindingRef: "implementation-binding://abg/consensus/submitter@5";
    submitterImplementationRef: "implementation://abg/consensus/submitter@5";
    reducerImplementationBindingRef: "implementation-binding://abg/consensus/reducer@5";
    reducerImplementationRef: "implementation://abg/consensus/reducer@5";
    finalizationPreparationImplementationBindingRef: "implementation-binding://abg/consensus/prepare-finalization@5";
    finalizationPreparationImplementationRef: "implementation://abg/consensus/prepare-finalization@5";
    finalizationEvaluatorImplementationBindingRef: "implementation-binding://abg/consensus/finalization-evaluator@5";
    finalizationEvaluatorImplementationRef: "implementation://abg/consensus/finalization-evaluator@5";
    projectorImplementationBindingRef: "implementation-binding://abg/consensus/project-result@5";
    projectorImplementationRef: "implementation://abg/consensus/project-result@5";
    escalationFinalizerImplementationBindingRef: "implementation-binding://abg/consensus/finalize-fh-escalation@5";
    escalationFinalizerImplementationRef: "implementation://abg/consensus/finalize-fh-escalation@5";
    synthesizeModelImplementationBindingRef: "implementation-binding://abg/consensus/synthesize-model@5";
    synthesizeModelImplementationRef: "implementation://abg/consensus/synthesize-model@5";
    evalGapImplementationBindingRef: "implementation-binding://abg/consensus/eval-gap@5";
    evalGapImplementationRef: "implementation://abg/consensus/eval-gap@5";
    evaluateNextImplementationBindingRef: "implementation-binding://abg/consensus/evaluate-next@5";
    evaluateNextImplementationRef: "implementation://abg/consensus/evaluate-next@5";
    evaluateActionImplementationBindingRef: "implementation-binding://abg/consensus/evaluate-action@5";
    evaluateActionImplementationRef: "implementation://abg/consensus/evaluate-action@5";
    refreshModelImplementationBindingRef: "implementation-binding://abg/consensus/refresh-model@5";
    refreshModelImplementationRef: "implementation://abg/consensus/refresh-model@5";
    refreshGapImplementationBindingRef: "implementation-binding://abg/consensus/refresh-gap@5";
    refreshGapImplementationRef: "implementation://abg/consensus/refresh-gap@5";
    refreshEvaluateNextImplementationBindingRef: "implementation-binding://abg/consensus/refresh-evaluate-next@5";
    refreshEvaluateNextImplementationRef: "implementation://abg/consensus/refresh-evaluate-next@5";
    roundApplicationRef: "application://abg/consensus/round-loop@5";
    finalizationApplicationRef: "application://abg/consensus/finalization-loop@5";
    roundBatchRef: "batch://abg/consensus/reviewers@5";
    interactionKind: "consensus_resolution";
    actorCapabilityRef: "capability://abg/consensus/fh-resolution@5";
    continuationContractRef: "contract://abg/consensus/continuation@5";
    productSemanticsBindingRef: "product-semantics://abiogenesis/system@5";
    subjectCatalogHandle: "catalog://abg/consensus/subject";
    reviewerProfileCatalogHandle: "catalog://abg/consensus/profile/reviewer";
    reviewerInstructionCatalogHandle: "catalog://abg/consensus/instruction/reviewer";
    submitterProfileCatalogHandle: "catalog://abg/consensus/profile/submitter";
    submitterInstructionCatalogHandle: "catalog://abg/consensus/instruction/submitter";
    policyCatalogHandle: "catalog://abg/consensus/policy/round";
    rulingOverlayCatalogHandle: "catalog://abg/consensus/overlay/ruling";
    rulingVocabularyRef: "abg.vocabulary.review-ruling-kind";
    roundOutcomeVocabularyRef: "abg.vocabulary.consensus-round-outcome";
    fhDecisionVocabularyRef: "abg.vocabulary.consensus-fh-decision";
}>;
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
export interface ConsensusSubjectMaterialization {
    readonly kind: "consensus_subject_materialization";
    readonly schemaVersion: "5.0.0";
    readonly materializationRef: string;
    readonly subjectContractRef: string;
    readonly subjectRef: string;
    readonly contentDigest: Sha256Digest;
    readonly mediaType: "text/markdown; charset=utf-8";
    readonly content: string;
}
export interface ConsensusReviewerInstruction {
    readonly kind: "consensus_reviewer_instruction";
    readonly schemaVersion: "5.0.0";
    readonly instructionContractRef: string;
    readonly roleContractRef: string;
    readonly instructionDigest: Sha256Digest;
    readonly instructionText: string;
    readonly responseSchema: Readonly<Record<string, JsonValue>>;
}
export interface ConsensusReviewerProfile {
    readonly kind: "consensus_reviewer_profile";
    readonly schemaVersion: "5.0.0";
    readonly profileRef: string;
    readonly roleContractRef: string;
    readonly configurationDigest: Sha256Digest;
    readonly instructionContractRef: string;
    readonly instructionDigest: Sha256Digest;
    readonly resultContractRef: string;
    readonly capabilityRefs: readonly string[];
    readonly actorRef: string;
    readonly workerBindingRef: string;
}
export interface ConsensusSubmitterInstruction {
    readonly kind: "consensus_submitter_instruction";
    readonly schemaVersion: "5.0.0";
    readonly instructionContractRef: string;
    readonly roleContractRef: string;
    readonly instructionDigest: Sha256Digest;
    readonly instructionText: string;
    readonly responseSchema: Readonly<Record<string, JsonValue>>;
}
export interface ConsensusSubmitterProfile {
    readonly kind: "consensus_submitter_profile";
    readonly schemaVersion: "5.0.0";
    readonly profileRef: string;
    readonly roleContractRef: string;
    readonly configurationDigest: Sha256Digest;
    readonly instructionContractRef: string;
    readonly instructionDigest: Sha256Digest;
    readonly resultContractRef: string;
    readonly capabilityRefs: readonly string[];
    readonly actorRef: string;
    readonly workerBindingRef: string;
}
export type ConsensusRoleInstruction = ConsensusReviewerInstruction | ConsensusSubmitterInstruction;
export type ConsensusRoleProfile = ConsensusReviewerProfile | ConsensusSubmitterProfile;
export interface ConsensusPanel {
    readonly kind: "consensus_panel";
    readonly schemaVersion: "5.0.0";
    readonly panelRef: string;
    readonly panelDigest: Sha256Digest;
    readonly profiles: readonly ConsensusReviewerProfile[];
}
export interface ConsensusRulingOverlay {
    readonly kind: "consensus_ruling_overlay";
    readonly schemaVersion: "5.0.0";
    readonly overlayRef: string;
    readonly overlayDigest: Sha256Digest;
    readonly programRef: string;
    readonly graphFunctionRef: string;
    readonly policyContractRef: string;
    readonly disagreementRuleRef: string;
    readonly acceptedFindingRulingKind: Exclude<ReviewRulingKind, "deferment">;
}
export interface ConsensusRoundPolicy {
    readonly kind: "consensus_round_policy";
    readonly schemaVersion: "5.0.0";
    readonly policyRef: string;
    readonly policyDigest: Sha256Digest;
    readonly roundBudget: number;
    readonly convergenceRuleRef: string;
    readonly disagreementRuleRef: string;
    readonly rulingOverlay: ConsensusRulingOverlay | null;
    readonly escalationRuleRef: string;
    readonly foldbackContractRef: string;
}
export interface ConsensusInvocation {
    readonly kind: "consensus_invocation";
    readonly schemaVersion: "5.0.0";
    readonly invocationRef: string;
    readonly subject: ConsensusSubject;
    readonly subjectMaterialization: ConsensusSubjectMaterialization;
    readonly panel: ConsensusPanel;
    readonly instructions: readonly ConsensusReviewerInstruction[];
    readonly submitterProfile: ConsensusSubmitterProfile;
    readonly submitterInstruction: ConsensusSubmitterInstruction;
    readonly policy: ConsensusRoundPolicy;
    readonly transportLane: "closed_prompt_proof" | "worker_executes";
}
export interface ConsensusCatalogApplicationBinding {
    readonly handle: string;
    readonly applicationVariant: "node_type" | "overlay";
    readonly valueRef: string;
    readonly valueDigest: Sha256Digest;
    readonly value: JsonValue;
    readonly nodeTypeTarget: Readonly<{
        readonly kind: "program";
        readonly programRef: string;
    }> | null;
}
export interface ConsensusReviewerTask {
    readonly kind: "consensus_reviewer_task";
    readonly schemaVersion: "5.0.0";
    readonly taskRef: string;
    readonly taskDigest: Sha256Digest;
    readonly invocationRef: string;
    readonly roundRef: string;
    readonly roundOrdinal: number;
    readonly panelPosition: number;
    readonly subject: ConsensusSubject;
    readonly subjectMaterialization: ConsensusSubjectMaterialization;
    readonly panel: ConsensusPanel;
    readonly policy: ConsensusRoundPolicy;
    readonly profile: ConsensusReviewerProfile;
    readonly instruction: ConsensusReviewerInstruction;
    readonly submitterProfile: ConsensusSubmitterProfile;
    readonly submitterInstruction: ConsensusSubmitterInstruction;
    readonly priorRoundRefs: readonly string[];
    readonly priorFindingSetRefs: readonly string[];
    readonly priorRulings: readonly ReviewRuling[];
    readonly priorDissentProfileRefs: readonly string[];
    readonly priorSubmitterResponses: readonly ConsensusSubmitterResponseRecord[];
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
    readonly reviewerTaskRef: string;
    readonly reviewerTaskDigest: Sha256Digest;
    readonly panelRef: string;
    readonly panelPosition: number;
    readonly cCallRef: string;
    readonly cCallAttempt: number;
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
    readonly subjectMaterialization: ConsensusSubjectMaterialization;
    readonly panel: ConsensusPanel;
    readonly instructions: readonly ConsensusReviewerInstruction[];
    readonly submitterProfile: ConsensusSubmitterProfile;
    readonly submitterInstruction: ConsensusSubmitterInstruction;
    readonly policy: ConsensusRoundPolicy;
    readonly transportLane: "closed_prompt_proof" | "worker_executes";
    readonly roundOrdinal: number;
    readonly roundRefs: readonly string[];
    readonly findingSetRefs: readonly string[];
    readonly findingSets: readonly ReviewFindings[];
    readonly submitterResponses: readonly ConsensusSubmitterResponseRecord[];
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
export interface ConsensusSubmitterTask {
    readonly kind: "consensus_submitter_task";
    readonly schemaVersion: "5.0.0";
    readonly invocationRef: string;
    readonly roundRef: string;
    readonly roundOrdinal: number;
    readonly subject: ConsensusSubject;
    readonly subjectMaterialization: ConsensusSubjectMaterialization;
    readonly panel: ConsensusPanel;
    readonly policy: ConsensusRoundPolicy;
    readonly profile: ConsensusSubmitterProfile;
    readonly instruction: ConsensusSubmitterInstruction;
    readonly findingsVector: ConsensusFindingsVector;
    readonly priorRoundRefs: readonly string[];
    readonly priorSubmitterResponseRefs: readonly string[];
    readonly priorEvidenceRefs: readonly string[];
    readonly transportLane: "closed_prompt_proof" | "worker_executes";
}
export type ConsensusRoleTask = ConsensusReviewerTask | ConsensusSubmitterTask;
export interface ConsensusSubmitterResponseRecord {
    readonly invocationRef: string;
    readonly responseRef: string;
    readonly outputDigest: Sha256Digest;
    readonly findingsVectorDigest: Sha256Digest;
    readonly roundRef: string;
    readonly roundOrdinal: number;
    readonly submittingActorRef: string;
    readonly profileRef: string;
    readonly disposition: "acknowledge" | "address_findings" | "dispute_findings";
    readonly responseText: string;
    readonly addressedFindingRefs: readonly string[];
    readonly residualFindingRefs: readonly string[];
    readonly evidenceRefs: readonly string[];
}
export interface ConsensusSubmitterResponse extends ConsensusSubmitterResponseRecord {
    readonly kind: "consensus_submitter_response";
    readonly schemaVersion: "5.0.0";
    readonly configurationDigest: Sha256Digest;
    readonly task: ConsensusSubmitterTask;
}
export type ConsensusRoleOccurrence = ReviewFindings | ConsensusSubmitterResponse;
export interface ConsensusResultCandidate {
    readonly kind: "consensus_result_candidate";
    readonly schemaVersion: "5.0.0";
    readonly subjectRef: string;
    readonly subjectDigest: Sha256Digest;
    readonly panelRef: string;
    readonly policyRef: string;
    readonly roundRefs: readonly string[];
    readonly findingSetRefs: readonly string[];
    readonly submitterResponseRefs: readonly string[];
    readonly rulings: readonly ReviewRuling[];
    readonly classification: ConsensusClassification;
    readonly dissentProfileRefs: readonly string[];
    readonly terminalOutcome: ConsensusRoundOutcome;
    readonly evidenceRefs: readonly string[];
    readonly lineageRefs: readonly string[];
    readonly contractFailureRef: string | null;
}
export interface ConsensusResult extends Omit<ConsensusResultCandidate, "kind"> {
    readonly kind: "consensus_result";
    readonly resultRef: string;
    readonly replayRef: string;
}
export interface ConsensusRoundDecision {
    readonly kind: "consensus_resolution";
    readonly resolutionKind: "round_decision";
    readonly schemaVersion: "5.0.0";
    readonly decisionRef: string;
    readonly decisionDigest: Sha256Digest;
    readonly outcome: ConsensusRoundOutcome;
    readonly result: ConsensusResultCandidate;
    readonly resolutionTerminal: boolean;
}
export interface ConsensusHumanFinalization {
    readonly kind: "consensus_resolution";
    readonly resolutionKind: "human_finalization";
    readonly schemaVersion: "5.0.0";
    readonly finalizationRef: string;
    readonly finalizationDigest: Sha256Digest;
    readonly roundDecision: ConsensusRoundDecision;
    readonly decision: ConsensusFhDecision;
    readonly humanActorRef: string;
    readonly rationaleRef: string;
    readonly result: ConsensusResultCandidate;
    readonly resolutionTerminal: true;
}
export type ConsensusResolution = ConsensusRoundDecision | ConsensusHumanFinalization;
export interface ConsensusEscalationDecision {
    readonly kind: "consensus_escalation_decision";
    readonly schemaVersion: "5.0.0";
    readonly roundDecision: ConsensusRoundDecision;
    readonly decisionRef: string;
    readonly decisionDigest: Sha256Digest;
    readonly decision: ConsensusFhDecision;
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
    readonly submitterResponseRefs: readonly string[];
    readonly rulings: readonly ReviewRuling[];
    readonly classification: ConsensusClassification;
    readonly dissentProfileRefs: readonly string[];
    readonly terminalOutcome: ConsensusRoundOutcome;
    readonly evidenceRefs: readonly string[];
    readonly lineageRefs: readonly string[];
    readonly resultRef: string;
    readonly replayRef: string;
}
export interface ConsensusObservationSnapshot {
    readonly kind: "observation_snapshot";
    readonly schemaVersion: "5.0.0";
    readonly snapshotRef: string;
    readonly snapshotDigest: Sha256Digest;
    readonly workspaceBinding: Readonly<{
        workspaceBindingId: string;
        workspaceBindingDigest: Sha256Digest;
    }>;
    readonly targetOutcomeRef: string;
    readonly targetObligationRefs: readonly string[];
    readonly actionCatalog: Readonly<Record<string, JsonValue>>;
    readonly availableActionRefs: readonly string[];
    readonly constructionState: Readonly<Record<string, JsonValue>> | null;
    readonly consensusInvocation: ConsensusInvocation;
    readonly consensusResultRef: string | null;
    readonly modelRef: string | null;
}
export declare function constructConsensusObservationSnapshot(input: Readonly<{
    workspaceBindingId: string;
    workspaceBindingDigest: Sha256Digest;
    actionCatalog: Readonly<Record<string, JsonValue>>;
    consensusInvocation: Readonly<ConsensusInvocation>;
}>): Readonly<ConsensusObservationSnapshot>;
export declare function isConsensusObservationSnapshot(value: unknown): value is ConsensusObservationSnapshot;
export declare function synthesizeConsensusModel(input: Readonly<ConsensusObservationSnapshot>): Readonly<ConsensusObservationSnapshot>;
export declare function evaluateConsensusGap(input: Readonly<ConsensusObservationSnapshot>): Readonly<Record<string, JsonValue>>;
export declare function isConsensusNextActionBasis(value: unknown): value is Readonly<Record<string, JsonValue>>;
export declare function selectConsensusNextAction(input: Readonly<Record<string, JsonValue>>): Readonly<Record<string, JsonValue>>;
export declare function isConsensusNextActionProjection(value: unknown): value is Readonly<Record<string, JsonValue>>;
export declare function isConsensusActionEvaluationBasis(value: unknown): value is Readonly<Record<string, JsonValue>>;
export declare function evaluateConsensusAction(input: Readonly<Record<string, JsonValue>>): Readonly<Record<string, JsonValue>>;
export declare function isConsensusActionEvaluationProjection(value: unknown): value is Readonly<Record<string, JsonValue>>;
export declare function refreshConsensusModel(input: Readonly<Record<string, JsonValue>>): Readonly<ConsensusObservationSnapshot>;
export declare function refreshConsensusGap(input: Readonly<ConsensusObservationSnapshot>): Readonly<Record<string, JsonValue>>;
export declare function refreshConsensusNextAction(input: Readonly<Record<string, JsonValue>>): Readonly<Record<string, JsonValue>>;
export declare function constructConsensusSubjectMaterialization(input: Readonly<{
    subjectContractRef: string;
    subjectRef: string;
    content: string;
}>): Readonly<ConsensusSubjectMaterialization>;
type ConsensusRoleInstructionInput = {
    readonly role: "reviewer";
    readonly value: Omit<ConsensusReviewerInstruction, "instructionDigest" | "kind" | "schemaVersion">;
} | {
    readonly role: "submitter";
    readonly value: Omit<ConsensusSubmitterInstruction, "instructionDigest" | "kind" | "schemaVersion">;
};
export declare function constructConsensusRoleInstruction(input: ConsensusRoleInstructionInput): Readonly<ConsensusRoleInstruction>;
export declare function constructConsensusReviewerInstruction(input: Omit<ConsensusReviewerInstruction, "instructionDigest" | "kind" | "schemaVersion">): Readonly<ConsensusReviewerInstruction>;
export declare function constructConsensusSubmitterInstruction(input: Omit<ConsensusSubmitterInstruction, "instructionDigest" | "kind" | "schemaVersion">): Readonly<ConsensusSubmitterInstruction>;
type ConsensusRoleProfileInput = {
    readonly role: "reviewer";
    readonly value: Omit<ConsensusReviewerProfile, "configurationDigest" | "kind" | "schemaVersion">;
} | {
    readonly role: "submitter";
    readonly value: Omit<ConsensusSubmitterProfile, "configurationDigest" | "kind" | "schemaVersion">;
};
export declare function constructConsensusRoleProfile(input: ConsensusRoleProfileInput): Readonly<ConsensusRoleProfile>;
export declare function constructConsensusReviewerProfile(input: Omit<ConsensusReviewerProfile, "configurationDigest" | "kind" | "schemaVersion">): Readonly<ConsensusReviewerProfile>;
export declare function constructConsensusSubmitterProfile(input: Omit<ConsensusSubmitterProfile, "configurationDigest" | "kind" | "schemaVersion">): Readonly<ConsensusSubmitterProfile>;
export declare function constructConsensusPanel(panelRef: string, profiles: readonly Readonly<ConsensusReviewerProfile>[]): Readonly<ConsensusPanel>;
export declare function constructConsensusRulingOverlay(input: Omit<ConsensusRulingOverlay, "kind" | "overlayDigest" | "schemaVersion">): Readonly<ConsensusRulingOverlay>;
export declare function constructConsensusRoundPolicy(input: Omit<ConsensusRoundPolicy, "kind" | "policyDigest" | "schemaVersion">): Readonly<ConsensusRoundPolicy>;
export declare function consensusCatalogApplicationBindings(invocation: Readonly<ConsensusInvocation>): readonly Readonly<ConsensusCatalogApplicationBinding>[];
export declare function constructConsensusSubject(input: Omit<ConsensusSubject, "kind" | "schemaVersion">): Readonly<ConsensusSubject>;
export declare function constructConsensusInvocation(input: Omit<ConsensusInvocation, "kind" | "schemaVersion">): Readonly<ConsensusInvocation>;
export declare function isConsensusSubject(value: unknown): value is ConsensusSubject;
export declare function isConsensusSubjectMaterialization(value: unknown): value is ConsensusSubjectMaterialization;
export declare function isConsensusRoleInstruction(role: ConsensusRole, value: unknown): value is ConsensusRoleInstruction;
export declare function isConsensusReviewerInstruction(value: unknown): value is ConsensusReviewerInstruction;
export declare function isConsensusSubmitterInstruction(value: unknown): value is ConsensusSubmitterInstruction;
export declare function isConsensusRoleProfile(role: ConsensusRole, value: unknown): value is ConsensusRoleProfile;
export declare function isConsensusReviewerProfile(value: unknown): value is ConsensusReviewerProfile;
export declare function isConsensusSubmitterProfile(value: unknown): value is ConsensusSubmitterProfile;
export declare function isConsensusPanel(value: unknown): value is ConsensusPanel;
export declare function isConsensusRulingOverlay(value: unknown): value is ConsensusRulingOverlay;
export declare function isConsensusRoundPolicy(value: unknown): value is ConsensusRoundPolicy;
export declare function isConsensusInvocation(value: unknown): value is ConsensusInvocation;
export declare function isReviewFindings(value: unknown): value is ReviewFindings;
export declare function isReviewRuling(value: unknown): value is ReviewRuling;
export declare function isReviewRulings(value: unknown): value is readonly ReviewRuling[];
export declare function isConsensusRoundOutcome(value: unknown): value is ConsensusRoundOutcome;
export declare function isConsensusRoundState(value: unknown): value is ConsensusRoundState;
export declare function isConsensusFindingsVector(value: unknown): value is ConsensusFindingsVector;
export declare function isConsensusSubmitterResponseRecord(value: unknown): value is ConsensusSubmitterResponseRecord;
export declare function isConsensusRoleTask(role: ConsensusRole, value: unknown): value is ConsensusRoleTask;
export declare function isConsensusReviewerTask(value: unknown): value is ConsensusReviewerTask;
export declare function isConsensusSubmitterTask(value: unknown): value is ConsensusSubmitterTask;
export declare function isConsensusSubmitterResponse(value: unknown): value is ConsensusSubmitterResponse;
export declare function isConsensusRoleOccurrence(role: ConsensusRole, value: unknown): value is ConsensusRoleOccurrence;
export declare function isConsensusResultCandidate(value: unknown): value is ConsensusResultCandidate;
export declare function bindConsensusReplay(candidate: Readonly<ConsensusResultCandidate>, admittedResultRef: string, replayRef: string): Readonly<ConsensusResult>;
export declare function isConsensusResult(value: unknown): value is ConsensusResult;
export declare function isConsensusRoundDecision(value: unknown): value is ConsensusRoundDecision;
export declare function isConsensusHumanFinalization(value: unknown): value is ConsensusHumanFinalization;
export declare function isConsensusResolution(value: unknown): value is ConsensusResolution;
export declare function isConsensusEscalationRequest(value: unknown): value is ConsensusRoundDecision;
export declare function isConsensusEscalationDecision(value: unknown): value is ConsensusEscalationDecision;
export declare function isTicketConsensusProjection(value: unknown): value is TicketConsensusProjection;
interface ConsensusReviewerRoleTaskBasis {
    readonly role: "reviewer";
    readonly invocation: Readonly<ConsensusInvocation>;
    readonly ordinal: number;
    readonly panelPosition: number;
    readonly profile: Readonly<ConsensusReviewerProfile>;
    readonly priorRoundRefs: readonly string[];
    readonly priorFindingSetRefs: readonly string[];
    readonly priorRulings: readonly ReviewRuling[];
    readonly priorDissentProfileRefs: readonly string[];
    readonly priorSubmitterResponses: readonly ConsensusSubmitterResponseRecord[];
    readonly priorEvidenceRefs: readonly string[];
}
interface ConsensusSubmitterRoleTaskBasis {
    readonly role: "submitter";
    readonly findingsVector: Readonly<ConsensusFindingsVector>;
}
export type ConsensusRoleTaskBasis = ConsensusReviewerRoleTaskBasis | ConsensusSubmitterRoleTaskBasis;
export declare function initializeConsensus(invocation: Readonly<ConsensusInvocation>): Readonly<ConsensusRoundState>;
export declare function constructConsensusRoleTask(basis: Readonly<ConsensusRoleTaskBasis>): Readonly<ConsensusRoleTask>;
export declare function constructConsensusSubmitterTask(vector: Readonly<ConsensusFindingsVector>): Readonly<ConsensusSubmitterTask>;
export declare function reduceConsensusRound(response: Readonly<ConsensusSubmitterResponse>): Readonly<ConsensusRoundState>;
export declare function projectConsensusResult(state: Readonly<ConsensusRoundState>): Readonly<ConsensusResultCandidate>;
export declare function prepareConsensusResolution(state: Readonly<ConsensusRoundState>): Readonly<ConsensusRoundDecision>;
export declare function projectConsensusFinalResult(resolution: Readonly<ConsensusResolution>): Readonly<ConsensusResultCandidate>;
export declare function finalizeConsensusEscalation(decision: Readonly<ConsensusEscalationDecision>): Readonly<ConsensusHumanFinalization>;
export declare function projectTicketConsensus(result: Readonly<ConsensusResult>): Readonly<TicketConsensusProjection>;
export declare function resolveConsensusJudgmentRelation(predicateRef: string): Readonly<{
    predicateRef: string;
    advanceReasonRef: `reason://abg/consensus/${string}-accepted@5`;
    rejectionReasonRef: `reason://abg/consensus/${string}-rejected@5`;
    evaluate: (input: unknown, output: unknown) => boolean;
}> | null;
export interface ConsensusNativeContractDefinition extends ContractDeclaration {
    readonly validate: ((value: unknown) => boolean) | null;
}
export declare const CONSENSUS_NATIVE_CONTRACT_DEFINITIONS: readonly Readonly<ConsensusNativeContractDefinition>[];
export declare function validateConsensusContractValue(valueKind: string, value: unknown): boolean;
export declare function constructConsensusModulePublication(artifact: RootModuleArtifactBasis): Readonly<ModulePublication>;
