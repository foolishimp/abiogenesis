// Implements: T-140
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS
// Implements: REQ-R-ABG3-PROJECTION

import type { ConstructionActionKind } from "./construction_action_kinds.js";
import type { ConstructionActionCatalogProjection } from "./construction_action_catalog.js";
import {
  selectAdmittedConstructionIntentByPriority,
  type ConstructionIntentAdmission
} from "./construction_intent.js";
import type { ConstructionPriorityProjection } from "./construction_priority.js";
import type { ConstructionProgressLedger } from "./construction_progress.js";
import {
  assertNonEmptyString,
  freezeStringArray
} from "./runtime_support.js";
import {
  assertAllowedString,
  freezeNonEmptyStrings,
  nullableString
} from "./construction_validation.js";
import { stableSha256HexDigest as stableDigest } from "../../../shared/runtime_identity.js";

export const CONSTRUCTION_PROJECTION_STATE_VALUES = Object.freeze([
  "construction_closed",
  "construction_progressing_yield",
  "construction_blocked",
  "construction_stalled",
  "construction_review_required",
  "construction_escalated",
  "fh_input_required",
  "ticket_created",
  "reprice_required"
] as const);

export type ConstructionProjectionState =
  (typeof CONSTRUCTION_PROJECTION_STATE_VALUES)[number];

export interface ConstructionProjection {
  readonly kind: "construction_projection";
  readonly projectionRef: string;
  readonly episodeId: string;
  readonly publicState: ConstructionProjectionState;
  readonly nextActionRef: string | null;
  readonly selectedIntentId: string | null;
  readonly terminalRouteRefs: readonly string[];
  readonly reviewReasonRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}

export interface ConstructionProjectionSummary {
  readonly kind: "construction_projection_summary";
  readonly projectionRef: string;
  readonly episodeId: string;
  readonly publicState: ConstructionProjectionState;
  readonly nextActionRef: string | null;
  readonly selectedIntentId: string | null;
  readonly terminalRouteRefs: readonly string[];
  readonly reviewReasonRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}

function projectionStateForActionKind(
  actionKind: ConstructionActionKind
): ConstructionProjectionState {
  switch (actionKind) {
    case "open_fh_gate":
      return "fh_input_required";
    case "create_ticket":
      return "ticket_created";
    case "propose_reprice":
      return "reprice_required";
    case "close_episode":
      return "construction_closed";
    case "block_episode":
      return "construction_blocked";
    case "yield_progress":
    case "invoke_graph_function":
    case "continue_graph_call":
    case "repair_same_edge":
    case "reenter_graph_span":
    case "invoke_prior_vector":
    case "invoke_later_vector":
      return "construction_progressing_yield";
  }
}

export function deriveConstructionProjection(input: {
  readonly episodeId: string;
  readonly priorityProjection: ConstructionPriorityProjection;
  readonly admissions?: readonly ConstructionIntentAdmission[];
  readonly actionCatalog?: ConstructionActionCatalogProjection;
  readonly progressLedger?: ConstructionProgressLedger;
  readonly sourceProjectionRefs?: readonly string[];
}): ConstructionProjection {
  assertNonEmptyString(input.episodeId, "ConstructionProjection.episodeId");
  if (input.priorityProjection.episodeId !== input.episodeId) {
    throw new TypeError("ConstructionProjection priority projection episode mismatch");
  }
  const latestProgress = input.progressLedger?.rows.at(-1);
  if (latestProgress !== undefined) {
    if (latestProgress.progressKind === "closed") {
      return constructConstructionProjection({
        episodeId: input.episodeId,
        publicState: "construction_closed",
        nextActionRef: null,
        selectedIntentId: latestProgress.intentId,
        terminalRouteRefs: [],
        reviewReasonRefs: [],
        sourceProjectionRefs: input.sourceProjectionRefs ?? [input.priorityProjection.projectionRef]
      });
    }
    if (latestProgress.progressKind === "no_material_progress") {
      return constructConstructionProjection({
        episodeId: input.episodeId,
        publicState: "construction_stalled",
        nextActionRef: null,
        selectedIntentId: latestProgress.intentId,
        terminalRouteRefs: [],
        reviewReasonRefs: [latestProgress.progressRowId],
        sourceProjectionRefs: input.sourceProjectionRefs ?? [input.priorityProjection.projectionRef]
      });
    }
  }
  const firstPriorityRow = input.priorityProjection.rows[0];
  if (firstPriorityRow !== undefined && firstPriorityRow.terminalDisposition !== "none") {
    const publicState: ConstructionProjectionState =
      firstPriorityRow.terminalDisposition === "escalate"
        ? "construction_escalated"
        : firstPriorityRow.terminalDisposition === "request_fh_input"
          ? "fh_input_required"
          : "construction_review_required";
    return constructConstructionProjection({
      episodeId: input.episodeId,
      publicState,
      nextActionRef: firstPriorityRow.actionRef,
      selectedIntentId: null,
      terminalRouteRefs:
        firstPriorityRow.terminalRouteRef === null ? [] : [firstPriorityRow.terminalRouteRef],
      reviewReasonRefs: firstPriorityRow.reviewReasonRefs,
      sourceProjectionRefs: input.sourceProjectionRefs ?? [input.priorityProjection.projectionRef]
    });
  }
  const selectedIntent = selectAdmittedConstructionIntentByPriority({
    admissions: input.admissions ?? [],
    priorityProjection: input.priorityProjection
  });
  if (selectedIntent === null) {
    return constructConstructionProjection({
      episodeId: input.episodeId,
      publicState: "construction_blocked",
      nextActionRef: null,
      selectedIntentId: null,
      terminalRouteRefs: [],
      reviewReasonRefs: [],
      sourceProjectionRefs: input.sourceProjectionRefs ?? [input.priorityProjection.projectionRef]
    });
  }
  const action = input.actionCatalog?.rows.find(
    (row) => row.actionRef === selectedIntent.selectedActionRef
  );
  const publicState =
    action === undefined
      ? "construction_progressing_yield"
      : projectionStateForActionKind(action.actionKind);
  return constructConstructionProjection({
    episodeId: input.episodeId,
    publicState,
    nextActionRef: selectedIntent.selectedActionRef,
    selectedIntentId: selectedIntent.intentId,
    terminalRouteRefs: [],
    reviewReasonRefs: [],
    sourceProjectionRefs: input.sourceProjectionRefs ?? [input.priorityProjection.projectionRef]
  });
}

function constructConstructionProjection(input: {
  readonly episodeId: string;
  readonly publicState: ConstructionProjectionState;
  readonly nextActionRef: string | null;
  readonly selectedIntentId: string | null;
  readonly terminalRouteRefs: readonly string[];
  readonly reviewReasonRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}): ConstructionProjection {
  assertAllowedString(
    input.publicState,
    CONSTRUCTION_PROJECTION_STATE_VALUES,
    "ConstructionProjection.publicState"
  );
  return Object.freeze({
    kind: "construction_projection",
    projectionRef: `construction-projection:${input.episodeId}:${input.publicState}:${stableDigest(input)}`,
    episodeId: input.episodeId,
    publicState: input.publicState,
    nextActionRef: nullableString(input.nextActionRef, "ConstructionProjection.nextActionRef"),
    selectedIntentId: nullableString(
      input.selectedIntentId,
      "ConstructionProjection.selectedIntentId"
    ),
    terminalRouteRefs: freezeNonEmptyStrings(
      input.terminalRouteRefs,
      "ConstructionProjection.terminalRouteRefs"
    ),
    reviewReasonRefs: freezeNonEmptyStrings(
      input.reviewReasonRefs,
      "ConstructionProjection.reviewReasonRefs"
    ),
    sourceProjectionRefs: freezeNonEmptyStrings(
      input.sourceProjectionRefs,
      "ConstructionProjection.sourceProjectionRefs"
    )
  });
}

export function deriveConstructionProjectionSummary(
  projection: ConstructionProjection
): ConstructionProjectionSummary {
  return Object.freeze({
    kind: "construction_projection_summary",
    projectionRef: projection.projectionRef,
    episodeId: projection.episodeId,
    publicState: projection.publicState,
    nextActionRef: projection.nextActionRef,
    selectedIntentId: projection.selectedIntentId,
    terminalRouteRefs: freezeStringArray(projection.terminalRouteRefs),
    reviewReasonRefs: freezeStringArray(projection.reviewReasonRefs),
    sourceProjectionRefs: freezeStringArray(projection.sourceProjectionRefs)
  });
}

export function assertConstructionProjectionSummaryAgreement(input: {
  readonly projection: ConstructionProjection;
  readonly summary: ConstructionProjectionSummary;
}): void {
  if (input.projection.projectionRef !== input.summary.projectionRef) {
    throw new TypeError("Construction projection summary projectionRef mismatch");
  }
  if (input.projection.episodeId !== input.summary.episodeId) {
    throw new TypeError("Construction projection summary episodeId mismatch");
  }
  if (input.projection.publicState !== input.summary.publicState) {
    throw new TypeError("Construction projection summary publicState mismatch");
  }
  if (input.projection.nextActionRef !== input.summary.nextActionRef) {
    throw new TypeError("Construction projection summary nextActionRef mismatch");
  }
  if (input.projection.selectedIntentId !== input.summary.selectedIntentId) {
    throw new TypeError("Construction projection summary selectedIntentId mismatch");
  }
  if (
    input.projection.terminalRouteRefs.join("\n") !==
    input.summary.terminalRouteRefs.join("\n")
  ) {
    throw new TypeError("Construction projection summary terminalRouteRefs mismatch");
  }
  if (
    input.projection.reviewReasonRefs.join("\n") !==
    input.summary.reviewReasonRefs.join("\n")
  ) {
    throw new TypeError("Construction projection summary reviewReasonRefs mismatch");
  }
  if (
    input.projection.sourceProjectionRefs.join("\n") !==
    input.summary.sourceProjectionRefs.join("\n")
  ) {
    throw new TypeError("Construction projection summary sourceProjectionRefs mismatch");
  }
}
