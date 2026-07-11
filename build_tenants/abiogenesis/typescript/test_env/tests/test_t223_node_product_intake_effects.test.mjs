// Validates: T-223 DS-1 concrete product-intake filesystem effects
// Validates: REQ-P-INSTALL-043..048, REQ-P-INSTALL-052

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { createNodeProductIntakeEffects } from "../../build/semantic/code/src/app/m04/product_intake/node_effects.js";
import { canonicalizeIJson } from "../../build/semantic/code/src/app/m04/public_sdk/canonical.js";

const ZERO_DIGEST = `sha256:${"0".repeat(64)}`;

function sha256(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function runTar({ archivePath, cwd, gzip, paths }) {
  const result = spawnSync(
    "tar",
    [gzip ? "-czf" : "-cf", archivePath, ...paths],
    {
      cwd,
      encoding: "utf8",
      env: {
        ...process.env,
        COPYFILE_DISABLE: "1",
        LC_ALL: "C"
      }
    }
  );
  assert.equal(
    result.status,
    0,
    `tar creation failed: ${result.stderr || result.stdout}`
  );
}

async function suppliedArtifact(input) {
  const bytes = new Uint8Array(await readFile(input.artifactPath));
  return Object.freeze({
    format: input.format,
    artifactPath: input.artifactPath,
    expectedArtifactDigest: sha256(bytes),
    expectedProductContentDigest: ZERO_DIGEST
  });
}

function verifiedArtifact(artifact) {
  return Object.freeze({ artifact });
}

function digest(label) {
  return sha256(Buffer.from(label, "utf8"));
}

function validBinding(root) {
  const productRoot = path.join(root, "products", "abiogenesis", "5.0.0");
  const product = Object.freeze({
    installedProductId: "installed://abiogenesis/5.0.0",
    publisher: "abiogenesis",
    productId: "abiogenesis",
    packageName: "@abiogenesis/typescript-tenant",
    version: "5.0.0",
    productContentDigest: digest("content"),
    descriptorId: "descriptor://abiogenesis/5.0.0",
    descriptorDigest: digest("descriptor"),
    contributionId: "contribution://abiogenesis/5.0.0",
    contributionDigest: digest("contribution"),
    artifactDigest: digest("artifact"),
    installedRoot: productRoot,
    productRoot,
    packageRoot: productRoot,
    manifestPath: path.join(productRoot, "product-toolchain-manifest.json"),
    manifestDigest: digest("manifest"),
    compatibilityRange: "5.0.0",
    compatibility: {
      productId: "abiogenesis",
      compatible: true,
      reason: null
    },
    commandRefs: ["abg.operation.catalog.invoke"],
    publicContractCatalogId: "catalog://abiogenesis/5.0.0",
    publicContractCatalogVersion: "5.0.0",
    publicContractCatalogDigest: digest("catalog")
  });
  const runtimeRoot = path.join(root, "runtime");
  return Object.freeze({
    kind: "abg_toolchain_workspace_binding",
    schemaVersion: "3",
    bindingId: "binding://t223/node-effects",
    bindingDigest: digest("binding"),
    workspaceId: "workspace://t223/node-effects",
    workspaceManifestDigest: digest("workspace"),
    targetRoot: path.join(root, "workspace"),
    toolchainRoot: root,
    resolvedLockId: "lock://t223/node-effects",
    resolvedLockDigest: digest("lock"),
    productSetDigest: digest("products"),
    productBindingRefs: [product.installedProductId],
    products: [product],
    mutableStateRoots: {
      observedWorkspaceRoot: path.join(root, "observed"),
      observerStateRoot: path.join(root, "observer"),
      executorStateRoot: path.join(root, "executor"),
      eventRoot: path.join(runtimeRoot, "events"),
      eventLogPath: path.join(runtimeRoot, "events", "runtime-events.jsonl"),
      runtimeRoot,
      projectionRoot: path.join(runtimeRoot, "projections"),
      archiveRoot: path.join(runtimeRoot, "archives")
    },
    provenanceRefs: ["proof://t223/node-effects"]
  });
}

test("node product intake normalizes npm tgz inspection and materialization", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t223-node-npm-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sourceRoot = path.join(root, "source");
  const packageRoot = path.join(sourceRoot, "package");
  await mkdir(path.join(packageRoot, "contracts"), { recursive: true });
  await writeFile(
    path.join(packageRoot, "product-toolchain-manifest.json"),
    '{"kind":"fixture"}\n',
    "utf8"
  );
  await writeFile(
    path.join(packageRoot, "contracts", "hello.json"),
    '{"hello":"world"}\n',
    "utf8"
  );
  const artifactPath = path.join(root, "hello-product.tgz");
  runTar({
    archivePath: artifactPath,
    cwd: sourceRoot,
    gzip: true,
    paths: ["package"]
  });
  const artifact = await suppliedArtifact({
    artifactPath,
    format: "npm_package_tgz"
  });
  const effects = createNodeProductIntakeEffects({
    temporaryRoot: path.join(root, "temporary"),
    environment: { ABG_TOOLCHAIN_ROOT: path.join(root, "toolchain") }
  });

  assert.equal(sha256(await effects.readArtifactBytes(artifactPath)), artifact.expectedArtifactDigest);
  const entries = await effects.inspectArtifact(artifact);
  assert.deepEqual(
    entries.map((entry) => entry.relativePath).sort(),
    [
      "package/contracts/hello.json",
      "package/product-toolchain-manifest.json"
    ]
  );

  const destinationRoot = path.join(root, "installed");
  await effects.materializeVerifiedArtifact(
    verifiedArtifact(artifact),
    destinationRoot
  );
  assert.equal(
    await readFile(
      path.join(destinationRoot, "contracts", "hello.json"),
      "utf8"
    ),
    '{"hello":"world"}\n'
  );
  assert.equal(
    await effects.readInstalledBytes(
      path.join(destinationRoot, "package", "contracts", "hello.json")
    ),
    null
  );
  await assert.rejects(
    effects.materializeVerifiedArtifact(
      verifiedArtifact(artifact),
      destinationRoot
    ),
    /immutable product destination is not empty/u
  );
  assert.equal(
    effects.readEnvironment("ABG_TOOLCHAIN_ROOT"),
    path.join(root, "toolchain")
  );
});

test("node product intake preserves abg tar product-relative paths", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t223-node-tar-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sourceRoot = path.join(root, "source");
  await mkdir(path.join(sourceRoot, "contracts"), { recursive: true });
  await writeFile(
    path.join(sourceRoot, "product-toolchain-manifest.json"),
    '{"kind":"fixture"}\n',
    "utf8"
  );
  await writeFile(
    path.join(sourceRoot, "contracts", "hello.json"),
    '{"hello":"tar"}\n',
    "utf8"
  );
  const artifactPath = path.join(root, "hello-product.tar");
  runTar({
    archivePath: artifactPath,
    cwd: sourceRoot,
    gzip: false,
    paths: ["product-toolchain-manifest.json", "contracts"]
  });
  const artifact = await suppliedArtifact({
    artifactPath,
    format: "abg_product_tar_v1"
  });
  const effects = createNodeProductIntakeEffects({
    temporaryRoot: path.join(root, "temporary")
  });

  const entries = await effects.inspectArtifact(artifact);
  assert.deepEqual(
    entries.map((entry) => entry.relativePath).sort(),
    ["contracts/hello.json", "product-toolchain-manifest.json"]
  );
  const destinationRoot = path.join(root, "installed");
  await effects.materializeVerifiedArtifact(
    verifiedArtifact(artifact),
    destinationRoot
  );
  assert.equal(
    await readFile(
      path.join(destinationRoot, "product-toolchain-manifest.json"),
      "utf8"
    ),
    '{"kind":"fixture"}\n'
  );
});

test("node product intake rejects unsafe archive kinds and duplicate paths", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t223-node-unsafe-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sourceRoot = path.join(root, "source");
  const packageRoot = path.join(sourceRoot, "package");
  await mkdir(packageRoot, { recursive: true });
  await writeFile(path.join(packageRoot, "value.json"), "{}\n", "utf8");
  await symlink("value.json", path.join(packageRoot, "value-link.json"));

  const linkedPath = path.join(root, "linked.tgz");
  runTar({
    archivePath: linkedPath,
    cwd: sourceRoot,
    gzip: true,
    paths: ["package"]
  });
  const linkedArtifact = await suppliedArtifact({
    artifactPath: linkedPath,
    format: "npm_package_tgz"
  });
  const effects = createNodeProductIntakeEffects({
    temporaryRoot: path.join(root, "temporary")
  });
  await assert.rejects(
    effects.inspectArtifact(linkedArtifact),
    /unsupported type/u
  );

  const duplicatePath = path.join(root, "duplicate.tgz");
  runTar({
    archivePath: duplicatePath,
    cwd: sourceRoot,
    gzip: true,
    paths: ["package/value.json", "package/value.json"]
  });
  const duplicateArtifact = await suppliedArtifact({
    artifactPath: duplicatePath,
    format: "npm_package_tgz"
  });
  await assert.rejects(
    effects.inspectArtifact(duplicateArtifact),
    /duplicate path/u
  );

  await writeFile(path.join(sourceRoot, "outside.json"), "{}\n", "utf8");
  const outsidePath = path.join(root, "outside.tgz");
  runTar({
    archivePath: outsidePath,
    cwd: sourceRoot,
    gzip: true,
    paths: ["outside.json"]
  });
  const outsideArtifact = await suppliedArtifact({
    artifactPath: outsidePath,
    format: "npm_package_tgz"
  });
  await assert.rejects(
    effects.inspectArtifact(outsideArtifact),
    /outside package/u
  );
});

test("node product intake reads canonical records and admitted workspace bindings", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t223-node-records-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const effects = createNodeProductIntakeEffects({
    temporaryRoot: path.join(root, "temporary")
  });
  const recordPath = path.join(root, "records", "result.json");
  const record = { z: 1, a: [true, null, "value"] };
  await effects.writeRecord(recordPath, record);
  assert.equal(
    canonicalizeIJson(await effects.readRecord(recordPath)),
    canonicalizeIJson(record)
  );
  assert.equal(await readFile(recordPath, "utf8"), canonicalizeIJson(record));
  assert.equal(
    await effects.readRecord(path.join(root, "records", "missing.json")),
    null
  );

  const bindingPath = path.join(root, "workspace-binding.json");
  const binding = validBinding(root);
  await effects.writeRecord(bindingPath, binding);
  assert.deepEqual(await effects.readWorkspaceBinding(bindingPath), binding);
  assert.deepEqual(
    await effects.readWorkspaceBinding(pathToFileURL(bindingPath).href),
    binding
  );
  assert.equal(await effects.readWorkspaceBinding("binding://unknown"), null);

  const malformedPath = path.join(root, "malformed.json");
  await writeFile(malformedPath, '{"a":1,"a":2}\n', "utf8");
  await assert.rejects(effects.readRecord(malformedPath), /duplicate/u);
});
