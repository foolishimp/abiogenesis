# HANDOFF: Claude ABG 1.0 Shipping Surface Cleanup

**Author**: codex
**Date**: 2026-03-26T13:41:10+11:00
**Addresses**: abiogenesis shipping-surface context reset, `gtl.core` removal, design/code trace cleanup, `abg 1.0` release boundary
**For**: claude

## Summary

This is a context reset for the current `abiogenesis` work. The repo in scope is `abiogenesis`, not `gsdlc`. The shipping target for `abg 1.0` is the Claude build only. `codex` is not shipping for `abg 1.0` and will be brought to parity later.

The shipping surface is healthy at the `requirements -> design` layer, but there are still real `design <-> code` inconsistencies. The highest-value cleanup is to remove `gtl.core` as compatibility debt, retarget bootloader synthesis to the live GTL surface, and scrub stale shipping design/code references such as `genesis/fp_dispatch.py`.

## Release Boundary

Shipping surface for `abg 1.0`:

- `specification/`
- `builds/claude_code/design/`
- `builds/claude_code/code/`
- `builds/claude_code/tests/`

Out of scope for this release:

- `builds/codex/`
- downstream `gsdlc`
- any imagined `builds/python` or `genesis_sdlc` tree

Do not conflate this repo with `gsdlc`. Do not count `codex` parity as a release blocker.

## Process Constitution

The governing method is `specification/SPEC_METHOD.md`.

Operational consequences:

- requirements are the constitutional `what`
- design must be derivable from live requirements
- code must be derivable from live requirements plus design
- derived artifacts must be synthesized from the live constitutional surface, not from compatibility shims
- prerelease cleanup should prefer present coherence over preserving transitional scaffolding

History lives in git, ADRs, and superseded specs, not in shipping compatibility layers.

## Current Shipping Status

### Requirements and design

Shipping `requirements -> design` is clean:

- 39 active requirement families
- 0 shipping requirement-to-design orphans
- 0 shipping design docs without requirement anchors

Audited scope:

- `specification/`
- `builds/claude_code/design/`

### Test baseline

Before this cleanup, the default non-live/non-e2e pytest lane from repo root was:

- `374 passed, 1 skipped, 22 deselected`

Live tests are currently being run separately and are showing a good success rate so far. Treat that as the current runtime baseline before cutting `gtl.core`.

## Current Shipping Design <-> Code Truth

### 1. Real design->module gap: mapping layer

The shipping design still declares:

- `mapping.capability`
- `mapping.adapter`
- `mapping.provenance`

in `builds/claude_code/design/GTL_2_MODULE_DESIGN.md`.

There is no shipping `mapping/` implementation under `builds/claude_code/code/`.

Do not hide this with fake stubs. Either:

- mapping is a real `abg 1.0` shipping promise and must be implemented, or
- mapping is not a real `abg 1.0` shipping promise and must be removed or demoted from the shipping design surface

### 2. Stale transport path

Shipping design still references `genesis/fp_dispatch.py`, but the actual shipping transport module is `builds/claude_code/code/genesis/transport.py`.

Known stale references:

- `builds/claude_code/design/GTL_2_MODULE_DESIGN.md`
- `builds/claude_code/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md`
- `builds/claude_code/code/genesis/__init__.py`

### 3. `gtl.core` is compatibility debt

`builds/claude_code/code/gtl/core.py` is currently a compatibility shim.

Canonical GTL ownership is already split across:

- `gtl.graph`
- `gtl.operator_model`
- `gtl.function_model`
- `gtl.work_model`
- `gtl.module_model`

`gtl.core` is still imported by many shipping tests and still participates in bootloader consistency.

This is inconsistent with the constitutional model. The bootloader is a derived artifact and should be synthesized from the live GTL surface, not from a compatibility facade.

The release stance should therefore be explicit:

- delete `gtl.core`
- fix the breaks
- resynthesize the bootloader from the live GTL surface

### 4. Thin design->tests areas

`abg.lineage` and `abg.correction` have indirect scenario evidence.

`abg.subwork` and `abg.selfhosting` currently have very thin direct behavioral proof. That is a real follow-up area, but it is secondary to the `gtl.core` cleanup and stale-path cleanup.

## Mandate

Stay strictly inside the shipping Claude surface.

Do not:

- preserve `gtl.core` for convenience
- drag in `gsdlc`
- treat `codex` parity as a release blocker
- fabricate a mapping layer just to satisfy existing design text

This pass is for constitutional coherence, not compatibility preservation.

## Immediate Task

1. Let the current live test run finish if practical and record the baseline result.
2. Delete `builds/claude_code/code/gtl/core.py`.
3. Replace every shipping import of `gtl.core` with canonical imports from:
   - `gtl.operator_model`
   - `gtl.graph`
   - `gtl.function_model`
   - `gtl.work_model`
   - `gtl.module_model`
   - or `gtl` only if you intentionally want the prime public surface
4. Remove test comments/assertions that still treat `gtl.core` as a supported compatibility identity surface.
5. Change bootloader consistency and synthesis off `gtl.core`.
   - current concrete references include `builds/claude_code/code/gtl_spec/packages/abiogenesis.py`
   - and `builds/claude_code/code/genesis/cli_adapter.py`
6. Resynthesize `builds/claude_code/code/gtl_spec/GTL_BOOTLOADER.md` from the live GTL surface.
7. Scrub stale shipping references to `genesis/fp_dispatch.py`; transport is `genesis/transport.py`.
8. If you touch stale shipping code tags/comments that still carry V1 `REQ-F-*` assumptions, normalize them to the live 2.x surface instead of preserving them.

## After the `gtl.core` Cut

1. Run the default pytest lane.
2. Run the same live lane currently in progress, or the closest equivalent.
3. Report exact break/fix deltas.

Then do a truthful follow-up audit:

1. Decide mapping-layer disposition explicitly:
   - if mapping is not a genuine `abg 1.0` shipping promise, demote/remove it from the shipping design and possibly requirement surface
   - if mapping remains a shipping promise, implement it properly
2. Measure whether `subwork` and `selfhosting` need direct tests or reduced shipping claims.

## Acceptance Criteria

- no shipping `gtl.core` file
- no shipping code or tests importing `gtl.core`
- bootloader synthesis and consistency no longer depend on `gtl.core`
- no shipping design references to `genesis/fp_dispatch.py`
- default pytest green
- live lane not regressed relative to the current baseline
- shipping scope remains `claude_code` only

## Recommended Action

Use this post as the current abiogenesis context reset before making further shipping-surface changes. Treat `gtl.core` removal plus bootloader resynthesis as the next high-value cleanup, then re-evaluate mapping-layer scope and the thin `subwork` / `selfhosting` proof surface.
