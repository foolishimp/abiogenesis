# Implements: REQ-R-ABG2-CONVERGENCE
"""
convergence — Delta computation and convergence visibility.

delta, parent_converged, render_delta (re-exported from binding).
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

from gtl.operator_model import Evaluator, F_D, F_H, F_P

from .binding import ExecutableJob, Worker, bind_fh, bind_fp_certified, render_delta, run_fd_evaluator
from .events import EventStream
from .lineage import _discover_children
from .projection import project


def delta(
    job: ExecutableJob,
    stream: EventStream,
    workspace_root: Path,
    spec_hash: str | None = None,
    current_workflow_version: str = "unknown",
    carry_forward: list[dict] | None = None,
    *,
    work_key: str | None = None,
) -> float:
    """
    0.0 = converged. > 0.0 = work needed.

    REQ-F-FRAG-004: When a work_key has children (work_spawned events),
    convergence delegates to descendants — fold-back is transparent.

    Returns: fraction of failing evaluators (0.0 to 1.0).
    """
    if not job.evaluators:
        return 0.0

    events = stream.all_events()

    # REQ-F-FRAG-004: Fold-back
    if work_key is not None:
        children = _discover_children(events, work_key)
        if children:
            for ck in children:
                child_d = delta(job, stream, workspace_root, spec_hash,
                                current_workflow_version, carry_forward,
                                work_key=ck)
                if child_d > 0:
                    return 1.0
            return 0.0

    source = job.source_type
    source_name = source[0].name if isinstance(source, tuple) else source.name
    current = project(stream, source_name, "current", work_key=work_key)

    failing = 0

    for ev in job.evaluators:
        if ev.regime is F_D:
            passes, _ = run_fd_evaluator(ev, current, workspace_root,
                                         work_key=work_key)
            if not passes:
                failing += 1

        elif ev.regime is F_H:
            if not bind_fh(job, events, current_workflow_version, carry_forward,
                           work_key=work_key):
                failing += 1

        elif ev.regime is F_P:
            if not bind_fp_certified(
                job, ev, events, spec_hash, current_workflow_version,
                work_key=work_key,
            ):
                failing += 1

    return failing / len(job.evaluators)


def parent_converged(
    parent_key: str,
    stream: EventStream,
    jobs: list[Job],
    workspace_root: Path,
    spec_hash: str | None = None,
    current_workflow_version: str = "unknown",
    carry_forward: list[dict] | None = None,
) -> bool:
    """
    Check if a parent work_key is converged by checking all descendants.

    REQ-F-FRAG-004 AC-3/AC-4: parent convergence is a projection
    over all descendant convergence.
    """
    events = stream.all_events()
    child_keys = _discover_children(events, parent_key)

    if not child_keys:
        for job in jobs:
            d = delta(job, stream, workspace_root, spec_hash,
                      current_workflow_version, carry_forward,
                      work_key=parent_key)
            if d > 0:
                return False
        return True

    for ck in child_keys:
        if not parent_converged(ck, stream, jobs, workspace_root,
                                spec_hash, current_workflow_version,
                                carry_forward):
            return False

    return True
