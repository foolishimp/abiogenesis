import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SourceTextModule, SyntheticModule } from "node:vm";
import test from "node:test";
import ts from "typescript";

import * as events from "../../build/code/src/abg/event_store.js";
import { projectRuntimeTruthAtDurablePrefix } from "../../build/code/src/abg/replay.js";
import { projectExecutableTraversalCompletion } from "../../build/code/src/hog/traversal_completion.js";
import { sha256Bytes, sha256Canonical } from "../../build/code/src/shared/digests.js";

const root = resolve(import.meta.dirname, "../..");
const fixtureRoot = process.env.ABI5_S02_RECURSION_FIXTURE;
const runId = "run://abiogenesis/5dfe8d2af8f5210fc5d763070ab38620dfc0bcfa5b452b2b6c03300374616a67";

// Use the changed source with the unchanged built owner dependencies. This
// component check neither updates shared build output nor executes a Run.
async function sourceOwner() {
  const relative = "abg/deferred_application";
  const built = join(root, "build/code/src", relative + ".js");
  const source = fs.readFileSync(join(root, "code/src", relative + ".ts"), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  const module = new SourceTextModule(code, { identifier: built });
  await module.link(async specifier => {
    const values = await import(pathToFileURL(resolve(dirname(built), specifier)).href);
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await module.evaluate();
  return module.namespace;
}

function fixture(t) {
  assert.ok(fixtureRoot, "select the frozen S02 continuation-03 evidence carrier");
  const bytes = fs.readFileSync(join(fixtureRoot, "runtime-stop/event-prefix.jsonl"));
  assert.equal(bytes.length, 3856953);
  assert.equal(sha256Bytes(bytes), "sha256:e8147dd35d207590170bea4f4f2018935c6a5c7fc9893cc3f56585e332692667");
  const handoff = JSON.parse(fs.readFileSync(join(fixtureRoot, "episode-01/CONTINUATION-03-STOP.json"), "utf8")).closeHandoff;
  const directory = fs.mkdtempSync(join(os.tmpdir(), "abi5-deferred-application-"));
  const path = join(directory, "events.jsonl");
  fs.writeFileSync(path, bytes, { flag: "wx" });
  const stat = fs.statSync(path);
  const body = { ...handoff.reopenAuthority, eventLogPath: path, device: stat.dev, inode: stat.ino };
  delete body.authorityDigest;
  const acquired = events.reopenEventStore({ ...body, authorityDigest: sha256Canonical(body) });
  assert.equal(acquired.kind, "reopened_event_store_context");
  t.after(() => {
    acquired.store.closeDurableLog();
    assert.equal(sha256Bytes(fs.readFileSync(path)), sha256Bytes(bytes), "projection never appends fixture events");
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const rows = events.readRuntimeEventsAtDurablePrefix(acquired.prefix);
  const run = rows.filter(row => row.runId === runId);
  const one = kind => {
    const selected = run.filter(row => row.kind === kind);
    assert.equal(selected.length, 1, kind);
    return selected[0];
  };
  const judgment = one("c_call_judged");
  const result = one("c_call_result_admitted");
  const cursor = one("traversal_cursor_entered");
  const failure = one("runtime_failure_observed");
  const observations = run.filter(row => row.admissionOrdinal > judgment.admissionOrdinal && row.admissionOrdinal < failure.admissionOrdinal);
  assert.equal(observations.length, 3);
  assert.ok(observations.every(row => row.kind === "runtime_activity_probe_observed" && row.causationEventRefs.includes(judgment.eventId)));
  const coordinates = {
    runId,
    frameId: judgment.frameId,
    sourceCursorRef: cursor.payload.cursorRef,
    cCallRef: judgment.payload.cCallRef,
    resultRef: result.payload.resultRef,
    judgmentRef: judgment.payload.judgmentRef,
  };
  const atJudgment = events.durableRuntimeEventPrefixThroughEvent(acquired.prefix, judgment.eventId);
  const afterObservations = events.durableRuntimeEventPrefixThroughEvent(acquired.prefix, observations.at(-1).eventId);
  return { ...acquired, coordinates, atJudgment, afterObservations, judgment, result, failure, rows };
}

test("deferred restoration preserves the exact native completion prefix including observations after judgment", async t => {
  const f = fixture(t), owner = await sourceOwner();
  const completionAt = prefix => {
    const projected = owner.projectDeferredApplicationAtPrefix(prefix, f.coordinates);
    assert.ok(projected);
    const truth = projectRuntimeTruthAtDurablePrefix(prefix, runId);
    assert.equal(projected.replayState.lastAdmissionOrdinal, truth.replayState.lastAdmissionOrdinal);
    assert.deepEqual(projected.replayState, truth.replayState);
    const values = {
      cCallRef: f.coordinates.cCallRef,
      resultRef: f.coordinates.resultRef,
      judgmentRef: f.coordinates.judgmentRef,
      resultValue: f.result.payload.value,
    };
    const expected = projectExecutableTraversalCompletion("application_ready", truth.replayState, prefix, values);
    const restored = projectExecutableTraversalCompletion("application_ready", projected.replayState, prefix, {
      cCallRef: projected.cCallRef, resultRef: projected.resultRef,
      judgmentRef: projected.judgmentRef, resultValue: projected.resultValue,
    });
    assert.deepEqual(restored, expected, "the unchanged HoG full-completion equality remains exact");
    assert.equal(projected.judgmentAdmissionOrdinal, 437, "producer identity remains at the original judgment");
    assert.equal(projected.judgmentEventRef, f.judgment.eventId);
    return restored;
  };
  const atJudgment = completionAt(f.atJudgment);
  const afterObservations = completionAt(f.afterObservations);
  assert.equal(afterObservations.replayState.lastAdmissionOrdinal, 440);
  assert.notEqual(sha256Canonical(afterObservations), sha256Canonical(atJudgment), "different prefixes do not become interchangeable");
  t.diagnostic("Actual frozen native events; disposable copied-resource ownership is a supplied fixture premise. Real prefix, EC, replay and completion owners; no fresh Run or Public admission proof.");
});

test("deferred restoration refuses another producer and the later failed native scope", async t => {
  const f = fixture(t), owner = await sourceOwner();
  const foreign = f.rows.find(row => row.kind === "c_call_judged" && row.runId !== runId);
  assert.ok(foreign);
  for (const change of [
    { cCallRef: foreign.payload.cCallRef, resultRef: foreign.payload.resultRef, judgmentRef: foreign.payload.judgmentRef },
    { resultRef: foreign.payload.resultRef },
    { judgmentRef: foreign.payload.judgmentRef },
    { frameId: foreign.frameId },
    { sourceCursorRef: "traversal-cursor://abiogenesis/absent" },
  ]) {
    assert.equal(owner.projectDeferredApplicationAtPrefix(f.afterObservations, { ...f.coordinates, ...change }), null);
  }
  assert.equal(owner.projectDeferredApplicationAtPrefix(f.prefix, f.coordinates), null, "failure invalidates the live Run/frame/locus relation");
  const corrupt = { ...f.afterObservations, prefixDigest: sha256Canonical("unrelated bytes") };
  delete corrupt.coordinateDigest;
  corrupt.coordinateDigest = sha256Canonical(corrupt);
  assert.throws(() => owner.projectDeferredApplicationAtPrefix(corrupt, f.coordinates), /bytes differ from coordinate/);
  assert.equal(f.failure.admissionOrdinal, 441);
});
