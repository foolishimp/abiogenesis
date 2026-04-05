# Implements: REQ-F-CMD-001
# Implements: REQ-F-CMD-002
# Implements: REQ-F-CMD-003
# Implements: REQ-F-CMD-004
# Implements: REQ-F-VIS-001
# Implements: REQ-F-PROV-001
# Implements: REQ-F-PROV-003
# Implements: REQ-F-PROV-004
"""Command compositions for the Codex abiogenesis build."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from gtl.core import F_D, F_H, F_P, Package

from .bind import bind_fd, bind_fp, executable_job_hash, req_hash
from .core import ContextResolver, EventStream
from .runtime_model import ExecutableJob, Worker
from .schedule import iterate


@dataclass(slots=True)
class Scope:
    package: Package
    workspace_root: Path
    feature: str | None = None
    edge: str | None = None
    build: str = "codex"
    worker: Worker | None = None
    workflow_version: str = field(init=False)

    def __post_init__(self) -> None:
        self.workflow_version = _read_workflow_version(self.workspace_root)


def gen_gaps(scope: Scope, stream: EventStream) -> dict:
    stream.workflow_version = scope.workflow_version
    resolver = ContextResolver(scope.workspace_root)
    worker = _resolve_worker(scope)
    jobs = _scoped_jobs(scope, worker)
    if not jobs:
        return {"status": "error", "reason": "no jobs in scope"}

    certified_pairs = {
        (event.get("data", {}).get("edge"), event.get("data", {}).get("feature"))
        for event in stream.all_events()
        if event.get("event_type") == "edge_converged"
    }
    carry_forward = _read_carry_forward(scope.workspace_root, scope.workflow_version)
    gap_rows = []
    total_delta = 0.0
    feature_id = scope.feature or "current"

    for job in jobs:
        spec_hash = (
            req_hash(scope.package.requirements)
            if scope.workflow_version == "unknown"
            else executable_job_hash(job)
        )
        pre = bind_fd(
            job,
            stream,
            resolver,
            scope.workspace_root,
            spec_hash=spec_hash,
            current_workflow_version=scope.workflow_version,
            carry_forward=carry_forward,
        )
        total_delta += pre.delta
        gap_rows.append(
            {
                "edge": job.edge.name,
                "delta": pre.delta,
                "failing": [ev.name for ev in pre.failing_evaluators],
                "passing": [ev.name for ev in pre.passing_evaluators],
                "delta_summary": pre.delta_summary,
            }
        )
        pair = (job.edge.name, feature_id)
        if pre.delta == 0.0 and pair not in certified_pairs:
            stream.append(
                "edge_converged",
                {
                    "edge": job.edge.name,
                    "target": job.edge.target.name,
                    "feature": feature_id,
                    "delta": 0.0,
                    "certified_by": "gen_gaps",
                },
            )
            certified_pairs.add(pair)

    return {
        "scope": {
            "package": scope.package.name,
            "feature": feature_id,
            "edge": scope.edge,
            "build": scope.build,
        },
        "jobs_considered": len(gap_rows),
        "total_delta": total_delta,
        "converged": total_delta == 0.0,
        "gaps": gap_rows,
    }


def gen_iterate(scope: Scope, stream: EventStream) -> dict:
    stream.workflow_version = scope.workflow_version
    resolver = ContextResolver(scope.workspace_root)
    worker = _resolve_worker(scope)
    jobs = _scoped_jobs(scope, worker)
    if not jobs:
        return {"status": "nothing_to_do", "reason": "no jobs in scope"}

    carry_forward = _read_carry_forward(scope.workspace_root, scope.workflow_version)
    selected_job: ExecutableJob | None = None
    selected_pre = None
    for job in jobs:
        spec_hash = (
            req_hash(scope.package.requirements)
            if scope.workflow_version == "unknown"
            else executable_job_hash(job)
        )
        pre = bind_fd(
            job,
            stream,
            resolver,
            scope.workspace_root,
            spec_hash=spec_hash,
            current_workflow_version=scope.workflow_version,
            carry_forward=carry_forward,
        )
        if pre.has_gap:
            selected_job = job
            selected_pre = pre
            break

    if selected_job is None or selected_pre is None:
        return {"status": "converged", "reason": "all jobs in scope have delta = 0.0"}

    fp_needed = any(ev.category is F_P for ev in selected_pre.failing_evaluators)
    fd_blocked = any(ev.category is F_D for ev in selected_pre.failing_evaluators)
    feature_id = scope.feature or "current"
    manifest_path = ""
    result_path = ""

    if fp_needed and not fd_blocked:
        manifest_dir = scope.workspace_root / ".ai-workspace" / "fp_manifests"
        result_dir = scope.workspace_root / ".ai-workspace" / "fp_results"
        manifest_dir.mkdir(parents=True, exist_ok=True)
        result_dir.mkdir(parents=True, exist_ok=True)
        safe_edge = selected_job.edge.name.replace("↔", "_").replace("→", "_")
        manifest_path = str(manifest_dir / f"{feature_id}_{safe_edge}.json")
        result_path = str(result_dir / f"{feature_id}_{safe_edge}.json")

    role_id = selected_job.required_role_ids[0] if selected_job.required_role_ids else None
    if not worker.can_bind(selected_job):
        return {
            "status": "error",
            "reason": "worker lacks required role binding",
            "job_id": selected_job.job.id,
            "worker_id": worker.id,
            "required_role_ids": list(selected_job.required_role_ids),
        }

    bound = bind_fp(
        selected_pre,
        selected_job,
        result_path=result_path,
        worker_id=worker.id,
        role_id=role_id,
        authority_ref=worker.authority_ref,
    )
    if manifest_path:
        Path(manifest_path).write_text(
            json.dumps(
                {
                    "edge": selected_job.edge.name,
                    "feature": feature_id,
                    "prompt": bound.prompt,
                    "result_path": result_path,
                    "failing_evaluators": [ev.name for ev in selected_pre.failing_evaluators],
                },
                indent=2,
            ),
            encoding="utf-8",
        )

    stream.append(
        "run_bound",
        {
            "edge": selected_job.edge.name,
            "job_id": selected_job.job.id,
            "worker_id": worker.id,
            "role_id": role_id,
            "authority_ref": worker.authority_ref,
            "feature": feature_id,
        },
    )
    stream.append(
        "vector_started",
        {
            "edge": selected_job.edge.name,
            "build": scope.build,
            "target": selected_job.edge.target.name,
            "feature": feature_id,
        },
    )
    surface = iterate(bound)
    for event in surface.events:
        stream.append(event["event_type"], event["data"])

    if any(event["event_type"] == "found" for event in surface.events):
        return {
            "status": "fd_gap",
            "edge": selected_job.edge.name,
            "delta_before": selected_pre.delta,
            "failing_evaluators": [ev.name for ev in selected_pre.failing_evaluators],
        }
    if any(event["event_type"] == "fp_dispatched" for event in surface.events):
        return {
            "status": "fp_dispatched",
            "edge": selected_job.edge.name,
            "delta_before": selected_pre.delta,
            "fp_manifest_path": manifest_path,
            "result_path": result_path,
            "failing_evaluators": [ev.name for ev in selected_pre.failing_evaluators],
        }
    if any(event["event_type"] == "fh_gate_pending" for event in surface.events):
        return {
            "status": "fh_gate_pending",
            "edge": selected_job.edge.name,
            "criteria": [
                ev.description
                for ev in selected_pre.failing_evaluators
                if ev.category is F_H
            ],
        }
    return {"status": "iterated", "edge": selected_job.edge.name, "delta_before": selected_pre.delta}


def gen_start(scope: Scope, stream: EventStream, *, auto: bool = False) -> dict:
    state = _derive_state(scope, stream)
    if state["status"] == "converged":
        closed = _close_completed_features(scope.workspace_root)
        return {"status": "converged", "closed_features": closed}
    if state["status"] == "nothing_to_do":
        return state
    if not auto:
        return gen_iterate(scope, stream)

    for iteration in range(1, 51):
        result = gen_iterate(scope, stream)
        if result["status"] in {"converged", "nothing_to_do"}:
            return result
        if result["status"] == "fp_dispatched":
            result["stopped_by"] = "fp_dispatch"
            result["iterations"] = iteration
            return result
        if result["status"] == "fh_gate_pending":
            result["stopped_by"] = "fh_gate"
            result["iterations"] = iteration
            return result
        if result["status"] == "fd_gap":
            result["stopped_by"] = "fd_gap"
            result["iterations"] = iteration
            return result
    return {"status": "max_iterations", "stopped_by": "max_iterations", "iterations": 50}


def _derive_state(scope: Scope, stream: EventStream) -> dict:
    resolver = ContextResolver(scope.workspace_root)
    worker = _resolve_worker(scope)
    jobs = _scoped_jobs(scope, worker)
    if not jobs:
        return {"status": "nothing_to_do", "reason": "no jobs in scope"}
    carry_forward = _read_carry_forward(scope.workspace_root, scope.workflow_version)
    total_delta = 0.0
    for job in jobs:
        spec_hash = (
            req_hash(scope.package.requirements)
            if scope.workflow_version == "unknown"
            else executable_job_hash(job)
        )
        pre = bind_fd(
            job,
            stream,
            resolver,
            scope.workspace_root,
            spec_hash=spec_hash,
            current_workflow_version=scope.workflow_version,
            carry_forward=carry_forward,
        )
        total_delta += pre.delta
    if total_delta == 0.0:
        return {"status": "converged"}
    return {"status": "in_progress", "delta": total_delta}


def _resolve_worker(scope: Scope) -> Worker:
    if scope.worker is None:
        raise RuntimeError("Scope.worker is required")
    return scope.worker


def _scoped_jobs(scope: Scope, worker: Worker) -> list[ExecutableJob]:
    jobs = list(worker.can_execute)
    if scope.edge:
        jobs = [job for job in jobs if job.edge.name == scope.edge]
    jobs = [job for job in jobs if worker.can_bind(job)]
    return jobs


def _read_workflow_version(workspace_root: Path) -> str:
    path = workspace_root / ".genesis" / "active-workflow.json"
    if not path.exists():
        return "unknown"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return "unknown"
    workflow = data.get("workflow")
    version = data.get("version")
    if isinstance(workflow, str) and isinstance(version, str):
        return f"{workflow}@{version}"
    return "unknown"


def _read_carry_forward(workspace_root: Path, workflow_version: str) -> dict[str, dict]:
    if workflow_version == "unknown":
        return {}
    workflow, version = workflow_version.split("@", 1)
    package_name, _, variant = workflow.partition(".")
    variant = variant or "default"
    version_dir = "v" + version.replace(".", "_")
    path = (
        workspace_root
        / ".genesis"
        / "workflows"
        / package_name
        / variant
        / version_dir
        / "manifest.json"
    )
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    raw = data.get("approved_carry_forward", [])
    if not isinstance(raw, list):
        return {}
    carry_forward: dict[str, dict] = {}
    for entry in raw:
        if not isinstance(entry, dict):
            continue
        edge = entry.get("edge")
        from_version = entry.get("from_version")
        if isinstance(edge, str) and isinstance(from_version, str):
            carry_forward[edge] = {"from_version": from_version}
    return carry_forward


def _close_completed_features(workspace_root: Path) -> list[str]:
    active_dir = workspace_root / ".ai-workspace" / "features" / "active"
    completed_dir = workspace_root / ".ai-workspace" / "features" / "completed"
    if not active_dir.exists():
        return []
    completed_dir.mkdir(parents=True, exist_ok=True)
    moved: list[str] = []
    for path in sorted(active_dir.glob("*.yml")):
        text = path.read_text(encoding="utf-8")
        if "status:" in text:
            lines = []
            for line in text.splitlines():
                if line.strip().startswith("status:"):
                    lines.append("status: completed")
                else:
                    lines.append(line)
            updated = "\n".join(lines) + ("\n" if text.endswith("\n") else "")
        else:
            updated = text.rstrip() + "\nstatus: completed\n"
        target = completed_dir / path.name
        target.write_text(updated, encoding="utf-8")
        path.unlink()
        moved.append(path.stem)
    return moved
