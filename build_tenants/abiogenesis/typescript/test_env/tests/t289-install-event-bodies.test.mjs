import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
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
      const first = owners.environment.admitProductInstall(store, original[0].payload.artifact,
        basis(original[0], acquisition.prefix), lock);
      assert.equal(first.kind, "artifact_owner_result");
      const firstEvent = store.readAll()[0];
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
      const second = owners.environment.admitProductInstall(store, original[1].payload.artifact,
        basis(original[1], first.successorPrefix), lock);
      assert.equal(second.kind, "artifact_owner_result", JSON.stringify(second));
      const secondEvent = store.readAll()[1];
      assert.deepEqual(secondEvent.payload.resolvedLock, goodReference);
      assert.equal(secondEvent.payload.resolvedLock.kind, "resolved_product_lock_reference");
      assert.deepEqual(secondEvent.causationEventRefs, [firstEvent.eventId]);
      assert.notEqual(secondEvent.eventId, firstEvent.eventId);
      assert.notEqual(secondEvent.payload.artifactRef, firstEvent.payload.artifactRef);
      const binding = owners.environment.admitWorkspaceBinding(store, original[2].payload.artifact,
        basis(original[2], second.successorPrefix, [firstEvent.eventId, secondEvent.eventId]),
        original[2].payload.workspaceAuthorityBasis);
      assert.equal(binding.kind, "artifact_owner_result");
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
      await writeFile(coldInputPath, JSON.stringify({ expectedPath, histories }, null, 2));
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
        physicalMutationRefused: true, retainedInputUnchanged: true,
        scope: "Owner and cold-reader regression; synthetic histories are explicitly projection/refusal probes, not installed qualification.",
      }, null, 2) + "\n");
    } finally {
      store.closeDurableLog();
    }
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
