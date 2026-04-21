# REQ-L-GTL3-LAWS — Language Laws

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [GTL_3_CONSTITUTIONAL_DESIGN.md](../../GTL_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

State the governing language laws of GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-LAWS-001**: Graph primacy — all workflow structure is graph.

**REQ-L-GTL3-LAWS-002**: Typed node law — local graph meaning is carried by typed nodes.

**REQ-L-GTL3-LAWS-003**: Interface law — composition and substitution are lawful only when interfaces align.

**REQ-L-GTL3-LAWS-004**: Operator/evaluator separation — work and convergence are distinct concerns.

**REQ-L-GTL3-LAWS-005**: Composition associativity — lawful composition groups without changing the outer contract.

**REQ-L-GTL3-LAWS-006**: Identity graph function — an identity graph function preserves the interface.

**REQ-L-GTL3-LAWS-007**: Substitutability — interface-equivalent graph functions are interchangeable at the contract boundary.

**REQ-L-GTL3-LAWS-008**: Contract preservation — refinement may change internals but shall preserve the declared outer contract.

**REQ-L-GTL3-LAWS-009**: Recursion with preserved lineage and explicit foldback — recursive graph application preserves explainable lineage and declared rebinding law.

**REQ-L-GTL3-LAWS-010**: Higher-order legality — fan-out, fan-in, gate, and promote preserve interface and type truth.

**REQ-L-GTL3-LAWS-011**: Separation from hidden strategic choice — GTL exposes lawful structure, candidates, and hooks, not hidden selection.

**REQ-L-GTL3-LAWS-012**: Suitability for event-sourced interpretation — GTL constructs shall be lawfully interpretable by an event-sourced runtime.

**REQ-L-GTL3-LAWS-013**: Engine independence — language semantics do not depend on any single engine implementation.

**REQ-L-GTL3-LAWS-014**: Categorical identity — first-class declarations carry opaque identity distinct from labels, and targeting occurs by identity.

**REQ-L-GTL3-LAWS-015**: Semantic work and execution separation — GTL declares jobs over published graph functions and roles; engines realize runs, workers, materialization, internal traversal, and runtime truth.

**REQ-L-GTL3-LAWS-016**: Governance by hook attachment — GTL exposes governance hook surfaces and opaque configuration rather than tactic prescription or a policy semantic language.

**REQ-L-GTL3-LAWS-017**: Explicit invariant traversal visibility — contract boundaries may visibly declare invariant traversal truth.

**REQ-L-GTL3-LAWS-018**: Replayable hook and publication truth — publication, materialization, hook attachment, and derived bundle truth shall remain inspectable and replayable.
