# B-017 Gate F_P Proof And Success Lifecycle On Target Certification, Not Only Fulfilled Ledger

- id: B-017
- title: Make published F_P convergence and every success-lifecycle consumer depend on target certification, not only admitted fulfillment state
- type: bug
- status: completed
- goal: runtime-certification-integrity
- change_intent: Stop ABIogenesis from certifying an F_P edge from admitted fulfillment truth alone by making target materialization and target certification part of the single published convergence law consumed by ingest, binding, followups, and status projection.
- change_class: realization_refactor
- re_entry_point: realized_surface
- priority: critical
- severity: sev-1
- intake_source: `data_mapper.test35` forensic run 2026-04-19
- dependencies: related domain fix in odd_sdlc B-021; this substrate fix proceeded independently
- affected_boundary: `result_ingest.py`, `fulfillment_ledger.py`, `binding.py`, `fulfillment_followups.py`, `live_status.py`
- triaged_at: 2026-04-19
- created_at: 2026-04-19
- activated_at: 2026-04-19
- completed_at: 2026-04-19
- updated_at: 2026-04-19
- authoritative_contract:
  - published ledgers now carry `target_materialization_passed` and `target_certification_passed`
  - `published_fulfillment_edge_converged(...)` is the single convergence law for published F_P ledgers
  - ingest, admission updates, runtime binding, lifecycle followups, and live-status projection consume that same convergence law
  - certification failure leaves the edge unconverged and blocks success lifecycle emission
- close_condition:
  - no F_P edge can reach `proof_passed` or `edge_converged` without passing target certification

## Context

`data_mapper.test35` proved that ABIogenesis could certify an F_P edge from
admitted fulfillment state alone.

That allowed `derive_uat_testcases_surface` and `derive_design_surface` to
publish `edge_converged: true` even while the current target artifacts still
failed the domain contract. Downstream work then dispatched against assets that
were ledger-fulfilled but not actually certified.

The substrate bug was not only in ingest. Any later consumer that re-derived
success from published ledger truth had to obey the same certification gate.

## Delivered Contract

ABIogenesis now computes one published convergence truth:

- fulfillment admission is necessary
- target materialization is necessary
- target certification is necessary when the runtime declares it

That truth is written into the published ledger once and then consumed
everywhere else.

Implemented surfaces:

- [fulfillment_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_ledger.py)
  - adds `published_fulfillment_edge_converged(...)`
  - recomputes `edge_converged` through the same helper on admission updates
  - resolves published ledgers through the same helper for reporting/runtime consumers
- [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py)
  - records target materialization and target certification on the published ledger
  - gates `proof_passed` and failure classification on the certified convergence result
- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py)
  - treats `target_certification_passed = false` as non-certified even if obligations are fulfilled
- [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py)
  - approval/revocation followups now emit success or reopen only from the recomputed ledger truth
- [live_status.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/live_status.py)
  - projects the same resolved ledger truth instead of a weaker success rule

## Verification

The substrate regression is covered by:

- [test_abg3_runtime_envelope.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py)
  - `test_ingest_requires_target_binding_materialization_before_success_lifecycle`
  - `test_ingest_applies_declared_target_certification_hook_before_closure`
  - `test_bind_fp_certified_requires_target_certification_passed`

Non-live verification passed on 2026-04-19:

- `./run_tests`
- `./run_tests e2e`

## Closeout

`data_mapper.test35` can no longer reach F_P success from admitted ledger truth
alone. Target certification is now part of the single published convergence law
used across ingest, lifecycle followups, runtime binding, and live status.
