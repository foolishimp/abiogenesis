# REQ-R-ABG3-BINDING — Worker / Role / Call Realization

**Status**: Active
**Lineage**: T-283 Product basis; T-284 bounded owner repair
**Category**: Capability
**Date**: 2026-04-07
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define lawful binding between an admitted GTL program, its published callable
work, stable workspace authority, concrete workers, and ABG runtime execution
aggregates.

## Acceptance Criteria

**REQ-R-ABG3-BINDING-001**: ABG shall bind concrete `Worker` identity to GTL `Role` requirements before lawful realization of work that requires that role.

**REQ-R-ABG3-BINDING-002**: Public semantic work shall enter ABG through one admitted graph overlay or GTL program composition and one `GraphFunction` callable published by that program, with a GTL `Job` contract when the work declares durable semantic job identity. A graph function, job, overlay row, or bare vector shall not be relabeled as the whole program or used without program membership.

**REQ-R-ABG3-BINDING-003**: Execution-scoped binding surfaces shall preserve at minimum admitted program identity and digest, one immutable `WorkspaceBinding` identity and digest, selected graph-function identity and program-membership evidence, semantic job identity when present, runtime run identity, worker identity, role identity, execution basis, and invocation-authority reference.

**REQ-R-ABG3-BINDING-004**: When HoG traverses a published GraphFunction and a selected implementation binding realizes its declared leaf effects, ABG binding truth shall preserve the admitted-program identity, exact selected action or current-intent basis, GraphFunction identity and program-membership evidence, workspace binding, graph-call identity, execution basis, implementation-binding identity, and materialization identity associated with execution.

**REQ-R-ABG3-BINDING-005**: Binding conformance shall be validated against the admitted GTL program, exact workspace binding, published graph-function membership, resolved runtime policy, and exact invocation authority before execution or approval.

**REQ-R-ABG3-BINDING-006**: Authentication and authority resolution remain external. ABG consumes and records resolved identity/authority inputs; it does not implement those systems.

**REQ-R-ABG3-BINDING-007**: Before HoG traverses a public GraphFunction carrier, Module publication shall expose the live internal vectors of that carrier through `Module.graphs` so the GTL validator can check publication and membership, ABG can admit selection and binding truth, and HoG can resolve the declared traversal lawfully.

**REQ-R-ABG3-BINDING-008**: Every live internal vector reachable from a public graph-function carrier shall publish a lawful traversal target through an explicit `RefinementBoundary` or `CandidateFamily`. Missing traversal publication shall fail closed.

**REQ-R-ABG3-BINDING-009**: ABG binding shall resolve a runtime environment snapshot for each executable traversal boundary from the live vector contract plus the published graph-function environment when present.

**REQ-R-ABG3-BINDING-010**: Binding shall preserve the distinction between external entry bindings and internally produced carried bindings so downstream realization can read cumulative upstream truth without inventing hidden ambient state.

**REQ-R-ABG3-BINDING-011**: ABG shall fail closed on structurally conflicting carried binding contracts and shall not dispatch proof/production work when required internally produced bindings are absent from the resolved runtime environment.

**REQ-R-ABG3-BINDING-012**: When a target node declares `asset_surface.required_contexts`, ABG binding shall treat those named carried bindings as part of the executable runtime boundary for that traversal and shall fail closed when they are absent from the published carrier environment.

**REQ-R-ABG3-BINDING-013**: ABG bind-time prompt and manifest surfaces shall preserve declared target and environment `asset_surface` truth so proof/production work can specialize against asset kind, required carried contexts, and declared standards or output-contract references.

**REQ-R-ABG3-BINDING-014**: When ABG widens one live vector boundary with target `asset_surface.required_contexts`, that merge shall be explicit and invocation-local. It shall not rewrite published GTL module topology, and bind-time prompt, manifest, and runtime event surfaces shall preserve the vector-source required bindings, the asset-surface-required bindings, and the effective merged required boundary distinctly enough for replay and post-mortem audit.

**REQ-R-ABG3-BINDING-015**: When a graph-function start declares distinct input and output workspace authority, ABG binding shall admit both stable workspace authority bases and immutable workspace bindings explicitly, derive output asset identity and materialization roots under the declared output workspace, and preserve input-workspace lineage plus output-workspace lineage in plugin handoff, runtime event, and projection truth. A newer observation of either workspace does not create another authority or binding.

**REQ-R-ABG3-BINDING-016**: `WorkspaceAuthorityBasis` shall contain only stable workspace identity, canonical root locator, authority mode, and authority-bearing manifest or configuration truth. `WorkspaceBinding` shall immutably join that basis to the exact installed product set, resolved lock, and declared roots. Readiness, runtime projection, replay cursor, worksite observations, and mutable-root content shall not enter either authority identity.

**REQ-R-ABG3-BINDING-017**: Every re-observation of file, process, runtime, replay, readiness, or mutable worksite truth shall create or admit a new `ObservationSnapshot` bound to the same workspace binding when authority is unchanged. A newer observation may stale dependent model, gap, or next-action projections; it shall not mutate the workspace binding or constitute `basis_fork_detected`.

**REQ-R-ABG3-BINDING-018**: A changed workspace authority basis, installed
product set, resolved lock, or declared root shall require a separately admitted
immutable workspace binding. A changed catalog or catalog view may require a
new execution basis and covering declaration reprice, but it shall not create a
new workspace binding unless a workspace-binding constituent also changed.
Crossing from one execution basis or binding to another on an existing causal
spine shall require an exact covering declaration reprice naming the crossed
identity pair; otherwise admission shall return typed `basis_fork_detected`
before execution.
