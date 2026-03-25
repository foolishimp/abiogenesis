# Validates: REQ-F-CORE-001
# Validates: REQ-F-GATE-001
# Validates: REQ-F-GATE-002
# Validates: REQ-F-WK-004
# Validates: REQ-F-PROV-004
# Validates: REQ-F-CORRECT-001
# Validates: REQ-R-ABG2-SELECTION-APPLICATION-001
# Validates: REQ-R-ABG2-SELECTION-APPLICATION-002
# Validates: REQ-R-ABG2-SELECTION-APPLICATION-003
# Validates: REQ-R-ABG2-SELECTION-APPLICATION-004
# Validates: REQ-L-GTL2-IDENTITY-007
# Validates: REQ-F-RUN-001
# Validates: REQ-F-RUN-003
"""
Product scenarios 1–10: ABG + GTL end-to-end.

Source: .ai-workspace/comments/codex/20260324T165057_PRODUCT_SCENARIOS_abg-gtl-first-10.md

These are product-owner integration scenarios, not unit tests.
Each validates that ABG can execute a complete use case through
the real command path (gen_iterate, gen_gaps) with a real event stream.
"""
import json
from pathlib import Path

import pytest

from gtl.graph import Graph, Node, GraphVector, Context
from gtl.module_model import Module
from gtl.function_model import GraphFunction
from gtl.operator_model import Evaluator, Operator, F_D, F_P, F_H, Rule
from gtl.core import consensus

from genesis.binding import Job, Worker
from genesis.events import EventStream
from genesis.install import workspace_bootstrap
from genesis.provenance import req_hash
from genesis.services import Scope, gen_gaps, gen_iterate, gen_start
from genesis.convergence import delta
from genesis.run import find_pending_run, run_state, supersede_run


# ── Shared helpers ──────────────────────────────────────────────────────────

def _ws(tmp_path, feature_id=None):
    """Bootstrap workspace + optional active feature."""
    stream = workspace_bootstrap(tmp_path)
    if feature_id:
        features_dir = tmp_path / ".ai-workspace" / "features" / "active"
        features_dir.mkdir(parents=True, exist_ok=True)
        (features_dir / f"{feature_id}.yml").write_text(
            f"feature: {feature_id}\nsatisfies: [{feature_id}]\n"
        )
    return stream


def _make_single_edge_module(
    src_name="design", tgt_name="code",
    edge_name=None,
    evaluators=None,
    operators=None,
    requirements=None,
    name="test_module",
):
    """Build a minimal V2 Module with one edge."""
    src = Node(name=src_name)
    tgt = Node(name=tgt_name)
    edge_name = edge_name or f"{src_name}→{tgt_name}"
    evaluators = evaluators or (Evaluator("code_complete", F_P, "check"),)
    operators = operators or (Operator("agent", F_P, "agent://claude/genesis"),)

    vec = GraphVector(
        name=edge_name,
        source=src, target=tgt,
        operators=operators,
        evaluators=evaluators,
    )
    graph = Graph(
        name=edge_name,
        inputs=(src,), outputs=(tgt,),
        nodes=(src, tgt), vectors=(vec,),
    )
    module = Module(
        name=name,
        graphs=(graph,),
        metadata={"requirements": requirements or []},
    )
    return module


def _scope(tmp_path, module, **kw):
    return Scope(module=module, workspace_root=tmp_path, **kw)


def _spec_hash(module):
    """Compute the spec_hash gen_gaps uses for unknown workflow_version."""
    return req_hash(module.metadata.get("requirements", []))


def _job_from_module(module):
    """Extract the first Job from a Module (for delta() calls)."""
    from genesis.services import module_to_jobs
    jobs = module_to_jobs(module)
    return jobs[0]


# ── Scenario 1: Single-Edge Happy Path ──────────────────────────────────────

class TestScenario1SingleEdgeHappyPath:
    """Take one coarse edge from unmet to converged through the normal ABG loop."""

    def test_single_edge_converges_after_assessed(self, tmp_path):
        module = _make_single_edge_module()

        stream = _ws(tmp_path)
        scope = _scope(tmp_path, module)

        # Step 1: gen_iterate — emits run_started, edge_started, fp_dispatched
        result = gen_iterate(scope, stream)
        assert result["status"] == "iterated"
        events = stream.all_events()
        types = [e["event_type"] for e in events]
        assert "run_started" in types
        assert "edge_started" in types
        assert "fp_dispatched" in types

        # Step 2: simulate F_P actor writes assessed result
        run_id = result["run_id"]
        stream.append("assessed", {
            "edge": "design→code", "run_id": run_id,
            "kind": "fp", "result": "pass", "evaluator": "code_complete",
            "spec_hash": _spec_hash(module),
        })

        # Step 3: gen_gaps confirms convergence
        gap_result = gen_gaps(scope, stream)
        assert gap_result["converged"] is True
        certs = [e for e in stream.all_events() if e["event_type"] == "edge_converged"]
        assert len(certs) == 1
        assert certs[0]["data"]["edge"] == "design→code"

        # Step 4: delta is zero
        job = _job_from_module(module)
        d = delta(job, stream, tmp_path)
        assert d == 0.0


# ── Scenario 2: Deterministic Gap Blocks False Progress ─────────────────────

class TestScenario2FdGapBlocks:
    """Deterministic failures block progress when no F_P remediation exists."""

    def test_fd_only_edge_blocks_with_fd_gap(self, tmp_path):
        module = _make_single_edge_module(
            src_name="source", tgt_name="output",
            evaluators=(
                Evaluator("always_fail", F_D, "sentinel must exist",
                          binding="exec://python -c 'import sys; sys.exit(1)'"),
            ),
            operators=(Operator("checker", F_D, "exec://false"),),
        )

        stream = _ws(tmp_path)
        scope = _scope(tmp_path, module)
        result = gen_iterate(scope, stream)

        events = stream.all_events()
        types = [e["event_type"] for e in events]
        found_events = [e for e in events if e["event_type"] == "found"]
        assert any(e["data"]["kind"] == "fd_gap" for e in found_events)
        assert "fp_dispatched" not in types
        assert "edge_converged" not in types

        job = _job_from_module(module)
        d = delta(job, stream, tmp_path)
        assert d > 0


# ── Scenario 3: Deterministic Findings Escalate to Construction ─────────────

class TestScenario3FdEscalation:
    """F_D findings become the construction surface when F_P path exists."""

    def test_fd_findings_escalate_to_fp(self, tmp_path):
        module = _make_single_edge_module(
            evaluators=(
                Evaluator("impl_tags", F_D, "tags must exist",
                          binding="exec://python -c 'import sys; sys.exit(1)'"),
                Evaluator("code_complete", F_P, "agent check"),
            ),
            operators=(
                Operator("checker", F_D, "exec://false"),
                Operator("agent", F_P, "agent://claude/genesis"),
            ),
        )

        stream = _ws(tmp_path)
        scope = _scope(tmp_path, module)
        result = gen_iterate(scope, stream)

        events = stream.all_events()
        found = [e for e in events if e["event_type"] == "found"]
        assert any(e["data"]["kind"] == "fd_findings" for e in found)
        assert any(e["event_type"] == "fp_dispatched" for e in events)
        # The system does NOT stop at fd_gap — escalation happened
        assert not any(
            e["event_type"] == "found" and e["data"]["kind"] == "fd_gap"
            for e in events
        )


# ── Scenario 4: Human Judgment Gates Final Convergence ──────────────────────

class TestScenario4HumanGate:
    """Human approval remains a first-class gate where required."""

    def test_fh_gate_blocks_then_approval_converges(self, tmp_path):
        module = _make_single_edge_module(
            src_name="draft", tgt_name="approved_doc",
            evaluators=(
                Evaluator("sign_off", F_H, "Human approval"),
            ),
            operators=(Operator("human", F_H, "fh://single"),),
        )

        stream = _ws(tmp_path)
        scope = _scope(tmp_path, module)

        # Before approval: F_H gate pending
        result = gen_iterate(scope, stream)
        events = stream.all_events()
        assert any(e["event_type"] == "fh_gate_pending" for e in events)

        # Edge does NOT converge yet
        gap_result = gen_gaps(scope, stream)
        assert gap_result["converged"] is False

        # After approval
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "draft→approved_doc",
            "actor": "human",
            "evaluator": "sign_off",
        })

        # Now it converges
        gap_result = gen_gaps(scope, stream)
        assert gap_result["converged"] is True
        job = _job_from_module(module)
        d = delta(job, stream, tmp_path)
        assert d == 0.0


# ── Scenario 5: Two Work Lines Converge Independently ───────────────────────

class TestScenario5IndependentWorkLines:
    """Multiple work lines on the same topology remain independent."""

    def test_auth_converges_billing_remains_open(self, tmp_path):
        module = _make_single_edge_module()

        stream = _ws(tmp_path, "REQ-F-AUTH")
        # Also create BILLING feature
        features_dir = tmp_path / ".ai-workspace" / "features" / "active"
        (features_dir / "REQ-F-BILLING.yml").write_text(
            "feature: REQ-F-BILLING\nsatisfies: [REQ-F-BILLING]\n"
        )

        # Iterate AUTH
        scope_auth = _scope(tmp_path, module, feature="REQ-F-AUTH")
        result = gen_iterate(scope_auth, stream)
        auth_run_id = result["run_id"]

        # Simulate AUTH assessed
        stream.append("assessed", {
            "edge": "design→code", "run_id": auth_run_id,
            "work_key": "REQ-F-AUTH", "kind": "fp", "result": "pass",
            "evaluator": "code_complete", "spec_hash": _spec_hash(module),
        })

        # AUTH converges
        gap_auth = gen_gaps(scope_auth, stream)
        auth_certs = [
            e for e in stream.all_events()
            if e["event_type"] == "edge_converged"
            and e["data"].get("work_key") == "REQ-F-AUTH"
        ]
        assert len(auth_certs) == 1

        # BILLING still has positive delta
        job = _job_from_module(module)
        d_billing = delta(job, stream, tmp_path, work_key="REQ-F-BILLING")
        assert d_billing > 0

        # AUTH certificate does NOT satisfy BILLING
        d_auth = delta(job, stream, tmp_path, work_key="REQ-F-AUTH")
        assert d_auth == 0.0


# ── Scenario 6: Workflow Upgrade Preserves Lineage ──────────────────────────

class TestScenario6WorkflowUpgrade:
    """Workflow upgrades preserve history without silently accepting stale truth."""

    def test_spec_hash_change_invalidates_prior_fp(self, tmp_path):
        module = _make_single_edge_module()

        stream = _ws(tmp_path)

        # Assess under spec_hash_v1
        stream.append("assessed", {
            "edge": "design→code", "kind": "fp", "result": "pass", "evaluator": "code_complete",
            "spec_hash": "hash_v1",
        })

        job = _job_from_module(module)

        # Under v1 hash: converged
        d_v1 = delta(job, stream, tmp_path, spec_hash="hash_v1")
        assert d_v1 == 0.0

        # Under v2 hash: NOT converged — spec changed
        d_v2 = delta(job, stream, tmp_path, spec_hash="hash_v2")
        assert d_v2 > 0

        # History remains — event still in stream
        assessed = [e for e in stream.all_events() if e["event_type"] == "assessed"]
        assert len(assessed) == 1


# ── Scenario 7: Reset Re-Opens Certification ────────────────────────────────

class TestScenario7Reset:
    """Reset forces re-certification without destroying history."""

    def test_scoped_reset_shadows_prior_certification(self, tmp_path):
        module = _make_single_edge_module()
        job = _job_from_module(module)

        stream = _ws(tmp_path, "REQ-F-AUTH")

        # Converge AUTH
        stream.append("assessed", {
            "edge": "design→code", "kind": "fp", "result": "pass", "evaluator": "code_complete",
            "work_key": "REQ-F-AUTH",
        })
        d_before = delta(job, stream, tmp_path, work_key="REQ-F-AUTH")
        assert d_before == 0.0

        # Reset AUTH scope
        stream.append("reset", {
            "scope": "work_key", "work_key": "REQ-F-AUTH",
            "reason": "spec changed",
        })

        # AUTH is now unconverged — reset shadows prior assessed
        d_after = delta(job, stream, tmp_path, work_key="REQ-F-AUTH")
        assert d_after > 0

        # All prior events remain in the log
        all_events = stream.all_events()
        assert any(e["event_type"] == "assessed" for e in all_events)
        assert any(e["event_type"] == "reset" for e in all_events)

    def test_sibling_work_line_unaffected_by_scoped_reset(self, tmp_path):
        module = _make_single_edge_module()
        job = _job_from_module(module)

        stream = _ws(tmp_path)

        # Converge both AUTH and BILLING
        stream.append("assessed", {
            "edge": "design→code", "kind": "fp", "result": "pass", "evaluator": "code_complete",
            "work_key": "REQ-F-AUTH",
        })
        stream.append("assessed", {
            "edge": "design→code", "kind": "fp", "result": "pass", "evaluator": "code_complete",
            "work_key": "REQ-F-BILLING",
        })

        # Reset AUTH only
        stream.append("reset", {
            "scope": "work_key", "work_key": "REQ-F-AUTH",
        })

        # AUTH is unconverged, BILLING remains converged
        d_auth = delta(job, stream, tmp_path, work_key="REQ-F-AUTH")
        d_billing = delta(job, stream, tmp_path, work_key="REQ-F-BILLING")
        assert d_auth > 0
        assert d_billing == 0.0


# ── Scenario 8: Coarse Edge Refined by Selection+Substitute ──────────────────

class TestScenario8Selection:
    """A coarse edge is refined via V2 GraphFunction selection."""

    def test_selection_refines_edge_and_records_provenance(self, tmp_path):
        design_n = Node(name="design")
        mod_n = Node(name="module_decomp")
        code_n = Node(name="code")

        outer_vec = GraphVector(
            name="design→code", source=design_n, target=code_n,
            evaluators=(Evaluator("code_complete", F_P, "check"),),
            operators=(Operator("agent", F_P, "agent://claude/genesis"),),
        )
        outer_graph = Graph(
            name="s8", inputs=(design_n,), outputs=(code_n,),
            nodes=(design_n, code_n), vectors=(outer_vec,),
        )

        # GraphFunction that refines design→code into design→module_decomp→code
        eval_fp = Evaluator("code_complete", F_P, "check")
        def _detail():
            v1 = GraphVector(name="design→module_decomp", source=design_n, target=mod_n,
                             evaluators=(eval_fp,))
            v2 = GraphVector(name="module_decomp→code", source=mod_n, target=code_n,
                             evaluators=(eval_fp,))
            return Graph(
                name="s8",
                inputs=(design_n,), outputs=(code_n,),
                nodes=(design_n, mod_n, code_n), vectors=(v1, v2),
            )

        gf = GraphFunction(
            name="via_module_decomp",
            inputs=(design_n,), outputs=(code_n,),
            template=_detail,
        )

        module = Module(
            name="s8", graphs=(outer_graph,),
            graph_functions=(gf,),
            metadata={"requirements": ["REQ-F-COMPLEX"]},
        )

        stream = _ws(tmp_path, "REQ-F-COMPLEX")
        scope = Scope(module=module, workspace_root=tmp_path)

        result = gen_iterate(scope, stream)

        # Selection happened
        assert result["status"] == "selected"
        assert result["graph_function"] == "via_module_decomp"

        # Provenance recorded with full fields per REQ-R-ABG2-SELECTION-APPLICATION-003
        selected = [e for e in stream.all_events() if e["event_type"] == "workflow_selected"]
        assert len(selected) == 1
        sel_data = selected[0]["data"]
        assert sel_data["graph_function"] == "via_module_decomp"
        assert sel_data["selected_by"] == "auto"
        assert sel_data["selection_mode"] == "single_match"
        assert "rationale" in sel_data
        assert "inner_vectors" in sel_data
        assert set(sel_data["inner_vectors"]) == {"design→module_decomp", "module_decomp→code"}

        # Substitution applied: scope.module now has the refined graph
        # The coarse vector "design→code" is replaced by the inner vectors
        updated_graph = scope.module.graphs[0]
        updated_vec_names = {v.name for v in updated_graph.vectors}
        assert "design→code" not in updated_vec_names, "coarse vector must be removed"
        assert "design→module_decomp" in updated_vec_names, "inner vector must be added"
        assert "module_decomp→code" in updated_vec_names, "inner vector must be added"
        # New node 'module_decomp' must be present
        updated_node_names = {n.name for n in updated_graph.nodes}
        assert "module_decomp" in updated_node_names

        # Children spawned
        spawned = [e for e in stream.all_events() if e["event_type"] == "work_spawned"]
        assert len(spawned) == 2
        child_keys = {e["data"]["child_key"] for e in spawned}
        assert all("REQ-F-COMPLEX/" in ck for ck in child_keys)

    def test_same_label_graphs_do_not_alias(self, tmp_path):
        """
        REQ-L-GTL2-IDENTITY-007: same-name graphs with distinct ids don't alias.

        Two graphs share the label "dup" but have auto-minted distinct ids.
        Selection on graph1's vector replaces only graph1 — graph2 is untouched.
        """
        a_n = Node(name="a")
        b_n = Node(name="b")
        c_n = Node(name="c")
        vec1 = GraphVector(
            name="a→b", source=a_n, target=b_n,
            evaluators=(Evaluator("e", F_P, "check"),),
            operators=(Operator("agent", F_P, "agent://claude/genesis"),),
        )
        graph1 = Graph(name="dup", inputs=(a_n,), outputs=(b_n,),
                       nodes=(a_n, b_n), vectors=(vec1,))
        # graph2 has the same label but different structure and distinct auto-minted id
        vec2 = GraphVector(
            name="b→c", source=b_n, target=c_n,
            evaluators=(Evaluator("e2", F_P, "check"),),
            operators=(Operator("agent", F_P, "agent://claude/genesis"),),
        )
        graph2 = Graph(name="dup", inputs=(b_n,), outputs=(c_n,),
                       nodes=(b_n, c_n), vectors=(vec2,))

        assert graph1.id != graph2.id, "auto-minted ids must differ"

        eval_fp = Evaluator("e", F_P, "check")
        def _inner():
            mid = Node(name="mid")
            v1 = GraphVector(name="a→mid", source=a_n, target=mid, evaluators=(eval_fp,))
            v2 = GraphVector(name="mid→b", source=mid, target=b_n, evaluators=(eval_fp,))
            return Graph(name="dup", inputs=(a_n,), outputs=(b_n,),
                         nodes=(a_n, mid, b_n), vectors=(v1, v2))

        gf = GraphFunction(name="refine", inputs=(a_n,), outputs=(b_n,),
                           template=_inner)
        module = Module(name="dup_test", graphs=(graph1, graph2),
                        graph_functions=(gf,), metadata={"requirements": []})

        stream = _ws(tmp_path, "REQ-DUP")
        scope = Scope(module=module, workspace_root=tmp_path)

        result = gen_start(scope, stream)
        assert result["status"] == "selected"

        # graph1 was replaced (refined), graph2 is untouched
        updated_module = scope.module
        assert len(updated_module.graphs) == 2
        # The substituted graph has a new id (transform → new identity)
        g1_updated = updated_module.graphs[0]
        g2_unchanged = updated_module.graphs[1]
        assert g1_updated.id != graph1.id, "substituted graph gets new id"
        assert g2_unchanged.id == graph2.id, "graph2 must be untouched"
        # graph2's vectors are intact
        assert len(g2_unchanged.vectors) == 1
        assert g2_unchanged.vectors[0].name == "b→c"

    def test_external_selection_input_accepted(self, tmp_path):
        """
        REQ-R-ABG2-SELECTION-APPLICATION-002: accept externally supplied selection.

        Proves apply_selection() accepts a caller-constructed SelectionDecision
        with arbitrary selected_by/selection_mode — not just the auto path.
        """
        from genesis.interpret import apply_selection
        from genesis.selection import SelectionDecision

        design_n = Node(name="design")
        review_n = Node(name="review")
        code_n = Node(name="code")

        outer_vec = GraphVector(
            name="design→code", source=design_n, target=code_n,
            evaluators=(Evaluator("code_complete", F_P, "check"),),
        )
        outer_graph = Graph(
            name="ext", inputs=(design_n,), outputs=(code_n,),
            nodes=(design_n, code_n), vectors=(outer_vec,),
        )

        eval_fp = Evaluator("review_done", F_P, "check")
        def _via_review():
            v1 = GraphVector(name="design→review", source=design_n, target=review_n,
                             evaluators=(eval_fp,))
            v2 = GraphVector(name="review→code", source=review_n, target=code_n,
                             evaluators=(eval_fp,))
            return Graph(
                name="ext", inputs=(design_n,), outputs=(code_n,),
                nodes=(design_n, review_n, code_n), vectors=(v1, v2),
            )

        gf = GraphFunction(
            name="via_review", inputs=(design_n,), outputs=(code_n,),
            template=_via_review,
        )

        module = Module(
            name="ext", graphs=(outer_graph,), graph_functions=(gf,),
            metadata={"requirements": []},
        )

        # Externally supplied decision — not auto-selected by the engine
        decision = SelectionDecision(
            contract_id=outer_vec.id,
            work_key="EXT-001",
            graph_function="via_review",
            selected_by="business_rule",
            selection_mode="external",
            rationale="Compliance requires review step",
        )

        result = apply_selection(module, outer_vec.id, decision, gf)

        # Substitution applied
        assert "design→code" not in {v.name for v in result.substituted_graph.vectors}
        assert "design→review" in {v.name for v in result.substituted_graph.vectors}
        assert "review→code" in {v.name for v in result.substituted_graph.vectors}

        # Provenance carries the external actor and mode
        sel_event = result.events[0]
        assert sel_event["data"]["selected_by"] == "business_rule"
        assert sel_event["data"]["selection_mode"] == "external"
        assert sel_event["data"]["rationale"] == "Compliance requires review step"
        assert sel_event["data"]["work_key"] == "EXT-001"


# ── Scenario 9: Parent Decomposes and Folds Back ───────────────────────────

class TestScenario9FoldBack:
    """Parent work only converges when all children converge."""

    def test_parent_unconverged_while_child_pending(self, tmp_path):
        module = _make_single_edge_module()
        job = _job_from_module(module)

        stream = _ws(tmp_path)

        # Spawn children from parent
        stream.append("work_spawned", {
            "parent_key": "REQ-F-AUTH",
            "child_key": "REQ-F-AUTH/login",
            "graph_function": "auth_decomp",
        })
        stream.append("work_spawned", {
            "parent_key": "REQ-F-AUTH",
            "child_key": "REQ-F-AUTH/signup",
            "graph_function": "auth_decomp",
        })

        # Converge login child
        stream.append("assessed", {
            "edge": "design→code", "kind": "fp", "result": "pass", "evaluator": "code_complete",
            "work_key": "REQ-F-AUTH/login",
        })

        # Parent still unconverged — signup child still pending
        d_parent = delta(job, stream, tmp_path, work_key="REQ-F-AUTH")
        assert d_parent > 0

        # Converge signup child
        stream.append("assessed", {
            "edge": "design→code", "kind": "fp", "result": "pass", "evaluator": "code_complete",
            "work_key": "REQ-F-AUTH/signup",
        })

        # Now parent converges
        d_parent = delta(job, stream, tmp_path, work_key="REQ-F-AUTH")
        assert d_parent == 0.0

        # Child lineage visible via work_spawned events
        spawned = [e for e in stream.all_events() if e["event_type"] == "work_spawned"]
        assert len(spawned) == 2


# ── Scenario 10: In-Flight Run Retried or Superseded ───────────────────────

class TestScenario10RunGovernance:
    """Execution attempts are governed: stale/failed runs don't corrupt convergence."""

    def test_timeout_then_new_run_proceeds(self, tmp_path):
        # Run 1 dispatched
        events = [
            {"event_type": "run_started", "data": {
                "run_id": "r1", "edge": "design→code",
                "work_key": "REQ-F-AUTH",
            }},
            {"event_type": "fp_dispatched", "data": {
                "run_id": "r1", "edge": "design→code",
                "work_key": "REQ-F-AUTH",
            }},
        ]

        # r1 is in-flight — blocks new dispatch
        pending = find_pending_run(events, "design→code", work_key="REQ-F-AUTH")
        assert pending is not None
        assert pending.run_id == "r1"

        # r1 times out
        events.append({"event_type": "run_timed_out", "data": {
            "run_id": "r1",
        }})

        # r1 no longer blocks
        rs = run_state(events, "r1")
        assert rs.state == "timed_out"
        pending = find_pending_run(events, "design→code", work_key="REQ-F-AUTH")
        assert pending is None  # unblocked

        # New run r2 proceeds
        events.append({"event_type": "run_started", "data": {
            "run_id": "r2", "edge": "design→code",
            "work_key": "REQ-F-AUTH", "attempt_number": 2,
        }})
        events.append({"event_type": "fp_dispatched", "data": {
            "run_id": "r2", "edge": "design→code",
            "work_key": "REQ-F-AUTH",
        }})

        rs2 = run_state(events, "r2")
        assert rs2.state == "dispatched"
        assert rs2.attempt_number == 2

    def test_supersession_records_but_does_not_apply_stale_result(self, tmp_path):
        events = [
            {"event_type": "run_started", "data": {
                "run_id": "r1", "edge": "design→code",
            }},
            {"event_type": "fp_dispatched", "data": {
                "run_id": "r1", "edge": "design→code",
            }},
        ]

        # Supersede r1 with r2
        sup_event = supersede_run("r1", "r2", "design→code")
        events.append(sup_event)

        rs = run_state(events, "r1")
        assert rs.state == "superseded"
        assert rs.superseded_by == "r2"

        # r1 is no longer blocking
        pending = find_pending_run(events, "design→code")
        assert pending is None

    def test_attempt_identity_preserved_across_retries(self, tmp_path):
        """Both attempts are visible in the event stream with distinct run_ids."""
        events = [
            {"event_type": "run_started", "data": {
                "run_id": "r1", "edge": "design→code", "attempt_number": 1,
            }},
            {"event_type": "run_failed", "data": {
                "run_id": "r1", "failure_class": "transport_failure",
            }},
            {"event_type": "run_started", "data": {
                "run_id": "r2", "edge": "design→code", "attempt_number": 2,
            }},
            {"event_type": "assessed", "data": {
                "run_id": "r2", "edge": "design→code",
            }},
        ]

        r1 = run_state(events, "r1")
        r2 = run_state(events, "r2")
        assert r1.state == "failed"
        assert r1.failure_class == "transport_failure"
        assert r2.state == "assessed"
        assert r2.attempt_number == 2
        # Both runs visible — history preserved
        run_ids = {e["data"].get("run_id") for e in events if e["data"].get("run_id")}
        assert run_ids == {"r1", "r2"}
