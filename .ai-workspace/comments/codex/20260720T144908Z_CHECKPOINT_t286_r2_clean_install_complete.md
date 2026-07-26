# T-286 R2 Clean Install Complete

## Result

`ABI5-ROOT-001` obligation `R2 clean install complete` is satisfied by
implementation commit `6bc4fb118be4a67009c6c9eddb610e2d2d9dd17b` while
preserving `R1`.

`installProduct` accepts only a previously verified artifact and an empty
target. It installs the local tarball offline with lifecycle scripts disabled,
rehashes the installed manifest and every installed payload file, rejects
source-only paths, and emits a ProductInstall candidate. It does not bind a
workspace or mint ABG admission truth.

## Exact Candidate Evidence

| Identity | Value |
|---|---|
| artifact SHA-256 | `sha256:bffa5132267868b93b3b138b5282457af6e66dc5827ffe1f86a090ba5f2ab7f0` |
| artifact bytes | `7489` |
| content digest | `sha256:e3b54cedffe0e0d89b7448550f4b23ba05c8783eba71e36d090d2ad4c6a32e7e` |
| manifest digest | `sha256:a7888dcac0af84f114ac3205aa28c8f873aaca9caebb55e6df0e035187c7219b` |
| install identity | `product-install://abiogenesis/typescript-tenant/5.0.0-dev.286/e3b54cedffe0e0d89b7448550f4b23ba05c8783eba71e36d090d2ad4c6a32e7e` |

The proof starts with an empty temporary consumer and installs only the packed
artifact. A separate Node process running from that consumer resolves
`@abiogenesis/typescript-tenant/product` through package exports and verifies
the same artifact digest. It has no source checkout import or development shell.

An occupied-target mutation refuses with `target_not_empty`. Two consecutive
clean R1-R2 runs produced the same artifact digest.

## Verification

```text
npm ci --ignore-scripts
npm run test:r2
```

Both R1 and R2 passed. The root remains red at
`R3 workspace bound to exact product set`; no workspace or catalog claim is
made by this checkpoint.
