# Validates: REQ-L-GTL3-GRAPHFUNCTION
# Validates: REQ-L-GTL3-SYNTHESIS
# Validates: REQ-L-GTL3-SELECTION-BOUNDARY
# Validates: REQ-L-GTL3-HOF
# Validates: REQ-R-ABG3-INTERPRET
# Validates: REQ-R-ABG3-CONVERGENCE
# Validates: REQ-R-ABG3-SELECTION-APPLICATION
"""
Requirements-driven U1-U4 use cases over the current GTL/ABG surface.

U1: materialization profiles use explicit CandidateFamily plus explicit SelectionDecision.
U2: gap-triggered discovery runs through a published RefinementBoundary.
U3: consensus-gated review reuses vector convergence over multiple F_P judges.
U4: parallel worker harvest is explicit fan_out -> promote -> fan_in -> gate topology.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from gtl.algebra import candidate_family, compose, deferred_refinement, fan_in, fan_out, gate, promote
from gtl.function_model import EnvRef, GraphFunction
from gtl.graph import Graph, GraphVector, Node
from gtl.module_model import Module
from gtl.operator_model import Evaluator, Rule, F_P
from gtl.work_model import ContractRef, Job

from genesis.binding import PrecomputedManifest, WorkSurface, module_to_executable_jobs
from genesis.convergence import EvaluatorOutcome, delta
from genesis.install import workspace_bootstrap
from genesis.interpret import Traversal, TraversalRuntime, traverse
from genesis.projection import project
from genesis.selection import SelectionDecision, resolve_candidate_family, resolve_refinement_boundary
from genesis.services import Scope


def _graph_function(name: str, graph: Graph, *, tags: tuple[str, ...] = ()) -> GraphFunction:
    return GraphFunction.from_graph(
        name=name,
        graph=graph,
        environment=EnvRef.from_contract(requires=graph.inputs, provides=graph.outputs),
        tags=tags,
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


@pytest.mark.integration
class TestU1MaterializationProfiles:
    def test_candidate_family_profile_requires_explicit_selection(self, tmp_path):
        design = Node(name="design", schema="DesignDoc")
        scaffold = Node(name="scaffold", schema="Scaffold")
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

        steelthread = _graph_function(
            "steelthread_profile",
            Graph(
                name="steelthread_profile",
                inputs=(design,),
                outputs=(code,),
                nodes=(design, scaffold, code),
                vectors=(
                    GraphVector("design→scaffold", design, scaffold, evaluators=(eval_fp,)),
                    GraphVector("scaffold→code", scaffold, code, evaluators=(eval_fp,)),
                ),
            ),
            tags=("profile:steelthread",),
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
            candidates=(steelthread, mvp, optimal),
            policy_hints={"profiles": ("steelthread", "mvp", "optimal")},
            tags=("materialization_profiles",),
        )
        outer_profile = _graph_function(outer.name, outer_graph)
        job = Job(
            name=outer.name,
            contracts=(ContractRef(kind="graph_function", target_id=outer_profile.id),),
        )
        module = Module(
            name="u1_profiles",
            graphs=(outer_graph,),
            graph_functions=(outer_profile, steelthread, mvp, optimal),
            candidate_families=(profiles,),
            jobs=(job,),
            metadata={"requirements": ["REQ-U1-001"]},
        )

        stream = workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path)
        assert resolve_candidate_family(scope.module, outer.id) == profiles

        executable_job = module_to_executable_jobs(module)[0]
        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(executable_job),
            workspace_root=tmp_path,
            stream=stream,
            worker=scope.worker,
            spec_hash="spec-u1",
            work_key=outer.id,
        )
        traversal = Traversal(
            work_key=outer.id,
            target=profiles,
            selection=SelectionDecision(
                contract_id=outer.id,
                work_key=outer.id,
                graph_function="mvp_profile",
                selected_by="test_policy",
                selection_mode="explicit",
                rationale="materialize mvp profile for current contract",
            ),
            evaluators=outer.evaluators,
        )

        outcome = traverse(traversal, runtime=runtime, surface=WorkSurface())

        assert outcome.result["status"] == "selected"
        assert outcome.result["graph_function"] == "mvp_profile"
        assert {
            vector.name
            for graph in module.graphs
            for vector in graph.vectors
        } == {"design→code"}
        frame_state = project(stream, "frame", outcome.result["frame_id"])
        assert frame_state["status"] == "open"
        assert {step["edge"] for step in frame_state["child_steps"]} == {
            "design→prototype",
            "prototype→code",
        }


@pytest.mark.integration
class TestU2GapTriggeredRefinement:
    def test_published_refinement_boundary_drives_traversal(self, tmp_path):
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
            "raw_contract→discovered_context",
            inputs=(raw_contract,),
            outputs=(discovered_context,),
            hints={"use_case": "gap_triggered_context_discovery"},
        )
        graph_function = _graph_function(vector.name, graph)
        job = Job(
            name=vector.name,
            contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),),
        )
        module = Module(
            name="u2_discovery",
            graphs=(graph,),
            graph_functions=(graph_function,),
            refinement_boundaries=(boundary,),
            jobs=(job,),
            metadata={"requirements": ["REQ-U2-001"]},
        )

        stream = workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path)
        assert resolve_refinement_boundary(scope.module, vector.id) == boundary

        executable_job = module_to_executable_jobs(module)[0]
        runtime = TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=_precomputed(executable_job, failing=(eval_fp,)),
            workspace_root=tmp_path,
            stream=stream,
            worker=scope.worker,
            spec_hash="spec-u2",
            work_key=vector.id,
        )
        traversal = Traversal(
            work_key=vector.id,
            target=boundary,
            evaluators=vector.evaluators,
        )
        outcome = traverse(traversal, runtime=runtime, surface=WorkSurface())

        assert outcome.result["status"] == "iterated"
        assert outcome.result["blocking_reason"] == "fp_dispatch"
        fp_event = next(
            event
            for event in outcome.surface.events
            if event["event_type"] == "fp_dispatched"
        )
        manifest_path = outcome.result["fp_manifest_path"]
        manifest = json.loads(Path(manifest_path).read_text(encoding="utf-8"))
        assert fp_event["data"]["prompt_length"] == len(manifest["prompt"])


@pytest.mark.integration
class TestU3ConsensusGatedReview:
    def test_multi_fp_review_reuses_convergence_with_declared_quorum(self):
        rule = Rule(name="consensus_gate", kind="consensus", config={"quorum": 4})
        outcomes = (
            EvaluatorOutcome("contract-u3", "judge_1", F_P, "pass", 0),
            EvaluatorOutcome("contract-u3", "judge_2", F_P, "pass", 0),
            EvaluatorOutcome("contract-u3", "judge_3", F_P, "pass", 0),
            EvaluatorOutcome("contract-u3", "judge_4", F_P, "fail", 0),
            EvaluatorOutcome("contract-u3", "judge_5", F_P, "fail", 0),
        )

        result = delta("contract-u3", outcomes, rule=rule)

        assert result.aggregate_state == "open"
        assert result.next_action == "repeat_round"
        assert result.next_regime is None


@pytest.mark.integration
class TestU4ParallelWorkerHarvest:
    def test_parallel_harvest_is_fanout_promote_fanin_gate(self):
        candidate_branches = Node(name="candidate_branches", schema="Vector[Candidate]")
        judgment_vector = Node(name="judgment_vector", schema="Vector[Judgment]")
        selected_candidate = Node(name="selected_candidate", schema="Candidate")

        worker_branch = GraphFunction(
            name="worker_branch",
            inputs=(candidate_branches,),
            outputs=(candidate_branches,),
            environment=EnvRef.from_contract(
                requires=(candidate_branches,),
                provides=(candidate_branches,),
            ),
            template="worker_branch_template",
        )
        harvest_reducer = GraphFunction(
            name="harvest_reducer",
            inputs=(judgment_vector,),
            outputs=(selected_candidate,),
            environment=EnvRef.from_contract(
                requires=(judgment_vector,),
                provides=(selected_candidate,),
            ),
            template="harvest_reducer_template",
        )
        judge = Evaluator("harvest_acceptance", F_P, "harvest satisfies declared policy")
        rule = Rule(name="harvest_gate", kind="consensus", config={"quorum": 1})

        harvest = compose(
            fan_out(worker_branch, over=candidate_branches),
            promote(source=candidate_branches, to=judgment_vector),
            gate(
                fan_in(harvest_reducer, over=judgment_vector),
                rule=rule,
                evaluators=(judge,),
            ),
        )

        assert harvest.inputs == (candidate_branches,)
        assert harvest.outputs == (selected_candidate,)
        assert "over:candidate_branches" in harvest.tags
        assert "source:candidate_branches" in harvest.tags
        assert "to:judgment_vector" in harvest.tags
        assert "rule:harvest_gate" in harvest.tags
