# Validates: REQ-P-QUAL-023
# Validates: REQ-P-QUAL-024
# Validates: REQ-P-QUAL-005
# Validates: REQ-P-QUAL-006
"""
Transport contract tests — validates ADR-022 design decisions.

These are unit tests for the transport module's build-specific behavior:
permission bypass, retry logic, env sanitization, failure classification.

No live agent needed — tests mock subprocess.run.
"""
import subprocess
from unittest.mock import patch, MagicMock

import pytest

from genesis.transport import (
    _build_args,
    _sanitized_env,
    call_agent,
    classify_failure,
    AgentTransportError,
    AgentResult,
    AGENT_CALL_TIMEOUT,
    AGENT_RETRY_COUNT,
    AGENT_RETRY_BACKOFF,
)


class TestBuildArgs:
    """ADR-022: subprocess args carry the correct agent-specific flags."""

    def test_claude_includes_permission_bypass(self):
        """REQ-P-QUAL-023: Claude subprocess must bypass permissions."""
        args = _build_args("claude", "hello")
        assert "--permission-mode" in args
        assert "bypassPermissions" in args

    def test_claude_includes_pipe_mode(self):
        args = _build_args("claude", "hello")
        assert "-p" in args
        assert "--output-format" in args
        assert "text" in args

    def test_claude_prompt_is_last_arg(self):
        args = _build_args("claude", "do the thing")
        assert args[-1] == "do the thing"

    def test_codex_includes_full_auto(self):
        args = _build_args("codex", "hello")
        assert "--full-auto" in args

    def test_gemini_includes_pipe_mode(self):
        args = _build_args("gemini", "hello")
        assert "-p" in args

    def test_unknown_agent_raises(self):
        with pytest.raises(ValueError, match="Unknown agent"):
            _build_args("gpt", "hello")


class TestSanitizedEnv:
    """ADR-022: Claude subprocess env strips CLAUDE* vars."""

    def test_claude_strips_claude_vars(self):
        with patch.dict("os.environ", {"CLAUDE_CODE_SSE_PORT": "1234", "PATH": "/usr/bin"}):
            env = _sanitized_env("claude")
            assert "CLAUDE_CODE_SSE_PORT" not in env
            assert "PATH" in env

    def test_codex_preserves_all_vars(self):
        with patch.dict("os.environ", {"CLAUDE_CODE_SSE_PORT": "1234", "PATH": "/usr/bin"}):
            env = _sanitized_env("codex")
            assert "CLAUDE_CODE_SSE_PORT" in env


class TestCallAgentRetry:
    """REQ-P-QUAL-024: transient failures are retried."""

    @patch("genesis.transport.shutil.which", return_value="/usr/bin/claude")
    @patch("genesis.transport.subprocess.run")
    def test_succeeds_on_second_attempt(self, mock_run, _which):
        """Transient failure followed by success — retry saves the run."""
        fail = MagicMock(returncode=1, stderr="rate limited", stdout="")
        ok = MagicMock(returncode=0, stdout="artifact content")
        mock_run.side_effect = [fail, ok]

        result = call_agent("prompt", "/tmp/ws", agent="claude", retries=1)
        assert result == "artifact content"
        assert mock_run.call_count == 2

    @patch("genesis.transport.shutil.which", return_value="/usr/bin/claude")
    @patch("genesis.transport.subprocess.run")
    def test_exhausts_retries_then_raises(self, mock_run, _which):
        """All attempts fail — raises after exhausting retry budget."""
        fail = MagicMock(returncode=1, stderr="error", stdout="")
        mock_run.return_value = fail

        with pytest.raises(AgentTransportError, match="attempt 3/3"):
            call_agent("prompt", "/tmp/ws", agent="claude", retries=2)
        assert mock_run.call_count == 3

    @patch("genesis.transport.shutil.which", return_value="/usr/bin/claude")
    @patch("genesis.transport.subprocess.run")
    def test_timeout_is_retryable(self, mock_run, _which):
        """Timeout on first attempt, success on second."""
        mock_run.side_effect = [
            subprocess.TimeoutExpired(cmd="claude", timeout=300),
            MagicMock(returncode=0, stdout="ok"),
        ]

        result = call_agent("prompt", "/tmp/ws", agent="claude", retries=1)
        assert result == "ok"

    @patch("genesis.transport.shutil.which", return_value=None)
    def test_missing_agent_not_retried(self, _which):
        """Permanent failure — agent not installed is not retried."""
        with pytest.raises(AgentTransportError, match="not found"):
            call_agent("prompt", "/tmp/ws", agent="claude", retries=2)

    def test_retry_constants_are_bounded(self):
        """Retry budget is a named constant, not unbounded."""
        assert AGENT_RETRY_COUNT >= 1
        assert AGENT_RETRY_COUNT <= 5
        assert AGENT_RETRY_BACKOFF >= 1
        assert AGENT_RETRY_BACKOFF <= 30


class TestClassifyFailure:
    """ADR-027: failure classification produces distinct signals."""

    def test_timeout_is_transport_failure(self):
        r = AgentResult(stdout="", stderr="", returncode=-1, agent="claude", timed_out=True)
        assert classify_failure(r) == "transport_failure"

    def test_crash_no_output_is_transport_failure(self):
        r = AgentResult(stdout="", stderr="crashed", returncode=1, agent="claude")
        assert classify_failure(r) == "transport_failure"

    def test_success_no_result_path_is_none(self):
        r = AgentResult(stdout="ok", stderr="", returncode=0, agent="claude")
        assert classify_failure(r) is None

    def test_missing_result_file_is_no_output(self):
        r = AgentResult(stdout="ok", stderr="", returncode=0, agent="claude")
        assert classify_failure(r, result_path="/nonexistent/path.json") == "no_output"
