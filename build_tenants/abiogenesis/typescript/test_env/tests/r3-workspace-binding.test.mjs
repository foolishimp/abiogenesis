import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import {
  expectedVerificationIdentity,
  readCandidateBasis,
} from "../support/candidate-basis.mjs";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

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

  const consumerRoot = join(scratch, "consumer");
  const installCandidate = await bootstrapProduct.installProduct({
    artifactPath,
    targetRoot: consumerRoot,
    verifiedArtifact: verified,
  });
  assert.equal(installCandidate.disposition, "materialized", JSON.stringify(installCandidate));

  const installedProduct = await import(
    `${pathToFileURL(join(installCandidate.installedRoot, "build/code/src/product/index.js")).href}?installed=${Date.now()}`
  );
  const installedAbg = await import(
    `${pathToFileURL(join(installCandidate.installedRoot, "build/code/src/abg/index.js")).href}?installed=${Date.now()}`
  );
  const store = new installedAbg.AbgEventStore();
  assert.equal(typeof store.admit, "undefined");

  const abgExportProbe = await execFileAsync(
    "node",
    [
      "--input-type=module",
      "--eval",
      `
        import { AbgEventStore } from "@abiogenesis/typescript-tenant/abg";
        const store = new AbgEventStore();
        let deepImportRefused = false;
        try {
          await import("@abiogenesis/typescript-tenant/build/code/src/abg/event_store.js");
        } catch (error) {
          deepImportRefused = error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED";
        }
        process.stdout.write(JSON.stringify({
          publicAppendType: typeof store.admit,
          deepImportRefused
        }));
      `,
    ],
    { cwd: consumerRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  assert.deepEqual(JSON.parse(abgExportProbe.stdout), {
    publicAppendType: "undefined",
    deepImportRefused: true,
  });

  const admittedInstall = installedAbg.admitProductInstall(
    store,
    installCandidate,
    artifactBasis(
      installedProduct,
      "abg.operation.product.install",
      installCandidate.installId,
      installCandidate.productContentDigest,
      "invocation://t286/r3/product-install",
    ),
  );
  assert.equal(admittedInstall.kind, "product_install", JSON.stringify(admittedInstall));

  const lock = installedProduct.constructResolvedProductLock([admittedInstall]);
  assert.equal(lock.kind, "resolved_product_lock", JSON.stringify(lock));
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

  const workspaceBinding = installedAbg.admitWorkspaceBinding(
    store,
    bindingCandidate,
    artifactBasis(
      installedProduct,
      "abg.operation.workspace.bind",
      bindingCandidate.bindingId,
      bindingCandidate.bindingDigest,
      "invocation://t286/r3/workspace-bind",
      [admittedInstall.admissionEventRef],
    ),
  );
  assert.equal(workspaceBinding.kind, "workspace_binding", JSON.stringify(workspaceBinding));

  const events = store.readAll();
  assert.deepEqual(events.map((event) => event.admissionOrdinal), [1, 2]);
  assert.deepEqual(
    events.map((event) => event.payload.operationId),
    ["abg.operation.product.install", "abg.operation.workspace.bind"],
  );
  assert.equal("observationSnapshot" in workspaceBinding, false);
  assert.equal("replayCursor" in workspaceBinding, false);

  const eventCountBeforeMutation = store.readAll().length;
  const refused = installedAbg.admitWorkspaceBinding(
    store,
    bindingCandidate,
    artifactBasis(
      installedProduct,
      "abg.operation.workspace.bind",
      "workspace-binding://wrong",
      bindingCandidate.bindingDigest,
      "invocation://t286/r3/workspace-bind-mismatch",
    ),
  );
  assert.equal(refused.disposition, "refused");
  assert.equal(refused.code, "scope_mismatch");
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
          observedRefusal: refused.code,
          eventCountUnchanged: store.readAll().length === eventCountBeforeMutation,
        },
        authorityBoundary: {
          publicAppendType: "undefined",
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
