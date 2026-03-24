# Validates: REQ-F-CORE-001
# Validates: REQ-F-CORE-002
# Validates: REQ-F-CORE-003
# Validates: REQ-F-CORE-005
# Validates: REQ-F-EC-001
# Validates: REQ-F-EVAL-005
"""Tests for genesis.core — emit, project, EventStream, ContextResolver, workspace_bootstrap."""
import pytest

from genesis.core import (
    EventStream,
    ContextResolver,
    emit,
    project,
    workspace_bootstrap,
)
from gtl.core import Context


# ── EventStream ───────────────────────────────────────────────────────────────

class TestEventStream:
    def test_corrupted_line_raises(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.write_text('{"valid": true}\nNOT JSON\n')
        stream = EventStream(f)
        with pytest.raises(ValueError, match="Corrupted event log"):
            stream.all_events()

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


# ── project ───────────────────────────────────────────────────────────────────

class TestProject:
    def test_project_deterministic(self, tmp_path):
        f = tmp_path / "events.jsonl"
        f.touch()
        stream = EventStream(f)
        stream.append("edge_started", {"feature": "CODE-001", "edge": "design→code"})
        s1 = project(stream, "code", "CODE-001")
        s2 = project(stream, "code", "CODE-001")
        assert s1 == s2


# ── ContextResolver ───────────────────────────────────────────────────────────

class TestContextResolver:
    def _pending_ctx(self, name: str, locator: str) -> Context:
        return Context(name=name, locator=locator, digest="sha256:" + "0" * 64)

    def test_load_missing_raises(self, tmp_path):
        resolver = ContextResolver(tmp_path)
        ctx = self._pending_ctx("x", "workspace://does/not/exist")
        with pytest.raises(FileNotFoundError, match="Required context not found"):
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
    def test_idempotent(self, tmp_path):
        workspace_bootstrap(tmp_path)
        workspace_bootstrap(tmp_path)  # second call must not raise

    def test_stream_is_writable(self, tmp_path):
        stream = workspace_bootstrap(tmp_path)
        emit("test", {"ok": True})
        events = stream.all_events()
        assert any(e["event_type"] == "test" for e in events)


# ── REQ-F-EVAL-005: emit() validates assessed/fp spec_hash ───────────────────

class TestEmitAssessedValidation:
    """REQ-F-EVAL-005: emit() enforces spec_hash on assessed(kind=fp) at the write primitive."""

    def test_assessed_fp_without_spec_hash_raises(self, tmp_path):
        """emit() must reject assessed(kind=fp) events missing spec_hash."""
        workspace_bootstrap(tmp_path)
        with pytest.raises(ValueError, match="spec_hash"):
            emit("assessed", {
                "kind": "fp",
                "edge": "design→code",
                "evaluator": "code_complete",
                "result": "pass",
            })

    def test_assessed_fp_with_spec_hash_succeeds(self, tmp_path):
        """emit() accepts assessed(kind=fp) events that carry spec_hash."""
        stream = workspace_bootstrap(tmp_path)
        emit("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": "abc123",
        })
        events = stream.all_events()
        assert any(e["event_type"] == "assessed" for e in events)


class TestEmitPrimeValidation:
    """H2: emit() validates that approved and revoked events carry 'kind'."""

    def test_approved_without_kind_raises(self, tmp_path):
        workspace_bootstrap(tmp_path)
        with pytest.raises(ValueError, match="kind"):
            emit("approved", {"edge": "design→code", "actor": "human"})

    def test_revoked_without_kind_raises(self, tmp_path):
        workspace_bootstrap(tmp_path)
        with pytest.raises(ValueError, match="kind"):
            emit("revoked", {"edge": "design→code", "actor": "human", "reason": "retracted"})
