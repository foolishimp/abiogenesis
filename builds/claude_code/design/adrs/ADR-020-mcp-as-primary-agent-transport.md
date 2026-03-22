# ADR-020: MCP as Primary Agent Invocation Transport

**Series**: abiogenesis / claude_code build
**Status**: Accepted
**Date**: 2026-03-22
**Origin**: Ported from ai_sdlc_method ADR-023 (2026-03-05) — decision was lost during project extraction
**Scope**: `scenario_helpers.py` (live F_P qualification), `invoke_live_fp()`, future engine F_P dispatch

---

## Context

### The decision that was lost — twice

ADR-023 in ai_sdlc_method documented that MCP (`@steipete/claude-code-mcp`) is the primary transport for F_P invocations. The decision was validated in E2E testing (Feb 22, commit `2cf2605`) but was lost to context compaction (Feb 27, commit `b97e02e`). ADR-023 was written on Mar 5 to make it durable.

When abiogenesis was extracted as a clean project from ai_sdlc_method, the ADR was not carried forward. The live F_P qualification tests were initially built using `claude -p` subprocess calls, which hang reliably when invoked from within an active Claude Code session. This is the same failure mode ADR-023 was written to prevent.

This ADR ports the decision into the abiogenesis project so it cannot be lost a third time.

### Why subprocess (`claude -p`) is the wrong transport

`claude -p` as a subprocess has four structural problems:

1. **Cold start per call.** Every F_P invocation spawns a new process: load the Claude binary, initialise the runtime, authenticate, load MCP tool registrations, parse the prompt.

2. **Output buffering is opaque.** `claude -p` buffers all output until completion. Stall detection based on output bytes doesn't work. Every attempt to add liveness detection (watchdog threads, byte-reading, stall timeouts) fights this property.

3. **No session continuity.** Each subprocess call has no memory of prior calls. Context must be reconstructed from scratch every time.

4. **Process management complexity leaks into application code.** Watchdog threads, SIGTERM→SIGKILL escalation, environment sanitisation — none of this is methodology logic. It exists solely to compensate for the wrong transport.

5. **Hangs when nested.** When invoked from within an active Claude Code session, `claude -p` reliably hangs due to nesting guard env vars (`CLAUDECODE`, `CLAUDE_CODE_SSE_PORT`). Stripping these is fragile and undocumented.

### Why MCP is the right transport

The MCP invocation model:

```
Test harness / Engine
  │
  │  call_tool("claude_code", {prompt, workFolder})
  │  via Python mcp SDK → stdio → npx @steipete/claude-code-mcp
  ▼
claude-code-mcp server
  │
  │  starts Claude Code instance
  ▼
Claude agent  ← executes F_P work with full tool access
  │
  │  returns result via MCP tool response
  ▼
Test harness / Engine  ← receives result, runs judge
```

Properties:
- **No cold start.** MCP server is persistent; Claude instance is reused.
- **No buffering problem.** MCP is message-passing, not stdout scraping.
- **No process management.** MCP server handles lifecycle.
- **Structured output natively.** MCP tool responses are delivered atomically.
- **No nesting issues.** MCP server manages its own Claude instances independently.

---

## Decision

### Primary transport: MCP tool call via Python mcp SDK

F_P invocations use `@steipete/claude-code-mcp` via the Python `mcp` SDK (v1.17.0+):

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async with stdio_client(StdioServerParameters(
    command="npx", args=["@steipete/claude-code-mcp"]
)) as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        result = await session.call_tool("claude_code", {
            "prompt": manifest["prompt"],
            "workFolder": str(target),
        })
```

This is the "future" noted in `ai_sdlc_method/.genesis/genesis/fp_functor.py` line 153:
> "Future: when a Python MCP client library is available, this function will issue the tool call directly."

That future arrived with `mcp` 1.17.0.

### No subprocess fallback for F_P

Per ADR-024 from ai_sdlc_method: for F_P actor invocations, the fallback is **skip**, not subprocess. `claude -p` is not used for F_P. Ever.

### F_D evaluate: no change

Deterministic checks run as direct subprocesses. These are not Claude calls; subprocess is correct for them.

### Transport detection

```python
def _has_mcp_transport() -> bool:
    """Check if @steipete/claude-code-mcp is available."""
    try:
        subprocess.run(["npx", "@steipete/claude-code-mcp", "--help"],
                       capture_output=True, timeout=15)
        return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False
```

---

## Implementation in abiogenesis

### Single transport module: `genesis/fp_dispatch.py`

The MCP transport is implemented once in `genesis/fp_dispatch.py` — part of the installed engine. Both the engine runtime (`__main__.py`) and the test harness (`scenario_helpers.py`) import from the same module. This guarantees that tests prove the production code path.

- `has_mcp_transport()` — detects if `@steipete/claude-code-mcp` is available
- `call_claude_code_mcp(prompt, work_folder)` — invokes the `claude_code` MCP tool

### Installer: `gen-install.py`

The installer:
- Copies `fp_dispatch.py` into `.genesis/genesis/` alongside the other engine modules
- Creates `.mcp.json` at the project root (declares the `claude-code-runner` MCP server)
- Checks MCP prerequisites (npx, `@steipete/claude-code-mcp`, `mcp` Python SDK) and reports warnings

### Dependencies

- `mcp` Python SDK (pip, v1.17.0+) — declared in `pyproject.toml`
- `@steipete/claude-code-mcp` (npm, v1.10.12+) — declared in `.mcp.json`
- `claude` CLI on PATH

Validated: both UAT and schema live F_P tests pass via MCP transport (2026-03-22, 20/20).

---

## Why this was lost — and how to prevent recurrence

The MCP transport decision was lost twice:

1. **Feb 27 (ai_sdlc_method):** Context compaction dropped the MCP path; `fp_subprocess.py` was formalised as sole transport. Fixed by ADR-023 (Mar 5).

2. **Mar 22 (abiogenesis):** Project extraction did not carry ADR-023 forward. Live tests were built with `claude -p`, which hangs. Fixed by this ADR.

**Prevention rule** (from ADR-023): Any architectural decision that requires infrastructure (MCP server, environment variable, installed package) must have an ADR written the day it is validated. A decision that lives only in a commit message or conversation is not durable across context compaction or project extraction.

---

## References

- ai_sdlc_method ADR-023: `/Users/jim/src/apps/ai_sdlc_method/imp_claude/design/adrs/ADR-023-mcp-as-primary-agent-transport.md`
- ai_sdlc_method ADR-024: Recursive actor model — fold-back file is the transport contract
- E2E runner strategy: `/Users/jim/src/apps/ai_sdlc_method/.ai-workspace/comments/claude/20260305T190000_STRATEGY_E2E-Runner-as-Canonical-Invocation-Model.md`
- Original fp_functor.py: `/Users/jim/src/apps/ai_sdlc_method/imp_claude/code/genesis/fp_functor.py`
- `.mcp.json` — MCP server declaration
- `package.json` — `@steipete/claude-code-mcp` dependency
