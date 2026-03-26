# REQ-R-ABG2-WORKER — Worker Identity and External Authority Hooks

**Status**: Active
**Category**: Capability
**Date**: 2026-03-25
**Derives from**: INT-GTL2-013
**Supersedes**: (split from REQ-R-ABG2-JOB-WORKER)
**Wave**: 2

---

## Purpose

`Worker` is ABG's concrete actor identity.

A worker may be an agent, a human, a service, or another concrete execution identity. ABG owns worker binding and provenance, but authentication and authority resolution remain external.

## Acceptance Criteria

**REQ-R-ABG2-WORKER-001**: `Worker` is ABG's concrete actor identity for execution, supervision, or approval.

**REQ-R-ABG2-WORKER-002**: Worker capability matching against GTL roles is engine-owned.

**REQ-R-ABG2-WORKER-003**: ABG shall accept worker identity as an externally resolved input. ABG does not implement authentication.

**REQ-R-ABG2-WORKER-004**: ABG shall accept and preserve an external authority reference or equivalent authority hook associated with the worker when provided.

**REQ-R-ABG2-WORKER-005**: Worker identity is distinct from role, job, and run. A worker may realize many runs over time and may bind to different roles where lawful.
