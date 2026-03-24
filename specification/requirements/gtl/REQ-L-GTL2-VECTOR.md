# REQ-L-GTL2-VECTOR — Collection Schema Family

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-006
**Supersedes**: (new capability)
**Wave**: 2

---

## Purpose

`Vector[T]` is a schema family for nodes carrying collections. It is not a rival structural type — the locus is still `Node[Vector[T]]`.

## Acceptance Criteria

**REQ-L-GTL2-VECTOR-001**: `Vector[T]` shall be a schema family usable as a node type parameter when the node carries a collection of `T`.

**REQ-L-GTL2-VECTOR-002**: `Vector[T]` is not a rival structural type. The structural type is `Graph`, the locus is `Node[Vector[T]]`.

**REQ-L-GTL2-VECTOR-003**: `Vector[T]` is the semantic foundation for `fan_out`, `fan_in`, and `promote` — graph materialization may depend on collection cardinality.
