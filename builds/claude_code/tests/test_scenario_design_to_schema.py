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
Scenario: design → data_schema (architectural → structured technical).

Disjoint single-hop fixture. Proves the ABG kernel can carry a transformation
where architectural design decisions become a structured data schema artifact.
Exercises ADR context, naming conventions, and technical postconditions.

Two contexts required: architecture_decisions + naming_conventions.
Both must arrive fully in the manifest — no silent truncation.

This is a self-contained mini-project. Fresh sandbox, vanilla install,
explicit synthetic package, no chaining, no upstream dependencies.

Two equal proofs:
  1. Asset truth — correct artifact created with correct manifest
  2. Event/postmortem truth — audit trail explains what happened and why

Each test run is archived at tests/runs/design_to_schema/<timestamp>/
for postmortem investigation.

Run: pytest builds/claude_code/tests/test_scenario_design_to_schema.py -v
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
    """Architectural design to structured data schema."""
    from gtl.core import (
        Asset, Context, Edge, Evaluator, Job, Operator,
        Package, Rule, Worker, F_D, F_P, consensus,
    )

    design = Asset(
        name="design",
        id_format="DES-{SEQ}",
        markov=["adrs_recorded", "components_identified", "interfaces_specified"],
    )
    data_schema = Asset(
        name="data_schema",
        id_format="SCH-{SEQ}",
        lineage=[design],
        markov=["naming_consistent", "constraints_present", "migration_safe"],
    )
    ctx_adr = Context(
        name="architecture_decisions",
        locator="workspace://docs/adr_001.md",
        digest="sha256:" + "0" * 64,
    )
    ctx_naming = Context(
        name="naming_conventions",
        locator="workspace://docs/naming_guide.md",
        digest="sha256:" + "0" * 64,
    )
    op_fd = Operator("artifact_check", F_D, "exec://test -f output/schema.sql")
    op_fp = Operator("schema_agent", F_P, "agent://data/schema")
    edge = Edge(
        name="design\\u2192data_schema",
        source=design, target=data_schema,
        using=[op_fd, op_fp], context=[ctx_adr, ctx_naming],
    )
    eval_fd = Evaluator("artifact_exists", F_D,
        "schema artifact exists at output/schema.sql",
        command="test -f output/schema.sql")
    eval_fp = Evaluator("schema_quality", F_P,
        "agent: schema follows naming conventions, has integrity constraints, is migration-safe")
    job = Job(edge=edge, evaluators=[eval_fd, eval_fp])
    package = Package(
        name="schema_design",
        assets=[design, data_schema], edges=[edge],
        operators=[op_fd, op_fp],
        rules=[Rule("schema_gate", approve=consensus(1, 1))],
        contexts=[ctx_adr, ctx_naming],
        requirements=["REQ-DS-001", "REQ-DS-002"],
    )
    worker = Worker(id="schema_designer", can_execute=[job])
''')

_EDGE = "design→data_schema"
_FP_EVAL = "schema_quality"
_ARTIFACT_PATH = "output/schema.sql"
_PKG_NAME = "schema_design"


# ── Sandbox setup ────────────────────────────────────────────────────────────

def _setup(archive: RunArchive) -> Path:
    """Fresh sandbox with schema_design package + ADR + naming contexts."""
    target = archive.workspace
    install_sandbox(target, archive=archive)
    write_test_package(target, _PACKAGE)
    d = target / "docs"
    d.mkdir(parents=True, exist_ok=True)
    (d / "adr_001.md").write_text(
        "# ADR-001: Use PostgreSQL for Primary Store\n\n"
        "## Decision\n"
        "PostgreSQL with JSONB columns for flexible metadata.\n\n"
        "## Constraints\n"
        "- All tables must have created_at/updated_at timestamps\n"
        "- Foreign keys must be named fk_{table}_{column}\n"
        "- Indexes must be named idx_{table}_{column}\n"
    )
    (d / "naming_guide.md").write_text(
        "# Naming Conventions\n\n"
        "## Database Objects\n"
        "- Tables: snake_case, plural (e.g. user_accounts)\n"
        "- Columns: snake_case, singular (e.g. first_name)\n"
        "- Enums: UPPER_SNAKE_CASE\n"
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

    def test_fd_gates_fp(self, run_archive):
        target = _setup(run_archive)
        result = run_genesis(target, "iterate", archive=run_archive)
        assert result.returncode == 4
        assert "fp_manifest_path" not in json.loads(result.stdout)

    def test_manifest_truth(self, run_archive):
        """Two contexts: ADR + naming conventions. Both must arrive fully."""
        target = _setup(run_archive)
        manifest = dispatch_fp_and_read_manifest(
            target, _ARTIFACT_PATH,
            "CREATE TABLE user_accounts (id SERIAL PRIMARY KEY);\n",
            archive=run_archive)
        assert_manifest_truth(
            manifest,
            edge_name=_EDGE,
            source_asset="design",
            target_asset="data_schema",
            source_markov={"design": ["adrs_recorded", "components_identified", "interfaces_specified"]},
            target_markov=["naming_consistent", "constraints_present", "migration_safe"],
            requirements=["REQ-DS-001", "REQ-DS-002"],
            fp_evaluator=_FP_EVAL,
            context_names=["architecture_decisions", "naming_conventions"],
            context_content_markers={
                "architecture_decisions": "PostgreSQL",
                "naming_conventions": "snake_case",
            },
        )

    def test_convergence(self, run_archive):
        target = _setup(run_archive)
        run_full_lifecycle(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            artifact_path=_ARTIFACT_PATH,
            artifact_content=(
                "CREATE TABLE user_accounts (\n"
                "  id SERIAL PRIMARY KEY,\n"
                "  created_at TIMESTAMPTZ DEFAULT NOW()\n"
                ");\n"
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
                "CREATE TABLE user_accounts (\n"
                "  id SERIAL PRIMARY KEY,\n"
                "  created_at TIMESTAMPTZ DEFAULT NOW()\n"
                ");\n"
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

    def test_both_contexts_in_manifest(self, run_archive):
        """Multi-context hop: both ADR and naming contexts must be fully resolved."""
        target = _setup(run_archive)
        manifest = dispatch_fp_and_read_manifest(
            target, _ARTIFACT_PATH,
            "CREATE TABLE user_accounts (id SERIAL PRIMARY KEY);\n",
            archive=run_archive)
        ctx_names = [c["name"] for c in manifest["contexts"]]
        assert "architecture_decisions" in ctx_names
        assert "naming_conventions" in ctx_names
        for ctx in manifest["contexts"]:
            assert "content" in ctx and len(ctx["content"]) > 0, \
                f"Context {ctx['name']} must have non-empty resolved content"

    def test_fd_gap_event_on_gate(self, run_archive):
        target = _setup(run_archive)
        run_genesis(target, "iterate", archive=run_archive)
        events = read_events(target)
        fd_gaps = [e for e in events
                   if e["event_type"] == "found"
                   and e.get("data", {}).get("kind") == "fd_gap"]
        assert len(fd_gaps) >= 1
        assert fd_gaps[-1]["data"]["edge"] == _EDGE
