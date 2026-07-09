// Implements: REQ-R-ABG3-WITNESS-003 (reprice admission over resumed
// substrate drift) and REQ-R-ABG3-WITNESS-004 (frozen-law as a replay
// predicate: a run span is frozen-law exactly when it contains zero
// admitted reprice events — never operator assertion).
//
// WITNESS-014 disposition: declaration_reprice_admitted initiates and
// terminates no runtime fluent; frozen-law is replay-derived predicate
// truth owned here, never primary event authority. Coverage is exact:
// a drift row is covered only by a reprice whose (declarationRef,
// beforeDigest, afterDigest) triple matches the observed digest pair —
// "a reprice exists somewhere" stamps nothing.

import type {
  DeclarationRepriceAdmittedEvent,
  RuntimeEvent
} from "./carriers.js";

export interface FrozenLawPredicate {
  readonly kind: "frozen_law_predicate";
  readonly frozenLaw: boolean;
  readonly repriceRefs: readonly string[];
}

export interface DeclarationDigestDriftRow {
  readonly kind: "declaration_digest_drift_row";
  readonly declarationRef: string;
  readonly priorDigest: string;
  readonly currentDigest: string;
  readonly coveringRepriceRefs: readonly string[];
}

export interface DeclarationRepriceObligationProjection {
  readonly kind: "declaration_reprice_obligation_projection";
  readonly driftRows: readonly DeclarationDigestDriftRow[];
  readonly uncoveredDriftRows: readonly DeclarationDigestDriftRow[];
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

export function deriveFrozenLawPredicate(
  events: readonly RuntimeEvent[]
): FrozenLawPredicate {
  const repriceRefs = deriveAdmittedDeclarationRepriceEvents(events).map(
    (event) => event.repriceRef
  );
  return Object.freeze({
    kind: "frozen_law_predicate",
    frozenLaw: repriceRefs.length === 0,
    repriceRefs: Object.freeze([...repriceRefs])
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
  const driftRows: DeclarationDigestDriftRow[] = [];
  const seenDeclarationRefs = new Set<string>();
  for (const event of input.startupAdmissionEvents) {
    if (event.kind !== "registry_entry_admitted") {
      continue;
    }
    if (seenDeclarationRefs.has(event.declarationRef)) {
      continue;
    }
    seenDeclarationRefs.add(event.declarationRef);
    const priorDigest = priorDigestByDeclarationRef.get(event.declarationRef);
    if (priorDigest === undefined || priorDigest === event.declarationDigest) {
      continue;
    }
    const coveringRepriceRefs = admittedReprices
      .filter(
        (reprice) =>
          reprice.declarationRef === event.declarationRef &&
          reprice.beforeDigest === priorDigest &&
          reprice.afterDigest === event.declarationDigest
      )
      .map((reprice) => reprice.repriceRef);
    driftRows.push(
      Object.freeze({
        kind: "declaration_digest_drift_row",
        declarationRef: event.declarationRef,
        priorDigest,
        currentDigest: event.declarationDigest,
        coveringRepriceRefs: Object.freeze(coveringRepriceRefs)
      })
    );
  }
  driftRows.sort((left, right) =>
    codepointCompare(left.declarationRef, right.declarationRef)
  );
  const frozenRows = Object.freeze([...driftRows]);
  return Object.freeze({
    kind: "declaration_reprice_obligation_projection",
    driftRows: frozenRows,
    uncoveredDriftRows: Object.freeze(
      frozenRows.filter((row) => row.coveringRepriceRefs.length === 0)
    )
  });
}
