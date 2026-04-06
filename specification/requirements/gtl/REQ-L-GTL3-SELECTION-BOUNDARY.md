# REQ-L-GTL3-SELECTION-BOUNDARY — Structural Selection Boundary

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [GTL_3_CONSTITUTIONAL_DESIGN.md](../../GTL_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define lawful structural selection boundaries in GTL 3 without hidden choice.

## Acceptance Criteria

**REQ-L-GTL3-SELECTION-BOUNDARY-001**: GTL may expose candidate families, interface equivalence, tags, and policy hints at a structural selection boundary.

**REQ-L-GTL3-SELECTION-BOUNDARY-002**: GTL shall not embed hidden workflow choice, business priority, or engine strategy.

**REQ-L-GTL3-SELECTION-BOUNDARY-003**: Selection belongs to deterministic rule execution, probabilistic contextual analysis, human judgment, or higher intent/business logic above the interpreter.

**REQ-L-GTL3-SELECTION-BOUNDARY-004**: The interpreter may enumerate lawful candidates. It shall not silently choose the best one.

**REQ-L-GTL3-SELECTION-BOUNDARY-005**: Candidate families shall preserve one explicit outer contract across all lawful candidates.

**REQ-L-GTL3-SELECTION-BOUNDARY-006**: `policy_hints` are visible to external evaluators and consumers. They are not executable selection semantics.

**REQ-L-GTL3-SELECTION-BOUNDARY-007**: A published `GraphFunction` bound by a semantic `Job` is a public callable carrier, not an implicit candidate-family alternative.
