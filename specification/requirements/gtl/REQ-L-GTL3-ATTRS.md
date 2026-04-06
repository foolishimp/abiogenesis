# REQ-L-GTL3-ATTRS — Immutable Metadata Carriers

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [GTL_3_CONSTITUTIONAL_DESIGN.md](../../GTL_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define `Attr` and `Attrs` as first-class immutable metadata carriers for GTL 3
declaration surfaces.

## Acceptance Criteria

**REQ-L-GTL3-ATTRS-001**: `Attr` and `Attrs` shall be first-class GTL declaration types for immutable metadata carriage.

**REQ-L-GTL3-ATTRS-002**: `Attrs` shall be the canonical shape for structured declaration data and policy-visible configuration in GTL 3.

**REQ-L-GTL3-ATTRS-003**: `Attrs` shall preserve stable ordered key/value truth and fail closed on duplicate keys.

**REQ-L-GTL3-ATTRS-004**: `Attrs` shall be usable at minimum on `Rule.config`, `GraphFunction.declarations`, `GraphVector.declarations`, `RefinementBoundary.hints`, `CandidateFamily.policy_hints`, `Role.policy_hooks`, and `Module.metadata`.

**REQ-L-GTL3-ATTRS-005**: `Attrs` shall remain inspectable, serializable, and replayable across publication and interpretation surfaces.

**REQ-L-GTL3-ATTRS-006**: `Attrs` is a metadata carrier, not a specialized policy semantic language.
