import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { Session } from "node:inspector";
import { filePrefix, loadProjectionOwners, sha256 } from "../support/t287-exact-prefix-projection-reuse.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const owners = await loadProjectionOwners(root);
const project = (coordinate) => owners.artifact.projectExactPrefixArtifactTruth(coordinate);
const asCandidate = (event) => {
  const { eventId, admissionOrdinal, payloadDigest, eventContractDigest, ...candidate } = event;
  return candidate;
};
const encode = (events) => Buffer.from(events.map((event) => owners.json.canonicalJson(event)).join("\n") + "\n");
const basis = (event, predecessorPrefix, causationEventRefs = []) => {
  const p = event.payload;
  return { operationId: p.operationId, memberKey: p.memberKey,
    definitionDigest: p.definitionDigest, authorityScopeRef: p.authorityScopeRef,
    authorityScopeDigest: p.authorityScopeDigest, invocationRef: p.invocationRef,
    invocationPayloadDigest: p.invocationPayloadDigest, invocationDigest: p.invocationDigest,
    correlationId: event.correlationId, eventTime: event.eventTime, predecessorPrefix,
    causationEventRefs };
};

// Count real owner calls without replacing validation, derivation or I/O.
async function measuredAdmission(action) {
  const session = new Session();
  session.connect();
  const post = (method, params = {}) => new Promise((resolve, reject) =>
    session.post(method, params, (error, result) => error ? reject(error) : resolve(result)));
  try {
    await post("Profiler.enable");
    await post("Profiler.startPreciseCoverage", { callCount: true, detailed: false });
    const value = action();
    let coverage = await post("Profiler.takePreciseCoverage");
    const calls = (path, name) => coverage.result.filter(row => row.url.endsWith(path))
      .flatMap(row => row.functions).filter(row => row.functionName === name)
      .reduce((sum, row) => sum + row.ranges[0].count, 0);
    const work = {
      artifactRowsPrepared: calls("/abg/artifact_truth.js", "prepare"),
      coldPrefixSelections: calls("/abg/event_prefix.js", "selectColdPrefixFromImmutableSnapshot"),
      calculusEffects: calls("/abg/event_calculus.js", "eventCalculusEffectRefs"),
      completeLockChecks: calls("/product/environment.js", "isResolvedProductLock"),
      graphConstructions: calls("/shared/capability_contracts.js", "constructCapabilityDefinitionGraph"),
    };
    // Work counters are bounded diagnostics, not a permanent algorithm/count
    // acceptance rule. Event, prefix, cold and refusal equality below are the oracle.
    console.log(JSON.stringify({ kind: "artifact_admission_work", work }));
    let consumerWork;
    if (value.kind === "artifact_owner_result" && value.value.kind === "product_install") {
      const truth = value.artifactTruth;
      assert.ok(owners.artifact.runtimePrefixFromArtifactTruth(truth), "append returns the actual owner derivation");
      const row = truth.rows.find(row => row.admissionEventRef === value.admissionEventRef);
      const installed = owners.environment.projectAdmittedProductInstall(truth, row.artifact, row.invocationRef);
      coverage = await post("Profiler.takePreciseCoverage");
      consumerWork = {
        successorConstructions: calls("/abg/artifact_truth.js", "projectValidatedPrefixArtifactTruth"),
        rawProjectionValidation: calls("/abg/artifact_truth.js", "validateExactPrefixArtifactTruthProjection"),
      };

      assert.deepEqual(installed, value.value);
      const copy = structuredClone(truth);
      assert.equal(owners.artifact.runtimePrefixFromArtifactTruth(copy), null);
      assert.deepEqual(owners.environment.projectAdmittedProductInstall(copy, row.artifact, row.invocationRef), installed);
      coverage = await post("Profiler.takePreciseCoverage");
      consumerWork.copiedProjectionValidations = calls("/abg/artifact_truth.js", "validateExactPrefixArtifactTruthProjection");
      const forged = structuredClone(copy); forged.rows[0].artifactDigest = "sha256:" + "0".repeat(64);
      assert.equal(owners.environment.projectAdmittedProductInstall(forged, row.artifact, row.invocationRef), null);
      assert.equal(owners.json.canonicalJson(truth), owners.json.canonicalJson(copy), "owner derivation changes no serialized bytes");
      console.log(JSON.stringify({ kind: "immediate_install_projection_work", consumerWork, rawCopyValidated: true }));
    }
    return { value, work, consumerWork };
  } finally {
    session.disconnect();
  }
}

if (process.argv[2] === "--cold") {
  const input = JSON.parse(await readFile(process.argv[3], "utf8"));
  const expected = JSON.parse(await readFile(input.expectedPath, "utf8"));
  const outcomes = [];
  for (const entry of input.histories) {
    const bytes = await readFile(entry.path);
    const coordinate = await filePrefix(entry.path, bytes, owners);
    const result = project(coordinate);
    if (entry.valid) {
      assert.equal(result.kind, "exact_prefix_artifact_truth_projection", entry.name);
      assert.equal(result.rows.length, expected.length, entry.name);
      for (const row of result.rows) {
        const expectedRow = expected.find((item) => item.artifactRef === row.artifactRef);
        assert.ok(expectedRow, entry.name);
        assert.deepEqual(row.artifact, expectedRow.artifact, entry.name);
        assert.deepEqual(row.resolvedLock, expectedRow.resolvedLock, entry.name);
        assert.equal(row.artifactDigest, expectedRow.artifactDigest, entry.name);
        if (row.operationId === "abg.operation.product.install") {
          const hydrated = owners.environment.projectAdmittedProductInstallByInvocationRef(result, row.invocationRef);
          assert.deepEqual(hydrated.candidate, row.artifact, entry.name);
          assert.deepEqual(hydrated.resolvedLock, row.resolvedLock, entry.name);
          assert.equal(hydrated.install.admissionEventRef, row.admissionEventRef, entry.name);
        }
      }
      const binding = result.rows.find((row) => row.operationId === "abg.operation.workspace.bind");
      assert.equal(owners.environment.projectExactPrefixWorkspaceEnvironment(coordinate, {
        ref: binding.artifactRef, digest: binding.artifactDigest,
      }).kind, "exact_prefix_workspace_environment", entry.name);
      // Read-only projection, including all cold references, writes no bytes.
      assert.deepEqual(await readFile(entry.path), bytes);
    } else {
      assert.equal(result.kind, "exact_prefix_artifact_truth_projection_refusal", entry.name);
    }
    outcomes.push({ name: entry.name, disposition: entry.valid ? "equal" : "refused" });
  }
  const live = JSON.parse(await readFile(input.liveProjectionPath, "utf8"));
  assert.deepEqual(project(await filePrefix(input.livePath, await readFile(input.livePath), owners)), live,
    "fresh-process recovery equals the complete live projection at the same physical prefix");
  process.stdout.write(JSON.stringify({ processId: process.pid, outcomes }));
} else {
  test("T289 owner serialization and cold historical/reference reconstruction preserve exact install truth", async () => {
    const proofRoot = process.env.ABI5_INSTALL_BODY_PROOF_ROOT;
    const historyPath = process.env.ABI5_INSTALL_BODY_HISTORY;
    assert.ok(proofRoot && historyPath && process.env.ABI5_INSTALL_BODY_HISTORY_SHA256,
      "explicit isolated proof territory and digest-bound retained history required");
    await mkdir(proofRoot, { recursive: true });
    const historyBytes = await readFile(historyPath);
    assert.equal(sha256(historyBytes), process.env.ABI5_INSTALL_BODY_HISTORY_SHA256);
    const original = historyBytes.toString().trimEnd().split("\n").slice(0, 3).map(JSON.parse);
    assert.equal(original[0].payload.operationId, "abg.operation.product.install");
    assert.equal(original[1].payload.operationId, "abg.operation.product.install");
    assert.equal(original[2].payload.operationId, "abg.operation.workspace.bind");
    assert.deepEqual(original[0].payload.resolvedLock, original[1].payload.resolvedLock);
    const lock = original[0].payload.resolvedLock;
    const path = join(proofRoot, "owner-produced.jsonl");
    const acquisition = owners.events.createNewEmptyAppendSink({
      kind: "new_empty_append_sink_request", schemaVersion: "5.0.0", eventLogPath: path,
    });
    assert.ok(acquisition.store);
    const { store } = acquisition;
    try {
      const firstAdmission = await measuredAdmission(() => owners.environment.admitProductInstall(store, original[0].payload.artifact,
        basis(original[0], acquisition.prefix), lock));
      const first = firstAdmission.value;
      assert.equal(first.kind, "artifact_owner_result");
      const firstEvent = store.readAll()[0];
      const firstPrefix = owners.prefix.selectValidatedRuntimeEventPrefix(store.readAll());
      const firstTruth = owners.artifact.projectArtifactTruth(firstPrefix);
      const predecessorTruth = project(first.successorPrefix);
      const prepared = owners.events.projectRuntimeEventFromValidatedHistory(store.readAll(), asCandidate(original[1]));
      const duplicate = owners.events.projectRuntimeEventFromValidatedHistory(store.readAll(), asCandidate(original[0]));
      const outcome = action => {
        try { action(); return { accepted: true }; }
        catch (error) { return { error: error.constructor.name, message: error.message }; }
      };
      const deltaCases = [prepared, duplicate,
        Object.freeze({ ...prepared, admissionOrdinal: 3 }),
        Object.freeze({ ...prepared, eventContractDigest: undefined }),
        Object.freeze({ ...prepared, causationEventRefs: Object.freeze(["event://absent"]) }),
      ];
      for (const event of deltaCases) {
        assert.deepEqual(outcome(() => owners.artifact.validateArtifactTruthCandidate(predecessorTruth, event)),
          outcome(() => owners.artifact.projectArtifactTruth(owners.prefix.selectValidatedRuntimeEventPrefix(
            Object.freeze([...store.readAll(), event])))),
          "candidate delta preserves the full-prefix validity/refusal relation");
        assert.strictEqual(owners.artifact.projectArtifactTruth(firstPrefix).artifacts[0], firstTruth.artifacts[0]);
      }
      assert.throws(() => owners.artifact.validateArtifactTruthCandidate(structuredClone(predecessorTruth), prepared),
        /owner-derived predecessor/, "a copied projection is not the established internal value");
      assert.deepEqual(firstEvent.payload.resolvedLock, lock);
      assert.equal(firstEvent.payload.resolvedLock.kind, "resolved_product_lock");
      assert.deepEqual(Object.keys(firstEvent.payload.artifact).sort(),
        ["kind", "schemaVersion", "productId", "installId", "installedRoot"].sort());
      assert.equal(firstEvent.payload.artifact.kind, "product_install_lock_row");
      const goodReference = { kind: "resolved_product_lock_reference", schemaVersion: "5.0.0", admissionEventRef: firstEvent.eventId,
        admissionEventDigest: firstEvent.payloadDigest, lockId: lock.lockId, lockDigest: lock.lockDigest };
      const compact = { kind: "product_install_lock_row", schemaVersion: "5.0.0",
        productId: original[1].payload.artifact.productId,
        installId: original[1].payload.artifact.installId,
        installedRoot: original[1].payload.artifact.installedRoot };
      const mutations = [
        ["missing reference", (m) => { delete m.resolvedLock; }],
        ["malformed reference", (m) => { m.resolvedLock = {}; }],
        ["wrong source event", (m) => { m.resolvedLock.admissionEventRef = "event://absent"; }],
        ["forward source event", (m, c) => { m.resolvedLock.admissionEventRef = original[1].eventId; c[0] = original[1].eventId; }],
        ["wrong source digest", (m) => { m.resolvedLock.admissionEventDigest = "sha256:" + "0".repeat(64); }],
        ["wrong lock identity", (m) => { m.resolvedLock.lockId = "product-lock://absent"; }],
        ["wrong lock digest", (m) => { m.resolvedLock.lockDigest = "sha256:" + "0".repeat(64); }],
        ["mixed inline/reference", (m) => { m.resolvedLock.rows = lock.rows; }],
        ["wrong product row", (m) => { m.artifact.productId = original[0].payload.artifact.productId; }],
        ["wrong candidate identity", (m) => { m.artifact.installId += "/wrong"; }],
        ["wrong candidate content", (m) => { m.artifact.installedRoot += "/wrong"; }],
        ["extra compact field", (m) => { m.artifact.publicContracts = []; }],
      ];
      const negativeHistories = [];
      for (const [name, mutate] of mutations) {
        const metadata = structuredClone({ artifact: compact, resolvedLock: goodReference });
        const causes = [firstEvent.eventId];
        mutate(metadata, causes);
        const before = await readFile(path);
        const result = owners.environment.admitArtifact(store, basis(original[1], first.successorPrefix, causes),
          "abg.operation.product.install", original[1].payload.artifactRef,
          original[1].payload.artifactDigest, metadata);
        assert.equal(result.disposition, "refused", name);
        assert.deepEqual(await readFile(path), before, `${name}: refuses before append`);
        assert.equal(store.readAll().length, 1, name);
        assert.strictEqual(owners.artifact.projectArtifactTruth(firstPrefix).artifacts[0], firstTruth.artifacts[0],
          `${name}: refused candidate preserves the exact predecessor fact`);
        assert.deepEqual(project(first.successorPrefix).rows, first.artifactTruth.rows,
          `${name}: refused candidate leaves the accepted projection unchanged`);
        // Re-sign only the envelope of an explicit mutation probe. These are
        // refusal inputs, not admitted or transplanted runtime evidence.
        const candidate = asCandidate(original[1]);
        candidate.causationEventRefs = causes;
        candidate.payload = { ...candidate.payload, ...metadata, causationEventRefs: causes };
        if (metadata.resolvedLock === undefined) delete candidate.payload.resolvedLock;
        const payloadDigest = owners.digests.sha256Canonical(candidate.payload);
        const eventBody = { ...candidate, eventContractDigest: firstEvent.eventContractDigest,
          payloadDigest, admissionOrdinal: 2 };
        const event = { ...eventBody, eventId: "event://abiogenesis/" + owners.digests.sha256Canonical(eventBody).slice(7) };
        negativeHistories.push({ name, events: [firstEvent, event], valid: false });
      }
      const secondAdmission = await measuredAdmission(() => owners.environment.admitProductInstall(store, original[1].payload.artifact,
        basis(original[1], first.successorPrefix), lock));
      const second = secondAdmission.value;
      assert.equal(second.kind, "artifact_owner_result", JSON.stringify(second));
      const secondEvent = store.readAll()[1];
      assert.deepEqual(secondEvent.payload.resolvedLock, goodReference);
      assert.equal(secondEvent.payload.resolvedLock.kind, "resolved_product_lock_reference");
      assert.deepEqual(secondEvent.causationEventRefs, [firstEvent.eventId]);
      assert.notEqual(secondEvent.eventId, firstEvent.eventId);
      assert.notEqual(secondEvent.payload.artifactRef, firstEvent.payload.artifactRef);
      const beforeBinding = await readFile(path);
      const stale = owners.environment.admitArtifact(store, basis(original[2], first.successorPrefix),
        "abg.operation.workspace.bind", original[2].payload.artifactRef,
        original[2].payload.artifactDigest, { artifact: original[2].payload.artifact,
          workspaceAuthorityBasis: original[2].payload.workspaceAuthorityBasis });
      assert.equal(stale.disposition, "coordinate_refused");
      assert.deepEqual(await readFile(path), beforeBinding);
      const bindingAdmission = await measuredAdmission(() => owners.environment.admitWorkspaceBinding(store, original[2].payload.artifact,
        basis(original[2], second.successorPrefix, [firstEvent.eventId, secondEvent.eventId]),
        original[2].payload.workspaceAuthorityBasis));
      const binding = bindingAdmission.value;
      assert.equal(binding.kind, "artifact_owner_result");
      assert.deepEqual(owners.artifact.projectArtifactTruth(firstPrefix), firstTruth,
        "a successful later binding cannot change an immutable prior prefix");
      const currentTruth = owners.artifact.projectArtifactTruth(owners.prefix.selectValidatedRuntimeEventPrefix(store.readAll()));
      assert.strictEqual(currentTruth.artifacts.find(row => row.admissionEventRef === firstEvent.eventId), firstTruth.artifacts[0],
        "successful suffixes retain the established first-install fact");
      if (process.env.ABI5_LOCK_REUSE_EXPECTED_EVENTS) {
        assert.deepEqual(await readFile(path), await readFile(process.env.ABI5_LOCK_REUSE_EXPECTED_EVENTS),
          "the established-lock path emits exactly the predecessor's event bytes");
      }
      const liveProjectionPath = join(proofRoot, "live-projection.json");
      await writeFile(liveProjectionPath, JSON.stringify(binding.artifactTruth));
      const expected = original.map((event) => ({ artifactRef: event.payload.artifactRef,
        artifactDigest: event.payload.artifactDigest, artifact: event.payload.artifact,
        resolvedLock: event.payload.resolvedLock ?? null }));
      const expectedPath = join(proofRoot, "expected.json");
      await writeFile(expectedPath, JSON.stringify(expected));
      const mixedSecond = asCandidate(secondEvent);
      mixedSecond.causationEventRefs = [original[0].eventId];
      mixedSecond.payload = { ...mixedSecond.payload, causationEventRefs: mixedSecond.causationEventRefs,
        resolvedLock: { ...goodReference, admissionEventRef: original[0].eventId,
          admissionEventDigest: original[0].payloadDigest } };
      const mixed = [original[0]];
      mixed.push(owners.events.projectRuntimeEventFromValidatedHistory(mixed, mixedSecond));
      const mixedBinding = asCandidate(store.readAll()[2]);
      mixedBinding.causationEventRefs = mixed.map((event) => event.eventId);
      mixedBinding.payload = { ...mixedBinding.payload, causationEventRefs: mixedBinding.causationEventRefs };
      mixed.push(owners.events.projectRuntimeEventFromValidatedHistory(mixed, mixedBinding));
      // A reference-bearing event cannot supply the embedded source, even when
      // the referenced lock is equal. Use a distinct envelope to reach this check.
      const chainCandidate = asCandidate(secondEvent);
      chainCandidate.causationEventRefs = [secondEvent.eventId];
      chainCandidate.payload = { ...chainCandidate.payload, causationEventRefs: chainCandidate.causationEventRefs,
        resolvedLock: { ...goodReference, admissionEventRef: secondEvent.eventId,
          admissionEventDigest: secondEvent.payloadDigest } };
      const chained = owners.events.projectRuntimeEventFromValidatedHistory(store.readAll().slice(0, 2), chainCandidate);
      const histories = [];
      for (const entry of [
        { name: "historical", events: original, valid: true },
        { name: "new owner-produced", events: store.readAll(), valid: true },
        { name: "mixed historical/new projection probe", events: mixed, valid: true },
        { name: "reference chain", events: [...store.readAll().slice(0, 2), chained], valid: false },
        ...negativeHistories,
      ]) {
        const file = join(proofRoot, `cold-${histories.length}.jsonl`);
        await writeFile(file, encode(entry.events));
        histories.push({ name: entry.name, path: file, valid: entry.valid });
      }
      const coldInputPath = join(proofRoot, "cold-input.json");
      await writeFile(coldInputPath, JSON.stringify({ expectedPath, histories, liveProjectionPath, livePath: path }, null, 2));
      store.projectReopenAuthorityAndClose();
      const coldResult = JSON.parse(execFileSync(process.execPath,
        [fileURLToPath(import.meta.url), "--cold", coldInputPath], { encoding: "utf8", maxBuffer: 1024 * 1024 }));
      assert.notEqual(coldResult.processId, process.pid);
      const coordinate = await filePrefix(path, await readFile(path), owners);
      assert.equal(project(coordinate).kind, "exact_prefix_artifact_truth_projection");
      const before = await readFile(path);
      const corrupt = Buffer.from(before); corrupt[20] ^= 1;
      await writeFile(path, corrupt);
      assert.equal(project(coordinate).code, "prefix_digest_mismatch");
      await writeFile(path, before);
      assert.equal(sha256(await readFile(historyPath)), process.env.ABI5_INSTALL_BODY_HISTORY_SHA256);
      await writeFile(join(proofRoot, "result.json"), JSON.stringify({
        retainedInput: { path: historyPath, sha256: sha256(historyBytes) },
        ownerEvents: store.readAll().length, historicalPrefixBytes: encode(original).length,
        compactPrefixBytes: before.length, compactSavingsBytes: encode(original).length - before.length,
        preAppendRefusalCases: mutations.map(([name]) => name), coldResult,
        candidateWork: [firstAdmission.work, secondAdmission.work, bindingAdmission.work],
        refusedCandidateIsolation: true, immutablePriorPrefix: true, stalePredecessorRefused: true,
        completeLiveColdProjectionEqual: true,
        candidateDeltaColdCases: deltaCases.length,
        physicalMutationRefused: true, retainedInputUnchanged: true,
        scope: "Owner and cold-reader regression; synthetic histories are explicitly projection/refusal probes, not installed qualification.",
      }, null, 2) + "\n");
    } finally {
      store.closeDurableLog();
    }
  });

  test("T289 live state recovers after rollback without changing earlier artifact prefixes", async () => {
    const proofRoot = process.env.ABI5_INSTALL_BODY_PROOF_ROOT;
    const historyBytes = await readFile(process.env.ABI5_INSTALL_BODY_HISTORY);
    assert.equal(sha256(historyBytes), process.env.ABI5_INSTALL_BODY_HISTORY_SHA256);
    const original = historyBytes.toString().trimEnd().split("\n").slice(0, 3).map(JSON.parse);
    const path = join(proofRoot, "rollback.jsonl");
    const acquired = owners.events.createNewEmptyAppendSink({
      kind: "new_empty_append_sink_request", schemaVersion: "5.0.0", eventLogPath: path,
    });
    const { store } = acquired;
    assert.ok(store);
    try {
      const first = owners.environment.admitProductInstall(store, original[0].payload.artifact,
        basis(original[0], acquired.prefix), original[0].payload.resolvedLock);
      const earlierPrefix = owners.prefix.selectValidatedRuntimeEventPrefix(store.readAll());
      const earlierTruth = owners.artifact.projectArtifactTruth(earlierPrefix);
      const second = owners.environment.admitProductInstall(store, original[1].payload.artifact,
        basis(original[1], first.successorPrefix), original[1].payload.resolvedLock);
      const accepted = project(second.successorPrefix);
      const bytes = await readFile(path);
      const marker = {
        kind: "public_operation_admitted", eventTime: original[0].eventTime,
        aggregateType: "workspace", aggregateId: "invocation://rollback-marker", parentAggregateId: null,
        causationEventRefs: [], correlationId: "correlation://rollback-marker", workflowVersion: "5.0.0",
        scopeClass: "workspace", basisId: "basis://rollback-marker",
        payload: { invocationDigest: owners.digests.sha256Canonical("rollback-marker"),
          invocationRef: "invocation://rollback-marker", operationId: "abg.operation.project.read", variant: "status" },
      };
      assert.throws(() => owners.events.admitRuntimeEventTransactionAtExpectedPrefix(store, store.digest(), () => {
        owners.events.admitRuntimeEvent(store, marker);
        owners.artifact.projectArtifactTruth(owners.prefix.selectValidatedRuntimeEventPrefix(store.readAll()));
        throw new Error("selected transaction rollback");
      }), /selected transaction rollback/);
      assert.deepEqual(await readFile(path), bytes);
      assert.equal(store.readAll().length, 2);
      assert.deepEqual(project(second.successorPrefix), accepted);
      assert.deepEqual(owners.artifact.projectArtifactTruth(earlierPrefix), earlierTruth,
        "invalidated computation still reconstructs the same immutable prior prefix");
      const binding = owners.environment.admitWorkspaceBinding(store, original[2].payload.artifact,
        basis(original[2], second.successorPrefix, store.readAll().map(event => event.eventId)),
        original[2].payload.workspaceAuthorityBasis);
      assert.equal(binding.kind, "artifact_owner_result", JSON.stringify(binding));
      assert.equal(store.readAll().length, 3);
      assert.equal(store.readAll().at(-1).kind, "public_operation_artifact_admitted");
      assert.deepEqual(owners.artifact.projectArtifactTruth(earlierPrefix), earlierTruth);
      await writeFile(join(proofRoot, "rollback-result.json"), JSON.stringify({
        stagedDerivationRolledBack: true, durableBytesUnchanged: true,
        priorPrefixConserved: true, laterBindingAdmitted: true,
      }, null, 2) + "\n");
    } finally {
      store.closeDurableLog();
    }
  });

  test("T289 established causal installs and binding admit a new lock without changing prior truth", async () => {
    const product = await import("../../build/code/src/product/environment.js");
    const coordinate = await import("../../build/code/src/shared/operation_definition_coordinate.js");
    const proofRoot = process.env.ABI5_INSTALL_BODY_PROOF_ROOT;
    const history = await readFile(process.env.ABI5_INSTALL_BODY_HISTORY);
    assert.equal(sha256(history), process.env.ABI5_INSTALL_BODY_HISTORY_SHA256);
    const original = history.toString().trimEnd().split("\n").slice(0, 3).map(JSON.parse);
    const path = join(proofRoot, "new-lock-append.jsonl");
    const { store, prefix } = owners.events.createNewEmptyAppendSink({
      kind: "new_empty_append_sink_request", schemaVersion: "5.0.0", eventLogPath: path,
    });
    assert.ok(store);
    try {
      const lock = original[0].payload.resolvedLock;
      assert.equal(product.isResolvedProductLock(lock), true);
      const first = owners.environment.admitProductInstallInResolvedLock(store, original[0].payload.artifact,
        basis(original[0], prefix), lock);
      assert.equal(first.kind, "artifact_owner_result");
      const second = owners.environment.admitProductInstallInResolvedLock(store, original[1].payload.artifact,
        basis(original[1], first.successorPrefix), lock);
      assert.equal(second.kind, "artifact_owner_result");
      const bound = owners.environment.admitWorkspaceBinding(store, original[2].payload.artifact,
        basis(original[2], second.successorPrefix, store.readAll().map(event => event.eventId)),
        original[2].payload.workspaceAuthorityBasis);
      assert.equal(bound.kind, "artifact_owner_result");
      const prior = bound.artifactTruth;
      const priorEvents = store.readAll();
      const nextLock = structuredClone(lock);
      nextLock.nativeContractClosureDigest = owners.digests.sha256Canonical("isolated new lock fixture");
      nextLock.lockDigest = owners.digests.sha256Canonical({ rows: nextLock.rows,
        dependencyEdges: nextLock.dependencyEdges, nativeContractClosureDigest: nextLock.nativeContractClosureDigest });
      nextLock.lockId = "product-lock://abiogenesis/" + nextLock.lockDigest.slice(7);
      const candidate = { ...original[0].payload.artifact,
        resolvedLockId: nextLock.lockId, resolvedLockDigest: nextLock.lockDigest,
        installId: original[0].payload.artifact.installId.replace(lock.lockDigest.slice(7), nextLock.lockDigest.slice(7)) };
      const nextBasis = { ...basis(original[0], bound.successorPrefix),
        ...coordinate.constructExactOperationInvocationCoordinate({ operationId: "abg.operation.product.install",
          memberKey: "install", definitionDigest: original[0].payload.definitionDigest },
          original[0].payload.invocationRef + "/new-lock", owners.digests.sha256Canonical("new lock fixture request")),
        authorityScopeRef: candidate.installId };
      const next = await measuredAdmission(() => owners.environment.admitProductInstall(store, candidate, nextBasis, nextLock));
      assert.equal(next.value.kind, "artifact_owner_result");
      assert.equal(store.readAll().length, 4);
      assert.deepEqual(store.readAll().slice(0, 3), priorEvents);
      assert.deepEqual(project(bound.successorPrefix), prior);
      assert.equal(store.readAll()[3].payload.resolvedLock.kind, "resolved_product_lock",
        "a different validated lock cannot borrow an earlier body");
      assert.deepEqual(next.value.artifactTruth.rows.filter(row => row.admissionOrdinal <= 3), prior.rows);
      const current = next.value.artifactTruth;
      store.projectReopenAuthorityAndClose();
      assert.deepEqual(project(await filePrefix(path, await readFile(path), owners)), current);
      await writeFile(join(proofRoot, "new-lock-result.json"), JSON.stringify({
        priorEventsPreserved: true, distinctLockEmbedded: true, warmColdEqual: true, work: next.work,
        scope: "isolated Product-valid lock fixture; no native declaration/package qualification claim",
      }, null, 2) + "\n");
    } finally { store.closeDurableLog(); }
  });

  test("T289 raw install compaction preserves the predecessor structured refusal", async () => {
    const proofRoot = process.env.ABI5_INSTALL_BODY_PROOF_ROOT;
    const historyPath = process.env.ABI5_INSTALL_BODY_HISTORY;
    const predecessorRoot = process.env.ABI5_INSTALL_BODY_PREDECESSOR_ROOT;
    assert.ok(proofRoot && historyPath && predecessorRoot && process.env.ABI5_INSTALL_BODY_HISTORY_SHA256,
      "explicit predecessor package and digest-bound retained history required");
    const bytes = await readFile(historyPath);
    assert.equal(sha256(bytes), process.env.ABI5_INSTALL_BODY_HISTORY_SHA256);
    const original = JSON.parse(bytes.toString().split("\n")[0]);
    const predecessorOwners = await loadProjectionOwners(predecessorRoot);
    const results = [];
    for (const [label, selectedOwners, packageRoot] of [
      ["predecessor", predecessorOwners, predecessorRoot], ["successor", owners, root],
    ]) {
      for (const malformed of [false, true]) {
        const path = join(proofRoot, `raw-${label}-${malformed ? "null" : "valid"}.jsonl`);
        const { store, prefix } = selectedOwners.events.createNewEmptyAppendSink({
          kind: "new_empty_append_sink_request", schemaVersion: "5.0.0", eventLogPath: path,
        });
        assert.ok(store);
        try {
          const metadata = structuredClone({ artifact: original.payload.artifact,
            resolvedLock: original.payload.resolvedLock });
          if (malformed) metadata.artifact.productContentDigest = null;
          let result;
          assert.doesNotThrow(() => {
            result = selectedOwners.environment.admitArtifact(store, basis(original, prefix),
              "abg.operation.product.install", original.payload.artifactRef,
              original.payload.artifactDigest, metadata);
          }, `${label}: raw eligibility must return its structured refusal`);
          if (malformed) {
            assert.equal(result.disposition, "refused", label);
            assert.equal(result.refusal.code, "artifact_truth_conflict", label);
            assert.deepEqual(result.successorPrefix, prefix, label);
            assert.equal(store.readAll().length, 0, label);
            assert.equal((await readFile(path)).length, 0, label);
          } else {
            assert.equal(result.disposition, "admitted", label);
            assert.equal(store.readAll().length, 1, label);
            assert.deepEqual(result.artifactTruth.rows[0].artifact, original.payload.artifact, label);
            assert.deepEqual(result.artifactTruth.rows[0].resolvedLock, original.payload.resolvedLock, label);
            assert.equal(store.readAll()[0].payload.artifact.kind,
              label === "predecessor" ? "product_install_candidate" : "product_install_lock_row", label);
          }
          results.push({ label, malformed, root: packageRoot, returned: true,
            disposition: result.disposition, code: result.refusal?.code,
            message: result.refusal?.message, events: store.readAll().length,
            bytes: (await readFile(path)).length,
            sourceOwnerSha256: sha256(await readFile(join(packageRoot, "build/code/src/abg/environment_admission.js"))) });
        } finally {
          store.closeDurableLog();
        }
      }
    }
    const before = results.find((row) => row.label === "predecessor" && row.malformed);
    const after = results.find((row) => row.label === "successor" && row.malformed);
    assert.equal(after.code, before.code);
    assert.equal(after.message, before.message);
    assert.equal(sha256(await readFile(historyPath)), process.env.ABI5_INSTALL_BODY_HISTORY_SHA256);
    await writeFile(join(proofRoot, "raw-refusal-comparison.json"), JSON.stringify({
      mutation: "artifact.productContentDigest = null; all other candidate, lock and invocation fields retained",
      history: historyPath, historySha256: sha256(bytes), results,
    }, null, 2) + "\n");
  });
}
