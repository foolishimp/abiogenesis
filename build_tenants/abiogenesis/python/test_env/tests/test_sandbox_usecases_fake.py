# Validates: REQ-L-GTL3-SYNTHESIS
# Validates: REQ-L-GTL3-SELECTION-BOUNDARY
# Validates: REQ-L-GTL3-SUBWORK
# Validates: REQ-R-ABG2-INTERPRET
# Validates: REQ-R-ABG2-BINDING
# Validates: REQ-R-ABG2-CORRECTION
# Validates: REQ-R-ABG2-LEAFTASK
# Validates: REQ-R-ABG2-LINEAGE
# Validates: REQ-R-ABG2-SELECTION-APPLICATION
# Validates: REQ-R-ABG2-CONVERGENCE
# Validates: REQ-R-ABG2-WORKER
"""
Sandbox use cases — fake response lane.

These tests install a real sandbox, publish real GTL modules, and drive the
engine through multi-step use cases with deterministic event injection instead
of a live LLM.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from gtl.algebra import candidate_family, deferred_refinement
from gtl.function_model import GraphFunction
from gtl.graph import Graph, GraphVector, Node
from gtl.module_model import Module
from gtl.operator_model import Evaluator, F_P
from gtl.work_model import ContractRef, Job

from genesis.binding import PrecomputedManifest, WorkSurface, Worker, module_to_executable_jobs
from genesis.events import emit
from genesis.install import workspace_bootstrap
from genesis.interpret import Traversal, TraversalRuntime, traverse
from genesis.projection import project
from genesis.provenance import req_hash
from genesis.selection import SelectionDecision, resolve_refinement_boundary
from genesis.services import Scope, gen_gaps, gen_iterate
from genesis.subwork import LeafTask
from sandbox_runtime import install_real_sandbox

from helpers_intent_requirements import (
    ARTIFACT_PATH as I2R_ARTIFACT_PATH,
    EDGE_NAME as I2R_EDGE_NAME,
    intent_requirements_artifact,
    intent_requirements_module,
    judge_intent_traceability,
    run_requirements_standard_check,
    write_result_file as write_i2r_result_file,
)
from helpers_requirements_uat import (
    ARTIFACT_PATH as R2U_ARTIFACT_PATH,
    EDGE_NAME as R2U_EDGE_NAME,
    judge_uat_scenario_quality,
    requirements_uat_artifact,
    requirements_uat_module,
    run_uat_standard_check,
    write_result_file as write_r2u_result_file,
)
from helpers_gsdlc_lite import (
    CODE_ARTIFACT_PATH as GL_CODE_ARTIFACT_PATH,
    DECOMPOSITION_ARTIFACT_PATH as GL_DECOMPOSITION_ARTIFACT_PATH,
    DECOMPOSITION_TO_DEPENDENCY_EDGE as GL_DECOMPOSITION_TO_DEPENDENCY_EDGE,
    DESIGN_REVIEW_ARTIFACT_PATH as GL_DESIGN_REVIEW_ARTIFACT_PATH,
    DESIGN_TO_REVIEW_EDGE as GL_DESIGN_TO_REVIEW_EDGE,
    DESIGN_ARTIFACT_PATH as GL_DESIGN_ARTIFACT_PATH,
    DESIGN_TO_CODE_EDGE as GL_DESIGN_TO_CODE_EDGE,
    decomposition_artifact as gsdlc_decomposition_artifact,
    DEPENDENCY_CHAIN_ARTIFACT_PATH as GL_DEPENDENCY_CHAIN_ARTIFACT_PATH,
    REQ_TO_DESIGN_EDGE as GL_REQ_TO_DESIGN_EDGE,
    REQ_TO_DECOMPOSITION_EDGE as GL_REQ_TO_DECOMPOSITION_EDGE,
    REVIEW_TO_CODE_EDGE as GL_REVIEW_TO_CODE_EDGE,
    code_artifact as gsdlc_code_artifact,
    design_review_artifact as gsdlc_design_review_artifact,
    design_artifact as gsdlc_design_artifact,
    gsdlc_lite_module,
    gsdlc_lite_role_module,
    gsdlc_lite_review_module,
    judge_code_quality,
    judge_design_quality,
    judge_design_review_quality,
    run_code_standard_check,
    run_design_standard_check,
    run_design_review_standard_check,
    gsdlc_lite_zoom_module,
    write_result_file as write_gsdlc_result_file,
)


def _graph_function(name: str, graph: Graph, *, tags: tuple[str, ...] = ()) -> GraphFunction:
    return GraphFunction.from_graph(name=name, graph=graph, tags=tags)


def _graph_function_for_vector(vector: GraphVector) -> GraphFunction:
    source = vector.source if isinstance(vector.source, tuple) else (vector.source,)
    return GraphFunction.from_graph(
        name=vector.name,
        graph=Graph(
            name=f"{vector.name}_workflow",
            inputs=source,
            outputs=(vector.target,),
            nodes=tuple(dict.fromkeys((*source, vector.target))),
            vectors=(vector,),
        ),
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


def _u2_discovery_module() -> Module:
    raw_contract = Node(name="raw_contract", schema="ContractInput")
    discovered_context = Node(name="discovered_context", schema="DesignContext")
    eval_fp = Evaluator("context_sufficient", F_P, "context is sufficient to proceed")

    vector = GraphVector(
        name="raw_contract→discovered_context",
        source=raw_contract,
        target=discovered_context,
        evaluators=(eval_fp,),
    )
    graph = Graph(
        name="u2_discovery",
        inputs=(raw_contract,),
        outputs=(discovered_context,),
        nodes=(raw_contract, discovered_context),
        vectors=(vector,),
    )
    boundary = deferred_refinement(
        vector.name,
        inputs=(raw_contract,),
        outputs=(discovered_context,),
        hints={"use_case": "gap_triggered_context_discovery"},
    )
    graph_function = _graph_function_for_vector(vector)
    job = Job(
        name=vector.name,
        contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),),
    )
    return Module(
        name="u2_discovery",
        graphs=(graph,),
        graph_functions=(graph_function,),
        refinement_boundaries=(boundary,),
        jobs=(job,),
        metadata={"requirements": ["REQ-U2-001"]},
    )


def _u1_profiles_module() -> Module:
    design = Node(name="design", schema="DesignDoc")
    prototype = Node(name="prototype", schema="Prototype")
    implementation = Node(name="implementation", schema="Implementation")
    code = Node(name="code", schema="Code")
    eval_fp = Evaluator("profile_review", F_P, "profile satisfies current contract")

    outer = GraphVector(
        name="design→code",
        source=design,
        target=code,
        evaluators=(eval_fp,),
    )
    outer_graph = Graph(
        name="delivery",
        inputs=(design,),
        outputs=(code,),
        nodes=(design, code),
        vectors=(outer,),
    )

    mvp = _graph_function(
        "mvp_profile",
        Graph(
            name="mvp_profile",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, prototype, code),
            vectors=(
                GraphVector("design→prototype", design, prototype, evaluators=(eval_fp,)),
                GraphVector("prototype→code", prototype, code, evaluators=(eval_fp,)),
            ),
        ),
        tags=("profile:mvp",),
    )
    optimal = _graph_function(
        "optimal_profile",
        Graph(
            name="optimal_profile",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, implementation, code),
            vectors=(
                GraphVector("design→implementation", design, implementation, evaluators=(eval_fp,)),
                GraphVector("implementation→code", implementation, code, evaluators=(eval_fp,)),
            ),
        ),
        tags=("profile:optimal",),
    )

    profiles = candidate_family(
        "design→code_profiles",
        inputs=(design,),
        outputs=(code,),
        candidates=(mvp, optimal),
        policy_hints={"profiles": ("mvp", "optimal")},
    )
    outer_profile = _graph_function(outer.name, outer_graph)
    job = Job(
        name=outer.name,
        contracts=(ContractRef(kind="graph_function", target_id=outer_profile.id),),
    )
    return Module(
        name="u1_profiles",
        graphs=(outer_graph,),
        graph_functions=(outer_profile, mvp, optimal),
        candidate_families=(profiles,),
        refinement_boundaries=(
            deferred_refinement("design→prototype", inputs=(design,), outputs=(prototype,)),
            deferred_refinement("prototype→code", inputs=(prototype,), outputs=(code,)),
            deferred_refinement("design→implementation", inputs=(design,), outputs=(implementation,)),
            deferred_refinement("implementation→code", inputs=(implementation,), outputs=(code,)),
        ),
        jobs=(job,),
        metadata={"requirements": ["REQ-U1-001"]},
    )


@pytest.mark.integration
class TestSandboxUsecasesFake:
    @pytest.mark.usecase_id("intent_to_requirements")
    def test_intent_list_to_tagged_requirements_converges_over_real_sandbox(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = intent_requirements_module(workspace)
        scope = Scope(module=module, workspace_root=workspace)
        run_archive.note("scenario", lane="fake", edge=I2R_EDGE_NAME)
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

        before = gen_gaps(scope, stream)
        assert before["converged"] is False
        assert before["total_delta"] > 0

        result = gen_iterate(scope, stream)
        assert result["status"] == "iterated"
        assert result["blocking_reason"] == "fp_dispatch"
        run_archive.update_summary(
            lane="fake",
            blocking_reason=result["blocking_reason"],
            edge=I2R_EDGE_NAME,
        )

        manifest = json.loads(Path(result["fp_manifest_path"]).read_text(encoding="utf-8"))
        artifact = workspace / I2R_ARTIFACT_PATH
        artifact.write_text(intent_requirements_artifact(), encoding="utf-8")

        check = run_requirements_standard_check(workspace)
        run_archive.log_subprocess("check_requirements_standard.py", check)
        assert check.returncode == 0, check.stderr or check.stdout
        check_payload = json.loads(check.stdout)
        run_archive.capture_json("requirements_standard_check.json", check_payload)
        run_archive.update_summary(
            fd_check_status=check_payload["status"],
            fd_check_family_count=len(check_payload["families"]),
            fd_check_ac_count=check_payload["ac_count"],
        )

        assessments = judge_intent_traceability(artifact)
        assert all(a["result"] == "pass" for a in assessments), assessments[0]["evidence"]

        write_i2r_result_file(
            Path(manifest["result_path"]),
            edge=I2R_EDGE_NAME,
            actor="fake_requirements_judge",
            assessments=assessments,
        )

        from genesis.cli_adapter import _assess_result_cmd

        assert _assess_result_cmd(manifest["result_path"], workspace) == 0

        after = gen_gaps(scope, stream)
        assert after["converged"] is True
        assert after["total_delta"] == 0
        run_archive.update_summary(converged=True, total_delta=0)

    @pytest.mark.usecase_id("requirements_to_uat")
    def test_requirements_to_uat_converges_over_real_sandbox(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = requirements_uat_module(workspace)
        scope = Scope(module=module, workspace_root=workspace)
        run_archive.note("scenario", lane="fake", edge=R2U_EDGE_NAME)
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

        before = gen_gaps(scope, stream)
        assert before["converged"] is False
        assert before["total_delta"] > 0

        result = gen_iterate(scope, stream)
        assert result["status"] == "iterated"
        assert result["blocking_reason"] == "fp_dispatch"
        run_archive.update_summary(
            lane="fake",
            blocking_reason=result["blocking_reason"],
            edge=R2U_EDGE_NAME,
        )

        manifest = json.loads(Path(result["fp_manifest_path"]).read_text(encoding="utf-8"))
        artifact = workspace / R2U_ARTIFACT_PATH
        artifact.write_text(requirements_uat_artifact(), encoding="utf-8")

        check = run_uat_standard_check(workspace)
        run_archive.log_subprocess("check_uat_standard.py", check)
        assert check.returncode == 0, check.stderr or check.stdout
        check_payload = json.loads(check.stdout)
        run_archive.capture_json("uat_standard_check.json", check_payload)
        run_archive.update_summary(
            fd_check_status=check_payload["status"],
            fd_check_requirement_count=len(check_payload["requirements"]),
            fd_check_case_count=check_payload["case_count"],
        )

        assessments = judge_uat_scenario_quality(artifact)
        assert all(a["result"] == "pass" for a in assessments), assessments[0]["evidence"]

        write_r2u_result_file(
            Path(manifest["result_path"]),
            edge=R2U_EDGE_NAME,
            actor="fake_uat_judge",
            assessments=assessments,
        )

        from genesis.cli_adapter import _assess_result_cmd

        assert _assess_result_cmd(manifest["result_path"], workspace) == 0

        after = gen_gaps(scope, stream)
        assert after["converged"] is True
        assert after["total_delta"] == 0
        run_archive.update_summary(converged=True, total_delta=0)

    @pytest.mark.usecase_id("u2_gap_triggered_context_discovery")
    def test_gap_triggered_context_discovery_converges_over_real_sandbox(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = _u2_discovery_module()
        scope = Scope(module=module, workspace_root=workspace)
        run_archive.note("scenario", lane="fake", edge="raw_contract→discovered_context")
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

        before = gen_gaps(scope, stream)
        assert before["converged"] is False
        assert before["total_delta"] > 0

        result = gen_iterate(scope, stream)
        assert result["status"] == "iterated"
        assert result["blocking_reason"] == "fp_dispatch"
        assert Path(result["fp_manifest_path"]).is_file()

        spec_hash = req_hash(module.metadata["requirements"])
        emit(
            "assessed",
            {
                "kind": "fp",
                "edge": "raw_contract→discovered_context",
                "evaluator": "context_sufficient",
                "actor": "fake_llm",
                "result": "pass",
                "evidence": "discovery context is sufficient",
                "spec_hash": spec_hash,
            },
        )

        after = gen_gaps(scope, stream)
        assert after["converged"] is True
        assert after["total_delta"] == 0
        run_archive.update_summary(converged=True, total_delta=0)

    @pytest.mark.usecase_id("u1_profile_selection")
    def test_profile_selection_spawns_children_and_reenters_engine(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = _u1_profiles_module()
        scope = Scope(module=module, workspace_root=workspace)
        run_archive.note("scenario", lane="fake", edge="design→code")
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

        executable_job = module_to_executable_jobs(module)[0]
        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(executable_job),
            workspace_root=workspace,
            stream=stream,
            worker=scope.worker,
            spec_hash="spec-u1",
            work_key=executable_job.vector.id,
        )
        family = module.candidate_families[0]
        traversal = Traversal(
            work_key=executable_job.vector.id,
            target=family,
            selection=SelectionDecision(
                contract_id=executable_job.vector.id,
                work_key=executable_job.vector.id,
                graph_function="mvp_profile",
                selected_by="test_policy",
                selection_mode="explicit",
                rationale="select mvp profile for sandbox progression",
            ),
            evaluators=executable_job.vector.evaluators,
        )

        selected = traverse(traversal, runtime=runtime, surface=WorkSurface())
        assert selected.result["status"] == "selected"
        assert any(event["event_type"] == "work_spawned" for event in selected.surface.events)
        frame_state = project(stream, "frame", selected.result["frame_id"])
        assert frame_state["status"] == "open"

        next_scope = Scope(
            module=module,
            workspace_root=workspace,
            worker=scope.worker,
        )
        next_result = gen_iterate(next_scope, stream)

        assert next_result["status"] == "iterated"
        assert next_result["blocking_reason"] == "fp_dispatch"
        assert Path(next_result["fp_manifest_path"]).is_file()
        run_archive.update_summary(
            lane="fake",
            status=next_result["status"],
            blocking_reason=next_result["blocking_reason"],
        )

    @pytest.mark.usecase_id("gsdlc_lite")
    def test_gsdlc_lite_requirements_design_code_converges_over_real_sandbox(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = gsdlc_lite_module(workspace)
        scope = Scope(module=module, workspace_root=workspace)
        run_archive.note("scenario", lane="fake", edge_chain=(GL_REQ_TO_DESIGN_EDGE, GL_DESIGN_TO_CODE_EDGE))
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

        first = gen_iterate(scope, stream)
        assert first["status"] == "iterated"
        assert first["blocking_reason"] == "fp_dispatch"
        first_manifest = json.loads(Path(first["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert first_manifest["edge"] == GL_REQ_TO_DESIGN_EDGE
        (workspace / GL_DESIGN_ARTIFACT_PATH).write_text(gsdlc_design_artifact(), encoding="utf-8")

        design_check = run_design_standard_check(workspace)
        run_archive.log_subprocess("check_design_standard.py", design_check)
        assert design_check.returncode == 0, design_check.stderr or design_check.stdout
        design_check_payload = json.loads(design_check.stdout)
        run_archive.capture_json("design_standard_check.json", design_check_payload)

        design_assessments = judge_design_quality(workspace / GL_DESIGN_ARTIFACT_PATH)
        assert all(a["result"] == "pass" for a in design_assessments), design_assessments[0]["evidence"]
        write_gsdlc_result_file(
            Path(first_manifest["result_path"]),
            edge=GL_REQ_TO_DESIGN_EDGE,
            actor="fake_design_judge",
            assessments=design_assessments,
        )
        from genesis.cli_adapter import _assess_result_cmd

        assert _assess_result_cmd(first_manifest["result_path"], workspace) == 0

        second = gen_iterate(scope, stream)
        assert second["status"] == "iterated"
        assert second["blocking_reason"] == "fp_dispatch"
        second_manifest = json.loads(Path(second["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert second_manifest["edge"] == GL_DESIGN_TO_CODE_EDGE
        (workspace / GL_CODE_ARTIFACT_PATH).write_text(gsdlc_code_artifact(), encoding="utf-8")

        code_check = run_code_standard_check(workspace)
        run_archive.log_subprocess("check_code_standard.py", code_check)
        assert code_check.returncode == 0, code_check.stderr or code_check.stdout
        code_check_payload = json.loads(code_check.stdout)
        run_archive.capture_json("code_standard_check.json", code_check_payload)

        code_assessments = judge_code_quality(workspace / GL_CODE_ARTIFACT_PATH)
        assert all(a["result"] == "pass" for a in code_assessments), code_assessments[0]["evidence"]
        write_gsdlc_result_file(
            Path(second_manifest["result_path"]),
            edge=GL_DESIGN_TO_CODE_EDGE,
            actor="fake_code_judge",
            assessments=code_assessments,
        )
        assert _assess_result_cmd(second_manifest["result_path"], workspace) == 0

        final_gaps = gen_gaps(scope, stream)
        assert final_gaps["converged"] is True
        assert final_gaps["total_delta"] == 0
        run_archive.update_summary(
            lane="fake",
            edges=[GL_REQ_TO_DESIGN_EDGE, GL_DESIGN_TO_CODE_EDGE],
            design_manifest_id=first_manifest["manifest_id"],
            code_manifest_id=second_manifest["manifest_id"],
            fd_design_status=design_check_payload["status"],
            fd_code_status=code_check_payload["status"],
            converged=True,
            total_delta=0,
        )

    @pytest.mark.usecase_id("gsdlc_lite_review")
    def test_gsdlc_lite_design_review_converges_over_real_sandbox(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = gsdlc_lite_review_module(workspace)
        scope = Scope(module=module, workspace_root=workspace)
        run_archive.note(
            "scenario",
            lane="fake",
            edge_chain=(GL_REQ_TO_DESIGN_EDGE, GL_DESIGN_TO_REVIEW_EDGE, GL_REVIEW_TO_CODE_EDGE),
        )
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

        first = gen_iterate(scope, stream)
        assert first["status"] == "iterated"
        assert first["blocking_reason"] == "fp_dispatch"
        first_manifest = json.loads(Path(first["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert first_manifest["edge"] == GL_REQ_TO_DESIGN_EDGE
        (workspace / GL_DESIGN_ARTIFACT_PATH).write_text(gsdlc_design_artifact(), encoding="utf-8")

        design_check = run_design_standard_check(workspace)
        run_archive.log_subprocess("check_design_standard.py", design_check)
        assert design_check.returncode == 0, design_check.stderr or design_check.stdout
        design_check_payload = json.loads(design_check.stdout)
        run_archive.capture_json("design_standard_check.json", design_check_payload)

        design_assessments = judge_design_quality(workspace / GL_DESIGN_ARTIFACT_PATH)
        assert all(a["result"] == "pass" for a in design_assessments), design_assessments[0]["evidence"]
        write_gsdlc_result_file(
            Path(first_manifest["result_path"]),
            edge=GL_REQ_TO_DESIGN_EDGE,
            actor="fake_design_judge",
            assessments=design_assessments,
        )
        from genesis.cli_adapter import _assess_result_cmd
        assert _assess_result_cmd(first_manifest["result_path"], workspace) == 0

        second = gen_iterate(scope, stream)
        assert second["status"] == "iterated"
        assert second["blocking_reason"] == "fp_dispatch"
        second_manifest = json.loads(Path(second["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert second_manifest["edge"] == GL_DESIGN_TO_REVIEW_EDGE
        (workspace / GL_DESIGN_REVIEW_ARTIFACT_PATH).write_text(
            gsdlc_design_review_artifact(),
            encoding="utf-8",
        )

        review_check = run_design_review_standard_check(workspace)
        run_archive.log_subprocess("check_design_review_standard.py", review_check)
        assert review_check.returncode == 0, review_check.stderr or review_check.stdout
        review_check_payload = json.loads(review_check.stdout)
        run_archive.capture_json("design_review_standard_check.json", review_check_payload)

        review_assessments = list(
            judge_design_review_quality(workspace / GL_DESIGN_REVIEW_ARTIFACT_PATH)
        )
        assert all(a["result"] == "pass" for a in review_assessments), review_assessments[0]["evidence"]
        write_gsdlc_result_file(
            Path(second_manifest["result_path"]),
            edge=GL_DESIGN_TO_REVIEW_EDGE,
            actor="fake_design_review_judge",
            assessments=review_assessments,
        )
        assert _assess_result_cmd(second_manifest["result_path"], workspace) == 0

        review_events = [
            event for event in stream.all_events()
            if event.get("event_type") == "assessed"
            and event.get("data", {}).get("edge") == GL_DESIGN_TO_REVIEW_EDGE
        ]
        assert len(review_events) == 3

        third = gen_iterate(scope, stream)
        assert third["status"] == "iterated"
        assert third["blocking_reason"] == "fp_dispatch"
        third_manifest = json.loads(Path(third["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert third_manifest["edge"] == GL_REVIEW_TO_CODE_EDGE
        (workspace / GL_CODE_ARTIFACT_PATH).write_text(gsdlc_code_artifact(), encoding="utf-8")

        code_check = run_code_standard_check(workspace)
        run_archive.log_subprocess("check_code_standard.py", code_check)
        assert code_check.returncode == 0, code_check.stderr or code_check.stdout
        code_check_payload = json.loads(code_check.stdout)
        run_archive.capture_json("code_standard_check.json", code_check_payload)

        code_assessments = judge_code_quality(workspace / GL_CODE_ARTIFACT_PATH)
        assert all(a["result"] == "pass" for a in code_assessments), code_assessments[0]["evidence"]
        write_gsdlc_result_file(
            Path(third_manifest["result_path"]),
            edge=GL_REVIEW_TO_CODE_EDGE,
            actor="fake_code_judge",
            assessments=code_assessments,
        )
        assert _assess_result_cmd(third_manifest["result_path"], workspace) == 0

        final_gaps = gen_gaps(scope, stream)
        assert final_gaps["converged"] is True
        assert final_gaps["total_delta"] == 0
        run_archive.update_summary(
            lane="fake",
            edges=[GL_REQ_TO_DESIGN_EDGE, GL_DESIGN_TO_REVIEW_EDGE, GL_REVIEW_TO_CODE_EDGE],
            design_manifest_id=first_manifest["manifest_id"],
            review_manifest_id=second_manifest["manifest_id"],
            code_manifest_id=third_manifest["manifest_id"],
            review_assessment_count=len(review_events),
            fd_design_status=design_check_payload["status"],
            fd_review_status=review_check_payload["status"],
            fd_code_status=code_check_payload["status"],
            converged=True,
            total_delta=0,
        )

    @pytest.mark.usecase_id("gsdlc_lite_review_reset")
    def test_gsdlc_lite_design_review_reset_replays_edge(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = gsdlc_lite_review_module(workspace)
        root_work_key = module_to_executable_jobs(module)[0].vector.id
        scope = Scope(module=module, workspace_root=workspace, work_key=root_work_key)
        run_archive.note(
            "scenario",
            lane="fake",
            edge_chain=(GL_REQ_TO_DESIGN_EDGE, GL_DESIGN_TO_REVIEW_EDGE, GL_REVIEW_TO_CODE_EDGE),
            reset_edge=GL_DESIGN_TO_REVIEW_EDGE,
        )
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

        from genesis.cli_adapter import _assess_result_cmd

        first = gen_iterate(scope, stream)
        first_manifest = json.loads(Path(first["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert first_manifest["edge"] == GL_REQ_TO_DESIGN_EDGE
        (workspace / GL_DESIGN_ARTIFACT_PATH).write_text(gsdlc_design_artifact(), encoding="utf-8")
        assert run_design_standard_check(workspace).returncode == 0
        write_gsdlc_result_file(
            Path(first_manifest["result_path"]),
            edge=GL_REQ_TO_DESIGN_EDGE,
            actor="fake_design_judge",
            assessments=judge_design_quality(workspace / GL_DESIGN_ARTIFACT_PATH),
        )
        assert _assess_result_cmd(first_manifest["result_path"], workspace) == 0

        second = gen_iterate(scope, stream)
        second_manifest = json.loads(Path(second["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert second_manifest["edge"] == GL_DESIGN_TO_REVIEW_EDGE
        (workspace / GL_DESIGN_REVIEW_ARTIFACT_PATH).write_text(
            gsdlc_design_review_artifact(),
            encoding="utf-8",
        )
        assert run_design_review_standard_check(workspace).returncode == 0
        initial_review_assessments = list(
            judge_design_review_quality(workspace / GL_DESIGN_REVIEW_ARTIFACT_PATH)
        )
        write_gsdlc_result_file(
            Path(second_manifest["result_path"]),
            edge=GL_DESIGN_TO_REVIEW_EDGE,
            actor="fake_design_review_judge",
            assessments=initial_review_assessments,
        )
        assert _assess_result_cmd(second_manifest["result_path"], workspace) == 0

        emit(
            "reset",
            {
                "scope": "edge",
                "edge": GL_DESIGN_TO_REVIEW_EDGE,
                "work_key": root_work_key,
                "actor": "fake_reset_judge",
                "reason": "force replay after review correction",
            },
        )

        gaps_after_reset = gen_gaps(scope, stream)
        assert gaps_after_reset["converged"] is False
        reopened = [
            gap for gap in gaps_after_reset["gaps"]
            if gap["edge"] == GL_DESIGN_TO_REVIEW_EDGE
        ]
        assert reopened and reopened[0]["delta"] > 0

        replay = gen_iterate(scope, stream)
        assert replay["status"] == "iterated"
        replay_manifest = json.loads(Path(replay["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert replay_manifest["edge"] == GL_DESIGN_TO_REVIEW_EDGE

        replay_review_assessments = list(
            judge_design_review_quality(workspace / GL_DESIGN_REVIEW_ARTIFACT_PATH)
        )
        write_gsdlc_result_file(
            Path(replay_manifest["result_path"]),
            edge=GL_DESIGN_TO_REVIEW_EDGE,
            actor="fake_design_review_judge",
            assessments=replay_review_assessments,
        )
        assert _assess_result_cmd(replay_manifest["result_path"], workspace) == 0

        third = gen_iterate(scope, stream)
        third_manifest = json.loads(Path(third["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert third_manifest["edge"] == GL_REVIEW_TO_CODE_EDGE
        (workspace / GL_CODE_ARTIFACT_PATH).write_text(gsdlc_code_artifact(), encoding="utf-8")
        assert run_code_standard_check(workspace).returncode == 0
        write_gsdlc_result_file(
            Path(third_manifest["result_path"]),
            edge=GL_REVIEW_TO_CODE_EDGE,
            actor="fake_code_judge",
            assessments=judge_code_quality(workspace / GL_CODE_ARTIFACT_PATH),
        )
        assert _assess_result_cmd(third_manifest["result_path"], workspace) == 0

        final_gaps = gen_gaps(scope, stream)
        assert final_gaps["converged"] is True
        assert final_gaps["total_delta"] == 0
        run_archive.update_summary(
            lane="fake",
            reset_edge=GL_DESIGN_TO_REVIEW_EDGE,
            design_manifest_id=first_manifest["manifest_id"],
            initial_review_manifest_id=second_manifest["manifest_id"],
            replay_review_manifest_id=replay_manifest["manifest_id"],
            code_manifest_id=third_manifest["manifest_id"],
            converged=True,
            total_delta=0,
        )

    @pytest.mark.usecase_id("gsdlc_lite_roles")
    def test_gsdlc_lite_role_workers_advance_their_lawful_steps(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = gsdlc_lite_role_module(workspace)
        executable_jobs = module_to_executable_jobs(module)

        designer_worker = Worker(
            id="designer_worker",
            can_execute=executable_jobs,
            role_ids=(module.roles[0].id,),
        )
        reviewer_worker = Worker(
            id="reviewer_worker",
            can_execute=executable_jobs,
            role_ids=(module.roles[1].id,),
        )
        coder_worker = Worker(
            id="coder_worker",
            can_execute=executable_jobs,
            role_ids=(module.roles[2].id,),
        )
        admin_worker = Worker(
            id="admin_worker",
            can_execute=executable_jobs,
            role_ids=tuple(role.id for role in module.roles),
        )

        run_archive.note(
            "scenario",
            lane="fake",
            workers=(designer_worker.id, reviewer_worker.id, coder_worker.id),
            edge_chain=(GL_REQ_TO_DESIGN_EDGE, GL_DESIGN_TO_REVIEW_EDGE, GL_REVIEW_TO_CODE_EDGE),
        )

        designer_scope = Scope(module=module, workspace_root=workspace, worker=designer_worker)
        first = gen_iterate(designer_scope, stream)
        first_manifest = json.loads(Path(first["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert first_manifest["edge"] == GL_REQ_TO_DESIGN_EDGE
        assert first["run_id"]
        (workspace / GL_DESIGN_ARTIFACT_PATH).write_text(gsdlc_design_artifact(), encoding="utf-8")
        assert run_design_standard_check(workspace).returncode == 0
        write_gsdlc_result_file(
            Path(first_manifest["result_path"]),
            edge=GL_REQ_TO_DESIGN_EDGE,
            actor="designer_worker",
            assessments=judge_design_quality(workspace / GL_DESIGN_ARTIFACT_PATH),
        )
        from genesis.cli_adapter import _assess_result_cmd
        assert _assess_result_cmd(first_manifest["result_path"], workspace) == 0

        reviewer_scope = Scope(module=module, workspace_root=workspace, worker=reviewer_worker)
        second = gen_iterate(reviewer_scope, stream)
        second_manifest = json.loads(Path(second["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert second_manifest["edge"] == GL_DESIGN_TO_REVIEW_EDGE
        (workspace / GL_DESIGN_REVIEW_ARTIFACT_PATH).write_text(
            gsdlc_design_review_artifact(),
            encoding="utf-8",
        )
        assert run_design_review_standard_check(workspace).returncode == 0
        write_gsdlc_result_file(
            Path(second_manifest["result_path"]),
            edge=GL_DESIGN_TO_REVIEW_EDGE,
            actor="reviewer_worker",
            assessments=list(judge_design_review_quality(workspace / GL_DESIGN_REVIEW_ARTIFACT_PATH)),
        )
        assert _assess_result_cmd(second_manifest["result_path"], workspace) == 0

        coder_scope = Scope(module=module, workspace_root=workspace, worker=coder_worker)
        third = gen_iterate(coder_scope, stream)
        third_manifest = json.loads(Path(third["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert third_manifest["edge"] == GL_REVIEW_TO_CODE_EDGE
        (workspace / GL_CODE_ARTIFACT_PATH).write_text(gsdlc_code_artifact(), encoding="utf-8")
        assert run_code_standard_check(workspace).returncode == 0
        write_gsdlc_result_file(
            Path(third_manifest["result_path"]),
            edge=GL_REVIEW_TO_CODE_EDGE,
            actor="coder_worker",
            assessments=judge_code_quality(workspace / GL_CODE_ARTIFACT_PATH),
        )
        assert _assess_result_cmd(third_manifest["result_path"], workspace) == 0

        final_gaps = gen_gaps(Scope(module=module, workspace_root=workspace, worker=admin_worker), stream)
        assert final_gaps["converged"] is True
        assert final_gaps["total_delta"] == 0

        run_events = [
            event for event in stream.all_events()
            if event.get("event_type") == "run_bound"
        ]
        worker_ids = [event["data"]["worker_id"] for event in run_events]
        assert designer_worker.id in worker_ids
        assert reviewer_worker.id in worker_ids
        assert coder_worker.id in worker_ids
        run_archive.update_summary(
            lane="fake",
            worker_ids=worker_ids,
            design_manifest_id=first_manifest["manifest_id"],
            review_manifest_id=second_manifest["manifest_id"],
            code_manifest_id=third_manifest["manifest_id"],
        )

    @pytest.mark.usecase_id("gsdlc_lite_leaf_subwork")
    def test_gsdlc_lite_code_edge_runs_bounded_leaf_subwork(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = gsdlc_lite_review_module(workspace)
        scope = Scope(module=module, workspace_root=workspace)
        run_archive.note(
            "scenario",
            lane="fake",
            edge=GL_REVIEW_TO_CODE_EDGE,
            leaf_tasks=("service_signature", "store_contract"),
        )
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

        from genesis.cli_adapter import _assess_result_cmd

        first = gen_iterate(scope, stream)
        first_manifest = json.loads(Path(first["fp_manifest_path"]).read_text(encoding="utf-8"))
        (workspace / GL_DESIGN_ARTIFACT_PATH).write_text(gsdlc_design_artifact(), encoding="utf-8")
        assert run_design_standard_check(workspace).returncode == 0
        write_gsdlc_result_file(
            Path(first_manifest["result_path"]),
            edge=GL_REQ_TO_DESIGN_EDGE,
            actor="fake_design_judge",
            assessments=judge_design_quality(workspace / GL_DESIGN_ARTIFACT_PATH),
        )
        assert _assess_result_cmd(first_manifest["result_path"], workspace) == 0

        second = gen_iterate(scope, stream)
        second_manifest = json.loads(Path(second["fp_manifest_path"]).read_text(encoding="utf-8"))
        (workspace / GL_DESIGN_REVIEW_ARTIFACT_PATH).write_text(
            gsdlc_design_review_artifact(),
            encoding="utf-8",
        )
        assert run_design_review_standard_check(workspace).returncode == 0
        write_gsdlc_result_file(
            Path(second_manifest["result_path"]),
            edge=GL_DESIGN_TO_REVIEW_EDGE,
            actor="fake_review_judge",
            assessments=list(judge_design_review_quality(workspace / GL_DESIGN_REVIEW_ARTIFACT_PATH)),
        )
        assert _assess_result_cmd(second_manifest["result_path"], workspace) == 0

        executable_job = next(
            job
            for job in module_to_executable_jobs(module)
            if job.vector.name == GL_REVIEW_TO_CODE_EDGE
        )
        boundary = resolve_refinement_boundary(module, executable_job.vector.id)
        assert boundary is not None

        def _leaf_dispatch(task: LeafTask, input_data: dict) -> tuple[dict | None, str | None]:
            return {
                "summary": f"{task.name}:{input_data['artifact']}",
            }, None

        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(executable_job, failing=executable_job.vector.evaluators),
            workspace_root=workspace,
            stream=stream,
            worker=scope.worker,
            spec_hash=req_hash(module.metadata.get("requirements", [])),
            leaf_tasks=(
                LeafTask(
                    name="service_signature",
                    input_schema={
                        "type": "object",
                        "required": ["artifact"],
                        "properties": {"artifact": {"type": "string"}},
                    },
                    output_schema={
                        "type": "object",
                        "required": ["summary"],
                        "properties": {"summary": {"type": "string"}},
                    },
                ),
                LeafTask(
                    name="store_contract",
                    input_schema={
                        "type": "object",
                        "required": ["artifact"],
                        "properties": {"artifact": {"type": "string"}},
                    },
                    output_schema={
                        "type": "object",
                        "required": ["summary"],
                        "properties": {"summary": {"type": "string"}},
                    },
                ),
            ),
            on_leaf_dispatch=_leaf_dispatch,
            leaf_task_inputs={
                "service_signature": {"artifact": "design_review.md"},
                "store_contract": {"artifact": "design_review.md"},
            },
        )
        outcome = traverse(
            Traversal(
                work_key=executable_job.vector.id,
                target=boundary,
                evaluators=executable_job.vector.evaluators,
            ),
            runtime=runtime,
            surface=WorkSurface(),
        )
        assert outcome.result["status"] == "iterated"
        events = [event["event_type"] for event in outcome.surface.events]
        assert "leaf_task_started" in events
        assert "leaf_task_completed" in events
        assert outcome.surface.artifacts
        assert "leaf:service_signature" in outcome.surface.artifacts
        assert "leaf:store_contract" in outcome.surface.artifacts

        third_manifest = json.loads(Path(outcome.result["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert third_manifest["edge"] == GL_REVIEW_TO_CODE_EDGE
        (workspace / GL_CODE_ARTIFACT_PATH).write_text(gsdlc_code_artifact(), encoding="utf-8")
        assert run_code_standard_check(workspace).returncode == 0
        write_gsdlc_result_file(
            Path(third_manifest["result_path"]),
            edge=GL_REVIEW_TO_CODE_EDGE,
            actor="fake_code_judge",
            assessments=judge_code_quality(workspace / GL_CODE_ARTIFACT_PATH),
        )
        assert _assess_result_cmd(third_manifest["result_path"], workspace) == 0

        final_gaps = gen_gaps(scope, stream)
        assert final_gaps["converged"] is True
        assert final_gaps["total_delta"] == 0
        run_archive.update_summary(
            lane="fake",
            edge=GL_REVIEW_TO_CODE_EDGE,
            leaf_tasks=("service_signature", "store_contract"),
            code_manifest_id=third_manifest["manifest_id"],
            converged=True,
            total_delta=0,
        )

    @pytest.mark.usecase_id("gsdlc_lite_zoom")
    def test_zoomed_design_selection_spawns_decomposition_chain(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = gsdlc_lite_zoom_module(workspace)
        scope = Scope(module=module, workspace_root=workspace)
        run_archive.note("scenario", lane="fake", edge="requirements→design", selection="zoomed_design_profile")
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

        executable_job = module_to_executable_jobs(module)[0]
        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(executable_job),
            workspace_root=workspace,
            stream=stream,
            worker=scope.worker,
            spec_hash="spec-gsdlc-zoom",
            work_key=executable_job.vector.id,
        )
        family = module.candidate_families[0]
        traversal = Traversal(
            work_key=executable_job.vector.id,
            target=family,
            selection=SelectionDecision(
                contract_id=executable_job.vector.id,
                work_key=executable_job.vector.id,
                graph_function="zoomed_design_profile",
                selected_by="test_policy",
                selection_mode="explicit",
                rationale="zoom into decomposition, dependency chain, and sequencing before design synthesis",
            ),
            evaluators=executable_job.vector.evaluators,
        )

        selected = traverse(traversal, runtime=runtime, surface=WorkSurface())
        assert selected.result["status"] == "selected"
        spawned = [event for event in selected.surface.events if event["event_type"] == "work_spawned"]
        assert len(spawned) == 4
        frame_state = project(stream, "frame", selected.result["frame_id"])
        assert {step["edge"] for step in frame_state["child_steps"]} == {
            "requirements→decomposition",
            "decomposition→dependency_chain",
            "dependency_chain→sequencing",
            "sequencing→design",
        }
        assert {
            vector.name
            for graph in module.graphs
            for vector in graph.vectors
        } == {"requirements→design", "design→code"}

        next_scope = Scope(
            module=module,
            workspace_root=workspace,
            worker=scope.worker,
        )
        next_result = gen_iterate(next_scope, stream)
        assert next_result["status"] == "iterated"
        assert next_result["blocking_reason"] == "fp_dispatch"
        next_manifest = json.loads(Path(next_result["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert next_manifest["edge"] == GL_REQ_TO_DECOMPOSITION_EDGE

        (workspace / GL_DECOMPOSITION_ARTIFACT_PATH).write_text(
            gsdlc_decomposition_artifact(),
            encoding="utf-8",
        )
        write_gsdlc_result_file(
            Path(next_manifest["result_path"]),
            edge=GL_REQ_TO_DECOMPOSITION_EDGE,
            actor="fake_zoom_judge",
            assessments=[{
                "evaluator": "zoom_progress",
                "result": "pass",
                "evidence": "decomposition.md updated with non-empty content",
            }],
        )
        from genesis.cli_adapter import _assess_result_cmd
        assert _assess_result_cmd(next_manifest["result_path"], workspace) == 0

        next_next_result = gen_iterate(next_scope, stream)
        assert next_next_result["status"] == "iterated"
        assert next_next_result["blocking_reason"] == "fp_dispatch"
        next_next_manifest = json.loads(
            Path(next_next_result["fp_manifest_path"]).read_text(encoding="utf-8")
        )
        assert next_next_manifest["edge"] == GL_DECOMPOSITION_TO_DEPENDENCY_EDGE
        run_archive.update_summary(
            lane="fake",
            selection="zoomed_design_profile",
            children_spawned=len(spawned),
            next_edge=next_manifest["edge"],
            following_edge=next_next_manifest["edge"],
        )
