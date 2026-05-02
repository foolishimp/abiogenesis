# REQ-R-ABG3-BINDING — Worker / Role / Call Realization

**Status**: Active
**Category**: Capability
**Date**: 2026-04-07
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

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

**REQ-R-ABG3-BINDING-012**: When a target node declares `asset_surface.required_contexts`, ABG binding shall treat those named carried bindings as part of the executable runtime boundary for that traversal and shall fail closed when they are absent from the published carrier environment.

**REQ-R-ABG3-BINDING-013**: ABG bind-time prompt and manifest surfaces shall preserve declared target and environment `asset_surface` truth so proof/production work can specialize against asset kind, required carried contexts, and declared standards or output-contract references.

**REQ-R-ABG3-BINDING-014**: When ABG widens one live vector boundary with target `asset_surface.required_contexts`, that merge shall be explicit and invocation-local. It shall not rewrite published GTL module topology, and bind-time prompt, manifest, and runtime event surfaces shall preserve the vector-source required bindings, the asset-surface-required bindings, and the effective merged required boundary distinctly enough for replay and post-mortem audit.

**REQ-R-ABG3-BINDING-015**: When a graph-function start declares distinct input and output workspace authority, ABG binding shall admit both workspace authorities explicitly, derive output asset identity and materialization roots under the declared output workspace, and preserve input-workspace lineage plus output-workspace lineage in plugin handoff, runtime event, and projection truth.
