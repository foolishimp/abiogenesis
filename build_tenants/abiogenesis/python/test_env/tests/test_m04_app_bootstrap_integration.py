# Validates: REQ-P-QUAL-005
# Validates: REQ-P-QUAL-006
# Validates: REQ-P-QUAL-012
# Validates: REQ-P-QUAL-023
# Validates: REQ-P-QUAL-024
"""
M04 app-bootstrap integration lane.

This replaces the legacy transport helper microtests with boundary checks over
the public transport and bootstrap surfaces used by the canonical python tenant.
"""
from __future__ import annotations

import subprocess
from unittest.mock import MagicMock, patch

import pytest

from genesis.transport import (
    AGENT_RETRY_BACKOFF,
    AGENT_RETRY_COUNT,
    AGENT_CALL_TIMEOUT,
    AgentResult,
    AgentTransportError,
    call_agent,
    classify_failure,
    dispatch_agent,
)


@pytest.mark.integration
class TestM04AppBootstrapIntegration:
    @patch("genesis.transport.shutil.which", return_value="/usr/bin/claude")
    @patch("genesis.transport.subprocess.run")
    def test_call_agent_dispatches_claude_with_capability_grant_and_sanitized_env(self, mock_run, _which, tmp_path):
        mock_run.return_value = MagicMock(returncode=0, stdout="artifact body", stderr="")

        with patch.dict("os.environ", {"CLAUDE_CODE_SSE_PORT": "1234", "PATH": "/usr/bin"}):
            result = call_agent("render artifact", str(tmp_path), agent="claude", retries=0)

        assert result == "artifact body"
        assert mock_run.call_count == 1

        call = mock_run.call_args
        args = call.args[0]
        env = call.kwargs["env"]

        assert call.kwargs["cwd"] == str(tmp_path)
        assert args[:2] == ["claude", "-p"]
        assert "--permission-mode" in args
        assert "bypassPermissions" in args
        assert args[-1] == "render artifact"
        assert "CLAUDE_CODE_SSE_PORT" not in env
        assert env["PATH"] == "/usr/bin"

    @pytest.mark.parametrize(
        ("agent", "expected_flags"),
        (
            ("codex", ("codex", "-q", "--full-auto")),
            ("gemini", ("gemini", "-p")),
        ),
    )
    @patch("genesis.transport.shutil.which")
    @patch("genesis.transport.subprocess.run")
    def test_call_agent_uses_worker_specific_cli_contract(self, mock_run, mock_which, agent, expected_flags, tmp_path):
        mock_which.return_value = f"/usr/bin/{agent}"
        mock_run.return_value = MagicMock(returncode=0, stdout="ok", stderr="")

        assert call_agent("prompt", str(tmp_path), agent=agent, retries=0) == "ok"
        args = mock_run.call_args.args[0]

        assert tuple(args[: len(expected_flags)]) == expected_flags
        assert args[-1] == "prompt"

    @patch("genesis.transport.shutil.which", return_value="/usr/bin/claude")
    @patch("genesis.transport.subprocess.run")
    def test_call_agent_retries_transient_failure_with_bounded_budget(self, mock_run, _which, tmp_path):
        mock_run.side_effect = [
            subprocess.TimeoutExpired(cmd="claude", timeout=AGENT_CALL_TIMEOUT),
            MagicMock(returncode=0, stdout="recovered", stderr=""),
        ]

        assert call_agent("prompt", str(tmp_path), agent="claude", retries=1) == "recovered"
        assert mock_run.call_count == 2
        assert 1 <= AGENT_RETRY_COUNT <= 5
        assert 1 <= AGENT_RETRY_BACKOFF <= 30

    @patch("genesis.transport.shutil.which", return_value="/usr/bin/claude")
    @patch("genesis.transport.subprocess.run", side_effect=subprocess.TimeoutExpired(cmd="claude", timeout=AGENT_CALL_TIMEOUT))
    def test_call_agent_timeout_names_agent_and_timeout_value(self, _mock_run, _which, tmp_path):
        with pytest.raises(AgentTransportError, match=f"claude'.*{AGENT_CALL_TIMEOUT}s"):
            call_agent("prompt", str(tmp_path), agent="claude", retries=0)

    @patch("genesis.transport.shutil.which", return_value=None)
    def test_missing_agent_is_transport_failure_and_is_not_retried(self, _which, tmp_path):
        with pytest.raises(AgentTransportError, match="not found"):
            call_agent("prompt", str(tmp_path), agent="claude", retries=2)

    @patch("genesis.transport.shutil.which", return_value="/usr/bin/claude")
    @patch("genesis.transport.subprocess.run")
    def test_dispatch_and_failure_classification_distinguish_transport_and_output_states(self, mock_run, _which, tmp_path):
        result_path = tmp_path / "result.json"
        mock_run.return_value = MagicMock(returncode=0, stdout="{}", stderr="")

        dispatch = dispatch_agent("prompt", str(tmp_path), agent="claude")
        assert dispatch.agent == "claude"
        assert classify_failure(dispatch, str(result_path)) == "no_output"

        result_path.write_text("{bad json", encoding="utf-8")
        assert classify_failure(dispatch, str(result_path)) == "contract_failure"

        result_path.write_text("{}", encoding="utf-8")
        assert classify_failure(
            dispatch,
            str(result_path),
            payload_validator=lambda payload: isinstance(payload, dict) and "required_field" in payload,
        ) == "contract_failure"

        result_path.write_text("{}", encoding="utf-8")
        crashed_with_artifact = AgentResult(
            stdout="artifact still written",
            stderr="boom",
            returncode=9,
            agent="claude",
        )
        assert classify_failure(crashed_with_artifact, str(result_path)) == "transport_failure"

        timed_out = AgentResult(stdout="", stderr="", returncode=-1, agent="claude", timed_out=True)
        assert classify_failure(timed_out) == "transport_failure"
