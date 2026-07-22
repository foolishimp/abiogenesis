import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { eventCalculusEffect } from "./event_calculus.js";
import type {
  AbgEventStore,
  RootEventKind,
  RuntimeEvent,
  RuntimeEventScope,
} from "./event_store.js";
import type { TraversalRouteKind } from "./traversal_route.js";

export interface ReplayCCallState {
  readonly cCallRef: string;
  readonly eventKinds: readonly RootEventKind[];
  readonly evidenceRefs: readonly string[];
  readonly resultRef: string | null;
  readonly resultDigest: Sha256Digest | null;
  readonly resultClass: string | null;
  readonly resultContractRef: string | null;
  readonly resultValueKind: string | null;
  readonly resultValue: JsonValue | null;
  readonly judgmentRef: string | null;
  readonly judgment: string | null;
  readonly status: "fibre_selected" | "judged" | "opened" | "result_admitted";
}

export interface ReplayRouteState {
  readonly routeRef: string;
  readonly routeDigest: Sha256Digest;
  readonly routeKind: TraversalRouteKind;
  readonly declarationRef: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: Sha256Digest | null;
  readonly cCallRef: string | null;
  readonly judgmentRef: string | null;
  readonly admissionEventRef: string;
}

export interface ReplayState {
  readonly kind: "replay_state";
  readonly schemaVersion: "5.0.0";
  readonly replayRef: string;
  readonly replayDigest: Sha256Digest;
  readonly eventStoreDigest: Sha256Digest;
  readonly eventCount: number;
  readonly lastAdmissionOrdinal: number;
  readonly runId: string | null;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly traversalCursorRef: string | null;
  readonly traversalCursorDigest: Sha256Digest | null;
  readonly traversalCursorEventRef: string | null;
  readonly cCalls: readonly ReplayCCallState[];
  readonly routes: readonly ReplayRouteState[];
  readonly activeFluents: readonly string[];
  readonly terminalReachedEventRef: string | null;
  readonly frameClosedEventRef: string | null;
  readonly graphCallClosedEventRef: string | null;
  readonly runClosedEventRef: string | null;
  readonly invocationRefusalEventRef: string | null;
  readonly runtimeFailureEventRef: string | null;
  readonly runtimeStatus:
    | "active"
    | "blocked"
    | "closed"
    | "failed"
    | "refused"
    | "workspace";
}

function isRecord(value: JsonValue): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(event: RuntimeEvent, name: string): string | null {
  if (!isRecord(event.payload)) return null;
  const value = event.payload[name];
  return typeof value === "string" ? value : null;
}

function validateCCallOrder(events: readonly RuntimeEvent[]): void {
  const ranks: Readonly<Record<string, number>> = {
    c_call_opened: 0,
    c_call_fibre_selected: 1,
    c_call_evidenced: 2,
    c_call_result_admitted: 3,
    c_call_judged: 4,
  };
  let previous = -1;
  for (const event of events) {
    const rank = ranks[event.kind];
    if (rank === undefined || rank < previous || (rank === previous && event.kind !== "c_call_evidenced")) {
      throw new TypeError(`invalid CCall replay order at ${event.eventId}`);
    }
    previous = rank;
  }
}

export function replay(store: AbgEventStore, scope?: RuntimeEventScope): ReplayState {
  const admittedEvents = store.readAll();
  for (const [index, event] of admittedEvents.entries()) {
    if (event.admissionOrdinal !== index + 1) {
      throw new TypeError("ABG replay requires a total, gap-free admission-ordinal order");
    }
  }
  const events = scope === undefined ? admittedEvents : store.readScope(scope);

  const activeFluents = new Set<string>();
  for (const event of events) {
    const effect = eventCalculusEffect(event);
    for (const fluent of effect.terminates) activeFluents.delete(fluent);
    for (const fluent of effect.initiates) activeFluents.add(fluent);
  }

  const cCallIds = [...new Set(
    events
      .filter((event) => event.aggregateType === "c_call")
      .map((event) => event.aggregateId),
  )];
  const cCalls = cCallIds.map((cCallRef): ReplayCCallState => {
    const rows = events.filter(
      (event) => event.aggregateType === "c_call" && event.aggregateId === cCallRef,
    );
    validateCCallOrder(rows);
    const evidenceRows = rows.filter((event) => event.kind === "c_call_evidenced");
    const resultEvent = rows.find((event) => event.kind === "c_call_result_admitted");
    const judgmentEvent = rows.find((event) => event.kind === "c_call_judged");
    let status: ReplayCCallState["status"] = "opened";
    if (rows.some((event) => event.kind === "c_call_fibre_selected")) status = "fibre_selected";
    if (resultEvent !== undefined) status = "result_admitted";
    if (judgmentEvent !== undefined) status = "judged";
    return {
      cCallRef,
      eventKinds: rows.map((event) => event.kind),
      evidenceRefs: evidenceRows
        .map((event) => stringField(event, "evidenceRef"))
        .filter((value): value is string => value !== null),
      resultRef: resultEvent === undefined ? null : stringField(resultEvent, "resultRef"),
      resultDigest: resultEvent === undefined
        ? null
        : stringField(resultEvent, "resultDigest") as Sha256Digest | null,
      resultClass: resultEvent === undefined ? null : stringField(resultEvent, "resultClass"),
      resultContractRef: resultEvent === undefined ? null : stringField(resultEvent, "contractRef"),
      resultValueKind: resultEvent === undefined ? null : stringField(resultEvent, "valueKind"),
      resultValue: resultEvent !== undefined && isRecord(resultEvent.payload)
        ? (resultEvent.payload.value ?? null)
        : null,
      judgmentRef: judgmentEvent === undefined ? null : stringField(judgmentEvent, "judgmentRef"),
      judgment: judgmentEvent === undefined ? null : stringField(judgmentEvent, "judgment"),
      status,
    };
  });

  const routes = events
    .filter((event) => event.kind === "traversal_route_admitted")
    .map((event): ReplayRouteState => {
      const routeKind = stringField(event, "routeKind");
      if (
        routeKind !== "advance" &&
        routeKind !== "retry" &&
        routeKind !== "hold" &&
        routeKind !== "blocked" &&
        routeKind !== "failed" &&
        routeKind !== "terminal"
      ) {
        throw new TypeError(`invalid traversal route kind at ${event.eventId}`);
      }
      const routeRef = stringField(event, "routeRef");
      const routeDigest = stringField(event, "routeDigest");
      const declarationRef = stringField(event, "declarationRef");
      const declarationDigest = stringField(event, "declarationDigest");
      const sourceCursorRef = stringField(event, "sourceCursorRef");
      const sourceCursorDigest = stringField(event, "sourceCursorDigest");
      if (
        routeRef === null ||
        routeDigest === null ||
        declarationRef === null ||
        declarationDigest === null ||
        sourceCursorRef === null ||
        sourceCursorDigest === null
      ) {
        throw new TypeError(`incomplete traversal route payload at ${event.eventId}`);
      }
      return {
        routeRef,
        routeDigest: routeDigest as Sha256Digest,
        routeKind,
        declarationRef,
        declarationDigest: declarationDigest as Sha256Digest,
        sourceCursorRef,
        sourceCursorDigest: sourceCursorDigest as Sha256Digest,
        targetCursorRef: stringField(event, "targetCursorRef"),
        targetCursorDigest: stringField(event, "targetCursorDigest") as Sha256Digest | null,
        cCallRef: stringField(event, "cCallRef"),
        judgmentRef: stringField(event, "judgmentRef"),
        admissionEventRef: event.eventId,
      };
    });

  const runOpen = events.find((event) => event.kind === "run_segment_opened");
  const graphCallOpen = events.find((event) => event.kind === "graph_call_opened");
  const frameOpen = events.find((event) => event.kind === "frame_opened");
  const traversalCursor = events.find(
    (event) => event.kind === "traversal_cursor_entered",
  );
  const terminal = events.find((event) => event.kind === "terminal_reached");
  const frameClosed = events.find((event) => event.kind === "frame_closed");
  const graphCallClosed = events.find((event) => event.kind === "graph_call_closed");
  const runClosed = events.find((event) => event.kind === "run_closed");
  const invocationRefused = events.find((event) => event.kind === "invocation_refused");
  const runtimeFailure = events.find((event) => event.kind === "runtime_failure_observed");
  const blocked = cCalls.some((cCall) => cCall.judgment === "blocked");
  const eventStoreDigest = store.digest(scope);
  const body = {
    eventStoreDigest,
    eventCount: events.length,
    lastAdmissionOrdinal: events.at(-1)?.admissionOrdinal ?? 0,
    runId: runOpen?.runId ?? null,
    graphCallId: graphCallOpen?.graphCallId ?? null,
    frameId: frameOpen?.frameId ?? null,
    traversalCursorRef: traversalCursor === undefined
      ? null
      : stringField(traversalCursor, "cursorRef"),
    traversalCursorDigest: traversalCursor === undefined
      ? null
      : stringField(traversalCursor, "cursorDigest") as Sha256Digest | null,
    traversalCursorEventRef: traversalCursor?.eventId ?? null,
    cCalls,
    routes,
    activeFluents: [...activeFluents].sort(),
    terminalReachedEventRef: terminal?.eventId ?? null,
    frameClosedEventRef: frameClosed?.eventId ?? null,
    graphCallClosedEventRef: graphCallClosed?.eventId ?? null,
    runClosedEventRef: runClosed?.eventId ?? null,
    invocationRefusalEventRef: invocationRefused?.eventId ?? null,
    runtimeFailureEventRef: runtimeFailure?.eventId ?? null,
    runtimeStatus: runtimeFailure !== undefined
      ? "failed" as const
      : runClosed !== undefined
        ? "closed" as const
        : blocked
          ? "blocked" as const
          : invocationRefused !== undefined
            ? "refused" as const
            : runOpen !== undefined
              ? "active" as const
              : "workspace" as const,
  };
  const replayDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "replay_state" as const,
    schemaVersion: "5.0.0" as const,
    replayRef: `replay://abiogenesis/${replayDigest.slice("sha256:".length)}`,
    replayDigest,
    ...body,
  }) as ReplayState;
}
