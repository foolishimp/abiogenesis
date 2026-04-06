# REQ-R-ABG3-BINDING — Worker / Role / Call Realization

**Status**: Active
**Category**: Capability
**Date**: 2026-04-07
**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

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

**REQ-R-ABG3-BINDING-007**: When ABG realizes a public graph-function carrier, module publication shall expose the live internal vectors of that carrier through `Module.graphs` so selection and traversal validation can resolve those vectors lawfully.

**REQ-R-ABG3-BINDING-008**: Every live internal vector reachable from a public graph-function carrier shall publish a lawful traversal target through an explicit `RefinementBoundary` or `CandidateFamily`. Missing traversal publication shall fail closed.

**REQ-R-ABG3-BINDING-009**: ABG binding shall resolve a runtime environment snapshot for each executable traversal boundary from the live vector contract plus the published graph-function environment when present.

**REQ-R-ABG3-BINDING-010**: Binding shall preserve the distinction between external entry bindings and internally produced carried bindings so downstream realization can read cumulative upstream truth without inventing hidden ambient state.

**REQ-R-ABG3-BINDING-011**: ABG shall fail closed on structurally conflicting carried binding contracts and shall not dispatch proof/production work when required internally produced bindings are absent from the resolved runtime environment.
