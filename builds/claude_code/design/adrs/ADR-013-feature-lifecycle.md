# ADR-013 — Feature Lifecycle: gen_start Closes Completed Features

**REQ**: REQ-F-VIS-001
**Status**: Accepted

## Decision

`gen_start()` in `commands.py` calls `_close_completed_features(scope)` immediately when `_derive_state()` returns `converged`. This moves all YAML files from `.ai-workspace/features/active/` to `.ai-workspace/features/completed/` and updates each file's `status` field to `completed`.

## Problem

Feature vector `status` fields were set to `not_started` at creation time and never updated. The engine derived convergence from the event stream, but the feature YAML files showed stale metadata. No mechanism existed to close the ticket once work was done.

## Mental Model

The worker arrives, checks delta, finds it zero, closes the ticket. `gen_start` is the active worker — it arrives at the workspace, evaluates all edges, and when it finds total delta=0, it performs the lifecycle transition. The feature vectors move from active to completed.

## Implementation

`_close_completed_features(scope)`:
- Scans `features/active/*.yml`
- Replaces `status: not_started | active | iterating` with `status: completed`
- Moves the file to `features/completed/`
- `features/completed/` is created if absent

Called only when `_derive_state` returns `converged` — not on partial convergence. If any edge has delta>0, features stay active.

## Consequences

- Feature YAML files are now eventually consistent with the event stream state.
- `gen_start` is the only path that performs lifecycle closure — `gen_gaps` remains read-only.
- Multiple active features all move to completed simultaneously when total delta=0, consistent with V1's single-trajectory model.
