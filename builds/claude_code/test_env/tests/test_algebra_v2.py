# Validates: REQ-L-GTL2-COMPOSE (variadic)
# Validates: REQ-L-GTL2-RECURSE
# Validates: REQ-L-GTL2-HOF
# Validates: REQ-L-GTL2-SYNTHESIS
# Validates: REQ-L-GTL2-SELECTION-BOUNDARY
"""
Contract tests for GTL algebra V2 operators — derived from GTL_2_INTERFACE_CONTRACTS.md.

Tests: variadic compose, recurse, fan_out, fan_in, gate, promote,
       deferred_refinement, candidate_family.
"""
import pytest
from gtl.graph import Graph, Node, GraphVector
from gtl.function_model import GraphFunction
from gtl.operator_model import Evaluator, Rule, F_D, F_P, F_H


# ── Fixtures ─────────────────────────────────────────────────────────────────


@pytest.fixture
def node_a():
    return Node(name="a", schema="str")


@pytest.fixture
def node_b():
    return Node(name="b", schema="str")


@pytest.fixture
def node_c():
    return Node(name="c", schema="str")


@pytest.fixture
def node_d():
    return Node(name="d", schema="str")


@pytest.fixture
def node_vec():
    return Node(name="items", schema="Vector[str]")


def _make_gf(name, inputs, outputs, effects=()):
    g = Graph(
        name=name,
        inputs=tuple(inputs),
        outputs=tuple(outputs),
        nodes=tuple(set(inputs) | set(outputs)),
        vectors=(),
    )
    return GraphFunction(
        name=name,
        inputs=tuple(inputs),
        outputs=tuple(outputs),
        template=lambda g=g: g,
        effects=effects,
    )


# ── variadic compose() ──────────────────────────────────────────────────────


@pytest.mark.integration
class TestVariadicCompose:
    def test_variadic_three_args(self, node_a, node_b, node_c, node_d):
        from gtl.algebra import compose
        f = _make_gf("f", [node_a], [node_b])
        g = _make_gf("g", [node_b], [node_c])
        h = _make_gf("h", [node_c], [node_d])
        result = compose(f, g, h)
        assert result.inputs == (node_a,)
        assert result.outputs == (node_d,)

    def test_left_fold_equivalence(self, node_a, node_b, node_c, node_d):
        from gtl.algebra import compose
        f = _make_gf("f", [node_a], [node_b])
        g = _make_gf("g", [node_b], [node_c])
        h = _make_gf("h", [node_c], [node_d])
        # variadic
        variadic = compose(f, g, h)
        # explicit left-fold
        left_fold = compose(compose(f, g), h)
        assert variadic.inputs == left_fold.inputs
        assert variadic.outputs == left_fold.outputs

    def test_zero_args_raises(self):
        from gtl.algebra import compose
        with pytest.raises((ValueError, TypeError)):
            compose()

    def test_one_arg_raises(self, node_a, node_b):
        from gtl.algebra import compose
        f = _make_gf("f", [node_a], [node_b])
        with pytest.raises((ValueError, TypeError)):
            compose(f)

    def test_effect_propagation(self, node_a, node_b, node_c, node_d):
        from gtl.algebra import compose
        f = _make_gf("f", [node_a], [node_b], effects=("e1",))
        g = _make_gf("g", [node_b], [node_c], effects=("e2",))
        h = _make_gf("h", [node_c], [node_d], effects=("e3",))
        result = compose(f, g, h)
        assert result.effects == ("e1", "e2", "e3")

    def test_interface_mismatch_in_chain_raises(self, node_a, node_b, node_d):
        from gtl.algebra import compose
        f = _make_gf("f", [node_a], [node_b])
        g = _make_gf("g", [node_d], [Node(name="x")])
        with pytest.raises(ValueError):
            compose(f, g)


# ── recurse() ───────────────────────────────────────────────────────────────


@pytest.mark.integration
class TestRecurse:
    def test_import(self):
        from gtl.algebra import recurse
        assert recurse is not None

    def test_preserves_outer_contract(self, node_a, node_b):
        from gtl.algebra import recurse
        gf = _make_gf("loop", [node_a], [node_b])
        term = Evaluator(name="done", regime=F_D, binding="exec://check")
        result = recurse(gf, term)
        assert result.inputs == gf.inputs
        assert result.outputs == gf.outputs

    def test_returns_graph_function(self, node_a, node_b):
        from gtl.algebra import recurse
        gf = _make_gf("loop", [node_a], [node_b])
        term = Evaluator(name="done", regime=F_D, binding="exec://check")
        result = recurse(gf, term)
        assert isinstance(result, GraphFunction)

    def test_topology_in_tags_not_effects(self, node_a, node_b):
        """Topology markers belong in tags, not effects (design contract)."""
        from gtl.algebra import recurse
        gf = _make_gf("loop", [node_a], [node_b], effects=("e1",))
        term = Evaluator(name="done", regime=F_D, binding="exec://check")
        result = recurse(gf, term)
        # "recursive" must NOT appear in effects — topology is in tags
        assert "recursive" not in result.effects
        # Inner effects propagated unchanged
        assert "e1" in result.effects

    def test_inner_effects_propagated(self, node_a, node_b):
        from gtl.algebra import recurse
        gf = _make_gf("loop", [node_a], [node_b], effects=("e1", "e2"))
        term = Evaluator(name="done", regime=F_D, binding="exec://check")
        result = recurse(gf, term)
        assert "e1" in result.effects
        assert "e2" in result.effects

    def test_termination_evaluator_in_tags(self, node_a, node_b):
        from gtl.algebra import recurse
        gf = _make_gf("loop", [node_a], [node_b])
        term = Evaluator(name="done", regime=F_D, binding="exec://check")
        result = recurse(gf, term)
        assert any("termination:done" in t for t in result.tags)


# ── fan_out() ───────────────────────────────────────────────────────────────


@pytest.mark.integration
class TestFanOut:
    def test_import(self):
        from gtl.algebra import fan_out
        assert fan_out is not None

    def test_requires_explicit_over(self, node_a, node_b, node_vec):
        from gtl.algebra import fan_out
        gf = _make_gf("worker", [node_a], [node_b])
        # over= is mandatory keyword
        result = fan_out(gf, over=node_vec)
        assert isinstance(result, GraphFunction)

    def test_no_over_raises(self, node_a, node_b):
        from gtl.algebra import fan_out
        gf = _make_gf("worker", [node_a], [node_b])
        with pytest.raises(TypeError):
            fan_out(gf)  # missing over=

    def test_over_node_in_contract(self, node_a, node_b, node_vec):
        """fan_out rewrites outer contract to vector boundary."""
        from gtl.algebra import fan_out
        gf = _make_gf("worker", [node_a], [node_b])
        result = fan_out(gf, over=node_vec)
        assert result.inputs == (node_vec,)
        assert result.outputs == (node_vec,)

    def test_topology_in_tags_not_effects(self, node_a, node_b, node_vec):
        """Topology markers belong in tags, not effects (design contract)."""
        from gtl.algebra import fan_out
        gf = _make_gf("worker", [node_a], [node_b])
        result = fan_out(gf, over=node_vec)
        assert "fan_out" not in result.effects
        # Inner effects propagated unchanged
        assert result.effects == gf.effects

    def test_fan_out_over_tag_carried(self, node_a, node_b, node_vec):
        from gtl.algebra import fan_out
        gf = _make_gf("worker", [node_a], [node_b])
        result = fan_out(gf, over=node_vec)
        assert any("over:" in t for t in result.tags)


# ── fan_in() ────────────────────────────────────────────────────────────────


@pytest.mark.integration
class TestFanIn:
    def test_import(self):
        from gtl.algebra import fan_in
        assert fan_in is not None

    def test_requires_explicit_over(self, node_a, node_b, node_vec):
        from gtl.algebra import fan_in
        reducer = _make_gf("reduce", [node_a], [node_b])
        result = fan_in(reducer, over=node_vec)
        assert isinstance(result, GraphFunction)

    def test_no_over_raises(self, node_a, node_b):
        from gtl.algebra import fan_in
        reducer = _make_gf("reduce", [node_a], [node_b])
        with pytest.raises(TypeError):
            fan_in(reducer)  # missing over=

    def test_over_node_is_input(self, node_a, node_b, node_vec):
        """fan_in consumes from vector boundary, produces reducer's output."""
        from gtl.algebra import fan_in
        reducer = _make_gf("reduce", [node_a], [node_b])
        result = fan_in(reducer, over=node_vec)
        assert result.inputs == (node_vec,)
        assert result.outputs == reducer.outputs

    def test_topology_in_tags_not_effects(self, node_a, node_b, node_vec):
        """Topology markers belong in tags, not effects (design contract)."""
        from gtl.algebra import fan_in
        reducer = _make_gf("reduce", [node_a], [node_b])
        result = fan_in(reducer, over=node_vec)
        assert "fan_in" not in result.effects
        # Inner effects propagated unchanged
        assert result.effects == reducer.effects

    def test_fan_in_over_tag_carried(self, node_a, node_b, node_vec):
        from gtl.algebra import fan_in
        reducer = _make_gf("reduce", [node_a], [node_b])
        result = fan_in(reducer, over=node_vec)
        assert any("over:" in t for t in result.tags)


# ── gate() ──────────────────────────────────────────────────────────────────


@pytest.mark.integration
class TestGate:
    def test_import(self):
        from gtl.algebra import gate
        assert gate is not None

    def test_preserves_target_contract_graphfunction(self, node_a, node_b):
        from gtl.algebra import gate
        gf = _make_gf("work", [node_a], [node_b])
        rule = Rule(name="check", kind="gate")
        ev = Evaluator(name="verify", regime=F_D, binding="exec://check")
        result = gate(gf, rule=rule, evaluators=(ev,))
        assert isinstance(result, GraphFunction)
        assert result.inputs == gf.inputs
        assert result.outputs == gf.outputs

    def test_preserves_target_contract_refinement_boundary(self, node_a, node_b):
        from gtl.algebra import gate
        from gtl.function_model import RefinementBoundary
        rb = RefinementBoundary(name="r", inputs=(node_a,), outputs=(node_b,))
        rule = Rule(name="check", kind="gate")
        ev = Evaluator(name="verify", regime=F_D, binding="exec://check")
        result = gate(rb, rule=rule, evaluators=(ev,))
        assert isinstance(result, GraphFunction)
        assert result.inputs == (node_a,)
        assert result.outputs == (node_b,)

    def test_preserves_target_contract_candidate_family(self, node_a, node_b):
        from gtl.algebra import gate
        from gtl.function_model import CandidateFamily
        gf = _make_gf("opt", [node_a], [node_b])
        cf = CandidateFamily(
            name="family",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf,),
        )
        rule = Rule(name="select", kind="gate")
        ev = Evaluator(name="pick", regime=F_P, binding="exec://pick")
        result = gate(cf, rule=rule, evaluators=(ev,))
        assert isinstance(result, GraphFunction)
        assert result.inputs == (node_a,)
        assert result.outputs == (node_b,)

    def test_empty_evaluators_raises(self, node_a, node_b):
        from gtl.algebra import gate
        gf = _make_gf("work", [node_a], [node_b])
        rule = Rule(name="check", kind="gate")
        with pytest.raises(ValueError, match="evaluator"):
            gate(gf, rule=rule, evaluators=())


# ── promote() ───────────────────────────────────────────────────────────────


@pytest.mark.integration
class TestPromote:
    def test_import(self):
        from gtl.algebra import promote
        assert promote is not None

    def test_returns_graph_function(self, node_a, node_b):
        from gtl.algebra import promote
        result = promote(source=node_a, to=node_b)
        assert isinstance(result, GraphFunction)

    def test_explicit_source_and_to(self, node_a, node_b):
        from gtl.algebra import promote
        result = promote(source=node_a, to=node_b)
        assert result.inputs == (node_a,)
        assert result.outputs == (node_b,)

    def test_source_required(self, node_b):
        from gtl.algebra import promote
        with pytest.raises(TypeError):
            promote(to=node_b)

    def test_to_required(self, node_a):
        from gtl.algebra import promote
        with pytest.raises(TypeError):
            promote(source=node_a)

    def test_same_node_is_identity(self, node_a):
        """promote(source=x, to=x) is lawful — it's the identity lift."""
        from gtl.algebra import promote
        result = promote(source=node_a, to=node_a)
        assert result.inputs == (node_a,)
        assert result.outputs == (node_a,)

    def test_name_encodes_boundary_pair(self, node_a, node_b):
        from gtl.algebra import promote
        result = promote(source=node_a, to=node_b)
        assert "a" in result.name and "b" in result.name

    def test_no_effects_or_template(self, node_a, node_b):
        """promote is a pure representation lift — no side effects, no executable template."""
        from gtl.algebra import promote
        result = promote(source=node_a, to=node_b)
        assert result.effects == ()
        assert result.template == "" or not callable(result.template)


# ── deferred_refinement() ───────────────────────────────────────────────────


@pytest.mark.integration
class TestDeferredRefinement:
    def test_import(self):
        from gtl.algebra import deferred_refinement
        assert deferred_refinement is not None

    def test_returns_refinement_boundary(self, node_a, node_b):
        from gtl.algebra import deferred_refinement
        from gtl.function_model import RefinementBoundary
        result = deferred_refinement(
            "discover",
            inputs=(node_a,),
            outputs=(node_b,),
        )
        assert isinstance(result, RefinementBoundary)

    def test_preserves_outer_contract(self, node_a, node_b):
        from gtl.algebra import deferred_refinement
        result = deferred_refinement(
            "discover",
            inputs=(node_a,),
            outputs=(node_b,),
        )
        assert result.inputs == (node_a,)
        assert result.outputs == (node_b,)

    def test_hints_carried(self, node_a, node_b):
        from gtl.algebra import deferred_refinement
        result = deferred_refinement(
            "discover",
            inputs=(node_a,),
            outputs=(node_b,),
            hints={"family": "gsdlc.discovery"},
        )
        assert result.hints == {"family": "gsdlc.discovery"}

    def test_no_hidden_strategy(self, node_a, node_b):
        from gtl.algebra import deferred_refinement
        result = deferred_refinement(
            "discover",
            inputs=(node_a,),
            outputs=(node_b,),
        )
        # No callable, no binding, no template — pure declaration
        assert not hasattr(result, "template")
        assert not hasattr(result, "binding")


# ── candidate_family() ──────────────────────────────────────────────────────


@pytest.mark.integration
class TestCandidateFamilyAlgebra:
    def test_import(self):
        from gtl.algebra import candidate_family
        assert candidate_family is not None

    def test_returns_candidate_family(self, node_a, node_b):
        from gtl.algebra import candidate_family
        from gtl.function_model import CandidateFamily
        gf = _make_gf("opt", [node_a], [node_b])
        result = candidate_family(
            "profiles",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf,),
        )
        assert isinstance(result, CandidateFamily)

    def test_validates_shared_contract(self, node_a, node_b, node_c):
        from gtl.algebra import candidate_family
        gf_good = _make_gf("good", [node_a], [node_b])
        gf_bad = _make_gf("bad", [node_a], [node_c])
        with pytest.raises(ValueError, match="contract"):
            candidate_family(
                "profiles",
                inputs=(node_a,),
                outputs=(node_b,),
                candidates=(gf_good, gf_bad),
            )

    def test_empty_candidates_raises(self, node_a, node_b):
        from gtl.algebra import candidate_family
        with pytest.raises(ValueError, match="empty"):
            candidate_family(
                "profiles",
                inputs=(node_a,),
                outputs=(node_b,),
                candidates=(),
            )

    def test_preserves_candidate_order(self, node_a, node_b):
        from gtl.algebra import candidate_family
        gf1 = _make_gf("first", [node_a], [node_b])
        gf2 = _make_gf("second", [node_a], [node_b])
        result = candidate_family(
            "profiles",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf1, gf2),
        )
        assert result.candidates[0].name == "first"
        assert result.candidates[1].name == "second"

    def test_policy_hints(self, node_a, node_b):
        from gtl.algebra import candidate_family
        gf = _make_gf("opt", [node_a], [node_b])
        result = candidate_family(
            "profiles",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf,),
            policy_hints={"default": "steelthread"},
        )
        assert result.policy_hints == {"default": "steelthread"}


# ── GraphFunction materialization ──────────────────────────────────────────


@pytest.mark.integration
class TestGraphFunctionMaterialization:
    """Finding 5: GraphFunction materialization preserves outer interface contract."""

    def test_callable_template_materializes(self, node_a, node_b):
        from gtl.algebra import _materialize
        gf = _make_gf("work", [node_a], [node_b])
        graph = _materialize(gf)
        assert isinstance(graph, Graph)

    def test_materialized_graph_preserves_inputs(self, node_a, node_b):
        from gtl.algebra import _materialize
        gf = _make_gf("work", [node_a], [node_b])
        graph = _materialize(gf)
        input_names = {n.name for n in graph.inputs}
        gf_input_names = {n.name for n in gf.inputs}
        assert input_names == gf_input_names

    def test_materialized_graph_preserves_outputs(self, node_a, node_b):
        from gtl.algebra import _materialize
        gf = _make_gf("work", [node_a], [node_b])
        graph = _materialize(gf)
        output_names = {n.name for n in graph.outputs}
        gf_output_names = {n.name for n in gf.outputs}
        assert output_names == gf_output_names

    def test_non_callable_template_raises(self, node_a, node_b):
        from gtl.algebra import _materialize
        gf = GraphFunction(
            name="inert",
            inputs=(node_a,),
            outputs=(node_b,),
            template="ref://something",
        )
        with pytest.raises(ValueError, match="non-callable"):
            _materialize(gf)

    def test_composed_materialization_preserves_chain(self, node_a, node_b, node_c):
        """compose(f,g) materializes a graph with f's inputs and g's outputs."""
        from gtl.algebra import compose, _materialize
        f = _make_gf("f", [node_a], [node_b])
        g = _make_gf("g", [node_b], [node_c])
        composed = compose(f, g)
        graph = _materialize(composed)
        assert {n.name for n in graph.inputs} == {"a"}
        assert {n.name for n in graph.outputs} == {"c"}
