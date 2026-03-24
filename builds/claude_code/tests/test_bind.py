# Validates: REQ-F-CORE-004
# Validates: REQ-F-PROV-003
# Validates: REQ-F-PROV-004
# Validates: REQ-F-EC-002
# Validates: REQ-F-EC-003
# Validates: REQ-F-EC-004
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
    bind_fh,
    bind_fp,
    job_evaluator_hash,
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

    def test_fh_evaluator_passes_with_approved(self, tmp_path):
        stream = _make_stream(tmp_path)
        stream.append("approved", {"kind": "fh_review", "edge": "design→code", "actor": "human"})
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

    def test_prompt_contains_preconditions(self, tmp_path):
        pre = self._make_pre(tmp_path)
        bound = bind_fp(pre, pre.job)
        assert "PRECONDITIONS" in bound.prompt

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

    def test_fp_failing_returns_all_contexts(self):
        """F_P failing → all edge contexts returned (F_P actor needs constraint surface)."""
        ctxs = [self._ctx("alpha"), self._ctx("beta"), self._ctx("gamma")]
        failing = [Evaluator("check", F_P, "needs LLM")]
        result = select_relevant_contexts(ctxs, failing)
        assert len(result) == 3

    def test_fd_only_failing_returns_empty(self):
        """F_D-only failure → no contexts (F_D re-runs its command, no prompt needed)."""
        ctxs = [self._ctx("law"), self._ctx("config")]
        failing = [Evaluator("file_check", F_D, "file must exist", command="true")]
        result = select_relevant_contexts(ctxs, failing)
        assert result == []

    def test_fh_only_failing_returns_empty(self):
        """F_H-only failure → no contexts (gate waits for approved, no prompt)."""
        ctxs = [self._ctx("criteria")]
        failing = [Evaluator("sign_off", F_H, "human approval")]
        result = select_relevant_contexts(ctxs, failing)
        assert result == []

    def test_mixed_fd_fp_returns_all_contexts(self):
        """F_D + F_P failing → contexts returned (F_P needs them)."""
        ctxs = [self._ctx("spec"), self._ctx("adr")]
        failing = [
            Evaluator("file_check", F_D, "file must exist", command="true"),
            Evaluator("code_complete", F_P, "needs LLM"),
        ]
        result = select_relevant_contexts(ctxs, failing)
        assert len(result) == 2

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


# ── job_evaluator_hash ────────────────────────────────────────────────────────

def _make_fh_job() -> Job:
    src = Asset(name="requirements", id_format="REQ-{SEQ}")
    tgt = Asset(name="feature_decomp", id_format="FD-{SEQ}")
    op = Operator("human_gate", F_H, "fh://single")
    edge = Edge(name="requirements→feature_decomp", source=src, target=tgt, using=[op])
    ev = Evaluator("decomp_approved", F_H, "Human approves")
    return Job(edge=edge, evaluators=[ev])


def _review_event(edge: str, workflow_version: str | None = None) -> dict:
    data: dict = {"kind": "fh_review", "edge": edge, "actor": "human"}
    if workflow_version is not None:
        data["workflow_version"] = workflow_version
    return {"event_type": "approved", "data": data}


class TestJobEvaluatorHash:
    def test_hash_is_deterministic(self):
        job = _make_simple_job([Evaluator("code_complete", F_P, "Agent: code implements spec")])
        assert job_evaluator_hash(job) == job_evaluator_hash(job)

    def test_different_evaluator_names_give_different_hash(self):
        job_a = _make_simple_job([Evaluator("ev_a", F_P, "same desc")])
        job_b = _make_simple_job([Evaluator("ev_b", F_P, "same desc")])
        assert job_evaluator_hash(job_a) != job_evaluator_hash(job_b)

    def test_different_descriptions_give_different_hash(self):
        job_a = _make_simple_job([Evaluator("ev", F_P, "description v1")])
        job_b = _make_simple_job([Evaluator("ev", F_P, "description v2")])
        assert job_evaluator_hash(job_a) != job_evaluator_hash(job_b)

    def test_different_commands_give_different_hash(self):
        job_a = _make_simple_job([Evaluator("ev", F_D, "desc", command="pytest -x")])
        job_b = _make_simple_job([Evaluator("ev", F_D, "desc", command="pytest -v")])
        assert job_evaluator_hash(job_a) != job_evaluator_hash(job_b)

    def test_hash_is_16_hex_chars(self):
        job = _make_simple_job()
        h = job_evaluator_hash(job)
        assert len(h) == 16
        assert all(c in "0123456789abcdef" for c in h)

    def test_whitespace_normalized(self):
        """Extra whitespace in descriptions is collapsed before hashing."""
        job_a = _make_simple_job([Evaluator("ev", F_P, "word1  word2")])
        job_b = _make_simple_job([Evaluator("ev", F_P, "word1 word2")])
        assert job_evaluator_hash(job_a) == job_evaluator_hash(job_b)


# ── bind_fh — version-aware F_H gate ─────────────────────────────────────────

class TestBindFhVersionAware:
    def test_unknown_version_accepts_any_approved(self):
        """Version "unknown" (no provenance file) accepts any approved matching edge name."""
        job = _make_fh_job()
        events = [_review_event("requirements→feature_decomp")]
        assert bind_fh(job, events, current_workflow_version="unknown") is True

    def test_unknown_version_rejects_wrong_edge(self):
        job = _make_fh_job()
        events = [_review_event("other_edge")]
        assert bind_fh(job, events, current_workflow_version="unknown") is False

    def test_unknown_version_empty_events_returns_false(self):
        job = _make_fh_job()
        assert bind_fh(job, [], current_workflow_version="unknown") is False

    def test_known_version_accepts_matching_version(self):
        job = _make_fh_job()
        events = [_review_event("requirements→feature_decomp", "genesis_sdlc.standard@0.2.1")]
        assert bind_fh(job, events, current_workflow_version="genesis_sdlc.standard@0.2.1") is True

    def test_known_version_rejects_pre_provenance_event(self):
        """Pre-provenance events have no workflow_version field — must be rejected."""
        job = _make_fh_job()
        events = [_review_event("requirements→feature_decomp")]  # no workflow_version in data
        assert bind_fh(job, events, current_workflow_version="genesis_sdlc.standard@0.2.1") is False

    def test_known_version_rejects_different_version(self):
        job = _make_fh_job()
        events = [_review_event("requirements→feature_decomp", "genesis_sdlc.standard@0.1.0")]
        assert bind_fh(job, events, current_workflow_version="genesis_sdlc.standard@0.2.1") is False

    def test_carry_forward_satisfies_gate(self):
        """carry_forward entry with matching from_version accepts an older approved."""
        job = _make_fh_job()
        events = [_review_event("requirements→feature_decomp", "genesis_sdlc.standard@0.1.0")]
        cf = [{"edge": "requirements→feature_decomp", "from_version": "genesis_sdlc.standard@0.1.0"}]
        assert bind_fh(job, events, current_workflow_version="genesis_sdlc.standard@0.2.1", carry_forward=cf) is True

    def test_carry_forward_requires_edge_match(self):
        """carry_forward entry for a different edge does not help."""
        job = _make_fh_job()
        events = [_review_event("requirements→feature_decomp", "genesis_sdlc.standard@0.1.0")]
        cf = [{"edge": "other_edge", "from_version": "genesis_sdlc.standard@0.1.0"}]
        assert bind_fh(job, events, current_workflow_version="genesis_sdlc.standard@0.2.1", carry_forward=cf) is False

    def test_carry_forward_requires_version_match(self):
        """carry_forward from_version must match the event's actual workflow_version."""
        job = _make_fh_job()
        events = [_review_event("requirements→feature_decomp", "genesis_sdlc.standard@0.1.0")]
        cf = [{"edge": "requirements→feature_decomp", "from_version": "genesis_sdlc.standard@0.0.1"}]
        assert bind_fh(job, events, current_workflow_version="genesis_sdlc.standard@0.2.1", carry_forward=cf) is False


# ── revoked operator tests (C2) ──────────────────────────────────────────────

def _revoke_event(edge: str, workflow_version: str | None = None, event_time: str | None = None) -> dict:
    data: dict = {"kind": "fh_approval", "edge": edge, "actor": "human", "reason": "retracted"}
    if workflow_version is not None:
        data["workflow_version"] = workflow_version
    ev: dict = {"event_type": "revoked", "data": data}
    if event_time is not None:
        ev["event_time"] = event_time
    return ev


class TestRevocation:
    """Event Calculus: revoked{kind: fh_approval} terminates operative(edge, wv)."""

    def test_basic_revocation_terminates_operative(self):
        """approved then revoked → fluent terminated."""
        job = _make_fh_job()
        events = [
            {**_review_event("requirements→feature_decomp"), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_event("requirements→feature_decomp"), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fh(job, events, current_workflow_version="unknown") is False

    def test_reapproval_after_revocation_restores_fluent(self):
        """approved → revoked → approved again → fluent restored."""
        job = _make_fh_job()
        events = [
            {**_review_event("requirements→feature_decomp"), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_event("requirements→feature_decomp"), "event_time": "2026-01-02T00:00:00"},
            {**_review_event("requirements→feature_decomp"), "event_time": "2026-01-03T00:00:00"},
        ]
        assert bind_fh(job, events, current_workflow_version="unknown") is True

    def test_wildcard_revocation(self):
        """revoked{edge: "*"} terminates operative for any edge."""
        job = _make_fh_job()
        events = [
            {**_review_event("requirements→feature_decomp"), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_event("*"), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fh(job, events, current_workflow_version="unknown") is False

    def test_revocation_predating_approval_has_no_effect(self):
        """A revocation with an earlier timestamp does not terminate a later approval."""
        job = _make_fh_job()
        events = [
            {**_revoke_event("requirements→feature_decomp"), "event_time": "2026-01-01T00:00:00"},
            {**_review_event("requirements→feature_decomp"), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fh(job, events, current_workflow_version="unknown") is True

    def test_revocation_scoped_by_workflow_version(self):
        """H4: revoked with matching workflow_version terminates the fluent."""
        job = _make_fh_job()
        wv = "genesis_sdlc.standard@0.2.1"
        events = [
            {**_review_event("requirements→feature_decomp", wv), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_event("requirements→feature_decomp", wv), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fh(job, events, current_workflow_version=wv) is False

    def test_cross_version_revocation_does_not_terminate(self):
        """H4: revoked from a different workflow_version does NOT terminate the fluent."""
        job = _make_fh_job()
        wv_current = "genesis_sdlc.standard@0.2.1"
        wv_other = "genesis_sdlc.standard@0.1.0"
        events = [
            {**_review_event("requirements→feature_decomp", wv_current), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_event("requirements→feature_decomp", wv_other), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fh(job, events, current_workflow_version=wv_current) is True

    def test_revocation_wrong_edge_ignored(self):
        """Revocation for a different edge does not affect this job's fluent."""
        job = _make_fh_job()
        events = [
            {**_review_event("requirements→feature_decomp"), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_event("other_edge"), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fh(job, events, current_workflow_version="unknown") is True


# ── Symmetric F_P revocation: revoked{kind: fp_assessment} terminates certified ──

def _make_fp_job() -> Job:
    src = Asset(name="design", id_format="DES-{SEQ}")
    tgt = Asset(name="code", id_format="CODE-{SEQ}")
    op = Operator("claude_agent", F_P, "agent://claude/genesis")
    edge = Edge(name="design→code", source=src, target=tgt, using=[op])
    ev = Evaluator("code_complete", F_P, "Agent: code implements spec")
    return Job(edge=edge, evaluators=[ev])


def _assessed_fp_event(edge: str, evaluator: str = "code_complete",
                       spec_hash: str = "abc123", workflow_version: str | None = None) -> dict:
    data: dict = {"kind": "fp", "edge": edge, "evaluator": evaluator,
                  "result": "pass", "spec_hash": spec_hash}
    if workflow_version is not None:
        data["workflow_version"] = workflow_version
    return {"event_type": "assessed", "data": data}


def _revoke_fp_event(edge: str, workflow_version: str | None = None,
                     event_time: str | None = None) -> dict:
    ev: dict = {"event_type": "revoked", "data": {
        "kind": "fp_assessment", "edge": edge, "actor": "human",
        "reason": "Full rebuild requested",
    }}
    if workflow_version is not None:
        ev["data"]["workflow_version"] = workflow_version
    if event_time is not None:
        ev["event_time"] = event_time
    return ev


class TestFPRevocation:
    """Event Calculus: revoked{kind: fp_assessment} terminates certified — symmetric with TestRevocation."""

    # Validates: REQ-F-EC-004
    # Validates: REQ-F-EC-002

    def test_basic_fp_revocation_terminates_certified(self):
        """assessed{pass} then revoked{fp_assessment} → fluent terminated."""
        from genesis.bind import bind_fp_certified
        job = _make_fp_job()
        events = [
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_fp_event("design→code"), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown") is False

    def test_reassessment_after_fp_revocation_restores_fluent(self):
        """assessed → revoked → assessed again → fluent restored."""
        from genesis.bind import bind_fp_certified
        job = _make_fp_job()
        events = [
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_fp_event("design→code"), "event_time": "2026-01-02T00:00:00"},
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-03T00:00:00"},
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown") is True

    def test_wildcard_fp_revocation(self):
        """revoked{kind: fp_assessment, edge: "*"} terminates certified for any edge."""
        from genesis.bind import bind_fp_certified
        job = _make_fp_job()
        events = [
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_fp_event("*"), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown") is False

    def test_fp_revocation_predating_assessment_has_no_effect(self):
        """A revocation with an earlier timestamp does not terminate a later assessment."""
        from genesis.bind import bind_fp_certified
        job = _make_fp_job()
        events = [
            {**_revoke_fp_event("design→code"), "event_time": "2026-01-01T00:00:00"},
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown") is True

    def test_fp_revocation_scoped_by_workflow_version(self):
        """revoked{fp_assessment} with matching workflow_version terminates the fluent."""
        from genesis.bind import bind_fp_certified
        job = _make_fp_job()
        wv = "genesis_sdlc.standard@0.2.1"
        events = [
            {**_assessed_fp_event("design→code", workflow_version=wv), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_fp_event("design→code", workflow_version=wv), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version=wv) is False

    def test_cross_version_fp_revocation_does_not_terminate(self):
        """revoked{fp_assessment} from a different workflow_version does NOT terminate."""
        from genesis.bind import bind_fp_certified
        job = _make_fp_job()
        wv_current = "genesis_sdlc.standard@0.2.1"
        wv_other = "genesis_sdlc.standard@0.1.0"
        events = [
            {**_assessed_fp_event("design→code", workflow_version=wv_current), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_fp_event("design→code", workflow_version=wv_other), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version=wv_current) is True

    def test_fp_revocation_wrong_edge_ignored(self):
        """Revocation for a different edge does not affect this job's fluent."""
        from genesis.bind import bind_fp_certified
        job = _make_fp_job()
        events = [
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_fp_event("other_edge"), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown") is True

    def test_fh_revocation_does_not_affect_certified(self):
        """revoked{kind: fh_approval} does NOT terminate certified — the two are independent."""
        from genesis.bind import bind_fp_certified
        job = _make_fp_job()
        events = [
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-01T00:00:00"},
            {**_revoke_event("design→code"), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown") is True


# ── M1: assessed{kind: fh_review} must not satisfy F_P convergence ───────────

class TestAssessedKindIsolation:
    """assessed{kind: fh_review} is an F_H event — it must NOT satisfy F_P convergence."""

    def test_fh_review_assessment_does_not_satisfy_fp(self, tmp_path):
        """An assessed{kind: fh_review} event must not count as F_P convergence."""
        stream = _make_stream(tmp_path)
        resolver = ContextResolver(tmp_path)
        # Emit an assessed event with kind=fh_review (F_H rejection)
        stream.append("assessed", {
            "kind": "fh_review",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "reject",
            "actor": "human",
            "reason": "insufficient",
        })
        job = _make_simple_job([Evaluator("code_complete", F_P, "Agent: code implements spec")])
        pre = bind_fd(job, stream, resolver, tmp_path)
        # code_complete must still be failing — fh_review does not satisfy F_P
        assert any(ev.name == "code_complete" for ev in pre.failing_evaluators)
        assert not any(ev.name == "code_complete" for ev in pre.passing_evaluators)


# ── ADR-026: Reset boundary — find_latest_reset ─────────────────────────────

from genesis.bind import find_latest_reset, bind_fp_certified


def _reset_event(scope: str, event_time: str,
                 work_key: str | None = None,
                 edge: str | None = None) -> dict:
    """Construct a reset event for testing."""
    data: dict = {
        "scope": scope,
        "actor": "human",
        "reason": "re-evaluation requested",
    }
    if work_key is not None:
        data["work_key"] = work_key
    if edge is not None:
        data["edge"] = edge
    return {"event_type": "reset", "event_time": event_time, "data": data}


class TestFindLatestReset:
    """ADR-026: find_latest_reset scope containment."""

    def test_no_reset_returns_none(self):
        events = [_review_event("design→code")]
        assert find_latest_reset(events, edge="design→code") is None

    def test_workspace_reset_matches_any_query(self):
        events = [_reset_event("workspace", "2026-01-01T00:00:00")]
        result = find_latest_reset(events, edge="design→code", work_key="REQ-F-AUTH")
        assert result is not None
        assert result["data"]["scope"] == "workspace"

    def test_workspace_reset_matches_global_query(self):
        events = [_reset_event("workspace", "2026-01-01T00:00:00")]
        result = find_latest_reset(events, edge="design→code")
        assert result is not None

    def test_work_key_reset_matches_same_key(self):
        events = [_reset_event("work_key", "2026-01-01T00:00:00", work_key="REQ-F-AUTH")]
        result = find_latest_reset(events, edge="design→code", work_key="REQ-F-AUTH")
        assert result is not None

    def test_work_key_reset_matches_descendant(self):
        events = [_reset_event("work_key", "2026-01-01T00:00:00", work_key="REQ-F-AUTH")]
        result = find_latest_reset(events, work_key="REQ-F-AUTH/module.login")
        assert result is not None

    def test_work_key_reset_does_not_match_sibling(self):
        events = [_reset_event("work_key", "2026-01-01T00:00:00", work_key="REQ-F-AUTH")]
        result = find_latest_reset(events, work_key="REQ-F-LOGGING")
        assert result is None

    def test_work_key_reset_does_not_match_global_query(self):
        events = [_reset_event("work_key", "2026-01-01T00:00:00", work_key="REQ-F-AUTH")]
        result = find_latest_reset(events, edge="design→code")
        assert result is None

    def test_edge_reset_matches_exact_slice(self):
        events = [_reset_event("edge", "2026-01-01T00:00:00",
                               work_key="REQ-F-AUTH", edge="design→code")]
        result = find_latest_reset(events, edge="design→code", work_key="REQ-F-AUTH")
        assert result is not None

    def test_edge_reset_does_not_match_different_edge(self):
        events = [_reset_event("edge", "2026-01-01T00:00:00",
                               work_key="REQ-F-AUTH", edge="design→code")]
        result = find_latest_reset(events, edge="code→tests", work_key="REQ-F-AUTH")
        assert result is None

    def test_edge_reset_matches_descendant_work_key(self):
        events = [_reset_event("edge", "2026-01-01T00:00:00",
                               work_key="REQ-F-AUTH", edge="design→code")]
        result = find_latest_reset(events, edge="design→code", work_key="REQ-F-AUTH/module.login")
        assert result is not None

    def test_latest_wins_among_multiple_resets(self):
        events = [
            _reset_event("workspace", "2026-01-01T00:00:00"),
            _reset_event("workspace", "2026-01-03T00:00:00"),
            _reset_event("workspace", "2026-01-02T00:00:00"),
        ]
        result = find_latest_reset(events, edge="design→code")
        assert result["event_time"] == "2026-01-03T00:00:00"

    def test_mixed_scopes_latest_wins(self):
        """If both a workspace reset and an edge reset apply, the latest one wins."""
        events = [
            _reset_event("workspace", "2026-01-01T00:00:00"),
            _reset_event("edge", "2026-01-02T00:00:00",
                         work_key="REQ-F-AUTH", edge="design→code"),
        ]
        result = find_latest_reset(events, edge="design→code", work_key="REQ-F-AUTH")
        assert result["event_time"] == "2026-01-02T00:00:00"
        assert result["data"]["scope"] == "edge"

    def test_unknown_scope_ignored(self):
        events = [{"event_type": "reset", "event_time": "2026-01-01T00:00:00",
                    "data": {"scope": "galaxy", "actor": "x", "reason": "y"}}]
        assert find_latest_reset(events) is None


# ── ADR-026: Reset boundary — bind_fp_certified shadowing ────────────────────

class TestResetShadowingFP:
    """ADR-026: reset boundary shadows F_P certifications."""

    # Validates: REQ-F-CORRECT-002

    def test_assessed_before_reset_is_shadowed(self):
        """assessed{pass} BEFORE reset → certification does not hold."""
        job = _make_fp_job()
        events = [
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-01T00:00:00"},
            _reset_event("workspace", "2026-01-02T00:00:00"),
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown") is False

    def test_assessed_after_reset_is_valid(self):
        """assessed{pass} AFTER reset → certification holds normally."""
        job = _make_fp_job()
        events = [
            _reset_event("workspace", "2026-01-01T00:00:00"),
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-02T00:00:00"},
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown") is True

    def test_no_reset_behaves_as_before(self):
        """Without reset events, bind_fp_certified behaves identically to V1."""
        job = _make_fp_job()
        events = [
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-01T00:00:00"},
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown") is True

    def test_work_key_scoped_reset_shadows_matching_key(self):
        """Work_key reset shadows certifications for that key only."""
        job = _make_fp_job()
        events = [
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-01T00:00:00",
             "data": {**_assessed_fp_event("design→code")["data"], "work_key": "REQ-F-AUTH"}},
            _reset_event("work_key", "2026-01-02T00:00:00", work_key="REQ-F-AUTH"),
        ]
        # Query for REQ-F-AUTH — should be shadowed
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown",
                                 work_key="REQ-F-AUTH") is False

    def test_work_key_scoped_reset_does_not_shadow_sibling(self):
        """Work_key reset for AUTH does not shadow LOGGING certification."""
        job = _make_fp_job()
        events = [
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-01T00:00:00",
             "data": {**_assessed_fp_event("design→code")["data"], "work_key": "REQ-F-LOGGING"}},
            _reset_event("work_key", "2026-01-02T00:00:00", work_key="REQ-F-AUTH"),
        ]
        # Query for REQ-F-LOGGING — should NOT be shadowed
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown",
                                 work_key="REQ-F-LOGGING") is True

    def test_reassessment_after_reset_restores_certification(self):
        """assessed → reset → assessed again → certification restored."""
        job = _make_fp_job()
        events = [
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-01T00:00:00"},
            _reset_event("workspace", "2026-01-02T00:00:00"),
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-03T00:00:00"},
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown") is True

    def test_edge_scoped_reset_shadows_matching_slice(self):
        """Edge+work_key reset shadows only that specific slice."""
        job = _make_fp_job()
        events = [
            {**_assessed_fp_event("design→code"), "event_time": "2026-01-01T00:00:00",
             "data": {**_assessed_fp_event("design→code")["data"], "work_key": "REQ-F-AUTH"}},
            _reset_event("edge", "2026-01-02T00:00:00",
                         work_key="REQ-F-AUTH", edge="design→code"),
        ]
        assert bind_fp_certified(job, job.evaluators[0], events, spec_hash="abc123",
                                 current_workflow_version="unknown",
                                 work_key="REQ-F-AUTH") is False


# ── ADR-026: Reset does NOT affect F_H ───────────────────────────────────────

class TestResetDoesNotAffectFH:
    """ADR-026: F_H approvals persist across reset boundaries."""

    # Validates: REQ-F-CORRECT-002

    def test_fh_survives_workspace_reset(self):
        """approved{fh_review} before workspace reset → operative still holds."""
        job = _make_fh_job()
        events = [
            {**_review_event("requirements→feature_decomp"), "event_time": "2026-01-01T00:00:00"},
            _reset_event("workspace", "2026-01-02T00:00:00"),
        ]
        assert bind_fh(job, events, current_workflow_version="unknown") is True

    def test_fh_survives_work_key_reset(self):
        """approved{fh_review} before work_key reset → operative still holds."""
        job = _make_fh_job()
        events = [
            {**_review_event("requirements→feature_decomp"), "event_time": "2026-01-01T00:00:00"},
            _reset_event("work_key", "2026-01-02T00:00:00", work_key="REQ-F-AUTH"),
        ]
        assert bind_fh(job, events, current_workflow_version="unknown") is True

    def test_fh_requires_explicit_revocation(self):
        """Reset alone doesn't terminate F_H — requires revoked{fh_approval}."""
        job = _make_fh_job()
        events = [
            {**_review_event("requirements→feature_decomp"), "event_time": "2026-01-01T00:00:00"},
            _reset_event("workspace", "2026-01-02T00:00:00"),
            # This revocation terminates the fluent — NOT the reset
            {**_revoke_event("requirements→feature_decomp"), "event_time": "2026-01-03T00:00:00"},
        ]
        assert bind_fh(job, events, current_workflow_version="unknown") is False


# ── ADR-026: emit() validates reset schema ───────────────────────────────────

class TestEmitResetValidation:
    """ADR-026: emit() enforces reset event schema."""

    def test_reset_without_scope_raises(self, tmp_path):
        from genesis.core import workspace_bootstrap, emit
        workspace_bootstrap(tmp_path)
        with pytest.raises(ValueError, match="scope"):
            emit("reset", {"actor": "human", "reason": "test"})

    def test_reset_with_invalid_scope_raises(self, tmp_path):
        from genesis.core import workspace_bootstrap, emit
        workspace_bootstrap(tmp_path)
        with pytest.raises(ValueError, match="scope"):
            emit("reset", {"scope": "galaxy", "actor": "human", "reason": "test"})

    def test_workspace_reset_valid(self, tmp_path):
        from genesis.core import workspace_bootstrap, emit
        workspace_bootstrap(tmp_path)
        # Should not raise
        emit("reset", {"scope": "workspace", "actor": "human", "reason": "full re-eval"})

    def test_work_key_reset_without_work_key_raises(self, tmp_path):
        from genesis.core import workspace_bootstrap, emit
        workspace_bootstrap(tmp_path)
        with pytest.raises(ValueError, match="work_key"):
            emit("reset", {"scope": "work_key", "actor": "human", "reason": "test"})

    def test_edge_reset_without_edge_raises(self, tmp_path):
        from genesis.core import workspace_bootstrap, emit
        workspace_bootstrap(tmp_path)
        with pytest.raises(ValueError, match="edge"):
            emit("reset", {"scope": "edge", "work_key": "REQ-F-AUTH",
                           "actor": "human", "reason": "test"})

    def test_edge_reset_valid(self, tmp_path):
        from genesis.core import workspace_bootstrap, emit
        workspace_bootstrap(tmp_path)
        # Should not raise
        emit("reset", {"scope": "edge", "work_key": "REQ-F-AUTH",
                        "edge": "design→code", "actor": "human", "reason": "test"})
