export function compareUnicodeCodeUnits(left, right) {
    return left < right ? -1 : left > right ? 1 : 0;
}
export function canonicalJson(value) {
    const parts = [];
    appendCanonicalJson(value, parts);
    return parts.join("");
}
function appendCanonicalJson(value, parts) {
    if (value === null || typeof value === "boolean" || typeof value === "string") {
        parts.push(JSON.stringify(value));
        return;
    }
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw new TypeError("canonical JSON does not admit non-finite numbers");
        }
        parts.push(Object.is(value, -0) ? "0" : JSON.stringify(value));
        return;
    }
    if (Array.isArray(value)) {
        parts.push("[");
        // map snapshots length and skips holes; join still emits their separators.
        const length = value.length;
        for (let index = 0; index < length; index += 1) {
            if (index !== 0)
                parts.push(",");
            if (index in value)
                appendCanonicalJson(value[index], parts);
        }
        parts.push("]");
        return;
    }
    const entries = Object.entries(value).sort(([left], [right]) => compareUnicodeCodeUnits(left, right));
    parts.push("{");
    for (let index = 0; index < entries.length; index += 1) {
        const [key, entry] = entries[index];
        if (index !== 0)
            parts.push(",");
        parts.push(JSON.stringify(key), ":");
        appendCanonicalJson(entry, parts);
    }
    parts.push("}");
}
