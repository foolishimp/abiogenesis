# REQ-L-GTL3-GRAPHVECTOR — Invariant Traversal Boundaries

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `GraphVector` as the invariant traversal boundary and internal adjacency
record of GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-GRAPHVECTOR-001**: `GraphVector` shall be a first-class GTL declaration type with at minimum: `name`, `source`, `target`, `operators`, `evaluators`, `contexts`, `rule`, `allows_subwork`, `declarations`, and `tags`.

**REQ-L-GTL3-GRAPHVECTOR-002**: `GraphVector` is the internal adjacency record of GTL. It is not a rival public ontology, not a public callable carrier, and not a semantic job target, but it is a real language declaration surface.

**REQ-L-GTL3-GRAPHVECTOR-003**: A graph vector shall support one source node or an ordered tuple of source nodes and one target node.

**REQ-L-GTL3-GRAPHVECTOR-004**: `operators` and `evaluators` shall express local constructive and convergence surfaces for the transition. `rule` shall express a local constraint. `allows_subwork` shall express bounded sub-work capability.

**REQ-L-GTL3-GRAPHVECTOR-005**: `GraphVector.declarations` shall be the canonical transition-governance declaration surface for one invariant traversal boundary.

**REQ-L-GTL3-GRAPHVECTOR-006**: `GraphVector.declarations` may carry explicit truth for invariant transition description, dispatch intent, evaluation policy, escalation policy, deterministic proof surfaces, closure contract, assurance hook references, other hook references, and opaque hook configuration.

**REQ-L-GTL3-GRAPHVECTOR-007**: Graph-vector declarations shall remain inspectable and replayable across publication, serialization, and interpretation surfaces.

**REQ-L-GTL3-GRAPHVECTOR-008**: Public execution entry and semantic work contracts shall not target bare graph vectors. Operative traversal boundaries remain internal realized structure beneath one or more published graph functions.

**REQ-L-GTL3-GRAPHVECTOR-009**: When a traversal modulation qualifier is present, the graph-vector declaration shall be the highest-precedence source for that edge's modulation hook. A graph-function or role default shall not override the vector-local qualifier.

**REQ-L-GTL3-GRAPHVECTOR-010**: Per-edge traversal strategy shall be declared through `GraphVector.declarations["abg.traversal_strategy"]`. ABG shall carry the selected strategy as runtime truth while treating the strategy label as descriptive product-owned metadata.

**REQ-L-GTL3-GRAPHVECTOR-011**: Temporal eligibility constraints such as `not_before` may attach to a graph vector when the constraint governs one traversal boundary. The first canonical graph-vector temporal syntax shall be `GraphVector.declarations["abg.temporal_constraint"]` as a `hook_ref` whose config carries `constraint_ref`, `operator`, `not_before_ref`, optional `deadline_ref`, `schedule_policy_ref`, `timer_provider_ref`, and `deadline_breach_action`. Such constraints shall affect eligibility, deadline-breach pressure, and schedule-policy consequence only through ABG replay and shall not make a graph vector a public execution target. Alternate temporal key spellings shall not be admitted as compatibility surfaces.

**REQ-L-GTL3-GRAPHVECTOR-012**: Edge assurance may attach to a graph vector through `GraphVector.declarations["abg.edge_assurance_contract"]` as a hook/config declaration. The declaration shall describe the scoped edge assurance contract for target outcome, authority surfaces, obligation bindings, F_P transform/eval contracts, admissible evidence policy, gain report, metric, closure decision, residual pressure, continuation, composition law, cheap structural checks, and policy refs.

**REQ-L-GTL3-GRAPHVECTOR-013**: A graph-vector edge assurance declaration shall be the highest-precedence assurance contract for that traversal boundary. Graph-function, job, role, module, or installed-default assurance declarations may provide defaults, but they shall not override a vector-local edge assurance contract.

**REQ-L-GTL3-GRAPHVECTOR-014**: Absence of an edge assurance declaration shall not mean automated closure is lawful. When no assurance function is declared for an edge traversal, the default assurance disposition is F_H by absentia, and any human closure or continuation judgment must remain scoped to the edge and replay-visible through ABG.

**REQ-L-GTL3-GRAPHVECTOR-015**: Every graph-vector output surface shall have an effective target carrier contract binding. A vector-local `GraphVector.declarations["gtl.target_carrier_contract"]` declaration is the highest-precedence binding. If the vector does not declare a product-specific target carrier contract, the binding shall resolve from a visible GTL defaults config bundle rather than from code constants, prompt prose, parser convention, or null. Malformed present declarations and missing or malformed defaults fail closed.

**REQ-L-GTL3-GRAPHVECTOR-016**: A target carrier contract binding shall declare at minimum the target node ref, output surface ref, output carrier family, output carrier kind, envelope contract ref, nested payload path, required fields, fixed protocol fields, worker-fillable fields, literal or enum domains, schema ref, admission ref, payload-ledger binding ref, edge-assurance binding ref, handoff projection ref, construction template ref, replay digest policy ref, materialization policy ref, closure precondition ref, and test-case generation ref.
