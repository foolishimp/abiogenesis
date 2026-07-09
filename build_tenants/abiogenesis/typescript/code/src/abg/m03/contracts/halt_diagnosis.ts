// Implements: REQ-R-ABG3-WITNESS-001 — a typed halt-diagnosis projection
// for any halted (gap-stopped) run: the implicated frontier, rejection
// and failure evidence refs, and attempt history — replay-derived, no
// private diagnostic state. This is the observer's first sense organ:
// the T-032 monitor rebuilt this by hand from events.jsonl every halt.
// WITNESS-014 disposition: derived read-model truth, never event
// authority. INPUT CONTRACT (self-review SR-5): assumes basis-scoped
// replay. VERIFIER NOTE (SR-8): an intake's haltDiagnosisRef is bound by
// the route, not recomputable by stateless admission — verifiers
// re-derive this projection over the same replay and compare refs.

import type { RuntimeEvent } from "./carriers.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";

export interface HaltAttemptRow {
  readonly kind: "halt_attempt_row";
  readonly rowKind: "opened" | "stopped" | "escalated" | "progress";
  readonly edge: string;
  readonly vectorIndex: number;
  readonly retryRunId: string | null;
  readonly reason: string | null;
  readonly observedAttemptCount: number | null;
  readonly maxAttempts: number | null;
  readonly stationary: boolean | null;
}

export interface HaltFailureRow {
  readonly kind: "halt_failure_row";
  readonly surface: string;
  readonly failureClass: string;
  readonly message: string;
}

export interface HaltRejectionRow {
  readonly kind: "halt_rejection_row";
  readonly edge: string;
  readonly vectorIndex: number;
  readonly payloadRef: string;
  readonly rejectionClass: string;
  readonly reason: string;
}

export interface HaltDiagnosisProjection {
  readonly kind: "halt_diagnosis_projection";
  readonly diagnosisRef: string;
  readonly halted: boolean;
  readonly basisId: string | null;
  readonly haltReason: string | null;
  readonly implicatedEdges: readonly string[];
  readonly attemptRows: readonly HaltAttemptRow[];
  readonly failureRows: readonly HaltFailureRow[];
  readonly rejectionRows: readonly HaltRejectionRow[];
  readonly rejectionEvidenceRefs: readonly string[];
  readonly reentryPlanRefs: readonly string[];
  readonly latestSegmentRef: string | null;
}

function codepointCompare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function eventAdmissionOrdinalOf(event: RuntimeEvent): number | null {
  if (
    "eventAdmissionOrdinal" in event &&
    typeof event.eventAdmissionOrdinal === "number" &&
    Number.isSafeInteger(event.eventAdmissionOrdinal) &&
    event.eventAdmissionOrdinal >= 0
  ) {
    return event.eventAdmissionOrdinal;
  }
  return null;
}

// S4 review P1: the DECISIVE terminal (and the latest segment stamp) are
// chosen by admission-ordinal truth, never caller array order. With one
// candidate no order question exists; with several, any unorderable
// candidate fails closed.
function decisiveByOrdinal<T extends RuntimeEvent>(
  candidates: readonly T[],
  label: string
): T | null {
  if (candidates.length === 0) {
    return null;
  }
  const first = candidates[0];
  if (candidates.length === 1 && first !== undefined) {
    return first;
  }
  let decisive: { event: T; ordinal: number } | null = null;
  for (const event of candidates) {
    const ordinal = eventAdmissionOrdinalOf(event);
    if (ordinal === null) {
      throw new TypeError(
        `Halt diagnosis requires admission ordinals to order multiple ${label} events`
      );
    }
    if (decisive === null || ordinal > decisive.ordinal) {
      decisive = { event, ordinal };
    }
  }
  return decisive === null ? null : decisive.event;
}

export function deriveHaltDiagnosis(
  events: readonly RuntimeEvent[]
): HaltDiagnosisProjection {
  const terminalEvents: Extract<RuntimeEvent, { readonly kind: "terminal_reached" }>[] = [];
  const segmentStamps: Extract<RuntimeEvent, { readonly kind: "run_segment_opened" }>[] = [];
  const attemptRows: HaltAttemptRow[] = [];
  const failureRows: HaltFailureRow[] = [];
  const rejectionRows: HaltRejectionRow[] = [];
  const reentryPlanRefs: string[] = [];
  const rejectionEvidenceRefs = new Set<string>();

  for (const event of events) {
    switch (event.kind) {
      case "terminal_reached":
        terminalEvents.push(event);
        break;
      case "run_segment_opened":
        segmentStamps.push(event);
        break;
      case "retry_attempt_opened":
        attemptRows.push(Object.freeze({
          kind: "halt_attempt_row",
          rowKind: "opened",
          edge: event.edge,
          vectorIndex: event.vectorIndex,
          retryRunId: event.retryRunId,
          reason: null,
          observedAttemptCount: null,
          maxAttempts: null,
          stationary: null
        }));
        break;
      case "retry_attempt_stopped":
        attemptRows.push(Object.freeze({
          kind: "halt_attempt_row",
          rowKind: "stopped",
          edge: event.edge,
          vectorIndex: event.vectorIndex,
          retryRunId: null,
          reason: event.reason,
          observedAttemptCount: event.observedAttemptCount,
          maxAttempts: event.maxAttempts,
          stationary: null
        }));
        break;
      case "retry_attempt_escalated":
        attemptRows.push(Object.freeze({
          kind: "halt_attempt_row",
          rowKind: "escalated",
          edge: event.edge,
          vectorIndex: event.vectorIndex,
          retryRunId: null,
          reason: event.gateReason,
          observedAttemptCount: event.observedAttemptCount,
          maxAttempts: event.maxAttempts,
          stationary: null
        }));
        break;
      case "retry_progress_recorded":
        attemptRows.push(Object.freeze({
          kind: "halt_attempt_row",
          rowKind: "progress",
          edge: event.edge,
          vectorIndex: event.vectorIndex,
          retryRunId: event.retryRunId,
          reason: null,
          observedAttemptCount: null,
          maxAttempts: null,
          stationary: event.stationary
        }));
        break;
      case "runtime_failure_observed":
        failureRows.push(Object.freeze({
          kind: "halt_failure_row",
          surface: event.surface,
          failureClass: event.failureClass,
          message: event.message
        }));
        break;
      case "payload_rejected":
        rejectionRows.push(Object.freeze({
          kind: "halt_rejection_row",
          edge: event.edge,
          vectorIndex: event.vectorIndex,
          payloadRef: event.payloadRef,
          rejectionClass: event.rejectionClass,
          reason: event.reason
        }));
        rejectionEvidenceRefs.add(event.payloadRef);
        break;
      case "graph_reentry_planned":
        reentryPlanRefs.push(event.planRef);
        for (const ref of event.causingFrontierRowRefs) {
          rejectionEvidenceRefs.add(ref);
        }
        break;
      default:
        break;
    }
  }

  const decisiveTerminal = decisiveByOrdinal(terminalEvents, "terminal_reached");
  const latestStamp = decisiveByOrdinal(segmentStamps, "run_segment_opened");
  const halted = decisiveTerminal?.terminalKind === "gap_stop";
  const basisId = decisiveTerminal?.basisId ?? null;
  const haltReason = halted ? (decisiveTerminal?.reason ?? null) : null;
  const latestSegmentRef = latestStamp?.segmentRef ?? null;

  const implicatedEdges = Object.freeze(
    [...new Set([
      ...attemptRows.map((row) => row.edge),
      ...rejectionRows.map((row) => row.edge)
    ])].sort(codepointCompare)
  );
  const frozenAttempts = Object.freeze([...attemptRows]);
  const frozenFailures = Object.freeze([...failureRows]);
  const frozenRejections = Object.freeze([...rejectionRows]);
  const sortedEvidenceRefs = Object.freeze(
    [...rejectionEvidenceRefs].sort(codepointCompare)
  );
  return Object.freeze({
    kind: "halt_diagnosis_projection",
    diagnosisRef: `halt-diagnosis:${stableSha256Digest({
      basisId,
      halted,
      haltReason,
      implicatedEdges,
      attemptRows: frozenAttempts,
      failureRows: frozenFailures,
      rejectionRows: frozenRejections,
      rejectionEvidenceRefs: sortedEvidenceRefs,
      reentryPlanRefs,
      latestSegmentRef
    })}`,
    halted,
    basisId,
    haltReason,
    implicatedEdges,
    attemptRows: frozenAttempts,
    failureRows: frozenFailures,
    rejectionRows: frozenRejections,
    rejectionEvidenceRefs: sortedEvidenceRefs,
    reentryPlanRefs: Object.freeze([...reentryPlanRefs]),
    latestSegmentRef
  });
}
