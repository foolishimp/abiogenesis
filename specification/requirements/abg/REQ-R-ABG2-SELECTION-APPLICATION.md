# REQ-R-ABG2-SELECTION-APPLICATION — Selection Application

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-007, INT-GTL2-008
**Supersedes**: (new capability)
**Wave**: 1

---

## Purpose

ABG enumerates lawful candidates, accepts external selection, applies it, and records provenance. ABG is composition-aware, selection-blind.

## Acceptance Criteria

**REQ-R-ABG2-SELECTION-APPLICATION-001**: ABG shall enumerate compatible graph or graph-function candidates for a given contract without making strategic choice.

**REQ-R-ABG2-SELECTION-APPLICATION-002**: ABG shall accept an externally provided selection (from F_D, F_P, F_H, or business/intent logic) and apply it lawfully.

**REQ-R-ABG2-SELECTION-APPLICATION-003**: ABG shall record selection provenance via a replayable event (e.g., `workflow_selected{edge, work_key, graph_function, selected_by, selection_mode, rationale?}`).

**REQ-R-ABG2-SELECTION-APPLICATION-004**: ABG shall validate that the selected candidate satisfies the contract interface before application.
