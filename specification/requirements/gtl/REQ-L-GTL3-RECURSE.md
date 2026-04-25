# REQ-L-GTL3-RECURSE — Recursive Graph Application

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define recursion as a lawful graph-function capability of GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-RECURSE-001**: `recurse(graph_function, termination, foldback)` shall express repeated or child graph-function application under declared recursion law.

**REQ-L-GTL3-RECURSE-002**: Recursive application shall preserve the declared outer interface of the recursively applied graph function.

**REQ-L-GTL3-RECURSE-003**: Recursion shall expose explicit termination and foldback truth in declarations rather than hiding recursion policy in the interpreter.

**REQ-L-GTL3-RECURSE-004**: Foldback shall identify how child return material lawfully re-binds into the parent contract. Interpreter-local invention of foldback semantics is not lawful.

**REQ-L-GTL3-RECURSE-005**: Foldback shall make the parent contract re-bindable and re-evaluable. Child closure alone shall not certify parent convergence.

**REQ-L-GTL3-RECURSE-006**: Recursion shall preserve explainable work lineage across parent and child application.

**REQ-L-GTL3-RECURSE-007**: Recursive application shall be bounded by declared termination truth and/or other explicit bounds visible to the interpreter.

**REQ-L-GTL3-RECURSE-008**: Recursive inner steps may remain frame-local unless a separate publication surface explicitly exports them.
