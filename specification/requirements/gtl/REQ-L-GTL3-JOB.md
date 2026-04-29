# REQ-L-GTL3-JOB — Durable Semantic Work Contracts

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `Job` as the durable semantic work contract of GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-JOB-001**: `Job` shall be a first-class GTL declaration type.

**REQ-L-GTL3-JOB-002**: A job shall express durable semantic work with stable identity and meaning independent of any one execution attempt.

**REQ-L-GTL3-JOB-003**: `ContractRef` shall be the indirection from a job to the GTL contract it binds, with at minimum `kind` and `target_id`.

**REQ-L-GTL3-JOB-004**: A job shall reference one or more published `GraphFunction` work contracts through `ContractRef`.

**REQ-L-GTL3-JOB-005**: The current lawful `ContractRef.kind` value for GTL 3 semantic work contracts shall be `graph_function`.

**REQ-L-GTL3-JOB-006**: A job may declare one or more required roles.

**REQ-L-GTL3-JOB-007**: A job is distinct from `Run`. A job persists across time; a run is one engine-owned realization of that job.

**REQ-L-GTL3-JOB-008**: A job is distinct from `Worker`. A job declares required semantic work; a worker is a concrete actor identity owned by an engine.

**REQ-L-GTL3-JOB-009**: Scheduling, triggers, KPIs, and similar orchestration concerns may be layered onto jobs later, but the absence of those declarations does not negate job semantics.

**REQ-L-GTL3-JOB-010**: A semantic job shall not target a bare `GraphVector`. Internal graph-vector boundaries are traversed only as realized structure beneath the bound graph function.
