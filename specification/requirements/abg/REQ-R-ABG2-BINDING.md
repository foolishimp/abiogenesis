# REQ-R-ABG2-BINDING — Worker / Role / Job Realization

**Status**: Active
**Category**: Capability
**Date**: 2026-03-25
**Derives from**: INT-GTL2-008, INT-GTL2-013
**Supersedes**: (split from REQ-R-ABG2-JOB-WORKER)
**Wave**: 2

---

## Purpose

ABG realizes GTL semantic work by binding concrete workers to roles and associating runs to jobs.

The binding rule is:

- `Worker` binds to `Role`
- `Run` realizes `Job`

## Acceptance Criteria

**REQ-R-ABG2-BINDING-001**: ABG shall bind a concrete `Worker` to a GTL `Role` before lawful realization of work that requires that role.

**REQ-R-ABG2-BINDING-002**: ABG shall associate each `Run` to exactly one GTL `Job`.

**REQ-R-ABG2-BINDING-003**: A binding record shall preserve at minimum: `job_id`, `run_id`, `worker_id`, `role`, and `authority_ref` when provided.

**REQ-R-ABG2-BINDING-004**: ABG shall validate binding compatibility against GTL declarations before execution or approval.

**REQ-R-ABG2-BINDING-005**: Authentication and authority resolution are external. ABG consumes resolved identity/authority inputs and records them; it does not implement those systems.

**REQ-R-ABG2-BINDING-006**: Binding provenance shall be replayable from engine truth.
