// Implements: REQ-R-ABG3-CCALL-006 (enclosure) as a standing witness.
// Two strictness tiers, honest to the Realization State clause:
// - spine-row enclosure is STRICT law now: every c_call_* row must
//   reference a previously opened cCallRef, and every opened spine must
//   reach a judgment (no dangling spines on completed replay);
// - fibre-interior enclosure (dispatch/invocation rows inside an open
//   spine) is reported but non-failing while the strangler window
//   stands — it becomes strict when the transitional clause retires.

import type { RuntimeEvent } from "./carriers.js";

export interface CCallEnclosureIssue {
  readonly kind: "c_call_enclosure_issue";
  readonly issueKind:
    | "orphan_spine_row"
    | "dangling_open_spine"
    | "judged_before_admitted"
    | "unenclosed_fibre_interior";
  readonly severity: "violation" | "transitional";
  readonly eventKind: string;
  readonly cCallRef: string | null;
  readonly ordinal: number;
}

export interface CCallEnclosureReport {
  readonly accepted: boolean;
  readonly issues: readonly CCallEnclosureIssue[];
  readonly openedCount: number;
  readonly judgedCount: number;
}

const SPINE_ROW_KINDS = new Set([
  "c_call_fibre_selected",
  "c_call_evidenced",
  "c_call_result_admitted",
  "c_call_judged"
]);

const FP_INTERIOR_KINDS = new Set([
  "fp_dispatch_requested",
  "actor_invocation_started",
  "actor_invocation_closed"
]);

export function checkCCallEnclosure(
  events: readonly RuntimeEvent[],
  options?: { readonly completed?: boolean }
): CCallEnclosureReport {
  const issues: CCallEnclosureIssue[] = [];
  const opened = new Set<string>();
  const admitted = new Set<string>();
  const judged = new Set<string>();
  let anySpineOpen = 0;
  for (const [ordinal, event] of events.entries()) {
    const record = event as { readonly cCallRef?: string };
    if (event.kind === "c_call_opened" && record.cCallRef !== undefined) {
      opened.add(record.cCallRef);
      anySpineOpen += 1;
      continue;
    }
    if (SPINE_ROW_KINDS.has(event.kind)) {
      if (record.cCallRef === undefined || !opened.has(record.cCallRef)) {
        issues.push(Object.freeze({
          kind: "c_call_enclosure_issue",
          issueKind: "orphan_spine_row",
          severity: "violation",
          eventKind: event.kind,
          cCallRef: record.cCallRef ?? null,
          ordinal
        }));
        continue;
      }
      if (event.kind === "c_call_result_admitted") {
        admitted.add(record.cCallRef);
      }
      if (event.kind === "c_call_judged") {
        if (!admitted.has(record.cCallRef)) {
          issues.push(Object.freeze({
            kind: "c_call_enclosure_issue",
            issueKind: "judged_before_admitted",
            severity: "violation",
            eventKind: event.kind,
            cCallRef: record.cCallRef,
            ordinal
          }));
        }
        judged.add(record.cCallRef);
      }
      continue;
    }
    if (FP_INTERIOR_KINDS.has(event.kind) && anySpineOpen === 0) {
      // transitional: free-floating F_P interior (un-enclosed arm)
      issues.push(Object.freeze({
        kind: "c_call_enclosure_issue",
        issueKind: "unenclosed_fibre_interior",
        severity: "transitional",
        eventKind: event.kind,
        cCallRef: null,
        ordinal
      }));
    }
  }
  if (options?.completed === true) {
    for (const ref of opened) {
      if (!judged.has(ref)) {
        issues.push(Object.freeze({
          kind: "c_call_enclosure_issue",
          issueKind: "dangling_open_spine",
          severity: "violation",
          eventKind: "c_call_opened",
          cCallRef: ref,
          ordinal: -1
        }));
      }
    }
  }
  return Object.freeze({
    accepted: issues.every((issue) => issue.severity !== "violation"),
    issues: Object.freeze(issues),
    openedCount: opened.size,
    judgedCount: judged.size
  });
}
