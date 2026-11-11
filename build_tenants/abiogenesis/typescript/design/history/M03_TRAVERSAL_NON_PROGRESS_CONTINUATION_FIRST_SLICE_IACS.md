# M03 Traversal Non-Progress Continuation First Slice IACS

**Status**: Active
**Date**: 2026-05-03
**Derived from**: [M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md](./M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md), [M03_SUPERVISED_ACTOR_INVOCATION_FIRST_SLICE_IACS.md](./M03_SUPERVISED_ACTOR_INVOCATION_FIRST_SLICE_IACS.md), [M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md](./M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md), [M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md](./M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md), [T-106](../../../../.ai-workspace/tickets/active/T-106-define-abg-typed-traversal-non-progress-continuation-and-summary-agreement.md)

## Purpose

Declare the irreducible carrier set for T-106.

The slice exists to prevent three independent continuation stories from one
runtime fact. It does not introduce a second graph runner and does not move
semantic judgment into `F_D`.

## Irreducible Architectural Carrier Set

This slice introduces two derived carrier families:

1. `TraversalNonProgressCarrier`
2. `TraversalContinuationActionProjection`

Both are replay-derived from ABG runtime truth. Neither is a plugin output.

## Carrier Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
|---|---|---|---|---|---|
| `RuntimeEvent` | `M03-engine-kernel` | append-only actor/process/retry facts | `emit(...)` admission | event sink only | aggregate projection, archive |
| `RuntimeAggregateProjection` | `M03-engine-kernel` | current replay truth | replay | none | iteration, retry, T-106 projection |
| `TraversalNonProgressCarrier` | `M03-engine-kernel` | typed no-output process fact | pure derivation from projection | none | continuation action projection, archive |
| `TraversalContinuationActionProjection` | `M03-engine-kernel` | one authoritative next action | pure derivation from no-progress carrier plus retry policy | none | runner adapter, CLI, archive, downstream products |
| `RetryRepairDecision` | `M03-engine-kernel` | retry event construction for same-edge repair | projection and policy | retry/continuation events | runner |
| `GraphReentryFrontierProjection` | `M03-engine-kernel` | graph-span semantic re-entry | admitted `F_P` span assessment events | re-entry events | runner |

## Role Boundary

| Function | Owner |
|---|---|
| supervise actor process | ABG transport |
| classify no-progress from process facts | ABG T-106 pure projection |
| decide retry eligibility/action | ABG T-106 pure projection |
| perform semantic requirement-to-result evaluation | downstream `F_P` evaluator through ABG contracts |
| choose earlier graph re-entry from endpoint semantic gaps | ABG T-103 graph-span projection |
| render CLI/archive summary | adapter/read model consuming the T-106 projection |

## Action Collapse

The public summary action and carrier action must be the same value from
`TraversalContinuationActionProjection.action`.

Adapters may rename for display only if they preserve the stable enum value in
machine-readable output.

## Fail-Closed Rules

- If process evidence is missing, derive `inspect_runtime_archive`.
- If an artifact/report/progress signal exists, fail closed against
  no-progress classification.
- If the mapped runtime failure class is not in the retry allowlist, derive
  `blocked` or `reprice_runtime_policy`; do not retry privately.
- If retry budget is exhausted or the attempt is stationary, derive
  `retry_exhausted`.
- If a downstream product publishes a different action for the same projection,
  the downstream summary is invalid.

## Proof Lanes

| Proof lane | Required assertion |
|---|---|
| no-progress retry | silent process timeout maps to `no_output` and `retry_same_edge` while budget remains |
| exhausted retry | repeated/no-new-signal attempt maps to `retry_exhausted` |
| stream progress | stdout/stderr bytes prevent no-progress classification |
| artifact salvage | artifact/report/progress observation prevents no-progress classification |
| incomplete archive | missing process evidence maps to `inspect_runtime_archive` |
| summary agreement | all public summary rows are projected from the same action enum |
