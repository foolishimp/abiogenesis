# REQ-L-GTL3-GRAPH — Graph Primacy

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `Graph` as the one first-class structural type of GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-GRAPH-001**: `Graph` shall be a frozen, immutable value type with at minimum: `name`, `inputs`, `outputs`, `nodes`, `vectors`, `contexts`, `rules`, `effects`, and `tags`.

**REQ-L-GTL3-GRAPH-002**: A primitive graph step shall be representable as a minimal `Graph`. GTL shall not require a rival structural ontology for single-step workflows.

**REQ-L-GTL3-GRAPH-003**: A multi-step workflow, refined workflow, composed workflow, recursive workflow, and higher-order workflow shall all be expressible as `Graph`.

**REQ-L-GTL3-GRAPH-004**: `Graph` shall declare its boundary interface through designated input and output nodes.

**REQ-L-GTL3-GRAPH-005**: `Graph` shall be the unit of substitution and composition at the structural level.

**REQ-L-GTL3-GRAPH-006**: `Graph` shall carry local constraints and declared or derived execution-regime visibility through `rules` and `effects`.
