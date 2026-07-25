import type { GraphFunction, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import { isExecutableCLeaf, isInteractionCLeaf } from "../gtl/c_algebra.js";
import {
  resolveCProgramTermAtSourcePath,
  resolveEnclosingCBatchRef,
} from "../gtl/source_path.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasAdmittedExecutionBasis,
  hasAdmittedImplementationSet,
  hasAdmittedInteractionSet,
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
} from "./event_store.js";
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
  type ActorProcessObservation,
} from "./actor_process.js";

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

export interface RejectedCCallCompletion {
  readonly kind: "rejected_c_call_completion";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "blocked" | "retry";
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

const cCalls = new WeakSet<object>();
const admittedEvidence = new WeakSet<object>();
const admittedResults = new WeakSet<object>();
const admittedJudgments = new WeakSet<object>();
const admissionRejections = new WeakSet<object>();
const derivedProbabilisticEvidence = new WeakSet<object>();
const admittedChildFoldbacks = new WeakSet<object>();
const derivedSubTraversalEvidence = new WeakSet<object>();

function isJsonRecord(value: JsonValue): value is Readonly<Record<string, JsonValue>> {
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

function eventsFor(store: AbgEventStore, cCallRef: string) {
  return store.readAll().filter(
    (event) =>
      event.aggregateType === "c_call" &&
      event.aggregateId === cCallRef,
  );
}

function hasAdmittedActorEvidence(
  store: AbgEventStore,
  cCall: CCall,
  candidate: ProbabilisticTransportEvidenceCandidate,
): boolean {
  const binding = store.readAll().find(
    (event) => event.aggregateId === candidate.transportBindingRef,
  );
  const actorRows = store.readAll().filter(
    (event) =>
      event.aggregateId === candidate.actorInvocationRef ||
      event.parentAggregateId === candidate.actorInvocationRef,
  );
  const opened = actorRows.find((event) => event.kind === "actor_invocation_started");
  const processStarted = actorRows.find(
    (event) => event.kind === "actor_process_started",
  );
  const artifact = actorRows.find(
    (event) => event.kind === "actor_result_artifact_observed",
  );
  const terminal = actorRows.find(
    (event) => event.kind === "actor_invocation_closed" ||
      event.kind === "actor_invocation_failed",
  );
  const processExit = actorRows.find((event) => event.kind === "actor_process_exited");
  const terminationUnconfirmed = actorRows.find(
    (event) => event.kind === "actor_process_termination_unconfirmed",
  );
  const timeout = actorRows.some(
    (event) => event.kind === "actor_process_timeout_observed",
  );
  const signals = actorRows
    .filter((event) => event.kind === "actor_process_signal_requested")
    .map((event) => isJsonRecord(event.payload) ? event.payload.signal : null);
  let stdoutByteLength = 0;
  let stderrByteLength = 0;
  for (const event of actorRows) {
    if (!isJsonRecord(event.payload) || typeof event.payload.byteLength !== "number") {
      continue;
    }
    if (event.kind === "actor_process_stdout_observed") {
      stdoutByteLength += event.payload.byteLength;
    } else if (event.kind === "actor_process_stderr_observed") {
      stderrByteLength += event.payload.byteLength;
    }
  }
  const bindingDigestValid = binding !== undefined && isJsonRecord(binding.payload)
    ? (() => {
        const {
          transportBindingRef: _transportBindingRef,
          transportBindingDigest: _transportBindingDigest,
          ...body
        } = binding.payload;
        return sha256Canonical(body as unknown as JsonValue) ===
            candidate.transportBindingDigest &&
          candidate.transportBindingRef ===
            `transport-binding://abiogenesis/${candidate.transportBindingDigest.slice("sha256:".length)}`;
      })()
    : false;
  return derivedProbabilisticEvidence.has(candidate) &&
    bindingDigestValid &&
    binding?.kind === "actor_transport_binding_admitted" &&
    binding.parentAggregateId === cCall.cCallRef &&
    isJsonRecord(binding.payload) &&
    binding.payload.transportBindingRef === candidate.transportBindingRef &&
    binding.payload.transportBindingDigest === candidate.transportBindingDigest &&
    binding.payload.workerBindingRef === candidate.workerBindingRef &&
    binding.payload.implementationBindingRef === cCall.implementationBindingRef &&
    binding.payload.implementationRef === candidate.implementationRef &&
    opened !== undefined &&
    artifact !== undefined &&
    terminal !== undefined &&
    opened.runId === cCall.runId &&
    opened.parentAggregateId === cCall.cCallRef &&
    opened.causationEventRefs.includes(binding.eventId) &&
    isJsonRecord(opened.payload) &&
    opened.payload.actorRef === candidate.actorRef &&
    opened.payload.workerBindingRef === candidate.workerBindingRef &&
    opened.payload.transportBindingRef === candidate.transportBindingRef &&
    opened.payload.transportBindingDigest === candidate.transportBindingDigest &&
    opened.payload.cCallRef === cCall.cCallRef &&
    opened.payload.implementationRef === candidate.implementationRef &&
    opened.payload.inputDigest === candidate.inputDigest &&
    opened.payload.promptDigest === candidate.promptDigest &&
    processStarted !== undefined &&
    isJsonRecord(processStarted.payload) &&
    processStarted.payload.actorInvocationRef === candidate.actorInvocationRef &&
    processStarted.payload.processRef === candidate.processRef &&
    artifact.parentAggregateId === cCall.cCallRef &&
    isJsonRecord(artifact.payload) &&
    artifact.payload.cCallRef === cCall.cCallRef &&
    artifact.payload.actorRef === candidate.actorRef &&
    artifact.payload.workerBindingRef === candidate.workerBindingRef &&
    artifact.payload.implementationRef === candidate.implementationRef &&
    artifact.payload.inputDigest === candidate.inputDigest &&
    artifact.payload.materializationPlanRef === candidate.materializationPlanRef &&
    artifact.payload.rendererRef === candidate.rendererRef &&
    artifact.payload.instructionContractRef === candidate.instructionContractRef &&
    artifact.payload.resultContractRef === candidate.resultContractRef &&
    artifact.payload.transportBindingRef === candidate.transportBindingRef &&
    artifact.payload.transportBindingDigest === candidate.transportBindingDigest &&
    artifact.payload.observedOutputDigest === candidate.observedOutputDigest &&
    artifact.payload.transportDigest === candidate.transportDigest &&
    artifact.payload.processRef === candidate.processRef &&
    artifact.payload.promptDigest === candidate.promptDigest &&
    artifact.payload.transportLane === candidate.transportLane &&
    artifact.payload.disposition === candidate.transportDisposition &&
    artifact.payload.failureClass === candidate.transportFailureClass &&
    artifact.payload.processStatus === candidate.processStatus &&
    artifact.payload.processSignal === candidate.processSignal &&
    artifact.payload.timedOut === candidate.timedOut &&
    artifact.payload.exitObserved === candidate.exitObserved &&
    artifact.payload.terminationConfirmed === candidate.terminationConfirmed &&
    artifact.payload.structuredEventCount === candidate.structuredEventCount &&
    artifact.payload.progressEventCount === candidate.progressEventCount &&
    artifact.payload.toolCallCount === candidate.toolCallCount &&
    artifact.payload.apiRetryCount === candidate.apiRetryCount &&
    artifact.payload.stdoutByteLength === candidate.stdoutByteLength &&
    artifact.payload.stderrByteLength === candidate.stderrByteLength &&
    artifact.payload.signalSequence !== undefined &&
    sha256Canonical(artifact.payload.signalSequence) ===
      sha256Canonical(candidate.signalSequence as unknown as JsonValue) &&
    artifact.payload.artifactDigests !== undefined &&
    sha256Canonical(artifact.payload.artifactDigests) ===
      sha256Canonical(candidate.artifactDigests as unknown as JsonValue) &&
    candidate.timedOut === timeout &&
    sha256Canonical(signals as unknown as JsonValue) ===
      sha256Canonical(candidate.signalSequence as unknown as JsonValue) &&
    stdoutByteLength === candidate.stdoutByteLength &&
    stderrByteLength === candidate.stderrByteLength &&
    (candidate.exitObserved
      ? processExit !== undefined &&
        isJsonRecord(processExit.payload) &&
        processExit.payload.status === candidate.processStatus &&
        processExit.payload.signal === candidate.processSignal &&
        terminationUnconfirmed === undefined
      : processExit === undefined && terminationUnconfirmed !== undefined) &&
    terminal.causationEventRefs.includes(artifact.eventId) &&
    ((candidate.transportDisposition === "success" &&
      terminal.kind === "actor_invocation_closed") ||
      (candidate.transportDisposition === "failure" &&
        terminal.kind === "actor_invocation_failed"));
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
      (event.payload.routeKind === "terminal" || event.payload.routeKind === "blocked"),
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
    (routeKind !== "terminal" && routeKind !== "blocked") ||
    childLifecycleEvent === undefined ||
    (routeKind === "terminal" &&
      (
        input.childClosureRef === null ||
        terminalReachedEvent === undefined ||
        frameClosedEvent === undefined ||
        graphCallClosedEvent === undefined
      )) ||
    (routeKind === "blocked" &&
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
  const childDisposition = routeKind === "terminal" ? "closed" as const : "blocked" as const;
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

export function rehydratePendingInteraction(
  store: AbgEventStore,
  cCallValue: Readonly<Record<string, JsonValue>>,
  resultValue: Readonly<Record<string, JsonValue>>,
  judgmentValue: Readonly<Record<string, JsonValue>>,
): RehydratedPendingInteraction | null {
  const cCall = deepFreeze(cCallValue) as unknown as CCall;
  const result = deepFreeze(resultValue) as unknown as AdmittedCCallResult;
  const judgment = deepFreeze(judgmentValue) as unknown as AdmittedCCallJudgment;
  if (
    cCall.kind !== "c_call" ||
    cCall.schemaVersion !== "5.0.0" ||
    cCall.regime !== "F_H" ||
    cCall.callClass !== "leaf" ||
    result.kind !== "admitted_c_call_result" ||
    result.schemaVersion !== "5.0.0" ||
    result.disposition !== "admitted" ||
    result.resultClass !== "pending" ||
    judgment.kind !== "admitted_c_call_judgment" ||
    judgment.schemaVersion !== "5.0.0" ||
    judgment.disposition !== "admitted" ||
    judgment.judgment !== "pending"
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
  const cCallEvents = eventsFor(store, cCall.cCallRef);
  const resultEvent = store.readAll().find(
    (event) => event.eventId === result.admissionEventRef,
  );
  const judgmentEvent = store.readAll().find(
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
      { resultRef: result.resultRef, resultDigest: result.resultDigest, ...resultBody },
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
  cCalls.add(cCall);
  admittedResults.add(result);
  admittedJudgments.add(judgment);
  if (
    !hasOpenedCCall(store, cCall) ||
    !isAdmittedCCallResult(result) ||
    !isAdmittedCCallJudgment(judgment)
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
  if (requestRef === null || requestDigest === null) return null;
  return deepFreeze({
    cCall,
    result,
    judgment,
    requestRef,
    requestDigest,
  });
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
  if (
    !hasOpenedCCall(store, cCall) ||
    cCall.callClass !== "leaf" ||
    cCall.regime !== "F_H" ||
    cCall.interactionKind === null ||
    cCall.actorCapabilityRef === null ||
    cCall.responseContractRef === null ||
    cCall.continuationContractRef === null ||
    sha256Canonical(request as unknown as JsonValue) !== expectedInputDigest ||
    eventsFor(store, cCall.cCallRef).length !== 2
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
  const prior = eventsFor(store, cCall.cCallRef).at(-1)!;
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
  if (
    !hasOpenedCCall(store, cCall) ||
    !isAdmittedCCallResult(result) ||
    candidate.candidateDigest !== sha256Canonical(candidateValue) ||
    candidate.candidateRef !==
      `judgment-candidate://abiogenesis/${candidate.candidateDigest.slice("sha256:".length)}` ||
    candidate.cCallRef !== cCall.cCallRef ||
    candidate.resultRef !== result.resultRef ||
    candidate.resultDigest !== result.resultDigest ||
    candidate.contractRef !== cCall.judgmentContractRef ||
    candidate.predicateRef !== cCall.judgmentPredicateRef ||
    candidate.replayStateDigest !== replayState.replayDigest ||
    replay(store, { runId: cCall.runId }).replayDigest !== replayState.replayDigest ||
    eventsFor(store, cCall.cCallRef).at(-1)?.eventId !== result.admissionEventRef
  ) {
    return rejection(
      cCall,
      "judgment",
      candidateValue,
      candidate.contractRef,
      "diagnostic://abiogenesis/c-call/judgment-contract-mismatch@5",
    );
  }
  const judgmentDigest = sha256Canonical(candidateValue);
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
    payload: { judgmentRef, judgmentDigest, ...candidateBody },
  });
  const admitted = deepFreeze({
    kind: "admitted_c_call_judgment" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    judgmentRef,
    judgmentDigest,
    ...candidateBody,
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
  disposition: RejectedCCallCompletion["disposition"] = "blocked",
): RejectedCCallCompletion {
  if (
    !hasOpenedCCall(store, cCall) ||
    !admissionRejections.has(admissionRejection) ||
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
      evidenceRefs: [rejectionEvidenceRef],
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
  const rejectionJudgmentBody = {
    cCallRef: cCall.cCallRef,
    resultRef,
    resultDigest,
    judgment: disposition,
    reasonRef: admissionRejection.diagnosticRef,
    contractRef: cCall.rejectionContractRef,
    predicateRef: cCall.judgmentPredicateRef,
    replayStateDigest: rejectionReplay.replayDigest,
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
    disposition,
    cCallRef: cCall.cCallRef,
    rejectionEvidenceRef,
    refusalResultRef: resultRef,
    rejectionJudgmentRef,
    evidenceEventRef,
    resultEventRef,
    judgmentEventRef: judgmentEvent.eventId,
  }) as RejectedCCallCompletion;
}
