# Implements: REQ-R-ABG3-TRANSPORT
# Implements: REQ-P-QUAL
# Implements: REQ-P-QUAL-005
# Implements: REQ-P-QUAL-006
# Implements: REQ-P-QUAL-012
# Implements: REQ-P-QUAL-023
# Implements: REQ-P-QUAL-024
"""
transport — Subprocess transport for F_P actor invocations.

Architecture: F_D → subprocess → agent (ADR-022).
Supported agents: claude, codex, gemini.
ADR-027 failure classification: transport_failure, no_output, contract_failure.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable


AGENT_CALL_TIMEOUT = 300
AGENT_RETRY_COUNT = 2
AGENT_RETRY_BACKOFF = 5  # seconds
AGENT_PROBE_TIMEOUT = 60
AGENT_PROBE_EXPECTED_RESPONSE = "ABG_READY"
AGENT_PROBE_PROMPT = (
    "Return exactly this token on one line: ABG_READY. "
    "Do not inspect the workspace. Do not analyze files. Do not add commentary."
)


class AgentTransportError(Exception):
    """Agent transport failure — process crash, timeout, not installed."""

    def __init__(self, message: str, failure_class: str = "transport_failure"):
        super().__init__(message)
        self.failure_class = failure_class


@dataclass
class AgentResult:
    """Full outcome of an agent subprocess invocation."""
    stdout: str
    stderr: str
    returncode: int
    agent: str
    timed_out: bool = False

    @property
    def success(self) -> bool:
        return self.returncode == 0 and not self.timed_out


McpTransportError = AgentTransportError


def has_agent(agent: str = "claude") -> bool:
    """Check if the named agent CLI is available on PATH."""
    return shutil.which(_agent_command(agent)) is not None


def has_mcp_transport() -> bool:
    return has_agent("claude")


def _format_transport_output(result: subprocess.CompletedProcess[str]) -> str:
    stdout = result.stdout[:500].strip()
    stderr = result.stderr[:500].strip()
    parts: list[str] = []
    if stdout:
        parts.append(f"stdout: {stdout}")
    if stderr:
        parts.append(f"stderr: {stderr}")
    return "\n".join(parts)


def probe_agent(
    agent: str = "claude",
    *,
    work_folder: str | None = None,
    timeout: int = AGENT_PROBE_TIMEOUT,
) -> AgentResult:
    """
    Probe whether an installed agent is authenticated and callable.

    This is used by opt-in live qualification to skip cleanly when the CLI is
    present but not actually usable, for example when the user is logged out.
    The probe prompt must stay trivial so workspace bootloaders do not turn the
    readiness check into a substantive project task.
    """
    cmd = _agent_command(agent)
    if not shutil.which(cmd):
        return AgentResult(
            stdout="",
            stderr=f"Agent '{agent}' not found (command: {cmd}). Install it or check PATH.",
            returncode=-1,
            agent=agent,
        )

    args = _build_args(agent, AGENT_PROBE_PROMPT)
    env = _sanitized_env(agent)

    try:
        result = subprocess.run(
            args,
            cwd=work_folder or os.getcwd(),
            capture_output=True,
            text=True,
            timeout=timeout,
            env=env,
        )
        if result.returncode == 0 and result.stdout.strip() != AGENT_PROBE_EXPECTED_RESPONSE:
            return AgentResult(
                stdout=result.stdout,
                stderr=(
                    "Agent probe contract violated. "
                    f"Expected exact response {AGENT_PROBE_EXPECTED_RESPONSE!r}."
                ),
                returncode=-1,
                agent=agent,
            )
        return AgentResult(
            stdout=result.stdout,
            stderr=result.stderr,
            returncode=result.returncode,
            agent=agent,
        )
    except subprocess.TimeoutExpired:
        return AgentResult(
            stdout="",
            stderr=f"Agent '{agent}' probe timed out after {timeout}s.",
            returncode=-1,
            agent=agent,
            timed_out=True,
        )


_AGENT_READY_CACHE: dict[tuple[str, str], bool] = {}


def clear_agent_ready_cache() -> None:
    _AGENT_READY_CACHE.clear()


def agent_ready(agent: str = "claude", *, work_folder: str | None = None) -> bool:
    """
    Return whether the agent is callable in the requested workspace.

    Successful probes are cached per `(agent, workspace)` to avoid repeated
    subprocess startup during live test discovery. Failures are not cached so a
    transient timeout or a newly repaired login state can recover immediately.
    """
    cache_key = (agent, work_folder or os.getcwd())
    cached = _AGENT_READY_CACHE.get(cache_key)
    if cached is True:
        return True

    ready = probe_agent(agent, work_folder=work_folder).success
    if ready:
        _AGENT_READY_CACHE[cache_key] = True
    else:
        _AGENT_READY_CACHE.pop(cache_key, None)
    return ready


def call_agent(
    prompt: str,
    work_folder: str,
    *,
    agent: str = "claude",
    timeout: int = AGENT_CALL_TIMEOUT,
    retries: int = AGENT_RETRY_COUNT,
) -> str:
    """Invoke an autonomous agent in a workspace via subprocess.

    Environment sanitization: For Claude Code, all CLAUDE* env vars are stripped
    to prevent the nesting guard hang.

    REQ-P-QUAL-024: Transient transport failures (timeout, nonzero exit) are
    retried up to `retries` times with backoff. Permanent failures (agent not
    installed) are not retried.

    Raises:
        AgentTransportError: if the agent times out, crashes, or is not installed.
    """
    cmd = _agent_command(agent)
    if not shutil.which(cmd):
        raise AgentTransportError(
            f"Agent '{agent}' not found (command: {cmd}). Install it or check PATH.",
            failure_class="transport_failure",
        )

    args = _build_args(agent, prompt)
    env = _sanitized_env(agent)

    last_error: AgentTransportError | None = None
    for attempt in range(1 + retries):
        if attempt > 0:
            import time
            time.sleep(AGENT_RETRY_BACKOFF * attempt)

        try:
            result = subprocess.run(
                args,
                cwd=work_folder,
                capture_output=True,
                text=True,
                timeout=timeout,
                env=env,
            )
        except subprocess.TimeoutExpired as exc:
            last_error = AgentTransportError(
                f"Agent '{agent}' timed out after {timeout}s in {work_folder} "
                f"(attempt {attempt + 1}/{1 + retries}).",
                failure_class="transport_failure",
            )
            last_error.__cause__ = exc
            continue

        if result.returncode != 0:
            last_error = AgentTransportError(
                f"Agent '{agent}' exited with code {result.returncode} "
                f"in {work_folder} (attempt {attempt + 1}/{1 + retries})."
                + (
                    "\n" + _format_transport_output(result)
                    if _format_transport_output(result)
                    else ""
                ),
                failure_class="transport_failure",
            )
            continue

        return result.stdout

    raise last_error  # type: ignore[misc]


def dispatch_agent(
    prompt: str,
    work_folder: str,
    *,
    agent: str = "claude",
    timeout: int = AGENT_CALL_TIMEOUT,
) -> AgentResult:
    """Invoke an agent subprocess and return the full result.

    Unlike call_agent(), this never raises — all outcomes are captured in AgentResult.
    The caller can then classify substrate and payload-contract failure explicitly.
    """
    cmd = _agent_command(agent)
    if not shutil.which(cmd):
        return AgentResult(
            stdout="",
            stderr=f"Agent '{agent}' not found (command: {cmd}). Install it or check PATH.",
            returncode=-1,
            agent=agent,
        )

    args = _build_args(agent, prompt)
    env = _sanitized_env(agent)

    try:
        result = subprocess.run(
            args,
            cwd=work_folder,
            capture_output=True,
            text=True,
            timeout=timeout,
            env=env,
        )
        return AgentResult(
            stdout=result.stdout,
            stderr=result.stderr,
            returncode=result.returncode,
            agent=agent,
        )
    except subprocess.TimeoutExpired:
        return AgentResult(
            stdout="",
            stderr=f"Agent '{agent}' timed out after {timeout}s in {work_folder}.",
            returncode=-1,
            agent=agent,
            timed_out=True,
        )


def classify_failure(
    result: AgentResult,
    result_path: str | None = None,
    *,
    payload_validator: Callable[[Any], bool] | None = None,
) -> str | None:
    """Classify an agent invocation failure at the transport boundary.

    Returns None on success, or one of:
      transport_failure, no_output, contract_failure
    """
    if result.timed_out:
        return "transport_failure"

    if result.returncode != 0:
        return "transport_failure"

    if not result_path:
        return None

    try:
        path = Path(result_path)
        if not path.exists():
            return "no_output"
        content = path.read_text(encoding="utf-8").strip()
        if not content:
            return "no_output"
        payload = json.loads(content)
        if payload_validator is not None and not payload_validator(payload):
            return "contract_failure"
    except json.JSONDecodeError:
        return "contract_failure"
    except OSError:
        return "no_output"

    return None

def _agent_command(agent: str) -> str:
    """Map agent identifier to CLI command."""
    commands = {
        "claude": "claude",
        "codex": "codex",
        "gemini": "gemini",
    }
    if agent not in commands:
        raise ValueError(f"Unknown agent: {agent!r}. Supported: {sorted(commands)}")
    return commands[agent]


def _build_args(agent: str, prompt: str) -> list[str]:
    """Build the subprocess argument list for the given agent.

    REQ-P-QUAL-023: agent subprocess must have sufficient permissions to
    execute all tools required by the dispatch contract. For Claude Code,
    --permission-mode bypassPermissions ensures the agent can write artifacts
    without blocking on interactive permission dialogs.
    """
    if agent == "claude":
        return [
            "claude", "-p",
            "--output-format", "text",
            "--permission-mode", "bypassPermissions",
            prompt,
        ]
    elif agent == "codex":
        return ["codex", "-q", "--full-auto", prompt]
    elif agent == "gemini":
        return ["gemini", "-p", prompt]
    else:
        raise ValueError(f"Unknown agent: {agent!r}")


def _sanitized_env(agent: str) -> dict[str, str]:
    """Build a sanitized environment for subprocess launch.

    For Claude Code: strips all CLAUDE* env vars to prevent nesting hang.
    """
    env = os.environ.copy()
    if agent == "claude":
        for key in list(env):
            if key.startswith("CLAUDE"):
                del env[key]
    return env
