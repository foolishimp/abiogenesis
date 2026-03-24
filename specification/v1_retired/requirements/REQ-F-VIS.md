# Feature Lifecycle (REQ-F-VIS-*)

**Traces to**: INT-001, INT-004

### REQ-F-VIS-001 — gen-start marks completed features per work lineage

When all edges converge for a feature's work_key lineage, that feature vector is closed. Completion is per-feature, not global-only — a feature whose work_key lineage has delta=0 across all edges is complete even if other features remain in progress.

**Acceptance Criteria**:
- AC-1: `gen-start` calls `_close_completed_features()` after each convergence check
- AC-2: A feature is closeable when `delta(job, work_key=feature_work_key) == 0` for all jobs in the graph — convergence is evaluated per feature's work_key lineage using `schedule.delta()` (REQ-F-TRAV-002)
- AC-3: Feature YAML moved from `.ai-workspace/features/active/` to `.ai-workspace/features/completed/`
- AC-4: `status` field updated to `completed`
- AC-5: When a feature's work_key has spawned children (REQ-F-FRAG-004), the feature is closeable only when all descendant work_keys are also converged (fold-back)
- AC-6: **Degenerate case:** when work_keys are not in use, completion falls back to global delta=0 across all edges
