# ADR-014: F_D Evaluators Gate F_P and F_H Dispatch

**Status**: Accepted
**Date**: 2026-03-16
**Implements**: REQ-F-GATE-002

## Context

The engine schedule dispatches F_P evaluators and emits F_H gate events during iteration. Prior to this ADR, dispatch was triggered by any failing evaluator regardless of type — meaning F_P work could be dispatched while F_D checks were still failing, and F_H gate events could be emitted before deterministic checks passed.

This wastes agent budget (F_P cycles run against a state that will be invalidated by the next F_D fix), can produce false convergence (F_P passes but F_D is red, leaving the system in a broken semi-converged state), and violates the evaluator escalation contract from GENESIS_BOOTLOADER §VII:

```
η: F_D → F_P    (deterministic blocked → agent explores)
η: F_P → F_H    (agent stuck → human review)
```

The natural transformation direction is unambiguous: F_P is invoked only when F_D is exhausted, F_H only when F_P is exhausted.

## Decision

The scheduler enforces two invariants:

1. **F_D gates F_P**: All F_D evaluators for the current edge must return delta=0 before any F_P evaluator is dispatched. If any F_D evaluator is failing, the engine surfaces F_D failures and stops the current iteration without dispatching F_P.

2. **F_D + F_P gate F_H**: All F_D evaluators AND all F_P evaluators for the current edge must have passed (delta=0) before the engine emits an F_H gate event. The F_H gate is the final review of a complete, deterministically-verified candidate.

## Consequences

- F_P is never dispatched against a broken state — agent budget is not wasted on work that will be discarded
- F_H never reviews a candidate that has failing deterministic checks — human judgment is reserved for genuine ambiguity, not broken builds
- The engine exit code 4 (`fd_gap`) surfaces F_D failures explicitly when F_P has already assessed pass but F_D is still red — this is a construction quality problem, not a dispatch problem

## Implementation

`schedule.py` — in the `schedule()` or equivalent dispatch function:
- Before dispatching any F_P evaluator: check all F_D evaluators for the edge; if any fail, return without dispatching F_P
- Before emitting any F_H gate event: check all F_D evaluators AND all F_P assessments; if any fail, return without gating
