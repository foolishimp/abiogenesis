# REQ-L-GTL3-SYNTHESIS — Deferred Synthesis And Lawful Refinement

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define deferred synthesis and refinement as lawful GTL 3 declaration surfaces.

## Acceptance Criteria

**REQ-L-GTL3-SYNTHESIS-001**: GTL shall provide a declarative surface for deferred synthesis or refinement with an explicit outer contract boundary.

**REQ-L-GTL3-SYNTHESIS-002**: A synthesis or refinement declaration shall specify the interface and contract obligations that any produced graph or graph function must satisfy.

**REQ-L-GTL3-SYNTHESIS-003**: A graph or graph function produced through deferred synthesis shall be applicable only through lawful substitution or refinement that preserves the declared outer contract.

**REQ-L-GTL3-SYNTHESIS-004**: A synthesis or refinement boundary may expose tags, hints, governance hook references, opaque configuration, or capability requirements without embedding hidden strategic choice.

**REQ-L-GTL3-SYNTHESIS-005**: GTL shall be able to expose multiple lawful synthesis candidates or one lawful synthesis boundary without deciding which candidate is chosen.

**REQ-L-GTL3-SYNTHESIS-006**: Deferred synthesis or refinement shall carry enough structural truth that an engine can record replayable provenance for which boundary was refined and what graph or graph function was applied.

**REQ-L-GTL3-SYNTHESIS-007**: Trigger visibility for synthesis or refinement may be declared through evaluator and hook surfaces. Engines execute the protocol and shall not invent trigger semantics.

**REQ-L-GTL3-SYNTHESIS-008**: When a synthesis or refinement boundary materializes a graph function or graph-derived companion bundle, the published graph-function identity and declared materialization truth shall be preserved.
