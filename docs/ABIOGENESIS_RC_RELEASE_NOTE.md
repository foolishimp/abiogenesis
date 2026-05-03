# abiogenesis 3.4.0-rc.6 Build 20260503.1 Release Candidate Note

This checkpoint is the current TypeScript ABG release-candidate source state.
It keeps the RC identity at `3.4.0-rc.6` and publishes build
`20260503.1` as the package/tag build identifier.

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
- ABG-owned output allocation, workspace zoom/foldback, eval-suite projection,
  mini data-mapper semantic sandbox, graph-span reentry frontier substrate, and
  explicit W1 input workspace to W2 output workspace allocation

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
- T-082/T-100/T-101/T-102/T-103 close the ABG substrate for:
  - input-only output allocation with write-root containment
  - workspace-visible obligation ledgers, schedules, and foldback evaluation
  - a mini data-mapper semantic eval sandbox with F_D/F_P separation
  - eval-suite projection artifacts with repeated-trial evidence
  - graph-span foldback and replay-derived lawful reentry
- T-104 extends output allocation to explicit cross-workspace graph-function
  starts. `StartRequestedOutput.outputWorkspace` admits W2 authority, allocation
  materializes under W2, and manifests/events/projections preserve both W1 input
  lineage and W2 output lineage.
- The mini data-mapper redux sandbox now supports separate output workspaces and
  the T-104 forensic lane reruns multiple deterministic review streams, compares
  edge-by-edge semantic fingerprints, and writes `forensic_analysis.json` /
  `forensic_analysis.md` under `test_env/test_runs`.
- T-100 now carries the test35-derived five-rule parity surface: named
  five-term closure predicate, latest-assessed-per-slice projection, typed
  retry allowlist, artifact salvage, and behavioral-vs-lexical finding class.
- T-103 wires graph-span reentry into the runner while preserving the
  constitutional boundary: the runner consumes admitted F_P span evidence and
  never produces graph-span assessment truth itself.
- T-106 adds typed traversal non-progress continuation truth for blocked
  no-artifact F_P attempts. ABG now derives one replay-visible
  `TraversalNonProgressCarrier`, projects one
  `TraversalContinuationActionProjection`, enforces summary/action agreement,
  and wires the projection into the blocked F_P runner path without letting the
  runner own semantic judgment.
- T-105 closes the RC.6 cross-surface consistency loop for builder-facing docs,
  bootstrap, and operator-facing stale-reference cleanup.

## Versioned Artifacts

- RC branch: `rc/3.4.0`
- RC identity: `3.4.0-rc.6`
- Build identifier: `20260503.1`
- Candidate package version: `3.4.0-rc.6+build.20260503.1`
- Candidate tag: `v3.4.0-rc.6+build.20260503.1`

## Verification

Current qualification evidence for this cut:

```text
npm run test:t082
6 passed

npm run lint:semantic
passed

npm run test:semantic
368 passed

npm run test:t106
14 passed

git diff --check
passed

npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
passed, version 3.4.0-rc.6+build.20260503.1, files 310, package abiogenesis-typescript-tenant-3.4.0-rc.6+build.20260503.1.tgz
```

The retained rc.4 live gates remain prior external-live evidence for the
package line. The rc.6 tranche adds deterministic semantic, sandbox, and
test35-parity proof for the ABG ledger/reentry substrate. Build 20260503.1
adds T-106 no-progress continuation proof and preserves the T-103 graph-span
reentry boundary. T-101 includes a Codex live worker path pinned through the
shared transport contract to `gpt-5.3-codex`; live execution remains
operator-enabled.

## Current Blocking Non-Claim

B-010 is not part of this RC candidate.

ABG source induction under ODD SDLC governance cannot be actioned until there is
a stable released ODD SDLC candidate selected as the governing product. No root
`.genesis` induction or source-development runtime authority is claimed here.

The ABG-layer STDO assurance/payload/process-actor tranche has passed review
for this RC cut. Downstream odd_sdlc regression proof for the test60-class
consumer bugs remains a separate downstream gate and is not claimed by this ABG
source RC.

## RC Decision

The release operator has requested an RC6 build cut. This tag is a
release-candidate build checkpoint, not a new RC and not the final tapped
`3.4.0` release.
