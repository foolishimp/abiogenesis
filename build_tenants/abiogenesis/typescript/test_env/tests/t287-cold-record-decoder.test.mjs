import assert from "node:assert/strict";
import { constants } from "node:buffer";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SourceTextModule, SyntheticModule } from "node:vm";
import test from "node:test";
import * as owner from "../../build/code/src/abg/event_store.js";
import { canonicalJson } from "../../build/code/src/shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../../build/code/src/shared/digests.js";

// Optional differential oracle: the exact emitted predecessor, supplied by the
// closed correction evidence. No source reconstruction or duplicate decoder.
let previous;
if (process.env.ABI5_COLD_RECORD_PREIMAGE) {
  const file = resolve(import.meta.dirname, "../../build/code/src/abg/event_store.js");
  const module = new SourceTextModule(readFileSync(process.env.ABI5_COLD_RECORD_PREIMAGE, "utf8"),
    { identifier: file, initializeImportMeta: meta => { meta.url = pathToFileURL(file).href; } });
  await module.link(async spec => {
    const actual = await import(spec.startsWith("node:") ? spec : pathToFileURL(resolve(dirname(file), spec)).href);
    return new SyntheticModule(Object.keys(actual), function () {
      for (const [name, value] of Object.entries(actual)) this.setExport(name, value);
    });
  });
  await module.evaluate(); previous = module.namespace;
}

const candidate = (text, label) => ({ kind: "basis_admitted", eventTime: "2026-09-23T00:00:00.000Z",
  aggregateType: "workspace", aggregateId: "workspace://cold-record-fixture", parentAggregateId: null,
  causationEventRefs: [], correlationId: "correlation://cold-record-fixture/" + label,
  workflowVersion: "5.0.0", scopeClass: "workspace", basisId: "basis://cold-record-fixture/" + label,
  payload: { basisClass: "root", basisRef: "basis://cold-record-fixture/" + label,
    basisDigest: sha256Canonical(label), rawInputValue: { text } } });
const encode = events => Buffer.from(events.map(canonicalJson).join("\n") + "\n");
const event = owner.projectRuntimeEventFromValidatedHistory([], candidate("π 😀 café \r\n �", "unicode"));
const bytes = encode([event]);
const result = (implementation, value, profile) => {
  try { const events = implementation.validateHistoricalEvents(value, profile);
    return { events, physical: implementation.runtimeEventPhysicalPrefix(events) }; }
  catch (error) { return { error: { name: error.name, code: error.code ?? null, message: error.message } }; }
};

test("record decoder preserves complete framing precedence and exact historical refusals", () => {
  const mutate = f => { const row = structuredClone(event); f(row); return encode([row]); };
  const cases = [
    ["CR dominates blank/invalid JSON", Buffer.from("bad\n\n\r\n"), /incomplete trailing row/],
    ["trailing fragment dominates blank/invalid JSON", Buffer.from("bad\n\npartial"), /incomplete trailing row/],
    ["later blank dominates earlier invalid JSON", Buffer.from("bad\n\n"), /blank record/],
    ["first blank", Buffer.from("\n{}\n"), /blank record/],
    ["single LF", Buffer.from("\n"), /blank record/],
    ["invalid JSON", Buffer.from("bad\n"), /invalid JSON/],
    ["noncanonical", Buffer.from(" {}\n"), /noncanonical event/],
    ["logical envelope", Buffer.from("{}\n"), /invalid logical event/],
    ["ordinal", mutate(row => { row.admissionOrdinal = 2; }), /invalid admission ordinal/],
    ["stamp", mutate(row => { row.eventId += "-wrong"; }), /restamped or inconsistent/],
    ["profile stamp", mutate(row => { row.eventContractDigest = sha256Canonical("wrong"); }), /exact native profile schedule/],
    ["malformed UTF-8 at LF", Buffer.from([0xc2, 10]), /invalid JSON/],
    ["malformed UTF-8 before blank", Buffer.from([0xc2, 10, 10]), /blank record/],
  ];
  for (const [label, value, message] of cases) {
    const actual = result(owner, value);
    assert.match(actual.error.message, message, label);
    if (previous) assert.deepEqual(actual, result(previous, value), label);
  }
  for (const value of [Buffer.alloc(0), bytes]) {
    const profile = sha256Canonical("unknown profile");
    assert.match(result(owner, value, profile).error.message, /coordinate profile differs/);
    if (previous) assert.deepEqual(result(owner, value, profile), result(previous, value, profile));
  }
  assert.match(result(owner, bytes, owner.LEGACY_ROOT_EVENT_CONTRACT_DIGEST).error.message, /coordinate profile differs/);
});

test("record decoder preserves UTF-8 replacement, offset views and physical-prefix identity", () => {
  const wrapped = Buffer.concat([Buffer.from("ignored\r\n"), bytes, Buffer.from("ignored")]);
  const view = new Uint8Array(wrapped.buffer, wrapped.byteOffset + 9, bytes.length);
  for (const value of [bytes, view]) {
    assert.deepEqual(owner.validateHistoricalEvents(value), [event]);
    if (previous) assert.deepEqual(result(owner, value), result(previous, value));
  }
  const marker = Buffer.from("�"), offset = bytes.indexOf(marker);
  assert.ok(offset >= 0);
  const malformed = Buffer.concat([bytes.subarray(0, offset), Buffer.from([0xff]), bytes.subarray(offset + marker.length)]);
  const actual = result(owner, malformed);
  assert.deepEqual(actual.events, [event], "retain existing replacement-character admission, without UTF-8 hardening");
  assert.equal(actual.physical.digest, sha256Bytes(bytes), "preserve existing re-encoded physical-prefix hashing");
  assert.equal(actual.physical.byteLength, bytes.length);
  if (previous) assert.deepEqual(actual, result(previous, malformed));
  assert.deepEqual(owner.validateHistoricalEvents(Buffer.alloc(0)), []);
  const { eventContractDigest, eventId, ...legacyBody } = event;
  const legacy = { ...legacyBody, eventId: "event://abiogenesis/" + sha256Canonical(legacyBody).slice(7) };
  const legacyBytes = encode([legacy]);
  assert.deepEqual(owner.validateHistoricalEvents(legacyBytes, owner.LEGACY_ROOT_EVENT_CONTRACT_DIGEST), [legacy]);
  if (previous) assert.deepEqual(result(owner, legacyBytes), result(previous, legacyBytes));
});

test("material cold history above Node string length decodes by record with unchanged identities", {
  skip: process.env.ABI5_COLD_RECORD_MATERIAL !== "1" && "explicit material-memory selection required",
}, t => {
  const text = "x".repeat(20 * 1024 * 1024);
  const count = Math.ceil((constants.MAX_STRING_LENGTH + 1) / text.length);
  const expected = [], parts = [];
  // Synthetic current-profile lower-owner events, not original C10 history or
  // semantic application evidence. Each complete row is below the string limit.
  for (let index = 0; index < count; index++) {
    const projected = owner.projectRuntimeEventFromValidatedHistory(expected, candidate(text, String(index)));
    expected.push(projected); parts.push(encode([projected]));
  }
  const identities = expected.map(({ eventId, payloadDigest }) => ({ eventId, payloadDigest }));
  expected.length = 0;
  const complete = Buffer.concat(parts); parts.length = 0;
  assert.ok(complete.length > constants.MAX_STRING_LENGTH);
  assert.throws(() => complete.toString("utf8"), error => error.code === "ERR_STRING_TOO_LONG",
    "same predecessor whole-log conversion has the actual engine failure");
  const started = performance.now(), decoded = owner.validateHistoricalEvents(complete);
  assert.equal(decoded.length, identities.length);
  for (let index = 0; index < decoded.length; index++) {
    assert.equal(decoded[index].eventId, identities[index].eventId);
    assert.equal(decoded[index].payloadDigest, identities[index].payloadDigest);
    assert.equal(decoded[index].payload.rawInputValue.text, text);
    assert.equal(decoded[index].admissionOrdinal, index + 1);
  }
  const physical = owner.runtimeEventPhysicalPrefix(decoded);
  assert.equal(physical.byteLength, complete.length);
  assert.equal(physical.digest, sha256Bytes(complete));
  t.diagnostic(JSON.stringify({ byteLength: complete.length, records: count, recordTextBytes: text.length,
    nodeMaxStringLength: constants.MAX_STRING_LENGTH, decodeElapsedMs: performance.now() - started,
    maxRssKiB: process.resourceUsage().maxRSS, scope: "shared decoder only; complete buffer and logical history remain resident" }));
});
