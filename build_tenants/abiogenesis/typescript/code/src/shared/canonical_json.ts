export type JsonValue =
  | boolean
  | null
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export function compareUnicodeCodeUnits(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function canonicalJson(value: JsonValue): string {
  const parts: string[] = [];
  writeCanonicalJson(value, (part) => { parts.push(part); });
  return parts.join("");
}

/** One byte-compatible traversal for collected text and incremental sinks. */
export function writeCanonicalJson(value: JsonValue, write: (part: string) => void): void {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    write(JSON.stringify(value));
    return;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("canonical JSON does not admit non-finite numbers");
    }
    write(Object.is(value, -0) ? "0" : JSON.stringify(value));
    return;
  }

  if (Array.isArray(value)) {
    write("[");
    // map snapshots length and skips holes; join still emits their separators.
    const length = value.length;
    for (let index = 0; index < length; index += 1) {
      if (index !== 0) write(",");
      if (index in value) writeCanonicalJson(value[index]!, write);
    }
    write("]");
    return;
  }

  const entries = Object.entries(value).sort(([left], [right]) =>
    compareUnicodeCodeUnits(left, right)
  );
  write("{");
  for (let index = 0; index < entries.length; index += 1) {
    const [key, entry] = entries[index]!;
    if (index !== 0) write(",");
    write(JSON.stringify(key));
    write(":");
    writeCanonicalJson(entry, write);
  }
  write("}");
}
