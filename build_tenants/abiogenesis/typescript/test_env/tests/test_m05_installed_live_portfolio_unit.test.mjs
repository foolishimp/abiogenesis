// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructPassedInstalledSandboxQualificationOutcome,
  qualifyInstalledLiveScenarioPortfolio
} from "../../build/semantic/code/src/qualification/m05/index.js";
import { buildInstalledLiveScenarioPortfolioRequest } from "./support/m05-installed-fixtures.mjs";

test("M05 installed live-portfolio unit: portfolio request preserves the required Python scenario families and breadth", () => {
  const outcome = qualifyInstalledLiveScenarioPortfolio(
    buildInstalledLiveScenarioPortfolioRequest({
      installedQualification: constructPassedInstalledSandboxQualificationOutcome({
        lane: "install",
        trace: []
      }),
      scenarios: [
        {
          scenarioName: "requirements_to_uat",
          scenarioAuthorityRefs: ["SCN-R2U-001"],
          mode: "asset_addressed",
          stageCount: 1,
          maxAssessmentCount: 1,
          passed: true,
          emittedEventKinds: ["basis_admitted", "fp_dispatch_requested", "assessed"],
          finalRunStatus: "assessed"
        },
        {
          scenarioName: "intent_to_requirements",
          scenarioAuthorityRefs: ["SCN-I2R-001"],
          mode: "graph_function",
          stageCount: 1,
          maxAssessmentCount: 1,
          passed: true,
          emittedEventKinds: ["basis_admitted", "fp_dispatch_requested", "assessed"],
          finalRunStatus: "assessed"
        },
        {
          scenarioName: "gsdlc_lite_requirements_design_code",
          scenarioAuthorityRefs: ["SCN-GSDLCLITE-001"],
          mode: "staged_chain",
          stageCount: 2,
          maxAssessmentCount: 1,
          passed: true,
          emittedEventKinds: ["basis_admitted", "fp_dispatch_requested", "assessed"],
          finalRunStatus: "assessed"
        },
        {
          scenarioName: "gsdlc_lite_design_review",
          scenarioAuthorityRefs: ["SCN-GSDLCLITE-001"],
          mode: "review_chain",
          stageCount: 3,
          maxAssessmentCount: 3,
          passed: true,
          emittedEventKinds: ["basis_admitted", "fp_dispatch_requested", "assessed"],
          finalRunStatus: "assessed"
        },
        {
          scenarioName: "gsdlc_lite_zoom_design",
          scenarioAuthorityRefs: ["SCN-GSDLCLITE-001"],
          mode: "zoom_chain",
          stageCount: 5,
          maxAssessmentCount: 1,
          passed: true,
          emittedEventKinds: ["basis_admitted", "fp_dispatch_requested", "assessed"],
          finalRunStatus: "assessed"
        }
      ]
    })
  );

  assert.deepStrictEqual(outcome, {
    kind: "passed",
    scenarioNames: [
      "requirements_to_uat",
      "intent_to_requirements",
      "gsdlc_lite_requirements_design_code",
      "gsdlc_lite_design_review",
      "gsdlc_lite_zoom_design"
    ]
  });
});
