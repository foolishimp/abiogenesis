import type { JsonValue, Sha256Digest } from "../product/index.js";
import { sha256Canonical } from "../product/digests.js";
import { deepFreeze } from "../product/immutable.js";
import { eventCalculusEffect } from "./event_calculus.js";
import type { AbgEventStore, RootEventKind, RuntimeEvent } from "./event_store.js";

export interface ReplayCCallState {
  readonly cCallRef: string;
  readonly eventKinds: readonly RootEventKind[];
  readonly evidenceRefs: readonly string[];
  readonly resultRef: string | null;
  readonly resultDigest: Sha256Digest | null;
  readonly resultValue: JsonValue | null;
  readonly judgmentRef: string | null;
  readonly judgment: string | null;
  readonly status: "fibre_selected" | "judged" | "opened" | "result_admitted";
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
  readonly cCalls: readonly ReplayCCallState[];
  readonly activeFluents: readonly string[];
  readonly terminalReachedEventRef: string | null;
  readonly frameClosedEventRef: string | null;
  readonly graphCallClosedEventRef: string | null;
  readonly runClosedEventRef: string | null;
  readonly runtimeStatus: "active" | "closed" | "refused" | "workspace";
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

export function replay(store: AbgEventStore): ReplayState {
  const events = store.readAll();
  for (const [index, event] of events.entries()) {
    if (event.admissionOrdinal !== index + 1) {
      throw new TypeError("ABG replay requires a total, gap-free admission-ordinal order");
    }
  }

  const activeFluents = new Set<string>();
  for (const event of events) {
    const effect = eventCalculusEffect(event.kind);
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
      resultValue: resultEvent !== undefined && isRecord(resultEvent.payload)
        ? (resultEvent.payload.value ?? null)
        : null,
      judgmentRef: judgmentEvent === undefined ? null : stringField(judgmentEvent, "judgmentRef"),
      judgment: judgmentEvent === undefined ? null : stringField(judgmentEvent, "judgment"),
      status,
    };
  });

  const runOpen = events.find((event) => event.kind === "run_segment_opened");
  const graphCallOpen = events.find((event) => event.kind === "graph_call_opened");
  const frameOpen = events.find((event) => event.kind === "frame_opened");
  const terminal = events.find((event) => event.kind === "terminal_reached");
  const frameClosed = events.find((event) => event.kind === "frame_closed");
  const graphCallClosed = events.find((event) => event.kind === "graph_call_closed");
  const runClosed = events.find((event) => event.kind === "run_closed");
  const invocationRefused = events.find((event) => event.kind === "invocation_refused");
  const eventStoreDigest = store.digest();
  const body = {
    eventStoreDigest,
    eventCount: events.length,
    lastAdmissionOrdinal: events.at(-1)?.admissionOrdinal ?? 0,
    runId: runOpen?.runId ?? null,
    graphCallId: graphCallOpen?.graphCallId ?? null,
    frameId: frameOpen?.frameId ?? null,
    cCalls,
    activeFluents: [...activeFluents].sort(),
    terminalReachedEventRef: terminal?.eventId ?? null,
    frameClosedEventRef: frameClosed?.eventId ?? null,
    graphCallClosedEventRef: graphCallClosed?.eventId ?? null,
    runClosedEventRef: runClosed?.eventId ?? null,
    runtimeStatus: runClosed !== undefined
      ? "closed" as const
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
