# Validates: REQ-F-EVAL-002
# Validates: REQ-F-EVAL-004
# Validates: REQ-F-BIND-001
# Validates: REQ-NFR-E2E-001
"""
Live F_P Prompt Sufficiency Qualification.

This is NOT a protocol test. This tests whether the actual prompt/manifest
ABG produces is sufficient for a real LLM to generate an acceptable artifact.

The LLM receives ONLY what production guarantees:
  - the manifest prompt (preconditions, current state, gap, context, output contract)
  - nothing else

The deterministic judge from each scenario checks the produced artifact.
The LLM's self-assessment is not trusted — only the judge verdict counts.

Success criterion: 8/10 runs judged acceptable per scenario.

Transport: claude -p (Claude Code CLI in pipe mode)
Architecture: F_D → MCP → F_P.claudecode

Requires: claude CLI available on PATH.
Run: pytest builds/claude_code/tests/test_live_fp_qualification.py -v -m live_fp

Archive: tests/runs/live_fp_qualification/<scenario>/<timestamp>/
  - manifest.json         — what ABG produced
  - prompt.txt            — exact payload sent to the LLM
  - raw_response.txt      — what the LLM returned
  - judge_verdict.json    — deterministic judge result
  - events.jsonl          — full event chain
"""
import json
import re
import textwrap
from pathlib import Path

import pytest

from scenario_helpers import (
    RunArchive, install_sandbox, write_test_package,
    run_genesis, run_genesis_json, read_events,
    invoke_live_fp, LiveFpResult, _has_mcp_transport,
)


# ── Skip if no MCP transport ─────────────────────────────────────────────────

pytestmark = pytest.mark.live_fp

skip_no_mcp = pytest.mark.skipif(
    not _has_mcp_transport(),
    reason="@steipete/claude-code-mcp not available — live F_P qualification requires MCP transport",
)


# ══════════════════════════════════════════════════════════════════════════════
# Scenario 1: requirements → uat_tests
# ══════════════════════════════════════════════════════════════════════════════

_UAT_PACKAGE = textwrap.dedent('''\
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


def _judge_uat(artifact: Path, manifest: dict) -> list[dict]:
    """Same deterministic judge as test_scenario_requirements_to_uat."""
    content = artifact.read_text(encoding="utf-8")
    failures = []

    expected_reqs = {"REQ-UAT-001", "REQ-UAT-002"}
    found_reqs = set(re.findall(r'REQ-UAT-\d+', content))
    missing = expected_reqs - found_reqs
    if missing:
        failures.append(f"missing requirement coverage: {sorted(missing)}")

    # Accept both "Steps:" and "### Steps" heading formats
    has_steps = bool(re.search(r'[Ss]teps?\s*[:*\n]', content)) and bool(re.search(r'\d+\.', content))
    if not has_steps:
        failures.append("no numbered steps found")

    # Accept both "Expected Result:" and "### Expected Results" heading formats
    has_expected = bool(re.search(r'[Ee]xpected\s*[Rr]esults?\s*[:*\n]', content))
    if not has_expected:
        failures.append("no 'Expected Result:' sections")

    has_edge_cases = bool(re.search(
        r'(edge case|boundary|error|invalid|negative|timeout|empty)',
        content, re.IGNORECASE,
    ))
    if not has_edge_cases:
        failures.append("no edge case coverage found")

    if failures:
        return [{"evaluator": "test_coverage", "result": "fail",
                 "evidence": "; ".join(failures)}]
    return [{"evaluator": "test_coverage", "result": "pass",
             "evidence": f"all requirements covered ({len(found_reqs)}), "
                         f"numbered steps, expected results, edge cases present"}]


def _setup_uat(archive: RunArchive) -> Path:
    target = archive.workspace
    install_sandbox(target, archive=archive)
    write_test_package(target, _UAT_PACKAGE)
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
    # F_D artifact must exist for F_P dispatch
    out = target / "output"
    out.mkdir(parents=True, exist_ok=True)
    (out / "uat_tests.md").write_text("# placeholder\n")
    return target


# ══════════════════════════════════════════════════════════════════════════════
# Scenario 2: design → data_schema
# ══════════════════════════════════════════════════════════════════════════════

_SCHEMA_PACKAGE = textwrap.dedent('''\
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


def _judge_schema(artifact: Path, manifest: dict) -> list[dict]:
    """Same deterministic judge as test_scenario_design_to_schema."""
    content = artifact.read_text(encoding="utf-8")
    failures = []

    tables = re.findall(
        r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)',
        content, re.IGNORECASE,
    )
    if not tables:
        failures.append("no CREATE TABLE statements found")

    for t in tables:
        if re.search(r'[A-Z]', t):
            failures.append(f"table '{t}' not snake_case")

    has_constraints = bool(re.search(
        r'(NOT\s+NULL|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK\s*\()',
        content, re.IGNORECASE,
    ))
    if not has_constraints:
        failures.append("no integrity constraints")

    has_timestamps = bool(re.search(r'created_at|updated_at', content, re.IGNORECASE))
    if not has_timestamps:
        failures.append("missing created_at/updated_at timestamps")

    if failures:
        return [{"evaluator": "schema_quality", "result": "fail",
                 "evidence": "; ".join(failures)}]
    return [{"evaluator": "schema_quality", "result": "pass",
             "evidence": f"schema has {len(tables)} tables, snake_case, "
                         f"constraints, timestamps"}]


def _setup_schema(archive: RunArchive) -> Path:
    target = archive.workspace
    install_sandbox(target, archive=archive)
    write_test_package(target, _SCHEMA_PACKAGE)
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
    out = target / "output"
    out.mkdir(parents=True, exist_ok=True)
    (out / "schema.sql").write_text("-- placeholder\n")
    return target


# ══════════════════════════════════════════════════════════════════════════════
# Single-run smoke tests
# ══════════════════════════════════════════════════════════════════════════════

@skip_no_mcp
class TestLiveFpSmoke:
    """Single-run smoke test — does the prompt produce anything the judge can evaluate?"""

    def test_uat_single_run(self, run_archive):
        target = _setup_uat(run_archive)
        result = invoke_live_fp(
            target,
            artifact_path="output/uat_tests.md",
            edge_name="requirements\u2192uat_tests",
            judge=_judge_uat,
            archive=run_archive,
        )
        # We don't assert pass — we assert the protocol completed
        assert result.raw_response, "LLM must produce a response"
        assert result.judge_assessments, "judge must produce assessments"
        assert result.model, "model must be recorded"

    def test_schema_single_run(self, run_archive):
        target = _setup_schema(run_archive)
        result = invoke_live_fp(
            target,
            artifact_path="output/schema.sql",
            edge_name="design\u2192data_schema",
            judge=_judge_schema,
            archive=run_archive,
        )
        assert result.raw_response, "LLM must produce a response"
        assert result.judge_assessments, "judge must produce assessments"


# ══════════════════════════════════════════════════════════════════════════════
# Qualification runs — success rate tests
# ══════════════════════════════════════════════════════════════════════════════

_QUAL_RUNS = 10
_QUAL_BAR = 8  # 8/10 must pass


@skip_no_mcp
class TestLiveFpQualification:
    """Prompt sufficiency qualification: 10 runs, require 8/10 judged acceptable.

    This is the release evidence test. It proves that the F_P dispatch
    payload ABG produces is sufficient for a real LLM within tolerance.
    """

    def test_uat_qualification(self, run_archive):
        """requirements→uat_tests: 10 runs, 8/10 bar."""
        passed = 0
        results: list[LiveFpResult] = []

        for i in range(_QUAL_RUNS):
            target = run_archive.workspace / f"uat_run_{i}"
            target.mkdir(parents=True, exist_ok=True)
            sub_archive = RunArchive(
                run_dir=run_archive.run_dir / f"uat_run_{i}",
                workspace=target,
                artifacts_dir=run_archive.run_dir / f"uat_run_{i}" / "artifacts",
                usecase_id="live_fp_uat",
                test_name=f"uat_run_{i}",
                timestamp=run_archive.timestamp,
            )
            sub_archive.run_dir.mkdir(parents=True, exist_ok=True)
            sub_archive.artifacts_dir.mkdir(parents=True, exist_ok=True)

            _setup_uat_in(target, sub_archive)
            result = invoke_live_fp(
                target,
                artifact_path="output/uat_tests.md",
                edge_name="requirements\u2192uat_tests",
                judge=_judge_uat,
                archive=sub_archive,
            )
            results.append(result)
            if result.judge_passed:
                passed += 1
            sub_archive.finalize(test_passed=result.judge_passed)

        # Write qualification summary
        summary = {
            "scenario": "requirements→uat_tests",
            "total_runs": _QUAL_RUNS,
            "passed": passed,
            "bar": _QUAL_BAR,
            "qualified": passed >= _QUAL_BAR,
            "runs": [
                {
                    "run": i,
                    "passed": r.judge_passed,
                    "evidence": r.judge_assessments[0]["evidence"] if r.judge_assessments else "",
                    "model": r.model,
                }
                for i, r in enumerate(results)
            ],
        }
        (run_archive.artifacts_dir / "uat_qualification.json").write_text(
            json.dumps(summary, indent=2), encoding="utf-8")

        assert passed >= _QUAL_BAR, (
            f"UAT qualification failed: {passed}/{_QUAL_RUNS} passed "
            f"(bar: {_QUAL_BAR}/{_QUAL_RUNS})\n"
            + "\n".join(
                f"  run {i}: {'PASS' if r.judge_passed else 'FAIL'} — "
                f"{r.judge_assessments[0]['evidence'][:80]}"
                for i, r in enumerate(results)
            )
        )

    def test_schema_qualification(self, run_archive):
        """design→data_schema: 10 runs, 8/10 bar."""
        passed = 0
        results: list[LiveFpResult] = []

        for i in range(_QUAL_RUNS):
            target = run_archive.workspace / f"schema_run_{i}"
            target.mkdir(parents=True, exist_ok=True)
            sub_archive = RunArchive(
                run_dir=run_archive.run_dir / f"schema_run_{i}",
                workspace=target,
                artifacts_dir=run_archive.run_dir / f"schema_run_{i}" / "artifacts",
                usecase_id="live_fp_schema",
                test_name=f"schema_run_{i}",
                timestamp=run_archive.timestamp,
            )
            sub_archive.run_dir.mkdir(parents=True, exist_ok=True)
            sub_archive.artifacts_dir.mkdir(parents=True, exist_ok=True)

            _setup_schema_in(target, sub_archive)
            result = invoke_live_fp(
                target,
                artifact_path="output/schema.sql",
                edge_name="design\u2192data_schema",
                judge=_judge_schema,
                archive=sub_archive,
            )
            results.append(result)
            if result.judge_passed:
                passed += 1
            sub_archive.finalize(test_passed=result.judge_passed)

        summary = {
            "scenario": "design→data_schema",
            "total_runs": _QUAL_RUNS,
            "passed": passed,
            "bar": _QUAL_BAR,
            "qualified": passed >= _QUAL_BAR,
            "runs": [
                {
                    "run": i,
                    "passed": r.judge_passed,
                    "evidence": r.judge_assessments[0]["evidence"] if r.judge_assessments else "",
                    "model": r.model,
                }
                for i, r in enumerate(results)
            ],
        }
        (run_archive.artifacts_dir / "schema_qualification.json").write_text(
            json.dumps(summary, indent=2), encoding="utf-8")

        assert passed >= _QUAL_BAR, (
            f"Schema qualification failed: {passed}/{_QUAL_RUNS} passed "
            f"(bar: {_QUAL_BAR}/{_QUAL_RUNS})\n"
            + "\n".join(
                f"  run {i}: {'PASS' if r.judge_passed else 'FAIL'} — "
                f"{r.judge_assessments[0]['evidence'][:80]}"
                for i, r in enumerate(results)
            )
        )


# ── Setup helpers for qualification (install into pre-created target) ────────

def _setup_uat_in(target: Path, archive: RunArchive) -> None:
    install_sandbox(target, archive=archive)
    write_test_package(target, _UAT_PACKAGE)
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
    out = target / "output"
    out.mkdir(parents=True, exist_ok=True)
    (out / "uat_tests.md").write_text("# placeholder\n")


def _setup_schema_in(target: Path, archive: RunArchive) -> None:
    install_sandbox(target, archive=archive)
    write_test_package(target, _SCHEMA_PACKAGE)
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
    out = target / "output"
    out.mkdir(parents=True, exist_ok=True)
    (out / "schema.sql").write_text("-- placeholder\n")
