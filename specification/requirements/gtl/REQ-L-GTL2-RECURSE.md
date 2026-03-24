# REQ-L-GTL2-RECURSE — Recursive Graph Application

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-006
**Supersedes**: REQ-F-REFINE (replaced — spawn/fold-back portions)
**Wave**: 2

---

## Purpose

Graph application may induce child graph applications. Recursion preserves lineage semantics.

## Acceptance Criteria

**REQ-L-GTL2-RECURSE-001**: `recurse(graph, lineage)` shall express that graph application may induce child graph applications with preserved work lineage.

**REQ-L-GTL2-RECURSE-002**: Recursion shall preserve explainable work lineage — parent/child relationships are traceable.

**REQ-L-GTL2-RECURSE-003**: Parent convergence may depend on child lineage truth (fold-back).
