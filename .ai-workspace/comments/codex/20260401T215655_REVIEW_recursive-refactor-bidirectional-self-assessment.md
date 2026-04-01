Bidirectional self-assessment of the recursive refactor.

Priority order used:
1. semantic consistency with the approved full recursive refactor and no residual tech debt
2. traceability from requirements/design to code/tests and back

Findings

1. High: frame-local traversal still depends on synthesized local publication, which violates the current fail-closed recursion law.
   - `build_frame_traversal_surface_from_graph_function(...)` currently manufactures `implicit_boundaries` for any inner vector that lacks a declared frame-local or imported traversal target in [build_tenants/abiogenesis/python/code/genesis/frames.py:740-780].
   - That conflicts with `REQ-R-ABG2-INTERPRET-010`, which says recursive frame execution must fail closed rather than synthesize a traversal target when no frame-local or explicitly imported truth exists in [specification/requirements/abg/REQ-R-ABG2-INTERPRET.md:36].
   - It also conflicts with the module-design rule that frame-local traversal surfaces obey the same fail-closed publication law as module surfaces in [build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md:405].
   - This means the live recursive path is still carrying one unratified shortcut. The old global rewrite is gone, but recursive inner traversal is not yet purely driven by declared publication truth.

2. Medium: the design/runtime type contract is stale in ways that matter for alternate ABG implementations.
   - The design still declares `Traversal.target` as `GraphFunction | CandidateFamily | RefinementBoundary` in [build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md:501-508], but the runtime uses `GraphVector` as an operative traversal target in [build_tenants/abiogenesis/python/code/genesis/interpret.py:86-123] and [build_tenants/abiogenesis/python/code/genesis/interpret.py:541-555].
   - The design still declares a reduced `InvocationFrame` without `frame_lineage_id`, `frame_attempt_id`, `parent_vector`, `traversal_surface`, or `graph_function_recursion` in [build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md:517-528], while the runtime now depends on those fields in [build_tenants/abiogenesis/python/code/genesis/frames.py:884-1108].
   - This is traceability debt, but it also creates semantic ambiguity for a second ABG implementation because the approved operational contract is no longer fully described by the design surface.

3. Medium: the runtime is still on the indexed scan-driven recursive machine, not the final strict tail-loop stepper described at the design level.
   - `plan_next_traversal(...)` still advances recursion by calling `advance_recursive_machine(...)` before planning in [build_tenants/abiogenesis/python/code/genesis/interpret.py:420-433].
   - `advance_recursive_machine(...)` advances recursive progress by iterating `active_recursive_states(stream)` and rebinding pending child steps against the current indexed event state in [build_tenants/abiogenesis/python/code/genesis/interpret.py:1314-1565].
   - This is materially better than whole-workspace replay as the sole semantic carrier, but it is still architectural debt relative to the declared “explicit frame stack plus child frontier” tail-loop contract in [build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md:403] and [specification/requirements/abg/REQ-R-ABG2-INTERPRET.md:38].

4. Low: `TraversalOutcome.updated_module` and `updated_worker` are orphan compatibility fields after the recursion refactor.
   - The runtime type still exposes them in [build_tenants/abiogenesis/python/code/genesis/interpret.py:168-174], and the design still documents them in [build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md:649-654].
   - The live code never sets either field on any traversal path I traced. Current tests only assert that they are `None`, for example in [build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py:272-273] and [build_tenants/abiogenesis/python/test_env/tests/test_v2_sandbox_usecases_fake.py:413].
   - That makes them bottom-up orphans. If they still matter, they need a ratified non-recursive refinement/use case. Otherwise they are residual pre-refactor surface area.

Important correction

- One previously suspected issue is no longer live on this branch: frame-local recursive candidates do not currently require duplicate publication in `Module.graph_functions` for selection-time materialization or recursion recovery.
- `materialize_graph_function(...)` accepts supplemental publication truth via `published_graph_functions` in [build_tenants/abiogenesis/python/code/genesis/materialization.py:68-104].
- `apply_selection(...)` passes the selected candidate explicitly via `published_graph_functions=(candidate,)` in [build_tenants/abiogenesis/python/code/genesis/interpret.py:1829-1834].
- Recursion declaration truth is now carried on the frame itself via `graph_function_recursion` in [build_tenants/abiogenesis/python/code/genesis/frames.py:884-1108], and fold-back / termination read from the frame in [build_tenants/abiogenesis/python/code/genesis/interpret.py:833-877].
- The strongest proof lane is the local recursion test in [build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py:1365-1536], where the nested recursive candidate is frame-local and not published in `Module.graph_functions`.
- A narrower cleanliness issue still exists: canonical materialization resolution is still keyed by graph-function name over the union of the explicit supplemental publication set plus module publication in [build_tenants/abiogenesis/python/code/genesis/materialization.py:68-85]. That is a design-cleanliness concern, but it is not the same as a live dependency on module-global publication for frame-local recursion.

Top-down assessment

- GTL recursion law is materially chained through declaration, interpreter, and tests:
  - declaration in [specification/requirements/gtl/REQ-L-GTL2-RECURSE.md]
  - GTL contract in [build_tenants/abiogenesis/python/design/GTL_2_INTERFACE_CONTRACTS.md]
  - GTL implementation in [build_tenants/abiogenesis/python/code/gtl/algebra.py]
  - GTL qualification in [build_tenants/abiogenesis/python/test_env/tests/test_m01_gtl_core_integration.py:335-353]
- ABG selection/application, fold-back, local recursion declaration, nested frame-local recursion, and depth qualification are all materially present in:
  - [build_tenants/abiogenesis/python/code/genesis/interpret.py]
  - [build_tenants/abiogenesis/python/code/genesis/frames.py]
  - [build_tenants/abiogenesis/python/test_env/tests/test_m02_work_publication_integration.py:52-186]
  - [build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py:167-1793]
- The approved “no global rewrite” direction is consistently realized. I did not find a live path that mutates module topology on selection.

Bottom-up assessment

- The recursive runtime is now materially explicit: `InvocationFrame`, `RecursiveContinuation`, `ChildFrontier`, `RecursiveInterpreterState`, frame lifecycle events, suspend/resume events, and indexed active recursive state all have real runtime consumers.
- Frame-local recursive candidates are now materially self-contained across selection, replay, termination, and fold-back; I did not find a remaining live dependency on duplicate publication in `Module.graph_functions` for those paths.
- The main remaining bottom-up inconsistency is the synthetic `implicit_boundaries` path in `frames.py`. That is the clearest live recursive-control shortcut still in conflict with the stated fail-closed design.
- The main architectural debt is the indexed scan-driven recursive progression path in `advance_recursive_machine(...)`.
- The main bottom-up orphan is `TraversalOutcome.updated_module` / `updated_worker`.

Traceability summary

- Strong:
  - `REQ-L-GTL2-RECURSE` -> `gtl.algebra.recurse(...)` -> `test_m01_gtl_core_integration.py`
  - `REQ-R-ABG2-SELECTION-APPLICATION` / `REQ-R-ABG2-INTERPRET` -> `genesis.interpret` + `genesis.frames` -> `test_m02_work_publication_integration.py` and `test_m03_engine_kernel_integration.py`
  - `REQ-R-ABG2-LINEAGE` / `REQ-R-ABG2-CORRECTION` are materially realized in frame lineage / stale-attempt handling and exercised in the recursive lanes plus sandbox lanes
- Weak / stale:
  - module-design runtime type declarations are behind the code
  - `TraversalOutcome` still documents unused mutation-era fields
  - the design/requirement text does not currently ratify the runtime’s synthesized implicit frame-local boundaries

Recommended action order

1. Remove or ratify `implicit_boundaries`.
   - Preferred: remove them and make missing frame-local traversal publication fail closed.
   - Alternate only if intended: explicitly declare that materialized inner graph vectors are lawful frame-local traversal publication and update requirements/design to say so.
2. Update `GTL_2_MODULE_DESIGN.md` runtime types so they match the real recursive machine.
3. Rework the post-selection `GraphVector` operative traversal target path in `plan_next_traversal(...)` so design and runtime agree on the traversal contract after validated family selection.
4. Replace the indexed scan-driven recursive progression path with the stricter tail-loop machine described by the approved design.
5. Remove `updated_module` / `updated_worker` from runtime/design/tests unless a separately ratified use case still requires them.

Verification context

- No code changes were made during this assessment.
- Latest branch verification before this audit remained:
  - `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q` -> `113 passed, 5 deselected`
