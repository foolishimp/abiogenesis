# abiogenesis 3.4.0-rc.7 Release Candidate Note

This checkpoint is the current TypeScript ABG release-candidate source state.
It advances the RC identity from `3.4.0-rc.6` to `3.4.0-rc.7`.

It is an RC candidate, not the final tapped `3.4.0` release. The release
identity remains explicit until the cut is committed, tagged, and accepted.

## Release Claim

The TypeScript tenant is now a package-first GTL/ABG RC candidate with:

- graph functions as the constructive program carrier
- ABG-owned `start -> iterate` execution
- governed IoC plugin contracts for extension seams
- replay-derived event, projection, gap, and live-status truth
- installed-package sandbox proof
- real external-live F_P qualification evidence from prior RC lanes
- updated bootstrap, design, docs, and ticket evidence surfaces
- ABG-owned output allocation, workspace zoom/foldback, eval-suite projection,
  mini data-mapper semantic sandbox, graph-span reentry frontier substrate,
  explicit W1 input workspace to W2 output workspace allocation, typed
  traversal non-progress continuation, and GTL-qualified traversal modulation

The TypeScript tenant is the primary release line. The Python tenant is paused
as released-reference evidence and is not an active RC gate while
`build_tenants/TENANT_REGISTRY.md` keeps it paused.

## What Shipped In This Candidate

- `start(...)` delegates to the M03-owned `start -> iterate` runner.
- `publicStart(...)` is a compatibility adapter over `startFromRequest(...)`;
  it no longer owns lower M03 transition, event-construction, or emit law.
- `EnginePluginContract`, `EnginePluginInput`, `EnginePluginOutcome`, and
  `EnginePluginInventoryEntry` classify the current ABG extension seams.
- GTL declarations expose assurance and traversal-modulation hook refs through
  governed declaration surfaces.
- ABG admits those hook refs through governed plugin contracts. Plugins provide
  domain data or decisions to ABG; they do not emit events, select vectors, or
  close traversals directly.
- Payloads that affect authority, evidence, traversal, or closure pass through
  ABG admission and the event-sourced payload ledger. Downstream read models and
  lifecycle registers are projections over admitted events.
- T-082/T-100/T-101/T-102/T-103/T-104 close the ABG substrate for output
  allocation, workspace-visible obligation ledgers/schedules, semantic eval
  sandboxing, eval-suite projection, graph-span foldback/reentry, and
  cross-workspace output allocation.
- T-106 adds typed traversal non-progress continuation truth for blocked
  no-artifact F_P attempts. ABG derives one replay-visible
  `TraversalNonProgressCarrier`, projects one
  `TraversalContinuationActionProjection`, enforces summary/action agreement,
  and wires the projection into the blocked F_P runner path without letting the
  runner own semantic judgment.
- T-107 adds GTL-qualified traversal modulation for agentic F_P attempts. ABG
  derives `TraversalModulationProfile` and `TraversalAttemptEnvelope` from
  explicit qualifier truth, passes the envelope to `EnginePluginInput`, emits
  the replay-visible modulation event spine, and uses one shared dispatch
  attempt derivation path across `runEngineIterate` and
  `runEngineIterateAsync`.
- T-107 preserves the F_P/F_D boundary: modulation constrains schedule,
  ordering, phase gates, progress artifact requirements, retry budget, backend
  progress interpretation, and forced-review pressure; it does not decide
  semantic fulfillment.
- T-107 keeps downstream strategy meaning above ABG. ABG enforces generic
  scheduling primitives and admitted refs without switching on product labels
  such as steel-thread or waterfall.

## Versioned Artifacts

- RC branch: `rc/3.4.0`
- RC identity: `3.4.0-rc.7`
- Candidate package version: `3.4.0-rc.7`
- Candidate tag: `v3.4.0-rc.7`

## Verification

Current qualification evidence for this cut:

```text
npm run test:t107
15 passed

npm run test:t106
14 passed

npm run test:semantic
383 passed

npm run lint:semantic
passed

npm run lint:test-harness
passed

git diff --check
passed

npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
passed, version 3.4.0-rc.7, files 312, package abiogenesis-typescript-tenant-3.4.0-rc.7.tgz
```

The retained prior live gates remain external-live evidence for the package
line. The rc.7 tranche adds deterministic substrate proof for traversal
modulation and sync/async runner parity. Live Claude/Codex T-107-specific
backend parity remains an operator-enabled proof lane above this source cut.

## Current Blocking Non-Claim

B-010 is not part of this RC candidate.

ABG source induction under ODD SDLC governance cannot be actioned until there is
a stable released ODD SDLC candidate selected as the governing product. No root
`.genesis` induction or source-development runtime authority is claimed here.

Downstream odd_sdlc prompt/manifest consumption of T-107 envelopes, data-mapper
product parity, and any future `test:t107:live` harness are downstream or
release proof obligations above the ABG substrate. They are not claimed by this
ABG source RC.

## RC Decision

The release operator accepted T-107 after STDO review. Cut `v3.4.0-rc.7` as a
release-candidate checkpoint. This is not the final tapped `3.4.0` release.
