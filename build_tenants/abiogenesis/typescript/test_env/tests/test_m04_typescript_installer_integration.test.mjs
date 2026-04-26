// Validates: REQ-P-QUAL-018G
// Validates: REQ-P-QUAL-018H
// Validates: REQ-P-QUAL-018I
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";
import {
  access,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { installAbiogenesisTypescript } from "../../build/semantic/code/src/app/m04/install_bootstrap/index.js";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(TEST_DIR);

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function locateRepoRoot() {
  let current = TEST_DIR;
  while (current !== path.dirname(current)) {
    if (
      await pathExists(path.join(current, "specification")) &&
      await pathExists(path.join(current, "build_tenants"))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  throw new Error("unable to locate abiogenesis repo root");
}

function tenantRoot(repoRoot) {
  return path.join(repoRoot, "build_tenants", "abiogenesis", "typescript");
}

async function makeTargetRoot(label) {
  return mkdtemp(path.join(tmpdir(), `abiogenesis-ts-${label}-`));
}

function timestampId() {
  return new Date().toISOString().replace(/[:.]/g, "");
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function copyTextFile(sourcePath, targetPath) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, await readFile(sourcePath, "utf8"), "utf8");
}

async function writeInstallerArchive(input) {
  const archiveRoot = path.join(
    TEST_ENV_ROOT,
    "test_runs",
    "typescript_installer",
    "public_installer",
    timestampId()
  );
  const artifactsRoot = path.join(archiveRoot, "artifacts");
  const installerManifest = JSON.parse(
    await readFile(input.outcome.installerManifestPath, "utf8")
  );
  const installManifest = JSON.parse(
    await readFile(input.outcome.installManifestPath, "utf8")
  );

  await writeJson(path.join(archiveRoot, "run.json"), {
    scenarioName: "typescript_installer_public_boundary",
    targetRoot: input.targetRoot,
    packageSourceRoot: input.sourceRoot,
    packageRoot: input.outcome.packageRoot,
    commandPaths: input.outcome.commandPaths,
    runtimeIdentity: input.outcome.runtimeIdentity,
    startedAt: new Date().toISOString(),
    command: "npm run test:t076"
  });
  await writeJson(path.join(archiveRoot, "summary.json"), {
    converged: true,
    packageName: input.outcome.packageName,
    packageVersion: input.outcome.packageVersion,
    installManifestPath: input.outcome.installManifestPath,
    installerManifestPath: input.outcome.installerManifestPath,
    eventEvidencePath: input.outcome.eventsPath,
    projectionEvidencePath: "artifacts/projection.json",
    postmortemPath: "postmortem.md"
  });
  await writeJson(path.join(artifactsRoot, "package_identity.json"), {
    packageName: input.outcome.packageName,
    packageVersion: input.outcome.packageVersion,
    packageRoot: input.outcome.packageRoot,
    packageSourceRoot: input.outcome.packageSourceRoot
  });
  await writeJson(path.join(artifactsRoot, "command_paths.json"), {
    commandPaths: input.outcome.commandPaths
  });
  await writeJson(
    path.join(artifactsRoot, "runtime_identity.json"),
    input.outcome.runtimeIdentity
  );
  await writeJson(path.join(artifactsRoot, "projection.json"), {
    installerOutcomeKind: input.outcome.kind,
    installVerification: input.outcome.installBootstrapOutcome.verification,
    packageRoot: input.outcome.packageRoot,
    commandPaths: input.outcome.commandPaths,
    eventsPath: input.outcome.eventsPath,
    runtimeDirectory: input.outcome.runtimeDirectory
  });
  await copyTextFile(
    input.outcome.installerManifestPath,
    path.join(artifactsRoot, "typescript-installer-manifest.json")
  );
  await copyTextFile(
    input.outcome.installManifestPath,
    path.join(artifactsRoot, "install-manifest.json")
  );
  await copyTextFile(input.outcome.eventsPath, path.join(artifactsRoot, "events.jsonl"));
  await writeFile(
    path.join(archiveRoot, "postmortem.md"),
    [
      "# TypeScript Installer Postmortem",
      "",
      "The public TypeScript installer populated a downstream-consumable ABG runtime.",
      "",
      `- package: ${installerManifest.packageName}@${installerManifest.packageVersion}`,
      `- command paths: ${installerManifest.commandPaths.join(", ")}`,
      `- runtime: ${installerManifest.runtimeIdentity.resolvedRuntimeRef}`,
      `- bootstrap dependency: ${installManifest.runtimePackage.dependencyRef}`
    ].join("\n"),
    "utf8"
  );

  return archiveRoot;
}

async function runInstalledProbe(targetRoot) {
  const probePath = path.join(targetRoot, ".abiogenesis", "public-installer-probe.mjs");
  await writeFile(
    probePath,
    `
      import { start } from "@abiogenesis/typescript-tenant/app/m04";
      import { installAbiogenesisTypescript } from "@abiogenesis/typescript-tenant/app/m04/install-bootstrap";
      console.log(JSON.stringify({
        start: typeof start,
        installer: typeof installAbiogenesisTypescript
      }));
    `,
    "utf8"
  );
  return spawnSync("node", [probePath], {
    cwd: targetRoot,
    encoding: "utf8"
  });
}

test("T-076 public TypeScript installer populates a package-backed ABG install and command binding", async () => {
  const repoRoot = await locateRepoRoot();
  const sourceRoot = tenantRoot(repoRoot);
  const targetRoot = await makeTargetRoot("public-installer");

  const outcome = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: targetRoot
    },
    packageSourceRoot: sourceRoot
  });

  assert.equal(outcome.kind, "installed");
  assert.equal(outcome.packageName, "@abiogenesis/typescript-tenant");
  assert.equal(outcome.installBootstrapOutcome.kind, "installed");
  assert.equal(
    await pathExists(path.join(targetRoot, ".abiogenesis", "install-manifest.json")),
    true
  );
  assert.equal(
    await pathExists(
      path.join(targetRoot, ".abiogenesis", "typescript-installer-manifest.json")
    ),
    true
  );
  assert.equal(
    await pathExists(
      path.join(targetRoot, "node_modules", ".bin", "genesis-ts")
    ),
    true
  );
  assert.equal((await lstat(outcome.packageRoot)).isSymbolicLink(), false);

  const manifest = JSON.parse(await readFile(outcome.installerManifestPath, "utf8"));
  assert.equal(manifest.kind, "abg_typescript_installer_manifest");
  assert.equal(manifest.packageRoot, outcome.packageRoot);
  assert.deepStrictEqual(manifest.commandPaths, outcome.commandPaths);
  assert.deepStrictEqual(manifest.runtimeIdentity, {
    workerId: "abiogenesis-typescript-installer",
    backendId: "node",
    buildId: outcome.packageVersion,
    resolvedRuntimeRef: `package:${outcome.packageName}@${outcome.packageVersion}`
  });

  const probe = await runInstalledProbe(targetRoot);
  assert.equal(probe.status, 0, probe.stderr);
  assert.deepStrictEqual(JSON.parse(probe.stdout), {
    start: "function",
    installer: "function"
  });

  const archiveRoot = await writeInstallerArchive({
    sourceRoot,
    targetRoot,
    outcome
  });
  for (const relativePath of [
    "run.json",
    "summary.json",
    "postmortem.md",
    "artifacts/typescript-installer-manifest.json",
    "artifacts/install-manifest.json",
    "artifacts/package_identity.json",
    "artifacts/command_paths.json",
    "artifacts/runtime_identity.json",
    "artifacts/events.jsonl",
    "artifacts/projection.json"
  ]) {
    assert.equal(await pathExists(path.join(archiveRoot, relativePath)), true);
  }
});

test("T-076 installed genesis-ts install command can create a second ABG TypeScript install", async () => {
  const repoRoot = await locateRepoRoot();
  const sourceRoot = tenantRoot(repoRoot);
  const firstTarget = await makeTargetRoot("cli-installer-source");
  const secondTarget = await makeTargetRoot("cli-installer-target");
  const first = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: firstTarget
    },
    packageSourceRoot: sourceRoot
  });
  assert.equal(first.kind, "installed");

  const run = spawnSync(
    path.join(firstTarget, "node_modules", ".bin", "genesis-ts"),
    [
      "install",
      "--target",
      secondTarget
    ],
    {
      cwd: firstTarget,
      encoding: "utf8"
    }
  );

  assert.equal(run.status, 0, run.stderr);
  const payload = JSON.parse(run.stdout);
  assert.equal(payload.command, "install");
  assert.equal(payload.status, "installed");
  assert.equal(
    await realpath(payload.package_source_root),
    await realpath(first.packageRoot)
  );
  assert.equal(
    await pathExists(
      path.join(secondTarget, ".abiogenesis", "typescript-installer-manifest.json")
    ),
    true
  );
  assert.equal(
    await pathExists(path.join(secondTarget, "node_modules", ".bin", "abiogenesis-ts")),
    true
  );
});

test("T-076 public TypeScript installer rejects cwd-dependent package source roots", async () => {
  const targetRoot = await makeTargetRoot("relative-package-source");

  await assert.rejects(
    () =>
      installAbiogenesisTypescript({
        targetRoot: {
          rootPath: targetRoot
        },
        packageSourceRoot: "relative/typescript"
      }),
    /packageSourceRoot: expected an absolute path/u
  );
});
