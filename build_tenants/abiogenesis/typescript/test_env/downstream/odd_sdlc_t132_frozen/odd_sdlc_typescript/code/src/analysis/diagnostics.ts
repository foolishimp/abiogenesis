// Implements: T-161

import type {
  SdlcFdRunAnalysisDiagnostic,
  SdlcFdRunAnalysisDiagnosticCode,
  SdlcFdRunAnalysisDiagnosticSeverity,
  SdlcFdRunAnalysisPolicyStatus
} from "./types.js";

export interface DiagnosticDraft {
  readonly code: SdlcFdRunAnalysisDiagnosticCode;
  readonly severity: SdlcFdRunAnalysisDiagnosticSeverity;
  readonly detail: string;
  readonly evidenceRefs?: readonly string[];
  readonly operatorRunRef?: string | null;
  readonly edgeName?: string | null;
  readonly policyRef?: string | null;
}

const POLICY_GATED_CODES: ReadonlySet<SdlcFdRunAnalysisDiagnosticCode> = new Set<SdlcFdRunAnalysisDiagnosticCode>([
  "prompt_context_volume_high",
  "handoff_growth_suspicious",
  "event_snapshot_volume_high",
  "requirement_fanout_suspicious",
  "product_lineage_fanout_suspicious",
  "unattributed_time_high",
  "active_run_stalled_no_io",
  "active_run_stalled_with_io",
  "worker_heartbeat_age_high",
  "archive_growth_zero_during_active_edge"
]);

function isPolicyGatedCode(code: SdlcFdRunAnalysisDiagnosticCode): boolean {
  return POLICY_GATED_CODES.has(code);
}

export function buildDiagnostic(
  draft: DiagnosticDraft,
  policyStatus: SdlcFdRunAnalysisPolicyStatus
): SdlcFdRunAnalysisDiagnostic {
  const downgrade =
    policyStatus === "informational" && isPolicyGatedCode(draft.code);
  return Object.freeze({
    kind: "sdlc_fd_run_analysis_diagnostic" as const,
    code: draft.code,
    severity: downgrade ? ("info" as const) : draft.severity,
    detail: draft.detail,
    evidenceRefs: Object.freeze([...(draft.evidenceRefs ?? [])]),
    operatorRunRef: draft.operatorRunRef ?? null,
    edgeName: draft.edgeName ?? null,
    policyRef: draft.policyRef ?? null
  });
}

export function buildDiagnostics(
  drafts: readonly DiagnosticDraft[],
  policyStatus: SdlcFdRunAnalysisPolicyStatus
): readonly SdlcFdRunAnalysisDiagnostic[] {
  return Object.freeze(
    drafts.map((draft) => buildDiagnostic(draft, policyStatus))
  );
}
