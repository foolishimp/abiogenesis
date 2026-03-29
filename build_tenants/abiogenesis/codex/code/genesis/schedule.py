# Implements: REQ-F-GATE-001
# Implements: REQ-F-GATE-002
"""Scheduling and iterate semantics for the Codex abiogenesis build."""

from __future__ import annotations

from dataclasses import replace

from gtl.core import F_D, F_H, F_P

from .manifest import PrecomputedManifest, PreparedExecution
from .runtime_model import WorkSurface, Worker


def delta(precomputed: PrecomputedManifest) -> float:
    return precomputed.delta


def iterate(bound_job: PreparedExecution) -> WorkSurface:
    pre = bound_job.precomputed
    executable_job = pre.executable_job
    role_id = executable_job.required_role_ids[0] if executable_job.required_role_ids else None
    surface = WorkSurface(
        stage="prepared",
        job_id=executable_job.job.id,
        worker_id=bound_job.worker_id,
        role_id=bound_job.role_id or role_id,
        authority_ref=bound_job.authority_ref,
        context_consumed=tuple(executable_job.edge.context),
    )
    fd_failing = [ev for ev in pre.failing_evaluators if ev.category is F_D]
    fp_failing = [ev for ev in pre.failing_evaluators if ev.category is F_P]
    fh_failing = [ev for ev in pre.failing_evaluators if ev.category is F_H]

    if fd_failing:
        return surface.at_stage("fd_gap").with_event(
            {
                "event_type": "found",
                "data": {
                    "kind": "fd_gap",
                    "edge": executable_job.edge.name,
                    "job_id": executable_job.job.id,
                    "failing_evaluators": [ev.name for ev in fd_failing],
                    "delta_summary": pre.delta_summary,
                },
            },
        )

    if fp_failing:
        surface = surface.at_stage("fp_dispatched").with_event(
            {
                "event_type": "fp_dispatched",
                "data": {
                    "edge": executable_job.edge.name,
                    "job_id": executable_job.job.id,
                    "failing_evaluators": [ev.name for ev in fp_failing],
                    "prompt_length": len(bound_job.prompt),
                    "result_path": bound_job.result_path,
                },
            },
        )
        if bound_job.result_path:
            surface = surface.with_artifact(bound_job.result_path)
        return surface

    if fh_failing:
        return surface.at_stage("fh_gate_pending").with_event(
            {
                "event_type": "fh_gate_pending",
                "data": {
                    "edge": executable_job.edge.name,
                    "job_id": executable_job.job.id,
                    "criteria": [ev.description for ev in fh_failing],
                },
            },
        )

    return replace(surface, stage="converged")


def schedule(workers: list[Worker]) -> list[list[Worker]]:
    """Greedy conflict-free batching by overlapping write territory."""

    remaining = list(workers)
    batches: list[list[Worker]] = []
    while remaining:
        batch: list[Worker] = []
        still_pending: list[Worker] = []
        for worker in remaining:
            if any(worker.conflicts_with(other) for other in batch):
                still_pending.append(worker)
            else:
                batch.append(worker)
        batches.append(batch)
        remaining = still_pending
    return batches
