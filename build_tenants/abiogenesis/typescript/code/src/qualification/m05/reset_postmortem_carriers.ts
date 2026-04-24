// Implements: REQ-P-QUAL
// Implements: REQ-P-SCENARIOS

import type { InstalledSandboxQualificationPassed } from "./installed_carriers.js";

export type InstalledResetPostmortemCaseName =
  | "active_run_superseded"
  | "open_continuation_abandoned";

export type InstalledResetScope = "workspace" | "work_key" | "edge";

export type InstalledResetPreRunStatus =
  | "active"
  | "blocked"
  | "yielded"
  | "rejected"
  | "converged"
  | "assessed"
  | "not_started";

export interface InstalledResetPostmortemObservation {
  readonly caseName: InstalledResetPostmortemCaseName;
  readonly resetScope: InstalledResetScope;
  readonly resetAccepted: boolean;
  readonly emittedKinds: readonly string[];
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly preResetRunStatus: InstalledResetPreRunStatus;
  readonly assessmentStatus:
    | "fulfilled"
    | "partial"
    | "blocked"
    | "unfulfilled"
    | null;
  readonly manifestId: string | null;
  readonly publishedLedgerRef: string | null;
}

export interface InstalledResetPostmortemRequest {
  readonly installedQualification: InstalledSandboxQualificationPassed;
  readonly observations: readonly InstalledResetPostmortemObservation[];
}

export type InstalledResetPostmortemGapKind =
  | "missing_case"
  | "duplicate_case"
  | "reset_not_accepted"
  | "missing_reset_event"
  | "missing_run_id"
  | "unexpected_pre_reset_status"
  | "unexpected_assessment_status"
  | "missing_manifest_id"
  | "missing_published_ledger_ref";

export interface InstalledResetPostmortemGapRef {
  readonly kind: InstalledResetPostmortemGapKind;
  readonly ref: string;
}

export interface RunSupersededPostmortemRef {
  readonly kind: "run_superseded";
  readonly runId: string;
  readonly supersededBy: string;
  readonly status: "superseded";
}

export interface ContinuationAbandonedPostmortemRef {
  readonly kind: "continuation_abandoned";
  readonly continuationId: string;
  readonly runId: string | null;
  readonly publishedLedgerRef: string;
  readonly status: "abandoned";
}

export interface InstalledResetPostmortemPassed {
  readonly kind: "passed";
  readonly runPostmortem: RunSupersededPostmortemRef;
  readonly continuationPostmortem: ContinuationAbandonedPostmortemRef;
}

export interface InstalledResetPostmortemRejected {
  readonly kind: "rejected";
  readonly reason: string;
  readonly gaps: readonly InstalledResetPostmortemGapRef[];
}

export type InstalledResetPostmortemOutcome =
  | InstalledResetPostmortemPassed
  | InstalledResetPostmortemRejected;
