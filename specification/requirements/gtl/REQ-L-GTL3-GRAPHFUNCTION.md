# REQ-L-GTL3-GRAPHFUNCTION — Reusable Workflow Library Functions

**Status**: Active - accepted by T-283 F_H closure
**Category**: Capability
**Date**: 2026-07-20
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `GraphFunction` as the primary reusable GTL workflow-library compute
abstraction and contract boundary for lawful workflow reuse.

## Acceptance Criteria

**REQ-L-GTL3-GRAPHFUNCTION-001**: `GraphFunction` shall be a frozen, immutable type with at minimum: `name`, `environment`, `inputs`, `outputs`, `template`, `effects`, `declarations`, and `tags`.

**REQ-L-GTL3-GRAPHFUNCTION-002**: A graph function shall have an explicit typed outer interface and an explicit cumulative environment contract. It materializes a `Graph`, remains the reference contract boundary for callers, and is the sole public named callable workflow-library carrier of GTL 3.

**REQ-L-GTL3-GRAPHFUNCTION-003**: The template shall be represented as
replayable publication truth. HoG-local callable resolution may exist as an
invocation convenience, but it is not the published GraphFunction contract or
a substitute executable program.

**REQ-L-GTL3-GRAPHFUNCTION-004**: Graph-function materialization may depend on declared inputs, selected workflow families, and other declared structural parameters without relying on ambient hidden interpreter state.

**REQ-L-GTL3-GRAPHFUNCTION-005**: The `effects` surface shall support static analysis, engine capability matching, lawful composition reasoning, and workflow visibility.

**REQ-L-GTL3-GRAPHFUNCTION-006**: Named workflow functions are reusable through graph functions, not through copied structure or product-local shells.

**REQ-L-GTL3-GRAPHFUNCTION-007**: `GraphFunction` shall be the unit of lawful composition, substitution, recursion, and higher-order graph application.

**REQ-L-GTL3-GRAPHFUNCTION-008**: A graph function's declared outer contract shall remain stable even when internal refinement changes realized graph structure.

**REQ-L-GTL3-GRAPHFUNCTION-009**: `GraphFunction.declarations` shall be the canonical declaration surface for publication metadata, materialization metadata, hook references for dispatch, evaluation, escalation, deterministic proof, closure, and assurance, opaque hook configuration, and graph-function-local publication surfaces.

**REQ-L-GTL3-GRAPHFUNCTION-010**: Published graph functions shall remain discoverable as first-class module surfaces rather than collapsing into anonymous realized graphs or helper code.

**REQ-L-GTL3-GRAPHFUNCTION-011**: Graph-function materialization shall expose enough identity and provenance surface that a consumer or engine can answer which graph function materialized, which declared inputs or parameters were used, and which realized graph was produced.

**REQ-L-GTL3-GRAPHFUNCTION-012**: Graph-derived companion bundles may be derived from a published graph function so long as graph remains the primary structural output and the derivation preserves replayable provenance.

**REQ-L-GTL3-GRAPHFUNCTION-013**: A graph function may be cached or reused across executions only when the cache identity is derived from declared materialization inputs and graph-function identity rather than opaque ambient process state.

**REQ-L-GTL3-GRAPHFUNCTION-014**: Published graph functions shall be the callable work-entry surface for semantic jobs and other public execution entry points. Bare internal graph vectors are not public callable carriers.

**REQ-L-GTL3-GRAPHFUNCTION-015**: A graph function may realize one or more internal `GraphVector` boundaries, but those realized vectors remain internal structural truth beneath the published graph-function carrier.

**REQ-L-GTL3-GRAPHFUNCTION-016**: `GraphFunction.environment` shall be an explicit immutable cumulative environment reference with `requires`, `provides`, and `carries` surfaces.

**REQ-L-GTL3-GRAPHFUNCTION-017**: `GraphFunction.inputs` shall match `environment.requires`, and `GraphFunction.outputs` shall be represented in `environment.provides`.

**REQ-L-GTL3-GRAPHFUNCTION-018**: `environment.carries` shall represent the cumulative typed bindings available after lawful execution of the graph function, including required bindings preserved from upstream and newly provided bindings emitted by the function.

**REQ-L-GTL3-GRAPHFUNCTION-019**: A `GraphFunction` shall remain distinct from
the materialized `Graph` it produces and from any ABG graph-call execution
instance over that graph. It is a reusable workflow library function and
callable work contract, not the whole program, runtime attempt, workspace
surface, graph overlay, or downstream domain asset created by an attempt.

**REQ-L-GTL3-GRAPHFUNCTION-020**: An ABG executive observer shall be published
as a graph function over an existing declared target workspace and target work.
The target shall be expressed through `GraphFunction.environment`, `Context`
locator/digest truth, and asset-surface required-context truth; GTL shall not
introduce a new observer-specific workspace, graph, frame, replay, or
continuation topology object for that role.

**REQ-L-GTL3-GRAPHFUNCTION-021**: A reusable node type shall retain its own
typed declaration identity and shall not be represented as a non-callable
GraphFunction. Node-type publication is inspectable declaration truth, not
callable work.

**REQ-L-GTL3-GRAPHFUNCTION-022**: A node-type realization shall preserve its
declared node contract, non-callability, and publication semantics without
minting a GraphFunction identity or runtime effects.

**REQ-L-GTL3-GRAPHFUNCTION-023**: Job binding, public start binding,
runtime-registry graph-function selection, graph-call opening, and invocation
assertion shall reject node-type entries as callable graph functions.

**REQ-L-GTL3-GRAPHFUNCTION-024**: A `GraphFunction` shall be a reusable library
function or callable work contract. It shall not be treated as the whole
product program when a graph overlay or GTL program composition declares the
program that binds graph functions, vectors, node types, starts, roles,
security, policy, proof obligations, and plugin/result contracts.

**REQ-L-GTL3-GRAPHFUNCTION-025**: Every callable GraphFunction shall publish a
GTL template that materializes a graph accepted by the GTL validator and
directly traversable by HoG. An implementation binding may realize only a
declared leaf seam inside that graph.

**REQ-L-GTL3-GRAPHFUNCTION-026**: Admission shall reject an
implementation-only callable, handler, plugin, worker, or function pointer
that claims GraphFunction identity without the matching published template,
materialized graph, contracts, program membership, and provenance.
