# REQ-R-ABG3-SELECTION-APPLICATION — Selection Application

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define lawful selection and application of candidate callable surfaces without
turning ABG into a strategy engine.

## Acceptance Criteria

**REQ-R-ABG3-SELECTION-APPLICATION-001**: ABG shall enumerate compatible graph or graph-function candidates for a contract boundary without making strategic choice.

**REQ-R-ABG3-SELECTION-APPLICATION-002**: ABG shall accept externally provided selection from `F_D`, `F_P`, `F_H`, or domain/business policy and apply it lawfully.

**REQ-R-ABG3-SELECTION-APPLICATION-003**: Selection provenance shall preserve candidate identity, selecting mechanism, and rationale when supplied.

**REQ-R-ABG3-SELECTION-APPLICATION-004**: The default runtime application of a selected graph function shall open graph-call and frame-local execution truth rather than rewrite published GTL carriers.

**REQ-R-ABG3-SELECTION-APPLICATION-005**: Hidden structural alternatives or ambiguous declared alternatives shall fail closed.
