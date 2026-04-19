# Validates: REQ-L-GTL3-LANGUAGE
# Validates: REQ-L-GTL3-ATTRS
# Validates: REQ-L-GTL3-CONTEXT
# Validates: REQ-L-GTL3-GRAPH
# Validates: REQ-L-GTL3-NODE
# Validates: REQ-L-GTL3-GRAPHVECTOR
# Validates: REQ-L-GTL3-INTERFACE
# Validates: REQ-L-GTL3-OPERATOR
# Validates: REQ-L-GTL3-EVALUATOR
# Validates: REQ-L-GTL3-RULE
# Validates: REQ-L-GTL3-GRAPHFUNCTION
# Validates: REQ-L-GTL3-HOOKS
# Validates: REQ-L-GTL3-COMPOSE
# Validates: REQ-L-GTL3-SUBSTITUTE
# Validates: REQ-L-GTL3-RECURSE
# Validates: REQ-L-GTL3-HOF
# Validates: REQ-L-GTL3-LAWS
# Validates: REQ-L-GTL3-SYNTHESIS
# Validates: REQ-L-GTL3-SELECTION-BOUNDARY
# Validates: REQ-L-GTL3-IDENTITY
"""
M01 GTL-core integration lane.

This lane exercises real GTL graph programs, higher-order operators, and
structural alternatives.
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
    graph_function_for_vector,
    identity,
    promote,
    recurse,
    substitute,
)
from gtl.function_model import EnvRef, GraphFunction, TemplateRef
from gtl.graph import Attrs, Context, Graph, Node, GraphVector, node_contract_key
from gtl.obligation_ledger import (
    coerce_obligation_ledger_declaration,
)
from gtl.module_model import Module
from gtl.operator_model import Evaluator, F_D, F_P, Rule
from gtl.work_model import ContractRef, Job, Role


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
    return GraphFunction.from_graph(
        name=name,
        graph=graph,
        inputs=inputs,
        outputs=outputs,
        environment=EnvRef.from_contract(requires=inputs, provides=outputs),
        effects=effects,
        tags=tags,
    )


@pytest.mark.integration
class TestM01GtlCoreIntegration:
    def test_obligation_ledger_declaration_accepts_adapter_driven_family(self) -> None:
        declaration = coerce_obligation_ledger_declaration(
            {
                "signal_key": "derive_code_surface",
                "adapter_ref": "odd_sdlc.traceability:declared_requirement_edge_gap",
                "obligation_source_ref": "requirement_surface",
                "obligation_source_kind": "requirement_surface",
                "obligation_source_admission_basis": "authority_or_current_surface",
                "obligation_kind": "requirement",
                "derivation_rule": "implementation_code_projection",
                "carry_rule": "deterministic_requirement_membership",
                "fulfillment_rule": "behavioral_code_realization",
                "evidence_policy": "behavioral_code_evidence",
            }
        )

        assert declaration is not None
        assert declaration["declaration_family"] == "adapter_driven"
        assert declaration["certification_scope"] == "edge"
        assert declaration["signal_key"] == "derive_code_surface"
        assert declaration["obligations"] == []

    def test_obligation_ledger_declaration_rejects_duplicate_evaluator_bindings(self) -> None:
        with pytest.raises(ValueError, match="duplicates .*evaluator"):
            coerce_obligation_ledger_declaration(
                {
                    "obligation_source_ref": "vector://design_to_code#obligation_ledger",
                    "obligation_kind": "fp_evaluator_obligation",
                    "carry_rule": "declared_fulfillment_obligation_set_totality",
                    "fulfillment_rule": "per_obligation_fp_assessment",
                    "evidence_policy": "agent_supplied_evidence_refs",
                    "obligations": [
                        {
                            "id": "first_check",
                            "evaluator": "shared_review",
                            "statement": "first review obligation",
                        },
                        {
                            "id": "second_check",
                            "evaluator": "shared_review",
                            "statement": "second review obligation",
                        },
                    ],
                }
            )

    def test_native_package_vectors_publish_explicit_fp_obligation_declarations(self) -> None:
        from gtl_spec.packages import abiogenesis as abiogenesis_package

        policy = abiogenesis_package.v_req_feat.declarations["obligation_ledger"]

        assert policy["obligation_source_kind"] == "package_declared_fp_obligations"
        assert policy["obligation_source_ref"] == (
            "package://gtl_spec.packages.abiogenesis#requirements→feature_decomp"
        )
        assert policy["obligations"] == [
            {
                "id": "decomp_complete",
                "evaluator": "decomp_complete",
                "statement": abiogenesis_package.eval_decomp_fp.description,
                "source_kind": "package_declared_fp_obligations",
                "source_refs": [
                    "package://gtl_spec.packages.abiogenesis#requirements→feature_decomp/obligation/decomp_complete",
                ],
            }
        ]

    def test_node_asset_surface_is_part_of_the_visible_interface_contract(self) -> None:
        module_design = Node(name="module_design", schema="ModuleDesign")
        schema = Node(name="schema", schema="Schema")
        code_with_schema = Node(
            name="code",
            schema="Code",
            asset_surface={
                "kind": "implementation_code",
                "required_contexts": ("module_design", "schema"),
                "standards_refs": ("code_standard",),
                "output_contract_refs": ("code_output_contract",),
            },
        )
        code_without_schema = Node(
            name="code",
            schema="Code",
            asset_surface={
                "kind": "implementation_code",
                "required_contexts": ("module_design",),
                "standards_refs": ("code_standard",),
                "output_contract_refs": ("code_output_contract",),
            },
        )

        vector = GraphVector("design→code", (module_design, schema), code_with_schema)
        function = GraphFunction.from_graph(
            name="design_to_code",
            graph=Graph(
                name="design_to_code",
                inputs=(module_design, schema),
                outputs=(code_with_schema,),
                nodes=(module_design, schema, code_with_schema),
                vectors=(vector,),
            ),
            environment=EnvRef.from_contract(
                requires=(module_design, schema),
                provides=(code_with_schema,),
            ),
        )

        assert node_contract_key(code_with_schema) != node_contract_key(code_without_schema)
        materialized_output = function.materialize().outputs[0]
        assert materialized_output.asset_surface.kind == "implementation_code"
        assert materialized_output.asset_surface.required_contexts == ("module_design", "schema")
        assert materialized_output.asset_surface.standards_refs == ("code_standard",)
        assert materialized_output.asset_surface.output_contract_refs == ("code_output_contract",)

    def test_graph_vectors_keep_contexts_and_declarations_as_visible_gtl_surfaces(self) -> None:
        intent = Node(name="intent", schema="Intent")
        code = Node(name="code", schema="Code")
        spec = Context(
            name="spec",
            locator="workspace://specification/",
            digest="sha256:" + "9" * 64,
        )
        vector = GraphVector(
            "intent→code",
            intent,
            code,
            contexts=(spec,),
            declarations={
                "dispatch_hook": "abg.dispatch.default",
                "closure_hook": "abg.closure.default",
            },
        )
        program = GraphFunction.from_graph(
            name="intent_to_code",
            graph=Graph(
                name="intent_to_code",
                inputs=(intent,),
                outputs=(code,),
                nodes=(intent, code),
                vectors=(vector,),
                contexts=(spec,),
            ),
            environment=EnvRef.from_contract(requires=(intent,), provides=(code,)),
            declarations={"evaluation_hook": "abg.evaluate.default"},
        )

        materialized = program.materialize()
        materialized_vector = materialized.vectors[0]

        assert isinstance(materialized_vector.declarations, Attrs)
        assert materialized_vector.declarations["dispatch_hook"] == "abg.dispatch.default"
        assert materialized_vector.declarations["closure_hook"] == "abg.closure.default"
        assert materialized_vector.contexts == (spec,)
        assert program.declarations["evaluation_hook"] == "abg.evaluate.default"

    def test_governance_hook_surfaces_remain_visible_across_gtl_publication_carriers(self) -> None:
        intent = Node(name="intent", schema="Intent")
        code = Node(name="code", schema="Code")
        constructor = Role(
            name="constructor",
            policy_hooks={
                "policy_bundle": {
                    "ref": "genesis.policy_defaults:broad_fp_first_bundle",
                    "config": {},
                }
            },
        )
        vector = GraphVector(
            "intent→code",
            intent,
            code,
            declarations={
                "dispatch": {
                    "ref": "genesis.dispatch_runtime:dispatch_bound_manifest_via_supervised_transport",
                    "config": {},
                }
            },
        )
        direct = GraphFunction.from_graph(
            name="direct_path",
            graph=Graph(
                name="direct_path",
                inputs=(intent,),
                outputs=(code,),
                nodes=(intent, code),
                vectors=(vector,),
            ),
            environment=EnvRef.from_contract(requires=(intent,), provides=(code,)),
            declarations={
                "evaluation": {
                    "ref": "genesis.policy_defaults:evaluation_declared_then_generic",
                    "config": {},
                }
            },
        )
        staged = GraphFunction.from_graph(
            name="staged_path",
            graph=Graph(
                name="staged_path",
                inputs=(intent,),
                outputs=(code,),
                nodes=(intent, code),
                vectors=(vector,),
            ),
            environment=EnvRef.from_contract(requires=(intent,), provides=(code,)),
            declarations={
                "closure": {
                    "ref": "genesis.policy_defaults:closure_require_resolution_or_fh",
                    "config": {},
                }
            },
        )
        family = candidate_family(
            "delivery_family",
            inputs=(intent,),
            outputs=(code,),
            candidates=(direct, staged),
            policy_hints={
                "proof": {
                    "ref": "genesis.policy_defaults:proof_recheck_after_fp",
                    "config": {},
                }
            },
        )

        assert isinstance(direct.declarations, Attrs)
        assert direct.declarations["evaluation"]["ref"] == (
            "genesis.policy_defaults:evaluation_declared_then_generic"
        )
        assert isinstance(vector.declarations, Attrs)
        assert vector.declarations["dispatch"]["ref"] == (
            "genesis.dispatch_runtime:dispatch_bound_manifest_via_supervised_transport"
        )
        assert isinstance(constructor.policy_hooks, Attrs)
        assert constructor.policy_hooks["policy_bundle"]["ref"] == (
            "genesis.policy_defaults:broad_fp_first_bundle"
        )
        assert isinstance(family.policy_hints, Attrs)
        assert family.policy_hints["proof"]["ref"] == (
            "genesis.policy_defaults:proof_recheck_after_fp"
        )

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
        materialized = program.materialize()

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
        assert isinstance(program.template, TemplateRef)
        assert program.template.kind == "inline_graph"

    def test_composition_rejects_incompatible_interfaces_and_identity_is_neutral(self) -> None:
        intent = Node(name="intent", schema="Intent")
        requirements = Node(name="requirements", schema="Requirements")
        design = Node(name="design", schema="Design")
        mismatched_design = Node(name="design", schema="Review")

        requirements_to_design = _graph_function(
            "requirements_to_design",
            inputs=(intent,),
            outputs=(design,),
            vectors=(edge(intent, requirements).vectors[0], GraphVector("requirements→design", requirements, design)),
        )
        review_gate = _graph_function(
            "review_gate",
            inputs=(mismatched_design,),
            outputs=(design,),
            vectors=(GraphVector("design_review→design", mismatched_design, design),),
        )

        with pytest.raises(ValueError, match="structurally satisfied"):
            compose(requirements_to_design, review_gate)

        neutral = compose(requirements_to_design, identity((design,)))
        assert neutral.inputs == requirements_to_design.inputs
        assert neutral.outputs == requirements_to_design.outputs
        assert neutral.effects == requirements_to_design.effects
        assert tuple(sorted(neutral.tags)) == tuple(sorted(requirements_to_design.tags))

    def test_composition_preserves_segment_evaluators_on_materialized_vectors(self) -> None:
        requirements = Node(name="requirements", schema="Requirements")
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")

        requirements_ok = Evaluator("requirements_ok", F_D, binding="exec://python -c 'import sys; sys.exit(0)'")
        code_complete = Evaluator("code_complete", F_P, "code satisfies design")

        requirements_to_design = _graph_function(
            "requirements_to_design",
            inputs=(requirements,),
            outputs=(design,),
            vectors=(GraphVector("requirements→design", requirements, design, evaluators=(requirements_ok,)),),
        )
        design_to_code = _graph_function(
            "design_to_code",
            inputs=(design,),
            outputs=(code,),
            vectors=(GraphVector("design→code", design, code, evaluators=(code_complete,)),),
        )

        materialized = compose(requirements_to_design, design_to_code).materialize()
        vectors = {vector.name: vector for vector in materialized.vectors}

        assert tuple(evaluator.name for evaluator in vectors["requirements→design"].evaluators) == ("requirements_ok",)
        assert tuple(evaluator.name for evaluator in vectors["design→code"].evaluators) == ("code_complete",)

    def test_graph_function_for_vector_publishes_one_vector_as_a_public_carrier(self) -> None:
        design = Node(name="design", schema="Design")
        review = Node(name="review", schema="Review")
        design_surface = Context(
            name="design_surface",
            locator="workspace://design.md",
            digest="sha256:" + "8" * 64,
        )
        review_gate = Rule(name="review_gate", kind="gate", config={"approve": {"kind": "consensus", "n": 1, "m": 1}})
        review_ok = Evaluator("review_ok", F_P, "review satisfies declared standard")
        vector = GraphVector(
            "design→review",
            design,
            review,
            evaluators=(review_ok,),
            contexts=(design_surface,),
            rule=review_gate,
        )

        carrier = graph_function_for_vector(vector, tags=("public-carrier",))
        materialized = carrier.materialize()

        assert carrier.name == "design→review"
        assert carrier.inputs == (design,)
        assert carrier.outputs == (review,)
        assert carrier.tags == ("public-carrier",)
        assert materialized.inputs == (design,)
        assert materialized.outputs == (review,)
        assert materialized.contexts == (design_surface,)
        assert materialized.rules == (review_gate,)
        assert materialized.vectors == (vector,)

    def test_composition_uses_cumulative_environment_closure_across_multiple_steps(self) -> None:
        input_set = Node(name="input_set", schema="InputSet")
        requirements = Node(name="requirements", schema="Requirements")
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")

        capture_requirements = graph_function_for_vector(
            GraphVector("input_set→requirements", input_set, requirements),
        )
        synthesize_design = GraphFunction.from_graph(
            name="requirements_to_design",
            graph=Graph(
                name="requirements_to_design",
                inputs=(input_set, requirements),
                outputs=(design,),
                nodes=(input_set, requirements, design),
                vectors=(GraphVector("requirements→design", (input_set, requirements), design),),
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
                inputs=(requirements, design),
                outputs=(code,),
                nodes=(requirements, design, code),
                vectors=(GraphVector("design→code", (requirements, design), code),),
            ),
            environment=EnvRef.from_contract(
                requires=(requirements, design),
                provides=(code,),
            ),
        )

        executive = compose(capture_requirements, synthesize_design, implement_code)
        materialized = executive.materialize()
        environment = executive.environment

        assert executive.inputs == (input_set,)
        assert executive.outputs == (code,)
        assert tuple(node.name for node in environment.requires) == ("input_set",)
        assert tuple(node.name for node in environment.provides) == (
            "requirements",
            "design",
            "code",
        )
        assert tuple(node.name for node in environment.carries) == (
            "input_set",
            "requirements",
            "design",
            "code",
        )
        assert materialized.inputs == (input_set,)
        assert materialized.outputs == (code,)
        assert {vector.name for vector in materialized.vectors} == {
            "input_set→requirements",
            "requirements→design",
            "design→code",
        }

    def test_composition_rejects_requirements_missing_from_the_cumulative_environment(self) -> None:
        input_set = Node(name="input_set", schema="InputSet")
        requirements = Node(name="requirements", schema="Requirements")
        design = Node(name="design", schema="Design")
        review = Node(name="review", schema="Review")

        capture_requirements = graph_function_for_vector(
            GraphVector("input_set→requirements", input_set, requirements),
        )
        review_gate = GraphFunction.from_graph(
            name="review_gate",
            graph=Graph(
                name="review_gate",
                inputs=(requirements, review),
                outputs=(design,),
                nodes=(requirements, review, design),
                vectors=(GraphVector("requirements+review→design", (requirements, review), design),),
            ),
            environment=EnvRef.from_contract(
                requires=(requirements, review),
                provides=(design,),
            ),
        )

        with pytest.raises(ValueError, match="available environment"):
            compose(capture_requirements, review_gate)

    def test_composition_rejects_conflicting_provided_binding_in_carried_environment(self) -> None:
        input_set = Node(name="input_set", schema="InputSet")
        requirements = Node(name="requirements", schema="Requirements")
        design = Node(name="design", schema="Design")

        capture_requirements = graph_function_for_vector(
            GraphVector("input_set→requirements", input_set, requirements),
        )
        synthesize_design = GraphFunction.from_graph(
            name="requirements_to_design",
            graph=Graph(
                name="requirements_to_design",
                inputs=(input_set, requirements),
                outputs=(design,),
                nodes=(input_set, requirements, design),
                vectors=(GraphVector("requirements→design", (input_set, requirements), design),),
            ),
            environment=EnvRef.from_contract(
                requires=(input_set, requirements),
                provides=(design,),
            ),
        )
        conflicting_design = GraphFunction.from_graph(
            name="redesign",
            graph=Graph(
                name="redesign",
                inputs=(input_set, requirements),
                outputs=(design,),
                nodes=(input_set, requirements, design),
                vectors=(GraphVector("requirements→revised_design", (input_set, requirements), design),),
            ),
            environment=EnvRef.from_contract(
                requires=(input_set, requirements),
                provides=(design,),
            ),
        )

        with pytest.raises(ValueError, match="duplicate output names"):
            compose(capture_requirements, synthesize_design, conflicting_design)

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

    def test_substitution_rejects_incompatible_inner_graph_and_preserves_unrelated_vectors(self) -> None:
        intent = Node(name="intent", schema="Intent")
        requirements = Node(name="requirements", schema="Requirements")
        design = Node(name="design", schema="Design")
        implementation = Node(name="implementation", schema="Implementation")
        review = Node(name="review", schema="Review")

        contract = GraphVector(name="requirements→design", source=requirements, target=design)
        passthrough = GraphVector(name="intent→requirements", source=intent, target=requirements)
        outer = Graph(
            name="delivery",
            inputs=(intent,),
            outputs=(design,),
            nodes=(intent, requirements, design),
            vectors=(passthrough, contract),
        )

        incompatible = Graph(
            name="wrong_detail",
            inputs=(requirements,),
            outputs=(review,),
            nodes=(requirements, review),
            vectors=(),
        )
        with pytest.raises(ValueError, match="not in"):
            substitute(outer, contract.id, incompatible)

        inner = Graph(
            name="detailed_delivery",
            inputs=(requirements,),
            outputs=(design,),
            nodes=(requirements, implementation, design),
            vectors=(
                GraphVector("requirements→implementation", requirements, implementation),
                GraphVector("implementation→design", implementation, design),
            ),
        )
        substituted = substitute(outer, contract.id, inner)

        assert {vector.name for vector in substituted.vectors} == {
            "intent→requirements",
            "requirements→implementation",
            "implementation→design",
        }
        surviving = next(vector for vector in substituted.vectors if vector.name == "intent→requirements")
        assert surviving.id == passthrough.id

    def test_higher_order_programs_preserve_declared_outer_boundaries(self) -> None:
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
            effects=("worker_pass",),
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
        assert harvest_program.declarations["gate"]["rule"]["name"] == "harvest_gate"
        assert harvest_program.declarations["gate"]["evaluators"][0]["name"] == "harvest_acceptance"

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

        recursive = recurse(
            direct,
            recurse_done,
            foldback={
                "binding": "outer_contract",
                "mode": "rebind",
                "requires_parent_evaluation": True,
            },
        )
        assert recursive.inputs == direct.inputs
        assert recursive.outputs == direct.outputs
        assert "termination:done" in recursive.tags
        assert "foldback:outer_contract" in recursive.tags
        assert recursive.declarations["recursion"]["termination"]["name"] == "done"
        assert recursive.declarations["recursion"]["foldback"]["binding"] == "outer_contract"
        assert recursive.declarations["recursion"]["foldback"]["requires_parent_evaluation"] is True

        with pytest.raises(ValueError, match="requires_parent_evaluation"):
            recurse(
                direct,
                recurse_done,
                foldback={
                    "binding": "outer_contract",
                    "mode": "rebind",
                    "requires_parent_evaluation": False,
                },
            )

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

    def test_recurse_preserves_cumulative_environment_for_composed_chain(self) -> None:
        input_set = Node(name="input_set", schema="InputSet")
        requirements = Node(name="requirements", schema="Requirements")
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        recurse_done = Evaluator("done", F_D, binding="exec://python -c 'import sys; sys.exit(0)'")

        capture_requirements = graph_function_for_vector(
            GraphVector("input_set→requirements", input_set, requirements),
        )
        synthesize_design = GraphFunction.from_graph(
            name="requirements_to_design",
            graph=Graph(
                name="requirements_to_design",
                inputs=(input_set, requirements),
                outputs=(design,),
                nodes=(input_set, requirements, design),
                vectors=(GraphVector("requirements→design", (input_set, requirements), design),),
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
                vectors=(GraphVector("design→code", (input_set, requirements, design), code),),
            ),
            environment=EnvRef.from_contract(
                requires=(input_set, requirements, design),
                provides=(code,),
            ),
        )

        recursive = recurse(
            compose(capture_requirements, synthesize_design, implement_code),
            recurse_done,
            foldback={
                "binding": "outer_contract",
                "mode": "rebind",
                "requires_parent_evaluation": True,
            },
        )

        assert recursive.inputs == (input_set,)
        assert recursive.outputs == (code,)
        assert tuple(node.name for node in recursive.environment.requires) == ("input_set",)
        assert tuple(node.name for node in recursive.environment.carries) == (
            "input_set",
            "requirements",
            "design",
            "code",
        )
        assert recursive.declarations["recursion"]["termination"]["name"] == "done"
        assert recursive.declarations["recursion"]["foldback"]["binding"] == "outer_contract"
        assert {vector.name for vector in recursive.materialize().vectors} == {
            "input_set→requirements",
            "requirements→design",
            "design→code",
        }

    def test_public_gtl_metadata_surfaces_are_immutable_mappings(self) -> None:
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")

        direct = _graph_function(
            "direct_profile",
            inputs=(design,),
            outputs=(code,),
        )
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
            candidates=(direct,),
            policy_hints={"default": "direct_profile"},
        )

        assert isinstance(boundary.hints, Attrs)
        assert boundary.hints["family"] == "delivery.profiles"
        assert isinstance(family.policy_hints, Attrs)
        assert family.policy_hints["default"] == "direct_profile"

    def test_attrs_fail_closed_on_non_replayable_values(self) -> None:
        with pytest.raises(TypeError, match="replayable declaration data"):
            Attrs.coerce({"dispatch": object()})

        with pytest.raises(TypeError, match="string mapping keys"):
            Attrs.coerce({"dispatch": {1: "abg.dispatch.default"}})

    def test_semantic_work_contracts_fail_closed_on_invalid_or_duplicate_contracts(self) -> None:
        with pytest.raises(ValueError, match="must be 'graph_function'"):
            ContractRef(kind="unsupported_contract", target_id="target-001")

        with pytest.raises(ValueError, match="must be non-empty"):
            ContractRef(kind="graph_function", target_id="")

        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        direct = _graph_function(
            "direct_profile",
            inputs=(design,),
            outputs=(code,),
        )
        ref = ContractRef(kind="graph_function", target_id=direct.id)
        constructor = Role(name="constructor")

        with pytest.raises(ValueError, match="duplicate contract ref"):
            Job(name="design→code", contracts=(ref, ref))

        with pytest.raises(ValueError, match="duplicate role requirement"):
            Job(name="design→code", contracts=(ref,), roles=(constructor, constructor))

    def test_module_publication_fails_closed_on_broken_callable_catalog(self) -> None:
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")

        direct = _graph_function(
            "direct_profile",
            inputs=(design,),
            outputs=(code,),
        )
        alternate = _graph_function(
            "alternate_profile",
            inputs=(design,),
            outputs=(code,),
        )

        with pytest.raises(ValueError, match="without any graph_function contract"):
            Module(
                name="broken_jobs",
                graph_functions=(direct,),
                jobs=(Job(name="design→code"),),
            )

        with pytest.raises(ValueError, match="targets unpublished graph function id"):
            Module(
                name="broken_target",
                graph_functions=(direct,),
                jobs=(
                    Job(
                        name="design→code",
                        contracts=(ContractRef(kind="graph_function", target_id=alternate.id),),
                    ),
                ),
            )

        family = candidate_family(
            "design_profiles",
            inputs=(design,),
            outputs=(code,),
            candidates=(direct, alternate),
        )
        with pytest.raises(ValueError, match="includes unpublished graph function"):
            Module(
                name="broken_family",
                graph_functions=(direct,),
                candidate_families=(family,),
            )

        duplicate_name = _graph_function(
            "direct_profile",
            inputs=(design,),
            outputs=(code,),
        )
        with pytest.raises(ValueError, match="duplicate graph_function name"):
            Module(
                name="duplicate_carriers",
                graph_functions=(direct, duplicate_name),
            )

    def test_callable_templates_are_coerced_into_inline_template_refs(self) -> None:
        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        graph = Graph(
            name="design_to_code",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(GraphVector("design→code", design, code),),
        )

        function = GraphFunction(
            name="design_to_code",
            inputs=(design,),
            outputs=(code,),
            environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
            template=lambda graph=graph: graph,
        )

        assert isinstance(function.template, TemplateRef)
        assert function.template.kind == "inline_graph"
        assert function.materialize() == graph
