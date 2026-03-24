# REQ-L-GTL2-NODE — Typed Nodes

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-001
**Supersedes**: REQ-F-GRAPH (replaced — Asset concept reinterpreted as node schema)
**Wave**: 1

---

## Purpose

`Node[T]` is the typed local locus of meaning within a graph.

## Acceptance Criteria

**REQ-L-GTL2-NODE-001**: `Node[T]` shall be a frozen, immutable value type parameterized by a schema type `T`, with at minimum: name, schema, tags.

**REQ-L-GTL2-NODE-002**: Node identity shall be graph-local. The same node name in different graphs refers to different nodes.

**REQ-L-GTL2-NODE-003**: Multiple nodes within the same graph may share the same schema type while remaining distinct nodes.

**REQ-L-GTL2-NODE-004**: The current `Asset` concept shall be reinterpreted as a node payload/schema declaration or domain-specific schema type used by `Node[T]`.

**REQ-L-GTL2-NODE-005**: `Vector[T]` is a schema family usable as a node type parameter (`Node[Vector[T]]`) when the node carries a collection of `T`. It is not a rival structural type — the structural type remains `Graph`, the locus remains `Node`.
