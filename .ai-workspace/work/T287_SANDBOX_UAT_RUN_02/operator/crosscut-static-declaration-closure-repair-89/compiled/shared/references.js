export function isNonBlankRef(value) {
    return typeof value === "string" && value.trim().length > 0;
}
export function requireRef(value, label) {
    if (!isNonBlankRef(value)) {
        throw new TypeError(`${label} must be a non-empty string`);
    }
    return value;
}
