# Implements: REQ-F-CMD-001
# Implements: REQ-F-CMD-002
# Implements: REQ-F-CMD-003
"""
commands — gen_start, gen_iterate, gen_gaps, Scope.

Three commands as named compositions of core functions. None introduce new
primitives. Phase 4 of the approved execution plan. See ADR-004 (Scope).

  /gen-gaps    = bind_fd over scope → delta_summary fields
  /gen-iterate = bind one Job → iterate exactly once
  /gen-start   = derive state → select job → bind → iterate
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Optional

from gtl.core import Job, Package, Worker

from .bind import bind_fd, bind_fp
from .core import ContextResolver, EventStream, emit, project
from .manifest import BoundJob
from .schedule import delta, iterate, schedule


# ── Scope ─────────────────────────────────────────────────────────────────────

@dataclass
class Scope:
    """
    First-class scope object. Every command requires one. No ambient inference.

    Ambiguous scope fails closed — the command returns an error describing the
    available scopes rather than guessing. See ADR-004.

    V1: build is always "claude_code". Multi-tenant deferred to V2.
    """
    package: Package
    workspace_root: Path
    feature: Optional[str] = None     # feature vector ID override (None = all)
    edge: Optional[str] = None        # edge name override (None = topological)
    build: str = "claude_code"


# ── gen_gaps — bind_fd over scope ─────────────────────────────────────────────

def gen_gaps(scope: Scope, stream: EventStream) -> dict:
    """
    /gen-gaps = bind_fd over selected jobs → return delta_summary fields.

    Requires explicit Scope — fails closed on ambiguity.
    Runs bind_fd only (no F_P dispatch).

    Returns: jobs considered, failing evaluators per job, total delta.
    """
    resolver = ContextResolver(scope.workspace_root)
    worker = _resolve_worker(scope)
    jobs = _scoped_jobs(scope, worker)

    if not jobs:
        return {
            "status": "error",
            "reason": "no jobs in scope — check --feature and --edge flags",
        }

    results = []
    for job in jobs:
        pre = bind_fd(job, stream, resolver, scope.workspace_root)
        results.append({
            "edge": job.edge.name,
            "delta": pre.delta,
            "failing": [ev.name for ev in pre.failing_evaluators],
            "passing": [ev.name for ev in pre.passing_evaluators],
            "delta_summary": pre.delta_summary,
        })

    total_delta = sum(r["delta"] for r in results)
    return {
        "scope": {
            "package": scope.package.name,
            "feature": scope.feature,
            "edge": scope.edge,
            "build": scope.build,
        },
        "jobs_considered": len(results),
        "total_delta": total_delta,
        "converged": total_delta == 0,
        "gaps": results,
    }


# ── gen_iterate — bind + iterate once ─────────────────────────────────────────

def gen_iterate(
    scope: Scope,
    stream: EventStream,
    on_fp_dispatch: Optional[Callable[[BoundJob], None]] = None,
) -> dict:
    """
    /gen-iterate = bind one Job → iterate exactly once.

    The most important command to keep pure.
    One Job. One Asset. One iterate call.
    """
    resolver = ContextResolver(scope.workspace_root)
    worker = _resolve_worker(scope)
    jobs = _scoped_jobs(scope, worker)

    if not jobs:
        return {"status": "nothing_to_do", "reason": "no jobs in scope"}

    # Select the first unconverged job in topological order
    selected_job = None
    selected_pre = None
    for job in jobs:
        pre = bind_fd(job, stream, resolver, scope.workspace_root)
        if pre.has_gap:
            selected_job = job
            selected_pre = pre
            break

    if selected_job is None:
        return {
            "status": "converged",
            "reason": "all jobs in scope have delta = 0",
        }

    # Bind + iterate
    bound = bind_fp(selected_pre, selected_job)
    emit("edge_started", {
        "edge": selected_job.edge.name,
        "feature": scope.feature or "all",
        "build": scope.build,
    })

    surface = iterate(bound, on_fp_dispatch=on_fp_dispatch)

    # Emit surface events
    for event in surface.events:
        emit(event["event_type"], event["data"])

    return {
        "status": "iterated",
        "edge": selected_job.edge.name,
        "delta_before": selected_pre.delta,
        "failing_evaluators": [ev.name for ev in selected_pre.failing_evaluators],
        "events_emitted": len(surface.events) + 1,  # +1 for edge_started
        "prompt_words": len(bound.prompt.split()),
    }


# ── gen_start — state machine ──────────────────────────────────────────────────

def gen_start(
    scope: Scope,
    stream: EventStream,
    auto: bool = False,
    on_fp_dispatch: Optional[Callable[[BoundJob], None]] = None,
) -> dict:
    """
    /gen-start = derive state → select job → bind → iterate.

    State machine: reads workspace, selects the next unconverged job,
    delegates to gen_iterate. In --auto mode, loops until converged or blocked.
    """
    state = _derive_state(scope, stream)

    if state["status"] == "converged":
        return {
            "status": "converged",
            "message": "All jobs in scope have delta = 0. Run /gen-gaps for full report.",
        }

    if state["status"] == "nothing_to_do":
        return {
            "status": "nothing_to_do",
            "reason": state.get("reason", ""),
        }

    # IN_PROGRESS — dispatch to gen_iterate
    result = gen_iterate(scope, stream, on_fp_dispatch=on_fp_dispatch)

    if auto and result.get("status") == "iterated":
        result["auto"] = True
        # In a real --auto loop the caller would re-invoke; for V1 we return
        # after one iteration and let the CLI loop handle continuation.

    return result


def _derive_state(scope: Scope, stream: EventStream) -> dict:
    """Derive project state from workspace. Never stored — always derived."""
    resolver = ContextResolver(scope.workspace_root)
    worker = _resolve_worker(scope)
    jobs = _scoped_jobs(scope, worker)

    if not jobs:
        return {"status": "nothing_to_do", "reason": "no jobs in scope"}

    total_delta = 0
    for job in jobs:
        pre = bind_fd(job, stream, resolver, scope.workspace_root)
        total_delta += pre.delta

    if total_delta == 0:
        return {"status": "converged"}

    return {"status": "in_progress", "delta": total_delta}


# ── internal helpers ──────────────────────────────────────────────────────────

def _resolve_worker(scope: Scope) -> Worker:
    """
    Resolve the worker for the given scope's build identity.

    V1: imports worker_claude_code from spec. The spec is always the authority.
    Raises RuntimeError if spec is not importable.
    """
    import sys
    # Ensure spec is findable relative to workspace_root
    spec_path = str(scope.workspace_root)
    if spec_path not in sys.path:
        sys.path.insert(0, spec_path)

    try:
        from spec.packages.genesis_core import worker_claude_code  # type: ignore[import]
        return worker_claude_code
    except ImportError as exc:
        raise RuntimeError(
            f"Cannot resolve worker for build {scope.build!r}: "
            f"spec.packages.genesis_core not importable from {scope.workspace_root}. "
            f"Original error: {exc}"
        ) from exc


def _scoped_jobs(scope: Scope, worker: Worker) -> list[Job]:
    """
    Return jobs from worker.can_execute, filtered by scope overrides.

    edge override: exact match on job.edge.name — narrows which jobs run.

    feature override (V1 behaviour): existence validation only.
      V1 has a single trajectory — Jobs are not tagged by feature_id.
      --feature REQ-F-CORE validates that feature exists in the workspace;
      it does not narrow which jobs run (all 5 jobs cover the single trajectory).
      Unknown feature ID → empty list (fails closed; caller reports error).
      Per-job feature routing is a V2 concern when multiple packages coexist.
    """
    jobs = list(worker.can_execute)

    if scope.feature:
        known = _known_feature_ids(scope.workspace_root)
        if scope.feature not in known:
            return []  # fail closed — unknown feature

    if scope.edge:
        jobs = [j for j in jobs if j.edge.name == scope.edge]

    return jobs


def _known_feature_ids(workspace_root: Path) -> set[str]:
    """Return feature IDs from YAML filenames in .ai-workspace/features/."""
    features_dir = workspace_root / ".ai-workspace" / "features"
    ids: set[str] = set()
    for subdir in ("active", "completed"):
        d = features_dir / subdir
        if d.exists():
            ids.update(f.stem for f in d.glob("*.yml"))
    return ids
