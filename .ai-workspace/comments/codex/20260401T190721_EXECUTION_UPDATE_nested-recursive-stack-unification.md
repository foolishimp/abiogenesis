Nested recursive stack unification update.

What changed:

- Nested recursive selection no longer opens a child frame as an isolated
  one-frame machine state.
- `RecursiveInterpreterState` now preserves the explicit ancestor stack for
  nested recursive descent by serializing full `stack_frame_ids` and deriving
  `root_frame_id` from the bottom of that stack rather than always from the
  currently opened frame.
- Recursive state indexing is now keyed by the current frame at the top of the
  stack, so nested frame projection/replay returns the correct stack-bearing
  machine state.
- `apply_selection(...)` now inherits the parent recursive stack when a nested
  selection is opened from within an active frame.
- Event cache append now normalizes cached appended records to the same
  JSON-shaped values returned by replay (`tuple -> list`, etc.), so cache and
  persisted event semantics stay identical.

What was qualified:

- Root selection still opens with `stack_depth == 1`.
- Nested frame-local selection now projects with `stack_depth == 2`.
- Explicit recursive selection chains now project the deepest frame with
  `stack_depth == depth`, including the `depth == 100` qualification lane.

Verification:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q`
  - `24 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
  - `112 passed, 5 deselected`

Assessment:

- The prior-version artifact where nested recursion was represented as linked but
  independently rooted one-frame states is removed from the operative recursive
  machine.
- Event replay/projection support remains by design, but it is no longer the
  normal hot-path semantic carrier for recursive next-action or recursive stack
  truth.
