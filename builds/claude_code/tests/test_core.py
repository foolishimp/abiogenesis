# Validates: REQ-F-CORE-001
# Validates: REQ-F-CORE-002
# Validates: REQ-F-CORE-003
# Validates: REQ-F-CORE-005
"""Tests for genesis.core — emit, project, EventStream, ContextResolver, workspace_bootstrap."""
import json
import pytest
import tempfile
from pathlib import Path

from genesis.core import (
    EventStream,
    ContextResolver,
    emit,
    init_stream,
    project,
    workspace_bootstrap,
)
from gtl.core import Context


# ── EventStream ───────────────────────────────────────────────────────────────

class TestEventStream:
    def test_append_assigns_event_time(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.touch()
        stream = EventStream(f)
        record = stream.append("test_event", {"key": "val"})
        assert "event_time" in record
        assert record["event_type"] == "test_event"
        assert record["data"] == {"key": "val"}

    def test_append_is_written_to_file(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.touch()
        stream = EventStream(f)
        stream.append("event_a", {})
        stream.append("event_b", {})
        lines = [l for l in f.read_text().splitlines() if l.strip()]
        assert len(lines) == 2

    def test_all_events_empty_file(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.touch()
        stream = EventStream(f)
        assert stream.all_events() == []

    def test_all_events_returns_written(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.touch()
        stream = EventStream(f)
        stream.append("e1", {"x": 1})
        stream.append("e2", {"x": 2})
        events = stream.all_events()
        assert len(events) == 2
        assert events[0]["event_type"] == "e1"
        assert events[1]["data"]["x"] == 2

    def test_corrupted_line_raises(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.write_text('{"valid": true}\nNOT JSON\n')
        stream = EventStream(f)
        with pytest.raises(ValueError, match="Corrupted event log"):
            stream.all_events()

    def test_missing_file_returns_empty(self, tmp_path):
        stream = EventStream(tmp_path / "nonexistent.jsonl")
        assert stream.all_events() == []

    def test_event_time_not_overridable(self, tmp_path):
        """Callers cannot inject event_time — it is system-assigned."""
        f = tmp_path / "events.jsonl"
        f.touch()
        stream = EventStream(f)
        stream.append("evt", {"event_time": "INJECTED"})
        events = stream.all_events()
        # The injected value is in data, not at the top-level event_time
        assert events[0]["data"].get("event_time") == "INJECTED"
        # Top-level event_time is system-assigned (not "INJECTED")
        assert events[0]["event_time"] != "INJECTED"


# ── emit ──────────────────────────────────────────────────────────────────────

class TestEmit:
    def test_emit_requires_bootstrap(self):
        """emit() before workspace_bootstrap raises RuntimeError."""
        import genesis.core as core_mod
        original = core_mod._stream
        core_mod._stream = None
        try:
            with pytest.raises(RuntimeError, match="workspace_bootstrap"):
                emit("test", {})
        finally:
            core_mod._stream = original

    def test_emit_writes_to_stream(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.touch()
        stream = EventStream(f)
        init_stream(stream)
        emit("test_event", {"v": 42})
        events = stream.all_events()
        assert len(events) == 1
        assert events[0]["event_type"] == "test_event"
        assert events[0]["data"]["v"] == 42


# ── project ───────────────────────────────────────────────────────────────────

class TestProject:
    def test_project_empty_stream(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.touch()
        stream = EventStream(f)
        state = project(stream, "code", "CODE-001")
        assert state["status"] == "not_started"
        assert state["asset_type"] == "code"

    def test_project_deterministic(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.touch()
        stream = EventStream(f)
        stream.append("edge_started", {"feature": "CODE-001", "edge": "design→code"})
        s1 = project(stream, "code", "CODE-001")
        s2 = project(stream, "code", "CODE-001")
        assert s1 == s2

    def test_project_edge_started_sets_in_progress(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.touch()
        stream = EventStream(f)
        stream.append("edge_started", {"feature": "FEAT-001", "edge": "design→code"})
        state = project(stream, "code", "FEAT-001")
        assert state["status"] == "in_progress"

    def test_project_edge_converged_recorded(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.touch()
        stream = EventStream(f)
        stream.append("edge_converged", {
            "feature": "FEAT-001",
            "edge": "design→code",
            "target": "code",
        })
        state = project(stream, "code", "FEAT-001")
        assert "design→code" in state["edges_converged"]
        assert state["status"] == "converged"


# ── ContextResolver ───────────────────────────────────────────────────────────

class TestContextResolver:
    def _pending_ctx(self, name: str, locator: str) -> Context:
        return Context(name=name, locator=locator, digest="sha256:" + "0" * 64)

    def test_load_file(self, tmp_path):
        (tmp_path / "spec").mkdir()
        (tmp_path / "spec" / "doc.md").write_text("hello")
        resolver = ContextResolver(tmp_path)
        ctx = self._pending_ctx("doc", "workspace://spec/doc.md")
        assert resolver.load(ctx) == "hello"

    def test_load_directory(self, tmp_path):
        (tmp_path / "adrs").mkdir()
        (tmp_path / "adrs" / "ADR-001.md").write_text("# ADR")
        resolver = ContextResolver(tmp_path)
        ctx = self._pending_ctx("adrs", "workspace://adrs")
        content = resolver.load(ctx)
        assert "ADR" in content

    def test_load_missing_returns_note(self, tmp_path):
        resolver = ContextResolver(tmp_path)
        ctx = self._pending_ctx("x", "workspace://does/not/exist")
        content = resolver.load(ctx)
        assert "not found" in content

    def test_unknown_scheme_raises(self, tmp_path):
        resolver = ContextResolver(tmp_path)
        ctx = Context(name="x", locator="git://example.com/repo", digest="sha256:" + "0" * 64)
        with pytest.raises(NotImplementedError):
            resolver.load(ctx)

    def test_digest_mismatch_raises(self, tmp_path):
        (tmp_path / "f.md").write_text("content")
        resolver = ContextResolver(tmp_path)
        ctx = Context(
            name="x",
            locator="workspace://f.md",
            digest="sha256:" + "a" * 64,  # wrong digest
        )
        with pytest.raises(ValueError, match="digest mismatch"):
            resolver.load(ctx)

    def test_pending_digest_skips_verification(self, tmp_path):
        (tmp_path / "f.md").write_text("anything")
        resolver = ContextResolver(tmp_path)
        ctx = self._pending_ctx("x", "workspace://f.md")
        result = resolver.load(ctx)
        assert result == "anything"


# ── workspace_bootstrap ───────────────────────────────────────────────────────

class TestWorkspaceBootstrap:
    def test_creates_directories(self, tmp_path):
        stream = workspace_bootstrap(tmp_path)
        assert (tmp_path / ".ai-workspace" / "events").is_dir()
        assert (tmp_path / ".ai-workspace" / "features" / "active").is_dir()
        assert (tmp_path / ".ai-workspace" / "comments" / "claude").is_dir()

    def test_creates_events_file(self, tmp_path):
        stream = workspace_bootstrap(tmp_path)
        assert (tmp_path / ".ai-workspace" / "events" / "events.jsonl").is_file()

    def test_idempotent(self, tmp_path):
        workspace_bootstrap(tmp_path)
        workspace_bootstrap(tmp_path)  # second call must not raise

    def test_returns_event_stream(self, tmp_path):
        stream = workspace_bootstrap(tmp_path)
        assert isinstance(stream, EventStream)

    def test_stream_is_writable(self, tmp_path):
        stream = workspace_bootstrap(tmp_path)
        emit("test", {"ok": True})
        events = stream.all_events()
        assert any(e["event_type"] == "test" for e in events)
