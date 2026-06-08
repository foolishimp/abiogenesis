# REQ-M-GTL3-CAPABILITY — Engine Capability Profiles

**Status**: Deferred
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: INT-006
**Wave**: 3

---

## Purpose

Engines declare capability profiles so GTL programs can determine mapping fidelity.

## Deferred Scope

This family is deferred for alternate-runtime mapping lines outside the
canonical ABG 3 engine.

The current canonical ABG 3 line preserves mapping truth through
`REQ-M-GTL3-MAPPING` and `REQ-M-GTL3-PROVENANCE`. It does not yet publish a
separate engine capability-profile surface as active constitutional runtime law.

## Acceptance Criteria

**REQ-M-GTL3-CAPABILITY-001**: An ABG-conformant engine shall publish a capability profile declaring which GTL constructs it can interpret.

**REQ-M-GTL3-CAPABILITY-002**: Capability profiles shall align with the active GTL, ABG, and mapping requirement families plus the ratified shared and tenant design surfaces that implement them.

**REQ-M-GTL3-CAPABILITY-003**: GraphFunction effects declarations shall be matchable against engine capability profiles for dispatch validation.
