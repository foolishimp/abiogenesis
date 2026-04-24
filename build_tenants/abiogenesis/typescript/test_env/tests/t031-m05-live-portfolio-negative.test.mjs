// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructPassedInstalledSandboxQualificationOutcome,
  qualifyInstalledLiveScenarioPortfolio
} from "../../build/semantic/code/src/qualification/m05/index.js";
import { buildInstalledLiveScenarioPortfolioRequest } from "./support/m05-installed-fixtures.mjs";

test("T-031 negative proof: installed live portfolio rejects a missing Python scenario family", () => {
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
        }
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
