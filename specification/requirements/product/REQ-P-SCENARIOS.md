# REQ-P-SCENARIOS — Product Scenarios

**Status**: Active
**Category**: Verification
**Date**: 2026-03-24
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md) (Verification Layers)
**Wave**: 1

---

## Purpose

Product scenarios are the operational meaning layer. They validate that the GTL/ABG system can actually do what the words describe.

## Acceptance Criteria

**REQ-P-SCENARIOS-001**: Every claimed GTL capability shall have at least one concrete product scenario that validates it end-to-end.

**REQ-P-SCENARIOS-002**: Scenarios shall be concrete use cases, not rewrites of requirement text. They test operational meaning, not spec coverage.

**REQ-P-SCENARIOS-003**: When a scenario cannot be written, the capability is not yet real. When a scenario fails, the gap is between actual behavior and claimed capability.

**REQ-P-SCENARIOS-004**: Research-product-lab qualification shall include
scenario families for extraction, synthesis, transformation, fan-out, ambiguity
harvesting, and gap evaluation when ABIogenesis is claimed as a substrate for
ODD-native downstream products.

**REQ-P-SCENARIOS-005**: Each research scenario shall state its source
requirement authority, graph-function carrier, expected proof lane, and
non-closure conditions. Scenario prose alone is not closure evidence.

**REQ-P-SCENARIOS-006**: Scenario implementation shall prefer outcome code
through graph functions first, declarative carrier publication second, and
minimal imperative binding only where substrate delivery requires it.

**REQ-P-SCENARIOS-007**: Scenario proof shall not copy Python SDLC imperative
orchestration as product law. Python SDLC may supply functionality reference
material and comparison evidence, but the TypeScript research lab shall express
accepted behavior through GTL, ABG, ODD requirements, design, and proof lanes.
