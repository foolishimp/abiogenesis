# REQ-R-ABG3-BINDING — Worker / Role / Call Realization

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define lawful binding between semantic GTL work, concrete workers, and ABG
runtime execution aggregates.

## Acceptance Criteria

**REQ-R-ABG3-BINDING-001**: ABG shall bind concrete `Worker` identity to GTL `Role` requirements before lawful realization of work that requires that role.

**REQ-R-ABG3-BINDING-002**: Public semantic work shall enter ABG through GTL `Job` contracts over published `GraphFunction` carriers, not bare vectors.

**REQ-R-ABG3-BINDING-003**: Binding surfaces shall preserve at minimum semantic job identity, runtime run identity, worker identity, role identity, and authority reference when provided.

**REQ-R-ABG3-BINDING-004**: When ABG realizes a job over a published graph function, binding truth shall preserve the graph-function identity, graph-call identity, and materialization identity associated to execution.

**REQ-R-ABG3-BINDING-005**: Binding compatibility shall be validated against GTL declarations and resolved runtime policy before execution or approval.

**REQ-R-ABG3-BINDING-006**: Authentication and authority resolution remain external. ABG consumes and records resolved identity/authority inputs; it does not implement those systems.
