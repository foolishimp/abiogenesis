# Validates: REQ-F-VIS-001
"""Tests for feature lifecycle — gen_start moves active vectors to completed/ on convergence."""
from pathlib import Path
import pytest


def _make_feature_yml(directory: Path, name: str, status: str = "not_started") -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    f = directory / f"{name}.yml"
    f.write_text(f"feature: {name}\nsatisfies:\n  - REQ-F-FOO-001\nstatus: {status}\n")
    return f


class TestCloseCompletedFeatures:
    def _make_scope(self, workspace_root: Path):
        from unittest.mock import MagicMock
        from genesis.commands import Scope
        pkg = MagicMock()
        pkg.name = "test"
        pkg.requirements = ["REQ-F-FOO-001"]
        worker = MagicMock()
        return Scope(package=pkg, workspace_root=workspace_root, worker=worker)

    def test_moves_active_to_completed(self, tmp_path):
        from genesis.commands import _close_completed_features
        active = tmp_path / ".ai-workspace" / "features" / "active"
        _make_feature_yml(active, "REQ-F-FOO")
        scope = self._make_scope(tmp_path)
        _close_completed_features(scope)
        assert not (active / "REQ-F-FOO.yml").exists()
        assert (tmp_path / ".ai-workspace" / "features" / "completed" / "REQ-F-FOO.yml").exists()

    def test_status_updated_to_completed(self, tmp_path):
        from genesis.commands import _close_completed_features
        active = tmp_path / ".ai-workspace" / "features" / "active"
        _make_feature_yml(active, "REQ-F-FOO", status="not_started")
        scope = self._make_scope(tmp_path)
        _close_completed_features(scope)
        text = (tmp_path / ".ai-workspace" / "features" / "completed" / "REQ-F-FOO.yml").read_text()
        assert "status: completed" in text
        assert "status: not_started" not in text

    def test_active_status_updated(self, tmp_path):
        from genesis.commands import _close_completed_features
        active = tmp_path / ".ai-workspace" / "features" / "active"
        _make_feature_yml(active, "REQ-F-BAR", status="active")
        scope = self._make_scope(tmp_path)
        _close_completed_features(scope)
        text = (tmp_path / ".ai-workspace" / "features" / "completed" / "REQ-F-BAR.yml").read_text()
        assert "status: completed" in text

    def test_no_active_dir_is_noop(self, tmp_path):
        from genesis.commands import _close_completed_features
        scope = self._make_scope(tmp_path)
        _close_completed_features(scope)  # must not raise

    def test_multiple_features_all_moved(self, tmp_path):
        from genesis.commands import _close_completed_features
        active = tmp_path / ".ai-workspace" / "features" / "active"
        for name in ("REQ-F-A", "REQ-F-B", "REQ-F-C"):
            _make_feature_yml(active, name)
        scope = self._make_scope(tmp_path)
        _close_completed_features(scope)
        completed = tmp_path / ".ai-workspace" / "features" / "completed"
        assert len(list(active.glob("*.yml"))) == 0
        assert len(list(completed.glob("*.yml"))) == 3
