# REQ-L-GTL3-EVALUATOR — Evaluators As First-Class Convergence Surfaces

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [GTL_3_CONSTITUTIONAL_DESIGN.md](../../GTL_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define evaluators as first-class GTL declarations for convergence, attestation,
and gate-visible assessment.

## Acceptance Criteria

**REQ-L-GTL3-EVALUATOR-001**: `Evaluator` shall be a frozen, immutable declaration type with at minimum: `name`, `regime`, `description`, `binding`, and `tags`.

**REQ-L-GTL3-EVALUATOR-002**: Evaluators answer convergence questions such as whether a contract is satisfied, an output has converged, or a gate has passed.

**REQ-L-GTL3-EVALUATOR-003**: Evaluators may operate in deterministic, probabilistic, or human regimes.

**REQ-L-GTL3-EVALUATOR-004**: Evaluator `binding` shall be a declared implementation reference resolved by an engine or plugin. GTL declares the evaluator; engines provide executable realization and provenance.

**REQ-L-GTL3-EVALUATOR-005**: Evaluator multiplicity and ordering may be declared at a contract boundary without embedding domain closure semantics in the interpreter.

**REQ-L-GTL3-EVALUATOR-006**: Domain-specific gap, closure, ranking, or attestation semantics belong to evaluator declarations and their resolved implementations, not to the interpreter.
