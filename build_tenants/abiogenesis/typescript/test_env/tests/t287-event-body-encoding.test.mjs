import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdir, mkdtemp, readFile, writeFile, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { syncBuiltinESMExports } from "node:module";
import { execFileSync } from "node:child_process";
import test from "node:test";
import * as storeOwner from "../../build/code/src/abg/event_store.js";
import { persistEventLog } from "../../build/code/src/abg/event_log.js";
import { selectValidatedRuntimeEventPrefix, selectRuntimeEventPrefixFromStore, resolveWorksiteContextBodyAtPrefix,
  reuseWorksiteContextBodiesAtPrefix, worksiteContextBodyAcquisitionsAtPrefix, validatedRuntimeEventPrefixBeforeEvent, indexedRuntimeEvents } from "../../build/code/src/abg/event_prefix.js";
import { replayValidatedRuntimeEventPrefix } from "../../build/code/src/abg/replay.js";
import { projectExactExecutionBasisAtPrefix, governanceContextBodyUse } from "../../build/code/src/abg/invocation_execution_truth.js";
import { governanceContract } from "../../build/code/src/product/default_library_identity.js";
import { canonicalJson, writeCanonicalJson } from "../../build/code/src/shared/canonical_json.js";
import { sha256Canonical, sha256Bytes } from "../../build/code/src/shared/digests.js";
import { isDeeplyFrozen } from "../../build/code/src/shared/immutable.js";
import { constructWorksiteCommandExecutionModulePublication } from '../../build/code/src/gtl/worksite_command_execution.js';
import { WORKSITE_COMMAND_EXECUTION_IDS, ABI5_PRODUCT_ID, ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, RETAINED_GRAPH_INPUT_CONTRACT,
  constructRetainedGraphInput } from '../../build/code/src/product/index.js';
import { rawAdmitValue } from '../../build/code/src/validator/index.js';
import { inlineEventBody, inlineEventBodyValue, inlineEventBodyKey, encodeEventBody, decodeEventBody } from '../../build/code/src/abg/event_body_encoding.js';
import { actorRuntimeProbeSources, constructRuntimeWatchdogPolicy } from '../../build/code/src/abg/runtime_liveness_contracts.js';
import { loadWorksiteOwner, worksiteFixture } from "../support/t287-generic-job-worksite.mjs";

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
function result(store, label, value, runId = "run://body-fixture") {
  const cCallRef = "c-call://body-fixture/" + label;
  const extra = { aggregateType: "c_call", aggregateId: cCallRef, parentAggregateId: "frame://" + label,
    scopeClass: "run", runId, graphCallId: "graph-call://" + label, frameId: "frame://" + label };
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

// Real declared Product material and EventStore admissions. Per-call assembly
// fields are controlled storage premises; this is not native assembly authority
// or installed F_P qualification (the genuine chain proves that separately).
const nativePublication=constructWorksiteCommandExecutionModulePublication({productId:ABI5_PRODUCT_ID,packageName:ABI5_PACKAGE_NAME,
  packageVersion:ABI5_PACKAGE_VERSION,artifactDigest:sha256Canonical('definition-component-artifact'),
  productContentDigest:sha256Canonical('definition-component-content'),productManifestDigest:sha256Canonical('definition-component-manifest')});
const nativeGraphFunction=nativePublication.graphFunctions.find(g=>g.name===WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef);
const nativeDefinitions={publication:nativePublication,assessmentPublication:nativePublication,lifecyclePublication:nativePublication,
  sourcePublication:nativePublication,declarationGraphFunctions:[nativeGraphFunction],graphFunction:nativeGraphFunction};
function nativeBinding(label,definitions=nativeDefinitions){
  const transportBindingRef='transport-binding://definition-component/'+label,cCallRef='c-call://definition-component/'+label;
  const instructionAssembly={kind:'native_instruction_assembly',schemaVersion:'5.0.0',plan:{selected:label},
    envelope:{cCallRef,inputDigest:sha256Canonical(label),predecessorPrefix:{coordinateDigest:sha256Canonical(label)},
      nativeBasis:{...definitions,graph:{materializationRef:'graph://'+label},executionBasis:{rawInputValue:{literal:'\uFEFFΩ😀',label}},
        cursor:{cursorRef:'cursor://'+label},cCall:{cCallRef}},sections:{task:{literal:'\uFEFFΩ😀',label}}},
    request:{prompt:'Exact current task '+label+' \uFEFFΩ😀',responseJsonSchema:{type:'object'}},manifest:{promptDigest:sha256Canonical(label)}};
  // Controlled assembly/storage premise, with the same canonical watchdog and
  // clock/source declaration used by ActorProcess; this does not launch an actor.
  const transportPlanDigest=sha256Canonical(instructionAssembly.plan),attemptDigest=sha256Canonical({cCallRef});
  const livenessBinding={kind:'runtime_liveness_binding',schemaVersion:'5.0.0',
    clockOriginRef:`runtime-clock://abiogenesis/${sha256Canonical({attemptDigest,transportPlanDigest}).slice(7)}`,
    clockKind:'native_monotonic_elapsed',policy:constructRuntimeWatchdogPolicy({startupMs:1000,inactivityMs:1000,
      hardCapMs:2000,terminationGraceMs:100}),sources:actorRuntimeProbeSources('claude_stream_json')};
  return envelope('actor_transport_binding_admitted',{transportBindingRef,transportBindingDigest:sha256Canonical(instructionAssembly),
    cCallRef,instructionAssembly,livenessBinding},{aggregateType:'transport_binding',aggregateId:transportBindingRef,parentAggregateId:cCallRef,
    scopeClass:'run',runId:'run://definition-component',graphCallId:'graph-call://'+label,frameId:'frame://'+label});
}

test('typed native definitions share physical rows while complete per-call assembly bytes and v1 remain exact',async t=>{
  const f=await resource(t);
  storeOwner.admitRuntimeEvent(f.store,basis(nativeDefinitions,'definition-as-user-input'));
  for(const label of ['one','two','three'])storeOwner.admitRuntimeEvent(f.store,nativeBinding(label));
  storeOwner.admitRuntimeEvent(f.store,basis(input,'existing-v1-source'));
  storeOwner.admitRuntimeEvent(f.store,basis(input,'existing-v1-reference'));
  const events=f.store.readAll(),bytes=await readFile(f.eventLogPath),rows=decodeRows(bytes),inline=encode(events);
  const bindings=events.filter(e=>e.kind==='actor_transport_binding_admitted');
  assert.equal(rows.filter(r=>r.codecVersion===2).length,2);assert.equal(rows.filter(r=>r.codecVersion===1).length,1);
  const source=bindings[0].payload.instructionAssembly.envelope.nativeBasis;
  for(const event of bindings.slice(1)){
    const current=event.payload.instructionAssembly.envelope.nativeBasis;
    assert.equal(current.publication,source.publication);assert.equal(current.graphFunction,source.graphFunction);
    assert.notDeepEqual(current.executionBasis,source.executionBasis,'current input is never replaced by definition sharing');
    assert.notDeepEqual(current.cursor,source.cursor);assert.notDeepEqual(current.graph,source.graph);
  }
  assert.equal(Object.hasOwn(rows.find(r=>r.codecVersion===2).event.payload.instructionAssembly.envelope.nativeBasis,'publication'),false);
  const cold=storeOwner.validateHistoricalEvents(bytes),raw=storeOwner.validateHistoricalEvents(inline);
  assert.deepEqual(cold,events);assert.deepEqual(raw,events);assert.equal(sha256Canonical(cold),sha256Canonical(raw));
  const typed=inlineEventBody(bindings[0]);assert.equal(typed.slot,'native_definition_material');
  assert.deepEqual(inlineEventBodyValue(bindings[0],typed),nativeDefinitions);
  assert.notEqual(inlineEventBodyKey(typed),inlineEventBodyKey({...typed,slot:'basis_input'}),'equal user JSON supplies no native definition source');
  assert.throws(()=>inlineEventBodyValue(bindings[1],typed),/differs from its admitted source/);
  const closed=f.store.projectReopenAuthorityAndClose();const historical=await openInlineCopy(t,f.dir,events,closed.reopenAuthority);
  storeOwner.admitRuntimeEvent(historical.store,nativeBinding('after-raw-history'));
  const appended=decodeRows(await readFile(historical.eventLogPath)).at(-1);assert.equal(appended.codecVersion,2);
  assert.equal(appended.bodyReference.sourceEventRef,bindings[0].eventId,'existing raw native bundle is an authenticated source');
  const full=historical.store.readAll();assert.deepEqual(storeOwner.validateHistoricalEvents(await readFile(historical.eventLogPath)),full);
  console.log(JSON.stringify({kind:'native_definition_storage_component',logicalEventCount:events.length,definitionBytes:Buffer.byteLength(canonicalJson(nativeDefinitions)),
    encodedBytes:bytes.length,rawBytes:inline.length,savedBytes:inline.length-bytes.length,rawV1V2AndExactLogicalDigests:true,nativeAdmission:false}));
});

test('native definition references refuse missing, forward, foreign-slot, changed and injected material',async t=>{
  const f=await resource(t);
  storeOwner.admitRuntimeEvent(f.store,basis(nativeDefinitions,'foreign-slot'));
  storeOwner.admitRuntimeEvent(f.store,nativeBinding('source'));
  storeOwner.admitRuntimeEvent(f.store,nativeBinding('reference'));
  const rows=decodeRows(await readFile(f.eventLogPath)),target=rows.findIndex(r=>r.codecVersion===2);
  assert(target>0);
  const changes={
    missing:r=>{r[target].bodyReference.sourceEventRef='event://missing';},
    forward:r=>{r[target].bodyReference.sourceEventRef=r[target].event.eventId;},
    foreignSlot:r=>{r[target].bodyReference={sourceEventRef:r[0].eventId,sourcePayloadDigest:r[0].payloadDigest,
      sourceSlot:'basis_input',bodyDigest:sha256Canonical(nativeDefinitions)};},
    changedDigest:r=>{r[target].bodyReference.bodyDigest=sha256Canonical('changed');},
    changedSource:r=>{r[1].payload.instructionAssembly.envelope.nativeBasis.publication.moduleVersion='changed';},
    injectedDefinition:r=>{r[target].event.payload.instructionAssembly.envelope.nativeBasis.publication=nativePublication;},
    wrongVersion:r=>{r[target].codecVersion=1;},
    unknownVersion:r=>{r[target].codecVersion=3;},
  };
  for(const [name,change]of Object.entries(changes)){const changed=structuredClone(rows);change(changed);
    assert.throws(()=>storeOwner.validateHistoricalEvents(encode(changed)),undefined,name);}
  const changed={...nativeDefinitions,publication:{...nativePublication,moduleVersion:'changed'}};
  storeOwner.admitRuntimeEvent(f.store,nativeBinding('new-definitions',changed));
  const last=decodeRows(await readFile(f.eventLogPath)).at(-1);assert.equal(last.kind,'actor_transport_binding_admitted');
  const native=last.payload.instructionAssembly.envelope.nativeBasis;
  assert.equal(native.publication.moduleVersion,'changed','changed definitions remain their own inline value');
});
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

// Real worksite observation, EventStore Result admission and held-prefix
// carriage. Task/observation values are controlled lower premises at the
// declared native context coordinates; this is not native Work qualification.
async function contextFixture(t, files) {
  const product = await loadWorksiteOwner(), w = await worksiteFixture(product);
  t.after(() => rm(w.scratch, { force: true, recursive: true }));
  const write = async (path, text) => { await mkdir(join(w.canonicalRoot, path, ".."), { recursive: true }); await writeFile(join(w.canonicalRoot, path), text); };
  for (const [path, text] of Object.entries(files)) await write(path, text);
  const observe = async () => {
    const context = await product.observeWorksiteContext({ ...w, readRoots: ["src"], maxFiles: 4096, maxBytes: 64 * 1024 * 1024 });
    assert.equal(context.kind, "worksite_context_observation", JSON.stringify(context)); return context;
  };
  return { product, w, write, observe };
}
const nativeTask = (label, context) => ({ kind: "native_workspace_work_task", schemaVersion: "5.0.0", handoff: label, context });
const fileEntries = context => context.entries.filter(entry => entry.state === "file");
const carriage = context => Object.fromEntries(fileEntries(context).map(e => [e.relativePath, e.encoding === "base64" ? "inline" : e.member.resultRef]));
function inlineOccurrences(events) {
  const counts = new Map();
  const visit = value => {
    if (typeof value !== "object" || value === null) return;
    if (value.kind === "worksite_context_observation") for (const e of value.entries)
      if (e.state === "file" && e.encoding === "base64") counts.set(e.digest, (counts.get(e.digest) ?? 0) + 1);
    for (const child of Object.values(value)) visit(child);
  };
  for (const event of events) if (event.kind === "c_call_result_admitted") visit(event.payload.value);
  return counts;
}

test("native context bodies are born inline once, referenced by unchanged handoffs and refused unless exactly held", async t => {
  const f = await resource(t), text = { "src/a.txt": "alpha ".repeat(4000), "src/b.txt": "beta ".repeat(4000), "src/c.txt": "gamma ".repeat(4000) };
  const { product, w, write, observe } = await contextFixture(t, text), use = { runId: "run://body-fixture" }, original = { ...text };
  const handoff = async label => {
    const observed = await observe(), context = reuseWorksiteContextBodiesAtPrefix(selectRuntimeEventPrefixFromStore(f.store), observed, use);
    assert.ok(product.sameWorksiteContextIdentity(context, observed), "carriage never changes the observed identity");
    assert.ok(product.isWorksiteContextObservation(context) && isDeeplyFrozen(context));
    return { context, event: result(f.store, label, nativeTask(label, context)) };
  };
  const birth = await handoff("birth"), first = await handoff("unchanged-one"), second = await handoff("unchanged-two");
  const R = h => h.event.payload.resultRef, all = r => ({ "src/a.txt": r, "src/b.txt": r, "src/c.txt": r });
  assert.deepEqual(carriage(birth.context), all("inline"), "first bodies are born inline in the admitted Result");
  assert.deepEqual(carriage(first.context), all(R(birth))); assert.deepEqual(carriage(second.context), all(R(birth)));
  text["src/b.txt"] = "changed beta ".repeat(4000); await write("src/b.txt", text["src/b.txt"]);
  const changed = await handoff("changed"), after = await handoff("after-change");
  assert.deepEqual(carriage(changed.context), { ...all(R(birth)), "src/b.txt": "inline" }, "a changed member is first written inline once");
  assert.deepEqual(carriage(after.context), { ...all(R(birth)), "src/b.txt": R(changed) }, "then it becomes referenceable");
  assert.equal(after.context.entries.find(e => e.relativePath === "src/b.txt").member.path.join("/"), "context/entries/" +
    changed.context.entries.findIndex(e => e.relativePath === "src/b.txt"));

  const events = f.store.readAll(), log = await readFile(f.eventLogPath), occurrences = inlineOccurrences(events);
  assert.equal(occurrences.size, 4); assert.ok([...occurrences.values()].every(count => count === 1), "each body version has one semantic occurrence");
  const versions = [...Object.values(text), original["src/b.txt"]].map(body => Buffer.from(body).toString("base64"));
  for (const base64 of versions) assert.equal(log.toString().split(base64).length - 1, 1, "each body version is physically written once");
  const prefix = selectRuntimeEventPrefixFromStore(f.store), acquired = worksiteContextBodyAcquisitionsAtPrefix(prefix);
  assert.equal(acquired, 2, "producer carriage acquires each holder Result once in this prefix lineage");
  for (const h of [first, second, changed, after]) for (const e of fileEntries(h.context)) {
    const read = resolveWorksiteContextBodyAtPrefix(prefix, h.context, e.relativePath, use);
    assert.equal(read.kind, "worksite_context_body", JSON.stringify(read));
    assert.equal(read.bytes.toString(), (h === first || h === second ? original : text)[e.relativePath]);
  }
  assert.equal(worksiteContextBodyAcquisitionsAtPrefix(prefix), acquired, "selected reads reuse the established holder acquisitions");

  const causes = new Set(), refuse = (context, path, expected, at = prefix, consumer = use) => {
    const read = resolveWorksiteContextBodyAtPrefix(at, context, path, consumer);
    assert.equal(read.kind, "worksite_context_body_refusal", expected); assert.equal(read.code, expected, read.reason);
    causes.add(read.code);
  };
  const withEntry = (context, path, change) => ({ ...context, entries: context.entries.map(e => e.relativePath === path ? change(structuredClone(e)) : e) });
  const member = (path, change) => withEntry(after.context, path, e => { change(e.member); return e; });
  refuse(member("src/a.txt", m => { delete m.resultDigest; }), "src/a.txt", "malformed");
  refuse(withEntry(after.context, "src/a.txt", e => ({ ...e, member: "result://unstructured" })), "src/a.txt", "malformed");
  refuse(member("src/a.txt", m => { m.resultRef = "result://body-fixture/never-admitted"; }), "src/a.txt", "pending");
  // The owned immutable cut just before the changed holder's admission.
  const earlier = validatedRuntimeEventPrefixBeforeEvent(prefix, changed.event.eventId);
  assert.equal(typeof changed.event.eventId, "string");
  refuse(after.context, "src/b.txt", "pending", earlier);
  const held = resolveWorksiteContextBodyAtPrefix(earlier, after.context, "src/a.txt", use);
  assert.equal(held.kind, "worksite_context_body", "the earlier cut still holds the birth Result");
  assert.equal(held.bytes.toString(), text["src/a.txt"]);
  refuse(member("src/a.txt", m => { m.resultDigest = sha256Canonical("tampered"); }), "src/a.txt", "tampered");
  refuse(member("src/a.txt", m => { m.path = ["context", "entries", 0]; }), "src/a.txt", "tampered");
  refuse(member("src/a.txt", m => { m.path = ["after", "entries", 1]; }), "src/a.txt", "tampered");
  refuse(withEntry(after.context, "src/b.txt", e => ({ ...e, member: after.context.entries.find(x => x.relativePath === "src/a.txt").member })), "src/b.txt", "tampered");
  refuse(withEntry(after.context, "src/b.txt", e => ({ ...e, member: first.context.entries.find(x => x.relativePath === "src/b.txt").member })), "src/b.txt", "stale");
  refuse({ ...after.context, workspaceBindingDigest: sha256Canonical("foreign-binding") }, "src/a.txt", "foreign");
  refuse(after.context, "src/a.txt", "foreign", prefix, { runId: "run://foreign" });
  refuse(after.context, "src/a.txt", "denied", prefix, { ...use, readable: path => path !== "src/a.txt" });
  refuse(after.context, "outside/a.txt", "denied");
  refuse(after.context, "src/none.txt", "missing");
  refuse(withEntry(birth.context, "src/a.txt", e => ({ ...e, bytes: Buffer.from("forged").toString("base64") })), "src/a.txt", "tampered");

  const foreign = result(f.store, "foreign-holder", nativeTask("foreign", await observe()), "run://foreign");
  const foreignRef = withEntry(after.context, "src/a.txt", e => ({ ...e, member: { resultRef: foreign.payload.resultRef,
    resultDigest: foreign.payload.resultDigest, path: ["context", "entries", e.member.path[2]] } }));
  refuse(foreignRef, "src/a.txt", "foreign", selectRuntimeEventPrefixFromStore(f.store));
  assert.deepEqual([...causes].sort(), ["denied", "foreign", "malformed", "missing", "pending", "stale", "tampered"],
    "every existing resolver refusal cause is executed");
  const unchanged = reuseWorksiteContextBodiesAtPrefix(selectRuntimeEventPrefixFromStore(f.store), await observe(), use);
  assert.deepEqual(carriage(unchanged), carriage(after.context), "another Run's holder never becomes this Run's producer");

  // Cold reconstruction from retained log bytes only; the mutable worksite is gone.
  await rm(join(w.canonicalRoot, "src"), { force: true, recursive: true });
  const cold = selectValidatedRuntimeEventPrefix(storeOwner.validateHistoricalEvents(await readFile(f.eventLogPath)));
  for (const e of fileEntries(after.context)) {
    const read = resolveWorksiteContextBodyAtPrefix(cold, after.context, e.relativePath, use);
    assert.equal(read.kind, "worksite_context_body"); assert.equal(read.bytes.toString(), text[e.relativePath]);
  }
  const logical = events.filter(e => e.kind === "c_call_result_admitted").reduce((n, e) => n + Buffer.byteLength(canonicalJson(e.payload.value)), 0);
  t.diagnostic(JSON.stringify({ kind: "native_context_body_carriage_discriminator", handoffs: 5, bodyVersions: occurrences.size,
    semanticInlineOccurrences: [...occurrences.values()].reduce((a, b) => a + b, 0), holderAcquisitions: acquired,
    logicalResultValueBytes: logical, physicalLogBytes: log.length, nativeAdmission: false }));
});

// Model-free same-Run pending-input discriminator. Real EventStore admission,
// worksite observation and held-prefix carriage. The progressed input is a
// governance-state-shaped Result: it carries no native context body position.
// Its selected native Result (subjectEvidenceRef -> observation row -> admitted
// Result) carries the context whose members name an earlier preparation-shaped
// holder. A pending-execution use stays in this Run, so the unchanged resolver
// authenticates context -> member -> committed holder; no cross-Run relation exists.
test("a pending execution reads its selected native context through the unchanged same-Run resolver only", async t => {
  const f = await resource(t), text = { "src/a.txt": "alpha ".repeat(3000), "src/b.txt": "beta ".repeat(3000) };
  const { w, write, observe } = await contextFixture(t, text), run = "run://body-fixture", other = "run://body-fixture/other";
  const handoff = async (label, runId = run) => {
    const context = reuseWorksiteContextBodiesAtPrefix(selectRuntimeEventPrefixFromStore(f.store), await observe(), { runId });
    return { context, event: result(f.store, label, nativeTask(label, context), runId) };
  };
  const prepare = await handoff("prepare-native"), selected = await handoff("selected-native-work");
  assert.deepEqual(carriage(prepare.context), { "src/a.txt": "inline", "src/b.txt": "inline" }, "the preparation Result is the inline birth");
  assert.deepEqual(carriage(selected.context), { "src/a.txt": prepare.event.payload.resultRef, "src/b.txt": prepare.event.payload.resultRef });
  const sp = selected.event.payload;
  const state = { kind: "governance_work_state", schemaVersion: "5.0.0",
    observations: [{ purpose: "construction", resultRef: sp.resultRef, resultDigest: sp.resultDigest, cCallRef: selected.event.aggregateId }],
    synthesis: { judgment: { subjectEvidenceRef: sp.resultRef } } };
  const progressed = result(f.store, "progressed-state", state);
  const before = f.store.readAll().length;
  // Follow the authenticated selection: state -> observation row -> exact same-Run admitted Result -> its declared context.
  const selectedContext = at => {
    const ref = progressed.payload.value.synthesis.judgment.subjectEvidenceRef;
    const rows = progressed.payload.value.observations.filter(o => o.resultRef === ref);
    assert.equal(rows.length, 1, "one selected observation row");
    const admitted = at.events.filter(e => e.kind === "c_call_result_admitted" && e.runId === progressed.runId &&
      e.payload.resultRef === rows[0].resultRef && e.payload.resultDigest === rows[0].resultDigest && e.aggregateId === rows[0].cCallRef);
    assert.equal(admitted.length, 1, "the selected native Result is admitted in the same Run");
    return admitted[0].payload.value.context;
  };
  const prefix = selectRuntimeEventPrefixFromStore(f.store), context = selectedContext({ events: f.store.readAll() });
  assert.equal(Object.hasOwn(progressed.payload.value, "context"), false, "the progressed state is not a native task");
  const use = { runId: run };
  for (const e of fileEntries(context)) {
    const read = resolveWorksiteContextBodyAtPrefix(prefix, context, e.relativePath, use);
    assert.equal(read.kind, "worksite_context_body", JSON.stringify(read));
    assert.equal(read.bytes.toString(), text[e.relativePath]);
    assert.equal(read.holder.eventRef, prepare.event.eventId, "the earlier preparation Result is the committed holder");
  }
  const causes = new Set(), refuse = (ctx, path, expected, consumer = use, at = prefix) => {
    const read = resolveWorksiteContextBodyAtPrefix(at, ctx, path, consumer);
    assert.equal(read.kind, "worksite_context_body_refusal", expected); assert.equal(read.code, expected, read.reason);
    causes.add(read.code);
  };
  const withEntry = (ctx, path, change) => ({ ...ctx, entries: ctx.entries.map(e => e.relativePath === path ? change(structuredClone(e)) : e) });
  const member = (path, change) => withEntry(context, path, e => { change(e.member); return e; });
  // Another Run has no permission, whatever extra carrier it presents.
  refuse(context, "src/a.txt", "foreign", { runId: other });
  refuse(context, "src/a.txt", "foreign", { runId: other, continuedHolders: { kind: "continued_context_holders", sourceRunId: run, targetRunId: other,
    inputEventRef: progressed.eventId, members: fileEntries(context).map(e => e.member.resultRef) } });
  refuse(member("src/a.txt", m => { delete m.resultDigest; }), "src/a.txt", "malformed");
  refuse(member("src/a.txt", m => { m.resultRef = "result://body-fixture/never-admitted"; }), "src/a.txt", "pending");
  refuse(context, "src/a.txt", "pending", use, validatedRuntimeEventPrefixBeforeEvent(prefix, prepare.event.eventId));
  refuse(member("src/a.txt", m => { m.resultDigest = sha256Canonical("tampered"); }), "src/a.txt", "tampered");
  refuse({ ...context, workspaceBindingDigest: sha256Canonical("foreign-binding") }, "src/a.txt", "foreign");
  refuse(context, "src/a.txt", "denied", { ...use, readable: path => path !== "src/a.txt" });
  refuse(context, "src/none.txt", "missing");
  assert.equal(f.store.readAll().length, before, "resolution and refusals admit no events");
  // A later version of b is held by another Result; the selected context keeps the earlier member.
  text["src/b.txt"] = "changed beta ".repeat(3000); await write("src/b.txt", text["src/b.txt"]);
  const changed = await handoff("changed"), after = await handoff("after-change"), now = selectRuntimeEventPrefixFromStore(f.store);
  assert.equal(after.context.entries.find(e => e.relativePath === "src/b.txt").member.resultRef, changed.event.payload.resultRef);
  refuse(withEntry(after.context, "src/b.txt", e => ({ ...e, member: context.entries.find(x => x.relativePath === "src/b.txt").member })),
    "src/b.txt", "stale", use, now);
  assert.equal(resolveWorksiteContextBodyAtPrefix(now, context, "src/b.txt", use).bytes.toString(), "beta ".repeat(3000),
    "the selected member stays readable after a later change");
  assert.deepEqual([...causes].sort(), ["denied", "foreign", "malformed", "missing", "pending", "stale", "tampered"],
    "every existing resolver refusal cause survives");
  // Producer carriage never shares across Runs: another Run births its own bodies.
  assert.deepEqual(carriage(reuseWorksiteContextBodiesAtPrefix(selectRuntimeEventPrefixFromStore(f.store), await observe(), { runId: other })),
    { "src/a.txt": "inline", "src/b.txt": "inline" });
  // Cold: the same relation is rederived from retained log bytes; the worksite is gone.
  await rm(join(w.canonicalRoot, "src"), { force: true, recursive: true });
  const cold = selectValidatedRuntimeEventPrefix(storeOwner.validateHistoricalEvents(await readFile(f.eventLogPath)));
  const coldContext = selectedContext({ events: storeOwner.validateHistoricalEvents(await readFile(f.eventLogPath)) });
  assert.deepEqual(coldContext, context);
  for (const e of fileEntries(coldContext)) assert.equal(resolveWorksiteContextBodyAtPrefix(cold, coldContext, e.relativePath, use).bytes.toString(),
    e.relativePath === "src/a.txt" ? text["src/a.txt"] : "beta ".repeat(3000));
});

// Model-free component discriminator for retained-source context bodies. Real
// EventStore admission, worksite observation and held-prefix carriage; the
// native Result is a declared-coordinate fixture shape, not installed native
// work. Run A holds the bodies; a consumer in Run B carries the source use that
// its invocation admission would transport. Only A's selected native Result's
// task context declares which A members B may read. The installed A -> B
// integration with real owners is in t287-default-library.test.mjs.
test("an admitted retained-source use reads exactly the selected native Result's task-context members across Runs", async t => {
  const f = await resource(t), text = { "src/a.txt": "alpha ".repeat(3000), "src/b.txt": "beta ".repeat(3000) };
  const { w, write, observe } = await contextFixture(t, text), A = "run://body-fixture/a", B = "run://body-fixture/b";
  const carry = async (use, ctx) => reuseWorksiteContextBodiesAtPrefix(selectRuntimeEventPrefixFromStore(f.store), ctx ?? await observe(), use);
  // A: preparation birth, then one native work Result whose task context carries members of it and births d inline.
  const prepare = result(f.store, "a-prepare", nativeTask("a-prepare", await carry({ runId: A })), A);
  text["src/d.txt"] = "delta ".repeat(3000); await write("src/d.txt", text["src/d.txt"]);
  const raw = await observe(), nativeContext = await carry({ runId: A }, raw);
  const native = result(f.store, "a-native-work", { kind: "native_workspace_work_observation", schemaVersion: "5.0.0",
    task: nativeTask("a-native-work", nativeContext), after: nativeContext }, A);
  // Undeclared A holders: one holds the same a bytes inline, one holds an unselected version of b.
  const duplicate = result(f.store, "a-duplicate", nativeTask("a-duplicate", raw), A);
  text["src/b.txt"] = "unselected beta ".repeat(3000); await write("src/b.txt", text["src/b.txt"]);
  const sibling = result(f.store, "a-sibling", nativeTask("a-sibling", await carry({ runId: A })), A);
  text["src/b.txt"] = "beta ".repeat(3000); await write("src/b.txt", text["src/b.txt"]);
  const P = e => e.payload.resultRef, row = { resultRef: P(native), resultDigest: native.payload.resultDigest, cCallRef: native.aggregateId };
  const at = (event, path) => event.payload.value.context.entries.findIndex(x => x.relativePath === path);
  assert.deepEqual(carriage(nativeContext), { "src/a.txt": P(prepare), "src/b.txt": P(prepare), "src/d.txt": "inline" });
  assert.equal(sibling.payload.value.context.entries[at(sibling, "src/b.txt")].encoding, "base64", "the sibling holds its version inline");
  // The owner transports the source state's observation rows from the admitted invocation; nothing else selects.
  const state = { kind: "governance_work_state", observations: [{ purpose: "construction", ...row }] };
  const invocation = { invocationAdmissionRef: "invocation-admission://b", sourceResultBasis: { sourceResultContractRef: governanceContract("state"), sourceResultValue: state } };
  const use = governanceContextBodyUse(invocation, B);
  assert.deepEqual(use, { runId: B, sourceResults: [row] });
  assert.deepEqual(governanceContextBodyUse({ ...invocation, sourceResultBasis: null }, B), { runId: B }, "fresh input has no source use");
  assert.deepEqual(governanceContextBodyUse(null, B), { runId: B });
  assert.deepEqual(governanceContextBodyUse({ ...invocation, sourceResultBasis: { ...invocation.sourceResultBasis, sourceResultContractRef: "contract://other" } }, B), { runId: B });
  // B carriage: A members exactly as the selected native task context declares them; d's holder is that native Result.
  const consumer = await carry(use), dIndex = nativeContext.entries.findIndex(e => e.relativePath === "src/d.txt");
  assert.deepEqual(carriage(consumer), { "src/a.txt": P(prepare), "src/b.txt": P(prepare), "src/d.txt": P(native) });
  assert.deepEqual(consumer.entries.find(e => e.relativePath === "src/d.txt").member.path, ["task", "context", "entries", dIndex]);
  assert.deepEqual(carriage(await carry({ runId: B })), { "src/a.txt": "inline", "src/b.txt": "inline", "src/d.txt": "inline" },
    "without source use another Run's holder is never carried");
  const consumerEvent = result(f.store, "b-selection", nativeTask("b-selection", consumer), B), prefix = selectRuntimeEventPrefixFromStore(f.store);
  const before = f.store.readAll().length;
  for (const e of fileEntries(consumer)) {
    const read = resolveWorksiteContextBodyAtPrefix(prefix, consumer, e.relativePath, use);
    assert.equal(read.kind, "worksite_context_body", JSON.stringify(read)); assert.equal(read.bytes.toString(), text[e.relativePath]);
    assert.equal(read.holder.eventRef, (e.relativePath === "src/d.txt" ? native : prepare).eventId);
  }
  const causes = new Set(), refuse = (ctx, path, expected, consumerUse = use, atPrefix = prefix) => {
    const read = resolveWorksiteContextBodyAtPrefix(atPrefix, ctx, path, consumerUse);
    assert.equal(read.kind, "worksite_context_body_refusal", expected); assert.equal(read.code, expected, read.reason); causes.add(read.code);
  };
  const withEntry = (ctx, path, change) => ({ ...ctx, entries: ctx.entries.map(e => e.relativePath === path ? change(structuredClone(e)) : e) });
  const member = (path, change) => withEntry(consumer, path, e => { change(e.member); return e; });
  const selection = source => ({ runId: B, sourceResults: [{ resultRef: P(source), resultDigest: source.payload.resultDigest, cCallRef: source.aggregateId }] });
  // No source use, an empty or inexact one, or a holder named directly is no permission.
  refuse(consumer, "src/a.txt", "foreign", { runId: B });
  refuse(consumer, "src/a.txt", "foreign", { runId: B, sourceResults: [] });
  refuse(consumer, "src/a.txt", "foreign", selection(prepare));
  for (const patch of [{ resultDigest: sha256Canonical("other") }, { cCallRef: "c-call://foreign" }, { resultRef: "result://body-fixture/never-admitted" }])
    refuse(consumer, "src/a.txt", "foreign", { runId: B, sourceResults: [{ ...row, ...patch }] });
  // The same bytes or another version from an A holder the selected task context does not declare.
  refuse(member("src/a.txt", m => { Object.assign(m, { resultRef: P(duplicate), resultDigest: duplicate.payload.resultDigest, path: ["context", "entries", at(duplicate, "src/a.txt")] }); }),
    "src/a.txt", "foreign");
  const unselected = sibling.payload.value.context.entries[at(sibling, "src/b.txt")];
  refuse(withEntry(consumer, "src/b.txt", e => ({ ...e, digest: unselected.digest, byteLength: unselected.byteLength,
    member: { resultRef: P(sibling), resultDigest: sibling.payload.resultDigest, path: ["context", "entries", at(sibling, "src/b.txt")] } })), "src/b.txt", "foreign");
  // Every existing resolver guard stays ahead of the relation.
  refuse(member("src/a.txt", m => { m.resultDigest = sha256Canonical("tampered"); }), "src/a.txt", "tampered");
  refuse(member("src/a.txt", m => { m.path = ["context", "entries", 99]; }), "src/a.txt", "tampered");
  refuse(withEntry(consumer, "src/a.txt", e => ({ ...e, digest: sha256Canonical("other version") })), "src/a.txt", "stale");
  refuse({ ...consumer, workspaceBindingDigest: sha256Canonical("foreign-binding") }, "src/a.txt", "foreign");
  refuse(consumer, "src/a.txt", "denied", { ...use, readable: path => path !== "src/a.txt" });
  refuse(consumer, "outside/a.txt", "denied");
  refuse(consumer, "src/none.txt", "missing");
  refuse(consumer, "src/d.txt", "pending", use, validatedRuntimeEventPrefixBeforeEvent(prefix, native.eventId));
  assert.equal(f.store.readAll().length, before, "resolution and refusals admit no events");
  const assessed = result(f.store, "a-assessment", { kind: "native_workspace_work_observation", schemaVersion: "5.0.0",
    task: { ...nativeTask("a-assessment", nativeContext), assessment: { resultContract: "contract://assessment" } }, after: nativeContext }, A);
  refuse(consumer, "src/d.txt", "foreign", selection(assessed), selectRuntimeEventPrefixFromStore(f.store));
  assert.deepEqual([...causes].sort(), ["denied", "foreign", "missing", "pending", "stale", "tampered"]);
  assert.equal(consumerEvent.runId, B);
  // A later B state keeps the immutable permission; once B holds a changed body, B's own holder is carried.
  assert.deepEqual(carriage(await carry(use)), carriage(consumer), "B holds only members, so its later context keeps the A holders");
  text["src/a.txt"] = "changed alpha ".repeat(3000); await write("src/a.txt", text["src/a.txt"]);
  const bBirth = result(f.store, "b-change", nativeTask("b-change", await carry(use)), B);
  assert.deepEqual(carriage(await carry(use)), { "src/a.txt": P(bBirth), "src/b.txt": P(prepare), "src/d.txt": P(native) },
    "changed bytes are born in B and then carried from B");
  // Cold: retained log bytes only; the mutable worksite is gone.
  await rm(join(w.canonicalRoot, "src"), { force: true, recursive: true });
  const cold = selectValidatedRuntimeEventPrefix(storeOwner.validateHistoricalEvents(await readFile(f.eventLogPath)));
  for (const e of fileEntries(consumer)) {
    const read = resolveWorksiteContextBodyAtPrefix(cold, consumer, e.relativePath, use);
    assert.equal(read.kind, "worksite_context_body"); assert.equal(read.holder.resultRef, e.member.resultRef);
    assert.equal(read.bytes.toString(), e.relativePath === "src/a.txt" ? "alpha ".repeat(3000) : text[e.relativePath]);
  }
});

// Fixed model-free workload: 965 context entries (src, 4 directories, 960 files)
// and three changed members across a selector -> native task -> observation ->
// two unchanged handoffs chain at the declared native context coordinates. The
// old side is a structural/serialization projection of the B11 shapes (every
// entry inline; observation.before = task.context), not an executed old runtime.
test("965-member native context carriage is byte-equivalent to the expanded structural baseline without body multiplication", async t => {
  const files = {};
  for (let i = 0; i < 960; i++) files[`src/m${i % 4}/f${String(i).padStart(3, "0")}.txt`] = `member ${i} exact retained source line;\n`.repeat(40 + (i % 50));
  const f = await resource(t), { w, write, observe } = await contextFixture(t, files), use = { runId: "run://body-fixture" };
  const prefix = () => selectRuntimeEventPrefixFromStore(f.store), carry = context => reuseWorksiteContextBodiesAtPrefix(prefix(), context, use);
  const c0 = await observe();
  assert.equal(c0.entries.length, 965); assert.equal(fileEntries(c0).length, 960);
  const selector = result(f.store, "selector", { kind: "framed_synthesis_task", schemaVersion: "5.0.0", context: carry(c0) });
  const task = nativeTask("construction", carry(await observe()));
  const taskResult = result(f.store, "native-task", task);
  const changedPaths = ["src/m0/f000.txt", "src/m1/f481.txt", "src/m3/f959.txt"];
  for (const path of changedPaths) { files[path] = "changed " + files[path]; await write(path, files[path]); }
  const observation = result(f.store, "native-observation", { kind: "native_workspace_work_observation", schemaVersion: "5.0.0",
    task, before: task.context, after: carry(await observe()) });
  const handoffs = [result(f.store, "testing-one", nativeTask("testing-one", carry(await observe()))),
    result(f.store, "testing-two", nativeTask("testing-two", carry(await observe())))];
  const admitted = [selector, taskResult, observation, ...handoffs], values = admitted.map(e => e.payload.value);
  assert.deepEqual(fileEntries(task.context).filter(e => e.encoding === "base64"), [], "the native task carries only selector members");
  assert.deepEqual(fileEntries(observation.payload.value.after).filter(e => e.encoding === "base64").map(e => e.relativePath), changedPaths);
  for (const h of handoffs) {
    const members = fileEntries(h.payload.value.context).map(e => e.member?.resultRef);
    assert.equal(members.filter(r => r === observation.payload.resultRef).length, 3);
    assert.equal(members.filter(r => r === selector.payload.resultRef).length, 957);
  }

  // Exact reconstruction: each compact value expands to its structural baseline.
  const held = prefix(), resolveAll = (at, context) => ({ ...context, entries: context.entries.map(e => {
    if (e.state !== "file" || e.encoding === "base64") return e;
    const read = resolveWorksiteContextBodyAtPrefix(at, context, e.relativePath, use);
    assert.equal(read.kind, "worksite_context_body", JSON.stringify(read));
    const { member: _member, ...facts } = e; return { ...facts, encoding: "base64", bytes: read.bytes.toString("base64") };
  }) });
  const expand = (at, value) => value.kind === "native_workspace_work_observation"
    ? { ...value, task: expand(at, value.task), before: resolveAll(at, value.before), after: resolveAll(at, value.after) }
    : { ...value, context: resolveAll(at, value.context) };
  const baseline = values.map(value => expand(held, value));
  for (const value of baseline) for (const context of value.kind === "native_workspace_work_observation" ? [value.task.context, value.before, value.after] : [value.context])
    assert.ok(fileEntries(context).every(e => e.encoding === "base64"));
  assert.equal(baseline[2].after.entries.find(e => e.relativePath === "src/m1/f481.txt").bytes, Buffer.from(files["src/m1/f481.txt"]).toString("base64"));
  assert.deepEqual(baseline[4].context.entries, baseline[2].after.entries, "unchanged handoff reconstructs the exact after context");
  const bytesOf = list => list.reduce((n, value) => n + Buffer.byteLength(canonicalJson(value)), 0);
  const occurrencesOf = list => [...inlineOccurrences(list.map(value => ({ kind: "c_call_result_admitted", payload: { value } }))).values()].reduce((a, b) => a + b, 0);
  const log = await readFile(f.eventLogPath), acquisitions = worksiteContextBodyAcquisitionsAtPrefix(held);
  const measured = { compact: { serializedValueBytes: bytesOf(values), semanticBodyOccurrences: occurrencesOf(values), physicalLogBytes: log.length },
    baseline: { serializedValueBytes: bytesOf(baseline), semanticBodyOccurrences: occurrencesOf(baseline) } };
  assert.equal(measured.compact.semanticBodyOccurrences, 963, "960 births and 3 changed births");
  assert.equal(measured.baseline.semanticBodyOccurrences, 960 * 7, "B11 shapes carry one full body set per context role");
  assert.ok(measured.compact.serializedValueBytes * 3 < measured.baseline.serializedValueBytes, "metadata repeats; bodies do not");
  assert.equal(acquisitions, 2, "selector and observation holders are each acquired once");

  // Warm: second complete selected read in the same prefix territory.
  const warm = (() => {
    const cpu = process.cpuUsage(), start = performance.now();
    const final = handoffs.at(-1).payload.value.context;
    for (const e of fileEntries(final)) assert.equal(resolveWorksiteContextBodyAtPrefix(held, final, e.relativePath, use).kind, "worksite_context_body");
    const spent = process.cpuUsage(cpu);
    return { wallMs: performance.now() - start, cpuUserUs: spent.user, cpuSystemUs: spent.system, rss: process.memoryUsage().rss,
      acquisitionsAdded: worksiteContextBodyAcquisitionsAtPrefix(held) - acquisitions };
  })();
  assert.equal(warm.acquisitionsAdded, 0);
  // Cold: a fresh Node process reconstructs from retained log bytes only; the mutable worksite is gone.
  await rm(join(w.canonicalRoot, "src"), { force: true, recursive: true });
  const script = `
    import assert from 'node:assert/strict';
    import {readFileSync} from 'node:fs';
    import * as storeOwner from './build/code/src/abg/event_store.js';
    import {selectValidatedRuntimeEventPrefix,resolveWorksiteContextBodyAtPrefix,worksiteContextBodyAcquisitionsAtPrefix} from './build/code/src/abg/event_prefix.js';
    const cpu=process.cpuUsage(),start=performance.now();
    const events=storeOwner.validateHistoricalEvents(readFileSync(process.argv[1])),prefix=selectValidatedRuntimeEventPrefix(events);
    const context=events.at(-1).payload.value.context;let bytes=0;
    for(const e of context.entries)if(e.state==='file'){const read=resolveWorksiteContextBodyAtPrefix(prefix,context,e.relativePath,{runId:'run://body-fixture'});
      assert.equal(read.kind,'worksite_context_body');bytes+=read.bytes.length;}
    const spent=process.cpuUsage(cpu);
    console.log(JSON.stringify({wallMs:performance.now()-start,cpuUserUs:spent.user,cpuSystemUs:spent.system,rss:process.memoryUsage().rss,
      maxRSSKiB:process.resourceUsage().maxRSS,resolvedBytes:bytes,acquisitions:worksiteContextBodyAcquisitionsAtPrefix(prefix)}));`;
  const cold = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", script, f.eventLogPath],
    { cwd: new URL("../..", import.meta.url), encoding: "utf8", timeout: 90000, maxBuffer: 1048576 }));
  assert.equal(cold.resolvedBytes, Object.values(files).reduce((n, text) => n + Buffer.byteLength(text), 0));
  assert.equal(cold.acquisitions, 2);
  t.diagnostic(JSON.stringify({ kind: "native_context_965_member_carriage", entries: 965, files: 960, changed: 3, handoffs: values.length,
    ...measured, holderAcquisitions: acquisitions, warm, cold,
    baselineLabel: "structural/serialization projection of B11 shapes; not an executed old runtime and no old CPU/RSS/wall",
    methodLimits: "single unrepeated local run; OS page cache holds the just-written log for the cold process; cold/warm cover the owner decode/resolve path only, not native Work or C2; no end-to-end speedup claim" }));
});

// RC5 retained-route carriage. Real EventStore stamping, admission, durable
// encoding, rollback and cold decode. Result and route envelopes are controlled
// lower premises in the traversal owner's retained shape (owner constructor and
// raw admission for the bound input); this is not traversal admission authority,
// which m5-installed-graph-edge exercises through an installed candidate.
const retainedContractRef = RETAINED_GRAPH_INPUT_CONTRACT.contractRef;
const retainedEntry = { kind: "data_input", schemaVersion: "5.0.0", subject: "retained entry; ".repeat(64) };
const retainedSource = { kind: "body_fixture_output", schemaVersion: "5.0.0", text: "consumed retained source; ".repeat(2000) };
function route(store, label, source, { runId = "run://body-fixture", causes = [] } = {}) {
  const boundInput = rawAdmitValue(constructRetainedGraphInput(retainedEntry, source), "invocation_input", retainedContractRef);
  assert.equal(boundInput.kind, "raw_admitted_value", JSON.stringify(boundInput));
  const body = { routeKind: "advance", cCallRef: "c-call://body-fixture/" + label, boundInput,
    sourceCursorRef: "traversal-cursor://body-fixture/" + label, targetCursorRef: "traversal-cursor://body-fixture/" + label + "/next" };
  const routeDigest = sha256Canonical(body);
  return storeOwner.admitRuntimeEvent(store, envelope("traversal_route_admitted",
    { routeRef: "traversal-route://body-fixture/" + routeDigest.slice(7), routeDigest, ...body },
    { aggregateType: "frame", aggregateId: "frame://" + label, parentAggregateId: "graph-call://" + label, scopeClass: "run",
      runId, graphCallId: "graph-call://" + label, frameId: "frame://" + label, causationEventRefs: causes }));
}
// The consumed Result is itself already physically referenced (v1 to the child).
function retainedHistory(store, source = retainedSource) {
  const child = result(store, "child", source), parent = result(store, "parent", source);
  return { child, parent, used: route(store, "parent", source, { causes: [parent.eventId] }) };
}
const physicalId = row => (row.kind === "abg_admitted_body_reference_record" ? row.event : row).eventId;
const rowIndex = (rows, event) => rows.findIndex(row => physicalId(row) === event.eventId);
const withoutSource = event => {
  const { source: _source, ...value } = event.payload.boundInput.value;
  return { ...event, payload: { ...event.payload, boundInput: { ...event.payload.boundInput, value } } };
};
function assertRouteNamesResult(rows, used, consumed) {
  const row = rows[rowIndex(rows, used)];
  assert.equal(row.kind, "abg_admitted_body_reference_record"); assert.equal(row.codecVersion, 3);
  assert.deepEqual(row.bodyReference, { sourceEventRef: consumed.eventId, sourcePayloadDigest: consumed.payloadDigest,
    sourceSlot: "c_call_result_value", bodyDigest: sha256Canonical(used.payload.boundInput.value.source) });
  assert.deepEqual(row.event, withoutSource(used), "only the nested retained source is omitted");
  assert.deepEqual(Object.keys(row.event.payload.boundInput.value).sort(), ["entry", "kind", "schemaVersion"]);
}
// The same workload without the v3 form: the route row written inline.
function routeInlineBytes(bytes, rows, used) {
  const row = rows[rowIndex(rows, used)];
  return bytes.length - Buffer.byteLength(canonicalJson(row) + "\n") + Buffer.byteLength(canonicalJson(used) + "\n");
}
async function reopenBytes(t, dir, name, bytes, authority) {
  const eventLogPath = join(dir, name);
  await writeFile(eventLogPath, bytes);
  const info = await stat(eventLogPath), { authorityDigest: _old, ...body } = authority;
  Object.assign(body, { eventLogPath, device: info.dev, inode: info.ino, durableByteLength: bytes.length, eventLogDigest: sha256Bytes(bytes) });
  const reopened = storeOwner.reopenEventStore({ ...body, authorityDigest: sha256Canonical(body) });
  if (reopened.kind === "reopened_event_store_context") t.after(() => reopened.store.closeDurableLog());
  return reopened;
}

test("RC5 retained route names its exact already-referenced Result and reconstructs full, selected and descriptor reads", async t => {
  const f = await resource(t), { child, parent, used } = retainedHistory(f.store);
  const events = f.store.readAll(), bytes = await readFile(f.eventLogPath), rows = decodeRows(bytes);
  assert.equal(rows[rowIndex(rows, child)].kind, "c_call_result_admitted");
  assert.equal(rows[rowIndex(rows, parent)].codecVersion, 1, "the consumed Result is already physically referenced");
  assert.equal(rows[rowIndex(rows, parent)].bodyReference.sourceEventRef, child.eventId);
  assertRouteNamesResult(rows, used, parent);
  assert.deepEqual(used.payload.boundInput.value.source, retainedSource);
  assert.deepEqual(used.causationEventRefs, [parent.eventId]);
  assert.ok(isDeeplyFrozen(events));
  const cold = storeOwner.validateHistoricalEvents(bytes);
  assert.deepEqual(cold, events); assert.deepEqual(storeOwner.validateHistoricalEvents(encode(events)), events);
  // Synthetic routes are storage premises without traversal replay facts; the
  // installed m5 case checks fresh run result/replay over a real retained route.
  assert.equal(sha256Canonical(cold), sha256Canonical(events));
  const coldRoute = cold.find(e => e.eventId === used.eventId), coldParent = cold.find(e => e.eventId === parent.eventId);
  assert.equal(coldRoute.payload.boundInput.value.source, coldParent.payload.value, "full decode restores the acquired Result body");
  const current = storeOwner.selectHeldEventStoreDurablePrefix(f.store);
  const cut = storeOwner.durableRuntimeEventPrefixThroughEvent(current, used.eventId);
  assert.equal(cut.prefixDigest, sha256Bytes(bytes.subarray(0, cut.prefixLength)));
  assert.equal(storeOwner.runtimeEventPhysicalPrefix(events).digest, sha256Bytes(bytes));
  const closed = f.store.projectReopenAuthorityAndClose();
  assert.deepEqual(storeOwner.readRuntimeEventsAtDurablePrefix(JSON.parse(JSON.stringify(cut))), events.slice(0, used.admissionOrdinal));
  const reopened = storeOwner.reopenEventStore(JSON.parse(JSON.stringify(closed.reopenAuthority)));
  assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
  t.after(() => reopened.store.closeDurableLog());
  // Selected read of the route row alone acquires its Result, then that Result's v1 source.
  assert.deepEqual(indexedRuntimeEvents(selectRuntimeEventPrefixFromStore(reopened.store), "id:" + used.eventId), [used]);
  assert.deepEqual(reopened.store.readAll(), events);
  // The reopened owner encodes against a committed Result it must reacquire from bytes.
  const later = result(reopened.store, "after-reopen", retainedSource);
  const laterRoute = route(reopened.store, "after-reopen", retainedSource, { causes: [later.eventId] });
  const after = await readFile(f.eventLogPath), afterRows = decodeRows(after), all = reopened.store.readAll();
  assert.equal(afterRows[rowIndex(afterRows, later)].codecVersion, 1);
  assertRouteNamesResult(afterRows, laterRoute, later);
  assert.deepEqual(storeOwner.validateHistoricalEvents(after), all);
  const fresh = execFileSync(process.execPath, ["--input-type=module", "-e", `
    import {readFileSync} from 'node:fs';
    import {validateHistoricalEvents} from './build/code/src/abg/event_store.js';
    import {sha256Canonical} from './build/code/src/shared/digests.js';
    const events=validateHistoricalEvents(readFileSync(process.argv[1])), route=events.find(e=>e.eventId===process.argv[2]);
    console.log(JSON.stringify({events:sha256Canonical(events),source:sha256Canonical(route.payload.boundInput.value.source)}));
  `, f.eventLogPath, laterRoute.eventId], { cwd: new URL("../..", import.meta.url), encoding: "utf8", timeout: 90000 });
  assert.deepEqual(JSON.parse(fresh), { events: sha256Canonical(all), source: sha256Canonical(retainedSource) });
  const beforeBytes = routeInlineBytes(bytes, rows, used);
  t.diagnostic("RC5_RETAINED_ROUTE_MEASURE " + JSON.stringify({ sample: "component-retained-history", beforeBytes,
    afterBytes: bytes.length, netSavedBytes: beforeBytes - bytes.length, logicalUnchanged: true, logicalEvents: events.length,
    sourceBytes: Buffer.byteLength(canonicalJson(retainedSource)), consumedResultPhysicalForm: "v1_reference" }));
});

test("RC5 retained route distinguishes exact consumed Result membership from same-valued basis and foreign occurrences", async t => {
  const f = await resource(t);
  const sameValuedBasis = storeOwner.admitRuntimeEvent(f.store, basis(retainedSource, "same-valued-basis"));
  const foreignCall = result(f.store, "foreign-call", retainedSource);
  const foreignRun = result(f.store, "parent", retainedSource, "run://foreign-occurrence");
  const parent = result(f.store, "parent", retainedSource);
  const unbacked = route(f.store, "unbacked", retainedSource);
  const used = route(f.store, "parent", retainedSource, { causes: [parent.eventId] });
  const events = f.store.readAll(), bytes = await readFile(f.eventLogPath), rows = decodeRows(bytes);
  assert.equal(foreignRun.aggregateId, parent.aggregateId, "the foreign occurrence carries the same CCall reference");
  assert.equal(rows[rowIndex(rows, parent)].bodyReference.sourceEventRef, sameValuedBasis.eventId,
    "the Result body dependency may be an equal basis through v1");
  assertRouteNamesResult(rows, used, parent);
  assert.equal(rows[rowIndex(rows, unbacked)].kind, "traversal_route_admitted", "equal bodies without the route's own Result stay inline");
  assert.deepEqual(storeOwner.validateHistoricalEvents(bytes), events);
  const closed = f.store.projectReopenAuthorityAndClose(), target = rowIndex(rows, used);
  for (const [name, decoy] of Object.entries({ sameValuedBasis, foreignCall, foreignRun, unbackedRoute: unbacked })) {
    const changed = structuredClone(rows);
    changed[target].bodyReference = { ...changed[target].bodyReference, sourceEventRef: decoy.eventId, sourcePayloadDigest: decoy.payloadDigest };
    assert.throws(() => storeOwner.validateHistoricalEvents(encode(changed)), /exact earlier consumed Result/, name);
    const refused = await reopenBytes(t, f.dir, `decoy-${name}.jsonl`, encode(changed), closed.reopenAuthority);
    assert.equal(refused.code, "invalid_event_history", name); assert.match(refused.message, /exact earlier consumed Result/, name);
  }
});

test("RC5 retained route refuses missing, forward, tampered, mixed and uncommitted sources before exposing history", async t => {
  const f = await resource(t), { child, parent, used } = retainedHistory(f.store);
  const later = storeOwner.admitRuntimeEvent(f.store, basis(input, "after-route"));
  // Storage probe only: the CCall phase owner refuses a second Result for one CCall.
  const laterResult = result(f.store, "parent", retainedSource);
  const committed = await readFile(f.eventLogPath);
  let rolledBack;
  assert.throws(() => storeOwner.admitRuntimeEventTransaction(f.store, () => {
    rolledBack = result(f.store, "uncommitted", retainedSource);
    route(f.store, "uncommitted", retainedSource, { causes: [rolledBack.eventId] });
    throw Error("selected rollback");
  }), /selected rollback/);
  assert.deepEqual(await readFile(f.eventLogPath), committed, "rollback publishes neither Result nor route");
  const unbacked = route(f.store, "uncommitted", retainedSource);
  const events = f.store.readAll(), bytes = await readFile(f.eventLogPath), rows = decodeRows(bytes);
  assert.equal(rows[rowIndex(rows, unbacked)].kind, "traversal_route_admitted", "a rolled-back Result supplies no source");
  assert.deepEqual(storeOwner.validateHistoricalEvents(bytes), events);
  const target = rowIndex(rows, used), resultRow = rowIndex(rows, parent), childRow = rowIndex(rows, child), unbackedRow = rowIndex(rows, unbacked);
  const reference = (sourceEventRef, sourcePayloadDigest) => ({ sourceEventRef, sourcePayloadDigest,
    sourceSlot: "c_call_result_value", bodyDigest: sha256Canonical(retainedSource) });
  const mutations = {
    missing: [r => { r[target].bodyReference.sourceEventRef = "event://missing"; }, /exact earlier consumed Result/],
    self: [r => { r[target].bodyReference = reference(used.eventId, used.payloadDigest); }, /exact earlier consumed Result/],
    forwardResult: [r => { r[target].bodyReference = reference(laterResult.eventId, laterResult.payloadDigest); }, /exact earlier consumed Result/],
    forwardOther: [r => { r[target].bodyReference = reference(later.eventId, later.payloadDigest); }, /exact earlier consumed Result/],
    deletedResult: [r => { r.splice(resultRow, 1); }, /exact earlier consumed Result/],
    childOccurrence: [r => { r[target].bodyReference = reference(child.eventId, child.payloadDigest); }, /exact earlier consumed Result/],
    wrongPayload: [r => { r[target].bodyReference.sourcePayloadDigest = child.payloadDigest; }, /exact earlier consumed Result/],
    wrongSlot: [r => { r[target].bodyReference.sourceSlot = "basis_input"; }, /exact earlier consumed Result/],
    wrongBody: [r => { r[target].bodyReference.bodyDigest = sha256Canonical("changed"); }, /differs from its exact consumed Result/],
    tamperedRouteCall: [r => { r[target].event.payload.cCallRef = child.aggregateId; }, /exact earlier consumed Result/],
    tamperedRouteRun: [r => { r[target].event.runId = "run://foreign-occurrence"; }, /exact earlier consumed Result/],
    tamperedEntry: [r => { r[target].event.payload.boundInput.value.entry.subject = "changed"; }, /inconsistent history/],
    tamperedResultReference: [r => { r[resultRow].bodyReference.bodyDigest = sha256Canonical("changed"); }, /body reference/],
    tamperedSourceBody: [r => { r[childRow].payload.value.text = "changed"; }, /inconsistent history/],
    mixed: [r => { r[target].event.payload.boundInput.value.source = retainedSource; }, /exact earlier consumed Result/],
    v1Route: [r => { r[target].codecVersion = 1; }, /body reference/],
    v3Result: [r => { r[resultRow].codecVersion = 3; }, /exact earlier consumed Result/],
    malformed: [r => { r[target].bodyReference.extra = true; }, /malformed/],
    uncommitted: [r => { r[unbackedRow] = { kind: "abg_admitted_body_reference_record", codecVersion: 3, event: withoutSource(unbacked),
      bodyReference: reference(rolledBack.eventId, rolledBack.payloadDigest) }; }, /exact earlier consumed Result/],
  };
  const closed = f.store.projectReopenAuthorityAndClose();
  for (const [name, [mutate, refusal]] of Object.entries(mutations)) {
    const changed = structuredClone(rows); mutate(changed);
    assert.throws(() => storeOwner.validateHistoricalEvents(encode(changed)), refusal, name);
    const refused = await reopenBytes(t, f.dir, `negative-${name}.jsonl`, encode(changed), closed.reopenAuthority);
    assert.equal(refused.kind, "event_store_reopen_refusal", name); assert.match(refused.message, refusal, name);
  }
});

test("RC5 retained route mixes inline, v1 and v3 rows and keeps small, unequal or unavailable sources inline", async t => {
  const f = await resource(t), { parent, used } = retainedHistory(f.store);
  const small = { kind: "small_source", schemaVersion: "5.0.0", n: 1 };
  const smallResult = result(f.store, "small", small), smallRoute = route(f.store, "small", small, { causes: [smallResult.eventId] });
  const unequalResult = result(f.store, "unequal", retainedSource);
  const unequalRoute = route(f.store, "unequal", { ...retainedSource, text: "unequal retained source; ".repeat(2000) }, { causes: [unequalResult.eventId] });
  const events = f.store.readAll(), bytes = await readFile(f.eventLogPath), rows = decodeRows(bytes);
  assertRouteNamesResult(rows, used, parent);
  assert.equal(rows[rowIndex(rows, smallRoute)].kind, "traversal_route_admitted", "a reference larger than its source stays inline");
  assert.equal(rows[rowIndex(rows, unequalRoute)].kind, "traversal_route_admitted", "a source unequal to the consumed Result stays inline");
  assert.deepEqual(new Set(rows.map(row => row.kind === "abg_admitted_body_reference_record" ? "v" + row.codecVersion : "inline")),
    new Set(["inline", "v1", "v3"]));
  assert.deepEqual(storeOwner.validateHistoricalEvents(bytes), events);
  // A pre-RC5 all-inline history stays readable; a new route may name its physically inline Result.
  const closed = f.store.projectReopenAuthorityAndClose();
  const historical = await openInlineCopy(t, f.dir, events, closed.reopenAuthority);
  assert.deepEqual(historical.store.readAll(), events);
  const appended = route(historical.store, "parent", retainedSource, { causes: [parent.eventId] });
  const after = await readFile(historical.eventLogPath), afterRows = decodeRows(after);
  assert.equal(afterRows[rowIndex(afterRows, parent)].kind, "c_call_result_admitted");
  assertRouteNamesResult(afterRows, appended, parent);
  assert.deepEqual(storeOwner.validateHistoricalEvents(after), historical.store.readAll());
  assert.equal(sha256Canonical(historical.store.readAll().slice(0, events.length)), sha256Canonical(events));
});

test("RC5 retained route publishes nothing on rollback or failed fsync, poisons on failed restoration and keeps committed same-batch sources", async t => {
  const f = await resource(t), child = result(f.store, "child", retainedSource);
  const committed = storeOwner.selectHeldEventStoreDurablePrefix(f.store), before = await readFile(f.eventLogPath), prior = f.store.readAll();
  const pair = label => storeOwner.admitRuntimeEventTransaction(f.store, () => {
    const consumed = result(f.store, label, retainedSource);
    return { consumed, used: route(f.store, label, retainedSource, { causes: [consumed.eventId] }) };
  });
  assert.throws(() => storeOwner.admitRuntimeEventTransaction(f.store, () => {
    const consumed = result(f.store, "rolled-back", retainedSource);
    route(f.store, "rolled-back", retainedSource, { causes: [consumed.eventId] });
    throw Error("selected rollback");
  }), /selected rollback/);
  assert.equal(storeOwner.selectHeldEventStoreDurablePrefix(f.store), committed);
  assert.deepEqual(await readFile(f.eventLogPath), before); assert.deepEqual(f.store.readAll(), prior);
  const original = fs.fsyncSync; let calls = 0;
  fs.fsyncSync = descriptor => { if (++calls === 1) throw Error("injected retained-route fsync failure"); return original(descriptor); };
  syncBuiltinESMExports();
  try { assert.throws(() => pair("failed-fsync"), /injected retained-route fsync failure/); }
  finally { fs.fsyncSync = original; syncBuiltinESMExports(); }
  assert.equal(storeOwner.selectHeldEventStoreDurablePrefix(f.store), committed);
  assert.deepEqual(await readFile(f.eventLogPath), before); assert.deepEqual(f.store.readAll(), prior);
  // One committed transaction: the Result and its route share one durable batch.
  const { consumed, used } = pair("committed");
  const rows = decodeRows(await readFile(f.eventLogPath)), events = f.store.readAll();
  assert.equal(rows[rowIndex(rows, consumed)].bodyReference.sourceEventRef, child.eventId);
  assertRouteNamesResult(rows, used, consumed);
  const closed = f.store.projectReopenAuthorityAndClose(), reopened = storeOwner.reopenEventStore(closed.reopenAuthority);
  assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
  assert.deepEqual(reopened.store.readAll(), events);
  // Failed write fsync and failed restoration poison ownership; no later effect proceeds.
  const good = await readFile(f.eventLogPath);
  fs.fsyncSync = () => { throw Error("injected retained-route restoration failure"); }; syncBuiltinESMExports();
  try {
    assert.throws(() => storeOwner.admitRuntimeEventTransaction(reopened.store, () => {
      const poisoned = result(reopened.store, "poisoned", retainedSource);
      route(reopened.store, "poisoned", retainedSource, { causes: [poisoned.eventId] });
    }), /could not be restored/);
  } finally { fs.fsyncSync = original; syncBuiltinESMExports(); }
  assert.throws(() => route(reopened.store, "after-poison", retainedSource));
  try { reopened.store.closeDurableLog(); } catch { /* poisoned ownership is already released */ }
  assert.deepEqual(await readFile(f.eventLogPath), good, "restored extent holds no partial Result or route");
  assert.deepEqual(storeOwner.validateHistoricalEvents(good), events);
});

test("RC5 retained route measures the captured-route-37961 sample with exact logical reconstruction", async t => {
  const samplePath = process.env.ABG_RC5_ROUTE_SAMPLE_FILE;
  if (samplePath === undefined) { t.skip("ABG_RC5_ROUTE_SAMPLE_FILE names the pinned captured sample"); return; }
  const sample = JSON.parse(await readFile(samplePath, "utf8"));
  assert.equal(sample.kind, "rc5_retained_route_captured_codec_sample");
  const physical = sample.rows.map(row => {
    const line = canonicalJson(row.physical) + "\n";
    assert.equal(Buffer.byteLength(line), row.bytes, "captured row keeps its exact physical length");
    assert.equal(sha256Bytes(line).slice(7), row.physicalLineSha256, "captured row keeps its exact physical bytes");
    return { row, line };
  });
  const [inlineRow, resultRow, routeRow] = physical;
  // Existing v1 decode of the captured inline body and its already-referenced Result.
  const inlineByEvent = new Map(), byId = new Map();
  for (const { row } of [inlineRow, resultRow]) {
    const { event: decoded, physicallyInline } = decodeEventBody(row.physical, inlineByEvent);
    assert.equal(sha256Canonical(decoded.payload), decoded.payloadDigest, "captured logical payload digest");
    if (physicallyInline) inlineByEvent.set(decoded.eventId, inlineEventBody(decoded));
    byId.set(decoded.eventId, decoded);
  }
  const consumed = byId.get(resultRow.row.eventRef), used = routeRow.row.physical;
  assert.equal(resultRow.row.physical.codecVersion, 1, "the sample Result is already physically referenced");
  assert.equal(consumed.payload.resultRef, sample.resultRef); assert.equal(used.payload.cCallRef, consumed.aggregateId);
  // Three-row custody, not an admitted history: the codec sees only these earlier rows.
  const earlier = { envelope: ref => byId.get(ref), event: ref => byId.get(ref),
    cCallEvents: ref => [...byId.values()].filter(e => e.aggregateType === "c_call" && e.aggregateId === ref).map(e => e.eventId) };
  const encoded = encodeEventBody(used, new Map(), new Map(), undefined, earlier), record = JSON.parse(encoded);
  assert.equal(record.codecVersion, 3);
  assert.deepEqual(record.bodyReference, { sourceEventRef: consumed.eventId, sourcePayloadDigest: consumed.payloadDigest,
    sourceSlot: "c_call_result_value", bodyDigest: consumed.payload.valueDigest });
  assert.equal(encoded, canonicalJson(record) + "\n", "encoded record is canonical under the same newline convention");
  const restored = decodeEventBody(record, inlineByEvent, undefined, { envelope: earlier.envelope, event: earlier.event }).event;
  assert.equal(canonicalJson(restored) + "\n", routeRow.line, "restored route equals the captured logical route");
  assert.equal(sha256Canonical(restored.payload), used.payloadDigest);
  assert.equal(sha256Canonical(restored.payload.boundInput.value.source), consumed.payload.valueDigest);
  const beforeBytes = physical.reduce((total, { line }) => total + Buffer.byteLength(line), 0);
  const afterBytes = Buffer.byteLength(inlineRow.line) + Buffer.byteLength(resultRow.line) + Buffer.byteLength(encoded);
  t.diagnostic("RC5_RETAINED_ROUTE_MEASURE " + JSON.stringify({ sample: "captured-route-37961", beforeBytes, afterBytes,
    netSavedBytes: beforeBytes - afterBytes, logicalUnchanged: true, rows: physical.length,
    routeBeforeBytes: Buffer.byteLength(routeRow.line), routeAfterBytes: Buffer.byteLength(encoded),
    grossSourceBytes: sample.grossSourceBytes, sourceStoreRowOrdinals: [37940, 37953, 37961],
    limits: "three captured physical rows only; no complete admitted history, campaign saving or latency claim" }));
});
