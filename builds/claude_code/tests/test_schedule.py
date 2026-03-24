# Validates: REQ-F-CORE-001
# Validates: REQ-F-CORE-005
# Validates: REQ-F-CORE-006
# Validates: REQ-F-WKSP-001
# Validates: REQ-F-GATE-001
# Validates: REQ-F-EVAL-002
# Validates: REQ-F-PROV-003
# Validates: REQ-F-PROV-004
# Validates: REQ-F-LEAF-001
"""Tests for genesis.schedule — delta, iterate, schedule, leaf tasks."""
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



# ── schedule ──────────────────────────────────────────────────────────────────

class TestSchedule:
    def _make_worker(self, wid: str, jobs: list[Job]) -> Worker:
        return Worker(id=wid, can_execute=jobs)

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


# ── Path-independence: evaluator ordering does not affect delta ──────────────

class TestDeltaPathIndependence:
    """Bootloader XI path-independence invariant: reordering evaluators within
    a Job must produce the same delta on the same event stream."""

    def _make_job_with_order(self, evaluators: list) -> Job:
        """Build a Job with the given evaluators in the given order."""
        src = Asset(name="design", id_format="DES-{SEQ}")
        tgt = Asset(name="code", id_format="CODE-{SEQ}")
        op = Operator("claude_agent", F_P, "agent://claude/genesis")
        edge = Edge(name="design→code", source=src, target=tgt, using=[op])
        return Job(edge=edge, evaluators=evaluators)

    def _stream_with_fp_pass(self, tmp_path: Path, evaluator_name: str) -> EventStream:
        """Stream containing one assessed{fp, pass} event for the given evaluator."""
        stream = _make_stream(tmp_path)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": evaluator_name,
            "result": "pass",
            "spec_hash": "h1",
        })
        return stream

    def test_two_fp_evaluators_reversed(self, tmp_path):
        """Two F_P evaluators: one resolved, one not. Order must not matter."""
        ev_a = Evaluator("check_a", F_P, "Agent check A")
        ev_b = Evaluator("check_b", F_P, "Agent check B")

        # Only check_a is resolved in the stream
        stream = self._stream_with_fp_pass(tmp_path, "check_a")

        job_ab = self._make_job_with_order([ev_a, ev_b])
        job_ba = self._make_job_with_order([ev_b, ev_a])

        d_ab = delta(job_ab, stream, tmp_path, spec_hash="h1")
        d_ba = delta(job_ba, stream, tmp_path, spec_hash="h1")

        assert d_ab == d_ba
        assert d_ab == 0.5  # 1 of 2 failing

    def test_mixed_fd_fp_fh_all_failing(self, tmp_path):
        """Mix of F_D, F_P, F_H — all failing. Any order gives delta = 1.0."""
        ev_fd = Evaluator("file_exists", F_D, "file must exist")
        ev_fp = Evaluator("code_complete", F_P, "LLM check")
        ev_fh = Evaluator("human_gate", F_H, "human approval")

        stream = _make_stream(tmp_path)  # empty — nothing resolved

        orderings = [
            [ev_fd, ev_fp, ev_fh],
            [ev_fh, ev_fd, ev_fp],
            [ev_fp, ev_fh, ev_fd],
            [ev_fh, ev_fp, ev_fd],
            [ev_fd, ev_fh, ev_fp],
            [ev_fp, ev_fd, ev_fh],
        ]

        deltas = []
        for order in orderings:
            job = self._make_job_with_order(order)
            d = delta(job, stream, tmp_path)
            deltas.append(d)

        # All permutations must produce the same delta
        assert all(d == deltas[0] for d in deltas), f"deltas differ: {deltas}"
        assert deltas[0] == 1.0  # all failing

    def test_mixed_fd_fp_fh_partial_convergence(self, tmp_path):
        """F_P resolved, F_D and F_H failing. Order must not matter."""
        ev_fd = Evaluator("file_exists", F_D, "file must exist")
        ev_fp = Evaluator("code_complete", F_P, "LLM check")
        ev_fh = Evaluator("human_gate", F_H, "human approval")

        stream = _make_stream(tmp_path)
        # Resolve only the F_P evaluator
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
        })

        orderings = [
            [ev_fd, ev_fp, ev_fh],
            [ev_fh, ev_fd, ev_fp],
            [ev_fp, ev_fh, ev_fd],
            [ev_fh, ev_fp, ev_fd],
        ]

        deltas = []
        for order in orderings:
            job = self._make_job_with_order(order)
            d = delta(job, stream, tmp_path, spec_hash=None)
            deltas.append(d)

        assert all(d == deltas[0] for d in deltas), f"deltas differ: {deltas}"
        # 2 of 3 failing (F_D no command = fail closed, F_H no approval)
        assert abs(deltas[0] - 2 / 3) < 1e-9

    def test_mixed_with_fh_approved(self, tmp_path):
        """F_H approved, F_P resolved, F_D failing. Order must not matter."""
        ev_fd = Evaluator("file_exists", F_D, "file must exist")
        ev_fp = Evaluator("code_complete", F_P, "LLM check")
        ev_fh = Evaluator("human_gate", F_H, "human approval")

        stream = _make_stream(tmp_path)
        # Resolve F_P
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
        })
        # Approve F_H
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "human",
        })

        orderings = [
            [ev_fd, ev_fp, ev_fh],
            [ev_fh, ev_fp, ev_fd],
            [ev_fp, ev_fd, ev_fh],
        ]

        deltas = []
        for order in orderings:
            job = self._make_job_with_order(order)
            d = delta(job, stream, tmp_path, spec_hash=None)
            deltas.append(d)

        assert all(d == deltas[0] for d in deltas), f"deltas differ: {deltas}"
        # Only F_D failing (1 of 3)
        assert abs(deltas[0] - 1 / 3) < 1e-9

    def test_all_converged_any_order(self, tmp_path):
        """All evaluators converged — delta = 0.0 regardless of order."""
        ev_fp = Evaluator("code_complete", F_P, "LLM check")
        ev_fh = Evaluator("human_gate", F_H, "human approval")

        stream = _make_stream(tmp_path)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
        })
        stream.append("approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "human",
        })

        job_fp_fh = self._make_job_with_order([ev_fp, ev_fh])
        job_fh_fp = self._make_job_with_order([ev_fh, ev_fp])

        d1 = delta(job_fp_fh, stream, tmp_path, spec_hash=None)
        d2 = delta(job_fh_fp, stream, tmp_path, spec_hash=None)

        assert d1 == d2 == 0.0

    def test_multiple_fp_evaluators_shuffled(self, tmp_path):
        """Four F_P evaluators, two resolved. All 24 permutations give same delta."""
        import itertools

        evals = [
            Evaluator("check_a", F_P, "A"),
            Evaluator("check_b", F_P, "B"),
            Evaluator("check_c", F_P, "C"),
            Evaluator("check_d", F_P, "D"),
        ]

        stream = _make_stream(tmp_path)
        # Resolve check_a and check_c
        for name in ("check_a", "check_c"):
            stream.append("assessed", {
                "kind": "fp",
                "edge": "design→code",
                "evaluator": name,
                "result": "pass",
                "spec_hash": "s1",
            })

        # Test all 24 permutations
        deltas = []
        for perm in itertools.permutations(evals):
            job = self._make_job_with_order(list(perm))
            d = delta(job, stream, tmp_path, spec_hash="s1")
            deltas.append(d)

        assert len(deltas) == 24
        assert all(d == deltas[0] for d in deltas), f"deltas vary across permutations"
        assert deltas[0] == 0.5  # 2 of 4 failing


# ── ADR-027: Run governance — use-case scenarios ─────────────────────────────

from genesis.schedule import (
    RunState, RUN_STATES, FAILURE_CLASSES,
    run_state, find_pending_run, supersede_run,
)


class TestRunLifecycleScenarios:
    """REQ-F-RUN-001: Run lifecycle derived from events.

    Each test is a use case — a full scenario through the state machine, not
    an isolated state transition. The requirement is: state is derivable at
    every point in the lifecycle by replaying the event stream.
    """

    def test_happy_path_to_convergence(self):
        """UC-1: Run completes successfully — full lifecycle.
        started → dispatched → assessed → converged.
        State is correct at every checkpoint."""
        events = [
            {"event_type": "run_started", "data": {
                "run_id": "r1", "edge": "design→code", "work_key": "REQ-F-AUTH",
            }},
            {"event_type": "fp_dispatched", "data": {
                "run_id": "r1", "edge": "design→code",
            }},
            {"event_type": "assessed", "data": {
                "run_id": "r1", "edge": "design→code", "result": "pass",
            }},
        ]
        # Verify at each stage
        rs = run_state(events[:1], "r1")
        assert rs.state == "started"
        assert rs.work_key == "REQ-F-AUTH"
        assert rs.edge == "design→code"

        rs = run_state(events[:2], "r1")
        assert rs.state == "dispatched"

        rs = run_state(events, "r1")
        assert rs.state == "assessed"  # terminal success for a run

    def test_transport_failure_then_retry_succeeds(self):
        """UC-2: First attempt crashes, second attempt succeeds.
        r1: started → dispatched → failed{transport_failure}
        r2: started → dispatched → assessed
        Both attempts visible, r1 doesn't contaminate r2."""
        events = [
            # Attempt 1 — crashes
            {"event_type": "run_started", "data": {
                "run_id": "r1", "edge": "design→code", "attempt_number": 1,
            }},
            {"event_type": "fp_dispatched", "data": {"run_id": "r1", "edge": "design→code"}},
            {"event_type": "run_failed", "data": {
                "run_id": "r1", "failure_class": "transport_failure",
            }},
            # Attempt 2 — succeeds
            {"event_type": "run_started", "data": {
                "run_id": "r2", "edge": "design→code", "attempt_number": 2,
            }},
            {"event_type": "fp_dispatched", "data": {"run_id": "r2", "edge": "design→code"}},
            {"event_type": "assessed", "data": {"run_id": "r2", "edge": "design→code"}},
        ]
        r1 = run_state(events, "r1")
        r2 = run_state(events, "r2")
        assert r1.state == "failed"
        assert r1.failure_class == "transport_failure"
        assert r1.attempt_number == 1
        assert r2.state == "assessed"  # terminal success — convergence is edge-level
        assert r2.attempt_number == 2

    def test_supersession_replaces_stale_run(self):
        """UC-3: Operator re-dispatches before first run completes.
        r1: started → dispatched → superseded (by r2)
        r2: started → dispatched → assessed → converged
        Superseded run is recorded but not applied to convergence."""
        sup_event = supersede_run("r1", "r2", "design→code", work_key="REQ-F-AUTH")
        events = [
            {"event_type": "run_started", "data": {
                "run_id": "r1", "edge": "design→code", "work_key": "REQ-F-AUTH",
            }},
            {"event_type": "fp_dispatched", "data": {"run_id": "r1", "edge": "design→code"}},
            sup_event,
            {"event_type": "run_started", "data": {
                "run_id": "r2", "edge": "design→code", "work_key": "REQ-F-AUTH",
            }},
            {"event_type": "fp_dispatched", "data": {"run_id": "r2", "edge": "design→code"}},
            {"event_type": "assessed", "data": {"run_id": "r2", "edge": "design→code"}},
        ]
        r1 = run_state(events, "r1")
        r2 = run_state(events, "r2")
        assert r1.state == "superseded"
        assert r1.superseded_by == "r2"
        assert r2.state == "assessed"

    def test_unknown_run_id_returns_none(self):
        """UC-4: Querying a run that never existed returns None — no crash."""
        events = [{"event_type": "edge_started", "data": {"edge": "a→b"}}]
        assert run_state(events, "ghost-run") is None


class TestWaiterDeduplication:
    """REQ-F-RUN-003: At most one run per (work_key, edge) in active state.

    Use cases for the deduplication invariant — the system must prevent
    duplicate dispatch while a run is in flight.
    """

    def test_dispatched_run_blocks_second_dispatch(self):
        """UC-5: While r1 is dispatched, find_pending_run returns it.
        The command layer uses this to return 'pending' instead of re-dispatching."""
        events = [
            {"event_type": "run_started", "data": {"run_id": "r1", "edge": "design→code"}},
            {"event_type": "fp_dispatched", "data": {"run_id": "r1", "edge": "design→code"}},
        ]
        pending = find_pending_run(events, "design→code")
        assert pending is not None
        assert pending.run_id == "r1"

    def test_assessed_run_unblocks_new_dispatch(self):
        """UC-6: After r1 is assessed, no pending run — new dispatch allowed."""
        events = [
            {"event_type": "run_started", "data": {"run_id": "r1", "edge": "design→code"}},
            {"event_type": "fp_dispatched", "data": {"run_id": "r1", "edge": "design→code"}},
            {"event_type": "assessed", "data": {"run_id": "r1", "edge": "design→code"}},
        ]
        assert find_pending_run(events, "design→code") is None

    def test_failed_run_unblocks_new_dispatch(self):
        """UC-7: After r1 fails, slot is free — retry can proceed."""
        events = [
            {"event_type": "run_started", "data": {"run_id": "r1", "edge": "design→code"}},
            {"event_type": "fp_dispatched", "data": {"run_id": "r1", "edge": "design→code"}},
            {"event_type": "run_failed", "data": {
                "run_id": "r1", "failure_class": "transport_failure",
            }},
        ]
        assert find_pending_run(events, "design→code") is None

    def test_superseded_run_unblocks_new_dispatch(self):
        """UC-8: Superseded run no longer blocks — new run takes the slot."""
        sup = supersede_run("r1", "r2", "design→code")
        events = [
            {"event_type": "fp_dispatched", "data": {"run_id": "r1", "edge": "design→code"}},
            sup,
            {"event_type": "fp_dispatched", "data": {"run_id": "r2", "edge": "design→code"}},
        ]
        pending = find_pending_run(events, "design→code")
        assert pending.run_id == "r2"  # New run, not the superseded one

    def test_work_keys_are_independent_slots(self):
        """UC-9: Pending run on wk1 does not block dispatch for wk2.
        Each (edge, work_key) has its own deduplication slot."""
        events = [
            {"event_type": "fp_dispatched", "data": {
                "run_id": "r1", "edge": "design→code", "work_key": "REQ-F-AUTH",
            }},
        ]
        # wk1 blocked
        assert find_pending_run(events, "design→code", work_key="REQ-F-AUTH") is not None
        # wk2 free
        assert find_pending_run(events, "design→code", work_key="REQ-F-BILLING") is None

    def test_different_edges_are_independent_slots(self):
        """UC-10: Pending run on edge A does not block edge B."""
        events = [
            {"event_type": "fp_dispatched", "data": {
                "run_id": "r1", "edge": "design→code",
            }},
        ]
        assert find_pending_run(events, "design→code") is not None
        assert find_pending_run(events, "code→tests") is None

    def test_global_run_does_not_block_scoped_run(self):
        """UC-11: Global (unscoped) pending run on edge does NOT block
        a work_key-scoped query on the same edge. These are independent slots."""
        events = [
            {"event_type": "fp_dispatched", "data": {
                "run_id": "r-global", "edge": "design→code",
                # no work_key — global run
            }},
        ]
        # Global query finds it
        assert find_pending_run(events, "design→code") is not None
        # Scoped query does NOT — independent slots
        assert find_pending_run(events, "design→code", work_key="REQ-F-AUTH") is None

    def test_scoped_run_does_not_block_global_query(self):
        """UC-12: Scoped pending run does NOT block a global query."""
        events = [
            {"event_type": "fp_dispatched", "data": {
                "run_id": "r-scoped", "edge": "design→code",
                "work_key": "REQ-F-AUTH",
            }},
        ]
        # Scoped query for same key finds it
        assert find_pending_run(events, "design→code", work_key="REQ-F-AUTH") is not None
        # Global query does NOT
        assert find_pending_run(events, "design→code") is None


# ── Leaf task iterate integration ────────────────────────────────────────────

from genesis.schedule import LeafTask  # noqa: E402


class TestIterateLeafTaskIntegration:
    """REQ-F-LEAF-001: leaf tasks within iterate()."""

    def _make_fp_bound_job(self, tmp_path):
        """Helper: BoundJob with failing F_P evaluator (triggers dispatch path)."""
        fp_eval = Evaluator("code_complete", F_P, "LLM check")
        job = _make_job([fp_eval])
        pre = PrecomputedManifest(
            job=job,
            current_asset={"status": "not_started"},
            failing_evaluators=[fp_eval],
            passing_evaluators=[],
            fd_results={},
            relevant_contexts={},
            delta_summary="1 failing",
        )
        return BoundJob(job=job, precomputed=pre, prompt="build it",
                        manifest_id="m-001", result_path=str(tmp_path / "r.json"))

    def test_iterate_no_leaf_tasks_is_v1_behavior(self, tmp_path):
        """UC-L6: iterate() with no leaf_tasks → identical to V1.
        No leaf events in the surface, only fp_dispatched."""
        bound = self._make_fp_bound_job(tmp_path)
        surface = iterate(bound)
        event_types = [e["event_type"] for e in surface.events]
        assert "fp_dispatched" in event_types
        assert "leaf_task_started" not in event_types
        assert "leaf_task_completed" not in event_types

    def test_iterate_with_leaf_tasks_emits_leaf_events(self, tmp_path):
        """UC-L7: iterate() with leaf_tasks emits leaf_task_started +
        leaf_task_completed before fp_dispatched."""
        bound = self._make_fp_bound_job(tmp_path)
        task = LeafTask(
            name="extract_deps",
            input_schema={"type": "object"},
            output_schema={"type": "object"},
        )

        def mock_dispatch(t, inp):
            return {"deps": ["A", "B"]}, None  # success

        surface = iterate(bound, leaf_tasks=[task], on_leaf_dispatch=mock_dispatch)
        event_types = [e["event_type"] for e in surface.events]

        assert "leaf_task_started" in event_types
        assert "leaf_task_completed" in event_types
        assert "fp_dispatched" in event_types
        # Leaf events come before fp_dispatched
        lt_idx = event_types.index("leaf_task_started")
        fp_idx = event_types.index("fp_dispatched")
        assert lt_idx < fp_idx

    def test_iterate_leaf_task_failure_emits_failed_event(self, tmp_path):
        """Leaf task dispatch failure → leaf_task_failed event recorded."""
        bound = self._make_fp_bound_job(tmp_path)
        task = LeafTask(
            name="parse_reqs",
            input_schema={"type": "object"},
            output_schema={"type": "object"},
            timeout_ms=5000,
        )

        def mock_dispatch(t, inp):
            return None, "transport_failure"

        surface = iterate(bound, leaf_tasks=[task], on_leaf_dispatch=mock_dispatch)
        event_types = [e["event_type"] for e in surface.events]
        assert "leaf_task_started" in event_types
        assert "leaf_task_failed" in event_types
        # Still dispatches F_P even if leaf task failed
        assert "fp_dispatched" in event_types
        failed = [e for e in surface.events if e["event_type"] == "leaf_task_failed"][0]
        assert failed["data"]["failure_class"] == "transport_failure"

    def test_iterate_leaf_task_receives_input_data(self, tmp_path):
        """Leaf task dispatch receives input data from leaf_task_inputs map."""
        bound = self._make_fp_bound_job(tmp_path)
        task = LeafTask(
            name="analyze_spec",
            input_schema={"type": "object", "required": ["text"]},
            output_schema={"type": "object"},
        )
        received_inputs = []

        def mock_dispatch(t, inp):
            received_inputs.append(inp)
            return {"result": "ok"}, None

        surface = iterate(
            bound,
            leaf_tasks=[task],
            on_leaf_dispatch=mock_dispatch,
            leaf_task_inputs={"analyze_spec": {"text": "hello world"}},
        )
        assert len(received_inputs) == 1
        assert received_inputs[0] == {"text": "hello world"}

    def test_iterate_leaf_task_uses_run_id_not_manifest_id(self, tmp_path):
        """Leaf task sub-run ID derives from run_id, not manifest_id."""
        bound = self._make_fp_bound_job(tmp_path)
        task = LeafTask(
            name="check_deps",
            input_schema={"type": "object"},
            output_schema={"type": "object"},
        )

        def mock_dispatch(t, inp):
            return {"ok": True}, None

        surface = iterate(
            bound,
            leaf_tasks=[task],
            on_leaf_dispatch=mock_dispatch,
            run_id="run-42",
        )
        started = [e for e in surface.events if e["event_type"] == "leaf_task_started"][0]
        assert started["data"]["run_id"] == "run-42/leaf/check_deps"
        assert started["data"]["parent_run_id"] == "run-42"

    def test_iterate_leaf_task_missing_input_gets_empty_dict(self, tmp_path):
        """Tasks not in leaf_task_inputs receive empty dict (backward compat)."""
        bound = self._make_fp_bound_job(tmp_path)
        task = LeafTask(
            name="unlisted_task",
            input_schema={"type": "object"},
            output_schema={"type": "object"},
        )
        received = []

        def mock_dispatch(t, inp):
            received.append(inp)
            return {}, None

        surface = iterate(
            bound,
            leaf_tasks=[task],
            on_leaf_dispatch=mock_dispatch,
            leaf_task_inputs={"other_task": {"data": 1}},
        )
        assert received[0] == {}
