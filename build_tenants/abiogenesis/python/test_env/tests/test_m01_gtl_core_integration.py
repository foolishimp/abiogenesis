# Validates: REQ-L-GTL2-GRAPH
# Validates: REQ-L-GTL2-NODE
# Validates: REQ-L-GTL2-INTERFACE
# Validates: REQ-L-GTL2-OPERATOR
# Validates: REQ-L-GTL2-EVALUATOR
# Validates: REQ-L-GTL2-RULE
# Validates: REQ-L-GTL2-GRAPHFUNCTION
# Validates: REQ-L-GTL2-COMPOSE
# Validates: REQ-L-GTL2-SUBSTITUTE
# Validates: REQ-L-GTL2-RECURSE
# Validates: REQ-L-GTL2-HOF
# Validates: REQ-L-GTL2-SYNTHESIS
# Validates: REQ-L-GTL2-SELECTION-BOUNDARY
# Validates: REQ-L-GTL2-IDENTITY
"""
M01 GTL-core integration lane.

This replaces the legacy algebra/type/contract microtests with integration checks
over real GTL graph programs, higher-order operators, and structural alternatives.
"""
from __future__ import annotations

import pytest

from gtl.algebra import (
    candidate_family,
    compose,
    deferred_refinement,
    edge,
    fan_in,
    fan_out,
    gate,
    promote,
    recurse,
    substitute,
)
from gtl.function_model import GraphFunction
from gtl.graph import Context, Graph, GraphVector, Node
from gtl.operator_model import Evaluator, F_D, F_P, Rule


def _graph_function(
    name: str,
    *,
    inputs: tuple[Node, ...],
    outputs: tuple[Node, ...],
    vectors: tuple[GraphVector, ...] = (),
    contexts: tuple[Context, ...] = (),
    effects: tuple = (),
    tags: tuple[str, ...] = (),
) -> GraphFunction:
    graph = Graph(
        name=name,
        inputs=inputs,
        outputs=outputs,
        nodes=tuple({*inputs, *outputs}),
        vectors=vectors,
        contexts=contexts,
    )
    return GraphFunction(
        name=name,
        inputs=inputs,
        outputs=outputs,
        template=lambda graph=graph: graph,
        effects=effects,
        tags=tags,
    )


@pytest.mark.integration
class TestM01GtlCoreIntegration:
    def test_composition_materializes_one_graph_program_with_merged_contexts_and_vectors(self) -> None:
        intent = Node(name="intent", schema="Intent")
        requirements = Node(name="requirements", schema="Requirements")
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")

        spec = Context(
            name="spec",
            locator="workspace://specification/requirements/",
            digest="sha256:" + "1" * 64,
        )
        design_ctx = Context(
            name="design_surface",
            locator="workspace://build_tenants/abiogenesis/python/design/",
            digest="sha256:" + "2" * 64,
        )

        design_vector = GraphVector("requirements→design", requirements, design)
        code_vector = GraphVector("design→code", design, code)

        requirements_to_design = _graph_function(
            "requirements_to_design",
            inputs=(intent,),
            outputs=(design,),
            vectors=(edge(intent, requirements).vectors[0], design_vector),
            contexts=(spec,),
            effects=("derive_design",),
            tags=("m01",),
        )
        design_to_code = _graph_function(
            "design_to_code",
            inputs=(design,),
            outputs=(code,),
            vectors=(code_vector,),
            contexts=(design_ctx,),
            effects=("realize_code",),
            tags=("m01", "implementation"),
        )

        program = compose(requirements_to_design, design_to_code)
        materialized = program.template()

        assert program.inputs == (intent,)
        assert program.outputs == (code,)
        assert program.effects == ("derive_design", "realize_code")
        assert "implementation" in program.tags
        assert {ctx.name for ctx in materialized.contexts} == {"spec", "design_surface"}
        assert {vector.name for vector in materialized.vectors} == {
            "intent→requirements",
            "requirements→design",
            "design→code",
        }
        assert [node.name for node in materialized.nodes].count("design") == 1

    def test_substitution_rewrites_by_vector_identity_and_mints_new_graph_identity(self) -> None:
        intent = Node(name="intent", schema="Intent")
        requirements = Node(name="requirements", schema="Requirements")
        feature_decomp = Node(name="feature_decomp", schema="FeatureDecomp")
        design = Node(name="design", schema="Design")

        coarse = GraphVector(name="requirements→design", source=requirements, target=design)
        passthrough = GraphVector(name="requirements→design", source=intent, target=requirements)
        outer = Graph(
            name="delivery",
            inputs=(intent,),
            outputs=(design,),
            nodes=(intent, requirements, design),
            vectors=(passthrough, coarse),
        )

        inner = Graph(
            name="requirements_refined",
            inputs=(requirements,),
            outputs=(design,),
            nodes=(requirements, feature_decomp, design),
            vectors=(
                GraphVector("requirements→feature_decomp", requirements, feature_decomp),
                GraphVector("feature_decomp→design", feature_decomp, design),
            ),
        )

        substituted = substitute(outer, coarse.id, inner)

        assert substituted.id != outer.id
        assert substituted.name == outer.name
        assert {vector.name for vector in substituted.vectors} == {
            "requirements→design",
            "requirements→feature_decomp",
            "feature_decomp→design",
        }
        surviving = [vector for vector in substituted.vectors if vector.name == "requirements→design"]
        assert len(surviving) == 1
        assert surviving[0].id == passthrough.id
        assert "substituted:requirements→design" in substituted.tags

    def test_higher_order_programs_preserve_declared_outer_boundaries(self) -> None:
        candidate_branches = Node(name="candidate_branches", schema="Vector[Candidate]")
        judgment_vector = Node(name="judgment_vector", schema="Vector[Judgment]")
        selected_candidate = Node(name="selected_candidate", schema="Candidate")

        worker_branch = GraphFunction(
            name="worker_branch",
            inputs=(candidate_branches,),
            outputs=(candidate_branches,),
            template="worker_branch_template",
            effects=("worker_pass",),
        )
        harvest_reducer = GraphFunction(
            name="harvest_reducer",
            inputs=(judgment_vector,),
            outputs=(selected_candidate,),
            template="harvest_reducer_template",
            effects=("reduce",),
        )
        harvest_acceptance = Evaluator("harvest_acceptance", F_P, "harvest satisfies declared policy")
        harvest_gate = Rule(name="harvest_gate", kind="consensus", config={"quorum": 1})

        harvest_program = compose(
            fan_out(worker_branch, over=candidate_branches),
            promote(source=candidate_branches, to=judgment_vector),
            gate(
                fan_in(harvest_reducer, over=judgment_vector),
                rule=harvest_gate,
                evaluators=(harvest_acceptance,),
            ),
        )

        assert harvest_program.inputs == (candidate_branches,)
        assert harvest_program.outputs == (selected_candidate,)
        assert "over:candidate_branches" in harvest_program.tags
        assert "source:candidate_branches" in harvest_program.tags
        assert "to:judgment_vector" in harvest_program.tags
        assert "rule:harvest_gate" in harvest_program.tags
        assert "worker_pass" in harvest_program.effects
        assert "reduce" in harvest_program.effects

    def test_structural_alternatives_are_explicit_and_fail_closed(self) -> None:
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        implementation = Node(name="implementation", schema="Implementation")

        recurse_done = Evaluator("done", F_D, binding="exec://python -c 'import sys; sys.exit(0)'")
        direct = _graph_function(
            "direct_profile",
            inputs=(design,),
            outputs=(code,),
            effects=("direct",),
        )
        staged = _graph_function(
            "staged_profile",
            inputs=(design,),
            outputs=(code,),
            vectors=(GraphVector("design→implementation", design, implementation),),
            effects=("staged",),
        )

        recursive = recurse(direct, recurse_done)
        assert recursive.inputs == direct.inputs
        assert recursive.outputs == direct.outputs
        assert "termination:done" in recursive.tags

        boundary = deferred_refinement(
            "design→code",
            inputs=(design,),
            outputs=(code,),
            hints={"family": "delivery.profiles"},
        )
        family = candidate_family(
            "design→code_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(direct, staged),
            policy_hints={"default": "direct_profile"},
        )

        assert boundary.inputs == (design,)
        assert boundary.outputs == (code,)
        assert boundary.hints["family"] == "delivery.profiles"
        assert tuple(candidate.name for candidate in family.candidates) == (
            "direct_profile",
            "staged_profile",
        )
        assert family.policy_hints["default"] == "direct_profile"

        with pytest.raises(ValueError, match="contract"):
            candidate_family(
                "broken_profiles",
                inputs=(design,),
                outputs=(code,),
                candidates=(
                    direct,
                    _graph_function(
                        "broken",
                        inputs=(design,),
                        outputs=(implementation,),
                    ),
                ),
            )
