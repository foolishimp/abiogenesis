import type { GtlGraph } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isGraphValidation, type GraphValidation } from "../validator/graph.js";
import {
  hasAdmittedExecutionBasis,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import { AbgEventStore, admitRuntimeEvent } from "./event_store.js";
import {
  hasOpenedTraversalScope,
  type OpenedTraversalScope,
} from "./open_call.js";

export interface TraversalCursorCandidate {
  readonly kind: "traversal_cursor";
  readonly schemaVersion: "5.0.0";
  readonly cursorRef: string;
  readonly cursorDigest: Sha256Digest;
  readonly programRef: string;
  readonly executionBasisRef: string;
  readonly traversalScopeRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly graphRef: string;
  readonly currentNodeRef: string;
  readonly position: "at_compute_locus" | "at_term";
  readonly termPath: readonly string[];
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly retryPath: readonly number[];
}

export interface TraversalCursorAdmission {
  readonly kind: "traversal_cursor_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly cursorRef: string;
  readonly cursorDigest: Sha256Digest;
  readonly traversalScopeRef: string;
  readonly executionBasisRef: string;
  readonly admissionEventRef: string;
}

export interface TraversalCursorAdmissionRefusal {
  readonly kind: "traversal_cursor_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "basis_mismatch"
    | "cursor_mismatch"
    | "cursor_not_initial"
    | "cursor_repeated"
    | "graph_mismatch"
    | "scope_mismatch";
  readonly message: string;
}

export type TraversalCursorAdmissionResult =
  | TraversalCursorAdmission
  | TraversalCursorAdmissionRefusal;

const cursorAdmissions = new WeakSet<object>();

function isJsonRecord(
  value: JsonValue,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function refusal(
  code: TraversalCursorAdmissionRefusal["code"],
  message: string,
): TraversalCursorAdmissionRefusal {
  return {
    kind: "traversal_cursor_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function cursorBody(cursor: TraversalCursorCandidate): JsonValue {
  return {
    programRef: cursor.programRef,
    executionBasisRef: cursor.executionBasisRef,
    traversalScopeRef: cursor.traversalScopeRef,
    runId: cursor.runId,
    graphCallId: cursor.graphCallId,
    frameId: cursor.frameId,
    graphRef: cursor.graphRef,
    currentNodeRef: cursor.currentNodeRef,
    position: cursor.position,
    termPath: cursor.termPath,
    taskOrdinal: cursor.taskOrdinal,
    attempt: cursor.attempt,
    retryPath: cursor.retryPath,
  };
}

export function traversalCursorAdmissionEventRef(
  store: AbgEventStore,
  cursor: TraversalCursorCandidate,
): string | null {
  if (!isTraversalCursorCandidate(cursor)) return null;
  const event = store.readAll().find((candidate) =>
    candidate.aggregateType === "frame" &&
    candidate.aggregateId === cursor.frameId &&
    isJsonRecord(candidate.payload) &&
    (
      (
        candidate.kind === "traversal_cursor_entered" &&
        candidate.payload.cursorRef === cursor.cursorRef &&
        candidate.payload.cursorDigest === cursor.cursorDigest
      ) ||
      (
        candidate.kind === "traversal_route_admitted" &&
        candidate.payload.targetCursorRef === cursor.cursorRef &&
        candidate.payload.targetCursorDigest === cursor.cursorDigest
      )
    )
  );
  return event?.eventId ?? null;
}

export function isTraversalCursorCandidate(
  cursor: TraversalCursorCandidate,
): boolean {
  const expectedDigest = sha256Canonical(cursorBody(cursor));
  return cursor.kind === "traversal_cursor" &&
    cursor.schemaVersion === "5.0.0" &&
    cursor.cursorDigest === expectedDigest &&
    cursor.cursorRef ===
      `traversal-cursor://abiogenesis/${expectedDigest.slice("sha256:".length)}`;
}

export function hasAdmittedTraversalCursor(
  store: AbgEventStore,
  cursor: TraversalCursorCandidate,
): boolean {
  return traversalCursorAdmissionEventRef(store, cursor) !== null;
}

export function isTraversalCursorAdmission(value: object): boolean {
  return cursorAdmissions.has(value);
}

export function admitInitialTraversalCursor(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
  graph: Readonly<GtlGraph>,
  graphValidation: GraphValidation,
  cursor: TraversalCursorCandidate,
  basis: RuntimeAdmissionBasis,
): TraversalCursorAdmissionResult {
  if (!hasAdmittedExecutionBasis(store, executionBasis)) {
    return refusal("basis_mismatch", "cursor admission requires the exact admitted ExecutionBasis");
  }
  if (
    !hasOpenedTraversalScope(store, scope) ||
    scope.executionBasisRef !== executionBasis.basisRef ||
    scope.executionBasisDigest !== executionBasis.basisDigest
  ) {
    return refusal("scope_mismatch", "cursor admission requires this basis's opened traversal scope");
  }
  if (
    !isGraphValidation(graphValidation) ||
    graph.materializationRef !== executionBasis.graphRef ||
    graph.materializationDigest !== executionBasis.graphDigest ||
    graphValidation.validationRef !== executionBasis.graphValidationRef ||
    graphValidation.graphRef !== graph.materializationRef ||
    graphValidation.graphDigest !== graph.materializationDigest
  ) {
    return refusal("graph_mismatch", "cursor admission requires the exact validated original GTL Graph");
  }
  const expectedDigest = sha256Canonical(cursorBody(cursor));
  if (
    cursor.kind !== "traversal_cursor" ||
    cursor.schemaVersion !== "5.0.0" ||
    cursor.cursorDigest !== expectedDigest ||
    cursor.cursorRef !==
      `traversal-cursor://abiogenesis/${expectedDigest.slice("sha256:".length)}` ||
    cursor.programRef !== executionBasis.programRef ||
    cursor.executionBasisRef !== executionBasis.basisRef ||
    cursor.traversalScopeRef !== scope.scopeRef ||
    cursor.runId !== scope.runId ||
    cursor.graphCallId !== scope.graphCallId ||
    cursor.frameId !== scope.frameId ||
    cursor.graphRef !== graph.materializationRef
  ) {
    return refusal("cursor_mismatch", "cursor identity or opened lineage differs from the admitted basis");
  }
  if (
    cursor.position !== "at_term" ||
    cursor.currentNodeRef !== graph.template.startNodeRef ||
    cursor.termPath.join("\0") !==
      ["node", graph.template.startNodeRef, "c"].join("\0") ||
    cursor.taskOrdinal !== null ||
    cursor.attempt !== 1 ||
    cursor.retryPath.length !== 0
  ) {
    return refusal("cursor_not_initial", "initial cursor must name the exact root C term and initial coordinates");
  }
  if (
    traversalCursorAdmissionEventRef(store, cursor) !== null ||
    store.readAll().some((event) =>
      event.kind === "traversal_cursor_entered" && event.aggregateId === scope.frameId)
  ) {
    return refusal("cursor_repeated", "one frame cannot admit a second initial traversal cursor");
  }
  if (store.readAll().at(-1)?.eventId !== scope.frameOpenEventRef) {
    return refusal("scope_mismatch", "initial cursor must immediately extend the opened frame truth");
  }

  const event = admitRuntimeEvent(store, {
    kind: "traversal_cursor_entered",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: scope.frameId,
    parentAggregateId: scope.graphCallId,
    causationEventRefs: [scope.frameOpenEventRef, ...basis.causationEventRefs],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    frameLineageId: scope.frameLineageId,
    payload: {
      cursorRef: cursor.cursorRef,
      cursorDigest: cursor.cursorDigest,
      programRef: executionBasis.programRef,
      programDigest: executionBasis.programDigest,
      graphFunctionRef: executionBasis.graphFunctionRef,
      graphFunctionDigest: executionBasis.graphFunctionDigest,
      materializationRef: graph.materializationRef,
      materializationDigest: graph.materializationDigest,
      termPath: cursor.termPath,
      taskOrdinal: cursor.taskOrdinal,
      attempt: cursor.attempt,
      retryPath: cursor.retryPath,
      inputRef: executionBasis.rawInputAdmissionRef,
      inputDigest: executionBasis.rawInputDigest,
      traversalScopeRef: scope.scopeRef,
      traversalScopeDigest: scope.scopeDigest,
      executionBasisRef: executionBasis.basisRef,
      executionBasisDigest: executionBasis.basisDigest,
    },
  });
  const admission = deepFreeze({
    kind: "traversal_cursor_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    cursorRef: cursor.cursorRef,
    cursorDigest: cursor.cursorDigest,
    traversalScopeRef: scope.scopeRef,
    executionBasisRef: executionBasis.basisRef,
    admissionEventRef: event.eventId,
  }) as TraversalCursorAdmission;
  cursorAdmissions.add(admission);
  return admission;
}
