# REQ-L-GTL2-EVALUATOR — Evaluators as First-Class Convergence Surfaces

**Status**: Active
**Category**: Capability
**Date**: 2026-03-25
**Derives from**: INT-GTL2-003A
**Wave**: 1

---

## Purpose

Evaluators are the typed convergence and attestation surface. They determine whether graph contracts have been satisfied.

## Acceptance Criteria

**REQ-L-GTL2-EVALUATOR-001**: `Evaluator` shall be a frozen, immutable declaration type with at minimum: name, regime, description, binding, tags.

**REQ-L-GTL2-EVALUATOR-002**: Evaluators answer: is this graph contract satisfied? Has this output converged? Has this gate been passed?

**REQ-L-GTL2-EVALUATOR-003**: Evaluators may operate in any regime: deterministic checks, probabilistic assessments, or human sign-offs.

**REQ-L-GTL2-EVALUATOR-004**: Evaluators are first-class GTL declarations. Their realization is plugin-dependent — GTL declares, engine plugins provide bindings, ABG-compatible engines create evaluation instances and provenance.

**REQ-L-GTL2-EVALUATOR-005**: The operator/evaluator separation is constitutional: operators answer "who/what does work," evaluators answer "what checks or attests convergence."

**REQ-L-GTL2-EVALUATOR-006**: `description` is a human-readable convergence contract declaring what the evaluator means. It belongs to the language declaration surface — ABG may render, project, or validate it, but shall not own or invent it.

**REQ-L-GTL2-EVALUATOR-007**: Domain-specific gap or closure metrics belong to evaluator declarations and their bindings, not to the interpreter. GTL provides the declaration surface by which domains plug those metrics into the engine.

**REQ-L-GTL2-EVALUATOR-008**: A contract boundary may declare one evaluator or an explicit evaluator set. The declaration shall make evaluator multiplicity and regime visible without embedding domain semantics in the interpreter.

**REQ-L-GTL2-EVALUATOR-009**: Evaluator bindings may resolve to domain-authored prompts, programs, or other external realizations. GTL declares the hook surface; domains own the evaluator logic.
