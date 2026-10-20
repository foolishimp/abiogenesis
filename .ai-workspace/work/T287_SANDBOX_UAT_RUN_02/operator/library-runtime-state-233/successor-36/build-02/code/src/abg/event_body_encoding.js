import { canonicalJson } from "../shared/canonical_json.js";
import { isRecord, isJsonRecordShape } from "../shared/admission_predicates.js";
import { sha256Canonical } from "../shared/digests.js";
/** Storage-only vocabulary. Product values never reserve a marker or JSON path. */
const REFERENCE_RECORD = "abg_admitted_body_reference_record";
const NATIVE_DEFINITION_FIELDS = ["publication", "assessmentPublication", "lifecyclePublication", "sourcePublication",
    "declarationGraphFunctions", "graphFunction"];
const slotFor = (kind) => kind === "basis_admitted" ? "basis_input"
    : kind === "c_call_result_admitted" ? "c_call_result_value"
        : kind === "actor_transport_binding_admitted" ? "native_definition_material" : null;
const fieldFor = (slot) => slot === "basis_input" ? "rawInputValue" : "value";
const exactKeys = (value, keys) => Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
function nativeParts(payload) {
    if (!isJsonRecordShape(payload) || !isJsonRecordShape(payload.instructionAssembly))
        return null;
    const assembly = payload.instructionAssembly;
    if (assembly.kind !== "native_instruction_assembly" || assembly.schemaVersion !== "5.0.0" ||
        !isJsonRecordShape(assembly.envelope) || !isJsonRecordShape(assembly.envelope.nativeBasis))
        return null;
    return { assembly, envelope: assembly.envelope, basis: assembly.envelope.nativeBasis };
}
function isNativeDefinitionBundle(value) {
    return isRecord(value) && Object.keys(value).every(key => NATIVE_DEFINITION_FIELDS.includes(key)) &&
        isRecord(value.publication) && isRecord(value.graphFunction) && Array.isArray(value.declarationGraphFunctions) &&
        value.declarationGraphFunctions.every(isRecord) &&
        ["assessmentPublication", "lifecyclePublication", "sourcePublication"].every(key => !Object.hasOwn(value, key) || isRecord(value[key]));
}
function valueAtSlot(payload, slot) {
    if (slot !== "native_definition_material")
        return payload[fieldFor(slot)];
    const parts = nativeParts(payload);
    if (parts === null)
        return undefined;
    const bundle = {};
    for (const field of NATIVE_DEFINITION_FIELDS)
        if (Object.hasOwn(parts.basis, field))
            bundle[field] = parts.basis[field];
    return isNativeDefinitionBundle(bundle) ? bundle : undefined;
}
function replaceValue(payload, slot, value) {
    if (slot !== "native_definition_material")
        return { ...payload, [fieldFor(slot)]: value };
    const parts = nativeParts(payload);
    if (parts === null || !isNativeDefinitionBundle(value))
        throw new TypeError("native definition body slot is malformed");
    return { ...payload, instructionAssembly: { ...parts.assembly, envelope: { ...parts.envelope,
                nativeBasis: { ...parts.basis, ...value } } } };
}
function omitValue(payload, slot) {
    if (slot !== "native_definition_material") {
        const { [fieldFor(slot)]: _value, ...rest } = payload;
        return rest;
    }
    const parts = nativeParts(payload);
    if (parts === null)
        throw new TypeError("native definition body slot is malformed");
    const basis = { ...parts.basis };
    for (const field of NATIVE_DEFINITION_FIELDS)
        delete basis[field];
    return { ...payload, instructionAssembly: { ...parts.assembly, envelope: { ...parts.envelope, nativeBasis: basis } } };
}
function targetIsAbsent(payload, slot) {
    if (slot !== "native_definition_material")
        return !Object.hasOwn(payload, fieldFor(slot));
    const parts = nativeParts(payload);
    return parts !== null && NATIVE_DEFINITION_FIELDS.every(field => !Object.hasOwn(parts.basis, field));
}
/** @internal One existing coordinate table, with the native typed slot separated
 * from unrestricted input/Result values. The old cross-slot key is unchanged. */
export function inlineEventBodyKey(body) {
    return body.slot === "native_definition_material" ? "native_definition_material:" + body.digest : body.digest;
}
const compatibleSlots = (a, b) => (a === "native_definition_material") === (b === "native_definition_material");
export function inlineEventBody(event) {
    const slot = slotFor(event.kind);
    if (slot === null || !isRecord(event.payload))
        return null;
    const value = valueAtSlot(event.payload, slot);
    if (value === undefined)
        return null;
    return { eventRef: event.eventId, payloadDigest: event.payloadDigest,
        admissionOrdinal: event.admissionOrdinal, slot, value, digest: sha256Canonical(value) };
}
/** @internal Encoding and selected durable reads use the same exact extraction. */
export function inlineEventBodyValue(event, source) {
    const body = inlineEventBody(event);
    if (body === null || body.eventRef !== source.eventRef || body.payloadDigest !== source.payloadDigest ||
        body.admissionOrdinal !== source.admissionOrdinal || body.slot !== source.slot || body.digest !== source.digest)
        throw new TypeError("selected inline body differs from its admitted source");
    return body.value;
}
/** The durable owner keeps coordinates, never the decoded source value. */
export function inlineEventBodyCoordinate(event) {
    const body = inlineEventBody(event);
    if (body === null)
        return null;
    const { value: _value, ...coordinate } = body;
    return coordinate;
}
function bodyValue(source, read) {
    if (Object.hasOwn(source, "value"))
        return source.value;
    if (read === undefined)
        throw new TypeError("durable body coordinate lacks its owner acquisition");
    return read(source);
}
/** Detach caller data first; only this store's committed inline body may be
 * shared. Source eligibility and physical encoding remain the durable owner's. */
export function captureRuntimeEventCandidate(candidate, committed, read) {
    const captured = JSON.parse(canonicalJson(candidate));
    const slot = slotFor(captured.kind);
    if (slot === null || committed === undefined || !isRecord(captured.payload))
        return captured;
    const value = valueAtSlot(captured.payload, slot);
    if (value === undefined)
        return captured;
    const source = committed.get(inlineEventBodyKey({ slot, digest: sha256Canonical(value) }));
    if (source !== undefined && compatibleSlots(source.slot, slot)) {
        const shared = bodyValue(source, read);
        if (canonicalJson(shared) === canonicalJson(value))
            return { ...captured, payload: replaceValue(captured.payload, slot, shared) };
    }
    return captured;
}
/** The caller stages additions and publishes them only with the durable batch. */
export function encodeEventBody(event, committed, staged, read) {
    const inline = canonicalJson(event), body = inlineEventBody(event);
    if (body === null)
        return inline + "\n";
    const key = inlineEventBodyKey(body), source = staged.get(key) ?? committed.get(key);
    if (source !== undefined && compatibleSlots(source.slot, body.slot) && canonicalJson(bodyValue(source, read)) === canonicalJson(body.value)) {
        const payload = omitValue(event.payload, body.slot);
        const encoded = canonicalJson({ kind: REFERENCE_RECORD, codecVersion: body.slot === "native_definition_material" ? 2 : 1, event: { ...event, payload },
            bodyReference: { sourceEventRef: source.eventRef, sourcePayloadDigest: source.payloadDigest,
                sourceSlot: source.slot, bodyDigest: body.digest } });
        // Ordinary small values remain inline when a reference would cost more.
        if (Buffer.byteLength(encoded) < Buffer.byteLength(inline))
            return encoded + "\n";
    }
    if (source === undefined)
        staged.set(key, body);
    return inline + "\n";
}
/** Resolves only already validated, physically inline sources from this stream.
 * The event store still validates the complete restored envelope and all stamps. */
export function decodeEventBody(record, inlineByEvent, read) {
    if (!isRecord(record) || record.kind !== REFERENCE_RECORD)
        return { event: record, physicallyInline: true };
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
    if (sha256Canonical(shared) !== source.digest)
        throw new TypeError("durable body reference differs from its exact inline source");
    return { event: { ...event, payload: replaceValue(event.payload, target, shared) }, physicallyInline: false };
}
