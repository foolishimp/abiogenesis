# Implements: REQ-F-GATE-001
# Implements: REQ-F-GATE-002
"""Scheduling and iterate semantics for the Codex abiogenesis build."""

from __future__ import annotations

from gtl.core import F_D, F_H, F_P, Worker, WorkingSurface

from .manifest import BoundJob, PrecomputedManifest


def delta(precomputed: PrecomputedManifest) -> float:
    return precomputed.delta


def iterate(bound_job: BoundJob) -> WorkingSurface:
    pre = bound_job.precomputed
    surface = WorkingSurface(context_consumed=list(pre.job.edge.context))
    fd_failing = [ev for ev in pre.failing_evaluators if ev.category is F_D]
    fp_failing = [ev for ev in pre.failing_evaluators if ev.category is F_P]
    fh_failing = [ev for ev in pre.failing_evaluators if ev.category is F_H]

    if fd_failing:
        surface.events.append(
            {
                "event_type": "found",
                "data": {
                    "kind": "fd_gap",
                    "edge": pre.job.edge.name,
                    "failing_evaluators": [ev.name for ev in fd_failing],
                    "delta_summary": pre.delta_summary,
                },
            }
        )
        return surface

    if fp_failing:
        surface.events.append(
            {
                "event_type": "fp_dispatched",
                "data": {
                    "edge": pre.job.edge.name,
                    "failing_evaluators": [ev.name for ev in fp_failing],
                    "prompt_length": len(bound_job.prompt),
                    "result_path": bound_job.result_path,
                },
            }
        )
        if bound_job.result_path:
            surface.artifacts.append(bound_job.result_path)
        return surface

    if fh_failing:
        surface.events.append(
            {
                "event_type": "fh_gate_pending",
                "data": {
                    "edge": pre.job.edge.name,
                    "criteria": [ev.description for ev in fh_failing],
                },
            }
        )
        return surface

    return surface


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
