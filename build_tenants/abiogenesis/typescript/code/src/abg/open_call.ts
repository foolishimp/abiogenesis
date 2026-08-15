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
  assertHeldEventStoreAtDurablePrefix,
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
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
  readonly parentFrameId?: string;
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

export interface OpenTraversalScopeAdmission {
  readonly kind: "traversal_scope_open_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "opened";
  readonly scopeClass: "root" | "child";
  readonly run: OpenedRun | null;
  readonly graphCall: OpenedGraphCall;
  readonly frame: OpenedFrame;
  readonly scope: OpenedTraversalScope;
  readonly successorPrefix: DurablePrefixCoordinate;
}

export interface OpenTraversalScopeRefusal {
  readonly kind: "traversal_scope_open_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "execution_basis_already_opened"
    | "execution_basis_not_admitted"
    | "child_basis_already_opened"
    | "child_basis_not_admitted"
    | "parent_scope_mismatch";
  readonly message: string;
}

export type TraversalScopeOpenSubject =
  | Readonly<{
      kind: "root";
      executionBasis: ExecutionBasis;
    }>
  | Readonly<{
      kind: "child";
      executionBasis: ExecutionBasis;
      parentScope: OpenedTraversalScope;
    }>;

export type OpenTraversalScopeResult =
  | OpenTraversalScopeAdmission
  | OpenTraversalScopeRefusal;

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

function scopeOpenRefusal(
  code: OpenTraversalScopeRefusal["code"],
  message: string,
): OpenTraversalScopeRefusal {
  return deepFreeze({
    kind: "traversal_scope_open_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
  });
}

type TraversalScopeOpeningContext =
  | Readonly<{
      kind: "root";
      expectedStorePrefixDigest: Sha256Digest;
      exactBasis: ExecutionBasis;
      runId: string;
      runDigest: Sha256Digest;
      runBody: Readonly<Record<string, JsonValue>>;
    }>
  | Readonly<{
      kind: "child";
      expectedStorePrefixDigest: Sha256Digest;
      exactBasis: ExecutionBasis;
      parentScope: OpenedTraversalScope;
      parentCCallCausationEventRef: string;
    }>;

/**
 * Opens one root or child traversal scope through the single ABG lifecycle
 * algebra. Root adds Run.open; both variants share the exact GraphCall,
 * Frame, scope identity, and expected-prefix commit relations.
 */
export function openTraversalScope(
  store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate,
  subject: TraversalScopeOpenSubject,
  basis: RuntimeAdmissionBasis,
): OpenTraversalScopeResult {
  let snapshot: readonly import("./event_store.js").RuntimeEvent[];
  try {
    assertHeldEventStoreAtDurablePrefix(store, predecessorPrefix);
    snapshot = readRuntimeEventsAtDurablePrefix(predecessorPrefix);
  } catch {
    return scopeOpenRefusal(
      subject.kind === "root"
        ? "execution_basis_not_admitted"
        : "child_basis_not_admitted",
      "scope opening requires one exact durable predecessor prefix",
    );
  }
  const expectedStorePrefixDigest = sha256Canonical(
    snapshot as unknown as JsonValue,
  );
  if (store.digest() !== expectedStorePrefixDigest) {
    return scopeOpenRefusal(
      subject.kind === "root"
        ? "execution_basis_not_admitted"
        : "child_basis_not_admitted",
      "scope opening requires the held store at its exact durable prefix",
    );
  }
  let authorityPrefix: ValidatedRuntimeEventPrefix;
  try {
    authorityPrefix = selectValidatedRuntimeEventPrefix(snapshot);
  } catch {
    return scopeOpenRefusal(
      subject.kind === "root"
        ? "execution_basis_not_admitted"
        : "child_basis_not_admitted",
      "scope opening requires one valid ABG event prefix",
    );
  }

  let context: TraversalScopeOpeningContext;
  if (subject.kind === "root") {
    const exactBasis = rehydrateExecutionBasisAtPrefix(
      authorityPrefix,
      subject.executionBasis.basisRef,
    );
    if (
      exactBasis === null || exactBasis.basisClass !== "root" ||
      !sameCanonicalValue(exactBasis, subject.executionBasis)
    ) {
      return scopeOpenRefusal(
        "execution_basis_not_admitted",
        "root scope opening requires one exact admitted root ExecutionBasis",
      );
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
    if (projectRunPhaseAtPrefix(authorityPrefix, {
      runId,
      runDigest,
      executionBasisRef: exactBasis.basisRef,
    }) !== "not_open") {
      return scopeOpenRefusal(
        "execution_basis_already_opened",
        "one root ExecutionBasis cannot open a second Run",
      );
    }
    context = deepFreeze({
      kind: "root" as const,
      expectedStorePrefixDigest,
      exactBasis,
      runId,
      runDigest,
      runBody: runBody as unknown as Readonly<Record<string, JsonValue>>,
    });
  } else {
    const runPrefix = selectValidatedRuntimeEventPrefix(
      runtimeEventsFromValidatedPrefix(authorityPrefix),
      { runId: subject.parentScope.runId },
    );
    const exactBasis = rehydrateExecutionBasisAtPrefix(
      authorityPrefix,
      subject.executionBasis.basisRef,
    );
    const exactParentScope = rehydrateOpenedTraversalScopeAtPrefix(
      runPrefix,
      subject.parentScope as unknown as Readonly<Record<string, JsonValue>>,
    );
    if (
      exactBasis === null || exactBasis.basisClass !== "child" ||
      exactParentScope === null || exactBasis.parentCCallRef === null ||
      exactBasis.parentExecutionBasisRef === null ||
      !sameCanonicalValue(exactBasis, subject.executionBasis) ||
      !sameCanonicalValue(exactParentScope, subject.parentScope)
    ) {
      return scopeOpenRefusal(
        "child_basis_not_admitted",
        "child scope opening requires one exact admitted child ExecutionBasis",
      );
    }
    if (
      exactBasis.parentExecutionBasisRef !==
        exactParentScope.executionBasisRef ||
      exactBasis.parentTraversalScopeRef !== exactParentScope.scopeRef ||
      exactBasis.invocationAdmissionRef !==
        exactParentScope.invocationAdmissionRef ||
      exactBasis.programRef !== exactParentScope.programRef
    ) {
      return scopeOpenRefusal(
        "parent_scope_mismatch",
        "child ExecutionBasis does not descend from the exact parent scope",
      );
    }
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
    if (parentCCall === null) {
      return scopeOpenRefusal(
        "child_basis_not_admitted",
        "child scope opening requires its exact current parent CCall",
      );
    }
    const graphCallBody = {
      runId: exactParentScope.runId,
      executionBasisRef: exactBasis.basisRef,
      invocationRef: exactBasis.invocationRef,
      graphFunctionRef: exactBasis.graphFunctionRef,
      graphFunctionDigest: exactBasis.graphFunctionDigest,
      graphRef: exactBasis.graphRef,
      graphDigest: exactBasis.graphDigest,
      parentFrameId: exactParentScope.frameId,
    };
    const graphCallDigest = sha256Canonical(
      graphCallBody as unknown as JsonValue,
    );
    const graphCallId =
      `graph-call://abiogenesis/${graphCallDigest.slice("sha256:".length)}`;
    if (projectGraphCallPhaseAtPrefix(runPrefix, {
      graphCallId,
      graphCallDigest,
      executionBasisRef: exactBasis.basisRef,
    }) !== "not_open") {
      return scopeOpenRefusal(
        "child_basis_already_opened",
        "one child ExecutionBasis cannot open a second GraphCall",
      );
    }
    context = deepFreeze({
      kind: "child" as const,
      expectedStorePrefixDigest,
      exactBasis,
      parentScope: exactParentScope,
      parentCCallCausationEventRef: parentCCall.causationEventRef,
    });
  }

  const committed = admitRuntimeEventTransactionAtExpectedPrefix(
    store,
    context.expectedStorePrefixDigest,
    () => {
      const executionBasis = context.exactBasis;
      const openedRun = context.kind === "root"
        ? (() => {
            const runEvent = admitRuntimeEvent(store, {
              kind: "run_segment_opened",
              eventTime: basis.eventTime,
              aggregateType: "run",
              aggregateId: context.runId,
              parentAggregateId: executionBasis.workspaceBindingId,
              causationEventRefs: [
                executionBasis.admissionEventRef,
                ...basis.causationEventRefs,
              ],
              correlationId: basis.correlationId,
              workflowVersion: "5.0.0",
              scopeClass: "run",
              basisId: executionBasis.basisRef,
              runId: context.runId,
              graphFunctionRef: executionBasis.graphFunctionRef,
              materializationRef: executionBasis.graphRef,
              payload: {
                runId: context.runId,
                runDigest: context.runDigest,
                ...context.runBody,
              },
            });
            return deepFreeze({
              runId: context.runId,
              runDigest: context.runDigest,
              ...context.runBody,
              openEventRef: runEvent.eventId,
            }) as unknown as OpenedRun;
          })()
        : null;
      const runId = context.kind === "root"
        ? context.runId
        : context.parentScope.runId;
      const runDigest = context.kind === "root"
        ? context.runDigest
        : context.parentScope.runDigest;
      const runOpenEventRef = context.kind === "root"
        ? openedRun!.openEventRef
        : context.parentScope.runOpenEventRef;
      const parentFrameId = context.kind === "child"
        ? context.parentScope.frameId
        : null;
      const graphCallBody = {
        runId,
        executionBasisRef: executionBasis.basisRef,
        invocationRef: executionBasis.invocationRef,
        graphFunctionRef: executionBasis.graphFunctionRef,
        graphFunctionDigest: executionBasis.graphFunctionDigest,
        graphRef: executionBasis.graphRef,
        graphDigest: executionBasis.graphDigest,
        ...(parentFrameId === null ? {} : { parentFrameId }),
      };
      const graphCallDigest = sha256Canonical(
        graphCallBody as unknown as JsonValue,
      );
      const graphCallId =
        `graph-call://abiogenesis/${graphCallDigest.slice("sha256:".length)}`;
      const graphCallEvent = admitRuntimeEvent(store, {
        kind: "graph_call_opened",
        eventTime: basis.eventTime,
        aggregateType: "graph_call",
        aggregateId: graphCallId,
        parentAggregateId: runId,
        causationEventRefs: context.kind === "root"
          ? [runOpenEventRef]
          : [
              context.parentCCallCausationEventRef,
              context.parentScope.runOpenEventRef,
              context.parentScope.frameOpenEventRef,
              executionBasis.admissionEventRef,
              ...basis.causationEventRefs,
            ],
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

      const frameLineageBody = {
        runId,
        graphCallId,
        invocationRef: executionBasis.invocationRef,
        ...(parentFrameId === null ? {} : { parentFrameId }),
      };
      const frameLineageDigest = sha256Canonical(
        frameLineageBody as unknown as JsonValue,
      );
      const frameLineageId =
        `frame-lineage://abiogenesis/${frameLineageDigest.slice("sha256:".length)}`;
      const frameBody = {
        frameLineageId,
        attempt: 1 as const,
        parentFrameId,
        runId,
        graphCallId,
        executionBasisRef: executionBasis.basisRef,
        invocationRef: executionBasis.invocationRef,
        admittedInputRef: executionBasis.rawInputAdmissionRef,
        admittedInputDigest: executionBasis.rawInputDigest,
      };
      const frameDigest = sha256Canonical(frameBody as unknown as JsonValue);
      const frameId =
        `frame://abiogenesis/${frameDigest.slice("sha256:".length)}`;
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
        runOpenEventRef,
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
        scopeRef:
          `traversal-scope://abiogenesis/${scopeDigest.slice("sha256:".length)}`,
        scopeDigest,
        ...scopeBody,
      }) as OpenedTraversalScope;
      openedScopes.add(scope);
      return deepFreeze({
        kind: "traversal_scope_open_admission" as const,
        schemaVersion: "5.0.0" as const,
        disposition: "opened" as const,
        scopeClass: context.kind,
        run: openedRun,
        graphCall,
        frame,
        scope,
      });
    },
  );
  if (committed.successorPrefix === null) {
    throw new TypeError("scope opening produced no durable successor prefix");
  }
  return deepFreeze({
    ...committed.value,
    successorPrefix: committed.successorPrefix,
  }) as OpenTraversalScopeAdmission;
}
