# Recursive Tail-Loop Machine Closure

## Scope

This tranche closes the remaining recursive-control debt on the operative path.

## What changed

- `genesis.interpret` now owns recursive progression through an explicit
  `RecursiveMachineControl` index:
  - active recursive frame order
  - current frame cursor
  - incremental event processing
- `plan_next_traversal(...)` no longer discovers recursive next-action by
  enumerating `active_recursive_states(...)` on each pass. It now reads
  recursive frontier candidates from the explicit machine cursor/order.
- `advance_recursive_machine(...)` no longer advances recursion by walking all
  active states each pass. It now advances one current recursive state at a
  time and tail-steps only while that same machine can progress without yielding.
- When the current frame closes, the interpreter rotates to the next active
  recursive frame through the explicit cursor/order rather than opportunistic
  whole-state scans.

## Qualification

- Added `test_interpreter_rotates_recursive_cursor_after_current_frame_closes`
  in `test_m03_engine_kernel_integration.py`.
  - Opens two recursive frames
  - Makes the current one immediately close
  - Proves planning rotates to the older still-open frame's child frontier

## Traceability updates

- `GTL_2_MODULE_DESIGN.md`
  - documents the explicit current-frame cursor
  - adds `RecursiveMachineControl` as a canonical runtime artifact
  - fixes stale `TraversalOutcome` language
- `GTL_2_INTERFACE_CONTRACTS.md`
  - states that next recursive advancement is owned by an explicit interpreter
    cursor over active frames, derived from causal frame/state events

## Verification

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q`
  - `26 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_v2_sandbox_usecases_fake.py -q`
  - `10 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_v2_usecases_u1_u4.py -q`
  - `4 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
  - `115 passed, 5 deselected`

## Closure statement

The recursive operative path is no longer scan-driven on its semantic hot path.
Recovery/projection helpers still reconstruct from event truth where appropriate,
but recursive next-action ownership now lives in explicit continuation/frontier
state plus interpreter-owned cursor/order control.
