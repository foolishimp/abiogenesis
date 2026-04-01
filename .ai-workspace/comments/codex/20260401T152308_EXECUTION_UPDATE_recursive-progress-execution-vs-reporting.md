# Recursive Progress: Execution vs Reporting

Date: 2026-04-01

## Scope

This tranche reduces service-driven recursive progress by making reporting/state
surfaces observational while keeping recursive progress on the execution path.

## Behavioral Change

- `gen_gaps(...)` no longer advances recursive frames.
  - It reports recursive state and may certify child edge convergence through
    ordinary `bind_fd` observation, but it does not emit fold-back / rebound /
    frame closure as a side effect.
- `_derive_state(...)` no longer advances recursive frames.
  - `gen_start(...)` now derives state without progressing recursion, then
    delegates execution to `gen_iterate(...)`.
- `gen_iterate(...)` remains the command-path execution surface that can resume
  recursive progress through `advance_recursive_frames(...)`.

## Runtime Consequence

- Recursive progress is now less centralized in service polling.
- Reporting commands no longer own recursive semantic progress.
- When a frame is open but no child frontier is executable, `gen_iterate(...)`
  now returns:
  - `status = "in_progress"`
  - `reason = "recursive frames are active but no executable child frontier is pending"`
  instead of incorrectly claiming convergence.

## Qualification Updates

`test_m03_engine_kernel_integration.py` now proves:

- `gen_gaps(...)` does not secretly close frames
- `gen_iterate(...)` advances `foldback_pending` state
- `gen_iterate(...)` closes frames and re-enters parent execution when
  termination becomes satisfied

## Verification

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q`
  - `20 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
  - `108 passed, 5 deselected`

## Remaining Gap

Recursive progress still enters through `gen_iterate(...)` service orchestration
via `_advance_frames(...)`. The next architectural cut is to push more of that
trigger/selection ownership into interpreter-owned next-action planning so the
service layer becomes thinner again.
