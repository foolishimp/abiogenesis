# REQ-R-ABG3-RUN — Run Governance

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `Run` as one engine-owned execution attempt over GTL semantic work.

## Acceptance Criteria

**REQ-R-ABG3-RUN-001**: `run_id` shall identify one execution attempt over one GTL job within one `work_key` scope.

**REQ-R-ABG3-RUN-002**: At most one live run shall exist per work scope at any time.

**REQ-R-ABG3-RUN-003**: ABG shall support run supersession by authoritative event truth. Supersession shall not silently preserve open continuations from the old run.

**REQ-R-ABG3-RUN-004**: Canonical run truth shall be projected centrally from lifecycle events. Consumers may read run projection, but they shall not define rival lifecycle summaries that contradict the central run algebra.

**REQ-R-ABG3-RUN-005**: Run truth shall remain distinct from convergence truth. A run may terminate independently of whether a particular boundary converged.

**REQ-R-ABG3-RUN-006**: Run terminalization shall remain replay-visible through authoritative lifecycle events rather than hidden controller memory.

**REQ-R-ABG3-RUN-007**: If a constructive turn closes its callable boundary but must hand off unresolved non-blocking observer truth to the next lawful observer or routing layer, ABG shall project that run as yielded rather than completed.

**REQ-R-ABG3-RUN-008**: If a fresh re-entry encounters a valid, current, already-attested preserved `F_P` result for the active boundary, ABG shall deterministically validate and ingest that preserved attestation rather than redispatching the same probabilistic turn.

**REQ-R-ABG3-RUN-009**: Run idempotency means the same admitted graph-function
identity, runtime policy, run identity, work key, and frame basis replay to the
same runtime instance truth. A different run identity is a different execution
attempt even when the reusable graph function and materialized graph are
unchanged.
