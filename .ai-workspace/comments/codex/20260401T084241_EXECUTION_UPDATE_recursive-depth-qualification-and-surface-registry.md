# Execution Update: Recursive Depth Qualification And Surface Registry

## What changed

- Reworked frame traversal-surface event serialization in `build_tenants/abiogenesis/python/code/genesis/frames.py` from recursive inline publication trees to a flat registry representation.
- Added an iterative frame-surface decoder so `frame_opened` replay no longer depends on Python recursion for nested `CandidateFamily -> GraphFunction -> frame_local_surface` chains.
- Kept backward compatibility for older frame event payloads by retaining the legacy deserialization branch.
- Raised the permanent recursive qualification lane in `build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py` from `depth in {10, 50}` to `depth in {10, 100}`.
- Tightened the depth qualification test so it reads the just-emitted `frame_opened` event from the traversal result and deserializes that frame directly. This keeps the proof about recursive semantics, not about the current cost of replay-wide `find_active_frame(...)`.

## What is now proven

- Recursive selection can open and round-trip `100` nested frames with frame-local candidate publication still executable at each depth.
- The recursive frame surface no longer fails at write-time because of nested JSON serialization recursion.
- The recursive frame surface no longer fails at read-time because of nested Python reconstruction recursion.

## Verification

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q`
  - `18 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
  - `106 passed, 5 deselected`

## Residual limit

- The semantic/runtime proof is stronger now, but deep replay helpers such as `find_active_frame(...)`, `active_frames(...)`, and `project_frame(...)` still rebuild frame state from the full event log repeatedly.
- An ad hoc probe above the permanent suite level did not expose a new recursion bug first; it exposed replay cost. The next step for higher-depth qualification is indexing or caching frame-opened payloads during replay, not more semantic redesign.
