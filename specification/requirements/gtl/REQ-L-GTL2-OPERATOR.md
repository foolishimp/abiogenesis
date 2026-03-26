# REQ-L-GTL2-OPERATOR — Operators as First-Class Regimes

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-003
**Supersedes**: REQ-F-EVAL (replaced — operator portions)
**Wave**: 1

---

## Purpose

Operators are the typed effectful action surface. They perform work or effectful transitions over graph contracts.

## Acceptance Criteria

**REQ-L-GTL2-OPERATOR-001**: `Operator` shall be a frozen, immutable declaration type with at minimum: name, regime, binding, tags.

**REQ-L-GTL2-OPERATOR-002**: The language shall support at least three operator regimes: deterministic, probabilistic, and human/judgment.

**REQ-L-GTL2-OPERATOR-003**: Operators perform work. They are distinct from evaluators, which check or attest convergence. This separation is constitutional.

**REQ-L-GTL2-OPERATOR-004**: Operator realization is plugin-dependent. GTL declares the operator; engine plugins provide bindings/implementations.
