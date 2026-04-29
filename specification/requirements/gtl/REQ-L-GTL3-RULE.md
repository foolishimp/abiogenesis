# REQ-L-GTL3-RULE — Declarative Constraints And Gates

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define rules as passive GTL declarations of what must hold at a contract
boundary.

## Acceptance Criteria

**REQ-L-GTL3-RULE-001**: `Rule` shall be a frozen, immutable declaration type with at minimum: `name`, `kind`, `config`, and `tags`.

**REQ-L-GTL3-RULE-002**: Rules are passive declarations. They describe what must hold, not how enforcement is performed.

**REQ-L-GTL3-RULE-003**: The constitutional split shall remain: `Rule` = what must hold, `Evaluator` = what checks or attests convergence, `gate(...)` = the graph combinator that blocks or allows continuation.

**REQ-L-GTL3-RULE-004**: Rule configuration may carry opaque, policy-visible parameters for gate protocol, aggregation, ordering, or threshold concerns without turning GTL into a policy semantic language.

**REQ-L-GTL3-RULE-005**: Engines may enforce declared rule protocol, but the underlying business, merge, ranking, or approval semantics remain outside the interpreter unless explicitly supplied through declarations and resolved implementations.
