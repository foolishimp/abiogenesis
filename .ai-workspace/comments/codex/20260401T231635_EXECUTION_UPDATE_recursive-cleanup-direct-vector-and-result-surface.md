Recursive cleanup tranche.

What changed

- Removed implicit frame-local boundary synthesis from `build_frame_traversal_surface_from_graph_function(...)`.
  - Frame-local traversal no longer invents `RefinementBoundary` wrappers for undeclared inner vectors.
  - This closes the main live inconsistency against the fail-closed recursion law.

- Formalized direct frame-local vector traversal as lawful operative truth.
  - `validate_frame_traversal_surface(...)` now validates hidden/ambiguous structural alternatives without requiring synthetic local boundaries.
  - `plan_next_traversal(...)` now treats an already-realized frame-local `GraphVector` as the operative traversal target when no further structural target is declared.
  - The requirement/design chain was updated so the runtime and docs agree on this point.

- Removed orphan `TraversalOutcome.updated_module` / `updated_worker` compatibility fields.
  - Removed from runtime type, design docs, interface contract docs, and tests that only asserted `None`.

Traceability updates

- Updated requirement:
  - `REQ-R-ABG2-INTERPRET-010`
- Updated design/interface:
  - `build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/python/design/GTL_2_INTERFACE_CONTRACTS.md`

Qualification updates

- `test_m02_work_publication_integration.py`
  - now proves frame-local direct vector traversal is lawful
  - now proves the frame builder does not synthesize implicit boundaries
- `test_m03_engine_kernel_integration.py`
  - now proves selected recursive frames open without synthesized local refinement boundaries

Verification

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m02_work_publication_integration.py -q` -> `8 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q` -> `25 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_v2_usecases_u1_u4.py -q` -> `4 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_v2_sandbox_usecases_fake.py -q` -> `10 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q` -> `114 passed, 5 deselected`

What remains

- The main remaining architectural debt is the indexed scan-driven recursive progression path in `advance_recursive_machine(...)`. It is materially better than replay-as-semantics, but it is still not the strict final tail-loop machine described by the approved recursive design.
