# Implements: REQ-R-ABG3-INTERPRET
# Implements: REQ-R-ABG3-EVENTS
# Implements: REQ-R-ABG3-PROVENANCE
"""
result_ingest — engine-owned F_P result ingestion and assessed-event emission.
"""
from __future__ import annotations

import json
from collections.abc import Callable, Mapping
from pathlib import Path
from typing import Any

from .events import EventContext, EventStream, emit
from .provenance import _read_workflow_version


def validate_fp_result_payload(payload: Any) -> bool:
    """Return True when the payload satisfies the F_P result contract."""
    if not isinstance(payload, Mapping):
        return False
    if not isinstance(payload.get("edge"), str) or not payload.get("edge"):
        return False
    if not isinstance(payload.get("actor"), str) or not payload.get("actor"):
        return False
    assessments = payload.get("assessments")
    if not isinstance(assessments, list) or not assessments:
        return False
    for assessment in assessments:
        if not isinstance(assessment, Mapping):
            return False
        evaluator = assessment.get("evaluator")
        result = assessment.get("result")
        if not isinstance(evaluator, str) or not evaluator:
            return False
        if result not in ("pass", "fail"):
            return False
    return True


def _emit_workspace_event(
    workspace: Path,
    event_type: str,
    data: dict[str, Any],
    *,
    workflow_version: str = "unknown",
    work_key: str | None = None,
    run_id: str | None = None,
) -> dict:
    return emit(
        event_type,
        data,
        stream=EventStream.open(workspace),
        context=EventContext(
            workflow_version=workflow_version,
            work_key=work_key,
            run_id=run_id,
        ),
    )


def _read_json(path: Path, *, label: str) -> dict[str, Any]:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"{label} is not valid JSON: {exc}") from exc
    if not isinstance(raw, Mapping):
        raise ValueError(f"{label} must contain a JSON object")
    return dict(raw)


def _read_provenance(*values: object) -> str:
    for value in values:
        if isinstance(value, str) and value:
            return value
    return ""


def ingest_fp_result(
    result_path: str | Path,
    workspace: Path,
    *,
    manifest_data: Mapping[str, Any] | None = None,
    active_workflow_path: str | None = None,
    emit_event: Callable[..., Any] | None = None,
) -> dict[str, Any]:
    """
    Ingest one F_P result JSON file and emit assessed{kind: fp} events.

    Returns a structured summary. Raises ValueError on malformed inputs.
    """
    result_file = Path(result_path)
    if not result_file.exists():
        raise ValueError(f"result file not found: {result_file}")
    result_data = _read_json(result_file, label=f"result file {result_file}")
    if not validate_fp_result_payload(result_data):
        raise ValueError("result file does not satisfy the F_P result contract")

    manifest_id = result_file.stem
    manifest = dict(manifest_data or {})
    if not manifest:
        manifest_file = workspace / ".ai-workspace" / "fp_manifests" / f"{manifest_id}.json"
        if not manifest_file.exists():
            raise ValueError(f"matching manifest not found: {manifest_file}")
        manifest = _read_json(manifest_file, label=f"manifest file {manifest_file}")

    spec_hash = manifest.get("spec_hash")
    if not isinstance(spec_hash, str) or not spec_hash:
        raise ValueError("manifest must provide non-empty spec_hash for assessed{kind: fp}")

    manifest_run_id = manifest.get("run_id") if isinstance(manifest.get("run_id"), str) else ""
    manifest_work_key = manifest.get("work_key") if isinstance(manifest.get("work_key"), str) else ""
    workflow_version = _read_provenance(
        manifest.get("workflow_version"),
        _read_workflow_version(workspace, active_workflow_path),
    ) or "unknown"

    selected_worker_id = _read_provenance(
        result_data.get("selected_worker_id"),
        result_data.get("worker_id"),
        manifest.get("selected_worker_id"),
        manifest.get("worker_id"),
    )
    selected_backend = _read_provenance(
        result_data.get("selected_backend"),
        result_data.get("backend_id"),
        manifest.get("selected_backend"),
        manifest.get("backend_id"),
    )
    role_id = _read_provenance(result_data.get("role_id"), manifest.get("role_id"))
    authority_ref = _read_provenance(result_data.get("authority_ref"), manifest.get("authority_ref"))
    assignment_source = _read_provenance(
        result_data.get("assignment_source"),
        manifest.get("assignment_source"),
    )
    resolved_runtime_ref = _read_provenance(
        result_data.get("resolved_runtime_ref"),
        manifest.get("resolved_runtime_ref"),
    )

    event_writer = emit_event or _emit_workspace_event
    emitted: list[dict[str, str]] = []
    for assessment in result_data["assessments"]:
        event_data: dict[str, Any] = {
            "kind": "fp",
            "edge": result_data["edge"],
            "evaluator": assessment["evaluator"],
            "result": assessment["result"],
            "evidence": assessment.get("evidence", ""),
            "actor": result_data["actor"],
            "spec_hash": spec_hash,
            "manifest_id": manifest_id,
            "workflow_version": workflow_version,
        }
        if selected_worker_id:
            event_data["selected_worker_id"] = selected_worker_id
        if selected_backend:
            event_data["backend_id"] = selected_backend
            event_data["selected_backend"] = selected_backend
        if role_id:
            event_data["role_id"] = role_id
        if authority_ref:
            event_data["authority_ref"] = authority_ref
        if assignment_source:
            event_data["assignment_source"] = assignment_source
        if resolved_runtime_ref:
            event_data["resolved_runtime_ref"] = resolved_runtime_ref

        event_writer(
            workspace,
            "assessed",
            event_data,
            workflow_version=workflow_version,
            work_key=manifest_work_key or None,
            run_id=manifest_run_id or None,
        )
        emitted.append(
            {
                "evaluator": assessment["evaluator"],
                "result": assessment["result"],
            }
        )

    return {
        "status": "ok",
        "result_path": str(result_file),
        "manifest_id": manifest_id,
        "spec_hash": spec_hash,
        "workflow_version": workflow_version,
        "events_emitted": len(emitted),
        "assessments": emitted,
    }
