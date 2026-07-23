import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasAdmittedExecutionBasis,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";

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

export function hasOpenedTraversalScope(
  store: AbgEventStore,
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
  const events = store.readAll();
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

export function openCall(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  basis: RuntimeAdmissionBasis,
): OpenCallResult {
  if (!hasAdmittedExecutionBasis(store, executionBasis)) {
    return {
      kind: "open_call_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "execution_basis_not_admitted",
      message: "openCall requires one exact ABG-admitted ExecutionBasis",
    };
  }
  if (
    store.readAll().some(
      (event) => event.kind === "run_segment_opened" && event.basisId === executionBasis.basisRef,
    )
  ) {
    return {
      kind: "open_call_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "execution_basis_already_opened",
      message: "openCall cannot open a second Run for the same root ExecutionBasis",
    };
  }

  const runBody = {
    executionBasisRef: executionBasis.basisRef,
    executionBasisDigest: executionBasis.basisDigest,
    invocationAdmissionRef: executionBasis.invocationAdmissionRef,
    invocationRef: executionBasis.invocationRef,
    workspaceBindingId: executionBasis.workspaceBindingId,
    programRef: executionBasis.programRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphRef: executionBasis.graphRef,
    graphDigest: executionBasis.graphDigest,
  };
  const runDigest = sha256Canonical(runBody as unknown as JsonValue);
  const runId = `run://abiogenesis/${runDigest.slice("sha256:".length)}`;
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
}

export function openChildCall(
  store: AbgEventStore,
  parentScope: OpenedTraversalScope,
  executionBasis: ExecutionBasis,
  basis: RuntimeAdmissionBasis,
): OpenChildCallResult {
  if (
    !hasAdmittedExecutionBasis(store, executionBasis) ||
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
    !hasOpenedTraversalScope(store, parentScope) ||
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
  if (
    store.readAll().some(
      (event) => event.kind === "graph_call_opened" && event.basisId === executionBasis.basisRef,
    )
  ) {
    return {
      kind: "open_child_call_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "child_basis_already_opened",
      message: "one child ExecutionBasis cannot open a second GraphCall",
    };
  }

  const graphCallBody = {
    runId: parentScope.runId,
    executionBasisRef: executionBasis.basisRef,
    invocationRef: executionBasis.invocationRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphFunctionDigest: executionBasis.graphFunctionDigest,
    graphRef: executionBasis.graphRef,
    graphDigest: executionBasis.graphDigest,
    parentFrameId: parentScope.frameId,
  };
  const graphCallDigest = sha256Canonical(graphCallBody as unknown as JsonValue);
  const graphCallId = `graph-call://abiogenesis/${graphCallDigest.slice("sha256:".length)}`;
  const graphCallEvent = admitRuntimeEvent(store, {
    kind: "graph_call_opened",
    eventTime: basis.eventTime,
    aggregateType: "graph_call",
    aggregateId: graphCallId,
    parentAggregateId: parentScope.runId,
    causationEventRefs: [
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
}
