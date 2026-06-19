// Implements: T-161

import type {
  SdlcFdRunAnalysisActiveRunLiveness,
  SdlcFdRunAnalysisBloatAndSlope,
  SdlcFdRunAnalysisConceptualStageCoverage,
  SdlcFdRunAnalysisCurrentStateTelemetry,
  SdlcFdRunAnalysisDiagnostic,
  SdlcFdRunAnalysisEdgeAttempt,
  SdlcFdRunAnalysisResult,
  SdlcFdRunAnalysisRetryForensic,
  SdlcFdRunAnalysisRuntimeArtifactGap,
  SdlcFdRunAnalysisSummaryDriftReport
} from "./types.js";
import type { SdlcTraversalHopSelection } from "../operator/carriers.js";
import {
  sdlcExecutiveEdgeAccountingRowFor,
  type SdlcExecutiveEdgeAccountingAudit
} from "../graph/edge_accounting.js";

const DEFAULT_MARKDOWN_ROW_LIMIT = 60;

function formatBytes(value: number | null): string {
  if (value === null) {
    return "n/a";
  }
  if (value < 1024) {
    return `${value}B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)}KiB`;
  }
  return `${(value / (1024 * 1024)).toFixed(2)}MiB`;
}

function formatMs(value: number | null): string {
  if (value === null) {
    return "n/a";
  }
  if (value < 1000) {
    return `${value}ms`;
  }
  return `${(value / 1000).toFixed(1)}s`;
}

function boundedRows<T>(
  rows: readonly T[],
  limit: number = DEFAULT_MARKDOWN_ROW_LIMIT
): {
  readonly rows: readonly T[];
  readonly omitted: number;
  readonly headCount: number;
  readonly tailCount: number;
} {
  if (rows.length <= limit) {
    return Object.freeze({
      rows,
      omitted: 0,
      headCount: rows.length,
      tailCount: 0
    });
  }
  const headCount = Math.floor(limit / 2);
  const tailCount = limit - headCount;
  return Object.freeze({
    rows: Object.freeze([
      ...rows.slice(0, headCount),
      ...rows.slice(rows.length - tailCount)
    ]),
    omitted: rows.length - limit,
    headCount,
    tailCount
  });
}

function boundedRowsLine(
  label: string,
  bounded: ReturnType<typeof boundedRows>
): string | null {
  if (bounded.omitted === 0) {
    return null;
  }
  return `${label}: showing first ${bounded.headCount} and last ${bounded.tailCount}; omitted ${bounded.omitted}.`;
}

function boundedJoinedText(values: readonly string[], separator: string): string {
  if (values.length === 0) {
    return "none";
  }
  const bounded = boundedRows(values, 30);
  const text = bounded.rows.join(separator);
  if (bounded.omitted === 0) {
    return text;
  }
  return `${text} (${bounded.omitted} omitted)`;
}

function renderTelemetry(telemetry: SdlcFdRunAnalysisCurrentStateTelemetry): string {
  const lines: string[] = [
    "## Current State Telemetry",
    "",
    `- inspected root: \`${telemetry.inspectedRoot}\``,
    `- inspected kind: ${telemetry.inspectedKind}`,
    `- scenario: ${telemetry.scenarioName ?? "n/a"}`,
    `- profile: ${telemetry.profile}`,
    `- operator-run count: ${telemetry.operatorRunCount}`,
    `- graph edge sequence: ${boundedJoinedText(telemetry.graphEdgeSequence, " -> ")}`,
    `- same-edge retries: ${telemetry.sameEdgeRetryCount}`,
    `- repair attempts: ${telemetry.repairAttemptCount}`,
    `- blocked attempts: ${telemetry.blockedAttemptCount}`,
    `- yielded attempts: ${telemetry.yieldedAttemptCount}`,
    `- aborted attempts: ${telemetry.abortedAttemptCount}`,
    `- final closure: ${telemetry.finalClosureDisposition ?? "n/a"}`,
    `- total wall-clock: ${formatMs(telemetry.totalWallClockMs)}`,
    `- summed worker elapsed: ${formatMs(telemetry.totalWorkerElapsedMs)}`,
    `- unattributed elapsed: ${formatMs(telemetry.unattributedElapsedMs)}`,
    `- archive bytes: ${formatBytes(telemetry.archiveBytes.totalBytes)}`,
    `- runtime/event bytes: ${formatBytes(telemetry.archiveBytes.runtimeEventBytes + telemetry.archiveBytes.workerProcessEventBytes)}`,
    `- stdout/stderr bytes: ${formatBytes(telemetry.archiveBytes.stdoutBytes + telemetry.archiveBytes.stderrBytes)}`,
    `- prompt/context bytes: ${formatBytes(telemetry.archiveBytes.promptContextBytes)}`,
    `- product files: ${telemetry.productFileCount}`,
    `- requirement obligations: ${telemetry.requirementObligationCount}`,
    `- product lineage refs: ${telemetry.productFileLineageCount}`
  ];
  return lines.join("\n");
}

function renderEdgeTraversal(attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]): string {
  const bounded = boundedRows(attempts);
  const lines: string[] = [
    "## Edge Traversal",
    "",
    "| # | edge | target | class | worker_ms | edge_ms | det_ms | pf | exec | exec_source | pressure | closure | retry | blocking | files | obligations | lineage |",
    "| - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |"
  ];
  const limitLine = boundedRowsLine("bounded projection", bounded);
  if (limitLine !== null) {
    lines.push(limitLine);
  }
  for (const attempt of bounded.rows) {
    lines.push(
      `| ${attempt.attemptOrdinal} | ${attempt.graphVectorRef ?? attempt.graphFunctionName ?? "n/a"} | ${attempt.targetAssetType ?? "n/a"} | ${attempt.traversalClass} | ${formatMs(attempt.workerElapsedMs)} | ${formatMs(attempt.edgeWindowElapsedMs)} | ${formatMs(attempt.deterministicElapsedMs)} | ${attempt.postflightStatus ?? "n/a"} | ${attempt.executionEvidenceStatus ?? "-"} | ${attempt.executionEvidenceSource} | ${attempt.residualPressureTransition}:${attempt.residualPressureRefCount} | ${attempt.closureDisposition ?? "n/a"} | ${attempt.predecessorAttemptRef === null ? "-" : "yes"} | ${attempt.blockingReasonCodes.join(",") || "-"} | ${attempt.productFilesWritten.length + attempt.productFilesReplayed.length} | ${attempt.requirementObligationCount ?? "n/a"} | ${attempt.productLineageCount} |`
    );
  }
  return lines.join("\n");
}

function renderPromptAndEvidence(attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]): string {
  if (attempts.length === 0) {
    return "## Prompt And Evidence Sources\n\nnone";
  }
  const bounded = boundedRows(attempts);
  const lines: string[] = [
    "## Prompt And Evidence Sources",
    "",
    "| # | edge | construction brief | brief digest | rendered prompt | prompt policy | execution | command | reports | shards | counts |",
    "| - | - | - | - | - | - | - | - | - | - | - |"
  ];
  const limitLine = boundedRowsLine("bounded projection", bounded);
  if (limitLine !== null) {
    lines.push(limitLine);
  }
  for (const attempt of bounded.rows) {
    const counts = [
      attempt.executionEvidenceTestsObserved ?? "n/a",
      attempt.executionEvidencePassedCount ?? "n/a",
      attempt.executionEvidenceFailedCount ?? "n/a"
    ].join("/");
    lines.push(
      `| ${attempt.attemptOrdinal} | ${attempt.graphVectorRef ?? attempt.graphFunctionName ?? "n/a"} | ${attempt.promptSourceCarrierRef ?? "-"} | ${attempt.promptSourceCarrierDigest ?? "-"} | ${attempt.promptRenderingRef ?? "-"} | ${attempt.promptSourcePolicyRef ?? "-"} | ${attempt.executionEvidenceSource}:${attempt.executionEvidenceStatus ?? "-"} | ${attempt.executionEvidenceCommand ?? "-"} | ${attempt.executionEvidenceReportCount} | ${attempt.executionEvidenceShardCount} | ${counts} |`
    );
  }
  return lines.join("\n");
}

function renderFrontierGraphTruth(
  attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]
): string {
  const frontierAttempts = attempts.filter(
    (attempt) => attempt.frontierSummary !== null
  );
  if (frontierAttempts.length === 0) {
    return "## Frontier Graph Truth\n\nnone";
  }
  const bounded = boundedRows(frontierAttempts);
  const lines: string[] = [
    "## Frontier Graph Truth",
    "",
    "| # | dag | truth | selected | start | ready | batches | branches | fan-in | workers | conflicts |",
    "| - | - | - | - | - | - | - | - | - | - | - |"
  ];
  const limitLine = boundedRowsLine("bounded projection", bounded);
  if (limitLine !== null) {
    lines.push(limitLine);
  }
  for (const attempt of bounded.rows) {
    const frontier = attempt.frontierSummary;
    if (frontier === null) {
      continue;
    }
    const workers = frontier.branchRows.map((row) => row.workerProcessRef);
    const conflicts = [
      ...frontier.writeTerritoryConflictRefs,
      ...frontier.outputAllocationConflictRefs
    ];
    lines.push(
      `| ${attempt.attemptOrdinal} | ${frontier.dagRef} | ${frontier.graphTruthSource} | ${frontier.selectedMethod} | ${frontier.startNodes.length} | ${frontier.compiledReadyBranchRefs.length}/${frontier.readyBranchRefs.length} | ${frontier.batchSizes.join("+") || "0"} | ${frontier.devLaneCount} dev / ${frontier.testLaneCount} test | ${frontier.fanInRows.length} | ${boundedJoinedText(workers, "<br>")} | ${boundedJoinedText(conflicts, "<br>")} |`
    );
  }
  return lines.join("\n");
}

function renderStagedComputeTruth(
  attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]
): string {
  if (attempts.length === 0) {
    return "## Staged Compute Truth\n\nnone";
  }
  const bounded = boundedRows(attempts);
  const lines: string[] = [
    "## Staged Compute Truth",
    "",
    "| # | status | composition | regime binding | evaluate | admitted graph call | consequence | read models | detail |",
    "| - | - | - | - | - | - | - | - | - |"
  ];
  const limitLine = boundedRowsLine("bounded projection", bounded);
  if (limitLine !== null) {
    lines.push(limitLine);
  }
  for (const attempt of bounded.rows) {
    const truth = attempt.stagedComputeTruth;
    lines.push(
      `| ${attempt.attemptOrdinal} | ${truth.status} | ${truth.selectedCompositionRef ?? "-"} | ${truth.selectedRegimeBindingRef ?? "-"} | ${truth.evaluateRef ?? "-"} | ${truth.admittedStateGraphCallRef ?? "-"} | ${truth.consequenceRef ?? "-"} | ${boundedJoinedText(truth.domainReadModelRefs, "<br>") || "-"} | ${truth.detail ?? "-"} |`
    );
  }
  return lines.join("\n");
}

function renderConceptualStageCoverage(
  coverage: readonly SdlcFdRunAnalysisConceptualStageCoverage[]
): string {
  if (coverage.length === 0) {
    return "## Conceptual Stage Coverage\n\nnone";
  }
  const lines: string[] = [
    "## Conceptual Stage Coverage",
    "",
    "| conceptual stage | expected edge | expected target | mapped edge | mapped target | class | runs |",
    "| - | - | - | - | - | - | - |"
  ];
  for (const row of coverage) {
    lines.push(
      `| ${row.conceptualStageRef} | ${row.expectedEdgeName} | ${row.expectedTargetAssetType} | ${row.mappedEdgeName ?? "-"} | ${row.mappedTargetAssetType ?? "-"} | ${row.stageClass} | ${row.operatorRunRefs.length} |`
    );
  }
  return lines.join("\n");
}

function renderEdgeAccounting(
  accounting: SdlcExecutiveEdgeAccountingAudit
): string {
  const blockingEdgeNames = [
    ...new Set([
      ...accounting.missingEdgeNames,
      ...accounting.extraEdgeNames,
      ...accounting.workerDispatchViolationEdgeNames,
      ...accounting.observedWorkerDispatchViolationEdgeNames,
      ...accounting.closeCapableWithoutEvidenceEdgeNames
    ])
  ].sort();
  const lines: string[] = [
    "## Edge Accounting",
    "",
    `- admission: ${accounting.admissionDecision}`,
    `- selected edges: ${accounting.selectedEdgeNames.length}`,
    `- missing rows: ${accounting.missingEdgeNames.length}`,
    `- extra rows: ${accounting.extraEdgeNames.length}`,
    `- projection/no-close edges: ${accounting.projectionNoCloseEdgeNames.join(", ") || "none"}`,
    `- conditional edges: ${accounting.conditionalEdgeNames.join(", ") || "none"}`,
    `- merge-required edges: ${accounting.mergeRequiredEdgeNames.join(", ") || "none"}`,
    `- replace-required edges: ${accounting.replaceRequiredEdgeNames.join(", ") || "none"}`,
    `- delete-required edges: ${accounting.deleteRequiredEdgeNames.join(", ") || "none"}`,
    `- observed no-dispatch worker runs: ${accounting.observedWorkerDispatchViolationEdgeNames.join(", ") || "none"}`,
    `- blocking reasons: ${accounting.blockingReasons.join(", ") || "none"}`
  ];
  if (accounting.admissionDecision === "reject" && blockingEdgeNames.length > 0) {
    lines.push(
      "",
      "| blocking edge | disposition | worker dispatch | rationale | reasons |",
      "| - | - | - | - | - |"
    );
    for (const edgeName of blockingEdgeNames) {
      const row = sdlcExecutiveEdgeAccountingRowFor(edgeName);
      const reasons = accounting.blockingReasons.filter((reason) =>
        reason.endsWith(`:${edgeName}`)
      );
      lines.push(
        `| ${edgeName} | ${row?.disposition ?? "missing"} | ${row === null ? "unknown" : String(row.workerDispatchAllowed)} | ${row?.rationale ?? "no accounting row"} | ${reasons.join(", ") || "-"} |`
      );
    }
  }
  return lines.join("\n");
}

function renderTraversalSelection(selection: SdlcTraversalHopSelection): string {
  const lines: string[] = [
    "## Traversal Selection",
    "",
    `- outcome class: ${selection.outcomeClass}`,
    `- hop class: ${selection.hopClass}`,
    `- graph variant: ${selection.selectedGraphVariantRef}`,
    `- zoom disposition: ${selection.zoomAdmission.disposition}`,
    `- pressure preservation: ${selection.pressurePreservation.mechanism}`,
    `- rejected alternatives: ${selection.rejectedAlternativeRefs.join(", ") || "none"}`,
    `- blocking reasons: ${selection.blockingReasons.join(", ") || "none"}`
  ];
  return lines.join("\n");
}

function renderLiveness(liveness: SdlcFdRunAnalysisActiveRunLiveness): string {
  const lines: string[] = [
    "## Active-Run Liveness",
    "",
    `- active operator-run: \`${liveness.activeOperatorRunRef ?? "n/a"}\``,
    `- active edge: ${liveness.activeEdgeRef ?? "n/a"}`,
    `- active vector: ${liveness.activeGraphVectorRef ?? "n/a"}`,
    `- active target asset: ${liveness.activeTargetAssetType ?? "n/a"}`,
    `- worker pid: ${liveness.workerPid ?? "n/a"}`,
    `- process alive: ${liveness.processAlive === null ? "unknown" : String(liveness.processAlive)}`,
    `- last event at: ${liveness.lastEventAtMs ?? "n/a"}`,
    `- last stdout at: ${liveness.lastStdoutAtMs ?? "n/a"}`,
    `- last heartbeat at: ${liveness.lastHeartbeatAtMs ?? "n/a"}`,
    `- heartbeat age: ${formatMs(liveness.heartbeatAgeMs)}`,
    `- max no-output gap: ${formatMs(liveness.maxNoOutputGapMs)}`,
    `- archive growth: ${liveness.archiveGrowthBytesPerMinute === null ? "n/a" : `${formatBytes(liveness.archiveGrowthBytesPerMinute)}/min`}`,
    `- productive signal: ${liveness.productiveSignal}`,
    `- last blocking reason: ${liveness.lastBlockingReason?.code ?? "none"}`
  ];
  return lines.join("\n");
}

function renderRuntimeArtifactGaps(gaps: readonly SdlcFdRunAnalysisRuntimeArtifactGap[]): string {
  if (gaps.length === 0) {
    return "## Runtime Artifact Gaps\n\nnone";
  }
  const bounded = boundedRows(gaps);
  const lines: string[] = [
    "## Runtime Artifact Gaps",
    "",
    "| operator-run | artifact | status | detail |",
    "| - | - | - | - |"
  ];
  const limitLine = boundedRowsLine("bounded projection", bounded);
  if (limitLine !== null) {
    lines.push(limitLine);
  }
  for (const gap of bounded.rows) {
    lines.push(`| ${gap.operatorRunRef} | ${gap.artifact} | ${gap.status} | ${gap.detail ?? "-"} |`);
  }
  return lines.join("\n");
}

function renderDiagnostics(diagnostics: readonly SdlcFdRunAnalysisDiagnostic[]): string {
  if (diagnostics.length === 0) {
    return "## Diagnostics\n\nnone";
  }
  const bounded = boundedRows(diagnostics);
  const lines: string[] = [
    "## Diagnostics",
    "",
    "| code | severity | edge | detail |",
    "| - | - | - | - |"
  ];
  const limitLine = boundedRowsLine("bounded projection", bounded);
  if (limitLine !== null) {
    lines.push(limitLine);
  }
  for (const diagnostic of bounded.rows) {
    lines.push(`| ${diagnostic.code} | ${diagnostic.severity} | ${diagnostic.edgeName ?? "-"} | ${diagnostic.detail} |`);
  }
  return lines.join("\n");
}

function renderBloatAndSlope(bloat: SdlcFdRunAnalysisBloatAndSlope): string {
  const bounded = boundedRows(bloat.buckets);
  const lines: string[] = [
    "## Bloat And Slope",
    "",
    `- bytes/obligation: ${bloat.bytesPerRequirementObligation ?? "n/a"}`,
    `- bytes/product file: ${bloat.bytesPerProductFile ?? "n/a"}`,
    `- bytes/edge: ${bloat.bytesPerEdge ?? "n/a"}`,
    `- bytes/retry: ${bloat.bytesPerRetry ?? "n/a"}`,
    `- lineage refs/product file: ${bloat.lineageRefsPerProductFile ?? "n/a"}`,
    `- duplicate authority count: ${bloat.duplicateRequirementAuthorityCount}`,
    `- raw display-id requirement count: ${bloat.rawDisplayIdRequirementCount}`,
    `- canonical requirement id count: ${bloat.canonicalRequirementIdCount}`,
    "",
    "| # | edge | handoff | events | stdout | prompt/ctx |",
    "| - | - | - | - | - | - |"
  ];
  const limitLine = boundedRowsLine("bounded projection", bounded);
  if (limitLine !== null) {
    lines.push(limitLine);
  }
  for (const bucket of bounded.rows) {
    lines.push(
      `| ${bucket.edgeIndex} | ${bucket.edgeName} | ${formatBytes(bucket.handoffBytes)} | ${formatBytes(bucket.eventBytes)} | ${formatBytes(bucket.stdoutBytes)} | ${formatBytes(bucket.promptContextBytes)} |`
    );
  }
  return lines.join("\n");
}

function renderRetryForensics(forensics: readonly SdlcFdRunAnalysisRetryForensic[]): string {
  if (forensics.length === 0) {
    return "## Retry Forensics\n\nnone";
  }
  const bounded = boundedRows(forensics);
  const lines: string[] = [
    "## Retry Forensics",
    "",
    "| edge | attempt | predecessor | worker_s | blocking | lineage | outside_reads | schema_violations | cause |",
    "| - | - | - | - | - | - | - | - | - |"
  ];
  const limitLine = boundedRowsLine("bounded projection", bounded);
  if (limitLine !== null) {
    lines.push(limitLine);
  }
  for (const forensic of bounded.rows) {
    lines.push(
      `| ${forensic.edgeName} | ${forensic.attemptRef} | ${forensic.predecessorAttemptRef ?? "-"} | ${forensic.workerSecondsBefore ?? "n/a"} | ${forensic.blockingReasonCodes.join(",") || "-"} | ${forensic.lineageStatus} | ${forensic.outsideWorkspaceReadCount} | ${forensic.schemaViolationCount} | ${forensic.likelyCauseClass} |`
    );
  }
  return lines.join("\n");
}

function renderSummaryDrift(report: SdlcFdRunAnalysisSummaryDriftReport): string {
  if (!report.summaryPresent) {
    return "## Summary Drift\n\nno summary file present";
  }
  if (report.drifts.length === 0) {
    return "## Summary Drift\n\nsummary present, all fields agree with recomputed values";
  }
  const lines: string[] = [
    "## Summary Drift",
    "",
    "| field | summary | recomputed | source carrier |",
    "| - | - | - | - |"
  ];
  for (const drift of report.drifts) {
    lines.push(
      `| ${drift.field} | ${String(drift.summaryValue)} | ${String(drift.recomputedValue)} | ${drift.sourceCarrierRef ?? "-"} |`
    );
  }
  return lines.join("\n");
}

export function renderSdlcFdRunAnalysisMarkdown(result: SdlcFdRunAnalysisResult): string {
  const sections: string[] = [
    `# F_D Run Analysis (${result.profile})`,
    "",
    `- profile policy: ${result.profilePolicyRef}`,
    `- threshold policy: ${result.thresholdPolicyRef}`,
    `- policy status: ${result.policyStatus}`,
    `- read-only: ${result.readOnly}`,
    "",
    renderTelemetry(result.currentStateTelemetrySummary),
    "",
    renderEdgeTraversal(result.edgeTraversal),
    "",
    renderPromptAndEvidence(result.edgeTraversal),
    "",
    renderFrontierGraphTruth(result.edgeTraversal),
    "",
    renderStagedComputeTruth(result.edgeTraversal),
    "",
    renderConceptualStageCoverage(result.conceptualStageCoverage),
    "",
    renderEdgeAccounting(result.edgeAccounting),
    "",
    renderTraversalSelection(result.traversalHopSelection),
    "",
    renderLiveness(result.activeRunLiveness),
    "",
    renderRuntimeArtifactGaps(result.runtimeArtifactGaps),
    "",
    renderDiagnostics(result.diagnostics),
    "",
    renderBloatAndSlope(result.bloatAndSlopeAnalysis),
    "",
    renderRetryForensics(result.retryForensics),
    "",
    renderSummaryDrift(result.summaryDrift),
    ""
  ];
  return sections.join("\n");
}
