#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  configuredLiveTimeoutMs,
  liveOperatorRuntimePolicy
} from "./operator_runtime_policy.mjs";
import {
  FG_CONFORM_PROJECT,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_DERIVE_LITE_DESIGN_ADR_SURFACE,
  admitComponentDepthRegisterFromArtifact
} from "../../build/semantic/code/src/index.js";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(SCRIPT_DIR, "../..");
const RUNTIME_POLICY = liveOperatorRuntimePolicy();
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);
const DEFAULT_TEST_RUN_ROOT = resolve(PACKAGE_ROOT, "test_env/test_runs");
const DEFAULT_SEED_ARCHIVE_ROOT = resolve(
  PACKAGE_ROOT,
  "test_env/test_runs/full_external_data_mapper_sandbox/20260610T202608490Z_pid46762"
);
const SEED_ARCHIVE_ROOT = resolve(
  process.env["ODD_SDLC_TS_T199_DATA_MAPPER_SEED_ARCHIVE_ROOT"] ??
    DEFAULT_SEED_ARCHIVE_ROOT
);
const LANE_NAME =
  process.env["ODD_SDLC_TS_DATA_MAPPER_LANE_NAME"] ??
  "t199_data_mapper_code_depth_resume_live";
const WORKER_TRANSPORT =
  cliStringFlag("--worker") ?? RUNTIME_POLICY.liveHarnessDataMapperWorkerTransport;
const DATA_MAPPER_WORKER_MINIMUM_OPERATOR_TIMEOUT_MS =
  process.env["ODD_SDLC_TS_DATA_MAPPER_WORKER_MINIMUM_OPERATOR_TIMEOUT_MS"] ??
  "60000";
const DATA_MAPPER_WORKER_INACTIVITY_TIMEOUT_MS =
  process.env["ODD_SDLC_TS_DATA_MAPPER_WORKER_INACTIVITY_TIMEOUT_MS"] ??
  "900000";
const COMMAND_TIMEOUT_MS = configuredLiveTimeoutMs(
  "ODD_SDLC_TS_T199_DATA_MAPPER_CODE_DEPTH_COMMAND_TIMEOUT_MS",
  RUNTIME_POLICY.liveHarnessFullCapabilityCommandTimeoutMs
);

const TEXT_REWRITE_EXTENSIONS = Object.freeze([
  ".json",
  ".jsonl",
  ".log",
  ".md",
  ".txt",
  ".trace",
  ".yml",
  ".yaml"
]);
const SANDBOX_NOISE_DIR_NAMES = Object.freeze(
  new Set([
    ".bloop",
    ".metals",
    ".scala-build",
    "coursier",
    "ivy2",
    "sbt-boot",
    "sbt-global",
    "scalac-classes",
    "target"
  ])
);

function cliStringFlag(flagName) {
  const equalsPrefix = `${flagName}=`;
  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index];
    if (arg === flagName) {
      const value = process.argv[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`${flagName}: expected value`);
      }
      return value;
    }
    if (arg.startsWith(equalsPrefix)) {
      const value = arg.slice(equalsPrefix.length);
      if (value.length === 0) {
        throw new Error(`${flagName}: expected value`);
      }
      return value;
    }
  }
  return null;
}

function archiveTimestamp() {
  return new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(".", "");
}

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function readJsonFile(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function delay(ms) {
  return new Promise((resolveDelay) => {
    setTimeout(resolveDelay, ms);
  });
}

function assertExists(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`missing ${label}: ${filePath}`);
  }
}

function assertNonEmptyArray(payload, fieldName, label) {
  if (!Array.isArray(payload?.[fieldName]) || payload[fieldName].length === 0) {
    throw new Error(`${label}.${fieldName} must be a non-empty array`);
  }
}

function readDirEntries(dirPath) {
  return existsSync(dirPath)
    ? [...readdirSync(dirPath, { withFileTypes: true })]
    : [];
}

function runtimeFilesNamed(workspace, fileName) {
  const runsRoot = path.join(workspace, ".ai-workspace/runtime/odd_sdlc/operator-runs");
  if (!existsSync(runsRoot)) {
    return [];
  }
  const files = [];
  const stack = [runsRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readDirEntries(current)) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(child);
      } else if (entry.isFile() && entry.name === fileName) {
        files.push(child);
      }
    }
  }
  return files.sort();
}

function handoffManifests(workspace) {
  return runtimeFilesNamed(workspace, "handoff_manifest.json")
    .map((filePath) => ({
      filePath,
      manifest: readJsonFile(filePath)
    }))
    .sort((left, right) => left.filePath.localeCompare(right.filePath));
}

function latestHandoffWithEdge(workspace, edgeName) {
  return (
    handoffManifests(workspace)
      .filter((entry) => entry.manifest.edgeName === edgeName)
      .sort((left, right) => left.filePath.localeCompare(right.filePath))
      .at(-1) ?? null
  );
}

function latestWorkerPackageWithEdge(workspace, edgeName) {
  return (
    runtimeFilesNamed(workspace, "worker_invocation_package.json")
      .map((filePath) => ({
        filePath,
        package: readJsonFile(filePath)
      }))
      .filter((entry) => entry.package.edgeName === edgeName)
      .sort((left, right) => left.filePath.localeCompare(right.filePath))
      .at(-1) ?? null
  );
}

function workspacePath(workspace, maybePath) {
  if (typeof maybePath !== "string" || maybePath.length === 0) {
    return null;
  }
  return path.isAbsolute(maybePath) ? maybePath : path.join(workspace, maybePath);
}

function workspaceRelativePath(workspace, maybePath) {
  const absolutePath = workspacePath(workspace, maybePath);
  if (absolutePath === null) {
    return null;
  }
  const relativePath = path.relative(workspace, absolutePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`path escapes workspace: ${maybePath}`);
  }
  return relativePath.split(path.sep).join("/");
}

function countJsonlLines(filePath) {
  const content = readFileSync(filePath, "utf8");
  return content === "" ? 0 : content.trimEnd().split("\n").length;
}

function collectWorkspacePreconditions(input) {
  assertExists(input.workspace, `${input.label} workspace`);
  const eventsPath = path.join(input.workspace, ".ai-workspace/events/events.jsonl");
  assertExists(eventsPath, `${input.label} event ledger`);
  const eventCount = countJsonlLines(eventsPath);
  if (eventCount <= 0) {
    throw new Error(`${input.label} event ledger is empty: ${eventsPath}`);
  }

  const designHandoff = latestHandoffWithEdge(
    input.workspace,
    FG_DERIVE_LITE_DESIGN_ADR_SURFACE
  );
  if (designHandoff === null) {
    throw new Error(`${input.label} missing lite design handoff`);
  }
  const designArchiveRoot = workspacePath(
    input.workspace,
    designHandoff.manifest.archiveRoot
  );
  assertExists(designArchiveRoot, `${input.label} lite design archive`);
  const designOutputFile = workspacePath(input.workspace, designHandoff.manifest.outputFile);
  assertExists(designOutputFile, `${input.label} lite design output`);
  const designRegisterPath = path.join(
    designArchiveRoot,
    "design_depth_fp_evaluator_register.json"
  );
  const designLedgerPath = path.join(designArchiveRoot, "sdlc_edge_fulfillment_ledger.json");
  const designClosurePath = path.join(designArchiveRoot, "sdlc_edge_closure_decision.json");
  assertExists(designRegisterPath, `${input.label} design-depth register`);
  assertExists(designLedgerPath, `${input.label} design edge fulfillment ledger`);
  assertExists(designClosurePath, `${input.label} design edge closure decision`);
  const designRegister = readJsonFile(designRegisterPath);
  if (designRegister.kind !== "sdlc_design_depth_register") {
    throw new Error(`${input.label} design-depth register has unexpected kind`);
  }
  if (designRegister.targetAssetType !== "implementation_design_surface") {
    throw new Error(
      `${input.label} design-depth register targets ${designRegister.targetAssetType}`
    );
  }
  for (const fieldName of [
    "componentTopologyRows",
    "componentRealizationRows",
    "fileTargetRows"
  ]) {
    assertNonEmptyArray(designRegister, fieldName, `${input.label} design-depth register`);
  }

  const codegenPackage = latestWorkerPackageWithEdge(
    input.workspace,
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE
  );
  if (codegenPackage === null) {
    throw new Error(`${input.label} missing prior component-code invocation package`);
  }
  if (codegenPackage.package.targetAssetType !== "component_code_surface") {
    throw new Error(
      `${input.label} prior codegen package targets ${codegenPackage.package.targetAssetType}`
    );
  }
  if (codegenPackage.package.outputContract?.materializationRequired !== true) {
    throw new Error(`${input.label} prior codegen package did not require materialization`);
  }
  const declaredProductFileTargets =
    codegenPackage.package.outputContract?.declaredProductFileTargets ?? [];
  if (!Array.isArray(declaredProductFileTargets) || declaredProductFileTargets.length === 0) {
    throw new Error(`${input.label} prior codegen package lacks product targets`);
  }
  const codegenArchiveRoot = dirname(codegenPackage.filePath);
  const codegenLedgerPath = path.join(codegenArchiveRoot, "sdlc_edge_fulfillment_ledger.json");
  const codegenClosurePath = path.join(codegenArchiveRoot, "sdlc_edge_closure_decision.json");
  assertExists(codegenLedgerPath, `${input.label} codegen edge fulfillment ledger`);
  assertExists(codegenClosurePath, `${input.label} codegen edge closure decision`);

  const codegenHandoff = latestHandoffWithEdge(
    input.workspace,
    FG_DERIVE_LITE_COMPONENT_CODE_SURFACE
  );
  if (codegenHandoff === null) {
    throw new Error(`${input.label} missing prior component-code handoff`);
  }

  return Object.freeze({
    workspace: input.workspace,
    eventCount,
    designRunRoot: designArchiveRoot,
    designOutputFile,
    designRegisterPath,
    designRegisterCounts: Object.freeze({
      componentTopologyRows: designRegister.componentTopologyRows.length,
      componentRealizationRows: designRegister.componentRealizationRows.length,
      fileTargetRows: designRegister.fileTargetRows.length
    }),
    codegenRunRoot: codegenArchiveRoot,
    codegenPackagePath: codegenPackage.filePath,
    codegenHandoffPath: codegenHandoff.filePath,
    codegenOutputFile: workspacePath(input.workspace, codegenHandoff.manifest.outputFile),
    declaredProductFileTargets: Object.freeze([...declaredProductFileTargets])
  });
}

function assertSeedPreconditions(seedArchiveRoot) {
  assertExists(seedArchiveRoot, "seed archive root");
  const runSummaryPath = path.join(seedArchiveRoot, "run_summary.json");
  assertExists(runSummaryPath, "seed run summary");
  const runSummary = readJsonFile(runSummaryPath);
  const archiveWorkspace = path.join(seedArchiveRoot, "workspace");
  const seedWorkspace = existsSync(archiveWorkspace)
    ? archiveWorkspace
    : runSummary.workspace ?? archiveWorkspace;
  const workspacePreconditions = collectWorkspacePreconditions({
    workspace: seedWorkspace,
    label: "seed data_mapper archive"
  });
  return Object.freeze({
    archiveRoot: seedArchiveRoot,
    runSummaryPath,
    terminalReason: runSummary.terminalReason ?? null,
    targetGraphFunction: runSummary.targetGraphFunction ?? null,
    workspace: seedWorkspace,
    workspacePreconditions
  });
}

function copySeedWorkspace(input) {
  const workspace = path.join(input.archiveRoot, "workspace");
  const skippedTopLevelNames = new Set([
    ".abiogenesis",
    ".genesis",
    ".npm-cache",
    "node_modules"
  ]);
  cpSync(input.seedWorkspace, workspace, {
    recursive: true,
    filter: (source) => {
      const relativePath = path.relative(input.seedWorkspace, source);
      if (relativePath === "") {
        return true;
      }
      const topLevelName = relativePath.split(path.sep)[0];
      return !skippedTopLevelNames.has(topLevelName);
    }
  });
  rewriteCopiedWorkspacePaths({
    workspace,
    archiveRoot: input.archiveRoot,
    seedWorkspace: input.seedWorkspace,
    seedArchiveRoot: input.seedArchiveRoot
  });
  return workspace;
}

function pruneSandboxNoise(workspace) {
  const roots = [
    path.join(workspace, "build_tenants/scala_spark"),
    path.join(workspace, ".ai-workspace/runtime/odd_sdlc/operator-runs")
  ];
  const pruned = [];
  for (const root of roots) {
    if (!existsSync(root)) {
      continue;
    }
    const stack = [root];
    while (stack.length > 0) {
      const current = stack.pop();
      for (const entry of readDirEntries(current)) {
        if (!entry.isDirectory()) {
          continue;
        }
        const child = path.join(current, entry.name);
        if (SANDBOX_NOISE_DIR_NAMES.has(entry.name)) {
          rmSync(child, { recursive: true, force: true });
          pruned.push(path.relative(workspace, child).split(path.sep).join("/"));
          continue;
        }
        stack.push(child);
      }
    }
  }
  return Object.freeze(pruned.sort());
}

function isTextRewriteCandidate(filePath) {
  const extension = path.extname(filePath);
  if (TEXT_REWRITE_EXTENSIONS.includes(extension)) {
    return true;
  }
  return filePath.endsWith(".jsonl.trace");
}

function rewriteCopiedWorkspacePaths(input) {
  const replacements = Object.freeze([
    [input.seedWorkspace, input.workspace],
    [input.seedArchiveRoot, input.archiveRoot]
  ]);
  const stack = [input.workspace];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readDirEntries(current)) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(child);
        continue;
      }
      if (!entry.isFile() || !isTextRewriteCandidate(child)) {
        continue;
      }
      let content = readFileSync(child, "utf8");
      let updated = content;
      for (const [from, to] of replacements) {
        updated = updated.replaceAll(from, to);
      }
      if (updated !== content) {
        writeFileSync(child, updated, "utf8");
      }
    }
  }
}

function pruneCodegenOutputs(input) {
  const targets = new Set(input.preconditions.declaredProductFileTargets);
  const outputRelativePath = workspaceRelativePath(
    input.workspace,
    input.preconditions.codegenOutputFile
  );
  if (outputRelativePath !== null) {
    targets.add(outputRelativePath);
  }
  const pruned = [];
  for (const relativePath of [...targets].sort()) {
    const absolutePath = path.join(input.workspace, relativePath);
    if (existsSync(absolutePath)) {
      rmSync(absolutePath, { recursive: true, force: true });
      pruned.push(relativePath);
    }
  }
  return Object.freeze(pruned);
}

function runCommand(input) {
  const startedAt = new Date().toISOString();
  const processRecordPath = path.join(input.archiveRoot, `${input.label}.process.json`);
  writeJson(processRecordPath, {
    kind: "odd_sdlc_live_sandbox_process_result",
    lifecycleStatus: "started",
    label: input.label,
    command: input.command,
    args: input.args,
    cwd: input.cwd,
    status: null,
    signal: null,
    error: null,
    stdoutBytes: 0,
    stderrBytes: 0,
    commandTimeoutMs: COMMAND_TIMEOUT_MS,
    startedAt,
    endedAt: null,
    hostPid: process.pid
  });
  const result = spawnSync(input.command, input.args, {
    cwd: input.cwd,
    encoding: "utf8",
    env: input.env,
    maxBuffer: 1024 * 1024 * 100,
    timeout: COMMAND_TIMEOUT_MS
  });
  const endedAt = new Date().toISOString();
  const record = {
    kind: "odd_sdlc_live_sandbox_process_result",
    lifecycleStatus: "completed",
    label: input.label,
    command: input.command,
    args: input.args,
    cwd: input.cwd,
    status: result.status,
    signal: result.signal,
    error: result.error?.message ?? null,
    stdoutBytes: Buffer.byteLength(result.stdout ?? "", "utf8"),
    stderrBytes: Buffer.byteLength(result.stderr ?? "", "utf8"),
    commandTimeoutMs: COMMAND_TIMEOUT_MS,
    startedAt,
    endedAt,
    hostPid: process.pid
  };
  writeJson(processRecordPath, record);
  writeFileSync(
    path.join(input.archiveRoot, `${input.label}.stdout.json`),
    result.stdout ?? "",
    "utf8"
  );
  writeFileSync(
    path.join(input.archiveRoot, `${input.label}.stderr.log`),
    result.stderr ?? "",
    "utf8"
  );
  const acceptedStatuses = input.acceptedStatuses ?? Object.freeze([0]);
  if (!acceptedStatuses.includes(result.status)) {
    throw new Error(
      `${input.label} failed: ${result.stderr || JSON.stringify(record, null, 2)}`
    );
  }
  return result.stdout === "" ? null : JSON.parse(result.stdout);
}

function collectFreshCodegenPackages(input) {
  const afterPackagePaths = new Set(
    runtimeFilesNamed(input.workspace, "worker_invocation_package.json")
  );
  const freshPackagePaths = [...afterPackagePaths]
    .filter((filePath) => !input.beforeWorkerInvocationPackagePaths.has(filePath))
    .sort();
  return freshPackagePaths
    .map((filePath) => ({
      filePath,
      package: readJsonFile(filePath)
    }))
    .filter((entry) => entry.package.edgeName === FG_DERIVE_LITE_COMPONENT_CODE_SURFACE)
    .sort((left, right) => left.filePath.localeCompare(right.filePath));
}

function firstFreshCodegenResult(input) {
  const freshCodegenPackage = collectFreshCodegenPackages(input).at(0);
  if (freshCodegenPackage === undefined) {
    return null;
  }
  const runRoot = dirname(freshCodegenPackage.filePath);
  const requiredResultFiles = [
    "handoff_manifest.json",
    "worker_result_report.json",
    "review_grade_edge_fulfillment_assessment.json"
  ];
  if (
    requiredResultFiles.some(
      (relativePath) => !existsSync(path.join(runRoot, relativePath))
    )
  ) {
    return null;
  }
  return Object.freeze({
    runRoot,
    packagePath: freshCodegenPackage.filePath
  });
}

function archiveProcessIds(archiveRoot) {
  const result = spawnSync("ps", ["-axo", "pid=,command="], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    return [];
  }
  return (result.stdout ?? "")
    .split("\n")
    .flatMap((line) => {
      const match = line.match(/^\s*(\d+)\s+(.*)$/u);
      if (match === null) {
        return [];
      }
      const pid = Number.parseInt(match[1], 10);
      const command = match[2];
      return pid !== process.pid && command.includes(archiveRoot) ? [pid] : [];
    });
}

function signalArchiveProcesses(archiveRoot, signal) {
  for (const pid of archiveProcessIds(archiveRoot)) {
    try {
      process.kill(pid, signal);
    } catch {
      // Process already exited.
    }
  }
}

function closePromise(child) {
  return new Promise((resolveClose) => {
    child.once("close", (status, signal) => {
      resolveClose({ status, signal });
    });
  });
}

async function runCommandUntilFirstFreshCodegenResult(input) {
  const startedAt = new Date().toISOString();
  const processRecordPath = path.join(input.archiveRoot, `${input.label}.process.json`);
  const stdoutPath = path.join(input.archiveRoot, `${input.label}.stdout.json`);
  const stderrPath = path.join(input.archiveRoot, `${input.label}.stderr.log`);
  writeJson(processRecordPath, {
    kind: "odd_sdlc_live_sandbox_process_result",
    lifecycleStatus: "started",
    label: input.label,
    command: input.command,
    args: input.args,
    cwd: input.cwd,
    status: null,
    signal: null,
    error: null,
    stdoutBytes: 0,
    stderrBytes: 0,
    commandTimeoutMs: COMMAND_TIMEOUT_MS,
    stoppedBecause: null,
    freshCodegenRunRoot: null,
    startedAt,
    endedAt: null,
    hostPid: process.pid
  });
  writeFileSync(stdoutPath, "", "utf8");
  writeFileSync(stderrPath, "", "utf8");
  let stdoutBytes = 0;
  let stderrBytes = 0;
  const child = spawn(input.command, input.args, {
    cwd: input.cwd,
    env: input.env,
    stdio: ["ignore", "pipe", "pipe"]
  });
  child.stdout.on("data", (chunk) => {
    stdoutBytes += chunk.length;
    appendFileSync(stdoutPath, chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderrBytes += chunk.length;
    appendFileSync(stderrPath, chunk);
  });
  const closed = closePromise(child);
  let closeResult = null;
  closed.then((result) => {
    closeResult = result;
  });

  const deadlineMs = Date.now() + COMMAND_TIMEOUT_MS;
  let freshResult = null;
  let stoppedBecause = null;
  while (Date.now() < deadlineMs) {
    freshResult = firstFreshCodegenResult({
      workspace: input.cwd,
      beforeWorkerInvocationPackagePaths: input.beforeWorkerInvocationPackagePaths
    });
    if (freshResult !== null) {
      stoppedBecause = "first_fresh_codegen_review_grade_result";
      child.kill("SIGTERM");
      signalArchiveProcesses(input.archiveRoot, "SIGTERM");
      await Promise.race([closed, delay(3000)]);
      if (closeResult === null) {
        signalArchiveProcesses(input.archiveRoot, "SIGKILL");
        await Promise.race([closed, delay(2000)]);
      }
      break;
    }
    if (closeResult !== null) {
      break;
    }
    await delay(1000);
  }

  if (freshResult === null && closeResult === null) {
    child.kill("SIGTERM");
    signalArchiveProcesses(input.archiveRoot, "SIGTERM");
    await Promise.race([closed, delay(3000)]);
    if (closeResult === null) {
      signalArchiveProcesses(input.archiveRoot, "SIGKILL");
      await Promise.race([closed, delay(2000)]);
    }
    throw new Error(`${input.label} timed out before first fresh codegen result`);
  }
  if (closeResult === null) {
    closeResult = await closed;
  }
  if (freshResult === null) {
    freshResult = firstFreshCodegenResult({
      workspace: input.cwd,
      beforeWorkerInvocationPackagePaths: input.beforeWorkerInvocationPackagePaths
    });
  }
  const endedAt = new Date().toISOString();
  const lifecycleStatus =
    freshResult === null
      ? "completed_without_first_fresh_codegen_result"
      : "stopped_after_first_fresh_codegen_result";
  writeJson(processRecordPath, {
    kind: "odd_sdlc_live_sandbox_process_result",
    lifecycleStatus,
    label: input.label,
    command: input.command,
    args: input.args,
    cwd: input.cwd,
    status: closeResult.status,
    signal: closeResult.signal,
    error: null,
    stdoutBytes,
    stderrBytes,
    commandTimeoutMs: COMMAND_TIMEOUT_MS,
    stoppedBecause,
    freshCodegenRunRoot: freshResult?.runRoot ?? null,
    startedAt,
    endedAt,
    hostPid: process.pid
  });
  if (freshResult === null) {
    throw new Error(`${input.label} exited without a fresh codegen review-grade result`);
  }
  return Object.freeze({
    command: "start",
    status: lifecycleStatus,
    target: `graph_function:${input.targetGraphFunction}`,
    resolved_target: `graph_function:${input.targetGraphFunction}`,
    graph_function_id: input.targetGraphFunction,
    asset_id: input.targetGraphFunction,
    edge: input.targetGraphFunction,
    stopped_by: stoppedBecause,
    stop_class: {
      kind: "assessed",
      detail: stoppedBecause,
      source: "t199_live_harness",
      runtimeFailureClass: null
    },
    live_status: null,
    event_kinds: [],
    freshCodegenRunRoot: freshResult.runRoot,
    processStatus: closeResult.status,
    processSignal: closeResult.signal
  });
}

function specPayload(parsed, label) {
  if (parsed?.kind !== "odd_sdlc_spec_method_result" || parsed.status !== "ok") {
    throw new Error(`${label} returned non-ok spec-method result: ${JSON.stringify(parsed, null, 2)}`);
  }
  return parsed.payload;
}

function installedSpecPayload(parsed, label) {
  const payload = specPayload(parsed, label);
  if (payload?.kind !== "installed") {
    throw new Error(`${label} rejected: ${JSON.stringify(payload, null, 2)}`);
  }
  return payload;
}

function copiedWorkspaceInstalledPackageName(workspace) {
  const packageJsonPath = path.join(workspace, "package.json");
  if (!existsSync(packageJsonPath)) {
    return "odd-sdlc-t199-data-mapper-code-depth-resume";
  }
  const packageJson = readJsonFile(packageJsonPath);
  const packageName = typeof packageJson.name === "string" ? packageJson.name : "";
  if (packageName.endsWith("-abg")) {
    return packageName.slice(0, -"-abg".length);
  }
  return packageName.length > 0
    ? packageName
    : "odd-sdlc-t199-data-mapper-code-depth-resume";
}

function installedCommandFromInstallPayload(payload, workspace) {
  const commandPath = payload.commandPaths?.find(
    (candidate) => path.basename(candidate) === "odd-sdlc-ts"
  );
  if (commandPath !== undefined) {
    return commandPath;
  }
  return path.join(workspace, "node_modules/.bin/odd-sdlc-ts");
}

function installedAbgCommandFromInstallPayload(payload, workspace, commandName) {
  const commandPath = payload.commandPaths?.find(
    (candidate) => path.basename(candidate) === commandName
  );
  if (commandPath !== undefined) {
    return commandPath;
  }
  return path.join(workspace, "node_modules/.bin", commandName);
}

function copyCacheSeedIfPresent(input) {
  if (input.source.length === 0 || !existsSync(input.source)) {
    return null;
  }
  mkdirSync(dirname(input.destination), { recursive: true });
  cpSync(input.source, input.destination, {
    recursive: true,
    force: true,
    errorOnExist: false
  });
  return Object.freeze({
    source: input.source,
    destination: input.destination
  });
}

function seedSandboxToolCache(input) {
  const home = process.env["HOME"] ?? "";
  const hostSbtBoot =
    process.env["ODD_SDLC_TS_HOST_SBT_BOOT_CACHE"] ??
    (home.length === 0 ? "" : path.join(home, ".sbt/boot"));
  const hostCoursierV1 =
    process.env["ODD_SDLC_TS_HOST_COURSIER_V1_CACHE"] ??
    (home.length === 0 ? "" : path.join(home, "Library/Caches/Coursier/v1"));
  const seeded = [
    copyCacheSeedIfPresent({
      source: hostSbtBoot,
      destination: input.sbtBootDirectory
    }),
    copyCacheSeedIfPresent({
      source: path.join(hostCoursierV1, "https/repo1.maven.org/maven2/org/scala-sbt"),
      destination: path.join(input.coursierCache, "https/repo1.maven.org/maven2/org/scala-sbt")
    }),
    copyCacheSeedIfPresent({
      source: path.join(hostCoursierV1, "https/repo1.maven.org/maven2/org/scala-lang"),
      destination: path.join(input.coursierCache, "https/repo1.maven.org/maven2/org/scala-lang")
    })
  ].filter((entry) => entry !== null);
  return Object.freeze(seeded);
}

function sandboxToolCache(input) {
  const toolCacheRoot = path.join(
    input.workspace,
    ".ai-workspace/runtime/odd_sdlc/tool-cache"
  );
  const sbtBootDirectory = path.join(toolCacheRoot, "sbt-boot");
  const sbtGlobalBase = path.join(toolCacheRoot, "sbt-global");
  const sbtIvyHome = path.join(toolCacheRoot, "ivy2");
  const coursierCache = path.join(toolCacheRoot, "coursier");
  const archiveToolCacheRoot = path.join(input.archiveRoot, "tool-cache");
  for (const dirPath of [
    toolCacheRoot,
    sbtBootDirectory,
    sbtGlobalBase,
    sbtIvyHome,
    coursierCache
  ]) {
    mkdirSync(dirPath, { recursive: true });
  }
  const seededCacheRefs = seedSandboxToolCache({
    sbtBootDirectory,
    coursierCache
  });
  const sbtProperties = [
    `-Dsbt.boot.directory=${sbtBootDirectory}`,
    `-Dsbt.global.base=${sbtGlobalBase}`,
    `-Dsbt.ivy.home=${sbtIvyHome}`,
    `-Divy.home=${sbtIvyHome}`
  ].join(" ");
  return Object.freeze({
    toolCacheRoot,
    archiveToolCacheRoot,
    sbtBootDirectory,
    sbtGlobalBase,
    sbtIvyHome,
    coursierCache,
    seededCacheRefs,
    env: Object.freeze({
      COURSIER_CACHE: coursierCache,
      IVY_HOME: sbtIvyHome,
      SBT_OPTS: [process.env["SBT_OPTS"] ?? "", sbtProperties].join(" ").trim()
    })
  });
}

function dataMapperWorkerRuntimeEnv() {
  return Object.freeze({
    ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS:
      DATA_MAPPER_WORKER_MINIMUM_OPERATOR_TIMEOUT_MS,
    ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS:
      DATA_MAPPER_WORKER_INACTIVITY_TIMEOUT_MS
  });
}

function abgStartArgs(targetGraphFunction, until = "converged") {
  return [
    "start",
    "--workspace",
    ".",
    "--scope",
    "workspace",
    "--target",
    `graph_function:${targetGraphFunction}`,
    "--until",
    until
  ];
}

function summaryStepFromStart(phase, start) {
  return {
    phase,
    status: start.status ?? null,
    target: start.target ?? null,
    resolvedTarget: start.resolved_target ?? null,
    edge: start.edge ?? null,
    stoppedBy: start.stopped_by ?? null,
    stopClass: start.stop_class ?? null,
    liveStatus: start.live_status ?? null,
    eventKinds: start.event_kinds ?? []
  };
}

function isLawfulAbgGapStop(start) {
  return (
    start?.status === "blocked" &&
    start?.stopped_by === "blocked" &&
    start?.control_outcome?.kind === "blocked" &&
    start?.control_outcome?.stopDetail?.kind === "gap_stop" &&
    start?.live_status?.runStatus === "blocked" &&
    start?.live_status?.reason === "gap_stop" &&
    start?.stop_class?.kind === "blocked"
  );
}

function terminalReasonFromStart(start) {
  if (start?.status === "stopped_after_first_fresh_codegen_result") {
    return "harness_stopped_after_first_fresh_codegen_result";
  }
  if (start?.status === "converged") {
    return "abg_reported_converged";
  }
  if (
    start?.status === "yielded" &&
    start?.stopped_by === "yielded" &&
    start?.control_outcome?.kind === "yielded" &&
    start?.control_outcome?.stopDetail?.kind === "advanced_reentry_required" &&
    start?.live_status?.runStatus === "active" &&
    start?.stop_class?.kind === "advanced"
  ) {
    return "abg_reported_first_traversal_applied";
  }
  if (isLawfulAbgGapStop(start)) {
    return "abg_reported_lawful_gap_stop";
  }
  throw new Error(
    `ABG start returned non-lawful terminal: ${JSON.stringify(start, null, 2)}`
  );
}

function outputFileFromHandoff(workspace, runRoot) {
  const handoffPath = path.join(runRoot, "handoff_manifest.json");
  assertExists(handoffPath, "fresh codegen handoff");
  const handoff = readJsonFile(handoffPath);
  return workspacePath(workspace, handoff.outputFile);
}

function assertCurrentComponentDepthPrompt(runRoot) {
  const promptPath = path.join(runRoot, "worker_prompt.md");
  assertExists(promptPath, "fresh codegen worker prompt");
  const prompt = readFileSync(promptPath, "utf8");
  if (
    !prompt.includes(
      "Emit a raw JSON component_depth_register selected target-carrier envelope"
    )
  ) {
    throw new Error(`fresh codegen prompt lacks raw component-depth directive: ${promptPath}`);
  }
  if (prompt.includes("Emit a fenced `json component_depth_register`")) {
    throw new Error(`fresh codegen prompt still carries legacy fenced directive: ${promptPath}`);
  }
}

function assertFreshCodegenRun(input) {
  const freshCodegenPackages = collectFreshCodegenPackages(input);
  if (freshCodegenPackages.length === 0) {
    throw new Error("direct codegen start did not create a fresh component-code operator run");
  }
  const freshCodegenPackage =
    input.freshCodegenRunRoot === undefined
      ? freshCodegenPackages.at(0)
      : freshCodegenPackages.find(
          (entry) => dirname(entry.filePath) === input.freshCodegenRunRoot
        );
  if (freshCodegenPackage === undefined) {
    throw new Error(`fresh codegen run not found: ${input.freshCodegenRunRoot}`);
  }
  const runRoot = dirname(freshCodegenPackage.filePath);
  if (freshCodegenPackage.package.targetAssetType !== "component_code_surface") {
    throw new Error(
      `fresh codegen package targets ${freshCodegenPackage.package.targetAssetType}`
    );
  }
  if (freshCodegenPackage.package.outputContract?.materializationRequired !== true) {
    throw new Error("fresh codegen package does not require product materialization");
  }
  const declaredProductFileTargets =
    freshCodegenPackage.package.outputContract?.declaredProductFileTargets ?? [];
  if (!Array.isArray(declaredProductFileTargets) || declaredProductFileTargets.length === 0) {
    throw new Error("fresh codegen package lacks declared product file targets");
  }
  assertCurrentComponentDepthPrompt(runRoot);
  const outputFile = outputFileFromHandoff(input.workspace, runRoot);
  assertExists(outputFile, "fresh codegen output file");
  const admission = admitComponentDepthRegisterFromArtifact({
    targetAssetType: "component_code_surface",
    outputFile
  });
  if (admission.status !== "admitted") {
    throw new Error(
      `fresh component-depth carrier was not admitted: ${JSON.stringify(admission, null, 2)}`
    );
  }
  const materializedProductFileTargets = [];
  const missingProductFileTargets = [];
  for (const relativePath of declaredProductFileTargets) {
    const absolutePath = path.join(input.workspace, relativePath);
    if (existsSync(absolutePath)) {
      materializedProductFileTargets.push(relativePath);
    } else {
      missingProductFileTargets.push(relativePath);
    }
  }
  if (materializedProductFileTargets.length === 0) {
    throw new Error("fresh codegen did not materialize any declared product target");
  }
  const reviewGradeAssessmentPath = path.join(
    runRoot,
    "review_grade_edge_fulfillment_assessment.json"
  );
  const reviewGradePostflightPath = path.join(runRoot, "review_grade_postflight.json");
  const gapDossierPath = path.join(runRoot, "gap_dossier.json");
  const reviewGradeAssessment = existsSync(reviewGradeAssessmentPath)
    ? readJsonFile(reviewGradeAssessmentPath)
    : null;
  const reviewGradePostflight = existsSync(reviewGradePostflightPath)
    ? readJsonFile(reviewGradePostflightPath)
    : null;
  const gapDossier = existsSync(gapDossierPath) ? readJsonFile(gapDossierPath) : null;
  const reviewGradeFindingCount = Array.isArray(reviewGradeAssessment?.findings)
    ? reviewGradeAssessment.findings.length
    : null;
  const reviewGradeBlockedFindingCount = Array.isArray(reviewGradeAssessment?.findings)
    ? reviewGradeAssessment.findings.filter(
        (finding) => finding.fulfillmentStatus !== "fulfilled"
      ).length
    : null;
  const assertion = {
    kind: "t199_data_mapper_code_depth_resume_assertion",
    seedArchiveRoot: input.seed.archiveRoot,
    archiveRoot: input.archiveRoot,
    workspace: input.workspace,
    targetGraphFunction: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    freshCodegenRunRoot: runRoot,
    freshCodegenPackagePath: freshCodegenPackage.filePath,
    freshCodegenOutputFile: outputFile,
    declaredProductFileTargets,
    materializedProductFileTargets,
    missingProductFileTargets,
    componentDepthAdmissionStatus: admission.status,
    componentDepthRealizationRows:
      admission.register?.componentRealizationRows.length ?? null,
    componentDepthTopologyRows:
      admission.register?.componentTopologyRows.length ?? null,
    reviewGradeStatus: reviewGradeAssessment?.status ?? null,
    reviewGradeFindingCount,
    reviewGradeBlockedFindingCount,
    reviewGradePostflightStatus: reviewGradePostflight?.status ?? null,
    reviewGradeBlockingReasons: reviewGradePostflight?.blockingReasons ?? [],
    gapDossierStatus: gapDossier?.status ?? null,
    gapDossierRetryEligible: gapDossier?.retryEligible ?? null,
    gapDossierNextLawfulActions: gapDossier?.nextLawfulActions ?? [],
    priorSeedEventCount: input.seed.workspacePreconditions.eventCount,
    priorSeedDesignRunRoot: input.seed.workspacePreconditions.designRunRoot,
    priorSeedCodegenRunRoot: input.seed.workspacePreconditions.codegenRunRoot
  };
  writeJson(
    path.join(input.archiveRoot, "t199_data_mapper_code_depth_resume_assertion.json"),
    assertion
  );
  return assertion;
}

async function main() {
  const seed = assertSeedPreconditions(SEED_ARCHIVE_ROOT);
  const testRunRoot = resolve(
    process.env["ODD_SDLC_TS_TEST_RUN_ROOT"] ?? DEFAULT_TEST_RUN_ROOT
  );
  const archiveRoot = path.join(testRunRoot, LANE_NAME, `${archiveTimestamp()}_pid${process.pid}`);
  mkdirSync(archiveRoot, { recursive: true });
  const workspace = copySeedWorkspace({
    archiveRoot,
    seedArchiveRoot: seed.archiveRoot,
    seedWorkspace: seed.workspace
  });
  const copiedSeedPreconditions = collectWorkspacePreconditions({
    workspace,
    label: "copied seed data_mapper archive"
  });
  const prunedSandboxNoise = pruneSandboxNoise(workspace);
  const prunedCodegenOutputs = pruneCodegenOutputs({
    workspace,
    preconditions: copiedSeedPreconditions
  });
  const sourceCli = path.join(PACKAGE_ROOT, "build/semantic/code/src/cli/main.js");
  assertExists(sourceCli, "built source odd-sdlc-ts CLI");
  const installedPackageName = copiedWorkspaceInstalledPackageName(workspace);
  const toolCache = sandboxToolCache({ archiveRoot, workspace });

  const baseEnv = {
    ...process.env,
    ...dataMapperWorkerRuntimeEnv(),
    ...toolCache.env,
    ODD_SDLC_TS_OUTPUT: "json",
    ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE: "pty-terminal",
    ABG_TS_AGENT_EXECUTOR_PROFILE: "pty-terminal",
    ODD_SDLC_TS_WORKER_TRANSPORT: WORKER_TRANSPORT,
    ODD_SDLC_TS_DATA_MAPPER_WORKER: WORKER_TRANSPORT
  };
  const summary = {
    kind: "odd_sdlc_t199_data_mapper_code_depth_resume_run",
    commandBinding: "abg_cli_direct_code_depth_start_until_first_fresh_codegen_result",
    archiveRoot,
    workspace,
    seedArchiveRoot: seed.archiveRoot,
    seedWorkspace: seed.workspace,
    seedTerminalReason: seed.terminalReason,
    seedTargetGraphFunction: seed.targetGraphFunction,
    installedPackageName,
    workerTransport: WORKER_TRANSPORT,
    workerRuntimeEnv: dataMapperWorkerRuntimeEnv(),
    sandboxToolCache: {
      toolCacheRoot: toolCache.toolCacheRoot,
      archiveToolCacheRoot: toolCache.archiveToolCacheRoot,
      sbtBootDirectory: toolCache.sbtBootDirectory,
      sbtGlobalBase: toolCache.sbtGlobalBase,
      sbtIvyHome: toolCache.sbtIvyHome,
      coursierCache: toolCache.coursierCache,
      seededCacheRefs: toolCache.seededCacheRefs
    },
    targetGraphFunction: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
    copiedSeedPreconditions,
    prunedSandboxNoise,
    prunedCodegenOutputs,
    steps: []
  };
  writeJson(path.join(archiveRoot, "run_summary.json"), summary);

  const beforeWorkerInvocationPackagePaths = new Set(
    runtimeFilesNamed(workspace, "worker_invocation_package.json")
  );
  const installPayload = installedSpecPayload(
    runCommand({
      label: "install",
      command: process.execPath,
      args: [
        sourceCli,
        "install",
        "--target",
        ".",
        "--package-source",
        PACKAGE_ROOT,
        "--abg-package-source",
        ABG_TYPESCRIPT_ROOT,
        "--installed-package-name",
        installedPackageName
      ],
      cwd: workspace,
      env: baseEnv,
      archiveRoot
    }),
    "install"
  );
  const installedCommand = installedCommandFromInstallPayload(installPayload, workspace);
  assertExists(installedCommand, "installed odd-sdlc-ts command");
  const installManifest =
    installPayload.manifest ??
    (typeof installPayload.installManifestPath === "string"
      ? readJsonFile(installPayload.installManifestPath)
      : null);
  const abgRuntimeBindingPath = installManifest?.abgRuntimeBindingPath ?? null;
  const genesisCommand = installedAbgCommandFromInstallPayload(
    installPayload,
    workspace,
    "genesis-ts"
  );
  assertExists(genesisCommand, "installed genesis-ts command");
  assertExists(abgRuntimeBindingPath, "installed ABG runtime binding");
  summary.installedCommand = installedCommand;
  summary.abgCommand = genesisCommand;
  summary.installManifestPath = installPayload.installManifestPath ?? null;
  summary.abgRuntimeBindingPath = abgRuntimeBindingPath;
  writeJson(path.join(archiveRoot, "run_summary.json"), summary);

  const conformStart = runCommand({
    label: "abg-conform-project-until-converged",
    command: genesisCommand,
    args: abgStartArgs(FG_CONFORM_PROJECT),
    cwd: workspace,
    env: baseEnv,
    archiveRoot
  });
  summary.steps.push(summaryStepFromStart("abg-conform-project", conformStart));
  summary.abgConformProject = conformStart;
  writeJson(path.join(archiveRoot, "run_summary.json"), summary);

  const start = await runCommandUntilFirstFreshCodegenResult({
    label: "abg-start-code-depth-until-first-fresh-codegen-result",
    command: genesisCommand,
    args: abgStartArgs(FG_DERIVE_LITE_COMPONENT_CODE_SURFACE, "first_traversal"),
    cwd: workspace,
    env: baseEnv,
    archiveRoot,
    beforeWorkerInvocationPackagePaths,
    targetGraphFunction: FG_DERIVE_LITE_COMPONENT_CODE_SURFACE
  });
  summary.steps.push(summaryStepFromStart("abg-start-code-depth", start));
  summary.abgStart = start;
  summary.terminalReason = terminalReasonFromStart(start);
  summary.assertion = assertFreshCodegenRun({
    archiveRoot,
    workspace,
    seed,
    beforeWorkerInvocationPackagePaths,
    freshCodegenRunRoot: start.freshCodegenRunRoot
  });
  writeJson(path.join(archiveRoot, "run_summary.json"), summary);
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
  });
}
