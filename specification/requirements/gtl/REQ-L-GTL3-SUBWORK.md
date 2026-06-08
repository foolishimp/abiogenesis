# REQ-L-GTL3-SUBWORK — Bounded Sub-Work

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define bounded sub-work as a lawful GTL 3 declaration capability.

## Acceptance Criteria

**REQ-L-GTL3-SUBWORK-001**: GTL shall be able to express that a graph vector or graph function supports bounded sub-work dispatch.

**REQ-L-GTL3-SUBWORK-002**: The sub-work declaration is a language capability. ABG-conformant engines choose how to realize it operationally.

**REQ-L-GTL3-SUBWORK-003**: The sub-work declaration shall express boundedness and schema validity. Execution scoping, lifecycle, and transport remain engine obligations.

**REQ-L-GTL3-SUBWORK-004**: Bounded sub-work declaration shall not require product-local shadow runtime logic as part of the GTL language.
