# Validates: REQ-L-GTL2-MODULE
# Validates: REQ-L-GTL2-COMPOSE
# Validates: REQ-L-GTL2-GRAPH
# Validates: REQ-L-GTL2-IDENTITY
# Validates: REQ-L-GTL2-OPERATOR
# Validates: REQ-L-GTL2-EVALUATOR
# Validates: REQ-L-GTL2-RULE
# Validates: REQ-L-GTL2-NODE
"""
V2 contract and semantic tests — guards Phase 3+ invariants.

Thin, targeted checks that the V2 type surface has the correct shape.
The scenario layer (test_v2_product_scenarios_*.py) is the primary proof;
these tests guard regressions in the type contracts themselves.

TRACE HONESTY:
- Module/Graph/Node/GraphVector/Operator/Evaluator/Rule frozen contracts: real V2 proof
- Legacy marker tests (Package/Fragment/Overlay docstrings): prove deprecation labeling, not V2 operation
- Job/Worker relocation tests: prove identity (gtl.core.Job is genesis.binding.Job), not
  that consumers operate without V1 imports — full ABG2-JOB-WORKER requires Phase 5
"""
import dataclasses
import pytest

from gtl.graph import Graph, Node, GraphVector
from gtl.function_model import GraphFunction
from gtl.operator_model import Evaluator, Operator, F_D, F_P, F_H, Rule
from gtl.module_model import Module, ModuleImport
from gtl.algebra import edge, compose, substitute, identity


# ── Module contract ──────────────────────────────────────────────────────────


@pytest.mark.integration
class TestModuleContract:
    def test_module_is_frozen(self):
        """Module is a frozen dataclass — attribute reassignment raises."""
        m = Module(name="test")
        with pytest.raises(dataclasses.FrozenInstanceError):
            m.name = "changed"

    def test_module_metadata_is_dict(self):
        """metadata is a dict (matching accepted design), not a restricted type."""
        m = Module(name="test", metadata={"version": "1.0", "count": 42})
        assert m.metadata["version"] == "1.0"
        assert m.metadata["count"] == 42

    def test_module_metadata_default_empty(self):
        m = Module(name="test")
        assert m.metadata == {}

    def test_module_metadata_binding_frozen(self):
        """The metadata attribute binding is frozen (can't reassign)."""
        m = Module(name="test", metadata={"k": "v"})
        with pytest.raises(dataclasses.FrozenInstanceError):
            m.metadata = {"other": "dict"}

    def test_module_import_is_frozen(self):
        mi = ModuleImport(source="other", names=("graph_a",))
        with pytest.raises(dataclasses.FrozenInstanceError):
            mi.source = "changed"

    def test_module_carries_graphs_and_functions(self):
        n1 = Node(name="a")
        n2 = Node(name="b")
        g = Graph(name="g", inputs=(n1,), outputs=(n2,), nodes=(n1, n2))
        gf = GraphFunction(name="gf", inputs=(n1,), outputs=(n2,))
        m = Module(name="test", graphs=(g,), graph_functions=(gf,))
        assert len(m.graphs) == 1
        assert len(m.graph_functions) == 1

    def test_module_carries_operators_evaluators_rules(self):
        op = Operator(name="op", regime=F_D)
        ev = Evaluator(name="ev", regime=F_P)
        rule = Rule(name="rule")
        m = Module(
            name="test",
            operators=(op,),
            evaluators=(ev,),
            rules=(rule,),
        )
        assert len(m.operators) == 1
        assert len(m.evaluators) == 1
        assert len(m.rules) == 1


# ── V2 type frozen invariants ────────────────────────────────────────────────


@pytest.mark.integration
class TestV2TypesAreFrozen:
    def test_graph_is_frozen(self):
        g = Graph(name="g")
        with pytest.raises(dataclasses.FrozenInstanceError):
            g.name = "changed"

    def test_node_is_frozen(self):
        n = Node(name="n")
        with pytest.raises(dataclasses.FrozenInstanceError):
            n.name = "changed"

    def test_graph_vector_is_frozen(self):
        v = GraphVector(name="v")
        with pytest.raises(dataclasses.FrozenInstanceError):
            v.name = "changed"

    def test_graph_function_is_frozen(self):
        gf = GraphFunction(name="gf")
        with pytest.raises(dataclasses.FrozenInstanceError):
            gf.name = "changed"

    def test_operator_is_frozen(self):
        op = Operator(name="op", regime=F_D)
        with pytest.raises(dataclasses.FrozenInstanceError):
            op.name = "changed"

    def test_evaluator_is_frozen(self):
        ev = Evaluator(name="ev", regime=F_D)
        with pytest.raises(dataclasses.FrozenInstanceError):
            ev.name = "changed"

    def test_rule_is_frozen(self):
        r = Rule(name="r")
        with pytest.raises(dataclasses.FrozenInstanceError):
            r.name = "changed"


# ── Node markov contract (REQ-L-GTL2-NODE-003..006) ─────────────────────────


@pytest.mark.integration
class TestNodeMarkov:
    """REQ-L-GTL2-NODE-003 through NODE-006: markov as first-class Node field."""

    def test_markov_defaults_to_empty_tuple(self):
        """REQ-L-GTL2-NODE-006: absence = no declared conditions."""
        n = Node(name="n")
        assert n.markov == ()

    def test_markov_is_tuple(self):
        """REQ-L-GTL2-NODE-003: markov is a declarative set."""
        n = Node(name="n", markov=("compiles", "tests_pass"))
        assert isinstance(n.markov, tuple)
        assert n.markov == ("compiles", "tests_pass")

    def test_markov_survives_freeze(self):
        """Frozen dataclass preserves markov."""
        n = Node(name="n", markov=("valid",))
        with pytest.raises(dataclasses.FrozenInstanceError):
            n.markov = ("changed",)

    def test_markov_participates_in_structural_equality(self):
        """Same name + different markov = different structure."""
        n1 = Node(name="n", markov=("a",))
        n2 = Node(name="n", markov=("b",))
        assert n1 != n2

    def test_markov_same_values_are_equal(self):
        """Same name + same markov = structurally equal (id excluded)."""
        n1 = Node(name="n", markov=("a", "b"))
        n2 = Node(name="n", markov=("a", "b"))
        assert n1 == n2
        assert n1.id != n2.id  # distinct identity


# ── Categorical identity (REQ-L-GTL2-IDENTITY) ──────────────────────────────


@pytest.mark.integration
class TestCategoricalIdentity:
    """REQ-L-GTL2-IDENTITY: every first-class type carries opaque .id."""

    def test_graph_has_auto_minted_id(self):
        g = Graph(name="g")
        assert hasattr(g, "id")
        assert isinstance(g.id, str)
        assert len(g.id) == 36  # UUID4 format

    def test_node_has_auto_minted_id(self):
        n = Node(name="n")
        assert isinstance(n.id, str) and len(n.id) == 36

    def test_graph_vector_has_auto_minted_id(self):
        v = GraphVector(name="v")
        assert isinstance(v.id, str) and len(v.id) == 36

    def test_graph_function_has_auto_minted_id(self):
        gf = GraphFunction(name="gf")
        assert isinstance(gf.id, str) and len(gf.id) == 36

    def test_distinct_instances_get_distinct_ids(self):
        """REQ-L-GTL2-IDENTITY-002: auto-minted, unique per instance."""
        g1 = Graph(name="same")
        g2 = Graph(name="same")
        assert g1.id != g2.id

    def test_structural_equality_ignores_id(self):
        """REQ-L-GTL2-IDENTITY-005: == is structural, not identity."""
        n1 = Node(name="a")
        n2 = Node(name="a")
        assert n1 == n2  # same structure
        assert n1.id != n2.id  # different identity

    def test_same_object_compares_by_id(self):
        """REQ-L-GTL2-IDENTITY-005: same_object() compares .id."""
        from gtl.algebra import same_object
        g1 = Graph(name="g")
        g2 = Graph(name="g")
        assert not same_object(g1, g2)
        assert same_object(g1, g1)

    def test_substitute_mints_new_graph_id(self):
        """REQ-L-GTL2-IDENTITY-004: transform → new identity."""
        n1 = Node(name="a")
        n2 = Node(name="b")
        n3 = Node(name="mid")
        vec = GraphVector(name="a→b", source=n1, target=n2)
        outer = Graph(name="g", inputs=(n1,), outputs=(n2,),
                      nodes=(n1, n2), vectors=(vec,))

        inner_vec1 = GraphVector(name="a→mid", source=n1, target=n3)
        inner_vec2 = GraphVector(name="mid→b", source=n3, target=n2)
        inner = Graph(name="g", inputs=(n1,), outputs=(n2,),
                      nodes=(n1, n3, n2), vectors=(inner_vec1, inner_vec2))

        result = substitute(outer, vec.id, inner)
        assert result.id != outer.id, "substitute must mint new Graph id"
        assert result.name == outer.name, "substitute preserves label"

    def test_substitute_targets_by_vector_id(self):
        """REQ-L-GTL2-IDENTITY-006: substitute targets vector by .id."""
        n1 = Node(name="a")
        n2 = Node(name="b")
        n3 = Node(name="c")
        # Two vectors with different ids but same label pattern
        vec1 = GraphVector(name="step", source=n1, target=n2)
        vec2 = GraphVector(name="step", source=n2, target=n3)
        outer = Graph(name="g", inputs=(n1,), outputs=(n3,),
                      nodes=(n1, n2, n3), vectors=(vec1, vec2))

        n_mid = Node(name="mid")
        inner_v1 = GraphVector(name="a→mid", source=n1, target=n_mid)
        inner_v2 = GraphVector(name="mid→b", source=n_mid, target=n2)
        inner = Graph(name="g", inputs=(n1,), outputs=(n2,),
                      nodes=(n1, n_mid, n2), vectors=(inner_v1, inner_v2))

        # Target vec1 by id — vec2 (same label) survives
        result = substitute(outer, vec1.id, inner)
        result_vec_names = [v.name for v in result.vectors]
        assert "a→mid" in result_vec_names
        assert "mid→b" in result_vec_names
        # vec2 (same label "step") must survive — targeted by id, not name
        surviving_steps = [v for v in result.vectors if v.name == "step"]
        assert len(surviving_steps) == 1
        assert surviving_steps[0].id == vec2.id


# ── Legacy markers ───────────────────────────────────────────────────────────


@pytest.mark.integration
class TestLegacyMarkers:
    def test_package_docstring_marks_legacy(self):
        from gtl.core import Package
        assert "deprecated" in Package.__doc__.lower()
        assert "Module" in Package.__doc__

    def test_job_relocated_to_binding(self):
        """Job is canonically in genesis.binding, re-exported from gtl.core."""
        from gtl.core import Job as CoreJob
        from genesis.binding import Job as BindingJob
        assert CoreJob is BindingJob, "gtl.core.Job must be genesis.binding.Job"

    def test_worker_relocated_to_binding(self):
        """Worker is canonically in genesis.binding, re-exported from gtl.core."""
        from gtl.core import Worker as CoreWorker
        from genesis.binding import Worker as BindingWorker
        assert CoreWorker is BindingWorker, "gtl.core.Worker must be genesis.binding.Worker"

    def test_fragment_docstring_marks_replacement(self):
        from gtl.core import Fragment
        assert "deprecated" in Fragment.__doc__.lower()
        assert "compose" in Fragment.__doc__.lower() or "substitute" in Fragment.__doc__.lower()

    def test_overlay_docstring_marks_replacement(self):
        from gtl.core import Overlay
        assert "deprecated" in Overlay.__doc__.lower()
        assert "compose" in Overlay.__doc__.lower() or "substitute" in Overlay.__doc__.lower()

    def test_package_snapshot_docstring_marks_legacy(self):
        from gtl.core import PackageSnapshot
        assert "deprecated" in PackageSnapshot.__doc__.lower()

    def test_gtl_init_documents_v2_surface(self):
        import gtl
        assert "V2" in gtl.__doc__
        assert "gtl.graph" in gtl.__doc__
        assert "gtl.module_model" in gtl.__doc__
