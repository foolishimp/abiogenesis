# T-286 R1 Exact Artifact Verified

## Result

`ABI5-ROOT-001` obligation `R1 exact artifacts verified` is satisfied by
implementation commit `95eef983dd58d98691488d6e06b75aa2307de1ec`.

The new Product boundary was authored after the clean-successor checkpoint. No
donor file crossed. The package contains one `./product` export and no runtime,
installer, CLI, HoG, ABG, compiled-plan, controller, default-target, or private
execution-basis carrier.

## Exact Evidence

| Identity | Value |
|---|---|
| package | `@abiogenesis/typescript-tenant@5.0.0-dev.286` |
| product | `product://abiogenesis/typescript-tenant@5.0.0-dev.286` |
| artifact SHA-256 | `sha256:cf0ade83b1794d154dab81a0d7eea33235bfcdb4b33828934daa165a4185b072` |
| artifact bytes | `5719` |
| product content digest | `sha256:45b97c9e3f13766a924928dc5c19db262fb492aec7b48aefdf90f61a0d44273c` |
| manifest digest | `sha256:55c904f5e788bf1eeea42b97a9b21985b667f935c5eec28d1711e4d9fb304b42` |
| public-contract catalog digest | `sha256:b8d4fce4cd0e4e77a61ff3e75c39113a9a84c39a96f1cc5c3cb59481e61187ef` |
| checked payload files | `15` |

`verifyProduct` reads the supplied tarball, refuses archive paths outside the
package boundary, verifies the exact archive file set, checks package/Product
identity, hashes every payload entry, verifies the canonical manifest and
catalog, and checks both schema assets and the native TypeScript declaration
inventory.

The proof imports `verifyProduct` from extracted package bytes, not from the
source tree. A separate repacked artifact with
`build/code/src/index.js` changed refuses with
`product_content_mismatch`.

## Verification

```text
npm ci --ignore-scripts
npm run test:r1
npm audit --omit=dev
```

The test passed after a clean dependency install. Two consecutive clean builds
produced the same artifact SHA-256. Runtime dependencies and audit findings are
both zero.

## Frontier

The root remains red. The next unsatisfied obligation is
`R2 clean install complete`; no later root obligation is claimed.
