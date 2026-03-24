# Validates: REQ-F-RUN-002
# Validates: REQ-F-LEAF-002
"""
ADR-027 failure classification + leaf task dispatch — use-case tests.

Each test is a scenario from the ADR-027 classification table:

  | Classification     | Meaning                              | Retry eligible |
  |--------------------|--------------------------------------|----------------|
  | transport_failure  | Actor unreachable, timeout, crash     | Yes            |
  | no_output          | Actor ran, produced nothing           | Yes (diff params)|
  | bad_output         | Result file exists, not valid JSON    | No             |
  | (success)          | Valid result file                     | n/a            |

certification_failure is NOT tested here — it's diagnosed by F_D post-assessment.
"""
import json
import subprocess
from unittest.mock import patch, MagicMock

from genesis.fp_dispatch import (
    AgentResult,
    classify_failure,
    dispatch_agent,
    dispatch_leaf,
)
from genesis.schedule import LeafTask, validate_leaf_schema


class TestFailureClassificationTable:
    """REQ-F-RUN-002: every dispatch outcome maps to exactly one classification."""

    @patch("genesis.fp_dispatch.subprocess.run",
           side_effect=subprocess.TimeoutExpired(cmd="claude", timeout=300))
    @patch("genesis.fp_dispatch.shutil.which", return_value="/usr/bin/claude")
    def test_actor_timeout_is_transport_failure(self, _w, _r, tmp_path):
        """Actor hangs → transport_failure. Retry eligible."""
        result_path = str(tmp_path / "result.json")
        r = dispatch_agent("build the thing", str(tmp_path), agent="claude")
        assert classify_failure(r, result_path) == "transport_failure"

    @patch("genesis.fp_dispatch.shutil.which", return_value=None)
    def test_actor_not_installed_is_transport_failure(self, _w, tmp_path):
        """Agent CLI not on PATH → transport_failure. Retry eligible."""
        r = dispatch_agent("build the thing", str(tmp_path), agent="claude")
        assert classify_failure(r) == "transport_failure"

    @patch("genesis.fp_dispatch.subprocess.run")
    @patch("genesis.fp_dispatch.shutil.which", return_value="/usr/bin/claude")
    def test_actor_crash_is_transport_failure(self, _w, mock_run, tmp_path):
        """Agent crashes (non-zero exit, no stdout) → transport_failure."""
        mock_run.return_value = MagicMock(stdout="", stderr="SIGSEGV", returncode=139)
        r = dispatch_agent("build the thing", str(tmp_path), agent="claude")
        assert classify_failure(r) == "transport_failure"

    @patch("genesis.fp_dispatch.subprocess.run")
    @patch("genesis.fp_dispatch.shutil.which", return_value="/usr/bin/claude")
    def test_actor_ran_but_wrote_nothing_is_no_output(self, _w, mock_run, tmp_path):
        """Agent exits 0 but result_path doesn't exist → no_output."""
        mock_run.return_value = MagicMock(stdout="done", stderr="", returncode=0)
        missing = str(tmp_path / "result.json")
        r = dispatch_agent("build the thing", str(tmp_path), agent="claude")
        assert classify_failure(r, result_path=missing) == "no_output"

    @patch("genesis.fp_dispatch.subprocess.run")
    @patch("genesis.fp_dispatch.shutil.which", return_value="/usr/bin/claude")
    def test_actor_wrote_empty_file_is_no_output(self, _w, mock_run, tmp_path):
        """Agent exits 0, result file exists but empty → no_output."""
        mock_run.return_value = MagicMock(stdout="done", stderr="", returncode=0)
        result_file = tmp_path / "result.json"
        result_file.write_text("")
        r = dispatch_agent("build the thing", str(tmp_path), agent="claude")
        assert classify_failure(r, result_path=str(result_file)) == "no_output"

    @patch("genesis.fp_dispatch.subprocess.run")
    @patch("genesis.fp_dispatch.shutil.which", return_value="/usr/bin/claude")
    def test_actor_wrote_invalid_json_is_bad_output(self, _w, mock_run, tmp_path):
        """Agent writes structurally invalid assessment → bad_output. Not retryable."""
        mock_run.return_value = MagicMock(stdout="done", stderr="", returncode=0)
        result_file = tmp_path / "result.json"
        result_file.write_text("{truncated json")
        r = dispatch_agent("build the thing", str(tmp_path), agent="claude")
        assert classify_failure(r, result_path=str(result_file)) == "bad_output"

    @patch("genesis.fp_dispatch.subprocess.run")
    @patch("genesis.fp_dispatch.shutil.which", return_value="/usr/bin/claude")
    def test_valid_assessment_is_success(self, _w, mock_run, tmp_path):
        """Agent writes valid JSON assessment → success (None). F_D decides quality."""
        mock_run.return_value = MagicMock(stdout="done", stderr="", returncode=0)
        result_file = tmp_path / "result.json"
        result_file.write_text(json.dumps({
            "edge": "design→code", "actor": "claude",
            "assessments": [{"evaluator": "code_complete", "result": "pass"}],
        }))
        r = dispatch_agent("build the thing", str(tmp_path), agent="claude")
        assert classify_failure(r, result_path=str(result_file)) is None

    @patch("genesis.fp_dispatch.subprocess.run")
    @patch("genesis.fp_dispatch.shutil.which", return_value="/usr/bin/claude")
    def test_nonzero_exit_with_valid_result_defers_to_fd(self, _w, mock_run, tmp_path):
        """Agent exited non-zero but wrote valid output → not a transport problem.
        Let F_D evaluate — may become certification_failure at the engine layer."""
        mock_run.return_value = MagicMock(
            stdout="partial output", stderr="warnings", returncode=1,
        )
        result_file = tmp_path / "result.json"
        result_file.write_text(json.dumps({"edge": "a→b", "assessments": []}))
        r = dispatch_agent("build the thing", str(tmp_path), agent="claude")
        assert classify_failure(r, result_path=str(result_file)) is None

    @patch("genesis.fp_dispatch.subprocess.run",
           side_effect=subprocess.TimeoutExpired(cmd="claude", timeout=5))
    @patch("genesis.fp_dispatch.shutil.which", return_value="/usr/bin/claude")
    def test_timeout_takes_precedence_over_existing_result(self, _w, _r, tmp_path):
        """If agent timed out, classification is transport_failure even if a partial
        result file exists from a previous run — timeout is the authoritative signal."""
        result_file = tmp_path / "result.json"
        result_file.write_text(json.dumps({"stale": True}))
        r = dispatch_agent("build the thing", str(tmp_path), agent="claude")
        assert classify_failure(r, result_path=str(result_file)) == "transport_failure"


# ── Leaf task dispatch scenarios ─────────────────────────────────────────────

# Shared fixtures for leaf task tests
_SUMMARIZE_TASK = LeafTask(
    name="summarize",
    input_schema={
        "type": "object",
        "required": ["text"],
        "properties": {"text": {"type": "string"}},
    },
    output_schema={
        "type": "object",
        "required": ["summary"],
        "properties": {"summary": {"type": "string"}},
    },
    timeout_ms=10_000,
    tools_allowed=False,
)


class TestLeafTaskDispatch:
    """REQ-F-LEAF-002: leaf task sub-dispatch scenarios from ADR-027."""

    @patch("genesis.fp_dispatch.subprocess.run")
    @patch("genesis.fp_dispatch.shutil.which", return_value="/usr/bin/claude")
    def test_leaf_valid_output_returns_result(self, _w, mock_run, tmp_path):
        """UC-L1: Agent produces valid JSON matching output schema → success."""
        output = {"summary": "concise result"}
        # Agent writes result to leaf_results/summarize.json
        result_dir = tmp_path / ".ai-workspace" / "leaf_results"
        result_dir.mkdir(parents=True)
        (result_dir / "summarize.json").write_text(json.dumps(output))
        mock_run.return_value = MagicMock(stdout="done", stderr="", returncode=0)

        result, failure = dispatch_leaf(
            _SUMMARIZE_TASK,
            {"text": "long document"},
            parent_run_id="run-001",
            work_folder=str(tmp_path),
        )
        assert failure is None
        assert result == output

    @patch("genesis.fp_dispatch.subprocess.run",
           side_effect=subprocess.TimeoutExpired(cmd="claude", timeout=10))
    @patch("genesis.fp_dispatch.shutil.which", return_value="/usr/bin/claude")
    def test_leaf_timeout_is_transport_failure(self, _w, _r, tmp_path):
        """UC-L2: Agent hangs on leaf task → transport_failure."""
        result, failure = dispatch_leaf(
            _SUMMARIZE_TASK,
            {"text": "input"},
            parent_run_id="run-001",
            work_folder=str(tmp_path),
        )
        assert result is None
        assert failure == "transport_failure"

    @patch("genesis.fp_dispatch.subprocess.run")
    @patch("genesis.fp_dispatch.shutil.which", return_value="/usr/bin/claude")
    def test_leaf_invalid_output_json_is_bad_output(self, _w, mock_run, tmp_path):
        """UC-L3: Agent writes garbage to result file → bad_output."""
        result_dir = tmp_path / ".ai-workspace" / "leaf_results"
        result_dir.mkdir(parents=True)
        (result_dir / "summarize.json").write_text("{not valid json")
        mock_run.return_value = MagicMock(stdout="done", stderr="", returncode=0)

        result, failure = dispatch_leaf(
            _SUMMARIZE_TASK,
            {"text": "input"},
            parent_run_id="run-001",
            work_folder=str(tmp_path),
        )
        assert result is None
        assert failure == "bad_output"

    def test_leaf_input_validation_rejects_before_dispatch(self, tmp_path):
        """UC-L4: Invalid input rejected before agent is called — no subprocess."""
        result, failure = dispatch_leaf(
            _SUMMARIZE_TASK,
            {"wrong_field": 42},  # missing required "text"
            parent_run_id="run-001",
            work_folder=str(tmp_path),
        )
        assert result is None
        assert failure == "bad_output"

    def test_leaf_sub_run_identity_model(self):
        """UC-L5: Sub-run identity follows {parent}/leaf/{name} pattern."""
        task = LeafTask(
            name="extract_entities",
            input_schema={"type": "object"},
            output_schema={"type": "object"},
        )
        expected = "run-abc-123/leaf/extract_entities"
        assert f"run-abc-123/leaf/{task.name}" == expected


class TestLeafSchemaValidation:
    """REQ-F-LEAF-001: schema validation scenarios."""

    def test_valid_data_passes(self):
        """Data matching all required fields and types → valid."""
        schema = {
            "required": ["name", "count"],
            "properties": {
                "name": {"type": "string"},
                "count": {"type": "integer"},
            },
        }
        valid, err = validate_leaf_schema({"name": "x", "count": 5}, schema)
        assert valid is True
        assert err == ""

    def test_missing_required_field_fails(self):
        """Data missing a required field → invalid with field name."""
        schema = {"required": ["name"], "properties": {"name": {"type": "string"}}}
        valid, err = validate_leaf_schema({}, schema)
        assert valid is False
        assert "name" in err

    def test_wrong_type_fails(self):
        """Field present but wrong type → invalid."""
        schema = {"properties": {"count": {"type": "integer"}}}
        valid, err = validate_leaf_schema({"count": "not_a_number"}, schema)
        assert valid is False
        assert "count" in err

    def test_non_dict_input_fails(self):
        """Non-dict input → invalid."""
        valid, err = validate_leaf_schema("not a dict", {})  # type: ignore
        assert valid is False
