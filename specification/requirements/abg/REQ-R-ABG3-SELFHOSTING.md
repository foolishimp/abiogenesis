# REQ-R-ABG3-SELFHOSTING — Derived Artifact Governance

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Apply the same runtime discipline to derived artifacts and bootstrap surfaces as
to all other governed work.

## Acceptance Criteria

**REQ-R-ABG3-SELFHOSTING-001**: Derived artifacts such as bootloader documents, constraint surfaces, and qualification summaries shall be governed by the same event, replay, provenance, and correction discipline as other runtime work.

**REQ-R-ABG3-SELFHOSTING-002**: Drift between source-of-truth runtime/design surfaces and derived artifacts shall be detectable through deterministic consistency checks.

**REQ-R-ABG3-SELFHOSTING-003**: Derived artifact governance is ordinary graph-function application and runtime truth, not special bootstrap magic.
