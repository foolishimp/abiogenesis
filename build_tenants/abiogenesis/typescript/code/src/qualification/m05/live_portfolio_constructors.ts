import type {
  InstalledLiveScenarioName,
  InstalledLiveScenarioPortfolioGapKind,
  InstalledLiveScenarioPortfolioGapRef,
  InstalledLiveScenarioPortfolioOutcome,
  InstalledLiveScenarioPortfolioPassed,
  InstalledLiveScenarioPortfolioRejected,
  InstalledLiveScenarioPortfolioRequest,
  InstalledLiveScenarioResult,
  InstalledLiveScenarioStageResult
} from "./live_portfolio_carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeScenarioNameArray(
  values: readonly InstalledLiveScenarioName[]
): readonly InstalledLiveScenarioName[] {
  return Object.freeze([...values]);
}

function freezeScenarioResults(
  values: readonly InstalledLiveScenarioResult[]
): readonly InstalledLiveScenarioResult[] {
  return Object.freeze(
    values.map((scenario) => constructInstalledLiveScenarioResult(scenario))
  );
}

function freezeScenarioStages(
  values: readonly InstalledLiveScenarioStageResult[]
): readonly InstalledLiveScenarioStageResult[] {
  return Object.freeze(
    values.map((stage) =>
      Object.freeze({
        handle: stage.handle,
        edge: stage.edge,
        sourceKind: stage.sourceKind,
        targetKind: stage.targetKind,
        assetHandle: stage.assetHandle,
        assessmentIds: freezeStringArray(stage.assessmentIds)
      })
    )
  );
}

function freezeGaps(
  values: readonly InstalledLiveScenarioPortfolioGapRef[]
): readonly InstalledLiveScenarioPortfolioGapRef[] {
  return Object.freeze([...values]);
}

export function constructInstalledLiveScenarioResult(
  input: InstalledLiveScenarioResult
): InstalledLiveScenarioResult {
  return Object.freeze({
    scenarioName: input.scenarioName,
    scenarioAuthorityRefs: freezeStringArray(input.scenarioAuthorityRefs),
    mode: input.mode,
    stages: freezeScenarioStages(input.stages),
    stageCount: input.stageCount,
    maxAssessmentCount: input.maxAssessmentCount,
    passed: input.passed,
    emittedEventKinds: freezeStringArray(input.emittedEventKinds),
    finalRunStatus: input.finalRunStatus
  });
}

export function constructInstalledLiveScenarioPortfolioRequest(input: {
  readonly installedQualification: InstalledLiveScenarioPortfolioRequest["installedQualification"];
  readonly scenarios: readonly InstalledLiveScenarioResult[];
}): InstalledLiveScenarioPortfolioRequest {
  return Object.freeze({
    installedQualification: input.installedQualification,
    scenarios: freezeScenarioResults(input.scenarios)
  });
}

export function constructInstalledLiveScenarioPortfolioGapRef(
  kind: InstalledLiveScenarioPortfolioGapKind,
  ref: string
): InstalledLiveScenarioPortfolioGapRef {
  return Object.freeze({
    kind,
    ref
  });
}

export function constructPassedInstalledLiveScenarioPortfolioOutcome(input: {
  readonly scenarioNames: readonly InstalledLiveScenarioName[];
}): InstalledLiveScenarioPortfolioPassed {
  return Object.freeze({
    kind: "passed",
    scenarioNames: freezeScenarioNameArray(input.scenarioNames)
  });
}

export function constructRejectedInstalledLiveScenarioPortfolioOutcome(input: {
  readonly reason: string;
  readonly gaps: readonly InstalledLiveScenarioPortfolioGapRef[];
}): InstalledLiveScenarioPortfolioRejected {
  return Object.freeze({
    kind: "rejected",
    reason: input.reason,
    gaps: freezeGaps(input.gaps)
  });
}

export function constructInstalledLiveScenarioPortfolioOutcome(
  outcome: InstalledLiveScenarioPortfolioOutcome
): InstalledLiveScenarioPortfolioOutcome {
  return Object.freeze({
    ...outcome
  });
}
