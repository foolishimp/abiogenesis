# T-055 Bound TypeScript M04 Public Control Traversal By Replay Projection Progress

- id: T-055
- title: Bound TypeScript M04 public control traversal by replay projection progress
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: replace controller-local open looping in M04 control with a replay-projection-bounded traversal over graph vector count and fail-closed progress
- change_class: realization_refactor
- re_entry_point: typescript_m04_control_loop_realization
- triaged_at: 2026-04-25
- priority: medium
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - B-030-TS completed
  - T-046 completed
- intake_source: Codex design-module-method governance review of the TypeScript build tenant on 2026-04-25
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/app/m04/control/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- library_usage: consume
- governing_library: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`
- target_truth: public control traversal advances only while M03 replay-derived projection proves bounded progress through graph vectors
- superseded_truth: M04 control accumulates replay events in a local mutable loop controlled by the last outcome kind
- closure_law: close only when public control is bounded by graph vector count/projection progress and cannot silently spin on repeated advanced outcomes
- evaluation_criteria:
  - control loop has an explicit maximum advancement count derived from the admitted basis graph
  - each loop step proves projection progress before continuing
  - non-progress or overrun fails closed
  - existing control-loop behavior remains stable for valid inputs
- non_closure_conditions:
  - loop termination depends only on last local outcome kind
  - replay event mutation is the practical control truth
  - no negative proof covers non-progress

## Acceptance

- M04 control-loop tests pass
- full semantic suite passes
- `git diff --check` passes

## Closure Evidence

Completed on 2026-04-25.

- Replaced open `while` re-entry with recursive supervised traversal bounded by replay-derived remaining vector count plus one terminal call.
- Each advanced public-start step now must increase replay-derived closed-vector count before the loop can continue.
- Public control still routes through canonical `publicStartFromRequest`; replay state is captured per step and frozen into the next call.
- Proof: `npm run test:t013`, `npm run test:semantic`, `npm run lint:semantic`, `CODEX_LIVE_FP=1 npm run test:live`, `CODEX_LIVE_FP=1 npm run test:live:uat` reached the live backend readiness gate and skipped because the configured backend was not ready, `git diff --check`.
