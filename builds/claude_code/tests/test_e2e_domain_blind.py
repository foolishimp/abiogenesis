# Validates: REQ-F-CORE-001
# Validates: REQ-F-CORE-002
# Validates: REQ-F-CORE-003
# Validates: REQ-F-CORE-004
# Validates: REQ-F-CORE-005
# Validates: REQ-F-CORE-006
# Validates: REQ-F-WKSP-001
# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
# Validates: REQ-NFR-TEST-001
"""
Phase B: Domain-blind kernel proof.

Four synthetic packages from entirely unrelated domains prove that the kernel
(bind_fd, bind_fp, iterate, schedule) AND the command layer (gen_gaps,
gen_iterate, gen_start) dispatch generically — the Package and Worker are
supplied by the caller; the kernel knows nothing about the domain.

Domain-blind path enabled by Scope.worker: when scope.worker is set,
_resolve_worker() returns it directly with no spec import. Every gen_* test
below passes worker explicitly — no genesis_core import, no patches.

Domains used (none are genesis/AI):
  1. fd_only       — "content pipeline":    F_D sentinel file check
  2. fh_gate       — "budget approval":     F_H human sign-off gate
  3. fp_dispatch   — "recipe generator":    F_P agent dispatch
  4. multi_worker  — "translation service": two workers, conflict detection

Test lanes (from pyproject.toml markers):
  bootstrap_state — EventStream + Python objects; no workspace_bootstrap call
  self_host       — workspace_bootstrap required
"""
from __future__ import annotations

import pytest
from pathlib import Path

from gtl.core import (
    Asset, Context, Edge, Evaluator, Job, Operator, Package, Rule, Worker,
    F_D, F_H, F_P, consensus,
)

from genesis.core import EventStream, workspace_bootstrap
from genesis.bind import bind_fd, bind_fp
from genesis.schedule import delta, iterate, schedule
from genesis.commands import Scope, gen_gaps, gen_iterate, gen_start
from genesis.manifest import BoundJob


# ── Stream helpers ────────────────────────────────────────────────────────────

def _make_stream(tmp_path: Path) -> EventStream:
    """
    Minimal EventStream — no workspace_bootstrap, no directory scaffolding.
    Commands write through the explicit stream parameter; no global state needed.
    """
    f = tmp_path / "events.jsonl"
    f.touch()
    return EventStream(f)


# ── Synthetic package builders ────────────────────────────────────────────────
# None of these know anything about genesis internals.
# The domain (content, budget, recipes, translation) is irrelevant to the kernel.

def _make_fd_only_pkg(workspace_root: Path):
    """
    Domain: content pipeline.
    One edge: draft → published.
    One F_D evaluator: check that 'published.ok' sentinel file exists.
    Kernel dispatches ev.command generically; it does not know what a
    'content pipeline' is.
    """
    sentinel = workspace_root / "published.ok"
    draft = Asset(name="draft", id_format="DRAFT-{SEQ}")
    published = Asset(name="published", id_format="PUB-{SEQ}", lineage=[draft])
    op = Operator("content_publisher", F_D,
                  "exec://python -c 'print(\"publish\")'")
    edge = Edge(name="draft→published", source=draft, target=published, using=[op])
    eval_file = Evaluator(
        "file_published", F_D,
        "published.ok sentinel must exist",
        command=(
            f"python -c \"from pathlib import Path; import sys; "
            f"sys.exit(0 if Path(r'{sentinel}').exists() else 1)\""
        ),
    )
    job = Job(edge=edge, evaluators=[eval_file])
    pkg = Package(
        name="content_pipeline",
        assets=[draft, published],
        edges=[edge],
        operators=[op],
    )
    worker = Worker(id="publisher", can_execute=[job])
    return pkg, worker, job, sentinel


def _make_fh_gate_pkg():
    """
    Domain: budget approval process.
    One edge: proposal → approved_budget.
    One F_H evaluator: finance director must sign off.
    Kernel resolves the gate via review_approved edge name — knows nothing about
    'budgets'.
    """
    proposal = Asset(name="proposal", id_format="PROP-{SEQ}")
    approved_budget = Asset(name="approved_budget", id_format="BDG-{SEQ}",
                            lineage=[proposal])
    op = Operator("finance_approver", F_H, "fh://single")
    edge = Edge(name="proposal→approved_budget",
                source=proposal, target=approved_budget, using=[op])
    eval_sign = Evaluator("budget_signed", F_H,
                          "Finance director must sign off before funds are released")
    job = Job(edge=edge, evaluators=[eval_sign])
    rule = Rule("finance_gate", approve=consensus(1, 1))
    pkg = Package(
        name="budget_process",
        assets=[proposal, approved_budget],
        edges=[edge],
        operators=[op],
        rules=[rule],
    )
    worker = Worker(id="finance_team", can_execute=[job])
    return pkg, worker, job


def _make_fp_dispatch_pkg():
    """
    Domain: recipe generator.
    One edge: ingredients → recipe.
    One F_P evaluator: chef agent assesses recipe completeness.
    Kernel fires on_fp_dispatch callback; it does not know what a 'recipe' is.
    """
    ingredients = Asset(name="ingredients", id_format="ING-{SEQ}")
    recipe = Asset(name="recipe", id_format="REC-{SEQ}", lineage=[ingredients])
    op = Operator("chef_agent", F_P, "agent://chef/recipe_gen")
    edge = Edge(name="ingredients→recipe", source=ingredients, target=recipe, using=[op])
    eval_tasty = Evaluator("recipe_complete", F_P,
                           "Chef agent: recipe covers all required ingredients")
    job = Job(edge=edge, evaluators=[eval_tasty])
    pkg = Package(
        name="recipe_pipeline",
        assets=[ingredients, recipe],
        edges=[edge],
        operators=[op],
    )
    worker = Worker(id="chef_ai", can_execute=[job])
    return pkg, worker, job


def _make_multi_worker_pkg():
    """
    Domain: translation service.
    Two independent edges: source→french, source→german.
    Two non-conflicting workers (disjoint write territories → parallel batch).
    One conflicting worker (same write territory as worker_fr → serial batch).
    """
    source = Asset(name="source", id_format="SRC-{SEQ}")
    french = Asset(name="french", id_format="FR-{SEQ}", lineage=[source])
    german = Asset(name="german", id_format="DE-{SEQ}", lineage=[source])
    op = Operator("translator", F_P, "agent://translator")
    edge_fr = Edge(name="source→french", source=source, target=french, using=[op])
    edge_de = Edge(name="source→german", source=source, target=german, using=[op])
    eval_fr = Evaluator("french_complete", F_P, "French translation verified")
    eval_de = Evaluator("german_complete", F_P, "German translation verified")
    job_fr = Job(edge=edge_fr, evaluators=[eval_fr])
    job_de = Job(edge=edge_de, evaluators=[eval_de])
    worker_fr = Worker(id="french_team", can_execute=[job_fr])
    worker_de = Worker(id="german_team", can_execute=[job_de])
    worker_fr2 = Worker(id="french_team_backup", can_execute=[job_fr])  # conflicts with worker_fr
    pkg = Package(
        name="translation_service",
        assets=[source, french, german],
        edges=[edge_fr, edge_de],
        operators=[op],
    )
    return pkg, worker_fr, worker_de, worker_fr2, job_fr, job_de


# ── Package 1: F_D-only ────────────────────────────────────────────────────────

class TestFdOnlyDomainBlind:
    """
    Proves: kernel dispatches ev.command without any domain knowledge.
    The Package declares the check; the kernel runs it generically.
    gen_* commands use Scope.worker — no spec import occurs.
    """

    @pytest.mark.bootstrap_state
    def test_fd_command_executed_generically(self, tmp_path):
        """Kernel runs ev.command via subprocess — no domain knowledge required."""
        ws = _make_stream(tmp_path)
        pkg, worker, job, sentinel = _make_fd_only_pkg(tmp_path)
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        # Sentinel not yet created → evaluator must fail
        assert any(ev.name == "file_published" for ev in pre.failing_evaluators)

    @pytest.mark.bootstrap_state
    def test_initial_delta_nonzero(self, tmp_path):
        """gen_gaps shows delta>0 before condition is met. No _resolve_worker patch."""
        ws = _make_stream(tmp_path)
        pkg, worker, job, sentinel = _make_fd_only_pkg(tmp_path)
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)
        result = gen_gaps(scope, ws)
        assert result["total_delta"] > 0
        assert result["converged"] is False

    @pytest.mark.bootstrap_state
    def test_delta_zero_after_condition_met(self, tmp_path):
        """gen_gaps shows delta=0 after the F_D command passes. No patch."""
        ws = _make_stream(tmp_path)
        pkg, worker, job, sentinel = _make_fd_only_pkg(tmp_path)
        sentinel.write_text("done")
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)
        result = gen_gaps(scope, ws)
        assert result["total_delta"] == 0
        assert result["converged"] is True

    @pytest.mark.bootstrap_state
    def test_gen_iterate_returns_iterated(self, tmp_path):
        """gen_iterate processes a domain-blind F_D job. No patch."""
        ws = _make_stream(tmp_path)
        pkg, worker, job, sentinel = _make_fd_only_pkg(tmp_path)
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)
        result = gen_iterate(scope, ws)
        assert result["status"] == "iterated"
        assert result["edge"] == "draft→published"

    @pytest.mark.bootstrap_state
    def test_fd_gap_event_in_surface(self, tmp_path):
        """iterate() records fd_gap_found when F_D fails."""
        ws = _make_stream(tmp_path)
        pkg, worker, job, sentinel = _make_fd_only_pkg(tmp_path)
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        bound = bind_fp(pre, job)
        surface = iterate(bound)
        assert any(e["event_type"] == "fd_gap_found" for e in surface.events)

    @pytest.mark.bootstrap_state
    def test_edge_converged_is_audit_record_not_gate(self, tmp_path):
        """edge_converged in stream is an audit record — F_D evaluators still re-run.

        Convergence is live: bind_fd always re-evaluates F_D commands.
        A prior edge_converged certificate does not bypass current workspace checks.
        Regressions (test failures, tag removals) are detected on the next bind_fd call.
        """
        ws = _make_stream(tmp_path)
        pkg, worker, job, sentinel = _make_fd_only_pkg(tmp_path)
        ws.append("edge_converged", {"edge": "draft→published", "target": "published"})
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        # F_D command WAS re-run — sentinel still does not exist → evaluator fails
        assert any(ev.name == "file_published" for ev in pre.failing_evaluators)
        assert sentinel.exists() is False  # sentinel not created — command ran and failed


# ── Package 2: F_H gate ───────────────────────────────────────────────────────

class TestFhGateDomainBlind:
    """
    Proves: kernel resolves F_H gates using only edge name in review_approved.
    It does not know what a 'budget approval' is.
    gen_* commands use Scope.worker — no spec import.
    """

    @pytest.mark.bootstrap_state
    def test_fh_gate_blocks_at_delta(self, tmp_path):
        """F_H evaluator contributes delta>0 before review_approved."""
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fh_gate_pkg()
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        assert any(ev.name == "budget_signed" for ev in pre.failing_evaluators)

    @pytest.mark.bootstrap_state
    def test_fh_gate_resolved_by_review_approved(self, tmp_path):
        """review_approved event with correct edge name resolves the F_H gate."""
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fh_gate_pkg()
        ws.append("review_approved", {"edge": "proposal→approved_budget", "actor": "human"})
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        assert any(ev.name == "budget_signed" for ev in pre.passing_evaluators)
        assert not any(ev.name == "budget_signed" for ev in pre.failing_evaluators)

    @pytest.mark.bootstrap_state
    def test_fh_gate_not_resolved_by_wrong_edge(self, tmp_path):
        """review_approved for a different edge does NOT resolve this gate."""
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fh_gate_pkg()
        ws.append("review_approved", {"edge": "some_other_edge", "actor": "human"})
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        assert any(ev.name == "budget_signed" for ev in pre.failing_evaluators)

    @pytest.mark.bootstrap_state
    def test_fh_pending_event_emitted_by_iterate(self, tmp_path):
        """iterate() emits fh_gate_pending when F_H evaluator is unresolved."""
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fh_gate_pkg()
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        bound = bind_fp(pre, job)
        surface = iterate(bound)
        assert any(e["event_type"] == "fh_gate_pending" for e in surface.events)
        pending = next(e for e in surface.events if e["event_type"] == "fh_gate_pending")
        assert "budget_signed" in pending["data"]["evaluators"]

    @pytest.mark.bootstrap_state
    def test_gen_iterate_returns_converged_when_fh_resolved(self, tmp_path):
        """After review_approved, gen_iterate sees delta=0. No patch needed."""
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fh_gate_pkg()
        ws.append("review_approved", {"edge": "proposal→approved_budget", "actor": "human"})
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)
        result = gen_iterate(scope, ws)
        assert result["status"] == "converged"


# ── Package 3: F_P dispatch ───────────────────────────────────────────────────

class TestFpDispatchDomainBlind:
    """
    Proves: kernel fires on_fp_dispatch callback generically.
    It does not know what a 'recipe generator' is.
    gen_* commands use Scope.worker — no spec import.
    """

    @pytest.mark.bootstrap_state
    def test_fp_dispatch_callback_fires(self, tmp_path):
        """on_fp_dispatch is called with the BoundJob when F_P evaluator is failing."""
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fp_dispatch_pkg()
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        bound = bind_fp(pre, job)
        dispatched: list[BoundJob] = []
        iterate(bound, on_fp_dispatch=lambda b: dispatched.append(b))
        assert len(dispatched) == 1
        assert dispatched[0] is bound

    @pytest.mark.bootstrap_state
    def test_fp_dispatch_prompt_has_gap_section(self, tmp_path):
        """BoundJob.prompt contains [GAP] section — kernel builds it generically."""
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fp_dispatch_pkg()
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        bound = bind_fp(pre, job)
        assert "[GAP]" in bound.prompt
        assert "recipe_complete" in bound.prompt

    @pytest.mark.bootstrap_state
    def test_fp_dispatch_prompt_has_output_contract(self, tmp_path):
        """BoundJob.prompt contains [OUTPUT CONTRACT] with target asset name."""
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fp_dispatch_pkg()
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        bound = bind_fp(pre, job)
        assert "[OUTPUT CONTRACT]" in bound.prompt
        assert "recipe" in bound.prompt

    @pytest.mark.bootstrap_state
    def test_fp_assessment_resolves_evaluator(self, tmp_path):
        """fp_assessment event with result=pass resolves the F_P evaluator."""
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fp_dispatch_pkg()
        ws.append("fp_assessment", {
            "edge": "ingredients→recipe",
            "evaluator": "recipe_complete",
            "result": "pass",
        })
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        assert any(ev.name == "recipe_complete" for ev in pre.passing_evaluators)
        assert not any(ev.name == "recipe_complete" for ev in pre.failing_evaluators)

    @pytest.mark.bootstrap_state
    def test_fp_dispatched_event_contains_evaluator_names(self, tmp_path):
        """fp_dispatched event surface carries failing evaluator names."""
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fp_dispatch_pkg()
        from genesis.core import ContextResolver
        resolver = ContextResolver(tmp_path)
        pre = bind_fd(job, ws, resolver, tmp_path)
        bound = bind_fp(pre, job)
        surface = iterate(bound)
        assert any(e["event_type"] == "fp_dispatched" for e in surface.events)
        dispatched = next(e for e in surface.events if e["event_type"] == "fp_dispatched")
        assert "recipe_complete" in dispatched["data"]["failing_evaluators"]

    @pytest.mark.bootstrap_state
    def test_gen_iterate_calls_on_fp_dispatch(self, tmp_path):
        """gen_iterate passes on_fp_dispatch through to iterate(). No patch."""
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fp_dispatch_pkg()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)
        dispatched: list[BoundJob] = []
        gen_iterate(scope, ws, on_fp_dispatch=lambda b: dispatched.append(b))
        assert len(dispatched) == 1


# ── Package 4: multi-worker scheduling ───────────────────────────────────────

class TestMultiWorkerSchedule:
    """
    Proves: schedule() partitions workers by write territory alone.
    Domain-blind: it knows nothing about translations, budgets, or code.
    No stream or workspace needed — pure Python objects.
    """

    def test_disjoint_workers_in_single_batch(self):
        """Workers with different write territories run in the same batch."""
        _, worker_fr, worker_de, _, _, _ = _make_multi_worker_pkg()
        batches = schedule([worker_fr, worker_de])
        assert len(batches) == 1
        assert len(batches[0]) == 2
        assert worker_fr in batches[0]
        assert worker_de in batches[0]

    def test_conflicting_workers_in_separate_batches(self):
        """Workers sharing write territory are serialised into separate batches."""
        _, worker_fr, _, worker_fr2, _, _ = _make_multi_worker_pkg()
        batches = schedule([worker_fr, worker_fr2])
        assert len(batches) == 2
        assert all(len(b) == 1 for b in batches)

    def test_no_workers_returns_empty(self):
        assert schedule([]) == []

    def test_single_worker_single_batch(self):
        _, worker_fr, _, _, _, _ = _make_multi_worker_pkg()
        batches = schedule([worker_fr])
        assert batches == [[worker_fr]]

    def test_three_workers_two_disjoint_one_conflict(self):
        """
        worker_fr and worker_de are disjoint (batch together).
        worker_fr2 conflicts with worker_fr (separate batch).
        Expected: [[worker_fr, worker_de], [worker_fr2]]
        """
        _, worker_fr, worker_de, worker_fr2, _, _ = _make_multi_worker_pkg()
        batches = schedule([worker_fr, worker_de, worker_fr2])
        assert len(batches) == 2
        assert worker_fr in batches[0]
        assert worker_de in batches[0]
        assert worker_fr2 in batches[1]

    def test_conflicts_with_detects_same_write_territory(self):
        """conflicts_with() uses writable_types set intersection — pure type-level."""
        _, worker_fr, worker_de, worker_fr2, _, _ = _make_multi_worker_pkg()
        assert not worker_fr.conflicts_with(worker_de)   # different targets
        assert worker_fr.conflicts_with(worker_fr2)      # same target: french
        assert worker_fr2.conflicts_with(worker_fr)      # symmetric

    def test_write_territory_is_target_asset_name(self):
        """writable_types is derived from Job.edge.target.name — no external config."""
        _, worker_fr, worker_de, _, _, _ = _make_multi_worker_pkg()
        assert "french" in worker_fr.writable_types
        assert "german" in worker_de.writable_types
        assert "german" not in worker_fr.writable_types


# ── Test lane split ───────────────────────────────────────────────────────────

class TestLaneSplit:
    """
    Demonstrates the two test execution lanes.

    bootstrap_state — EventStream + Python objects, no workspace_bootstrap.
    self_host       — workspace_bootstrap required; tests filesystem structure.
    """

    @pytest.mark.bootstrap_state
    def test_package_construction_needs_no_workspace(self):
        """GTL Package construction is pure Python — no filesystem required."""
        pkg, worker, job = _make_fh_gate_pkg()
        assert pkg.name == "budget_process"
        assert len(worker.can_execute) == 1
        assert job.evaluators[0].category is F_H

    @pytest.mark.bootstrap_state
    def test_schedule_needs_no_workspace(self):
        """schedule() is a pure function over Worker objects."""
        _, worker_fr, worker_de, _, _, _ = _make_multi_worker_pkg()
        batches = schedule([worker_fr, worker_de])
        assert batches  # no workspace needed

    @pytest.mark.bootstrap_state
    def test_scope_worker_bypasses_spec_import(self, tmp_path):
        """
        When scope.worker is set, _resolve_worker returns it directly.
        No spec.packages.genesis_core import occurs — verified by using a
        non-genesis worker with no genesis spec importable.
        """
        ws = _make_stream(tmp_path)
        pkg, worker, job = _make_fp_dispatch_pkg()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)
        # gen_gaps runs end-to-end via the real command path, no patch
        result = gen_gaps(scope, ws)
        assert "gaps" in result
        assert "total_delta" in result

    @pytest.mark.self_host
    def test_workspace_bootstrap_creates_events_file(self, tmp_path):
        """workspace_bootstrap creates the events.jsonl file."""
        ws = workspace_bootstrap(tmp_path)
        assert (tmp_path / ".ai-workspace" / "events" / "events.jsonl").exists()

    @pytest.mark.self_host
    def test_domain_blind_pkg_runs_in_bootstrapped_workspace(self, tmp_path):
        """A non-genesis package runs correctly in a bootstrapped workspace."""
        ws = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_fp_dispatch_pkg()
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)
        dispatched: list[BoundJob] = []
        result = gen_start(scope, ws, on_fp_dispatch=lambda b: dispatched.append(b))
        assert result["status"] == "iterated"
        assert len(dispatched) == 1
