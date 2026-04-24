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

export interface InstalledLiveScenarioResult {
  readonly scenarioName: InstalledLiveScenarioName;
  readonly scenarioAuthorityRefs: readonly string[];
  readonly mode: InstalledLiveScenarioMode;
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
