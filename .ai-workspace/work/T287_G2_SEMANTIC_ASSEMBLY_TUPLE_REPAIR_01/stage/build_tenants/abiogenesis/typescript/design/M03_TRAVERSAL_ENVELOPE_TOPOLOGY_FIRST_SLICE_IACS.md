# M03 Traversal Envelope Topology First Slice IACS

**Status**: Active
**Date**: 2026-04-29
**Derived from**: [M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md](./M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md), [M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md](./M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md), [M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md](./M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md), [M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md](./M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md), [M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md](./M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md), [M03_SUPERVISED_ACTOR_INVOCATION_FIRST_SLICE_IACS.md](./M03_SUPERVISED_ACTOR_INVOCATION_FIRST_SLICE_IACS.md), [T-086](../../../../.ai-workspace/tickets/active/T-086-prove-abg-generic-traversal-envelope-topology-for-cumulative-pressure-and-coverage.md)

## Purpose

Declare the irreducible carrier decision for the generic traversal envelope.

The design goal is collapse: one replay-derived envelope view over current M03
truth, not a second traversal aggregate, side controller, or downstream local
orchestration shape.

## Boundary

This slice is:

- `M03-engine-kernel` runtime topology proof
- replay-derived over existing event/projection truth
- upstream of total assurance projection
- consumable by reports, archive surfaces, and downstream adapters as a read
  model

This slice does **not** include:

- implementation of total assurance rows
- output allocation from T-082
- downstream SDLC semantics
- plugin-owned closure, retry, or vector selection

## Irreducible Architectural Carrier Set

This slice introduces no new prime runtime carrier.

It names one derived read-model family:

1. `TraversalEnvelopeView`

`TraversalEnvelopeView` is not runtime authority. It is a projection lens over
the existing prime families needed by T-090/T-091, run archives, and downstream
adapter proof.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
|---|---|---|---|---|---|
| `ExecutionBasis` | `M03-engine-kernel` | invocation basis | runtime start admission | none | projection, plugin input, envelope view |
| `RuntimeEvent` | `M03-engine-kernel` | append-only fact stream | `emit(...)` admission | event sink only | projection, envelope view, archive |
| `RuntimeAggregateProjection` | `M03-engine-kernel` | current replay truth | event replay | none | iteration, retry, plugin input, envelope view |
| `IterationAdvanceDecision` | `M03-engine-kernel` | continue/converge authority | projection derivation | transition planning | runner, envelope view |
| `EnginePluginInput` | `M03-engine-kernel` | effect handoff contract | runner derivation | plugin call | plugin implementation |
| `EnginePluginOutcome` | `M03-engine-kernel` | effect result family | plugin outcome admission | runner-owned assessment | runner, result ingest |
| `ResultArtifact` | `M03-engine-kernel` | observed evidence artifact | result boundary admission | none | result ingest, envelope view |
| `ResultIngestOutcome` | `M03-engine-kernel` | admitted/rejected evidence boundary | result ingest | runtime event construction | attached loop, envelope view |
| `AttachedFpResultDecision` | `M03-engine-kernel` | attached F_P result control decision | result ingest and projection | runtime event construction | runner, envelope view |
| `RetryRepairDecision` | `M03-engine-kernel` | retry/re-entry authority | projection and policy derivation | retry/continuation events | runner, envelope view |
| `LeafTaskEnvelope` | `M03-engine-kernel` | parent-bound subordinate work | parent projection admission | leaf task shell | runtime events, envelope view |
| `TraversalEnvelopeView` | `M03-engine-kernel` | diagnostic/proof read model | projection from carriers above | none | assurance projection, reports, adapters |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
|---|---|---|---|
| `PressureRef` | subordinate/read-model | pressure is declared by GTL, events, obligations, or authority snapshots | must point to admitted authority or event truth |
| `CoverageRef` | subordinate/read-model | coverage is evidence under result/assessment truth | must point to admitted artifact/result/assessment truth |
| `PriorGapRef` | subordinate/read-model | gap truth is already retry/progress/blocked event truth | must point to admitted runtime event truth |
| `OutputBindingRef` | subordinate/deferred | output allocation remains T-082 | absent refs remain visible, not success |
| `EvaluatorContractRef` | subordinate | contract identity under plugin/GTL declarations | must point to admitted plugin or GTL declaration |

## Collapse Decisions

- `TraversalEnvelope` is not promoted to a public runtime aggregate.
- `TraversalEnvelopeView` may be materialized as a read model only.
- Retry, actor, result, and leaf-task facts remain variants or carriers in
  their existing M03 slices.
- Output allocation is consumed when present and remains T-082 when absent.
- T-090 assurance projection consumes the envelope view but owns its own
  ambiguity rows and closure fold.

## Proof Lanes

| Proof lane | Design source | Required assertion |
|---|---|---|
| replay envelope completeness | this IACS | each envelope need maps to existing carrier truth or named T-082/T-090 follow-on |
| plugin authority limit | plugin contract IACS | plugin outputs cannot emit events, choose vectors, or close traversal |
| retry carry | retry/repair IACS | prior gap/progress truth remains replay-visible through retry |
| attached result carry | attached F_P IACS | worker evidence is admitted or rejected before it affects closure |
| actor observation carry | supervised actor IACS | progress and observed artifact refs are runtime-visible |
| output allocation gap | this IACS plus T-082 | missing output binding is not treated as successful coverage |

## Fail-Closed Rules

- Missing current projection fails closed.
- Missing admitted event truth for a pressure or coverage ref fails closed.
- Plugin-returned closure truth fails closed.
- Controller-local retry or coverage state fails closed.
- Output-binding absence cannot be silently normalized to fulfilled.
- A downstream adapter report cannot replace the envelope view as runtime
  truth.
