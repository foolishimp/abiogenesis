# Recursive Interpreter Migration Backlog

Date: 2026-04-01
Author: Codex
Status: active execution backlog
Context: follow-on to the tail-loop recursive interpreter proposal and review

## Executive Position

The proposed direction is correct, but the sequencing needed one adjustment:
fresh frame-attempt identity and frame-local traversal surfaces must land
before the interpreter-loop replacement. Otherwise we would keep growing the
transitional `_advance_frames()` proxy around the wrong state model.

## Improved Plan

### Phase 0: Freeze The Transitional Patch

- Keep the no-global-module-rewrite correction.
- Treat `_advance_frames()` in
  `build_tenants/abiogenesis/python/code/genesis/services.py`
  as a temporary compatibility path only.
- Do not extend its semantics further.

### Phase 1: Finish The Law Surfaces

Required surfaces:

- `specification/requirements/gtl/REQ-L-GTL2-RECURSE.md`
- `specification/requirements/gtl/REQ-L-GTL2-SUBSTITUTE.md`
- `specification/requirements/abg/REQ-R-ABG2-INTERPRET.md`
- `specification/requirements/abg/REQ-R-ABG2-LINEAGE.md`
- `specification/requirements/abg/REQ-R-ABG2-SELECTION-APPLICATION.md`
- `specification/requirements/abg/REQ-R-ABG2-CORRECTION.md`

Status:

- mostly complete
- remaining implementation must now follow the declared fold-back,
  frame-local validation, and reset/attempt-identity law

### Phase 2: Introduce The Real Recursive Domain Model

Add explicit runtime records:

- `InvocationContext`
- `FrameState`
- `FrameTraversalSurface`
- `FoldBackOutcome`
- `ParentRebindResult`
- `Continuation`

Critical requirement:

- frame traversal truth is first-class data
- frame identity distinguishes stable lineage from current attempt

Required identity split:

- `frame_lineage_id`: stable structural recursive slot
- `frame_attempt_id`: fresh active attempt after open/reset/retry

### Phase 3: Build Frame-Local Validation And Resolution

Add frame-scoped equivalents of the current module helpers:

- `validate_frame_selection_surface(...)`
- `validate_frame_traversal_surface(...)`
- `resolve_frame_candidate_family(...)`
- `resolve_frame_refinement_boundary(...)`

Resolution order:

1. frame-local publication surface
2. explicitly imported module/global publication surface
3. fail closed

Non-goal:

- no synthetic fallback boundary objects as semantic truth

### Phase 4: Replace The Proxy Scheduler With One Interpreter Loop

Replace `_advance_frames()` with a tail-loop recursive interpreter owned by
`interpret.py`.

Required actions in the loop:

- open frame
- advance current frame step
- descend into child frame
- produce `FoldBackOutcome`
- derive `ParentRebindResult`
- re-evaluate parent truth
- certify parent only after parent truth passes

### Phase 5: Remove Transitional False Semantics

Delete:

- direct parent `edge_converged` from child closure
- synthetic traversal fallback in `gen_iterate()`

### Phase 6: Make Reset And Projection Lawful

- reset/correction invalidates stale frame progress, fold-back, rebound, and
  checkpoints
- `frame_suspended` snapshots remain cache/checkpoint aids only
- `project(frame, ...)` reconstructs causal truth first

### Phase 7: Qualification

Rewrite tests around the final contract:

- nested frame-local candidate selection
- fold-back requires parent re-evaluation
- no module topology mutation
- reset invalidates stale frame truth
- depth 10 and 100
- sandbox/live recursive qualification

### Phase 8: Performance After Semantics

Only after semantics are correct:

- frame indexes
- replay acceleration
- projection caches

## Immediate Execution Slice

The first code tranche should be:

1. add the recursive frame domain model
2. add frame-local validation/resolution helpers
3. add fresh frame-attempt identity
4. expose these surfaces through frame projection

This is the minimal lawful base needed before replacing the interpreter loop.

## Critical Non-Goals

- no global module rewrite
- no synthetic traversal targets as semantic fallback
- no parent certification from "all child steps closed"
- no hidden fold-back logic invented only in ABG
