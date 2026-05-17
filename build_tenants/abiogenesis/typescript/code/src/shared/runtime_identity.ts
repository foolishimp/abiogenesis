import { createHash } from "node:crypto";

export function stableJson(input: unknown): string {
  if (input === null || typeof input !== "object") {
    return JSON.stringify(input);
  }
  if (Array.isArray(input)) {
    return `[${input.map((entry) => stableJson(entry)).join(",")}]`;
  }
  const entries = Object.entries(input).sort(([left], [right]) =>
    left.localeCompare(right)
  );
  return `{${entries
    .map(([key, value]) => `${JSON.stringify(key)}:${stableJson(value)}`)
    .join(",")}}`;
}

export function sha256HexForText(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function sha256DigestForText(content: string): string {
  return `sha256:${sha256HexForText(content)}`;
}

export function stableSha256HexDigest(input: unknown): string {
  return sha256HexForText(stableJson(input));
}

export function stableSha256Digest(input: unknown): string {
  return sha256DigestForText(stableJson(input));
}

export function stableJsonEquals(left: unknown, right: unknown): boolean {
  return stableJson(left) === stableJson(right);
}
