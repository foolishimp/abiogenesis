# Validates: REQ-F-CORE-004
"""Tests for genesis.bind — bind_fd, bind_fp, select_relevant_contexts, render_delta."""
import pytest
from pathlib import Path

from gtl.core import (
    Asset, Context, Edge, Evaluator, Job, Operator,
    F_D, F_P, F_H,
)

from genesis.core import EventStream, ContextResolver, workspace_bootstrap
from genesis.bind import (
    bind_fd,
    bind_fp,
    render_delta,
    run_fd_evaluator,
    select_relevant_contexts,
)
from genesis.manifest import BoundJob, PrecomputedManifest


# ── Fixtures ──────────────────────────────────────────────────────────────────

def _make_simple_job(evaluators=None) -> Job:
    """Build a minimal Job for testing."""
    src = Asset(name="design", id_format="DES-{SEQ}")
    tgt = Asset(name="code", id_format="CODE-{SEQ}")
    op = Operator("claude_agent", F_P, "agent://claude/genesis")
    edge = Edge(name="design→code", source=src, target=tgt, using=[op])
    if evaluators is None:
        evaluators = [Evaluator("code_complete", F_P, "Agent: code implements spec")]
    return Job(edge=edge, evaluators=evaluators)


def _make_stream(tmp_path: Path) -> EventStream:
    f = tmp_path / "events.jsonl"
    f.touch()
    return EventStream(f)


# ── run_fd_evaluator ──────────────────────────────────────────────────────────

class TestRunFdEvaluator:
    def test_non_fd_raises(self, tmp_path):
        ev = Evaluator("x", F_P, "desc")
        with pytest.raises(TypeError):
            run_fd_evaluator(ev, {}, tmp_path)

    def test_no_command_fails_closed(self, tmp_path):
        """H1: F_D evaluator with no command must fail closed, not pass."""
        ev = Evaluator("unknown_check", F_D, "desc")  # command="" by default
        passes, detail = run_fd_evaluator(ev, {}, tmp_path)
        assert passes is False
        assert "no command" in detail["reason"]

    def test_passing_command_returns_true(self, tmp_path):
        ev = Evaluator("always_pass", F_D, "always passes", command="python -c 'import sys; sys.exit(0)'")
        passes, detail = run_fd_evaluator(ev, {}, tmp_path)
        assert passes is True
        assert detail["returncode"] == 0

    def test_failing_command_returns_false(self, tmp_path):
        ev = Evaluator("always_fail", F_D, "always fails", command="python -c 'import sys; sys.exit(1)'")
        passes, detail = run_fd_evaluator(ev, {}, tmp_path)
        assert passes is False
        assert detail["returncode"] == 1

    def test_stdout_captured(self, tmp_path):
        ev = Evaluator("with_output", F_D, "prints something", command="python -c 'print(\"hello\")'")
        passes, detail = run_fd_evaluator(ev, {}, tmp_path)
        assert passes is True
        assert "hello" in detail["stdout"]

    def test_installed_packages_importable_in_subprocess(self, tmp_path):
        """genesis and gtl are importable in subprocess via the installed distribution."""
        ev = Evaluator("import_check", F_D, "installed packages importable",
                       command="python -c 'import genesis; import gtl; import sys; sys.exit(0)'")
        passes, detail = run_fd_evaluator(ev, {}, tmp_path)
        assert passes is True, detail


# ── bind_fd ───────────────────────────────────────────────────────────────────

class TestBindFd:
    def test_returns_precomputed_manifest(self, tmp_path):
        stream = _make_stream(tmp_path)
        resolver = ContextResolver(tmp_path)
        job = _make_simple_job()
        pre = bind_fd(job, stream, resolver, tmp_path)
        assert isinstance(pre, PrecomputedManifest)

    def test_fp_evaluator_always_fails(self, tmp_path):
        """F_P evaluators are always in failing list at bind_fd time."""
        stream = _make_stream(tmp_path)
        resolver = ContextResolver(tmp_path)
        job = _make_simple_job([Evaluator("fp_eval", F_P, "needs LLM")])
        pre = bind_fd(job, stream, resolver, tmp_path)
        assert any(ev.name == "fp_eval" for ev in pre.failing_evaluators)
        assert not any(ev.name == "fp_eval" for ev in pre.passing_evaluators)

    def test_fh_evaluator_passes_with_review_approved(self, tmp_path):
        stream = _make_stream(tmp_path)
        stream.append("review_approved", {"edge": "design→code", "actor": "human"})
        resolver = ContextResolver(tmp_path)
        job = _make_simple_job([Evaluator("design_approved", F_H, "human gate")])
        pre = bind_fd(job, stream, resolver, tmp_path)
        assert any(ev.name == "design_approved" for ev in pre.passing_evaluators)

    def test_fh_evaluator_fails_without_review(self, tmp_path):
        stream = _make_stream(tmp_path)
        resolver = ContextResolver(tmp_path)
        job = _make_simple_job([Evaluator("design_approved", F_H, "human gate")])
        pre = bind_fd(job, stream, resolver, tmp_path)
        assert any(ev.name == "design_approved" for ev in pre.failing_evaluators)

    def test_delta_summary_present(self, tmp_path):
        stream = _make_stream(tmp_path)
        resolver = ContextResolver(tmp_path)
        job = _make_simple_job()
        pre = bind_fd(job, stream, resolver, tmp_path)
        assert pre.delta_summary  # non-empty string

    def test_has_gap_true_when_failing(self, tmp_path):
        stream = _make_stream(tmp_path)
        resolver = ContextResolver(tmp_path)
        job = _make_simple_job([Evaluator("fp", F_P, "needs LLM")])
        pre = bind_fd(job, stream, resolver, tmp_path)
        assert pre.has_gap is True


# ── bind_fp ───────────────────────────────────────────────────────────────────

class TestBindFp:
    def _make_pre(self, tmp_path: Path) -> PrecomputedManifest:
        stream = _make_stream(tmp_path)
        resolver = ContextResolver(tmp_path)
        job = _make_simple_job()
        return bind_fd(job, stream, resolver, tmp_path)

    def test_returns_bound_job(self, tmp_path):
        pre = self._make_pre(tmp_path)
        bound = bind_fp(pre, pre.job)
        assert isinstance(bound, BoundJob)

    def test_prompt_contains_invariants(self, tmp_path):
        pre = self._make_pre(tmp_path)
        bound = bind_fp(pre, pre.job)
        assert "INVARIANTS" in bound.prompt

    def test_prompt_contains_gap(self, tmp_path):
        pre = self._make_pre(tmp_path)
        bound = bind_fp(pre, pre.job)
        assert "GAP" in bound.prompt

    def test_prompt_contains_output_contract(self, tmp_path):
        pre = self._make_pre(tmp_path)
        bound = bind_fp(pre, pre.job)
        assert "OUTPUT CONTRACT" in bound.prompt

    def test_result_path_stored(self, tmp_path):
        pre = self._make_pre(tmp_path)
        bound = bind_fp(pre, pre.job, result_path="/tmp/result.json")
        assert bound.result_path == "/tmp/result.json"


# ── select_relevant_contexts ──────────────────────────────────────────────────

class TestSelectRelevantContexts:
    def _ctx(self, name: str) -> Context:
        return Context(name=name, locator="workspace://x", digest="sha256:" + "0" * 64)

    def test_empty_failing_returns_empty(self):
        """No evaluators failing → no context needed."""
        ctxs = [self._ctx("alpha"), self._ctx("beta")]
        result = select_relevant_contexts(ctxs, [])
        assert result == []

    def test_all_contexts_returned_when_any_failing(self):
        """Any failing evaluator → all edge contexts returned (domain-blind)."""
        ctxs = [self._ctx("alpha"), self._ctx("beta"), self._ctx("gamma")]
        failing = [Evaluator("check", F_P, "needs LLM")]
        result = select_relevant_contexts(ctxs, failing)
        assert len(result) == 3

    def test_fd_failing_also_returns_all_contexts(self):
        """F_D failing → all contexts returned, not a subset."""
        ctxs = [self._ctx("law"), self._ctx("config")]
        failing = [Evaluator("file_check", F_D, "file must exist", command="true")]
        result = select_relevant_contexts(ctxs, failing)
        assert len(result) == 2

    def test_fh_failing_returns_all_contexts(self):
        """F_H failing → all contexts returned."""
        ctxs = [self._ctx("criteria")]
        failing = [Evaluator("sign_off", F_H, "human approval")]
        result = select_relevant_contexts(ctxs, failing)
        assert len(result) == 1
        assert result[0].name == "criteria"

    def test_empty_contexts_returns_empty_list(self):
        """No edge contexts → empty list regardless of failing evaluators."""
        failing = [Evaluator("check", F_P, "needs LLM")]
        result = select_relevant_contexts([], failing)
        assert result == []


# ── render_delta ──────────────────────────────────────────────────────────────

class TestRenderDelta:
    def test_no_failing_returns_converged(self):
        result = render_delta({}, [])
        assert "delta = 0" in result
        assert "pass" in result

    def test_failing_listed(self):
        failing = [Evaluator("impl_tags", F_D, "check tags")]
        result = render_delta({"impl_tags": {"passes": False, "detail": {"untagged": []}}}, failing)
        assert "impl_tags" in result
        assert "delta = 1" in result
