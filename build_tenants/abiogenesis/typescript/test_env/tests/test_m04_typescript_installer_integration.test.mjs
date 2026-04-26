// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";
import {
  access,
  lstat,
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

  const probe = await runInstalledProbe(targetRoot);
  assert.equal(probe.status, 0, probe.stderr);
  assert.deepStrictEqual(JSON.parse(probe.stdout), {
    start: "function",
    installer: "function"
  });
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
