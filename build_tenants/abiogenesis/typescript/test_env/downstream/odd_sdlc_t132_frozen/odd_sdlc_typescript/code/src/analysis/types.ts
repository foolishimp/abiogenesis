// Implements: T-161

import type { SdlcBlockingReason } from "../shared/blocking_reason.js";
import type { SdlcExecutiveEdgeAccountingAudit } from "../graph/edge_accounting.js";
import type { SdlcTraversalHopSelection } from "../operator/carriers.js";

export const SDLC_FD_RUN_ANALYSIS_KIND = "sdlc_fd_run_analysis" as const;
export const SDLC_FD_RUN_ANALYSIS_VERSION = 1 as const;

export const SDLC_FD_RUN_ANALYSIS_INSPECTED_KIND_VALUES = Object.freeze([
  "workspace",
  "run-archive",
  "operator-run"
] as const);

export type SdlcFdRunAnalysisInspectedKind =
  (typeof SDLC_FD_RUN_ANALYSIS_INSPECTED_KIND_VALUES)[number];

export const SDLC_FD_RUN_ANALYSIS_PROFILE_VALUES = Object.freeze([
  "generic"
] as const);

export type SdlcFdRunAnalysisProfile = string;

export interface SdlcFdRunAnalysisProfileCapability {
  readonly kind: "sdlc_fd_run_analysis_profile_capability";
  readonly name: string;
  readonly value: string;
}

export const SDLC_FD_RUN_ANALYSIS_FORMAT_VALUES = Object.freeze([
  "json",
  "markdown"
] as const);

export type SdlcFdRunAnalysisFormat =
  (typeof SDLC_FD_RUN_ANALYSIS_FORMAT_VALUES)[number];

export const SDLC_FD_RUN_ANALYSIS_DIAGNOSTIC_CODE_VALUES = Object.freeze([
  "retry_observed",
  "repair_observed",
  "blocked_attempt_observed",
  "worker_authority_read_outside_workspace_observed",
  "prompt_context_volume_high",
  "handoff_growth_suspicious",
  "event_snapshot_volume_high",
  "requirement_fanout_suspicious",
  "product_lineage_missing",
  "product_lineage_fanout_suspicious",
  "runtime_artifact_missing",
  "runtime_artifact_malformed",
  "edge_sequence_incomplete",
  "phase_timing_unavailable",
  "aborted_run_observed",
  "unattributed_time_high",
  "active_run_stalled_no_io",
  "active_run_stalled_with_io",
  "worker_heartbeat_age_high",
  "archive_growth_zero_during_active_edge",
  "summary_source_drift"
] as const);

export type SdlcFdRunAnalysisDiagnosticCode =
  (typeof SDLC_FD_RUN_ANALYSIS_DIAGNOSTIC_CODE_VALUES)[number];

export const SDLC_FD_RUN_ANALYSIS_DIAGNOSTIC_SEVERITY_VALUES = Object.freeze([
  "info",
  "warn",
  "error"
] as const);

export type SdlcFdRunAnalysisDiagnosticSeverity =
  (typeof SDLC_FD_RUN_ANALYSIS_DIAGNOSTIC_SEVERITY_VALUES)[number];

export const SDLC_FD_RUN_ANALYSIS_POLICY_STATUS_VALUES = Object.freeze([
  "ratified",
  "informational"
] as const);

export type SdlcFdRunAnalysisPolicyStatus =
  (typeof SDLC_FD_RUN_ANALYSIS_POLICY_STATUS_VALUES)[number];

export const SDLC_FD_RUN_ANALYSIS_PRODUCTIVE_SIGNAL_VALUES = Object.freeze([
  "progressing",
  "stalled_with_io",
  "stalled_no_io",
  "completed",
  "aborted_or_killed",
  "unknown"
] as const);

export type SdlcFdRunAnalysisProductiveSignal =
  (typeof SDLC_FD_RUN_ANALYSIS_PRODUCTIVE_SIGNAL_VALUES)[number];

export const SDLC_FD_RUN_ANALYSIS_RETRY_CAUSE_CLASS_VALUES = Object.freeze([
  "prompt_schema_gap",
  "framework_carrier_parser_drift",
  "worker_policy_violation",
  "target_carrier_admission_missing",
  "deterministic_evaluator_bug",
  "harness_bug",
  "runtime_bug",
  "tenant_source_defect",
  "unknown"
] as const);

export type SdlcFdRunAnalysisRetryCauseClass =
  (typeof SDLC_FD_RUN_ANALYSIS_RETRY_CAUSE_CLASS_VALUES)[number];

export const SDLC_FD_RUN_ANALYSIS_STAGE_CLASS_VALUES = Object.freeze([
  "constructive",
  "projection",
  "rollup",
  "missing",
  "unmapped"
] as const);

export type SdlcFdRunAnalysisStageClass =
  (typeof SDLC_FD_RUN_ANALYSIS_STAGE_CLASS_VALUES)[number];

export interface SdlcFdRunAnalysisDiagnostic {
  readonly kind: "sdlc_fd_run_analysis_diagnostic";
  readonly code: SdlcFdRunAnalysisDiagnosticCode;
  readonly severity: SdlcFdRunAnalysisDiagnosticSeverity;
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
  readonly operatorRunRef: string | null;
  readonly edgeName: string | null;
  readonly policyRef: string | null;
}

export interface SdlcFdRunAnalysisByteAccount {
  readonly totalBytes: number;
  readonly operatorRunBytes: number;
  readonly runtimeEventBytes: number;
  readonly stdoutBytes: number;
  readonly stderrBytes: number;
  readonly promptContextBytes: number;
  readonly handoffBytes: number;
  readonly traversalIntentBytes: number;
  readonly workerInvocationBytes: number;
  readonly workerProcessEventBytes: number;
  readonly workerResultReportBytes: number;
  readonly consequenceCarrierBytes: number;
  readonly productMaterializationManifestBytes: number;
  readonly otherCarrierBytes: number;
}

export interface SdlcFdRunAnalysisCurrentStateTelemetry {
  readonly inspectedRoot: string;
  readonly inspectedKind: SdlcFdRunAnalysisInspectedKind;
  readonly scenarioName: string | null;
  readonly profile: SdlcFdRunAnalysisProfile;
  readonly operatorRunCount: number;
  readonly graphEdgeSequence: readonly string[];
  readonly sameEdgeRetryCount: number;
  readonly blockedAttemptCount: number;
  readonly repairAttemptCount: number;
  readonly yieldedAttemptCount: number;
  readonly abortedAttemptCount: number;
  readonly finalClosureDisposition: string | null;
  readonly totalWallClockMs: number | null;
  readonly totalWorkerElapsedMs: number;
  readonly unattributedElapsedMs: number | null;
  readonly archiveBytes: SdlcFdRunAnalysisByteAccount;
  readonly productFileCount: number;
  readonly requirementObligationCount: number;
  readonly productFileLineageCount: number;
}

export interface SdlcFdRunAnalysisFrontierBranch {
  readonly branchRef: string;
  readonly branchKey: string;
  readonly nodeId: string;
  readonly laneKind: "dev" | "test";
  readonly workerProcessRef: string;
  readonly materializationTargetRefs: readonly string[];
  readonly readRefs: readonly string[];
  readonly writeTerritoryRefs: readonly string[];
  readonly outputAllocationRefs: readonly string[];
}

export interface SdlcFdRunAnalysisFrontierFanIn {
  readonly branchRef: string;
  readonly nodeId: string;
  readonly predecessorBranchRefs: readonly string[];
  readonly materializationTargetRefs: readonly string[];
  readonly payloadDigest: string;
}

export interface SdlcFdRunAnalysisFrontierSummary {
  readonly graphTruthSource: "sdlc_feature_dependency_dag";
  readonly selectedMethod: string;
  readonly dependencyMapRefs: readonly string[];
  readonly traversalSelectionRefs: readonly string[];
  readonly dagRef: string;
  readonly startNodes: readonly string[];
  readonly frontierRef: string;
  readonly policyRef: string;
  readonly laneCount: number;
  readonly devLaneCount: number;
  readonly testLaneCount: number;
  readonly fanInCount: number;
  readonly batchCount: number;
  readonly batchSizes: readonly number[];
  readonly maxActive: number;
  readonly readyBranchRefs: readonly string[];
  readonly compiledReadyBranchRefs: readonly string[];
  readonly completedBranchRefs: readonly string[];
  readonly failedBranchRefs: readonly string[];
  readonly writeTerritoryConflictRefs: readonly string[];
  readonly outputAllocationConflictRefs: readonly string[];
  readonly branchRows: readonly SdlcFdRunAnalysisFrontierBranch[];
  readonly fanInRows: readonly SdlcFdRunAnalysisFrontierFanIn[];
}

export interface SdlcFdRunAnalysisStagedComputeTruth {
  readonly status: "present" | "missing" | "malformed" | "drift";
  readonly selectedCompositionRef: string | null;
  readonly selectedCompositionDigest: string | null;
  readonly selectedCompositionSelectionRef: string | null;
  readonly selectedRegimeBindingRef: string | null;
  readonly evaluateRef: string | null;
  readonly admittedStateGraphCallRef: string | null;
  readonly consequenceRef: string | null;
  readonly domainReadModelRefs: readonly string[];
  readonly detail: string | null;
}

export interface SdlcFdRunAnalysisEdgeAttempt {
  readonly attemptOrdinal: number;
  readonly operatorRunRef: string;
  readonly graphFunctionName: string | null;
  readonly graphVectorRef: string | null;
  readonly targetAssetType: string | null;
  readonly traversalClass: SdlcFdRunAnalysisStageClass;
  readonly workerElapsedMs: number | null;
  readonly edgeWindowElapsedMs: number | null;
  readonly deterministicElapsedMs: number | null;
  readonly fpEvaluateStatus: string | null;
  readonly postflightStatus: string | null;
  readonly executionEvidenceStatus: string | null;
  readonly executionEvidenceReportCount: number;
  readonly executionEvidenceLane: string | null;
  readonly executionEvidenceCommand: string | null;
  readonly executionEvidenceTestsObserved: number | null;
  readonly executionEvidencePassedCount: number | null;
  readonly executionEvidenceFailedCount: number | null;
  readonly executionEvidenceShardCount: number;
  readonly executionEvidenceReportRefs: readonly string[];
  readonly executionEvidenceSource: "none" | "component_smoke" | "graph_test_execution_result";
  readonly residualPressureRefCount: number;
  readonly residualPressureTransition: "none" | "preserved" | "cleared" | "unknown";
  readonly promptSourceCarrierRef: string | null;
  readonly promptSourceCarrierDigest: string | null;
  readonly promptRenderingRef: string | null;
  readonly promptSourcePolicyRef: string | null;
  readonly closureDisposition: string | null;
  readonly selectedNextActionRef: string | null;
  readonly predecessorAttemptRef: string | null;
  readonly blockingReasonCodes: readonly string[];
  readonly productFilesWritten: readonly string[];
  readonly productFilesReplayed: readonly string[];
  readonly requirementObligationCount: number | null;
  readonly productLineageCount: number;
  readonly promptContextBytes: number;
  readonly handoffBytes: number;
  readonly stdoutBytes: number;
  readonly eventBytes: number;
  readonly frontierSummary: SdlcFdRunAnalysisFrontierSummary | null;
  readonly stagedComputeTruth: SdlcFdRunAnalysisStagedComputeTruth;
  readonly workerDispatched: boolean;
  readonly workerStatus: string | null;
}

export interface SdlcFdRunAnalysisActiveRunLiveness {
  readonly activeOperatorRunRef: string | null;
  readonly activeEdgeRef: string | null;
  readonly activeGraphVectorRef: string | null;
  readonly activeTargetAssetType: string | null;
  readonly actorInvocationRef: string | null;
  readonly workerProcessRef: string | null;
  readonly workerPid: number | null;
  readonly processAlive: boolean | null;
  readonly processAliveCheckedAtMs: number;
  readonly lastEventAtMs: number | null;
  readonly lastStdoutAtMs: number | null;
  readonly lastHeartbeatAtMs: number | null;
  readonly heartbeatAgeMs: number | null;
  readonly maxNoOutputGapMs: number | null;
  readonly archiveGrowthBytesPerMinute: number | null;
  readonly productiveSignal: SdlcFdRunAnalysisProductiveSignal;
  readonly lastBlockingReason: SdlcBlockingReason | null;
}

export interface SdlcFdRunAnalysisRuntimeArtifactGap {
  readonly operatorRunRef: string;
  readonly artifact: string;
  readonly status: "missing" | "malformed" | "incomplete";
  readonly detail: string | null;
}

export interface SdlcFdRunAnalysisBloatBucket {
  readonly edgeIndex: number;
  readonly edgeName: string;
  readonly handoffBytes: number;
  readonly eventBytes: number;
  readonly stdoutBytes: number;
  readonly stderrBytes: number;
  readonly promptContextBytes: number;
  readonly sourceAuthorityRefCount: number;
}

export interface SdlcFdRunAnalysisBloatAndSlope {
  readonly bytesPerRequirementObligation: number | null;
  readonly bytesPerSourceAuthorityRef: number | null;
  readonly bytesPerProductFile: number | null;
  readonly bytesPerComponent: number | null;
  readonly bytesPerEdge: number | null;
  readonly bytesPerRetry: number | null;
  readonly lineageRefsPerProductFile: number | null;
  readonly duplicateRequirementAuthorityCount: number;
  readonly rawDisplayIdRequirementCount: number;
  readonly canonicalRequirementIdCount: number;
  readonly transitiveDependencyFanoutRatio: number | null;
  readonly buckets: readonly SdlcFdRunAnalysisBloatBucket[];
}

export interface SdlcFdRunAnalysisRetryForensic {
  readonly edgeName: string;
  readonly attemptRef: string;
  readonly predecessorAttemptRef: string | null;
  readonly workerSecondsBefore: number | null;
  readonly blockingReasonCodes: readonly string[];
  readonly changedFiles: readonly string[];
  readonly productFilesObserved: readonly string[];
  readonly productFilesMaterialized: readonly string[];
  readonly productFilesReplayed: readonly string[];
  readonly lineageStatus: "present" | "absent" | "unknown";
  readonly outsideWorkspaceReadCount: number;
  readonly schemaViolationCount: number;
  readonly likelyCauseClass: SdlcFdRunAnalysisRetryCauseClass;
}

export interface SdlcFdRunAnalysisConceptualStageCoverage {
  readonly kind: "sdlc_fd_run_analysis_conceptual_stage_coverage";
  readonly conceptualStageRef: string;
  readonly expectedEdgeName: string;
  readonly expectedTargetAssetType: string;
  readonly mappedEdgeName: string | null;
  readonly mappedTargetAssetType: string | null;
  readonly stageClass: SdlcFdRunAnalysisStageClass;
  readonly operatorRunRefs: readonly string[];
}

export interface SdlcFdRunAnalysisProfilePolicyRefs {
  readonly profile: SdlcFdRunAnalysisProfile;
  readonly profilePolicyRef: string;
  readonly thresholdPolicyRef: string;
  readonly policyStatus: SdlcFdRunAnalysisPolicyStatus;
}

export interface SdlcFdRunAnalysisThresholds {
  readonly heartbeatAgeStallMs: number;
  readonly noOutputGapStallMs: number;
  readonly archiveGrowthZeroToleranceMs: number;
  readonly promptContextBytesHigh: number;
  readonly handoffGrowthHighBytes: number;
  readonly eventSnapshotBytesHigh: number;
  readonly unattributedTimeHighRatio: number;
  readonly requirementFanoutSuspiciousRatio: number;
  readonly productLineageFanoutSuspiciousRatio: number;
}

export interface SdlcFdRunAnalysisProfileSpec {
  readonly policy: SdlcFdRunAnalysisProfilePolicyRefs;
  readonly capabilityContracts: readonly SdlcFdRunAnalysisProfileCapability[];
  readonly thresholds: SdlcFdRunAnalysisThresholds;
  readonly expectedRetryFloor: number;
  readonly enforceCanonicalLineage: boolean;
  readonly forbidRawDisplayIdRequirementTagsInProductFiles: boolean;
}

export interface SdlcFdRunAnalysisSummaryFieldComparison {
  readonly field: string;
  readonly summaryValue: number | string | null;
  readonly recomputedValue: number | string | null;
  readonly agrees: boolean;
  readonly sourceCarrierRef: string | null;
}

export interface SdlcFdRunAnalysisSummaryDriftReport {
  readonly summaryPresent: boolean;
  readonly summaryRef: string | null;
  readonly comparisons: readonly SdlcFdRunAnalysisSummaryFieldComparison[];
  readonly drifts: readonly SdlcFdRunAnalysisSummaryFieldComparison[];
}

export interface SdlcFdRunAnalysisResult {
  readonly kind: typeof SDLC_FD_RUN_ANALYSIS_KIND;
  readonly version: typeof SDLC_FD_RUN_ANALYSIS_VERSION;
  readonly inspectedRoot: string;
  readonly inspectedKind: SdlcFdRunAnalysisInspectedKind;
  readonly profile: SdlcFdRunAnalysisProfile;
  readonly profilePolicyRef: string;
  readonly thresholdPolicyRef: string;
  readonly policyStatus: SdlcFdRunAnalysisPolicyStatus;
  readonly readOnly: true;
  readonly currentStateTelemetrySummary: SdlcFdRunAnalysisCurrentStateTelemetry;
  readonly edgeTraversal: readonly SdlcFdRunAnalysisEdgeAttempt[];
  readonly activeRunLiveness: SdlcFdRunAnalysisActiveRunLiveness;
  readonly runtimeArtifactGaps: readonly SdlcFdRunAnalysisRuntimeArtifactGap[];
  readonly diagnostics: readonly SdlcFdRunAnalysisDiagnostic[];
  readonly bloatAndSlopeAnalysis: SdlcFdRunAnalysisBloatAndSlope;
  readonly retryForensics: readonly SdlcFdRunAnalysisRetryForensic[];
  readonly conceptualStageCoverage: readonly SdlcFdRunAnalysisConceptualStageCoverage[];
  readonly edgeAccounting: SdlcExecutiveEdgeAccountingAudit;
  readonly traversalHopSelection: SdlcTraversalHopSelection;
  readonly summaryDrift: SdlcFdRunAnalysisSummaryDriftReport;
  readonly evidenceIndex: readonly string[];
}
