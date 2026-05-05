---
id: T-115
title: Realize actor/worker call-out event and projection closure
type: bug
ticket_category: runtime_projection_defect
status: completed
goal: close-worker-actor-callout-stdo-gaps
change_class: realization_refactor
re_entry_point: realization
created_at: 2026-05-05T23:40:29+10:00
updated_at: 2026-05-06T00:27:42+10:00
completed_at: 2026-05-05T23:56:07+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
priority: high
build_tenant: typescript
affected_boundary:
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/process_actor.ts
  - build_tenants/abiogenesis/typescript/code/src/shared/traced_process/index.ts
  - build_tenants/abiogenesis/typescript/code/src/shared/abg_library/agent_transport.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t097_supervised_process_actor.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/live/test_t113_live_pty_claude_actor_worker.test.mjs
governing_requirements:
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
method_authority:
  - /Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md
review_source:
  - .ai-workspace/comments/codex/20260505T133546Z_REVIEW_worker-actor-callout-current-behavior.md
related_tickets:
  - T-109
  - T-111
  - T-113
proof_commands:
  - npm run build:semantic
  - npm run lint:semantic
  - npm run test:t097
  - npm run test:t087
  - npm run test:t106
  - npm run test:t109
  - npm run test:t111
  - npm run test:t115
  - npm run lint:test-harness
  - npm run test:t113:live
---

# T-115 Realize actor/worker call-out event and projection closure

## Problem

The PTY Claude actor/worker lane now runs live, but the worker/actor call-out
surface is not closed against the active ABG runtime event and projection
requirements.

The review in `.ai-workspace/comments/codex/20260505T133546Z_REVIEW_worker-actor-callout-current-behavior.md`
found four concrete defects:

- `actor_process_*` events do not carry the full required identity chain.
- PTY executor-unavailable and launch-failed actor paths can disappear from the
  public actor process projection.
- `runAgentActorWorkerCallout` accepts typed actor/worker refs but does not
  persist them in durable trace metadata.
- The Claude worker adapter flattens runtime worker identity to the adapter
  agent key in the traced worker call-out.

The live PTY proof is valid UAT. It does not close these method gaps.

## Lawful re-entry

`realization_refactor`.

The governing requirements already require replay-visible process-boundary
facts, actor/process supervision facts, worker binding identity, and projection
from admitted runtime events. This ticket repairs the realization against
existing authority. It does not reprice the product or requirements.

## Required behavior

### Actor/process identity closure

Every `actor_process_*` runtime event must carry enough identity to be a
self-sufficient replay fact for the actor/process boundary.

At minimum, process supervision facts must preserve:

- graph call identity
- graph function identity when available at the event site
- frame identity
- vector index
- edge identity
- actor invocation identity
- worker identity
- backend identity
- run or work key identity where available in the M03 event envelope
- causation and correlation identity sufficient to connect the process fact to
  the actor invocation and dispatch attempt

If one of these identities is not available at a current event site, the repair
must either carry it into that site through a typed carrier or document why the
requirement authority needs repricing before implementation continues.

### PTY pre-start failure projection

When `executorProfile: "pty-terminal"` cannot start because the executor is
unavailable, `screen` is missing, shell launch fails, session launch fails, or
the terminal backend reports an equivalent pre-start failure:

- ABG must admit a typed runtime fact for the failure.
- The projection must expose the actor/process reference and failure outcome.
- The projection must not require a successful `actor_process_started` event
  before it can expose the failed process boundary.
- The failure must remain distinguishable from a normal process exit, timeout,
  and signal escalation.

### Trace archive actor/worker metadata

`runAgentActorWorkerCallout` must preserve the actor/worker seam in the durable
traced process evidence.

Trace metadata and result artifacts must include:

- `agentCalloutKind`
- `actorRef` when present
- `workerRef` when present

These values must be contract fields, not label conventions.

### Worker binding preservation

The Claude worker adapter must preserve ABG worker binding identity through the
call-out trace. The trace may still record the adapter agent key, but it must
not replace the selected worker binding with only `claude`.

## Non-closure conditions

This ticket is not closed if:

- `actor_process_*` events still require joining against
  `actor_invocation_started` to recover worker/backend identity.
- PTY executor-unavailable or launch-failed actor runs emit no projection row.
- `actorProcessRefs` are still built only from started events.
- trace archives still rely on labels such as `actor.claude` or
  `worker.claude` as the only durable actor/worker distinction.
- `runAgentTransport` still records only the adapter agent key where the ABG
  worker binding should be preserved.
- the live T113 lane passes but deterministic negative proof for pre-start
  failure and projection behavior is missing.

## Acceptance tests

Add or update deterministic tests so they prove:

- every admitted `actor_process_*` event carries the required identity fields
  available in the actor invocation context;
- PTY executor-unavailable actor execution produces a replay-visible failure
  event and public projection row;
- PTY launch-failed actor execution produces a replay-visible failure event and
  public projection row;
- `actorProcessRefs` can be derived from failed pre-start process facts, not
  only from `actor_process_started`;
- trace metadata for a direct `agent_worker` call-out includes
  `agentCalloutKind` and `workerRef`;
- trace metadata for an `agent_actor` call-out includes `agentCalloutKind`,
  `actorRef`, and `workerRef`;
- the Claude transport adapter preserves the ABG worker binding in traced
  worker evidence.

The live PTY Claude lane remains required as UAT:

```bash
npm run test:t113:live
```

It must prove real `claude` execution through both:

- direct `worker.claude` via `runAgentActorWorkerCallout(agent_worker)`
- supervised `actor.claude` via `invokeSupervisedProcessActor(agent_actor)`

## Expected proof commands

Run from `build_tenants/abiogenesis/typescript`:

```bash
npm run build:semantic
npm run test:t097
npm run lint:test-harness
npm run test:t113:live
```

If the repair adds a new focused test script, add it to this ticket and to
`package.json`.

## Closure note

Completed 2026-05-05T23:56:07+10:00.

Lawful re-entry remained `realization_refactor`. No requirement or design
reprice was needed.

Files changed for this ticket:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_admission.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/retry_frontier.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/process_actor.ts`
- `build_tenants/abiogenesis/typescript/code/src/shared/abg_library/agent_transport.ts`
- `build_tenants/abiogenesis/typescript/code/src/shared/traced_process/index.ts`
- `build_tenants/abiogenesis/typescript/package.json`
- `build_tenants/abiogenesis/typescript/test_env/live/test_t087_supervised_actor_invocation_live.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/live/test_t113_live_pty_claude_actor_worker.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t097_supervised_process_actor.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t106_traversal_non_progress_continuation.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t115_actor_worker_callout_closure.test.mjs`

Event/projection contract changes:

- `ActorInvocation` now carries graph function, run/work key, causation, and
  correlation identity for downstream actor/process facts.
- Every `actor_process_*` event now carries graph function, run/work key,
  worker/backend, causation, and correlation identity.
- Added `actor_process_start_failed` as an admitted runtime event for PTY
  pre-start failures.
- `actorProcessRefs` now derive rows from either `actor_process_started` or
  `actor_process_start_failed`; started-event success is no longer required to
  expose a failed actor process boundary.
- `runAgentActorWorkerCallout` persists `agentCalloutKind`, `actorRef`, and
  `workerRef` into trace metadata and result artifacts.
- `runAgentTransport` accepts and preserves runtime `workerRef` instead of
  reducing traced worker evidence to the adapter agent key.

Deterministic proof:

```text
npm run build:semantic
npm run lint:semantic
npm run test:t115
npm run test:t097
npm run test:t087
npm run test:t106
npm run test:t109
npm run test:t111
npm run lint:test-harness
```

All commands passed locally.

Live proof:

```text
npm run test:t113:live
```

Latest local T113 run passed:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T135534368Z/summary.json
```

That live lane now proves real PTY execution for:

- `claude --version` through the traced PTY call-out, so availability checking
  does not bypass the call-out substrate;
- `adapter.worker.claude` through `runAgentTransport`;
- direct `worker.claude` through `runAgentActorWorkerCallout(agent_worker)`;
- supervised `actor.claude` through
  `invokeSupervisedProcessActor(agent_actor)`;
- actor process events and projection rows carrying the enriched identity
  envelope.

## Post-review compliance closure

Completed 2026-05-06T00:27:42+10:00.

Review source:

```text
.ai-workspace/comments/codex/20260505T140326Z_REVIEW_t115_design-method-one-truth.md
```

The post-review repair closes the two remaining design-method gaps:

- `actor_invocation_started`, `actor_result_artifact_observed`, and
  `actor_invocation_closed` now carry the same runtime identity envelope as
  `actor_process_*`.
- `actorInvocationRefs` and `observedActorArtifactRefs` now retain that
  envelope in replay projection.
- Local-spawn missing-command ENOENT now emits `actor_process_start_failed`,
  then `actor_process_exited`, instead of a false `actor_process_started`.

Post-review proof:

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

## Causal worker-observation live proof

Completed 2026-05-06T00:46:29+10:00.

The T113 live lane now includes a causal actor/worker observation scenario:

- `worker.claude` runs through the PTY traced call-out and returns a dynamic
  `ABG_T113_WORKER_OBSERVATION_*` token.
- The test extracts that token from the worker trace result.
- `actor.claude.observed-worker` runs through `invokeSupervisedProcessActor`
  with the worker trace result ref and observed token in its prompt.
- The actor must return `ABG_T113_ACTOR_OBSERVED_<observed-worker-token>`.
- The actor process events and projection row must carry the worker trace
  result ref in `causationEventRefs`.

This proves an actor invocation can observe a completed worker result and
respond to that observed worker output through ABG event/projection boundaries.
It does not claim continuous actor monitoring of a still-running worker stream.

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
