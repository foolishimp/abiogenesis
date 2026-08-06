import type { GtlGraph } from "../gtl/contracts.js";
import {
  resolveEnclosingCRetryContexts,
  type CEnclosingRetryContext,
} from "../gtl/source_path.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  AdmittedCCallJudgment,
  AdmittedCCallResult,
  CCall,
  RejectedCCallCompletion,
} from "./c_call.js";
import { hasCurrentAdmittedCCallOutcome } from "./c_call.js";
import {
  hasAdmittedExecutionBasis,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
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
  hasExactRetryContinuationProgressOwnership,
} from "./retry_lifecycle.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  hasAdmittedTraversalCursor,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

export const RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES = [
  "transport_failure",
  "no_output",
  "contract_failure",
] as const;

export type RetryableRuntimeFailureClass =
  (typeof RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES)[number];

export interface RetryInputBasis {
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly inputContractRef: string;
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
  readonly failureClass: RetryableRuntimeFailureClass;
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
  readonly admissionEventRef: string;
}

interface RetryProgressAdmissionBase {
  readonly kind: "retry_progress_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly progressRef: string;
  readonly progressDigest: Sha256Digest;
  readonly progressClass: "retry" | "completed";
  readonly retryBoundaryRef: string;
  readonly attemptRef: string;
  readonly attempt: number;
  readonly retryPath: readonly number[];
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
  readonly admissionEventRef: string;
}

export interface RetryContinuationProgressAdmission
  extends RetryProgressAdmissionBase {
  readonly progressClass: "retry";
  readonly budget: number;
  readonly failureClass: RetryableRuntimeFailureClass;
  readonly failureSignalRef: string;
  readonly completedAttempts: readonly number[];
  readonly remainingBudget: number;
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly inputContractRef: string;
}

export interface RetryCompletedProgressAdmission
  extends RetryProgressAdmissionBase {
  readonly progressClass: "completed";
  readonly completedRetryDepth: number;
}

export type RetryProgressAdmission =
  | RetryContinuationProgressAdmission
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

export type RetryProgressAdmissionResult =
  | RetryProgressAdmission
  | RetryAdmissionRefusal;

const admittedAttempts = new WeakSet<object>();
const admittedProgress = new WeakSet<object>();

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

function isRecord(
  value: JsonValue,
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
  store: AbgEventStore,
  runId: string,
  graphCallId: string,
  frameId: string,
  boundaryRef: string,
): RetryLifecycleProjection {
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), { runId });
  const eventCalculus = deriveRuntimeEventCalculusProjection(prefix);
  const events = runtimeEventsFromValidatedPrefix(prefix).filter((event) =>
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
    events: runtimeEventsFromValidatedPrefix(prefix),
    attempts: events.filter((event) => event.kind === "retry_attempt_opened"),
    progress: events.filter((event) => event.kind === "retry_progress_recorded"),
  };
}

export function projectDeclaredCRetryFrontier(
  store: AbgEventStore,
  runId: string,
  graphCallId: string,
  frameId: string,
  boundaryRef: string,
): RetryLifecycleProjection {
  return projectRetryLifecycle(
    store,
    runId,
    graphCallId,
    frameId,
    boundaryRef,
  );
}

function positiveNumberArray(value: JsonValue | undefined): readonly number[] {
  return Array.isArray(value) &&
      value.every((row) => Number.isSafeInteger(row) && Number(row) > 0)
    ? value.map(Number)
    : [];
}

export function isAdmittedRetryAttempt(
  value: object,
): value is RetryAttemptAdmission {
  return admittedAttempts.has(value);
}

export function isAdmittedRetryProgress(
  value: object,
): value is RetryProgressAdmission {
  return admittedProgress.has(value);
}

export function hasAdmittedRetryProgress(
  store: AbgEventStore,
  value: RetryProgressAdmission,
): boolean {
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll());
  const event = runtimeEventsFromValidatedPrefix(prefix).find(
    (candidate) => candidate.eventId === value.admissionEventRef,
  );
  if (
    event?.kind !== "retry_progress_recorded" ||
    event.runId === undefined ||
    event.graphCallId === undefined ||
    event.frameId === undefined ||
    !isRecord(event.payload) ||
    event.payload.progressRef !== value.progressRef ||
    event.payload.retryBoundaryRef !== value.retryBoundaryRef
  ) return false;
  const lifecycle = projectRetryLifecycle(
    store,
    event.runId,
    event.graphCallId,
    event.frameId,
    value.retryBoundaryRef,
  );
  const reconstructed = {
    kind: "retry_progress_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    progressRef: event.payload.progressRef,
    progressDigest: event.payload.progressDigest,
    progressClass: event.payload.progressClass,
    retryBoundaryRef: event.payload.retryBoundaryRef,
    attemptRef: event.payload.attemptRef,
    attempt: event.payload.attempt,
    retryPath: event.payload.retryPath,
    cCallRef: event.payload.cCallRef,
    resultRef: event.payload.resultRef,
    judgmentRef: event.payload.judgmentRef,
    ...(event.payload.progressClass === "retry" ? {
    budget: event.payload.budget,
    failureClass: event.payload.failureClass,
    failureSignalRef: event.payload.failureSignalRef,
    completedAttempts: event.payload.completedAttempts,
    remainingBudget: event.payload.remainingBudget,
    inputRef: event.payload.inputRef,
    inputDigest: event.payload.inputDigest,
    inputContractRef: event.payload.inputContractRef,
    } : { completedRetryDepth: event.payload.completedRetryDepth }),
    admissionEventRef: event.eventId,
  };
  return sha256Canonical(reconstructed as unknown as JsonValue) ===
      sha256Canonical(value as unknown as JsonValue) &&
    holdsAt(
      lifecycle.eventCalculus,
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
  const context = contextForCursor(graph, cursor);
  if (context === null || (typeof context === "object" && "kind" in context)) {
    return context ??
      refusal("retry_not_declared", "cursor has no enclosing declared C.retry term");
  }
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: cursor.runId,
  });
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
    retryableFailureClasses: RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES,
    priorJudgmentRef: routeEvent.payload.judgmentRef,
    priorRouteRef: routeEvent.payload.routeRef,
    inputRef: cursor.inputRef,
    inputDigest: cursor.inputDigest,
    inputContractRef: context.inputCarrierRef,
  };
  const attemptDigest = sha256Canonical(body as unknown as JsonValue);
  const attemptRef =
    `retry-attempt://abiogenesis/${attemptDigest.slice("sha256:".length)}`;
  const lifecycle = projectRetryLifecycle(
    store,
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
  const event = admitRuntimeEvent(store, {
    kind: "retry_attempt_opened",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: cursor.frameId,
    parentAggregateId: cursor.graphCallId,
    causationEventRefs: [routeAdmissionEventRef, ...basis.causationEventRefs],
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
  });
  const admission = deepFreeze({
    kind: "retry_attempt_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    attemptRef,
    attemptDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as RetryAttemptAdmission;
  admittedAttempts.add(admission);
  return admission;
}

export function projectRetryEligibility(
  store: AbgEventStore,
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
  failureClass: RetryableRuntimeFailureClass,
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
    store,
    cursor.runId,
    cursor.graphCallId,
    cursor.frameId,
    boundaryRef,
  );
  const rows = lifecycle.progress;
  const attempts = rows
    .map((event) =>
      isRecord(event.payload) &&
        Number.isSafeInteger(event.payload.attempt) &&
        Number(event.payload.attempt) > 0
        ? Number(event.payload.attempt)
        : null)
    .filter((value): value is number => value !== null)
    .sort((left, right) => left - right);
  const expectedPrior = Array.from(
    { length: Math.max(0, cursor.attempt - 1) },
    (_, index) => index + 1,
  );
  const admittedAttemptCoverage = lifecycle.attempts
    .map((event) =>
      isRecord(event.payload) && Number.isSafeInteger(event.payload.attempt)
        ? Number(event.payload.attempt)
        : 0
    );
  const expectedAttemptCoverage = [...expectedPrior, cursor.attempt];
  const currentAttemptEvents = lifecycle.attempts.filter((event) =>
    isRecord(event.payload) &&
    event.payload.attempt === cursor.attempt &&
    sameNumbers(positiveNumberArray(event.payload.retryPath), cursor.retryPath)
  );
  const currentAttemptRef = currentAttemptEvents.length === 1 &&
      isRecord(currentAttemptEvents[0]!.payload) &&
      typeof currentAttemptEvents[0]!.payload.attemptRef === "string"
    ? currentAttemptEvents[0]!.payload.attemptRef
    : null;
  const currentAttemptIsActive = currentAttemptRef !== null && holdsAt(
    lifecycle.eventCalculus,
    constructRuntimeFluent({
      name: "retry_attempt_active",
      identity: currentAttemptRef,
    }),
  );
  const stationary = rows.some((event) =>
    isRecord(event.payload) &&
    event.payload.failureSignalRef === failureSignalRef
  );
  const retryable = RETRYABLE_RUNTIME_FAILURE_CLASS_VALUES.includes(failureClass);
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
    priorProgressRefs: rows
      .map((event) =>
        isRecord(event.payload) && typeof event.payload.progressRef === "string"
          ? event.payload.progressRef
          : null)
      .filter((value): value is string => value !== null),
  }) as RetryEligibility;
}

export function admitRetryProgress(
  store: AbgEventStore,
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursorCandidate,
  cCall: CCall,
  rejected: RejectedCCallCompletion,
  failureClass: RetryableRuntimeFailureClass,
  failureSignalRef: string,
  basis: RuntimeAdmissionBasis,
): RetryProgressAdmissionResult {
  const eligibility = projectRetryEligibility(
    store,
    graph,
    cursor,
    failureClass,
    failureSignalRef,
  );
  if (
    eligibility.disposition !== "retry" ||
    eligibility.retryBoundaryRef === null
  ) {
    return refusal(
      "progress_mismatch",
      "retry progress requires current replay to admit one bounded same-edge retry",
    );
  }
  if (
    cCall.frameId !== cursor.frameId ||
    cCall.graphCallId !== cursor.graphCallId ||
    cCall.attempt !== cursor.attempt ||
    !sameNumbers(cCall.retryPath, cursor.retryPath) ||
    rejected.cCallRef !== cCall.cCallRef ||
    rejected.disposition !== "retry"
  ) {
    return refusal(
      "attempt_mismatch",
      "retry progress CCall differs from the current attempt coordinate",
    );
  }
  const lifecycle = projectRetryLifecycle(
    store,
    cursor.runId,
    cursor.graphCallId,
    cursor.frameId,
    eligibility.retryBoundaryRef,
  );
  const attemptRows = lifecycle.attempts.filter((event) =>
    isRecord(event.payload) &&
    event.payload.attempt === cursor.attempt &&
    sameNumbers(
      positiveNumberArray(event.payload.retryPath),
      cursor.retryPath,
    )
  );
  const attemptEvent = attemptRows.length === 1 ? attemptRows[0] : undefined;
  const judgmentEvent = lifecycle.events.find(
    (event) => event.eventId === rejected.judgmentEventRef,
  );
  if (
    attemptEvent === undefined ||
    !isRecord(attemptEvent.payload) ||
    judgmentEvent?.kind !== "c_call_judged" ||
    !isRecord(judgmentEvent.payload) ||
    judgmentEvent.aggregateId !== cCall.cCallRef ||
    !hasExactRetryContinuationProgressOwnership(
      attemptEvent,
      judgmentEvent,
      eligibility.retryBoundaryRef,
    ) || !holdsAt(lifecycle.eventCalculus, constructRuntimeFluent({
      name: "retry_attempt_active",
      identity: attemptEvent.payload.attemptRef as string,
    })) ||
    judgmentEvent.payload.judgmentRef !== rejected.rejectionJudgmentRef ||
    judgmentEvent.payload.resultRef !== rejected.refusalResultRef
  ) {
    return refusal(
      "judgment_mismatch",
      "retry progress requires the exact admitted attempt and retry judgment",
    );
  }
  const body = {
    progressClass: "retry" as const,
    retryBoundaryRef: eligibility.retryBoundaryRef,
    attemptRef: attemptEvent.payload.attemptRef as string,
    attempt: cursor.attempt,
    retryPath: cursor.retryPath,
    budget: eligibility.budget,
    failureClass,
    failureSignalRef,
    completedAttempts: eligibility.completedAttempts,
    remainingBudget: eligibility.remainingBudget,
    cCallRef: cCall.cCallRef,
    resultRef: rejected.refusalResultRef,
    judgmentRef: rejected.rejectionJudgmentRef,
    inputRef: attemptEvent.payload.inputRef as string,
    inputDigest: attemptEvent.payload.inputDigest as Sha256Digest,
    inputContractRef: attemptEvent.payload.inputContractRef as string,
  };
  const progressDigest = sha256Canonical(body as unknown as JsonValue);
  const progressRef =
    `retry-progress://abiogenesis/${progressDigest.slice("sha256:".length)}`;
  const event = admitRuntimeEvent(store, {
    kind: "retry_progress_recorded",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: cursor.frameId,
    parentAggregateId: cursor.graphCallId,
    causationEventRefs: [
      attemptEvent.eventId,
      rejected.judgmentEventRef,
      ...basis.causationEventRefs,
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
    payload: { progressRef, progressDigest, ...body },
  });
  const admission = deepFreeze({
    kind: "retry_progress_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    progressRef,
    progressDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as RetryProgressAdmission;
  admittedProgress.add(admission);
  return admission;
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
  if (
    "kind" in sourceContexts || "kind" in targetContexts ||
    targetContexts.length >= sourceContexts.length ||
    !hasCurrentAdmittedCCallOutcome(store, cCall, result, judgment) ||
    judgment.judgment !== "advance" ||
    cCall.cCallRef !== result.cCallRef || cCall.cCallRef !== judgment.cCallRef ||
    cCall.retryPath.length !== sourceContexts.length
  ) return refusal("attempt_mismatch", "completed retry progress requires one exact GTL retry-depth exit");

  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: sourceCursor.runId,
  });
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const projection = deriveRuntimeEventCalculusProjection(prefix);
  const exited = sourceContexts.slice(targetContexts.length).reverse();
  const admissions: RetryCompletedProgressAdmission[] = [];
  for (const context of exited) {
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
    const judgmentEvent = events.find((event) =>
      event.eventId === judgment.admissionEventRef
    );
    if (attemptRef === null || judgmentEvent === undefined ||
      !hasExactRetryCompletionOwnership(
        attemptEvent!, judgmentEvent, boundaryRef, retryPath,
      ) || !holdsAt(projection, constructRuntimeFluent({
      name: "retry_attempt_active",
      identity: attemptRef,
    }))) return refusal("attempt_mismatch", "completed retry progress requires one exact active attempt");
    const body = {
      progressClass: "completed" as const,
      retryBoundaryRef: boundaryRef,
      attemptRef,
      attempt: retryPath.at(-1)!,
      retryPath,
      completedRetryDepth: context.retryDepth,
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
    };
    const progressDigest = sha256Canonical(body as unknown as JsonValue);
    const progressRef = `retry-progress://abiogenesis/${progressDigest.slice("sha256:".length)}`;
    const event = admitRuntimeEvent(store, {
      kind: "retry_progress_recorded",
      eventTime: basis.eventTime,
      aggregateType: "frame",
      aggregateId: sourceCursor.frameId,
      parentAggregateId: sourceCursor.graphCallId,
      causationEventRefs: [attemptEvent!.eventId, judgment.admissionEventRef, ...basis.causationEventRefs],
      correlationId: `${basis.correlationId}/completed-${context.retryDepth}`,
      workflowVersion: "5.0.0",
      scopeClass: "run",
      basisId: cCall.basisId,
      runId: cCall.runId,
      graphFunctionRef: cCall.graphFunctionRef,
      materializationRef: graph.materializationRef,
      graphCallId: cCall.graphCallId,
      frameId: cCall.frameId,
      payload: { progressRef, progressDigest, ...body },
    });
    const admission = deepFreeze({
      kind: "retry_progress_admission" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "admitted" as const,
      progressRef,
      progressDigest,
      ...body,
      admissionEventRef: event.eventId,
    }) as RetryCompletedProgressAdmission;
    admittedProgress.add(admission);
    admissions.push(admission);
  }
  return Object.freeze(admissions);
}
