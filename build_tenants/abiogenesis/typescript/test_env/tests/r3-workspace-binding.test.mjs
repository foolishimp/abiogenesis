import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile, spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import {
  expectedVerificationIdentity,
  readCandidateBasis,
} from "../support/candidate-basis.mjs";
import { acquireNewEmptyAppendSinkFixture } from "../support/new-empty-append-sink.mjs";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const entry212ReopenWorker = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../support/t287-entry212-reopen-worker.mjs",
);

function runEntry212ReopenProbe(input) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [entry212ReopenWorker], {
      env: { ...process.env, NODE_OPTIONS: "" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(
          `Entry212 reopen probe failed ${code}: ${stderr}`,
        ));
        return;
      }
      try {
        resolveResult(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(
          `Entry212 reopen probe returned invalid JSON: ${String(error)}\n${stdout}\n${stderr}`,
        ));
      }
    });
    child.stdin.end(JSON.stringify(input));
  });
}

function artifactBasis(product, operationId, scopeRef, scopeDigest, invocationRef, causationEventRefs = []) {
  const invocationPayloadDigest = product.sha256Canonical({});
  return {
    operationId,
    definitionKey: operationId,
    definitionDigest: product.sha256Canonical({ operationId, schemaVersion: "5.0.0" }),
    authorityScopeRef: scopeRef,
    authorityScopeDigest: scopeDigest,
    invocationRef,
    invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({
      invocationRef,
      operationId,
      payloadDigest: invocationPayloadDigest,
    }),
    correlationId: "correlation://t286/r3",
    eventTime: "2026-07-21T00:00:00.000Z",
    causationEventRefs,
  };
}

function runtimeEventCandidate(event) {
  const candidate = structuredClone(event);
  delete candidate.admissionOrdinal;
  delete candidate.eventId;
  delete candidate.payloadDigest;
  return candidate;
}

test("R3 admits one immutable WorkspaceBinding over the exact ProductSet", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-r3-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, "artifacts");
  await mkdir(artifacts);

  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packResult.filename);
  const bootstrapRoot = join(scratch, "bootstrap");
  await mkdir(bootstrapRoot);
  await execFileAsync("tar", ["-xzf", artifactPath, "-C", bootstrapRoot]);
  const bootstrapPackage = join(bootstrapRoot, "package");
  const bootstrapProduct = await import(
    `${pathToFileURL(join(bootstrapPackage, "build/code/src/product/index.js")).href}?artifact=${Date.now()}`
  );
  const packageJson = JSON.parse(await readFile(join(bootstrapPackage, "package.json"), "utf8"));
  const candidateBasis = await readCandidateBasis(root);
  const verified = await bootstrapProduct.verifyProduct({
    artifactPath,
    artifactRef: basename(artifactPath),
    ...expectedVerificationIdentity(candidateBasis),
  });
  assert.equal(verified.disposition, "verified", JSON.stringify(verified));
  const lock = bootstrapProduct.constructResolvedProductLock([verified]);
  assert.equal(lock.kind, "resolved_product_lock", JSON.stringify(lock));

  const consumerRoot = join(scratch, "consumer");
  const installCandidate = await bootstrapProduct.installProduct({
    artifactPath,
    targetRoot: consumerRoot,
    verifiedArtifact: verified,
    resolvedLock: lock,
  });
  assert.equal(installCandidate.disposition, "materialized", JSON.stringify(installCandidate));

  const installedProduct = await import(
    `${pathToFileURL(join(installCandidate.installedRoot, "build/code/src/product/index.js")).href}?installed=${Date.now()}`
  );
  const installedAbg = await import(
    `${pathToFileURL(join(installCandidate.installedRoot, "build/code/src/abg/index.js")).href}?installed=${Date.now()}`
  );
  const installedEventStore = await import(
    pathToFileURL(join(
      installCandidate.installedRoot,
      "build/code/src/abg/event_store.js",
    )).href
  );
  const acquired = await acquireNewEmptyAppendSinkFixture(
    context,
    installedAbg.createNewEmptyAppendSink,
    "abi5-r3-store-",
  );
  let store = acquired.store;
  assert.equal(typeof store.admit, "undefined");

  const abgExportProbe = await execFileAsync(
    "node",
    [
      "--input-type=module",
      "--eval",
      `
        import * as installedAbg from "@abiogenesis/typescript-tenant/abg";
        let deepImportRefused = false;
        try {
          await import("@abiogenesis/typescript-tenant/build/code/src/abg/event_store.js");
        } catch (error) {
          deepImportRefused = error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED";
        }
        process.stdout.write(JSON.stringify({
          publicConstructorExported: "AbgEventStore" in installedAbg,
          publicAcquisitionType: typeof installedAbg.createNewEmptyAppendSink,
          deepImportRefused
        }));
      `,
    ],
    { cwd: consumerRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  assert.deepEqual(JSON.parse(abgExportProbe.stdout), {
    publicConstructorExported: false,
    publicAcquisitionType: "function",
    deepImportRefused: true,
  });

  const admittedInstallResult = installedAbg.admitProductInstall(
    store,
    installCandidate,
    {
      ...artifactBasis(
        installedProduct,
        "abg.operation.product.install",
        installCandidate.installId,
        installCandidate.productContentDigest,
        "invocation://t286/r3/product-install",
      ),
      predecessorPrefix: acquired.prefix,
    },
    lock,
  );
  assert.equal(
    admittedInstallResult.kind,
    "artifact_owner_result",
    JSON.stringify(admittedInstallResult),
  );
  const admittedInstall = admittedInstallResult.value;

  const productSet = installedProduct.constructProductSet([admittedInstall], lock);
  assert.equal(productSet.kind, "product_set", JSON.stringify(productSet));
  const wrongManifestDigest = `sha256:${"0".repeat(64)}`;
  const mismatchedLock = {
    ...lock,
    rows: [{ ...lock.rows[0], manifestDigest: wrongManifestDigest }],
  };
  const refusedProductSet = installedProduct.constructProductSet(
    [admittedInstall],
    mismatchedLock,
  );
  assert.equal(refusedProductSet.kind, "environment_refusal");
  assert.equal(refusedProductSet.code, "lock_mismatch");

  const workspaceRoot = join(scratch, "workspace");
  await mkdir(workspaceRoot);
  const authorityManifest = {
    workspaceId: "workspace://t286/abi5-root",
    authorityMode: "trusted_developer",
    authorizedActorRef: "actor://abiogenesis/t286/trusted-developer",
    canonicalRoot: workspaceRoot,
  };
  const authority = installedProduct.constructWorkspaceAuthorityBasis({
    ...authorityManifest,
    authorityManifestRef: "manifest://t286/r3/workspace-authority",
    authorityManifestDigest: installedProduct.sha256Canonical(authorityManifest),
  });
  assert.equal(authority.kind, "workspace_authority_basis", JSON.stringify(authority));
  const repeatedAuthority = installedProduct.constructWorkspaceAuthorityBasis({
    ...authorityManifest,
    authorityManifestRef: "manifest://t286/r3/workspace-authority",
    authorityManifestDigest: installedProduct.sha256Canonical(authorityManifest),
  });
  assert.equal(repeatedAuthority.authorityBasisId, authority.authorityBasisId);

  const roots = {
    toolchainRoot: consumerRoot,
    productRoot: installCandidate.installedRoot,
    eventLogRoot: join(workspaceRoot, ".ai-workspace/events"),
    runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
    projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
    archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
  };
  const bindingCandidate = installedProduct.constructWorkspaceBinding(
    authority,
    productSet,
    lock,
    roots,
  );
  assert.equal(bindingCandidate.kind, "workspace_binding_candidate", JSON.stringify(bindingCandidate));
  const repeatedBindingCandidate = installedProduct.constructWorkspaceBinding(
    authority,
    productSet,
    lock,
    roots,
  );
  assert.equal(repeatedBindingCandidate.bindingId, bindingCandidate.bindingId);

  const eventCountBeforeFabricatedBinding = store.readAll().length;
  const fabricatedBindingResult = installedAbg.admitWorkspaceBinding(
    store,
    {
      bindingId: bindingCandidate.bindingId,
      bindingDigest: bindingCandidate.bindingDigest,
    },
    {
      ...artifactBasis(
        installedProduct,
        "abg.operation.workspace.bind",
        bindingCandidate.bindingId,
        bindingCandidate.bindingDigest,
        "invocation://t286/r3/fabricated-workspace-bind",
        [admittedInstall.admissionEventRef],
      ),
      predecessorPrefix: admittedInstallResult.successorPrefix,
    },
    authority,
  );
  assert.equal(fabricatedBindingResult.kind, "artifact_owner_refusal");
  assert.equal(fabricatedBindingResult.refusal.code, "scope_mismatch");
  assert.equal(store.readAll().length, eventCountBeforeFabricatedBinding);

  const impossibleAuthorityBasisId =
    `workspace-authority://abiogenesis/${
      installedProduct.sha256Canonical({ impossible: "authority-witness" })
        .slice("sha256:".length)
    }`;
  const inventedAuthorityBindingCandidate = {
    ...bindingCandidate,
    authorityBasisId: impossibleAuthorityBasisId,
  };
  const inventedAuthorityBindingBody = {
    workspaceId: inventedAuthorityBindingCandidate.workspaceId,
    authorityBasisId: inventedAuthorityBindingCandidate.authorityBasisId,
    authorityBasisDigest: inventedAuthorityBindingCandidate.authorityBasisDigest,
    authorizedActorRef: inventedAuthorityBindingCandidate.authorizedActorRef,
    productSetId: inventedAuthorityBindingCandidate.productSetId,
    productSetDigest: inventedAuthorityBindingCandidate.productSetDigest,
    lockId: inventedAuthorityBindingCandidate.lockId,
    lockDigest: inventedAuthorityBindingCandidate.lockDigest,
    roots: inventedAuthorityBindingCandidate.roots,
  };
  inventedAuthorityBindingCandidate.bindingDigest =
    installedProduct.sha256Canonical(inventedAuthorityBindingBody);
  inventedAuthorityBindingCandidate.bindingId =
    `workspace-binding://abiogenesis/${
      inventedAuthorityBindingCandidate.bindingDigest.slice("sha256:".length)
    }`;
  assert.equal(
    installedProduct.isWorkspaceBindingCandidate(
      inventedAuthorityBindingCandidate,
      lock,
      productSet,
    ),
    true,
    "the impossible authority carrier is otherwise a complete re-digested candidate",
  );
  assert.equal(
    installedProduct.isWorkspaceBindingCandidate(
      inventedAuthorityBindingCandidate,
      lock,
      productSet,
      authority,
    ),
    false,
  );
  const beforeInventedEvents = store.readAll();
  const beforeInventedStoreDigest = store.digest();
  const beforeInventedPrefix = installedAbg.selectHeldEventStoreDurablePrefix(
    store,
  );
  const beforeInventedArtifactTruth =
    installedAbg.projectExactPrefixArtifactTruth(beforeInventedPrefix);
  const eventLogPath = fileURLToPath(beforeInventedPrefix.eventLogRef);
  const beforeInventedBytes = await readFile(eventLogPath);
  const beforeInventedStat = await stat(eventLogPath);
  const beforeInventedByteDigest =
    `sha256:${createHash("sha256").update(beforeInventedBytes).digest("hex")}`;
  const inventedAuthorityResult = installedAbg.admitWorkspaceBinding(
    store,
    inventedAuthorityBindingCandidate,
    {
      ...artifactBasis(
        installedProduct,
        "abg.operation.workspace.bind",
        inventedAuthorityBindingCandidate.bindingId,
        inventedAuthorityBindingCandidate.bindingDigest,
        "invocation://t286/r3/invented-authority-workspace-bind",
        [admittedInstall.admissionEventRef],
      ),
      predecessorPrefix: admittedInstallResult.successorPrefix,
    },
    authority,
  );
  assert.equal(inventedAuthorityResult.kind, "artifact_owner_refusal");
  assert.equal(inventedAuthorityResult.refusal.code, "scope_mismatch");
  assert.deepEqual(inventedAuthorityResult.successorPrefix, beforeInventedPrefix);
  assert.deepEqual(store.readAll(), beforeInventedEvents);
  assert.equal(store.digest(), beforeInventedStoreDigest);
  assert.deepEqual(
    installedAbg.selectHeldEventStoreDurablePrefix(store),
    beforeInventedPrefix,
  );
  const afterInventedBytes = await readFile(eventLogPath);
  const afterInventedStat = await stat(eventLogPath);
  assert.deepEqual(afterInventedBytes, beforeInventedBytes);
  assert.equal(afterInventedStat.size, beforeInventedStat.size);
  assert.equal(
    `sha256:${createHash("sha256").update(afterInventedBytes).digest("hex")}`,
    beforeInventedByteDigest,
  );
  assert.deepEqual(
    installedAbg.projectExactPrefixArtifactTruth(beforeInventedPrefix),
    beforeInventedArtifactTruth,
  );
  const inventedHandoff = store.projectReopenAuthorityAndClose();
  assert.deepEqual(inventedHandoff.prefix, beforeInventedPrefix);
  const inventedFreshProjection = await runEntry212ReopenProbe({
    originProcessId: process.pid,
    installedRoot: installCandidate.installedRoot,
    reopenAuthority: inventedHandoff.reopenAuthority,
    prefix: inventedHandoff.prefix,
  });
  assert.notEqual(inventedFreshProjection.processId, process.pid);
  assert.deepEqual(inventedFreshProjection.events, beforeInventedEvents);
  assert.equal(inventedFreshProjection.storeDigest, beforeInventedStoreDigest);
  assert.deepEqual(inventedFreshProjection.heldPrefix, beforeInventedPrefix);
  assert.deepEqual(
    inventedFreshProjection.artifactTruth,
    beforeInventedArtifactTruth,
  );
  assert.equal(
    inventedFreshProjection.durableByteLength,
    beforeInventedBytes.byteLength,
  );
  assert.equal(
    inventedFreshProjection.durableByteDigest,
    beforeInventedByteDigest,
  );
  const reopenedAfterInvented = installedAbg.reopenEventStore(
    inventedHandoff.reopenAuthority,
    inventedHandoff.prefix,
  );
  assert.equal(
    reopenedAfterInvented.kind,
    "reopened_event_store_context",
    JSON.stringify(reopenedAfterInvented),
  );
  store = reopenedAfterInvented.store;
  context.after(() => reopenedAfterInvented.store.closeDurableLog());

  const workspaceBindingResult = installedAbg.admitWorkspaceBinding(
    store,
    bindingCandidate,
    {
      ...artifactBasis(
        installedProduct,
        "abg.operation.workspace.bind",
        bindingCandidate.bindingId,
        bindingCandidate.bindingDigest,
        "invocation://t286/r3/workspace-bind",
        [admittedInstall.admissionEventRef],
      ),
      predecessorPrefix: admittedInstallResult.successorPrefix,
    },
    authority,
  );
  assert.equal(
    workspaceBindingResult.kind,
    "artifact_owner_result",
    JSON.stringify(workspaceBindingResult),
  );
  const workspaceBinding = workspaceBindingResult.value;
  assert.equal(workspaceBinding.kind, "workspace_binding", JSON.stringify(workspaceBinding));

  const events = store.readAll();
  assert.deepEqual(events.map((event) => event.admissionOrdinal), [1, 2]);
  assert.deepEqual(
    events.map((event) => event.payload.operationId),
    ["abg.operation.product.install", "abg.operation.workspace.bind"],
  );
  assert.equal("observationSnapshot" in workspaceBinding, false);
  assert.equal("replayCursor" in workspaceBinding, false);

  const forgedProductSetDigest = installedProduct.sha256Canonical({
    forged: "causal-product-set",
  });
  const forgedBindingCandidate = {
    ...bindingCandidate,
    productSetId:
      `product-set://abiogenesis/${forgedProductSetDigest.slice("sha256:".length)}`,
    productSetDigest: forgedProductSetDigest,
  };
  const forgedBindingBody = {
    workspaceId: forgedBindingCandidate.workspaceId,
    authorityBasisId: forgedBindingCandidate.authorityBasisId,
    authorityBasisDigest: forgedBindingCandidate.authorityBasisDigest,
    authorizedActorRef: forgedBindingCandidate.authorizedActorRef,
    productSetId: forgedBindingCandidate.productSetId,
    productSetDigest: forgedBindingCandidate.productSetDigest,
    lockId: forgedBindingCandidate.lockId,
    lockDigest: forgedBindingCandidate.lockDigest,
    roots: forgedBindingCandidate.roots,
  };
  forgedBindingCandidate.bindingDigest =
    installedProduct.sha256Canonical(forgedBindingBody);
  forgedBindingCandidate.bindingId =
    `workspace-binding://abiogenesis/${
      forgedBindingCandidate.bindingDigest.slice("sha256:".length)
    }`;
  assert.equal(
    installedProduct.isWorkspaceBindingCandidate(
      forgedBindingCandidate,
      lock,
    ),
    true,
  );
  assert.equal(
    installedProduct.isWorkspaceBindingCandidate(
      forgedBindingCandidate,
      lock,
      productSet,
    ),
    false,
  );
  const forgedBindingEventCandidate = runtimeEventCandidate(events[1]);
  forgedBindingEventCandidate.aggregateId = forgedBindingCandidate.bindingId;
  forgedBindingEventCandidate.basisId = forgedBindingCandidate.bindingId;
  Object.assign(forgedBindingEventCandidate.payload, {
    artifact: forgedBindingCandidate,
    artifactDigest: forgedBindingCandidate.bindingDigest,
    artifactRef: forgedBindingCandidate.bindingId,
    authorityScopeDigest: forgedBindingCandidate.bindingDigest,
    authorityScopeRef: forgedBindingCandidate.bindingId,
  });
  const forgedBindingEvent =
    installedEventStore.projectRuntimeEventFromValidatedHistory(
      [events[0]],
      forgedBindingEventCandidate,
    );
  const forgedBindingPrefix = installedAbg.selectValidatedRuntimeEventPrefix(
    Object.freeze([events[0], forgedBindingEvent]),
  );
  const forgedBindingQueryRefs = [
    forgedBindingEvent.payload.invocationRef,
    "invocation://t286/r3/forged-workspace-bind/unrelated",
  ];
  const forgedBindingTruth = forgedBindingQueryRefs.map((queryRef) =>
    installedAbg.projectEffectfulPublicInvocationTruthAtPrefix(
      forgedBindingPrefix,
      queryRef,
    )
  );
  for (const truth of forgedBindingTruth) {
    assert.equal(truth.disposition, "invalid_history", JSON.stringify(truth));
    assert.equal(truth.code, "artifact_truth_invalid");
  }

  const forgedAuthorityEventCandidate = runtimeEventCandidate(events[1]);
  forgedAuthorityEventCandidate.aggregateId =
    inventedAuthorityBindingCandidate.bindingId;
  forgedAuthorityEventCandidate.basisId =
    inventedAuthorityBindingCandidate.bindingId;
  Object.assign(forgedAuthorityEventCandidate.payload, {
    artifact: inventedAuthorityBindingCandidate,
    artifactDigest: inventedAuthorityBindingCandidate.bindingDigest,
    artifactRef: inventedAuthorityBindingCandidate.bindingId,
    authorityScopeDigest: inventedAuthorityBindingCandidate.bindingDigest,
    authorityScopeRef: inventedAuthorityBindingCandidate.bindingId,
  });
  const forgedAuthorityEvent =
    installedEventStore.projectRuntimeEventFromValidatedHistory(
      [events[0]],
      forgedAuthorityEventCandidate,
    );
  const forgedAuthorityPrefix = installedAbg.selectValidatedRuntimeEventPrefix(
    Object.freeze([events[0], forgedAuthorityEvent]),
  );
  for (const queryRef of [
    forgedAuthorityEvent.payload.invocationRef,
    "invocation://t286/r3/forged-authority-workspace-bind/unrelated",
  ]) {
    const truth = installedAbg.projectEffectfulPublicInvocationTruthAtPrefix(
      forgedAuthorityPrefix,
      queryRef,
    );
    assert.equal(truth.disposition, "invalid_history", JSON.stringify(truth));
    assert.equal(truth.code, "artifact_truth_invalid");
  }

  const eventCountBeforeMutation = store.readAll().length;
  const refused = installedAbg.admitWorkspaceBinding(
    store,
    bindingCandidate,
    {
      ...artifactBasis(
        installedProduct,
        "abg.operation.workspace.bind",
        "workspace-binding://wrong",
        bindingCandidate.bindingDigest,
        "invocation://t286/r3/workspace-bind-mismatch",
      ),
      predecessorPrefix: workspaceBindingResult.successorPrefix,
    },
    authority,
  );
  assert.equal(refused.disposition, "refused");
  assert.equal(refused.kind, "artifact_owner_refusal");
  assert.equal(refused.refusal.code, "scope_mismatch");
  assert.equal(store.readAll().length, eventCountBeforeMutation);

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r3.json"),
    `${JSON.stringify(
      {
        kind: "abi5_root_obligation_evidence",
        schemaVersion: "5.0.0",
        bindingId: "ABI5-ROOT-001",
        obligation: "R3_workspace_bound_to_exact_product_set",
        result: "satisfied",
        sourceImportUsed: false,
        artifactDigest: verified.artifactDigest,
        installId: admittedInstall.installId,
        lockId: lock.lockId,
        lockDigest: lock.lockDigest,
        productSetId: productSet.productSetId,
        productSetDigest: productSet.productSetDigest,
        workspaceAuthorityBasisId: authority.authorityBasisId,
        workspaceBindingId: workspaceBinding.bindingId,
        workspaceBindingDigest: workspaceBinding.bindingDigest,
        eventStoreDigest: store.digest(),
        eventKinds: events.map((event) => event.kind),
        admissionOrdinals: events.map((event) => event.admissionOrdinal),
        mutation: {
          condition: "workspace admission carries a different authority scope ref",
          expectedRefusal: "scope_mismatch",
          observedRefusal: refused.refusal.code,
          eventCountUnchanged: store.readAll().length === eventCountBeforeMutation,
        },
        historyMaskingMutation: {
          condition:
            "one mechanically valid binding row names a self-consistent but causally different ProductSet",
          candidateValidWithoutCausalProductSet:
            installedProduct.isWorkspaceBindingCandidate(
              forgedBindingCandidate,
              lock,
            ),
          candidateValidWithCausalProductSet:
            installedProduct.isWorkspaceBindingCandidate(
              forgedBindingCandidate,
              lock,
              productSet,
            ),
          queryRefs: forgedBindingQueryRefs,
          dispositions: forgedBindingTruth.map((truth) => truth.disposition),
          codes: forgedBindingTruth.map((truth) => truth.code),
        },
        authorityBoundary: {
          publicConstructorExported: false,
          publicAcquisitionType: "function",
          deepEventStoreImportRefused: true,
          mismatchedLockRefusal: refusedProductSet.code,
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
});
