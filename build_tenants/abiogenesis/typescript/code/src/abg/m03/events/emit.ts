import { randomUUID } from "node:crypto";

import type {
  CanonicalRuntimeEvent,
  RuntimeEvent
} from "../contracts/carriers.js";
import {
  assertCanonicalRuntimeEvent,
  assertCanonicalRuntimeEventSequence,
  assertRuntimeEvent,
  hasCanonicalRuntimeEventEnvelope
} from "../contracts/event_admission.js";

export type RuntimeEventSink = (event: CanonicalRuntimeEvent) => void;

// T-217 S2.4 (C-4): the admission ordinal is EMITTER-CONTEXT state, not
// a bare process global. Every ordering consumer assumes one monotone
// counter per STORE; the context is that store handle. The module-level
// default context preserves the one-process-one-store behavior every
// existing caller has; a second store in the same process creates its
// own context and its ordinals never interleave with the default's.
//
// The `source` flag is the T-195 caller-context refinement: replayed
// truth lawfully carries old ordinals, so a replay-tolerant context
// passes pre-stamped canonical envelopes through. A LIVE context does
// not — a pre-stamped envelope arriving at live emission is a forged
// pre-stamp and fails closed.
export interface RuntimeEventEmitterContext {
  readonly source: "live" | "replay_tolerant";
  ordinal: number;
}

export function createRuntimeEventEmitterContext(input?: {
  readonly source?: "live" | "replay_tolerant";
  readonly startOrdinal?: number;
}): RuntimeEventEmitterContext {
  return {
    source: input?.source ?? "live",
    ordinal: input?.startOrdinal ?? 0
  };
}

const defaultEmitterContext: RuntimeEventEmitterContext = {
  source: "replay_tolerant",
  ordinal: 0
};

// codex P1 (review round 2026-07-10): the live/replay split is real only
// where a LIVE context is actually adopted. This is the adoption helper
// for a persisted store's append path: a live context (pre-stamped
// canonical envelopes fail closed as forged) seeded PAST the replayed
// record so minted ordinals never collide with persisted truth.
export function createSeededLiveEmitterContext(
  replayEvents: readonly RuntimeEvent[]
): RuntimeEventEmitterContext {
  const context = createRuntimeEventEmitterContext({ source: "live" });
  seedRuntimeEventAdmissionOrdinal(replayEvents, context);
  // the module default may already sit past this store's record (other
  // stores in-process); never mint BEHIND it or cross-store appends in
  // one process could collide on replay ordering
  context.ordinal = Math.max(context.ordinal, defaultEmitterContext.ordinal);
  return context;
}

function isRuntimeEventBatch(
  events: RuntimeEvent | readonly RuntimeEvent[]
): events is readonly RuntimeEvent[] {
  return Array.isArray(events);
}

function nextRuntimeEventAdmissionOrdinal(
  context: RuntimeEventEmitterContext
): number {
  const ordinal = context.ordinal;
  context.ordinal += 1;
  return ordinal;
}

export function seedRuntimeEventAdmissionOrdinal(
  events: readonly RuntimeEvent[],
  context: RuntimeEventEmitterContext = defaultEmitterContext
): void {
  const nextOrdinal =
    events.reduce((max, event) => {
      if (
        "eventAdmissionOrdinal" in event &&
        typeof event.eventAdmissionOrdinal === "number" &&
        Number.isSafeInteger(event.eventAdmissionOrdinal) &&
        event.eventAdmissionOrdinal >= 0
      ) {
        return Math.max(max, event.eventAdmissionOrdinal + 1);
      }
      return max;
    }, 0);
  context.ordinal = Math.max(context.ordinal, nextOrdinal);
}

function canonicalRuntimeEvent(
  event: RuntimeEvent,
  context: RuntimeEventEmitterContext
): CanonicalRuntimeEvent {
  assertRuntimeEvent(event);
  if (hasCanonicalRuntimeEventEnvelope(event)) {
    assertCanonicalRuntimeEvent(event);
    // T-195 P1-10 refined (C-4): replayed truth lawfully carries old
    // ordinals — the replay-tolerant context passes them through and the
    // counter only moves FORWARD, so a pre-stamped ordinal can never
    // collide with a future mint. A LIVE store fails closed instead: a
    // pre-stamped envelope at live emission is a forged pre-stamp.
    if (context.source === "live") {
      throw new TypeError(
        "live emitter context rejects pre-stamped canonical envelopes: replayed truth enters through a replay-tolerant context"
      );
    }
    // assertCanonicalRuntimeEvent narrowed the type: the ordinal is a number
    context.ordinal = Math.max(context.ordinal, event.eventAdmissionOrdinal + 1);
    return event;
  }
  const eventTimeUnixMs = Date.now();
  const eventTime = new Date(eventTimeUnixMs).toISOString();
  const eventAdmissionOrdinal = nextRuntimeEventAdmissionOrdinal(context);
  const eventId = [
    "runtime-event",
    eventTime,
    String(eventAdmissionOrdinal),
    randomUUID()
  ].join(":");
  const canonical = Object.freeze({
    ...event,
    eventId,
    eventTime,
    eventTimeUnixMs,
    eventAdmissionOrdinal
  });
  assertCanonicalRuntimeEvent(canonical);
  return canonical;
}

function normalizeEvents(
  events: RuntimeEvent | readonly RuntimeEvent[],
  context: RuntimeEventEmitterContext
): readonly CanonicalRuntimeEvent[] {
  const batch = isRuntimeEventBatch(events) ? Object.freeze([...events]) : Object.freeze([events]);
  const canonical = Object.freeze(batch.map((event) => canonicalRuntimeEvent(event, context)));
  assertCanonicalRuntimeEventSequence(canonical, "emit.events");
  return canonical;
}

export function emitWithContext(
  context: RuntimeEventEmitterContext,
  events: RuntimeEvent | readonly RuntimeEvent[],
  sink: RuntimeEventSink
): readonly CanonicalRuntimeEvent[] {
  const normalized = normalizeEvents(events, context);
  for (const event of normalized) {
    sink(event);
  }
  return normalized;
}

export function emit(
  events: RuntimeEvent | readonly RuntimeEvent[],
  sink: RuntimeEventSink
): readonly CanonicalRuntimeEvent[] {
  return emitWithContext(defaultEmitterContext, events, sink);
}
