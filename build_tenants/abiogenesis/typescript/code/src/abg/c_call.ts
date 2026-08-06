import type { GraphFunction, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import { isExecutableCLeaf, isInteractionCLeaf } from "../gtl/c_algebra.js";
import {
  resolveCProgramLocus,
  resolveCProgramTermAtSourcePath,
  resolveEnclosingCBatchRef,
} from "../gtl/source_path.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasAdmittedExecutionBasis,
  hasAdmittedImplementationSet,
  hasAdmittedInteractionSet,
  rehydrateAdmittedImplementationSet,
  rehydrateExecutionBasis,
  selectAdmittedImplementationResolution,
  type AdmittedInteractionContractRow,
  type AdmittedInteractionSet,
  type AdmittedImplementationResolutionRow,
  type AdmittedImplementationSet,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventBatch,
  type RuntimeEvent,
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
import { replay, type ReplayState } from "./replay.js";
import {
  hasOpenedTraversalScope,
  type OpenedTraversalScope,
} from "./open_call.js";
import {
  hasAdmittedTraversalCursor,
  traversalCursorAdmissionEventRef,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";
import {
  isActorProcessObservation,
  projectActorProcessLifecycle,
  type ActorProcessObservation,
} from "./actor_process.js";
import {
  selectExactRetryAttemptEvent,
} from "./retry_lifecycle.js";
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
}

export interface CCallLocusProposal {
  readonly kind: "traversal_stop_ref";
  readonly disposition: "at_compute_locus";
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
  readonly computeRegime: "F_D" | "F_H" | "F_P";
  readonly armId: string;
  readonly compositionRef: string | null;
  readonly implementationBindingRef: string;
  readonly inputContractRef: string;
  readonly outputContractRef: string;
  readonly evidenceContractRef: string;
  readonly failureContractRef: string;
  readonly refusalContractRef: string;
  readonly judgmentContractRef: string;
}

export interface InteractionCCallLocusProposal {
  readonly kind: "traversal_stop_ref";
  readonly disposition: "at_compute_locus";
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
  readonly computeRegime: "F_H";
  readonly armId: string;
  readonly compositionRef: string | null;
  readonly interactionKind: string;
  readonly actorCapabilityRef: string;
  readonly requestContractRef: string;
  readonly responseContractRef: string;
  readonly continuationContractRef: string;
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
  readonly requestRef?: string;
  readonly requestDigest?: Sha256Digest;
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
  readonly resultClass: "failure" | "pending" | "success";
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
  readonly cCallRef: string;
  readonly sourceRef: string;
  readonly sourceEventRef: string | null;
  readonly failureValueKind: string;
  readonly failureCandidateDigest: Sha256Digest;
  readonly signal: CCallRuntimeFailureSignal;
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
    | "opened"
    | "fibre_selected"
    | "evidenced"
    | "result_admitted"
    | "judged"
    | "rejected";
  readonly openedEventRef: string;
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
  if (
    opened.length !== 1 || fibre.length > 1 || results.length > 1 ||
    judgments.length > 1 || rejections.length > 1 ||
    ((evidence.length > 0 || results.length > 0 || judgments.length > 0) &&
      fibre.length !== 1) ||
    (judgments.length === 1 && results.length !== 1) ||
    (rejections.length === 1 && (results.length !== 0 || judgments.length !== 0)) ||
    (fibre.length === 1 &&
      fibre[0]!.admissionOrdinal <= opened[0]!.admissionOrdinal) ||
    rows.some((row, index) => index > 0 &&
      row.admissionOrdinal <= rows[index - 1]!.admissionOrdinal)
  ) {
    throw new TypeError(`CCall ${cCallRef} has invalid exact phase cardinality`);
  }
  const phase = rejections.length === 1
    ? "rejected" as const
    : judgments.length === 1
      ? "judged" as const
      : results.length === 1
        ? "result_admitted" as const
        : evidence.length > 0
          ? "evidenced" as const
          : fibre.length === 1
            ? "fibre_selected" as const
            : "opened" as const;
  return deepFreeze({
    kind: "c_call_phase_projection" as const,
    cCallRef,
    phase,
    openedEventRef: opened[0]!.eventId,
    fibreEventRef: fibre[0]?.eventId ?? null,
    evidenceEventRefs: Object.freeze(evidence.map((event) => event.eventId)),
    resultEventRef: results[0]?.eventId ?? null,
    judgmentEventRef: judgments[0]?.eventId ?? null,
    rejectionEventRef: rejections[0]?.eventId ?? null,
  });
}

const cCalls = new WeakSet<object>();
const admittedEvidence = new WeakSet<object>();
const admittedResults = new WeakSet<object>();
const admittedJudgments = new WeakSet<object>();
const admissionRejections = new WeakSet<object>();
const derivedProbabilisticEvidence = new WeakSet<object>();
const admittedChildFoldbacks = new WeakSet<object>();
const derivedSubTraversalEvidence = new WeakSet<object>();

function isJsonRecord(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCCall(value: object): boolean {
  return cCalls.has(value);
}

export function isAdmittedCCallResult(value: object): boolean {
  return admittedResults.has(value);
}

export function isAdmittedCCallJudgment(value: object): boolean {
  return admittedJudgments.has(value);
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
  admissionRejections.add(value);
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

function eventsFor(store: AbgEventStore, cCallRef: string) {
  return store.readAll().filter(
    (event) =>
      event.aggregateType === "c_call" &&
      event.aggregateId === cCallRef,
  );
}

function exactRetryAttemptRef(
  store: AbgEventStore,
  cCall: CCall,
): string | null {
  if (cCall.retryPath.length === 0) return null;
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: cCall.runId,
  });
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const projection = deriveRuntimeEventCalculusProjection(prefix);
  const match = selectExactRetryAttemptEvent(events, cCall, projection);
  if (match === null || !isJsonRecord(match.payload) ||
    typeof match.payload.attemptRef !== "string") return null;
  const attemptRef = match.payload.attemptRef;
  return holdsAt(projection, constructRuntimeFluent({
      name: "retry_attempt_active",
      identity: attemptRef,
    }))
    ? attemptRef
    : null;
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
    artifact.payload.materializationPlanRef === source.materializationPlanRef &&
    artifact.payload.rendererRef === source.rendererRef &&
    artifact.payload.instructionContractRef === source.instructionContractRef &&
    artifact.payload.resultContractRef === source.resultContractRef &&
    artifact.payload.processRef === source.processRef &&
    artifact.payload.transportBindingRef === source.transportBindingRef &&
    artifact.payload.transportBindingDigest === source.transportBindingDigest &&
    artifact.payload.observedOutputDigest === source.observedOutputDigest &&
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
  if (!derivedProbabilisticEvidence.has(candidate)) return false;
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

function projectOpenedExecutableLeafCCallCarrier(
  store: AbgEventStore,
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
    !Array.isArray(opened.payload.retryPath) ||
    !opened.payload.retryPath.every((value) =>
      Number.isSafeInteger(value) && Number(value) > 0
    ) ||
    opened.payload.retryPath.length === 0 ||
    !Number.isSafeInteger(opened.payload.attempt) ||
    Number(opened.payload.attempt) <= 0 ||
    opened.payload.attempt !== opened.payload.retryPath.at(-1) ||
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
    !isExecutableCLeaf(locus.leaf)
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
  const basis = rehydrateExecutionBasis(store, opened.basisId);
  if (
    basis === null || basis.graphRef !== graph.materializationRef ||
    basis.graphDigest !== graph.materializationDigest ||
    basis.graphFunctionRef !== graph.graphFunctionRef ||
    basis.graphFunctionDigest !== graph.graphFunctionDigest
  ) return null;
  const implementationSet = rehydrateAdmittedImplementationSet(
    store,
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
  if (
    cursorCause === undefined || opened.parentAggregateId !== opened.frameId ||
    !exactEventBody(opened, "c_call_opened", locusBody) ||
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

/**
 * Reconstructs the exact opened executable CCall used by the retry close and
 * blocked-route relations from one complete validated store prefix.
 */
export function projectOpenedCCallCarrier(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  cCallRef: string,
): CCall | null {
  const prefixEvents = runtimeEventsFromValidatedPrefix(prefix);
  if (
    store.readAll().length !== prefixEvents.length ||
    store.digest() !==
      sha256Canonical(prefixEvents as unknown as JsonValue)
  ) return null;
  return projectOpenedExecutableLeafCCallCarrier(
    store,
    prefix,
    graph,
    cCallRef,
  );
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
  cCall: CCall,
  source: CCallRuntimeFailureSource,
  failureCandidate: JsonValue,
  failureValueKind: string,
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
    cCall.retryPath.length === 0 || phase.phase !== "evidenced" ||
    failureValueKind.length === 0 || exactRetryAttemptRef(store, cCall) === null
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
  const body = {
    expectedPrefixDigest,
    cCallRef: cCall.cCallRef,
    sourceRef: resolved.sourceRef,
    sourceEventRef: resolved.sourceEventRef,
    failureValueKind,
    failureCandidateDigest,
    signal: resolved.signal,
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
    (disposition !== "blocked" && disposition !== "retry")
  ) throw runtimeFailureCloseError("plan identity or expected prefix differs");
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll());
  const rederived = planCCallRuntimeFailureClose(
    store,
    prefix,
    graph,
    cCall,
    source,
    failureCandidate,
    plan.failureValueKind,
  );
  if (
    rederived.kind !== "c_call_runtime_failure_close_plan" ||
    sha256Canonical(rederived as unknown as JsonValue) !==
      sha256Canonical(plan as unknown as JsonValue)
  ) throw runtimeFailureCloseError("source or plan no longer reprojects exactly");
  const activeRetryAttemptRef = exactRetryAttemptRef(store, cCall);
  if (activeRetryAttemptRef === null) {
    throw runtimeFailureCloseError("active retry attempt is absent");
  }
  const sourceProjection = exactRuntimeFailureSource(prefix, cCall, source);
  if (
    sourceProjection === null ||
    sourceProjection.sourceRef !== plan.sourceRef ||
    sourceProjection.sourceEventRef !== plan.sourceEventRef ||
    sha256Canonical(sourceProjection.signal as unknown as JsonValue) !==
      sha256Canonical(plan.signal as unknown as JsonValue)
  ) throw runtimeFailureCloseError("exact source refs or signal differ");

  let sourceEventRef = sourceProjection.sourceEventRef;
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
    const rows = eventsFor(store, cCall.cCallRef);
    const evidenceEvent = admitRuntimeEvent(store, {
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
    });
    sourceEventRef = evidenceEvent.eventId;
  }
  if (sourceEventRef === null) {
    throw runtimeFailureCloseError("runtime failure source event is absent");
  }
  const evidenceRefs = eventsFor(store, cCall.cCallRef).flatMap((event) =>
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
        failureClass: plan.signal.failureClass,
        failureSignalRef: plan.signal.failureSignalRef,
        failureSourceRef: plan.sourceRef,
        failureCandidateDigest: plan.failureCandidateDigest,
      }) as JsonValue
    : deepFreeze({
        kind: plan.failureValueKind,
        schemaVersion: "5.0.0" as const,
        failureClass: plan.signal.failureClass,
        diagnosticRef: source.diagnosticRef,
        failureSignalRef: plan.signal.failureSignalRef,
        failureSourceRef: plan.sourceRef,
        failureCandidateDigest: plan.failureCandidateDigest,
        rejectedStage: source.stage,
      }) as JsonValue;
  const valueDigest = sha256Canonical(failureValue);
  const resultBody = {
    cCallRef: cCall.cCallRef,
    resultClass: "failure" as const,
    contractRef: cCall.failureContractRef,
    valueKind: plan.failureValueKind,
    valueDigest,
    value: failureValue,
    evidenceRefs,
  };
  const resultDigest = sha256Canonical(resultBody as unknown as JsonValue);
  const resultRef =
    `result://abiogenesis/${resultDigest.slice("sha256:".length)}`;
  const resultEvent = admitRuntimeEvent(store, {
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
  admittedResults.add(result);

  const replayState = replay(store, { runId: cCall.runId });
  const judgmentBody = {
    cCallRef: cCall.cCallRef,
    resultRef,
    resultDigest,
    judgment: disposition,
    reasonRef: plan.signal.failureSignalRef,
    contractRef: cCall.judgmentContractRef,
    predicateRef: cCall.judgmentPredicateRef,
    replayStateDigest: replayState.replayDigest,
    retryAttemptRef: activeRetryAttemptRef,
  };
  const judgmentDigest = sha256Canonical(judgmentBody as unknown as JsonValue);
  const judgmentRef =
    `judgment://abiogenesis/${judgmentDigest.slice("sha256:".length)}`;
  const judgmentEvent = admitRuntimeEvent(store, {
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
  admittedJudgments.add(judgment);
  return deepFreeze({
    kind: "admitted_c_call_runtime_failure_close" as const,
    schemaVersion: "5.0.0" as const,
    disposition,
    cCallRef: cCall.cCallRef,
    signal: plan.signal,
    result,
    judgment,
  });
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

export function deriveProbabilisticTransportEvidence(
  cCall: CCall,
  observation: ActorProcessObservation,
  resultCandidate: JsonValue,
  expectedInstructionContractRef: string,
): ProbabilisticTransportEvidenceCandidate {
  if (
    !isActorProcessObservation(observation) ||
    cCall.callClass !== "leaf" ||
    cCall.implementationRef === null ||
    observation.implementationRef !== cCall.implementationRef ||
    observation.inputDigest.length === 0 ||
    expectedInstructionContractRef.length === 0 ||
    observation.instructionContractRef !== expectedInstructionContractRef ||
    observation.resultContractRef !== cCall.outputContractRef
  ) {
    throw new TypeError("probabilistic evidence requires one authentic ABG actor observation");
  }
  const candidate = deepFreeze({
    kind: "probabilistic_transport_evidence_candidate" as const,
    schemaVersion: "5.0.0" as const,
    implementationRef: observation.implementationRef,
    inputDigest: observation.inputDigest,
    observedOutputDigest: observation.observedOutputDigest,
    outputDigest: sha256Canonical(resultCandidate),
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
  derivedProbabilisticEvidence.add(candidate);
  return candidate;
}

export function admitChildPreparationRefusal(
  store: AbgEventStore,
  parentCCall: CCall,
  candidate: ChildPreparationRefusalCandidate,
  basis: RuntimeAdmissionBasis,
): ChildPreparationRefusalAdmission | ChildPreparationRefusalRefusal {
  if (
    !isCCall(parentCCall) ||
    parentCCall.callClass !== "workflow" ||
    !hasOpenedCCall(store, parentCCall) ||
    eventsFor(store, parentCCall.cCallRef).some(
      (event) => event.kind === "c_call_result_admitted" || event.kind === "c_call_judged",
    )
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
  const event = admitRuntimeEvent(store, {
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
    admissionEventRef: event.eventId,
  }) as ChildPreparationRefusalAdmission;
}

export function admitChildFoldback(
  store: AbgEventStore,
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
  if (
    !isCCall(parentCCall) ||
    parentCCall.callClass !== "workflow" ||
    !hasOpenedCCall(store, parentCCall) ||
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
    !hasAdmittedExecutionBasis(store, childExecutionBasis) ||
    childExecutionBasis.basisClass !== "child" ||
    !hasOpenedTraversalScope(store, childScope) ||
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
  const events = store.readAll();
  const resultEvent = events.find(
    (event) => event.kind === "c_call_result_admitted" &&
      event.runId === childScope.runId &&
      event.frameId === childScope.frameId &&
      isJsonRecord(event.payload) &&
      event.payload.resultRef === input.childResultRef,
  );
  const judgmentEvent = events.find(
    (event) => event.kind === "c_call_judged" &&
      event.runId === childScope.runId &&
      event.frameId === childScope.frameId &&
      isJsonRecord(event.payload) &&
      event.payload.judgmentRef === input.childJudgmentRef &&
      event.payload.resultRef === input.childResultRef,
  );
  const routeEvent = events.slice().reverse().find(
    (event) => event.kind === "traversal_route_admitted" &&
      event.runId === childScope.runId &&
      event.frameId === childScope.frameId &&
      isJsonRecord(event.payload) &&
      event.payload.judgmentRef === input.childJudgmentRef &&
      (
        event.payload.routeKind === "terminal" ||
        event.payload.routeKind === "blocked" ||
        event.payload.routeKind === "failed"
      ),
  );
  const routePayload = routeEvent !== undefined && isJsonRecord(routeEvent.payload)
    ? routeEvent.payload
    : null;
  const routeKind = routePayload?.routeKind;
  const terminalReachedEvent = routeKind === "terminal"
    ? events.find(
        (event) =>
          event.kind === "terminal_reached" &&
          event.runId === childScope.runId &&
          event.frameId === childScope.frameId &&
          event.causationEventRefs.includes(routeEvent!.eventId) &&
          isJsonRecord(event.payload) &&
          event.payload.closureRef === input.childClosureRef,
      )
    : undefined;
  const frameClosedEvent = terminalReachedEvent === undefined
    ? undefined
    : events.find(
        (event) =>
          event.kind === "frame_closed" &&
          event.runId === childScope.runId &&
          event.frameId === childScope.frameId &&
          event.causationEventRefs.includes(terminalReachedEvent.eventId),
      );
  const graphCallClosedEvent = frameClosedEvent === undefined
    ? undefined
    : events.find(
        (event) =>
          event.kind === "graph_call_closed" &&
          event.runId === childScope.runId &&
          event.graphCallId === childScope.graphCallId &&
          event.causationEventRefs.includes(frameClosedEvent.eventId),
      );
  if (
    resultEvent === undefined ||
    judgmentEvent === undefined ||
    routeEvent === undefined ||
    !judgmentEvent.causationEventRefs.includes(resultEvent.eventId) ||
    !routeEvent.causationEventRefs.includes(judgmentEvent.eventId)
  ) {
    return {
      kind: "child_foldback_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "child_truth_mismatch",
      message: "child foldback references incomplete or non-causal child result truth",
    };
  }
  const resultPayload = isJsonRecord(resultEvent.payload) ? resultEvent.payload : null;
  const judgmentPayload = isJsonRecord(judgmentEvent.payload)
    ? judgmentEvent.payload
    : null;
  const resultDigest = resultPayload?.resultDigest;
  const outputDigest = resultPayload?.valueDigest;
  const childReasonRef = typeof judgmentPayload?.reasonRef === "string"
    ? judgmentPayload.reasonRef
    : null;
  const childLifecycleEvent = routeKind === "terminal"
    ? graphCallClosedEvent
    : routeEvent;
  if (
    typeof resultDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(resultDigest) ||
    typeof outputDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(outputDigest) ||
    (
      routeKind !== "terminal" &&
      routeKind !== "blocked" &&
      routeKind !== "failed"
    ) ||
    childLifecycleEvent === undefined ||
    (routeKind === "terminal" &&
      (
        input.childClosureRef === null ||
        terminalReachedEvent === undefined ||
        frameClosedEvent === undefined ||
        graphCallClosedEvent === undefined
      )) ||
    ((routeKind === "blocked" || routeKind === "failed") &&
      (input.childClosureRef !== null || childReasonRef === null))
  ) {
    return {
      kind: "child_foldback_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "child_truth_mismatch",
      message: "child foldback result or route payload is incomplete",
    };
  }
  const childDisposition = routeKind === "terminal"
    ? "closed" as const
    : routeKind === "failed"
      ? "failed" as const
      : "blocked" as const;
  const body = {
    parentCCallRef: parentCCall.cCallRef,
    childExecutionBasisRef: childExecutionBasis.basisRef,
    childExecutionBasisDigest: childExecutionBasis.basisDigest,
    childGraphCallId: childScope.graphCallId,
    childFrameId: childScope.frameId,
    childDisposition,
    childResultRef: input.childResultRef,
    childResultDigest: resultDigest as Sha256Digest,
    childJudgmentRef: input.childJudgmentRef,
    childClosureRef: input.childClosureRef,
    childReasonRef,
    childTerminalEventRef: childLifecycleEvent.eventId,
    outputDigest: outputDigest as Sha256Digest,
  };
  const foldbackDigest = sha256Canonical(body as unknown as JsonValue);
  const foldbackRef =
    `child-foldback://abiogenesis/${foldbackDigest.slice("sha256:".length)}`;
  const event = admitRuntimeEvent(store, {
    kind: "child_foldback_admitted",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: parentCCall.frameId,
    parentAggregateId: parentCCall.graphCallId,
    causationEventRefs: [
      childLifecycleEvent.eventId,
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
  });
  const admitted = deepFreeze({
    kind: "child_foldback_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    foldbackRef,
    foldbackDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as ChildFoldbackAdmission;
  admittedChildFoldbacks.add(admitted);
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
    !admittedChildFoldbacks.has(foldback) ||
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
  derivedSubTraversalEvidence.add(candidate);
  return candidate;
}

export function hasOpenedCCall(store: AbgEventStore, cCall: CCall): boolean {
  if (!isCCall(cCall)) return false;
  const events = eventsFor(store, cCall.cCallRef);
  return (
    events[0]?.kind === "c_call_opened" &&
    events[0].eventId === cCall.openedEventRef &&
    events[1]?.kind === "c_call_fibre_selected" &&
    events[1].eventId === cCall.fibreSelectedEventRef &&
    events[1].causationEventRefs.includes(cCall.openedEventRef)
  );
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
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    !hasAdmittedImplementationSet(store, implementationSet) ||
    !hasOpenedTraversalScope(store, scope) ||
    !hasAdmittedTraversalCursor(store, sourceCursor) ||
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
  const events = eventsFor(store, cCallRef);
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
    implementationSetRef: executionBasis.rootImplementationSetRef,
    implementationRequirementKey: null,
    implementationBindingRef: null,
    implementationRef: null,
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
  const cursorEventRef = traversalCursorAdmissionEventRef(store, sourceCursor);
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
  cCalls.add(expected);
  return hasOpenedCCall(store, expected) ? expected : null;
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

/**
 * Validates a result carrier against the current event-authoritative CCall
 * projection. Object provenance is deliberately irrelevant.
 */
export function hasCurrentAdmittedCCallResult(
  store: AbgEventStore,
  cCall: CCall,
  result: AdmittedCCallResult,
): boolean {
  if (!hasOpenedCCall(store, cCall)) return false;
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: cCall.runId,
  });
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const projected = replay(store, { runId: cCall.runId }).cCalls.find(
    (candidate) => candidate.cCallRef === cCall.cCallRef,
  );
  const resultBody = admittedResultBody(result);
  const resultEvent = events.find(
    (event) => event.eventId === result.admissionEventRef,
  );
  return (projected?.status === "result_admitted" || projected?.status === "judged") &&
    projected.resultRef === result.resultRef &&
    projected.resultDigest === result.resultDigest &&
    projected.resultClass === result.resultClass &&
    projected.resultContractRef === result.contractRef &&
    projected.resultValueKind === result.valueKind &&
    sha256Canonical(projected.resultValue) === result.valueDigest &&
    result.kind === "admitted_c_call_result" &&
    result.schemaVersion === "5.0.0" &&
    result.disposition === "admitted" &&
    result.cCallRef === cCall.cCallRef &&
    result.resultDigest === sha256Canonical(resultBody as unknown as JsonValue) &&
    result.resultRef ===
      `result://abiogenesis/${result.resultDigest.slice("sha256:".length)}` &&
    result.valueDigest === sha256Canonical(result.value) &&
    exactEventBody(resultEvent, "c_call_result_admitted", {
      resultRef: result.resultRef,
      resultDigest: result.resultDigest,
      ...resultBody,
    });
}

/**
 * Joins an exact result/judgment carrier pair to the validated immutable Run
 * prefix and its typed replay projection.
 */
export function hasCurrentAdmittedCCallOutcome(
  store: AbgEventStore,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
): boolean {
  if (!hasCurrentAdmittedCCallResult(store, cCall, result)) return false;
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: cCall.runId,
  });
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const projected = replay(store, { runId: cCall.runId }).cCalls.find(
    (candidate) => candidate.cCallRef === cCall.cCallRef,
  );
  const judgmentBody = admittedJudgmentBody(judgment);
  const judgmentEvent = events.find(
    (event) => event.eventId === judgment.admissionEventRef,
  );
  return projected?.status === "judged" &&
    projected.judgmentRef === judgment.judgmentRef &&
    projected.judgment === judgment.judgment &&
    judgment.kind === "admitted_c_call_judgment" &&
    judgment.schemaVersion === "5.0.0" &&
    judgment.disposition === "admitted" &&
    judgment.cCallRef === cCall.cCallRef &&
    judgment.resultRef === result.resultRef &&
    judgment.resultDigest === result.resultDigest &&
    judgment.judgmentDigest ===
      sha256Canonical(judgmentBody as unknown as JsonValue) &&
    judgment.judgmentRef ===
      `judgment://abiogenesis/${judgment.judgmentDigest.slice("sha256:".length)}` &&
    exactEventBody(judgmentEvent, "c_call_judged", {
      judgmentRef: judgment.judgmentRef,
      judgmentDigest: judgment.judgmentDigest,
      ...judgmentBody,
    }) &&
    judgmentEvent!.causationEventRefs.includes(result.admissionEventRef);
}

export function projectedCCallResultValue(
  store: AbgEventStore,
  coordinates: {
    readonly runId: string;
    readonly cCallRef: string;
    readonly resultRef: string;
  },
): JsonValue | null {
  const projected = replay(store, { runId: coordinates.runId }).cCalls.find(
    (candidate) =>
      candidate.cCallRef === coordinates.cCallRef &&
      candidate.resultRef === coordinates.resultRef,
  );
  return projected?.resultValue ?? null;
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
  readonly traversalStop: CCallLocusProposal;
  readonly implementationResolution: AdmittedImplementationResolutionRow;
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
}

/**
 * Reconstructs one admitted leaf outcome from its validated Run prefix and the
 * exact installed owner surfaces that declared the C locus.
 */
export function projectAdmittedLeafCCallOutcome(
  store: AbgEventStore,
  input: AdmittedLeafCCallOutcomeProjectionInput,
): RehydratedAdmittedCCallState | null {
  const basis = input.executionBasis;
  const implementationSet = input.implementationSet;
  const scope = input.openedTraversalScope;
  const stop = input.traversalStop;
  const resolution = input.implementationResolution;
  if (
    !hasAdmittedExecutionBasis(store, basis) ||
    !hasAdmittedImplementationSet(store, implementationSet) ||
    !hasOpenedTraversalScope(store, scope) ||
    !hasAdmittedTraversalCursor(store, stop.cursor) ||
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
    !implementationSet.rows.includes(resolution) ||
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
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: scope.runId,
  });
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
  return rehydrateAdmittedCCallState(
    store,
    cCall as unknown as Readonly<Record<string, JsonValue>>,
    result as unknown as Readonly<Record<string, JsonValue>>,
    judgment as unknown as Readonly<Record<string, JsonValue>>,
  );
}

function projectAdmittedCCallState(
  prefix: ValidatedRuntimeEventPrefix,
  cCallValue: Readonly<Record<string, JsonValue>>,
  resultValue: Readonly<Record<string, JsonValue>>,
  judgmentValue: Readonly<Record<string, JsonValue>>,
): RehydratedAdmittedCCallState | null {
  const cCall = deepFreeze(cCallValue) as unknown as CCall;
  const result = deepFreeze(resultValue) as unknown as AdmittedCCallResult;
  const judgment = deepFreeze(judgmentValue) as unknown as AdmittedCCallJudgment;
  if (
    cCall.kind !== "c_call" ||
    cCall.schemaVersion !== "5.0.0" ||
    cCall.callClass !== "leaf" ||
    result.kind !== "admitted_c_call_result" ||
    result.schemaVersion !== "5.0.0" ||
    result.disposition !== "admitted" ||
    judgment.kind !== "admitted_c_call_judgment" ||
    judgment.schemaVersion !== "5.0.0" ||
    judgment.disposition !== "admitted"
  ) {
    return null;
  }
  const identity = {
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
  const {
    kind: _resultKind,
    schemaVersion: _resultSchemaVersion,
    disposition: _resultDisposition,
    resultRef: _resultRef,
    resultDigest: _resultDigest,
    admissionEventRef: _resultEventRef,
    ...resultBody
  } = result;
  const {
    kind: _judgmentKind,
    schemaVersion: _judgmentSchemaVersion,
    disposition: _judgmentDisposition,
    judgmentRef: _judgmentRef,
    judgmentDigest: _judgmentDigest,
    admissionEventRef: _judgmentEventRef,
    ...judgmentBody
  } = judgment;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const cCallEvents = events.filter(
    (event) => event.aggregateType === "c_call" && event.aggregateId === cCall.cCallRef,
  );
  const resultEvent = events.find(
    (event) => event.eventId === result.admissionEventRef,
  );
  const judgmentEvent = events.find(
    (event) => event.eventId === judgment.admissionEventRef,
  );
  if (
    cCall.cCallDigest !== sha256Canonical(identity as unknown as JsonValue) ||
    cCall.cCallRef !== `c-call:${cCall.cCallDigest}` ||
    cCallEvents[0]?.eventId !== cCall.openedEventRef ||
    cCallEvents[1]?.eventId !== cCall.fibreSelectedEventRef ||
    result.resultDigest !== sha256Canonical(resultBody as unknown as JsonValue) ||
    result.resultRef !==
      `result://abiogenesis/${result.resultDigest.slice("sha256:".length)}` ||
    result.cCallRef !== cCall.cCallRef ||
    result.valueDigest !== sha256Canonical(result.value) ||
    judgment.judgmentDigest !==
      sha256Canonical(judgmentBody as unknown as JsonValue) ||
    judgment.judgmentRef !==
      `judgment://abiogenesis/${judgment.judgmentDigest.slice("sha256:".length)}` ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    judgment.resultDigest !== result.resultDigest ||
    !exactEventBody(
      resultEvent,
      "c_call_result_admitted",
      {
        resultRef: result.resultRef,
        resultDigest: result.resultDigest,
        ...resultBody,
      },
    ) ||
    !exactEventBody(
      judgmentEvent,
      "c_call_judged",
      {
        judgmentRef: judgment.judgmentRef,
        judgmentDigest: judgment.judgmentDigest,
        ...judgmentBody,
      },
    )
  ) {
    return null;
  }
  return deepFreeze({ cCall, result, judgment });
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
    : projectAdmittedCCallState(
        prefix,
        cCallValue,
        resultValue,
        judgmentValue,
      );
  if (projected === null) return null;
  cCalls.add(projected.cCall);
  admittedResults.add(projected.result);
  admittedJudgments.add(projected.judgment);
  return projected;
}

export function projectPendingInteractionCarrier(
  prefix: ValidatedRuntimeEventPrefix,
  cCallValue: Readonly<Record<string, JsonValue>>,
  resultValue: Readonly<Record<string, JsonValue>>,
  judgmentValue: Readonly<Record<string, JsonValue>>,
): RehydratedPendingInteraction | null {
  const projected = projectAdmittedCCallState(
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
  cCalls.add(projected.cCall);
  admittedResults.add(projected.result);
  admittedJudgments.add(projected.judgment);
  return projected;
}

export function openCCall(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
  program: Readonly<GtlProgram>,
  graph: Readonly<GtlGraph>,
  stop: CCallLocusProposal,
  implementationSet: AdmittedImplementationSet,
  resolution: AdmittedImplementationResolutionRow,
  basis: RuntimeAdmissionBasis,
): CCallAdmission | CCallOpenRefusal {
  if (!hasAdmittedExecutionBasis(store, executionBasis)) {
    return openRefusal("basis_mismatch", "CCall requires one exact admitted ExecutionBasis");
  }
  if (
    !hasOpenedTraversalScope(store, scope) ||
    scope.executionBasisRef !== executionBasis.basisRef ||
    scope.graphFunctionRef !== executionBasis.graphFunctionRef
  ) {
    return openRefusal("scope_mismatch", "CCall scope differs from the admitted execution basis");
  }
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
    stop.traversalScopeRef !== scope.scopeRef ||
    !hasAdmittedTraversalCursor(store, stop.cursor) ||
    stop.cursor.traversalScopeRef !== scope.scopeRef ||
    stop.cursor.executionBasisRef !== executionBasis.basisRef ||
    stop.cursor.frameId !== scope.frameId ||
    stop.cursor.currentNodeRef !== stop.nodeRef ||
    stop.runId !== scope.runId ||
    stop.graphCallId !== scope.graphCallId ||
    stop.frameId !== scope.frameId ||
    stop.disposition !== "at_compute_locus" ||
    program.programRef !== executionBasis.programRef ||
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
  if (
    !hasAdmittedImplementationSet(store, implementationSet) ||
    executionBasis.implementationSetRef !== implementationSet.implementationSetRef ||
    executionBasis.implementationSetDigest !== implementationSet.implementationSetDigest ||
    !implementationSet.rows.includes(resolution) ||
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
  const identity = {
    basisId: executionBasis.basisRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    vectorIndex: stop.vectorIndex,
    stageRole: stop.stageRole,
    taskOrdinal: stop.taskOrdinal,
    attempt: stop.attempt,
    programLocusRef: stop.programLocusRef,
    retryPath: stop.retryPath,
  };
  const cursorAdmissionEventRef = traversalCursorAdmissionEventRef(store, stop.cursor);
  if (cursorAdmissionEventRef === null) {
    return openRefusal("scope_mismatch", "CCall requires one admitted traversal cursor");
  }
  const cCallDigest = sha256Canonical(identity as unknown as JsonValue);
  const cCallRef = `c-call:${cCallDigest}`;
  const locusBody = {
    cCallRef,
    cCallDigest,
    callClass: "leaf" as const,
    basisId: executionBasis.basisRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
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
  const openingEvents = admitRuntimeEventBatch(store, [
    () => ({
      kind: "c_call_opened",
      eventTime: basis.eventTime,
      aggregateType: "c_call",
      aggregateId: cCallRef,
      parentAggregateId: scope.frameId,
      causationEventRefs: [cursorAdmissionEventRef, ...basis.causationEventRefs],
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
      payload: locusBody,
    }),
    (admitted) => ({
      kind: "c_call_fibre_selected",
      eventTime: basis.eventTime,
      aggregateType: "c_call",
      aggregateId: cCallRef,
      parentAggregateId: scope.frameId,
      causationEventRefs: [admitted[0]!.eventId],
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
      payload: fibreBody,
    }),
  ]);
  const openedEvent = openingEvents[0]!;
  const fibreEvent = openingEvents[1]!;
  const cCall = deepFreeze({
    kind: "c_call" as const,
    schemaVersion: "5.0.0" as const,
    cCallRef,
    cCallDigest,
    callClass: "leaf" as const,
    basisId: executionBasis.basisRef,
    runId: scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
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
    interactionSetRef: executionBasis.interactionSetRef,
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
    refusalValueKind: executionBasis.refusalValueKind,
    evidenceContractRef: stop.evidenceContractRef,
    judgmentContractRef: stop.judgmentContractRef,
    rejectionContractRef: stop.refusalContractRef,
    transitionContractRef: executionBasis.transitionContractRef,
    closureContractRef: executionBasis.closureContractRef,
    closureContractDigest: executionBasis.closureContractDigest,
    judgmentPredicateRef: stop.judgmentPredicateRef,
    terminalPredicateRef: executionBasis.terminalPredicateRef,
    replayProjectionRef: executionBasis.replayProjectionRef,
    terminalKind: executionBasis.terminalKind,
    openedEventRef: openedEvent.eventId,
    fibreSelectedEventRef: fibreEvent.eventId,
  }) as CCall;
  cCalls.add(cCall);
  return deepFreeze({
    kind: "c_call_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "opened" as const,
    cCall,
  }) as CCallAdmission;
}

export function openInteractionCCall(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
  program: Readonly<GtlProgram>,
  graph: Readonly<GtlGraph>,
  stop: InteractionCCallLocusProposal,
  interactionSet: AdmittedInteractionSet,
  interaction: AdmittedInteractionContractRow,
  basis: RuntimeAdmissionBasis,
): CCallAdmission | CCallOpenRefusal {
  if (!hasAdmittedExecutionBasis(store, executionBasis)) {
    return openRefusal(
      "basis_mismatch",
      "F_H CCall requires one exact admitted ExecutionBasis",
    );
  }
  if (
    !hasOpenedTraversalScope(store, scope) ||
    scope.executionBasisRef !== executionBasis.basisRef ||
    scope.graphFunctionRef !== executionBasis.graphFunctionRef
  ) {
    return openRefusal(
      "scope_mismatch",
      "F_H CCall scope differs from the admitted execution basis",
    );
  }
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
    stop.traversalScopeRef !== scope.scopeRef ||
    !hasAdmittedTraversalCursor(store, stop.cursor) ||
    stop.cursor.traversalScopeRef !== scope.scopeRef ||
    stop.cursor.executionBasisRef !== executionBasis.basisRef ||
    stop.cursor.frameId !== scope.frameId ||
    stop.cursor.currentNodeRef !== stop.nodeRef ||
    stop.runId !== scope.runId ||
    stop.graphCallId !== scope.graphCallId ||
    stop.frameId !== scope.frameId ||
    stop.disposition !== "at_compute_locus" ||
    program.programRef !== executionBasis.programRef ||
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
  if (
    !hasAdmittedInteractionSet(store, interactionSet) ||
    executionBasis.interactionSetRef !== interactionSet.interactionSetRef ||
    executionBasis.interactionSetDigest !== interactionSet.interactionSetDigest ||
    !interactionSet.rows.includes(interaction) ||
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
  const identity = {
    basisId: executionBasis.basisRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    vectorIndex: stop.vectorIndex,
    stageRole: stop.stageRole,
    taskOrdinal: stop.taskOrdinal,
    attempt: stop.attempt,
    programLocusRef: stop.programLocusRef,
    retryPath: stop.retryPath,
  };
  const cursorAdmissionEventRef = traversalCursorAdmissionEventRef(
    store,
    stop.cursor,
  );
  if (cursorAdmissionEventRef === null) {
    return openRefusal(
      "scope_mismatch",
      "F_H CCall requires one admitted traversal cursor",
    );
  }
  const cCallDigest = sha256Canonical(identity as unknown as JsonValue);
  const cCallRef = `c-call:${cCallDigest}`;
  const locusBody = {
    cCallRef,
    cCallDigest,
    callClass: "leaf" as const,
    basisId: executionBasis.basisRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
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
    regime: "F_H" as const,
    armId: stop.armId,
    compositionRef: stop.compositionRef,
    implementationSetRef: executionBasis.rootImplementationSetRef,
    implementationRequirementKey: null,
    implementationBindingRef: null,
    implementationRef: null,
    interactionSetRef: interactionSet.interactionSetRef,
    interactionRequirementKey: interaction.requirementKey,
    interactionKind: stop.interactionKind,
    actorCapabilityRef: stop.actorCapabilityRef,
    requestContractRef: stop.requestContractRef,
    responseContractRef: stop.responseContractRef,
    continuationContractRef: stop.continuationContractRef,
  };
  const openingEvents = admitRuntimeEventBatch(store, [
    () => ({
      kind: "c_call_opened",
      eventTime: basis.eventTime,
      aggregateType: "c_call",
      aggregateId: cCallRef,
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
      payload: locusBody,
    }),
    (admitted) => ({
      kind: "c_call_fibre_selected",
      eventTime: basis.eventTime,
      aggregateType: "c_call",
      aggregateId: cCallRef,
      parentAggregateId: scope.frameId,
      causationEventRefs: [admitted[0]!.eventId],
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
      payload: fibreBody,
    }),
  ]);
  const cCall = deepFreeze({
    kind: "c_call" as const,
    schemaVersion: "5.0.0" as const,
    cCallRef,
    cCallDigest,
    callClass: "leaf" as const,
    basisId: executionBasis.basisRef,
    runId: scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
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
    regime: "F_H" as const,
    armId: stop.armId,
    compositionRef: stop.compositionRef,
    implementationSetRef: executionBasis.rootImplementationSetRef,
    implementationRequirementKey: null,
    implementationBindingRef: null,
    implementationRef: null,
    interactionSetRef: interactionSet.interactionSetRef,
    interactionRequirementKey: interaction.requirementKey,
    interactionKind: stop.interactionKind,
    actorCapabilityRef: stop.actorCapabilityRef,
    responseContractRef: stop.responseContractRef,
    continuationContractRef: stop.continuationContractRef,
    childGraphFunctionRef: null,
    inputContractRef: stop.requestContractRef,
    outputContractRef: stop.responseContractRef,
    failureContractRef: executionBasis.refusalContractRef,
    refusalContractRef: executionBasis.refusalContractRef,
    refusalValueKind: executionBasis.refusalValueKind,
    evidenceContractRef: stop.requestContractRef,
    judgmentContractRef: stop.continuationContractRef,
    rejectionContractRef: executionBasis.rejectionContractRef,
    transitionContractRef: executionBasis.transitionContractRef,
    closureContractRef: executionBasis.closureContractRef,
    closureContractDigest: executionBasis.closureContractDigest,
    judgmentPredicateRef: stop.judgmentPredicateRef,
    terminalPredicateRef: executionBasis.terminalPredicateRef,
    replayProjectionRef: executionBasis.replayProjectionRef,
    terminalKind: executionBasis.terminalKind,
    openedEventRef: openingEvents[0]!.eventId,
    fibreSelectedEventRef: openingEvents[1]!.eventId,
  }) as CCall;
  cCalls.add(cCall);
  return deepFreeze({
    kind: "c_call_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "opened" as const,
    cCall,
  }) as CCallAdmission;
}

export function openWorkflowCCall(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  implementationSet: AdmittedImplementationSet,
  scope: OpenedTraversalScope,
  program: Readonly<GtlProgram>,
  graphFunction: Readonly<GraphFunction>,
  graph: Readonly<GtlGraph>,
  proposal: WorkflowCCallProposal,
  basis: RuntimeAdmissionBasis,
): CCallAdmission | CCallOpenRefusal {
  if (!hasAdmittedExecutionBasis(store, executionBasis)) {
    return openRefusal("basis_mismatch", "workflow CCall requires one admitted ExecutionBasis");
  }
  if (
    !hasOpenedTraversalScope(store, scope) ||
    scope.executionBasisRef !== executionBasis.basisRef ||
    scope.graphFunctionRef !== executionBasis.graphFunctionRef
  ) {
    return openRefusal("scope_mismatch", "workflow CCall scope differs from its execution basis");
  }
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
  const childFailureContractRefs = new Set(
    implementationSet.rows
      .filter((row) => row.graphFunctionRef === proposal.childGraphFunctionRef)
      .map((row) => row.failureContractRef),
  );
  if (
    !hasAdmittedImplementationSet(store, implementationSet) ||
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
    !hasAdmittedTraversalCursor(store, cursor) ||
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
  const cursorAdmissionEventRef = traversalCursorAdmissionEventRef(store, cursor);
  if (cursorAdmissionEventRef === null) {
    return openRefusal("scope_mismatch", "workflow CCall requires one admitted parent cursor");
  }
  const programLocusDigest = sha256Canonical({
    graphFunctionRef: executionBasis.graphFunctionRef,
    nodeRef: cursor.currentNodeRef,
    termPath: cursor.termPath,
    childGraphFunctionRef: proposal.childGraphFunctionRef,
  } as unknown as JsonValue);
  const programLocusRef =
    `workflow-locus://abiogenesis/${programLocusDigest.slice("sha256:".length)}`;
  const identity = {
    basisId: executionBasis.basisRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    vectorIndex: 0,
    stageRole: "workflow",
    taskOrdinal: cursor.taskOrdinal,
    attempt: cursor.attempt,
    programLocusRef,
    retryPath: cursor.retryPath,
    childGraphFunctionRef: proposal.childGraphFunctionRef,
    failureContractRef: proposal.failureContractRef,
  };
  const cCallDigest = sha256Canonical(identity as unknown as JsonValue);
  const cCallRef = `c-call:${cCallDigest}`;
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
    taskOrdinal: cursor.taskOrdinal,
    attempt: cursor.attempt,
    programLocusRef,
    retryPath: cursor.retryPath,
    cursorRef: cursor.cursorRef,
    cursorDigest: cursor.cursorDigest,
    childGraphFunctionRef: proposal.childGraphFunctionRef,
    failureContractRef: proposal.failureContractRef,
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
    childGraphFunctionRef: proposal.childGraphFunctionRef,
  };
  const openingEvents = admitRuntimeEventBatch(store, [
    () => ({
      kind: "c_call_opened",
      eventTime: basis.eventTime,
      aggregateType: "c_call",
      aggregateId: cCallRef,
      parentAggregateId: scope.frameId,
      causationEventRefs: [cursorAdmissionEventRef, ...basis.causationEventRefs],
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
      payload: locusBody,
    }),
    (admitted) => ({
      kind: "c_call_fibre_selected",
      eventTime: basis.eventTime,
      aggregateType: "c_call",
      aggregateId: cCallRef,
      parentAggregateId: scope.frameId,
      causationEventRefs: [admitted[0]!.eventId],
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
      payload: fibreBody,
    }),
  ]);
  const cCall = deepFreeze({
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
    taskOrdinal: cursor.taskOrdinal,
    attempt: cursor.attempt,
    programLocusRef,
    retryPath: cursor.retryPath,
    regime: "F_D" as const,
    armId: "arm://abiogenesis/workflow.C@5",
    compositionRef: null,
    implementationSetRef: executionBasis.rootImplementationSetRef,
    implementationRequirementKey: null,
    implementationBindingRef: null,
    implementationRef: null,
    childGraphFunctionRef: proposal.childGraphFunctionRef,
    inputContractRef: proposal.inputContractRef,
    outputContractRef: proposal.outputContractRef,
    failureContractRef: proposal.failureContractRef,
    refusalContractRef: executionBasis.refusalContractRef,
    refusalValueKind: executionBasis.refusalValueKind,
    evidenceContractRef: executionBasis.evidenceContractRef,
    judgmentContractRef: executionBasis.judgmentContractRef,
    rejectionContractRef: executionBasis.rejectionContractRef,
    transitionContractRef: executionBasis.transitionContractRef,
    closureContractRef: executionBasis.closureContractRef,
    closureContractDigest: executionBasis.closureContractDigest,
    judgmentPredicateRef: proposal.judgmentPredicateRef,
    terminalPredicateRef: executionBasis.terminalPredicateRef,
    replayProjectionRef: executionBasis.replayProjectionRef,
    terminalKind: executionBasis.terminalKind,
    openedEventRef: openingEvents[0]!.eventId,
    fibreSelectedEventRef: openingEvents[1]!.eventId,
  }) as CCall;
  cCalls.add(cCall);
  return deepFreeze({
    kind: "c_call_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "opened" as const,
    cCall,
  }) as CCallAdmission;
}

export function admitPendingInteraction(
  store: AbgEventStore,
  cCall: CCall,
  request: Readonly<Record<string, JsonValue>>,
  expectedInputDigest: Sha256Digest,
  basis: RuntimeAdmissionBasis,
): PendingInteractionAdmission {
  const retryAttemptRef = exactRetryAttemptRef(store, cCall);
  if (
    !hasOpenedCCall(store, cCall) ||
    cCall.callClass !== "leaf" ||
    cCall.regime !== "F_H" ||
    cCall.interactionKind === null ||
    cCall.actorCapabilityRef === null ||
    cCall.responseContractRef === null ||
    cCall.continuationContractRef === null ||
    sha256Canonical(request as unknown as JsonValue) !== expectedInputDigest ||
    eventsFor(store, cCall.cCallRef).length !== 2 ||
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
  const evidenceEvent = admitRuntimeEvent(store, {
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
  admittedEvidence.add(evidence);

  const resultBody = {
    cCallRef: cCall.cCallRef,
    resultClass: "pending" as const,
    contractRef: cCall.continuationContractRef,
    valueKind: "fh_pending_result",
    valueDigest: pendingValueDigest,
    value: pendingValue,
    evidenceRefs: [evidence.evidenceRef],
  };
  const resultDigest = sha256Canonical(resultBody as unknown as JsonValue);
  const resultRef =
    `result://abiogenesis/${resultDigest.slice("sha256:".length)}`;
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
  admittedResults.add(result);

  const replayState = replay(store, { runId: cCall.runId });
  const judgmentBody = {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    resultDigest: result.resultDigest,
    judgment: "pending" as const,
    reasonRef: `reason://abiogenesis/fh/${cCall.interactionKind}/pending@5`,
    contractRef: cCall.judgmentContractRef,
    predicateRef: cCall.judgmentPredicateRef,
    replayStateDigest: replayState.replayDigest,
    retryAttemptRef,
  };
  const judgmentDigest = sha256Canonical(
    judgmentBody as unknown as JsonValue,
  );
  const judgmentRef =
    `judgment://abiogenesis/${judgmentDigest.slice("sha256:".length)}`;
  const judgmentEvent = admitRuntimeEvent(store, {
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
  admittedJudgments.add(judgment);
  return deepFreeze({
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
}

export function admitEvidence(
  store: AbgEventStore,
  cCall: CCall,
  candidate: CCallEvidenceCandidate,
  contractRef: string,
  expectedInputDigest: Sha256Digest,
  basis: RuntimeAdmissionBasis,
  expectedInstructionContractRef: string = cCall.inputContractRef,
): CCallEvidenceAdmissionResult {
  const candidateValue = candidate as unknown as JsonValue;
  const digestPattern = /^sha256:[a-f0-9]{64}$/u;
  const commonValid = candidate.schemaVersion === "5.0.0" &&
    candidate.inputDigest === expectedInputDigest &&
    digestPattern.test(candidate.outputDigest);
  const deterministicValid = candidate.kind === "deterministic_evidence_candidate" &&
    cCall.callClass === "leaf" &&
    cCall.regime === "F_D" &&
    candidate.implementationRef === cCall.implementationRef;
  const probabilisticValid = candidate.kind === "probabilistic_transport_evidence_candidate" &&
    cCall.callClass === "leaf" &&
    cCall.regime === "F_P" &&
    candidate.implementationRef === cCall.implementationRef &&
    derivedProbabilisticEvidence.has(candidate) &&
    typeof candidate.actorInvocationRef === "string" && candidate.actorInvocationRef.length > 0 &&
    typeof candidate.actorRef === "string" && candidate.actorRef.length > 0 &&
    typeof candidate.workerBindingRef === "string" && candidate.workerBindingRef.length > 0 &&
    typeof candidate.processRef === "string" && candidate.processRef.length > 0 &&
    typeof candidate.transportBindingRef === "string" && candidate.transportBindingRef.length > 0 &&
    typeof candidate.transportBindingDigest === "string" && digestPattern.test(candidate.transportBindingDigest) &&
    typeof candidate.materializationPlanRef === "string" && candidate.materializationPlanRef.length > 0 &&
    typeof candidate.rendererRef === "string" && candidate.rendererRef.length > 0 &&
    candidate.instructionContractRef === expectedInstructionContractRef &&
    candidate.resultContractRef === cCall.outputContractRef &&
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
    ? store.readAll().find((event) => event.eventId === candidate.foldbackEventRef)
    : undefined;
  const subTraversalValid = candidate.kind === "sub_traversal_evidence_candidate" &&
    cCall.callClass === "workflow" &&
    derivedSubTraversalEvidence.has(candidate) &&
    foldbackEvent?.kind === "child_foldback_admitted" &&
    foldbackEvent.runId === cCall.runId &&
    foldbackEvent.frameId === cCall.frameId &&
    isJsonRecord(foldbackEvent.payload) &&
    foldbackEvent.payload.parentCCallRef === cCall.cCallRef &&
    foldbackEvent.payload.foldbackRef === candidate.foldbackRef &&
    foldbackEvent.payload.foldbackDigest === candidate.foldbackDigest &&
    foldbackEvent.payload.outputDigest === candidate.childOutputDigest;
  if (
    !hasOpenedCCall(store, cCall) ||
    !commonValid ||
    (!deterministicValid && !probabilisticValid && !subTraversalValid) ||
    contractRef !== cCall.evidenceContractRef ||
    eventsFor(store, cCall.cCallRef).some((event) => event.kind === "c_call_result_admitted")
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
  const prior = eventsFor(store, cCall.cCallRef).at(-1)!;
  const event = admitRuntimeEvent(store, {
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
  });
  const admitted = deepFreeze({
    kind: "admitted_c_call_evidence" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    evidenceRef,
    evidenceDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as AdmittedCCallEvidence;
  admittedEvidence.add(admitted);
  return admitted;
}

export function admitResult(
  store: AbgEventStore,
  cCall: CCall,
  candidate: JsonValue,
  resultClass: "failure" | "success",
  contractRef: string,
  valueKind: string,
  validateValue: (value: unknown) => boolean,
  evidence: readonly AdmittedCCallEvidence[],
  basis: RuntimeAdmissionBasis,
): CCallResultAdmissionResult {
  const evidenceEvents = eventsFor(store, cCall.cCallRef).filter(
    (event) => event.kind === "c_call_evidenced",
  );
  const valueDigest = sha256Canonical(candidate);
  const expectedContractRef = resultClass === "success"
    ? cCall.outputContractRef
    : cCall.failureContractRef;
  if (
    !hasOpenedCCall(store, cCall) ||
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
        !admittedEvidence.has(row) ||
        row.cCallRef !== cCall.cCallRef ||
        row.outputDigest !== valueDigest ||
        evidenceEvents[index]?.eventId !== row.admissionEventRef,
    ) ||
    eventsFor(store, cCall.cCallRef).some((event) => event.kind === "c_call_result_admitted")
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
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: cCall.runId,
  });
  const prior = runtimeEventsFromValidatedPrefix(prefix).filter(
    (event) =>
      event.aggregateType === "c_call" && event.aggregateId === cCall.cCallRef,
  ).at(-1)!;
  const event = admitRuntimeEvent(store, {
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
  });
  const admitted = deepFreeze({
    kind: "admitted_c_call_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    resultRef,
    resultDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as AdmittedCCallResult;
  admittedResults.add(admitted);
  return admitted;
}

export function admitJudgment(
  store: AbgEventStore,
  cCall: CCall,
  result: AdmittedCCallResult,
  candidate: JudgmentCandidate,
  replayState: ReplayState,
  basis: RuntimeAdmissionBasis,
): CCallJudgmentAdmissionResult {
  const activeRetryAttemptRef = exactRetryAttemptRef(store, cCall);
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
  const currentReplay = replay(store, { runId: cCall.runId });
  const currentCCall = currentReplay.cCalls.find(
    (row) => row.cCallRef === cCall.cCallRef,
  );
  if (
    !hasOpenedCCall(store, cCall) ||
    !hasCurrentAdmittedCCallResult(store, cCall, result) ||
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
  const event = admitRuntimeEvent(store, {
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
  });
  const admitted = deepFreeze({
    kind: "admitted_c_call_judgment" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    judgmentRef,
    judgmentDigest,
    ...judgmentBody,
    admissionEventRef: event.eventId,
  }) as AdmittedCCallJudgment;
  admittedJudgments.add(admitted);
  return admitted;
}

export function completeRejectedCCall(
  store: AbgEventStore,
  cCall: CCall,
  admissionRejection: CCallAdmissionRejection,
  basis: RuntimeAdmissionBasis,
): RejectedCCallCompletion {
  const activeRetryAttemptRef = exactRetryAttemptRef(store, cCall);
  if (
    !hasOpenedCCall(store, cCall) ||
    !admissionRejections.has(admissionRejection) ||
    (cCall.retryPath.length !== 0 && activeRetryAttemptRef === null) ||
    admissionRejection.cCallRef !== cCall.cCallRef ||
    eventsFor(store, cCall.cCallRef).some((event) => event.kind === "c_call_judged")
  ) {
    throw new TypeError("completeRejectedCCall requires one authentic open-call admission rejection");
  }
  const rows = eventsFor(store, cCall.cCallRef);
  const existingResultEvent = rows.find((event) => event.kind === "c_call_result_admitted");
  if (
    (admissionRejection.stage === "judgment" && existingResultEvent === undefined) ||
    (admissionRejection.stage !== "judgment" && existingResultEvent !== undefined)
  ) {
    throw new TypeError("CCall rejection stage does not match the admitted spine state");
  }

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
}
