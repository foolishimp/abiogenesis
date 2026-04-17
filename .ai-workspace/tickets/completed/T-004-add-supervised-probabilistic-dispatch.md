# T-004 Add Supervised Probabilistic Dispatch

- id: T-004
- title: Add supervised probabilistic dispatch
- type: feature
- status: completed
- goal: runtime-supervision-and-recovery
- change_intent: Add a first-class ABG runtime capability for supervised probabilistic dispatch with retry, liveness, salvage, and escalation semantics.
- change_class: requirement_reprice
- re_entry_point: requirements
- priority: high
- intake_source: downstream proving run `odd_sdlc` -> `data_mapper.test33`, plus ABG runtime architecture review
- affected_boundary: ABG dispatch policy model, runtime capability surface, and graph-call governance
- triaged_at: 2026-04-17
- created_at: 2026-04-17
- updated_at: 2026-04-17

## Context

ABG currently has:

- engine-owned raw `F_P` dispatch
- CLI-owned `F_H` proxy handling

It does not have a first-class published capability for supervised automated
probabilistic work.

That missing middle is now valuable in its own right for deep edges such as:

- code generation
- release synthesis
- retrofit planning

## Capability

This feature should add a lawful runtime mode where ABG can choose supervised
probabilistic dispatch as a published alternative.

The supervised mode should own:

- progress/liveness observation
- bounded retries
- artifact salvage
- continuation handling
- escalation to real `F_H` only when supervision cannot close

## Important Boundary

This is not "pretend a script is human."

The supervised lane is still automated. It should be modeled as a first-class
ABG dispatch capability, not smuggled through ordinary `F_H` semantics.

If multiple dispatch modes are available per edge, selection should be lawful
through published runtime policy / alternative-family surfaces.

## Acceptance

- ABG publishes a supervised probabilistic dispatch mode as a first-class
  runtime capability.
- The capability carries explicit provenance and recovery semantics per edge.
- Ordinary raw `F_P` and supervised probabilistic dispatch are distinguishable
  in policy and in event truth.
- Escalation to real `F_H` remains possible but is no longer the only path to
  recovery.

## Links

- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/dispatch_runtime.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/transport.py`
- guide: `/Users/jim/src/apps/abiogenesis/CLAUDE.md`
