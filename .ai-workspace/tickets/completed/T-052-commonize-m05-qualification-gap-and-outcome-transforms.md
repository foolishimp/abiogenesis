# T-052 Commonize M05 Qualification Gap And Outcome Transforms

- id: T-052
- title: Commonize M05 qualification gap and outcome transforms
- type: chore
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: extract the repeated M05 qualification gap/outcome pattern into a tenant-local commonization surface so live, sandbox, archive, reset, and method-trace proof lanes do not rebuild imperative gap collection independently
- change_class: design_reframe
- re_entry_point: typescript_m05_qualification_design_surface
- triaged_at: 2026-04-25
- priority: medium
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-021 completed
  - T-030 completed
  - T-031 completed
  - T-032 completed
  - T-036 completed
  - T-037 completed
- intake_source: Codex design-module-method governance review of the TypeScript build tenant on 2026-04-25
- affected_boundary: `build_tenants/abiogenesis/typescript/design/M05_*`, `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- library_usage: extend
- governing_library: `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`
- target_truth: M05 qualification uses one reusable tenant-local gap/outcome transform family, with domain-specific gap enums retained only where they carry distinct meaning
- superseded_truth: live portfolio, sandbox behavior portfolio, installed archive, reset postmortem, archive finalization, and method trace each rebuild similar gap refs, outcome carriers, and imperative `gaps.push` accumulation
- closure_law: this ticket closes only when the recurring qualification pattern is factored into a common surface and each proof lane either consumes it or records a design-level reason for remaining boundary-specific
- evaluation_criteria:
  - common `QualificationGap` or equivalent carrier pattern exists
  - common helpers cover required/missing, uniqueness, expected-event-kind, and scenario obligation checks where applicable
  - live and sandbox portfolio lanes consume the common transforms
  - at least one additional M05 lane is reviewed for consumption or explicit non-consumption
  - old local imperative accumulators are removed or demoted from authority
- non_closure_conditions:
  - each M05 lane keeps a separate gap/outcome carrier family with no commonization decision
  - commonization is only cosmetic and imperative law remains duplicated
  - a third local rebuild is accepted without library declaration
  - proof reports can diverge in gap semantics for the same obligation class
- proof_surface:
  - unit tests for common qualification transforms
  - updated live portfolio proof
  - updated sandbox behavior portfolio proof
  - negative proof for missing/duplicate obligations through the common transform
  - `npm run test:semantic`
  - `git diff --check`

## Migration Declaration

- old_truth_path: each M05 proof lane owns local gap/outcome carriers and local imperative accumulation
- new_truth_path: one M05 qualification commonization surface owns recurring gap/outcome transforms consumed by proof lanes
- producers_old:
  - `code/src/qualification/m05/live_portfolio.ts`
  - `code/src/qualification/m05/sandbox_behavior_portfolio.ts`
  - `code/src/qualification/m05/method_trace.ts`
  - `code/src/qualification/m05/reset_postmortem.ts`
  - `code/src/qualification/m05/installed.ts`
- producers_new:
  - M05 qualification common carrier/helpers
  - domain-specific gap enum extensions where justified
- consumers_old:
  - M05 live proof
  - M05 sandbox proof
  - M05 archive/reset/method-trace proof
- consumers_new:
  - same proof lanes consuming common transforms
- derived_surfaces:
  - sandbox/live reports
  - archive reports
  - test surface map
  - RC closure reports

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] tests proving mixed old/new behavior are removed or repriced
- [x] recurring realization patterns are checked against existing library/commonization surfaces
- [x] ticket declares library usage and names the governing library or rationale
- [x] if the work exists in more than one build tenant, this backlog/active ticket carries only one tenant lifecycle and any sibling tenant work lives on its own suffixed ticket
- [x] ticket wording, product wording, and proof claims are reconciled before closure

## Functional Review Criteria

1. Does M05 now have one reusable gap/outcome pattern instead of repeated lane-local implementations?
2. Are domain-specific gap kinds still explicit where they carry different meaning?
3. Are proof lanes pure transforms over admitted scenario/archive/runtime truth?
4. Does missing or duplicate proof obligation logic live in common transforms rather than repeated `gaps.push` blocks?

## Required Break Order

1. Inventory M05 gap/outcome carrier families and accumulation functions.
2. Design the common M05 qualification carrier/helper surface.
3. Rebind live and sandbox portfolios first because they show the clearest recurrence.
4. Review archive, reset, and method-trace lanes for consumption or explicit non-consumption.
5. Remove or demote local imperative accumulators that duplicate common law.
6. Add negative proof through the common transforms.

## Closure Evidence

Completed on 2026-04-25.

- Added `qualification_common.ts` with common gap append, required-ref, required-event-kind, and scenario-cardinality transforms.
- Rebound live scenario portfolio to common required-ref, required-event-kind, scenario-cardinality, and stage mismatch helpers.
- Rebound sandbox behavior portfolio to common scenario-cardinality and required-event-kind helpers.
- Updated M05 reference event obligations to include replay-visible graph-call/frame/vector traversal facts from public start.
- Proof: `npm run test:t031`, `npm run test:t036`, `npm run test:semantic`, `npm run lint:semantic`, `git diff --check`.
