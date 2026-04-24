// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import {
  qualifyInstalledLiveScenarioPortfolio,
  qualifyInstalledSandbox
} from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  buildInstalledLiveScenarioPortfolioRequest,
  buildInstalledSandboxRequest,
  installedLiveScenarioPortfolioSource,
  linkInstalledTenantPackage,
  provisionInstalledRoot,
  runInstalledNodeScript
} from "./support/m05-installed-fixtures.mjs";

const REQUIRED_SCENARIOS = [
  "requirements_to_uat",
  "intent_to_requirements",
  "gsdlc_lite_requirements_design_code",
  "gsdlc_lite_design_review",
  "gsdlc_lite_zoom_design"
];

test("M05 installed live-portfolio integration: installed runtime executes the Python live scenario families at equivalent feature breadth", async () => {
  const { targetRoot, writer, installOutcome, bootloaderOutcome } =
    await provisionInstalledRoot();
  await linkInstalledTenantPackage(targetRoot);

  const installedQualification = qualifyInstalledSandbox(
    buildInstalledSandboxRequest({
      lane: "install",
      installOutcome,
      bootloaderOutcome,
      rootPath: targetRoot,
      packageBinding: await writer.isDirectory(
        path.join(targetRoot, "node_modules/@abiogenesis")
      ),
      bootstrapImportPassed: true,
      exportedSurface: ["deliverBootloader", "installBootstrap", "projectLiveStatus", "publicStart", "resultAssessment"],
      liveScenarioPassed: false
    })
  );

  assert.equal(installedQualification.kind, "passed");

  const scenarios = [];
  for (const scenarioName of REQUIRED_SCENARIOS) {
    const run = await runInstalledNodeScript(
      targetRoot,
      installedLiveScenarioPortfolioSource(scenarioName)
    );

    assert.equal(run.status, 0, run.stderr);
    const payload = JSON.parse(run.stdout);
    assert.equal(payload.passed, true);
    scenarios.push(payload);
  }

  const outcome = qualifyInstalledLiveScenarioPortfolio(
    buildInstalledLiveScenarioPortfolioRequest({
      installedQualification,
      scenarios
    })
  );

  assert.deepStrictEqual(outcome, {
    kind: "passed",
    scenarioNames: REQUIRED_SCENARIOS
  });
});
