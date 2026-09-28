export function compareUnicodeCodeUnits(left, right) {
    return left < right ? -1 : left > right ? 1 : 0;
}
export function canonicalJson(value) {
    if (value === null || typeof value === "boolean" || typeof value === "string") {
        return JSON.stringify(value);
    }
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw new TypeError("canonical JSON does not admit non-finite numbers");
        }
        return Object.is(value, -0) ? "0" : JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`;
    }
    const entries = Object.entries(value).sort(([left], [right]) => compareUnicodeCodeUnits(left, right));
    return `{${entries
        .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
        .join(",")}}`;
}
