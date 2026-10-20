import { compareUnicodeCodeUnits } from "./canonical_json.js";
// Stateless shallow mechanics. Record variants preserve their caller domains and
// refinements; none validates record members. NUL-joined variants intentionally
// retain their existing delimiter collisions and are not exact key-set checks.
export function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function hasNulJoinedKeys(value, keys) {
    return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}
export function isJsonRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function isJsonRecordShape(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function isOptionalJsonRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function isNonblankNulFreeString(value) {
    return typeof value === "string" && value.trim().length > 0 &&
        !value.includes("\0");
}
export function hasObjectUnicodeNulJoinedKeys(value, keys) {
    return Object.keys(value).sort(compareUnicodeCodeUnits).join("\0") ===
        [...keys].sort(compareUnicodeCodeUnits).join("\0");
}
export function isNonEmptyJsonString(value) {
    return typeof value === "string" && value.length > 0;
}
export function hasJsonNulJoinedKeys(value, keys) {
    return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}
export function isMutableRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function hasNulJoinedFields(value, fields) {
    return Object.keys(value).sort().join("\0") === [...fields].sort().join("\0");
}
export function isNonblankString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
export function hasUnicodeNulJoinedKeys(value, keys) {
    return Object.keys(value).sort(compareUnicodeCodeUnits).join("\0") ===
        [...keys].sort(compareUnicodeCodeUnits).join("\0");
}
export function hasExactKeys(value, expected) {
    const actual = Object.keys(value).sort();
    const sortedExpected = [...expected].sort();
    return actual.length === sortedExpected.length &&
        actual.every((key, index) => key === sortedExpected[index]);
}
export function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
}
export function hasExactJsonKeys(value, expected) {
    const keys = Object.keys(value).sort();
    const expectedKeys = [...expected].sort();
    return keys.length === expectedKeys.length &&
        keys.every((key, index) => key === expectedKeys[index]);
}
