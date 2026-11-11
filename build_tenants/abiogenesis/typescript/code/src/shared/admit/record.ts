/**
 * Outer record shape. Refines only the outer shape: members stay `unknown`
 * until their owner's schema narrows them. Applied to a `JsonValue`, the
 * refinement selects its record member.
 */
export function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Exact own key set: the own enumerable string keys of `value`
 * (`Object.keys`) equal `keys` as a set. Both sides sort in one ordering, the
 * default string sort (UTF-16 code-unit order, the order of
 * `compareUnicodeCodeUnits`), and compare element by element; own keys are
 * distinct, so this is set equality, a repeated expected key never matches,
 * and a key containing NUL never collides with two keys.
 */
export function hasExactKeys(value: object, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length &&
    actual.every((key, index) => key === expected[index]);
}

/**
 * @internal Exact own data fields: every own key (`Reflect.ownKeys`) is a
 * string, the own keys equal `fields` as a set, and each is an enumerable data
 * property. A symbol, non-enumerable or accessor member refuses.
 */
export function hasExactDataFields(value: object, fields: readonly string[]): boolean {
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== "string")) return false;
  const actual = (keys as string[]).sort();
  const expected = [...fields].sort();
  return actual.length === expected.length &&
    actual.every((key, index) => key === expected[index]) &&
    actual.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return descriptor !== undefined &&
        Object.hasOwn(descriptor, "value") &&
        descriptor.enumerable === true;
    });
}
