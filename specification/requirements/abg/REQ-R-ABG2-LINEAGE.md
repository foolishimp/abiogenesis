# REQ-R-ABG2-LINEAGE — Work Identity and Lineage

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-006, INT-GTL2-010
**Supersedes**: REQ-F-WK (subsumed), REQ-F-REFINE (replaced — lineage portions), REQ-F-TRAV (subsumed — lineage portions)
**Wave**: 1

---

## Purpose

ABG preserves work identity and parent/child lineage across graph applications. Work lineage is the identity of graph application.

## Acceptance Criteria

**REQ-R-ABG2-LINEAGE-001**: `work_key` is the lineage identity of graph application. It scopes convergence, replay, spawn/fold-back, selection, and correction.

**REQ-R-ABG2-LINEAGE-002**: ABG shall support spawn — creating child graph-application lineage from parent work.

**REQ-R-ABG2-LINEAGE-003**: ABG shall support fold-back — reducing child lineage truth into parent graph truth.

**REQ-R-ABG2-LINEAGE-004**: Composition, substitution, fan-out, fan-in, and fold-back shall preserve explainable work lineage.
