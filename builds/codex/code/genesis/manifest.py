# Implements: REQ-F-EVAL-002
# Implements: REQ-F-EVAL-003
"""Runtime manifest types for the Codex abiogenesis build."""

from __future__ import annotations

from dataclasses import dataclass

from gtl.core import Evaluator

from .runtime_model import ExecutableJob


@dataclass(slots=True)
class PrecomputedManifest:
    """Everything the engine can compute before any F_P dispatch."""

    executable_job: ExecutableJob
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
        total = len(self.executable_job.evaluators)
        if total == 0:
            return 0.0
        return len(self.failing_evaluators) / total


@dataclass(slots=True)
class PreparedExecution:
    """Executable job with resolved context and assembled prompt."""

    executable_job: ExecutableJob
    precomputed: PrecomputedManifest
    prompt: str
    result_path: str = ""
    worker_id: str | None = None
    role_id: str | None = None
    authority_ref: str | None = None
