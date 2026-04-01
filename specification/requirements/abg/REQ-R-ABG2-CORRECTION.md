# REQ-R-ABG2-CORRECTION — Correction and Reset

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-010
**Supersedes**: REQ-F-CORRECT (subsumed)
**Wave**: 2

---

## Purpose

ABG supports correction and reset by shadowing certifications while preserving truthful history.

## Acceptance Criteria

**REQ-R-ABG2-CORRECTION-001**: Correction shadows certifications for a graph application within a lineage boundary. Graph structure and history remain intact.

**REQ-R-ABG2-CORRECTION-002**: Reset does not damage structure. It shadows certifications so truth after a boundary is re-evaluated.

**REQ-R-ABG2-CORRECTION-003**: Correction provenance shall be recorded — what was corrected, by whom, with what boundary.

**REQ-R-ABG2-CORRECTION-004**: For recursive invocation state, reset/correction shall invalidate any older frame progress, fold-back result, parent rebind result, and resumable checkpoint contained by the reset boundary. Reopened execution must not treat stale recursive events as current truth.
