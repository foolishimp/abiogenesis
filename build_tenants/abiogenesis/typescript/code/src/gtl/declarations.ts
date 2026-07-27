import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { requireRef } from "../shared/references.js";
import { COMPUTE_REGIME_VALUES } from "./c_algebra.js";
import type {
  EvaluatorDeclaration,
  RuleDeclaration,
} from "./contracts.js";

function freezeStrings(values: readonly string[], label: string): readonly string[] {
  if (values.some((value) => value.trim().length === 0)) {
    throw new TypeError(`${label} cannot contain an empty reference`);
  }
  return Object.freeze([...values]);
}

function cloneJsonObject(
  value: Readonly<Record<string, JsonValue>>,
): Readonly<Record<string, JsonValue>> {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    throw new TypeError("Rule.config must be one JSON object");
  }
  return JSON.parse(canonicalJson(value)) as Readonly<Record<string, JsonValue>>;
}

export function evaluatorDeclaration(
  input: Readonly<EvaluatorDeclaration>,
): EvaluatorDeclaration {
  requireRef(input.name, "Evaluator.name");
  requireRef(input.binding, "Evaluator.binding");
  if (!COMPUTE_REGIME_VALUES.includes(input.regime)) {
    throw new TypeError("Evaluator.regime must be F_D, F_P, or F_H");
  }
  return deepFreeze({
    name: input.name,
    regime: input.regime,
    description: input.description,
    binding: input.binding,
    consumedFieldRefs: freezeStrings(
      input.consumedFieldRefs,
      "Evaluator.consumedFieldRefs",
    ),
    tags: freezeStrings(input.tags, "Evaluator.tags"),
  });
}

export function ruleDeclaration(
  input: Readonly<RuleDeclaration>,
): RuleDeclaration {
  requireRef(input.name, "Rule.name");
  requireRef(input.kind, "Rule.kind");
  return deepFreeze({
    name: input.name,
    kind: input.kind,
    config: cloneJsonObject(input.config),
    tags: freezeStrings(input.tags, "Rule.tags"),
  });
}
