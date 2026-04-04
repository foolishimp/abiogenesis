# REQ-L-GTL2-SYNTHESIS — Deferred Synthesis and Lawful Refinement

**Status**: Active
**Category**: Capability
**Date**: 2026-03-26
**Derives from**: INT-GTL2-005A, INT-GTL2-007
**Wave**: 2

---

## Purpose

GTL may declare lawful synthesis/refinement points where consumer logic can produce or select an interface-compatible inner graph or graph function without embedding business-choice logic in the interpreter.

## Acceptance Criteria

**REQ-L-GTL2-SYNTHESIS-001**: GTL shall provide a declarative surface for deferred synthesis or refinement. The declaration shall make the outer contract boundary explicit.

**REQ-L-GTL2-SYNTHESIS-002**: A synthesis/refinement declaration shall specify the interface and contract obligations that any produced graph or graph function must satisfy.

**REQ-L-GTL2-SYNTHESIS-003**: A graph or graph function produced through deferred synthesis shall be applicable only through lawful substitution/refinement that preserves the declared outer contract.

**REQ-L-GTL2-SYNTHESIS-004**: The declaration surface may expose opaque tags, hints, policy-visible metadata, or capability requirements for external consumers and evaluators. It shall not embed hidden strategic choice.

**REQ-L-GTL2-SYNTHESIS-005**: GTL shall be able to expose multiple lawful synthesis candidates or a lawful synthesis boundary without deciding which candidate is chosen. Selection belongs to evaluators, consumers, or higher business/intent logic above the interpreter.

**REQ-L-GTL2-SYNTHESIS-006**: Deferred synthesis/refinement shall carry enough structural truth that an interpreter can record replayable provenance for which boundary was refined and what graph/function was applied. The recording obligation belongs to the engine.

**REQ-L-GTL2-SYNTHESIS-007**: A synthesis/refinement boundary may be triggered by evaluator outcomes or aggregate convergence results declared through GTL/domain surfaces. GTL declares the boundary and trigger visibility; ABG executes the protocol; the engine does not invent the trigger semantics.

**REQ-L-GTL2-SYNTHESIS-008**: When a synthesis/refinement boundary materializes a graph function or a graph-derived companion bundle, the boundary shall preserve the published graph-function identity and the declared materialization profile or inputs used to derive that result.
