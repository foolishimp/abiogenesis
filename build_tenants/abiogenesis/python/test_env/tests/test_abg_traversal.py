# Validates: REQ-R-ABG2-INTERPRET
# Validates: REQ-R-ABG2-CONVERGENCE
"""
Contract tests for ABG traversal — derived from GTL_2_INTERFACE_CONTRACTS.md.

Tests Traversal type and traverse() delegation contract.
"""
import pytest
from gtl.graph import Node, Graph
from gtl.function_model import GraphFunction, RefinementBoundary, CandidateFamily
from gtl.operator_model import Evaluator, Rule, F_D, F_P


# ── Fixtures ─────────────────────────────────────────────────────────────────


@pytest.fixture
def node_a():
    return Node(name="a", schema="str")


@pytest.fixture
def node_b():
    return Node(name="b", schema="str")


def _make_gf(name, inputs, outputs):
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
    )


# ── Traversal type ──────────────────────────────────────────────────────────


@pytest.mark.integration
class TestTraversal:
    def test_import(self):
        from genesis.interpret import Traversal
        assert Traversal is not None

    def test_frozen(self, node_a, node_b):
        from genesis.interpret import Traversal
        gf = _make_gf("work", [node_a], [node_b])
        t = Traversal(
            work_key="wk1",
            target=gf,
        )
        with pytest.raises(AttributeError):
            t.work_key = "other"

    def test_target_graph_function(self, node_a, node_b):
        from genesis.interpret import Traversal
        gf = _make_gf("work", [node_a], [node_b])
        t = Traversal(work_key="wk1", target=gf)
        assert t.target is gf
        assert t.work_key == "wk1"

    def test_target_refinement_boundary(self, node_a, node_b):
        from genesis.interpret import Traversal
        rb = RefinementBoundary(name="r", inputs=(node_a,), outputs=(node_b,))
        t = Traversal(work_key="wk1", target=rb)
        assert t.target is rb

    def test_target_candidate_family(self, node_a, node_b):
        from genesis.interpret import Traversal
        from genesis.selection import SelectionDecision
        gf = _make_gf("opt", [node_a], [node_b])
        cf = CandidateFamily(
            name="family",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf,),
        )
        t = Traversal(
            work_key="wk1",
            target=cf,
            selection=SelectionDecision(
                contract_id="contract-1",
                work_key="wk1",
                graph_function="opt",
                selected_by="test",
                selection_mode="explicit",
            ),
        )
        assert t.target is cf

    def test_candidate_family_requires_selection(self, node_a, node_b):
        from genesis.interpret import Traversal
        gf = _make_gf("opt", [node_a], [node_b])
        cf = CandidateFamily(
            name="family",
            inputs=(node_a,),
            outputs=(node_b,),
            candidates=(gf,),
        )
        with pytest.raises(ValueError, match="requires an explicit SelectionDecision"):
            Traversal(work_key="wk1", target=cf)

    def test_explicit_evaluator_vector(self, node_a, node_b):
        from genesis.interpret import Traversal
        gf = _make_gf("work", [node_a], [node_b])
        ev1 = Evaluator(name="fd", regime=F_D, binding="exec://fd")
        ev2 = Evaluator(name="fp", regime=F_P, binding="exec://fp")
        t = Traversal(
            work_key="wk1",
            target=gf,
            evaluators=(ev1, ev2),
        )
        assert len(t.evaluators) == 2
        assert t.evaluators[0].name == "fd"
        assert t.evaluators[1].name == "fp"

    def test_rule_is_optional(self, node_a, node_b):
        from genesis.interpret import Traversal
        gf = _make_gf("work", [node_a], [node_b])
        t = Traversal(work_key="wk1", target=gf)
        assert t.rule is None

    def test_rule_attached(self, node_a, node_b):
        from genesis.interpret import Traversal
        gf = _make_gf("work", [node_a], [node_b])
        rule = Rule(name="gate", kind="consensus", config={"quorum": 3})
        t = Traversal(work_key="wk1", target=gf, rule=rule)
        assert t.rule is rule

    def test_metadata_defaults_empty(self, node_a, node_b):
        from genesis.interpret import Traversal
        gf = _make_gf("work", [node_a], [node_b])
        t = Traversal(work_key="wk1", target=gf)
        assert t.metadata == {}

    def test_metadata_is_input_side_only(self, node_a, node_b):
        """Traversal.metadata is input-side runtime metadata — not strategy."""
        from genesis.interpret import Traversal
        gf = _make_gf("work", [node_a], [node_b])
        t = Traversal(
            work_key="wk1",
            target=gf,
            metadata={"request_id": "req-123", "timeout_ms": 30000},
        )
        assert t.metadata["request_id"] == "req-123"
        assert t.metadata["timeout_ms"] == 30000

    def test_selection_invalid_for_non_family_target(self, node_a, node_b):
        from genesis.interpret import Traversal
        from genesis.selection import SelectionDecision

        gf = _make_gf("work", [node_a], [node_b])
        with pytest.raises(ValueError, match="only valid when target is a CandidateFamily"):
            Traversal(
                work_key="wk1",
                target=gf,
                selection=SelectionDecision(
                    contract_id="contract-1",
                    work_key="wk1",
                    graph_function="work",
                    selected_by="test",
                    selection_mode="explicit",
                ),
            )
