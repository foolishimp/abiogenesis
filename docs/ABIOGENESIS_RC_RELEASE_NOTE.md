# abiogenesis RC Release Note

This release candidate closes the current `abiogenesis` provenance and
runtime-boundary hardening wave.

## What Shipped

- install/bootstrap now seeds provenance-ready workflow metadata by construction
- governed runtime no longer accepts `"unknown"` as a steady-state provenance
  mode
- missing or malformed workflow metadata now fails closed at runtime and CLI
  boundaries
- `F_H` approval binding no longer accepts bare edge-name approvals without
  workflow-version identity
- runtime `spec_hash` now binds workflow version, executable-job structure, and
  requirement truth so stale probabilistic assessments reopen correctly
- post-continuation closure now surfaces unresolved deterministic gaps back out
  as `fd_gap` instead of misclassifying them as generic runtime failure
- regression coverage for:
  - provenance hard-fail on missing or malformed workflow metadata
  - install/bootstrap provenance readiness
  - stale event rejection under the stronger versioned runtime identity
  - workflow-version-bearing approval and runtime ingestion semantics
  - unresolved deterministic failure after `F_D -> F_P` continuation

## Framework Position

This RC hardens the ABG runtime boundary:

- governed runtime must be provenance-ready by construction
- removed fallback modes are interface cuts, not hidden compatibility surfaces
- downstream consumers must refactor to the released boundary through install
  composition, not by source-runtime mirroring

## Verification

Targeted proof lanes:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_provenance_integration.py -q`
- result: `28 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py -q`
- result: `12 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py -q`
- result: `18 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_abg3_runtime_envelope.py -q`
- result: `13 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m02_work_publication_integration.py -q`
- result: `10 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_usecases_u1_u4.py -q`
- result: `4 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q`
- result: `108 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_fake.py -q`
- result: `14 passed`

Full framework suite:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
- result: `258 passed, 5 deselected in 24.75s`

## Known RC Limitation

This RC does not make downstream consumers green by compatibility restoration.

The canonical release path remains:

1. cut the `abiogenesis` RC
2. propagate through installer into downstream consumers
3. refactor downstream consumers to the released boundary
4. prove the downstream evidence workspaces from that installed RC

This is documented in [ABIOGENESIS_RC_NOTES.md](/Users/jim/src/apps/abiogenesis/docs/ABIOGENESIS_RC_NOTES.md).
