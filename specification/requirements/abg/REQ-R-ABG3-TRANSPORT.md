# REQ-R-ABG3-TRANSPORT — Governed Probabilistic Transport

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define transport for governed `F_P` work as substrate truth rather than
product-local imperative code.

## Acceptance Criteria

**REQ-R-ABG3-TRANSPORT-001**: `F_P` dispatch shall use explicit transport surfaces owned by ABG. Product-local code shall not become the runtime fact owner after dispatch.

**REQ-R-ABG3-TRANSPORT-002**: Transport shall return structured substrate output sufficient to classify runtime defect, transport failure, payload-contract failure, or timeout without parsing agent internals as domain truth.

**REQ-R-ABG3-TRANSPORT-003**: Timeout, crash, nonzero exit, or equivalent subprocess failure shall remain substrate/runtime failure truth even if a result artifact exists.

**REQ-R-ABG3-TRANSPORT-004**: Missing, empty, malformed, or contract-invalid payload artifacts shall classify distinctly from transport/runtime defects.

**REQ-R-ABG3-TRANSPORT-005**: Certification or proof failure after constructive work shall remain downstream proof/closure truth, not transport truth.

**REQ-R-ABG3-TRANSPORT-006**: Agent CLI invocation contracts shall be owned by ABG but locally overrideable through runtime configuration so workspace/runtime-specific transport drift does not require product code changes.

**REQ-R-ABG3-TRANSPORT-007**: Malformed or unreadable local transport-contract overrides shall fail closed as runtime/policy configuration defects rather than silently falling back to embedded defaults.
