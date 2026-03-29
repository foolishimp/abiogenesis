# Validates: REQ-R-ABG2-INTERPRET
# Validates: REQ-R-ABG2-CONVERGENCE
# Validates: REQ-R-ABG2-SELECTION-APPLICATION
# Validates: REQ-R-ABG2-PROVENANCE
# Validates: REQ-R-ABG2-RUN
# Validates: REQ-R-ABG2-PROJECTION
"""
M03 engine-kernel integration lane.

This replaces the legacy test_abg_{traversal,selection,convergence}.py cluster
with integration checks over real GTL/ABG module, runtime, event, and replay
surfaces.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from gtl.function_model import CandidateFamily, GraphFunction, RefinementBoundary
from gtl.graph import Graph, GraphVector, Node
from gtl.module_model import Module
from gtl.operator_model import Evaluator, F_D, F_P, Rule
from gtl.work_model import ContractRef, Job, Role

from genesis.binding import PrecomputedManifest, WorkSurface, module_to_executable_jobs
from genesis.convergence import convergence_from_precomputed, outcomes_from_precomputed
from genesis.events import EventStream
from genesis.install import workspace_bootstrap
from genesis.interpret import Traversal, TraversalRuntime, traverse
from genesis.projection import project
from genesis.run import find_pending_run, run_state
from genesis.selection import SelectionDecision, resolve_candidate_family
from genesis.services import Scope


def _graph_function(name: str, graph: Graph) -> GraphFunction:
    return GraphFunction(
        name=name,
        inputs=graph.inputs,
        outputs=graph.outputs,
        template=lambda graph=graph: graph,
    )


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


@pytest.mark.integration
class TestM03EngineKernelIntegration:
    def test_candidate_family_selection_rewrites_module_and_spawns_children(self, tmp_path: Path) -> None:
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

        scope = Scope(module=module, workspace_root=tmp_path, build="kernel_router")
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
        assert outcome.updated_module is not None

        updated_vectors = {
            vector.name
            for graph in outcome.updated_module.graphs
            for vector in graph.vectors
        }
        assert updated_vectors == {"design→prototype", "prototype→code"}

        events = stream.all_events()
        workflow_selected = next(event for event in events if event["event_type"] == "workflow_selected")
        assert workflow_selected["data"]["graph_function"] == "mvp_profile"
        assert workflow_selected["data"]["work_key"] == outer.id

        spawned = [event for event in events if event["event_type"] == "work_spawned"]
        assert {event["data"]["child_key"] for event in spawned} == {
            f"{outer.id}/design→prototype",
            f"{outer.id}/prototype→code",
        }

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
        assert manifest["work_key"] == vector.id
        assert manifest["edge"] == vector.name

    def test_precomputed_kernel_convergence_preserves_declared_regime_frontier(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="DesignDoc")
        code = Node(name="code", schema="Code")
        fd_gate = Evaluator("fd_gate", F_D, binding="exec://python -c 'import sys; sys.exit(0)'")
        fp_judge = Evaluator("fp_judge", F_P, "agent review closes the remaining delta")
        vector = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(fd_gate, fp_judge),
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
            passing=(fp_judge,),
        )
        fd_result = convergence_from_precomputed(vector.id, fd_frontier)
        assert fd_result.aggregate_state == "open"
        assert fd_result.next_action == "continue"
        assert fd_result.next_regime is F_P

        fp_frontier = _precomputed(
            executable_job,
            failing=(fp_judge,),
            passing=(fd_gate,),
        )
        fp_result = convergence_from_precomputed(vector.id, fp_frontier)
        assert fp_result.aggregate_state == "open"
        assert fp_result.next_action == "continue"
        assert fp_result.next_regime is None

        outcomes = outcomes_from_precomputed(vector.id, fp_frontier)
        assert [outcome.status for outcome in outcomes] == ["pass", "open"]
