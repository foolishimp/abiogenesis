# T-056 Replace TypeScript M05 Portfolio Accumulators With Declarative Qualification Obligations

- id: T-056
- title: Replace TypeScript M05 portfolio accumulators with declarative qualification obligations
- type: chore
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: finish the T-052 commonization by replacing local M05 portfolio `gaps.push` procedures with declarative obligation evaluation over scenario truth
- change_class: realization_refactor
- re_entry_point: typescript_m05_qualification_commonization
- triaged_at: 2026-04-25
- priority: medium
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-052 completed
- intake_source: Codex design-module-method governance review of the TypeScript build tenant on 2026-04-25
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- library_usage: extend
- governing_library: `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`
- target_truth: M05 live and sandbox portfolio lanes declare scenario obligations and use one pure evaluator to derive qualification gaps
- superseded_truth: each M05 portfolio locally pushes gaps through similar imperative checks
- closure_law: close only when repeated portfolio gap logic is represented as declarative obligations and common evaluators return immutable gap results
- evaluation_criteria:
  - common obligation evaluator covers boolean, ref, count, event-kind, and final-status checks
  - live portfolio consumes the common evaluator
  - sandbox behavior portfolio consumes the common evaluator
  - local mutable gap arrays are removed from those lanes
  - common evaluator has unit proof
- non_closure_conditions:
  - commonization remains only a mutating helper
  - live and sandbox portfolios keep structurally duplicate gap procedures
  - proof lanes can diverge on the same obligation class

## Acceptance

- M05 commonization and portfolio tests pass
- full semantic suite passes
- `git diff --check` passes

## Closure Evidence

Completed on 2026-04-25.

- Replaced mutating `appendGapIf` with declarative `QualificationObligation` and `collectQualificationObligationGaps`.
- Rebound live and sandbox behavior portfolio checks to common obligation evaluation.
- Added unit proof for immutable common gap derivation.
- Proof: `npm run test:t031`, `npm run test:t036`, `npm run test:semantic`, `npm run lint:semantic`, `CODEX_LIVE_FP=1 npm run test:live`, `CODEX_LIVE_FP=1 npm run test:live:uat` reached the live backend readiness gate and skipped because the configured backend was not ready, `git diff --check`.
