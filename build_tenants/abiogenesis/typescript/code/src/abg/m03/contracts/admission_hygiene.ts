// T-216 D5+D6 (admission hygiene, one home): the shared laws every
// worker-payload row admission obeys. Extracted during the mutation-
// soundness cleanup so the depth-map and mutation-outcome carriers —
// and any future worker-payload carrier — cannot re-diverge.
//
// D5 READ-ONCE LAW (codex P1, review D-interim MEDIUM): admission must
// be total over HOSTILE in-process objects. A JSON.stringify guard
// alone is insufficient — a Proxy/getter can pass stringify and then
// throw or return a DIFFERENT value on the validator's re-read (TOCTOU),
// escaping admission as a host exception or storing an unvalidated
// value. The law: DETACH ONCE into a plain snapshot, then validate and
// freeze ONLY the snapshot. The original object is never read twice.
//
// D6 DETERMINISTIC CANONICAL LAW (codex P2, replay truth rules 3/7):
// canonical row order must be reproducible on every replay host. A
// concatenated sort key (`${a}:${b}`) is ambiguous under duplicate
// logical keys, and localeCompare is ICU/locale-dependent. The law:
// sort by the FULL detached row content under a fixed codepoint
// comparator — identical row sets in any input order yield one digest.

// Detach a worker-payload row into a plain, self-consistent snapshot via
// one JSON round-trip. Returns undefined when the row is not plain
// readable data (throwing getter, non-serializable, cyclic) — a typed
// rejection at the caller, never a host exception. The snapshot is read
// for validation and frozen for storage; the original is discarded.
export function detachRowSnapshot(row: unknown): unknown {
  let serialized: string;
  try {
    serialized = JSON.stringify(row);
  } catch {
    return undefined;
  }
  if (serialized === undefined) {
    // row was a bare undefined / function / symbol
    return undefined;
  }
  try {
    return JSON.parse(serialized) as unknown;
  } catch {
    return undefined;
  }
}

// Total codepoint order over strings — never localeCompare. Stable and
// host-independent.
export function codepointCompare(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

// Canonical row order by FULL content: each row is keyed by its own
// deterministic JSON serialization (keys sorted) and ordered by
// codepoint. Ambiguity-free under duplicate logical keys; locale-free.
export function canonicalizeRowsByContent<T>(rows: readonly T[]): readonly T[] {
  return Object.freeze(
    [...rows]
      .map((row) => ({ row, key: stableRowKey(row) }))
      .sort((left, right) => codepointCompare(left.key, right.key))
      .map((entry) => entry.row)
  );
}

// Deterministic serialization of a row for canonical ordering: object
// keys emitted in sorted order so key insertion order never affects the
// canonical key. Rows are already detached plain values at this point.
function stableRowKey(value: unknown): string {
  return JSON.stringify(value, replacerSortingKeys(value));
}

function replacerSortingKeys(
  _root: unknown
): (this: unknown, key: string, value: unknown) => unknown {
  return function sorter(_key: string, value: unknown): unknown {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return value;
    }
    const sorted: Record<string, unknown> = {};
    for (const objectKey of Object.keys(value).sort()) {
      sorted[objectKey] = (value as Record<string, unknown>)[objectKey];
    }
    return sorted;
  };
}

// D-ORDINAL LAW (T-217 S2-P2 / S4-P1a, the standing lesson applied at
// the shared home): every "latest/last X" over replay is an ORDINAL
// law, never an array law. A single candidate needs no ordering; among
// several, any unorderable candidate (no admission ordinal) FAILS
// CLOSED — caller array order must never mint authority.
export function eventAdmissionOrdinalOf(event: unknown): number | null {
  if (
    typeof event === "object" &&
    event !== null &&
    "eventAdmissionOrdinal" in event &&
    typeof (event).eventAdmissionOrdinal === "number" &&
    Number.isSafeInteger((event as { eventAdmissionOrdinal: number }).eventAdmissionOrdinal) &&
    (event as { eventAdmissionOrdinal: number }).eventAdmissionOrdinal >= 0
  ) {
    return (event as { eventAdmissionOrdinal: number }).eventAdmissionOrdinal;
  }
  return null;
}

export function decisiveByAdmissionOrdinal<T>(
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
  let decisive: { candidate: T; ordinal: number } | null = null;
  for (const candidate of candidates) {
    const ordinal = eventAdmissionOrdinalOf(candidate);
    if (ordinal === null) {
      throw new TypeError(
        `${label} requires admission ordinals to order multiple candidates`
      );
    }
    if (decisive === null || ordinal > decisive.ordinal) {
      decisive = { candidate, ordinal };
    }
  }
  return decisive === null ? null : decisive.candidate;
}

// Strict ordering for folds that consume EVERY candidate in sequence:
// with more than one candidate, all must carry ordinals — else fail
// closed. A single candidate needs no order.
export function sortByAdmissionOrdinalStrict<T>(
  items: readonly T[],
  label: string
): readonly T[] {
  if (items.length <= 1) {
    return Object.freeze([...items]);
  }
  const withOrdinals = items.map((item) => {
    const ordinal = eventAdmissionOrdinalOf(item);
    if (ordinal === null) {
      throw new TypeError(
        `${label} requires admission ordinals to order multiple candidates`
      );
    }
    return { item, ordinal };
  });
  return Object.freeze(
    withOrdinals
      .sort((left, right) => left.ordinal - right.ordinal)
      .map((entry) => entry.item)
  );
}

// Disagreement-aware decisive value: candidates that all AGREE need no
// ordering (idempotent duplicates are lawful without ordinals); only
// DISAGREEING candidates demand ordinal truth — then the latest decides,
// and unorderable disagreement fails closed.
export function decisiveValueByAdmissionOrdinal<T, V extends string | null>(
  candidates: readonly T[],
  extractValue: (candidate: T) => V,
  label: string
): V | null {
  if (candidates.length === 0) {
    return null;
  }
  const first = candidates[0];
  if (first === undefined) {
    return null;
  }
  const values = new Set(candidates.map(extractValue));
  if (values.size === 1) {
    return extractValue(first);
  }
  const decisive = decisiveByAdmissionOrdinal(candidates, label);
  return decisive === null ? null : extractValue(decisive);
}
