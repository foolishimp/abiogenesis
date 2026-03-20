# Implements: REQ-F-TEST-001
# Validates: REQ-F-TEST-001
# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
# Validates: REQ-F-GATE-002
# Validates: REQ-F-EVAL-004
# Validates: REQ-F-BIND-001
# Validates: REQ-F-CORE-001
# Validates: REQ-F-CMD-004
# Validates: REQ-F-VIS-001
"""
Integration workflow tests — REQ-F-TEST-001.

Primary test surface for the abiogenesis engine. Each test exercises the
F_D → F_P → F_H evaluator chain end-to-end against a real workspace, using
real F_D subprocess evaluator commands (check-tags). Tests act as F_P and F_H
actors where the protocol requires external input.

These tests validate the seams that unit tests cannot:
  - bind_fd + gen_iterate
  - gen_iterate + gen_start --auto
  - event emission + projection + convergence
  - F_D gate blocking F_P dispatch (REQ-F-GATE-002)
  - spec_hash staleness detection (REQ-F-EVAL-004)
  - feature lifecycle (REQ-F-VIS-001)

Reference: ADR-015-integration-primary-test-architecture.md
"""
from __future__ import annotations

from pathlib import Path

import pytest

from gtl.core import (
    Asset, Context, Edge, Evaluator, Job, Operator, Package, Rule, Worker,
    F_D, F_P, F_H, consensus,
    OPERATIVE_ON_APPROVED,
)

from genesis.bind import req_hash
from genesis.core import workspace_bootstrap, project
from genesis.commands import Scope, gen_gaps, gen_iterate, gen_start


# ── Package fixture ────────────────────────────────────────────────────────────

def _make_full_chain_package(workspace_root: Path) -> tuple[Package, Worker]:
    """
    Package with F_D + F_P + F_H evaluators for full lifecycle testing.

    Edge: design→code
      F_D  impl_tags      — check-tags on code/ (real subprocess, checks real files)
      F_P  code_complete  — test acts as F_P actor (writes assessed)
      F_H  design_approved — test acts as F_H actor (emits approved)

    GATE-002 invariant: F_P not dispatched while F_D failing;
                        F_H not gated while F_D or F_P failing.
    """
    design = Asset(name="design", id_format="DES-{SEQ}")
    code = Asset(name="code", id_format="CODE-{SEQ}", lineage=[design])

    ctx = Context(
        name="spec",
        locator="workspace://spec.md",
        digest="sha256:" + "0" * 64,  # PENDING
    )

    eval_fd = Evaluator(
        "impl_tags", F_D,
        "All files in code/ must carry # Implements: REQ-INT-001 tag",
        command="python -m genesis check-tags --type implements --path code/",
    )
    eval_fp = Evaluator("code_complete", F_P, "Code implements the integration spec")
    eval_fh = Evaluator(
        "design_approved", F_H,
        "Human confirms: code is correct and complete before proceeding",
    )

    op_agent  = Operator("claude_agent", F_P, "agent://claude/genesis")
    op_check  = Operator("check_tags",   F_D, "exec://python -m genesis check-tags --type implements --path code/")
    op_human  = Operator("human_gate",   F_H, "fh://single")
    rule      = Rule("gate", approve=consensus(1, 1))

    edge = Edge(
        name="design→code",
        source=design,
        target=code,
        using=[op_agent, op_check, op_human],
        rule=rule,
        context=[ctx],
    )
    job = Job(edge=edge, evaluators=[eval_fd, eval_fp, eval_fh])
    pkg = Package(
        name="integration_test",
        assets=[design, code],
        edges=[edge],
        operators=[op_agent, op_check, op_human],
        rules=[rule],
        contexts=[ctx],
        requirements=["REQ-INT-001"],
    )
    worker = Worker(id="claude_code", can_execute=[job])
    return pkg, worker


def _make_fd_fp_package(workspace_root: Path) -> tuple[Package, Worker]:
    """Package with only F_D + F_P (no F_H) — used for gap and dispatch tests."""
    design = Asset(name="design", id_format="DES-{SEQ}")
    code = Asset(name="code", id_format="CODE-{SEQ}", lineage=[design])
    ctx = Context(name="spec", locator="workspace://spec.md", digest="sha256:" + "0" * 64)

    eval_fd = Evaluator(
        "impl_tags", F_D,
        "Files in code/ must carry # Implements: tag",
        command="python -m genesis check-tags --type implements --path code/",
    )
    eval_fp = Evaluator("code_complete", F_P, "Code implements spec")

    op_agent  = Operator("claude_agent", F_P, "agent://claude/genesis")
    op_check  = Operator("check_tags",   F_D, "exec://python -m genesis check-tags --type implements --path code/")
    rule      = Rule("gate", approve=consensus(1, 1))

    edge = Edge(
        name="design→code",
        source=design, target=code,
        using=[op_agent, op_check],
        rule=rule,
        context=[ctx],
    )
    job = Job(edge=edge, evaluators=[eval_fd, eval_fp])
    pkg = Package(
        name="fd_fp_test",
        assets=[design, code],
        edges=[edge],
        operators=[op_agent, op_check],
        rules=[rule],
        contexts=[ctx],
        requirements=["REQ-INT-002"],
    )
    worker = Worker(id="claude_code", can_execute=[job])
    return pkg, worker


def _make_scope(tmp_path: Path, pkg: Package, worker: Worker) -> Scope:
    return Scope(package=pkg, workspace_root=tmp_path, worker=worker)


# ── Workflow tests ─────────────────────────────────────────────────────────────

class TestFullFdFpFhChain:
    """Scenario 1: cold start → full F_D → F_P → F_H chain → converged."""

    def test_fd_fails_initially_no_fp_dispatch(self, tmp_path):
        """F_P must not be dispatched when F_D (impl_tags) is failing — REQ-F-GATE-002."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_full_chain_package(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker)

        # No code/ directory → F_D fails
        result = gen_iterate(scope, stream)

        events = stream.all_events()
        event_types = {e["event_type"] for e in events}
        assert "fp_dispatched" not in event_types, (
            "F_P must not be dispatched while F_D is failing (REQ-F-GATE-002)"
        )
        assert "found" in event_types

    def test_fp_dispatched_after_fd_passes(self, tmp_path):
        """F_P dispatched once F_D (impl_tags) passes — all three evaluators in failing list."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_full_chain_package(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker)

        # Create code/impl.py with Implements tag so F_D passes
        (tmp_path / "code").mkdir()
        (tmp_path / "code" / "impl.py").write_text(
            "# Implements: REQ-INT-001\ndef main(): pass\n"
        )

        result = gen_iterate(scope, stream)

        assert "fp_manifest_path" in result, "F_P manifest must be written when F_D passes"
        events = stream.all_events()
        assert any(e["event_type"] == "fp_dispatched" for e in events)

    def test_fh_gate_emitted_after_fp_passes(self, tmp_path):
        """F_H gate emitted once F_D + F_P both pass."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_full_chain_package(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker)
        spec_hash = req_hash(pkg.requirements)

        # F_D: create code
        (tmp_path / "code").mkdir()
        (tmp_path / "code" / "impl.py").write_text(
            "# Implements: REQ-INT-001\ndef main(): pass\n"
        )
        # F_P: act as actor
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": spec_hash,
        })

        result = gen_iterate(scope, stream)

        assert "fh_gate" in result, "F_H gate must be surfaced after F_D + F_P pass"
        events = stream.all_events()
        assert any(e["event_type"] == "fh_gate_pending" for e in events)

    def test_converged_after_full_chain(self, tmp_path):
        """Full F_D → F_P → F_H chain: cold start to delta=0."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_full_chain_package(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker)
        spec_hash = req_hash(pkg.requirements)

        # Verify gap exists
        initial = gen_gaps(scope, stream)
        assert initial["converged"] is False

        # Step 1: create code (fixes F_D)
        (tmp_path / "code").mkdir()
        (tmp_path / "code" / "impl.py").write_text(
            "# Implements: REQ-INT-001\ndef main(): pass\n"
        )

        # Step 2: act as F_P
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": spec_hash,
        })

        # Step 3: act as F_H
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "test_human",
        })

        # All evaluators pass → converged
        final = gen_gaps(scope, stream)
        assert final["converged"] is True
        assert final["total_delta"] == 0


class TestAutoLoopStopsCorrectly:
    """Scenario 2+3: gen_start(auto=True) stops at the right boundary conditions."""

    def test_auto_loop_stops_on_fd_gap_mixed_evaluators(self, tmp_path):
        """
        gen_start(auto=True) stops with stopped_by='fd_gap' when both F_D and F_P
        are failing. This is the C1 regression scenario: the auto-loop must detect
        fd_gap via the found event, not by exhausting MAX_AUTO iterations.
        """
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_fd_fp_package(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker)

        # No code/ → F_D fails; F_P has no assessment → also failing
        result = gen_start(scope, stream, auto=True)

        assert result.get("stopped_by") == "fd_gap", (
            f"Expected stopped_by='fd_gap', got {result.get('stopped_by')!r}. "
            "C1 regression: auto-loop must emit found event and stop, not hit max_iterations."
        )
        events = stream.all_events()
        assert any(e["event_type"] == "found" for e in events), (
            "found event must be in event stream when auto-loop stops on fd_gap"
        )

    def test_auto_loop_stops_on_fp_dispatch(self, tmp_path):
        """gen_start(auto=True) stops on fp_dispatch when F_D passes but F_P pending."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_fd_fp_package(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker)

        # Create code with tag so F_D passes
        (tmp_path / "code").mkdir()
        (tmp_path / "code" / "impl.py").write_text(
            "# Implements: REQ-INT-002\ndef main(): pass\n"
        )

        result = gen_start(scope, stream, auto=True)

        assert result.get("stopped_by") == "fp_dispatch"
        assert "fp_manifest_path" in result

    def test_auto_loop_converges_when_all_pass(self, tmp_path):
        """gen_start(auto=True) returns converged when all evaluators pass."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_fd_fp_package(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker)
        spec_hash = req_hash(pkg.requirements)

        (tmp_path / "code").mkdir()
        (tmp_path / "code" / "impl.py").write_text(
            "# Implements: REQ-INT-002\ndef main(): pass\n"
        )
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": spec_hash,
        })

        result = gen_start(scope, stream, auto=True)

        assert result["status"] == "converged"


class TestSpecHashStaleness:
    """Scenario 4: spec change invalidates F_P assessment — REQ-F-EVAL-004."""

    def test_stale_fp_assessed_does_not_converge(self, tmp_path):
        """
        An assessed event emitted with a different spec_hash does not satisfy
        bind_fd() — the edge remains unconverged even with code present.
        """
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_fd_fp_package(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker)

        # Create code (F_D passes)
        (tmp_path / "code").mkdir()
        (tmp_path / "code" / "impl.py").write_text(
            "# Implements: REQ-INT-002\ndef main(): pass\n"
        )

        # Emit assessed with WRONG spec_hash (simulates stale assessment)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": "stale_hash_00000000",
        })

        result = gen_gaps(scope, stream)

        assert result["converged"] is False, (
            "Stale spec_hash must not satisfy bind_fd() — edge must remain unconverged"
        )
        failing = [f for g in result["gaps"] for f in g["failing"]]
        assert "code_complete" in failing

    def test_correct_spec_hash_converges(self, tmp_path):
        """Correct spec_hash on assessed event satisfies bind_fd() — edge converges."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_fd_fp_package(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker)
        spec_hash = req_hash(pkg.requirements)

        (tmp_path / "code").mkdir()
        (tmp_path / "code" / "impl.py").write_text(
            "# Implements: REQ-INT-002\ndef main(): pass\n"
        )
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": spec_hash,
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is True


class TestFeatureLifecycle:
    """Scenario 5: full convergence moves features from active/ to completed/ — REQ-F-VIS-001."""

    def test_convergence_closes_active_feature(self, tmp_path):
        """gen_start closes active features when all edges reach delta=0."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_fd_fp_package(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker)
        spec_hash = req_hash(pkg.requirements)

        # Create a feature vector in active/
        active_dir = tmp_path / ".ai-workspace" / "features" / "active"
        active_dir.mkdir(parents=True, exist_ok=True)
        feature_yml = active_dir / "REQ-INT.yml"
        feature_yml.write_text("id: REQ-INT\nstatus: active\nsatisfies:\n  - REQ-INT-002\n")

        # Converge the workspace
        (tmp_path / "code").mkdir()
        (tmp_path / "code" / "impl.py").write_text(
            "# Implements: REQ-INT-002\ndef main(): pass\n"
        )
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": spec_hash,
        })

        # gen_start detects convergence and closes features
        result = gen_start(scope, stream)

        assert result["status"] == "converged"
        completed_dir = tmp_path / ".ai-workspace" / "features" / "completed"
        assert (completed_dir / "REQ-INT.yml").exists(), (
            "Converged feature must be moved from active/ to completed/"
        )
        assert not feature_yml.exists(), "Feature YAML must be removed from active/"
        completed_text = (completed_dir / "REQ-INT.yml").read_text()
        assert "status: completed" in completed_text


class TestEdgeConvergedCertificates:
    """Scenario 6: edge_converged certificates — REQ-F-CMD-004."""

    def test_edge_converged_includes_feature(self, tmp_path):
        """edge_converged event includes feature field — REQ-F-CMD-004."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_fd_fp_package(tmp_path)
        spec_hash = req_hash(pkg.requirements)

        # Create feature YAML so _scoped_jobs validates the feature ID
        feature_id = "REQ-INT-002"
        active_dir = tmp_path / ".ai-workspace" / "features" / "active"
        active_dir.mkdir(parents=True, exist_ok=True)
        (active_dir / f"{feature_id}.yml").write_text(
            f"id: {feature_id}\nstatus: active\nsatisfies:\n  - {feature_id}\n"
        )

        # Converge: create code (F_D) and emit assessed (F_P)
        (tmp_path / "code").mkdir()
        (tmp_path / "code" / "impl.py").write_text(
            "# Implements: REQ-INT-002\ndef main(): pass\n"
        )
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": spec_hash,
        })

        scope = _make_scope(tmp_path, pkg, worker, feature=feature_id)
        gen_gaps(scope, stream)

        certs = [
            e for e in stream.all_events()
            if e["event_type"] == "edge_converged"
        ]
        assert len(certs) == 1, f"Expected 1 edge_converged, got {len(certs)}"
        assert certs[0]["data"]["feature"] == feature_id, (
            "edge_converged must include feature field for feature-scoped projections (REQ-F-CMD-004)"
        )

    def test_gen_gaps_does_not_duplicate_certificates(self, tmp_path):
        """Running gen_gaps twice on a converged workspace emits no duplicate certificates."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker = _make_fd_fp_package(tmp_path)
        scope = _make_scope(tmp_path, pkg, worker)
        spec_hash = req_hash(pkg.requirements)

        (tmp_path / "code").mkdir()
        (tmp_path / "code" / "impl.py").write_text(
            "# Implements: REQ-INT-002\ndef main(): pass\n"
        )
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": spec_hash,
        })

        gen_gaps(scope, stream)
        gen_gaps(scope, stream)  # second call on converged workspace

        certs = [
            e for e in stream.all_events()
            if e["event_type"] == "edge_converged"
        ]
        assert len(certs) == 1, (
            f"gen_gaps idempotence violation: {len(certs)} edge_converged events, expected 1"
        )


def _make_scope(tmp_path: Path, pkg: Package, worker: Worker,
                feature: str | None = None) -> Scope:
    return Scope(package=pkg, workspace_root=tmp_path, worker=worker, feature=feature)
