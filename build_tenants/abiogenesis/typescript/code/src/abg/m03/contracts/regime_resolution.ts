// Implements: T-135
// Implements: REQ-L-GTL3-GRAPHVECTOR-017
// Implements: REQ-L-GTL3-GRAPHVECTOR-018
// Implements: REQ-R-ABG3-FN-COMPOSITION

import type {
  EffectiveVectorRegime,
  EffectiveVectorRegimeSource,
  ExecutionBasis,
  RuntimeRegime
} from "./carriers.js";
import type {
  GraphVector,
  SerializedAttrs,
  SerializedAttrValue
} from "../../../gtl/m01/contracts/carriers.js";
import {
  assertVectorIndexInRange,
  freezeStringArray,
  vectorEdge
} from "./runtime_support.js";

export const VECTOR_RUNTIME_REGIME_DECLARATION_KEY = "abg.runtime_regime";

function attrValueForKey(
  attrs: SerializedAttrs,
  key: string
): SerializedAttrValue | null {
  const matching = attrs.entries.filter((entry) => entry.key === key);
  if (matching.length > 1) {
    throw new TypeError(`Duplicate vector runtime regime declaration ${key}`);
  }
  return matching[0]?.value ?? null;
}

function runtimeRegimeFromString(input: string, label: string): RuntimeRegime {
  if (input === "F_D" || input === "F_P" || input === "F_H") {
    return input;
  }
  throw new TypeError(`${label}: unsupported runtime regime ${input}`);
}

function optionalDeclaredRuntimeRegime(
  vector: GraphVector
): { readonly regime: RuntimeRegime; readonly key: string } | null {
  const value = attrValueForKey(
    vector.declarations,
    VECTOR_RUNTIME_REGIME_DECLARATION_KEY
  );
  if (value === null) {
    return null;
  }
  if (value.kind !== "scalar" || typeof value.value !== "string") {
    throw new TypeError(
      `${VECTOR_RUNTIME_REGIME_DECLARATION_KEY} must be a scalar runtime regime`
    );
  }
  return Object.freeze({
    regime: runtimeRegimeFromString(
      value.value,
      VECTOR_RUNTIME_REGIME_DECLARATION_KEY
    ),
    key: VECTOR_RUNTIME_REGIME_DECLARATION_KEY
  });
}

function uniqueVectorRuntimeRegimes(
  vector: GraphVector
): readonly RuntimeRegime[] {
  const regimes = new Set<RuntimeRegime>();
  for (const operator of vector.operators) {
    regimes.add(operator.regime);
  }
  for (const evaluator of vector.evaluators) {
    regimes.add(evaluator.regime);
  }
  return Object.freeze([...regimes].sort());
}

function constructEffectiveVectorRegime(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly regime: RuntimeRegime;
  readonly source: EffectiveVectorRegimeSource;
  readonly sourceRef: string;
  readonly declarationKey: string | null;
  readonly declaredVectorRegimes: readonly RuntimeRegime[];
  readonly diagnosticRefs?: readonly string[] | undefined;
}): EffectiveVectorRegime {
  return Object.freeze({
    kind: "effective_vector_regime",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    regime: input.regime,
    source: input.source,
    sourceRef: input.sourceRef,
    declarationKey: input.declarationKey,
    declaredVectorRegimes: Object.freeze([...input.declaredVectorRegimes]),
    diagnosticRefs: freezeStringArray(input.diagnosticRefs ?? Object.freeze([]))
  } satisfies EffectiveVectorRegime);
}

export function deriveEffectiveVectorRegime(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
}): EffectiveVectorRegime {
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError("Effective vector regime requires a graph vector");
  }
  const declaredVectorRegimes = uniqueVectorRuntimeRegimes(vector);
  const explicit = optionalDeclaredRuntimeRegime(vector);
  if (explicit !== null) {
    if (
      declaredVectorRegimes.length > 0 &&
      !declaredVectorRegimes.includes(explicit.regime)
    ) {
      throw new TypeError(
        `Vector ${JSON.stringify(vector.id)} declares ${explicit.regime} but its operators/evaluators declare ${declaredVectorRegimes.join(",")}`
      );
    }
    return constructEffectiveVectorRegime({
      basis: input.basis,
      vectorIndex: input.vectorIndex,
      regime: explicit.regime,
      source: "graph_vector_declaration",
      sourceRef: `${vector.id}#${explicit.key}`,
      declarationKey: explicit.key,
      declaredVectorRegimes
    });
  }
  if (declaredVectorRegimes.length === 1) {
    const regime = declaredVectorRegimes[0];
    if (regime === undefined) {
      throw new TypeError("single declared vector regime was not present");
    }
    return constructEffectiveVectorRegime({
      basis: input.basis,
      vectorIndex: input.vectorIndex,
      regime,
      source: "graph_vector_runtime_surface",
      sourceRef: `${vector.id}#operators/evaluators`,
      declarationKey: null,
      declaredVectorRegimes
    });
  }
  if (
    declaredVectorRegimes.length > 1 &&
    !declaredVectorRegimes.includes(input.basis.resolvedPolicy.defaultRegime)
  ) {
    throw new TypeError(
      `Vector ${JSON.stringify(vector.id)} has mixed runtime regimes ${declaredVectorRegimes.join(",")} but basis default ${input.basis.resolvedPolicy.defaultRegime} is not one of them`
    );
  }
  return constructEffectiveVectorRegime({
    basis: input.basis,
    vectorIndex: input.vectorIndex,
    regime: input.basis.resolvedPolicy.defaultRegime,
    source: "basis_default_policy",
    sourceRef: input.basis.resolvedPolicy.resolvedPolicyBundleRef,
    declarationKey: null,
    declaredVectorRegimes,
    diagnosticRefs:
      declaredVectorRegimes.length > 1
        ? Object.freeze(["mixed_vector_regimes_selected_by_basis_policy"])
        : Object.freeze([])
  });
}
