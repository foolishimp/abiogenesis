export type JsonValue = boolean | null | number | string | readonly JsonValue[] | {
    readonly [key: string]: JsonValue;
};
export declare function compareUnicodeCodeUnits(left: string, right: string): number;
export declare function canonicalJson(value: JsonValue): string;
/** One byte-compatible traversal for collected text and incremental sinks. */
export declare function writeCanonicalJson(value: JsonValue, write: (part: string) => void): void;
