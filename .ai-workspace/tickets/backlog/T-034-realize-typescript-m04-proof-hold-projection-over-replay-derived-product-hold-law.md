# T-034 Realize TypeScript `M04` proof-hold projection over replay-derived product hold law

- id: T-034
- title: Realize TypeScript `M04` proof-hold projection over replay-derived product hold law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: backlog
- source_ticket: B-030-TS
- build_tenant: typescript
- goal: typescript-tenant-m04-proof-hold-projection
- change_intent: Close the deferred TypeScript proof-hold gap so public start and live-status can project replay-derived product hold truth instead of omitting it or forcing downstream wrappers to infer it.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - B-030-TS backlog
  - T-018 completed
- intake_source: `B-030-TS` application to TypeScript exposed proof-hold as a still-missing public stop/status input
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: none
- library_rationale: proof-hold is module-owned replay/projection truth, not a reusable tenant-local realization pattern
- authoritative_contract: before code opens, the tenant must declare one proof-hold derivation asset, one first-slice IACS, one structural carrier diagram, and one proof lane set over replay-derived hold truth consumed by public start and live-status
- governing_design:
  - build_tenants/abiogenesis/typescript/design/M04_LIVE_STATUS_DERIVATION.md
  - build_tenants/abiogenesis/python/code/genesis/proof_hold.py
  - .ai-workspace/tickets/backlog/B-030-TS-realize-typescript-m04-complete-start-callable-surface-and-stop-taxonomy-over-canonical-public-control-truth.md
- constitutional_requirements:
  - specification/requirements/product/REQ-P-POLICY.md
- target_truth: TypeScript publishes one replay-derived proof-hold projection family consumed consistently by public start and live status
- superseded_truth: TypeScript currently defers proof-hold and cannot project it through the public operator or status surfaces
- closure_law: this ticket closes only when proof-hold truth is explicit, replay-derived, shared by start and live-status, and proven without controller-local memory

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/code/genesis/proof_hold.py`
- `build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- `build_tenants/abiogenesis/python/code/genesis/live_status.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py`

## Completion

It completes only when:

- TypeScript has an explicit proof-hold design/module pack
- one bounded public proof-hold projection is landed
- public start and live-status consume the same proof-hold truth
- negative proof shows proof-hold is not controller-local memory
