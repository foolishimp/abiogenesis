# RC12 package A Return — declared framed reviews

Writer Return, commentary. Worktree `/private/tmp/abg-rc12-executive-20261111`,
branch `claude/rc12-executive`, base `b7cf409fc`. Commits: `cb0a3781a` (P1+P2), `bb3d772d7`
(code and tests), then this Return.

## Frames used

- Project basis Design/realization evaluation of the default governance library
  (`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`).
- `F-WORKSITE-CAUSALITY`
  (`build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-worksite-causality`):
  review currentness reuses `worksiteCommandSourcesInvalidatedAfter` over the
  declared review subject paths.
- ABI frame atlas for owner placement: Product owns the review data, binder,
  schema and verdict reading; ABG owns preparation, fold and parent standing;
  GTL publishes one more wrapper over the existing assessor child.

## Changed files (T = `build_tenants/abiogenesis/typescript`)

| File | +/- |
|---|---|
| `specification/PRODUCT.md` (P1) | +23 −7 |
| `T/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` (P2) | +72 −0 |
| `T/code/src/product/default_library.ts` | +89 −29 |
| `T/code/src/abg/default_library.ts` | +55 −25 |
| `T/code/src/abg/instruction_assembly.ts` | +3 −2 |
| `T/code/src/gtl/default_library.ts` | +2 −1 |
| `T/test_env/tests/t287-default-library.test.mjs` | +3 −3 |
| `T/test_env/tests/t287-default-library-reviews.test.mjs` (new) | +412 |

Build-regenerated `T/contracts/capabilities/capability-definition-graph.json`
and `T/product-toolchain-manifest.json` are not committed: a HEAD build already
differs from their committed copies, as for recent source commits.

P3: no line under `specification/requirements/` states a single assessment or
UAT-only completion (REQ-P-SCENARIOS independent-assessment text is general).

## Trace table

| # | Site | Old reading | New reading |
|---|---|---|---|
| T1 | `abg` parent auth (old line 395) | last row, when it is a satisfied `uat` | `governanceVerdicts(...).acceptance.observation`: latest `uat` that only `review` rows follow |
| T1 | `abg` parent fulfillment term (old 407) | `observations.at(-1)?.resultRef` | acceptance row's `resultRef`; equal outcome without reviews (non-`uat` last row was already non-terminal) |
| T1 | `product` `governanceVerdict` | last row | replaced by `governanceVerdicts`; per-review latest row by `reviewRef` |
| T2 | `governanceAssessmentContract` | `uat` only | `uat` → original; `review` → selected declared review; default `uat` |
| T2 | `governanceSubjectEvidenceRefs` | `uat` domain, `uat` rows ineligible | `review` shares the `uat` domain; `review` rows ineligible |
| T2 | `abg` `nativeTask` | `purpose !== "uat"` → author task | `assessed = uat or review`; UAT text `uat` only; review branch; fulfillment response `uat` only |
| T2 | `abg` fold | `uat` takes `source.assessment` | `uat or review`; `review` returns before any fulfillment fact |
| T2 | `gtl` wrapper child | `uat` → assessor | `uat or review` → assessor; review conditions_for_use |
| T2 | direct route (`product` 134, `abg` 189, `invocation_admission` 1514) | Testing/UAT only | unchanged; declared reviews refuse |
| T3 | old instance | — | b7cf409fc digests equal for witness state, 3-purpose topology, run environment, selector views, response schemas, facts, subject domains; state without `reviewStanding` admitted; binder unchanged when the full catalogue offers the review wrapper |
| T4 | derived identities | 8 library GraphFunctions | 9: adds `graph-function://abiogenesis/default-library/review@5`; library publication, `callableMembership`, capability graph (`graphDigest` committed `1812869d…`, now `daccf7d2…`) and manifest change; no-review carriers pinned unchanged |
| T5 | imports | `governanceVerdict` in `abg/default_library.ts` | `governanceVerdicts`, `governanceSelectedReview`, types `GovernanceObservation`, `GovernanceReviewStanding`; `abg/instruction_assembly.ts` adds `governanceTargetSelectable`; `rc2-assessment-intake.test.mjs` keeps the one-argument call |
| T6 | tests | see Evidence | |

## Evidence (in T, TMPDIR=/private/tmp/abg-a12-cand)

- E1 build: `npm run build` exit 0, no type errors.
- E1 lint: `npm run lint -- <recipe>` over both edited test files and the two
  regenerated JSON files: `"passed":true`. With no recipe it fails at baseline
  too (`ERR_INVALID_ARG_TYPE`). `lint:imports` and `lint:calculus` hold.
  `lint:lifecycle` reports 4 offenders, all in untouched
  `code/src/shared/owned_process_state.ts`. `lint:evidence` reports oversize
  tracked `.ai-workspace` archives. Both are pre-existing.
- Old-instance pins: a scratch script over the b7cf409fc build and the
  candidate build gives equal witness, gtl3, environment, view0, schema0,
  viewP, schemaP, facts and subjects digests. The same pins are embedded in the
  new test.
- E2/E3/E4 (T6), `node --experimental-vm-modules --test
  --test-concurrency=1` over the five E4 files plus the new file: `tests 68,
  pass 58, fail 0, skipped 10`, 689.6 s. Baseline was `tests 61, pass 51,
  fail 0, skipped 10`, 605.9 s. The same 10 skips are env-gated. Per file:
  `t287-default-library` 34 pass, 3 skip; `-fulfillment` 7 pass;
  `t287-recursive-registered-selection` 6 pass, 1 skip;
  `t287-registered-graph-selection` 1 pass;
  `t287-governance-covered-source-use` 3 pass, 6 skip;
  `t287-default-library-reviews` 7 pass (6 unit, 1 end to end, 77.9 s).
- E3 roles in order: select, native, select, assess B, select, assess A,
  select, native, select, c2, select, assess uat, select, assess A. That is 7
  choices; the assessor graph opened 4 times; B ran once. 8 parent results,
  and only the last is terminal. After the satisfied UAT the standing is
  B satisfied and current, A neither satisfied nor current. The final standing
  has both satisfied and current; one `run_closed`, no runtime failure.
- Outside-territory check: `rc2-assessment-intake`,
  `t287-native-work-reacquisition` and `test_env/uat/harness`: `tests 48,
  pass 45, fail 0, skipped 3` (env-gated).

## Deviations

1. Acceptance is the latest `uat` row that only `review` rows follow, not the
   latest row. Counterexample to "latest uat": a no-review state [satisfied
   same-Run UAT, then a no-effect Construction] would close under R6 but stays
   open today. The chosen rule keeps Outcome 5.
2. The review wrapper is unselectable without declared reviews: selector
   choices, response schema and binder apply `governanceTargetSelectable`. The
   registered selection domain stays whole.
3. The fixed direct Testing/UAT route refuses declared reviews.
4. `governanceAssessmentContract(state, purpose = "uat")` keeps a one-argument
   default because `rc2-assessment-intake.test.mjs` lies outside the territory.
5. `governanceVerdict` is replaced by `governanceVerdicts`.
6. E3 order: Construction; review B satisfied; review A unmet; correcting
   Construction; Testing; UAT satisfied, parent open (A adverse and stale);
   review A satisfied, parent closes. This makes "not terminal while A is
   adverse or stale" discriminating.
7. Every latest review row is authenticated, adverse rows included; a mismatch
   refuses the parent outcome. Currentness needs the admitted event ordinal.

## Residual risks

- A retained state whose `workOrders` carries a `review` key is now refused.
  No fixture has one.
- Consumers on the full default purpose list gain the review wrapper; their
  library, program and installed digests change.
- Review currentness uses native-work changed-path overlap only, as UAT
  acceptance does.
- E3 uses a scripted stand-in; no provider ran. Readers of this Return share
  the Writer's model family.
