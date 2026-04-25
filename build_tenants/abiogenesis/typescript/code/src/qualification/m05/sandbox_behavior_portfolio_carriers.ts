import type { InstalledSandboxQualificationPassed } from "./installed_carriers.js";

export type PythonSandboxBehaviorLane = "install" | "fake" | "live";

export interface PythonSandboxBehaviorScenarioObligation {
  readonly scenarioName: string;
  readonly usecaseId: string;
  readonly lane: PythonSandboxBehaviorLane;
  readonly sourceFile: string;
  readonly sourceLine: number;
  readonly minStageCount: number;
  readonly minAssessmentCount: number;
  readonly requiredEventKinds: readonly string[];
}

export interface InstalledSandboxBehaviorScenarioResult {
  readonly scenarioName: string;
  readonly usecaseId: string;
  readonly lane: PythonSandboxBehaviorLane;
  readonly sourceFile: string;
  readonly sourceLine: number;
  readonly stageCount: number;
  readonly assessmentCount: number;
  readonly passed: boolean;
  readonly emittedEventKinds: readonly string[];
  readonly finalRunStatus: string;
  readonly evidenceRefs: readonly string[];
}

export interface InstalledSandboxBehaviorPortfolioRequest {
  readonly installedQualification: InstalledSandboxQualificationPassed;
  readonly scenarios: readonly InstalledSandboxBehaviorScenarioResult[];
}

export type InstalledSandboxBehaviorPortfolioGapKind =
  | "installed_qualification_failed"
  | "missing_scenario"
  | "duplicate_scenario"
  | "failed_scenario"
  | "mismatched_usecase"
  | "mismatched_lane"
  | "mismatched_source"
  | "insufficient_stage_count"
  | "insufficient_assessment_count"
  | "missing_event_kind"
  | "unexpected_final_status"
  | "missing_archive_evidence_ref";

export interface InstalledSandboxBehaviorPortfolioGapRef {
  readonly kind: InstalledSandboxBehaviorPortfolioGapKind;
  readonly ref: string;
}

export interface InstalledSandboxBehaviorPortfolioPassed {
  readonly kind: "passed";
  readonly scenarioCount: number;
  readonly laneCounts: {
    readonly install: number;
    readonly fake: number;
    readonly live: number;
  };
  readonly scenarioNames: readonly string[];
}

export interface InstalledSandboxBehaviorPortfolioRejected {
  readonly kind: "rejected";
  readonly reason: string;
  readonly gaps: readonly InstalledSandboxBehaviorPortfolioGapRef[];
}

export type InstalledSandboxBehaviorPortfolioOutcome =
  | InstalledSandboxBehaviorPortfolioPassed
  | InstalledSandboxBehaviorPortfolioRejected;
