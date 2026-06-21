// Validates: T-159
// Validates: REQ-L-GTL3-COMPUTE-NOTATION
// Validates: REQ-R-ABG3-FN-COMPOSITION
// Validates: REQ-R-ABG3-PAYLOAD

import test from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
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

async function prepareOddSdlcWorkingCopy(input) {
  if (!existsSync(FROZEN_ROOT)) {
    throw new Error(`frozen odd_sdlc source missing: ${FROZEN_ROOT}`);
  }
  const workingRoot = path.join(input.runRoot, "frozen_odd_sdlc_working");
  rmSync(workingRoot, { recursive: true, force: true });
  mkdirSync(path.dirname(workingRoot), { recursive: true });
  cpSync(FROZEN_ROOT, workingRoot, { recursive: true });
  const abiDependency = patchFrozenPackageDependency(workingRoot);
  writeJson(path.join(input.runRoot, "frozen-odd-sdlc-binding.json"), {
    frozenSourceRoot: FROZEN_ROOT,
    workingRoot,
    currentAbiPackageRoot: PACKAGE_ROOT,
    abiDependency
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

function setDefaultLiveEnvironment() {
  process.env["ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS"] ??= "60000";
  process.env["ODD_SDLC_WORKER_TIMEOUT_MS"] ??= "900000";
  process.env["ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS"] ??= "180000";
  process.env["ODD_SDLC_DESIGN_DEPTH_FP_EVALUATOR_TIMEOUT_MS"] ??= "900000";
  process.env["CODEX_LIVE_FP"] ??= "1";
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
  "T-159 ABI pre-RC runs frozen odd_sdlc T-132 JavaScript hello-world live sandbox",
  async (t) => {
    if (!liveEnabled()) {
      t.skip("set ABG_TS_ODD_SDLC_T132_FROZEN_LIVE=1 or CODEX_LIVE_FP=1");
      return;
    }
    setDefaultLiveEnvironment();
    const totalStart = performance.now();
    const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
    mkdirSync(runRoot, { recursive: true });

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
    const totalMs = durationSince(totalStart);
    const summary = {
      passed: true,
      runRoot,
      frozenSourceRoot: FROZEN_ROOT,
      workingOddSdlcRoot: workingRoot,
      currentAbiPackageRoot: PACKAGE_ROOT,
      scenarioId: scenario.scenarioId,
      scenarioRunRoot: result.runRoot,
      scenarioWorkspace: result.workspace,
      lastStatus: result.lastStatus,
      noProgressReason: result.noProgressReason,
      advances: result.advances.length,
      timings: {
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
