# REQ-R-ABG3-LINEAGE — Work Identity And Causal Lineage

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define lineage and causal identity across runs, graph calls, frames, and
continuations.

## Acceptance Criteria

**REQ-R-ABG3-LINEAGE-001**: `work_key` shall remain the lineage identity of graph application scope across run attempts.

**REQ-R-ABG3-LINEAGE-002**: Spawn, foldback, substitution, fan-out, and fan-in shall preserve explainable lineage through event causation/correlation.

**REQ-R-ABG3-LINEAGE-003**: `frame_lineage_id` shall remain stable across reopening or retry of the same recursive invocation boundary, while `frame_attempt_id` shall mint fresh attempt identity.

**REQ-R-ABG3-LINEAGE-004**: Each retry, reopen, or replacement callable attempt shall mint a fresh `GraphCall` identity. Cross-call relation shall be carried by event causation/correlation rather than a rival graph-call lineage aggregate.

**REQ-R-ABG3-LINEAGE-005**: `Continuation` shall be strictly run-local. Cross-run carry-forward shall be represented by authoritative closure of the old continuation and opening of a new continuation with explicit causal linkage.
