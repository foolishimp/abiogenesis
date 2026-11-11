# TD-46 attribution: functions and branches that no test executes

Commentary for T-292, not register text. Subject: the whole-suite coverage run at `34aafb2c6` (`census/coverage-aggregate.mjs`, 1,657 process files, 518 with Product code, 282 scripts kept, 111 scripts with skipped variants). Paths and lines are at `34aafb2c6`; "on main" means the declaration is still declared in the same file on `main` (146 commits later). Read-only work: no source, test or register file was changed and the suite was not run. The full per-declaration table is `TD-46_ATTRIBUTION.json` beside this file.

## 1. Result

The population is 493 declarations with no executed line: the 460 non-type declarations whose census `unexecutedLines` reaches their census `lines`, plus 33 never-called overload implementations that the census line window hides (it sums statement spans for overloaded functions). "Lines" below is the true implementation span; the census figure is given beside it.

| Class | Meaning | Declarations | Lines | Census lines |
| --- | --- | ---: | ---: | ---: |
| R | an entry retires it | 315 | 6,495 | 6,831 |
| G | reached only by a gated lane | 21 | 569 | 609 |
| T | reached only by a test that timed out under coverage | 0 | 0 | 0 |
| L | live and untested | 132 | 2,640 | 2,666 |
| D | dead and named by no entry | 2 | 37 | 37 |
| X | method artifact | 23 | 132 | 132 |
| All |  | 493 | 9,873 | 10,275 |

- R: 265 of the 315 (5,792 lines) sit under Decision entries. TD-25's 22 (1,669 lines) retire under either outcome; TD-26's 37 and TD-28's 201 (4,057 lines) retire only if the owner rules so; the 5 in `public/gap_authority.ts` retire with TD-44, whose Decision part is the two `./public` types. TD-31's 9 (276 lines) are already deleted on `main`.
- L: 132 declarations (2,640 lines). 45 (753 lines) belong to an entry that keeps them and owes them a lane or a decision (TD-28 keep rows, TD-29, TD-40); 87 (1,887 lines) have no owning entry.
- T: no declaration has T as its primary class. One R declaration (`abg/worksite_construction_recovery.ts:224` `projectPreservedWorksiteProposal`) is called only by `t287-d5-authentic-preserved-result`, which timed out under coverage.
- Never-entered regions of 15 or more lines inside executed functions: 174 regions, 4,743 lines, counted by V8's innermost-range rule (section 11).
- All 178 non-R declarations are still on `main`; 306 of the 315 R declarations are (the 9 missing are TD-31's).

## 2. What was read and what is inferred

- Read: the register (TD-25 to TD-75), the findings each cited entry rests on, the source at `34aafb2c6` for every spot check in section 14, every test line that calls a G, X or D declaration, the suite3 TAP marks and skip reasons, and the aggregate `state.json` function and block counts.
- Mechanical, then filtered by reading: direct and executed callers come from the TypeScript census graph; test call sites come from a whole-word grep of `test_env`, from which name collisions (local helpers named `hash`, `record`, `ref`, `owner`, `within`, `refusal`, `fault`, `evidenceProjection`) were removed by reading; each call site was mapped to its enclosing `test()` title and that case's TAP mark. A `testFiles` count was never taken as reach.
- Inferred: a G row marked "likely" reaches the gated lane through a caller chain that was not read to its root. R rows under TD-28 are covered by the row's module set or capability, not by a named line. Region attributions in section 11 rest on the region's first lines and its enclosing declaration.

## 3. Method and limits

These limits belong in the entry's Boundary. Each was read in the aggregate script or the test that triggers it.

1. Query-string imports are dropped silently. `coverage-aggregate.mjs:34` keeps a script only when its URL ends in `.js`, so `module.js?x=…` is neither counted nor reported as a variant. 22 test-side files import modules this way, among them `support/root-installed-environment.mjs:345-352` (`gtl`, `hog`, `implementation`, `validator` barrels and `leaf_invocation_port.js`, all `?env=`; loaded by 60 test-side files), `t287-c2a-fp-source-contract.test.mjs:49`, `m5-event-calculus-runtime.test.mjs:363`, `:417`, `r1-packed-artifact.test.mjs:40` and `t287-worksite-branch-construction.test.mjs:356`. The module itself is lost; its relative imports load without the query and are counted.
2. Source-modifying loaders become skipped variants. `support/r10-private-owner-harness.mjs:10` `privateOwner` (source plus an appended export), `sourceOwner` in `t287-runtime-failure-diagnostic:24`, `t287-undispatched-diagnostic:16` and `t287-historical-source-resource:33`, `registerHooks` in `t287-selected-action-authority:9`, `ownedRetryPlanDigest` in `t287-route-reconstruction:134` and the helper loader in `t287-owned-process-lifetime:627-668` compile a changed copy whose length differs from the build, so the aggregate counts it under `skippedVariants` and drops it. About 76 test-side files use these loaders.
3. One loss is unexplained. `t287-calculus-fold.test.mjs` imports the built modules plainly (`:6`, `:9`) and passing cases (P-FOLD `:72`, C-12 `:651`) reach `foldStep` through `coldFold`, yet `foldStep`, `frozenFoldState` and the two `…ForModuleTest` seams read count 0. Each calculus module has 4 skipped variants; the cause is likely a variant load, not established.
4. A silent-return gate reads as a pass. `t287-d1-requirement-handoff.test.mjs:821` returns when `ABI5_D1_CONTINUE` is unset; the case is reported `ok`, so TD-60's 236 skips do not count it.
5. Two tests rebuild the tree under test. `t287-w2-05-generator-package-reproducibility.test.mjs:325` and `t287-w2-05-release-snapshot-definition-bindings.test.mjs:18` run `npm run build` (clean, then `tsc`) in the worktree during the suite; a process that loads a module mid-rebuild sees a different length and becomes a variant.
6. The census line window and one-line artifacts. For overloaded functions the census `lines` is the sum of statement spans (209 declarations affected), which hides 33 never-called implementations (2,398 lines); they are added to the population. A one-line declaration that contains a never-entered inner range reads as wholly unexecuted although its function count is above 0 (17 cases, class X). Ranges of same-named declarations end one line late.
7. Child processes. The worksite command helper's `main` ran 30 times, so helper coverage is captured. `abg/governed_context.ts:459` spawns with `env: {}`, so that child writes no coverage. A process killed by a signal writes none either.
8. The census block list ignores nested executed ranges. V8 reports nested ranges and the count at a position is that of the smallest range containing it; `coverage-report.mjs` marks every line of a count-0 range unexecuted even where a nested range ran. Example: `product/verify_product.ts` has a count-0 range `:2145-2428` that holds ranges with counts 10 to 847,418. The census lists 424 never-entered blocks of 15 or more lines (17,081 lines, nested ranges counted twice); by the innermost rule there are 174 regions (4,743 lines). The census `unexecutedLines` per directory overstates for the same reason. The 493-declaration population is not affected: every member was checked against its function count, and only the 17 one-line artifacts had a count above 0.

## 4. Totals

### 4.1 R by entry

| Entry | Status of the entry | Declarations | Lines | Census lines | Text cover |
| --- | --- | ---: | ---: | ---: | --- |
| TD-25 | Decision; residue retires under either outcome | 22 | 1,669 | 1,779 | named 13, source 7, chain 1, partial 1 |
| TD-26 | Decision; retires under outcome (b) | 37 | 1,059 | 1,211 | named 28, closure 6, source 3 |
| TD-28 | Decision per row | 201 | 2,998 | 3,056 | row 201 |
| TD-31 | Closed at `73e6bdba1` | 9 | 276 | 276 | named 9 |
| TD-43 | Open | 2 | 11 | 11 | named 2 |
| TD-44 | Open, one part Decision | 22 | 227 | 227 | named 12, source 6, source-conditional 4 |
| TD-45 | Open | 22 | 255 | 271 | source 21, named 1 |

Text cover: "named" means the entry names the declaration or a line range holding it; "source" means a finding the entry cites names it; "row" means the TD-28 row's module set or capability holds it; "closure" means only the entry's Closure removes it; "chain" means its only caller is named. Flags for the entry Writers:

- `abg/fh_continuation_projection.ts:289` `exactLifecycleEnvelope` (12 lines) is only partly covered by TD-25: two of its three uses (`:636`, `:669`) are inside the named `:575-701`; the third (`:710`) validates the terminal disposition, whose producer `admitContinuationTerminal` TD-25 names dead, but `:702-817` is in none of TD-25's ranges.
- `abg/traversal_route.ts:994` `graphSpanReentryProjection` (36 lines) lies inside TD-26's named `:952-3002` but belongs to graph-span re-entry, a separate mechanism (abg-traversal `:22`) that only the gated S03 lane reaches. It is class G here, and it stays if One Surface goes.
- `hog/interaction_lifecycle.ts:227` `holdInteraction` is retired by TD-44 only through its source (hog-shared-bindings `:86`); TD-44's own list of HoG twins omits it.
- TD-44's `foldStep`, `frozenFoldState` and the two `…ForModuleTest` seams retire only conditionally: abg-events E10 keeps the fold if the owner counts it as the kernel's specification and retires the seams only with a decision on how the calculus lane reaches the kernel.
- `abg/traversal_route.ts:2028` `rehydrateConstructionIntentForCursorAtDurablePrefix` is TD-45 (AT-12) and also inside TD-26's range.

### 4.2 TD-28 rows

| Row | Declarations | Lines |
| --- | ---: | ---: |
| Semantic job, stage and revision, with requirement handoff | 92 | 1,495 |
| Revision | 34 | 546 |
| Construction recovery | 39 | 524 |
| Command forward (C2 forward re-entry) | 13 | 178 |
| Branch construction (C3) | 4 | 62 |
| abg.codex second CLI | 5 | 59 |
| Governed context (GC03) with its Python adapter | 2 | 48 |
| Native registered-selection task | 6 | 44 |
| Preparation | 3 | 16 |
| Worksite construction (C1) | 1 | 15 |
| Result assessment (result.assess) | 2 | 11 |

### 4.3 By directory

| Directory | R | G | L | D | X | All |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `abg` | 169 / 4,316 | 9 / 334 | 62 / 1,510 |  | 19 / 62 | 259 / 6,222 |
| `gtl` | 25 / 534 |  |  | 1 / 17 |  | 26 / 551 |
| `hog` | 13 / 202 | 2 / 114 | 10 / 218 |  |  | 25 / 534 |
| `implementation` | 42 / 378 | 4 / 30 | 11 / 223 |  | 2 / 10 | 59 / 641 |
| `owner_bindings` | 2 / 96 | 1 / 5 |  |  |  | 3 / 101 |
| `product` | 52 / 833 | 2 / 10 | 43 / 636 | 1 / 20 | 2 / 60 | 100 / 1,559 |
| `public` | 10 / 125 |  | 1 / 9 |  |  | 11 / 134 |
| `shared` | 2 / 11 |  |  |  |  | 2 / 11 |
| `validator` |  | 3 / 76 | 5 / 44 |  |  | 8 / 120 |

Cells are declarations / lines. T is empty in every directory.

### 4.4 Owning entries of L

| Owning entry | Declarations | Lines |
| --- | ---: | ---: |
| (none) | 87 | 1,887 |
| TD-40 (lane or withdraw) | 16 | 260 |
| TD-28 (C2 keep row) | 8 | 200 |
| TD-29 (owning, retires nothing) | 10 | 154 |
| TD-40 (moves to build) | 4 | 63 |
| TD-28 (keep row) | 3 | 45 |
| TD-40 (lane or withdraw); TD-28 (keep row) | 1 | 14 |
| TD-40 (owning: read layer) | 1 | 13 |
| TD-28 (keep row); TD-49 (placement) | 1 | 3 |
| TD-29 (owning) | 1 | 1 |

## 5. R by file

| Entry | File | Declarations | Lines | Decision | Cover |
| --- | --- | ---: | ---: | --- | --- |
| TD-25 | `abg/continuation.ts` | 12 | 935 | yes | source 7, named 5 |
| TD-25 | `abg/fh_continuation_projection.ts` | 4 | 282 | yes | named 3, partial 1 |
| TD-25 | `abg/fh_resume_relation.ts` | 1 | 207 | yes | named 1 |
| TD-25 | `abg/traversal_route.ts` | 2 | 118 | yes | named 1, chain 1 |
| TD-25 | `hog/traversal.ts` | 1 | 48 | yes | named 1 |
| TD-25 | `abg/traversal_cursor.ts` | 1 | 41 | yes | named 1 |
| TD-25 | `abg/retry_progress.ts` | 1 | 38 | yes | named 1 |
| TD-26 | `gtl/consensus.ts` | 12 | 405 | yes | named 12 |
| TD-26 | `implementation/consensus.ts` | 14 | 201 | yes | named 14 |
| TD-26 | `abg/construction_continuation.ts` | 4 | 181 | yes | closure 4 |
| TD-26 | `owner_bindings/run_invocation.ts` | 2 | 96 | yes | closure 2 |
| TD-26 | `product/project_read_ports.ts` | 1 | 68 | yes | named 1 |
| TD-26 | `product/builtin_semantics.ts` | 1 | 63 | yes | named 1 |
| TD-26 | `product/semantics.ts` | 3 | 45 | yes | source 3 |
| TD-28 | `abg/semantic_revision.ts` | 20 | 523 | yes | row 20 |
| TD-28 | `abg/worksite_revision.ts` | 21 | 379 | yes | row 21 |
| TD-28 | `abg/worksite_construction_recovery.ts` | 19 | 337 | yes | row 19 |
| TD-28 | `abg/semantic_stage.ts` | 14 | 259 | yes | row 14 |
| TD-28 | `product/semantic_stage.ts` | 9 | 193 | yes | row 9 |
| TD-28 | `abg/semantic_job.ts` | 11 | 182 | yes | row 11 |
| TD-28 | `abg/worksite_command_forward.ts` | 11 | 152 | yes | row 11 |
| TD-28 | `abg/worksite_input_provenance.ts` | 5 | 134 | yes | row 5 |
| TD-28 | `abg/instruction_assembly.ts` | 7 | 101 | yes | row 7 |
| TD-28 | `gtl/worksite_construction_recovery.ts` | 9 | 93 | yes | row 9 |
| TD-28 | `product/worksite_construction_recovery.ts` | 9 | 84 | yes | row 9 |
| TD-28 | `abg/requirement_handoff.ts` | 5 | 65 | yes | row 5 |
| TD-28 | `public/codex_cli.ts` | 5 | 59 | yes | row 5 |
| TD-28 | `product/worksite_revision.ts` | 3 | 51 | yes | row 3 |
| TD-28 | `product/semantic_revision.ts` | 4 | 50 | yes | row 4 |
| TD-28 | `implementation/semantic_stage.ts` | 10 | 47 | yes | row 10 |
| TD-28 | `product/registered_selection_native.ts` | 6 | 44 | yes | row 6 |
| TD-28 | `abg/default_library.ts` | 1 | 34 | yes | row 1 |
| TD-28 | `implementation/semantic_revision.ts` | 8 | 33 | yes | row 8 |
| TD-28 | `implementation/worksite_command_forward.ts` | 2 | 26 | yes | row 2 |
| TD-28 | `product/worksite_preparation.ts` | 4 | 21 | yes | row 4 |
| TD-28 | `product/worksite_branch_construction.ts` | 1 | 15 | yes | row 1 |
| TD-28 | `product/worksite_construction.ts` | 1 | 15 | yes | row 1 |
| TD-28 | `abg/governed_context.ts` | 1 | 14 | yes | row 1 |
| TD-28 | `gtl/semantic_stage_publication.ts` | 1 | 13 | yes | row 1 |
| TD-28 | `product/execution_resolution.ts` | 1 | 12 | yes | row 1 |
| TD-28 | `product/worksite_command_execution.ts` | 3 | 12 | yes | row 3 |
| TD-28 | `implementation/worksite_command_execution.ts` | 4 | 12 | yes | row 4 |
| TD-28 | `implementation/worksite_construction.ts` | 2 | 10 | yes | row 2 |
| TD-28 | `implementation/requirement_handoff.ts` | 1 | 10 | yes | row 1 |
| TD-28 | `product/result_assessment_operation.ts` | 1 | 8 | yes | row 1 |
| TD-28 | `product/requirement_handoff.ts` | 1 | 7 | yes | row 1 |
| TD-28 | `product/result_definition_bindings.ts` | 1 | 3 | yes | row 1 |
| TD-31 | `product/stdo_environment.ts` | 3 | 142 | no | named 3 |
| TD-31 | `abg/stdo_environment.ts` | 3 | 111 | no | named 3 |
| TD-31 | `gtl/stdo_run_environment.ts` | 3 | 23 | no | named 3 |
| TD-43 | `shared/refusal.ts` | 2 | 11 | no | named 2 |
| TD-44 | `public/gap_authority.ts` | 5 | 66 | yes | named 5 |
| TD-44 | `implementation/leaf_invocation_port.ts` | 1 | 39 | no | named 1 |
| TD-44 | `hog/recursion_lifecycle.ts` | 3 | 39 | no | named 3 |
| TD-44 | `abg/c_call.ts` | 3 | 19 | no | source 2, named 1 |
| TD-44 | `hog/workflow_lifecycle.ts` | 2 | 18 | no | named 2 |
| TD-44 | `abg/calculus/fold.ts` | 2 | 12 | no | source-conditional 2 |
| TD-44 | `abg/native_work_reacquisition.ts` | 1 | 10 | no | source 1 |
| TD-44 | `abg/event_calculus.ts` | 2 | 9 | no | source-conditional 2 |
| TD-44 | `abg/worksite_command_forward.ts` | 1 | 6 | no | source 1 |
| TD-44 | `abg/artifact_truth.ts` | 1 | 6 | no | source 1 |
| TD-44 | `hog/interaction_lifecycle.ts` | 1 | 3 | no | source 1 |
| TD-45 | `abg/c_call.ts` | 3 | 58 | no | source 3 |
| TD-45 | `hog/route_proposal.ts` | 1 | 42 | no | named 1 |
| TD-45 | `hog/traversal_completion.ts` | 2 | 31 | no | source 2 |
| TD-45 | `abg/execution_basis.ts` | 2 | 29 | no | source 2 |
| TD-45 | `abg/graph_application.ts` | 2 | 28 | no | source 2 |
| TD-45 | `abg/traversal_route.ts` | 3 | 19 | no | source 3 |
| TD-45 | `hog/retry_lifecycle.ts` | 2 | 14 | no | source 2 |
| TD-45 | `abg/c_call_outcome.ts` | 3 | 11 | no | source 3 |
| TD-45 | `abg/closure.ts` | 1 | 8 | no | source 1 |
| TD-45 | `hog/ccall_lifecycle.ts` | 1 | 7 | no | source 1 |
| TD-45 | `abg/continuation.ts` | 1 | 5 | no | source 1 |
| TD-45 | `abg/traversal_cursor.ts` | 1 | 3 | no | source 1 |

Secondary reach recorded on R rows (field `alsoReach`): 39 have a call in a gated case, 9 a call in a passing case through a loader the method drops, and 1 a call in the timed-out D5 case.

## 6. G: reached only by a gated lane

| Declaration | Lines | Test | Skip variable | Basis | Owning entry |
| --- | ---: | --- | --- | --- | --- |
| `abg/calculus/axioms.ts:1752` `runtimeFluentMatchesPattern` | 8 | t287-event-calculus-owner-continuation.test.mjs:192 | ABI5_EC_OWNER_EVIDENCE | read |  |
| `abg/invocation_execution_truth.ts:73` `projectGovernanceCoveredSourceUse` | 82 | t287-governance-covered-source-use.test.mjs ("covered use binds exact original state…", "later completed work follows…", "built-in ingress…") | ABG_GOVERNANCE_COVERED_FIXTURE | likely |  |
| `abg/invocation_execution_truth.ts:170` `coveredGovernancePredecessor` | 43 | t287-governance-covered-source-use.test.mjs ("covered use binds exact original state…", "later completed work follows…", "built-in ingress…") | ABG_GOVERNANCE_COVERED_FIXTURE | likely |  |
| `abg/invocation_execution_truth.ts:216` `governanceHistoricalDeclarationReferenceAtPrefix` | 21 | t287-governance-covered-source-use.test.mjs ("covered use binds exact original state…", "later completed work follows…", "built-in ingress…") | ABG_GOVERNANCE_COVERED_FIXTURE | likely |  |
| `abg/invocation_execution_truth.ts:246` `hasAdmittedGovernanceCoveredSourceUse` | 12 | t287-governance-covered-source-use.test.mjs ("covered use binds exact original state…", "later completed work follows…", "built-in ingress…") | ABG_GOVERNANCE_COVERED_FIXTURE | likely |  |
| `abg/project_read_ports.ts:610` `projectClosedGraphCallTerminalAtDurablePrefix` | 12 | t287-native-owner-reuse.test.mjs:76-89; t287-retained-installed-consumer.test.mjs:187 | ABG_OWNER_REUSE_PREDECESSOR; ABI5_RETAINED_CONSUMER_CONFIG | read |  |
| `abg/retry.ts:5118` `planCompletedRetryProgress` | 21 | t287-authenticated-owner-family.test.mjs:38; w2-steel-single-start-closure.test.mjs:160, :231 | ABI5_OWNER_HISTORY; ABI5_STEEL03_RETAINED_CONTINUATION_ROOT | read |  |
| `abg/traversal_route.ts:994` `graphSpanReentryProjection` | 36 | t287-s03-automatic.test.mjs:7, :13 | ABI5_S03_EVIDENCE_ROOT (and ABI5_S03_PHASE_B_RELEASE) | likely |  |
| `abg/traversal_route.ts:3931` `hasGraphSpanReentryRouteEvidence` | 99 | t287-s03-automatic.test.mjs:7, :13 | ABI5_S03_EVIDENCE_ROOT (and ABI5_S03_PHASE_B_RELEASE) | likely |  |
| `hog/route_proposal.ts:441` `proposeGraphSpanReentryRoute` | 59 | t287-s03-automatic.test.mjs:7, :13 | ABI5_S03_EVIDENCE_ROOT (and ABI5_S03_PHASE_B_RELEASE) | likely |  |
| `hog/traversal.ts:435` `deriveGraphSpanReentryCursor` | 55 | support/t287-s03-automatic.mjs:39 via t287-s03-automatic.test.mjs:7, :13 | ABI5_S03_EVIDENCE_ROOT (and ABI5_S03_PHASE_B_RELEASE) | read |  |
| `implementation/release_publication.ts:178` `releaseArtifactResources` | 5 | t287-conformance-owner-reuse.test.mjs:420 | ABI5_CONFORMANCE_PREDECESSOR_ROOT | likely | TD-28 (keep row); TD-49 (placement) |
| `implementation/self_conformance.ts:11` `descriptor` | 5 | t287-qualification-producer-acquisition-reuse.test.mjs | ABI5_PRODUCER_HISTORY_FIXTURE | likely | TD-29 (owning) |
| `implementation/self_conformance.ts:16` `SELF_CONFORMANCE_IMPLEMENTATION_DESCRIPTOR` | 3 | t287-qualification-producer-acquisition-reuse.test.mjs | ABI5_PRODUCER_HISTORY_FIXTURE | likely | TD-29 (owning) |
| `implementation/self_conformance.ts:20` `realizeSelfConformance` | 17 | t287-qualification-producer-acquisition-reuse.test.mjs:158 | ABI5_PRODUCER_HISTORY_FIXTURE | read | TD-29 (owning) |
| `owner_bindings/run_invocation.ts:1117` `isRunInvocationResourceAssertion` | 5 | t287-d1-requirement-handoff.test.mjs:702, :1000; w2-steel-single-start-closure.test.mjs:562, :572; w2-steel-serial-branch-installed :520; w2-steel-single-start-installed :513 | ABI5_D1_CONTINUE (silent return at t287-d1-requirement-handoff.test.mjs:821, read as a pass); ABI5_STEEL03_RETAINED_START_CALL_PATH; ABI5_STEEL04_EVIDENCE_PATH; ABI5_STEEL03_EVIDENCE_PATH | read |  |
| `product/release_snapshot_operations.ts:96` `releaseAuthorityScope` | 5 | t287-conformance-owner-reuse.test.mjs:423 | ABI5_CONFORMANCE_PREDECESSOR_ROOT | likely | TD-28 (keep row) |
| `product/worksite_command_execution.ts:2472` `constructWorksiteCommandExecutionObservation` | 5 | d2-workflow-step.test.mjs:99 ("old C2 carrier/observation constructor…") | ABI5_EVIDENCE_ROOT | read | TD-28 (C2 keep row) |
| `validator/qualification_resources.ts:252` `normalizeQualificationScope` | 18 | t287-qualification-carrier-resource.test.mjs:27, :65 | ABI5_F11_CARRIER_FULL_FIXTURE | read | TD-29 (owning) |
| `validator/self_conformance_basis.ts:23` `hash` | 1 | t287-qualification-producer-acquisition-reuse.test.mjs | ABI5_PRODUCER_HISTORY_FIXTURE | likely | TD-29 (owning) |
| `validator/self_conformance_basis.ts:25` `resolveSelfConformanceOwner` | 57 | t287-qualification-producer-acquisition-reuse.test.mjs | ABI5_PRODUCER_HISTORY_FIXTURE (and four sibling ABI5_PRODUCER_* variables) | read | TD-29 (owning) |

Notes: the four graph-span re-entry declarations are one mechanism; `t287-selected-action`, the other test whose fixture builds a `re_enter` application, is gated by `ABI5_SELECTED_ACTION_EVIDENCE_ROOT`. The four governance covered-use declarations are reached from `abg/invocation_admission.ts:1504` and `abg/native_work_reacquisition.ts:184`, `:190`, `:240`, whose callers ran but never on the covered-use arm. `isRunInvocationResourceAssertion` is also called after the silent return at `t287-d1-requirement-handoff.test.mjs:821`.

## 7. T: reached only by a test that timed out

None as primary class. The tests that timed out under coverage are `steel-basic-cli-public.test.mjs:287` (STEEL-BASIC-CLI-01), `t287-calculus-state-transfer.test.mjs:59` (`batch_in_batch` cancelled; `recovery` and `identity_end` not started), `t287-d5-authentic-preserved-result.test.mjs:54` and `t287-worksite-command-execution.test.mjs:1455` (`http_cleanup_unresolved`). Their reach beyond direct calls cannot be separated. The one direct call is `t287-d5-authentic-preserved-result.test.mjs:81`, `:131` to `projectPreservedWorksiteProposal`, which is R (TD-28 construction recovery).

## 8. L: live and untested, ranked by risk

Risk tiers: 1, durable failure or refusal admission (writes events or decides a failing terminal); 2, an admission or evidence guard, or a Public refusal mapping (a wrong answer admits, refuses or returns a wrong Public code); 3, an internal refusal or error value builder, a transport refusal or a constructor guard; 4, a legacy read projection or build-time code that another entry owns; 5, a one-line helper. Within a tier, larger first.

| Rank | Declaration | Lines | What it does | Natural test home | Owning entry | Why this rank |
| ---: | --- | ---: | --- | --- | --- | --- |
| 1 | `abg/graph_application.ts:680` `admitRecursiveApplicationChildPreparationRefusal` | 167 | admits and writes the refusal of a recursive application whose child cannot be prepared (167 lines) | t287-recursive-failure-foldback |  | tier 1: largest unexecuted durable refusal writer; a wrong event set corrupts the recursion parent's history |
| 2 | `abg/c_call.ts:3961` `admitWorkflowChildPreparationRefusal` | 120 | admits and writes the refusal of a workflow C-call whose child cannot be prepared (120 lines) | t287-held-prefix or t287-readable-stops-foldback |  | tier 1: durable refusal writer for the workflow parent; same door as the recursive one |
| 3 | `abg/traversal_route.ts:5690` `admitBlockedRetryTraversalTransitionUsing` | 118 | shared body of the blocked-retry route transition admission, complete and owned modes (118 lines); its owned wrapper's caller hog/retry_lifecycle.ts:610 ran but never on the blocked arm | t287-r4-aba-retry or m5-retry-lifecycle-authority |  | tier 1: admits the route that ends a retry as blocked; untested failure exit of the retry loop |
| 4 | `abg/traversal_route.ts:5569` `admitCompletedRetryTraversalTransitionUsing` | 83 | shared body of the completed-retry route transition admission (83 lines); owned wrapper caller hog/structural_transition.ts:258 ran, never on this arm | t287-r6-retry-success-exit |  | tier 1: admits the route that leaves a retry after completed progress |
| 5 | `hog/workflow_lifecycle.ts:213` `completeBlockedWorkflowOutcome` | 51 | completes a workflow locus whose C-call outcome is blocked (callers :733, :782 ran, never on this arm) | t287-held-prefix |  | tier 1: blocked workflow terminal; decides the failing completion of a workflow |
| 6 | `abg/c_call_outcome.ts:791` `admitProbabilisticPayloadRejection` | 29 | admits the rejection of a probabilistic payload (caller :1479) | t287-f04a-probabilistic-result-candidate |  | tier 1: admits a worker-payload rejection as the C-call result |
| 7 | `abg/graph_application.ts:1176` `admitChildPreparationRefusal` | 29 | dispatcher that admits a child-preparation refusal for a recursive application or a workflow child; callers hog/recursion_lifecycle.ts:459 (blockRecursion) and workflow_lifecycle.ts:289 (beginOwnedWorkflowLocus) ran, never on this arm | t287-recursive-failure-foldback |  | tier 1: only door for a child that cannot be prepared; writes the refusal events that end the parent |
| 8 | `hog/recursion_lifecycle.ts:287` `recursionFailure` | 29 | builds the failed completion of a deferred recursion (callers :354, :386) | t287-recursive-failure-foldback |  | tier 1: recursion failure terminal |
| 9 | `abg/retry.ts:5679` `admitPlannedCompletedRetryProgressInActiveTransaction` | 26 | writes planned completed retry progress inside the route transaction (called from traversal_route.ts:5599) | t287-r6-retry-success-exit |  | tier 1: durable write on the completed-retry exit |
| 10 | `hog/workflow_lifecycle.ts:186` `workflowFailure` | 26 | builds the failed completion of a workflow locus (callers :477, :595) | t287-held-prefix |  | tier 1: workflow failure terminal |
| 11 | `hog/recursion_lifecycle.ts:139` `failRecursionInput` | 25 | fails a recursion whose input cannot be traversed (callers :613, :629) | t287-recursive-failure-foldback |  | tier 1: recursion input failure terminal |
| 12 | `abg/c_call_outcome.ts:1047` `stageBlockedOutcome` | 22 | stages a blocked C-call outcome (callers :1208, :1410) | t287-lifecycle-failure-carrier |  | tier 1: blocked outcome staging; a durable failure record |
| 13 | `hog/workflow_lifecycle.ts:265` `rejectWorkflowAdmission` | 22 | completes a workflow whose C-call admission was rejected (caller :471) | t287-held-prefix |  | tier 1: workflow admission-rejection terminal |
| 14 | `abg/traversal_route.ts:5563` `admitOwnedCompletedRetryTraversalTransition` | 5 | owned-mode wrapper of the completed-retry transition (caller hog/structural_transition.ts:258) | t287-r6-retry-success-exit |  | tier 1: entry to the completed-retry transition |
| 15 | `abg/traversal_route.ts:5684` `admitOwnedBlockedRetryTraversalTransition` | 5 | owned-mode wrapper of the blocked-retry transition (caller hog/retry_lifecycle.ts:610) | t287-r4-aba-retry |  | tier 1: entry to the blocked-retry transition |
| 16 | `implementation/worksite_command_helper.ts:1066` `reportSet` | 70 | reads and checks the declared JUnit report set of a C2 command (callers :1385, :1487) | t287-owned-process-lifetime (its controlled helper overrides report reads in every case) or t287-worksite-command-execution | TD-28 (C2 keep row) | tier 2: C2 report evidence; a wrong count admits a failing test run |
| 17 | `product/stdo_environment.ts:245` `compareInstalledC2ContextMaterial` | 67 | compares historical and current installed C2 context material (caller product/semantics.ts:110) | t287-native-c2-instruction-assembly or t287-environment-projection-conservation |  | tier 2: context-meaning comparison that decides reuse of C2 context |
| 18 | `product/workspace_definition_bindings.ts:267` `open` | 57 | the whole workspace.open definition binding (registered at :327); never called by the suite | r3-workspace-binding or an installed-CLI workspace.open lane |  | tier 2: an entire Public member with no executing lane |
| 19 | `implementation/worksite_command_helper.ts:665` `reportObservation` | 51 | observes one expected report of a C2 command (caller :803) | t287-owned-process-lifetime (its controlled helper overrides report reads in every case) or t287-worksite-command-execution | TD-28 (C2 keep row) | tier 2: C2 report evidence |
| 20 | `abg/traversal_route.ts:3240` `hasStructuralIdentityRouteEvidence` | 46 | route evidence check for structural-identity routes (caller :4667) | t287-route-reconstruction |  | tier 2: route admission evidence guard |
| 21 | `abg/retry.ts:1730` `deriveHistoricalContinuationCursor` | 45 | derives the continuation cursor of a historical retry route (caller :2294) | t287-route-reconstruction |  | tier 2: historical replay cursor derivation |
| 22 | `abg/retry_progress.ts:1012` `hasStructuralIdentityCompletedRouteCausation` | 43 | checks structural-identity causation of a completed route (caller abg/runtime_liveness.ts:57) | t287-runtime-activity-quiescence |  | tier 2: liveness obligation check |
| 23 | `product/release_snapshot_definition_bindings.ts:37` `owner` | 43 | the release snapshot definition owner (tap, commit, publish) | t287-w2-05-release-snapshot-definition-bindings | TD-28 (keep row) | tier 2: release owner; TD-28 records release snapshot as required and never run for a 5.x cut |
| 24 | `abg/project_read_ports.ts:567` `projectHistoricalGraphCallSourceAtDurablePrefix` | 41 | historical graph-call source at a durable prefix (caller implementation/leaf_invocation_port.ts:498 when an owner prefix is present) | t287-historical-source-resource |  | tier 2: historical source evidence |
| 25 | `abg/qualification_proof.ts:1087` `projectQualificationVerdict` | 39 | qualification and self-conformance; TD-29 retires nothing and keeps the gate. No gated lane names this declaration; the qualification tests load these modules through privateOwner or staged copies, which the method drops (possible variant reach, not established). Realizations are loaded by descriptor (modulePath and namedSymbol, e.g. implementation/qualification.ts:25, gtl/self_conformance.ts:163), which a caller grep misses | the qualification lane TD-29 keeps gated (t287-qualification-* family) | TD-29 (owning, retires nothing) | tier 2: qualification verdict and ruling law; a wrong verdict qualifies or refuses a release candidate |
| 26 | `abg/retry_progress.ts:487` `exactCursorCarrierEvent` | 39 | selects the exact cursor carrier event of retry progress (caller :855) | t287-retry-run-prefix |  | tier 2: evidence selection |
| 27 | `abg/retry_progress.ts:527` `exactFanOutCompletionWitness` | 38 | selects the exact fan-out completion witness of retry progress (caller :890) | t287-retry-run-prefix |  | tier 2: evidence selection |
| 28 | `implementation/worksite_command_helper.ts:1016` `reportCounts` | 32 | parses tests and failures counts from a JUnit report (caller :1104) | t287-owned-process-lifetime (its controlled helper overrides report reads in every case) or t287-worksite-command-execution | TD-28 (C2 keep row) | tier 2: counts decide pass or fail |
| 29 | `product/catalog_definition_bindings.ts:383` `projectCatalogRefusal` | 27 | maps a native catalog construction or validation refusal to the Public refusal (caller :589) | r4-catalog-admission or t287-w2-05-install-catalog-owner-chain |  | tier 2: Public refusal mapping of catalog admit, view or apply |
| 30 | `abg/c_call.ts:2367` `exactContractRejectionFailureSource` | 26 | reads the exact failure source of a contract rejection at a prefix (caller :3605) | t287-runtime-failure-diagnostic |  | tier 2: failure-source evidence check |
| 31 | `product/workspace_definition_bindings.ts:97` `createRefusalCode` | 23 | maps a native create result to the Public create code (caller :251) | r3-workspace-binding |  | tier 2: Public refusal mapping of workspace create or open |
| 32 | `abg/qualification_proof.ts:1128` `resolveQualificationSelfConformanceOwner` | 22 | qualification and self-conformance; TD-29 retires nothing and keeps the gate. No gated lane names this declaration; the qualification tests load these modules through privateOwner or staged copies, which the method drops (possible variant reach, not established). Realizations are loaded by descriptor (modulePath and namedSymbol, e.g. implementation/qualification.ts:25, gtl/self_conformance.ts:163), which a caller grep misses | the qualification lane TD-29 keeps gated (t287-qualification-* family) | TD-29 (owning, retires nothing) | tier 2: qualification verdict and ruling law; a wrong verdict qualifies or refuses a release candidate |
| 33 | `abg/retry.ts:3280` `executableRetryInputRefusal` | 21 | refusal of an executable retry input projection (callers :3594, :3612) | t287-r4-aba-retry |  | tier 2: retry input refusal |
| 34 | `product/catalog_definition_bindings.ts:770` `reconstructCatalogView` | 21 | reconstructs the catalog view for the apply check (caller :856) | r4-catalog-admission or t287-w2-05-install-catalog-owner-chain |  | tier 2: Public refusal mapping of catalog admit, view or apply |
| 35 | `product/environment_definition_bindings.ts:264` `resolveRefusalCode` | 21 | maps a native environment refusal to the Public resolve code (caller :468) | r3-workspace-binding or t287-st2a-e-exact-prefix-workspace-environment |  | tier 2: Public refusal mapping of environment resolve or bind |
| 36 | `validator/conformance_definition_bindings.ts:115` `nativeRefusal` | 21 | maps a native conformance refusal to the Public output (caller :435) | t287-qualification-law or a conformance-owner lane |  | tier 2: conformance refusal mapping |
| 37 | `abg/qualification_proof.ts:511` `projectQualificationRulingForConsumer` | 20 | qualification and self-conformance; TD-29 retires nothing and keeps the gate. No gated lane names this declaration; the qualification tests load these modules through privateOwner or staged copies, which the method drops (possible variant reach, not established). Realizations are loaded by descriptor (modulePath and namedSymbol, e.g. implementation/qualification.ts:25, gtl/self_conformance.ts:163), which a caller grep misses | the qualification lane TD-29 keeps gated (t287-qualification-* family) | TD-29 (owning, retires nothing) | tier 2: qualification verdict and ruling law; a wrong verdict qualifies or refuses a release candidate |
| 38 | `abg/qualification_proof.ts:631` `projectQualificationOwnerRuling` | 20 | qualification and self-conformance; TD-29 retires nothing and keeps the gate. No gated lane names this declaration; the qualification tests load these modules through privateOwner or staged copies, which the method drops (possible variant reach, not established). Realizations are loaded by descriptor (modulePath and namedSymbol, e.g. implementation/qualification.ts:25, gtl/self_conformance.ts:163), which a caller grep misses | the qualification lane TD-29 keeps gated (t287-qualification-* family) | TD-29 (owning, retires nothing) | tier 2: qualification verdict and ruling law; a wrong verdict qualifies or refuses a release candidate |
| 39 | `product/environment_definition_bindings.ts:585` `bindRefusalCode` | 20 | maps a native environment refusal to the Public bind code (caller :692) | r3-workspace-binding or t287-st2a-e-exact-prefix-workspace-environment |  | tier 2: Public refusal mapping of environment resolve or bind |
| 40 | `product/execution_resolution.ts:405` `closureRefusal` | 20 | refusal when the execution declaration closure does not resolve (callers :532, :655) | r6-implementation-resolution |  | tier 2: resolution refusal |
| 41 | `abg/c_call.ts:2300` `deriveContractRejectionFailureSource` | 19 | derives the failure source of a contract rejection (caller :3145) | t287-runtime-failure-diagnostic |  | tier 2: failure-source derivation |
| 42 | `abg/retry.ts:2992` `historicalRouteReplayCause` | 18 | selects the replay cause of a historical route (caller :2097) | t287-route-reconstruction |  | tier 2: replay causation |
| 43 | `hog/traversal_failure.ts:16` `refuseTraversalEntry` | 18 | refusal of a graph traversal entry (caller hog/graph_execute.ts:871 inside resumeEntryRefusal) | r8-direct-hog-entry |  | tier 2: traversal entry refusal returned to the caller |
| 44 | `abg/qualification_proof.ts:838` `qualificationTenantClaimsMatch` | 17 | qualification and self-conformance; TD-29 retires nothing and keeps the gate. No gated lane names this declaration; the qualification tests load these modules through privateOwner or staged copies, which the method drops (possible variant reach, not established). Realizations are loaded by descriptor (modulePath and namedSymbol, e.g. implementation/qualification.ts:25, gtl/self_conformance.ts:163), which a caller grep misses | the qualification lane TD-29 keeps gated (t287-qualification-* family) | TD-29 (owning, retires nothing) | tier 2: qualification verdict and ruling law; a wrong verdict qualifies or refuses a release candidate |
| 45 | `abg/retry_lifecycle.ts:306` `hasCausalAncestor` | 17 | causal-ancestry check of a retry judgment (caller :142) | m5-retry-lifecycle-authority |  | tier 2: causation guard |
| 46 | `product/catalog_definition_bindings.ts:803` `applyReceipt` | 17 | apply receipt on the refusal arms (callers :898, :922) | r4-catalog-admission or t287-w2-05-install-catalog-owner-chain |  | tier 2: Public refusal mapping of catalog admit, view or apply |
| 47 | `product/environment_definition_bindings.ts:127` `fault` | 16 | definition execution fault of the environment bindings | r3-workspace-binding or t287-st2a-e-exact-prefix-workspace-environment |  | tier 2: Public refusal mapping of environment resolve or bind |
| 48 | `hog/graph_execute.ts:864` `resumeEntryRefusal` | 15 | refusal of a pending-execution resume entry (callers :895, :931) | r8-direct-hog-entry or m5-fresh-process-reconstruction |  | tier 2: resume refusal; wrong code misleads the operator |
| 49 | `product/workspace_definition_bindings.ts:53` `fault` | 15 | definition execution fault of workspace create and open | r3-workspace-binding |  | tier 2: Public refusal mapping of workspace create or open |
| 50 | `product/verification_definition_bindings.ts:77` `fault` | 14 | definition execution fault of product verification (callers :111, :118) | t287-wave2-installed-product-verification |  | tier 2: Public refusal mapping of product verification |
| 51 | `abg/environment_admission.ts:171` `duplicateInvocationRefusal` | 13 | refusal of a duplicate effectful public invocation (caller :931) | t291-m6-admission-refusal-surface |  | tier 2: duplicate-invocation refusal on an effectful door |
| 52 | `product/project_read_definition_bindings.ts:145` `nativeRefusal` | 13 | maps a native product read refusal to the Public refusal (6 callers, 5 executed) | t287-cross-cut-public-read | TD-40 (owning: read layer) | tier 2: Public read refusal mapping |
| 53 | `abg/c_call.ts:1692` `runtimeFailureCloseRefusal` | 12 | refusal of a runtime-failure close (callers :3232, :3270) | t287-runtime-failure-diagnostic |  | tier 2: runtime-failure close refusal |
| 54 | `abg/c_call.ts:2241` `hasAdmittedActorEvidence` | 12 | authenticates admitted actor evidence of a completed C-call when no transport record is given (caller :6729) | t287-native-owner-reuse |  | tier 2: authentication guard; false admit lets unauthenticated completion through |
| 55 | `abg/event_store.ts:2673` `acquisitionRefusal` | 12 | event-store acquisition refusal (callers :2699, :2712) | m5-event-store-reopen |  | tier 2: store acquisition refusal; a wrong code at the store door |
| 56 | `abg/event_store.ts:4355` `appendRefusal` | 12 | event-store append refusal: prefix mismatch or sink unavailable (callers :4390, :4402) | m5-event-store-reopen |  | tier 2: append failure path of the log |
| 57 | `product/workspace_operations.ts:178` `refusal` | 12 | native workspace operation refusal (callers :503, :511) | r3-workspace-binding |  | tier 2: workspace refusal |
| 58 | `implementation/leaf_invocation_port.ts:383` `ownerRefusal` | 11 | owner-boundary refusal of the leaf invocation port (callers :1588, :1594); leaf_invocation_port.js is also loaded with ?env= by support/root-installed-environment.mjs:348 and in 21 skipped variants, so a dropped instance may have run it (not established) | t287-c2a-fp-source-contract or t287-owned-native-proof |  | tier 2: leaf owner boundary exception path |
| 59 | `validator/qualification.ts:788` `qualificationRulingMatches` | 11 | qualification and self-conformance; TD-29 retires nothing and keeps the gate. No gated lane names this declaration; the qualification tests load these modules through privateOwner or staged copies, which the method drops (possible variant reach, not established). Realizations are loaded by descriptor (modulePath and namedSymbol, e.g. implementation/qualification.ts:25, gtl/self_conformance.ts:163), which a caller grep misses | the qualification lane TD-29 keeps gated (t287-qualification-* family) | TD-29 (owning, retires nothing) | tier 2: qualification verdict and ruling law; a wrong verdict qualifies or refuses a release candidate |
| 60 | `product/catalog_definition_bindings.ts:792` `applyRefusal` | 10 | Public refusal of catalog apply (callers :898, :917) | r4-catalog-admission or t287-w2-05-install-catalog-owner-chain |  | tier 2: Public refusal mapping of catalog admit, view or apply |
| 61 | `product/catalog_operations.ts:73` `catalogValidationRefusal` | 10 | native catalog validation refusal (callers :276, :289) | r4-catalog-admission |  | tier 2: catalog admission refusal |
| 62 | `product/environment_definition_bindings.ts:618` `bindingRefusal` | 10 | Public refusal of workspace bind (callers :692, :752) | r3-workspace-binding or t287-st2a-e-exact-prefix-workspace-environment |  | tier 2: Public refusal mapping of environment resolve or bind |
| 63 | `product/install_definition_bindings.ts:202` `refusalOutput` | 10 | Public refusal of product install (caller :348) | r2-clean-install |  | tier 2: Public refusal mapping of product install |
| 64 | `product/workspace_definition_bindings.ts:121` `openRefusalCode` | 10 | maps a native open result to the Public open code (caller :313) | r3-workspace-binding |  | tier 2: Public refusal mapping of workspace create or open |
| 65 | `abg/environment_admission.ts:833` `predecessorCoordinateRefusal` | 9 | append refusal when the predecessor coordinate is wrong (callers :869, :1054) | t291-m6-admission-refusal-surface |  | tier 2: admission append refusal |
| 66 | `product/catalog_definition_bindings.ts:373` `catalogRefusal` | 9 | Public refusal of catalog admission (caller :600) | r4-catalog-admission or t287-w2-05-install-catalog-owner-chain |  | tier 2: Public refusal mapping of catalog admit, view or apply |
| 67 | `product/verification_definition_bindings.ts:213` `refusalOutput` | 9 | Public refusal of product verification (caller :243) | t287-wave2-installed-product-verification |  | tier 2: Public refusal mapping of product verification |
| 68 | `public/cli.ts:67` `transportRefusal` | 9 | public_transport_refusal of abg.cli for bad arguments, a request file without one line, invalid JSON, an invalid request or a transport failure (module-level callers :83, :94, :104, :113, :136) | steel-basic-cli-public |  | tier 2: the CLI's only refusal output; exit code 2 paths |
| 69 | `abg/qualification_proof.ts:1078` `ownerInstallCatalogs` | 8 | qualification and self-conformance; TD-29 retires nothing and keeps the gate. No gated lane names this declaration; the qualification tests load these modules through privateOwner or staged copies, which the method drops (possible variant reach, not established). Realizations are loaded by descriptor (modulePath and namedSymbol, e.g. implementation/qualification.ts:25, gtl/self_conformance.ts:163), which a caller grep misses | the qualification lane TD-29 keeps gated (t287-qualification-* family) | TD-29 (owning, retires nothing) | tier 2: qualification verdict and ruling law; a wrong verdict qualifies or refuses a release candidate |
| 70 | `abg/retry.ts:4842` `validatedRetryRuntimeFailurePlansEqual` | 8 | equality of two validated retry runtime-failure plans (caller :4924) | t287-lifecycle-failure-carrier |  | tier 2: plan mismatch detection on the failure transition |
| 71 | `product/catalog_definition_bindings.ts:162` `fault` | 8 | definition execution fault of the catalog bindings (5 executed callers) | r4-catalog-admission or t287-w2-05-install-catalog-owner-chain |  | tier 2: Public refusal mapping of catalog admit, view or apply |
| 72 | `product/catalog_definition_bindings.ts:675` `viewRefusal` | 8 | Public refusal of catalog view (caller :732) | r4-catalog-admission or t287-w2-05-install-catalog-owner-chain |  | tier 2: Public refusal mapping of catalog admit, view or apply |
| 73 | `product/environment_definition_bindings.ts:505` `bindFault` | 8 | bind-stage fault (callers :541, :575) | r3-workspace-binding or t287-st2a-e-exact-prefix-workspace-environment |  | tier 2: Public refusal mapping of environment resolve or bind |
| 74 | `product/install_definition_bindings.ts:92` `installFault` | 8 | definition execution fault of product install (callers :145, :179) | r2-clean-install |  | tier 2: Public refusal mapping of product install |
| 75 | `product/verification_definition_bindings.ts:223` `mismatchOutput` | 8 | Public mismatch refusal of product verification (callers :237, :254) | t287-wave2-installed-product-verification |  | tier 2: Public refusal mapping of product verification |
| 76 | `validator/qualification.ts:259` `reportedTestFiles` | 8 | qualification and self-conformance; TD-29 retires nothing and keeps the gate. No gated lane names this declaration; the qualification tests load these modules through privateOwner or staged copies, which the method drops (possible variant reach, not established). Realizations are loaded by descriptor (modulePath and namedSymbol, e.g. implementation/qualification.ts:25, gtl/self_conformance.ts:163), which a caller grep misses | the qualification lane TD-29 keeps gated (t287-qualification-* family) | TD-29 (owning, retires nothing) | tier 2: qualification verdict and ruling law; a wrong verdict qualifies or refuses a release candidate |
| 77 | `abg/traversal_route.ts:606` `projectReplayPropagatingHistoricalTraversalRouteAtPrefix` | 7 | projects a replay-propagating historical route (caller abg/retry.ts:2999 inside historicalRouteReplayCause) | t287-route-reconstruction |  | tier 2: historical replay projection |
| 78 | `product/environment_definition_bindings.ts:184` `resolveFault` | 7 | resolve-stage fault (callers :240, :255) | r3-workspace-binding or t287-st2a-e-exact-prefix-workspace-environment |  | tier 2: Public refusal mapping of environment resolve or bind |
| 79 | `abg/retry.ts:1461` `isDeclaredCRetryExitConsumption` | 6 | predicate: a historical route consumes a declared C-retry exit (callers :2592, :2606) | t287-r6-retry-success-exit |  | tier 2: retry exit classification |
| 80 | `implementation/qualification.ts:82` `realizeQualificationRuling` | 6 | qualification and self-conformance; TD-29 retires nothing and keeps the gate. No gated lane names this declaration; the qualification tests load these modules through privateOwner or staged copies, which the method drops (possible variant reach, not established). Realizations are loaded by descriptor (modulePath and namedSymbol, e.g. implementation/qualification.ts:25, gtl/self_conformance.ts:163), which a caller grep misses | the qualification lane TD-29 keeps gated (t287-qualification-* family) | TD-29 (owning, retires nothing) | tier 2: qualification verdict and ruling law; a wrong verdict qualifies or refuses a release candidate |
| 81 | `product/install_definition_bindings.ts:213` `nativeRefusalOutput` | 6 | maps a native install refusal to the Public refusal (caller :287) | r2-clean-install |  | tier 2: Public refusal mapping of product install |
| 82 | `abg/worker_transport.ts:717` `refuseBeforeLaunch` | 5 | reports a spawn failure to the observer and throws before launch (callers :495, :510) | m5-worker-transport |  | tier 2: worker spawn failure path |
| 83 | `product/catalog_definition_bindings.ts:201` `rowCoordinate` | 5 | catalog row coordinate on the apply resource check (caller :863) | r4-catalog-admission or t287-w2-05-install-catalog-owner-chain |  | tier 2: Public refusal mapping of catalog admit, view or apply |
| 84 | `product/catalog_definition_bindings.ts:207` `applicationCoordinate` | 5 | catalog application coordinate of the apply receipt (caller :935) | r4-catalog-admission or t287-w2-05-install-catalog-owner-chain |  | tier 2: Public refusal mapping of catalog admit, view or apply |
| 85 | `hog/graph_execute.ts:930` `pendingRestorationRefusal` | 4 | refusal when a pending execution occurrence or child basis cannot be restored (callers :986, :998) | m5-fresh-process-reconstruction |  | tier 2: restoration refusal |
| 86 | `product/environment_definition_bindings.ts:144` `isExecutionFault` | 3 | fault predicate in the Effect catch (callers :481, :802) | r3-workspace-binding or t287-st2a-e-exact-prefix-workspace-environment |  | tier 2: Public refusal mapping of environment resolve or bind |
| 87 | `validator/qualification.ts:270` `observedQualificationTestSummaries` | 3 | qualification and self-conformance; TD-29 retires nothing and keeps the gate. No gated lane names this declaration; the qualification tests load these modules through privateOwner or staged copies, which the method drops (possible variant reach, not established). Realizations are loaded by descriptor (modulePath and namedSymbol, e.g. implementation/qualification.ts:25, gtl/self_conformance.ts:163), which a caller grep misses | the qualification lane TD-29 keeps gated (t287-qualification-* family) | TD-29 (owning, retires nothing) | tier 2: qualification verdict and ruling law; a wrong verdict qualifies or refuses a release candidate |
| 88 | `abg/stdo_environment.ts:194` `confined` | 1 | path confinement predicate of run-environment evidence (callers :259, :266) | t287-stdo3-run-environment |  | tier 2: path confinement; TD-37 counts the path rules |
| 89 | `product/workspace_operations.ts:204` `isImportedCreatePacket` | 18 | admits an imported workspace create packet (caller :501) | r3-workspace-binding |  | tier 3: packet shape guard for the imported create arm |
| 90 | `hog/child_traversal.ts:111` `refusal` | 16 | refusal value of child traversal preparation (callers :171, :182) | t287-c2-child-program |  | tier 3: refusal value builder |
| 91 | `implementation/worksite_command_helper.ts:1049` `walkFiles` | 16 | walks the report directory (caller :1096) | t287-owned-process-lifetime (its controlled helper overrides report reads in every case) or t287-worksite-command-execution | TD-28 (C2 keep row) | tier 3: filesystem helper |
| 92 | `abg/closure.ts:93` `refuseClosureWithoutEffects` | 13 | scope-closure refusal with no effects (callers :370, :397) | r9-causal-result-closure |  | tier 3: refusal value builder |
| 93 | `abg/execution_basis.ts:2197` `childRefusal` | 12 | refusal value of child execution basis admission (callers :2255, :2341) | t287-c2-child-program |  | tier 3: refusal value builder |
| 94 | `abg/fan_out.ts:149` `refusal` | 12 | refusal value of fan-out completion (callers :171, :196) | t287-tv5-rooted-topology-partition |  | tier 3: refusal value builder |
| 95 | `abg/graph_application.ts:318` `refusal` | 12 | refusal value of application child foldback (callers :887, :902) | t287-recursive-failure-foldback |  | tier 3: refusal value builder |
| 96 | `hog/route_proposal.ts:82` `routeRefusal` | 12 | refusal value of route proposal; 13 call sites, 11 in executed callers | t287-route-reconstruction |  | tier 3: refusal value builder on every proposer's refusal arm |
| 97 | `product/catalog_operations.ts:309` `constructCatalogApplication` | 12 | the apply member of the catalog port (registered at :325) | r4-catalog-admission |  | tier 3: catalog apply construction |
| 98 | `implementation/worksite_command_helper.ts:1006` `declaredReportSet` | 9 | reads the declared report set of a task (callers :1383, :1483) | t287-owned-process-lifetime (its controlled helper overrides report reads in every case) or t287-worksite-command-execution | TD-28 (C2 keep row) | tier 3: declaration reader |
| 99 | `implementation/worksite_file_replace.ts:751` `fileParentsRealizationCandidate` | 9 | builds the realization candidate of a file-parents outcome (callers :740, :747) | t287-post-binding-worksite-write |  | tier 3: realization of one worksite write outcome |
| 100 | `implementation/worksite_command_helper.ts:717` `signalProcess` | 8 | signals the command process group from the SIGTERM/SIGINT handler (:728) | t287-owned-process-lifetime | TD-28 (C2 keep row) | tier 3: signal-handler path; processes killed by signal write no coverage |
| 101 | `implementation/worksite_command_helper.ts:997` `nodeTestPassCount` | 8 | parses the node:test pass count from command output (caller :1382) | t287-owned-process-lifetime (its controlled helper overrides report reads in every case) or t287-worksite-command-execution | TD-28 (C2 keep row) | tier 3: count parser |
| 102 | `abg/event_store.ts:1514` `payloadInvocationRef` | 7 | reads invocationRef from an event payload for a scoped scan (caller :1536) | m5-event-store-reopen |  | tier 3: scope filter helper |
| 103 | `abg/stdo_environment.ts:48` `stdoRecordInventory` | 7 | parses a release_record@1 inventory table (caller product/stdo_environment.ts:216) | t287-stdo-environment-citation |  | tier 3: format branch |
| 104 | `product/worksite_command_execution.ts:1041` `isExpectedReport` | 6 | expected-report shape predicate inside the task check (caller :1086) | t287-worksite-command-execution | TD-28 (C2 keep row) | tier 3: task shape guard |
| 105 | `abg/runtime_liveness.ts:44` `runtimeAssetRevisionDigest` | 4 | digest of a native asset's stat identity, used to detect change during observation (callers :345, :346) | t287-liveness-heartbeat |  | tier 3: asset-change detection |
| 106 | `abg/retry.ts:4317` `retryRuntimeFailureTransitionError` | 3 | TypeError builder of the retry runtime-failure transition refusal (callers :4686, :4802) | t287-lifecycle-failure-carrier |  | tier 3: error builder on a refusal arm |
| 107 | `implementation/release_publication.ts:173` `readReleaseArtifactBytes` | 3 | reads and admits a release operation artifact file for the release evidence read (caller product/project_read_ports.ts:786 ran) | t287-release-publication | TD-28 (keep row); TD-49 (placement) | tier 3: returns null on an unreadable artifact; the null arm is unexercised |
| 108 | `product/materialization_definition_bindings.ts:222` `refusedAt` | 1 | one-line refusal of a materialization request whose binding or workspace differs (callers :231, :233) | t287-st2a-e-exact-prefix-workspace-environment |  | tier 3: request-mismatch refusal |
| 109 | `abg/project_read_ports.ts:1609` `gapCall` | 31 | legacy project.read projection behind the reopen-only binding: gap call basis of the gap reads | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: helper of unexecuted read members |
| 110 | `product/public_contract_publication.ts:491` `bindingRefusal` | 30 | refusal of S06 public catalog binding (callers :581, :592); build-time code | t287-wave2-owner-contract-source-set | TD-40 (moves to build) | tier 4: build-time publication path; TD-40 moves the module to the build |
| 111 | `abg/project_read_ports.ts:1419` `evidenceProjection` | 23 | legacy project.read projection behind the reopen-only binding: C-call evidence projection of the run reads | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: helper of unexecuted read members |
| 112 | `abg/project_read_ports.ts:1585` `projectCCallReplay` | 22 | legacy project.read projection behind the reopen-only binding: c_call_replay (dispatched at project_read_ports.ts:1801-1833) | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: unexecuted Public read member |
| 113 | `abg/project_read_ports.ts:1482` `projectWorkspaceReplay` | 21 | legacy project.read projection behind the reopen-only binding: workspace_replay (dispatched at project_read_ports.ts:1801-1833) | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: unexecuted Public read member |
| 114 | `abg/project_read_ports.ts:1541` `projectInteractionReplay` | 21 | legacy project.read projection behind the reopen-only binding: interaction_replay (dispatched at project_read_ports.ts:1801-1833) | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: unexecuted Public read member |
| 115 | `abg/project_read_ports.ts:1563` `projectContinuationReplay` | 21 | legacy project.read projection behind the reopen-only binding: continuation_replay (dispatched at project_read_ports.ts:1801-1833) | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: unexecuted Public read member |
| 116 | `product/public_contract_publication.ts:471` `refusalContract` | 19 | refusal contract coordinate of the S06 public function catalog (caller :502); build-time code | t287-wave2-owner-contract-source-set | TD-40 (moves to build) | tier 4: build-time publication path; TD-40 moves the module to the build |
| 117 | `abg/project_read_definition_bindings.ts:494` `lawfulActionProjection` | 18 | legacy project.read projection behind the reopen-only binding: lawful-action read projection | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: helper of unexecuted read members |
| 118 | `abg/project_read_ports.ts:1740` `projectWorkspaceGaps` | 16 | legacy project.read projection behind the reopen-only binding: workspace_gaps (dispatched at project_read_ports.ts:1801-1833) | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: unexecuted Public read member |
| 119 | `abg/project_read_ports.ts:1363` `projectGraphCallStatus` | 15 | legacy project.read projection behind the reopen-only binding: graph_call_status (dispatched at project_read_ports.ts:1801-1833) | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: unexecuted Public read member |
| 120 | `abg/project_read_ports.ts:1466` `projectResultEvidence` | 15 | legacy project.read projection behind the reopen-only binding: result_evidence (dispatched at project_read_ports.ts:1801-1833) | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: unexecuted Public read member |
| 121 | `product/project_read_definition_bindings.ts:1003` `releaseReadOwner` | 14 | project.read#release_evidence owner | t287-release-publication or the installed CLI read lane TD-40 asks for | TD-40 (lane or withdraw); TD-28 (keep row) | tier 4: read projection; TD-40 asks for one lane per unexecuted read member |
| 122 | `abg/project_read_ports.ts:1443` `projectRunEvidence` | 12 | legacy project.read projection behind the reopen-only binding: run_evidence (dispatched at project_read_ports.ts:1801-1833) | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: unexecuted Public read member |
| 123 | `abg/project_read_definition_bindings.ts:211` `coordinateSet` | 11 | legacy project.read projection behind the reopen-only binding: coordinate set of read atoms and actions | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: helper of unexecuted read members |
| 124 | `product/public_contract_publication.ts:459` `catalogSchemaRow` | 11 | reads the catalog schema row of the extant catalog (caller :474); build-time code | t287-wave2-owner-contract-source-set | TD-40 (moves to build) | tier 4: build-time publication path; TD-40 moves the module to the build |
| 125 | `abg/project_read_definition_bindings.ts:250` `closeReadEventResource` | 9 | legacy project.read projection behind the reopen-only binding: closes the reopened event resource of a read | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: helper of unexecuted read members |
| 126 | `abg/project_read_ports.ts:1456` `projectGraphCallEvidence` | 9 | legacy project.read projection behind the reopen-only binding: graph_call_evidence (dispatched at project_read_ports.ts:1801-1833) | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: unexecuted Public read member |
| 127 | `abg/project_read_ports.ts:726` `runIds` | 8 | legacy project.read projection behind the reopen-only binding: run identities of the prepared read | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: helper of unexecuted read members |
| 128 | `abg/project_read_ports.ts:1768` `projectRunLawfulActions` | 8 | legacy project.read projection behind the reopen-only binding: run_lawful_actions (dispatched at project_read_ports.ts:1801-1833) | one installed-CLI lane per member, as TD-40 asks | TD-40 (lane or withdraw) | tier 4: unexecuted Public read member |
| 129 | `product/public_contract_publication.ts:455` `pointerSegment` | 3 | JSON-pointer escape in the binding refusal paths (callers :648, :659); build-time code | t287-wave2-owner-contract-source-set | TD-40 (moves to build) | tier 4: build-time publication path; TD-40 moves the module to the build |
| 130 | `product/release_snapshot_definition_bindings.ts:36` `within` | 1 | one-line confinement predicate of the release snapshot owner | t287-w2-05-release-snapshot-definition-bindings | TD-28 (keep row) | tier 5: one-line helper |
| 131 | `product/release_snapshot_definition_bindings.ts:91` `isRecordEvidence` | 1 | one-line record predicate of the release owner | t287-w2-05-release-snapshot-definition-bindings | TD-28 (keep row) | tier 5: one-line helper |
| 132 | `validator/self_conformance_semantics.ts:26` `record` | 1 | record predicate inside the self_conformance_failure arm of the self-conformance semantics check | the self-conformance semantics lane (t287-qualification-scopes) | TD-29 (owning) | tier 5: one-line predicate |

## 9. D: dead and named by no entry

| Feature | Declaration | Lines | How it was checked |
| --- | --- | ---: | --- |
| Product declaration closure re-validation | `product/declaration_closure.ts:259` `validateResolvedExecutionDeclarationClosure` | 20 | git grep at 34aafb2c6: no caller in code/src, test_env, scripts or contracts; only recorded bootstrap JSON under .ai-workspace/comments/codex lists the export name. product-install "Closure re-validation" finds it dead (Delete, S, verified, with ST-B's barrel caveat); no register entry carries that finding (TD-44 cites product-install K-A, K-B, K-C only). Still on main. |
| GTL authoring constructors | `gtl/graph_applications.ts:231` `reenterApplication` | 17 | git grep -w at 34aafb2c6 over build_tenants: only the declaration and the barrel line; no caller in code/src, test_env (fixtures build re_enter applications as raw values: t287-s03-automatic-product/index.mjs:60, t287-selected-action-product/index.mjs:36), scripts or contracts. The re_enter relation itself is live (graph-span re-entry, G). TD-27 retires only the gate constructor. A package export is not the Product contract (TD-45), so no consumer is promised. Still on main. |

Total: 2 declarations, 37 lines. Both are exported through a package barrel (`./product`, `./gtl`); TD-45's ruling that a package barrel is not the Product contract applies. Both are still on `main`. Candidates examined and not classed D: `public/cli.ts:67` `transportRefusal` (called at module level, `:83`, `:94`, `:104`, `:113`, `:136`; L) and `implementation/worksite_command_helper.ts:717` `signalProcess` (called from the SIGTERM/SIGINT handler at `:728`; L).

## 10. X: method artifacts

| Declaration | Lines | Why |
| --- | ---: | --- |
| `abg/governed_context_client.ts:55` `invoked` | 1 | module-level guard evaluated at load; the client main it guards ran 4 times, so the const was evaluated |
| `abg/event_store.ts:2343` `currentRuntimeEventCount` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/instruction_assembly.ts:45` `exactOrNull` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/native_worksite_execution.ts:22` `same` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/open_call.ts:43` `exactOrUndefined` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/probabilistic_result.ts:41` `exactOrNull` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/retry.ts:160` `exactOrUndefined` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/runtime_liveness.ts:49` `exactOrNull` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/runtime_liveness.ts:81` `discardNativeFrameClock` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/semantic_job.ts:47` `exactOrNull` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/semantic_revision.ts:84` `jobEnvelope` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/traversal_cursor.ts:50` `exactOrNull` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/traversal_cursor.ts:52` `exactOrUndefined` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/traversal_route.ts:137` `exactOrNull` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/traversal_route.ts:139` `exactOrUndefined` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/witness_admission_operation.ts:35` `exactOrNull` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `abg/worksite_revision.ts:54` `exactOrNull` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `implementation/release_publication.ts:47` `plainAncestors` | 1 | one-line declaration whose function count is above 0; a never-entered inner range on the same line makes the line read as unexecuted |
| `product/release_snapshot_definition_bindings.ts:93` `commitReleaseArtifact` | 15 | t287-release-acceptance.test.mjs:111 calls it in a passing case (6 pass) through privateOwner, a source-modifying loader the method drops (also TD-28 (keep row)) |
| `product/release_snapshot_definition_bindings.ts:108` `tappedOwner` | 45 | t287-release-acceptance.test.mjs:137 calls it in a passing case through privateOwner (variant) (also TD-28 (keep row)) |
| `implementation/release_publication.ts:205` `projectReleaseAcceptance` | 9 | t287-release-acceptance.test.mjs:84, :132 call it in passing cases through privateOwner (variant) (also TD-28 (keep row); TD-49 (placement)) |
| `abg/retry.ts:5724` `completedRetryProgressPlanDigest` | 9 | t287-route-reconstruction "finite pure candidate plan" passes and calls it (:428, :468, :764) through ownedRetryPlanDigest, a vm.SourceTextModule copy the method counts as a skipped variant |
| `abg/project_read_definition_bindings.ts:402` `evidenceProjection` | 36 | t287-runtime-failure-diagnostic.test.mjs:122 (21 pass) reaches it through sourceOwner, a source-modifying loader the method drops (also TD-40 (owning: legacy read binding)) |

## 11. Never-entered regions inside executed functions

Rule: a position is never entered when the smallest V8 range containing it has count 0; regions are maximal runs inside a function whose own count is above 0; nested executed ranges are subtracted. Regions of 15 or more lines: 174, 4,743 lines (the census list, which counts nested executed ranges as unexecuted, gives 424 blocks and 17,081 lines). Line spans come from the sourcemap of each range boundary, so a region edge can be off by one line.

The 60 largest: L 41 regions, 1,751 lines; R 18 regions, 808 lines; G 1 regions, 30 lines. Shapes seen: refusal branches never taken, alternative arms (another kind or disposition), loops over collections that are always empty in the suite, catch blocks, and predicate tails whose earlier conjunct always decided the result.

| # | Region | Lines | Enclosing declaration (calls) | Class | Entry | What | Natural test home |
| ---: | --- | ---: | --- | --- | --- | --- | --- |
| 1 | `implementation/leaf_invocation_port.ts:1223-1326` | 104 | `constructAdmittedLeafInvocationPort` (inner `hasExactWorksiteLeafExecutionAuthority`) (95) | L |  | predicate tail of hasExactWorksiteLeafExecutionAuthority: the phase and authorization conjuncts after an earlier conjunct fails. leaf_invocation_port.js is also loaded with ?env= (support/root-installed-environment.mjs:348) and in 21 skipped variants, so a dropped instance may have run it (not established) | t287-post-binding-worksite-write |
| 2 | `abg/c_call.ts:2608-2711` | 104 | `projectOpenedLeafCCallCarrier` (1,373) | L | TD-25 (keeps the hold) | isInteractionCLeaf arm of projectOpenedLeafCCallCarrier: the opened F_H leaf carrier. TD-25's c_call.ts:2601 is the resume disjunct just above it, not this arm | an F_H hold lane |
| 3 | `abg/fh_continuation_projection.ts:914-1003` | 90 | `projectFhEffectfulPublicInvocationFacts` (638) | R | TD-25 | F_H effectful public invocation facts over continuation histories; inside TD-25's named :818-1128 |  |
| 4 | `abg/fh_continuation_projection.ts:1024-1106` | 83 | `projectFhEffectfulPublicInvocationFacts` (638) | R | TD-25 | same declaration, grant matching part; inside :818-1128 |  |
| 5 | `product/verify_product.ts:643-714` | 72 | `isNativeDeclarationEvidence` (398) | L |  | native declaration evidence: loop over pending selectors; no verified product carries them | t287-wave2-installed-product-verification |
| 6 | `abg/traversal_route.ts:4793-4859` | 67 | `admitRoute` (1,559) | L | TD-25 (keeps the hold) | hold route admission arm of admitRoute; the hold stays under TD-25 and this arm has no lane | t287-single-address-space-consolidation (F_H lanes) or a held-interaction lane |
| 7 | `abg/invocation_admission.ts:1397-1458` | 62 | `admitInvocationWithRequest` (193) | R | TD-30 | re-entry basis branch of admitInvocationWithRequest; TD-30 retires the re-entry basis |  |
| 8 | `product/result_assessment_operation.ts:565-626` | 62 | `assessResult` (9) | R | TD-28 | assessResult refusal: held store differs from predecessor (result.assess row) |  |
| 9 | `product/result_assessment_operation.ts:504-564` | 61 | `assessResult` (9) | R | TD-28 | assessResult refusal: invalid packet (result.assess row) |  |
| 10 | `product/worksite_operations.ts:790-849` | 60 | `replaceWorksiteFile` (inner `perform`) (656) | L |  | worksite file replace when the predecessor file is absent (create path) | t287-post-binding-worksite-write |
| 11 | `product/verify_product.ts:517-572` | 56 | `isNativeDeclarationEvidence` (398) | L |  | native declaration evidence: loop over physical relations | t287-wave2-installed-product-verification |
| 12 | `abg/retry_lifecycle.ts:104-155` | 52 | `hasExactCompletedRetryProgressBridge` (286) | L |  | completed retry progress bridge walk | t287-r6-retry-success-exit |
| 13 | `abg/retry.ts:4708-4759` | 52 | `planRetryRuntimeFailureTransition` (13) | L |  | retry runtime-failure transition, blocked disposition | t287-lifecycle-failure-carrier |
| 14 | `product/builtin_semantics.ts:122-173` | 52 | `admitInput` (6) | R | TD-28 | admitInput arms for C3 branch construction task and vector and later contracts (C3 row; likely) |  |
| 15 | `product/invocation.ts:1169-1216` | 48 | `constructInvocation` (183) | L |  | constructInvocation predicate tail on authority and capability grants | r5-invocation-admission |
| 16 | `hog/workflow_lifecycle.ts:592-638` | 47 | `completeOwnedWorkflowLocus` (336) | L |  | workflow child failure completion with child cause | t287-held-prefix |
| 17 | `abg/traversal_cursor.ts:838-883` | 46 | `admitTraversalFrameCursor` (inner `(anonymous)`) (647) | L |  | continued-cursor admission tail (cursor origin, frame entry) | t287-retry-run-prefix |
| 18 | `product/materialization_operations.ts:584-629` | 46 | `materializeConfiguration` (2) | L |  | materialization file collision refusal | t287-st2a-e-exact-prefix-workspace-environment |
| 19 | `product/builtin_semantics.ts:963-1006` | 44 | `resolveJudgmentRelation` (inner `evaluate`) (17) | R | TD-28 | semantic stage relation evaluation (Semantic row) |  |
| 20 | `hog/retry_lifecycle.ts:582-625` | 44 | `advanceOwnedRetryLifecycle` (4) | L |  | HoG retry lifecycle, blocked transition proposal | t287-r4-aba-retry |
| 21 | `hog/workflow_lifecycle.ts:446-488` | 43 | `beginOwnedWorkflowLocus` (334) | L |  | beginOwnedWorkflowLocus child-preparation refusal (calls admitChildPreparationRefusal) | t287-held-prefix |
| 22 | `abg/traversal_route.ts:2102-2143` | 42 | `rehydrateConstructionIntentForCursorAtPrefix` (692) | R | TD-26 | construction-intent rehydration tail; inside TD-26's named :952-3002 |  |
| 23 | `abg/execution_basis.ts:1878-1919` | 42 | `admitExecutionBasis` (172) | L |  | execution basis preparation-task binding and actor checks (refusal tail) | r7-graph-validation-basis |
| 24 | `abg/retry.ts:2656-2696` | 41 | `deriveDeclaredCRetryFrontier` (163) | L |  | declared C-retry frontier, stopped progress (boundary terminal) | t287-route-reconstruction |
| 25 | `product/environment.ts:596-634` | 39 | `isResolvedProductLock` (inner `(anonymous)`) (2,833) | L |  | product lock row predicate tail | t287-installed-dependency-lock |
| 26 | `abg/c_call.ts:3318-3355` | 38 | `planCCallRuntimeFailureClose` (13) | L |  | runtime-failure close planning for an admission-rejection source | t287-runtime-failure-diagnostic |
| 27 | `hog/workflow_lifecycle.ts:723-760` | 38 | `completeOwnedWorkflowLocus` (336) | L |  | workflow completion when the result disposition is retry | t287-held-prefix |
| 28 | `abg/traversal_route.ts:4860-4897` | 38 | `admitRoute` (1,559) | L |  | blocked route admission with fan-out evidence | t287-tv5-rooted-topology-partition |
| 29 | `abg/traversal_route.ts:4504-4541` | 38 | `admitRoute` (1,559) | R | TD-25 | resume route evidence arm of admitRoute (calls hasInteractionResumeRouteEvidence) |  |
| 30 | `abg/execution_basis.ts:1822-1858` | 37 | `admitExecutionBasis` (172) | L |  | execution basis executable-row comparison tail | r7-graph-validation-basis |
| 31 | `product/worksite_operations.ts:860-896` | 37 | `replaceWorksiteFile` (inner `perform`) (656) | L |  | file replace successor mismatch refusal | t287-post-binding-worksite-write |
| 32 | `validator/self_conformance_semantics.ts:70-105` | 36 | `qualificationResultRelation` (12) | L | TD-29 (owning) | qualification result relation of self-conformance semantics | qualification lane TD-29 keeps gated |
| 33 | `abg/traversal_cursor.ts:802-837` | 36 | `admitTraversalFrameCursor` (inner `(anonymous)`) (647) | L |  | cursor admission refusal: continued cursor without exact intent, source and input | t287-retry-run-prefix |
| 34 | `abg/retry.ts:1894-1929` | 36 | `projectExactInteractionResumeSuccessorAtPrefix` (inner `(anonymous)`) (578) | R | TD-25 | projectExactInteractionResumeSuccessorAtPrefix (TD-25 names retry.ts:1849) |  |
| 35 | `abg/c_call.ts:7024-7059` | 36 | `admitResult` (1,470) | L |  | store-mode write of c_call_result_admitted at the end of admitResult; every call returned earlier (likely the owned mode writes instead; not established) | t287-route-reconstruction |
| 36 | `product/worksite_command_execution.ts:2255-2289` | 35 | `isWorksiteExecutionObservation` (490) | L | TD-28 (C2 keep row) | execution observation predicate tail for the forward and revision kinds | t287-worksite-command-execution |
| 37 | `abg/fh_continuation_projection.ts:666-700` | 35 | `projectFhContinuations` (inner `(anonymous)`) (7) | R | TD-25 | resumed-row validation in projectFhContinuations; inside :575-701 |  |
| 38 | `product/materialization_definition_bindings.ts:392-425` | 34 | `materializeOwner` (inner `try`) (4) | L |  | materialization repeat-row check | t287-st2a-e-exact-prefix-workspace-environment |
| 39 | `abg/environment_admission.ts:1067-1100` | 34 | `admitArtifactFromOwner` (388) | L |  | artifact admission catch: prepared truth candidate throws | t291-m6-admission-refusal-surface |
| 40 | `abg/execution_basis.ts:1599-1631` | 33 | `admitExecutionBasis` (172) | L |  | execution basis for a worksite file replace request (C0) | t287-post-binding-worksite-write |
| 41 | `product/builtin_semantics.ts:336-367` | 32 | `validateInvocationBasis` (10) | L |  | invocation basis validation for native C2 tasks | t287-native-worksite-execution |
| 42 | `product/verification_definition_bindings.ts:133-164` | 32 | `admitResources` (3) | L |  | verification resource admission tail | t287-wave2-installed-product-verification |
| 43 | `abg/retry.ts:1815-1846` | 32 | `projectUniqueStructuralAdvanceLineage` (268) | L |  | structural advance lineage match tail | t287-route-reconstruction |
| 44 | `abg/retry_progress.ts:934-964` | 31 | `projectRetryProgressAt` (305) | L |  | retry progress predecessor match | t287-retry-run-prefix |
| 45 | `abg/calculus/axioms.ts:1325-1355` | 31 | `eventCalculusEffectRefs` (217,769) | R | TD-25 | Event Calculus effect refs for fh_interaction_resume_admitted; TD-25 Closure removes every reader of the kind |  |
| 46 | `abg/c_call_outcome.ts:1482-1512` | 31 | `admitOwnedCCallResult` (inner `(anonymous)`) (1,501) | L |  | owned C-call result: probabilistic payload rejection on a retry path | t287-f04a-probabilistic-result-candidate |
| 47 | `product/declaration_closure.ts:641-670` | 30 | `resolveDeclarationClosure` (618) | R | TD-28 | declaration closure: revision history dependency across the lifecycle (Semantic row) |  |
| 48 | `abg/execution_basis.ts:1702-1731` | 30 | `admitExecutionBasis` (172) | R | TD-28 | execution basis for a C3 branch construction task (C3 row) |  |
| 49 | `validator/validation.ts:1319-1348` | 30 | `validateProgramSubject` (645) | G |  | validator: re_enter application subject; reached by the gated S03 lane (ABI5_S03_EVIDENCE_ROOT), likely |  |
| 50 | `product/invocation.ts:1140-1169` | 30 | `constructInvocation` (183) | L |  | constructInvocation refusal for supervised root mode | r5-invocation-admission |
| 51 | `hog/workflow_lifecycle.ts:654-683` | 30 | `completeOwnedWorkflowLocus` (336) | R | TD-26 | workflow completion for an invoke_graph_function construction intent (One Surface; likely) |  |
| 52 | `hog/retry_lifecycle.ts:640-669` | 30 | `advanceOwnedRetryLifecycle` (4) | L |  | HoG retry lifecycle, blocked arm continuation | t287-r4-aba-retry |
| 53 | `gtl/materialize.ts:171-200` | 30 | `projectBatch` (106) | L |  | GTL materialize: c_edge batch projection | t287-gtl-graph-law |
| 54 | `abg/event_store.ts:3178-3206` | 29 | `assertRuntimeEventContract` (178,617) | R | TD-28 | event contract for defect_intake_admitted (witness acts row; intake is tested by reading only) |  |
| 55 | `abg/retry.ts:4681-4708` | 28 | `planRetryRuntimeFailureTransition` (13) | L |  | retry runtime-failure transition, blocked disposition head | t287-lifecycle-failure-carrier |
| 56 | `abg/execution_basis.ts:1972-1998` | 27 | `admitExecutionBasis` (172) | L |  | execution basis resolution body built from a legacy resolution candidate (legacyCandidate); whether TD-30's legacy family owns it is not established | r6-implementation-resolution |
| 57 | `product/environment_definition_bindings.ts:736-762` | 27 | `bind` (inner `try`) (2) | L |  | workspace bind: artifact owner refusal mapping | r3-workspace-binding |
| 58 | `abg/traversal_route.ts:4688-4714` | 27 | `admitRoute` (1,559) | R | TD-25 | interaction resume evidence arm of admitRoute |  |
| 59 | `abg/instruction_assembly.ts:336-361` | 26 | `evaluateRegisteredSelectionInstructionAssembly` (13) | R | TD-28 | registered selection instruction assembly (Native registered-selection row) |  |
| 60 | `abg/actor_process.ts:1510-1535` | 26 | `invokeActorProcessWithAssembly` (inner `onStdoutObserved`) (339) | L |  | actor process stdout without a window | m5-worker-transport |

The other 114 regions, by file (regions / lines):

`abg/retry.ts` 12 / 228; `owner_bindings/run_invocation.ts` 8 / 141; `abg/traversal_route.ts` 7 / 130; `abg/witness_admission_operation.ts` 4 / 82; `implementation/worksite_command_helper.ts` 4 / 82; `abg/execution_basis.ts` 4 / 80; `abg/fan_out_projection.ts` 4 / 79; `abg/c_call_outcome.ts` 4 / 79; `gtl/source_path.ts` 4 / 77; `implementation/worksite_file_replace.ts` 4 / 74; `product/run_invocation_operation.ts` 4 / 71; `abg/fh_continuation_projection.ts` 3 / 58; `abg/c_call.ts` 3 / 57; `abg/retry_progress.ts` 2 / 42; `hog/workflow_lifecycle.ts` 2 / 39; `product/project_read_definition_bindings.ts` 2 / 38; `abg/actor_process.ts` 2 / 37; `abg/project_read_ports.ts` 2 / 37; `gtl/graph_construction.ts` 2 / 35; `abg/invocation_admission.ts` 2 / 34; `implementation/consensus.ts` 2 / 34; `product/builtin_semantics.ts` 2 / 31; `product/install_definition_bindings.ts` 1 / 26; `abg/traversal_cursor.ts` 1 / 24; `product/environment_operation_contracts.ts` 1 / 24; `abg/stdo_environment.ts` 1 / 23; `abg/qualification_proof.ts` 1 / 23; `hog/recursion_lifecycle.ts` 1 / 23; `abg/event_store.ts` 1 / 23; `product/worksite_operations.ts` 1 / 22; `implementation/leaf_invocation_port.ts` 1 / 22; `abg/graph_application.ts` 1 / 21; `product/worksite_effect.ts` 1 / 20; `product/verification_definition_bindings.ts` 1 / 20; `product/workspace_definition_bindings.ts` 1 / 20; `abg/artifact_truth.ts` 1 / 19; `product/stdo_environment.ts` 1 / 18; `abg/runtime_liveness.ts` 1 / 18; `product/result_definition_bindings.ts` 1 / 18; `abg/witness_definition_bindings.ts` 1 / 18; `product/materialization_operations.ts` 1 / 18; `product/worksite_command_execution.ts` 1 / 17; `abg/event_prefix.ts` 1 / 17; `abg/continuation.ts` 1 / 17; `product/catalog_definition_bindings.ts` 1 / 17; `abg/construction_continuation.ts` 1 / 16; `product/declaration_exports.ts` 1 / 15; `product/verification_operation.ts` 1 / 15; `abg/runtime_failure.ts` 1 / 15; `abg/calculus/axioms.ts` 1 / 15; `product/invocation.ts` 1 / 15; `hog/ccall_lifecycle.ts` 1 / 15; `hog/retry_lifecycle.ts` 1 / 15.

## 12. The nine never-loaded modules

| Module | Lines | Class | Entry | Why it never loaded |
| --- | ---: | --- | --- | --- |
| `public/codex_cli.ts` | 77 | R | TD-28 row "abg.codex second CLI" (verdict Retire; Decision entry) | the abg.codex bin spawns ./cli.js; no test runs abg.codex |
| `public/gap_authority.ts` | 144 | R | TD-44 (Decision part: the two ./public types) | superseded start seam; no runtime caller and no test; public/index.ts re-exports two types only |
| `shared/index.ts` | 16 | R | TD-44 ("Delete the orphan shared barrel") | re-export barrel that nothing imports |
| `implementation/self_conformance.ts` | 36 | G | TD-29 (owning) | loaded only through the gated t287-qualification-producer-acquisition-reuse lane (ABI5_PRODUCER_HISTORY_FIXTURE); the runtime loads it by descriptor (gtl/self_conformance.ts:25) |
| `implementation/index.ts` | 122 | X |  | a re-export barrel imported only with a query string: t287-post-binding-worksite-write.test.mjs:24 (?t287-c0=, both cases pass) and support/root-installed-environment.mjs:351 (?env=, loaded by 60 test-side files); coverage-aggregate.mjs:34 drops URLs that do not end in .js |
| `gtl/contracts.ts` | 137 | X |  | type-only: no value declaration; TypeScript erases every import of it |
| `hog/traversal_contract.ts` | 145 | X |  | type-only |
| `implementation/contracts.ts` | 442 | X | TD-44 names ProbabilisticLeafImplementation (:218), a type | type-only |
| `abg/result_evidence_lineage_contracts.ts` | 51 | X |  | type-only |

## 13. TD-36's question

TD-36 asks whether any lane reaches the F_H hold's use of the admitted-binding check. At `34aafb2c6`, yes, by the counts: `admitFhInteractionOpen` (`abg/continuation.ts:1115`) ran 2 times, as did `admitOwnedFhInteractionHold` (`:1369`) and `hog/interaction_lifecycle.ts` `holdOwnedInteraction`. The open's only caller is the hold's transaction body (`:1440`), and the hold makes no call of its own to `hasAdmittedWorkspaceBinding`, so the open's two runs are the hold's use. Its refusal block (`:1198-1202`) and the construction-intent arm of its guard (`:1179-1195`) were never entered, and no zero range follows the guard, so both runs passed it: every operand of the `||` chain was evaluated and false, `!hasAdmittedWorkspaceBinding(productBasis.artifactTruth, productBasis.workspaceBinding)` at `:1152-1155` among them, so the binding was admitted both times. Which test reached it is not established: the aggregate keeps no test name, and no test file names the hold functions, so the reach is through HoG graph execution. The check at `34aafb2c6` predates TD-36's follow-up (`52afade26` is not an ancestor of `34aafb2c6`); a rerun on `main` would confirm the current check. The hold's route admission arm (`abg/traversal_route.ts:4793-4859`) and the F_H leaf carrier arm (`abg/c_call.ts:2608-2711`) were never entered (section 11, regions 6 and 2).

## 14. Spot checks

| # | Class | Declaration or subject | What was read and found |
| ---: | --- | --- | --- |
| 1 | L | `abg/graph_application.ts:680` `admitRecursiveApplicationChildPreparationRefusal` | Read the head and its one caller, `admitChildPreparationRefusal` (`:1203`). That dispatcher's callers ran: `hog/recursion_lifecycle.ts:450` `blockRecursion` (call at `:459`) and `hog/workflow_lifecycle.ts:289` `beginOwnedWorkflowLocus`, whose `prepared.kind !== "prepared_child_traversal"` arm (`:446-488`) was never entered. Live, untested. |
| 2 | L | `abg/c_call.ts:3961` `admitWorkflowChildPreparationRefusal` | One caller, `abg/graph_application.ts:1192`, inside the same dispatcher. Live, untested. |
| 3 | L | `abg/traversal_route.ts:5690` `admitBlockedRetryTraversalTransitionUsing` | Called from the wrappers `:5677` (complete, TD-45) and `:5684` (owned) at `:5680`, `:5687`; the owned wrapper's caller `hog/retry_lifecycle.ts:610` lies in the blocked arm (regions `:582-625`, `:640-669`), never entered. The complete wrapper is reached only by `t287-authenticated-owner-family` (`ABI5_OWNER_HISTORY`). |
| 4 | L | `public/cli.ts:67` `transportRefusal` | Read `:60-140`: five module-level calls for bad arguments, a request file without one line, invalid JSON, an invalid request and a transport failure. The graph has no caller because the calls are at module level. Not dead. |
| 5 | L | `implementation/worksite_command_helper.ts:717` `signalProcess` | Read `:717-731`: used only at `:728` inside the SIGTERM/SIGINT handler. Not dead. |
| 6 | L | `implementation/worksite_command_helper.ts:665` `reportObservation` | Caller `:803`. `t287-owned-process-lifetime` loads the helper through `SourceTextModule` (`:659`) and rebinds `reportObservation` (`:637`); every case that declares reports overrides it (`:742-745`, `:812`, `:844`). No lane runs the real report read. |
| 7 | L | `product/workspace_definition_bindings.ts:267` `open` | The whole `workspace.open` binding, registered at `:327`; count 0. Its helpers `openRefusalCode` and `fault` are also L. |
| 8 | L | `implementation/release_publication.ts:173` `readReleaseArtifactBytes` | Caller `product/project_read_ports.ts:786` ran; this function did not. No test calls it. |
| 9 | L | `abg/qualification_proof.ts` and `implementation/qualification.ts:82` `realizeQualificationRuling` | No source caller by grep; the realization is loaded by descriptor (`implementation/qualification.ts:25`, `gtl/self_conformance.ts:163`). Live under TD-29, which keeps the gate. |
| 10 | D | `product/declaration_closure.ts:259` `validateResolvedExecutionDeclarationClosure` | `git grep -w` at `34aafb2c6`: the declaration and `product/index.ts:350` only; recorded bootstrap JSON under `.ai-workspace/comments/codex` lists the name. product-install "Closure re-validation" calls it dead; no register entry carries it (TD-44 cites product-install K-A, K-B, K-C only). |
| 11 | D | `gtl/graph_applications.ts:231` `reenterApplication` | Read `:205-247`. `git grep -w` over `build_tenants`: the declaration and `gtl/index.ts:111` only. Fixtures build `re_enter` applications as raw values (`t287-s03-automatic-product/index.mjs:60`, `t287-selected-action-product/index.mjs:36`). TD-27 covers only `gateApplication`. |
| 12 | G | `abg/traversal_route.ts:994` `graphSpanReentryProjection` | Caller `:3958` inside `hasGraphSpanReentryRouteEvidence`, whose caller `admitRoute` (`:4630`) ran without the arm. Both S03 cases skip on `ABI5_S03_EVIDENCE_ROOT`; `t287-selected-action` skips on `ABI5_SELECTED_ACTION_EVIDENCE_ROOT`; `t287-rp2-correction-carriers` uses the fixture's declarations only (`:8`, `:16`). |
| 13 | G | `hog/traversal.ts:435` `deriveGraphSpanReentryCursor` | Called by `support/t287-s03-automatic.mjs:39`, which only the skipped S03 cases load; source caller `hog/route_proposal.ts:792`. |
| 14 | G | `abg/invocation_execution_truth.ts:73` `projectGovernanceCoveredSourceUse` | `abg/invocation_admission.ts:1504` calls it only when `input.sourceUseDeclarations` is defined; the governance lanes that supply it skip on `ABG_GOVERNANCE_COVERED_FIXTURE`. |
| 15 | G | `abg/calculus/axioms.ts:1752` `runtimeFluentMatchesPattern` | No source caller (re-exported at `abg/index.ts:192`, `abg/event_calculus.ts:64`, `abg/calculus/index.ts:16`); `t287-event-calculus-owner-continuation.test.mjs:192` skips on `ABI5_EC_OWNER_EVIDENCE`. |
| 16 | G | `owner_bindings/run_invocation.ts:1117` `isRunInvocationResourceAssertion` | Calls at `t287-d1-requirement-handoff.test.mjs:702` (gated) and `:1000`, inside the case at `:820` that returns at `:821` when `ABI5_D1_CONTINUE` is unset; the steel callers are gated. |
| 17 | G | `product/worksite_command_execution.ts:2472` `constructWorksiteCommandExecutionObservation` | No source caller; `d2-workflow-step.test.mjs:99`, all 8 cases skipped on `ABI5_EVIDENCE_ROOT`. |
| 18 | G | `validator/qualification_resources.ts:252` `normalizeQualificationScope` | Imported at `t287-qualification-carrier-resource.test.mjs:11`, used at `:27`, `:65`; the file's 7 cases skip on `ABI5_F11_CARRIER_FULL_FIXTURE`. |
| 19 | X | `abg/retry.ts:5724` `completedRetryProgressPlanDigest` | `t287-route-reconstruction` "finite pure candidate plan" passes and reaches it (`:428`, `:468`, `:764`) through `ownedRetryPlanDigest` (`:134`), a `SourceTextModule` copy. |
| 20 | X | `product/release_snapshot_definition_bindings.ts:93` `commitReleaseArtifact`, `:108` `tappedOwner`, `implementation/release_publication.ts:205` `projectReleaseAcceptance` | `t287-release-acceptance.test.mjs:80-137`, 6 passing cases, through `privateOwner`. |
| 21 | X | `abg/governed_context_client.ts:55` `invoked` | Module-level guard; the `main` it guards has count 4. |
| 22 | X | `abg/project_read_definition_bindings.ts:402` `evidenceProjection` | Read `:402-436` and `t287-runtime-failure-diagnostic.test.mjs`: the module is loaded through `sourceOwner` (`:24`) exposing the private function, which the test calls at `:122`, `:320`, `:347` and `:443`. |
| 23 | X | `implementation/index.ts` (module) | Imported only with `?t287-c0=` (`t287-post-binding-worksite-write.test.mjs:24`, both cases pass) and `?env=` (`support/root-installed-environment.mjs:351`). |
| 24 | X | 17 one-line declarations (`exactOrNull` and others) | Function count above 0 in `state.json` for each; the census reads them as unexecuted because of a zero inner range on the same line. |
| 25 | R | `abg/traversal_route.ts:3543` `hasInteractionResumeRouteEvidence` | Inside TD-25's named `:3543-3647`. Caller `admitRoute` ran; the resume arm `:4504-4541` never did. |
| 26 | R | `abg/continuation.ts:762` `projectFhInteractionSemanticBasis` | No caller. Not in TD-25's text; abg-calls Check 1 row 1 (`abg-calls.md:68`), which TD-25 cites through E1, lists it. |
| 27 | R | `abg/fh_continuation_projection.ts:289` `exactLifecycleEnvelope` | Uses at `:636`, `:669`, `:710`; partial cover (section 4.1). |
| 28 | R | `abg/construction_continuation.ts:1864` `pendingSelectedOccurrence` | Reads `construction_intent_selected` and requires `constructionComposition` (`:1864-1875`); the selected-action binding is `run_invocation.ts:2334`. TD-26 by Closure. `t287-selected-action-authority` reaches it in passing cases through `registerHooks` (also X). |
| 29 | R | `hog/route_proposal.ts:294` `proposeTerminalRoute` | Overloads at `:294`, `:303`, `:311`; no caller except the export at `hog/index.ts:37`. TD-45 names the route_proposal overload family. |
| 30 | R | `hog/interaction_lifecycle.ts:227` `holdInteraction` | Named in hog-shared-bindings `:86`, a TD-44 source; absent from TD-44's own list. |
| 31 | R | `abg/calculus/fold.ts:275` `foldStep` | `t287-calculus-fold` imports plainly and passing cases call it through `coldFold`, yet count 0 (section 3, item 3). |
| 32 | R | `product/semantics.ts:619`, `:632`, `:645` | No caller anywhere; product-install E2 "Consensus public-result roster", a TD-26 source. |
| 33 | Region | `abg/c_call.ts:2608-2711` | Read `:2596-2612`: TD-25's `c_call.ts:2601` is the resume disjunct of the cursor cause; the region is the `isInteractionCLeaf` arm, which belongs to the hold. Classed L, not R. |
| 34 | Region | `product/verify_product.ts:2145-2428` | A count-0 range holding executed nested ranges; source of method limit 8. |
| 35 | TD-36 | `abg/continuation.ts:1115` `admitFhInteractionOpen` | Count 2; zero ranges at `:1179-1195` and `:1198-1202` only (section 13). Its one caller is the hold's transaction body at `:1440`; the hold has no call of its own to `hasAdmittedWorkspaceBinding`. |

35 checks: L 9, D 2, G 7, X 6, R 8, regions and TD-36 3. Corrections made by the checks: `reenterApplication` moved from L to D; the TD-29 defaults moved from G to L except where a gated lane calls the declaration; region 2 moved from R to L, and region 56 lost an unchecked TD-30 attribution.

## 15. Proposed TD-46 text

#### TD-46 — Functions and branches that no test executes

Status Open. Source: the whole-suite coverage run at `34aafb2c6`, attributed in `work/T292_CONSOLIDATION_01/TD-46_ATTRIBUTION.md` (per-declaration table in `TD-46_ATTRIBUTION.json`).

- **Evidence:** 493 declarations ran no line (9,873 lines): the 460 the census reports and 33 overload implementations its line window hides. 315 (6,495 lines) retire under existing entries: TD-28 201 (2,998), TD-26 37 (1,059), TD-25 22 (1,669), TD-45 22 (255), TD-44 22 (227), TD-43 2 (11), and TD-31 9 (276), already deleted. 265 of them (5,792 lines) sit under Decision entries; TD-25's retire under either outcome, TD-26's and TD-28's only under the owner's ruling. 21 (569 lines) are reached only by gated lanes, among them graph-span re-entry (S03), governance covered source use and self-conformance. 132 (2,640 lines) are live with no lane; 45 of them belong to TD-28 keep rows, TD-29 or TD-40. The highest risk are failure and refusal admissions: the child-preparation refusals (`graph_application.ts:680`, 167 lines; `c_call.ts:3961`, 120), the blocked and completed retry transitions (`traversal_route.ts:5690`, 118; `:5569`, 83) and the HoG failure completions. 2 (37 lines) are dead and named by no entry: `product/declaration_closure.ts:259` and `gtl/graph_applications.ts:231`. 23 (132 lines) are method artifacts. Inside executed functions, 174 never-entered regions of 15 or more lines hold 4,743 lines. A lane reaches the F_H hold's admitted-binding check (`continuation.ts:1152`, reached only through the hold, twice), which answers TD-36.
  - Text checks for the owning entries: `exactLifecycleEnvelope` (`fh_continuation_projection.ts:289`) is only partly inside TD-25's ranges; `graphSpanReentryProjection` (`traversal_route.ts:994`) is inside TD-26's range but is graph-span re-entry and stays; `holdInteraction` is in TD-44's source, not its list.
- **Retire:** Nothing retires on this entry alone. The R declarations retire with their entries. The two D declarations go in TD-44's sweep. Each L declaration gets one lane at its natural test home, refusal and failure-admission paths first; an L declaration owned by TD-40 gets its lane or is withdrawn there. Each G declaration is recorded as its gated lane's subject in TD-60's catalogue.
- **Owner / frame:** The test owner of each module (ABG, HoG, the Product bindings, the C2 helper); TD-28, TD-29 and TD-40 for the L declarations they own. realization_refactor; requirement_reprice for a TD-40 withdrawal.
- **Closure:** A coverage rerun at the closing commit shows no L or D declaration; every G declaration is a named gated lane's subject; every R declaration is gone or its entry has ruled to keep it with a lane.
- **Boundary:** The run drops modules imported with a query string (22 test-side files, including the installed-root support module), counts source-modified copies (`privateOwner`, `sourceOwner`, `registerHooks`, `SourceTextModule`; about 76 files) as skipped variants, misses a silent-return gate (`t287-d1-requirement-handoff.test.mjs:821`), rebuilds the tree in two tests, and loses an unexplained `t287-calculus-fold` reach. The census block list counts nested executed ranges as unexecuted (424 blocks and 17,081 lines against 174 regions and 4,743 lines). Figures are for `34aafb2c6`; all 178 non-R declarations are still on `main`.

