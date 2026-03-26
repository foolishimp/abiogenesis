# Implements: REQ-R-ABG2-INTERPRET
# Implements: REQ-R-ABG2-BINDING
# Implements: REQ-R-ABG2-SELECTION-APPLICATION
"""
genesis.services — Named app services.

Orchestrates kernel modules into user-facing commands:
gen_gaps, gen_iterate, gen_start, Scope.

Three commands as named compositions of core functions. None introduce new
primitives. See ADR-004 (Scope).

  /gen-gaps    = bind_fd over scope → delta_summary fields
  /gen-iterate = bind one executable job → iterate exactly once
  /gen-start   = derive state → select job → bind → iterate
"""
from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Optional

from gtl.module_model import Module

from .binding import ExecutableJob, Worker, bind_fd, bind_fp, bind_fh, BoundJob, ContextResolver
from .convergence import delta
from .correction import find_latest_reset
from .events import EventStream
from .interpret import iterate, apply_selection
from .selection import enumerate_candidates, SelectionDecision
from .lineage import WorkInstance, _discover_children, active_work_keys, spawn
from .projection import project
from .provenance import req_hash, executable_job_hash, job_evaluator_hash, _read_workflow_version
from .run import find_pending_run


# ── module_to_executable_jobs — GTL Job → ExecutableJob resolution ────────────

def module_to_executable_jobs(module: Module) -> list[ExecutableJob]:
    """
    Resolve Module's GTL Jobs to ExecutableJobs.

    Each Job's ContractRef is resolved to the corresponding GraphVector by id.
    Module.jobs must be populated — no auto-derivation.
    """
    if not module.jobs:
        raise ValueError(
            f"Module {module.name!r} has no explicit jobs. "
            f"All modules must declare jobs with ContractRef bindings."
        )

    vec_by_id: dict[str, "GraphVector"] = {}
    for graph in module.graphs:
        for vec in graph.vectors:
            vec_by_id[vec.id] = vec

    executable_jobs: list[ExecutableJob] = []
    for gtl_job in module.jobs:
        for ref in gtl_job.contracts:
            if ref.kind != "graph_vector":
                raise ValueError(
                    f"Unsupported contract kind {ref.kind!r} in job {gtl_job.name!r}. "
                    f"This build supports 'graph_vector' only."
                )
            vec = vec_by_id.get(ref.target_id)
            if vec is None:
                raise ValueError(
                    f"ContractRef target_id {ref.target_id!r} in job {gtl_job.name!r} "
                    f"does not resolve to any GraphVector in the module."
                )
            executable_jobs.append(ExecutableJob(job=gtl_job, vector=vec))
    return executable_jobs


# ── Workflow provenance helpers ───────────────────────────────────────────────

def _read_carry_forward(scope: "Scope") -> list[dict]:
    """
    Read approved_carry_forward from the variant manifest.json.

    Path: {workflow_root}/{pkg}/{variant}/{version}/manifest.json
    where workflow "my_domain.standard@0.2.0" → pkg="my_domain",
    variant="standard", version="0.2.0".

    When scope.workflow_root is set (from genesis.yml runtime contract), it is
    used as the base directory. Otherwise falls back to .genesis/workflows/.

    Returns [] if workflow_version is "unknown", file absent, or key missing.
    """
    if scope.workflow_version == "unknown":
        return []
    workflow, version = scope.workflow_version.split("@", 1)
    parts = workflow.split(".", 1)
    pkg_name = parts[0]
    variant = parts[1] if len(parts) > 1 else "default"
    version_dir = "v" + version.replace(".", "_")
    if scope.workflow_root:
        wf_base = (scope.workspace_root / scope.workflow_root).resolve()
    else:
        wf_base = scope.workspace_root / ".genesis" / "workflows"
    manifest_path = (
        wf_base / pkg_name / variant / version_dir / "manifest.json"
    )
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        cf = data.get("approved_carry_forward", [])
        return cf if isinstance(cf, list) else []
    except Exception:
        return []


# ── Scope ─────────────────────────────────────────────────────────────────────

@dataclass
class Scope:
    """
    First-class scope object. Every command requires one. No ambient inference.

    Ambiguous scope fails closed — the command returns an error describing the
    available scopes rather than guessing. See ADR-004.

    module: Module — the authoritative entry point. ExecutableJobs and Worker are
        derived directly from Module via module_to_executable_jobs().

    workflow_version: derived at construction from active-workflow.json.
        "{workflow}@{version}" when file present and valid; "unknown" otherwise.
        When "unknown", provenance checks are bypassed.

    Build identifier is build-layer specific. This Claude Code build defaults to "claude_code".
    """
    module: Module = None
    workspace_root: Path = field(default_factory=lambda: Path("."))
    work_key_filter: Optional[str] = None   # work_key scope (CLI --feature normalizes here)
    edge_filter: Optional[str] = None       # edge name scope (CLI --edge normalizes here)
    build: str = "claude_code"
    worker: Optional[Worker] = None   # explicit worker; None = derived
    active_workflow_path: Optional[str] = None  # runtime contract: path to active-workflow.json
    workflow_root: Optional[str] = None         # runtime contract: base dir for workflow releases
    work_key: Optional[str] = None    # work identity (ADR-023); None = global scope
    run_id: Optional[str] = None      # attempt identity (ADR-023); None = global scope
    workflow_version: str = field(init=False, default="unknown")

    def __post_init__(self) -> None:
        if self.module is None:
            raise ValueError("Scope requires a Module.")

        # Derive Worker from Module's jobs/vectors
        # ADR-030 §5: single-worker build satisfies all declared roles
        if self.worker is None:
            jobs = module_to_executable_jobs(self.module)
            role_ids = tuple(r.id for r in self.module.roles)
            self.worker = Worker(id=self.build, can_execute=jobs, role_ids=role_ids)

        self.workflow_version = _read_workflow_version(
            self.workspace_root, self.active_workflow_path
        )


# ── work_key enumeration ────────────────────────────────────────────────────

# active_work_keys is re-exported from .lineage (imported above).


def _resolve_work_keys(scope: "Scope",
                       stream: Optional["EventStream"] = None) -> list[str]:
    """
    Determine active work_keys for this scope.

    Priority:
    1. scope.work_key set explicitly (CLI override) → [scope.work_key]
    2. scope.work_key_filter set (feature_id IS work_key) → [scope.work_key_filter]
    3. Enumerate from active feature vectors + spawned children
    4. Empty list → global scope (no work_key scoping)
    """
    if scope.work_key is not None:
        return [scope.work_key]
    if scope.work_key_filter is not None:
        return [scope.work_key_filter]
    return active_work_keys(scope.workspace_root, stream)


# ── gen_gaps — bind_fd over scope ─────────────────────────────────────────────

def gen_gaps(scope: Scope, stream: EventStream) -> dict:
    """
    /gen-gaps = bind_fd over selected jobs → return delta_summary fields.

    Requires explicit Scope — fails closed on ambiguity.
    Runs bind_fd only (no F_P dispatch).

    Returns: jobs considered, failing evaluators per job, total delta.
    """
    stream.workflow_version = scope.workflow_version
    resolver = ContextResolver(scope.workspace_root)
    worker = _resolve_worker(scope)
    jobs = _scoped_jobs(scope, worker)

    if not jobs:
        return {
            "status": "error",
            "reason": "no jobs in scope — check --feature and --edge flags",
        }

    # Pre-compute which (edge, work_key) tuples already have a well-formed certificate.
    # REQ-F-CMD-004: deduplication keyed on (edge, work_key).
    # ADR-026: certificates predating the latest applicable reset are stale —
    # they don't satisfy live convergence queries and must be re-earned.
    all_events = stream.all_events()
    certified_keys: set[tuple] = set()
    for e in all_events:
        if e.get("event_type") == "edge_converged" and e.get("data", {}).get("target"):
            ed = e["data"]
            cert_wk = ed.get("work_key")
            # ADR-026: check if this certificate predates the latest applicable reset
            reset = find_latest_reset(all_events, edge=ed.get("edge"), work_key=ed.get("work_key"))
            if reset and e.get("event_time", "") <= reset.get("event_time", ""):
                continue  # Stale certificate — shadowed by reset boundary
            certified_keys.add((ed["edge"], cert_wk))

    carry_forward = _read_carry_forward(scope)

    # Enumerate work_keys: explicit override, feature-derived, or global scope [None].
    work_keys = _resolve_work_keys(scope, stream)
    work_key_list = work_keys if work_keys else [None]

    results = []
    for job in jobs:
        if scope.workflow_version == "unknown":
            spec_hash = req_hash(scope.module.metadata.get("requirements", []))
        else:
            spec_hash = job_evaluator_hash(job)
        for wk in work_key_list:
            # Set stream identity for any events emitted under this work_key
            stream.work_key = wk
            # ADR-024 / REQ-F-TRAV-002: use schedule.delta() as the single
            # convergence function — not pre.delta (which is just failing evaluator count).
            d = delta(
                job, stream, scope.workspace_root,
                spec_hash=spec_hash,
                current_workflow_version=scope.workflow_version,
                carry_forward=carry_forward,
                work_key=wk,
            )
            # bind_fd still needed for evaluator-level detail in gap reports
            pre = bind_fd(
                job, stream, resolver, scope.workspace_root,
                spec_hash=spec_hash,
                current_workflow_version=scope.workflow_version,
                carry_forward=carry_forward,
                work_key=wk,
            )
            entry: dict = {
                "edge": job.vector.name,
                "delta": d,
                "failing": [ev.name for ev in pre.failing_evaluators],
                "passing": [ev.name for ev in pre.passing_evaluators],
                "delta_summary": pre.delta_summary,
            }
            if wk is not None:
                entry["work_key"] = wk
            results.append(entry)
            # Emit edge_converged when freshly confirmed delta=0 and not yet certified.
            # Idempotent: once a well-formed certificate exists in the log,
            # repeated gen_gaps calls over a converged workspace do not append duplicates.
            # ADR-026: uses schedule.delta() for convergence truth, not pre.delta.
            cert_key = wk if wk is not None else scope.work_key_filter
            if d == 0.0 and (job.vector.name, cert_key) not in certified_keys:
                cert: dict = {
                    "edge": job.vector.name,
                    "vector_id": job.vector.id,
                    "target": job.vector.target.name,
                    "work_key": wk or scope.work_key_filter,
                    "delta": 0,
                    "certified_by": "gen_gaps",
                }
                # ADR-027: run_id is auto-injected by EventStream if stream.run_id
                # is set. For gen_gaps, run_id may not be set — that's correct:
                # edge_converged from gen_gaps is a certification, not a run event.
                # run_state() should NOT require edge_converged to carry run_id —
                # convergence is derived from assessed events, not certificates.
                stream.append("edge_converged", cert)
                certified_keys.add((job.vector.name, cert_key))

    total_delta = sum(r["delta"] for r in results)
    scope_info: dict = {
        "package": scope.module.name,
        "work_key_filter": scope.work_key_filter,
        "edge_filter": scope.edge_filter,
        "build": scope.build,
    }
    if work_keys:
        scope_info["work_keys"] = work_keys
    return {
        "scope": scope_info,
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
    /gen-iterate = bind one executable job → iterate exactly once.

    The most important command to keep pure.
    One Job. One Asset. One iterate call.
    When work_keys are active, selects the first unconverged (job, work_key) pair.
    """
    stream.workflow_version = scope.workflow_version
    resolver = ContextResolver(scope.workspace_root)
    worker = _resolve_worker(scope)
    jobs = _scoped_jobs(scope, worker)

    if not jobs:
        return {"status": "nothing_to_do", "reason": "no jobs in scope"}

    carry_forward = _read_carry_forward(scope)

    # Enumerate work_keys: explicit override, feature-derived, or global scope [None].
    work_keys = _resolve_work_keys(scope, stream)
    work_key_list = work_keys if work_keys else [None]

    # Pre-compute selection topology from event stream (ADR-025).
    # refined_parents: work_keys that have children from prior selection — skip.
    # spawned_children: work_keys that were spawned — don't re-select them.
    all_events_snapshot = stream.all_events()
    refined_parents: set[str] = set()
    spawned_children: set[str] = set()
    for e in all_events_snapshot:
        if e.get("event_type") == "work_spawned":
            pk = e.get("data", {}).get("parent_key")
            ck = e.get("data", {}).get("child_key")
            if pk:
                refined_parents.add(pk)
            if ck:
                spawned_children.add(ck)

    # Build WorkInstances — the first-class dispatch unit (ADR-024).
    # Select the first unconverged instance in topological order.
    # Uses schedule.delta() for convergence — includes fold-back (REQ-F-FRAG-004).
    # Refined parents are skipped — their children are in
    # work_key_list and will be selected instead.
    selected_wi: WorkInstance | None = None
    selected_pre = None
    for job in jobs:
        # ADR-030 §5: conjunctive eligibility — skip jobs this worker cannot realize.
        if not scope.worker.is_eligible(job):
            continue
        if scope.workflow_version == "unknown":
            spec_hash = req_hash(scope.module.metadata.get("requirements", []))
        else:
            spec_hash = job_evaluator_hash(job)
        for wk in work_key_list:
            if wk is not None and wk in refined_parents:
                continue  # Delegate to children (fold-back)
            d = delta(
                job, stream, scope.workspace_root,
                spec_hash, scope.workflow_version,
                carry_forward, work_key=wk,
            )
            if d > 0:
                # Found unconverged work — get the full manifest for dispatch.
                pre = bind_fd(
                    job, stream, resolver, scope.workspace_root,
                    spec_hash=spec_hash,
                    current_workflow_version=scope.workflow_version,
                    carry_forward=carry_forward,
                    work_key=wk,
                )
                selected_wi = WorkInstance(executable_job=job, work_key=wk)
                selected_pre = pre
                break
        if selected_wi is not None:
            break

    if selected_wi is None:
        return {
            "status": "converged",
            "reason": "all jobs in scope have delta = 0",
        }

    # V2 REQ-R-ABG2-SELECTION-APPLICATION: check for GraphFunction candidates
    # before scheduling. services.py orchestrates — enumerate, decide, delegate.
    # interpret.apply_selection() owns validation, substitution, event emission
    # (per GTL_2_MODULE_DESIGN §4.4).
    # work_key is lineage metadata, not a precondition for lawful application.
    candidates = []
    if scope.module is not None:
        candidates = enumerate_candidates(scope.module, selected_wi.executable_job.vector.id)
    if (candidates
            and selected_wi.work_key not in spawned_children):
        # REQ-R-ABG2-SELECTION-APPLICATION-001: enumerate done above.
        # REQ-R-ABG2-SELECTION-APPLICATION-002: accept external selection.
        # Single-match auto-select; multi-match would require external input.
        candidate = candidates[0]
        decision = SelectionDecision(
            contract_id=selected_wi.executable_job.vector.id,
            work_key=selected_wi.work_key or "",
            graph_function=candidate.name,
            selected_by="auto",
            selection_mode="single_match" if len(candidates) == 1 else "first_of_many",
            rationale=f"{len(candidates)} candidate(s) enumerated",
        )

        # Delegate to interpret — owns validation, substitute(), event emission.
        sel_result = apply_selection(
            scope.module, selected_wi.executable_job.vector.id, decision, candidate,
        )

        # Persist substituted topology: rebuild Module with the new graph,
        # then rebuild Jobs so subsequent iterations see the refined topology.
        # REQ-L-GTL2-IDENTITY-007: target by graph .id, not .name.
        # The containing graph's id is preserved through apply_selection
        # (it finds the graph, then substitute() creates a new graph).
        # We match the original containing graph by id and replace it.
        containing_graph_id = sel_result.containing_graph_id
        updated_graphs = tuple(
            sel_result.substituted_graph if g.id == containing_graph_id else g
            for g in scope.module.graphs
        )
        # Rebuild jobs: keep jobs whose vectors survive; create new jobs
        # for vectors introduced by the substitution.
        from gtl.work_model import Job as GtlJob, ContractRef
        old_vec_ids = {vec.id for g in scope.module.graphs for vec in g.vectors}
        new_vec_ids = {vec.id for g in updated_graphs for vec in g.vectors}
        surviving_jobs = tuple(
            j for j in scope.module.jobs
            if any(ref.target_id in new_vec_ids for ref in j.contracts)
        )
        added_vec_ids = new_vec_ids - old_vec_ids
        # ADR-030: synthesized jobs inherit the parent job's roles.
        # The parent is the job that was selected for refinement.
        parent_roles = selected_wi.executable_job.job.roles
        new_jobs = tuple(
            GtlJob(
                name=vec.name,
                contracts=(ContractRef(kind="graph_vector", target_id=vec.id),),
                roles=parent_roles,
            )
            for g in updated_graphs for vec in g.vectors
            if vec.id in added_vec_ids and vec.evaluators
        )
        updated_module = Module(
            name=scope.module.name,
            graphs=updated_graphs,
            graph_functions=scope.module.graph_functions,
            jobs=surviving_jobs + new_jobs,
            roles=scope.module.roles,
            operators=scope.module.operators,
            evaluators=scope.module.evaluators,
            rules=scope.module.rules,
            imports=scope.module.imports,
            metadata=scope.module.metadata,
        )
        scope.module = updated_module
        # Re-derive worker from updated module topology
        jobs = module_to_executable_jobs(updated_module)
        role_ids = tuple(r.id for r in updated_module.roles)
        scope.worker = Worker(id=scope.build, can_execute=jobs, role_ids=role_ids)

        # Emit events from interpret
        for event in sel_result.events:
            stream.append(event["event_type"], event["data"])

        # Spawn children from the inner graph vectors
        contract_edge = selected_wi.executable_job.vector.name
        for vec_name in sel_result.inner_vectors:
            if selected_wi.work_key is not None:
                child_key = spawn(selected_wi.work_key, vec_name)
            else:
                # No parent lineage — composite key includes the contract
                # edge as site discriminator so that the same graph_function
                # applied at two different edges produces distinct child keys.
                child_key = f"{contract_edge}/{sel_result.graph_function}/{vec_name}"
            stream.append("work_spawned", {
                "parent_key": selected_wi.work_key or "",
                "child_key": child_key,
                "graph_function": sel_result.graph_function,
            })

        return {
            "status": "selected",
            "edge": selected_wi.executable_job.vector.name,
            "graph_function": sel_result.graph_function,
            "children_spawned": len(sel_result.inner_vectors),
            "reason": (
                f"Edge {selected_wi.executable_job.vector.name!r} refined via "
                f"GraphFunction {sel_result.graph_function!r}. Re-enter to dispatch children."
            ),
        }

    # Generate run_id for this attempt (REQ-F-WK-002)
    run_id = scope.run_id or str(uuid.uuid4())

    # Bind stream identity for events emitted during this iteration
    stream.work_key = selected_wi.work_key
    stream.run_id = run_id

    # Determine result_path for F_P actor output (written before bind_fp)
    from gtl.operator_model import F_D as _F_D, F_P as _F_P, F_H as _F_H
    fd_failing = [ev for ev in selected_pre.failing_evaluators if ev.regime is _F_D]
    fp_failing = [ev for ev in selected_pre.failing_evaluators if ev.regime is _F_P]
    fh_failing = [ev for ev in selected_pre.failing_evaluators if ev.regime is _F_H]

    # REQ-F-GATE-002 (ADR-021): F_D findings escalate to F_P — no early return.
    # The fd_gap early return was removed. iterate() now emits both
    # found{kind: fd_findings} and fp_dispatched when F_D and F_P are both failing.

    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    edge_slug = selected_wi.executable_job.vector.name.replace("→", "_").replace("↔", "_")
    manifest_id = f"{edge_slug}_{ts}"

    # ADR-027 REQ-F-RUN-003: waiter deduplication — at most one run in
    # dispatched/started state per (edge, work_key). Uses find_pending_run()
    # which replays full run lifecycle instead of the manifest_id fluent.
    if fp_failing:
        pending = find_pending_run(
            stream.all_events(), selected_wi.executable_job.vector.name,
            work_key=selected_wi.work_key,
        )
        if pending is not None:
            return {
                "status": "pending",
                "reason": f"F_P dispatch already in flight for edge {selected_wi.executable_job.vector.name!r}",
                "pending_run_id": pending.run_id,
                "edge": selected_wi.executable_job.vector.name,
            }

    result_path = ""
    if fp_failing:
        fp_results_dir = scope.workspace_root / ".ai-workspace" / "fp_results"
        fp_results_dir.mkdir(parents=True, exist_ok=True)
        result_path = str(fp_results_dir / f"{manifest_id}.json")

    # ADR-030 §10: emit run_bound as the authoritative binding event.
    # run_bound is emitted after worker-role compatibility is validated
    # and before lifecycle commencement. It is NOT a lifecycle state.
    run_bound_data: dict = {
        "edge": selected_wi.executable_job.vector.name,
        "vector_id": selected_wi.executable_job.vector.id,
        "run_id": run_id,
        "job_id": selected_wi.executable_job.job.id,
        "worker_id": scope.worker.id,
    }
    if selected_wi.executable_job.job.roles:
        run_bound_data["role_id"] = selected_wi.executable_job.job.roles[0].id
    if scope.worker.authority_ref:
        run_bound_data["authority_ref"] = scope.worker.authority_ref
    if selected_wi.work_key is not None:
        run_bound_data["work_key"] = selected_wi.work_key
    stream.append("run_bound", run_bound_data)

    # ADR-027 REQ-F-RUN-001: emit run_started lifecycle event.
    # This marks the beginning of execution for an already-bound run.
    run_started_data: dict = {
        "edge": selected_wi.executable_job.vector.name,
        "vector_id": selected_wi.executable_job.vector.id,
        "run_id": run_id,
        "job_id": selected_wi.executable_job.job.id,
        "worker_id": scope.worker.id,
    }
    if selected_wi.work_key is not None:
        run_started_data["work_key"] = selected_wi.work_key
    stream.append("run_started", run_started_data)

    # Bind + iterate
    bound = bind_fp(selected_pre, selected_wi.executable_job, result_path=result_path)
    bound.manifest_id = manifest_id
    # REQ-F-CORE-001: include target so project() "current" projection can filter
    # edge_started to only the asset type being produced by this edge.
    edge_started_data: dict = {
        "edge": selected_wi.executable_job.vector.name,
        "vector_id": selected_wi.executable_job.vector.id,
        "build": scope.build,
        "target": selected_wi.executable_job.vector.target.name,
    }
    if selected_wi.work_key is not None:
        edge_started_data["work_key"] = selected_wi.work_key
    stream.append("edge_started", edge_started_data)

    surface = iterate(bound, on_fp_dispatch=on_fp_dispatch, run_id=run_id)

    # Emit surface events
    for event in surface.events:
        stream.append(event["event_type"], event["data"])

    result: dict = {
        "status": "iterated",
        "edge": selected_wi.executable_job.vector.name,
        "delta_before": selected_pre.delta,
        "failing_evaluators": [ev.name for ev in selected_pre.failing_evaluators],
        "events_emitted": len(surface.events) + 3,  # +3 for run_bound + run_started + edge_started
        "prompt_words": len(bound.prompt.split()),
        "surface_artifacts": surface.artifacts,
        "context_consumed": [c.name for c in surface.context_consumed],
        "run_id": run_id,
    }
    if selected_wi.work_key is not None:
        result["work_key"] = selected_wi.work_key

    # Write F_P manifest to disk when F_P dispatch is needed.
    # The manifest JSON is the authoritative F_P dispatch contract.
    # Any conforming transport (Claude Code, API, Codex) must be able to
    # execute from this JSON alone — CLAUDE.md is convenience, not authority.
    if fp_failing:
        manifests_dir = scope.workspace_root / ".ai-workspace" / "fp_manifests"
        manifests_dir.mkdir(parents=True, exist_ok=True)
        manifest_file = manifests_dir / f"{manifest_id}.json"

        # Source asset(s) — handle product arrows (A × B)
        src = selected_wi.executable_job.vector.source
        if isinstance(src, tuple):
            source_asset = [a.name for a in src]
            source_markov = {a.name: a.markov for a in src}
        else:
            source_asset = src.name
            source_markov = {src.name: src.markov}

        # Context references with locator + digest + resolved content
        contexts = []
        for ctx in selected_wi.executable_job.vector.contexts:
            ctx_entry: dict = {
                "name": ctx.name,
                "locator": ctx.locator,
                "digest": ctx.digest,
            }
            if ctx.name in selected_pre.relevant_contexts:
                ctx_entry["content"] = selected_pre.relevant_contexts[ctx.name]
            contexts.append(ctx_entry)

        manifest: dict = {
            "manifest_id": manifest_id,
            "edge": selected_wi.executable_job.vector.name,
            "source_asset": source_asset,
            "target_asset": selected_wi.executable_job.vector.target.name,
            "source_markov": source_markov,
            "target_markov": selected_wi.executable_job.vector.target.markov,
            "failing_evaluators": [
                {"name": ev.name, "regime": ev.regime.__name__,
                 "description": ev.description}
                for ev in fp_failing
            ],
            "fd_results": selected_pre.fd_results,
            "delta": selected_pre.delta,
            "delta_summary": selected_pre.delta_summary,
            "contexts": contexts,
            "current_asset": selected_pre.current_asset,
            "prompt": bound.prompt,
            "result_path": result_path,
            "spec_hash": spec_hash,
            "requirements": scope.module.metadata.get("requirements", []),
            "run_id": run_id,
        }
        if selected_wi.work_key is not None:
            manifest["work_key"] = selected_wi.work_key
        manifest_file.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        result["fp_manifest_path"] = str(manifest_file)

    # Include F_H gate criteria so skill can evaluate without extra reads.
    if fh_failing:
        result["fh_gate"] = {
            "edge": selected_wi.executable_job.vector.name,
            "evaluators": [ev.name for ev in fh_failing],
            "criteria": [ev.description for ev in fh_failing],
        }

    return result


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
        _close_completed_features(scope)
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
    if not auto:
        return gen_iterate(scope, stream, on_fp_dispatch=on_fp_dispatch)

    # --auto: loop until converged, F_H gate, F_P dispatch, or max iterations.
    # Stop immediately on F_P dispatch (need actor response) or F_H gate (need human).
    MAX_AUTO = 50
    last_event_count = len(stream.all_events())
    result: dict = {}

    for _ in range(MAX_AUTO):
        result = gen_iterate(scope, stream, on_fp_dispatch=on_fp_dispatch)
        result["auto"] = True

        if result["status"] in ("converged", "nothing_to_do", "pending"):
            return result

        # Inspect events emitted by this iteration
        new_events = stream.all_events()[last_event_count:]
        last_event_count += len(new_events)

        # Stop on any condition that cannot auto-resolve without external input.
        new_types = {e["event_type"] for e in new_events}
        if "fp_dispatched" in new_types:
            result["stopped_by"] = "fp_dispatch"
            return result
        if "fh_gate_pending" in new_types:
            result["stopped_by"] = "fh_gate"
            return result
        # REQ-F-GATE-002 (ADR-021): only terminal fd_gap stops the loop.
        # fd_findings (escalation) accompanies fp_dispatched which stops above.
        if any(e["event_type"] == "found" and e.get("data", {}).get("kind") == "fd_gap"
               for e in new_events):
            result["stopped_by"] = "fd_gap"
            return result

    result["stopped_by"] = "max_iterations"
    return result


def _derive_state(scope: Scope, stream: EventStream) -> dict:
    """
    Derive project state from workspace. Never stored — always derived.

    Uses schedule.delta() for convergence checking — this includes fold-back
    for work_keys with spawned children (REQ-F-FRAG-004).
    """
    worker = _resolve_worker(scope)
    jobs = _scoped_jobs(scope, worker)

    if not jobs:
        return {"status": "nothing_to_do", "reason": "no jobs in scope"}

    carry_forward = _read_carry_forward(scope)

    # Enumerate work_keys: explicit override, feature-derived, or global scope [None].
    work_keys = _resolve_work_keys(scope, stream)
    work_key_list = work_keys if work_keys else [None]

    # Build WorkInstances — the first-class dispatch unit (ADR-024).
    instances = [
        WorkInstance(executable_job=job, work_key=wk)
        for job in jobs
        for wk in work_key_list
    ]

    total_delta = 0.0
    for wi in instances:
        if scope.workflow_version == "unknown":
            spec_hash = req_hash(scope.module.metadata.get("requirements", []))
        else:
            spec_hash = executable_job_hash(wi.executable_job)
        d = delta(
            wi.executable_job, stream, scope.workspace_root,
            spec_hash, scope.workflow_version,
            carry_forward, work_key=wi.work_key,
        )
        total_delta += d

    if total_delta == 0:
        return {"status": "converged"}

    return {"status": "in_progress", "delta": total_delta}


# ── internal helpers ──────────────────────────────────────────────────────────

def _resolve_worker(scope: Scope) -> Worker:
    """
    Resolve the worker for the given scope.

    Domain-blind: scope.worker must be explicitly supplied by the caller.
    The CLI resolves worker from --worker flag or .genesis/genesis.yml.
    """
    if scope.worker is None:
        raise RuntimeError(
            "scope.worker is None — supply worker via Scope(worker=...) "
            "or configure .genesis/genesis.yml (written by gen-install.py)"
        )
    return scope.worker


def _scoped_jobs(scope: Scope, worker: Worker) -> list[Job]:
    """
    Return jobs from worker.can_execute, filtered by scope overrides.

    edge override: exact match on job.vector.name — narrows which jobs run.

    feature override: existence validation only.
      Single-trajectory scope — Jobs are not tagged by feature_id.
      --feature REQ-F-CORE validates that feature exists in the workspace;
      it does not narrow which jobs run (all jobs cover the single trajectory).
      Unknown feature ID → empty list (fails closed; caller reports error).
    """
    jobs = list(worker.can_execute)

    if scope.work_key_filter:
        known = _known_feature_ids(scope.workspace_root)
        if scope.work_key_filter not in known:
            return []  # fail closed — unknown feature

    if scope.edge_filter:
        jobs = [j for j in jobs if j.vector.name == scope.edge_filter]

    return jobs


def _close_completed_features(scope: Scope) -> None:
    """
    Move all active feature YAMLs to features/completed/ and update status field.

    Called by gen_start when it arrives and finds all edges have delta=0 — the
    worker came back, found the work done, closes the ticket.
    """
    active_dir = scope.workspace_root / ".ai-workspace" / "features" / "active"
    completed_dir = scope.workspace_root / ".ai-workspace" / "features" / "completed"
    completed_dir.mkdir(parents=True, exist_ok=True)

    if not active_dir.exists():
        return

    for yml in sorted(active_dir.glob("*.yml")):
        text = yml.read_text(encoding="utf-8")
        # Update status field regardless of current value
        for old_status in ("status: not_started", "status: active", "status: iterating"):
            if old_status in text:
                text = text.replace(old_status, "status: completed", 1)
                break
        (completed_dir / yml.name).write_text(text, encoding="utf-8")
        yml.unlink()


def _known_feature_ids(workspace_root: Path) -> set[str]:
    """Return feature IDs from YAML filenames in .ai-workspace/features/."""
    features_dir = workspace_root / ".ai-workspace" / "features"
    ids: set[str] = set()
    for subdir in ("active", "completed"):
        d = features_dir / subdir
        if d.exists():
            ids.update(f.stem for f in d.glob("*.yml"))
    return ids
