import * as v from "valibot";

import { ok, type Outcome } from "../refusal.js";
import { validateRefusal } from "./validate_refusal.js";

/**
 * Strict contract admission: the owner's Valibot schema decides; the admitted
 * value is the schema's output. A refusal names the first issue's path.
 */
export function admitContract<T>(
  schema: v.GenericSchema<T, T>,
  raw: unknown,
): Outcome<T> {
  const result = v.safeParse(schema, raw);
  if (result.success) return ok(result.output);
  const [issue] = result.issues;
  return validateRefusal(
    "contract_mismatch",
    issue.path?.map((item) => String(item.key)) ?? [],
    { issue: issue.type, message: issue.message },
  );
}

/** A reference is a string with at least one non-whitespace character. */
export function admitRef(value: unknown): Outcome<string> {
  return typeof value === "string" && value.trim().length > 0
    ? ok(value)
    : validateRefusal("blank_ref", [], {});
}
