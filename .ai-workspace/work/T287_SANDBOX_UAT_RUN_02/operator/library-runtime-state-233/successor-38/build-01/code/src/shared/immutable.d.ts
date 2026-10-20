export declare function deepFreeze<T>(value: T): Readonly<T>;
export declare function isDeeplyFrozen(value: unknown, visited?: Set<object>): boolean;
