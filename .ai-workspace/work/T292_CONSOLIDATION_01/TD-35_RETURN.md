# TD-35 Return: one start-law owner; a `graph_function` start is a direct start

Writer: Claude Opus 5.5. Branch `claude/td35-start-law` from `main` at
`7928c58cc`, worktree `/private/tmp/abg-td35` (sparse). Change class:
realization_refactor. No push, no tag. T = `build_tenants/abiogenesis/typescript`.

| Commit | Content |
| --- | --- |
| `d269cfad6` | the change, with the regenerated manifest and capability graph |
| `0c86daf07` | the two lanes |
| `67a01f13c` | refreshed candidate basis |
| this commit | this Return |

## 1. Census

Every place that starts by `graph_function` target, found by searching T's
`code/`, `scripts/` and `test_env/` (tests, support, qualification, fixtures,
uat, falsifiers, proof, types) and the default-library witness seed. Root-mode
policies come from the built publications (all shipped module publication
constructors run with a dummy basis) and, for fixtures, from the Program
literal.

| # | Site | Path into start law | Program | Root-mode policy | Stated `rootMode` | Reached from |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `test_env/tests/t287-st1-installed-cross-owner-hello.test.mjs:2015-2083` (`sdkStart("graph-function-start")`) | SDK `constructInstalledStartCall`, then the installed transport (Product, then ABG) | language-smoke `program://abi5-tests/language-smoke@5` | direct | direct | ST-1 |
| 2 | `test_env/qualification/dispatch.mjs:106-128` `startCall` | SDK `constructInstalledStartCall`; `dispatchLive` then runs the transport | C2 `worksite/command-execution@5`, `qualification/assess@5`, `qualification/ruling@5`, `qualification/self-conformance@5`, `qualification/exact-candidate@5`; developer-mini ticket Program | direct (all) | direct | ST-1 developer mini (ticket); `t287-rp2-behavior-carriers` (ticket); `support/exact-candidate-qualification.mjs:603` |
| 3 | `dispatch.mjs:56-65` `populateStart` | `populateProductRunInvocation` | C2 `worksite/command-execution@5` | direct | direct | `observedC2Task`, from `support/exact-candidate-qualification.mjs:483,504,615,761` |
| 4 | `dispatch.mjs:39-52` `rootResolution` | `ProductExecutionResolutionPort.resolve`, graph_function selection | the same five Programs | direct | direct | no caller in this checkout |
| 5 | `test_env/support/installed-qualification-conservation.mjs:383-401` `constructStart` | SDK `constructInstalledStartCall` | `assess@5`, `self-conformance@5`, `exact-candidate@5` | direct | direct | `t287-installed-qualification-conservation.test.mjs:262,287,315` |
| 6 | `test_env/tests/t287-selected-execution-closure.test.mjs:147` | `ProductExecutionResolutionPort.resolve` | language-smoke `program://abi5-tests/language-smoke@5` | direct | direct | itself (skipped unless its evidence roots are set) |
| 7 | `test_env/types/framework-handoff.compile.ts:171,359` | types only; never runs | none | none | direct | `t287-framework-handoff-types` |
| 8 | `test_env/tests/t287-w2-05-static-binding-algebra.test.mjs:139` | slot rule of the static binding; no Program, no start law | none | none | its default request is target `next`, `supervised` | itself |
| 9 | `test_env/tests/t287-wave2-owner-contract-source-set.test.mjs:392` | slot-name list only | none | none | none | itself |

No `graph_function` start:
- The default library tests and flows: every start is target `next` through `support/registered-graph-selection.mjs` `constructInstalledStartCall` (default `rootMode: "direct"`) or a `next` resolution (`t287-default-library.test.mjs:1538`, `:2729`); the library itself issues no Public start (no start constructor in `abg/`, `hog/`, `gtl/`, `implementation/`).
- The amendment witness (`support/amendment-witness-run.mjs:56`): target `next`, direct.
- uat (`uat/public-setup.mjs:412`, `uat/continuation.mjs:319`, `:370`): target `next`, direct.
- The CLI (`public/cli.ts`) passes the caller's invocation to the transport and builds no target; the SDK constructor takes the caller's selection.
- The witness seed, the sandbox-uat fixtures and `test_env/proof/abi5-root-r10.events.jsonl` (`graph_function` there is only a catalog contribution kind).
- The Python tenant is a separate tenant and does not call this Public start.
- The live RC12 Run: per the refutation pass its only Public start is target `next`, `rootMode: direct`. Its evidence is outside this sparse checkout and was not re-read.
- Repositories and paths outside the sparse checkout were not searched.

Supervised Programs:
- Shipped: `program://abg/system/consensus-one-surface@5`, with one start (`one-surface@5`) and eight callable members (`fh-escalation-finalizer@5`, `fh-escalation@5`, `one-surface@5`, `reviewer@5`, `round@5`, `submitter-reviewer-fold@5`, `submitter-reviewer-rounds`, `submitter@5`); before this change each member could be started by `graph_function` handle. And `program://abiogenesis/worksite/revision-command-execution@5`, with no start and one member; its source comment says the supervised policy exposes no root entry for that child arm, and the bypass gave it one. Every other shipped Program declares `abg.root_mode: "direct"`; none lacks the policy.
- Fixtures: developer-mini One Surface, `exact-intent-product`, `t287-s03-automatic-product` and `t287-selected-action-product` roots, and the in-test override in `r5-invocation-admission.test.mjs:315`. None is started by `graph_function` handle.

Result: every census site states `rootMode: "direct"` against a direct Program. No stop condition fires. For the separate question in ruling 3: no site in this checkout states `supervised` with a `graph_function` target.

## 2. The change

The owner is `gtl/public_start.ts`.
- `directStartRefusal` (private) holds the direct start law once: until `converged`, no caller-selected start, and a Program whose `abg.root_mode` is `direct`. It returns the existing `unsupported_control` refusal with the existing message. `scopeRefusal` (private) holds the scope rule once.
- `resolveProgramStart` calls both. Its behaviour is unchanged: the old and new built functions give canonically equal results on all 16,128 cases of a grid over scope, until, stated root mode, start reference (absent, equal to the target, different, missing), Program policy (direct, supervised, absent, other), default start (present, absent), asset targets (present, absent, duplicate), start sets (two, none, duplicated) and targets (`next`, three asset handles, two start refs, junk). There were 0 differences.
- `graphFunctionStartRefusal(program, {scope, until})` is new, marked `@internal` and not re-exported from `gtl/index.ts`. It is `scopeRefusal ?? directStartRefusal(program, {until})`. It never reads the stated `rootMode` (ruling 3).

Callers:
- `product/execution_resolution.ts`, graph_function branch: the owner runs before the CatalogView lookup. A refusal maps through `programStartRefusal`, the existing three-way mapping that is now shared with the `resolveProgramStart` branch. The result is `incompatible_or_unproven` / `catalog` with the owner's message. At the Public surface this is `invalid_target` `["/program"]`, the refusal a direct `next` start against a supervised Program gets.
- `abg/invocation_admission.ts`: `graphFunctionStartRow` is computed only when the owner admits. On refusal admission refuses `selection_mismatch` ("Product start revalidation found no catalog definition"), the code and message a refused `next` start gets there.
- Admitted starts take the same path as before. `publicStart` construction is unchanged, so the recorded `rootMode` stays as stated.
- The change alters no admitted event for starts admitted today. Events written by new Runs differ only where they carry the moved product identity (section 4).

Not touched: the invocation-variant `direct` guards (`abg/invocation_admission.ts:955-963`, `product/invocation.ts:1138-1146`). They guard the `invoke` member, not starts. No schema, refusal code set or event shape changed.

Size: 74 source lines added and 28 removed in three files; the tests add 105 lines and remove 2.

## 3. Tests

The red phase ran on the pre-change build with the new lanes in place.
- `t287-c2-child-program` failed (`graphFunctionStartRefusal is not a function`).
- ST-1 developer mini failed at the resolution control. A `graph_function` start of developer-mini's One Surface member against its supervised Program returned `loaded_product_execution_resolution`, so the bypass was observed running, not only by reading. In the same run, the new direct-Program `publicStart` assertion passed.

Both are green after the change.

New lanes:
- ST-1 developer mini (`t287-st1-installed-cross-owner-hello.test.mjs`).
  - Supervised: a `graph_function` start of `oneSurfaceGraphFunctionRef` against `oneSurfaceProgramRef`, stated `direct` and stated `supervised`, through the shipped SDK `constructInstalledStartCall`, is refused with the same owner output as a direct `next` start there (`invalid_target`, `["/program"]`). Product resolution gives the same refusal object. Zero bytes are appended.
  - Controls: the handle is an exact catalog member of the Program, and it resolves by direct selection with policy `supervised`.
  - Direct: the ticket `graph_function` start under its direct Program completes, and its `invocation_admitted` record carries `publicStart` `{target: "graph_function:<handle>", rootMode: "direct", startRef: <definitionRef>, …}`.
- `t287-c2-child-program`: the owner refuses a `graph_function` start of the shipped revision child with exactly the `next` direct-start refusal, and admits one of the direct command-execution root.

Reruns, one file at a time on the final build (`TMPDIR=/private/tmp/abg-td35-tmp`):

| File | Why | Tests | Pass | Fail | Skip | Wall s |
| --- | --- | --- | --- | --- | --- | --- |
| `t287-st1-installed-cross-owner-hello` | census rows 1–2; the new lanes | 3 | 3 | 0 | 0 | 127 |
| `t287-c2-child-program` | calls `resolveProgramStart`; new owner lane | 4 | 4 | 0 | 0 | 0 |
| `t287-selected-execution-closure` | census row 6 | 1 | 0 | 0 | 1 | 1 |
| `r5-invocation-admission` | ABG admission; supervised override | 2 | 2 | 0 | 0 | 79 |
| `m5-s03-authority` | supervised Program starts through `resolveProgramStart` | 5 | 5 | 0 | 0 | 117 |
| `t287-exact-construction-intent` | supervised declared start through `resolveProgramStart` | 1 | 1 | 0 | 0 | 65 |
| `t287-default-library-prerequisites` | named | 7 | 7 | 0 | 0 | 0 |
| `t287-amendment-witness` | named | 13 | 12 | 0 | 1 | 847 |
| `t287-installed-qualification-conservation` | census row 5 | 1 | 0 | 0 | 1 | 0 |
| `t287-rp2-behavior-carriers` | census row 2 (ticket) | 1 | 1 | 0 | 0 | 59 |
| `t287-default-library` | named | 37 | 34 | 0 | 3 | 336 |
| `r1-packed-artifact` | pin (candidate basis) | 1 | 1 | 0 | 0 | 29 |
| `r2-clean-install` | pin (candidate basis) | 1 | 1 | 0 | 0 | 52 |
| `r3-workspace-binding` | pin (candidate basis) | 1 | 1 | 0 | 0 | 36 |
| `t287-public-groups` | export surface | 3 | 3 | 0 | 0 | 24 |
| `hello-product-boundary` | export surface | 1 | 1 | 0 | 0 | 6 |
| `lint-verification.mjs` over the verification recipe (run from T) | lint | 72 files | 72 | 0 | 0 | 1 |
| `lint:imports`, `lint:lifecycle`, `lint:calculus` | lint | 3 | 3 | 0 | 0 | 1 |

Every skip is an environment gate, not a failure:
- selected-execution-closure needs `ABI5_SELECTED_CLOSURE_*`.
- The amendment witness live case needs `ABI5_AMENDMENT_WITNESS_LIVE=1`.
- Conservation needs `ABI5_INSTALLED_CONSERVATION_*`.
- The default library skips need `ABI5_PLANNING_PROJECTION_CAPTURE`, `ABI5_NATIVE_OBSERVATION_CAPTURE` and `ABI5_DEFAULT_LIBRARY_LIVE=1`.

R1 was run before the basis refresh and failed with `artifact_digest_mismatch`; it passed after.

Two lints did not run in this checkout:
- `npm run lint` needs a recipe argument, so it was run directly with the verification recipe (the table row above).
- `lint:evidence` reads `.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json`, which is outside the sparse checkout. It checks tree copies under `.ai-workspace/` and a 6 MB size bound. This package adds one small Return there. The moved manifest (3,276,114 bytes), capability graph and candidate basis keep their byte counts.

Export surface: `graphFunctionStartRefusal` is a new runtime export of `build/code/src/gtl/public_start.js`. It is not re-exported from `gtl/index`. No test or script enumerates that module's runtime exports; the only namespace walker, `support/malformed-gtl-native-fixture.mjs`, re-exports whatever keys exist.

## 4. Pins

No `.d.ts` changed. The `.js` changes move the product identity. `npm run build` regenerated two tracked files, committed in `d269cfad6`:

| Value (file) | Old | New |
| --- | --- | --- |
| `productContentDigest` (`product-toolchain-manifest.json`; also inside `contracts/capabilities/capability-definition-graph.json`) | `sha256:dcfbcf4268a08efb15616507fb74bdc19fb0bb504342cd56b3df5dd5bf1fd106` | `sha256:8dd660a18d2c518f112ebdfdb69d5ec2f10816812e65a6534b5ae4a61895884d` |
| `contributionManifestDigest` (manifest) | `sha256:faeee795ed420874535802cfa738b1843901baea3babe66f0e4237863a4355a7` | `sha256:9c798d45d19cb5d8d7bcdb7c8868fafe21b2f094eed354bbf940f3b0507b7501` |
| capability graph `graphDigest` (manifest, graph file) | `sha256:a28d5a126ce81887f1d0313098d03582546d31fabadd4c9dbd557be3caabbbc3` | `sha256:ce951c8cdaee13bb21e2291dfe44fd7c23391ad472e59f107371bccb4d051f95` |
| capability graph asset `contentDigest` (manifest) | `sha256:4c49d55f8eb76d399bc36720a022970e93ccd1f92ee2c6da9fbe70e65a1b11fc` | `sha256:01c0c7403fb2db7b5d957a313966926178c622f64390549c799167cf21c49dc6` |

Every other manifest change derives from these. The descriptor, contribution-manifest and provenance refs carry the content digest, at top level and inside `contributionManifest`. The 49 contribution-row `provenanceRef`s and the 10 `publicationBindings` digests carry the publications' product identity. 70 leaf values changed in all. The `publicContractCatalog` and the 5,325 `productRelativeLocators` are unchanged.

Pin that went red and was updated (`67a01f13c`, by `scripts/refresh-candidate-basis.mjs`). `test_env/fixtures/abi5-root-candidate-basis.json` is read by R1, R2 and R3; installed setups with `packed_artifact` override it:

| Field | Old | New |
| --- | --- | --- |
| `artifactDigest` | `sha256:db80a5dac52fac5a859daf45a646e21209e538c7093b443ffca6532e6be9e3ca` | `sha256:b86eca8cd332becc3842f3a05b79846bdb877b5ded986e2b5a47a979ba7f46e3` |
| `productContentDigest` | `sha256:dcfbcf42…d106` | `sha256:8dd660a1…884d` |
| `manifestDigest` | `sha256:644edeccc157dd7daf36463237ddd22f4fb4063ff4ba50c72e6b32218f3ba3d3` | `sha256:96aa674bf7e5d56af16415ba78ac568e5e2ef3aff4172c0f3823cababc5e3361` |

After the refresh, no tracked file under `build_tenants/` or `specification/` names any of the six old digests except `specification/GOALS.md:5`. That line records the RC12 cut's artifact digest as status. It is history, not a pin, so I left it.

## 5. Deviations

- Predicate: refuse unless the policy is `direct` (`!== "direct"`), not only when it is `supervised`. This is the existing direct start law, so the rule has one copy. Under REQ-P-POLICY-013 an absent policy means the default, `supervised`. The census shows every shipped Program declares the policy and every `graph_function` start site targets a direct Program, so the two predicates agree on everything that exists.
- The brief expected `npm run build` to leave no tracked change unless an exported declaration changed. That premise does not hold. `productContentDigest` digests every payload file, including `build/**/*.js`. Any source change therefore moves the manifest and the capability graph, even when no declaration changes. Here `gtl/public_start.d.ts` and `gtl/index.d.ts` are byte-identical (diffed). The `publicContractCatalog`, whose 47 rows carry the declaration inventories, is unchanged, and so are the 5,325 locators.
- My first red run of the ST-1 lane was killed (33.7 GB RSS), because an eager `JSON.stringify` of a loaded resolution was used as an assertion message. The lane now compares small projections only.

## 6. Residual risks

- The ABG guard is reachable only by a caller that bypasses Product preparation, because Product refuses first on every Public path. No lane drives `admitExactInvocation` directly with a `graph_function` start under a supervised Program. The guard is covered by reading and by the shared owner.
- Census rows 4–6 were not executed:
  - Row 6: `t287-selected-execution-closure` skips without its evidence-root variables.
  - Row 5: `t287-installed-qualification-conservation` skips the same way.
  - Row 4: `dispatch.mjs` `rootResolution` has no caller in this checkout.
  - All three name direct Programs with `rootMode: "direct"`, which the owner admits. `startCall` (row 2) did run, through ST-1 and rp2.
- The qualification inventory (`complete_claim`) pins member digests. This package moves several of them: three source files, two tests, the manifest, the capability graph and the candidate basis. The inventory was already stale on `main` (its manifest digest `d00532a5…` differs from main's file). That is a cut-level refresh (qualification mirrors) and is not done here.
- Ruling 3 stays open: a caller may still state `supervised` with a `graph_function` target against a direct Program, and it is recorded as stated.
