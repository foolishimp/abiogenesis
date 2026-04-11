# REQ-R-ABG3-RETRY — Generic Retry And Repair Governance

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-12
**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define generic retry law for bounded ABG edge repair without hard-coding
domain-specific retry logic into the substrate.

## Acceptance Criteria

**REQ-R-ABG3-RETRY-001**: A retryable same-edge repair attempt shall mint fresh runtime attempt identity. At minimum that means a fresh `run_id`, fresh `call_id`, and fresh manifest identity for the new attempt.

**REQ-R-ABG3-RETRY-002**: Retry prompt and manifest truth shall be regenerated from current workspace and runtime state. A prior manifest may remain replay-visible evidence, but it shall not be redispatched as if it were current truth.

**REQ-R-ABG3-RETRY-003**: Retry prompts shall instruct the probabilistic actor to inspect the current target asset, determine what is already realized, identify the remaining unresolved gap, and continue construction from present state before assessment.

**REQ-R-ABG3-RETRY-004**: Generic retry control is substrate-owned. ABG shall define the default retryable-attempt law, bounded-attempt law, and stationary-failure stop or escalation law rather than leaving those semantics to hidden domain-local runtime behavior.

**REQ-R-ABG3-RETRY-005**: Domain products may override retry behavior only through declared GTL or policy surfaces. Domains may refine retry budget, retryability, escalation target, or progress criteria, but they shall not replace substrate-owned retry execution truth with a shadow runtime.

**REQ-R-ABG3-RETRY-006**: Retryable same-edge repair may continue while the configured policy still permits continuation and new signal is being produced. When configured retry budget is exhausted or successive attempts produce no new signal, ABG shall stop or escalate through authoritative runtime fact emission.
