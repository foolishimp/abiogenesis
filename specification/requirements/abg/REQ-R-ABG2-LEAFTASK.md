# REQ-R-ABG2-LEAFTASK — Bounded Sub-Work Execution

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-006
**Supersedes**: REQ-F-LEAF (subsumed — runtime realization)
**Wave**: 2

---

## Purpose

ABG realizes GTL-declared bounded sub-work through LeafTask or equivalent runtime construct.

## Acceptance Criteria

**REQ-R-ABG2-LEAFTASK-001**: ABG shall realize bounded sub-work dispatch with schema-validated input/output and sub-run identity (`{parent_run_id}/leaf/{name}`).

**REQ-R-ABG2-LEAFTASK-002**: Leaf task dispatch shall emit control events: `leaf_task_started`, `leaf_task_completed`, `leaf_task_failed`.

**REQ-R-ABG2-LEAFTASK-003**: Leaf tasks shall not require a full top-level graph application — they are bounded, governed internal computations scoped to the parent execution.
