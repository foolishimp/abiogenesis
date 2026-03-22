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
Scenario: intent → requirements (narrative → normative).

Disjoint single-hop fixture. Proves the ABG kernel can carry a transformation
where broad problem-framing intent becomes normative requirement structure.
Exercises policy/standards context and structured textual output.

This is a self-contained mini-project. Fresh sandbox, vanilla install,
explicit synthetic package, no chaining, no upstream dependencies.

Two equal proofs:
  1. Asset truth — correct artifact created with correct manifest
  2. Event/postmortem truth — audit trail explains what happened and why

Each test run is archived at tests/runs/intent_to_requirements/<timestamp>/
for postmortem investigation.

Run: pytest builds/claude_code/tests/test_scenario_intent_to_requirements.py -v
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
    """Narrative intent to normative requirements."""
    from gtl.core import (
        Asset, Context, Edge, Evaluator, Job, Operator,
        Package, Rule, Worker, F_D, F_P, consensus,
    )

    intent = Asset(
        name="intent",
        id_format="INT-{SEQ}",
        markov=["problem_stated", "value_proposition_clear", "scope_bounded"],
    )
    requirements = Asset(
        name="requirements",
        id_format="REQ-{SEQ}",
        lineage=[intent],
        markov=["keys_testable", "intent_covered", "no_implementation_details"],
    )
    ctx_policy = Context(
        name="standards_policy",
        locator="workspace://policy/requirements_standards.md",
        digest="sha256:" + "0" * 64,
    )
    op_fd = Operator("artifact_check", F_D, "exec://test -f output/requirements.md")
    op_fp = Operator("req_analyst", F_P, "agent://analysis/requirements")
    edge = Edge(
        name="intent\\u2192requirements",
        source=intent, target=requirements,
        using=[op_fd, op_fp], context=[ctx_policy],
    )
    eval_fd = Evaluator("artifact_exists", F_D,
        "requirements document exists at output/requirements.md",
        command="test -f output/requirements.md")
    eval_fp = Evaluator("req_quality", F_P,
        "agent: requirements are testable, cover intent, contain no implementation details")
    job = Job(edge=edge, evaluators=[eval_fd, eval_fp])
    package = Package(
        name="req_analysis",
        assets=[intent, requirements], edges=[edge],
        operators=[op_fd, op_fp],
        rules=[Rule("req_gate", approve=consensus(1, 1))],
        contexts=[ctx_policy],
        requirements=["REQ-IR-001", "REQ-IR-002"],
    )
    worker = Worker(id="req_analyst", can_execute=[job])
''')

_EDGE = "intent→requirements"
_FP_EVAL = "req_quality"
_ARTIFACT_PATH = "output/requirements.md"
_PKG_NAME = "req_analysis"


# ── Sandbox setup ────────────────────────────────────────────────────────────

def _setup(archive: RunArchive) -> Path:
    """Fresh sandbox with req_analysis package + standards policy context."""
    target = archive.workspace
    install_sandbox(target, archive=archive)
    write_test_package(target, _PACKAGE)
    d = target / "policy"
    d.mkdir(parents=True, exist_ok=True)
    (d / "requirements_standards.md").write_text(
        "# Requirements Standards\n\n"
        "## Mandatory Practices\n"
        "- Each requirement must have a unique REQ-key\n"
        "- Requirements must be testable (measurable acceptance criteria)\n"
        "- No implementation details in requirement statements\n"
        "- Traceability to originating intent must be explicit\n"
    )
    return target


# ── Asset truth ──────────────────────────────────────────────────────────────

@pytest.mark.e2e
class TestAssetTruth:
    """Proof 1: the kernel creates the correct output artifact for this hop."""

    def test_gap_truth(self, run_archive):
        target = _setup(run_archive)
        data = run_genesis_json(target, "gaps", archive=run_archive)
        assert data["scope"]["package"] == _PKG_NAME
        assert data["converged"] is False
        assert data["total_delta"] > 0
        gap = data["gaps"][0]
        assert gap["edge"] == _EDGE
        assert "artifact_exists" in gap["failing"]
        assert _FP_EVAL in gap["failing"]

    def test_fd_gates_fp(self, run_archive):
        target = _setup(run_archive)
        result = run_genesis(target, "iterate", archive=run_archive)
        assert result.returncode == 4
        assert "fp_manifest_path" not in json.loads(result.stdout)

    def test_manifest_truth(self, run_archive):
        target = _setup(run_archive)
        manifest = dispatch_fp_and_read_manifest(
            target, _ARTIFACT_PATH,
            "# Requirements\n- REQ-001: The system shall...\n",
            archive=run_archive)
        assert_manifest_truth(
            manifest,
            edge_name=_EDGE,
            source_asset="intent",
            target_asset="requirements",
            source_markov={"intent": ["problem_stated", "value_proposition_clear", "scope_bounded"]},
            target_markov=["keys_testable", "intent_covered", "no_implementation_details"],
            requirements=["REQ-IR-001", "REQ-IR-002"],
            fp_evaluator=_FP_EVAL,
            context_names=["standards_policy"],
            context_content_markers={"standards_policy": "Mandatory Practices"},
        )

    def test_convergence(self, run_archive):
        target = _setup(run_archive)
        run_full_lifecycle(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            artifact_path=_ARTIFACT_PATH,
            artifact_content="# Requirements\nREQ-001: System shall authenticate users.\n",
            archive=run_archive,
        )


# ── Event / postmortem truth ─────────────────────────────────────────────────

@pytest.mark.e2e
class TestEventPostmortemTruth:
    """Proof 2: the audit trail explains what happened and why."""

    def test_failure_inspectable(self, run_archive):
        target = _setup(run_archive)
        assert_failure_inspectable(target, archive=run_archive)

    def test_event_chain_after_convergence(self, run_archive):
        target = _setup(run_archive)
        run_full_lifecycle(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            artifact_path=_ARTIFACT_PATH,
            artifact_content="# Requirements\nREQ-001: System shall authenticate users.\n",
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
        target = _setup(run_archive)
        manifest = dispatch_fp_and_read_manifest(
            target, _ARTIFACT_PATH,
            "# Requirements\n- REQ-001: The system shall...\n",
            archive=run_archive)
        assert "manifest_id" in manifest
        assert "edge" in manifest
        assert "spec_hash" in manifest
        assert "prompt" in manifest
        assert "result_path" in manifest
        assert "fd_results" in manifest

    def test_fd_gap_event_on_gate(self, run_archive):
        target = _setup(run_archive)
        run_genesis(target, "iterate", archive=run_archive)
        events = read_events(target)
        fd_gaps = [e for e in events
                   if e["event_type"] == "found"
                   and e.get("data", {}).get("kind") == "fd_gap"]
        assert len(fd_gaps) >= 1
        assert fd_gaps[-1]["data"]["edge"] == _EDGE
