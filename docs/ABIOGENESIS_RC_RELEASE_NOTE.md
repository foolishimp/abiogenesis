# abiogenesis 3.7.1-rc.1 Release Candidate Note

This checkpoint is the current TypeScript ABG release-candidate source state.
It advances the release line from `3.7.0-rc.1` to `3.7.1-rc.1` because T-129
adds ABG system probe observer liveness law.

The `3.7.0-rc.1` line introduced the generic F_P construction evaluator and
read-only public gaps over evaluator truth. This `3.7.1-rc.1` candidate
preserves that evaluator substrate and adds the runtime liveness observer
needed to keep long-running constructive work governed by admitted activity
rather than flat caller-local timeouts.

It is an RC candidate, not the final tapped `3.7.1` release. The release
identity remains explicit until the cut is committed, tagged, and accepted.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. This cut
preserves the accepted `3.7.0-rc.1` evaluator substrate and adds the generic
runtime probe observer as the first `3.7.1` release candidate.

RC1 for `3.7.1` adds:

- `RuntimeSystemProbeContract` as the declared probe contract for ABG-known
  runtime systems and runtime asset surfaces;
- `runtime_activity_probe_observed` as raw activity evidence that does not own
  retry, block, traversal, or closure decisions;
- `RuntimeLivenessObserverProjection` as the one replay-derived liveness and
  disposition surface;
- admitted activity reset semantics across stdout, stderr, PTY transcript,
  heartbeat, structured stream, event-log, ledger, manifest, archive,
  projection/report, artifact, and graph-call/frame activity;
- hard safety cap handling that requires typed external interruption evidence
  and cannot become final retry/block/failure authority by itself;
- supervised actor probe emission for stdout, stderr, heartbeat, timeout,
  signal, and external interruption paths;
- deterministic proof that admitted sensor activity resets an otherwise expired
  inactivity lease back to active waiting.

## Non-Claims

The T-129 liveness observer slice does not claim downstream product adoption as
ABG substrate closure. Downstream products such as odd_sdlc consume or relay
the ABG liveness projection through their own migration tickets.

The T-127/T-128 split remains intact. T-127 owns the construction evaluator
substrate; T-128 owns the installed runner-level loop that consumes admitted
construction intent and invokes graph work recursively.

The 3.7 RC line also does not claim recurrence, window policy, cloud durable
provider integration, sticky-session reuse, warm agent pools, or automatic
session affinity. Those remain outside this cut unless separately ticketed.

## Versioned Artifacts

- RC branch: `rc/3.7.1`
- RC identity: `3.7.1-rc.1`
- Candidate package version: `3.7.1-rc.1`
- Candidate tag: `v3.7.1-rc.1`

## Verification

Current qualification evidence for this cut:

```text
npm run test:t129
11 passed

npm run test:semantic
488 passed

git diff --check
passed

npm_config_cache=/tmp/abg-npm-cache npm pack --dry-run
passed, version 3.7.1-rc.1, files 329, package abiogenesis-typescript-tenant-3.7.1-rc.1.tgz
```

The previous `3.7.0-rc.1` construction evaluator proof remains historical
release evidence for the evaluator substrate preserved by this line.

## RC Decision

The release operator repriced the ABG system probe observer liveness law as a
patch release-candidate over the accepted `3.7.0-rc.1` evaluator line. Cut
`v3.7.1-rc.1` as the next release-candidate checkpoint after committing this
source state. This is not the final tapped `3.7.1` release.
