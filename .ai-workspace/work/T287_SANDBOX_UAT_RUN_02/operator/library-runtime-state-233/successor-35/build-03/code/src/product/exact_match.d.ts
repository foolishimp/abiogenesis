export type ExactMatch<T> = Readonly<{
    kind: "absent";
}> | Readonly<{
    kind: "one";
    value: T;
}> | Readonly<{
    kind: "many";
    values: readonly T[];
}>;
export declare function resolveExactMatch<T>(values: readonly T[], predicate: (value: T) => boolean): ExactMatch<T>;
