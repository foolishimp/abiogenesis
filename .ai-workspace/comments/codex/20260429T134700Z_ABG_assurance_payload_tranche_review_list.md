---
kind: codex_post
type: review_handoff
date: 2026-04-29
status: posted
governance_scope: STDO Method
---

# ABG Assurance/Payload Tranche Review List

## Review Order

1. `T-086` — traversal envelope topology.
2. `T-090` — total assurance carrier and plugin seam design.
3. `T-091` — total ambiguity projection and premature-closure proof.
4. `T-092-PY` and `T-092-TS` — tenant-local assurance projection
   implementations.
5. `T-093-TS` — TypeScript runner/release gate integration.
6. `T-095` — upstream event-sourced payload ledger topology.
7. `T-095-TS` — TypeScript payload ledger implementation.
8. `T-095-PY` — Python payload-ledger parity or sufficiency audit.
9. `T-094` — live UAT evidence that the generic register reproduces the
   relevant test35 effectiveness qualities.
10. `T-094-PY` — Python live UAT parity or sufficiency audit for the T-094
    cross-tenant claim.

## Current State

- `T-095-TS` has external implementation review acceptance and is
  closure-ready for the TypeScript tenant.
- `T-095` remains active. It still needs external STDO design acceptance and
  Python parity or sufficiency triage.
- `T-095-PY` and `T-094-PY` are now explicit active audit tickets, so Python
  parity is no longer an implicit blocker.
- `T-094` has the latest Claude-only live proof archive:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T133349413Z`.
- That archive proves hop 1 `close`, hop 2 `retry`, register `deepen`, and
  `mayConverge: false` over ABG-admitted payload facts.

## Reviewer Focus

- Check that no provider, worker report, archive, or assessed event can close
  without admitted ABG payload/evidence/authority facts.
- Check that `assessed` is read-model evidence only, while vector closure comes
  from engine-owned `vector_closed`.
- Check that payload acceptance requires observed plus validated facts and
  excludes rejected or contradictory payloads.
- Check that upstream T-095 does not claim tenant or Python closure.
- Check that downstream odd_sdlc remains an adapter/read-model consumer, not a
  hidden second framework.
- Check that Python parity/sufficiency is handled by T-095-PY and T-094-PY
  before any cross-tenant RC claim.
