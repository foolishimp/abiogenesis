# abiogenesis 3.9.0-rc.11 Release Candidate Note

This checkpoint is the eleventh TypeScript ABG `3.9.0` release candidate. It
follows `3.9.0-rc.10` with the T-149 iteration state-action consolidation: one
fold-owned transition surface for per-boundary iteration outcomes.

It is an RC candidate, not the final tapped `3.9.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC11 keeps
the staged compute runtime law, runtime-authority wiring, supervised worker
topology, heartbeat/progress separation, retry-frontier correction, and
continuation-transition projection from prior RCs. It adds the simplified ABG
iteration algebra that collapses local retry, closure, continuation, re-entry,
liveness, and attached-worker terminalization decisions onto one typed
state-action fold.

RC11 adds:

- `REQ-R-ABG3-ITERATION`, defining one total iteration state-action algebra at
  the active traversal boundary;
- `IterationOutcome`, with primitive outcomes `terminate`, `redispatch`, and
  `suspend` over existing `GraphReentryPoint` and target-vector vocabulary;
- explicit lifecycle filtering so superseded evidence cannot become orphan
  pressure and preserved rebased evidence can continue to satisfy closure;
- binding-guard diagnostics for true orphan authority/evidence rows;
- fold-backed adapters for assurance, traversal non-progress, graph-span
  re-entry, runtime liveness, continuation projection, and attached F_P worker
  terminal paths;
- guard coverage preventing migrated transition surfaces from owning local
  outcome tables; and
- package version advancement to `3.9.0-rc.11` for downstream consumers.

## Boundary

This is ABG runtime iteration and continuation law. It does not add odd_sdlc,
data_mapper, JavaScript, review-grade, triage-gap, or other downstream product
vocabulary to ABG. Downstream products may map their domain reasons into the
generic ABG facts; they do not own a rival iteration state machine.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `3.9.0-rc.11`
- Candidate package version: `3.9.0-rc.11`
- Candidate tag: `v3.9.0-rc.11`

## Verification

Current qualification evidence for this cut:

```text
npm run build:semantic
passed

npm run test:t149
12 passed

npm run test:semantic
676 passed

git diff --check
passed
```

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

RC11 is the iteration state-action algebra candidate. It prevents scattered
runtime surfaces from re-deriving close, retry, block, yield, re-entry, and
terminal fallback decisions outside the single ABG fold.
