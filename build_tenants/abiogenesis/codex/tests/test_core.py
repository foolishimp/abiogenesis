# Validates: REQ-F-CORE-001
# Validates: REQ-F-CORE-002
# Validates: REQ-F-WKSP-001
from __future__ import annotations

import pytest
from gtl.core import Context

from genesis import core


def test_workspace_bootstrap_creates_stream_path(tmp_path):
    stream = core.workspace_bootstrap(tmp_path)
    assert stream.path.exists()
    assert (tmp_path / ".ai-workspace" / "fp_manifests").is_dir()


def test_emit_requires_initialised_stream(monkeypatch):
    monkeypatch.setattr(core, "_stream", None)
    with pytest.raises(RuntimeError):
        core.emit("found", {"kind": "fd_gap"})


def test_project_current_observes_vector_started(tmp_path):
    stream = core.workspace_bootstrap(tmp_path)
    stream.append("vector_started", {"edge": "design→code", "target": "code"})
    state = core.project(stream, "code", "current")
    assert state["status"] == "in_progress"


def test_context_resolver_missing_workspace_path_is_fatal(tmp_path):
    resolver = core.ContextResolver(tmp_path)
    ctx = Context(
        name="missing",
        locator="workspace://does/not/exist.md",
        digest="sha256:" + ("0" * 64),
    )
    with pytest.raises(FileNotFoundError):
        resolver.load(ctx)
