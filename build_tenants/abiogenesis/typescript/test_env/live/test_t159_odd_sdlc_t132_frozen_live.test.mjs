// Validates: T-159
// Validates: T-162
// Validates: REQ-L-GTL3-COMPUTE-NOTATION
// Validates: REQ-R-ABG3-FN-COMPOSITION
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-R-ABG3-REQUIREMENTS-ALGEBRA
// Validates: REQ-L-GTL3-REQUIREMENTS-ALGEBRA

import test from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";
import { runTracedProcess } from "../../build/semantic/code/src/shared/traced_process/index.js";

const LIVE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(LIVE_DIR);
const PACKAGE_ROOT = path.dirname(TEST_ENV_ROOT);
const FROZEN_ROOT = path.join(
  TEST_ENV_ROOT,
  "downstream",
  "odd_sdlc_t132_frozen",
  "odd_sdlc_typescript"
);
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t159_odd_sdlc_t132_frozen_live"
);
const CURRENT_ABI_PACKAGE_JSON = readJson(path.join(PACKAGE_ROOT, "package.json"));
const CURRENT_ABI_PACKAGE = Object.freeze({
  name: CURRENT_ABI_PACKAGE_JSON.name,
  version: CURRENT_ABI_PACKAGE_JSON.version,
  root: PACKAGE_ROOT
});

function liveEnabled() {
  return process.env["ABG_TS_ODD_SDLC_T132_FROZEN_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1";
}

function timestampId() {
  return new Date().toISOString().replace(/[-:.]/gu, "").replace("Z", "Z");
}

function roundMs(value) {
  return Math.round(value * 1000) / 1000;
}

function durationSince(start) {
  return roundMs(performance.now() - start);
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, stableJson(value), "utf8");
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function assertCurrentAbiPackageIdentity(packageJson, label) {
  assert.equal(
    packageJson.name,
    CURRENT_ABI_PACKAGE.name,
    `${label} package name must bind to the current ABI package`
  );
  assert.equal(
    packageJson.version,
    CURRENT_ABI_PACKAGE.version,
    `${label} package version must bind to the current ABI package`
  );
}

function assertCurrentAbiPackageAtRoot(packageRoot, label) {
  const packageJsonPath = path.join(packageRoot, "package.json");
  assert.ok(existsSync(packageJsonPath), `${label} package.json must exist`);
  const packageJson = readJson(packageJsonPath);
  assertCurrentAbiPackageIdentity(packageJson, label);
  return {
    label,
    packageRoot,
    packageName: packageJson.name,
    packageVersion: packageJson.version
  };
}

function assertCurrentAbiNodeModule(workspaceRoot, label) {
  return assertCurrentAbiPackageAtRoot(
    path.join(
      workspaceRoot,
      "node_modules",
      "@abiogenesis",
      "typescript-tenant"
    ),
    label
  );
}

function assertCurrentAbiInstallManifests(workspaceRoot, label) {
  const installManifestPath = path.join(
    workspaceRoot,
    ".abiogenesis",
    "install-manifest.json"
  );
  const installerManifestPath = path.join(
    workspaceRoot,
    ".abiogenesis",
    "typescript-installer-manifest.json"
  );
  const observed = {
    label,
    installManifestPath,
    installManifestPackageVersion: null,
    installerManifestPath,
    installerManifestPackageVersion: null
  };
  assert.ok(
    existsSync(installManifestPath),
    `${label} install-manifest.json must exist`
  );
  const installManifest = readJson(installManifestPath);
  assert.equal(
    installManifest.runtimePackage?.packageName,
    CURRENT_ABI_PACKAGE.name,
    `${label} install manifest runtime package name must bind to the current ABI package`
  );
  assert.equal(
    installManifest.runtimePackage?.packageVersion,
    CURRENT_ABI_PACKAGE.version,
    `${label} install manifest runtime package version must bind to the current ABI package`
  );
  observed.installManifestPackageVersion =
    installManifest.runtimePackage?.packageVersion ?? null;

  assert.ok(
    existsSync(installerManifestPath),
    `${label} typescript-installer-manifest.json must exist`
  );
  const installerManifest = readJson(installerManifestPath);
  assert.equal(
    installerManifest.packageName,
    CURRENT_ABI_PACKAGE.name,
    `${label} installer manifest package name must bind to the current ABI package`
  );
  assert.equal(
    installerManifest.packageVersion,
    CURRENT_ABI_PACKAGE.version,
    `${label} installer manifest package version must bind to the current ABI package`
  );
  observed.installerManifestPackageVersion =
    installerManifest.packageVersion ?? null;
  return observed;
}

function assertTracedProcessOk(result, label) {
  if (result.status !== 0) {
    throw new Error(
      `${label} failed status=${String(result.status)} signal=${String(
        result.signal
      )}\nstdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`
    );
  }
}

async function runLoggedCommand(input) {
  const started = performance.now();
  const traceArchiveRoot = path.join(input.archiveRoot, `${input.label}.trace`);
  const result = await runTracedProcess({
    command: input.command,
    args: input.args,
    cwd: input.cwd,
    env: input.env ?? process.env,
    archiveRoot: traceArchiveRoot,
    label: input.label,
    timeoutMs: input.timeoutMs ?? 300000,
    executorProfile: "local-spawn"
  });
  const elapsedMs = durationSince(started);
  const commandRecord = {
    label: input.label,
    command: input.command,
    args: input.args,
    cwd: input.cwd,
    status: result.status,
    signal: result.signal,
    error: result.error,
    elapsedMs,
    traceResultRef: pathToFileURL(result.paths.result).href
  };
  writeJson(path.join(input.archiveRoot, `${input.label}.process.json`), commandRecord);
  writeFileSync(
    path.join(input.archiveRoot, `${input.label}.stdout.log`),
    result.stdout ?? "",
    "utf8"
  );
  writeFileSync(
    path.join(input.archiveRoot, `${input.label}.stderr.log`),
    result.stderr ?? "",
    "utf8"
  );
  assertTracedProcessOk(result, input.label);
  return { result, elapsedMs };
}

function patchFrozenPackageDependency(workingRoot) {
  const packageJsonPath = path.join(workingRoot, "package.json");
  const packageJson = readJson(packageJsonPath);
  packageJson.dependencies = {
    ...(packageJson.dependencies ?? {}),
    "@abiogenesis/typescript-tenant": `file:${PACKAGE_ROOT}`
  };
  writeFileSync(packageJsonPath, stableJson(packageJson), "utf8");
  return packageJson.dependencies["@abiogenesis/typescript-tenant"];
}

function patchFrozenAbgCommandProbeForCurrentStartup(input) {
  const harnessPath = path.join(
    input.workingRoot,
    "test_env",
    "sandbox",
    "abg_installed_workspace.mjs"
  );
  const before = readFileSync(harnessPath, "utf8");
  const spawnSyncCall = "spawn" + "Sync";
  const oldBlock = `  const args = ["install", "--target", targetRoot];
  const run = ${spawnSyncCall}(genesisCommand, args, {
    cwd: outcome.targetRoot.rootPath,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10
  });`;
  const newBlock = `  const probeToolchainRoot = path.join(
    archiveRoot,
    "abg_installed_command_probe_toolchain"
  );
  mkdirSync(probeToolchainRoot, { recursive: true });
  const args = [
    "install",
    "--target",
    targetRoot,
    "--toolchain-root",
    probeToolchainRoot
  ];
  const run = ${spawnSyncCall}(genesisCommand, args, {
    cwd: outcome.targetRoot.rootPath,
    encoding: "utf8",
    env: {
      ...process.env,
      ABG_TOOLCHAIN_ROOT: probeToolchainRoot
    },
    maxBuffer: 1024 * 1024 * 10
  });`;
  if (!before.includes(oldBlock)) {
    throw new Error(
      `frozen ABG command probe startup patch target missing: ${harnessPath}`
    );
  }
  writeFileSync(harnessPath, before.replace(oldBlock, newBlock), "utf8");
  return {
    harnessPath,
    probeToolchainRoot: path.join(
      input.runRoot,
      "abg_installed_command_probe_toolchain"
    )
  };
}

function patchFrozenInitialStateValidatorForCurrentStartup(input) {
  const sourcePath = path.join(
    input.workingRoot,
    "code",
    "src",
    "qualification",
    "installed_initial_state.ts"
  );
  let source = readFileSync(sourcePath, "utf8");
  const oldCommandCheck = `function commandCheck(
  workspaceRoot: string,
  commandName: SdlcInstalledInitialStateCommandCheck["commandName"]
): SdlcInstalledInitialStateCommandCheck {
  const commandPath = path.join(workspaceRoot, "node_modules", ".bin", commandName);
  return Object.freeze({
    kind: "sdlc_installed_initial_state_command_check" as const,
    commandName,
    path: commandPath,
    present: existsSync(commandPath)
  });
}`;
  const newCommandCheck = `function commandCheck(
  workspaceRoot: string,
  commandName: SdlcInstalledInitialStateCommandCheck["commandName"],
  commandPaths: readonly string[] = []
): SdlcInstalledInitialStateCommandCheck {
  const localCommandPath = path.join(
    workspaceRoot,
    "node_modules",
    ".bin",
    commandName
  );
  const commandPath =
    commandPaths.find((candidate) => path.basename(candidate) === commandName) ??
    localCommandPath;
  return Object.freeze({
    kind: "sdlc_installed_initial_state_command_check" as const,
    commandName,
    path: commandPath,
    present: existsSync(commandPath)
  });
}`;
  if (!source.includes(oldCommandCheck)) {
    throw new Error(
      `frozen initial-state commandCheck patch target missing: ${sourcePath}`
    );
  }
  source = source.replace(oldCommandCheck, newCommandCheck);

  const oldCommandChecks = `  const commandChecks = Object.freeze([
    commandCheck(input.workspaceRoot, "odd-sdlc-ts"),
    commandCheck(input.workspaceRoot, "abiogenesis-ts"),
    commandCheck(input.workspaceRoot, "genesis-ts")
  ]);`;
  const newCommandChecks = `  const normalization = readJsonRecordIfPresent(normalizationPath);
  const commandPaths = Array.isArray(normalization?.["commandPaths"])
    ? normalization["commandPaths"].filter(
        (candidate): candidate is string => typeof candidate === "string"
      )
    : [];
  const commandChecks = Object.freeze([
    commandCheck(input.workspaceRoot, "odd-sdlc-ts", commandPaths),
    commandCheck(input.workspaceRoot, "abiogenesis-ts", commandPaths),
    commandCheck(input.workspaceRoot, "genesis-ts", commandPaths)
  ]);`;
  if (!source.includes(oldCommandChecks)) {
    throw new Error(
      `frozen initial-state commandChecks patch target missing: ${sourcePath}`
    );
  }
  source = source.replace(oldCommandChecks, newCommandChecks);
  writeFileSync(sourcePath, source, "utf8");
  return { sourcePath };
}

async function prepareOddSdlcWorkingCopy(input) {
  if (!existsSync(FROZEN_ROOT)) {
    throw new Error(`frozen odd_sdlc source missing: ${FROZEN_ROOT}`);
  }
  const workingRoot = path.join(input.runRoot, "frozen_odd_sdlc_working");
  rmSync(workingRoot, { recursive: true, force: true });
  mkdirSync(path.dirname(workingRoot), { recursive: true });
  cpSync(FROZEN_ROOT, workingRoot, { recursive: true });
  const abiDependency = patchFrozenPackageDependency(workingRoot);
  const currentAbiStartupPatch = patchFrozenAbgCommandProbeForCurrentStartup({
    workingRoot,
    runRoot: input.runRoot
  });
  const currentAbiInitialStatePatch =
    patchFrozenInitialStateValidatorForCurrentStartup({
      workingRoot
    });
  writeJson(path.join(input.runRoot, "frozen-odd-sdlc-binding.json"), {
    frozenSourceRoot: FROZEN_ROOT,
    workingRoot,
    currentAbiPackageRoot: PACKAGE_ROOT,
    abiDependency,
    currentAbiStartupPatch,
    currentAbiInitialStatePatch
  });
  await runLoggedCommand({
    label: "frozen-odd-sdlc-npm-install",
    command: "npm",
    args: ["install", "--no-audit", "--no-fund"],
    cwd: workingRoot,
    archiveRoot: input.runRoot,
    timeoutMs: 300000
  });
  await runLoggedCommand({
    label: "frozen-odd-sdlc-build-semantic",
    command: "npm",
    args: ["run", "build:semantic"],
    cwd: workingRoot,
    archiveRoot: input.runRoot,
    timeoutMs: 300000
  });
  return workingRoot;
}

function setDefaultLiveEnvironment(input) {
  process.env["ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS"] ??= "60000";
  process.env["ODD_SDLC_WORKER_TIMEOUT_MS"] ??= "900000";
  process.env["ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS"] ??= "180000";
  process.env["ODD_SDLC_DESIGN_DEPTH_FP_EVALUATOR_TIMEOUT_MS"] ??= "900000";
  process.env["CODEX_LIVE_FP"] ??= "1";
  if (
    typeof process.env["ABG_TOOLCHAIN_ROOT"] !== "string" ||
    process.env["ABG_TOOLCHAIN_ROOT"].length === 0
  ) {
    mkdirSync(input.toolchainRoot, { recursive: true });
    process.env["ABG_TOOLCHAIN_ROOT"] = input.toolchainRoot;
  }
}

function assertWorkspaceWasInstalled(result) {
  assert.equal(result.install.kind, "installed");
  assert.ok(existsSync(result.workspace), "scenario workspace must exist");
  assert.ok(
    existsSync(path.join(result.workspace, ".abiogenesis", "odd_sdlc", "typescript")),
    "odd_sdlc install root must exist in scenario workspace"
  );
  assert.ok(
    existsSync(path.join(result.workspace, ".abiogenesis", "install-manifest.json")) ||
      existsSync(path.join(result.workspace, ".abiogenesis", "typescript-runtime.mjs")),
    "ABG runtime/install evidence must exist in scenario workspace"
  );
}

function assertFrozenWorkingCopyUsesCurrentAbi(workingRoot) {
  const packageJson = readJson(path.join(workingRoot, "package.json"));
  assert.equal(
    packageJson.dependencies?.["@abiogenesis/typescript-tenant"],
    `file:${PACKAGE_ROOT}`,
    "frozen odd_sdlc working copy must depend on the current ABI package root"
  );
  const nodeModule = assertCurrentAbiNodeModule(
    workingRoot,
    "frozen odd_sdlc working copy node_modules ABI"
  );
  return {
    packageDependency:
      packageJson.dependencies?.["@abiogenesis/typescript-tenant"] ?? null,
    nodeModule
  };
}

function assertInstalledSandboxUsesCurrentAbi(installedWorkspace) {
  assert.equal(
    installedWorkspace.packageName,
    CURRENT_ABI_PACKAGE.name,
    "ABG installed sandbox package name must bind to the current ABI package"
  );
  assert.equal(
    installedWorkspace.packageVersion,
    CURRENT_ABI_PACKAGE.version,
    "ABG installed sandbox package version must bind to the current ABI package"
  );
  assert.equal(
    path.resolve(installedWorkspace.packageSourceRoot),
    path.resolve(PACKAGE_ROOT),
    "ABG installed sandbox package source root must be the current ABI package root"
  );
  const packageRoot = assertCurrentAbiPackageAtRoot(
    installedWorkspace.packageRoot,
    "ABG installed sandbox package root"
  );
  const installManifest = readJson(installedWorkspace.installManifestPath);
  assert.equal(
    installManifest.runtimePackage?.packageName,
    CURRENT_ABI_PACKAGE.name,
    "ABG installed sandbox install manifest package name must bind to the current ABI package"
  );
  assert.equal(
    installManifest.runtimePackage?.packageVersion,
    CURRENT_ABI_PACKAGE.version,
    "ABG installed sandbox install manifest package version must bind to the current ABI package"
  );
  const installerManifest = readJson(installedWorkspace.installerManifestPath);
  assert.equal(
    installerManifest.packageName,
    CURRENT_ABI_PACKAGE.name,
    "ABG installed sandbox installer manifest package name must bind to the current ABI package"
  );
  assert.equal(
    installerManifest.packageVersion,
    CURRENT_ABI_PACKAGE.version,
    "ABG installed sandbox installer manifest package version must bind to the current ABI package"
  );
  return {
    evidencePackageName: installedWorkspace.packageName,
    evidencePackageVersion: installedWorkspace.packageVersion,
    packageSourceRoot: installedWorkspace.packageSourceRoot,
    packageRoot,
    installManifestPath: installedWorkspace.installManifestPath,
    installManifestPackageVersion:
      installManifest.runtimePackage?.packageVersion ?? null,
    installerManifestPath: installedWorkspace.installerManifestPath,
    installerManifestPackageVersion: installerManifest.packageVersion ?? null
  };
}

function operatorRunRoots(workspace) {
  const runsRoot = path.join(
    workspace,
    ".ai-workspace",
    "runtime",
    "odd_sdlc",
    "operator-runs"
  );
  if (!existsSync(runsRoot)) return [];
  return readdirSync(runsRoot)
    .map((entry) => path.join(runsRoot, entry))
    .filter((entry) => {
      try {
        return statSync(entry).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

function collectHandoffManifests(workspace) {
  return operatorRunRoots(workspace).flatMap((archiveRoot) => {
    const manifestPath = path.join(archiveRoot, "handoff_manifest.json");
    if (!existsSync(manifestPath)) return [];
    const manifest = readJson(manifestPath);
    return [{
      archiveRoot,
      manifestPath,
      edgeName: manifest.edgeName ?? null,
      overlayRef: manifest.overlayRef ?? null,
      edgeAssuranceContractRef: manifest.edgeAssuranceContractRef ?? null,
      targetCarrierContractRef: manifest.targetCarrierContractRef ?? null
    }];
  });
}

function compressConsecutiveValues(values) {
  const compressed = [];
  for (const value of values) {
    if (value !== null && compressed[compressed.length - 1] !== value) {
      compressed.push(value);
    }
  }
  return compressed;
}

function assertCurrentAbiRealWorldProof(input) {
  assert.equal(input.result.lastStatus, "converged");
  assert.equal(input.result.noProgressReason, null);
  assert.ok(
    input.result.advances.length > 0,
    "scenario must advance through the downstream odd_sdlc harness"
  );
  const frozenWorkingCopy = assertFrozenWorkingCopyUsesCurrentAbi(input.workingRoot);
  const installedSandbox = assertInstalledSandboxUsesCurrentAbi(
    input.result.installedWorkspace
  );
  const workspaceNodeModule = assertCurrentAbiNodeModule(
    input.result.workspace,
    "scenario workspace ABI node_modules"
  );
  const workspaceInstallManifests = assertCurrentAbiInstallManifests(
    input.result.workspace,
    "scenario workspace ABI install"
  );
  const installedWorkspaceNodeModule = assertCurrentAbiNodeModule(
    input.result.installedWorkspace.targetRoot,
    "ABG installed workspace ABI node_modules"
  );
  const installedWorkspaceInstallManifests = assertCurrentAbiInstallManifests(
    input.result.installedWorkspace.targetRoot,
    "ABG installed workspace ABI install"
  );
  const handoffManifests = collectHandoffManifests(input.result.workspace);
  const expectedEdges = input.scenario.expectations?.exactHandoffEdgeSequence ?? [];
  const observedEdges = compressConsecutiveValues(
    handoffManifests.map((manifest) => manifest.edgeName)
  );
  assert.deepEqual(
    observedEdges,
    expectedEdges,
    "scenario must exercise the frozen odd_sdlc minimal overlay edge chain"
  );
  const overlayRefs = [
    ...new Set(handoffManifests.map((manifest) => manifest.overlayRef))
  ].filter((overlayRef) => overlayRef !== null);
  assert.deepEqual(
    overlayRefs,
    [input.scenario.expectations.firstHandoffOverlayRef],
    "scenario must exercise the frozen odd_sdlc minimal overlay"
  );
  return {
    currentAbiPackage: CURRENT_ABI_PACKAGE,
    abgToolchainRoot: process.env["ABG_TOOLCHAIN_ROOT"] ?? null,
    frozenWorkingCopy,
    installedSandbox,
    workspaceNodeModule,
    workspaceInstallManifests,
    installedWorkspaceNodeModule,
    installedWorkspaceInstallManifests,
    handoffEdgeSequence: observedEdges,
    overlayRefs,
    handoffManifests
  };
}

async function loadFrozenOddSdlcHarness(workingRoot) {
  const scenarioSandbox = await import(
    pathToFileURL(path.join(workingRoot, "test_env", "sandbox", "scenario_sandbox.mjs")).href
  );
  const t132Scenario = await import(
    pathToFileURL(
      path.join(
        workingRoot,
        "test_env",
        "sandbox",
        "scenarios",
        "t132_hello_world_js.scenario.mjs"
      )
    ).href
  );
  return {
    runScenarioSandbox: scenarioSandbox.runScenarioSandbox,
    assertScenarioExpectations: scenarioSandbox.assertScenarioExpectations,
    t132HelloWorldJsLiveScenario: t132Scenario.t132HelloWorldJsLiveScenario
  };
}

test(
  "T-159 current ABI/GTL release runs frozen odd_sdlc T-132 JavaScript hello-world live sandbox",
  async (t) => {
    if (!liveEnabled()) {
      t.skip("set ABG_TS_ODD_SDLC_T132_FROZEN_LIVE=1 or CODEX_LIVE_FP=1");
      return;
    }
    const totalStart = performance.now();
    const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
    mkdirSync(runRoot, { recursive: true });
    const toolchainRoot = path.join(runRoot, "abg_toolchain");
    setDefaultLiveEnvironment({ toolchainRoot });

    const compilerProofStart = performance.now();
    await runLoggedCommand({
      label: "abg-t162-compiler-hello-world-proof",
      command: "node",
      args: [
        "--test",
        "--test-name-pattern",
        "T-159 GTL program typechecker admits a JS hello-world materialization unit|T-162 GTL program typechecker rejects malformed requirements algebra declarations|T-162 semantic compiler graph self-reviews with constrained F_P worker control",
        "test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs"
      ],
      cwd: PACKAGE_ROOT,
      archiveRoot: runRoot,
      timeoutMs: 300000
    });
    const compilerProofMs = durationSince(compilerProofStart);

    const prepareStart = performance.now();
    const workingRoot = await prepareOddSdlcWorkingCopy({ runRoot });
    const prepareMs = durationSince(prepareStart);
    const {
      runScenarioSandbox,
      assertScenarioExpectations,
      t132HelloWorldJsLiveScenario
    } = await loadFrozenOddSdlcHarness(workingRoot);

    const scenario = t132HelloWorldJsLiveScenario({
      worker:
        process.env["ABG_TS_ODD_SDLC_T132_FROZEN_WORKER"] ?? "process://claude",
      maxAdvances: Number.parseInt(
        process.env["ABG_TS_ODD_SDLC_T132_FROZEN_MAX_ADVANCES"] ?? "8",
        10
      )
    });
    const scenarioArchiveRoot = path.join(runRoot, "scenario_runs");
    const scenarioStart = performance.now();
    const result = await runScenarioSandbox(scenario, {
      archiveRoot: scenarioArchiveRoot,
      packageSourceRoot: workingRoot,
      abgPackageSourceRoot: PACKAGE_ROOT
    });
    const scenarioMs = durationSince(scenarioStart);

    assertWorkspaceWasInstalled(result);
    assertScenarioExpectations(result, scenario);
    const currentAbiRealWorldProof = assertCurrentAbiRealWorldProof({
      result,
      scenario,
      workingRoot
    });
    const totalMs = durationSince(totalStart);
    const summary = {
      passed: true,
      runRoot,
      frozenSourceRoot: FROZEN_ROOT,
      workingOddSdlcRoot: workingRoot,
      currentAbiPackage: CURRENT_ABI_PACKAGE,
      currentAbiRealWorldProof,
      scenarioId: scenario.scenarioId,
      scenarioRunRoot: result.runRoot,
      scenarioWorkspace: result.workspace,
      lastStatus: result.lastStatus,
      noProgressReason: result.noProgressReason,
      advances: result.advances.length,
      timings: {
        compilerProofMs,
        prepareMs,
        scenarioMs,
        totalMs
      }
    };
    writeJson(path.join(runRoot, "summary.json"), summary);
    t.diagnostic(`runRoot=${runRoot}`);
    t.diagnostic(`scenarioRunRoot=${result.runRoot}`);
    t.diagnostic(`timings=${JSON.stringify(summary.timings)}`);
  }
);
