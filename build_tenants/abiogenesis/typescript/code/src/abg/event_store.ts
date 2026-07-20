import { sha256Canonical, type JsonValue, type Sha256Digest } from "../product/index.js";

export const ENVIRONMENT_EVENT_KIND_VALUES = [
  "public_operation_artifact_admitted",
] as const;

export type EnvironmentEventKind = (typeof ENVIRONMENT_EVENT_KIND_VALUES)[number];

export interface RuntimeEventCandidate {
  readonly kind: EnvironmentEventKind;
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
  const admissionOrdinal = events.length + 1;
  const payloadDigest = sha256Canonical(candidate.payload);
  const eventId = `event://abiogenesis/${sha256Canonical({
    ...candidate,
    payloadDigest,
    admissionOrdinal,
  }).slice("sha256:".length)}`;
  const event = Object.freeze({
    ...candidate,
    eventId,
    admissionOrdinal,
    payloadDigest,
  });
  events.push(event);
  return event;
}
