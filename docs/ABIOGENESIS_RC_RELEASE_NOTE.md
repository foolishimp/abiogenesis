# abiogenesis 3.7.0-rc.1 Release Candidate Note

This checkpoint is the current TypeScript ABG release-candidate source state.
It advances the release line from `3.6.0-rc.1` to `3.7.0-rc.1` because the
F_P consciousness evaluator slice changes the public construction model:
public gaps is now a read-only evaluator view over typed asset truth, lawful
graph actions, configured priority, and replay-derived progress.

It is an RC candidate, not the final tapped `3.7.0` release. The release
identity remains explicit until the cut is committed, tagged, and accepted.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. This cut
preserves the accepted `3.6.0-rc.1` temporal/Event Calculus substrate and adds
the generic F_P construction evaluator as the first `3.7.0` release candidate.

RC1 for `3.7.0` adds:

- a typed construction-evaluator carrier chain:
  `ConstructionObservationSnapshot`,
  `ConstructionActionCatalogProjection`,
  `ObservationToActionBindingProjection`, and
  `ConstructionPriorityProjection`;
- read-only public gaps over that evaluator projection, with no event append,
  intent admission, graph dispatch, or retry authority in M04 gaps;
- configured construction priority and affect policy admission through M03
  before public rendering;
- GTL hook precedence across GraphVector, GraphFunction, Job, Role, Module,
  and visible fallback config;
- bootstrap typed-asset induction as a lawful construction action over sparse
  replay state;
- construction runtime event and Event Calculus support for progress,
  stagnation, terminal dispositions, and closed construction episodes;
- scenario proof for configured priority, hook-derived priority, missing input
  blockers, bootstrap induction, and recursive progress/stagnation replay.

## Non-Claims

The T-127 slice does not claim the installed runner-level recursive loop that
consumes an admitted construction intent and invokes graph work. T-128 owns
that runtime execution slice.

The 3.7 RC also does not claim recurrence, window policy, cloud durable
provider integration, sticky-session reuse, warm agent pools, or automatic
session affinity. Those remain outside this cut unless separately ticketed.

## Versioned Artifacts

- RC branch: `rc/3.7.0`
- RC identity: `3.7.0-rc.1`
- Candidate package version: `3.7.0-rc.1`
- Candidate tag: `v3.7.0-rc.1`

## Verification

Current qualification evidence for this cut:

```text
npm run test:t127
33 passed

npm run test:t058
11 passed

npm run test:t127:live
6 passed

npm run test:semantic
477 passed

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live
1 passed

CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:live:uat
2 passed

git diff --check
passed

npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
passed, version 3.7.0-rc.1, files 327, package abiogenesis-typescript-tenant-3.7.0-rc.1.tgz
```

The previous `3.6.0-rc.1` temporal live proof remains historical release
evidence for the substrate preserved by this line.

## RC Decision

The release operator repriced the F_P consciousness evaluator from a patch
candidate to a minor release-line move. Cut `v3.7.0-rc.1` as the next
release-candidate checkpoint after committing this source state. This is not
the final tapped `3.7.0` release.
