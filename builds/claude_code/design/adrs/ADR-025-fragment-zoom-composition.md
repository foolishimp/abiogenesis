# ADR-025: Fragment, Zoom, and Recursive Composition

**Status**: Accepted
**Date**: 2026-03-24
**Implements**: REQ-F-FRAG-001, REQ-F-FRAG-002, REQ-F-FRAG-003, REQ-F-FRAG-004, REQ-F-COMP-001, REQ-F-COMP-002, REQ-F-COMP-003, REQ-F-REFINE-001, REQ-F-REFINE-002, REQ-F-REFINE-003
**Depends on**: ADR-023 (work_key), ADR-024 (work-scoped convergence)
**Derives from**: INT-004 (Recursive Work Identity and Compositional Graphs)

## Context

The SDLC graph is a static hand-crafted template. It defines a fixed topology (assets, edges, evaluators) that every feature traverses identically. Without composition primitives, the graph cannot:

1. **Express local refinement.** A coarse edge like `design→code` may need expansion into `design→module_decomp→code` for complex features, but the graph has no mechanism for this.

2. **Reuse subgraph patterns.** The `code↔unit_tests` co-evolution pattern could be a reusable fragment applied at multiple points, but there is no unit of reuse smaller than a Package.

3. **Decompose work recursively.** A feature that spans five modules cannot create per-module subgraphs that converge independently and fold results back to the parent.

The Codex strategy identifies Fragment as the second missing structural type (alongside work_key). Together, work_key provides addressing and Fragment provides structure — the IP layer that makes the static template operational.

## Decision

### Fragment — GTL type

```python
@dataclass(frozen=True)
class Fragment:
    name: str
    inputs: tuple[Asset, ...]    # provided by outer graph
    outputs: tuple[Asset, ...]   # consumed by outer graph
    assets: tuple[Asset, ...]    # internal
    edges: tuple[Edge, ...]      # internal
    contexts: tuple[Context, ...] = ()
```

Frozen dataclass, consistent with all other GTL types (ADR-017).

**Encapsulation**: Internal assets and edges are not visible to the outer graph. The fragment is a black box with typed input/output ports.

**No evaluators on Fragment itself**: Evaluators live on edges. The fragment's internal edges carry their own evaluators. The outer graph sees only whether the fragment's outputs are converged.

### Composition rules

Fragments compose into Packages:

```python
@dataclass(frozen=True)
class Package:
    # ... existing fields ...
    fragments: tuple[Fragment, ...] = ()
```

When a Package includes Fragments:
1. Fragment internal assets and edges are incorporated into the Package topology
2. Fragment inputs must be satisfied by existing Package assets
3. Fragment outputs become available as Package assets
4. The composed graph must remain a valid DAG — no cycles

Composition is validated at spec load time (alongside evaluator command validation per REQ-F-EVAL-001).

### Zoom — edge expansion

```python
def zoom(edge: Edge, fragment: Fragment) -> Package:
    """Replace edge with fragment's internal structure."""
```

Preconditions:
- Fragment inputs are compatible with edge source assets
- Fragment outputs are compatible with edge target assets

Postconditions:
- The original edge is removed
- Fragment internals are inserted
- New edges connect: edge sources → fragment inputs, fragment outputs → edge targets

**Delta aggregation**: `delta(zoomed_edge)` is the sum of `delta(internal_edge)` for all internal edges. The outer edge is converged when all internal edges are converged.

**Provenance**: The zoom operation emits a `zoomed` control event (Tier 2) through the normal event path, recording edge name, fragment name, and internal edge names (REQ-F-REFINE-001). This is automatic — not a caller responsibility. The graph topology at any point in time is reconstructable by replaying `zoomed` events (REQ-F-REFINE-003 AC-3). Zoom operations reference named Fragments with validated interfaces — refinement is structural, not arbitrary graph mutation (REQ-F-REFINE-003 AC-4).

### Named graph functions (REQ-F-COMP-001)

A graph function is a named, reusable, graph-valued function that produces a Fragment when applied:

```python
def requirements_to_design() -> Fragment:
    """Graph function: produces the requirements→design subgraph."""
    return Fragment(
        name="requirements_to_design",
        inputs=(requirements_asset,),
        outputs=(design_asset,),
        assets=(...),
        edges=(...),
    )
```

Graph functions have stable names and are registered in the Package or a library. The same graph function can be applied at multiple points in a graph, producing distinct Fragment instances with shared structure. Graph functions compose: the output interface of one can feed the input interface of another (REQ-F-COMP-001 AC-4).

### Graph function interfaces (REQ-F-COMP-002)

Every graph function declares typed input/output interfaces validated at composition time:

- **Input interface**: asset types the function requires from the outer graph
- **Output interface**: asset types the function produces for the outer graph
- Interface mismatch is a spec-load-time error (REQ-F-COMP-002 AC-4)
- Two graph functions with compatible interfaces are substitutable (REQ-F-COMP-002 AC-5)

### Fragment libraries (REQ-F-COMP-003)

A collection of Fragments can be defined as a library — a named, versioned set of reusable graph functions. Packages can import Fragments from libraries with composition validation across the import boundary. Fragment libraries follow the same territory rules as other installed assets. **Degenerate case:** Packages with no fragment imports continue to work unchanged.

### Spawn and fold-back

Spawn creates child work_keys (ADR-023) within a fragment:

```python
def spawn(parent_key: str, segment: str) -> str:
    """Create child work_key by appending segment."""
    return f"{parent_key}/{segment}"
```

Child work traverses the fragment's internal edges independently under its own work_key. Each child has its own convergence state (ADR-024).

**Fold-back rule**: Parent work_key convergence is a projection over all descendant work_key convergence:

```python
def parent_converged(parent_key: str, stream: EventStream) -> bool:
    children = [e for e in stream.read()
                if e["data"].get("work_key", "").startswith(parent_key + "/")]
    child_keys = {e["data"]["work_key"] for e in children}
    return all(
        delta(job, work_key=ck) == 0
        for ck in child_keys
        for job in jobs_for_key(ck)
    )
```

A parent is converged only when all its descendants are converged. This is event-sourced — no hidden imperative state.

### Spawn is event-sourced

Spawn and fold-back are recorded in the event stream:

```python
emit("work_spawned", {
    "parent_key": parent_key,
    "child_key": child_key,
    "fragment": fragment.name,
})
```

`work_spawned` is a Tier 2 control event emitted through the normal event path as part of the spawn operation (REQ-F-REFINE-002). It does not participate in fluent projection but is essential for reconstructing the work decomposition tree. Child lineage is reconstructable entirely from `work_spawned` events in the stream (REQ-F-REFINE-002 AC-3).

## Implementation

### GTL types (core.py)

Add `Fragment` frozen dataclass. Add `fragments` field to `Package` (default empty tuple for V1 compatibility).

### Composition validation (core.py)

New `validate_composition(package: Package)` called at spec load:
- For each fragment: verify inputs satisfied, outputs consumed or terminal
- Verify composed graph is acyclic (topological sort succeeds)
- Raise `SpecValidationError` on failure

### Zoom (schedule.py)

`zoom()` is a Package transformation — it produces a new Package with the edge replaced. The scheduler operates on the transformed Package.

Zoom is applied at bind time, not at spec load. This allows the same Package to be zoomed differently for different work_keys (a feature may zoom `design→code` while a hotfix does not).

### Spawn/fold-back (schedule.py)

`spawn()` creates child work_keys. The scheduler's `active_work_keys()` (ADR-024) discovers them from `work_spawned` events in the stream.

`parent_converged()` is called by `delta()` when the work_key has children. This makes fold-back transparent to the rest of the engine.

### Degenerate case

When `Package.fragments` is empty and no zoom operations are applied, the graph is the static authored topology. All existing behaviour preserved. Fragment composition is additive.

## Consequences

- The static hand-crafted graph becomes a composable template
- Local refinement is lawful — zoom expands edges without breaking the outer contract
- Recursive decomposition is event-sourced — spawn/fold-back through the stream, not imperative state
- Reusable patterns (e.g., `code↔tests` co-evolution) can be defined once as Fragments
- The GSDLC topology redesign (11 assets, 10 edges) can be expressed as Fragment compositions rather than a monolithic Package change
- **Degenerate case:** empty fragments, no zoom, no spawn — static authored graph
