# Validates: REQ-F-BOOT-001
# Validates: REQ-F-BOOT-002
# Validates: REQ-F-PKG-001
# Validates: REQ-F-CORE-001
# Validates: REQ-NFR-E2E-001
"""
Kernel safety tests — install truth, reinstall safety, cross-hop properties.

These are infrastructure tests that apply across all scenarios. They prove
the kernel's install/reinstall behavior is honest and deterministic.

Each test run is archived at tests/runs/kernel_safety/<timestamp>/
for postmortem investigation.

Run: pytest builds/claude_code/tests/test_scenario_kernel_safety.py -v
"""
import json
import textwrap
from pathlib import Path

import pytest

from scenario_helpers import (
    RunArchive, install_sandbox, write_test_package,
    run_genesis, run_genesis_json, emit_event, read_events, compute_spec_hash,
    run_full_lifecycle,
)


# ── Reuse the brief→article package for reinstall tests ──────────────────────

_PKG_BRIEF_TO_ARTICLE = textwrap.dedent('''\
    """Content pipeline: brief to article."""
    from gtl.core import (
        Asset, Context, Edge, Evaluator, Job, Operator,
        Package, Rule, Worker, F_D, F_P, consensus,
    )

    brief = Asset(
        name="brief",
        id_format="BRIEF-{SEQ}",
        markov=["topic_defined", "audience_identified", "scope_bounded"],
    )
    article = Asset(
        name="article",
        id_format="ART-{SEQ}",
        lineage=[brief],
        markov=["content_complete", "references_cited", "word_count_met"],
    )
    ctx = Context(
        name="writing_methodology",
        locator="workspace://methodology/writing_guide.md",
        digest="sha256:" + "0" * 64,
    )
    op_fd = Operator("artifact_check", F_D, "exec://test -f output/article.md")
    op_fp = Operator("content_agent", F_P, "agent://content/writer")
    edge = Edge(
        name="brief\\u2192article",
        source=brief, target=article,
        using=[op_fd, op_fp], context=[ctx],
    )
    eval_fd = Evaluator("artifact_exists", F_D,
        "output artifact exists at output/article.md",
        command="test -f output/article.md")
    eval_fp = Evaluator("content_quality", F_P,
        "agent: article content satisfies brief requirements")
    job = Job(edge=edge, evaluators=[eval_fd, eval_fp])
    package = Package(
        name="content_pipeline",
        assets=[brief, article], edges=[edge],
        operators=[op_fd, op_fp],
        rules=[Rule("editorial", approve=consensus(1, 1))],
        contexts=[ctx],
        requirements=["REQ-CONTENT-001", "REQ-CONTENT-002"],
    )
    worker = Worker(id="content_writer", can_execute=[job])
''')

_PKG_INTENT_TO_REQUIREMENTS = textwrap.dedent('''\
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


# ── Install truth ────────────────────────────────────────────────────────────

@pytest.mark.integration
class TestInstallTruth:
    """Kernel install creates minimal sandbox — no domain artifacts smuggled in."""

    def test_install_creates_minimal_sandbox(self, run_archive):
        target = run_archive.workspace
        install_sandbox(target, archive=run_archive)

        assert (target / ".genesis" / "genesis").is_dir(), "Engine modules missing"
        assert (target / ".genesis" / "gtl").is_dir(), "GTL type system missing"
        assert not (target / ".genesis" / "gtl_spec").is_dir(), \
            "Kernel must not create gtl_spec/ — domain installers own package structure"
        assert (target / ".genesis" / "genesis.yml").is_file(), "Runtime config missing"
        assert (target / ".ai-workspace" / "events" / "events.jsonl").is_file(), \
            "Event log missing"

        assert not (target / ".gsdlc").exists(), \
            "Kernel install must not create .gsdlc/"
        assert not (target / "builds").exists(), \
            "Kernel install must not create builds/"

        genesis_yml = (target / ".genesis" / "genesis.yml").read_text()
        # Kernel default must not bind to any package — domain installer does that
        for line in genesis_yml.splitlines():
            stripped = line.strip()
            if stripped and not stripped.startswith("#"):
                assert False, f"Kernel default should be all comments, found: {line!r}"

        events = read_events(target)
        install_events = [e for e in events if e["event_type"] == "genesis_installed"]
        assert len(install_events) >= 1, "genesis_installed event must be recorded"


# ── Reinstall safety ─────────────────────────────────────────────────────────

@pytest.mark.integration
class TestReinstallSafety:
    """Reinstall ABG preserves domain-owned artifacts and convergence."""

    def test_reinstall_preserves_domain(self, run_archive):
        target = run_archive.workspace
        install_sandbox(target, archive=run_archive)
        write_test_package(target, _PKG_BRIEF_TO_ARTICLE)

        # Create domain context
        d = target / "methodology"
        d.mkdir(parents=True, exist_ok=True)
        (d / "writing_guide.md").write_text("# Writing Methodology\n")

        # Create domain artifacts + converge
        (target / "output").mkdir(exist_ok=True)
        (target / "output" / "article.md").write_text("# Domain artifact\n")
        spec_hash = compute_spec_hash(target, archive=run_archive)
        emit_event(target, "assessed", {
            "kind": "fp", "edge": "brief→article",
            "evaluator": "content_quality", "result": "pass",
            "actor": "test_fp", "evidence": "domain work",
            "spec_hash": spec_hash,
        }, archive=run_archive)

        events_before = read_events(target)
        domain_pkg = (target / ".genesis" / "gtl_spec" / "packages" / "test_pkg.py").read_text()
        method_doc = (target / "methodology" / "writing_guide.md").read_text()

        # Reinstall kernel
        install_sandbox(target, archive=run_archive)

        # Domain package survives
        assert (target / ".genesis" / "gtl_spec" / "packages" / "test_pkg.py").read_text() == domain_pkg
        # Context survives
        assert (target / "methodology" / "writing_guide.md").read_text() == method_doc
        # Output survives
        assert (target / "output" / "article.md").exists()
        # Events survive
        events_after = read_events(target)
        assert len(events_after) >= len(events_before)
        assessed = [e for e in events_after if e["event_type"] == "assessed"
                    and e.get("data", {}).get("edge") == "brief→article"]
        assert len(assessed) >= 1

        # Re-bind and verify convergence preserved
        write_test_package(target, _PKG_BRIEF_TO_ARTICLE)
        after = run_genesis_json(target, "gaps", archive=run_archive)
        assert after["scope"]["package"] == "content_pipeline"
        assert after["converged"] is True

    def test_reinstall_event_audit_trail(self, run_archive):
        """Reinstall emits a second genesis_installed event — auditable."""
        target = run_archive.workspace
        install_sandbox(target, archive=run_archive)
        install_sandbox(target, archive=run_archive)

        events = read_events(target)
        installs = [e for e in events if e["event_type"] == "genesis_installed"]
        assert len(installs) >= 2, \
            "Each install must emit genesis_installed — reinstall is auditable"


# ── Cross-hop structural properties ──────────────────────────────────────────

@pytest.mark.integration
class TestCrossHopProperties:
    """Structural properties that hold across all hops."""

    def test_replay_determinism(self, run_archive):
        """Same package in two fresh directories → identical gap reports."""
        target = run_archive.workspace
        results = []
        for i in range(2):
            sandbox = target / f"sandbox_{i}"
            sandbox.mkdir()
            install_sandbox(sandbox, archive=run_archive)
            write_test_package(sandbox, _PKG_INTENT_TO_REQUIREMENTS)
            d = sandbox / "policy"
            d.mkdir(parents=True, exist_ok=True)
            (d / "requirements_standards.md").write_text("# Standards\n")
            results.append(run_genesis_json(sandbox, "gaps", archive=run_archive))

        assert results[0]["total_delta"] == results[1]["total_delta"]
        assert results[0]["converged"] == results[1]["converged"]
        for g0, g1 in zip(results[0]["gaps"], results[1]["gaps"]):
            assert g0["delta"] == g1["delta"]
            assert sorted(g0["failing"]) == sorted(g1["failing"])

    def test_gen_gaps_idempotent(self, run_archive):
        """Repeated gen-gaps with no state changes → identical results."""
        target = run_archive.workspace
        install_sandbox(target, archive=run_archive)
        write_test_package(target, _PKG_INTENT_TO_REQUIREMENTS)
        d = target / "policy"
        d.mkdir(parents=True, exist_ok=True)
        (d / "requirements_standards.md").write_text("# Standards\n")

        first = run_genesis_json(target, "gaps", archive=run_archive)
        second = run_genesis_json(target, "gaps", archive=run_archive)
        assert first["total_delta"] == second["total_delta"]
        assert first["converged"] == second["converged"]
        for g0, g1 in zip(first["gaps"], second["gaps"]):
            assert g0["delta"] == g1["delta"]
            assert sorted(g0["failing"]) == sorted(g1["failing"])
