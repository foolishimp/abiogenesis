# REQ-R-ABG3-CONVERGENCE — Evaluation, Proof, Closure, And Fallback

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define ABG-owned deterministic evaluation, proof, closure, escalation, and
fallback law.

## Acceptance Criteria

**REQ-R-ABG3-CONVERGENCE-001**: ABG shall execute declared or derived evaluator/proof/closure bindings against the active boundary and record replayable outcome truth.

**REQ-R-ABG3-CONVERGENCE-002**: Convergence and closure determination shall be driven by declared GTL surfaces and resolved ABG policy, not by hidden interpreter-local strategy.

**REQ-R-ABG3-CONVERGENCE-003**: The broad default shall run declared deterministic evaluation/proof first, then generic deterministic checks when available, then fall forward to governed `F_P` only when deterministic handling is absent or remains open.

**REQ-R-ABG3-CONVERGENCE-004**: Deterministic paths that are invalid, contradictory, malformed, or engine-erroring shall fail closed rather than silently falling forward to `F_P`.

**REQ-R-ABG3-CONVERGENCE-005**: After constructive `F_P` work returns, ABG shall re-run post-transform proof and blocker-class closure checks before terminal success or further escalation.

**REQ-R-ABG3-CONVERGENCE-006**: Unresolved deterministic observer findings after constructive work shall be emitted as runtime fact truth and shall not by default regain traversal-stopping authority; they shall feed downstream gap, continuation, intent, or other declared observation surfaces.

**REQ-R-ABG3-CONVERGENCE-007**: ABG shall preserve lawful declared pre-dispatch deterministic hard-stop policy when resolved transition law explicitly removes constructive continuation.

**REQ-R-ABG3-CONVERGENCE-008**: ABG shall distinguish at minimum runtime defect, policy/config defect, probabilistic non-convergence, proof failure after constructive work, post-transform observer incompleteness, and superseded or abandoned work.

**REQ-R-ABG3-CONVERGENCE-009**: When constructive work has materially advanced the boundary but non-blocking post-transform observer truth remains unresolved, ABG shall surface that outcome as yielded handoff truth rather than flattening it into terminal success or blocker-class failure.
