# abiogenesis RC Notes

This note records release-candidate caveats and accepted framework behavior
for the current `abiogenesis` wave.

## Accepted Framework Behavior

### Policy-Governed `F_D -> F_P` Continuation

The current RC restores the intended substrate rule that selected-edge `F_D`
findings do not hard-stop generic constructive traversal by default.

That means:

- selected-edge `F_D` now consults the resolved escalation policy
- when the declared policy carries `F_D -> F_P`, the runtime dispatches `F_P`
  rather than returning `fd_gap`
- explicit fail-closed policy still yields `fd_gap`
- explicit hard-stop `F_D` also overrides concurrent `F_P` failure

This is a substrate correction, not a domain-local repricing.

### `F_P` Dispatch May Now Carry Deterministic Repair Pressure

The current RC allows `F_P` dispatch to be opened from carryable `F_D`
findings, not only from explicit failing `F_P` evaluators.

That means:

- the generated F_P manifest may list deterministic findings in
  `failing_evaluators`
- the prompt and result contract still require the agent to clear those
  deterministic findings before treating the edge as done
- the runtime still rechecks closure from workspace truth after result ingest

This preserves deterministic truth while allowing self-healing iteration.

### Manifest And Run Continuity Are Stronger

The current RC now keeps stronger continuity over pending F_P runs.

That includes:

- deriving manifest path from `manifest_id` when the result lacks
  `fp_manifest_path`
- persisting `manifest_id` into run-state truth
- allowing resumed traversal to rediscover the same pending manifest

This reduces runtime drift between dispatch, pending-run discovery, and replay.

## Current Known Limitation

### Source-Workspace Mirror Still Requires Installer Propagation

`abiogenesis` remains the canonical engine source.

Downstream `.genesis` trees must still be refreshed by installer/release
propagation before they should be treated as released runtime truth.

Direct local mirror edits may be useful for source-workspace development, but
they are not themselves the release path.

## Current Verification Footer

The current release-candidate proving footer is:

- `256 passed`
- `5 deselected`
- `23.95s`

from:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
