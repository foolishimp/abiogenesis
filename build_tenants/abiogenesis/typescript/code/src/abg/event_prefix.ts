import {
  selectRuntimeEvents,
  type RuntimeEvent,
  type RuntimeEventScope,
} from "./event_store.js";

const VALIDATED_RUNTIME_EVENT_PREFIX = Symbol(
  "validated_runtime_event_prefix",
);

export interface ValidatedRuntimeEventPrefix {
  readonly kind: "validated_runtime_event_prefix";
  readonly events: readonly RuntimeEvent[];
  readonly [VALIDATED_RUNTIME_EVENT_PREFIX]: true;
}

function isDeeplyFrozen(
  value: unknown,
  visited: Set<object> = new Set(),
): boolean {
  if (typeof value !== "object" || value === null) return true;
  if (!Object.isFrozen(value)) return false;
  if (visited.has(value)) return true;
  visited.add(value);
  return Object.values(value).every((child) => isDeeplyFrozen(child, visited));
}

export function runtimeEventsFromValidatedPrefix(
  prefix: ValidatedRuntimeEventPrefix,
): readonly RuntimeEvent[] {
  if (
    typeof prefix !== "object" ||
    prefix === null ||
    prefix[VALIDATED_RUNTIME_EVENT_PREFIX] !== true ||
    prefix.kind !== "validated_runtime_event_prefix" ||
    !isDeeplyFrozen(prefix)
  ) {
    throw new TypeError(
      "Event Calculus requires a nominal validated immutable event prefix",
    );
  }
  return prefix.events;
}

export function selectValidatedRuntimeEventPrefix(
  admittedEvents: readonly RuntimeEvent[],
  scope?: RuntimeEventScope,
): ValidatedRuntimeEventPrefix {
  if (!isDeeplyFrozen(admittedEvents)) {
    throw new TypeError(
      "runtime event-prefix selection requires one explicit immutable snapshot",
    );
  }
  for (const [index, event] of admittedEvents.entries()) {
    if (event.admissionOrdinal !== index + 1) {
      throw new TypeError(
        "runtime event-prefix selection requires a total, gap-free admission-ordinal order",
      );
    }
  }

  const selected = selectRuntimeEvents(admittedEvents, scope);
  const admittedById = new Map(
    admittedEvents.map((event) => [event.eventId, event]),
  );
  const selectedIds = new Set(selected.map((event) => event.eventId));
  let previousOrdinal = 0;
  for (const event of selected) {
    if (event.admissionOrdinal <= previousOrdinal) {
      throw new TypeError(
        "runtime event-prefix selection must preserve original admission order",
      );
    }
    previousOrdinal = event.admissionOrdinal;
    for (const causeRef of event.causationEventRefs) {
      const cause = admittedById.get(causeRef);
      if (cause === undefined || !selectedIds.has(causeRef)) {
        throw new TypeError(
          "runtime event-prefix selection encountered an unknown causal predecessor",
        );
      }
      if (
        event.runId !== undefined &&
        cause.runId !== undefined &&
        event.runId !== cause.runId
      ) {
        throw new TypeError(
          "runtime event-prefix selection cannot cross a run causation boundary",
        );
      }
    }
  }
  const events = Object.freeze([...selected]);
  return Object.freeze({
    kind: "validated_runtime_event_prefix" as const,
    events,
    [VALIDATED_RUNTIME_EVENT_PREFIX]: true as const,
  });
}
