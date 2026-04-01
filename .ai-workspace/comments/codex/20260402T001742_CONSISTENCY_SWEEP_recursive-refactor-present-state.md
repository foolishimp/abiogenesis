# Recursive Refactor Consistency Sweep

## Tracked list

- [x] Remove stale rewrite-era `TraversalOutcome` contract language from active design surfaces.
- [x] Ensure active requirement, design, code, and tests all describe the same present-state recursive model:
  - stable outer module carrier
  - invocation frames
  - frame-local executable truth
  - tail-loop continuation/frontier interpretation
  - interpreter-owned current-frame cursor
- [x] Tighten traceability for recursive interpretation sub-clauses:
  - `REQ-R-ABG2-INTERPRET-010`
  - `REQ-R-ABG2-INTERPRET-011`
  - `REQ-R-ABG2-INTERPRET-012`
- [x] Remove dead recursive-control scaffolding left by the transition.
- [x] Verify no active code/design surfaces still mention `updated_module` / `updated_worker` or topology-rewrite return semantics for traversal.
- [x] Re-run focused recursive qualification and the full test suite.

## Completed changes

### 1. Active contract surfaces brought to present state

- Updated `build_tenants/abiogenesis/python/design/GTL_2_INTERFACE_CONTRACTS.md`
  so `TraversalOutcome` now matches the live runtime:
  - immutable `WorkSurface`
  - structured traversal result facts
  - no module/worker rewrite return contract
- Preserved the accepted recursive present-state design:
  - explicit continuation/frontier state
  - explicit interpreter current-frame cursor
  - frame/event projections as provenance surfaces, not rewritten topology

### 2. Traceability tightened

- Updated the `test_m03_engine_kernel_integration.py` module docstring with
  clause anchors for:
  - `REQ-R-ABG2-INTERPRET-010`
  - `REQ-R-ABG2-INTERPRET-011`
  - `REQ-R-ABG2-INTERPRET-012`
- Added clause-anchor comments on the key recursive tests:
  - hidden frame-local selection fail-closed
  - current-frame cursor rotation
  - suspend/resume checkpoint behavior
  - termination-gated fold-back
  - reset/reopen fresh attempt identity

### 3. Recursive-control debt removed

- `genesis.interpret` no longer derives operative frame steps through the old
  `active_frame_steps(...)` projection helper.
- Added `_operative_frame_steps(...)` and `_find_visible_frame_step(...)`
  inside `genesis.interpret`, both driven from the explicit machine cursor/state.
- Removed the dead `active_frame_steps(...)` helper from `genesis.frames`.
- Removed the unused `OperativeScope.frame_steps` field.
- Removed the now-unused `find_active_frame` import from `genesis.interpret`.

## Historical artifacts

Older files in `.ai-workspace/comments/codex/` still exist as historical audit
and handoff records. They were not rewritten or deleted in this sweep. They are
not active truth surfaces. Active truth is now aligned across:

- `specification/requirements/...`
- `build_tenants/abiogenesis/python/design/...`
- `build_tenants/abiogenesis/python/code/...`
- `build_tenants/abiogenesis/python/test_env/tests/...`

## Verification

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q`
  - `26 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m02_work_publication_integration.py -q`
  - `8 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
  - `115 passed, 5 deselected`

## Closure

Active recursive-refactor surfaces are now present-state consistent.

The remaining references to earlier shapes exist only in historical comment
logs, not in the active requirement/design/code/test chain.
