# REQ-R-ABG2-JOB-WORKER — Semantic Work and Execution Separation

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-03-25
**Derives from**: INT-GTL2-008
**Wave**: 2

---

## Purpose

Semantic GTL work declarations and concrete ABG execution surfaces remain distinct. GTL owns `Job` and `Role`. ABG owns `Worker`, binding, and `Run`.

## Acceptance Criteria

**REQ-R-ABG2-JOB-WORKER-001**: Semantic `Job`, semantic `Role`, concrete `Worker`, and execution `Run` shall remain distinct surfaces.

**REQ-R-ABG2-JOB-WORKER-002**: GTL shall own semantic job and role law. ABG shall own worker binding and run lifecycle law.

**REQ-R-ABG2-JOB-WORKER-003**: Binding and replay surfaces shall preserve the distinction between semantic work declarations and concrete execution identity.
