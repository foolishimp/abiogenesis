import type {
  InstalledSandboxBehaviorPortfolioGapKind,
  InstalledSandboxBehaviorPortfolioGapRef,
  InstalledSandboxBehaviorPortfolioOutcome,
  InstalledSandboxBehaviorPortfolioPassed,
  InstalledSandboxBehaviorPortfolioRejected,
  InstalledSandboxBehaviorPortfolioRequest,
  InstalledSandboxBehaviorScenarioResult,
  PythonSandboxBehaviorScenarioObligation
} from "./sandbox_behavior_portfolio_carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeScenarioResults(
  values: readonly InstalledSandboxBehaviorScenarioResult[]
): readonly InstalledSandboxBehaviorScenarioResult[] {
  return Object.freeze(
    values.map((entry) => constructInstalledSandboxBehaviorScenarioResult(entry))
  );
}

function freezeGaps(
  values: readonly InstalledSandboxBehaviorPortfolioGapRef[]
): readonly InstalledSandboxBehaviorPortfolioGapRef[] {
  return Object.freeze(
    values.map((entry) =>
      constructInstalledSandboxBehaviorPortfolioGapRef(entry.kind, entry.ref)
    )
  );
}

export function constructPythonSandboxBehaviorScenarioObligation(
  input: PythonSandboxBehaviorScenarioObligation
): PythonSandboxBehaviorScenarioObligation {
  return Object.freeze({
    scenarioName: input.scenarioName,
    usecaseId: input.usecaseId,
    lane: input.lane,
    sourceFile: input.sourceFile,
    sourceLine: input.sourceLine,
    minStageCount: input.minStageCount,
    minAssessmentCount: input.minAssessmentCount,
    requiredEventKinds: freezeStringArray(input.requiredEventKinds)
  });
}

export function constructInstalledSandboxBehaviorScenarioResult(
  input: InstalledSandboxBehaviorScenarioResult
): InstalledSandboxBehaviorScenarioResult {
  return Object.freeze({
    scenarioName: input.scenarioName,
    usecaseId: input.usecaseId,
    lane: input.lane,
    sourceFile: input.sourceFile,
    sourceLine: input.sourceLine,
    stageCount: input.stageCount,
    assessmentCount: input.assessmentCount,
    passed: input.passed,
    emittedEventKinds: freezeStringArray(input.emittedEventKinds),
    finalRunStatus: input.finalRunStatus,
    evidenceRefs: freezeStringArray(input.evidenceRefs)
  });
}

export function constructInstalledSandboxBehaviorPortfolioRequest(input: {
  readonly installedQualification: InstalledSandboxBehaviorPortfolioRequest["installedQualification"];
  readonly scenarios: readonly InstalledSandboxBehaviorScenarioResult[];
}): InstalledSandboxBehaviorPortfolioRequest {
  return Object.freeze({
    installedQualification: input.installedQualification,
    scenarios: freezeScenarioResults(input.scenarios)
  });
}

export function constructInstalledSandboxBehaviorPortfolioGapRef(
  kind: InstalledSandboxBehaviorPortfolioGapKind,
  ref: string
): InstalledSandboxBehaviorPortfolioGapRef {
  return Object.freeze({
    kind,
    ref
  });
}

export function constructPassedInstalledSandboxBehaviorPortfolioOutcome(input: {
  readonly scenarioCount: number;
  readonly laneCounts: InstalledSandboxBehaviorPortfolioPassed["laneCounts"];
  readonly scenarioNames: readonly string[];
}): InstalledSandboxBehaviorPortfolioPassed {
  return Object.freeze({
    kind: "passed",
    scenarioCount: input.scenarioCount,
    laneCounts: Object.freeze({
      install: input.laneCounts.install,
      fake: input.laneCounts.fake,
      live: input.laneCounts.live
    }),
    scenarioNames: freezeStringArray(input.scenarioNames)
  });
}

export function constructRejectedInstalledSandboxBehaviorPortfolioOutcome(input: {
  readonly reason: string;
  readonly gaps: readonly InstalledSandboxBehaviorPortfolioGapRef[];
}): InstalledSandboxBehaviorPortfolioRejected {
  return Object.freeze({
    kind: "rejected",
    reason: input.reason,
    gaps: freezeGaps(input.gaps)
  });
}

export function constructInstalledSandboxBehaviorPortfolioOutcome(
  outcome: InstalledSandboxBehaviorPortfolioOutcome
): InstalledSandboxBehaviorPortfolioOutcome {
  return Object.freeze({
    ...outcome
  });
}
