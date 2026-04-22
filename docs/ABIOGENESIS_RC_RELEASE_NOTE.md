# abiogenesis 3.3.0 RC Release Note

This release candidate advances the `v3.3.0` line with B-029:
continuation-owned retry, repair, and review truth now projects as public
`yield` instead of failure-shaped status whenever a lawful next step already
exists.

## What Shipped

- `genesis.continuation.YieldedContinuationContract` is now the typed public
  carrier for continuation-owned yield truth
- `dispatch_runtime.py` now projects retry continuation as:
  - `continuation_opened`
  - `run_yielded`
  - public `status="yield"`
- `result_ingest.py` now projects repair and `fh_review` continuation the same
  way
- `run.py` and live-status now retain yielded `failure_class` so run/read-model
  projection agrees with the public continuation contract
- retry yield is now constrained to retry-eligible failure classes only:
  - `transport_failure`
  - `no_output`
  - `contract_failure`
- true no-continuation defects such as `policy_config_defect` and
  `runtime_defect` now remain hard failure:
  - no `continuation_opened`
  - no `run_yielded`
  - public `status="error"`

## Framework Position

This RC sharpens one specific ABG runtime law:

- internal failure does not by itself define public terminality
- if the runtime has already opened a lawful continuation-owned next step, the
  public boundary must project `yield`
- public `error` remains lawful only when no continuation-owned next step
  exists

That meaning is now carried by one typed source seam:

1. `continuation_opened`
2. `YieldedContinuationContract`
3. `run_yielded`
4. public runtime/control projection

## Verification

Targeted source proofs on this cut:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py::test_dispatch_runtime_classifies_missing_local_transport_contract_as_policy_config_defect build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py::test_dispatch_runtime_runtime_defect_stays_terminal_without_retry_continuation build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py::test_run_start_until_converged_surfaces_engine_dispatch_failure_without_shadow_booleans -q`
- result: `3 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py::test_dispatch_runtime_emits_failure_graph_call_and_continuation build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py::test_dispatch_runtime_retry_continuation_projects_live_status_as_yielded build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py::test_ingest_unadmitted_ledger_fails_proof_and_opens_fh_review build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py::test_ingest_requires_target_binding_materialization_before_success_lifecycle build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py::test_ingest_applies_declared_target_certification_hook_before_closure build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py::test_ingest_repair_continuation_projects_live_status_as_yielded build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py::test_run_start_until_converged_surfaces_retry_continuation_as_yield -q`
- result: `7 passed`

## Release Qualification Note

This RC closes the ABG source boundary for B-029.

Downstream installed validation, including `odd_sdlc`, is not part of this
source closure proof. It is release qualification over the published cut and
reopens B-029 only if the installed consumer exposes a source regression.
