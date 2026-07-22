import {
  appendFileSync,
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

export const ROOT_EVENT_KIND_VALUES = [
  "public_operation_artifact_admitted",
  "public_operation_admitted",
  "registry_entry_admitted",
  "invocation_admitted",
  "invocation_refused",
  "implementation_admitted",
  "basis_admitted",
  "run_segment_opened",
  "graph_call_opened",
  "frame_opened",
  "traversal_cursor_entered",
  "c_call_opened",
  "c_call_fibre_selected",
  "actor_invocation_started",
  "actor_process_started",
  "actor_process_spawn_failed",
  "actor_process_stdout_observed",
  "actor_process_stderr_observed",
  "actor_process_timeout_observed",
  "actor_process_signal_requested",
  "actor_process_exited",
  "actor_result_artifact_observed",
  "actor_invocation_closed",
  "actor_invocation_failed",
  "c_call_evidenced",
  "c_call_result_admitted",
  "c_call_judged",
  "traversal_route_admitted",
  "runtime_failure_observed",
  "run_stopped",
  "terminal_reached",
  "frame_closed",
  "graph_call_closed",
  "run_closed",
] as const;

export type RootEventKind = (typeof ROOT_EVENT_KIND_VALUES)[number];

export interface RuntimeEventCandidate {
  readonly kind: RootEventKind;
  readonly eventTime: string;
  readonly aggregateType:
    | "actor_invocation"
    | "c_call"
    | "frame"
    | "graph_call"
    | "process"
    | "run"
    | "workspace";
  readonly aggregateId: string;
  readonly parentAggregateId: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
  readonly workflowVersion: "5.0.0";
  readonly scopeClass: "run" | "workspace";
  readonly basisId: string;
  readonly runId?: string;
  readonly graphFunctionRef?: string;
  readonly materializationRef?: string;
  readonly graphCallId?: string;
  readonly frameId?: string;
  readonly frameLineageId?: string;
  readonly payload: JsonValue;
}

export interface RuntimeEvent extends RuntimeEventCandidate {
  readonly eventId: string;
  readonly admissionOrdinal: number;
  readonly payloadDigest: Sha256Digest;
}

export interface RuntimeEventScope {
  readonly invocationRef?: string;
  readonly runId?: string;
}

export type RuntimeEventCandidateFactory = (
  admittedInBatch: readonly RuntimeEvent[],
) => RuntimeEventCandidate;

interface EventStoreState {
  readonly events: RuntimeEvent[];
  durableLogPath: string | null;
}

const eventState = new WeakMap<AbgEventStore, EventStoreState>();

function payloadInvocationRef(event: RuntimeEvent): string | null {
  if (typeof event.payload !== "object" || event.payload === null || Array.isArray(event.payload)) {
    return null;
  }
  const value = (event.payload as Readonly<Record<string, JsonValue>>).invocationRef;
  return typeof value === "string" ? value : null;
}

export function selectRuntimeEvents(
  events: readonly RuntimeEvent[],
  scope?: RuntimeEventScope,
): readonly RuntimeEvent[] {
  if (scope === undefined) return Object.freeze([...events]);
  const byId = new Map(events.map((event) => [event.eventId, event]));
  const selected = new Set<string>();
  for (const event of events) {
    if (
      (scope.runId !== undefined && event.runId === scope.runId) ||
      (scope.invocationRef !== undefined &&
        (event.parentAggregateId === scope.invocationRef ||
          payloadInvocationRef(event) === scope.invocationRef))
    ) {
      selected.add(event.eventId);
    }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const event of events) {
      if (!selected.has(event.eventId)) continue;
      for (const causeRef of event.causationEventRefs) {
        const cause = byId.get(causeRef);
        if (cause === undefined) {
          throw new TypeError("scoped replay encountered an unknown causation event");
        }
        if (
          event.runId !== undefined &&
          cause.runId !== undefined &&
          cause.runId !== event.runId
        ) {
          throw new TypeError("scoped replay cannot cross a run causation boundary");
        }
        if (!selected.has(causeRef)) {
          selected.add(causeRef);
          changed = true;
        }
      }
    }
  }
  return Object.freeze(events.filter((event) => selected.has(event.eventId)));
}

function appendDurably(path: string, event: RuntimeEvent): void {
  appendDurablyBatch(path, [event]);
}

function appendDurablyBatch(path: string, events: readonly RuntimeEvent[]): void {
  const descriptor = openSync(path, "a");
  try {
    appendFileSync(
      descriptor,
      events.map((event) => `${canonicalJson(event as unknown as JsonValue)}\n`).join(""),
      "utf8",
    );
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function constructRuntimeEvent(
  events: readonly RuntimeEvent[],
  candidate: RuntimeEventCandidate,
): RuntimeEvent {
  if (
    new Set(candidate.causationEventRefs).size !== candidate.causationEventRefs.length ||
    candidate.causationEventRefs.some(
      (eventRef) => !events.some((event) => event.eventId === eventRef),
    )
  ) {
    throw new TypeError("runtime event causation refs must be unique admitted events in this store");
  }
  const causeEvents = candidate.causationEventRefs.map((eventRef) =>
    events.find((event) => event.eventId === eventRef)!,
  );
  if (
    causeEvents.some((cause) =>
      candidate.runId === undefined
        ? cause.runId !== undefined
        : cause.runId !== undefined && cause.runId !== candidate.runId)
  ) {
    throw new TypeError("runtime event causation cannot cross a run scope");
  }
  const immutableCandidate = deepFreeze(
    JSON.parse(canonicalJson(candidate as unknown as JsonValue)) as RuntimeEventCandidate,
  );
  const admissionOrdinal = events.length + 1;
  const payloadDigest = sha256Canonical(immutableCandidate.payload);
  const eventId = `event://abiogenesis/${sha256Canonical({
    ...immutableCandidate,
    payloadDigest,
    admissionOrdinal,
  }).slice("sha256:".length)}`;
  return deepFreeze({
    ...immutableCandidate,
    eventId,
    admissionOrdinal,
    payloadDigest,
  }) as RuntimeEvent;
}

export class AbgEventStore {
  constructor() {
    eventState.set(this, { events: [], durableLogPath: null });
  }

  readAll(): readonly RuntimeEvent[] {
    return Object.freeze([...(eventState.get(this)?.events ?? [])]);
  }

  readScope(scope: RuntimeEventScope): readonly RuntimeEvent[] {
    return selectRuntimeEvents(this.readAll(), scope);
  }

  digest(scope?: RuntimeEventScope): Sha256Digest {
    const events = scope === undefined ? this.readAll() : this.readScope(scope);
    return sha256Canonical(events as unknown as JsonValue);
  }

  configureDurableLog(path: string): void {
    const state = eventState.get(this);
    if (state === undefined) throw new TypeError("event store state is unavailable");
    const exactPath = resolve(path);
    if (state.durableLogPath !== null) {
      if (state.durableLogPath !== exactPath) {
        throw new TypeError("ABG event store cannot change its configured durable log");
      }
      return;
    }
    mkdirSync(dirname(exactPath), { recursive: true });
    writeFileSync(exactPath, "", { encoding: "utf8", flag: "wx" });
    for (const event of state.events) appendDurably(exactPath, event);
    state.durableLogPath = exactPath;
  }

  configuredDurableLogPath(): string | null {
    return eventState.get(this)?.durableLogPath ?? null;
  }
}

export function admitRuntimeEvent(
  store: AbgEventStore,
  candidate: RuntimeEventCandidate,
): RuntimeEvent {
  const state = eventState.get(store);
  if (state === undefined) {
    throw new TypeError("event store was not constructed by this ABG module");
  }
  const events = state.events;
  const event = constructRuntimeEvent(events, candidate);
  if (state.durableLogPath !== null) appendDurably(state.durableLogPath, event);
  events.push(event);
  return event;
}

export function admitRuntimeEventBatch(
  store: AbgEventStore,
  factories: readonly RuntimeEventCandidateFactory[],
): readonly RuntimeEvent[] {
  const state = eventState.get(store);
  if (state === undefined) {
    throw new TypeError("event store was not constructed by this ABG module");
  }
  if (factories.length === 0) return Object.freeze([]);
  const staged = [...state.events];
  const admitted: RuntimeEvent[] = [];
  for (const factory of factories) {
    const candidate = factory(Object.freeze([...admitted]));
    const event = constructRuntimeEvent(staged, candidate);
    staged.push(event);
    admitted.push(event);
  }
  if (state.durableLogPath !== null) appendDurablyBatch(state.durableLogPath, admitted);
  state.events.push(...admitted);
  return Object.freeze(admitted);
}
