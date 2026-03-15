# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
"""Tests for genesis.commands — Scope, gen_gaps, gen_iterate, gen_start."""
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock

from gtl.core import (
    Asset, Context, Edge, Evaluator, Job, Operator, Package,
    Rule, Worker,
    F_D, F_P, F_H, consensus,
)

from genesis.core import EventStream, workspace_bootstrap, init_stream
from genesis.commands import Scope, gen_gaps, gen_iterate, gen_start, _scoped_jobs, _known_feature_ids


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_package_and_worker():
    """Minimal Package + Worker for testing commands."""
    intent = Asset(name="intent", id_format="INT-{SEQ}")
    code = Asset(name="code", id_format="CODE-{SEQ}")
    op = Operator("claude_agent", F_P, "agent://claude/genesis")
    edge = Edge(name="intent→code", source=intent, target=code, using=[op])
    job = Job(edge=edge, evaluators=[Evaluator("code_complete", F_P, "LLM check")])
    rule = Rule("gate", approve=consensus(1, 1))
    ctx = Context(name="bootloader", locator="workspace://spec/GENESIS_BOOTLOADER.md",
                  digest="sha256:" + "0" * 64)
    pkg = Package(
        name="test_package",
        assets=[intent, code],
        edges=[edge],
        operators=[op],
        rules=[rule],
        contexts=[ctx],
    )
    worker = Worker(id="claude_code", can_execute=[job])
    return pkg, worker, job


def _make_scope(tmp_path: Path, pkg, edge: str = None, feature: str = None) -> Scope:
    return Scope(
        package=pkg,
        workspace_root=tmp_path,
        feature=feature,
        edge=edge,
    )


def _make_stream(tmp_path: Path) -> EventStream:
    ws = workspace_bootstrap(tmp_path)
    return ws


# ── Scope ─────────────────────────────────────────────────────────────────────

class TestScope:
    def test_scope_fields(self, tmp_path):
        pkg, _, _ = _make_package_and_worker()
        scope = Scope(package=pkg, workspace_root=tmp_path)
        assert scope.build == "claude_code"
        assert scope.feature is None
        assert scope.edge is None

    def test_edge_override(self, tmp_path):
        pkg, _, _ = _make_package_and_worker()
        scope = Scope(package=pkg, workspace_root=tmp_path, edge="design→code")
        assert scope.edge == "design→code"


# ── _scoped_jobs ──────────────────────────────────────────────────────────────

class TestScopedJobs:
    def test_no_filter_returns_all(self, tmp_path):
        pkg, worker, job = _make_package_and_worker()
        scope = _make_scope(tmp_path, pkg)
        jobs = _scoped_jobs(scope, worker)
        assert job in jobs

    def test_edge_filter(self, tmp_path):
        pkg, worker, job = _make_package_and_worker()
        scope = _make_scope(tmp_path, pkg, edge="intent→code")
        jobs = _scoped_jobs(scope, worker)
        assert len(jobs) == 1
        assert jobs[0].edge.name == "intent→code"

    def test_non_matching_edge_returns_empty(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        scope = _make_scope(tmp_path, pkg, edge="nonexistent→edge")
        jobs = _scoped_jobs(scope, worker)
        assert jobs == []

    def test_unknown_feature_fails_closed(self, tmp_path):
        """G4: unknown scope.feature returns empty — fails closed."""
        pkg, worker, _ = _make_package_and_worker()
        scope = _make_scope(tmp_path, pkg, feature="REQ-F-UNKNOWN")
        jobs = _scoped_jobs(scope, worker)
        assert jobs == []

    def test_known_feature_returns_jobs(self, tmp_path):
        """G4: known feature ID (present in features YAML dir) returns all jobs."""
        pkg, worker, job = _make_package_and_worker()
        # Create a feature YAML so the feature is "known"
        features_dir = tmp_path / ".ai-workspace" / "features" / "active"
        features_dir.mkdir(parents=True)
        (features_dir / "REQ-F-CORE.yml").write_text("feature: REQ-F-CORE\n")
        scope = _make_scope(tmp_path, pkg, feature="REQ-F-CORE")
        jobs = _scoped_jobs(scope, worker)
        assert job in jobs

    def test_known_feature_ids_reads_active_and_completed(self, tmp_path):
        """_known_feature_ids reads both active/ and completed/ subdirs."""
        active = tmp_path / ".ai-workspace" / "features" / "active"
        completed = tmp_path / ".ai-workspace" / "features" / "completed"
        active.mkdir(parents=True)
        completed.mkdir(parents=True)
        (active / "REQ-F-CORE.yml").write_text("")
        (completed / "REQ-F-BIND.yml").write_text("")
        ids = _known_feature_ids(tmp_path)
        assert "REQ-F-CORE" in ids
        assert "REQ-F-BIND" in ids


# ── gen_gaps ──────────────────────────────────────────────────────────────────

class TestGenGaps:
    def test_returns_gap_report(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg)

        with patch("genesis.commands._resolve_worker", return_value=worker):
            result = gen_gaps(scope, stream)

        assert "gaps" in result
        assert "total_delta" in result
        assert result["jobs_considered"] >= 1

    def test_empty_scope_returns_error(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, edge="no→match")

        with patch("genesis.commands._resolve_worker", return_value=worker):
            result = gen_gaps(scope, stream)

        assert result["status"] == "error"

    def test_converged_field(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg)

        with patch("genesis.commands._resolve_worker", return_value=worker):
            result = gen_gaps(scope, stream)

        # F_P evaluators make it non-converged
        assert result["converged"] is False


# ── gen_iterate ───────────────────────────────────────────────────────────────

class TestGenIterate:
    def test_returns_iterated_status(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg)

        with patch("genesis.commands._resolve_worker", return_value=worker):
            result = gen_iterate(scope, stream)

        assert result["status"] == "iterated"

    def test_nothing_to_do_when_no_jobs(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, edge="no→match")

        with patch("genesis.commands._resolve_worker", return_value=worker):
            result = gen_iterate(scope, stream)

        assert result["status"] == "nothing_to_do"

    def test_edge_started_emitted(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg)

        with patch("genesis.commands._resolve_worker", return_value=worker):
            gen_iterate(scope, stream)

        events = stream.all_events()
        assert any(e["event_type"] == "edge_started" for e in events)

    def test_on_fp_dispatch_called(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg)
        dispatched = []

        with patch("genesis.commands._resolve_worker", return_value=worker):
            gen_iterate(scope, stream, on_fp_dispatch=lambda b: dispatched.append(b))

        assert len(dispatched) == 1


# ── gen_start ─────────────────────────────────────────────────────────────────

class TestGenStart:
    def test_returns_iterated_when_work_pending(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg)

        with patch("genesis.commands._resolve_worker", return_value=worker):
            result = gen_start(scope, stream)

        assert result["status"] == "iterated"

    def test_returns_nothing_to_do_when_no_jobs(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg, edge="no→match")

        with patch("genesis.commands._resolve_worker", return_value=worker):
            result = gen_start(scope, stream)

        assert result["status"] == "nothing_to_do"

    def test_auto_flag_recorded(self, tmp_path):
        pkg, worker, _ = _make_package_and_worker()
        stream = _make_stream(tmp_path)
        scope = _make_scope(tmp_path, pkg)

        with patch("genesis.commands._resolve_worker", return_value=worker):
            result = gen_start(scope, stream, auto=True)

        assert result.get("auto") is True
