# REQ-L-GTL2-SUBSTITUTE — Lawful Substitution

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-005
**Supersedes**: REQ-F-REFINE (replaced), REQ-F-FRAG (replaced)
**Wave**: 1

---

## Purpose

Substitution replaces a coarse graph contract step with a finer graph. This is the graph-first surface for what older language called `zoom`.

## Acceptance Criteria

**REQ-L-GTL2-SUBSTITUTE-001**: `substitute(outer_graph, contract_edge, inner_graph)` shall replace a coarse contract step with an interface-compatible inner graph.

**REQ-L-GTL2-SUBSTITUTE-002**: Substitution shall preserve the outer contract — internal refinement may change structure but must not alter the declared boundary.

**REQ-L-GTL2-SUBSTITUTE-003**: Substitution shall expose the refined internal structure — inner graph vectors become visible graph structure within the outer graph.

**REQ-L-GTL2-SUBSTITUTE-004**: Substitution shall produce a result graph that carries enough information for an interpreter to record provenance (which contract was refined, by which inner graph). The recording obligation belongs to the engine (see REQ-R-ABG2-PROVENANCE).
