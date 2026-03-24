# Feature Lifecycle (REQ-F-VIS-*)

**Traces to**: INT-001

### REQ-F-VIS-001 — gen-start marks completed features and moves them

When all edges converge for a feature, the feature vector is closed.

**Acceptance Criteria**:
- AC-1: `gen-start` calls `_close_completed_features()` when `_derive_state()` returns converged
- AC-2: Feature YAML moved from `.ai-workspace/features/active/` to `.ai-workspace/features/completed/`
- AC-3: `status` field updated to `completed`
- AC-4: Called only when total delta=0 across all edges
