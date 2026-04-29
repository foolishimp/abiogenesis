# REQ-R-ABG3-LEAFTASK — Bounded Subordinate Work

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define bounded subordinate subwork as governed ABG runtime work rather than an
imperative escape hatch around the engine.

## Acceptance Criteria

**REQ-R-ABG3-LEAFTASK-001**: ABG shall realize bounded subordinate subwork with explicit schema-validated input/output and parent execution identity.

**REQ-R-ABG3-LEAFTASK-002**: Leaf-task dispatch shall remain subordinate to the parent runtime boundary. It shall not become a rival top-level execution ontology.

**REQ-R-ABG3-LEAFTASK-003**: Leaf-task failures shall classify distinctly at the runtime or payload boundary without parsing agent internals as domain truth.

**REQ-R-ABG3-LEAFTASK-004**: Leaf-task execution shall remain replay-visible through lawful runtime events or authoritative parent-boundary facts.
