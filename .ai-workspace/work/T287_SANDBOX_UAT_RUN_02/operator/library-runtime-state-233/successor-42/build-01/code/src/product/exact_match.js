export function resolveExactMatch(values, predicate) {
    const matches = values.filter(predicate);
    if (matches.length === 0)
        return Object.freeze({ kind: "absent" });
    if (matches.length === 1) {
        return Object.freeze({ kind: "one", value: matches[0] });
    }
    return Object.freeze({
        kind: "many",
        values: Object.freeze([...matches]),
    });
}
