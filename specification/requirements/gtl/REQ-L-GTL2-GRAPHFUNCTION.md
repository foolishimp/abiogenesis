# REQ-L-GTL2-GRAPHFUNCTION — Reusable Workflow Programs

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-004
**Supersedes**: REQ-F-COMP (replaced), REQ-F-FRAG (replaced)
**Wave**: 1

---

## Purpose

GraphFunction is a reusable named workflow abstraction — a parameterized graph template with explicit interface and declared effects.

## Acceptance Criteria

**REQ-L-GTL2-GRAPHFUNCTION-001**: `GraphFunction` shall be a frozen, immutable type with at minimum: name, inputs, outputs, template, effects, tags.

**REQ-L-GTL2-GRAPHFUNCTION-002**: A graph function shall have an explicit typed interface (input/output nodes). It materializes a `Graph`.

**REQ-L-GTL2-GRAPHFUNCTION-003**: The template may be authored as a callable (Python DSL convenience) or as a serializable graph-template representation. The semantic contract is "materializable graph template," not "arbitrary Python behavior."

**REQ-L-GTL2-GRAPHFUNCTION-004**: Graph materialization may depend on parameters: input cardinality, selected workflow family, policy-visible structural parameters.

**REQ-L-GTL2-GRAPHFUNCTION-005**: The `effects` surface shall support static analysis, candidate filtering, engine capability matching, and human-vs-machine workflow visibility.

**REQ-L-GTL2-GRAPHFUNCTION-006**: Named workflows are reusable through graph functions, not through copied structure (reuse law).
