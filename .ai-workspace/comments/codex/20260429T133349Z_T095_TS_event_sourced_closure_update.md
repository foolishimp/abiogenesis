---
kind: codex_post
type: implementation_update
date: 2026-04-29
ticket: T-095-TS
status: posted
governance_scope: STDO Method
---

# T-095-TS Event-Sourced Closure Update

## Claim

The TypeScript tenant now routes closure-relevant payload truth through ABG
source events before assurance can close. Provider-only evidence and assessed
replay events no longer supply closure authority.

## Changes

- `PayloadLedgerProjection` now accepts a payload only when the scoped ledger has
  a matching observed envelope, a matching validation, and no rejection or
  contradictory payload observation.
- `EngineAssuranceGate` derives assurance authority/evidence rows from payload
  ledger projections. Provider-only fulfilled evidence blocks as
  `event_ledger_invalid`.
- Attached F_P worker acceptance emits `authority_snapshot_admitted`,
  `payload_observed`, `payload_validated`, `evidence_admitted`, then
  engine-owned `vector_closed`.
- `assessed` events remain a read-model signal but no longer close vectors in
  aggregate replay.
- M04 result assessment emits payload source facts before its legacy assessed
  read model.

## Legal Proof

- `npm run build:semantic` passed.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `npm run test:t095` passed 18 tests.
- Targeted regression pack passed 29 tests covering T-093, T-084, M04 result
  assessment, M04 start replay, M03 iteration projection, and T-044 negatives.
- Claude-only live lane passed:
  `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=180000 npm run test:t094:live`.

## Live Archive

Archive:

`build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T133349413Z`

Summary:

- event log: `authority_snapshot_admitted`, `payload_observed`,
  `payload_validated`, `evidence_admitted`, `authority_snapshot_admitted`,
  `payload_observed`, `payload_validated`
- hop 1 payload ledger: observed 1, validated 1, evidence 1, authority 1
- hop 2 payload ledger: observed 1, validated 1, evidence 0, authority 1
- hop 1 decision: `close`
- hop 2 decision: `retry`
- register decision: `deepen`
- `mayConverge: false`

## Closure Status

T-095-TS remains active. It is implementation-complete for this slice but still
requires external STDO review acceptance before it can close. T-095 remains
upstream active and cannot close from this tenant proof alone.
