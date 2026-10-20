import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdtemp, readFile, writeFile, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { syncBuiltinESMExports } from "node:module";
import { execFileSync } from "node:child_process";
import test from "node:test";
import * as storeOwner from "../../build/code/src/abg/event_store.js";
import { persistEventLog } from "../../build/code/src/abg/event_log.js";
import { selectValidatedRuntimeEventPrefix } from "../../build/code/src/abg/event_prefix.js";
import { replayValidatedRuntimeEventPrefix } from "../../build/code/src/abg/replay.js";
import { projectExactExecutionBasisAtPrefix } from "../../build/code/src/abg/invocation_execution_truth.js";
import { canonicalJson, writeCanonicalJson } from "../../build/code/src/shared/canonical_json.js";
import { sha256Canonical, sha256Bytes } from "../../build/code/src/shared/digests.js";
import { isDeeplyFrozen } from "../../build/code/src/shared/immutable.js";

test("shared canonical bytes preserve UTF-16 keys, escaping, numbers and sparse arrays", () => {
  const value = { "\ufffd": "last", "\ud834\udd1e": "first", "2": -0, "10": 1e21,
    text: "\"\\\b\f\n\r\t\u0000\ud800", values: [null, true, false, 1e-7, Number.MIN_VALUE] };
  assert.equal(canonicalJson(value), '{"10":1e+21,"2":0,"text":"\\\"\\\\\\b\\f\\n\\r\\t\\u0000\\ud800","values":[null,true,false,1e-7,5e-324],"𝄞":"first","�":"last"}');
  assert.equal(canonicalJson({}), "{}");
  assert.equal(canonicalJson([]), "[]");
  assert.equal(canonicalJson(Array(1)), "[]");
  const sparse = Array(4); sparse[1] = {a: 1};
  assert.equal(canonicalJson(sparse), '[,{"a":1},,]');
  const inherited = Array(4), prototype = Object.create(Array.prototype);
  prototype[2] = "inherited"; Object.setPrototypeOf(inherited, prototype); inherited[1] = "own";
  assert.equal(canonicalJson(inherited), '[,"own","inherited",]');
  const shared = {text: "same value"};
  assert.equal(canonicalJson([shared, shared]), '[{"text":"same value"},{"text":"same value"}]');
});

test("shared canonical traversal preserves captured entries, array length and refusal precedence", () => {
  const visited = [], value = {};
  Object.defineProperties(value, {
    b: {enumerable: true, get() { visited.push("b"); return {get child() { visited.push("child"); return 1; }}; }},
    a: {enumerable: true, get() { visited.push("a"); return Infinity; }},
  });
  assert.throws(() => canonicalJson(value), {name: "TypeError", message: "canonical JSON does not admit non-finite numbers"});
  assert.deepEqual(visited, ["b", "a"], "entries are captured before sorted traversal refuses a");
  const shrinks = [0, 1, 2];
  Object.defineProperty(shrinks, 0, {get() { shrinks.length = 1; return 7; }});
  assert.equal(canonicalJson(shrinks), "[7,,]", "array iteration retains its entry length");
  for (const invalid of [NaN, Infinity, -Infinity, {nested: [NaN]}]) {
    assert.throws(() => canonicalJson(invalid), {name: "TypeError", message: "canonical JSON does not admit non-finite numbers"});
  }
  for (const invalid of [undefined, [undefined], {present: undefined}]) assert.throws(() => canonicalJson(invalid), TypeError);
  const cycle = {}; cycle.self = cycle;
  assert.throws(() => canonicalJson(cycle), RangeError);
});

test("incremental canonical hashes preserve independently declared golden bytes and refusal behavior", () => {
  const cases = [
    [null, "null"], [false, "false"], [-0, "0"], [Number.MAX_SAFE_INTEGER, "9007199254740991"],
    [{ z: "\ud800", a: "é𝄞", n: 1e-7 }, '{"a":"é𝄞","n":1e-7,"z":"\\ud800"}'],
    [Array(4), "[,,,]"],
    [{ "2": Number.MIN_VALUE, "10": 1e21 }, '{"10":1e+21,"2":5e-324}'],
  ];
  for (const [value, bytes] of cases) {
    const chunks = []; writeCanonicalJson(value, chunk => chunks.push(chunk));
    assert.equal(chunks.join(""), bytes);
    assert.equal(canonicalJson(value), bytes);
    assert.equal(sha256Canonical(value), sha256Bytes(Buffer.from(bytes, "utf8")));
  }
  const sparse = Array(4), proto = Object.create(Array.prototype); proto[2] = "𝄞";
  Object.setPrototypeOf(sparse, proto); sparse[1] = -0;
  assert.equal(sha256Canonical(sparse), sha256Bytes('[,0,"𝄞",]'));
  for (const invalid of [NaN, Infinity, -Infinity, { a: [NaN] }, undefined, [undefined], {a: undefined}]) {
    let textFailure, hashFailure;
    try { canonicalJson(invalid); } catch (error) { textFailure = error; }
    try { sha256Canonical(invalid); } catch (error) { hashFailure = error; }
    assert.ok(textFailure); assert.equal(hashFailure?.name, textFailure.name);
    assert.equal(hashFailure?.message, textFailure.message);
  }
  const makeValue = visits => ({
    get z() { visits.push("z"); return {get inner() {visits.push("inner"); return 1;}}; },
    get a() { visits.push("a"); return Infinity; },
  });
  const textVisits = [], hashVisits = [];
  assert.throws(() => canonicalJson(makeValue(textVisits)), TypeError);
  assert.throws(() => sha256Canonical(makeValue(hashVisits)), TypeError);
  assert.deepEqual(hashVisits, ["z", "a"]); assert.deepEqual(hashVisits, textVisits);
  const cycle = {}; cycle.self = cycle; assert.throws(() => sha256Canonical(cycle), RangeError);
});

const time = "2026-09-22T00:00:00.000Z";
const input = { kind: "body_fixture_input", text: "selected complete input; ".repeat(1500),
  metadata: { sources: ["source://body-fixture/input"] } };
const output = { kind: "body_fixture_output", text: "original result and evidence; ".repeat(1500),
  evidence: { items: [{ ref: "evidence://body-fixture/result" }] } };
const encode = rows => Buffer.from(rows.map(canonicalJson).join("\n") + "\n");
const decodeRows = bytes => bytes.toString().trimEnd().split("\n").map(JSON.parse);
const replay = events => replayValidatedRuntimeEventPrefix(selectValidatedRuntimeEventPrefix(events));
const envelope = (kind, payload, overrides = {}) => ({ kind, payload, eventTime: time,
  aggregateType: "workspace", aggregateId: "workspace://body-fixture", parentAggregateId: null,
  causationEventRefs: [], correlationId: "correlation://body-fixture", workflowVersion: "5.0.0",
  scopeClass: "workspace", basisId: "basis://body-fixture", ...overrides });
function basis(value, label, child = false) {
  const body = { basisClass: child ? "child" : "root", rawInputValue: value,
    rawInputDigest: sha256Canonical(value), invocationRef: "invocation://body-fixture/" + label };
  const basisDigest = sha256Canonical(body), basisRef = "execution-basis://abiogenesis/" + basisDigest.slice(7);
  return envelope("basis_admitted", { ...body, basisRef, basisDigest }, { basisId: basisRef,
    ...(child ? { aggregateType: "frame", aggregateId: "frame://child", scopeClass: "run",
      runId: "run://body-fixture", graphCallId: "graph-call://child", frameId: "frame://child" } : {}) });
}
async function resource(t) {
  const dir = await mkdtemp(join(tmpdir(), "abi5-body-"));
  const eventLogPath = join(dir, "events.jsonl");
  const acquired = storeOwner.createNewEmptyAppendSink({ kind: "new_empty_append_sink_request", schemaVersion: "5.0.0", eventLogPath });
  assert.ok(acquired.store, JSON.stringify(acquired));
  t.after(async () => { acquired.store.closeDurableLog(); await rm(dir, { force: true, recursive: true }); });
  return { ...acquired, dir, eventLogPath };
}
// Real event-store stamping/admission and CCall phase projection; fixture supplies
// lower callable/evidence semantics. This is not an installed Program qualification.
function result(store, label, value) {
  const cCallRef = "c-call://body-fixture/" + label;
  const extra = { aggregateType: "c_call", aggregateId: cCallRef, parentAggregateId: "frame://" + label,
    scopeClass: "run", runId: "run://body-fixture", graphCallId: "graph-call://" + label, frameId: "frame://" + label };
  const pair = storeOwner.admitRuntimeEventBatch(store, [
    () => envelope("c_call_opened", { cCallRef, cCallDigest: sha256Canonical(label), callClass: "leaf",
      batchRef: null, taskOrdinal: null, attempt: 1, programLocusRef: "locus://" + label, retryPath: [] }, extra),
    prior => envelope("c_call_fibre_selected", { cCallRef, callClass: "leaf", armId: "arm://fixture", regime: "F_D" },
      { ...extra, causationEventRefs: [prior.at(-1).eventId] }),
  ]);
  const body = { cCallRef, resultClass: "success", contractRef: "contract://body-output", valueKind: value.kind,
    evidenceRefs: [], value, valueDigest: sha256Canonical(value) };
  const resultDigest = sha256Canonical(body), resultRef = "result://body-fixture/" + resultDigest.slice(7);
  return storeOwner.admitRuntimeEvent(store, envelope("c_call_result_admitted", { ...body, resultRef, resultDigest },
    { ...extra, causationEventRefs: [pair.at(-1).eventId] }));
}
function seed(store) {
  storeOwner.admitRuntimeEvent(store, basis(input, "root"));
  storeOwner.admitRuntimeEvent(store, basis(input, "child", true));
  result(store, "child", output);
  result(store, "parent-foldback", output);
  storeOwner.admitRuntimeEvent(store, basis(output, "result-consumer"));
}
function assertSharedColdBodies(events) {
  const [root, child, consumer] = events.filter(event => event.kind === "basis_admitted");
  const [childResult, parentResult] = events.filter(event => event.kind === "c_call_result_admitted");
  assert.equal(child.payload.rawInputValue, root.payload.rawInputValue, "basis reference reuses its earlier parsed body");
  assert.equal(parentResult.payload.value, childResult.payload.value, "Result reference reuses its earlier parsed body");
  assert.equal(consumer.payload.rawInputValue, childResult.payload.value, "cross-slot reference retains the exact admitted Result body");
  assert.notEqual(child, root, "body sharing does not share event envelopes");
  assert.notEqual(child.payload, root.payload, "each envelope retains its own payload fields");
  assert.notEqual(parentResult.payload, childResult.payload);
  assert.ok(isDeeplyFrozen(events), "new envelopes and reused nested bodies remain deeply immutable");
}
async function openInlineCopy(t, dir, events, authority) {
  const eventLogPath = join(dir, "historical-inline.jsonl"), bytes = encode(events);
  await writeFile(eventLogPath, bytes);
  const info = await stat(eventLogPath);
  const { authorityDigest: _old, ...body } = authority;
  Object.assign(body, { eventLogPath, device: info.dev, inode: info.ino,
    durableByteLength: bytes.length, eventLogDigest: sha256Bytes(bytes) });
  const reopened = storeOwner.reopenEventStore({ ...body, authorityDigest: sha256Canonical(body) });
  assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
  t.after(() => reopened.store.closeDurableLog());
  return { ...reopened, bytes, eventLogPath };
}

test("native body encoding retains distinct admissions, exact logical replay, cold reopen and historical-inline append", async t => {
  const f = await resource(t); seed(f.store);
  const events = f.store.readAll(), bytes = await readFile(f.eventLogPath), rows = decodeRows(bytes), inline = encode(events);
  assertSharedColdBodies(events);
  assert.equal(rows.filter(row => row.kind === "abg_admitted_body_reference_record").length, 3);
  assert.equal(rows.filter(row => row.kind === "basis_admitted").length, 1);
  assert.equal(rows.filter(row => row.kind === "c_call_result_admitted").length, 1);
  assert.equal(new Set(events.map(event => event.eventId)).size, events.length);
  const cold = storeOwner.validateHistoricalEvents(bytes), coldInline = storeOwner.validateHistoricalEvents(inline);
  assert.deepEqual(cold, events); assert.deepEqual(coldInline, events);
  assertSharedColdBodies(cold);
  assert.notEqual(cold[0].payload.rawInputValue, input, "cold reuse starts from the detached parsed source, not caller input");
  assert.notEqual(cold[0].payload.rawInputValue, events[0].payload.rawInputValue, "cold reconstruction does not borrow live identities");
  assert.notEqual(coldInline[0].payload.rawInputValue, coldInline[1].payload.rawInputValue,
    "independently inline values are not implicitly interned");
  assert.notEqual(storeOwner.validateHistoricalEvents(bytes)[0].payload.rawInputValue, cold[0].payload.rawInputValue,
    "separate cold acquisitions reconstruct their own source bodies");
  assert.deepEqual(replay(cold), replay(coldInline));
  for (const event of events.filter(event => event.kind === "basis_admitted")) {
    const projected = projectExactExecutionBasisAtPrefix(selectValidatedRuntimeEventPrefix(events), event.basisId);
    assert.ok(projected); assert.deepEqual(projected.rawInputValue, event.payload.rawInputValue);
  }
  const persisted = await persistEventLog(f.store, f.eventLogPath);
  assert.deepEqual(persisted.events, events); assert.equal(persisted.eventLogDigest, sha256Bytes(bytes));
  const closed = f.store.projectReopenAuthorityAndClose();
  const reopened = storeOwner.reopenEventStore(JSON.parse(JSON.stringify(closed.reopenAuthority)));
  assert.equal(reopened.kind, "reopened_event_store_context");
  t.after(() => reopened.store.closeDurableLog()); assert.deepEqual(reopened.store.readAll(), events);
  assertSharedColdBodies(reopened.store.readAll());
  const expanded = await openInlineCopy(t, f.dir, events, closed.reopenAuthority);
  assert.notEqual(expanded.prefix.prefixDigest, reopened.prefix.prefixDigest);
  assert.deepEqual(replay(expanded.store.readAll()), replay(reopened.store.readAll()));
  const next = basis(output, "after-cold");
  storeOwner.admitRuntimeEvent(expanded.store, next); storeOwner.admitRuntimeEvent(reopened.store, next);
  assert.deepEqual(expanded.store.readAll(), reopened.store.readAll());
  assert.equal(decodeRows(await readFile(expanded.eventLogPath)).at(-1).kind, "abg_admitted_body_reference_record");
  const fresh = execFileSync(process.execPath, ["--input-type=module", "-e", `
    import assert from 'node:assert/strict';
    import {readFileSync} from 'node:fs';
    import {validateHistoricalEvents} from './build/code/src/abg/event_store.js';
    import {selectValidatedRuntimeEventPrefix} from './build/code/src/abg/event_prefix.js';
    import {replayValidatedRuntimeEventPrefix} from './build/code/src/abg/replay.js';
    import {sha256Canonical} from './build/code/src/shared/digests.js';
    import {isDeeplyFrozen} from './build/code/src/shared/immutable.js';
    const values=process.argv.slice(1).map(path=>validateHistoricalEvents(readFileSync(path)));
    (${assertSharedColdBodies.toString()})(values[0]);
    console.log(JSON.stringify(values.map(events=>({events:sha256Canonical(events),replay:sha256Canonical(replayValidatedRuntimeEventPrefix(selectValidatedRuntimeEventPrefix(events)))}))));
  `, f.eventLogPath, expanded.eventLogPath], { cwd: new URL("../..", import.meta.url), encoding: "utf8" });
  const [a,b] = JSON.parse(fresh); assert.deepEqual(a,b);
  t.diagnostic(JSON.stringify({ physicalBytes: bytes.length, expandedBytes: inline.length,
    savedBytes: inline.length - bytes.length, logicalEvents: events.length, freshProcessReplayEqual: true,
    exactColdBodyReuse: ["basis-to-basis", "result-to-result", "result-to-basis"], deeplyFrozen: true }));
});

test("physical source cuts and F_H predecessor digest use encoded bytes, retain cold ancestry and reject crossed sequences", async t => {
  const f = await resource(t); seed(f.store);
  const events = f.store.readAll(), current = storeOwner.selectHeldEventStoreDurablePrefix(f.store);
  const bytes = await readFile(f.eventLogPath), lines = bytes.toString().trimEnd().split("\n");
  const count = 5, cutBytes = Buffer.from(lines.slice(0,count).join("\n") + "\n");
  const cut = storeOwner.durableRuntimeEventPrefixThroughEvent(current, events[count-1].eventId);
  assert.equal(cut.prefixLength, cutBytes.length); assert.equal(cut.prefixDigest, sha256Bytes(cutBytes));
  assert.deepEqual(storeOwner.readRuntimeEventsAtDurablePrefix(cut), events.slice(0,count));
  // Exact subordinate relation consumed by F_H; no continuation semantics are stubbed or minted.
  assert.equal(storeOwner.runtimeEventPhysicalPrefix(events.slice(0,count)).digest, cut.prefixDigest);
  assert.notEqual(storeOwner.durableRuntimeEventPrefixDigest(events.slice(0,count)), cut.prefixDigest);
  const cold = storeOwner.validateHistoricalEvents(bytes);
  assert.equal(storeOwner.runtimeEventPhysicalPrefix(cold.slice(0,count)).digest, cut.prefixDigest);
  assert.throws(() => storeOwner.runtimeEventPhysicalPrefix([...events.slice(0,count-1), cold[count-1]]), /exact source/);
  assert.throws(() => storeOwner.runtimeEventPhysicalPrefix([...events.slice(0,count-1), structuredClone(events[count-1])]), /uncommitted/);
  assert.equal(storeOwner.runtimeEventPhysicalPrefix(structuredClone(events.slice(0,count))).digest,
    storeOwner.durableRuntimeEventPrefixDigest(events.slice(0,count)), "unbound in-memory history retains inline meaning");
  f.store.projectReopenAuthorityAndClose();
  assert.equal(storeOwner.authenticateRuntimePrefixAncestry(JSON.parse(JSON.stringify(cut)), JSON.parse(JSON.stringify(current))), true);
  const coldCut = storeOwner.durableRuntimeEventPrefixThroughEvent(JSON.parse(JSON.stringify(current)), events[count-1].eventId);
  assert.deepEqual(coldCut, cut);
  assert.throws(() => storeOwner.readRuntimeEventsAtDurablePrefix(cut, { requireCurrent: true }), /current/);
});

test("nearest malformed body references refuse before logical history is exposed", async t => {
  const f = await resource(t); seed(f.store);
  const rows = decodeRows(await readFile(f.eventLogPath));
  const refIndexes = rows.flatMap((row,index) => row.kind === "abg_admitted_body_reference_record" ? [index] : []);
  const first = refIndexes[0], last = refIndexes.at(-1);
  const mutations = {
    deletedSource: r => { r.splice(0, 1); },
    missing: r => { r[first].bodyReference.sourceEventRef = "event://missing"; },
    forward: r => { r[first].bodyReference.sourceEventRef = r.at(-1).event.eventId; },
    wrongPayload: r => { r[first].bodyReference.sourcePayloadDigest = sha256Canonical("wrong"); },
    wrongSlot: r => { r[first].bodyReference.sourceSlot = "c_call_result_value"; },
    wrongBody: r => { r[first].bodyReference.bodyDigest = sha256Canonical("wrong"); },
    crossed: r => { r[last].bodyReference.sourceEventRef = r[0].eventId; },
    referenceToReference: r => { r[last].bodyReference.sourceEventRef = r[refIndexes[1]].event.eventId;
      r[last].bodyReference.sourcePayloadDigest = r[refIndexes[1]].event.payloadDigest; },
    mixed: r => { r[first].event.payload.rawInputValue = input; },
    unknownVersion: r => { r[first].codecVersion = 2; },
    unknownSlot: r => { r[first].bodyReference.sourceSlot = "arbitrary/path"; },
  };
  for (const [name,mutate] of Object.entries(mutations)) {
    const changed = structuredClone(rows); mutate(changed);
    assert.throws(() => storeOwner.validateHistoricalEvents(encode(changed)), /body reference/, name);
  }
  const other = await resource(t); storeOwner.admitRuntimeEvent(other.store, basis(input, "foreign"));
  const foreign = f.store.readAll()[0], changed = structuredClone(rows);
  changed[first].bodyReference.sourceEventRef = other.store.readAll()[0].eventId;
  assert.notEqual(changed[first].bodyReference.sourceEventRef, foreign.eventId);
  assert.throws(() => storeOwner.validateHistoricalEvents(encode(changed)), /body reference/);
  assert.throws(() => storeOwner.admitRuntimeEvent(f.store, rows[first]), /candidate|kind|shape|contract/);
});

test("reused cold bodies still require each new envelope identity, stamp, cause and logical digest", async t => {
  const f = await resource(t); seed(f.store);
  const rows = decodeRows(await readFile(f.eventLogPath));
  const first = rows.findIndex(row => row.kind === "abg_admitted_body_reference_record");
  const mutations = {
    eventId: [event => { event.eventId = "event://changed"; }, /inconsistent history/],
    ordinal: [event => { event.admissionOrdinal += 1; }, /admission ordinal/],
    payloadDigest: [event => { event.payloadDigest = sha256Canonical("changed"); }, /inconsistent history/],
    stamp: [event => { event.eventContractDigest = sha256Canonical("changed"); }, /event stamp/],
    missingCause: [event => { event.causationEventRefs = ["event://missing"]; }, /causation refs/],
    duplicateCause: [event => { event.causationEventRefs = [rows[0].eventId, rows[0].eventId]; }, /causation refs/],
    changedEnvelope: [event => { event.correlationId = "correlation://changed"; }, /inconsistent history/],
  };
  for (const [name, [mutate, refusal]] of Object.entries(mutations)) {
    const changed = structuredClone(rows); mutate(changed[first].event);
    assert.throws(() => storeOwner.validateHistoricalEvents(encode(changed)), refusal, name);
  }
});

test("independently supplied mutable raw input remains detached at event admission", async t => {
  const f = await resource(t), supplied = structuredClone(input), candidate = basis(supplied, "mutable-ingress");
  const admitted = storeOwner.admitRuntimeEvent(f.store, candidate);
  assert.notEqual(admitted.payload.rawInputValue, supplied);
  assert.notEqual(admitted.payload.rawInputValue.metadata, supplied.metadata);
  supplied.text = "changed after admission"; supplied.metadata.sources.push("source://unadmitted");
  candidate.causationEventRefs.push("event://unadmitted");
  assert.deepEqual(admitted.payload.rawInputValue, input);
  assert.deepEqual(admitted.causationEventRefs, []);
  assert.ok(isDeeplyFrozen(admitted));
  assert.deepEqual(storeOwner.validateHistoricalEvents(await readFile(f.eventLogPath)), f.store.readAll());
});

test("live body reuse preserves caller isolation, owned prefix and transaction rollback", async t => {
  const f = await resource(t), foreign = await resource(t);
  const first = storeOwner.admitRuntimeEvent(f.store, basis(input, "committed-source"));
  const foreignSource = storeOwner.admitRuntimeEvent(foreign.store, basis(input, "foreign-source"));
  const supplied = structuredClone(input), candidate = basis(supplied, "detached-equal");
  const duplicate = storeOwner.admitRuntimeEvent(f.store, candidate);
  assert.notEqual(duplicate.payload.rawInputValue, supplied);
  assert.notEqual(duplicate.payload.rawInputValue, foreignSource.payload.rawInputValue);
  supplied.metadata.sources.push("source://caller-only"); candidate.payload.rawInputValue.text = "caller-only";
  assert.deepEqual(duplicate.payload.rawInputValue, input);
  assert.ok(isDeeplyFrozen(duplicate));
  const committed = storeOwner.selectHeldEventStoreDurablePrefix(f.store), oldBytes = await readFile(f.eventLogPath);
  const newValue = {...output, text: "tentative complete body; ".repeat(1500)};
  assert.throws(() => storeOwner.admitRuntimeEventTransaction(f.store, () => {
    storeOwner.admitRuntimeEvent(f.store, basis(input, "tentative-reuse"));
    storeOwner.admitRuntimeEvent(f.store, basis(newValue, "tentative-new"));
    throw Error("selected rollback");
  }), /selected rollback/);
  assert.equal(storeOwner.selectHeldEventStoreDurablePrefix(f.store), committed);
  assert.deepEqual(await readFile(f.eventLogPath), oldBytes);
  assert.deepEqual(f.store.readAll(), [first, duplicate]);
  storeOwner.admitRuntimeEvent(f.store, basis(newValue, "new-after-rollback"));
  storeOwner.admitRuntimeEvent(f.store, basis(input, "reuse-after-rollback"));
  const rows = decodeRows(await readFile(f.eventLogPath));
  assert.equal(rows[2].kind, "basis_admitted", "rolled-back source eligibility is not published");
  assert.equal(rows[3].bodyReference.sourceEventRef, first.eventId);
  const closed = f.store.projectReopenAuthorityAndClose(), reopened = storeOwner.reopenEventStore(closed.reopenAuthority);
  assert.equal(reopened.kind, "reopened_event_store_context"); t.after(() => reopened.store.closeDurableLog());
  assert.deepEqual(reopened.store.readAll(), f.store.readAll());
  const appended = storeOwner.admitRuntimeEvent(reopened.store, basis(structuredClone(input), "reuse-after-reopen"));
  assert.deepEqual(appended.payload.rawInputValue, input); assert.ok(isDeeplyFrozen(appended));
  assert.deepEqual(storeOwner.validateHistoricalEvents(await readFile(f.eventLogPath)), reopened.store.readAll());
});

test("literal marker-shaped Product data and small duplicate values remain unambiguous", async t => {
  const f = await resource(t);
  const literal = { kind: "abg_admitted_body_reference_record", codecVersion: 1,
    event: { arbitrary: true }, bodyReference: { sourceEventRef: "literal user data" }, text: input.text };
  storeOwner.admitRuntimeEvent(f.store, basis(literal, "literal-one"));
  storeOwner.admitRuntimeEvent(f.store, basis(literal, "literal-two"));
  storeOwner.admitRuntimeEvent(f.store, basis({n:1}, "tiny-one"));
  storeOwner.admitRuntimeEvent(f.store, basis({n:1}, "tiny-two"));
  const bytes = await readFile(f.eventLogPath), rows = decodeRows(bytes);
  assert.equal(rows[1].kind, "abg_admitted_body_reference_record");
  assert.equal(rows[3].kind, "basis_admitted");
  assert.deepEqual(storeOwner.validateHistoricalEvents(bytes), f.store.readAll());
  assert.deepEqual(f.store.readAll()[1].payload.rawInputValue, literal);
});

test("failed durable batch discards new inline sources; committed same-batch references survive reopen", async t => {
  const f = await resource(t), committed = storeOwner.selectHeldEventStoreDurablePrefix(f.store);
  const original = fs.fsyncSync; let calls = 0;
  fs.fsyncSync = descriptor => { if (++calls === 1) throw Error("injected body-batch fsync failure"); return original(descriptor); };
  syncBuiltinESMExports();
  try {
    assert.throws(() => storeOwner.admitRuntimeEventBatch(f.store,
      [() => basis(input, "failed-first"), () => basis(input, "failed-second")]), /injected body-batch/);
  } finally { fs.fsyncSync = original; syncBuiltinESMExports(); }
  assert.deepEqual(f.store.readAll(), []); assert.equal((await readFile(f.eventLogPath)).length,0);
  assert.equal(storeOwner.selectHeldEventStoreDurablePrefix(f.store), committed);
  storeOwner.admitRuntimeEventBatch(f.store, [() => basis(input, "first-committed"), () => basis(input, "second-committed")]);
  const rows = decodeRows(await readFile(f.eventLogPath));
  assert.equal(rows[0].kind, "basis_admitted");
  assert.equal(rows[1].bodyReference.sourceEventRef, rows[0].eventId);
  const closed = f.store.projectReopenAuthorityAndClose(), reopened = storeOwner.reopenEventStore(closed.reopenAuthority);
  assert.equal(reopened.kind, "reopened_event_store_context");
  reopened.store.closeDurableLog();
});

test("large duplicate Result bodies and complete replay hashing fit a constrained heap", async t => {
  const f = await resource(t), seedPath = process.env.ABI5_MEMORY_SEED_PATH ?? "";
  // The default is a portable synthetic payload. Readiness may supply an exact
  // pinned historic parent value as data; neither lane imports native credit.
  const script = `
    import assert from 'node:assert/strict';
    import {readFileSync} from 'node:fs';
    import * as storeOwner from './build/code/src/abg/event_store.js';
    import {selectValidatedRuntimeEventPrefix} from './build/code/src/abg/event_prefix.js';
    import {replayValidatedRuntimeEventPrefix} from './build/code/src/abg/replay.js';
    import {canonicalJson} from './build/code/src/shared/canonical_json.js';
    import {sha256Canonical,sha256Bytes} from './build/code/src/shared/digests.js';
    import {isDeeplyFrozen} from './build/code/src/shared/immutable.js';
    const time=${JSON.stringify(time)};
    const envelope=${envelope.toString()};
    const result=${result.toString()};
    const [path,seedPath]=process.argv.slice(1);
    const value=seedPath ? JSON.parse(readFileSync(seedPath,'utf8')) : {
      kind:'body_fixture_output', original:{outcome:'full original remains unresolved'},
      observations:Array.from({length:21},(_,i)=>({producer:'producer://fixture/'+i,
        text:('exact retained diagnostic '+i+' é𝄞; ').repeat(1800)})), gaps:['unresolved original'],
    };
    const valueBytes=Buffer.byteLength(canonicalJson(value)), valueDigest=sha256Canonical(value);
    assert.equal(valueDigest,sha256Bytes(canonicalJson(value)),'historic text/hash byte compatibility');
    assert.ok(valueBytes>1000000);
    const acquired=storeOwner.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path});
    assert.ok(acquired.store);
    try {
      const copies=96;
      result(acquired.store,'first-inline',value);
      for(let i=0;i<copies;i++) {
        const supplied=structuredClone(value);
        const admitted=result(acquired.store,'alias-'+i,supplied);
        supplied.kind='changed caller value';
        assert.equal(admitted.payload.valueDigest,valueDigest);
        assert.equal(admitted.payload.value.kind,value.kind);
        assert.ok(isDeeplyFrozen(admitted));
      }
      const events=acquired.store.readAll(), values=events.filter(e=>e.kind==='c_call_result_admitted');
      assert.equal(values.length,copies+1);
      assert.equal(new Set(values.map(e=>e.payload.resultRef)).size,copies+1);
      const bytes=readFileSync(path), cold=storeOwner.validateHistoricalEvents(bytes);
      assert.deepEqual(cold.map(e=>[e.eventId,e.payloadDigest]),events.map(e=>[e.eventId,e.payloadDigest]));
      const state=replayValidatedRuntimeEventPrefix(selectValidatedRuntimeEventPrefix(events));
      const reconstructed=replayValidatedRuntimeEventPrefix(selectValidatedRuntimeEventPrefix(cold));
      assert.equal(state.cCalls.length,copies+1);
      assert.equal(sha256Canonical(state),sha256Canonical(reconstructed));
      assert.equal(storeOwner.runtimeEventPhysicalPrefix(events).digest,sha256Bytes(bytes));
      const memory=process.memoryUsage();
      console.log(JSON.stringify({seed:seedPath?'pinned-authentic-parent-value':'portable-synthetic',
        copies,valueBytes,logicalBodyBytes:valueBytes*(copies+1),physicalBytes:bytes.length,
        valueDigest,replayDigest:state.replayDigest,completeStateDigest:sha256Canonical(state),
        heapUsed:memory.heapUsed,rss:memory.rss,maxRSSKiB:process.resourceUsage().maxRSS,
        heapLimitMiB:128,allDistinctAdmissions:true,callerIsolation:true,coldReplayEqual:true,noNativeCredit:true}));
    } finally {acquired.store.closeDurableLog();}
  `;
  const observed = JSON.parse(execFileSync(process.execPath,
    ["--max-old-space-size=128", "--input-type=module", "-e", script, join(f.dir, "memory-events.jsonl"), seedPath],
    {cwd: new URL("../..", import.meta.url), encoding: "utf8", timeout: 90000, maxBuffer: 1048576}));
  assert.equal(observed.copies, 96); assert.equal(observed.coldReplayEqual, true);
  assert.ok(observed.logicalBodyBytes > 97000000);
  assert.ok(observed.physicalBytes < observed.logicalBodyBytes / 4);
  t.diagnostic(JSON.stringify(observed));
});
