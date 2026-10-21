import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const tenant = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reader = process.env.ABI5_STEEL_REPLAY_READER_ROOT ?? tenant;
const abg = await import(pathToFileURL(path.join(reader, "build/code/src/abg/index.js")));
const { sha256Canonical } = await import(pathToFileURL(path.join(reader, "build/code/src/shared/digests.js")));
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const freeze = value => {
  if (value !== null && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

// Source-only regression over the selected installed imports. No generated
// package or retained journal is changed by observing a candidate replay owner.
async function selectedReplayOwner() {
  const source = process.env.ABI5_STEEL_REPLAY_CANDIDATE_SOURCE;
  if (!source) return abg;
  const [{ SourceTextModule, SyntheticModule }, { default: ts }] = await Promise.all([
    import("node:vm"), import("typescript"),
  ]);
  const file = path.join(reader, "build/code/src/abg/replay.js");
  const compiled = ts.transpileModule(await readFile(source, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  const module = new SourceTextModule(compiled, { identifier: file,
    initializeImportMeta(meta) { meta.url = pathToFileURL(file).href; } });
  const links = new Map();
  await module.link(async specifier => {
    if (links.has(specifier)) return links.get(specifier);
    const actual = await import(specifier.startsWith(".")
      ? pathToFileURL(path.resolve(path.dirname(file), specifier)).href : specifier);
    const linked = new SyntheticModule(Object.keys(actual), function () {
      for (const [key, value] of Object.entries(actual)) this.setExport(key, value);
    });
    links.set(specifier, linked);
    return linked;
  });
  await module.evaluate();
  return module.namespace;
}

test("external source replay uses the authenticated atomic admission entry cut", async t => {
  const statePath = process.env.ABI5_STEEL_SOURCE_REPLAY_STATE;
  if (!statePath) {
    t.skip("requires an explicit retained source-bound continuation; no live invocation");
    return;
  }
  const state = JSON.parse(await readFile(statePath, "utf8"));
  const events = abg.readRuntimeEventsAtDurablePrefix(state.genuineClose.prefix);
  const prefix = abg.selectValidatedRuntimeEventPrefix(events);
  const ep = await import(pathToFileURL(path.join(reader, "build/code/src/abg/event_prefix.js")));
  const owner = await selectedReplayOwner();
  const admissionEvent = events.find(row => row.kind === "invocation_admitted" &&
    row.payload.invocationAdmissionRef === state.invocationAdmission.ref);
  assert.ok(admissionEvent);
  const invocation = abg.rehydrateInvocationAdmissionAtPrefix(
    ep.validatedRuntimeEventPrefixThroughEvent(prefix, admissionEvent.eventId), state.invocationAdmission.ref);
  assert.equal(invocation?.admissionEventRef, admissionEvent.eventId);
  const asserted = admissionEvent.payload.sourceResultBasis;
  const sourceInput = { publicAuthorityDigest: asserted.publicAuthorityDigest,
    runtimeInvocationRef: asserted.sourceInvocationRef, invocationAdmissionRef: asserted.sourceInvocationAdmissionRef,
    runId: asserted.sourceRunId, resultRef: asserted.sourceResultRef };
  const entry = ep.validatedRuntimeEventPrefixBeforeEvent(prefix, invocation.publicOperationEventRef);
  const insideAdmission = ep.validatedRuntimeEventPrefixBeforeEvent(prefix, admissionEvent.eventId);
  assert.deepEqual(abg.deriveInvocationSourceResultBasisAtPrefix(entry, sourceInput), asserted);
  assert.notEqual(abg.deriveInvocationSourceResultBasisAtPrefix(insideAdmission, sourceInput).sourceReplayDigest,
    asserted.sourceReplayDigest, "the native liveness read must still identify its actual observation prefix");
  const runId = state.diagnosticTargetRun;
  const local = abg.selectValidatedRuntimeEventPrefix(events, { runId });
  const localRows = ep.runtimeEventsFromValidatedPrefix(local);
  const projection = owner.projectRunSemanticReplayProjection(prefix, runId, state.genuineClose.prefix);
  const sourceFact = projection.ownerFacts.find(row => row.owner === "invocation_source_result");
  assert.deepEqual(sourceFact.sourceResultBasis, asserted);
  assert.equal(projection.runtimeStatus, abg.replayValidatedRuntimeEventPrefix(local, prefix).runtimeStatus);
  assert.deepEqual(projection.physicalCoordinates.events.map(row => row.eventId), localRows.map(row => row.eventId));
  assert.equal(localRows.some(row => row.eventId === asserted.sourceResultAdmissionEventRef), false);
  assert.equal(projection.eventAtoms.some(row => row.runId === asserted.sourceRunId), false);
  const cold = abg.selectValidatedRuntimeEventPrefix(freeze(JSON.parse(JSON.stringify(events))));
  assert.deepEqual(owner.projectRunSemanticReplayProjection(cold, runId, state.genuineClose.prefix), projection);

  await t.test("a mismatched source basis still refuses", () => {
    const changed = structuredClone(events);
    const basis = changed.find(row => row.eventId === admissionEvent.eventId).payload.sourceResultBasis;
    basis.sourceGraphCallId = "graph-call://abiogenesis/crossed-source";
    const { kind, schemaVersion, basisRef, basisDigest, ...body } = basis;
    void kind; void schemaVersion; void basisRef; void basisDigest;
    basis.basisDigest = sha256Canonical(body);
    basis.basisRef = `invocation-source-result://abiogenesis/${basis.basisDigest.slice(7)}`;
    assert.equal(abg.isInvocationSourceResultBasis(basis), true);
    assert.throws(() => owner.projectRunSemanticReplayProjection(
      abg.selectValidatedRuntimeEventPrefix(freeze(changed)), runId), /source-result basis/u);
  });
  t.diagnostic(JSON.stringify({ runId, runtimeStatus: projection.runtimeStatus,
    sourceRunId: asserted.sourceRunId, sourceReplayDigest: asserted.sourceReplayDigest,
    eventCount: events.length, localEventCount: projection.eventCount,
    admissionEntryEventRef: invocation.publicOperationEventRef,
    sourceFactConserved: true, coldEquivalent: true,
    scope: "pure owner projection over genuine closed events; no new admission or native execution" }));
});

test("retained source-bound C2 replay preserves external owner facts and local Run scope", async t => {
  const attempt = process.env.ABI5_STEEL_C2_ATTEMPT_PATH;
  if (!attempt) {
    t.skip("requires the explicit retained C2 attempt; no live invocation is performed");
    return;
  }
  const eventPath = path.join(attempt, "abi-authority/events/runtime.events.jsonl");
  const bytes = await readFile(eventPath);
  const events = freeze(bytes.toString("utf8").trimEnd().split("\n").map(JSON.parse));
  assert.equal(events.length, 1486);
  const c1Receipt = JSON.parse(await readFile(path.join(attempt, "c1-construction-definition-receipt.json"), "utf8"));
  const c1Run = c1Receipt.ownerOutput.value.run.ref;
  const c2Run = "run://abiogenesis/ebadfcdee5815e6e1623ec8f23d156ecf65a5f79821e5e5c22aa1d4cf2b3be49";
  const prefix = abg.selectValidatedRuntimeEventPrefix(events);
  const localPrefix = abg.selectValidatedRuntimeEventPrefix(events, { runId: c2Run });
  const localEvents = localPrefix.events;
  const invocationEvent = localEvents.find(row => row.kind === "invocation_admitted");
  const asserted = invocationEvent.payload.sourceResultBasis;
  assert.equal(abg.isInvocationSourceResultBasis(asserted), true);
  const sourceInput = {
    publicAuthorityDigest: asserted.publicAuthorityDigest,
    runtimeInvocationRef: asserted.sourceInvocationRef,
    invocationAdmissionRef: asserted.sourceInvocationAdmissionRef,
    runId: asserted.sourceRunId,
    resultRef: asserted.sourceResultRef,
  };
  const source = abg.deriveInvocationSourceResultBasisAtPrefix(prefix, sourceInput);
  assert.deepEqual(source, asserted);
  assert.equal(source.sourceRunId, c1Run);
  assert.equal(source.sourceGraphFunctionRef, "graph-function://abiogenesis/worksite/construction@5");
  assert.equal(source.sourceResultValue.kind, "worksite_construction_result");
  const sourceInputValue = events.find(row => row.kind === "basis_admitted" &&
    row.payload.invocationAdmissionRef === source.sourceInvocationAdmissionRef &&
    row.payload.parentExecutionBasisRef === null).payload.rawInputValue;
  const targetBasis = localEvents.find(row => row.kind === "basis_admitted");
  assert.deepEqual(sourceInputValue.workspaceAuthorityBasis, targetBasis.payload.rawInputValue.workspaceAuthorityBasis);
  assert.deepEqual(sourceInputValue.workspaceBinding, targetBasis.payload.rawInputValue.workspaceBinding);
  assert.deepEqual(source.sourceResultValue, targetBasis.payload.rawInputValue.sourceConstructionResult);

  const projection = abg.projectRunSemanticReplayProjection(prefix, c2Run);
  assert.equal(projection.runtimeStatus, "failed");
  assert.equal(projection.lifecycle.runStoppedDisposition, "failed");
  assert.equal(projection.eventCount, localEvents.length);
  assert.deepEqual(projection.physicalCoordinates.events.map(row => row.eventId), localEvents.map(row => row.eventId));
  const atoms = new Set(projection.eventAtoms.map(row => row.atomRef));
  assert.ok(projection.relations.every(row => atoms.has(row.sourceAtom) && atoms.has(row.targetAtom)));
  const sourceFact = projection.ownerFacts.find(row => row.owner === "invocation_source_result");
  assert.ok(atoms.has(sourceFact.ownerAtom));
  assert.deepEqual(sourceFact.sourceResultBasis, source);
  assert.equal(localEvents.some(row => row.eventId === source.sourceResultAdmissionEventRef), false);
  assert.equal(localEvents.some(row => row.eventId === source.sourceResultJudgmentEventRef), false);
  assert.equal(projection.eventAtoms.some(row => row.runId === c1Run), false);
  assert.equal(projection.holdsAt.some(row => typeof row === "string" && row.includes(c1Run)), false);
  const runtime = abg.replayValidatedRuntimeEventPrefix(localPrefix, prefix);
  assert.equal(runtime.cCalls[0].resultClass, "failure");
  assert.equal(runtime.cCalls[0].resultValue.failureClass, "transport_identity_mismatch");

  await t.test("successful source relation is retained before the target failure", () => {
    const leafOpened = localEvents.find(row => row.kind === "c_call_fibre_selected");
    const beforeFailure = abg.selectValidatedRuntimeEventPrefix(freeze(events.slice(0, leafOpened.admissionOrdinal)));
    const active = abg.projectRunSemanticReplayProjection(beforeFailure, c2Run);
    assert.equal(active.runtimeStatus, "active");
    assert.deepEqual(active.ownerFacts.find(row => row.owner === "invocation_source_result"), sourceFact);
    const sourceReplay = abg.replayValidatedRuntimeEventPrefix(
      abg.selectValidatedRuntimeEventPrefix(events, { runId: c1Run }), prefix);
    assert.equal(sourceReplay.runtimeStatus, "closed");
    assert.equal(sourceReplay.cCalls.find(row => row.resultRef === source.sourceResultRef).resultClass, "success");
  });

  const refused = [];
  await t.test("missing and crossed source coordinates refuse without becoming literals", () => {
    for (const [field, value] of [
      ["sourceResultAdmissionEventRef", "event://abiogenesis/not-admitted"],
      ["sourceResultAdmissionEventRef", source.sourceResultJudgmentEventRef],
      ["sourceResultJudgmentEventRef", source.sourceResultAdmissionEventRef],
      ["sourceGraphCallId", "graph-call://abiogenesis/crossed-source"],
      ["sourceRunId", c2Run],
      ["workspaceBindingDigest", `sha256:${"0".repeat(64)}`],
    ]) {
      // Deliberately inconsistent diagnostic copies; never admitted or written
      // into the original store, and never claimed as successful runtime proof.
      const changed = structuredClone(events);
      const altered = changed[invocationEvent.admissionOrdinal - 1].payload.sourceResultBasis;
      altered[field] = value;
      const { kind, schemaVersion, basisRef, basisDigest, ...body } = altered;
      void kind; void schemaVersion; void basisRef; void basisDigest;
      altered.basisDigest = sha256Canonical(body);
      altered.basisRef = `invocation-source-result://abiogenesis/${altered.basisDigest.slice(7)}`;
      assert.equal(abg.isInvocationSourceResultBasis(altered), true);
      assert.throws(() => abg.projectRunSemanticReplayProjection(
        abg.selectValidatedRuntimeEventPrefix(freeze(changed)), c2Run), /source-result basis/u);
      refused.push(field + ":" + value);
    }
  });

  await t.test("unrelated local event-reference paths still reject another Run", () => {
    const changed = structuredClone(events);
    const actor = changed.find(row => row.kind === "actor_invocation_closed" && row.runId === c2Run);
    actor.payload.consumedArtifactEventRef = source.sourceResultAdmissionEventRef;
    assert.throws(() => abg.projectRunSemanticReplayProjection(
      abg.selectValidatedRuntimeEventPrefix(freeze(changed)), c2Run), /out-of-scope event reference/u);
  });

  assert.equal(sha256(await readFile(eventPath)), sha256(bytes));
  if (process.env.ABI5_STEEL_REPLAY_EVIDENCE_PATH) {
    await writeFile(process.env.ABI5_STEEL_REPLAY_EVIDENCE_PATH, JSON.stringify({
      kind: "steel_basic_cli_source_result_replay_proof", reader, eventPath,
      eventSha256: sha256(bytes), eventCount: events.length, runId: c2Run,
      runtimeStatus: projection.runtimeStatus, sourceFact,
      localEventCount: projection.eventCount, viewDigest: projection.viewDigest,
      physicalCoordinates: projection.physicalCoordinates, refused,
      limits: "Pure projection over retained immutable bytes; no handoff, live authority, new C2 success, effect or model call is claimed.",
    }, null, 2) + "\n", { flag: "wx" });
  }
});
