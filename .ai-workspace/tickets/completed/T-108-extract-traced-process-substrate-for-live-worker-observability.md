---
id: T-108
title: Extract traced process substrate for worker shell-out observability
type: feature
ticket_category: shared_process_substrate
status: completed
review_status: implementation_evidence_complete
goal: rc7-live-worker-forensics-and-shared-process-supervision
change_intent: Introduce a neutral traced-process substrate that wraps worker shell-out calls for ABG live tests, odd_manager terminal/session surfaces, and downstream products without coupling process supervision to ABG semantic runtime law or odd_manager UI state.
change_class: design_reframe
re_entry_point: design
affected_boundary: shared process supervision, ABG live F_P worker harness, Claude transport observability, future odd_manager oddterm extraction, downstream live worker adapters
priority: critical
build_tenant: typescript
release_scope: RC7 candidate
triaged_at: 2026-05-03T19:10:00+10:00
created_at: 2026-05-03T19:10:00+10:00
updated_at: 2026-05-03T20:32:00+10:00
governance_scope: STDO Method
dependencies:
  - T-097 designed supervised process actor execution and streamed observation
  - T-101 completed mini data-mapper redux live semantic eval sandbox
  - T-107 completed traversal modulation profiles for agentic F_P attempts
  - T-109 reviews the post-STDO method boundary for universal agent actor and worker shell-out
candidate_requirement_authority:
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/product/REQ-P-QUAL.md
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_DISTRIBUTED_EXECUTOR_BACKENDS.md
evidence_refs:
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t107_mini_dm_traversal_schemes_live/20260503T082920702Z
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t094_assurance_register_two_hop_live/20260503T082853173Z
proof_commands:
  - npm run build:semantic
  - npm run test:t109
  - npm run test:t087
  - npm run test:t097
  - ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t107:data-mapper-live
intake_source: Operator requested a shared traced-process library after RC7 live test analysis showed that text-mode spawned Claude workers hide API retry and tool-call activity until timeout.
target_truth: Worker shell-out supervision is a shared substrate. It owns process launch, stream capture, structured event observation, terminal-compatible raw trace, timeout classification, and result normalization for worker subprocesses. Agent transport is one adapter over that substrate, not the substrate itself. ABG consumes traced shell output as transport evidence and keeps traversal, convergence, retry, and semantic closure in ABG runtime law. odd_manager can later attach UI/xterm surfaces to the same substrate without owning ABG semantics.
non_closure_conditions:
  - live worker failures remain archived only as zero stdout/stderr and generic timeout
  - Claude stream-json api_retry events are discarded
  - any framework-owned agent actor or worker call-out uses divergent local process semantics
  - process supervision is hidden inside ABG traversal semantics
  - odd_manager UI-specific oddterm state becomes a dependency of ABG live tests
  - downstream consumers cannot reuse the traced-process archive contract
---

# T-108: Traced Worker Shell-Out Substrate

## Why This Ticket Exists

The RC7 live data-mapper traversal lane failed in a way that the current harness
could not explain. The old `spawnSync` text transport reports only final stdout.
When Claude retries the API, performs tool work, or stalls before final output,
the harness sees:

```text
stdoutLength = 0
stderrLength = 0
status = 143
error = spawnSync claude ETIMEDOUT
```

That is not enough evidence for a release gate. It collapses transport retry,
tool activity, backend outage, and true no-output into one opaque failure.

`odd_manager` has already proven the useful substrate pattern: process sessions
need metadata, append-only trace, raw terminal output, live attachability, and
restart/forensics surfaces. That capability should be extracted as a neutral
shared worker shell-out substrate rather than duplicated in ABG or coupled to
odd_manager UI.

## Lawful Boundary

This is a `design_reframe`.

The semantic runtime does not change. GTL and ABG still own traversal,
projection, convergence, retry, and evidence admission. The new substrate only
improves live process observation and failure classification.

## First Slice

- Add a package-exported `shared/traced-process` TypeScript module as the
  universal worker shell-out primitive.
- Archive command, metadata, raw stdout/stderr, structured events, final output,
  and result JSON.
- Parse Claude `stream-json` output enough to preserve `api_retry` and tool-call
  observations while extracting the final artifact body.
- Move live worker harnesses onto the shared shell-out API rather than local
  `spawnSync` transport implementations.
- Keep the live lane fail-hard; do not add skip or ping workarounds.

## Review Follow-Up Slice

T-107 and T-094 now use the shared worker shell-out adapter. Do not close T-108
until all live worker subprocess call sites avoid local transport semantics and
delegate to the shared shell-out API.

The Claude stream parser intentionally treats `result.result` as canonical final
text. Assistant text chunks are fallback only. The live worker does not request
partial-message deltas, avoiding duplicate final text if Claude emits both
partials and full assistant messages in a future stream shape.

## Future Executor Note

The important design seam is the traced call-out contract, not local process
spawn. The same interface can later support direct SDK calls, legacy interactive
shells, replay, containers, SSH, Kubernetes jobs, Lambda-style execution, or a
proper backend event stream. Those are future executor plugins behind
`runAgentActorWorkerCallout`; they are not reasons to reopen framework callers.

Do not narrow `TracedProcessPaths` or stream callback semantics to local-only
filesystem assumptions. The current implementation writes local files, but the
contract should remain friendly to URI-like archive refs and distributed
best-effort streaming.

Distributed executor migration decisions are captured in
`build_tenants/abiogenesis/typescript/design/M03_DISTRIBUTED_EXECUTOR_BACKENDS.md`.

## Validation Evidence

2026-05-03 traced T-107 live run:

```text
ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t107:data-mapper-live
```

Result: fail-hard transport failure with useful evidence, not a silent timeout.

- archive: `build_tenants/abiogenesis/typescript/test_env/test_runs/t107_mini_dm_traversal_schemes_live/20260503T091256660Z`
- edge: `edge_1_derive_field_spec`
- status: `1`
- signal: `null`
- timedOut: `false`
- inactivityTimedOut: `false`
- failureClass: `transport_failure`
- finalOutput: `API Error: Unable to connect to API (ConnectionRefused)`
- structuredEventCount: `13`
- apiRetryCount: `10`
- toolCallCount: `0`
- stdoutLength: `5409`
- stderrLength: `0`

The failure reproduced the suspected upstream Claude API retry storm and proved
the traced substrate preserves retry evidence. It did not exercise semantic
typed traversal completion because the first worker edge never reached model
execution.

2026-05-03 current build after universal actor/worker shell-out migration:

```text
npm run build:semantic
```

Result: passed.

Current implementation state:

- `runTracedProcess` is the subprocess primitive.
- `runAgentActorWorkerCallout` is the single library interface for framework-owned `agent.actor` and `agent.worker` call-outs.
- `runAgentTransport` adapts agent worker transport to `runAgentActorWorkerCallout`.
- `invokeSupervisedProcessActor` adapts framework actor subprocess execution to `runAgentActorWorkerCallout`.
- T-094, T-100, T-107, M05 UAT, and M05 portfolio live worker paths delegate to `runAgentTransport`.
- The separate sync agent transport adapter was removed.
- T-087's synchronous plugin seam was resolved by adding async public start and async F_P dispatch consumption.
- T-109 added the guard and recorded fixtures that make this closure mechanically enforceable.

Review fix state:

- stale: duplicated Claude parser in `agent_transport` after sync adapter removal
- stale: sync trace writer after sync adapter removal
- fixed: `process_actor` no longer forces `generic-text`; it accepts an explicit parser and infers `claude-stream-json` for Claude stream-json actor commands
- fixed: pre-init nonzero agent transport failures classify as `transport_failure`
- fixed: process actor heartbeat timer is cleared with `finally`
- fixed: Claude final result extraction avoids overwriting an existing result unless a later event declares `subtype: success`

2026-05-03 closure commands after T-109 completion:

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

- direct framework agent shell-out guard
- recorded Claude stream-json `api_retry` observation
- recorded Claude stream-json `tool_use` observation
- pre-init nonzero agent exit classified as `transport_failure`
- T-087 actor invocation behavior after async public start repricing
- T-097 supervised process actor lifecycle, timeout, missing command, SIGTERM,
  and SIGKILL behavior

Live RC7 proof remains a testing phase, not active code work. The last live
T-107 run remains the current live evidence and failed as a useful
`transport_failure` with preserved Claude retry evidence.
