import { createHash } from "node:crypto";

import {
  compareUnicodeCodeUnits,
  writeCanonicalJson,
  type JsonValue,
} from "../canonical_json.js";
import type { Sha256Digest } from "../digests.js";

/** An explicit synchronous sink for canonical JSON text parts. */
export type CanonicalJsonSink = (part: string) => void;

/** The record member of `JsonValue`. */
export type JsonRecord = { readonly [key: string]: JsonValue };

/**
 * Writes one canonical JSON object: members in UTF-16 code-unit order of
 * their keys, each key as its JSON string, each member by `writeMember`. A
 * sink or member-writer exception propagates after partial output; partial
 * output is not a complete encoding.
 */
export function writeCanonicalRecord<T>(
  entries: readonly (readonly [string, T])[],
  writeMember: (member: T, key: string, sink: CanonicalJsonSink) => void,
  sink: CanonicalJsonSink,
): void {
  const ordered = [...entries].sort(([left], [right]) =>
    compareUnicodeCodeUnits(left, right)
  );
  sink("{");
  for (let index = 0; index < ordered.length; index += 1) {
    const [key, member] = ordered[index]!;
    if (index !== 0) sink(",");
    sink(JSON.stringify(key));
    sink(":");
    writeMember(member, key, sink);
  }
  sink("}");
}

/**
 * The SHA-256 digest of a record's canonical JSON text; equal to
 * `sha256Canonical(value)`. A caller holding `unknown` admits it through
 * `admitJson` and selects the record member with `isRecord` first.
 */
export function canonicalRecordDigest(value: JsonRecord): Sha256Digest {
  const hash = createHash("sha256");
  writeCanonicalRecord(
    Object.entries(value),
    (member, _key, sink) => { writeCanonicalJson(member, sink); },
    (part) => { hash.update(part); },
  );
  return `sha256:${hash.digest("hex")}`;
}
