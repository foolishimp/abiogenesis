# Validates: REQ-L-GTL3-SYNTHESIS
# Validates: REQ-L-GTL3-SELECTION-BOUNDARY
# Validates: REQ-L-GTL3-COMPOSE
# Validates: REQ-L-GTL3-SUBWORK
# Validates: REQ-R-ABG3-INTERPRET
# Validates: REQ-R-ABG3-BINDING
# Validates: REQ-R-ABG3-CORRECTION
# Validates: REQ-R-ABG3-LEAFTASK
# Validates: REQ-R-ABG3-LINEAGE
# Validates: REQ-R-ABG3-SELECTION-APPLICATION
# Validates: REQ-R-ABG3-CONVERGENCE
# Validates: REQ-R-ABG3-WORKER
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

from gtl.algebra import candidate_family, compose, deferred_refinement, graph_function_for_vector
from gtl.function_model import EnvRef, GraphFunction
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
    dependency_chain_artifact as gsdlc_dependency_chain_artifact,
    DEPENDENCY_CHAIN_ARTIFACT_PATH as GL_DEPENDENCY_CHAIN_ARTIFACT_PATH,
    DEPENDENCY_TO_SEQUENCING_EDGE as GL_DEPENDENCY_TO_SEQUENCING_EDGE,
    REQ_TO_DESIGN_EDGE as GL_REQ_TO_DESIGN_EDGE,
    REQ_TO_DECOMPOSITION_EDGE as GL_REQ_TO_DECOMPOSITION_EDGE,
    REVIEW_TO_CODE_EDGE as GL_REVIEW_TO_CODE_EDGE,
    code_artifact as gsdlc_code_artifact,
    design_review_artifact as gsdlc_design_review_artifact,
    design_artifact as gsdlc_design_artifact,
    sequencing_artifact as gsdlc_sequencing_artifact,
    gsdlc_lite_module,
    gsdlc_lite_role_module,
    gsdlc_lite_review_module,
    judge_code_quality,
    judge_design_quality,
    judge_design_review_quality,
    run_code_standard_check,
    run_design_standard_check,
    run_design_review_standard_check,
    SEQUENCING_ARTIFACT_PATH as GL_SEQUENCING_ARTIFACT_PATH,
    SEQUENCING_TO_DESIGN_EDGE as GL_SEQUENCING_TO_DESIGN_EDGE,
    gsdlc_lite_zoom_module,
    write_result_file as write_gsdlc_result_file,
)


def _graph_function(name: str, graph: Graph, *, tags: tuple[str, ...] = ()) -> GraphFunction:
    return GraphFunction.from_graph(
        name=name,
        graph=graph,
        environment=EnvRef.from_contract(requires=graph.inputs, provides=graph.outputs),
        tags=tags,
    )


def _graph_function_for_vector(vector: GraphVector) -> GraphFunction:
    return graph_function_for_vector(vector)


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


def _write_fake_result_file(
    result_path: Path,
    *,
    edge: str,
    actor: str,
    evaluator: str = "env_progress",
) -> None:
    result_path.parent.mkdir(parents=True, exist_ok=True)
    result_path.write_text(
        json.dumps(
            {
                "edge": edge,
                "actor": actor,
                "assessments": [
                    {
                        "evaluator": evaluator,
                        "result": "pass",
                        "evidence": f"{edge} advanced under cumulative environment law",
                    }
                ],
            },
            indent=2,
        ),
        encoding="utf-8",
    )


def _u5_cumulative_environment_module() -> Module:
    input_set = Node(name="input_set", schema="InputSet")
    requirements = Node(name="requirements", schema="RequirementsSurface")
    design = Node(name="design", schema="DesignSurface")
    code = Node(name="code", schema="CodeSurface")
    env_progress = Evaluator("env_progress", F_P, "cumulative environment has advanced lawfully")

    capture_requirements = graph_function_for_vector(
        GraphVector(
            name="input_set→requirements",
            source=input_set,
            target=requirements,
            evaluators=(env_progress,),
        )
    )
    synthesize_design = GraphFunction.from_graph(
        name="requirements_to_design",
        graph=Graph(
            name="requirements_to_design",
            inputs=(input_set, requirements),
            outputs=(design,),
            nodes=(input_set, requirements, design),
            vectors=(
                GraphVector(
                    "requirements→design",
                    (input_set, requirements),
                    design,
                    evaluators=(env_progress,),
                ),
            ),
        ),
        environment=EnvRef.from_contract(
            requires=(input_set, requirements),
            provides=(design,),
        ),
    )
    implement_code = GraphFunction.from_graph(
        name="design_to_code",
        graph=Graph(
            name="design_to_code",
            inputs=(input_set, requirements, design),
            outputs=(code,),
            nodes=(input_set, requirements, design, code),
            vectors=(
                GraphVector(
                    "design→code",
                    (input_set, requirements, design),
                    code,
                    evaluators=(env_progress,),
                ),
            ),
        ),
        environment=EnvRef.from_contract(
            requires=(input_set, requirements, design),
            provides=(code,),
        ),
    )
    executive = compose(capture_requirements, synthesize_design, implement_code)
    executive_graph = executive.materialize()

    return Module(
        name="u5_cumulative_environment",
        graphs=(executive_graph,),
        graph_functions=(executive,),
        refinement_boundaries=(
            deferred_refinement(
                "input_set→requirements",
                inputs=(input_set,),
                outputs=(requirements,),
            ),
            deferred_refinement(
                "requirements→design",
                inputs=(input_set, requirements),
                outputs=(design,),
            ),
            deferred_refinement(
                "design→code",
                inputs=(input_set, requirements, design),
                outputs=(code,),
            ),
        ),
        jobs=(
            Job(
                name="bootstrap_release",
                contracts=(ContractRef(kind="graph_function", target_id=executive.id),),
            ),
        ),
        metadata={"requirements": ["REQ-U5-001"]},
    )


@pytest.mark.integration
class TestU5CumulativeEnvironment:
    @pytest.mark.usecase_id("cumulative_env_exec")
    def test_cumulative_environment_executive_converges_over_real_sandbox(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = _u5_cumulative_environment_module()
        scope = Scope(module=module, workspace_root=workspace)

        executive = module.graph_functions[0]
        assert tuple(node.name for node in executive.environment.requires) == ("input_set",)
        assert tuple(node.name for node in executive.environment.carries) == (
            "input_set",
            "requirements",
            "design",
            "code",
        )

        from genesis.cli_adapter import _assess_result_cmd

        artifact_paths = (
            workspace / "output" / "requirements.md",
            workspace / "output" / "design.md",
            workspace / "output" / "service.py",
        )
        expected_edges = (
            "input_set→requirements",
            "requirements→design",
            "design→code",
        )
        observed_edges: list[str] = []

        for artifact_path, expected_edge in zip(artifact_paths, expected_edges, strict=True):
            result = gen_iterate(scope, stream)
            assert result["status"] == "iterated"
            assert result["blocking_reason"] == "fp_dispatch"
            manifest = json.loads(Path(result["fp_manifest_path"]).read_text(encoding="utf-8"))
            observed_edges.append(manifest["edge"])
            assert manifest["edge"] == expected_edge
            artifact_path.parent.mkdir(parents=True, exist_ok=True)
            artifact_path.write_text(f"# {expected_edge}\n", encoding="utf-8")
            _write_fake_result_file(
                Path(manifest["result_path"]),
                edge=manifest["edge"],
                actor="fake_cumulative_env_worker",
            )
            assert _assess_result_cmd(manifest["result_path"], workspace) == 0

        final_gaps = gen_gaps(scope, stream)
        assert observed_edges == list(expected_edges)
        assert final_gaps["converged"] is True
        assert final_gaps["total_delta"] == 0
        run_archive.update_summary(
            lane="fake",
            use_case="cumulative_env_exec",
            observed_edges=observed_edges,
            converged=True,
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


def _u6_schema_zoom_module() -> Module:
    design = Node(name="design", schema="DesignSurface")
    schema_poc = Node(name="schema_poc", schema="SchemaDiscoveryPoc")
    schema_plan = Node(name="schema_plan", schema="SchemaPlan")
    schema = Node(name="schema", schema="SchemaSurface")
    schema_progress = Evaluator("schema_progress", F_P, "schema satisfies the current design contract")

    outer = GraphVector(
        name="design→schema",
        source=design,
        target=schema,
        evaluators=(schema_progress,),
    )
    outer_graph = Graph(
        name="schema_delivery",
        inputs=(design,),
        outputs=(schema,),
        nodes=(design, schema),
        vectors=(outer,),
    )

    discovery = _graph_function(
        "graphfunction.discovery",
        Graph(
            name="schema_discovery_profile",
            inputs=(design,),
            outputs=(schema,),
            nodes=(design, schema_poc, schema),
            vectors=(
                GraphVector("design→schema_poc", design, schema_poc, evaluators=(schema_progress,)),
                GraphVector("schema_poc→schema", schema_poc, schema, evaluators=(schema_progress,)),
            ),
        ),
        tags=("profile:discovery",),
    )
    sdlc = _graph_function(
        "graphfunction.sdlc",
        Graph(
            name="schema_sdlc_profile",
            inputs=(design,),
            outputs=(schema,),
            nodes=(design, schema_plan, schema),
            vectors=(
                GraphVector("design→schema_plan", design, schema_plan, evaluators=(schema_progress,)),
                GraphVector("schema_plan→schema", schema_plan, schema, evaluators=(schema_progress,)),
            ),
        ),
        tags=("profile:sdlc",),
    )

    profiles = candidate_family(
        "design→schema_profiles",
        inputs=(design,),
        outputs=(schema,),
        candidates=(discovery, sdlc),
        policy_hints={"profiles": ("graphfunction.discovery", "graphfunction.sdlc")},
    )
    outer_profile = _graph_function(outer.name, outer_graph)
    job = Job(
        name=outer.name,
        contracts=(ContractRef(kind="graph_function", target_id=outer_profile.id),),
    )
    return Module(
        name="u6_schema_zoom",
        graphs=(outer_graph,),
        graph_functions=(outer_profile, discovery, sdlc),
        candidate_families=(profiles,),
        refinement_boundaries=(
            deferred_refinement("design→schema_poc", inputs=(design,), outputs=(schema_poc,)),
            deferred_refinement("schema_poc→schema", inputs=(schema_poc,), outputs=(schema,)),
            deferred_refinement("design→schema_plan", inputs=(design,), outputs=(schema_plan,)),
            deferred_refinement("schema_plan→schema", inputs=(schema_plan,), outputs=(schema,)),
        ),
        jobs=(job,),
        metadata={"requirements": ["REQ-U6-001"]},
    )


def _u7_schema_discovery_feeds_code_module() -> Module:
    design = Node(name="design", schema="DesignSurface")
    schema_poc = Node(name="schema_poc", schema="SchemaDiscoveryPoc")
    schema_plan = Node(name="schema_plan", schema="SchemaPlan")
    schema = Node(
        name="schema",
        schema="SchemaSurface",
        asset_surface={"kind": "data_schema"},
    )
    code = Node(
        name="code",
        schema="CodeSurface",
        asset_surface={
            "kind": "implementation_code",
            "required_contexts": ("schema",),
            "standards_refs": ("implementation_standard",),
            "output_contract_refs": ("implementation_output_contract",),
        },
    )
    schema_progress = Evaluator("schema_progress", F_P, "schema satisfies the current design contract")
    code_progress = Evaluator("code_progress", F_P, "code satisfies the current design contract")

    outer = GraphVector(
        name="design→schema",
        source=design,
        target=schema,
        evaluators=(schema_progress,),
    )
    outer_graph = Graph(
        name="schema_delivery_for_code",
        inputs=(design,),
        outputs=(schema,),
        nodes=(design, schema),
        vectors=(outer,),
    )

    discovery = _graph_function(
        "graphfunction.discovery",
        Graph(
            name="schema_discovery_profile_for_code",
            inputs=(design,),
            outputs=(schema,),
            nodes=(design, schema_poc, schema),
            vectors=(
                GraphVector("design→schema_poc", design, schema_poc, evaluators=(schema_progress,)),
                GraphVector("schema_poc→schema", schema_poc, schema, evaluators=(schema_progress,)),
            ),
        ),
        tags=("profile:discovery",),
    )
    sdlc = _graph_function(
        "graphfunction.sdlc",
        Graph(
            name="schema_sdlc_profile_for_code",
            inputs=(design,),
            outputs=(schema,),
            nodes=(design, schema_plan, schema),
            vectors=(
                GraphVector("design→schema_plan", design, schema_plan, evaluators=(schema_progress,)),
                GraphVector("schema_plan→schema", schema_plan, schema, evaluators=(schema_progress,)),
            ),
        ),
        tags=("profile:sdlc",),
    )
    profiles = candidate_family(
        "design→schema_profiles_for_code",
        inputs=(design,),
        outputs=(schema,),
        candidates=(discovery, sdlc),
        policy_hints={"profiles": ("graphfunction.discovery", "graphfunction.sdlc")},
    )
    schema_profile = _graph_function(outer.name, outer_graph)
    implement_code = GraphFunction.from_graph(
        name="schema_to_code",
        graph=Graph(
            name="schema_to_code",
            inputs=(design, schema),
            outputs=(code,),
            nodes=(design, schema, code),
            vectors=(
                GraphVector(
                    "design→code",
                    design,
                    code,
                    evaluators=(code_progress,),
                ),
            ),
        ),
        environment=EnvRef.from_contract(
            requires=(design, schema),
            provides=(code,),
        ),
    )
    executive = compose(schema_profile, implement_code)
    materialized = executive.materialize()
    boundaries = tuple(
        deferred_refinement(
            vector.name,
            inputs=vector.source if isinstance(vector.source, tuple) else (vector.source,),
            outputs=(vector.target,),
        )
        for vector in materialized.vectors
        if vector.name != "design→schema"
    )
    job = Job(
        name="schema_discovery_feeds_code",
        contracts=(ContractRef(kind="graph_function", target_id=executive.id),),
    )
    return Module(
        name="u7_schema_discovery_feeds_code",
        graphs=(materialized,),
        graph_functions=(executive, schema_profile, discovery, sdlc, implement_code),
        candidate_families=(profiles,),
        refinement_boundaries=boundaries,
        jobs=(job,),
        metadata={"requirements": ["REQ-U7-001"]},
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

    @pytest.mark.usecase_id("u6_schema_zoom")
    def test_design_to_schema_zoom_selects_discovery_route_and_rebinds_parent(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = _u6_schema_zoom_module()
        scope = Scope(module=module, workspace_root=workspace)
        run_archive.note(
            "scenario",
            lane="fake",
            edge="design→schema",
            selection="graphfunction.discovery",
            route="design_to_schema_poc_then_foldback",
        )
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())

        executable_job = module_to_executable_jobs(module)[0]
        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(executable_job),
            workspace_root=workspace,
            stream=stream,
            worker=scope.worker,
            spec_hash="spec-u6",
            work_key=executable_job.vector.id,
        )
        selected = traverse(
            Traversal(
                work_key=executable_job.vector.id,
                target=module.candidate_families[0],
                selection=SelectionDecision(
                    contract_id=executable_job.vector.id,
                    work_key=executable_job.vector.id,
                    graph_function="graphfunction.discovery",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="schema is missing so zoom into a PoC-style discovery route",
                ),
                evaluators=executable_job.vector.evaluators,
            ),
            runtime=runtime,
            surface=WorkSurface(),
        )
        assert selected.result["status"] == "selected"
        frame_id = selected.result["frame_id"]
        frame_id = selected.result["frame_id"]
        family = module.candidate_families[0]
        assert [candidate.name for candidate in family.candidates] == [
            "graphfunction.discovery",
            "graphfunction.sdlc",
        ]
        assert any(event["event_type"] == "work_spawned" for event in selected.surface.events)

        steps = (
            (
                "design→schema_poc",
                Path("docs/60-generated-schema-poc.md"),
                "# Generated Schema PoC\n\nA focused discovery route established the first schema hypothesis.\n",
            ),
            (
                "schema_poc→schema",
                Path("docs/60-generated-schema.md"),
                "# Generated Schema\n\nThe discovery route delivered a typed schema surface back to the parent design lane.\n",
            ),
        )

        from genesis.cli_adapter import _assess_result_cmd

        for edge_name, artifact_relpath, artifact_text in steps:
            result = gen_iterate(scope, stream)
            assert result["status"] == "iterated"
            assert result["blocking_reason"] == "fp_dispatch"
            manifest = json.loads(Path(result["fp_manifest_path"]).read_text(encoding="utf-8"))
            assert manifest["edge"] == edge_name
            artifact_path = workspace / artifact_relpath
            artifact_path.parent.mkdir(parents=True, exist_ok=True)
            artifact_path.write_text(artifact_text, encoding="utf-8")
            _write_fake_result_file(
                Path(manifest["result_path"]),
                edge=edge_name,
                actor="fake_schema_child_judge",
                evaluator="schema_progress",
            )
            assert _assess_result_cmd(manifest["result_path"], workspace) == 0

        before_rebind = gen_gaps(scope, stream)
        assert before_rebind["total_delta"] == 0
        assert before_rebind["open_frames"] == 1
        assert before_rebind["converged"] is False
        assert project(stream, "frame", frame_id)["status"] == "open"

        rebound = gen_iterate(scope, stream)
        assert rebound["status"] == "iterated"
        assert rebound["edge"] == "design→schema"
        assert rebound["blocking_reason"] == "fp_dispatch"
        rebound_events = [event["event_type"] for event in stream.all_events()]
        assert "foldback_opened" in rebound_events
        assert "frame_rebound" in rebound_events
        assert "frame_closed" in rebound_events

        schema_artifact = workspace / "docs" / "60-generated-schema.md"
        assert schema_artifact.read_text(encoding="utf-8").startswith("# Generated Schema")
        rebound_manifest = json.loads(Path(rebound["fp_manifest_path"]).read_text(encoding="utf-8"))
        _write_fake_result_file(
            Path(rebound_manifest["result_path"]),
            edge="design→schema",
            actor="fake_schema_parent_judge",
            evaluator="schema_progress",
        )
        assert _assess_result_cmd(rebound_manifest["result_path"], workspace) == 0

        after = gen_gaps(scope, stream)
        assert after["converged"] is True

    @pytest.mark.usecase_id("u7_asset_surface_downstream_consumption")
    def test_discovered_schema_asset_surface_unblocks_downstream_code_edge(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = _u7_schema_discovery_feeds_code_module()
        scope = Scope(module=module, workspace_root=workspace)
        run_archive.note(
            "scenario",
            lane="fake",
            edge="design→schema",
            selection="graphfunction.discovery",
            route="schema_discovery_then_code_via_asset_surface",
        )

        initial = gen_gaps(scope, stream)
        initial_by_edge = {entry["edge"]: entry for entry in initial["gaps"]}
        assert initial_by_edge["design→code"]["missing_required_bindings"] == ["schema"]

        executable_job = module_to_executable_jobs(module)[0]
        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(executable_job),
            workspace_root=workspace,
            stream=stream,
            worker=scope.worker,
            spec_hash="spec-u7",
            work_key=executable_job.vector.id,
        )
        selected = traverse(
            Traversal(
                work_key=executable_job.vector.id,
                target=module.candidate_families[0],
                selection=SelectionDecision(
                    contract_id=executable_job.vector.id,
                    work_key=executable_job.vector.id,
                    graph_function="graphfunction.discovery",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="schema must be discovered before code can lawfully open",
                ),
                evaluators=executable_job.vector.evaluators,
            ),
            runtime=runtime,
            surface=WorkSurface(),
        )
        assert selected.result["status"] == "selected"
        frame_id = selected.result["frame_id"]

        from genesis.cli_adapter import _assess_result_cmd

        child_steps = (
            (
                "design→schema_poc",
                Path("docs/70-generated-schema-poc.md"),
                "# Generated Schema PoC\n\nDiscovery established a candidate schema from the design input.\n",
            ),
            (
                "schema_poc→schema",
                Path("docs/70-generated-schema.md"),
                "# Generated Schema\n\nDiscovery returned a typed schema surface consumable by downstream code work.\n",
            ),
        )
        for edge_name, artifact_relpath, artifact_text in child_steps:
            result = gen_iterate(scope, stream)
            assert result["status"] == "iterated"
            assert result["blocking_reason"] == "fp_dispatch"
            manifest = json.loads(Path(result["fp_manifest_path"]).read_text(encoding="utf-8"))
            assert manifest["edge"] == edge_name
            artifact_path = workspace / artifact_relpath
            artifact_path.parent.mkdir(parents=True, exist_ok=True)
            artifact_path.write_text(artifact_text, encoding="utf-8")
            _write_fake_result_file(
                Path(manifest["result_path"]),
                edge=edge_name,
                actor="fake_schema_child_judge",
                evaluator="schema_progress",
            )
            assert _assess_result_cmd(manifest["result_path"], workspace) == 0

        rebound = gen_iterate(scope, stream)
        assert rebound["status"] == "iterated"
        assert rebound["edge"] == "design→schema"
        assert rebound["blocking_reason"] == "fp_dispatch"
        rebound_manifest = json.loads(Path(rebound["fp_manifest_path"]).read_text(encoding="utf-8"))
        _write_fake_result_file(
            Path(rebound_manifest["result_path"]),
            edge="design→schema",
            actor="fake_schema_parent_judge",
            evaluator="schema_progress",
        )
        assert _assess_result_cmd(rebound_manifest["result_path"], workspace) == 0

        code_iter = gen_iterate(scope, stream)
        assert code_iter["status"] == "iterated"
        assert code_iter["edge"] == "design→code"
        assert code_iter["blocking_reason"] == "fp_dispatch"
        code_manifest = json.loads(Path(code_iter["fp_manifest_path"]).read_text(encoding="utf-8"))
        assert code_manifest["target_asset_surface"] == {
            "kind": "implementation_code",
            "schema": "CodeSurface",
            "required_contexts": ["schema"],
            "standards_refs": ["implementation_standard"],
            "output_contract_refs": ["implementation_output_contract"],
        }
        assert code_manifest["environment_asset_surfaces"]["schema"] == {
            "kind": "data_schema",
            "schema": "SchemaSurface",
            "required_contexts": [],
            "standards_refs": [],
            "output_contract_refs": [],
        }
        assert code_manifest["runtime_environment_contract"] == {
            "vector_source_required_contexts": ["design"],
            "asset_surface_required_contexts": ["schema"],
            "asset_surface_injected_required_contexts": ["schema"],
            "effective_required_contexts": ["design", "schema"],
        }
        assert "[ASSET SURFACE]" in code_manifest["prompt"]
        assert "[REQUIRED BOUNDARY]" in code_manifest["prompt"]
        assert "required_contexts: schema" in code_manifest["prompt"]
        assert "asset_surface_injected_required_contexts: schema" in code_manifest["prompt"]
        assert "kind: implementation_code" in code_manifest["prompt"]
        assert "schema [required]" in code_manifest["prompt"]
        assert "required_via=asset_surface" in code_manifest["prompt"]
        assert "Mandatory contexts for this edge: implementation_standard, implementation_output_contract" in code_manifest["prompt"]

        code_artifact = workspace / "docs" / "70-generated-code.md"
        code_artifact.write_text(
            "# Generated Code\n\nThe downstream code lane opened only after the schema surface became carried runtime truth.\n",
            encoding="utf-8",
        )
        _write_fake_result_file(
            Path(code_manifest["result_path"]),
            edge="design→code",
            actor="fake_code_judge",
            evaluator="code_progress",
        )
        assert _assess_result_cmd(code_manifest["result_path"], workspace) == 0

        final_gaps = gen_gaps(scope, stream)
        assert final_gaps["converged"] is True
        assert final_gaps["total_delta"] == 0
        run_archive.update_summary(
            lane="fake",
            selection="graphfunction.discovery",
            converged=True,
            total_delta=0,
            terminal_edge="design→code",
        )
        assert final_gaps["open_frames"] == 0
        assert project(stream, "frame", frame_id)["status"] == "closed"
        run_archive.update_summary(
            lane="fake",
            converged=True,
            total_delta=0,
            selection="graphfunction.discovery",
            child_edges=["design→schema_poc", "schema_poc→schema"],
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

    @pytest.mark.usecase_id("gsdlc_lite_zoom")
    def test_zoomed_design_selection_rebinds_parent_and_converges_design_lane(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        module = gsdlc_lite_zoom_module(workspace)
        scope = Scope(module=module, workspace_root=workspace)
        run_archive.note(
            "scenario",
            lane="fake",
            edge=GL_REQ_TO_DESIGN_EDGE,
            selection="zoomed_design_profile",
            route="child_chain_then_parent_rebind",
        )

        executable_job = module_to_executable_jobs(module)[0]
        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(executable_job),
            workspace_root=workspace,
            stream=stream,
            worker=scope.worker,
            spec_hash="spec-gsdlc-zoom-rebind",
            work_key=executable_job.vector.id,
        )
        selected = traverse(
            Traversal(
                work_key=executable_job.vector.id,
                target=module.candidate_families[0],
                selection=SelectionDecision(
                    contract_id=executable_job.vector.id,
                    work_key=executable_job.vector.id,
                    graph_function="zoomed_design_profile",
                    selected_by="test_policy",
                    selection_mode="explicit",
                    rationale="exercise recursive zoomed chain through parent rebound",
                ),
                evaluators=executable_job.vector.evaluators,
            ),
            runtime=runtime,
            surface=WorkSurface(),
        )
        assert selected.result["status"] == "selected"
        frame_id = selected.result["frame_id"]

        steps = (
            (
                GL_REQ_TO_DECOMPOSITION_EDGE,
                GL_DECOMPOSITION_ARTIFACT_PATH,
                gsdlc_decomposition_artifact(),
            ),
            (
                GL_DECOMPOSITION_TO_DEPENDENCY_EDGE,
                GL_DEPENDENCY_CHAIN_ARTIFACT_PATH,
                gsdlc_dependency_chain_artifact(),
            ),
            (
                GL_DEPENDENCY_TO_SEQUENCING_EDGE,
                GL_SEQUENCING_ARTIFACT_PATH,
                gsdlc_sequencing_artifact(),
            ),
            (
                GL_SEQUENCING_TO_DESIGN_EDGE,
                GL_DESIGN_ARTIFACT_PATH,
                gsdlc_design_artifact(),
            ),
        )

        from genesis.cli_adapter import _assess_result_cmd

        for edge_name, artifact_relpath, artifact_text in steps:
            result = gen_iterate(scope, stream)
            assert result["status"] == "iterated"
            assert result["blocking_reason"] == "fp_dispatch"
            manifest = json.loads(Path(result["fp_manifest_path"]).read_text(encoding="utf-8"))
            assert manifest["edge"] == edge_name
            (workspace / artifact_relpath).write_text(artifact_text, encoding="utf-8")
            write_gsdlc_result_file(
                Path(manifest["result_path"]),
                edge=edge_name,
                actor="fake_zoom_judge",
                assessments=[{
                    "evaluator": "zoom_progress",
                    "result": "pass",
                    "evidence": f"{artifact_relpath.name} updated with non-empty content",
                }],
            )
            assert _assess_result_cmd(manifest["result_path"], workspace) == 0

        before_rebind = gen_gaps(scope, stream)
        assert before_rebind["total_delta"] == 0
        assert before_rebind["open_frames"] == 1
        assert before_rebind["converged"] is False
        assert project(stream, "frame", frame_id)["status"] == "open"

        rebound = gen_iterate(scope, stream)
        assert rebound["status"] == "iterated"
        assert rebound["edge"] == GL_REQ_TO_DESIGN_EDGE
        assert rebound["blocking_reason"] == "fp_dispatch"
        rebound_events = [event["event_type"] for event in stream.all_events()]
        assert "foldback_opened" in rebound_events
        assert "frame_rebound" in rebound_events
        assert "frame_closed" in rebound_events

        design_check = run_design_standard_check(workspace)
        assert design_check.returncode == 0, design_check.stderr or design_check.stdout
        design_assessments = judge_design_quality(workspace / GL_DESIGN_ARTIFACT_PATH)
        assert all(a["result"] == "pass" for a in design_assessments), design_assessments[0]["evidence"]
        rebound_manifest = json.loads(Path(rebound["fp_manifest_path"]).read_text(encoding="utf-8"))
        write_gsdlc_result_file(
            Path(rebound_manifest["result_path"]),
            edge=GL_REQ_TO_DESIGN_EDGE,
            actor="fake_zoom_parent_judge",
            assessments=[{
                "evaluator": "zoom_progress",
                "result": "pass",
                "evidence": design_assessments[0]["evidence"],
            }],
        )
        assert _assess_result_cmd(rebound_manifest["result_path"], workspace) == 0

        design_scope = Scope(
            module=module,
            workspace_root=workspace,
            worker=scope.worker,
            edge_filter=GL_REQ_TO_DESIGN_EDGE,
        )
        final_gaps = gen_gaps(design_scope, stream)
        assert final_gaps["converged"] is True
        assert final_gaps["total_delta"] == 0
        assert final_gaps["open_frames"] == 0
        assert project(stream, "frame", frame_id)["status"] == "closed"
        run_archive.update_summary(
            lane="fake",
            selection="zoomed_design_profile",
            parent_manifest_id=rebound_manifest["manifest_id"],
            converged=True,
            total_delta=0,
        )
