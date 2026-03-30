# REQ-L-GTL2-GRAPHFUNCTION — Reusable Workflow Programs

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-004
**Supersedes**: REQ-F-COMP (replaced), REQ-F-FRAG (replaced)
**Wave**: 1

---

## Purpose

GraphFunction is the primary reusable GTL compute abstraction — a named workflow program with explicit outer interface and declared effects.

## Acceptance Criteria

**REQ-L-GTL2-GRAPHFUNCTION-001**: `GraphFunction` shall be a frozen, immutable type with at minimum: name, inputs, outputs, template, effects, tags.

**REQ-L-GTL2-GRAPHFUNCTION-002**: A graph function shall have an explicit typed outer interface (input/output nodes). It materializes a `Graph` and remains the reference contract boundary for callers.

**REQ-L-GTL2-GRAPHFUNCTION-003**: The template shall be represented as replayable publication truth: a symbolic template reference and/or equivalent serializable graph-template representation. Interpreter-local callable resolution may exist as implementation convenience, but it is not the published graph-function contract.

**REQ-L-GTL2-GRAPHFUNCTION-004**: Graph materialization may depend on parameters: input cardinality, selected workflow family, policy-visible structural parameters.

**REQ-L-GTL2-GRAPHFUNCTION-005**: The `effects` surface shall support static analysis, candidate filtering, lawful composition reasoning, engine capability matching, and human-vs-machine workflow visibility.

**REQ-L-GTL2-GRAPHFUNCTION-006**: Named workflows are reusable through graph functions, not through copied structure (reuse law).

**REQ-L-GTL2-GRAPHFUNCTION-007**: `GraphFunction` shall be the unit of lawful composition, substitution, recursion, and higher-order graph application.

**REQ-L-GTL2-GRAPHFUNCTION-008**: A graph function's declared outer contract shall remain stable even when internal refinement changes its realized graph structure.

**REQ-L-GTL2-GRAPHFUNCTION-009**: Graph materialization may expose named, policy-visible structural profiles or variants. Profile declaration belongs to GTL; profile choice belongs to evaluators, consumers, or higher intent/business logic above the interpreter.

**REQ-L-GTL2-GRAPHFUNCTION-010**: Published graph functions shall be discoverable as first-class module surfaces rather than remaining implicit helper code outside module publication.

**REQ-L-GTL2-GRAPHFUNCTION-011**: A graph function shall support lawful materialization from declared inputs, selected profiles, or policy-visible structural parameters without relying on ambient hidden interpreter state.

**REQ-L-GTL2-GRAPHFUNCTION-012**: Graph-function materialization shall expose enough identity and provenance surface that a consumer or engine can answer at minimum: which graph function materialized, which declared inputs or profiles were used, and which realized graph was produced.

**REQ-L-GTL2-GRAPHFUNCTION-013**: Graph-derived companion bundles, such as selected subgraphs, evaluator bundles, or profile manifests, may be derived from a published graph function so long as graph remains the primary structural output and the derivation preserves replayable provenance.

**REQ-L-GTL2-GRAPHFUNCTION-014**: A graph function may be cached or reused across executions only when the cache identity is derived from its declared materialization inputs, profiles, and graph-function identity rather than from opaque ambient process state.

**REQ-L-GTL2-GRAPHFUNCTION-015**: When a realized or refined graph-function boundary declares deterministic proof surfaces, a replayable evaluator bundle shall be derivable from that same materialization/refinement truth rather than from hidden interpreter-local state.
