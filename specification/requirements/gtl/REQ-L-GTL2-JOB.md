# REQ-L-GTL2-JOB — Durable Semantic Work Contracts

**Status**: Active
**Category**: Capability
**Date**: 2026-03-25
**Derives from**: INT-GTL2-012
**Supersedes**: (new)
**Wave**: 2

---

## Purpose

`Job` is a first-class GTL declaration of durable semantic work.

A job is not a queue item or a single execution attempt. It is the named work contract that persists across time and may be realized repeatedly by engine runs.

## Acceptance Criteria

**REQ-L-GTL2-JOB-001**: `Job` shall be a first-class GTL declaration type.

**REQ-L-GTL2-JOB-002**: A job shall express a durable semantic work contract with stable identity and semantic meaning independent of any one execution attempt.

**REQ-L-GTL2-JOB-003**: A job shall reference or bind to one or more GTL work contracts such as `Graph`, `GraphFunction`, `GraphVector`, or an equivalent contract reference.

**REQ-L-GTL2-JOB-004**: A job may declare one or more required roles.

**REQ-L-GTL2-JOB-005**: A job is distinct from `Run`. A job persists across time; a run is one realization of that job in ABG.

**REQ-L-GTL2-JOB-006**: A job is distinct from `Worker`. A job declares required work semantics; a worker is a concrete actor identity owned by ABG.

**REQ-L-GTL2-JOB-007**: GTL job declarations shall remain engine-independent. They must be mappable onto ABG and other runtimes without redefining the semantic contract.

**REQ-L-GTL2-JOB-008**: Scheduling, triggers, KPIs, and other orchestration concerns may be layered onto jobs later, but the absence of those declarations does not negate job semantics.
