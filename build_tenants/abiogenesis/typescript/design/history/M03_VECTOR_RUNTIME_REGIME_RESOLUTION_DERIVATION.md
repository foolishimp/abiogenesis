# M03 Vector Runtime Regime Resolution Derivation

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-135
**Purpose**: Define how ABG selects the effective runtime regime for one graph
vector without allowing a basis-wide default to override vector-local GTL truth.

## Source Authority

- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`
- `specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md`
- `build_tenants/abiogenesis/typescript/design/M03_ABG_FN_COMPOSITION_DERIVATION.md`
- [T-135](../../../../.ai-workspace/tickets/completed/T-135-resolve-vector-local-runtime-regimes-for-mixed-construction-traversal.md)

## Problem

The ABG runner previously selected traversal behavior from
`ExecutionBasis.resolvedPolicy.defaultRegime`. That basis-wide field is lawful
policy fallback, but it is too coarse for construction graphs that need one
`F_P` construction vector followed by deterministic `F_D` projection or
validation vectors.

The defect is not that `defaultRegime` exists. The defect is that it could
silently override graph-vector truth.

## Decision

ABG derives an `EffectiveVectorRegime` for the next vector before constructing
an advancement transition.

Resolution order:

1. `GraphVector.declarations["abg.runtime_regime"]` when present.
2. Homogeneous vector-local operator/evaluator regime when all declared
   operator/evaluator regimes agree.
3. `ExecutionBasis.resolvedPolicy.defaultRegime` only when the vector has no
   local regime surface or when a mixed vector declares multiple regime
   participants and the basis default selects one of those declared
   participants.

Malformed, duplicate, unsupported, or contradictory vector-local declarations
fail closed. A homogeneous `F_P` or `F_H` vector cannot be forced to `F_D` by a
basis default. A selected `F_P` vector still requires `dispatchRef`; a selected
`F_H` vector still requires `approvalSubjectRef`.

## Contract

```ts
interface EffectiveVectorRegime {
  kind: "effective_vector_regime";
  basisId: string;
  graphFunctionId: string;
  vectorIndex: number;
  edge: string;
  regime: "F_D" | "F_P" | "F_H";
  source:
    | "graph_vector_declaration"
    | "graph_vector_runtime_surface"
    | "basis_default_policy";
  sourceRef: string;
  declarationKey: string | null;
  declaredVectorRegimes: readonly ("F_D" | "F_P" | "F_H")[];
  diagnosticRefs: readonly string[];
}
```

`VectorTraversalPlannedEvent` records the selected regime, source, source ref,
and diagnostic refs. Replay therefore observes the same selected regime that the
runner used to choose `fd_advance`, `fp_dispatch`, or `fh_escalation`.

## Closure Rules

- A vector-local runtime regime declaration must be scalar and one of
  `F_D`, `F_P`, or `F_H`.
- Duplicate `abg.runtime_regime` declarations fail closed.
- A declaration that contradicts the vector's operator/evaluator regime surface
  fails closed.
- A homogeneous vector-local operator/evaluator regime wins over basis default.
- A mixed vector without explicit declaration can use basis default only when
  the default is one of the vector's declared regime participants.
- `F_P` requires dispatch authority.
- `F_H` requires approval subject authority.
- Prompt text, edge names, file names, and current config do not participate in
  regime selection.

## Implementation Map

- `code/src/abg/m03/contracts/regime_resolution.ts` owns the pure
  `deriveEffectiveVectorRegime` kernel.
- `code/src/abg/m03/contracts/iteration.ts` consumes
  `EffectiveVectorRegime` to choose advancement transitions.
- `code/src/abg/m03/contracts/event_factories.ts` emits selected regime truth
  on `vector_traversal_planned`.
- `test_env/tests/test_t135_vector_local_runtime_regime.test.mjs` proves mixed
  `F_P` then `F_D` traversal, explicit `F_H` routing, missing authority
  rejection, contradiction rejection, and replay advance.

## Non-Goals

This slice does not implement the full `abg.fn_composition` parser or typed
export surface. It binds vector-local regime selection to the completed T-134
grammar and leaves broader composition parsing to the dependent substrate work.
