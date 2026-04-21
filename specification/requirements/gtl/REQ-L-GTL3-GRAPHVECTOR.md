# REQ-L-GTL3-GRAPHVECTOR — Invariant Traversal Boundaries

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [GTL_3_CONSTITUTIONAL_DESIGN.md](../../GTL_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define `GraphVector` as the invariant traversal boundary and internal adjacency
record of GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-GRAPHVECTOR-001**: `GraphVector` shall be a first-class GTL declaration type with at minimum: `name`, `source`, `target`, `operators`, `evaluators`, `contexts`, `rule`, `allows_subwork`, `declarations`, and `tags`.

**REQ-L-GTL3-GRAPHVECTOR-002**: `GraphVector` is the internal adjacency record of GTL. It is not a rival public ontology, not a public callable carrier, and not a semantic job target, but it is a real language declaration surface.

**REQ-L-GTL3-GRAPHVECTOR-003**: A graph vector shall support one source node or an ordered tuple of source nodes and one target node.

**REQ-L-GTL3-GRAPHVECTOR-004**: `operators` and `evaluators` shall express local constructive and convergence surfaces for the transition. `rule` shall express a local constraint. `allows_subwork` shall express bounded sub-work capability.

**REQ-L-GTL3-GRAPHVECTOR-005**: `GraphVector.declarations` shall be the canonical transition-governance declaration surface for one invariant traversal boundary.

**REQ-L-GTL3-GRAPHVECTOR-006**: `GraphVector.declarations` may carry explicit truth for invariant transition description, dispatch intent, evaluation policy, escalation policy, deterministic proof surfaces, closure contract, hook references, and opaque hook configuration.

**REQ-L-GTL3-GRAPHVECTOR-007**: Graph-vector declarations shall remain inspectable and replayable across publication, serialization, and interpretation surfaces.

**REQ-L-GTL3-GRAPHVECTOR-008**: Public execution entry and semantic work contracts shall not target bare graph vectors. Operative traversal boundaries remain internal realized structure beneath one or more published graph functions.
