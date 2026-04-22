# Implements: REQ-R-ABG3-CONTINUATION
"""
continuation — replay-derived continuation truth.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

RETRY_YIELD_FAILURE_CLASSES = frozenset({
    "transport_failure",
    "no_output",
    "contract_failure",
})


def _event_value(event: dict, key: str):
    value = event.get(key)
    if value is not None:
        return value
    return event.get("data", {}).get(key)


@dataclass(frozen=True)
class ContinuationState:
    continuation_id: str
    continuation_kind: str | None
    run_id: str | None
    caused_by_event_id: str | None
    state: str
    call_id: str | None = None
    frame_attempt_id: str | None = None
    event_count: int = 0


@dataclass(frozen=True)
class YieldedContinuationContract:
    continuation_id: str
    handoff_kind: str
    edge: str | None = None
    call_id: str | None = None
    handoff_reason: str | None = None
    failure_class: str | None = None

    def public_result(self, **extra: Any) -> dict[str, Any]:
        result: dict[str, Any] = {
            "status": "yield",
            "stopped_by": "yield",
            "continuation_id": self.continuation_id,
            "handoff_kind": self.handoff_kind,
        }
        if self.edge is not None:
            result["edge"] = self.edge
        if self.call_id is not None:
            result["call_id"] = self.call_id
        if self.handoff_reason is not None:
            result["handoff_reason"] = self.handoff_reason
        if self.failure_class is not None:
            result["failure_class"] = self.failure_class
        result.update(extra)
        return result

    def run_yielded_event_data(self) -> dict[str, Any]:
        data: dict[str, Any] = {
            "continuation_id": self.continuation_id,
            "handoff_kind": self.handoff_kind,
        }
        if self.edge is not None:
            data["edge"] = self.edge
        if self.call_id is not None:
            data["call_id"] = self.call_id
        if self.handoff_reason is not None:
            data["handoff_reason"] = self.handoff_reason
        if self.failure_class is not None:
            data["failure_class"] = self.failure_class
        return data


def yielded_retry_continuation_contract(
    *,
    continuation_id: str,
    failure_class: str,
    edge: str | None = None,
    call_id: str | None = None,
) -> YieldedContinuationContract | None:
    if failure_class not in RETRY_YIELD_FAILURE_CLASSES:
        return None
    return YieldedContinuationContract(
        continuation_id=continuation_id,
        handoff_kind="retry",
        edge=edge,
        call_id=call_id,
        handoff_reason=failure_class,
        failure_class=failure_class,
    )


def continuation_state(all_events: list[dict], continuation_id: str) -> ContinuationState | None:
    state: str | None = None
    continuation_kind: str | None = None
    run_id: str | None = None
    caused_by_event_id: str | None = None
    call_id: str | None = None
    frame_attempt_id: str | None = None
    event_count = 0

    for event in all_events:
        aggregate_type = event.get("aggregate_type")
        aggregate_id = event.get("aggregate_id")
        if aggregate_type == "continuation" and aggregate_id == continuation_id:
            relevant = True
        else:
            relevant = _event_value(event, "continuation_id") == continuation_id
        if not relevant:
            continue

        event_count += 1
        continuation_kind = _event_value(event, "continuation_kind") or continuation_kind
        run_id = _event_value(event, "run_id") or run_id
        caused_by_event_id = _event_value(event, "caused_by_event_id") or caused_by_event_id
        call_id = _event_value(event, "call_id") or call_id
        frame_attempt_id = _event_value(event, "frame_attempt_id") or frame_attempt_id
        event_type = event.get("event_type")
        if event_type == "continuation_opened":
            state = "open"
        elif event_type == "continuation_resolved":
            state = "resolved"
        elif event_type == "continuation_superseded":
            state = "superseded"
        elif event_type == "continuation_abandoned":
            state = "abandoned"

    if state is None:
        return None

    return ContinuationState(
        continuation_id=continuation_id,
        continuation_kind=continuation_kind,
        run_id=run_id,
        caused_by_event_id=caused_by_event_id,
        state=state,
        call_id=call_id,
        frame_attempt_id=frame_attempt_id,
        event_count=event_count,
    )


def project_continuation(all_events: list[dict], continuation_id: str) -> dict:
    state = continuation_state(all_events, continuation_id)
    if state is None:
        return {
            "asset_type": "continuation",
            "instance_id": continuation_id,
            "status": "not_started",
            "event_count": 0,
        }
    projected = asdict(state)
    projected["asset_type"] = "continuation"
    projected["instance_id"] = continuation_id
    projected["status"] = projected.pop("state")
    return projected
