# REQ-R-ABG3-CONVERGENCE — Evaluation, Proof, Closure, And Fallback

**Status**: Active
**Category**: Capability / Guarantee
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define ABG-owned deterministic evaluation, proof, closure, escalation, and
fallback law.

## Acceptance Criteria

**REQ-R-ABG3-CONVERGENCE-001**: ABG shall execute declared or derived evaluator/proof/closure bindings against the active boundary and record replayable outcome truth.

**REQ-R-ABG3-CONVERGENCE-002**: Convergence and closure determination shall be driven by declared GTL surfaces and resolved ABG policy, not by hidden interpreter-local strategy.

**REQ-R-ABG3-CONVERGENCE-003**: The broad default shall run declared deterministic evaluation/proof first, then generic deterministic checks when available, then fall forward to governed `F_P` only when deterministic handling is absent or remains open.

**REQ-R-ABG3-CONVERGENCE-004**: Deterministic paths that are invalid, contradictory, malformed, or engine-erroring shall fail closed rather than silently falling forward to `F_P`.

**REQ-R-ABG3-CONVERGENCE-005**: After constructive `F_P` work returns, ABG shall re-run proof and closure before terminal success or further escalation.

**REQ-R-ABG3-CONVERGENCE-006**: ABG shall distinguish at minimum runtime defect, policy/config defect, probabilistic non-convergence, proof failure after constructive work, and superseded or abandoned work.
