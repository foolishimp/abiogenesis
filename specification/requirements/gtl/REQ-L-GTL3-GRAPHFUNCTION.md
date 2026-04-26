# REQ-L-GTL3-GRAPHFUNCTION — Reusable Workflow Programs

**Status**: Active
**Category**: Capability
**Date**: 2026-04-06
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `GraphFunction` as the primary reusable GTL compute abstraction and
contract boundary for lawful workflow reuse.

## Acceptance Criteria

**REQ-L-GTL3-GRAPHFUNCTION-001**: `GraphFunction` shall be a frozen, immutable type with at minimum: `name`, `environment`, `inputs`, `outputs`, `template`, `effects`, `declarations`, and `tags`.

**REQ-L-GTL3-GRAPHFUNCTION-002**: A graph function shall have an explicit typed outer interface and an explicit cumulative environment contract. It materializes a `Graph`, remains the reference contract boundary for callers, and is the sole public named callable workflow carrier of GTL 3.

**REQ-L-GTL3-GRAPHFUNCTION-003**: The template shall be represented as replayable publication truth. Interpreter-local callable resolution may exist as implementation convenience, but it is not the published graph-function contract.

**REQ-L-GTL3-GRAPHFUNCTION-004**: Graph-function materialization may depend on declared inputs, selected workflow families, and other declared structural parameters without relying on ambient hidden interpreter state.

**REQ-L-GTL3-GRAPHFUNCTION-005**: The `effects` surface shall support static analysis, engine capability matching, lawful composition reasoning, and workflow visibility.

**REQ-L-GTL3-GRAPHFUNCTION-006**: Named workflows are reusable through graph functions, not through copied structure.

**REQ-L-GTL3-GRAPHFUNCTION-007**: `GraphFunction` shall be the unit of lawful composition, substitution, recursion, and higher-order graph application.

**REQ-L-GTL3-GRAPHFUNCTION-008**: A graph function's declared outer contract shall remain stable even when internal refinement changes realized graph structure.

**REQ-L-GTL3-GRAPHFUNCTION-009**: `GraphFunction.declarations` shall be the canonical declaration surface for publication metadata, materialization metadata, hook references for dispatch, evaluation, escalation, deterministic proof, and closure, opaque hook configuration, and graph-function-local publication surfaces.

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
instance over that graph. It is the reusable program carrier, not the runtime
attempt or the downstream domain asset created by an attempt.
