# REQ-L-GTL2-HOF — Higher-Order Graph Operations

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-006
**Wave**: 2

---

## Purpose

GTL 2.x supports higher-order graph programming over graph functions: fan-out, fan-in, gating, and promotion.

## Acceptance Criteria

**REQ-L-GTL2-HOF-001**: `fan_out(f)` shall apply a graph function across a collection/vector, materializing branching execution structure.

**REQ-L-GTL2-HOF-002**: `fan_in(r)` shall reduce branch outputs into one synthesized result.

**REQ-L-GTL2-HOF-003**: `gate(g)` shall require a gate before continuation or promotion. Consensus belongs here. Gate applies rules and/or evaluators to control flow.

**REQ-L-GTL2-HOF-004**: `promote(p)` shall lift one representation into another (event to vector, vector to branches, branch outputs to synthesized context).

**REQ-L-GTL2-HOF-005**: All higher-order operations shall preserve interface/type truth.

**REQ-L-GTL2-HOF-006**: Higher-order graph materialization (fan-out, promote) may depend on collection cardinality via `Vector[T]` node schema. `Vector[T]` is the semantic foundation for cardinality-sensitive graph materialization, not a separate structural concept.

**REQ-L-GTL2-HOF-007**: Higher-order operations shall be lawful graph-function combinators, not hidden planner or interpreter heuristics.

**REQ-L-GTL2-HOF-008**: The same higher-order vector operators may be used to expose explicit evaluator-result vectors or candidate-result vectors over a contract boundary. GTL declares the topology only; domains supply the evaluation or merge semantics.

**REQ-L-GTL2-HOF-009**: A higher-order reduction or harvest boundary shall be able to declare that multiple branch or candidate results are collected for explicit merge, reduction, ranking, or selection by domain-defined logic. GTL declares the boundary and vector shape; it does not own the merge semantics.
