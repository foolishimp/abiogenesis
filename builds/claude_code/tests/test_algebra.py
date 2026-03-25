# Validates: REQ-L-GTL2-COMPOSE
# Validates: REQ-L-GTL2-SUBSTITUTE
# Validates: REQ-L-GTL2-GRAPH
# Validates: REQ-L-GTL2-GRAPHFUNCTION
"""
Contract tests for gtl.algebra — derived from V2 module spec.

Tests compose(), substitute(), identity(), and edge() — the pure algebra
operations over GTL graph types.

Marked with pytest.mark.integration — run via: pytest -m integration
"""
import pytest
from gtl.graph import Graph, Node, GraphVector, Context
from gtl.function_model import GraphFunction
from gtl.operator_model import Evaluator, Operator, F_D, F_P
from gtl.algebra import edge, compose, substitute, identity


# ── Helpers ──────────────────────────────────────────────────────────────────


def _make_gf(name, inputs, outputs, vectors=None, contexts=None, effects=()):
    """Create a GraphFunction with a materializable template."""
    vectors = vectors or ()
    contexts = contexts or ()
    all_nodes = set()
    for n in inputs:
        all_nodes.add(n)
    for n in outputs:
        all_nodes.add(n)
    for v in vectors:
        if v.source:
            if isinstance(v.source, tuple):
                all_nodes.update(v.source)
            else:
                all_nodes.add(v.source)
        if v.target:
            all_nodes.add(v.target)
    g = Graph(
        name=name,
        inputs=tuple(inputs),
        outputs=tuple(outputs),
        nodes=tuple(all_nodes),
        vectors=tuple(vectors),
        contexts=tuple(contexts),
    )
    return GraphFunction(
        name=name,
        inputs=tuple(inputs),
        outputs=tuple(outputs),
        template=lambda g=g: g,
        effects=effects,
    )


# ── Fixtures ─────────────────────────────────────────────────────────────────


@pytest.fixture
def intent():
    return Node(name="intent", schema="str")


@pytest.fixture
def requirements():
    return Node(name="requirements", schema="str")


@pytest.fixture
def code():
    return Node(name="code", schema="str")


@pytest.fixture
def tests():
    return Node(name="tests", schema="str")


# ── edge() ───────────────────────────────────────────────────────────────────


@pytest.mark.integration
class TestEdge:
    def test_creates_single_vector_graph(self, intent, requirements):
        g = edge(intent, requirements)
        assert g.name == "intent→requirements"
        assert len(g.vectors) == 1
        assert g.inputs == (intent,)
        assert g.outputs == (requirements,)
        assert g.nodes == (intent, requirements)

    def test_vector_name_matches_graph_name(self, intent, requirements):
        g = edge(intent, requirements)
        assert g.vectors[0].name == "intent→requirements"

    def test_preserves_operators_and_evaluators(self, intent, requirements):
        op = Operator("check", F_D)
        ev = Evaluator("impl_check", F_D)
        g = edge(intent, requirements, operators=(op,), evaluators=(ev,))
        vec = g.vectors[0]
        assert vec.operators == (op,)
        assert vec.evaluators == (ev,)

    def test_passes_extra_kwargs_to_vector(self, intent, requirements):
        ctx = Context(
            name="spec",
            locator="workspace://spec.md",
            digest="sha256:" + "a" * 64,
        )
        g = edge(intent, requirements, contexts=(ctx,))
        assert g.vectors[0].contexts == (ctx,)


# ── compose() ────────────────────────────────────────────────────────────────


@pytest.mark.integration
class TestCompose:
    def test_basic_composition_interface(self, intent, requirements, code):
        f = _make_gf("f", [intent], [requirements])
        g = _make_gf("g", [requirements], [code])
        h = compose(f, g)
        assert h.name == "f;g"
        assert h.inputs == (intent,)
        assert h.outputs == (code,)

    def test_effects_concatenated(self, intent, requirements, code):
        f = GraphFunction(
            name="f", inputs=(intent,), outputs=(requirements,), effects=("e1",)
        )
        g = GraphFunction(
            name="g", inputs=(requirements,), outputs=(code,), effects=("e2",)
        )
        h = compose(f, g)
        assert h.effects == ("e1", "e2")

    def test_interface_mismatch_raises(self, intent, code):
        f = _make_gf("f", [intent], [Node(name="other")])
        g = _make_gf("g", [code], [Node(name="result")])
        with pytest.raises(ValueError, match="not satisfied"):
            compose(f, g)

    def test_interface_mismatch_message_lists_missing(self, intent, requirements, code):
        f = _make_gf("f", [intent], [requirements])
        g = _make_gf("g", [code], [Node(name="result")])
        with pytest.raises(ValueError, match="code"):
            compose(f, g)

    def test_duplicate_output_names_raises(self, intent, requirements):
        result = Node(name="result")
        f = _make_gf("f", [intent], [requirements, result])
        g = _make_gf("g", [requirements], [result])
        with pytest.raises(ValueError, match="duplicate output"):
            compose(f, g)

    def test_passthrough_not_flagged_as_duplicate(self, intent, requirements):
        """If g passes through a node (in both g.inputs and g.outputs), no error."""
        f = _make_gf("f", [intent], [requirements])
        g = _make_gf("g", [requirements], [requirements, Node(name="extra")])
        h = compose(f, g)
        assert h.outputs == (requirements, Node(name="extra"))

    def test_associativity(self, intent, requirements, code, tests):
        f = _make_gf("f", [intent], [requirements])
        g = _make_gf("g", [requirements], [code])
        h = _make_gf("h", [code], [tests])

        # (f;g);h
        fg = compose(f, g)
        fgh_left = compose(fg, h)

        # f;(g;h)
        gh = compose(g, h)
        fgh_right = compose(f, gh)

        # Same interface
        assert fgh_left.inputs == fgh_right.inputs
        assert fgh_left.outputs == fgh_right.outputs

    def test_identity_left_neutral(self, intent, requirements):
        f = _make_gf("f", [intent], [requirements])
        id_left = identity((intent,))
        result = compose(id_left, f)
        assert result.inputs == f.inputs
        assert result.outputs == f.outputs

    def test_identity_right_neutral(self, intent, requirements):
        f = _make_gf("f", [intent], [requirements])
        id_right = identity((requirements,))
        result = compose(f, id_right)
        assert result.inputs == f.inputs
        assert result.outputs == f.outputs

    def test_materialized_graph_union_contexts(self, intent, requirements, code):
        ctx1 = Context(
            name="spec",
            locator="workspace://spec.md",
            digest="sha256:" + "a" * 64,
        )
        ctx2 = Context(
            name="guide",
            locator="workspace://guide.md",
            digest="sha256:" + "b" * 64,
        )
        f = _make_gf("f", [intent], [requirements], contexts=(ctx1,))
        g = _make_gf("g", [requirements], [code], contexts=(ctx2,))
        h = compose(f, g)
        materialized = h.template()
        ctx_names = {c.name for c in materialized.contexts}
        assert ctx_names == {"spec", "guide"}

    def test_materialized_graph_deduplicates_contexts(self, intent, requirements, code):
        ctx = Context(
            name="shared",
            locator="workspace://shared.md",
            digest="sha256:" + "c" * 64,
        )
        f = _make_gf("f", [intent], [requirements], contexts=(ctx,))
        g = _make_gf("g", [requirements], [code], contexts=(ctx,))
        h = compose(f, g)
        materialized = h.template()
        assert len([c for c in materialized.contexts if c.name == "shared"]) == 1

    def test_materialized_graph_preserves_vectors(self, intent, requirements, code):
        vec1 = GraphVector(name="v1", source=intent, target=requirements)
        vec2 = GraphVector(name="v2", source=requirements, target=code)
        f = _make_gf("f", [intent], [requirements], vectors=(vec1,))
        g = _make_gf("g", [requirements], [code], vectors=(vec2,))
        h = compose(f, g)
        materialized = h.template()
        vec_names = {v.name for v in materialized.vectors}
        assert vec_names == {"v1", "v2"}

    def test_materialized_graph_deduplicates_nodes(self, intent, requirements, code):
        f = _make_gf("f", [intent], [requirements])
        g = _make_gf("g", [requirements], [code])
        h = compose(f, g)
        materialized = h.template()
        names = [n.name for n in materialized.nodes]
        # requirements appears in both f and g, should appear once
        assert names.count("requirements") == 1

    def test_non_materializable_gets_string_template(self, intent, requirements, code):
        f = GraphFunction(name="f", inputs=(intent,), outputs=(requirements,))
        g = GraphFunction(name="g", inputs=(requirements,), outputs=(code,))
        h = compose(f, g)
        assert h.template == "f;g"


# ── substitute() ─────────────────────────────────────────────────────────────


@pytest.mark.integration
class TestSubstitute:
    def test_basic_substitution(self, intent, code):
        vec_ic = GraphVector(name="intent→code", source=intent, target=code)
        outer = Graph(
            name="outer",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(vec_ic,),
        )
        req = Node(name="requirements")
        inner = Graph(
            name="inner",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, req, code),
            vectors=(
                GraphVector(name="intent→req", source=intent, target=req),
                GraphVector(name="req→code", source=req, target=code),
            ),
        )
        result = substitute(outer, vec_ic.id, inner)
        # Contract preserved
        assert result.inputs == outer.inputs
        assert result.outputs == outer.outputs
        # Coarse vector removed, inner vectors added
        vec_names = {v.name for v in result.vectors}
        assert "intent→code" not in vec_names
        assert "intent→req" in vec_names
        assert "req→code" in vec_names
        # New node included
        assert "requirements" in {n.name for n in result.nodes}

    def test_vector_not_found_raises(self, intent):
        outer = Graph(name="outer", inputs=(intent,), nodes=(intent,))
        inner = Graph(
            name="inner",
            inputs=(intent,),
            outputs=(intent,),
            nodes=(intent,),
        )
        with pytest.raises(ValueError, match="not found"):
            substitute(outer, "nonexistent", inner)

    def test_inner_input_not_subset_raises(self, intent, code):
        vec_ic = GraphVector(name="intent→code", source=intent, target=code)
        outer = Graph(
            name="outer",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(vec_ic,),
        )
        alien = Node(name="alien")
        inner = Graph(
            name="inner",
            inputs=(alien,),
            outputs=(code,),
            nodes=(alien, code),
        )
        with pytest.raises(ValueError, match="not subset"):
            substitute(outer, vec_ic.id, inner)

    def test_inner_output_missing_target_raises(self, intent, code):
        vec_ic = GraphVector(name="intent→code", source=intent, target=code)
        outer = Graph(
            name="outer",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(vec_ic,),
        )
        other = Node(name="other")
        inner = Graph(
            name="inner",
            inputs=(intent,),
            outputs=(other,),
            nodes=(intent, other),
        )
        with pytest.raises(ValueError, match="not in inner.outputs"):
            substitute(outer, vec_ic.id, inner)

    def test_preserves_other_vectors(self, intent, code, tests):
        vec_ic = GraphVector(name="intent→code", source=intent, target=code)
        outer = Graph(
            name="outer",
            inputs=(intent,),
            outputs=(tests,),
            nodes=(intent, code, tests),
            vectors=(
                vec_ic,
                GraphVector(name="code→tests", source=code, target=tests),
            ),
        )
        req = Node(name="requirements")
        inner = Graph(
            name="inner",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, req, code),
            vectors=(
                GraphVector(name="intent→req", source=intent, target=req),
                GraphVector(name="req→code", source=req, target=code),
            ),
        )
        result = substitute(outer, vec_ic.id, inner)
        vec_names = {v.name for v in result.vectors}
        assert "code→tests" in vec_names
        assert "intent→code" not in vec_names

    def test_provenance_tag_added(self, intent, code):
        vec_ic = GraphVector(name="intent→code", source=intent, target=code)
        outer = Graph(
            name="outer",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(vec_ic,),
        )
        inner = Graph(
            name="inner",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(
                GraphVector(name="step", source=intent, target=code),
            ),
        )
        result = substitute(outer, vec_ic.id, inner)
        assert "substituted:intent→code" in result.tags

    def test_outer_name_preserved(self, intent, code):
        vec_ic = GraphVector(name="intent→code", source=intent, target=code)
        outer = Graph(
            name="my_workflow",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(vec_ic,),
        )
        inner = Graph(
            name="inner",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(
                GraphVector(name="step", source=intent, target=code),
            ),
        )
        result = substitute(outer, vec_ic.id, inner)
        assert result.name == "my_workflow"

    def test_multi_input_vector(self, intent, requirements, code):
        vec_mc = GraphVector(
            name="merge→code",
            source=(intent, requirements),
            target=code,
        )
        outer = Graph(
            name="outer",
            inputs=(intent, requirements),
            outputs=(code,),
            nodes=(intent, requirements, code),
            vectors=(vec_mc,),
        )
        design = Node(name="design")
        inner = Graph(
            name="inner",
            inputs=(intent, requirements),
            outputs=(code,),
            nodes=(intent, requirements, design, code),
            vectors=(
                GraphVector(name="i→d", source=intent, target=design),
                GraphVector(name="r→d", source=requirements, target=design),
                GraphVector(name="d→c", source=design, target=code),
            ),
        )
        result = substitute(outer, vec_mc.id, inner)
        assert result.inputs == outer.inputs
        assert result.outputs == outer.outputs
        assert "design" in {n.name for n in result.nodes}
        vec_names = {v.name for v in result.vectors}
        assert "merge→code" not in vec_names
        assert len(result.vectors) == 3

    def test_inner_contexts_merged(self, intent, code):
        ctx_outer = Context(
            name="spec",
            locator="workspace://spec.md",
            digest="sha256:" + "a" * 64,
        )
        ctx_inner = Context(
            name="guide",
            locator="workspace://guide.md",
            digest="sha256:" + "b" * 64,
        )
        vec_ic = GraphVector(name="intent→code", source=intent, target=code)
        outer = Graph(
            name="outer",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(vec_ic,),
            contexts=(ctx_outer,),
        )
        inner = Graph(
            name="inner",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(
                GraphVector(name="step", source=intent, target=code),
            ),
            contexts=(ctx_inner,),
        )
        result = substitute(outer, vec_ic.id, inner)
        ctx_names = {c.name for c in result.contexts}
        assert ctx_names == {"spec", "guide"}

    def test_node_deduplication(self, intent, code):
        """Shared nodes between outer and inner are not duplicated."""
        vec_ic = GraphVector(name="intent→code", source=intent, target=code)
        outer = Graph(
            name="outer",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(vec_ic,),
        )
        inner = Graph(
            name="inner",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(
                GraphVector(name="step", source=intent, target=code),
            ),
        )
        result = substitute(outer, vec_ic.id, inner)
        names = [n.name for n in result.nodes]
        assert names.count("intent") == 1
        assert names.count("code") == 1

    def test_preserves_outer_rules_and_effects(self, intent, code):
        vec_ic = GraphVector(name="intent→code", source=intent, target=code)
        outer = Graph(
            name="outer",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(vec_ic,),
            rules=("rule1",),
            effects=("effect1",),
        )
        inner = Graph(
            name="inner",
            inputs=(intent,),
            outputs=(code,),
            nodes=(intent, code),
            vectors=(
                GraphVector(name="step", source=intent, target=code),
            ),
        )
        result = substitute(outer, vec_ic.id, inner)
        assert result.rules == ("rule1",)
        assert result.effects == ("effect1",)


# ── identity() ───────────────────────────────────────────────────────────────


@pytest.mark.integration
class TestIdentity:
    def test_preserves_interface(self, intent, requirements):
        interface = (intent, requirements)
        idf = identity(interface)
        assert idf.inputs == interface
        assert idf.outputs == interface
        assert idf.name == "id"

    def test_no_effects(self, intent):
        idf = identity((intent,))
        assert idf.effects == ()

    def test_empty_interface(self):
        idf = identity(())
        assert idf.inputs == ()
        assert idf.outputs == ()
