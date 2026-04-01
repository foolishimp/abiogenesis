# REQ-R-ABG2-SELECTION-APPLICATION — Selection Application

**Status**: Active
**Category**: Capability
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

**REQ-R-ABG2-SELECTION-APPLICATION-005**: The default runtime application of a selected graph function shall open invocation-local child work (for example via an invocation frame and child lineage events) rather than rewriting the published module carrier.

**REQ-R-ABG2-SELECTION-APPLICATION-006**: Any frame-local publication surface used for nested recursive selection or traversal shall obey the same fail-closed law as module publication: hidden structural alternatives and ambiguous declared alternatives are not lawful.
