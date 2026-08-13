import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  rehydrateExecutionBasisAtPrefix,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import { projectCurrentChildParentCCallAtPrefix } from "./c_call.js";
import {
  constructRunActiveFluent,
  constructRunClosedFluent,
  constructRunTerminalFluent,
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
} from "./event_calculus.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventTransactionAtExpectedPrefix,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";

export interface OpenedRun {
  readonly runId: string;
  readonly runDigest: Sha256Digest;
  readonly executionBasisRef: string;
  readonly executionBasisDigest: Sha256Digest;
  readonly invocationAdmissionRef: string;
  readonly invocationRef: string;
  readonly workspaceBindingId: string;
  readonly programRef: string;
  readonly graphFunctionRef: string;
  readonly graphRef: string;
  readonly graphDigest: Sha256Digest;
  readonly openEventRef: string;
}

export interface OpenedGraphCall {
  readonly graphCallId: string;
  readonly graphCallDigest: Sha256Digest;
  readonly runId: string;
  readonly executionBasisRef: string;
  readonly invocationRef: string;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly graphRef: string;
  readonly graphDigest: Sha256Digest;
  readonly openEventRef: string;
}

export interface OpenedFrame {
  readonly frameId: string;
  readonly frameDigest: Sha256Digest;
  readonly frameLineageId: string;
  readonly attempt: number;
  readonly parentFrameId: string | null;
  readonly runId: string;
  readonly graphCallId: string;
  readonly executionBasisRef: string;
  readonly invocationRef: string;
  readonly admittedInputRef: string;
  readonly admittedInputDigest: Sha256Digest;
  readonly openEventRef: string;
}

export interface OpenedTraversalScope {
  readonly kind: "opened_traversal_scope";
  readonly schemaVersion: "5.0.0";
  readonly scopeRef: string;
  readonly scopeDigest: Sha256Digest;
  readonly executionBasisRef: string;
  readonly executionBasisDigest: Sha256Digest;
  readonly invocationAdmissionRef: string;
  readonly invocationRef: string;
  readonly programRef: string;
  readonly graphFunctionRef: string;
  readonly graphRef: string;
  readonly runId: string;
  readonly runDigest: Sha256Digest;
  readonly runOpenEventRef: string;
  readonly graphCallId: string;
  readonly graphCallDigest: Sha256Digest;
  readonly graphCallOpenEventRef: string;
  readonly frameId: string;
  readonly frameDigest: Sha256Digest;
  readonly frameLineageId: string;
  readonly frameOpenEventRef: string;
}

export interface OpenCallAdmission {
  readonly kind: "open_call_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "opened";
  readonly run: OpenedRun;
  readonly graphCall: OpenedGraphCall;
  readonly frame: OpenedFrame;
  readonly scope: OpenedTraversalScope;
}

export interface OpenCallRefusal {
  readonly kind: "open_call_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: "execution_basis_already_opened" | "execution_basis_not_admitted";
  readonly message: string;
}

export type OpenCallResult = OpenCallAdmission | OpenCallRefusal;

export interface OpenChildCallAdmission {
  readonly kind: "open_child_call_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "opened";
  readonly graphCall: OpenedGraphCall;
  readonly frame: OpenedFrame;
  readonly scope: OpenedTraversalScope;
}

export interface OpenChildCallRefusal {
  readonly kind: "open_child_call_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "child_basis_already_opened"
    | "child_basis_not_admitted"
    | "parent_scope_mismatch";
  readonly message: string;
}

export type OpenChildCallResult =
  | OpenChildCallAdmission
  | OpenChildCallRefusal;

const openedScopes = new WeakSet<object>();

export function isOpenedTraversalScope(value: object): boolean {
  return openedScopes.has(value);
}

function isRecord(value: JsonValue): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameCanonicalValue(left: unknown, right: unknown): boolean {
  try {
    return sha256Canonical(left as JsonValue) ===
      sha256Canonical(right as JsonValue);
  } catch {
    return false;
  }
}

type RunPhase = "not_open" | "active" | "closed" | "stopped" | "failed";

function projectRunPhaseAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  input: Readonly<{
    runId: string;
    runDigest: Sha256Digest;
    executionBasisRef: string;
  }>,
): RunPhase | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const openEvents = events.filter((event) =>
    event.kind === "run_segment_opened" && event.aggregateId === input.runId
  );
  const failureEvents = events.filter((event) =>
    event.kind === "runtime_failure_observed" && event.runId === input.runId
  );
  const stoppedEvents = events.filter((event) =>
    event.kind === "run_stopped" && event.runId === input.runId
  );
  const closedEvents = events.filter((event) =>
    event.kind === "run_closed" && event.runId === input.runId
  );
  if (openEvents.length === 0) {
    return failureEvents.length === 0 &&
        stoppedEvents.length === 0 &&
        closedEvents.length === 0
      ? "not_open"
      : null;
  }
  const openEvent = openEvents[0]!;
  if (
    openEvents.length !== 1 ||
    openEvent.aggregateType !== "run" ||
    openEvent.basisId !== input.executionBasisRef ||
    !isRecord(openEvent.payload) ||
    openEvent.payload.runId !== input.runId ||
    openEvent.payload.runDigest !== input.runDigest ||
    failureEvents.length > 1 ||
    stoppedEvents.length > 1 ||
    closedEvents.length > 1 ||
    [failureEvents, stoppedEvents, closedEvents]
      .filter((rows) => rows.length === 1).length > 1
  ) return null;
  const calculus = deriveRuntimeEventCalculusProjection(prefix);
  if (failureEvents.length === 1) return "failed";
  if (
    stoppedEvents.length === 1 &&
    holdsAt(calculus, constructRunTerminalFluent(input.runId))
  ) return "stopped";
  if (
    closedEvents.length === 1 &&
    holdsAt(calculus, constructRunClosedFluent(input.runId))
  ) return "closed";
  return holdsAt(calculus, constructRunActiveFluent(input.runId))
    ? "active"
    : null;
}

type GraphCallPhase = "not_open" | "active" | "closed" | "inactive";

function projectGraphCallPhaseAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  input: Readonly<{
    graphCallId: string;
    graphCallDigest: Sha256Digest;
    executionBasisRef: string;
  }>,
): GraphCallPhase | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const openEvents = events.filter((event) =>
    event.kind === "graph_call_opened" &&
    event.aggregateId === input.graphCallId
  );
  const closedEvents = events.filter((event) =>
    event.kind === "graph_call_closed" &&
    event.graphCallId === input.graphCallId
  );
  if (openEvents.length === 0) {
    return closedEvents.length === 0 ? "not_open" : null;
  }
  const openEvent = openEvents[0]!;
  if (
    openEvents.length !== 1 ||
    closedEvents.length > 1 ||
    openEvent.aggregateType !== "graph_call" ||
    openEvent.basisId !== input.executionBasisRef ||
    !isRecord(openEvent.payload) ||
    openEvent.payload.graphCallId !== input.graphCallId ||
    openEvent.payload.graphCallDigest !== input.graphCallDigest
  ) return null;
  const calculus = deriveRuntimeEventCalculusProjection(prefix);
  if (closedEvents.length === 1) {
    return holdsAt(calculus, constructRuntimeFluent({
        name: "graph_call_closed",
        identity: input.graphCallId,
      }))
      ? "closed"
      : null;
  }
  return holdsAt(calculus, constructRuntimeFluent({
      name: "graph_call_active",
      identity: input.graphCallId,
    }))
    ? "active"
    : "inactive";
}

export function hasOpenedTraversalScope(
  store: AbgEventStore,
  scope: OpenedTraversalScope,
): boolean {
  return hasOpenedTraversalScopeAtPrefix(
    selectValidatedRuntimeEventPrefix(store.readAll()),
    scope,
  );
}

export function hasOpenedTraversalScopeAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  scope: OpenedTraversalScope,
): boolean {
  if (!isOpenedTraversalScope(scope)) return false;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    scopeRef: _scopeRef,
    scopeDigest: _scopeDigest,
    ...body
  } = scope;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const runEvent = events.find((event) => event.eventId === scope.runOpenEventRef);
  const graphCallEvent = events.find((event) => event.eventId === scope.graphCallOpenEventRef);
  const frameEvent = events.find((event) => event.eventId === scope.frameOpenEventRef);
  return (
    sha256Canonical(body as unknown as JsonValue) === scope.scopeDigest &&
    scope.scopeRef === `traversal-scope://abiogenesis/${scope.scopeDigest.slice("sha256:".length)}` &&
    runEvent?.kind === "run_segment_opened" &&
    runEvent.aggregateType === "run" &&
    runEvent.aggregateId === scope.runId &&
    isRecord(runEvent.payload) &&
    runEvent.payload.runDigest === scope.runDigest &&
    graphCallEvent?.kind === "graph_call_opened" &&
    graphCallEvent.aggregateType === "graph_call" &&
    graphCallEvent.aggregateId === scope.graphCallId &&
    graphCallEvent.causationEventRefs.includes(scope.runOpenEventRef) &&
    isRecord(graphCallEvent.payload) &&
    graphCallEvent.payload.graphCallDigest === scope.graphCallDigest &&
    frameEvent?.kind === "frame_opened" &&
    frameEvent.aggregateType === "frame" &&
    frameEvent.aggregateId === scope.frameId &&
    frameEvent.causationEventRefs.includes(scope.graphCallOpenEventRef) &&
    isRecord(frameEvent.payload) &&
    frameEvent.payload.frameDigest === scope.frameDigest
  );
}

export function rehydrateOpenedTraversalScope(
  store: AbgEventStore,
  value: Readonly<Record<string, JsonValue>>,
): OpenedTraversalScope | null {
  return rehydrateOpenedTraversalScopeAtPrefix(
    selectValidatedRuntimeEventPrefix(store.readAll()),
    value,
  );
}

export function rehydrateOpenedTraversalScopeAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  value: Readonly<Record<string, JsonValue>>,
): OpenedTraversalScope | null {
  const scope = deepFreeze({
    kind: "opened_traversal_scope" as const,
    schemaVersion: "5.0.0" as const,
    ...value,
  }) as unknown as OpenedTraversalScope;
  openedScopes.add(scope);
  return hasOpenedTraversalScopeAtPrefix(prefix, scope) ? scope : null;
}

export function openCall(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  basis: RuntimeAdmissionBasis,
): OpenCallResult {
  const snapshot = store.readAll();
  const expectedStorePrefixDigest = sha256Canonical(
    snapshot as unknown as JsonValue,
  );
  let authorityPrefix: ValidatedRuntimeEventPrefix;
  let exactBasis: ExecutionBasis | null;
  try {
    if (store.digest() !== expectedStorePrefixDigest) throw new TypeError();
    authorityPrefix = selectValidatedRuntimeEventPrefix(snapshot);
    exactBasis = rehydrateExecutionBasisAtPrefix(
      authorityPrefix,
      executionBasis.basisRef,
    );
  } catch {
    exactBasis = null;
  }
  if (
    exactBasis === null ||
    !sameCanonicalValue(exactBasis, executionBasis) ||
    exactBasis.basisClass !== "root"
  ) {
    return {
      kind: "open_call_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "execution_basis_not_admitted",
      message: "openCall requires one exact ABG-admitted ExecutionBasis",
    };
  }
  const runBody = {
    executionBasisRef: exactBasis.basisRef,
    executionBasisDigest: exactBasis.basisDigest,
    invocationAdmissionRef: exactBasis.invocationAdmissionRef,
    invocationRef: exactBasis.invocationRef,
    workspaceBindingId: exactBasis.workspaceBindingId,
    programRef: exactBasis.programRef,
    graphFunctionRef: exactBasis.graphFunctionRef,
    graphRef: exactBasis.graphRef,
    graphDigest: exactBasis.graphDigest,
  };
  const runDigest = sha256Canonical(runBody as unknown as JsonValue);
  const runId = `run://abiogenesis/${runDigest.slice("sha256:".length)}`;
  if (projectRunPhaseAtPrefix(authorityPrefix!, {
    runId,
    runDigest,
    executionBasisRef: exactBasis.basisRef,
  }) !== "not_open") {
    return {
      kind: "open_call_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "execution_basis_already_opened",
      message: "openCall cannot open a second Run for the same root ExecutionBasis",
    };
  }

  return admitRuntimeEventTransactionAtExpectedPrefix(
    store,
    expectedStorePrefixDigest,
    () => {
  const runEvent = admitRuntimeEvent(store, {
    kind: "run_segment_opened",
    eventTime: basis.eventTime,
    aggregateType: "run",
    aggregateId: runId,
    parentAggregateId: executionBasis.workspaceBindingId,
    causationEventRefs: [executionBasis.admissionEventRef, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: executionBasis.graphRef,
    payload: { runId, runDigest, ...runBody },
  });
  const run = deepFreeze({
    runId,
    runDigest,
    ...runBody,
    openEventRef: runEvent.eventId,
  }) as OpenedRun;

  const graphCallBody = {
    runId,
    executionBasisRef: executionBasis.basisRef,
    invocationRef: executionBasis.invocationRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphFunctionDigest: executionBasis.graphFunctionDigest,
    graphRef: executionBasis.graphRef,
    graphDigest: executionBasis.graphDigest,
  };
  const graphCallDigest = sha256Canonical(graphCallBody as unknown as JsonValue);
  const graphCallId = `graph-call://abiogenesis/${graphCallDigest.slice("sha256:".length)}`;
  const graphCallEvent = admitRuntimeEvent(store, {
    kind: "graph_call_opened",
    eventTime: basis.eventTime,
    aggregateType: "graph_call",
    aggregateId: graphCallId,
    parentAggregateId: runId,
    causationEventRefs: [runEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: executionBasis.graphRef,
    graphCallId,
    payload: { graphCallId, graphCallDigest, ...graphCallBody },
  });
  const graphCall = deepFreeze({
    graphCallId,
    graphCallDigest,
    ...graphCallBody,
    openEventRef: graphCallEvent.eventId,
  }) as OpenedGraphCall;

  const frameLineageDigest = sha256Canonical({
    runId,
    graphCallId,
    invocationRef: executionBasis.invocationRef,
  });
  const frameLineageId = `frame-lineage://abiogenesis/${frameLineageDigest.slice("sha256:".length)}`;
  const frameBody = {
    frameLineageId,
    attempt: 1 as const,
    parentFrameId: null,
    runId,
    graphCallId,
    executionBasisRef: executionBasis.basisRef,
    invocationRef: executionBasis.invocationRef,
    admittedInputRef: executionBasis.rawInputAdmissionRef,
    admittedInputDigest: executionBasis.rawInputDigest,
  };
  const frameDigest = sha256Canonical(frameBody as unknown as JsonValue);
  const frameId = `frame://abiogenesis/${frameDigest.slice("sha256:".length)}`;
  const frameEvent = admitRuntimeEvent(store, {
    kind: "frame_opened",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: frameId,
    parentAggregateId: graphCallId,
    causationEventRefs: [graphCallEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: executionBasis.graphRef,
    graphCallId,
    frameId,
    frameLineageId,
    payload: { frameId, frameDigest, ...frameBody },
  });
  const frame = deepFreeze({
    frameId,
    frameDigest,
    ...frameBody,
    openEventRef: frameEvent.eventId,
  }) as OpenedFrame;

  const scopeBody = {
    executionBasisRef: executionBasis.basisRef,
    executionBasisDigest: executionBasis.basisDigest,
    invocationAdmissionRef: executionBasis.invocationAdmissionRef,
    invocationRef: executionBasis.invocationRef,
    programRef: executionBasis.programRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphRef: executionBasis.graphRef,
    runId,
    runDigest,
    runOpenEventRef: runEvent.eventId,
    graphCallId,
    graphCallDigest,
    graphCallOpenEventRef: graphCallEvent.eventId,
    frameId,
    frameDigest,
    frameLineageId,
    frameOpenEventRef: frameEvent.eventId,
  };
  const scopeDigest = sha256Canonical(scopeBody as unknown as JsonValue);
  const scope = deepFreeze({
    kind: "opened_traversal_scope" as const,
    schemaVersion: "5.0.0" as const,
    scopeRef: `traversal-scope://abiogenesis/${scopeDigest.slice("sha256:".length)}`,
    scopeDigest,
    ...scopeBody,
  }) as OpenedTraversalScope;
  openedScopes.add(scope);

  return deepFreeze({
    kind: "open_call_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "opened" as const,
    run,
    graphCall,
    frame,
    scope,
  }) as OpenCallAdmission;
    },
  ).value;
}

export function openChildCall(
  store: AbgEventStore,
  parentScope: OpenedTraversalScope,
  executionBasis: ExecutionBasis,
  basis: RuntimeAdmissionBasis,
): OpenChildCallResult {
  const current = (() => {
    try {
      const snapshot = store.readAll();
      const expectedStorePrefixDigest = sha256Canonical(
        snapshot as unknown as JsonValue,
      );
      if (store.digest() !== expectedStorePrefixDigest) return null;
      const authorityPrefix = selectValidatedRuntimeEventPrefix(snapshot);
      const runPrefix = selectValidatedRuntimeEventPrefix(
        runtimeEventsFromValidatedPrefix(authorityPrefix),
        { runId: parentScope.runId },
      );
      const exactBasis = rehydrateExecutionBasisAtPrefix(
        authorityPrefix,
        executionBasis.basisRef,
      );
      const exactParentScope = rehydrateOpenedTraversalScopeAtPrefix(
        runPrefix,
        parentScope as unknown as Readonly<Record<string, JsonValue>>,
      );
      if (
        exactBasis === null ||
        exactParentScope === null ||
        !sameCanonicalValue(exactBasis, executionBasis) ||
        !sameCanonicalValue(exactParentScope, parentScope) ||
        exactBasis.basisClass !== "child" ||
        exactBasis.parentCCallRef === null ||
        exactBasis.parentExecutionBasisRef === null
      ) return null;
      const parentCCall = projectCurrentChildParentCCallAtPrefix(runPrefix, {
        parentCCallRef: exactBasis.parentCCallRef,
        parentExecutionBasisRef: exactBasis.parentExecutionBasisRef,
        runId: exactParentScope.runId,
        graphCallId: exactParentScope.graphCallId,
        frameId: exactParentScope.frameId,
        childGraphFunctionRef: exactBasis.graphFunctionRef,
        admittedInputRef: exactBasis.rawInputAdmissionRef,
        admittedInputDigest: exactBasis.rawInputDigest,
      });
      return parentCCall === null ? null : {
        expectedStorePrefixDigest,
        authorityPrefix,
        runPrefix,
        exactBasis,
        exactParentScope,
        parentCCall,
      };
    } catch {
      return null;
    }
  })();
  if (
    current === null ||
    executionBasis.basisClass !== "child"
  ) {
    return {
      kind: "open_child_call_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "child_basis_not_admitted",
      message: "child call requires one exact ABG-admitted child ExecutionBasis",
    };
  }
  if (
    executionBasis.parentExecutionBasisRef !== parentScope.executionBasisRef ||
    executionBasis.parentTraversalScopeRef !== parentScope.scopeRef ||
    executionBasis.invocationAdmissionRef !== parentScope.invocationAdmissionRef ||
    executionBasis.programRef !== parentScope.programRef
  ) {
    return {
      kind: "open_child_call_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "parent_scope_mismatch",
      message: "child call basis does not descend from the exact parent traversal scope",
    };
  }
  const graphCallBody = {
    runId: current.exactParentScope.runId,
    executionBasisRef: current.exactBasis.basisRef,
    invocationRef: current.exactBasis.invocationRef,
    graphFunctionRef: current.exactBasis.graphFunctionRef,
    graphFunctionDigest: current.exactBasis.graphFunctionDigest,
    graphRef: current.exactBasis.graphRef,
    graphDigest: current.exactBasis.graphDigest,
    parentFrameId: current.exactParentScope.frameId,
  };
  const graphCallDigest = sha256Canonical(
    graphCallBody as unknown as JsonValue,
  );
  const graphCallId =
    `graph-call://abiogenesis/${graphCallDigest.slice("sha256:".length)}`;
  if (projectGraphCallPhaseAtPrefix(current.runPrefix, {
    graphCallId,
    graphCallDigest,
    executionBasisRef: current.exactBasis.basisRef,
  }) !== "not_open") {
    return {
      kind: "open_child_call_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "child_basis_already_opened",
      message: "one child ExecutionBasis cannot open a second GraphCall",
    };
  }

  return admitRuntimeEventTransactionAtExpectedPrefix(
    store,
    current.expectedStorePrefixDigest,
    () => {
  const graphCallEvent = admitRuntimeEvent(store, {
    kind: "graph_call_opened",
    eventTime: basis.eventTime,
    aggregateType: "graph_call",
    aggregateId: graphCallId,
    parentAggregateId: parentScope.runId,
    causationEventRefs: [
      current.parentCCall.causationEventRef,
      parentScope.runOpenEventRef,
      parentScope.frameOpenEventRef,
      executionBasis.admissionEventRef,
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: parentScope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: executionBasis.graphRef,
    graphCallId,
    payload: { graphCallId, graphCallDigest, ...graphCallBody },
  });
  const graphCall = deepFreeze({
    graphCallId,
    graphCallDigest,
    ...graphCallBody,
    openEventRef: graphCallEvent.eventId,
  }) as OpenedGraphCall;

  const frameLineageDigest = sha256Canonical({
    runId: parentScope.runId,
    graphCallId,
    invocationRef: executionBasis.invocationRef,
    parentFrameId: parentScope.frameId,
  });
  const frameLineageId =
    `frame-lineage://abiogenesis/${frameLineageDigest.slice("sha256:".length)}`;
  const frameBody = {
    frameLineageId,
    attempt: 1,
    parentFrameId: parentScope.frameId,
    runId: parentScope.runId,
    graphCallId,
    executionBasisRef: executionBasis.basisRef,
    invocationRef: executionBasis.invocationRef,
    admittedInputRef: executionBasis.rawInputAdmissionRef,
    admittedInputDigest: executionBasis.rawInputDigest,
  };
  const frameDigest = sha256Canonical(frameBody as unknown as JsonValue);
  const frameId = `frame://abiogenesis/${frameDigest.slice("sha256:".length)}`;
  const frameEvent = admitRuntimeEvent(store, {
    kind: "frame_opened",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: frameId,
    parentAggregateId: graphCallId,
    causationEventRefs: [graphCallEvent.eventId],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: parentScope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: executionBasis.graphRef,
    graphCallId,
    frameId,
    frameLineageId,
    payload: { frameId, frameDigest, ...frameBody },
  });
  const frame = deepFreeze({
    frameId,
    frameDigest,
    ...frameBody,
    openEventRef: frameEvent.eventId,
  }) as OpenedFrame;

  const scopeBody = {
    executionBasisRef: executionBasis.basisRef,
    executionBasisDigest: executionBasis.basisDigest,
    invocationAdmissionRef: executionBasis.invocationAdmissionRef,
    invocationRef: executionBasis.invocationRef,
    programRef: executionBasis.programRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphRef: executionBasis.graphRef,
    runId: parentScope.runId,
    runDigest: parentScope.runDigest,
    runOpenEventRef: parentScope.runOpenEventRef,
    graphCallId,
    graphCallDigest,
    graphCallOpenEventRef: graphCallEvent.eventId,
    frameId,
    frameDigest,
    frameLineageId,
    frameOpenEventRef: frameEvent.eventId,
  };
  const scopeDigest = sha256Canonical(scopeBody as unknown as JsonValue);
  const scope = deepFreeze({
    kind: "opened_traversal_scope" as const,
    schemaVersion: "5.0.0" as const,
    scopeRef: `traversal-scope://abiogenesis/${scopeDigest.slice("sha256:".length)}`,
    scopeDigest,
    ...scopeBody,
  }) as OpenedTraversalScope;
  openedScopes.add(scope);
  return deepFreeze({
    kind: "open_child_call_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "opened" as const,
    graphCall,
    frame,
    scope,
  }) as OpenChildCallAdmission;
    },
  ).value;
}
