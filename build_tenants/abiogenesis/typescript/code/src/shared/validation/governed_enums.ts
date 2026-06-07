// Single source of truth for the governed control-mode / until enums.
//
// Extracted verbatim from the request-admission gates so the start-intent gate
// (`abg/m03/admission/carriers.ts`), the public-start control-mode gate
// (`app/m04/admission/public_start.ts`), and the lever-override admitter all
// validate against ONE allowed-set. This is a leaf module: it imports only
// `./primitives.js` and is importable everywhere without a cycle.

import { parseNonEmptyString, parseString } from "./primitives.js";

export type UntilValue = "first_traversal" | "blocked" | "converged";
export type FhModeValue = "direct" | "human-proxy";
export type RootModeValue = "direct" | "supervised";

export const UNTIL_VALUES: readonly UntilValue[] = Object.freeze([
  "first_traversal",
  "blocked",
  "converged"
]);
export const FH_MODE_VALUES: readonly FhModeValue[] = Object.freeze([
  "direct",
  "human-proxy"
]);
export const ROOT_MODE_VALUES: readonly RootModeValue[] = Object.freeze([
  "direct",
  "supervised"
]);

// `until` uses parseString (not parseNonEmptyString) to preserve the exact
// behavior of the start-intent gate it was extracted from.
export function parseUntil(input: unknown, label: string): UntilValue {
  const until = parseString(input, label);
  if (
    until !== "first_traversal" &&
    until !== "blocked" &&
    until !== "converged"
  ) {
    throw new TypeError(
      `${label}: expected "first_traversal", "blocked", or "converged", got ${JSON.stringify(until)}`
    );
  }
  return until;
}

export function parseFhMode(input: unknown, label: string): FhModeValue {
  const mode = parseNonEmptyString(input, label);
  if (mode === "direct" || mode === "human-proxy") {
    return mode;
  }
  throw new TypeError(
    `${label}: expected "direct" or "human-proxy", got ${JSON.stringify(mode)}`
  );
}

export function parseRootMode(input: unknown, label: string): RootModeValue {
  const mode = parseNonEmptyString(input, label);
  if (mode === "direct" || mode === "supervised") {
    return mode;
  }
  throw new TypeError(
    `${label}: expected "direct" or "supervised", got ${JSON.stringify(mode)}`
  );
}
