# REQ-R-ABG2-INTERPRET — Graph Interpretation

**Status**: Active
**Category**: Capability
**Date**: 2026-03-25
**Derives from**: INT-GTL2-008, INT-GTL2-012, INT-GTL2-013
**Supersedes**: REQ-F-CORE (replaced), REQ-F-CMD (replaced — interpreter portions), REQ-F-TRAV (subsumed)
**Wave**: 1

---

## Purpose

ABG shall load, interpret, and execute GTL 2.x structural declarations as a canonical target engine surface.

## Acceptance Criteria

**REQ-R-ABG2-INTERPRET-001**: ABG shall load GTL 2.x structural and semantic declarations (Graph, Node[T], Operator, Evaluator, Rule, GraphFunction, Module, Job, Role) without collapsing them into GTL 1.0 shapes.

**REQ-R-ABG2-INTERPRET-002**: ABG shall treat primitive step traversal as interpretation of minimal graphs, not a rival ontology.

**REQ-R-ABG2-INTERPRET-003**: ABG shall materialize graph functions when needed, producing concrete graph instances from explicit, replayable materialization requests over declared graph-function identity, profiles, and structural parameters.

**REQ-R-ABG2-INTERPRET-004**: ABG shall execute operator bindings (deterministic, probabilistic, human) over graph contracts.

**REQ-R-ABG2-INTERPRET-005**: ABG shall execute evaluator bindings and record evaluation attempts, results, and provenance.

**REQ-R-ABG2-INTERPRET-006**: ABG shall determine next-action from graph truth and event history, not from ad hoc command logic.

**REQ-R-ABG2-INTERPRET-007**: Canonical graph-function materialization shall fail closed on undeclared graph-function identity, undeclared profile, undeclared structural parameter, or materialization output that violates the published outer contract.

**REQ-R-ABG2-INTERPRET-008**: When a realized or refined boundary declares deterministic proof surfaces, ABG shall be able to derive and execute the corresponding evaluator bundle from that same materialization/refinement truth without inventing hidden interpreter-local strategy.
