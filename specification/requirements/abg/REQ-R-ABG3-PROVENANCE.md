# REQ-R-ABG3-PROVENANCE — Replayable Provenance

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Preserve replay-visible provenance across event emission, policy resolution,
selection, execution, proof, and correction.

## Acceptance Criteria

**REQ-R-ABG3-PROVENANCE-001**: Events shall carry provenance sufficient for replay and audit, including workflow/runtime references where meaningful.

**REQ-R-ABG3-PROVENANCE-002**: When execution operates on a graph materialized from a published graph function, provenance shall preserve graph-function identity, materialization identity, and graph-call identity.

**REQ-R-ABG3-PROVENANCE-003**: Frame-local and foldback activity shall preserve frame attempt identity, frame lineage identity, and any parent call/frame relation needed for replay.

**REQ-R-ABG3-PROVENANCE-004**: Policy provenance shall preserve resolved bundle identity, resolved hook references, and default-source provenance when defaults participate.

**REQ-R-ABG3-PROVENANCE-005**: Selection provenance shall preserve which candidate was chosen, by which mechanism, and any supplied rationale.

**REQ-R-ABG3-PROVENANCE-006**: Continuation provenance shall preserve the causing event, run scope, and any causal linkage to replacement continuations.
