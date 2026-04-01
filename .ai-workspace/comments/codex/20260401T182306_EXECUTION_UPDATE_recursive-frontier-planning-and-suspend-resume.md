Recursive interpreter execution update.

What changed:

- `abg.interpret` now owns operative gap derivation, operative state derivation,
  and next-traversal planning. `abg.services` is reduced further toward
  scope/command plumbing.
- `plan_next_traversal(...)` now honors recursive continuation/frontier truth
  first. When recursive frames are open, it plans from explicit pending child
  frontier before falling back to generic module/job scanning.
- Recursive frame lifecycle now emits explicit `frame_suspended` and
  `frame_resumed` events in addition to `frame_state_updated`.
- Recursive suspension now carries `checkpoint_id` from the blocking run so the
  continuation surface can be resumed from an explicit runtime checkpoint rather
  than only inferred from generic state transitions.

What was qualified:

- Interpreter-owned next recursive child planning.
- Interpreter-owned operative gap reporting over frame-local child frontier.
- Planner respects blocked active-child continuation rather than skipping ahead
  to another open child.
- Recursive frames emit explicit suspend/resume lifecycle events.

Verification:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q`
  - `24 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
  - `112 passed, 5 deselected`

Residual gap:

- Recursive progression is now more explicitly continuation/frontier-driven at
  planning time, but `advance_recursive_frames(...)` still reconstructs active
  recursive states from event history each pass. The remaining cut is to push
  more of that progression into a stricter explicit recursive machine step so
  whole-log replay is recovery/projection support, not the normal hot-path
  semantic driver.
