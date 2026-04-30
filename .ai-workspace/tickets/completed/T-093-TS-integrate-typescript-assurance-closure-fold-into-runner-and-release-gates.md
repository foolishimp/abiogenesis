---
id: T-093-TS
title: Integrate TypeScript assurance closure fold into runner and release gates
type: feature
ticket_category: implementation_migration
status: completed
review_status: external_review_accepted
closure_candidate_at: 2026-04-29T08:44:05Z
completed_at: 2026-04-30T17:57:01+10:00
goal: abg-total-assurance-calculus
goal_status: active
build_tenant: typescript
activation_requires: T-092-TS completed/external_review_accepted with local proof passing
change_intent: Consume the TypeScript ABG assurance projection and closure decision in runner/release gate surfaces so traversal convergence, installed operator success, archive shape, or downstream reports cannot be mistaken for assurance closure.
change_class: realization_refactor
re_entry_point: realized_surface
affected_boundary: TypeScript M03 runner, public start/convergence projection, release/archive finalization, installed sandbox/live proof, downstream adapter handoff
priority: high
triaged_at: 2026-04-29T08:23:15Z
created_at: 2026-04-29T08:23:15Z
updated_at: 2026-04-30T17:57:01+10:00
dependencies:
  - T-088 completed
  - T-089 completed
  - T-090 completed/external_review_accepted
  - T-091 completed/external_review_accepted
  - T-092-TS completed/external_review_accepted
migration_strategy: inside_out_core_interface_migration
library_usage: consume
governing_library:
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/assurance.ts
governance_scope: STDO Method
intake_source: T-092-TS implemented and locally proved the projection/fold library as a review-pending closure candidate but explicitly did not claim runner/release gate integration. The next substrate risk is that existing convergence or archive paths can still be interpreted as closure without consuming `AssuranceClosureDecision`.
target_truth: TypeScript runner/release surfaces consume assurance projection and closure decision before claiming assurance closure. Convergence can still mean graph traversal completion, but it cannot imply assurance closure unless the assurance fold closes or lawfully defers the scope.
superseded_truth: Passing TypeScript semantic tests, traversal convergence, installed sandbox success, archive finalization, or report shape is enough to claim total assurance closure.
non_goal:
  - Do not redesign the assurance carrier model from T-090/T-092-TS.
  - Do not implement Python tenant integration.
  - Do not move downstream odd_sdlc semantics into ABG.
  - Do not require every graph function to have a domain-specific gain function before a qualified defer policy can be represented.
closure_law: Close only after runner/release code consumes `AssuranceClosureDecision` or explicitly records why a scope is not assurance-capable, and tests prove that convergence/archive/report success cannot bypass non-closing assurance rows.
evaluation_criteria:
  - Runner or release projection distinguishes traversal convergence from assurance closure.
  - A non-closing assurance row blocks assurance closure even when traversal converges.
  - A `close` decision permits assurance closure only when every row is fulfilled or lawfully deferred.
  - Installed/archive reports render assurance projection as read-model truth and cannot invent closure.
  - Downstream adapter handoff can consume assurance projection without owning ABG closure.
proof_surface:
  - TypeScript unit/integration proof: `npm run test:t093`
  - regression proof for T-092 assurance projection/fold: `npm run test:t092`
  - regression proof for plugin boundary inventory: `npm run test:t072:plugins`
  - semantic lint proof: `npm run lint:semantic`
  - full semantic proof: `npm run test:semantic`
  - live proof remains deferred to a separate installed/live assurance ticket if required by review
non_closure_conditions:
  - runner still treats terminal convergence as assurance closure
  - archive finalization or installed proof bypasses assurance rows
  - reports write closure truth instead of consuming projection truth
  - downstream product adapter owns generic assurance closure
---

# T-093-TS: Assurance Gate Integration

This is the TypeScript follow-on opened by T-092-TS.

T-092-TS created and proved the projection/fold. T-093-TS makes existing
runner/release paths consume it so the new assurance law affects closure
behavior instead of remaining a library-only capability.

## Closure Candidate Evidence

This ticket closed after another agent reviewed and accepted the implementation.

Implemented surfaces:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/assurance_gate.ts`
  adds the runner-owned assurance gate over the T-092 projection/fold.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`
  evaluates the gate at convergence and emits `gap_stop` when assurance rows
  produce non-closing decisions.
- `build_tenants/abiogenesis/typescript/code/src/app/m04/contracts/constructors.ts`
  and `build_tenants/abiogenesis/typescript/code/src/app/m04/start.ts` project
  assurance read-model truth into public start traces when an assurance provider
  is present.
- `build_tenants/abiogenesis/typescript/code/src/qualification/m05/archive_finalization*.ts`
  preserves assurance projection truth in archive summaries without inferring
  closure from `converged: true`.

Verification:

- `npm run build:semantic` passed.
- `npm run test:t093` passed 6 tests.
- `npm run test:t092` passed 14 tests.
- `npm run test:t072:plugins` passed 7 tests.
- `npm run lint:semantic` passed.
- `npm run test:semantic` passed 296 tests after stale M04/M05/T-087 canonical
  expectations were repriced to the event-sourced payload truth path.

The 2026-04-30 external review red-suite blockers are resolved. Claude's
2026-04-30 closure-readiness review accepted this ticket for closure.
