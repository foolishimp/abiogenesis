// Implements: T-161

import type { OperatorRunCarriers } from "./carrier_loaders.js";
import type { DiagnosticDraft } from "./diagnostics.js";
import type { SdlcFdRunAnalysisLineageScan } from "./requirement_lineage.js";
import type {
  SdlcFdRunAnalysisBloatAndSlope,
  SdlcFdRunAnalysisBloatBucket,
  SdlcFdRunAnalysisByteAccount,
  SdlcFdRunAnalysisEdgeAttempt,
  SdlcFdRunAnalysisThresholds
} from "./types.js";

function divideOrNull(numerator: number, denominator: number): number | null {
  if (denominator <= 0) {
    return null;
  }
  return Math.round((numerator / denominator) * 100) / 100;
}

function duplicateAuthorityCount(values: readonly string[]): number {
  const seen = new Map<string, number>();
  for (const value of values) {
    seen.set(value, (seen.get(value) ?? 0) + 1);
  }
  let duplicates = 0;
  for (const count of seen.values()) {
    if (count > 1) {
      duplicates += count - 1;
    }
  }
  return duplicates;
}

function bucketsFromAttempts(
  carriers: readonly OperatorRunCarriers[],
  attempts: readonly SdlcFdRunAnalysisEdgeAttempt[]
): readonly SdlcFdRunAnalysisBloatBucket[] {
  const out: SdlcFdRunAnalysisBloatBucket[] = [];
  for (let index = 0; index < attempts.length; index += 1) {
    const attempt = attempts[index];
    const carrier = carriers[index];
    if (attempt === undefined || carrier === undefined) {
      continue;
    }
    out.push(Object.freeze({
      edgeIndex: index,
      edgeName: attempt.graphFunctionName ?? "unknown_edge",
      handoffBytes: attempt.handoffBytes,
      eventBytes: attempt.eventBytes,
      stdoutBytes: attempt.stdoutBytes,
      stderrBytes: carrier.fileSizes.workerStderr,
      promptContextBytes: attempt.promptContextBytes,
      sourceAuthorityRefCount: 0
    }));
  }
  return Object.freeze(out);
}

function totalEdgeBytes(buckets: readonly SdlcFdRunAnalysisBloatBucket[]): number {
  let total = 0;
  for (const bucket of buckets) {
    total +=
      bucket.handoffBytes +
      bucket.eventBytes +
      bucket.stdoutBytes +
      bucket.stderrBytes +
      bucket.promptContextBytes;
  }
  return total;
}

export function deriveBloatAndSlope(input: {
  readonly carriers: readonly OperatorRunCarriers[];
  readonly attempts: readonly SdlcFdRunAnalysisEdgeAttempt[];
  readonly archiveBytes: SdlcFdRunAnalysisByteAccount;
  readonly retryCount: number;
  readonly productFileCount: number;
  readonly componentCount: number;
  readonly requirementObligationCount: number;
  readonly lineage: SdlcFdRunAnalysisLineageScan;
  readonly thresholds: SdlcFdRunAnalysisThresholds;
}): {
  readonly bloat: SdlcFdRunAnalysisBloatAndSlope;
  readonly diagnostics: readonly DiagnosticDraft[];
} {
  const buckets = bucketsFromAttempts(input.carriers, input.attempts);
  const diagnostics: DiagnosticDraft[] = [];
  const total = totalEdgeBytes(buckets);
  for (const bucket of buckets) {
    if (bucket.promptContextBytes > input.thresholds.promptContextBytesHigh) {
      diagnostics.push({
        code: "prompt_context_volume_high",
        severity: "warn",
        detail: `edge ${bucket.edgeName} prompt/context bytes ${bucket.promptContextBytes} exceeds ${input.thresholds.promptContextBytesHigh}`,
        edgeName: bucket.edgeName
      });
    }
    if (bucket.handoffBytes > input.thresholds.handoffGrowthHighBytes) {
      diagnostics.push({
        code: "handoff_growth_suspicious",
        severity: "warn",
        detail: `edge ${bucket.edgeName} handoff bytes ${bucket.handoffBytes} exceeds ${input.thresholds.handoffGrowthHighBytes}`,
        edgeName: bucket.edgeName
      });
    }
    if (bucket.eventBytes > input.thresholds.eventSnapshotBytesHigh) {
      diagnostics.push({
        code: "event_snapshot_volume_high",
        severity: "warn",
        detail: `edge ${bucket.edgeName} event bytes ${bucket.eventBytes} exceeds ${input.thresholds.eventSnapshotBytesHigh}`,
        edgeName: bucket.edgeName
      });
    }
  }
  const lineagePerFile = divideOrNull(
    input.lineage.canonicalRequirementIdCount,
    Math.max(1, input.lineage.productFilesScanned)
  );
  if (
    lineagePerFile !== null &&
    input.requirementObligationCount > 0 &&
    lineagePerFile >
      input.requirementObligationCount * input.thresholds.productLineageFanoutSuspiciousRatio
  ) {
    diagnostics.push({
      code: "product_lineage_fanout_suspicious",
      severity: "warn",
      detail: `product lineage per file ${lineagePerFile} exceeds ${input.thresholds.productLineageFanoutSuspiciousRatio}x current obligation count`
    });
  }
  if (
    input.requirementObligationCount > 0 &&
    input.lineage.canonicalRequirementIdCount >
      input.requirementObligationCount * input.thresholds.requirementFanoutSuspiciousRatio
  ) {
    diagnostics.push({
      code: "requirement_fanout_suspicious",
      severity: "warn",
      detail: `canonical requirement count ${input.lineage.canonicalRequirementIdCount} exceeds ${input.thresholds.requirementFanoutSuspiciousRatio}x current obligation count`
    });
  }
  const bloat: SdlcFdRunAnalysisBloatAndSlope = Object.freeze({
    bytesPerRequirementObligation: divideOrNull(total, input.requirementObligationCount),
    bytesPerSourceAuthorityRef: null,
    bytesPerProductFile: divideOrNull(total, input.productFileCount),
    bytesPerComponent: divideOrNull(total, input.componentCount),
    bytesPerEdge: divideOrNull(total, buckets.length),
    bytesPerRetry: divideOrNull(total, input.retryCount),
    lineageRefsPerProductFile: lineagePerFile,
    duplicateRequirementAuthorityCount: duplicateAuthorityCount(
      input.lineage.canonicalRequirementIds
    ),
    rawDisplayIdRequirementCount: input.lineage.rawDisplayIdRequirementCount,
    canonicalRequirementIdCount: input.lineage.canonicalRequirementIdCount,
    transitiveDependencyFanoutRatio: null,
    buckets
  });
  return Object.freeze({
    bloat,
    diagnostics: Object.freeze(diagnostics)
  });
}
