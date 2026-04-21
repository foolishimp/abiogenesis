# Implements: REQ-R-ABG3-LINEAGE
"""
lineage — Work identity and parent/child lineage.

WorkInstance, spawn, _discover_children, active_work_keys.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from genesis.binding import ExecutableJob

from .events import EventStream


@dataclass(frozen=True)
class WorkInstance:
    """
    The scheduler's dispatch unit: an (executable_job, work_key) pair with attempt identity.

    Scheduler creates work instances from `(job, work_key)` pairs.
    """
    executable_job: ExecutableJob
    work_key: str | None = None
    run_id: str = field(default_factory=lambda: str(uuid.uuid4()))


def spawn(parent_key: str, segment: str) -> str:
    """
    Create child work_key by appending a segment to the parent key.

    Example: spawn("INT-001/REQ-042", "module.auth") → "INT-001/REQ-042/module.auth"
    """
    return f"{parent_key}/{segment}"


def _discover_children(events: list[dict], work_key: str) -> set[str]:
    """Discover child work_keys from work_spawned events in the stream."""
    children: set[str] = set()
    for e in events:
        if (e.get("event_type") == "work_spawned"
                and e.get("data", {}).get("parent_key") == work_key):
            child_key = e["data"].get("child_key")
            if child_key:
                children.add(child_key)
    return children


def _work_key_lineage_matches(feature_key: str, candidate: str | None) -> bool:
    if candidate is None:
        return False
    return (
        feature_key == candidate
        or feature_key.startswith(candidate + "/")
        or candidate.startswith(feature_key + "/")
    )


# Public alias for external callers
discover_children = _discover_children


def completed_feature_keys(events: list[dict]) -> set[str]:
    completed: set[str] = set()
    for event in events:
        etype = event.get("event_type")
        data = event.get("data", {})
        if etype == "reset":
            reset_scope = data.get("scope")
            if reset_scope == "workspace":
                completed = set()
                continue
            reset_work_key = data.get("work_key")
            if reset_scope in {"work_key", "edge"}:
                completed = {
                    key
                    for key in completed
                    if not _work_key_lineage_matches(key, reset_work_key)
                }
            continue
        if etype != "feature_completed":
            continue
        work_key = data.get("work_key")
        if isinstance(work_key, str) and work_key:
            completed.add(work_key)
    return completed


def active_work_keys(workspace: Path, stream: Optional[EventStream] = None) -> list[str]:
    """
    Enumerate work_keys from active feature vectors and spawned children.

    Sources:
    1. Active feature YAMLs — work_key == feature_id
    2. work_spawned events in stream — ADR-025: child work_keys from spawn()
    """
    keys: set[str] = set()

    features_dir = workspace / ".ai-workspace" / "features" / "active"
    if features_dir.exists():
        keys.update(f.stem for f in features_dir.glob("*.yml"))

    if stream is not None:
        all_events = stream.all_events()
        completed = completed_feature_keys(all_events)
        for e in all_events:
            event_work_key = e.get("data", {}).get("work_key")
            if event_work_key:
                keys.add(event_work_key)
            if e.get("event_type") == "work_spawned":
                child_key = e.get("data", {}).get("child_key")
                if child_key:
                    keys.add(child_key)
        if completed:
            keys = {
                key for key in keys
                if not any(key == done or key.startswith(done + "/") for done in completed)
            }

    return sorted(keys)
