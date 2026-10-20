import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { createWorkerTransportOutputObserver, runWorkerTransport } from "../../build/code/src/abg/worker_transport.js";
import { constructKnownWorkerTransportContract } from "../../build/code/src/abg/transport_contracts.js";
import { admitNonEmptyRuntimeEventTransactionAtDurablePrefix, admitRuntimeEvent,
  readRuntimeEventsAtDurablePrefix, reopenEventStore } from "../../build/code/src/abg/event_store.js";
import { selectValidatedRuntimeEventPrefix } from "../../build/code/src/abg/event_prefix.js";
import { admitRuntimeActivityProbe, captureNativeFrameBoundary, observeNativeFrameLiveness,
  projectActorLivenessContext } from "../../build/code/src/abg/runtime_liveness.js";
import { sha256Bytes, sha256Canonical } from "../../build/code/src/shared/digests.js";

const root = resolve(import.meta.dirname, "../..");
const delay = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

async function exercise({ bytes = 512 * 1024, letter = "a", slowMs = 0, mode = "complete",
  producerDrainMs = 150, observe = () => {} } = {}) {
  const archiveRoot = await mkdtemp(join(root, "stream-drain-"));
  const count = bytes / Buffer.byteLength(letter);
  const expected = JSON.stringify({ message: letter.repeat(count) });
  const code = `const fs=require("node:fs");
    const text=JSON.stringify({message:${JSON.stringify(letter)}.repeat(${count})});
    const row=JSON.stringify({type:"result",subtype:"success",result:text})+"\\n";
    const stream=JSON.stringify({type:"system",subtype:"init"})+"\\n"+${mode === "incomplete" ? "row.slice(0,-17)" : "row"};
    const finish=reason=>{fs.writeFileSync(${JSON.stringify(join(archiveRoot, "producer.json"))},
      JSON.stringify({reason,expectedBytes:Buffer.byteLength(stream),queuedBytes:process.stdout.writableLength}));process.exit(0);};
    process.stdout.write(stream,()=>finish("write_callback"));
    ${mode === "finite_drain" ? `setTimeout(()=>finish('drain_deadline'), ${producerDrainMs});` : ""}`;
  let observed = "";
  const ordering = [];
  const result = await runWorkerTransport({
    contract: { ...constructKnownWorkerTransportContract("generic", {
      command: process.execPath, prefixArgs: ["-e", code], environment: {},
    }), parser: "claude_stream_json" },
    prompt: "deterministic transport discriminator; no model",
    lane: "closed_prompt_proof", cwd: root, archiveRoot, label: "drain",
    timeoutMs: 10_000, absoluteTimeoutMs: 30_000, terminationGraceMs: 1_000,
    environment: {}, observer: {
      onStdoutObserved(chunk) { observed += chunk; ordering.push("stdout"); delay(slowMs); observe(chunk); return true; },
      onProcessExited() { ordering.push("exit"); },
    },
  });
  assert.equal(result.stdout, await readFile(result.artifacts.stdout.path, "utf8"));
  assert.equal(observed, result.stdout);
  const producer = JSON.parse(await readFile(join(archiveRoot, "producer.json"), "utf8"));
  console.log(JSON.stringify({ mode, slowMs, producerDrainMs, producer, expectedBytes: Buffer.byteLength(expected),
    actualBytes: Buffer.byteLength(result.stdout), resultBytes: Buffer.byteLength(result.finalOutput),
    failureClass: result.failureClass, ordering, archiveRoot }));
  return { result, expected, producer };
}

test("terminal bytes survive child exit while native observation is slow", async () => {
  const { result, expected } = await exercise({ slowMs: 400 });
  assert.equal(result.status, 0);
  assert.equal(result.finalOutput, expected);
  assert.equal(result.failureClass, null);
});

test("small and large terminal records are exact", async () => {
  for (const bytes of [16, 1024 * 1024]) {
    const { result, expected } = await exercise({ bytes, letter: "α" });
    assert.equal(result.finalOutput, expected);
  }
});

test("finite producer drain with slow observation exposes producer-side truncation", async () => {
  const fast = await exercise({ mode: "finite_drain" });
  assert.equal(fast.result.finalOutput, fast.expected);
  assert.equal(fast.producer.reason, "write_callback");
  const { result, producer } = await exercise({ slowMs: 400, mode: "finite_drain" });
  assert.equal(producer.reason, "drain_deadline");
  assert.ok(producer.queuedBytes > 0);
  assert.equal(producer.expectedBytes, fast.producer.expectedBytes);
  assert.ok(fast.result.stdout.startsWith(result.stdout));
  assert.ok(Buffer.byteLength(result.stdout) < producer.expectedBytes);
  assert.equal(result.status, 0);
  assert.equal(result.finalOutput, "");
  assert.equal(result.failureClass, "no_output");
});

test("retained native durable-prefix validation reproduces blocking consumer pressure", {
  skip: process.env.T287_STREAM_RETAINED_EVENT_LOG === undefined,
}, async () => {
  // Read-only localization of an actual dependency called by the actor's
  // append/probe path. This is NOT a complete native owner/admission test and
  // does not claim to know the original CLI's exact drain deadline.
  const path = process.env.T287_STREAM_RETAINED_EVENT_LOG;
  const bytes = readFileSync(path), stat = statSync(path);
  const last = JSON.parse(bytes.toString("utf8").trim().split("\n").at(-1));
  const body = { kind: "durable_prefix_coordinate", schemaVersion: "5.0.0",
    eventLogRef: pathToFileURL(path).href, prefixLength: bytes.length, prefixDigest: sha256Bytes(bytes),
    storeIdentity: { device: stat.dev, inode: stat.ino, eventContractDigest: last.eventContractDigest } };
  const coordinate = { ...body, coordinateDigest: sha256Canonical(body) };
  const timings = [];
  const fast = await exercise({ mode: "finite_drain" });
  assert.equal(fast.result.finalOutput, fast.expected);
  const slow = await exercise({ mode: "finite_drain", observe() {
    const start = performance.now();
    assert.equal(readRuntimeEventsAtDurablePrefix(coordinate).length, last.admissionOrdinal);
    timings.push(performance.now() - start);
  } });
  assert.equal(slow.producer.reason, "drain_deadline");
  assert.ok(slow.producer.queuedBytes > 0);
  assert.equal(slow.producer.expectedBytes, fast.producer.expectedBytes);
  assert.ok(fast.result.stdout.startsWith(slow.result.stdout));
  assert.equal(slow.result.finalOutput, "");
  assert.equal(slow.result.failureClass, "no_output");
  console.log(JSON.stringify({ dependency: "readRuntimeEventsAtDurablePrefix", coordinate, timings }));
});

test("an incomplete terminal row does not become a result because exit is zero", async () => {
  const { result } = await exercise({ mode: "incomplete" });
  assert.equal(result.status, 0);
  assert.equal(result.finalOutput, "");
  assert.equal(result.failureClass, "no_output");
});

const heldActor = "actor-invocation://abiogenesis/e4be4df1efda30556bea917356d898059ee45f1bd12fd148a8910e030b83e531";
const heldCases = [
  { name: "early", beforeStreamOrdinal: 1, count: 2202, bytes: 17459347,
    digest: "sha256:a4ebad1c899324d666be7417023edc91240024de63d23e32cda9a4eae4ae81fe" },
  { name: "late", beforeStreamOrdinal: 300, count: 2798, bytes: 19290917,
    digest: "sha256:ab311060517e3ef54f894f79f3899c408cf678d74d3b428a53465e7b8b31d702" },
];

async function heldObservation(context, selected) {
  const lines = (await readFile(process.env.T287_STREAM_HELD_EVENT_LOG, "utf8")).trimEnd().split("\n");
  const all = lines.map(JSON.parse);
  const template = all.find(e => e.kind === "actor_process_stdout_observed" &&
    e.payload.actorInvocationRef === heldActor && e.payload.streamOrdinal === selected.beforeStreamOrdinal);
  assert.equal(template.admissionOrdinal - 1, selected.count);
  const bytes = Buffer.from(lines.slice(0, selected.count).join("\n") + "\n");
  assert.equal(bytes.length, selected.bytes); assert.equal(sha256Bytes(bytes), selected.digest);
  const scratch = await mkdtemp(join(root, "held-drain-")), eventLogPath = join(scratch, "events.jsonl");
  await writeFile(eventLogPath, bytes, { flag: "wx" });
  const stat = statSync(eventLogPath);
  const body = { kind: "event_store_reopen_authority", schemaVersion: "5.0.0", eventLogPath,
    device: stat.dev, inode: stat.ino, eventLogDigest: sha256Bytes(bytes), durableByteLength: bytes.length,
    eventContractDigest: template.eventContractDigest };
  const opened = reopenEventStore({ ...body, authorityDigest: sha256Canonical(body) });
  assert.equal(opened.kind, "reopened_event_store_context", JSON.stringify(opened));
  const store = opened.store; context.after(() => store.closeDurableLog());
  let predecessorPrefix = opened.prefix;
  let previousEventRef = all[selected.count - 1].eventId;
  let ordinal = selected.beforeStreamOrdinal - 1;
  const parser = createWorkerTransportOutputObserver(false);
  let progressCount = 0, finalOutput = "";
  const timings = [];
  const lastElapsed = Math.max(0, ...all.slice(0, selected.count).filter(e => e.payload.actorInvocationRef === heldActor)
    .map(e => e.payload.observation?.elapsedMs ?? 0));
  const clockStart = performance.now();
  // Disclosed private historical-prefix fixture, not a resumed LIVE02 actor.
  // The monotonic test clock extends the frozen counter only to exercise the
  // unchanged probe owner's ordering relation. A cold frame correctly has no
  // original physical frame clock and cannot claim fresh frame progress.
  return { timings, scratch, store, observe(chunk) {
    const started = performance.now(), sampled = lastElapsed + started - clockStart;
    const { eventId: _id, admissionOrdinal: _ordinal, payloadDigest: _digest,
      eventContractDigest: _profile, ...candidate } = template;
    const admission = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => {
      const boundary = captureNativeFrameBoundary(store);
      const event = admitRuntimeEvent(store, { ...candidate, eventTime: new Date().toISOString(),
        causationEventRefs: [previousEventRef], payload: { actorInvocationRef: heldActor,
          processRef: template.payload.processRef, streamOrdinal: ++ordinal,
          byteLength: Buffer.byteLength(chunk), chunkDigest: sha256Canonical(chunk) } });
      observeNativeFrameLiveness(store, event, boundary);
      return event;
    });
    predecessorPrefix = admission.successorPrefix; previousEventRef = admission.value.eventId;
    const observation = parser.observe(chunk);
    const progress = observation.progressEventCount > progressCount;
    const result = observation.finalOutput.length > 0 && observation.finalOutput !== finalOutput;
    progressCount = observation.progressEventCount; finalOutput = observation.finalOutput;
    for (const source of [...(progress || result ? ["stdout"] : []), ...(result ? ["structured_output"] : [])]) {
      const native = projectActorLivenessContext(selectValidatedRuntimeEventPrefix(store.readAll()), heldActor);
      assert.notEqual(native, null);
      const declaration = native.probes.find(p => p.source === source);
      const probe = admitRuntimeActivityProbe({ store, predecessorPrefix, actorInvocationRef: heldActor,
        source, eventTime: admission.value.eventTime, correlationId: template.correlationId,
        observation: { kind: "runtime_probe_observation", schemaVersion: "5.0.0", probeRef: declaration.probeRef,
          scopeDigest: sha256Canonical(native.scope), clockOriginRef: native.binding.clockOriginRef,
          elapsedMs: sampled, underlyingObservationRef: admission.value.eventId,
          underlyingEventRef: admission.value.eventId, sourceDigest: admission.value.payloadDigest,
          sourceRevisionDigest: null, evidenceRefs: [admission.value.eventId], coverage: "observed",
          signal: source === "stdout" ? "activity" : "artifact_pending" } });
      predecessorPrefix = probe.successorPrefix; previousEventRef = probe.value.eventId;
    }
    timings.push(performance.now() - started);
  }, closeAndCheck() {
    const handoff = store.projectReopenAuthorityAndClose();
    const historical = readRuntimeEventsAtDurablePrefix(handoff.prefix);
    assert.deepEqual(historical, store.readAll());
    const reopened = reopenEventStore(handoff.reopenAuthority);
    assert.equal(reopened.kind, "reopened_event_store_context");
    assert.deepEqual(reopened.store.readAll(), historical);
    reopened.store.closeDurableLog();
    return handoff;
  } };
}

for (const selected of heldCases) {
  test(`fixed 1000ms producer drains intact through actual held append/probe owners (${selected.name})`, {
    skip: process.env.T287_STREAM_HELD_EVENT_LOG === undefined,
  }, async context => {
    const held = await heldObservation(context, selected);
    const { result, expected, producer } = await exercise({ mode: "finite_drain", producerDrainMs: 1000,
      observe: held.observe });
    const handoff = held.closeAndCheck();
    console.log(JSON.stringify({ case: selected.name, timings: held.timings, scratch: held.scratch,
      successorPrefix: handoff.prefix, rawOutputDigest: sha256Bytes(result.finalOutput),
      proofScope: "actual held owners and parser only; synthetic result is not native-contract admitted" }));
    assert.equal(producer.expectedBytes, 524391);
    assert.equal(producer.reason, "write_callback");
    assert.equal(result.artifacts.stdout.byteLength, 524391);
    assert.equal(result.finalOutput, expected);
    assert.equal(result.failureClass, null);
    assert.ok(held.store.readAll().some(e => e.admissionOrdinal > selected.count &&
      e.kind === "runtime_activity_probe_observed" && e.payload.observation.signal === "artifact_pending"));
  });
}

test("actual late held owner path keeps incomplete output unadmitted", {
  skip: process.env.T287_STREAM_HELD_EVENT_LOG === undefined,
}, async context => {
  const held = await heldObservation(context, heldCases[1]);
  const { result } = await exercise({ mode: "incomplete", observe: held.observe });
  held.closeAndCheck();
  assert.equal(result.finalOutput, ""); assert.equal(result.failureClass, "no_output");
});
