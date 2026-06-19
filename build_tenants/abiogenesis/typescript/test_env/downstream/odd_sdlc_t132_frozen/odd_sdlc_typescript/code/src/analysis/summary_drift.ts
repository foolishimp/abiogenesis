// Implements: T-161

import path from "node:path";

import { fileRef } from "./archive_reader.js";
import type { OperatorRunCarriers } from "./carrier_loaders.js";
import type { DiagnosticDraft } from "./diagnostics.js";
import type {
  SdlcFdRunAnalysisEdgeAttempt,
  SdlcFdRunAnalysisSummaryDriftReport,
  SdlcFdRunAnalysisSummaryFieldComparison
} from "./types.js";

const TOLERANCE_MS = 10;
const TOLERANCE_BYTES = 0;

function compareNumberField(input: {
  readonly field: string;
  readonly summaryValue: unknown;
  readonly recomputedValue: number | null;
  readonly tolerance: number;
  readonly sourceCarrierRef: string | null;
}): SdlcFdRunAnalysisSummaryFieldComparison {
  const summaryNumber =
    typeof input.summaryValue === "number" && Number.isFinite(input.summaryValue)
      ? input.summaryValue
      : null;
  const recomputed = input.recomputedValue;
  if (summaryNumber === null || recomputed === null) {
    return Object.freeze({
      field: input.field,
      summaryValue: summaryNumber,
      recomputedValue: recomputed,
      agrees: summaryNumber === null && recomputed === null,
      sourceCarrierRef: input.sourceCarrierRef
    });
  }
  return Object.freeze({
    field: input.field,
    summaryValue: summaryNumber,
    recomputedValue: recomputed,
    agrees: Math.abs(summaryNumber - recomputed) <= input.tolerance,
    sourceCarrierRef: input.sourceCarrierRef
  });
}

function compareStringField(input: {
  readonly field: string;
  readonly summaryValue: unknown;
  readonly recomputedValue: string | null;
  readonly sourceCarrierRef: string | null;
}): SdlcFdRunAnalysisSummaryFieldComparison {
  const summaryString = typeof input.summaryValue === "string" ? input.summaryValue : null;
  return Object.freeze({
    field: input.field,
    summaryValue: summaryString,
    recomputedValue: input.recomputedValue,
    agrees: summaryString === input.recomputedValue,
    sourceCarrierRef: input.sourceCarrierRef
  });
}

function summaryNumberField(
  record: Readonly<Record<string, unknown>> | null,
  key: string
): unknown {
  if (record === null) {
    return null;
  }
  return record[key];
}

function summaryStringField(
  record: Readonly<Record<string, unknown>> | null,
  key: string
): unknown {
  if (record === null) {
    return null;
  }
  return record[key];
}

export function deriveSummaryDrift(input: {
  readonly carriers: readonly OperatorRunCarriers[];
  readonly attempts: readonly SdlcFdRunAnalysisEdgeAttempt[];
}): {
  readonly report: SdlcFdRunAnalysisSummaryDriftReport;
  readonly diagnostics: readonly DiagnosticDraft[];
} {
  let summaryPresent = false;
  let summaryRef: string | null = null;
  const comparisons: SdlcFdRunAnalysisSummaryFieldComparison[] = [];
  const drifts: SdlcFdRunAnalysisSummaryFieldComparison[] = [];
  const diagnostics: DiagnosticDraft[] = [];
  for (let index = 0; index < input.carriers.length; index += 1) {
    const carriers = input.carriers[index];
    const attempt = input.attempts[index];
    if (carriers === undefined || attempt === undefined) {
      continue;
    }
    if (carriers.edgePerformanceSummary.status !== "present") {
      continue;
    }
    summaryPresent = true;
    summaryRef = fileRef(path.join(carriers.operatorRunRoot, "edge_performance_summary.json"));
    const fields: Readonly<Record<string, unknown>> =
      carriers.edgePerformanceSummary.data.fields ?? {};
    const workerElapsedComparison = compareNumberField({
      field: "workerElapsedMs",
      summaryValue: summaryNumberField(fields, "workerElapsedMs"),
      recomputedValue: attempt.workerElapsedMs,
      tolerance: TOLERANCE_MS,
      sourceCarrierRef: fileRef(path.join(carriers.operatorRunRoot, "worker_run.json"))
    });
    comparisons.push(workerElapsedComparison);
    if (!workerElapsedComparison.agrees) {
      drifts.push(workerElapsedComparison);
    }
    const postflightStatusComparison = compareStringField({
      field: "postflightStatus",
      summaryValue: summaryStringField(fields, "postflightStatus"),
      recomputedValue: attempt.postflightStatus,
      sourceCarrierRef: fileRef(path.join(carriers.operatorRunRoot, "postflight.json"))
    });
    comparisons.push(postflightStatusComparison);
    if (!postflightStatusComparison.agrees) {
      drifts.push(postflightStatusComparison);
    }
    const closureComparison = compareStringField({
      field: "closureDisposition",
      summaryValue: summaryStringField(fields, "closureDisposition"),
      recomputedValue: attempt.closureDisposition,
      sourceCarrierRef: fileRef(
        path.join(carriers.operatorRunRoot, "sdlc_edge_closure_decision.json")
      )
    });
    comparisons.push(closureComparison);
    if (!closureComparison.agrees) {
      drifts.push(closureComparison);
    }
    const stdoutBytesComparison = compareNumberField({
      field: "stdoutBytes",
      summaryValue: summaryNumberField(fields, "stdoutBytes"),
      recomputedValue: attempt.stdoutBytes,
      tolerance: TOLERANCE_BYTES,
      sourceCarrierRef: fileRef(path.join(carriers.operatorRunRoot, "worker_stdout.log"))
    });
    comparisons.push(stdoutBytesComparison);
    if (!stdoutBytesComparison.agrees) {
      drifts.push(stdoutBytesComparison);
    }
    const handoffBytesComparison = compareNumberField({
      field: "handoffBytes",
      summaryValue: summaryNumberField(fields, "handoffBytes"),
      recomputedValue: attempt.handoffBytes,
      tolerance: TOLERANCE_BYTES,
      sourceCarrierRef: fileRef(path.join(carriers.operatorRunRoot, "handoff_manifest.json"))
    });
    comparisons.push(handoffBytesComparison);
    if (!handoffBytesComparison.agrees) {
      drifts.push(handoffBytesComparison);
    }
    const summaryBlockingReasons = summaryNumberField(fields, "blockingReasonCount");
    const blockingReasonCountComparison = compareNumberField({
      field: "blockingReasonCount",
      summaryValue: summaryBlockingReasons,
      recomputedValue: attempt.blockingReasonCodes.length,
      tolerance: 0,
      sourceCarrierRef: fileRef(path.join(carriers.operatorRunRoot, "postflight.json"))
    });
    comparisons.push(blockingReasonCountComparison);
    if (!blockingReasonCountComparison.agrees) {
      drifts.push(blockingReasonCountComparison);
    }
  }
  for (const drift of drifts) {
    const evidenceRefs: readonly string[] =
      drift.sourceCarrierRef === null
        ? Object.freeze([])
        : Object.freeze([drift.sourceCarrierRef]);
    diagnostics.push({
      code: "summary_source_drift",
      severity: "warn",
      detail: `summary field ${drift.field} disagrees with recomputed value (summary=${String(drift.summaryValue)} recomputed=${String(drift.recomputedValue)})`,
      evidenceRefs
    });
  }
  return Object.freeze({
    report: Object.freeze({
      summaryPresent,
      summaryRef,
      comparisons: Object.freeze(comparisons),
      drifts: Object.freeze(drifts)
    }),
    diagnostics: Object.freeze(diagnostics)
  });
}
