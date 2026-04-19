# Validates: REQ-L-GTL3-MODULE
# Validates: REQ-L-GTL3-JOB
# Validates: REQ-L-GTL3-ROLE
# Validates: REQ-L-GTL3-IDENTITY
# Validates: REQ-L-GTL3-SELECTION-BOUNDARY
# Validates: REQ-R-ABG3-JOB-WORKER
"""
M02 work-publication integration lane.

This lane exercises the authored package modules and their published
job/role/traversal surfaces.
"""
from __future__ import annotations

import importlib
import inspect
from pathlib import Path

import pytest

from gtl.algebra import candidate_family, compose, deferred_refinement, recurse
from gtl.function_model import EnvRef, GraphFunction, TemplateRef
from gtl.graph import Attrs, Graph, Node, GraphVector
from gtl.module_model import Module
from gtl.operator_model import Evaluator, F_D, Operator
from gtl.work_model import ContractRef, Job

from genesis.binding import ExecutableJob, module_to_executable_jobs
from genesis.frames import (
    build_frame_traversal_surface,
    build_frame_traversal_surface_from_graph_function,
    deserialize_frame,
    open_invocation_frame,
    resolve_frame_candidate_family,
    resolve_frame_refinement_boundary,
    serialize_frame,
    validate_frame_selection_surface,
    validate_frame_traversal_surface,
)
from genesis.install import workspace_bootstrap
from genesis.selection import (
    resolve_refinement_boundary,
    resolve_surface_candidate_family,
    validate_selection_surface,
    validate_traversal_surface,
)
from genesis.services import Scope


def _package_source(module_name: str) -> str:
    return inspect.getsource(importlib.import_module(module_name))


@pytest.mark.integration
class TestM02WorkPublicationIntegration:
    def test_scope_rejects_job_bound_public_carrier_without_published_materialized_vectors(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        vector = GraphVector("design→code", design, code)
        carrier = GraphFunction.from_graph(
            name="design_profile",
            graph=Graph(
                name="design_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, code),
                vectors=(vector,),
            ),
            environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
        )
        module = Module(
            name="m02_missing_module_graphs",
            graph_functions=(carrier,),
            refinement_boundaries=(deferred_refinement("design→code", inputs=(design,), outputs=(code,)),),
            jobs=(Job(name="design→code", contracts=(ContractRef(kind="graph_function", target_id=carrier.id),)),),
        )

        with pytest.raises(ValueError, match="must publish their materialized vectors through Module.graphs"):
            Scope(module=module, workspace_root=tmp_path)

    def test_frame_traversal_surface_prefers_local_truth_then_imported_truth_and_allows_direct_vector_execution(self) -> None:
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        vector = GraphVector("design→code", design, code)

        local = GraphFunction(
            name="local_profile",
            inputs=(design,),
            outputs=(code,),
            environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
            template=TemplateRef.symbolic("local_profile"),
        )
        imported = GraphFunction(
            name="imported_profile",
            inputs=(design,),
            outputs=(code,),
            environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
            template=TemplateRef.symbolic("imported_profile"),
        )
        local_family = candidate_family(
            "local_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(local,),
        )
        imported_family = candidate_family(
            "imported_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(imported,),
        )
        local_boundary = deferred_refinement("design→code", inputs=(design,), outputs=(code,))
        imported_boundary = deferred_refinement("design→code", inputs=(design,), outputs=(code,))

        hidden_surface = build_frame_traversal_surface(
            vectors=(vector,),
            local_graph_functions=(local,),
        )
        with pytest.raises(ValueError, match="hidden contracts"):
            validate_frame_selection_surface(hidden_surface)

        missing_surface = build_frame_traversal_surface(vectors=(vector,))
        validate_frame_traversal_surface(missing_surface, vector_id=vector.id)
        assert resolve_frame_candidate_family(missing_surface, vector.id) is None
        assert resolve_frame_refinement_boundary(missing_surface, vector.id) is None

        surface = build_frame_traversal_surface(
            vectors=(vector,),
            local_candidate_families=(local_family,),
            local_refinement_boundaries=(local_boundary,),
            imported_candidate_families=(imported_family,),
            imported_refinement_boundaries=(imported_boundary,),
        )
        validate_frame_traversal_surface(surface, vector_id=vector.id)
        assert resolve_frame_candidate_family(surface, vector.id) == local_family
        assert resolve_frame_refinement_boundary(surface, vector.id) == local_boundary

        imported_only = build_frame_traversal_surface(
            vectors=(vector,),
            imported_candidate_families=(imported_family,),
            imported_refinement_boundaries=(imported_boundary,),
        )
        assert resolve_frame_candidate_family(imported_only, vector.id) == imported_family
        assert resolve_frame_refinement_boundary(imported_only, vector.id) == imported_boundary

    def test_job_bound_symbolic_composed_carrier_materializes_against_published_module_truth(self, tmp_path: Path) -> None:
        design = Node(name="design", schema="Design")
        review = Node(name="review_assessment", schema="ReviewAssessment")
        decision = Node(name="consensus_decision", schema="ConsensusDecision")
        reviewed = Node(name="reviewed_design", schema="ReviewedDesign")

        review_eval = Evaluator("review_ready", F_D, "review surface present")
        decision_eval = Evaluator("decision_ready", F_D, "decision surface present")
        apply_eval = Evaluator("reviewed_design_ready", F_D, "reviewed design present")
        terminate = Evaluator("consensus_terminated", F_D, "consensus round may stop")

        review_round = GraphFunction.from_graph(
            name="review_design_assessment_round",
            graph=Graph(
                name="review_design_assessment_round_graph",
                inputs=(design,),
                outputs=(review,),
                nodes=(design, review),
                vectors=(GraphVector("review_design_assessment_round", design, review, evaluators=(review_eval,)),),
            ),
            environment=EnvRef.from_contract(requires=(design,), provides=(review,)),
            declarations=Attrs.coerce({"selection_visible": False}),
        )
        reduce_round = GraphFunction.from_graph(
            name="reduce_design_consensus_decision",
            graph=Graph(
                name="reduce_design_consensus_decision_graph",
                inputs=(review,),
                outputs=(decision,),
                nodes=(review, decision),
                vectors=(GraphVector("reduce_design_consensus_decision", review, decision, evaluators=(decision_eval,)),),
            ),
            environment=EnvRef.from_contract(requires=(review,), provides=(decision,)),
            declarations=Attrs.coerce({"selection_visible": False}),
        )
        apply_round = GraphFunction.from_graph(
            name="apply_design_consensus_decision",
            graph=Graph(
                name="apply_design_consensus_decision_graph",
                inputs=(design, decision),
                outputs=(reviewed,),
                nodes=(design, decision, reviewed),
                vectors=(GraphVector("apply_design_consensus_decision", (design, decision), reviewed, evaluators=(apply_eval,)),),
            ),
            environment=EnvRef.from_contract(requires=(design, decision), provides=(reviewed,)),
            declarations=Attrs.coerce({"selection_visible": False}),
        )

        symbolic_review = GraphFunction(
            name="review_design_assessment_round",
            inputs=(design,),
            outputs=(review,),
            environment=EnvRef.from_contract(requires=(design,), provides=(review,)),
            template=TemplateRef.symbolic("review_design_assessment_round"),
        )
        symbolic_reduce = GraphFunction(
            name="reduce_design_consensus_decision",
            inputs=(review,),
            outputs=(decision,),
            environment=EnvRef.from_contract(requires=(review,), provides=(decision,)),
            template=TemplateRef.symbolic("reduce_design_consensus_decision"),
        )
        symbolic_apply = GraphFunction(
            name="apply_design_consensus_decision",
            inputs=(design, decision),
            outputs=(reviewed,),
            environment=EnvRef.from_contract(requires=(design, decision), provides=(reviewed,)),
            template=TemplateRef.symbolic("apply_design_consensus_decision"),
        )
        symbolic_library = recurse(
            compose(symbolic_review, symbolic_reduce, symbolic_apply),
            terminate,
            foldback={"mode": "rebind", "binding": "reviewed_design", "requires_parent_evaluation": True},
        )
        compiled_library = recurse(
            compose(review_round, reduce_round, apply_round),
            terminate,
            foldback={"mode": "rebind", "binding": "reviewed_design", "requires_parent_evaluation": True},
        )

        module = Module(
            name="m02_symbolic_consensus_module",
            graphs=(compiled_library.materialize(),),
            graph_functions=(symbolic_library, review_round, reduce_round, apply_round),
            refinement_boundaries=tuple(
                deferred_refinement(
                    vector.name,
                    inputs=vector.source if isinstance(vector.source, tuple) else (vector.source,),
                    outputs=(vector.target,),
                )
                for vector in compiled_library.materialize().vectors
            ),
            jobs=(Job(name="review_design_by_consensus", contracts=(ContractRef(kind="graph_function", target_id=symbolic_library.id),)),),
            evaluators=(review_eval, decision_eval, apply_eval, terminate),
        )

        executable_jobs = module_to_executable_jobs(module)

        assert [job.vector.name for job in executable_jobs] == [
            "review_design_assessment_round",
            "reduce_design_consensus_decision",
            "apply_design_consensus_decision",
        ]
        assert {job.graph_function.name for job in executable_jobs} == {symbolic_library.name}
        workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path, build="symbolic_consensus")
        assert [job.vector.name for job in scope.worker.can_execute] == [
            "review_design_assessment_round",
            "reduce_design_consensus_decision",
            "apply_design_consensus_decision",
        ]

    def test_frame_traversal_surface_builder_does_not_synthesize_implicit_boundaries(self) -> None:
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        vector = GraphVector("design→code", design, code)
        candidate = GraphFunction.from_graph(
            name="direct_profile",
            graph=Graph(
                name="direct_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, code),
                vectors=(vector,),
            ),
            environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
        )

        surface = build_frame_traversal_surface_from_graph_function(
            candidate,
            vectors=(vector,),
        )

        validate_frame_traversal_surface(surface, vector_id=vector.id)
        assert surface.local_refinement_boundaries == ()
        assert resolve_frame_candidate_family(surface, vector.id) is None
        assert resolve_frame_refinement_boundary(surface, vector.id) is None

    def test_invocation_frames_keep_stable_lineage_but_mint_fresh_attempt_identity(self) -> None:
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        prototype = Node(name="prototype", schema="Prototype")
        builder = Operator("builder", binding="exec://builder")
        fd_ok = Evaluator("fd_ok", F_D, binding="exec://python -c 'import sys; sys.exit(0)'")
        outer = GraphVector(
            "design→code",
            design,
            code,
            operators=(builder,),
            evaluators=(fd_ok,),
            declarations={
                "dispatch_hook": "abg.dispatch.default",
                "closure_hook": "abg.closure.default",
            },
        )
        inner = GraphVector(
            "design→prototype",
            design,
            prototype,
            operators=(builder,),
            evaluators=(fd_ok,),
            declarations={"proof_hook": "abg.proof.default"},
        )

        parent_job = ExecutableJob(
            job=Job(
                name=outer.name,
            ),
            graph_function=None,
            materialization_id=None,
            vector=outer,
        )

        first = open_invocation_frame(
            call_id="call-profile-1",
            parent_job=parent_job,
            parent_key=outer.id,
            parent_vector_id=outer.id,
            parent_vector=outer,
            parent_edge=outer.name,
            parent_target=outer.target.name,
            graph_function="profile",
            materialization_id="materialization-1",
            graph_name="profile_graph",
            inner_vectors=(inner,),
            traversal_surface=build_frame_traversal_surface(vectors=(inner,)),
        )
        second = open_invocation_frame(
            call_id="call-profile-2",
            parent_job=parent_job,
            parent_key=outer.id,
            parent_vector_id=outer.id,
            parent_vector=outer,
            parent_edge=outer.name,
            parent_target=outer.target.name,
            graph_function="profile",
            materialization_id="materialization-1",
            graph_name="profile_graph",
            inner_vectors=(inner,),
            traversal_surface=build_frame_traversal_surface(vectors=(inner,)),
        )

        assert first.frame_lineage_id == second.frame_lineage_id
        assert first.frame_attempt_id != second.frame_attempt_id
        assert first.frame_id == first.frame_attempt_id
        assert second.frame_id == second.frame_attempt_id
        assert first.steps[0].frame_id == first.frame_attempt_id
        assert second.steps[0].frame_id == second.frame_attempt_id

        round_trip = deserialize_frame(serialize_frame(first))
        assert round_trip.parent_vector.operators[0].name == "builder"
        assert round_trip.parent_vector.declarations["dispatch_hook"] == "abg.dispatch.default"
        assert round_trip.steps[0].executable_job.vector.declarations["proof_hook"] == "abg.proof.default"

    def test_frame_local_publication_surfaces_fail_closed_on_hidden_or_missing_alternatives(self) -> None:
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        implementation = Node(name="implementation", schema="Implementation")
        vector = GraphVector("design→code", design, code)

        direct = GraphFunction(
            name="direct_profile",
            inputs=(design,),
            outputs=(code,),
            environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
            template=TemplateRef.inline_graph(
                Graph(
                    name="direct_profile",
                    inputs=(design,),
                    outputs=(code,),
                    nodes=(design, code),
                    vectors=(vector,),
                ),
                ref="direct_profile",
            ),
        )

        with pytest.raises(ValueError, match="hidden contracts"):
            validate_selection_surface(
                vectors=(vector,),
                graph_functions=(direct,),
                candidate_families=(),
            )

        with pytest.raises(ValueError, match="must publish"):
            validate_traversal_surface(
                vectors=(vector,),
                refinement_boundaries=(),
                candidate_families=(),
            )

        family = candidate_family(
            "design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(direct,),
        )
        assert resolve_surface_candidate_family(
            vectors=(vector,),
            candidate_families=(family,),
            vector_id=vector.id,
        ) == family

        with pytest.raises(ValueError, match="ambiguous declared candidate families"):
            resolve_surface_candidate_family(
                vectors=(vector,),
                candidate_families=(family, family),
                vector_id=vector.id,
            )

    def test_project_package_publishes_complete_jobs_roles_and_traversal_boundaries(self, tmp_path: Path) -> None:
        from gtl_spec.packages.project_package import module

        assert isinstance(module, Module)
        assert module.name == "project_package"

        graph = module.graphs[0]
        vector_by_id = {vector.id: vector for vector in graph.vectors}
        graph_function_by_id = {graph_function.id: graph_function for graph_function in module.graph_functions}
        job_by_name = {job.name: job for job in module.jobs}
        boundary_by_name = {boundary.name: boundary for boundary in module.refinement_boundaries}

        assert len(graph.vectors) == len(module.jobs) == len(module.refinement_boundaries)
        assert {vector.name for vector in graph.vectors} == set(job_by_name) == set(boundary_by_name)

        constructor = next(role for role in module.roles if role.name == "constructor")
        executable_jobs = module_to_executable_jobs(module)
        assert len(executable_jobs) == len(graph.vectors)

        for executable_job in executable_jobs:
            vector = executable_job.vector
            gtl_job = executable_job.job
            assert len(gtl_job.contracts) == 1
            assert gtl_job.contracts[0].kind == "graph_function"
            assert gtl_job.contracts[0].target_id in graph_function_by_id
            assert executable_job.graph_function == graph_function_by_id[gtl_job.contracts[0].target_id]
            assert resolve_refinement_boundary(module, vector.id) is not None
            if any(evaluator.regime.__name__ == "F_P" for evaluator in vector.evaluators):
                assert gtl_job.roles == (constructor,)
            else:
                assert gtl_job.roles == ()

        workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path, build="publication_router")
        assert len(scope.worker.can_execute) == len(graph.vectors)
        assert constructor.id in scope.worker.role_ids

    def test_abiogenesis_module_publishes_bootloader_surface_and_scope_is_executable(self, tmp_path: Path) -> None:
        from gtl_spec.packages.abiogenesis import module

        assert isinstance(module, Module)
        assert module.name == "abiogenesis"

        graph = module.graphs[0]
        node_names = {node.name for node in graph.nodes}
        vector_names = {vector.name for vector in graph.vectors}

        assert "bootloader_doc" in node_names
        assert "design→bootloader_doc" in vector_names

        executable_jobs = module_to_executable_jobs(module)
        target_names = {job.vector.target.name for job in executable_jobs}
        assert "bootloader_doc" in target_names

        workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path, build="publication_router")
        assert len(scope.worker.can_execute) == len(graph.vectors)

        constructor = next(role for role in module.roles if role.name == "constructor")
        for job in module.jobs:
            executable_vector = next(
                executable_job.vector
                for executable_job in executable_jobs
                if executable_job.job.id == job.id
            )
            if any(
                evaluator.regime.__name__ == "F_P"
                for evaluator in executable_vector.evaluators
            ):
                assert job.roles == (constructor,)

    def test_published_modules_remain_engine_independent_gtl_surfaces(self) -> None:
        project_source = _package_source("gtl_spec.packages.project_package")
        abiogenesis_source = _package_source("gtl_spec.packages.abiogenesis")

        for source in (project_source, abiogenesis_source):
            assert "from genesis" not in source
            assert "import genesis" not in source

    def test_published_modules_expose_stable_identity_and_contract_binding_surfaces(self) -> None:
        from gtl_spec.packages.project_package import module as project_module
        from gtl_spec.packages.abiogenesis import module as abiogenesis_module

        for module in (project_module, abiogenesis_module):
            assert module.roles, f"{module.name} must publish at least one semantic role"
            assert module.graph_functions
            assert all(role.id for role in module.roles)
            assert all(job.id for job in module.jobs)
            assert all(boundary.id for boundary in module.refinement_boundaries)
            assert all(vector.id for graph in module.graphs for vector in graph.vectors)
            published_graph_function_ids = {graph_function.id for graph_function in module.graph_functions}
            assert all(
                contract.kind == "graph_function"
                and contract.target_id in published_graph_function_ids
                for job in module.jobs
                for contract in job.contracts
            )
