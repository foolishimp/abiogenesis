# abiogenesis 3.2.0 RC Release Note

This release candidate closes the current `abiogenesis` B-027
runtime-carrier, regime-algebra, and runtime-boundary hardening wave.

## What Shipped

- runtime advancement law is now expressed through typed carriers including
  `ExecutionBasis`, `AdvancementTransition`, `IterationAdvanceDecision`, and
  regime-binding algebra rather than controller-owned orchestration
- `gen-start` and `gen-iterate` consume kernel-produced carrier truth instead
  of reconstructing transition meaning from result dictionaries
- `RegimeBindingSet` is the singular regime truth for `F_D`, `F_P`, and `F_H`;
  convergence and runtime publication derive evaluator state from that algebra
- feature completion is event-owned; active-work projection is replay-derived
  from declaration files plus completion/reset events
- runtime policy, proof-hold, live-status, dispatch, ingest, and asset-binding
  contract ingress now fail closed or consume admitted carrier truth instead of
  treating `runtime_config` as an independent semantic authority
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
- retryable same-edge attempts now mint fresh manifest identity and fresh
  current-state prompt truth instead of redispatching stale manifests
- `fd_gap`-stopped attempts now terminalize prior graph-call and run truth so a
  later retry opens a fresh attempt
- generic prompt preamble now instructs the actor to inspect the current target
  asset, determine realized progress, identify the remaining gap, and continue
  from present state
- regression coverage for:
  - carrier-only advancement and mixed-state rejection
  - regime-binding algebra as the convergence/publication authority
  - event-backed feature completion and reset replay
  - dispatch, ingest, proof-hold, live-status, and asset-binding ingress
    fail-closed behavior
  - provenance hard-fail on missing or malformed workflow metadata
  - install/bootstrap provenance readiness
  - stale event rejection under the stronger versioned runtime identity
  - workflow-version-bearing approval and runtime ingestion semantics
  - unresolved deterministic failure after `F_D -> F_P` continuation
  - fresh retry manifest identity and prompt regeneration from current state
  - terminalized retryable `fd_gap` attempts that no longer remain falsely live

## Framework Position

This RC cuts a new ABG runtime boundary:

- graph-owned carriers and replay-visible events are the runtime source of
  truth
- imperative service/controller seams are bindings over that source, not rival
  semantic centers
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

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q -k 'iterated_traversal_emits_run_binding_dispatch_and_replay_state or bind_fp_surfaces_target_asset_binding_prompt_from_query_runtime_asset_bindings or retry_after_terminal_run_mints_fresh_manifest_with_current_binding_truth'`
- result: `2 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m02_work_publication_integration.py -q`
- result: `10 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_usecases_u1_u4.py -q`
- result: `4 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_fake.py -q`
- result: `14 passed`

Full framework suite:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
- result: `317 passed, 19 deselected`

Live qualification:

- `CODEX_LIVE_FP=1 python -m pytest -m live_fp -x -v -s build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py`
- result: `5 passed` from the Claude-run live harness; Codex sandbox execution
  skipped the same live tests because the sandboxed subprocess could not
  complete Claude CLI OAuth/auth startup

## Known RC Limitation

This RC does not make downstream consumers green by compatibility restoration.

The canonical release path remains:

1. cut the `abiogenesis` RC
2. propagate through installer into downstream consumers
3. refactor downstream consumers to the released boundary
4. prove the downstream evidence workspaces from that installed RC

This is documented in [ABIOGENESIS_RC_NOTES.md](https://github.com/foolishimp/abiogenesis/blob/main/docs/ABIOGENESIS_RC_NOTES.md).
