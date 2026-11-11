# TD-47 Return: named return types in `construction_continuation.ts`

Writer: Claude Opus 5.5. Branch `claude/td47-continuation-types` from `main` at
`b7e404499`, worktree `/private/tmp/abg-td47`. Change class:
realization_refactor. No push, no tag.

**Status: complete.** All 291 emitted `.js` files are byte-identical to the
base. Of the 795 build files, only `abg/construction_continuation.d.ts`
differs. The compiler finds every exported signature of the module identical to
the base, except where the re-synced `childFunction` reaches. There the one
difference is the optional `failedChildDiagnosticClassRefs` on the recurse
`foldback`. The five smoke lanes pass: 13 tests, 10 pass, 0 fail, 3 skipped by
environment gates. r1 (packed artifact) and r2 (clean install) pass against a
candidate basis refreshed from the final build.

| Commit | Content |
| --- | --- |
| `a063e9a0d` | re-sync: the six pasted `childFunction` expansions become `Readonly<GraphFunction>` |
| `6cc33e60a` | the six spelled-out return types become named types |
| this commit | this Return |

Each commit touches only `code/src/abg/construction_continuation.ts` (and
this Return). No other source file changes, not even an import.

## 1. Lines

| Measure | Base `b7e404499` | After re-sync | After naming |
| --- | --- | --- | --- |
| `construction_continuation.ts` | 2,480 | 1,610 | 1,094 |
| Signature lines of the six functions (first overload to implementation header) | 1,461 | 591 | 39 |
| Named-type declarations for them | 4 (three `ReturnType`/`Extract` aliases) | 4 | 38 |
| Public `.d.ts` (`stripInternal`) | 708 | 418 | 331 |
| Internal-emit `.d.ts` (`--stripInternal false`) | 1,240 | 660 | 387 |

The source loses 1,386 lines (the register estimated about 1,330). The 1,465
signature and alias lines become 77, against the register's estimate of about
130. The public `.d.ts` diff against the base removes 409 lines and adds 32.
The internal-emit diff removes 892 lines and adds 39.

## 2. The six types

| Function (three signatures each) | Return type now | Name status |
| --- | --- | --- |
| `prepareConstructionIntentContinuation` | `PreparedConstructionIntentContinuation \| null` | existing export; now declared as its object type (was `NonNullable<ReturnType<…>>`) |
| `prepareConstructionContinuationOperation` | `ConstructionContinuationOperationResult<ValidatedRuntimeEventPrefix>` (public overload), `<RuntimeEventPrefix>` (internal overload and implementation) | new export; its prepared arm is `PreparedConstructionContinuationOperation`, an existing export now declared as its object type (was `Extract<ReturnType<…>>`) |
| `selectPendingActionUse` | `SelectedActionUse \| SelectedActionUseRefusal` | both new exports; `SelectedActionUse.request` is the existing `SelectedActionUseRequest` |
| `prepareSelectedActionContinuation` | `PreparedSelectedActionContinuation \| null` | existing export; now declared as its object type (was `NonNullable<ReturnType<…>>`); its `use` parameter is `SelectedActionUse` (was `Extract<ReturnType<typeof selectPendingActionUse>, …>`) |
| `projectSelectedActionOperation` | `ContinuationOperationPriorAdmission \| null` | new export, shared by both projectors |
| `projectPendingExecutionOperation` | `ContinuationOperationPriorAdmission \| null` | as above |

Where each name is used:

- `PreparedConstructionIntentContinuation`: the three
  `prepareConstructionIntentContinuation` signatures, the `prepared` parameter
  of `prepareConstructionContinuationOperation`, and the `prepared` field of
  `PreparedConstructionContinuationOperation`.
- `ConstructionContinuationOperationResult<Prefix>`: the three
  `prepareConstructionContinuationOperation` signatures.
- `PreparedConstructionContinuationOperation`: the result type's prepared arm,
  `isPreparedConstructionContinuationOperation`,
  `admitConstructionContinuationReentry`, `abg/execution_basis.ts` and
  `hog/entry.ts` (by name, unchanged).
- `SelectedActionUse`, `SelectedActionUseRefusal`: the three
  `selectPendingActionUse` signatures; `SelectedActionUse` also types
  `prepareSelectedActionContinuation`'s `use` parameter and
  `PreparedSelectedActionContinuation.use`.
- `PreparedSelectedActionContinuation`: the three
  `prepareSelectedActionContinuation` signatures and
  `admitSelectedActionContinuationOperation`.
- `ContinuationOperationPriorAdmission`: the six projector signatures.

Two of the new names derive from their owners' exported types instead of
spelling the shape again:

- `ConstructionContinuationOperationResult<Prefix>` takes its duplicate and
  invalid-history arms from `EffectfulPublicInvocationTruth`
  (`effectful_invocation_truth.ts`). A homomorphic mapped type replaces only
  `prefix` with `Prefix | DurablePrefixCoordinate`. The implementation returns
  that owner's truth unchanged, so the type follows the owner. Each overload
  keeps the prefix type it has today (ruling 3).
- `ContinuationOperationPriorAdmission` is a `-readonly` mapped type over
  `EffectfulPublicInvocationPriorAdmission` that narrows `operationId` to
  `"abg.operation.run.continue"`. The narrowing is kept without widening and
  without an intersection (ruling 4). `Omit<…> & {…}` would have changed the
  type: the identity check distinguishes intersections and readonly fields.
  `-readonly` keeps today's mutable fields.

The four new names are exported, following the file's `PendingExecutionUse`
pattern. None is `@internal`, because public overloads use all four. The
`./abg` barrel re-exports none of them; it re-exports only
`projectPendingExecutionUseRequest` from this module. A module-local alias
would also work (`SelectedCoordinate` is one), with the same types.

## 3. The re-sync

The six pasted `childFunction` expansions (146 lines each) become
`Readonly<import("../gtl/contracts.js").GraphFunction>`. That is the form
`rematerializeAdmittedBasisGraph` and `projectPendingExecutionInputAtPrefix`
already use. The compiler finds `Readonly<GraphFunction>` and `GraphFunction`
identical. The re-synced type is the base paste plus exactly one member:
`readonly failedChildDiagnosticClassRefs?: readonly string[]` on the recurse
`foldback`. Removing that member from the new type gives a type identical to
the base paste.

## 4. Type identity, checked by the compiler

Scratch project: `/private/tmp/abg-td47-work/check/`, not committed. It uses
the repository's compiler options with `noEmit`. Two universes are compared:

- the public universe, from the `stripInternal` build;
- the internal universe, from `tsc --stripInternal false --emitDeclarationOnly`.

Each universe is the base declaration tree with the re-sync and final
`construction_continuation.d.ts` added as sibling files. Base, re-sync and
final therefore resolve every dependency to the same declarations. That is
sound because the hash comparison (section 5) shows no other `.d.ts`
differs in either emit.

- `Equal<X, Y>` is the `(<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)` form.
- Controls show it rejects readonly against mutable, optional against
  `| undefined`, `any`, an intersection against its flattened object, and a
  union of objects against one object with a union field.
- A negative file with five deliberately wrong assertions fails on all five.
- Every compared parameter and return is guarded against `any` at top level
  and one level down.
- Both universes compile with `skipLibCheck: false` and zero errors, so no
  compared type rests on an unresolved reference.

The run has 775 assertions: 469 internal and 306 public. All pass. For every
function:

- `Equal<typeof ReSync.f, typeof Final.f>` holds. The whole overloaded
  function type matches: overload count, order, parameters, returns and
  predicates. The naming commit changes no type.
- `Equal<typeof Base.f, typeof Final.f>` holds, except for the four functions
  the re-sync reaches.
- For each of those four, the assertion that the field-stripped final type
  equals the base type holds, and so does a control that stripping the base
  type leaves it unchanged.

| Function | Signature | Parameters | Return |
| --- | --- | --- | --- |
| `isConstructionContinuationKind` | single signature (both trees) | identical | identical |
| `admitPendingConstructionIntentContinuation` | single signature (both trees) | identical | identical |
| `projectConstructionIntentContinuations` | public overload (both trees) | identical | identical |
| `projectConstructionIntentContinuations` | internal overload (internal tree) | identical | identical |
| `projectPendingExecutionContinuations` | public overload (both trees) | identical | identical |
| `projectPendingExecutionContinuations` | internal overload (internal tree) | identical | identical |
| `rematerializeAdmittedBasisGraph` | `@internal` function (internal tree) | identical | identical |
| `projectPendingCursorInputAtPrefix` | `@internal` function (internal tree) | identical | identical |
| `prepareConstructionIntentContinuation` | public overload (both trees) | identical | re-sync field only |
| `prepareConstructionIntentContinuation` | internal overload (internal tree) | identical | re-sync field only |
| `continuationOperationWorkspaceCorresponds` | single signature (both trees) | identical | identical |
| `prepareConstructionContinuationOperation` | public overload (both trees) | identical except `prepared` (param 1): re-sync field only | re-sync field only |
| `prepareConstructionContinuationOperation` | internal overload (internal tree) | identical except `prepared` (param 1): re-sync field only | re-sync field only |
| `isPreparedConstructionContinuationOperation` | single signature (both trees) | identical | predicate type: re-sync field only |
| `admitConstructionContinuationReentry` | single signature (both trees) | identical except `operation` (param 2): re-sync field only | identical |
| `projectSelectedActionContinuations` | public overload (both trees) | identical | identical |
| `projectSelectedActionContinuations` | internal overload (internal tree) | identical | identical |
| `selectPendingActionUse` | public overload (both trees) | identical | identical |
| `selectPendingActionUse` | internal overload (internal tree) | identical | identical |
| `prepareSelectedActionContinuation` | public overload (both trees) | identical | identical |
| `prepareSelectedActionContinuation` | internal overload (internal tree) | identical | identical |
| `admitSelectedActionContinuationOperation` | single signature (both trees) | identical | identical |
| `projectSelectedActionOperation` | public overload (both trees) | identical | identical |
| `projectSelectedActionOperation` | internal overload (internal tree) | identical | identical |
| `projectPendingExecutionUseRequest` | public overload (both trees) | identical | identical |
| `projectPendingExecutionUseRequest` | internal overload (internal tree) | identical | identical |
| `selectPendingExecutionUse` | public overload (both trees) | identical | identical |
| `selectPendingExecutionUse` | internal overload (internal tree) | identical | identical |
| `admitPendingExecutionContinuationOperation` | single signature (both trees) | identical | identical |
| `projectPendingExecutionOperation` | public overload (both trees) | identical | identical |
| `projectPendingExecutionOperation` | internal overload (internal tree) | identical | identical |
| `preparePendingExecutionContinuation` | public overload (both trees) | identical | identical |
| `preparePendingExecutionContinuation` | internal overload (internal tree) | identical | identical |
| `projectPendingExecutionInputAtPrefix` | public overload (both trees) | identical | identical |
| `projectPendingExecutionInputAtPrefix` | internal overload (internal tree) | identical | identical |

Exported type aliases:

- Identical to base: `ConstructionIntentContinuation`,
  `PendingExecutionReturn`, `PendingExecutionContinuation`,
  `SelectedActionContinuation`, `SelectedActionUseRequest`,
  `PreparedSelectedActionContinuation`, `PendingExecutionUseRequest`,
  `PendingExecutionUseRefusal`, `PendingExecutionUse`.
- Differing only by the re-synced field: `PreparedConstructionIntentContinuation`
  and `PreparedConstructionContinuationOperation`.
- The new names against the base's spelled-out types:
  - `SelectedActionUse` and `SelectedActionUseRefusal` are identical to the
    use and refusal arms of the base `selectPendingActionUse` return.
  - `ContinuationOperationPriorAdmission | null` is identical to both base
    projector returns, and its `operationId` is exactly
    `"abg.operation.run.continue"`.
  - `ConstructionContinuationOperationResult<ValidatedRuntimeEventPrefix>`
    and `<RuntimeEventPrefix>` equal the base public and internal returns
    once the field is stripped, and equal the re-sync returns exactly. The
    two instantiations are not identical to each other.

## 5. Build hashes

sha256 of every file under `build/` (795 files: 291 `.js`, 496 `.d.ts`
including the toolchain's lib declarations, and 8 others):

| Comparison | `.js` differing | `.d.ts` differing | Other files differing |
| --- | --- | --- | --- |
| base → re-sync | 0 of 291 | 1 of 496: `abg/construction_continuation.d.ts` | 0 |
| base → final | 0 of 291 | 1 of 496: `abg/construction_continuation.d.ts` | 0 |
| internal emit, base → re-sync and base → final | n/a | 1 of 291: `abg/construction_continuation.d.ts` | n/a |

No file re-exports a new name, so no other declaration changes.

| File | Base | Re-sync | Final |
| --- | --- | --- | --- |
| `construction_continuation.js` | `25b980a6cd88675788f0b3531f947977ffa0f26e2e2a6b2e458f05412c38a462` | same | same |
| `construction_continuation.d.ts` (public) | `bee5329ec8ec8d019c47bb72a7fa1baf0b14b79a46b89fea3693694a47a2ea68` | `ec86a3895b44599288465941abc85dc122951d3051f31e7e189c493e91b901f7` | `e29eb1b0a5d344eebfe66a6c9525a96f1eeb48d1375284b182b8f895f326e741` |
| `construction_continuation.d.ts` (internal emit) | `bbd59103a79266da9927d94c8a6dcaeb28a8808994357622c1c51528447a2726` | `e898fc876c4623e09abd969c4c66632ba7f4ba7ebc3d0c86f13ca4201771257e` | `aabd616eda48242da2743dab4132f24945f7d0477dd82978f8de77fc4326400e` |

## 6. Identity digests

The base build regenerates the committed manifest and capability graph byte
for byte. The build does not write the candidate basis; it comes from
`scripts/refresh-candidate-basis.mjs`. The values below come from the
regenerated files, observed before they were restored (ruling 6):

| Digest | Base | After re-sync | Final |
| --- | --- | --- | --- |
| `productContentDigest` | `sha256:c46cd50ffdfa1943ef17642c6b0fed1f0c343fca94f70223d90e62f9f61a1c84` | `sha256:6c61026d241d6135067a976cc017f73be07e41d8ef7d7d03c122f91137f929a7` | `sha256:f2998d9e58576b590cb08c57f98dfab171c93b42c067315fdc920d809d7d8127` |
| `contributionManifestDigest` | `sha256:3c104740283c7317960566f81fc96d7a00101676b2739ec687004197089da9ea` | `sha256:d50702e2071b10a07f0d37c0704817b023f4cfadfc3a1fd9a220829c28e33186` | `sha256:3c7080f93dc6f8c6e7ff2bae4cd9ec0566cd16ff677fcf2c32090d4608287ebf` |
| `publicContractCatalog.catalogDigest` | `sha256:a67e743ca8fb775927c6ad67394d41797632d7895a9e7a9edce966ffb0f073f7` | `sha256:8a8644bbb1adab1f5629a32b4bdc40ee9bfdcb342b1dca8965755dd594dff077` | `sha256:44dc5b920db0402cab7ec6a5c2c7fdd6c2fdea53bd204df1c49604df66d096f4` |
| capability graph `graphDigest` | `sha256:f9e6457b54b1bc548c00137a26d6790995e92cab20967479da832539a77590b2` | `sha256:844ff39610bbdd464dd8f4420dfa4f39e19c8f4a36430771690bd5dfe305c89b` | `sha256:4667187b71327110a9be5c35ea3c37fb348090bc7a65c5f3b92c1c1ecaa4cf88` |
| candidate basis `artifactDigest` | `sha256:a03f1f7be520ef047a36946c16b0e4041469ddd5d9918cbb7930ad4b1b308c2a` (committed) | not refreshed | `sha256:13c80165fcf9505fdea2a5ece696dd76ef4c92396ee6d3364565cf8c5adbcf65` |
| candidate basis `manifestDigest` | `sha256:abc60f8b7bb1254cff3d2e6bebd830130ccbacbdbc5c2ce5ecf08286d5ddae41` (committed) | not refreshed | `sha256:1eaa9c1a93b01ed4ed92a891292389a4fe87f0f605611a8c16c2a39bb11a2a24` |

The final candidate basis comes from the final build, refreshed for r1 and
r2. Its `productContentDigest` equals the final manifest's.

Catalog rows (75 in all), at the re-sync and again at the final state:

- 47 rows carry `abg/construction_continuation.d.ts` in their
  `nativeTypedLocator.declarationInventory`. All 47 `declarationDigest`
  values for this module move; no other module's `declarationDigest` moves.
  `productRelativeLocators` names the file once.
- **21 `contractDigest` values move, not 47.** The 21 are the
  `native_typed_group` rows, whose `contractDigest` is computed from the
  inventory. The other 26 rows are `serialized_native_contract` rows. Their
  `contractDigest` is the content digest of the serialized asset, which does
  not change, although their inventories carry the module.
- The register's TD-47 Boundary ("47 contract-row digests … move") counts
  the inventory digests; the contract digests that move are 21.

The manifest has 140 changed leaves in all:

- 47 inventory digests and 21 contract digests;
- 49 contribution-row `provenanceRef` values;
- 10 publication-binding digests;
- the top-level and contribution-manifest digests and references.

The capability graph moves because its rows carry the catalog and
product-content digests (241 rows each). Sixteen capability definition digests
and references follow from those, plus 18 dependent references.

## 7. Callers, lints, lanes

- `npm run build` passes with no new error and no suppression. No caller
  outside the file changed.
- `npm run lint:imports`, `lint:lifecycle` and `lint:calculus` pass.
- Lanes, run on the final build with its regenerated manifest on disk, from
  T: `TMPDIR=/private/tmp/abg-td47-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>.test.mjs`:

| File | Tests | Pass | Fail | Skip | Seconds |
| --- | --- | --- | --- | --- | --- |
| `t287-exact-construction-intent` | 1 | 1 | 0 | 0 | 69 |
| `t287-selected-action` | 1 | 0 | 0 | 1 | 0 |
| `t287-selected-action-authority` | 3 | 2 | 0 | 1 | 0 |
| `t287-continuation-causation` | 1 | 1 | 0 | 0 | 1 |
| `t287-recursive-registered-selection` | 7 | 6 | 0 | 1 | 86 |

The three skips are environment gates: `ABI5_SELECTED_ACTION_EVIDENCE_ROOT`,
`ABI5_SELECTED_ACTION_OWNER_SUBJECT` and `ABI5_RECURSIVE_SELECTION_LIVE` are
unset. No file failed, so no base run was needed.

Pins of this module's declaration or the old digests in `test_env`:

- `test_env/fixtures/abi5-root-candidate-basis.json` pins the base
  `productContentDigest`. The pack and install lanes read it through
  `test_env/support/candidate-basis.mjs`: r1, r2, r3, steel and the installed
  w2/d1/d2 files. Sequence:
  1. Rebuild the final state. Its 795 build files are byte-identical to the
     earlier final build.
  2. Run `node scripts/refresh-candidate-basis.mjs`. Its digests are in
     section 6.
  3. Run r1 and r2 with the lane command:

  | File | Tests | Pass | Fail | Skip | Seconds |
  | --- | --- | --- | --- | --- | --- |
  | `r1-packed-artifact` | 1 | 1 | 0 | 0 | 29 |
  | `r2-clean-install` | 1 | 1 | 0 | 0 | 52 |

  r1 packs and verifies the tenant, so the packed declaration closure carries
  the four new names. I restored the fixture afterwards, and the Executive
  refreshes it at the merge.
- `test_env/qualification/recipe/expected-output-inventory.json` (the
  5.0.0-rc.1 recipe, `ddc1b091c`) pins this module's `.d.ts`
  (`0dffd310…`) and `.js` (`69128cf4…`). Both already differ from the base
  build, so it is a historical record that this change does not affect.
- No test pins this module's declaration text. The tests that load the
  module load its JavaScript, which is unchanged.

## 8. Deviations

- Two names derive from their owners' types instead of spelling the shape
  once (section 2). Identity holds for both, by the compiler.
- `prepareSelectedActionContinuation`'s `use` parameter now names
  `SelectedActionUse` instead of `Extract<ReturnType<typeof selectPendingActionUse>, …>`.
  The type is identical; this is E2's ":2035 parameter".
- The three existing aliases are now declared as their object types where they
  stood. They cannot stay `ReturnType`-derived, because the signatures now
  name them and that would be circular.

## 9. Residuals (not changed)

- `preparePendingExecutionContinuation` spells its eight-field return type
  in all three signatures (about 30 lines). It is not one of E2's six.
- `projectPendingExecutionInputAtPrefix` spells its two-field return type
  three times.
- `owner_bindings/run_invocation.ts:1856`, `:1917`, `:1919` and `:1921`
  derive these types through `NonNullable<ReturnType<…>>` and
  `Extract<ReturnType<…>>`. They could now use the names.
- `abg/fh_continuation_projection.ts:80` `FhEffectfulPublicInvocationFact`
  restates `EffectfulPublicInvocationPriorAdmission` (abg-calls E2).
- No other source file contains the `GraphFunction` expansion; a grep for
  its `requiresParentEvaluation: true` field finds none.

## 10. For the Executive

- Register correction: TD-47's Boundary should say 47 `declarationDigest`
  values and 21 `contractDigest` values move.
- The four new names are exported, without `@internal`. If module-local
  aliases are preferred, removing `export` changes no type.
- The generated files are restored, not committed:
  - `contracts/capabilities/capability-definition-graph.json`;
  - `product-toolchain-manifest.json`;
  - `test_env/fixtures/abi5-root-candidate-basis.json` (refreshed for r1 and
    r2, then restored).
