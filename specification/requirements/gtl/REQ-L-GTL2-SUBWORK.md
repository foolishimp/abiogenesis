# REQ-L-GTL2-SUBWORK — Bounded Sub-Work

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-006
**Supersedes**: REQ-F-LEAF (subsumed)
**Wave**: 2

---

## Purpose

The language may declare that a graph vector or graph function permits bounded sub-work dispatch. The runtime realization is not a language primitive.

## Acceptance Criteria

**REQ-L-GTL2-SUBWORK-001**: GTL shall be able to express that a graph vector or graph function supports bounded sub-work dispatch.

**REQ-L-GTL2-SUBWORK-002**: The sub-work declaration is a language capability. ABG-compatible engines choose how to realize it operationally (e.g., `LeafTask`).

**REQ-L-GTL2-SUBWORK-003**: Sub-work shall not require a full top-level graph application — it is bounded, schema-validated, and scoped to the parent execution.
