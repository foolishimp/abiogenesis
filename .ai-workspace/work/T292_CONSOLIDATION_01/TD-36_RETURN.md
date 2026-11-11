# TD-36 Return: one strict owner for the workspace-binding and admitted-row checks

Writer: Claude Opus 5.5. Branch `claude/td36-binding-identity` from `main` at
`0f77e3976`, worktree `/private/tmp/abg-td36` (sparse). Change class:
realization_refactor. No push, no tag. T = `build_tenants/abiogenesis/typescript`.

**Status: stopped at the size condition.** The source change is 729 changed
lines (+235, −494) against the brief's "about 500". The change is complete,
committed and verified (section 3). No source was changed after the count.
The Executive rules: accept as is, or split into the two groups in section 0.

| Commit | Content |
| --- | --- |
| `3a32adb4a` | the change, with the regenerated manifest, capability graph and C2 context inventory record |
| `fe55e955b` | the two new test files |
| `b929ef987` | refreshed candidate basis |
| this commit | this Return |

## 0. The size stop

`git diff --numstat 0f77e3976 -- code/src` (test lines are separate):

| File | + | − |
| --- | --- | --- |
| `abg/execution_basis.ts` | 107 | 1 |
| `gtl/worksite_command_execution.ts` (C2 pin) | 3 | 3 |
| `implementation/leaf_execution_authority.ts` | 3 | 116 |
| `product/catalog.ts` | 2 | 22 |
| `product/environment.ts` | 52 | 3 |
| `product/invocation.ts` | 17 | 0 |
| `product/materialization_operations.ts` | 3 | 38 |
| `product/native_workspace_work.ts` | 3 | 3 |
| `product/semantic_revision.ts` | 3 | 3 |
| `product/worksite_command_execution.ts` | 5 | 69 |
| `product/worksite_construction.ts` | 3 | 92 |
| `product/worksite_effect.ts` | 8 | 144 |
| `shared/admission_predicates.ts` | 6 | 0 |
| `shared/admit/record.ts` | 20 | 0 |
| **code/src total** | **235** | **494** |

Other changed lines:
- Regenerated JSON: 3 one-line files.
- Candidate basis: 3 lines.
- New tests: 762 lines in two files.

The net change is −259. The register priced TD-36 at "about 250" removed. The
four named files alone lose 421 lines, because the owners are moved, not
rewritten: the row check (about 100 lines) and the binding check (about 35)
are added once at their owners and deleted twice or three times at the copies.

The natural split, if the Executive wants one:
- **Row group** (`execution_basis.ts`, `leaf_execution_authority.ts`, `shared/admit/record.ts`, the row part of `worksite_effect.ts`): about 338 lines.
- **Binding, join and grant group** (everything else, including the C2 pin): about 391 lines.

Each group alone is under 500. I did not revert or split, because either would
be a workaround the brief forbids. The residuals in section 6 were left
unconverted for the same reason.

No other stop condition fired:
- No caller test went red because a tightened check now refuses a value.
- No identity formula, digest input, admitted byte or refusal code set changed.
- The import-direction lints are green.

## 1. Trace

Line numbers are at `0f77e3976`. "Strict" means the copy the owner now is.

### Copies

| # | Rule | Copy (file:lines) | Checks | Omits, against the strictest copy |
| --- | --- | --- | --- | --- |
| A | binding | `product/worksite_command_execution.ts:835-870` `isExactWorkspaceBinding`, with `nonempty` `:731-734` | record; exact 14 keys (`Object.keys`); `kind`, `schemaVersion`; seven strings nonblank, NUL-free and **trimmed** (`trim() === value`); four sha256 digests; `roots` a record with exactly the six keys, each root trimmed, NUL-free, absolute; the nine-field body admitted by `admitJson`, its digest and `workspace-binding://abiogenesis/<hex>` | nothing: strictest |
| B | binding | `product/worksite_construction.ts:201-264` `isExactWorkspaceBinding` | as A, but strings use `isNonblankNulFreeString` | the trimmed check: it accepts leading or trailing whitespace |
| C | binding | `product/worksite_effect.ts:445-487` `exactWorkspaceBinding` (exported) | `kind`, `schemaVersion`, strings as B, digests, `roots` key set and absolute roots; digest over the raw body | record shape; top-level key set; trimmed check; `admitJson`. So it accepts extra keys, arrays carrying the fields, lone surrogates, and accessor, symbol or non-enumerable members or a Proxy in `roots`. It throws on `null` |
| D | binding | `product/materialization_operations.ts:177-235` `bindingBodyDigest` with the tail of `validWorkspaceAndBinding` | record; `kind`, `schemaVersion`; `bindingId` a string; `bindingDigest` sha256; `admissionEventRef` non-empty; `roots` a record of absolute strings; raw-body digest and identity | both key sets, six string checks, three digest checks, `admitJson`. It throws when a body field is missing |
| E | candidate | `product/catalog.ts:467-491`, in `admitGraphFunctionCatalog` | `kind: workspace_binding_candidate`, `schemaVersion`, raw-body digest, identity, `lockId`/`lockDigest` against the lock | everything else. The candidate owner already existed: `product/environment.ts:1199-1288`. E throws when a body field is missing |
| J1 | join | `worksite_command_execution.ts:872-882` | `isWorkspaceAuthorityBasis(A)`, `A(W)`, and `workspaceId`, `authorityBasisId`, `authorityBasisDigest`, `authorizedActorRef` equal | strict |
| J2 | join | `worksite_construction.ts:266-276` | same text over B | what B omits |
| J3 | join | `worksite_effect.ts:489-497` | same text over C | what C omits |
| G1 | direct grant | `worksite_command_execution.ts:884-895` | `isCapabilityGrantValue`; `operationId` and `definitionKey.operationId` are `abg.operation.run.invoke`; `memberKey` is `invoke` or `start`; `actorRef`, `scopeRef`, `scopeDigest` match the binding | none |
| G2 | direct grant | `worksite_construction.ts:278-289` | identical text | none |
| R1 | admitted row | `implementation/leaf_execution_authority.ts:56-89` (fields), `:91-107` (`hasExactDataFields`), `:122-180` | record; own keys (`Reflect.ownKeys`) all strings, exactly the 32 fields, each an enumerable data property; `kind`, `schemaVersion`, `disposition`, regime `F_D` or `F_P`; 20 strings nonblank and NUL-free; 8 digests; body admitted by `admitJson`, its digest and `leaf-resolution-candidate://abiogenesis/<hex>` | nothing: strictest |
| R2 | admitted row | `product/worksite_effect.ts:610-695` | as R1, but `hasExactKeys` (`Object.keys`) and a raw-body digest | symbol, non-enumerable and accessor members; `admitJson` (accepts lone surrogates) |

The reviews disagreed with each other and were each partly wrong:
- product-run 4 and the register call A and B "textually identical". They are not. A's `nonempty` refuses leading and trailing whitespace; B's `isNonblankNulFreeString` accepts it. The strictest copy is A, and the owner is A.
- SO-A's "byte-equal output" holds for the digest on every value each copy accepts. Its seven-place count misses `abg/environment_admission.ts:1103` `hasAdmittedWorkspaceBinding` (section 6).

### Callers

| Caller (function, file:line) | Old copy | Now |
| --- | --- | --- |
| `nativeReacquisitionBody`, `worksite_command_execution.ts:373` | J1, G1 | owner join, owner grant |
| `nativeCommandTaskBody`, `:427-428` | J1, G1 | same |
| `constructObservedWorksiteCommandExecutionTask`, `:481-482` | J1, G1 | same |
| `constructWorksiteCommandConfiguration`, `:1483` | J1 | owner join |
| `constructWorksiteCommandExecutionTask`, `:1619-1623` | J1, G1 | owner join, owner grant |
| `isWorksiteCommandExecutionTask`, `:1714-1715` | A, J1 | owner binding, owner join |
| `constructWorksiteConstructionTask`, `worksite_construction.ts:412-416` | J2, G2 | owner join, owner grant |
| `isWorksiteConstructionTask`, `:497-502` | B, J2, G2 | owner binding, join, grant |
| `constructWorksiteSubject` `worksite_effect.ts:790`; `constructWorksiteTerritory` `:872`; `constructWorksiteFileReplaceRequest` `:1079`; `constructWorksiteEffectAuthorization` `:1292`; `constructWorksiteFileParentsRequest` `:1754`; `constructWorksiteFileParentsAuthorization` `:1776` | J3 | owner join |
| `constructWorksiteEffectAuthorization`, `:1253` | C | owner binding |
| `selectedImplementation`, `:705` (used by both authorizations) | R2 | owner row |
| `taskSchema` → `isNativeWorkspaceWorkTask`, `constructNativeWorkspaceWorkTask`, `native_workspace_work.ts:33` | C behind a non-null-object guard | owner binding |
| `isNativeSemanticRevisionWorksite`, `semantic_revision.ts:73` | C behind a non-null-object guard | owner binding |
| `isLeafExecutionAuthority`, `leaf_execution_authority.ts:248` | R1 | owner row |
| `materializeContextBootstrap` `:387`, `materializeConfiguration` `:524`, through `validWorkspaceAndBinding` | D | owner binding; the workspace-coordinate join is kept |
| `admitGraphFunctionCatalog` `catalog.ts:446`, called from `execution_resolution.ts:461`, `catalog_operations.ts:299`, `declaration_closure.ts:53`, `declaration_application.ts:136` | E | `isResolvedProductLock`, then `isWorkspaceBindingCandidateInResolvedLock` |

No test or script imports `exactWorkspaceBinding`, the two copies of
`isExactWorkspaceBinding`, or the row checks.

### The owner accepts everything the callers legitimately pass

1. **Differential.** `t292-binding-row-owner-differential` vendors every copy above verbatim as an oracle.
   - Bindings: on 101 cases the owner's verdict equals A's. Every binding the owner accepts, B, C (as guarded) and D accept too, and its digest is the nine-field body digest.
   - Join: 4 authorities against 104 bindings. The owner equals J1; owner-accepted pairs are accepted by J2 and J3.
   - Grants: 11 grants against 2 bindings. The owner equals G1 and G2.
   - Candidates: 96 cases. Every candidate the owner accepts, E accepts.
   - Rows: 59 cases. The owner equals R1; owner-accepted rows are accepted by R2.
   - The owner never throws.
2. **What is tightened** (each copy accepted it; the owner refuses it). The sets are pinned in the test:
   - From B, 18 cases: leading space, trailing space or trailing newline on the five body strings; leading or trailing space on `admissionEventRef`; a root with a trailing space.
   - From C, 31 cases: B's 18, plus an extra top-level key (two cases), an array carrying the fields, four exotic `roots` members (accessor, symbol, non-enumerable, Proxy), and lone surrogates in five body strings and one root.
   - From D: 57 cases. From E: 35 cases.
   - From R2, 4 cases: an accessor field, a non-enumerable extra, a symbol extra, a lone surrogate.
3. **Producers** (read):
   - Admitted bindings are made at `abg/environment_admission.ts:417-425`, `:752-757` and `:1381-1386`. Each spreads a candidate that the strict candidate owner checked first (13 exact keys, digest over the I-JSON body), drops `kind` and adds `kind` and `admissionEventRef`. That gives exactly 14 keys.
   - Bindings rebuilt from the log spread that recorded, checked candidate: `abg/worksite_revision.ts:117`, `:128`; `abg/c_call_outcome.ts:293`.
   - Admitted rows are deep-frozen spreads of validated candidates (`abg/execution_basis.ts:1919-1931`). Rows rehydrated from the log are parsed JSON, so they hold only data properties.
   - The candidate owner refuses lone surrogates. So no admitted binding carries an extra key, a lone surrogate or a non-JSON root. Two string forms can reach an admitted binding, because the candidate owner's string predicate (`isNonblankString`) and `constructWorkspaceAuthorityBasis` accept them: a NUL, which every copy already refused, and padding, which A already refused. Padding is the only newly refused admitted value.
4. **Recorded inputs.**
   - Every JSON and JSONL file in the sparse checkout was scanned: `build_tenants`, `specification`, and `.ai-workspace`, including the default-library witness seed. It found one candidate and one admitted row, both in `test_env/proof/abi5-root-r10.events.jsonl`.
   - The candidate is exact. The row (line 5) lacks `graphFunctionOwnerProductId`, `graphFunctionPublicationDigest`, `implementationOwnerProductId` and `implementationPublicationDigest`. Both row copies require all 32 keys, so both refuse it today; nothing changes.
   - A grep of the test sources finds no padded binding string.
   - Three env-gated tests read a recorded subtree outside the sparse checkout: `t287-s03-automatic`, `t287-selected-action` and `t287-continuation-causation`. The last feeds the recorded catalog readiness basis of `attempt-07/continue-call.json`.
   - That subtree, `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s7-pending-consumer-01`, was scanned from the git tree without changing the sparse settings. It has 197 matching files, 2.4 GB. They hold 122 candidates, 42 admitted bindings and 246 admitted rows. Every one has the exact key set, trimmed NUL-free strings and six absolute roots; there were 0 anomalies.
   - Not scanned: the rest of the commentary tree. About 1,250 further tracked JSON, JSONL and stdout files name these kinds, about 26 GB, under `.ai-workspace/comments` and `.ai-workspace/work`. No test in this checkout reads them; `t287-default-library` names one retained C2 stdout as provenance and embeds its bytes.
5. **The caller suites are green** (section 3).
6. **The weak guard's acceptance is now observed, not inferred.** On the pre-change build, the three lanes of `t292-workspace-binding-extra-key` failed exactly where the extra-key value was accepted:
   - `isNativeWorkspaceWorkTask` returned `true` (`:50`);
   - `isNativeSemanticRevisionWorksite` returned `true` (`:64`);
   - `constructWorksiteTerritory` returned a `worksite_territory` (`:73`).
   - All three controls passed.

## 2. The change

Owners. Each is `@internal`, so `stripInternal` keeps every declaration byte-identical.
- `product/environment.ts`:
  - `isExactWorkspaceBinding` is copy A, moved.
  - `exactWorkspaceAuthorityJoin` is J1 over it.
  - A private `hasWorkspaceBindingIdentity` holds the nine-field body, the `admitJson`, the digest and the identity comparison. The strict candidate check (`workspaceBindingCandidateMatches`) had the same tail and now calls it.
  - The constructor (`:1109-1178`) is untouched.
- `product/invocation.ts`: `isExactDirectGrant`, the G1 text, sits beside `isCapabilityGrantValue` and `constructInvocationCapabilityGrant`, which own the run-invocation grant.
- `abg/execution_basis.ts`: `isExactAdmittedImplementationRow`, copy R1 with its fields table. It sits beside `selectAdmittedImplementationResolution`. The row constructor is at `:1919-1931`.
- `shared/admit/record.ts`: `hasExactDataFields`, moved verbatim from `leaf_execution_authority.ts`. Both the row owner and `isLeafExecutionAuthority` use it.
- `shared/admission_predicates.ts`: `isTrimmedNonblankNulFreeString`, the predicate A used. `worksite_command_execution.ts` imports it under its old local name `nonempty`, which has 45 other uses there.

Deleted:
- A, J1, G1 and `nonempty`;
- B, J2, G2;
- C's body and J3;
- R1 (with the local `hasExactDataFields`) and R2;
- D;
- E's digest and checks.

Callers import the owners:
- `native_workspace_work.ts` now reads `v.custom<WorkspaceBinding>(isExactWorkspaceBinding)`.
- `semantic_revision.ts` calls the owner directly; it does its own `isRecord`.

Kept on purpose: `exactWorkspaceBinding` stays exported from `worksite_effect.ts` as a one-line delegate with the same signature.
- `worksite_effect.d.ts` is one of the declarations pinned in 47 `./validator` contract rows. Deleting the export would change it and so move the Public contract catalog.
- The delegate has no caller.

Same refusals. Every caller returns the refusal code and message it returned
before. Where an old weak copy threw, the caller now returns that existing
refusal:
- C, on a `null` binding;
- D and E, on a binding missing a body field, because `sha256Canonical` throws on `undefined`.

Unchanged:
- No identity formula, digest input or admitted byte changed. The owners digest the same nine fields, after the same `admitJson` the strict copies used.
- All 496 `.d.ts` files under `build/` are byte-identical (sha256 before and after).
- `publicContractCatalog.catalogDigest` is unchanged: `sha256:a67e743ca8fb775927c6ad67394d41797632d7895a9e7a9edce966ffb0f073f7`.

Import direction:
- `lint:imports`, `lint:lifecycle` and `lint:calculus` are green.
- One new runtime edge: `product/worksite_effect` → `abg/execution_basis`. `execution_basis` already value-imports `worksite_effect`, and other `product/` and `implementation/` modules already value-import `execution_basis`.
- Each of the 14 touched modules and all 15 `package.json` exports loads as a fresh entry in its own process, with no TDZ error.

## 3. Tests

New lanes, one file each. Each ran red on the pre-change build and green after.

| File | Tests | Red on the old build | Green after |
| --- | --- | --- | --- |
| `t292-workspace-binding-extra-key` | 3: native work input admission (`isNativeWorkspaceWorkTask`, `constructNativeWorkspaceWorkTask`); native semantic revision worksite; territory, subject and file-parents construction | 3 failed: the extra-key binding was accepted | 3 pass |
| `t292-binding-row-owner-differential` | 5: binding, join, grant, candidate, row | 4 failed: owner not exported. The candidate test passes on both builds, because its owner already existed | 5 pass |

In each lane the extra key leaves every other coordinate valid:
- the nine-field digest and the identity;
- the grant's `scopeRef` and `scopeDigest`;
- the context's binding identity and digest.

So only the key set can refuse the binding. Each lane also carries the exact-binding control, which is admitted.

Reruns, one file at a time on the final build
(`TMPDIR=/private/tmp/abg-td36-tmp`), chosen by searching `test_env/tests`
for the touched functions and operations:

| File | Touched caller it exercises | Tests | Pass | Fail | Skip | Wall s |
| --- | --- | --- | --- | --- | --- | --- |
| `t292-workspace-binding-extra-key` (new) | native work input, semantic revision, construction | 3 | 3 | 0 | 0 | — |
| `t292-binding-row-owner-differential` (new) | every owner and every deleted copy | 5 | 5 | 0 | 0 | — |
| `t287-native-workspace-work` | native workspace work | 44 | 43 | 0 | 1 | 2 |
| `t287-native-work-currentness-consumers` | native work, semantic revision, execution basis, worksite effect | 6 | 6 | 0 | 0 | 38 |
| `t287-native-semantic-revision` | semantic revision | 7 | 5 | 0 | 2 | 2 |
| `d2-binding-transition` | semantic revision | 10 | 0 | 0 | 10 | 0 |
| `t287-worksite-construction` | worksite construction | 3 | 3 | 0 | 0 | 93 |
| `t287-generic-job-worksite` | construction (subject, file replace, file parents), worksite effect | 9 | 9 | 0 | 0 | 1 |
| `t287-post-binding-worksite-write` | worksite effect, file replace request | 2 | 2 | 0 | 0 | 55 |
| `t287-c2-child-program` | command execution (C2 module publications) | 4 | 4 | 0 | 0 | 0 |
| `t287-observed-worksite-command` | command execution | 8 | 8 | 0 | 0 | 1 |
| `t287-c2-core-environment` | command execution, construction | 7 | 7 | 0 | 0 | 1 |
| `steel-basic-cli-c2` | command execution | 6 | 0 | 0 | 6 | 0 |
| `t287-worksite-command-execution` | command execution | 12 | 12 | 0 | 0 | 324 |
| `t287-native-worksite-execution` | leaf execution authority (admitted row), catalog | 7 | 4 | 0 | 3 | 0 |
| `w2-steel-single-start-closure` | leaf execution authority, command execution | 8 | 0 | 0 | 8 | 0 |
| `r4-catalog-admission` | catalog consumers (it stubs `admitGraphFunctionCatalog`, so it does not reach the changed branch) | 8 | 8 | 0 | 0 | 0 |
| `m5-fresh-process-reconstruction` | catalog: asserts the changed branch's `binding_lock_mismatch` refusal | 1 | 1 | 0 | 0 | 42 |
| `t287-required-operation-bindings` | materialization: `product.materialize#context_bootstrap` and `#configuration` with a real binding reach `validWorkspaceAndBinding` | 10 | 10 | 0 | 0 | 199 |
| `r3-workspace-binding` | binding candidate and admitted binding | 1 | 1 | 0 | 0 | 36 |
| `t287-default-library` | execution basis, command execution, construction, native work | 37 | 34 | 0 | 3 | 323 |
| `npm run test:r1` | candidate basis | 1 | 1 | 0 | 0 | — |
| `npm run test:r2` | candidate basis | 2 | 2 | 0 | 0 | — |

Every skip is an environment gate: retained or captured evidence outside the
sparse checkout, or the live-invocation switch. This package changes no gate,
so these lanes skip on the old build too:
- `ABI5_EVIDENCE_ROOT` (the D1 lifecycle bridge input): `d2-binding-transition` 10, `t287-native-semantic-revision` 2;
- `ABI5_STEEL03_RETAINED_*` (eight retained installed prefixes): `w2-steel-single-start-closure` 8;
- `ABI5_C2_CARRIER_FIXTURE_PATH`: `steel-basic-cli-c2` 6;
- `ABG_NATIVE_EXECUTION_RETAINED_LOG` 2 and `ABI5_NATIVE_SOURCE_READY_CATALOG` 1: `t287-native-worksite-execution`;
- `ABI5_NATIVE_WORK_RETAINED_ROOT`: `t287-native-workspace-work` 1;
- `ABI5_DEFAULT_LIBRARY_LIVE`, `ABI5_NATIVE_OBSERVATION_CAPTURE` and `ABI5_PLANNING_PROJECTION_CAPTURE`: `t287-default-library` 1 each.

Totals over the 19 rerun files: 190 tests, 157 pass, 0 fail, 33 skip. No rerun
file went red, so no exercised shipped path depends on the weaker acceptance.
Stop condition 1 did not fire. The 33 skipped lanes are the unexercised part;
the scan in section 1 covers their retained logs only where they sit inside
the sparse checkout.

Lints:
- `lint-verification.mjs` over `test_env/qualification/recipe/verification-recipe.json`: 72 of 72 files pass.
- `lint:imports`, `lint:lifecycle` and `lint:calculus` pass.
- `node --check` passes on both new files.

## 4. Pins

| Value (file) | Old | New |
| --- | --- | --- |
| `productContentDigest` (`product-toolchain-manifest.json`; also in `contracts/capabilities/capability-definition-graph.json`) | `sha256:8dd660a18d2c518f112ebdfdb69d5ec2f10816812e65a6534b5ae4a61895884d` | `sha256:c46cd50ffdfa1943ef17642c6b0fed1f0c343fca94f70223d90e62f9f61a1c84` |
| `contributionManifestDigest` (manifest) | `sha256:9c798d45d19cb5d8d7bcdb7c8868fafe21b2f094eed354bbf940f3b0507b7501` | `sha256:3c104740283c7317960566f81fc96d7a00101676b2739ec687004197089da9ea` |
| capability graph `graphDigest` (manifest, graph file) | `sha256:ce951c8cdaee13bb21e2291dfe44fd7c23391ad472e59f107371bccb4d051f95` | `sha256:f9e6457b54b1bc548c00137a26d6790995e92cab20967479da832539a77590b2` |
| capability graph asset `contentDigest` (manifest) | `sha256:01c0c7403fb2db7b5d957a313966926178c622f64390549c799167cf21c49dc6` | `sha256:5be41ce6948b9395ff8ba710a94a18732e2c98be9acb010119875e0e48dd2dac` |
| C2 renderer member `digest` (`code/src/gtl/worksite_command_execution.ts:37`; the inventory record) | `sha256:b43945f5d9d0dd383bc502ad37974eb8ab50582247af0c93df8149c3193e8790` | `sha256:07e215991ca034efad5efb3656b53b9a9311116f2c57a718b27c789cef7d90df` |
| C2 renderer member `byteCount` (`:39`) | 119249 | 116370 |
| C2 renderer span `startByte` / `endByte` (`:61`) | 109164 / 111596 | 106285 / 108717 |
| C2 renderer span `spanDigest` (`:61`) | `sha256:1fcd71846ed7a57571a96bf3bb6475aeaba3d4f89eafb121969c157904a896bf` | unchanged |
| C2 context inventory record (`contracts/worksite/command-execution-context.inventory.json`), its sha256, which is the declaration's `recordDigest` | `sha256:7bc5c5edda1829087b3e746c3406a3a90917a0014442444ef99b2e423df196fd` | `sha256:0ac89411f29ea362291a2c1a2ec4a444f9b3e3190e2fa31132e6e2296ee938ad` |
| candidate basis `artifactDigest` (`test_env/fixtures/abi5-root-candidate-basis.json`) | `sha256:b86eca8cd332becc3842f3a05b79846bdb877b5ded986e2b5a47a979ba7f46e3` | `sha256:a03f1f7be520ef047a36946c16b0e4041469ddd5d9918cbb7930ad4b1b308c2a` |
| candidate basis `productContentDigest` | `sha256:8dd660a1…884d` | `sha256:c46cd50f…1c84` |
| candidate basis `manifestDigest` | `sha256:96aa674bf7e5d56af16415ba78ac568e5e2ef3aff4172c0f3823cababc5e3361` | `sha256:abc60f8b7bb1254cff3d2e6bebd830130ccbacbdbc5c2ce5ecf08286d5ddae41` |

The manifest:
- 70 leaf values changed, the same shape as TD-35: the 49 row `provenanceRef`s, the 10 `publicationBindings` digests, and the identity refs and digests above.
- The `publicContractCatalog` and the `productRelativeLocators` are unchanged.

The C2 pin:
- The C2 publication declares the exact bytes of the built `product/worksite_command_execution.js` as its renderer context member, and the generator refuses the build when they differ.
- Deleting the copies from that file therefore changes C2's run-environment declaration content (member digest, byte count, span offsets, inventory record digest), not only the product identity. The renderer text and its span digest are unchanged.
- This is routine: each of the six earlier commits that edited the file updated the pin in the same commit (`0f6258433`, `b78409e76`, `bf7119489`, `d1e4527db`, `bcb1faf63`, `27c08ce59`).
- A grep of `code/src` and `scripts` finds no other byte pin on a built file.

The candidate basis was refreshed with `node scripts/refresh-candidate-basis.mjs`, run from T. `npm run test:r1` and `npm run test:r2` pass on it.

Old values still named in tracked text:
- `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:724-733` names the old C2 member digest, byte count and offsets. It narrates the change that set them. That is design history, not a pin, so I left it (TD-64).
- No other tracked file under `build_tenants/` or `specification/` names an old value.

## 5. Deviations

- **The size stop fired** (section 0).
- **The strictest binding copy is A, not "A and B".** The owner adopts A's trimmed string predicate. So construction, file replace, file parents, subject, territory, native work, semantic revision and materialization now refuse a binding string with leading or trailing whitespace. Command execution already refused it. No fixture, test or scanned log holds one.
- **`exactWorkspaceBinding` kept as a delegate**, to keep the Public declaration surface unchanged (section 2).
- **The C2 pin moved** (section 4).
- **Throw becomes refusal** on malformed input in the copies C, D and E (section 2).
- **`hasExactDataFields` and the trimmed predicate moved to `shared/`** rather than staying private to the row owner and the binding owner. Each now has one copy.

## 6. Residual risks and residuals

Ruling 1 ("every copy is deleted") is therefore not fully met. These are other
copies of these rules. The reviews did not name them, and I left them
unconverted because the size stop had fired:
- `abg/environment_admission.ts:1103` `hasAdmittedWorkspaceBinding` digests the nine-field body and checks nothing else. Callers: `abg/actor_process.ts:877`, `abg/continuation.ts:1152`, `product/project_read_definition_bindings.ts:690`.
- `native_workspace_work.ts:39-41` holds an inline join and grant. The join has no `workspaceId` comparison; the grant has no `memberKey` check. The owner join and owner grant would tighten both.
- `worksite_effect.ts` `isWorksiteFileReplaceRequest` holds the G1 grant rule inline, keyed by the request's binding identity and digest.
- `worksite_effect.ts` `exactImplementationSet` digests the set body without `admitJson`. It is not a copy, since no other set check exists, but it is the same weakness R2 had.
- The candidate owner's string predicate (`isNonblankString`: padding and NUL allowed) is weaker than the admitted owner's. An authority or binding with a padded `workspaceId` or actor can be admitted and is then refused by every worksite consumer.
- `implementation/worksite_command_helper.ts:122` holds another copy of the trimmed predicate.
- The `exactWorkspaceBinding` delegate is an exported second name with no caller (TD-44 or TD-47).

Other risks:
- The retained and captured inputs behind the 33 skipped lanes sit outside the sparse checkout and were not scanned. For those inputs, stop condition 1 is unverified. Run those lanes with their evidence roots set before merge.
- The qualification inventory pins member digests, and this package moves several (source files, the manifest, the capability graph, the C2 record, the candidate basis). As at TD-35, that refresh is a cut-level step and is not done here.
- `lint:evidence` was not run. It reads `.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json`, which is outside the sparse checkout.
