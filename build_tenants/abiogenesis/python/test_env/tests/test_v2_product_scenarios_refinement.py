# Validates: REQ-L-GTL2-COMPOSE
# Validates: REQ-L-GTL2-SUBSTITUTE
# Validates: REQ-L-GTL2-GRAPHFUNCTION
# Validates: REQ-L-GTL2-MODULE
"""
V2 product scenarios — refinement (S8–S10).

These scenarios test the V2 algebra operations (compose, substitute) and
spec evolution with V2 Modules. The algebra is V2-native — no bridge
collapse occurs in these operations.

S8: compose() produces a valid composite workflow
S9: substitute() refines a coarse contract into a detailed inner graph
S10: Spec evolution — changing Module.metadata.requirements invalidates prior F_P
"""
import pytest

from gtl.graph import Graph, Node, GraphVector
from gtl.function_model import GraphFunction
from gtl.module_model import Module
from gtl.work_model import Job as GtlJob, ContractRef
from gtl.algebra import edge, compose, substitute, identity, deferred_refinement

from gtl.operator_model import Evaluator, F_D, F_P, F_H

from genesis.install import workspace_bootstrap
from genesis.services import Scope, gen_gaps
from genesis.events import emit
from genesis.provenance import req_hash


# ── S8: compose() produces valid composite workflow ───────────────────────


@pytest.mark.integration
class TestS8ComposeProducesValidWorkflow:
    """
    S8: Compose two GraphFunctions into a composite workflow.

    Proves: compose(f, g) produces a GraphFunction whose materialized
    template contains the union of nodes and vectors from both stages.
    This is genuine V2 proof — algebra operates on V2 types natively.
    """

    def test_compose_produces_composite_graph(self):
        """f;g has f.inputs as inputs, g.outputs as outputs, union of nodes/vectors."""
        a = Node(name="a")
        b = Node(name="b")
        c = Node(name="c")

        f = GraphFunction(
            name="f", inputs=(a,), outputs=(b,),
            template=lambda: edge(a, b),
        )
        g = GraphFunction(
            name="g", inputs=(b,), outputs=(c,),
            template=lambda: edge(b, c),
        )

        fg = compose(f, g)
        assert fg.name == "f;g"
        assert tuple(n.name for n in fg.inputs) == ("a",)
        assert tuple(n.name for n in fg.outputs) == ("c",)

        # Materialize and check structure
        graph = fg.template()
        node_names = {n.name for n in graph.nodes}
        assert node_names == {"a", "b", "c"}
        assert len(graph.vectors) == 2
        vec_names = {v.name for v in graph.vectors}
        assert "a→b" in vec_names
        assert "b→c" in vec_names

    def test_compose_rejects_incompatible_interfaces(self):
        """compose() raises when g.inputs are not satisfied by f.outputs."""
        a = Node(name="a")
        b = Node(name="b")
        x = Node(name="x")
        c = Node(name="c")

        f = GraphFunction(name="f", inputs=(a,), outputs=(b,))
        g = GraphFunction(name="g", inputs=(x,), outputs=(c,))

        with pytest.raises(ValueError, match="not satisfied"):
            compose(f, g)

    def test_compose_with_evaluators_preserved(self):
        """Evaluators on individual edges survive composition."""
        a = Node(name="a")
        b = Node(name="b")
        c = Node(name="c")

        eval_fd = Evaluator("check_a", F_D, "check a→b",
                            binding="exec://python -c \"import sys; sys.exit(0)\"")
        eval_fp = Evaluator("check_b", F_P, "check b→c")

        def make_f():
            return edge(a, b, evaluators=(eval_fd,))

        def make_g():
            return edge(b, c, evaluators=(eval_fp,))

        f = GraphFunction(name="f", inputs=(a,), outputs=(b,), template=make_f)
        g = GraphFunction(name="g", inputs=(b,), outputs=(c,), template=make_g)

        fg = compose(f, g)
        graph = fg.template()

        vec_map = {v.name: v for v in graph.vectors}
        assert len(vec_map["a→b"].evaluators) == 1
        assert vec_map["a→b"].evaluators[0].name == "check_a"
        assert len(vec_map["b→c"].evaluators) == 1
        assert vec_map["b→c"].evaluators[0].name == "check_b"

    def test_identity_is_neutral_element(self):
        """compose(f, id) == f in terms of interface."""
        a = Node(name="a")
        b = Node(name="b")

        f = GraphFunction(name="f", inputs=(a,), outputs=(b,))
        id_b = identity((b,))

        f_id = compose(f, id_b)
        assert tuple(n.name for n in f_id.inputs) == ("a",)
        assert tuple(n.name for n in f_id.outputs) == ("b",)


# ── S9: substitute() refines a coarse contract ───────────────────────────


@pytest.mark.integration
class TestS9SubstituteRefinesContract:
    """
    S9: substitute() replaces a coarse contract vector with a detailed
    inner graph while preserving the outer graph's interface.

    Proves: substitute() is the V2 replacement for V1 Fragment/zoom.
    This is genuine V2 proof — the algebra operates on Graph/Node/GraphVector.
    """

    def test_substitute_replaces_vector_with_inner_graph(self):
        """Coarse A→C replaced by A→B→C detail."""
        a = Node(name="a")
        b = Node(name="b")
        c = Node(name="c")

        # Outer: coarse a→c
        outer = edge(a, c)
        assert len(outer.vectors) == 1

        # Inner: detailed a→b→c
        v_ab = GraphVector(name="a→b", source=a, target=b)
        v_bc = GraphVector(name="b→c", source=b, target=c)
        inner = Graph(
            name="detail",
            inputs=(a,), outputs=(c,),
            nodes=(a, b, c), vectors=(v_ab, v_bc),
        )

        # Substitute — by vector id (REQ-L-GTL2-IDENTITY-006)
        refined = substitute(outer, outer.vectors[0].id, inner)

        # Outer contract preserved
        assert tuple(n.name for n in refined.inputs) == ("a",)
        assert tuple(n.name for n in refined.outputs) == ("c",)

        # Coarse vector removed, inner vectors added
        vec_names = {v.name for v in refined.vectors}
        assert "a→c" not in vec_names
        assert "a→b" in vec_names
        assert "b→c" in vec_names

        # New node 'b' added
        node_names = {n.name for n in refined.nodes}
        assert "b" in node_names

        # Provenance tag
        assert "substituted:a→c" in refined.tags

    def test_substitute_rejects_incompatible_inner(self):
        """substitute() raises when inner graph doesn't satisfy vector interface."""
        a = Node(name="a")
        c = Node(name="c")
        x = Node(name="x")

        outer = edge(a, c)

        # Inner doesn't produce 'c'
        inner = Graph(
            name="wrong", inputs=(a,), outputs=(x,),
            nodes=(a, x), vectors=(),
        )

        with pytest.raises(ValueError, match="not in"):
            substitute(outer, outer.vectors[0].id, inner)

    def test_substitute_preserves_remaining_vectors(self):
        """Other vectors in the outer graph are not affected."""
        a = Node(name="a")
        b = Node(name="b")
        c = Node(name="c")

        v_ab = GraphVector(name="a→b", source=a, target=b)
        v_bc = GraphVector(name="b→c", source=b, target=c)
        outer = Graph(
            name="two_edge", inputs=(a,), outputs=(c,),
            nodes=(a, b, c), vectors=(v_ab, v_bc),
        )

        # Refine only b→c
        d = Node(name="d")
        v_bd = GraphVector(name="b→d", source=b, target=d)
        v_dc = GraphVector(name="d→c", source=d, target=c)
        inner = Graph(
            name="detail", inputs=(b,), outputs=(c,),
            nodes=(b, d, c), vectors=(v_bd, v_dc),
        )

        refined = substitute(outer, v_bc.id, inner)

        vec_names = {v.name for v in refined.vectors}
        assert "a→b" in vec_names  # preserved
        assert "b→c" not in vec_names  # replaced
        assert "b→d" in vec_names  # added
        assert "d→c" in vec_names  # added


# ── S10: Spec evolution invalidates prior F_P ─────────────────────────────


@pytest.mark.integration
class TestS10SpecEvolutionInvalidatesPriorFP:
    """
    S10: Changing Module.metadata.requirements changes spec_hash,
    which invalidates prior F_P assessments.

    Proves: V2 Module requirements participate in convergence tracking.
    Spec change → stale assessment → edge unconverges.
    """

    def test_spec_hash_change_invalidates_prior_fp(self, tmp_path):
        """F_P pass under old spec_hash is stale after requirements change."""
        design = Node(name="design")
        code = Node(name="code")

        eval_fp = Evaluator("code_complete", F_P, "agent check")

        vector = GraphVector(
            name="design→code",
            source=design, target=code,
            evaluators=(eval_fp,),
        )
        graph = Graph(
            name="g", inputs=(design,), outputs=(code,),
            nodes=(design, code), vectors=(vector,),
        )

        # Version 1
        job = GtlJob(name=vector.name, contracts=(ContractRef(kind="graph_vector", target_id=vector.id),))
        module_v1 = Module(
            name="s10_test", graphs=(graph,),
            refinement_boundaries=(
                deferred_refinement(vector.name, inputs=(design,), outputs=(code,)),
            ),
            jobs=(job,),
            metadata={"requirements": ["REQ-F-ONE"]},
        )

        stream = workspace_bootstrap(tmp_path)
        scope_v1 = Scope(module=module_v1, workspace_root=tmp_path)
        hash_v1 = req_hash(scope_v1.module.metadata.get("requirements", []))

        # Converge with v1 hash
        emit("assessed", {
            "kind": "fp", "edge": "design→code",
            "evaluator": "code_complete", "actor": "test",
            "result": "pass", "evidence": "done", "spec_hash": hash_v1,
        })

        result = gen_gaps(scope_v1, stream)
        assert result["converged"] is True

        # Version 2: add a requirement
        module_v2 = Module(
            name="s10_test", graphs=(graph,),
            refinement_boundaries=(
                deferred_refinement(vector.name, inputs=(design,), outputs=(code,)),
            ),
            jobs=(job,),
            metadata={"requirements": ["REQ-F-ONE", "REQ-F-TWO"]},
        )
        scope_v2 = Scope(module=module_v2, workspace_root=tmp_path)
        hash_v2 = req_hash(scope_v2.module.metadata.get("requirements", []))

        # Hashes differ
        assert hash_v1 != hash_v2

        # Prior F_P is stale — edge is no longer converged under v2 spec
        result_v2 = gen_gaps(scope_v2, stream)
        assert result_v2["converged"] is False
        assert result_v2["total_delta"] > 0
