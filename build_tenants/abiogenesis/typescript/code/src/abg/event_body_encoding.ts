import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { isRecord, hasExactKeys } from "../shared/admission_predicates.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import type { RuntimeEvent, RuntimeEventCandidate } from "./event_store.js";
import { canonicalEquals } from "../shared/value/index.js";

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

// Shape checks only over a JSON payload; the store validates restored events.
function nativeParts(payload: JsonValue) {
  if (!isRecord(payload) || !isRecord(payload.instructionAssembly)) return null;
  const assembly = payload.instructionAssembly;
  if (assembly.kind !== "native_instruction_assembly" || assembly.schemaVersion !== "5.0.0" ||
      !isRecord(assembly.envelope) || !isRecord(assembly.envelope.nativeBasis)) return null;
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
  const bundle: Record<string, unknown> = {};
  for (const field of NATIVE_DEFINITION_FIELDS) if (Object.hasOwn(parts.basis, field)) bundle[field] = parts.basis[field];
  return isNativeDefinitionBundle(bundle) ? bundle : undefined;
}

function replaceValue<P extends Readonly<Record<string, JsonValue>>>(payload: P, slot: BodySlot, value: JsonValue): P {
  if (slot !== "native_definition_material") return { ...payload, [fieldFor(slot)]: value };
  const parts = nativeParts(payload);
  if (parts === null || !isNativeDefinitionBundle(value)) throw new TypeError("native definition body slot is malformed");
  return { ...payload, instructionAssembly: { ...parts.assembly, envelope: { ...parts.envelope,
    nativeBasis: { ...parts.basis, ...value } } } };
}

function omitValue(payload: Readonly<Record<string, JsonValue>>, slot: BodySlot): Record<string, JsonValue> {
  if (slot !== "native_definition_material") { const { [fieldFor(slot)]: _value, ...rest } = payload; return rest; }
  const parts = nativeParts(payload);
  if (parts === null) throw new TypeError("native definition body slot is malformed");
  const basis = { ...parts.basis };
  for (const field of NATIVE_DEFINITION_FIELDS) delete basis[field];
  return { ...payload, instructionAssembly: { ...parts.assembly, envelope: { ...parts.envelope, nativeBasis: basis } } };
}

function targetIsAbsent(payload: Readonly<Record<string, JsonValue>>, slot: BodySlot): boolean {
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

/** v3 retained-route form: the nested pair source names the route's consumed Result. */
const ROUTE_SOURCE_CODEC = 3;
const ROUTE_PAIR = ["entry", "kind", "schemaVersion", "source"] as const;
/** @internal The durable owner's admitted events before the row being encoded or
 * decoded. Envelope membership is checked before the owner acquires any body. */
export interface EarlierAdmittedEvents {
  readonly envelope: (eventRef: string) => Omit<RuntimeEvent, "payload"> | undefined;
  readonly event: (eventRef: string) => RuntimeEvent;
  /** Encoding only: earlier event refs under the owner's existing CCall aggregate index. */
  readonly cCallEvents?: (cCallRef: string) => readonly string[];
}

// Shape checks only over a JSON route; the store validates restored events.
function retainedRoute(event: Readonly<Record<string, unknown>>, sourcePresent: boolean) {
  const payload = event.payload, bound = isRecord(payload) ? payload.boundInput : undefined;
  if (event.kind !== "traversal_route_admitted" || typeof event.admissionOrdinal !== "number" ||
      !["runId", "basisId", "graphCallId", "frameId"].every(key => typeof event[key] === "string") || !isRecord(payload) ||
      typeof payload.cCallRef !== "string" || !isRecord(bound) || bound.kind !== "raw_admitted_value" || !isRecord(bound.value) ||
      !hasExactKeys(bound.value, sourcePresent ? ROUTE_PAIR : ROUTE_PAIR.slice(0, 3)) || bound.value.kind !== "retained_graph_input" ||
      !isRecord(bound.value.entry) || sourcePresent && !isRecord(bound.value.source)) return null;
  return { payload, bound, value: bound.value, cCallRef: payload.cCallRef };
}

/** The route's consumed Result: an earlier event of its own CCall in its exact
 * Run, basis, graph call and frame. An equal body elsewhere, a basis, another
 * occurrence or the route itself never qualifies; no cause edge is required. */
function isConsumedResultEnvelope(route: Readonly<Record<string, unknown>>, cCallRef: string,
  source: Omit<RuntimeEvent, "payload">): boolean {
  return source.kind === "c_call_result_admitted" && source.aggregateType === "c_call" && source.aggregateId === cCallRef &&
    source.runId === route.runId && source.basisId === route.basisId && source.graphCallId === route.graphCallId &&
    source.frameId === route.frameId && source.admissionOrdinal < (route.admissionOrdinal as number);
}

function consumedResultValue(result: RuntimeEvent, cCallRef: string): JsonValue | undefined {
  const payload = result.payload;
  return isRecord(payload) && payload.cCallRef === cCallRef && payload.resultClass === "success" &&
    Object.hasOwn(payload, "value") ? payload.value : undefined;
}

function encodeRetainedRouteSource(event: RuntimeEvent, inline: string, earlier: EarlierAdmittedEvents): string | null {
  const route = retainedRoute(event as unknown as Readonly<Record<string, unknown>>, true);
  if (route === null || earlier.cCallEvents === undefined) return null;
  // Producer policy: name a Result only when exactly one earlier member exists.
  const sources = earlier.cCallEvents(route.cCallRef).flatMap(ref => {
    const source = earlier.envelope(ref);
    return source !== undefined && source.eventId === ref &&
      isConsumedResultEnvelope(event as unknown as Readonly<Record<string, unknown>>, route.cCallRef, source) ? [source] : [];
  });
  if (sources.length !== 1) return null;
  const source = sources[0]!, { source: body, ...value } = route.value;
  const encoded = canonicalJson({ kind: REFERENCE_RECORD, codecVersion: ROUTE_SOURCE_CODEC,
    event: { ...event, payload: { ...route.payload, boundInput: { ...route.bound, value } } } as JsonValue,
    bodyReference: { sourceEventRef: source.eventId, sourcePayloadDigest: source.payloadDigest, sourceSlot: "c_call_result_value",
      bodyDigest: sha256Canonical(body as JsonValue) } });
  // Ordinary small sources remain inline; only then is the Result body acquired.
  if (Buffer.byteLength(encoded) >= Buffer.byteLength(inline)) return null;
  const shared = consumedResultValue(earlier.event(source.eventId), route.cCallRef);
  return shared !== undefined && canonicalEquals(shared, body as JsonValue) ? encoded + "\n" : null;
}

function decodeRetainedRouteSource(event: Readonly<Record<string, unknown>>, reference: Readonly<Record<string, unknown>>,
  earlier?: EarlierAdmittedEvents): JsonValue {
  const route = retainedRoute(event, false), sourceRef = reference.sourceEventRef as string;
  const source = route === null || earlier === undefined ? undefined : earlier.envelope(sourceRef);
  if (route === null || source === undefined || source.eventId !== sourceRef || !isConsumedResultEnvelope(event, route.cCallRef, source) ||
      reference.sourceSlot !== "c_call_result_value" || reference.sourcePayloadDigest !== source.payloadDigest)
    throw new TypeError("durable body reference lacks its exact earlier consumed Result");
  // The Result's own physical form, inline or v1, resolves through its owner.
  const body = consumedResultValue(earlier!.event(sourceRef), route.cCallRef);
  if (body === undefined || sha256Canonical(body) !== reference.bodyDigest)
    throw new TypeError("durable body reference differs from its exact consumed Result");
  return { ...event, payload: { ...route.payload, boundInput: { ...route.bound, value: { ...route.value, source: body } } } } as JsonValue;
}

/** Detach caller data first; only this store's committed inline body may be
 * shared. Source eligibility and physical encoding remain the durable owner's. */
export function captureRuntimeEventCandidate(
  candidate: RuntimeEventCandidate,
  committed?: Pick<ReadonlyMap<string, InlineBody>, "get">,
  read?: InlineBodyReader,
): RuntimeEventCandidate {
  const captured = JSON.parse(canonicalJson(candidate)) as RuntimeEventCandidate;
  const slot = slotFor(captured.kind);
  if (slot === null || committed === undefined || !isRecord(captured.payload)) return captured;
  const value = valueAtSlot(captured.payload, slot);
  if (value === undefined) return captured;
  const source = committed.get(inlineEventBodyKey({ slot, digest: sha256Canonical(value) }));
  if (source !== undefined && compatibleSlots(source.slot, slot)) {
    const shared = bodyValue(source, read);
    if (canonicalEquals(shared, value))
      return { ...captured, payload: replaceValue(captured.payload, slot, shared) };
  }
  return captured;
}

/** The caller stages additions and publishes them only with the durable batch. */
export function encodeEventBody(event: RuntimeEvent, committed: InlineEventBodies, staged: InlineEventBodies,
  read?: InlineBodyReader, earlier?: EarlierAdmittedEvents): string {
  const inline = canonicalJson(event), body = inlineEventBody(event);
  if (body === null) return (earlier === undefined ? null : encodeRetainedRouteSource(event, inline, earlier)) ?? inline + "\n";
  const key = inlineEventBodyKey(body), source = staged.get(key) ?? committed.get(key);
  if (source !== undefined && compatibleSlots(source.slot, body.slot) && canonicalEquals(bodyValue(source, read), body.value!)) {
    const payload = omitValue(event.payload as Record<string, JsonValue>, body.slot);
    const encoded = canonicalJson({ kind: REFERENCE_RECORD, codecVersion: body.slot === "native_definition_material" ? 2 : 1, event: { ...event, payload },
      bodyReference: { sourceEventRef: source.eventRef, sourcePayloadDigest: source.payloadDigest,
        sourceSlot: source.slot, bodyDigest: body.digest } });
    // Ordinary small values remain inline when a reference would cost more.
    if (Buffer.byteLength(encoded) < Buffer.byteLength(inline)) return encoded + "\n";
  }
  if (source === undefined) staged.set(key, body);
  return inline + "\n";
}

/** Resolves only already validated, physically inline sources from this stream,
 * or a retained route's exact earlier consumed Result through its owner.
 * The event store still validates the complete restored envelope and all stamps. */
export function decodeEventBody(record: JsonValue, inlineByEvent: InlineEventBodies,
  read?: InlineBodyReader, earlier?: EarlierAdmittedEvents): {
  readonly event: JsonValue; readonly physicallyInline: boolean;
} {
  if (!isRecord(record) || record.kind !== REFERENCE_RECORD) return { event: record, physicallyInline: true };
  const reference = record.bodyReference, event = record.event;
  if (!hasExactKeys(record, ["kind", "codecVersion", "event", "bodyReference"]) ||
      (record.codecVersion !== 1 && record.codecVersion !== 2 && record.codecVersion !== ROUTE_SOURCE_CODEC) ||
      !isRecord(reference) || !hasExactKeys(reference, ["sourceEventRef", "sourcePayloadDigest", "sourceSlot", "bodyDigest"]) ||
      typeof reference.sourceEventRef !== "string" || !isRecord(event) || !isRecord(event.payload)) {
    throw new TypeError("durable body reference record is malformed");
  }
  if (record.codecVersion === ROUTE_SOURCE_CODEC) return { event: decodeRetainedRouteSource(event, reference, earlier), physicallyInline: false };
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
