# REQ-L-GTL2-RULE — Declarative Constraints and Gates

**Status**: Active
**Category**: Capability
**Date**: 2026-03-25
**Derives from**: INT-GTL2-006, INT-GTL2-007
**Supersedes**: REQ-F-GATE (subsumed)
**Wave**: 2

---

## Purpose

Rules are declarative constraints. They describe what must hold. Gates apply rules and/or evaluators to control flow.

## Acceptance Criteria

**REQ-L-GTL2-RULE-001**: `Rule` shall be a declarative constraint type. Examples: consensus thresholds, policy gates, type-consistency rules, coverage rules.

**REQ-L-GTL2-RULE-002**: Rules are passive declarations — they describe what must hold, not how to enforce it.

**REQ-L-GTL2-RULE-003**: The relationship between Rule, Evaluator, and gate() shall be: Rule = what must hold, Evaluator = mechanism of checking, gate() = graph combinator that blocks or allows continuation.

**REQ-L-GTL2-RULE-004**: Gate behavior (approval mode, dissent handling) shall be expressed via `config`, not as Rule-level fields. ABG-specific gate semantics (consensus thresholds, dissent recording) are runtime interpretation of declarative config, not language-level type structure.
