# native-recovery-21 author notes

Source 72eea8f0 / tree d7754aca. Grant: NATIVE_GRANT.DRAFT.json. Change class: realization_refactor.

## Change

`build_tenants/abiogenesis/typescript/test_env/uat/harness.test.mjs`, case
"Maintained setup retains actual owner verification through ten native calls and
preserves configured environment" (name unchanged). Harness sha256
22359424... at HEAD, d5aeb3b3... after; 93494 bytes.

- Warm positive control after setup and the restoration control, while the
  sentinels are still installed: phase `warm-control` calls the existing
  `verifyArtifact` helper -> `runtime.product.ProductVerificationPort.verify`
  (verification_operation.ts verifyProductArtifact) -> `verifyProduct` ->
  `resolveNativeDeclarationClosures` (declaration_exports.ts closure
  createProgram), on the same core package and manifest as
  `core-initial-verification`. No `verifiedArtifact` is supplied, so
  `selectOwnedProductVerification` yields null and the verifier runs cold. Same
  installed module instance (`runtime`) and the same patched `node:fs`.
- Warm coordinate: the bundled `build/toolchain/typescript.cjs` CJS cache entry
  is `loaded` before the control, and the same entry object remains afterwards.
- Control assertions: a fresh result object (not `native.verified`), the same
  request, the same `verificationDigest`, owned by the same verifier instance,
  nonempty `nativeDeclarationEvidence.contracts` and `closures`, control entries
  exactly [verifier/verifyProduct, type-program/resolveNativeDeclarationClosures]
  in the same instance and equal in shape to the cold first verification, run
  under ambient PATH/TMPDIR.
- Complete serial setup interval (every phase before `complete`) is counted
  apart from the control. Every heavy entry lies in one of the two. The setup
  verifier/program assertions now use the setup-interval entries only. The
  proof adds `setupInterval`, `warmControl`, `librarySentinel` {claim, limits}
  and `environment.ambientInProcessKeys` / `fullEnvironmentEquivalence:false`;
  `limits` is bounded the same way.
- Preserved unchanged: ten receipts/closes/value-request joins, two installs and
  physical checks, PATH/TMPDIR restoration (success and EEXIST refusal), npm
  wrapper, phase timings, zero CLI children/JSONL, setup020 evidence writes.

HOW section (T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md "Maintained setup owner
reuse") makes no library-read or environment-equivalence claim, so it is left
unchanged. The four held-invariant files are byte-identical to HEAD.

## Local feedback (actual)

- `node --check harness.test.mjs`: exit 0.
- In-memory node 24.7.0 check (no files written), offline TypeScript 5.9.2 from the
  read-only toolchain link (package-lock pins 5.9.2):
  `{"asyncReadsViaEsmNamedImport":["asyncOwner"],"preliminaryParseReads":0,
  "coldProgramReads":1,"warmProgramReads":1,"diagnostics":[0,0]}`. So the patched
  fs.promises.readFile reaches ESM `node:fs/promises` named imports after
  syncBuiltinESMExports; preProcessFile/createSourceFile read no default lib;
  each fresh createProgram reads lib.es2022.full.d.ts once, cold and warm.
- In-memory CJS check: cache key == module `__filename` == realpath, `loaded`
  true, `getDefaultLibFilePath` dir == module dir.

## Limits

- The harness was not run: no build/ or artifacts/ exists and building is
  excluded. The control's behaviour on the candidate's bundled typescript.cjs
  is unobserved until C2 runs it.
- The library sentinel bounds only fresh full TypeScript program construction on
  this successful fixed nonempty declaration path. It does not count every verifier
  invocation or all declaration work. Zero does not exclude preliminary parsing.
- Only PATH/TMPDIR are scoped in-process. Other configured keys, including any
  toolchainEnvironment keys, stay ambient. No full environment equivalence is claimed.
- No C2, UAT, acceptance or local-cut claim.
