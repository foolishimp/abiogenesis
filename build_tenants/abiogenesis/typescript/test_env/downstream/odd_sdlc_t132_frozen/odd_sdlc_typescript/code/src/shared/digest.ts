import { createHash } from "node:crypto";

export function sha256Text(content: string): string {
  return `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;
}

export function sha256Digest(content: string): string {
  return sha256Text(content);
}

export function sha256JsonDigest(payload: unknown): string {
  return sha256Text(JSON.stringify(payload));
}

export function digestRef(input: {
  readonly namespace: string;
  readonly digest: string;
}): string {
  return `${input.namespace}/${input.digest}`;
}
