# REQ-L-GTL2-INTERFACE — Interface Law

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-03-24
**Derives from**: INT-GTL2-005
**Wave**: 1

---

## Purpose

Interface is expressed through designated boundary nodes. Composition and substitution are only lawful when interfaces align.

## Acceptance Criteria

**REQ-L-GTL2-INTERFACE-001**: Graph interface shall be expressed through designated input and output nodes. Inputs and outputs are graph roles over nodes, not a rival structural type.

**REQ-L-GTL2-INTERFACE-002**: Two graphs are interface-compatible for composition when the outputs of the first satisfy the inputs of the second (schema type alignment).

**REQ-L-GTL2-INTERFACE-003**: A graph may substitute for a contract edge only when its declared inputs and outputs satisfy the outer contract.

**REQ-L-GTL2-INTERFACE-004**: Interface-equivalent graph functions shall be interchangeable at the contract boundary (substitutability law).
