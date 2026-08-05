import type {
  GtlGraph,
  RecurseApplication,
} from "../gtl/contracts.js";
import {
  graphFunctionApplicationRef,
} from "../gtl/graph_applications.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasAdmittedExecutionBasis,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
} from "./event_calculus.js";
import {
  hasOpenedTraversalScope,
  type OpenedTraversalScope,
} from "./open_call.js";
import {
  replayValidatedRuntimeEventPrefix,
  type ReplayRouteState,
} from "./replay.js";
import {
  hasCurrentAdmittedCCallOutcome,
  hasOpenedCCall,
  isCCall,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type CCall,
} from "./c_call.js";
import {
  hasAdmittedTraversalCursor,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

export interface ApplicationChildFoldbackAdmission {
  readonly kind: "application_child_foldback_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly foldbackRef: string;
  readonly foldbackDigest: Sha256Digest;
  readonly applicationRef: string;
  readonly applicationFoldbackRef: string;
  readonly parentCCallRef: string;
  readonly parentJudgmentRef: string;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly childExecutionBasisRef: string;
  readonly childExecutionBasisDigest: Sha256Digest;
  readonly childGraphCallId: string;
  readonly childFrameId: string;
  readonly childDisposition: "blocked" | "closed";
  readonly childResultRef: string;
  readonly childResultDigest: Sha256Digest;
  readonly childJudgmentRef: string;
  readonly childClosureRef: string | null;
  readonly childReasonRef: string | null;
  readonly childTerminalEventRef: string;
  readonly outputDigest: Sha256Digest;
  readonly admissionEventRef: string;
}

export interface ApplicationChildFoldbackRefusal {
  readonly kind: "application_child_foldback_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "application_mismatch"
    | "child_truth_mismatch"
    | "parent_truth_mismatch";
  readonly message: string;
}

export type ApplicationChildFoldbackResult =
  | ApplicationChildFoldbackAdmission
  | ApplicationChildFoldbackRefusal;

export interface ApplicationChildPreparationRefusalAdmission {
  readonly kind: "application_child_preparation_refusal_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly refusalRef: string;
  readonly refusalDigest: Sha256Digest;
  readonly applicationRef: string;
  readonly parentCCallRef: string;
  readonly parentJudgmentRef: string;
  readonly sourceCursorRef: string;
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
  readonly admissionEventRef: string;
}

export interface ApplicationChildPreparationRefusalRefusal {
  readonly kind: "application_child_preparation_refusal_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "application_mismatch" | "candidate_mismatch";
  readonly message: string;
}

export type ApplicationChildPreparationRefusalResult =
  | ApplicationChildPreparationRefusalAdmission
  | ApplicationChildPreparationRefusalRefusal;

function isRecord(
  value: JsonValue,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const APPLICATION_CHILD_FOLDBACK_BODY_KEYS = Object.freeze([
  "applicationRef",
  "applicationFoldbackRef",
  "parentCCallRef",
  "parentJudgmentRef",
  "sourceCursorRef",
  "sourceCursorDigest",
  "childExecutionBasisRef",
  "childExecutionBasisDigest",
  "childGraphCallId",
  "childFrameId",
  "childDisposition",
  "childResultRef",
  "childResultDigest",
  "childJudgmentRef",
  "childClosureRef",
  "childReasonRef",
  "childTerminalEventRef",
  "outputDigest",
] as const);

function hasExactKeys(
  value: Readonly<Record<string, JsonValue>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function isSha256Digest(value: JsonValue | undefined): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function isNonEmptyString(value: JsonValue | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

function isApplicationChildFoldbackBody(
  value: Readonly<Record<string, JsonValue>>,
): boolean {
  return hasExactKeys(value, APPLICATION_CHILD_FOLDBACK_BODY_KEYS) &&
    isNonEmptyString(value.applicationRef) &&
    isNonEmptyString(value.applicationFoldbackRef) &&
    isNonEmptyString(value.parentCCallRef) &&
    isNonEmptyString(value.parentJudgmentRef) &&
    isNonEmptyString(value.sourceCursorRef) &&
    isSha256Digest(value.sourceCursorDigest) &&
    isNonEmptyString(value.childExecutionBasisRef) &&
    isSha256Digest(value.childExecutionBasisDigest) &&
    isNonEmptyString(value.childGraphCallId) &&
    isNonEmptyString(value.childFrameId) &&
    (value.childDisposition === "blocked" || value.childDisposition === "closed") &&
    isNonEmptyString(value.childResultRef) &&
    isSha256Digest(value.childResultDigest) &&
    isNonEmptyString(value.childJudgmentRef) &&
    isNonEmptyString(value.childTerminalEventRef) &&
    isSha256Digest(value.outputDigest) &&
    (value.childDisposition === "closed"
      ? isNonEmptyString(value.childClosureRef) &&
        (value.childReasonRef === null || isNonEmptyString(value.childReasonRef))
      : value.childClosureRef === null && isNonEmptyString(value.childReasonRef));
}

function refusal(
  code: ApplicationChildFoldbackRefusal["code"],
  message: string,
): ApplicationChildFoldbackRefusal {
  return {
    kind: "application_child_foldback_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

export function isAdmittedApplicationChildFoldback(
  store: AbgEventStore,
  value: ApplicationChildFoldbackAdmission,
): value is ApplicationChildFoldbackAdmission {
  const events = runtimeEventsFromValidatedPrefix(
    selectValidatedRuntimeEventPrefix(store.readAll()),
  );
  const projected = projectCurrentApplicationChildFoldback(store, {
    runId: events.find(
      (event) => event.eventId === value.admissionEventRef,
    )?.runId ?? "",
    foldbackRef: value.foldbackRef,
  });
  return projected !== null &&
    sha256Canonical(projected as unknown as JsonValue) ===
      sha256Canonical(value as unknown as JsonValue);
}

export function isAdmittedApplicationChildPreparationRefusal(
  store: AbgEventStore,
  value: ApplicationChildPreparationRefusalAdmission,
): value is ApplicationChildPreparationRefusalAdmission {
  const events = runtimeEventsFromValidatedPrefix(
    selectValidatedRuntimeEventPrefix(store.readAll()),
  );
  const projected = projectCurrentApplicationChildPreparationRefusal(store, {
    runId: events.find(
      (event) => event.eventId === value.admissionEventRef,
    )?.runId ?? "",
    refusalRef: value.refusalRef,
  });
  return projected !== null &&
    sha256Canonical(projected as unknown as JsonValue) ===
      sha256Canonical(value as unknown as JsonValue);
}

export function projectCurrentApplicationChildPreparationRefusal(
  store: AbgEventStore,
  coordinates: Readonly<{ runId: string; refusalRef: string }>,
): ApplicationChildPreparationRefusalAdmission | null {
  if (coordinates.runId.length === 0 || coordinates.refusalRef.length === 0) {
    return null;
  }
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: coordinates.runId,
  });
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const event = events.find(
    (candidate) =>
      candidate.kind === "child_preparation_refused" &&
      isRecord(candidate.payload) &&
      candidate.payload.refusalRef === coordinates.refusalRef &&
      typeof candidate.payload.applicationRef === "string",
  );
  if (event === undefined || !isRecord(event.payload)) return null;
  const { refusalRef, refusalDigest, ...body } = event.payload;
  if (
    typeof refusalRef !== "string" ||
    typeof refusalDigest !== "string" ||
    refusalRef !== coordinates.refusalRef ||
    refusalDigest !== sha256Canonical(body as unknown as JsonValue) ||
    refusalRef !==
      `child-preparation-refusal://abiogenesis/${refusalDigest.slice("sha256:".length)}` ||
    typeof body.applicationRef !== "string" ||
    typeof body.parentCCallRef !== "string" ||
    typeof body.parentJudgmentRef !== "string" ||
    typeof body.sourceCursorRef !== "string" ||
    typeof body.childGraphFunctionRef !== "string" ||
    typeof body.inputRef !== "string" ||
    typeof body.inputDigest !== "string" ||
    !body.inputDigest.startsWith("sha256:") ||
    ![
      "basis_admission",
      "graph_materialization",
      "graph_validation",
      "membership",
      "scope_open",
    ].includes(body.stage as string) ||
    typeof body.diagnosticRef !== "string" ||
    typeof body.message !== "string" ||
    body.message.length === 0 ||
    !holdsAt(
      deriveRuntimeEventCalculusProjection(prefix),
      constructRuntimeFluent({
        name: "child_preparation_refused",
        identity: refusalRef,
      }),
    )
  ) {
    return null;
  }
  return deepFreeze({
    kind: "application_child_preparation_refusal_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    refusalRef,
    refusalDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as unknown as ApplicationChildPreparationRefusalAdmission;
}

export function projectCurrentApplicationChildFoldback(
  store: AbgEventStore,
  coordinates: Readonly<{ runId: string; foldbackRef: string }>,
): ApplicationChildFoldbackAdmission | null {
  if (coordinates.runId.length === 0 || coordinates.foldbackRef.length === 0) {
    return null;
  }
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: coordinates.runId,
  });
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const event = events.find(
    (candidate) =>
      candidate.kind === "child_foldback_admitted" &&
      isRecord(candidate.payload) &&
      candidate.payload.foldbackRef === coordinates.foldbackRef,
  );
  if (event === undefined || !isRecord(event.payload)) return null;
  const { foldbackRef, foldbackDigest, ...body } = event.payload;
  if (
    typeof foldbackRef !== "string" ||
    !isSha256Digest(foldbackDigest) ||
    foldbackRef !== coordinates.foldbackRef ||
    !isApplicationChildFoldbackBody(body) ||
    foldbackDigest !== sha256Canonical(body as unknown as JsonValue) ||
    foldbackRef !==
      `child-foldback://abiogenesis/${foldbackDigest.slice("sha256:".length)}` ||
    !holdsAt(
      deriveRuntimeEventCalculusProjection(prefix),
      constructRuntimeFluent({
        name: "child_foldback_available",
        identity: foldbackRef,
      }),
    )
  ) {
    return null;
  }
  return deepFreeze({
    kind: "application_child_foldback_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    foldbackRef,
    foldbackDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as unknown as ApplicationChildFoldbackAdmission;
}

export function projectCurrentApplicationChildRoute(
  store: AbgEventStore,
  coordinates: Readonly<{
    runId: string;
    graphCallId: string;
    frameId: string;
    cCallRef: string;
    judgmentRef: string;
  }>,
): ReplayRouteState | null {
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: coordinates.runId,
  });
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const eventCalculus = deriveRuntimeEventCalculusProjection(prefix);
  const route = replayValidatedRuntimeEventPrefix(prefix).routes.find(
    (candidate) =>
      candidate.cCallRef === coordinates.cCallRef &&
      candidate.judgmentRef === coordinates.judgmentRef &&
      (candidate.routeKind === "terminal" || candidate.routeKind === "blocked"),
  );
  if (route === undefined) return null;
  const routeEvent = events.find(
    (event) =>
      event.eventId === route.admissionEventRef &&
      event.kind === "traversal_route_admitted" &&
      event.runId === coordinates.runId &&
      event.graphCallId === coordinates.graphCallId &&
      event.frameId === coordinates.frameId,
  );
  const matchingRunStopped = routeEvent === undefined
    ? undefined
    : events.find(
        (event) =>
          event.kind === "run_stopped" &&
          event.runId === coordinates.runId &&
          event.graphCallId === coordinates.graphCallId &&
          event.frameId === coordinates.frameId &&
          event.causationEventRefs.includes(routeEvent.eventId) &&
          isRecord(event.payload) &&
          event.payload.routeRef === route.routeRef,
      );
  const lifecycleCurrent = route.routeKind === "terminal"
    ? holdsAt(
        eventCalculus,
        constructRuntimeFluent({
          name: "graph_call_closed",
          identity: coordinates.graphCallId,
        }),
      )
    : matchingRunStopped === undefined
    ? holdsAt(
        eventCalculus,
        constructRuntimeFluent({
          name: "frame_blocked",
          identity: coordinates.frameId,
        }),
      )
    : holdsAt(
        eventCalculus,
        constructRuntimeFluent({
          name: "run_terminal",
          identity: coordinates.runId,
        }),
      ) &&
      !holdsAt(
        eventCalculus,
        constructRuntimeFluent({
          name: "run_active",
          identity: coordinates.runId,
        }),
      );
  return routeEvent === undefined || !lifecycleCurrent ? null : route;
}

export function admitApplicationChildPreparationRefusal(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  application: Readonly<RecurseApplication>,
  parentCCall: CCall,
  parentResult: AdmittedCCallResult,
  parentJudgment: AdmittedCCallJudgment,
  sourceCursor: TraversalCursorCandidate,
  candidate: {
    readonly childGraphFunctionRef: string;
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
    readonly stage: ApplicationChildPreparationRefusalAdmission["stage"];
    readonly diagnosticRef: string;
    readonly message: string;
  },
  basis: RuntimeAdmissionBasis,
): ApplicationChildPreparationRefusalResult {
  if (
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    !isMaterializedGtlGraph(graph) ||
    graph.materializationRef !== executionBasis.graphRef ||
    graph.template.applications.find(
      (row) => row.applicationRef === application.applicationRef,
    ) !== application ||
    application.relationKind !== "recurse" ||
    application.applicationRef !== graphFunctionApplicationRef(application) ||
    !hasOpenedCCall(store, parentCCall) ||
    !hasCurrentAdmittedCCallOutcome(
      store,
      parentCCall,
      parentResult,
      parentJudgment,
    ) ||
    !hasAdmittedTraversalCursor(store, sourceCursor) ||
    parentCCall.basisId !== executionBasis.basisRef ||
    parentCCall.frameId !== sourceCursor.frameId ||
    parentCCall.compositionRef !== application.applicationRef ||
    parentResult.cCallRef !== parentCCall.cCallRef ||
    parentJudgment.cCallRef !== parentCCall.cCallRef ||
    parentJudgment.resultRef !== parentResult.resultRef ||
    parentJudgment.judgment !== "advance"
  ) {
    return {
      kind: "application_child_preparation_refusal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "application_mismatch",
      message:
        "application child preparation refusal requires exact admitted parent evaluation truth",
    };
  }
  if (
    candidate.childGraphFunctionRef !== application.graphFunctionRef ||
    candidate.inputRef !== parentResult.resultRef ||
    candidate.inputDigest !== parentResult.valueDigest ||
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
      kind: "application_child_preparation_refusal_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "candidate_mismatch",
      message:
        "application child preparation refusal differs from the declared child and parent output",
    };
  }
  const body = {
    applicationRef: application.applicationRef,
    parentCCallRef: parentCCall.cCallRef,
    parentJudgmentRef: parentJudgment.judgmentRef,
    sourceCursorRef: sourceCursor.cursorRef,
    ...candidate,
  };
  const refusalDigest = sha256Canonical(body as unknown as JsonValue);
  const refusalRef =
    `child-preparation-refusal://abiogenesis/${refusalDigest.slice("sha256:".length)}`;
  const event = admitRuntimeEvent(store, {
    kind: "child_preparation_refused",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: sourceCursor.frameId,
    parentAggregateId: sourceCursor.graphCallId,
    causationEventRefs: [
      parentJudgment.admissionEventRef,
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: sourceCursor.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    payload: { refusalRef, refusalDigest, ...body },
  });
  const admitted = deepFreeze({
    kind: "application_child_preparation_refusal_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    refusalRef,
    refusalDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as ApplicationChildPreparationRefusalAdmission;
  const projected = projectCurrentApplicationChildPreparationRefusal(store, {
    runId: sourceCursor.runId,
    refusalRef,
  });
  if (
    projected === null ||
    sha256Canonical(projected as unknown as JsonValue) !==
      sha256Canonical(admitted as unknown as JsonValue)
  ) {
    throw new TypeError(
      "application child preparation refusal admission must equal its validated Event Calculus projection",
    );
  }
  return projected;
}

export function admitApplicationChildFoldback(
  store: AbgEventStore,
  parentExecutionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  application: Readonly<RecurseApplication>,
  parentCCall: CCall,
  parentJudgmentRef: string,
  sourceCursor: TraversalCursorCandidate,
  childExecutionBasis: ExecutionBasis,
  childScope: OpenedTraversalScope,
  child: {
    readonly resultRef: string;
    readonly judgmentRef: string;
    readonly closureRef: string | null;
  },
  basis: RuntimeAdmissionBasis,
): ApplicationChildFoldbackResult {
  if (
    !hasAdmittedExecutionBasis(store, parentExecutionBasis) ||
    !isMaterializedGtlGraph(graph) ||
    graph.materializationRef !== parentExecutionBasis.graphRef ||
    graph.template.applications.find(
      (candidate) => candidate.applicationRef === application.applicationRef,
    ) !== application ||
    application.relationKind !== "recurse" ||
    application.applicationRef !== graphFunctionApplicationRef(application)
  ) {
    return refusal(
      "application_mismatch",
      "child foldback requires one exact admitted recurse application",
    );
  }
  if (
    !isCCall(parentCCall) ||
    parentCCall.callClass !== "leaf" ||
    parentCCall.basisId !== parentExecutionBasis.basisRef ||
    parentCCall.frameId !== sourceCursor.frameId ||
    parentCCall.graphCallId !== sourceCursor.graphCallId ||
    parentCCall.compositionRef !== application.applicationRef ||
    parentCCall.attempt !== sourceCursor.attempt ||
    !hasAdmittedTraversalCursor(store, sourceCursor)
  ) {
    return refusal(
      "parent_truth_mismatch",
      "application foldback requires the exact evaluated parent cursor and CCall",
    );
  }
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: sourceCursor.runId,
  });
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const eventCalculus = deriveRuntimeEventCalculusProjection(prefix);
  const parentJudgmentEvent = events.find(
    (event) =>
      event.kind === "c_call_judged" &&
      event.aggregateId === parentCCall.cCallRef &&
      isRecord(event.payload) &&
      event.payload.judgmentRef === parentJudgmentRef &&
      event.payload.judgment === "advance",
  );
  if (
    parentJudgmentEvent === undefined ||
    !holdsAt(
      eventCalculus,
      constructRuntimeFluent({
        name: "c_call_judgment_available",
        identity: parentJudgmentRef,
      }),
    )
  ) {
    return refusal(
      "parent_truth_mismatch",
      "application foldback requires admitted parent re-evaluation truth",
    );
  }
  if (
    !hasAdmittedExecutionBasis(store, childExecutionBasis) ||
    childExecutionBasis.basisClass !== "child" ||
    childExecutionBasis.parentExecutionBasisRef !== parentExecutionBasis.basisRef ||
    childExecutionBasis.graphFunctionRef !== application.graphFunctionRef ||
    !hasOpenedTraversalScope(store, childScope) ||
    childScope.executionBasisRef !== childExecutionBasis.basisRef ||
    childScope.runId !== sourceCursor.runId
  ) {
    return refusal(
      "child_truth_mismatch",
      "application foldback requires one exact admitted child basis and scope",
    );
  }
  const childGraphCallEvent = events.find(
    (event) =>
      event.kind === "graph_call_opened" &&
      event.aggregateId === childScope.graphCallId &&
      isRecord(event.payload) &&
      event.payload.parentFrameId === sourceCursor.frameId,
  );
  const resultEvent = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.runId === childScope.runId &&
      event.frameId === childScope.frameId &&
      isRecord(event.payload) &&
      event.payload.resultRef === child.resultRef,
  );
  const judgmentEvent = events.find(
    (event) =>
      event.kind === "c_call_judged" &&
      event.runId === childScope.runId &&
      event.frameId === childScope.frameId &&
      isRecord(event.payload) &&
      event.payload.judgmentRef === child.judgmentRef &&
      event.payload.resultRef === child.resultRef,
  );
  const childCCallRef = resultEvent !== undefined && isRecord(resultEvent.payload) &&
      typeof resultEvent.payload.cCallRef === "string"
    ? resultEvent.payload.cCallRef
    : null;
  const routeProjection = childCCallRef === null
    ? undefined
    : projectCurrentApplicationChildRoute(store, {
        runId: childScope.runId,
        graphCallId: childScope.graphCallId,
        frameId: childScope.frameId,
        cCallRef: childCCallRef,
        judgmentRef: child.judgmentRef,
      }) ?? undefined;
  const routeEvent = routeProjection === undefined
    ? undefined
    : events.find(
        (event) =>
          event.eventId === routeProjection.admissionEventRef &&
          event.kind === "traversal_route_admitted" &&
          event.runId === childScope.runId &&
          event.frameId === childScope.frameId,
      );
  const routeKind = routeProjection?.routeKind ?? null;
  const terminalReachedEvent = routeKind === "terminal"
    ? events.find(
        (event) =>
          event.kind === "terminal_reached" &&
          event.runId === childScope.runId &&
          event.frameId === childScope.frameId &&
          event.causationEventRefs.includes(routeEvent!.eventId) &&
          isRecord(event.payload) &&
          event.payload.closureRef === child.closureRef,
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
  const resultDigest = resultEvent !== undefined && isRecord(resultEvent.payload)
    ? resultEvent.payload.resultDigest
    : null;
  const outputDigest = resultEvent !== undefined && isRecord(resultEvent.payload)
    ? resultEvent.payload.valueDigest
    : null;
  const childReasonRef =
    judgmentEvent !== undefined && isRecord(judgmentEvent.payload) &&
      typeof judgmentEvent.payload.reasonRef === "string"
      ? judgmentEvent.payload.reasonRef
    : null;
  const childLifecycleEvent = routeKind === "terminal"
    ? graphCallClosedEvent
    : routeEvent;
  if (
    childGraphCallEvent === undefined ||
    resultEvent === undefined ||
    judgmentEvent === undefined ||
    routeEvent === undefined ||
    childLifecycleEvent === undefined ||
    !judgmentEvent.causationEventRefs.includes(resultEvent.eventId) ||
    !routeEvent.causationEventRefs.includes(judgmentEvent.eventId) ||
    typeof resultDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(resultDigest) ||
    typeof outputDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(outputDigest) ||
    (routeKind !== "terminal" && routeKind !== "blocked") ||
    (routeKind === "terminal" &&
      (
        child.closureRef === null ||
        terminalReachedEvent === undefined ||
        frameClosedEvent === undefined ||
        graphCallClosedEvent === undefined
      )) ||
    (routeKind === "blocked" &&
      (child.closureRef !== null || childReasonRef === null))
  ) {
    return refusal(
      "child_truth_mismatch",
      "application foldback references incomplete or non-causal child truth",
    );
  }
  const body = {
    applicationRef: application.applicationRef,
    applicationFoldbackRef: application.foldbackRef,
    parentCCallRef: parentCCall.cCallRef,
    parentJudgmentRef,
    sourceCursorRef: sourceCursor.cursorRef,
    sourceCursorDigest: sourceCursor.cursorDigest,
    childExecutionBasisRef: childExecutionBasis.basisRef,
    childExecutionBasisDigest: childExecutionBasis.basisDigest,
    childGraphCallId: childScope.graphCallId,
    childFrameId: childScope.frameId,
    childDisposition: routeKind === "terminal" ? "closed" as const : "blocked" as const,
    childResultRef: child.resultRef,
    childResultDigest: resultDigest as Sha256Digest,
    childJudgmentRef: child.judgmentRef,
    childClosureRef: child.closureRef,
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
    aggregateId: sourceCursor.frameId,
    parentAggregateId: sourceCursor.graphCallId,
    causationEventRefs: [
      childLifecycleEvent.eventId,
      parentJudgmentEvent.eventId,
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: parentExecutionBasis.basisRef,
    runId: sourceCursor.runId,
    graphFunctionRef: parentExecutionBasis.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    payload: { foldbackRef, foldbackDigest, ...body },
  });
  const admitted = deepFreeze({
    kind: "application_child_foldback_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    foldbackRef,
    foldbackDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as ApplicationChildFoldbackAdmission;
  return admitted;
}
