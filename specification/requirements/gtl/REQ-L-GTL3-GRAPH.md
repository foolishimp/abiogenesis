# REQ-L-GTL3-GRAPH — Graph Primacy

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `Graph` as the first-class structural topology and materialization surface
of GTL 3.

`Graph` is the language-owned structure made of nodes, graph vectors, contexts,
rules, effects, and boundary nodes. It is not the public callable workflow
carrier by itself. Public work entry and semantic jobs bind through published
`GraphFunction` carriers that materialize graph structure.

## Acceptance Criteria

**REQ-L-GTL3-GRAPH-001**: `Graph` shall be a frozen, immutable value type with at minimum: `id`, `name`, `inputs`, `outputs`, `nodes`, `vectors`, `contexts`, `rules`, `effects`, and `tags`.

**REQ-L-GTL3-GRAPH-002**: A primitive graph step shall be representable as a minimal `Graph`. GTL shall not require a rival structural ontology for single-step workflows.

**REQ-L-GTL3-GRAPH-003**: A multi-step workflow, refined workflow, composed workflow, recursive workflow, and higher-order workflow shall all be expressible as `Graph`.

**REQ-L-GTL3-GRAPH-004**: `Graph` shall declare its boundary interface through designated input and output nodes.

**REQ-L-GTL3-GRAPH-005**: `Graph` shall be the unit of substitution and composition at the structural level. This structural composition role shall not make `Graph` a public callable workflow carrier or semantic job target.

**REQ-L-GTL3-GRAPH-006**: `Graph` shall carry local constraints and declared or derived execution-regime visibility through `rules` and `effects`.

**REQ-L-GTL3-GRAPH-007**: A `Graph` may be materialized by a published `GraphFunction`, but the `GraphFunction` shall remain the reusable outer workflow program and public callable carrier.

**REQ-L-GTL3-GRAPH-008**: Public execution shall follow the current GTL/ABG chain: `Job` -> `GraphFunction` -> ABG `GraphCall` -> materialized `Graph` -> internal `GraphVector` traversal. `Graph` shall not be targeted as a bare public execution entrypoint.

**REQ-L-GTL3-GRAPH-009**: Product-local terms such as graph overlay, workflow lane, app surface, or lifecycle graph may be used only when they bind back to `Graph`, `GraphFunction`, `Job`, or another first-class GTL declaration surface before declaring GTL or ABG behavior.
