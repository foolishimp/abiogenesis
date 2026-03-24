# ADR-023: Work Identity — work_key and run_id

**Status**: Accepted
**Date**: 2026-03-24
**Implements**: REQ-F-WK-001, REQ-F-WK-002, REQ-F-WK-003, REQ-F-TRAV-001
**Derives from**: INT-004 (Recursive Work Identity and Compositional Graphs)

## Context

The V1 engine has no concept of work identity. `iterate()` operates on a `(job)` — an edge in the graph — with no way to distinguish which piece of work is being attempted or which attempt it is. This means:

1. **No per-feature convergence at code-tier.** `delta(job)` is global. Adding a new feature to a converged workspace produces delta=0 because the global evaluators (tests_pass, impl_tags) still pass. The new feature's work is invisible to the scheduler.

2. **No attempt tracking.** When F_P is dispatched twice on the same edge, the events are distinguishable only by timestamp. There is no structured way to query "all attempts on this piece of work."

3. **No hierarchical decomposition.** A module within a feature, or a requirement within a module, cannot carry its own identity through the iterate loop.

The Codex strategy doc ("Recursion, Not Feature Routing") identifies this as the missing IP layer — the addressing/routing layer above iterate()'s transport.

## Decision

### work_key

`work_key` is a `/`-delimited hierarchical string that identifies a unit of work across time.

```
INT-001/REQ-042/build.design/module.auth
```

Rules:
- Segments are arbitrary strings (no fixed schema) — the hierarchy is the identity
- The key is **stable**: the same piece of work always has the same key regardless of how many attempts are made
- Child work is expressed as key refinement: parent `INT-001/REQ-042` spawns child `INT-001/REQ-042/module.auth`
- `work_key` is a `str` field, not a structured type — parsing is by convention, not enforcement

### run_id

`run_id` is a UUID4 string generated per attempt on a work_key. Multiple runs on the same work_key produce distinct run_id values.

```python
run_id = str(uuid.uuid4())
```

Why UUID4 over content hash: run_id identifies the attempt, not its content. Two attempts that produce identical output are still distinct attempts (different time, different context). UUID4 is simple, collision-free, and requires no input.

### iterate() signature

```python
def iterate(job: Job, evaluator_fn, asset_state,
            *, work_key: str | None = None,
            run_id: str | None = None) -> IterateResult:
```

`work_key` and `run_id` are primary structural parameters — not optional annotations. They carry the identity of the work being attempted. The constitutional runtime surface reflects `(job, work_key, run_id)` as the unit of traversal (REQ-F-TRAV-001 AC-5). **Degenerate case:** when absent, a single WorkInstance with `work_key=None` is created per job.

### EventStream changes

`EventStream.append()` injects `work_key` and `run_id` into event data using the same set-default pattern as `workflow_version`:

```python
if work_key is not None:
    data.setdefault("work_key", work_key)
if run_id is not None:
    data.setdefault("run_id", run_id)
```

**Degenerate case:** events without `work_key` remain valid — they participate in global (unscoped) queries only.

### project() overload

```python
# V1 — global projection
project(stream, asset_type, instance_id) -> AssetState

# V2 — work-scoped projection
project(stream, asset_type, work_key) -> AssetState
```

When `work_key` is provided, projection filters events to those matching the key. **Degenerate case:** when absent, all events are considered (global projection).

## Implementation

### GTL types (core.py)

No new frozen dataclasses. `work_key` and `run_id` are `str` parameters threaded through the call stack, not structural types. They are closer to "coordinates" than "things."

### EventStream (core.py)

Add `work_key` and `run_id` to the set-default injection in `append()`, alongside `workflow_version`.

### Scope (core.py)

`Scope` gains optional `work_key: str | None` and `run_id: str | None` fields. These are set by the scheduler when dispatching work instances (ADR-024).

### project() (core.py)

Add optional `work_key` parameter. When present, filter `edge_started` events to those where `data.get("work_key") == work_key`. When absent, no filter (V1).

### Attempt history

Reconstructable by:
```python
[e for e in stream.read() if e["data"].get("work_key") == key]
```

Ordered by `event_time`. Grouped by `run_id` for per-attempt views.

## Consequences

- iterate() gains identity awareness without changing its core loop
- WorkInstance is the end-to-end dispatch unit across command selection, runtime dispatch, and iterate (REQ-F-TRAV-001)
- Event stream carries richer provenance without schema migration
- **Degenerate case:** work_key=None preserves global traversal
- Foundation for ADR-024 (work-scoped convergence), ADR-025 (fragments), ADR-026 (correction law)
