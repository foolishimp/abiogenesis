---
id: T-095-TS
title: Realize TypeScript event-sourced payload ledger and legal proof
type: feature
ticket_category: implementation_migration
migration_strategy: inside_out_hard_break
status: active
review_status: external_review_accepted_closure_ready
source_ticket: T-095
build_tenant: typescript
goal: abg-total-assurance-calculus
goal_status: active
change_intent: Implement the TypeScript M03 payload source event family, replay-derived payload ledger projections, assurance input derivation, and T-094 two-hop proof rerun over admitted ABG facts.
change_class: design_reframe
re_entry_point: typescript_m03_payload_event_source
affected_boundary: TypeScript M03 RuntimeEvent carrier, event admission, event factories, payload ledger projection, assurance input derivation, T-094/T-095 tests, Claude live proof archive
priority: high
triaged_at: 2026-04-29T12:54:32Z
created_at: 2026-04-29T12:54:32Z
updated_at: 2026-04-30T00:50:46+10:00
dependencies:
  - T-095 active/reviewed_for_ts_ticket
  - T-094 active/external_review_received_not_closure_ready
  - T-096 active/ts_primary_release_scope
  - REQ-R-ABG3-PAYLOAD active
  - REQ-R-ABG3-ASSURANCE active
  - M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION active
library_usage: extend
governing_library:
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_admission.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/events/emit.ts
  - build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md
intake_source: External STDO review cleared T-095 for opening a suffixed TypeScript implementation ticket, with the condition that the implementation carries forward the concrete interface inventory, expands wildcard archive surfaces, and does not claim upstream closure.
target_truth: TypeScript ABG admits payload, authority, evidence, ambiguity, and closure-input source facts as `RuntimeEvent` truth. Payload, authority, evidence, ambiguity, and closure-input ledgers are projections over emitted events. T-094 two-hop proof constructs its register from those projections, not from harness-local assurance rows.
superseded_truth: TypeScript tests or runtime paths can build closure-relevant assurance evidence directly from worker output, provider callbacks, or harness-local register state without ABG payload source facts.
closure_law: This tenant ticket may not close until targeted TypeScript legal tests and the Claude live T-094/T-095 lane pass, external review accepts the implementation, and no old seam in the migration checklist remains authoritative. Passing unit tests alone does not close this ticket.
evaluation_criteria:
  - Runtime event carriers include payload source fact variants.
  - Event admission rejects malformed payload source facts.
  - Event factories construct admitted payload source facts.
  - Payload ledger projection is deterministic and does not create a new aggregate.
  - Assurance authority/evidence inputs can be derived from payload ledger projections.
  - T-094 unit proof uses emitted ABG payload facts.
  - T-094 live Claude proof archives event log, payload ledger, assurance projections, closure decisions, and register.
  - Negative tests cover shadow ledger, malformed payload event, and missing second-hop evidence.
  - No Codex live lane is used.
proof_surface:
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/assurance_gate.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/attached_fp_worker.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/payload_ledger.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t095_payload_ledger_unit.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t093_assurance_gate_integration.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t084_attached_fp_worker_loop.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t094_assurance_register_two_hop_unit.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/live/test_t094_assurance_register_two_hop_live.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T133349413Z
  - .ai-workspace/comments/codex/20260429T133349Z_T095_TS_event_sourced_closure_update.md
  - .ai-workspace/comments/codex/20260429T134500Z_T095_TS_external_review_acceptance.md
non_closure_conditions:
  - payload ledger is mutable state rather than replay projection
  - `assessed` event alone can satisfy assurance evidence
  - provider output can directly close or emit runtime truth
  - T-094 still constructs authority/evidence rows directly from harness state
  - live Claude lane is skipped or replaced by Codex live evidence
  - external implementation review has not accepted the proof
---

# T-095-TS: TypeScript Payload Ledger Implementation

This is the TypeScript tenant implementation ticket for T-095. It carries no
closure claim for Python or the upstream T-095 requirement/design ticket.

## Migration Checklist

- [x] `RuntimeEvent` includes payload source fact variants.
- [x] `RUNTIME_EVENT_KIND_VALUES` includes the payload source fact kinds.
- [x] `event_admission.ts` validates every payload source fact.
- [x] `event_factories.ts` constructs payload source facts.
- [x] `payload_ledger.ts` projects payload, authority, evidence, ambiguity, and
  closure-input ledgers from events.
- [x] assurance authority/evidence inputs can be derived from payload ledger
  projections.
- [x] assurance gate consumes payload-ledger projections; provider-only
  fulfilled evidence blocks as invalid ledger truth.
- [x] attached F_P worker emits payload source facts and engine-owned
  `vector_closed`; `assessed` is no longer a replay closure path.
- [x] M04 result assessment emits payload source facts before its legacy
  assessed read model.
- [x] T-094 unit proof uses emitted ABG events.
- [x] T-094 Claude live proof archives event log and payload ledger projection.
- [x] negative tests reject malformed payload facts, shadow ledger closure,
  validated-without-observed closure, rejected validated closure, provider-only
  closure, and assessed-only replay closure.
- [x] external review accepts implementation before closure.

## Required Break Order

1. Publish payload source facts in the M03 event carrier.
2. Add admission and constructors for those facts.
3. Add replay-derived projections.
4. Rebind T-094 proof to the projections.
5. Run targeted deterministic legal tests.
6. Run the Claude live lane.
7. Request external implementation review.

## Verification

- `npm run build:semantic` passed.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `npm run test:t095` passed 18 tests.
- Targeted regression pack passed 29 tests:
  `test_t093_assurance_gate_integration`, `test_t084_attached_fp_worker_loop`,
  `test_m04_result_assessment_unit`,
  `test_m04_result_assessment_integration`,
  `test_m04_engine_start_integration`,
  `test_m03_graph_function_iteration_unit`, and
  `t044-m03-graph-function-iteration-negative`.
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=180000 npm run test:t094:live`
  passed 1 live Claude test.
- `npm run test:semantic` passed 291 tests after repricing the stale
  M04/M05/T-087 expectations to the event-sourced payload truth path.
- The Claude-only live lane was rerun after the review response and archived
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T142205279Z`.
- `node --test build_tenants/abiogenesis/typescript/test_env/tests/test_t087_supervised_actor_invocation.test.mjs`
  passed 4 tests after blocked-transport salvage was strengthened to assert
  edge-scoped payload/authority/evidence linkage.

Live archive:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T133349413Z`
- `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T142205279Z`

Archive summary:

- `event_log.json`: `authority_snapshot_admitted`, `payload_observed`,
  `payload_validated`, `evidence_admitted`, `authority_snapshot_admitted`,
  `payload_observed`, `payload_validated`
- hop 1 payload ledger: observed 1, validated 1, evidence 1, authority 1
- hop 2 payload ledger: observed 1, validated 1, evidence 0, authority 1
- hop 1 decision: `close`
- hop 2 decision: `retry`
- register decision: `deepen`
- `mayConverge: false`

## External Review

External STDO implementation review by Huygens found no blocking findings for
T-095-TS and returned verdict: `closure-ready`.

Accepted points:

- provider-only closure is resolved,
- assessed replay closure is resolved,
- payload acceptance requires observed plus validated facts with matching digest,
- rejected and contradictory payload facts cannot satisfy evidence,
- classification proof coverage is adequate for T-095-TS,
- trace, ticket, and live archive surfaces are present.

This acceptance is tenant-local. It does not close upstream T-095, which still
requires external STDO design acceptance plus T-096 review of the
TS-primary/Python-paused tenant scope. It makes no Python parity or no-gap
claim.

The 2026-04-30 Codex external review found no new T-095-TS design defect, but
blocked the tranche on stale canonical TypeScript expectations outside the
focused T-095 test. Those expectations are now repriced and the full semantic
suite passes.
