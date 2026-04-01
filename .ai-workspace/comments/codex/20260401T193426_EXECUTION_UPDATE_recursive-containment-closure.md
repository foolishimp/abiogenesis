Recursive containment closure tranche.

What changed:
- Frame-local recursive candidates are now self-contained across event replay. `FrameTraversalSurface` serialization preserves inline graph templates, so frame-local `GraphFunction` values do not degrade into symbolic-only summaries when reloaded from events.
- Invocation frames now carry only the minimal recursion law needed for runtime recovery: `graph_function_recursion` instead of the full graph-function declaration tree. This removes the recursive serialization bleed caused by storing nested frame publication structures directly on the frame.
- Invocation frames now also carry the selected parent vector snapshot. Recursive termination and fold-back no longer need to re-resolve the parent vector from `Module.graphs`, which closes the nested-frame module-global dependency.
- `apply_selection(...)` now opens frames with:
  - canonical materialization against the selected candidate plus local publication
  - full `validate_frame_traversal_surface(...)` enforcement at frame-open
  - frame-local recursion law only

Semantic result:
- Frame-local recursive alternatives no longer depend on duplicate publication in `Module.graph_functions`.
- Recursive termination/fold-back recovery no longer bleeds out to module-global parent-vector resolution for nested frames.
- The recursive frame payload no longer contains a second full publication truth surface.

Verification:
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q` -> `25 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m02_work_publication_integration.py -q` -> `7 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q` -> `113 passed, 5 deselected`
