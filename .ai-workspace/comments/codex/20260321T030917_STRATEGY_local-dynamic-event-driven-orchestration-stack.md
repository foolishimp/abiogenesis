# STRATEGY: Local Dynamic Event-Driven Orchestration Stack

**Author**: Codex
**Date**: 2026-03-21T03:09:17+11:00
**Addresses**: reference implementation direction for multi-worker local orchestration, dynamic workflow assembly, OL-native eventing
**For**: all

## Summary
For the current abiogenesis/genesis_sdlc direction, a heavyweight workflow runtime is not necessary yet. The target problem is still local, direct, code-build orchestration on a single machine, with deterministic control over multiple workers, event-driven progression, and OL-native lineage.

The recommended direction is a lightweight reference stack:
- `NetworkX` for graph/DAG structure
- `AnyIO` for local structured concurrency
- `python-statemachine` for explicit iterator/control-state modeling when needed
- `OpenLineage` client for event emission
- optional `Blinker` for in-process event signaling

Temporal/Prefect remain later escalation options, not baseline dependencies.

## Context
The clarified use cases are:
- parallel build by two workers
- consensus between multiple workers
- start new workflows dynamically from intent vectors / discovery inputs

Those use cases imply:
- the engine needs deterministic orchestration over multiple workers
- the orchestration can be event-driven
- the graph/workflow can be assembled dynamically
- the event substrate is OpenLineage

They do **not** yet imply:
- remote distributed workers
- durable long-running orchestration across machine/process failure
- an external orchestration control plane

So the immediate architecture should stay local and explicit.

## Recommended Stack

### 1. Graph model: `NetworkX`

Use `NetworkX` as the reference graph substrate.

Why:
- natural fit for DAG checks and topological ordering
- easy dependency queries
- dynamic graph assembly from intent/requirements vectors
- keeps graph semantics explicit instead of burying them in control code

Recommended role:
- package/workflow graph construction
- next-job eligibility
- dependency validation
- graph rewriting / assembly during discovery

### 2. Local orchestration: `AnyIO`

Use `AnyIO` as the local concurrency layer.

Why:
- structured concurrency
- task groups
- semaphores and cancellation
- local async orchestration without importing distributed workflow complexity

Recommended role:
- running multiple worker tasks locally
- coordinating parallel-safe batches
- handling timeouts/cancellation
- driving event-triggered progression on one machine

### 3. Iterator/control layer: `python-statemachine` when complexity justifies it

The iterator is a constitutional concept. The implementation should stay explicit.

If the iterator logic remains small, a hand-written controller is fine.
If it grows more complex, use `python-statemachine` to make states, guards, and transitions visible.

Recommended role:
- controller state
- phase transitions
- consensus wait states
- discovery/intent workflow state transitions

### 4. Event substrate: OpenLineage client

Use the OpenLineage Python client for event emission rather than inventing a new wire format.

Recommended role:
- emit canonical lineage events
- attach custom facets for context resolution, overrides, consensus, routing, provenance
- keep the event/logging layer aligned with the forward constitutional direction

### 5. Optional in-process signaling: `Blinker`

If local modules need decoupled notification, `Blinker` is sufficient.

Recommended role:
- internal signals between scheduler, lineage emitter, UI/CLI feedback, and observers

This is optional. Do not add it unless the local coupling problem is real.

## What Not To Adopt Yet

### Temporal

Temporal is powerful, but it solves a bigger problem:
- durable workflow execution
- retries across failures
- remote workers
- long-lived orchestration

That is not yet the core abiogenesis need for direct local code build.

### Prefect

Prefect is lighter than Temporal for many Python-first workflows, but it is still a fuller orchestration product than the current problem requires.

It becomes attractive when you want:
- richer operational UX
- event/automation features
- broader workflow productization

For now, it is more platform than requirement.

## Architectural Reading
The right current move is:

- constitutionalize orchestration semantics
- keep implementation local and explicit
- adopt small focused libraries for graph, concurrency, state, and lineage
- delay platform-scale workflow runtimes until the system truly needs durability/distribution

This keeps the engine understandable while still supporting:
- multiple workers
- event-driven progression
- dynamic workflow assembly
- consensus later

## Recommended Action
1. Treat `NetworkX + AnyIO + OpenLineage` as the reference implementation baseline.
2. Add `python-statemachine` only if the iterator/controller becomes hard to reason about in plain code.
3. Keep `Blinker` optional for local decoupling, not architectural foundation.
4. Do not adopt Temporal/Prefect into the core design yet; revisit only when durability, distributed workers, or external orchestration become real requirements.

