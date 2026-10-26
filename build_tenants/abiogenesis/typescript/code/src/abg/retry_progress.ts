import type { RuntimeEventScan } from "./runtime_history.js";
import { indexedRuntimeEvents, runtimeEventBodiesAtPrefix, validatedRuntimeEventPrefixThroughEvent } from "./event_prefix.js";
import type { RuntimeEventPrefix, ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { isRecord, isNonEmptyJsonString as nonEmptyString } from "../shared/admission_predicates.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { projectCCallPhase, projectCCallRuntimeFailureSignal } from "./c_call.js";
import type { RuntimeEvent } from "./event_store.js";
import {
  constructRuntimeFluent,
  constructScopedRetryFluent,
  deriveRuntimeHeldFluentProjection,
  holdsAt,
  type RuntimeHeldFluentProjection,
} from "./event_calculus.js";
import { projectFhContinuations } from "./fh_continuation_projection.js";
import { projectExactFanOutCompletion } from "./fan_out_projection.js";
import {
  WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
  type WorkerTransportFailureClass,
} from "./transport_contracts.js";

/* The retry progress projection over admitted events, and the two route joins
 * that read it: the structural-identity join the liveness owner composes with
 * its relation, and the judged terminal join. Projections only: nothing here
 * decides an admission, plans a transition or reads the frontier. The retry
 * owner and the liveness owner both import this module, and it imports
 * neither. */

type RetryProgressAdmissionBase = {
  readonly kind: "retry_progress_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly progressRef: string;
  readonly progressDigest: Sha256Digest;
  readonly progressClass: "retry" | "stopped" | "completed";
  readonly retryBoundaryRef: string;
  readonly attemptRef: string;
  readonly attempt: number;
  readonly retryPath: readonly number[];
  readonly admissionEventRef: string;
};

type RetryFailureProgressAdmissionBase = RetryProgressAdmissionBase & {
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
  readonly budget: number;
  readonly failureClass: WorkerTransportFailureClass;
  readonly failureSignalRef: string;
  readonly completedAttempts: readonly number[];
  readonly remainingBudget: number;
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly inputContractRef: string;
};

export type RetryContinuationProgressAdmission = RetryFailureProgressAdmissionBase & {
  readonly progressClass: "retry";
};

export type RetryStoppedProgressAdmission = RetryFailureProgressAdmissionBase & {
  readonly progressClass: "stopped";
  readonly stopReason: "boundary_terminal" | "propagated_inner_stop";
  readonly predecessorProgressRef: string | null;
};

type RetryCompletedProgressAdmissionBase = RetryProgressAdmissionBase & {
  readonly progressClass: "completed";
  readonly completedRetryDepth: number;
  readonly completionClass: RetrySuccessCompletionClass;
  readonly completionWitnessEventRef: string;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: Sha256Digest | null;
  readonly predecessorProgressRef: string | null;
};

export type RetrySuccessCompletionClass =
  | "judged_success"
  | "fan_out_success"
  | "fh_resume_success"
  | "structural_identity_success";

export type RetryCCallCompletedProgressAdmission = RetryCompletedProgressAdmissionBase & {
  readonly completionClass:
    | "judged_success"
    | "fan_out_success"
    | "fh_resume_success";
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
};

export type RetryStructuralCompletedProgressAdmission = RetryCompletedProgressAdmissionBase & {
  readonly completionClass: "structural_identity_success";
};

export type RetryCompletedProgressAdmission =
  | RetryCCallCompletedProgressAdmission
  | RetryStructuralCompletedProgressAdmission;

export type RetryProgressAdmission =
  | RetryContinuationProgressAdmission
  | RetryStoppedProgressAdmission
  | RetryCompletedProgressAdmission;

/** @internal */
export function sameStrings(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

/** @internal */
export function sameNumbers(
  left: readonly number[],
  right: readonly number[],
): boolean {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

const RETRY_CONTINUATION_PROGRESS_KEYS = Object.freeze([
  "attempt", "attemptRef", "budget", "cCallRef", "completedAttempts",
  "failureClass", "failureSignalRef", "inputContractRef", "inputDigest",
  "inputRef", "judgmentRef", "progressClass", "progressDigest", "progressRef",
  "remainingBudget", "resultRef", "retryBoundaryRef", "retryPath",
].sort());
const RETRY_STOPPED_PROGRESS_KEYS = Object.freeze([
  ...RETRY_CONTINUATION_PROGRESS_KEYS,
  "predecessorProgressRef", "stopReason",
].sort());
const COMPLETED_PROGRESS_TERMINAL_KEYS = Object.freeze([
  "attempt", "attemptRef", "cCallRef", "completedRetryDepth",
  "completionClass", "completionWitnessEventRef", "judgmentRef",
  "predecessorProgressRef", "progressClass", "progressDigest", "progressRef",
  "resultRef", "retryBoundaryRef", "retryPath", "sourceCursorDigest",
  "sourceCursorRef",
].sort());
const COMPLETED_PROGRESS_ADVANCE_KEYS = Object.freeze([
  ...COMPLETED_PROGRESS_TERMINAL_KEYS, "targetCursorDigest", "targetCursorRef",
].sort());
const STRUCTURAL_COMPLETED_PROGRESS_ADVANCE_KEYS = Object.freeze([
  "attempt", "attemptRef", "completedRetryDepth", "completionClass",
  "completionWitnessEventRef", "predecessorProgressRef", "progressClass",
  "progressDigest", "progressRef", "retryBoundaryRef", "retryPath",
  "sourceCursorDigest", "sourceCursorRef", "targetCursorDigest",
  "targetCursorRef",
].sort());
function exactPayloadKeys(
  payload: Readonly<Record<string, JsonValue>>,
  expected: readonly string[],
): boolean {
  return sameStrings(Object.keys(payload).sort(), expected);
}

/** @internal */
export function progressBody(
  payload: Readonly<Record<string, JsonValue>>,
): Readonly<Record<string, JsonValue>> | null {
  if (payload.progressClass === "retry") {
    if (!exactPayloadKeys(payload, RETRY_CONTINUATION_PROGRESS_KEYS)) return null;
    const { progressRef: _ref, progressDigest: _digest, ...body } = payload;
    return body;
  }
  if (payload.progressClass === "stopped") {
    if (!exactPayloadKeys(payload, RETRY_STOPPED_PROGRESS_KEYS)) return null;
    const { progressRef: _ref, progressDigest: _digest, ...body } = payload;
    return body;
  }
  if (payload.progressClass !== "completed") return null;
  if (payload.completionClass === "structural_identity_success") {
    if (!exactPayloadKeys(payload, STRUCTURAL_COMPLETED_PROGRESS_ADVANCE_KEYS)) {
      return null;
    }
    const { progressRef: _ref, progressDigest: _digest, ...body } = payload;
    return body;
  }
  if (
    payload.completionClass !== "judged_success" &&
    payload.completionClass !== "fan_out_success" &&
    payload.completionClass !== "fh_resume_success"
  ) return null;
  const terminal = !Object.hasOwn(payload, "targetCursorRef") &&
    !Object.hasOwn(payload, "targetCursorDigest");
  if (!exactPayloadKeys(
    payload,
    terminal ? COMPLETED_PROGRESS_TERMINAL_KEYS : COMPLETED_PROGRESS_ADVANCE_KEYS,
  )) return null;
  const { progressRef: _ref, progressDigest: _digest, ...storedBody } = payload;
  return terminal
    ? { ...storedBody, targetCursorRef: null, targetCursorDigest: null }
    : storedBody;
}

/** @internal */
export function digestValue(value: JsonValue | undefined): value is Sha256Digest {
  return typeof value === "string" && value.startsWith("sha256:");
}

/** @internal */
export function positiveInteger(value: JsonValue | undefined): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

/** @internal */
export function nonNegativeInteger(value: JsonValue | undefined): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

/** @internal */
export function positiveIntegerValues(
  value: JsonValue | undefined,
): readonly number[] | null {
  return Array.isArray(value) && value.length > 0 && value.every(positiveInteger)
    ? value.map(Number)
    : null;
}

/** @internal */
export function stringValues(value: JsonValue | undefined): readonly string[] | null {
  return Array.isArray(value) && value.every(nonEmptyString)
    ? value as readonly string[]
    : null;
}

function sharesProgressScope(
  candidate: RuntimeEvent,
  progress: RuntimeEvent,
): boolean {
  return candidate.workflowVersion === "5.0.0" &&
    candidate.scopeClass === "run" &&
    candidate.basisId === progress.basisId &&
    candidate.runId === progress.runId &&
    candidate.graphFunctionRef === progress.graphFunctionRef &&
    candidate.graphCallId === progress.graphCallId &&
    candidate.frameId === progress.frameId;
}

function exactAttemptEvent(
  prior: RuntimeEventScan,
  progress: RuntimeEvent,
  body: Readonly<Record<string, JsonValue>>,
): RuntimeEvent | null {
  const rows = prior.filter((candidate) =>
    candidate.kind === "retry_attempt_opened" &&
    isRecord(candidate.payload) &&
    candidate.payload.attemptRef === body.attemptRef
  );
  if (rows.length !== 1) return null;
  const event = rows[0]!;
  const payload = event.payload;
  if (!isRecord(payload)) return null;
  const { attemptRef: _ref, attemptDigest: _digest, ...attemptBody } = payload;
  const retryPath = positiveIntegerValues(payload.retryPath);
  const retryTermPath = stringValues(payload.retryTermPath);
  const wrappedTermPath = stringValues(payload.wrappedTermPath);
  const retryable = stringValues(payload.retryableFailureClasses);
  const attemptDigest = sha256Canonical(attemptBody);
  const routeRows = prior.filter((candidate) =>
    candidate.kind === "traversal_route_admitted" &&
    sharesProgressScope(candidate, progress) &&
    isRecord(candidate.payload) &&
    candidate.payload.routeKind === "retry" &&
    candidate.payload.routeRef === payload.priorRouteRef &&
    event.causationEventRefs.includes(candidate.eventId)
  );
  return sharesProgressScope(event, progress) &&
      event.aggregateType === "frame" &&
      event.aggregateId === progress.frameId &&
      event.parentAggregateId === progress.graphCallId &&
      event.materializationRef === progress.materializationRef &&
      nonEmptyString(payload.attemptRef) &&
      digestValue(payload.attemptDigest) &&
      payload.attemptDigest === attemptDigest &&
      payload.attemptRef ===
        `retry-attempt://abiogenesis/${attemptDigest.slice("sha256:".length)}` &&
      payload.retryBoundaryRef === body.retryBoundaryRef &&
      payload.attempt === body.attempt &&
      retryPath !== null && sameNumbers(retryPath, body.retryPath as number[]) &&
      positiveInteger(payload.budget) &&
      Number(payload.attempt) <= Number(payload.budget) &&
      retryTermPath !== null && retryTermPath.length >= 3 &&
      wrappedTermPath !== null &&
      sameStrings(wrappedTermPath, [...retryTermPath, "term"]) &&
      retryable !== null &&
      sameStrings(retryable, WORKER_TRANSPORT_FAILURE_CLASS_VALUES) &&
      (payload.taskOrdinal === null || nonNegativeInteger(payload.taskOrdinal)) &&
      (payload.priorJudgmentRef === null || nonEmptyString(payload.priorJudgmentRef)) &&
      nonEmptyString(payload.priorRouteRef) &&
      event.causationEventRefs.length === 1 && routeRows.length === 1 &&
      event.causationEventRefs[0] === routeRows[0]!.eventId &&
      nonEmptyString(payload.inputRef) && digestValue(payload.inputDigest) &&
      nonEmptyString(payload.inputContractRef) &&
      isRecord(payload.inputValue) &&
      sha256Canonical(payload.inputValue) === payload.inputDigest
    ? event
    : null;
}

function hasHistoricalAttemptCCallDescent(
  events: RuntimeEventScan,
  attemptEvent: RuntimeEvent,
  openedEvent: RuntimeEvent,
): boolean {
  if (
    !isRecord(attemptEvent.payload) || !isRecord(openedEvent.payload) ||
    openedEvent.kind !== "c_call_opened" ||
    openedEvent.payload.attempt !== attemptEvent.payload.attempt ||
    !nonEmptyString(openedEvent.payload.programLocusRef) ||
    !sameNumbers(
      positiveIntegerValues(openedEvent.payload.retryPath) ?? [],
      positiveIntegerValues(attemptEvent.payload.retryPath) ?? [],
    )
  ) return false;
  const attemptPayload = attemptEvent.payload;
  const openedPayload = openedEvent.payload;
  const immediateRoutes = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    openedEvent.causationEventRefs.includes(event.eventId) &&
    event.runId === openedEvent.runId &&
    event.graphCallId === openedEvent.graphCallId &&
    event.frameId === openedEvent.frameId &&
    isRecord(event.payload) &&
    event.payload.targetCursorRef === openedPayload.cursorRef &&
    event.payload.targetCursorDigest === openedPayload.cursorDigest
  );
  const originRoutes = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    attemptEvent.causationEventRefs.includes(event.eventId) &&
    event.runId === attemptEvent.runId &&
    event.graphCallId === attemptEvent.graphCallId &&
    event.frameId === attemptEvent.frameId &&
    isRecord(event.payload) && event.payload.routeKind === "retry" &&
    event.payload.routeRef === attemptPayload.priorRouteRef
  );
  if (immediateRoutes.length !== 1 || originRoutes.length !== 1) return false;
  const origin = originRoutes[0]!;
  const pending = [immediateRoutes[0]!.eventId];
  const visited = new Set<string>();
  const byId = new Map(events.map((event) => [event.eventId, event]));
  while (pending.length !== 0) {
    const eventRef = pending.pop()!;
    if (eventRef === origin.eventId) return true;
    if (visited.has(eventRef)) continue;
    visited.add(eventRef);
    const event = byId.get(eventRef);
    if (event !== undefined) pending.push(...event.causationEventRefs);
  }
  return false;
}

function exactCCallPhaseEvents(
  prefix: RuntimeEventPrefix,
  events: RuntimeEventScan,
  progress: RuntimeEvent,
  cCallRef: string,
  resultRef: string,
  judgmentRef: string,
): Readonly<{
  opened: RuntimeEvent;
  fibre: RuntimeEvent;
  result: RuntimeEvent;
  judgment: RuntimeEvent;
}> | null {
  let phase;
  try {
    phase = projectCCallPhase(prefix, cCallRef);
  } catch {
    return null;
  }
  if (
    phase.phase !== "judged" || phase.fibreEventRef === null ||
    phase.resultEventRef === null ||
    phase.judgmentEventRef === null
  ) return null;
  const opened = events.find((candidate) =>
    candidate.eventId === phase.openedEventRef && candidate.kind === "c_call_opened"
  );
  const fibre = events.find((candidate) =>
    candidate.eventId === phase.fibreEventRef &&
    candidate.kind === "c_call_fibre_selected"
  );
  const result = events.find((candidate) =>
    candidate.eventId === phase.resultEventRef &&
    candidate.kind === "c_call_result_admitted"
  );
  const judgment = events.find((candidate) =>
    candidate.eventId === phase.judgmentEventRef && candidate.kind === "c_call_judged"
  );
  if (
    opened === undefined || fibre === undefined || result === undefined ||
    judgment === undefined || !isRecord(opened.payload) ||
    !isRecord(fibre.payload) || !isRecord(result.payload) ||
    !isRecord(judgment.payload)
  ) return null;
  const resultPayload = result.payload;
  const judgmentPayload = judgment.payload;
  if (
    !sharesProgressScope(opened, progress) ||
    !sharesProgressScope(fibre, progress) ||
    !sharesProgressScope(result, progress) ||
    !sharesProgressScope(judgment, progress) ||
    opened.aggregateType !== "c_call" || opened.aggregateId !== cCallRef ||
    opened.materializationRef !== progress.materializationRef ||
    opened.payload.cCallRef !== cCallRef ||
    fibre.aggregateType !== "c_call" || fibre.aggregateId !== cCallRef ||
    fibre.parentAggregateId !== opened.parentAggregateId ||
    fibre.materializationRef !== progress.materializationRef ||
    fibre.payload.cCallRef !== cCallRef ||
    fibre.causationEventRefs.length !== 1 ||
    fibre.causationEventRefs[0] !== opened.eventId ||
    result.aggregateType !== "c_call" || result.aggregateId !== cCallRef ||
    resultPayload.cCallRef !== cCallRef || resultPayload.resultRef !== resultRef ||
    judgment.aggregateType !== "c_call" || judgment.aggregateId !== cCallRef ||
    judgmentPayload.cCallRef !== cCallRef ||
    judgmentPayload.judgmentRef !== judgmentRef ||
    judgmentPayload.resultRef !== resultRef ||
    judgmentPayload.resultDigest !== resultPayload.resultDigest ||
    !judgment.causationEventRefs.includes(result.eventId)
  ) return null;
  return Object.freeze({ opened, fibre, result, judgment });
}

function hasExactRetryFailureProvenance(
  prefix: RuntimeEventPrefix,
  _events: RuntimeEventScan,
  result: RuntimeEvent,
  judgment: RuntimeEvent,
  failureClass: JsonValue | undefined,
  failureSignalRef: JsonValue | undefined,
): boolean {
  if (
    !WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(
      failureClass as WorkerTransportFailureClass,
    ) ||
    !nonEmptyString(failureSignalRef) ||
    !isRecord(result.payload) || !isRecord(judgment.payload) ||
    result.payload.resultClass !== "failure" ||
    judgment.payload.reasonRef !== failureSignalRef ||
    typeof result.payload.resultRef !== "string" ||
    typeof judgment.payload.judgmentRef !== "string"
  ) return false;
  const signal = projectCCallRuntimeFailureSignal(
    prefix,
    result.aggregateId,
    result.payload.resultRef,
    judgment.payload.judgmentRef,
  );
  return signal !== null && signal.failureClass === failureClass &&
    signal.failureSignalRef === failureSignalRef;
}
function exactSourceCursorEvent(
  prior: RuntimeEventScan,
  cCallEvent: RuntimeEvent,
  sourceCursorRef: JsonValue | undefined,
  sourceCursorDigest: JsonValue | undefined,
): RuntimeEvent | null {
  if (
    !nonEmptyString(sourceCursorRef) || !digestValue(sourceCursorDigest) ||
    !isRecord(cCallEvent.payload) ||
    cCallEvent.payload.cursorRef !== sourceCursorRef ||
    cCallEvent.payload.cursorDigest !== sourceCursorDigest
  ) return null;
  const rows = prior.filter((candidate) => {
    if (!isRecord(candidate.payload)) return false;
    return (candidate.kind === "traversal_cursor_entered" &&
        candidate.payload.cursorRef === sourceCursorRef &&
        candidate.payload.cursorDigest === sourceCursorDigest) ||
      (candidate.kind === "traversal_route_admitted" &&
        candidate.payload.targetCursorRef === sourceCursorRef &&
        candidate.payload.targetCursorDigest === sourceCursorDigest) ||
      (candidate.kind === "fh_interaction_resume_admitted" &&
        candidate.payload.successorCursorRef === sourceCursorRef &&
        candidate.payload.successorCursorDigest === sourceCursorDigest);
  });
  return rows.length === 1 && rows[0]!.admissionOrdinal < cCallEvent.admissionOrdinal
    ? rows[0]!
    : null;
}

function exactCursorCarrierEvent(
  prior: RuntimeEventScan,
  progress: RuntimeEvent,
  sourceCursorRef: JsonValue | undefined,
  sourceCursorDigest: JsonValue | undefined,
  witnessEventRef: JsonValue | undefined,
): RuntimeEvent | null {
  if (
    !nonEmptyString(sourceCursorRef) || !digestValue(sourceCursorDigest) ||
    !nonEmptyString(witnessEventRef)
  ) return null;
  const candidate = prior.find((event) => event.eventId === witnessEventRef);
  if (candidate === undefined || !isRecord(candidate.payload)) return null;
  const candidatePayload = candidate.payload;
  const materializationRef = candidate.kind === "fh_interaction_resume_admitted"
    ? prior.find((event) =>
        event.kind === "fh_interaction_opened" &&
        event.aggregateId === candidate.aggregateId &&
        event.eventId === candidatePayload.openedEventRef
      )?.materializationRef
    : candidate.materializationRef;
  if (
    candidate.workflowVersion !== "5.0.0" ||
    candidate.scopeClass !== "run" || candidate.runId !== progress.runId ||
    candidate.graphCallId !== progress.graphCallId ||
    candidate.frameId !== progress.frameId ||
    materializationRef !== progress.materializationRef
  ) return null;
  const matches = (candidate.kind === "traversal_cursor_entered" &&
      candidate.payload.cursorRef === sourceCursorRef &&
      candidate.payload.cursorDigest === sourceCursorDigest) ||
    (candidate.kind === "traversal_route_admitted" &&
      candidate.payload.targetCursorRef === sourceCursorRef &&
      candidate.payload.targetCursorDigest === sourceCursorDigest) ||
    (candidate.kind === "fh_interaction_resume_admitted" &&
      candidate.payload.successorCursorRef === sourceCursorRef &&
      candidate.payload.successorCursorDigest === sourceCursorDigest);
  return matches ? candidate : null;
}

function exactFanOutCompletionWitness(
  prefix: RuntimeEventPrefix,
  prior: RuntimeEventScan,
  progress: RuntimeEvent,
  body: Readonly<Record<string, JsonValue>>,
  cCallEvent: RuntimeEvent,
  resultEvent: RuntimeEvent,
  judgmentEvent: RuntimeEvent,
): RuntimeEvent | null {
  const witness = prior.find((candidate) =>
    candidate.eventId === body.completionWitnessEventRef &&
    candidate.kind === "fan_out_completion_admitted"
  );
  const projected = typeof body.completionWitnessEventRef === "string"
    ? projectExactFanOutCompletion(prefix, {
        mode: "event_canonical",
        admissionEventRef: body.completionWitnessEventRef,
      })
    : null;
  if (
    witness === undefined || !sharesProgressScope(witness, progress) ||
    !isRecord(witness.payload) || !isRecord(cCallEvent.payload) ||
    !isRecord(resultEvent.payload) || !isRecord(judgmentEvent.payload) ||
    projected?.kind !== "fan_out_completion_admission" ||
    projected.completionKind !== "complete_vector" ||
    projected.taskRows.length === 0
  ) return null;
  const lastRow = projected.taskRows.at(-1)!;
  return lastRow.cCallRef === body.cCallRef &&
      lastRow.resultRef === body.resultRef &&
      lastRow.judgmentRef === body.judgmentRef &&
      cCallEvent.payload.batchRef === projected.batchRef &&
      resultEvent.payload.resultClass === "success" &&
      judgmentEvent.payload.judgment === "advance" &&
      witness.causationEventRefs.includes(judgmentEvent.eventId)
    ? witness
    : null;
}

function exactFhResumeCompletionWitness(
  prefix: RuntimeEventPrefix,
  calculus: RuntimeHeldFluentProjection,
  authorityPrefix: RuntimeEventPrefix,
  body: Readonly<Record<string, JsonValue>>,
  cCallEvent: RuntimeEvent,
  fibreEvent: RuntimeEvent,
  resultEvent: RuntimeEvent,
  judgmentEvent: RuntimeEvent,
): RuntimeEvent | null {
  if (
    !isRecord(cCallEvent.payload) || !isRecord(fibreEvent.payload) ||
    !isRecord(resultEvent.payload) || !isRecord(judgmentEvent.payload) ||
    fibreEvent.payload.cCallRef !== body.cCallRef ||
    fibreEvent.payload.callClass !== "leaf" ||
    fibreEvent.payload.regime !== "F_H" ||
    resultEvent.payload.resultClass !== "pending" ||
    judgmentEvent.payload.judgment !== "pending"
  ) return null;
  const continuation = projectFhContinuations(
    prefix,
    calculus,
    authorityPrefix,
  ).find((row) =>
    row.status === "resolved" &&
    row.cCallRef === body.cCallRef &&
    row.resumedEventRef === body.completionWitnessEventRef &&
    row.successorCursorRef === body.sourceCursorRef &&
    row.successorCursorDigest === body.sourceCursorDigest
  );
  if (continuation === undefined || continuation.resumedEventRef === null) {
    return null;
  }
  return indexedRuntimeEvents(prefix, "id:" + continuation.resumedEventRef).find((event) =>
    event.kind === "fh_interaction_resume_admitted" &&
    event.eventId === continuation.resumedEventRef
  ) ?? null;
}

function projectRetryProgressAt(
  prefix: RuntimeEventPrefix,
  events: RuntimeEventScan,
  eventIndex: number,
  visiting: ReadonlySet<string>,
  authorityPrefix: RuntimeEventPrefix,
): RetryProgressAdmission | null {
  const event = events.at(eventIndex);
  if (
    event?.kind !== "retry_progress_recorded" ||
    event.runId === undefined || event.graphCallId === undefined ||
    event.frameId === undefined || event.graphFunctionRef === undefined ||
    event.materializationRef === undefined || !isRecord(event.payload) ||
    event.workflowVersion !== "5.0.0" || event.scopeClass !== "run" ||
    event.aggregateType !== "frame" || event.aggregateId !== event.frameId ||
    event.parentAggregateId !== event.graphCallId ||
    visiting.has(event.eventId)
  ) return null;
  const body = progressBody(event.payload);
  if (body === null ||
    typeof event.payload.progressDigest !== "string" ||
    typeof event.payload.progressRef !== "string") return null;
  const digest = sha256Canonical(body);
  const progressRef =
    `retry-progress://abiogenesis/${digest.slice("sha256:".length)}`;
  if (event.payload.progressDigest !== digest || event.payload.progressRef !== progressRef) {
    return null;
  }
  const attemptRef = body.attemptRef;
  const structuralCompletion =
    body.completionClass === "structural_identity_success";
  const cCallRef = nonEmptyString(body.cCallRef) ? body.cCallRef : null;
  const resultRef = nonEmptyString(body.resultRef) ? body.resultRef : null;
  const judgmentRef = nonEmptyString(body.judgmentRef)
    ? body.judgmentRef
    : null;
  const retryPath = positiveIntegerValues(body.retryPath);
  if (
    !nonEmptyString(attemptRef) ||
    (!structuralCompletion &&
      (cCallRef === null || resultRef === null || judgmentRef === null)) ||
    !nonEmptyString(body.retryBoundaryRef) ||
    !positiveInteger(body.attempt) ||
    retryPath === null || body.attempt !== retryPath.at(-1) || eventIndex === 0
  ) return null;
  const prior = events.slice(0, eventIndex);
  const priorPrefix = validatedRuntimeEventPrefixThroughEvent(
    prefix,
    events.at(eventIndex - 1)!.eventId,
  );
  let priorAuthorityPrefix: RuntimeEventPrefix;
  try {
    priorAuthorityPrefix = validatedRuntimeEventPrefixThroughEvent(
      authorityPrefix,
      events.at(eventIndex - 1)!.eventId,
    );
  } catch {
    return null;
  }
  const priorCalculus = deriveRuntimeHeldFluentProjection(priorPrefix);
  const attemptEvent = exactAttemptEvent(prior, event, body);
  const phase = structuralCompletion || cCallRef === null ||
      resultRef === null || judgmentRef === null
    ? null
    : exactCCallPhaseEvents(
        priorPrefix,
        prior,
        event,
        cCallRef,
        resultRef,
        judgmentRef,
      );
  const cCallEvent = phase?.opened ?? null;
  const fibreEvent = phase?.fibre ?? null;
  const resultEvent = phase?.result ?? null;
  const judgmentEvent = phase?.judgment ?? null;
  const cCallPayload = cCallEvent !== null && isRecord(cCallEvent.payload)
    ? cCallEvent.payload
    : null;
  const resultPayload = resultEvent !== null && isRecord(resultEvent.payload)
    ? resultEvent.payload
    : null;
  const judgmentPayload = judgmentEvent !== null && isRecord(judgmentEvent.payload)
    ? judgmentEvent.payload
    : null;
  if (
    attemptEvent === null ||
    event.causationEventRefs.length !== 2 ||
    event.causationEventRefs[0] !== attemptEvent.eventId ||
    (!structuralCompletion && (
      cCallEvent === null || fibreEvent === null || resultEvent === null ||
      judgmentEvent === null || cCallPayload === null || resultPayload === null ||
      judgmentPayload === null ||
      cCallPayload.cCallRef !== cCallRef ||
      resultPayload.resultRef !== resultRef ||
      judgmentPayload.judgmentRef !== judgmentRef
    )) ||
    !holdsAt(
      priorCalculus,
      constructScopedRetryFluent("retry_attempt_active", {
        runId: event.runId,
        graphCallId: event.graphCallId,
        frameId: event.frameId,
        retryBoundaryRef: body.retryBoundaryRef as string,
        authorityRef: attemptRef,
      }),
    )
  ) return null;

  const failureProgress = event.payload.progressClass === "retry" ||
    event.payload.progressClass === "stopped";
  const propagatedStop = event.payload.progressClass === "stopped" &&
    body.stopReason === "propagated_inner_stop";
  const directCCallOwnership = !propagatedStop &&
    !structuralCompletion &&
    (failureProgress || body.predecessorProgressRef === null);
  const callRetryPath = cCallPayload === null
    ? null
    : positiveIntegerValues(cCallPayload.retryPath);
  if (directCCallOwnership) {
    if (cCallPayload === null || cCallRef === null) return null;
    if (
      callRetryPath === null ||
      (cCallPayload.taskOrdinal !== null &&
        !nonNegativeInteger(cCallPayload.taskOrdinal)) ||
      !positiveInteger(cCallPayload.attempt) ||
      !nonEmptyString(cCallPayload.programLocusRef) ||
      cCallPayload.attempt !== body.attempt ||
      !sameNumbers(callRetryPath, retryPath) ||
      cCallEvent === null ||
      !hasHistoricalAttemptCCallDescent(prior, attemptEvent, cCallEvent)
    ) return null;
  }

  if (failureProgress) {
    if (
      cCallPayload === null || resultPayload === null ||
      judgmentPayload === null || cCallRef === null ||
      resultRef === null || judgmentRef === null ||
      resultEvent === null || judgmentEvent === null
    ) return null;
    const completedAttempts = positiveIntegerValues(body.completedAttempts);
    const expectedAttempts = Array.from(
      { length: Number(body.attempt) },
      (_, index) => index + 1,
    );
    const priorFailureProgresses = prior.flatMap((candidate, index) => {
      if (
        candidate.kind !== "retry_progress_recorded" ||
        !isRecord(candidate.payload) ||
        candidate.payload.retryBoundaryRef !== body.retryBoundaryRef ||
        candidate.payload.progressClass !== "retry"
      ) return [];
      const projected = projectRetryProgressAt(
        prefix,
        events,
        index,
        new Set([...visiting, event.eventId]),
        authorityPrefix,
      );
      return projected?.progressClass === "retry" ? [projected] : [];
    });
    const immediatelyPrecedingFailure = priorFailureProgresses.at(-1);
    const stationary = immediatelyPrecedingFailure?.failureSignalRef ===
      body.failureSignalRef;
    const budgetExhausted = Number(body.attempt) >= Number(body.budget);
    const stopped = event.payload.progressClass === "stopped";
    if (
      !positiveInteger(body.budget) ||
      completedAttempts === null ||
      !sameNumbers(completedAttempts, expectedAttempts) ||
      !nonNegativeInteger(body.remainingBudget) ||
      body.remainingBudget !==
        Math.max(0, Number(body.budget) - Number(body.attempt)) ||
      !WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(
        body.failureClass as WorkerTransportFailureClass,
      ) ||
      !nonEmptyString(body.failureSignalRef) ||
      !nonEmptyString(body.inputRef) || !digestValue(body.inputDigest) ||
      !nonEmptyString(body.inputContractRef) ||
      !isRecord(attemptEvent.payload) ||
      attemptEvent.payload.budget !== body.budget ||
      attemptEvent.payload.inputRef !== body.inputRef ||
      attemptEvent.payload.inputDigest !== body.inputDigest ||
      attemptEvent.payload.inputContractRef !== body.inputContractRef ||
      !hasExactRetryFailureProvenance(
        priorPrefix,
        prior,
        resultEvent,
        judgmentEvent,
        body.failureClass,
        body.failureSignalRef,
      ) ||
      callRetryPath === null ||
      (stopped
        ? body.stopReason !== "boundary_terminal" &&
          body.stopReason !== "propagated_inner_stop"
        : Object.hasOwn(body, "stopReason") ||
          Object.hasOwn(body, "predecessorProgressRef"))
    ) return null;
    if (!propagatedStop) {
      if (
        judgmentPayload.judgment !== (stopped ? "blocked" : "retry") ||
        judgmentPayload.retryAttemptRef !== attemptRef ||
        event.causationEventRefs[1] !== judgmentEvent.eventId ||
        (stopped
          ? body.stopReason !== "boundary_terminal" ||
            body.predecessorProgressRef !== null ||
            (!budgetExhausted && !stationary)
          : budgetExhausted || stationary)
      ) return null;
    } else {
      const predecessorIndex = prior.findIndex((candidate) =>
        candidate.eventId === event.causationEventRefs[1]
      );
      const predecessor = predecessorIndex < 0 ? null : projectRetryProgressAt(
        prefix,
        events,
        predecessorIndex,
        new Set([...visiting, event.eventId]),
        authorityPrefix,
      );
      if (
        judgmentPayload.judgment !== "blocked" ||
        !nonEmptyString(body.predecessorProgressRef) ||
        predecessorIndex !== eventIndex - 1 ||
        predecessor?.progressClass !== "stopped" ||
        predecessor.progressRef !== body.predecessorProgressRef ||
        predecessor.retryBoundaryRef === body.retryBoundaryRef ||
        predecessor.cCallRef !== cCallRef ||
        predecessor.resultRef !== resultRef ||
        predecessor.judgmentRef !== judgmentRef ||
        predecessor.failureClass !== body.failureClass ||
        predecessor.failureSignalRef !== body.failureSignalRef ||
        !sameNumbers(predecessor.retryPath.slice(0, -1), retryPath) ||
        !sameNumbers(callRetryPath.slice(0, retryPath.length), retryPath) ||
        callRetryPath.length <= retryPath.length
      ) return null;
    }
  } else {
    const completionClass = body.completionClass;
    if (
      completionClass !== "judged_success" &&
      completionClass !== "fan_out_success" &&
      completionClass !== "fh_resume_success" &&
      completionClass !== "structural_identity_success"
    ) return null;
    let sourceCursorEvent: RuntimeEvent | null = null;
    let completionWitness: RuntimeEvent | null = null;
    if (completionClass === "structural_identity_success") {
      sourceCursorEvent = exactCursorCarrierEvent(
        prior,
        event,
        body.sourceCursorRef,
        body.sourceCursorDigest,
        body.completionWitnessEventRef,
      );
      completionWitness = sourceCursorEvent;
    } else {
      if (
        cCallEvent === null || fibreEvent === null || resultEvent === null ||
        judgmentEvent === null || cCallPayload === null || resultPayload === null ||
        judgmentPayload === null || cCallRef === null || resultRef === null ||
        judgmentRef === null
      ) return null;
      if (completionClass === "fh_resume_success") {
        completionWitness = exactFhResumeCompletionWitness(
          priorPrefix,
          priorCalculus,
          priorAuthorityPrefix,
          body,
          cCallEvent,
          fibreEvent,
          resultEvent,
          judgmentEvent,
        );
        sourceCursorEvent = completionWitness;
      } else {
        sourceCursorEvent = exactSourceCursorEvent(
          prior,
          cCallEvent,
          body.sourceCursorRef,
          body.sourceCursorDigest,
        );
        completionWitness = completionClass === "fan_out_success"
          ? exactFanOutCompletionWitness(
              priorPrefix,
              prior,
              event,
              body,
              cCallEvent,
              resultEvent,
              judgmentEvent,
            )
          : body.completionWitnessEventRef === judgmentEvent.eventId &&
              resultPayload.resultClass === "success" &&
              judgmentPayload.judgment === "advance"
            ? judgmentEvent
            : null;
      }
    }
    const targetPairValid =
      (body.targetCursorRef === null && body.targetCursorDigest === null) ||
      (nonEmptyString(body.targetCursorRef) && digestValue(body.targetCursorDigest));
    if (
      !positiveInteger(body.completedRetryDepth) ||
      body.completedRetryDepth !== retryPath.length ||
      sourceCursorEvent === null || completionWitness === null ||
      !targetPairValid ||
      (completionClass === "structural_identity_success" &&
        (body.targetCursorRef === null || body.targetCursorDigest === null)) ||
      !holdsAt(
        priorCalculus,
        constructRuntimeFluent({
          name: "locus_active",
          identity: body.sourceCursorRef as string,
        }),
      ) ||
      (body.predecessorProgressRef !== null &&
        !nonEmptyString(body.predecessorProgressRef))
    ) return null;
    if (body.predecessorProgressRef === null) {
      if (
        (completionClass !== "structural_identity_success" &&
          judgmentPayload?.retryAttemptRef !== attemptRef) ||
        event.causationEventRefs[1] !== completionWitness.eventId
      ) return null;
    } else {
      const predecessorIndex = prior.findIndex((candidate) =>
        candidate.eventId === event.causationEventRefs[1]
      );
      const predecessor = predecessorIndex < 0 ? null : projectRetryProgressAt(
        prefix,
        events,
        predecessorIndex,
        new Set([...visiting, event.eventId]),
        authorityPrefix,
      );
      if (
        predecessorIndex !== eventIndex - 1 ||
        predecessor?.progressClass !== "completed" ||
        predecessor.progressRef !== body.predecessorProgressRef ||
        predecessor.completedRetryDepth !== Number(body.completedRetryDepth) + 1 ||
        predecessor.retryBoundaryRef === body.retryBoundaryRef ||
        predecessor.completionClass !== completionClass ||
        predecessor.completionWitnessEventRef !==
          body.completionWitnessEventRef ||
        (completionClass === "structural_identity_success"
          ? "cCallRef" in predecessor
          : !("cCallRef" in predecessor) ||
            predecessor.cCallRef !== cCallRef ||
            predecessor.resultRef !== resultRef ||
            predecessor.judgmentRef !== judgmentRef) ||
        predecessor.sourceCursorRef !== body.sourceCursorRef ||
        predecessor.sourceCursorDigest !== body.sourceCursorDigest ||
        predecessor.targetCursorRef !== body.targetCursorRef ||
        predecessor.targetCursorDigest !== body.targetCursorDigest ||
        !sameNumbers(predecessor.retryPath.slice(0, -1), retryPath)
      ) return null;
    }
  }
  return deepFreeze({
    kind: "retry_progress_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    progressRef,
    progressDigest: digest,
    ...body,
    admissionEventRef: event.eventId,
  }) as unknown as RetryProgressAdmission;
}

/** @internal */
export function projectAdmittedRetryProgress(
  prefix: RuntimeEventPrefix,
  admissionEventRef: string,
  authorityPrefix: RuntimeEventPrefix = prefix,
): RetryProgressAdmission | null {
  try {
    const historicalPrefix = validatedRuntimeEventPrefixThroughEvent(
      prefix,
      admissionEventRef,
    );
    const historicalAuthorityPrefix = validatedRuntimeEventPrefixThroughEvent(
      authorityPrefix,
      admissionEventRef,
    );
    const events = runtimeEventBodiesAtPrefix(historicalPrefix);
    const eventIndex = events.findIndex((event) =>
      event.eventId === admissionEventRef
    );
    return eventIndex < 0
      ? null
      : projectRetryProgressAt(
          historicalPrefix,
          events,
          eventIndex,
          new Set(),
          historicalAuthorityPrefix,
        );
  } catch {
    return null;
  }
}

/** @internal Exact existing completed-progress join for a structural route's
 * frame observation. This is not a general transitive-causation predicate. */
export function hasStructuralIdentityCompletedRouteCausation(
  prefix: ValidatedRuntimeEventPrefix,
  route: RuntimeEvent,
  source: RuntimeEvent,
): boolean;
/** @internal */
export function hasStructuralIdentityCompletedRouteCausation(
  prefix: RuntimeEventPrefix,
  route: RuntimeEvent,
  source: RuntimeEvent,
): boolean;
export function hasStructuralIdentityCompletedRouteCausation(
  prefix: RuntimeEventPrefix,
  route: RuntimeEvent,
  source: RuntimeEvent,
): boolean {
  const payload = route.payload;
  if (route.kind !== "traversal_route_admitted" || !isRecord(payload) ||
      payload.routeKind !== "advance" || payload.cCallRef !== null ||
      payload.judgmentRef !== null || payload.contractRef !== null ||
      !Array.isArray(payload.consumedAvailabilityRefs) ||
      payload.consumedAvailabilityRefs.length === 0) return false;
  runtimeEventBodiesAtPrefix(prefix);
  let previous: RetryCompletedProgressAdmission | null = null;
  const progressEvents: RuntimeEvent[] = [];
  for (const ref of payload.consumedAvailabilityRefs) {
    const matches = indexedRuntimeEvents(prefix, "payload:progressRef:" + ref).filter(event => event.kind === "retry_progress_recorded" &&
      isRecord(event.payload) && event.payload.progressRef === ref &&
      event.admissionOrdinal < route.admissionOrdinal);
    if (matches.length !== 1) return false;
    const event = matches[0]!;
    const progress = projectAdmittedRetryProgress(prefix, event.eventId);
    if (progress?.progressClass !== "completed" ||
        progress.completionClass !== "structural_identity_success" ||
        "cCallRef" in progress ||
        progress.completionWitnessEventRef !== source.eventId ||
        progress.sourceCursorRef !== payload.sourceCursorRef ||
        progress.sourceCursorDigest !== payload.sourceCursorDigest ||
        progress.targetCursorRef !== payload.targetCursorRef ||
        progress.targetCursorDigest !== payload.targetCursorDigest ||
        progress.predecessorProgressRef !== (previous?.progressRef ?? null) ||
        previous !== null && progress.completedRetryDepth !== previous.completedRetryDepth - 1 ||
        event.runId !== route.runId || event.graphCallId !== route.graphCallId ||
        event.frameId !== route.frameId || event.basisId !== route.basisId ||
        event.graphFunctionRef !== route.graphFunctionRef ||
        event.materializationRef !== route.materializationRef) return false;
    previous = progress;
    progressEvents.push(event);
  }
  // The existing route owner uses last progress first, then the earlier chain
  // in reverse order. Any separately authorized additional causes stay intact.
  return progressEvents.reverse().every((event, index) =>
    route.causationEventRefs[index] === event.eventId);
}

/** @internal R10's exact judged terminal producer, through the existing retry
 * progress authentication owner. No arbitrary transitive ancestry is accepted. */
export function hasJudgedTerminalRouteCausation(
  prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent, judgment: RuntimeEvent,
  authorityPrefix?: ValidatedRuntimeEventPrefix ,
): boolean;
/** @internal */
export function hasJudgedTerminalRouteCausation(
  prefix: RuntimeEventPrefix, route: RuntimeEvent, judgment: RuntimeEvent,
  authorityPrefix?: RuntimeEventPrefix ,
): boolean;
export function hasJudgedTerminalRouteCausation(
  prefix: RuntimeEventPrefix, route: RuntimeEvent, judgment: RuntimeEvent,
  authorityPrefix: RuntimeEventPrefix = prefix,
): boolean {
  const payload = route.payload, source = judgment.payload;
  if (route.kind !== "traversal_route_admitted" || !isRecord(payload) ||
      payload.routeKind !== "terminal" || judgment.kind !== "c_call_judged" ||
      !isRecord(source) || source.judgment !== "advance" ||
      payload.cCallRef !== judgment.aggregateId || payload.judgmentRef !== source.judgmentRef ||
      !Array.isArray(payload.consumedAvailabilityRefs) || payload.consumedAvailabilityRefs[0] !== source.judgmentRef ||
      judgment.runId !== route.runId || judgment.graphCallId !== route.graphCallId ||
      judgment.frameId !== route.frameId || judgment.basisId !== route.basisId) return false;
  const refs = payload.consumedAvailabilityRefs.slice(1);
  if (refs.length === 0) return route.causationEventRefs.includes(judgment.eventId);
  runtimeEventBodiesAtPrefix(prefix);
  let previous: RetryCompletedProgressAdmission | null = null;
  const progressEvents: RuntimeEvent[] = [];
  for (const ref of refs) {
    const matches = indexedRuntimeEvents(prefix, "payload:progressRef:" + ref).filter(event => event.kind === "retry_progress_recorded" &&
      isRecord(event.payload) && event.payload.progressRef === ref && event.admissionOrdinal < route.admissionOrdinal);
    if (matches.length !== 1) return false;
    const event = matches[0]!, progress = projectAdmittedRetryProgress(prefix, event.eventId, authorityPrefix);
    if (progress?.progressClass !== "completed" || progress.completionClass !== "judged_success" ||
        progress.cCallRef !== payload.cCallRef || progress.judgmentRef !== source.judgmentRef ||
        progress.resultRef !== source.resultRef || progress.completionWitnessEventRef !== judgment.eventId ||
        progress.sourceCursorRef !== payload.sourceCursorRef || progress.sourceCursorDigest !== payload.sourceCursorDigest ||
        progress.targetCursorRef !== payload.targetCursorRef || progress.targetCursorDigest !== payload.targetCursorDigest ||
        progress.predecessorProgressRef !== (previous?.progressRef ?? null) ||
        previous !== null && progress.completedRetryDepth !== previous.completedRetryDepth - 1 ||
        event.runId !== route.runId || event.graphCallId !== route.graphCallId || event.frameId !== route.frameId ||
        event.basisId !== route.basisId || event.graphFunctionRef !== route.graphFunctionRef ||
        event.materializationRef !== route.materializationRef) return false;
    previous = progress; progressEvents.push(event);
  }
  return progressEvents.reverse().every((event, index) => route.causationEventRefs[index] === event.eventId);
}
