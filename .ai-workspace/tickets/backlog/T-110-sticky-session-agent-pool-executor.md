---
id: T-110
title: Sticky-session agent pool executor over the universal traced agent call-out substrate
type: feature
ticket_category: substrate_executor_extension
status: backlog
review_status: pending
backlog_reason: Substrate enhancement that depends on T-108 and T-109 having stabilised the universal call-out interface, and on T-111 establishing a literal PTY/xterm executor seam. Local-spawn executor remains lawful; this ticket adds sticky pooling and affinity over executor backends rather than replacing the first.
goal: enable-sticky-session-agent-pool-execution-over-universal-traced-callout
goal_status: active
build_tenant: typescript
release_scope: post-RC7
change_intent: Extend the traced agent call-out substrate so framework-owned `agent.actor` and `agent.worker` invocations within a single traversal share a primed agent session by default. The substrate selects executor backend from a typed session affinity key derived from the GTL/ABG carrier identity. Local-spawn remains the default for test isolation and contexts without an active pool.
change_class: design_reframe
re_entry_point: design
affected_boundary: traced process substrate, agent transport adapter, supervised actor invocation, ActorInvocation carrier, AgentTransportFailureClass, prompt-cache discipline contract, test isolation policy, pool executor backend
priority: medium
triaged_at: 2026-05-03T20:30:00+10:00
created_at: 2026-05-03T20:30:00+10:00
updated_at: 2026-05-04
governance_scope: STDO Method
dependencies:
  - T-108 traced process substrate (completed)
  - T-109 universal traced agent call-out interface (completed)
  - T-111 literal PTY/xterm agent executor (backlog)
candidate_requirement_authority:
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/product/REQ-P-QUAL.md
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md
  - build_tenants/common/traced_process/README.md
evidence_refs:
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/
  - build_tenants/abiogenesis/typescript/test_env/test_runs/t107_mini_dm_traversal_schemes_live/
  - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/test_env/test_runs/t109_live_installed_data_mapper_pty/20260504T121722717Z_pid84330
proof_commands:
  - npm run build:semantic
  - npm run test:t109
intake_source: Operator observed that under the universal traced call-out substrate, iterative agent invocations within one traversal pay full cold-start cost per call and lose Anthropic prompt-cache hits across edges of the same logical reasoning thread. Mini-DM redux walks three edges (derive_field_spec, derive_implementation, derive_validation) over the same problem statement and project context; T-094 walks two hops over the same authority refs; both currently spawn fresh sessions and discard cache prefix at every call boundary.
target_truth: A traversal that iterates over the same code or workspace reuses one primed agent session by default. Stickiness derives from a typed session affinity key on the call-out request, defaulted from the ABG carrier identity. The substrate selects executor backend by configuration; local-spawn remains the test-isolation default. The pool executor enforces cache-prefix discipline so prompt-cache hits compound across calls on the same session. Wedged sessions are drained and replaced; one replacement per traversal is lawful before the call-out classifies as `session_failure`.
non_closure_conditions:
  - any pool executor path bypasses `runTracedProcess` and writes its own archive
  - sticky session reuse leaks state across logical traversals or across tests by default
  - cache-prefix discipline is not pinned in the call-out contract
  - wedged-session replace policy is undocumented or implemented inconsistently
  - `session_failure` is conflated with `transport_failure` in classification
  - tests cannot pin local-spawn executor for deterministic isolation
  - sticky-key derivation is not standardised in the ABG carrier surface
  - the per-callout archive shape differs between local-spawn and pool executors
---

# T-110: Sticky-Session Agent Pool Executor

## 2026-05-04 Downstream Pressure

The odd_sdlc T-109 data-mapper PTY live lane shows the same performance
pressure at production scale. A single graph walk repeatedly launches
`process://claude` for adjacent design and realization edges, then retries the
same edge when typed postflight rejects a carrier. The retry is lawful, but it
pays the cold-start and context rediscovery cost again even though the retry
has the same workspace, graph function, vector, edge, and prompt contract.

This ticket therefore explicitly owns same-edge retry stickiness as the first
pooling policy. Cross-edge pooling remains in scope, but same-edge retry reuse
is the lowest-risk closure slice because it preserves a single logical
postflight repair context without treating hidden conversational state as graph
authority.

## Why This Ticket Exists

Under the current traced agent call-out substrate, every `runAgentActorWorkerCallout` spawns a fresh agent process. Mini data-mapper redux pays full cold-start cost three times to derive `field_spec`, `implementation`, and `validation` over the same problem statement and project context. T-094 pays it twice over the same authority refs. The Anthropic prompt cache is invalidated at every call boundary because the cache prefix is not held across calls.

T-110 is intentionally downstream of T-111. T-111 proves the literal PTY/xterm executor and per-call archive slicing. T-110 then adds sticky affinity, warm-slot routing, cache-prefix discipline, and session replacement policy over that executor seam.

For workloads where agent invocations within a traversal logically share project context, this is wrong on three axes: latency, token cost, and agent quality (the agent rediscovers project conventions each time). A sticky-session pool over the same call-out substrate eliminates the redundancy without changing the public call-out interface seen by callers.

## Lawful Boundary

Change class: `design_reframe`.

ABG runtime law, the call-out interface seen by callers, and the trace archive shape stay intact. The change introduces:

- a `TracedProcessExecutor` abstraction inside `shared/traced_process/`
- a `sessionAffinityKey?: string` field on `TracedProcessRequest`
- a `derivedSessionAffinityKey` accessor on `ActorInvocation`
- a `session_failure` member of `AgentTransportFailureClass`
- a pool executor implementation alongside the local-spawn executor
- a cache-prefix discipline pinned in the call-out contract

The public type contract on `runAgentActorWorkerCallout` widens (new optional fields) without breaking existing callers. Local-spawn remains the default executor for tests and single-call workloads.

## Solution Shape

Sticky-key candidates already in the GTL/ABG carriers:

- `traversalId` — natural unit for one warm session per traversal walk
- `frameId` — recursive selection opens a child traversal with its own warm slot
- `workKey` — durable semantic work contract; outlives a single traversal

Initial sticky policy:

- same-edge retry key:
  `workspaceRef + graphFunctionRef + vectorIndex + edgeName + promptContractDigest`
- graph-run key:
  `workspaceRef + graphFunctionRef + workKey`
- default closure slice:
  same-edge retry reuse only
- later policy:
  graph-run scoped reuse after archive slicing and authority-boundary tests
  prove that hidden session memory cannot become closure authority

The substrate stays opaque to which key the caller picks. ABG's `process_actor` adapter derives `sessionAffinityKey` from `ActorInvocation` automatically. Direct `runAgentTransport` callers pass it explicitly. Tests omit it and hit local-spawn.

```text
runAgentActorWorkerCallout({
  agentCalloutKind: "agent_worker",
  sessionAffinityKey: invocation.traversalId,
  ...
})
  -> runTracedProcess(...)
    -> TracedProcessExecutor.dispatch(request)
      -> local-spawn executor (default; test isolation)
      -> pool executor (sticky session, prompt-cache aware)
```

Cache-prefix discipline is contract-level, asserted at admission:

```text
prompt
  := <cached prefix>          immutable per session: system prompt, tool defs,
                              problem statement, immutable workspace digests
  ++ <fresh suffix>           per-call: edge-specific obligation, mutable state
```

The pool executor structures every call as `cached prefix ++ fresh suffix`. Workspace mutations between calls cannot bleed into the cache region. A malformed call (mutable state inside the cache prefix) is rejected as a contract violation, not silently uncached.

Wedged-session policy:

- one replacement per traversal is lawful and admitted as a `session_replaced` trace event
- the replaced call fails over to a fresh warm slot once and resumes
- a second wedge in the same traversal admits `session_failure` and propagates to ABG retry classification

The trace archive shape is unchanged from the caller's perspective. The pool executor synthesises a per-callout `events.ndjson` from a slice of the warm session's event stream so that downstream consumers (forensic replay, odd_manager xterm, future distributed executors) read the same shape regardless of executor backend.

## Implementation Slices

1. Abstract subprocess execution behind a `TracedProcessExecutor` interface inside `shared/traced_process/`. Default implementation: current local-spawn. Public surface unchanged.
2. Add `sessionAffinityKey?: string` to `TracedProcessRequest`. Wire through `agent_transport` and `process_actor` adapters. No behaviour change with the default executor.
3. Add `derivedSessionAffinityKey` to `ActorInvocation`. Default derivation: `traversalId`.
4. Add `session_failure` to `AgentTransportFailureClass`. Update `classifyFailure` and ABG retry classification to recognise it as a class distinct from `transport_failure` and `contract_failure`.
5. Implement pool executor over Anthropic SDK direct calls. Sticky routing by `sessionAffinityKey`. Maintain N warm sessions; LRU eviction at traversal closure.
6. Pin cache-prefix discipline in the call-out contract: callers structure prompts as `<cached prefix> ++ <fresh suffix>`. Pool executor asserts the discipline at admission and rejects malformed calls.
7. Wedged-session replace-and-resume with one-retry allowance per traversal. Trace event vocabulary additions: `session_unhealthy_observed`, `session_replaced`, `session_failure_admitted`.
8. Test isolation: tests pin `executorProfile: "local"` by default; pool opt-in is explicit per call or per env.
9. Update the T-109 semantic guard's allow-list and pattern set to cover the pool executor module without permitting direct subprocess use elsewhere.
10. Add same-edge retry reuse as the first sticky policy, with one per-call
    archive per retry attempt and one shared session transcript slice keyed by
    the retry affinity key.
11. Emit prompt-cache and session metrics into the per-call archive:
    `sessionAffinityKey`, `sessionReuseKind`, `cachePrefixDigest`,
    `cacheReadTokens`, `cacheCreationTokens`, and `sessionReplacementCount`.

## Closure Criteria

T-110 closes only when:

- `TracedProcessExecutor` exists with at least two implementations (local-spawn, pool)
- `sessionAffinityKey` propagates through `runAgentActorWorkerCallout`, `runAgentTransport`, and `invokeSupervisedProcessActor`
- `ActorInvocation.derivedSessionAffinityKey` is callable and defaults to `traversalId`
- `session_failure` is a typed member of `AgentTransportFailureClass` and ABG retry classification distinguishes it from `transport_failure`
- pool executor unit fixtures cover: warm-session hit, cache-prefix discipline assertion, wedged-session replace, second-wedge admits `session_failure`
- a recorded multi-edge fixture replayed through the pool executor proves `apiRetryEvents` and `toolCallEvents` are correctly associated to the per-callout archive, not bled across the warm session
- mini-DM redux three-edge walk under the pool executor produces reduced wall-time and observable prompt-cache hit metrics relative to the local-spawn baseline, archived as evidence
- an odd_sdlc-style same-edge retry fixture proves a rejected carrier retry
  reuses the same sticky session while preserving distinct per-attempt archives
- the T-109 semantic guard still passes, scoped to the new pool executor module
- `npm run build:semantic` passes

## Non-Closure Statement

T-110 is not closed by proving that one warm session can be reused. It closes only when the pool executor lives behind the same call-out interface every framework-owned agent invocation already uses, when sticky-key derivation is standardised at the carrier level, when cache-prefix discipline is contract-enforced, and when test isolation defaults to local-spawn so deterministic tests are not silently coupled through a shared session pool.

## Related Forward Work

The pool executor and the future AWS-Lambda / Step-Functions distributed executor share the same `TracedProcessExecutor` seam. SDK-direct pooling and SDK-direct Lambda invocation are the same code shape with different lifecycle policies. Landing T-110 over the local executor first hardens the abstraction before the distributed backend ships.
