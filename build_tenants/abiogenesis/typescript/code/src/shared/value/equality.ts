import {
  canonicalJson,
  writeCanonicalJson,
  type JsonValue,
} from "../canonical_json.js";

/**
 * Canonical equality over `JsonValue`: true exactly when `canonicalJson(left)`
 * and `canonicalJson(right)` are the same text. The left text is built once
 * and the right side is streamed against it, so no second full string is
 * allocated. Both sides are always written in full: an encoding failure on
 * either side propagates as it does from `canonicalJson`, and there is no
 * identity shortcut. A caller holding `unknown` admits each side through
 * `admitJson` first.
 */
export function canonicalEquals(left: JsonValue, right: JsonValue): boolean {
  const text = canonicalJson(left);
  let offset = 0;
  let equal = true;
  writeCanonicalJson(right, (part) => {
    if (!equal) return;
    if (text.startsWith(part, offset)) offset += part.length;
    else equal = false;
  });
  return equal && offset === text.length;
}
