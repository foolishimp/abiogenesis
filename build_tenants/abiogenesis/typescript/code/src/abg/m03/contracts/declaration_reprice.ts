// Implements: REQ-R-ABG3-WITNESS-003 (reprice admission over resumed
// substrate drift) and REQ-R-ABG3-WITNESS-004 (frozen-law as a replay
// predicate: a span is frozen-law exactly when it contains zero
// admitted reprice events — never operator assertion).
//
// WITNESS-014 disposition: declaration_reprice_admitted initiates and
// terminates no runtime fluent; frozen-law is replay-derived predicate
// truth owned here, never primary event authority. Coverage is exact:
// a drift row is covered only by a reprice whose (declarationRef,
// beforeDigest, afterDigest) triple matches the observed digest pair —
// "a reprice exists somewhere" stamps nothing.
//
// Review fix (2026-07-09, S1 hostile review F1): a startup admitting
// MULTIPLE DISTINCT digests for one declarationRef is a typed identity
// conflict, never a dedupe — first-wins folding let a duplicate row
// carrying the old digest mask a second row carrying the drifted one.
// Conflicts are inherently uncoverable: reprice coverage presupposes an
// unambiguous current identity.

import type {
  DeclarationRepriceAdmittedEvent,
  RuntimeEvent
} from "./carriers.js";

export interface FrozenLawWindow {
  readonly fromOrdinal: number | null;
  readonly toOrdinal: number | null;
}

export interface FrozenLawPredicate {
  readonly kind: "frozen_law_predicate";
  readonly frozenLaw: boolean;
  readonly repriceRefs: readonly string[];
  readonly window: FrozenLawWindow | null;
}

export interface DeclarationDigestDriftRow {
  readonly kind: "declaration_digest_drift_row";
  readonly declarationRef: string;
  readonly priorDigest: string;
  readonly currentDigest: string;
  readonly coveringRepriceRefs: readonly string[];
}

export interface DeclarationIdentityConflictRow {
  readonly kind: "declaration_identity_conflict_row";
  readonly declarationRef: string;
  readonly priorDigest: string | null;
  readonly currentDigests: readonly string[];
}

export interface DeclarationRepriceObligationProjection {
  readonly kind: "declaration_reprice_obligation_projection";
  readonly driftRows: readonly DeclarationDigestDriftRow[];
  readonly uncoveredDriftRows: readonly DeclarationDigestDriftRow[];
  readonly identityConflictRows: readonly DeclarationIdentityConflictRow[];
}

export function deriveAdmittedDeclarationRepriceEvents(
  events: readonly RuntimeEvent[]
): readonly DeclarationRepriceAdmittedEvent[] {
  return Object.freeze(
    events.filter(
      (event): event is DeclarationRepriceAdmittedEvent =>
        event.kind === "declaration_reprice_admitted"
    )
  );
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

// Review fix (2026-07-09, S1 hostile review F3): the span is an explicit
// ordinal window, not a caller-slicing convention. An unstamped reprice
// inside a window query cannot be placed, so it poisons the window —
// fail-closed toward NOT frozen; the predicate never claims frozen on
// unplaceable truth. Omitting the window means the whole given record.
export function deriveFrozenLawPredicate(
  events: readonly RuntimeEvent[],
  window?: FrozenLawWindow
): FrozenLawPredicate {
  const admitted = deriveAdmittedDeclarationRepriceEvents(events);
  const inWindow =
    window === undefined
      ? admitted
      : admitted.filter((event) => {
          const ordinal = eventAdmissionOrdinalOf(event);
          if (ordinal === null) {
            return true;
          }
          if (window.fromOrdinal !== null && ordinal < window.fromOrdinal) {
            return false;
          }
          if (window.toOrdinal !== null && ordinal > window.toOrdinal) {
            return false;
          }
          return true;
        });
  return Object.freeze({
    kind: "frozen_law_predicate",
    frozenLaw: inWindow.length === 0,
    repriceRefs: Object.freeze(inWindow.map((event) => event.repriceRef)),
    window: window === undefined ? null : Object.freeze({ ...window })
  });
}

function codepointCompare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function deriveDeclarationRepriceObligations(input: {
  readonly priorEvents: readonly RuntimeEvent[];
  readonly startupAdmissionEvents: readonly RuntimeEvent[];
}): DeclarationRepriceObligationProjection {
  const priorDigestByDeclarationRef = new Map<string, string>();
  for (const event of input.priorEvents) {
    if (event.kind === "registry_entry_admitted") {
      priorDigestByDeclarationRef.set(
        event.declarationRef,
        event.declarationDigest
      );
    }
  }
  const admittedReprices = deriveAdmittedDeclarationRepriceEvents(
    input.priorEvents
  );
  const currentDigestsByDeclarationRef = new Map<string, Set<string>>();
  for (const event of input.startupAdmissionEvents) {
    if (event.kind !== "registry_entry_admitted") {
      continue;
    }
    const digests =
      currentDigestsByDeclarationRef.get(event.declarationRef) ?? new Set();
    digests.add(event.declarationDigest);
    currentDigestsByDeclarationRef.set(event.declarationRef, digests);
  }

  const driftRows: DeclarationDigestDriftRow[] = [];
  const identityConflictRows: DeclarationIdentityConflictRow[] = [];
  const declarationRefs = [...currentDigestsByDeclarationRef.keys()].sort(
    codepointCompare
  );
  for (const declarationRef of declarationRefs) {
    const digests = [
      ...(currentDigestsByDeclarationRef.get(declarationRef) ?? [])
    ].sort(codepointCompare);
    const priorDigest = priorDigestByDeclarationRef.get(declarationRef) ?? null;
    if (digests.length > 1) {
      identityConflictRows.push(
        Object.freeze({
          kind: "declaration_identity_conflict_row",
          declarationRef,
          priorDigest,
          currentDigests: Object.freeze(digests)
        })
      );
      continue;
    }
    const currentDigest = digests[0];
    if (
      currentDigest === undefined ||
      priorDigest === null ||
      priorDigest === currentDigest
    ) {
      continue;
    }
    const coveringRepriceRefs = admittedReprices
      .filter(
        (reprice) =>
          reprice.declarationRef === declarationRef &&
          reprice.beforeDigest === priorDigest &&
          reprice.afterDigest === currentDigest
      )
      .map((reprice) => reprice.repriceRef);
    driftRows.push(
      Object.freeze({
        kind: "declaration_digest_drift_row",
        declarationRef,
        priorDigest,
        currentDigest,
        coveringRepriceRefs: Object.freeze(coveringRepriceRefs)
      })
    );
  }
  const frozenRows = Object.freeze([...driftRows]);
  return Object.freeze({
    kind: "declaration_reprice_obligation_projection",
    driftRows: frozenRows,
    uncoveredDriftRows: Object.freeze(
      frozenRows.filter((row) => row.coveringRepriceRefs.length === 0)
    ),
    identityConflictRows: Object.freeze([...identityConflictRows])
  });
}
