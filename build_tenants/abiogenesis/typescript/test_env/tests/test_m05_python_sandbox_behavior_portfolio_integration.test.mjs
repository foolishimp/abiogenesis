// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  M05_PYTHON_SANDBOX_BEHAVIOR_SCENARIO_OBLIGATIONS,
  qualifyInstalledSandbox,
  qualifyInstalledSandboxBehaviorPortfolio
} from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  buildInstalledSandboxBehaviorPortfolioRequest,
  buildInstalledSandboxRequest,
  installPackedTenantPackage,
  installedSandboxBehaviorScenarioSource,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";

const TESTS_ROOT = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.dirname(TESTS_ROOT);

function timestampId() {
  return new Date().toISOString().replace(/[:.]/g, "").replace("T", "T");
}

function laneCounts(scenarios) {
  return {
    install: scenarios.filter((entry) => entry.lane === "install").length,
    fake: scenarios.filter((entry) => entry.lane === "fake").length,
    live: scenarios.filter((entry) => entry.lane === "live").length
  };
}

test("M05 Python sandbox behavior portfolio integration: installed TypeScript package runs all archived sandbox scenario obligations", async () => {
  const runRoot = path.join(
    TEST_ENV_ROOT,
    "test_runs",
    "typescript_sandbox_behavior_portfolio",
    timestampId()
  );
  await mkdir(runRoot, { recursive: true });

  const { targetRoot, writer, installerOutcome, installOutcome, bootloaderOutcome } =
    await provisionInstalledRoot();
  const packageInstall = await installPackedTenantPackage(targetRoot);

  const installedQualification = qualifyInstalledSandbox(
    buildInstalledSandboxRequest({
      lane: "install",
      installOutcome,
      bootloaderOutcome,
      rootPath: targetRoot,
      packageBinding: await writer.isDirectory(installerOutcome.packageRoot),
      bootstrapImportPassed: true,
      exportedSurface: [
        "deliverBootloader",
        "installBootstrap",
        "projectLiveStatus",
        "publicStart",
        "resultAssessment"
      ],
      liveScenarioPassed: false
    })
  );

  assert.equal(installedQualification.kind, "passed");

  const scenarios = [];
  for (const obligation of M05_PYTHON_SANDBOX_BEHAVIOR_SCENARIO_OBLIGATIONS) {
    const run = await runInstalledNodeScript(
      targetRoot,
      installedSandboxBehaviorScenarioSource(obligation)
    );

    assert.equal(
      run.status,
      0,
      `${obligation.scenarioName} failed\nstdout:\n${run.stdout}\nstderr:\n${run.stderr}`
    );
    const payload = JSON.parse(run.stdout);
    assert.equal(payload.passed, true, obligation.scenarioName);
    scenarios.push(payload);
  }

  const outcome = qualifyInstalledSandboxBehaviorPortfolio(
    buildInstalledSandboxBehaviorPortfolioRequest({
      installedQualification,
      scenarios
    })
  );

  const report = {
    runKind: "typescript_sandbox_behavior_portfolio",
    sourceLineage: "python/test_env/tests run_archive sandbox scenarios",
    targetRoot,
    packageRoot: packageInstall.packageRoot,
    packageTarball: packageInstall.tarballPath,
    scenarioCount: scenarios.length,
    laneCounts: laneCounts(scenarios),
    outcome,
    scenarios
  };

  await writeFile(
    path.join(runRoot, "portfolio_report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8"
  );

  assert.deepStrictEqual(outcome, {
    kind: "passed",
    scenarioCount: 34,
    laneCounts: {
      install: 15,
      fake: 14,
      live: 5
    },
    scenarioNames: M05_PYTHON_SANDBOX_BEHAVIOR_SCENARIO_OBLIGATIONS.map(
      (entry) => entry.scenarioName
    )
  });
});
