# REQ-R-ABG2-CONVERGENCE — Convergence and Delta

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-010
**Wave**: 1

---

## Purpose

ABG computes convergence over graph application history. `delta(state, constraints) -> work`. When delta = 0, the system is at rest.

## Acceptance Criteria

**REQ-R-ABG2-CONVERGENCE-001**: `delta()` shall compute convergence over graph application history — same computation at every scale (single iteration, edge, feature, production).

**REQ-R-ABG2-CONVERGENCE-002**: Convergence is edge-level (`delta()==0`), not a run lifecycle event. Runs reach terminal states independently of convergence.

**REQ-R-ABG2-CONVERGENCE-003**: ABG shall execute evaluator binding(s) to determine whether graph contracts are satisfied, and record attestation.

**REQ-R-ABG2-CONVERGENCE-004**: A convergence event not made visible before downstream proceeds is a spec violation (completeness visibility).

**REQ-R-ABG2-CONVERGENCE-005**: ABG owns the deterministic convergence/escalation protocol: evaluator execution ordering, gap triggering, escalation across regimes, event emission, and replayable traceability.

**REQ-R-ABG2-CONVERGENCE-006**: ABG shall not invent domain-specific gap semantics. What counts as open, closed, or ambiguous for a contract is determined by the active evaluator declarations and bindings supplied through GTL/domain surfaces.

**REQ-R-ABG2-CONVERGENCE-007**: ABG shall support convergence determination over one evaluator or an explicit evaluator-result vector attached to the same contract boundary.

**REQ-R-ABG2-CONVERGENCE-008**: When multiple evaluators are active for a boundary, ABG shall execute the declared ordering, round bounds, and escalation policy deterministically and compute the aggregate convergence state from the declared rule/evaluator surface rather than from hidden interpreter logic.
