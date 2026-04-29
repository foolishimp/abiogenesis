# REQ-R-ABG3-CORRECTION — Correction, Supersession, And Shadowing

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define lawful correction and supersession without destroying replayable
structure.

## Acceptance Criteria

**REQ-R-ABG3-CORRECTION-001**: Correction shall shadow prior runtime truth within a lawful boundary without erasing event history.

**REQ-R-ABG3-CORRECTION-002**: Correction or reset over recursive execution shall invalidate stale frame progress, foldback result, parent rebind result, and resumable checkpoints contained by the corrected boundary.

**REQ-R-ABG3-CORRECTION-003**: Supersession or abandonment shall produce authoritative continuation and run termination truth rather than hidden controller cleanup.

**REQ-R-ABG3-CORRECTION-004**: Reopened execution after correction shall mint fresh attempt identity where required and shall not alias stale runtime success.
