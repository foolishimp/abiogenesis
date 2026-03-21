# SCHEMA: F_D Evaluator Leaf-Predicate Boundary

**Author**: Codex
**Date**: 2026-03-21T02:03:54+11:00
**Addresses**: `specification/requirements.md` REQ-F-EVAL-001, evaluator safety semantics, recursion boundary
**For**: all

## Summary
REQ-F-EVAL-001 is trying to enforce the right safety property, but it states it too broadly. The real boundary is not "no `genesis` subcommands." The real boundary is that an `F_D` evaluator must remain a leaf predicate and must not invoke orchestration or re-enter the engine control loop.

This proposal rewrites the rule around that boundary. Pure diagnostic `genesis check-*` commands remain allowed because they are deterministic leaf checks. Stateful or orchestration subcommands remain forbidden because they collapse the distinction between evaluator and controller.

## Problem
The current wording says:

- command must not invoke `genesis` subcommands

But the constitutional package specs already use:
- `genesis check-tags`
- `genesis check-req-coverage`
- `genesis check-impl-coverage`
- `genesis check-validates-coverage`

And the accepted runtime/traceability ADRs clearly treat those as legitimate deterministic subprocess checks.

So the current rule contradicts the intended architecture even though the architectural concern itself is real.

## Intended Safety Property

The safety property is:

An `F_D` evaluator is a bounded deterministic predicate. It may observe workspace state and return a result, but it must not assume the role of the control layer.

That means an evaluator must not:
- launch `genesis start`
- launch `genesis iterate`
- launch `genesis gaps`
- launch `emit-event` to steer convergence progression
- recursively invoke behavior that can dispatch F_P or request F_H

Otherwise the evaluator ceases to be a predicate and becomes a hidden controller.

## Proposed Contract

### 1. F_D evaluators are leaf predicates

An `F_D` evaluator command may:
- read files
- inspect the package/spec/workspace
- run deterministic analysis tools
- run pure verification commands
- return structured diagnostic output

An `F_D` evaluator command may not:
- initiate orchestration
- mutate convergence state except through its return result
- dispatch agent work
- request human review
- re-enter the engine control loop

### 2. Pure diagnostic `genesis check-*` commands are allowed

If a `genesis` subcommand is:
- deterministic
- bounded
- side-effect free with respect to convergence control
- not writing to the event log or advancing workflow state

then it is admissible as an `F_D` evaluator command.

This covers the traceability and coverage checks already designed into abiogenesis.

### 3. Stateful/orchestration subcommands are forbidden

Any subcommand that:
- drives iteration
- emits or appends control events
- changes convergence state
- dispatches F_P
- triggers F_H progression

is forbidden inside an `F_D` evaluator command.

This is the actual acyclicity boundary.

### 4. Event emission belongs to the control layer

The evaluator computes a result. The control layer interprets it and decides whether to:
- append events
- continue iterating
- dispatch F_P
- block on F_H

This preserves clean causality:
- evaluator observes
- control layer decides
- event substrate records

## Proposed Rewrite Of REQ-F-EVAL-001

Current AC-2:

- Command must not invoke genesis subcommands (acyclic — no engine calling itself)

Proposed replacement:

- Command must not invoke orchestration or state-mutating `genesis` subcommands
  such as `start`, `iterate`, `gaps`, or `emit-event`
- Pure diagnostic `genesis check-*` subcommands are allowed if they are bounded,
  deterministic, and do not mutate workflow/event state

This keeps the original rationale while removing the contradiction.

## Why This Is The Right Boundary

The iterator is allowed to control iteration because it is the controller.

The `F_D` evaluator is not.

That is the core distinction. A control layer may legitimately loop, re-project, and make progression decisions. A leaf evaluator may not recursively call the controller that is currently evaluating it.

So the correct architectural boundary is not "never call the CLI." It is "never let a leaf predicate become a hidden orchestrator."

## Recommended Action
1. Rewrite REQ-F-EVAL-001 around leaf-predicate behavior, not blanket CLI prohibition.
2. Explicitly whitelist pure diagnostic `genesis check-*` commands.
3. Explicitly forbid evaluator-driven orchestration subcommands and event-emission paths.
4. Treat the control-layer rule as: evaluators compute; the controller decides; the event substrate records.

