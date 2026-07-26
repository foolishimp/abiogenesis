# REQ-R-ABG3-WORKER — Worker Identity And External Authority Hooks

**Status**: Active
**Lineage**: T-283 Product basis; T-284 bounded owner repair
**Category**: Capability
**Date**: 2026-04-06
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `Worker` as the externally resolved concrete actor identity preserved by
ABG for execution, supervision, or approval.

## Acceptance Criteria

**REQ-R-ABG3-WORKER-001**: `Worker` shall remain distinct from GTL `Role`, GTL `Job`, ABG `Run`, `GraphCall`, `Frame`, and `Continuation`.

**REQ-R-ABG3-WORKER-002**: GTL shall declare role requirements. Product or implementation-binding resolution may propose a matching worker; ABG shall admit or reject that binding before HoG traverses the declared work and the selected implementation binding realizes its leaf effects.

**REQ-R-ABG3-WORKER-003**: ABG shall accept worker identity as externally resolved input. ABG does not implement authentication.

**REQ-R-ABG3-WORKER-004**: ABG shall accept and preserve external authority references or equivalent authority hooks when provided.

**REQ-R-ABG3-WORKER-005**: Reporting metadata such as `build` or `build_id` shall not be treated as a substitute for worker identity.

**REQ-R-ABG3-WORKER-006**: Worker execution capability shall expose write territory explicitly enough for the declared policy relation to produce a concurrency proposal, for ABG to admit or reject its safety basis, for HoG to apply an admitted traversal disposition, and for the selected implementation binding to realize its leaf effects.

**REQ-R-ABG3-WORKER-007**: HoG may traverse GTL-declared branches targeting workers or executable jobs in parallel only after ABG admits a safety basis proving their write territories disjoint. The selected implementation bindings may realize only those admitted leaf effects.

**REQ-R-ABG3-WORKER-008**: Overlapping write territories shall produce a serial proposal under declared policy. ABG shall admit or reject that proposal, HoG shall apply only an admitted disposition, and selected implementation bindings shall realize only the resulting leaf effects. Read overlap alone shall not be treated as a parallelism conflict.
