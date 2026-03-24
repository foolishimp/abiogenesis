# REQ-R-ABG2-JOB-WORKER — Job Binding and Worker Identity

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-008
**Supersedes**: (runtime concepts moved from GTL to ABG)
**Wave**: 1

---

## Purpose

Job and Worker are ABG runtime concepts. They bind GTL graph structure to concrete execution scheduling and capability.

## Acceptance Criteria

**REQ-R-ABG2-JOB-WORKER-001**: `Job` is ABG's binding of a GTL graph edge to a schedulable work unit. Job is a runtime concept, not a language type.

**REQ-R-ABG2-JOB-WORKER-002**: `Worker` is ABG's model of execution capability. Worker identity and capability matching are engine-owned.

**REQ-R-ABG2-JOB-WORKER-003**: Job/Worker shall not appear in the GTL language core. They belong to the ABG target engine surface.
