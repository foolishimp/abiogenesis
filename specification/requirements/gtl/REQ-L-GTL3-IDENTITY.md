# REQ-L-GTL3-IDENTITY — Categorical Identity For First-Class Types

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [GTL_3_CONSTITUTIONAL_DESIGN.md](../../GTL_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define opaque identity as the lawful targeting surface for first-class GTL
declarations.

## Acceptance Criteria

**REQ-L-GTL3-IDENTITY-001**: Every first-class GTL declaration type that is identity-bearing shall carry an opaque `.id` distinct from its human-readable `.name`.

**REQ-L-GTL3-IDENTITY-002**: Identity-bearing GTL declaration types shall include at minimum `Graph`, `GraphVector`, `Node`, `GraphFunction`, `RefinementBoundary`, `CandidateFamily`, `Role`, and `Job`.

**REQ-L-GTL3-IDENTITY-003**: Identity shall be automatically minted by default. Authors may supply an explicit id when lawful to do so.

**REQ-L-GTL3-IDENTITY-004**: `.name` is a human-readable label with no targeting semantics. Operations that target, replace, or reference specific declarations shall use `.id`, not `.name`.

**REQ-L-GTL3-IDENTITY-005**: Structural comparison and object identity shall remain distinct concerns.

**REQ-L-GTL3-IDENTITY-006**: Substitution shall target a specific `GraphVector` by `.id`, not by `.name`.

**REQ-L-GTL3-IDENTITY-007**: Publication, materialization, candidate, and boundary references shall preserve enough identity surface for replayable targeting without relying on labels alone.
