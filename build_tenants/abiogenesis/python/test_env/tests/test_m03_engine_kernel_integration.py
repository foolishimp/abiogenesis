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
from gtl.operator_model import Evaluator, F_D, F_H, F_P, Rule
from gtl.work_model import ContractRef, Job, Role

from genesis.binding import PrecomputedManifest, WorkSurface, Worker, module_to_executable_jobs
from genesis.identity import RuntimeIdentity
from genesis.convergence import convergence_from_precomputed, outcomes_from_precomputed
from genesis.events import EventStream
from genesis.install import workspace_bootstrap
from genesis.interpret import Traversal, TraversalRuntime, traverse
from genesis.materialization import (
    CompanionBundle,
    MaterializationRecord,
    MaterializationRequest,
    derive_bundle,
    materialize_graph_function,
)
from genesis.provenance import req_hash
from genesis.projection import project
from genesis.run import find_pending_run, run_state
from genesis.selection import SelectionDecision, resolve_candidate_family
from genesis.services import Scope, gen_gaps


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

        router_worker = Worker(
            id="gsdlc_router",
            can_execute=module_to_executable_jobs(module),
            role_ids=(constructor.id,),
            authority_ref="runtime://role-dispatch",
        )
        scope = Scope(
            module=module,
            workspace_root=tmp_path,
            build="kernel_router",
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
        assert outcome.updated_module is not None
        assert outcome.updated_worker is not None
        assert scope.build == "codex"
        assert outcome.updated_worker.id == "gsdlc_router"
        assert outcome.updated_worker.authority_ref == "runtime://role-dispatch"

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
        assert workflow_selected["data"]["materialization_id"] == outcome.result["materialization_id"]
        assert workflow_selected["data"]["evaluator_bundle"] == ["profile_review"]

        spawned = [event for event in events if event["event_type"] == "work_spawned"]
        assert {event["data"]["child_key"] for event in spawned} == {
            f"{outer.id}/design→prototype",
            f"{outer.id}/prototype→code",
        }

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
            workflow_version="m03.test@1.1.0",
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
            assert event["data"]["workflow_version"] == "m03.test@1.1.0"
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
        assert manifest["work_key"] == vector.id
        assert manifest["edge"] == vector.name

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
