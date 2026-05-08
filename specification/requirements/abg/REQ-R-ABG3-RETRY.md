# REQ-R-ABG3-RETRY — Generic Retry And Repair Governance

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-12
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

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

**REQ-R-ABG3-RETRY-007**: Traversal non-progress retry eligibility shall be projected by ABG from replay-derived runtime truth, retry policy, and the retryable runtime failure class allowlist. A downstream product shall not compute retry eligibility from a product-local dossier, shard summary, or private loop state.

**REQ-R-ABG3-RETRY-008**: Traversal non-progress timeout classes shall map into the existing retry failure taxonomy before retry projection. `inactivity_timeout` maps to `no_output`; `hard_timeout` and `transport_exit` map to `transport_failure`; payload or report contract defects map to `contract_failure` only after deterministic artifact/report admission rejects them.

**REQ-R-ABG3-RETRY-009**: Retry budget exhaustion shall be evaluated against runtime liveness observer disposition before another expensive worker call is launched. If the observer projection reports inactivity with no retry budget remaining, ABG shall block, yield, escalate, or reprice through typed runtime truth rather than dispatch another attempt.
