import { canonicalJson, sha256Canonical, type JsonValue, type Sha256Digest } from "../product/index.js";
import { deepFreeze } from "../product/immutable.js";

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
  "c_call_opened",
  "c_call_fibre_selected",
  "c_call_evidenced",
  "c_call_result_admitted",
  "c_call_judged",
  "fd_advance_ready",
  "runtime_failure_observed",
  "terminal_reached",
  "frame_closed",
  "graph_call_closed",
  "run_closed",
] as const;

export type RootEventKind = (typeof ROOT_EVENT_KIND_VALUES)[number];

export interface RuntimeEventCandidate {
  readonly kind: RootEventKind;
  readonly eventTime: string;
  readonly aggregateType: "c_call" | "frame" | "graph_call" | "run" | "workspace";
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

const eventState = new WeakMap<AbgEventStore, RuntimeEvent[]>();

export class AbgEventStore {
  constructor() {
    eventState.set(this, []);
  }

  readAll(): readonly RuntimeEvent[] {
    return Object.freeze([...(eventState.get(this) ?? [])]);
  }

  digest(): Sha256Digest {
    return sha256Canonical((eventState.get(this) ?? []) as unknown as JsonValue);
  }
}

export function admitRuntimeEvent(
  store: AbgEventStore,
  candidate: RuntimeEventCandidate,
): RuntimeEvent {
  const events = eventState.get(store);
  if (events === undefined) {
    throw new TypeError("event store was not constructed by this ABG module");
  }
  if (
    new Set(candidate.causationEventRefs).size !== candidate.causationEventRefs.length ||
    candidate.causationEventRefs.some(
      (eventRef) => !events.some((event) => event.eventId === eventRef),
    )
  ) {
    throw new TypeError("runtime event causation refs must be unique admitted events in this store");
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
  const event = deepFreeze({
    ...immutableCandidate,
    eventId,
    admissionOrdinal,
    payloadDigest,
  }) as RuntimeEvent;
  events.push(event);
  return event;
}
