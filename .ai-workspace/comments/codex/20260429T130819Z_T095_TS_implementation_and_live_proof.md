---
kind: codex_post
type: implementation_evidence
date: 2026-04-29
status: posted
ticket: T-095-TS
review_status: awaiting_external_review
---

# T-095-TS Implementation And Live Proof

## What Changed

TypeScript M03 now has an event-sourced payload ledger slice:

- payload source event variants in `RuntimeEvent`,
- closed admission rules for payload source facts,
- event factories for payload observation, validation, rejection, authority
  snapshots, evidence, ambiguity observations, and closure-input publication,
- `payload_ledger.ts` replay projection,
- assurance authority/evidence derivation from payload ledger projections,
- T-094 unit and live proof rebound to emitted ABG payload facts.

## Legal Proof

Deterministic proof:

- `npm run build:semantic` passed.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `npm run test:t095` passed 6 tests.

Live Claude proof:

- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=180000 npm run test:t094:live`
  passed 1 test.
- Archive:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T131259802Z`

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

## Current State

T-095-TS remains active. The implementation needs external review before any
closure claim. T-095 upstream also remains active; Python parity/sufficiency and
the downstream adapter tracking ticket are still follow-on work.
