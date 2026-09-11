import assert from "node:assert/strict";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import test from "node:test";

import { setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";
import { proveFreshProcessRuntimeProjectionEquality } from "../support/fresh-process-runtime-proof.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const eventTime = "2026-09-07T04:00:00.000Z";
const proofRoot = process.env.ABG_C0_PROOF_ROOT;

async function inventory(product, directory) {
  const rows = [];
  async function visit(path, relativePath) {
    const status = await fsPromises.lstat(path);
    const identity = `${status.dev}:${status.ino}:${status.nlink}`;
    if (status.isSymbolicLink()) {
      rows.push({ relativePath, kind: "symlink", identity, target: await fsPromises.readlink(path) });
    } else if (status.isDirectory()) {
      rows.push({ relativePath, kind: "directory", identity });
      for (const name of (await fsPromises.readdir(path)).sort()) await visit(join(path, name), relativePath ? `${relativePath}/${name}` : name);
    } else {
      assert.equal(status.isFile(), true);
      rows.push({ relativePath, kind: "file", identity, digest: product.sha256Bytes(await fsPromises.readFile(path)), byteLength: status.size });
    }
  }
  await visit(directory, "");
  return { digest: product.sha256Canonical(rows), pathCount: rows.length };
}

async function physicalPath(product, path) {
  if (path === null) return null;
  try {
    const status = await fsPromises.lstat(path);
    return {
      path, state: status.isFile() ? "file" : status.isDirectory() ? "directory" : "other",
      fileIdentity: `${status.dev}:${status.ino}`, nlink: status.nlink,
      digest: status.isFile() ? product.sha256Bytes(await fsPromises.readFile(path)) : null,
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { path, state: "absent", fileIdentity: null, nlink: null, digest: null };
  }
}

function delegate(port) {
  return Object.fromEntries(Object.entries(port).map(([key, value]) => [key, typeof value === "function" ? value.bind(port) : value]));
}

function installFaults(env, targetPath, modes, label) {
  const original = Object.fromEntries(["link", "rename", "unlink", "lstat", "open", "readFile", "writeFile", "mkdir", "rm"].map(key => [key, fsPromises[key]]));
  const originalWriteSync = fs.writeSync;
  const state = { published: false, method: null, stagingPath: null, targetReads: 0, stagingUnlinks: 0, injected: [], externalChanges: [], beforeAdmissionPrefix: null };
  const has = mode => modes.includes(mode);
  const injected = mode => state.injected.includes(mode);
  const fault = mode => {
    state.injected.push(mode);
    return Object.assign(new Error(`B04 ${label}: ${mode}`), { code: "EIO" });
  };
  for (const method of ["link", "rename"]) {
    fsPromises[method] = async (source, target) => {
      if (target === targetPath && has("publication_syscall")) throw fault("publication_syscall");
      const result = await original[method](source, target);
      if (target === targetPath) {
        state.published = true;
        state.method = method;
        state.stagingPath = source;
      }
      return result;
    };
  }
  fsPromises.unlink = async path => {
    if (path === state.stagingPath && has("staging_cleanup")) {
      state.stagingUnlinks += 1;
      if (state.stagingUnlinks === 1 || has("persistent_cleanup")) {
        if (has("substituted_staging") && !injected("substituted_staging")) {
          state.injected.push("substituted_staging");
          await original.unlink(path);
          await original.writeFile(path, "external substituted staging\n");
          state.externalChanges.push({ stage: "after_publication", path, action: "substitute_staging" });
        }
        throw fault("staging_cleanup");
      }
    }
    if (path === targetPath && state.published && has("compensation_failure")) throw fault("compensation_failure");
    return original.unlink(path);
  };
  fsPromises.lstat = async (path, ...args) => {
    if (state.published && path === targetPath) {
      if (has("compensation_identity") && !injected("compensation_identity")) throw fault("compensation_identity");
      if ((has("successor_absent") || has("successor_nonfile")) && !injected("successor_kind")) {
        state.injected.push("successor_kind");
        await original.unlink(path);
        if (has("successor_nonfile")) await original.mkdir(path);
        state.externalChanges.push({ stage: "after_publication", path, action: has("successor_nonfile") ? "replace_with_directory" : "remove_target" });
      }
    }
    if (path === state.stagingPath && has("residue_unknown") && state.stagingUnlinks >= 2) throw fault("residue_unknown");
    return original.lstat(path, ...args);
  };
  fsPromises.open = async (path, ...args) => {
    if (state.published && path === targetPath) {
      state.targetReads += 1;
      const ordinal = has("owner_read") || has("owner_mismatch") || has("owner_read_close") ? 2 : 1;
      if (state.targetReads === ordinal) {
        if (has("successor_read_close") || has("owner_read_close") || has("successor_close")) {
          const handle = await original.open(path, ...args);
          return {
            stat: handle.stat.bind(handle),
            readFile: async () => {
              if (!has("successor_close")) throw Object.assign(fault("FIRST_READ_EIO"), { code: "EIO" });
              return handle.readFile();
            },
            close: async () => {
              await handle.close();
              throw Object.assign(fault("LATER_CLOSE_EBADF"), { code: "EBADF" });
            },
          };
        }
        if (has("successor_read") || has("owner_read")) throw fault(has("owner_read") ? "owner_read" : "successor_read");
        if (has("successor_mismatch") || has("owner_mismatch")) {
          state.injected.push(has("owner_mismatch") ? "owner_mismatch" : "successor_mismatch");
          await original.writeFile(path, "external changed bytes after publication\n");
          state.externalChanges.push({ stage: "after_publication", path, action: "change_target_bytes", targetReadOrdinal: ordinal });
        }
      }
    }
    return original.open(path, ...args);
  };
  fsPromises.readFile = async (path, ...args) => {
    if (state.published && typeof path === "string" && path.startsWith(`${env.installedRoot}/`)) {
      if (has("inventory_read") && !injected("inventory_read")) throw fault("inventory_read");
      if (has("inventory_mismatch") && !injected("inventory_mismatch")) {
        state.injected.push("inventory_mismatch");
        return Buffer.concat([await original.readFile(path, ...args), Buffer.from("injected observation mismatch")]);
      }
    }
    return original.readFile(path, ...args);
  };
  fs.writeSync = (...args) => {
    if (state.published && has("append") && Buffer.isBuffer(args[1]) && args[1].includes(Buffer.from('"kind":"c_call_evidenced"'))) throw fault("append");
    return originalWriteSync(...args);
  };
  syncBuiltinESMExports();
  return { state, restore() {
    for (const [key, value] of Object.entries(original)) fsPromises[key] = value;
    fs.writeSync = originalWriteSync;
    syncBuiltinESMExports();
  } };
}

async function runCase(context, label, options = {}) {
  const modes = options.modes ?? [];
  const gtl = await import(pathToFileURL(join(root, "build/code/src/gtl/index.js")).href);
  let targetPath;
  const replacement = Buffer.from(`B04 ${label}\n`);
  const env = await setupInstalledRootExecutionBasis(context, root, {
    candidateBasisSource: "packed_artifact", rootPublicationKind: "worksite_c0",
    programRef: gtl.WORKSITE_C0_IDS.programRef, graphFunctionRef: gtl.WORKSITE_C0_IDS.graphFunctionRef,
    inputContractRef: gtl.WORKSITE_C0_IDS.inputContractRef,
    inputFactory: async ({ product, workspaceAuthority, workspaceBinding, capabilityGrant }) => {
      const relativeRoot = "c0-b04", relativePath = `${relativeRoot}/target.txt`;
      const directory = join(workspaceAuthority.canonicalRoot, relativeRoot);
      await fsPromises.mkdir(directory);
      targetPath = join(directory, "target.txt");
      if (options.replace) await fsPromises.writeFile(targetPath, "original\n");
      const coordinates = { workspaceAuthorityBasis: workspaceAuthority, workspaceBinding };
      const subject = product.constructWorksiteSubject({ ...coordinates, subjectUri: pathToFileURL(targetPath).href, relativePath });
      assert.equal(subject.kind, "worksite_subject", JSON.stringify(subject));
      const territory = product.constructWorksiteTerritory({ ...coordinates, territoryUri: pathToFileURL(directory).href, relativeRoot });
      assert.equal(territory.kind, "worksite_territory", JSON.stringify(territory));
      const predecessorObservation = await product.observeWorksiteSubject(workspaceAuthority, workspaceBinding, subject);
      assert.equal(predecessorObservation.kind, "worksite_observation", JSON.stringify(predecessorObservation));
      const request = product.constructWorksiteFileReplaceRequest({ ...coordinates, capabilityGrant, subject, territory, predecessorObservation, replacementBytes: replacement });
      assert.equal(request.kind, "worksite_file_replace_request", JSON.stringify(request));
      return request;
    },
  });
  const { abg, store, product, executionBasis, workspaceAuthority, workspaceBinding } = env;
  assert.equal(Object.hasOwn(product, "replaceWorksiteFile"), false, "raw writer must remain internal to the guarded owner");
  const carriers = await import(pathToFileURL(join(env.installedRoot, "build/code/src/product/worksite_effect.js")).href);
  const admission = await import(pathToFileURL(join(env.installedRoot, "build/code/src/abg/c_call_outcome.js")).href);
  const calculus = await import(pathToFileURL(join(env.installedRoot, "build/code/src/abg/event_calculus.js")).href);
  assert.notEqual(workspaceAuthority.canonicalRoot, workspaceBinding.roots.productRoot);
  assert.equal(workspaceBinding.roots.productRoot, env.admittedInstall.installedRoot);
  const coordinatesBefore = product.canonicalJson({ workspaceAuthority, workspaceBinding, executionBasis });
  const installedBefore = await inventory(product, env.installedRoot);
  if (modes.includes("stale")) await fsPromises.writeFile(targetPath, "external stale O0 bytes\n");
  const targetBefore = await physicalPath(product, targetPath);
  const opened = abg.openTraversalScope(store, abg.selectHeldEventStoreDurablePrefix(store), { kind: "root", executionBasis }, {
    eventTime, correlationId: `correlation://c0-b04/${label}/open`, causationEventRefs: [],
  });
  assert.equal(opened.kind, "traversal_scope_open_admission", JSON.stringify(opened));
  let ownerOutcome, capturedCall, malformedCopyDigest = null;
  const delegated = delegate(env.leafPort);
  let injection;
  delegated.invoke = async call => {
    capturedCall = call;
    if (options.authorizationControls) {
      const authorization = product.constructWorksiteEffectAuthorization({ workspaceBinding, request: env.input, executionBasis, cCall: call.occurrence.executionAuthority.cCall, implementationSet: env.implementationSet });
      assert.equal(authorization.kind, "worksite_effect_authorization");
      assert.equal(product.isWorksiteFileReplaceInput({ workspaceAuthorityBasis: workspaceAuthority, workspaceBinding, request: env.input, executionBasis, cCall: call.occurrence.executionAuthority.cCall, implementationSet: env.implementationSet, authorization: { ...authorization, authorizationDigest: `sha256:${"0".repeat(64)}` } }), false);
      const changedRequest = product.constructWorksiteFileReplaceRequest({ ...env.input, workspaceBinding, replacementBytes: Buffer.from("changed bytes under unchanged admitted basis") });
      assert.equal(changedRequest.kind, "worksite_file_replace_request");
      const crossed = await env.leafPort.invoke({ ...call, input: changedRequest, inputDigest: product.sha256Canonical(changedRequest) });
      assert.equal(crossed.kind, "closed_leaf_owner_receipt");
      assert.equal(crossed.candidate.disposition, "failure");
      assert.equal(crossed.candidate.resultCandidate.phase, undefined);
      injection.state.changedInputControl = { requestDigest: product.sha256Canonical(changedRequest), originalInputDigest: call.inputDigest, refused: true };
      const protectedRelative = ".ai-workspace/events/forbidden.txt";
      const protectedSubject = product.constructWorksiteSubject({ workspaceAuthorityBasis: workspaceAuthority, workspaceBinding, subjectUri: pathToFileURL(join(workspaceAuthority.canonicalRoot, protectedRelative)).href, relativePath: protectedRelative });
      const protectedOutcome = await product.observeWorksiteSubject(workspaceAuthority, workspaceBinding, protectedSubject);
      assert.equal(protectedOutcome.kind, "worksite_effect_refusal");
      assert.equal(protectedOutcome.code, "binding_mismatch");
      assert.equal(protectedOutcome.phase, undefined);
      injection.state.protectedRootControl = { relativePath: protectedRelative, code: protectedOutcome.code, refused: true };
      assert.deepEqual(await physicalPath(product, targetPath), targetBefore);
    }
    const result = await env.leafPort.invoke(call);
    ownerOutcome = result.candidate?.resultCandidate;
    injection.state.beforeAdmissionPrefix = abg.selectHeldEventStoreDurablePrefix(store);
    if (options.reject === "evidence" || (options.reject === "result" && result.candidate.disposition === "failure")) {
      // Negative-only copy; the untouched real owner return is the physical oracle.
      const malformed = structuredClone(result);
      if (options.reject === "evidence") malformed.candidate.evidenceCandidates[0].inputDigest = `sha256:${"0".repeat(64)}`;
      else malformed.candidate.diagnosticRef = "diagnostic://abiogenesis/c0-b04/crossed-negative-copy";
      malformedCopyDigest = product.sha256Canonical(malformed);
      return Object.freeze(malformed);
    }
    return result;
  };
  if (options.reject === "result") delegated.validateResultEvidenceLineage = () => false;
  injection = installFaults(env, targetPath, modes, label);
  let completion;
  try {
    completion = await env.hog.executeGraphTraversal({
      store, predecessorPrefix: opened.successorPrefix, executionBasis, openedTraversalScope: opened.scope,
      program: env.program, programValidation: env.programValidation, graphFunction: env.graphFunction,
      programPublication: env.executionResolution.programPublication,
      graph: env.graph, graphValidation: env.graphValidation, implementationSet: env.implementationSet,
      interactionSet: env.executionBasisAdmission.interactionSet, leafPort: Object.freeze(delegated),
      actorRuntimeBinding: { workspaceBinding, artifactTruth: env.artifactTruth }, input: env.input,
      inputDigest: env.rawInput.subjectDigest, closureContract: env.closureContract, eventTime,
      correlationId: `correlation://c0-b04/${label}/hog`,
    });
  } finally {
    injection.restore();
  }
  const state = injection.state;
  const events = store.readAll();
  const targetAfter = await physicalPath(product, targetPath);
  const stagingAfter = await physicalPath(product, state.stagingPath);
  const installedAfter = await inventory(product, env.installedRoot);
  assert.deepEqual(installedAfter, installedBefore, "independent inventory must prove zero installed Product delta");
  assert.equal(product.canonicalJson({ workspaceAuthority, workspaceBinding, executionBasis }), coordinatesBefore);
  const failure = ownerOutcome?.phase === "post_publication";
  const unadmitted = modes.includes("append") || options.reject !== undefined;
  const prepublication = modes.includes("stale") || modes.includes("publication_syscall");
  if (proofRoot) {
    await fsPromises.mkdir(proofRoot, { recursive: true });
    await fsPromises.writeFile(join(proofRoot, `${label}-owner.json`), `${JSON.stringify({ ownerOutcome, completion, state, targetBefore, targetAfter, stagingAfter, installedBefore, installedAfter, malformedCopyDigest })}\n`);
  }
  if (modes.length > 0 && !modes.includes("stale")) assert.ok(state.injected.length > 0, label);
  if (prepublication) {
    assert.equal(state.published, false);
    assert.equal(failure, false);
    assert.equal(ownerOutcome.kind, "worksite_effect_refusal");
    assert.deepEqual(targetAfter, targetBefore);
    assert.equal((await fsPromises.readdir(dirname(targetPath))).some(name => name.startsWith(".abiogenesis-")), false);
  } else if (failure) {
    assert.equal(carriers.isWorksitePostPublicationFailure(ownerOutcome), true, JSON.stringify(ownerOutcome));
    assert.equal(/before commit/u.test(ownerOutcome.message), false);
    const physical = ownerOutcome.physicalOutcome;
    if (modes.includes("successor_read_close") || modes.includes("owner_read_close")) {
      assert.equal(ownerOutcome.substrateCode, "EIO");
      assert.match(ownerOutcome.message, /FIRST_READ_EIO.*secondary.*EBADF.*LATER_CLOSE_EBADF/u);
      assert.equal(physical.diagnostics[0].substrateCode, "EIO");
      assert.equal(physical.diagnostics[0].message, ownerOutcome.message);
    }
    if (modes.includes("successor_close")) {
      assert.equal(ownerOutcome.substrateCode, "EBADF");
      assert.match(ownerOutcome.message, /LATER_CLOSE_EBADF/u);
    }
    assert.ok(admission.projectWorksiteFailureBasis(events, capturedCall.occurrence.cCallRef, ownerOutcome));
    if (physical.kind === "publication_only") {
      assert.equal(physical.publication.method, state.method);
      assert.equal(physical.publication.writtenDigest, product.sha256Bytes(replacement));
      assert.equal(physical.publication.byteLength, replacement.byteLength);
      assert.equal(physical.publication.stagingPath, state.stagingPath);
      assert.equal("receipt" in physical, false);
      if (physical.stagingResidue.state === "owned_file") assert.equal(stagingAfter.fileIdentity, physical.publication.stagingFileIdentity);
      if (physical.stagingResidue.state === "absent") assert.equal(stagingAfter.state, "absent");
      if (physical.stagingResidue.state === "other_path") assert.notEqual(stagingAfter.fileIdentity, physical.publication.stagingFileIdentity);
      if (modes.includes("staging_cleanup")) {
        assert.equal(physical.diagnostics[0].stage, "staging_cleanup");
        assert.equal(physical.compensation, modes.includes("compensation_failure") ? "failed" : modes.includes("compensation_identity") || modes.includes("substituted_staging") ? "skipped_unverified_identity" : "succeeded");
        assert.equal(targetAfter.state, physical.compensation === "succeeded" ? "absent" : "file");
        assert.equal(physical.stagingCleanup, modes.includes("persistent_cleanup") ? "failed" : modes.includes("substituted_staging") ? "skipped_unverified_identity" : "removed");
        if (modes.includes("residue_unknown")) assert.equal(physical.stagingResidue.state, "unknown");
      }
    } else {
      assert.equal(physical.kind, "owner_completed");
      assert.equal(product.isWorksiteFileReplaceReceipt(physical.completedOwner.receipt), true);
      assert.equal(physical.completedOwner.successorObservation.fileDigest, product.sha256Bytes(replacement));
      assert.equal(stagingAfter.state, "absent");
      const rebuilt = carriers.constructWorksiteFileReplaceReceipt(physical.completedOwner.authorization, env.input.predecessorObservation, physical.completedOwner.successorObservation, env.input.replacementDigest);
      assert.deepEqual(rebuilt, physical.completedOwner.receipt);
    }
  } else if (!prepublication) {
    assert.equal(ownerOutcome.kind, "worksite_file_replace_output", JSON.stringify(ownerOutcome));
    assert.equal(targetAfter.digest, product.sha256Bytes(replacement));
    assert.equal(stagingAfter.state, "absent");
  }
  const callEvents = events.filter(event => event.aggregateId === capturedCall.occurrence.cCallRef);
  if (unadmitted) {
    assert.equal(completion.disposition, "refused", JSON.stringify(completion));
    assert.equal(completion.resultValue.kind, "unadmitted_physical_commit");
    assert.deepEqual(completion.resultValue.refusedExpectedPrefix, state.beforeAdmissionPrefix);
    assert.deepEqual(abg.selectHeldEventStoreDurablePrefix(store), state.beforeAdmissionPrefix);
    assert.equal(callEvents.some(event => ["c_call_evidenced", "c_call_result_admitted"].includes(event.kind)), false);
    if (failure) assert.deepEqual(completion.resultValue.ownerOutcome, ownerOutcome);
    else {
      assert.deepEqual(completion.resultValue.receipt, ownerOutcome.receipt);
      assert.deepEqual(completion.resultValue.successorObservation, ownerOutcome.successorObservation);
    }
  } else {
    assert.deepEqual(completion.resultValue, ownerOutcome, JSON.stringify(completion));
    const result = callEvents.find(event => event.kind === "c_call_result_admitted");
    const evidence = callEvents.find(event => event.kind === "c_call_evidenced");
    assert.equal(result.payload.valueDigest, product.sha256Canonical(ownerOutcome));
    assert.equal(evidence.payload.outputDigest, result.payload.valueDigest);
    assert.equal(evidence.payload.evidenceClass, failure || prepublication ? "deterministic" : "worksite_file_replace");
    if (failure) {
      const prior = events.filter(event => event.admissionOrdinal < result.admissionOrdinal);
      assert.deepEqual(calculus.projectWorksiteTransitionForResult(result, prior), { before: env.input.predecessorObservation.observationRef, after: null, successorObservation: null });
      const mutations = [
        value => { value.physicalOutcome.extra = true; },
        value => { value.physicalOutcome.kind === "publication_only" ? value.physicalOutcome.authorization.cCallRef = "crossed-call" : value.physicalOutcome.completedOwner.receipt.receiptDigest = `sha256:${"0".repeat(64)}`; },
      ];
      for (const mutate of mutations) {
        const negative = structuredClone(ownerOutcome); mutate(negative);
        assert.equal(admission.projectWorksiteFailureBasis(prior, capturedCall.occurrence.cCallRef, negative), null);
      }
      const crossedResult = structuredClone(result); crossedResult.payload.valueDigest = `sha256:${"0".repeat(64)}`;
      assert.equal(calculus.projectWorksiteTransitionForResult(crossedResult, prior), null);
      const crossedEvidence = prior.map(event => structuredClone(event));
      crossedEvidence.find(event => event.eventId === evidence.eventId).payload.inputDigest = `sha256:${"0".repeat(64)}`;
      assert.equal(calculus.projectWorksiteTransitionForResult(result, crossedEvidence), null);
      assert.equal(admission.projectWorksiteFailureBasis(prior, capturedCall.occurrence.cCallRef, { kind: "worksite_effect_refusal", schemaVersion: "5.0.0", phase: "post_publication" }), null);
    }
  }
  if (failure && !unadmitted) {
    const reused = await env.leafPort.invoke(capturedCall);
    assert.equal(reused.candidate.disposition, "failure");
    assert.deepEqual(await physicalPath(product, targetPath), targetAfter);
  }
  if (unadmitted && targetAfter.state === "file" && env.input.predecessorObservation.state === "absent") {
    const reused = await env.leafPort.invoke(capturedCall);
    assert.equal(reused.candidate.disposition, "failure");
    assert.equal(reused.candidate.resultCandidate.phase, undefined);
    assert.deepEqual(await physicalPath(product, targetPath), targetAfter);
  }
  const durablePrefix = abg.selectHeldEventStoreDurablePrefix(store);
  const logPath = store.configuredDurableLogPath();
  const fresh = await proveFreshProcessRuntimeProjectionEquality({
    abg, product, installedPackageRoot: env.installedRoot, store,
    requests: [{ rowId: label, owner: "abg", exportName: "projectRuntimeTruthAtDurablePrefix", input: "durable_prefix", args: [opened.scope.runId] }],
  });
  const replay = fresh.retainedRows[0].projection.replayState;
  const expectedCurrent = unadmitted || prepublication ? [env.input.predecessorObservation] : failure ? [] : [ownerOutcome.successorObservation];
  assert.deepEqual(replay.currentWorksiteObservations.map(row => row.observation), expectedCurrent);
  if (!unadmitted) assert.deepEqual(replay.cCalls.find(row => row.cCallRef === capturedCall.occurrence.cCallRef).resultValue, ownerOutcome);
  if (proofRoot) {
    const rawLog = await fsPromises.readFile(logPath);
    assert.equal(product.sha256Bytes(rawLog), fresh.eventLogDigest);
    await fsPromises.writeFile(join(proofRoot, `${label}.events.jsonl.gz`), gzipSync(rawLog));
    const artifactDigest = await product.sha256File(env.artifactPath);
    const artifactName = `candidate-${artifactDigest.slice("sha256:".length)}.tgz`;
    try { await fsPromises.copyFile(env.artifactPath, join(proofRoot, artifactName), fs.constants.COPYFILE_EXCL); }
    catch (error) { if (error.code !== "EEXIST") throw error; }
    await fsPromises.writeFile(join(proofRoot, `${label}.json`), `${JSON.stringify({
      label, modes, replace: options.replace ?? false, negativeMutation: options.reject ?? null,
      artifact: artifactName, artifactDigest, installedRoot: env.installedRoot,
      manifestDigest: product.sha256Canonical(JSON.parse(await fsPromises.readFile(join(env.installedRoot, "product-toolchain-manifest.json"), "utf8"))),
      sourceProductContentDigest: env.verified.productContentDigest, installedBefore, installedAfter,
      authorityBindingBasisDigest: product.sha256Bytes(Buffer.from(coordinatesBefore)),
      ownerOutcome, malformedCopyDigest, completion, targetBefore, targetAfter, stagingAfter, state,
      durablePrefix, rawLogDigest: fresh.eventLogDigest, eventCount: fresh.historicalEventCount,
      freshProcessIds: fresh.freshProcessIds, runId: opened.scope.runId,
      replayStateDigest: product.sha256Canonical(replay), currentObservations: replay.currentWorksiteObservations,
      reopenClaim: "Two real processes reopened the original path and inode before fixture cleanup. Compressed retained bytes are portable event content, not that reopen authority.",
    })}\n`);
  }
}

const cases = [
  ["B04-06 create", { authorizationControls: true }],
  ["B04-06 replace", { replace: true }],
  ["B04-01 cleanup-compensated", { modes: ["staging_cleanup"] }],
  ["B04-01 compensation-failed", { modes: ["staging_cleanup", "compensation_failure"] }],
  ["B04-01 identity-unavailable", { modes: ["staging_cleanup", "compensation_identity"] }],
  ["B04-01 persistent-staging", { modes: ["staging_cleanup", "persistent_cleanup"] }],
  ["B04-01 substituted-staging", { modes: ["staging_cleanup", "substituted_staging"] }],
  ["B04-01 residue-unknown", { modes: ["staging_cleanup", "residue_unknown"] }],
  ["B04-02 link-successor-read", { modes: ["successor_read"] }],
  ["B04-02 rename-successor-read", { replace: true, modes: ["successor_read"] }],
  ["B04-02 successor-mismatch", { modes: ["successor_mismatch"] }],
  ["B04-02 successor-absent", { modes: ["successor_absent"] }],
  ["B04-02 successor-nonfile", { modes: ["successor_nonfile"] }],
  ["B04-03 inventory-read", { modes: ["inventory_read"] }],
  ["B04-03 inventory-mismatch", { modes: ["inventory_mismatch"] }],
  ["B04-03 primary-cause-preserved", { modes: ["staging_cleanup", "inventory_read"] }],
  ["B04-04 owner-read", { modes: ["owner_read"] }],
  ["B04-04 owner-mismatch", { modes: ["owner_mismatch"] }],
  ["B04-05 append-complete", { modes: ["append"] }],
  ["B04-05 append-publication-only", { modes: ["staging_cleanup", "append"] }],
  ["B04-05 append-retained-receipt", { modes: ["inventory_read", "append"] }],
  ["B04-05 result-rejection-complete", { reject: "result" }],
  ["B04-05 evidence-rejection-publication-only", { modes: ["staging_cleanup"], reject: "evidence" }],
  ["B04-05 result-rejection-retained-receipt", { modes: ["inventory_read"], reject: "result" }],
  ["B04-07 stale-O0", { replace: true, modes: ["stale"] }],
  ["B04-07 failed-link", { modes: ["publication_syscall"] }],
  ["B04-07 failed-rename", { replace: true, modes: ["publication_syscall"] }],
  ["B04-C01 link-read-close", { modes: ["successor_read_close"] }],
  ["B04-C01 rename-read-close", { replace: true, modes: ["successor_read_close"] }],
  ["B04-C01 owner-read-close", { modes: ["owner_read_close"] }],
  ["B04-C01 close-only", { modes: ["successor_close"] }],
];
for (const [name, options] of cases) test(`${name}: installed owner, ABG admission and fresh replay`, context => runCase(context, name.replaceAll(" ", "-"), options));
