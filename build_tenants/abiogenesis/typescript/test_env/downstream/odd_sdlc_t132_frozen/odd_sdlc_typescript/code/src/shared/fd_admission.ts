// Implements: B-086

import {
  parseEnumValue,
  parseNonEmptyString
} from "./validation.js";

export function admitExactProtocolString(input: {
  readonly value: unknown;
  readonly label: string;
  readonly expected: string;
}): string {
  const value = parseNonEmptyString(input.value, input.label);
  if (value !== input.expected) {
    throw new TypeError(`${input.label}: unexpected protocol value`);
  }
  return value;
}

export function admitExactProtocolVersion(input: {
  readonly value: unknown;
  readonly label: string;
  readonly expected: string;
}): string {
  const value = parseNonEmptyString(input.value, input.label);
  if (value !== input.expected) {
    throw new TypeError(`${input.label}: unsupported version`);
  }
  return value;
}

export function admitExactContractEnum<T extends string>(
  input: {
    readonly value: unknown;
    readonly label: string;
    readonly values: readonly T[];
  }
): T {
  return parseEnumValue(input.value, input.label, input.values);
}
