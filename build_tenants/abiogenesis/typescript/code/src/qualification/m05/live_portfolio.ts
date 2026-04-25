import {
  constructInstalledLiveScenarioPortfolioGapRef,
  constructInstalledLiveScenarioPortfolioOutcome,
  constructPassedInstalledLiveScenarioPortfolioOutcome,
  constructRejectedInstalledLiveScenarioPortfolioOutcome
} from "./live_portfolio_constructors.js";
import {
  M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS,
  M05_REFERENCE_REQUIRED_EVENT_KINDS
} from "./reference_obligations.js";
import type {
  InstalledLiveScenarioPortfolioGapRef,
  InstalledLiveScenarioPortfolioOutcome,
  InstalledLiveScenarioPortfolioRequest,
  InstalledLiveScenarioResult,
  InstalledLiveScenarioStageResult
} from "./live_portfolio_carriers.js";
import type { M05ReferenceLiveScenarioObligation } from "./reference_obligations_carriers.js";
import {
  collectQualificationObligationGaps,
  collectMissingEventKindGaps,
  collectMissingRequiredRefs,
  collectRequiredScenarioCardinalityGaps,
  qualificationObligation
} from "./qualification_common.js";

function sameStringSequence(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

function collectStageGaps(
  scenarioName: string,
  stage: InstalledLiveScenarioStageResult | undefined,
  required: InstalledLiveScenarioStageResult,
  index: number
): readonly InstalledLiveScenarioPortfolioGapRef[] {
  const refPrefix = `${scenarioName}:stage:${index}`;

  if (stage === undefined) {
    return Object.freeze([
      constructInstalledLiveScenarioPortfolioGapRef(
        "missing_stage",
        `${refPrefix}:${required.edge}`
      )
    ]);
  }

  return Object.freeze([
    ...collectQualificationObligationGaps({
      constructGap: constructInstalledLiveScenarioPortfolioGapRef,
      obligations: Object.freeze([
        qualificationObligation(
          stage.handle === required.handle,
          "mismatched_stage_handle",
          `${refPrefix}:${stage.handle}`
        ),
        qualificationObligation(
          stage.edge === required.edge,
          "mismatched_stage_edge",
          `${refPrefix}:${stage.edge}`
        ),
        qualificationObligation(
          stage.sourceKind === required.sourceKind,
          "mismatched_stage_source",
          `${refPrefix}:${stage.sourceKind}`
        ),
        qualificationObligation(
          stage.targetKind === required.targetKind,
          "mismatched_stage_target",
          `${refPrefix}:${stage.targetKind}`
        ),
        qualificationObligation(
          stage.assetHandle === required.assetHandle,
          "mismatched_stage_asset_handle",
          `${refPrefix}:${stage.assetHandle ?? "null"}`
        ),
        qualificationObligation(
          sameStringSequence(stage.assessmentIds, required.assessmentIds),
          "mismatched_stage_assessments",
          `${refPrefix}:${stage.assessmentIds.join(",")}`
        )
      ])
    })
  ]);
}

function collectScenarioGaps(
  scenario: InstalledLiveScenarioResult,
  required: M05ReferenceLiveScenarioObligation
): readonly InstalledLiveScenarioPortfolioGapRef[] {
  return Object.freeze([
    ...collectQualificationObligationGaps({
      constructGap: constructInstalledLiveScenarioPortfolioGapRef,
      obligations: Object.freeze([
        qualificationObligation(
          scenario.passed,
          "failed_scenario",
          scenario.scenarioName
        ),
        qualificationObligation(
          scenario.mode === required.mode,
          "mismatched_mode",
          `${scenario.scenarioName}:${scenario.mode}`
        ),
        qualificationObligation(
          scenario.stageCount >= required.minStageCount,
          "insufficient_stage_count",
          `${scenario.scenarioName}:${scenario.stageCount}`
        ),
        qualificationObligation(
          scenario.stages.length === required.stages.length,
          "mismatched_stage_count",
          `${scenario.scenarioName}:exact:${scenario.stages.length}`
        ),
        qualificationObligation(
          scenario.maxAssessmentCount >= required.minAssessmentCount,
          "insufficient_assessment_count",
          `${scenario.scenarioName}:${scenario.maxAssessmentCount}`
        ),
        qualificationObligation(
          scenario.finalRunStatus === "assessed",
          "unexpected_final_status",
          `${scenario.scenarioName}:${scenario.finalRunStatus}`
        )
      ])
    }),
    ...collectMissingRequiredRefs({
      observed: scenario.scenarioAuthorityRefs,
      required: required.requiredAuthorityRefs,
      refPrefix: scenario.scenarioName,
      missingKind: "missing_authority_ref",
      constructGap: constructInstalledLiveScenarioPortfolioGapRef
    }),
    ...required.stages.flatMap((requiredStage, index) =>
      collectStageGaps(
        scenario.scenarioName,
        scenario.stages[index],
        requiredStage,
        index
      )
    ),
    ...collectMissingEventKindGaps({
      observedEventKinds: scenario.emittedEventKinds,
      requiredEventKinds: M05_REFERENCE_REQUIRED_EVENT_KINDS,
      refPrefix: scenario.scenarioName,
      missingKind: "missing_event_kind",
      constructGap: constructInstalledLiveScenarioPortfolioGapRef
    })
  ]);
}

export function qualifyInstalledLiveScenarioPortfolio(
  request: InstalledLiveScenarioPortfolioRequest
): InstalledLiveScenarioPortfolioOutcome {
  const installedQualificationGaps = collectQualificationObligationGaps({
    constructGap: constructInstalledLiveScenarioPortfolioGapRef,
    obligations: Object.freeze([
      qualificationObligation(
        request.installedQualification.kind === "passed",
        "failed_scenario",
        "installed_qualification"
      )
    ])
  });
  const scenarioGaps = M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS.flatMap((required) => {
    const cardinality = collectRequiredScenarioCardinalityGaps({
      scenarios: request.scenarios,
      scenarioName: required.scenarioName,
      getScenarioName: (scenario) => scenario.scenarioName,
      constructGap: constructInstalledLiveScenarioPortfolioGapRef,
      missingKind: "missing_scenario",
      duplicateKind: "duplicate_scenario"
    });

    if (cardinality.gaps.length > 0) {
      return cardinality.gaps;
    }

    const scenario = cardinality.matches[0];
    if (scenario === undefined) {
      return [];
    }

    return collectScenarioGaps(scenario, required);
  });
  const gaps = Object.freeze([
    ...installedQualificationGaps,
    ...scenarioGaps
  ]);

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
      scenarioNames: M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS.map(
        (spec) => spec.scenarioName
      )
    })
  );
}
