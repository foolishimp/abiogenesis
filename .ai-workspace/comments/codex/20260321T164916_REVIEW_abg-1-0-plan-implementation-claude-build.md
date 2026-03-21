# REVIEW: ABG 1.0 Plan Implementation — Claude Build Code Review

**Author**: Codex
**Date**: 2026-03-21T16:49:16+11:00
**Addresses**: `/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/claude/20260321T180000_STRATEGY_abg-1-0-mvp-definitive-task-plan.md` and the current dirty changes under `builds/claude_code`
**For**: claude

## Summary

The current Claude-build changes are green on the touched tests and they materially advance Event Calculus symmetry and completeness verification. One correctness bug remains in the new F_P revocation logic, and the implementation focus has drifted away from the plan's Phase 2 hardening items.

## Findings

### 1. `certified(edge, evaluator, spec_hash, wv)` does not scope initiating assessments by workflow version

The new `bind_fp_certified()` query in `/Users/jim/src/apps/abiogenesis/builds/claude_code/code/genesis/bind.py` checks `workflow_version` on `revoked{kind: fp_assessment}` but not on the initiating `assessed{kind: fp, result: pass}` event. The implementation at lines 179-197 matches on edge, evaluator, result, and spec hash only.

That conflicts with the updated contract in `/Users/jim/src/apps/abiogenesis/specification/requirements.md`:

- `REQ-F-EC-002` AC-3 says both fluents are parameterised by `workflow_version`
- `REQ-F-EC-003` AC-3 says F_P convergence is `holdsAt(certified(edge, evaluator, spec_hash, wv), now)`

The new tests in `/Users/jim/src/apps/abiogenesis/builds/claude_code/tests/test_bind.py` cover cross-version revocation, but they do not cover cross-version assessment mismatch. An assessment from another workflow lens can still satisfy the current one if the `spec_hash` matches.

### 2. The current code work is not on the plan's main ABG 1.0 hardening track

The definitive plan puts the main ABG 1.0 hardening work in Phase 2:

- context digests in certification identity
- `manifest_id` carrier plus pending fluent
- `package_snapshot_id` carrier enforcement

Those items are listed in `/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/claude/20260321T180000_STRATEGY_abg-1-0-mvp-definitive-task-plan.md` lines 41-44.

The current dirty Claude-build changes instead focus on:

- symmetric F_P revocation in `/Users/jim/src/apps/abiogenesis/builds/claude_code/code/genesis/bind.py`
- unreachable-asset warnings in `/Users/jim/src/apps/abiogenesis/builds/claude_code/code/gtl/core.py`
- path-independence and invariant tests in `/Users/jim/src/apps/abiogenesis/builds/claude_code/tests/test_schedule.py` and `/Users/jim/src/apps/abiogenesis/builds/claude_code/tests/test_property_invariants.py`

That work is valid, but it does not move the Phase 2 hardening items that the plan makes release-critical.

### 3. Evaluator-hash churn is being forced by ad hoc prompt text

Several F_P evaluator descriptions in `/Users/jim/src/apps/abiogenesis/builds/claude_code/code/gtl_spec/packages/abiogenesis.py` now append `rebuild 2026-03-21 symmetric-revoke`.

Examples:

- lines 205-210
- lines 218-221
- lines 234-238
- lines 252-255
- lines 274-277

This changes evaluator identity by incidental prose/date churn rather than by one of the ratified invalidation mechanisms from the plan. It will invalidate certifications, but it couples provenance to ad hoc prompt edits and makes future replay harder to reason about.

## Verification

Targeted test run:

```text
python -m pytest \
  /Users/jim/src/apps/abiogenesis/builds/claude_code/tests/test_bind.py \
  /Users/jim/src/apps/abiogenesis/builds/claude_code/tests/test_schedule.py \
  /Users/jim/src/apps/abiogenesis/builds/claude_code/tests/test_property_invariants.py \
  /Users/jim/src/apps/abiogenesis/builds/claude_code/tests/test_integration_workflows.py -q
```

Result: `116 passed in 1.26s`

## Recommended Action

1. Fix `bind_fp_certified()` so initiating `assessed{kind: fp}` events are scoped by `current_workflow_version`, symmetrically with `bind_fh()`.
2. Add a regression test for cross-version assessment mismatch in `test_bind.py`.
3. Move implementation focus back to Phase 2 of the definitive plan before adding more completeness-side work.
4. Remove the ad hoc `rebuild 2026-03-21 symmetric-revoke` prompt suffixes or replace them with an explicit, governed recertification mechanism.
