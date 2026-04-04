# ABG Runtime Identity Projection Cut

## Scope

Close the runtime-identity reporting slice so canonical runtime truth stays in
`engine_id` / `worker_id` / `backend_id` / `authority_ref` /
`assignment_source` / `resolved_runtime_ref`, while `build` remains explicit
reporting metadata only.

## Code Closure

- `genesis/identity.py`
  - `RuntimeIdentity.build_id` remains optional reporting metadata.
  - added `with_report_build_id()` so explicit reporting metadata can be merged
    without silently diverging from canonical runtime identity.
- `genesis/services.py`
  - `Scope` derives default worker from canonical runtime identity only.
  - `Scope.build` now projects explicit `build_id` only.
  - conflicting `build` vs `runtime_identity.build_id` now fails closed.
- `genesis/interpret.py`
  - `TraversalRuntime.build` now projects explicit `build_id` only.
  - conflicting `build` vs `runtime_identity.build_id` now fails closed.
- `genesis/cli_adapter.py`
  - `_resolve_runtime_identity()` now accepts canonical `runtime_*` contract
    keys only.
  - `assess-result` no longer treats legacy `backend` as canonical provenance;
    it reads `selected_backend` / `backend_id`.

## Truth Surfaces

- `specification/requirements/abg/REQ-R-ABG2-WORKER.md`
- `specification/requirements/abg/REQ-R-ABG2-PROVENANCE.md`
- `specification/PRODUCT.md`
- `build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/README.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-031-runtime-identity-and-configured-worker.md`
- `docs/USER_GUIDE.md`

These surfaces now agree that:

- reporting metadata is not canonical worker/runtime truth
- `build` is projection-only
- runtime contract identity keys are the `runtime_*` fields

## Test Closure

Added/updated regressions in:

- `test_cli_adapter_auto.py`
  - runtime-prefixed identity keys are honored
  - unprefixed legacy runtime-contract keys are ignored
  - conflicting `build` inputs fail closed
  - `assess-result` ignores legacy `backend`
- `test_m03_engine_kernel_integration.py`
  - stale mixed-truth fixture removed so one source of reporting truth remains
- `test_v2_sandbox_install.py`
  - live result artifact uses canonical `backend_id`

Verification:

- targeted runtime-identity slice:
  - `PYTHONPATH=build_tenants/abiogenesis/python/code python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py build_tenants/abiogenesis/python/test_env/tests/test_v2_sandbox_install.py -q`
  - `53 passed`
- full tenant suite:
  - `PYTHONPATH=build_tenants/abiogenesis/python/code python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
  - `126 passed, 5 deselected`

## Result

This slice no longer relies on synthesized `build` truth or legacy flat
runtime-contract aliases. The remaining `build` constructor parameter is now an
explicit reporting input with fail-closed agreement semantics, not a parallel
silent truth surface.
