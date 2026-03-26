# REQ-L-GTL2-NODE — Typed Loci with Markov Conditions

**Status**: Active
**Category**: Capability
**Date**: 2026-03-25
**Derives from**: INT-GTL2-001, INT-GTL2-004
**Supersedes**: REQ-F-GRAPH (replaced — Asset concept reinterpreted as node schema/type)
**Wave**: 1

---

## Purpose

`Node[T]` is the typed local locus of graph truth.

A node carries:
- identity
- type/schema
- optional markov conditions describing the declared state conditions that hold at that locus
- tags/annotations

`markov` is constitutional vocabulary and survives into GTL 2.x. It is not a legacy-only field and it is not engine-owned prompt metadata.

## Acceptance Criteria

**REQ-L-GTL2-NODE-001**: `Node[T]` shall be a first-class GTL declaration representing a typed local locus within a graph.

**REQ-L-GTL2-NODE-002**: Node references are graph-local. The same node label may appear in different graphs without implying the same role. Object identity is defined by REQ-L-GTL2-IDENTITY.

**REQ-L-GTL2-NODE-003**: `Node` shall support an explicit `markov` field. `markov` is a declarative set of state/acceptance conditions attached to the node locus.

**REQ-L-GTL2-NODE-004**: `markov` belongs to the language declaration surface, not to ABG runtime metadata. ABG may interpret, render, project, or validate it, but shall not own or invent it.

**REQ-L-GTL2-NODE-005**: Source-node `markov` conditions express upstream state guarantees available to downstream graph application. Target-node `markov` conditions express the declared conditions that a lawful transformation is intended to satisfy.

**REQ-L-GTL2-NODE-006**: `markov` shall default to the empty tuple when unspecified. Absence of `markov` means "no declared conditions," not "unknown field."

**REQ-L-GTL2-NODE-007**: Any lawful GTL→ABG interpretation, bridge, or mapping layer shall preserve declared node `markov` conditions without semantic loss.

**REQ-L-GTL2-NODE-008**: During V1→V2 migration, any compatibility bridge from `Node` to legacy `Asset` shall map `Node.markov` to `Asset.markov` exactly.

**REQ-L-GTL2-NODE-009**: The V1 `Asset` concept is reinterpreted in V2 as `Node[T]` plus its declared schema/type and markov conditions.
