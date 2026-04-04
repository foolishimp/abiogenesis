# Validates: REQ-R-ABG2-INTERPRET
# Validates: REQ-R-ABG2-CONVERGENCE
# Validates: REQ-R-ABG2-SELECTION-APPLICATION
# Validates: REQ-R-ABG2-PROVENANCE
# Validates: REQ-R-ABG2-RUN
# Validates: REQ-R-ABG2-PROJECTION
# Validates: REQ-R-ABG2-SELFHOSTING
# Validates: REQ-M-GTL2-MAPPING
"""
M03 engine-kernel integration lane.

This lane exercises real GTL/ABG module, runtime, event, and replay surfaces.

Recursive clause anchors:
- `REQ-R-ABG2-INTERPRET-010`: hidden/local publication fail-closed and lawful
  direct frame-local vector traversal
- `REQ-R-ABG2-INTERPRET-011`: blocked continuation planning, current-frame
  cursor rotation, termination-gated fold-back, and suspend/resume over
  explicit continuation/frontier state
- `REQ-R-ABG2-INTERPRET-012`: checkpoint non-authority and fresh frame-attempt
  identity after reset/reopen
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from gtl.algebra import recurse
from gtl.function_model import CandidateFamily, GraphFunction, RefinementBoundary
from gtl.graph import Graph, GraphVector, Node
from gtl.module_model import Module
from gtl.operator_model import Evaluator, F_D, F_H, F_P, Rule
from gtl.work_model import ContractRef, Job, Role

from genesis.binding import PrecomputedManifest, WorkSurface, Worker, module_to_executable_jobs
from genesis.identity import RuntimeIdentity
from genesis.convergence import convergence_from_precomputed, outcomes_from_precomputed
from genesis.events import EventContext, EventStream, emit
from genesis.frames import deserialize_frame, find_active_frame, resolve_frame_candidate_family
from genesis.install import workspace_bootstrap
from genesis.interpret import (
    Traversal,
    TraversalRuntime,
    derive_operational_gaps,
    plan_next_traversal,
    traverse,
)
from genesis.materialization import (
    CompanionBundle,
    MaterializationRecord,
    MaterializationRequest,
    derive_bundle,
    materialize_graph_function,
)
from genesis.provenance import req_hash, spec_hash_for
from genesis.projection import project
from genesis.run import find_pending_run, run_state, supersede_run
from genesis.selection import SelectionDecision, resolve_candidate_family
from genesis.selfhosting import _bootloader_consistency_report
from genesis.services import Scope, gen_gaps, gen_iterate


BOOTLOADER_PATH = (
    Path(__file__).resolve().parents[2]
    / "code"
    / "gtl_spec"
    / "GTL_BOOTLOADER.md"
)


def _graph_function(name: str, graph: Graph) -> GraphFunction:
    return GraphFunction.from_graph(name=name, graph=graph)


def _precomputed(job, *, failing=(), passing=()) -> PrecomputedManifest:
    return PrecomputedManifest(
        executable_job=job,
        current_asset={},
        failing_evaluators=list(failing),
        passing_evaluators=list(passing),
        fd_results={},
        relevant_contexts={},
    )


def _event_types(stream: EventStream) -> list[str]:
    return [event["event_type"] for event in stream.all_events()]


def _recursive_candidate_chain(
    *,
    depth: int,
    design: Node,
    code: Node,
    evaluator: Evaluator,
) -> tuple[GraphFunction, tuple[GraphFunction, ...]]:
    if depth < 1:
        raise ValueError("depth must be >= 1")

    candidates: list[GraphFunction] = []
    next_candidate = GraphFunction.from_graph(
        name=f"terminal_profile_{depth}",
        graph=Graph(
            name=f"terminal_profile_{depth}",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(GraphVector("design→code", design, code, evaluators=(evaluator,)),),
        ),
    )
    candidates.append(next_candidate)

    for level in range(depth - 1, 0, -1):
        local_family = CandidateFamily(
            name=f"nested_profiles_{level}",
            inputs=(design,),
            outputs=(code,),
            candidates=(next_candidate,),
        )
        recursive_candidate = GraphFunction.from_graph(
            name=f"recursive_profile_{level}",
            graph=Graph(
                name=f"recursive_profile_{level}",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, code),
                vectors=(GraphVector("design→code", design, code, evaluators=(evaluator,)),),
            ),
            declarations={
                "frame_local_surface": {
                    "candidate_families": (local_family,),
                }
            },
        )
        candidates.append(recursive_candidate)
        next_candidate = recursive_candidate

    candidates.reverse()
    return next_candidate, tuple(candidates)


def _minimal_property_module(requirements: list[str] | None = None) -> Module:
    requirements = requirements or ["REQ-M03-PROPERTY-001"]
    design = Node(name="design", schema="Design")
    code = Node(name="code", schema="Code")
    context_ok = Evaluator("context_ok", F_D, binding="exec://python -c 'import sys; sys.exit(0)'")
    code_complete = Evaluator("code_complete", F_P, "code satisfies current requirements")

    vector = GraphVector(
        name="design→code",
        source=design,
        target=code,
        evaluators=(context_ok, code_complete),
    )
    graph = Graph(
        name="m03_property",
        inputs=(design,),
        outputs=(code,),
        nodes=(design, code),
        vectors=(vector,),
    )
    return Module(
        name="m03_property",
        graphs=(graph,),
        refinement_boundaries=(RefinementBoundary(name=vector.name, inputs=(design,), outputs=(code,)),),
        jobs=(Job(name=vector.name, contracts=(ContractRef(kind="graph_vector", target_id=vector.id),)),),
        metadata={"requirements": requirements},
    )


@pytest.mark.integration
class TestM03EngineKernelIntegration:
    def test_candidate_family_selection_opens_frame_and_spawns_child_lineage(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        prototype = Node(name="prototype", schema="Prototype")
        code = Node(name="code", schema="Code")
        constructor = Role(name="constructor")
        review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(review,),
        )
        outer_graph = Graph(
            name="delivery",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(outer,),
        )

        candidate = _graph_function(
            "mvp_profile",
            Graph(
                name="mvp_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(review,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(review,)),
                ),
            ),
        )
        family = CandidateFamily(
            name="design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(candidate,),
        )
        job = Job(
            name=outer.name,
            contracts=(ContractRef(kind="graph_vector", target_id=outer.id),),
            roles=(constructor,),
        )
        module = Module(
            name="m03_selection",
            graphs=(outer_graph,),
            graph_functions=(candidate,),
            candidate_families=(family,),
            jobs=(job,),
            roles=(constructor,),
            metadata={"requirements": ["REQ-M03-SELECT-001"]},
        )

        router_worker = Worker(
            id="gsdlc_router",
            can_execute=module_to_executable_jobs(module),
            role_ids=(constructor.id,),
            authority_ref="runtime://role-dispatch",
        )
        scope = Scope(
            module=module,
            workspace_root=tmp_path,
            runtime_identity=RuntimeIdentity(build_id="codex", backend_id="codex_cli"),
            worker=router_worker,
        )
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]
        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(executable_job),
            workspace_root=tmp_path,
            stream=stream,
            worker=scope.worker,
            spec_hash="spec-m03-selection",
            runtime_identity=scope.runtime_identity,
            build=scope.build,
            work_key=outer.id,
        )

        assert resolve_candidate_family(module, outer.id) == family

        outcome = traverse(
            Traversal(
                work_key=outer.id,
                target=family,
                selection=SelectionDecision(
                    contract_id=outer.id,
                    work_key=outer.id,
                    graph_function="mvp_profile",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="exercise published candidate-family selection",
                ),
                evaluators=outer.evaluators,
            ),
            runtime=runtime,
            surface=WorkSurface(),
        )

        assert outcome.result["status"] == "selected"
        assert outcome.result["graph_function"] == "mvp_profile"
        assert scope.build == "codex"
        published_vectors = {
            vector.name
            for graph in scope.module.graphs
            for vector in graph.vectors
        }
        assert published_vectors == {"design→code"}

        events = stream.all_events()
        workflow_selected = next(event for event in events if event["event_type"] == "workflow_selected")
        assert workflow_selected["data"]["graph_function"] == "mvp_profile"
        assert workflow_selected["data"]["work_key"] == outer.id
        assert workflow_selected["data"]["materialization_id"] == outcome.result["materialization_id"]
        assert workflow_selected["data"]["evaluator_bundle"] == ["profile_review"]
        frame_opened = next(event for event in events if event["event_type"] == "frame_opened")
        assert frame_opened["data"]["frame_id"] == outcome.result["frame_id"]
        assert frame_opened["data"]["frame_attempt_id"] == outcome.result["frame_id"]
        assert frame_opened["data"]["frame_lineage_id"]
        frame_state = next(event for event in events if event["event_type"] == "frame_state_updated")
        assert frame_state["data"]["root_frame_id"] == outcome.result["frame_id"]
        assert frame_state["data"]["continuation"]["phase"] == "opened"
        projected_frame = project(stream, "frame", outcome.result["frame_id"])
        assert projected_frame["status"] == "open"
        assert projected_frame["frame_attempt_id"] == outcome.result["frame_id"]
        assert projected_frame["frame_lineage_id"]
        assert projected_frame["continuation"]["phase"] == "opened"
        assert set(projected_frame["frontier"]["pending_child_keys"]) == {
            f"{outer.id}/design→prototype",
            f"{outer.id}/prototype→code",
        }
        assert projected_frame["frontier"]["completed_child_keys"] == []
        assert projected_frame["stack_depth"] == 1
        assert projected_frame["traversal_surface"]["local_refinement_boundaries"] == []
        assert {step["edge"] for step in projected_frame["child_steps"]} == {
            "design→prototype",
            "prototype→code",
        }

        spawned = [event for event in events if event["event_type"] == "work_spawned"]
        assert {event["data"]["child_key"] for event in spawned} == {
            f"{outer.id}/design→prototype",
            f"{outer.id}/prototype→code",
        }

    def test_interpreter_planning_owns_next_recursive_child_traversal(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        prototype = Node(name="prototype", schema="Prototype")
        code = Node(name="code", schema="Code")
        fd_gap = Evaluator(
            "fd_gap",
            F_D,
            binding="exec://python -c 'import sys; sys.exit(1)'",
        )
        review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(review,),
        )
        candidate = _graph_function(
            "mvp_profile",
            Graph(
                name="mvp_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(fd_gap,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(fd_gap,)),
                ),
            ),
        )
        family = CandidateFamily(
            name="design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(candidate,),
        )
        module = Module(
            name="m03_interpreter_planning",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(candidate,),
            candidate_families=(family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-PLAN-001"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        traverse(
            Traversal(
                work_key=outer.id,
                target=family,
                selection=SelectionDecision(
                    contract_id=outer.id,
                    work_key=outer.id,
                    graph_function="mvp_profile",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="exercise interpreter-owned next traversal planning",
                ),
                evaluators=outer.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=executable_job,
                precomputed=_precomputed(executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-plan",
                work_key=outer.id,
            ),
            surface=WorkSurface(),
        )

        plan = plan_next_traversal(
            module=module,
            workspace_root=tmp_path,
            stream=stream,
            worker=scope.worker,
            jobs=module_to_executable_jobs(module),
            work_keys=(outer.id,),
            requirements=module.metadata["requirements"],
            workflow_version=scope.workflow_version,
            runtime_identity=scope.runtime_identity,
            build=scope.build,
        )

        assert plan.traversal is not None
        assert plan.runtime is not None
        assert plan.traversal.work_key == f"{outer.id}/design→prototype"
        assert plan.runtime.work_key == f"{outer.id}/design→prototype"
        assert plan.runtime.executable_job.vector.name == "design→prototype"

        next_result = gen_iterate(scope, stream)
        assert next_result["status"] == "iterated"
        assert next_result["edge"] == "design→prototype"
        assert next_result["work_key"] == f"{outer.id}/design→prototype"

    def test_interpreter_gap_report_observes_recursive_child_frontier(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        prototype = Node(name="prototype", schema="Prototype")
        code = Node(name="code", schema="Code")
        fd_gap = Evaluator(
            "fd_gap",
            F_D,
            binding="exec://python -c 'import sys; sys.exit(1)'",
        )
        review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(review,),
        )
        candidate = _graph_function(
            "mvp_profile",
            Graph(
                name="mvp_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(fd_gap,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(fd_gap,)),
                ),
            ),
        )
        family = CandidateFamily(
            name="design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(candidate,),
        )
        module = Module(
            name="m03_interpreter_gap_report",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(candidate,),
            candidate_families=(family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-GAPS-001"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        selected = traverse(
            Traversal(
                work_key=outer.id,
                target=family,
                selection=SelectionDecision(
                    contract_id=outer.id,
                    work_key=outer.id,
                    graph_function="mvp_profile",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="exercise interpreter-owned operative gap report",
                ),
                evaluators=outer.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=executable_job,
                precomputed=_precomputed(executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-gap-report",
                work_key=outer.id,
            ),
            surface=WorkSurface(),
        )

        before = project(stream, "frame", selected.result["frame_id"])
        report = derive_operational_gaps(
            module=module,
            workspace_root=tmp_path,
            stream=stream,
            worker=scope.worker,
            jobs=module_to_executable_jobs(module),
            work_keys=(outer.id,),
            requirements=module.metadata["requirements"],
            workflow_version=scope.workflow_version,
            runtime_identity=scope.runtime_identity,
        )
        after = project(stream, "frame", selected.result["frame_id"])

        assert report["open_frames"] == 1
        assert report["converged"] is False
        assert any(
            gap["edge"] == "design→prototype"
            and gap.get("work_key") == f"{outer.id}/design→prototype"
            for gap in report["gaps"]
        )
        assert before["status"] == "open"
        assert after["status"] == "open"

    def test_interpreter_planning_respects_blocked_active_child_continuation(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        prototype = Node(name="prototype", schema="Prototype")
        code = Node(name="code", schema="Code")
        child_review = Evaluator("child_review", F_P, "review intermediate prototype")
        fd_gap = Evaluator(
            "fd_gap",
            F_D,
            binding="exec://python -c 'import sys; sys.exit(1)'",
        )
        review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(review,),
        )
        candidate = _graph_function(
            "review_profile",
            Graph(
                name="review_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(child_review,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(fd_gap,)),
                ),
            ),
        )
        family = CandidateFamily(
            name="design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(candidate,),
        )
        module = Module(
            name="m03_interpreter_blocked_continuation",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(candidate,),
            candidate_families=(family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-PLAN-002"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        traverse(
            Traversal(
                work_key=outer.id,
                target=family,
                selection=SelectionDecision(
                    contract_id=outer.id,
                    work_key=outer.id,
                    graph_function="review_profile",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="exercise blocked continuation planning",
                ),
                evaluators=outer.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=executable_job,
                precomputed=_precomputed(executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-plan-blocked",
                work_key=outer.id,
            ),
            surface=WorkSurface(),
        )

        first_iterate = gen_iterate(scope, stream)
        assert first_iterate["status"] == "iterated"
        assert first_iterate["edge"] == "design→prototype"
        assert first_iterate["blocking_reason"] == "fp_dispatch"

        plan = plan_next_traversal(
            module=module,
            workspace_root=tmp_path,
            stream=stream,
            worker=scope.worker,
            jobs=module_to_executable_jobs(module),
            work_keys=(outer.id,),
            requirements=module.metadata["requirements"],
            workflow_version=scope.workflow_version,
            runtime_identity=scope.runtime_identity,
            build=scope.build,
        )

        assert plan.traversal is not None
        assert plan.runtime is not None
        assert plan.traversal.work_key == f"{outer.id}/design→prototype"
        assert plan.runtime.executable_job.vector.name == "design→prototype"

    # Clause anchor: REQ-R-ABG2-INTERPRET-011
    def test_interpreter_rotates_recursive_cursor_after_current_frame_closes(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        prototype = Node(name="prototype", schema="Prototype")
        code = Node(name="code", schema="Code")
        child_review = Evaluator("child_review", F_P, "review current recursive frontier")
        fd_ok = Evaluator(
            "fd_ok",
            F_D,
            binding="exec://python -c 'import sys; sys.exit(0)'",
        )
        review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(review,),
        )
        blocking_candidate = _graph_function(
            "blocking_profile",
            Graph(
                name="blocking_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(child_review,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(fd_ok,)),
                ),
            ),
        )
        complete_candidate = _graph_function(
            "complete_profile",
            Graph(
                name="complete_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(fd_ok,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(fd_ok,)),
                ),
            ),
        )
        family = CandidateFamily(
            name="design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(blocking_candidate, complete_candidate),
        )
        module = Module(
            name="m03_recursive_cursor_rotation",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(blocking_candidate, complete_candidate),
            candidate_families=(family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-PLAN-003"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        for work_key, candidate_name in (
            ("work/a", "blocking_profile"),
            ("work/b", "complete_profile"),
        ):
            outcome = traverse(
                Traversal(
                    work_key=work_key,
                    target=family,
                    selection=SelectionDecision(
                        contract_id=outer.id,
                        work_key=work_key,
                        graph_function=candidate_name,
                        selected_by="test_policy",
                        selection_mode="explicit",
                        rationale=f"open {candidate_name}",
                    ),
                    evaluators=outer.evaluators,
                ),
                runtime=TraversalRuntime(
                    module=module,
                    executable_job=executable_job,
                    precomputed=_precomputed(executable_job),
                    workspace_root=tmp_path,
                    stream=stream,
                    worker=scope.worker,
                    spec_hash="spec-m03-cursor-rotation",
                    work_key=work_key,
                ),
                surface=WorkSurface(),
            )
            assert outcome.result["status"] == "selected"

        plan = plan_next_traversal(
            module=module,
            workspace_root=tmp_path,
            stream=stream,
            worker=scope.worker,
            jobs=module_to_executable_jobs(module),
            work_keys=("work/a", "work/b"),
            requirements=module.metadata["requirements"],
            workflow_version=scope.workflow_version,
            runtime_identity=scope.runtime_identity,
            build=scope.build,
        )

        assert plan.traversal is not None
        assert plan.runtime is not None
        assert plan.traversal.work_key == "work/a/design→prototype"
        assert plan.runtime.executable_job.vector.name == "design→prototype"

        b_frame_id = next(
            event["data"]["frame_id"]
            for event in stream.all_events()
            if event["event_type"] == "frame_opened" and event["data"]["parent_key"] == "work/b"
        )
        a_frame_id = next(
            event["data"]["frame_id"]
            for event in stream.all_events()
            if event["event_type"] == "frame_opened" and event["data"]["parent_key"] == "work/a"
        )
        assert project(stream, "frame", b_frame_id)["status"] == "closed"
        assert project(stream, "frame", a_frame_id)["status"] == "open"

    # Clause anchor: REQ-R-ABG2-INTERPRET-010
    def test_selection_fails_closed_on_hidden_frame_local_alternatives(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        code = Node(name="code", schema="Code")
        review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(review,),
        )
        hidden_local = _graph_function(
            "hidden_local_profile",
            Graph(
                name="hidden_local_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, code),
                vectors=(GraphVector("design→code", design, code, evaluators=(review,)),),
            ),
        )
        selected_candidate = GraphFunction.from_graph(
            name="selected_profile",
            graph=Graph(
                name="selected_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, code),
                vectors=(GraphVector("design→code", design, code, evaluators=(review,)),),
            ),
            declarations={
                "frame_local_surface": {
                    "graph_functions": (hidden_local,),
                }
            },
        )
        family = CandidateFamily(
            name="outer_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(selected_candidate,),
        )
        module = Module(
            name="m03_hidden_frame_selection_surface",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(selected_candidate, hidden_local),
            candidate_families=(family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-HIDDEN-FRAME-SELECTION-001"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        with pytest.raises(ValueError, match="hidden contracts"):
            traverse(
                Traversal(
                    work_key=outer.id,
                    target=family,
                    selection=SelectionDecision(
                        contract_id=outer.id,
                        work_key=outer.id,
                        graph_function="selected_profile",
                        selected_by="test_policy",
                        selection_mode="explicit",
                        rationale="hidden local alternatives must fail closed at selection time",
                    ),
                    evaluators=outer.evaluators,
                ),
                runtime=TraversalRuntime(
                    module=module,
                    executable_job=executable_job,
                    precomputed=_precomputed(executable_job),
                    workspace_root=tmp_path,
                    stream=stream,
                    worker=scope.worker,
                    spec_hash="spec-m03-hidden-frame-selection",
                    work_key=outer.id,
                ),
                surface=WorkSurface(),
            )

    def test_frame_foldback_rebinds_parent_without_auto_certifying_parent(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        prototype = Node(name="prototype", schema="Prototype")
        code = Node(name="code", schema="Code")
        fd_ok = Evaluator(
            "fd_ok",
            F_D,
            binding="exec://python -c 'import sys; sys.exit(0)'",
        )
        outer_review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(outer_review,),
        )
        candidate = _graph_function(
            "fd_profile",
            Graph(
                name="fd_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(fd_ok,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(fd_ok,)),
                ),
            ),
        )
        family = CandidateFamily(
            name="design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(candidate,),
        )
        module = Module(
            name="m03_frame_foldback",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(candidate,),
            candidate_families=(family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-FOLDBACK-001"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        selected = traverse(
            Traversal(
                work_key=outer.id,
                target=family,
                selection=SelectionDecision(
                    contract_id=outer.id,
                    work_key=outer.id,
                    graph_function="fd_profile",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="exercise child closure and parent fold-back",
                ),
                evaluators=outer.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=executable_job,
                precomputed=_precomputed(executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-foldback",
                work_key=outer.id,
            ),
            surface=WorkSurface(),
        )

        frame_id = selected.result["frame_id"]
        before = project(stream, "frame", frame_id)
        assert before["status"] == "open"

        gaps = gen_gaps(scope, stream)
        assert gaps["converged"] is False
        assert gaps["total_delta"] == 0

        events = stream.all_events()
        assert not any(event["event_type"] == "frame_foldback" for event in events)
        assert not any(event["event_type"] == "frame_rebound" for event in events)
        assert not any(event["event_type"] == "frame_closed" for event in events)
        assert not any(
            event["event_type"] == "edge_converged"
            and event["data"].get("work_key") == outer.id
            and event["data"].get("edge") == "design→code"
            for event in events
        )

        next_result = gen_iterate(scope, stream)
        assert next_result["status"] == "iterated"
        assert next_result["edge"] == "design→code"
        assert next_result["work_key"] == outer.id
        assert next_result["blocking_reason"] == "fp_dispatch"
        after = project(stream, "frame", frame_id)
        assert after["status"] == "closed"
        assert after["rebound"] is True
        assert {step["status"] for step in after["child_steps"]} == {"converged"}
        events = stream.all_events()
        assert any(event["event_type"] == "frame_foldback" for event in events)
        assert any(event["event_type"] == "frame_rebound" for event in events)
        assert any(event["event_type"] == "frame_closed" for event in events)

    # Clause anchors: REQ-R-ABG2-INTERPRET-011, REQ-R-ABG2-INTERPRET-012
    def test_recursive_frame_emits_suspend_and_resume_events(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        prototype = Node(name="prototype", schema="Prototype")
        code = Node(name="code", schema="Code")
        child_review = Evaluator("child_review", F_P, "review intermediate prototype")
        fd_ok = Evaluator(
            "fd_ok",
            F_D,
            binding="exec://python -c 'import sys; sys.exit(0)'",
        )
        outer_review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(outer_review,),
        )
        candidate = _graph_function(
            "review_profile",
            Graph(
                name="review_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(child_review,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(fd_ok,)),
                ),
            ),
        )
        family = CandidateFamily(
            name="design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(candidate,),
        )
        module = Module(
            name="m03_recursive_suspend_resume",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(candidate,),
            candidate_families=(family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-SUSPEND-001"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        selected = traverse(
            Traversal(
                work_key=outer.id,
                target=family,
                selection=SelectionDecision(
                    contract_id=outer.id,
                    work_key=outer.id,
                    graph_function="review_profile",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="exercise recursive suspension and resume lifecycle",
                ),
                evaluators=outer.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=executable_job,
                precomputed=_precomputed(executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-suspend",
                work_key=outer.id,
            ),
            surface=WorkSurface(),
        )

        first_iterate = gen_iterate(scope, stream)
        assert first_iterate["status"] == "iterated"
        assert first_iterate["edge"] == "design→prototype"
        assert first_iterate["work_key"] == f"{outer.id}/design→prototype"
        assert first_iterate["blocking_reason"] == "fp_dispatch"

        suspended = next(
            event for event in stream.all_events()
            if event["event_type"] == "frame_suspended"
            and event["data"].get("frame_id") == selected.result["frame_id"]
        )
        assert suspended["data"]["blocked_on"] == [f"{outer.id}/design→prototype"]
        assert suspended["data"]["checkpoint_id"] == first_iterate["run_id"]

        active = find_active_frame(stream.all_events(), f"{outer.id}/design→prototype")
        assert active is not None
        _, step = active
        stream.append(
            "assessed",
            {
                "kind": "fp",
                "edge": step.edge,
                "evaluator": "child_review",
                "result": "pass",
                "spec_hash": spec_hash_for(
                    workflow_version=scope.workflow_version,
                    executable_job=step.executable_job,
                    requirements=module.metadata["requirements"],
                ),
                "work_key": step.child_key,
            },
            context=EventContext(
                workflow_version=scope.workflow_version,
                work_key=step.child_key,
            ),
        )

        second_iterate = gen_iterate(scope, stream)
        assert second_iterate["status"] == "iterated"
        assert second_iterate["edge"] == "design→code"
        assert second_iterate["work_key"] == outer.id

        resumed = next(
            event for event in stream.all_events()
            if event["event_type"] == "frame_resumed"
            and event["data"].get("frame_id") == selected.result["frame_id"]
        )
        assert resumed["data"]["checkpoint_id"] == suspended["data"]["checkpoint_id"]
        assert project(stream, "frame", selected.result["frame_id"])["suspended"] is False

    # Clause anchor: REQ-R-ABG2-INTERPRET-011
    def test_recursive_frame_waits_for_declared_termination_before_foldback(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        prototype = Node(name="prototype", schema="Prototype")
        code = Node(name="code", schema="Code")
        fd_ok = Evaluator(
            "fd_ok",
            F_D,
            binding="exec://python -c 'import sys; sys.exit(0)'",
        )
        termination_ready = Evaluator(
            "termination_ready",
            F_D,
            binding=(
                "exec://python -c \"from pathlib import Path; import sys; "
                "sys.exit(0 if Path('.ai-workspace/termination.ready').exists() else 1)\""
            ),
        )
        outer_review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(outer_review,),
        )
        base_candidate = _graph_function(
            "fd_profile",
            Graph(
                name="fd_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(fd_ok,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(fd_ok,)),
                ),
            ),
        )
        recursive_candidate = recurse(
            base_candidate,
            termination_ready,
            foldback={
                "binding": "outer_contract",
                "mode": "rebind",
                "requires_parent_evaluation": True,
            },
        )
        family = CandidateFamily(
            name="design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(recursive_candidate,),
        )
        module = Module(
            name="m03_recursive_termination_gate",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(recursive_candidate,),
            candidate_families=(family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-TERMINATION-001"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        selected = traverse(
            Traversal(
                work_key=outer.id,
                target=family,
                selection=SelectionDecision(
                    contract_id=outer.id,
                    work_key=outer.id,
                    graph_function=recursive_candidate.name,
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="termination must gate fold-back closure",
                ),
                evaluators=outer.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=executable_job,
                precomputed=_precomputed(executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-termination",
                work_key=outer.id,
            ),
            surface=WorkSurface(),
        )

        frame_id = selected.result["frame_id"]
        first_gaps = gen_gaps(scope, stream)
        assert first_gaps["converged"] is False
        first_events = stream.all_events()
        assert not any(event["event_type"] == "frame_foldback" for event in first_events)
        assert not any(event["event_type"] == "frame_rebound" for event in first_events)
        assert not any(event["event_type"] == "frame_closed" for event in first_events)
        first_frame = project(stream, "frame", frame_id)
        assert first_frame["status"] == "open"
        assert first_frame["continuation"]["phase"] == "opened"
        assert set(first_frame["frontier"]["pending_child_keys"]) == {
            f"{outer.id}/design→prototype",
            f"{outer.id}/prototype→code",
        }
        assert first_frame["frontier"]["completed_child_keys"] == []
        first_iterate = gen_iterate(scope, stream)
        assert first_iterate["status"] == "in_progress"
        assert first_iterate["open_frames"] == 1
        pending_frame = project(stream, "frame", frame_id)
        assert pending_frame["continuation"]["phase"] == "foldback_pending"
        assert pending_frame["frontier"]["pending_child_keys"] == []
        assert set(pending_frame["frontier"]["completed_child_keys"]) == {
            f"{outer.id}/design→prototype",
            f"{outer.id}/prototype→code",
        }
        assert {step["status"] for step in first_frame["child_steps"]} == {"converged"}

        (tmp_path / ".ai-workspace" / "termination.ready").write_text("ready\n", encoding="utf-8")

        second_gaps = gen_gaps(scope, stream)
        assert second_gaps["converged"] is False
        second_events = stream.all_events()
        assert not any(event["event_type"] == "frame_closed" for event in second_events)
        second_iterate = gen_iterate(scope, stream)
        assert second_iterate["status"] == "iterated"
        assert second_iterate["edge"] == "design→code"
        assert second_iterate["blocking_reason"] == "fp_dispatch"
        second_events = stream.all_events()
        assert any(event["event_type"] == "frame_foldback" for event in second_events)
        assert any(event["event_type"] == "frame_rebound" for event in second_events)
        assert any(event["event_type"] == "frame_closed" for event in second_events)
        rebound = next(
            event for event in second_events
            if event["event_type"] == "frame_rebound"
            and event["data"].get("work_key") == outer.id
        )
        assert rebound["data"]["payload"]["binding"] == "outer_contract"
        second_frame = project(stream, "frame", frame_id)
        assert second_frame["status"] == "closed"
        assert second_frame["continuation"]["phase"] == "closed"
        assert second_frame["frontier"]["pending_child_keys"] == []
        assert set(second_frame["frontier"]["completed_child_keys"]) == {
            f"{outer.id}/design→prototype",
            f"{outer.id}/prototype→code",
        }

    # Clause anchor: REQ-R-ABG2-INTERPRET-012
    def test_reset_invalidates_stale_frame_attempt_and_reopen_mints_fresh_attempt(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        prototype = Node(name="prototype", schema="Prototype")
        code = Node(name="code", schema="Code")
        review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(review,),
        )
        candidate = _graph_function(
            "mvp_profile",
            Graph(
                name="mvp_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(review,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(review,)),
                ),
            ),
        )
        family = CandidateFamily(
            name="design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(candidate,),
        )
        module = Module(
            name="m03_frame_reset",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(candidate,),
            candidate_families=(family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-RESET-001"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        traversal = Traversal(
            work_key=outer.id,
            target=family,
            selection=SelectionDecision(
                contract_id=outer.id,
                work_key=outer.id,
                graph_function="mvp_profile",
                selected_by="test_policy",
                selection_mode="explicit",
                rationale="open first frame attempt",
            ),
            evaluators=outer.evaluators,
        )
        first = traverse(
            traversal,
            runtime=TraversalRuntime(
                module=module,
                executable_job=executable_job,
                precomputed=_precomputed(executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-reset",
                work_key=outer.id,
            ),
            surface=WorkSurface(),
        )
        first_state = project(stream, "frame", first.result["frame_id"])
        assert first_state["status"] == "open"

        stream.append("reset", {"scope": "work_key", "work_key": outer.id})
        stale_state = project(stream, "frame", first.result["frame_id"])
        assert stale_state["status"] == "stale"

        second = traverse(
            Traversal(
                work_key=outer.id,
                target=family,
                selection=SelectionDecision(
                    contract_id=outer.id,
                    work_key=outer.id,
                    graph_function="mvp_profile",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="reopen after reset",
                ),
                evaluators=outer.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=executable_job,
                precomputed=_precomputed(executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-reset",
                work_key=outer.id,
            ),
            surface=WorkSurface(),
        )
        second_state = project(stream, "frame", second.result["frame_id"])
        assert second_state["status"] == "open"
        assert second_state["frame_lineage_id"] == stale_state["frame_lineage_id"]
        assert second_state["frame_attempt_id"] != stale_state["frame_attempt_id"]

    def test_frame_rebound_uses_declared_recursive_foldback_binding(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        prototype = Node(name="prototype", schema="Prototype")
        code = Node(name="code", schema="Code")
        fd_ok = Evaluator(
            "fd_ok",
            F_D,
            binding="exec://python -c 'import sys; sys.exit(0)'",
        )
        recurse_done = Evaluator(
            "done",
            F_D,
            binding="exec://python -c 'import sys; sys.exit(0)'",
        )
        outer_review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(outer_review,),
        )
        base_candidate = _graph_function(
            "fd_profile",
            Graph(
                name="fd_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(fd_ok,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(fd_ok,)),
                ),
            ),
        )
        recursive_candidate = recurse(
            base_candidate,
            recurse_done,
            foldback={
                "binding": "outer_contract",
                "mode": "rebind",
                "requires_parent_evaluation": True,
            },
        )
        family = CandidateFamily(
            name="design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(recursive_candidate,),
        )
        module = Module(
            name="m03_recursive_foldback_decl",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(recursive_candidate,),
            candidate_families=(family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-RECURSE-001"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        selected = traverse(
            Traversal(
                work_key=outer.id,
                target=family,
                selection=SelectionDecision(
                    contract_id=outer.id,
                    work_key=outer.id,
                    graph_function=recursive_candidate.name,
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="exercise declared recurse foldback binding",
                ),
                evaluators=outer.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=executable_job,
                precomputed=_precomputed(executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-recurse",
                work_key=outer.id,
            ),
            surface=WorkSurface(),
        )

        assert selected.result["status"] == "selected"
        gaps = gen_gaps(scope, stream)
        assert gaps["converged"] is False
        assert not any(
            event["event_type"] == "frame_rebound"
            and event["data"].get("work_key") == outer.id
            for event in stream.all_events()
        )
        progress = gen_iterate(scope, stream)
        assert progress["status"] == "iterated"

        rebound = next(
            event for event in stream.all_events()
            if event["event_type"] == "frame_rebound"
            and event["data"].get("work_key") == outer.id
        )
        assert rebound["data"]["payload"]["binding"] == "outer_contract"

    def test_frame_local_recursive_candidate_uses_local_recursion_declaration(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        prototype = Node(name="prototype", schema="Prototype")
        code = Node(name="code", schema="Code")
        fd_ok = Evaluator(
            "fd_ok",
            F_D,
            binding="exec://python -c 'import sys; sys.exit(0)'",
        )
        done = Evaluator(
            "done",
            F_D,
            binding="exec://python -c 'import sys; sys.exit(0)'",
        )
        review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(review,),
        )
        base_candidate = _graph_function(
            "local_recursive_base",
            Graph(
                name="local_recursive_base",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, prototype, code),
                vectors=(
                    GraphVector("design→prototype", design, prototype, evaluators=(fd_ok,)),
                    GraphVector("prototype→code", prototype, code, evaluators=(fd_ok,)),
                ),
            ),
        )
        local_recursive_candidate = recurse(
            base_candidate,
            done,
            foldback={
                "binding": "local_contract",
                "mode": "rebind",
                "requires_parent_evaluation": True,
            },
        )
        local_family = CandidateFamily(
            name="nested_local_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(local_recursive_candidate,),
        )
        outer_profile = GraphFunction.from_graph(
            name="outer_profile",
            graph=Graph(
                name="outer_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, code),
                vectors=(GraphVector("design→code", design, code, evaluators=(review,)),),
            ),
            declarations={
                "frame_local_surface": {
                    "candidate_families": (local_family,),
                }
            },
        )
        outer_family = CandidateFamily(
            name="outer_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(outer_profile,),
        )
        module = Module(
            name="m03_frame_local_recursive_decl",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(outer_profile,),
            candidate_families=(outer_family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-RECURSE-LOCAL-001"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        first = traverse(
            Traversal(
                work_key=outer.id,
                target=outer_family,
                selection=SelectionDecision(
                    contract_id=outer.id,
                    work_key=outer.id,
                    graph_function="outer_profile",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="open outer frame-local carrier",
                ),
                evaluators=outer.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=executable_job,
                precomputed=_precomputed(executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-local-recursive",
                work_key=outer.id,
            ),
            surface=WorkSurface(),
        )

        child_key = f"{outer.id}/design→code"
        active = find_active_frame(stream, child_key)
        assert active is not None
        frame, step = active
        local_family_from_frame = resolve_frame_candidate_family(
            frame.traversal_surface,
            step.executable_job.vector.id,
        )
        assert local_family_from_frame is not None

        second = traverse(
            Traversal(
                work_key=child_key,
                target=local_family_from_frame,
                selection=SelectionDecision(
                    contract_id=step.executable_job.vector.id,
                    work_key=child_key,
                    graph_function=local_recursive_candidate.name,
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="select frame-local recursive candidate",
                ),
                evaluators=step.executable_job.vector.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=step.executable_job,
                precomputed=_precomputed(step.executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-local-recursive",
                work_key=child_key,
            ),
            surface=WorkSurface(),
        )

        assert first.result["status"] == "selected"
        assert second.result["status"] == "selected"

        for _ in range(4):
            gen_iterate(scope, stream)
            if any(
                event["event_type"] == "frame_rebound"
                and event["data"].get("frame_id") == second.result["frame_id"]
                for event in stream.all_events()
            ):
                break

        rebound = next(
            event for event in stream.all_events()
            if event["event_type"] == "frame_rebound"
            and event["data"].get("frame_id") == second.result["frame_id"]
        )
        assert rebound["data"]["payload"]["binding"] == "local_contract"

    def test_nested_frame_local_candidate_family_can_open_second_recursive_frame(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        code = Node(name="code", schema="Code")
        review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(review,),
        )

        terminal_profile = _graph_function(
            "terminal_profile",
            Graph(
                name="terminal_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, code),
                vectors=(GraphVector("design→code", design, code, evaluators=(review,)),),
            ),
        )
        local_family = CandidateFamily(
            name="nested_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(terminal_profile,),
        )
        recursive_profile = _graph_function(
            "recursive_profile",
            Graph(
                name="recursive_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, code),
                vectors=(GraphVector("design→code", design, code, evaluators=(review,)),),
            ),
        )
        recursive_profile = GraphFunction.from_graph(
            name=recursive_profile.name,
            graph=recursive_profile.materialize(),
            declarations={
                "frame_local_surface": {
                    "candidate_families": (local_family,),
                }
            },
        )
        outer_family = CandidateFamily(
            name="outer_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(recursive_profile,),
        )

        module = Module(
            name="m03_nested_frame_local_selection",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(recursive_profile,),
            candidate_families=(outer_family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": ["REQ-M03-NESTED-001"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        first = traverse(
            Traversal(
                work_key=outer.id,
                target=outer_family,
                selection=SelectionDecision(
                    contract_id=outer.id,
                    work_key=outer.id,
                    graph_function="recursive_profile",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="open first recursive frame",
                ),
                evaluators=outer.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=executable_job,
                precomputed=_precomputed(executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-nested",
                work_key=outer.id,
            ),
            surface=WorkSurface(),
        )

        child_key = f"{outer.id}/design→code"
        active = find_active_frame(stream.all_events(), child_key)
        assert active is not None
        frame, step = active
        local_family_from_frame = resolve_frame_candidate_family(
            frame.traversal_surface,
            step.executable_job.vector.id,
        )
        assert local_family_from_frame is not None
        assert tuple(candidate.name for candidate in local_family_from_frame.candidates) == ("terminal_profile",)

        second = traverse(
            Traversal(
                work_key=child_key,
                target=local_family_from_frame,
                selection=SelectionDecision(
                    contract_id=step.executable_job.vector.id,
                    work_key=child_key,
                    graph_function="terminal_profile",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="use frame-local published candidate family",
                ),
                evaluators=step.executable_job.vector.evaluators,
            ),
            runtime=TraversalRuntime(
                module=module,
                executable_job=step.executable_job,
                precomputed=_precomputed(step.executable_job),
                workspace_root=tmp_path,
                stream=stream,
                worker=scope.worker,
                spec_hash="spec-m03-nested",
                work_key=child_key,
            ),
            surface=WorkSurface(),
        )

        assert first.result["status"] == "selected"
        assert second.result["status"] == "selected"
        assert second.result["frame_lineage_id"] != first.result["frame_lineage_id"]
        nested_frame = project(stream, "frame", second.result["frame_id"])
        assert nested_frame["status"] == "open"
        assert nested_frame["stack_depth"] == 2

    @pytest.mark.parametrize("depth", [10, 100])
    def test_explicit_recursive_selection_chain_qualifies_nested_depth(self, tmp_path: Path, depth: int) -> None:
        design = Node(name="design", schema="DesignDoc")
        code = Node(name="code", schema="Code")
        review = Evaluator("profile_review", F_P, "profile satisfies current contract")

        root_candidate, all_candidates = _recursive_candidate_chain(
            depth=depth,
            design=design,
            code=code,
            evaluator=review,
        )
        outer = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(review,),
        )
        outer_family = CandidateFamily(
            name="outer_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(root_candidate,),
        )
        module = Module(
            name=f"m03_recursive_depth_{depth}",
            graphs=(
                Graph(
                    name="delivery",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(outer,),
                ),
            ),
            graph_functions=(root_candidate,),
            candidate_families=(outer_family,),
            jobs=(Job(name=outer.name, contracts=(ContractRef(kind="graph_vector", target_id=outer.id),)),),
            metadata={"requirements": [f"REQ-M03-DEPTH-{depth:03d}"]},
        )
        scope = Scope(module=module, workspace_root=tmp_path)
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]

        current_work_key = outer.id
        current_target = outer_family
        current_job = executable_job
        opened_frames: list[str] = []
        for index in range(depth):
            candidate_name = (
                root_candidate.name
                if index == 0
                else f"recursive_profile_{index + 1}" if index < depth - 1 else f"terminal_profile_{depth}"
            )
            selected = traverse(
                Traversal(
                    work_key=current_work_key,
                    target=current_target,
                    selection=SelectionDecision(
                        contract_id=current_job.vector.id,
                        work_key=current_work_key,
                        graph_function=candidate_name,
                        selected_by="test_policy",
                        selection_mode="explicit",
                        rationale=f"open recursive depth {index + 1}",
                    ),
                    evaluators=current_job.vector.evaluators,
                ),
                runtime=TraversalRuntime(
                    module=module,
                    executable_job=current_job,
                    precomputed=_precomputed(current_job),
                    workspace_root=tmp_path,
                    stream=stream,
                    worker=scope.worker,
                    spec_hash=f"spec-m03-depth-{depth}",
                    work_key=current_work_key,
                ),
                surface=WorkSurface(),
            )
            assert selected.result["status"] == "selected"
            opened_frames.append(selected.result["frame_id"])

            if index == depth - 1:
                break

            frame_opened = next(
                event
                for event in selected.surface.events
                if event["event_type"] == "frame_opened"
            )
            frame = deserialize_frame(frame_opened["data"])
            current_work_key = f"{current_work_key}/design→code"
            step = next(
                frame_step for frame_step in frame.steps
                if frame_step.child_key == current_work_key
            )
            current_target = resolve_frame_candidate_family(
                frame.traversal_surface,
                step.executable_job.vector.id,
            )
            assert current_target is not None
            current_job = step.executable_job

        assert len(opened_frames) == depth
        deepest = project(stream, "frame", opened_frames[-1])
        assert deepest["status"] == "open"
        assert deepest["frame_attempt_id"] == opened_frames[-1]
        assert deepest["stack_depth"] == depth

    def test_materialization_kernel_records_replayable_identity_and_derived_bundles(self) -> None:
        design = Node(name="design", schema="DesignDoc")
        code = Node(name="code", schema="Code")
        quality_gate = Evaluator("quality_gate", F_D, binding="exec://python -c 'import sys; sys.exit(0)'")
        review = Evaluator("review", F_P, "review closes the remaining ambiguity")
        graph = Graph(
            name="delivery_profile",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(GraphVector("design→code", design, code, evaluators=(quality_gate, review)),),
        )
        function = _graph_function("delivery_profile", graph)
        module = Module(
            name="m03_materialization",
            graph_functions=(function,),
        )

        request = MaterializationRequest(graph_function="delivery_profile")
        record = materialize_graph_function(request, module)
        selected_subgraph = derive_bundle(record, "selected_subgraph")
        evaluator_bundle = derive_bundle(record, "evaluator_bundle")
        profile_manifest = derive_bundle(record, "profile_manifest")

        assert isinstance(record, MaterializationRecord)
        assert record.graph == graph
        assert record.graph_function == "delivery_profile"
        assert record.template_kind == "inline_graph"
        assert record.parameters == request.parameters
        assert isinstance(selected_subgraph, CompanionBundle)
        assert selected_subgraph.values["vectors"] == ("design→code",)
        assert evaluator_bundle.values["evaluators"] == ("quality_gate", "review")
        assert profile_manifest.values["template_ref"] == function.template.ref

    def test_materialization_kernel_fails_closed_on_undeclared_profiles_and_parameters(self) -> None:
        design = Node(name="design", schema="DesignDoc")
        code = Node(name="code", schema="Code")
        graph = Graph(
            name="delivery_profile",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(GraphVector("design→code", design, code),),
        )
        function = _graph_function("delivery_profile", graph)
        module = Module(name="m03_materialization", graph_functions=(function,))

        with pytest.raises(ValueError, match="profiles are not yet declared"):
            materialize_graph_function(
                MaterializationRequest(graph_function="delivery_profile", profile="dev"),
                module,
            )
        with pytest.raises(ValueError, match="structural parameters are not yet declared"):
            materialize_graph_function(
                MaterializationRequest(graph_function="delivery_profile", parameters={"mode": "strict"}),
                module,
            )

    def test_fp_dispatch_callback_can_return_structured_work_surface(self, tmp_path: Path) -> None:
        module = _minimal_property_module(["REQ-M03-DISPATCH-001"])
        executable_job = module_to_executable_jobs(module)[0]
        fp_evaluator = next(
            evaluator for evaluator in executable_job.vector.evaluators if evaluator.regime is F_P
        )
        stream = workspace_bootstrap(tmp_path)

        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(executable_job, failing=(fp_evaluator,)),
            workspace_root=tmp_path,
            stream=stream,
            worker=Worker(id="router", can_execute=[executable_job]),
            spec_hash="spec-m03-dispatch",
            on_fp_dispatch=lambda _bound_job: WorkSurface(
                events=(
                    {
                        "event_type": "run_failed",
                        "data": {
                            "edge": executable_job.vector.name,
                            "failure_class": "transport_failure",
                        },
                    },
                ),
                artifacts=("dispatch/report.json",),
                findings=({"kind": "transport_failure"},),
                metadata={"dispatch_failure": "transport_failure"},
            ),
        )

        outcome = traverse(
            Traversal(
                work_key=executable_job.vector.id,
                target=module.refinement_boundaries[0],
                evaluators=executable_job.vector.evaluators,
            ),
            runtime=runtime,
            surface=WorkSurface(),
        )

        event_types = [event["event_type"] for event in outcome.surface.events]
        assert event_types == ["fp_dispatched", "run_failed"]
        assert "dispatch/report.json" in outcome.surface.artifacts
        assert any(artifact.endswith(".json") for artifact in outcome.surface.artifacts)
        assert outcome.surface.findings == ({"kind": "transport_failure"},)
        assert outcome.surface.metadata["dispatch_failure"] == "transport_failure"

    def test_bootloader_consistency_uses_structural_axioms_and_type_surface(self) -> None:
        report = _bootloader_consistency_report("gtl", str(BOOTLOADER_PATH))

        assert report["passes"] is True
        assert report["missing_axioms"] == []
        assert report["missing_type_surface"] == []
        assert report["missing_regimes"] == []
        assert report["module_mismatches"] == []

    def test_bootloader_consistency_detects_missing_type_surface_row_even_when_name_still_appears(
        self,
        tmp_path: Path,
    ) -> None:
        bootloader = BOOTLOADER_PATH.read_text(encoding="utf-8")
        broken_bootloader = bootloader.replace(
            "| `GraphFunction` | `gtl.function_model` | Reusable workflow template or program |\n",
            "",
        )
        broken_path = tmp_path / "GTL_BOOTLOADER.md"
        broken_path.write_text(broken_bootloader, encoding="utf-8")

        report = _bootloader_consistency_report("gtl", str(broken_path))

        assert report["passes"] is False
        assert "GraphFunction" in report["missing_type_surface"]

    def test_iterated_traversal_emits_run_binding_dispatch_and_replay_state(self, tmp_path: Path) -> None:
        raw_contract = Node(name="raw_contract", schema="ContractInput")
        discovered_context = Node(name="discovered_context", schema="DesignContext")
        constructor = Role(name="constructor")
        context_ok = Evaluator("context_ok", F_D, binding="exec://python -c 'import sys; sys.exit(0)'")
        context_sufficient = Evaluator("context_sufficient", F_P, "context is sufficient to proceed")

        vector = GraphVector(
            name="raw_contract→discovered_context",
            source=raw_contract,
            target=discovered_context,
            evaluators=(context_ok, context_sufficient),
        )
        graph = Graph(
            name="m03_iterate",
            inputs=(raw_contract,),
            outputs=(discovered_context,),
            nodes=(raw_contract, discovered_context),
            vectors=(vector,),
        )
        boundary = RefinementBoundary(
            name=vector.name,
            inputs=(raw_contract,),
            outputs=(discovered_context,),
        )
        job = Job(
            name=vector.name,
            contracts=(ContractRef(kind="graph_vector", target_id=vector.id),),
            roles=(constructor,),
        )
        module = Module(
            name="m03_iterate",
            graphs=(graph,),
            refinement_boundaries=(boundary,),
            jobs=(job,),
            roles=(constructor,),
            metadata={"requirements": ["REQ-M03-ITERATE-001"]},
        )

        scope = Scope(module=module, workspace_root=tmp_path, build="kernel_router")
        scope.worker.authority_ref = "module://M03-engine-kernel"

        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]
        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(
                executable_job,
                failing=(context_sufficient,),
                passing=(context_ok,),
            ),
            workspace_root=tmp_path,
            stream=stream,
            worker=scope.worker,
            spec_hash="spec-m03-iterate",
            build=scope.build,
            work_key=vector.id,
            workflow_version="m03.test@2.0.0",
            run_id="run-m03-fp",
        )

        outcome = traverse(
            Traversal(
                work_key=vector.id,
                target=boundary,
                evaluators=vector.evaluators,
            ),
            runtime=runtime,
            surface=WorkSurface(),
        )

        assert outcome.result["status"] == "iterated"
        assert outcome.result["blocking_reason"] == "fp_dispatch"
        manifest_path = Path(outcome.result["fp_manifest_path"])
        assert manifest_path.exists()

        event_types = _event_types(stream)
        assert event_types[:4] == ["run_bound", "run_started", "edge_started", "fp_dispatched"]
        for event in stream.all_events():
            assert event["data"]["workflow_version"] == "m03.test@2.0.0"
            assert event["data"]["work_key"] == vector.id
            assert event["data"]["run_id"] == "run-m03-fp"

        pending = find_pending_run(stream.all_events(), vector.name, work_key=vector.id)
        assert pending is not None
        assert pending.run_id == "run-m03-fp"
        assert pending.state == "dispatched"

        derived_run = run_state(stream.all_events(), "run-m03-fp")
        assert derived_run is not None
        assert derived_run.worker_id == scope.worker.id
        assert derived_run.role_id == constructor.id
        assert derived_run.authority_ref == "module://M03-engine-kernel"
        assert derived_run.work_key == vector.id

        projected = project(stream, discovered_context.name, "current", work_key=vector.id)
        assert projected["status"] == "in_progress"
        assert projected["work_key"] == vector.id

        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        assert manifest["run_id"] == "run-m03-fp"

    def test_iterated_traversal_preserves_router_and_selected_execution_identity(self, tmp_path: Path) -> None:
        raw_contract = Node(name="raw_contract", schema="ContractInput")
        discovered_context = Node(name="discovered_context", schema="DesignContext")
        constructor = Role(name="constructor")
        context_ok = Evaluator("context_ok", F_D, binding="exec://python -c 'import sys; sys.exit(0)'")
        context_sufficient = Evaluator("context_sufficient", F_P, "context is sufficient to proceed")

        vector = GraphVector(
            name="raw_contract→discovered_context",
            source=raw_contract,
            target=discovered_context,
            evaluators=(context_ok, context_sufficient),
        )
        graph = Graph(
            name="m03_router_dispatch",
            inputs=(raw_contract,),
            outputs=(discovered_context,),
            nodes=(raw_contract, discovered_context),
            vectors=(vector,),
        )
        boundary = RefinementBoundary(
            name=vector.name,
            inputs=(raw_contract,),
            outputs=(discovered_context,),
        )
        job = Job(
            name=vector.name,
            contracts=(ContractRef(kind="graph_vector", target_id=vector.id),),
            roles=(constructor,),
        )
        module = Module(
            name="m03_router_dispatch",
            graphs=(graph,),
            refinement_boundaries=(boundary,),
            jobs=(job,),
            roles=(constructor,),
            metadata={"requirements": ["REQ-R-ABG2-BINDING-006"]},
        )

        router_worker = Worker(
            id="abiogenesis_python_router",
            can_execute=module_to_executable_jobs(module),
            role_ids=(constructor.id,),
            authority_ref="runtime://role-dispatch",
        )
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]
        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(
                executable_job,
                failing=(context_sufficient,),
                passing=(context_ok,),
            ),
            workspace_root=tmp_path,
            stream=stream,
            worker=router_worker,
            spec_hash="spec-m03-router-dispatch",
            runtime_identity=RuntimeIdentity(
                build_id="abiogenesis_python_router",
                worker_id="codex",
                backend_id="codex",
                authority_ref="runtime://role-dispatch",
                assignment_source="runtime://session-override/constructor",
                resolved_runtime_ref="runtime://resolved/constructor/codex",
            ),
            work_key=vector.id,
            workflow_version="m03.test@2.0.0",
            run_id="run-m03-router-dispatch",
        )

        outcome = traverse(
            Traversal(
                work_key=vector.id,
                target=boundary,
                evaluators=vector.evaluators,
            ),
            runtime=runtime,
            surface=WorkSurface(),
        )

        assert outcome.result["status"] == "iterated"
        events = stream.all_events()
        relevant = [
            event for event in events
            if event["event_type"] in {"run_bound", "run_started", "edge_started", "fp_dispatched"}
        ]
        assert [event["event_type"] for event in relevant] == [
            "run_bound",
            "run_started",
            "edge_started",
            "fp_dispatched",
        ]
        for event in relevant:
            data = event["data"]
            assert data["worker_id"] == "abiogenesis_python_router"
            assert data["selected_worker_id"] == "codex"
            assert data["selected_backend"] == "codex"
            assert data["backend_id"] == "codex"
            assert data["role_id"] == constructor.id
            assert data["authority_ref"] == "runtime://role-dispatch"
            assert data["assignment_source"] == "runtime://session-override/constructor"
            assert data["resolved_runtime_ref"] == "runtime://resolved/constructor/codex"

        manifest_path = Path(outcome.result["fp_manifest_path"])
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        assert manifest["worker_id"] == "abiogenesis_python_router"
        assert manifest["selected_worker_id"] == "codex"
        assert manifest["selected_backend"] == "codex"
        assert manifest["backend_id"] == "codex"
        assert manifest["role_id"] == constructor.id
        assert manifest["authority_ref"] == "runtime://role-dispatch"
        assert manifest["assignment_source"] == "runtime://session-override/constructor"
        assert manifest["resolved_runtime_ref"] == "runtime://resolved/constructor/codex"

        derived_run = run_state(events, "run-m03-router-dispatch")
        assert derived_run is not None
        assert derived_run.worker_id == "abiogenesis_python_router"
        assert derived_run.selected_worker_id == "codex"
        assert derived_run.selected_backend == "codex"
        assert derived_run.assignment_source == "runtime://session-override/constructor"
        assert derived_run.resolved_runtime_ref == "runtime://resolved/constructor/codex"
        assert manifest["work_key"] == vector.id
        assert manifest["edge"] == vector.name

    def test_iterated_traversal_does_not_synthesize_build_when_runtime_build_is_undeclared(self, tmp_path: Path) -> None:
        raw_contract = Node(name="raw_contract", schema="ContractInput")
        discovered_context = Node(name="discovered_context", schema="DesignContext")
        constructor = Role(name="constructor")
        context_ok = Evaluator("context_ok", F_D, binding="exec://python -c 'import sys; sys.exit(0)'")
        context_sufficient = Evaluator("context_sufficient", F_P, "context is sufficient to proceed")

        vector = GraphVector(
            name="raw_contract→discovered_context",
            source=raw_contract,
            target=discovered_context,
            evaluators=(context_ok, context_sufficient),
        )
        graph = Graph(
            name="m03_router_dispatch_no_build",
            inputs=(raw_contract,),
            outputs=(discovered_context,),
            nodes=(raw_contract, discovered_context),
            vectors=(vector,),
        )
        boundary = RefinementBoundary(
            name=vector.name,
            inputs=(raw_contract,),
            outputs=(discovered_context,),
        )
        job = Job(
            name=vector.name,
            contracts=(ContractRef(kind="graph_vector", target_id=vector.id),),
            roles=(constructor,),
        )
        module = Module(
            name="m03_router_dispatch_no_build",
            graphs=(graph,),
            refinement_boundaries=(boundary,),
            jobs=(job,),
            roles=(constructor,),
            metadata={"requirements": ["REQ-R-ABG2-BINDING-006"]},
        )

        router_worker = Worker(
            id="abiogenesis_python_router",
            can_execute=module_to_executable_jobs(module),
            role_ids=(constructor.id,),
            authority_ref="runtime://role-dispatch",
        )
        stream = workspace_bootstrap(tmp_path)
        executable_job = module_to_executable_jobs(module)[0]
        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(
                executable_job,
                failing=(context_sufficient,),
                passing=(context_ok,),
            ),
            workspace_root=tmp_path,
            stream=stream,
            worker=router_worker,
            spec_hash="spec-m03-router-no-build",
            runtime_identity=RuntimeIdentity(
                worker_id="codex",
                backend_id="codex",
                authority_ref="runtime://role-dispatch",
                assignment_source="runtime://session-override/constructor",
                resolved_runtime_ref="runtime://resolved/constructor/codex",
            ),
            work_key=vector.id,
            workflow_version="m03.test@2.0.0",
            run_id="run-m03-router-no-build",
        )

        outcome = traverse(
            Traversal(
                work_key=vector.id,
                target=boundary,
                evaluators=vector.evaluators,
            ),
            runtime=runtime,
            surface=WorkSurface(),
        )

        assert outcome.result["status"] == "iterated"
        edge_started = next(
            event["data"]
            for event in stream.all_events()
            if event["event_type"] == "edge_started"
        )
        assert edge_started["worker_id"] == "abiogenesis_python_router"
        assert "build" not in edge_started

    def test_run_state_projects_fp_assessment_to_canonical_terminal_truth(self, tmp_path: Path) -> None:
        stream = workspace_bootstrap(tmp_path)

        emit(
            "run_started",
            {"edge": "design→code", "run_id": "run-pass", "work_key": "WK-1"},
            stream=stream,
        )
        emit(
            "assessed",
            {
                "kind": "fp",
                "edge": "design→code",
                "run_id": "run-pass",
                "evaluator": "fp_eval",
                "result": "pass",
                "spec_hash": "spec-pass",
            },
            stream=stream,
        )

        passed = run_state(stream.all_events(), "run-pass")
        assert passed is not None
        assert passed.state == "assessed_pass"
        assert passed.failure_class is None

        emit(
            "run_started",
            {"edge": "design→code", "run_id": "run-fail", "work_key": "WK-2"},
            stream=stream,
        )
        emit(
            "assessed",
            {
                "kind": "fp",
                "edge": "design→code",
                "run_id": "run-fail",
                "evaluator": "fp_eval",
                "result": "fail",
                "spec_hash": "spec-fail",
            },
            stream=stream,
        )

        failed = run_state(stream.all_events(), "run-fail")
        assert failed is not None
        assert failed.state == "failed"
        assert failed.failure_class == "certification_failure"

    def test_run_state_replays_timeout_and_supersession_as_first_class_terminal_truth(self, tmp_path: Path) -> None:
        stream = workspace_bootstrap(tmp_path)

        emit(
            "run_started",
            {"edge": "design→code", "run_id": "run-timeout", "work_key": "WK-timeout"},
            stream=stream,
        )
        emit(
            "run_timed_out",
            {"edge": "design→code", "run_id": "run-timeout", "work_key": "WK-timeout"},
            stream=stream,
        )

        timed_out = run_state(stream.all_events(), "run-timeout")
        assert timed_out is not None
        assert timed_out.state == "timed_out"
        assert timed_out.failure_class is None

        emit(
            "run_started",
            {"edge": "design→code", "run_id": "run-old", "work_key": "WK-supersede"},
            stream=stream,
        )
        emit(
            "run_started",
            {"edge": "design→code", "run_id": "run-new", "work_key": "WK-supersede"},
            stream=stream,
        )
        superseded = supersede_run("run-old", "run-new", "design→code", work_key="WK-supersede")
        emit(superseded["event_type"], superseded["data"], stream=stream)

        replayed = run_state(stream.all_events(), "run-old")
        assert replayed is not None
        assert replayed.state == "superseded"
        assert replayed.superseded_by == "run-new"

    def test_precomputed_kernel_convergence_preserves_declared_regime_frontier(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        code = Node(name="code", schema="Code")
        fd_gate = Evaluator("fd_gate", F_D, binding="exec://python -c 'import sys; sys.exit(0)'")
        fp_judge = Evaluator("fp_judge", F_P, "agent review closes the remaining delta")
        fh_review = Evaluator("fh_review", F_H, "human review closes the remaining delta")
        vector = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(fd_gate, fp_judge, fh_review),
        )
        graph = Graph(
            name="m03_convergence",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(vector,),
        )
        job = Job(
            name=vector.name,
            contracts=(ContractRef(kind="graph_vector", target_id=vector.id),),
        )
        module = Module(
            name="m03_convergence",
            graphs=(graph,),
            jobs=(job,),
            metadata={"requirements": ["REQ-M03-CONVERGENCE-001"]},
        )
        executable_job = module_to_executable_jobs(module)[0]

        fd_frontier = _precomputed(
            executable_job,
            failing=(fd_gate,),
            passing=(fp_judge, fh_review),
        )
        fd_result = convergence_from_precomputed(vector.id, fd_frontier)
        assert fd_result.aggregate_state == "open"
        assert fd_result.next_action == "continue"
        assert fd_result.next_regime is F_P

        fp_frontier = _precomputed(
            executable_job,
            failing=(fp_judge,),
            passing=(fd_gate, fh_review),
        )
        fp_result = convergence_from_precomputed(vector.id, fp_frontier)
        assert fp_result.aggregate_state == "open"
        assert fp_result.next_action == "escalate"
        assert fp_result.next_regime is F_H

        outcomes = outcomes_from_precomputed(vector.id, fp_frontier)
        assert [outcome.status for outcome in outcomes] == ["pass", "open", "pass"]

    def test_projection_is_replay_deterministic_for_same_stream_state(self, tmp_path: Path) -> None:
        stream = workspace_bootstrap(tmp_path)
        stream.append(
            "edge_started",
            {
                "edge": "design→code",
                "build": "kernel_router",
                "target": "code",
            },
        )
        stream.append(
            "edge_converged",
            {
                "edge": "design→code",
                "target": "code",
                "feature": None,
                "delta": 0,
                "certified_by": "gen_gaps",
            },
        )

        assert project(stream, "code", "current") == project(stream, "code", "current")

    def test_gen_gaps_is_idempotent_and_feature_certificates_do_not_duplicate(self, tmp_path: Path) -> None:
        module = _minimal_property_module()
        spec_hash = req_hash(module.metadata["requirements"])

        for feature in ("FEAT-A", "FEAT-B"):
            workspace = tmp_path / feature
            stream = workspace_bootstrap(workspace)
            active_dir = workspace / ".ai-workspace" / "features" / "active"
            active_dir.mkdir(parents=True, exist_ok=True)
            (active_dir / f"{feature}.yml").write_text(
                f"id: {feature}\nstatus: active\nsatisfies:\n  - REQ-M03-PROPERTY-001\n",
                encoding="utf-8",
            )
            stream.append(
                "assessed",
                {
                    "kind": "fp",
                    "edge": "design→code",
                    "evaluator": "code_complete",
                    "result": "pass",
                    "spec_hash": spec_hash,
                },
            )
            scope = Scope(module=module, workspace_root=workspace, work_key_filter=feature)

            first = gen_gaps(scope, stream)
            count_after_first = len(stream.all_events())
            second = gen_gaps(scope, stream)

            assert first["converged"] is True
            assert second["converged"] is True
            assert len(stream.all_events()) == count_after_first

            certificates = [
                event
                for event in stream.all_events()
                if event["event_type"] == "edge_converged"
                and event["data"].get("work_key") == feature
            ]
            assert len(certificates) == 1

    def test_changed_requirements_invalidate_prior_fp_until_current_hash_arrives(self, tmp_path: Path) -> None:
        module_v1 = _minimal_property_module(["REQ-M03-ONE"])
        stream = workspace_bootstrap(tmp_path)
        scope_v1 = Scope(module=module_v1, workspace_root=tmp_path)
        hash_v1 = req_hash(module_v1.metadata["requirements"])

        stream.append(
            "assessed",
            {
                "kind": "fp",
                "edge": "design→code",
                "evaluator": "code_complete",
                "result": "pass",
                "spec_hash": hash_v1,
            },
        )
        assert gen_gaps(scope_v1, stream)["converged"] is True

        module_v2 = _minimal_property_module(["REQ-M03-ONE", "REQ-M03-TWO"])
        scope_v2 = Scope(module=module_v2, workspace_root=tmp_path)
        hash_v2 = req_hash(module_v2.metadata["requirements"])

        result_v2 = gen_gaps(scope_v2, stream)
        assert hash_v1 != hash_v2
        assert result_v2["converged"] is False
        assert result_v2["total_delta"] > 0

        stream.append(
            "assessed",
            {
                "kind": "fp",
                "edge": "design→code",
                "evaluator": "code_complete",
                "result": "pass",
                "spec_hash": hash_v2,
            },
        )
        assert gen_gaps(scope_v2, stream)["converged"] is True

    def test_stale_spec_hash_is_rejected_until_current_assessment_exists(self, tmp_path: Path) -> None:
        module = _minimal_property_module(["REQ-M03-NEW"])
        stream = workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path)
        expected_hash = req_hash(module.metadata["requirements"])

        stream.append(
            "assessed",
            {
                "kind": "fp",
                "edge": "design→code",
                "evaluator": "code_complete",
                "result": "pass",
                "spec_hash": "stale_hash",
            },
        )

        stale = gen_gaps(scope, stream)
        assert stale["converged"] is False
        failing = [evaluator for gap in stale["gaps"] for evaluator in gap["failing"]]
        assert "code_complete" in failing

        stream.append(
            "assessed",
            {
                "kind": "fp",
                "edge": "design→code",
                "evaluator": "code_complete",
                "result": "pass",
                "spec_hash": expected_hash,
            },
        )
        assert gen_gaps(scope, stream)["converged"] is True
