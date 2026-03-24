# Implements: REQ-F-CORE-001
# Implements: REQ-F-CORE-005
# Implements: REQ-F-CORE-006
# Implements: REQ-F-WKSP-001
# Implements: REQ-F-GATE-001
# Implements: REQ-F-GATE-002
# Implements: REQ-F-EVAL-002
# Implements: REQ-F-PROV-004
# Implements: REQ-F-WK-004
# Implements: REQ-F-WK-005
# Implements: REQ-F-FRAG-003
# Implements: REQ-F-FRAG-004
# Implements: REQ-F-LEAF-001
"""
schedule — delta, iterate, schedule, WorkInstance, zoom, spawn, parent_converged.

The asset-producing loop. Phase 4 of the approved execution plan.

  delta(job, stream, workspace_root) -> float
      0.0 = converged. > 0.0 = work needed.

  iterate(bound_job, on_fp_dispatch) -> WorkingSurface
      Universal HOF. Domain-blind. Job is the parameter.
      Does NOT call emit() — the engine calls emit() on the surface.

  schedule(workers) -> list[list[Worker]]
      Partitions workers into parallel-safe batches.
      V1: trivially [[single_worker]].
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Optional

from gtl.core import (
    Asset, Edge, Evaluator, F_D, F_H, F_P, Fragment, Job, Package, Worker,
    WorkingSurface,
)

from .bind import bind_fd, bind_fh, bind_fp_certified, req_hash, run_fd_evaluator
from .core import EventStream, project
from .manifest import BoundJob


# ── WorkInstance ─────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class WorkInstance:
    """
    The scheduler's dispatch unit: a (job, work_key) pair with attempt identity.

    REQ-F-WK-005: Scheduler creates work instances from (job, work_key) pairs.
    When work_key is None, this is the V1 degenerate case (global edge convergence).
    run_id is generated at creation time — each WorkInstance represents one attempt.
    """
    job: Job
    work_key: str | None = None
    run_id: str = field(default_factory=lambda: str(uuid.uuid4()))


# ── RunState ─────────────────────────────────────────────────────────────────

# Valid run states (ADR-027)
RUN_STATES = frozenset({
    "queued", "started", "dispatched", "pending",
    "assessed", "failed", "timed_out", "superseded",
})  # No "converged" — convergence is edge-level (delta()==0), not a run state

# Failure classifications (ADR-027 REQ-F-RUN-002)
FAILURE_CLASSES = frozenset({
    "transport_failure", "no_output", "bad_output", "certification_failure",
})


@dataclass(frozen=True)
class RunState:
    """
    Derived state of a single run attempt.

    ADR-027 REQ-F-RUN-001: state derived entirely from events — no mutable state.
    run_state() replays events to produce this.
    """
    work_key: str | None
    run_id: str
    edge: str
    state: str  # one of RUN_STATES
    failure_class: str | None = None
    attempt_number: int = 1
    superseded_by: str | None = None


# ── LeafTask ────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class LeafTask:
    """
    Bounded, schema-driven sub-work unit dispatched within iterate().

    ADR-027 REQ-F-LEAF-001: Leaf tasks are subordinate to graph traversal —
    they execute inside an iterate() call, not as independent graph edges.
    Schema-driven: input validated before dispatch, output validated after.
    Bounded: explicit timeout. Toolless by default.
    """
    name: str
    input_schema: dict       # JSON Schema for task input
    output_schema: dict      # JSON Schema for task output
    timeout_ms: int = 30_000
    tools_allowed: bool = False


# ── leaf schema validation ──────────────────────────────────────────────────

_JSON_TYPE_MAP = {
    "string": str,
    "number": (int, float),
    "integer": int,
    "boolean": bool,
    "array": list,
    "object": dict,
    "null": type(None),
}


def validate_leaf_schema(data: dict, schema: dict) -> tuple[bool, str]:
    """
    Minimal JSON Schema validation — stdlib only, no jsonschema dependency.

    Checks: required fields present, top-level type matching.
    Returns (valid, error_message). error_message is "" on success.
    """
    if not isinstance(data, dict):
        return False, f"expected dict, got {type(data).__name__}"

    required = schema.get("required", [])
    for field_name in required:
        if field_name not in data:
            return False, f"missing required field: {field_name}"

    properties = schema.get("properties", {})
    for field_name, field_schema in properties.items():
        if field_name not in data:
            continue
        expected_type = field_schema.get("type")
        if expected_type and expected_type in _JSON_TYPE_MAP:
            py_type = _JSON_TYPE_MAP[expected_type]
            if not isinstance(data[field_name], py_type):
                return False, (
                    f"field {field_name!r}: expected {expected_type}, "
                    f"got {type(data[field_name]).__name__}"
                )

    return True, ""


def run_state(
    all_events: list[dict],
    run_id: str,
) -> RunState | None:
    """
    Derive current RunState for a given run_id by replaying events.

    ADR-027: state derived entirely from events — no mutable state.
    Returns None if no events reference this run_id.

    Event types consumed:
      run_started{run_id, work_key, edge, attempt_number?}
      fp_dispatched{run_id, edge}
      assessed{run_id, edge}               — terminal success for the run
      run_failed{run_id, failure_class}     — terminal failure
      run_timed_out{run_id}                 — terminal timeout
      run_superseded{superseded_run_id, superseded_by}

    Note: edge_converged is an edge-level certificate emitted by gen_gaps,
    NOT a run lifecycle event. Runs terminate at assessed/failed/timed_out.
    Convergence is computed by delta() over the edge, not per-run.
    """
    state = None
    work_key = None
    edge = None
    failure_class = None
    attempt_number = 1
    superseded_by = None

    for e in all_events:
        etype = e.get("event_type")
        edata = e.get("data", {})
        erun = edata.get("run_id")

        if erun != run_id:
            # Check supersession — superseded_run_id references a different field
            if etype == "run_superseded" and edata.get("superseded_run_id") == run_id:
                state = "superseded"
                superseded_by = edata.get("superseded_by")
            continue

        if etype == "run_started":
            state = "started"
            work_key = edata.get("work_key", work_key)
            edge = edata.get("edge", edge)
            attempt_number = edata.get("attempt_number", attempt_number)

        elif etype == "fp_dispatched":
            state = "dispatched"
            edge = edata.get("edge", edge)

        elif etype == "assessed":
            state = "assessed"
            edge = edata.get("edge", edge)

        elif etype == "run_failed":
            state = "failed"
            failure_class = edata.get("failure_class")

        elif etype == "run_timed_out":
            state = "timed_out"

    if state is None:
        return None

    return RunState(
        work_key=work_key,
        run_id=run_id,
        edge=edge or "",
        state=state,
        failure_class=failure_class,
        attempt_number=attempt_number,
        superseded_by=superseded_by,
    )


def find_pending_run(
    all_events: list[dict],
    edge_name: str,
    *,
    work_key: str | None = None,
) -> RunState | None:
    """
    Find an active (dispatched/started) run for this (edge, work_key).

    ADR-027 REQ-F-RUN-003: at most one run in dispatched or pending state
    per (work_key, edge). Returns the RunState if found, None otherwise.

    Replaces _find_pending_dispatch() with full lifecycle awareness.
    """
    # Collect run_ids associated with this (edge, work_key)
    candidate_run_ids: list[str] = []
    for e in all_events:
        edata = e.get("data", {})
        erun = edata.get("run_id")
        if not erun:
            continue
        evt_edge = edata.get("edge")
        if evt_edge != edge_name:
            continue
        # Work-key scoping: exact match required.
        # Scoped query only sees scoped events with same key.
        # Global query only sees global (unscoped) events.
        evt_wk = edata.get("work_key")
        if work_key is not None:
            if evt_wk != work_key:
                continue  # Skip global events AND other-key events
        elif evt_wk is not None:
            continue  # Global query — skip scoped events
        if erun not in candidate_run_ids:
            candidate_run_ids.append(erun)

    # Check each candidate for dispatched/started state
    for rid in reversed(candidate_run_ids):  # Most recent first
        rs = run_state(all_events, rid)
        if rs is not None and rs.state in ("started", "dispatched"):
            return rs

    return None


def supersede_run(
    old_run_id: str,
    new_run_id: str,
    edge: str,
    work_key: str | None = None,
) -> dict:
    """Construct a run_superseded event for the caller to emit.

    ADR-027 REQ-F-RUN-003: supersession is a Tier 2 control event emitted
    when a new run is dispatched on the same (edge, work_key) while the
    old run is still in started/dispatched state.

    Returns the event dict — caller emits via stream.append().
    Pure function (no side effects).
    """
    data: dict = {
        "superseded_run_id": old_run_id,
        "superseded_by": new_run_id,
        "edge": edge,
    }
    if work_key is not None:
        data["work_key"] = work_key
    return {
        "event_type": "run_superseded",
        "data": data,
    }


# ── delta ─────────────────────────────────────────────────────────────────────

def _discover_children(events: list[dict], work_key: str) -> set[str]:
    """Discover child work_keys from work_spawned events in the stream."""
    children: set[str] = set()
    for e in events:
        if (e.get("event_type") == "work_spawned"
                and e.get("data", {}).get("parent_key") == work_key):
            child_key = e["data"].get("child_key")
            if child_key:
                children.add(child_key)
    return children


def delta(
    job: Job,
    stream: EventStream,
    workspace_root: Path,
    spec_hash: str | None = None,
    current_workflow_version: str = "unknown",
    carry_forward: list[dict] | None = None,
    *,
    work_key: str | None = None,
) -> float:
    """
    0.0 = converged. > 0.0 = work needed.

    F_D evaluators: run deterministic check. 0.0 if passes, 1.0 if fails.
    F_H evaluators: 0.0 if holdsAt(operative(edge, work_key, wv)), 1.0 otherwise.
    F_P evaluators: 1.0 unless all required F_D checks have passed (proxy signal).

    work_key: when provided, scopes convergence to a specific work unit.
    When absent, computes global edge convergence (V1 behaviour).

    REQ-F-FRAG-004: When a work_key has children (work_spawned events),
    convergence delegates to descendants — fold-back is transparent.

    Returns: fraction of failing evaluators (0.0 to 1.0).
    """
    if not job.evaluators:
        return 0.0

    events = stream.all_events()

    # REQ-F-FRAG-004: Fold-back — if this work_key has children,
    # convergence is the projection over all descendant convergence.
    if work_key is not None:
        children = _discover_children(events, work_key)
        if children:
            for ck in children:
                child_d = delta(job, stream, workspace_root, spec_hash,
                                current_workflow_version, carry_forward,
                                work_key=ck)
                if child_d > 0:
                    return 1.0
            return 0.0

    source = job.source_type
    source_name = source[0].name if isinstance(source, list) else source.name
    current = project(stream, source_name, "current", work_key=work_key)

    failing = 0

    for ev in job.evaluators:
        if ev.category is F_D:
            passes, _ = run_fd_evaluator(ev, current, workspace_root,
                                         work_key=work_key)
            if not passes:
                failing += 1

        elif ev.category is F_H:
            # Orphan tolerance: events referencing edges not in scope.jobs are
            # silently ignored. This is the mechanism that allows graph evolution
            # without event stream migration.
            if not bind_fh(job, events, current_workflow_version, carry_forward,
                           work_key=work_key):
                failing += 1

        elif ev.category is F_P:
            # EC: holdsAt(certified(edge, work_key, evaluator, spec_hash, wv), now)
            # Delegates to bind_fp_certified which handles revocation, spec_hash
            # identity, workflow_version scoping, and work_key scoping.
            if not bind_fp_certified(
                job, ev, events, spec_hash, current_workflow_version,
                work_key=work_key,
            ):
                failing += 1

    return failing / len(job.evaluators)


# ── iterate ───────────────────────────────────────────────────────────────────

def iterate(
    bound_job: BoundJob,
    on_fp_dispatch: Optional[Callable[[BoundJob], None]] = None,
    leaf_tasks: Optional[list[LeafTask]] = None,
    on_leaf_dispatch: Optional[Callable[["LeafTask", dict], tuple[dict | None, str | None]]] = None,
    run_id: Optional[str] = None,
    leaf_task_inputs: Optional[dict[str, dict]] = None,
) -> WorkingSurface:
    """
    The universal HOF. Domain-blind. Job is the parameter.

    Processes a BoundJob (the pre-computed manifest) and produces a WorkingSurface.
    Does NOT call emit() — the caller (engine) emits from the surface.

    on_fp_dispatch: called when F_P evaluators are failing. Caller decides routing.
    F_H gates: recorded in surface.events as fh_gate_pending.

    leaf_tasks: optional list of LeafTask sub-work units to dispatch before F_P.
        ADR-027 REQ-F-LEAF-001: subordinate to graph traversal, not independent edges.
        Degenerate case: None or empty → identical to V1 behavior.
    on_leaf_dispatch: callback(task, input_data) → (output, failure_class).
        Caller provides the actual dispatch mechanism. iterate() records events.
    run_id: parent run_id for leaf task sub-run derivation. Falls back to manifest_id.
    leaf_task_inputs: mapping of task name → input data dict. Tasks not in the map
        receive empty dict (backward compat with schema-less tasks).
    """
    surface = WorkingSurface()
    pre = bound_job.precomputed
    job = bound_job.job

    # Record what contexts were consumed
    surface.context_consumed = list(job.edge.context)

    # REQ-F-GATE-002 (ADR-021): F_D findings escalate to F_P on edges with
    # unresolved F_P evaluators. F_H still requires both F_D and F_P to pass.
    fd_failing = [ev for ev in pre.failing_evaluators if ev.category is F_D]
    fp_failing = [ev for ev in pre.failing_evaluators if ev.category is F_P]
    fh_failing = [ev for ev in pre.failing_evaluators if ev.category is F_H]

    # Record F_D findings — kind depends on whether F_P escalation is available
    if fd_failing:
        kind = "fd_findings" if fp_failing else "fd_gap"
        surface.events.append({
            "event_type": "found",
            "data": {
                "kind": kind,
                "edge": job.edge.name,
                "failing": [ev.name for ev in fd_failing],
                "delta_summary": pre.delta_summary,
            },
        })

    # ADR-027 REQ-F-LEAF-001: Dispatch leaf tasks before main F_P, if provided.
    # Leaf tasks are subordinate — their output feeds the F_P dispatch context.
    if fp_failing and leaf_tasks and on_leaf_dispatch:
        parent_run_id = run_id or bound_job.manifest_id or "unknown"
        _leaf_inputs = leaf_task_inputs or {}
        for task in leaf_tasks:
            sub_run_id = f"{parent_run_id}/leaf/{task.name}"
            surface.events.append({
                "event_type": "leaf_task_started",
                "data": {
                    "task": task.name,
                    "run_id": sub_run_id,
                    "parent_run_id": parent_run_id,
                    "edge": job.edge.name,
                },
            })
            input_data = _leaf_inputs.get(task.name, {})
            output, failure_class = on_leaf_dispatch(task, input_data)
            if failure_class is not None:
                surface.events.append({
                    "event_type": "leaf_task_failed",
                    "data": {
                        "task": task.name,
                        "run_id": sub_run_id,
                        "failure_class": failure_class,
                        "edge": job.edge.name,
                    },
                })
            else:
                surface.events.append({
                    "event_type": "leaf_task_completed",
                    "data": {
                        "task": task.name,
                        "run_id": sub_run_id,
                        "edge": job.edge.name,
                    },
                })
                if output:
                    surface.artifacts.append(f"leaf:{task.name}")

    # Dispatch F_P evaluators — F_D findings escalate, not gate
    if fp_failing:
        fp_dispatch_data: dict = {
            "edge": job.edge.name,
            "failing_evaluators": [ev.name for ev in fp_failing],
            "prompt_length": len(bound_job.prompt.split()),
        }
        if bound_job.manifest_id:
            fp_dispatch_data["manifest_id"] = bound_job.manifest_id
        surface.events.append({
            "event_type": "fp_dispatched",
            "data": fp_dispatch_data,
        })
        # Iteration evidence: manifest and result paths belong in the surface
        if bound_job.manifest_id:
            manifests_dir = ".ai-workspace/fp_manifests"
            surface.artifacts.append(f"{manifests_dir}/{bound_job.manifest_id}.json")
        if bound_job.result_path:
            surface.artifacts.append(bound_job.result_path)
        if on_fp_dispatch is not None:
            on_fp_dispatch(bound_job)

    # Record F_H gates — only when all F_D and all F_P pass
    if fh_failing and not fd_failing and not fp_failing:
        surface.events.append({
            "event_type": "fh_gate_pending",
            "data": {
                "edge": job.edge.name,
                "evaluators": [ev.name for ev in fh_failing],
                "criteria": [ev.description for ev in fh_failing],
            },
        })

    return surface


# ── schedule ──────────────────────────────────────────────────────────────────

def schedule(workers: list[Worker]) -> list[list[Worker]]:
    """
    Partition workers into parallel-safe execution batches.

    Batch i runs concurrently. Batch i+1 starts only after batch i completes.
    Workers A and B are in the same batch iff not A.conflicts_with(B).

    Derived entirely from Worker.writable_types — no external config.
    V1: single worker → trivially [[worker]].
    """
    if not workers:
        return []

    batches: list[list[Worker]] = []
    remaining = list(workers)

    while remaining:
        # Start a new batch with the first unassigned worker
        batch = [remaining[0]]
        still_remaining = []

        for w in remaining[1:]:
            # Add to current batch if it conflicts with no existing batch member
            if not any(w.conflicts_with(b) for b in batch):
                batch.append(w)
            else:
                still_remaining.append(w)

        batches.append(batch)
        remaining = still_remaining

    return batches


# ── zoom — edge expansion ────────────────────────────────────────────────────

def zoom(package: Package, edge: Edge, fragment: Fragment) -> Package:
    """
    Replace an edge with a fragment's internal structure.

    REQ-F-FRAG-003: zoom(edge, fragment) expands a coarse edge into the
    fragment's richer subgraph while preserving the outer contract.

    Preconditions:
    - Fragment inputs compatible with edge source assets
    - Fragment outputs compatible with edge target assets

    Connection is through name identity — fragment inputs share names with
    edge sources, fragment outputs share names with edge targets. The
    fragment's internal edges already reference these shared-name assets,
    so no explicit bridge edges are needed.

    Returns a new Package with:
    - The original edge removed
    - Fragment internal assets added
    - Fragment internal edges added

    Provenance: caller should emit zoom_event() after applying zoom.
    zoom() is a pure Package transformation — it does not emit events.
    """
    # Validate compatibility
    edge_sources = edge.source if isinstance(edge.source, list) else [edge.source]
    edge_source_names = {a.name for a in edge_sources}
    frag_input_names = {a.name for a in fragment.inputs}
    frag_output_names = {a.name for a in fragment.outputs}

    if not frag_input_names <= edge_source_names:
        missing = frag_input_names - edge_source_names
        raise ValueError(
            f"zoom: fragment '{fragment.name}' inputs {missing} "
            f"not provided by edge '{edge.name}' sources"
        )

    if edge.target.name not in frag_output_names:
        raise ValueError(
            f"zoom: edge '{edge.name}' target '{edge.target.name}' "
            f"not in fragment '{fragment.name}' outputs"
        )

    # Build new package
    new_edges = [e for e in package.edges if e.name != edge.name]
    new_edges.extend(fragment.edges)

    new_assets = list(package.assets)
    for a in fragment.assets:
        if a.name not in {existing.name for existing in new_assets}:
            new_assets.append(a)

    return Package(
        name=package.name,
        assets=new_assets,
        edges=new_edges,
        operators=package.operators,
        rules=package.rules,
        contexts=package.contexts,
        overlays=package.overlays,
        requirements=package.requirements,
        fragments=package.fragments,
    )


def zoom_event(edge: Edge, fragment: Fragment) -> dict:
    """
    Construct the zoomed provenance event for the caller to emit.

    REQ-F-FRAG-003 AC-5: The zoom operation is recorded in the event stream.
    zoom() is pure — it returns a transformed Package. The caller emits this
    event via the standard emit() path.
    """
    return {
        "event_type": "zoomed",
        "data": {
            "edge": edge.name,
            "fragment": fragment.name,
            "internal_edges": [e.name for e in fragment.edges],
        },
    }


def find_fragment_for_edge(package: Package, edge: Edge) -> Fragment | None:
    """
    Structural lookup: find a fragment whose ports match the edge.

    ADR-025: zoom is applied at bind time, not spec load. This function
    determines whether an edge has a compatible fragment by checking port
    compatibility — fragment inputs ⊆ edge sources, edge target ∈ fragment outputs.

    Returns None if no matching fragment exists (degenerate case: V1 static graph).
    """
    edge_sources = edge.source if isinstance(edge.source, list) else [edge.source]
    edge_source_names = {a.name for a in edge_sources}
    target_name = edge.target.name

    for frag in package.fragments:
        frag_input_names = {a.name for a in frag.inputs}
        frag_output_names = {a.name for a in frag.outputs}
        if frag_input_names <= edge_source_names and target_name in frag_output_names:
            return frag
    return None


# ── spawn / fold-back ────────────────────────────────────────────────────────

def spawn(parent_key: str, segment: str) -> str:
    """
    Create child work_key by appending a segment to the parent key.

    REQ-F-FRAG-004 AC-1: Spawn creates a child work_key by appending a
    segment to the parent key. The resulting key is hierarchical and stable.

    Example: spawn("INT-001/REQ-042", "module.auth") → "INT-001/REQ-042/module.auth"
    """
    return f"{parent_key}/{segment}"


def parent_converged(
    parent_key: str,
    stream: EventStream,
    jobs: list[Job],
    workspace_root: Path,
    spec_hash: str | None = None,
    current_workflow_version: str = "unknown",
    carry_forward: list[dict] | None = None,
) -> bool:
    """
    Check if a parent work_key is converged by checking all descendants.

    REQ-F-FRAG-004 AC-3/AC-4: parent work_key convergence is a projection
    over all descendant work_key convergence. A parent is converged only
    when all its descendants are converged.

    Discovers child work_keys from work_spawned events in the stream.
    If no children exist, the parent is checked directly.
    """
    events = stream.all_events()
    child_keys = _discover_children(events, parent_key)

    if not child_keys:
        # No children — check parent directly
        for job in jobs:
            d = delta(job, stream, workspace_root, spec_hash,
                      current_workflow_version, carry_forward,
                      work_key=parent_key)
            if d > 0:
                return False
        return True

    # Check all children (recursive — children may have their own children)
    for ck in child_keys:
        if not parent_converged(ck, stream, jobs, workspace_root,
                                spec_hash, current_workflow_version,
                                carry_forward):
            return False

    return True
