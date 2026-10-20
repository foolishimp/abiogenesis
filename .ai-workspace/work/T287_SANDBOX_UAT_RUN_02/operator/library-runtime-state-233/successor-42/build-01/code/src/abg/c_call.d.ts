import type { ResultEvidenceLineageSource } from "./result_evidence_lineage_contracts.js";
import type { ChildFoldbackInput } from "./graph_application.js";
import type { ClosureContract, GraphFunction, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import { type UndispatchedOwnerObservation } from "./event_contract_profiles.js";
import { type ProgramValidation } from "../validator/validation.js";
import { type AdmittedInteractionContractRow, type AdmittedInteractionSet, type AdmittedImplementationResolutionRow, type AdmittedImplementationSet, type ExecutionBasis, type RuntimeAdmissionBasis } from "./execution_basis.js";
import { AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent, type RuntimeEventCandidate } from "./event_store.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { type ReplayState } from "./replay.js";
import { type OpenedTraversalScope } from "./open_call.js";
import { type TraversalCursorCandidate } from "./traversal_cursor.js";
import { type ActorProcessRequest, type ActorProcessObservation } from "./actor_process.js";
import { type NativeWorkerResultAssessment, type WorkerTransportFailureClass } from "./transport_contracts.js";
import { type WorksiteEffectAuthorization, type WorksiteFileReplaceReceipt, type WorksiteFileReplaceRequest, type WorksiteObservation } from "../product/worksite_effect.js";
export interface CCall {
    readonly kind: "c_call";
    readonly schemaVersion: "5.0.0";
    readonly cCallRef: string;
    readonly cCallDigest: Sha256Digest;
    readonly callClass: "leaf" | "workflow";
    readonly basisId: string;
    readonly runId: string;
    readonly graphFunctionRef: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly edgeRef: string;
    readonly vectorIndex: number;
    readonly stageRole: string;
    readonly batchRef: string | null;
    readonly taskOrdinal: number | null;
    readonly attempt: number;
    readonly programLocusRef: string;
    readonly retryPath: readonly number[];
    readonly regime: "F_D" | "F_H" | "F_P";
    readonly armId: string;
    readonly compositionRef: string | null;
    readonly implementationSetRef: string;
    readonly implementationRequirementKey: string | null;
    readonly implementationBindingRef: string | null;
    readonly implementationRef: string | null;
    readonly interactionSetRef: string;
    readonly interactionRequirementKey: string | null;
    readonly interactionKind: string | null;
    readonly actorCapabilityRef: string | null;
    readonly responseContractRef: string | null;
    readonly continuationContractRef: string | null;
    readonly childGraphFunctionRef: string | null;
    readonly inputContractRef: string;
    readonly outputContractRef: string;
    readonly failureContractRef: string;
    readonly refusalContractRef: string;
    readonly refusalValueKind: string;
    readonly evidenceContractRef: string;
    readonly judgmentContractRef: string;
    readonly rejectionContractRef: string;
    readonly transitionContractRef: string;
    readonly closureContractRef: string;
    readonly closureContractDigest: Sha256Digest;
    readonly judgmentPredicateRef: string;
    readonly terminalPredicateRef: string;
    readonly replayProjectionRef: string;
    readonly terminalKind: "completed";
    readonly openedEventRef: string;
    readonly fibreSelectedEventRef: string;
}
export interface CCallAdmission {
    readonly kind: "c_call_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "opened";
    readonly cCall: CCall;
    readonly successorPrefix: DurablePrefixCoordinate;
}
interface CCallLocusCandidateBase {
    readonly kind: "traversal_stop_ref";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "at_compute_locus";
    readonly stopRef: string;
    readonly stopDigest: Sha256Digest;
    readonly stopKind: "compute_locus";
    readonly cursor: TraversalCursorCandidate;
    readonly traversalScopeRef: string;
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly nodeRef: string;
    readonly programLocusRef: string;
    readonly edgeRef: string;
    readonly vectorIndex: number;
    readonly judgmentPredicateRef: string;
    readonly stageRole: string;
    readonly batchRef: string | null;
    readonly taskOrdinal: number | null;
    readonly attempt: number;
    readonly retryPath: readonly number[];
    readonly armId: string;
    readonly compositionRef: string | null;
}
export interface ExecutableCCallLocusCandidate extends CCallLocusCandidateBase {
    readonly stopClass: "executable";
    readonly computeRegime: "F_D" | "F_P";
    readonly implementationBindingRef: string;
    readonly inputContractRef: string;
    readonly outputContractRef: string;
    readonly evidenceContractRef: string;
    readonly failureContractRef: string;
    readonly refusalContractRef: string;
    readonly judgmentContractRef: string;
}
export interface InteractionCCallLocusCandidate extends CCallLocusCandidateBase {
    readonly stopClass: "interaction";
    readonly computeRegime: "F_H";
    readonly interactionKind: string;
    readonly actorCapabilityRef: string;
    readonly requestContractRef: string;
    readonly responseContractRef: string;
    readonly continuationContractRef: string;
}
export type CCallLocusCandidate = ExecutableCCallLocusCandidate | InteractionCCallLocusCandidate;
type CCallLocusCandidateBody = CCallLocusCandidate extends infer Candidate ? Candidate extends CCallLocusCandidate ? Omit<Candidate, "kind" | "schemaVersion" | "disposition" | "stopRef" | "stopDigest"> : never : never;
export declare function constructCCallLocusCandidate(body: CCallLocusCandidateBody): CCallLocusCandidate;
export declare function isCCallLocusCandidate(value: unknown): value is CCallLocusCandidate;
export interface WorkflowCCallProposal {
    readonly kind: "workflow_c_call_proposal";
    readonly schemaVersion: "5.0.0";
    readonly cursor: TraversalCursorCandidate;
    readonly traversalScopeRef: string;
    readonly runId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly childGraphFunctionRef: string;
    readonly inputContractRef: string;
    readonly outputContractRef: string;
    readonly failureContractRef: string;
    readonly judgmentPredicateRef: string;
}
interface CCallOpenCommonInput {
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly scope: OpenedTraversalScope;
    readonly program: Readonly<GtlProgram>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly graph: Readonly<GtlGraph>;
    readonly basis: RuntimeAdmissionBasis;
}
export type CCallOpenInput = CCallOpenCommonInput & (Readonly<{
    readonly locusClass: "implementation";
    readonly stop: ExecutableCCallLocusCandidate;
    readonly implementationSet: AdmittedImplementationSet;
    readonly resolution: AdmittedImplementationResolutionRow;
}> | Readonly<{
    readonly locusClass: "interaction";
    readonly stop: InteractionCCallLocusCandidate;
    readonly interactionSet: AdmittedInteractionSet;
    readonly interaction: AdmittedInteractionContractRow;
}> | Readonly<{
    readonly locusClass: "workflow";
    readonly proposal: WorkflowCCallProposal;
    readonly implementationSet: AdmittedImplementationSet;
    readonly childGraphFunction: Readonly<GraphFunction>;
    readonly childClosureContract: Readonly<ClosureContract>;
    readonly programValidation: ProgramValidation;
}>);
export interface CCallOpenRefusal {
    readonly kind: "c_call_open_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "basis_mismatch" | "implementation_mismatch" | "locus_mismatch" | "scope_mismatch";
    readonly message: string;
}
export interface WorkflowFailureContractResolution {
    readonly kind: "workflow_failure_contract_resolution";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "resolved";
    readonly childGraphFunctionRef: string;
    readonly childGraphFunctionDigest: Sha256Digest;
    readonly failureContractRef: string;
    readonly source: "declared" | "declared_row_agreement" | "legacy_row";
}
export interface WorkflowFailureContractRefusal {
    readonly kind: "workflow_failure_contract_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "workflow-failure-contract-ambiguous";
    readonly message: string;
}
export type WorkflowFailureContractResult = WorkflowFailureContractResolution | WorkflowFailureContractRefusal;
/** Resolves one child's published declaration and admitted legacy rows. */
export declare function resolveWorkflowFailureContract(input: Readonly<{
    childGraphFunction: Readonly<GraphFunction>;
    programValidation: ProgramValidation;
    implementationSet: AdmittedImplementationSet;
}>): WorkflowFailureContractResult;
export interface DeterministicEvidenceCandidate {
    readonly kind: "deterministic_evidence_candidate";
    readonly schemaVersion: "5.0.0";
    readonly implementationRef: string;
    readonly inputDigest: Sha256Digest;
    readonly outputDigest: Sha256Digest;
}
export interface SubTraversalEvidenceCandidate {
    readonly kind: "sub_traversal_evidence_candidate";
    readonly schemaVersion: "5.0.0";
    readonly inputDigest: Sha256Digest;
    readonly outputDigest: Sha256Digest;
    readonly foldbackRef: string;
    readonly foldbackDigest: Sha256Digest;
    readonly foldbackEventRef: string;
    readonly childExecutionBasisRef: string;
    readonly childExecutionBasisDigest: Sha256Digest;
    readonly childGraphCallId: string;
    readonly childFrameId: string;
    readonly childDisposition: "blocked" | "closed" | "failed" | "held" | "refused";
    readonly childResultRef: string;
    readonly childResultDigest: Sha256Digest;
    readonly childOutputDigest: Sha256Digest;
    readonly childJudgmentRef: string;
    readonly childClosureRef: string | null;
    readonly childReasonRef: string | null;
    readonly childTerminalEventRef: string;
}
export interface ProbabilisticTransportEvidenceCandidate {
    readonly nativeResultAssessment?: import("./transport_contracts.js").NativeWorkerResultAssessment;
    readonly kind: "probabilistic_transport_evidence_candidate";
    readonly schemaVersion: "5.0.0";
    readonly implementationRef: string;
    readonly inputDigest: Sha256Digest;
    readonly observedOutputDigest: Sha256Digest;
    readonly outputDigest: Sha256Digest;
    readonly candidateRef: string | null;
    readonly candidateDigest: Sha256Digest | null;
    readonly requestRef: string;
    readonly requestDigest: Sha256Digest;
    readonly rawOutputDigest: Sha256Digest;
    readonly actorInvocationRef: string;
    readonly actorRef: string;
    readonly workerBindingRef: string;
    readonly processRef: string;
    readonly transportBindingRef: string;
    readonly transportBindingDigest: Sha256Digest;
    readonly materializationPlanRef: string;
    readonly rendererRef: string;
    readonly instructionContractRef: string;
    readonly resultContractRef: string;
    readonly promptDigest: Sha256Digest;
    readonly transportDigest: Sha256Digest;
    readonly transportLane: "closed_prompt_proof" | "worker_executes";
    readonly transportDisposition: "failure" | "success";
    readonly transportFailureClass: string | null;
    readonly processStatus: number | null;
    readonly processSignal: string | null;
    readonly timeoutClass: "absolute" | "inactivity" | null;
    readonly timedOut: boolean;
    readonly exitObserved: boolean;
    readonly terminationConfirmed: boolean;
    readonly signalSequence: readonly string[];
    readonly structuredEventCount: number;
    readonly progressEventCount: number;
    readonly toolCallCount: number;
    readonly apiRetryCount: number;
    readonly stdoutByteLength: number;
    readonly stderrByteLength: number;
    readonly artifactDigests: Readonly<{
        output: Sha256Digest;
        prompt: Sha256Digest;
        stderr: Sha256Digest;
        stdout: Sha256Digest;
        transport: Sha256Digest;
    }>;
}
export interface WorksiteFileReplaceEvidenceCandidate {
    readonly kind: "worksite_file_replace_evidence_candidate";
    readonly schemaVersion: "5.0.0";
    readonly implementationRef: string;
    readonly inputDigest: Sha256Digest;
    readonly outputDigest: Sha256Digest;
    readonly request: WorksiteFileReplaceRequest;
    readonly authorization: WorksiteEffectAuthorization;
    readonly receipt: WorksiteFileReplaceReceipt;
    readonly successorObservation: WorksiteObservation;
}
export type CCallEvidenceCandidate = DeterministicEvidenceCandidate | ProbabilisticTransportEvidenceCandidate | WorksiteFileReplaceEvidenceCandidate | SubTraversalEvidenceCandidate | UndispatchedOwnerRefusalEvidenceCandidate;
export interface UndispatchedOwnerRefusalEvidenceCandidate {
    readonly kind: "undispatched_owner_refusal_evidence_candidate";
    readonly schemaVersion: "5.0.0";
    readonly implementationRef: string;
    readonly inputDigest: Sha256Digest;
    readonly outputDigest: Sha256Digest;
    readonly failureContractRef: string;
    readonly failureValue: Readonly<Record<string, JsonValue>>;
    readonly ownerObservation: UndispatchedOwnerObservation;
}
export interface ProbabilisticResultEvidenceBasis {
    readonly request: Readonly<ActorProcessRequest>;
    readonly observation: Readonly<ActorProcessObservation>;
    readonly admittedResultCarrier: unknown | null;
}
export interface PendingInteractionAdmission {
    readonly kind: "pending_interaction_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "pending";
    readonly cCall: CCall;
    readonly evidence: AdmittedCCallEvidence;
    readonly result: AdmittedCCallResult;
    readonly judgment: AdmittedCCallJudgment;
    readonly requestRef: string;
    readonly requestDigest: Sha256Digest;
}
export interface PendingInteractionAdmissionPlan {
    readonly kind: "pending_interaction_admission_plan";
    readonly schemaVersion: "5.0.0";
    readonly planRef: string;
    readonly planDigest: Sha256Digest;
    readonly expectedPrefixDigest: Sha256Digest;
    readonly admissionBasisDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly requestRef: string;
    readonly requestDigest: Sha256Digest;
    readonly retryAttemptRef: string | null;
    readonly pendingValue: Readonly<{
        readonly kind: "fh_pending_result";
        readonly schemaVersion: "5.0.0";
        readonly interactionKind: string;
        readonly requestRef: string;
        readonly requestDigest: Sha256Digest;
        readonly responseContractRef: string;
        readonly continuationContractRef: string;
    }>;
    readonly pendingValueDigest: Sha256Digest;
    readonly evidenceRef: string;
    readonly evidenceDigest: Sha256Digest;
    readonly resultRef: string;
    readonly resultDigest: Sha256Digest;
    readonly judgmentReasonRef: string;
    readonly eventCandidates: readonly RuntimeEventCandidate[];
    readonly projectedEvents: readonly RuntimeEvent[];
    readonly pending: PendingInteractionAdmission;
    readonly projectedPrefix: ValidatedRuntimeEventPrefix;
    readonly replayState: ReplayState;
}
export interface RehydratedPendingInteraction {
    readonly cCall: CCall;
    readonly result: AdmittedCCallResult;
    readonly judgment: AdmittedCCallJudgment;
    readonly requestRef: string;
    readonly requestDigest: Sha256Digest;
}
interface AdmittedCCallEvidenceDetails {
    readonly kind: "admitted_c_call_evidence";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly evidenceRef: string;
    readonly evidenceDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly contractRef: string;
    readonly implementationRef: string | null;
    readonly inputDigest: Sha256Digest;
    readonly outputDigest: Sha256Digest;
    readonly failureContractRef?: string;
    readonly failureValue?: Readonly<Record<string, JsonValue>>;
    readonly ownerObservation?: UndispatchedOwnerObservation;
    readonly observedOutputDigest?: Sha256Digest;
    readonly candidateRef?: string | null;
    readonly candidateDigest?: Sha256Digest | null;
    readonly requestRef?: string;
    readonly rawOutputDigest?: Sha256Digest;
    readonly processRef?: string;
    readonly materializationPlanRef?: string;
    readonly rendererRef?: string;
    readonly instructionContractRef?: string;
    readonly resultContractRef?: string;
    readonly transportLane?: "closed_prompt_proof" | "worker_executes";
    readonly processStatus?: number | null;
    readonly processSignal?: string | null;
    readonly timeoutClass?: "absolute" | "inactivity" | null;
    readonly timedOut?: boolean;
    readonly exitObserved?: boolean;
    readonly terminationConfirmed?: boolean;
    readonly signalSequence?: readonly string[];
    readonly structuredEventCount?: number;
    readonly progressEventCount?: number;
    readonly toolCallCount?: number;
    readonly apiRetryCount?: number;
    readonly stdoutByteLength?: number;
    readonly stderrByteLength?: number;
    readonly artifactDigests?: ProbabilisticTransportEvidenceCandidate["artifactDigests"];
    readonly foldbackRef?: string;
    readonly foldbackDigest?: Sha256Digest;
    readonly foldbackEventRef?: string;
    readonly childExecutionBasisRef?: string;
    readonly childExecutionBasisDigest?: Sha256Digest;
    readonly childGraphCallId?: string;
    readonly childFrameId?: string;
    readonly childDisposition?: SubTraversalEvidenceCandidate["childDisposition"];
    readonly childResultRef?: string;
    readonly childResultDigest?: Sha256Digest;
    readonly childOutputDigest?: Sha256Digest;
    readonly childJudgmentRef?: string;
    readonly childClosureRef?: string | null;
    readonly childReasonRef?: string | null;
    readonly childTerminalEventRef?: string;
    readonly request?: WorksiteFileReplaceRequest;
    readonly authorization?: WorksiteEffectAuthorization;
    readonly receipt?: WorksiteFileReplaceReceipt;
    readonly successorObservation?: WorksiteObservation;
    readonly admissionEventRef: string;
}
export type AdmittedCCallEvidence = AdmittedCCallEvidenceDetails & ResultEvidenceLineageSource;
export interface AdmittedCCallResult {
    readonly kind: "admitted_c_call_result";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly resultRef: string;
    readonly resultDigest: Sha256Digest;
    readonly valueDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly resultClass: "failure" | "pending" | "refusal" | "success";
    readonly contractRef: string;
    readonly valueKind: string;
    readonly value: JsonValue;
    readonly evidenceRefs: readonly string[];
    readonly admissionEventRef: string;
}
export type CCallJudgment = "advance" | "blocked" | "escalated" | "no_declared_check" | "pending" | "retry";
export interface JudgmentCandidate {
    readonly kind: "judgment_candidate";
    readonly schemaVersion: "5.0.0";
    readonly candidateRef: string;
    readonly candidateDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly resultRef: string;
    readonly resultDigest: Sha256Digest;
    readonly judgment: CCallJudgment;
    readonly reasonRef: string;
    readonly contractRef: string;
    readonly predicateRef: string;
    readonly replayStateDigest: Sha256Digest;
}
export interface AdmittedCCallJudgment {
    readonly kind: "admitted_c_call_judgment";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly judgmentRef: string;
    readonly judgmentDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly resultRef: string;
    readonly resultDigest: Sha256Digest;
    readonly judgment: CCallJudgment;
    readonly reasonRef: string;
    readonly contractRef: string;
    readonly predicateRef: string;
    readonly replayStateDigest: Sha256Digest;
    readonly retryAttemptRef: string | null;
    readonly admissionEventRef: string;
}
export interface CCallAdmissionRejection {
    readonly kind: "c_call_admission_rejection";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "rejected";
    readonly cCallRef: string;
    readonly stage: "evidence" | "judgment" | "result";
    readonly candidateDigest: Sha256Digest;
    readonly contractRef: string;
    readonly diagnosticRef: string;
}
export interface CCallRuntimeFailureSignal {
    readonly kind: "c_call_runtime_failure_signal";
    readonly schemaVersion: "5.0.0";
    readonly failureClass: WorkerTransportFailureClass;
    readonly sourceClass: "deterministic_output_rejection" | "probabilistic_transport";
    readonly sourceDigest: Sha256Digest;
    readonly failureSignalDigest: Sha256Digest;
    readonly failureSignalRef: string;
}
export interface CCallRuntimeFailureClosePlan {
    readonly kind: "c_call_runtime_failure_close_plan";
    readonly schemaVersion: "5.0.0";
    readonly planRef: string;
    readonly planDigest: Sha256Digest;
    readonly expectedPrefixDigest: Sha256Digest;
    readonly admissionBasisDigest: Sha256Digest;
    readonly disposition: "blocked" | "retry";
    readonly cCallRef: string;
    readonly sourceRef: string;
    readonly sourceEventRef: string | null;
    readonly failureValueKind: string;
    readonly failureCandidateDigest: Sha256Digest;
    readonly signal: CCallRuntimeFailureSignal;
    readonly eventCandidates: readonly RuntimeEventCandidate[];
    readonly projectedEvents: readonly RuntimeEvent[];
    readonly close: AdmittedCCallRuntimeFailureClose;
}
export interface CCallRuntimeFailureCloseRefusal {
    readonly kind: "c_call_runtime_failure_close_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "call_mismatch" | "plan_mismatch" | "source_mismatch";
    readonly message: string;
}
export interface AdmittedCCallRuntimeFailureClose {
    readonly kind: "admitted_c_call_runtime_failure_close";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "blocked" | "retry";
    readonly cCallRef: string;
    readonly signal: CCallRuntimeFailureSignal;
    readonly result: AdmittedCCallResult;
    readonly judgment: AdmittedCCallJudgment;
}
export type CCallRuntimeFailureSource = AdmittedCCallEvidence | CCallAdmissionRejection;
export interface RejectedCCallCompletion {
    readonly kind: "rejected_c_call_completion";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "blocked";
    readonly cCallRef: string;
    readonly rejectionEvidenceRef: string | null;
    readonly refusalResultRef: string;
    readonly rejectionJudgmentRef: string;
    readonly evidenceEventRef: string | null;
    readonly resultEventRef: string;
    readonly judgmentEventRef: string;
}
export interface ChildFoldbackAdmission {
    readonly kind: "child_foldback_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly foldbackRef: string;
    readonly foldbackDigest: Sha256Digest;
    readonly parentCCallRef: string;
    readonly childExecutionBasisRef: string;
    readonly childExecutionBasisDigest: Sha256Digest;
    readonly childGraphCallId: string;
    readonly childFrameId: string;
    readonly childDisposition: SubTraversalEvidenceCandidate["childDisposition"];
    readonly childResultRef: string;
    readonly childResultDigest: Sha256Digest;
    readonly childJudgmentRef: string;
    readonly childClosureRef: string | null;
    readonly childReasonRef: string | null;
    readonly childTerminalEventRef: string;
    readonly outputDigest: Sha256Digest;
    readonly admissionEventRef: string;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface ChildFoldbackRefusal {
    readonly kind: "child_foldback_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "child_truth_mismatch" | "parent_call_mismatch";
    readonly message: string;
}
export interface ChildPreparationRefusalCandidate {
    readonly kind: "child_preparation_refusal_candidate";
    readonly schemaVersion: "5.0.0";
    readonly childGraphFunctionRef: string;
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly stage: "basis_admission" | "graph_materialization" | "graph_validation" | "membership" | "scope_open";
    readonly diagnosticRef: string;
    readonly message: string;
}
export interface ChildPreparationRefusalAdmission {
    readonly kind: "child_preparation_refusal_admission";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "admitted";
    readonly admissionRejection: CCallAdmissionRejection;
    readonly admissionEventRef: string;
    readonly successorPrefix: DurablePrefixCoordinate;
}
export interface ChildPreparationRefusalRefusal {
    readonly kind: "child_preparation_refusal_refusal";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "refused";
    readonly code: "candidate_mismatch" | "parent_call_mismatch";
    readonly message: string;
}
export type CCallEvidenceAdmissionResult = AdmittedCCallEvidence | CCallAdmissionRejection;
export type CCallResultAdmissionResult = AdmittedCCallResult | CCallAdmissionRejection;
export type CCallJudgmentAdmissionResult = AdmittedCCallJudgment | CCallAdmissionRejection;
export interface CCallPhaseProjection {
    readonly kind: "c_call_phase_projection";
    readonly cCallRef: string;
    readonly phase: "not_open" | "selected_no_evidence" | "evidencing" | "result_admitted" | "judged";
    readonly openedEventRef: string | null;
    readonly fibreEventRef: string | null;
    readonly evidenceEventRefs: readonly string[];
    readonly resultEventRef: string | null;
    readonly judgmentEventRef: string | null;
    readonly rejectionEventRef: string | null;
}
export declare function projectCCallPhase(prefix: ValidatedRuntimeEventPrefix, cCallRef: string): CCallPhaseProjection;
export declare function projectCCallCarrierPhaseAtPrefix(prefix: ValidatedRuntimeEventPrefix, cCall: CCall): CCallPhaseProjection | null;
export interface CurrentChildParentCCallProjection {
    readonly kind: "current_child_parent_c_call_projection";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "workflow_open" | "deferred_application_ready";
    readonly cCallRef: string;
    readonly sourceCursorRef: string;
    readonly causationEventRef: string;
    readonly resultRef: string | null;
    readonly judgmentRef: string | null;
}
/**
 * Projects the exact current parent authority for opening a child traversal.
 * A declared workflow owns its child while its CCall is selected and active.
 * Recursive application owns its next child only at the unconsumed judged
 * application frontier; a generic active CCall is never recursion authority.
 */
export declare function projectCurrentChildParentCCallAtPrefix(prefix: ValidatedRuntimeEventPrefix, coordinates: Readonly<{
    parentCCallRef: string;
    parentExecutionBasisRef: string;
    runId: string;
    graphCallId: string;
    frameId: string;
    childGraphFunctionRef: string;
    admittedInputRef: string;
    admittedInputDigest: Sha256Digest;
}>): CurrentChildParentCCallProjection | null;
export declare function projectAdmittedCCallResultAtPrefix(prefix: ValidatedRuntimeEventPrefix, cCall: CCall, result: AdmittedCCallResult): AdmittedCCallResult | null;
export declare function projectAdmittedCCallOutcomeAtPrefix(prefix: ValidatedRuntimeEventPrefix, cCall: CCall, result: AdmittedCCallResult, judgment: AdmittedCCallJudgment): RehydratedAdmittedCCallState | null;
export declare function isCCall(value: object): boolean;
export declare function isAdmittedCCallResult(value: object): boolean;
export declare function isAdmittedCCallJudgment(value: object): boolean;
/** Internal same-call-chain owner projection, not a serialized admission input. */
export interface AdmittedActorTransportProjection {
    readonly kind: "admitted_actor_transport_projection";
    readonly prefixDigest: Sha256Digest;
    readonly cCallRef: string;
    readonly sourceDigest: Sha256Digest;
    readonly actorTerminalEventRef: string;
    readonly failureClass: WorkerTransportFailureClass | null;
    readonly nativeResultAssessment: NativeWorkerResultAssessment | null;
}
/**
 * Reconstructs one exact opened declared CCall used by retry close and route
 * relations from one complete validated store prefix.
 */
export declare function projectOpenedCCallCarrier(store: AbgEventStore, prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, cCallRef: string, sourceCursor?: TraversalCursorCandidate, graphFunction?: Readonly<GraphFunction>, childGraphFunction?: Readonly<GraphFunction>, programValidation?: ProgramValidation): CCall | null;
export declare function projectOpenedCCallCarrierAtPrefix(prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, cCallRef: string, sourceCursor?: TraversalCursorCandidate, graphFunction?: Readonly<GraphFunction>, childGraphFunction?: Readonly<GraphFunction>, programValidation?: ProgramValidation): CCall | null;
export declare function planCCallRuntimeFailureClose(store: AbgEventStore, prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, cCall: CCall, source: CCallRuntimeFailureSource, failureCandidate: JsonValue, failureValueKind: string, disposition: "blocked" | "retry", basis: RuntimeAdmissionBasis): CCallRuntimeFailureClosePlan | CCallRuntimeFailureCloseRefusal;
export declare function isCCallRuntimeFailureCloseError(error: unknown): boolean;
export declare function admitPlannedCCallRuntimeFailureClose(store: AbgEventStore, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, cCall: CCall, source: CCallRuntimeFailureSource, failureCandidate: JsonValue, plan: CCallRuntimeFailureClosePlan, disposition: "blocked" | "retry", basis: RuntimeAdmissionBasis): AdmittedCCallRuntimeFailureClose;
export declare function projectCCallRuntimeFailureSignal(prefix: ValidatedRuntimeEventPrefix, cCallRef: string, resultRef: string, judgmentRef: string): CCallRuntimeFailureSignal | null;
export declare function deriveProbabilisticTransportEvidence(cCall: CCall, request: Readonly<ActorProcessRequest>, observation: Readonly<ActorProcessObservation>, admittedResultCarrier: unknown, resultCandidate: JsonValue, expectedInstructionContractRef: string, expectedResultContractRef?: string): ProbabilisticTransportEvidenceCandidate;
/** Establish actor/artifact/terminal truth before associating an output candidate. */
export declare function projectActorTransportForResult(prefix: ValidatedRuntimeEventPrefix, cCall: CCall, request: Readonly<ActorProcessRequest>, observation: Readonly<ActorProcessObservation>): AdmittedActorTransportProjection | null;
export declare function admitWorkflowChildPreparationRefusal(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, parentCCall: CCall, candidate: ChildPreparationRefusalCandidate, basis: RuntimeAdmissionBasis): ChildPreparationRefusalAdmission | ChildPreparationRefusalRefusal;
export declare function admitWorkflowChildFoldback(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, parentCCall: CCall, childExecutionBasis: ExecutionBasis, childScope: OpenedTraversalScope, input: {
    readonly childResultRef: string;
    readonly childJudgmentRef: string;
    readonly childClosureRef: string | null;
}, basis: RuntimeAdmissionBasis): ChildFoldbackAdmission | ChildFoldbackRefusal;
/** ABG owns both the intent read and the ensuing foldback's pure derivation. */
export declare function prepareWorkflowChildFoldback(input: Extract<ChildFoldbackInput, Readonly<{
    relationClass: "workflow";
}>>): Readonly<{
    intent: import("./traversal_route.js").ConstructionIntentAdmission | null;
    admit(): ChildFoldbackAdmission | ChildFoldbackRefusal;
}>;
/** Recover the workflow input from its admitted CCall evidence. Cursor origins
 * establish identity; the CCall owner already checked this input against the
 * actual cursor before admitting the sub-traversal evidence and Result. */
export declare function projectWorkflowCCallInputDigestAtPrefix(prefix: ValidatedRuntimeEventPrefix, opened: RuntimeEvent, foldback: RuntimeEvent, result: RuntimeEvent): Sha256Digest | null;
export declare function deriveSubTraversalEvidence(parentCCall: CCall, foldback: ChildFoldbackAdmission, inputDigest: Sha256Digest, outputDigest: Sha256Digest): SubTraversalEvidenceCandidate;
export declare function rehydrateWorkflowCCall(store: AbgEventStore, executionBasis: ExecutionBasis, implementationSet: AdmittedImplementationSet, scope: OpenedTraversalScope, graphFunction: Readonly<GraphFunction>, graph: Readonly<GtlGraph>, sourceCursor: TraversalCursorCandidate, cCallValue: Readonly<Record<string, JsonValue>>, childGraphFunction?: Readonly<GraphFunction>, programValidation?: ProgramValidation): CCall | null;
export declare function rehydrateWorkflowCCallAtPrefix(prefix: ValidatedRuntimeEventPrefix, executionBasis: ExecutionBasis, implementationSet: AdmittedImplementationSet, scope: OpenedTraversalScope, graphFunction: Readonly<GraphFunction>, graph: Readonly<GtlGraph>, sourceCursor: TraversalCursorCandidate, cCallValue: Readonly<Record<string, JsonValue>>, childGraphFunction?: Readonly<GraphFunction>, programValidation?: ProgramValidation): CCall | null;
export interface RehydratedAdmittedCCallState {
    readonly cCall: CCall;
    readonly result: AdmittedCCallResult;
    readonly judgment: AdmittedCCallJudgment;
}
export interface AdmittedLeafCCallOutcomeProjectionInput {
    readonly executionBasis: ExecutionBasis;
    readonly implementationSet: AdmittedImplementationSet;
    readonly openedTraversalScope: OpenedTraversalScope;
    readonly graph: Readonly<GtlGraph>;
    readonly traversalStop: ExecutableCCallLocusCandidate;
    readonly implementationResolution: AdmittedImplementationResolutionRow;
    readonly cCallRef: string;
    readonly resultRef: string;
    readonly judgmentRef: string;
}
/**
 * Reconstructs one admitted leaf outcome from its validated Run prefix and the
 * exact installed owner surfaces that declared the C locus.
 */
export declare function projectAdmittedLeafCCallOutcomeAtPrefix(predecessorPrefix: DurablePrefixCoordinate, input: AdmittedLeafCCallOutcomeProjectionInput): RehydratedAdmittedCCallState | null;
export declare function projectAdmittedCCallStateAtPrefix(prefix: ValidatedRuntimeEventPrefix, cCallValue: Readonly<Record<string, JsonValue>>, resultValue: Readonly<Record<string, JsonValue>>, judgmentValue: Readonly<Record<string, JsonValue>>): RehydratedAdmittedCCallState | null;
export declare function rehydrateAdmittedCCallState(store: AbgEventStore, cCallValue: Readonly<Record<string, JsonValue>>, resultValue: Readonly<Record<string, JsonValue>>, judgmentValue: Readonly<Record<string, JsonValue>>): RehydratedAdmittedCCallState | null;
export declare function projectPendingInteractionCarrier(prefix: ValidatedRuntimeEventPrefix, cCallValue: Readonly<Record<string, JsonValue>>, resultValue: Readonly<Record<string, JsonValue>>, judgmentValue: Readonly<Record<string, JsonValue>>): RehydratedPendingInteraction | null;
export declare function rehydratePendingInteraction(store: AbgEventStore, cCallValue: Readonly<Record<string, JsonValue>>, resultValue: Readonly<Record<string, JsonValue>>, judgmentValue: Readonly<Record<string, JsonValue>>): RehydratedPendingInteraction | null;
/** Child closure always describes the child. One Surface's declared workflow
 * returns its owned action-evaluation basis to the declared next evaluator;
 * ordinary workflows conserve the child's output contract directly. */
export declare function workflowOutputContractCorresponds(input: Readonly<{
    prefix: ValidatedRuntimeEventPrefix;
    executionBasis: ExecutionBasis;
    graph: Readonly<GtlGraph>;
    cursor: TraversalCursorCandidate;
    childGraphFunction: Readonly<GraphFunction>;
    childClosureContract: Readonly<ClosureContract>;
}>): boolean;
export declare function openCCall(input: Readonly<CCallOpenInput>): CCallAdmission | CCallOpenRefusal;
/** Exact native selected F_P occurrence; this is owner refusal, never actor evidence. */
export declare function undispatchedOwnerEvidenceMatches(prefix: ValidatedRuntimeEventPrefix, cCall: CCall, candidate: UndispatchedOwnerRefusalEvidenceCandidate, expectedInputDigest: Sha256Digest): boolean;
export declare function admitEvidence(store: AbgEventStore, prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, cCall: CCall, candidate: CCallEvidenceCandidate, contractRef: string, expectedInputDigest: Sha256Digest, basis: RuntimeAdmissionBasis, expectedInstructionContractRef?: string, expectedResultContractRef?: string, probabilisticResultBasis?: ProbabilisticResultEvidenceBasis | null): CCallEvidenceAdmissionResult;
/** Internal composition only. Raw admitEvidence always authenticates its own source. */
export declare function admitEvidenceFromActorTransport(transport: AdmittedActorTransportProjection | null, ...args: Parameters<typeof admitEvidence>): CCallEvidenceAdmissionResult;
export declare function admitResult(store: AbgEventStore, prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, cCall: CCall, candidate: JsonValue, resultClass: "failure" | "success", contractRef: string, valueKind: string, validateValue: (value: unknown) => boolean, evidence: readonly AdmittedCCallEvidence[], basis: RuntimeAdmissionBasis): CCallResultAdmissionResult;
export declare function admitJudgment(store: AbgEventStore, prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, cCall: CCall, result: AdmittedCCallResult, candidate: JudgmentCandidate, replayState: ReplayState, basis: RuntimeAdmissionBasis): CCallJudgmentAdmissionResult;
export declare function completeRejectedCCall(store: AbgEventStore, prefix: ValidatedRuntimeEventPrefix, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, cCall: CCall, admissionRejection: CCallAdmissionRejection, basis: RuntimeAdmissionBasis): RejectedCCallCompletion;
export declare function planPendingInteractionAdmission(store: AbgEventStore, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, cCall: CCall, request: Readonly<Record<string, JsonValue>>, expectedInputDigest: Sha256Digest, basis: RuntimeAdmissionBasis): PendingInteractionAdmissionPlan;
export declare function admitPlannedPendingInteraction(store: AbgEventStore, graph: Readonly<GtlGraph>, graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate, cCall: CCall, request: Readonly<Record<string, JsonValue>>, expectedInputDigest: Sha256Digest, plan: PendingInteractionAdmissionPlan, basis: RuntimeAdmissionBasis): PendingInteractionAdmission;
export {};
