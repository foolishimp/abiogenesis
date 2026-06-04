# abiogenesis 3.9.0-rc.10 Release Candidate Note

This checkpoint is the tenth TypeScript ABG `3.9.0` release candidate. It
follows `3.9.0-rc.9` with the T-148 runtime continuation-transition projection
needed by downstream ODD consumers to stop re-deriving retry/block/yield state
from local pressure strings.

It is an RC candidate, not the final tapped `3.9.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC10 keeps
the staged compute runtime law, runtime-authority wiring, supervised PTY worker
topology, heartbeat/progress separation, owner-exit cleanup, and retry-frontier
zero-attempt correction from prior RCs. It adds one replay-derived ABG
continuation-transition projection for mixed continuation, retry, liveness,
assurance, and terminal fallback facts.

RC10 adds:

- `REQ-R-ABG3-PROJECTION-019`, requiring a single replay-derived continuation
  transition projection at the active traversal boundary;
- `RuntimeContinuationTransitionProjection`, a total fail-closed carrier that
  selects `close`, `retry_same_edge`, `yield_continuation`,
  `inspect_runtime_archive`, `reprice`, or `block`;
- priority law where typed admitted runtime facts and assurance fold outcomes
  outrank terminal retry fallback refs;
- runner wiring so the supervised F_P no-artifact path consumes the projection
  before deriving retry events or terminal transitions;
- a focused T-148 suite proving fallback demotion, assurance/traversal folding,
  terminal conversion, and runner-path consumption; and
- package version advancement to `3.9.0-rc.10` for downstream consumers.

## Boundary

This is ABG runtime projection and continuation law. It does not add odd_sdlc,
data_mapper, JavaScript, SBT, review-grade, triage-gap, or other downstream
product vocabulary to ABG. Downstream products consume or map over the generic
projection; they do not own a rival continuation state machine.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `3.9.0-rc.10`
- Candidate package version: `3.9.0-rc.10`
- Candidate tag: `v3.9.0-rc.10`

## Verification

Current qualification evidence for this cut:

```text
npm run build:semantic
passed

npm run test:t148
5 passed

npm run test:t106
14 passed

npm run test:t147
7 passed

npm run test:semantic
664 passed

git diff --check
passed
```

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

RC10 is the runtime continuation-transition projection candidate. It prevents
terminal retry fallback evidence from outranking typed block, reprice, yield,
assurance, or runtime no-progress facts at the ABG substrate boundary.
