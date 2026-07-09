// INPUT CONTRACT (self-review SR-5): derivations assume basis-scoped
// replay; over a multi-basis store segment windows blend spines.
//
// Implements: REQ-R-ABG3-WITNESS-005 — mixed-substrate runs decompose per
// segment under replay. A segment is one engine invocation's span; its
// window runs from its stamp's admission ordinal to the ordinal before
// the next stamp (open tail for the latest). Feeding these windows into
// deriveFrozenLawPredicate closes the S1 review F3 seam: frozen-law per
// proving span is mechanical, not caller-slicing convention.

import type { RunSegmentOpenedEvent, RuntimeEvent } from "./carriers.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  deriveFrozenLawPredicate,
  type FrozenLawPredicate,
  type FrozenLawWindow
} from "./declaration_reprice.js";

export interface GoverningDeclarationSet {
  readonly declarationSetDigest: string;
  readonly declarationCount: number;
}

export interface RunSegmentProjection {
  readonly kind: "run_segment_projection";
  readonly segmentRef: string;
  readonly segmentIndex: number;
  readonly basisId: string;
  readonly workerId: string;
  readonly backendId: string;
  readonly buildId: string;
  readonly resolvedRuntimeRef: string;
  readonly declarationSetDigest: string;
  readonly declarationCount: number;
  readonly window: FrozenLawWindow;
  readonly frozenLaw: FrozenLawPredicate;
}

function codepointCompare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

// ONE authority for the governing-set digest law: the LATEST admitted
// digest per declarationRef (S2 review P1: a resume without a fresh
// startup batch must stamp the replay-derived governing truth, never an
// empty set), folded over the given record in order, then codepoint-
// sorted pairs. Conflicting same-batch digests are the S1 identity-
// conflict guard's law — the runner blocks them before any stamp.
export function deriveGoverningDeclarationSet(
  events: readonly RuntimeEvent[]
): GoverningDeclarationSet {
  const latestByDeclarationRef = new Map<string, string>();
  for (const event of events) {
    if (event.kind !== "registry_entry_admitted") {
      continue;
    }
    latestByDeclarationRef.set(event.declarationRef, event.declarationDigest);
  }
  const pairs = [...latestByDeclarationRef.entries()]
    .map(([declarationRef, declarationDigest]) => ({
      declarationRef,
      declarationDigest
    }))
    .sort((left, right) =>
      codepointCompare(left.declarationRef, right.declarationRef)
    );
  return Object.freeze({
    declarationSetDigest: stableSha256Digest(pairs),
    declarationCount: pairs.length
  });
}

// Replay-global numbering: max prior index + 1 (max, not count — the F7
// attempt-identity lesson; a resumed window continues, never collides).
export function nextRunSegmentIndex(
  events: readonly RuntimeEvent[],
  basisId: string
): number {
  let maxIndex = 0;
  for (const event of events) {
    if (
      event.kind === "run_segment_opened" &&
      event.basisId === basisId &&
      event.segmentIndex > maxIndex
    ) {
      maxIndex = event.segmentIndex;
    }
  }
  return maxIndex + 1;
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

// S2 review P2: windows derive from ORDINAL truth, never input order —
// an unsorted replay must not mint impossible windows. Unorderable
// stamps (no admission ordinal) fail closed.
export function deriveRunSegments(
  events: readonly RuntimeEvent[]
): readonly RunSegmentProjection[] {
  const stamps = events
    .filter(
      (event): event is RunSegmentOpenedEvent =>
        event.kind === "run_segment_opened"
    )
    .map((stamp) => {
      const ordinal = eventAdmissionOrdinalOf(stamp);
      if (ordinal === null) {
        throw new TypeError(
          "Run segment windows require admission ordinals: an unorderable stamp cannot bound a span"
        );
      }
      return { stamp, ordinal };
    })
    .sort((left, right) => left.ordinal - right.ordinal);
  return Object.freeze(
    stamps.map(({ stamp, ordinal }, index) => {
      const fromOrdinal = ordinal;
      const next = stamps[index + 1];
      const nextOrdinal = next === undefined ? null : next.ordinal;
      const window: FrozenLawWindow = Object.freeze({
        fromOrdinal,
        toOrdinal: nextOrdinal === null ? null : nextOrdinal - 1
      });
      return Object.freeze({
        kind: "run_segment_projection",
        segmentRef: stamp.segmentRef,
        segmentIndex: stamp.segmentIndex,
        basisId: stamp.basisId,
        workerId: stamp.workerId,
        backendId: stamp.backendId,
        buildId: stamp.buildId,
        resolvedRuntimeRef: stamp.resolvedRuntimeRef,
        declarationSetDigest: stamp.declarationSetDigest,
        declarationCount: stamp.declarationCount,
        window,
        frozenLaw: deriveFrozenLawPredicate(events, window)
      });
    })
  );
}
