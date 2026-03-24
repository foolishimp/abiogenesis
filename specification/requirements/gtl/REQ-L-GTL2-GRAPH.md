# REQ-L-GTL2-GRAPH — Graph Primacy

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-001
**Supersedes**: REQ-F-GRAPH (replaced)
**Wave**: 1

---

## Purpose

Graph is the one first-class structural type in GTL 2.x. All workflow structure is graph.

## Acceptance Criteria

**REQ-L-GTL2-GRAPH-001**: `Graph` shall be a frozen, immutable value type with at minimum: name, inputs, outputs, nodes, vectors, contexts, rules, effects, tags.

**REQ-L-GTL2-GRAPH-002**: A primitive graph vector (single step between two nodes) shall be representable as a minimal graph. No separate structural ontology is needed.

**REQ-L-GTL2-GRAPH-003**: A multi-step workflow, a subgraph, a reusable workflow, and a refined workflow shall all be expressible as `Graph`. No rival structural type is required.

**REQ-L-GTL2-GRAPH-004**: `Graph` shall declare its boundary interface through designated input and output nodes.

**REQ-L-GTL2-GRAPH-005**: `Graph` shall serve as the unit of substitution and composition — both operations accept and return `Graph`.

**REQ-L-GTL2-GRAPH-006**: `Graph` shall carry local constraints (rules) and declare or derive composed execution regimes (effects).
