import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, mkdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  constructClosedCatalogReadinessBasis,
  importInstalledPackageExport,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const packageRoot = new URL("../..", import.meta.url).pathname;
const workerPath = resolve(
  packageRoot,
  "test_env/support/t287-setup-invocation-authority-worker.mjs",
);

function invocation(operationId, variant, invocationRef, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId,
    variant,
    invocationRef,
    eventTime: "2026-08-09T00:00:00.000Z",
    correlationId: "correlation://t287/setup-invocation-authority",
    payload,
  };
}

function expectedVerificationIdentity(basis) {
  return {
    expectedArtifactDigest: basis.artifactDigest,
    expectedProductContentDigest: basis.productContentDigest,
    expectedManifestDigest: basis.manifestDigest,
    expectedProductId: basis.productId,
    expectedPackageName: basis.packageName,
    expectedPackageVersion: basis.packageVersion,
  };
}

function runWorker(input) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [workerPath], {
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
          `setup/invocation worker failed ${code}: ${stderr}\n${stdout}`,
        ));
        return;
      }
      try {
        resolveResult(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(
          `setup/invocation worker returned invalid JSON: ${String(error)}\n${stdout}\n${stderr}`,
        ));
      }
    });
    child.stdin.end(JSON.stringify({ originProcessId: process.pid, ...input }));
  });
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function duplicateCoordinates(outcome) {
  return {
    operationId: outcome.result.priorOperationId,
    publicInvocationRef: outcome.result.priorPublicInvocationRef,
    ownerInvocationRef: outcome.result.priorOwnerInvocationRef,
    ownerInvocationDigest: outcome.result.priorOwnerInvocationDigest,
    publicOperationEventRef: outcome.result.priorPublicOperationEventRef,
    admissionEventRef: outcome.result.priorAdmissionEventRef,
  };
}

function assertTypedDuplicate(outcome, expectedPriorAdmission) {
  assert.equal(outcome.disposition, "refused", JSON.stringify(outcome));
  assert.equal(outcome.result.code, "duplicate_invocation");
  const actual = duplicateCoordinates(outcome);
  assert.deepEqual(actual, expectedPriorAdmission);
  return actual;
}

function runtimeEventCandidate(event) {
  const {
    admissionOrdinal: _admissionOrdinal,
    eventId: _eventId,
    payloadDigest: _payloadDigest,
    ...candidate
  } = structuredClone(event);
  return candidate;
}

test("T-287 complete setup and invocation authority reconstructs without process-local carriers", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `t287-setup-authority=${Date.now()}`,
  );
  const installedAbg = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/abg",
    `t287-setup-authority=${Date.now()}`,
  );
  const verified = await harness.product.verifyProduct({
    artifactPath: harness.artifactPath,
    artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis),
  });
  assert.equal(verified.kind, "verified_product_artifact", JSON.stringify(verified));
  const lock = harness.product.constructResolvedProductLock([verified]);
  assert.equal(lock.kind, "resolved_product_lock", JSON.stringify(lock));

  const verifyRequest = invocation(
    "abg.operation.product.verify",
    "artifact",
    "invocation://t287/setup-authority/verify",
    {
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis),
    },
  );
  const resolveRequest = invocation(
    "abg.operation.product.resolve",
    "verified_product_set",
    "invocation://t287/setup-authority/resolve",
    {
      verifiedProductInputs: [{
        artifactPath: harness.artifactPath,
        verifiedProduct: JSON.parse(JSON.stringify(verified)),
      }],
    },
  );
  const retainedContext = installedPublic.createRootOperationContext(
    join(harness.scratch, "retained-pure.events.jsonl"),
  );
  const retainedVerify = await installedPublic.applyRootPublicInvocation(
    retainedContext,
    verifyRequest,
  );
  const retainedVerifyRepeat = await installedPublic.applyRootPublicInvocation(
    retainedContext,
    verifyRequest,
  );
  const retainedResolve = await installedPublic.applyRootPublicInvocation(
    retainedContext,
    resolveRequest,
  );
  const retainedResolveRepeat = await installedPublic.applyRootPublicInvocation(
    retainedContext,
    resolveRequest,
  );
  assert.equal(retainedVerify.disposition, "succeeded", JSON.stringify(retainedVerify));
  assert.equal(retainedResolve.disposition, "succeeded", JSON.stringify(retainedResolve));
  assert.deepEqual(retainedVerifyRepeat, retainedVerify);
  assert.deepEqual(retainedResolveRepeat, retainedResolve);
  assert.deepEqual(retainedResolve.result, lock);
  assert.deepEqual(retainedContext.store.readAll(), []);

  const carrierMutations = [
    ["artifactDigest", (value) => { value.artifactDigest = `sha256:${"1".repeat(64)}`; }],
    ["productContentDigest", (value) => { value.productContentDigest = `sha256:${"2".repeat(64)}`; }],
    ["manifestDigest", (value) => { value.manifestDigest = `sha256:${"3".repeat(64)}`; }],
    ["productId", (value) => { value.productId += "/substituted"; }],
    ["packageName", (value) => { value.packageName = "@substituted/product"; }],
    ["packageVersion", (value) => { value.packageVersion = "999.0.0"; }],
    ["verificationDigest", (value) => { value.verificationDigest = `sha256:${"4".repeat(64)}`; }],
    ["verificationRef", (value) => { value.verificationRef += "/substituted"; }],
    ["contributionManifestDigest", (value) => {
      value.contributionManifestDigest = `sha256:${"5".repeat(64)}`;
    }],
    ["catalogDigest", (value) => { value.catalogDigest = `sha256:${"6".repeat(64)}`; }],
  ];
  for (const [label, mutate] of carrierMutations) {
    const request = structuredClone(resolveRequest);
    request.invocationRef += `/${label}`;
    mutate(request.payload.verifiedProductInputs[0].verifiedProduct);
    const outcome = await installedPublic.applyRootPublicInvocation(
      retainedContext,
      request,
    );
    assert.equal(outcome.disposition, "refused", `${label}: ${JSON.stringify(outcome)}`);
    assert.equal(outcome.result.code, "target_mismatch", label);
  }
  const selfConsistentSubstitution = structuredClone(resolveRequest);
  selfConsistentSubstitution.invocationRef += "/self-consistent-full-carrier";
  const forgedCarrier =
    selfConsistentSubstitution.payload.verifiedProductInputs[0].verifiedProduct;
  forgedCarrier.checkedPayloadFiles += 1;
  const {
    verificationDigest: _verificationDigest,
    verificationRef: _verificationRef,
    ...forgedBody
  } = forgedCarrier;
  forgedCarrier.verificationDigest = harness.product.sha256Canonical(forgedBody);
  forgedCarrier.verificationRef =
    `product-verification://abiogenesis/${forgedCarrier.verificationDigest.slice("sha256:".length)}`;
  assert.equal(harness.product.isVerifiedProductArtifact(forgedCarrier), true);
  const selfConsistentRefusal = await installedPublic.applyRootPublicInvocation(
    retainedContext,
    selfConsistentSubstitution,
  );
  assert.equal(selfConsistentRefusal.disposition, "refused");
  assert.equal(selfConsistentRefusal.result.code, "target_mismatch");
  assert.deepEqual(retainedContext.store.readAll(), []);
  installedPublic.closeRootOperationContext(retainedContext);

  const freshPure = await runWorker({
    action: "pure_verify_resolve",
    installedPackageRoot: harness.installedPackageRoot,
    eventLogPath: join(harness.scratch, "fresh-pure.events.jsonl"),
    verifyRequest,
    resolveRequest,
  });
  assert.notEqual(freshPure.processId, process.pid);
  assert.equal(freshPure.eventCount, 0);
  assert.deepEqual(freshPure.verifyFirst, retainedVerify);
  assert.deepEqual(freshPure.verifySecond, retainedVerify);
  assert.deepEqual(freshPure.resolveFirst, retainedResolve);
  assert.deepEqual(freshPure.resolveSecond, retainedResolve);
  assert.equal(freshPure.handoff.prefix.prefixLength, 0);

  const scenario = await buildRootCliScenario(
    harness,
    "t287-setup-invocation-authority",
    (payload) => payload,
    { catalogApplications: [] },
  );
  assert.equal(
    scenario.setupOutcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
    JSON.stringify(scenario.setupOutcomes),
  );
  const setupHandoff = scenario.transcript.at(-1).payload.runtimePrefixAuthority;
  const setupBytes = await readFile(scenario.eventLogPath);
  const installRequest = scenario.transcript[2];
  const setupTruth = installedAbg.projectExactPrefixArtifactTruth(
    setupHandoff.prefix,
  );
  assert.equal(setupTruth.kind, "exact_prefix_artifact_truth_projection");
  const exactInstallFact = setupTruth.rows.find((row) =>
    row.operationId === "abg.operation.product.install" &&
    row.invocationRef === installRequest.invocationRef
  );
  assert.ok(exactInstallFact, "setup prefix contains one exact install fact");
  const exactInstallPriorAdmission = {
    operationId: exactInstallFact.operationId,
    publicInvocationRef: exactInstallFact.invocationRef,
    ownerInvocationRef: exactInstallFact.invocationRef,
    ownerInvocationDigest: exactInstallFact.invocationDigest,
    publicOperationEventRef: exactInstallFact.admissionEventRef,
    admissionEventRef: exactInstallFact.admissionEventRef,
  };

  const retainedDuplicateContext =
    installedPublic.reopenRootOperationContext(setupHandoff);
  const retainedDuplicate = await installedPublic.applyRootPublicInvocation(
    retainedDuplicateContext,
    installRequest,
  );
  const retainedDuplicateHandoff =
    installedPublic.projectRootOperationContextAuthority(retainedDuplicateContext);
  const retainedDuplicateCoordinates = assertTypedDuplicate(
    retainedDuplicate,
    exactInstallPriorAdmission,
  );
  assert.deepEqual(retainedDuplicateHandoff, setupHandoff);
  assert.deepEqual(await readFile(scenario.eventLogPath), setupBytes);

  const freshDuplicate = await runWorker({
    action: "apply_at_handoff",
    installedPackageRoot: harness.installedPackageRoot,
    handoff: setupHandoff,
    request: installRequest,
  });
  const freshDuplicateCoordinates = assertTypedDuplicate(
    freshDuplicate.outcome,
    exactInstallPriorAdmission,
  );
  assert.equal(freshDuplicate.eventCount, freshDuplicate.beforeEventCount);
  assert.deepEqual(freshDuplicate.handoff, setupHandoff);
  assert.deepEqual(await readFile(scenario.eventLogPath), setupBytes);

  const changedTarget = join(harness.scratch, "duplicate-must-not-install");
  const changedPayload = structuredClone(installRequest);
  changedPayload.payload.targetRoot = changedTarget;
  const changedDuplicate = await runWorker({
    action: "apply_at_handoff",
    installedPackageRoot: harness.installedPackageRoot,
    handoff: setupHandoff,
    request: changedPayload,
  });
  const changedDuplicateCoordinates = assertTypedDuplicate(
    changedDuplicate.outcome,
    exactInstallPriorAdmission,
  );
  assert.equal(await pathExists(changedTarget), false);
  assert.deepEqual(await readFile(scenario.eventLogPath), setupBytes);

  const crossKindRun = structuredClone(scenario.transcript.at(-1));
  crossKindRun.invocationRef = installRequest.invocationRef;
  const crossKindDuplicate = await runWorker({
    action: "apply_at_handoff",
    installedPackageRoot: harness.installedPackageRoot,
    handoff: setupHandoff,
    request: crossKindRun,
  });
  const crossKindDuplicateCoordinates = assertTypedDuplicate(
    crossKindDuplicate.outcome,
    exactInstallPriorAdmission,
  );
  assert.deepEqual(freshDuplicateCoordinates, retainedDuplicateCoordinates);
  assert.deepEqual(changedDuplicateCoordinates, retainedDuplicateCoordinates);
  assert.deepEqual(crossKindDuplicateCoordinates, retainedDuplicateCoordinates);
  assert.deepEqual(await readFile(scenario.eventLogPath), setupBytes);

  const freshInstallContext = installedPublic.createRootOperationContext(
    join(harness.scratch, "fresh-bind.events.jsonl"),
  );
  const freshInstallTarget = join(harness.scratch, "fresh-bind-product");
  const freshInstallRequest = structuredClone(installRequest);
  freshInstallRequest.invocationRef =
    "invocation://t287/setup-authority/fresh-install";
  freshInstallRequest.payload.targetRoot = freshInstallTarget;
  const freshInstall = await installedPublic.applyRootPublicInvocation(
    freshInstallContext,
    freshInstallRequest,
  );
  assert.equal(freshInstall.disposition, "succeeded", JSON.stringify(freshInstall));
  const installOnlyHandoff =
    installedPublic.projectRootOperationContextAuthority(freshInstallContext);
  assert.equal(installOnlyHandoff.prefix.prefixLength > 0, true);

  const freshWorkspaceRoot = join(harness.scratch, "fresh-bind-workspace");
  await mkdir(freshWorkspaceRoot, { recursive: true });
  const freshInstalledRoot = join(
    freshInstallTarget,
    "node_modules",
    "@abiogenesis",
    "typescript-tenant",
  );
  const freshRoots = {
    toolchainRoot: freshInstallTarget,
    productRoot: freshInstalledRoot,
    eventLogRoot: join(freshWorkspaceRoot, ".ai-workspace/events"),
    runtimeStateRoot: join(freshWorkspaceRoot, ".ai-workspace/runtime"),
    projectionRoot: join(freshWorkspaceRoot, ".ai-workspace/projections"),
    archiveRoot: join(freshWorkspaceRoot, ".ai-workspace/archive"),
  };
  const freshBindRequest = invocation(
    "abg.operation.workspace.bind",
    "exact_product_set",
    "invocation://t287/setup-authority/fresh-bind",
    {
      installInvocationRef: freshInstallRequest.invocationRef,
      workspaceId: "workspace://t287/setup-authority/fresh-bind",
      canonicalRoot: freshWorkspaceRoot,
      authorizedActorRef: "actor://abiogenesis/t287/trusted-developer",
      authorityManifestRef:
        "manifest://t287/setup-authority/fresh-bind-authority",
      roots: freshRoots,
    },
  );
  const freshBind = await runWorker({
    action: "apply_at_handoff",
    installedPackageRoot: harness.installedPackageRoot,
    handoff: installOnlyHandoff,
    request: freshBindRequest,
  });
  assert.equal(freshBind.outcome.disposition, "succeeded", JSON.stringify(freshBind));
  assert.equal(freshBind.eventCount, freshBind.beforeEventCount + 1);
  const freshTruth = installedAbg.projectExactPrefixArtifactTruth(
    freshBind.handoff.prefix,
  );
  assert.equal(freshTruth.kind, "exact_prefix_artifact_truth_projection");
  assert.equal(freshTruth.rows.length, 2);
  const projectedFreshInstall =
    installedAbg.projectAdmittedProductInstallByInvocationRef(
      freshTruth,
      freshInstallRequest.invocationRef,
    );
  assert.ok(projectedFreshInstall, "fresh prefix rehydrates its exact install");
  const projectedFreshBinding =
    installedAbg.projectAdmittedWorkspaceBindingByInvocationRef(
      freshTruth,
      freshBindRequest.invocationRef,
      lock,
    );
  assert.ok(projectedFreshBinding, "fresh prefix rehydrates its exact binding");
  const canonical = (value) =>
    harness.product.canonicalJson(value);
  assert.equal(canonical(projectedFreshInstall.install), canonical(freshInstall.result));
  assert.equal(canonical(projectedFreshInstall.resolvedLock), canonical(lock));
  assert.equal(
    canonical(projectedFreshBinding.binding),
    canonical(freshBind.outcome.result),
  );

  const crossedBind = await runWorker({
    action: "apply_at_handoff",
    installedPackageRoot: harness.installedPackageRoot,
    handoff: setupHandoff,
    request: freshBindRequest,
  });
  assert.equal(crossedBind.outcome.disposition, "refused");
  assert.equal(crossedBind.outcome.result.code, "missing_prerequisite");
  assert.deepEqual(crossedBind.handoff, setupHandoff);
  assert.deepEqual(await readFile(scenario.eventLogPath), setupBytes);

  const readinessBasis = constructClosedCatalogReadinessBasis({
    abg: installedAbg,
    artifactTruth: freshTruth,
    verifiedProducts: [verified],
    resolvedLock: lock,
    installInvocationRefs: [freshInstallRequest.invocationRef],
    workspaceBindingInvocationRef: freshBindRequest.invocationRef,
    publications: [harness.rootPublication],
  });
  assert.equal(
    canonical(projectedFreshInstall.candidate),
    canonical(readinessBasis.installedProducts[0]),
  );
  assert.equal(
    canonical(projectedFreshBinding.candidate),
    canonical(readinessBasis.workspaceBinding),
  );
  const changedPublicationBasis = structuredClone(readinessBasis);
  changedPublicationBasis.publications[0].productSemanticsBinding.bindingRef +=
    "/substituted-meaning";
  const changedPublicationCatalog =
    harness.product.admitGraphFunctionCatalog(changedPublicationBasis);
  assert.equal(changedPublicationCatalog.kind, "graph_function_catalog");
  assert.equal(changedPublicationCatalog.entries.length, 0);
  assert.equal(
    changedPublicationCatalog.rowDispositions.every((row) =>
      row.disposition === "rejected" &&
      row.reason === "publication_identity_mismatch"
    ),
    true,
  );
  const catalogRequest = invocation(
    "abg.operation.catalog.admit",
    "module_publication",
    "invocation://t287/setup-authority/fresh-catalog",
    { readinessBasis },
  );
  const catalogContext = installedPublic.createRootOperationContext(
    join(harness.scratch, "fresh-catalog-pure.events.jsonl"),
  );
  const freshCatalog = await installedPublic.applyRootPublicInvocation(
    catalogContext,
    catalogRequest,
  );
  assert.equal(freshCatalog.disposition, "succeeded", JSON.stringify(freshCatalog));
  assert.deepEqual(catalogContext.store.readAll(), []);
  installedPublic.closeRootOperationContext(catalogContext);

  const freshRun = await runWorker({
    action: "apply_transcript_at_handoff",
    installedPackageRoot: harness.installedPackageRoot,
    handoff: setupHandoff,
    requests: scenario.executionTranscript,
  });
  assert.equal(
    freshRun.outcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
    JSON.stringify(freshRun.outcomes),
  );
  assert.equal(freshRun.eventCount > freshRun.beforeEventCount + 2, true);

  const eventStoreApi = await import(
    `${pathToFileURL(join(
      harness.installedPackageRoot,
      "build/code/src/abg/event_store.js",
    )).href}?t287-atomic=${Date.now()}`
  );
  const reopened = eventStoreApi.reopenEventStore(
    freshRun.handoff.reopenAuthority,
  );
  assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
  const events = reopened.store.readAll();
  const runOwner = events.find((event) =>
    event.kind === "invocation_admitted" &&
    event.payload.publicRequestInvocationRef === scenario.refs.run
  );
  assert.ok(runOwner, "fresh run admits one exact invocation owner event");
  const runPublic = events.find((event) =>
    event.kind === "public_operation_admitted" &&
    event.eventId === runOwner.causationEventRefs[0]
  );
  assert.ok(runPublic, "fresh run admits the causal Public operation event");
  const durablePath = fileURLToPath(freshRun.handoff.prefix.eventLogRef);
  const beforeRollbackBytes = await readFile(durablePath);
  const beforeRollbackEvents = reopened.store.readAll();
  const beforeRollbackDigest = reopened.store.digest();
  let stagedPublicEvent = null;
  assert.throws(
    () => eventStoreApi.admitRuntimeEventTransactionAtExpectedPrefix(
      reopened.store,
      beforeRollbackDigest,
      () => {
        stagedPublicEvent = eventStoreApi.admitRuntimeEvent(
          reopened.store,
          {
            ...runtimeEventCandidate(runPublic),
            correlationId:
              "correlation://t287/setup-authority/atomic-rollback",
          },
        );
        eventStoreApi.admitRuntimeEvent(reopened.store, {
          ...runtimeEventCandidate(runOwner),
          causationEventRefs: [stagedPublicEvent.eventId],
          correlationId:
            "correlation://t287/setup-authority/atomic-rollback",
          payload: {},
        });
      },
    ),
    /payload/u,
  );
  assert.equal(stagedPublicEvent?.kind, "public_operation_admitted");
  assert.deepEqual(reopened.store.readAll(), beforeRollbackEvents);
  assert.equal(reopened.store.digest(), beforeRollbackDigest);
  assert.deepEqual(await readFile(durablePath), beforeRollbackBytes);
  reopened.store.closeDurableLog();
});
