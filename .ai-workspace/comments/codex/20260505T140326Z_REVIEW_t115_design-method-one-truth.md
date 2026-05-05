# REVIEW: T-115 Design Method And One-Truth Check

Author: Codex
Date: 2026-05-05T14:03:26Z
Status: Post-review repair complete

## Scope

This review checks the T-115 implementation against `DESIGN_MODULE_METHOD.md`,
`REQ-R-ABG3-EVENTS`, and `REQ-R-ABG3-PROJECTION`.

Reviewed surfaces:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_admission.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/process_actor.ts`
- `build_tenants/abiogenesis/typescript/code/src/shared/traced_process/index.ts`
- `build_tenants/abiogenesis/typescript/code/src/shared/abg_library/agent_transport.ts`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t115_actor_worker_callout_closure.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/live/test_t113_live_pty_claude_actor_worker.test.mjs`

## Finding 1: Actor invocation lifecycle events still do not carry the full identity envelope

Severity: High for full STDO closure; not blocking for the narrower process
supervision fix.

T-115 correctly enriched `ActorInvocation` and every `actor_process_*` event.
The process boundary now carries graph function, run/work key, worker/backend,
causation, and correlation identity.

However, the emitted actor invocation lifecycle events still do not carry that
full envelope:

- `ActorInvocationStartedEvent` lacks `graphFunctionId`, `runId`, `workKey`,
  `causationEventRefs`, and `correlationId`.
- `ActorResultArtifactObservedEvent` and `ActorInvocationClosedEvent` also do
  not carry worker/backend, graph function, run/work key, causation, or
  correlation identity.
- `actorInvocationRefs` projection keeps only vector, invocation id, attempt,
  dispatch, and result refs.

Evidence:

- `contracts/carriers.ts:122` defines `ActorInvocation` with the full envelope.
- `contracts/carriers.ts:195` defines `ActorInvocationStartedEvent` without the
  full envelope.
- `contracts/projection.ts:238` projects actor invocation refs without the full
  envelope.

Design-method impact:

The process supervision side is now one-truth. The broader actor/process event
family is not fully closed if `REQ-R-ABG3-EVENTS-015` is read literally across
actor invocation start, result observation, and closure. A downstream consumer
can still need a join against surrounding event or basis truth to recover the
full actor invocation context.

Recommendation:

Add a follow-up realization refactor that gives `actor_invocation_started`,
`actor_result_artifact_observed`, and `actor_invocation_closed` the same
identity-envelope treatment as `actor_process_*`, and update
`actorInvocationRefs` / `observedActorArtifactRefs` accordingly.

## Finding 2: Local-spawn missing-command still records a start before process_error

Severity: Medium.

For local-spawn, `runTracedProcess` emits `process_started` immediately after
creating the Node child object, then handles `child.once("error")`. For an
unavailable command, the current ABG event sequence remains:

```text
actor_process_started
actor_process_exited
```

The T-097 missing-command test asserts this behavior.

Evidence:

- `shared/traced_process/index.ts:712` emits `process_started`.
- `shared/traced_process/index.ts:715` handles `process_error`.
- `test_t097_supervised_process_actor.test.mjs:204` expects
  `actor_process_started`, then `actor_process_exited` for ENOENT.

Design-method impact:

This is typed and replay-visible, so it is better than the pre-T115 PTY path.
But the event shape is semantically weaker than the PTY pre-start failure path:
an unavailable local command can look started even when no real subprocess
boundary became usable. That leaves a small "meaning depends on Node spawn
semantics" seam.

Recommendation:

Use the same `actor_process_start_failed` carrier for local-spawn pre-start
errors when `pid` is null and `child.once("error")` fires before any stream or
exit fact. Keep `actor_process_started` only when the process boundary is
actually established enough to be a liveness fact.

## Compliant Areas

### Process-boundary one truth

The process boundary now satisfies the design-method direction:

- `ActorProcessRuntimeScope` centralizes identity fields.
- Every `actor_process_*` event extends that scope.
- `constructActorProcessStartFailedEvent` admits PTY pre-start failure as a
  first-class runtime event.
- `deriveRuntimeAggregateProjection` builds actor process refs from
  `actor_process_started` or `actor_process_start_failed`.

This removes the prior silent failure path where pre-start PTY failure could be
present in trace artifacts but absent from public runtime projection.

### Effect boundary

`runAgentActorWorkerCallout` remains the single framework call-out interface for
agent actor/worker execution. `runAgentTransport` is an adapter over that
interface. The T-109 guard passed and prevents direct framework child-process
execution from returning through test or live harness code.

### Subordinate trace evidence

Trace archives now persist `agentCalloutKind`, `actorRef`, and `workerRef`.
That makes trace evidence useful for forensics without making trace artifacts
the ABG runtime truth. ABG event and projection carriers remain the authority.

### Functional proof

Current proof run:

```text
npm run test:t115
npm run test:t109
npm run test:t113:live
```

All passed.

Latest live proof:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T140214641Z/summary.json
```

The live lane exercises real PTY Claude through:

- traced `claude --version`
- `runAgentTransport` adapter worker
- direct `runAgentActorWorkerCallout(agent_worker)`
- supervised `invokeSupervisedProcessActor(agent_actor)`
- actor process event identity assertions
- replay-derived actor process projection assertions

## Verdict

Functional: yes.

Process-boundary one truth: yes.

Full design-method/STDO closure: not yet. The process supervision defect was
fixed, but actor invocation lifecycle events still do not carry the full
identity envelope, and local-spawn pre-start command failure still looks like a
started process followed by error.

The implementation is materially better and the live path works. It should not
be described as fully compliant until the two findings above are closed.

## Post-Review Repair

Completed 2026-05-06T00:27:42+10:00.

The two findings above are closed.

- Actor invocation lifecycle events now carry the same runtime scope as
  `actor_process_*` events: graph function, run/work key, graph call, frame,
  vector, edge, actor invocation, worker/backend, causation, and correlation.
- `actorInvocationRefs` and `observedActorArtifactRefs` now preserve that same
  scope in the replay projection.
- Local-spawn missing-command ENOENT no longer records
  `actor_process_started`; it records `actor_process_start_failed`, then
  `actor_process_exited`.

Added proof:

```text
npm run build:semantic
npm run lint:semantic
node --test test_env/tests/test_t115_actor_worker_callout_closure.test.mjs
node --test test_env/tests/test_t097_supervised_process_actor.test.mjs
node --test test_env/tests/test_t087_supervised_actor_invocation.test.mjs
node --test test_env/tests/test_t109_agent_callout_guard.test.mjs test_env/tests/test_t109_agent_callout_traced_substrate.test.mjs
node --test test_env/tests/test_t106_traversal_non_progress_continuation.test.mjs
node --test test_env/tests/test_t111_pty_terminal_executor.test.mjs
npm run lint:test-harness
npm run test:t113:live
CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal npm run test:t087:live
```

Latest live proof artifacts:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T142640469Z/summary.json
build_tenants/abiogenesis/typescript/test_env/test_runs/t087_supervised_actor_invocation_live/20260505T142707273Z/payload.json
```

Updated verdict:

Functional: yes.

Process-boundary one truth: yes.

Actor invocation lifecycle one truth: yes.

Full design-method/STDO closure for the reviewed actor/worker call-out
boundary: yes.

## Causal Worker-Observation Live Proof

Completed 2026-05-06T00:46:29+10:00.

The T113 live lane now proves more than "actor and worker both start":

- `worker.claude` returns a dynamic `ABG_T113_WORKER_OBSERVATION_*` token
  through a PTY traced call-out.
- The live test extracts the token from the worker trace result.
- `actor.claude.observed-worker` receives the worker trace result ref and
  observed token, then returns
  `ABG_T113_ACTOR_OBSERVED_<observed-worker-token>`.
- The actor process event stream and replay projection carry the worker trace
  result ref in `causationEventRefs`.

Proof:

```text
npm run build:semantic
npm run lint:test-harness
npm run test:t113:live
```

Latest T113 live artifact:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T144523911Z/summary.json
```

Current interpretation:

The actor observes and responds to a completed worker result through ABG
event/projection boundaries. The reviewed implementation still does not claim
continuous actor monitoring of a running worker stream.
