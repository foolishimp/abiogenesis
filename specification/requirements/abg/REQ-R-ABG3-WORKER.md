# REQ-R-ABG3-WORKER — Worker Identity And External Authority Hooks

**Status**: Active
**Category**: Capability
**Date**: 2026-04-06
**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define `Worker` as ABG's concrete actor identity for execution, supervision, or
approval.

## Acceptance Criteria

**REQ-R-ABG3-WORKER-001**: `Worker` shall remain distinct from GTL `Role`, GTL `Job`, ABG `Run`, `GraphCall`, `Frame`, and `Continuation`.

**REQ-R-ABG3-WORKER-002**: Worker capability matching against GTL role requirements shall remain engine-owned.

**REQ-R-ABG3-WORKER-003**: ABG shall accept worker identity as externally resolved input. ABG does not implement authentication.

**REQ-R-ABG3-WORKER-004**: ABG shall accept and preserve external authority references or equivalent authority hooks when provided.

**REQ-R-ABG3-WORKER-005**: Reporting metadata such as `build` or `build_id` shall not be treated as a substitute for worker identity.

**REQ-R-ABG3-WORKER-006**: Worker execution capability shall expose write territory explicitly enough for the engine to determine whether two workers or executable jobs can run in parallel without conflicting.

**REQ-R-ABG3-WORKER-007**: ABG may realize workers or executable jobs in parallel only when their write territories are disjoint.

**REQ-R-ABG3-WORKER-008**: Overlapping write territories shall serialize. Read overlap alone shall not be treated as a parallelism conflict.
