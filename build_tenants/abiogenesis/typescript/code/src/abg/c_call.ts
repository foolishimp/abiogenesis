import type { GraphFunction, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import { isExecutableCLeaf, isInteractionCLeaf } from "../gtl/c_algebra.js";
import {
  resolveCProgramLocus,
  resolveCProgramTermAtSourcePath,
  resolveEnclosingCBatchRef,
} from "../gtl/source_path.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasAdmittedExecutionBasisAtPrefix,
  hasAdmittedImplementationSetAtPrefix,
  rehydrateAdmittedImplementationSetAtPrefix,
  rehydrateAdmittedInteractionSetAtPrefix,
  rehydrateExecutionBasisAtPrefix,
  selectAdmittedImplementationResolution,
  selectAdmittedInteractionContract,
  type AdmittedInteractionContractRow,
  type AdmittedInteractionSet,
  type AdmittedImplementationResolutionRow,
  type AdmittedImplementationSet,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
  admitRuntimeEvent,
  admitRuntimeEventBatch,
  admitRuntimeEventTransactionAtExpectedPrefix,
  assertHeldEventStoreAtDurablePrefix,
  assertRuntimeEventTransactionActive,
  compareAndAppendExpectedPrefix,
  isRuntimeEventTransactionActive,
  projectRuntimeEventFromValidatedHistory,
  readRuntimeEventsAtDurablePrefix,
  selectHeldEventStoreDurablePrefix,
  type DurablePrefixCoordinate,
  type RuntimeEvent,
  type RuntimeEventCandidate,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
} from "./event_calculus.js";
import {
  replay,
  replayValidatedRuntimeEventPrefix,
  type ReplayState,
} from "./replay.js";
import {
  hasOpenedTraversalScopeAtPrefix,
  rehydrateOpenedTraversalScopeAtPrefix,
  type OpenedTraversalScope,
} from "./open_call.js";
import {
  hasAdmittedTraversalCursorAtPrefix,
  traversalCursorAdmissionEventRefAtPrefix,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";
import {
  projectActorProcessLifecycle,
  validateActorProcessCarrierPair,
  type ActorProcessRequest,
  type ActorProcessObservation,
} from "./actor_process.js";
import {
  hasExactCompletedRetryProgressBridge,
  hasExactStoppedRetryProgressBridge,
} from "./retry_lifecycle.js";
import { hasExactPartialFanOutStopRouteBridge } from "./fan_out_projection.js";
import { projectDeclaredCRetryCCallWriteAtPrefix } from "./retry.js";
import {
  admitChildLifecycleEvent,
  projectChildFoldbackTruth,
} from "./child_lifecycle.js";
import {
  WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
  classifyWorkerTransportFailure,
  type WorkerTransportFailureClass,
} from "./transport_contracts.js";

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

export interface ExecutableCCallLocusCandidate
  extends CCallLocusCandidateBase {
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

export interface InteractionCCallLocusCandidate
  extends CCallLocusCandidateBase {
  readonly stopClass: "interaction";
  readonly computeRegime: "F_H";
  readonly interactionKind: string;
  readonly actorCapabilityRef: string;
  readonly requestContractRef: string;
  readonly responseContractRef: string;
  readonly continuationContractRef: string;
}

export type CCallLocusCandidate =
  | ExecutableCCallLocusCandidate
  | InteractionCCallLocusCandidate;

type CCallLocusCandidateBody = CCallLocusCandidate extends infer Candidate
  ? Candidate extends CCallLocusCandidate
    ? Omit<
        Candidate,
        "kind" | "schemaVersion" | "disposition" | "stopRef" | "stopDigest"
      >
    : never
  : never;

const C_CALL_LOCUS_COMMON_KEYS = Object.freeze([
  "armId", "attempt", "batchRef", "compositionRef", "computeRegime",
  "cursor", "edgeRef", "frameId", "graphCallId", "judgmentPredicateRef",
  "nodeRef", "programLocusRef", "retryPath", "runId", "stageRole",
  "stopClass", "stopKind", "taskOrdinal", "traversalScopeRef", "vectorIndex",
] as const);

const C_CALL_LOCUS_EXECUTABLE_KEYS = Object.freeze([
  "evidenceContractRef", "failureContractRef", "implementationBindingRef",
  "inputContractRef", "judgmentContractRef", "outputContractRef",
  "refusalContractRef",
] as const);

const C_CALL_LOCUS_INTERACTION_KEYS = Object.freeze([
  "actorCapabilityRef", "continuationContractRef", "interactionKind",
  "requestContractRef", "responseContractRef",
] as const);

function cCallLocusCandidateBody(
  candidate: CCallLocusCandidate,
): CCallLocusCandidateBody {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    stopRef: _stopRef,
    stopDigest: _stopDigest,
    ...body
  } = candidate;
  return body as CCallLocusCandidateBody;
}

export function constructCCallLocusCandidate(
  body: CCallLocusCandidateBody,
): CCallLocusCandidate {
  const stopDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "traversal_stop_ref" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "at_compute_locus" as const,
    stopRef:
      `traversal-stop://abiogenesis/${stopDigest.slice("sha256:".length)}`,
    stopDigest,
    ...body,
    retryPath: [...body.retryPath],
  }) as CCallLocusCandidate;
}

export function isCCallLocusCandidate(
  value: unknown,
): value is CCallLocusCandidate {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Readonly<Record<string, unknown>>;
  if (
    candidate.kind !== "traversal_stop_ref" ||
    candidate.schemaVersion !== "5.0.0" ||
    candidate.disposition !== "at_compute_locus" ||
    candidate.stopKind !== "compute_locus" ||
    !isSha256Digest(candidate.stopDigest) ||
    typeof candidate.stopRef !== "string" ||
    (candidate.stopClass !== "executable" &&
      candidate.stopClass !== "interaction")
  ) return false;
  const variantKeys = candidate.stopClass === "executable"
    ? C_CALL_LOCUS_EXECUTABLE_KEYS
    : C_CALL_LOCUS_INTERACTION_KEYS;
  const expectedKeys = [
    "kind", "schemaVersion", "disposition", "stopRef", "stopDigest",
    ...C_CALL_LOCUS_COMMON_KEYS,
    ...variantKeys,
  ].sort();
  const actualKeys = Object.keys(candidate).sort();
  if (
    actualKeys.length !== expectedKeys.length ||
    actualKeys.some((key, index) => key !== expectedKeys[index]) ||
    (candidate.stopClass === "executable" &&
      candidate.computeRegime !== "F_D" && candidate.computeRegime !== "F_P") ||
    (candidate.stopClass === "interaction" &&
      candidate.computeRegime !== "F_H")
  ) return false;
  const exact = candidate as unknown as CCallLocusCandidate;
  const body = cCallLocusCandidateBody(exact);
  const digest = sha256Canonical(body as unknown as JsonValue);
  return exact.stopDigest === digest && exact.stopRef ===
    `traversal-stop://abiogenesis/${digest.slice("sha256:".length)}`;
}

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

export type CCallOpenInput = CCallOpenCommonInput & (
  | Readonly<{
      readonly locusClass: "implementation";
      readonly stop: ExecutableCCallLocusCandidate;
      readonly implementationSet: AdmittedImplementationSet;
      readonly resolution: AdmittedImplementationResolutionRow;
    }>
  | Readonly<{
      readonly locusClass: "interaction";
      readonly stop: InteractionCCallLocusCandidate;
      readonly interactionSet: AdmittedInteractionSet;
      readonly interaction: AdmittedInteractionContractRow;
    }>
  | Readonly<{
      readonly locusClass: "workflow";
      readonly proposal: WorkflowCCallProposal;
      readonly implementationSet: AdmittedImplementationSet;
    }>
);

export interface CCallOpenRefusal {
  readonly kind: "c_call_open_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "basis_mismatch"
    | "implementation_mismatch"
    | "locus_mismatch"
    | "scope_mismatch";
  readonly message: string;
}

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

export type CCallEvidenceCandidate =
  | DeterministicEvidenceCandidate
  | ProbabilisticTransportEvidenceCandidate
  | SubTraversalEvidenceCandidate;

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

export interface AdmittedCCallEvidence {
  readonly kind: "admitted_c_call_evidence";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly evidenceRef: string;
  readonly evidenceDigest: Sha256Digest;
  readonly cCallRef: string;
  readonly evidenceClass:
    | "deterministic"
    | "interaction_request"
    | "probabilistic_transport"
    | "sub_traversal";
  readonly contractRef: string;
  readonly implementationRef: string | null;
  readonly inputDigest: Sha256Digest;
  readonly outputDigest: Sha256Digest;
  readonly observedOutputDigest?: Sha256Digest;
  readonly candidateRef?: string | null;
  readonly candidateDigest?: Sha256Digest | null;
  readonly requestRef?: string;
  readonly requestDigest?: Sha256Digest;
  readonly rawOutputDigest?: Sha256Digest;
  readonly actorInvocationRef?: string;
  readonly actorRef?: string;
  readonly workerBindingRef?: string;
  readonly processRef?: string;
  readonly transportBindingRef?: string;
  readonly transportBindingDigest?: Sha256Digest;
  readonly materializationPlanRef?: string;
  readonly rendererRef?: string;
  readonly instructionContractRef?: string;
  readonly resultContractRef?: string;
  readonly promptDigest?: Sha256Digest;
  readonly transportDigest?: Sha256Digest;
  readonly transportLane?: "closed_prompt_proof" | "worker_executes";
  readonly transportDisposition?: "failure" | "success";
  readonly transportFailureClass?: string | null;
  readonly processStatus?: number | null;
  readonly processSignal?: string | null;
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
  readonly admissionEventRef: string;
}

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

export type CCallJudgment =
  | "advance"
  | "blocked"
  | "escalated"
  | "no_declared_check"
  | "pending"
  | "retry";

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
  readonly sourceClass:
    | "deterministic_output_rejection"
    | "probabilistic_transport";
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
  readonly code:
    | "call_mismatch"
    | "plan_mismatch"
    | "source_mismatch";
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

export type CCallRuntimeFailureSource =
  | AdmittedCCallEvidence
  | CCallAdmissionRejection;

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
  readonly stage:
    | "basis_admission"
    | "graph_materialization"
    | "graph_validation"
    | "membership"
    | "scope_open";
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

export type CCallEvidenceAdmissionResult =
  | AdmittedCCallEvidence
  | CCallAdmissionRejection;
export type CCallResultAdmissionResult =
  | AdmittedCCallResult
  | CCallAdmissionRejection;
export type CCallJudgmentAdmissionResult =
  | AdmittedCCallJudgment
  | CCallAdmissionRejection;

export interface CCallPhaseProjection {
  readonly kind: "c_call_phase_projection";
  readonly cCallRef: string;
  readonly phase:
    | "not_open"
    | "selected_no_evidence"
    | "evidencing"
    | "result_admitted"
    | "judged";
  readonly openedEventRef: string | null;
  readonly fibreEventRef: string | null;
  readonly evidenceEventRefs: readonly string[];
  readonly resultEventRef: string | null;
  readonly judgmentEventRef: string | null;
  readonly rejectionEventRef: string | null;
}

export function projectCCallPhase(
  prefix: ValidatedRuntimeEventPrefix,
  cCallRef: string,
): CCallPhaseProjection {
  const rows = runtimeEventsFromValidatedPrefix(prefix).filter((event) =>
    event.aggregateType === "c_call" && event.aggregateId === cCallRef
  );
  const opened = rows.filter((event) => event.kind === "c_call_opened");
  const fibre = rows.filter((event) => event.kind === "c_call_fibre_selected");
  const evidence = rows.filter((event) => event.kind === "c_call_evidenced");
  const results = rows.filter((event) => event.kind === "c_call_result_admitted");
  const judgments = rows.filter((event) => event.kind === "c_call_judged");
  const rejections = rows.filter((event) => event.kind === "child_preparation_refused");
  if (rows.length === 0) {
    return deepFreeze({
      kind: "c_call_phase_projection" as const,
      cCallRef,
      phase: "not_open" as const,
      openedEventRef: null,
      fibreEventRef: null,
      evidenceEventRefs: Object.freeze([]),
      resultEventRef: null,
      judgmentEventRef: null,
      rejectionEventRef: null,
    });
  }
  const openedRow = opened[0];
  const fibreRow = fibre[0];
  const phaseRows = rows.filter((event) =>
    event.kind === "c_call_evidenced" ||
    event.kind === "c_call_result_admitted" ||
    event.kind === "c_call_judged" ||
    event.kind === "child_preparation_refused"
  );
  const evidenceRefs = evidence.map((event) =>
    isJsonRecord(event.payload) && typeof event.payload.evidenceRef === "string"
      ? event.payload.evidenceRef
      : null
  );
  if (
    opened.length !== 1 || fibre.length !== 1 || results.length > 1 ||
    judgments.length > 1 || rejections.length > 1 ||
    (judgments.length === 1 && results.length !== 1) ||
    openedRow === undefined || fibreRow === undefined ||
    fibreRow.admissionOrdinal !== openedRow.admissionOrdinal + 1 ||
    fibreRow.causationEventRefs.length !== 1 ||
    fibreRow.causationEventRefs[0] !== openedRow.eventId ||
    openedRow.runId !== fibreRow.runId ||
    openedRow.graphCallId !== fibreRow.graphCallId ||
    openedRow.frameId !== fibreRow.frameId ||
    openedRow.parentAggregateId !== fibreRow.parentAggregateId ||
    openedRow.basisId !== fibreRow.basisId ||
    !isJsonRecord(openedRow.payload) ||
    !isJsonRecord(fibreRow.payload) ||
    openedRow.payload.cCallRef !== cCallRef ||
    fibreRow.payload.cCallRef !== cCallRef ||
    openedRow.payload.callClass !== fibreRow.payload.callClass ||
    evidenceRefs.some((value) => value === null) ||
    new Set(evidenceRefs).size !== evidenceRefs.length ||
    phaseRows.some((row) => row.admissionOrdinal <= fibreRow.admissionOrdinal) ||
    evidence.some((row, index) =>
      index > 0 && row.admissionOrdinal <= evidence[index - 1]!.admissionOrdinal
    ) ||
    (results[0] !== undefined && evidence.some((row) =>
      row.admissionOrdinal >= results[0]!.admissionOrdinal
    )) ||
    (rejections[0] !== undefined &&
      rejections[0].admissionOrdinal <= fibreRow.admissionOrdinal) ||
    (results[0] !== undefined && rejections[0] !== undefined &&
      rejections[0].admissionOrdinal >= results[0].admissionOrdinal) ||
    (judgments[0] !== undefined &&
      judgments[0].admissionOrdinal <= results[0]!.admissionOrdinal) ||
    (judgments[0] !== undefined && phaseRows.at(-1)?.eventId !== judgments[0].eventId) ||
    phaseRows.some((row, index) => index > 0 &&
      !row.causationEventRefs.includes(phaseRows[index - 1]!.eventId)) ||
    rows.some((row, index) => index > 0 &&
      row.admissionOrdinal <= rows[index - 1]!.admissionOrdinal)
  ) {
    throw new TypeError(
      `CCall ${cCallRef} violates the atomic open/fibre pair or exact phase cardinality`,
    );
  }
  const phase = judgments.length === 1
      ? "judged" as const
      : results.length === 1
        ? "result_admitted" as const
        : evidence.length > 0
          ? "evidencing" as const
          : "selected_no_evidence" as const;
  return deepFreeze({
    kind: "c_call_phase_projection" as const,
    cCallRef,
    phase,
    openedEventRef: openedRow.eventId,
    fibreEventRef: fibre[0]?.eventId ?? null,
    evidenceEventRefs: Object.freeze(evidence.map((event) => event.eventId)),
    resultEventRef: results[0]?.eventId ?? null,
    judgmentEventRef: judgments[0]?.eventId ?? null,
    rejectionEventRef: rejections[0]?.eventId ?? null,
  });
}

export function projectCCallCarrierPhaseAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  cCall: CCall,
): CCallPhaseProjection | null {
  if (!isCCall(cCall)) return null;
  let phase: CCallPhaseProjection;
  try {
    phase = projectCCallPhase(prefix, cCall.cCallRef);
  } catch {
    return null;
  }
  if (
    phase.phase === "not_open" ||
    phase.openedEventRef !== cCall.openedEventRef ||
    phase.fibreEventRef !== cCall.fibreSelectedEventRef
  ) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const opened = events.find((event) => event.eventId === cCall.openedEventRef);
  const fibre = events.find((event) => event.eventId === cCall.fibreSelectedEventRef);
  if (
    opened?.kind !== "c_call_opened" || fibre?.kind !== "c_call_fibre_selected" ||
    opened.aggregateId !== cCall.cCallRef || fibre.aggregateId !== cCall.cCallRef ||
    opened.parentAggregateId !== cCall.frameId || fibre.parentAggregateId !== cCall.frameId ||
    opened.basisId !== cCall.basisId || fibre.basisId !== cCall.basisId ||
    opened.runId !== cCall.runId || fibre.runId !== cCall.runId ||
    opened.graphCallId !== cCall.graphCallId || fibre.graphCallId !== cCall.graphCallId ||
    opened.frameId !== cCall.frameId || fibre.frameId !== cCall.frameId ||
    !isJsonRecord(opened.payload) || !isJsonRecord(fibre.payload) ||
    opened.payload.cCallRef !== cCall.cCallRef ||
    opened.payload.cCallDigest !== cCall.cCallDigest ||
    opened.payload.callClass !== cCall.callClass ||
    opened.payload.cursorRef === undefined ||
    fibre.payload.cCallRef !== cCall.cCallRef ||
    fibre.payload.callClass !== cCall.callClass ||
    fibre.payload.regime !== cCall.regime ||
    fibre.payload.armId !== cCall.armId ||
    fibre.payload.compositionRef !== cCall.compositionRef ||
    fibre.payload.implementationSetRef !== cCall.implementationSetRef
  ) return null;
  return phase;
}

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
export function projectCurrentChildParentCCallAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  coordinates: Readonly<{
    parentCCallRef: string;
    parentExecutionBasisRef: string;
    runId: string;
    graphCallId: string;
    frameId: string;
    childGraphFunctionRef: string;
    admittedInputRef: string;
    admittedInputDigest: Sha256Digest;
  }>,
): CurrentChildParentCCallProjection | null {
  let projectedPhase: CCallPhaseProjection;
  try {
    projectedPhase = projectCCallPhase(prefix, coordinates.parentCCallRef);
  } catch {
    return null;
  }
  if (
    projectedPhase.phase === "not_open" ||
    projectedPhase.openedEventRef === null ||
    projectedPhase.fibreEventRef === null
  ) return null;

  const events = runtimeEventsFromValidatedPrefix(prefix);
  const opened = events.find((event) =>
    event.eventId === projectedPhase.openedEventRef
  );
  const fibre = events.find((event) =>
    event.eventId === projectedPhase.fibreEventRef
  );
  if (
    opened?.kind !== "c_call_opened" ||
    fibre?.kind !== "c_call_fibre_selected" ||
    opened.aggregateId !== coordinates.parentCCallRef ||
    fibre.aggregateId !== coordinates.parentCCallRef ||
    opened.basisId !== coordinates.parentExecutionBasisRef ||
    fibre.basisId !== coordinates.parentExecutionBasisRef ||
    opened.runId !== coordinates.runId ||
    fibre.runId !== coordinates.runId ||
    opened.graphCallId !== coordinates.graphCallId ||
    fibre.graphCallId !== coordinates.graphCallId ||
    opened.frameId !== coordinates.frameId ||
    fibre.frameId !== coordinates.frameId ||
    !isJsonRecord(opened.payload) ||
    !isJsonRecord(fibre.payload) ||
    typeof opened.payload.cCallDigest !== "string" ||
    typeof opened.payload.callClass !== "string" ||
    typeof opened.payload.vectorIndex !== "number" ||
    typeof opened.payload.stageRole !== "string" ||
    (opened.payload.taskOrdinal !== null &&
      typeof opened.payload.taskOrdinal !== "number") ||
    typeof opened.payload.attempt !== "number" ||
    typeof opened.payload.programLocusRef !== "string" ||
    !Array.isArray(opened.payload.retryPath) ||
    typeof opened.payload.cursorRef !== "string" ||
    typeof fibre.payload.regime !== "string" ||
    typeof fibre.payload.armId !== "string" ||
    typeof fibre.payload.implementationSetRef !== "string"
  ) return null;

  const carrier = {
    kind: "c_call" as const,
    schemaVersion: "5.0.0" as const,
    cCallRef: coordinates.parentCCallRef,
    cCallDigest: opened.payload.cCallDigest as Sha256Digest,
    callClass: opened.payload.callClass,
    basisId: coordinates.parentExecutionBasisRef,
    runId: coordinates.runId,
    graphFunctionRef: opened.graphFunctionRef ?? "",
    graphCallId: coordinates.graphCallId,
    frameId: coordinates.frameId,
    vectorIndex: opened.payload.vectorIndex,
    stageRole: opened.payload.stageRole,
    taskOrdinal: opened.payload.taskOrdinal,
    attempt: opened.payload.attempt,
    programLocusRef: opened.payload.programLocusRef,
    retryPath: opened.payload.retryPath,
    regime: fibre.payload.regime,
    armId: fibre.payload.armId,
    compositionRef: fibre.payload.compositionRef ?? null,
    implementationSetRef: fibre.payload.implementationSetRef,
    childGraphFunctionRef: opened.payload.childGraphFunctionRef ?? null,
    failureContractRef: opened.payload.failureContractRef ?? "",
    openedEventRef: opened.eventId,
    fibreSelectedEventRef: fibre.eventId,
  } as unknown as CCall;
  const carrierPhase = projectCCallCarrierPhaseAtPrefix(prefix, carrier);
  if (carrierPhase === null || carrierPhase.phase !== projectedPhase.phase) {
    return null;
  }

  const calculus = deriveRuntimeEventCalculusProjection(prefix);
  const commonActive = [
    constructRuntimeFluent({ name: "run_active", identity: coordinates.runId }),
    constructRuntimeFluent({
      name: "graph_call_active",
      identity: coordinates.graphCallId,
    }),
    constructRuntimeFluent({
      name: "frame_active",
      identity: coordinates.frameId,
    }),
    constructRuntimeFluent({
      name: "locus_active",
      identity: opened.payload.cursorRef,
    }),
  ].every((fluent) => holdsAt(calculus, fluent));
  if (!commonActive) return null;

  if (
    carrier.callClass === "workflow" &&
    carrierPhase.phase === "selected_no_evidence" &&
    carrier.childGraphFunctionRef === coordinates.childGraphFunctionRef &&
    fibre.payload.childGraphFunctionRef === coordinates.childGraphFunctionRef &&
    holdsAt(
      calculus,
      constructRuntimeFluent({
        name: "c_call_active",
        identity: coordinates.parentCCallRef,
      }),
    )
  ) {
    return deepFreeze({
      kind: "current_child_parent_c_call_projection" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "workflow_open" as const,
      cCallRef: coordinates.parentCCallRef,
      sourceCursorRef: opened.payload.cursorRef,
      causationEventRef: fibre.eventId,
      resultRef: null,
      judgmentRef: null,
    });
  }

  const result = projectedPhase.resultEventRef === null
    ? undefined
    : events.find((event) => event.eventId === projectedPhase.resultEventRef);
  const judgment = projectedPhase.judgmentEventRef === null
    ? undefined
    : events.find((event) => event.eventId === projectedPhase.judgmentEventRef);
  if (
    carrier.callClass !== "leaf" ||
    carrierPhase.phase !== "judged" ||
    typeof carrier.compositionRef !== "string" ||
    carrier.compositionRef.length === 0 ||
    result?.kind !== "c_call_result_admitted" ||
    judgment?.kind !== "c_call_judged" ||
    !isJsonRecord(result.payload) ||
    !isJsonRecord(judgment.payload) ||
    result.payload.cCallRef !== coordinates.parentCCallRef ||
    result.payload.resultRef !== coordinates.admittedInputRef ||
    result.payload.valueDigest !== coordinates.admittedInputDigest ||
    judgment.payload.cCallRef !== coordinates.parentCCallRef ||
    judgment.payload.resultRef !== coordinates.admittedInputRef ||
    judgment.payload.resultDigest !== result.payload.resultDigest ||
    judgment.payload.judgment !== "advance" ||
    typeof judgment.payload.judgmentRef !== "string" ||
    !judgment.causationEventRefs.includes(result.eventId) ||
    !holdsAt(
      calculus,
      constructRuntimeFluent({
        name: "c_call_judgment_available",
        identity: judgment.payload.judgmentRef,
      }),
    )
  ) return null;

  return deepFreeze({
    kind: "current_child_parent_c_call_projection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "deferred_application_ready" as const,
    cCallRef: coordinates.parentCCallRef,
    sourceCursorRef: opened.payload.cursorRef,
    causationEventRef: judgment.eventId,
    resultRef: coordinates.admittedInputRef,
    judgmentRef: judgment.payload.judgmentRef,
  });
}

interface CCallOpeningAuthority {
  readonly expectedStorePrefixDigest: Sha256Digest;
  readonly authorityPrefix: ValidatedRuntimeEventPrefix;
  readonly runPrefix: ValidatedRuntimeEventPrefix;
  readonly executionBasis: ExecutionBasis;
  readonly scope: OpenedTraversalScope;
  readonly cursorAdmissionEventRef: string;
}

function sameCanonicalValue(left: unknown, right: unknown): boolean {
  try {
    return sha256Canonical(left as JsonValue) ===
      sha256Canonical(right as JsonValue);
  } catch {
    return false;
  }
}

function projectCCallOpeningAuthority(
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
  cursor: TraversalCursorCandidate,
): CCallOpeningAuthority | null {
  try {
    assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
    const snapshot = readRuntimeEventsAtDurablePrefix(predecessorPrefix);
    const expectedStorePrefixDigest = sha256Canonical(
      snapshot as unknown as JsonValue,
    );
    if (store.digest() !== expectedStorePrefixDigest) return null;
    const authorityPrefix = selectValidatedRuntimeEventPrefix(snapshot);
    const runPrefix = selectValidatedRuntimeEventPrefix(
      runtimeEventsFromValidatedPrefix(authorityPrefix),
      { runId: scope.runId },
    );
    const exactBasis = rehydrateExecutionBasisAtPrefix(
      authorityPrefix,
      executionBasis.basisRef,
    );
    const exactScope = rehydrateOpenedTraversalScopeAtPrefix(
      runPrefix,
      scope as unknown as Readonly<Record<string, JsonValue>>,
    );
    const cursorAdmissionEventRef = traversalCursorAdmissionEventRefAtPrefix(
      runPrefix,
      cursor,
    );
    if (
      exactBasis === null ||
      exactScope === null ||
      cursorAdmissionEventRef === null ||
      !sameCanonicalValue(exactBasis, executionBasis) ||
      !sameCanonicalValue(exactScope, scope) ||
      exactScope.executionBasisRef !== exactBasis.basisRef ||
      cursor.executionBasisRef !== exactBasis.basisRef ||
      cursor.traversalScopeRef !== exactScope.scopeRef ||
      cursor.runId !== exactScope.runId ||
      cursor.graphCallId !== exactScope.graphCallId ||
      cursor.frameId !== exactScope.frameId
    ) return null;
    const calculus = deriveRuntimeEventCalculusProjection(runPrefix);
    if (![
      constructRuntimeFluent({
        name: "run_active",
        identity: exactScope.runId,
      }),
      constructRuntimeFluent({
        name: "graph_call_active",
        identity: exactScope.graphCallId,
      }),
      constructRuntimeFluent({
        name: "frame_active",
        identity: exactScope.frameId,
      }),
      constructRuntimeFluent({
        name: "locus_active",
        identity: cursor.cursorRef,
      }),
    ].every((fluent) => holdsAt(calculus, fluent))) return null;
    return deepFreeze({
      expectedStorePrefixDigest,
      authorityPrefix,
      runPrefix,
      executionBasis: exactBasis,
      scope: exactScope,
      cursorAdmissionEventRef,
    });
  } catch {
    return null;
  }
}

function cCallPhasePermitsOpening(
  prefix: ValidatedRuntimeEventPrefix,
  cCallRef: string,
): boolean {
  try {
    return projectCCallPhase(prefix, cCallRef).phase === "not_open";
  } catch {
    return false;
  }
}

export function projectAdmittedCCallResultAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  cCall: CCall,
  result: AdmittedCCallResult,
): AdmittedCCallResult | null {
  const phase = projectCCallCarrierPhaseAtPrefix(prefix, cCall);
  if (
    phase === null ||
    (phase.phase !== "result_admitted" && phase.phase !== "judged") ||
    phase.resultEventRef !== result.admissionEventRef ||
    !isAdmittedCCallResult(result) || result.cCallRef !== cCall.cCallRef
  ) return null;
  const event = runtimeEventsFromValidatedPrefix(prefix).find((candidate) =>
    candidate.eventId === result.admissionEventRef
  );
  return exactEventBody(event, "c_call_result_admitted", {
      resultRef: result.resultRef,
      resultDigest: result.resultDigest,
      ...admittedResultBody(result),
    })
    ? result
    : null;
}

export function projectAdmittedCCallOutcomeAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
): RehydratedAdmittedCCallState | null {
  const phase = projectCCallCarrierPhaseAtPrefix(prefix, cCall);
  if (
    phase?.phase !== "judged" ||
    phase.judgmentEventRef !== judgment.admissionEventRef ||
    projectAdmittedCCallResultAtPrefix(prefix, cCall, result) === null ||
    !isAdmittedCCallJudgment(judgment) ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    judgment.resultDigest !== result.resultDigest
  ) return null;
  const event = runtimeEventsFromValidatedPrefix(prefix).find((candidate) =>
    candidate.eventId === judgment.admissionEventRef
  );
  return exactEventBody(event, "c_call_judged", {
      judgmentRef: judgment.judgmentRef,
      judgmentDigest: judgment.judgmentDigest,
      ...admittedJudgmentBody(judgment),
    }) && event!.causationEventRefs.includes(result.admissionEventRef)
    ? deepFreeze({ cCall, result, judgment })
    : null;
}

function isJsonRecord(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCCall(value: object): boolean {
  const cCall = value as CCall;
  if (
    cCall.kind !== "c_call" || cCall.schemaVersion !== "5.0.0" ||
    (cCall.callClass !== "leaf" && cCall.callClass !== "workflow") ||
    !Array.isArray(cCall.retryPath) ||
    typeof cCall.openedEventRef !== "string" ||
    typeof cCall.fibreSelectedEventRef !== "string"
  ) return false;
  const commonIdentity = {
    basisId: cCall.basisId,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    vectorIndex: cCall.vectorIndex,
    stageRole: cCall.stageRole,
    taskOrdinal: cCall.taskOrdinal,
    attempt: cCall.attempt,
    programLocusRef: cCall.programLocusRef,
    retryPath: cCall.retryPath,
  };
  const identity = cCall.callClass === "workflow"
    ? {
        ...commonIdentity,
        childGraphFunctionRef: cCall.childGraphFunctionRef,
        failureContractRef: cCall.failureContractRef,
      }
    : commonIdentity;
  return cCall.cCallDigest === sha256Canonical(identity as unknown as JsonValue) &&
    cCall.cCallRef === `c-call:${cCall.cCallDigest}`;
}

export function isAdmittedCCallResult(value: object): boolean {
  const result = value as AdmittedCCallResult;
  if (
    result.kind !== "admitted_c_call_result" ||
    result.schemaVersion !== "5.0.0" || result.disposition !== "admitted" ||
    typeof result.admissionEventRef !== "string"
  ) return false;
  return result.resultDigest ===
      sha256Canonical(admittedResultBody(result) as unknown as JsonValue) &&
    result.resultRef ===
      `result://abiogenesis/${result.resultDigest.slice("sha256:".length)}` &&
    result.valueDigest === sha256Canonical(result.value);
}

export function isAdmittedCCallJudgment(value: object): boolean {
  const judgment = value as AdmittedCCallJudgment;
  if (
    judgment.kind !== "admitted_c_call_judgment" ||
    judgment.schemaVersion !== "5.0.0" ||
    judgment.disposition !== "admitted" ||
    typeof judgment.admissionEventRef !== "string"
  ) return false;
  return judgment.judgmentDigest ===
      sha256Canonical(admittedJudgmentBody(judgment) as unknown as JsonValue) &&
    judgment.judgmentRef ===
      `judgment://abiogenesis/${judgment.judgmentDigest.slice("sha256:".length)}`;
}

function isAdmittedCCallEvidence(value: object): value is AdmittedCCallEvidence {
  const evidence = value as AdmittedCCallEvidence;
  if (
    evidence.kind !== "admitted_c_call_evidence" ||
    evidence.schemaVersion !== "5.0.0" ||
    evidence.disposition !== "admitted" ||
    typeof evidence.admissionEventRef !== "string"
  ) return false;
  return evidence.evidenceDigest ===
      sha256Canonical(admittedEvidencePayload(evidence) as unknown as JsonValue) &&
    evidence.evidenceRef ===
      `evidence://abiogenesis/${evidence.evidenceDigest.slice("sha256:".length)}`;
}

function isAdmissionRejection(value: object): value is CCallAdmissionRejection {
  const candidate = value as CCallAdmissionRejection;
  return candidate.kind === "c_call_admission_rejection" &&
    candidate.schemaVersion === "5.0.0" && candidate.disposition === "rejected" &&
    ["evidence", "judgment", "result"].includes(candidate.stage) &&
    typeof candidate.cCallRef === "string" &&
    /^sha256:[a-f0-9]{64}$/u.test(candidate.candidateDigest) &&
    typeof candidate.contractRef === "string" &&
    candidate.diagnosticRef.startsWith("diagnostic://abiogenesis/");
}

function isChildFoldbackAdmission(
  value: object,
): value is ChildFoldbackAdmission {
  const foldback = value as ChildFoldbackAdmission;
  if (
    foldback.kind !== "child_foldback_admission" ||
    foldback.schemaVersion !== "5.0.0" ||
    foldback.disposition !== "admitted" ||
    typeof foldback.admissionEventRef !== "string"
  ) return false;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    foldbackRef: _foldbackRef,
    foldbackDigest: _foldbackDigest,
    admissionEventRef: _admissionEventRef,
    successorPrefix: _successorPrefix,
    ...body
  } = foldback;
  return foldback.foldbackDigest ===
      sha256Canonical(body as unknown as JsonValue) &&
    foldback.foldbackRef ===
      `child-foldback://abiogenesis/${foldback.foldbackDigest.slice("sha256:".length)}`;
}

function openRefusal(
  code: CCallOpenRefusal["code"],
  message: string,
): CCallOpenRefusal {
  return {
    kind: "c_call_open_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function rejection(
  cCall: CCall,
  stage: CCallAdmissionRejection["stage"],
  candidate: JsonValue,
  contractRef: string,
  diagnosticRef: string,
): CCallAdmissionRejection {
  const value = deepFreeze({
    kind: "c_call_admission_rejection",
    schemaVersion: "5.0.0",
    disposition: "rejected",
    cCallRef: cCall.cCallRef,
    stage,
    candidateDigest: sha256Canonical(candidate),
    contractRef,
    diagnosticRef,
  }) as CCallAdmissionRejection;
  return value;
}

function runtimeFailureCloseRefusal(
  code: CCallRuntimeFailureCloseRefusal["code"],
  message: string,
): CCallRuntimeFailureCloseRefusal {
  return {
    kind: "c_call_runtime_failure_close_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function exactCCallRows(
  prefix: ValidatedRuntimeEventPrefix,
  cCallRef: string,
) {
  return runtimeEventsFromValidatedPrefix(prefix).filter(
    (event) =>
      event.aggregateType === "c_call" &&
      event.aggregateId === cCallRef,
  );
}

function projectCCallOwnerPrefix(
  store: AbgEventStore,
  cCall: CCall,
): ReturnType<typeof projectCCallOwnerAtPrefix> {
  const snapshot = store.readAll();
  const expectedStorePrefixDigest = sha256Canonical(
    snapshot as unknown as JsonValue,
  );
  if (store.digest() !== expectedStorePrefixDigest) return null;
  return projectCCallOwnerAtPrefix(
    selectValidatedRuntimeEventPrefix(snapshot),
    cCall,
  );
}

function projectCCallOwnerAtPrefix(
  authorityPrefix: ValidatedRuntimeEventPrefix,
  cCall: CCall,
): Readonly<{
  prefix: ValidatedRuntimeEventPrefix;
  authorityPrefix: ValidatedRuntimeEventPrefix;
  phase: CCallPhaseProjection;
  rows: readonly RuntimeEvent[];
  expectedStorePrefixDigest: Sha256Digest;
}> | null {
  const snapshot = runtimeEventsFromValidatedPrefix(authorityPrefix);
  const expectedStorePrefixDigest = sha256Canonical(
    snapshot as unknown as JsonValue,
  );
  const prefix = selectValidatedRuntimeEventPrefix(
    snapshot,
    {
      runId: cCall.runId,
    },
  );
  const phase = projectCCallCarrierPhaseAtPrefix(prefix, cCall);
  return phase === null
    ? null
    : deepFreeze({
        prefix,
        authorityPrefix,
        phase,
        rows: exactCCallRows(prefix, cCall.cCallRef),
        expectedStorePrefixDigest,
      });
}

interface AdmittedProbabilisticTransportProjection {
  readonly kind: "admitted_probabilistic_transport_projection";
  readonly cCallRef: string;
  readonly failureClass: WorkerTransportFailureClass | null;
  readonly stableFailureSource: Readonly<Record<string, JsonValue>> | null;
}

function projectAdmittedProbabilisticTransport(
  prefix: ValidatedRuntimeEventPrefix,
  cCallRef: string,
  source: Readonly<Record<string, JsonValue>>,
): AdmittedProbabilisticTransportProjection | null {
  if (
    (source.candidateRef !== null &&
      typeof source.candidateRef !== "string") ||
    (source.candidateDigest !== null &&
      typeof source.candidateDigest !== "string") ||
    typeof source.requestRef !== "string" ||
    typeof source.requestDigest !== "string" ||
    typeof source.rawOutputDigest !== "string" ||
    typeof source.actorInvocationRef !== "string" ||
    typeof source.actorRef !== "string" ||
    typeof source.workerBindingRef !== "string" ||
    typeof source.implementationRef !== "string" ||
    typeof source.inputDigest !== "string" ||
    typeof source.observedOutputDigest !== "string" ||
    typeof source.outputDigest !== "string" ||
    typeof source.processRef !== "string" ||
    typeof source.transportBindingRef !== "string" ||
    typeof source.transportBindingDigest !== "string" ||
    typeof source.materializationPlanRef !== "string" ||
    typeof source.rendererRef !== "string" ||
    typeof source.instructionContractRef !== "string" ||
    typeof source.resultContractRef !== "string" ||
    typeof source.promptDigest !== "string" ||
    typeof source.transportDigest !== "string" ||
    (source.transportLane !== "closed_prompt_proof" &&
      source.transportLane !== "worker_executes") ||
    (source.transportDisposition !== "failure" &&
      source.transportDisposition !== "success") ||
    (source.transportFailureClass !== null &&
      !isWorkerTransportFailureClass(source.transportFailureClass)) ||
    (typeof source.processStatus !== "number" && source.processStatus !== null) ||
    (typeof source.processSignal !== "string" && source.processSignal !== null) ||
    typeof source.timedOut !== "boolean" ||
    typeof source.exitObserved !== "boolean" ||
    typeof source.terminationConfirmed !== "boolean" ||
    !Array.isArray(source.signalSequence) ||
    !source.signalSequence.every((value) => typeof value === "string") ||
    !Number.isSafeInteger(source.structuredEventCount) ||
    !Number.isSafeInteger(source.progressEventCount) ||
    !Number.isSafeInteger(source.toolCallCount) ||
    !Number.isSafeInteger(source.apiRetryCount) ||
    !Number.isSafeInteger(source.stdoutByteLength) ||
    !Number.isSafeInteger(source.stderrByteLength) ||
    !isJsonRecord(source.artifactDigests) ||
    typeof source.artifactDigests.output !== "string" ||
    typeof source.artifactDigests.stdout !== "string" ||
    typeof source.artifactDigests.stderr !== "string"
  ) return null;
  if (
    ((source.candidateRef === null) !== (source.candidateDigest === null)) ||
    (source.candidateDigest !== null &&
      (!isSha256Digest(source.candidateDigest) ||
        source.candidateRef !==
          `probabilistic-result-candidate://abiogenesis/${source.candidateDigest.slice("sha256:".length)}`)) ||
    !isSha256Digest(source.requestDigest) ||
    source.requestRef !==
      `probabilistic-request://abiogenesis/${source.requestDigest.slice("sha256:".length)}` ||
    !isSha256Digest(source.rawOutputDigest)
  ) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const lifecycle = (() => {
    try {
      return projectActorProcessLifecycle(prefix, source.actorInvocationRef as string);
    } catch {
      return null;
    }
  })();
  if (
    lifecycle === null || lifecycle.actorTerminalEventRef === null ||
    lifecycle.processTerminalEventRef === null ||
    lifecycle.cleanupDisposition !== "complete"
  ) return null;
  const bindingRows = events.filter((event) =>
    event.kind === "actor_transport_binding_admitted" &&
    event.aggregateId === source.transportBindingRef
  );
  const actorStartedRows = events.filter((event) =>
    event.kind === "actor_invocation_started" &&
    event.aggregateId === source.actorInvocationRef
  );
  const processStartedRows = events.filter((event) =>
    event.kind === "actor_process_started" &&
    event.aggregateId === source.processRef &&
    event.parentAggregateId === source.actorInvocationRef
  );
  const terminal = events.find((event) =>
    event.eventId === lifecycle.actorTerminalEventRef
  );
  const processTerminal = events.find((event) =>
    event.eventId === lifecycle.processTerminalEventRef
  );
  const artifactEventRef = terminal !== undefined && isJsonRecord(terminal.payload) &&
      typeof terminal.payload.consumedArtifactEventRef === "string"
    ? terminal.payload.consumedArtifactEventRef
    : null;
  const artifact = artifactEventRef === null
    ? undefined
    : events.find((event) => event.eventId === artifactEventRef);
  const fibreRows = events.filter((event) =>
    event.kind === "c_call_fibre_selected" && event.aggregateId === cCallRef
  );
  const binding = bindingRows[0];
  const actorStarted = actorStartedRows[0];
  const fibre = fibreRows[0];
  if (
    bindingRows.length !== 1 || actorStartedRows.length !== 1 ||
    fibreRows.length !== 1 || binding === undefined || actorStarted === undefined ||
    fibre === undefined || terminal === undefined || processTerminal === undefined ||
    artifact?.kind !== "actor_result_artifact_observed" ||
    !isJsonRecord(binding.payload) || !isJsonRecord(actorStarted.payload) ||
    !isJsonRecord(fibre.payload) || !isJsonRecord(terminal.payload) ||
    !isJsonRecord(processTerminal.payload) || !isJsonRecord(artifact.payload)
  ) return null;
  const { transportBindingRef: _bindingRef, transportBindingDigest, ...bindingBody } =
    binding.payload;
  const bindingIdentityValid = transportBindingDigest ===
      sha256Canonical(bindingBody as unknown as JsonValue) &&
    source.transportBindingDigest === transportBindingDigest &&
    source.transportBindingRef ===
      `transport-binding://abiogenesis/${String(transportBindingDigest).slice("sha256:".length)}`;
  const joined = bindingIdentityValid &&
    binding.parentAggregateId === cCallRef &&
    binding.payload.cCallRef === cCallRef &&
    binding.payload.workerBindingRef === source.workerBindingRef &&
    binding.payload.implementationBindingRef === fibre.payload.implementationBindingRef &&
    binding.payload.implementationRef === source.implementationRef &&
    actorStarted.parentAggregateId === cCallRef &&
    actorStarted.payload.cCallRef === cCallRef &&
    actorStarted.payload.actorInvocationRef === source.actorInvocationRef &&
    actorStarted.payload.actorRef === source.actorRef &&
    actorStarted.payload.workerBindingRef === source.workerBindingRef &&
    actorStarted.payload.implementationRef === source.implementationRef &&
    actorStarted.payload.inputDigest === source.inputDigest &&
    actorStarted.payload.promptDigest === source.promptDigest &&
    actorStarted.payload.requestRef === source.requestRef &&
    actorStarted.payload.requestDigest === source.requestDigest &&
    actorStarted.payload.transportBindingRef === source.transportBindingRef &&
    actorStarted.payload.transportBindingDigest === source.transportBindingDigest &&
    actorStarted.causationEventRefs.length === 1 &&
    actorStarted.causationEventRefs[0] === binding.eventId &&
    terminal.aggregateId === source.actorInvocationRef &&
    terminal.parentAggregateId === cCallRef && terminal.payload.cCallRef === cCallRef &&
    terminal.payload.actorInvocationRef === source.actorInvocationRef &&
    terminal.payload.processRef === source.processRef &&
    terminal.payload.transportBindingRef === source.transportBindingRef &&
    terminal.payload.transportBindingDigest === source.transportBindingDigest &&
    terminal.payload.disposition === source.transportDisposition &&
    terminal.payload.failureClass === source.transportFailureClass &&
    terminal.causationEventRefs.length === 1 &&
    terminal.causationEventRefs[0] === artifact.eventId &&
    processTerminal.aggregateId === source.processRef &&
    processTerminal.parentAggregateId === source.actorInvocationRef &&
    processTerminal.payload.actorInvocationRef === source.actorInvocationRef &&
    processTerminal.payload.processRef === source.processRef &&
    artifact.aggregateId === source.actorInvocationRef &&
    artifact.parentAggregateId === cCallRef && artifact.payload.cCallRef === cCallRef &&
    artifact.payload.actorInvocationRef === source.actorInvocationRef &&
    artifact.payload.actorRef === source.actorRef &&
    artifact.payload.workerBindingRef === source.workerBindingRef &&
    artifact.payload.implementationRef === source.implementationRef &&
    artifact.payload.inputDigest === source.inputDigest &&
    artifact.payload.requestRef === source.requestRef &&
    artifact.payload.requestDigest === source.requestDigest &&
    artifact.payload.materializationPlanRef === source.materializationPlanRef &&
    artifact.payload.rendererRef === source.rendererRef &&
    artifact.payload.instructionContractRef === source.instructionContractRef &&
    artifact.payload.resultContractRef === source.resultContractRef &&
    artifact.payload.processRef === source.processRef &&
    artifact.payload.transportBindingRef === source.transportBindingRef &&
    artifact.payload.transportBindingDigest === source.transportBindingDigest &&
    artifact.payload.observedOutputDigest === source.observedOutputDigest &&
    typeof artifact.payload.finalOutput === "string" &&
    sha256Bytes(artifact.payload.finalOutput) ===
      source.rawOutputDigest &&
    artifact.payload.promptDigest === source.promptDigest &&
    artifact.payload.transportDigest === source.transportDigest &&
    artifact.payload.transportLane === source.transportLane &&
    artifact.payload.disposition === source.transportDisposition &&
    artifact.payload.failureClass === source.transportFailureClass &&
    artifact.payload.processStatus === source.processStatus &&
    artifact.payload.processSignal === source.processSignal &&
    artifact.payload.timedOut === source.timedOut &&
    artifact.payload.exitObserved === source.exitObserved &&
    artifact.payload.terminationConfirmed === source.terminationConfirmed &&
    artifact.payload.structuredEventCount === source.structuredEventCount &&
    artifact.payload.progressEventCount === source.progressEventCount &&
    artifact.payload.toolCallCount === source.toolCallCount &&
    artifact.payload.apiRetryCount === source.apiRetryCount &&
    artifact.payload.stdoutByteLength === source.stdoutByteLength &&
    artifact.payload.stderrByteLength === source.stderrByteLength &&
    sha256Canonical(artifact.payload.signalSequence as JsonValue) ===
      sha256Canonical(source.signalSequence as JsonValue) &&
    sha256Canonical(artifact.payload.artifactDigests as JsonValue) ===
      sha256Canonical(source.artifactDigests as JsonValue);
  if (!joined || typeof binding.payload.parser !== "string" ||
    typeof artifact.payload.finalOutput !== "string") return null;
  const actorRows = events.filter((event) =>
    event.aggregateId === source.actorInvocationRef ||
    event.parentAggregateId === source.actorInvocationRef
  );
  const timeoutObserved = actorRows.some((event) =>
    event.kind === "actor_process_timeout_observed"
  );
  const signals = actorRows.filter((event) =>
    event.kind === "actor_process_signal_requested" && isJsonRecord(event.payload)
  ).map((event) => (event.payload as Readonly<Record<string, JsonValue>>).signal);
  const streamBytes = (kind: RuntimeEvent["kind"]): number =>
    actorRows.filter((event) => event.kind === kind && isJsonRecord(event.payload))
      .reduce((sum, event) =>
        sum + Number(
          (event.payload as Readonly<Record<string, JsonValue>>).byteLength,
        ), 0);
  const classified = classifyWorkerTransportFailure({
    parser: binding.payload.parser as "claude_stream_json" | "plain_text",
    lane: source.transportLane,
    processStatus: source.processStatus as number | null,
    timedOut: source.timedOut,
    terminationConfirmed: source.terminationConfirmed,
    processSpawnFailed:
      lifecycle.processTerminalKind === "actor_process_spawn_failed",
    structuredEventCount: Number(source.structuredEventCount),
    toolCallCount: Number(source.toolCallCount),
    apiRetryCount: Number(source.apiRetryCount),
    finalOutput: artifact.payload.finalOutput,
  });
  if (
    classified !== source.transportFailureClass ||
    source.transportDisposition !== (classified === null ? "success" : "failure") ||
    source.timedOut !== timeoutObserved ||
    sha256Canonical(signals as unknown as JsonValue) !==
      sha256Canonical(source.signalSequence as JsonValue) ||
    streamBytes("actor_process_stdout_observed") !== source.stdoutByteLength ||
    streamBytes("actor_process_stderr_observed") !== source.stderrByteLength ||
    (lifecycle.processTerminalKind === "actor_process_exited" &&
      (processStartedRows.length !== 1 ||
        processTerminal.payload.status !== source.processStatus ||
        processTerminal.payload.signal !== source.processSignal)) ||
    (lifecycle.processTerminalKind === "actor_process_spawn_failed" &&
      processStartedRows.length !== 0)
  ) return null;
  const stableFailureSource = classified === null ? null : deepFreeze({
    failureClass: classified,
    sourceClass: "probabilistic_transport",
    candidateRef: source.candidateRef,
    candidateDigest: source.candidateDigest,
    requestRef: source.requestRef,
    requestDigest: source.requestDigest,
    rawOutputDigest: source.rawOutputDigest,
    transportDisposition: "failure",
    transportClass: classified,
    transportLane: source.transportLane,
    status: source.processStatus,
    signal: source.processSignal,
    timedOut: source.timedOut,
    exitObserved: source.exitObserved,
    terminationConfirmed: source.terminationConfirmed,
    signalSequence: source.signalSequence,
    structuredEventCount: source.structuredEventCount,
    progressEventCount: source.progressEventCount,
    toolCallCount: source.toolCallCount,
    apiRetryCount: source.apiRetryCount,
    stdoutByteLength: source.stdoutByteLength,
    stderrByteLength: source.stderrByteLength,
    observedOutputDigest: source.observedOutputDigest,
    outputDigest: source.outputDigest,
    artifactOutputDigest: source.artifactDigests.output,
    artifactStdoutDigest: source.artifactDigests.stdout,
    artifactStderrDigest: source.artifactDigests.stderr,
  } as unknown as Readonly<Record<string, JsonValue>>);
  return deepFreeze({
    kind: "admitted_probabilistic_transport_projection" as const,
    cCallRef,
    failureClass: classified,
    stableFailureSource,
  });
}

function hasAdmittedActorEvidence(
  store: AbgEventStore,
  cCall: CCall,
  candidate: ProbabilisticTransportEvidenceCandidate,
): boolean {
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll());
  return projectAdmittedProbabilisticTransport(
    prefix,
    cCall.cCallRef,
    candidate as unknown as Readonly<Record<string, JsonValue>>,
  ) !== null;
}

interface ExactCCallRuntimeFailureSource {
  readonly sourceRef: string;
  readonly sourceEventRef: string | null;
  readonly signal: CCallRuntimeFailureSignal;
}

function isWorkerTransportFailureClass(
  value: JsonValue | undefined,
): value is WorkerTransportFailureClass {
  return typeof value === "string" &&
    WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(
      value as WorkerTransportFailureClass,
    );
}

function deriveRuntimeFailureSignal(
  failureClass: WorkerTransportFailureClass,
  sourceClass: CCallRuntimeFailureSignal["sourceClass"],
  stableSource: Readonly<Record<string, JsonValue>>,
): ExactCCallRuntimeFailureSource {
  const sourceDigest = sha256Canonical(stableSource as unknown as JsonValue);
  const sourceRef =
    `runtime-failure-source://abiogenesis/${sourceDigest.slice("sha256:".length)}`;
  const failureSignalDigest = sha256Canonical({
    schemaVersion: "5.0.0",
    failureClass,
    sourceClass,
    sourceDigest,
  });
  const failureSignalRef =
    `retry-failure-signal://abiogenesis/${failureSignalDigest.slice("sha256:".length)}`;
  return deepFreeze({
    sourceRef,
    sourceEventRef: null,
    signal: {
      kind: "c_call_runtime_failure_signal" as const,
      schemaVersion: "5.0.0" as const,
      failureClass,
      sourceClass,
      sourceDigest,
      failureSignalDigest,
      failureSignalRef,
    },
  });
}

function deriveContractRejectionFailureSource(
  rejectionSource: Pick<
    CCallAdmissionRejection,
    "candidateDigest" | "contractRef" | "diagnosticRef" | "stage"
  >,
): ExactCCallRuntimeFailureSource {
  return deriveRuntimeFailureSignal(
    "contract_failure",
    "deterministic_output_rejection",
    {
      failureClass: "contract_failure",
      sourceClass: "deterministic_output_rejection",
      stage: rejectionSource.stage,
      candidateDigest: rejectionSource.candidateDigest,
      contractRef: rejectionSource.contractRef,
      diagnosticRef: rejectionSource.diagnosticRef,
    },
  );
}

function exactCCallEvidenceIdentity(event: RuntimeEvent): boolean {
  if (event.kind !== "c_call_evidenced" || !isJsonRecord(event.payload)) {
    return false;
  }
  const {
    evidenceRef,
    evidenceDigest,
    ...body
  } = event.payload;
  return typeof evidenceRef === "string" &&
    typeof evidenceDigest === "string" &&
    evidenceDigest === sha256Canonical(body as unknown as JsonValue) &&
    evidenceRef ===
      `evidence://abiogenesis/${evidenceDigest.slice("sha256:".length)}`;
}

function exactProbabilisticFailureSource(
  prefix: ValidatedRuntimeEventPrefix,
  cCallRef: string,
  sourceEventRef: string,
): ExactCCallRuntimeFailureSource | null {
  const evidence = runtimeEventsFromValidatedPrefix(prefix).find((event) =>
    event.eventId === sourceEventRef
  );
  if (
    evidence?.aggregateType !== "c_call" || evidence.aggregateId !== cCallRef ||
    evidence.parentAggregateId === null || !exactCCallEvidenceIdentity(evidence) ||
    !isJsonRecord(evidence.payload) || evidence.payload.cCallRef !== cCallRef ||
    evidence.payload.evidenceClass !== "probabilistic_transport"
  ) return null;
  const projection = projectAdmittedProbabilisticTransport(
    prefix,
    cCallRef,
    evidence.payload,
  );
  if (
    projection?.failureClass === null ||
    projection?.failureClass === undefined ||
    projection.stableFailureSource === null
  ) return null;
  const resolved = deriveRuntimeFailureSignal(
    projection.failureClass,
    "probabilistic_transport",
    projection.stableFailureSource,
  );
  return deepFreeze({ ...resolved, sourceEventRef: evidence.eventId });
}
function exactContractRejectionFailureSource(
  prefix: ValidatedRuntimeEventPrefix,
  cCallRef: string,
  sourceEventRef: string,
): ExactCCallRuntimeFailureSource | null {
  const event = runtimeEventsFromValidatedPrefix(prefix).find((candidate) =>
    candidate.eventId === sourceEventRef
  );
  if (
    event?.aggregateType !== "c_call" || event.aggregateId !== cCallRef ||
    !exactCCallEvidenceIdentity(event) || !isJsonRecord(event.payload) ||
    event.payload.cCallRef !== cCallRef ||
    event.payload.evidenceClass !== "admission_rejection" ||
    event.payload.rejectedStage !== "result" ||
    typeof event.payload.candidateDigest !== "string" ||
    typeof event.payload.rejectedContractRef !== "string" ||
    typeof event.payload.diagnosticRef !== "string"
  ) return null;
  const resolved = deriveContractRejectionFailureSource({
    stage: "result",
    candidateDigest: event.payload.candidateDigest as Sha256Digest,
    contractRef: event.payload.rejectedContractRef,
    diagnosticRef: event.payload.diagnosticRef,
  });
  return deepFreeze({ ...resolved, sourceEventRef: event.eventId });
}

function admittedEvidencePayload(
  evidence: AdmittedCCallEvidence,
): Readonly<Record<string, JsonValue>> {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    evidenceRef: _evidenceRef,
    evidenceDigest: _evidenceDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = evidence;
  return body as unknown as Readonly<Record<string, JsonValue>>;
}

function hasGenericCCallAttemptCoordinates(
  attempt: unknown,
  retryPath: unknown,
): retryPath is readonly number[] {
  return Number.isSafeInteger(attempt) && Number(attempt) > 0 &&
    Array.isArray(retryPath) &&
    retryPath.every((value) =>
      Number.isSafeInteger(value) && Number(value) > 0
    );
}

function projectOpenedLeafCCallCarrier(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  cCallRef: string,
): CCall | null {
  if (!isMaterializedGtlGraph(graph) || cCallRef.length === 0) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const rows = events.filter((event) =>
    event.aggregateType === "c_call" && event.aggregateId === cCallRef
  );
  const opened = rows[0];
  const fibre = rows[1];
  if (
    opened?.kind !== "c_call_opened" ||
    fibre?.kind !== "c_call_fibre_selected" ||
    !isJsonRecord(opened.payload) || !isJsonRecord(fibre.payload) ||
    opened.runId === undefined || opened.graphCallId === undefined ||
    opened.frameId === undefined || opened.basisId === undefined ||
    opened.graphFunctionRef !== graph.graphFunctionRef ||
    opened.materializationRef !== graph.materializationRef ||
    fibre.parentAggregateId !== opened.parentAggregateId ||
    fibre.basisId !== opened.basisId || fibre.runId !== opened.runId ||
    fibre.graphFunctionRef !== opened.graphFunctionRef ||
    fibre.materializationRef !== opened.materializationRef ||
    fibre.graphCallId !== opened.graphCallId || fibre.frameId !== opened.frameId ||
    fibre.causationEventRefs.length !== 1 ||
    fibre.causationEventRefs[0] !== opened.eventId ||
    typeof opened.payload.programLocusRef !== "string" ||
    typeof opened.payload.cursorRef !== "string" ||
    typeof opened.payload.cursorDigest !== "string" ||
    !hasGenericCCallAttemptCoordinates(
      opened.payload.attempt,
      opened.payload.retryPath,
    ) ||
    (opened.payload.taskOrdinal !== null &&
      (!Number.isSafeInteger(opened.payload.taskOrdinal) ||
        Number(opened.payload.taskOrdinal) < 0))
  ) return null;
  const locus = resolveCProgramLocus(
    graph.template,
    opened.payload.programLocusRef,
  );
  if (
    locus.kind === "c_source_path_refusal" ||
    (!isExecutableCLeaf(locus.leaf) && !isInteractionCLeaf(locus.leaf))
  ) return null;
  const declaredTerm = locus.leaf;
  const declaredBatchRef = resolveEnclosingCBatchRef(
    graph.template,
    locus.nodeRef,
    locus.termPath,
  );
  if (declaredBatchRef !== null && typeof declaredBatchRef !== "string") {
    return null;
  }
  const basis = rehydrateExecutionBasisAtPrefix(prefix, opened.basisId);
  if (
    basis === null || basis.graphRef !== graph.materializationRef ||
    basis.graphDigest !== graph.materializationDigest ||
    basis.graphFunctionRef !== graph.graphFunctionRef ||
    basis.graphFunctionDigest !== graph.graphFunctionDigest
  ) return null;
  const retryPath = Object.freeze(
    opened.payload.retryPath.map(Number),
  );
  const identity = {
    basisId: basis.basisRef,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    vectorIndex: declaredTerm.vectorIndex,
    stageRole: declaredTerm.stageRole,
    taskOrdinal: opened.payload.taskOrdinal as number | null,
    attempt: Number(opened.payload.attempt),
    programLocusRef: declaredTerm.programLocusRef,
    retryPath,
  };
  const cCallDigest = sha256Canonical(identity as unknown as JsonValue);
  if (cCallRef !== `c-call:${cCallDigest}`) return null;
  const locusBody = {
    cCallRef,
    cCallDigest,
    callClass: "leaf" as const,
    basisId: basis.basisRef,
    graphFunctionRef: graph.graphFunctionRef,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    edgeRef: basis.entryRef,
    vectorIndex: declaredTerm.vectorIndex,
    stageRole: declaredTerm.stageRole,
    batchRef: declaredBatchRef,
    taskOrdinal: opened.payload.taskOrdinal as number | null,
    attempt: Number(opened.payload.attempt),
    programLocusRef: declaredTerm.programLocusRef,
    retryPath,
    cursorRef: opened.payload.cursorRef,
    cursorDigest: opened.payload.cursorDigest,
  };
  const openedCursorRef = opened.payload.cursorRef;
  const openedCursorDigest = opened.payload.cursorDigest;
  const cursorCause = events.find((event) =>
    event.eventId === opened.causationEventRefs[0] &&
    event.admissionOrdinal < opened.admissionOrdinal &&
    isJsonRecord(event.payload) &&
    ((event.kind === "traversal_cursor_entered" &&
      event.payload.cursorRef === openedCursorRef &&
      event.payload.cursorDigest === openedCursorDigest) ||
      (event.kind === "traversal_route_admitted" &&
        event.payload.targetCursorRef === openedCursorRef &&
        event.payload.targetCursorDigest === openedCursorDigest) ||
      (event.kind === "fh_interaction_resume_admitted" &&
        event.payload.successorCursorRef === openedCursorRef &&
        event.payload.successorCursorDigest === openedCursorDigest))
  );
  if (cursorCause === undefined || opened.parentAggregateId !== opened.frameId ||
    !exactEventBody(opened, "c_call_opened", locusBody)) return null;

  if (isInteractionCLeaf(declaredTerm)) {
    const implementationSet = rehydrateAdmittedImplementationSetAtPrefix(
      prefix,
      basis.rootImplementationSetRef,
    );
    const interactionSet = rehydrateAdmittedInteractionSetAtPrefix(
      prefix,
      basis.interactionSetRef,
    );
    if (
      implementationSet === null || interactionSet === null ||
      implementationSet.implementationSetDigest !==
        basis.rootImplementationSetDigest ||
      interactionSet.interactionSetDigest !== basis.interactionSetDigest
    ) return null;
    const interaction = selectAdmittedInteractionContract(interactionSet, {
      graphFunctionRef: graph.graphFunctionRef,
      nodeRef: locus.nodeRef,
      programLocusRef: declaredTerm.programLocusRef,
      interactionKind: declaredTerm.requirement.interactionKind,
      actorCapabilityRef: declaredTerm.requirement.actorCapabilityRef,
      requestContractRef: declaredTerm.requirement.requestContractRef,
      responseContractRef: declaredTerm.requirement.responseContractRef,
      continuationContractRef:
        declaredTerm.requirement.continuationContractRef,
    });
    const fibreBody = {
      cCallRef,
      callClass: "leaf" as const,
      regime: "F_H" as const,
      armId: declaredTerm.armId,
      compositionRef: declaredTerm.compositionRef,
      implementationSetRef: implementationSet.implementationSetRef,
      implementationRequirementKey: null,
      implementationBindingRef: null,
      implementationRef: null,
      interactionSetRef: interactionSet.interactionSetRef,
      interactionRequirementKey: interaction?.requirementKey ?? null,
      interactionKind: declaredTerm.requirement.interactionKind,
      actorCapabilityRef: declaredTerm.requirement.actorCapabilityRef,
      requestContractRef: declaredTerm.requirement.requestContractRef,
      responseContractRef: declaredTerm.requirement.responseContractRef,
      continuationContractRef:
        declaredTerm.requirement.continuationContractRef,
    };
    if (
      interaction === null || interaction.requirementKey !==
        fibre.payload.interactionRequirementKey ||
      !exactEventBody(fibre, "c_call_fibre_selected", fibreBody)
    ) return null;
    return deepFreeze({
      kind: "c_call" as const,
      schemaVersion: "5.0.0" as const,
      cCallRef,
      cCallDigest,
      callClass: "leaf" as const,
      basisId: basis.basisRef,
      runId: opened.runId,
      graphFunctionRef: graph.graphFunctionRef,
      graphCallId: opened.graphCallId,
      frameId: opened.frameId,
      edgeRef: basis.entryRef,
      vectorIndex: declaredTerm.vectorIndex,
      stageRole: declaredTerm.stageRole,
      batchRef: declaredBatchRef,
      taskOrdinal: opened.payload.taskOrdinal as number | null,
      attempt: Number(opened.payload.attempt),
      programLocusRef: declaredTerm.programLocusRef,
      retryPath,
      regime: "F_H" as const,
      armId: declaredTerm.armId,
      compositionRef: declaredTerm.compositionRef,
      implementationSetRef: implementationSet.implementationSetRef,
      implementationRequirementKey: null,
      implementationBindingRef: null,
      implementationRef: null,
      interactionSetRef: interactionSet.interactionSetRef,
      interactionRequirementKey: interaction.requirementKey,
      interactionKind: declaredTerm.requirement.interactionKind,
      actorCapabilityRef: declaredTerm.requirement.actorCapabilityRef,
      responseContractRef: declaredTerm.requirement.responseContractRef,
      continuationContractRef:
        declaredTerm.requirement.continuationContractRef,
      childGraphFunctionRef: null,
      inputContractRef: declaredTerm.requirement.requestContractRef,
      outputContractRef: declaredTerm.requirement.responseContractRef,
      failureContractRef: basis.refusalContractRef,
      refusalContractRef: basis.refusalContractRef,
      refusalValueKind: basis.refusalValueKind,
      evidenceContractRef: declaredTerm.requirement.requestContractRef,
      judgmentContractRef:
        declaredTerm.requirement.continuationContractRef,
      rejectionContractRef: basis.rejectionContractRef,
      transitionContractRef: basis.transitionContractRef,
      closureContractRef: basis.closureContractRef,
      closureContractDigest: basis.closureContractDigest,
      judgmentPredicateRef: declaredTerm.judgmentPredicateRef,
      terminalPredicateRef: basis.terminalPredicateRef,
      replayProjectionRef: basis.replayProjectionRef,
      terminalKind: basis.terminalKind,
      openedEventRef: opened.eventId,
      fibreSelectedEventRef: fibre.eventId,
    }) as CCall;
  }

  const implementationSet = rehydrateAdmittedImplementationSetAtPrefix(
    prefix,
    basis.implementationSetRef,
  );
  if (implementationSet === null) return null;
  const resolution = selectAdmittedImplementationResolution(
    implementationSet,
    {
      graphFunctionRef: graph.graphFunctionRef,
      nodeRef: locus.nodeRef,
      programLocusRef: declaredTerm.programLocusRef,
      implementationBindingRef:
        declaredTerm.requirement.implementationBindingRef,
    },
  );
  if (
    resolution === null ||
    resolution.requirementKey !== fibre.payload.implementationRequirementKey ||
    resolution.implementationRef !== fibre.payload.implementationRef ||
    resolution.computeRegime !== declaredTerm.fibre ||
    resolution.inputContractRef !== declaredTerm.requirement.inputContractRef ||
    resolution.outputContractRef !== declaredTerm.requirement.outputContractRef ||
    resolution.failureContractRef !== declaredTerm.requirement.failureContractRef ||
    resolution.refusalContractRef !== declaredTerm.requirement.refusalContractRef
  ) return null;
  const fibreBody = {
    cCallRef,
    callClass: "leaf" as const,
    regime: declaredTerm.fibre,
    armId: declaredTerm.armId,
    compositionRef: declaredTerm.compositionRef,
    implementationSetRef: implementationSet.implementationSetRef,
    implementationRequirementKey: resolution.requirementKey,
    implementationBindingRef: resolution.implementationBindingRef,
    implementationRef: resolution.implementationRef,
  };
  if (!exactEventBody(fibre, "c_call_fibre_selected", fibreBody)) return null;
  return deepFreeze({
    kind: "c_call" as const,
    schemaVersion: "5.0.0" as const,
    cCallRef,
    cCallDigest,
    callClass: "leaf" as const,
    basisId: basis.basisRef,
    runId: opened.runId,
    graphFunctionRef: graph.graphFunctionRef,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    edgeRef: basis.entryRef,
    vectorIndex: declaredTerm.vectorIndex,
    stageRole: declaredTerm.stageRole,
    batchRef: declaredBatchRef,
    taskOrdinal: opened.payload.taskOrdinal as number | null,
    attempt: Number(opened.payload.attempt),
    programLocusRef: declaredTerm.programLocusRef,
    retryPath,
    regime: declaredTerm.fibre,
    armId: declaredTerm.armId,
    compositionRef: declaredTerm.compositionRef,
    implementationSetRef: implementationSet.implementationSetRef,
    implementationRequirementKey: resolution.requirementKey,
    implementationBindingRef: resolution.implementationBindingRef,
    implementationRef: resolution.implementationRef,
    interactionSetRef: basis.interactionSetRef,
    interactionRequirementKey: null,
    interactionKind: null,
    actorCapabilityRef: null,
    responseContractRef: null,
    continuationContractRef: null,
    childGraphFunctionRef: null,
    inputContractRef: resolution.inputContractRef,
    outputContractRef: resolution.outputContractRef,
    failureContractRef: resolution.failureContractRef,
    refusalContractRef: resolution.refusalContractRef,
    refusalValueKind: basis.refusalValueKind,
    evidenceContractRef: declaredTerm.requirement.evidenceContractRef,
    judgmentContractRef: declaredTerm.requirement.judgmentContractRef,
    rejectionContractRef: resolution.refusalContractRef,
    transitionContractRef: basis.transitionContractRef,
    closureContractRef: basis.closureContractRef,
    closureContractDigest: basis.closureContractDigest,
    judgmentPredicateRef: declaredTerm.judgmentPredicateRef,
    terminalPredicateRef: basis.terminalPredicateRef,
    replayProjectionRef: basis.replayProjectionRef,
    terminalKind: basis.terminalKind,
    openedEventRef: opened.eventId,
    fibreSelectedEventRef: fibre.eventId,
  }) as CCall;
}

function projectOpenedWorkflowCCallCarrier(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  cCallRef: string,
  sourceCursor: TraversalCursorCandidate,
  graphFunction: Readonly<GraphFunction>,
): CCall | null {
  if (
    !isMaterializedGtlGraph(graph) || cCallRef.length === 0 ||
    graphFunction.name !== graph.graphFunctionRef ||
    sha256Canonical(graphFunction as unknown as JsonValue) !==
      graph.graphFunctionDigest ||
    !hasAdmittedTraversalCursorAtPrefix(prefix, sourceCursor) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    !hasGenericCCallAttemptCoordinates(
      sourceCursor.attempt,
      sourceCursor.retryPath,
    )
  ) return null;
  const basis = rehydrateExecutionBasisAtPrefix(
    prefix,
    sourceCursor.executionBasisRef,
  );
  if (
    basis === null || basis.graphRef !== graph.materializationRef ||
    basis.graphDigest !== graph.materializationDigest ||
    basis.graphFunctionRef !== graph.graphFunctionRef ||
    basis.graphFunctionDigest !== graph.graphFunctionDigest ||
    basis.programRef !== sourceCursor.programRef ||
    sourceCursor.runId.length === 0 || sourceCursor.graphCallId.length === 0 ||
    sourceCursor.frameId.length === 0
  ) return null;
  const declaredTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const declaredBatchRef = resolveEnclosingCBatchRef(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  if (
    declaredTerm.kind === "c_source_path_refusal" ||
    declaredTerm.kind !== "c_workflow" ||
    (declaredBatchRef !== null && typeof declaredBatchRef !== "string")
  ) return null;
  const implementationSet = rehydrateAdmittedImplementationSetAtPrefix(
    prefix,
    basis.rootImplementationSetRef,
  );
  const interactionSet = rehydrateAdmittedInteractionSetAtPrefix(
    prefix,
    basis.rootInteractionSetRef,
  );
  if (
    implementationSet === null || interactionSet === null ||
    implementationSet.implementationSetDigest !==
      basis.rootImplementationSetDigest ||
    interactionSet.interactionSetDigest !== basis.rootInteractionSetDigest
  ) return null;
  const childFailureContractRefs = new Set(
    implementationSet.rows
      .filter((row) => row.graphFunctionRef === declaredTerm.graphFunctionRef)
      .map((row) => row.failureContractRef),
  );
  if (childFailureContractRefs.size !== 1) return null;
  const failureContractRef = [...childFailureContractRefs][0]!;
  const judgmentPredicateRef =
    graphFunction.declarations["abg.judgment_predicate"];
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const rows = events.filter((event) =>
    event.aggregateType === "c_call" && event.aggregateId === cCallRef
  );
  const opened = rows[0];
  const fibre = rows[1];
  const cursorAdmissionEventRef = traversalCursorAdmissionEventRefAtPrefix(
    prefix,
    sourceCursor,
  );
  if (
    opened?.kind !== "c_call_opened" ||
    fibre?.kind !== "c_call_fibre_selected" ||
    cursorAdmissionEventRef === null ||
    !isJsonRecord(opened.payload) || !isJsonRecord(fibre.payload) ||
    opened.parentAggregateId !== sourceCursor.frameId ||
    opened.basisId !== basis.basisRef || opened.runId !== sourceCursor.runId ||
    opened.graphFunctionRef !== graph.graphFunctionRef ||
    opened.materializationRef !== graph.materializationRef ||
    opened.graphCallId !== sourceCursor.graphCallId ||
    opened.frameId !== sourceCursor.frameId ||
    opened.causationEventRefs[0] !== cursorAdmissionEventRef ||
    fibre.parentAggregateId !== opened.parentAggregateId ||
    fibre.basisId !== opened.basisId || fibre.runId !== opened.runId ||
    fibre.graphFunctionRef !== opened.graphFunctionRef ||
    fibre.materializationRef !== opened.materializationRef ||
    fibre.graphCallId !== opened.graphCallId || fibre.frameId !== opened.frameId ||
    fibre.causationEventRefs.length !== 1 ||
    fibre.causationEventRefs[0] !== opened.eventId ||
    typeof judgmentPredicateRef !== "string" ||
    judgmentPredicateRef.length === 0 ||
    opened.payload.judgmentPredicateRef !== judgmentPredicateRef
  ) return null;
  const programLocusDigest = sha256Canonical({
    graphFunctionRef: basis.graphFunctionRef,
    nodeRef: sourceCursor.currentNodeRef,
    termPath: sourceCursor.termPath,
    childGraphFunctionRef: declaredTerm.graphFunctionRef,
  } as unknown as JsonValue);
  const programLocusRef =
    `workflow-locus://abiogenesis/${programLocusDigest.slice("sha256:".length)}`;
  const identity = {
    basisId: basis.basisRef,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    vectorIndex: 0,
    stageRole: "workflow",
    taskOrdinal: sourceCursor.taskOrdinal,
    attempt: sourceCursor.attempt,
    programLocusRef,
    retryPath: sourceCursor.retryPath,
    childGraphFunctionRef: declaredTerm.graphFunctionRef,
    failureContractRef,
  };
  const cCallDigest = sha256Canonical(identity as unknown as JsonValue);
  if (cCallRef !== `c-call:${cCallDigest}`) return null;
  const locusBody = {
    cCallRef,
    cCallDigest,
    callClass: "workflow" as const,
    basisId: basis.basisRef,
    graphFunctionRef: basis.graphFunctionRef,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    edgeRef: basis.entryRef,
    vectorIndex: 0,
    stageRole: "workflow",
    batchRef: declaredBatchRef,
    taskOrdinal: sourceCursor.taskOrdinal,
    attempt: sourceCursor.attempt,
    programLocusRef,
    retryPath: sourceCursor.retryPath,
    cursorRef: sourceCursor.cursorRef,
    cursorDigest: sourceCursor.cursorDigest,
    childGraphFunctionRef: declaredTerm.graphFunctionRef,
    failureContractRef,
    judgmentPredicateRef,
  };
  const fibreBody = {
    cCallRef,
    callClass: "workflow" as const,
    regime: "F_D" as const,
    armId: "arm://abiogenesis/workflow.C@5",
    compositionRef: null,
    implementationSetRef: implementationSet.implementationSetRef,
    implementationRequirementKey: null,
    implementationBindingRef: null,
    implementationRef: null,
    interactionSetRef: interactionSet.interactionSetRef,
    interactionRequirementKey: null,
    interactionKind: null,
    actorCapabilityRef: null,
    responseContractRef: null,
    continuationContractRef: null,
    childGraphFunctionRef: declaredTerm.graphFunctionRef,
  };
  if (
    !exactEventBody(opened, "c_call_opened", locusBody) ||
    !exactEventBody(fibre, "c_call_fibre_selected", fibreBody)
  ) return null;
  return deepFreeze({
    kind: "c_call" as const,
    schemaVersion: "5.0.0" as const,
    cCallRef,
    cCallDigest,
    callClass: "workflow" as const,
    basisId: basis.basisRef,
    runId: sourceCursor.runId,
    graphFunctionRef: basis.graphFunctionRef,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    edgeRef: basis.entryRef,
    vectorIndex: 0,
    stageRole: "workflow",
    batchRef: declaredBatchRef,
    taskOrdinal: sourceCursor.taskOrdinal,
    attempt: sourceCursor.attempt,
    programLocusRef,
    retryPath: sourceCursor.retryPath,
    regime: "F_D" as const,
    armId: "arm://abiogenesis/workflow.C@5",
    compositionRef: null,
    implementationSetRef: implementationSet.implementationSetRef,
    implementationRequirementKey: null,
    implementationBindingRef: null,
    implementationRef: null,
    interactionSetRef: interactionSet.interactionSetRef,
    interactionRequirementKey: null,
    interactionKind: null,
    actorCapabilityRef: null,
    responseContractRef: null,
    continuationContractRef: null,
    childGraphFunctionRef: declaredTerm.graphFunctionRef,
    inputContractRef: declaredTerm.inputCarrierRef,
    outputContractRef: declaredTerm.outputCarrierRef,
    failureContractRef,
    refusalContractRef: basis.refusalContractRef,
    refusalValueKind: basis.refusalValueKind,
    evidenceContractRef: basis.evidenceContractRef,
    judgmentContractRef: basis.judgmentContractRef,
    rejectionContractRef: basis.rejectionContractRef,
    transitionContractRef: basis.transitionContractRef,
    closureContractRef: basis.closureContractRef,
    closureContractDigest: basis.closureContractDigest,
    judgmentPredicateRef,
    terminalPredicateRef: basis.terminalPredicateRef,
    replayProjectionRef: basis.replayProjectionRef,
    terminalKind: basis.terminalKind,
    openedEventRef: opened.eventId,
    fibreSelectedEventRef: fibre.eventId,
  }) as CCall;
}

/**
 * Reconstructs one exact opened declared CCall used by retry close and route
 * relations from one complete validated store prefix.
 */
export function projectOpenedCCallCarrier(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  cCallRef: string,
  sourceCursor?: TraversalCursorCandidate,
  graphFunction?: Readonly<GraphFunction>,
): CCall | null {
  const prefixEvents = runtimeEventsFromValidatedPrefix(prefix);
  if (
    store.readAll().length !== prefixEvents.length ||
    store.digest() !==
      sha256Canonical(prefixEvents as unknown as JsonValue)
  ) return null;
  const leaf = projectOpenedLeafCCallCarrier(
    prefix,
    graph,
    cCallRef,
  );
  return leaf ?? (sourceCursor === undefined || graphFunction === undefined
    ? null
    : projectOpenedWorkflowCCallCarrier(
        prefix,
        graph,
        cCallRef,
        sourceCursor,
        graphFunction,
      ));
}

export function projectOpenedCCallCarrierAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  cCallRef: string,
  sourceCursor?: TraversalCursorCandidate,
  graphFunction?: Readonly<GraphFunction>,
): CCall | null {
  const leaf = projectOpenedLeafCCallCarrier(prefix, graph, cCallRef);
  return leaf ?? (sourceCursor === undefined || graphFunction === undefined
    ? null
    : projectOpenedWorkflowCCallCarrier(
        prefix,
        graph,
        cCallRef,
        sourceCursor,
        graphFunction,
      ));
}

function exactRuntimeFailureSource(
  prefix: ValidatedRuntimeEventPrefix,
  cCall: CCall,
  source: CCallRuntimeFailureSource,
): ExactCCallRuntimeFailureSource | null {
  if (source.kind === "c_call_admission_rejection") {
    if (
      source.schemaVersion !== "5.0.0" || source.disposition !== "rejected" ||
      source.cCallRef !== cCall.cCallRef || source.stage !== "result" ||
      source.contractRef !== cCall.outputContractRef ||
      source.diagnosticRef !==
        "diagnostic://abiogenesis/c-call/result-contract-mismatch@5" ||
      source.candidateDigest.length === 0
    ) return null;
    return deriveContractRejectionFailureSource(source);
  }
  if (
    source.schemaVersion !== "5.0.0" || source.disposition !== "admitted" ||
    source.cCallRef !== cCall.cCallRef ||
    source.evidenceClass !== "probabilistic_transport"
  ) return null;
  const event = runtimeEventsFromValidatedPrefix(prefix).find((candidate) =>
    candidate.eventId === source.admissionEventRef
  );
  if (
    event === undefined || !isJsonRecord(event.payload) ||
    sha256Canonical(event.payload) !== sha256Canonical({
      evidenceRef: source.evidenceRef,
      evidenceDigest: source.evidenceDigest,
      ...admittedEvidencePayload(source),
    } as unknown as JsonValue)
  ) return null;
  return exactProbabilisticFailureSource(
    prefix,
    cCall.cCallRef,
    source.admissionEventRef,
  );
}

function runtimeFailurePlanBody(
  plan: CCallRuntimeFailureClosePlan,
): Readonly<Record<string, JsonValue>> {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    planRef: _planRef,
    planDigest: _planDigest,
    ...body
  } = plan;
  return body as unknown as Readonly<Record<string, JsonValue>>;
}

export function planCCallRuntimeFailureClose(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  cCall: CCall,
  source: CCallRuntimeFailureSource,
  failureCandidate: JsonValue,
  failureValueKind: string,
  disposition: "blocked" | "retry",
  basis: RuntimeAdmissionBasis,
): CCallRuntimeFailureClosePlan | CCallRuntimeFailureCloseRefusal {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const expectedPrefixDigest = sha256Canonical(events as unknown as JsonValue);
  let phase: CCallPhaseProjection;
  try {
    phase = projectCCallPhase(prefix, cCall.cCallRef);
  } catch {
    return runtimeFailureCloseRefusal(
      "call_mismatch",
      "runtime failure close requires one exact open CCall phase",
    );
  }
  const retryOwner = projectDeclaredCRetryCCallWriteAtPrefix(
    prefix,
    prefix,
    graph,
    graphFunction,
    cursor,
    cCall,
    phase.phase,
  );
  const exactSourcePhase = source.kind === "c_call_admission_rejection"
    ? phase.phase === "selected_no_evidence" || phase.phase === "evidencing"
    : phase.phase === "evidencing";
  if (
    store.digest() !== expectedPrefixDigest ||
    store.readAll().length !== events.length ||
    (() => {
      const projected = projectOpenedCCallCarrier(
        store,
        prefix,
        graph,
        cCall.cCallRef,
      );
      return projected !== null &&
        sha256Canonical(projected as unknown as JsonValue) ===
          sha256Canonical(cCall as unknown as JsonValue);
    })() === false ||
    cCall.callClass !== "leaf" ||
    cCall.retryPath.length === 0 || !exactSourcePhase ||
    (disposition !== "blocked" && disposition !== "retry") ||
    failureValueKind.length === 0 || retryOwner === null
  ) {
    return runtimeFailureCloseRefusal(
      "call_mismatch",
      "runtime failure close differs from the exact active retry CCall prefix",
    );
  }
  const resolved = exactRuntimeFailureSource(prefix, cCall, source);
  if (resolved === null) {
    return runtimeFailureCloseRefusal(
      "source_mismatch",
      "runtime failure close requires one exact admitted failure source",
    );
  }
  const failureCandidateDigest = sha256Canonical(failureCandidate);
  const probabilisticCandidateValid = source.kind ===
      "admitted_c_call_evidence" &&
    source.outputDigest === failureCandidateDigest &&
    isJsonRecord(failureCandidate) &&
    failureCandidate.kind === failureValueKind &&
    failureCandidate.schemaVersion === "5.0.0" &&
    failureCandidate.failureClass === resolved.signal.failureClass &&
    typeof failureCandidate.diagnosticRef === "string" &&
    !Object.hasOwn(failureCandidate, "failureSignalRef") &&
    !Object.hasOwn(failureCandidate, "failureSourceRef") &&
    !Object.hasOwn(failureCandidate, "failureCandidateDigest");
  const rejectedCandidateValid = source.kind === "c_call_admission_rejection" &&
    source.candidateDigest === failureCandidateDigest;
  if (!probabilisticCandidateValid && !rejectedCandidateValid) {
    return runtimeFailureCloseRefusal(
      "source_mismatch",
      "runtime failure candidate differs from the exact failure source digest",
    );
  }
  const activeRetryAttemptRef = retryOwner.active.attempt.attemptRef;
  const projectedHistory = [...events];
  const eventCandidates: RuntimeEventCandidate[] = [];
  const projectedEvents: RuntimeEvent[] = [];
  const project = (candidate: RuntimeEventCandidate): RuntimeEvent => {
    const event = projectRuntimeEventFromValidatedHistory(
      projectedHistory,
      candidate,
    );
    eventCandidates.push(deepFreeze(candidate));
    projectedEvents.push(event);
    projectedHistory.push(event);
    return event;
  };

  let sourceEventRef = resolved.sourceEventRef;
  if (source.kind === "c_call_admission_rejection") {
    const rejectionEvidenceBody = {
      cCallRef: cCall.cCallRef,
      evidenceClass: "admission_rejection" as const,
      contractRef: cCall.evidenceContractRef,
      rejectedStage: source.stage,
      candidateDigest: source.candidateDigest,
      rejectedContractRef: source.contractRef,
      diagnosticRef: source.diagnosticRef,
    };
    const rejectionEvidenceDigest = sha256Canonical(
      rejectionEvidenceBody as unknown as JsonValue,
    );
    const rejectionEvidenceRef =
      `evidence://abiogenesis/${rejectionEvidenceDigest.slice("sha256:".length)}`;
    const rows = exactCCallRows(prefix, cCall.cCallRef);
    sourceEventRef = project({
      kind: "c_call_evidenced",
      eventTime: basis.eventTime,
      aggregateType: "c_call",
      aggregateId: cCall.cCallRef,
      parentAggregateId: cCall.frameId,
      causationEventRefs: [rows.at(-1)!.eventId],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId: cCall.runId,
      graphFunctionRef: cCall.graphFunctionRef,
      graphCallId: cCall.graphCallId,
      frameId: cCall.frameId,
      payload: {
        evidenceRef: rejectionEvidenceRef,
        evidenceDigest: rejectionEvidenceDigest,
        ...rejectionEvidenceBody,
      },
    }).eventId;
  }
  if (sourceEventRef === null) {
    return runtimeFailureCloseRefusal(
      "source_mismatch",
      "runtime failure source event is absent",
    );
  }
  const projectedPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...projectedHistory]),
  );
  const evidenceRefs = exactCCallRows(
    projectedPrefix,
    cCall.cCallRef,
  ).flatMap((event) =>
    event.kind === "c_call_evidenced" && isJsonRecord(event.payload) &&
      typeof event.payload.evidenceRef === "string"
      ? [event.payload.evidenceRef]
      : []
  );
  const immutableCandidate = deepFreeze(
    JSON.parse(canonicalJson(failureCandidate)) as JsonValue,
  );
  const failureValue = source.kind === "admitted_c_call_evidence"
    ? deepFreeze({
        ...(immutableCandidate as Readonly<Record<string, JsonValue>>),
        failureClass: resolved.signal.failureClass,
        failureSignalRef: resolved.signal.failureSignalRef,
        failureSourceRef: resolved.sourceRef,
        failureCandidateDigest,
      }) as JsonValue
    : deepFreeze({
        kind: failureValueKind,
        schemaVersion: "5.0.0" as const,
        failureClass: resolved.signal.failureClass,
        diagnosticRef: source.diagnosticRef,
        failureSignalRef: resolved.signal.failureSignalRef,
        failureSourceRef: resolved.sourceRef,
        failureCandidateDigest,
        rejectedStage: source.stage,
      }) as JsonValue;
  const valueDigest = sha256Canonical(failureValue);
  const resultBody = {
    cCallRef: cCall.cCallRef,
    resultClass: "failure" as const,
    contractRef: cCall.failureContractRef,
    valueKind: failureValueKind,
    valueDigest,
    value: failureValue,
    evidenceRefs,
  };
  const resultDigest = sha256Canonical(resultBody as unknown as JsonValue);
  const resultRef =
    `result://abiogenesis/${resultDigest.slice("sha256:".length)}`;
  const resultEvent = project({
    kind: "c_call_result_admitted",
    eventTime: basis.eventTime,
    aggregateType: "c_call",
    aggregateId: cCall.cCallRef,
    parentAggregateId: cCall.frameId,
    causationEventRefs: [sourceEventRef],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { resultRef, resultDigest, ...resultBody },
  });
  const result = deepFreeze({
    kind: "admitted_c_call_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    resultRef,
    resultDigest,
    ...resultBody,
    admissionEventRef: resultEvent.eventId,
  }) as AdmittedCCallResult;
  const runPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...projectedHistory]),
    { runId: cCall.runId },
  );
  const replayState = replayValidatedRuntimeEventPrefix(
    runPrefix,
    selectValidatedRuntimeEventPrefix(Object.freeze([...projectedHistory])),
  );
  const judgmentBody = {
    cCallRef: cCall.cCallRef,
    resultRef,
    resultDigest,
    judgment: disposition,
    reasonRef: resolved.signal.failureSignalRef,
    contractRef: cCall.judgmentContractRef,
    predicateRef: cCall.judgmentPredicateRef,
    replayStateDigest: replayState.replayDigest,
    retryAttemptRef: activeRetryAttemptRef,
  };
  const judgmentDigest = sha256Canonical(judgmentBody as unknown as JsonValue);
  const judgmentRef =
    `judgment://abiogenesis/${judgmentDigest.slice("sha256:".length)}`;
  const judgmentEvent = project({
    kind: "c_call_judged",
    eventTime: basis.eventTime,
    aggregateType: "c_call",
    aggregateId: cCall.cCallRef,
    parentAggregateId: cCall.frameId,
    causationEventRefs: [resultEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { judgmentRef, judgmentDigest, ...judgmentBody },
  });
  const judgment = deepFreeze({
    kind: "admitted_c_call_judgment" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    judgmentRef,
    judgmentDigest,
    ...judgmentBody,
    admissionEventRef: judgmentEvent.eventId,
  }) as AdmittedCCallJudgment;
  const close = deepFreeze({
    kind: "admitted_c_call_runtime_failure_close" as const,
    schemaVersion: "5.0.0" as const,
    disposition,
    cCallRef: cCall.cCallRef,
    signal: resolved.signal,
    result,
    judgment,
  });
  const body = {
    expectedPrefixDigest,
    admissionBasisDigest: sha256Canonical(basis as unknown as JsonValue),
    disposition,
    cCallRef: cCall.cCallRef,
    sourceRef: resolved.sourceRef,
    sourceEventRef: resolved.sourceEventRef,
    failureValueKind,
    failureCandidateDigest,
    signal: resolved.signal,
    eventCandidates,
    projectedEvents,
    close,
  };
  const planDigest = sha256Canonical(body as unknown as JsonValue);
  const planRef =
    `c-call-runtime-failure-plan://abiogenesis/${planDigest.slice("sha256:".length)}`;
  return deepFreeze({
    kind: "c_call_runtime_failure_close_plan" as const,
    schemaVersion: "5.0.0" as const,
    planRef,
    planDigest,
    ...body,
  });
}

function runtimeFailureCloseError(message: string): TypeError {
  return new TypeError(`CCall runtime failure close refusal: ${message}`);
}

export function isCCallRuntimeFailureCloseError(error: unknown): boolean {
  return error instanceof TypeError &&
    error.message.startsWith("CCall runtime failure close refusal: ");
}

export function admitPlannedCCallRuntimeFailureClose(
  store: AbgEventStore,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  cCall: CCall,
  source: CCallRuntimeFailureSource,
  failureCandidate: JsonValue,
  plan: CCallRuntimeFailureClosePlan,
  disposition: "blocked" | "retry",
  basis: RuntimeAdmissionBasis,
): AdmittedCCallRuntimeFailureClose {
  if (
    plan.kind !== "c_call_runtime_failure_close_plan" ||
    plan.schemaVersion !== "5.0.0" || plan.cCallRef !== cCall.cCallRef ||
    plan.planDigest !== sha256Canonical(runtimeFailurePlanBody(plan) as JsonValue) ||
    plan.planRef !==
      `c-call-runtime-failure-plan://abiogenesis/${plan.planDigest.slice("sha256:".length)}` ||
    store.digest() !== plan.expectedPrefixDigest ||
    plan.disposition !== disposition ||
    plan.admissionBasisDigest !==
      sha256Canonical(basis as unknown as JsonValue)
  ) throw runtimeFailureCloseError("plan identity or expected prefix differs");
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll());
  const rederived = planCCallRuntimeFailureClose(
    store,
    prefix,
    graph,
    graphFunction,
    cursor,
    cCall,
    source,
    failureCandidate,
    plan.failureValueKind,
    disposition,
    basis,
  );
  if (
    rederived.kind !== "c_call_runtime_failure_close_plan" ||
    sha256Canonical(rederived as unknown as JsonValue) !==
      sha256Canonical(plan as unknown as JsonValue)
  ) throw runtimeFailureCloseError("source or plan no longer reprojects exactly");
  if (
    plan.eventCandidates.length !== plan.projectedEvents.length ||
    plan.projectedEvents.at(-1)?.eventId !==
      plan.close.judgment.admissionEventRef
  ) throw runtimeFailureCloseError("planned event closure is incomplete");
  const admittedEvents = plan.eventCandidates.map((candidate) =>
    admitRuntimeEvent(store, candidate)
  );
  if (admittedEvents.some((event, index) =>
    sha256Canonical(event as unknown as JsonValue) !==
      sha256Canonical(plan.projectedEvents[index] as unknown as JsonValue)
  )) {
    throw runtimeFailureCloseError(
      "admitted close differs from its pre-effect plan",
    );
  }
  return plan.close;
}

export function projectCCallRuntimeFailureSignal(
  prefix: ValidatedRuntimeEventPrefix,
  cCallRef: string,
  resultRef: string,
  judgmentRef: string,
): CCallRuntimeFailureSignal | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  let phase: CCallPhaseProjection;
  try {
    phase = projectCCallPhase(prefix, cCallRef);
  } catch {
    return null;
  }
  if (
    phase.phase !== "judged" || phase.resultEventRef === null ||
    phase.judgmentEventRef === null
  ) return null;
  const result = events.find((event) => event.eventId === phase.resultEventRef);
  const judgment = events.find((event) =>
    event.eventId === phase.judgmentEventRef
  );
  if (
    result?.kind !== "c_call_result_admitted" ||
    judgment?.kind !== "c_call_judged" ||
    !isJsonRecord(result.payload) || !isJsonRecord(judgment.payload) ||
    result.aggregateId !== cCallRef || judgment.aggregateId !== cCallRef ||
    result.payload.cCallRef !== cCallRef || judgment.payload.cCallRef !== cCallRef ||
    result.payload.resultRef !== resultRef || judgment.payload.resultRef !== resultRef ||
    judgment.payload.judgmentRef !== judgmentRef ||
    result.payload.resultClass !== "failure" ||
    !isJsonRecord(result.payload.value) ||
    !isWorkerTransportFailureClass(result.payload.value.failureClass) ||
    typeof result.payload.value.diagnosticRef !== "string" ||
    typeof result.payload.value.failureSignalRef !== "string" ||
    typeof result.payload.value.failureSourceRef !== "string" ||
    typeof result.payload.value.failureCandidateDigest !== "string" ||
    !Array.isArray(result.payload.evidenceRefs) ||
    !result.payload.evidenceRefs.every((value) => typeof value === "string") ||
    judgment.payload.resultDigest !== result.payload.resultDigest ||
    judgment.payload.reasonRef !== result.payload.value.failureSignalRef ||
    (judgment.payload.judgment !== "retry" &&
      judgment.payload.judgment !== "blocked") ||
    typeof judgment.payload.retryAttemptRef !== "string" ||
    judgment.causationEventRefs.length !== 1 ||
    judgment.causationEventRefs[0] !== result.eventId
  ) return null;
  const resultPayload = result.payload;
  const judgmentPayload = judgment.payload;
  const resultValue = resultPayload.value as Readonly<Record<string, JsonValue>>;
  const evidenceRefs = resultPayload.evidenceRefs as readonly JsonValue[];
  const { resultRef: _resultRef, resultDigest, ...resultBody } = resultPayload;
  const { judgmentRef: _judgmentRef, judgmentDigest, ...judgmentBody } =
    judgmentPayload;
  if (
    resultDigest !== sha256Canonical(resultBody as unknown as JsonValue) ||
    resultRef !==
      `result://abiogenesis/${String(resultDigest).slice("sha256:".length)}` ||
    judgmentDigest !== sha256Canonical(judgmentBody as unknown as JsonValue) ||
    judgmentRef !==
      `judgment://abiogenesis/${String(judgmentDigest).slice("sha256:".length)}`
  ) return null;
  const sourceEvents = events.filter((event) =>
    event.kind === "c_call_evidenced" && event.aggregateId === cCallRef &&
    isJsonRecord(event.payload) && typeof event.payload.evidenceRef === "string" &&
    evidenceRefs.includes(event.payload.evidenceRef) &&
    result.causationEventRefs.includes(event.eventId)
  );
  if (sourceEvents.length !== 1) return null;
  const source = isJsonRecord(sourceEvents[0]!.payload) &&
      sourceEvents[0]!.payload.evidenceClass === "admission_rejection"
    ? exactContractRejectionFailureSource(prefix, cCallRef, sourceEvents[0]!.eventId)
    : exactProbabilisticFailureSource(prefix, cCallRef, sourceEvents[0]!.eventId);
  if (
    source === null ||
    source.signal.failureClass !== resultValue.failureClass ||
    source.sourceRef !== resultValue.failureSourceRef ||
    source.signal.failureSignalRef !== resultValue.failureSignalRef ||
    source.signal.failureSignalRef !== judgmentPayload.reasonRef
  ) return null;
  const {
    failureSignalRef: _failureSignalRef,
    failureSourceRef: _failureSourceRef,
    failureCandidateDigest: _failureCandidateDigest,
    ...baseFailureCandidate
  } = resultValue;
  const sourcePayload = sourceEvents[0]!.payload as Readonly<
    Record<string, JsonValue>
  >;
  const candidateMatches = source.signal.sourceClass === "probabilistic_transport"
    ? sourcePayload.outputDigest === resultValue.failureCandidateDigest &&
      sha256Canonical(baseFailureCandidate as unknown as JsonValue) ===
        resultValue.failureCandidateDigest &&
      baseFailureCandidate.diagnosticRef === resultValue.diagnosticRef
    : sourcePayload.candidateDigest === resultValue.failureCandidateDigest &&
      sourcePayload.rejectedStage === resultValue.rejectedStage &&
      sourcePayload.diagnosticRef === resultValue.diagnosticRef;
  if (!candidateMatches) return null;
  return source.signal;
}

const PROBABILISTIC_RESULT_CARRIER_FIELDS = Object.freeze([
  "actorInvocationRef",
  "actorRef",
  "candidateDigest",
  "candidateRef",
  "contractCapabilityBasis",
  "implementationRef",
  "implementationResolutionDigest",
  "implementationResolutionRef",
  "inputDigest",
  "instructionContractRef",
  "kind",
  "observationDigest",
  "occurrence",
  "processRef",
  "rawOutputDigest",
  "rawResultContractRef",
  "requestDigest",
  "requestRef",
  "schemaVersion",
  "targetOutputContractRef",
  "transportBindingDigest",
  "transportBindingRef",
  "transportDigest",
  "transportDisposition",
  "transportFailureClass",
  "value",
  "valueDigest",
  "workerBindingRef",
]);

function hasExactRecordFields(
  value: unknown,
  fields: readonly string[],
): value is Readonly<Record<string, JsonValue>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value).sort();
  const expected = [...fields].sort();
  return keys.length === expected.length &&
    keys.every((key, index) => key === expected[index]);
}

interface RevalidatedProbabilisticResultCarrier {
  readonly candidateRef: string | null;
  readonly candidateDigest: Sha256Digest | null;
  readonly requestRef: string;
  readonly requestDigest: Sha256Digest;
  readonly rawOutputDigest: Sha256Digest;
}

function revalidateProbabilisticFailurePreimage(
  cCall: CCall,
  request: Readonly<ActorProcessRequest>,
  observation: Readonly<ActorProcessObservation>,
  expectedInstructionContractRef: string,
  expectedResultContractRef: string,
): RevalidatedProbabilisticResultCarrier | null {
  const pair = validateActorProcessCarrierPair(request, observation);
  if (
    pair.kind !== "actor_process_carrier_validation" ||
    observation.disposition !== "failure" ||
    cCall.callClass !== "leaf" ||
    cCall.regime !== "F_P" ||
    cCall.implementationRef === null ||
    request.implementationRef !== cCall.implementationRef ||
    observation.implementationRef !== cCall.implementationRef ||
    request.instructionContractRef !== expectedInstructionContractRef ||
    observation.instructionContractRef !== expectedInstructionContractRef ||
    request.resultContractRef !== expectedResultContractRef ||
    observation.resultContractRef !== expectedResultContractRef
  ) return null;
  const requestDigest = sha256Canonical(request as unknown as JsonValue);
  return {
    candidateRef: null,
    candidateDigest: null,
    requestRef:
      `probabilistic-request://abiogenesis/${requestDigest.slice("sha256:".length)}`,
    requestDigest,
    rawOutputDigest: sha256Bytes(observation.finalOutput),
  };
}

function revalidateProbabilisticResultCarrier(
  cCall: CCall,
  request: Readonly<ActorProcessRequest>,
  observation: Readonly<ActorProcessObservation>,
  carrierValue: unknown,
  expectedInstructionContractRef: string,
  expectedResultContractRef: string,
): RevalidatedProbabilisticResultCarrier | null {
  if (
    cCall.callClass !== "leaf" ||
    cCall.regime !== "F_P" ||
    cCall.implementationRef === null ||
    !hasExactRecordFields(
      carrierValue,
      PROBABILISTIC_RESULT_CARRIER_FIELDS,
    ) ||
    !hasExactRecordFields(carrierValue.contractCapabilityBasis, [
      "implementationSetDigest",
      "implementationSetRef",
      "installId",
      "publicationDigest",
    ]) ||
    !hasExactRecordFields(carrierValue.occurrence, [
      "attempt",
      "cCallRef",
      "frameId",
      "graphCallId",
      "programLocusRef",
      "runId",
      "taskOrdinal",
    ]) ||
    !isJsonRecord(carrierValue.value) ||
    carrierValue.kind !== "contract_admitted_probabilistic_result_candidate" ||
    carrierValue.schemaVersion !== "5.0.0" ||
    typeof carrierValue.candidateRef !== "string" ||
    !isSha256Digest(carrierValue.candidateDigest) ||
    typeof carrierValue.requestRef !== "string" ||
    !isSha256Digest(carrierValue.requestDigest) ||
    !isSha256Digest(carrierValue.rawOutputDigest) ||
    !isSha256Digest(carrierValue.valueDigest) ||
    !isSha256Digest(carrierValue.observationDigest) ||
    !isSha256Digest(carrierValue.implementationResolutionDigest) ||
    typeof carrierValue.implementationResolutionRef !== "string" ||
    typeof carrierValue.inputDigest !== "string" ||
    typeof carrierValue.instructionContractRef !== "string" ||
    typeof carrierValue.rawResultContractRef !== "string" ||
    typeof carrierValue.targetOutputContractRef !== "string" ||
    typeof carrierValue.actorInvocationRef !== "string" ||
    typeof carrierValue.actorRef !== "string" ||
    typeof carrierValue.workerBindingRef !== "string" ||
    typeof carrierValue.implementationRef !== "string" ||
    typeof carrierValue.processRef !== "string" ||
    typeof carrierValue.transportBindingRef !== "string" ||
    !isSha256Digest(carrierValue.transportBindingDigest) ||
    !isSha256Digest(carrierValue.transportDigest) ||
    (carrierValue.transportDisposition !== "failure" &&
      carrierValue.transportDisposition !== "success") ||
    (carrierValue.transportFailureClass !== null &&
      typeof carrierValue.transportFailureClass !== "string")
  ) return null;
  const pair = validateActorProcessCarrierPair(request, observation);
  if (pair.kind !== "actor_process_carrier_validation") return null;
  const capability = carrierValue.contractCapabilityBasis;
  const occurrence = carrierValue.occurrence;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    candidateRef: _candidateRef,
    candidateDigest: _candidateDigest,
    ...body
  } = carrierValue;
  const requestDigest = sha256Canonical(request as unknown as JsonValue);
  const observationDigest = sha256Canonical(
    observation as unknown as JsonValue,
  );
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  if (
    carrierValue.requestDigest !== requestDigest ||
    carrierValue.requestRef !==
      `probabilistic-request://abiogenesis/${requestDigest.slice("sha256:".length)}` ||
    carrierValue.candidateDigest !== candidateDigest ||
    carrierValue.candidateRef !==
      `probabilistic-result-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}` ||
    carrierValue.observationDigest !== observationDigest ||
    carrierValue.rawOutputDigest !== sha256Bytes(observation.finalOutput) ||
    carrierValue.valueDigest !==
      sha256Canonical(carrierValue.value as unknown as JsonValue) ||
    carrierValue.valueDigest !== observation.observedOutputDigest ||
    carrierValue.implementationResolutionRef !==
      `implementation-resolution-row://abiogenesis/${String(
        carrierValue.implementationResolutionDigest,
      ).slice("sha256:".length)}` ||
    capability.implementationSetRef !== cCall.implementationSetRef ||
    occurrence.cCallRef !== cCall.cCallRef ||
    occurrence.runId !== cCall.runId ||
    occurrence.graphCallId !== cCall.graphCallId ||
    occurrence.frameId !== cCall.frameId ||
    occurrence.programLocusRef !== cCall.programLocusRef ||
    occurrence.taskOrdinal !== cCall.taskOrdinal ||
    occurrence.attempt !== cCall.attempt ||
    carrierValue.inputDigest !== request.inputDigest ||
    carrierValue.inputDigest !== observation.inputDigest ||
    carrierValue.instructionContractRef !== expectedInstructionContractRef ||
    carrierValue.rawResultContractRef !== expectedResultContractRef ||
    carrierValue.targetOutputContractRef !== cCall.outputContractRef ||
    carrierValue.actorInvocationRef !== observation.actorInvocationRef ||
    carrierValue.actorRef !== request.actorRef ||
    carrierValue.workerBindingRef !== request.workerBindingRef ||
    carrierValue.implementationRef !== cCall.implementationRef ||
    carrierValue.implementationRef !== request.implementationRef ||
    carrierValue.processRef !== observation.processRef ||
    carrierValue.transportBindingRef !== observation.transportBindingRef ||
    carrierValue.transportBindingDigest !== observation.transportBindingDigest ||
    carrierValue.transportDigest !== observation.transportDigest ||
    carrierValue.transportDisposition !== observation.disposition ||
    carrierValue.transportFailureClass !== observation.failureClass
  ) return null;
  return {
    candidateRef: carrierValue.candidateRef,
    candidateDigest: carrierValue.candidateDigest,
    requestRef: carrierValue.requestRef,
    requestDigest: carrierValue.requestDigest,
    rawOutputDigest: carrierValue.rawOutputDigest,
  };
}

export function deriveProbabilisticTransportEvidence(
  cCall: CCall,
  request: Readonly<ActorProcessRequest>,
  observation: Readonly<ActorProcessObservation>,
  admittedResultCarrier: unknown,
  resultCandidate: JsonValue,
  expectedInstructionContractRef: string,
  expectedResultContractRef: string = cCall.outputContractRef,
): ProbabilisticTransportEvidenceCandidate {
  const carrier = revalidateProbabilisticResultCarrier(
    cCall,
    request,
    observation,
    admittedResultCarrier,
    expectedInstructionContractRef,
    expectedResultContractRef,
  ) ?? revalidateProbabilisticFailurePreimage(
    cCall,
    request,
    observation,
    expectedInstructionContractRef,
    expectedResultContractRef,
  );
  if (carrier === null) {
    throw new TypeError(
      "probabilistic evidence requires the exact ABG-revalidated F04-A result carrier",
    );
  }
  const candidate = deepFreeze({
    kind: "probabilistic_transport_evidence_candidate" as const,
    schemaVersion: "5.0.0" as const,
    implementationRef: observation.implementationRef,
    inputDigest: observation.inputDigest,
    observedOutputDigest: observation.observedOutputDigest,
    outputDigest: sha256Canonical(resultCandidate),
    candidateRef: carrier.candidateRef,
    candidateDigest: carrier.candidateDigest,
    requestRef: carrier.requestRef,
    requestDigest: carrier.requestDigest,
    rawOutputDigest: carrier.rawOutputDigest,
    actorInvocationRef: observation.actorInvocationRef,
    actorRef: observation.actorRef,
    workerBindingRef: observation.workerBindingRef,
    processRef: observation.processRef,
    transportBindingRef: observation.transportBindingRef,
    transportBindingDigest: observation.transportBindingDigest,
    materializationPlanRef: observation.materializationPlanRef,
    rendererRef: observation.rendererRef,
    instructionContractRef: observation.instructionContractRef,
    resultContractRef: observation.resultContractRef,
    promptDigest: observation.promptDigest,
    transportDigest: observation.transportDigest,
    transportLane: observation.transportLane,
    transportDisposition: observation.disposition,
    transportFailureClass: observation.failureClass,
    processStatus: observation.processStatus,
    processSignal: observation.processSignal,
    timedOut: observation.timedOut,
    exitObserved: observation.exitObserved,
    terminationConfirmed: observation.terminationConfirmed,
    signalSequence: observation.signalSequence,
    structuredEventCount: observation.structuredEventCount,
    progressEventCount: observation.progressEventCount,
    toolCallCount: observation.toolCallCount,
    apiRetryCount: observation.apiRetryCount,
    stdoutByteLength: observation.stdoutByteLength,
    stderrByteLength: observation.stderrByteLength,
    artifactDigests: observation.artifactDigests,
  }) as ProbabilisticTransportEvidenceCandidate;
  return candidate;
}

export function admitWorkflowChildPreparationRefusal(
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  parentCCall: CCall,
  candidate: ChildPreparationRefusalCandidate,
  basis: RuntimeAdmissionBasis,
): ChildPreparationRefusalAdmission | ChildPreparationRefusalRefusal {
  let owner: ReturnType<typeof projectCCallOwnerAtPrefix>;
  try {
    assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
    owner = projectCCallOwnerAtPrefix(
      selectValidatedRuntimeEventPrefix(
        readRuntimeEventsAtDurablePrefix(predecessorPrefix),
      ),
      parentCCall,
    );
  } catch {
    owner = null;
  }
  const retryOwner = parentCCall.retryPath.length === 0 || owner === null
    ? null
    : projectDeclaredCRetryCCallWriteAtPrefix(
        owner.prefix,
        owner.authorityPrefix,
        graph,
        graphFunction,
        cursor,
        parentCCall,
        owner.phase.phase,
      );
  if (
    !isCCall(parentCCall) ||
    parentCCall.callClass !== "workflow" ||
    owner?.phase.phase !== "selected_no_evidence" ||
    (parentCCall.retryPath.length !== 0 && retryOwner === null)
  ) {
    return {
      kind: "child_preparation_refusal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "parent_call_mismatch",
      message: "child preparation refusal requires one open transparent parent workflow CCall",
    };
  }
  if (
    candidate.kind !== "child_preparation_refusal_candidate" ||
    candidate.schemaVersion !== "5.0.0" ||
    candidate.childGraphFunctionRef !== parentCCall.childGraphFunctionRef ||
    candidate.inputRef.length === 0 ||
    !/^sha256:[a-f0-9]{64}$/u.test(candidate.inputDigest) ||
    ![
      "basis_admission",
      "graph_materialization",
      "graph_validation",
      "membership",
      "scope_open",
    ].includes(candidate.stage) ||
    !candidate.diagnosticRef.startsWith("diagnostic://abiogenesis/") ||
    candidate.message.length === 0
  ) {
    return {
      kind: "child_preparation_refusal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "candidate_mismatch",
      message: "child preparation refusal candidate differs from the declared workflow child",
    };
  }
  const candidateDigest = sha256Canonical(candidate as unknown as JsonValue);
  const admittedEvent = admitChildLifecycleEvent({
    store,
    expectedPrefixDigest: owner.expectedStorePrefixDigest,
    event: {
    kind: "child_preparation_refused",
    eventTime: basis.eventTime,
    aggregateType: "c_call",
    aggregateId: parentCCall.cCallRef,
    parentAggregateId: parentCCall.frameId,
    causationEventRefs: [parentCCall.fibreSelectedEventRef, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: parentCCall.basisId,
    runId: parentCCall.runId,
    graphFunctionRef: parentCCall.graphFunctionRef,
    graphCallId: parentCCall.graphCallId,
    frameId: parentCCall.frameId,
    payload: {
      parentCCallRef: parentCCall.cCallRef,
      candidateDigest,
      ...candidate,
    },
    },
  });
  const admissionRejection = rejection(
    parentCCall,
    "evidence",
    candidate as unknown as JsonValue,
    parentCCall.evidenceContractRef,
    candidate.diagnosticRef,
  );
  return deepFreeze({
    kind: "child_preparation_refusal_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    admissionRejection,
    admissionEventRef: admittedEvent.event.eventId,
    successorPrefix: admittedEvent.successorPrefix,
  }) as ChildPreparationRefusalAdmission;
}

export function admitWorkflowChildFoldback(
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  parentCCall: CCall,
  childExecutionBasis: ExecutionBasis,
  childScope: OpenedTraversalScope,
  input: {
    readonly childResultRef: string;
    readonly childJudgmentRef: string;
    readonly childClosureRef: string | null;
  },
  basis: RuntimeAdmissionBasis,
): ChildFoldbackAdmission | ChildFoldbackRefusal {
  let parentOwner: ReturnType<typeof projectCCallOwnerAtPrefix>;
  try {
    assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
    parentOwner = projectCCallOwnerAtPrefix(
      selectValidatedRuntimeEventPrefix(
        readRuntimeEventsAtDurablePrefix(predecessorPrefix),
      ),
      parentCCall,
    );
  } catch {
    parentOwner = null;
  }
  const retryOwner = parentCCall.retryPath.length === 0 || parentOwner === null
    ? null
    : projectDeclaredCRetryCCallWriteAtPrefix(
        parentOwner.prefix,
        parentOwner.authorityPrefix,
        graph,
        graphFunction,
        cursor,
        parentCCall,
        parentOwner.phase.phase,
      );
  if (
    !isCCall(parentCCall) ||
    parentCCall.callClass !== "workflow" ||
    parentOwner?.phase.phase !== "selected_no_evidence" ||
    (parentCCall.retryPath.length !== 0 && retryOwner === null) ||
    parentCCall.childGraphFunctionRef !== childExecutionBasis.graphFunctionRef ||
    parentCCall.runId !== childScope.runId ||
    childExecutionBasis.parentExecutionBasisRef !== parentCCall.basisId
  ) {
    return {
      kind: "child_foldback_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "parent_call_mismatch",
      message: "child foldback requires one open transparent parent workflow CCall",
    };
  }
  if (
    !hasAdmittedExecutionBasisAtPrefix(
      parentOwner.prefix,
      childExecutionBasis,
    ) ||
    childExecutionBasis.basisClass !== "child" ||
    !hasOpenedTraversalScopeAtPrefix(parentOwner.prefix, childScope) ||
    childScope.executionBasisRef !== childExecutionBasis.basisRef ||
    childScope.graphFunctionRef !== parentCCall.childGraphFunctionRef
  ) {
    return {
      kind: "child_foldback_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "child_truth_mismatch",
      message: "child foldback requires the exact admitted child basis and scope",
    };
  }
  const truth = projectChildFoldbackTruth({
    prefix: parentOwner.prefix,
    childScope,
    childResultRef: input.childResultRef,
    childJudgmentRef: input.childJudgmentRef,
    childClosureRef: input.childClosureRef,
    selectedRouteEventRef: null,
    allowedDispositions: ["closed", "blocked", "failed"],
    directCausation: "terminal_first",
    allowRetryBridges: true,
  });
  if (truth === null) {
    return {
      kind: "child_foldback_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "child_truth_mismatch",
      message: "child foldback references incomplete or non-causal child truth",
    };
  }
  const body = {
    parentCCallRef: parentCCall.cCallRef,
    childExecutionBasisRef: childExecutionBasis.basisRef,
    childExecutionBasisDigest: childExecutionBasis.basisDigest,
    childGraphCallId: childScope.graphCallId,
    childFrameId: childScope.frameId,
    childDisposition: truth.childDisposition,
    childResultRef: input.childResultRef,
    childResultDigest: truth.childResultDigest,
    childJudgmentRef: input.childJudgmentRef,
    childClosureRef: input.childClosureRef,
    childReasonRef: truth.childReasonRef,
    childTerminalEventRef: truth.childTerminalEventRef,
    outputDigest: truth.outputDigest,
  };
  const foldbackDigest = sha256Canonical(body as unknown as JsonValue);
  const foldbackRef =
    `child-foldback://abiogenesis/${foldbackDigest.slice("sha256:".length)}`;
  const admittedEvent = admitChildLifecycleEvent({
    store,
    expectedPrefixDigest: parentOwner.expectedStorePrefixDigest,
    event: {
      kind: "child_foldback_admitted",
      eventTime: basis.eventTime,
      aggregateType: "frame",
      aggregateId: parentCCall.frameId,
      parentAggregateId: parentCCall.graphCallId,
      causationEventRefs: [
        truth.childTerminalEventRef,
        parentCCall.fibreSelectedEventRef,
        ...basis.causationEventRefs,
      ],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: parentCCall.basisId,
      runId: parentCCall.runId,
      graphFunctionRef: parentCCall.graphFunctionRef,
      graphCallId: parentCCall.graphCallId,
      frameId: parentCCall.frameId,
      payload: { foldbackRef, foldbackDigest, ...body },
    },
  });
  const admitted = deepFreeze({
    kind: "child_foldback_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    foldbackRef,
    foldbackDigest,
    ...body,
    admissionEventRef: admittedEvent.event.eventId,
    successorPrefix: admittedEvent.successorPrefix,
  }) as ChildFoldbackAdmission;
  return admitted;
}

export function deriveSubTraversalEvidence(
  parentCCall: CCall,
  foldback: ChildFoldbackAdmission,
  inputDigest: Sha256Digest,
  outputDigest: Sha256Digest,
): SubTraversalEvidenceCandidate {
  if (
    !isCCall(parentCCall) ||
    parentCCall.callClass !== "workflow" ||
    !isChildFoldbackAdmission(foldback) ||
    foldback.parentCCallRef !== parentCCall.cCallRef
  ) {
    throw new TypeError("sub-traversal evidence requires one authentic admitted child foldback");
  }
  const candidate = deepFreeze({
    kind: "sub_traversal_evidence_candidate" as const,
    schemaVersion: "5.0.0" as const,
    inputDigest,
    outputDigest,
    foldbackRef: foldback.foldbackRef,
    foldbackDigest: foldback.foldbackDigest,
    foldbackEventRef: foldback.admissionEventRef,
    childExecutionBasisRef: foldback.childExecutionBasisRef,
    childExecutionBasisDigest: foldback.childExecutionBasisDigest,
    childGraphCallId: foldback.childGraphCallId,
    childFrameId: foldback.childFrameId,
    childDisposition: foldback.childDisposition,
    childResultRef: foldback.childResultRef,
    childResultDigest: foldback.childResultDigest,
    childOutputDigest: foldback.outputDigest,
    childJudgmentRef: foldback.childJudgmentRef,
    childClosureRef: foldback.childClosureRef,
    childReasonRef: foldback.childReasonRef,
    childTerminalEventRef: foldback.childTerminalEventRef,
  }) as SubTraversalEvidenceCandidate;
  return candidate;
}

export function rehydrateWorkflowCCall(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  implementationSet: AdmittedImplementationSet,
  scope: OpenedTraversalScope,
  graphFunction: Readonly<GraphFunction>,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  cCallValue: Readonly<Record<string, JsonValue>>,
): CCall | null {
  return rehydrateWorkflowCCallAtPrefix(
    selectValidatedRuntimeEventPrefix(store.readAll()),
    executionBasis,
    implementationSet,
    scope,
    graphFunction,
    graph,
    sourceCursor,
    cCallValue,
  );
}

export function rehydrateWorkflowCCallAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  implementationSet: AdmittedImplementationSet,
  scope: OpenedTraversalScope,
  graphFunction: Readonly<GraphFunction>,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  cCallValue: Readonly<Record<string, JsonValue>>,
): CCall | null {
  const declaredTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const declaredBatchRef = resolveEnclosingCBatchRef(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  if (
    !hasAdmittedExecutionBasisAtPrefix(prefix, executionBasis) ||
    !hasAdmittedImplementationSetAtPrefix(prefix, implementationSet) ||
    !hasOpenedTraversalScopeAtPrefix(prefix, scope) ||
    !hasAdmittedTraversalCursorAtPrefix(prefix, sourceCursor) ||
    scope.executionBasisRef !== executionBasis.basisRef ||
    sourceCursor.executionBasisRef !== executionBasis.basisRef ||
    sourceCursor.traversalScopeRef !== scope.scopeRef ||
    sourceCursor.graphRef !== graph.materializationRef ||
    graphFunction.name !== graph.graphFunctionRef ||
    sha256Canonical(graphFunction as unknown as JsonValue) !==
      graph.graphFunctionDigest ||
    implementationSet.implementationSetRef !==
      executionBasis.rootImplementationSetRef ||
    implementationSet.implementationSetDigest !==
      executionBasis.rootImplementationSetDigest ||
    declaredTerm.kind === "c_source_path_refusal" ||
    declaredTerm.kind !== "c_workflow" ||
    (declaredBatchRef !== null && typeof declaredBatchRef !== "string")
  ) {
    return null;
  }
  const failureContractRefs = new Set(
    implementationSet.rows
      .filter((row) => row.graphFunctionRef === declaredTerm.graphFunctionRef)
      .map((row) => row.failureContractRef),
  );
  const failureContractRef = [...failureContractRefs][0];
  const judgmentPredicateRef =
    graphFunction.declarations["abg.judgment_predicate"];
  if (
    failureContractRefs.size !== 1 ||
    failureContractRef === undefined ||
    judgmentPredicateRef === undefined
  ) {
    return null;
  }
  const programLocusDigest = sha256Canonical({
    graphFunctionRef: executionBasis.graphFunctionRef,
    nodeRef: sourceCursor.currentNodeRef,
    termPath: sourceCursor.termPath,
    childGraphFunctionRef: declaredTerm.graphFunctionRef,
  } as unknown as JsonValue);
  const programLocusRef =
    `workflow-locus://abiogenesis/${programLocusDigest.slice("sha256:".length)}`;
  const identity = {
    basisId: executionBasis.basisRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    vectorIndex: 0,
    stageRole: "workflow",
    taskOrdinal: sourceCursor.taskOrdinal,
    attempt: sourceCursor.attempt,
    programLocusRef,
    retryPath: sourceCursor.retryPath,
    childGraphFunctionRef: declaredTerm.graphFunctionRef,
    failureContractRef,
  };
  const cCallDigest = sha256Canonical(identity as unknown as JsonValue);
  const cCallRef = `c-call:${cCallDigest}`;
  const events = runtimeEventsFromValidatedPrefix(prefix).filter(
    (event) => event.aggregateType === "c_call" && event.aggregateId === cCallRef,
  );
  const openedEvent = events[0];
  const fibreEvent = events[1];
  if (
    events.length !== 2 ||
    openedEvent?.kind !== "c_call_opened" ||
    fibreEvent?.kind !== "c_call_fibre_selected"
  ) {
    return null;
  }
  const expected = deepFreeze({
    kind: "c_call" as const,
    schemaVersion: "5.0.0" as const,
    cCallRef,
    cCallDigest,
    callClass: "workflow" as const,
    basisId: executionBasis.basisRef,
    runId: scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    edgeRef: executionBasis.entryRef,
    vectorIndex: 0,
    stageRole: "workflow",
    batchRef: declaredBatchRef,
    taskOrdinal: sourceCursor.taskOrdinal,
    attempt: sourceCursor.attempt,
    programLocusRef,
    retryPath: sourceCursor.retryPath,
    regime: "F_D" as const,
    armId: "arm://abiogenesis/workflow.C@5",
    compositionRef: null,
    implementationSetRef: implementationSet.implementationSetRef,
    implementationRequirementKey: null,
    implementationBindingRef: null,
    implementationRef: null,
    interactionSetRef: executionBasis.rootInteractionSetRef,
    interactionRequirementKey: null,
    interactionKind: null,
    actorCapabilityRef: null,
    responseContractRef: null,
    continuationContractRef: null,
    childGraphFunctionRef: declaredTerm.graphFunctionRef,
    inputContractRef: declaredTerm.inputCarrierRef,
    outputContractRef: declaredTerm.outputCarrierRef,
    failureContractRef,
    refusalContractRef: executionBasis.refusalContractRef,
    refusalValueKind: executionBasis.refusalValueKind,
    evidenceContractRef: executionBasis.evidenceContractRef,
    judgmentContractRef: executionBasis.judgmentContractRef,
    rejectionContractRef: executionBasis.rejectionContractRef,
    transitionContractRef: executionBasis.transitionContractRef,
    closureContractRef: executionBasis.closureContractRef,
    closureContractDigest: executionBasis.closureContractDigest,
    judgmentPredicateRef,
    terminalPredicateRef: executionBasis.terminalPredicateRef,
    replayProjectionRef: executionBasis.replayProjectionRef,
    terminalKind: executionBasis.terminalKind,
    openedEventRef: openedEvent.eventId,
    fibreSelectedEventRef: fibreEvent.eventId,
  }) as CCall;
  const locusBody = {
    cCallRef,
    cCallDigest,
    callClass: "workflow" as const,
    basisId: executionBasis.basisRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    edgeRef: executionBasis.entryRef,
    vectorIndex: 0,
    stageRole: "workflow",
    batchRef: declaredBatchRef,
    taskOrdinal: sourceCursor.taskOrdinal,
    attempt: sourceCursor.attempt,
    programLocusRef,
    retryPath: sourceCursor.retryPath,
    cursorRef: sourceCursor.cursorRef,
    cursorDigest: sourceCursor.cursorDigest,
    childGraphFunctionRef: declaredTerm.graphFunctionRef,
    failureContractRef,
    judgmentPredicateRef,
  };
  const fibreBody = {
    cCallRef,
    callClass: "workflow" as const,
    regime: "F_D" as const,
    armId: "arm://abiogenesis/workflow.C@5",
    compositionRef: null,
    implementationSetRef: executionBasis.rootImplementationSetRef,
    implementationRequirementKey: null,
    implementationBindingRef: null,
    implementationRef: null,
    interactionSetRef: executionBasis.rootInteractionSetRef,
    interactionRequirementKey: null,
    interactionKind: null,
    actorCapabilityRef: null,
    responseContractRef: null,
    continuationContractRef: null,
    childGraphFunctionRef: declaredTerm.graphFunctionRef,
  };
  const cursorEventRef = traversalCursorAdmissionEventRefAtPrefix(
    prefix,
    sourceCursor,
  );
  if (
    cursorEventRef === null ||
    sha256Canonical(cCallValue as unknown as JsonValue) !==
      sha256Canonical(expected as unknown as JsonValue) ||
    openedEvent.aggregateId !== cCallRef ||
    openedEvent.parentAggregateId !== scope.frameId ||
    openedEvent.basisId !== executionBasis.basisRef ||
    openedEvent.runId !== scope.runId ||
    openedEvent.graphCallId !== scope.graphCallId ||
    openedEvent.frameId !== scope.frameId ||
    !openedEvent.causationEventRefs.includes(cursorEventRef) ||
    !exactEventBody(openedEvent, "c_call_opened", locusBody) ||
    fibreEvent.aggregateId !== cCallRef ||
    fibreEvent.parentAggregateId !== scope.frameId ||
    fibreEvent.basisId !== executionBasis.basisRef ||
    fibreEvent.runId !== scope.runId ||
    fibreEvent.graphCallId !== scope.graphCallId ||
    fibreEvent.frameId !== scope.frameId ||
    !fibreEvent.causationEventRefs.includes(openedEvent.eventId) ||
    !exactEventBody(fibreEvent, "c_call_fibre_selected", fibreBody)
  ) {
    return null;
  }
  return events[0]?.eventId === expected.openedEventRef &&
      events[1]?.eventId === expected.fibreSelectedEventRef &&
      events[1]?.causationEventRefs.includes(expected.openedEventRef)
    ? expected
    : null;
}

function exactEventBody(
  event: ReturnType<AbgEventStore["readAll"]>[number] | undefined,
  expectedKind: string,
  expected: Readonly<Record<string, JsonValue>>,
): boolean {
  return event?.kind === expectedKind &&
    isJsonRecord(event.payload) &&
    sha256Canonical(event.payload) ===
      sha256Canonical(expected as unknown as JsonValue);
}

function admittedResultBody(
  result: AdmittedCCallResult,
): Readonly<Record<string, JsonValue>> {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    resultRef: _resultRef,
    resultDigest: _resultDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = result;
  return body as unknown as Readonly<Record<string, JsonValue>>;
}

function admittedJudgmentBody(
  judgment: AdmittedCCallJudgment,
): Readonly<Record<string, JsonValue>> {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    judgmentRef: _judgmentRef,
    judgmentDigest: _judgmentDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = judgment;
  return body as unknown as Readonly<Record<string, JsonValue>>;
}

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
export function projectAdmittedLeafCCallOutcomeAtPrefix(
  predecessorPrefix: DurablePrefixCoordinate,
  input: AdmittedLeafCCallOutcomeProjectionInput,
): RehydratedAdmittedCCallState | null {
  const basis = input.executionBasis;
  const implementationSet = input.implementationSet;
  const scope = input.openedTraversalScope;
  const stop = input.traversalStop;
  const resolution = input.implementationResolution;
  const selectedResolution = selectAdmittedImplementationResolution(
    implementationSet,
    {
      graphFunctionRef: basis.graphFunctionRef,
      nodeRef: stop.nodeRef,
      programLocusRef: stop.programLocusRef,
      implementationBindingRef: stop.implementationBindingRef,
    },
  );
  const snapshot = readRuntimeEventsAtDurablePrefix(predecessorPrefix);
  const authorityPrefix = selectValidatedRuntimeEventPrefix(snapshot);
  const prefix = selectValidatedRuntimeEventPrefix(snapshot, {
    runId: scope.runId,
  });
  if (
    !hasAdmittedExecutionBasisAtPrefix(authorityPrefix, basis) ||
    !hasAdmittedImplementationSetAtPrefix(authorityPrefix, implementationSet) ||
    !hasOpenedTraversalScopeAtPrefix(prefix, scope) ||
    !hasAdmittedTraversalCursorAtPrefix(prefix, stop.cursor) ||
    scope.executionBasisRef !== basis.basisRef ||
    scope.runId !== stop.runId ||
    scope.graphCallId !== stop.graphCallId ||
    scope.frameId !== stop.frameId ||
    stop.traversalScopeRef !== scope.scopeRef ||
    stop.cursor.executionBasisRef !== basis.basisRef ||
    stop.cursor.traversalScopeRef !== scope.scopeRef ||
    stop.cursor.frameId !== scope.frameId ||
    input.graph.materializationRef !== basis.graphRef ||
    input.graph.graphFunctionRef !== basis.graphFunctionRef ||
    implementationSet.implementationSetRef !== basis.implementationSetRef ||
    implementationSet.implementationSetDigest !== basis.implementationSetDigest ||
    selectedResolution === null ||
    !sameCanonicalValue(selectedResolution, resolution) ||
    resolution.graphFunctionRef !== basis.graphFunctionRef ||
    resolution.nodeRef !== stop.nodeRef ||
    resolution.programLocusRef !== stop.programLocusRef ||
    resolution.implementationBindingRef !== stop.implementationBindingRef ||
    resolution.computeRegime !== stop.computeRegime ||
    resolution.inputContractRef !== stop.inputContractRef ||
    resolution.outputContractRef !== stop.outputContractRef ||
    resolution.failureContractRef !== stop.failureContractRef ||
    resolution.refusalContractRef !== stop.refusalContractRef
  ) {
    return null;
  }
  const identity = {
    basisId: basis.basisRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    vectorIndex: stop.vectorIndex,
    stageRole: stop.stageRole,
    taskOrdinal: stop.taskOrdinal,
    attempt: stop.attempt,
    programLocusRef: stop.programLocusRef,
    retryPath: stop.retryPath,
  };
  const cCallDigest = sha256Canonical(identity as unknown as JsonValue);
  const cCallRef = `c-call:${cCallDigest}`;
  if (input.cCallRef !== cCallRef) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const cCallEvents = events.filter(
    (event) =>
      event.aggregateType === "c_call" && event.aggregateId === cCallRef,
  );
  const openedEvent = cCallEvents[0];
  const fibreEvent = cCallEvents[1];
  const resultEvent = cCallEvents.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      isJsonRecord(event.payload) &&
      event.payload.resultRef === input.resultRef,
  );
  const judgmentEvent = cCallEvents.find(
    (event) =>
      event.kind === "c_call_judged" &&
      isJsonRecord(event.payload) &&
      event.payload.judgmentRef === input.judgmentRef,
  );
  if (
    openedEvent?.kind !== "c_call_opened" ||
    fibreEvent?.kind !== "c_call_fibre_selected" ||
    resultEvent === undefined ||
    judgmentEvent === undefined ||
    !isJsonRecord(resultEvent.payload) ||
    !isJsonRecord(judgmentEvent.payload)
  ) {
    return null;
  }
  const locusBody = {
    cCallRef,
    cCallDigest,
    callClass: "leaf" as const,
    basisId: basis.basisRef,
    graphFunctionRef: basis.graphFunctionRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    edgeRef: stop.edgeRef,
    vectorIndex: stop.vectorIndex,
    stageRole: stop.stageRole,
    batchRef: stop.batchRef,
    taskOrdinal: stop.taskOrdinal,
    attempt: stop.attempt,
    programLocusRef: stop.programLocusRef,
    retryPath: stop.retryPath,
    cursorRef: stop.cursor.cursorRef,
    cursorDigest: stop.cursor.cursorDigest,
  };
  const fibreBody = {
    cCallRef,
    callClass: "leaf" as const,
    regime: stop.computeRegime,
    armId: stop.armId,
    compositionRef: stop.compositionRef,
    implementationSetRef: implementationSet.implementationSetRef,
    implementationRequirementKey: resolution.requirementKey,
    implementationBindingRef: resolution.implementationBindingRef,
    implementationRef: resolution.implementationRef,
  };
  if (
    openedEvent.parentAggregateId !== scope.frameId ||
    openedEvent.basisId !== basis.basisRef ||
    openedEvent.runId !== scope.runId ||
    openedEvent.graphCallId !== scope.graphCallId ||
    openedEvent.frameId !== scope.frameId ||
    !exactEventBody(openedEvent, "c_call_opened", locusBody) ||
    fibreEvent.parentAggregateId !== scope.frameId ||
    fibreEvent.basisId !== basis.basisRef ||
    fibreEvent.runId !== scope.runId ||
    fibreEvent.graphCallId !== scope.graphCallId ||
    fibreEvent.frameId !== scope.frameId ||
    !fibreEvent.causationEventRefs.includes(openedEvent.eventId) ||
    !exactEventBody(fibreEvent, "c_call_fibre_selected", fibreBody)
  ) {
    return null;
  }
  const cCall = deepFreeze({
    kind: "c_call" as const,
    schemaVersion: "5.0.0" as const,
    cCallRef,
    cCallDigest,
    callClass: "leaf" as const,
    basisId: basis.basisRef,
    runId: scope.runId,
    graphFunctionRef: basis.graphFunctionRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    edgeRef: stop.edgeRef,
    vectorIndex: stop.vectorIndex,
    stageRole: stop.stageRole,
    batchRef: stop.batchRef,
    taskOrdinal: stop.taskOrdinal,
    attempt: stop.attempt,
    programLocusRef: stop.programLocusRef,
    retryPath: stop.retryPath,
    regime: stop.computeRegime,
    armId: stop.armId,
    compositionRef: stop.compositionRef,
    implementationSetRef: implementationSet.implementationSetRef,
    implementationRequirementKey: resolution.requirementKey,
    implementationBindingRef: resolution.implementationBindingRef,
    implementationRef: resolution.implementationRef,
    interactionSetRef: basis.interactionSetRef,
    interactionRequirementKey: null,
    interactionKind: null,
    actorCapabilityRef: null,
    responseContractRef: null,
    continuationContractRef: null,
    childGraphFunctionRef: null,
    inputContractRef: resolution.inputContractRef,
    outputContractRef: resolution.outputContractRef,
    failureContractRef: resolution.failureContractRef,
    refusalContractRef: resolution.refusalContractRef,
    refusalValueKind: basis.refusalValueKind,
    evidenceContractRef: stop.evidenceContractRef,
    judgmentContractRef: stop.judgmentContractRef,
    rejectionContractRef: stop.refusalContractRef,
    transitionContractRef: basis.transitionContractRef,
    closureContractRef: basis.closureContractRef,
    closureContractDigest: basis.closureContractDigest,
    judgmentPredicateRef: stop.judgmentPredicateRef,
    terminalPredicateRef: basis.terminalPredicateRef,
    replayProjectionRef: basis.replayProjectionRef,
    terminalKind: basis.terminalKind,
    openedEventRef: openedEvent.eventId,
    fibreSelectedEventRef: fibreEvent.eventId,
  }) as CCall;
  const result = deepFreeze({
    ...resultEvent.payload,
    kind: "admitted_c_call_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    admissionEventRef: resultEvent.eventId,
  }) as unknown as AdmittedCCallResult;
  const judgment = deepFreeze({
    ...judgmentEvent.payload,
    kind: "admitted_c_call_judgment" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    admissionEventRef: judgmentEvent.eventId,
  }) as unknown as AdmittedCCallJudgment;
  return projectAdmittedCCallStateAtPrefix(
    prefix,
    cCall as unknown as Readonly<Record<string, JsonValue>>,
    result as unknown as Readonly<Record<string, JsonValue>>,
    judgment as unknown as Readonly<Record<string, JsonValue>>,
  );
}

export function projectAdmittedCCallStateAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  cCallValue: Readonly<Record<string, JsonValue>>,
  resultValue: Readonly<Record<string, JsonValue>>,
  judgmentValue: Readonly<Record<string, JsonValue>>,
): RehydratedAdmittedCCallState | null {
  const cCall = deepFreeze(cCallValue) as unknown as CCall;
  const result = deepFreeze(resultValue) as unknown as AdmittedCCallResult;
  const judgment = deepFreeze(judgmentValue) as unknown as AdmittedCCallJudgment;
  return projectAdmittedCCallOutcomeAtPrefix(
    prefix,
    cCall,
    result,
    judgment,
  );
}

export function rehydrateAdmittedCCallState(
  store: AbgEventStore,
  cCallValue: Readonly<Record<string, JsonValue>>,
  resultValue: Readonly<Record<string, JsonValue>>,
  judgmentValue: Readonly<Record<string, JsonValue>>,
): RehydratedAdmittedCCallState | null {
  const cCallRef = typeof cCallValue.cCallRef === "string"
    ? cCallValue.cCallRef
    : null;
  const opened = cCallRef === null
    ? undefined
    : store.readAll().find((event) =>
        event.kind === "c_call_opened" && event.aggregateId === cCallRef
      );
  const prefix = opened?.runId === undefined
    ? null
    : selectValidatedRuntimeEventPrefix(store.readAll(), {
        runId: opened.runId,
      });
  const projected = prefix === null
    ? null
    : projectAdmittedCCallStateAtPrefix(
        prefix,
        cCallValue,
        resultValue,
        judgmentValue,
      );
  if (projected === null) return null;
  return projected;
}

export function projectPendingInteractionCarrier(
  prefix: ValidatedRuntimeEventPrefix,
  cCallValue: Readonly<Record<string, JsonValue>>,
  resultValue: Readonly<Record<string, JsonValue>>,
  judgmentValue: Readonly<Record<string, JsonValue>>,
): RehydratedPendingInteraction | null {
  const projected = projectAdmittedCCallStateAtPrefix(
    prefix,
    cCallValue,
    resultValue,
    judgmentValue,
  );
  if (projected === null) return null;
  const { cCall, result, judgment } = projected;
  if (
    cCall.regime !== "F_H" ||
    result.resultClass !== "pending" ||
    judgment.judgment !== "pending"
  ) {
    return null;
  }
  const requestRef =
    isJsonRecord(result.value) && typeof result.value.requestRef === "string"
      ? result.value.requestRef
      : null;
  const requestDigest =
    isJsonRecord(result.value) &&
      typeof result.value.requestDigest === "string" &&
      result.value.requestDigest.startsWith("sha256:")
      ? result.value.requestDigest as Sha256Digest
      : null;
  return requestRef === null || requestDigest === null
    ? null
    : deepFreeze({ cCall, result, judgment, requestRef, requestDigest });
}

export function rehydratePendingInteraction(
  store: AbgEventStore,
  cCallValue: Readonly<Record<string, JsonValue>>,
  resultValue: Readonly<Record<string, JsonValue>>,
  judgmentValue: Readonly<Record<string, JsonValue>>,
): RehydratedPendingInteraction | null {
  const cCallRef = typeof cCallValue.cCallRef === "string"
    ? cCallValue.cCallRef
    : null;
  const openedCCall = cCallRef === null
    ? undefined
    : store.readAll().find((event) =>
        event.kind === "c_call_opened" && event.aggregateId === cCallRef
      );
  const prefix = openedCCall?.runId === undefined
    ? null
    : selectValidatedRuntimeEventPrefix(store.readAll(), {
        runId: openedCCall.runId,
      });
  const projected = prefix === null
    ? null
    : projectPendingInteractionCarrier(
        prefix,
        cCallValue,
        resultValue,
        judgmentValue,
      );
  if (projected === null) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix!);
  const continuationEvent = events.find(
    (event) =>
      event.kind === "fh_interaction_opened" &&
      isJsonRecord(event.payload) &&
      event.payload.cCallRef === projected.cCall.cCallRef,
  );
  if (
    continuationEvent === undefined ||
    !holdsAt(
      deriveRuntimeEventCalculusProjection(prefix!),
      constructRuntimeFluent({
        name: "interaction_pending",
        identity: continuationEvent.aggregateId,
      }),
    )
  ) {
    return null;
  }
  return projected;
}

type CCallOpeningBody = Omit<
  CCall,
  "kind" | "schemaVersion" | "openedEventRef" | "fibreSelectedEventRef"
>;

interface PreparedCCallOpening {
  readonly cursor: TraversalCursorCandidate;
  readonly cCall: CCallOpeningBody;
  readonly locusBody: Readonly<Record<string, JsonValue>>;
  readonly fibreBody: Readonly<Record<string, JsonValue>>;
}

interface CCallOpeningDescriptorCommon {
  readonly cursor: TraversalCursorCandidate;
  readonly edgeRef: string;
  readonly vectorIndex: number;
  readonly stageRole: string;
  readonly batchRef: string | null;
  readonly programLocusRef: string;
  readonly armId: string;
  readonly compositionRef: string | null;
  readonly implementationSetRef: string;
  readonly interactionSetRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly failureContractRef: string;
  readonly refusalContractRef: string;
  readonly evidenceContractRef: string;
  readonly judgmentContractRef: string;
  readonly rejectionContractRef: string;
  readonly judgmentPredicateRef: string;
}

type CCallOpeningDescriptor = CCallOpeningDescriptorCommon & (
  | Readonly<{
      readonly locusClass: "implementation";
      readonly regime: CCall["regime"];
      readonly implementationRequirementKey: string;
      readonly implementationBindingRef: string;
      readonly implementationRef: string;
    }>
  | Readonly<{
      readonly locusClass: "interaction";
      readonly regime: "F_H";
      readonly interactionRequirementKey: string;
      readonly interactionKind: string;
      readonly actorCapabilityRef: string;
      readonly requestContractRef: string;
      readonly responseContractRef: string;
      readonly continuationContractRef: string;
    }>
  | Readonly<{
      readonly locusClass: "workflow";
      readonly regime: "F_D";
      readonly childGraphFunctionRef: string;
    }>
);

function constructPreparedCCallOpening(
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
  descriptor: CCallOpeningDescriptor,
): PreparedCCallOpening {
  const cursor = descriptor.cursor;
  const callClass: CCall["callClass"] = descriptor.locusClass === "workflow"
    ? "workflow"
    : "leaf";
  const identity = {
    basisId: executionBasis.basisRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    vectorIndex: descriptor.vectorIndex,
    stageRole: descriptor.stageRole,
    taskOrdinal: cursor.taskOrdinal,
    attempt: cursor.attempt,
    programLocusRef: descriptor.programLocusRef,
    retryPath: cursor.retryPath,
    ...(descriptor.locusClass === "workflow"
      ? {
          childGraphFunctionRef: descriptor.childGraphFunctionRef,
          failureContractRef: descriptor.failureContractRef,
        }
      : {}),
  };
  const cCallDigest = sha256Canonical(identity as unknown as JsonValue);
  const cCallRef = `c-call:${cCallDigest}`;
  const locusBody = {
    cCallRef,
    cCallDigest,
    callClass,
    basisId: executionBasis.basisRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    edgeRef: descriptor.edgeRef,
    vectorIndex: descriptor.vectorIndex,
    stageRole: descriptor.stageRole,
    batchRef: descriptor.batchRef,
    taskOrdinal: cursor.taskOrdinal,
    attempt: cursor.attempt,
    programLocusRef: descriptor.programLocusRef,
    retryPath: cursor.retryPath,
    cursorRef: cursor.cursorRef,
    cursorDigest: cursor.cursorDigest,
    ...(descriptor.locusClass === "workflow"
      ? {
          childGraphFunctionRef: descriptor.childGraphFunctionRef,
          failureContractRef: descriptor.failureContractRef,
          judgmentPredicateRef: descriptor.judgmentPredicateRef,
        }
      : {}),
  };
  const fibreBody = descriptor.locusClass === "implementation"
    ? {
        cCallRef,
        callClass: "leaf" as const,
        regime: descriptor.regime,
        armId: descriptor.armId,
        compositionRef: descriptor.compositionRef,
        implementationSetRef: descriptor.implementationSetRef,
        implementationRequirementKey: descriptor.implementationRequirementKey,
        implementationBindingRef: descriptor.implementationBindingRef,
        implementationRef: descriptor.implementationRef,
      }
    : descriptor.locusClass === "interaction"
      ? {
          cCallRef,
          callClass: "leaf" as const,
          regime: "F_H" as const,
          armId: descriptor.armId,
          compositionRef: descriptor.compositionRef,
          implementationSetRef: descriptor.implementationSetRef,
          implementationRequirementKey: null,
          implementationBindingRef: null,
          implementationRef: null,
          interactionSetRef: descriptor.interactionSetRef,
          interactionRequirementKey: descriptor.interactionRequirementKey,
          interactionKind: descriptor.interactionKind,
          actorCapabilityRef: descriptor.actorCapabilityRef,
          requestContractRef: descriptor.requestContractRef,
          responseContractRef: descriptor.responseContractRef,
          continuationContractRef: descriptor.continuationContractRef,
        }
      : {
          cCallRef,
          callClass: "workflow" as const,
          regime: "F_D" as const,
          armId: descriptor.armId,
          compositionRef: descriptor.compositionRef,
          implementationSetRef: descriptor.implementationSetRef,
          implementationRequirementKey: null,
          implementationBindingRef: null,
          implementationRef: null,
          interactionSetRef: descriptor.interactionSetRef,
          interactionRequirementKey: null,
          interactionKind: null,
          actorCapabilityRef: null,
          responseContractRef: null,
          continuationContractRef: null,
          childGraphFunctionRef: descriptor.childGraphFunctionRef,
        };
  const cCall: CCallOpeningBody = {
    cCallRef,
    cCallDigest,
    callClass,
    basisId: executionBasis.basisRef,
    runId: scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    edgeRef: descriptor.edgeRef,
    vectorIndex: descriptor.vectorIndex,
    stageRole: descriptor.stageRole,
    batchRef: descriptor.batchRef,
    taskOrdinal: cursor.taskOrdinal,
    attempt: cursor.attempt,
    programLocusRef: descriptor.programLocusRef,
    retryPath: cursor.retryPath,
    regime: descriptor.regime,
    armId: descriptor.armId,
    compositionRef: descriptor.compositionRef,
    implementationSetRef: descriptor.implementationSetRef,
    implementationRequirementKey: descriptor.locusClass === "implementation"
      ? descriptor.implementationRequirementKey
      : null,
    implementationBindingRef: descriptor.locusClass === "implementation"
      ? descriptor.implementationBindingRef
      : null,
    implementationRef: descriptor.locusClass === "implementation"
      ? descriptor.implementationRef
      : null,
    interactionSetRef: descriptor.interactionSetRef,
    interactionRequirementKey: descriptor.locusClass === "interaction"
      ? descriptor.interactionRequirementKey
      : null,
    interactionKind: descriptor.locusClass === "interaction"
      ? descriptor.interactionKind
      : null,
    actorCapabilityRef: descriptor.locusClass === "interaction"
      ? descriptor.actorCapabilityRef
      : null,
    responseContractRef: descriptor.locusClass === "interaction"
      ? descriptor.responseContractRef
      : null,
    continuationContractRef: descriptor.locusClass === "interaction"
      ? descriptor.continuationContractRef
      : null,
    childGraphFunctionRef: descriptor.locusClass === "workflow"
      ? descriptor.childGraphFunctionRef
      : null,
    inputContractRef: descriptor.inputContractRef,
    outputContractRef: descriptor.outputContractRef,
    failureContractRef: descriptor.failureContractRef,
    refusalContractRef: descriptor.refusalContractRef,
    refusalValueKind: executionBasis.refusalValueKind,
    evidenceContractRef: descriptor.evidenceContractRef,
    judgmentContractRef: descriptor.judgmentContractRef,
    rejectionContractRef: descriptor.rejectionContractRef,
    transitionContractRef: executionBasis.transitionContractRef,
    closureContractRef: executionBasis.closureContractRef,
    closureContractDigest: executionBasis.closureContractDigest,
    judgmentPredicateRef: descriptor.judgmentPredicateRef,
    terminalPredicateRef: executionBasis.terminalPredicateRef,
    replayProjectionRef: executionBasis.replayProjectionRef,
    terminalKind: executionBasis.terminalKind,
  };
  return { cursor, cCall, locusBody, fibreBody };
}

function admitPreparedCCallOpening(input: Readonly<{
  store: AbgEventStore;
  predecessorPrefix: DurablePrefixCoordinate;
  openingAuthorityPrefix: ValidatedRuntimeEventPrefix;
  openingPrefix: ValidatedRuntimeEventPrefix;
  cursorAdmissionEventRef: string;
  executionBasis: ExecutionBasis;
  scope: OpenedTraversalScope;
  graph: Readonly<GtlGraph>;
  graphFunction: Readonly<GraphFunction>;
  prepared: PreparedCCallOpening;
  basis: RuntimeAdmissionBasis;
}>): CCallAdmission | CCallOpenRefusal {
  const {
    store,
    predecessorPrefix,
    openingAuthorityPrefix,
    openingPrefix,
    cursorAdmissionEventRef,
    executionBasis,
    scope,
    graph,
    graphFunction,
    prepared,
    basis,
  } = input;
  const { cCall: body, cursor } = prepared;
  if (!cCallPhasePermitsOpening(openingPrefix, body.cCallRef)) {
    return openRefusal(
      "locus_mismatch",
      "CCall is stale or already opened at this exact traversal locus",
    );
  }
  const retryOwner = cursor.retryPath.length === 0
    ? null
    : projectDeclaredCRetryCCallWriteAtPrefix(
        openingPrefix,
        openingAuthorityPrefix,
        graph,
        graphFunction,
        cursor,
        {
          kind: "declared_c_retry_prospective_c_call_candidate",
          cCallRef: body.cCallRef,
          cCallDigest: body.cCallDigest,
        },
        "not_open",
      );
  if (cursor.retryPath.length !== 0 && retryOwner === null) {
    return openRefusal(
      "locus_mismatch",
      "retry CCall open requires the exact declared active retry frontier",
    );
  }
  const transaction = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(
    store,
    predecessorPrefix,
    () => {
      const openedEvent = admitRuntimeEvent(store, {
        kind: "c_call_opened",
        eventTime: basis.eventTime,
        aggregateType: "c_call",
        aggregateId: body.cCallRef,
        parentAggregateId: scope.frameId,
        causationEventRefs: [
          cursorAdmissionEventRef,
          ...basis.causationEventRefs,
        ],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: executionBasis.basisRef,
        runId: scope.runId,
        graphFunctionRef: executionBasis.graphFunctionRef,
        materializationRef: executionBasis.graphRef,
        graphCallId: scope.graphCallId,
        frameId: scope.frameId,
        frameLineageId: scope.frameLineageId,
        payload: prepared.locusBody,
      });
      const fibreEvent = admitRuntimeEvent(store, {
        kind: "c_call_fibre_selected",
        eventTime: basis.eventTime,
        aggregateType: "c_call",
        aggregateId: body.cCallRef,
        parentAggregateId: scope.frameId,
        causationEventRefs: [openedEvent.eventId],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: executionBasis.basisRef,
        runId: scope.runId,
        graphFunctionRef: executionBasis.graphFunctionRef,
        materializationRef: executionBasis.graphRef,
        graphCallId: scope.graphCallId,
        frameId: scope.frameId,
        frameLineageId: scope.frameLineageId,
        payload: prepared.fibreBody,
      });
      const cCall = deepFreeze({
        kind: "c_call" as const,
        schemaVersion: "5.0.0" as const,
        ...body,
        openedEventRef: openedEvent.eventId,
        fibreSelectedEventRef: fibreEvent.eventId,
      }) as CCall;
      return deepFreeze({
        kind: "c_call_admission" as const,
        schemaVersion: "5.0.0" as const,
        disposition: "opened" as const,
        cCall,
      });
    },
  );
  return deepFreeze({
    ...transaction.value,
    successorPrefix: transaction.successorPrefix,
  }) as CCallAdmission;
}

function openImplementationCCallLocus(
  opening: CCallOpeningAuthority,
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
  program: Readonly<GtlProgram>,
  graphFunction: Readonly<GraphFunction>,
  graph: Readonly<GtlGraph>,
  stop: ExecutableCCallLocusCandidate,
  implementationSet: AdmittedImplementationSet,
  resolution: AdmittedImplementationResolutionRow,
  basis: RuntimeAdmissionBasis,
): CCallAdmission | CCallOpenRefusal {
  const openingAuthorityPrefix = opening.authorityPrefix;
  const openingPrefix = opening.runPrefix;
  const declaredNode = graph.template.nodes.find((node) => node.nodeRef === stop.nodeRef);
  const declaredTerm = declaredNode === undefined
    ? undefined
    : resolveCProgramTermAtSourcePath(
        graph.template,
        stop.cursor.currentNodeRef,
        stop.cursor.termPath,
      );
  const declaredBatchRef = declaredNode === undefined
    ? undefined
    : resolveEnclosingCBatchRef(
        graph.template,
        stop.cursor.currentNodeRef,
        stop.cursor.termPath,
      );
  if (
    !isCCallLocusCandidate(stop) || stop.stopClass !== "executable" ||
    stop.traversalScopeRef !== scope.scopeRef ||
    !hasAdmittedTraversalCursorAtPrefix(openingPrefix, stop.cursor) ||
    stop.cursor.traversalScopeRef !== scope.scopeRef ||
    stop.cursor.executionBasisRef !== executionBasis.basisRef ||
    stop.cursor.frameId !== scope.frameId ||
    stop.cursor.currentNodeRef !== stop.nodeRef ||
    stop.taskOrdinal !== stop.cursor.taskOrdinal ||
    stop.attempt !== stop.cursor.attempt ||
    !sameCanonicalValue(stop.retryPath, stop.cursor.retryPath) ||
    stop.runId !== scope.runId ||
    stop.graphCallId !== scope.graphCallId ||
    stop.frameId !== scope.frameId ||
    stop.disposition !== "at_compute_locus" ||
    program.programRef !== executionBasis.programRef ||
    graphFunction.name !== graph.graphFunctionRef ||
    sha256Canonical(graphFunction as unknown as JsonValue) !==
      graph.graphFunctionDigest ||
    graph.materializationRef !== executionBasis.graphRef ||
    declaredNode === undefined ||
    declaredTerm === undefined ||
    declaredTerm.kind === "c_source_path_refusal" ||
    declaredBatchRef === undefined ||
    (declaredBatchRef !== null && typeof declaredBatchRef !== "string") ||
    !isExecutableCLeaf(declaredTerm) ||
    !program.callableMembership.includes(executionBasis.graphFunctionRef) ||
    stop.programLocusRef !== declaredTerm.programLocusRef ||
    stop.edgeRef !== executionBasis.entryRef ||
    stop.vectorIndex !== declaredTerm.vectorIndex ||
    stop.judgmentPredicateRef !== declaredTerm.judgmentPredicateRef ||
    stop.stageRole !== declaredTerm.stageRole ||
    stop.batchRef !== declaredBatchRef ||
    stop.computeRegime !== declaredTerm.fibre ||
    stop.armId !== declaredTerm.armId ||
    stop.compositionRef !== declaredTerm.compositionRef ||
    stop.implementationBindingRef !== declaredTerm.requirement.implementationBindingRef ||
    stop.inputContractRef !== declaredTerm.requirement.inputContractRef ||
    stop.outputContractRef !== declaredTerm.requirement.outputContractRef ||
    stop.evidenceContractRef !== declaredTerm.requirement.evidenceContractRef ||
    stop.failureContractRef !== declaredTerm.requirement.failureContractRef ||
    stop.refusalContractRef !== declaredTerm.requirement.refusalContractRef ||
    stop.judgmentContractRef !== declaredTerm.requirement.judgmentContractRef
  ) {
    return openRefusal("locus_mismatch", "CCall requires the exact HoG stop at this scope's C locus");
  }
  const exactImplementationSet = rehydrateAdmittedImplementationSetAtPrefix(
    openingAuthorityPrefix,
    implementationSet.implementationSetRef,
  );
  const exactResolution = exactImplementationSet === null
    ? null
    : selectAdmittedImplementationResolution(exactImplementationSet, {
        graphFunctionRef: executionBasis.graphFunctionRef,
        nodeRef: stop.nodeRef,
        programLocusRef: stop.programLocusRef,
        implementationBindingRef: stop.implementationBindingRef,
      });
  if (
    exactImplementationSet === null ||
    exactResolution === null ||
    !sameCanonicalValue(exactImplementationSet, implementationSet) ||
    !sameCanonicalValue(exactResolution, resolution) ||
    executionBasis.implementationSetRef !== implementationSet.implementationSetRef ||
    executionBasis.implementationSetDigest !== implementationSet.implementationSetDigest ||
    resolution.graphFunctionRef !== executionBasis.graphFunctionRef ||
    resolution.nodeRef !== stop.nodeRef ||
    resolution.programLocusRef !== stop.programLocusRef ||
    resolution.implementationBindingRef !== stop.implementationBindingRef ||
    resolution.computeRegime !== stop.computeRegime ||
    resolution.inputContractRef !== stop.inputContractRef ||
    resolution.outputContractRef !== stop.outputContractRef
  ) {
    return openRefusal("implementation_mismatch", "CCall locus and admitted implementation resolution disagree");
  }
  const cursorAdmissionEventRef = opening.cursorAdmissionEventRef;
  const prepared = constructPreparedCCallOpening(executionBasis, scope, {
    locusClass: "implementation",
    cursor: stop.cursor,
    edgeRef: stop.edgeRef,
    vectorIndex: stop.vectorIndex,
    stageRole: stop.stageRole,
    batchRef: stop.batchRef,
    programLocusRef: stop.programLocusRef,
    regime: stop.computeRegime,
    armId: stop.armId,
    compositionRef: stop.compositionRef,
    implementationSetRef: exactImplementationSet.implementationSetRef,
    implementationRequirementKey: exactResolution.requirementKey,
    implementationBindingRef: exactResolution.implementationBindingRef,
    implementationRef: exactResolution.implementationRef,
    interactionSetRef: executionBasis.interactionSetRef,
    inputContractRef: exactResolution.inputContractRef,
    outputContractRef: exactResolution.outputContractRef,
    failureContractRef: exactResolution.failureContractRef,
    refusalContractRef: exactResolution.refusalContractRef,
    evidenceContractRef: stop.evidenceContractRef,
    judgmentContractRef: stop.judgmentContractRef,
    rejectionContractRef: stop.refusalContractRef,
    judgmentPredicateRef: stop.judgmentPredicateRef,
  });
  return admitPreparedCCallOpening({
    store,
    predecessorPrefix,
    openingAuthorityPrefix,
    openingPrefix,
    cursorAdmissionEventRef,
    executionBasis,
    scope,
    graph,
    graphFunction,
    prepared,
    basis,
  });
}

function openInteractionCCallLocus(
  opening: CCallOpeningAuthority,
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
  program: Readonly<GtlProgram>,
  graphFunction: Readonly<GraphFunction>,
  graph: Readonly<GtlGraph>,
  stop: InteractionCCallLocusCandidate,
  interactionSet: AdmittedInteractionSet,
  interaction: AdmittedInteractionContractRow,
  basis: RuntimeAdmissionBasis,
): CCallAdmission | CCallOpenRefusal {
  const openingAuthorityPrefix = opening.authorityPrefix;
  const openingPrefix = opening.runPrefix;
  const declaredNode = graph.template.nodes.find(
    (node) => node.nodeRef === stop.nodeRef,
  );
  const declaredTerm = declaredNode === undefined
    ? undefined
    : resolveCProgramTermAtSourcePath(
        graph.template,
        stop.cursor.currentNodeRef,
        stop.cursor.termPath,
      );
  const declaredBatchRef = declaredNode === undefined
    ? undefined
    : resolveEnclosingCBatchRef(
        graph.template,
        stop.cursor.currentNodeRef,
        stop.cursor.termPath,
      );
  if (
    !isCCallLocusCandidate(stop) || stop.stopClass !== "interaction" ||
    stop.traversalScopeRef !== scope.scopeRef ||
    !hasAdmittedTraversalCursorAtPrefix(openingPrefix, stop.cursor) ||
    stop.cursor.traversalScopeRef !== scope.scopeRef ||
    stop.cursor.executionBasisRef !== executionBasis.basisRef ||
    stop.cursor.frameId !== scope.frameId ||
    stop.cursor.currentNodeRef !== stop.nodeRef ||
    stop.taskOrdinal !== stop.cursor.taskOrdinal ||
    stop.attempt !== stop.cursor.attempt ||
    !sameCanonicalValue(stop.retryPath, stop.cursor.retryPath) ||
    stop.runId !== scope.runId ||
    stop.graphCallId !== scope.graphCallId ||
    stop.frameId !== scope.frameId ||
    stop.disposition !== "at_compute_locus" ||
    program.programRef !== executionBasis.programRef ||
    graphFunction.name !== graph.graphFunctionRef ||
    sha256Canonical(graphFunction as unknown as JsonValue) !==
      graph.graphFunctionDigest ||
    graph.materializationRef !== executionBasis.graphRef ||
    declaredNode === undefined ||
    declaredTerm === undefined ||
    declaredTerm.kind === "c_source_path_refusal" ||
    declaredBatchRef === undefined ||
    (declaredBatchRef !== null && typeof declaredBatchRef !== "string") ||
    !isInteractionCLeaf(declaredTerm) ||
    !program.callableMembership.includes(executionBasis.graphFunctionRef) ||
    stop.programLocusRef !== declaredTerm.programLocusRef ||
    stop.edgeRef !== executionBasis.entryRef ||
    stop.vectorIndex !== declaredTerm.vectorIndex ||
    stop.judgmentPredicateRef !== declaredTerm.judgmentPredicateRef ||
    stop.stageRole !== declaredTerm.stageRole ||
    stop.batchRef !== declaredBatchRef ||
    stop.computeRegime !== "F_H" ||
    stop.armId !== declaredTerm.armId ||
    stop.compositionRef !== declaredTerm.compositionRef ||
    stop.interactionKind !== declaredTerm.requirement.interactionKind ||
    stop.actorCapabilityRef !== declaredTerm.requirement.actorCapabilityRef ||
    stop.requestContractRef !== declaredTerm.requirement.requestContractRef ||
    stop.responseContractRef !== declaredTerm.requirement.responseContractRef ||
    stop.continuationContractRef !==
      declaredTerm.requirement.continuationContractRef
  ) {
    return openRefusal(
      "locus_mismatch",
      "F_H CCall requires the exact HoG stop at this declared interaction locus",
    );
  }
  const exactInteractionSet = rehydrateAdmittedInteractionSetAtPrefix(
    openingAuthorityPrefix,
    interactionSet.interactionSetRef,
  );
  const exactInteraction = exactInteractionSet === null
    ? null
    : selectAdmittedInteractionContract(exactInteractionSet, {
        graphFunctionRef: executionBasis.graphFunctionRef,
        nodeRef: stop.nodeRef,
        programLocusRef: stop.programLocusRef,
        interactionKind: stop.interactionKind,
        actorCapabilityRef: stop.actorCapabilityRef,
        requestContractRef: stop.requestContractRef,
        responseContractRef: stop.responseContractRef,
        continuationContractRef: stop.continuationContractRef,
      });
  if (
    exactInteractionSet === null ||
    exactInteraction === null ||
    !sameCanonicalValue(exactInteractionSet, interactionSet) ||
    !sameCanonicalValue(exactInteraction, interaction) ||
    executionBasis.interactionSetRef !== interactionSet.interactionSetRef ||
    executionBasis.interactionSetDigest !== interactionSet.interactionSetDigest ||
    interaction.graphFunctionRef !== executionBasis.graphFunctionRef ||
    interaction.nodeRef !== stop.nodeRef ||
    interaction.programLocusRef !== stop.programLocusRef ||
    interaction.fibre !== "F_H" ||
    interaction.requirement.interactionKind !== stop.interactionKind ||
    interaction.requirement.actorCapabilityRef !== stop.actorCapabilityRef ||
    interaction.requirement.requestContractRef !== stop.requestContractRef ||
    interaction.requirement.responseContractRef !== stop.responseContractRef ||
    interaction.requirement.continuationContractRef !==
      stop.continuationContractRef
  ) {
    return openRefusal(
      "implementation_mismatch",
      "F_H locus and admitted non-executable interaction row disagree",
    );
  }
  const cursorAdmissionEventRef = opening.cursorAdmissionEventRef;
  const prepared = constructPreparedCCallOpening(executionBasis, scope, {
    locusClass: "interaction",
    cursor: stop.cursor,
    edgeRef: stop.edgeRef,
    vectorIndex: stop.vectorIndex,
    stageRole: stop.stageRole,
    batchRef: stop.batchRef,
    programLocusRef: stop.programLocusRef,
    regime: "F_H",
    armId: stop.armId,
    compositionRef: stop.compositionRef,
    implementationSetRef: executionBasis.rootImplementationSetRef,
    interactionSetRef: exactInteractionSet.interactionSetRef,
    interactionRequirementKey: exactInteraction.requirementKey,
    interactionKind: stop.interactionKind,
    actorCapabilityRef: stop.actorCapabilityRef,
    requestContractRef: stop.requestContractRef,
    responseContractRef: stop.responseContractRef,
    continuationContractRef: stop.continuationContractRef,
    inputContractRef: stop.requestContractRef,
    outputContractRef: stop.responseContractRef,
    failureContractRef: executionBasis.refusalContractRef,
    refusalContractRef: executionBasis.refusalContractRef,
    evidenceContractRef: stop.requestContractRef,
    judgmentContractRef: stop.continuationContractRef,
    rejectionContractRef: executionBasis.rejectionContractRef,
    judgmentPredicateRef: stop.judgmentPredicateRef,
  });
  return admitPreparedCCallOpening({
    store,
    predecessorPrefix,
    openingAuthorityPrefix,
    openingPrefix,
    cursorAdmissionEventRef,
    executionBasis,
    scope,
    graph,
    graphFunction,
    prepared,
    basis,
  });
}

function openWorkflowCCallLocus(
  opening: CCallOpeningAuthority,
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  executionBasis: ExecutionBasis,
  implementationSet: AdmittedImplementationSet,
  scope: OpenedTraversalScope,
  program: Readonly<GtlProgram>,
  graphFunction: Readonly<GraphFunction>,
  graph: Readonly<GtlGraph>,
  proposal: WorkflowCCallProposal,
  basis: RuntimeAdmissionBasis,
): CCallAdmission | CCallOpenRefusal {
  const openingAuthorityPrefix = opening.authorityPrefix;
  const openingPrefix = opening.runPrefix;
  const cursor = proposal.cursor;
  const declaredTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  const declaredBatchRef = resolveEnclosingCBatchRef(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  const exactImplementationSet = rehydrateAdmittedImplementationSetAtPrefix(
    openingAuthorityPrefix,
    implementationSet.implementationSetRef,
  );
  const childFailureContractRefs = new Set(
    (exactImplementationSet?.rows ?? [])
      .filter((row) => row.graphFunctionRef === proposal.childGraphFunctionRef)
      .map((row) => row.failureContractRef),
  );
  if (
    exactImplementationSet === null ||
    !sameCanonicalValue(exactImplementationSet, implementationSet) ||
    implementationSet.implementationSetRef !==
      executionBasis.rootImplementationSetRef ||
    implementationSet.implementationSetDigest !==
      executionBasis.rootImplementationSetDigest ||
    childFailureContractRefs.size !== 1 ||
    !childFailureContractRefs.has(proposal.failureContractRef) ||
    proposal.kind !== "workflow_c_call_proposal" ||
    proposal.schemaVersion !== "5.0.0" ||
    proposal.traversalScopeRef !== scope.scopeRef ||
    proposal.runId !== scope.runId ||
    proposal.graphCallId !== scope.graphCallId ||
    proposal.frameId !== scope.frameId ||
    !hasAdmittedTraversalCursorAtPrefix(openingPrefix, cursor) ||
    cursor.executionBasisRef !== executionBasis.basisRef ||
    cursor.traversalScopeRef !== scope.scopeRef ||
    cursor.graphRef !== graph.materializationRef ||
    graphFunction.name !== graph.graphFunctionRef ||
    sha256Canonical(graphFunction as unknown as JsonValue) !== graph.graphFunctionDigest ||
    program.programRef !== executionBasis.programRef ||
    !program.callableMembership.includes(proposal.childGraphFunctionRef) ||
    declaredTerm.kind === "c_source_path_refusal" ||
    declaredTerm.kind !== "c_workflow" ||
    declaredTerm.graphFunctionRef !== proposal.childGraphFunctionRef ||
    declaredTerm.inputCarrierRef !== proposal.inputContractRef ||
    declaredTerm.outputCarrierRef !== proposal.outputContractRef ||
    graphFunction.declarations["abg.judgment_predicate"] !==
      proposal.judgmentPredicateRef ||
    (declaredBatchRef !== null && typeof declaredBatchRef !== "string")
  ) {
    return openRefusal(
      "locus_mismatch",
      "workflow CCall requires the exact admitted workflow.C term and child declaration",
    );
  }
  const cursorAdmissionEventRef = opening.cursorAdmissionEventRef;
  const programLocusDigest = sha256Canonical({
    graphFunctionRef: executionBasis.graphFunctionRef,
    nodeRef: cursor.currentNodeRef,
    termPath: cursor.termPath,
    childGraphFunctionRef: proposal.childGraphFunctionRef,
  } as unknown as JsonValue);
  const programLocusRef =
    `workflow-locus://abiogenesis/${programLocusDigest.slice("sha256:".length)}`;
  const prepared = constructPreparedCCallOpening(executionBasis, scope, {
    locusClass: "workflow",
    cursor,
    edgeRef: executionBasis.entryRef,
    vectorIndex: 0,
    stageRole: "workflow",
    batchRef: declaredBatchRef,
    programLocusRef,
    regime: "F_D",
    armId: "arm://abiogenesis/workflow.C@5",
    compositionRef: null,
    implementationSetRef: exactImplementationSet.implementationSetRef,
    interactionSetRef: executionBasis.rootInteractionSetRef,
    childGraphFunctionRef: proposal.childGraphFunctionRef,
    inputContractRef: proposal.inputContractRef,
    outputContractRef: proposal.outputContractRef,
    failureContractRef: proposal.failureContractRef,
    refusalContractRef: executionBasis.refusalContractRef,
    evidenceContractRef: executionBasis.evidenceContractRef,
    judgmentContractRef: executionBasis.judgmentContractRef,
    rejectionContractRef: executionBasis.rejectionContractRef,
    judgmentPredicateRef: proposal.judgmentPredicateRef,
  });
  return admitPreparedCCallOpening({
    store,
    predecessorPrefix,
    openingAuthorityPrefix,
    openingPrefix,
    cursorAdmissionEventRef,
    executionBasis,
    scope,
    graph,
    graphFunction,
    prepared,
    basis,
  });
}

export function openCCall(
  input: Readonly<CCallOpenInput>,
): CCallAdmission | CCallOpenRefusal {
  const cursor = input.locusClass === "workflow"
    ? input.proposal.cursor
    : input.stop.cursor;
  const opening = projectCCallOpeningAuthority(
    input.store,
    input.predecessorPrefix,
    input.executionBasis,
    input.scope,
    cursor,
  );
  if (
    opening === null ||
    input.scope.executionBasisRef !== input.executionBasis.basisRef ||
    input.scope.graphFunctionRef !== input.executionBasis.graphFunctionRef
  ) {
    return openRefusal(
      "scope_mismatch",
      "CCall requires one exact active basis, scope, and traversal cursor",
    );
  }
  switch (input.locusClass) {
    case "implementation":
      return openImplementationCCallLocus(
        opening,
        input.store,
        input.predecessorPrefix,
        input.executionBasis,
        input.scope,
        input.program,
        input.graphFunction,
        input.graph,
        input.stop,
        input.implementationSet,
        input.resolution,
        input.basis,
      );
    case "interaction":
      return openInteractionCCallLocus(
        opening,
        input.store,
        input.predecessorPrefix,
        input.executionBasis,
        input.scope,
        input.program,
        input.graphFunction,
        input.graph,
        input.stop,
        input.interactionSet,
        input.interaction,
        input.basis,
      );
    case "workflow":
      return openWorkflowCCallLocus(
        opening,
        input.store,
        input.predecessorPrefix,
        input.executionBasis,
        input.implementationSet,
        input.scope,
        input.program,
        input.graphFunction,
        input.graph,
        input.proposal,
        input.basis,
      );
  }
}

function pendingInteractionPlanBody(
  plan: PendingInteractionAdmissionPlan,
): Readonly<Record<string, JsonValue>> {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    planRef: _planRef,
    planDigest: _planDigest,
    ...body
  } = plan;
  return body as unknown as Readonly<Record<string, JsonValue>>;
}

export function planPendingInteractionAdmission(
  store: AbgEventStore,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  cCall: CCall,
  request: Readonly<Record<string, JsonValue>>,
  expectedInputDigest: Sha256Digest,
  basis: RuntimeAdmissionBasis,
): PendingInteractionAdmissionPlan {
  const owner = projectCCallOwnerPrefix(store, cCall);
  const retryOwner = cCall.retryPath.length === 0 || owner === null
    ? null
    : projectDeclaredCRetryCCallWriteAtPrefix(
        owner.prefix,
        owner.authorityPrefix,
        graph,
        graphFunction,
        cursor,
        cCall,
        owner.phase.phase,
      );
  const retryAttemptRef = retryOwner?.active.attempt.attemptRef ?? null;
  if (
    owner?.phase.phase !== "selected_no_evidence" ||
    cCall.callClass !== "leaf" || cCall.regime !== "F_H" ||
    cCall.interactionKind === null || cCall.actorCapabilityRef === null ||
    cCall.responseContractRef === null ||
    cCall.continuationContractRef === null ||
    sha256Canonical(request as unknown as JsonValue) !== expectedInputDigest ||
    owner.rows.length !== 2 ||
    (cCall.retryPath.length !== 0 && retryAttemptRef === null)
  ) {
    throw new TypeError(
      "pending F_H admission requires one exact open interaction CCall and request",
    );
  }
  const requestDigest = expectedInputDigest;
  const requestRef =
    `interaction-request://abiogenesis/${requestDigest.slice("sha256:".length)}`;
  const pendingValue = deepFreeze({
    kind: "fh_pending_result" as const,
    schemaVersion: "5.0.0" as const,
    interactionKind: cCall.interactionKind,
    requestRef,
    requestDigest,
    responseContractRef: cCall.responseContractRef,
    continuationContractRef: cCall.continuationContractRef,
  });
  const pendingValueDigest = sha256Canonical(
    pendingValue as unknown as JsonValue,
  );
  const evidenceBody = {
    cCallRef: cCall.cCallRef,
    evidenceClass: "interaction_request" as const,
    contractRef: cCall.inputContractRef,
    implementationRef: null,
    inputDigest: requestDigest,
    outputDigest: pendingValueDigest,
    requestRef,
    requestDigest,
  };
  const evidenceDigest = sha256Canonical(evidenceBody as unknown as JsonValue);
  const evidenceRef =
    `evidence://abiogenesis/${evidenceDigest.slice("sha256:".length)}`;
  const resultBody = {
    cCallRef: cCall.cCallRef,
    resultClass: "pending" as const,
    contractRef: cCall.continuationContractRef,
    valueKind: "fh_pending_result",
    valueDigest: pendingValueDigest,
    value: pendingValue,
    evidenceRefs: [evidenceRef],
  };
  const resultDigest = sha256Canonical(resultBody as unknown as JsonValue);
  const resultRef =
    `result://abiogenesis/${resultDigest.slice("sha256:".length)}`;
  const judgmentReasonRef =
    `reason://abiogenesis/fh/${cCall.interactionKind}/pending@5`;
  const projectedHistory = [
    ...runtimeEventsFromValidatedPrefix(owner.authorityPrefix),
  ];
  const eventCandidates: RuntimeEventCandidate[] = [];
  const projectedEvents: RuntimeEvent[] = [];
  const project = (candidate: RuntimeEventCandidate): RuntimeEvent => {
    const event = projectRuntimeEventFromValidatedHistory(
      projectedHistory,
      candidate,
    );
    eventCandidates.push(deepFreeze(candidate));
    projectedEvents.push(event);
    projectedHistory.push(event);
    return event;
  };
  const evidenceEvent = project({
    kind: "c_call_evidenced",
    eventTime: basis.eventTime,
    aggregateType: "c_call",
    aggregateId: cCall.cCallRef,
    parentAggregateId: cCall.frameId,
    causationEventRefs: [
      cCall.fibreSelectedEventRef,
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { evidenceRef, evidenceDigest, ...evidenceBody },
  });
  const evidence = deepFreeze({
    kind: "admitted_c_call_evidence" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    evidenceRef,
    evidenceDigest,
    ...evidenceBody,
    admissionEventRef: evidenceEvent.eventId,
  }) as AdmittedCCallEvidence;
  const resultEvent = project({
    kind: "c_call_result_admitted",
    eventTime: basis.eventTime,
    aggregateType: "c_call",
    aggregateId: cCall.cCallRef,
    parentAggregateId: cCall.frameId,
    causationEventRefs: [evidenceEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { resultRef, resultDigest, ...resultBody },
  });
  const result = deepFreeze({
    kind: "admitted_c_call_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    resultRef,
    resultDigest,
    ...resultBody,
    admissionEventRef: resultEvent.eventId,
  }) as AdmittedCCallResult;
  const resultAuthorityPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...projectedHistory]),
  );
  const resultRunPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...projectedHistory]),
    { runId: cCall.runId },
  );
  const resultReplayState = replayValidatedRuntimeEventPrefix(
    resultRunPrefix,
    resultAuthorityPrefix,
  );
  const judgmentBody = {
    cCallRef: cCall.cCallRef,
    resultRef,
    resultDigest,
    judgment: "pending" as const,
    reasonRef: judgmentReasonRef,
    contractRef: cCall.judgmentContractRef,
    predicateRef: cCall.judgmentPredicateRef,
    replayStateDigest: resultReplayState.replayDigest,
    retryAttemptRef,
  };
  const judgmentDigest = sha256Canonical(
    judgmentBody as unknown as JsonValue,
  );
  const judgmentRef =
    `judgment://abiogenesis/${judgmentDigest.slice("sha256:".length)}`;
  const judgmentEvent = project({
    kind: "c_call_judged",
    eventTime: basis.eventTime,
    aggregateType: "c_call",
    aggregateId: cCall.cCallRef,
    parentAggregateId: cCall.frameId,
    causationEventRefs: [resultEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { judgmentRef, judgmentDigest, ...judgmentBody },
  });
  const judgment = deepFreeze({
    kind: "admitted_c_call_judgment" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    judgmentRef,
    judgmentDigest,
    ...judgmentBody,
    admissionEventRef: judgmentEvent.eventId,
  }) as AdmittedCCallJudgment;
  const pending = deepFreeze({
    kind: "pending_interaction_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "pending" as const,
    cCall,
    evidence,
    result,
    judgment,
    requestRef,
    requestDigest,
  }) as PendingInteractionAdmission;
  const projectedPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...projectedHistory]),
  );
  const projectedRunPrefix = selectValidatedRuntimeEventPrefix(
    Object.freeze([...projectedHistory]),
    { runId: cCall.runId },
  );
  const replayState = replayValidatedRuntimeEventPrefix(
    projectedRunPrefix,
    projectedPrefix,
  );
  const projected = projectPendingInteractionCarrier(
    projectedRunPrefix,
    cCall as unknown as Readonly<Record<string, JsonValue>>,
    result as unknown as Readonly<Record<string, JsonValue>>,
    judgment as unknown as Readonly<Record<string, JsonValue>>,
  );
  if (
    projected === null || projected.requestRef !== requestRef ||
    projected.requestDigest !== requestDigest ||
    sha256Canonical(projected.cCall as unknown as JsonValue) !==
      sha256Canonical(cCall as unknown as JsonValue) ||
    sha256Canonical(projected.result as unknown as JsonValue) !==
      sha256Canonical(result as unknown as JsonValue) ||
    sha256Canonical(projected.judgment as unknown as JsonValue) !==
      sha256Canonical(judgment as unknown as JsonValue)
  ) {
    throw new TypeError(
      "planned pending F_H admission does not project its exact result",
    );
  }
  const body = {
    expectedPrefixDigest: owner.expectedStorePrefixDigest,
    admissionBasisDigest: sha256Canonical(basis as unknown as JsonValue),
    cCallRef: cCall.cCallRef,
    requestRef,
    requestDigest,
    retryAttemptRef,
    pendingValue,
    pendingValueDigest,
    evidenceRef,
    evidenceDigest,
    resultRef,
    resultDigest,
    judgmentReasonRef,
    eventCandidates,
    projectedEvents,
    pending,
    projectedPrefix,
    replayState,
  };
  const planDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "pending_interaction_admission_plan" as const,
    schemaVersion: "5.0.0" as const,
    planRef:
      `pending-interaction-plan://abiogenesis/${planDigest.slice("sha256:".length)}`,
    planDigest,
    ...body,
  });
}

export function admitPlannedPendingInteraction(
  store: AbgEventStore,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  cCall: CCall,
  request: Readonly<Record<string, JsonValue>>,
  expectedInputDigest: Sha256Digest,
  plan: PendingInteractionAdmissionPlan,
  basis: RuntimeAdmissionBasis,
): PendingInteractionAdmission {
  assertRuntimeEventTransactionActive(store);
  if (
    plan.kind !== "pending_interaction_admission_plan" ||
    plan.schemaVersion !== "5.0.0" || plan.cCallRef !== cCall.cCallRef ||
    plan.planDigest !== sha256Canonical(
      pendingInteractionPlanBody(plan) as unknown as JsonValue,
    ) ||
    plan.planRef !==
      `pending-interaction-plan://abiogenesis/${plan.planDigest.slice("sha256:".length)}` ||
    plan.admissionBasisDigest !== sha256Canonical(basis as unknown as JsonValue) ||
    store.digest() !== plan.expectedPrefixDigest
  ) {
    throw new TypeError(
      "planned pending F_H admission differs from its exact owner prefix",
    );
  }
  const rederived = planPendingInteractionAdmission(
    store,
    graph,
    graphFunction,
    cursor,
    cCall,
    request,
    expectedInputDigest,
    basis,
  );
  if (
    sha256Canonical(rederived as unknown as JsonValue) !==
      sha256Canonical(plan as unknown as JsonValue)
  ) {
    throw new TypeError(
      "planned pending F_H admission no longer reprojects exactly",
    );
  }
  if (
    plan.eventCandidates.length !== plan.projectedEvents.length ||
    plan.projectedEvents.at(-1)?.eventId !==
      plan.pending.judgment.admissionEventRef
  ) {
    throw new TypeError(
      "planned pending F_H event closure is incomplete",
    );
  }
  const admittedEvents = plan.eventCandidates.map((candidate) =>
    admitRuntimeEvent(store, candidate)
  );
  if (admittedEvents.some((event, index) =>
    sha256Canonical(event as unknown as JsonValue) !==
      sha256Canonical(plan.projectedEvents[index] as unknown as JsonValue)
  )) {
    throw new TypeError(
      "pending F_H admission differs from its pre-effect plan",
    );
  }
  return plan.pending;
}

export function admitEvidence(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  cCall: CCall,
  candidate: CCallEvidenceCandidate,
  contractRef: string,
  expectedInputDigest: Sha256Digest,
  basis: RuntimeAdmissionBasis,
  expectedInstructionContractRef: string = cCall.inputContractRef,
  expectedResultContractRef: string = cCall.outputContractRef,
  probabilisticResultBasis: ProbabilisticResultEvidenceBasis | null = null,
): CCallEvidenceAdmissionResult {
  const owner = projectCCallOwnerAtPrefix(prefix, cCall);
  const retryOwner = cCall.retryPath.length === 0 || owner === null
    ? null
    : projectDeclaredCRetryCCallWriteAtPrefix(
        owner.prefix,
        owner.authorityPrefix,
        graph,
        graphFunction,
        cursor,
        cCall,
        owner.phase.phase,
      );
  const candidateValue = candidate as unknown as JsonValue;
  const digestPattern = /^sha256:[a-f0-9]{64}$/u;
  const commonValid = candidate.schemaVersion === "5.0.0" &&
    candidate.inputDigest === expectedInputDigest &&
    digestPattern.test(candidate.outputDigest);
  const deterministicValid = candidate.kind === "deterministic_evidence_candidate" &&
    cCall.callClass === "leaf" &&
    cCall.regime === "F_D" &&
    candidate.implementationRef === cCall.implementationRef;
  const revalidatedProbabilisticCarrier =
    candidate.kind === "probabilistic_transport_evidence_candidate" &&
      probabilisticResultBasis !== null
      ? revalidateProbabilisticResultCarrier(
          cCall,
          probabilisticResultBasis.request,
          probabilisticResultBasis.observation,
          probabilisticResultBasis.admittedResultCarrier,
          expectedInstructionContractRef,
          expectedResultContractRef,
        ) ?? revalidateProbabilisticFailurePreimage(
          cCall,
          probabilisticResultBasis.request,
          probabilisticResultBasis.observation,
          expectedInstructionContractRef,
          expectedResultContractRef,
        )
      : null;
  const probabilisticValid = candidate.kind === "probabilistic_transport_evidence_candidate" &&
    cCall.callClass === "leaf" &&
    cCall.regime === "F_P" &&
    candidate.implementationRef === cCall.implementationRef &&
    typeof candidate.actorInvocationRef === "string" && candidate.actorInvocationRef.length > 0 &&
    typeof candidate.actorRef === "string" && candidate.actorRef.length > 0 &&
    typeof candidate.workerBindingRef === "string" && candidate.workerBindingRef.length > 0 &&
    typeof candidate.processRef === "string" && candidate.processRef.length > 0 &&
    typeof candidate.transportBindingRef === "string" && candidate.transportBindingRef.length > 0 &&
    typeof candidate.transportBindingDigest === "string" && digestPattern.test(candidate.transportBindingDigest) &&
    typeof candidate.materializationPlanRef === "string" && candidate.materializationPlanRef.length > 0 &&
    typeof candidate.rendererRef === "string" && candidate.rendererRef.length > 0 &&
    candidate.instructionContractRef === expectedInstructionContractRef &&
    candidate.resultContractRef === expectedResultContractRef &&
    revalidatedProbabilisticCarrier !== null &&
    candidate.candidateRef === revalidatedProbabilisticCarrier.candidateRef &&
    candidate.candidateDigest === revalidatedProbabilisticCarrier.candidateDigest &&
    candidate.requestRef === revalidatedProbabilisticCarrier.requestRef &&
    candidate.requestDigest === revalidatedProbabilisticCarrier.requestDigest &&
    candidate.rawOutputDigest === revalidatedProbabilisticCarrier.rawOutputDigest &&
    typeof candidate.observedOutputDigest === "string" &&
    digestPattern.test(candidate.observedOutputDigest) &&
    typeof candidate.promptDigest === "string" && digestPattern.test(candidate.promptDigest) &&
    typeof candidate.transportDigest === "string" && digestPattern.test(candidate.transportDigest) &&
    isJsonRecord(candidate.artifactDigests as unknown as JsonValue) &&
    candidate.transportDigest === candidate.artifactDigests.transport &&
    Object.values(candidate.artifactDigests).every(
      (digest) => typeof digest === "string" && digestPattern.test(digest),
    ) &&
    (candidate.transportLane === "closed_prompt_proof" || candidate.transportLane === "worker_executes") &&
    (candidate.transportDisposition === "failure" || candidate.transportDisposition === "success") &&
    (candidate.transportDisposition === "success"
      ? candidate.transportFailureClass === null
      : typeof candidate.transportFailureClass === "string" && candidate.transportFailureClass.length > 0) &&
    (candidate.processStatus === null || Number.isSafeInteger(candidate.processStatus)) &&
    (candidate.processSignal === null ||
      (typeof candidate.processSignal === "string" && candidate.processSignal.length > 0)) &&
    typeof candidate.timedOut === "boolean" &&
    typeof candidate.exitObserved === "boolean" &&
    typeof candidate.terminationConfirmed === "boolean" &&
    candidate.exitObserved === candidate.terminationConfirmed &&
    Array.isArray(candidate.signalSequence) &&
    candidate.signalSequence.every((signal) => typeof signal === "string" && signal.length > 0) &&
    Number.isSafeInteger(candidate.structuredEventCount) && candidate.structuredEventCount >= 0 &&
    Number.isSafeInteger(candidate.progressEventCount) && candidate.progressEventCount >= 0 &&
    Number.isSafeInteger(candidate.toolCallCount) && candidate.toolCallCount >= 0 &&
    Number.isSafeInteger(candidate.apiRetryCount) && candidate.apiRetryCount >= 0 &&
    Number.isSafeInteger(candidate.stdoutByteLength) && candidate.stdoutByteLength >= 0 &&
    Number.isSafeInteger(candidate.stderrByteLength) && candidate.stderrByteLength >= 0 &&
    (candidate.transportLane !== "closed_prompt_proof" || candidate.toolCallCount === 0) &&
    hasAdmittedActorEvidence(store, cCall, candidate);
  const foldbackEvent = candidate.kind === "sub_traversal_evidence_candidate"
    ? owner === null
      ? undefined
      : runtimeEventsFromValidatedPrefix(owner.prefix).find(
          (event) => event.eventId === candidate.foldbackEventRef,
        )
    : undefined;
  const subTraversalValid = candidate.kind === "sub_traversal_evidence_candidate" &&
    cCall.callClass === "workflow" &&
    foldbackEvent?.kind === "child_foldback_admitted" &&
    foldbackEvent.runId === cCall.runId &&
    foldbackEvent.frameId === cCall.frameId &&
    isJsonRecord(foldbackEvent.payload) &&
    foldbackEvent.payload.parentCCallRef === cCall.cCallRef &&
    foldbackEvent.payload.foldbackRef === candidate.foldbackRef &&
    foldbackEvent.payload.foldbackDigest === candidate.foldbackDigest &&
    foldbackEvent.payload.outputDigest === candidate.childOutputDigest;
  if (
    owner === null ||
    (cCall.retryPath.length !== 0 && retryOwner === null) ||
    (owner.phase.phase !== "selected_no_evidence" &&
      owner.phase.phase !== "evidencing") ||
    !commonValid ||
    (!deterministicValid && !probabilisticValid && !subTraversalValid) ||
    contractRef !== cCall.evidenceContractRef
  ) {
    return rejection(
      cCall,
      "evidence",
      candidateValue,
      contractRef,
      "diagnostic://abiogenesis/c-call/evidence-contract-mismatch@5",
    );
  }
  const body = candidate.kind === "deterministic_evidence_candidate" ? {
    cCallRef: cCall.cCallRef,
    evidenceClass: "deterministic" as const,
    contractRef,
    implementationRef: candidate.implementationRef,
    inputDigest: candidate.inputDigest,
    outputDigest: candidate.outputDigest,
  } : candidate.kind === "probabilistic_transport_evidence_candidate" ? {
    cCallRef: cCall.cCallRef,
    evidenceClass: "probabilistic_transport" as const,
    contractRef,
    implementationRef: candidate.implementationRef,
    inputDigest: candidate.inputDigest,
    observedOutputDigest: candidate.observedOutputDigest,
    outputDigest: candidate.outputDigest,
    candidateRef: candidate.candidateRef,
    candidateDigest: candidate.candidateDigest,
    requestRef: candidate.requestRef,
    requestDigest: candidate.requestDigest,
    rawOutputDigest: candidate.rawOutputDigest,
    actorInvocationRef: candidate.actorInvocationRef,
    actorRef: candidate.actorRef,
    workerBindingRef: candidate.workerBindingRef,
    processRef: candidate.processRef,
    transportBindingRef: candidate.transportBindingRef,
    transportBindingDigest: candidate.transportBindingDigest,
    materializationPlanRef: candidate.materializationPlanRef,
    rendererRef: candidate.rendererRef,
    instructionContractRef: candidate.instructionContractRef,
    resultContractRef: candidate.resultContractRef,
    promptDigest: candidate.promptDigest,
    transportDigest: candidate.transportDigest,
    transportLane: candidate.transportLane,
    transportDisposition: candidate.transportDisposition,
    transportFailureClass: candidate.transportFailureClass,
    processStatus: candidate.processStatus,
    processSignal: candidate.processSignal,
    timedOut: candidate.timedOut,
    exitObserved: candidate.exitObserved,
    terminationConfirmed: candidate.terminationConfirmed,
    signalSequence: candidate.signalSequence,
    structuredEventCount: candidate.structuredEventCount,
    progressEventCount: candidate.progressEventCount,
    toolCallCount: candidate.toolCallCount,
    apiRetryCount: candidate.apiRetryCount,
    stdoutByteLength: candidate.stdoutByteLength,
    stderrByteLength: candidate.stderrByteLength,
    artifactDigests: candidate.artifactDigests,
  } : {
    cCallRef: cCall.cCallRef,
    evidenceClass: "sub_traversal" as const,
    contractRef,
    implementationRef: null,
    inputDigest: candidate.inputDigest,
    outputDigest: candidate.outputDigest,
    foldbackRef: candidate.foldbackRef,
    foldbackDigest: candidate.foldbackDigest,
    foldbackEventRef: candidate.foldbackEventRef,
    childExecutionBasisRef: candidate.childExecutionBasisRef,
    childExecutionBasisDigest: candidate.childExecutionBasisDigest,
    childGraphCallId: candidate.childGraphCallId,
    childFrameId: candidate.childFrameId,
    childDisposition: candidate.childDisposition,
    childResultRef: candidate.childResultRef,
    childResultDigest: candidate.childResultDigest,
    childOutputDigest: candidate.childOutputDigest,
    childJudgmentRef: candidate.childJudgmentRef,
    childClosureRef: candidate.childClosureRef,
    childReasonRef: candidate.childReasonRef,
    childTerminalEventRef: candidate.childTerminalEventRef,
  };
  const evidenceDigest = sha256Canonical(body as unknown as JsonValue);
  const evidenceRef = `evidence://abiogenesis/${evidenceDigest.slice("sha256:".length)}`;
  const prior = owner.rows.at(-1)!;
  const event = compareAndAppendExpectedPrefix(
    store,
    owner.expectedStorePrefixDigest,
    [() => ({
    kind: "c_call_evidenced",
    eventTime: basis.eventTime,
    aggregateType: "c_call",
    aggregateId: cCall.cCallRef,
    parentAggregateId: cCall.frameId,
    causationEventRefs: [
      prior.eventId,
      ...(candidate.kind === "sub_traversal_evidence_candidate"
        ? [candidate.foldbackEventRef]
        : []),
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { evidenceRef, evidenceDigest, ...body },
    })],
  )[0]!;
  const admitted = deepFreeze({
    kind: "admitted_c_call_evidence" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    evidenceRef,
    evidenceDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as AdmittedCCallEvidence;
  return admitted;
}

export function admitResult(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  cCall: CCall,
  candidate: JsonValue,
  resultClass: "failure" | "success",
  contractRef: string,
  valueKind: string,
  validateValue: (value: unknown) => boolean,
  evidence: readonly AdmittedCCallEvidence[],
  basis: RuntimeAdmissionBasis,
): CCallResultAdmissionResult {
  const owner = projectCCallOwnerAtPrefix(prefix, cCall);
  const retryOwner = cCall.retryPath.length === 0 || owner === null
    ? null
    : projectDeclaredCRetryCCallWriteAtPrefix(
        owner.prefix,
        owner.authorityPrefix,
        graph,
        graphFunction,
        cursor,
        cCall,
        owner.phase.phase,
      );
  const evidenceEvents = (owner?.rows ?? []).filter(
    (event) => event.kind === "c_call_evidenced",
  );
  const valueDigest = sha256Canonical(candidate);
  const expectedContractRef = resultClass === "success"
    ? cCall.outputContractRef
    : cCall.failureContractRef;
  if (
    owner?.phase.phase !== "evidencing" ||
    (cCall.retryPath.length !== 0 && retryOwner === null) ||
    (resultClass !== "success" && resultClass !== "failure") ||
    !isJsonRecord(candidate) ||
    candidate.kind !== valueKind ||
    candidate.schemaVersion !== "5.0.0" ||
    !validateValue(candidate) ||
    contractRef !== expectedContractRef ||
    evidence.length === 0 ||
    evidence.length !== evidenceEvents.length ||
    new Set(evidence.map((row) => row.evidenceRef)).size !== evidence.length ||
    evidence.some(
      (row, index) =>
        !isAdmittedCCallEvidence(row) ||
        row.cCallRef !== cCall.cCallRef ||
        row.outputDigest !== valueDigest ||
        evidenceEvents[index]?.eventId !== row.admissionEventRef,
    )
  ) {
    return rejection(
      cCall,
      "result",
      candidate,
      contractRef,
      "diagnostic://abiogenesis/c-call/result-contract-mismatch@5",
    );
  }
  const immutableValue = deepFreeze(JSON.parse(canonicalJson(candidate)) as JsonValue);
  const body = {
    cCallRef: cCall.cCallRef,
    resultClass,
    contractRef,
    valueKind,
    valueDigest,
    value: immutableValue,
    evidenceRefs: evidence.map((row) => row.evidenceRef),
  };
  const resultDigest = sha256Canonical(body as unknown as JsonValue);
  const resultRef = `result://abiogenesis/${resultDigest.slice("sha256:".length)}`;
  const prior = owner.rows.at(-1)!;
  const event = compareAndAppendExpectedPrefix(
    store,
    owner.expectedStorePrefixDigest,
    [() => ({
    kind: "c_call_result_admitted",
    eventTime: basis.eventTime,
    aggregateType: "c_call",
    aggregateId: cCall.cCallRef,
    parentAggregateId: cCall.frameId,
    causationEventRefs: [prior.eventId, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { resultRef, resultDigest, ...body },
    })],
  )[0]!;
  const admitted = deepFreeze({
    kind: "admitted_c_call_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    resultRef,
    resultDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as AdmittedCCallResult;
  return admitted;
}

export function admitJudgment(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  cCall: CCall,
  result: AdmittedCCallResult,
  candidate: JudgmentCandidate,
  replayState: ReplayState,
  basis: RuntimeAdmissionBasis,
): CCallJudgmentAdmissionResult {
  const owner = projectCCallOwnerAtPrefix(prefix, cCall);
  const retryOwner = cCall.retryPath.length === 0 || owner === null
    ? null
    : projectDeclaredCRetryCCallWriteAtPrefix(
        owner.prefix,
        owner.authorityPrefix,
        graph,
        graphFunction,
        cursor,
        cCall,
        owner.phase.phase,
      );
  const activeRetryAttemptRef = retryOwner?.active.attempt.attemptRef ?? null;
  const candidateBody = {
    cCallRef: candidate.cCallRef,
    resultRef: candidate.resultRef,
    resultDigest: candidate.resultDigest,
    judgment: candidate.judgment,
    reasonRef: candidate.reasonRef,
    contractRef: candidate.contractRef,
    predicateRef: candidate.predicateRef,
    replayStateDigest: candidate.replayStateDigest,
  };
  const candidateValue = candidateBody as unknown as JsonValue;
  const currentReplay = replayValidatedRuntimeEventPrefix(
    owner?.prefix ?? prefix,
    prefix,
  );
  const currentCCall = currentReplay.cCalls.find(
    (row) => row.cCallRef === cCall.cCallRef,
  );
  if (
    owner?.phase.phase !== "result_admitted" ||
    projectAdmittedCCallResultAtPrefix(owner.prefix, cCall, result) === null ||
    currentCCall?.status !== "result_admitted" ||
    candidate.candidateDigest !== sha256Canonical(candidateValue) ||
    candidate.candidateRef !==
      `judgment-candidate://abiogenesis/${candidate.candidateDigest.slice("sha256:".length)}` ||
    candidate.cCallRef !== cCall.cCallRef ||
    candidate.resultRef !== result.resultRef ||
    candidate.resultDigest !== result.resultDigest ||
    candidate.contractRef !== cCall.judgmentContractRef ||
    candidate.predicateRef !== cCall.judgmentPredicateRef ||
    candidate.replayStateDigest !== replayState.replayDigest ||
    currentReplay.replayDigest !== replayState.replayDigest ||
    (cCall.retryPath.length !== 0 && activeRetryAttemptRef === null)
  ) {
    return rejection(
      cCall,
      "judgment",
      candidateValue,
      candidate.contractRef,
      "diagnostic://abiogenesis/c-call/judgment-contract-mismatch@5",
    );
  }
  const judgmentBody = {
    ...candidateBody,
    retryAttemptRef: activeRetryAttemptRef,
  };
  const judgmentDigest = sha256Canonical(judgmentBody as unknown as JsonValue);
  const judgmentRef = `judgment://abiogenesis/${judgmentDigest.slice("sha256:".length)}`;
  const event = compareAndAppendExpectedPrefix(
    store,
    owner.expectedStorePrefixDigest,
    [() => ({
    kind: "c_call_judged",
    eventTime: basis.eventTime,
    aggregateType: "c_call",
    aggregateId: cCall.cCallRef,
    parentAggregateId: cCall.frameId,
    causationEventRefs: [result.admissionEventRef, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: { judgmentRef, judgmentDigest, ...judgmentBody },
    })],
  )[0]!;
  const admitted = deepFreeze({
    kind: "admitted_c_call_judgment" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    judgmentRef,
    judgmentDigest,
    ...judgmentBody,
    admissionEventRef: event.eventId,
  }) as AdmittedCCallJudgment;
  return admitted;
}

export function completeRejectedCCall(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  cursor: TraversalCursorCandidate,
  cCall: CCall,
  admissionRejection: CCallAdmissionRejection,
  basis: RuntimeAdmissionBasis,
): RejectedCCallCompletion {
  const owner = projectCCallOwnerAtPrefix(prefix, cCall);
  const retryOwner = cCall.retryPath.length === 0 || owner === null
    ? null
    : projectDeclaredCRetryCCallWriteAtPrefix(
        owner.prefix,
        owner.authorityPrefix,
        graph,
        graphFunction,
        cursor,
        cCall,
        owner.phase.phase,
      );
  const activeRetryAttemptRef = retryOwner?.active.attempt.attemptRef ?? null;
  if (
    owner === null || owner.phase.phase === "judged" ||
    !isAdmissionRejection(admissionRejection) ||
    (cCall.retryPath.length !== 0 && activeRetryAttemptRef === null) ||
    admissionRejection.cCallRef !== cCall.cCallRef
  ) {
    throw new TypeError("completeRejectedCCall requires one authentic open-call admission rejection");
  }
  const rows = owner.rows;
  const existingResultEvent = rows.find((event) => event.kind === "c_call_result_admitted");
  if (
    (admissionRejection.stage === "judgment" && existingResultEvent === undefined) ||
    (admissionRejection.stage !== "judgment" && existingResultEvent !== undefined) ||
    (admissionRejection.stage === "judgment" &&
      owner.phase.phase !== "result_admitted") ||
    (admissionRejection.stage !== "judgment" &&
      owner.phase.phase !== "selected_no_evidence" &&
      owner.phase.phase !== "evidencing")
  ) {
    throw new TypeError("CCall rejection stage does not match the admitted spine state");
  }

  const admit = () => {

  let rejectionEvidenceRef: string | null = null;
  let evidenceEventRef: string | null = null;
  let resultRef: string;
  let resultDigest: Sha256Digest;
  let resultEventRef: string;

  if (admissionRejection.stage === "judgment") {
    const payload = existingResultEvent!.payload;
    if (!isJsonRecord(payload)) {
      throw new TypeError("existing admitted result payload is not replayable");
    }
    const payloadResultRef = payload.resultRef;
    const payloadResultDigest = payload.resultDigest;
    if (typeof payloadResultRef !== "string" || typeof payloadResultDigest !== "string") {
      throw new TypeError("existing admitted result lacks result identity");
    }
    resultRef = payloadResultRef;
    resultDigest = payloadResultDigest as Sha256Digest;
    resultEventRef = existingResultEvent!.eventId;
  } else {
    const rejectionEvidenceBody = {
      cCallRef: cCall.cCallRef,
      evidenceClass: "admission_rejection" as const,
      contractRef: cCall.evidenceContractRef,
      rejectedStage: admissionRejection.stage,
      candidateDigest: admissionRejection.candidateDigest,
      rejectedContractRef: admissionRejection.contractRef,
      diagnosticRef: admissionRejection.diagnosticRef,
    };
    const rejectionEvidenceDigest = sha256Canonical(
      rejectionEvidenceBody as unknown as JsonValue,
    );
    rejectionEvidenceRef =
      `evidence://abiogenesis/${rejectionEvidenceDigest.slice("sha256:".length)}`;
    const evidenceEvent = admitRuntimeEvent(store, {
      kind: "c_call_evidenced",
      eventTime: basis.eventTime,
      aggregateType: "c_call",
      aggregateId: cCall.cCallRef,
      parentAggregateId: cCall.frameId,
      causationEventRefs: [rows.at(-1)!.eventId, ...basis.causationEventRefs],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId: cCall.runId,
      graphFunctionRef: cCall.graphFunctionRef,
      graphCallId: cCall.graphCallId,
      frameId: cCall.frameId,
      payload: {
        evidenceRef: rejectionEvidenceRef,
        evidenceDigest: rejectionEvidenceDigest,
        ...rejectionEvidenceBody,
      },
    });
    evidenceEventRef = evidenceEvent.eventId;

    const refusalValue = deepFreeze({
      kind: cCall.refusalValueKind,
      schemaVersion: "5.0.0" as const,
      rejectedStage: admissionRejection.stage,
      candidateDigest: admissionRejection.candidateDigest,
      diagnosticRef: admissionRejection.diagnosticRef,
    }) as JsonValue;
    const valueDigest = sha256Canonical(refusalValue);
    const refusalResultBody = {
      cCallRef: cCall.cCallRef,
      resultClass: "refusal" as const,
      contractRef: cCall.refusalContractRef,
      valueKind: cCall.refusalValueKind,
      valueDigest,
      value: refusalValue,
      evidenceRefs: [
        ...rows.flatMap((event) =>
          event.kind === "c_call_evidenced" && isJsonRecord(event.payload) &&
            typeof event.payload.evidenceRef === "string"
            ? [event.payload.evidenceRef]
            : []
        ),
        rejectionEvidenceRef,
      ],
    };
    resultDigest = sha256Canonical(refusalResultBody as unknown as JsonValue);
    resultRef = `result://abiogenesis/${resultDigest.slice("sha256:".length)}`;
    const resultEvent = admitRuntimeEvent(store, {
      kind: "c_call_result_admitted",
      eventTime: basis.eventTime,
      aggregateType: "c_call",
      aggregateId: cCall.cCallRef,
      parentAggregateId: cCall.frameId,
      causationEventRefs: [evidenceEvent.eventId],
      correlationId: basis.correlationId,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId: cCall.runId,
      graphFunctionRef: cCall.graphFunctionRef,
      graphCallId: cCall.graphCallId,
      frameId: cCall.frameId,
      payload: { resultRef, resultDigest, ...refusalResultBody },
    });
    resultEventRef = resultEvent.eventId;
  }

  const rejectionReplay = replay(store, { runId: cCall.runId });
  const retryAttemptRef = activeRetryAttemptRef;
  const rejectionJudgmentBody = {
    cCallRef: cCall.cCallRef,
    resultRef,
    resultDigest,
    judgment: "blocked" as const,
    reasonRef: admissionRejection.diagnosticRef,
    contractRef: cCall.rejectionContractRef,
    predicateRef: cCall.judgmentPredicateRef,
    replayStateDigest: rejectionReplay.replayDigest,
    retryAttemptRef,
  };
  const rejectionJudgmentDigest = sha256Canonical(
    rejectionJudgmentBody as unknown as JsonValue,
  );
  const rejectionJudgmentRef =
    `judgment://abiogenesis/${rejectionJudgmentDigest.slice("sha256:".length)}`;
  const judgmentEvent = admitRuntimeEvent(store, {
    kind: "c_call_judged",
    eventTime: basis.eventTime,
    aggregateType: "c_call",
    aggregateId: cCall.cCallRef,
    parentAggregateId: cCall.frameId,
    causationEventRefs: [resultEventRef],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: cCall.basisId,
    runId: cCall.runId,
    graphFunctionRef: cCall.graphFunctionRef,
    graphCallId: cCall.graphCallId,
    frameId: cCall.frameId,
    payload: {
      judgmentRef: rejectionJudgmentRef,
      judgmentDigest: rejectionJudgmentDigest,
      ...rejectionJudgmentBody,
    },
  });
  return deepFreeze({
    kind: "rejected_c_call_completion" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "blocked" as const,
    cCallRef: cCall.cCallRef,
    rejectionEvidenceRef,
    refusalResultRef: resultRef,
    rejectionJudgmentRef,
    evidenceEventRef,
    resultEventRef,
    judgmentEventRef: judgmentEvent.eventId,
  }) as RejectedCCallCompletion;
  };
  return isRuntimeEventTransactionActive(store)
    ? admit()
    : admitRuntimeEventTransactionAtExpectedPrefix(
        store,
        owner.expectedStorePrefixDigest,
        admit,
      ).value;
}
