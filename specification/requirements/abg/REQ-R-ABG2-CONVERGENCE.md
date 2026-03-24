# REQ-R-ABG2-CONVERGENCE — Convergence and Delta

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-010
**Supersedes**: REQ-F-EC (replaced — convergence portions), REQ-F-TRAV (subsumed), REQ-F-GATE (subsumed)
**Wave**: 1

---

## Purpose

ABG computes convergence over graph application history. `delta(state, constraints) -> work`. When delta = 0, the system is at rest.

## Acceptance Criteria

**REQ-R-ABG2-CONVERGENCE-001**: `delta()` shall compute convergence over graph application history — same computation at every scale (single iteration, edge, feature, production).

**REQ-R-ABG2-CONVERGENCE-002**: Convergence is edge-level (`delta()==0`), not a run lifecycle event. Runs reach terminal states independently of convergence.

**REQ-R-ABG2-CONVERGENCE-003**: ABG shall execute evaluator bindings to determine whether graph contracts are satisfied, and record attestation.

**REQ-R-ABG2-CONVERGENCE-004**: A convergence event not made visible before downstream proceeds is a spec violation (completeness visibility).
