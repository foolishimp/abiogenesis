---
id: T-113
title: Fix PTY screen capability probe on local macOS screen
status: completed
change_class: realization_refactor
created_at: 2026-05-05T00:00:00+10:00
updated_at: 2026-05-06T02:11:39+10:00
owning_repo: abiogenesis
affected_boundary:
  - build_tenants/abiogenesis/typescript/code/src/shared/traced_process/index.ts
evidence_refs:
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test70.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260505T105934065Z_pid32102
related_tickets:
  - T-111
---

# T-113 Fix PTY screen capability probe on local macOS screen

## Problem

The ABG `pty-terminal` executor failed before invoking Claude:

```text
executor_unavailable: screen_shell_unavailable
screen started but /bin/sh did not write the capability probe marker
```

Evidence came from the test70 Claude run using `ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE=pty-terminal`.

The local `screen` binary is present, and a simple detached shell session starts. The current capability probe is too brittle for this local `screen` behavior, so the PTY backend is unavailable even though a usable terminal primitive may exist.

## Lawful re-entry

`realization_refactor`.

The PTY executor design remains valid. The defect is in capability probing / compatibility handling for the local `screen` backend.

## Required behavior

- The capability probe must distinguish `screen_missing`, shell invocation incompatibility, marker timing, and actual screen session failure.
- The probe must not reject a viable `screen` installation because of brittle argument passing or too-short marker polling.
- If the local `screen` backend is truly incompatible, the result must carry a precise typed reason and recommended executor fallback.

## Closure evidence

- Add a deterministic probe test or fixture around the local `screen` invocation shape.
- Re-run a PTY-backed worker lane and prove either successful PTY execution or a sharper typed incompatibility reason.


## 2026-05-05 no-silent-fallback sharpening

Operator finding: PTY failure must not be hidden by continuing with `local-spawn` as if the requested terminal executor were active.

Required invariant:

- `pty-terminal` requested means the worker run uses `executorProfile: "pty-terminal"`, `streamModel: "terminal-transcript"`, and a non-null `terminalSessionId`.
- If PTY cannot start, the run returns `executor_unavailable` / `worker_executor_unavailable` with evidence, not an implicit local-spawn run.
- Local-spawn may still be used only when explicitly selected or when it is the declared default for a non-PTY run.

Implementation note:

- The macOS screen probe was brittle because the marker-writing shell exited immediately. The probe now keeps the screen command alive briefly after writing the marker so old GNU screen has time to create the session and flush the marker.

## 2026-05-05 live PTY Claude actor/worker proof

Added a focused live lane:

```text
npm run test:t113:live
```

The script forces:

```text
CODEX_LIVE_FP=1
ABG_TS_LIVE_AGENT=claude
ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal
```

Latest local result:

```text
1 passed
```

Evidence summary:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T132531200Z/summary.json
```

The lane starts real `claude` twice through the PTY executor:

- `worker.claude` through `runAgentActorWorkerCallout(agent_worker)`
- `actor.claude` through `invokeSupervisedProcessActor(agent_actor)`

Both traces assert `executorProfile: "pty-terminal"`, `streamModel: "terminal-transcript"`, non-empty `terminalSessionId`, terminal-session lifecycle events, and PTY transcript sentinel evidence. This closes the no-silent-fallback live proof gap; deterministic failure-path coverage for typed `screen_shell_unavailable` remains a separate regression requirement if the probe is refactored again.

## 2026-05-06 closure verification

Status: completed.

Commands run:

```text
npm run build:semantic
npm run lint:semantic
npm run lint:test-harness
npm run test:t111
npm run test:t097
npm run test:t115
npm run test:t113:live
npm run test:t116:live
```

Latest live matrix proof:

```text
build_tenants/abiogenesis/typescript/test_env/test_runs/t113_live_pty_claude_actor_worker/20260505T161759398Z/summary.json
```

The latest live lane proves the requested PTY executor directly. It records
`executorProfile: "pty-terminal"`, `streamModel: "terminal-transcript"`,
terminal session ids, terminal transcript sentinels, and no silent fallback to
`local-spawn`.

## 2026-05-06 review feedback repair

External review found that successful PTY actor runs preserved the terminal
session id in trace artifacts but not in ABG runtime event/projection truth.

Repair:

- `ActorProcessStartedEvent` now carries `terminalSessionId`.
- `invokeSupervisedProcessActor` receives the traced process terminal session id
  through the process-start callback and emits it on the successful start event.
- runtime projection now prefers the successful start event terminal session id
  and falls back to start-failure terminal id only for failed starts.
- T-097 and T-113 assertions now prove successful PTY terminal id projection.
