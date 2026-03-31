# Validates: REQ-R-ABG2-EVENTS
# Validates: REQ-R-ABG2-INTERPRET
"""
Sandbox install tests for the V2 runtime.

These tests validate the real bootstrap surface used by the retained suite:
`gen-install.py`, the installed `.genesis` runtime, and `workspace_bootstrap()`.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from genesis.events import EventStream, emit
from genesis.install import workspace_bootstrap
from sandbox_runtime import install_real_sandbox, run_installed_genesis


@pytest.mark.integration
class TestV2SandboxInstall:
    @pytest.mark.usecase_id("sandbox_install")
    def test_real_install_copies_complete_engine_runtime(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)

        source_root = Path(__file__).resolve().parents[2] / "code" / "genesis"
        installed_root = workspace / ".genesis" / "genesis"
        source_modules = {path.name for path in source_root.glob("*.py")}
        installed_modules = {path.name for path in installed_root.glob("*.py")}

        assert installed_modules == source_modules
        run_archive.update_summary(installed_module_count=len(installed_modules))

    @pytest.mark.usecase_id("sandbox_install")
    def test_installed_runtime_can_execute_emit_event_from_workspace(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)

        emitted = run_installed_genesis(
            workspace,
            "emit-event",
            "--type",
            "approved",
            "--data",
            json.dumps({"kind": "fh_review", "edge": "design→code", "actor": "tester"}),
            archive=run_archive,
            label="installed genesis emit-event",
        )

        assert emitted.returncode == 0, emitted.stderr
        payload = json.loads(emitted.stdout)
        assert payload["status"] == "ok"
        assert payload["event_type"] == "approved"

        events_path = workspace / ".ai-workspace" / "events" / "events.jsonl"
        events = [
            json.loads(line)
            for line in events_path.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        assert events[-1]["event_type"] == "approved"
        assert events[-1]["data"]["kind"] == "fh_review"
        run_archive.update_summary(installed_runtime_event_count=len(events))

    @pytest.mark.usecase_id("sandbox_install")
    def test_workspace_bootstrap_creates_runtime_directories(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)
        run_archive.note("scenario", lane="install", operation="workspace_bootstrap")

        assert isinstance(stream, EventStream)
        assert (workspace / ".ai-workspace" / "events" / "events.jsonl").is_file()
        assert (workspace / ".ai-workspace" / "features" / "active").is_dir()
        assert (workspace / ".ai-workspace" / "features" / "completed").is_dir()
        assert (workspace / ".ai-workspace" / "context").is_dir()
        assert (workspace / ".ai-workspace" / "reviews" / "pending").is_dir()
        assert (workspace / ".ai-workspace" / "comments" / "claude").is_dir()
        assert any(event["event_type"] == "genesis_installed" for event in stream.all_events())
        run_archive.update_summary(operation="workspace_bootstrap", event_stream_bound=True)

    @pytest.mark.usecase_id("sandbox_install")
    def test_workspace_bootstrap_is_idempotent(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream1 = workspace_bootstrap(workspace)
        stream2 = workspace_bootstrap(workspace)

        assert stream1.path == stream2.path
        events = stream2.all_events()
        assert len(events) == 1
        assert events[0]["event_type"] == "genesis_installed"
        run_archive.update_summary(operation="workspace_bootstrap_idempotent", event_count=0)

    @pytest.mark.usecase_id("sandbox_install")
    def test_emit_writes_through_bound_stream(self, run_archive):
        workspace = run_archive.workspace
        install_real_sandbox(workspace, archive=run_archive)
        stream = workspace_bootstrap(workspace)

        emit("approved", {"kind": "fh_review", "edge": "design→code", "actor": "tester"})

        events = stream.all_events()
        assert len(events) == 2
        assert events[0]["event_type"] == "genesis_installed"
        assert events[1]["event_type"] == "approved"
        assert events[1]["data"]["kind"] == "fh_review"
        assert events[1]["data"]["edge"] == "design→code"
        run_archive.update_summary(operation="emit", total_events=len(events))
