# abiogenesis 3.6.0-rc.1 Release Candidate Note

This checkpoint is the current TypeScript ABG release-candidate source state.
It advances the release line from `3.5.0-rc.2` to `3.6.0-rc.1` because the
temporal GTL/ABG slice adds new language and runtime capability.

It is an RC candidate, not the final tapped `3.6.0` release. The release
identity remains explicit until the cut is committed, tagged, and accepted.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. This cut
preserves the accepted `3.5.0-rc.2` substrate and adds the temporal GTL/ABG
wave as the first `3.6.0` release candidate.

RC1 for `3.6.0` adds:

- explicit ABG Event Calculus law for admitted runtime events and replay-derived
  `HoldsAt` truth;
- GTL temporal syntax through `GraphVector.declarations["abg.temporal_constraint"]`;
- ABG temporal carriers and events for timer intent, timer outcome, deadline
  breach, and scheduled continuation;
- replay-derived temporal projection rows for eligibility and deadline breach
  truth;
- separate homeostatic schedule/deadline pressure over replay-derived temporal
  rows, without letting time close or advance graph traversal directly;
- live temporal and non-temporal GTL proof lanes.

## Non-Claims

The temporal slice does not claim recurrence, window policy, cloud durable
provider integration, sticky-session reuse, warm agent pools, or automatic
session affinity.

T-126 owns post-proof temporal runtime-scope and projection-row consolidation.

## Versioned Artifacts

- RC branch: `rc/3.6.0`
- RC identity: `3.6.0-rc.1`
- Candidate package version: `3.6.0-rc.1`
- Candidate tag: `v3.6.0-rc.1`

## Verification

Current qualification evidence for this cut:

```text
npm run build:semantic
passed

npm run lint:semantic
passed

npm run lint:test-harness
passed

npm run test:t087
4 passed

npm run test:t097
5 passed

npm run test:t106
14 passed

npm run test:t111
4 passed

npm run test:t115
6 passed

npm run test:t116
5 passed

npm run test:t117
8 passed

npm run test:t119
17 passed

npm run test:t120
4 passed

npm run test:t121
4 passed

npm run test:t122
5 passed

npm run test:t123
6 passed

npm run test:t119:live
3 passed

npm run test:t125:live
2 passed

npm run test:t116:live
1 passed

git diff --check
passed

npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
passed, version 3.6.0-rc.1, files 325, package abiogenesis-typescript-tenant-3.6.0-rc.1.tgz
```

Fresh 3.6.0 temporal live proof:

```text
npm run test:t119:live
npm run test:t125:live
```

The live lanes prove:

```text
temporal GTL graph function admits eligibility only after ABG timer outcome
non-temporal GTL graph function remains admissible without temporal syntax
provider receipt does not authorize temporal eligibility before ABG admission
```

The previous `3.5.0-rc.2` PTY/plugin observer live proof remains historical
release evidence for the substrate preserved by this line.

## RC Decision

The release operator repriced temporal capability as a minor release-line move.
Cut `v3.6.0-rc.1` as a release-candidate checkpoint after live temporal proof.
This is not the final tapped `3.6.0` release.
