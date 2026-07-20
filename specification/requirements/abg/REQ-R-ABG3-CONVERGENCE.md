# REQ-R-ABG3-CONVERGENCE — Evaluation, Proof, Closure, And Fallback

**Status**: Active
**Lineage**: T-283 Product basis; T-284 bounded owner repair
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define declared deterministic evaluation and proof plus ABG-owned result
admission, closure, escalation, and fallback truth.

## Acceptance Criteria

**REQ-R-ABG3-CONVERGENCE-001**: HoG shall traverse declared evaluator, proof,
and closure GraphFunctions against the active boundary. ABG shall admit their
results and record replayable outcome truth.

**REQ-R-ABG3-CONVERGENCE-002**: Convergence and closure determination shall be driven by declared GTL surfaces and resolved ABG policy, not by hidden HoG-, adapter-, or implementation-local strategy.

**REQ-R-ABG3-CONVERGENCE-003**: The broad default shall run declared deterministic evaluation/proof first, then generic deterministic checks when available, then fall forward to governed `F_P` only when deterministic handling is absent or remains open.

**REQ-R-ABG3-CONVERGENCE-004**: Deterministic paths that are invalid, contradictory, malformed, or engine-erroring shall fail closed rather than silently falling forward to `F_P`.

**REQ-R-ABG3-CONVERGENCE-005**: After constructive `F_P` work returns, HoG shall traverse the declared post-transform proof and blocker-class closure GraphFunctions. ABG shall admit their results before terminal success or further escalation.

**REQ-R-ABG3-CONVERGENCE-006**: Unresolved deterministic observer findings after constructive work shall be emitted as runtime fact truth and shall not by default regain traversal-stopping authority; they shall feed downstream gap, continuation, intent, or other declared observation surfaces.

**REQ-R-ABG3-CONVERGENCE-007**: ABG shall preserve lawful declared pre-dispatch deterministic hard-stop policy when resolved transition law explicitly removes constructive continuation.

**REQ-R-ABG3-CONVERGENCE-008**: ABG shall distinguish at minimum runtime defect, policy/config defect, probabilistic non-convergence, proof failure after constructive work, post-transform observer incompleteness, and superseded or abandoned work.

**REQ-R-ABG3-CONVERGENCE-009**: When constructive work has materially advanced the boundary but non-blocking post-transform observer truth remains unresolved, ABG shall surface that outcome as yielded handoff truth rather than flattening it into terminal success or blocker-class failure.
