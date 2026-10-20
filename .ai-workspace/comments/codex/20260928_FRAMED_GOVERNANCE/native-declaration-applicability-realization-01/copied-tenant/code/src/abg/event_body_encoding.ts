import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { isRecord } from "../shared/admission_predicates.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import type { RuntimeEvent } from "./event_store.js";

/** Storage-only vocabulary. Product values never reserve a marker or JSON path. */
const REFERENCE_RECORD = "abg_admitted_body_reference_record";
type BodySlot = "basis_input" | "c_call_result_value";
interface InlineBody {
  readonly event: RuntimeEvent;
  readonly slot: BodySlot;
  readonly value: JsonValue;
  readonly digest: Sha256Digest;
}
export type InlineEventBodies = Map<string, InlineBody>;
const slotFor = (kind: unknown): BodySlot | null => kind === "basis_admitted" ? "basis_input"
  : kind === "c_call_result_admitted" ? "c_call_result_value" : null;
const fieldFor = (slot: BodySlot): "rawInputValue" | "value" => slot === "basis_input" ? "rawInputValue" : "value";
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean =>
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));

export function inlineEventBody(event: RuntimeEvent): InlineBody | null {
  const slot = slotFor(event.kind);
  if (slot === null || !isRecord(event.payload) || !Object.hasOwn(event.payload, fieldFor(slot))) return null;
  const value = event.payload[fieldFor(slot)]!;
  return { event, slot, value, digest: sha256Canonical(value) };
}

/** The caller stages additions and publishes them only with the durable batch. */
export function encodeEventBody(event: RuntimeEvent, committed: InlineEventBodies, staged: InlineEventBodies): string {
  const inline = canonicalJson(event as unknown as JsonValue), body = inlineEventBody(event);
  if (body === null) return inline + "\n";
  const source = staged.get(body.digest) ?? committed.get(body.digest);
  if (source !== undefined && canonicalJson(source.value) === canonicalJson(body.value)) {
    const { [fieldFor(body.slot)]: _value, ...payload } = event.payload as Record<string, JsonValue>;
    const encoded = canonicalJson({ kind: REFERENCE_RECORD, codecVersion: 1, event: { ...event, payload },
      bodyReference: { sourceEventRef: source.event.eventId, sourcePayloadDigest: source.event.payloadDigest,
        sourceSlot: source.slot, bodyDigest: body.digest } } as unknown as JsonValue);
    // Ordinary small values remain inline when a reference would cost more.
    if (Buffer.byteLength(encoded) < Buffer.byteLength(inline)) return encoded + "\n";
  }
  if (source === undefined) staged.set(body.digest, body);
  return inline + "\n";
}

/** Resolves only already validated, physically inline sources from this stream.
 * The event store still validates the complete restored envelope and all stamps. */
export function decodeEventBody(record: unknown, inlineByEvent: InlineEventBodies): {
  readonly event: unknown; readonly physicallyInline: boolean;
} {
  if (!isRecord(record) || record.kind !== REFERENCE_RECORD) return { event: record, physicallyInline: true };
  const reference = record.bodyReference, event = record.event;
  if (!exactKeys(record, ["kind", "codecVersion", "event", "bodyReference"]) || record.codecVersion !== 1 ||
      !isRecord(reference) || !exactKeys(reference, ["sourceEventRef", "sourcePayloadDigest", "sourceSlot", "bodyDigest"]) ||
      typeof reference.sourceEventRef !== "string" || !isRecord(event) || !isRecord(event.payload)) {
    throw new TypeError("durable body reference record is malformed");
  }
  const target = slotFor(event.kind), source = inlineByEvent.get(reference.sourceEventRef);
  if (target === null || Object.hasOwn(event.payload, fieldFor(target)) || source === undefined ||
      reference.sourcePayloadDigest !== source.event.payloadDigest || reference.sourceSlot !== source.slot ||
      reference.bodyDigest !== source.digest) {
    throw new TypeError("durable body reference lacks its exact earlier inline source");
  }
  return { event: { ...event, payload: { ...event.payload, [fieldFor(target)]: source.value } }, physicallyInline: false };
}
