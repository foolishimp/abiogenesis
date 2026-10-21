import type { JsonValue } from "../canonical_json.js";
import type { StructuralRefusal } from "../refusal.js";

/** The `validate` stage's refusal constructor, private to `shared/admit/`. */
export function validateRefusal(
  code: string,
  path: readonly string[],
  evidence: Readonly<Record<string, JsonValue>>,
): StructuralRefusal {
  return Object.freeze({
    kind: "structural_refusal" as const,
    stage: "validate" as const,
    code,
    path: Object.freeze([...path]),
    evidence: Object.freeze({ ...evidence }),
  });
}
