# REQ-L-GTL3-SELECTION-BOUNDARY — Structural Selection Boundary

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Updated**: 2026-09-28
**Derives from**: [SPEC_METHOD.md](stdo://releases/v2.5.1-rc.1/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001/INT-008, [ODD_METHOD.md](stdo://releases/v2.5.1-rc.1/standards/ODD_METHOD.md), [Product calculus](../../PRODUCT.md#framed-evaluation-and-graph-consequence)

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

**REQ-L-GTL3-SELECTION-BOUNDARY-016**: Governance applicability, evaluation and
selection shall be declared graph computations traversed by HoG. Candidate
findings or graph choices shall cross ABG admission before declared consequence
and advancement. An overlay, plugin, SDK or downstream controller shall not
implement a rival selection/continuation loop. Policy remains explicit work
above the interpreter, not hidden interpreter strategy.

**REQ-L-GTL3-SELECTION-BOUNDARY-017**: Executable selection policy shall bind
its evaluator, required frame/input contracts, criteria and consequence relation.
Weights and thresholds may prioritize permitted choices but shall not waive a
mandatory constraint, required independent evaluation or reserved owner ruling.
Policy hints alone shall not supply this executable contract.

**REQ-L-GTL3-SELECTION-BOUNDARY-018**: Each evaluator shall declare its compute
regime. A supplied F_D checker shall implement an explicit total rule over a
closed declared domain; F_P shall own contextual judgment where no such rule
exists. Both shall preserve their result/evidence contracts and admission
boundary. Deterministic implementation shall not confer semantic authority.

**REQ-L-GTL3-SELECTION-BOUNDARY-019**: The selected 5.0 governance shall choose
only preregistered GraphFunctions in the exact admitted catalog view and
permitted by the Program at that boundary. Each registered graph shall declare
its functional purpose and conditions for use, linked to its input, result and
effect contracts. Selection shall identify that published declaration, inputs,
reason and supporting evidence; declared purpose or catalog presence alone shall
not establish applicability, permission or successful completion. Missing
suitable capability or unresolved required support shall remain an explicit gap.
Changed evidence may change the registered choice or justify compatible result
reuse while preserving the original outcome, unaffected valid work and remaining
obligations. It shall not author/recompose graph definitions, silently rewrite
the running Program or expand its callable scope. Existing registered-template
materialization and recursive invocation remain lawful. Future graph-building
work is outside this increment under Product Release Boundaries.
