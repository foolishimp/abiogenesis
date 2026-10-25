import { types } from "node:util";

import * as v from "valibot";

import { ok, type Outcome } from "../refusal.js";
import { admitJson, thrownClass } from "./json.js";
import { validateRefusal } from "./validate_refusal.js";

/**
 * Strict contract admission: the owner's Valibot schema decides; the admitted
 * value is the schema's output. Every refusal is `contract_mismatch`: a raw
 * that is a Proxy is refused before the schema reads it, a throw from the
 * schema names the thrown class, and otherwise the first issue's path. The
 * schema reads the caller's own value, so a schema that checks identity sees
 * it; a getter or a Proxy below the root runs when the schema reads it.
 */
export function admitContract<T>(
  schema: v.GenericSchema<T, T>,
  raw: unknown,
): Outcome<T> {
  if (types.isProxy(raw)) {
    return validateRefusal("contract_mismatch", [], { issue: "non_ijson_value", message: "a Proxy is not I-JSON" });
  }
  return parseContract(schema, raw);
}

/**
 * I-JSON contract admission: `admitJson` first, then the schema over the
 * detached, frozen value it returns, so no getter or trap of the raw runs. An
 * I-JSON refusal is `contract_mismatch` at its member's path, its code the
 * issue; a throw from the schema names the thrown class.
 */
export function admitJsonContract<T>(
  schema: v.GenericSchema<T, T>,
  raw: unknown,
): Outcome<T> {
  const admitted = admitJson(raw);
  if (admitted.kind !== "ok") {
    return validateRefusal("contract_mismatch", admitted.path, { issue: admitted.code, message: admitted.evidence.reason ?? null });
  }
  return parseContract(schema, admitted.value);
}

function parseContract<T>(schema: v.GenericSchema<T, T>, raw: unknown): Outcome<T> {
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
