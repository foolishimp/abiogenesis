import {
  constructInstalledLiveScenarioPortfolioGapRef,
  constructInstalledLiveScenarioPortfolioOutcome,
  constructPassedInstalledLiveScenarioPortfolioOutcome,
  constructRejectedInstalledLiveScenarioPortfolioOutcome
} from "./live_portfolio_constructors.js";
import type {
  InstalledLiveScenarioName,
  InstalledLiveScenarioPortfolioGapRef,
  InstalledLiveScenarioPortfolioOutcome,
  InstalledLiveScenarioPortfolioRequest,
  InstalledLiveScenarioResult
} from "./live_portfolio_carriers.js";

interface RequiredInstalledScenarioSpec {
  readonly scenarioName: InstalledLiveScenarioName;
  readonly authorityRefs: readonly string[];
  readonly mode: InstalledLiveScenarioResult["mode"];
  readonly minStageCount: number;
  readonly minAssessmentCount: number;
}

const REQUIRED_EVENT_KINDS: readonly string[] = Object.freeze([
  "basis_admitted",
  "fp_dispatch_requested",
  "assessed"
]);

const REQUIRED_SCENARIO_SPECS: readonly RequiredInstalledScenarioSpec[] =
  Object.freeze([
    Object.freeze({
      scenarioName: "requirements_to_uat",
      authorityRefs: ["SCN-R2U-001"],
      mode: "asset_addressed",
      minStageCount: 1,
      minAssessmentCount: 1
    }),
    Object.freeze({
      scenarioName: "intent_to_requirements",
      authorityRefs: ["SCN-I2R-001"],
      mode: "graph_function",
      minStageCount: 1,
      minAssessmentCount: 1
    }),
    Object.freeze({
      scenarioName: "gsdlc_lite_requirements_design_code",
      authorityRefs: ["SCN-GSDLCLITE-001"],
      mode: "staged_chain",
      minStageCount: 2,
      minAssessmentCount: 1
    }),
    Object.freeze({
      scenarioName: "gsdlc_lite_design_review",
      authorityRefs: ["SCN-GSDLCLITE-001"],
      mode: "review_chain",
      minStageCount: 3,
      minAssessmentCount: 3
    }),
    Object.freeze({
      scenarioName: "gsdlc_lite_zoom_design",
      authorityRefs: ["SCN-GSDLCLITE-001"],
      mode: "zoom_chain",
      minStageCount: 5,
      minAssessmentCount: 1
    })
  ]);

function collectScenarioGaps(
  scenario: InstalledLiveScenarioResult,
  required: RequiredInstalledScenarioSpec
): readonly InstalledLiveScenarioPortfolioGapRef[] {
  const gaps: InstalledLiveScenarioPortfolioGapRef[] = [];

  if (!scenario.passed) {
    gaps.push(
      constructInstalledLiveScenarioPortfolioGapRef(
        "failed_scenario",
        scenario.scenarioName
      )
    );
  }

  for (const ref of required.authorityRefs) {
    if (!scenario.scenarioAuthorityRefs.includes(ref)) {
      gaps.push(
        constructInstalledLiveScenarioPortfolioGapRef(
          "missing_authority_ref",
          `${scenario.scenarioName}:${ref}`
        )
      );
    }
  }

  if (scenario.mode !== required.mode) {
    gaps.push(
      constructInstalledLiveScenarioPortfolioGapRef(
        "mismatched_mode",
        `${scenario.scenarioName}:${scenario.mode}`
      )
    );
  }

  if (scenario.stageCount < required.minStageCount) {
    gaps.push(
      constructInstalledLiveScenarioPortfolioGapRef(
        "insufficient_stage_count",
        `${scenario.scenarioName}:${scenario.stageCount}`
      )
    );
  }

  if (scenario.maxAssessmentCount < required.minAssessmentCount) {
    gaps.push(
      constructInstalledLiveScenarioPortfolioGapRef(
        "insufficient_assessment_count",
        `${scenario.scenarioName}:${scenario.maxAssessmentCount}`
      )
    );
  }

  for (const kind of REQUIRED_EVENT_KINDS) {
    if (!scenario.emittedEventKinds.includes(kind)) {
      gaps.push(
        constructInstalledLiveScenarioPortfolioGapRef(
          "missing_event_kind",
          `${scenario.scenarioName}:${kind}`
        )
      );
    }
  }

  if (scenario.finalRunStatus !== "assessed") {
    gaps.push(
      constructInstalledLiveScenarioPortfolioGapRef(
        "unexpected_final_status",
        `${scenario.scenarioName}:${scenario.finalRunStatus}`
      )
    );
  }

  return Object.freeze(gaps);
}

export function qualifyInstalledLiveScenarioPortfolio(
  request: InstalledLiveScenarioPortfolioRequest
): InstalledLiveScenarioPortfolioOutcome {
  const gaps: InstalledLiveScenarioPortfolioGapRef[] = [];

  if (request.installedQualification.kind !== "passed") {
    gaps.push(
      constructInstalledLiveScenarioPortfolioGapRef(
        "failed_scenario",
        "installed_qualification"
      )
    );
  }

  for (const required of REQUIRED_SCENARIO_SPECS) {
    const matches = request.scenarios.filter(
      (scenario) => scenario.scenarioName === required.scenarioName
    );

    if (matches.length === 0) {
      gaps.push(
        constructInstalledLiveScenarioPortfolioGapRef(
          "missing_scenario",
          required.scenarioName
        )
      );
      continue;
    }

    if (matches.length > 1) {
      gaps.push(
        constructInstalledLiveScenarioPortfolioGapRef(
          "duplicate_scenario",
          required.scenarioName
        )
      );
      continue;
    }

    const scenario = matches[0];
    if (scenario === undefined) {
      continue;
    }

    gaps.push(...collectScenarioGaps(scenario, required));
  }

  if (gaps.length > 0) {
    return constructInstalledLiveScenarioPortfolioOutcome(
      constructRejectedInstalledLiveScenarioPortfolioOutcome({
        reason: "installed live scenario portfolio is incomplete",
        gaps
      })
    );
  }

  return constructInstalledLiveScenarioPortfolioOutcome(
    constructPassedInstalledLiveScenarioPortfolioOutcome({
      scenarioNames: REQUIRED_SCENARIO_SPECS.map((spec) => spec.scenarioName)
    })
  );
}
