import type { InstalledSandboxQualificationPassed } from "./installed_carriers.js";

export type InstalledLiveScenarioName =
  | "requirements_to_uat"
  | "intent_to_requirements"
  | "gsdlc_lite_requirements_design_code"
  | "gsdlc_lite_design_review"
  | "gsdlc_lite_zoom_design";

export type InstalledLiveScenarioMode =
  | "asset_addressed"
  | "graph_function"
  | "staged_chain"
  | "review_chain"
  | "zoom_chain";

export interface InstalledLiveScenarioStageResult {
  readonly handle: string;
  readonly edge: string;
  readonly sourceKind: string;
  readonly targetKind: string;
  readonly assetHandle: string | null;
  readonly assessmentIds: readonly string[];
}

export interface InstalledLiveScenarioResult {
  readonly scenarioName: InstalledLiveScenarioName;
  readonly scenarioAuthorityRefs: readonly string[];
  readonly mode: InstalledLiveScenarioMode;
  readonly stages: readonly InstalledLiveScenarioStageResult[];
  readonly stageCount: number;
  readonly maxAssessmentCount: number;
  readonly passed: boolean;
  readonly emittedEventKinds: readonly string[];
  readonly finalRunStatus: string;
}

export interface InstalledLiveScenarioPortfolioRequest {
  readonly installedQualification: InstalledSandboxQualificationPassed;
  readonly scenarios: readonly InstalledLiveScenarioResult[];
}

export type InstalledLiveScenarioPortfolioGapKind =
  | "missing_scenario"
  | "duplicate_scenario"
  | "failed_scenario"
  | "missing_authority_ref"
  | "mismatched_mode"
  | "missing_stage"
  | "mismatched_stage_handle"
  | "mismatched_stage_edge"
  | "mismatched_stage_source"
  | "mismatched_stage_target"
  | "mismatched_stage_asset_handle"
  | "mismatched_stage_assessments"
  | "mismatched_stage_count"
  | "insufficient_stage_count"
  | "insufficient_assessment_count"
  | "missing_event_kind"
  | "unexpected_final_status";

export interface InstalledLiveScenarioPortfolioGapRef {
  readonly kind: InstalledLiveScenarioPortfolioGapKind;
  readonly ref: string;
}

export interface InstalledLiveScenarioPortfolioPassed {
  readonly kind: "passed";
  readonly scenarioNames: readonly InstalledLiveScenarioName[];
}

export interface InstalledLiveScenarioPortfolioRejected {
  readonly kind: "rejected";
  readonly reason: string;
  readonly gaps: readonly InstalledLiveScenarioPortfolioGapRef[];
}

export type InstalledLiveScenarioPortfolioOutcome =
  | InstalledLiveScenarioPortfolioPassed
  | InstalledLiveScenarioPortfolioRejected;
