# REQ-L-GTL2-RECURSE — Recursive Graph Application

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-006
**Supersedes**: REQ-F-REFINE (replaced — spawn/fold-back portions)
**Wave**: 2

---

## Purpose

Graph-function application may induce child or repeated graph-function applications. Recursion preserves lineage semantics while keeping the outer contract intelligible.

## Acceptance Criteria

**REQ-L-GTL2-RECURSE-001**: `recurse(graph_function, termination)` shall express that graph-function application may induce child or repeated graph-function applications under a declared termination condition.

**REQ-L-GTL2-RECURSE-002**: Recursion shall preserve explainable work lineage — parent/child relationships are traceable.

**REQ-L-GTL2-RECURSE-003**: Parent convergence may depend on child lineage truth (fold-back).

**REQ-L-GTL2-RECURSE-004**: Recursive application shall preserve the declared outer interface of the recursively applied graph function.

**REQ-L-GTL2-RECURSE-005**: Recursion shall be bounded by a declared termination contract and/or explicit bound visible to the interpreter.
