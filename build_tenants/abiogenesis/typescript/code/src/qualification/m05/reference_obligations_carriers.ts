import type {
  InstalledLiveScenarioMode,
  InstalledLiveScenarioName,
  InstalledLiveScenarioStageResult
} from "./live_portfolio_carriers.js";

export type M05ReferenceObligationState =
  | "proved"
  | "repriced"
  | "not_applicable";

export type M05ReferenceObligationSource =
  | "python_sandbox_install"
  | "python_sandbox_behavior_portfolio"
  | "python_sandbox_live"
  | "python_run_archive"
  | "python_reset_postmortem";

export interface M05ReferenceLiveScenarioObligation {
  readonly scenarioName: InstalledLiveScenarioName;
  readonly source: "python_sandbox_live";
  readonly requiredAuthorityRefs: readonly string[];
  readonly mode: InstalledLiveScenarioMode;
  readonly stages: readonly InstalledLiveScenarioStageResult[];
  readonly minStageCount: number;
  readonly minAssessmentCount: number;
}

export interface M05ReferenceObligation {
  readonly id: string;
  readonly source: M05ReferenceObligationSource;
  readonly state: M05ReferenceObligationState;
  readonly requirementRefs: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly rationale: string;
}
