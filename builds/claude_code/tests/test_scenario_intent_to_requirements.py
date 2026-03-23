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

    def test_working_surface_evidence(self, run_archive):
        """WorkingSurface must carry iteration evidence — not just events."""
        target = _setup(run_archive)
        # Create artifact so F_D passes and F_P dispatches
        art = target / _ARTIFACT_PATH
        art.parent.mkdir(parents=True, exist_ok=True)
        art.write_text("# Requirements\n")
        data = run_genesis_json(target, "iterate", archive=run_archive)

        # surface_artifacts must list the manifest and result paths
        assert "surface_artifacts" in data, \
            "iterate result must include surface_artifacts"
        assert len(data["surface_artifacts"]) == 2, \
            f"expected manifest + result path, got: {data['surface_artifacts']}"
        assert any("fp_manifests" in a for a in data["surface_artifacts"]), \
            "surface must carry manifest path"
        assert any("fp_results" in a for a in data["surface_artifacts"]), \
            "surface must carry result path"

        # context_consumed must list the contexts read
        assert "context_consumed" in data, \
            "iterate result must include context_consumed"
        assert "standards_policy" in data["context_consumed"], \
            "context_consumed must include standards_policy"

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

# Implementation keywords that indicate leakage from normative requirements
_IMPL_LEAKAGE = re.compile(
    r'\b(python|java|react|postgres|redis|docker|kubernetes|aws|'
    r'microservice|api endpoint|database table|REST|gRPC|SQL|NoSQL)\b',
    re.IGNORECASE,
)


def _judge_requirements(artifact: Path, manifest: dict) -> list[dict]:
    """Deterministic judge for intent→requirements.

    Rules:
      1. Document must contain REQ-keys matching REQ-\\w+-\\d+
      2. Must cover both package requirements (REQ-IR-001, REQ-IR-002)
      3. Each requirement must have acceptance criteria (testable)
      4. No implementation technology leakage
    """
    content = artifact.read_text(encoding="utf-8")
    failures = []

    # Rule 1: REQ-keys exist
    req_keys = re.findall(r'REQ-\w+-\d+', content)
    if not req_keys:
        failures.append("no REQ-keys found in document")

    # Rule 2: Coverage — must reference the package requirements
    expected_reqs = {"REQ-IR-001", "REQ-IR-002"}
    found_reqs = set(req_keys)
    missing = expected_reqs - found_reqs
    if missing:
        failures.append(f"missing required REQ coverage: {sorted(missing)}")

    # Rule 3: Testability — must contain acceptance criteria markers
    has_criteria = bool(re.search(
        r'(acceptance criter|AC-\d+|shall\b.*\bwhen\b|must\b.*\bverif)',
        content, re.IGNORECASE,
    ))
    if not has_criteria:
        failures.append("no acceptance criteria found — requirements not testable")

    # Rule 4: No implementation leakage
    leakage = _IMPL_LEAKAGE.findall(content)
    if leakage:
        failures.append(f"implementation leakage detected: {leakage[:5]}")

    if failures:
        return [{
            "evaluator": _FP_EVAL,
            "result": "fail",
            "evidence": "; ".join(failures),
        }]
    return [{
        "evaluator": _FP_EVAL,
        "result": "pass",
        "evidence": f"all {len(req_keys)} requirements have keys, coverage, "
                    f"acceptance criteria, no implementation leakage",
    }]


# ── Layered artifacts for multi-iteration ────────────────────────────────────

# Attempt 1: Missing coverage — has REQ-IR-001 but not REQ-IR-002, no criteria
_ARTIFACT_V1 = """\
# Requirements

## REQ-IR-001: User Authentication
The system shall support user login.
"""

# Attempt 2: Coverage complete but implementation leakage
_ARTIFACT_V2 = """\
# Requirements

## REQ-IR-001: User Authentication
The system shall support user login.
- AC-1: Users can authenticate with email and password

## REQ-IR-002: Session Management
The system shall use Redis for session storage and Python JWT tokens.
- AC-1: Sessions must expire after 30 minutes
"""

# Attempt 3: Clean — full coverage, testable, no leakage
_ARTIFACT_V3 = """\
# Requirements

## REQ-IR-001: User Authentication
The system shall support user login with verified credentials.
- AC-1: Users can authenticate with email and password
- AC-2: Failed attempts shall be rate-limited after 5 consecutive failures

## REQ-IR-002: Session Management
The system shall maintain authenticated sessions with configurable timeout.
- AC-1: Sessions must expire after a configurable idle period
- AC-2: Session revocation shall take effect within one verification cycle
"""


# ── Real F_P judged convergence ──────────────────────────────────────────────

@pytest.mark.integration
class TestRealFpConvergence:
    """Release-evidence: multi-iteration convergence with a real deterministic judge.

    Three iterations demonstrate iterative refinement:
      1. Incomplete coverage → judge rejects
      2. Implementation leakage → judge rejects
      3. Clean normative requirements → judge accepts, edge converges
    """

    def test_iterative_convergence(self, run_archive):
        target = _setup(run_archive)
        results = run_judged_lifecycle(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            artifact_path=_ARTIFACT_PATH,
            artifacts=[_ARTIFACT_V1, _ARTIFACT_V2, _ARTIFACT_V3],
            judge=_judge_requirements,
            archive=run_archive,
        )

        # Iteration 1: fails (incomplete coverage)
        assert not results[0].passed, "iteration 1 must fail: missing REQ-IR-002"
        assert "missing" in results[0].assessments[0]["evidence"].lower()

        # Iteration 2: fails (implementation leakage)
        assert not results[1].passed, "iteration 2 must fail: implementation leakage"
        assert "leakage" in results[1].assessments[0]["evidence"].lower()

        # Iteration 3: passes (converged)
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
            artifacts=[_ARTIFACT_V1, _ARTIFACT_V2, _ARTIFACT_V3],
            judge=_judge_requirements,
            archive=run_archive,
        )

        events = read_events(target)
        assessed = [e for e in events if e["event_type"] == "assessed"]
        assert len(assessed) >= 3, (
            f"expected 3 assessed events (one per iteration), got {len(assessed)}"
        )

        # Each assessed event has real evidence from the judge
        for a in assessed:
            assert "evidence" in a["data"]
            assert len(a["data"]["evidence"]) > 0
            assert "actor" in a["data"]

        # Different actors per iteration
        actors = [a["data"]["actor"] for a in assessed]
        assert len(set(actors)) == 3, (
            f"each iteration must have a distinct actor, got: {actors}"
        )
