---
kind: codex_post
type: external_review_record
date: 2026-04-30
status: posted
reviewer: codex
scope:
  - T-086
  - T-090
  - T-091
  - T-092-PY
  - T-092-TS
  - T-093-TS
  - T-095
governance_scope: STDO Method
verdict: partial_acceptance_with_blockers
---

# ABG Assurance/Payload External Review

## Findings

1. Blocking: the current TypeScript semantic suite does not pass.

   `npm run test:semantic` currently reports 287 passing tests and 4 failing
   tests. The failures are migration fallout from the event-sourced payload
   hard break:

   - `test_m04_cli_binary_integration.test.mjs`: `assess-result` still expects
     only `assessed`, but the implementation now emits
     `authority_snapshot_admitted`, `payload_observed`, `payload_validated`,
     `evidence_admitted`, then `assessed`.
   - `test_m05_installed_graph_function_target_integration.test.mjs`: installed
     sandbox expected the old `assessed`-only suffix and does not include the
     new payload source events.
   - `test_m05_three_stage_graph_function_sandbox_integration.test.mjs`: same
     stale expected event sequence across three vectors.
   - `test_t087_supervised_actor_invocation.test.mjs`: the blocked-transport
     salvage assertion still expects `assessed` edge read-model rows, while the
     current accepted path closes through engine-owned vector closure and
     payload events.

   These are not assurance-row proof failures, but they are release-gate
   failures. T-091, T-092-TS, T-093-TS, and T-095 cannot claim full semantic
   proof while this suite is red.

2. Blocking: the current Python default suite does not pass.

   `./run_tests` currently reports 343 passing tests, 3 failing tests, and 19
   deselected. The failures are all in `test_spec_method_trace.py`:

   - `11-event-sourced-payload-ledger-uat.md` lacks `**Derives from**`
     metadata.
   - `REQ-R-ABG3-PAYLOAD` has no canonical Python test validator or explicit
     sufficiency/no-gap record.
   - `10-total-assurance-projection-uat.md` and
     `11-event-sourced-payload-ledger-uat.md` are not linked from the canonical
     Python test surface map.

   This blocks upstream T-095 closure and blocks any claim that the Python lane
   has a governed payload-ledger parity waiver.

## Acceptance Decisions

| Ticket | Review decision |
| --- | --- |
| `T-086` | Accepted. The traversal envelope is correctly treated as a replay/read-model view over existing M03 carriers, not a new prime aggregate. |
| `T-090` | Accepted. The assurance carrier/plugin design consumes T-086, preserves B-016 provider limits, and does not introduce a public `UnitOfCompute` aggregate. |
| `T-091` | Proof matrix accepted, but ticket closure is blocked by the current red TypeScript semantic suite and red Python default suite. |
| `T-092-PY` | Python assurance projection/fold implementation accepted for the T-092 scope. No Python sufficiency waiver is needed for T-092 because Python implementation exists and its focused proof passes. |
| `T-092-TS` | TypeScript assurance projection/fold implementation accepted for the focused T-092 scope. Full semantic proof remains blocked by stale post-payload event expectations outside the focused test. |
| `T-093-TS` | Focused runner/release gate integration accepted. Full closure remains blocked until the older M04/M05/T-087 tests are repriced to the event-sourced payload truth path. |
| `T-095` | Direction accepted; formal closure acceptance blocked. The design topology is correct, but Python payload parity/sufficiency and canonical trace links are not yet present, and the full TS semantic suite is red. |

## Code Review Notes

The assurance implementation matches the requirement/design law in both
tenants:

- Python and TypeScript define all ten assurance statuses:
  `fulfilled`, `partial`, `missing`, `stale_input`, `authority_missing`,
  `orphan_evidence`, `contradictory_authority`, `contradictory_evidence`,
  `deferred`, and `event_ledger_invalid`.
- Both tenants fold rows to exactly one closure decision family:
  `close`, `retry`, `reprice`, `block`, or `qualified_defer`.
- Provider outputs are guarded against engine-owned authority fields.
- Reports are read models over projection/decision truth.

The TypeScript runner gate is also structurally correct:

- absent assurance capability records `not_assurance_capable`, not closure;
- provider-only assurance truth blocks as `event_ledger_invalid`;
- event-sourced authority/payload/evidence facts can close;
- archive summaries render assurance truth as read-model data.

The payload ledger implementation is directionally correct:

- payload/authority/evidence facts are RuntimeEvent source facts;
- `derivePayloadLedgerProjection(...)` is replay-derived;
- accepted evidence requires observed plus validated payload facts with matching
  digest;
- rejected, contradictory, validation-only, or malformed payload facts cannot
  satisfy evidence;
- `assessed` is no longer vector closure authority.

The blocker is propagation: older canonical tests and Python method-trace
surfaces have not been repriced to that new truth path.

## Verification Run

Passed:

- `npm run test:t092`: 14 passed.
- `npm run test:t093`: 6 passed.
- `npm run test:t095`: 18 passed.
- `npm run test:t072:plugins`: 7 passed.
- `npm run lint:semantic`: passed.
- `./run_tests file tests/test_t092_total_assurance_projection.py`: 14 passed.

Failed:

- `npm run test:semantic`: 287 passed, 4 failed.
- `./run_tests`: 343 passed, 3 failed, 19 deselected.

Live lanes were not rerun in this review.

## Required Fix Before Full Acceptance

1. Reprice the four failing TypeScript semantic tests so their expected event
   sequences include the event-sourced payload facts and no longer treat
   `assessed` as closure authority.
2. Add `**Derives from**` metadata to
   `specification/scenarios/11-event-sourced-payload-ledger-uat.md`.
3. Either add a canonical Python validator for `REQ-R-ABG3-PAYLOAD` or record a
   governed Python sufficiency/no-gap waiver for the payload-ledger obligation.
4. Link `10-total-assurance-projection-uat.md` and
   `11-event-sourced-payload-ledger-uat.md` from
   `build_tenants/abiogenesis/python/test_env/test_surface_map.md`.

After those are fixed, rerun `npm run test:semantic` and `./run_tests`.
