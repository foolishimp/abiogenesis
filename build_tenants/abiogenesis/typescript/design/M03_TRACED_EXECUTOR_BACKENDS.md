# M03 Traced Executor Backends

## Status

Design note for post-RC7 executor work.

## Current Realization

`runAgentActorWorkerCallout` is the single framework-owned call-out API for
`agent.actor` and `agent.worker` execution.

The current default backend is `local-spawn`:

- fresh local subprocess per call
- stdout/stderr streaming
- Claude `stream-json` parsing when selected
- per-call trace archive
- deterministic test default

This backend is intentionally retained. It is the streaming subprocess solution.

## Target Backend Seam

Executor selection is part of the traced-process request, not a new framework
transport path.

```text
runAgentActorWorkerCallout(request)
  -> TracedProcessExecutor.dispatch(request)
    -> local-spawn
    -> pty-terminal
    -> future sdk-direct / replay / remote executor
```

All executor backends preserve the same result shape and per-call archive
contract:

- `meta.json`
- `command.json`
- `events.ndjson`
- `stdout.raw`
- `stderr.raw`
- `final_output.txt`
- `result.json`

Terminal-backed executors may also publish `terminal.transcript`, but callers
must not require a different public result API.

## PTY Backend Decision

T-111 pins the first literal terminal backend to a Docker-compatible GNU
`screen` profile.

Reason:

- `node-pty` is the canonical real-PTY library, but it introduces native module
  build burden across Docker base images, CPU architectures, and libc variants.
- odd_manager already proved the zero-install terminal backplane shape using
  GNU `screen` plus transcript files.
- The near-term ABG need is executor pluggability and terminal transcript
  fidelity, not curses-grade resize fidelity.
- Containers can install `screen` explicitly. A container missing `screen`
  reports executor unavailability; it does not silently fall back and call that
  PTY closure.

`node-pty` remains a lawful later backend behind the same executor interface.

Live harnesses may select the PTY backend with
`ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal`, but that environment value is
adapter ingress only. Shared transport and M03 actor invocation receive an
explicit typed `executorProfile` field. Runtime code must not read ambient env
to decide executor semantics.

Pipe-only persistent subprocesses are not T-111 closure. They may be useful for
SDK or prompt-cache experiments, but they do not satisfy the operator's literal
terminal/xterm requirement.

## T-111 Scope

T-111 implements a per-call PTY terminal backend.

It does not implement sticky reuse, automatic affinity, or warm-session pooling.
Those belong to T-110.

T-111 may accept a caller-supplied terminal session key for deterministic
archive naming, but the first implementation opens and closes a terminal
session for one call-out.

## Completion And Parsing

The first PTY backend runs the same non-interactive agent command under a
terminal. For Claude this means the existing `claude -p --output-format
stream-json --verbose ...` command is still used; the terminal backend changes
the process environment, not the prompt protocol.

If a future interactive Claude TUI backend is added, it must introduce a
terminal-aware parser for ANSI/TUI output. It must not reuse the
`claude-stream-json` parser unless the stream is proven to be JSONL.

## Failure Signals

The executor layer owns these distinct outcome categories:

- `exited`: the child command returned an exit status.
- `signaled`: the child command ended with a signal.
- `hard_timeout`: the per-call `timeoutMs` budget is exceeded regardless of
  output activity.
- `inactivity_timeout`: an active terminal turn has had no new terminal bytes
  for `inactivityTimeoutMs`.
- `executor_unavailable`: the selected executor cannot be used in the current
  environment.
- `launch_failed`: executor launch failed before the child command was governed.
- `process_error`: the local process API reported an error.
- `lost_terminal`: a terminal session disappeared before the completion
  sentinel was observed.

T-111 emits terminal-session evidence for these categories. T-110 may later
attach replacement policy to them, but it must not redefine them.

## odd_manager Relationship

T-111 shapes the session/archive contract that odd_manager xterm may later
consume. ABG must not depend on odd_manager UI or runtime state for T-111
closure.

The reusable part from odd_manager is the backplane pattern:

- terminal session identity
- transcript file
- attachable terminal stream
- explicit lifecycle commands

The ABG implementation owns its own executor module and archive contract.
