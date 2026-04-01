# Recursive State Artifacts Tranche

Date: 2026-04-01

## Scope

This tranche implements the first live runtime cut of the approved tail-loop
recursive design:

- explicit recursive continuation/frontier artifacts in code
- recursive state emitted as runtime events
- frame projection exposing continuation/frontier state
- frame child scheduling narrowed to pending frontier rather than all child
  steps

## Code Changes

- `frames.py`
  - added `RecursiveContinuation`, `ChildFrontier`,
    `RecursiveInterpreterState`
  - added serialization/projection helpers for recursive state
  - added `frame_state_updated` event helper
  - `active_frame_steps(...)` now resolves from pending child frontier
  - frame projection now exposes:
    - `continuation`
    - `frontier`
    - `stack_depth`
    - `checkpoint_id`
    - `suspended`

- `interpret.py`
  - selection now emits initial recursive state when a frame opens
  - child iteration records recursive state transitions around active child work
  - `advance_recursive_frames(...)` now advances from explicit recursive state
    and emits:
    - waiting-on-children frontier state
    - fold-back-pending state
    - parent-eval-pending state
    - closed state

- `test_m03_engine_kernel_integration.py`
  - selection lane now proves initial recursive continuation/frontier
  - termination lane now proves `foldback_pending` and closed-state projection

## Verification

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q`
  - `20 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
  - `108 passed, 5 deselected`

## Remaining Gap

The runtime now has explicit recursive state as a live operational artifact.
The remaining major cut is ownership of recursive progression trigger:

- current state is explicit and used for scheduling/projection
- but service entrypoints still invoke `_advance_frames(...)` as the recovery /
  progression hook

The next tranche is to move more of that progression ownership directly into the
interpreter traversal loop so service polling is less central to recursive
advance.
