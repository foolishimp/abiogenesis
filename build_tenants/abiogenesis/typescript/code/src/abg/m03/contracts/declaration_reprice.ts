// Implements: REQ-R-ABG3-WITNESS-003 (reprice admission over resumed
// substrate drift) and REQ-R-ABG3-WITNESS-004 (frozen-law as a replay
// predicate: a span is frozen-law exactly when it contains zero
// admitted reprice events — never operator assertion).
//
// INPUT CONTRACT (self-review SR-5): derivations assume basis-scoped
// replay; over a multi-basis store the predicates blend spines.
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
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  codepointCompare,
  decisiveByAdmissionOrdinal,
  decisiveValueByAdmissionOrdinal,
  eventAdmissionOrdinalOf
} from "./admission_hygiene.js";
import { hasCanonicalRuntimeEventEnvelope } from "./event_admission.js";

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
  // self-review SR-4: an idempotently re-admitted reprice (same digest
  // pair, same content-derived ref) must not duplicate in the projection
  const repriceRefs = Object.freeze([
    ...new Set(inWindow.map((event) => event.repriceRef))
  ]);
  return Object.freeze({
    kind: "frozen_law_predicate",
    frozenLaw: repriceRefs.length === 0,
    repriceRefs,
    window: window === undefined ? null : Object.freeze({ ...window })
  });
}

export function deriveDeclarationRepriceObligations(input: {
  readonly priorEvents: readonly RuntimeEvent[];
  readonly startupAdmissionEvents: readonly RuntimeEvent[];
}): DeclarationRepriceObligationProjection {
  // the prior baseline per declarationRef obeys the D-ordinal law:
  // agreeing duplicates need no order; disagreeing candidates are
  // decided by admission ordinal (unorderable disagreement fails closed)
  const priorRegistryEventsByRef = new Map<
    string,
    Extract<RuntimeEvent, { readonly kind: "registry_entry_admitted" }>[]
  >();
  for (const event of input.priorEvents) {
    if (event.kind === "registry_entry_admitted") {
      const rows = priorRegistryEventsByRef.get(event.declarationRef) ?? [];
      rows.push(event);
      priorRegistryEventsByRef.set(event.declarationRef, rows);
    }
  }
  const priorDigestByDeclarationRef = new Map<string, string>();
  for (const [declarationRef, rows] of priorRegistryEventsByRef) {
    const digest = decisiveValueByAdmissionOrdinal(
      rows,
      (row) => row.declarationDigest,
      `Reprice prior baseline (${declarationRef})`
    );
    if (digest !== null) {
      priorDigestByDeclarationRef.set(declarationRef, digest);
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

// ── The basis-fork witness (S5, WITNESS-003 "binding, or policy truth";
// self-review SR-2). basis.id is content-derived over resolvedPolicy and
// runtimeIdentity, so a policy/binding change on the SAME declared work
// mints a new basis identity and enters the fresh-start path — without
// this witness the fork is silent and spines coexist unratified. The
// spine is the work-identity key visible on basis_admitted truth; the
// covering carrier is the EXISTING reprice event with declarationRef =
// spineRef and the basisId pair as its digests (exact-pair law, no new
// event kind). The decisive prior basis is chosen by admission ordinal
// (chain of custody: A->A' covered earlier means entering A'' must be
// covered from A').

export interface ExecutionBasisSpine {
  readonly graphFunctionId: string;
  readonly jobId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
}

export interface BasisForkRow {
  readonly kind: "basis_fork_row";
  readonly spineRef: string;
  readonly priorBasisId: string;
  readonly enteringBasisId: string;
  readonly coveringRepriceRefs: readonly string[];
}

export interface BasisForkObligationProjection {
  readonly kind: "basis_fork_obligation_projection";
  readonly forkRows: readonly BasisForkRow[];
  readonly uncoveredForkRows: readonly BasisForkRow[];
}

export function mintExecutionBasisSpineRef(
  spine: ExecutionBasisSpine
): string {
  return `execution-basis-spine:${stableSha256Digest({
    graphFunctionId: spine.graphFunctionId,
    jobId: spine.jobId,
    runId: spine.runId,
    workKey: spine.workKey
  })}`;
}

export function deriveBasisForkObligations(input: {
  readonly priorEvents: readonly RuntimeEvent[];
  readonly enteringBasis: { readonly basisId: string } & ExecutionBasisSpine;
}): BasisForkObligationProjection {
  const empty = Object.freeze({
    kind: "basis_fork_obligation_projection" as const,
    forkRows: Object.freeze([]),
    uncoveredForkRows: Object.freeze([])
  });
  const entering = input.enteringBasis;
  const spineMatches = input.priorEvents.filter(
    (event) =>
      event.kind === "basis_admitted" &&
      event.graphFunctionId === entering.graphFunctionId &&
      event.jobId === entering.jobId &&
      (event.runId ?? null) === entering.runId &&
      (event.workKey ?? null) === entering.workKey
  );
  // the entering basis already admitted on this spine = a lawful resume,
  // not a fork (the caller gates on new-entry; this keeps the derivation
  // total either way)
  if (
    spineMatches.some(
      (event) =>
        event.kind === "basis_admitted" && event.basisId === entering.basisId
    )
  ) {
    return empty;
  }
  const priorForks = spineMatches.filter(
    (event) =>
      event.kind === "basis_admitted" && event.basisId !== entering.basisId
  );
  if (priorForks.length === 0) {
    return empty;
  }
  const decisivePrior = decisiveByAdmissionOrdinal(
    priorForks,
    "Basis fork detection"
  );
  if (decisivePrior === null || decisivePrior.kind !== "basis_admitted") {
    return empty;
  }
  const spineRef = mintExecutionBasisSpineRef(entering);
  // S5 codex P1: the fork scan reads RAW cross-basis events (they bypass
  // the basis-scoped ingress assert), so COVERAGE authority demands the
  // canonical envelope — a raw constructed reprice is a self-reported
  // operator act, not replay truth. The asymmetry is principled:
  // uncanonical events may DETECT a fork (fail-closed), never ratify
  // one. Authenticated replay (forged-envelope resistance) is the T-211
  // trust item this composes with.
  const coveringRepriceRefs = deriveAdmittedDeclarationRepriceEvents(
    input.priorEvents
  )
    .filter(
      (reprice) =>
        hasCanonicalRuntimeEventEnvelope(reprice) &&
        reprice.declarationRef === spineRef &&
        reprice.beforeDigest === decisivePrior.basisId &&
        reprice.afterDigest === entering.basisId
    )
    .map((reprice) => reprice.repriceRef);
  const row = Object.freeze({
    kind: "basis_fork_row" as const,
    spineRef,
    priorBasisId: decisivePrior.basisId,
    enteringBasisId: entering.basisId,
    coveringRepriceRefs: Object.freeze([...new Set(coveringRepriceRefs)])
  });
  return Object.freeze({
    kind: "basis_fork_obligation_projection" as const,
    forkRows: Object.freeze([row]),
    uncoveredForkRows: Object.freeze(
      row.coveringRepriceRefs.length === 0 ? [row] : []
    )
  });
}
