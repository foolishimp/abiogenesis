# REQ-R-ABG3-LEAFTASK — Bounded Subordinate Work

**Status**: Active
**Lineage**: T-283 Product basis; T-284 bounded owner repair
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define bounded subordinate subwork as declared GTL work traversed by HoG,
realized by the host, and admitted by ABG rather than an imperative escape
hatch.

## Acceptance Criteria

**REQ-R-ABG3-LEAFTASK-001**: GTL shall declare bounded subordinate subwork with explicit schema-validated input/output and parent relation. HoG and the host shall realize it only after ABG admits the exact parent execution and binding identity.

**REQ-R-ABG3-LEAFTASK-002**: Leaf-task dispatch shall remain subordinate to the parent GTL/HoG traversal and ABG runtime boundary. It shall not become a rival top-level execution ontology.

**REQ-R-ABG3-LEAFTASK-003**: Leaf-task failures shall classify distinctly at the runtime or payload boundary without parsing agent internals as domain truth.

**REQ-R-ABG3-LEAFTASK-004**: Host realization of leaf-task execution shall remain replay-visible through lawful ABG runtime events or authoritative parent-boundary facts.
