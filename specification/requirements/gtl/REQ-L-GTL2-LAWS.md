# REQ-L-GTL2-LAWS — Language Laws

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-03-25
**Derives from**: INT-GTL2-001 through INT-GTL2-013
**Wave**: 1

---

## Purpose

The 18 laws that govern GTL 2.x language semantics.

## Acceptance Criteria

**REQ-L-GTL2-LAWS-001**: Graph primacy — all workflow structure is graph.

**REQ-L-GTL2-LAWS-002**: Typed node law — local graph meaning is carried by typed nodes.

**REQ-L-GTL2-LAWS-003**: Interface law — composition and substitution are only lawful when interfaces align.

**REQ-L-GTL2-LAWS-004**: Operator/evaluator separation — work and convergence are distinct concerns.

**REQ-L-GTL2-LAWS-005**: Composition associativity — lawful composition groups without changing the outer contract.

**REQ-L-GTL2-LAWS-006**: Identity graph function — an identity graph function preserves the interface.

**REQ-L-GTL2-LAWS-007**: Substitutability — interface-equivalent graph functions are interchangeable at the contract boundary.

**REQ-L-GTL2-LAWS-008**: Contract preservation — refinement may change internals but must preserve the outer contract.

**REQ-L-GTL2-LAWS-009**: Deferred refinement law — declared synthesis/refinement boundaries may change internal realized structure but must preserve the outer contract and keep strategic choice external to the interpreter.

**REQ-L-GTL2-LAWS-010**: Recursion with preserved lineage — recursive graph application preserves explainable work lineage.

**REQ-L-GTL2-LAWS-011**: Higher-order legality — fan-out, fan-in, gate, and promote must preserve interface/type truth.

**REQ-L-GTL2-LAWS-012**: Separation from strategic choice — the language exposes structure, not hidden selection.

**REQ-L-GTL2-LAWS-013**: Suitability for event-sourced interpretation — constructs must be lawfully interpretable by an event-sourced runtime.

**REQ-L-GTL2-LAWS-014**: Engine independence — language semantics do not depend on any single engine implementation.

**REQ-L-GTL2-LAWS-015**: Categorical identity — every first-class type carries opaque identity distinct from its label. Operations target by identity, not by name (see REQ-L-GTL2-IDENTITY).

**REQ-L-GTL2-LAWS-016**: Semantic work / execution separation — GTL declares jobs and roles; ABG realizes runs and worker bindings. Authentication and authority resolution remain external.

**REQ-L-GTL2-LAWS-017**: Graph-function publication and materialization law — published graph functions remain first-class reusable declarations, and their realized graphs derive from declared inputs, profiles, and policy-visible structural parameters rather than from ambient hidden state.

**REQ-L-GTL2-LAWS-018**: Graph-derived provenance law — when graph-derived companion bundles are produced from a published graph function, the derivation preserves replayable provenance back to the graph-function identity and materialization inputs.
