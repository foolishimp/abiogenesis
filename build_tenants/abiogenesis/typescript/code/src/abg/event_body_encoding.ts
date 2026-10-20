import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { isRecord, isJsonRecordShape } from "../shared/admission_predicates.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import type { RuntimeEvent, RuntimeEventCandidate } from "./event_store.js";

/** Storage-only vocabulary. Product values never reserve a marker or JSON path. */
const REFERENCE_RECORD = "abg_admitted_body_reference_record";
type BodySlot = "basis_input" | "c_call_result_value" | "native_definition_material";
const NATIVE_DEFINITION_FIELDS = ["publication", "assessmentPublication", "lifecyclePublication", "sourcePublication",
  "declarationGraphFunctions", "graphFunction"] as const;
export interface InlineBody {
  readonly eventRef: string;
  readonly payloadDigest: Sha256Digest;
  readonly admissionOrdinal: number;
  readonly slot: BodySlot;
  readonly value?: JsonValue;
  readonly digest: Sha256Digest;
}
export type InlineEventBodies = Map<string, InlineBody>;
export type InlineBodyReader = (source: InlineBody) => JsonValue;
const slotFor = (kind: unknown): BodySlot | null => kind === "basis_admitted" ? "basis_input"
  : kind === "c_call_result_admitted" ? "c_call_result_value"
  : kind === "actor_transport_binding_admitted" ? "native_definition_material" : null;
const fieldFor = (slot: Exclude<BodySlot, "native_definition_material">): "rawInputValue" | "value" => slot === "basis_input" ? "rawInputValue" : "value";
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean =>
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));

function nativeParts(payload: unknown) {
  if (!isJsonRecordShape(payload) || !isJsonRecordShape(payload.instructionAssembly)) return null;
  const assembly = payload.instructionAssembly;
  if (assembly.kind !== "native_instruction_assembly" || assembly.schemaVersion !== "5.0.0" ||
      !isJsonRecordShape(assembly.envelope) || !isJsonRecordShape(assembly.envelope.nativeBasis)) return null;
  return { assembly, envelope: assembly.envelope, basis: assembly.envelope.nativeBasis };
}

function isNativeDefinitionBundle(value: unknown): value is Record<string, JsonValue> {
  return isRecord(value) && Object.keys(value).every(key => (NATIVE_DEFINITION_FIELDS as readonly string[]).includes(key)) &&
    isRecord(value.publication) && isRecord(value.graphFunction) && Array.isArray(value.declarationGraphFunctions) &&
    value.declarationGraphFunctions.every(isRecord) &&
    ["assessmentPublication", "lifecyclePublication", "sourcePublication"].every(key => !Object.hasOwn(value, key) || isRecord(value[key]));
}

function valueAtSlot(payload: Record<string, JsonValue>, slot: BodySlot): JsonValue | undefined {
  if (slot !== "native_definition_material") return payload[fieldFor(slot)];
  const parts = nativeParts(payload);
  if (parts === null) return undefined;
  const bundle: Record<string, JsonValue> = {};
  for (const field of NATIVE_DEFINITION_FIELDS) if (Object.hasOwn(parts.basis, field)) bundle[field] = parts.basis[field]!;
  return isNativeDefinitionBundle(bundle) ? bundle : undefined;
}

function replaceValue(payload: Record<string, JsonValue>, slot: BodySlot, value: JsonValue): Record<string, JsonValue> {
  if (slot !== "native_definition_material") return { ...payload, [fieldFor(slot)]: value };
  const parts = nativeParts(payload);
  if (parts === null || !isNativeDefinitionBundle(value)) throw new TypeError("native definition body slot is malformed");
  return { ...payload, instructionAssembly: { ...parts.assembly, envelope: { ...parts.envelope,
    nativeBasis: { ...parts.basis, ...value } } } };
}

function omitValue(payload: Record<string, JsonValue>, slot: BodySlot): Record<string, JsonValue> {
  if (slot !== "native_definition_material") { const { [fieldFor(slot)]: _value, ...rest } = payload; return rest; }
  const parts = nativeParts(payload);
  if (parts === null) throw new TypeError("native definition body slot is malformed");
  const basis = { ...parts.basis };
  for (const field of NATIVE_DEFINITION_FIELDS) delete basis[field];
  return { ...payload, instructionAssembly: { ...parts.assembly, envelope: { ...parts.envelope, nativeBasis: basis } } };
}

function targetIsAbsent(payload: Record<string, JsonValue>, slot: BodySlot): boolean {
  if (slot !== "native_definition_material") return !Object.hasOwn(payload, fieldFor(slot));
  const parts = nativeParts(payload);
  return parts !== null && NATIVE_DEFINITION_FIELDS.every(field => !Object.hasOwn(parts.basis, field));
}

/** @internal One existing coordinate table, with the native typed slot separated
 * from unrestricted input/Result values. The old cross-slot key is unchanged. */
export function inlineEventBodyKey(body: Pick<InlineBody, "slot" | "digest">): string {
  return body.slot === "native_definition_material" ? "native_definition_material:" + body.digest : body.digest;
}

const compatibleSlots = (a: BodySlot, b: BodySlot): boolean =>
  (a === "native_definition_material") === (b === "native_definition_material");

export function inlineEventBody(event: RuntimeEvent): InlineBody | null {
  const slot = slotFor(event.kind);
  if (slot === null || !isRecord(event.payload)) return null;
  const value = valueAtSlot(event.payload, slot);
  if (value === undefined) return null;
  return { eventRef: event.eventId, payloadDigest: event.payloadDigest,
    admissionOrdinal: event.admissionOrdinal, slot, value, digest: sha256Canonical(value) };
}

/** @internal Encoding and selected durable reads use the same exact extraction. */
export function inlineEventBodyValue(event: RuntimeEvent, source: InlineBody): JsonValue {
  const body = inlineEventBody(event);
  if (body === null || body.eventRef !== source.eventRef || body.payloadDigest !== source.payloadDigest ||
      body.admissionOrdinal !== source.admissionOrdinal || body.slot !== source.slot || body.digest !== source.digest)
    throw new TypeError("selected inline body differs from its admitted source");
  return body.value!;
}

/** The durable owner keeps coordinates, never the decoded source value. */
export function inlineEventBodyCoordinate(event: RuntimeEvent): InlineBody | null {
  const body = inlineEventBody(event);
  if (body === null) return null;
  const { value: _value, ...coordinate } = body;
  return coordinate;
}

function bodyValue(source: InlineBody, read?: InlineBodyReader): JsonValue {
  if (Object.hasOwn(source, "value")) return source.value!;
  if (read === undefined) throw new TypeError("durable body coordinate lacks its owner acquisition");
  return read(source);
}

/** Detach caller data first; only this store's committed inline body may be
 * shared. Source eligibility and physical encoding remain the durable owner's. */
export function captureRuntimeEventCandidate(
  candidate: RuntimeEventCandidate,
  committed?: Pick<ReadonlyMap<string, InlineBody>, "get">,
  read?: InlineBodyReader,
): RuntimeEventCandidate {
  const captured = JSON.parse(canonicalJson(candidate as unknown as JsonValue)) as RuntimeEventCandidate;
  const slot = slotFor(captured.kind);
  if (slot === null || committed === undefined || !isRecord(captured.payload)) return captured;
  const value = valueAtSlot(captured.payload, slot);
  if (value === undefined) return captured;
  const source = committed.get(inlineEventBodyKey({ slot, digest: sha256Canonical(value) }));
  if (source !== undefined && compatibleSlots(source.slot, slot)) {
    const shared = bodyValue(source, read);
    if (canonicalJson(shared) === canonicalJson(value))
      return { ...captured, payload: replaceValue(captured.payload, slot, shared) };
  }
  return captured;
}

/** The caller stages additions and publishes them only with the durable batch. */
export function encodeEventBody(event: RuntimeEvent, committed: InlineEventBodies, staged: InlineEventBodies,
  read?: InlineBodyReader): string {
  const inline = canonicalJson(event as unknown as JsonValue), body = inlineEventBody(event);
  if (body === null) return inline + "\n";
  const key = inlineEventBodyKey(body), source = staged.get(key) ?? committed.get(key);
  if (source !== undefined && compatibleSlots(source.slot, body.slot) && canonicalJson(bodyValue(source, read)) === canonicalJson(body.value!)) {
    const payload = omitValue(event.payload as Record<string, JsonValue>, body.slot);
    const encoded = canonicalJson({ kind: REFERENCE_RECORD, codecVersion: body.slot === "native_definition_material" ? 2 : 1, event: { ...event, payload },
      bodyReference: { sourceEventRef: source.eventRef, sourcePayloadDigest: source.payloadDigest,
        sourceSlot: source.slot, bodyDigest: body.digest } } as unknown as JsonValue);
    // Ordinary small values remain inline when a reference would cost more.
    if (Buffer.byteLength(encoded) < Buffer.byteLength(inline)) return encoded + "\n";
  }
  if (source === undefined) staged.set(key, body);
  return inline + "\n";
}

/** Resolves only already validated, physically inline sources from this stream.
 * The event store still validates the complete restored envelope and all stamps. */
export function decodeEventBody(record: unknown, inlineByEvent: InlineEventBodies,
  read?: InlineBodyReader): {
  readonly event: unknown; readonly physicallyInline: boolean;
} {
  if (!isRecord(record) || record.kind !== REFERENCE_RECORD) return { event: record, physicallyInline: true };
  const reference = record.bodyReference, event = record.event;
  if (!exactKeys(record, ["kind", "codecVersion", "event", "bodyReference"]) || (record.codecVersion !== 1 && record.codecVersion !== 2) ||
      !isRecord(reference) || !exactKeys(reference, ["sourceEventRef", "sourcePayloadDigest", "sourceSlot", "bodyDigest"]) ||
      typeof reference.sourceEventRef !== "string" || !isRecord(event) || !isJsonRecordShape(event.payload)) {
    throw new TypeError("durable body reference record is malformed");
  }
  const target = slotFor(event.kind), source = inlineByEvent.get(reference.sourceEventRef);
  if (target === null || (record.codecVersion === 2) !== (target === "native_definition_material") ||
      !targetIsAbsent(event.payload, target) || source === undefined || !compatibleSlots(source.slot, target) ||
      reference.sourcePayloadDigest !== source.payloadDigest || reference.sourceSlot !== source.slot ||
      reference.bodyDigest !== source.digest) {
    throw new TypeError("durable body reference lacks its exact earlier inline source");
  }
  const shared = bodyValue(source, read);
  if (sha256Canonical(shared) !== source.digest) throw new TypeError("durable body reference differs from its exact inline source");
  return { event: { ...event, payload: replaceValue(event.payload, target, shared) }, physicallyInline: false };
}
