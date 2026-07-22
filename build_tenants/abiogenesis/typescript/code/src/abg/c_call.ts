import type { GtlGraph, GtlProgram } from "../gtl/contracts.js";
import { isExecutableCLeaf } from "../gtl/c_algebra.js";
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

export interface CCall {
  readonly kind: "c_call";
  readonly schemaVersion: "5.0.0";
  readonly cCallRef: string;
  readonly cCallDigest: Sha256Digest;
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
  readonly implementationRequirementKey: string;
  readonly implementationBindingRef: string;
  readonly implementationRef: string;
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

export interface ProbabilisticTransportEvidenceCandidate {
  readonly kind: "probabilistic_transport_evidence_candidate";
  readonly schemaVersion: "5.0.0";
  readonly implementationRef: string;
  readonly inputDigest: Sha256Digest;
  readonly outputDigest: Sha256Digest;
  readonly actorInvocationRef: string;
  readonly actorRef: string;
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
  readonly progressEventCount: number;
  readonly toolCallCount: number;
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
  | ProbabilisticTransportEvidenceCandidate;

export interface AdmittedCCallEvidence {
  readonly kind: "admitted_c_call_evidence";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly evidenceRef: string;
  readonly evidenceDigest: Sha256Digest;
  readonly cCallRef: string;
  readonly evidenceClass: "deterministic" | "probabilistic_transport";
  readonly contractRef: string;
  readonly implementationRef: string;
  readonly inputDigest: Sha256Digest;
  readonly outputDigest: Sha256Digest;
  readonly actorInvocationRef?: string;
  readonly actorRef?: string;
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
  readonly progressEventCount?: number;
  readonly toolCallCount?: number;
  readonly artifactDigests?: ProbabilisticTransportEvidenceCandidate["artifactDigests"];
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
  readonly resultClass: "failure" | "success";
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
  readonly disposition: "blocked";
  readonly cCallRef: string;
  readonly rejectionEvidenceRef: string | null;
  readonly refusalResultRef: string;
  readonly rejectionJudgmentRef: string;
  readonly evidenceEventRef: string | null;
  readonly resultEventRef: string;
  readonly judgmentEventRef: string;
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
  const actorRows = store.readAll().filter(
    (event) => event.aggregateId === candidate.actorInvocationRef,
  );
  const opened = actorRows.find((event) => event.kind === "actor_invocation_started");
  const artifact = actorRows.find(
    (event) => event.kind === "actor_result_artifact_observed",
  );
  const terminal = actorRows.find(
    (event) => event.kind === "actor_invocation_closed" ||
      event.kind === "actor_invocation_failed",
  );
  return opened !== undefined &&
    artifact !== undefined &&
    terminal !== undefined &&
    opened.runId === cCall.runId &&
    opened.parentAggregateId === cCall.cCallRef &&
    isJsonRecord(opened.payload) &&
    opened.payload.actorRef === candidate.actorRef &&
    opened.payload.cCallRef === cCall.cCallRef &&
    artifact.parentAggregateId === cCall.cCallRef &&
    isJsonRecord(artifact.payload) &&
    artifact.payload.cCallRef === cCall.cCallRef &&
    artifact.payload.outputDigest === candidate.artifactDigests.output &&
    artifact.payload.transportDigest === candidate.transportDigest &&
    terminal.causationEventRefs.includes(artifact.eventId) &&
    ((candidate.transportDisposition === "success" &&
      terminal.kind === "actor_invocation_closed") ||
      (candidate.transportDisposition === "failure" &&
        terminal.kind === "actor_invocation_failed"));
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
  const declaredStart = program.starts.find(
    (start) => start.graphFunctionRef === executionBasis.graphFunctionRef,
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
    declaredStart === undefined ||
    stop.programLocusRef !== declaredTerm.programLocusRef ||
    stop.edgeRef !== declaredStart.startRef ||
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

export function admitEvidence(
  store: AbgEventStore,
  cCall: CCall,
  candidate: CCallEvidenceCandidate,
  contractRef: string,
  expectedInputDigest: Sha256Digest,
  basis: RuntimeAdmissionBasis,
): CCallEvidenceAdmissionResult {
  const candidateValue = candidate as unknown as JsonValue;
  const digestPattern = /^sha256:[a-f0-9]{64}$/u;
  const commonValid = candidate.schemaVersion === "5.0.0" &&
    candidate.implementationRef === cCall.implementationRef &&
    candidate.inputDigest === expectedInputDigest &&
    digestPattern.test(candidate.outputDigest);
  const deterministicValid = candidate.kind === "deterministic_evidence_candidate" &&
    cCall.regime === "F_D";
  const probabilisticValid = candidate.kind === "probabilistic_transport_evidence_candidate" &&
    cCall.regime === "F_P" &&
    typeof candidate.actorInvocationRef === "string" && candidate.actorInvocationRef.length > 0 &&
    typeof candidate.actorRef === "string" && candidate.actorRef.length > 0 &&
    typeof candidate.materializationPlanRef === "string" && candidate.materializationPlanRef.length > 0 &&
    typeof candidate.rendererRef === "string" && candidate.rendererRef.length > 0 &&
    candidate.instructionContractRef === cCall.inputContractRef &&
    candidate.resultContractRef === cCall.outputContractRef &&
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
    Number.isSafeInteger(candidate.progressEventCount) && candidate.progressEventCount >= 0 &&
    Number.isSafeInteger(candidate.toolCallCount) && candidate.toolCallCount >= 0 &&
    (candidate.transportLane !== "closed_prompt_proof" || candidate.toolCallCount === 0) &&
    hasAdmittedActorEvidence(store, cCall, candidate);
  if (
    !hasOpenedCCall(store, cCall) ||
    !commonValid ||
    (!deterministicValid && !probabilisticValid) ||
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
  } : {
    cCallRef: cCall.cCallRef,
    evidenceClass: "probabilistic_transport" as const,
    contractRef,
    implementationRef: candidate.implementationRef,
    inputDigest: candidate.inputDigest,
    outputDigest: candidate.outputDigest,
    actorInvocationRef: candidate.actorInvocationRef,
    actorRef: candidate.actorRef,
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
    progressEventCount: candidate.progressEventCount,
    toolCallCount: candidate.toolCallCount,
    artifactDigests: candidate.artifactDigests,
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
    causationEventRefs: [prior.eventId, ...basis.causationEventRefs],
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
  resultClass: AdmittedCCallResult["resultClass"],
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
    judgment: "blocked" as const,
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
