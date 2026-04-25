# REQ-R-ABG3-JOB-WORKER — Semantic Work And Runtime Execution Separation

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Keep semantic GTL work surfaces distinct from concrete ABG runtime aggregates.

## Acceptance Criteria

**REQ-R-ABG3-JOB-WORKER-001**: Semantic `Job` and `Role` shall remain GTL-owned surfaces. `Worker`, `Run`, `GraphCall`, `Frame`, and `Continuation` shall remain ABG-owned runtime surfaces.

**REQ-R-ABG3-JOB-WORKER-002**: Binding, replay, and provenance surfaces shall preserve the distinction between semantic work declarations and concrete runtime execution identity.

**REQ-R-ABG3-JOB-WORKER-003**: Internal runtime-local wrapper jobs used for frame progression or termination checks shall not be treated as public semantic work contracts.

**REQ-R-ABG3-JOB-WORKER-004**: ABG shall not collapse runtime execution truth into GTL semantic work declarations or product-local imperative controller state.
