# REQ-R-ABG2-RUN — Run Governance

**Status**: Active
**Date**: 2026-03-25
**Derives from**: INT-GTL2-010, INT-GTL2-013
**Supersedes**: REQ-F-RUN (subsumed)
**Wave**: 2

---

## Purpose

ABG models execution attempts over GTL job realizations with governed lifecycle.

## Acceptance Criteria

**REQ-R-ABG2-RUN-001**: Run states include at minimum: `queued`, `started`, `dispatched`, `pending`, `assessed`, `failed`, `timed_out`, `superseded`. Terminal states are `assessed` (successful completion), `failed`, `timed_out`, and `superseded`. Non-terminal states are `queued`, `started`, `dispatched`, `pending`.

**REQ-R-ABG2-RUN-002**: `run_id` is an execution attempt over a GTL job realization. Multiple runs may exist for the same job and work_key.

**REQ-R-ABG2-RUN-003**: ABG shall support run supersession — a new run supersedes prior live runs for the same work scope.

**REQ-R-ABG2-RUN-004**: ABG shall support retry with backoff on transient failures (transport_failure, timeout).

**REQ-R-ABG2-RUN-005**: At most one live (non-terminal) run shall exist per work scope at any time.

**REQ-R-ABG2-RUN-006**: Each run shall be associated to exactly one GTL job.

**REQ-R-ABG2-RUN-007**: When a run is bound to a worker, ABG shall preserve the bound `worker_id` and `role` as part of run or binding provenance.

**REQ-R-ABG2-RUN-008**: When external policy systems provide an authority reference, ABG shall preserve that `authority_ref` with the run or binding record without becoming the authority-resolution system.
