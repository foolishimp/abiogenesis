# Validates: REQ-F-CORE-001
# Validates: REQ-F-GATE-001
# Validates: REQ-F-GATE-002
# Validates: REQ-F-WK-004
# Validates: REQ-F-PROV-004
# Validates: REQ-F-CORRECT-001
# Validates: REQ-F-FRAG-003
# Validates: REQ-F-FRAG-004
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

from gtl.core import (
    Asset, Context, Edge, Evaluator, Fragment, Job, Operator, Package,
    Rule, Worker,
    F_D, F_P, F_H, consensus,
)

from genesis.core import EventStream, workspace_bootstrap
from genesis.bind import req_hash
from genesis.commands import Scope, gen_gaps, gen_iterate
from genesis.schedule import (
    delta, find_pending_run, run_state, supersede_run,
)


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


def _scope(tmp_path, pkg, worker, **kw):
    return Scope(package=pkg, workspace_root=tmp_path, worker=worker, **kw)


def _spec_hash(pkg):
    """Compute the spec_hash gen_gaps uses for unknown workflow_version."""
    return req_hash(pkg.requirements)


# ── Scenario 1: Single-Edge Happy Path ──────────────────────────────────────

class TestScenario1SingleEdgeHappyPath:
    """Take one coarse edge from unmet to converged through the normal ABG loop."""

    def test_single_edge_converges_after_assessed(self, tmp_path):
        src = Asset(name="design", id_format="DES-{SEQ}")
        tgt = Asset(name="code", id_format="CODE-{SEQ}")
        op = Operator("agent", F_P, "agent://claude/genesis")
        edge = Edge(name="design→code", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[Evaluator("code_complete", F_P, "check")])
        pkg = Package(name="s1", assets=[src, tgt], edges=[edge], operators=[op])
        worker = Worker(id="w", can_execute=[job])

        stream = _ws(tmp_path)
        scope = _scope(tmp_path, pkg, worker)

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
            "spec_hash": _spec_hash(pkg),
        })

        # Step 3: gen_gaps confirms convergence
        gap_result = gen_gaps(scope, stream)
        assert gap_result["converged"] is True
        certs = [e for e in stream.all_events() if e["event_type"] == "edge_converged"]
        assert len(certs) == 1
        assert certs[0]["data"]["edge"] == "design→code"

        # Step 4: delta is zero
        d = delta(job, stream, tmp_path)
        assert d == 0.0


# ── Scenario 2: Deterministic Gap Blocks False Progress ─────────────────────

class TestScenario2FdGapBlocks:
    """Deterministic failures block progress when no F_P remediation exists."""

    def test_fd_only_edge_blocks_with_fd_gap(self, tmp_path):
        src = Asset(name="source", id_format="SRC-{SEQ}")
        tgt = Asset(name="output", id_format="OUT-{SEQ}", lineage=[src])
        op = Operator("checker", F_D, "exec://false")
        edge = Edge(name="source→output", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[
            Evaluator("always_fail", F_D, "sentinel must exist",
                      command="python -c 'import sys; sys.exit(1)'"),
        ])
        pkg = Package(name="s2", assets=[src, tgt], edges=[edge], operators=[op])
        worker = Worker(id="w", can_execute=[job])

        stream = _ws(tmp_path)
        scope = _scope(tmp_path, pkg, worker)
        result = gen_iterate(scope, stream)

        events = stream.all_events()
        types = [e["event_type"] for e in events]
        found_events = [e for e in events if e["event_type"] == "found"]
        assert any(e["data"]["kind"] == "fd_gap" for e in found_events)
        assert "fp_dispatched" not in types
        assert "edge_converged" not in types

        d = delta(job, stream, tmp_path)
        assert d > 0


# ── Scenario 3: Deterministic Findings Escalate to Construction ─────────────

class TestScenario3FdEscalation:
    """F_D findings become the construction surface when F_P path exists."""

    def test_fd_findings_escalate_to_fp(self, tmp_path):
        src = Asset(name="design", id_format="DES-{SEQ}")
        tgt = Asset(name="code", id_format="CODE-{SEQ}", lineage=[src])
        op_fd = Operator("checker", F_D, "exec://false")
        op_fp = Operator("agent", F_P, "agent://claude/genesis")
        edge = Edge(name="design→code", source=src, target=tgt, using=[op_fd, op_fp])
        job = Job(edge=edge, evaluators=[
            Evaluator("impl_tags", F_D, "tags must exist",
                      command="python -c 'import sys; sys.exit(1)'"),
            Evaluator("code_complete", F_P, "agent check"),
        ])
        pkg = Package(name="s3", assets=[src, tgt], edges=[edge],
                      operators=[op_fd, op_fp])
        worker = Worker(id="w", can_execute=[job])

        stream = _ws(tmp_path)
        scope = _scope(tmp_path, pkg, worker)
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
        src = Asset(name="draft", id_format="DRAFT-{SEQ}")
        tgt = Asset(name="approved_doc", id_format="APR-{SEQ}", lineage=[src])
        op = Operator("human", F_H, "fh://single")
        edge = Edge(name="draft→approved_doc", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[
            Evaluator("sign_off", F_H, "Human approval"),
        ])
        pkg = Package(name="s4", assets=[src, tgt], edges=[edge], operators=[op])
        worker = Worker(id="reviewer", can_execute=[job])

        stream = _ws(tmp_path)
        scope = _scope(tmp_path, pkg, worker)

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
        d = delta(job, stream, tmp_path)
        assert d == 0.0


# ── Scenario 5: Two Work Lines Converge Independently ───────────────────────

class TestScenario5IndependentWorkLines:
    """Multiple work lines on the same topology remain independent."""

    def test_auth_converges_billing_remains_open(self, tmp_path):
        src = Asset(name="design", id_format="DES-{SEQ}")
        tgt = Asset(name="code", id_format="CODE-{SEQ}")
        op = Operator("agent", F_P, "agent://claude/genesis")
        edge = Edge(name="design→code", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[Evaluator("code_complete", F_P, "check")])
        pkg = Package(name="s5", assets=[src, tgt], edges=[edge], operators=[op])
        worker = Worker(id="w", can_execute=[job])

        stream = _ws(tmp_path, "REQ-F-AUTH")
        # Also create BILLING feature
        features_dir = tmp_path / ".ai-workspace" / "features" / "active"
        (features_dir / "REQ-F-BILLING.yml").write_text(
            "feature: REQ-F-BILLING\nsatisfies: [REQ-F-BILLING]\n"
        )

        # Iterate AUTH
        scope_auth = _scope(tmp_path, pkg, worker, feature="REQ-F-AUTH")
        result = gen_iterate(scope_auth, stream)
        auth_run_id = result["run_id"]

        # Simulate AUTH assessed
        stream.append("assessed", {
            "edge": "design→code", "run_id": auth_run_id,
            "work_key": "REQ-F-AUTH", "kind": "fp", "result": "pass",
            "evaluator": "code_complete", "spec_hash": _spec_hash(pkg),
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
        d_billing = delta(job, stream, tmp_path, work_key="REQ-F-BILLING")
        assert d_billing > 0

        # AUTH certificate does NOT satisfy BILLING
        d_auth = delta(job, stream, tmp_path, work_key="REQ-F-AUTH")
        assert d_auth == 0.0


# ── Scenario 6: Workflow Upgrade Preserves Lineage ──────────────────────────

class TestScenario6WorkflowUpgrade:
    """Workflow upgrades preserve history without silently accepting stale truth."""

    def test_spec_hash_change_invalidates_prior_fp(self, tmp_path):
        src = Asset(name="design", id_format="DES-{SEQ}")
        tgt = Asset(name="code", id_format="CODE-{SEQ}")
        op = Operator("agent", F_P, "agent://claude/genesis")
        edge = Edge(name="design→code", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[Evaluator("code_complete", F_P, "check")])
        pkg = Package(name="s6", assets=[src, tgt], edges=[edge], operators=[op])
        worker = Worker(id="w", can_execute=[job])

        stream = _ws(tmp_path)

        # Assess under spec_hash_v1
        stream.append("assessed", {
            "edge": "design→code", "kind": "fp", "result": "pass", "evaluator": "code_complete",
            "spec_hash": "hash_v1",
        })

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
        src = Asset(name="design", id_format="DES-{SEQ}")
        tgt = Asset(name="code", id_format="CODE-{SEQ}")
        op = Operator("agent", F_P, "agent://claude/genesis")
        edge = Edge(name="design→code", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[Evaluator("code_complete", F_P, "check")])
        pkg = Package(name="s7", assets=[src, tgt], edges=[edge], operators=[op])
        worker = Worker(id="w", can_execute=[job])

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
        src = Asset(name="design", id_format="DES-{SEQ}")
        tgt = Asset(name="code", id_format="CODE-{SEQ}")
        op = Operator("agent", F_P, "agent://claude/genesis")
        edge = Edge(name="design→code", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[Evaluator("code_complete", F_P, "check")])
        pkg = Package(name="s7b", assets=[src, tgt], edges=[edge], operators=[op])

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


# ── Scenario 8: Coarse Edge Refined by Zoom ─────────────────────────────────

class TestScenario8Zoom:
    """A coarse edge is refined into a richer subgraph via zoom."""

    def test_zoom_decomposes_edge_and_records_provenance(self, tmp_path):
        design = Asset(name="design", id_format="DES-{SEQ}")
        mod = Asset(name="module_decomp", id_format="MOD-{SEQ}")
        code = Asset(name="code", id_format="CODE-{SEQ}")
        op = Operator("agent", F_P, "agent://claude/genesis")
        outer_edge = Edge(name="design→code", source=design, target=code, using=[op])
        job = Job(edge=outer_edge, evaluators=[
            Evaluator("code_complete", F_P, "check"),
        ])

        int_e1 = Edge(name="design→module_decomp", source=design, target=mod, using=[op])
        int_e2 = Edge(name="module_decomp→code", source=mod, target=code, using=[op])
        frag = Fragment(
            name="via_module_decomp",
            inputs=(design,),
            outputs=(code,),
            assets=(mod,),
            edges=(int_e1, int_e2),
        )

        pkg = Package(name="s8", assets=[design, code], edges=[outer_edge],
                      operators=[op], fragments=[frag])
        worker = Worker(id="w", can_execute=[job])

        stream = _ws(tmp_path, "REQ-F-COMPLEX")
        scope = _scope(tmp_path, pkg, worker)

        result = gen_iterate(scope, stream)

        # Zoom happened
        assert result["status"] == "zoomed"
        assert result["fragment"] == "via_module_decomp"

        # Provenance recorded
        zoomed = [e for e in stream.all_events() if e["event_type"] == "zoomed"]
        assert len(zoomed) == 1
        assert zoomed[0]["data"]["fragment"] == "via_module_decomp"

        # Children spawned
        spawned = [e for e in stream.all_events() if e["event_type"] == "work_spawned"]
        assert len(spawned) == 2
        child_keys = {e["data"]["child_key"] for e in spawned}
        assert all("REQ-F-COMPLEX/" in ck for ck in child_keys)


# ── Scenario 9: Parent Decomposes and Folds Back ───────────────────────────

class TestScenario9FoldBack:
    """Parent work only converges when all children converge."""

    def test_parent_unconverged_while_child_pending(self, tmp_path):
        src = Asset(name="design", id_format="DES-{SEQ}")
        tgt = Asset(name="code", id_format="CODE-{SEQ}")
        op = Operator("agent", F_P, "agent://claude/genesis")
        edge = Edge(name="design→code", source=src, target=tgt, using=[op])
        job = Job(edge=edge, evaluators=[Evaluator("code_complete", F_P, "check")])
        pkg = Package(name="s9", assets=[src, tgt], edges=[edge], operators=[op])

        stream = _ws(tmp_path)

        # Spawn children from parent
        stream.append("work_spawned", {
            "parent_key": "REQ-F-AUTH",
            "child_key": "REQ-F-AUTH/login",
            "fragment": "auth_decomp",
        })
        stream.append("work_spawned", {
            "parent_key": "REQ-F-AUTH",
            "child_key": "REQ-F-AUTH/signup",
            "fragment": "auth_decomp",
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
