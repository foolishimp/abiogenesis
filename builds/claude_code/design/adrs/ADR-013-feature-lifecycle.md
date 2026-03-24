# ADR-013 — Feature Lifecycle: Per-Lineage Completion

**Implements**: REQ-F-VIS-001, REQ-F-CMD-003
**Status**: Accepted (V2 update: 2026-03-24)
**Depends on**: ADR-023 (work identity), ADR-024 (work-scoped convergence)

## Decision

`gen_start()` in `commands.py` calls `_close_completed_features(scope)` after each convergence check. Completion is evaluated **per feature's work_key lineage** using `schedule.delta()` — a feature is closeable when its lineage has delta=0 across all jobs, even if other features remain in progress.

## Problem

V1 closed all active features only when global convergence reached zero. In the V2 work-key model, features have independent work_key lineages. A feature whose lineage is fully converged should close without waiting for unrelated features.

## Mental Model

Each feature has a work_key lineage (its own work_key plus any children spawned via `work_spawned` events). Completion is the lineage-scoped question: "does `delta(job, work_key=feature_work_key) == 0` hold for every job in the graph?" When yes, that feature vector is closed — regardless of other features' state.

## Implementation

`_close_completed_features(scope)`:
- Scans `features/active/*.yml`
- For each feature, evaluates convergence per its work_key lineage via `schedule.delta()` (REQ-F-TRAV-002)
- When a feature's work_key has spawned children (REQ-F-FRAG-004), the feature is closeable only when all descendant work_keys are also converged (fold-back)
- On closure: replaces `status` with `completed`, moves file to `features/completed/`

Called after each convergence check — not only at global convergence.

**Degenerate case:** when work_keys are not in use, completion falls back to global delta=0 across all edges (V1 behavior).

## Consequences

- Features close independently as their lineages converge — no artificial coupling to unrelated work.
- `gen_start` is the only path that performs lifecycle closure — `gen_gaps` remains read-only.
- Fold-back ensures features with spawned children don't close prematurely.
- V1 global-completion behavior is preserved as the degenerate case (no work_keys).
