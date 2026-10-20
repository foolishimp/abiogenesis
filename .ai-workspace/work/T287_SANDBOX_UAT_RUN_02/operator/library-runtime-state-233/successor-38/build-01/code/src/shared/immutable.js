export function deepFreeze(value) {
    if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
        return value;
    }
    for (const child of Object.values(value)) {
        deepFreeze(child);
    }
    return Object.freeze(value);
}
export function isDeeplyFrozen(value, visited = new Set()) {
    if (typeof value !== "object" || value === null)
        return true;
    if (!Object.isFrozen(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== null && prototype !== Object.prototype && prototype !== Array.prototype)
        return false;
    if (visited.has(value))
        return true;
    visited.add(value);
    return Reflect.ownKeys(value).every((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        return descriptor !== undefined && Object.hasOwn(descriptor, "value") &&
            isDeeplyFrozen(descriptor.value, visited);
    });
}
