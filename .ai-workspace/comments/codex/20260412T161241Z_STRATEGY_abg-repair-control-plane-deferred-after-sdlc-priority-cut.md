# STRATEGY: ABG Repair Control Plane Deferred After SDLC Priority Cut

**Author**: codex
**Date**: 2026-04-12T16:12:41Z
**Addresses**: Broad ABG/GTL repair-control-plane ideas observed during `test28`, after repricing immediate work back into `odd_sdlc`
**Status**: Draft

## Why This Note Exists

The broad content previously carried in `T-003` is real, but it is not the
highest-value active delivery wave.

`test28` showed two immediate needs:

- `odd_sdlc` still frames too much builder work like a pure-function call over
  serialized state instead of a stateful iterator over an asset under
  construction
- `odd_sdlc` deterministic checks still return too little repair detail to the
  probabilistic builder, often only `returncode: 1` with empty `stdout` and
  `stderr`

Those are the current bang-for-buck moves.

## Current Decision

The immediate work stays in `odd_method`.

The platform should not force an ABG-owned reusable prompt layer before the
domain has first corrected its own builder model.

The right current split is:

- `GTL` publishes declared hook points, graph structure, contexts, and
  contracts
- `ABG` executes those declarations and carries runtime facts
- `odd_sdlc` owns the builder model, control-frame design, ontology, and
  prompt composition over the stateful workspace asset

ABG should expose facts and execution surfaces, not own the domain’s builder
mind.

## Immediate Active Work

The current active tickets should be:

1. `odd_sdlc` stateful-iterator refactor
2. richer `F_D` repair evidence emitted by `odd_sdlc` evaluators through the
   surfaces ABG already carries (`returncode`, `stdout`, `stderr`)

Those are active because they improve live builder quality now without
requiring new substrate abstractions.

## Deferred ABG / GTL Questions

These remain valid, but they are deferred strategy, not immediate execution:

- whether ABG should eventually carry structured deterministic evidence beyond
  raw `stdout` / `stderr`
- whether ABG should emit canonical progress and stationarity facts for
  same-edge repair
- whether ABG should distinguish retry, lawful re-entry, and replacement as
  separate runtime states
- whether ABG should expose multi-surface transmission rather than only one
  final compound prompt
- whether GTL needs explicit published hook surfaces for retryability, budget,
  progress criteria, and escalation target

These should be reopened only after the immediate `odd_sdlc` work proves that
current ABG surfaces are insufficient.

## Reopen Conditions

Reopen ABG ticketing only if one of these becomes true:

- `odd_sdlc` cannot implement the stateful iterator/control-frame model using
  current ABG manifest and runtime facts
- richer `F_D` outputs require substrate schema support that raw
  `stdout` / `stderr` cannot carry cleanly
- live runs show that operator-driven retry requires canonical substrate facts
  rather than domain-local event interpretation

Until then, the broad platform work remains a strategy item rather than an
active ticket.

## Links

- replaced_ticket: `/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-003-enhance-abg-repair-signal-and-control-plane.md`
- odd_method_ticket: `/Users/jim/src/apps/odd_method/.ai-workspace/tickets/active/T-002-refactor-odd-sdlc-from-pure-function-builder-framing-to-stateful-iterator.md`
- odd_method_ticket: `/Users/jim/src/apps/odd_method/.ai-workspace/tickets/active/B-002-emit-repair-usable-fd-evidence-from-odd-sdlc-evaluators.md`
- evidence: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper.test28/.ai-workspace/events/events.jsonl`
- standard: `/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md`
- standard: `/Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md`
