# abiogenesis RC Release Note

This release candidate closes the current `abiogenesis` substrate-strengthening
wave around policy-governed `F_D` continuation, runtime manifest continuity,
asset-binding-driven dispatch, and stricter post-F_P closure truth.

## What Shipped

- policy-governed selected-edge `F_D -> F_P` continuation
- preservation of explicit fail-closed `F_D` semantics where policy or
  structural law requires it
- stronger F_P manifest continuity:
  - `manifest_id` tracked in run state
  - pending-run recovery can derive manifest path from `manifest_id`
- stronger workspace asset-binding query handling:
  - asset binding contracts may be supplied as mapping or JSON object string
  - runtime `pythonpath` entries are admitted into the asset-binding query
    environment
- stronger post-F_P closure truth:
  - target binding materialization is checked before closure passes
  - manifest-declared deterministic failures are rerun before closure passes
- regression coverage for:
  - `F_D -> F_P` continuation
  - explicit `F_D` hard-stop override
  - mixed `F_D + F_P` precedence under hard-stop policy
  - auto-loop continuation after an unblocked iteration

## Framework Position

This RC restores the intended generic builder stance:

- `F_D` provides deterministic structure, findings, and fail-closed protection
  for real structural prerequisites
- `F_P` remains the normal constructive regime for generic untuned domains
- declared escalation policy determines whether selected-edge `F_D` findings are
  carried into `F_P`, escalated to `F_H`, or hard-stopped

In other words, the substrate no longer sole-arbitrates generic constructive
work through `F_D` by default.

## Verification

Targeted regression lanes:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py -q`
- result: `18 passed`

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q -k 'fd_failure or fd_hard_stop or policy_resolution_honours_declared_hook_precedence'`
- result: `4 passed, 104 deselected`

Full framework suite:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
- result: `256 passed, 5 deselected in 23.95s`

## Known RC Limitation

Downstream source-workspace mirrors such as vendored `.genesis` trees are not
the release boundary.

The canonical release path remains:

1. cut the `abiogenesis` RC
2. propagate through installer into downstream consumers
3. prove the downstream evidence workspaces from that installed RC

This is documented in [ABIOGENESIS_RC_NOTES.md](/Users/jim/src/apps/abiogenesis/docs/ABIOGENESIS_RC_NOTES.md).
