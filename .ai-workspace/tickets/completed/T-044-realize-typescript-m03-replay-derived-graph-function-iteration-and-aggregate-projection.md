# T-044 Realize TypeScript M03 Replay-Derived Graph-Function Iteration And Aggregate Projection

- id: T-044
- title: Realize TypeScript M03 replay-derived graph-function iteration and aggregate projection
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- source_ticket: T-041
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: replace the current TypeScript M03 first-step graph-function steel thread with replay-derived graph-call, frame, vector-local event, aggregate projection, and next-edge decision truth
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-041 completed
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/test_env/**`, `build_tenants/abiogenesis/typescript/design/TYPESCRIPT_STRICT_LANE.md`, `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`
- intake_source: `T-041` design closure
- library_usage: none
- library_rationale: this is core `M03-engine-kernel` runtime authority, not a tenant-local reusable helper library concern
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- target_truth: TypeScript M03 derives graph-function progression from replayed runtime events and aggregate projection instead of private loop state, package-local counters, or a fixed first-vector shortcut
- superseded_truth: TypeScript M03 currently admits a graph-function basis and derives one advancement transition, while multi-stage sandbox proof is harness-directed rather than kernel-owned next-edge truth
- closure_law: this ticket closes only when code, unit/integration proof, negative proof, strict-lane trace, and test-surface map show replay-derived graph-call/frame/vector/continuation projection and next-edge decisions as canonical M03 truth
- evaluation_criteria:
  - runtime event variants cover graph-call, frame, vector traversal, vector evaluation/closure, and continuation facts
  - aggregate projection is replay-derived and exposes run, graph-call, frame, and continuation truth
  - `IterationAdvanceDecision` is the only next-edge planning authority
  - composed graph-function proof advances beyond the first vector from replayed facts
  - negative tests reject first-vector-only and local-counter implementations
- non_closure_conditions:
  - public `start` or M04 control-loop repetition is treated as the internal engine
  - graph-call or frame truth is hidden inside run projection alone
  - next-edge selection reads local counters or private controller memory
  - composed graph-function proof is harness-directed rather than replay-derived
- proof_surface:
  - module-derived unit tests
  - integration proof for composed graph-function progression
  - negative proof for first-vector-only and local-counter drift
  - strict-lane update
  - test-surface map update
  - `npm run test:semantic`
  - `git diff --check`

## Migration Declaration

- old_truth_path: one admitted basis plus one advancement transition, with multi-stage sandbox proof sequenced outside the kernel
- new_truth_path: replay-derived aggregate projection plus closed `IterationAdvanceDecision` family governs internal graph-function advancement
- producers_old:
  - `deriveAdvancementTransition(...)`
  - installed sandbox harness sequencing
- producers_new:
  - runtime event variants
  - aggregate projection helpers
  - iteration decision derivation
- consumers_old:
  - public-start/control-loop consumers
  - sandbox proof harnesses
- consumers_new:
  - M03 event emission
  - M03 transport/evaluator effect plans
  - M04 public stop projection
  - M05 sandbox/live proof lanes
- derived_surfaces:
  - strict lane
  - test surface map
  - successor public stop taxonomy work

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence

## Closure Evidence

Completed on 2026-04-25.

Canonical realization:

- `RuntimeEvent` now includes graph-call, frame, vector traversal, vector
  evaluation, and vector closure facts.
- `RuntimeAggregateProjection` derives graph-call/frame/vector state from
  replayed event truth.
- `IterationAdvanceDecision` is the M03 next-vector authority.
- `deriveAdvancementTransition(basis, events)` advances composed graph
  functions beyond vector zero from replayed closure facts.
- `dispatchRequestsForTransition(...)` consumes the selected transition vector.

Proof:

- `npm run test:t044`
- `npm run test:t036`
- `npm run lint:semantic`
- `npm run test:semantic`
