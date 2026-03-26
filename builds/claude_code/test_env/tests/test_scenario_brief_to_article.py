# Validates: REQ-F-BOOT-001
# Validates: REQ-F-PKG-001
# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
# Validates: REQ-F-GATE-002
# Validates: REQ-F-EVAL-002
# Validates: REQ-F-EVAL-004
# Validates: REQ-F-BIND-001
# Validates: REQ-F-CORE-001
# Validates: REQ-NFR-E2E-001
"""
Scenario: brief → article (content pipeline — single-input generation).

Disjoint single-hop fixture. Proves the ABG kernel can carry a content
pipeline transformation where a brief is transformed into a published
article. Exercises single-input generation with methodology context.

This is a self-contained mini-project. Fresh sandbox, vanilla install,
explicit synthetic package, no chaining, no upstream dependencies.

Two equal proofs:
  1. Asset truth — correct artifact created with correct manifest
  2. Event/postmortem truth — audit trail explains what happened and why

Each test run is archived at tests/runs/brief_to_article/<timestamp>/
for postmortem investigation. The full workspace snapshot persists.

Run: cd builds/claude_code/test_env && ./run_tests file tests/test_scenario_brief_to_article.py
"""
import json
import textwrap
from pathlib import Path

import pytest

from scenario_helpers import (
    RunArchive, install_sandbox, write_test_package,
    run_genesis, run_genesis_json, emit_event, read_events, compute_spec_hash,
    dispatch_fp_and_read_manifest, assert_manifest_truth,
    run_full_lifecycle, assert_event_chain, assert_failure_inspectable,
)


# ── Domain package ───────────────────────────────────────────────────────────

_PACKAGE = textwrap.dedent('''\
    """Content pipeline: brief to article."""
    from gtl.graph import Graph, Node, GraphVector, Context
    from gtl.module_model import Module
    from gtl.work_model import Job, ContractRef
    from gtl.operator_model import Evaluator, Operator, Rule, F_D, F_P

    brief = Node(
        name="brief",
        markov=("topic_defined", "audience_identified", "scope_bounded"),
    )
    article = Node(
        name="article",
        markov=("content_complete", "references_cited", "word_count_met"),
    )
    ctx = Context(
        name="writing_methodology",
        locator="workspace://methodology/writing_guide.md",
        digest="sha256:" + "0" * 64,
    )
    op_fd = Operator("artifact_check", F_D, "exec://test -f output/article.md")
    op_fp = Operator("content_agent", F_P, "agent://content/writer")
    eval_fd = Evaluator("artifact_exists", F_D,
        "output artifact exists at output/article.md",
        binding="exec://test -f output/article.md")
    eval_fp = Evaluator("content_quality", F_P,
        "agent: article content satisfies brief requirements")
    vector = GraphVector(
        name="brief\\u2192article",
        source=brief, target=article,
        operators=(op_fd, op_fp),
        evaluators=(eval_fd, eval_fp),
        contexts=(ctx,),
    )
    job = Job(name=vector.name, contracts=(ContractRef(kind="graph_vector", target_id=vector.id),))
    graph = Graph(
        name="brief\\u2192article",
        inputs=(brief,), outputs=(article,),
        nodes=(brief, article), vectors=(vector,),
        contexts=(ctx,),
    )
    module = Module(
        name="content_pipeline",
        graphs=(graph,),
        jobs=(job,),
        metadata={"requirements": ["REQ-CONTENT-001", "REQ-CONTENT-002"]},
    )
''')

_EDGE = "brief→article"
_FP_EVAL = "content_quality"
_ARTIFACT_PATH = "output/article.md"
_PKG_NAME = "content_pipeline"


# ── Sandbox setup ────────────────────────────────────────────────────────────

def _setup(archive: RunArchive) -> Path:
    """Fresh sandbox with content pipeline package + writing methodology context."""
    target = archive.workspace
    install_sandbox(target, archive=archive)
    write_test_package(target, _PACKAGE)
    d = target / "methodology"
    d.mkdir(parents=True, exist_ok=True)
    (d / "writing_guide.md").write_text(
        "# Writing Methodology\n\n"
        "## Style Requirements\n"
        "- Clear, concise prose\n"
        "- Referenced claims must cite sources\n"
        "- Target word count: 500-1000 words\n"
    )
    return target


# ── Asset truth ──────────────────────────────────────────────────────────────

@pytest.mark.integration
class TestAssetTruth:
    """Proof 1: the kernel creates the correct output artifact for this hop."""

    def test_gap_truth(self, run_archive):
        """Before any work, gaps correctly reports unconverged state."""
        target = _setup(run_archive)
        data = run_genesis_json(target, "gaps", archive=run_archive)
        assert data["scope"]["package"] == _PKG_NAME
        assert data["converged"] is False
        assert data["total_delta"] > 0
        gap = data["gaps"][0]
        assert gap["edge"] == _EDGE
        assert "artifact_exists" in gap["failing"]
        assert _FP_EVAL in gap["failing"]

    def test_fd_escalates_to_fp(self, run_archive):
        """REQ-F-GATE-002 (ADR-021): F_D failure escalates to F_P dispatch."""
        target = _setup(run_archive)
        result = run_genesis(target, "iterate", archive=run_archive)
        assert result.returncode == 0
        data = json.loads(result.stdout)
        assert "fp_manifest_path" in data

    def test_manifest_truth(self, run_archive):
        """Manifest carries process, intent, context, destination correctly."""
        target = _setup(run_archive)
        manifest = dispatch_fp_and_read_manifest(
            target, _ARTIFACT_PATH, "# Draft Article\nPlaceholder.\n",
            archive=run_archive)
        assert_manifest_truth(
            manifest,
            edge_name=_EDGE,
            source_asset="brief",
            target_asset="article",
            source_markov={"brief": ["topic_defined", "audience_identified", "scope_bounded"]},
            target_markov=["content_complete", "references_cited", "word_count_met"],
            requirements=["REQ-CONTENT-001", "REQ-CONTENT-002"],
            fp_evaluator=_FP_EVAL,
            context_names=["writing_methodology"],
            context_content_markers={"writing_methodology": "Style Requirements"},
        )

    def test_convergence(self, run_archive):
        """Full lifecycle: gap → F_D pass → F_P act → converge."""
        target = _setup(run_archive)
        run_full_lifecycle(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            artifact_path=_ARTIFACT_PATH,
            artifact_content="# Complete Article\nFull content with references [1].\n",
            archive=run_archive,
        )


# ── Event / postmortem truth ─────────────────────────────────────────────────

@pytest.mark.integration
class TestEventPostmortemTruth:
    """Proof 2: the audit trail explains what happened and why."""

    def test_failure_inspectable(self, run_archive):
        """Gap report has enough detail to diagnose failure state."""
        target = _setup(run_archive)
        assert_failure_inspectable(target, archive=run_archive)

    def test_event_chain_after_convergence(self, run_archive):
        """After full lifecycle, event chain is complete and correctly ordered."""
        target = _setup(run_archive)
        run_full_lifecycle(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            artifact_path=_ARTIFACT_PATH,
            artifact_content="# Complete Article\nFull content with references [1].\n",
            archive=run_archive,
        )
        assert_event_chain(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            package_name=_PKG_NAME,
            artifact_path=_ARTIFACT_PATH,
        )

    def test_manifest_persisted_for_audit(self, run_archive):
        """F_P manifest file persists on disk for postmortem inspection."""
        target = _setup(run_archive)
        manifest = dispatch_fp_and_read_manifest(
            target, _ARTIFACT_PATH, "# Draft Article\nPlaceholder.\n",
            archive=run_archive)
        assert "manifest_id" in manifest
        assert "edge" in manifest
        assert "spec_hash" in manifest
        assert "prompt" in manifest
        assert "result_path" in manifest
        assert "fd_results" in manifest
        assert "delta" in manifest

    def test_fd_findings_event_on_escalation(self, run_archive):
        """REQ-F-GATE-002 (ADR-021): F_D failure emits found{kind:fd_findings} for escalation."""
        target = _setup(run_archive)
        run_genesis(target, "iterate", archive=run_archive)
        events = read_events(target)
        fd_findings = [e for e in events
                       if e["event_type"] == "found"
                       and e.get("data", {}).get("kind") == "fd_findings"]
        assert len(fd_findings) >= 1, "F_D failure must emit found{kind:fd_findings} event"
        assert fd_findings[-1]["data"]["edge"] == _EDGE
        assert "failing" in fd_findings[-1]["data"]
