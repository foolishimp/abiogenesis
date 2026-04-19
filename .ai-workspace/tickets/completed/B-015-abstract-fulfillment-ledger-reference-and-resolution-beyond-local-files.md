# B-015 Abstract Fulfillment Ledger Reference And Resolution Beyond Local Files

- id: B-015
- title: Introduce a backend-neutral reference/resolver contract for published fulfillment ledgers without moving domain topology into ABG
- type: bug
- status: completed
- goal: distributed-fulfillment-ledger
- change_intent: Separate stable fulfillment-ledger semantics from the current local file publication mechanism so ABG can support non-local or distributed ledger discovery and resolution while remaining unaware of domain obligation topology and fulfillment meaning.
- change_class: realization_refactor
- re_entry_point: realized_surface
- priority: high
- intake_source: follow-on architecture split from abiogenesis B-014 on 2026-04-18
- dependencies: B-014
- affected_boundary: ledger reference shape, resolver abstraction, runtime/reporting ledger discovery, publication backend neutrality
- triaged_at: 2026-04-18
- created_at: 2026-04-18
- activated_at: 2026-04-18
- completed_at: 2026-04-18
- updated_at: 2026-04-18
- authoritative_contract:
  - `assessed{kind: fp}` carries `published_ledger_ref`, not a raw path
  - runtime/reporting resolve ledgers through `resolve_published_fulfillment_ledger(...)`
  - current backend implementation is `workspace_file` keyed by `manifest_id`
- banned_legacy_surfaces:
  - `published_ledger_path` in assessed-event payloads
  - resolver `path=...` as the runtime/reporting discovery contract
  - live-status path output as the operator-facing truth handle
- close_condition:
  - all producers and consumers of fulfillment-ledger discovery bind through `published_ledger_ref` and the resolver contract

## Context

`B-014` proved the utility of the fulfillment carrier using the simplest lawful
substrate realization:

- local ledger files under `.ai-workspace/fp_ledgers/`
- runtime/reporting resolving that publication through the local backend

That carrier was correct, but the event and consumer contract was too concrete:
it exposed `published_ledger_path` directly. `B-015` closes that gap without
changing the ledger schema or importing domain semantics into ABG.

## Delivered Contract

ABG now publishes and consumes a stable ledger reference:

```json
{
  "kind": "published_fulfillment_ledger",
  "resolver": "workspace_file",
  "manifest_id": "<manifest_id>"
}
```

That ref is the stable runtime/reporting contract. The current
`workspace_file` resolver is only one implementation behind it.

## Producer Audit

- `result_ingest.py`
  - writes the current local file-backed ledger
  - emits `assessed{kind: fp}` with `published_ledger_ref`
- `fulfillment_followups.py`
  - republish/demotion path now reopens the same ledger through the ref
- direct fixture writers in proof lanes
  - migrated to publish `published_ledger_ref` instead of path-shaped event data

## Consumer Audit

- `binding.py`
  - `bind_fh(...)` resolves the ledger through the ref/resolver contract
  - `bind_fp_certified(...)` resolves the ledger through the ref/resolver contract
- `live_status.py`
  - resolves the same ledger through the same contract and reports
    `published_fulfillment_ledger_ref`
- `interpret.py`
  - replay catch-up for fulfillment edges resolves the same carrier through the
    same contract
- `cli_adapter.py`
  - validates `published_ledger_ref` as the assessed-event pointer contract

## Projection Audit

No projection is allowed to rediscover the ledger through a raw path field.
Lifecycle, runtime, and reporting now all consume the same ref/resolver family.

## Round 1 Closeout Authority

Implemented in code:

- [fulfillment_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_ledger.py)
  - `make_published_fulfillment_ledger_ref(...)`
  - `coerce_published_fulfillment_ledger_ref(...)`
  - `resolve_published_fulfillment_ledger(..., ledger_ref=..., workspace=...)`
  - `workspace_file` remains the first lawful backend
- [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py)
  - emits `published_ledger_ref`
  - returns `published_ledger_ref` in ingest summaries
- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py)
  - runtime certification/admission consume the ref/resolver contract
- [live_status.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/live_status.py)
  - reporting consumes the same ref/resolver contract
- [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py)
  - approval/revocation updates the same carrier through the ref
- [cli_adapter.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py)
  - assessed-event validation requires `published_ledger_ref`

## Acceptance

- runtime/reporting bind through a ledger reference and resolver contract, not a
  hard-coded local filesystem assumption
- the current local file backend remains a lawful supported implementation
- the ledger schema and convergence law remain unchanged across backend
  implementations
- a future non-local backend can be added by extending resolver dispatch
  without changing event schema or domain semantics
- ABG remains mechanism-only:
  - it carries ledger references and resolution
  - it does not own obligation topology or fulfillment law

## Proof

Green on the migrated model:

- `test_abg3_runtime_envelope.py`: `35 passed`
- `test_cli_adapter_auto.py`: `20 passed`
- `test_provenance_integration.py`: `28 passed`
- `test_m03_engine_kernel_integration.py`: `109 passed`
- `test_sandbox_usecases_fake.py`: `14 passed`
- `test_m01_gtl_core_integration.py`: `20 passed`
- `test_m02_work_publication_integration.py`: `10 passed`
- `test_usecases_u1_u4.py`: `4 passed`

## Non-Goals

- replacing the local file backend with a distributed backend in this ticket
- moving obligation topology into ABG
- redefining ledger semantics for downstream domains
- collapsing the wider IoC hook family into this slice

## Follow-On

`B-016` remains the wider hook-standardization ticket. `B-015` closes only the
fulfillment-ledger reference/resolver slice and provides the first concrete
`Ref + Resolver` proof for that broader architecture.
