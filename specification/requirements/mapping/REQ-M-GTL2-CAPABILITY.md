# REQ-M-GTL2-CAPABILITY — Engine Capability Profiles

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-009
**Supersedes**: (new layer)
**Wave**: 2

---

## Purpose

Engines declare capability profiles so GTL programs can determine mapping fidelity.

## Acceptance Criteria

**REQ-M-GTL2-CAPABILITY-001**: An ABG-compatible engine shall publish a capability profile declaring which GTL constructs it can interpret.

**REQ-M-GTL2-CAPABILITY-002**: Capability profiles shall align with the active GTL, ABG, and mapping requirement families plus the engine-mapping stance in `GTL_2_CONSTITUTIONAL_DESIGN.md`.

**REQ-M-GTL2-CAPABILITY-003**: GraphFunction effects declarations shall be matchable against engine capability profiles for dispatch validation.
