# Implements: REQ-F-TEST-002
# Validates: REQ-F-TEST-002
# Validates: REQ-F-CORE-002
# Validates: REQ-F-CORE-003
# Validates: REQ-F-CMD-004
# Validates: REQ-F-EVAL-002
"""
Property invariant tests — REQ-F-TEST-002.

These tests verify formal properties that must hold across all workspace states.
They are not scenario tests — they assert mathematical invariants of the
event stream model and engine behaviour:

  1. Replay determinism — project(S, T, I) is identical for the same stream
  2. gen_gaps idempotence — converged workspace, run twice, no new events
  3. No duplicate edge_converged certificates — (edge, feature) appears exactly once
  4. Stale spec_hash never converges — wrong hash means assessed (kind=fp) is ignored

Reference: ADR-015-integration-primary-test-architecture.md, §XII, §V.
"""
from __future__ import annotations

from pathlib import Path

from gtl.graph import Graph, Node, GraphVector, Context
from gtl.module_model import Module
from gtl.operator_model import Evaluator, Operator, F_D, F_P, F_H, Rule
from gtl.operator_model import consensus

from genesis.provenance import req_hash
from genesis.install import workspace_bootstrap
from genesis.projection import project
from genesis.events import EventStream
from genesis.services import Scope, gen_gaps


# ── Shared fixture ─────────────────────────────────────────────────────────────

def _make_minimal_module(requirements: list[str] | None = None) -> Module:
    """Minimal F_D + F_P module for property testing (no subprocess commands needed)."""
    requirements = requirements or ["REQ-PROP-001"]
    design = Node(name="design")
    code = Node(name="code")
    ctx = Context(name="ctx", locator="workspace://ctx.md", digest="sha256:" + "0" * 64)

    # F_D: always passes — property tests focus on F_P/spec_hash behaviour, not F_D
    eval_fd = Evaluator(
        "always_pass", F_D,
        "Placeholder F_D — always passes for property testing",
        binding="exec://python -c 'import sys; sys.exit(0)'",
    )
    eval_fp = Evaluator("code_complete", F_P, "Code implements spec")

    op_agent  = Operator("claude_agent", F_P, "agent://claude/genesis")
    op_check  = Operator("always_pass",  F_D, "exec://python -c 'import sys; sys.exit(0)'")

    vector = GraphVector(
        name="design→code",
        source=design, target=code,
        operators=(op_agent, op_check),
        evaluators=(eval_fd, eval_fp),
        contexts=(ctx,),
    )

    graph = Graph(
        name="property_test",
        inputs=(design,), outputs=(code,),
        nodes=(design, code),
        vectors=(vector,),
        contexts=(ctx,),
    )

    return Module(
        name="property_test",
        graphs=(graph,),
        metadata={"requirements": requirements},
    )


def _converged_scope(tmp_path: Path) -> tuple[Scope, "EventStream"]:
    """
    Return a fully converged scope + stream in tmp_path.

    F_D passes vacuously (nonexistent_dir → check-tags returns passes=True with 0 files).
    F_P is resolved by appending an assessed (kind=fp) event with the correct spec_hash.
    """
    module = _make_minimal_module()
    stream = workspace_bootstrap(tmp_path)
    spec_hash = req_hash(module.metadata["requirements"])

    stream.append("assessed", {
        "kind": "fp",
        "edge": "design→code",
        "evaluator": "code_complete",
        "result": "pass",
        "spec_hash": spec_hash,
    })

    scope = Scope(module=module, workspace_root=tmp_path)
    return scope, stream


# ── Property tests ─────────────────────────────────────────────────────────────

class TestReplayDeterminism:
    """
    Property: project(S, T, I) = project(S, T, I) always.
    Same event stream, same asset type, same instance → identical projection.
    REQ-F-CORE-002.
    """

    def test_empty_stream_deterministic(self, tmp_path):
        stream = workspace_bootstrap(tmp_path)
        s1 = project(stream, "code", "current")
        s2 = project(stream, "code", "current")
        assert s1 == s2

    def test_stream_with_events_deterministic(self, tmp_path):
        stream = workspace_bootstrap(tmp_path)
        stream.append("edge_started", {
            "edge": "design→code",
            "build": "claude_code",
            "target": "code",
        })
        stream.append("edge_converged", {
            "edge": "design→code",
            "target": "code",
            "feature": None,
            "delta": 0,
            "certified_by": "gen_gaps",
        })
        s1 = project(stream, "code", "current")
        s2 = project(stream, "code", "current")
        assert s1 == s2

    def test_projection_after_convergence_deterministic(self, tmp_path):
        scope, stream = _converged_scope(tmp_path)
        gen_gaps(scope, stream)  # emits edge_converged

        # Project same state twice
        s1 = project(stream, "code", "current")
        s2 = project(stream, "code", "current")
        assert s1 == s2, "Replay determinism violated: project() returned different results for same stream"


class TestGenGapsIdempotence:
    """
    Property: running gen_gaps twice on a converged workspace emits no new events.
    Idempotence: f(f(x)) = f(x).
    REQ-F-CMD-004.
    """

    def test_gen_gaps_idempotent_on_converged_workspace(self, tmp_path):
        scope, stream = _converged_scope(tmp_path)

        # First call: emits edge_converged
        result1 = gen_gaps(scope, stream)
        assert result1["converged"] is True
        count_after_first = len(stream.all_events())

        # Second call: must not emit additional events
        result2 = gen_gaps(scope, stream)
        count_after_second = len(stream.all_events())

        assert count_after_second == count_after_first, (
            f"gen_gaps idempotence violated: "
            f"{count_after_second - count_after_first} new events emitted on second call"
        )
        assert result2["converged"] is True

    def test_gen_gaps_idempotent_multiple_calls(self, tmp_path):
        scope, stream = _converged_scope(tmp_path)
        gen_gaps(scope, stream)  # first call
        count_base = len(stream.all_events())

        for _ in range(5):
            gen_gaps(scope, stream)

        assert len(stream.all_events()) == count_base, (
            "gen_gaps must not grow the event stream when the workspace is already converged"
        )


class TestNoDuplicateCertificates:
    """
    Property: edge_converged events appear at most once per (edge, feature) pair.
    REQ-F-CMD-004.
    """

    def test_no_duplicate_edge_converged_for_same_edge(self, tmp_path):
        scope, stream = _converged_scope(tmp_path)

        # Run gen_gaps multiple times
        for _ in range(4):
            gen_gaps(scope, stream)

        certs = [
            (e["data"]["edge"], e["data"].get("feature"))
            for e in stream.all_events()
            if e["event_type"] == "edge_converged"
        ]
        # Count per (edge, feature) pair
        from collections import Counter
        counts = Counter(certs)
        duplicates = {k: v for k, v in counts.items() if v > 1}
        assert not duplicates, (
            f"Duplicate edge_converged certificates found: {duplicates}"
        )

    def test_no_duplicate_certificates_across_features(self, tmp_path):
        """Two different features on same edge each get exactly one certificate."""
        module = _make_minimal_module()
        spec_hash = req_hash(module.metadata["requirements"])

        for feature in ("FEAT-A", "FEAT-B"):
            ws = tmp_path / feature
            stream = workspace_bootstrap(ws)

            # Feature YAML required for _scoped_jobs feature validation
            active_dir = ws / ".ai-workspace" / "features" / "active"
            active_dir.mkdir(parents=True, exist_ok=True)
            (active_dir / f"{feature}.yml").write_text(
                f"id: {feature}\nstatus: active\nsatisfies:\n  - REQ-PROP-001\n"
            )

            stream.append("assessed", {
                "kind": "fp",
                "edge": "design→code",
                "evaluator": "code_complete",
                "result": "pass",
                "spec_hash": spec_hash,
            })
            scope = Scope(
                module=module, workspace_root=ws,
                feature=feature,
            )
            gen_gaps(scope, stream)
            gen_gaps(scope, stream)  # second call must not duplicate

            certs = [
                e for e in stream.all_events()
                if e["event_type"] == "edge_converged"
                and e["data"].get("feature") == feature
            ]
            assert len(certs) == 1, (
                f"Feature {feature}: expected 1 edge_converged, got {len(certs)}"
            )


class TestStaleSpecHashRejection:
    """
    Property: assessed (kind=fp) events with wrong spec_hash never contribute to convergence.
    The engine must re-dispatch F_P after spec changes.
    REQ-F-EVAL-002, REQ-F-EVAL-004.
    """

    def test_stale_hash_does_not_satisfy_bind_fd(self, tmp_path):
        """assessed (kind=fp) with incorrect spec_hash — edge does not converge."""
        module = _make_minimal_module(["REQ-NEW-001"])
        stream = workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path)

        # Emit assessed (kind=fp) with WRONG spec_hash
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": "wrong_hash_00000",
        })

        result = gen_gaps(scope, stream)
        assert result["converged"] is False
        failing = [f for g in result["gaps"] for f in g["failing"]]
        assert "code_complete" in failing, (
            "code_complete must remain failing when spec_hash does not match"
        )

    def test_correct_hash_after_stale_converges(self, tmp_path):
        """Correct spec_hash after stale entry: only the correct one converges."""
        module = _make_minimal_module(["REQ-NEW-001"])
        spec_hash = req_hash(module.metadata["requirements"])
        stream = workspace_bootstrap(tmp_path)
        scope = Scope(module=module, workspace_root=tmp_path)

        # First: stale (wrong hash)
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": "stale_00000000000",
        })
        assert gen_gaps(scope, stream)["converged"] is False

        # Then: correct hash
        stream.append("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "spec_hash": spec_hash,
        })
        assert gen_gaps(scope, stream)["converged"] is True


