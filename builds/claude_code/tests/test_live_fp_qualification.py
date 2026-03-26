# Validates: REQ-F-EVAL-002
# Validates: REQ-F-EVAL-004
# Validates: REQ-F-BIND-001
# Validates: REQ-NFR-E2E-001
# Validates: REQ-P-QUAL-001
# Validates: REQ-P-QUAL-002
# Validates: REQ-P-QUAL-010
# Validates: REQ-P-QUAL-011
# Validates: REQ-P-QUAL-013
# Validates: REQ-P-QUAL-014
# Validates: REQ-P-QUAL-016
# Validates: REQ-P-QUAL-021
# Validates: REQ-P-QUAL-022
"""
Live F_P Prompt Sufficiency Qualification.

This is NOT a protocol test. This tests whether the actual prompt/manifest
ABG produces is sufficient for a real LLM to generate an acceptable artifact.

The LLM receives ONLY what production guarantees:
  - the manifest prompt (preconditions, current state, gap, context, output contract)
  - nothing else

The deterministic judge from each scenario checks the produced artifact.
The LLM's self-assessment is not trusted — only the judge verdict counts.

Two qualification lanes:
  Lane 1 (this file): Fresh-sandbox qualification — one sandbox, one dispatch,
    one verdict. Parametrized, atomic, parallel-safe. This is the release gate.
    "Does the prompt produce a valid artifact?"
  Lane 2 (deferred): Entropy campaign — shared sandbox, ordered sequential
    dispatches, delta trend. Requires artifact fallback removal first.
    "Does the system converge over accumulated state?"

Transport: subprocess with env sanitization (ADR-022)
Architecture: F_D → subprocess → F_P

Requires: claude CLI available on PATH.
Run: pytest builds/claude_code/tests/test_live_fp_qualification.py -v -m live_fp

Archive: test_runs/live_fp_qualification/<timestamp_testname>/
  - manifest.json         — what ABG produced
  - prompt.txt            — exact payload sent to the LLM
  - raw_response.txt      — what the LLM returned
  - judge_verdict.json    — deterministic judge result
  - events.jsonl          — full event chain (snapshot from shared sandbox)
"""
import re
import textwrap
from pathlib import Path

import pytest

from genesis.transport import has_agent

from scenario_helpers import (
    RunArchive, install_sandbox, write_test_package,
    run_genesis, run_genesis_json, read_events,
    invoke_live_fp, LiveFpResult, _has_mcp_transport,
)


# ── Guard: skip at collection if claude CLI is not on PATH ──────────────────
# Two-tier readiness check:
#   1. Collection time (cheap): shutil.which("claude") — is the binary installed?
#      If not, skip immediately. No subprocess, no hang.
#   2. Test setup (once per session): _has_mcp_transport() — is it authenticated?
#      Runs a single "READY" probe before any live test executes.
#      If it fails, all live tests are skipped with a clear message.
#
# This keeps the tests visible in default `pytest --co` output (important for
# auditing coverage) while preventing hangs from import-time subprocess calls.

pytestmark = [pytest.mark.live_fp, pytest.mark.timeout(600)]

# Tier 1: cheap PATH check at collection time (no subprocess)
skip_no_agent = pytest.mark.skipif(
    not has_agent("claude"),
    reason="claude CLI not on PATH — install Claude Code to run live F_P qualification",
)


# Tier 2: session-scoped auth probe (runs once before first live test)
@pytest.fixture(scope="session", autouse=True)
def _verify_agent_transport():
    """Probe Claude CLI readiness once per session. Skip all if not authenticated."""
    if not has_agent("claude"):
        pytest.skip("claude CLI not on PATH")
    if not _has_mcp_transport():
        pytest.skip("claude CLI on PATH but not authenticated — run `claude` to login")


# ══════════════════════════════════════════════════════════════════════════════
# Scenario 1: requirements → uat_tests
# ══════════════════════════════════════════════════════════════════════════════

_UAT_PACKAGE = textwrap.dedent('''\
    """Normative requirements to acceptance test cases."""
    from gtl.graph import Graph, Node, GraphVector, Context
    from gtl.module_model import Module
    from gtl.core import Evaluator, Operator, Rule, F_D, F_P
    from gtl.work_model import Job, ContractRef

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
    )
    module = Module(
        name="uat_design",
        graphs=(graph,),
        jobs=(job,),
        metadata={"requirements": ["REQ-UAT-001", "REQ-UAT-002"]},
    )
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


def _setup_uat_sandbox(target: Path, archive: RunArchive) -> None:
    """Install and configure a UAT scenario sandbox. Called once."""
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


# ══════════════════════════════════════════════════════════════════════════════
# Scenario 2: design → data_schema
# ══════════════════════════════════════════════════════════════════════════════

_SCHEMA_PACKAGE = textwrap.dedent('''\
    """Architectural design to structured data schema."""
    from gtl.graph import Graph, Node, GraphVector, Context
    from gtl.module_model import Module
    from gtl.core import Evaluator, Operator, Rule, F_D, F_P
    from gtl.work_model import Job, ContractRef

    design = Node(
        name="design",
        markov=("adrs_recorded", "components_identified", "interfaces_specified"),
    )
    data_schema = Node(
        name="data_schema",
        markov=("naming_consistent", "constraints_present", "migration_safe"),
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

    eval_fd = Evaluator("artifact_exists", F_D,
        "schema artifact exists at output/schema.sql",
        binding="exec://test -f output/schema.sql")
    eval_fp = Evaluator("schema_quality", F_P,
        "agent: schema follows naming conventions, has integrity constraints, is migration-safe")

    vector = GraphVector(
        name="design\\u2192data_schema",
        source=design, target=data_schema,
        operators=(op_fd, op_fp),
        evaluators=(eval_fd, eval_fp),
        contexts=(ctx_adr, ctx_naming),
    )
    job = Job(name=vector.name, contracts=(ContractRef(kind="graph_vector", target_id=vector.id),))
    graph = Graph(
        name="design\\u2192data_schema",
        inputs=(design,), outputs=(data_schema,),
        nodes=(design, data_schema), vectors=(vector,),
    )
    module = Module(
        name="schema_design",
        graphs=(graph,),
        jobs=(job,),
        metadata={"requirements": ["REQ-DS-001", "REQ-DS-002"]},
    )
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


def _setup_schema_sandbox(target: Path, archive: RunArchive) -> None:
    """Install and configure a schema scenario sandbox. Called once."""
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


# ══════════════════════════════════════════════════════════════════════════════
# Single-run smoke tests — fresh sandbox per test
# ══════════════════════════════════════════════════════════════════════════════

@skip_no_agent
class TestLiveFpSmoke:
    """Single-run smoke test — does the prompt produce anything the judge can evaluate?"""

    def test_uat_single_run(self, run_archive):
        target = run_archive.workspace
        _setup_uat_sandbox(target, run_archive)
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
        target = run_archive.workspace
        _setup_schema_sandbox(target, run_archive)
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
# Lane 1: Fresh-sandbox qualification — release gate
#
# Each parametrized run gets its own sandbox. One dispatch, one verdict.
# Parallel-safe. "Does the prompt produce a valid artifact in isolation?"
#
# Lane 2 (entropy campaign — shared sandbox, sequential, delta trend) is
# deferred until the raw_response→artifact fallback is removed.
# ══════════════════════════════════════════════════════════════════════════════

_QUAL_RUNS = 10


@skip_no_agent
class TestUatQualification:
    """UAT qualification: 10 fresh-sandbox runs. Release gate.

    Each run gets its own sandbox — tests prompt sufficiency in isolation.
    """

    @pytest.mark.parametrize("run_id", range(_QUAL_RUNS))
    def test_uat_run(self, run_id, run_archive):
        """requirements→uat_tests: fresh sandbox, single dispatch."""
        target = run_archive.workspace
        _setup_uat_sandbox(target, run_archive)
        result = invoke_live_fp(
            target,
            artifact_path="output/uat_tests.md",
            edge_name="requirements\u2192uat_tests",
            judge=_judge_uat,
            archive=run_archive,
        )
        assert result.judge_passed, (
            f"run {run_id}: "
            f"{result.judge_assessments[0]['evidence'] if result.judge_assessments else 'no assessment'}"
        )


@skip_no_agent
class TestSchemaQualification:
    """Schema qualification: 10 fresh-sandbox runs. Release gate.

    Each run gets its own sandbox — tests prompt sufficiency in isolation.
    """

    @pytest.mark.parametrize("run_id", range(_QUAL_RUNS))
    def test_schema_run(self, run_id, run_archive):
        """design→data_schema: fresh sandbox, single dispatch."""
        target = run_archive.workspace
        _setup_schema_sandbox(target, run_archive)
        result = invoke_live_fp(
            target,
            artifact_path="output/schema.sql",
            edge_name="design\u2192data_schema",
            judge=_judge_schema,
            archive=run_archive,
        )
        assert result.judge_passed, (
            f"run {run_id}: "
            f"{result.judge_assessments[0]['evidence'] if result.judge_assessments else 'no assessment'}"
        )
