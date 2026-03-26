# REQ-L-GTL2-SELECTION-BOUNDARY — Structural Selection Boundary

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-03-24
**Derives from**: INT-GTL2-007
**Supersedes**: (new constraint)
**Wave**: 1

---

## Purpose

The language may expose candidates but shall not embed hidden strategic choice. Selection belongs to evaluators or business logic above the interpreter.

## Acceptance Criteria

**REQ-L-GTL2-SELECTION-BOUNDARY-001**: GTL may expose candidate families, interface equivalence, tags, and optional policy hints.

**REQ-L-GTL2-SELECTION-BOUNDARY-002**: GTL shall not embed hidden workflow choice, business priority, or engine strategy.

**REQ-L-GTL2-SELECTION-BOUNDARY-003**: Selection belongs to: deterministic rule execution, probabilistic contextual analysis, human judgment, or business/intent logic above the interpreter.

**REQ-L-GTL2-SELECTION-BOUNDARY-004**: The interpreter may enumerate lawful candidates. It shall not silently decide the "best" one.

**REQ-L-GTL2-SELECTION-BOUNDARY-005**: Candidate families may include named structural profiles, harvest/merge alternatives, or other policy-visible variants for the same contract boundary, provided the boundary remains explicit and strategic choice stays outside the interpreter.
