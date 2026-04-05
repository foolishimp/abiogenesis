# Implements: REQ-F-CORE-001
# Implements: REQ-F-CORE-002
# Implements: REQ-F-CORE-003
# Implements: REQ-F-EVAL-005
# Implements: REQ-F-WKSP-001
"""Substrate primitives for the Codex abiogenesis build."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from gtl.core import Context


class EventStream:
    """Append-only event stream backed by workspace JSONL."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self.workflow_version = "unknown"

    @classmethod
    def open(cls, workspace: Path) -> "EventStream":
        return cls(workspace / ".ai-workspace" / "events" / "events.jsonl")

    def append(self, event_type: str, data: dict) -> dict:
        _validate_prime_event(event_type, data)
        payload = dict(data)
        if self.workflow_version != "unknown":
            payload.setdefault("workflow_version", self.workflow_version)
        record = {
            "event_time": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type,
            "data": payload,
        }
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record) + "\n")
        return record

    def all_events(self) -> list[dict]:
        if not self.path.exists():
            return []
        records: list[dict] = []
        with self.path.open(encoding="utf-8") as handle:
            for lineno, line in enumerate(handle, 1):
                stripped = line.strip()
                if not stripped:
                    continue
                try:
                    records.append(json.loads(stripped))
                except json.JSONDecodeError as exc:
                    raise ValueError(
                        f"Corrupted event log at {self.path}:{lineno}: {exc}"
                    ) from exc
        return records

    def replay(self, asset_type: str, instance_id: str) -> dict:
        return project(self, asset_type, instance_id)


_stream: EventStream | None = None


def init_stream(stream: EventStream) -> None:
    global _stream
    _stream = stream


def emit(event_type: str, data: dict) -> None:
    if _stream is None:
        raise RuntimeError("emit() requires workspace_bootstrap() or init_stream() first")
    _stream.append(event_type, data)


def project(stream: EventStream, asset_type: str, instance_id: str) -> dict:
    """Derive current asset state from the event stream."""

    state: dict[str, Any] = {
        "asset_type": asset_type,
        "instance_id": instance_id,
        "status": "not_started",
        "edges_converged": [],
        "event_count": 0,
    }
    for event in stream.all_events():
        data = event.get("data", {})
        event_type = event.get("event_type", "")
        relevant = (
            data.get("instance_id") == instance_id
            or data.get("feature") == instance_id
            or (
                instance_id == "current"
                and asset_type in (data.get("target"), data.get("asset_type"))
            )
            or (
                instance_id == "current"
                and event_type == "vector_started"
                and data.get("target") == asset_type
            )
        )
        if not relevant:
            continue
        state["event_count"] += 1
        if event_type == "project_initialized":
            state["initialized"] = True
        elif event_type == "vector_started" and state["status"] == "not_started":
            state["status"] = "in_progress"
        elif event_type == "edge_converged":
            edge = data.get("edge")
            if edge and edge not in state["edges_converged"]:
                state["edges_converged"].append(edge)
            if data.get("target") == asset_type:
                state["status"] = "converged"
    return state


class ContextResolver:
    """Load context documents and verify digests."""

    def __init__(self, workspace_root: Path) -> None:
        self.workspace_root = workspace_root

    def load(self, ctx: Context) -> str:
        scheme = ctx.locator.split("://", 1)[0]
        loader = {
            "workspace": self._load_workspace,
            "git": self._load_unimplemented,
            "event": self._load_unimplemented,
            "registry": self._load_unimplemented,
        }.get(scheme)
        if loader is None:
            raise ValueError(f"Unknown context scheme: {ctx.locator}")
        content = loader(ctx.locator)
        self._verify_digest(ctx, content)
        return content

    def _load_workspace(self, locator: str) -> str:
        rel = locator[len("workspace://") :]
        path = self.workspace_root / rel
        if path.is_dir():
            parts: list[str] = []
            for pattern in ("*.md", "*.py", "*.txt", "*.yml"):
                for child in sorted(path.rglob(pattern)):
                    parts.append(f"# {child.relative_to(self.workspace_root)}")
                    parts.append(child.read_text(encoding="utf-8"))
                    parts.append("")
            if not parts:
                return f"[directory {path} exists but contains no readable files]"
            return "\n".join(parts).rstrip()
        if path.is_file():
            return path.read_text(encoding="utf-8")
        raise FileNotFoundError(f"Context path not found: {path}")

    def _load_unimplemented(self, locator: str) -> str:
        raise NotImplementedError(f"Context scheme not implemented in V1: {locator}")

    def _verify_digest(self, ctx: Context, content: str) -> None:
        if ctx.digest == "sha256:" + ("0" * 64):
            return
        actual = "sha256:" + hashlib.sha256(content.encode("utf-8")).hexdigest()
        if actual != ctx.digest:
            raise ValueError(
                f"Digest mismatch for {ctx.name}: expected {ctx.digest}, got {actual}"
            )


def workspace_bootstrap(workspace: Path) -> EventStream:
    """Prepare the workspace event stream and core folders."""

    for rel in [
        ".ai-workspace/events",
        ".ai-workspace/features/active",
        ".ai-workspace/features/completed",
        ".ai-workspace/fp_manifests",
        ".ai-workspace/fp_results",
        ".ai-workspace/reviews/proxy-log",
    ]:
        (workspace / rel).mkdir(parents=True, exist_ok=True)
    stream = EventStream.open(workspace)
    stream.path.touch(exist_ok=True)
    init_stream(stream)
    return stream


def _validate_prime_event(event_type: str, data: dict) -> None:
    if event_type == "assessed" and data.get("kind") == "fp":
        for field in ("edge", "evaluator", "result", "spec_hash"):
            if field not in data:
                raise ValueError(f"assessed{{kind: fp}} requires '{field}'")
        if data["result"] not in {"pass", "fail"}:
            raise ValueError("assessed{kind: fp} result must be 'pass' or 'fail'")
    if event_type == "approved" and "kind" not in data:
        raise ValueError("approved requires 'kind'")
    if event_type == "revoked" and "kind" not in data:
        raise ValueError("revoked requires 'kind'")
