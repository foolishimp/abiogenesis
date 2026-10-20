export function isNonBlankRef(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function requireRef(value: string, label: string): string {
  if (!isNonBlankRef(value)) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}
