# M03 Graph-Function Iteration First Slice IACS

**Status**: Active
**Date**: 2026-04-25
**Derived from**: [M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md](./M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [ABG_3_FIRST_SLICE_IACS.md](./ABG_3_FIRST_SLICE_IACS.md), [ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md](./ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md), [T-041](../../.ai-workspace/tickets/completed/T-041-design-typescript-m03-replay-derived-graph-function-iteration-and-aggregate-projection.md)

## Purpose

Declare the TypeScript `M03` replay-derived graph-function iteration carrier
inventory before implementation opens.

The inventory makes graph-call, frame, vector-local facts, aggregate
projection, and next-edge planning explicit so internal graph traversal does
not drift into public-start loops or private controller state.

## Boundary

This slice is:

- `M03-engine-kernel` internal runtime law
- below public `M04` app/bootstrap entry
- above effect-edge transport and evaluator invocation
- replay-derived from `RuntimeEvent`
- bounded to one composed graph-function execution path plus fail-closed
  negative proof lanes

This slice does **not** include:

- public operator command changes
- `M04` stop taxonomy publication
- generic retry/repair carrier implementation
- bounded leaf-task implementation
- alternate runtime mapping activation

## Upstream Authoritative Carriers Consumed

This slice consumes these existing carriers unchanged:

- `GraphFunction`
- `Graph`
- `GraphVector`
- `Job`
- `ExecutionBasis`
- `RuntimeEvent`
- `DispatchRequest`
- `ResultArtifact`

## Irreducible Architectural Carrier Set

This slice introduces exactly two new prime runtime families:

1. `RuntimeAggregateProjection`
2. `IterationAdvanceDecision`

It extends the existing `RuntimeEvent` family with graph-call, frame,
continuation, and vector-local traversal variants. Those variants are
authoritative runtime facts, but they remain members of the existing
`RuntimeEvent` family rather than rival event surfaces.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `ExecutionBasis` | `M03-engine-kernel` | admitted execution basis | existing basis admission | none | aggregate projection, iteration decision |
| `RuntimeEvent` | `M03-engine-kernel` | append-only runtime fact family | canonical `emit(...)` | event store write | aggregate projection |
| `RuntimeAggregateProjection` | `M03-engine-kernel` | replay-derived current runtime truth | `projectRuntimeAggregates(events, basis)` | none | iteration decision, public projections |
| `IterationAdvanceDecision` | `M03-engine-kernel` | sole next-edge planning authority | `deriveIterationAdvanceDecision(basis, projection)` | dispatch/evaluator/emit shells | runtime event derivation, later public stop projection |

## RuntimeEvent Variant Register

These variants are required for the first implementation slice:

- `graph_call_opened`
- `graph_call_closed`
- `frame_opened`
- `frame_closed`
- `vector_traversal_started`
- `vector_traversal_dispatched`
- `vector_evaluation_recorded`
- `vector_closure_recorded`
- `continuation_opened`
- `continuation_resolved`

Existing event variants such as `basis_admitted`, `fp_dispatch_requested`,
`assessed`, `approved`, `revoked`, and `reset` remain lawful members of the
same event family where already admitted.

## Projection Variant Register

`RuntimeAggregateProjection` is a closed union over:

- `RunProjection`
- `GraphCallProjection`
- `FrameProjection`
- `ContinuationProjection`

The first slice may expose one aggregate object that contains each projection
family, but the families must remain separately inspectable.

## Decision Variant Register

`IterationAdvanceDecision` is a closed union over:

- `open_graph_call`
- `open_frame`
- `traverse_vector`
- `await_vector_closure`
- `close_frame`
- `close_graph_call`
- `yield_continuation`
- `terminal`

Only `traverse_vector` carries `VectorTraversalPlan`.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `GraphCallIdentity` | subordinate | identity payload inside events/projections | minted by graph-call-open decision |
| `FrameIdentity` | subordinate | identity payload inside events/projections | minted by frame-open decision |
| `VectorTraversalIdentity` | subordinate | vector-local fact identity, not an aggregate | minted by traverse-vector decision |
| `VectorTraversalPlan` | subordinate | effect plan under one decision | derived only by `traverse_vector` |
| `EffectiveRuntimeBinding` | subordinate | projection detail for carried context/environment | derived from basis, graph vector, frame, and event truth |
| `ClosureObservation` | subordinate | vector-local proof/evaluation detail | admitted only through event variants |
| public stop class | deferred | belongs to `M04` projection wave | `T-035`/`B-030-TS` |
| generic retry repair budget | deferred | separate runtime governance design | `T-042` |
| leaf-task execution envelope | deferred | separate bounded subordinate work design | `T-042` |

## Selection Rules

- If no open graph call exists for the admitted basis, derive
  `open_graph_call`.
- If the current graph boundary requires a frame and none exists, derive
  `open_frame`.
- If a vector is current and lacks started/dispatched/evaluated/closed facts,
  derive the next missing vector-local decision.
- If the current vector is closed and a successor vector is available, derive
  `traverse_vector` for the successor.
- If the frame has no remaining lawful vector work, derive `close_frame`.
- If the graph call has no remaining lawful vector/frame/continuation work,
  derive `close_graph_call`.
- If an unresolved continuation blocks progress but remains lawful work, derive
  `yield_continuation`.
- Derive `terminal` only when projection proves no lawful graph-call, frame,
  vector, closure, continuation, hold, or yield remains.

## Fail-Closed Rules

- Ambiguous next vector fails closed.
- A vector whose target requires undeclared carried context fails closed.
- A graph-call projection that cannot be reconstructed from events fails
  closed.
- A frame projection hidden inside run state alone is not accepted.
- A local loop counter is not a valid input to `IterationAdvanceDecision`.
- Dispatching only `graph.vectors[0]` is not graph-function execution parity.

## Promotion Rule

No subordinate payload may be promoted during the implementation slice unless:

1. it becomes independently replayable public or persisted authority,
2. it crosses module boundaries unchanged, and
3. the promotion is recorded in this IACS and the active implementation ticket
   before code lands.
