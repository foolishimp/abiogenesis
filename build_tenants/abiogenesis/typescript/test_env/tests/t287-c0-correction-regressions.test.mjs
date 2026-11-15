import assert from "node:assert/strict";
import { constants } from "node:fs";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import test from "node:test";
import { installOncePerFile, installTenantOnce, setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";
import { proveFreshProcessRuntimeProjectionEquality } from "../support/fresh-process-runtime-proof.mjs";
const root = resolve(import.meta.dirname, "../..");
// The two installed correction cases share one packed, verified and installed
// Product for this file; each opens its own store, workspace and scratch root on it.
const sharedInstall = installOncePerFile(() => installTenantOnce(root, { candidateBasisSource: "packed_artifact" }));
const proofRoot = process.env.ABG_C0_PROOF_ROOT;
const regressionRoot = process.env.ABG_REGRESSION_PROOF_ROOT;
const eventTime = "2026-09-07T12:00:00.000Z";

// The complete observed candidate of one case is written before its
// assertions, one distinct file per case, only under the supplied root.
async function retainCandidate(name, value) {
  if (!regressionRoot) return;
  const directory = join(regressionRoot, "t287-c0-correction-regressions");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, `${name}.json`), JSON.stringify(value, (_key, item) =>
    item instanceof Uint8Array ? { utf8: Buffer.from(item).toString("utf8"), byteLength: item.byteLength } : item) + "\n");
}

// Bounded exact-helper probes with stubbed filesystem: no installed runtime claim.
// T-293 B45: B21 split the retired single inspector into metadata-only
// `inspectTargetLocation` and `readTargetFile`, so the physical protected-root
// exclusion precedes any content read. The guarded read/close block is the
// unchanged body of `readTargetFile`; the probe extracts the current helpers
// and drives that block at its filesystem seam. Nothing restores a read before
// the exclusion.
test("correction: observation finalizes after read and close with primary precedence", async () => {
  const effect = await import(pathToFileURL(join(root, "build/code/src/product/worksite_effect.js")));
  const source = await readFile(join(root, "build/code/src/product/worksite_operations.js"), "utf8");
  const slice = (from, to) => {
    const start = source.indexOf(from), end = source.indexOf(to);
    assert.ok(start >= 0 && end > start, `${from} precedes ${to} in the compiled owner`);
    return source.slice(start, end);
  };
  assert.equal(source.includes("async function inspectTargetPath("), false, "the retired combined inspector is absent");
  const locationBody = slice("async function inspectTargetLocation(", "async function readTargetFile(");
  const body = slice("async function readTargetFile(", "async function inspectPhysicalDirectory(");
  assert.ok(locationBody.length > 0);
  assert.ok(body.length > 0);
  const status = { isFile: () => true, isDirectory: () => true, isSymbolicLink: () => false, nlink: 1, dev: 1, ino: 2 };
  for (const [readFails, closeFails] of [[false, false], [true, false], [false, true], [true, true]]) {
    let closed = 0, opened = 0;
    const [locate, inspect] = new Function("lstat", "realpath", "open", "resolve", "constants", "worksiteRefusal", "errnoCode",
      `${locationBody}; ${body}; return [inspectTargetLocation, readTargetFile];`)(
      async () => status, async value => value,
      async () => { opened += 1; return { stat: async () => status,
        readFile: async () => { if (readFails) throw Object.assign(new Error("FIRST_READ_EIO"), { code: "EIO" }); return Buffer.from("observed"); },
        close: async () => { closed += 1; if (closeFails) throw Object.assign(new Error("LATER_CLOSE_EBADF"), { code: "EBADF" }); },
      }; }, resolve, constants, effect.worksiteRefusal, error => error.code ?? null,
    );
    const target = { canonicalRoot: "/tmp", targetPath: "/tmp/target", protectedRoots: [] };
    const located = await locate(target, { relativePath: "target" });
    const openedByLocation = opened;
    const result = await inspect(target);
    await retainCandidate(`read-${readFails ? "fails" : "succeeds"}-close-${closeFails ? "fails" : "succeeds"}`,
      { readFails, closeFails, located, openedByLocation, opened, closed, result });
    // Metadata location opens nothing; the reader opens once and closes once.
    assert.equal(located, "file");
    assert.equal(openedByLocation, 0);
    assert.equal(opened, 1);
    assert.equal(closed, 1);
    if (readFails || closeFails) {
      assert.equal(result.kind, "worksite_effect_refusal");
      assert.equal(result.substrateCode, readFails ? "EIO" : "EBADF");
      if (readFails) assert.match(result.message, /FIRST_READ_EIO/u);
      if (closeFails) assert.match(result.message, /EBADF.*LATER_CLOSE_EBADF/u);
      if (readFails && closeFails) assert.match(result.message, /FIRST_READ_EIO.*secondary.*LATER_CLOSE_EBADF/u);
    } else assert.equal(Buffer.from(result.bytes).toString(), "observed");
  }
});

test("correction: raw writer retired", async () => {
  const product = await import(pathToFileURL(join(root, "build/code/src/product/index.js")));
  assert.equal(Object.hasOwn(product, "replaceWorksiteFile"), false);
  // Retired: "C0 marker scope remains strict" re-executed the compiled text
  // between two statement markers of c_call_outcome.js with injected names.
  // The slice now reaches names the harness does not supply (the prefix-scoped
  // failure-basis reader, the parents-success guard) and no design sentence
  // names that text.
});

for (const withPhase of [false, true]) test(`correction: generic owner-boundary admission ${withPhase ? "with" : "without"} phase`, async context => {
  const env = await setupInstalledRootExecutionBasis(context, root, { candidateBasisSource: "packed_artifact", install: await sharedInstall() });
  const { abg, product, store, executionBasis } = env;
  const boundary = await import(pathToFileURL(join(env.installedRoot, "build/code/src/implementation/leaf_invocation_port.js")));
  const freeze = value => { if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  const label = `generic-${withPhase ? "with" : "without"}-phase`;
  const coordinates = product.canonicalJson({ A: env.workspaceAuthority, W: env.workspaceBinding, B: executionBasis });
  const opened = abg.openTraversalScope(store, abg.selectHeldEventStoreDurablePrefix(store), { kind: "root", executionBasis }, { eventTime, correlationId: `correlation://correction/${label}/open`, causationEventRefs: [] });
  assert.equal(opened.kind, "traversal_scope_open_admission");
  const port = Object.fromEntries(Object.entries(env.leafPort).map(([key, value]) => [key, typeof value === "function" ? value.bind(env.leafPort) : value]));
  let candidate, ownerReceipt, verifiedInstalledOwner = false, callRef;
  port.invoke = async call => {
    callRef = call.occurrence.cCallRef;
    // Actual installed authority verification and original realization occur first.
    const actual = await env.leafPort.invoke(call);
    assert.equal(actual.kind, "closed_leaf_owner_receipt");
    assert.equal(actual.candidate.disposition, "success");
    verifiedInstalledOwner = env.leafPort.isExactLoadedCapability() && env.leafPort.isAdmittedResolution(call.resolution);
    assert.equal(verifiedInstalledOwner, true);
    const base = boundary.totalizeLeafImplementationFailure({ resolution: call.resolution, inputDigest: call.inputDigest, failureValueKind: env.leafPort.contractValueKind(call.failureContractRef, "failure"), failureClass: "implementation_exception" });
    const resultCandidate = { ...base.resultCandidate, ...(withPhase ? { phase: "post_publication" } : {}) };
    candidate = freeze({ ...base, resultCandidate, evidenceCandidates: base.evidenceCandidates.map(row => ({ ...row, outputDigest: product.sha256Canonical(resultCandidate) })) });
    // Declared test producer at the existing boundary; it is not the installed HelloWorld bytes.
    ownerReceipt = await boundary.invokeLeafOwnerBoundary({ resolution: call.resolution, value: call.input, inputDigest: call.inputDigest,
      failureValueKind: env.leafPort.contractValueKind(call.failureContractRef, "failure"),
      verifyAuthority: () => verifiedInstalledOwner && actual.receipt !== null,
      validateSuccess: value => env.leafPort.validateContractValue(call.resolution.outputContractRef, "output", value),
      resolveWorkerContracts: () => null, occurrence: call.occurrence, loadImplementation: async () => () => candidate,
    });
    assert.equal(ownerReceipt.kind, "closed_leaf_owner_receipt");
    assert.deepEqual(ownerReceipt.candidate, candidate);
    return ownerReceipt;
  };
  const completion = await env.hog.executeGraphTraversal({ store, predecessorPrefix: opened.successorPrefix, executionBasis, openedTraversalScope: opened.scope,
    program: env.program, programValidation: env.programValidation, graphFunction: env.graphFunction, graph: env.graph, graphValidation: env.graphValidation,
    implementationSet: env.implementationSet, interactionSet: env.executionBasisAdmission.interactionSet, leafPort: Object.freeze(port),
    actorRuntimeBinding: { workspaceBinding: env.workspaceBinding, artifactTruth: env.artifactTruth }, input: env.input, inputDigest: env.rawInput.subjectDigest,
    closureContract: env.closureContract, eventTime, correlationId: `correlation://correction/${label}/hog`,
  });
  const events = store.readAll();
  const result = events.find(row => row.kind === "c_call_result_admitted" && row.aggregateId === callRef);
  const evidence = events.find(row => row.kind === "c_call_evidenced" && row.aggregateId === callRef);
  if (proofRoot) {
    await mkdir(proofRoot, { recursive: true });
    await writeFile(join(proofRoot, `${label}-observation.json`), JSON.stringify({ label, verifiedInstalledOwner, candidate, ownerReceipt, completion, eventKinds: events.map(row => row.kind) }) + "\n");
  }
  assert.ok(result, JSON.stringify(completion));
  assert.equal(result.payload.resultClass, "failure");
  assert.deepEqual(result.payload.value, candidate.resultCandidate);
  assert.equal(evidence.payload.evidenceClass, "deterministic");
  assert.equal(evidence.payload.outputDigest, result.payload.valueDigest);
  assert.equal(product.canonicalJson({ A: env.workspaceAuthority, W: env.workspaceBinding, B: executionBasis }), coordinates);
  const logPath = store.configuredDurableLogPath();
  const fresh = await proveFreshProcessRuntimeProjectionEquality({ abg, product, installedPackageRoot: env.installedRoot, store,
    requests: [{ rowId: label, owner: "replay", exportName: "projectOwnedRuntimeTruthAtDurablePrefix", input: "durable_prefix", args: [opened.scope.runId] }],
  });
  const replay = fresh.retainedRows[0].projection.replayState;
  assert.deepEqual(replay.cCalls.find(row => row.cCallRef === callRef).resultValue, candidate.resultCandidate);
  assert.deepEqual(replay.currentWorksiteObservations, []);
  if (proofRoot) {
    const raw = await readFile(logPath);
    assert.equal(product.sha256Bytes(raw), fresh.eventLogDigest);
    const artifactDigest = await product.sha256File(env.artifactPath);
    const artifact = `candidate-${artifactDigest.slice(7)}.tgz`;
    try { await copyFile(env.artifactPath, join(proofRoot, artifact), constants.COPYFILE_EXCL); } catch (error) { if (error.code !== "EEXIST") throw error; }
    await writeFile(join(proofRoot, `${label}.events.jsonl.gz`), gzipSync(raw));
    await writeFile(join(proofRoot, `${label}.json`), JSON.stringify({ label, claim: "owner-boundary/admission integration with declared test producer; not installed HelloWorld failure-production proof", artifact, artifactDigest,
      manifestDigest: product.sha256Canonical(JSON.parse(await readFile(join(env.installedRoot, "product-toolchain-manifest.json")))), sourceProductContentDigest: env.verified.productContentDigest,
      candidate, ownerReceipt, verifiedInstalledOwner, completion, rawLogDigest: fresh.eventLogDigest, eventCount: fresh.historicalEventCount,
      runId: opened.scope.runId, replayStateDigest: product.sha256Canonical(replay), currentObservations: replay.currentWorksiteObservations, freshProcessIds: fresh.freshProcessIds,
      reopenClaim: "Two processes reopened original path/inode before cleanup; retained bytes support relocated content replay only." }) + "\n");
  }
});
