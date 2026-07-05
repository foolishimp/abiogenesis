// Validates: REQ-P-QUAL-018G
// Validates: REQ-P-QUAL-018H
// Validates: REQ-P-QUAL-018I
// Validates: REQ-P-SCENARIOS
// Validates: REQ-P-INSTALL

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

import {
  installAbiogenesisTypescript,
  verifyAbiogenesisTypescriptInstallTopology
} from "../../build/semantic/code/src/app/m04/install_bootstrap/index.js";

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
    runtimeBindingPath: input.outcome.runtimeBindingPath,
    abgConfigPath: input.outcome.abgConfigPath,
    startedAt: new Date().toISOString(),
    command: "npm run test:t076"
  });
  await writeJson(path.join(archiveRoot, "summary.json"), {
    converged: true,
    packageName: input.outcome.packageName,
    packageVersion: input.outcome.packageVersion,
    installManifestPath: input.outcome.installManifestPath,
    installerManifestPath: input.outcome.installerManifestPath,
    installProvenancePath: input.outcome.installProvenancePath,
    runtimeBindingPath: input.outcome.runtimeBindingPath,
    abgConfigPath: input.outcome.abgConfigPath,
    standardsInstallRoot: input.outcome.standardsInstallRoot,
    docsInstallRoot: input.outcome.docsInstallRoot,
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
  await writeJson(path.join(artifactsRoot, "standards_inventory.json"), {
    standardsSourceRoot: input.outcome.standardsSourceRoot,
    standardsInstallRoot: input.outcome.standardsInstallRoot,
    standardsFiles: input.outcome.standardsFiles
  });
  await writeJson(path.join(artifactsRoot, "docs_inventory.json"), {
    docsSourceRoot: input.outcome.docsSourceRoot,
    docsInstallRoot: input.outcome.docsInstallRoot,
    docsFiles: input.outcome.docsFiles
  });
  await writeJson(
    path.join(artifactsRoot, "runtime_identity.json"),
    input.outcome.runtimeIdentity
  );
  await writeJson(path.join(artifactsRoot, "runtime_binding.json"), {
    runtimeBindingPath: input.outcome.runtimeBindingPath
  });
  await writeJson(path.join(artifactsRoot, "projection.json"), {
    installerOutcomeKind: input.outcome.kind,
    installVerification: input.outcome.installBootstrapOutcome.verification,
    packageRoot: input.outcome.packageRoot,
    commandPaths: input.outcome.commandPaths,
    runtimeBindingPath: input.outcome.runtimeBindingPath,
    eventsPath: input.outcome.eventsPath,
    runtimeDirectory: input.outcome.runtimeDirectory,
    topologyVerification: input.outcome.topologyVerification
  });
  await writeJson(path.join(artifactsRoot, "fallback_config_inventory.json"), {
    abgConfigSourcePath: input.outcome.abgConfigSourcePath,
    abgConfigPath: input.outcome.abgConfigPath,
    abgConfigFile: input.outcome.abgConfigFile
  });
  await copyTextFile(
    input.outcome.installerManifestPath,
    path.join(artifactsRoot, "typescript-installer-manifest.json")
  );
  await copyTextFile(
    input.outcome.installManifestPath,
    path.join(artifactsRoot, "install-manifest.json")
  );
  await copyTextFile(
    input.outcome.installProvenancePath,
    path.join(artifactsRoot, "install-provenance.json")
  );
  await copyTextFile(
    input.outcome.runtimeBindingPath,
    path.join(artifactsRoot, "cli-runtime.mjs")
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
    `- runtime binding: ${installerManifest.runtimeBindingPath}`,
    `- fallback config: ${installerManifest.abgConfigPath}`,
    `- standards: ${installerManifest.standardsInstallRoot}`,
      `- bootstrap dependency: ${installManifest.runtimePackage.dependencyRef}`
    ].join("\n"),
    "utf8"
  );

  return archiveRoot;
}

function runInstalledCommand(targetRoot, commandName, args) {
  const installerManifest = JSON.parse(
    readFileSync(
      path.join(targetRoot, ".abiogenesis", "typescript-installer-manifest.json"),
      "utf8"
    )
  );
  const commandPath = installerManifest.commandPaths.find((candidate) =>
    candidate.endsWith(`${path.sep}${commandName}`)
  );
  assert.notEqual(commandPath, undefined);
  return spawnSync(
    commandPath,
    args,
    {
      cwd: targetRoot,
      encoding: "utf8"
    }
  );
}

function sourceCliPath(sourceRoot) {
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

function parseCommandPayload(run) {
  assert.notEqual(run.stdout.trim(), "", run.stderr);
  return JSON.parse(run.stdout);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function runInstalledProbe(targetRoot) {
  const probePath = path.join(targetRoot, ".abiogenesis", "public-installer-probe.mjs");
  const installerManifest = JSON.parse(
    await readFile(
      path.join(targetRoot, ".abiogenesis", "typescript-installer-manifest.json"),
      "utf8"
    )
  );
  const appM04Index = pathToFileURL(
    path.join(
      installerManifest.packageRoot,
      "build",
      "semantic",
      "code",
      "src",
      "app",
      "m04",
      "index.js"
    )
  ).href;
  const installBootstrapIndex = pathToFileURL(
    path.join(
      installerManifest.packageRoot,
      "build",
      "semantic",
      "code",
      "src",
      "app",
      "m04",
      "install_bootstrap",
      "index.js"
    )
  ).href;
  await writeFile(
    probePath,
    `
      import { start } from ${JSON.stringify(appM04Index)};
      import {
        installAbiogenesisTypescript,
        verifyAbiogenesisTypescriptInstallTopology
      } from ${JSON.stringify(installBootstrapIndex)};

      const topology = await verifyAbiogenesisTypescriptInstallTopology({
        targetRoot: process.cwd()
      });

      console.log(JSON.stringify({
        start: typeof start,
        installer: typeof installAbiogenesisTypescript,
        topologyVerifier: typeof verifyAbiogenesisTypescriptInstallTopology,
        topologyComplete: topology.complete,
        topologyMissingPaths: topology.missingPaths.length
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
  const toolchainRoot = await makeTargetRoot("public-installer-toolchain");

  const outcome = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: targetRoot
    },
    packageSourceRoot: sourceRoot,
    toolchainRoot
  });

  assert.equal(outcome.kind, "installed");
  assert.equal(outcome.packageName, "@abiogenesis/typescript-tenant");
  assert.equal(outcome.installBootstrapOutcome.kind, "installed");
  assert.equal(outcome.targetMode, "clean_no_project_authority");
  assert.equal(outcome.cleanTargetPolicy, "no_scaffold");
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
      outcome.commandPaths.find((candidate) =>
        candidate.endsWith(`${path.sep}genesis-ts`)
      )
    ),
    true
  );
  assert.equal(
    await pathExists(
      outcome.commandPaths.find((candidate) =>
        candidate.endsWith(`${path.sep}abg.install`)
      )
    ),
    true
  );
  assert.equal(
    await pathExists(
      path.join(targetRoot, "node_modules", "@abiogenesis", "typescript-tenant")
    ),
    false
  );
  assert.equal((await lstat(outcome.packageRoot)).isSymbolicLink(), false);

  const manifest = JSON.parse(await readFile(outcome.installerManifestPath, "utf8"));
  assert.equal(manifest.kind, "abg_typescript_installer_manifest");
  assert.equal(manifest.packageRoot, outcome.packageRoot);
  assert.equal(manifest.toolchainBinding.schemaVersion, "2");
  assert.equal(manifest.toolchainBinding.toolchainRoot, toolchainRoot);
  assert.equal(outcome.packageRoot.startsWith(toolchainRoot), true);
  assert.equal(outcome.docsInstallRoot.startsWith(toolchainRoot), true);
  assert.equal(outcome.standardsInstallRoot.startsWith(toolchainRoot), true);
  assert.equal(manifest.targetMode, "clean_no_project_authority");
  assert.equal(manifest.installMode, "fresh");
  assert.equal(manifest.cleanTargetPolicy, "no_scaffold");
  assert.equal(manifest.standardsInstallRoot, outcome.standardsInstallRoot);
  assert.equal(manifest.docsInstallRoot, outcome.docsInstallRoot);
  assert.equal(manifest.runtimeBindingPath, outcome.runtimeBindingPath);
  assert.equal(manifest.abgConfigPath, outcome.abgConfigPath);
  assert.equal(
    manifest.abgConfigSourcePath,
    path.join(sourceRoot, "config", "abg.config.json")
  );
  assert.equal(
    manifest.abgConfigFile.relativePath,
    path.join(".abiogenesis", "config", "abg.config.json")
  );
  assert.equal(
    manifest.installedContextFile.relativePath,
    path.join(".abiogenesis", "context", "ABG_GTL_CONTEXT.md")
  );
  assert.equal(manifest.installedInstructionFiles.length, 2);
  assert.equal(
    manifest.installedInstructionFiles.some(
      (entry) => entry.relativePath === "AGENTS.md"
    ),
    true
  );
  assert.equal(
    manifest.installedInstructionFiles.some(
      (entry) => entry.relativePath === "CLAUDE.md"
    ),
    true
  );
  assert.equal(
    await pathExists(
      path.join(targetRoot, ".abiogenesis", "config", "abg.config.json")
    ),
    true
  );
  const installedContext = await readFile(
    path.join(targetRoot, ".abiogenesis", "context", "ABG_GTL_CONTEXT.md"),
    "utf8"
  );
  assert.match(
    installedContext,
    new RegExp(`Version: ${outcome.packageVersion.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}`, "u")
  );
  assert.match(
    installedContext,
    /graph-function library -> graph overlay\/program -> workspace binding -> ABG traversal -> replay interpretation/u
  );
  for (const instructionFile of ["AGENTS.md", "CLAUDE.md"]) {
    const instruction = await readFile(path.join(targetRoot, instructionFile), "utf8");
    assert.match(instruction, /<!-- ABG_GTL_CONTEXT_START -->/u);
    assert.match(instruction, /<!-- ABG_GTL_CONTEXT_END -->/u);
    assert.match(instruction, /A GraphFunction is a reusable workflow library function/u);
  }
  assert(manifest.standardsFiles.length > 8);
  assert(manifest.docsFiles.length >= 3);
  assert.deepStrictEqual(manifest.commandPaths, outcome.commandPaths);
  assert.deepStrictEqual(manifest.runtimeIdentity, {
    workerId: "abiogenesis-typescript-installer",
    backendId: "node",
    buildId: outcome.packageVersion,
    resolvedRuntimeRef: `package:${outcome.packageName}@${outcome.packageVersion}`
  });

  const topology = await verifyAbiogenesisTypescriptInstallTopology({ targetRoot });
  assert.equal(topology.complete, true);
  assert.deepStrictEqual(topology.missingPaths, []);
  assert.equal(topology.standardsRootPresent, true);
  assert.equal(topology.standardsSmokeFilesPresent, true);
  assert.equal(topology.docsRootPresent, true);
  assert.equal(topology.runtimeBindingPresent, true);
  assert.equal(topology.abgConfigPresent, true);
  assert.equal(topology.installedContextPresent, true);
  assert.equal(topology.installedInstructionContextPresent, true);
  assert.deepStrictEqual(topology, outcome.topologyVerification);

  for (const relativePath of [
    "README.md",
    "SPEC_METHOD.md",
    "TICKET_METHOD.md",
    "DESIGN_MODULE_METHOD.md",
    "ODD_METHOD.md",
    "RELEASE_METHOD.md",
    "WRITING_GUIDE.md",
    "POSTING_GUIDE.md",
    "GLOSSARY_GUIDE.md",
    path.join("templates", "README.md")
  ]) {
    assert.equal(
      await pathExists(path.join(outcome.standardsInstallRoot, relativePath)),
      true
    );
  }
  for (const relativePath of [
    "README.md",
    "LLM_GTL_APP_BUILDER_GUIDE.md",
    "USER_GUIDE.md"
  ]) {
    assert.equal(await pathExists(path.join(outcome.docsInstallRoot, relativePath)), true);
  }
  const provenance = JSON.parse(await readFile(outcome.installProvenancePath, "utf8"));
  assert.equal(provenance.kind, "abg_typescript_install_provenance");
  assert.equal(provenance.installResult, "installed");
  assert.equal(provenance.installMode, "fresh");
  assert.equal(provenance.standardsFileCount, outcome.standardsFiles.length);
  assert.equal(provenance.runtimeBindingPath, outcome.runtimeBindingPath);
  assert.equal(
    await pathExists(path.join(targetRoot, ".abiogenesis", "cli-runtime.mjs")),
    true
  );
  const installedFallbackPath = path.join(
    targetRoot,
    ".abiogenesis",
    "config",
    "abg.config.json"
  );
  assert.equal(await pathExists(installedFallbackPath), true);

  const probe = await runInstalledProbe(targetRoot);
  assert.equal(probe.status, 0, probe.stderr);
  assert.deepStrictEqual(JSON.parse(probe.stdout), {
    start: "function",
    installer: "function",
    topologyVerifier: "function",
    topologyComplete: true,
    topologyMissingPaths: 0
  });

  const openGaps = runInstalledCommand(targetRoot, "genesis-ts", [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(openGaps.status, 0, openGaps.stderr);
  const openGapsPayload = parseCommandPayload(openGaps);
  assert.equal(openGapsPayload.command, "gaps");
  assert.equal(openGapsPayload.status, "open");
  assert.equal(
    openGapsPayload.gaps[0].graph_function_handle,
    "installed_cli_runtime_binding_self_test"
  );

  const abiogenesisOpenGaps = runInstalledCommand(targetRoot, "abiogenesis-ts", [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(abiogenesisOpenGaps.status, 0, abiogenesisOpenGaps.stderr);
  const abiogenesisOpenGapsPayload = parseCommandPayload(abiogenesisOpenGaps);
  assert.equal(abiogenesisOpenGapsPayload.command, "gaps");
  assert.equal(abiogenesisOpenGapsPayload.status, "open");

  const selfTestStart = runInstalledCommand(targetRoot, "genesis-ts", [
    "start",
    "--workspace",
    ".",
    "--scope",
    "workspace",
    "--target",
    "graph_function:installed_cli_runtime_binding_self_test",
    "--until",
    "converged"
  ]);
  assert.equal(selfTestStart.status, 0, selfTestStart.stderr);
  const selfTestStartPayload = parseCommandPayload(selfTestStart);
  assert.equal(selfTestStartPayload.command, "start");
  assert.equal(selfTestStartPayload.status, "converged");
  assert.equal(selfTestStartPayload.stopped_by, "converged");
  assert.deepStrictEqual(selfTestStartPayload.event_kinds, [
    "lever_resolution_admitted",
    "basis_admitted",
    "registry_entry_admitted",
    "graph_function_selected",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "payload_observed",
    "payload_validated",
    "fd_authority_outcome_admitted",
    "vector_evaluated",
    "payload_observed",
    "payload_validated",
    "vector_closed",
    "fd_advance_ready",
    "terminal_reached"
  ]);

  const originalFallbackConfig = JSON.parse(
    await readFile(installedFallbackPath, "utf8")
  );
  const malformedFallbackConfig = {
    ...originalFallbackConfig,
    fallbacks: {
      ...originalFallbackConfig.fallbacks,
      pluginTraversalObserverBindings: {
        ...originalFallbackConfig.fallbacks.pluginTraversalObserverBindings,
        transform: {
          ...originalFallbackConfig.fallbacks.pluginTraversalObserverBindings
            .transform,
          observerPromptRef: ""
        }
      }
    }
  };
  await writeJson(installedFallbackPath, malformedFallbackConfig);
  const malformedFallbackGaps = runInstalledCommand(targetRoot, "genesis-ts", [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(malformedFallbackGaps.status, 1);
  assert.match(
    parseCommandPayload(malformedFallbackGaps).reason,
    /observerPromptRef/u
  );
  await writeJson(installedFallbackPath, originalFallbackConfig);

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
    "artifacts/standards_inventory.json",
    "artifacts/docs_inventory.json",
    "artifacts/fallback_config_inventory.json",
    "artifacts/runtime_identity.json",
    "artifacts/runtime_binding.json",
    "artifacts/install-provenance.json",
    "artifacts/cli-runtime.mjs",
    "artifacts/events.jsonl",
    "artifacts/projection.json"
  ]) {
    assert.equal(await pathExists(path.join(archiveRoot, relativePath)), true);
  }
});

test("T-078 public TypeScript installer refreshes repeated installs over admitted package state", async () => {
  const repoRoot = await locateRepoRoot();
  const sourceRoot = tenantRoot(repoRoot);
  const targetRoot = await makeTargetRoot("repeat-installer");
  const toolchainRoot = await makeTargetRoot("repeat-installer-toolchain");

  const first = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: targetRoot
    },
    packageSourceRoot: sourceRoot,
    installedPackageName: "abiogenesis-t078-repeat",
    toolchainRoot
  });
  assert.equal(first.kind, "installed");
  assert.equal(first.installMode, "fresh");

  const firstPackageJson = await readJson(path.join(targetRoot, "package.json"));
  const firstDependency =
    firstPackageJson.dependencies["@abiogenesis/typescript-tenant"];
  assert.equal(firstDependency, `file:${path.relative(targetRoot, first.tarballPath)}`);
  // T-118: the consolidated abg.config.json (fallbacks + levers + targetCarriers)
  // must be preserved across refresh.
  const abgConfigPath = path.join(
    targetRoot,
    ".abiogenesis",
    "config",
    "abg.config.json"
  );
  const customizedConfig = await readJson(abgConfigPath);
  customizedConfig.fallbacks.bundleRef = "fallback-bundle://abg/t078-local-edit";
  customizedConfig.fallbacks.pluginTraversalObserverBindings.transform.observerPromptRef =
    "prompt://tenant/t078-local-transform-observer";
  customizedConfig.levers.bundleRef = "lever-overrides://abg/t078-local-edit";
  await writeJson(abgConfigPath, customizedConfig);

  const second = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: targetRoot
    },
    packageSourceRoot: sourceRoot,
    installedPackageName: "abiogenesis-t078-repeat",
    toolchainRoot
  });
  assert.equal(second.kind, "installed");
  assert.equal(second.installMode, "refresh");
  assert.notEqual(second.tarballPath, first.tarballPath);

  const secondPackageJson = await readJson(path.join(targetRoot, "package.json"));
  const secondDependency =
    secondPackageJson.dependencies["@abiogenesis/typescript-tenant"];
  assert.equal(secondPackageJson.name, "abiogenesis-t078-repeat");
  assert.equal(secondDependency, `file:${path.relative(targetRoot, second.tarballPath)}`);
  assert.notEqual(secondDependency, firstDependency);

  const installManifest = await readJson(second.installManifestPath);
  assert.equal(installManifest.installedPackageName, "abiogenesis-t078-repeat");
  assert.equal(installManifest.runtimePackage.dependencyRef, secondDependency);

  const installerManifest = await readJson(second.installerManifestPath);
  assert.equal(installerManifest.installMode, "refresh");
  assert.equal(installerManifest.tarballPath, second.tarballPath);
  assert.equal(await pathExists(abgConfigPath), true);
  const refreshedConfig = await readJson(abgConfigPath);
  assert.equal(
    refreshedConfig.fallbacks.bundleRef,
    "fallback-bundle://abg/t078-local-edit"
  );
  assert.equal(
    refreshedConfig.fallbacks.pluginTraversalObserverBindings.transform.observerPromptRef,
    "prompt://tenant/t078-local-transform-observer"
  );
  assert.equal(
    refreshedConfig.levers.bundleRef,
    "lever-overrides://abg/t078-local-edit"
  );

  const provenance = await readJson(second.installProvenancePath);
  assert.equal(provenance.installMode, "refresh");
  assert.equal(provenance.installResult, "installed");

  const topology = await verifyAbiogenesisTypescriptInstallTopology({ targetRoot });
  assert.equal(topology.complete, true);
  assert.deepStrictEqual(topology.missingPaths, []);

  const openGaps = runInstalledCommand(targetRoot, "genesis-ts", [
    "gaps",
    "--workspace",
    ".",
    "--scope",
    "workspace"
  ]);
  assert.equal(openGaps.status, 0, openGaps.stderr);
  assert.equal(parseCommandPayload(openGaps).status, "open");
});

test("T-181 CLI install refresh preserves existing installed package identity when name flag is omitted", async () => {
  const repoRoot = await locateRepoRoot();
  const sourceRoot = tenantRoot(repoRoot);
  const targetRoot = await makeTargetRoot("upgrade-installer");
  const toolchainRoot = await makeTargetRoot("upgrade-installer-toolchain");

  const first = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: targetRoot
    },
    packageSourceRoot: sourceRoot,
    installedPackageName: "abiogenesis-t181-upgrade",
    toolchainRoot
  });
  assert.equal(first.kind, "installed");
  assert.equal(first.installMode, "fresh");

  const refresh = spawnSync(
    process.execPath,
    [
      sourceCliPath(sourceRoot),
      "install",
      "--target",
      targetRoot,
      "--package-source",
      sourceRoot,
      "--toolchain-root",
      toolchainRoot
    ],
    {
      cwd: sourceRoot,
      encoding: "utf8"
    }
  );
  assert.equal(refresh.status, 0, refresh.stderr);
  const refreshPayload = parseCommandPayload(refresh);
  assert.equal(refreshPayload.status, "installed");
  assert.equal(refreshPayload.outcome.installMode, "refresh");
  assert.equal(refreshPayload.outcome.manifest.installedPackageName, "abiogenesis-t181-upgrade");

  const refreshedPackageJson = await readJson(path.join(targetRoot, "package.json"));
  assert.equal(refreshedPackageJson.name, "abiogenesis-t181-upgrade");
  const refreshedInstallManifest = await readJson(
    path.join(targetRoot, ".abiogenesis", "install-manifest.json")
  );
  assert.equal(refreshedInstallManifest.installedPackageName, "abiogenesis-t181-upgrade");

  const conflicting = spawnSync(
    process.execPath,
    [
      sourceCliPath(sourceRoot),
      "install",
      "--target",
      targetRoot,
      "--package-source",
      sourceRoot,
      "--installed-package-name",
      "abiogenesis-t181-wrong",
      "--toolchain-root",
      toolchainRoot
    ],
    {
      cwd: sourceRoot,
      encoding: "utf8"
    }
  );
  assert.notEqual(conflicting.status, 0);
  const conflictingPayload = parseCommandPayload(conflicting);
  assert.equal(conflictingPayload.status, "rejected");
  assert.equal(
    conflictingPayload.outcome.reason,
    "existing package.json name does not match installedPackageName"
  );
});

test("T-076 installed genesis-ts install command can create a second ABG TypeScript install", async () => {
  const repoRoot = await locateRepoRoot();
  const sourceRoot = tenantRoot(repoRoot);
  const firstTarget = await makeTargetRoot("cli-installer-source");
  const secondTarget = await makeTargetRoot("cli-installer-target");
  const firstToolchainRoot = await makeTargetRoot("cli-installer-source-toolchain");
  const secondToolchainRoot = await makeTargetRoot("cli-installer-target-toolchain");
  const first = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: firstTarget
    },
    packageSourceRoot: sourceRoot,
    toolchainRoot: firstToolchainRoot
  });
  assert.equal(first.kind, "installed");
  const genesisCommand = first.commandPaths.find((candidate) =>
    candidate.endsWith(`${path.sep}genesis-ts`)
  );
  assert.notEqual(genesisCommand, undefined);

  const run = spawnSync(
    genesisCommand,
    [
      "install",
      "--target",
      secondTarget,
      "--toolchain-root",
      secondToolchainRoot
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
  const topology = await verifyAbiogenesisTypescriptInstallTopology({
    targetRoot: secondTarget
  });
  assert.equal(topology.complete, true);
  assert.equal(topology.standardsSmokeFilesPresent, true);
  assert.equal(topology.abgConfigPresent, true);
  const secondManifest = await readJson(
    path.join(secondTarget, ".abiogenesis", "typescript-installer-manifest.json")
  );
  assert.equal(secondManifest.toolchainBinding.toolchainRoot, secondToolchainRoot);
  assert.equal(
    await pathExists(
      secondManifest.commandPaths.find((candidate) =>
        candidate.endsWith(`${path.sep}abiogenesis-ts`)
      )
    ),
    true
  );
});

test("T-186 abg.install bootstraps target context and binding without target-local product install", async () => {
  const repoRoot = await locateRepoRoot();
  const sourceRoot = tenantRoot(repoRoot);
  const installedProductTarget = await makeTargetRoot("context-bootstrap-product");
  const targetRoot = await makeTargetRoot("context-bootstrap-target");
  const toolchainRoot = await makeTargetRoot("context-bootstrap-toolchain");
  const installedProduct = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: installedProductTarget
    },
    packageSourceRoot: sourceRoot,
    toolchainRoot
  });
  assert.equal(installedProduct.kind, "installed");
  const contextCommand = installedProduct.commandPaths.find((candidate) =>
    candidate.endsWith(`${path.sep}abg.install`)
  );
  assert.notEqual(contextCommand, undefined);

  await writeFile(
    path.join(targetRoot, "AGENTS.md"),
    [
      "# Project Agents",
      "<!-- ABG_GTL_CONTEXT_START -->",
      "stale graph functions are the program surface",
      "<!-- ABG_GTL_CONTEXT_END -->",
      "project-owned guidance"
    ].join("\n"),
    "utf8"
  );
  await writeFile(
    path.join(targetRoot, "CLAUDE.md"),
    [
      "# Project Claude",
      "<!-- ABG_GTL_CONTEXT_START -->",
      "stale workflow program abstraction",
      "<!-- ABG_GTL_CONTEXT_END -->"
    ].join("\n"),
    "utf8"
  );

  const firstRun = spawnSync(
    contextCommand,
    ["--target", targetRoot, "--toolchain-root", toolchainRoot],
    {
      cwd: targetRoot,
      encoding: "utf8"
    }
  );
  assert.equal(firstRun.status, 0, firstRun.stderr);
  const firstPayload = parseCommandPayload(firstRun);
  assert.equal(firstPayload.command, "context-bootstrap");
  assert.equal(firstPayload.status, "context_bootstrap_installed");
  assert.equal(firstPayload.outcome.packageVersion, installedProduct.packageVersion);

  const binding = await readJson(
    path.join(targetRoot, ".abiogenesis", "toolchain-binding.json")
  );
  assert.equal(binding.products[0].packageVersion, installedProduct.packageVersion);
  assert.equal(
    binding.products[0].productRoot,
    path.join(toolchainRoot, "products", "abiogenesis", installedProduct.packageVersion)
  );
  assert.equal(
    await pathExists(path.join(targetRoot, ".ai-workspace", "events", "events.jsonl")),
    true
  );
  assert.equal(
    await pathExists(
      path.join(targetRoot, "node_modules", "@abiogenesis", "typescript-tenant")
    ),
    false
  );

  const agents = await readFile(path.join(targetRoot, "AGENTS.md"), "utf8");
  assert.match(agents, /project-owned guidance/u);
  assert.doesNotMatch(agents, /stale graph functions are the program surface/u);
  assert.match(agents, /A GraphFunction is a reusable workflow library function/u);
  const claude = await readFile(path.join(targetRoot, "CLAUDE.md"), "utf8");
  assert.doesNotMatch(claude, /stale workflow program abstraction/u);
  assert.match(claude, /graph overlay\/program -> workspace binding/u);

  const secondRun = spawnSync(
    contextCommand,
    ["--target", targetRoot, "--toolchain-root", toolchainRoot],
    {
      cwd: targetRoot,
      encoding: "utf8"
    }
  );
  assert.equal(secondRun.status, 0, secondRun.stderr);
  const secondPayload = parseCommandPayload(secondRun);
  assert.equal(secondPayload.status, "context_bootstrap_installed");
  assert.equal(
    secondPayload.outcome.installedContextFile.sha256,
    firstPayload.outcome.installedContextFile.sha256
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
