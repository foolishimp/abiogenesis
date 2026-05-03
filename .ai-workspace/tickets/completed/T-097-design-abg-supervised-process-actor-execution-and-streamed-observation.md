---
id: T-097
title: Authorize ABG supervised process actor execution and streamed observation
type: feature
ticket_category: implementation_migration
status: completed
review_status: external_review_accepted_for_rc_cut
goal: abg-total-assurance-calculus
goal_status: active
change_intent: Move generic process actor invocation, live stdout/stderr observation, timeout supervision, and actor lifecycle facts into ABG so downstream ODD products publish GTL programs and plugins rather than owning execution loops or process supervision.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: ABG M03 actor invocation, process transport contracts, runtime event carrier, payload ledger, continuation/retry projection, downstream plugin contracts, odd_sdlc F_P worker lane
priority: high
triaged_at: 2026-04-30T06:55:00+10:00
created_at: 2026-04-30T06:55:00+10:00
updated_at: 2026-05-01T00:15:48+10:00
dependencies:
  - T-087 completed
  - T-090 completed/external_review_accepted
  - T-093-TS completed/external_review_accepted
  - T-095-TS completed
  - T-096 completed/external_review_accepted
governing_library:
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/attached_fp_worker.ts
  - build_tenants/abiogenesis/typescript/code/src/shared/abg_library/transport_contracts.ts
governance_scope: STDO Method
intake_source: odd_sdlc data_mapper live Claude lanes exposed that child-worker invocation, stdout/stderr observation, timeout behavior, retry lineage, and actor/worker lifecycle were still partly owned by downstream realization code. The user directed that SDLC must contain GTL programs and plugins only, with invocation/execution pure ABG.
target_truth: ABG owns actor execution and supervised process observation. A downstream product may supply a plugin that maps domain contracts to prompts, artifacts, and assessments, but the actor lifecycle, child process identity, stream observations, timeout escalation, retry lineage, and replay projection are ABG runtime truth.
superseded_truth: A downstream product such as odd_sdlc may own local start/iterate loops, local retry event construction, child process supervision, or terminal-only stdout/stderr evidence for an ABG actor lane.
closure_law: This ticket cannot close until an external STDO review accepts the design and the TypeScript implementation proves at least one downstream Claude lane can observe actor/process state before final worker completion. Deterministic tests alone are insufficient.
evaluation_criteria:
  - ABG exposes a closed supervised-process actor contract with command, argv, cwd, stdin/prompt source, environment policy, timeout policy, and result artifact refs.
  - ABG emits replay-admitted actor/process lifecycle events for process start, stdout chunk, stderr chunk, heartbeat/progress, timeout, termination signal, process exit, and result observation.
  - ABG projections expose child PID when available, stream refs, latest heartbeat, timeout state, process exit state, and final actor result.
  - Retry and continuation projections carry prior failed result or manifest identity into the next plugin input.
  - Downstream plugins cannot emit actor lifecycle authority or construct retry events directly.
  - odd_sdlc consumes the ABG process actor seam through a plugin and no longer owns process-loop or retry-event construction.
  - A live Claude lane archives stream/process evidence while the child is still running, not only after exit.
proof_surface:
  - TypeScript semantic tests for actor/process events and projections.
  - TypeScript negative tests proving plugin attempts to smuggle actor lifecycle authority fail closed.
  - odd_sdlc deterministic regression proving the F_P lane uses ABG runner/retry truth.
  - live Claude lane archive with pre-exit `worker_stdout.log`, `worker_stderr.log`, actor/process event rows, child identity, timeout policy, and final result or typed timeout failure.
  - external STDO review before closure.
non_closure_conditions:
  - odd_sdlc retains a local iteration loop or direct retry-event construction.
  - stdout/stderr are written only after child process exit.
  - child process identity is absent from runtime/archive truth.
  - timeout behavior is owned only by a downstream `spawnSync` call.
  - terminal transcript is treated as evidence instead of ABG runtime/archive facts.
  - Codex live evidence replaces the required Claude lane.
  - another agent has not reviewed and accepted the design and implementation.
---

# T-097: ABG Supervised Process Actor Execution

## STDO Triage

First missing layer: requirement.

The product boundary is already ABG-owned execution. The defect is that the
requirement surface did not explicitly authorize the full supervised
actor/process event family, live stream observation, process projection, and
transport ownership rule now needed by the TypeScript implementation and
downstream odd_sdlc consumer.

This is not an odd_sdlc feature. odd_sdlc should publish GTL programs and
plugins. ABG should execute actors, supervise process transports, emit event
truth, and project ledgers.

The requirement reprice is carried by:

- `REQ-R-ABG3-EVENTS-012..015`
- `REQ-R-ABG3-PROJECTION-007..010`
- `REQ-R-ABG3-TRANSPORT-016..019`

## Boundary Rule

| Layer | Owns |
| --- | --- |
| GTL | graph function declaration and traversal shape |
| ABG | actor invocation, process supervision, runtime facts, retry/continuation lineage, event log, projections |
| Plugin | domain prompt/materialization adapter and result artifact mapping |
| odd_sdlc | SDLC domain meaning, hook contracts, requirement/design/code/test/release interpretation |

## Engine-First Holistic Context

Holistic solution reference:

`/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260430T224308AEST_abg_engine_first_holistic_solution.md`

This ticket is the first engine ticket in the `test60` bug wave. If ABG cannot
own process actor identity, streamed stdout/stderr, timeout escalation, signal
sequence, and exit projection, then downstream products will keep rebuilding
runtime truth in local transport code.

```mermaid
flowchart TD
  Local[downstream local transport] --> Process[process spawn]
  Process --> Transcript[terminal/stdout capture]
  Process --> Timeout[local timeout]
  Transcript --> Posthoc[post-hoc evidence]
  Timeout --> Posthoc
  Posthoc --> Gap[unclear runtime truth]

  ABG[ABG supervised actor] --> Start[process_start event]
  ABG --> Streams[stdout/stderr chunk events]
  ABG --> Liveness[heartbeat/liveness projection]
  ABG --> Signals[timeout/signal/exit events]
  Start --> Projection[process actor projection]
  Streams --> Projection
  Liveness --> Projection
  Signals --> Projection
```

T-099 and T-098 depend on this surface being real enough to make F_P stages and
retry frontier replay-derived rather than downstream-local.

## Required Implementation Wave

1. Define the ABG supervised-process actor carrier and event family.
2. Add stream/process projections over admitted runtime events.
3. Implement TypeScript process supervision with live stdout/stderr writes.
4. Rebind odd_sdlc `process://claude` and node-script worker lanes to the ABG
   process actor seam.
5. Prove deterministic negative and regression cases.
6. Run a Claude lane and show pre-exit stream/process facts in the archive.
7. Request independent STDO/code review before closure.

## Current State

The logical loop ownership defect is fixed: odd_sdlc now uses ABG
`runEngineIterateAsync` for F_P traversal/retry and supplies an effect plugin.
ABG carries the GTL vector edge as dispatch expectation and projects
`priorManifestId` into retry lineage.

The deterministic process actor implementation is now in place:

- ABG exports `invokeSupervisedProcessActor`.
- ABG emits admitted actor/process runtime events for process start, stream
  chunks, heartbeat, timeout, signal, and exit.
- ABG projects process refs, stream refs, running state, latest heartbeat,
  timeout observation, signal sequence, exit status, and error state from
  replay.
- Missing executable or PATH drift no longer crashes event admission: negative
  Node close codes are normalized to `status: null`, with spawn error detail
  preserved in the exit event.
- ABG has deterministic tests for streamed stdout/stderr and timeout signaling.
- ABG has deterministic tests for missing command failure, two-phase
  timeout escalation through `SIGTERM` then `SIGKILL`, and liveness projection.
- odd_sdlc consumes the ABG process actor primitive and no longer owns local
  `spawnSync` worker execution.

Claude's 2026-04-30 closure-readiness review accepted the design and
deterministic implementation, but held closure pending one of:

- an explicit T-094 live-archive citation that proves the same ABG actor seam
  preserved process/stream evidence in a live Claude lane, with the pre-exit
  claim argued from event timeline; or
- a fresh T-097-tagged Claude live archive with named pre-exit
  `worker_stdout.log`, `worker_stderr.log`, actor/process event rows, child
  identity, timeout policy, and final result or typed timeout failure.

The live Claude pre-exit evidence gate is now satisfied by the T-097 live
archive listed below. The external STDO/code review accepted the final patch before the `3.4.0-rc.4` cut.

2026-05-03 supersession note:

- The historical T-097 live archive remains valid evidence for the original
  supervised-process-actor ticket.
- The `test:t097:live` harness and
  `test_env/live/test_t097_supervised_process_actor_live.test.mjs` were removed
  during the T-108/T-109 one-interface refactor because they used the stale
  Claude text-mode process path.
- Current actor/worker call-out proof is owned by
  `runAgentActorWorkerCallout` and `npm run test:t109`, including the migrated
  supervised actor fixture in
  `test_env/tests/test_t109_agent_callout_traced_substrate.test.mjs`.

2026-04-30 refresh:

- `node --test test_env/tests/test_t097_supervised_process_actor.test.mjs`
  passed.
- `npm run test:semantic` passed at `2026-04-30T23:44:12+10:00`: 304 tests,
  0 failed.
- Historical, now superseded:
  `/bin/zsh -ic 'CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=240000 npm run test:t097:live'`
  passed before the later one-interface refactor removed that harness.
- Live archive:
  `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/t097_supervised_process_actor_live/20260430T134349638Z`.
  Evidence includes `worker_process_events.jsonl`, `runtime_projection.json`,
  `worker_stdout.log`, `worker_stderr.log`, `process_result.json`, and
  `result_artifact.json`, plus `assertions.json`.
- Live projection showed `status=0`, `timedOut=false`, 19 actor process events,
  pre-exit heartbeat/liveness, and a stdout stream observation before process
  exit.
- The test includes streamed stdout/stderr, timeout signaling, missing-command
  typed runtime failure evidence, SIGTERM-to-SIGKILL escalation, and liveness
  projection assertions.
- The final implementation was reviewed and accepted before the `3.4.0-rc.4` cut.

2026-04-30 review-response refresh:

- Triage corrected from `design_reframe` to `requirement_reprice` because this
  ticket added the `actor_process_*` runtime event family, not only a
  realization design.
- Live archive postmortems now write `assertions.json` beside preserved
  evidence so archived evidence and proof assertions do not drift.
- T-097 is accepted for the `3.4.0-rc.4` cut. Downstream odd_sdlc live regression proof remains outside this ABG source ticket.

## Closure Disposition

- External STDO/code review accepted the requirement and implementation surface
  before the `3.4.0-rc.4` cut.
- Fresh rc.4 deterministic and Claude live proof passed.
- Downstream odd_sdlc test60-class regression proof remains a downstream
  consumer gate, not an ABG source closure blocker.
