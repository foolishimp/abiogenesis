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

Run: cd builds/claude_code/test_env && ./run_tests file tests/test_scenario_requirements_to_uat.py
"""
import json
import textwrap
from pathlib import Path

import pytest

import re

from scenario_helpers import (
    RunArchive, install_sandbox, write_test_package,
    run_genesis, run_genesis_json, emit_event, read_events, compute_spec_hash,
    dispatch_fp_and_read_manifest, assert_manifest_truth,
    run_full_lifecycle, assert_event_chain, assert_failure_inspectable,
    run_judged_lifecycle, IterationResult,
)


# ── Domain package ───────────────────────────────────────────────────────────

_PACKAGE = textwrap.dedent('''\
    """Normative requirements to acceptance test cases."""
    from gtl.graph import Graph, Node, GraphVector, Context
    from gtl.module_model import Module
    from gtl.work_model import Job, ContractRef
    from gtl.operator_model import Evaluator, Operator, Rule, F_D, F_P

    requirements = Node(
        name="requirements",
        markov=("keys_testable", "traceable"),
    )
    uat_tests = Node(
        name="uat_tests",
        markov=("all_reqs_covered", "steps_executable", "expected_results_defined"),
    )
    ctx_testing = Context(
        name="testing_standards",
        locator="workspace://docs/testing_standards.md",
        digest="sha256:" + "0" * 64,
    )
    op_fd = Operator("artifact_check", F_D, "exec://test -f output/uat_tests.md")
    op_fp = Operator("test_agent", F_P, "agent://qa/test_design")
    eval_fd = Evaluator("artifact_exists", F_D,
        "UAT test cases exist at output/uat_tests.md",
        binding="exec://test -f output/uat_tests.md")
    eval_fp = Evaluator("test_coverage", F_P,
        "agent: test cases cover all requirements, steps are executable, expected results defined")
    vector = GraphVector(
        name="requirements\\u2192uat_tests",
        source=requirements, target=uat_tests,
        operators=(op_fd, op_fp),
        evaluators=(eval_fd, eval_fp),
        contexts=(ctx_testing,),
    )
    job = Job(name=vector.name, contracts=(ContractRef(kind="graph_vector", target_id=vector.id),))
    graph = Graph(
        name="requirements\\u2192uat_tests",
        inputs=(requirements,), outputs=(uat_tests,),
        nodes=(requirements, uat_tests), vectors=(vector,),
        contexts=(ctx_testing,),
    )
    module = Module(
        name="uat_design",
        graphs=(graph,),
        jobs=(job,),
        metadata={"requirements": ["REQ-UAT-001", "REQ-UAT-002"]},
    )
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

@pytest.mark.integration
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

    def test_fd_escalates_to_fp(self, run_archive):
        """REQ-F-GATE-002 (ADR-021): F_D failure escalates to F_P dispatch."""
        target = _setup(run_archive)
        result = run_genesis(target, "iterate", archive=run_archive)
        assert result.returncode == 0
        assert "fp_manifest_path" in json.loads(result.stdout)

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

    def test_working_surface_evidence(self, run_archive):
        """WorkingSurface must carry iteration evidence — not just events."""
        target = _setup(run_archive)
        art = target / _ARTIFACT_PATH
        art.parent.mkdir(parents=True, exist_ok=True)
        art.write_text("# UAT Tests\n")
        data = run_genesis_json(target, "iterate", archive=run_archive)

        assert len(data["surface_artifacts"]) == 2
        assert any("fp_manifests" in a for a in data["surface_artifacts"])
        assert any("fp_results" in a for a in data["surface_artifacts"])
        assert "testing_standards" in data["context_consumed"]

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

@pytest.mark.integration
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


# ── Deterministic F_P judge ─────────────────────────────────────────────────

def _judge_uat(artifact: Path, manifest: dict) -> list[dict]:
    """Deterministic judge for requirements→uat_tests.

    Rules (from testing_standards context):
      1. Every package requirement REQ-key must be referenced (REQ-UAT-001, REQ-UAT-002)
      2. Each test case must have a Steps section with numbered steps
      3. Each test case must have an Expected section with observable results
      4. Must contain edge case coverage (explicit edge/boundary/error mention)
    """
    content = artifact.read_text(encoding="utf-8")
    failures = []

    # Rule 1: REQ coverage
    expected_reqs = {"REQ-UAT-001", "REQ-UAT-002"}
    found_reqs = set(re.findall(r'REQ-UAT-\d+', content))
    missing = expected_reqs - found_reqs
    if missing:
        failures.append(f"missing requirement coverage: {sorted(missing)}")

    # Rule 2: Steps sections with numbered steps
    has_steps = bool(re.search(
        r'[Ss]teps?\s*:.*\d+\.',
        content, re.DOTALL,
    ))
    if not has_steps:
        failures.append("no numbered steps found — test steps must be concrete")

    # Rule 3: Expected results
    has_expected = bool(re.search(
        r'[Ee]xpected\s*[Rr]esults?\s*:', content,
    ))
    if not has_expected:
        failures.append("no 'Expected Result:' sections — results must be observable")

    # Rule 4: Edge case coverage
    has_edge_cases = bool(re.search(
        r'(edge case|boundary|error|invalid|negative|timeout|empty)',
        content, re.IGNORECASE,
    ))
    if not has_edge_cases:
        failures.append("no edge case coverage found")

    if failures:
        return [{
            "evaluator": _FP_EVAL,
            "result": "fail",
            "evidence": "; ".join(failures),
        }]
    return [{
        "evaluator": _FP_EVAL,
        "result": "pass",
        "evidence": f"all requirements covered ({len(found_reqs)}), "
                    f"numbered steps, expected results, edge cases present",
    }]


# ── Layered artifacts for multi-iteration ────────────────────────────────────

# Attempt 1: Partial coverage — only REQ-UAT-001, no steps or expected
_UAT_V1 = """\
# UAT Test Cases

## TC-001: Basic Login
REQ: REQ-UAT-001
Verify login works.
"""

# Attempt 2: Full coverage but vague — no numbered steps, no edge cases
_UAT_V2 = """\
# UAT Test Cases

## TC-001: Basic Login
REQ: REQ-UAT-001
Steps: Go to login page and enter credentials.
Expected Result: User sees dashboard.

## TC-002: Session Timeout
REQ: REQ-UAT-002
Steps: Wait for session to expire.
Expected Result: User is redirected.
"""

# Attempt 3: Complete — numbered steps, expected results, edge cases
_UAT_V3 = """\
# UAT Test Cases

## TC-001: Successful Login
REQ: REQ-UAT-001
Steps:
  1. Navigate to the login page
  2. Enter valid email and password
  3. Click submit
Expected Result: User is redirected to the dashboard with a welcome message.

## TC-002: Session Expiry
REQ: REQ-UAT-002
Steps:
  1. Log in successfully
  2. Wait for the configured idle timeout period
  3. Attempt any authenticated action
Expected Result: User is redirected to the login page with an expiry notice.

## TC-003: Invalid Credentials (edge case)
REQ: REQ-UAT-001
Steps:
  1. Navigate to the login page
  2. Enter an invalid password
  3. Click submit
Expected Result: Error message displayed, login form remains, no session created.
"""


# ── Real F_P judged convergence ──────────────────────────────────────────────

@pytest.mark.integration
class TestRealFpConvergence:
    """Release-evidence: multi-iteration convergence with a real deterministic judge.

    Three iterations demonstrate iterative refinement:
      1. Partial coverage, no structure → judge rejects
      2. Coverage complete, vague steps, no edge cases → judge rejects
      3. Numbered steps, expected results, edge cases → judge accepts
    """

    def test_iterative_convergence(self, run_archive):
        target = _setup(run_archive)
        results = run_judged_lifecycle(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            artifact_path=_ARTIFACT_PATH,
            artifacts=[_UAT_V1, _UAT_V2, _UAT_V3],
            judge=_judge_uat,
            archive=run_archive,
        )

        # Iteration 1: fails (missing coverage + no steps + no expected)
        assert not results[0].passed, "iteration 1 must fail: partial coverage"
        ev1 = results[0].assessments[0]["evidence"]
        assert "missing" in ev1.lower() or "coverage" in ev1.lower()

        # Iteration 2: fails (no numbered steps + no edge cases)
        assert not results[1].passed, "iteration 2 must fail: vague steps"
        ev2 = results[1].assessments[0]["evidence"]
        assert "step" in ev2.lower() or "edge case" in ev2.lower()

        # Iteration 3: passes
        assert results[2].passed, (
            f"iteration 3 must pass, got: {results[2].assessments}"
        )
        assert results[2].gaps_after["converged"] is True

    def test_archive_explains_each_iteration(self, run_archive):
        """Postmortem proof: each iteration's judge evidence is in the event log."""
        target = _setup(run_archive)
        results = run_judged_lifecycle(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            artifact_path=_ARTIFACT_PATH,
            artifacts=[_UAT_V1, _UAT_V2, _UAT_V3],
            judge=_judge_uat,
            archive=run_archive,
        )

        events = read_events(target)
        assessed = [e for e in events if e["event_type"] == "assessed"]
        assert len(assessed) >= 3

        for a in assessed:
            assert len(a["data"]["evidence"]) > 0

        actors = [a["data"]["actor"] for a in assessed]
        assert len(set(actors)) == 3
