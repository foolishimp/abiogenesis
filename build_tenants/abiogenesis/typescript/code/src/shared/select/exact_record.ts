import { admitJson } from "../admit/json.js";
import { isRecord } from "../admit/record.js";
import type { Sha256Digest } from "../digests.js";
import type { Outcome } from "../refusal.js";
import type { ExactMatch } from "./exact_match.js";

/**
 * The owner's check of one selected record, supplied as a module constant per
 * reader. `project` is the validate leg; the digest leg consumes the projected
 * value (D2). `C` is the reader's typed context: data the call supplies (an
 * I-JSON value or a frozen owner record such as digests, a cut, a cursor or a
 * basis row), never a function. With the default `void` the check reads the
 * event alone.
 */
export type RecordCheck<E, P, C = void> = Readonly<{
  project: (event: E, context: C) => Outcome<P>;
  digest: null | Readonly<{
    expected: (event: E, value: P, context: C) => Sha256Digest;
    actual: (value: P) => Sha256Digest;
  }>;
}>;

export type CheckedRecord<E, P> =
  | Readonly<{ kind: "absent" }>
  | Readonly<{ kind: "many"; values: readonly E[] }>
  | Readonly<{ kind: "invalid"; event: E; reason: "record_projection" | "record_digest" }>
  | Readonly<{ kind: "one"; event: E; value: P }>;

const ABSENT: CheckedRecord<never, never> = Object.freeze({ kind: "absent" });

function invalid<E>(
  event: E,
  reason: "record_projection" | "record_digest",
): CheckedRecord<E, never> {
  return Object.freeze({ kind: "invalid", event, reason });
}

/**
 * `select`, then `validate`, then `derive`, composed once. With a null digest
 * the projected value must be an encodable record: a non-record singleton and
 * an unencodable record are both `invalid`. Exceptions from `project` and the
 * digest legs propagate. The context reaches both legs unchanged; a context
 * mismatch is the owner's `record_projection` or `record_digest`.
 */
export function checkExactRecord<E, P>(
  match: ExactMatch<E>,
  check: RecordCheck<E, P>,
): CheckedRecord<E, P>;
export function checkExactRecord<E, P, C>(
  match: ExactMatch<E>,
  check: RecordCheck<E, P, C>,
  context: C,
): CheckedRecord<E, P>;
export function checkExactRecord<E, P, C>(
  match: ExactMatch<E>,
  check: RecordCheck<E, P, C>,
  context?: C,
): CheckedRecord<E, P> {
  if (match.kind === "absent") return ABSENT;
  if (match.kind === "many") {
    return Object.freeze({ kind: "many", values: Object.freeze([...match.values]) });
  }
  const event = match.value;
  const projected = check.project(event, context as C);
  if (projected.kind !== "ok") {
    return invalid(event, "record_projection");
  }
  const value = projected.value;
  if (check.digest === null) {
    if (!isRecord(value) || admitJson(value).kind !== "ok") {
      return invalid(event, "record_projection");
    }
  } else if (check.digest.expected(event, value, context as C) !== check.digest.actual(value)) {
    return invalid(event, "record_digest");
  }
  return Object.freeze({ kind: "one", event, value });
}
