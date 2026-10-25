import * as v from "valibot";

import { ok, type Outcome } from "../refusal.js";
import { admitJson, thrownClass } from "./json.js";
import { validateRefusal } from "./validate_refusal.js";

/**
 * Strict contract admission in the gate form. `admitJson` admits the raw first:
 * an I-JSON refusal is `contract_mismatch` at its member's path, its code the
 * issue. The owner's Valibot schema then decides over the original raw, so a
 * schema that checks identity sees the caller's value, and after the gate no
 * code of the raw runs: no member is an accessor and no container is a Proxy,
 * over `admitJson`'s declared domain. The admitted value is the schema's output.
 * Every refusal is `contract_mismatch`: a throw from the schema names the thrown
 * class, and otherwise the first issue's path.
 */
export function admitContract<T>(
  schema: v.GenericSchema<T, T>,
  raw: unknown,
): Outcome<T> {
  const gate = admitJson(raw);
  if (gate.kind !== "ok") {
    return validateRefusal("contract_mismatch", gate.path, { issue: gate.code, message: gate.evidence.reason ?? null });
  }
  try {
    const result = v.safeParse(schema, raw);
    if (result.success) return ok(result.output);
    const [issue] = result.issues;
    return validateRefusal(
      "contract_mismatch",
      issue.path?.map((item) => String(item.key)) ?? [],
      { issue: issue.type, message: issue.message },
    );
  } catch (thrown) {
    // The thrown value's class only: none of its members is read.
    const thrownBy = thrownClass(thrown);
    return validateRefusal("contract_mismatch", [], { issue: thrownBy, message: `the contract schema threw ${thrownBy}` });
  }
}

/** A reference is a string with at least one non-whitespace character. */
export function admitRef(value: unknown): Outcome<string> {
  return typeof value === "string" && value.trim().length > 0
    ? ok(value)
    : validateRefusal("blank_ref", [], {});
}
