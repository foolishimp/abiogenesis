# ADR-032 — Cumulative Environment Graph Functions And Disjoint-Write Scheduling

**Series**: abiogenesis / claude_code build
**Status**: Accepted
**Date**: 2026-04-06
**Implements**: REQ-L-GTL3-GRAPHFUNCTION, REQ-L-GTL3-COMPOSE, REQ-R-ABG3-BINDING, REQ-R-ABG3-WORKER
**Scope**: `gtl/function_model.py`, `gtl/algebra.py`, `gtl/module_model.py`, `genesis/binding.py`, `genesis/selection.py`, `genesis/services.py`, `genesis/interpret.py`, package surfaces, tests, builder guide

---

## Context

The prior GTL composition story treated composition as immediate output piping:

- `f.outputs` satisfy `g.inputs`
- the next step reads only the previous step

That is too weak for real SDLC graphs.

Real constructive workflows depend on cumulative carried truth:

- upstream typed assets remain live inputs to later steps
- recursive expansion operates over the world built so far
- public semantic entry still belongs to `GraphFunction`, not bare internal vectors

At the same time, ABG parallelism must stay conservative.

The engine cannot treat overlapping writers as "probably mergeable" without inventing hidden semantics. Parallelism must be lawful from declared structure, not inferred optimistically after the fact.

This line is a hard cutover. No compatibility layer is retained for the earlier immediate-output composition model.

## Decision

### 1. `GraphFunction` owns an explicit cumulative environment contract

`GraphFunction` now publishes `environment` as first-class truth:

- `requires`
- `provides`
- `carries`

`inputs` must equal `environment.requires`.

`outputs` must be represented in `environment.provides`.

`environment.carries` is the cumulative typed closure available after execution.

### 2. Composition is over cumulative environment closure, not one-step output matching

`compose(f, g)` is lawful when `g.environment.requires` can be satisfied by `f.environment.carries`.

The composed function:

- keeps `f.environment.requires` as its entry contract
- accumulates provided bindings
- accumulates carried bindings immutably

Missing or structurally mismatched downstream requirements fail closed.

Conflicting carried output bindings fail closed.

### 3. The canonical public carrier for one live vector is a graph function

When a builder wants one executable step to be callable as public work, the canonical helper is a graph-function carrier over that vector.

For this line, `graph_function_for_vector(...)` is the canonical publication helper for that pattern.

This removes the awkward "hand-author one inline graph function around every leaf vector" boilerplate from builder code without reintroducing vector-first public entry.

### 4. Modules publish public carriers, not hidden leaf alternatives

Public semantic entry remains:

`Job -> GraphFunction -> materialized graph -> internal GraphVector traversal`

Therefore:

- public callable carriers are published in `Module.graph_functions`
- the live internal vectors of those carriers are published through `Module.graphs`
- every live internal vector publishes a traversal target through `RefinementBoundary` or `CandidateFamily`

Leaf graph functions that merely mirror live internal vectors are not published as additional module graph functions unless they are themselves job-bound public carriers or explicit candidate-family members.

This prevents hidden alternatives on the module surface.

### 5. ABG schedules by disjoint write territory

Worker and executable-job parallelism is governed by write territory.

- disjoint write territories may batch in parallel
- overlapping write territories must serialize
- read overlap alone is not a conflict

This is the default engine law. No implicit merge semantics are introduced for overlapping writers.

### 6. ABG binding resolves a local runtime environment for each live vector

ABG does not dispatch against bare source/target names alone.

For each executable vector boundary, binding resolves a runtime environment
snapshot that:

- uses the live vector source as the local required contract
- uses the live vector target as the provided contract
- preserves the published graph-function carried closure when present
- distinguishes external/root entry bindings from bindings that must already be
  replay-visible because they are produced inside the same carrier

Missing internally produced required bindings do not silently pass and do not
trigger F_P dispatch. They leave the route open and blocked until upstream
constructive truth exists.

Conflicting carried contracts fail closed.

## Consequences

### Positive

- composition now matches cumulative SDLC asset construction
- recursive carriers operate over additive world state rather than one-step piping
- public carrier publication is simpler for leaf vectors
- module publication surfaces are clearer and fail closed
- runtime binding now sees cumulative environment truth rather than only the immediate source asset
- parallelism remains safe and replayable

### Negative

- builders must author explicit environment contracts
- modules must publish live graphs and traversal targets, not only top-level jobs
- earlier immediate-output composition intuition is no longer valid
- runtime planning must distinguish external entry bindings from internally produced carried bindings

### Follow-on

- the builder guide must teach cumulative environment law as the primary authoring model
- shipped packages and sandbox fixtures must publish composed executives through the new carrier pattern only
- reviews should reject new code that reintroduces output-piping composition or hidden vector-first public entry
