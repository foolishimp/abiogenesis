---
id: T-111
title: Literal PTY/xterm agent executor behind the universal traced call-out interface
type: feature
ticket_category: substrate_executor_extension
status: completed
review_status: accepted
backlog_reason: Operator requires a literal terminal-backed executor before sticky-session pooling. T-108 and T-109 established the traced call-out interface, but the current implementation is still per-call local spawn, not a persistent PTY/xterm session.
goal: enable-literal-pty-xterm-agent-execution-over-universal-traced-callout
goal_status: active
build_tenant: typescript
release_scope: post-RC7
change_intent: Add a literal PTY/xterm executor backend for framework-owned `agent.actor` and `agent.worker` call-outs while preserving the existing `runAgentActorWorkerCallout` API and trace archive contract. T-111 opens one terminal session per call-out, observes stdout/stderr/terminal events, and emits the same per-call forensic archive shape as the local-spawn executor; sticky reuse is deferred to T-110.
change_class: design_reframe
re_entry_point: design
affected_boundary: traced process substrate, executor backend selection, agent transport adapter, supervised actor invocation, trace archive contract, terminal session lifecycle, odd_manager sidecar/xterm reuse, test isolation policy
priority: high
triaged_at: 2026-05-03T21:15:00+10:00
created_at: 2026-05-03T21:15:00+10:00
updated_at: 2026-05-03T22:35:00+10:00
governance_scope: STDO Method
dependencies:
  - T-108 traced process substrate (completed)
  - T-109 universal traced agent call-out interface (completed)
candidate_requirement_authority:
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/product/REQ-P-QUAL.md
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_DISTRIBUTED_EXECUTOR_BACKENDS.md
  - build_tenants/abiogenesis/typescript/design/M03_TRACED_EXECUTOR_BACKENDS.md
  - build_tenants/common/traced_process/README.md
evidence_refs:
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t107_mini_dm_traversal_schemes_live/
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t107_mini_dm_traversal_schemes_live/20260503T115910418Z/
proof_commands:
  - npm run build:semantic
  - npm run test:t109
  - npm run test:t111
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t101
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t107:data-mapper-live
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t094:live
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t087:live
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t100:five-rule
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:live:uat
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:live
intake_source: Operator clarified that the current traced-process implementation is not a literal xterm solution. Before sticky-session pooling (T-110), ABG needs a real terminal-backed executor that can run an agent process inside a terminal session and still satisfy the same one-stop call-out API and archive semantics.
target_truth: The universal call-out substrate supports both the current streaming subprocess backend and a literal PTY/xterm executor backend. Callers continue to invoke `runAgentActorWorkerCallout`; executor selection chooses either local-spawn or terminal-backed execution. The PTY executor records terminal turns and exposes per-call slices through the existing trace archive contract. Local-spawn remains the deterministic default for unit tests unless an xterm executor is explicitly selected.
non_closure_conditions:
  - framework-owned agent call-outs bypass `runAgentActorWorkerCallout`
  - PTY/xterm execution has a different public archive shape than local-spawn execution
  - terminal session state leaks across tests or unrelated traversals by default
  - terminal execution lacks explicit turn boundary events or completion sentinels
  - a hung terminal session is reported only as generic timeout without terminal-session evidence
  - robust per-call PTY behavior requires sticky reuse, affinity derivation, or session pooling
  - odd_manager/xterm reuse is implemented as a direct dependency of ABG runtime
  - local-spawn test isolation is removed or made non-default
  - terminal transcript replay cannot reconstruct which stdout belongs to which call-out
---

# T-111: Literal PTY/xterm Agent Executor

## Triage Entry Point

`design_reframe` / `design` is the controlling entry point.

The existing ABG transport, event, and projection requirements remain stable.
T-111 changes the realization structure underneath the already-ratified
framework call-out API: one local-spawn implementation becomes a typed executor
backend model with local-spawn and PTY-terminal profiles. That is a design-level
change, not a product or requirement reprice.

## Why This Ticket Exists

T-108 and T-109 created the correct substrate boundary, but the current executor is still a traced local subprocess. It starts a fresh process per call, streams stdout/stderr, parses Claude stream-json, and writes a forensic archive. That is useful, but it is not a literal xterm or PTY session.

The operator needs the next substrate step before sticky-session pooling: a real terminal-backed executor that can keep an agent CLI open, send prompts as terminal turns, observe incremental terminal output, and still look identical to callers using `runAgentActorWorkerCallout`.

This ticket prevents terminology drift. "Traced process" is current reality. "Literal PTY/xterm executor" is the target of T-111. "Sticky-session agent pool" is T-110 and must build on this executor seam rather than smuggling terminal lifecycle into a pooling ticket.

The positive architectural value is that every later backend plugs into one executor seam and one per-call archive contract. PTY/xterm, SDK-direct, replay, and remote/container executors should not each relitigate archive shape, parser invocation, or ABG event projection.

## Lawful Boundary

Change class: `design_reframe`.

The public framework call-out contract stays centered on:

```text
runAgentActorWorkerCallout(request) -> AgentActorWorkerCalloutResult
```

This ticket widens the internal executor model. It does not add a second framework call-out API.

The executor choices become:

- `local-spawn`: current implementation, fresh subprocess per call, deterministic test default
- `pty-terminal`: literal terminal session per call-out, turn-delimited stdin/stdout, per-call archive slices

T-111 pins the first `pty-terminal` backend to a Docker-compatible GNU `screen` backplane, following odd_manager's proven terminal-session pattern. `node-pty` is a lawful future backend, but not the first T-111 implementation, because native module portability across Docker base images, CPU architectures, and libc variants is a real deployment burden. Containers that use the `pty-terminal` executor must install `screen`; absence of `screen` is explicit executor unavailability, not a silent fallback.

ABG must not depend directly on odd_manager UI state or an xterm.js component. The shared contract is the terminal/session/archive model. odd_manager can later attach a visual terminal to the same session contract without becoming an ABG runtime dependency. T-111 shapes the session/archive contract that odd_manager xterm may later consume; no T-111 closure criterion depends on odd_manager realization.

## Solution Shape

Add typed executor selection under `shared/traced_process/`:

```text
runTracedProcess(request.executorProfile)
  -> local-spawn
  -> pty-terminal
```

The current `runTracedProcess` implementation remains the `local-spawn`
executor profile and the default.

The new `pty-terminal` executor owns:

- PTY creation and teardown
- terminal session identity
- prompt/turn boundary markers
- stdin writes into the kept-open process
- stdout/stderr transcript capture
- idle, hard-timeout, and wedged-session detection
- per-call archive slicing over the shared terminal transcript
- parser invocation over the per-call stdout slice

The public caller still supplies command, args, prompt/stdin, parser, timeout, traceRoot, and callbacks through the existing request family. The caller may opt into terminal execution with an executor profile or terminal session key. If omitted, local-spawn remains the default.

The live harness can select the PTY backend with:

```text
ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal
```

That environment value is live-harness ingress only. Runtime/shared transport
surfaces receive an explicit typed `executorProfile`; `runAgentTransport` and
`invokeSupervisedProcessActor` do not read ambient env to select execution
semantics.

T-111 chooses the single-call interpretation. A caller-provided `terminalSessionKey` may stabilize archive/session identity, but the first PTY backend opens and closes one terminal session per call-out. This is intentional: robust per-call PTY is the required capability. Sticky reuse, automatic affinity derivation, warm slots, and replacement policy are only future optimization and belong to T-110.

The first PTY backend runs the same non-interactive command under a terminal. For Claude this remains `claude -p --output-format stream-json --verbose ...`. If a future interactive Claude TUI backend is added and it does not emit JSONL, that backend must introduce a terminal-aware ANSI/TUI parser and completion rule; it must not claim `claude-stream-json` compatibility without evidence.

## Turn Boundary Contract

A terminal-backed executor must not infer call boundaries from timing alone. For the single-call GNU `screen` backend, call boundaries are carried by trace events plus a terminal completion sentinel in the transcript:

```text
terminal_turn_started(calloutId, sessionId, turnIndex)
<agent stdout/stderr in terminal transcript>
__ABG_PTY_EXIT_<sessionId>:<exitCode>
terminal_turn_completed(calloutId, sessionId, turnIndex)
```

The exact marker syntax can be executor-specific, but the archive must preserve:

- `calloutId`
- `sessionId`
- `turnIndex`
- prompt bytes written
- stdout/stderr bytes observed for that call-out
- parser-derived structured events for that call-out
- timeout or session-health events for that call-out

The terminal transcript may be larger than one call-out. The per-call archive remains the stable forensic API.

## Terminal Failure Signals

T-111 owns the detection vocabulary used by later pooling policy:

- `exited`: the child command returned an exit status.
- `signaled`: the child command ended with a signal.
- `hard_timeout`: the per-call `timeoutMs` is exceeded regardless of output activity.
- `inactivity_timeout`: an active terminal turn has had no new terminal bytes for `inactivityTimeoutMs`.
- `executor_unavailable`: the selected executor cannot run in the current environment.
- `launch_failed`: executor launch failed before the child command was governed.
- `process_error`: the local process API reported an error.
- `lost_terminal`: a terminal session disappeared before the completion sentinel was observed.

T-110 may attach replacement policy to these signals. It must not redefine them.

## Implementation Slices

1. Add typed executor selection to the traced-process substrate while preserving local-spawn as the default profile.
2. Add typed executor selection to `TracedProcessRequest`, for example `executorProfile?: "local-spawn" | "pty-terminal"`.
3. Add a `TerminalSessionRef` / `terminalSessionKey` concept for PTY reuse without introducing sticky pooling semantics yet.
4. Implement PTY-backed execution using a Docker-compatible GNU `screen` backplane. Do not introduce `node-pty` in this slice.
5. Write per-call archive slices with the same `TracedProcessPaths` contract as local-spawn.
6. Feed the per-call stdout slice through the same parser registry used by local-spawn.
7. Emit terminal-specific trace events: `terminal_session_started`, `terminal_turn_started`, `terminal_turn_completed`, `terminal_session_unhealthy`, `terminal_session_closed`.
8. Preserve local-spawn as default for tests and CI.
9. Add deterministic PTY fixtures using a fake terminal command before enabling live Claude PTY runs.
10. Run `test:t107:data-mapper-live` with `executorProfile: "pty-terminal"` and compare its archive against the current local-spawn T-107 archive shape.

## Closure Criteria

T-111 closes only when:

- typed executor selection exists and local-spawn remains the default profile
- PTY/xterm executor exists behind the same `runAgentActorWorkerCallout` public API
- local-spawn remains the default executor for deterministic tests
- PTY executor records a full terminal transcript and a per-call archive slice
- per-call archive paths and result fields match the local-spawn contract
- Claude stream-json parsing works over a PTY per-call stdout slice
- timeout and wedged-terminal conditions produce explicit terminal-session evidence
- deterministic PTY tests cover normal completion, hard timeout, and inactivity timeout
- `test:t107:data-mapper-live` runs successfully through the PTY executor
- `npm run build:semantic` and `npm run test:t109` pass after executor extraction

## Current Proof State

Local T-111 proof currently covers:

- normal `pty-terminal` completion through `runAgentActorWorkerCallout`
- Claude stream-json parser over a terminal transcript slice
- long Claude stream-json lines over a terminal transcript slice
- hard timeout evidence through `timeout_escalated`
- inactivity timeout evidence through `inactivity_timeout_escalated`

Latest local command:

```text
npm run test:t111
```

Result before typed-outcome hardening: 4 passed, 0 failed. Re-run required
after the post-review hardening pass.

Regression command:

```text
npm run test:t109
```

Result before typed-outcome hardening: 4 passed, 0 failed. Post-review
hardening added a fifth deterministic T-109 fixture proving that a generic
non-zero worker with diagnostic output remains `contract_failure` rather than
being retried as a transport pre-init crash. Re-run required after the hardening
pass.

Live PTY command:

```text
CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t107:data-mapper-live
```

Result: 1 passed, 0 failed.

Live archive:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t107_mini_dm_traversal_schemes_live/20260503T115910418Z/
```

The live archive records `executorProfile: "pty-terminal"` for all three
data-mapper worker edges.

Expanded live PTY matrix:

```text
test:t101                  2 passed, 0 failed
test:t107:data-mapper-live 1 passed, 0 failed
test:t094:live             1 passed, 0 failed
test:t087:live             1 passed, 0 failed
test:t100:five-rule        6 passed, 0 failed
test:live:uat              2 passed, 0 failed
test:live                  1 passed, 0 failed
```

Recent transport evidence confirms `executorProfile: "pty-terminal"` and
`status: 0` for all inspected live agent call-outs in T-087, T-094, T-100,
T-101, T-107, M05 UAT, and M05 portfolio archives.

## Non-Closure Statement

T-111 is not closed by wrapping `spawn` in another function or by calling the current traced-process executor "xterm". It closes only when ABG can run a framework-owned agent call-out through a literal terminal/PTY session, delimit turns, archive the terminal transcript, and present the same per-call result shape to existing callers.

## Relationship To T-110

T-110 sticky-session pooling should depend on T-111. T-111 proves the terminal-backed execution surface and per-call archive slicing. T-110 can then add affinity, warm-slot routing, cache-prefix discipline, and session replacement policy over a real interactive executor instead of over the current fresh-process local-spawn implementation.

## Considered Alternatives

`node-pty` is the highest-fidelity PTY implementation, especially for resize and curses-style applications. It is not the first T-111 backend because Docker portability is material: native module builds, Alpine/musl support, multi-arch images, and CI image drift all become substrate concerns.

A long-lived pipe-only subprocess can deliver some prompt-cache value without PTY complexity. It does not satisfy this ticket because the operator asked for a literal terminal/xterm solution before sticky pooling, and because future sidecar attachment needs terminal transcript semantics.
