# Traced Process Substrate

`traced_process` is the shared process-supervision substrate for worker shell-out
execution.

It is intentionally not ABG runtime law and not odd_manager UI state.

It owns:

- process launch for worker shell commands
- raw stdout/stderr capture
- structured event observation
- timeout and process-exit metadata
- final-output normalization
- durable trace archives

`runAgentActorWorkerCallout` is the framework interface for call-outs whose
purpose is invoking an `agent.actor` or `agent.worker`. Agent transport is only
one adapter over that interface. ABG consumes traced process output as transport
evidence. ABG still owns traversal, retry, convergence, projection, evidence
admission, and semantic closure.

odd_manager may later adapt the same trace contract for xterm/session UI. The
UI must not become a dependency of ABG live tests.

The long-lived seam is the traced call-out contract, not local `spawn`. Future
executors are explicitly in scope when they preserve the same request/result,
event, and archive semantics:

- local subprocess execution (`executorProfile: "local-spawn"`)
- literal terminal execution (`executorProfile: "pty-terminal"`)
- legacy interactive shell or expect-style sessions
- direct SDK-backed agent execution
- recorded replay execution
- container, SSH, Kubernetes, Lambda, or other distributed execution
- remote event-stream backends that stream trace events back to the framework

Those executors should be plugins behind the same `runAgentActorWorkerCallout`
contract. ABG callers should not know whether an agent ran in-process, in a
local shell, in a container, or on a remote event stream.

The default executor profile is `local-spawn`. Live harnesses can read
`ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal` as operator ingress, but the shared
runtime call-out interface receives executor choice through the explicit typed
`executorProfile` request field. Ambient environment must not decide runtime
executor semantics inside `runAgentTransport` or M03 actor invocation.

The first terminal backend is Docker-compatible GNU `screen`, not `node-pty`.
`node-pty` remains a lawful later backend, but native module portability is not
part of the first PTY slice. A container that selects `pty-terminal` must provide
`screen`; absence of `screen` is executor unavailability, not an implicit
fallback to `local-spawn`.

Path fields in `TracedProcessPaths` are strings and should be treated as
resource references, not assumed to be permanently local filesystem paths. The
current implementation writes local paths; distributed implementations may
eventually return URI-like refs such as object-store, websocket, job, or control
plane references.

Stream callbacks are best-effort observations. Per-stream FIFO ordering should
be preserved, but callers must not depend on precise chunk timing or cross-stream
interleaving because distributed executors may batch or buffer output.

Initial archive shape:

```text
meta.json
command.json
events.ndjson
stdout.raw
stderr.raw
final_output.txt
result.json
terminal.transcript   # terminal executor only
```

Initial parser support:

- `generic-text`
- `claude-stream-json`

For Claude `stream-json`, `result.result` is the canonical final output. Any
assistant text collected from structured events is fallback only; consumers
should not concatenate partial deltas with the final result.

The Claude parser is an I/O-free accumulator. Executors feed stdout slices into
the parser and then translate parser observations into trace events; parser
logic must not write archives or read runtime environment.

Initial trace event vocabulary:

- `process_starting`
- `process_started`
- `stdout_chunk`
- `stderr_chunk`
- `structured_event_observed`
- `api_retry_observed`
- `tool_call_observed`
- `structured_event_parse_failed`
- `hard_timeout`
- `timeout_escalated`
- `idle`
- `inactivity_timeout_escalated`
- `process_error`
- `process_exited`
- `terminal_session_starting`
- `terminal_session_started`
- `terminal_turn_started`
- `terminal_input_written`
- `terminal_exit_sentinel_observed`
- `terminal_turn_completed`
- `terminal_session_closed`
- `terminal_session_unhealthy`

`TracedProcessResult.outcome` is the typed total outcome category. Legacy fields
such as `status`, `signal`, `timedOut`, and `error` remain as compatibility
projections over that category. Current outcome kinds are `exited`, `signaled`,
`hard_timeout`, `inactivity_timeout`, `executor_unavailable`, `launch_failed`,
`process_error`, and `lost_terminal`.

Prompt input currently travels through argv because the first ABG consumer uses
`claude -p <prompt>`. That is acceptable for the current mini data-mapper prompts
but should move to stdin or a prompt-file mode before embedding large schemas,
transcripts, or contexts near platform argv limits.
