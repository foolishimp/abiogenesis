---
id: T-109
title: Post-STDO method review for universal agent actor and worker shell-out substrate
type: review
ticket_category: method_design_review
status: completed
review_status: implementation_evidence_complete
goal: evaluate-universal-agent-actor-worker-shellout-substrate
change_intent: Evaluate whether the traced-process substrate and adapter boundary correctly serve every framework call-out used to invoke an agent actor or agent worker.
change_class: design_reframe
re_entry_point: design
affected_boundary: ABG supervised actor invocation, F_P worker dispatch, agent transport adapters, traced process substrate, live test harnesses, future odd_manager terminal/session reuse
priority: high
build_tenant: typescript
release_scope: RC7 candidate follow-up
triaged_at: 2026-05-03T19:30:21+10:00
created_at: 2026-05-03T19:30:21+10:00
updated_at: 2026-05-03T20:18:00+10:00
governance_scope: STDO Method
dependencies:
  - T-108 extracts traced worker shell-out substrate
candidate_requirement_authority:
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/product/REQ-P-QUAL.md
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md
evidence_refs:
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t107_mini_dm_traversal_schemes_live/20260503T091256660Z
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t107_mini_dm_traversal_schemes_live/20260503T082920702Z
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260503T082853173Z
proof_commands:
  - npm run build:semantic
  - npm run test:t109
  - npm run test:t087
  - npm run test:t097
intake_source: Operator clarified that the solution must be universal for framework call-outs used to invoke agent.actor or agent.worker, not a narrow Claude live-test patch.
target_truth: Framework-owned agent actor and worker subprocess invocation goes through one library interface over one traced xterm-like call-out substrate. The substrate owns process execution, stream capture, timeout and signal mechanics, trace archive shape, and structured transport observations. ABG adapters translate those observations into actor, worker, traversal, dispatch, and runtime evidence without reimplementing subprocess control.
non_closure_conditions:
  - any framework path that invokes an agent actor or agent worker uses local spawn or spawnSync process semantics
  - Claude-specific stream-json behavior is hidden inside a test harness instead of a shared adapter
  - supervised actor invocation and F_P worker dispatch diverge on timeout, stream, or signal behavior
  - trace archives are unavailable for transport retry, tool-call, timeout, or process-exit failures
  - the design boundary between process substrate, ABG runtime law, and odd_manager UI/session reuse is not reviewed
---

# T-109: Post-STDO Method Review

## One-Stop Solution

All framework-owned call-outs whose purpose is invoking an `agent.actor` or
`agent.worker` must enter through one library interface:

```text
agent.actor / agent.worker call-out
  -> runAgentActorWorkerCallout(...)
    -> runTracedProcess(...)
      -> trace archive
      -> stream parser
      -> timeout and signal handling
      -> final result normalization
      -> failure classification
```

`runTracedProcess` is the subprocess substrate. `runAgentActorWorkerCallout` is
the framework call-out interface. Agent-specific adapters such as Claude, Codex,
and Gemini are profiles over that interface, not independent process execution
paths.

Blocking versus async is a caller consumption mode. It must not create a second
agent shell-out mechanism. If a synchronous framework callback cannot await an
agent call-out, that callback boundary must be repriced instead of introducing a
sync transport clone.

## Review Question

Does the current T-108 build establish a lawful universal substrate for all
framework call-outs that invoke an `agent.actor` or `agent.worker`?

The review must distinguish:

- generic shell commands used by installers, tests, packaging, and compilers
- framework actor and worker subprocess invocation
- agent transport adapters such as Claude, Codex, and Gemini
- ABG semantic runtime law for traversal, retry, projection, and closure
- odd_manager terminal/session UI reuse

## Done Versus Remaining

Done in the current build:

- `runAgentActorWorkerCallout` exists and is the shared library interface over
  traced subprocess execution.
- `runAgentTransport` delegates to `runAgentActorWorkerCallout`.
- `invokeSupervisedProcessActor` delegates to `runAgentActorWorkerCallout`.
- `runAgentTransportSync` has been removed and must not return.
- `process_actor` accepts an explicit parser and infers `claude-stream-json`
  for Claude stream-json actor commands.
- T-094, T-100, T-107 data-mapper, M05 UAT, and M05 portfolio live worker paths
  use the shared agent transport adapter.
- `npm run build:semantic` passes.

Remaining work:

- none for this STDO ticket

Resolved in the implementation:

- semantic guard blocks direct framework agent shell-out paths
- recorded parser and failure fixture coverage exists
- T-087 synchronous plugin seam was resolved by adding async public start and
  async F_P dispatch consumption
- T-087 live-lane skip was removed from the installed script path
- forced-failure fixture proves `transport_failure` classification
- recorded retry/tool-call fixture proves observations are preserved

## Required Refactoring Points

1. Replace direct agent process execution

Every framework path that invokes an agent actor or worker must stop using local
`spawn`, `spawnSync`, hand-rendered argv, local env sanitization, local timeout
classification, or local trace writing.

Target:

```text
runAgentActorWorkerCallout(...)
```

Allowed direct subprocess use remains limited to non-agent utilities such as
compiler, installer, packaging, archive extraction, and deterministic local
tooling.

2. Collapse agent transport into an adapter

`runAgentTransport` may remain only as a compatibility adapter that prepares an
agent worker call-out profile and delegates to `runAgentActorWorkerCallout`.
It must not own process execution, parser state, signal handling, timeout
semantics, or archive shape.

3. Route supervised actor invocation through the same interface

`invokeSupervisedProcessActor` must adapt ABG actor runtime events from traced
call-out observations. It must not own a separate subprocess loop.

The actor adapter must preserve ABG runtime facts:

- `actor_process_started`
- `actor_process_stream_observed`
- `actor_process_timeout`
- `actor_process_signal_sent`
- `actor_process_exited`

4. Make agent parser selection shared and explicit

Claude stream-json parsing, retry observation, tool-call observation, final text
normalization, and pre-init failure handling must be shared by all agent actor
and worker paths.

Parser selection should be derived from an agent call-out profile or explicit
parser field, not inferred separately in every test harness.

Current state: the duplicate whole-log parser was removed with the sync adapter,
so there is not currently a second agent transport parser to deduplicate. If a
whole-log replay path is added for fixtures or archive review, it must consume
the same accumulator as the streaming parser rather than reimplementing Claude
stream-json parsing.

5. Resolve the synchronous callback seam

The T-087 synchronous installed plugin callback must not regain a sync agent
call-out path.

Lawful options:

- make the plugin boundary async
- return a `dispatch_required` carrier and let the async traced call-out layer
  execute the agent worker

Unlawful option:

- reintroduce `runAgentTransportSync` or any equivalent `spawnSync` agent
  worker invocation path

6. Add a semantic guard

Add a semantic grep or unit guard that fails if framework-owned agent actor or
worker invocation reintroduces direct process execution outside the shared
call-out interface.

The guard should distinguish agent invocation from non-agent local tooling.

Guard rule shape:

- scan framework agent invocation paths: `code/src/abg/m03/transport`,
  `code/src/abg/m03/runner`, `code/src/shared/abg_library`, `test_env/live`,
  and `test_env/sandbox/mini_dm_redux/fp_worker.mjs`
- disallow `import ... from "node:child_process"` and direct `spawn` or
  `spawnSync` usage in those paths
- allow direct process mechanics only in `code/src/shared/traced_process/`
- exclude non-agent utility subprocesses such as installer packaging,
  archive extraction, CLI integration harnesses, and local `tsc` evaluation

7. Add parser and failure fixture coverage

Fixture coverage must exercise:

- Claude init/result stream
- `api_retry`
- `tool_use`
- assistant text fallback
- pre-init nonzero process exit
- timeout or forced termination archive

The same parser behavior must be used by streaming execution and any whole-log
review path.

## Solution Shape

The desired code shape is:

```text
shared/traced_process/
  runTracedProcess(...)
  runAgentActorWorkerCallout(...)
  TracedProcessPaths
  TracedProcessResult

shared/abg_library/
  runAgentTransport(...) as adapter only
  contract/profile constructors

abg/m03/transport/
  invokeSupervisedProcessActor(...) as ABG event adapter only

test_env/live and sandbox workers/
  no direct agent shell-out
  call runAgentTransport or runAgentActorWorkerCallout
```

The durable archive contract is owned by:

```text
build_tenants/common/traced_process/README.md
```

This ticket may summarize the archive shape, but the README is the contract that
must be updated if the archive vocabulary changes.

## T-087 Sync Seam Status

T-087's live lane currently skips with a synchronous-callback detail because the
sync agent transport adapter was removed. That skip is acceptable only as a
visible seam while T-109 is active.

T-109 closure requires removing the skip by either making the plugin boundary
async or introducing a `dispatch_required` carrier.

Initial `dispatch_required` candidate shape:

```text
{
  kind: "dispatch_required",
  invocationContract,
  agentCalloutProfile,
  prompt,
  archiveRoot,
  expectedResultRef
}
```

Shape is not ratified. Defining it is part of T-109 design work if the async
plugin-boundary option is not chosen.

## Future Reuse Out Of Scope

odd_manager/xterm may later attach to the same traced session/archive contract.
That future UI reuse is enabled by this work but is not a T-109 closure
requirement. ABG must not depend on odd_manager UI state.

## Closure Criteria

T-109 can close only when:

- every framework-owned `agent.actor` and `agent.worker` invocation enters
  through `runAgentActorWorkerCallout`
- no framework agent invocation uses local `spawn`, `spawnSync`, local argv
  rendering, local env sanitization, local timeout handling, or local trace
  writing
- `runAgentTransport` is adapter-only
- `invokeSupervisedProcessActor` is adapter-only
- the T-087 sync seam is resolved by async boundary repricing or
  `dispatch_required`, not a sync call-out clone
- parser and failure fixtures cover Claude retry/tool/pre-init cases
- a semantic guard prevents reintroducing direct agent shell-outs
- `npm run build:semantic` passes
- at least one forced failure archive proves `transport_failure` classification
- a recorded Claude stream-json fixture with `api_retry`, `tool_use`, and final
  result proves retry/tool-call observations are preserved
- live Claude archives, if available, supplement recorded fixture evidence but
  do not replace it

## Closure Evidence Commands

Current command:

```text
npm run build:semantic
```

Added and passing commands:

```text
npm run test:agent-callout-guard
npm run test:claude-stream-json-parser
npm run test:agent-callout-forced-failure
npm run test:t109
npm run test:t087
npm run test:t097
```

Live supplement after recorded coverage exists:

```text
ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t107:data-mapper-live
```

## Non-Closure Statement

T-108/T-109 are not closed by proving that one live test harness uses traced
Claude execution. They close only when the framework has one call-out API for
agent actors and workers, and when all current and future framework adapters are
mechanically prevented from bypassing it.

## Current Build State To Review

The current build moves the framework toward one subprocess primitive:

- `shared/traced_process/runTracedProcess` is the process execution substrate.
- `shared/traced_process/runAgentActorWorkerCallout` is the single library interface for framework-owned `agent.actor` and `agent.worker` subprocess invocation.
- `shared/abg_library/runAgentTransport` adapts agent worker transport to that interface.
- `abg/m03/transport/invokeSupervisedProcessActor` adapts supervised actor invocation to that interface.
- T-094, T-100, T-107 data-mapper, M05 UAT, and M05 portfolio live worker paths use the shared agent transport adapter.
- T-087 is now treated as a synchronous plugin-boundary seam. The shared sync agent transport adapter has been removed; that test should not regain a local worker call-out path.

## Review Work

- Confirm the lawful boundary: process substrate versus ABG traversal/runtime law.
- Confirm that sync adapter retention is not acceptable for agent actor or worker invocation.
- Decide whether ABG plugin invocation must become async at the framework boundary, or whether synchronous callbacks must return a dispatch-required carrier that is executed by the async traced call-out layer.
- Identify any remaining framework actor or worker call-outs that bypass the shared substrate.
- Decide whether the transport contract carrier should remain a command template or become a higher-level actor/worker invocation profile.
- Define closure evidence for RC7: build, targeted unit coverage, forced failure evidence, and live retry/tool-call archive evidence.

## Current Evidence

`npm run build:semantic` passed after the current T-108 migration.

Additional current build evidence:

```text
npm run build:semantic
```

Result: passed after removing the sync agent transport adapter and fixing the
process actor parser inference path.

## Closure Evidence

2026-05-03 closure commands:

```text
npm run build:semantic
npm run test:t109
npm run test:t087
npm run test:t097
```

Observed results:

- `npm run build:semantic`: passed
- `npm run test:t109`: 3 passed, 0 failed
- `npm run test:t087`: 4 passed, 0 failed
- `npm run test:t097`: 5 passed, 0 failed

Closure evidence covered:

- direct agent shell-out guard
- recorded Claude stream-json `api_retry` observation
- recorded Claude stream-json `tool_use` observation
- pre-init nonzero agent exit classified as `transport_failure`
- T-087 actor invocation behavior
- T-097 supervised process actor lifecycle, timeout, missing command, SIGTERM,
  and SIGKILL behavior

T-109 is complete as a STDO method ticket. T-108 remains the linked
implementation ticket unless explicitly moved to completed.

2026-05-03 post-closure migration note:

- The stale T-097 Claude text-mode live harness was deleted as a release
  surface.
- Its useful supervised-actor probe shape was migrated into
  `test_env/tests/test_t109_agent_callout_traced_substrate.test.mjs` as an
  `agent_actor` fixture through `runAgentActorWorkerCallout`.
- The package script `test:t097:live` was removed. Current proof remains through
  the one-interface call-out tests, especially `npm run test:t109`.
