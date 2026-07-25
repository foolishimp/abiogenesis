# REQ-R-ABG3-LEAFTASK — Bounded Subordinate Work

**Status**: Active
**Lineage**: T-283 Product basis; T-284 bounded owner repair
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define bounded subordinate subwork as GTL-declared work checked by the
validator, traversed by HoG, realized by a selected implementation binding, and
admitted as runtime truth by ABG rather than an imperative escape hatch.

## Acceptance Criteria

**REQ-R-ABG3-LEAFTASK-001**: GTL shall declare bounded subordinate subwork with explicit schema-validated input/output, scope, and parent relation. The validator shall check those static relations. HoG shall traverse the admitted declaration and the selected implementation binding shall realize its leaf effect only after ABG admits the exact parent execution and binding identity.

**REQ-R-ABG3-LEAFTASK-002**: Leaf-task dispatch shall remain subordinate to the parent GTL/HoG traversal and ABG runtime boundary. It shall not become a rival top-level execution ontology.

**REQ-R-ABG3-LEAFTASK-003**: Leaf-task failures shall classify distinctly at the runtime or payload boundary without parsing agent internals as domain truth.

**REQ-R-ABG3-LEAFTASK-004**: Implementation realization of leaf-task execution shall remain replay-visible through lawful ABG runtime events or authoritative parent-boundary facts.
