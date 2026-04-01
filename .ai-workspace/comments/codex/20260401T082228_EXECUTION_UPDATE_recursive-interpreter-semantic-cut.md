# Execution Update: Recursive Interpreter Semantic Cut

Date: 2026-04-01
Author: Codex
Status: executed

## Completed In This Tranche

- moved recursive frame progression semantics into `interpret.py` via
  `advance_recursive_frames(...)`
- reduced `services._advance_frames()` to a compatibility delegate only
- removed direct parent `edge_converged` emission from child closure
- added `frame_rebound` as the lawful parent rebind surface
- changed post-selection parent handling so already-selected work is
  re-evaluated as the stable outer vector rather than forced through
  re-selection
- removed synthetic frame-step traversal fallback by allowing
  `Traversal.target = GraphVector` for primitive step interpretation
- made active work-key enumeration include event-carried parent work keys
- made frame projection and active-frame discovery reset-aware for stale frame
  attempts
- added recurse-declaration qualification showing runtime consumption of
  declared fold-back binding through `frame_rebound`

## New Semantic Guarantees

- child closure may certify child work, but not the parent
- fold-back emits parent rebind surface and closes the child frame
- parent truth must be re-evaluated after fold-back
- a reopened frame attempt does not alias stale attempt history
- reset makes old frame attempts stale in both active-frame traversal and
  projection
- primitive frame-local steps execute as real vectors, not synthetic fallback
  boundaries

## Current Limits

- this is still not the final tail-loop recursive interpreter stack
- nested recursive selection still requires explicit external
  `SelectionDecision`; there is no automatic strategy layer
- declared recursion termination is still not used to bound a long-running
  recursive loop; the runtime currently consumes the fold-back declaration, not
  the full recursive control law

## Verification

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
- result: `103 passed, 5 deselected`
