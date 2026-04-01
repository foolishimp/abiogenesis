# REQ-L-GTL2-SUBSTITUTE — Lawful Substitution

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-005
**Supersedes**: REQ-F-REFINE (replaced), REQ-F-FRAG (replaced)
**Wave**: 1

---

## Purpose

Substitution replaces a coarse graph contract step with a finer graph. This is
the graph-first surface for what older language called `zoom`.

Substitution is algebraic graph truth. Runtime graph-function invocation may
project or inspect substituted structure without publishing that structure as
module-global executable topology.

## Acceptance Criteria

**REQ-L-GTL2-SUBSTITUTE-001**: `substitute(outer_graph, contract_edge, inner_graph)` shall replace a coarse contract step with an interface-compatible inner graph.

**REQ-L-GTL2-SUBSTITUTE-002**: Substitution shall preserve the outer contract — internal refinement may change structure but must not alter the declared boundary.

**REQ-L-GTL2-SUBSTITUTE-003**: Substitution shall expose the refined internal structure in the resulting graph value — inner graph vectors become visible graph structure within that algebraic result.

**REQ-L-GTL2-SUBSTITUTE-004**: Substitution shall produce a result graph that carries enough information for an interpreter to record provenance (which contract was refined, by which inner graph). The recording obligation belongs to the engine (see REQ-R-ABG2-PROVENANCE). Provenance may support projection or export without implying executable module replacement.

**REQ-L-GTL2-SUBSTITUTE-005**: Substitution may apply either a pre-authored inner graph or a runtime-synthesized inner graph, provided the declared outer contract is preserved.

**REQ-L-GTL2-SUBSTITUTE-006**: Substitution shall be local refinement — callers continue to observe the original outer contract boundary even when the internal realized graph changes. Runtime engines may keep the refined inner structure frame-local unless a separate export or compile step explicitly publishes it.
