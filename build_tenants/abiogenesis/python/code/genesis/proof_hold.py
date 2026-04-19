# Implements: REQ-P-POLICY
# Implements: REQ-P-POLICY-005
# Implements: REQ-P-POLICY-006
# Implements: REQ-P-POLICY-007
# Implements: REQ-P-POLICY-008
"""
proof_hold — Replay-derived proof-hold policy and projection.
"""
from __future__ import annotations

from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any

from .correction import find_latest_reset
from .events import EventStream


DEFAULT_PROOF_HOLD_FAILURE_THRESHOLD = 3


def _event_value(event: Mapping[str, Any], key: str) -> Any:
    value = event.get(key)
    if value is not None:
        return value
    data = event.get("data")
    if isinstance(data, Mapping):
        return data.get(key)
    return None


def resolve_proof_hold_policy(runtime_config: Mapping[str, Any] | None = None) -> dict[str, Any]:
    """
    Resolve product-layer proof-hold policy into one consumed surface.

    Runtime configuration may specialize the product defaults, but callers only
    consume the resolved policy returned here.
    """

    resolved = {
        "enabled": True,
        "failure_threshold": DEFAULT_PROOF_HOLD_FAILURE_THRESHOLD,
        "source": "product_default",
    }
    if runtime_config is None:
        return resolved
    policy = runtime_config.get("proof_hold_policy")
    if policy is None:
        return resolved
    if not isinstance(policy, Mapping):
        raise ValueError("runtime_config.proof_hold_policy must be a mapping")

    enabled = policy.get("enabled", resolved["enabled"])
    if not isinstance(enabled, bool):
        raise ValueError("runtime_config.proof_hold_policy.enabled must be a boolean")

    failure_threshold = policy.get("failure_threshold", resolved["failure_threshold"])
    if not isinstance(failure_threshold, int) or failure_threshold < 1:
        raise ValueError("runtime_config.proof_hold_policy.failure_threshold must be an integer >= 1")

    resolved.update(
        {
            "enabled": enabled,
            "failure_threshold": failure_threshold,
            "source": "runtime_config.proof_hold_policy",
        }
    )
    return resolved


def _normalize_identity(
    edge: str | None,
    work_key: str | None,
    spec_hash: str | None,
    workflow_version: str | None,
) -> tuple[str, str | None, str, str] | None:
    resolved_edge = edge
    resolved_work_key = work_key
    resolved_spec_hash = spec_hash
    resolved_workflow_version = workflow_version
    if not isinstance(resolved_edge, str) or not resolved_edge:
        return None
    if not isinstance(resolved_spec_hash, str) or not resolved_spec_hash:
        return None
    if not isinstance(resolved_workflow_version, str) or not resolved_workflow_version:
        return None
    return (
        resolved_edge,
        resolved_work_key if isinstance(resolved_work_key, str) and resolved_work_key else None,
        resolved_spec_hash,
        resolved_workflow_version,
    )


def _proof_identity_from_event(
    event: Mapping[str, Any],
) -> tuple[str, str | None, str, str] | None:
    return _normalize_identity(
        _event_value(event, "edge"),
        _event_value(event, "work_key"),
        _event_value(event, "spec_hash"),
        _event_value(event, "workflow_version"),
    )


def _event_ref(event: Mapping[str, Any], *, kind: str) -> dict[str, Any]:
    return {
        "kind": kind,
        "event_id": event.get("event_id"),
        "event_time": event.get("event_time"),
    }


def project_proof_holds(
    workspace: Path,
    identities: Sequence[Mapping[str, Any]],
    *,
    runtime_config: Mapping[str, Any] | None = None,
    all_events: list[dict[str, Any]] | None = None,
) -> dict[tuple[str, str | None, str, str], dict[str, Any]]:
    """
    Project proof-hold truth for the supplied current identities.

    Each identity must resolve to edge/work_key/spec_hash/workflow_version.
    """
    policy = resolve_proof_hold_policy(runtime_config)
    events = all_events if all_events is not None else EventStream.open(workspace).all_events()

    normalized_keys: list[tuple[str, str | None, str, str]] = []
    results: dict[tuple[str, str | None, str, str], dict[str, Any]] = {}
    for identity in identities:
        key = _normalize_identity(
            identity.get("edge") if isinstance(identity, Mapping) else None,
            identity.get("work_key") if isinstance(identity, Mapping) else None,
            identity.get("spec_hash") if isinstance(identity, Mapping) else None,
            identity.get("workflow_version") if isinstance(identity, Mapping) else None,
        )
        if key is None:
            continue
        normalized_keys.append(key)
        results[key] = {
            "held": False,
            "failure_count": 0,
            "failure_threshold": policy["failure_threshold"],
            "enabled": policy["enabled"],
            "policy_source": policy["source"],
            "identity": {
                "edge": key[0],
                "work_key": key[1],
                "spec_hash": key[2],
                "workflow_version": key[3],
            },
            "last_failure": None,
            "last_clear": None,
        }

    if not normalized_keys:
        return {}

    reset_boundaries: dict[tuple[str, str | None, str, str], str] = {}
    for key in normalized_keys:
        reset = find_latest_reset(events, edge=key[0], work_key=key[1])
        if reset is not None:
            reset_boundaries[key] = str(reset.get("event_time") or "")
            results[key]["last_clear"] = _event_ref(reset, kind="reset")
        else:
            reset_boundaries[key] = ""

    if not policy["enabled"]:
        return results

    tracked_keys = set(normalized_keys)
    for event in events:
        event_type = event.get("event_type")
        if event_type not in {"proof_failed", "proof_passed"}:
            continue
        key = _proof_identity_from_event(event)
        if key not in tracked_keys:
            continue
        event_time = str(event.get("event_time") or "")
        if reset_boundaries.get(key) and event_time <= reset_boundaries[key]:
            continue
        if event_type == "proof_passed":
            results[key]["failure_count"] = 0
            results[key]["last_clear"] = _event_ref(event, kind="proof_passed")
            continue
        results[key]["failure_count"] += 1
        results[key]["last_failure"] = {
            **_event_ref(event, kind="proof_failed"),
            "policy_reason": _event_value(event, "policy_reason"),
        }

    for key in tracked_keys:
        results[key]["held"] = results[key]["failure_count"] >= results[key]["failure_threshold"]
    return results


def project_proof_hold(
    workspace: Path,
    *,
    edge: str | None,
    work_key: str | None,
    spec_hash: str | None,
    workflow_version: str | None,
    runtime_config: Mapping[str, Any] | None = None,
    all_events: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    holds = project_proof_holds(
        workspace,
        (
            {
                "edge": edge,
                "work_key": work_key,
                "spec_hash": spec_hash,
                "workflow_version": workflow_version,
            },
        ),
        runtime_config=runtime_config,
        all_events=all_events,
    )
    key = _normalize_identity(
        edge,
        work_key,
        spec_hash,
        workflow_version,
    )
    if key is None:
        policy = resolve_proof_hold_policy(runtime_config)
        return {
            "held": False,
            "failure_count": 0,
            "failure_threshold": policy["failure_threshold"],
            "enabled": policy["enabled"],
            "policy_source": policy["source"],
            "identity": {
                "edge": edge,
                "work_key": work_key,
                "spec_hash": spec_hash,
                "workflow_version": workflow_version,
            },
            "last_failure": None,
            "last_clear": None,
        }
    return holds[key]
