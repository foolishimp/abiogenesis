import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { canonicalJson, type JsonValue } from "./canonical_json.js";

export type Sha256Digest = `sha256:${string}`;

export interface PayloadInventoryRow {
  readonly path: string;
  readonly sha256: Sha256Digest;
}

export function compareCodeUnits(left: string, right: string): number {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const difference = left.charCodeAt(index) - right.charCodeAt(index);
    if (difference !== 0) return difference;
  }
  return left.length - right.length;
}

export function sha256Bytes(value: Uint8Array | string): Sha256Digest {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export async function sha256File(path: string): Promise<Sha256Digest> {
  return sha256Bytes(await readFile(path));
}

export function sha256Canonical(value: JsonValue): Sha256Digest {
  return sha256Bytes(canonicalJson(value));
}

export function payloadInventoryDigest(
  rows: readonly PayloadInventoryRow[],
): Sha256Digest {
  const canonicalRows = [...rows]
    .sort((left, right) => compareCodeUnits(left.path, right.path))
    .map(({ path, sha256 }) => ({ path, sha256 }));
  return sha256Canonical(canonicalRows);
}

export function isSha256Digest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[0-9a-f]{64}$/.test(value);
}
