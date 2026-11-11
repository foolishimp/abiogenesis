# M03 Retry/Repair And Leaf-Task First Slice IACS

**Status**: Active
**Date**: 2026-04-25
**Derived from**: [M03_RETRY_REPAIR_LEAFTASK_DERIVATION.md](./M03_RETRY_REPAIR_LEAFTASK_DERIVATION.md), [M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md](./M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [T-042](../../.ai-workspace/tickets/completed/T-042-design-typescript-m03-generic-retry-repair-and-leaf-task-governance.md)

## Purpose

Declare the common/TypeScript `M03` carrier inventory for retry/repair and
bounded leaf-task governance before implementation opens.

## Boundary

This slice is:

- shared `M03-engine-kernel` runtime governance law
- tenant-realized in TypeScript carriers and proof lanes
- replay-visible through `RuntimeEvent`
- subordinate to graph-function iteration and aggregate projection
- upstream of public stop taxonomy projection

This slice does **not** include:

- final public stop-class naming
- domain-specific retry policy
- app/bootstrap command loops
- installed live portfolio execution
- alternate runtime mapping activation

## Upstream Authoritative Carriers Consumed

This slice consumes these existing or designed carriers:

- `ExecutionBasis`
- `RuntimeEvent`
- `RuntimeAggregateProjection`
- `IterationAdvanceDecision`
- `DispatchRequest`
- `ResultArtifact`
- `ContinuationProjection`

## Irreducible Architectural Carrier Set

This slice introduces exactly two new prime runtime families:

1. `RetryRepairDecision`
2. `LeafTaskEnvelope`

It extends the existing `RuntimeEvent` family with retry/repair and leaf-task
fact variants. Those variants are authoritative runtime facts, but they remain
members of the existing `RuntimeEvent` family rather than a rival event stream.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `RuntimeAggregateProjection` | `M03-engine-kernel` | current replay-derived truth | projection from events | none | retry decision, leaf-task admission |
| `RetryRepairDecision` | `M03-engine-kernel` | retry/repair planning authority | `deriveRetryRepairDecision(projection, policy)` | dispatch/emit shells | retry events, continuation repair, public stop projection |
| `LeafTaskEnvelope` | `M03-engine-kernel` | subordinate work envelope | parent-bound admission | leaf worker/tool shell | runtime events, parent projection, public stop projection |
| `RuntimeEvent` | `M03-engine-kernel` | append-only fact family | canonical `emit(...)` | event store write | projection, archive, postmortem |

## RuntimeEvent Variant Register

These variants are required for the implementation slice:

- `retry_repair_planned`
- `retry_attempt_opened`
- `retry_attempt_stopped`
- `retry_attempt_escalated`
- `retry_progress_recorded`
- `continuation_terminated`
- `continuation_reopened`
- `leaf_task_opened`
- `leaf_task_completed`
- `leaf_task_failed`

Existing event variants remain lawful members of the same event family where
already admitted.

## Retry Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `RetryAttemptIdentity` | subordinate | identity payload under retry attempt truth | minted by `retry_attempt_opened` |
| `RetryBudgetState` | subordinate | policy/projection detail, not public authority | derived from policy plus attempt facts |
| `ProgressSignal` | subordinate | evidence detail under retry progress | admitted by event truth |
| `PromptRegenerationInput` | subordinate | generation input, not durable runtime state | derived from current workspace/runtime projection |
| `ManifestRegenerationRef` | subordinate | evidence pointer for current manifest truth | minted per retry attempt |
| `ContinuationRepairLink` | subordinate | causal link between old and new continuation truth | emitted with termination/reopen events |

## Leaf-Task Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `ParentRuntimeIdentity` | subordinate | parent context inside one envelope | copied from projection and basis |
| `LeafTaskInput` | subordinate | schema-validated payload under one envelope | admitted before dispatch |
| `LeafTaskOutput` | subordinate | schema-validated payload under completion | admitted before completion event |
| `LeafTaskFailure` | subordinate | typed failure detail under one failed task | admitted before failure event |
| `LeafTaskResultRef` | subordinate | evidence pointer, not semantic authority | emitted as event detail |

## Retry Rules

- Same-edge retry must mint fresh `run_id`, `call_id`, and manifest identity.
- Prompt and manifest truth must be regenerated from current projection.
- Prior manifests may be evidence only. They are not current dispatch truth.
- Retry budget is explicit policy/projection truth.
- Stationary retry attempts must stop or escalate through runtime facts.
- Continuation repair terminates old continuation truth before opening linked
  new continuation truth.

## Leaf-Task Rules

- Leaf tasks are admitted only under a parent runtime boundary.
- Leaf-task input and output must be schema validated.
- Leaf-task execution must carry parent run/call/frame/vector identity where
  present.
- Leaf-task failure class must preserve runtime/payload/capability distinction
  without parsing worker internals.
- A leaf task cannot become a public top-level workflow carrier.

## Fail-Closed Rules

- Redispatching a stale manifest as current truth fails closed.
- Missing fresh attempt identity fails closed.
- Missing parent runtime identity for a leaf task fails closed.
- Invalid leaf-task input or output fails closed.
- In-place continuation mutation fails closed.
- Controller-local retry counters are not authoritative.
- A leaf-task wrapper that calls public start as a hidden sub-controller is not
  valid leaf-task realization.

## Promotion Rule

No subordinate payload may be promoted during the implementation slice unless:

1. it becomes independently replayable public or persisted authority,
2. it crosses module boundaries unchanged, and
3. the promotion is recorded in this IACS and the active implementation ticket
   before code lands.
