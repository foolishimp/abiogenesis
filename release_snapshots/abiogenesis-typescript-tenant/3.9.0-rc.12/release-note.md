# abiogenesis 3.9.0-rc.12 Release Candidate Note

This checkpoint is the twelfth TypeScript ABG `3.9.0` release candidate. It
follows `3.9.0-rc.11` with the T-150 GTL typed asset surface descent for
renderer-backed prompt invocation assets.

It is an RC candidate, not the final tapped `3.9.0` release.

## Release Claim

The TypeScript tenant remains the package-first GTL/ABG RC candidate. RC12 keeps
the staged compute runtime law, T-149 iteration state-action algebra, runtime
authority wiring, supervised worker topology, heartbeat/progress separation,
retry-frontier correction, and continuation-transition projection from prior
RCs. It adds the GTL substrate shape needed for downstream prompt-as-code assets
without importing downstream prompt policy into GTL.

RC12 adds:

- `REQ-L-GTL3-ASSET-SURFACE`, defining richer subordinate `AssetSurface` truth
  for renderer-backed typed assets;
- generic `AssetSurfaceAuthoritySlot` declarations with opaque authority-kind
  refs, generic disposition labels, and fallback precondition refs;
- constructor, admission, and serialization support for constructor refs,
  input asset kinds, renderer refs, rendered-view digest policy, section and
  clause kind refs, authority slots, and proof obligation refs;
- GTL design/IACS/structural-carrier updates proving prompt assets remain
  subordinate asset surfaces rather than new topology objects;
- T-150 tests proving declaration-shape admission, anti-leak guards, anti-
  topology guards, graph-function chain composition, and M02 publication; and
- package version advancement to `3.9.0-rc.12` for downstream consumers.

## Boundary

This is GTL asset-interface law. GTL owns the generic shape: opaque
authority-kind refs, generic disposition labels, fallback precondition refs,
renderer refs, and proof refs. Downstream products own their concrete prompt
authority vocabulary and policy assignments. ABG/downstream assurance enforces
runtime packet legality. GTL does not parse rendered prompt text and does not
infer prompt semantics from Markdown.

## Versioned Artifacts

- RC branch: `main`
- RC identity: `3.9.0-rc.12`
- Candidate package version: `3.9.0-rc.12`
- Candidate tag: `v3.9.0-rc.12`

## Verification

Current qualification evidence for this cut:

```text
npm run lint:semantic
passed

npm run lint:test-harness
passed

npm run test:t150
7 passed

npm run test:semantic
682 passed

npm pack --dry-run
passed

git diff --check
passed
```

The release snapshot command rebuilds the semantic package, runs `npm pack`,
copies this release note, and writes manifest plus checksum evidence into the
immutable local snapshot directory.

## RC Decision

RC12 is the GTL prompt-asset typed surface candidate. It gives downstream prompt
systems a generic GTL asset shape to consume while keeping product-specific
authority values, prompt policy, and semantic evaluation outside the GTL
substrate.
