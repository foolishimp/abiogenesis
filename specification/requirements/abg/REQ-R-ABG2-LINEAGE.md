# REQ-R-ABG2-LINEAGE — Work Identity and Lineage

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-006, INT-GTL2-010
**Wave**: 1

---

## Purpose

ABG preserves work identity and parent/child lineage across graph applications. Work lineage is the identity of graph application.

## Acceptance Criteria

**REQ-R-ABG2-LINEAGE-001**: `work_key` is the lineage identity of graph application. It scopes convergence, replay, spawn/fold-back, selection, and correction.

**REQ-R-ABG2-LINEAGE-002**: ABG shall support spawn — creating child graph-application lineage from parent work without mutating the published module carrier.

**REQ-R-ABG2-LINEAGE-003**: ABG shall support fold-back — reducing child lineage truth into lawful parent rebind input for parent graph truth. Fold-back is the canonical convergence mechanism for recursive graph-function application.

**REQ-R-ABG2-LINEAGE-004**: Composition, substitution, fan-out, fan-in, and fold-back shall preserve explainable work lineage. Child lineage truth does not require promotion of child vectors into module-global topology.

**REQ-R-ABG2-LINEAGE-005**: Recursive frame reopening after reset/retry shall mint fresh attempt identity. Structural lineage may remain stable, but current-attempt identity shall not alias stale `frame_step_completed`, `frame_foldback`, or `frame_closed` history.
