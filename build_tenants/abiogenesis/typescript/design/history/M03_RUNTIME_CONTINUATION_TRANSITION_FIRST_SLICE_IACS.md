# M03 Runtime Continuation Transition First Slice IACS

**Status**: Active
**Date**: 2026-06-04
**Derived from**:
[M03_RUNTIME_CONTINUATION_TRANSITION_DERIVATION.md](./M03_RUNTIME_CONTINUATION_TRANSITION_DERIVATION.md),
[M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md](./M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md),
[M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md](./M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md),
[T-147](../../../../.ai-workspace/tickets/completed/T-147-realize-t188-runtime-authority-invariants-in-abg.md)

## Purpose

Declare the irreducible carrier set for the first ABG runtime continuation
transition projection.

## Irreducible Architectural Carrier Set

This slice introduces one derived carrier family:

1. `RuntimeContinuationTransitionProjection`

It is a replay-derived ABG projection over existing runtime carriers. It is not
a plugin output, not a prompt protocol, and not a downstream product policy
surface.

## Carrier Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
|---|---|---|---|---|---|
| `RuntimeAggregateProjection` | `M03-engine-kernel` | current replay truth | replay | none | transition projection |
| `TraversalContinuationActionProjection` | `M03-engine-kernel` | typed non-progress continuation action | pure derivation | none | transition projection |
| `AssuranceClosureDecision` | `M03-engine-kernel` | closure fold result | assurance fold | none | transition projection |
| `RuntimeContinuationTransitionProjection` | `M03-engine-kernel` | one next runtime transition | pure derivation | none | runner, public summaries, downstream consumers |
| `RetryRepairDecision` | `M03-engine-kernel` | retry event construction after transition says retry | projection and policy | retry/continuation events | runner |
| `TerminalTransition` | `M03-engine-kernel` | terminal event construction after non-retry transition | projection | terminal event | runner |

## Role Boundary

| Function | Owner |
|---|---|
| project current runtime facts | ABG runtime projection |
| classify actor no-progress | ABG T-106 projection |
| fold assurance rows | ABG assurance projection |
| choose one transition from typed facts | `RuntimeContinuationTransitionProjection` |
| emit retry/terminal events | runner adapter consuming the projection |
| interpret product-specific meaning | downstream product over ABG facts |

## Non-Closure Conditions

- runner code derives retry from terminal fallback refs while typed block,
  reprice, yield, or non-progress facts are present
- downstream product publishes a different next action for the same ABG event
  stream
- plugin output contains transition, event, ledger, vector-selection, or closure
  authority
- terminal retry fallback outranks typed ABG facts

## Required Proof

| Proof lane | Required assertion |
|---|---|
| table totality | every accepted input class maps to exactly one disposition |
| fallback demotion | terminal retry fallback is used only when no typed fact exists |
| no-progress runner | F_P no-artifact path consumes the projection before retry or terminal selection |
| terminal conversion | non-retry projection maps to the matching `TerminalTransition` |
