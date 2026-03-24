# REQ-R-ABG2-RUN — Run Governance

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-010
**Supersedes**: REQ-F-RUN (subsumed)
**Wave**: 2

---

## Purpose

ABG models execution attempts over graph applications with governed lifecycle.

## Acceptance Criteria

**REQ-R-ABG2-RUN-001**: Run states include at minimum: `queued`, `started`, `dispatched`, `pending`, `assessed`, `failed`, `timed_out`, `superseded`. Terminal states are `assessed` (successful completion), `failed`, `timed_out`, and `superseded`. Non-terminal states are `queued`, `started`, `dispatched`, `pending`.

**REQ-R-ABG2-RUN-002**: `run_id` is an execution attempt over a graph application. Multiple runs may exist for the same work_key.

**REQ-R-ABG2-RUN-003**: ABG shall support run supersession — a new run supersedes prior live runs for the same work scope.

**REQ-R-ABG2-RUN-004**: ABG shall support retry with backoff on transient failures (transport_failure, timeout).

**REQ-R-ABG2-RUN-005**: At most one live (non-terminal) run shall exist per work scope at any time.
