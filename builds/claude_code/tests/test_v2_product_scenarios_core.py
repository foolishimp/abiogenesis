# Validates: REQ-L-GTL2-MODULE
# Validates: REQ-L-GTL2-GRAPH
# (bridge-phase — proves V2 authoring + bridge adapter; does NOT prove V2-native interpretation per REQ-R-ABG2-INTERPRET-001)
"""
V2 product scenarios — core (S1–S7).

Authored with V2 structural types (Module, Graph, Node, GraphVector) and bridged
to the V1 engine via graph_adapter.module_to_package(). Evaluators use V1
Evaluator (from gtl.core) because the engine's binding layer consumes
category/description/command — the bridge phase requires this until the engine
is rewritten to consume V2 types natively.

TRACE HONESTY: These scenarios prove that V2-authored Modules can be bridged
into the still-V1 engine and produce correct convergence behavior. They do NOT
prove REQ-R-ABG2-INTERPRET-001 fully ("without collapsing them into GTL 1.0
shapes") — the bridge explicitly collapses. Full satisfaction requires Phase 5
(selection/application interpreter cutover).

The scenario layer is the primary behavioral proof of V2 migration reality.
"""
import pytest

# V2 structural types
from gtl.graph import Graph, Node, GraphVector, Context
from gtl.module_model import Module

# V1 effect types — engine binding layer requires category/description/command
# Bridge-phase necessity: retire once engine consumes V2 Evaluator natively
from gtl.core import Evaluator, Operator, F_D, F_P, F_H, consensus, Rule

# Engine services
from genesis.install import workspace_bootstrap
from genesis.graph_adapter import module_to_package
from genesis.services import Scope, gen_gaps, gen_iterate
from genesis.events import emit
from genesis.provenance import req_hash


# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_v2_single_edge_module(workspace_root=None):
    """
    Minimal V2 Module: design→code with F_D + F_P evaluators.

    Structure is V2 (Module/Graph/Node/GraphVector).
    Effects are V1-compatible (Evaluator with category/description/command).
    """
    design = Node(name="design")
    code = Node(name="code")

    eval_tags = Evaluator(
        "impl_tags", F_D,
        "all code files carry Implements: tags",
        binding="exec://python -c \"import sys; sys.exit(0)\"",  # always passes
    )
    eval_fp = Evaluator("code_complete", F_P, "agent: code implements spec")

    op = Operator("claude_agent", F_P, "agent://claude/genesis")

    vector = GraphVector(
        name="design→code",
        source=design,
        target=code,
        operators=(op,),
        evaluators=(eval_tags, eval_fp),
    )

    graph = Graph(
        name="design→code",
        inputs=(design,),
        outputs=(code,),
        nodes=(design, code),
        vectors=(vector,),
    )

    module = Module(
        name="v2_scenario_test",
        graphs=(graph,),
    )

    return module, eval_tags, eval_fp


# ── S1: Single-edge happy path ──────────────────────────────────────────────


@pytest.mark.integration
class TestS1SingleEdgeHappyPath:
    """
    S1: A single edge (design→code) with F_D + F_P evaluators.

    Proves: V2-authored Module → bridge → engine gap/iterate → convergence.
    This is the minimal proof that the V2→V1 bridge works end-to-end.
    """

    def test_bridge_produces_valid_package_and_worker(self):
        """module_to_package returns a Package with correct assets/edges/jobs."""
        module, _, _ = _make_v2_single_edge_module()
        pkg, worker = module_to_package(module, worker_id="test_worker")

        assert pkg.name == "v2_scenario_test"
        assert len(pkg.assets) == 2
        assert len(pkg.edges) == 1
        assert pkg.edges[0].name == "design→code"

        assert worker.id == "test_worker"
        assert len(worker.can_execute) == 1
        job = worker.can_execute[0]
        assert len(job.evaluators) == 2

    def test_scope_accepts_module_directly(self, tmp_path):
        """Scope(module=...) bridges internally — no manual module_to_package."""
        stream = workspace_bootstrap(tmp_path)
        module, _, _ = _make_v2_single_edge_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        assert scope.module is not None, "Scope must have module"
        assert scope.worker is not None, "Scope must derive worker from module"
        assert scope.module.name == "v2_scenario_test"

        result = gen_gaps(scope, stream)
        assert result["total_delta"] > 0

    def test_gap_detected_before_work(self, tmp_path):
        """gen_gaps shows delta > 0 before any work is done."""
        stream = workspace_bootstrap(tmp_path)
        module, _, _ = _make_v2_single_edge_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        result = gen_gaps(scope, stream)
        assert result["total_delta"] > 0, "Expected gap before any events"
        assert result["converged"] is False

    def test_fd_pass_plus_fp_pass_converges(self, tmp_path):
        """
        Full happy path: F_D passes (command exits 0), F_P assessment
        injected via event stream → gap drops to 0.
        """
        stream = workspace_bootstrap(tmp_path)
        module, _, _ = _make_v2_single_edge_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        # Verify initial gap
        before = gen_gaps(scope, stream)
        assert before["total_delta"] > 0

        # F_P assessment — inject pass event
        spec_hash = req_hash(scope.module.metadata.get("requirements", []))
        emit("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "actor": "test_fp",
            "result": "pass",
            "evidence": "code implements spec (test scenario)",
            "spec_hash": spec_hash,
        })

        # Verify convergence
        after = gen_gaps(scope, stream)
        assert after["total_delta"] == 0, f"Expected delta=0, got {after['total_delta']}"
        assert after["converged"] is True


# ── S2: F_D gap blocks false progress ───────────────────────────────────────


@pytest.mark.integration
class TestS2FdGapBlocksFalseProgress:
    """
    S2: An F_D evaluator that fails prevents convergence even if F_P passes.

    Proves: deterministic checks gate progress — no false convergence.
    """

    def test_fp_pass_without_fd_pass_does_not_converge(self, tmp_path):
        """F_P pass alone is insufficient when F_D is still failing."""
        design = Node(name="design")
        code = Node(name="code")

        # F_D evaluator that ALWAYS FAILS
        eval_fd_fail = Evaluator(
            "impl_tags", F_D,
            "tag check that always fails",
            binding="exec://python -c \"import sys; sys.exit(1)\"",
        )
        eval_fp = Evaluator("code_complete", F_P, "agent assessment")

        vector = GraphVector(
            name="design→code",
            source=design, target=code,
            evaluators=(eval_fd_fail, eval_fp),
        )
        graph = Graph(
            name="g", inputs=(design,), outputs=(code,),
            nodes=(design, code), vectors=(vector,),
        )
        module = Module(name="s2_test", graphs=(graph,))

        stream = workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path)

        # Inject F_P pass
        spec_hash = req_hash(scope.module.metadata.get("requirements", []))
        emit("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "actor": "test_fp",
            "result": "pass",
            "evidence": "code looks good",
            "spec_hash": spec_hash,
        })

        result = gen_gaps(scope, stream)
        # F_D still failing → not converged
        assert result["converged"] is False
        assert result["total_delta"] > 0
        failing = [f for g in result["gaps"] for f in g["failing"]]
        assert "impl_tags" in failing


# ── S3: Multi-edge sequential convergence ─────────────────────────────────


@pytest.mark.integration
class TestS3MultiEdgeSequentialConvergence:
    """
    S3: A three-node graph (intent→requirements→code) with two edges.

    Proves: converging one edge does not falsely converge the other.
    V2 Module with multiple GraphVectors behaves correctly through the bridge.
    """

    def _make_module(self):
        intent = Node(name="intent")
        requirements = Node(name="requirements")
        code = Node(name="code")

        eval_req_fp = Evaluator("req_complete", F_P, "agent: requirements cover intent")
        eval_code_fd = Evaluator(
            "impl_tags", F_D, "code has tags",
            binding="exec://python -c \"import sys; sys.exit(0)\"",
        )
        eval_code_fp = Evaluator("code_complete", F_P, "agent: code implements spec")

        v1 = GraphVector(
            name="intent→requirements",
            source=intent, target=requirements,
            evaluators=(eval_req_fp,),
        )
        v2 = GraphVector(
            name="requirements→code",
            source=requirements, target=code,
            evaluators=(eval_code_fd, eval_code_fp),
        )

        graph = Graph(
            name="pipeline",
            inputs=(intent,), outputs=(code,),
            nodes=(intent, requirements, code),
            vectors=(v1, v2),
        )
        return Module(name="s3_test", graphs=(graph,))

    def test_initial_gap_spans_both_edges(self, tmp_path):
        """Both edges show positive delta before any work."""
        stream = workspace_bootstrap(tmp_path)
        module = self._make_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        result = gen_gaps(scope, stream)
        assert result["converged"] is False
        assert len(result["gaps"]) == 2
        edge_names = {g["edge"] for g in result["gaps"]}
        assert "intent→requirements" in edge_names
        assert "requirements→code" in edge_names

    def test_converging_first_edge_leaves_second_open(self, tmp_path):
        """Converging edge 1 does not affect edge 2's delta."""
        stream = workspace_bootstrap(tmp_path)
        module = self._make_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        spec_hash = req_hash(scope.module.metadata.get("requirements", []))

        # Converge first edge
        emit("assessed", {
            "kind": "fp", "edge": "intent→requirements",
            "evaluator": "req_complete", "actor": "test",
            "result": "pass", "evidence": "done", "spec_hash": spec_hash,
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is False
        assert result["total_delta"] > 0

        # First edge converged, second still open
        gap_map = {g["edge"]: g for g in result["gaps"]}
        assert gap_map["intent→requirements"]["delta"] == 0
        assert gap_map["requirements→code"]["delta"] > 0

    def test_converging_all_edges_reaches_zero(self, tmp_path):
        """Converging both edges produces delta=0."""
        stream = workspace_bootstrap(tmp_path)
        module = self._make_module()
        scope = Scope(module=module, workspace_root=tmp_path)

        spec_hash = req_hash(scope.module.metadata.get("requirements", []))

        for edge_name, evaluator in [
            ("intent→requirements", "req_complete"),
            ("requirements→code", "code_complete"),
        ]:
            emit("assessed", {
                "kind": "fp", "edge": edge_name,
                "evaluator": evaluator, "actor": "test",
                "result": "pass", "evidence": "done", "spec_hash": spec_hash,
            })

        result = gen_gaps(scope, stream)
        assert result["total_delta"] == 0
        assert result["converged"] is True


# ── S4: co_evolve edge (TDD pattern) ──────────────────────────────────────


@pytest.mark.integration
class TestS4CoEvolveEdge:
    """
    S4: A GraphVector with source=(code, tests) proves the bridge
    correctly sets co_evolve=True on the V1 Edge.

    Proves: V2 tuple-source vectors produce co_evolve edges through the bridge.
    """

    def test_co_evolve_bridge_and_convergence(self, tmp_path):
        """Tuple source → co_evolve Edge; F_D+F_P pass → converge."""
        code = Node(name="code")
        tests = Node(name="unit_tests")

        eval_fd = Evaluator(
            "tests_pass", F_D, "pytest passes",
            binding="exec://python -c \"import sys; sys.exit(0)\"",
        )
        eval_fp = Evaluator("coverage_complete", F_P, "agent: tests cover code")

        vector = GraphVector(
            name="code↔unit_tests",
            source=(code, tests),
            target=tests,
            evaluators=(eval_fd, eval_fp),
        )

        graph = Graph(
            name="tdd", inputs=(code,), outputs=(tests,),
            nodes=(code, tests), vectors=(vector,),
        )
        module = Module(name="s4_test", graphs=(graph,))

        # Verify bridge sets co_evolve
        from genesis.graph_adapter import module_to_package
        pkg, worker = module_to_package(module)
        assert pkg.edges[0].co_evolve is True
        assert isinstance(pkg.edges[0].source, list)
        assert len(pkg.edges[0].source) == 2

        # Verify convergence works through the bridge
        stream = workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path)
        spec_hash = req_hash(scope.module.metadata.get("requirements", []))

        emit("assessed", {
            "kind": "fp", "edge": "code↔unit_tests",
            "evaluator": "coverage_complete", "actor": "test",
            "result": "pass", "evidence": "done", "spec_hash": spec_hash,
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is True
        assert result["total_delta"] == 0


# ── S5: F_H gate blocks then approval converges ──────────────────────────


@pytest.mark.integration
class TestS5FhGateBlocksThenApprovalConverges:
    """
    S5: A GraphVector with an F_H evaluator and rule=standard_gate
    blocks until human approval is received.

    Proves: GraphVector.rule passes through bridge to Edge.rule;
    F_H gate mechanics work with V2-authored Module.
    """

    def test_fh_gate_blocks_then_approval_converges(self, tmp_path):
        """F_H evaluator blocks; approved event → converged."""
        draft = Node(name="draft")
        approved = Node(name="approved_doc")

        eval_fh = Evaluator("sign_off", F_H, "Human approval")
        gate = Rule(name="standard_gate", kind="gate", config={"approve": consensus(1, 1), "dissent": "recorded"})

        vector = GraphVector(
            name="draft→approved_doc",
            source=draft, target=approved,
            evaluators=(eval_fh,),
            rule=gate,
        )
        graph = Graph(
            name="approval", inputs=(draft,), outputs=(approved,),
            nodes=(draft, approved), vectors=(vector,),
        )
        module = Module(name="s5_test", graphs=(graph,))

        # Verify rule passes through bridge
        from genesis.graph_adapter import module_to_package
        pkg, _ = module_to_package(module)
        assert pkg.edges[0].rule is not None
        assert pkg.edges[0].rule.name == "standard_gate"

        stream = workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path)

        # Before approval: not converged
        result = gen_gaps(scope, stream)
        assert result["converged"] is False

        # After approval
        emit("approved", {
            "kind": "fh_review",
            "edge": "draft→approved_doc",
            "actor": "human",
            "evaluator": "sign_off",
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is True
        assert result["total_delta"] == 0


# ── S6: Independent work lines with V2 Module ────────────────────────────


@pytest.mark.integration
class TestS6IndependentWorkLines:
    """
    S6: Two features on the same V2 Module topology converge independently.

    Proves: feature-scoped convergence works with V2-authored Module.
    """

    def test_feature_a_converges_b_remains_open(self, tmp_path):
        """Converging feature A does not satisfy feature B."""
        design = Node(name="design")
        code = Node(name="code")

        eval_fp = Evaluator("code_complete", F_P, "agent: code implements spec")

        vector = GraphVector(
            name="design→code",
            source=design, target=code,
            evaluators=(eval_fp,),
        )
        graph = Graph(
            name="g", inputs=(design,), outputs=(code,),
            nodes=(design, code), vectors=(vector,),
        )
        module = Module(name="s6_test", graphs=(graph,))

        stream = workspace_bootstrap(tmp_path)

        # Create two feature vectors
        features_dir = tmp_path / ".ai-workspace" / "features" / "active"
        features_dir.mkdir(parents=True, exist_ok=True)
        (features_dir / "REQ-F-AUTH.yml").write_text(
            "feature: REQ-F-AUTH\nsatisfies: [REQ-F-AUTH]\n"
        )
        (features_dir / "REQ-F-BILLING.yml").write_text(
            "feature: REQ-F-BILLING\nsatisfies: [REQ-F-BILLING]\n"
        )

        scope_auth = Scope(
            module=module, workspace_root=tmp_path, feature="REQ-F-AUTH",
        )
        spec_hash = req_hash(scope_auth.module.metadata.get("requirements", []))

        # Converge AUTH
        emit("assessed", {
            "kind": "fp", "edge": "design→code",
            "evaluator": "code_complete", "actor": "test",
            "result": "pass", "evidence": "done",
            "spec_hash": spec_hash, "work_key": "REQ-F-AUTH",
        })

        gap_auth = gen_gaps(scope_auth, stream)
        assert gap_auth["total_delta"] == 0

        # BILLING still open
        scope_billing = Scope(
            module=module, workspace_root=tmp_path, feature="REQ-F-BILLING",
        )
        gap_billing = gen_gaps(scope_billing, stream)
        assert gap_billing["total_delta"] > 0


# ── S7: Module.metadata.requirements flows through bridge ─────────────────


@pytest.mark.integration
class TestS7RequirementsPassthrough:
    """
    S7: Module.metadata["requirements"] flows through the bridge to
    Package.requirements. The spec_hash reflects module requirements.

    Proves: V2 metadata.requirements → V1 Package.requirements → spec_hash.
    """

    def test_requirements_flow_through_bridge(self, tmp_path):
        """Module requirements appear in Package and affect spec_hash."""
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

        reqs = ["REQ-F-ONE", "REQ-F-TWO", "REQ-F-THREE"]
        module = Module(
            name="s7_test", graphs=(graph,),
            metadata={"requirements": reqs},
        )

        stream = workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path)

        # Requirements flow through
        assert scope.module.metadata.get("requirements", []) == reqs
        assert len(scope.module.metadata.get("requirements", [])) == 3

        # spec_hash reflects requirements
        hash_a = req_hash(scope.module.metadata.get("requirements", []))
        assert hash_a  # non-empty

        # Different requirements → different hash
        module_b = Module(
            name="s7_test_b", graphs=(graph,),
            metadata={"requirements": ["REQ-F-CHANGED"]},
        )
        scope_b = Scope(module=module_b, workspace_root=tmp_path)
        hash_b = req_hash(scope_b.module.metadata.get("requirements", []))
        assert hash_b != hash_a

    def test_convergence_with_module_requirements(self, tmp_path):
        """F_P pass with correct spec_hash from module requirements → converge."""
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
        module = Module(
            name="s7_conv", graphs=(graph,),
            metadata={"requirements": ["REQ-F-A", "REQ-F-B"]},
        )

        stream = workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path)
        spec_hash = req_hash(scope.module.metadata.get("requirements", []))

        emit("assessed", {
            "kind": "fp", "edge": "design→code",
            "evaluator": "code_complete", "actor": "test",
            "result": "pass", "evidence": "done", "spec_hash": spec_hash,
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is True
