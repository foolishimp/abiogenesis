# abiogenesis 3.9.0-rc.9 Release Candidate Note

This checkpoint is the ninth TypeScript ABG `3.9.0` release candidate. It
follows `3.9.0-rc.8` with a focused retry-frontier replay correction found by
the odd_sdlc T-188 data_mapper-lite lifecycle proof.

It is an RC candidate, not the final tapped `3.9.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC9 keeps
the staged compute runtime law, runtime-authority wiring, supervised PTY worker
topology, heartbeat/progress separation, and owner-exit cleanup from prior RCs.
It then fixes retry-frontier replay for runtime stops that occur before an
admitted retry attempt opens.

RC9 adds:

- retry-frontier handling for `retry_attempt_stopped` and
  `retry_attempt_escalated` events whose `observedAttemptCount` is `0`;
- projection rows for those events use `attemptIndex=null`, because retry
  attempt indexes are one-based and zero means no attempt opened;
- full-frontier assertion ignores nonpositive attempt indexes when checking
  attempt coverage;
- a focused T-098 regression proving a zero-attempt stop remains admitted retry
  evidence but does not create fake attempt coverage; and
- package version advancement to `3.9.0-rc.9` for downstream consumers that need
  the corrected retry-frontier replay behavior.

## Boundary

This is ABG runtime replay law. It does not add odd_sdlc, data_mapper,
JavaScript, SBT, or other downstream product vocabulary to ABG. Downstream
products continue to consume replay-derived retry frontier truth instead of
locally deriving generic retry coverage.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `3.9.0-rc.9`
- Candidate package version: `3.9.0-rc.9`
- Candidate tag: `v3.9.0-rc.9`

## Verification

Current qualification evidence for this cut:

```text
npm run build:semantic
passed

npm run test:t098
3 passed

npm run test:semantic
passed

git diff --check
passed

npm pack --dry-run
passed, package `3.9.0-rc.9`, 388 entries
```

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

RC9 is the retry-frontier zero-attempt replay candidate. It prevents a runtime
stop before retry attempt opening from being replayed as fake retry attempt
coverage while preserving the stop as admitted retry evidence.
