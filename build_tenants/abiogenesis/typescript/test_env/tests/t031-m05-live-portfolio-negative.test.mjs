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

test("T-031 negative proof: installed live portfolio rejects a missing Python scenario family", () => {
  const first = M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS[0];
  assert.notEqual(first, undefined);

  const outcome = qualifyInstalledLiveScenarioPortfolio(
    buildInstalledLiveScenarioPortfolioRequest({
      installedQualification: constructPassedInstalledSandboxQualificationOutcome({
        lane: "install",
        trace: []
      }),
      scenarios: [
        scenarioFromObligation(first)
      ]
    })
  );

  assert.deepStrictEqual(outcome, {
    kind: "rejected",
    reason: "installed live scenario portfolio is incomplete",
    gaps: [
      {
        kind: "missing_scenario",
        ref: "intent_to_requirements"
      },
      {
        kind: "missing_scenario",
        ref: "gsdlc_lite_requirements_design_code"
      },
      {
        kind: "missing_scenario",
        ref: "gsdlc_lite_design_review"
      },
      {
        kind: "missing_scenario",
        ref: "gsdlc_lite_zoom_design"
      }
    ]
  });
});

test("T-031 negative proof: installed live portfolio rejects drifted stage identity", () => {
  const scenarios = M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS.map(scenarioFromObligation);
  const intentScenario = scenarios.find(
    (scenario) => scenario.scenarioName === "intent_to_requirements"
  );
  assert.notEqual(intentScenario, undefined);
  intentScenario.stages = [
    {
      ...intentScenario.stages[0],
      edge: "intent→requirements"
    }
  ];

  const outcome = qualifyInstalledLiveScenarioPortfolio(
    buildInstalledLiveScenarioPortfolioRequest({
      installedQualification: constructPassedInstalledSandboxQualificationOutcome({
        lane: "install",
        trace: []
      }),
      scenarios
    })
  );

  assert.equal(outcome.kind, "rejected");
  assert.deepStrictEqual(outcome.gaps, [
    {
      kind: "mismatched_stage_edge",
      ref: "intent_to_requirements:stage:0:intent→requirements"
    }
  ]);
});
