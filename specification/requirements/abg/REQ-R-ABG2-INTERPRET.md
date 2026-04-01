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

**REQ-R-ABG2-INTERPRET-004**: ABG shall execute operator bindings (deterministic, probabilistic, human) over graph contracts, including frame-local child contracts opened by lawful graph-function application.

**REQ-R-ABG2-INTERPRET-005**: ABG shall execute evaluator bindings and record evaluation attempts, results, and provenance.

**REQ-R-ABG2-INTERPRET-006**: ABG shall determine next-action from graph truth and event history, not from ad hoc command logic. Open invocation frames and fold-back state are part of that truth.

**REQ-R-ABG2-INTERPRET-007**: Canonical graph-function materialization shall fail closed on undeclared graph-function identity, undeclared profile, undeclared structural parameter, or materialization output that violates the published outer contract.

**REQ-R-ABG2-INTERPRET-008**: When a realized or refined boundary declares deterministic proof surfaces, ABG shall be able to derive and execute the corresponding evaluator bundle from that same materialization/refinement truth without inventing hidden interpreter-local strategy.

**REQ-R-ABG2-INTERPRET-009**: ABG shall realize graph-function selection as invocation/frame execution over a stable published module surface. The default runtime result of selection is frame-local executable truth and lineage, not module-global graph replacement.

**REQ-R-ABG2-INTERPRET-010**: Recursive frame execution shall resolve nested traversal only from validated frame-local/imported publication truth plus already-realized frame-local executable vectors. Structural alternatives must still be explicitly published; if neither a lawful published structural target nor a realized frame-local executable vector is present, interpretation shall fail closed rather than synthesizing one.

**REQ-R-ABG2-INTERPRET-011**: Recursive interpretation shall progress as tail-loop recursion over explicit continuation and child-frontier state sufficient for suspend/resume, distributed coordination, and bounded control-state growth. Command/service polling and whole-frame replay scans may assist recovery or projection, but shall not be the sole semantic carrier of recursive next-action truth.

**REQ-R-ABG2-INTERPRET-012**: Serialized checkpoints or continuation snapshots may aid resumability, but authoritative recursive truth remains the causal event/history plus declared contracts. Checkpoints shall not create a conflicting second truth surface for recursive execution state.
