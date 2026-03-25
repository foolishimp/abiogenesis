# Implements: REQ-F-CORE-001
# Implements: REQ-F-CORE-005
# Implements: REQ-F-WKSP-001
# Implements: REQ-F-GATE-001
# Implements: REQ-F-GATE-002
# Implements: REQ-F-EVAL-002
# Implements: REQ-F-LEAF-001
# Implements: REQ-R-ABG2-SELECTION-APPLICATION-002
"""
interpret — Graph interpretation loop.

iterate, schedule, apply_selection.

apply_selection owns lawful application of a SelectionDecision:
validate interface, apply substitute(), emit workflow_selected.
Per GTL_2_MODULE_DESIGN §4.4, interpret owns event emission — selection
and subwork are pure kernel modules that return values.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

from gtl.operator_model import Evaluator, F_D, F_H, F_P
from gtl.graph import Graph, GraphVector
from gtl.function_model import GraphFunction
from gtl.module_model import Module
from gtl.algebra import substitute

from .binding import ExecutableJob, Worker, BoundJob, WorkSurface
from .selection import SelectionDecision, validate_selection
from .subwork import LeafTask


# ── iterate ───────────────────────────────────────────────────────────────────

def iterate(
    bound_job: BoundJob,
    on_fp_dispatch: Optional[Callable[[BoundJob], None]] = None,
    leaf_tasks: Optional[list[LeafTask]] = None,
    on_leaf_dispatch: Optional[Callable[[LeafTask, dict], tuple[dict | None, str | None]]] = None,
    run_id: Optional[str] = None,
    leaf_task_inputs: Optional[dict[str, dict]] = None,
) -> WorkSurface:
    """
    The universal HOF. Domain-blind. ExecutableJob is the parameter.

    Processes a BoundJob and produces a WorkSurface.
    Does NOT call emit() — the caller (engine) emits from the surface.
    """
    pre = bound_job.precomputed
    job = bound_job.executable_job

    events: list[dict] = []
    artifacts: list[str] = []

    fd_failing = [ev for ev in pre.failing_evaluators if ev.regime is F_D]
    fp_failing = [ev for ev in pre.failing_evaluators if ev.regime is F_P]
    fh_failing = [ev for ev in pre.failing_evaluators if ev.regime is F_H]

    if fd_failing:
        kind = "fd_findings" if fp_failing else "fd_gap"
        events.append({
            "event_type": "found",
            "data": {
                "kind": kind,
                "edge": job.vector.name,
                "failing": [ev.name for ev in fd_failing],
                "delta_summary": pre.delta_summary,
            },
        })

    # ADR-027 REQ-F-LEAF-001: Dispatch leaf tasks before main F_P
    if fp_failing and leaf_tasks and on_leaf_dispatch:
        parent_run_id = run_id or bound_job.manifest_id or "unknown"
        _leaf_inputs = leaf_task_inputs or {}
        for task in leaf_tasks:
            sub_run_id = f"{parent_run_id}/leaf/{task.name}"
            events.append({
                "event_type": "leaf_task_started",
                "data": {
                    "task": task.name,
                    "run_id": sub_run_id,
                    "parent_run_id": parent_run_id,
                    "edge": job.vector.name,
                },
            })
            input_data = _leaf_inputs.get(task.name, {})
            output, failure_class = on_leaf_dispatch(task, input_data)
            if failure_class is not None:
                events.append({
                    "event_type": "leaf_task_failed",
                    "data": {
                        "task": task.name,
                        "run_id": sub_run_id,
                        "failure_class": failure_class,
                        "edge": job.vector.name,
                    },
                })
            else:
                events.append({
                    "event_type": "leaf_task_completed",
                    "data": {
                        "task": task.name,
                        "run_id": sub_run_id,
                        "edge": job.vector.name,
                    },
                })
                if output:
                    artifacts.append(f"leaf:{task.name}")

    if fp_failing:
        fp_dispatch_data: dict = {
            "edge": job.vector.name,
            "failing_evaluators": [ev.name for ev in fp_failing],
            "prompt_length": len(bound_job.prompt.split()),
            "job_id": job.job.id,
        }
        if run_id:
            fp_dispatch_data["run_id"] = run_id
        if bound_job.manifest_id:
            fp_dispatch_data["manifest_id"] = bound_job.manifest_id
        events.append({
            "event_type": "fp_dispatched",
            "data": fp_dispatch_data,
        })
        if bound_job.manifest_id:
            manifests_dir = ".ai-workspace/fp_manifests"
            artifacts.append(f"{manifests_dir}/{bound_job.manifest_id}.json")
        if bound_job.result_path:
            artifacts.append(bound_job.result_path)
        if on_fp_dispatch is not None:
            on_fp_dispatch(bound_job)

    if fh_failing and not fd_failing and not fp_failing:
        events.append({
            "event_type": "fh_gate_pending",
            "data": {
                "edge": job.vector.name,
                "evaluators": [ev.name for ev in fh_failing],
                "criteria": [ev.description for ev in fh_failing],
            },
        })

    return WorkSurface(
        events=tuple(events),
        artifacts=tuple(artifacts),
        context_consumed=tuple(job.vector.contexts),
    )


# ── schedule ──────────────────────────────────────────────────────────────────

def schedule(workers: list[Worker]) -> list[list[Worker]]:
    """Partition workers into parallel-safe execution batches."""
    if not workers:
        return []

    batches: list[list[Worker]] = []
    remaining = list(workers)

    while remaining:
        batch = [remaining[0]]
        still_remaining = []

        for w in remaining[1:]:
            if not any(w.conflicts_with(b) for b in batch):
                batch.append(w)
            else:
                still_remaining.append(w)

        batches.append(batch)
        remaining = still_remaining

    return batches


# ── apply_selection — lawful application of a SelectionDecision ───────────

@dataclass
class SelectionResult:
    """Outcome of apply_selection — the substituted graph and provenance."""
    graph_function: str
    substituted_graph: Graph
    containing_graph_id: str  # REQ-L-GTL2-IDENTITY-007: id of the graph being replaced
    inner_vectors: list[str]
    events: list[dict]


def apply_selection(
    module: Module,
    vector_id: str,
    decision: SelectionDecision,
    candidate: GraphFunction,
) -> SelectionResult:
    """
    Lawful application of a SelectionDecision.

    vector_id: the .id of the target vector (REQ-L-GTL2-IDENTITY-006).

    REQ-R-ABG2-SELECTION-APPLICATION-002: accept external selection, apply it.
    REQ-R-ABG2-SELECTION-APPLICATION-003: record provenance via workflow_selected.
    REQ-R-ABG2-SELECTION-APPLICATION-004: validate interface before application.

    Per GTL_2_MODULE_DESIGN §4.4: interpret owns event emission.
    selection.py is pure — it returns values. This function emits events.

    Returns SelectionResult with the substituted graph — the caller is
    responsible for persisting the new topology (e.g., rebuilding Jobs
    from the updated Module via module_to_jobs).

    Raises ValueError if the selection fails validation or the candidate
    template is not materializable.
    """
    # Find the vector and its containing graph — by id (REQ-L-GTL2-IDENTITY-006)
    target_vec = None
    containing_graph = None
    for graph in module.graphs:
        for vec in graph.vectors:
            if vec.id == vector_id:
                target_vec = vec
                containing_graph = graph
                break
        if target_vec is not None:
            break

    if target_vec is None or containing_graph is None:
        raise ValueError(
            f"apply_selection: vector id {vector_id!r} not found in module {module.name!r}"
        )

    # REQ-R-ABG2-SELECTION-APPLICATION-004: validate before application
    if not validate_selection(decision, candidate, target_vec):
        raise ValueError(
            f"apply_selection: selection {decision.graph_function!r} does not "
            f"satisfy contract for vector id {vector_id!r}"
        )

    # Materialize the candidate's inner graph
    if not callable(candidate.template):
        raise ValueError(
            f"apply_selection: candidate {candidate.name!r} template is not callable"
        )
    inner_graph = candidate.template()

    # Apply substitute() by vector id (REQ-L-GTL2-IDENTITY-006)
    substituted = substitute(containing_graph, target_vec.id, inner_graph)

    # REQ-R-ABG2-SELECTION-APPLICATION-003: provenance event
    inner_vector_names = [v.name for v in inner_graph.vectors]
    events = [{
        "event_type": "workflow_selected",
        "data": {
            "edge": target_vec.name,
            "graph_function": decision.graph_function,
            "selected_by": decision.selected_by,
            "selection_mode": decision.selection_mode,
            "rationale": decision.rationale,
            "work_key": decision.work_key,
            "inner_vectors": inner_vector_names,
        },
    }]

    return SelectionResult(
        graph_function=decision.graph_function,
        substituted_graph=substituted,
        containing_graph_id=containing_graph.id,
        inner_vectors=inner_vector_names,
        events=events,
    )
