// Validates: REQ-P-INSTALL
// Validates: T-163

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  stat,
  symlink,
  writeFile
} from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { installAbiogenesisTypescript } from "../../build/semantic/code/src/app/m04/install_bootstrap/index.js";
import { admitToolchainWorkspaceBinding } from "../../build/semantic/code/src/app/m04/toolchain_binding/index.js";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const T163_OLD_VERSION = "0.0.0-t163-old";

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(targetPath) {
  try {
    return (await stat(targetPath)).isDirectory();
  } catch {
    return false;
  }
}

async function locateRepoRoot() {
  let current = TEST_DIR;
  while (current !== path.dirname(current)) {
    if (
      (await pathExists(path.join(current, "specification"))) &&
      (await pathExists(path.join(current, "build_tenants")))
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

function parsePayload(run) {
  assert.notEqual(run.stdout.trim(), "", run.stderr);
  return JSON.parse(run.stdout);
}

function runNode(command, args, cwd, env = {}) {
  return spawnSync(command, args, {
    cwd,
    env: {
      ...process.env,
      ...env
    },
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10
  });
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function sha256Text(content) {
  return createHash("sha256").update(content).digest("hex");
}

function cliPath(sourceRoot) {
  return path.join(
    sourceRoot,
    "build",
    "semantic",
    "code",
    "src",
    "bin",
    "abiogenesis.js"
  );
}

function installArgs(sourceRoot, targetRoot, extra = []) {
  return [
    cliPath(sourceRoot),
    "install",
    "--target",
    targetRoot,
    "--package-source",
    sourceRoot,
    "--installed-package-name",
    "abg-t163-toolchain",
    ...extra
  ];
}

async function makeVersionedPackageSource(sourceRoot, parentRoot, version) {
  const stagedRoot = path.join(parentRoot, `abiogenesis-source-${version}`);
  const packageJson = await readJson(path.join(sourceRoot, "package.json"));
  await mkdir(stagedRoot, { recursive: true });
  await cp(path.join(sourceRoot, "build"), path.join(stagedRoot, "build"), {
    recursive: true
  });
  await cp(path.join(sourceRoot, "config"), path.join(stagedRoot, "config"), {
    recursive: true
  });
  await symlink(
    path.join(sourceRoot, "node_modules"),
    path.join(stagedRoot, "node_modules"),
    "dir"
  );
  await writeFile(
    path.join(stagedRoot, "package.json"),
    `${JSON.stringify({ ...packageJson, version }, null, 2)}\n`,
    "utf8"
  );
  return stagedRoot;
}

async function writeProductManifest(filePath, manifest) {
  const content = `${JSON.stringify(manifest, null, 2)}\n`;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
  return sha256Text(content);
}

test("T-163 install resolution has one selector model and no target-local payload fallback", async () => {
  const repoRoot = await locateRepoRoot();
  const sourceRoot = tenantRoot(repoRoot);
  const standardsSourceRoot = path.join(
    path.dirname(repoRoot),
    "specification_methodology",
    "specification",
    "standards"
  );
  const docsSourceRoot = path.join(repoRoot, "docs");
  const parentRoot = await mkdtemp(path.join(tmpdir(), "abg-t163-"));
  const noSelectorTarget = path.join(parentRoot, "no-selector");
  const legacyAliasTarget = path.join(parentRoot, "legacy-alias");
  const envTarget = path.join(parentRoot, "env-selected");
  const explicitTarget = path.join(parentRoot, "explicit-selected");
  const bareRuntimeTarget = path.join(parentRoot, "bare-runtime");
  const oldVersionTarget = path.join(parentRoot, "old-version-selected");
  const envToolchainRoot = path.join(parentRoot, "env-toolchain");
  const explicitToolchainRoot = path.join(parentRoot, "explicit-toolchain");
  await mkdir(noSelectorTarget, { recursive: true });
  await mkdir(legacyAliasTarget, { recursive: true });
  await mkdir(envTarget, { recursive: true });
  await mkdir(explicitTarget, { recursive: true });
  await mkdir(bareRuntimeTarget, { recursive: true });
  await mkdir(oldVersionTarget, { recursive: true });

  const noSelectorRun = runNode(
    process.execPath,
    installArgs(sourceRoot, noSelectorTarget),
    sourceRoot,
    {
      ABG_TOOLCHAIN_ROOT: "",
      ABIOGENESIS_HOME: "",
      ODD_SDLC_HOME: ""
    }
  );
  assert.notEqual(noSelectorRun.status, 0);
  assert.match(parsePayload(noSelectorRun).outcome.reason, /ABG_TOOLCHAIN_ROOT/u);

  const legacyAliasRun = runNode(
    process.execPath,
    installArgs(sourceRoot, legacyAliasTarget),
    sourceRoot,
    {
      ABG_TOOLCHAIN_ROOT: "",
      ABIOGENESIS_HOME: path.join(parentRoot, "legacy-abg-home"),
      ODD_SDLC_HOME: path.join(parentRoot, "legacy-odd-home")
    }
  );
  assert.notEqual(legacyAliasRun.status, 0);
  assert.match(parsePayload(legacyAliasRun).outcome.reason, /ABG_TOOLCHAIN_ROOT/u);

  const envRun = runNode(
    process.execPath,
    installArgs(sourceRoot, envTarget),
    sourceRoot,
    {
      ABG_TOOLCHAIN_ROOT: envToolchainRoot,
      ABIOGENESIS_HOME: path.join(parentRoot, "ignored-abg-home"),
      ODD_SDLC_HOME: path.join(parentRoot, "ignored-odd-home")
    }
  );
  assert.equal(envRun.status, 0, envRun.stderr);
  const envPayload = parsePayload(envRun);
  assert.equal(envPayload.status, "installed");
  const envOutcome = envPayload.outcome;
  const envBinding = await readJson(
    path.join(envTarget, ".abiogenesis", "toolchain-binding.json")
  );
  assert.equal(envBinding.schemaVersion, "2");
  assert.equal(envBinding.selectionSource, "environment");
  assert.equal(envBinding.toolchainRoot, envToolchainRoot);
  assert.equal(envOutcome.packageRoot.startsWith(envToolchainRoot), true);
  assert.equal(envOutcome.docsInstallRoot.startsWith(envToolchainRoot), true);
  assert.equal(envOutcome.standardsInstallRoot.startsWith(envToolchainRoot), true);
  assert.equal(
    await pathExists(
      path.join(envTarget, "node_modules", "@abiogenesis", "typescript-tenant")
    ),
    false
  );
  assert.equal(await pathExists(path.join(envTarget, ".abiogenesis", "docs")), false);
  assert.equal(
    await pathExists(path.join(envToolchainRoot, "bin", "genesis-ts")),
    false
  );
  const pathOrderRun = runNode(
    "genesis-ts",
    ["gaps", "--workspace", envTarget, "--scope", "workspace"],
    envTarget,
    {
      PATH: path.join(envToolchainRoot, "bin")
    }
  );
  assert.equal(pathOrderRun.status, null);
  assert.equal(pathOrderRun.error?.code, "ENOENT");

  const product = envBinding.products[0];
  assert.equal(product.productId, "abiogenesis");
  assert.equal(product.packageRoot, envOutcome.packageRoot);
  assert.equal(await pathExists(product.manifestPath), true);
  assert.equal(
    product.manifestDigest,
    sha256Text(await readFile(product.manifestPath, "utf8"))
  );
  assert.deepStrictEqual((await readJson(product.manifestPath)).requires, []);
  assert.equal(await isDirectory(product.docsRoot), true);
  assert.equal(await isDirectory(product.standardsRoot), true);

  const oldVersionSourceRoot = await makeVersionedPackageSource(
    sourceRoot,
    parentRoot,
    T163_OLD_VERSION
  );
  const oldVersionOutcome = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: oldVersionTarget
    },
    packageSourceRoot: oldVersionSourceRoot,
    standardsSourceRoot,
    docsSourceRoot,
    installedPackageName: "abg-t163-old-version",
    toolchainRoot: envToolchainRoot
  });
  assert.equal(oldVersionOutcome.kind, "installed");
  assert.equal(oldVersionOutcome.packageVersion, T163_OLD_VERSION);
  assert.equal(
    oldVersionOutcome.packageRoot,
    path.join(
      envToolchainRoot,
      "products",
      "abiogenesis",
      T163_OLD_VERSION,
      "lib",
      "node_modules",
      "@abiogenesis",
      "typescript-tenant"
    )
  );
  assert.notEqual(oldVersionOutcome.packageRoot, envOutcome.packageRoot);

  const downstreamRoot = path.join(
    envToolchainRoot,
    "products",
    "odd_sdlc",
    "3.0.17"
  );
  const downstreamPackageRoot = path.join(
    downstreamRoot,
    "lib",
    "node_modules",
    "@odd-sdlc",
    "typescript-tenant"
  );
  const downstreamBinRoot = path.join(downstreamRoot, "bin");
  const downstreamDocsRoot = path.join(downstreamRoot, "docs");
  const downstreamStandardsRoot = path.join(downstreamDocsRoot, "standards");
  await mkdir(downstreamPackageRoot, { recursive: true });
  await mkdir(downstreamBinRoot, { recursive: true });
  await mkdir(downstreamStandardsRoot, { recursive: true });
  const downstreamManifestPath = path.join(
    downstreamRoot,
    "product-toolchain-manifest.json"
  );
  const downstreamManifestDigest = await writeProductManifest(
    downstreamManifestPath,
    {
      kind: "abg_product_toolchain_manifest",
      productId: "odd_sdlc",
      packageName: "@odd-sdlc/typescript-tenant",
      packageVersion: "3.0.17",
      productRoot: downstreamRoot,
      packageRoot: downstreamPackageRoot,
      binRoot: downstreamBinRoot,
      libRoot: path.join(downstreamRoot, "lib"),
      commandPaths: [],
      docsRoot: downstreamDocsRoot,
      standardsRoot: downstreamStandardsRoot,
      tarballPath: path.join(downstreamRoot, "odd-sdlc-3.0.17.tgz"),
      requires: [
        {
          productId: "abiogenesis",
          packageVersion: envOutcome.packageVersion
        }
      ]
    }
  );
  const admittedDownstreamBinding = admitToolchainWorkspaceBinding({
    ...envBinding,
    selectionSource: "workspace_binding",
    products: [
      product,
      {
        kind: "abg_toolchain_product_binding",
        productId: "odd_sdlc",
        packageName: "@odd-sdlc/typescript-tenant",
        packageVersion: "3.0.17",
        productRoot: downstreamRoot,
        packageRoot: downstreamPackageRoot,
        binRoot: downstreamBinRoot,
        libRoot: path.join(downstreamRoot, "lib"),
        docsRoot: downstreamDocsRoot,
        standardsRoot: downstreamStandardsRoot,
        manifestPath: downstreamManifestPath,
        manifestDigest: downstreamManifestDigest,
        commandPaths: []
      }
    ]
  });
  assert.equal(admittedDownstreamBinding.products[1].productId, "odd_sdlc");
  assert.deepStrictEqual((await readJson(downstreamManifestPath)).requires, [
    {
      productId: "abiogenesis",
      packageVersion: envOutcome.packageVersion
    }
  ]);

  const genesisCommand = product.commandPaths.find((candidate) =>
    candidate.endsWith(`${path.sep}genesis-ts`)
  );
  assert.notEqual(genesisCommand, undefined);
  assert.equal(await pathExists(genesisCommand), true);
  assert.equal(
    genesisCommand.startsWith(
      path.join(envToolchainRoot, "products", "abiogenesis")
    ),
    true
  );

  const startRun = runNode(
    genesisCommand,
    [
      "start",
      "--workspace",
      envTarget,
      "--scope",
      "workspace",
      "--target",
      "graph_function:installed_cli_runtime_binding_self_test",
      "--until",
      "converged"
    ],
    envTarget
  );
  assert.equal(startRun.status, 0, startRun.stderr);
  const startPayload = parsePayload(startRun);
  assert.equal(startPayload.events_path, envBinding.mutableStateRoots.eventLogPath);

  const bareStartRun = runNode(
    process.execPath,
    [
      cliPath(sourceRoot),
      "start",
      "--workspace",
      bareRuntimeTarget,
      "--scope",
      "workspace",
      "--target",
      "graph_function:installed_cli_runtime_binding_self_test",
      "--until",
      "converged"
    ],
    sourceRoot
  );
  assert.notEqual(bareStartRun.status, 0);
  assert.match(parsePayload(bareStartRun).reason, /toolchain binding/u);

  const explicitRun = runNode(
    process.execPath,
    installArgs(sourceRoot, explicitTarget, [
      "--toolchain-root",
      explicitToolchainRoot
    ]),
    sourceRoot,
    {
      ABG_TOOLCHAIN_ROOT: envToolchainRoot
    }
  );
  assert.equal(explicitRun.status, 0, explicitRun.stderr);
  const explicitPayload = parsePayload(explicitRun);
  const explicitBinding = explicitPayload.outcome.manifest.toolchainBinding;
  assert.equal(explicitBinding.selectionSource, "explicit");
  assert.equal(explicitBinding.toolchainRoot, explicitToolchainRoot);
  assert.equal(
    explicitBinding.products[0].packageRoot.startsWith(explicitToolchainRoot),
    true
  );
});
