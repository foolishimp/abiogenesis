# abiogenesis 3.4.0-rc.3 Release Candidate Note

This checkpoint is the current TypeScript ABG release-candidate source state.

It is an RC candidate, not the final tapped `3.4.0` release. The release
identity remains explicit until the cut is committed, tagged, and accepted.

## Release Claim

The TypeScript tenant is now a package-first GTL/ABG RC candidate with:

- graph functions as the constructive program carrier
- ABG-owned `start -> iterate` execution
- governed IoC plugin contracts for extension seams
- replay-derived event, projection, gap, and live-status truth
- installed-package sandbox proof
- real external-live F_P qualification
- updated bootstrap, design, docs, and ticket evidence surfaces

The TypeScript tenant is the primary release line. The Python tenant is paused
as released-reference evidence and is not an active RC gate while
`build_tenants/TENANT_REGISTRY.md` keeps it paused.

## What Shipped In This Candidate

- `start(...)` delegates to the M03-owned `start -> iterate` runner.
- `publicStart(...)` is a compatibility adapter over `startFromRequest(...)`;
  it no longer owns lower M03 transition, event-construction, or emit law.
- `EnginePluginContract`, `EnginePluginInput`, `EnginePluginOutcome`, and
  `EnginePluginInventoryEntry` classify the current ABG extension seams.
- GTL declarations now expose assurance hook refs for authority snapshots,
  evidence adaptation, ambiguity classification, closure policy, and gain
  function adaptation.
- ABG admits those hook refs through governed plugin contracts. Plugins provide
  domain data or decisions to ABG; they do not emit events, select vectors, or
  close traversals directly.
- Payloads that affect authority, evidence, traversal, or closure pass through
  ABG admission and the event-sourced payload ledger. Downstream read models and
  lifecycle registers are projections over admitted events.
- The TypeScript proof line includes total assurance projection, closure-fold
  gating, two-hop assurance-register deepening, supervised actor observation,
  and event-sourced payload-ledger proof.
- B-010 is blocked until a stable ODD SDLC release exists and is selected as
  the governing source-development substrate.
- M03 forensic traversal probes, bare-edge compute-basis taxonomy, minimum
  typed traversal, graph application instance semantics, and SDLC bootstrap
  lineage proofs are present.
- M05 data-mapper real ingress proof remains part of the RC evidence chain.
  Historical Python sandbox/live portfolio proof remains reference evidence,
  not TS-primary release authority.
- Documentation and bootstrap surfaces state the current TypeScript RC runtime
  law instead of the older Python-reference-only posture.

## Versioned Artifacts

- RC branch: `rc/3.4.0`
- Candidate package version: `3.4.0-rc.3`
- Candidate tag: `v3.4.0-rc.3`

## Verification

Current qualification evidence for this cut:

```text
npm run test:t076
4 passed, duration_ms 4310.658167

npm run test:semantic
291 passed, duration_ms 4823.088125

npm run lint:semantic
passed

npm run lint:test-harness
passed

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:t094:live
1 passed, duration_ms 11357.336375
archive: test_env/test_runs/t094_assurance_register_two_hop_live/20260429T152742308Z

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:live:uat
2 passed, duration_ms 32388.037125
latest semantic archive: test_env/test_runs/typescript_rc_live/requirements_to_uat/2026-04-29T153039592Z

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=360000 npm run test:live
1 passed, duration_ms 75197.459708
archive: test_env/test_runs/typescript_rc_live_portfolio/2026-04-29T153442846Z

npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
passed, version 3.4.0-rc.3, files 294

git diff --check
passed
```

The live RC portfolio uses the Claude live lane for F_P dispatch evidence. The
release does not use Codex live lanes for this cut. Live LLM gates were run
outside the Codex sandbox because sandboxed subprocesses cannot reach the
Claude API.

## Current Blocking Non-Claim

B-010 is not part of this RC candidate.

ABG source induction under ODD SDLC governance cannot be actioned until there is
a stable released ODD SDLC candidate selected as the governing product. No root
`.genesis` induction or source-development runtime authority is claimed here.

The active STDO assurance/payload tranche remains review-gated. This RC
candidate records an operator-directed cut of the TypeScript primary release
source state; it does not self-close T-086, T-090, T-091, T-092-TS, T-093-TS,
T-094, T-095, T-095-TS, or T-096.

## RC Decision

The release operator has requested an RC cut. This tag is a release-candidate
checkpoint, not the final tapped `3.4.0` release and not a claim that the active
STDO tickets are closed.
