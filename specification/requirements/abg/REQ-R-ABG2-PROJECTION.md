# REQ-R-ABG2-PROJECTION — Truth Projection

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-010
**Supersedes**: REQ-F-EC (replaced — projection portions)
**Wave**: 1

---

## Purpose

Projection reconstructs current truth from the event stream. It is pure, deterministic, and the basis for convergence.

## Acceptance Criteria

**REQ-R-ABG2-PROJECTION-001**: `project(EventStream, type, instance_id)` shall be deterministic — same inputs always produce the same result.

**REQ-R-ABG2-PROJECTION-002**: Graph node state is a projection: `Node<Tn> := project(EventStream[0..n], node_type, instance_id)`.

**REQ-R-ABG2-PROJECTION-003**: Recovery is replay. No state is lost beyond the current iterate() call.
