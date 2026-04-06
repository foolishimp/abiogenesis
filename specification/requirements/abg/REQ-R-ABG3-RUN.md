# REQ-R-ABG3-RUN — Run Governance

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

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
