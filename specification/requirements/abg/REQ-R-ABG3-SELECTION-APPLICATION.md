# REQ-R-ABG3-SELECTION-APPLICATION — Selection Application

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define lawful admission of selected callable identity and HoG application of
that identity without turning ABG into a strategy engine.

## Acceptance Criteria

**REQ-R-ABG3-SELECTION-APPLICATION-001**: The admitted catalog and ABG replay
projection shall enumerate interface-conformant program or GraphFunction
candidates for a contract boundary without making strategic choice.

**REQ-R-ABG3-SELECTION-APPLICATION-002**: ABG shall validate and admit a
selection proposed through declared GTL `F_D`, `F_P`, `F_H`, or
domain/business policy. HoG shall apply the admitted selected identity through
the original GTL program; ABG shall not select or traverse it.

**REQ-R-ABG3-SELECTION-APPLICATION-003**: Selection provenance shall preserve candidate identity, selecting mechanism, and rationale when supplied.

**REQ-R-ABG3-SELECTION-APPLICATION-004**: Runtime application of a selected
GraphFunction shall cause HoG to materialize and traverse its published GTL
template while ABG opens graph-call and frame-local runtime truth. Neither
step shall rewrite published GTL carriers.

**REQ-R-ABG3-SELECTION-APPLICATION-005**: Hidden structural alternatives or ambiguous declared alternatives shall fail closed.

**REQ-R-ABG3-SELECTION-APPLICATION-006**: Selection admission shall treat
admitted catalog entries as the candidate universe. A traversal vector or edge
may constrain allowable candidates by candidate identity, interface, source
contract, target contract, context, authority, overlay, namespace, version,
provenance, readiness, proof, or policy refs. An absent vector or edge
constraint shall mean that field is unconstrained; ABG shall not fill an
absent constraint from the already-selected candidate. The selected candidate
shall be eligible against the admitted universe after all declared constraints
are applied.
