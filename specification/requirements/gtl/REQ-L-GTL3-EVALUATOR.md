# REQ-L-GTL3-EVALUATOR — Evaluators As First-Class Convergence Surfaces

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

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

**REQ-L-GTL3-EVALUATOR-007**: Probabilistic evaluator output for a declared edge assurance contract shall be a constrained finding over gain, close disposition, residual pressure, continuation, evidence, authority, and composition refs. Such output shall not directly close the edge, write a ledger, select a vector, or emit runtime events. If F_P proposes human involvement, that proposed close disposition shall be distinct from ABG's F_H-by-absentia disposition for a missing edge assurance contract.

**REQ-L-GTL3-EVALUATOR-008**: Evaluator declarations that participate in an `abg.fn_composition` contract shall preserve the evaluator regime, role, authority, consumed field refs, input carrier refs, output carrier refs, and evidence refs needed by ABG admission. A probabilistic or human evaluator may emit evidence or judgment state under the selected composition identity, but it shall not claim deterministic closure authority.

**REQ-L-GTL3-EVALUATOR-009**: Evaluator declarations shall expose `consumedFieldRefs` as an admitted carrier field when deterministic authority placement depends on which output fields downstream routing, execution construction, pressure projection, or closure predicates read. An empty consumed-field set is lawful only when the evaluator does not consume field-local payload truth for those decisions.

**REQ-L-GTL3-EVALUATOR-010**: Evaluator output carriers may include a generic evaluation scope ref for edge, segment, dimension-cell, fold, or relation scope when the evaluator is judging a declared sub-scope inside one graph-vector boundary. The scope ref shall be carrier identity and provenance for ABG admission and projection; it shall not give the evaluator runtime-event authority, ledger-write authority, traversal-selection authority, or closure authority.
