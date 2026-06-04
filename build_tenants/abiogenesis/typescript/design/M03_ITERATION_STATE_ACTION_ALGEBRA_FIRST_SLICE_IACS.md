# M03 Iteration Outcome Algebra First Slice IACS

**Status**: Active
**Date**: 2026-06-05
**Derived from**:
[M03_ITERATION_STATE_ACTION_ALGEBRA_DERIVATION.md](./M03_ITERATION_STATE_ACTION_ALGEBRA_DERIVATION.md),
[M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md](./M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md),
[M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_FIRST_SLICE_IACS.md](./M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_FIRST_SLICE_IACS.md),
[M03_RUNTIME_CONTINUATION_TRANSITION_FIRST_SLICE_IACS.md](./M03_RUNTIME_CONTINUATION_TRANSITION_FIRST_SLICE_IACS.md),
[T-149](../../../../.ai-workspace/tickets/active/T-149-simplify-abg-iteration-state-action-algebra.md)

## Purpose

Declare the irreducible carrier set for the first active-iteration outcome
algebra.

## Irreducible Architectural Carrier Set

This slice introduces one prime carrier family and row inputs owned by the same
module:

1. `IterationRowProjection`
2. `IterationSatisfactionRow`
3. `IterationRuntimeRow`
4. `IterationBindingGuardRow`
5. `IterationEvidenceLifecycle`
6. `IterationOutcome`
7. `IterationOutcomeProjection`

The prime truth surface is `IterationOutcomeProjection`. The row carriers are
input facts; they do not select a transition independently.

## Carrier Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Consumers |
|---|---|---|---|---|---|
| `RuntimeAggregateProjection` | `M03-engine-kernel` | replay truth for current basis | replay | none | row projection |
| `AssuranceProjection` | `M03-engine-kernel` | authority/evidence ambiguity facts | assurance projection | none | satisfaction and binding rows |
| `TraversalContinuationActionProjection` | `M03-engine-kernel` | typed runtime/non-progress facts | replay projection | none | runtime rows |
| `GraphReentryFrontierProjection` | `M03-engine-kernel` | target-vector re-entry facts | replay projection | none | redispatch target rows |
| `IterationRowProjection` | `M03-engine-kernel` | normalized row input set | pure derivation | none | outcome projection |
| `IterationOutcomeProjection` | `M03-engine-kernel` | one active-boundary next transition | pure derivation | none | runner, diagnostics, public/read models |
| `TerminalTransition` | `M03-engine-kernel` | terminal event construction after outcome | outcome materialization | terminal event | runner |
| `RetryRepairDecision` | `M03-engine-kernel` | retry event construction after outcome | outcome materialization | retry events | runner |

## Prime Rule

The first slice must not add a new action enum per circumstance. Close, block,
retry, evaluator retry, graph re-entry, reprice, defer, and yield must fit the
primitive `terminate | redispatch | suspend` outcome constructors.

## Role Boundary

| Function | Owner |
|---|---|
| project event truth | ABG replay/projection |
| classify evidence lifecycle | ABG iteration row projection |
| classify binding guard failures | ABG iteration row projection |
| classify semantic satisfaction | evaluator/assurance row source |
| classify runtime/progress facts | runtime/liveness row source |
| choose one active-boundary transition | `IterationOutcomeProjection` |
| emit events after transition | runner consuming the outcome |
| interpret downstream domain meaning | downstream product over ABG facts |

## Non-Closure Conditions

- another module keeps a local priority table for active-boundary close, retry,
  re-entry, block, reprice, yield, or defer
- a compatibility wrapper remains in the iteration-boundary transition path
- a read model or summary outranks `IterationOutcomeProjection`
- superseded evidence can block current closure
- preserved/rebased evidence is discarded when still-current authority binding
  allows it to satisfy closure
- orphan evidence is modeled as a lifecycle or evaluator category
- terminal fallback outranks typed rows

## Required Proof

| Proof lane | Required assertion |
|---|---|
| priority totality | mixed rows always select one deterministic outcome by precedence |
| superseded evidence | superseded evidence cannot satisfy or block current closure |
| preserved/rebased evidence | still-current earlier evidence can satisfy current closure after re-entry |
| true orphan | binding guard failure terminates blocked and exposes diagnostics |
| evaluator retry | retryable evaluator failure redispatches proof only; exhaustion blocks |
| suspend rows | progressing, awaiting observer, and handoff map to suspend only below higher rows |
| structural guard | no iteration-boundary local transition table remains outside the module |
