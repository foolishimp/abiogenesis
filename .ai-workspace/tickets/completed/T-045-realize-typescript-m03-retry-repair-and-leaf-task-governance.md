# T-045 Realize TypeScript M03 Retry/Repair And Leaf-Task Governance

- id: T-045
- title: Realize TypeScript M03 retry/repair and leaf-task governance
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- source_ticket: T-042
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: realize TypeScript M03 retry/repair and bounded leaf-task governance over fresh attempt identity, current-state prompt/manifest truth, parent-bound subordinate work, and replay-visible runtime facts
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-042 completed
  - T-044 completed
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/test_env/**`, `build_tenants/abiogenesis/typescript/design/TYPESCRIPT_STRICT_LANE.md`, `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`
- intake_source: `T-042` design closure
- library_usage: none
- library_rationale: this is core `M03-engine-kernel` runtime governance, not a tenant-local helper library concern
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/M03_RETRY_REPAIR_LEAFTASK_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M03_RETRY_REPAIR_LEAFTASK_STRUCTURAL_CARRIER_DIAGRAM.md`
- target_truth: TypeScript M03 owns retry/repair and leaf-task governance as replay-visible runtime truth instead of transport helper loops or product-local shadow runtime behavior
- superseded_truth: TypeScript currently has transport/result protocol and reset/postmortem qualification evidence, but no concrete M03 retry/repair or parent-bound leaf-task carrier family
- closure_law: this ticket closes only when retry/repair and leaf-task carriers, event variants, proof lanes, strict-lane trace, and test-surface map show fresh attempt identity, stale-manifest rejection, parent-bound leaf-task execution, and typed failure boundaries
- evaluation_criteria:
  - retry mints fresh run/call/manifest identity
  - retry prompt/manifest truth regenerates from current projection
  - stale manifest redispatch fails closed
  - retry budget exhaustion or stationary attempts emit stop/escalation truth
  - leaf-task input/output schema validation is explicit
  - leaf-task failure classification preserves runtime/payload/capability boundaries
  - leaf-task execution remains parent-bound and not top-level
- non_closure_conditions:
  - retry semantics live only in transport helpers, CLI loops, or package-local orchestration
  - stale prompt or manifest truth is redispatched as current truth
  - continuation/correction truth is mutated in place
  - leaf-task execution becomes a rival top-level workflow ontology
  - failure classification requires parsing worker internals
- proof_surface:
  - module-derived unit tests
  - integration proof for retry/repair
  - integration proof for parent-bound leaf task
  - negative stale-manifest proof
  - negative top-level leaf-task proof
  - strict-lane update
  - test-surface map update
  - `npm run test:semantic`
  - `git diff --check`

## Migration Declaration

- old_truth_path: transport/result helpers and qualification fixtures can describe retries or subordinate behavior, but M03 has no retry/leaf-task carrier authority
- new_truth_path: M03 retry/repair and leaf-task carrier families emit replay-visible runtime facts over fresh attempt and parent-bound subordinate work truth
- producers_old:
  - transport/result helpers
  - reset/postmortem qualification fixtures
  - sandbox behavior portfolio fixtures
- producers_new:
  - retry/repair decision carrier
  - leaf-task envelope carrier
  - retry/repair runtime events
  - leaf-task runtime events
- consumers_old:
  - tests and downstream wrappers that infer retry or subordinate behavior from helper outputs
- consumers_new:
  - M03 aggregate projection
  - M04 stop projection
  - M05 sandbox/live/archive proof lanes
- derived_surfaces:
  - strict lane
  - test surface map
  - public stop taxonomy work

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence

## Closure Evidence

- `RetryRepairDecision`, `RetryAttemptIdentity`, `LeafTaskEnvelope`, and
  typed leaf-task failure carriers were added to M03 contracts.
- Retry/repair, continuation repair, and leaf-task runtime facts were added as
  closed `RuntimeEvent` variants and admitted by the canonical event shell.
- `RuntimeAggregateProjection` now replays retry attempt ids and leaf-task
  completion/failure ids.
- `npm run test:t045` passed with 8 tests.
- `npm run lint:semantic` passed.
- `npm run test:semantic` passed with 185 tests.
- `git diff --check` passed.
