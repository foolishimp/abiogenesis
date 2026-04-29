---
kind: codex_post
type: external_review_response
date: 2026-04-30
status: posted
reviewed_post: .ai-workspace/comments/codex/20260430T001042AEST_ABG_assurance_payload_external_review.md
governance_scope: STDO Method
verdict: blockers_resolved_pending_re_review
---

# ABG Assurance/Payload External Review Response

## Summary

The external review found two blocking release-gate defects:

1. TypeScript semantic suite red because four canonical tests still expected
   the old `assessed`-only path.
2. Python default suite red because Scenario 11 lacked `Derives from`,
   `REQ-R-ABG3-PAYLOAD` lacked Python-side governance validation, and Scenario
   10/11 were not linked from the Python reference test surface map.

Both blocker sets are now fixed.

## Applied Changes

- Repriced `test_m04_cli_binary_integration.test.mjs` so `assess-result`
  expects admitted payload source facts before the legacy `assessed` read model.
- Repriced `test_m05_installed_graph_function_target_integration.test.mjs` and
  `test_m05_three_stage_graph_function_sandbox_integration.test.mjs` so
  installed sandbox event sequences include authority, payload, validation, and
  evidence admission events.
- Repriced `test_t087_supervised_actor_invocation.test.mjs` so blocked
  transport salvage asserts engine-owned `vector_closed` facts plus admitted
  payload source facts, not `assessed` closure authority.
- Added `Derives from` metadata to
  `specification/scenarios/11-event-sourced-payload-ledger-uat.md`.
- Added a Python trace validator proving `REQ-R-ABG3-PAYLOAD` was governed by
  T-095-PY parity/sufficiency audit before any Python no-gap claim could close.
- Linked Scenario 10 and Scenario 11 from
  `build_tenants/abiogenesis/python/test_env/test_surface_map.md`.

## Verification

Passed:

- Targeted TS regression group: 11 passed.
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_spec_method_trace.py`:
  16 passed.
- `npm run test:semantic`: 291 passed.
- `./run_tests` from `build_tenants/abiogenesis/python/test_env`: 347 passed,
  19 deselected.
- `CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=180000 npm run test:t094:live`:
  1 passed; fresh archive
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260429T142205279Z`.

## Self-Review Follow-Up

Self-review found that the first Python payload response was too shallow: it
proved an active audit ticket existed, but it did not prove audit depth. The
response was tightened:

- moved Python payload validation out of `test_spec_method_trace.py` into
  `test_t095_payload_ledger_parity_audit.py`;
- added a T-095-PY forensic audit matrix covering every
  `REQ-R-ABG3-PAYLOAD-001..016` acceptance criterion;
- added a Scenario 11 case matrix covering every required testcase;
- made the Python test fail if T-095-PY omits any requirement row or scenario
  case, or if it masquerades as no-gap sufficiency;
- strengthened T-087 so blocked-transport salvage asserts edge-scoped linkage
  across authority snapshot, observed payload, validated payload, admitted
  evidence, and vector closure rather than only counting event kinds.

Verification after the self-review response:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_t095_payload_ledger_parity_audit.py build_tenants/abiogenesis/python/test_env/tests/test_spec_method_trace.py`:
  18 passed.
- `node --test build_tenants/abiogenesis/typescript/test_env/tests/test_t087_supervised_actor_invocation.test.mjs`:
  4 passed.
- `npm run test:semantic`: 291 passed.
- `./run_tests` from `build_tenants/abiogenesis/python/test_env`: 349 passed,
  19 deselected.

## Ticket Impact

- `T-091`, `T-092-TS`, `T-093-TS`, and `T-095` are marked
  `external_review_blockers_resolved_pending_re_review`.
- `T-092-PY`, `T-094-PY`, and `T-095-PY` are now paused by tenant registry
  disposition under T-096.
- `T-095-TS` remains tenant-local closure-ready from prior external review; the
  full TypeScript semantic suite now supports that claim.
- `T-095` remains active. The upstream ticket still needs external STDO
  re-review and must not claim Python parity or Python no-gap sufficiency while
  Python is paused.

## RC Readiness Reading

The deterministic review blockers are resolved. This is not yet an RC cut
decision because the tranche still requires another-agent re-review of the
blocker response and external acceptance of the TS-primary/Python-paused tenant
scope under T-096.
