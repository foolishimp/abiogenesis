# Implements: REQ-F-EVAL-002
# Implements: REQ-F-EVAL-003
"""Runtime manifest types for the Codex abiogenesis build."""

from __future__ import annotations

from dataclasses import dataclass

from gtl.core import Evaluator, Job


@dataclass(slots=True)
class PrecomputedManifest:
    """Everything the engine can compute before any F_P dispatch."""

    job: Job
    current_asset: dict
    failing_evaluators: list[Evaluator]
    passing_evaluators: list[Evaluator]
    fd_results: dict[str, dict]
    relevant_contexts: dict[str, str]
    delta_summary: str

    @property
    def has_gap(self) -> bool:
        return bool(self.failing_evaluators)

    @property
    def delta(self) -> float:
        total = len(self.job.evaluators)
        if total == 0:
            return 0.0
        return len(self.failing_evaluators) / total


@dataclass(slots=True)
class BoundJob:
    """A job with resolved context and assembled prompt."""

    job: Job
    precomputed: PrecomputedManifest
    prompt: str
    result_path: str = ""
