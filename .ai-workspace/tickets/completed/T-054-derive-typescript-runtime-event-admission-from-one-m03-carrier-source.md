# T-054 Derive TypeScript Runtime Event Admission From One M03 Carrier Source

- id: T-054
- title: Derive TypeScript runtime event admission from one M03 carrier source
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: replace manual runtime-event admission switches and downstream literal reconstruction with one M03-owned variant admission surface
- change_class: realization_refactor
- re_entry_point: typescript_m03_runtime_event_admission
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-051 completed
- intake_source: Codex design-module-method governance review of the TypeScript build tenant on 2026-04-25
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/events/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/live_status/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- library_usage: extend
- governing_library: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`
- target_truth: runtime event kind and variant admission is maintained as one M03-owned registry consumed by event emission and downstream projections
- superseded_truth: `emit.ts` and M04 live-status admission retain independent parser/admission logic that can drift from carrier truth
- closure_law: close only when runtime event admission is table/registry driven from M03-owned truth and downstream consumers no longer restate the same law
- evaluation_criteria:
  - `emit.ts` consumes a closed variant admission registry
  - common string/list/failure validation is shared rather than repeated locally
  - M04 live status consumes M03-owned event/failure admission helpers
  - unknown event/failure truth still fails closed
- non_closure_conditions:
  - event admission remains a long independent switch
  - M04 keeps its own runtime event/failure literal admission law
  - no negative proof covers unknown or stale runtime event values

## Acceptance

- event admission tests and live-status tests pass
- full semantic suite passes
- `git diff --check` passes

## Closure Evidence

Completed on 2026-04-25.

- Added M03-owned `event_admission.ts` with a closed per-kind runtime-event admission registry.
- Replaced the large `emit.ts` switch with normalization plus `assertRuntimeEvent`.
- Rebound M04 live-status admission to M03-owned runtime event, terminal kind, and failure-class parsers.
- Updated live proof expectations to the canonical replay-visible F_P event sequence.
- Proof: `npm run test:semantic`, `npm run lint:semantic`, `CODEX_LIVE_FP=1 npm run test:live`, `CODEX_LIVE_FP=1 npm run test:live:uat` reached the live backend readiness gate and skipped because the configured backend was not ready, `git diff --check`.
