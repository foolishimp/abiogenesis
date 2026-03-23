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

    def test_fd_escalates_to_fp(self, run_archive):
        """REQ-F-GATE-002 (ADR-021): F_D failure escalates to F_P dispatch."""
        target = _setup(run_archive)
        result = run_genesis(target, "iterate", archive=run_archive)
        assert result.returncode == 0
        assert "fp_manifest_path" in json.loads(result.stdout)

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

    def test_working_surface_evidence(self, run_archive):
        """WorkingSurface must carry iteration evidence — not just events."""
        target = _setup(run_archive)
        art = target / _ARTIFACT_PATH
        art.parent.mkdir(parents=True, exist_ok=True)
        art.write_text("CREATE TABLE t (id INT);\n")
        data = run_genesis_json(target, "iterate", archive=run_archive)

        assert len(data["surface_artifacts"]) == 2
        assert any("fp_manifests" in a for a in data["surface_artifacts"])
        assert any("fp_results" in a for a in data["surface_artifacts"])

        # Both contexts consumed
        assert "architecture_decisions" in data["context_consumed"]
        assert "naming_conventions" in data["context_consumed"]

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

def _judge_schema(artifact: Path, manifest: dict) -> list[dict]:
    """Deterministic judge for design→data_schema.

    Rules (from ADR-001 + naming conventions context):
      1. Must contain CREATE TABLE statements
      2. Table names must be snake_case (no camelCase or PascalCase)
      3. Must have integrity constraints (NOT NULL, PRIMARY KEY, or FOREIGN KEY)
      4. Must have timestamp columns (created_at / updated_at) per ADR
      5. Foreign keys named fk_{table}_{column} per ADR
    """
    content = artifact.read_text(encoding="utf-8")
    failures = []

    # Rule 1: CREATE TABLE exists
    tables = re.findall(r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)', content, re.IGNORECASE)
    if not tables:
        failures.append("no CREATE TABLE statements found")

    # Rule 2: snake_case names (reject camelCase)
    for t in tables:
        if re.search(r'[A-Z]', t):
            failures.append(f"table '{t}' not snake_case — violates naming conventions")

    # Rule 3: Integrity constraints
    has_constraints = bool(re.search(
        r'(NOT\s+NULL|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK\s*\()',
        content, re.IGNORECASE,
    ))
    if not has_constraints:
        failures.append("no integrity constraints (NOT NULL, PRIMARY KEY, etc.)")

    # Rule 4: Timestamp columns per ADR-001
    has_timestamps = bool(re.search(r'created_at|updated_at', content, re.IGNORECASE))
    if not has_timestamps:
        failures.append("missing created_at/updated_at timestamps (ADR-001 requirement)")

    # Rule 5: FK naming convention (only check if FKs present)
    fk_constraints = re.findall(r'CONSTRAINT\s+(\w+)\s+FOREIGN\s+KEY', content, re.IGNORECASE)
    bad_fks = [name for name in fk_constraints if not name.startswith("fk_")]
    if bad_fks:
        failures.append(f"foreign keys not named fk_{{table}}_{{column}}: {bad_fks}")

    if failures:
        return [{
            "evaluator": _FP_EVAL,
            "result": "fail",
            "evidence": "; ".join(failures),
        }]
    return [{
        "evaluator": _FP_EVAL,
        "result": "pass",
        "evidence": f"schema has {len(tables)} tables, snake_case naming, "
                    f"integrity constraints, timestamps present",
    }]


# ── Layered artifacts for multi-iteration ────────────────────────────────────

# Attempt 1: Missing constraints and timestamps
_SCHEMA_V1 = """\
CREATE TABLE user_accounts (
  id SERIAL
);
"""

# Attempt 2: Has constraints but CamelCase naming violation
_SCHEMA_V2 = """\
CREATE TABLE UserAccounts (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

# Attempt 3: Clean — snake_case, constraints, timestamps
_SCHEMA_V3 = """\
CREATE TABLE IF NOT EXISTS user_accounts (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""


# ── Real F_P judged convergence ──────────────────────────────────────────────

@pytest.mark.e2e
class TestRealFpConvergence:
    """Release-evidence: multi-iteration convergence with a real deterministic judge.

    Three iterations demonstrate iterative refinement:
      1. No constraints or timestamps → judge rejects
      2. CamelCase naming violation → judge rejects
      3. Clean schema with all ADR requirements → judge accepts
    """

    def test_iterative_convergence(self, run_archive):
        target = _setup(run_archive)
        results = run_judged_lifecycle(
            target,
            edge_name=_EDGE,
            fp_evaluator=_FP_EVAL,
            artifact_path=_ARTIFACT_PATH,
            artifacts=[_SCHEMA_V1, _SCHEMA_V2, _SCHEMA_V3],
            judge=_judge_schema,
            archive=run_archive,
        )

        # Iteration 1: fails (missing constraints + timestamps)
        assert not results[0].passed, "iteration 1 must fail: no constraints/timestamps"
        ev1 = results[0].assessments[0]["evidence"]
        assert "constraint" in ev1.lower() or "timestamp" in ev1.lower()

        # Iteration 2: fails (naming violation)
        assert not results[1].passed, "iteration 2 must fail: CamelCase naming"
        assert "snake_case" in results[1].assessments[0]["evidence"].lower()

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
            artifacts=[_SCHEMA_V1, _SCHEMA_V2, _SCHEMA_V3],
            judge=_judge_schema,
            archive=run_archive,
        )

        events = read_events(target)
        assessed = [e for e in events if e["event_type"] == "assessed"]
        assert len(assessed) >= 3

        # Each has real evidence
        for a in assessed:
            assert len(a["data"]["evidence"]) > 0

        # Distinct actors per iteration
        actors = [a["data"]["actor"] for a in assessed]
        assert len(set(actors)) == 3
