# REVIEW: Worker/Actor Call-Out Current Behavior

Author: Codex
Date: 2026-05-05T13:35:46Z
Status: Open review
Tracking ticket: `.ai-workspace/tickets/completed/T-115-realize-actor-worker-callout-event-and-projection-closure.md`

## Scope

This review covers the current call-out path from ABG runtime actor dispatch to
the shared traced process substrate and the live Claude PTY proof lane.

Reviewed surfaces:

- `build_tenants/common/traced_process/README.md`
- `build_tenants/abiogenesis/typescript/code/src/shared/traced_process/index.ts`
- `build_tenants/abiogenesis/typescript/code/src/shared/abg_library/agent_transport.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/process_actor.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t097_supervised_process_actor.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/live/test_t087_supervised_actor_invocation_live.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/live/test_t113_live_pty_claude_actor_worker.test.mjs`

Method references:

- repo `AGENTS.md:268`
- `specification_methodology/specification/standards/SPEC_METHOD.md:716`
- `specification_methodology/specification/standards/TICKET_METHOD.md:671`
- `specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md:149`
- `specification_methodology/specification/standards/ODD_METHOD.md:623`
- `specification_methodology/specification/standards/POSTING_GUIDE.md:143`

## Findings

### High: Actor/process runtime events do not carry the full required identity chain

`REQ-R-ABG3-EVENTS-015` requires actor/process events to carry run, graph
function, graph call, frame, vector, actor invocation, worker binding,
causation, and correlation identities. Current `actor_process_*` carriers in
`contracts/carriers.ts:230` through `contracts/carriers.ts:310` carry
`basisId`, `graphCallId`, `frameId`, `vectorIndex`, `edge`, and
`actorInvocationId`, plus process-local fields.

They do not carry worker identity, backend identity, graph function identity,
run identity, work key, causation references, or correlation identity. The
factory constructors in `contracts/event_factories.ts:216` through
`contracts/event_factories.ts:340` preserve the same gap.

Current behavior therefore under-builds ABG's active runtime event law. The
worker/backend identity exists on `actor_invocation_started`
(`contracts/carriers.ts:190`), but process supervision facts are not
self-sufficient replay facts for the process boundary they claim to describe.
That is a traceability defect under STDO, not just a convenience gap.

### High: PTY executor-unavailable and launch-failed paths can disappear from actor process projection

The PTY executor reports typed outcomes for unavailable `screen` capability and
launch failure in `shared/traced_process/index.ts:721` and
`shared/traced_process/index.ts:803`. In those branches it returns a
`TracedProcessResult` without calling `onProcessStarted` or `onProcessError`.

`invokeSupervisedProcessActor` then emits a final `actor_process_exited` event
from the returned traced result in `transport/process_actor.ts:299`, but there
is no preceding `actor_process_started` event for that actor invocation.

The projection only builds `actorProcessRefs` by iterating started events in
`contracts/projection.ts:473`. An exited/error fact without a started fact is
stored internally, but it does not become an actor process row in the public
projection.

This does not satisfy the active projection requirement that process identity,
liveness, timeout, exit status, runtime error, and final observed actor result
be replay-derived from admitted actor/process events
(`REQ-R-ABG3-PROJECTION-007` and `REQ-R-ABG3-PROJECTION-008`). It also weakens
`REQ-R-ABG3-EVENTS-013` and `REQ-R-ABG3-EVENTS-014`, which require replayable
facts for process start, spawn failure, command/path drift, sandbox denial,
timeout, signal, nonzero exit, and closure/failure.

The existing deterministic T097 missing-command case covers the local-spawn
error path, but it does not cover PTY executor-unavailable or PTY launch-failed
projection behavior.

### Medium: The typed actor/worker call-out wrapper does not persist actor/worker identity in the trace archive

`runAgentActorWorkerCallout` has a typed request shape for `agent_actor` and
`agent_worker` in `shared/traced_process/index.ts:107`, but the implementation
at `shared/traced_process/index.ts:1063` delegates directly to
`runTracedProcess`.

`runTracedProcess` writes `meta.json` and `command.json` around
`shared/traced_process/index.ts:463`, but the call-out kind, `actorRef`, and
`workerRef` are not persisted as first-class trace metadata. In the live T113
test, `actor.claude` and `worker.claude` are visible because the test chooses
those labels, not because the trace contract records the actor/worker seam.

The shared traced-process README says the long-lived seam is the traced
call-out contract and that `runAgentActorWorkerCallout` is the framework
interface for `agent.actor` and `agent.worker`
(`build_tenants/common/traced_process/README.md:30`). The current code gives
that seam a TypeScript shape at ingress, but does not preserve the shape in the
durable trace evidence.

### Medium: The Claude worker adapter flattens runtime worker identity to agent key

`runAgentTransport` calls `runAgentActorWorkerCallout` as `agent_worker` in
`shared/abg_library/agent_transport.ts:225`, but passes
`workerRef: request.contract.agentKey`. For the Claude adapter this is the
agent key, such as `claude`, not necessarily the ABG worker binding selected by
the dispatch request.

The ABG dispatch path has richer worker/backend identities before this point.
`engine_runner.ts:400` emits `actor_invocation_started` with worker/backend
identity, and `engine_runner.ts:823` plus `engine_runner.ts:958` close the actor
invocation around the plugin result. The transport trace can therefore lag
behind the runtime event truth and make postmortem worker binding depend on
outside joins or payload convention.

This is lower risk than the event/projection gaps because ABG still owns the
runtime event stream. It is still a provenance weakness in the agent-worker
call-out surface.

### Positive: The PTY substrate now has the right basic operational shape

The current traced process substrate does not silently fall back from
`pty-terminal` to `local-spawn`. It probes `screen`, reports typed
`executor_unavailable` outcomes, writes terminal-session trace events, archives
terminal transcript output, parses Claude stream JSON at the adapter edge, and
keeps executor selection explicit through `executorProfile`.

`invokeSupervisedProcessActor` correctly bridges successful traced process
callbacks into ABG `actor_process_started`, `actor_process_stream_observed`,
`actor_process_timeout`, `actor_process_signal_sent`, and
`actor_process_exited` events. The local-spawn success, timeout, missing-command,
and signal lanes in T097 exercise this bridge. The live T113 lane exercises a
real xterm-compatible `screen` PTY, real `claude`, direct `worker.claude`, and
supervised `actor.claude`.

The working live lane means the earlier PTY failure was not proof that the
conceptual actor/worker seam is wrong. It was proof that the previous PTY
capability probe was too short-lived for local macOS `screen`.

## Current Actual Behavior

### Shared traced process call-out

`runTracedProcess` is the process execution substrate. It accepts an explicit
`executorProfile`, defaults to `local-spawn`, writes trace archive files, and
streams raw stdout/stderr or terminal transcript chunks through callbacks.

For `local-spawn`, it starts a child process, emits trace events, calls
`onProcessStarted` once the child object exists, forwards stdout/stderr chunks,
handles timeout and signal escalation, and resolves with a structured
`TracedProcessResult`.

For `pty-terminal`, it uses GNU `screen` as the terminal/session backend. It
creates a detached screen session, records `screenlog.0`, polls transcript
growth, watches for a sentinel JSON line, applies inactivity and hard timeouts,
and resolves with a structured terminal outcome. If the capability probe fails,
it returns a typed executor-unavailable result instead of falling back.

`runAgentActorWorkerCallout` is currently a typed alias over this substrate. It
does not add actor/worker behavior beyond request typing.

### Claude worker adapter

`runAgentTransport` adapts an ABG agent transport contract into a traced process
call-out. For Claude it builds:

- executable: `claude`
- args: `-p --output-format stream-json --verbose --permission-mode bypassPermissions <prompt>`
- parser: `claude-stream-json`
- call-out kind: `agent_worker`

The result is written as a transport artifact and returned to the plugin/actor
dispatch path. This adapter owns Claude command-line mechanics. ABG still owns
runtime admission and semantic closure.

### Supervised process actor

`invokeSupervisedProcessActor` wraps `runAgentActorWorkerCallout` for the ABG
actor boundary. It builds an `agent_actor` request with an actor invocation id
and worker id, then maps traced process callbacks into ABG runtime events.

On normal local-spawn or PTY operation, the actor/process lifecycle is visible
as:

- `actor_process_started`
- zero or more `actor_process_stream_observed`
- zero or more `actor_process_heartbeat_observed`
- optional `actor_process_timeout`
- optional `actor_process_signal_sent`
- `actor_process_exited`

Separately, the engine runner emits actor invocation lifecycle events around
F_P plugin dispatch:

- `actor_invocation_started`
- `actor_result_artifact_observed`
- `actor_invocation_closed`

This means ABG currently has two related layers:

- actor invocation lifecycle in the runner
- supervised process facts in the process actor wrapper

Those layers are connected by `actorInvocationId`, but not by a complete
identity envelope on every process fact.

### Projection

The projection records actor invocation starts, actor artifacts, actor closures,
process starts, streams, heartbeats, timeouts, signals, and exits.

However, the public `actorProcessRefs` projection is started-event centric.
Process failures that return only an exited/error fact without a started fact
can be left out of `actorProcessRefs`. That is the main current projection
failure mode for PTY executor-unavailable and launch-failed paths.

### Tests

Current tests cover:

- deterministic supervised process actor success, timeout, missing command, and
  signal behavior in T097
- live installed Claude actor invocation through the F_P dispatch path in T087
- live PTY Claude worker and actor call-outs in T113

Current tests do not yet prove:

- full required identity envelope on every `actor_process_*` event
- PTY executor-unavailable actor projection
- PTY launch-failed actor projection
- durable trace metadata for `agentCalloutKind`, `actorRef`, and `workerRef`
- workerRef preservation from ABG worker binding through Claude transport trace

## STDO Assessment

The current realization is partially compliant, but not closure-complete.

SPEC_METHOD: The active requirements already define the process-boundary event
and projection obligations. The code does not yet satisfy all of those written
requirements, especially identity and pre-start failure replay. This is a
realization defect, not a requirement ambiguity.

TICKET_METHOD: The live T113 proof is useful positive evidence, but positive
proof does not close the method obligation by itself. The next ticket or T113
continuation should add negative/structural proof for unavailable executor,
launch failure, no silent fallback, identity envelope, and projection rows.

DESIGN_MODULE_METHOD: The substrate mostly respects the design boundary:
executor choice is explicit, effects are at the process edge, and terminal
behavior is isolated behind `traced_process`. The gap is that the boundary
carrier is not fully consolidated. Actor/worker identity exists at ingress but
is not enforced through trace evidence, runtime event facts, and projection.

ODD_METHOD: ABG is correctly treated as the owner of actor invocation, process
supervision, runtime events, retry/convergence, and projection. The traced
process substrate is subordinate transport evidence. The implementation drifts
where subordinate transport outcomes can fail to become replay-visible ABG
process facts.

POSTING_GUIDE: This document is commentary. It is not ratified specification or
design. It records current behavior, review findings, and proposed repair
direction.

## Recommendation

Use `realization_refactor` as the lawful re-entry point. The governing
requirements already say what the runtime must prove.

Recommended next code changes:

1. Enrich `actor_process_*` carriers and factories with the required identity
   chain: run/work key as applicable, graph function id, worker id, backend id,
   causation refs, and correlation id.
2. Add a replay-visible pre-start failure event or started-equivalent failure
   fact for PTY executor-unavailable and launch-failed outcomes.
3. Update projection so actor process refs can be created from failure/exit
   facts, not only from started facts.
4. Persist `agentCalloutKind`, `actorRef`, and `workerRef` in traced process
   metadata and result artifacts.
5. Preserve ABG worker binding through the Claude transport trace, instead of
   reducing the trace worker reference to the adapter agent key.
6. Add focused tests for the above, including a PTY unavailable/launch-failed
   actor projection lane that does not depend on the real Claude binary.

The live PTY Claude lane should remain as external UAT proof. It should not be
the only proof for method compliance.
