// Validates: REQ-P-INSTALL
// Validates: T-161

import test from "node:test";
import assert from "node:assert/strict";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  stat
} from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));

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

function runNode(command, args, cwd) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10
  });
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

test("T-161 shared toolchain install separates immutable payload from observer and executor state roots", async () => {
  const repoRoot = await locateRepoRoot();
  const sourceRoot = tenantRoot(repoRoot);
  const parentRoot = await mkdtemp(path.join(tmpdir(), "abg-t161-"));
  const toolchainRoot = path.join(parentRoot, "toolchain");
  const cliPath = path.join(
    sourceRoot,
    "build",
    "semantic",
    "code",
    "src",
    "bin",
    "abiogenesis.js"
  );

  async function exerciseTarget(label) {
    const observedRoot = path.join(parentRoot, `${label}-observed-workspace`);
    const observerStateRoot = path.join(
      parentRoot,
      `${label}-observer-state`,
      ".ai-workspace"
    );
    const executorStateRoot = path.join(
      parentRoot,
      `${label}-executor-state`,
      ".ai-workspace"
    );
    const eventRoot = path.join(observerStateRoot, "events");
    const eventLogPath = path.join(eventRoot, "events.jsonl");
    const runtimeRoot = path.join(observerStateRoot, "runtime");
    const projectionRoot = path.join(observerStateRoot, "projections");
    const archiveRoot = path.join(observerStateRoot, "archives");
    await mkdir(observedRoot, { recursive: true });

    const installRun = runNode(
      process.execPath,
      [
        cliPath,
        "install",
        "--target",
        observedRoot,
        "--package-source",
        sourceRoot,
        "--installed-package-name",
        "abg-t161-shared",
        "--toolchain-root",
        toolchainRoot,
        "--observer-state-root",
        observerStateRoot,
        "--executor-state-root",
        executorStateRoot,
        "--event-root",
        eventRoot,
        "--event-log-path",
        eventLogPath,
        "--runtime-root",
        runtimeRoot,
        "--projection-root",
        projectionRoot,
        "--archive-root",
        archiveRoot
      ],
      sourceRoot
    );
    assert.equal(installRun.status, 0, installRun.stderr);
    const installPayload = parsePayload(installRun);
    assert.equal(installPayload.status, "installed");

    const outcome = installPayload.outcome;
    assert.equal(outcome.kind, "installed");
    assert.equal(outcome.manifest.eventsPath, eventLogPath);
    assert.equal(outcome.manifest.runtimeDirectory, runtimeRoot);
    assert.equal(outcome.manifest.projectionDirectory, projectionRoot);
    assert.equal(outcome.manifest.archiveDirectory, archiveRoot);
    assert.equal(outcome.manifest.toolchainBinding.toolchainRoot, toolchainRoot);
    assert.equal(outcome.manifest.toolchainBinding.selectionSource, "explicit");
    assert.equal(
      outcome.manifest.mutableStateRoots.executorStateRoot,
      executorStateRoot
    );
    assert.equal(await isDirectory(outcome.packageRoot), true);
    assert.equal(outcome.packageRoot.startsWith(toolchainRoot), true);
    assert.equal(
      await pathExists(
        path.join(
          observedRoot,
          "node_modules",
          "@abiogenesis",
          "typescript-tenant"
        )
      ),
      false
    );

    const binding = await readJson(
      path.join(observedRoot, ".abiogenesis", "toolchain-binding.json")
    );
    assert.equal(binding.kind, "abg_toolchain_workspace_binding");
    assert.equal(binding.mutableStateRoots.eventLogPath, eventLogPath);
    assert.equal(binding.mutableStateRoots.observedWorkspaceRoot, observedRoot);
    assert.equal(binding.mutableStateRoots.observerStateRoot, observerStateRoot);
    assert.equal(binding.mutableStateRoots.executorStateRoot, executorStateRoot);
    assert.equal(binding.products[0].productId, "abiogenesis");
    assert.equal(binding.products[0].packageRoot, outcome.packageRoot);
    assert.equal(await pathExists(binding.products[0].manifestPath), true);

    const genesisCommand = outcome.commandPaths.find((candidate) =>
      candidate.endsWith(`${path.sep}genesis-ts`)
    );
    assert.notEqual(genesisCommand, undefined);
    assert.equal(genesisCommand.startsWith(toolchainRoot), true);

    const startRun = runNode(
      genesisCommand,
      [
        "start",
        "--workspace",
        observedRoot,
        "--scope",
        "workspace",
        "--target",
        "graph_function:installed_cli_runtime_binding_self_test",
        "--until",
        "converged"
      ],
      observedRoot
    );
    assert.equal(startRun.status, 0, startRun.stderr);
    const startPayload = parsePayload(startRun);
    assert.equal(startPayload.status, "converged");
    assert.equal(startPayload.events_path, eventLogPath);
    assert.equal(
      startPayload.mutable_state_roots.executorStateRoot,
      executorStateRoot
    );

    const eventLog = await readFile(eventLogPath, "utf8");
    assert.match(eventLog, /"kind":"terminal_reached"/u);
    const defaultObservedEventLog = path.join(
      observedRoot,
      ".ai-workspace",
      "events",
      "events.jsonl"
    );
    const defaultObservedEvents = await readFile(
      defaultObservedEventLog,
      "utf8"
    );
    assert.equal(defaultObservedEvents, "");

    return { binding, genesisCommand, outcome };
  }

  const first = await exerciseTarget("first");
  const second = await exerciseTarget("second");
  assert.equal(first.outcome.packageRoot, second.outcome.packageRoot);
  assert.equal(
    first.binding.products[0].packageRoot,
    second.binding.products[0].packageRoot
  );
  assert.equal(
    first.binding.products[0].manifestPath,
    second.binding.products[0].manifestPath
  );
  assert.equal(first.genesisCommand, second.genesisCommand);
});
