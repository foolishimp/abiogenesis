export function freezeNativeValue<T>(
  input: T,
  ancestors = new Set<object>()
): T {
  if (typeof input !== "object" || input === null || ancestors.has(input)) {
    return input;
  }
  ancestors.add(input);
  try {
    for (const key of Reflect.ownKeys(input)) {
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      if (descriptor !== undefined && "value" in descriptor) {
        freezeNativeValue(descriptor.value, ancestors);
      }
    }
    if (!Object.isFrozen(input)) {
      Object.freeze(input);
    }
    return input;
  } finally {
    ancestors.delete(input);
  }
}
