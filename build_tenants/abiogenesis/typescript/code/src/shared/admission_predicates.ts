import type { JsonValue } from "./canonical_json.js";

// Record shape and exact own key sets are owned by the `validate` family in
// `shared/admit/`; this module re-exports them for existing importers. The
// string predicates below are not part of that family.
export { hasExactKeys, isRecord } from "./admit/record.js";

export function isNonblankNulFreeString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 &&
    !value.includes("\0");
}

export function isNonEmptyJsonString(value: JsonValue | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

export function isNonblankString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
