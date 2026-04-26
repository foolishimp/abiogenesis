# M03 Graph-Function Iteration Derivation

**Status**: Active
**Date**: 2026-04-25
**Purpose**: Derive the TypeScript `M03-engine-kernel` graph-function
iteration boundary so composed graph execution is replay-derived ABG runtime
truth rather than public-start repetition, package-local loop state, or
first-vector dispatch.

## 1. Source Material

This boundary derives from:

- `specification/requirements/abg/REQ-R-ABG3-INTERPRET.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-GRAPHCALL.md`
- `specification/requirements/abg/REQ-R-ABG3-FRAME.md`
- `specification/requirements/abg/REQ-R-ABG3-LINEAGE.md`
- `specification/requirements/abg/REQ-R-ABG3-BINDING.md`
- `specification/requirements/abg/REQ-R-ABG3-SELECTION-APPLICATION.md`
- `specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md`
- `build_tenants/common/design/modules/M03-engine-kernel.yml`
- `ABG_3_MODULE_DESIGN.md`
- `ABG_3_FIRST_SLICE_IACS.md`
- `ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md`
- `.ai-workspace/comments/codex/20260424T172930Z_T043_gtl_abg_requirement_to_typescript_trace_walkthrough.md`
- `.ai-workspace/tickets/completed/T-041-design-typescript-m03-replay-derived-graph-function-iteration-and-aggregate-projection.md`

## 2. Position

The TypeScript first runtime slice admitted one execution basis and derived one
advancement transition. That is a lawful steel thread, but it is not full
graph-function execution parity.

Full parity requires an internal kernel iteration boundary:

- public `start` locates, admits, or resumes one graph-function execution
  boundary
- `M03-engine-kernel` opens or resumes the corresponding runtime aggregates
- the next internal graph vector is selected from replay-derived aggregate
  truth
- vector-local dispatch, evaluation, proof, and closure facts are emitted as
  runtime truth
- projection determines whether to advance, stop, yield, open a continuation,
  close a frame, or close a graph call
- a request with no declared runtime compute basis fails closed as
  `no_compute_basis` before ABG treats the traversal as a no-op, identity, or
  implicit runtime fallback

The app/control layer delegates complete start-to-iterate execution to M03.
It may project operator-facing control truth from the returned public outcome,
but it does not repeat public start as graph-function execution law.

## 3. Superseded TypeScript Shape

The current TypeScript line can materialize a composed graph and can prove a
three-stage sandbox sequence, but that proof is harness-directed. The kernel
does not yet own a replay-derived decision carrier that explains why the second
or third vector is the next lawful traversal.

The superseded shape is therefore:

- `ExecutionBasis` carries the graph and selected graph function
- `deriveAdvancementTransition(...)` chooses only first-step dispatch,
  deterministic readiness, human escalation, or terminal state
- later sandbox code may replay multiple stages, but the runtime kernel itself
  does not yet project the next vector from event truth

That shape remains valid as a first slice. It is insufficient as closure for
`REQ-R-ABG3-INTERPRET-010..012`.

## 4. Target TypeScript Boundary

The next `M03` boundary introduces a replay-derived iteration family beneath
public start:

1. graph-call lifecycle facts
2. frame lifecycle facts
3. vector-local traversal facts
4. run/graph-call/frame/continuation aggregate projection
5. invocation-local binding and carried-environment projection
6. one closed `IterationAdvanceDecision` family

The decision family is the only authority for choosing the next internal graph
vector in TypeScript `M03`.

Diagnostic exploration over that boundary is downstream read-model truth.
`TraversalStructureProbe` may inspect an admitted basis, replay projection,
iteration decision, advancement transition, and current vector declaration
surface. It does not become next-edge authority and does not emit runtime
facts.

## 5. Required Runtime Reading

An iteration decision must read:

- the admitted `ExecutionBasis`
- the published `GraphFunction` and materialized graph
- graph-call lifecycle truth
- frame lifecycle truth
- vector-local traversal facts
- evaluation/proof/closure facts for the current vector
- carried runtime bindings and effective target `asset_surface` requirements
- continuation truth that blocks, yields, reopens, or terminates advancement

It must not read:

- package-local loop counters as authority
- private controller memory as authority
- a hardcoded `graph.vectors[0]` shortcut as graph-function execution truth
- public `start` repetition as next-edge law

## 6. Decision Family

`IterationAdvanceDecision` is a closed carrier family. Its variants should be:

- `open_graph_call`
- `open_frame`
- `traverse_vector`
- `await_vector_closure`
- `close_frame`
- `close_graph_call`
- `yield_continuation`
- `terminal`

Only `traverse_vector` may produce a vector-local traversal plan.

`terminal` is lawful only when replay-derived projection proves that no further
internal vector, closure, continuation, or public stop remains.

## 7. Required Proof Lanes

Implementation must declare and then land proof lanes for:

- deterministic replay of run, graph-call, frame, and continuation projection
- deterministic traversal-structure probing that distinguishes graph shape,
  typed interface authority, declared compute carriers, runtime policy
  interpretation, graph-call/frame replay identity, current vector evidence,
  event kinds, and forbidden overclaims
- a composed three-stage graph function whose second and third vectors are
  selected from emitted runtime facts, not from harness sequencing
- a named `no_compute_basis` failure taxonomy for absent runtime compute
  policy
- a negative first-vector-only realization rejected as non-parity
- a negative local-counter realization rejected as non-authoritative
- binding/environment projection that fails closed when an internal target
  requires undeclared carried context

## 8. T-072 Realized Boundary

`T-072` realizes the first ABG-owned start-to-iterate runner in TypeScript.

The runner lives below `M04` and owns:

- replay projection on every turn
- next-vector selection
- graph-call, frame, vector traversal, evaluation, closure, and terminal event
  emission
- F_D advancement to convergence without public-start repetition
- F_P dispatch stop projection
- F_P assessed-result re-entry, where admitted `assessed` runtime truth closes
  the matching replay vector and advances to the next vector without
  redispatching the same edge
- F_H gate stop projection
- plugin output admission through the common `EnginePluginContract` family

`M04` now exposes `start(...)` as the public ignition/resume wrapper. The
wrapper admits the public request and delegates to the M03 runner. It does not
own iteration.

`publicControlLoop(...)` remains a public compatibility/control projection. It
calls `start(...)` once and derives `PublicControlLoopOutcome` from that public
outcome.

## 9. Deferred Boundary

This design does not implement generic retry/repair or bounded leaf-task
governance. Those are owned by `T-042`.

This design does not publish a new public operator command. `M04` remains the
public app/bootstrap layer.

This design does not complete the public stop taxonomy. That remains `T-035`
and `B-030-TS`.

## 10. Consequence

The successor implementation ticket must open under `M03-engine-kernel` and
must consume the carrier family declared by:

- `M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
- `M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md`

Code work is not closure evidence for this design ticket unless it is carried
by a separate admitted implementation/proof ticket.
