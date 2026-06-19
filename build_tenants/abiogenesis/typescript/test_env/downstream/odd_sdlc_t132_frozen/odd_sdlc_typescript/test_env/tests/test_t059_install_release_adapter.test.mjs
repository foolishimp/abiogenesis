// Validates: REQ-F-ODDSDLC-040
// Validates: REQ-F-ODDSDLC-043
// Validates: T-059

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  deriveOddSdlcTypescriptReleaseCut,
  deriveOddSdlcTypescriptReleaseSnapshot,
  installOddSdlcTypescript,
  oddSdlcTypescriptProductInstallRoot,
  invokeOddSdlcSpecMethodCommandSync,
  invokeOddSdlcSpecMethodCommand,
  resolveDefaultAbgDocsSourceRoot,
  resolveDefaultAbgPackageSourceRoot,
  resolveDefaultAbgStandardsSourceRoot
} from "../../build/semantic/code/src/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const PACKAGE_JSON = readJson(path.join(PACKAGE_ROOT, "package.json"));
const ODD_SDLC_PACKAGE_VERSION = PACKAGE_JSON.version;
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);
const ABG_RELEASE_VERSION = "4.1.0-rc.2";
const ABG_RELEASE_SOURCE_REF = "main";
const ABG_RELEASE_SOURCE_COMMIT = "d13444299211f405cf10243252943236c5727b2e";
const ABG_RELEASE_TARBALL_SHA256 =
  "ac9a5523154deb1d0960e9ff7d99f11fb3e4816f88ab42b6eff02e09d9ed9cbd";
const ABG_RELEASE_SNAPSHOT_REF = ABG_RELEASE_VERSION;
const ABG_RELEASE_SNAPSHOT_ROOT = resolve(
  REPO_ROOT,
  `../abiogenesis/release_snapshots/abiogenesis-typescript-tenant/${ABG_RELEASE_SNAPSHOT_REF}`
);
const ABG_RELEASE_TARBALL = path.join(
  ABG_RELEASE_SNAPSHOT_ROOT,
  `abiogenesis-typescript-tenant-${ABG_RELEASE_VERSION}.tgz`
);
const ABG_RELEASE_DEPENDENCY_REF =
  `file:../../../abiogenesis/release_snapshots/abiogenesis-typescript-tenant/${ABG_RELEASE_VERSION}/` +
  `abiogenesis-typescript-tenant-${ABG_RELEASE_VERSION}.tgz`;
const ODD_SDLC_RELEASE_SNAPSHOT_ROOT = resolve(
  REPO_ROOT,
  "release_snapshots/odd-sdlc-typescript-tenant"
);
const LEGACY_ODD_SDLC_RELEASE_SNAPSHOT_IDS = Object.freeze([
  "20260515T001126Z",
  "20260517T095944Z_t171_checkpoint_rc",
  "20260518T125740Z_t171_hello_world_lifecycle_rc",
  "20260518T183633Z_t102_t132_hello_world_rc3",
  "20260519T051709Z_t171_data_mapper_test82_rc4",
  "20260520T061522Z_t172_t173_rc5",
  "20260520T170923Z_t172_t173_rc6",
  "20260521T173625Z_t172_t173_rc7"
]);

function makeTargetWorkspace(label) {
  const targetRoot = mkdtempSync(path.join(tmpdir(), `odd-sdlc-ts-${label}-`));
  mkdirSync(path.join(targetRoot, "specification/requirements"), { recursive: true });
  writeFileSync(
    path.join(targetRoot, "README.md"),
    ["# Installed Workspace", "", "REQ-INSTALL-001: keep installed commands public."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(targetRoot, "specification/INTENT.md"),
    ["# Intent", "", "INT-INSTALL-001: exercise installed odd_sdlc.TS."].join("\n"),
    "utf8"
  );
  return targetRoot;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function sha256ForFile(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function readChecksumMap(filePath) {
  const checksums = new Map();
  for (const line of readFileSync(filePath, "utf8").trim().split("\n")) {
    const match = /^([a-f0-9]{64})  (.+)$/u.exec(line);
    assert(match, `invalid checksum line: ${line}`);
    checksums.set(match[2], match[1]);
  }
  return checksums;
}

function assertChecksum(checksums, snapshotRoot, relativePath) {
  assert.equal(
    checksums.get(relativePath),
    sha256ForFile(path.join(snapshotRoot, relativePath)),
    `checksum mismatch for ${relativePath}`
  );
}

function assertAbgReleaseSnapshotPin(substrate) {
  assert.equal(substrate.packageName, "@abiogenesis/typescript-tenant");
  assert.equal(substrate.packageVersion, ABG_RELEASE_VERSION);
  assert.equal(substrate.dependencyRef, ABG_RELEASE_DEPENDENCY_REF);
  assert.equal(substrate.snapshotRoot, ABG_RELEASE_SNAPSHOT_ROOT);
  assert.equal(substrate.manifestPath, path.join(ABG_RELEASE_SNAPSHOT_ROOT, "release-snapshot-manifest.json"));
  assert.equal(substrate.tarballPath, ABG_RELEASE_TARBALL);
  assert.equal(substrate.tarballSha256, ABG_RELEASE_TARBALL_SHA256);
  assert.equal(substrate.sourceRef, ABG_RELEASE_SOURCE_REF);
  assert.equal(substrate.sourceCommit, ABG_RELEASE_SOURCE_COMMIT);
}

function assertCommandPath(paths, commandName) {
  const commandPath = paths.find((candidate) => path.basename(candidate) === commandName);
  assert(commandPath, `missing ${commandName} command path`);
  assert.equal(existsSync(commandPath), true, `${commandName} command path does not exist`);
  return commandPath;
}

function assertPackageManagerReplayKeepsCommand(targetRoot, commandName) {
  const commandPath = path.join(targetRoot, "node_modules/.bin", commandName);
  assert.equal(existsSync(commandPath), true, `${commandName} missing before npm replay`);
  const result = spawnSync("npm", ["install", "--ignore-scripts"], {
    cwd: targetRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_cache: path.join(targetRoot, ".npm-cache")
    },
    maxBuffer: 1024 * 1024 * 5
  });
  assert.equal(
    result.status,
    0,
    `npm install replay failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  assert.equal(existsSync(commandPath), true, `${commandName} missing after npm replay`);
}

function installedAbgConfigPath(targetRoot) {
  return path.join(targetRoot, ".abiogenesis/config/abg.config.json");
}

async function assertInstalledAbgRuntimeBinding(input) {
  const { targetRoot, bindingPath, installedPackageName } = input;
  assert.equal(
    bindingPath,
    path.join(targetRoot, ".abiogenesis/typescript-runtime.mjs")
  );
  assert.equal(existsSync(bindingPath), true, "missing installed ABG runtime binding");
  const bindingSource = readFileSync(bindingPath, "utf8");
  assert(bindingSource.includes(`from "${installedPackageName}"`));
  assert(bindingSource.includes("createPlugins(input)"));
  assert(bindingSource.includes("createOddSdlcAbgRuntimeBindingPlugins"));
  assert(bindingSource.includes("oddSdlcAbgRuntimeWorkerTransportFromEnv"));
  assert(bindingSource.includes("resolvePolicy(input)"));
  assert(bindingSource.includes("resolveOddSdlcAbgRuntimeBindingPolicy"));
  assert(!bindingSource.includes("executeInstalledOperatorStartWithReentry"));
  assert(!bindingSource.includes("odd-sdlc-ts start"));

  const imported = await import(pathToFileURL(bindingPath).href);
  assert.equal(typeof imported.runtimeBinding, "object");
  assert.equal(typeof imported.runtimeBinding.createPlugins, "function");
  assert.equal(typeof imported.runtimeBinding.resolvePolicy, "function");
  assert.equal(imported.runtimeBinding.fallbackConfigPath, ".abiogenesis/config/abg.config.json");
  assert.equal(imported.runtimeBinding.resolvedPolicy.defaultRegime, "F_P");
  const conformancePolicy = imported.runtimeBinding.resolvePolicy({
    target: { graphFunctionHandle: "Fg_conform_project" }
  });
  assert.equal(conformancePolicy.defaultRegime, "F_D");
  assert.equal(conformancePolicy.dispatchRef, null);
  assert.equal(
    conformancePolicy.resolvedPolicyBundleRef,
    "policy://odd-sdlc/start/F_D"
  );
  const litePolicy = imported.runtimeBinding.resolvePolicy({
    target: { graphFunctionHandle: "lite_design_module_implementation" }
  });
  assert.equal(litePolicy.defaultRegime, "F_P");
  assert.equal(litePolicy.dispatchRef, "dispatch://odd-sdlc/public-start");
  assert.equal(litePolicy.resolvedPolicyBundleRef, "policy://odd-sdlc/start/F_P");
  assert.equal(imported.runtimeBinding.runtimeIdentity.resolvedRuntimeRef, "runtime://abiogenesis/typescript");
  assert.equal(
    imported.runtimeBinding.module.graphFunctions.some((entry) => entry.name === "lite_design_module_implementation"),
    true
  );
}

function assertBootstrapGovernanceText(text) {
  for (const alias of [
    "STDO law",
    "STDO governance",
    "STDO Constitution",
    "STDO Method",
    "STDO-UX"
  ]) {
    assert(text.includes(alias), `missing bootstrap alias ${alias}`);
  }
  for (const methodRef of [
    "workspace://.abiogenesis/docs/standards/SPEC_METHOD.md",
    "workspace://.abiogenesis/docs/standards/TICKET_METHOD.md",
    "workspace://.abiogenesis/docs/standards/DESIGN_MODULE_METHOD.md",
    "workspace://.abiogenesis/docs/standards/ODD_METHOD.md"
  ]) {
    assert(text.includes(methodRef), `missing method reference ${methodRef}`);
  }
  assert(text.includes("Goals -> Intent -> Product -> Requirements -> Design -> Code -> Tests/Proof -> Release"));
  assert(text.includes("the symptom layer is not the re-entry authority"));
  assert(text.includes("fix the ticket execution contract before implementation"));
  assert(text.includes("Agentic Coder CLI as the user interface"));
}

function assertBootstrapGovernanceCarrier(carrier) {
  assert.equal(carrier.kind, "odd_sdlc_bootstrap_governance");
  assert.deepEqual(carrier.aliases, [
    "STDO law",
    "STDO governance",
    "STDO Constitution",
    "STDO Method",
    "STDO-UX"
  ]);
  assert.deepEqual(carrier.methodRefs, [
    "workspace://.abiogenesis/docs/standards/SPEC_METHOD.md",
    "workspace://.abiogenesis/docs/standards/TICKET_METHOD.md",
    "workspace://.abiogenesis/docs/standards/DESIGN_MODULE_METHOD.md",
    "workspace://.abiogenesis/docs/standards/ODD_METHOD.md"
  ]);
  assert.deepEqual(carrier.firstMissingLayerOrder, [
    "Goals",
    "Intent",
    "Product",
    "Requirements",
    "Design",
    "Code",
    "Tests/Proof",
    "Release"
  ]);
  assert.equal(carrier.uiAlias, "STDO-UX");
  assert.match(carrier.executionContractRule, /first missing layer/u);
}

test("T-059 API installs odd_sdlc.TS and ABG runtime into a target workspace", async () => {
  const targetRoot = makeTargetWorkspace("install-api");
  const outcome = await installOddSdlcTypescript({
    targetRoot,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-t059"
  });

  assert.equal(outcome.kind, "installed");
  const expectedProductInstallRoot = oddSdlcTypescriptProductInstallRoot(targetRoot);
  assert.equal(outcome.productInstallRoot, expectedProductInstallRoot);
  assert.equal(outcome.installManifestPath, path.join(expectedProductInstallRoot, "install-manifest.json"));
  assert.equal(
    outcome.installedPackage.tarballPath.startsWith(path.join(expectedProductInstallRoot, "package-pack")),
    true
  );
  assert.equal(existsSync(path.join(expectedProductInstallRoot, "package-extract")), true);
  assert.equal(existsSync(path.join(targetRoot, ".odd_sdlc")), false);
  const oddSdlcCommand = assertCommandPath(outcome.commandPaths, "odd-sdlc-ts");
  assertCommandPath(outcome.commandPaths, "genesis-ts");
  assertCommandPath(outcome.commandPaths, "abiogenesis-ts");
  assert.equal(existsSync(installedAbgConfigPath(targetRoot)), true);
  assert.equal(existsSync(outcome.installManifestPath), true);
  assert.equal(existsSync(outcome.normalizationPath), true);
  assert.equal(existsSync(outcome.bootstrapGuidePath), true);
  assert.equal(existsSync(outcome.manifest.abgRuntimeBindingPath), true);
  const packageJson = readJson(path.join(targetRoot, "package.json"));
  assert.equal(
    packageJson.dependencies["@odd-sdlc/typescript-tenant"],
    `file:${path.relative(targetRoot, outcome.installedPackage.tarballPath)}`
  );
  assert.match(
    packageJson.dependencies["@abiogenesis/typescript-tenant"],
    /^file:\.abiogenesis\/package-pack\//u
  );
  assertPackageManagerReplayKeepsCommand(targetRoot, "odd-sdlc-ts");
  for (const filename of ["AGENTS.md", "CLAUDE.md"]) {
    const instructionPath = path.join(targetRoot, filename);
    assert.equal(existsSync(instructionPath), true, `${filename} was not written`);
    const instructionText = readFileSync(instructionPath, "utf8");
    assert(instructionText.includes("<!-- ODD_SDLC_BOOTLOADER_START -->"));
    assert(instructionText.includes("<!-- ODD_SDLC_BOOTLOADER_END -->"));
    assert(instructionText.includes("odd-sdlc-ts gaps --workspace ."));
    assert(instructionText.includes("odd-sdlc-ts start --workspace . --target next --until blocked"));
    assertBootstrapGovernanceText(instructionText);
  }
  assertBootstrapGovernanceText(readFileSync(outcome.bootstrapGuidePath, "utf8"));

  const manifest = readJson(outcome.installManifestPath);
  assert.equal(manifest.kind, "odd_sdlc_typescript_install_manifest");
  assert.equal(manifest.productInstallRoot, expectedProductInstallRoot);
  assert.deepEqual(
    manifest.instructionFiles.map((entry) => [entry.filename, entry.verified]),
    [
      ["AGENTS.md", true],
      ["CLAUDE.md", true]
    ]
  );
  assert.equal(manifest.packageName, "@odd-sdlc/typescript-tenant");
  assert(manifest.runtimeIdentity.substrateRuntimeRef.includes("@abiogenesis/typescript-tenant"));
  assert.equal(
    manifest.abgRuntimeBindingPath,
    path.join(targetRoot, ".abiogenesis/typescript-runtime.mjs")
  );
  await assertInstalledAbgRuntimeBinding({
    targetRoot,
    bindingPath: manifest.abgRuntimeBindingPath,
    installedPackageName: outcome.installedPackage.packageName
  });
  assertBootstrapGovernanceCarrier(manifest.bootstrapGovernance);
  const normalization = readJson(outcome.normalizationPath);
  assert.equal(normalization.abgRuntimeBindingPath, manifest.abgRuntimeBindingPath);
  assertBootstrapGovernanceCarrier(normalization.bootstrapGovernance);

  const run = spawnSync(oddSdlcCommand, ["gaps", "--workspace", targetRoot], {
    cwd: targetRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      ODD_SDLC_TS_OUTPUT: "json"
    },
    maxBuffer: 1024 * 1024 * 5
  });
  assert.equal(run.status, 0, run.stderr);
  const payload = JSON.parse(run.stdout);
  assert.equal(payload.kind, "odd_sdlc_spec_method_result");
  assert.equal(payload.command, "gaps");
  assert.equal(payload.status, "ok");
  assert.equal(payload.payload.dossier.choosesNextTraversal, false);
});

test("T-129 install preserves editable ABG config and public CLI fails closed on malformed fallback edits", async () => {
  const targetRoot = makeTargetWorkspace("install-abg-fallback-config");
  const outcome = await installOddSdlcTypescript({
    targetRoot,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-t129"
  });
  assert.equal(outcome.kind, "installed");
  assertCommandPath(outcome.commandPaths, "odd-sdlc-ts");
  const genesisCommand = assertCommandPath(outcome.commandPaths, "genesis-ts");
  assertCommandPath(outcome.commandPaths, "abiogenesis-ts");

  const configPath = installedAbgConfigPath(targetRoot);
  assert.equal(existsSync(configPath), true);
  const originalConfig = readJson(configPath);
  const editedConfig = {
    ...originalConfig,
    fallbacks: {
      ...originalConfig.fallbacks,
      bundleRef: "fallback-bundle://odd-sdlc/t129-local-edit"
    }
  };
  writeFileSync(configPath, `${JSON.stringify(editedConfig, null, 2)}\n`, "utf8");

  await installOddSdlcTypescript({
    targetRoot,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
    installedPackageName: "odd-sdlc-t129"
  });

  assert.equal(
    readJson(configPath).fallbacks.bundleRef,
    editedConfig.fallbacks.bundleRef
  );
  const packageJson = readJson(path.join(targetRoot, "package.json"));
  assert.match(
    packageJson.dependencies["@odd-sdlc/typescript-tenant"],
    /^file:\.abiogenesis\/odd_sdlc\/typescript\/package-pack\//u
  );
  assert.match(
    packageJson.dependencies["@abiogenesis/typescript-tenant"],
    /^file:\.abiogenesis\/package-pack\//u
  );

  const malformedConfig = {
    ...editedConfig,
    fallbacks: {
      ...editedConfig.fallbacks,
      pluginTraversalObserverBindings: {
        ...editedConfig.fallbacks.pluginTraversalObserverBindings,
        transform: {
          ...editedConfig.fallbacks.pluginTraversalObserverBindings.transform,
          observerPromptRef: ""
        }
      }
    }
  };
  writeFileSync(configPath, `${JSON.stringify(malformedConfig, null, 2)}\n`, "utf8");
  const malformedRun = spawnSync(
    genesisCommand,
    ["gaps", "--scope", "workspace", "--workspace", targetRoot],
    {
      cwd: targetRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        ODD_SDLC_TS_OUTPUT: "json"
      },
      maxBuffer: 1024 * 1024 * 5
    }
  );
  assert.notEqual(malformedRun.status, 0);
  assert.match(`${malformedRun.stdout}\n${malformedRun.stderr}`, /observerPromptRef/u);
});

test("T-059 CLI install command uses the async bounded adapter", async () => {
  const targetRoot = makeTargetWorkspace("install-cli");
  writeFileSync(path.join(targetRoot, "AGENTS.md"), "# Existing Agents\n\nKeep this guidance.\n", "utf8");
  writeFileSync(path.join(targetRoot, "CLAUDE.md"), "# Existing Claude\n\nKeep this guidance.\n", "utf8");
  const result = await invokeOddSdlcSpecMethodCommand([
    "install",
    "--target",
    targetRoot,
    "--package-source",
    PACKAGE_ROOT,
    "--abg-package-source",
    ABG_TYPESCRIPT_ROOT,
    "--installed-package-name",
    "odd-sdlc-t059-cli"
  ]);

  assert.equal(result.status, "ok");
  assert.equal(result.command, "install");
  assert.equal(result.payload.kind, "installed");
  assert.equal(result.payload.productInstallRoot, oddSdlcTypescriptProductInstallRoot(targetRoot));
  assert.equal(existsSync(path.join(targetRoot, ".odd_sdlc")), false);
  assert.deepEqual(
    result.payload.instructionFiles.map((entry) => [entry.filename, entry.action, entry.verified]),
    [
      ["AGENTS.md", "prepended", true],
      ["CLAUDE.md", "prepended", true]
    ]
  );
  assert(readFileSync(path.join(targetRoot, "AGENTS.md"), "utf8").includes("Keep this guidance."));
  assert(readFileSync(path.join(targetRoot, "CLAUDE.md"), "utf8").includes("Keep this guidance."));
  assertCommandPath(result.payload.commandPaths, "odd-sdlc-ts");
  const packageJson = readJson(path.join(targetRoot, "package.json"));
  assert.match(
    packageJson.dependencies["@odd-sdlc/typescript-tenant"],
    /^file:\.abiogenesis\/odd_sdlc\/typescript\/package-pack\//u
  );
  assert.match(
    packageJson.dependencies["@abiogenesis/typescript-tenant"],
    /^file:\.abiogenesis\/package-pack\//u
  );

  const syncResult = invokeOddSdlcSpecMethodCommandSync(["install", "--target", targetRoot]);
  assert.equal(syncResult.status, "error");
  assert.match(syncResult.payload.error, /invokeOddSdlcSpecMethodCommand/u);
});

test("T-177 CLI install resolves the pinned ABG release package by default", async () => {
  const targetRoot = makeTargetWorkspace("install-cli-default-abg");
  const result = await invokeOddSdlcSpecMethodCommand([
    "install",
    "--target",
    targetRoot,
    "--package-source",
    PACKAGE_ROOT,
    "--installed-package-name",
    "odd-sdlc-t124-default-abg"
  ]);

  assert.equal(result.status, "ok");
  assert.equal(result.command, "install");
  assert.equal(result.payload.kind, "installed");
  assertCommandPath(result.payload.commandPaths, "odd-sdlc-ts");
  assertCommandPath(result.payload.commandPaths, "abiogenesis-ts");
  assert.equal(existsSync(path.join(targetRoot, ".odd_sdlc")), false);
  assert.equal(
    result.payload.abgOutcome.packageSourceRoot,
    path.join(PACKAGE_ROOT, "node_modules/@abiogenesis/typescript-tenant")
  );
  assert.equal(result.payload.abgOutcome.packageVersion, ABG_RELEASE_VERSION);
  assert.equal(result.payload.abgOutcome.docsSourceRoot, resolve(REPO_ROOT, "../abiogenesis/docs"));
  assert.equal(
    result.payload.abgOutcome.standardsSourceRoot,
    resolve(REPO_ROOT, "../specification_methodology/specification/standards")
  );
});

test("T-177 default ABG source-root prefers packaged release dependency", () => {
  assert.equal(
    resolveDefaultAbgPackageSourceRoot(PACKAGE_ROOT),
    path.join(PACKAGE_ROOT, "node_modules/@abiogenesis/typescript-tenant")
  );
  assert.equal(
    resolveDefaultAbgDocsSourceRoot(PACKAGE_ROOT),
    resolve(REPO_ROOT, "../abiogenesis/docs")
  );
  assert.equal(
    resolveDefaultAbgStandardsSourceRoot(PACKAGE_ROOT),
    resolve(REPO_ROOT, "../specification_methodology/specification/standards")
  );
});

test("T-124 default ABG source-root falls back to packaged dependency", () => {
  const packageRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-ts-t124-package-"));
  writeFileSync(
    path.join(packageRoot, "package.json"),
    JSON.stringify({ name: "@odd-sdlc/typescript-tenant" }),
    "utf8"
  );
  const dependencyRoot = path.join(
    packageRoot,
    "node_modules/@abiogenesis/typescript-tenant"
  );
  mkdirSync(dependencyRoot, { recursive: true });
  writeFileSync(
    path.join(dependencyRoot, "package.json"),
    JSON.stringify({ name: "@abiogenesis/typescript-tenant" }),
    "utf8"
  );

  assert.equal(resolveDefaultAbgPackageSourceRoot(packageRoot), dependencyRoot);
});

test("T-059 release-cut adapter writes package artifact and binary evidence", async () => {
  const archiveRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-ts-release-"));
  const outcome = await deriveOddSdlcTypescriptReleaseCut({
    packageSourceRoot: PACKAGE_ROOT,
    archiveRoot
  });

  assert.equal(outcome.kind, "odd_sdlc_typescript_release_cut");
  assert.equal(existsSync(outcome.packedPackage.tarballPath), true);
  assert.equal(existsSync(outcome.releaseManifestPath), true);
  assert.equal(existsSync(outcome.postmortemPath), true);
  assert.equal(outcome.manifest.binaryBinding.commandName, "odd-sdlc-ts");
  assert.equal(
    outcome.manifest.binaryBinding.relativePackageCommandPath,
    "./build/semantic/code/src/cli/main.js"
  );

  const cliResult = await invokeOddSdlcSpecMethodCommand([
    "release-cut",
    "--archive-root",
    path.join(archiveRoot, "cli"),
    "--package-source",
    PACKAGE_ROOT
  ]);
  assert.equal(cliResult.status, "ok");
  assert.equal(cliResult.payload.kind, "odd_sdlc_typescript_release_cut");
});

test("T-177 release-snapshot adapter writes versioned package evidence and ABG substrate pin", async () => {
  const snapshotRoot = path.join(
    mkdtempSync(path.join(tmpdir(), "odd-sdlc-ts-release-snapshot-")),
    ODD_SDLC_PACKAGE_VERSION
  );
  const outcome = await deriveOddSdlcTypescriptReleaseSnapshot({
    releaseIdentity: ODD_SDLC_PACKAGE_VERSION,
    packageSourceRoot: PACKAGE_ROOT,
    snapshotRoot,
    expectedPackageName: "@odd-sdlc/typescript-tenant",
    expectedPackageVersion: ODD_SDLC_PACKAGE_VERSION,
    allowDirtySource: true,
    npmCacheRoot: path.join(dirname(snapshotRoot), ".npm-cache")
  });

  assert.equal(outcome.kind, "created");
  assert.equal(existsSync(outcome.manifestPath), true);
  assert.equal(existsSync(outcome.checksumPath), true);
  assert.equal(
    existsSync(
      path.join(
        snapshotRoot,
        `odd-sdlc-typescript-tenant-${ODD_SDLC_PACKAGE_VERSION}.tgz`
      )
    ),
    true
  );
  assert.equal(outcome.manifest.kind, "odd_sdlc_release_snapshot_manifest");
  assertAbgReleaseSnapshotPin(outcome.manifest.abgSubstrate);

  const manifest = readJson(outcome.manifestPath);
  assertAbgReleaseSnapshotPin(manifest.abgSubstrate);

  const cliSnapshotRoot = path.join(
    mkdtempSync(path.join(tmpdir(), "odd-sdlc-ts-release-snapshot-cli-")),
    ODD_SDLC_PACKAGE_VERSION
  );
  const cliResult = await invokeOddSdlcSpecMethodCommand([
    "release-snapshot",
    "--release-identity",
    ODD_SDLC_PACKAGE_VERSION,
    "--snapshot-root",
    cliSnapshotRoot,
    "--package-source",
    PACKAGE_ROOT,
    "--expected-package-name",
    "@odd-sdlc/typescript-tenant",
    "--expected-package-version",
    ODD_SDLC_PACKAGE_VERSION,
    "--allow-dirty-source",
    "--npm-cache-root",
    path.join(dirname(cliSnapshotRoot), ".npm-cache")
  ]);
  assert.equal(cliResult.status, "ok");
  assert.equal(cliResult.payload.kind, "created");
  assertAbgReleaseSnapshotPin(cliResult.payload.manifest.abgSubstrate);
});

test("T-177 migrated release-cut archives live under root release snapshots", () => {
  assert.equal(
    existsSync(path.join(REPO_ROOT, ".ai-workspace/release-cuts/typescript")),
    false
  );

  const actualReleaseIds = new Set(
    readdirSync(ODD_SDLC_RELEASE_SNAPSHOT_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  );
  for (const releaseIdentity of LEGACY_ODD_SDLC_RELEASE_SNAPSHOT_IDS) {
    assert(actualReleaseIds.has(releaseIdentity), `missing ${releaseIdentity}`);
    const snapshotRoot = path.join(
      ODD_SDLC_RELEASE_SNAPSHOT_ROOT,
      releaseIdentity
    );
    const manifestPath = path.join(snapshotRoot, "release-snapshot-manifest.json");
    const checksumPath = path.join(snapshotRoot, "checksums.sha256");
    const manifest = readJson(manifestPath);

    assert.equal(manifest.kind, "odd_sdlc_legacy_release_snapshot_manifest");
    assert.equal(manifest.releaseIdentity, releaseIdentity);
    assert.equal(
      manifest.migratedFrom,
      `.ai-workspace/release-cuts/typescript/${releaseIdentity}`
    );
    assert.equal(manifest.legacyAbgSubstrateRecorded, false);
    assert.match(manifest.legacyAbgSubstrateNote, /did not record/u);
    assert.equal(manifest.package.packageName, "@odd-sdlc/typescript-tenant");
    assert.equal(manifest.package.packageVersion, "0.0.0-dev");
    assert.equal(
      manifest.tarball.relativePath,
      "odd-sdlc-typescript-tenant-0.0.0-dev.tgz"
    );
    assert.equal(
      manifest.legacyReleaseCutManifest.relativePath,
      "legacy-release-cut-manifest.json"
    );
    assert.equal(manifest.releaseNote.relativePath, "release-note.md");
    assert.equal(manifest.checksumFile, "checksums.sha256");

    const releaseNote = readFileSync(
      path.join(snapshotRoot, "release-note.md"),
      "utf8"
    );
    assert(releaseNote.includes("legacy release-cut manifest did not record an ABG release snapshot pin"));

    const checksumMap = readChecksumMap(checksumPath);
    const expectedChecksumPaths = [
      manifest.tarball.relativePath,
      manifest.releaseNote.relativePath,
      manifest.legacyReleaseCutManifest.relativePath,
      "release-snapshot-manifest.json",
      ...manifest.legacyArtifacts.map((artifact) => artifact.relativePath)
    ];
    for (const relativePath of expectedChecksumPaths) {
      assert.equal(existsSync(path.join(snapshotRoot, relativePath)), true);
      assertChecksum(checksumMap, snapshotRoot, relativePath);
    }
    assert.equal(checksumMap.has("checksums.sha256"), false);
  }
});

test("T-059 install and release adapters do not own traversal selection", () => {
  const installSource = readFileSync(
    resolve(PACKAGE_ROOT, "code/src/install/installer.ts"),
    "utf8"
  );
  const releaseSource = readFileSync(
    resolve(PACKAGE_ROOT, "code/src/release/release_cut.ts"),
    "utf8"
  );
  const releaseSnapshotSource = readFileSync(
    resolve(PACKAGE_ROOT, "code/src/release/release_snapshot.ts"),
    "utf8"
  );
  assert(!installSource.includes("publicStartOnce"));
  assert(!installSource.includes("deriveAdvancementTransition"));
  assert(!releaseSource.includes("publicStartOnce"));
  assert(!releaseSource.includes("deriveAdvancementTransition"));
  assert(!releaseSnapshotSource.includes("publicStartOnce"));
  assert(!releaseSnapshotSource.includes("deriveAdvancementTransition"));
});
