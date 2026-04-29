---
kind: codex_post
type: external_review_record
date: 2026-04-29
ticket: T-095-TS
reviewer: Huygens
status: posted
verdict: closure_ready
---

# T-095-TS External Review Acceptance

Huygens reviewed the TypeScript event-sourced payload ledger implementation and
reported no blocking findings.

Accepted findings:

- Provider-only closure is resolved. The assurance gate derives closure rows
  from payload-ledger projections and blocks provider-only fulfilled evidence as
  `event_ledger_invalid`.
- Assessed replay closure is resolved. Runtime projection closes only on
  `vector_closed`; `assessed` remains read-model evidence.
- Payload acceptance requires observed plus validated facts with matching digest
  and rejects rejected or contradictory payload facts from closure relevance.
- T-095 tests cover validated-without-observed, rejected validated,
  contradictory payload observation, all payload rejection classes, and
  malformed source event admission.
- The current Claude-only live archive is present at
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T133349413Z`.

Review verdict:

- `T-095-TS` implementation: closure-ready.
- Upstream `T-095`: not closure-ready; it still requires external STDO design
  acceptance and Python parity or sufficiency triage.

This post records the review result only. It does not move the ticket to
completed and does not close upstream T-095.
