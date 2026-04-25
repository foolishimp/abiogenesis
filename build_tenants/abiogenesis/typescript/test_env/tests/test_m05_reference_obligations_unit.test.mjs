// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS,
  M05_REFERENCE_OBLIGATIONS,
  M05_REFERENCE_REQUIRED_EVENT_KINDS,
  collectQualificationObligationGaps,
  constructPassedInstalledSandboxQualificationOutcome,
  qualificationObligation,
  qualifyInstalledLiveScenarioPortfolio
} from "../../build/semantic/code/src/qualification/m05/index.js";
import { buildInstalledLiveScenarioPortfolioRequest } from "./support/m05-installed-fixtures.mjs";

const LAWFUL_STATES = new Set(["proved", "repriced", "not_applicable"]);

test("M05 reference-obligations unit: common qualification obligation evaluator derives immutable gaps", () => {
  const gaps = collectQualificationObligationGaps({
    constructGap: (kind, ref) => Object.freeze({ kind, ref }),
    obligations: Object.freeze([
      qualificationObligation(true, "missing_event_kind", "scenario:a"),
      qualificationObligation(false, "missing_event_kind", "scenario:b")
    ])
  });

  assert.deepStrictEqual(gaps, [
    {
      kind: "missing_event_kind",
      ref: "scenario:b"
    }
  ]);
  assert.equal(Object.isFrozen(gaps), true);
  assert.equal(Object.isFrozen(gaps[0]), true);
});

test("M05 reference-obligations unit: Python-derived obligations are reusable TypeScript proof inputs, not Python harness dependencies", () => {
  assert.deepStrictEqual(
    M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS.map(
      (obligation) => obligation.scenarioName
    ),
    [
      "requirements_to_uat",
      "intent_to_requirements",
      "gsdlc_lite_requirements_design_code",
      "gsdlc_lite_design_review",
      "gsdlc_lite_zoom_design"
    ]
  );

  assert.deepStrictEqual(
    M05_REFERENCE_REQUIRED_EVENT_KINDS,
    [
      "basis_admitted",
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "fp_dispatch_requested",
      "assessed"
    ]
  );

  assert.deepStrictEqual(
    M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS.map((obligation) => ({
      scenarioName: obligation.scenarioName,
      edges: obligation.stages.map((stage) => stage.edge)
    })),
    [
      {
        scenarioName: "requirements_to_uat",
        edges: ["requirements→uat_tests"]
      },
      {
        scenarioName: "intent_to_requirements",
        edges: ["intents→requirements"]
      },
      {
        scenarioName: "gsdlc_lite_requirements_design_code",
        edges: ["requirements→design", "design→code"]
      },
      {
        scenarioName: "gsdlc_lite_design_review",
        edges: ["requirements→design", "design→design_review", "design_review→code"]
      },
      {
        scenarioName: "gsdlc_lite_zoom_design",
        edges: [
          "requirements→decomposition",
          "decomposition→dependency_chain",
          "dependency_chain→sequencing",
          "sequencing→design",
          "requirements→design"
        ]
      }
    ]
  );

  for (const obligation of M05_REFERENCE_OBLIGATIONS) {
    assert.equal(LAWFUL_STATES.has(obligation.state), true);
    assert.notEqual(obligation.requirementRefs.length, 0);
    assert.notEqual(obligation.sourceRefs.length, 0);
    assert.notEqual(obligation.proofRefs.length, 0);
    assert.equal(
      obligation.proofRefs.every((ref) => !ref.startsWith("python/")),
      true
    );
  }

  const outcome = qualifyInstalledLiveScenarioPortfolio(
    buildInstalledLiveScenarioPortfolioRequest({
      installedQualification: constructPassedInstalledSandboxQualificationOutcome({
        lane: "install",
        trace: []
      }),
      scenarios: M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS.map((obligation) => ({
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
      }))
    })
  );

  assert.equal(outcome.kind, "passed");
});
