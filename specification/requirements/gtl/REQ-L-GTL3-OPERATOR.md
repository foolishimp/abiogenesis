# REQ-L-GTL3-OPERATOR — Operators As First-Class Work Surfaces

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define operators as first-class GTL declarations for effectful work.

## Acceptance Criteria

**REQ-L-GTL3-OPERATOR-001**: `Operator` shall be a frozen, immutable declaration type with at minimum: `name`, `regime`, `binding`, and `tags`.

**REQ-L-GTL3-OPERATOR-002**: GTL shall support at minimum three operator regimes: deterministic (`F_D`), probabilistic (`F_P`), and human (`F_H`).

**REQ-L-GTL3-OPERATOR-003**: Operators perform work. They are distinct from evaluators, which check or attest convergence.

**REQ-L-GTL3-OPERATOR-004**: Operator `binding` shall be a declared implementation reference resolved by an engine or plugin. Raw executable callables shall not be the published language truth.

**REQ-L-GTL3-OPERATOR-005**: GTL may attach operators to graph vectors or graph-derived workflows without embedding concrete worker identity, transport choice, or runtime dispatch logic in the language.
