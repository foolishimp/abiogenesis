# Implements: REQ-F-PROV-003
# Implements: REQ-F-PROV-004
# Implements: REQ-F-PROV-005
"""
provenance — Spec/workflow/selection provenance.

req_hash, job_evaluator_hash, _read_workflow_version.
Extracted from genesis.bind and genesis.commands as part of V2 module decomposition.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from genesis.binding import Job


def req_hash(requirements: list[str]) -> str:
    """
    Compute a stable hash of Package.requirements.

    Deprecated: used only when scope.workflow_version == "unknown".
    New code should use job_evaluator_hash(job) instead.
    """
    return hashlib.sha256(
        json.dumps(sorted(requirements)).encode()
    ).hexdigest()[:16]


def job_evaluator_hash(job: Job) -> str:
    """
    Hash of all evaluator definitions and bound context digests on this job.

    Covers F_D (binding), F_P/F_H (description), name+regime for all
    evaluators, plus every context digest on the edge.
    Used as spec_hash when scope.workflow_version != "unknown".
    """
    lines = sorted(
        f"{ev.name}:{ev.regime.__name__}:{ev.binding}:{ev.description}"
        for ev in job.evaluators
    )
    ctx_lines = sorted(
        f"ctx:{ctx.name}:{ctx.digest}"
        for ctx in (job.vector.contexts or [])
    )
    raw = "\n".join(re.sub(r'\s+', ' ', line.strip()) for line in lines + ctx_lines)
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def _read_workflow_version(workspace: Path, active_workflow_path: str | None = None) -> str:
    """
    Read active-workflow.json and return "{workflow}@{version}".

    Returns "unknown" on any failure.
    """
    if active_workflow_path:
        active_wf = (workspace / active_workflow_path).resolve()
    else:
        active_wf = workspace / ".ai-workspace" / "runtime" / "active-workflow.json"
    try:
        data = json.loads(active_wf.read_text(encoding="utf-8"))
        workflow = data["workflow"]
        version = data["version"]
        if not isinstance(workflow, str) or not isinstance(version, str):
            return "unknown"
        return f"{workflow}@{version}"
    except Exception:
        return "unknown"
