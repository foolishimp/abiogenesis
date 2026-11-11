# RC12 package P Return — declared process prerequisites

Writer Return, commentary. Worktree `/private/tmp/abg-rc12-executive-20261111`, branch
`claude/rc12-executive`, base `3a02bb52f`. T = `build_tenants/abiogenesis/typescript`.
Commits: `5efb5be13` (P1, P2); `4f1626ea8` (code and tests); `bbc4a82ac` (withdrawal of
the A2 command-delta relation); `b906268c2` (readFirst-only Public Run); then this
Return. Item 0 is cancelled and has no commit.

## Declaration

- `abg.default_library_prerequisites` on the executive-step GraphFunction: canonical JSON of `{ [purpose]: reviewRef[] }`; purposes registered and not `review`, lists non-empty and unique, review wrapper registered; `defaultGovernanceGraphFunctions({ prerequisites })` builds it and throws otherwise. Bound by the step digest, callable membership and catalog row; not on `registeredSelectionApplication` (strict schema); `gate` unused.
- Witness: `{"construction":["review://amendment-witness/impact@5"],"uat":["review://amendment-witness/preservation@5"]}`.

## Changes (`3a02bb52f..b906268c2`, +/−)

| File | +/− |
|---|---|
| `specification/PRODUCT.md` (P1) / `T/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` (P2 section 74 lines; withdrawal; proof line) | +7 / +82 −6 |
| `T/code/src/{product,implementation,abg,gtl}/default_library.ts` | +58 −12, +34 −21, +32 −15, +10 −5 |
| `T/code/src/abg/instruction_assembly.ts` / `native_worksite_execution.ts` / `runtime_history.ts` | +12 −8 / +2 −11 / +1 −3 |
| `T/test_env/tests/t287-default-library-prerequisites.test.mjs` (new, E2) / `t287-worksite-command-delta-invalidation.test.mjs` (deleted) | +193 / −105 |
| `T/test_env/tests/t287-default-library-reviews` / `t287-default-library` / `-fulfillment` | +57 −13 / +10 −6 / +1 −1 |
| `T/test_env/tests/t287-amendment-witness.test.mjs`, its support and fixture files | +61 −11, +23 −17, +1 −1 |

The regenerated `capability-definition-graph.json` and `product-toolchain-manifest.json` stay uncommitted.

## Trace table

| # | Subject | Finding |
|---|---|---|
| T1 | Sites that decide or present selectable targets | One relation, `governanceTargetPermission(task, target)` → `{offered, permitted, missingSelectedPaths, missingReviews}` (`product/default_library.ts`). Assembly choices `.offered` (old `governanceTargetSelectable`); assembly null when intake fails. View: `.missingSelectedPaths` plus a `prerequisites` section. Schema: contribution domain `.offered`, next-member enum `.permitted`. Binder: targets `.offered`, next member `.permitted`. `projectGovernanceChoice`: `.permitted` over the admitted selector input (old: registered digest only). `selectGovernanceWork.complete`: message reads `.missingReviews`. Witness actor reads `view.prerequisites.targets[].missingReviews` |
| T2 | Old-instance reading | E2 case 1: default graphs, publication, bindings, environment, a reviewed state, its view and schema equal the `3a02bb52f` digests. Reviews `OLD_INSTANCE_PINS` unchanged. E2 cases 5, 6: an undeclared step yields the identical selection task and projects the choice the declared step refuses. New premise: `projectGovernanceChoice` resolves the admitted selector input for every choice (prepare-selection's admitted Result in the same Run) |
| T3 | Identities, pins, fixtures | Library digests, publication, bindings, environment unchanged. Moved: `product/`, `gtl/`, `abg/default_library.d.ts` (new exports, optional parameters, `governanceTargetSelectable` removed) and the witness consumer step digest. `HEAD_PINS` computed once against a HEAD build snapshot. No existing pin or fixture digest regenerated |
| T4 | Item 0 | **Cancelled** by the Executive correction; never committed, nothing to revert. The A2 relation it would have extended is withdrawn in `bbc4a82ac` |

## Executive correction

1. Item 0 cancelled. My analysis had stopped before any edit on the same premise: revision
   and forward commands share the C2 helper, which runs in `sandboxRoot` under the archive
   root (`product/worksite_command_execution.ts:780–789`; `implementation/worksite_command_helper.ts:508,1596,1607,1657`).
2. `bbc4a82ac` withdraws `7b5d2a358`'s relation: the C2 branch, import and comment in
   `worksiteCommandSourcesInvalidatedAfter`; the command-observation arm of the
   `worksite-observation-dependency` key; the design bullet (now: C0 replacements and
   failures and native and unknown native effects; a C2 command Result's `worksiteDelta`
   is not a cause); the delta test file. The reviews stub's `{path, at}` change is now
   described as an admitted native effect only. Kept: `governanceAssessmentDependencies`
   (preparation and parent) and the authority-selections instruction line. Both code
   files are now byte-identical to `7b5d2a358^`. Counts after the withdrawal: E3.
3. `b906268c2`: the reviews Run setup is factored into `publicReviewsRun` (first Run's
   assertions unchanged). A second Run seeds `generated/review-input.md` in the read
   roots, grants it to Construction and adds it to review A's `readFirst` only (not A's
   sources, candidate or rubric; not B's set). Actor mode `ABI5_REVIEW_ACTOR_TOUCH`: the
   first Construction writes the declared greeting; a second one after both reviews
   rewrites only that path. Over the installed CLI and its event log: choices C, B, A, C,
   Testing, UAT, A; the second Construction's `changedPaths` is exactly that path; after
   satisfied UAT the parent is open with B satisfied and current, A satisfied and **not
   current**; A reruns; the parent closes; no `runtime_failure_observed`.
   `design/test-design.md` was not used: it is a protected source (digest in
   `original.sources`, UAT sources, Testing paths), so changing it changes more than A's `readFirst`.

## Evidence (T, `TMPDIR=/private/tmp/abg-p`, `node --experimental-vm-modules --test --test-concurrency=1`)

- E1: `npm run build` exit 0 at `4f1626ea8` and after the withdrawal (code of
  `bbc4a82ac` = HEAD). Recipe lint (8 `.mjs`, fixture, 2 regenerated JSON) `"passed":true`
  at HEAD; `lint:imports`, `lint:calculus` hold; `lint:lifecycle` (4 baseline offenders)
  and `lint:evidence` (baseline `.ai-workspace` reds) unchanged.
- E2 `t287-default-library-prerequisites`: 6/6 pass.
- E3 before the correction (`4f1626ea8`): six library files 70/60/0/10 skips; delta 3/3; witness 8/7/0/1 skip.
- E3 after the withdrawal:
  - five library files without `-reviews`: 61 tests, 51 pass, 0 fail, 10 gated skips (630 s);
  - `t287-default-library-reviews` alone at HEAD: 10 tests, 10 pass, 0 fail (162 s), the 9
    prior plus the new Run. Its first run failed the new case on a test defect, fixed
    before commit: the seeded path was outside `original.readRoots`;
  - six library files: 71 tests, 61 pass, 0 fail, 10 gated skips (baseline 70/60/0/10 plus 1);
  - `t287-amendment-witness`: 8 tests, 7 pass, 0 fail, 1 live skip (201 s).
- W1 at HEAD 6/5/0/1 live skip. W2: prerequisites reach the Program via `amendmentPrerequisites`; `Prerequisite:` lines removed; a not-applicable review is `required:false`.
- W3: (i) early construction choice refused: roles end at `select:construction`, no construction call or admitted choice, changed paths only `design/impact-assessment.md`, `work/intake-triage.md`. (ii) Lawful sequence closes (20 roles); every admitted construction or UAT choice was permitted.
  (iii) Task without the preservation review refused at intake: no actor call, no write. (iv) Wording-only input: intake admits, UAT not gated, construction gated (relation level).

## Refusal in the event log

- Early choice (binding): one `runtime_failure_observed`, `stage: "route"`; subject F_P,
  `diagnostic://abiogenesis/implementation/implementation-exception@5`, implementation
  `select`, `stage: "implementation_completion"`, `reason: "thrown"`; cause `TypeError`
  `native selector choice binding refused: graph-function://abiogenesis/default-library/construction@5 requires satisfied and current review://amendment-witness/impact@5`; owner output `runtime_failed`.
- Intake: one `runtime_failure_observed`, `stage: "route"`; subject F_D,
  `diagnostic://abiogenesis/default-library/missing-owned-prepare-selection@5`, `stage:
  "selection_intake"`, `relation: "process_review_undeclared"`, `selectors: {reviewRefs:
  "review://amendment-witness/preservation@5"}`; owner output `runtime_failed`.
- Projection (unit only; the binder refuses first): `missing-owned-project-choice`,
  `choice_projection` / `target_not_permitted`, `{graphFunctionRef, missingReviews}`. No class names a prerequisite; the reason does.
- `gate`: built at `gtl/graph_applications.ts:210`, serialized at
  `gtl/serialization_contracts.ts:120`, validated at `validator/validation.ts:402,1177,1220,1343`;
  no HoG lifecycle dispatches `relationKind: "gate"`, so a declared gate validates and never runs.

## Deviations

1. Item 0 cancelled by the correction, not a Writer stop.
2. The binder refusal message names the missing reviews inside the existing exception
   class; it is the only way R5's reason reaches the log at binding.
3. Intake and projection report through the existing per-operation diagnostic (factored
   `refusalReport`; Testing bytes unchanged). No failure class added.
4. W3 (iv) is relation-level (the stand-in outputs realize the threshold change); the design section is 74 lines with heading (target about 70).

## Residual risks

- New `./product` exports for you to decide: `governanceTargetPermission` (replaces
  `governanceTargetSelectable`), `governanceTarget`, `governancePrerequisites`,
  `governancePrerequisitesUndeclared`, `GOVERNANCE_PREREQUISITES_DECLARATION`,
  `GovernancePrerequisites`; the third parameter of `projectFramedSynthesisPromptTask`;
  the optional `refusal` parameters. The schema's `nextGraphFunctionRef` description names only the Testing rule.
- Not run: inventory consumers outside E3 (`t287-wave2-owner-contract-source-set`,
  `t287-framework-handoff-types`, `t287-gtl-serialization-publication`,
  `t287-public-preparation`; no pinned digest) and A2's 24 consumer files after the
  withdrawal (both withdrawn code files equal their pre-A2 bytes).
- A refused early choice ends the Run (`runtime_failed`); a re-ask needs a mechanism R7 excludes.
- A stale prerequisite's refusal is proven on parent standing and at relation level; the
  new Run proves review staleness end to end, not a stale-prerequisite refusal.
