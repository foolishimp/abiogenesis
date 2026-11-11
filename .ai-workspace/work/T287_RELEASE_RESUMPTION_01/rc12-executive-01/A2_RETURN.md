# RC12 package A2 Return — declared framed review repairs

Writer Return, commentary. Worktree `/private/tmp/abg-rc12-executive-20261111`,
branch `claude/rc12-executive`, base `62fd17271`. Commits: `7b5d2a358` (F1–F3,
D1, P1, P2, tests), `7d78d154b` (P2 reflow to 84 lines), then this Return.
T = `build_tenants/abiogenesis/typescript`.

## Frames used

- `F-WORKSITE-CAUSALITY` (`T/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`): an
  admitted C2 delta is a worksite effect. Review currentness is the read-roots
  query over the review's dependency set.
- Design/realization evaluation of `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`.
  Owner placement is unchanged: Product owns the set, ABG owns preparation and
  parent standing, and the causality owner owns invalidation.

## Changed files (`62fd17271..7d78d154b`, +/−)

| File | +/− |
|---|---|
| `specification/PRODUCT.md` (P1) | +6 −4 |
| `T/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` (P2, section 84 lines) | +42 −29 |
| `T/code/src/product/default_library.ts` | +14 −2 |
| `T/code/src/abg/default_library.ts` | +13 −11 |
| `T/code/src/abg/native_worksite_execution.ts` | +11 −2 |
| `T/code/src/abg/runtime_history.ts` | +3 −1 |
| `T/test_env/tests/t287-default-library-reviews.test.mjs` | +56 −6 |
| `T/test_env/tests/rc2-assessment-intake.test.mjs` (D1 call sites) | +2 −2 |
| `T/test_env/tests/t287-worksite-command-delta-invalidation.test.mjs` (new) | +105 |

The regenerated `capability-definition-graph.json` (graph `e8296cc1…`) and
`product-toolchain-manifest.json` stay uncommitted. They move with
`productContentDigest` on any source change.

## Trace table

| # | Subject | Finding |
|---|---|---|
| T1 | consumers of the index key `worksite-observation-dependency` | (a) `worksiteCommandSourcesInvalidatedAfter` (`native_worksite_execution.ts:252`) now has a C2 branch. It requires the C2 GraphFunction, the observation contract, the `success` class, the task's root and the sealed Product observation (`isWorksiteExecutionObservation`). (b) In `event_calculus.ts`, `addPhysicalDependencies` and the result/fibre arms now also take keyed C2 rows and their `aggregate:c_call:` rows. `nativeWorkPhysicalScope` returns null for command values, and command values are not `subjectCalls`, so fluent results are unchanged; the only effect is extra rows. The rows feed rule derivation (`applyStep`) and the replay worksite transition only, and no digest of the set is formed. Keys are computed at load and append time and are not persisted, so old logs re-index |
| T2 | invalidator callers: `native_worksite_execution:182`, `worksite_revision:344`, `semantic_revision:299,365`, `default_library:274,422,431`, `worksite_input_provenance:451`, `execution_basis:745`, `semantic_job:568`, `event_calculus:360` | Traced run of 31 files with an in-memory load hook (build on disk byte-equal) that logs every C2-branch evaluation. 28 files loaded the owner, including installed child processes. There were zero C2 evaluations outside the new unit file. No ungated flow queries the invalidator after a C2 Result with a non-empty delta. An outcome changes only when a later C2 writes at or under a queried path, which F2 requires. The trace caught one flip, from my own dedup (see Deviations) |
| T3 | `nativeTask` assessment inputs vs the currentness set | Review: `readFirst` = `governanceAssessmentDependencies(order, assessment)`, and currentness reads that same array in read-roots form; both are asserted. UAT: `readFirst` comes from the same owner over the original. Acceptance currentness stays on the original read roots (structural) |
| T4 | old-instance reading | The owner reproduces the HEAD composition exactly: the declared `readFirst`, then each missing input. HEAD vs final build: construction and UAT instructions, `readFirst`, schema and rendered order bytes are equal with empty `authorityRefs` (11919 and 14841 bytes). With selections there is one extra line, +98 bytes. The `t287-default-library` claim "original duplicate refusal is retained" passes unchanged |
| T5 | identities, pins, fixtures | Library publication, policy, programs, context inventory and every GraphFunction digest equal HEAD. Across every build `.d.ts` file, only `product/default_library.d.ts` differs from HEAD: it adds `governanceAssessmentDependencies` and makes `purpose` required. The `./product` export's declaration inventory, and the native contract digests over it, therefore move, as they did for package A's Product helpers. The `./public`, `./abg` and `./gtl` declarations are byte-equal. No fixture or pin edited |
| T6 | tests | A `grep -l` of `test_env` for the changed owners and the index key found 6 test files plus 3 support consumers outside the 31 files. Those, with their qualification-gate consumers, ran on the final build: 15 files, 139 tests, 125 pass, 2 fail, 12 skip. The 2 reds are in `t287-route-reconstruction` (body-decode and retention cases); a HEAD build snapshot gives the same 2 reds and 8 passes. See Evidence |

## Evidence (T, `TMPDIR=/private/tmp/abg-a2`, `node --experimental-vm-modules --test --test-concurrency=1`)

- E1 build: `npm run build` exit 0. Recipe lint over the three edited test files and the two regenerated JSON files: `"passed":true`. `lint:imports` and `lint:calculus` hold. `lint:lifecycle` shows only the 4 baseline offenders, all in `owned_process_state.ts`. `lint:evidence` shows only the baseline `.ai-workspace` archive reds. No new offender.
- E2 new cases:
  - reviews +2: a change only in a review's `readFirst` keeps the parent open after a fresh UAT, rerunning that review closes it, B stays current, and the not-required control closes; authority carriage for construction, UAT and review.
  - The new file has 3 cases: index membership only with a delta; exact path, directory read root, ordinal, root, producer, contract, class and sealing; a written reviewed artifact makes the review stale while an unaffected review and an empty-delta command stay current. On the HEAD build it fails 3/3.
- E3/E4, six library files:
  - Known baseline: 68 tests, 58 pass, 0 fail, 10 skips.
  - Final: 70 tests, 60 pass, 0 fail, 10 skips. Reviews 9/9, including the end-to-end Public Run.
  - New file: 3/3.
- E3/E4, 24 changed-owner and consumer files (`t287-c0-post-publication-failure`, `t287-native-work*`, semantic, revision, C2, D2, reacquisition, `governed-context`, `selected-execution-closure`, `qual056`, `single-address-space`, `w2`, `rc2-assessment-intake`, `test_env/uat/harness`):
  - Baseline at HEAD: 277 tests, 240 pass, 10 fail, 27 skip. Final build: 277 tests, 240 pass, 10 fail, 27 skip.
  - Per file the counts and failing names are equal; `t287-c0-post-publication-failure` is 31/31 in 1430 s.
- Pre-existing reds, the same at HEAD and after, reported and not repaired:
  - `t287-calculus-fold`: 2 HS03 actual-stream cases need `ABI5_HS03_STREAM_METADATA`.
  - `t287-single-address-space-consolidation`: 7 cases need `consolidation-inputs/native-02/*`.
  - `t287-governed-context`: GC03 custody digest of `method/EVALUATION.md` (`b856cf04…` ≠ `478fd21f…`).
  - `t287-route-reconstruction`: 2 cases, "a committed row decodes at most once" and "the open store keeps the verified bodies". The same reds on the HEAD build.
  - Skips need `ABI5_EVIDENCE_ROOT` or saved prefix roots.

## F1 case

The admitted native assessment Result records no reads; it holds only `after`,
`changedPaths`, `report`, `assessment` and provenance. So the declared set is
the dependency set. The review instruction now says that only the declared
read-first material, sources, candidate and rubric may support the verdict.

## Deviations

1. The first realization deduplicated with a `Set`, which removed the refusal
   of a duplicate declared `readFirst`. The traced run caught it through the
   unchanged claim in `t287-default-library`. The owner now keeps the HEAD
   composition, and the design text says so.
2. The F2 scope is the C2 observation kind only. Revision
   (`worksite_revision_command_execution_observation`) and forward
   (`worksite_command_forward_observation`) Results carry the same
   `worksiteDelta` and still do not invalidate. Including them is a decision
   for the Executive.
3. The reviews stub now models both query forms. The `checked` assertion now
   expects the read-roots form over the dependency set; that is the F1 repair,
   not a reversed claim.
4. F1 asked for a product-layer owner. The helper is therefore a new member of
   the `./product` package export; it is not in `./public`. Whether that counts
   as a Public member under the stop list is for the Executive.

## Residual risks

- The EC fluent `worksite_observation_current` is not retired by command
  deltas; only the invalidator owner reads them.
- Gated D2, saved revision and native semantic-revision flows did not run.
  If a saved prefix holds a C2 that writes under a later-queried path or root
  after its ordinal, then `source_invalidated`, the command-source projection
  or acceptance now refuse it.
- The reader is from the same model family (Opus Writer; Fable Executive).
