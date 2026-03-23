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
# Validates: REQ-F-CORE-004
# Validates: REQ-NFR-E2E-001
"""
Scenario: modules × design → code (multi-input synthesis, product arrow).

Disjoint single-hop fixture. Proves the ABG kernel can carry a multi-input
synthesis transformation where module decomposition AND design decisions
are combined into executable code output. Exercises product arrows (A × B → C).

Key difference from other hops: source is a LIST of assets, not a single asset.
The manifest must reflect this with list-valued source_asset and multi-key
source_markov.

This is a self-contained mini-project. Fresh sandbox, vanilla install,
explicit synthetic package, no chaining, no upstream dependencies.

Two equal proofs:
  1. Asset truth — correct artifact created with correct manifest
  2. Event/postmortem truth — audit trail explains what happened and why

Each test run is archived at tests/runs/multi_input_to_code/<timestamp>/
for postmortem investigation.

Run: pytest builds/claude_code/tests/test_scenario_multi_input_to_code.py -v
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
    """Multi-input synthesis: modules and design to code (product arrow)."""
    from gtl.core import (
        Asset, Context, Edge, Evaluator, Job, Operator,
        Package, Rule, Worker, F_D, F_P, consensus,
    )

    modules = Asset(
        name="modules",
        id_format="MOD-{SEQ}",
        markov=["decomposition_complete", "interfaces_defined", "dependencies_acyclic"],
    )
    design = Asset(
        name="design",
        id_format="DES-{SEQ}",
        markov=["adrs_recorded", "patterns_selected"],
    )
    code = Asset(
        name="code",
        id_format="CODE-{SEQ}",
        lineage=[modules, design],
        markov=["compiles", "implements_interfaces", "tests_pass"],
    )
    ctx_arch = Context(
        name="architecture_guide",
        locator="workspace://docs/architecture.md",
        digest="sha256:" + "0" * 64,
    )
    op_fd = Operator("artifact_check", F_D, "exec://test -f output/service.py")
    op_fp = Operator("code_agent", F_P, "agent://code/synthesizer")
    edge = Edge(
        name="modules\\u00d7design\\u2192code",
        source=[modules, design], target=code,
        using=[op_fd, op_fp], context=[ctx_arch],
    )
    eval_fd = Evaluator("artifact_exists", F_D,
        "code artifact exists at output/service.py",
        command="test -f output/service.py")
    eval_fp = Evaluator("code_quality", F_P,
        "agent: code implements module interfaces, follows design patterns, passes tests")
    job = Job(edge=edge, evaluators=[eval_fd, eval_fp])
    package = Package(
        name="code_synthesis",
        assets=[modules, design, code], edges=[edge],
        operators=[op_fd, op_fp],
        rules=[Rule("code_gate", approve=consensus(1, 1))],
        contexts=[ctx_arch],
        requirements=["REQ-CS-001", "REQ-CS-002", "REQ-CS-003"],
    )
    worker = Worker(id="code_synth", can_execute=[job])
''')

_EDGE = "modules×design→code"
_FP_EVAL = "code_quality"
_ARTIFACT_PATH = "output/service.py"
_PKG_NAME = "code_synthesis"


# ── Sandbox setup ────────────────────────────────────────────────────────────

def _setup(archive: RunArchive) -> Path:
    """Fresh sandbox with code_synthesis package + architecture guide context."""
    target = archive.workspace
    install_sandbox(target, archive=archive)
    write_test_package(target, _PACKAGE)
    d = target / "docs"
    d.mkdir(parents=True, exist_ok=True)
    (d / "architecture.md").write_text(
        "# Architecture Guide\n\n"
        "## Module Structure\n"
        "- Each module exposes a public interface class\n"
        "- Dependencies flow top-down only (no cycles)\n"
        "- All I/O at module boundaries, pure logic inside\n\n"
        "## Design Patterns\n"
        "- Repository pattern for data access\n"
        "- Strategy pattern for pluggable algorithms\n"
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

    def test_manifest_truth_multi_input(self, run_archive):
        """Product arrow: source_asset is a LIST, source_markov has multiple entries."""
        target = _setup(run_archive)
        manifest = dispatch_fp_and_read_manifest(
            target, _ARTIFACT_PATH,
            "class UserService:\n    def get_user(self, id): pass\n",
            archive=run_archive)
        assert_manifest_truth(
            manifest,
            edge_name=_EDGE,
            source_asset=["modules", "design"],
            target_asset="code",
            source_markov={
                "modules": ["decomposition_complete", "interfaces_defined", "dependencies_acyclic"],
                "design": ["adrs_recorded", "patterns_selected"],
            },
            target_markov=["compiles", "implements_interfaces", "tests_pass"],
            requirements=["REQ-CS-001", "REQ-CS-002", "REQ-CS-003"],
            fp_evaluator=_FP_EVAL,
            context_names=["architecture_guide"],
            context_content_markers={"architecture_guide": "Module Structure"},
        )
        assert isinstance(manifest["source_asset"], list), \
            "Multi-input edge must produce list source_asset"
        assert len(manifest["source_asset"]) == 2

    def test_convergence(self, run_archive):
        target = _setup(run_archive)
        run_full_lifecycle(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            artifact_path=_ARTIFACT_PATH,
            artifact_content=(
                "class UserService:\n"
                "    def get_user(self, user_id: int) -> dict:\n"
                "        return {'id': user_id}\n"
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
                "class UserService:\n"
                "    def get_user(self, user_id: int) -> dict:\n"
                "        return {'id': user_id}\n"
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

    def test_product_arrow_in_manifest_audit(self, run_archive):
        """Product arrow must be inspectable in the persisted manifest."""
        target = _setup(run_archive)
        manifest = dispatch_fp_and_read_manifest(
            target, _ARTIFACT_PATH,
            "class UserService:\n    def get_user(self, id): pass\n",
            archive=run_archive)
        assert isinstance(manifest["source_asset"], list)
        assert "modules" in manifest["source_asset"]
        assert "design" in manifest["source_asset"]
        assert "modules" in manifest["source_markov"]
        assert "design" in manifest["source_markov"]

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
