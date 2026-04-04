# ADR-022: Subprocess Transport with Environment Sanitization

**Series**: abiogenesis / claude_code build
**Status**: Accepted
**Date**: 2026-03-23
**Implements**: REQ-R-ABG2-TRANSPORT, REQ-P-QUAL
**Scope**: `genesis/transport.py`, `gen-install.py`, test harness

---

## Context

### ADR-020 chose MCP to avoid a nesting hang

ADR-020 mandated `@steipete/claude-code-mcp` as the sole F_P transport because `claude -p` hung when invoked from within an active Claude Code session. The root cause was nesting guard env vars (`CLAUDECODE`, `CLAUDE_CODE_SSE_PORT`, `CLAUDE_CODE_ENTRYPOINT`) that cause the child process to detect it's inside an active session and block.

ADR-020's decision was correct given the information available. The nesting hang was real and repeatedly rediscovered.

### MCP introduced its own reliability problems

The MCP Python SDK (v1.17.x) has a pervasive race condition in `stdio_client` cleanup: an `ExceptionGroup` in `TaskGroup` where cleanup closes stdin while the server sends initialization messages. This caused:

- **3/7 live F_P tests** failing with `transport_failure` (ExceptionGroup)
- **1 incident** of 51-minute hang when `asyncio.run()` blocked on `os.waitpid()`
- Required a daemon thread wrapper with SIGKILL fallback to prevent indefinite hangs

Filed across multiple repos: python-sdk#1452, #1564, claude-code#24132, claude-agent-sdk-python#266.

### The nesting hang has a simpler fix

The fix is to strip all `CLAUDE*` env vars from the subprocess environment before launch:

```python
env = os.environ.copy()
for key in list(env):
    if key.startswith("CLAUDE"):
        del env[key]
subprocess.run(["claude", "-p", ...], env=env, ...)
```

Validated 2026-03-23: `claude -p` with env sanitization completes reliably from within an active Claude Code session. 3/3 live F_P tests completed with 0 transport failures, 0 hangs.

### Evidence

| Metric | MCP (ADR-020) | Subprocess + env sanitization |
|--------|---------------|-------------------------------|
| Transport success | 4/7 (57%) | 3/3 (100%) |
| Transport failures | 3/7 ExceptionGroup | 0 |
| Hangs | Yes (51min incident) | 0 |
| Quality failures | N/A (transport blocked) | 3/3 (honest failures) |
| Dependencies | mcp SDK, npx, @steipete/claude-code-mcp | None beyond agent CLI |

### Ecosystem alignment

Research across Claude Agent SDK, Gemini CLI, OpenClaw ACP, Goose, OpenHands, and Coder AgentAPI shows a consistent pattern:

- **Agent transport**: CLI subprocess, ACP, HTTP+SSE, or SDK session API
- **MCP**: Tool plane (extensions the agent can call), not the primary transport

ABG using MCP as the primary F_P dispatch transport was a stronger stance than the ecosystem norm. Subprocess with env sanitization aligns with how the ecosystem actually works.

---

## Decision

### Primary transport: subprocess with environment sanitization

F_P invocations use direct subprocess calls with `CLAUDE*` env vars stripped:

```python
def call_agent(prompt, work_folder, *, agent="claude", timeout=300):
    args = _build_args(agent, prompt)
    env = _sanitized_env(agent)
    result = subprocess.run(args, cwd=work_folder, capture_output=True,
                            text=True, timeout=timeout, env=env)
    return result.stdout

def _sanitized_env(agent):
    env = os.environ.copy()
    if agent == "claude":
        for key in list(env):
            if key.startswith("CLAUDE"):
                del env[key]
    return env
```

### Multi-agent support

The subprocess model naturally supports multiple agents:

| Agent | Command | Notes |
|-------|---------|-------|
| claude | `claude -p --output-format text --permission-mode bypassPermissions <prompt>` | Env sanitized (CLAUDE* stripped), permissions bypassed |
| codex | `codex -q --full-auto <prompt>` | No sanitization needed |
| gemini | `gemini -p <prompt>` | No sanitization needed |

All agents share the same contract: prompt in, artifacts out, exit code. The runtime binding surface selects the agent.

### MCP remains for tool plane only

MCP is no longer used as the agent dispatch transport. It remains available for the tool plane — agents can still use MCP servers for tool access (file operations, search, etc.) as part of their internal execution.

### ADR-020's criticisms — acknowledged, accepted

ADR-020 raised five structural problems with subprocess dispatch:

1. **Cold start per call** — True. Accepted. Each invocation spawns a new process. For F_P work units (seconds to minutes of LLM work), cold start is negligible.

2. **Output buffering is opaque** — True. Accepted. We don't need liveness detection; we have a timeout. If the agent doesn't return within the timeout, it's a transport_failure.

3. **No session continuity** — True. Accepted. Each F_P invocation is independent by design (iterate model). Context is carried in the manifest prompt, not agent memory.

4. **Process management complexity** — Reduced. Env sanitization is a one-liner. `subprocess.run(timeout=)` handles timeouts natively. No daemon threads, no SIGKILL fallback, no asyncio.

5. **Hangs when nested** — Solved. Stripping `CLAUDE*` env vars prevents the nesting guard from triggering.

### Risk: env var names are undocumented

The `CLAUDE*` prefix stripping is defensive but relies on undocumented behavior. If Anthropic changes the nesting guard mechanism:

- **Worst case**: subprocess hangs → `TimeoutExpired` → `AgentTransportError` with `failure_class="transport_failure"`. The failure is classified and retryable, not silent.
- **Detection**: Any live F_P test that hangs will surface the regression immediately.
- **Mitigation path**: Claude Agent SDK streaming sessions (documented, stable API) as the future transport when it matures.

---

## Implementation

### transport.py (engine)

Single implementation in `genesis/transport.py`:

- `has_agent(agent)` — checks if CLI is on PATH
- `call_agent(prompt, work_folder, agent=, timeout=, retries=)` — subprocess dispatch with env sanitization, permission bypass, and retry
- `dispatch_agent(prompt, work_folder, ...)` — non-throwing variant returning `AgentResult`
- `classify_failure(result, result_path)` — ADR-027 failure classification
- `_sanitized_env(agent)` — strips CLAUDE* for claude, passthrough for others
- `_build_args(agent, prompt)` — builds subprocess args with agent-specific flags
- `AgentTransportError` — classified failure with `failure_class`

### Permission bypass (REQ-P-QUAL-023)

Claude Code's `-p` (pipe) mode applies its default permission model. In test sandboxes and production dispatches where the workspace is a tmp directory or untrusted path, interactive permission dialogs block the subprocess — the agent asks for Write permission instead of writing the artifact.

Fix: `--permission-mode bypassPermissions` in the Claude subprocess args.

```python
# _build_args for claude agent
["claude", "-p", "--output-format", "text",
 "--permission-mode", "bypassPermissions", prompt]
```

This is safe because:
- The workspace is an isolated sandbox (tmp_path in tests, scoped workspace in production)
- The agent's only job is to produce an artifact — it has no access to shared infrastructure
- The dispatch contract (manifest prompt) constrains what the agent should write

Other agents (codex, gemini) have their own permission models handled by their respective flags (`--full-auto` for codex).

### Retry with backoff (REQ-P-QUAL-024)

Transient transport failures (timeout, nonzero exit from rate limits or temporary unavailability) are retried. Permanent failures (agent not installed) are not.

```
AGENT_RETRY_COUNT = 2       # up to 2 retries (3 total attempts)
AGENT_RETRY_BACKOFF = 5     # 5s × attempt number
```

The retry loop is in `call_agent()`. `dispatch_agent()` (non-throwing) does not retry — the caller owns retry policy.

### Installer changes needed

- `gen-install.py`: Remove MCP prerequisite checks (npx, @steipete/claude-code-mcp). Check for `claude` CLI on PATH instead.
- `.mcp.json`: No longer needed for F_P dispatch. Can be removed or kept for tool-plane MCP servers.

### Skill layer changes needed

- `gen-start.md`: Update from `mcp__claude-code-runner__claude_code` to subprocess dispatch via `transport.call_agent`.

### Dependencies removed

- `mcp` Python SDK — no longer a core dependency for F_P dispatch
- `@steipete/claude-code-mcp` — no longer needed
- `npx` — no longer needed for transport

---

## References

- ADR-020: MCP as Primary Agent Invocation Transport (superseded)
- ADR-021: F_D Escalates to F_P
- Live F_P qualification results: 3/3 subprocess transport success (2026-03-23)
- MCP SDK issues: python-sdk#1452, #1564, claude-code#24132
- Ecosystem research: Claude Agent SDK, Gemini CLI, OpenClaw ACP, Goose, Coder AgentAPI
