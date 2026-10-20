import type { RuntimeEvent } from "./event_store.js";
/** Disposable computation territory, never event or durable authority. Each
 * owner key names its one ordered relation. A rollback abandons the territory. */
export declare class RuntimeDerivationScope {
    #private;
    accepts(events: readonly RuntimeEvent[]): boolean;
    invalidate(): void;
    owner<T>(key: symbol, construct: () => T): T;
}
export declare class RuntimeDerivationSource {
    #private;
    invalidate(): void;
    snapshot(events: readonly RuntimeEvent[]): readonly RuntimeEvent[];
    append(events: readonly RuntimeEvent[], suffix: readonly RuntimeEvent[]): readonly RuntimeEvent[];
    prefix(events: readonly RuntimeEvent[], length: number): readonly RuntimeEvent[];
    hasPrefix(events: readonly RuntimeEvent[], prefix: readonly RuntimeEvent[]): boolean;
    scope(key: string, events: readonly RuntimeEvent[]): RuntimeDerivationScope;
}
/** Exact owner snapshot identity; it does not certify payload immutability. */
export declare function ownedRuntimeDerivationSource(events: readonly RuntimeEvent[]): RuntimeDerivationSource | undefined;
export declare function runtimeDerivationSource(events: readonly RuntimeEvent[]): RuntimeDerivationSource;
