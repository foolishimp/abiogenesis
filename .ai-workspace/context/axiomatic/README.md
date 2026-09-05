# ABIogenesis Axiomatic Context

This directory contains derived, source-linked ABI context for T-287. The
operative STDO basis and companion Product composition are selected once in
`stdo_abiogenesis.json`. The corresponding exact installs are reached through
`.genesis/development-products/`. Upstream STDO and the declared source owners
retain authority; these files are context and evidence.

Use the released Axiom Indexer to validate and regenerate this local map:

```sh
python3 -B .genesis/development-products/axiom-indexer/build_tenants/core/code/ac.py \
  validate \
  --program .ai-workspace/context/axiomatic/axiomatic-program.json \
  --bindings .ai-workspace/context/axiomatic/bindings.json \
  --output .ai-workspace/context/axiomatic/validation-report.json \
  --emit-map .ai-workspace/context/axiomatic/logical-constraint-map.json
```

Re-enter the exact source routes whenever a material relation is stale,
conflicting, missing, or insufficient. Re-author affected meaning before
regeneration; mechanically valid output does not establish semantic fidelity.
Compare a fresh validation's resolved source digests and derived map with the
retained evidence before relying on a previous report.

`executive-review-sections.json` and `executive-review-request.txt` are a draft
context projection for the current Stage 1 review boundary. Their presence
activates no actor and changes no work or review disposition. The request is
produced by the exact installed Axiom Indexer `join` command from the ordered
sections.

## Current Derived Identities

- Program URI: `urn:axiom-indexer:program:abiogenesis:mutable-worksite-spine:2`.
- Canonical program SHA-256: `sha256:2a65bd1eacba9bf43013695dacb64afe773364d1a09ba1d0ca975cefdf745cf1`.
- Intrinsic map SHA-256: `sha256:5d45f7bd9bcf9bd1e79a5a12993243bfbadeca260124116f561f91f6fa4a21b4`.
- Declared population: 11 symbols, 13 clauses, 3 explicit residuals.

## History

Pre-update bytes and operational evidence are retained at
`history/20260905T025248Z-pre-rc4-adoption/`.
They are historical evidence and do not select the current basis.
