# REQ-L-GTL3-SUBWORK — Bounded Sub-Work

**Status**: Active
**Lineage**: T-283 Product basis; T-284 bounded owner repair
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define bounded sub-work as a lawful GTL 3 declaration capability.

## Acceptance Criteria

**REQ-L-GTL3-SUBWORK-001**: GTL shall be able to express that a graph vector or graph function supports bounded sub-work dispatch.

**REQ-L-GTL3-SUBWORK-002**: The sub-work declaration is a language capability. HoG traverses the admitted declaration, the host realizes its effect, and ABG admits and replays its runtime facts.

**REQ-L-GTL3-SUBWORK-003**: The sub-work declaration shall express boundedness and schema validity. HoG owns traversal scope, the host owns native effect realization, and ABG owns lifecycle, transport-contract admission, and replay truth.

**REQ-L-GTL3-SUBWORK-004**: Bounded sub-work declaration shall not require product-local shadow runtime logic as part of the GTL language.
