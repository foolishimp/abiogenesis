> **SUPERSEDED (2026-07-09) by T-217 — The Consciousness Wave**
> (.ai-workspace/tickets/active/T-217-consciousness-wave-higher-order-regulation.md)
> Content carried at: Phase 1 (diff-execution witness + binding export pin rule). Per the consolidation's nothing-lost law,
> every acceptance below is delivered or explicitly retired by the owning
> phase; this file is preserved as history.

# T-214 Diff-Execution Witness — Earned Depth for the Builder Itself

- id: T-214
- type: chore
- ticket_category: ordinary
- status: backlog
- goal: GOAL-032 (post-Foundation hardening; candidate Phase 5 rider)
- change_intent: >-
    Kill the shipped-but-never-executed class (T-032 Review B: a
    rewritten executor with a fatal ReferenceError went to a live run
    because "suite green" was vacuous for it). A change is DECLARED by
    the diff and EARNED by an executed witness: gates fail when changed
    non-live lines were never executed by the approving suite.
- change_class: realization_refactor
- triaged_at: 2026-07-09
- created_at: 2026-07-09

## Intake Triage (performed)

1. This is the earned-depth law applied reflexively to the builder:
   declaration (diff) never closes; an executed test whose coverage
   touches the change is the witness.
2. Mechanism: (a) suites run under node --experimental-test-coverage
   (or c8); a gate script diffs changed lines vs executed lines and
   fails on unwitnessed changes to non-live-gated source; (b) standing
   conformance rule from Review B generalized: every EXPORT of the
   generated odd_glc binding must be driven by at least one unit-lane
   test (the pin that would have caught the ReferenceError pre-ship).
3. SPAN: abiogenesis gate scripts + odd_glc unit lane; no kernel change.
4. NON-CLOSURE: coverage thresholds over the whole tree (that is
   coverage-in-general, not coverage-of-change — the class survives it).
