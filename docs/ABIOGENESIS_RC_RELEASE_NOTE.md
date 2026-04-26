# abiogenesis 3.4.0-rc.2 Release Candidate Note

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

The Python tenant remains the released reference line. The TypeScript tenant is
the active RC proving line.

## What Shipped In This Candidate

- `start(...)` delegates to the M03-owned `start -> iterate` runner.
- `publicStart(...)` is a compatibility adapter over `startFromRequest(...)`;
  it no longer owns lower M03 transition, event-construction, or emit law.
- `EnginePluginContract`, `EnginePluginInput`, `EnginePluginOutcome`, and
  `EnginePluginInventoryEntry` classify the current ABG extension seams.
- B-016 is reopened. The current proof covers runner-consumed plugin seams and
  classifies broader hook families without claiming full runtime migration.
- B-010 is blocked until a stable ODD SDLC release exists and is selected as
  the governing source-development substrate.
- M03 forensic traversal probes, bare-edge compute-basis taxonomy, minimum
  typed traversal, graph application instance semantics, and SDLC bootstrap
  lineage proofs are present.
- M05 data-mapper real ingress proof and Python sandbox/live portfolio parity
  proof remain part of the RC evidence chain.
- Documentation and bootstrap surfaces state the current TypeScript RC runtime
  law instead of the older Python-reference-only posture.

## Versioned Artifacts

- RC branch: `rc/3.4.0`
- Candidate package version: `3.4.0-rc.2`
- Prior immutable RC tag: `v3.4.0-rc.2` if already cut before this source
  candidate; otherwise this source state is the candidate for that cut.

## Verification

Current qualification evidence:

```text
npm run test:b016
13 passed

npm run test:t072
14 passed

npm run test:t044
9 passed

npm run test:t066
1 passed

odd_sdlc npm run test:sandbox
5 passed

npm run test:t012
9 passed

npm run test:t013
10 passed

npm run test:semantic
239 passed

npm run test:t064
3 passed

npm run lint:semantic
passed

CODEX_LIVE_FP=1 npm run test:live:uat
tests 2
pass 2
fail 0
duration_ms 53448.786

CODEX_LIVE_FP=1 npm run test:live
1 passed, 0 skipped, duration_ms 153622.118375

git diff --check
passed
```

The live RC portfolio covers five Python live scenario families and twelve real
external-live F_P stages through the TypeScript package surface. The live UAT
lane also includes nonce-bound semantic generation from challenge requirements
into generated UAT cases, then deterministic ABG assessment.

## Current Blocking Non-Claim

B-010 is not part of this RC candidate.

ABG source induction under ODD SDLC governance cannot be actioned until there is
a stable released ODD SDLC candidate selected as the governing product. No root
`.genesis` induction or source-development runtime authority is claimed here.

B-016 is reopened for full ABG hook-family standardization. This RC candidate
claims the corrected TypeScript runner-consumed plugin seams and classified
hook inventory, not completed migration for every broader hook family.

## RC Decision

The current TypeScript ABG source state is RC-candidate ready for review.

It can be cut as an RC when the release operator accepts the current dirty
source state, commits it, and tags the release candidate.
