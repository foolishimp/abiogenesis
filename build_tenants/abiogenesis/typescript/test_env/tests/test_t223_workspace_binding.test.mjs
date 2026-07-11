// Validates: T-223 DS-1 workspace and toolchain-binding slice
// Validates: REQ-P-INSTALL-049..055, REQ-P-INSTALL-059..060

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import {
  TOOLCHAIN_BINDING_RELATIVE_PATH,
  WORKSPACE_MANIFEST_RELATIVE_PATH,
  admitCatalogBindRequest,
  canonicalizeIJson,
  catalogBind,
  digestCanonicalIJson,
  resolvedProductLockId,
  resolveInstallToolchainRoot,
  workspaceCreate,
  workspaceOpen
} from "../../build/semantic/code/src/app/m04/index.js";

function digest(label) {
  return digestCanonicalIJson({ label });
}

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function workspacePathContext(targetRoot) {
  return {
    kind: "workspace_path",
    targetRoot,
    effects: {
      async readBytes(path) {
        try {
          return new Uint8Array(await readFile(path));
        } catch (error) {
          if (error?.code === "ENOENT") {
            return null;
          }
          throw error;
        }
      },
      async writeBytes(path, bytes) {
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, bytes);
      },
      async makeDirectory(path) {
        await mkdir(path, { recursive: true });
      }
    }
  };
}

async function createWorkspace(targetRoot) {
  const result = await workspaceCreate(
    {
      targetRoot,
      authorityMode: "clean_no_project_authority"
    },
    workspacePathContext(targetRoot),
    {
      actorRef: "actor://t223/test",
      provenanceRefs: ["proof://t223/workspace-create"]
    }
  );
  assert.equal(result.kind, "accepted");
  assert.equal(result.disposition, "created");
  return result.value;
}

function installedProductRecord(input) {
  const productRoot = join(
    input.toolchainRoot,
    "products",
    input.productId,
    input.version
  );
  const recordRoot = join(
    input.toolchainRoot,
    "records",
    input.publisher,
    input.productId,
    input.version,
    digest(input.productId).slice("sha256:".length)
  );
  return Object.freeze({
    kind: "installed_product_record",
    schemaVersion: 1,
    installedProductId: `installed://${input.publisher}/${input.productId}/${input.version}`,
    publisher: input.publisher,
    productId: input.productId,
    packageName: input.packageName,
    version: input.version,
    artifactDigest: digest(`${input.productId}:artifact`),
    productContentDigest: digest(`${input.productId}:content`),
    installedRoot: productRoot,
    productRoot,
    packageRoot: join(productRoot, "package"),
    manifestPath: join(productRoot, "product-toolchain-manifest.json"),
    manifestDigest: digest(`${input.productId}:manifest`),
    descriptorId: `descriptor://${input.publisher}/${input.productId}/${input.version}`,
    descriptorDigest: digest(`${input.productId}:descriptor`),
    contributionId: `contribution://${input.publisher}/${input.productId}/${input.version}`,
    contributionDigest: digest(`${input.productId}:contribution`),
    compatibilityRange: input.compatibilityRange,
    compatibility: Object.freeze({
      productId: input.productId,
      compatible: true,
      reason: null
    }),
    commandRefs: Object.freeze([`command://${input.productId}/abg.cli`]),
    publicContractCatalogId: `contract-catalog://${input.productId}`,
    publicContractCatalogVersion: input.version,
    publicContractCatalogDigest: digest(`${input.productId}:contracts`),
    descriptorRecordPath: join(recordRoot, "product-descriptor.json"),
    contributionRecordPath: join(recordRoot, "contribution-manifest.json"),
    lockRecordPath: join(recordRoot, "resolved-product-lock.json"),
    provenanceRefs: Object.freeze([`proof://t223/install/${input.productId}`])
  });
}

function resolvedLock(records) {
  const identityBasis = Object.freeze({
    requirements: Object.freeze(
      records.map((record) =>
        Object.freeze({
          productId: record.productId,
          versionConstraint: record.version,
          requiredContractRefs: Object.freeze([]),
          requiredCapabilityRefs: Object.freeze([])
        })
      )
    ),
    products: Object.freeze(
      records.map((record) =>
        Object.freeze({
          publisher: record.publisher,
          productId: record.productId,
          version: record.version,
          descriptorId: record.descriptorId,
          descriptorDigest: record.descriptorDigest,
          contributionId: record.contributionId,
          contributionDigest: record.contributionDigest,
          artifactDigest: record.artifactDigest,
          productContentDigest: record.productContentDigest
        })
      )
    ),
    dependencyEdges: Object.freeze([]),
    compatibility: Object.freeze(records.map((record) => record.compatibility))
  });
  const withoutDigest = Object.freeze({
    kind: "resolved_product_lock",
    schemaVersion: 1,
    lockId: resolvedProductLockId(identityBasis),
    ...identityBasis
  });
  return Object.freeze({
    ...withoutDigest,
    lockDigest: digestCanonicalIJson(withoutDigest)
  });
}

test("workspace create writes only its manifest and open is read-only", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "abg-t223-workspace-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const context = workspacePathContext(root);

  const manifest = await createWorkspace(root);
  assert.equal(manifest.root, root);
  assert.equal(manifest.scaffoldState, "none");
  assert.equal(manifest.bindingRef, null);
  assert.equal(
    await pathExists(join(root, WORKSPACE_MANIFEST_RELATIVE_PATH)),
    true
  );
  assert.equal(
    await pathExists(join(root, TOOLCHAIN_BINDING_RELATIVE_PATH)),
    false
  );
  assert.equal(await pathExists(join(root, ".ai-workspace")), false);

  const opened = await workspaceOpen(
    { targetRoot: root, expectedWorkspaceSchemaVersion: 1 },
    context
  );
  assert.equal(opened.kind, "accepted");
  assert.equal(opened.disposition, "unbound");
  assert.deepEqual(opened.value.manifest, manifest);
  assert.equal(await pathExists(join(root, ".ai-workspace")), false);

  const repeated = await workspaceCreate(
    { targetRoot: root, authorityMode: "clean_no_project_authority" },
    context,
    { actorRef: "actor://t223/test" }
  );
  assert.equal(repeated.kind, "refused");
  assert.equal(repeated.code, "workspace_exists");
});

test("workspace open rejects duplicate-key JSON and schema-v2 binding truth", async (t) => {
  const duplicateRoot = await mkdtemp(join(tmpdir(), "abg-t223-duplicate-"));
  const staleRoot = await mkdtemp(join(tmpdir(), "abg-t223-v2-"));
  const invalidUtf8Root = await mkdtemp(join(tmpdir(), "abg-t223-utf8-"));
  t.after(() => rm(duplicateRoot, { recursive: true, force: true }));
  t.after(() => rm(staleRoot, { recursive: true, force: true }));
  t.after(() => rm(invalidUtf8Root, { recursive: true, force: true }));

  const duplicateManifest = await createWorkspace(duplicateRoot);
  const duplicateJson = canonicalizeIJson(duplicateManifest).replace(
    "{",
    '{"workspaceId":"workspace://duplicate",'
  );
  await writeFile(
    join(duplicateRoot, WORKSPACE_MANIFEST_RELATIVE_PATH),
    duplicateJson
  );
  const malformed = await workspaceOpen(
    { targetRoot: duplicateRoot, expectedWorkspaceSchemaVersion: 1 },
    workspacePathContext(duplicateRoot)
  );
  assert.equal(malformed.kind, "refused");
  assert.equal(malformed.code, "malformed");

  await mkdir(dirname(join(invalidUtf8Root, WORKSPACE_MANIFEST_RELATIVE_PATH)), {
    recursive: true
  });
  await writeFile(
    join(invalidUtf8Root, WORKSPACE_MANIFEST_RELATIVE_PATH),
    Uint8Array.of(0xff)
  );
  const invalidUtf8 = await workspaceOpen(
    { targetRoot: invalidUtf8Root, expectedWorkspaceSchemaVersion: 1 },
    workspacePathContext(invalidUtf8Root)
  );
  assert.equal(invalidUtf8.kind, "refused");
  assert.equal(invalidUtf8.code, "malformed");

  const throwingContext = workspacePathContext(invalidUtf8Root);
  throwingContext.effects.readBytes = async () => {
    throw new Error("read failed");
  };
  const failedRead = await workspaceOpen(
    { targetRoot: invalidUtf8Root, expectedWorkspaceSchemaVersion: 1 },
    throwingContext
  );
  assert.equal(failedRead.kind, "refused");
  assert.equal(failedRead.code, "malformed");

  await createWorkspace(staleRoot);
  const v2Path = join(staleRoot, TOOLCHAIN_BINDING_RELATIVE_PATH);
  await mkdir(dirname(v2Path), { recursive: true });
  await writeFile(
    v2Path,
    JSON.stringify({
      kind: "abg_toolchain_workspace_binding",
      schemaVersion: "2"
    })
  );
  const stale = await workspaceOpen(
    { targetRoot: staleRoot, expectedWorkspaceSchemaVersion: 1 },
    workspacePathContext(staleRoot)
  );
  assert.equal(stale.kind, "refused");
  assert.equal(stale.code, "stale");
});

test("catalog bind records one exact ordered product set without install or admission", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "abg-t223-bind-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const manifest = await createWorkspace(root);
  const toolchainRoot = join(root, "shared-toolchain");
  const records = Object.freeze([
    installedProductRecord({
      toolchainRoot,
      publisher: "abiogenesis",
      productId: "abiogenesis",
      packageName: "@abiogenesis/typescript-tenant",
      version: "5.0.0",
      compatibilityRange: "5.0.0"
    }),
    installedProductRecord({
      toolchainRoot,
      publisher: "fixture",
      productId: "hello-world",
      packageName: "@fixture/hello-world",
      version: "0.0.1",
      compatibilityRange: "^5.0.0"
    })
  ]);
  const lock = resolvedLock(records);
  const request = admitCatalogBindRequest({
    workspaceId: manifest.workspaceId,
    workspaceManifestDigest: digestCanonicalIJson(manifest),
    resolvedLock: lock,
    installedProductRecords: records,
    mutableStateRoots: {
      observedWorkspaceRoot: join(root, "."),
      observerStateRoot: join(root, ".ai-workspace"),
      executorStateRoot: join(root, ".ai-workspace"),
      eventRoot: join(root, ".ai-workspace", "events"),
      eventLogPath: join(root, ".ai-workspace", "events", "events.jsonl"),
      runtimeRoot: join(root, ".ai-workspace", "runtime"),
      projectionRoot: join(root, ".ai-workspace", "projections"),
      archiveRoot: join(root, ".ai-workspace", "archives")
    }
  });
  assert.equal(
    canonicalizeIJson(request.installedProductRecords[0]),
    canonicalizeIJson(records[0])
  );

  let currentBinding = null;
  let bindingWrites = 0;
  const mutableRoots = [];
  const context = {
    kind: "workspace_binding",
    workspaceManifest: manifest,
    effects: {
      async readBinding() {
        return currentBinding;
      },
      async readInstalledProductRecord(installedProductId) {
        return request.installedProductRecords.find(
          (record) => record.installedProductId === installedProductId
        ) ?? null;
      },
      async writeBinding(binding) {
        bindingWrites += 1;
        currentBinding = binding;
      },
      async createMutableRoot(path) {
        mutableRoots.push(path);
        await mkdir(path, { recursive: true });
      }
    }
  };
  const attribution = {
    actorRef: "actor://t223/binder",
    provenanceRefs: ["proof://t223/catalog-bind"]
  };

  const bound = await catalogBind(request, context, attribution);
  assert.equal(bound.kind, "accepted", JSON.stringify(bound));
  assert.equal(bound.disposition, "bound");
  assert.equal(bound.value.schemaVersion, "3");
  assert.equal(bound.value.toolchainRoot, toolchainRoot);
  assert.equal(bound.value.mutableStateRoots.observedWorkspaceRoot, root);
  assert.deepEqual(
    bound.value.productBindingRefs,
    records.map((record) => record.installedProductId)
  );
  assert.equal(bindingWrites, 1);
  assert.equal(new Set(mutableRoots).size, mutableRoots.length);
  assert.equal(
    await pathExists(bound.value.mutableStateRoots.eventLogPath),
    false,
    "bind creates declared roots but no event log or runtime event"
  );

  const rootCreationCount = mutableRoots.length;
  const repeated = await catalogBind(request, context, attribution);
  assert.equal(repeated.kind, "accepted");
  assert.equal(repeated.disposition, "already_bound_exact");
  assert.equal(bindingWrites, 1);
  assert.equal(mutableRoots.length, rootCreationCount);

  assert.deepEqual(
    resolveInstallToolchainRoot({
      explicitToolchainRoot: join(root, "explicit"),
      workspaceBinding: bound.value,
      environment: { ABG_TOOLCHAIN_ROOT: join(root, "environment") }
    }),
    { root: join(root, "explicit"), source: "explicit" }
  );
  assert.deepEqual(
    resolveInstallToolchainRoot({
      workspaceBinding: bound.value,
      environment: { ABG_TOOLCHAIN_ROOT: join(root, "environment") }
    }),
    { root: toolchainRoot, source: "workspace_binding" }
  );
  assert.deepEqual(
    resolveInstallToolchainRoot({
      environment: { ABG_TOOLCHAIN_ROOT: join(root, "environment") }
    }),
    { root: join(root, "environment"), source: "environment" }
  );

  const bindingPath = join(root, TOOLCHAIN_BINDING_RELATIVE_PATH);
  await mkdir(dirname(bindingPath), { recursive: true });
  await writeFile(bindingPath, canonicalizeIJson(bound.value));
  const opened = await workspaceOpen(
    { targetRoot: root, expectedWorkspaceSchemaVersion: 1 },
    workspacePathContext(root)
  );
  assert.equal(opened.kind, "accepted");
  assert.equal(opened.disposition, "ready");

  const changedManifest = Object.freeze({
    ...manifest,
    configurationRefs: Object.freeze(["configuration://changed-after-bind"])
  });
  await writeFile(
    join(root, WORKSPACE_MANIFEST_RELATIVE_PATH),
    canonicalizeIJson(changedManifest)
  );
  const stale = await workspaceOpen(
    { targetRoot: root, expectedWorkspaceSchemaVersion: 1 },
    workspacePathContext(root)
  );
  assert.equal(stale.kind, "refused");
  assert.equal(stale.code, "stale");
  await writeFile(
    join(root, WORKSPACE_MANIFEST_RELATIVE_PATH),
    canonicalizeIJson(manifest)
  );

  currentBinding = Object.freeze({
    ...bound.value,
    bindingId: "binding://conflict"
  });
  const conflict = await catalogBind(request, context, attribution);
  assert.equal(conflict.kind, "refused");
  assert.equal(conflict.code, "binding_conflict");
  assert.equal(bindingWrites, 1);

  const incoherentLock = Object.freeze({
    ...request.resolvedLock,
    lockDigest: digest("incoherent-lock")
  });
  const lockMismatch = await catalogBind(
    Object.freeze({ ...request, resolvedLock: incoherentLock }),
    context,
    attribution
  );
  assert.equal(lockMismatch.kind, "refused");
  assert.equal(lockMismatch.code, "lock_mismatch");
  assert.equal(bindingWrites, 1);

  const malformedBinding = Object.freeze({
    ...bound.value,
    bindingDigest: digest("tampered-binding")
  });
  await writeFile(bindingPath, canonicalizeIJson(malformedBinding));
  const malformed = await workspaceOpen(
    { targetRoot: root, expectedWorkspaceSchemaVersion: 1 },
    workspacePathContext(root)
  );
  assert.equal(malformed.kind, "refused");
  assert.equal(malformed.code, "malformed");
});
