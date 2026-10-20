# M03 Retry/Repair And Leaf-Task Derivation

**Status**: Active
**Date**: 2026-04-25
**Purpose**: Derive the TypeScript/common `M03-engine-kernel` retry/repair and
bounded leaf-task governance boundary so repair and subordinate work remain
substrate-owned runtime truth rather than transport helper behavior, CLI loop
behavior, or product-local shadow runtime logic.

## 1. Source Material

This boundary derives from:

- `specification/requirements/abg/REQ-R-ABG3-RETRY.md`
- `specification/requirements/abg/REQ-R-ABG3-LEAFTASK.md`
- `specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md`
- `specification/requirements/abg/REQ-R-ABG3-CORRECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `specification/scenarios/06-replay-lineage-and-correction.md`
- `specification/scenarios/07-governed-probabilistic-runtime.md`
- `build_tenants/common/design/module_decomp.md`
- `build_tenants/common/design/modules/M03-engine-kernel.yml`
- `M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- `.ai-workspace/comments/codex/20260424T172930Z_T043_gtl_abg_requirement_to_typescript_trace_walkthrough.md`
- `.ai-workspace/tickets/completed/T-042-design-typescript-m03-generic-retry-repair-and-leaf-task-governance.md`

## 2. Common Ownership Claim

Retry/repair and leaf-task governance are shared `M03-engine-kernel` law.

They do not belong to:

- one TypeScript helper
- a CLI retry loop
- a transport adapter
- a downstream domain wrapper
- a product-specific abbreviation or presentation label

They belong to ABG because they alter runtime truth:

- retry opens fresh attempt identity
- retry regenerates prompt and manifest truth from current state
- retry closes, reopens, or links continuations by event truth
- leaf tasks bind subordinate work to parent runtime identity
- leaf-task failures classify at runtime/payload boundaries
- both surfaces must remain replay-visible

## 3. Retry/Repair Boundary

Retry/repair starts when replay-derived runtime truth shows that the same edge
may lawfully continue repair.

A lawful retry/repair attempt must:

- derive a fresh retry decision from current projection
- mint fresh runtime attempt identity
- regenerate prompt and manifest truth from current workspace and runtime
  state
- preserve prior attempts as replay-visible evidence only
- consume configured retry budget and progress signal truth
- stop or escalate when budget is exhausted or attempts are stationary
- terminate and reopen continuation truth by authoritative events when relevant

It must not:

- redispatch a stale prompt or manifest as current truth
- mutate continuation/correction truth in place
- hide budget exhaustion inside controller-local variables
- let a domain wrapper replace ABG retry execution truth

## 4. Leaf-Task Boundary

Leaf-task execution is bounded subordinate work under an existing parent
runtime boundary.

A lawful leaf task must:

- carry parent run, graph-call, frame, and vector identity where present
- admit schema-validated input
- produce schema-validated output or a typed failure
- record enough runtime fact truth for replay
- remain subordinate to the parent execution boundary

It must not:

- open a rival top-level workflow ontology
- target public `gen-start` directly as a hidden sub-controller
- parse probabilistic worker internals as domain truth
- lose parent identity or emit unowned helper facts

## 5. Relationship To Failure Taxonomy

This design declares the carrier surfaces that need failure classification.
`T-035` owns the final public/runtime taxonomy split for
runtime-unavailable, capability-missing, and true runtime-failure classes.

Until `T-035` lands, leaf-task and retry design must preserve the distinction
between:

- runtime/substrate failure
- capability missing
- payload or schema invalidity
- proof/closure failure after constructive work
- stationary retry exhaustion

It must not collapse those distinctions into generic `rejected` or transport
failure truth.

## 6. Required Proof Lanes

Implementation must declare and land proof lanes for:

- retry mints fresh `run_id`, `call_id`, and manifest identity
- retry regenerates prompt and manifest truth from current state
- stale manifest redispatch fails closed
- retry budget exhaustion or stationary attempts produce authoritative stop or
  escalation truth
- continuation repair closes old continuation and opens linked new truth
- leaf-task input/output schema validation
- leaf-task failure classification without parsing worker internals
- leaf-task execution remains parent-bound and cannot become a top-level
  workflow substitute

## 7. Deferred Boundary

This design does not implement the final public stop taxonomy. That remains
`T-035` and `B-030-TS`.

This design does not implement graph-function iteration itself. That is
designed by `T-041` and realized by `T-044`.

This design does not create domain-specific retry policy. Domains may refine
budget, retryability, escalation target, or progress criteria only through
declared GTL or policy surfaces.

## 8. Consequence

The successor implementation ticket must consume:

- `M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md`
- `M03_RETRY_REPAIR_LEAFTASK_STRUCTURAL_CARRIER_DIAGRAM.md`

Code work is not closure evidence for this design ticket unless it is carried
by a separate admitted implementation/proof ticket.
