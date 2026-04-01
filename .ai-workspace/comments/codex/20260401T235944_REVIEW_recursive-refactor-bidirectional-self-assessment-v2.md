# Recursive Refactor Bidirectional Self-Assessment v2

## Scope

Full top-down and bottom-up audit after the tail-loop cursor control cut.

Priority order:

1. consistency with the accepted recursive refactor and absence of live
   rewrite-era or containment-breaking debt
2. bidirectional traceability from requirements/design to code/tests and back

## Findings

### 1. Medium: interface-contract prose still contains one rewrite-era `TraversalOutcome` statement

The live runtime and module design now define `TraversalOutcome` as:

- immutable `WorkSurface`
- `result`
- no `updated_module`
- no `updated_worker`
- no topology-rewrite return semantics

That is reflected in:

- `build_tenants/abiogenesis/python/code/genesis/interpret.py`
- `build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md`
- tests that removed `updated_module` / `updated_worker` assertions

But `build_tenants/abiogenesis/python/design/GTL_2_INTERFACE_CONTRACTS.md:502`
still says:

- `TraversalOutcome` returns the next immutable `WorkSurface`, plus refined
  module/worker surfaces when traversal materially rewrites executable topology

That sentence is now stale and inconsistent with the accepted invocation-frame
model. It is the only confirmed rewrite-era contract statement still present in
the active requirement/design chain.

### 2. Medium: clause-level test traceability for the recursive sub-clauses is still coarse

The implementation and named tests do cover the key recursive clauses:

- fail-closed frame-local traversal publication
- tail-loop cursor ownership of recursive next-action
- checkpoint non-authority / suspend-resume
- reset-safe frame attempts

Examples:

- `test_selection_fails_closed_on_hidden_frame_local_alternatives`
- `test_interpreter_rotates_recursive_cursor_after_current_frame_closes`
- `test_recursive_frame_waits_for_declared_termination_before_foldback`
- `test_reset_invalidates_stale_frame_attempt_and_reopen_mints_fresh_attempt`

But the test files still annotate only broad requirement files such as:

- `# Validates: REQ-R-ABG2-INTERPRET`

rather than the specific clauses `REQ-R-ABG2-INTERPRET-010/-011/-012`.

So bidirectional traceability exists substantively, but not yet at a precise
clause-to-test annotation level. A reviewer can find the evidence, but still
has to infer the mapping from test names and assertions.

### 3. Low: planning still carries a secondary active-frame projection path beside the new machine cursor

The semantic owner of recursive next-action is now:

- `RecursiveMachineControl`
- current-frame cursor/order
- `_plan_recursive_frontier_candidate(...)`
- `advance_recursive_machine(...)`

That is the accepted refactor.

However, planning still builds operative scope through:

- `_operative_scope(...)`
- `active_frame_steps(...)`
- `active_recursive_states(...)`

Those helpers are now projection/support surfaces rather than the semantic
carrier of recursive next-action truth, so this is not a correctness bug.
But it is still a small structural duplication on the planning/reporting path.
If the goal is “no tech debt” in the strictest sense, this is the remaining
bottom-up cleanup item after the semantic refactor.

## Top-Down Assessment

- `REQ-R-ABG2-INTERPRET-009` is materially realized:
  selection opens invocation frames over a stable published module surface
  rather than rewriting module topology.
- `REQ-R-ABG2-INTERPRET-010` is materially realized:
  recursive traversal now uses validated frame-local/imported publication truth
  plus already-realized frame-local executable vectors, without synthesized
  inner boundaries.
- `REQ-R-ABG2-INTERPRET-011` is materially realized:
  recursive next-action is owned by explicit continuation/frontier state plus
  interpreter cursor control, not by service polling or whole-event replay as
  the sole semantic carrier.
- `REQ-R-ABG2-INTERPRET-012` is materially realized:
  checkpoints aid suspend/resume, but causal event/history truth remains
  authoritative.

No top-down evidence of remaining macro/global-rewrite semantics was found.

## Bottom-Up Assessment

- `RecursiveMachineControl` is live and used.
- `TraversalPlan`, `FoldBackOutcome`, and `ParentRebindResult` are live and used.
- The prior `updated_module` / `updated_worker` compatibility surfaces are gone
  from runtime and tests.
- No dead recursive domain types were found on the operative path.
- The only bottom-up inconsistency found was the stale interface-contract prose
  for `TraversalOutcome`, plus the small duplicate active-frame projection path
  noted above.

## Verification

Current branch verification remains green:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`
- result: `115 passed, 5 deselected`

## Short closure statement

- macro/global rewrite problem: fixed
- recursive locality and frame-carried recursion law: fixed
- tail-loop recursive next-action ownership: materially fixed
- remaining work to call it fully debt-free:
  - remove the stale `TraversalOutcome` rewrite sentence from interface contracts
  - tighten clause-level traceability for recursive sub-clauses
  - optionally collapse the secondary active-frame projection path if strict
    “no duplicate recursive views on planning path” is required
