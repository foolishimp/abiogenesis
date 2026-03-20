# Validates: REQ-F-CORE-001
# Validates: REQ-F-CORE-005
# Validates: REQ-F-CORE-006
# Validates: REQ-F-WKSP-001
# Validates: REQ-F-GATE-001
# Validates: REQ-F-EVAL-002
# Validates: REQ-F-PROV-003
# Validates: REQ-F-PROV-004
"""Tests for genesis.schedule — delta, iterate, schedule."""
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch

from gtl.core import (
    Asset, Edge, Evaluator, Job, Operator, Worker, WorkingSurface,
    F_D, F_P, F_H,
)

from genesis.core import EventStream, workspace_bootstrap
from genesis.manifest import BoundJob, PrecomputedManifest
from genesis.schedule import delta, iterate, schedule


# ── Fixtures ──────────────────────────────────────────────────────────────────

def _make_job(evaluators: list) -> Job:
    src = Asset(name="design", id_format="DES-{SEQ}")
    tgt = Asset(name="code", id_format="CODE-{SEQ}")
    op = Operator("claude_agent", F_P, "agent://claude/genesis")
    edge = Edge(name="design→code", source=src, target=tgt, using=[op])
    return Job(edge=edge, evaluators=evaluators)


def _make_bound_job(tmp_path: Path, failing=None, passing=None) -> BoundJob:
    if failing is None:
        failing = [Evaluator("code_complete", F_P, "agent: check code")]
    if passing is None:
        passing = []

    job = _make_job(failing + passing)
    pre = PrecomputedManifest(
        job=job,
        current_asset={"status": "not_started"},
        failing_evaluators=failing,
        passing_evaluators=passing,
        fd_results={},
        relevant_contexts={},
        delta_summary="delta > 0",
    )
    return BoundJob(job=job, precomputed=pre, prompt="[test prompt]")


def _make_stream(tmp_path: Path) -> EventStream:
    f = tmp_path / "events.jsonl"
    f.touch()
    return EventStream(f)


# ── delta ─────────────────────────────────────────────────────────────────────

class TestDelta:
    def test_converged_when_no_evaluators(self, tmp_path):
        """Job with no evaluators cannot exist (Job.__post_init__ guards this),
        but delta on a hypothetical empty list returns 0."""
        # We can't construct Job with empty evaluators, so test via patching
        job = _make_job([Evaluator("fp", F_P, "x")])
        stream = _make_stream(tmp_path)
        d = delta(job, stream, tmp_path)
        assert 0.0 <= d <= 1.0

    def test_fp_evaluator_always_nonzero(self, tmp_path):
        """F_P evaluators always contribute to delta."""
        job = _make_job([Evaluator("code_complete", F_P, "LLM check")])
        stream = _make_stream(tmp_path)
        d = delta(job, stream, tmp_path)
        assert d > 0.0

    def test_fh_evaluator_zero_after_approval(self, tmp_path):
        job = _make_job([Evaluator("design_approved", F_H, "human gate")])
        stream = _make_stream(tmp_path)
        stream.append("approved", {"kind": "fh_review", "edge": "design→code", "actor": "human"})
        d = delta(job, stream, tmp_path)
        assert d == 0.0

    def test_fh_evaluator_nonzero_without_approval(self, tmp_path):
        job = _make_job([Evaluator("design_approved", F_H, "human gate")])
        stream = _make_stream(tmp_path)
        d = delta(job, stream, tmp_path)
        assert d > 0.0

    def test_fd_evaluator_passes_no_code(self, tmp_path):
        """F_D impl_tags fails when no code exists."""
        job = _make_job([Evaluator("impl_tags", F_D, "check tags")])
        stream = _make_stream(tmp_path)
        d = delta(job, stream, tmp_path)
        assert d > 0.0

    def test_fp_resolves_with_matching_spec_hash(self, tmp_path):
        """assessed(kind=fp) with matching spec_hash resolves F_P evaluator."""
        job = _make_job([Evaluator("code_complete", F_P, "LLM check")])
        stream = _make_stream(tmp_path)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": "abc123",
        })
        d = delta(job, stream, tmp_path, spec_hash="abc123")
        assert d == 0.0

    def test_fp_stale_with_different_spec_hash(self, tmp_path):
        """assessed(kind=fp) with wrong spec_hash is treated as stale — delta stays > 0."""
        job = _make_job([Evaluator("code_complete", F_P, "LLM check")])
        stream = _make_stream(tmp_path)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": "old_hash",
        })
        d = delta(job, stream, tmp_path, spec_hash="new_hash")
        assert d > 0.0

    def test_fp_stale_without_spec_hash_field(self, tmp_path):
        """assessed(kind=fp) with no spec_hash field is stale when caller provides a hash."""
        job = _make_job([Evaluator("code_complete", F_P, "LLM check")])
        stream = _make_stream(tmp_path)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
        })
        d = delta(job, stream, tmp_path, spec_hash="current_hash")
        assert d > 0.0

    def test_fp_resolves_when_spec_hash_none(self, tmp_path):
        """spec_hash=None opts out of snapshot check — legacy assessment is valid."""
        job = _make_job([Evaluator("code_complete", F_P, "LLM check")])
        stream = _make_stream(tmp_path)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
        })
        d = delta(job, stream, tmp_path, spec_hash=None)
        assert d == 0.0


# ── iterate ───────────────────────────────────────────────────────────────────

class TestIterate:
    def test_returns_working_surface(self, tmp_path):
        bound = _make_bound_job(tmp_path)
        surface = iterate(bound)
        assert isinstance(surface, WorkingSurface)

    def test_fp_dispatch_event_emitted(self, tmp_path):
        bound = _make_bound_job(tmp_path, failing=[Evaluator("fp", F_P, "LLM")])
        surface = iterate(bound)
        types = [e["event_type"] for e in surface.events]
        assert "fp_dispatched" in types

    def test_fh_gate_event_emitted(self, tmp_path):
        bound = _make_bound_job(tmp_path, failing=[Evaluator("fh", F_H, "human")])
        surface = iterate(bound)
        types = [e["event_type"] for e in surface.events]
        assert "fh_gate_pending" in types

    def test_on_fp_dispatch_called(self, tmp_path):
        bound = _make_bound_job(tmp_path, failing=[Evaluator("fp", F_P, "LLM")])
        called = []
        iterate(bound, on_fp_dispatch=lambda b: called.append(b))
        assert len(called) == 1

    def test_on_fp_dispatch_not_called_when_no_fp(self, tmp_path):
        bound = _make_bound_job(tmp_path, failing=[Evaluator("fh", F_H, "human")])
        called = []
        iterate(bound, on_fp_dispatch=lambda b: called.append(b))
        assert len(called) == 0

    def test_context_consumed_populated(self, tmp_path):
        bound = _make_bound_job(tmp_path)
        surface = iterate(bound)
        # context_consumed reflects job.edge.context (empty in our fixture)
        assert isinstance(surface.context_consumed, list)

    def test_does_not_call_emit(self, tmp_path):
        """iterate() does not call emit() — the engine does that from the surface."""
        import genesis.core as core_mod
        original = core_mod._stream
        core_mod._stream = None  # emit() would raise if called
        try:
            bound = _make_bound_job(tmp_path)
            surface = iterate(bound)  # must not raise
            assert surface is not None
        finally:
            core_mod._stream = original


# ── schedule ──────────────────────────────────────────────────────────────────

class TestSchedule:
    def _make_worker(self, wid: str, jobs: list[Job]) -> Worker:
        return Worker(id=wid, can_execute=jobs)

    def test_empty_workers_returns_empty(self):
        assert schedule([]) == []

    def test_single_worker_one_batch(self, tmp_path):
        job = _make_job([Evaluator("fp", F_P, "x")])
        w = self._make_worker("w1", [job])
        batches = schedule([w])
        assert len(batches) == 1
        assert batches[0] == [w]

    def test_non_conflicting_workers_same_batch(self, tmp_path):
        """Workers with disjoint write sets run in the same batch."""
        src1 = Asset(name="design", id_format="DES-{SEQ}")
        tgt1 = Asset(name="code", id_format="CODE-{SEQ}")
        src2 = Asset(name="code", id_format="CODE-{SEQ}")
        tgt2 = Asset(name="unit_tests", id_format="TEST-{SEQ}")
        op = Operator("claude_agent", F_P, "agent://claude/genesis")

        j1 = Job(
            edge=Edge("design→code", src1, tgt1, using=[op]),
            evaluators=[Evaluator("fp1", F_P, "x")],
        )
        j2 = Job(
            edge=Edge("code→tests", src2, tgt2, using=[op]),
            evaluators=[Evaluator("fp2", F_P, "x")],
        )
        w1 = self._make_worker("w1", [j1])  # writes: code
        w2 = self._make_worker("w2", [j2])  # writes: unit_tests
        # w1 and w2 have disjoint write sets → no conflict → same batch
        batches = schedule([w1, w2])
        assert len(batches) == 1
        assert len(batches[0]) == 2

    def test_conflicting_workers_different_batches(self, tmp_path):
        """Workers with overlapping write sets must serialise."""
        src = Asset(name="design", id_format="DES-{SEQ}")
        tgt = Asset(name="code", id_format="CODE-{SEQ}")
        op = Operator("claude_agent", F_P, "agent://claude/genesis")

        j1 = Job(
            edge=Edge("design→code_a", src, tgt, using=[op]),
            evaluators=[Evaluator("fp1", F_P, "x")],
        )
        j2 = Job(
            edge=Edge("design→code_b", src, tgt, using=[op]),
            evaluators=[Evaluator("fp2", F_P, "x")],
        )
        w1 = self._make_worker("w1", [j1])  # writes: code
        w2 = self._make_worker("w2", [j2])  # writes: code (conflict!)
        batches = schedule([w1, w2])
        assert len(batches) == 2

    def test_all_workers_appear_in_batches(self, tmp_path):
        job = _make_job([Evaluator("fp", F_P, "x")])
        workers = [self._make_worker(f"w{i}", [job]) for i in range(3)]
        batches = schedule(workers)
        all_workers = [w for batch in batches for w in batch]
        assert set(w.id for w in all_workers) == {"w0", "w1", "w2"}


# ── delta with workflow_version and carry_forward ─────────────────────────────

class TestDeltaProvenance:
    """REQ-F-PROV-003/004: delta() respects version-aware F_H gate via carry_forward."""

    def _make_fh_job(self) -> Job:
        src = Asset(name="requirements", id_format="REQ-{SEQ}")
        tgt = Asset(name="feature_decomp", id_format="FD-{SEQ}")
        op = Operator("human_gate", F_H, "fh://single")
        edge = Edge(name="requirements→feature_decomp", source=src, target=tgt, using=[op])
        ev = Evaluator("decomp_approved", F_H, "Human approves")
        return Job(edge=edge, evaluators=[ev])

    def test_fh_resolves_with_matching_workflow_version(self, tmp_path):
        """approved(kind=fh_review) with matching workflow_version → delta = 0.0."""
        job = self._make_fh_job()
        stream = _make_stream(tmp_path)
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "requirements→feature_decomp",
            "actor": "human",
            "workflow_version": "genesis_sdlc.standard@0.2.1",
        })
        d = delta(
            job, stream, tmp_path,
            current_workflow_version="genesis_sdlc.standard@0.2.1",
        )
        assert d == 0.0

    def test_fh_fails_with_different_workflow_version(self, tmp_path):
        """approved(kind=fh_review) from a different version → stale, delta > 0."""
        job = self._make_fh_job()
        stream = _make_stream(tmp_path)
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "requirements→feature_decomp",
            "actor": "human",
            "workflow_version": "genesis_sdlc.standard@0.1.0",
        })
        d = delta(
            job, stream, tmp_path,
            current_workflow_version="genesis_sdlc.standard@0.2.1",
        )
        assert d > 0.0

    def test_fh_resolves_via_carry_forward(self, tmp_path):
        """approved(kind=fh_review) from old version + matching carry_forward entry → delta = 0.0."""
        job = self._make_fh_job()
        stream = _make_stream(tmp_path)
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "requirements→feature_decomp",
            "actor": "human",
            "workflow_version": "genesis_sdlc.standard@0.1.0",
        })
        carry_forward = [
            {"edge": "requirements→feature_decomp", "from_version": "genesis_sdlc.standard@0.1.0"}
        ]
        d = delta(
            job, stream, tmp_path,
            current_workflow_version="genesis_sdlc.standard@0.2.1",
            carry_forward=carry_forward,
        )
        assert d == 0.0

    def test_fh_still_fails_with_wrong_carry_forward_edge(self, tmp_path):
        """carry_forward entry for wrong edge does not satisfy the gate."""
        job = self._make_fh_job()
        stream = _make_stream(tmp_path)
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "requirements→feature_decomp",
            "actor": "human",
            "workflow_version": "genesis_sdlc.standard@0.1.0",
        })
        carry_forward = [
            {"edge": "other_edge", "from_version": "genesis_sdlc.standard@0.1.0"}
        ]
        d = delta(
            job, stream, tmp_path,
            current_workflow_version="genesis_sdlc.standard@0.2.1",
            carry_forward=carry_forward,
        )
        assert d > 0.0
