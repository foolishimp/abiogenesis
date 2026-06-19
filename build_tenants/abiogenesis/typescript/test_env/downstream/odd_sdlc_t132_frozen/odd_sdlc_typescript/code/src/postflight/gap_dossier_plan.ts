// Implements: T-175

import type {
  SdlcBlockingReason,
  SdlcBlockingReasonLawfulReentryPoint
} from "../shared/blocking_reason.js";

export const SDLC_POSTFLIGHT_GAP_ACTIONS = Object.freeze([
  "retry_same_edge",
  "escalate_to_fp",
  "repair_worker_output",
  "triage_gap",
  "reprice_requirement_or_design"
] as const);

export type SdlcPostflightGapAction =
  (typeof SDLC_POSTFLIGHT_GAP_ACTIONS)[number];

function actionForReentryPoint(
  reentryPoint: SdlcBlockingReasonLawfulReentryPoint
): SdlcPostflightGapAction | null {
  if (reentryPoint === "same_edge_retry") {
    return "retry_same_edge";
  }
  if (reentryPoint === "escalate_to_fp") {
    return "escalate_to_fp";
  }
  if (reentryPoint === "repair_worker_output") {
    return "repair_worker_output";
  }
  if (reentryPoint === "triage_gap") {
    return "triage_gap";
  }
  if (reentryPoint === "reprice_requirement_or_design") {
    return "reprice_requirement_or_design";
  }
  return null;
}

export function sdlcPostflightGapRetryEligible(
  reasons: readonly SdlcBlockingReason[]
): boolean {
  return reasons.some((reason) =>
    reason.lawfulReentryPoint === "same_edge_retry" ||
    reason.lawfulReentryPoint === "escalate_to_fp" ||
    reason.lawfulReentryPoint === "repair_worker_output"
  );
}

export function deriveSdlcPostflightGapActions(
  reasons: readonly SdlcBlockingReason[]
): readonly SdlcPostflightGapAction[] {
  const actions = new Set<SdlcPostflightGapAction>();
  for (const reason of reasons) {
    const action = actionForReentryPoint(reason.lawfulReentryPoint);
    if (action !== null) {
      actions.add(action);
    }
  }
  if (actions.size === 0) {
    actions.add("triage_gap");
  }
  return Object.freeze([...actions]);
}
