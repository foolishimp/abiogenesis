# Validates: REQ-P-QUAL-005
# Validates: REQ-P-QUAL-006
# Validates: REQ-P-QUAL-012
# Validates: REQ-P-QUAL-023
# Validates: REQ-P-QUAL-024
"""
M04 app-bootstrap integration lane.

This lane exercises the public transport and bootstrap surfaces used by the
canonical python tenant.
"""
from __future__ import annotations

import json
import subprocess
from unittest.mock import MagicMock, patch

import pytest

from genesis.transport import (
    AGENT_RETRY_BACKOFF,
    AGENT_RETRY_COUNT,
    AGENT_CALL_TIMEOUT,
    AGENT_PROBE_EXPECTED_RESPONSE,
    AGENT_PROBE_PROMPT,
    AGENT_PROBE_TIMEOUT,
    AgentResult,
    AgentTransportError,
    agent_ready,
    call_agent,
    classify_failure,
    clear_agent_ready_cache,
    dispatch_agent,
    probe_agent,
)


@pytest.mark.integration
class TestM04AppBootstrapIntegration:
    @patch("genesis.transport.shutil.which", return_value="/usr/bin/claude")
    @patch("genesis.transport.subprocess.run")
    def test_probe_agent_uses_machine_contract_and_requested_timeout(self, mock_run, _which, tmp_path):
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout=AGENT_PROBE_EXPECTED_RESPONSE + "\n",
            stderr="",
        )

        result = probe_agent("claude", work_folder=str(tmp_path))

        assert result.success is True
        call = mock_run.call_args
        args = call.args[0]
        assert args[:2] == ["claude", "-p"]
        assert args[-1] == AGENT_PROBE_PROMPT
        assert call.kwargs["cwd"] == str(tmp_path)
        assert call.kwargs["timeout"] == AGENT_PROBE_TIMEOUT

    @patch("genesis.transport.shutil.which", return_value="/usr/bin/claude")
    @patch("genesis.transport.subprocess.run")
    def test_probe_agent_rejects_non_contract_output(self, mock_run, _which, tmp_path):
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout="Here is a detailed transport analysis",
            stderr="",
        )

        result = probe_agent("claude", work_folder=str(tmp_path))

        assert result.success is False
        assert result.returncode == -1
        assert "probe contract violated" in result.stderr

    @patch("genesis.transport.probe_agent")
    def test_agent_ready_caches_success_only(self, mock_probe, tmp_path):
        clear_agent_ready_cache()
        mock_probe.return_value = AgentResult(
            stdout=AGENT_PROBE_EXPECTED_RESPONSE,
            stderr="",
            returncode=0,
            agent="claude",
        )

        assert agent_ready("claude", work_folder=str(tmp_path)) is True
        assert agent_ready("claude", work_folder=str(tmp_path)) is True
        assert mock_probe.call_count == 1

    @patch("genesis.transport.probe_agent")
    def test_agent_ready_does_not_cache_failures(self, mock_probe, tmp_path):
        clear_agent_ready_cache()
        mock_probe.side_effect = [
            AgentResult(
                stdout="",
                stderr="timeout",
                returncode=-1,
                agent="claude",
                timed_out=True,
            ),
            AgentResult(
                stdout=AGENT_PROBE_EXPECTED_RESPONSE,
                stderr="",
                returncode=0,
                agent="claude",
            ),
        ]

        assert agent_ready("claude", work_folder=str(tmp_path)) is False
        assert agent_ready("claude", work_folder=str(tmp_path)) is True
        assert mock_probe.call_count == 2

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

    @patch("genesis.transport.shutil.which", return_value="/usr/bin/codex")
    @patch("genesis.transport._agent_output_file")
    @patch("genesis.transport.subprocess.run")
    def test_call_agent_uses_codex_exec_contract_and_reads_last_message(
        self,
        mock_run,
        mock_output_file,
        _which,
        tmp_path,
    ):
        output_path = tmp_path / "codex-last-message.txt"
        mock_output_file.return_value = output_path

        def _fake_run(args, **kwargs):
            output_path.write_text("artifact body", encoding="utf-8")
            return MagicMock(returncode=0, stdout="wrapper output", stderr="")

        mock_run.side_effect = _fake_run

        assert call_agent("prompt", str(tmp_path), agent="codex", retries=0) == "artifact body"
        args = mock_run.call_args.args[0]

        assert args[:4] == ["codex", "exec", "--full-auto", "--skip-git-repo-check"]
        assert "-o" in args
        assert args[-1] == "prompt"

    @patch("genesis.transport.shutil.which", return_value="/usr/bin/codex")
    @patch("genesis.transport._agent_output_file")
    @patch("genesis.transport.subprocess.run")
    def test_probe_agent_accepts_codex_last_message_contract(
        self,
        mock_run,
        mock_output_file,
        _which,
        tmp_path,
    ):
        output_path = tmp_path / "codex-probe.txt"
        mock_output_file.return_value = output_path

        def _fake_run(args, **kwargs):
            output_path.write_text(AGENT_PROBE_EXPECTED_RESPONSE, encoding="utf-8")
            return MagicMock(returncode=0, stdout="wrapper output", stderr="")

        mock_run.side_effect = _fake_run

        result = probe_agent("codex", work_folder=str(tmp_path))

        assert result.success is True
        args = mock_run.call_args.args[0]
        assert args[:4] == ["codex", "exec", "--full-auto", "--skip-git-repo-check"]
        assert args[-1] == AGENT_PROBE_PROMPT

    @patch("genesis.transport.shutil.which", return_value="/usr/bin/codex-next")
    @patch("genesis.transport._agent_output_file")
    @patch("genesis.transport.subprocess.run")
    def test_call_agent_uses_local_transport_contract_override_file(
        self,
        mock_run,
        mock_output_file,
        _which,
        tmp_path,
    ):
        output_path = tmp_path / "codex-custom.txt"
        mock_output_file.return_value = output_path
        contract_path = tmp_path / "transport_contract.json"
        contract_path.write_text(
            json.dumps(
                {
                    "codex": {
                        "command": "codex-next",
                        "args": ["exec", "--fast", "-o", "{output_path}", "{prompt}"],
                        "call_timeout": 123,
                    }
                }
            ),
            encoding="utf-8",
        )

        def _fake_run(args, **kwargs):
            output_path.write_text("artifact body", encoding="utf-8")
            assert kwargs["timeout"] == 123
            return MagicMock(returncode=0, stdout="wrapper output", stderr="")

        mock_run.side_effect = _fake_run

        result = call_agent(
            "prompt",
            str(tmp_path),
            agent="codex",
            retries=0,
            config={"transport_contract": str(contract_path)},
        )

        assert result == "artifact body"
        args = mock_run.call_args.args[0]
        assert args == [
            "codex-next",
            "exec",
            "--fast",
            "-o",
            str(output_path),
            "prompt",
        ]

    def test_call_agent_fails_closed_on_malformed_local_transport_contract(self, tmp_path):
        contract_path = tmp_path / "transport_contract.json"
        contract_path.write_text("{bad json", encoding="utf-8")

        with pytest.raises(AgentTransportError, match="transport_contract file"):
            call_agent(
                "prompt",
                str(tmp_path),
                agent="codex",
                retries=0,
                config={"transport_contract": str(contract_path)},
            )

    def test_dispatch_agent_surfaces_local_transport_contract_defect(self, tmp_path):
        result = dispatch_agent(
            "prompt",
            str(tmp_path),
            agent="codex",
            config={"transport_contract": str(tmp_path / "missing_transport_contract.json")},
        )

        assert result.success is False
        assert result.returncode == -1
        assert "transport_contract file" in result.stderr

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
