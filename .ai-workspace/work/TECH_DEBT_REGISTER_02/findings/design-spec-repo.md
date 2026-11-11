# Findings: design, specification and repository (`design-spec-repo`)

Reviewer: independent read-only reviewer (Claude Opus 5.5) for the Executive.
Subject: `/Users/jim/src/apps/abiogenesis`, branch `main`, HEAD `002035b8a`
(2026-11-11). `T` means `build_tenants/abiogenesis/typescript`.

This file is commentary for the second edition of
`.ai-workspace/TECHNICAL_DEBT_REGISTER.md`. It is not specification or design.

## Method

- Every count comes from tracked content at HEAD (`git ls-tree -r -l HEAD`,
  `git show HEAD:<path>`, `git grep ... HEAD`, `git log`). The working tree was
  not used, because a concurrent `npm run build` in the main checkout deleted and
  regenerated tracked files under `T/contracts` and
  `T/product-toolchain-manifest.json` while this review ran. The tree was clean
  again at the end.
- No tests, builds, provider calls or network were run. No git command that
  changes state was run (`git status` ran with `GIT_OPTIONAL_LOCKS=0`).
- Under `.ai-workspace/comments` and `.ai-workspace/work`, only names, sizes,
  dates and the two records named in the text were read. The two records are
  the F11 native return and the RC12 plan README §14-15.
- "Inferred" marks a claim that was not read or run directly.
- Scripts and intermediate output are in the reviewer scratchpad
  (`/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/`).
  The design classifier is `classify_design.py`, with inputs from
  `design_signals.py` and `design_signals2.py`. The tree aggregation is
  `agg_tree.py`.

## Candidate entries

The entries are ordered by value. Each one names the owner and what it absorbs.

### E1. The standard system program is Consensus's: F07 is unproved and F08 retirement is blocked

- Category: failed or superseded feature
- Evidence:
  - The Product requires "the standard system program". The requirement appears
    in `specification/PRODUCT.md:1064` (System And One Surface), row `A5-F07`
    at `:1370`, and REQ-P-POLICY-023. Its only shipped realization is
    `program://abg/system/consensus-one-surface@5` in `T/code/src/gtl/consensus.ts`
    (5,267 lines, 183 KB). The figures come from the RC12 plan README §14-15 and
    `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/O1_TRACE.md:21-23`,
    and were confirmed with `git grep`.
  - No test starts that program. S03 is proved only on the consumer fixture
    `T/test_env/fixtures/t287-s03-automatic-product/index.mjs`, behind
    `ABI5_S03_EVIDENCE_ROOT` and `ABI5_S03_PHASE_B_RELEASE`. The S03 coverage
    claim in `T/contracts/qualification/coverage.json` names only
    `ABG5-S03/retained-human-boundary`. Sources: O1_TRACE:182-217, checked
    against the coverage asset at HEAD.
  - T-287 states it the same way at `:4143`: "One Surface code exists around
    Consensus; the general stage/evidence/repair composition remains unproved".
  - The owner ruled F08/S05 superseded by the Executive. The live Product still
    says "Existing Consensus code and exact evidence are preserved"
    (`PRODUCT.md:1232`, Release Boundaries table, Consensus row).
  - The retirement is prepared in main history and reverted:
    - `fb86974e3` removes code, contracts, scripts and tests: 81 files, -15,349
      lines. It is reverted by `b0327828e`.
    - `f4aad7d5e` removes Product, requirement and design text, including
      REQ-P-CONSENSUS and 6 dedicated design notes: 62 files, -5,489 lines. It
      is reverted by `10cb10e89`.
    - The branch tip `claude/rc12-consensus` `9c086294b` is in main.
  - `T/test_env/tests/m5-consensus-module.test.mjs:655` is the only test of the
    non-callable contract-ref law (`T/code/src/validator/validation.ts:667-669`)
    (O1_TRACE).
- Retire:
  1. One owner decision re-homes the standard system program onto the Executive
     (O1_TRACE route b). It amends the Product's Consensus row and System And
     One Surface section.
  2. Re-apply `fb86974e3` (code, contracts, scripts and tests) by reverting
     `b0327828e`. Re-apply only the Product and requirement part of
     `f4aad7d5e`. The six Consensus-dedicated design notes move unchanged to
     design history, the same way as E4, rather than being deleted.
  3. Move the non-callable contract-ref test to a generic validation test.
  4. Add one ungated test that starts the new system Program from the installed
     package.

  The decision absorbs `gtl/consensus.ts`, `gtl/consensus_schema.ts` (46 KB),
  `implementation/consensus.ts` (26 KB),
  `contracts/schemas/consensus.schema.json`, `m5-consensus-module`,
  `t287-consensus-ref-shape`, REQ-P-CONSENSUS (274 lines), the six
  Consensus-dedicated design notes, and the superseded
  `M03_M04_ONE_SURFACE_AUTHORITY_BEHAVIOR_DESIGN.md` (1,583 lines).
- Size: L. The prepared removal is about 15.3k code and test lines plus about
  5.5k specification and design lines.
- Risk: Public contract: the published program and its schema leave the
  catalog, the manifest and the package digest.
- Notes:
  - The specification edit also forces a qualification-mirror restage (E6).
  - `f4aad7d5e` cannot be re-applied as-is, because it deletes six admitted
    design notes.
- Change class: product_reprice, with a design_reframe for the re-homed system
  program.
- Confidence: verified for the code, tests, commits and Product text. Whether any
  recorded Run started the Consensus program is likely "none", because no test
  starts it. A search of recorded event logs for the program ref would settle
  it.

### E2. Self-conformance and qualification (F11, F15, then F16 and S07) have never completed a run

- Category: failed or superseded feature
- Evidence:
  - The only native F11 attempt ran from 2026-09-28 to 2026-10-01 and failed on
    provider DNS (`ENOTFOUND`). It produced no judgment, a `runtime_failed` Run,
    291.6 s, a driver RSS of 5.25 GB and a 67,784,040-byte canonical input.
    Source: `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/final-f11-native-assessment-execution-01/return.md`.
  - D5-c was accepted on 2026-10-29 and its dry mode ended undispatched. The plan
    was 408 slots, 520-952 USD, about 27 h sequential plus about 33 h of
    quadratic plan checks. Phase D stopped with Product findings P1-P6.
    Source: `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md:924`.
  - The ticket header (`:215`) reads
    `current_qualification: OPEN_fifteen_families_F11_sole_AF22_pre_RC_installed_RC_and_human_acceptance`.
    RC1-RC12 are local, unqualified cuts.
  - The tag `v5.0.0` (`5b793c65e`, 2026-10-30) is the version-line selector for
    `v5.0.0-rc.1`. Its message reads "development preview, not stable
    acceptance".
  - The rule catalog makes every markdown section of the authority corpus one
    paid judgment. `T/scripts/generate-qualification-rule-catalog.mjs:54,98-103`
    emits one rule per section, and every rule has
    `applicability: requires_admitted_judgment` and
    `diagnostic: semantic_assessment_required`. At HEAD,
    `T/contracts/qualification/rule-catalog.json` holds 2,116 rules:
    - requirement files: 1,643 (abg 692, gtl 504, product 388, mapping 59)
    - PRODUCT: 60
    - INTENT: 22
    - `stdo_abiogenesis.json` and the 8 mirrored STDO standards: 391
  - The section labels that generate the most rules are "Purpose" (77) and
    "Acceptance Criteria" (67).
- Retire: nothing is removed. The debt is that the feature has never run. The
  lever the owner controls is rule granularity: one judgment per heading over
  lineage-heavy requirement text (E3). Choices for the owner:
  - judge per requirement ID instead of per heading
  - exclude non-normative sections (lineage, "Purpose", reserved-5.1 text)
  - reprice the corpus first (E3)

  Each choice reduces the slots before D5 is redispatched.
- Size: L
- Risk: qualification mirrors: any change to rule granularity changes
  `law-basis.json`, `coverage.json` and the package digest, so earlier
  qualification preparation evidence does not transfer.
- Change class: requirement_reprice (REQ-P-SELF-CONFORMANCE and REQ-P-QUAL own
  rule granularity), or design_reframe if only the generator's sectioning
  changes.
- Confidence: verified for the never-completed state and the rule counts.
  Inferred: that a plan slot covers about 5 rules, since 2,116 / 408 is about
  5.2. The D5-c plan was not read. Reading the D5-c slot inventory would settle
  it.

### E3. The requirement set is not present tense and has no code traceability below the Product tier

- Category: design and specification
- Evidence:
  - The set has 84 files under `specification/requirements/`: abg 35, gtl 33,
    mapping 5, product 9, root 2.
  - Of these, 61 cite STDO `v2.5.0-rc.6` or `v2.5.1-rc.2` in their
    "Derives from" lines. The selected basis is `stdo://releases/v3.0.4/`
    (`stdo_abiogenesis.json`; T-287 header).
  - 23 files carry "accepted by T-283 F_H closure" in their status.
  - Identities embed a superseded version line (`REQ-R-ABG3-*`, `REQ-L-GTL3-*`,
    `REQ-M-GTL3-*`), and purpose lines say "ABG 3".
  - Lineage markers per file are high, for example REQUIREMENTS-ALGEBRA 51 and
    REQUIREMENT-PROOF-CARRY-THROUGH 41. These are counts of version, ticket and
    "Derives from" matches; see scratchpad `req_refs.txt`.
  - `git grep` finds no `REQ-R-`, `REQ-L-` or `REQ-M-` identifier anywhere in
    `T/code/src`. Code cites only REQ-P-PUBLIC-CONTRACTS, REQ-P-SELF-CONFORMANCE,
    REQ-P-POLICY and REQ-P-QUAL, in 10 source files. Under `T/test_env` they
    appear only in the following:
    - `qualification/classification.json` (2 IDs) and `inventory.json`
    - two recipe files
    - `proof/abi5-root-r10.events.jsonl`
    - `tests/t287-amendment-witness.test.mjs`
  - Three files are cited by no design note: REQ-L-GTL3-GRAPHFUNCTION-REFINEMENT,
    REQ-L-GTL3-TEMPORAL-PROPERTIES and `00-starter.md` (2026-04-04, 10 lines,
    cited by nothing).
  - REQ-R-ABG3-TUNER has the status "Deferred - planned ABIogenesis 5.1".
  - REQ-P-CONSENSUS has the status "Retained capability contract; dedicated
    F08/S05 qualification reserved for 5.1". Its owner is E1.
  - Design traceability exists but runs mostly through April-July notes that E4
    classifies as stale.
- Retire:
  1. Rewrite the live requirement text in present tense against the v3.0.4
     basis.
  2. Move "Derives from" lineage and T-283 acceptance history to design history
     or release notes.
  3. Retire `00-starter.md`.
  4. Decide, for each of GRAPHFUNCTION-REFINEMENT and TEMPORAL-PROPERTIES,
     whether it is selected 5.0 law.
  5. Treat renaming `ABG3` and `GTL3` as a separate owner decision. Rule refs
     hash the source path (generator `:99`), so a rename changes every rule
     identity.
- Size: L. About 1,600 requirement-sourced rules change their span digests.
  Lineage text alone is likely a few hundred lines (inferred from the marker
  counts).
- Risk: qualification mirrors: every edit needs a restage commit (E6) and
  changes the law basis, and a file rename also changes `ruleRef` identities.
- Change class: requirement_reprice
- Confidence: verified for the counts and the grep results. The size of the
  lineage text is likely; a per-file diff of a present-tense rewrite would
  settle it.

### E4. The design directory is mostly history: 39 to 48 of 327 notes are current

- Category: design and specification
- Evidence: the classification rule and results are in [Lead 1](#lead-1-design-notes).
  - Of 327 notes (102,692 lines): 48 current (36,729 lines), 17 superseded
    (17,333), 189 stale (34,079) and 73 record (14,551).
  - The milestone-named notes (`M0*`, 233 files) include 8 current. The
    ticket-named notes (`T28*`, 35 files) include 34 current.
  - `T/design/README.md` (583 lines, last changed 2026-10-27, cited by 16
    specification files) is a historical narrative. Its sections include
    "Pre-Baseline Boundary (Historical; No Current Grant)", "S1 v4" and
    "Supersession". It lists no current notes and predates RC1-RC12 and the
    Executive.
  - Stale notes describe the retired compiled-plan HoG. Examples:
    - `M03_C_RETRY_RUNTIME_BEHAVIOR_DESIGN.md` names `CompiledCRetryPlan`,
      `TraversalStartupBlock` and `TraversalUnit`, none of which exist in code.
    - `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md` was edited on 2026-11-11
      (RC12 foldback) on top of a body naming the missing
      `compileTypedRecursePlan` and `CompiledTypedRecurseBinding`.
  - 19 stale notes derive from the withdrawn Python tenant. 58 own their scope
    by the M01-M06 module decomposition in `build_tenants/common`.
- Retire:
  1. Move the 279 non-current notes to a design-history location, unchanged.
     This keeps them as admitted history.
  2. Rewrite `T/design/README.md` as a present-tense index of the current notes.
  3. Repair the notes that mix current and stale bodies (named in Lead 1).
  4. Update the 16 specification links to the README.
- Size: L. About 66k lines move. The README rewrite is about 600 lines.
- Risk: qualification mirrors: only the 16 specification link edits enter the
  mirrored corpus, since design notes are not in the rule catalog.
- Change class: design_reframe (design surface only; no realization change)
- Confidence: likely. The rule is mechanical and misplaces a few notes (listed
  under Lead 1). A reviewer reading the 48 current notes and the 20 largest
  stale ones would settle it.

### E5. Human response and resume are reserved to 5.1 but ship as a refusing Public operation and an untested commit path

- Category: failed or superseded feature
- Evidence:
  - The Product reserves "Native response admission and response-driven same-run
    resumption" to 5.1 (Release Boundaries, Human boundary row at
    `PRODUCT.md:1230`; A5-F06 at `:1369`).
  - `T/code/src/public/binding/owner_contract_source_set.ts:188-193` declares the
    row `definitionBindingExportName: "INTERACTION_DEFINITION_BINDINGS"` for
    the source module `product/interaction_operation_contracts.ts`. No such
    export exists anywhere: `git grep` at HEAD finds only that line. By the type
    law at `:279-288`, an absent leaf resolves to
    `installed_binding_unavailable`, and transport refuses it. So
    `abg.operation.interaction.respond` (CLI `interaction respond`, SDK
    `sdk.interaction.respond`) ships its contract
    `T/contracts/public-operations/interaction/respond/operation-contract.json`
    and always refuses.
  - The commit and prepare path in `T/code/src/abg/continuation.ts` is at census
    tier `package`. "Census tier" is the TD census label for where a function
    is reachable: from the runtime, from the package only, or from nowhere. The
    functions have 0-1 test files each:
    - `commitFhInteractionResponseAtExpectedPrefix` :1564 (75 lines)
    - `prepareFhInteractionResponse` :1469 (94)
    - `deriveFhResumeSuccessorInput` :1640
    - `deriveFhResumeSuccessorInputAtPrefix` :1658
    - `projectHeldInteractionCCallOutcomeAtPrefix` :318 (332)
    - `projectFhInteractionSemanticBasisAtPrefix` :778 (131)
  - `T/code/src/hog/interaction_lifecycle.ts:227` `holdInteraction` has census
    tier `none` and 0 test files.
  - Hold and open are 5.0 runtime-tier behavior and stay: `admitFhInteractionOpen`
    :1115, `admitOwnedFhInteractionHold` :1369, `fh_continuation_projection.ts`
    and `fh_resume_relation.ts`.
  - Same pattern: `yield_continuation` production is reserved to 5.1 (Release
    Boundaries, Same-edge yield row). One producer branch still exists at
    `T/code/src/abg/calculus/liveness.ts:795,798,807`, taken when
    `budget.continuationRef !== null`.
- Retire: in one decision, either drop the respond row, its contract and the
  package-tier commit and prepare path from 5.0, or keep them deliberately as a
  declared non-callable member with a test that asserts the refusal. The yield
  producer branch follows the same decision.
- Size: M. About 700 lines of continuation code plus one Public contract.
- Risk: Public contract: removing the respond operation changes the Public
  operation roster and `public-operation.schema.json`.
- Change class: design_reframe
- Confidence: verified for the missing export, the tiers and the Product text.
  Whether the refusal is intended 5.0 shape needs investigation; the owner of
  the Public roster decides.

### E6. Generated contracts, the manifest and the qualification-source mirror are tracked; every specification edit needs a restage commit

- Category: repository
- Evidence:
  - `T/contracts` holds 202 files (9.1 MB): schemas 66 files and 4.8 MB, with
    `public-operation.schema.json` at 2.88 MB and `self-conformance.schema.json`
    at 1.05 MB; qualification 99 files and 3.5 MB. It has 212 commits.
  - `T/product-toolchain-manifest.json` is 3,276,114 bytes and has 188 commits.
    Its `nativeTypedLocator` is about 2.98 MB, and it lists 5,325
    `productRelativeLocators` (2,715 under `node_modules/effect`).
  - `npm run build` runs `clean.mjs`, `tsc` and `generate-product-manifest.mjs`.
    `clean.mjs` deletes tracked `contracts/schemas/consensus.schema.json`,
    `contracts/schemas/operations`, `contracts/public-functions`,
    `contracts/public-operations`, `contracts/vocabularies` and the manifest.
    The working tree is therefore dirty during every build; this was observed
    live during this review.
  - `T/.gitignore:4` lists `product-toolchain-manifest.json`, yet the file is
    tracked.
  - The mirror `contracts/qualification/sources/` (95 files, 1.7 MB) holds
    `stdo_abiogenesis.json`, INTENT, PRODUCT, every requirement file and 8
    STDO 3.0.4 standards. It is written only by
    `generate-qualification-rule-catalog.mjs --stage-authorities`. Every build
    verifies it and derives `rule-catalog.json`, `law-basis.json`,
    `coverage.json` and `self-conformance.schema.json` from it.
  - All 87 mirrored repository sources are byte-equal to the live files at HEAD
    (verified by script).
  - 15 commits are restages, two of them on 2026-11-11, for example "Restage the
    PRODUCT mirror after the recoverable step failure sentence".
  - `t287-qualification-law.test.mjs:110-118` asserts live == staged only when
    two environment variables are set.
  - Runtime consumers:
    - `validator/qualification_catalogs.ts` reads the catalog against its asset
      digest.
    - `admitInstalledQualificationCatalogs` re-hashes all 5,325 payload locators
      once per install.
    - `validator/self_conformance.ts:238-242` checks span digests over the
      mirrored bytes.
  - Storage cost is small. All historical manifest blobs pack to 7.2 MB
    (398 MB raw). `contracts/` packs to 4.7 MB and the mirror to 1.2 MB.
- Retire:
  1. Stop tracking build outputs that every build regenerates: `contracts/` and
     the manifest. Keep them in the package `files` list. Record the built
     package and manifest digests in the release record instead.
  2. Resolve the `.gitignore` contradiction either way.
  3. For the mirror, the owner chooses between two routes:
     - Keep it, and add an ungated check that live == staged so drift fails in
       `npm test`.
     - Reference sources by digest only (`authority-inputs.json`) and read the
       bytes from the selected source root at qualification. The installed
       product then needs source-root access for self-conformance.

  The new-cut consequence of a specification edit stays in either route: the law
  basis is digest-bound to the specification bytes by design.
- Size: M for untracking. L for the mirror route, which needs a decision.
- Risk: manifest or digest pins: RC records pin the digests of built artifacts,
  not of the tracked copy, so untracking does not change them (inferred; the RC
  install-binding records were not read).
- Change class: realization_refactor for untracking; design_reframe for the
  mirror route.
- Confidence: verified for the tracking, the `.gitignore` contradiction,
  `clean.mjs`, mirror equality, the restage commits and the pack sizes. Likely:
  that no consumer reads the tracked copy without a build first. 46 test files
  name the manifest and were not traced one by one; tracing their reads would
  settle it.

### E7. Tracked evidence is 43 GiB, almost all run output and captured state (TD-19 L)

- Category: repository
- Evidence: see [Lead 6](#lead-6-what-the-repository-tracks).
  - HEAD tracks 130,481 paths and 46.56 GB (43.37 GiB). Of this,
    `.ai-workspace/comments` is 34.94 GB and `.ai-workspace/work` is 11.18 GB.
  - The `.git` pack is 9.86 GiB.
  - Inside `.ai-workspace`, authored `.md` text is 0.2%. Captured state and
    input JSON of 1 MB or more is 43.3%, and run output is 25.0%.
  - `.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT` (8.26 GB, 1,645
    paths) commits the whole working tree as 49 MiB tarball parts. This
    includes untracked runtime, sandbox and test-run files, across 42 commits
    from 2026-09-23 to 2026-10-21.
  - Every worktree materializes the full 43 GiB. Four worktrees exist under
    `/private/tmp` (inferred size; `du` was not run).
- Retire: nothing is deleted. A retention rule for the owner is proposed in
  Lead 6. It is forward-only: digest records stay in git, bytes of 1 MB or more
  go to a content-addressed store, and no working-tree archives or self-tree
  mirrors are committed. Whether existing files leave HEAD is a separate owner
  decision that this register does not propose.
- Size: L
- Risk: replay digests of recorded Runs: receipts address evidence by
  repository path, so moving bytes out of HEAD breaks resolution unless readers
  resolve by digest.
- Notes: history rewriting is excluded because it changes commit identities.
- Change class: realization_refactor (repository policy; no Product change)
- Confidence: verified for sizes and shares. Which receipts address evidence by
  path, and which by digest, needs investigation.

### E8. Withdrawn tenants and residue directories at the top level

- Category: structure
- Evidence: see [Lead 5](#lead-5-other-tenants-and-top-level-directories).
  - `build_tenants/TENANT_REGISTRY.md` (2026-07-12) lists an `abiogenesis/codex`
    tenant whose directory does not exist. It marks `python` "Withdrawn", while
    `build_tenants/abiogenesis/README.md` says "paused".
  - Root `pyproject.toml` (genesis 3.2.0, 2026-04-21) packages the withdrawn
    Python tenant.
  - `release_snapshots/abiogenesis-typescript-tenant/` holds 361 files (54 MB),
    about 108 cuts from 3.8.0-rc.2 to 4.6.0-rc.3, last changed 2026-07-11, with
    no 5.x cut. Nothing in code, tests, specification or bootstrap references
    it.
  - `docs/` holds 16 files (1.8 MB), last changed 2026-09-23, and nothing
    references it.
  - The following `.ai-workspace` directories are unreferenced and last changed
    between March and June: `features`, `modules`, `reviews`, `agents`,
    `sprints` and `release-notes`.
- Retire:
  1. Make the registry match reality: remove the ghost codex tenant and settle
     python as withdrawn or paused.
  2. Retire or move root `pyproject.toml` with the Python tenant.
  3. Mark `release_snapshots/`, `docs/old` and the six `.ai-workspace`
     directories as record, or move them under one history root.
  4. Retire `.claude-plugin` (2026-03-29: gen-start, gen-status, gen-gaps) if
     nothing loads it.
- Size: M
- Risk: none: the residue is unreferenced, except that the Python tenant is
  cited by 24 design notes and `T/test_env/qualification/classification.json`,
  so those links must follow a move.
- Change class: realization_refactor. If python moves from paused to withdrawn,
  that is a product_reprice of the tenant registry.
- Confidence: verified for references (`git grep` at HEAD). Whether anything
  outside the repository loads `.claude-plugin` or `pyproject.toml` needs
  investigation.

### E9. Milestone-named Public exports and test scripts

- Category: structure
- Evidence:
  - `T/package.json` exports `./gtl/m01`, `./gtl/m02`, `./abg/m03`,
    `./abg/m03/transport`, `./app/m04` and `./qualification/m05`. These are
    barrel files named by retired milestones; for example `app/m04.ts` reads
    "Existing Public family, SDK and operation-owner contract projections".
  - Scripts are named `test:m4`, `test:m5*` and `test:r1` to `test:r9`.
  - `npm test` runs only `test:unit` (4 files) and the UAT harness. 35 of 225
    test files appear in any npm script.
- Retire: rename the subpaths by owner with aliases for one cut, or keep them
  and record the names as stable Public identities. Name the test lanes by
  feature. The code-area reviewers own the barrel contents; this entry owns the
  naming only.
- Size: M
- Risk: Public contract: the subpath exports are Public package surface.
- Change class: design_reframe
- Confidence: verified for the names and script membership. Whether any
  downstream consumer imports the `m0x` subpaths needs investigation.

### E10. Branches and unpushed history

- Category: repository
- Evidence: see [Lead 7](#lead-7-branches).
  - There are 106 local branches.
  - 75 commits are reachable only from 25 local branch names (19 July `codex/*`
    and 6 `donor/*`), not from main, origin or any tag.
  - `main` is 429 commits ahead of `origin/main` (origin last 2026-10-22).
  - There are 9 stashes and 4 extra worktrees. The owner rule is never to push.
- Retire: the owner picks one rule:
  - Tag the 25 branch tips as `archive/*` tags, so the history survives branch
    pruning without a push.
  - Accept that those 75 commits are disposable.

  The 47 branches merged into main hold nothing unique and are names only.
- Size: S
- Risk: none
- Change class: realization_refactor
- Confidence: verified (`git rev-list` and `git merge-base`). The contents of the
  75 commits were not read.

## Lead 1: design notes

Classifier rule, applied in this order to each `T/design/**/*.md` at HEAD:

1. **superseded**: the note is one of the six Consensus-dedicated notes that
   `f4aad7d5e` deleted.
2. **superseded**: the first `**Status**`, `Status:`, `- status:` or status-row
   value in the first 40 lines matches
   `/supersed|invalidat|withdrawn|reject|revert|retired/i`.
3. **record**: the file name matches
   `(_REGISTER\.md$|CENSUS|AUDIT|POSTMORTEM|_REVIEW|LEDGER|TEMPLATE|_PLAN\b|PLAN\.md$|PROOF_PLAN|CALIBRATION|REJECTED_AS_BUILT|GAP_ANALYSIS|^ADR-|^README\.md$)`.
4. **superseded**: the first 20 lines carry
   `invalidated_for_5_0_implementation_by_upstream_intent_reprice` or
   `invalidated for current 5.0`, or a `**Current applicability**: ... non-operative`
   line. Notes that call only an embedded older ruling non-operative do not
   match.
5. **record**: the status matches
   `/^(completed|template|historical|candidate retrospective|retrospective|passed for first-slice)|closed by|closed with|closure review complete|calibration|planned abiogenesis 5\.1|candidate design; implementation held|pending independent s04/i`.
6. **current**: the note names 5 or more code identifiers and at least 60% of
   them exist in `T/code/src`. A code identifier is a backticked token of 8 or
   more characters that is camelCase, or lower snake_case with at least one
   underscore. The tokens are matched against 19,074 identifiers read from
   `T/code/src` at HEAD. Dangling path references only flag a current note.
7. **current**: the note names fewer than 5 identifiers, and its last content
   commit is on or after 2026-07-21, the T-283 5.0 Product-baseline merge.
   "Content commit" ignores sweep commits, defined as commits touching more
   than 15 notes. There are 16 sweeps, including the Consensus
   retire/revert pair `f4aad7d5e`/`10cb10e89`. That pair alone gives about 50
   notes a census `lastCommit` of 2026-11-11.
8. **stale**: everything else. The reason is recorded: low identifier
   survival, dangling references, Python-tenant derivation or M01-M06 module
   ownership.

Results:

| Class | Notes | Lines |
|---|---:|---:|
| current | 48 | 36,729 |
| superseded | 17 | 17,333 |
| stale | 189 | 34,079 |
| record | 73 | 14,551 |
| total | 327 | 102,692 |

Line counts are newline count plus one.

Cross-checks:

| Signal | Notes | current | superseded | stale | record |
|---|---:|---:|---:|---:|---:|
| Mentioned nowhere (census: source, tests, specification, other design, active tickets) | 82 | 2 | 1 | 62 | 17 |
| Not mentioned from source, tests, specification or active tickets | 301 | 24 | 17 | 189 | 71 |
| Last content before 2026-07-21 | 271 | 3 | 15 | 186 | 67 |
| Last commit in April 2026 | 103 | 1 | 0 | 59 | 43 |
| Dangling path references | 23 | 3 | 2 | 12 | 6 |
| Cites the Python tenant | 34 | 2 | 0 | 19 | 13 |
| Owns by the M01-M06 module decomposition | 86 | 1 | 3 | 58 | 24 |
| Name prefix `M0*` (233) | 233 | 8 | 16 | 159 | 50 |
| Name prefix `T28*` (35) | 35 | 34 | 0 | 0 | 1 |

Stale families by name: `*DERIVATION*` 63, `*IACS*` 51, `*FIRST_SLICE*` 46,
`*STRUCTURAL_CARRIER_DIAGRAM*` 44 and `*BEHAVIOR_DESIGN*` 15.

The 20 largest stale or superseded notes:

| Lines | Class | Last content | Identifiers found | Note |
|---:|---|---|---:|---|
| 3,817 | superseded | 2026-07-20 | 29% | `M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md` |
| 2,783 | superseded | 2026-11-02 | 50% | `M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md` (17 dangling refs to `code/src/abg/m03/...` and `app/m04/...`) |
| 1,792 | superseded | 2026-07-17 | 52% | `ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md` |
| 1,583 | superseded | 2026-07-20 | 33% | `M03_M04_ONE_SURFACE_AUTHORITY_BEHAVIOR_DESIGN.md` |
| 1,096 | stale | 2026-06-10 | 33% | `M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md` (9 dangling; Python) |
| 1,066 | superseded | 2026-07-18 | 54% | `M03_CONSENSUS_DOMAIN_FAMILY_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md` |
| 1,057 | stale | 2026-05-08 | 15% | `M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md` |
| 888 | stale | 2026-07-13 | 28% | `M01_M02_M03_NATIVE_NODE_INTERFACE_TYPE_WITNESS_BEHAVIOR_DESIGN.md` |
| 825 | superseded | 2026-07-27 | 31% | `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` |
| 792 | superseded | 2026-07-19 | 13% | `M03_COMPLETE_C_PROGRAM_INTERPRETER_BEHAVIOR_DESIGN.md` |
| 786 | superseded | 2026-07-14 | 12% | `M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md` |
| 764 | stale | 2026-07-13 | 6% | `M01_M02_M03_GRAPH_FUNCTION_COMBINATOR_APPLICATION_BEHAVIOR_DESIGN.md` |
| 744 | superseded | 2026-07-18 | 48% | `M03_M04_FH_RUNTIME_CONTINUATION_BEHAVIOR_DESIGN.md` |
| 741 | stale | 2026-11-11 | 55% | `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md` (mixed: RC12 edit over a compiled-plan body) |
| 716 | stale | 2026-07-14 | 7% | `M03_TYPED_HOF_BATCH_RUNTIME_BEHAVIOR_DESIGN.md` |
| 700 | stale | 2026-07-12 | 6% | `M01_M03_TYPED_HOF_VECTOR_RELATION_BEHAVIOR_DESIGN.md` |
| 678 | stale | 2026-07-14 | 25% | `M03_C_RETRY_RUNTIME_BEHAVIOR_DESIGN.md` |
| 637 | superseded | 2026-07-12 | 13% | `M01_M03_GRAPH_VECTOR_C_PROGRAM_SELECTION_BEHAVIOR_DESIGN.md` |
| 616 | superseded | 2026-07-14 | 8% | `M03_TRAVERSAL_RESULT_BIND_CONSERVATION_BEHAVIOR_DESIGN.md` |
| 614 | superseded | 2026-07-18 | 42% | `M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md` |

A present-tense directory keeps 48 notes (36,729 lines) by the rule. Three of
them are pre-baseline notes the rule misplaces:
`M03_M04_RUNTIME_FAILURE_TAXONOMY_DERIVATION`,
`M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION` and
`M03_ATTACHED_FP_WORKER_LOOP_DERIVATION` (313 lines). Six more are candidates
whose realization is held or proposed (8,738 lines):

- `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN`
- `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN`
- `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN`
- `T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN`
- `T287_F11_CARRIER_RESOURCE_DESIGN`
- `T287_D4_SELF_CONFORMANCE_DESIGN`

That leaves 39 accepted current notes (27,678 lines), plus a rewritten README
index.

Mixed notes edited in November that classify stale need repair rather than a
move: `M03_INSTRUCTION_ASSEMBLY_DERIVATION`,
`M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION` and
`M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN`.

`A5_COMPLETED_CODE_DESIGN_STAGE_REGISTER` carries a "non-operative" method
banner and is classified record by its name.

## Lead 2: feature and scenario states

States:

- **proved**: a local test exercises the shipped path. No feature is
  qualified.
- **proved in part**: a local test exercises part of the outcome. The rest is
  open or reserved 5.1, as cited in the row.
- **built, unproved on the shipped program**: code exists, but no test drives
  the shipped program or path end to end.
- **reserved 5.1**
- **superseded**
- **failed**: the intended run was attempted and did not complete.

"Gated" means the test skips unless named environment variables are set.

| ID | Realization path (`T/code/src/`) | Proving test (`T/test_env/tests/`) | State |
|---|---|---|---|
| A5-F01 | `product/install_product.ts`, `product/verify_product.ts` | `r1-packed-artifact` (in `test:r1`); `r2-clean-install` (artifact env) | proved for the installed lanes; exact-candidate coverage is D5 work (T-287:4140) |
| A5-F02 | `gtl/serialization.ts`, `validator/validation.ts` | `m5-c-algebra-validation` (in `npm test`); `a5-f02-canonical-gtl-identity` and `t287-malformed-gtl-gate` are in no npm script | proved in part; REQ-L-GTL3-CONTEXT and ASSET-SURFACE are open (T-287:4141) |
| A5-F03 | `hog/traversal.ts` | `r8-direct-hog-entry`, `t287-r4-aba-retry` | proved in part; the human-response portion is reserved 5.1 (T-287:4150) |
| A5-F04 | `abg/probabilistic_result.ts` | `t287-f04a-probabilistic-result-candidate` (no npm script) | proved |
| A5-F05 | `public/binding/public_function_family.ts`, `public/binding/owner_contract_source_set.ts` | `t287-required-operation-bindings` (no npm script) | proved, except that one declared member (respond) has no binding export (E5) |
| A5-F06 | `public/cli.ts` | `t287-public-groups` (package-root env) | proved in part; native response and resume are reserved 5.1 |
| A5-F07 | `gtl/consensus.ts` (`program://abg/system/consensus-one-surface@5`) | none starts it; `t287-s03-automatic` is fixture-only and gated; `m5-s03-authority` is structural | built, unproved on the shipped program (E1) |
| A5-F08 | `gtl/consensus.ts`, `implementation/consensus.ts` | `m5-consensus-module` (structural, 17 cases) | reserved 5.1 in the Product; owner ruled superseded by the Executive; retirement prepared and reverted (E1) |
| A5-F09 | `product/catalog.ts` | `r4-catalog-admission` (in `test:r4`) | proved |
| A5-F10 | `abg/event_store.ts`, `abg/calculus/fold.ts` | `m5-event-store-reopen` (in `test:m5:reopen`), `t287-calculus-fold`, `m5-event-calculus-runtime` (partly gated) | proved in part; human hold-to-resume and `yield_continuation` production are reserved 5.1 |
| A5-F11 | `validator/self_conformance.ts` | `t287-qualification-law` (gated; 3 skip sites) | failed: the only native run failed on ENOTFOUND (2026-10-01); D5-c was undispatched (2026-10-29) (E2) |
| A5-F12 | none (no tuner code; source "observer" hits are worker-transport output observers) | none | reserved 5.1; holdovers are `M05_S04_OBSERVER_TUNER_GLOBAL_TO_LOCAL_DESIGN.md` (1,533 lines, record), ADR-047 and REQ-R-ABG3-TUNER |
| A5-F13 | `public/cli.ts`, `public/codex_cli.ts` | `m5-installed-portability` (in `test:m5:portability`) | proved |
| A5-F14 | `product/install_product.ts` with the installed runtime | `installed-language-smoke` (in `test:installed:language`) | proved |
| A5-F15 | `validator/qualification.ts`, `validator/qualification_catalogs.ts` | `t287-qualification-law` (gated) | built, unproved: never run on an exact candidate; qualification is OPEN (T-287:215) |
| A5-F16 | `implementation/release_publication.ts`, `product/release_acceptance.ts` | `t287-release-acceptance` (`ABI5_F16_PROOF_ROOT`), `t287-release-publication` (gated) | built, unproved; `v5.0.0` is a selector to the unqualified rc.1 preview |
| A5-F17 | `product/default_library.ts` with the Public operations | `t287-amendment-witness` (gated, live) | built, unproved: "D1 outcome remains unproved" (T-287:4170) |
| ABG5-S01 | install, verify, catalog, traversal | `r1` to `r9` | proved for the installed lanes |
| ABG5-S02 | `gtl/serialization.ts`, `abg/probabilistic_result.ts` | `installed-language-smoke`, `m5-c-algebra-validation` | proved in part; the coverage claims name `ABG5-S02/failure-truth` and `operator-loop` |
| ABG5-S03 | One Surface over `gtl/consensus.ts` | `t287-s03-automatic` (fixture-only, gated) | built, unproved on the shipped program (E1) |
| ABG5-S04 | none | none | reserved 5.1 |
| ABG5-S05 | `gtl/consensus.ts` | `m5-consensus-module` | reserved 5.1; owner ruled superseded (E1) |
| ABG5-S06 | `public/codex_cli.ts`, Public operations | `m5-installed-portability`, `m5-s06-prime` | built, unproved: S06 is open (T-287:4166-4172) |
| ABG5-S07 | `implementation/release_publication.ts` | `t287-release-publication` (gated) | built, unproved: never run (E2) |

Known cases:

- **Consensus F08/S05**: superseded by owner ruling, not yet in the Product (E1).
- **One Surface F07**: no test starts the shipped standard system program (E1).
- **Human response and resume**: reserved 5.1, with the machinery shipped (E5).
- **Tuner and observer**: reserved 5.1, with no code.
- **Yield continuation**: production reserved 5.1, with one producer branch
  left (E5).
- **Self-conformance and qualification**: the intended run never completed (E2).

The coverage asset (`T/contracts/qualification/coverage.json`, 16 claims) names
no F07 One Surface behavior. Its S03 claim is limited to the retained human
boundary.

## Lead 3: requirement files

These results feed E3.

No reference from `T/code/src`: 80 of 84 files. Only REQ-P-PUBLIC-CONTRACTS,
REQ-P-SELF-CONFORMANCE, REQ-P-POLICY and REQ-P-QUAL are cited. No `REQ-R`,
`REQ-L` or `REQ-M` identifier appears in source at all.

No reference from `T/test_env`: all `REQ-R-ABG3-*`, `REQ-L-GTL3-*` (except
RECURSE) and `REQ-M-GTL3-*` files. The exceptions are the qualification
inventory files, a recorded proof event log and the amendment witness listed
in E3.

No reference from `T/design`: REQ-L-GTL3-GRAPHFUNCTION-REFINEMENT (66 lines),
REQ-L-GTL3-TEMPORAL-PROPERTIES (104) and `00-starter.md` (10).

Milestone or version lineage in live text:

- 61 files cite STDO 2.5.x in "Derives from".
- 23 files carry "accepted by T-283 F_H closure".
- All `ABG3` and `GTL3` identities and "ABG 3" purpose lines.
- REQ-R-ABG3-TUNER (status "planned ABIogenesis 5.1").
- REQ-P-CONSENSUS (retained capability, F08/S05 reserved).
- `specification/requirements/README.md` and the `abg`, `gtl` and `mapping`
  READMEs carry 12, 35, 34 and 4 lineage markers.

Per-file counts are in scratchpad `req_refs.txt`.

## Lead 4: tracked generated artifacts

This lead feeds E6.

| Artifact | Producer | Consumers | Cost | Effect of a digest reference |
|---|---|---|---|---|
| `T/contracts/**` (202 files, 9.1 MB) | `npm run build` (`clean.mjs` deletes, the generators rewrite) | package `files`; install verification; schema validation at runtime from the installed package | 212 commits; dirty tree during builds; 4.7 MB packed history | Untracked, it stays in the package. The release record keeps the package digest. Nothing else changes (likely) |
| `T/product-toolchain-manifest.json` (3.28 MB) | `generate-product-manifest.mjs` | `product/install_product.ts`, `verify_product.ts`, `qualification_catalogs.ts`, `self_conformance_basis.ts` and 46 tests, read from the built or installed package | 188 commits; 398 MB raw, 7.2 MB packed; contradicts `.gitignore:4` | Same as above. RC pins are on built artifacts (inferred) |
| `T/contracts/qualification/sources/**` (95 files, 1.7 MB) | `--stage-authorities` only, by explicit restage commits | rule-catalog spans; self-conformance span checks; product content digest | 15 restage commits; live and staged can drift (only gated tests compare them) | A digest-only reference removes the copies and the restage step. The installed product then needs source-root access for self-conformance. The new cut per specification edit remains by design |

## Lead 5: other tenants and top-level directories

This lead feeds E8. "References" counts tracked files at HEAD found with
`git grep`.

| Area | What it is | Last change | References | Status |
|---|---|---|---|---|
| `build_tenants/abiogenesis/python` (117 files) | Python tenant, genesis 3.2 era | 2026-09-23 (code 2026-08-25) | `specification/requirements/README.md:38`, 24 design notes, `T/test_env/qualification/classification.json`; root `pyproject.toml` | registry says withdrawn, README says paused; residue |
| `build_tenants/common` (14 files) | M01-M06 module yml and qualification docs | 2026-07-20 | 22 design notes, `classification.json` | record (feeds stale design) |
| `build_tenants/abiogenesis/design/ABG_3_UNIFORM_C_CALL_ENVELOPE_DESIGN.md` | cross-tenant ABG 3 design | 2026-07-06 | design notes only | record |
| `build_tenants/TENANT_REGISTRY.md` | tenant roster | 2026-07-12 | bootstrap | live but wrong (ghost `abiogenesis/codex`) |
| `docs/` (16 files, 1.8 MB) | RC notes for 3.9 and 4.6, user guide (2026-08-25), `docs/old`, PDFs | 2026-09-23 | none from specification, code, tests, tickets or bootstrap | residue |
| `release_snapshots/abiogenesis-typescript-tenant/` (361 files, 54 MB) | about 108 cut snapshots, 3.8.0-rc.2 to 4.6.0-rc.3 | 2026-07-11 | none; `release_publication.ts` writes to a grant-supplied root | record |
| `.ai-workspace/features` (7) | feature vectors | 2026-04-04 | none | residue |
| `.ai-workspace/modules` (9) | module notes | 2026-03-22 | none | residue |
| `.ai-workspace/reviews` (11) | March 2026 proxy log | 2026-03 | none | record |
| `.ai-workspace/agents` (5) | `fp_intent` and `fp_result` JSON | 2026-03-15 | none | residue |
| `.ai-workspace/context` (30) | axiomatic context and history preimages (includes a T-287 copy and Python-era commands) | 2026-09-23 | one design note | record |
| `.ai-workspace/sprints` (1), `release-notes` (1, 3.9.0-rc.12) | old planning and notes | 2026-05-01, 2026-06-06 | none | record |
| `.claude-plugin` | gen-start, gen-status, gen-gaps commands | 2026-03-29 | none found | residue (inferred: not loaded) |
| root `pyproject.toml` | genesis 3.2.0 package of the Python tenant | 2026-04-21 | none | residue |

## Lead 6: what the repository tracks

Totals:

- HEAD tracks 130,481 paths and 46.56 GB (43.37 GiB).
- Distinct blobs are 41.18 GB; byte-identical extra copies are 5.38 GB.
- The `.git` pack is 9.86 GiB.

By area:

| Area | Size | Paths |
|---|---:|---:|
| `.ai-workspace/comments` | 34.94 GB | 45,600 |
| `.ai-workspace/work` | 11.18 GB | 81,994 |
| `.ai-workspace/evidence` | 0.33 GB | 596 |
| `release_snapshots` | 57 MB | 361 |
| `T/test_env` | 13 MB | 433 |
| `T/contracts` | 9 MB | 202 |
| `T/code` | 8 MB | 292 |
| `T/design` | 6 MB | 327 |
| tickets | 5 MB | 330 |

By class inside `.ai-workspace` (shares of 43.3 GiB):

| Class | GiB | Share | Paths |
|---|---:|---:|---:|
| Copies of the repository's own trees (roots in `TREE_MIRROR_INVENTORY.json`) | 3.48 | 8.0% | 82,850 |
| Captured state or input JSON of 1 MB or more | 18.75 | 43.3% | 1,423 |
| Run output: event logs, bodies, streams, test reports | 10.81 | 25.0% | 6,598 |
| Archives: tarballs, split parts, gz | 7.30 | 16.9% | 508 |
| Node toolchain binaries | 0.16 | 0.4% | 4 |
| Authored `.md` text | 0.07 | 0.2% | 3,280 |
| Small JSON records under 1 MB | 0.95 | 2.2% | 26,721 |
| Code outside mirrors | 0.03 | 0.1% | — |
| Other | 1.73 | 4.0% | — |

By extension:

| Extension | Size | Files |
|---|---:|---:|
| `.json` | 22.9 GB | 37,350 |
| `.jsonl` | 11.1 GB | 958 |
| split `.partNNNN` | about 8.2 GB | 432 bases |
| no extension | 1.1 GB | — |
| `.ts` (mirrors) | 0.68 GB | 25,404 |
| `.md` | 0.44 GB | 25,701 |
| `.tgz` | 0.30 GB | — |

Path markers: preimages 0.51 GB (3,437 paths), `copied-tenant` 0.29 GB (5,861)
and `toolchain/bin` 0.17 GB.

Largest directories:

| Directory | Size | Paths |
|---|---:|---:|
| `comments/codex/20260928_FRAMED_GOVERNANCE` | 16.90 GB | 31,867 |
| `comments/codex/20260923_WIP_CHECKPOINT` (whole working tree as 49 MiB tarball parts) | 8.26 GB | 1,645 |
| `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME` | 6.83 GB | — |
| `work/T287_COMMON_LIBRARY_DELIVERY_01` | 5.33 GB | 40,076 |
| `work/T287_SANDBOX_UAT_RUN_02` | 4.60 GB | 28,696 |
| `comments/codex/20260926_CALCULUS_CROSSCUT` | 2.33 GB | — |

Most were last committed by `67c333799` (2026-10-21, "Checkpoint accepted STDO
3 library design and retained project work").

The 50 largest tracked files (MB; `.aw` = `.ai-workspace`; `FG` =
`.aw/comments/codex/20260928_FRAMED_GOVERNANCE`; `WRL` =
`.aw/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01`):

1. 109.0 `.aw/work/T287_RC5_LOCAL_EVIDENCE_01/campaign-evidence.tar.gz`
2. 107.0 `.aw/work/T287_RC5_LOCAL_EVIDENCE_01/runtime.events.jsonl.gz`
3. 101.9 `WRL/admission-boundary-refactor-01/step6-installed/preparation/readback-basis.json`
4. 99.5 `FG/s6-raw-contract-01/installed-live-05/events.jsonl`
5. 99.1 `FG/s6-producer-dependencies-01/installed-live-04/events.jsonl`
6. 93.6 `.aw/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/closed-evidence-portability-03/successor-02/original-metadata.json`
7. 90.2 `WRL/admission-boundary-refactor-01/step2-installed/readback-basis.json`
8. 86.1 `FG/final-qualification-inputs-05/negative-inputs/changed-node-body`
9. 86.1 `FG/qualification-command-preparation-01/negative-inputs/changed-node-body`
10. 86.1 `.aw/work/T287_G2_GTL_CORE_CANONICAL_SCALAR_CONTINUATION_01/toolchain/bin/node`
11. 86.1 `.aw/work/T287_G2_GTL_CORE_REALIZATION_01/toolchain/bin/node`
12. 86.1 `.aw/work/T287_SANDBOX_UAT_RUN_02/operator/crosscut-joint-build-64/consumed-preimages/host/opt/homebrew/Cellar/node/24.7.0/bin/node`
13. 82.2 `FG/final-f11-bound-assessment-01/assessment-input.json`
14. 82.2 `FG/final-f11-bound-assessment-01/preimages/render-03/assessment-input.json`
15. 82.2 `FG/final-qualification-inputs-04/readiness/copied-tenant/.fixtures/carrier/assessment-input.json`
16. 81.4 `FG/s6-context-projection-01/live-02/events.jsonl`
17. 81.4 `FG/f11-carrier-installed-setup-10/setup-state.json`
18. 81.4 `FG/f11-carrier-installed-setup-09/setup-state.json`
19. 81.2 `FG/f11-carrier-installed-setup-07/setup-state.json`
20. 81.2 `FG/f11-carrier-installed-setup-06/setup-state.json`
21. 81.2 `FG/f11-carrier-installed-setup-05/setup-state.json`
22. 80.8 `FG/final-f11-bound-assessment-01/preimages/render-03/task.json`
23. 80.8 `FG/final-f11-bound-assessment-01/task.json`
24. 79.7 `FG/s6-declared-source-projection-01/installed-live-03/events.jsonl`
25. 79.5 `FG/rc1-s02-continuation-02/fan-out-hello-conformance-owner-precondition.json`
26. 79.5 `FG/rc1-s02-continuation-02/hello-compose-conformance-owner-precondition.json`
27. 79.5 `FG/rc1-s02-continuation-02/hello-gate-conformance-owner-precondition.json`
28. 79.5 `FG/rc1-s02-continuation-02/bounded-recursion-conformance-owner-precondition.json`
29. 79.5 `FG/rc1-s02-substitution-01/conformance-owner-precondition.json`
30. 79.5 `FG/final-native-continuation-04/conformance-hello-world-owner-precondition.json`
31. 79.4 `FG/rc1-s02-continuation-02/hello-workflow-conformance-owner-precondition.json`
32. 78.9 `FG/final-native-continuation-04/conformance-command-execution-owner-precondition.json`
33. 78.6 `WRL/setup-overhead-repair-01/installed-preparation-02/readback-basis.json`
34. 76.6 `.aw/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/closed-evidence-portability-01/whitelist-02.json`
35. 74.1 `FG/rc1-s02-substitution-01/setup-state.json`
36. 73.5 `FG/final-f11-native-assessment-execution-01/final-native-prefix.jsonl`
37. 68.0 `.aw/work/T287_SANDBOX_UAT_RUN_02/operator/installed-current29-remaining-consumer-preparation-218/calls/continuation-start.request.jsonl`
38. 67.0 `WRL/bootstrap-preparation-03/readback-basis.json`
39. 66.3 `FG/s7-pending-consumer-01/selected-action-11/fresh-current/host-payload.json`
40. 66.3 `FG/s7-pending-consumer-01/selected-action-11/prior-current/host-payload.json`
41. 66.3 `FG/s7-pending-consumer-01/selected-action-11/covered-source/host-payload.json`
42. 66.3 `FG/s7-pending-consumer-01/selected-action-10/covered-source/host-payload.json`
43. 63.7 `.aw/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/closed-evidence-portability-02/successor-03/population.json`
44. 57.7 `FG/f11-carrier-installed-setup-09/setup-closed-environment.json`
45. 57.7 `FG/f11-carrier-installed-setup-10/setup-closed-environment.json`
46. 57.6 `FG/f11-carrier-installed-setup-07/setup-closed-environment.json`
47. 57.6 `FG/f11-carrier-installed-setup-05/setup-closed-environment.json`
48. 57.6 `FG/f11-carrier-installed-setup-06/setup-closed-environment.json`
49. 54.0 `FG/final-observed-c2-01/c2-owner-precondition.json`
50. 52.6 `FG/f11-carrier-installed-execution-11/actual-continuation-state.json`

The pattern: near-identical 57-82 MB captured-state files repeat per attempt.
Examples are `setup-state.json` ×5, `*-conformance-owner-precondition.json` ×8,
`host-payload.json` ×4, three copies of the node binary, and preimage copies of
the same `assessment-input.json`.

Proposed retention rule, for the owner to decide. It is forward-only. Nothing
is deleted and no history is rewritten.

1. Git tracks authored text, small records under 1 MB and, for every larger
   evidence file, a digest record: `{path, sha256, bytes, storeLocator}`.
2. Evidence of 1 MB or more goes to a content-addressed store outside git,
   keyed by sha256. Receipts reference it by digest. Readers resolve the digest
   and fall back to the tracked path for existing Runs.
3. No working-tree checkpoint archives (the `WIP_CHECKPOINT` pattern) are
   committed. A checkpoint is a commit or a branch.
4. No copies of the repository's own trees when the source is a commit. Record
   the commit and the path instead. `lint:evidence` already refuses new mirror
   roots (TD-19 S).
5. Toolchain binaries are recorded by version and digest, not by bytes.

Effect: growth stops. History keeps the 9.86 GiB pack. Checkouts and worktrees
still materialize 43 GiB until the owner separately decides whether existing
large files leave HEAD. A sparse checkout of `.ai-workspace/comments` and
`.ai-workspace/work` for worktrees avoids that cost without any repository
change (inferred).

## Lead 7: branches

| Group | Count | Dates | Merged into main | On origin | Note |
|---|---:|---|---|---|---|
| `main` | 1 | — | — | origin/main is 429 commits behind | origin/main last 2026-10-22; owner rule is never to push |
| `release/*` | 4 | Mar-Apr | yes | — | names only |
| `rc/*` | 9 | Apr-Jul | yes | — | names only |
| support, feat | 2 | — | yes | — | names only |
| `codex/*` (merged) | 19 | Jul to Nov 10 | yes | — | names only; includes rc10/rc11 worktree branches |
| `claude/rc12-*`, rc13 | 14 | Nov 11 | yes | no | names only; `claude/rc12-consensus` `9c086294b` is in main |
| `archive/*` | 26 | Jul 18 to Aug 23 | no | yes | history kept on origin |
| checkpoint | 1 | — | no | yes | history kept on origin |
| `patch/1.0` | 1 | — | no | yes | history kept on origin |
| `codex/*` (unmerged) | 23 | Jul 13-26 | no | 19 not on origin | 19 hold commits that only the local name keeps alive |
| `donor/*` | 6 | Jul 30 to Aug 1 | no | no | all hold commits only the local name keeps alive |

The 75 commits held only by local names are spread over 25 branches:

- `codex/t266-stage-pre-rebase` 4
- `codex/t280-impl` 1
- `codex/m03-m04-boundary-guard` 2
- `codex/t281-phase-a-impl` 3
- `codex/t270-neutral-contracts` 4
- `codex/t280-resume` 4
- `codex/p1-m04-owner-contracts` 6
- `codex/t281-p1-design-repair2` 8
- `codex/p1-m03-m05-owner-contracts` 9
- `codex/t267-family-compiler` 1
- `codex/t270-atom-design` 1
- `codex/t270-current-observation` 1
- `codex/t270-cursor-conservation` 1
- `codex/t270-schema-capability-impl` 1
- `codex/t274b-private-definition-design` 1
- `codex/t275-constructability-repair` 2
- `codex/t272-design-repair` 5
- `codex/t270-design-repair` 7
- `codex/t252-body-schema` 8
- all 6 `donor/*` branches

There are 9 stashes, which also keep commits alive, and 4 worktrees under
`/private/tmp` (rc10-retention, rc11-foundation, rc11-qualification,
rc12-consensus/integration).

## Surprises

- The concurrent `npm run build` in the main checkout deleted tracked generated
  files while it ran (E6). Any reviewer or Writer reading the working tree
  mid-build sees `D` entries for `T/contracts/**` and the manifest.
- `INTERACTION_DEFINITION_BINDINGS` is named by a Public row and exported
  nowhere. The respond operation ships and always refuses (E5).
- `20260923_WIP_CHECKPOINT` commits the whole working tree, untracked runtime
  files included, as 8.26 GB of tarball parts (E7).
- F11 self-conformance has never produced a judgment. Its only native attempt
  failed on DNS, and the rule catalog asks for 2,116 judgments (E2).
- The tag `v5.0.0` exists and points at the unqualified rc.1 preview, by the
  Product's selector design (E2).

## Coverage

| Lead | Covered | How | Not covered |
|---|---|---|---|
| 1 Design notes | all 327 notes classified; counts, lines, cross-tabs, top 20, present-tense count | `git show` of every note; census `design.json`; identifier survival against 19,074 source identifiers; sweep-aware last-content dates; status and banner regexes | semantic review of note bodies; misplacements are named where found, but not every note was read |
| 2 Features | all 15 selected families, F08 and F12, and S01-S07, each with one path, one test and a state | PRODUCT `:1362-1380` and `:1404-1548`; GOALS `:1297-1348`; T-287 `:215`, `:924` and `:4132-4150`; O1_TRACE; test existence, npm-script membership and env gates via `git show` | test bodies were not read beyond gates; no test was run; "proved" means a local test exercises the path |
| 3 Requirements | all 84 files: references from code, tests and design; lineage markers | `git grep` at HEAD for file names and ID prefixes; per-file lineage regex | the semantic currency of each requirement |
| 4 Generated artifacts | contracts, manifest, qualification mirror: producers, consumers, history cost, digest effect | generator and clean scripts read; mirror byte-equality by script; `git log --raw` blob sizes; `git grep` for consumers | per-test tracing of 46 manifest readers; RC install-binding records |
| 5 Other areas | python, common, docs, release_snapshots, six `.ai-workspace` directories, `.claude-plugin`, root `pyproject.toml`, tenant registry | `git log -1` dates; `git grep` for references | external loaders such as plugin hosts and pip |
| 6 Tracked tree | 130,481 paths by area, class and extension; 50 largest; shares; pack size; retention proposal | `git ls-tree -r -l HEAD` with `agg_tree.py`; `TREE_MIRROR_INVENTORY.json` roots; `git count-objects` | file contents; which receipts address evidence by path or by digest; worktree disk use (`du` not run) |
| 7 Branches | 106 local branches grouped; unique-history set; unpushed count; stashes; worktrees | `git for-each-ref`, `git rev-list`, `git merge-base`, `git worktree list` | contents of the 75 unique commits |
