# Implements: REQ-R-ABG3-INTERPRET
# Implements: REQ-R-ABG3-CONVERGENCE
# Implements: REQ-R-ABG3-SELECTION-APPLICATION
"""
interpret — Graph interpretation loop.

iterate, schedule, apply_selection.

apply_selection owns lawful application of a SelectionDecision:
validate interface, open an invocation frame, emit workflow_selected.
Traversal orchestrates evaluation and requests event emission through
genesis.events.emit(); selection and subwork remain pure kernel modules.
"""
from __future__ import annotations

import uuid
import json
from collections.abc import Mapping
from dataclasses import dataclass, field, replace
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Optional

from gtl.operator_model import Evaluator, Rule, F_D, F_H, F_P
from gtl.graph import Attrs, GraphVector
from gtl.function_model import GraphFunction, RefinementBoundary, CandidateFamily
from gtl.module_model import Module
from gtl.work_model import Job

from .binding import (
    AssetBindingQueryContract,
    BoundJob,
    ExecutableJob,
    Worker,
    WorkSurface,
    PrecomputedManifest,
    ContextResolver,
    bind_fd,
    bind_fp,
    admit_asset_binding_query_contract,
    resolve_workspace_asset_bindings,
)
from .convergence import (
    convergence_from_precomputed,
    outcomes_from_precomputed,
    precomputed_unresolved_fraction,
)
from .correction import find_latest_reset
from .events import EventContext, EventStream, emit
from .fulfillment_ledger import resolve_published_fulfillment_ledger
from .frames import (
    FoldBackOutcome,
    InvocationFrame,
    ParentRebindResult,
    RecursiveInterpreterState,
    active_frames,
    build_frame_traversal_surface_from_graph_function,
    current_recursive_state,
    frame_closed_event,
    foldback_opened_event,
    frame_opened_event,
    frame_rebound_event,
    frame_resumed_event,
    frame_state_updated_event,
    frame_suspended_event,
    frame_spawn_events,
    frame_step_completed_event,
    frame_step_started_event,
    open_invocation_frame,
    recursive_state_for_frame,
    resolve_frame_candidate_family,
    resolve_frame_refinement_boundary,
    validate_frame_selection_surface,
    validate_frame_traversal_surface,
)
from .identity import RuntimeIdentity
from .materialization import MaterializationRequest, derive_bundle, materialize_graph_function
from .policy import (
    ResolvedPolicy,
    admit_resolved_policy,
    materialize_policy_concern,
    resolve_policy_bundle,
)
from .proof_hold import project_proof_holds
from .provenance import spec_hash_for
from .runtime_carrier import (
    AdvancementTransition,
    DispatchBindingRequest,
    ExecutionBasis,
    FhEscalationTransition,
    FpDispatchPublicationPlan,
    FpDispatchRequiredTransition,
    TerminalTransition,
    IterationAdvanceDecision,
    IterationDispatchPlan,
    advance_transition_for_precomputed,
    attach_runtime_carrier_metadata,
    blocking_reason_for_transition,
    dispatch_transition_for_requirement,
    execution_basis_for_runtime,
    fp_dispatch_publication_plan,
    fp_dispatch_transition,
    iteration_advance_decision,
    iteration_advance_decision_with_basis,
    iteration_dispatch_plan,
    iteration_outcome_plan,
    iterated_result_payload,
    outcome_transition_for_iteration,
    regime_failures,
    transition_blocks_progress,
)
from .selection import (
    SelectionDecision,
    accept_selection,
    resolve_candidate_family,
    resolve_refinement_boundary,
    validate_selection,
)
from .subwork import LeafTask, dispatch_leaf


# ── Traversal ────────────────────────────────────────────────────────────────


def _edge_uses_fulfillment_carrier(job: ExecutableJob) -> bool:
    """F_P-managed edges converge only through the fulfillment carrier path."""
    return any(ev.regime is F_P for ev in job.evaluators)


def _leaf_dispatch_prompt_authority(
    callback: Callable[[LeafTask, dict], tuple[dict | None, str | None]] | None,
) -> str:
    if callback is None:
        return "none"
    if callback is dispatch_leaf:
        return "governed_prompt_assembly_carrier"
    return "caller_supplied_effect_boundary_no_abg_prompt_authority"


def _project_fulfillment_edge_converged(
    stream: EventStream,
    *,
    job: ExecutableJob,
    workflow_version: str,
    spec_hash: str,
    work_key: str | None,
    certified_keys: set[tuple[str, str | None]],
) -> bool:
    cert_key = (job.vector.name, work_key)
    if cert_key in certified_keys:
        return False
    ledger = resolve_published_fulfillment_ledger(
        stream.all_events(),
        edge=job.vector.name,
        work_key=work_key,
        spec_hash=spec_hash,
        current_workflow_version=workflow_version,
        workspace=stream.path.parent.parent.parent,
    )
    if ledger is None or not bool(ledger.get("edge_converged")):
        return False
    _emit_event(
        stream,
        "edge_converged",
        {
            "edge": job.vector.name,
            "vector_id": job.vector.id,
            "target": job.vector.target.name,
            "work_key": work_key,
            "delta": 0,
            "certified_by": "published_fulfillment_ledger",
            "spec_hash": spec_hash,
            "workflow_version": workflow_version,
        },
        context=EventContext(
            workflow_version=workflow_version,
            work_key=work_key,
        ),
    )
    certified_keys.add(cert_key)
    return True


@dataclass(frozen=True)
class Traversal:
    """First-class ABG runtime traversal contract.

    Names one runtime traversal attempt over one GTL contract boundary.
    Traversal.metadata is input-side runtime metadata only — no hidden strategy.
    """
    work_key: str
    target: GraphFunction | CandidateFamily | RefinementBoundary | GraphVector
    evaluators: tuple[Evaluator, ...] = ()
    rule: Rule | None = None
    selection: SelectionDecision | None = None
    metadata: Attrs = field(default_factory=Attrs)

    def __post_init__(self) -> None:
        object.__setattr__(self, "metadata", Attrs.coerce(self.metadata))
        if not self.work_key:
            raise ValueError("Traversal.work_key must be non-empty")
        forbidden = {
            "strategy",
            "candidate_choice",
            "selected_candidate",
            "selection_strategy",
            "refinement_strategy",
        }
        hidden = forbidden & set(self.metadata.keys())
        if hidden:
            raise ValueError(
                f"Traversal.metadata must not carry hidden strategy keys: {sorted(hidden)}"
            )
        if self.selection is not None and not isinstance(self.target, CandidateFamily):
            raise ValueError(
                "Traversal.selection is only valid when target is a CandidateFamily"
            )
        if isinstance(self.target, CandidateFamily) and self.selection is None:
            raise ValueError(
                "Traversal over CandidateFamily requires an explicit SelectionDecision"
            )


@dataclass
class TraversalRuntime:
    """Explicit runtime execution context for a traversal attempt.

    This is an ABG helper shape: services discover the next work item,
    interpret owns the deterministic protocol once that work item is named.
    """
    module: Module
    executable_job: ExecutableJob
    precomputed: PrecomputedManifest
    workspace_root: Path
    stream: EventStream
    worker: Worker
    spec_hash: str
    runtime_identity: RuntimeIdentity | None = None
    build: str | None = None
    work_key: str | None = None
    workflow_version: str = "unknown"
    leaf_tasks: tuple[LeafTask, ...] = ()
    on_leaf_dispatch: Optional[Callable[[LeafTask, dict], tuple[dict | None, str | None]]] = None
    leaf_task_inputs: dict[str, dict] = field(default_factory=dict)
    run_id: Optional[str] = None
    call_id: Optional[str] = None
    runtime_config: dict = field(default_factory=dict)
    asset_binding_contract: AssetBindingQueryContract | None = None
    resolved_policy: ResolvedPolicy | Mapping[str, Any] | None = None

    def __post_init__(self) -> None:
        if not self.workflow_version or self.workflow_version == "unknown":
            from .provenance import _read_workflow_version

            self.workflow_version = _read_workflow_version(self.workspace_root)
        if self.runtime_identity is None:
            self.runtime_identity = RuntimeIdentity(build_id=self.build)
        else:
            self.runtime_identity = self.runtime_identity.with_report_build_id(self.build)
        self.runtime_identity = self.runtime_identity.bind_worker(self.worker)
        self.build = self.runtime_identity.report_build_id()
        if isinstance(self.resolved_policy, Mapping) and self.resolved_policy:
            self.resolved_policy = admit_resolved_policy(self.resolved_policy)
        if not isinstance(self.resolved_policy, ResolvedPolicy):
            raise ValueError("TraversalRuntime requires admitted resolved_policy carrier truth")


def admit_traversal_runtime(
    *,
    module: Module,
    executable_job: ExecutableJob,
    precomputed: PrecomputedManifest,
    workspace_root: Path,
    stream: EventStream,
    worker: Worker,
    spec_hash: str,
    runtime_identity: RuntimeIdentity | None = None,
    build: str | None = None,
    work_key: str | None = None,
    workflow_version: str = "unknown",
    leaf_tasks: tuple[LeafTask, ...] = (),
    on_leaf_dispatch: Optional[Callable[[LeafTask, dict], tuple[dict | None, str | None]]] = None,
    leaf_task_inputs: dict[str, dict] | None = None,
    run_id: str | None = None,
    call_id: str | None = None,
    runtime_config: dict[str, Any] | None = None,
    asset_binding_contract: AssetBindingQueryContract | None = None,
    resolved_policy: Mapping[str, Any] | None = None,
    candidate_family: CandidateFamily | None = None,
) -> TraversalRuntime:
    admitted_policy = admit_resolved_policy(
        resolved_policy
        if resolved_policy is not None
        else resolve_policy_bundle(
            vector=executable_job.vector,
            graph_function=executable_job.graph_function,
            roles=executable_job.job.roles,
            candidate_family=candidate_family,
            runtime_config=dict(runtime_config or {}),
        )
    )
    return TraversalRuntime(
        module=module,
        executable_job=executable_job,
        precomputed=precomputed,
        workspace_root=workspace_root,
        stream=stream,
        worker=worker,
        spec_hash=spec_hash,
        runtime_identity=runtime_identity,
        build=build,
        work_key=work_key,
        workflow_version=workflow_version,
        leaf_tasks=leaf_tasks,
        on_leaf_dispatch=on_leaf_dispatch,
        leaf_task_inputs=dict(leaf_task_inputs or {}),
        run_id=run_id,
        call_id=call_id,
        runtime_config=dict(runtime_config or {}),
        asset_binding_contract=(
            asset_binding_contract
            if asset_binding_contract is not None
            else admit_asset_binding_query_contract(
                dict(runtime_config or {}),
                workspace_root=workspace_root,
            )
        ),
        resolved_policy=admitted_policy,
    )


@dataclass(frozen=True)
class PublicRuntimeOpenPlan:
    run_id: str
    call_id: str
    active_frame: tuple[InvocationFrame, object] | None
    events: tuple[tuple[str, dict, EventContext], ...] = ()


@dataclass(frozen=True)
class TraversalOutcome:
    """Structured result of one traversal attempt."""
    surface: WorkSurface
    result: dict
    basis: ExecutionBasis | None = None
    transition: AdvancementTransition | None = None


@dataclass(frozen=True)
class IterationStartPlan:
    vector_started_data: dict[str, Any]
    frame_step_started_data: dict[str, Any] | None = None
    recursive_state: RecursiveInterpreterState | None = None
    prior_recursive_state: RecursiveInterpreterState | None = None
    frame_suspended_data: dict[str, Any] | None = None


@dataclass(frozen=True)
class IterationCompletionPlan:
    proof_passed_data: dict[str, Any] | None = None
    closure_passed_data: dict[str, Any] | None = None
    graph_call_closed_data: dict[str, Any] | None = None
    emit_run_completed: bool = False


@dataclass(frozen=True)
class IterationExecutionPlan:
    open_plan: PublicRuntimeOpenPlan
    basis: ExecutionBasis
    decision: IterationAdvanceDecision
    event_context: EventContext
    dispatch_plan: IterationDispatchPlan
    bound_job: BoundJob
    publication_plan: FpDispatchPublicationPlan | None
    iteration_start_plan: IterationStartPlan
    completion_plan: IterationCompletionPlan
    blocking_reason: str | None


@dataclass(frozen=True)
class PendingDispatchReplayPlan:
    result: dict[str, Any]
    metadata: dict[str, Any]
    transition: FpDispatchTransition
    recursive_state: RecursiveInterpreterState | None = None
    prior_recursive_state: RecursiveInterpreterState | None = None


def _iteration_start_event_count(plan: IterationStartPlan) -> int:
    count = 1
    if plan.frame_step_started_data is not None:
        count += 1
    if plan.recursive_state is not None and plan.prior_recursive_state != plan.recursive_state:
        count += 1
    if plan.frame_suspended_data is not None:
        count += 1
    return count


def _iteration_completion_event_count(plan: IterationCompletionPlan) -> int:
    if plan.proof_passed_data is None or plan.closure_passed_data is None or not plan.emit_run_completed:
        return 0
    count = 3
    if plan.graph_call_closed_data is None:
        count -= 1
    return count


@dataclass(frozen=True)
class TraversalPlan:
    traversal: Traversal | None = None
    runtime: TraversalRuntime | None = None
    result: dict = field(default_factory=dict)


def _attach_execution_binding_provenance(
    data: dict,
    *,
    runtime_identity: RuntimeIdentity,
    worker: Worker,
) -> None:
    """Preserve selected execution identity without overwriting router truth."""
    if runtime_identity.worker_id and runtime_identity.worker_id != worker.id:
        data["selected_worker_id"] = runtime_identity.worker_id
    if runtime_identity.backend_id:
        data.setdefault("backend_id", runtime_identity.backend_id)
        data["selected_backend"] = runtime_identity.backend_id
    if runtime_identity.assignment_source:
        data["assignment_source"] = runtime_identity.assignment_source
    if runtime_identity.resolved_runtime_ref:
        data["resolved_runtime_ref"] = runtime_identity.resolved_runtime_ref


@dataclass(frozen=True)
class OperativeScope:
    jobs: tuple[ExecutableJob, ...]
    work_keys: tuple[str | None, ...]
    open_frames: tuple[InvocationFrame, ...]
    all_events: tuple[dict, ...]
    refined_parents: frozenset[str]


@dataclass(frozen=True)
class PlannedTraversalCandidate:
    executable_job: ExecutableJob
    precomputed: PrecomputedManifest
    spec_hash: str
    work_key: str | None


@dataclass
class RecursiveExecutionIndex:
    processed_events: int = 0
    certified_keys: set[tuple[str, str | None]] = field(default_factory=set)
    completed_steps: set[tuple[str | None, str | None]] = field(default_factory=set)
    closed_frames: set[str | None] = field(default_factory=set)
    rebound_frames: set[str | None] = field(default_factory=set)


@dataclass
class RecursiveMachineControl:
    processed_events: int = 0
    frame_order: list[str] = field(default_factory=list)
    current_frame_id: str | None = None


@dataclass(frozen=True)
class MachineAdvanceResult:
    progressed: bool
    yielded: bool


def _worker_can_execute(worker: Worker, job: ExecutableJob) -> bool:
    if job in worker.can_execute:
        return worker.is_eligible(job)
    if job.job.roles:
        required_role_ids = {role.id for role in job.job.roles}
        return required_role_ids.issubset(set(worker.role_ids))
    return True


def _work_key_matches_job(work_key: str | None, job: ExecutableJob) -> bool:
    if work_key is None:
        return True
    segment = work_key.rsplit("/", 1)[-1]
    if "→" in segment or "↔" in segment:
        return segment == job.vector.name
    return True


def _operative_scope(
    *,
    stream: EventStream,
    jobs: tuple[ExecutableJob, ...] | list[ExecutableJob],
    work_keys: tuple[str, ...] | list[str],
    edge_filter: str | None = None,
) -> OperativeScope:
    base_jobs = tuple(jobs)
    all_events_snapshot = tuple(stream.all_events())
    frame_steps = _operative_frame_steps(stream, edge_filter=edge_filter)
    frame_jobs = tuple(step.executable_job for step in frame_steps)
    operative_jobs = base_jobs + tuple(job for job in frame_jobs if job not in base_jobs)

    provided_work_keys = tuple(work_keys) if work_keys else ()
    derived_child_keys = tuple(step.child_key for step in frame_steps)
    operative_work_keys = provided_work_keys + tuple(
        child_key for child_key in derived_child_keys if child_key not in provided_work_keys
    )
    if not operative_work_keys:
        operative_work_keys = (None,)

    open_frames = tuple(active_frames(stream))
    return OperativeScope(
        jobs=operative_jobs,
        work_keys=operative_work_keys,
        open_frames=open_frames,
        all_events=all_events_snapshot,
        refined_parents=frozenset(frame.parent_key for frame in open_frames),
    )


def _operative_frame_steps(
    stream: EventStream,
    *,
    edge_filter: str | None = None,
) -> tuple:
    steps = []
    for frame_id in _ordered_machine_frame_ids(stream):
        state = current_recursive_state(stream, frame_id)
        frame = state.stack[-1] if state is not None and state.stack else None
        if frame is None:
            continue
        pending = set(state.frontier.pending_child_keys)
        if not pending:
            pending = {step.child_key for step in frame.steps}
        for step in frame.steps:
            if step.child_key not in pending:
                continue
            if edge_filter and step.edge != edge_filter:
                continue
            steps.append(step)
    return tuple(steps)


def _rebuild_execution_index(events: list[dict]) -> RecursiveExecutionIndex:
    index = RecursiveExecutionIndex()
    index.certified_keys = _current_certified_keys(events)
    index.completed_steps = {
        (
            event.get("data", {}).get("frame_attempt_id") or event.get("data", {}).get("frame_id"),
            event.get("data", {}).get("child_key"),
        )
        for event in events
        if event.get("event_type") == "frame_step_completed"
    }
    index.closed_frames = {
        event.get("data", {}).get("frame_id")
        for event in events
        if event.get("event_type") == "frame_closed"
    }
    index.rebound_frames = {
        event.get("data", {}).get("frame_id")
        for event in events
        if event.get("event_type") == "frame_rebound"
    }
    index.processed_events = len(events)
    return index


def _execution_index(stream: EventStream) -> RecursiveExecutionIndex:
    index = getattr(stream, "_recursive_execution_index", None)
    events = stream.all_events()
    if index is None or index.processed_events > len(events):
        index = _rebuild_execution_index(events)
        setattr(stream, "_recursive_execution_index", index)
        return index

    for event in events[index.processed_events:]:
        event_type = event.get("event_type")
        data = event.get("data", {})
        if event_type == "reset":
            index = _rebuild_execution_index(events)
            setattr(stream, "_recursive_execution_index", index)
            return index
        if event_type == "edge_converged" and data.get("target"):
            index.certified_keys.add((data.get("edge", ""), data.get("work_key")))
        elif event_type == "edge_reopened":
            index.certified_keys.discard((data.get("edge", ""), data.get("work_key")))
        elif event_type == "frame_step_completed":
            index.completed_steps.add(
                (
                    data.get("frame_attempt_id") or data.get("frame_id"),
                    data.get("child_key"),
                )
            )
        elif event_type == "frame_closed":
            index.closed_frames.add(data.get("frame_id"))
        elif event_type == "frame_rebound":
            index.rebound_frames.add(data.get("frame_id"))
    index.processed_events = len(events)
    return index


def _machine_control_add_frame(control: RecursiveMachineControl, frame_id: str | None) -> None:
    if not frame_id:
        return
    if frame_id not in control.frame_order:
        control.frame_order.append(frame_id)


def _machine_control_remove_frame(control: RecursiveMachineControl, frame_id: str | None) -> None:
    if not frame_id or frame_id not in control.frame_order:
        return
    index = control.frame_order.index(frame_id)
    control.frame_order.pop(index)
    if control.current_frame_id != frame_id:
        return
    if not control.frame_order:
        control.current_frame_id = None
        return
    control.current_frame_id = control.frame_order[index % len(control.frame_order)]


def _normalize_machine_control(
    control: RecursiveMachineControl,
    stream: EventStream,
) -> RecursiveMachineControl:
    active_ids = {frame.frame_id for frame in active_frames(stream)}
    control.frame_order = [
        frame_id
        for frame_id in control.frame_order
        if frame_id in active_ids
    ]
    if control.current_frame_id not in active_ids:
        control.current_frame_id = control.frame_order[0] if control.frame_order else None
    return control


def _apply_machine_control_event(
    control: RecursiveMachineControl,
    event: dict,
) -> None:
    event_type = event.get("event_type")
    data = event.get("data", {})
    if event_type == "frame_opened":
        frame_id = data.get("frame_id")
        _machine_control_add_frame(control, frame_id)
        if frame_id is not None:
            control.current_frame_id = frame_id
        return
    if event_type == "frame_state_updated":
        frame_id = data.get("current_frame_id") or data.get("root_frame_id")
        phase = data.get("continuation", {}).get("phase", "opened")
        _machine_control_add_frame(control, frame_id)
        if phase != "closed" and frame_id is not None:
            control.current_frame_id = frame_id
        return
    if event_type == "frame_closed":
        _machine_control_remove_frame(control, data.get("frame_id"))


def _rebuild_machine_control(stream: EventStream) -> RecursiveMachineControl:
    events = stream.all_events()
    control = RecursiveMachineControl()
    for event in events:
        if event.get("event_type") == "reset":
            control = RecursiveMachineControl()
            continue
        _apply_machine_control_event(control, event)
    control.processed_events = len(events)
    return _normalize_machine_control(control, stream)


def _machine_control(stream: EventStream) -> RecursiveMachineControl:
    control = getattr(stream, "_recursive_machine_control", None)
    events = stream.all_events()
    if control is None or control.processed_events > len(events):
        control = _rebuild_machine_control(stream)
        setattr(stream, "_recursive_machine_control", control)
        return control

    for event in events[control.processed_events:]:
        if event.get("event_type") == "reset":
            control = _rebuild_machine_control(stream)
            setattr(stream, "_recursive_machine_control", control)
            return control
        _apply_machine_control_event(control, event)
    control.processed_events = len(events)
    return _normalize_machine_control(control, stream)


def _ordered_machine_frame_ids(stream: EventStream) -> tuple[str, ...]:
    control = _machine_control(stream)
    if not control.frame_order:
        return ()
    if control.current_frame_id is None:
        control.current_frame_id = control.frame_order[0]
    start = control.frame_order.index(control.current_frame_id)
    return tuple(control.frame_order[start:] + control.frame_order[:start])


def _advance_machine_cursor(
    stream: EventStream,
    *,
    exhausted_frame_id: str | None = None,
) -> str | None:
    control = _machine_control(stream)
    if not control.frame_order:
        control.current_frame_id = None
        return None
    current = exhausted_frame_id or control.current_frame_id
    if current not in control.frame_order:
        control.current_frame_id = control.frame_order[0]
        return control.current_frame_id
    if len(control.frame_order) == 1:
        control.current_frame_id = control.frame_order[0]
        return control.current_frame_id
    index = control.frame_order.index(current)
    control.current_frame_id = control.frame_order[(index + 1) % len(control.frame_order)]
    return control.current_frame_id


def _ordered_pending_child_keys(
    frame: InvocationFrame,
    state,
) -> tuple[str, ...]:
    ordered = tuple(step.child_key for step in frame.steps)
    pending = state.frontier.pending_child_keys or ordered
    pending_set = set(pending)
    if not pending_set:
        return ()

    active_child_key = state.continuation.active_child_key
    if active_child_key in pending_set:
        return (active_child_key,) + tuple(
            child_key for child_key in ordered
            if child_key in pending_set and child_key != active_child_key
        )

    start_index = min(state.continuation.next_step_index, len(ordered))
    rotated = ordered[start_index:] + ordered[:start_index]
    ordered_pending = tuple(
        child_key for child_key in rotated
        if child_key in pending_set
    )
    if ordered_pending:
        return ordered_pending
    return tuple(child_key for child_key in ordered if child_key in pending_set)


def _plan_recursive_frontier_candidate(
    *,
    module: Module,
    operative: OperativeScope,
    stream: EventStream,
    workspace_root: Path,
    worker: Worker,
    workflow_version: str,
    requirements: tuple | list,
    carry_forward: list[dict],
    edge_filter: str | None = None,
) -> PlannedTraversalCandidate | None:
    resolver = ContextResolver(workspace_root)
    operative_keys = set(operative.work_keys)

    for frame_id in _ordered_machine_frame_ids(stream):
        state = current_recursive_state(stream, frame_id)
        frame = state.stack[-1] if state is not None and state.stack else None
        if frame is None:
            continue
        step_by_child_key = {step.child_key: step for step in frame.steps}
        for child_key in _ordered_pending_child_keys(frame, state):
            if operative_keys and child_key not in operative_keys:
                continue
            step = step_by_child_key.get(child_key)
            if step is None:
                continue
            if edge_filter and step.edge != edge_filter:
                continue
            if not _worker_can_execute(worker, step.executable_job):
                continue
            spec_hash = spec_hash_for(
                workflow_version=workflow_version,
                executable_job=step.executable_job,
                requirements=requirements,
            )
            pre = bind_fd(
                step.executable_job,
                stream,
                resolver,
                workspace_root,
                spec_hash=spec_hash,
                current_workflow_version=workflow_version,
                carry_forward=carry_forward,
                module=module,
                work_key=child_key,
            )
            if not pre.resolved_environment.ready:
                continue
            conv = convergence_from_precomputed(step.executable_job.vector.id, pre)
            if conv.aggregate_state == "closed":
                continue
            return PlannedTraversalCandidate(
                executable_job=step.executable_job,
                precomputed=pre,
                spec_hash=spec_hash,
                work_key=child_key,
            )
    return None


def _find_visible_frame_step(
    stream: EventStream,
    work_key: str | None,
) -> tuple[InvocationFrame, object] | None:
    if work_key is None:
        return None
    for frame_id in _ordered_machine_frame_ids(stream):
        state = current_recursive_state(stream, frame_id)
        frame = state.stack[-1] if state is not None and state.stack else None
        if frame is None:
            continue
        visible = set(state.frontier.pending_child_keys) | set(state.frontier.blocked_on)
        if state.continuation.active_child_key is not None:
            visible.add(state.continuation.active_child_key)
        if not visible:
            visible = {step.child_key for step in frame.steps}
        for step in frame.steps:
            if step.child_key == work_key and step.child_key in visible:
                return frame, step
    return None


def plan_next_traversal(
    *,
    module: Module,
    workspace_root: Path,
    stream: EventStream,
    worker: Worker,
    jobs: tuple[ExecutableJob, ...] | list[ExecutableJob],
    work_keys: tuple[str, ...] | list[str],
    requirements: tuple | list = (),
    workflow_version: str = "unknown",
    runtime_identity: RuntimeIdentity | None = None,
    build: str | None = None,
    edge_filter: str | None = None,
    run_id: Optional[str] = None,
    runtime_config: dict | None = None,
    asset_binding_contract: AssetBindingQueryContract | None = None,
    carry_forward: list[dict] | None = None,
) -> TraversalPlan:
    """Interpreter-owned next traversal planning.

    Progresses recursive state, then resolves the next lawful traversal target
    from current module + frame-local publication truth.
    """
    advance_recursive_machine(
        module=module,
        workspace_root=workspace_root,
        stream=stream,
        workflow_version=workflow_version,
        requirements=requirements,
        carry_forward=carry_forward or [],
    )

    operative = _operative_scope(
        stream=stream,
        jobs=jobs,
        work_keys=work_keys,
        edge_filter=edge_filter,
    )
    if not operative.jobs:
        return TraversalPlan(result={"status": "nothing_to_do", "reason": "no jobs in scope"})

    resolver = ContextResolver(workspace_root)
    recursive_candidate = _plan_recursive_frontier_candidate(
        module=module,
        operative=operative,
        stream=stream,
        workspace_root=workspace_root,
        worker=worker,
        workflow_version=workflow_version,
        requirements=requirements,
        carry_forward=carry_forward or [],
        edge_filter=edge_filter,
    )

    selected_job: ExecutableJob | None = None
    selected_pre: PrecomputedManifest | None = None
    selected_spec_hash = ""
    selected_work_key: str | None = None
    blocked_environment: list[dict[str, object]] = []

    if recursive_candidate is not None:
        selected_job = recursive_candidate.executable_job
        selected_pre = recursive_candidate.precomputed
        selected_spec_hash = recursive_candidate.spec_hash
        selected_work_key = recursive_candidate.work_key

    if selected_job is None:
        for job in operative.jobs:
            if not _worker_can_execute(worker, job):
                continue
            spec_hash = spec_hash_for(
                workflow_version=workflow_version,
                executable_job=job,
                requirements=requirements,
            )
            for work_key in operative.work_keys:
                if not _work_key_matches_job(work_key, job):
                    continue
                if work_key is not None and work_key in operative.refined_parents:
                    continue
                pre = bind_fd(
                    job,
                    stream,
                    resolver,
                    workspace_root,
                    spec_hash=spec_hash,
                    current_workflow_version=workflow_version,
                    carry_forward=carry_forward or [],
                    module=module,
                    work_key=work_key,
                )
                if not pre.resolved_environment.ready:
                    blocked_environment.append(
                        {
                            "edge": job.vector.name,
                            "work_key": work_key,
                            "missing_required": list(pre.resolved_environment.missing_required),
                            "conflicting_contracts": list(pre.resolved_environment.conflicting_contracts),
                        }
                    )
                    continue
                conv = convergence_from_precomputed(job.vector.id, pre)
                if conv.aggregate_state != "closed":
                    selected_job = job
                    selected_pre = pre
                    selected_spec_hash = spec_hash
                    selected_work_key = work_key
                    break
            if selected_job is not None:
                break

    if selected_job is None or selected_pre is None:
        if blocked_environment:
            return TraversalPlan(
                result={
                    "status": "blocked",
                    "reason": "required carried environment is unresolved",
                    "blocked": blocked_environment,
                }
            )
        if operative.open_frames:
            return TraversalPlan(
                result={
                    "status": "in_progress",
                    "reason": "recursive frames are active but no executable child frontier is pending",
                    "open_frames": len(operative.open_frames),
                }
            )
        return TraversalPlan(
            result={"status": "converged", "reason": "all jobs in scope have delta = 0"}
        )

    active_frame = _find_visible_frame_step(stream, selected_work_key)
    family = None
    boundary = None
    traversal_target = None
    if active_frame is not None:
        frame, _ = active_frame
        surface = frame.traversal_surface
        if surface is not None:
            validate_frame_traversal_surface(
                surface,
                vector_id=selected_job.vector.id,
            )
            family = resolve_frame_candidate_family(surface, selected_job.vector.id)
            boundary = resolve_frame_refinement_boundary(surface, selected_job.vector.id)
    else:
        family = resolve_candidate_family(
            module,
            selected_job.vector.id,
            vector=selected_job.vector,
        )
        boundary = resolve_refinement_boundary(
            module,
            selected_job.vector.id,
            vector=selected_job.vector,
        )
        if family is None and boundary is None:
            raise ValueError(
                "plan_next_traversal(): no published traversal target for "
                f"vector {selected_job.vector.name!r}"
            )
    if family is not None and boundary is None:
        if not selection_is_active(
            list(operative.all_events),
            edge=selected_job.vector.name,
            work_key=selected_work_key,
        ):
            raise ValueError(
                "plan_next_traversal(): CandidateFamily traversal requires an explicit "
                f"SelectionDecision for vector {selected_job.vector.name!r}"
            )
        traversal_target = selected_job.vector
    elif family is None and boundary is None and active_frame is not None:
        # Already-realized frame-local executable vectors are lawful operative targets.
        traversal_target = selected_job.vector
    elif traversal_target is None:
        traversal_target = boundary or family

    traversal = Traversal(
        work_key=selected_work_key or selected_job.vector.id,
        target=traversal_target,
        evaluators=selected_job.vector.evaluators,
    )
    resolved_policy = resolve_policy_bundle(
        vector=selected_job.vector,
        graph_function=selected_job.graph_function,
        roles=selected_job.job.roles,
        candidate_family=family,
        runtime_config=dict(runtime_config or {}),
    )
    runtime = admit_traversal_runtime(
        module=module,
        executable_job=selected_job,
        precomputed=selected_pre,
        workspace_root=workspace_root,
        stream=stream,
        worker=worker,
        spec_hash=selected_spec_hash,
        runtime_identity=runtime_identity,
        build=build,
        work_key=selected_work_key,
        workflow_version=workflow_version,
        run_id=run_id,
        runtime_config=dict(runtime_config or {}),
        asset_binding_contract=asset_binding_contract,
        resolved_policy=resolved_policy,
        candidate_family=family,
    )
    return TraversalPlan(traversal=traversal, runtime=runtime, result={"status": "planned"})


def derive_operational_gaps(
    *,
    module: Module,
    workspace_root: Path,
    stream: EventStream,
    worker: Worker,
    jobs: tuple[ExecutableJob, ...] | list[ExecutableJob],
    work_keys: tuple[str, ...] | list[str],
    requirements: tuple | list = (),
    workflow_version: str = "unknown",
    runtime_identity: RuntimeIdentity | None = None,
    runtime_config: dict | None = None,
    edge_override: str | None = None,
    scope_selector: Any | None = None,
    carry_forward: list[dict] | None = None,
) -> dict:
    operative = _operative_scope(
        stream=stream,
        jobs=jobs,
        work_keys=work_keys,
        edge_filter=edge_override,
    )
    if not operative.jobs:
        return {
            "status": "error",
            "reason": "no jobs in scope — check the requested scope or diagnostic edge override",
        }

    all_events = list(operative.all_events)
    certified_keys = _current_certified_keys(all_events)
    resolver = ContextResolver(workspace_root)
    results: list[dict] = []
    proof_hold_identities: list[dict[str, Any]] = []
    carry_forward = carry_forward or []

    for job in operative.jobs:
        spec_hash = spec_hash_for(
            workflow_version=workflow_version,
            executable_job=job,
            requirements=requirements,
        )
        for work_key in operative.work_keys:
            if not _work_key_matches_job(work_key, job):
                continue
            if work_key is not None and work_key in operative.refined_parents:
                continue
            pre = bind_fd(
                job,
                stream,
                resolver,
                workspace_root,
                spec_hash=spec_hash,
                current_workflow_version=workflow_version,
                carry_forward=carry_forward,
                module=module,
                work_key=work_key,
            )
            delta = precomputed_unresolved_fraction(job.vector.id, pre)
            entry: dict = {
                "edge": job.vector.name,
                "delta": delta,
                "failing": [ev.name for ev in pre.failing_evaluators],
                "passing": [ev.name for ev in pre.passing_evaluators],
                "delta_summary": pre.delta_summary,
                "environment_ready": pre.resolved_environment.ready,
            }
            if pre.resolved_environment.missing_required:
                entry["missing_required_bindings"] = list(pre.resolved_environment.missing_required)
            if pre.resolved_environment.conflicting_contracts:
                entry["conflicting_environment_contracts"] = list(
                    pre.resolved_environment.conflicting_contracts
                )
            if work_key is not None:
                entry["work_key"] = work_key
            results.append(entry)
            proof_hold_identities.append(
                {
                    "edge": job.vector.name,
                    "work_key": work_key,
                    "spec_hash": spec_hash,
                    "workflow_version": workflow_version,
                    "resolved_policy": resolve_policy_bundle(
                        vector=job.vector,
                        graph_function=job.graph_function,
                        roles=job.job.roles,
                        runtime_config=runtime_config,
                    ),
                }
            )

            scope_work_key = getattr(scope_selector, "work_key", None)
            cert_key = work_key if work_key is not None else scope_work_key
            if delta == 0.0 and (job.vector.name, cert_key) not in certified_keys:
                if _edge_uses_fulfillment_carrier(job):
                    _project_fulfillment_edge_converged(
                        stream,
                        job=job,
                        workflow_version=workflow_version,
                        spec_hash=spec_hash,
                        work_key=work_key or scope_work_key,
                        certified_keys=certified_keys,
                    )
                else:
                    _emit_event(
                        stream,
                        "edge_converged",
                        {
                            "edge": job.vector.name,
                            "vector_id": job.vector.id,
                            "target": job.vector.target.name,
                            "work_key": work_key or scope_work_key,
                            "delta": 0,
                            "certified_by": "gen_gaps",
                            "spec_hash": spec_hash,
                            "workflow_version": workflow_version,
                        },
                        context=EventContext(
                            workflow_version=workflow_version,
                            work_key=work_key,
                        ),
                    )
                    certified_keys.add((job.vector.name, cert_key))

    proof_holds = project_proof_holds(
        workspace_root,
        proof_hold_identities,
        all_events=all_events,
    )
    for entry, identity in zip(results, proof_hold_identities, strict=False):
        proof_hold = proof_holds.get(
            (
                identity["edge"],
                identity["work_key"],
                identity["spec_hash"],
                identity["workflow_version"],
            )
        )
        if proof_hold is None:
            continue
        entry["proof_hold"] = proof_hold
        entry["proof_hold_active"] = bool(proof_hold.get("held"))

    total_delta = sum(entry["delta"] for entry in results)
    selector_kind = getattr(scope_selector, "kind", "workspace")
    selector_work_key = getattr(scope_selector, "work_key", None)
    scope_info: dict = {
        "package": module.name,
        "selector": {
            "kind": selector_kind,
            "work_key": selector_work_key,
        },
        "build": runtime_identity.build_id if runtime_identity else None,
        "runtime_identity": runtime_identity.as_dict() if runtime_identity else {},
    }
    if edge_override is not None:
        scope_info["diagnostic_edge_override"] = edge_override
    if work_keys:
        scope_info["work_keys"] = list(work_keys)
    return {
        "scope": scope_info,
        "jobs_considered": len(results),
        "total_delta": total_delta,
        "open_frames": len(operative.open_frames),
        "converged": total_delta == 0 and not operative.open_frames,
        "gaps": results,
    }


def derive_operational_state(
    *,
    workspace_root: Path,
    stream: EventStream,
    module: Module,
    worker: Worker,
    jobs: tuple[ExecutableJob, ...] | list[ExecutableJob],
    work_keys: tuple[str, ...] | list[str],
    requirements: tuple | list = (),
    workflow_version: str = "unknown",
    edge_filter: str | None = None,
    carry_forward: list[dict] | None = None,
) -> dict:
    operative = _operative_scope(
        stream=stream,
        jobs=jobs,
        work_keys=work_keys,
        edge_filter=edge_filter,
    )
    if not operative.jobs:
        return {"status": "nothing_to_do", "reason": "no jobs in scope"}

    resolver = ContextResolver(workspace_root)
    total_delta = 0.0
    carry_forward = carry_forward or []

    for job in operative.jobs:
        if not _worker_can_execute(worker, job):
            continue
        spec_hash = spec_hash_for(
            workflow_version=workflow_version,
            executable_job=job,
            requirements=requirements,
        )
        for work_key in operative.work_keys:
            if not _work_key_matches_job(work_key, job):
                continue
            if work_key is not None and work_key in operative.refined_parents:
                continue
            pre = bind_fd(
                job,
                stream,
                resolver,
                workspace_root,
                spec_hash=spec_hash,
                current_workflow_version=workflow_version,
                carry_forward=carry_forward,
                module=module,
                work_key=work_key,
            )
            delta = precomputed_unresolved_fraction(job.vector.id, pre)
            total_delta += delta
            if delta > 0:
                return {
                    "status": "in_progress",
                    "delta": total_delta,
                    "open_frames": len(operative.open_frames),
                }

    if total_delta == 0 and not operative.open_frames:
        return {"status": "converged"}

    return {
        "status": "in_progress",
        "delta": total_delta,
        "open_frames": len(operative.open_frames),
    }


def _boundary_inputs(vector: GraphVector) -> tuple:
    return vector.source if isinstance(vector.source, tuple) else (vector.source,)


def _target_boundary(target: GraphFunction | CandidateFamily | RefinementBoundary | GraphVector) -> tuple[tuple, tuple]:
    if isinstance(target, GraphVector):
        return _boundary_inputs(target), (target.target,)
    return tuple(target.inputs), tuple(target.outputs)


def _active_frame_for_runtime(
    runtime: TraversalRuntime,
) -> tuple[InvocationFrame, object] | None:
    return _find_visible_frame_step(runtime.stream, runtime.work_key)


def _event_exists(
    stream: EventStream,
    event_type: str,
    *,
    run_id: str | None = None,
    call_id: str | None = None,
) -> bool:
    for event in stream.all_events():
        if event.get("event_type") != event_type:
            continue
        if run_id is not None and event.get("run_id") != run_id and event.get("data", {}).get("run_id") != run_id:
            continue
        if call_id is not None and event.get("aggregate_id") != call_id and event.get("data", {}).get("call_id") != call_id:
            continue
        return True
    return False


def _run_bound_data(runtime: TraversalRuntime, *, run_id: str) -> dict:
    vector = runtime.executable_job.vector
    data: dict = {
        "edge": vector.name,
        "vector_id": vector.id,
        "run_id": run_id,
        "job_id": runtime.executable_job.job.id,
        "worker_id": runtime.worker.id,
    }
    if runtime.executable_job.job.roles:
        data["role_id"] = runtime.executable_job.job.roles[0].id
    if runtime.worker.authority_ref:
        data["authority_ref"] = runtime.worker.authority_ref
    if runtime.work_key is not None:
        data["work_key"] = runtime.work_key
    _attach_execution_binding_provenance(
        data,
        runtime_identity=runtime.runtime_identity,
        worker=runtime.worker,
    )
    return data


def _run_started_data(runtime: TraversalRuntime, *, run_id: str) -> dict:
    vector = runtime.executable_job.vector
    data: dict = {
        "edge": vector.name,
        "vector_id": vector.id,
        "run_id": run_id,
        "job_id": runtime.executable_job.job.id,
        "worker_id": runtime.worker.id,
    }
    if runtime.work_key is not None:
        data["work_key"] = runtime.work_key
    if runtime.executable_job.job.roles:
        data["role_id"] = runtime.executable_job.job.roles[0].id
    if runtime.worker.authority_ref:
        data["authority_ref"] = runtime.worker.authority_ref
    _attach_execution_binding_provenance(
        data,
        runtime_identity=runtime.runtime_identity,
        worker=runtime.worker,
    )
    return data


def _graph_call_opened_data(runtime: TraversalRuntime, *, call_id: str) -> dict:
    data: dict = {
        "call_id": call_id,
        "edge": runtime.executable_job.vector.name,
        "job_id": runtime.executable_job.job.id,
    }
    if runtime.executable_job.graph_function is not None:
        data["graph_function"] = runtime.executable_job.graph_function.name
        data["graph_function_id"] = runtime.executable_job.graph_function.id
    if runtime.executable_job.materialization_id:
        data["materialization_id"] = runtime.executable_job.materialization_id
    if runtime.work_key is not None:
        data["work_key"] = runtime.work_key
    return data


def _vector_started_data(runtime: TraversalRuntime) -> dict[str, Any]:
    vector = runtime.executable_job.vector
    data: dict[str, Any] = {
        "edge": vector.name,
        "vector_id": vector.id,
        "worker_id": runtime.worker.id,
        "target": vector.target.name,
    }
    if runtime.runtime_identity.build_id:
        data["build"] = runtime.runtime_identity.build_id
    if runtime.runtime_identity.backend_id:
        data["backend_id"] = runtime.runtime_identity.backend_id
    if runtime.work_key is not None:
        data["work_key"] = runtime.work_key
    if runtime.executable_job.job.roles:
        data["role_id"] = runtime.executable_job.job.roles[0].id
    if runtime.worker.authority_ref:
        data["authority_ref"] = runtime.worker.authority_ref
    _attach_execution_binding_provenance(
        data,
        runtime_identity=runtime.runtime_identity,
        worker=runtime.worker,
    )
    return data


def _plan_public_runtime_open(
    runtime: TraversalRuntime,
    *,
    active_frame: tuple[InvocationFrame, object] | None = None,
) -> PublicRuntimeOpenPlan:
    if active_frame is None:
        active_frame = _active_frame_for_runtime(runtime)
    run_id = runtime.run_id or str(uuid.uuid4())
    if active_frame is not None:
        call_id = active_frame[0].call_id
    else:
        call_id = runtime.call_id or f"call-{run_id}"

    event_context = _event_context(
        runtime,
        run_id=run_id,
        active_frame=active_frame,
        call_id=call_id,
    )
    events: list[tuple[str, dict, EventContext]] = []
    if not _event_exists(runtime.stream, "run_bound", run_id=run_id):
        events.append(
            (
                "run_bound",
                _run_bound_data(runtime, run_id=run_id),
                event_context,
            )
        )
    if not _event_exists(runtime.stream, "run_started", run_id=run_id):
        events.append(
            (
                "run_started",
                _run_started_data(runtime, run_id=run_id),
                event_context,
            )
        )
    if call_id and not _event_exists(runtime.stream, "graph_call_opened", call_id=call_id):
        events.append(
            (
                "graph_call_opened",
                _graph_call_opened_data(runtime, call_id=call_id),
                EventContext(
                    workflow_version=runtime.workflow_version,
                    work_key=runtime.work_key,
                    run_id=run_id,
                    aggregate_type="graph_call",
                    aggregate_id=call_id,
                    parent_aggregate_id=run_id,
                    job_id=runtime.executable_job.job.id,
                    graph_function_id=(
                        runtime.executable_job.graph_function.id
                        if runtime.executable_job.graph_function is not None
                        else None
                    ),
                    materialization_id=runtime.executable_job.materialization_id,
                    call_id=call_id,
                ),
            )
        )
    return PublicRuntimeOpenPlan(
        run_id=run_id,
        call_id=call_id,
        active_frame=active_frame,
        events=tuple(events),
    )


def _apply_public_runtime_open_plan(
    runtime: TraversalRuntime,
    plan: PublicRuntimeOpenPlan,
) -> None:
    runtime.run_id = plan.run_id
    runtime.call_id = plan.call_id
    for event_type, data, context in plan.events:
        _emit_event(runtime.stream, event_type, data, context=context)


def _bind_fp_dispatch_job(request: DispatchBindingRequest) -> BoundJob:
    bound = bind_fp(
        request.pre,
        request.executable_job,
        result_path=request.result_path,
        workspace_root=request.workspace_root,
        asset_bindings=(
            dict(request.asset_bindings) if request.asset_bindings is not None else None
        ),
    )
    return replace(
        bound,
        manifest_id=request.manifest_id,
        worker_id=request.worker_id,
        role_id=request.role_id or "",
        authority_ref=request.authority_ref or "",
        selected_worker_id=(
            request.runtime_identity.worker_id
            if request.runtime_identity.worker_id
            and request.runtime_identity.worker_id != request.worker_id
            else ""
        ),
        selected_backend=request.runtime_identity.backend_id or "",
        assignment_source=request.runtime_identity.assignment_source or "",
        resolved_runtime_ref=request.runtime_identity.resolved_runtime_ref or "",
    )


def _plan_iteration_start(
    runtime: TraversalRuntime,
    *,
    run_id: str,
    active_frame: tuple[InvocationFrame, object] | None,
    pre_transition: AdvancementTransition,
    blocking_reason: str | None,
) -> IterationStartPlan:
    vector_started_data = _vector_started_data(runtime)
    if active_frame is None:
        return IterationStartPlan(vector_started_data=vector_started_data)

    frame, step = active_frame
    prior_state = current_recursive_state(runtime.stream, frame.frame_id)
    blocks_progress = transition_blocks_progress(pre_transition)
    next_state = recursive_state_for_frame(
        frame,
        phase="waiting_on_children" if blocks_progress else "advancing",
        pending_child_keys=prior_state.frontier.pending_child_keys if prior_state else None,
        completed_child_keys=prior_state.frontier.completed_child_keys if prior_state else (),
        blocked_on=(step.child_key,) if blocks_progress else (),
        active_child_key=step.child_key,
        checkpoint_id=(
            run_id
            if blocks_progress
            else prior_state.checkpoint_id if prior_state else None
        ),
        suspended=blocks_progress,
        stack=prior_state.stack if prior_state else (frame,),
    )
    frame_suspended_data = None
    if blocks_progress and not (prior_state and prior_state.suspended):
        frame_suspended_data = frame_suspended_event(
            frame,
            next_state,
            reason=blocking_reason or "blocked",
        )["data"]
    return IterationStartPlan(
        vector_started_data=vector_started_data,
        frame_step_started_data=frame_step_started_event(frame, step, run_id=run_id)["data"],
        recursive_state=next_state,
        prior_recursive_state=prior_state,
        frame_suspended_data=frame_suspended_data,
    )


def _apply_iteration_start_plan(
    runtime: TraversalRuntime,
    plan: IterationStartPlan,
    *,
    event_context: EventContext,
) -> None:
    _emit_event(
        runtime.stream,
        "vector_started",
        plan.vector_started_data,
        context=event_context,
    )
    if plan.frame_step_started_data is not None:
        _emit_event(
            runtime.stream,
            "frame_step_started",
            plan.frame_step_started_data,
            context=event_context,
        )
    if plan.recursive_state is not None:
        _append_recursive_state(
            runtime.stream,
            plan.recursive_state,
            context=event_context,
            prior_state=plan.prior_recursive_state,
        )
    if plan.frame_suspended_data is not None:
        _emit_event(
            runtime.stream,
            "frame_suspended",
            plan.frame_suspended_data,
            context=event_context,
        )


def _plan_iteration_completion(
    runtime: TraversalRuntime,
    *,
    call_id: str,
    active_frame: tuple[InvocationFrame, object] | None,
    fd_failing: tuple[Evaluator, ...],
    fp_failing: tuple[Evaluator, ...],
    fh_failing: tuple[Evaluator, ...],
) -> IterationCompletionPlan:
    if _edge_uses_fulfillment_carrier(runtime.executable_job) or (
        fd_failing or fp_failing or fh_failing
    ):
        return IterationCompletionPlan()
    return IterationCompletionPlan(
        proof_passed_data={
            "call_id": call_id,
            "edge": runtime.executable_job.vector.name,
            "policy_mode": materialize_policy_concern(runtime.resolved_policy, "proof").get(
                "mode"
            ),
        },
        closure_passed_data={
            "call_id": call_id,
            "edge": runtime.executable_job.vector.name,
            "policy_mode": materialize_policy_concern(
                runtime.resolved_policy, "closure"
            ).get("mode"),
        },
        graph_call_closed_data=(
            {
                "call_id": call_id,
                "edge": runtime.executable_job.vector.name,
            }
            if active_frame is None and call_id
            else None
        ),
        emit_run_completed=True,
    )


def _apply_iteration_completion_plan(
    runtime: TraversalRuntime,
    plan: IterationCompletionPlan,
    *,
    event_context: EventContext,
    run_id: str,
    call_id: str,
) -> None:
    if plan.proof_passed_data is None or plan.closure_passed_data is None or not plan.emit_run_completed:
        return
    proof_event = _emit_event(
        runtime.stream,
        "proof_passed",
        plan.proof_passed_data,
        context=event_context,
    )
    closure_event = _emit_event(
        runtime.stream,
        "closure_passed",
        plan.closure_passed_data,
        context=event_context,
    )
    if plan.graph_call_closed_data is not None:
        _emit_event(
            runtime.stream,
            "graph_call_closed",
            plan.graph_call_closed_data,
            context=EventContext(
                workflow_version=runtime.workflow_version,
                work_key=runtime.work_key,
                run_id=run_id,
                aggregate_type="graph_call",
                aggregate_id=call_id,
                parent_aggregate_id=run_id,
                causation_event_id=closure_event["event_id"],
                job_id=runtime.executable_job.job.id,
                graph_function_id=(
                    runtime.executable_job.graph_function.id
                    if runtime.executable_job.graph_function is not None
                    else None
                ),
                materialization_id=runtime.executable_job.materialization_id,
                call_id=call_id,
                vector_id=runtime.executable_job.vector.id,
            ),
        )
    _emit_event(
        runtime.stream,
        "run_completed",
        {
            "call_id": call_id,
            "edge": runtime.executable_job.vector.name,
            "caused_by_event_id": proof_event["event_id"],
        },
        context=EventContext(
            workflow_version=runtime.workflow_version,
            work_key=runtime.work_key,
            run_id=run_id,
            aggregate_type="run",
            aggregate_id=run_id,
            causation_event_id=closure_event["event_id"],
            job_id=runtime.executable_job.job.id,
            graph_function_id=(
                runtime.executable_job.graph_function.id
                if runtime.executable_job.graph_function is not None
                else None
            ),
            materialization_id=runtime.executable_job.materialization_id,
            call_id=call_id,
            vector_id=runtime.executable_job.vector.id,
        ),
    )


def _plan_iteration_execution(
    runtime: TraversalRuntime,
    *,
    active_frame: tuple[InvocationFrame, object] | None,
    runtime_basis: ExecutionBasis,
    decision: IterationAdvanceDecision,
    manifest_id: str,
    fp_result_path: str | None,
) -> IterationExecutionPlan:
    open_plan = _plan_public_runtime_open(runtime, active_frame=active_frame)
    decision = iteration_advance_decision_with_basis(
        decision,
        replace(runtime_basis, run_id=open_plan.run_id),
    )
    runtime_basis = decision.basis
    pre_transition = decision.pre_transition
    event_context = _event_context(
        runtime,
        run_id=open_plan.run_id,
        active_frame=open_plan.active_frame,
        call_id=open_plan.call_id,
    )
    admitted_asset_bindings = (
        resolve_workspace_asset_bindings(
            workspace_root=runtime.workspace_root,
            contract=runtime.asset_binding_contract,
        )
        if isinstance(pre_transition, FpDispatchRequiredTransition)
        else None
    )
    dispatch_plan = iteration_dispatch_plan(
        decision=decision,
        pre=runtime.precomputed,
        executable_job=runtime.executable_job,
        workspace_root=runtime.workspace_root,
        asset_bindings=admitted_asset_bindings,
        manifest_id=manifest_id,
        result_path=fp_result_path,
        worker_id=runtime.worker.id,
        role_id=(
            runtime.executable_job.job.roles[0].id
            if runtime.executable_job.job.roles
            else None
        ),
        authority_ref=runtime.worker.authority_ref,
        runtime_identity=runtime.runtime_identity,
    )
    bound_job = _bind_fp_dispatch_job(dispatch_plan.binding_request)
    dispatch_plan = replace(dispatch_plan, bound_job=bound_job)
    publication_plan = None
    if dispatch_plan.dispatch_transition is not None:
        publication_plan = fp_dispatch_publication_plan(
            workspace_root=runtime.workspace_root,
            transition=dispatch_plan.dispatch_transition,
            executable_job=runtime.executable_job,
            pre=runtime.precomputed,
            bound_job=bound_job,
            resolved_policy=decision.resolved_policy,
            workflow_version=runtime.workflow_version,
            spec_hash=runtime.spec_hash,
            requirements=runtime.module.metadata.get("requirements", []),
            run_id=open_plan.run_id,
            call_id=open_plan.call_id,
            work_key=runtime.work_key,
            worker_id=runtime.worker.id,
            role_id=(
                runtime.executable_job.job.roles[0].id
                if runtime.executable_job.job.roles
                else None
            ),
            authority_ref=runtime.worker.authority_ref,
            graph_call_terminal_on_result=open_plan.active_frame is None,
        )
    iteration_start_plan = _plan_iteration_start(
        runtime,
        run_id=open_plan.run_id,
        active_frame=open_plan.active_frame,
        pre_transition=pre_transition,
        blocking_reason=decision.blocking_reason,
    )
    completion_plan = _plan_iteration_completion(
        runtime,
        call_id=open_plan.call_id,
        active_frame=open_plan.active_frame,
        fd_failing=decision.failures.fd,
        fp_failing=decision.failures.fp,
        fh_failing=decision.failures.fh,
    )
    return IterationExecutionPlan(
        open_plan=open_plan,
        basis=runtime_basis,
        decision=decision,
        event_context=event_context,
        dispatch_plan=dispatch_plan,
        bound_job=bound_job,
        publication_plan=publication_plan,
        iteration_start_plan=iteration_start_plan,
        completion_plan=completion_plan,
        blocking_reason=decision.blocking_reason,
    )


def _apply_iteration_execution_plan(
    runtime: TraversalRuntime,
    plan: IterationExecutionPlan,
    *,
    surface: WorkSurface,
) -> TraversalOutcome:
    _apply_public_runtime_open_plan(runtime, plan.open_plan)
    _apply_iteration_start_plan(
        runtime,
        plan.iteration_start_plan,
        event_context=plan.event_context,
    )
    iter_surface = _realize_iteration(
        plan.bound_job,
        blocking_reason=plan.blocking_reason,
        leaf_tasks=list(runtime.leaf_tasks) if runtime.leaf_tasks else None,
        on_leaf_dispatch=runtime.on_leaf_dispatch,
        leaf_task_inputs=runtime.leaf_task_inputs,
        run_id=plan.open_plan.run_id,
        spec_hash=runtime.spec_hash,
        workflow_version=runtime.workflow_version,
        work_key=runtime.work_key,
    )
    _append_events(runtime.stream, iter_surface.events, context=plan.event_context)
    _apply_iteration_completion_plan(
        runtime,
        plan.completion_plan,
        event_context=plan.event_context,
        run_id=plan.open_plan.run_id,
        call_id=plan.open_plan.call_id,
    )
    if isinstance(plan.decision.pre_transition, FpDispatchRequiredTransition):
        if plan.dispatch_plan.dispatch_transition is None or plan.publication_plan is None:
            raise RuntimeError("fp dispatch transition must exist when manifest is published")
        manifest = dict(plan.publication_plan.manifest_payload)
        _attach_execution_binding_provenance(
            manifest,
            runtime_identity=runtime.runtime_identity,
            worker=runtime.worker,
        )
        plan.publication_plan.manifest_path.parent.mkdir(parents=True, exist_ok=True)
        plan.publication_plan.manifest_path.write_text(
            json.dumps(manifest, indent=2),
            encoding="utf-8",
        )
    outcome_plan = iteration_outcome_plan(
        basis=plan.basis,
        pre_transition=plan.decision.pre_transition,
        dispatch_transition=plan.dispatch_plan.dispatch_transition,
        outer_surface_metadata=surface.metadata,
        iter_surface_metadata=iter_surface.metadata,
        executable_job=runtime.executable_job,
        pre=runtime.precomputed,
        bound_job=plan.bound_job,
        surface_artifacts=iter_surface.artifacts,
        context_consumed_names=[c.name for c in iter_surface.context_consumed],
        work_key=runtime.work_key,
        spec_hash=runtime.spec_hash,
        workflow_version=runtime.workflow_version,
        run_id=plan.open_plan.run_id,
        call_id=plan.open_plan.call_id,
        blocking_reason=plan.blocking_reason,
        fh_failing=plan.decision.failures.fh,
        publication_plan=plan.publication_plan,
        events_emitted=(
            len(plan.open_plan.events)
            + _iteration_start_event_count(plan.iteration_start_plan)
            + len(iter_surface.events)
            + _iteration_completion_event_count(plan.completion_plan)
        ),
    )
    return TraversalOutcome(
        surface=WorkSurface(
            events=iter_surface.events,
            artifacts=iter_surface.artifacts,
            context_consumed=iter_surface.context_consumed,
            context_emitted=iter_surface.context_emitted,
            findings=iter_surface.findings,
            attestations=iter_surface.attestations,
            metadata=outcome_plan.metadata,
        ),
        result=outcome_plan.result,
        basis=plan.basis,
        transition=outcome_plan.transition,
    )


def _plan_pending_dispatch_replay(
    runtime: TraversalRuntime,
    *,
    surface: WorkSurface,
    runtime_basis: ExecutionBasis,
    active_frame: tuple[InvocationFrame, object] | None,
    pending_run_id: str,
    pending_manifest_id: str | None,
    dispatch_transition: FpDispatchTransition,
    manifest_path: str | None,
    resumed_result_path: str | None,
    prompt_compactions: list[dict[str, Any]] | None = None,
) -> PendingDispatchReplayPlan:
    recursive_state = None
    prior_recursive_state = None
    if active_frame is not None:
        frame, step = active_frame
        prior_recursive_state = current_recursive_state(runtime.stream, frame.frame_id)
        recursive_state = recursive_state_for_frame(
            frame,
            phase="waiting_on_children",
            pending_child_keys=(
                prior_recursive_state.frontier.pending_child_keys
                if prior_recursive_state
                else None
            ),
            completed_child_keys=(
                prior_recursive_state.frontier.completed_child_keys
                if prior_recursive_state
                else ()
            ),
            blocked_on=(step.child_key,),
            active_child_key=step.child_key,
            checkpoint_id=(
                prior_recursive_state.checkpoint_id if prior_recursive_state else None
            ),
            suspended=False,
            stack=prior_recursive_state.stack if prior_recursive_state else (frame,),
        )

    result = {
        "status": "pending",
        "reason": f"F_P dispatch already in flight for edge {runtime.executable_job.vector.name!r}",
        "pending_run_id": pending_run_id,
        "edge": runtime.executable_job.vector.name,
        "work_key": runtime.work_key,
        "spec_hash": runtime.spec_hash,
        "workflow_version": runtime.workflow_version,
        "blocking_reason": "fp_dispatch",
    }
    if pending_manifest_id:
        result["manifest_id"] = pending_manifest_id
    if manifest_path is not None:
        result["fp_manifest_path"] = manifest_path
    if resumed_result_path is not None:
        result["fp_result_path"] = resumed_result_path
    prompt_compactions_payload = list(prompt_compactions or [])
    result["prompt_compactions"] = prompt_compactions_payload
    attach_runtime_carrier_metadata(result, runtime_basis, dispatch_transition)

    metadata = dict(surface.metadata)
    metadata["traversal_outcome"] = {
        "status": "pending",
        "pending_run_id": pending_run_id,
        "blocking_reason": "fp_dispatch",
    }
    if pending_manifest_id:
        metadata["traversal_outcome"]["manifest_id"] = pending_manifest_id
    if manifest_path is not None:
        metadata["traversal_outcome"]["fp_manifest_path"] = manifest_path
    if resumed_result_path is not None:
        metadata["traversal_outcome"]["fp_result_path"] = resumed_result_path
    metadata["traversal_outcome"]["prompt_compactions"] = prompt_compactions_payload

    return PendingDispatchReplayPlan(
        result=result,
        metadata=metadata,
        transition=dispatch_transition,
        recursive_state=recursive_state,
        prior_recursive_state=prior_recursive_state,
    )


def _apply_pending_dispatch_replay_plan(
    runtime: TraversalRuntime,
    plan: PendingDispatchReplayPlan,
    *,
    surface: WorkSurface,
    pending_context: EventContext | None,
    runtime_basis: ExecutionBasis,
) -> TraversalOutcome:
    if plan.recursive_state is not None:
        if pending_context is None:
            raise RuntimeError("pending replay recursive state requires an event context")
        _append_recursive_state(
            runtime.stream,
            plan.recursive_state,
            context=pending_context,
            prior_state=plan.prior_recursive_state,
        )
    return TraversalOutcome(
        surface=WorkSurface(
            events=surface.events,
            artifacts=surface.artifacts,
            context_consumed=surface.context_consumed,
            context_emitted=surface.context_emitted,
            findings=surface.findings,
            attestations=surface.attestations,
            metadata=plan.metadata,
        ),
        result=plan.result,
        basis=runtime_basis,
        transition=plan.transition,
    )


def _event_context(
    runtime: TraversalRuntime,
    *,
    run_id: str | None = None,
    active_frame: tuple[InvocationFrame, object] | None = None,
    call_id: str | None = None,
) -> EventContext:
    frame = active_frame[0] if active_frame is not None else None
    resolved_call_id = call_id or runtime.call_id or (frame.call_id if frame is not None else None)
    return EventContext(
        workflow_version=runtime.workflow_version,
        work_key=runtime.work_key,
        run_id=run_id or runtime.run_id,
        job_id=runtime.executable_job.job.id,
        graph_function_id=(
            runtime.executable_job.graph_function.id
            if runtime.executable_job.graph_function is not None
            else None
        ),
        materialization_id=runtime.executable_job.materialization_id,
        call_id=resolved_call_id,
        frame_attempt_id=frame.frame_attempt_id if frame is not None else None,
        frame_lineage_id=frame.frame_lineage_id if frame is not None else None,
        vector_id=runtime.executable_job.vector.id,
    )


def _emit_event(
    stream: EventStream,
    event_type: str,
    data: dict,
    *,
    context: EventContext | None = None,
) -> dict:
    return emit(event_type, data, stream=stream, context=context)


def _append_events(
    stream: EventStream,
    events: tuple[dict, ...] | list[dict],
    *,
    context: EventContext | None = None,
) -> None:
    for event in events:
        _emit_event(stream, event["event_type"], event["data"], context=context)


def _append_recursive_state(
    stream: EventStream,
    state,
    *,
    context: EventContext | None = None,
    prior_state=None,
) -> None:
    if prior_state is not None and prior_state == state:
        return
    _emit_event(stream, "frame_state_updated", frame_state_updated_event(state)["data"], context=context)


def _current_certified_keys(all_events: list[dict]) -> set[tuple[str, str | None]]:
    certified_keys: set[tuple[str, str | None]] = set()
    for event in all_events:
        data = event.get("data", {})
        event_type = event.get("event_type")
        if event_type == "edge_reopened":
            certified_keys.discard((data.get("edge", ""), data.get("work_key")))
            continue
        if event_type != "edge_converged":
            continue
        if not data.get("target"):
            continue
        reset = find_latest_reset(all_events, edge=data.get("edge"), work_key=data.get("work_key"))
        if reset and event.get("event_time", "") <= reset.get("event_time", ""):
            continue
        certified_keys.add((data.get("edge", ""), data.get("work_key")))
    return certified_keys


def selection_is_active(
    all_events: list[dict],
    *,
    edge: str,
    work_key: str | None,
) -> bool:
    """True when a selection has already been lawfully applied for this edge/work_key."""
    reset = find_latest_reset(all_events, edge=edge, work_key=work_key)
    reset_time = reset.get("event_time", "") if reset else ""
    for event in reversed(all_events):
        if event.get("event_type") != "workflow_selected":
            continue
        data = event.get("data", {})
        if data.get("edge") != edge:
            continue
        if data.get("work_key") != work_key:
            continue
        if reset_time and event.get("event_time", "") <= reset_time:
            continue
        return True
    return False


def _resolve_foldback_outcome(frame: InvocationFrame) -> FoldBackOutcome:
    foldback_decl = frame.graph_function_recursion.get("foldback", {})
    return FoldBackOutcome(
        frame_lineage_id=frame.frame_lineage_id,
        frame_attempt_id=frame.frame_attempt_id,
        parent_key=frame.parent_key,
        parent_vector_id=frame.parent_vector_id,
        parent_edge=frame.parent_edge,
        child_keys=tuple(step.child_key for step in frame.steps),
        contract_binding=foldback_decl.get("binding"),
        payload=Attrs.coerce(
            {
                "graph_function": frame.graph_function,
                "materialization_id": frame.materialization_id,
            }
        ),
    )


def _resolve_foldback_result(frame: InvocationFrame) -> ParentRebindResult:
    foldback = _resolve_foldback_outcome(frame)
    return ParentRebindResult(
        frame_lineage_id=foldback.frame_lineage_id,
        parent_key=foldback.parent_key,
        parent_vector_id=foldback.parent_vector_id,
        parent_edge=foldback.parent_edge,
        rebound=True,
        reason="fold-back completed; parent must be re-evaluated from the stable outer contract",
        payload=Attrs.coerce(
            {
                "child_keys": foldback.child_keys,
                "binding": foldback.contract_binding,
                **foldback.payload.to_dict(),
            }
        ),
    )


def _recursive_termination_evaluator(frame: InvocationFrame) -> Evaluator | None:
    termination_decl = frame.graph_function_recursion.get("termination")
    if not termination_decl:
        return None
    regime_name = termination_decl.get("regime", "F_D")
    regime = {
        "F_D": F_D,
        "F_P": F_P,
        "F_H": F_H,
    }.get(regime_name)
    if regime is None:
        raise ValueError(
            f"Unsupported recursion termination regime {regime_name!r} "
            f"for graph function {frame.graph_function!r}"
        )
    return Evaluator(
        name=termination_decl["name"],
        regime=regime,
        description=termination_decl.get("description", ""),
        binding=termination_decl.get("binding", ""),
    )


def _parent_termination_job(module: Module, frame: InvocationFrame, termination: Evaluator) -> ExecutableJob:
    parent_vector = frame.parent_vector
    termination_vector = GraphVector(
        name=parent_vector.name,
        source=parent_vector.source,
        target=parent_vector.target,
        operators=parent_vector.operators,
        evaluators=(termination,),
        contexts=parent_vector.contexts,
        rule=parent_vector.rule,
        allows_subwork=parent_vector.allows_subwork,
        tags=parent_vector.tags,
        id=parent_vector.id,
    )
    return ExecutableJob(
        job=Job(
            name=parent_vector.name,
        ),
        graph_function=None,
        materialization_id=frame.materialization_id,
        vector=termination_vector,
    )


def _termination_satisfied(
    *,
    module: Module,
    frame: InvocationFrame,
    workspace_root: Path,
    stream: EventStream,
    workflow_version: str,
    requirements: tuple | list,
    resolver: ContextResolver,
    carry_forward: list[dict],
) -> bool:
    termination = _recursive_termination_evaluator(frame)
    if termination is None:
        return True
    termination_job = _parent_termination_job(module, frame, termination)
    termination_spec_hash = spec_hash_for(
        workflow_version=workflow_version,
        executable_job=termination_job,
        requirements=requirements,
    )
    termination_pre = bind_fd(
        termination_job,
        stream,
        resolver,
        workspace_root,
        spec_hash=termination_spec_hash,
        current_workflow_version=workflow_version,
        carry_forward=carry_forward,
        module=module,
        work_key=frame.parent_key,
    )
    return len(termination_pre.failing_evaluators) == 0


def _selection_outcome(
    surface: WorkSurface,
    runtime: TraversalRuntime,
    family: CandidateFamily,
    selection: SelectionDecision,
) -> TraversalOutcome:
    active_frame = _active_frame_for_runtime(runtime)
    open_plan = _plan_public_runtime_open(runtime, active_frame=active_frame)
    _apply_public_runtime_open_plan(runtime, open_plan)
    run_id = open_plan.run_id
    call_id = open_plan.call_id
    vector = runtime.executable_job.vector
    candidates = family.candidates
    if not candidates:
        raise ValueError(
            f"_selection_outcome(): no candidates available for vector {vector.id!r}"
        )
    matching = [candidate for candidate in candidates if candidate.name == selection.graph_function]
    if len(matching) != 1:
        raise ValueError(
            "_selection_outcome(): SelectionDecision.graph_function must resolve to "
            f"exactly one candidate in family {family.name!r}"
        )
    candidate = matching[0]
    decision = accept_selection(
        family,
        candidate,
        contract_id=selection.contract_id,
        work_key=selection.work_key,
        selected_by=selection.selected_by,
        selection_mode=selection.selection_mode,
        rationale=selection.rationale,
    )
    if decision != selection:
        raise ValueError(
            "_selection_outcome(): explicit SelectionDecision did not validate "
            "against the CandidateFamily contract"
        )
    parent_stack: tuple[InvocationFrame, ...] | None = None
    active_parent = _find_visible_frame_step(runtime.stream, runtime.work_key)
    if active_parent is not None:
        parent_frame, _ = active_parent
        parent_state = current_recursive_state(runtime.stream, parent_frame.frame_id)
        if parent_state is not None:
            parent_stack = parent_state.stack

    sel_result = apply_selection(
        runtime.module,
        runtime.executable_job,
        decision,
        candidate,
        call_id=call_id,
        parent_stack=parent_stack,
    )
    stream_events: list[dict] = list(sel_result.events)
    selection_context = _event_context(runtime, run_id=run_id)
    _append_events(runtime.stream, stream_events, context=selection_context)
    _emit_event(
        runtime.stream,
        "run_completed",
        {
            "call_id": call_id,
            "edge": runtime.executable_job.vector.name,
        },
        context=EventContext(
            workflow_version=runtime.workflow_version,
            work_key=runtime.work_key,
            run_id=run_id,
            aggregate_type="run",
            aggregate_id=run_id,
            job_id=runtime.executable_job.job.id,
            graph_function_id=(
                runtime.executable_job.graph_function.id
                if runtime.executable_job.graph_function is not None
                else None
            ),
            materialization_id=runtime.executable_job.materialization_id,
            call_id=call_id,
            vector_id=runtime.executable_job.vector.id,
        ),
    )

    contract_edge = runtime.executable_job.vector.name
    result = {
        "status": "selected",
        "edge": contract_edge,
        "graph_function": sel_result.graph_function,
        "materialization_id": sel_result.materialization_id,
        "frame_id": sel_result.frame.frame_id,
        "frame_lineage_id": sel_result.frame.frame_lineage_id,
        "frame_attempt_id": sel_result.frame.frame_attempt_id,
        "children_spawned": len(sel_result.frame.steps),
        "reason": (
            f"Edge {contract_edge!r} refined via "
            f"GraphFunction {sel_result.graph_function!r}. Re-enter to dispatch frame-local child work."
        ),
    }

    next_metadata = dict(surface.metadata)
    next_metadata["traversal_outcome"] = {
        "status": "selected",
        "graph_function": sel_result.graph_function,
        "materialization_id": sel_result.materialization_id,
        "frame_id": sel_result.frame.frame_id,
        "frame_lineage_id": sel_result.frame.frame_lineage_id,
        "frame_attempt_id": sel_result.frame.frame_attempt_id,
        "evaluator_bundle": sel_result.evaluator_bundle,
        "children_spawned": len(sel_result.frame.steps),
    }
    return TraversalOutcome(
        surface=WorkSurface(
            events=tuple(stream_events),
            artifacts=surface.artifacts,
            context_consumed=surface.context_consumed,
            context_emitted=surface.context_emitted,
            findings=surface.findings,
            attestations=surface.attestations,
            metadata=next_metadata,
        ),
        result=result,
    )


def _iterated_outcome(
    surface: WorkSurface,
    runtime: TraversalRuntime,
) -> TraversalOutcome:
    vector = runtime.executable_job.vector
    pre = runtime.precomputed
    active_frame = _active_frame_for_runtime(runtime)
    frame_id = active_frame[0].frame_id if active_frame is not None else None
    frame_lineage_id = (
        active_frame[0].frame_lineage_id if active_frame is not None else None
    )
    runtime_basis = execution_basis_for_runtime(
        runtime,
        frame_id=frame_id,
        frame_lineage_id=frame_lineage_id,
    )
    decision = iteration_advance_decision(
        basis=runtime_basis,
        pre=pre,
        resolved_policy=runtime.resolved_policy,
    )
    runtime.resolved_policy = decision.resolved_policy
    pre_transition = decision.pre_transition

    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    edge_slug = vector.name.replace("→", "_").replace("↔", "_")
    manifest_id = f"{edge_slug}_{ts}"

    from .run import find_pending_run

    dispatch_requires_fp = isinstance(pre_transition, FpDispatchRequiredTransition)
    fp_result_path: str | None = None
    dispatch_transition = None

    if dispatch_requires_fp:
        fp_results_dir = runtime.workspace_root / ".ai-workspace" / "fp_results"
        fp_results_dir.mkdir(parents=True, exist_ok=True)
        fp_result_path = str(fp_results_dir / f"{manifest_id}.json")
        pending = find_pending_run(
            runtime.stream.all_events(),
            vector.name,
            work_key=runtime.work_key,
        )
        if pending is not None:
            runtime_basis = replace(runtime_basis, run_id=pending.run_id)
            manifest_path = None
            resumed_result_path = None
            if pending.manifest_id:
                candidate = (
                    runtime.workspace_root
                    / ".ai-workspace"
                    / "fp_manifests"
                    / f"{pending.manifest_id}.json"
                )
                manifest_path = str(candidate)
                resumed_result_path = str(
                    runtime.workspace_root
                    / ".ai-workspace"
                    / "fp_results"
                    / f"{pending.manifest_id}.json"
                )
            decision = iteration_advance_decision_with_basis(
                decision,
                replace(runtime_basis, run_id=pending.run_id),
            )
            runtime_basis = decision.basis
            dispatch_transition = dispatch_transition_for_requirement(
                decision,
                manifest_id=str(pending.manifest_id or ""),
                result_path=resumed_result_path,
            )
            pending_context = None
            if active_frame is not None:
                pending_context = _event_context(
                    runtime,
                    run_id=runtime.run_id or pending.run_id,
                    active_frame=active_frame,
                )
            replay_plan = _plan_pending_dispatch_replay(
                runtime,
                surface=surface,
                runtime_basis=runtime_basis,
                active_frame=active_frame,
                pending_run_id=pending.run_id,
                pending_manifest_id=(
                    pending.manifest_id if isinstance(pending.manifest_id, str) else None
                ),
                dispatch_transition=dispatch_transition,
                manifest_path=manifest_path,
                resumed_result_path=resumed_result_path,
                prompt_compactions=pending.prompt_compactions,
            )
            return _apply_pending_dispatch_replay_plan(
                runtime,
                replay_plan,
                surface=surface,
                pending_context=pending_context,
                runtime_basis=runtime_basis,
            )

    execution_plan = _plan_iteration_execution(
        runtime,
        active_frame=active_frame,
        runtime_basis=runtime_basis,
        decision=decision,
        manifest_id=manifest_id,
        fp_result_path=fp_result_path,
    )
    return _apply_iteration_execution_plan(
        runtime,
        execution_plan,
        surface=surface,
    )


def advance_recursive_machine(
    *,
    module: Module,
    workspace_root: Path,
    stream: EventStream,
    workflow_version: str,
    requirements: tuple | list = (),
    carry_forward: list[dict] | None = None,
) -> None:
    """Advance the explicit tail-loop recursive machine from current cursor state."""
    if not _ordered_machine_frame_ids(stream):
        return

    resolver = ContextResolver(workspace_root)
    carry_forward = carry_forward or []
    execution_index = _execution_index(stream)
    visited: set[str] = set()
    while True:
        ordered_frame_ids = _ordered_machine_frame_ids(stream)
        if not ordered_frame_ids:
            return
        frame_id = ordered_frame_ids[0]
        if frame_id in visited and len(ordered_frame_ids) == 1:
            return
        visited.add(frame_id)
        state = current_recursive_state(stream, frame_id)
        if state is None or not state.stack:
            next_frame_id = _advance_machine_cursor(stream, exhausted_frame_id=frame_id)
            if next_frame_id is None or next_frame_id == frame_id:
                return
            continue
        result = _advance_current_recursive_state(
            module=module,
            workspace_root=workspace_root,
            stream=stream,
            workflow_version=workflow_version,
            requirements=requirements,
            carry_forward=carry_forward,
            resolver=resolver,
            execution_index=execution_index,
            state=state,
        )
        if result.yielded:
            return
        if result.progressed:
            visited.clear()
            continue
        next_frame_id = _advance_machine_cursor(stream, exhausted_frame_id=frame_id)
        if next_frame_id is None or next_frame_id == frame_id:
            return


def _advance_current_recursive_state(
    *,
    module: Module,
    workspace_root: Path,
    stream: EventStream,
    workflow_version: str,
    requirements: tuple | list,
    carry_forward: list[dict],
    resolver: ContextResolver,
    execution_index: RecursiveExecutionIndex,
    state: RecursiveInterpreterState,
) -> MachineAdvanceResult:
    frame = state.stack[-1]
    ordered_child_keys = tuple(step.child_key for step in frame.steps)
    completed_set = set(state.frontier.completed_child_keys)
    pending_seed = state.frontier.pending_child_keys or tuple(
        child_key for child_key in ordered_child_keys
        if child_key not in completed_set
    )
    pending_set = set(pending_seed)
    blocked_set = set(state.frontier.blocked_on)
    progressed = False

    for step in frame.steps:
        if step.child_key not in pending_set:
            continue
        spec_hash = spec_hash_for(
            workflow_version=workflow_version,
            executable_job=step.executable_job,
            requirements=requirements,
        )
        pre = bind_fd(
            step.executable_job,
            stream,
            resolver,
            workspace_root,
            spec_hash=spec_hash,
            current_workflow_version=workflow_version,
            carry_forward=carry_forward,
            module=module,
            work_key=step.child_key,
        )
        conv = convergence_from_precomputed(step.executable_job.vector.id, pre)
        cert_key = (step.edge, step.child_key)
        step_key = (frame.frame_attempt_id, step.child_key)
        if conv.aggregate_state != "closed":
            continue
        if cert_key not in execution_index.certified_keys:
            if _edge_uses_fulfillment_carrier(step.executable_job):
                if _project_fulfillment_edge_converged(
                    stream,
                    job=step.executable_job,
                    workflow_version=workflow_version,
                    spec_hash=spec_hash,
                    work_key=step.child_key,
                    certified_keys=execution_index.certified_keys,
                ):
                    progressed = True
            else:
                _emit_event(
                    stream,
                    "edge_converged",
                    {
                        "edge": step.edge,
                        "vector_id": step.executable_job.vector.id,
                        "target": step.executable_job.vector.target.name,
                        "work_key": step.child_key,
                        "delta": 0,
                        "certified_by": "frame_progress",
                    },
                    context=EventContext(
                        workflow_version=workflow_version,
                        work_key=step.child_key,
                    ),
                )
                execution_index.certified_keys.add(cert_key)
                progressed = True
        if step_key not in execution_index.completed_steps:
            _emit_event(
                stream,
                "frame_step_completed",
                frame_step_completed_event(frame, step)["data"],
                context=EventContext(
                    workflow_version=workflow_version,
                    work_key=step.child_key,
                ),
            )
            execution_index.completed_steps.add(step_key)
            progressed = True
        pending_set.discard(step.child_key)
        completed_set.add(step.child_key)
        blocked_set.discard(step.child_key)

    pending_keys = tuple(
        child_key for child_key in ordered_child_keys
        if child_key in pending_set and child_key not in completed_set
    )
    completed_keys = tuple(
        child_key for child_key in ordered_child_keys
        if child_key in completed_set
    )
    blocked_keys = tuple(
        child_key for child_key in ordered_child_keys
        if child_key in blocked_set and child_key in pending_set
    )
    active_child_key = state.continuation.active_child_key
    if active_child_key not in pending_set:
        active_child_key = None

    if pending_keys:
        next_state = recursive_state_for_frame(
            frame,
            phase="waiting_on_children",
            pending_child_keys=pending_keys,
            completed_child_keys=completed_keys,
            blocked_on=blocked_keys,
            active_child_key=active_child_key,
            checkpoint_id=state.checkpoint_id,
            suspended=bool(blocked_keys) if state.suspended else False,
            stack=state.stack,
        )
        _append_recursive_state(
            stream,
            next_state,
            context=EventContext(
                workflow_version=workflow_version,
                work_key=frame.parent_key,
            ),
            prior_state=state,
        )
        if state.suspended and not next_state.suspended:
            _emit_event(
                stream,
                "frame_resumed",
                frame_resumed_event(
                    frame,
                    next_state,
                    reason="child frontier changed; recursive continuation can advance again",
                )["data"],
                context=EventContext(
                    workflow_version=workflow_version,
                    work_key=frame.parent_key,
                ),
            )
            progressed = True
        return MachineAdvanceResult(progressed=progressed or next_state != state, yielded=True)

    if frame.frame_id in execution_index.closed_frames:
        return MachineAdvanceResult(progressed=False, yielded=False)

    if not _termination_satisfied(
        module=module,
        frame=frame,
        workspace_root=workspace_root,
        stream=stream,
        workflow_version=workflow_version,
        requirements=requirements,
        resolver=resolver,
        carry_forward=carry_forward,
    ):
        next_state = recursive_state_for_frame(
            frame,
            phase="foldback_pending",
            pending_child_keys=(),
            completed_child_keys=completed_keys,
            blocked_on=(),
            active_child_key=None,
            checkpoint_id=state.checkpoint_id,
            suspended=False,
            stack=state.stack,
        )
        _append_recursive_state(
            stream,
            next_state,
            context=EventContext(
                workflow_version=workflow_version,
                work_key=frame.parent_key,
            ),
            prior_state=state,
        )
        if state.suspended:
            _emit_event(
                stream,
                "frame_resumed",
                frame_resumed_event(
                    frame,
                    next_state,
                    reason="all child obligations cleared; fold-back evaluation resumed",
                )["data"],
                context=EventContext(
                    workflow_version=workflow_version,
                    work_key=frame.parent_key,
                ),
            )
            progressed = True
        return MachineAdvanceResult(progressed=progressed or next_state != state, yielded=True)

    parent_eval_state = recursive_state_for_frame(
        frame,
        phase="parent_eval_pending",
        pending_child_keys=(),
        completed_child_keys=completed_keys,
        blocked_on=(),
        active_child_key=None,
        checkpoint_id=state.checkpoint_id,
        suspended=False,
        stack=state.stack,
    )
    _append_recursive_state(
        stream,
        parent_eval_state,
        context=EventContext(
            workflow_version=workflow_version,
            work_key=frame.parent_key,
        ),
        prior_state=state,
    )
    if state.suspended:
        _emit_event(
            stream,
            "frame_resumed",
            frame_resumed_event(
                frame,
                parent_eval_state,
                reason="all child obligations cleared; parent re-evaluation resumed",
            )["data"],
            context=EventContext(
                workflow_version=workflow_version,
                work_key=frame.parent_key,
            ),
        )
    _emit_event(
        stream,
        "foldback_opened",
        foldback_opened_event(frame)["data"],
        context=EventContext(
            workflow_version=workflow_version,
            work_key=frame.parent_key,
        ),
    )
    if frame.frame_id not in execution_index.rebound_frames:
        rebound = _resolve_foldback_result(frame)
        _emit_event(
            stream,
            "frame_rebound",
            frame_rebound_event(frame, rebound)["data"],
            context=EventContext(
                workflow_version=workflow_version,
                work_key=frame.parent_key,
            ),
        )
        execution_index.rebound_frames.add(frame.frame_id)
    _emit_event(
        stream,
        "frame_closed",
        frame_closed_event(frame)["data"],
        context=EventContext(
            workflow_version=workflow_version,
            work_key=frame.parent_key,
        ),
    )
    execution_index.closed_frames.add(frame.frame_id)
    _append_recursive_state(
        stream,
        recursive_state_for_frame(
            frame,
            phase="closed",
            pending_child_keys=(),
            completed_child_keys=ordered_child_keys,
            blocked_on=(),
            active_child_key=None,
            checkpoint_id=state.checkpoint_id,
            suspended=False,
            stack=state.stack,
        ),
        context=EventContext(
            workflow_version=workflow_version,
            work_key=frame.parent_key,
        ),
        prior_state=parent_eval_state,
    )
    return MachineAdvanceResult(progressed=True, yielded=False)


def _stamp_traversal_surface(
    traversal: Traversal,
    *,
    surface: WorkSurface,
) -> WorkSurface:
    """Stamp traversal identity onto a surface without altering execution truth."""
    next_metadata = dict(surface.metadata)
    next_metadata["traversal"] = {
        "work_key": traversal.work_key,
        "target_name": traversal.target.name,
        "target_kind": type(traversal.target).__name__,
        "evaluators": tuple(ev.name for ev in traversal.evaluators),
        "rule": traversal.rule.name if traversal.rule is not None else None,
    }
    if traversal.metadata:
        next_metadata["traversal_input"] = dict(traversal.metadata)

    base_surface = WorkSurface(
        events=surface.events,
        artifacts=surface.artifacts,
        context_consumed=surface.context_consumed,
        context_emitted=surface.context_emitted,
        findings=surface.findings,
        attestations=surface.attestations,
        metadata=next_metadata,
    )
    return base_surface


def traverse(
    traversal: Traversal,
    *,
    runtime: TraversalRuntime,
    surface: WorkSurface | None = None,
) -> TraversalOutcome:
    """Execute one named traversal attempt through the ABG runtime seam."""
    base_surface = _stamp_traversal_surface(traversal, surface=surface or WorkSurface())
    boundary_inputs, boundary_outputs = _target_boundary(traversal.target)
    job_inputs = _boundary_inputs(runtime.executable_job.vector)
    job_outputs = (runtime.executable_job.vector.target,)
    if boundary_inputs != job_inputs or boundary_outputs != job_outputs:
        raise ValueError("traverse(): target boundary does not match executable job contract")

    if isinstance(traversal.target, CandidateFamily):
        return _selection_outcome(base_surface, runtime, traversal.target, traversal.selection)

    return _iterated_outcome(base_surface, runtime)


# ── iteration realization ────────────────────────────────────────────────────


def _realize_iteration(
    bound_job: BoundJob,
    *,
    blocking_reason: str | None = None,
    leaf_tasks: Optional[list[LeafTask]] = None,
    on_leaf_dispatch: Optional[Callable[[LeafTask, dict], tuple[dict | None, str | None]]] = None,
    run_id: Optional[str] = None,
    leaf_task_inputs: Optional[dict[str, dict]] = None,
    spec_hash: Optional[str] = None,
    workflow_version: str = "unknown",
    work_key: Optional[str] = None,
) -> WorkSurface:
    """Singular runtime realization path for one bound job.

    This is the execution core used by the traversal seam.
    """
    pre = bound_job.precomputed
    job = bound_job.executable_job

    events: list[dict] = []
    artifacts: list[str] = []

    failures = regime_failures(pre)
    fd_failing = failures.fd
    fp_failing = failures.fp
    fh_failing = failures.fh

    if fd_failing:
        kind = "fd_findings" if fp_failing or blocking_reason == "fp_dispatch" else "fd_gap"
        events.append({
            "event_type": "found",
            "data": {
                "kind": kind,
                "edge": job.vector.name,
                "failing": [ev.name for ev in fd_failing],
                "delta_summary": pre.delta_summary,
            },
        })

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
                    "prompt_authority": _leaf_dispatch_prompt_authority(on_leaf_dispatch),
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

    dispatch_surface = WorkSurface()

    if fp_failing:
        fp_dispatch_data: dict = {
            "edge": job.vector.name,
            "failing_evaluators": [ev.name for ev in fp_failing],
            "prompt_length": len(bound_job.prompt),
            "job_id": job.job.id,
            "spec_hash": spec_hash,
            "workflow_version": workflow_version,
        }
        if work_key is not None:
            fp_dispatch_data["work_key"] = work_key
        if bound_job.worker_id:
            fp_dispatch_data["worker_id"] = bound_job.worker_id
        if run_id:
            fp_dispatch_data["run_id"] = run_id
        if bound_job.manifest_id:
            fp_dispatch_data["manifest_id"] = bound_job.manifest_id
        fp_dispatch_data["prompt_compactions"] = list(bound_job.prompt_compactions)
        if bound_job.role_id:
            fp_dispatch_data["role_id"] = bound_job.role_id
        if bound_job.authority_ref:
            fp_dispatch_data["authority_ref"] = bound_job.authority_ref
        if bound_job.selected_worker_id:
            fp_dispatch_data["selected_worker_id"] = bound_job.selected_worker_id
        if bound_job.selected_backend:
            fp_dispatch_data["backend_id"] = bound_job.selected_backend
            fp_dispatch_data["selected_backend"] = bound_job.selected_backend
        if bound_job.assignment_source:
            fp_dispatch_data["assignment_source"] = bound_job.assignment_source
        if bound_job.resolved_runtime_ref:
            fp_dispatch_data["resolved_runtime_ref"] = bound_job.resolved_runtime_ref
        if bound_job.runtime_environment_contract:
            fp_dispatch_data["runtime_environment_contract"] = (
                bound_job.runtime_environment_contract
            )
        events.append({
            "event_type": "fp_dispatched",
            "data": fp_dispatch_data,
        })
        if bound_job.manifest_id:
            manifests_dir = ".ai-workspace/fp_manifests"
            artifacts.append(f"{manifests_dir}/{bound_job.manifest_id}.json")
        if bound_job.result_path:
            artifacts.append(bound_job.result_path)

    if fh_failing:
        events.append({
            "event_type": "fh_gate_pending",
            "data": {
                "edge": job.vector.name,
                "evaluators": [ev.name for ev in fh_failing],
                "criteria": [ev.description for ev in fh_failing],
            },
        })

    return WorkSurface(
        events=tuple(events) + dispatch_surface.events,
        artifacts=tuple(artifacts) + dispatch_surface.artifacts,
        context_consumed=tuple(job.vector.contexts) + dispatch_surface.context_consumed,
        context_emitted=dispatch_surface.context_emitted,
        findings=dispatch_surface.findings,
        attestations=dispatch_surface.attestations,
        metadata=Attrs.coerce(
            {
                **WorkSurface().metadata.to_dict(),
                **dispatch_surface.metadata.to_dict(),
            }
        ),
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
    """Outcome of apply_selection — frame-local invocation plan and provenance."""
    graph_function: str
    materialization_id: str
    frame: InvocationFrame
    initial_state: RecursiveInterpreterState
    evaluator_bundle: tuple[str, ...]
    events: list[dict]


def apply_selection(
    module: Module,
    executable_job: ExecutableJob,
    decision: SelectionDecision,
    candidate: GraphFunction,
    *,
    call_id: str,
    parent_stack: tuple[InvocationFrame, ...] | None = None,
) -> SelectionResult:
    """
    Lawful application of a SelectionDecision.

    REQ-R-ABG3-SELECTION-APPLICATION-002: accept external selection, apply it.
    REQ-R-ABG3-SELECTION-APPLICATION-003: record provenance via workflow_selected.
    REQ-R-ABG3-SELECTION-APPLICATION-004: validate interface before application.

    Per GTL_3_MODULE_DESIGN: interpret owns event emission.
    selection.py is pure — it returns values. This function emits events.

    Returns SelectionResult with a frame-local invocation plan.
    """
    target_vec = executable_job.vector

    # REQ-R-ABG3-SELECTION-APPLICATION-004: validate before application
    if not validate_selection(decision, candidate, target_vec):
        raise ValueError(
            f"apply_selection: selection {decision.graph_function!r} does not "
            f"satisfy contract for vector id {target_vec.id!r}"
        )

    # Materialize the candidate's inner graph via the canonical kernel seam.
    record = materialize_graph_function(
        MaterializationRequest(graph_function=candidate.name),
        module,
        published_graph_functions=(candidate,),
    )
    inner_graph = record.graph
    evaluator_bundle = derive_bundle(record, "evaluator_bundle")
    traversal_surface = build_frame_traversal_surface_from_graph_function(
        candidate,
        vectors=tuple(inner_graph.vectors),
        module=module,
    )
    validate_frame_selection_surface(traversal_surface)
    validate_frame_traversal_surface(traversal_surface)
    frame = open_invocation_frame(
        call_id=call_id,
        parent_job=executable_job,
        parent_key=decision.work_key,
        parent_vector_id=target_vec.id,
        parent_vector=target_vec,
        parent_edge=target_vec.name,
        parent_target=target_vec.target.name,
        graph_function=decision.graph_function,
        graph_function_recursion=candidate.declarations.get("recursion", {}),
        materialization_id=record.materialization_id,
        graph_name=inner_graph.name,
        evaluator_bundle=tuple(evaluator_bundle.values.get("evaluators", ())),
        inner_vectors=tuple(inner_graph.vectors),
        traversal_surface=traversal_surface,
    )

    # REQ-R-ABG3-SELECTION-APPLICATION-003: provenance event
    inner_vector_names = [step.edge for step in frame.steps]
    initial_state = recursive_state_for_frame(
        frame,
        phase="opened",
        stack=(parent_stack + (frame,)) if parent_stack else (frame,),
    )
    events = [{
        "event_type": "workflow_selected",
        "data": {
            "edge": target_vec.name,
            "graph_function": decision.graph_function,
            "selected_by": decision.selected_by,
            "selection_mode": decision.selection_mode,
            "rationale": decision.rationale,
            "work_key": decision.work_key,
            "materialization_id": record.materialization_id,
            "inner_vectors": inner_vector_names,
            "evaluator_bundle": evaluator_bundle.values.get("evaluators", ()),
        },
    }, frame_opened_event(frame), frame_state_updated_event(initial_state), *frame_spawn_events(frame)]

    return SelectionResult(
        graph_function=decision.graph_function,
        materialization_id=record.materialization_id,
        frame=frame,
        initial_state=initial_state,
        evaluator_bundle=tuple(evaluator_bundle.values.get("evaluators", ())),
        events=events,
    )
