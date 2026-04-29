---
kind: codex_post
type: closure_candidate
status: posted
ticket: T-086
ticket_path: .ai-workspace/tickets/active/T-086-prove-abg-generic-traversal-envelope-topology-for-cumulative-pressure-and-coverage.md
date: 2026-04-29
governance_scope: STDO Method
---

# T-086 Traversal Envelope Closure Candidate

## Decision

T-086 is a closure candidate pending external agent review.

The generic traversal envelope is a replay/read-model view over existing M03
runtime truth, not a new prime aggregate:

- `ExecutionBasis`
- `RuntimeEvent`
- `RuntimeAggregateProjection`
- `IterationAdvanceDecision`
- `EnginePluginInput`
- `EnginePluginOutcome`
- `ResultArtifact`
- `ResultIngestOutcome`
- `AttachedFpResultDecision`
- `RetryRepairDecision`
- supervised actor facts
- `LeafTaskEnvelope`

This preserves ABG ownership of traversal, retry, result admission, event
truth, and next-vector selection.

## Design Surfaces

| Surface | Role |
|---|---|
| `M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md` | Records the topology decision and requirement audit result. |
| `M03_TRAVERSAL_ENVELOPE_TOPOLOGY_FIRST_SLICE_IACS.md` | Declares zero new prime carriers and names `TraversalEnvelopeView` as a read model. |
| `M03_TRAVERSAL_ENVELOPE_TOPOLOGY_STRUCTURAL_CARRIER_DIAGRAM.md` | Shows how GTL, ABG events/projection, plugin outcomes, retry, actor, leaf-task, T-082 refs, and T-090 assurance connect. |

## No-Gap Proof

The envelope need decomposes onto current ABG M03 carriers:

| Envelope need | Current carrier |
|---|---|
| current projection | `RuntimeAggregateProjection` |
| cumulative context | `ExecutionBasis` plus replay projection |
| obligation/pressure refs | GTL declarations, expected assessment refs, and admitted event truth |
| evaluator/plugin contracts | `EnginePluginContract`, `EnginePluginInput` |
| prior gap truth | retry/progress events and `RetryRepairDecision` |
| result coverage | `ResultArtifact`, `ResultIngestOutcome`, assessed events |
| actor observations | supervised actor runtime facts |
| leaf work | `LeafTaskEnvelope` and leaf-task events |
| output binding | T-082 refs when present; otherwise visible missing/deferred state |

No implementation ticket is required for the traversal envelope itself.

## Boundary

T-086 does not close the assurance problem. It closes only the topology that
total assurance must project over.

T-090 now has a completed envelope dependency. T-091 remains responsible for
totality and negative premature-closure proof. T-092-PY and T-092-TS remain
tenant implementation tickets.
