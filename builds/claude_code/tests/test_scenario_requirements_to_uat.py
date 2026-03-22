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
Scenario: requirements → uat_tests (normative → acceptance artifacts).

Disjoint single-hop fixture. Proves the ABG kernel can carry a transformation
where normative requirement structure becomes acceptance test cases.
Exercises requirement lineage, success criteria projection, and test-case
structure.

This is a self-contained mini-project. Fresh sandbox, vanilla install,
explicit synthetic package, no chaining, no upstream dependencies.

Two equal proofs:
  1. Asset truth — correct artifact created with correct manifest
  2. Event/postmortem truth — audit trail explains what happened and why

Each test run is archived at tests/runs/requirements_to_uat/<timestamp>/
for postmortem investigation.

Run: pytest builds/claude_code/tests/test_scenario_requirements_to_uat.py -v
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
    """Normative requirements to acceptance test cases."""
    from gtl.core import (
        Asset, Context, Edge, Evaluator, Job, Operator,
        Package, Rule, Worker, F_D, F_P, consensus,
    )

    requirements = Asset(
        name="requirements",
        id_format="REQ-{SEQ}",
        markov=["keys_testable", "traceable"],
    )
    uat_tests = Asset(
        name="uat_tests",
        id_format="UAT-{SEQ}",
        lineage=[requirements],
        markov=["all_reqs_covered", "steps_executable", "expected_results_defined"],
    )
    ctx_testing = Context(
        name="testing_standards",
        locator="workspace://docs/testing_standards.md",
        digest="sha256:" + "0" * 64,
    )
    op_fd = Operator("artifact_check", F_D, "exec://test -f output/uat_tests.md")
    op_fp = Operator("test_agent", F_P, "agent://qa/test_design")
    edge = Edge(
        name="requirements\\u2192uat_tests",
        source=requirements, target=uat_tests,
        using=[op_fd, op_fp], context=[ctx_testing],
    )
    eval_fd = Evaluator("artifact_exists", F_D,
        "UAT test cases exist at output/uat_tests.md",
        command="test -f output/uat_tests.md")
    eval_fp = Evaluator("test_coverage", F_P,
        "agent: test cases cover all requirements, steps are executable, expected results defined")
    job = Job(edge=edge, evaluators=[eval_fd, eval_fp])
    package = Package(
        name="uat_design",
        assets=[requirements, uat_tests], edges=[edge],
        operators=[op_fd, op_fp],
        rules=[Rule("uat_gate", approve=consensus(1, 1))],
        contexts=[ctx_testing],
        requirements=["REQ-UAT-001", "REQ-UAT-002"],
    )
    worker = Worker(id="test_designer", can_execute=[job])
''')

_EDGE = "requirements→uat_tests"
_FP_EVAL = "test_coverage"
_ARTIFACT_PATH = "output/uat_tests.md"
_PKG_NAME = "uat_design"


# ── Sandbox setup ────────────────────────────────────────────────────────────

def _setup(archive: RunArchive) -> Path:
    """Fresh sandbox with uat_design package + testing standards context."""
    target = archive.workspace
    install_sandbox(target, archive=archive)
    write_test_package(target, _PACKAGE)
    d = target / "docs"
    d.mkdir(parents=True, exist_ok=True)
    (d / "testing_standards.md").write_text(
        "# Testing Standards\n\n"
        "## UAT Structure\n"
        "- Each test case must reference a REQ-key\n"
        "- Steps must be concrete and executable\n"
        "- Expected results must be observable and measurable\n"
        "- Edge cases must be explicitly covered\n"
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
            "# UAT Tests\n## TC-001: User login\nSteps: ...\nExpected: ...\n",
            archive=run_archive)
        assert_manifest_truth(
            manifest,
            edge_name=_EDGE,
            source_asset="requirements",
            target_asset="uat_tests",
            source_markov={"requirements": ["keys_testable", "traceable"]},
            target_markov=["all_reqs_covered", "steps_executable", "expected_results_defined"],
            requirements=["REQ-UAT-001", "REQ-UAT-002"],
            fp_evaluator=_FP_EVAL,
            context_names=["testing_standards"],
            context_content_markers={"testing_standards": "UAT Structure"},
        )

    def test_convergence(self, run_archive):
        target = _setup(run_archive)
        run_full_lifecycle(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            artifact_path=_ARTIFACT_PATH,
            artifact_content=(
                "# UAT Test Cases\n\n"
                "## TC-001: User Authentication\n"
                "REQ: REQ-UAT-001\n"
                "Steps: 1. Navigate to login 2. Enter credentials 3. Submit\n"
                "Expected: User redirected to dashboard\n"
            ),
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
            artifact_content=(
                "# UAT Test Cases\n\n"
                "## TC-001: User Authentication\n"
                "REQ: REQ-UAT-001\n"
                "Steps: 1. Navigate to login 2. Enter credentials 3. Submit\n"
                "Expected: User redirected to dashboard\n"
            ),
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
            "# UAT Tests\n## TC-001: User login\nSteps: ...\nExpected: ...\n",
            archive=run_archive)
        assert "manifest_id" in manifest
        assert "edge" in manifest
        assert "spec_hash" in manifest
        assert "prompt" in manifest
        assert "result_path" in manifest

    def test_fd_gap_event_on_gate(self, run_archive):
        target = _setup(run_archive)
        run_genesis(target, "iterate", archive=run_archive)
        events = read_events(target)
        fd_gaps = [e for e in events
                   if e["event_type"] == "found"
                   and e.get("data", {}).get("kind") == "fd_gap"]
        assert len(fd_gaps) >= 1
        assert fd_gaps[-1]["data"]["edge"] == _EDGE
