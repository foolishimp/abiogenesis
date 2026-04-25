# T-053 Complete TypeScript M03 Module-Owned Runtime Transforms And Projection Carriers

- id: T-053
- title: Complete TypeScript M03 module-owned runtime transforms and projection carriers
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: finish the T-050 structural split by moving runtime projection, iteration, retry repair, leaf task, and event factory law out of the catch-all constructors file and by making projection subcarriers first-class
- change_class: realization_refactor
- re_entry_point: typescript_m03_realization_structure
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-050 completed
- intake_source: Codex design-module-method governance review of the TypeScript build tenant on 2026-04-25
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- library_usage: extend
- governing_library: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`
- target_truth: M03 runtime transform authority is located in role-owned modules, and `RuntimeAggregateProjection` carries separately inspectable run, graph-call, frame, and continuation projections
- superseded_truth: `contracts/constructors.ts` remains the practical authority center and projection subcarriers exist only in design wording
- closure_law: close only when `constructors.ts` is no longer the discovery point for M03 runtime transform law and projection subcarriers are present in typed code
- evaluation_criteria:
  - projection replay implementation lives in `projection.ts`
  - iteration transition implementation lives in `iteration.ts`
  - retry repair implementation lives in `retry_repair.ts`
  - leaf-task implementation lives in `leaf_task.ts`
  - event factory implementation lives in `event_factories.ts`
  - `constructors.ts` retains only basis construction and explicit compatibility exports
  - `RuntimeAggregateProjection` includes first-class run, graph-call, frame, and continuation projection subcarriers
- non_closure_conditions:
  - role files only re-export implementations from `constructors.ts`
  - projection subcarriers remain design-only
  - behavior changes are mixed into the refactor without proof

## Migration Declaration

- old_truth_path: M03 runtime law concentrated in `contracts/constructors.ts`
- new_truth_path: role-owned transform modules plus a narrow basis constructor/compatibility surface
- producers_old:
  - `code/src/abg/m03/contracts/constructors.ts`
- producers_new:
  - `code/src/abg/m03/contracts/projection.ts`
  - `code/src/abg/m03/contracts/iteration.ts`
  - `code/src/abg/m03/contracts/retry_repair.ts`
  - `code/src/abg/m03/contracts/leaf_task.ts`
  - `code/src/abg/m03/contracts/event_factories.ts`
- consumers_old:
  - M03 barrel exports
  - M04 public start/control consumers
  - M05 fixtures and proof lanes
- consumers_new:
  - same consumers bound through role-owned modules
- derived_surfaces:
  - TypeScript declarations
  - semantic and M03/M04/M05 test lanes

## Acceptance

- M03 code compiles with role-owned implementation modules
- module-derived M03 graph-iteration and retry/leaf tests pass
- full semantic suite passes
- `git diff --check` passes

## Closure Evidence

Completed on 2026-04-25.

- Moved projection replay, iteration, retry repair, leaf task, and event factory implementations into role-owned M03 modules.
- Reduced `contracts/constructors.ts` to execution-basis construction plus explicit compatibility exports.
- Added first-class `RunProjection`, `GraphCallProjection`, `FrameProjection`, and `ContinuationProjection` subcarriers to `RuntimeAggregateProjection`.
- Added unit proof that aggregate projection exposes the subcarrier structure.
- Proof: `npm run test:t044`, `npm run test:t045`, `npm run test:semantic`, `npm run lint:semantic`, `CODEX_LIVE_FP=1 npm run test:live`, `CODEX_LIVE_FP=1 npm run test:live:uat` reached the live backend readiness gate and skipped because the configured backend was not ready, `git diff --check`.
