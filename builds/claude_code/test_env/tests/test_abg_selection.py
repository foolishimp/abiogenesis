# Validates: REQ-R-ABG2-SELECTION-APPLICATION
# Validates: REQ-R-ABG2-PROVENANCE-003
# Validates: REQ-R-ABG2-PROVENANCE-007
"""
Contract tests for ABG selection — derived from GTL_2_INTERFACE_CONTRACTS.md.

Tests SelectionDecision, enumerate_candidates(), and accept_selection().
"""
import pytest
from gtl.graph import Node, Graph
from gtl.function_model import GraphFunction, CandidateFamily


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


def _make_gf(name, inputs, outputs):
    return GraphFunction(
        name=name,
        inputs=tuple(inputs),
        outputs=tuple(outputs),
    )


@pytest.fixture
def family(node_a, node_b):
    gf1 = _make_gf("steelthread", [node_a], [node_b])
    gf2 = _make_gf("mvp", [node_a], [node_b])
    gf3 = _make_gf("optimal", [node_a], [node_b])
    return CandidateFamily(
        name="profiles",
        inputs=(node_a,),
        outputs=(node_b,),
        candidates=(gf1, gf2, gf3),
    )


# ── SelectionDecision ────────────────────────────────────────────────────────


@pytest.mark.integration
class TestSelectionDecision:
    def test_import(self):
        from genesis.selection import SelectionDecision
        assert SelectionDecision is not None

    def test_frozen(self):
        from genesis.selection import SelectionDecision
        sd = SelectionDecision(
            contract_id="c1",
            work_key="wk1",
            graph_function="steelthread",
            selected_by="evaluator",
            selection_mode="external",
            rationale="fastest path",
        )
        with pytest.raises(AttributeError):
            sd.rationale = "changed"

    def test_fields(self):
        from genesis.selection import SelectionDecision
        sd = SelectionDecision(
            contract_id="c1",
            work_key="wk1",
            graph_function="steelthread",
            selected_by="evaluator",
            selection_mode="external",
            rationale="fastest path",
        )
        assert sd.contract_id == "c1"
        assert sd.work_key == "wk1"
        assert sd.graph_function == "steelthread"
        assert sd.selected_by == "evaluator"
        assert sd.selection_mode == "external"
        assert sd.rationale == "fastest path"


# ── enumerate_candidates() ──────────────────────────────────────────────────


@pytest.mark.integration
class TestEnumerateCandidates:
    def test_import(self):
        from genesis.selection import enumerate_candidates
        assert enumerate_candidates is not None

    def test_returns_candidates_in_declared_order(self, family):
        from genesis.selection import enumerate_candidates
        result = enumerate_candidates(family)
        assert len(result) == 3
        assert result[0].name == "steelthread"
        assert result[1].name == "mvp"
        assert result[2].name == "optimal"

    def test_returns_tuple(self, family):
        from genesis.selection import enumerate_candidates
        result = enumerate_candidates(family)
        assert isinstance(result, tuple)

    def test_no_filtering(self, family):
        """enumerate_candidates performs no ranking or filtering."""
        from genesis.selection import enumerate_candidates
        result = enumerate_candidates(family)
        assert len(result) == len(family.candidates)


# ── accept_selection() ──────────────────────────────────────────────────────


@pytest.mark.integration
class TestAcceptSelection:
    def test_import(self):
        from genesis.selection import accept_selection
        assert accept_selection is not None

    def test_valid_selection(self, family):
        from genesis.selection import accept_selection, SelectionDecision
        candidate = family.candidates[0]  # steelthread
        result = accept_selection(
            family,
            candidate,
            contract_id="c1",
            work_key="wk1",
            selected_by="evaluator",
            selection_mode="external",
            rationale="fastest path",
        )
        assert isinstance(result, SelectionDecision)
        assert result.graph_function == "steelthread"
        assert result.selected_by == "evaluator"

    def test_candidate_not_in_family_raises(self, family, node_a, node_b):
        from genesis.selection import accept_selection
        alien = _make_gf("alien", [node_a], [node_b])
        with pytest.raises(ValueError, match="not in family"):
            accept_selection(
                family,
                alien,
                contract_id="c1",
                work_key="wk1",
                selected_by="evaluator",
                selection_mode="external",
            )

    def test_interface_mismatch_rejects_at_family_construction(self, node_a, node_b, node_c):
        """Mismatched candidate interface fails at CandidateFamily construction (fail-closed)."""
        gf_good = _make_gf("good", [node_a], [node_b])
        gf_bad = _make_gf("bad", [node_a], [node_c])
        with pytest.raises(ValueError, match="contract"):
            CandidateFamily(
                name="broken",
                inputs=(node_a,),
                outputs=(node_b,),
                candidates=(gf_good, gf_bad),
            )

    def test_default_rationale(self, family):
        from genesis.selection import accept_selection
        candidate = family.candidates[1]  # mvp
        result = accept_selection(
            family,
            candidate,
            contract_id="c1",
            work_key="wk1",
            selected_by="evaluator",
            selection_mode="external",
        )
        assert result.rationale == ""
