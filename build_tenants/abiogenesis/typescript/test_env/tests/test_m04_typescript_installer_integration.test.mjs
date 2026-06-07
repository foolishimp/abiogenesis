// Validates: REQ-P-QUAL-018G
// Validates: REQ-P-QUAL-018H
// Validates: REQ-P-QUAL-018I
// Validates: REQ-P-SCENARIOS
// Validates: REQ-P-INSTALL

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
    fallbackConfigPath: input.outcome.fallbackConfigPath,
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
    fallbackConfigPath: input.outcome.fallbackConfigPath,
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
    fallbackConfigSourcePath: input.outcome.fallbackConfigSourcePath,
    fallbackConfigPath: input.outcome.fallbackConfigPath,
    fallbackConfigFile: input.outcome.fallbackConfigFile
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
    `- fallback config: ${installerManifest.fallbackConfigPath}`,
    `- standards: ${installerManifest.standardsInstallRoot}`,
      `- bootstrap dependency: ${installManifest.runtimePackage.dependencyRef}`
    ].join("\n"),
    "utf8"
  );

  return archiveRoot;
}

function runInstalledCommand(targetRoot, commandName, args) {
  return spawnSync(
    path.join(targetRoot, "node_modules", ".bin", commandName),
    args,
    {
      cwd: targetRoot,
      encoding: "utf8"
    }
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
  await writeFile(
    probePath,
    `
      import { start } from "@abiogenesis/typescript-tenant/app/m04";
      import {
        installAbiogenesisTypescript,
        verifyAbiogenesisTypescriptInstallTopology
      } from "@abiogenesis/typescript-tenant/app/m04/install-bootstrap";

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

  const outcome = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: targetRoot
    },
    packageSourceRoot: sourceRoot
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
      path.join(targetRoot, "node_modules", ".bin", "genesis-ts")
    ),
    true
  );
  assert.equal((await lstat(outcome.packageRoot)).isSymbolicLink(), false);

  const manifest = JSON.parse(await readFile(outcome.installerManifestPath, "utf8"));
  assert.equal(manifest.kind, "abg_typescript_installer_manifest");
  assert.equal(manifest.packageRoot, outcome.packageRoot);
  assert.equal(manifest.targetMode, "clean_no_project_authority");
  assert.equal(manifest.installMode, "fresh");
  assert.equal(manifest.cleanTargetPolicy, "no_scaffold");
  assert.equal(manifest.standardsInstallRoot, outcome.standardsInstallRoot);
  assert.equal(manifest.docsInstallRoot, outcome.docsInstallRoot);
  assert.equal(manifest.runtimeBindingPath, outcome.runtimeBindingPath);
  assert.equal(manifest.fallbackConfigPath, outcome.fallbackConfigPath);
  assert.equal(
    manifest.fallbackConfigSourcePath,
    path.join(sourceRoot, "config", "abg.config.json")
  );
  assert.equal(
    manifest.fallbackConfigFile.relativePath,
    path.join(".abiogenesis", "config", "abg.config.json")
  );
  assert.equal(
    await pathExists(
      path.join(targetRoot, ".abiogenesis", "config", "abg.config.json")
    ),
    true
  );
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
  assert.equal(topology.fallbackConfigPresent, true);
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
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
      "payload_observed",
      "payload_validated",
      "fd_authority_outcome_admitted",
    "vector_evaluated",
    "vector_closed",
    "fd_advance_ready",
    "payload_observed",
    "payload_validated",
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

  const first = await installAbiogenesisTypescript({
    targetRoot: {
      rootPath: targetRoot
    },
    packageSourceRoot: sourceRoot,
    installedPackageName: "abiogenesis-t078-repeat"
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
    installedPackageName: "abiogenesis-t078-repeat"
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
  const topology = await verifyAbiogenesisTypescriptInstallTopology({
    targetRoot: secondTarget
  });
  assert.equal(topology.complete, true);
  assert.equal(topology.standardsSmokeFilesPresent, true);
  assert.equal(topology.fallbackConfigPresent, true);
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
