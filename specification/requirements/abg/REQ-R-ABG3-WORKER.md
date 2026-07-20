# REQ-R-ABG3-WORKER — Worker Identity And External Authority Hooks

**Status**: Active
**Lineage**: T-283 Product basis; T-284 bounded owner repair
**Category**: Capability
**Date**: 2026-04-06
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `Worker` as the externally resolved concrete actor identity preserved by
ABG for execution, supervision, or approval.

## Acceptance Criteria

**REQ-R-ABG3-WORKER-001**: `Worker` shall remain distinct from GTL `Role`, GTL `Job`, ABG `Run`, `GraphCall`, `Frame`, and `Continuation`.

**REQ-R-ABG3-WORKER-002**: GTL shall declare role requirements. Product or implementation-binding resolution may propose a matching worker; ABG shall admit or reject that binding before HoG and the host realize the declared work.

**REQ-R-ABG3-WORKER-003**: ABG shall accept worker identity as externally resolved input. ABG does not implement authentication.

**REQ-R-ABG3-WORKER-004**: ABG shall accept and preserve external authority references or equivalent authority hooks when provided.

**REQ-R-ABG3-WORKER-005**: Reporting metadata such as `build` or `build_id` shall not be treated as a substitute for worker identity.

**REQ-R-ABG3-WORKER-006**: Worker execution capability shall expose write territory explicitly enough for ABG to admit or reject a concurrency safety basis and for HoG and the host to realize the admitted branch disposition.

**REQ-R-ABG3-WORKER-007**: HoG and the host may realize declared workers or executable jobs in parallel only after ABG admits a safety basis proving their write territories disjoint.

**REQ-R-ABG3-WORKER-008**: Overlapping write territories shall produce an admitted serial disposition that HoG and the host apply. Read overlap alone shall not be treated as a parallelism conflict.
