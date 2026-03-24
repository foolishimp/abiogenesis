# Implements: REQ-F-CORE-001
# Implements: REQ-F-RUN-002
# Implements: REQ-F-LEAF-002
"""
fp_dispatch — Subprocess transport for F_P actor invocations.

Architecture: F_D → subprocess → agent (ADR-020 superseded)
Transport: Direct subprocess invocation with environment sanitization.

The agent receives a workspace and a manifest prompt. It has full shell access,
file discovery, and tool use. The framework checks artifacts at expected paths
after the agent exits. The framework does not constrain agent internals.

Supported agents:
  - claude: Claude Code CLI (`claude -p`) — env sanitized to prevent nesting hang
  - codex: OpenAI Codex CLI (`codex -q --full-auto`)
  - gemini: Google Gemini CLI (`gemini -p`)

The agent is selected by the Worker declaration in the Package spec.
All agents share the same contract: prompt in, artifacts out, exit code.

History: ADR-020 mandated MCP as the sole transport because `claude -p` hung
when nested inside an active Claude Code session (nesting guard env vars:
CLAUDECODE, CLAUDE_CODE_SSE_PORT, CLAUDE_CODE_ENTRYPOINT). The fix is to
strip CLAUDE* env vars before subprocess launch. Validated 2026-03-23.
MCP had a pervasive ExceptionGroup race condition (SDK 1.17.x) causing 3/7
live tests to fail — subprocess with env sanitization eliminates that class
of failures entirely.

ADR-027 failure classification (REQ-F-RUN-002):
  dispatch_agent() → AgentResult → classify_failure() → failure_class
  transport_failure: timeout, crash, not installed
  no_output:         agent ran, produced no/empty result file
  bad_output:        result file exists but structurally invalid JSON
  certification_failure is NOT classified here — requires post-assessment F_D check.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path


# Wall-clock timeout for a single agent invocation (seconds).
# Agents typically complete within 2-3 minutes per artifact.
# 5 minutes is generous but prevents indefinite hangs.
AGENT_CALL_TIMEOUT = 300


class AgentTransportError(Exception):
    """Agent transport failure — process crash, timeout, not installed.

    Distinct from agent quality failures. Transport errors are retryable;
    quality failures need different prompts or escalation.
    """

    def __init__(self, message: str, failure_class: str = "transport_failure"):
        super().__init__(message)
        self.failure_class = failure_class


# ── AgentResult — ADR-027 run outcome ────────────────────────────────────────

@dataclass
class AgentResult:
    """Full outcome of an agent subprocess invocation.

    ADR-027 REQ-F-RUN-002: captures all information needed for failure classification.
    dispatch_agent() produces this; classify_failure() consumes it.
    """
    stdout: str
    stderr: str
    returncode: int
    agent: str
    timed_out: bool = False

    @property
    def success(self) -> bool:
        """True when the subprocess exited 0 without timeout."""
        return self.returncode == 0 and not self.timed_out


# Legacy alias — callers may reference the old name
McpTransportError = AgentTransportError


def has_agent(agent: str = "claude") -> bool:
    """Check if the named agent CLI is available on PATH."""
    return shutil.which(_agent_command(agent)) is not None


# Legacy alias
def has_mcp_transport() -> bool:
    return has_agent("claude")


def call_agent(
    prompt: str,
    work_folder: str,
    *,
    agent: str = "claude",
    timeout: int = AGENT_CALL_TIMEOUT,
) -> str:
    """Invoke an autonomous agent in a workspace via subprocess.

    The agent receives the prompt and full workspace access. It can read files,
    run commands, write artifacts — whatever it needs. The framework only checks
    the artifacts afterward.

    Environment sanitization: For Claude Code, all CLAUDE* env vars are stripped
    to prevent the nesting guard hang (CLAUDECODE, CLAUDE_CODE_SSE_PORT, etc.).
    Without this, `claude -p` detects it's inside an active session and hangs.

    Args:
        prompt: The manifest prompt (work order).
        work_folder: Workspace directory the agent operates in.
        agent: Agent identifier ("claude", "codex", "gemini").
        timeout: Wall-clock timeout in seconds.

    Returns:
        The agent's stdout (conversational response, not the artifact).

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
        raise AgentTransportError(
            f"Agent '{agent}' timed out after {timeout}s in {work_folder}.",
            failure_class="transport_failure",
        ) from exc

    if result.returncode != 0:
        # Agent exited with error — could be a crash or a legitimate failure.
        # Return what we have; let the caller inspect artifacts.
        pass

    return result.stdout


# ── dispatch_agent — ADR-027 non-throwing dispatch ───────────────────────────

def dispatch_agent(
    prompt: str,
    work_folder: str,
    *,
    agent: str = "claude",
    timeout: int = AGENT_CALL_TIMEOUT,
) -> AgentResult:
    """Invoke an agent subprocess and return the full result.

    Unlike call_agent(), this never raises — all outcomes (including timeout
    and not-installed) are captured in the returned AgentResult. The caller
    uses classify_failure() to determine the failure taxonomy.

    ADR-027 REQ-F-RUN-002: this is the dispatch primitive for run governance.
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
) -> str | None:
    """Classify an agent invocation failure per ADR-027 REQ-F-RUN-002.

    Returns None on success, or one of:
      transport_failure  — timeout, crash, agent not installed
      no_output          — agent ran but result_path absent or empty
      bad_output         — result file exists but not valid JSON

    certification_failure is NOT classified here — it requires post-assessment
    F_D evaluation, which happens in the engine layer (commands.py).
    """
    # Timeout or not-installed — always transport_failure
    if result.timed_out:
        return "transport_failure"

    # Non-zero exit with no meaningful stdout — crash
    if result.returncode != 0 and not result.stdout.strip():
        return "transport_failure"

    # If no result_path to check, classify on exit code alone
    if not result_path:
        return "transport_failure" if result.returncode != 0 else None

    # Check result file — agent may have exited 0 but produced nothing
    try:
        path = Path(result_path)
        if not path.exists():
            return "no_output"
        content = path.read_text(encoding="utf-8").strip()
        if not content:
            return "no_output"
        json.loads(content)  # Validate JSON structure
    except json.JSONDecodeError:
        return "bad_output"
    except OSError:
        return "no_output"

    # Non-zero exit but valid result file — agent reported error but wrote output.
    # Let the engine decide via F_D (may become certification_failure).
    return None


# ── dispatch_leaf — ADR-027 REQ-F-LEAF-002 sub-dispatch ─────────────────────

def dispatch_leaf(
    task: "LeafTask",
    input_data: dict,
    parent_run_id: str,
    work_folder: str,
    *,
    agent: str = "claude",
) -> tuple[dict | None, str | None]:
    """Synchronous leaf task sub-dispatch within iterate().

    ADR-027 REQ-F-LEAF-002: Bounded, schema-driven sub-work.
    Dispatches via dispatch_agent() with task-specific timeout.
    Validates input before dispatch and output after.

    Does NOT emit events — returns data for the caller to emit.
    Consistent with "F_P does not call the event logger."

    Returns:
        (output_dict, None) on success.
        (None, failure_class) on failure.
    """
    from .schedule import LeafTask, validate_leaf_schema  # noqa: F811

    sub_run_id = f"{parent_run_id}/leaf/{task.name}"

    # Validate input against schema before dispatch
    valid, err = validate_leaf_schema(input_data, task.input_schema)
    if not valid:
        return None, "bad_output"  # bad input = don't dispatch

    # Result path — agent must write output here
    result_dir = Path(work_folder) / ".ai-workspace" / "leaf_results"
    result_dir.mkdir(parents=True, exist_ok=True)
    result_path = str(result_dir / f"{task.name}.json")

    # Construct focused prompt from schema
    tools_clause = "You MAY use tools." if task.tools_allowed else "Do NOT use any tools."
    prompt = (
        f"LEAF TASK: {task.name}\n"
        f"Sub-run: {sub_run_id}\n\n"
        f"INPUT:\n{json.dumps(input_data, indent=2)}\n\n"
        f"OUTPUT SCHEMA:\n{json.dumps(task.output_schema, indent=2)}\n\n"
        f"RESULT FILE: {result_path}\n"
        f"Write your output as a JSON object to the file above.\n\n"
        f"Instructions: {tools_clause}\n"
        f"The JSON must match the output schema exactly."
    )

    # Dispatch with task-specific timeout
    timeout_s = max(1, task.timeout_ms // 1000)
    result = dispatch_agent(prompt, work_folder, agent=agent, timeout=timeout_s)

    # Classify transport/output failure
    failure = classify_failure(result, result_path=result_path)
    if failure is not None:
        return None, failure

    # Parse and validate output
    try:
        output = json.loads(Path(result_path).read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None, "bad_output"

    valid, err = validate_leaf_schema(output, task.output_schema)
    if not valid:
        return None, "bad_output"

    return output, None


# Legacy alias — drop-in replacement for call_claude_code_mcp
def call_claude_code_mcp(
    prompt: str,
    work_folder: str,
    *,
    timeout: int = AGENT_CALL_TIMEOUT,
) -> str:
    return call_agent(prompt, work_folder, agent="claude", timeout=timeout)


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
    """Build the subprocess argument list for the given agent."""
    if agent == "claude":
        return ["claude", "-p", "--output-format", "text", prompt]
    elif agent == "codex":
        return ["codex", "-q", "--full-auto", prompt]
    elif agent == "gemini":
        return ["gemini", "-p", prompt]
    else:
        raise ValueError(f"Unknown agent: {agent!r}")


def _sanitized_env(agent: str) -> dict[str, str]:
    """Build a sanitized environment for subprocess launch.

    For Claude Code: strips all CLAUDE* env vars to prevent the nesting guard
    hang. When `claude -p` detects CLAUDECODE=1 or CLAUDE_CODE_SSE_PORT, it
    thinks it's inside an active session and hangs indefinitely.

    For other agents: passes the environment through unchanged.
    """
    env = os.environ.copy()
    if agent == "claude":
        for key in list(env):
            if key.startswith("CLAUDE"):
                del env[key]
    return env
