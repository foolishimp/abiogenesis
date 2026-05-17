// Implements: T-140
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS
// Implements: REQ-R-ABG3-PROJECTION

import type {
  ConstructionDeltaObservedEvent,
  RuntimeEvent
} from "./carriers.js";
import { admitConstructionRuntimeEvents } from "./construction_event_causality.js";
import {
  CONSTRUCTION_PROGRESS_DERIVED_FLUENT_RULE,
  deriveRuntimeEventCalculusProjection,
  type RuntimeEventCalculusProjection
} from "./event_calculus.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger
} from "./runtime_support.js";
import {
  freezeNonEmptyStrings,
  nullableString
} from "./construction_validation.js";

export const CONSTRUCTION_PROGRESS_KIND_VALUES = Object.freeze([
  "new_artifact_digest",
  "new_admitted_progress_row",
  "narrowed_blocker",
  "fulfilled_obligation",
  "accepted_fh_decision",
  "lawful_reentry_moved",
  "closed",
  "no_material_progress"
] as const);

export type ConstructionProgressKind =
  (typeof CONSTRUCTION_PROGRESS_KIND_VALUES)[number];

export interface ConstructionProgressInputRow {
  readonly iterationOrdinal: number;
  readonly attemptOrdinal: number;
  readonly eventSequence: number;
  readonly intentId: string;
  readonly attemptRef: string;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly correlationId: string;
  readonly beforeProjectionRef: string;
  readonly afterProjectionRef: string;
  readonly assetDeltaRefs: readonly string[];
  readonly artifactDigestBefore: string | null;
  readonly artifactDigestAfter: string | null;
  readonly blockerBefore: string | null;
  readonly blockerAfter: string | null;
  readonly fulfilledObligationRefs: readonly string[];
  readonly remainingObligationRefs: readonly string[];
  readonly newEvidenceRefs: readonly string[];
  readonly fhDecisionAccepted: boolean;
  readonly reentryMoved: boolean;
  readonly closed: boolean;
}

export interface ConstructionProgressLedger {
  readonly kind: "construction_progress_ledger";
  readonly episodeId: string;
  readonly rows: readonly ConstructionProgressRow[];
}

export interface ConstructionProgressRow {
  readonly kind: "construction_progress_row";
  readonly episodeId: string;
  readonly progressRowId: string;
  readonly iterationOrdinal: number;
  readonly attemptOrdinal: number;
  readonly eventSequence: number;
  readonly intentId: string;
  readonly attemptRef: string;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly correlationId: string;
  readonly beforeProjectionRef: string;
  readonly afterProjectionRef: string;
  readonly assetDeltaRefs: readonly string[];
  readonly artifactDigestBefore: string | null;
  readonly artifactDigestAfter: string | null;
  readonly blockerBefore: string | null;
  readonly blockerAfter: string | null;
  readonly fulfilledObligationRefs: readonly string[];
  readonly remainingObligationRefs: readonly string[];
  readonly newEvidenceRefs: readonly string[];
  readonly progressKind: ConstructionProgressKind;
  readonly stagnationReason: string | null;
}

export function deriveConstructionEventCalculusProjection(input: {
  readonly episodeId: string;
  readonly events: readonly RuntimeEvent[];
}): RuntimeEventCalculusProjection {
  const admitted = admitConstructionRuntimeEvents(input);
  return deriveRuntimeEventCalculusProjection({
    events: admitted,
    derivedRules: [CONSTRUCTION_PROGRESS_DERIVED_FLUENT_RULE]
  });
}

export function deriveConstructionProgressLedgerFromDeltaEvents(input: {
  readonly episodeId: string;
  readonly events: readonly RuntimeEvent[];
}): ConstructionProgressLedger {
  const events = admitConstructionRuntimeEvents({
    episodeId: input.episodeId,
    events: input.events
  }).filter(
    (event): event is ConstructionDeltaObservedEvent =>
      event.kind === "construction_delta_observed"
  );
  return deriveConstructionProgressLedger({
    episodeId: input.episodeId,
    rows: events.map((event) => ({
      iterationOrdinal: event.iterationOrdinal,
      attemptOrdinal: event.attemptOrdinal,
      eventSequence: event.eventSequence,
      intentId: event.intentId,
      attemptRef: event.deltaRef,
      basisProjectionRef: event.basisProjectionRef,
      priorIntentId: event.priorIntentId,
      causationRef: event.causationEventRefs[0] ?? event.constructionEventRef,
      correlationId: event.correlationId,
      beforeProjectionRef: event.beforeProjectionRef,
      afterProjectionRef: event.afterProjectionRef,
      assetDeltaRefs: event.assetDeltaRefs,
      artifactDigestBefore: event.artifactDigestBefore,
      artifactDigestAfter: event.artifactDigestAfter,
      blockerBefore: event.blockerBefore,
      blockerAfter: event.blockerAfter,
      fulfilledObligationRefs: event.fulfilledObligationRefs,
      remainingObligationRefs: event.remainingObligationRefs,
      newEvidenceRefs: event.newEvidenceRefs,
      fhDecisionAccepted: event.fhDecisionAccepted,
      reentryMoved: event.reentryMoved,
      closed: event.closed
    }))
  });
}

interface ConstructionProgressOrderRow {
  readonly eventSequence: number;
  readonly iterationOrdinal: number;
  readonly attemptOrdinal: number;
  readonly intentId: string;
  readonly attemptRef: string;
}

function compareConstructionProgressOrder(
  left: ConstructionProgressOrderRow,
  right: ConstructionProgressOrderRow
): number {
  if (left.eventSequence !== right.eventSequence) {
    return left.eventSequence - right.eventSequence;
  }
  if (left.iterationOrdinal !== right.iterationOrdinal) {
    return left.iterationOrdinal - right.iterationOrdinal;
  }
  if (left.attemptOrdinal !== right.attemptOrdinal) {
    return left.attemptOrdinal - right.attemptOrdinal;
  }
  const intentComparison = left.intentId.localeCompare(right.intentId);
  return intentComparison !== 0
    ? intentComparison
    : left.attemptRef.localeCompare(right.attemptRef);
}

export function deriveConstructionProgressLedger(input: {
  readonly episodeId: string;
  readonly rows: readonly ConstructionProgressInputRow[];
}): ConstructionProgressLedger {
  assertNonEmptyString(input.episodeId, "ConstructionProgressLedger.episodeId");
  const rows = input.rows.map((row): ConstructionProgressRow => {
    assertNonNegativeInteger(
      row.iterationOrdinal,
      "ConstructionProgressInputRow.iterationOrdinal"
    );
    assertNonNegativeInteger(
      row.attemptOrdinal,
      "ConstructionProgressInputRow.attemptOrdinal"
    );
    assertNonNegativeInteger(
      row.eventSequence,
      "ConstructionProgressInputRow.eventSequence"
    );
    assertNonEmptyString(row.intentId, "ConstructionProgressInputRow.intentId");
    assertNonEmptyString(row.attemptRef, "ConstructionProgressInputRow.attemptRef");
    assertNonEmptyString(
      row.basisProjectionRef,
      "ConstructionProgressInputRow.basisProjectionRef"
    );
    nullableString(row.priorIntentId, "ConstructionProgressInputRow.priorIntentId");
    assertNonEmptyString(row.causationRef, "ConstructionProgressInputRow.causationRef");
    assertNonEmptyString(row.correlationId, "ConstructionProgressInputRow.correlationId");
    assertNonEmptyString(
      row.beforeProjectionRef,
      "ConstructionProgressInputRow.beforeProjectionRef"
    );
    assertNonEmptyString(
      row.afterProjectionRef,
      "ConstructionProgressInputRow.afterProjectionRef"
    );
    const progressKind = row.closed
      ? "closed"
      : row.artifactDigestBefore !== null &&
          row.artifactDigestAfter !== null &&
          row.artifactDigestBefore !== row.artifactDigestAfter
        ? "new_artifact_digest"
        : row.fulfilledObligationRefs.length > 0
          ? "fulfilled_obligation"
          : row.newEvidenceRefs.length > 0
            ? "new_admitted_progress_row"
            : row.blockerBefore !== null &&
                row.blockerAfter !== null &&
                row.blockerBefore !== row.blockerAfter
              ? "narrowed_blocker"
              : row.fhDecisionAccepted
                ? "accepted_fh_decision"
                : row.reentryMoved
                  ? "lawful_reentry_moved"
                  : "no_material_progress";
    const progressRowId = [
      "construction-progress",
      input.episodeId,
      String(row.eventSequence),
      String(row.iterationOrdinal),
      String(row.attemptOrdinal),
      row.intentId,
      row.attemptRef
    ].join(":");
    return Object.freeze({
      kind: "construction_progress_row",
      episodeId: input.episodeId,
      progressRowId,
      iterationOrdinal: row.iterationOrdinal,
      attemptOrdinal: row.attemptOrdinal,
      eventSequence: row.eventSequence,
      intentId: row.intentId,
      attemptRef: row.attemptRef,
      basisProjectionRef: row.basisProjectionRef,
      priorIntentId: nullableString(
        row.priorIntentId,
        "ConstructionProgressInputRow.priorIntentId"
      ),
      causationRef: row.causationRef,
      correlationId: row.correlationId,
      beforeProjectionRef: row.beforeProjectionRef,
      afterProjectionRef: row.afterProjectionRef,
      assetDeltaRefs: freezeNonEmptyStrings(
        row.assetDeltaRefs,
        "ConstructionProgressInputRow.assetDeltaRefs"
      ),
      artifactDigestBefore: nullableString(
        row.artifactDigestBefore,
        "ConstructionProgressInputRow.artifactDigestBefore"
      ),
      artifactDigestAfter: nullableString(
        row.artifactDigestAfter,
        "ConstructionProgressInputRow.artifactDigestAfter"
      ),
      blockerBefore: nullableString(
        row.blockerBefore,
        "ConstructionProgressInputRow.blockerBefore"
      ),
      blockerAfter: nullableString(
        row.blockerAfter,
        "ConstructionProgressInputRow.blockerAfter"
      ),
      fulfilledObligationRefs: freezeNonEmptyStrings(
        row.fulfilledObligationRefs,
        "ConstructionProgressInputRow.fulfilledObligationRefs"
      ),
      remainingObligationRefs: freezeNonEmptyStrings(
        row.remainingObligationRefs,
        "ConstructionProgressInputRow.remainingObligationRefs"
      ),
      newEvidenceRefs: freezeNonEmptyStrings(
        row.newEvidenceRefs,
        "ConstructionProgressInputRow.newEvidenceRefs"
      ),
      progressKind,
      stagnationReason:
        progressKind === "no_material_progress" ? "same_blocker_and_same_digest" : null
    });
  });
  return Object.freeze({
    kind: "construction_progress_ledger",
    episodeId: input.episodeId,
    rows: Object.freeze(rows.sort(compareConstructionProgressOrder))
  });
}
