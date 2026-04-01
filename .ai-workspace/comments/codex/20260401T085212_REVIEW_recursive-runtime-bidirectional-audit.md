# Review: Recursive Runtime Bidirectional Audit

Date: 2026-04-01
Scope: recursive graph-function application, frame-local publication, fold-back, reset/correction, and recursive qualification surfaces

## Findings

### 1. High: frame-local selection fail-closed law is declared and unit-tested, but not enforced on the live runtime path

- Requirement:
  - `REQ-R-ABG2-SELECTION-APPLICATION-006` in `specification/requirements/abg/REQ-R-ABG2-SELECTION-APPLICATION.md`
- Declared validator:
  - `validate_frame_selection_surface(...)` in `build_tenants/abiogenesis/python/code/genesis/frames.py:708`
- Live runtime path:
  - `build_frame_traversal_surface_from_graph_function(...)` in `build_tenants/abiogenesis/python/code/genesis/frames.py:687`
  - `apply_selection(...)` in `build_tenants/abiogenesis/python/code/genesis/interpret.py:902`
- Issue:
  - The runtime constructs the frame-local surface and opens the frame, but never calls `validate_frame_selection_surface(...)`.
  - The validator is exercised only in `build_tenants/abiogenesis/python/test_env/tests/test_m02_work_publication_integration.py:84`.
- Reproduction:
  - A local probe confirmed that a selected graph function with hidden `frame_local_surface.graph_functions` and no local `CandidateFamily` still returns `selected` instead of failing closed.
- Impact:
  - Hidden frame-local structural alternatives can still enter the runtime, violating the same fail-closed selection law already required for module publication.

### 2. High: the declared recursion termination contract is still orphaned below GTL declaration level

- Requirement:
  - `REQ-L-GTL2-RECURSE-001` and `REQ-L-GTL2-RECURSE-006` in `specification/requirements/gtl/REQ-L-GTL2-RECURSE.md`
- GTL declaration surface:
  - `recurse(...)` in `build_tenants/abiogenesis/python/code/gtl/algebra.py:300`
  - termination declaration emitted in `build_tenants/abiogenesis/python/code/gtl/algebra.py:324`
- Runtime consumption:
  - fold-back binding is read in `build_tenants/abiogenesis/python/code/genesis/interpret.py:240`
  - recursive frame progression is in `build_tenants/abiogenesis/python/code/genesis/interpret.py:564`
- Issue:
  - The runtime consumes declared fold-back binding, but does not read or enforce the declared `termination` contract anywhere below GTL declaration storage.
  - GTL tests verify the metadata exists in `build_tenants/abiogenesis/python/test_env/tests/test_m01_gtl_core_integration.py:335`, but no runtime path uses it.
- Impact:
  - Recursion is only partially operative. Fold-back is live, termination remains declarative.

### 3. Medium: the new recursive domain model still contains bottom-up orphan types

- Orphaned surfaces:
  - `FoldBackOutcome` in `build_tenants/abiogenesis/python/code/genesis/frames.py:118`
  - `Continuation` in `build_tenants/abiogenesis/python/code/genesis/frames.py:148`
  - `FrameState` in `build_tenants/abiogenesis/python/code/genesis/frames.py:159`
  - `InvocationContext` in `build_tenants/abiogenesis/python/code/genesis/frames.py:180`
  - `to_frame_state(...)` in `build_tenants/abiogenesis/python/code/genesis/frames.py:962`
- Issue:
  - These shapes are defined only in `frames.py` and are not consumed anywhere else in code or tests.
- Impact:
  - The intended “real recursive domain model” is only partly integrated. These are architectural stubs, not live runtime truth.

### 4. Low: correction/reset behavior exists, but traceability is incomplete

- Requirement:
  - `REQ-R-ABG2-CORRECTION-004` in `specification/requirements/abg/REQ-R-ABG2-CORRECTION.md`
- Behavior:
  - stale frame invalidation in `build_tenants/abiogenesis/python/code/genesis/frames.py:1100`
  - stale frame projection in `build_tenants/abiogenesis/python/code/genesis/frames.py:1157`
- Issue:
  - `frames.py` does not declare `# Implements: REQ-R-ABG2-CORRECTION`, so requirement-to-code traceability misses part of the actual reset semantics.
- Impact:
  - This is a traceability gap, not a semantic bug, but it weakens the audit surface.

## Top-Down Assessment

### GTL

- `REQ-L-GTL2-SUBSTITUTE` maps cleanly to `build_tenants/abiogenesis/python/code/gtl/algebra.py:216` and the GTL lane in `build_tenants/abiogenesis/python/test_env/tests/test_m01_gtl_core_integration.py`.
- `REQ-L-GTL2-RECURSE` is only partially realized:
  - declaration and validation of fold-back contract exist
  - fold-back binding is consumed by the runtime
  - termination is not yet consumed by the runtime

### ABG

- `REQ-R-ABG2-INTERPRET`, `REQ-R-ABG2-LINEAGE`, and `REQ-R-ABG2-SELECTION-APPLICATION` map strongly through:
  - `build_tenants/abiogenesis/python/code/genesis/interpret.py`
  - `build_tenants/abiogenesis/python/code/genesis/frames.py`
  - `build_tenants/abiogenesis/python/code/genesis/lineage.py`
  - `build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py`
  - the U1/U4 and sandbox lanes
- Missing top-down enforcement:
  - frame-local selection validation is not enforced at runtime
  - declared recursion termination is not operative at runtime

## Bottom-Up Assessment

### Non-orphaned surfaces

- Selection opens frames rather than rewriting the published module carrier.
- Child lineage is spawned and projected.
- Fold-back does not auto-certify the parent.
- Parent re-entry occurs through the stable outer vector.
- Reset/retry mints fresh frame attempt identity.
- Nested frame-local candidate publication works.
- Permanent recursive qualification is currently proven at depth 100 in-suite.

### Orphaned or partially orphaned surfaces

- `validate_frame_selection_surface(...)` is runtime-dead.
- declared recursion `termination` is runtime-dead.
- `FoldBackOutcome`, `FrameState`, `InvocationContext`, `Continuation`, and `to_frame_state(...)` are code-only stubs.
- correction/reset traceability is incomplete because `frames.py` is behavior-bearing but not requirement-tagged for correction.

## Suggested Actions

1. Enforce `validate_frame_selection_surface(...)` in `apply_selection(...)` before frame opening.
2. Make declared recursion termination operative in the recursive advancement path.
3. Either integrate or delete the orphan frame-domain types so the model is honest.
4. Add correction traceability annotations to `frames.py` where reset-shadow semantics are implemented.

## Bottom Line

This is not a “no orphans” result.

The runtime is materially more correct than before, and the recursive selection/fold-back path is substantially aligned from requirement to code to tests. But there are still two live semantic gaps and several structural or traceability orphans:

- live semantic gap: frame-local selection fail-closed law not enforced at runtime
- live semantic gap: declared recursion termination not consumed at runtime
- structural orphans: recursive domain-model types not yet integrated
- traceability orphan: correction semantics in `frames.py` not declared as such
