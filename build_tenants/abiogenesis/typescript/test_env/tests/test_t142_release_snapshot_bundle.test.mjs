// Validates: REQ-P-QUAL-050
// Validates: REQ-P-QUAL-051
// Validates: REQ-P-QUAL-052
// Validates: REQ-P-QUAL-053
// Validates: REQ-P-QUAL-054
// Validates: REQ-P-QUAL-055

import test from "node:test";
import assert from "node:assert/strict";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  createReleaseSnapshotBundle
} from "../../build/semantic/code/src/qualification/m05/index.js";

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function makeFixturePackage(root, version = "0.1.0-rc.1") {
  const packageRoot = path.join(root, "fixture-package");
  await mkdir(packageRoot, { recursive: true });
  await writeJson(path.join(packageRoot, "package.json"), {
    name: "@abiogenesis/release-snapshot-fixture",
    version,
    private: true,
    type: "module",
    files: ["index.js"]
  });
  await writeFile(
    path.join(packageRoot, "index.js"),
    "export const fixture = 'release-snapshot';\n",
    "utf8"
  );
  return packageRoot;
}

function snapshotRequest(input) {
  return {
    releaseIdentity: input.releaseIdentity ?? "0.1.0-rc.1",
    packageSourceRoot: input.packageSourceRoot,
    snapshotRoot: input.snapshotRoot,
    sourceRef: input.sourceRef ?? "v0.1.0-rc.1",
    sourceCommit: input.sourceCommit ?? "0000000000000000000000000000000000000000",
    sourceDirty: input.sourceDirty ?? false,
    allowDirtySource: input.allowDirtySource ?? false,
    rcBranch: input.rcBranch ?? "rc/0.1.0",
    releaseNotePath: input.releaseNotePath ?? null,
    expectedPackageName:
      input.expectedPackageName ?? "@abiogenesis/release-snapshot-fixture",
    expectedPackageVersion: input.expectedPackageVersion ?? "0.1.0-rc.1",
    runBuild: false,
    npmCacheRoot: null,
    createdAt: "2026-05-22T00:00:00.000Z"
  };
}

test("T-142 release snapshot bundle writes tarball, manifest, note, and checksums", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t142-snapshot-"));
  const packageRoot = await makeFixturePackage(root);
  const releaseNotePath = path.join(root, "release-note.md");
  const snapshotRoot = path.join(root, "snapshots", "0.1.0-rc.1");
  await writeFile(releaseNotePath, "# fixture release\n", "utf8");

  const outcome = await createReleaseSnapshotBundle(
    snapshotRequest({
      packageSourceRoot: packageRoot,
      snapshotRoot,
      releaseNotePath
    })
  );

  assert.equal(outcome.kind, "created");
  assert.equal(await pathExists(outcome.manifestPath), true);
  assert.equal(await pathExists(outcome.checksumPath), true);
  assert.equal(outcome.manifest.kind, "abg_release_snapshot_manifest");
  assert.equal(outcome.manifest.package.packageVersion, "0.1.0-rc.1");
  assert.match(outcome.manifest.tarball.sha256, /^[a-f0-9]{64}$/);
  assert.equal(outcome.artifacts.some((entry) => entry.kind === "package_tarball"), true);
  assert.equal(outcome.artifacts.some((entry) => entry.kind === "release_note"), true);
  assert.equal(outcome.artifacts.some((entry) => entry.kind === "snapshot_manifest"), true);
  assert.equal(outcome.artifacts.some((entry) => entry.kind === "checksum_file"), true);

  const manifest = JSON.parse(await readFile(outcome.manifestPath, "utf8"));
  assert.equal(manifest.releaseIdentity, "0.1.0-rc.1");
  assert.equal(manifest.packSummary.filename.endsWith(".tgz"), true);
  assert.equal(manifest.tarball.path.includes(".staging-"), false);
  assert.equal(manifest.tarball.path.startsWith(`${snapshotRoot}${path.sep}`), true);
  assert.equal(manifest.releaseNote.path, path.join(snapshotRoot, "release-note.md"));
  assert.equal(outcome.manifest.tarball.path, manifest.tarball.path);
  const checksums = await readFile(outcome.checksumPath, "utf8");
  assert.match(checksums, /release-snapshot-manifest\.json/u);
  assert.match(checksums, /\.tgz/u);
});

test("T-142 release snapshot bundle rejects existing snapshot roots", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t142-existing-"));
  const packageRoot = await makeFixturePackage(root);
  const snapshotRoot = path.join(root, "snapshots", "0.1.0-rc.1");
  await mkdir(snapshotRoot, { recursive: true });
  await writeFile(path.join(snapshotRoot, "old.txt"), "already exists\n", "utf8");

  const outcome = await createReleaseSnapshotBundle(
    snapshotRequest({
      packageSourceRoot: packageRoot,
      snapshotRoot
    })
  );

  assert.equal(outcome.kind, "rejected");
  assert.equal(outcome.gaps.some((entry) => entry.kind === "snapshot_root_exists"), true);
});

test("T-142 release snapshot bundle rejects dirty source without explicit override", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t142-dirty-"));
  const packageRoot = await makeFixturePackage(root);
  const snapshotRoot = path.join(root, "snapshots", "0.1.0-rc.1");

  const outcome = await createReleaseSnapshotBundle(
    snapshotRequest({
      packageSourceRoot: packageRoot,
      snapshotRoot,
      sourceDirty: true
    })
  );

  assert.equal(outcome.kind, "rejected");
  assert.equal(outcome.gaps.some((entry) => entry.kind === "dirty_source_tree"), true);
});

test("T-142 release snapshot bundle rejects package identity mismatch", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t142-mismatch-"));
  const packageRoot = await makeFixturePackage(root);
  const snapshotRoot = path.join(root, "snapshots", "0.1.0-rc.1");

  const outcome = await createReleaseSnapshotBundle(
    snapshotRequest({
      packageSourceRoot: packageRoot,
      snapshotRoot,
      expectedPackageVersion: "0.1.0-rc.2"
    })
  );

  assert.equal(outcome.kind, "rejected");
  assert.equal(
    outcome.gaps.some((entry) => entry.kind === "package_version_mismatch"),
    true
  );
});
