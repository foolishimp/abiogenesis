import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { writeCanonicalJson, compareUnicodeCodeUnits, } from "./canonical_json.js";
export function sha256Bytes(value) {
    return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
export async function sha256File(path) {
    return sha256Bytes(await readFile(path));
}
export function sha256Canonical(value) {
    const hash = createHash("sha256");
    writeCanonicalJson(value, (part) => { hash.update(part); });
    return `sha256:${hash.digest("hex")}`;
}
export function payloadInventoryDigest(rows) {
    const canonicalRows = [...rows]
        .sort((left, right) => compareUnicodeCodeUnits(left.path, right.path))
        .map(({ path, sha256 }) => ({ path, sha256 }));
    return sha256Canonical(canonicalRows);
}
export function isSha256Digest(value) {
    return typeof value === "string" && /^sha256:[0-9a-f]{64}$/.test(value);
}
