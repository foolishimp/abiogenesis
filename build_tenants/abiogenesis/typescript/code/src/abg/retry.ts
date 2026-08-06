import type { GtlGraph } from "../gtl/contracts.js";
import { isExecutableCLeaf } from "../gtl/c_algebra.js";
import {
  deriveCContinuationTarget,
  resolveEnclosingCRetryContexts,
  resolveCProgramTermAtSourcePath,
  type CEnclosingRetryContext,
} from "../gtl/source_path.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  AdmittedCCallRuntimeFailureClose,
  AdmittedCCallJudgment,
  AdmittedCCallResult,
  CCall,
  CCallRuntimeFailureSource,
} from "./c_call.js";
import {
  admitPlannedCCallRuntimeFailureClose,
  hasCurrentAdmittedCCallOutcome,
  isCCallRuntimeFailureCloseError,
  planCCallRuntimeFailureClose,
  projectCCallPhase,
  projectCCallRuntimeFailureSignal,
} from "./c_call.js";
import {
  hasAdmittedExecutionBasis,
  rehydrateExecutionBasis,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventTransactionAtExpectedPrefix,
  compareAndAppendExpectedPrefix,
  type RuntimeEvent,
} from "./event_store.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  type RuntimeEventCalculusProjection,
} from "./event_calculus.js";
import {
  hasExactRetryCompletionOwnership,
  selectExactRetryAttemptEvent,
} from "./retry_lifecycle.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  validatedRuntimeEventPrefixThroughEvent,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  hasAdmittedTraversalCursor,
  isTraversalCursorCandidate,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";
import {
  WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
  type WorkerTransportFailureClass,
} from "./transport_contracts.js";

export {
  WORKER_TRANSPORT_FAILURE_CLASS_VALUES as RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES,
  type WorkerTransportFailureClass as RetryableRuntimeFailureClass,
} from "./transport_contracts.js";

export interface RetryInputBasis {
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly inputContractRef: string;
  readonly inputValue: Readonly<Record<string, JsonValue>>;
}

export interface RetryEligibility {
  readonly kind: "retry_eligibility";
  readonly schemaVersion: "5.0.0";
  readonly disposition:
    | "retry"
    | "budget_exhausted"
    | "not_in_retry"
    | "not_retryable"
    | "replay_gap"
    | "stationary";
  readonly retryBoundaryRef: string | null;
  readonly retryTermPath: readonly string[];
  readonly wrappedTermPath: readonly string[];
  readonly attempt: number;
  readonly budget: number;
  readonly remainingBudget: number;
  readonly failureClass: WorkerTransportFailureClass;
  readonly failureSignalRef: string;
  readonly completedAttempts: readonly number[];
  readonly priorProgressRefs: readonly string[];
}

export interface RetryAttemptAdmission {
  readonly kind: "retry_attempt_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly attemptRef: string;
  readonly attemptDigest: Sha256Digest;
  readonly retryBoundaryRef: string;
  readonly retryTermPath: readonly string[];
  readonly wrappedTermPath: readonly string[];
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly retryPath: readonly number[];
  readonly budget: number;
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly inputContractRef: string;
  readonly inputValue: Readonly<Record<string, JsonValue>>;
  readonly retryableFailureClasses: readonly WorkerTransportFailureClass[];
  readonly priorJudgmentRef: string | null;
  readonly priorRouteRef: string;
  readonly admissionEventRef: string;
}

interface RetryProgressAdmissionBase {
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
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
  readonly admissionEventRef: string;
}

interface RetryFailureProgressAdmissionBase
  extends RetryProgressAdmissionBase {
  readonly budget: number;
  readonly failureClass: WorkerTransportFailureClass;
  readonly failureSignalRef: string;
  readonly completedAttempts: readonly number[];
  readonly remainingBudget: number;
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly inputContractRef: string;
}

export interface RetryContinuationProgressAdmission
  extends RetryFailureProgressAdmissionBase {
  readonly progressClass: "retry";
}

export interface RetryStoppedProgressAdmission
  extends RetryFailureProgressAdmissionBase {
  readonly progressClass: "stopped";
  readonly stopReason: "boundary_terminal" | "propagated_inner_stop";
  readonly predecessorProgressRef: string | null;
}

export interface RetryCompletedProgressAdmission
  extends RetryProgressAdmissionBase {
  readonly progressClass: "completed";
  readonly completedRetryDepth: number;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: Sha256Digest | null;
  readonly predecessorProgressRef: string | null;
}

export type RetryProgressAdmission =
  | RetryContinuationProgressAdmission
  | RetryStoppedProgressAdmission
  | RetryCompletedProgressAdmission;

export interface RetryAdmissionRefusal {
  readonly kind: "retry_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "attempt_mismatch"
    | "basis_mismatch"
    | "cursor_mismatch"
    | "judgment_mismatch"
    | "progress_mismatch"
    | "retry_not_declared"
    | "route_mismatch";
  readonly message: string;
}

export type RetryAttemptAdmissionResult =
  | RetryAttemptAdmission
  | RetryAdmissionRefusal;

export interface RetryRuntimeFailureTransitionAdmission {
  readonly kind: "retry_runtime_failure_transition_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "blocked" | "retry";
  readonly close: AdmittedCCallRuntimeFailureClose;
  readonly progress:
    | RetryContinuationProgressAdmission
    | RetryStoppedProgressAdmission;
  readonly stoppedProgresses: readonly RetryStoppedProgressAdmission[];
  readonly eligibility: RetryEligibility;
}

export type RetryRuntimeFailureTransitionResult =
  | RetryRuntimeFailureTransitionAdmission
  | RetryAdmissionRefusal;

function refusal(
  code: RetryAdmissionRefusal["code"],
  message: string,
): RetryAdmissionRefusal {
  return {
    kind: "retry_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function isExpectedPrefixMismatch(error: unknown): boolean {
  return error instanceof TypeError &&
    error.message ===
      "runtime event append requires the exact expected immutable prefix";
}

function isRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameStrings(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return left.join("\0") === right.join("\0");
}

function sameNumbers(
  left: readonly number[],
  right: readonly number[],
): boolean {
  return left.join("\0") === right.join("\0");
}

function contextForCursor(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
): CEnclosingRetryContext | null | RetryAdmissionRefusal {
  const contexts = resolveEnclosingCRetryContexts(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if ("kind" in contexts) {
    return refusal("retry_not_declared", contexts.message);
  }
  const context = contexts.at(-1);
  if (context === undefined) return null;
  if (
    context.retryDepth !== cursor.retryPath.length ||
    cursor.attempt !== cursor.retryPath.at(-1)
  ) {
    return refusal(
      "cursor_mismatch",
      "retry cursor coordinates differ from the exact enclosing GTL retry path",
    );
  }
  return context;
}

function retryBoundaryRef(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
  context: CEnclosingRetryContext,
): string {
  const digest = sha256Canonical({
    graphRef: graph.materializationRef,
    frameId: cursor.frameId,
    nodeRef: cursor.currentNodeRef,
    retryTermPath: context.retryTermPath,
  });
  return `retry-boundary://abiogenesis/${digest.slice("sha256:".length)}`;
}

export interface RetryLifecycleProjection {
  readonly eventCalculus: RuntimeEventCalculusProjection;
  readonly events: readonly RuntimeEvent[];
  readonly attempts: readonly RuntimeEvent[];
  readonly progress: readonly RuntimeEvent[];
}

export function projectRetryLifecycle(
  prefix: ValidatedRuntimeEventPrefix,
  runId: string,
  graphCallId: string,
  frameId: string,
  boundaryRef: string,
): RetryLifecycleProjection {
  const eventCalculus = deriveRuntimeEventCalculusProjection(prefix);
  const allEvents = runtimeEventsFromValidatedPrefix(prefix);
  const events = allEvents.filter((event) =>
    event.aggregateType === "frame" &&
    event.runId === runId &&
    event.graphCallId === graphCallId &&
    event.frameId === frameId &&
    event.aggregateId === frameId &&
    isRecord(event.payload) &&
    event.payload.retryBoundaryRef === boundaryRef
  );
  return {
    eventCalculus,
    events: allEvents,
    attempts: events.filter((event) => event.kind === "retry_attempt_opened"),
    progress: events.filter((event) => event.kind === "retry_progress_recorded"),
  };
}

export function projectDeclaredCRetryFrontier(
  prefix: ValidatedRuntimeEventPrefix,
  runId: string,
  graphCallId: string,
  frameId: string,
  boundaryRef: string,
): RetryLifecycleProjection {
  return projectRetryLifecycle(
    prefix,
    runId,
    graphCallId,
    frameId,
    boundaryRef,
  );
}

function deriveRetryAttemptCursor(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  event: RuntimeEvent,
): TraversalCursorCandidate | null {
  if (
    event.kind !== "retry_attempt_opened" ||
    event.aggregateType !== "frame" ||
    event.runId === undefined || event.graphCallId === undefined ||
    event.frameId === undefined || event.basisId === undefined ||
    event.materializationRef !== graph.materializationRef ||
    event.graphFunctionRef !== graph.graphFunctionRef ||
    event.causationEventRefs.length !== 1 || !isRecord(event.payload)
  ) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const payload = event.payload;
  const wrappedTermPath = stringValues(payload.wrappedTermPath);
  const retryPath = positiveIntegerValues(payload.retryPath);
  if (
    wrappedTermPath === null || wrappedTermPath[0] !== "node" ||
    !nonEmptyString(wrappedTermPath[1]) || retryPath === null ||
    !positiveInteger(payload.attempt) ||
    payload.attempt !== retryPath.at(-1) ||
    !nonEmptyString(payload.inputRef) || !digestValue(payload.inputDigest) ||
    (payload.taskOrdinal !== null && !nonNegativeInteger(payload.taskOrdinal))
  ) return null;
  const routeRows = events.filter((candidate) =>
    candidate.eventId === event.causationEventRefs[0] &&
    candidate.kind === "traversal_route_admitted" &&
    candidate.admissionOrdinal < event.admissionOrdinal &&
    candidate.runId === event.runId &&
    candidate.graphCallId === event.graphCallId &&
    candidate.frameId === event.frameId &&
    candidate.materializationRef === graph.materializationRef &&
    isRecord(candidate.payload) &&
    candidate.payload.routeKind === "retry" &&
    candidate.payload.routeRef === payload.priorRouteRef &&
    candidate.payload.judgmentRef === payload.priorJudgmentRef
  );
  const initialRows = events.filter((candidate) =>
    candidate.kind === "traversal_cursor_entered" &&
    candidate.admissionOrdinal < event.admissionOrdinal &&
    candidate.runId === event.runId &&
    candidate.graphCallId === event.graphCallId &&
    candidate.frameId === event.frameId &&
    candidate.basisId === event.basisId && isRecord(candidate.payload) &&
    nonEmptyString(candidate.payload.programRef) &&
    nonEmptyString(candidate.payload.traversalScopeRef)
  );
  if (routeRows.length !== 1 || initialRows.length !== 1) return null;
  const route = routeRows[0]!;
  const initial = initialRows[0]!.payload as Readonly<Record<string, JsonValue>>;
  const body = {
    programRef: initial.programRef as string,
    executionBasisRef: event.basisId,
    traversalScopeRef: initial.traversalScopeRef as string,
    runId: event.runId,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    graphRef: graph.materializationRef,
    inputRef: payload.inputRef as string,
    inputDigest: payload.inputDigest as Sha256Digest,
    currentNodeRef: wrappedTermPath[1]!,
    position: "at_term" as const,
    termPath: wrappedTermPath,
    taskOrdinal: payload.taskOrdinal as number | null,
    attempt: Number(payload.attempt),
    retryPath,
  };
  const cursorDigest = sha256Canonical(body as unknown as JsonValue);
  const cursor = deepFreeze({
    kind: "traversal_cursor" as const,
    schemaVersion: "5.0.0" as const,
    cursorRef:
      `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...body,
  });
  return isRecord(route.payload) &&
      route.payload.targetCursorRef === cursor.cursorRef &&
      route.payload.targetCursorDigest === cursor.cursorDigest &&
      isTraversalCursorCandidate(cursor)
    ? cursor
    : null;
}

export function projectRetryAttempt(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  attemptIdentity: string,
): RetryAttemptAdmission | null {
  if (!isMaterializedGtlGraph(graph) || attemptIdentity.length === 0) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const matches = events.filter((event) =>
    event.kind === "retry_attempt_opened" && isRecord(event.payload) &&
    (event.eventId === attemptIdentity ||
      event.payload.attemptRef === attemptIdentity)
  );
  if (matches.length !== 1) return null;
  const event = matches[0]!;
  const cursor = deriveRetryAttemptCursor(prefix, graph, event);
  if (cursor === null || !isRecord(event.payload)) return null;
  const context = contextForCursor(graph, cursor);
  if (context === null || (typeof context === "object" && "kind" in context)) {
    return null;
  }
  const payload = event.payload;
  const retryTermPath = stringValues(payload.retryTermPath);
  const wrappedTermPath = stringValues(payload.wrappedTermPath);
  const retryable = stringValues(payload.retryableFailureClasses);
  if (
    event.aggregateId !== cursor.frameId ||
    event.parentAggregateId !== cursor.graphCallId ||
    event.basisId !== cursor.executionBasisRef ||
    !nonEmptyString(payload.attemptRef) || !digestValue(payload.attemptDigest) ||
    payload.retryBoundaryRef !== retryBoundaryRef(graph, cursor, context) ||
    payload.attempt !== cursor.attempt ||
    payload.taskOrdinal !== cursor.taskOrdinal || payload.budget !== context.budget ||
    retryTermPath === null || !sameStrings(retryTermPath, context.retryTermPath) ||
    wrappedTermPath === null || !sameStrings(wrappedTermPath, context.wrappedTermPath) ||
    retryable === null ||
    !sameStrings(retryable, WORKER_TRANSPORT_FAILURE_CLASS_VALUES) ||
    !nonEmptyString(payload.priorRouteRef) ||
    (payload.priorJudgmentRef !== null && !nonEmptyString(payload.priorJudgmentRef)) ||
    payload.inputRef !== cursor.inputRef || payload.inputDigest !== cursor.inputDigest ||
    payload.inputContractRef !== context.inputCarrierRef ||
    !isRecord(payload.inputValue) ||
    sha256Canonical(payload.inputValue) !== payload.inputDigest
  ) return null;
  const { attemptRef: _attemptRef, attemptDigest: _attemptDigest, ...attemptBody } =
    payload;
  const computedAttemptDigest = sha256Canonical(
    attemptBody as unknown as JsonValue,
  );
  if (
    payload.attemptDigest !== computedAttemptDigest ||
    payload.attemptRef !==
      `retry-attempt://abiogenesis/${computedAttemptDigest.slice("sha256:".length)}`
  ) return null;
  const { attemptRef, attemptDigest, ...body } = payload;
  return deepFreeze({
    kind: "retry_attempt_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    attemptRef,
    attemptDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as unknown as RetryAttemptAdmission;
}

export function projectActiveRetryAttempt(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
): RetryAttemptAdmission | null {
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalCursorCandidate(cursor)
  ) {
    return null;
  }
  const lifecycle = deriveRuntimeEventCalculusProjection(prefix);
  const projected = runtimeEventsFromValidatedPrefix(prefix)
    .filter((event) => event.kind === "retry_attempt_opened")
    .filter((event) => {
      const derived = deriveRetryAttemptCursor(prefix, graph, event);
      return derived?.cursorRef === cursor.cursorRef &&
        derived.cursorDigest === cursor.cursorDigest;
    })
    .map((event) => projectRetryAttempt(prefix, graph, event.eventId))
    .filter((value): value is RetryAttemptAdmission => value !== null);
  if (
    projected.length !== 1 ||
    !holdsAt(
      lifecycle,
      constructRuntimeFluent({
        name: "retry_attempt_active",
        identity: projected[0]!.attemptRef,
      }),
    )
  ) {
    return null;
  }
  return projected[0]!;
}

function positiveNumberArray(value: JsonValue | undefined): readonly number[] {
  return Array.isArray(value) &&
      value.every((row) => Number.isSafeInteger(row) && Number(row) > 0)
    ? value.map(Number)
    : [];
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
  "attempt", "attemptRef", "cCallRef", "completedRetryDepth", "judgmentRef",
  "predecessorProgressRef", "progressClass", "progressDigest", "progressRef",
  "resultRef", "retryBoundaryRef", "retryPath", "sourceCursorDigest",
  "sourceCursorRef",
].sort());
const COMPLETED_PROGRESS_ADVANCE_KEYS = Object.freeze([
  ...COMPLETED_PROGRESS_TERMINAL_KEYS, "targetCursorDigest", "targetCursorRef",
].sort());
function exactPayloadKeys(
  payload: Readonly<Record<string, JsonValue>>,
  expected: readonly string[],
): boolean {
  return sameStrings(Object.keys(payload).sort(), expected);
}

function progressBody(
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

function nonEmptyString(value: JsonValue | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

function digestValue(value: JsonValue | undefined): value is Sha256Digest {
  return typeof value === "string" && value.startsWith("sha256:");
}

function positiveInteger(value: JsonValue | undefined): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function nonNegativeInteger(value: JsonValue | undefined): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function positiveIntegerValues(
  value: JsonValue | undefined,
): readonly number[] | null {
  return Array.isArray(value) && value.length > 0 && value.every(positiveInteger)
    ? value.map(Number)
    : null;
}

function stringValues(value: JsonValue | undefined): readonly string[] | null {
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
  prior: readonly RuntimeEvent[],
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
  const payload = event.payload as Readonly<Record<string, JsonValue>>;
  const { attemptRef: _ref, attemptDigest: _digest, ...attemptBody } = payload;
  const retryPath = positiveIntegerValues(payload.retryPath);
  const retryTermPath = stringValues(payload.retryTermPath);
  const wrappedTermPath = stringValues(payload.wrappedTermPath);
  const retryable = stringValues(payload.retryableFailureClasses);
  const attemptDigest = sha256Canonical(attemptBody as unknown as JsonValue);
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

function exactCCallPhaseEvents(
  prefix: ValidatedRuntimeEventPrefix,
  events: readonly RuntimeEvent[],
  progress: RuntimeEvent,
  cCallRef: string,
  resultRef: string,
  judgmentRef: string,
): Readonly<{
  opened: RuntimeEvent;
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
    phase.phase !== "judged" || phase.resultEventRef === null ||
    phase.judgmentEventRef === null
  ) return null;
  const opened = events.find((candidate) =>
    candidate.eventId === phase.openedEventRef && candidate.kind === "c_call_opened"
  );
  const result = events.find((candidate) =>
    candidate.eventId === phase.resultEventRef &&
    candidate.kind === "c_call_result_admitted"
  );
  const judgment = events.find((candidate) =>
    candidate.eventId === phase.judgmentEventRef && candidate.kind === "c_call_judged"
  );
  if (
    opened === undefined || result === undefined || judgment === undefined ||
    !isRecord(opened.payload) || !isRecord(result.payload) ||
    !isRecord(judgment.payload)
  ) return null;
  const resultPayload = result.payload as Readonly<Record<string, JsonValue>>;
  const judgmentPayload = judgment.payload as Readonly<Record<string, JsonValue>>;
  if (
    !sharesProgressScope(opened, progress) ||
    !sharesProgressScope(result, progress) ||
    !sharesProgressScope(judgment, progress) ||
    opened.aggregateType !== "c_call" || opened.aggregateId !== cCallRef ||
    opened.materializationRef !== progress.materializationRef ||
    opened.payload.cCallRef !== cCallRef ||
    result.aggregateType !== "c_call" || result.aggregateId !== cCallRef ||
    resultPayload.cCallRef !== cCallRef || resultPayload.resultRef !== resultRef ||
    judgment.aggregateType !== "c_call" || judgment.aggregateId !== cCallRef ||
    judgmentPayload.cCallRef !== cCallRef ||
    judgmentPayload.judgmentRef !== judgmentRef ||
    judgmentPayload.resultRef !== resultRef ||
    judgmentPayload.resultDigest !== resultPayload.resultDigest ||
    !judgment.causationEventRefs.includes(result.eventId)
  ) return null;
  return Object.freeze({ opened, result, judgment });
}

function hasExactRetryFailureProvenance(
  prefix: ValidatedRuntimeEventPrefix,
  _events: readonly RuntimeEvent[],
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
  prior: readonly RuntimeEvent[],
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

function projectRetryProgressAt(
  prefix: ValidatedRuntimeEventPrefix,
  events: readonly RuntimeEvent[],
  eventIndex: number,
  visiting: ReadonlySet<string>,
): RetryProgressAdmission | null {
  const event = events[eventIndex];
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
  const digest = sha256Canonical(body as unknown as JsonValue);
  const progressRef =
    `retry-progress://abiogenesis/${digest.slice("sha256:".length)}`;
  if (event.payload.progressDigest !== digest || event.payload.progressRef !== progressRef) {
    return null;
  }
  const attemptRef = body.attemptRef;
  const cCallRef = body.cCallRef;
  const resultRef = body.resultRef;
  const judgmentRef = body.judgmentRef;
  const retryPath = positiveIntegerValues(body.retryPath);
  if (
    !nonEmptyString(attemptRef) || !nonEmptyString(cCallRef) ||
    !nonEmptyString(resultRef) || !nonEmptyString(judgmentRef) ||
    !nonEmptyString(body.retryBoundaryRef) ||
    !positiveInteger(body.attempt) ||
    retryPath === null || body.attempt !== retryPath.at(-1) || eventIndex === 0
  ) return null;
  const prior = events.slice(0, eventIndex);
  const priorPrefix = validatedRuntimeEventPrefixThroughEvent(
    prefix,
    events[eventIndex - 1]!.eventId,
  );
  const priorCalculus = deriveRuntimeEventCalculusProjection(priorPrefix);
  const attemptEvent = exactAttemptEvent(prior, event, body);
  const phase = exactCCallPhaseEvents(
    priorPrefix,
    prior,
    event,
    cCallRef,
    resultRef,
    judgmentRef,
  );
  const cCallEvent = phase?.opened ?? null;
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
    attemptEvent === null || cCallEvent === null ||
    resultEvent === null || judgmentEvent === null ||
    cCallPayload === null || resultPayload === null || judgmentPayload === null ||
    event.causationEventRefs.length !== 2 ||
    event.causationEventRefs[0] !== attemptEvent.eventId ||
    cCallPayload.cCallRef !== cCallRef ||
    resultPayload.resultRef !== resultRef ||
    judgmentPayload.judgmentRef !== judgmentRef ||
    !holdsAt(
      priorCalculus,
      constructRuntimeFluent({ name: "retry_attempt_active", identity: attemptRef }),
    )
  ) return null;

  const failureProgress = event.payload.progressClass === "retry" ||
    event.payload.progressClass === "stopped";
  const propagatedStop = event.payload.progressClass === "stopped" &&
    body.stopReason === "propagated_inner_stop";
  const directCCallOwnership = !propagatedStop &&
    (failureProgress || body.predecessorProgressRef === null);
  const callRetryPath = positiveIntegerValues(cCallPayload.retryPath);
  if (directCCallOwnership) {
    const exactOwnedAttempt = callRetryPath === null ||
        (cCallPayload.taskOrdinal !== null &&
          !nonNegativeInteger(cCallPayload.taskOrdinal)) ||
        !positiveInteger(cCallPayload.attempt) ||
        !nonEmptyString(cCallPayload.programLocusRef)
      ? null
      : selectExactRetryAttemptEvent(prior, {
          cCallRef,
          runId: event.runId,
          graphCallId: event.graphCallId,
          frameId: event.frameId,
          taskOrdinal: cCallPayload.taskOrdinal as number | null,
          attempt: Number(cCallPayload.attempt),
          retryPath: callRetryPath,
          programLocusRef: cCallPayload.programLocusRef,
        });
    if (
      cCallPayload.attempt !== body.attempt ||
      callRetryPath === null ||
      !sameNumbers(callRetryPath, retryPath) ||
      exactOwnedAttempt?.eventId !== attemptEvent.eventId
    ) return null;
  }

  if (failureProgress) {
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
    const sourceCursorEvent = exactSourceCursorEvent(
      prior,
      cCallEvent,
      body.sourceCursorRef,
      body.sourceCursorDigest,
    );
    const targetPairValid =
      (body.targetCursorRef === null && body.targetCursorDigest === null) ||
      (nonEmptyString(body.targetCursorRef) && digestValue(body.targetCursorDigest));
    if (
      judgmentPayload.judgment !== "advance" ||
      resultPayload.resultClass !== "success" ||
      !positiveInteger(body.completedRetryDepth) ||
      body.completedRetryDepth !== retryPath.length ||
      sourceCursorEvent === null || !targetPairValid ||
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
        judgmentPayload.retryAttemptRef !== attemptRef ||
        event.causationEventRefs[1] !== judgmentEvent.eventId
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
      );
      if (
        predecessorIndex !== eventIndex - 1 ||
        predecessor?.progressClass !== "completed" ||
        predecessor.progressRef !== body.predecessorProgressRef ||
        predecessor.completedRetryDepth !== Number(body.completedRetryDepth) + 1 ||
        predecessor.retryBoundaryRef === body.retryBoundaryRef ||
        predecessor.cCallRef !== cCallRef || predecessor.resultRef !== resultRef ||
        predecessor.judgmentRef !== judgmentRef ||
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

export function projectAdmittedRetryProgress(
  prefix: ValidatedRuntimeEventPrefix,
  admissionEventRef: string,
): RetryProgressAdmission | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const eventIndex = events.findIndex((event) => event.eventId === admissionEventRef);
  return eventIndex < 0
    ? null
    : projectRetryProgressAt(prefix, events, eventIndex, new Set());
}

export function hasAdmittedRetryProgress(
  prefix: ValidatedRuntimeEventPrefix,
  value: RetryProgressAdmission,
): boolean {
  const projected = projectAdmittedRetryProgress(prefix, value.admissionEventRef);
  if (projected === null ||
    sha256Canonical(projected as unknown as JsonValue) !==
      sha256Canonical(value as unknown as JsonValue)) return false;
  return holdsAt(
    deriveRuntimeEventCalculusProjection(prefix),
    constructRuntimeFluent({
      name: "retry_progress_available",
      identity: value.progressRef,
    }),
  );
}

export function admitRetryAttempt(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
  inputValue: Readonly<Record<string, JsonValue>>,
  routeAdmissionEventRef: string,
  basis: RuntimeAdmissionBasis,
): RetryAttemptAdmissionResult {
  if (
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    executionBasis.graphRef !== graph.materializationRef ||
    executionBasis.basisRef !== cursor.executionBasisRef
  ) {
    return refusal(
      "basis_mismatch",
      "retry attempt requires the exact admitted execution basis and GTL Graph",
    );
  }
  if (!hasAdmittedTraversalCursor(store, cursor)) {
    return refusal(
      "cursor_mismatch",
      "retry attempt requires the admitted target cursor of one retry route",
    );
  }
  if (
    !isRecord(inputValue as unknown as JsonValue) ||
    sha256Canonical(inputValue as unknown as JsonValue) !== cursor.inputDigest
  ) {
    return refusal(
      "cursor_mismatch",
      "retry attempt input value differs from the admitted cursor input digest",
    );
  }
  const context = contextForCursor(graph, cursor);
  if (context === null || (typeof context === "object" && "kind" in context)) {
    return context ??
      refusal("retry_not_declared", "cursor has no enclosing declared C.retry term");
  }
  const snapshot = store.readAll();
  const prefix = selectValidatedRuntimeEventPrefix(snapshot);
  const applicableRoutes = runtimeEventsFromValidatedPrefix(prefix).filter(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.runId === cursor.runId &&
      event.graphCallId === cursor.graphCallId &&
      event.frameId === cursor.frameId,
  );
  const routeEvent = applicableRoutes.find(
    (event) => event.eventId === routeAdmissionEventRef,
  );
  if (
    applicableRoutes.at(-1)?.eventId !== routeAdmissionEventRef ||
    routeEvent?.kind !== "traversal_route_admitted" ||
    !isRecord(routeEvent.payload) ||
    routeEvent.payload.routeKind !== "retry" ||
    routeEvent.payload.targetCursorRef !== cursor.cursorRef ||
    routeEvent.payload.targetCursorDigest !== cursor.cursorDigest
  ) {
    return refusal(
      "route_mismatch",
      "retry attempt must extend the exact admitted retry route",
    );
  }
  if (
    cursor.attempt < 1 ||
    cursor.attempt > context.budget ||
    context.retryDepth !== cursor.retryPath.length
  ) {
    return refusal(
      "attempt_mismatch",
      "retry attempt is outside the declared positive budget",
    );
  }
  const boundaryRef = retryBoundaryRef(graph, cursor, context);
  const body = {
    retryBoundaryRef: boundaryRef,
    retryTermPath: context.retryTermPath,
    wrappedTermPath: context.wrappedTermPath,
    taskOrdinal: context.taskOrdinal,
    attempt: cursor.attempt,
    retryPath: cursor.retryPath,
    budget: context.budget,
    retryableFailureClasses: WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
    priorJudgmentRef: routeEvent.payload.judgmentRef,
    priorRouteRef: routeEvent.payload.routeRef,
    inputRef: cursor.inputRef,
    inputDigest: cursor.inputDigest,
    inputContractRef: context.inputCarrierRef,
    inputValue: deepFreeze(inputValue),
  };
  const attemptDigest = sha256Canonical(body as unknown as JsonValue);
  const attemptRef =
    `retry-attempt://abiogenesis/${attemptDigest.slice("sha256:".length)}`;
  const lifecycle = projectRetryLifecycle(
    prefix,
    cursor.runId,
    cursor.graphCallId,
    cursor.frameId,
    boundaryRef,
  );
  if (
    lifecycle.attempts.some((event) =>
      isRecord(event.payload) &&
      (
        event.payload.attemptRef === attemptRef ||
        event.payload.attempt === cursor.attempt
      )
    )
  ) {
    return refusal(
      "attempt_mismatch",
      "the exact retry attempt is already admitted",
    );
  }
  let event: RuntimeEvent;
  try {
    event = compareAndAppendExpectedPrefix(
      store,
      sha256Canonical(snapshot as unknown as JsonValue),
      [() => ({
        kind: "retry_attempt_opened",
        eventTime: basis.eventTime,
        aggregateType: "frame",
        aggregateId: cursor.frameId,
        parentAggregateId: cursor.graphCallId,
        causationEventRefs: [routeAdmissionEventRef],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId: executionBasis.basisRef,
        runId: cursor.runId,
        graphFunctionRef: executionBasis.graphFunctionRef,
        materializationRef: graph.materializationRef,
        graphCallId: cursor.graphCallId,
        frameId: cursor.frameId,
        payload: { attemptRef, attemptDigest, ...body } as unknown as JsonValue,
      })],
    )[0]!;
  } catch (error) {
    if (isExpectedPrefixMismatch(error)) {
      return refusal(
        "attempt_mismatch",
        "retry attempt authority changed after immutable-prefix validation",
      );
    }
    throw error;
  }
  const admission = deepFreeze({
    kind: "retry_attempt_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    attemptRef,
    attemptDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as RetryAttemptAdmission;
  return admission;
}

export function projectRetryEligibility(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
  failureClass: WorkerTransportFailureClass,
  failureSignalRef: string,
): RetryEligibility {
  const context = contextForCursor(graph, cursor);
  if (
    context === null ||
    (typeof context === "object" && "kind" in context)
  ) {
    return deepFreeze({
      kind: "retry_eligibility",
      schemaVersion: "5.0.0",
      disposition: "not_in_retry",
      retryBoundaryRef: null,
      retryTermPath: [],
      wrappedTermPath: [],
      attempt: cursor.attempt,
      budget: 0,
      remainingBudget: 0,
      failureClass,
      failureSignalRef,
      completedAttempts: [],
      priorProgressRefs: [],
    }) as RetryEligibility;
  }
  const boundaryRef = retryBoundaryRef(graph, cursor, context);
  const lifecycle = projectRetryLifecycle(
    prefix,
    cursor.runId,
    cursor.graphCallId,
    cursor.frameId,
    boundaryRef,
  );
  const rows = lifecycle.progress
    .map((event) => projectAdmittedRetryProgress(prefix, event.eventId))
    .filter((progress): progress is RetryProgressAdmission =>
      progress !== null && progress.retryBoundaryRef === boundaryRef
    );
  const attempts = rows
    .map((progress) => progress.attempt)
    .sort((left, right) => left - right);
  const expectedPrior = Array.from(
    { length: Math.max(0, cursor.attempt - 1) },
    (_, index) => index + 1,
  );
  const projectedAttempts = lifecycle.attempts
    .map((event) => projectRetryAttempt(prefix, graph, event.eventId))
    .filter((attempt): attempt is RetryAttemptAdmission => attempt !== null);
  const admittedAttemptCoverage = projectedAttempts.map((attempt) =>
    attempt.attempt
  );
  const expectedAttemptCoverage = [...expectedPrior, cursor.attempt];
  const currentAttempts = projectedAttempts.filter((attempt) =>
    attempt.attempt === cursor.attempt &&
    sameNumbers(attempt.retryPath, cursor.retryPath)
  );
  const currentAttemptRef = currentAttempts.length === 1
    ? currentAttempts[0]!.attemptRef
    : null;
  const currentAttemptIsActive = currentAttemptRef !== null && holdsAt(
    lifecycle.eventCalculus,
    constructRuntimeFluent({
      name: "retry_attempt_active",
      identity: currentAttemptRef,
    }),
  );
  const immediatelyPrecedingFailure = rows.at(-1);
  const stationary = immediatelyPrecedingFailure?.progressClass === "retry" &&
    immediatelyPrecedingFailure.failureSignalRef === failureSignalRef;
  const retryable = WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(failureClass);
  const disposition: RetryEligibility["disposition"] =
    !sameNumbers(admittedAttemptCoverage, expectedAttemptCoverage) ||
      !sameNumbers(attempts, expectedPrior) ||
      !currentAttemptIsActive
      ? "replay_gap"
      : !retryable
        ? "not_retryable"
        : stationary
          ? "stationary"
          : cursor.attempt >= context.budget
            ? "budget_exhausted"
            : "retry";
  return deepFreeze({
    kind: "retry_eligibility" as const,
    schemaVersion: "5.0.0" as const,
    disposition,
    retryBoundaryRef: boundaryRef,
    retryTermPath: context.retryTermPath,
    wrappedTermPath: context.wrappedTermPath,
    attempt: cursor.attempt,
    budget: context.budget,
    remainingBudget: Math.max(0, context.budget - cursor.attempt),
    failureClass,
    failureSignalRef,
    completedAttempts: [...attempts, cursor.attempt],
    priorProgressRefs: rows.map((progress) => progress.progressRef),
  }) as RetryEligibility;
}

function retryRuntimeFailureTransitionError(message: string): TypeError {
  return new TypeError(`retry runtime failure transition refusal: ${message}`);
}

export function admitRetryRuntimeFailureTransition(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
  retryInput: RetryInputBasis,
  cCall: CCall,
  source: CCallRuntimeFailureSource,
  failureCandidate: JsonValue,
  failureValueKind: string,
  basis: RuntimeAdmissionBasis,
): RetryRuntimeFailureTransitionResult {
  const snapshot = store.readAll();
  const expectedPrefixDigest = sha256Canonical(snapshot as unknown as JsonValue);
  const prefix = selectValidatedRuntimeEventPrefix(snapshot);
  const projectedBasis = rehydrateExecutionBasis(
    store,
    executionBasis.basisRef,
  );
  const projectedAttempt = projectActiveRetryAttempt(prefix, graph, cursor);
  const declaredTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if (
    !isMaterializedGtlGraph(graph) ||
    projectedBasis === null ||
    sha256Canonical(projectedBasis as unknown as JsonValue) !==
      sha256Canonical(executionBasis as unknown as JsonValue) ||
    projectedAttempt === null ||
    declaredTerm.kind === "c_source_path_refusal" ||
    !isExecutableCLeaf(declaredTerm) ||
    executionBasis.basisRef !== cursor.executionBasisRef ||
    executionBasis.basisRef !== cCall.basisId ||
    executionBasis.graphRef !== graph.materializationRef ||
    executionBasis.graphDigest !== graph.materializationDigest ||
    cursor.graphRef !== graph.materializationRef ||
    cCall.graphFunctionRef !== executionBasis.graphFunctionRef ||
    cCall.programLocusRef !== declaredTerm.programLocusRef ||
    cCall.stageRole !== declaredTerm.stageRole ||
    cCall.regime !== declaredTerm.fibre ||
    cCall.armId !== declaredTerm.armId ||
    cCall.compositionRef !== declaredTerm.compositionRef ||
    cCall.vectorIndex !== declaredTerm.vectorIndex ||
    cCall.implementationBindingRef !==
      declaredTerm.requirement.implementationBindingRef ||
    cCall.inputContractRef !== declaredTerm.requirement.inputContractRef ||
    cCall.outputContractRef !== declaredTerm.requirement.outputContractRef ||
    cCall.evidenceContractRef !== declaredTerm.requirement.evidenceContractRef ||
    cCall.failureContractRef !== declaredTerm.requirement.failureContractRef ||
    cCall.refusalContractRef !== declaredTerm.requirement.refusalContractRef ||
    cCall.judgmentContractRef !== declaredTerm.requirement.judgmentContractRef ||
    cCall.judgmentPredicateRef !== declaredTerm.judgmentPredicateRef
  ) {
    return refusal(
      "basis_mismatch",
      "runtime failure transition requires the exact admitted basis, graph, and cursor",
    );
  }
  const plan = planCCallRuntimeFailureClose(
    store,
    prefix,
    graph,
    cCall,
    source,
    failureCandidate,
    failureValueKind,
  );
  if (plan.kind !== "c_call_runtime_failure_close_plan") {
    return refusal("judgment_mismatch", plan.message);
  }
  const eligibility = projectRetryEligibility(
    prefix,
    graph,
    cursor,
    plan.signal.failureClass,
    plan.signal.failureSignalRef,
  );
  const disposition = eligibility.disposition === "retry"
    ? "retry" as const
    : eligibility.disposition === "stationary" ||
        eligibility.disposition === "budget_exhausted"
      ? "blocked" as const
      : null;
  if (disposition === null || eligibility.retryBoundaryRef === null) {
    return refusal(
      "progress_mismatch",
      "runtime failure transition requires one exact bounded retry eligibility",
    );
  }
  if (
    cCall.frameId !== cursor.frameId ||
    cCall.graphCallId !== cursor.graphCallId ||
    cCall.attempt !== cursor.attempt ||
    !sameNumbers(cCall.retryPath, cursor.retryPath)
  ) {
    return refusal(
      "attempt_mismatch",
      "runtime failure CCall differs from the current retry coordinate",
    );
  }
  const lifecycle = projectRetryLifecycle(
    prefix,
    cursor.runId,
    cursor.graphCallId,
    cursor.frameId,
    eligibility.retryBoundaryRef,
  );
  const attemptRows = lifecycle.attempts.filter((event) =>
    isRecord(event.payload) && event.payload.attempt === cursor.attempt &&
    sameNumbers(positiveNumberArray(event.payload.retryPath), cursor.retryPath)
  );
  const attemptEvent = attemptRows.length === 1 ? attemptRows[0] : undefined;
  if (
    attemptEvent === undefined || !isRecord(attemptEvent.payload) ||
    typeof attemptEvent.payload.attemptRef !== "string" ||
    retryInput.inputRef !== attemptEvent.payload.inputRef ||
    retryInput.inputDigest !== attemptEvent.payload.inputDigest ||
    retryInput.inputContractRef !== attemptEvent.payload.inputContractRef ||
    !isRecord(attemptEvent.payload.inputValue) ||
    sha256Canonical(attemptEvent.payload.inputValue) !==
      attemptEvent.payload.inputDigest ||
    sha256Canonical(retryInput.inputValue as unknown as JsonValue) !==
      retryInput.inputDigest ||
    sha256Canonical(retryInput.inputValue as unknown as JsonValue) !==
      sha256Canonical(attemptEvent.payload.inputValue) ||
    !holdsAt(lifecycle.eventCalculus, constructRuntimeFluent({
      name: "retry_attempt_active",
      identity: attemptEvent.payload.attemptRef,
    }))
  ) {
    return refusal(
      "attempt_mismatch",
      "runtime failure transition requires the exact active retry attempt",
    );
  }
  const enclosingContexts = resolveEnclosingCRetryContexts(
    graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if ("kind" in enclosingContexts) {
    return refusal("attempt_mismatch", enclosingContexts.message);
  }
  const stoppedCascadeAttempts = disposition === "blocked"
    ? enclosingContexts.slice(0, -1).reverse().map((context) => {
        const path = cursor.retryPath.slice(0, context.retryDepth);
        const boundaryRef = retryBoundaryRef(graph, cursor, context);
        const rows = projectRetryLifecycle(
          prefix,
          cursor.runId,
          cursor.graphCallId,
          cursor.frameId,
          boundaryRef,
        ).attempts.filter((event) =>
          isRecord(event.payload) &&
          event.payload.attempt === path.at(-1) &&
          sameNumbers(positiveNumberArray(event.payload.retryPath), path)
        );
        return rows.length === 1 && isRecord(rows[0]!.payload)
          ? { context, event: rows[0]!, path }
          : null;
      })
    : [];
  if (stoppedCascadeAttempts.some((value) => value === null)) {
    return refusal(
      "attempt_mismatch",
      "blocked retry transition requires every exited enclosing retry attempt",
    );
  }
  const body = {
    progressClass: disposition === "retry"
      ? "retry" as const
      : "stopped" as const,
    ...(disposition === "blocked"
      ? {
          stopReason: "boundary_terminal" as const,
          predecessorProgressRef: null,
        }
      : {}),
    retryBoundaryRef: eligibility.retryBoundaryRef,
    attemptRef: attemptEvent.payload.attemptRef,
    attempt: cursor.attempt,
    retryPath: cursor.retryPath,
    budget: eligibility.budget,
    failureClass: plan.signal.failureClass,
    failureSignalRef: plan.signal.failureSignalRef,
    completedAttempts: eligibility.completedAttempts,
    remainingBudget: eligibility.remainingBudget,
    cCallRef: cCall.cCallRef,
    inputRef: attemptEvent.payload.inputRef as string,
    inputDigest: attemptEvent.payload.inputDigest as Sha256Digest,
    inputContractRef: attemptEvent.payload.inputContractRef as string,
  };
  try {
    return admitRuntimeEventTransactionAtExpectedPrefix(
      store,
      expectedPrefixDigest,
      () => {
        const close = admitPlannedCCallRuntimeFailureClose(
          store,
          graph,
          cCall,
          source,
          failureCandidate,
          plan,
          disposition,
          basis,
        );
        const progressBody = {
          ...body,
          resultRef: close.result.resultRef,
          judgmentRef: close.judgment.judgmentRef,
        };
        const progressDigest = sha256Canonical(
          progressBody as unknown as JsonValue,
        );
        const progressRef =
          `retry-progress://abiogenesis/${progressDigest.slice("sha256:".length)}`;
        const progressEvent = admitRuntimeEvent(store, {
          kind: "retry_progress_recorded",
          eventTime: basis.eventTime,
          aggregateType: "frame",
          aggregateId: cursor.frameId,
          parentAggregateId: cursor.graphCallId,
          causationEventRefs: [
            attemptEvent.eventId,
            close.judgment.admissionEventRef,
          ],
          correlationId: basis.correlationId,
          workflowVersion: "5.0.0",
          scopeClass: "run",
          basisId: cCall.basisId,
          runId: cCall.runId,
          graphFunctionRef: cCall.graphFunctionRef,
          materializationRef: graph.materializationRef,
          graphCallId: cCall.graphCallId,
          frameId: cCall.frameId,
          payload: { progressRef, progressDigest, ...progressBody },
        });
        const progress = deepFreeze({
          kind: "retry_progress_admission" as const,
          schemaVersion: "5.0.0" as const,
          disposition: "admitted" as const,
          progressRef,
          progressDigest,
          ...progressBody,
          admissionEventRef: progressEvent.eventId,
        }) as RetryContinuationProgressAdmission | RetryStoppedProgressAdmission;
        const stoppedProgresses: RetryStoppedProgressAdmission[] = [];
        if (disposition === "blocked") {
          stoppedProgresses.push(progress as RetryStoppedProgressAdmission);
          let predecessorEvent = progressEvent;
          for (const cascade of stoppedCascadeAttempts) {
            if (cascade === null || !isRecord(cascade.event.payload)) {
              throw retryRuntimeFailureTransitionError(
                "stopped cascade attempt disappeared",
              );
            }
            const attempt = cascade.path.at(-1)!;
            const cascadeBody = {
              progressClass: "stopped" as const,
              stopReason: "propagated_inner_stop" as const,
              predecessorProgressRef: stoppedProgresses.at(-1)!.progressRef,
              retryBoundaryRef: retryBoundaryRef(
                graph,
                cursor,
                cascade.context,
              ),
              attemptRef: cascade.event.payload.attemptRef as string,
              attempt,
              retryPath: cascade.path,
              budget: cascade.context.budget,
              failureClass: plan.signal.failureClass,
              failureSignalRef: plan.signal.failureSignalRef,
              completedAttempts: Array.from(
                { length: attempt },
                (_, index) => index + 1,
              ),
              remainingBudget: Math.max(0, cascade.context.budget - attempt),
              cCallRef: cCall.cCallRef,
              inputRef: cascade.event.payload.inputRef as string,
              inputDigest: cascade.event.payload.inputDigest as Sha256Digest,
              inputContractRef: cascade.event.payload.inputContractRef as string,
              resultRef: close.result.resultRef,
              judgmentRef: close.judgment.judgmentRef,
            };
            const cascadeDigest = sha256Canonical(
              cascadeBody as unknown as JsonValue,
            );
            const cascadeRef =
              `retry-progress://abiogenesis/${cascadeDigest.slice("sha256:".length)}`;
            const cascadeEvent = admitRuntimeEvent(store, {
              kind: "retry_progress_recorded",
              eventTime: basis.eventTime,
              aggregateType: "frame",
              aggregateId: cursor.frameId,
              parentAggregateId: cursor.graphCallId,
              causationEventRefs: [
                cascade.event.eventId,
                predecessorEvent.eventId,
              ],
              correlationId: basis.correlationId,
              workflowVersion: "5.0.0",
              scopeClass: "run",
              basisId: cCall.basisId,
              runId: cCall.runId,
              graphFunctionRef: cCall.graphFunctionRef,
              materializationRef: graph.materializationRef,
              graphCallId: cCall.graphCallId,
              frameId: cCall.frameId,
              payload: {
                progressRef: cascadeRef,
                progressDigest: cascadeDigest,
                ...cascadeBody,
              },
            });
            stoppedProgresses.push(deepFreeze({
              kind: "retry_progress_admission" as const,
              schemaVersion: "5.0.0" as const,
              disposition: "admitted" as const,
              progressRef: cascadeRef,
              progressDigest: cascadeDigest,
              ...cascadeBody,
              admissionEventRef: cascadeEvent.eventId,
            }));
            predecessorEvent = cascadeEvent;
          }
        }
        const admittedPrefix = selectValidatedRuntimeEventPrefix(store.readAll());
        const projectedSignal = projectCCallRuntimeFailureSignal(
          admittedPrefix,
          cCall.cCallRef,
          close.result.resultRef,
          close.judgment.judgmentRef,
        );
        const projectedProgress = projectAdmittedRetryProgress(
          admittedPrefix,
          progress.admissionEventRef,
        );
        const projectedStoppedProgresses = stoppedProgresses.map((stopped) =>
          projectAdmittedRetryProgress(
            admittedPrefix,
            stopped.admissionEventRef,
          )
        );
        const admittedCalculus = deriveRuntimeEventCalculusProjection(
          admittedPrefix,
        );
        if (
          projectedSignal?.failureSignalRef !== plan.signal.failureSignalRef ||
          projectedSignal.failureClass !== plan.signal.failureClass ||
          projectedProgress === null ||
          sha256Canonical(projectedProgress as unknown as JsonValue) !==
            sha256Canonical(progress as unknown as JsonValue) ||
          projectedStoppedProgresses.some((projected, index) =>
            projected?.progressClass !== "stopped" ||
            sha256Canonical(projected as unknown as JsonValue) !==
              sha256Canonical(
                stoppedProgresses[index] as unknown as JsonValue,
              )
          ) ||
          (disposition === "retry" && stoppedProgresses.length !== 0) ||
          (disposition === "blocked" &&
            stoppedProgresses.length !== enclosingContexts.length) ||
          (disposition === "blocked" && stoppedProgresses[0] !== progress) ||
          (disposition === "retry" && (
            holdsAt(admittedCalculus, constructRuntimeFluent({
              name: "retry_attempt_active",
              identity: body.attemptRef,
            })) ||
            !holdsAt(admittedCalculus, constructRuntimeFluent({
              name: "retry_progress_available",
              identity: progress.progressRef,
            }))
          )) ||
          (disposition === "blocked" && stoppedProgresses.some((stopped) =>
            holdsAt(admittedCalculus, constructRuntimeFluent({
              name: "retry_attempt_active",
              identity: stopped.attemptRef,
            })) ||
            !holdsAt(admittedCalculus, constructRuntimeFluent({
              name: "retry_progress_available",
              identity: stopped.progressRef,
            }))
          ))
        ) throw retryRuntimeFailureTransitionError(
          "atomic close or progress does not reproject exactly",
        );
        return deepFreeze({
          kind: "retry_runtime_failure_transition_admission" as const,
          schemaVersion: "5.0.0" as const,
          disposition,
          close,
          progress,
          stoppedProgresses,
          eligibility,
        });
      },
    );
  } catch (error) {
    if (
      isExpectedPrefixMismatch(error) ||
      isCCallRuntimeFailureCloseError(error) ||
      (error instanceof TypeError && error.message.startsWith(
        "retry runtime failure transition refusal: ",
      ))
    ) {
      return refusal(
        "progress_mismatch",
        "runtime failure transition rolled back after authority changed",
      );
    }
    throw error;
  }
}

export function admitCompletedRetryProgress(
  store: AbgEventStore,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  basis: RuntimeAdmissionBasis,
): readonly RetryCompletedProgressAdmission[] | RetryAdmissionRefusal {
  const snapshot = store.readAll();
  const prefix = selectValidatedRuntimeEventPrefix(snapshot);
  const continuation = deriveCContinuationTarget(graph, {
    nodeRef: sourceCursor.currentNodeRef,
    termPath: sourceCursor.termPath,
    taskOrdinal: sourceCursor.taskOrdinal,
    attempt: sourceCursor.attempt,
    retryPath: sourceCursor.retryPath,
    inputRef: sourceCursor.inputRef,
    inputDigest: sourceCursor.inputDigest,
  }, { inputRef: result.resultRef, inputDigest: result.valueDigest });
  const sourceContexts = resolveEnclosingCRetryContexts(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const targetContexts = targetCursor === null
    ? []
    : resolveEnclosingCRetryContexts(
      graph.template,
      targetCursor.currentNodeRef,
      targetCursor.termPath,
    );
  const sourceTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const targetSemanticsMatch = continuation.kind === "c_source_path_refusal"
    ? false
    : continuation.disposition === "terminal"
      ? targetCursor === null && continuation.termPath === null
      : targetCursor !== null && continuation.termPath !== null &&
        isTraversalCursorCandidate(targetCursor) &&
        !hasAdmittedTraversalCursor(store, targetCursor) &&
        targetCursor.programRef === sourceCursor.programRef &&
        targetCursor.executionBasisRef === sourceCursor.executionBasisRef &&
        targetCursor.traversalScopeRef === sourceCursor.traversalScopeRef &&
        targetCursor.runId === sourceCursor.runId &&
        targetCursor.graphCallId === sourceCursor.graphCallId &&
        targetCursor.frameId === sourceCursor.frameId &&
        targetCursor.graphRef === sourceCursor.graphRef &&
        targetCursor.inputRef === continuation.inputRef &&
        targetCursor.inputDigest === continuation.inputDigest &&
        targetCursor.position === "at_term" &&
        targetCursor.currentNodeRef === continuation.nodeRef &&
        sameStrings(targetCursor.termPath, continuation.termPath) &&
        targetCursor.taskOrdinal === continuation.taskOrdinal &&
        targetCursor.attempt === continuation.attempt &&
        sameNumbers(targetCursor.retryPath, continuation.retryPath);
  const sourceLocusMatches = sourceTerm.kind === "c_of"
    ? cCall.callClass === "leaf" &&
      cCall.programLocusRef === sourceTerm.programLocusRef
    : sourceTerm.kind === "c_workflow" &&
      cCall.callClass === "workflow" &&
      cCall.childGraphFunctionRef === sourceTerm.graphFunctionRef;
  if (
    "kind" in sourceContexts || "kind" in targetContexts ||
    !isMaterializedGtlGraph(graph) ||
    targetContexts.length >= sourceContexts.length ||
    !hasAdmittedTraversalCursor(store, sourceCursor) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    !targetSemanticsMatch ||
    !sourceLocusMatches ||
    !hasCurrentAdmittedCCallOutcome(store, cCall, result, judgment) ||
    judgment.judgment !== "advance" ||
    cCall.cCallRef !== result.cCallRef || cCall.cCallRef !== judgment.cCallRef ||
    cCall.runId !== sourceCursor.runId ||
    cCall.graphCallId !== sourceCursor.graphCallId ||
    cCall.frameId !== sourceCursor.frameId ||
    cCall.taskOrdinal !== sourceCursor.taskOrdinal ||
    cCall.attempt !== sourceCursor.attempt ||
    !sameNumbers(cCall.retryPath, sourceCursor.retryPath) ||
    cCall.retryPath.length !== sourceContexts.length
  ) return refusal("attempt_mismatch", "completed retry progress requires one exact GTL retry-depth exit");

  const events = runtimeEventsFromValidatedPrefix(prefix);
  const basisEvents = events.filter((event) =>
    event.kind === "basis_admitted" && event.basisId === cCall.basisId &&
    isRecord(event.payload) && event.payload.basisRef === cCall.basisId
  );
  const basisEvent = basisEvents.length === 1 ? basisEvents[0] : undefined;
  if (
    basisEvent === undefined || !isRecord(basisEvent.payload) ||
    basisEvent.payload.graphRef !== graph.materializationRef ||
    basisEvent.payload.graphDigest !== graph.materializationDigest
  ) return refusal("basis_mismatch", "completed retry progress requires the exact materialized execution-basis Graph");
  const projection = deriveRuntimeEventCalculusProjection(prefix);
  if (!holdsAt(projection, constructRuntimeFluent({
    name: "locus_active",
    identity: sourceCursor.cursorRef,
  }))) return refusal("cursor_mismatch", "completed retry progress requires the exact current source cursor");
  const exited = sourceContexts.slice(targetContexts.length).reverse();
  const judgmentEvent = events.find((event) =>
    event.eventId === judgment.admissionEventRef
  );
  const plannedAttempts: Array<{
    readonly context: CEnclosingRetryContext;
    readonly retryPath: readonly number[];
    readonly boundaryRef: string;
    readonly attemptEvent: RuntimeEvent;
    readonly attemptRef: string;
  }> = [];
  for (const [index, context] of exited.entries()) {
    const boundaryRef = retryBoundaryRef(graph, sourceCursor, context);
    const retryPath = sourceCursor.retryPath.slice(0, context.retryDepth);
    const attempts = events.filter((event) =>
      event.kind === "retry_attempt_opened" &&
      event.runId === sourceCursor.runId &&
      event.graphCallId === sourceCursor.graphCallId &&
      event.frameId === sourceCursor.frameId &&
      isRecord(event.payload) &&
      event.payload.retryBoundaryRef === boundaryRef &&
      sha256Canonical(event.payload.retryPath as JsonValue) ===
        sha256Canonical(retryPath as unknown as JsonValue)
    );
    const attemptEvent = attempts.length === 1 ? attempts[0]! : null;
    const attemptRef = attemptEvent !== null && isRecord(attemptEvent.payload) &&
        typeof attemptEvent.payload.attemptRef === "string"
      ? attemptEvent.payload.attemptRef
      : null;
    if (attemptRef === null || judgmentEvent === undefined ||
      (index === 0 && !hasExactRetryCompletionOwnership(
        attemptEvent!, judgmentEvent, boundaryRef, retryPath,
      )) ||
      (index > 0 && (
        exited[index - 1]!.retryDepth !== context.retryDepth + 1 ||
        !sameNumbers(
          plannedAttempts[index - 1]!.retryPath.slice(0, -1),
          retryPath,
        )
      )) ||
      !holdsAt(projection, constructRuntimeFluent({
      name: "retry_attempt_active",
      identity: attemptRef,
    }))) return refusal("attempt_mismatch", "completed retry progress requires one exact active attempt chain");
    plannedAttempts.push({ context, retryPath, boundaryRef, attemptEvent: attemptEvent!, attemptRef });
  }
  const planned = plannedAttempts.map((attempt, index) => {
    const body = {
      progressClass: "completed" as const,
      retryBoundaryRef: attempt.boundaryRef,
      attemptRef: attempt.attemptRef,
      attempt: attempt.retryPath.at(-1)!,
      retryPath: attempt.retryPath,
      completedRetryDepth: attempt.context.retryDepth,
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      sourceCursorRef: sourceCursor.cursorRef,
      sourceCursorDigest: sourceCursor.cursorDigest,
      targetCursorRef: targetCursor?.cursorRef ?? null,
      targetCursorDigest: targetCursor?.cursorDigest ?? null,
      predecessorProgressRef: index === 0 ? null : "",
    };
    return body;
  });
  for (let index = 1; index < planned.length; index += 1) {
    const predecessorDigest = sha256Canonical(planned[index - 1] as unknown as JsonValue);
    planned[index] = {
      ...planned[index]!,
      predecessorProgressRef:
        `retry-progress://abiogenesis/${predecessorDigest.slice("sha256:".length)}`,
    };
  }
  const identities = planned.map((body) => {
    const progressDigest = sha256Canonical(body as unknown as JsonValue);
    const progressRef = `retry-progress://abiogenesis/${progressDigest.slice("sha256:".length)}`;
    return { body, progressDigest, progressRef };
  });
  let admittedEvents: readonly RuntimeEvent[];
  try {
    admittedEvents = compareAndAppendExpectedPrefix(
      store,
      sha256Canonical(snapshot as unknown as JsonValue),
      identities.map((identity, index) =>
      (priorEvents) => {
      const { targetCursorRef, targetCursorDigest, ...commonBody } = identity.body;
      return {
      kind: "retry_progress_recorded",
      eventTime: basis.eventTime,
      aggregateType: "frame",
      aggregateId: sourceCursor.frameId,
      parentAggregateId: sourceCursor.graphCallId,
      causationEventRefs: [
        plannedAttempts[index]!.attemptEvent.eventId,
        index === 0 ? judgment.admissionEventRef : priorEvents[index - 1]!.eventId,
      ],
      correlationId: `${basis.correlationId}/completed-${identity.body.completedRetryDepth}`,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId: cCall.runId,
      graphFunctionRef: cCall.graphFunctionRef,
      materializationRef: graph.materializationRef,
      graphCallId: cCall.graphCallId,
      frameId: cCall.frameId,
      payload: targetCursorRef === null
        ? {
          progressRef: identity.progressRef,
          progressDigest: identity.progressDigest,
          ...commonBody,
        }
        : {
          progressRef: identity.progressRef,
          progressDigest: identity.progressDigest,
          ...commonBody,
          targetCursorRef,
          targetCursorDigest,
        },
      };
    }
      ),
    );
  } catch (error) {
    if (isExpectedPrefixMismatch(error)) {
      return refusal(
        "progress_mismatch",
        "completed retry authority changed after immutable-prefix validation",
      );
    }
    throw error;
  }
  const admissions = identities.map((identity, index) => {
    const admission = deepFreeze({
      kind: "retry_progress_admission" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "admitted" as const,
      progressRef: identity.progressRef,
      progressDigest: identity.progressDigest,
      ...identity.body,
      admissionEventRef: admittedEvents[index]!.eventId,
    }) as RetryCompletedProgressAdmission;
    return admission;
  });
  return Object.freeze(admissions);
}
