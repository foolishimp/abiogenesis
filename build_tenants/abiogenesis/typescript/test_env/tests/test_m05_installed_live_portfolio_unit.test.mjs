// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS,
  M05_REFERENCE_REQUIRED_EVENT_KINDS,
  constructPassedInstalledSandboxQualificationOutcome,
  qualifyInstalledLiveScenarioPortfolio
} from "../../build/semantic/code/src/qualification/m05/index.js";
import { buildInstalledLiveScenarioPortfolioRequest } from "./support/m05-installed-fixtures.mjs";

function scenarioFromObligation(obligation) {
  return {
    scenarioName: obligation.scenarioName,
    scenarioAuthorityRefs: obligation.requiredAuthorityRefs,
    mode: obligation.mode,
    stages: obligation.stages,
    stageCount: obligation.stages.length,
    maxAssessmentCount: Math.max(
      ...obligation.stages.map((stage) => stage.assessmentIds.length)
    ),
    passed: true,
    emittedEventKinds: M05_REFERENCE_REQUIRED_EVENT_KINDS,
    finalRunStatus: "assessed"
  };
}

test("M05 installed live-portfolio unit: portfolio request preserves the required Python scenario families and breadth", () => {
  const outcome = qualifyInstalledLiveScenarioPortfolio(
    buildInstalledLiveScenarioPortfolioRequest({
      installedQualification: constructPassedInstalledSandboxQualificationOutcome({
        lane: "install",
        trace: []
      }),
      scenarios: M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS.map(scenarioFromObligation)
    })
  );

  assert.deepStrictEqual(outcome, {
    kind: "passed",
    scenarioNames: M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS.map(
      (obligation) => obligation.scenarioName
    )
  });
});
