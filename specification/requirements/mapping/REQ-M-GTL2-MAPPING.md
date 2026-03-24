# REQ-M-GTL2-MAPPING — Engine Mapping Contract

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-009
**Supersedes**: (new layer)
**Wave**: 2

---

## Purpose

Define how GTL programs map onto engine surfaces. ABG is canonical; other engines are alternate targets.

## Acceptance Criteria

**REQ-M-GTL2-MAPPING-001**: GTL programs shall be mappable onto ABG as the canonical target engine surface.

**REQ-M-GTL2-MAPPING-002**: Other engines (Temporal, Prefect, Step Functions) may serve as alternate mapping targets with full, partial, or capability-profile mappings.

**REQ-M-GTL2-MAPPING-003**: The mapping layer shall preserve GTL semantics — engine-specific behavior shall not alter language-level truth.
