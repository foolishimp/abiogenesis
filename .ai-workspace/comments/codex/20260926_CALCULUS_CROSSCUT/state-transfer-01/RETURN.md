# Product Frame

Writer return for **T287_CALCULUS_REPAIR_01, rank 1**, under the forced-ranked repair grant. ABIogenesis fixed fifteen-family ABG5, GOAL035/T287/LIFE01; trusted single-developer desktop. HEAD `420336a50b8fbec42ab244521cfa4d8a0351c4af`; Product SHA256 `bb0c211a3fe04be9b3d8a12779387f6b26e3e0d0bd2bf513cf7fe826c8ba5176`, verified again at return. Exact ABI STDO `v2.5.1-rc.1`, manifest `5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64`; Executive's earlier immutable-release verification remains the authority. GLC remains RC4.

Selected frame: `STDO_REFERENCE_FRAME_BASELINE.md#derived-end-to-end-interface-integration-frame`, joined to project `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration`, with Owner/Conservation/Proof. Product execution/context calculus and CCALL-018 / CONTINUATION-015/016 govern the bounded repair. Distribution/risk policy remains tenant-only; the earlier HOW distribution hunk is preserved.

**Disposition: frozen local source candidate for independent Reviewer. Native continuation remains HOLD.** No commit, release selection, provider, native actor, retained journal scan, or reauthoring occurred. Scratch pack/install was used only under the Executive's explicit deterministic-test extension. The review role closed before this Writer activation; this return is not independent review or Product qualification.

## Realization and owner retention

Paths below are relative to `build_tenants/abiogenesis/typescript/`.

- `code/src/abg/traversal_cursor.ts:267,299,328,369` projects one admitted cursor's input reference/digest/value and existing origin, reconstructs a failed call's opened cursor, and recovers the enclosing batch entry along admitted cursor ancestry. Existing cursor identities and event facts remain authoritative. No carrier, controller, cache, cursor copy ledger, or admission gate was introduced.
- `code/src/gtl/source_path.ts:476,583,933,1049` selects the batch actually being advanced from its target path, including outer advancement after an inner batch. Shared batch continuation receives the enclosing-entry input explicitly; fan-out continues selecting its declared member. Pure nested continuation without that input refuses instead of silently substituting the last leaf's input.
- `code/src/hog/graph_execute.ts:502,638` transfers the selected admitted value after both leaf and structural progress. It removes the ordinary-batch use of `completion.resultValue` and structural value fallback where the selected cursor carries a different input. Existing implementation/ABG checks remain.
- `code/src/abg/execution_basis.ts:199` uses the same current-input relation for native assembly, preserving retained-input contract and provenance checks. `code/src/abg/semantic_revision.ts:155–188` reconstructs the failed consumer input and uses `worksite_input_provenance.ts` to select its exact successful leaf producer, including lawful foldback. Both assessor and conditional author recovery joins compare that producer and current value, not the immutable basis raw entry.
- The old per-role-basis recovery fixtures are replaced with explicitly scoped Product value tests at `test_env/tests/t287-native-semantic-revision.test.mjs:344,361`. They preserve accepted assets, pending Design candidate/source, binding versions and assessment-first declaration; they no longer claim intake/admission closure from supplied authentication.
- HOW clarification: `design/ABI5_REALIZATION_CONSTITUTION.md:3342`. Existing Product/GOALS/ticket and context-owner files were not edited by this Writer. Executive's concurrent `projectSemanticJobBindings` import correction in `semantic_revision.ts` is included in the coherent source cut.

## Complete bounded continuation caller map

| Existing route | Final relation / caller |
|---|---|
| Leaf completion | `hog/ccall_lifecycle.ts:687` passes the result-prefix authority view to `deriveCompletedTraversalCursor` |
| Workflow and retained-input completion | `hog/workflow_lifecycle.ts:798` passes the exact outcome-prefix authority view; existing retained pair construction stays with its owner |
| Fan-out completion | `hog/workflow_lifecycle.ts:935` passes the completion-prefix authority view; GTL member/vector semantics remain distinct |
| Recursion evaluator completion | `hog/recursion_lifecycle.ts:209` passes its exact authority prefix |
| Interaction completion | `hog/interaction_resume.ts:96` passes its exact authority prefix; `hog/traversal.ts:356` now derives the successor carrier from topology alone, without inventing input state |
| Structural identity completion | `hog/structural_transition.ts:93` passes authority to `hog/traversal.ts:238`, then `abg/traversal_cursor.ts:369`; ordinary structural entry retains its GTL semantics |
| HoG route proposal | `hog/route_proposal.ts:129` consumes the already selected target input for its proposal check; it owns no historical selection |
| ABG continuation admission / historical route | `abg/traversal_route.ts:3708` independently derives the exact relation from admitted history |
| ABG structural admission / historical route | `abg/traversal_route.ts:2898` and all callers use the admitted structural relation |
| Retry history / completed progress | `abg/retry.ts:2716,5844` use the same admitted continuation relation |

All production callers of `deriveCompletedTraversalCursor` and `deriveStructuralTargetCursor` pass authority. Their optional pure mode remains for component callers. Direct pure GTL continuation calls are limited to these wrappers, the owner projection, structural GTL composition, and the proposal check with its selected input. No omitted production argument silently recovers the old nested derivation.

Child entry still preserves the selected input reference/digest through `hog/workflow_lifecycle.ts:402–435` and child basis admission; foldback producer authentication remains `abg/worksite_input_provenance.ts:112`. Explicit retained entry, retry, interaction and graph-span reentry remain distinct origin classes rather than a generic raw-entry fallback.

## Executed proof and first causes

`test_env/support/admitted-graph-execution.mjs` uses the existing **current** `setupInstalledRootExecutionBasis` helper, then ordinary scope opening and HoG execution. The test authors a finite changing deterministic leaf and matching predicate/declaration in a scratch artifact **before** manifest generation, pack, verification and installation. Actual installed owners perform capability, invocation, execution, route, leaf and Result admission. No authentication, event, implementation port or producer lookup is supplied as a double. No new source-only harness was substituted. An obsolete retry-harness extraction was removed completely; `t287-r6-retry-success-exit.test.mjs` is unchanged from HEAD.

| Executed case | Inputs actually received by changing leaves | Evidence status |
|---|---|---|
| Compose A then B | `seed`, `seed!` | PASS on final emitted cut |
| Ordinary shared batch A, B | `seed`, `seed` | PASS at first emitted checkpoint; not rerun after structural join correction |
| Batch of composed tasks A/B, C/D | `seed`, `seed!`, `seed`, `seed!` | PASS on final emitted cut |
| Batch after outer progress P | `seed`, `seed!`, `seed!` | PASS on final emitted cut |
| Batch inside batch | `seed`, `seed`, `seed`, `seed` | PASS before final structural join correction; not rerun |
| Failed consumer after equal-valued A/B outputs | `seed`, `seed`, `seed!` | PASS before final structural join correction; failed call retains same basis, differs from raw entry, and exact input reference selects B while excluding equal-valued A |
| Identity ending first batch task | `seed`, `seed` | PASS on final emitted cut |

Every executed case checks same-basis calls and actual implementation evidence input digest against the reconstructed admitted cursor. The failed-consumer case exercises the exact current-input and successful-leaf producer relation used by recovery, not full native intake.

The first real nested failure was `structural_step_missing` after B: HoG proposal duplicated pure target derivation without the enclosing-entry input. It is retained in `installed-composition.log` and repaired by consuming the already selected target. The identity structural join was corrected through the same owner relation. Final-cut compose/nested/progressed assertions passed in `installed-composition-final.log`; that command exited 1 only because the added identity fixture called nonexistent `C.identity` before installation. The fixture was corrected to existing `C.id`; `identity-final.log` is the successful identity-only rerun. No source changed between those two commands. Earlier fixture setup failures (binary compose construction; obsolete capability API) preceded real leaf execution and are not transfer proof.

Checks:

- `tsc -p tsconfig.json --noEmit`: PASS before final build.
- `npm run build`: PASS, `build-final.log` (ordinary clean, tsc, manifest generation).
- `ABI5_CALCULUS_CASES=compose,nested,progressed,identity_end node --test test_env/tests/t287-calculus-state-transfer.test.mjs`: final source, three passing behavior subtests and one fixture setup failure, as above.
- `ABI5_CALCULUS_CASES=identity_end node --test test_env/tests/t287-calculus-state-transfer.test.mjs`: PASS, 2/2 including parent, 38.530 s.
- `node --experimental-vm-modules --test --test-name-pattern='Product (author|assessor) recovery values' test_env/tests/t287-native-semantic-revision.test.mjs`: PASS 2/2, `product-values.log`, 0.487 s. Ordinary generated Product values were used; no retained native fixture environment was selected.
- `git diff --check` for granted source/HOW/test paths: PASS.

The first compose/shared-batch checkpoint passed 3/3 including parent in 76.305 s; its tool output was reported immediately to Executive, but no exact source hash or stdout file was frozen for that intermediate cut. It is observed earlier evidence, not substituted for final-cut qualification. No broad suite was run and no aggregate all-seven final-cut green claim is made.

## Timing, risk and held work

Simple timestamps around the existing setup and execution calls, milliseconds:

| Final-cut case | Setup (includes pack/install/verification/basis) | Traversal | Total subtest |
|---|---:|---:|---:|
| compose | 22985.604 | 2471.451 | 38739.933 |
| nested | 22737.276 | 3457.962 | 40107.867 |
| progressed | 21772.997 | 2762.747 | 37655.068 |
| identity ending | 22067.908 | 2244.897 | 37295.207 |

The remainder includes scratch manifest/declaration preparation and assertions; its internal partition is unmeasured. The user's latest assessment is that traversal looks proportional, while approximately 23 s of setup remains a volume/complexity question; the gut expectation of under 10 s is **not a hard cap**. This is an accounting lead for later ranked work, not an optimization branch. Large-prefix cost of the new pure relation has not been measured.

Existing setup evidence, inspected without rerunning or profiling:

- `test_env/support/root-installed-environment.mjs:157–168` packs and extracts the package for each case; `:230–265` verifies, installs and explicitly checks installed content. `:290–303` loads the installed owners; `:315–378` admits Product install and WorkspaceBinding. `:390–440` reconstructs the installed publication, admits publication/contributions and validates the selected composed Program plus direct Hello Program. `:584` resolves execution against the installed catalog; later helpers materialize/validate the graph, resolve/validate implementations, admit invocation/execution, and construct the admitted leaf port (`:799–1029`). These are source-mapped stages, not measured individual durations.
- Each case repeats that full setup with a fresh installed environment. The publication is constructed during bootstrap (`:212`) and again from installed owners (`:390`); source-visible repeated acquisition is retained as a question, not labelled unnecessary. The test also regenerates the scratch Product manifest for each finite declaration **before** the measured helper setup. The ordinary shared build is not repeated per case.
- The frozen canonical `product-toolchain-manifest.json` lists **5,231 product-relative locators**. This is canonical manifest inventory, not a retained measurement of each scratch archive. Scratch archive bytes, archive member count/unpacked bytes, successful-case event counts/log sizes, and per-stage I/O/validation attribution were not retained and are **unknown**; no new pack or filesystem census was run to manufacture retrospective measurements.
- The retained pre-final nested failure contains a concrete prefix of **2,547,152 bytes and 67 admitted events** (`installed-composition.log`, failure successor prefix/profile span). That includes setup and partial traversal through B; it is not a setup-only volume and is not a final successful-case size.

These observations support the Executive's bounded setup-accounting follow-up using retained evidence. No profiling, benchmark rerun or optimization was performed after this steering.

**OPEN:** full `nativeIntakeFacts` positive with the genuine preserved F_P author Result, failed assessor, installed current artifact and subsequent assessment. That belongs to the held native continuation after independent source/context review. The large retained journal was not read; no fake authority, fresh native actor or repeated Design author was used to close this gap. Existing native pending evidence and runtime work were left untouched.

Remaining proof limits: fan-out, retained-input, retry, interaction, reentry, recursion and child foldback callers were source-accounted but not newly executed by this finite test. The three earlier passing variants were not re-executed after the final structural join. The previously unproved wider equal-value-producer leads remain unpromoted; only the concrete same-basis exact-producer discriminator was executed. Independent Reviewer decides source readiness; Executive decides any subsequent installed/native permission. This return does not qualify all fifteen families, release, campaign, semantic adequacy, or runtime performance.

`freeze.json` records the exact source/tests/HOW, corresponding emitted files, generated manifest/capability graph, governing Product and retained proof files. It preserves mixed pre-existing documentation/context work and does not create another authority.
