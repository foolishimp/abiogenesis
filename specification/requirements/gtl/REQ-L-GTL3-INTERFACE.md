# REQ-L-GTL3-INTERFACE — Interface Law

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define lawful interface satisfaction for graphs, graph vectors, and graph
functions.

## Acceptance Criteria

**REQ-L-GTL3-INTERFACE-001**: Graph interface shall be expressed through designated input and output nodes. Inputs and outputs are graph roles over nodes, not a rival structural type.

**REQ-L-GTL3-INTERFACE-002**: Composition shall be lawful only when the outputs of the first boundary satisfy the inputs of the second boundary.

**REQ-L-GTL3-INTERFACE-003**: Substitution shall be lawful only when the refined inner graph preserves the declared outer contract boundary.

**REQ-L-GTL3-INTERFACE-004**: Interface satisfaction shall preserve declared node contract truth, including schema and markov conditions.

**REQ-L-GTL3-INTERFACE-005**: Interface-equivalent graph functions shall be interchangeable at the contract boundary.

**REQ-L-GTL3-INTERFACE-006**: When a graph function materializes an inline graph, that realized graph shall preserve the graph function's declared outer interface exactly.
