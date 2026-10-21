# M03 Vector Runtime Regime Resolution First Slice IACS

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-135

## Irreducible Architectural Carrier Set

### `GraphVectorRegimeDeclaration`

Prime carrier role: vector-local declared runtime regime.

Current first-slice representation:

- `GraphVector.declarations["abg.runtime_regime"]`
- scalar value: `F_D`, `F_P`, or `F_H`

Why prime:

The declaration is the only direct graph-vector statement that selects a
single traversal regime independent of operator/evaluator participant lists.

### `EffectiveVectorRegime`

Prime carrier role: selected runtime regime for one execution basis and vector.

Required fields:

- basis id
- graph function id
- vector index
- edge
- selected regime
- selected source
- selected source ref
- declaration key when selected by declaration
- declared vector regime participants
- diagnostic refs

Why prime:

The runner, transition, event spine, and replay diagnostics all need the same
selected regime identity. Reconstructing this separately in the runner,
transport layer, and projection would reintroduce controller-side drift.

### `RegimeResolutionInput`

Prime carrier role: replay-derived input basis for pure resolution.

First-slice fields:

- `ExecutionBasis`
- vector index

Why prime:

Resolution must be pure over admitted GTL/runtime truth. It cannot read prompt
text, edge names, current config, or controller-local state.

### `RegimeResolutionOutcome`

Prime carrier role: the transition-facing output of regime resolution.

First-slice representation:

- `EffectiveVectorRegime`
- advancement transition discriminant:
  - `F_D` -> `fd_advance`
  - `F_P` -> `fp_dispatch`
  - `F_H` -> `fh_escalation`

Why prime:

The outcome is what makes one graph lawfully mix construction, deterministic
follow-up, and human/absentia routing without a second product-local loop.

### `RegimeResolutionDiagnostic`

Prime carrier role: typed diagnostic pressure attached to selected regime truth.

First-slice representation:

- diagnostic refs on `EffectiveVectorRegime`
- `mixed_vector_regimes_selected_by_basis_policy`

Why prime:

Mixed vectors can be lawful composition participants, but the fact that policy
selected among mixed participants must remain visible. Diagnostics are not
controller-local logs.

## Subordinate Payloads

Subordinate payloads in this slice:

- individual operator records
- individual evaluator records
- raw declaration attr entries
- policy fallback detail beyond the selected bundle ref
- transition event kind strings
- plugin input rendering

These remain subordinate unless a later ticket admits them as independent
published runtime truth.

## Effect Edges

```text
GraphVectorRegimeDeclaration
  + operator/evaluator regime participants
  + ExecutionBasis.resolvedPolicy.defaultRegime
  -> EffectiveVectorRegime
  -> AdvancementTransition
  -> VectorTraversalPlannedEvent
```

## First Slice Proof

The first slice is complete when:

- homogeneous vector-local `F_P` beats basis `F_D`;
- mixed `F_P` then `F_D` graph drains in one ABG runner;
- `F_H` vector routing is explicit and requires approval subject authority;
- missing `F_P` dispatch authority fails closed;
- duplicate or contradictory vector-local declarations fail closed;
- replay after first vector close derives the next vector's effective regime.
