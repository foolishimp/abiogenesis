# REQ-R-ABG2-INTERPRET — Graph Interpretation

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-008
**Supersedes**: REQ-F-CORE (replaced), REQ-F-CMD (replaced — interpreter portions), REQ-F-TRAV (subsumed)
**Wave**: 1

---

## Purpose

ABG shall load, interpret, and execute GTL 2.x structural declarations as a canonical target engine surface.

## Acceptance Criteria

**REQ-R-ABG2-INTERPRET-001**: ABG shall load GTL 2.x structural declarations (Graph, Node[T], Operator, Evaluator, Rule, GraphFunction, Module) without collapsing them into GTL 1.0 shapes.

**REQ-R-ABG2-INTERPRET-002**: ABG shall treat primitive step traversal as interpretation of minimal graphs, not a rival ontology.

**REQ-R-ABG2-INTERPRET-003**: ABG shall materialize graph functions when needed, producing concrete graph instances from templates and parameters.

**REQ-R-ABG2-INTERPRET-004**: ABG shall execute operator bindings (deterministic, probabilistic, human) over graph contracts.

**REQ-R-ABG2-INTERPRET-005**: ABG shall execute evaluator bindings and record evaluation attempts, results, and provenance.

**REQ-R-ABG2-INTERPRET-006**: ABG shall determine next-action from graph truth and event history, not from ad hoc command logic.
