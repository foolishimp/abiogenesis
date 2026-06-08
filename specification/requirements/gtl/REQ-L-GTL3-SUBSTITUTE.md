# REQ-L-GTL3-SUBSTITUTE — Lawful Substitution

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define lawful local refinement by substitution of one graph boundary with
another.

## Acceptance Criteria

**REQ-L-GTL3-SUBSTITUTE-001**: `substitute(outer_graph, contract_vector, inner_graph)` shall replace a coarse contract vector with an interface-conformant inner graph.

**REQ-L-GTL3-SUBSTITUTE-002**: Substitution shall preserve the declared outer contract. Internal refinement may change structure but shall not alter the outer boundary observed by callers.

**REQ-L-GTL3-SUBSTITUTE-003**: The refined internal structure shall remain visible in the resulting graph value.

**REQ-L-GTL3-SUBSTITUTE-004**: Substitution shall target a specific `GraphVector` by `.id`.

**REQ-L-GTL3-SUBSTITUTE-005**: Substitution shall expose enough structural truth for an engine to record replayable provenance for which contract was refined and by which inner graph.

**REQ-L-GTL3-SUBSTITUTE-006**: Substitution may apply a pre-authored or synthesized inner graph provided the outer contract remains preserved.

**REQ-L-GTL3-SUBSTITUTE-007**: Runtime engines may keep refined inner structure frame-local unless a separate publication or export surface explicitly republishes it.
