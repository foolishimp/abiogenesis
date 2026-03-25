# Implements: REQ-F-BIND-001
# Implements: REQ-F-EVAL-002
# Implements: REQ-F-EVAL-003
"""Binding logic for the Codex abiogenesis build."""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from gtl.core import Context, Evaluator, F_D, F_H, F_P

from .core import ContextResolver, EventStream, project
from .manifest import PrecomputedManifest, PreparedExecution
from .runtime_model import ExecutableJob


def req_hash(requirements: list[str]) -> str:
    payload = json.dumps(sorted(requirements)).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()[:16]


def executable_job_hash(job: ExecutableJob) -> str:
    lines = []
    lines.append(f"job:{job.job.id}")
    lines.append(f"edge:{job.edge.id}")
    lines.extend(f"role:{role_id}" for role_id in sorted(job.required_role_ids))
    lines.extend(f"context:{ctx.digest}" for ctx in sorted(job.edge.context, key=lambda c: c.name))
    for evaluator in job.evaluators:
        line = ":".join(
            [
                evaluator.name.strip(),
                evaluator.category.__name__,
                evaluator.command.strip(),
                evaluator.description.strip(),
            ]
        )
        lines.append(re.sub(r"\s+", " ", line).strip())
    payload = "\n".join(sorted(lines)).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()[:16]


def run_fd_evaluator(
    evaluator: Evaluator, current_asset: dict, workspace_root: Path
) -> tuple[bool, dict]:
    if evaluator.category is not F_D:
        raise TypeError("run_fd_evaluator() requires an F_D evaluator")
    if not evaluator.command.strip():
        return False, {"reason": "no command configured"}
    env = os.environ.copy()
    propagated = os.pathsep.join(p for p in sys.path if p)
    existing = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = os.pathsep.join(filter(None, [propagated, existing]))
    proc = subprocess.run(
        evaluator.command,
        shell=True,
        cwd=str(workspace_root),
        capture_output=True,
        text=True,
        env=env,
    )
    return proc.returncode == 0, {
        "returncode": proc.returncode,
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "asset_status": current_asset.get("status"),
    }


def select_relevant_contexts(
    contexts: list[Context], failing_evaluators: list[Evaluator]
) -> list[Context]:
    if any(ev.category is F_P for ev in failing_evaluators):
        return list(contexts)
    return []


def bind_fd(
    job: ExecutableJob,
    stream: EventStream,
    resolver: ContextResolver,
    workspace_root: Path,
    *,
    spec_hash: str | None = None,
    current_workflow_version: str = "unknown",
    carry_forward: dict[str, dict] | None = None,
) -> PrecomputedManifest:
    source_asset = job.edge.source[0] if isinstance(job.edge.source, list) else job.edge.source
    current_asset = project(stream, source_asset.name, "current")
    carry_forward = carry_forward or {}
    fd_results: dict[str, dict] = {}
    failing: list[Evaluator] = []
    passing: list[Evaluator] = []
    events = stream.all_events()

    for evaluator in job.evaluators:
        if evaluator.category is F_D:
            passes, detail = run_fd_evaluator(evaluator, current_asset, workspace_root)
            fd_results[evaluator.name] = {"passes": passes, "detail": detail}
            (passing if passes else failing).append(evaluator)
        elif evaluator.category is F_H:
            passes = _operative_holds(
                events,
                edge_name=job.edge.name,
                workflow_version=current_workflow_version,
                carry_forward=carry_forward,
            )
            (passing if passes else failing).append(evaluator)
        elif evaluator.category is F_P:
            passes = _certified_holds(
                events,
                edge_name=job.edge.name,
                evaluator_name=evaluator.name,
                spec_hash=spec_hash,
            )
            (passing if passes else failing).append(evaluator)
        else:
            raise TypeError(f"Unknown evaluator category: {evaluator.category!r}")

    relevant = select_relevant_contexts(job.edge.context, failing)
    resolved: dict[str, str] = {}
    for context in relevant:
        try:
            resolved[context.name] = resolver.load(context)
        except NotImplementedError as exc:
            resolved[context.name] = f"[context unavailable: {exc}]"

    return PrecomputedManifest(
        executable_job=job,
        current_asset=current_asset,
        failing_evaluators=failing,
        passing_evaluators=passing,
        fd_results=fd_results,
        relevant_contexts=resolved,
        delta_summary=render_delta(fd_results, failing),
    )


def bind_fp(
    precomputed: PrecomputedManifest,
    job: ExecutableJob,
    result_path: str = "",
    *,
    worker_id: str | None = None,
    role_id: str | None = None,
    authority_ref: str | None = None,
) -> PreparedExecution:
    prompt = _render_prompt(precomputed)
    return PreparedExecution(
        executable_job=job,
        precomputed=precomputed,
        prompt=prompt,
        result_path=result_path,
        worker_id=worker_id,
        role_id=role_id,
        authority_ref=authority_ref,
    )


def bind_fh(precomputed: PrecomputedManifest, job: ExecutableJob) -> dict:
    return {
        "edge": job.edge.name,
        "criteria": [
            ev.description for ev in precomputed.failing_evaluators if ev.category is F_H
        ],
    }


def render_delta(fd_results: dict[str, dict], failing_evaluators: list[Evaluator]) -> str:
    if not failing_evaluators:
        return "delta = 0.0 — all evaluators pass"
    names = ", ".join(ev.name for ev in failing_evaluators)
    return f"delta = {len(failing_evaluators)} failing evaluator(s): {names}"


def _render_prompt(precomputed: PrecomputedManifest) -> str:
    sections = [
        "INVARIANTS",
        precomputed.delta_summary,
        "",
        "GAP",
        "\n".join(
            f"- {ev.name} ({ev.category.__name__}): {ev.description}"
            for ev in precomputed.failing_evaluators
        )
        or "- none",
        "",
        "OUTPUT CONTRACT",
        json.dumps(
            {
                "edge": precomputed.executable_job.edge.name,
                "job_id": precomputed.executable_job.job.id,
                "result_path": "write JSON assessment payload",
                "markov": getattr(precomputed.executable_job.edge.target, "markov", []),
            },
            indent=2,
        ),
    ]
    if precomputed.relevant_contexts:
        sections.extend(["", "CONTEXT"])
        for name, content in precomputed.relevant_contexts.items():
            sections.append(f"--- {name} ---")
            sections.append(content)
    return "\n".join(sections).strip()


def _operative_holds(
    events: list[dict],
    *,
    edge_name: str,
    workflow_version: str,
    carry_forward: dict[str, dict],
) -> bool:
    approvals: list[dict] = []
    revocations: list[dict] = []
    for event in events:
        data = event.get("data", {})
        if event.get("event_type") == "approved" and data.get("kind") in {
            "fh_review",
            "fh_intent",
        }:
            if data.get("edge") == edge_name and _workflow_matches(
                data.get("workflow_version"), edge_name, workflow_version, carry_forward
            ):
                approvals.append(event)
        if event.get("event_type") == "revoked" and data.get("kind") == "fh_approval":
            if data.get("edge") in {edge_name, "*"} and _workflow_matches(
                data.get("workflow_version"), edge_name, workflow_version, carry_forward
            ):
                revocations.append(event)
    if not approvals:
        return False
    latest_approval = approvals[-1]
    approval_time = latest_approval.get("event_time", "")
    for revoked in revocations:
        if revoked.get("event_time", "") >= approval_time:
            return False
    return True


def _certified_holds(
    events: list[dict],
    *,
    edge_name: str,
    evaluator_name: str,
    spec_hash: str | None,
) -> bool:
    for event in reversed(events):
        if event.get("event_type") != "assessed":
            continue
        data = event.get("data", {})
        if data.get("kind") != "fp":
            continue
        if data.get("edge") != edge_name or data.get("evaluator") != evaluator_name:
            continue
        if data.get("result") != "pass":
            continue
        if spec_hash is not None and data.get("spec_hash") != spec_hash:
            continue
        return True
    return False


def _workflow_matches(
    event_workflow_version: str | None,
    edge_name: str,
    workflow_version: str,
    carry_forward: dict[str, dict],
) -> bool:
    if workflow_version == "unknown":
        return True
    if event_workflow_version == workflow_version:
        return True
    carried = carry_forward.get(edge_name)
    if carried and event_workflow_version == carried.get("from_version"):
        return True
    return False
