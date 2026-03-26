# Validates: REQ-L-GTL2-GRAPHFUNCTION
# Validates: REQ-L-GTL2-SYNTHESIS
# Validates: REQ-L-GTL2-SELECTION-BOUNDARY
"""
Contract tests for GTL declaration types — derived from GTL_2_INTERFACE_CONTRACTS.md.

Tests GraphFunction (extended), RefinementBoundary, and CandidateFamily.
"""
import pytest
from gtl.graph import Node, _mint_id
from gtl.function_model import GraphFunction


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


def _make_gf(name, inputs, outputs, effects=()):
    return GraphFunction(
        name=name,
        inputs=tuple(inputs),
        outputs=tuple(outputs),
        effects=effects,
        tags=("test",),
    )


# ── GraphFunction contract ───────────────────────────────────────────────────


@pytest.mark.integration
class TestGraphFunction:
    def test_frozen(self, node_a, node_b):
        gf = _make_gf("f", [node_a], [node_b])
        with pytest.raises(AttributeError):
            gf.name = "other"

    def test_structural_equality_ignores_id(self, node_a, node_b):
        gf1 = GraphFunction(name="f", inputs=(node_a,), outputs=(node_b,))
        gf2 = GraphFunction(name="f", inputs=(node_a,), outputs=(node_b,))
        assert gf1 == gf2
        assert gf1.id != gf2.id

    def test_auto_minted_id(self, node_a, node_b):
        gf = _make_gf("f", [node_a], [node_b])
        assert gf.id
        assert isinstance(gf.id, str)

    def test_effects_stable(self, node_a, node_b):
        gf = GraphFunction(
            name="f",
            inputs=(node_a,),
            outputs=(node_b,),
            effects=(str, int),
        )
        assert gf.effects == (str, int)

    def test_tags_stable(self, node_a, node_b):
        gf = GraphFunction(
            name="f",
            inputs=(node_a,),
            outputs=(node_b,),
            tags=("a", "b"),
        )
        assert gf.tags == ("a", "b")


# ── RefinementBoundary contract ──────────────────────────────────────────────


@pytest.mark.integration
class TestRefinementBoundary:
    def test_import(self):
        from gtl.function_model import RefinementBoundary
        assert RefinementBoundary is not None

    def test_frozen(self, node_a, node_b):
        from gtl.function_model import RefinementBoundary
        rb = RefinementBoundary(
            name="refine",
            inputs=(node_a,),
            outputs=(node_b,),
        )
        with pytest.raises(AttributeError):
            rb.name = "other"

    def test_structural_equality_ignores_id(self, node_a, node_b):
        from gtl.function_model import RefinementBoundary
        rb1 = RefinementBoundary(name="r", inputs=(node_a,), outputs=(node_b,))
        rb2 = RefinementBoundary(name="r", inputs=(node_a,), outputs=(node_b,))
        assert rb1 == rb2
        assert rb1.id != rb2.id

    def test_auto_minted_id(self, node_a, node_b):
        from gtl.function_model import RefinementBoundary
        rb = RefinementBoundary(name="r", inputs=(node_a,), outputs=(node_b,))
        assert rb.id
        assert isinstance(rb.id, str)

    def test_stable_outer_contract(self, node_a, node_b):
        from gtl.function_model import RefinementBoundary
        rb = RefinementBoundary(
            name="r",
            inputs=(node_a,),
            outputs=(node_b,),
        )
        assert rb.inputs == (node_a,)
        assert rb.outputs == (node_b,)

    def test_hints_are_metadata_only(self, node_a, node_b):
        from gtl.function_model import RefinementBoundary
        rb = RefinementBoundary(
            name="r",
            inputs=(node_a,),
            outputs=(node_b,),
            hints={"family": "gsdlc.discovery"},
        )
        assert rb.hints == {"family": "gsdlc.discovery"}

    def test_tags(self, node_a, node_b):
        from gtl.function_model import RefinementBoundary
        rb = RefinementBoundary(
            name="r",
            inputs=(node_a,),
            outputs=(node_b,),
            tags=("discovery",),
        )
        assert rb.tags == ("discovery",)


# ── CandidateFamily contract ────────────────────────────────────────────────


@pytest.mark.integration
class TestCandidateFamily:
    def test_import(self):
        from gtl.function_model import CandidateFamily
        assert CandidateFamily is not None

    def test_frozen(self, node_a, node_b):
        from gtl.function_model import CandidateFamily
        gf = _make_gf("f", [node_a], [node_b])
        cf = CandidateFamily(
            name="family",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf,),
        )
        with pytest.raises(AttributeError):
            cf.name = "other"

    def test_structural_equality_ignores_id(self, node_a, node_b):
        from gtl.function_model import CandidateFamily
        gf = _make_gf("f", [node_a], [node_b])
        cf1 = CandidateFamily(
            name="family",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf,),
        )
        cf2 = CandidateFamily(
            name="family",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf,),
        )
        assert cf1 == cf2
        assert cf1.id != cf2.id

    def test_mismatched_candidate_rejects_at_construction(self, node_a, node_b, node_c):
        from gtl.function_model import CandidateFamily
        gf_good = _make_gf("good", [node_a], [node_b])
        gf_bad = _make_gf("bad", [node_a], [node_c])
        # Fail-closed: mismatched candidate contract raises at construction
        with pytest.raises(ValueError, match="contract"):
            CandidateFamily(
                name="family",
                inputs=(node_a,),
                outputs=(node_b,),
                candidates=(gf_good, gf_bad),
            )

    def test_empty_candidates_rejects_at_construction(self, node_a, node_b):
        from gtl.function_model import CandidateFamily
        with pytest.raises(ValueError, match="empty"):
            CandidateFamily(
                name="family",
                inputs=(node_a,),
                outputs=(node_b,),
                candidates=(),
            )

    def test_candidate_order_preserved(self, node_a, node_b):
        from gtl.function_model import CandidateFamily
        gf1 = _make_gf("first", [node_a], [node_b])
        gf2 = _make_gf("second", [node_a], [node_b])
        gf3 = _make_gf("third", [node_a], [node_b])
        cf = CandidateFamily(
            name="family",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf1, gf2, gf3),
        )
        assert cf.candidates[0].name == "first"
        assert cf.candidates[1].name == "second"
        assert cf.candidates[2].name == "third"

    def test_policy_hints(self, node_a, node_b):
        from gtl.function_model import CandidateFamily
        gf = _make_gf("f", [node_a], [node_b])
        cf = CandidateFamily(
            name="family",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf,),
            policy_hints={"profile": "steelthread"},
        )
        assert cf.policy_hints == {"profile": "steelthread"}

    def test_auto_minted_id(self, node_a, node_b):
        from gtl.function_model import CandidateFamily
        gf = _make_gf("f", [node_a], [node_b])
        cf = CandidateFamily(
            name="family",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf,),
        )
        assert cf.id
        assert isinstance(cf.id, str)
