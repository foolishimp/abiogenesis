import { canonicalJson, sha256Canonical, type JsonValue, type Sha256Digest } from "../product/index.js";
import { deepFreeze } from "../product/immutable.js";

export const ROOT_EVENT_KIND_VALUES = [
  "public_operation_artifact_admitted",
  "public_operation_admitted",
  "registry_entry_admitted",
  "invocation_admitted",
] as const;

export type RootEventKind = (typeof ROOT_EVENT_KIND_VALUES)[number];

export interface RuntimeEventCandidate {
  readonly kind: RootEventKind;
  readonly eventTime: string;
  readonly aggregateType: "workspace";
  readonly aggregateId: string;
  readonly parentAggregateId: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
  readonly workflowVersion: "5.0.0";
  readonly scopeClass: "workspace";
  readonly basisId: string;
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
