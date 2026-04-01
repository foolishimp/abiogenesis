# Recursive Audit Closure

Date: 2026-04-01

## Scope

This update closes the live runtime gaps identified in
`20260401T085212_REVIEW_recursive-runtime-bidirectional-audit.md` and records
the resulting verification status.

## Closed Findings

1. Frame-local selection fail-closed law is now enforced on the live runtime
   path.
   - `apply_selection(...)` now builds and validates the frame traversal
     surface before opening a recursive frame.
   - Code: `build_tenants/abiogenesis/python/code/genesis/interpret.py`
   - Qualification:
     `test_selection_fails_closed_on_hidden_frame_local_alternatives`

2. Declared recursion termination is now operative at frame closure time.
   - `advance_recursive_frames(...)` now evaluates the declared recursive
     termination contract before emitting `frame_foldback`, `frame_rebound`,
     or `frame_closed`.
   - Parent fold-back remains blocked until that declared termination passes.
   - Code: `build_tenants/abiogenesis/python/code/genesis/interpret.py`
   - Qualification:
     `test_recursive_frame_waits_for_declared_termination_before_foldback`

3. Open recursive frames now block convergence reporting.
   - `gen_gaps(...)` and `_derive_state(...)` now treat live open frames as
     non-converged state, preventing false `converged=True` reports while a
     recursive frame is still open behind a satisfied child-step frontier.
   - Code: `build_tenants/abiogenesis/python/code/genesis/services.py`

4. Orphaned recursive domain scaffolding was removed or integrated.
   - Removed unused `Continuation`, `FrameState`, `InvocationContext`, and
     `to_frame_state(...)` from `frames.py`.
   - Integrated `FoldBackOutcome` into the live fold-back path so it is no
     longer dead architecture.

5. Correction traceability was aligned.
   - `frames.py` now declares `REQ-R-ABG2-CORRECTION` in its implementation
     header because it owns reset-shadow handling for frame attempts.

## Verification

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m02_work_publication_integration.py -q`
  - `7 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py -q`
  - `20 passed`
- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
  - `108 passed, 5 deselected`

## Remaining Position

The two live semantic gaps from the audit are closed. The runtime still uses
the current event-driven recursive frame progression model rather than the final
tail-loop interpreter stack proposed in
`20260401T072442_PROPOSAL_tail-loop-event-recursive-interpreter.md`, but the
audited orphan/gap set for this tranche is resolved.
