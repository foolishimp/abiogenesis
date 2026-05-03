# abiogenesis 3.5.0-rc.1 Release Candidate Note

This checkpoint is the current TypeScript ABG release-candidate source state.
It advances the RC identity from `3.4.0-rc.8` to `3.5.0-rc.1`.

It is an RC candidate, not the final tapped `3.5.0` release. The release
identity remains explicit until the cut is committed, tagged, and accepted.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. This cut
adds a universal traced agent call-out substrate and a robust per-call PTY
executor profile for framework-owned `agent.actor` and `agent.worker`
invocations.

The TypeScript tenant is the primary release line. The Python tenant remains
paused as released-reference evidence and is not an active RC gate while
`build_tenants/TENANT_REGISTRY.md` keeps it paused.

## What Shipped In This Candidate

The 3.5.0-rc.1 tranche accepts T-108, T-109, and T-111 as ABG substrate:

- T-108 introduced the traced-process substrate for live worker observability.
  Worker call-outs now preserve command metadata, raw stdout/stderr, structured
  Claude stream-json events, final output, timeout state, and trace archive
  paths instead of collapsing failures into opaque `0/0/143` style evidence.
- T-109 made `runAgentActorWorkerCallout` the single framework-owned call-out
  interface for `agent.actor` and `agent.worker` execution. Agent transport and
  supervised actor invocation consume that one interface. Direct framework
  shell-out paths are guarded by a semantic test.
- T-111 added typed executor selection with `local-spawn` and `pty-terminal`
  profiles. `local-spawn` remains the deterministic default. `pty-terminal` is
  a Docker-compatible GNU `screen` backed per-call terminal executor that writes
  a terminal transcript while preserving the same per-call trace archive
  contract.
- `ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal` selects the PTY executor across
  `runAgentTransport` and `invokeSupervisedProcessActor` when a request does not
  provide an explicit executor profile.
- Claude `stream-json` parsing is proven over PTY transcript slices, including
  long JSONL result lines.
- PTY hard timeout and inactivity timeout paths produce explicit
  terminal-session evidence.
- The data-mapper live evaluator was hardened so live tests validate semantic
  equivalence rather than exact response text shape for age calculation.

Sticky session reuse and agent pooling are not part of rc.8. T-110 remains a
future optimization over the now-proven executor seam.

## Versioned Artifacts

- RC branch: `rc/3.5.0`
- RC identity: `3.5.0-rc.1`
- Candidate package version: `3.5.0-rc.1`
- Candidate tag: `v3.5.0-rc.1`

## Verification

Current qualification evidence for this cut:

```text
npm run test:t109
7 passed

npm run test:t111
4 passed

npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
passed, version 3.5.0-rc.1, files 318, package abiogenesis-typescript-tenant-3.5.0-rc.1.tgz
```

Fresh external-live PTY evidence before the metadata-only version cut:

```text
CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t101
2 passed

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t107:data-mapper-live
1 passed

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t094:live
1 passed

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t087:live
1 passed

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t100:five-rule
6 passed

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:live:uat
2 passed

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_AGENT_EXECUTOR_PROFILE=pty-terminal ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:live
1 passed
```

The live transport summaries record `executorProfile: "pty-terminal"`,
`status: 0`, `apiRetryCount: 0`, and `toolCallCount: 0` across the inspected
T-087, T-094, T-100, T-101, T-107, M05 UAT, and M05 portfolio agent call-outs.

## Current Blocking Non-Claim

B-010 is not part of this RC candidate.

ABG source induction under ODD SDLC governance cannot be actioned until there is
a stable released ODD SDLC candidate selected as the governing product. No root
`.genesis` induction or source-development runtime authority is claimed here.

Sticky-session reuse, warm agent pools, and automatic session affinity are not
part of this RC candidate. They remain future T-110 work.

## RC Decision

The release operator accepted the T-108/T-109/T-111 call-out and PTY executor
substrate after live PTY proof. Cut `v3.5.0-rc.1` as a release-candidate
checkpoint. This is not the final tapped `3.5.0` release.
