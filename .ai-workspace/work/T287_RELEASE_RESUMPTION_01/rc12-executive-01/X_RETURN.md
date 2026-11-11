# RC12 package X Return: Part 1 and the review addition committed; the cut stopped at the stamp

Writer Return, commentary.

- **Location.** Worktree `/private/tmp/abg-rc12-consensus-20261111`, branch `claude/rc12-integration`, base `82ad6639b`. T = `build_tenants/abiogenesis/typescript`.
- **Head.** `eb87782fa` is the head this Return records; this Return commit sits on top of it.
- **No cut exists.** Nothing is a candidate.
- **Effects not taken.** Nothing was written under `~/Library/Application Support/ABIogenesis/`. There was no tag, push, provider call or network use. The main checkout and other worktrees were not touched.

## Verdict: stopped at K_RETURN D6 step 3 (stamp dry-run refused)

- Part 1 and the review addition are committed. Every named test is green; the only skip is the gated live witness case.
- The stamp's dry-run fails its own check on untracked, gitignored test outputs that were already present (below). Per C3 and K's failure rules I stopped.
- The following were not reached: stamp commit, release-claim rewrite, basis refresh, cut, install, smoke, r1, r2.
- Part 3 is written and was not run.

## Part 1 commits

| Item | Commit | Evidence |
|---|---|---|
| P1 | `857ae88a8` RETRY-008 `no_output` clause; M03 line 73 | Text now matches `classifyWorkerTransportFailure` (`transport_contracts.ts:112-134`): `no_output` only after a normal, untimed end with empty final output |
| P2 | `330651a88` `projectEndedChildFrames` in `replay.ts` is the one owner; quiescence and read ports consume it | Before = after: readable-stops 5/5, -foldback 4/4, recursive-failure-foldback 8/8, m5-terminal-quiescence-owner 7/7, runtime-activity-quiescence 1/1 |
| P3 | `8d28bf21d` handled-then-undeclared case in readable-stops-foldback | 5/5. **Not discriminating**: with the `1bd2658bf` positional descent restored (uncommitted) the file also passes 5/5 (deviation 1) |
| P4 | `0cfad33c7` `lifted_foldback`: "the record does not single out one admitted child foldback it was lifted from" | Enum unchanged |
| P5 | `5dec55845` optional `notApplicableReason` (non-required reviews only); intake refuses a missing or blank reason through `process_review_undeclared`; the view shows it; PRODUCT sentence as given | prerequisites 7/7 (new case: bare and blank refusals, required-with-reason and empty schema throws, view); amendment-witness 13/12/0/1; head pins unchanged |
| P7 | `ead445d32` mirrors restaged with `generate-qualification-rule-catalog.mjs --stage-authorities ../../.. <STDO v3.0.4>` | Five mirrors equal the live files; self-conformance schema unchanged; inventory, tenant manifest and recipe untouched |
| P6 | `42ceb03df` 27 regenerated files (26 under `contracts/`, manifest); package-files branch (hidden lockfile rejected, 20 violations) | K D4 confirms; second build clean |
| P8 | `c174b2b44` ten rows (C, K, R, B2a continuation, B2b, H, RR, P, B2b continuation, CB) and "Authority-level text changed, awaiting owner ratification" (11 rows) | From each Return's header and evidence; `git diff 62fd17271 -- specification` |

## Addition from the last review

- **R3, `d48f24ae4`.** The failed-attempts meaning sentence now reads: "the graph its selection chose or, when the selection was refused as not permitted, the graph it named (null when it named none)".
- **R2, `a31694421`.**
  - The design states the installed outcomes as ruled:
    - malformed or non-JSON → `selector_process_ended` with the contract failure class;
    - closed-lane tool call → no completion; blocked stop with an evidence contract mismatch;
    - `response_refused` = the strict binder refusing a well-formed response.
  - The two stub assertions are replaced by one. It asserts the delivered reading: `{disposition:'failure', failureClass:'contract_failure'}` gives `selector_process_ended` with `contract_failure`.
  - The tool-call stub is removed, because the transport delivers no completion for it. No test in this repository runs either installed outcome; they rest on the reviewer's run.
- **R1, `fc082ac0d`.** Class reference added: `diagnostic://abiogenesis/worksite/native-work/no_output@5`.
  - **Source of the reference.** I read it from the failure Result of the new case's Run, built before the class was declared. That Run stopped after `fail:construction`, with failures `[["no_output","diagnostic://abiogenesis/worksite/native-work/no_output@5"]]`.
  - **Where the list lives.** It is defined as `GOVERNANCE_RECOVERABLE_FAILURE_CLASSES` in `T/code/src/product/default_library.ts`, which `gtl/default_library.ts` reads. I edited that definition.
  - **Specification and design.** The PRODUCT sentence is replaced as given. The design's stop sentence agrees, and it lists the four classes.
  - **Tests.**
    - The stand-in worker gains an `empty` mode.
    - New case: the Run completes; the next selection is `select:construction` with the `no_output` row; the last task carries it.
    - Pins moved: the default-list unit case; prerequisites `graphs` and `library` head pins; reviews `gtl3`; foldback `foldbackRef`, `applicationRef`, executive digest and serialized digest.
- **Follow-up commits.**
  - `60c76259d` restages the PRODUCT mirror.
  - `eb87782fa` commits the regenerated capability graph and manifest. A second build leaves the tree clean.

## Evidence

- **Build and lints.** `npm run build` exits 0 at `eb87782fa`, and a second build leaves the tree clean.
  - `lint:imports`: "3 forbidden owner pair(s) hold".
  - `lint:lifecycle`: "291 modules under code/src; 7 allow-listed site(s), no offender".
  - `lint:calculus`: "6 modules … no offender".
  - Recipe lint: `"passed":true` (72 files).
  - `lint:evidence`: exactly the five known offenders.
- **Test command.** Each file alone: `TMPDIR=/private/tmp/abg-x-tmp node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/<f>.test.mjs` (tests/pass/fail/skip).
- **After Part 1 (`c174b2b44`).** All green:
  - m5-terminal-quiescence-owner 7/7/0/0; t287-runtime-activity-quiescence 1/1/0/0; m5-consensus-module 17/17/0/0; t287-liveness-heartbeat 6/6/0/0;
  - prerequisites 7/7/0/0; readable-stops-foldback 5/5/0/0; recoverable-failure 4/4/0/0; reviews 10/10/0/0; readable-stops 5/5/0/0.
  - I stopped the batch before recursive-failure-foldback and amendment-witness to apply the addition. They ran once, after it.
- **After the addition (`eb87782fa`).** prerequisites 7/7/0/0; recoverable-failure 5/5/0/0; reviews 10/10/0/0; recursive-failure-foldback 8/8/0/0; amendment-witness 13/12/0/1 (live case gated); readable-stops 5/5/0/0 and readable-stops-foldback 5/5/0/0, rerun because their consumer inherits the default list. Logs: `…/scratchpad/x/after-addition*/`.
- **Concurrent load.** A full-suite process from another worktree (`abg-rc12-foldback`) ran during these runs.

## Part 2: stopped at the stamp

- **Preconditions held.**
  - `$R` and `$AS/installs/5.0.0-rc.12` are absent.
  - node v24.7.0, npm 11.5.1, 80 GiB free.
  - Packlist branch is package-files (C1).
  - Step 2 lints are green, as above.
- **Step 3 command.** `node $C/stamp-rc12.mjs --dry-run --root $W --scratch /private/tmp/abg-rc12-cut-01/stamp`, run at `c174b2b44` and again at `eb87782fa`.
- **Refusal.** `AssertionError: tenant files outside the census still state 5.0.0-rc.11` at `stamp-rc12.mjs:62`. 93 paths:
  - 3 under `T/test_env/test_runs/rp2/behavior-carriers/`;
  - 90 under `T/test_env/test_runs/sandbox-uat-units/maintained-setup/` (two runs, 01:06Z and 01:48Z).
  - Paths: `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/x/stamp-unexpected.txt`.
- **The 93 paths predate X.**
  - They are untracked and ignored by repo `.gitignore:38` (`build_tenants/*/*/test_env/test_runs/`), so `git archive` never reaches them.
  - Directory mtimes are 12:06–14:39 local; X's base commit is 17:50.
  - The script's comment says ignored outputs are skipped, but its `ignored` list (`stamp-rc12.mjs:57`) omits `test_env/test_runs`.
- **Nothing written.** The throw precedes the report: `$S/stamp` is absent, and nothing was written elsewhere.
- **C2, release claim.** `T/release-claim.md` still states rc.7. Its rewrite belongs to the stamp commit, which was not reached.
- **C2, candidate basis.**
  - `T/scripts/refresh-candidate-basis.mjs` is the designed refresher. It runs `npm pack --ignore-scripts` into gitignored `T/artifacts`, then writes `test_env/fixtures/abi5-root-candidate-basis.json` from the manifest and the archive digest.
  - It belongs after the stamped build, in the stamp commit. It was not run, and the basis still names rc.4.
- **Not reached.** Cut commit and tree; archive digest, size and members; install path, count and equality; smoke; r1/r2.

## Part 3 (written, not run)

- **`demo/provider.json`.**
  - Executable `…/versions/2.1.322` (newest), sha256 `a9d23794…eb180a3450`.
  - `appendArgs` `--model claude-opus-5-5 --effort high`, both verified with `--help`. Neither flag is protocol-owned.
- **`demo/RUN.md`.**
  - The live command from T: frozen route (`ABI5_WAVE1_FROZEN_*`), FP limits 300000 and 1800000, evidence root `qualification-scratch/rc12-executive-01/demo/live-01`, TMPDIR `/private/tmp/abg-demo-tmp`, `--test-name-pattern '^live:'`.
  - By default the harness packs T. That pack's digest is not established equal to the cut, and the cut does not exist yet. The frozen route executes exactly the cut archive and asserts its digest.
  - The bare-CLI command, with `--permission-mode bypassPermissions` for parity.

## Deviations

1. **P3.** The requested discriminating case cannot be built with the recursion fixture. Re-evaluation opens a new C-call, so positional equals causal on these shapes (RV5 RR-2 agrees). The case is a regression guard. Revert log: `…/scratchpad/x/p3-positional/`.
2. **P4.** "More than one … is cited" is not true of every branch that yields `lifted_foldback`, so the wording covers all of them.
3. **Order.** P5, P7, P6, P8, because the staging generator imports `build/`. The post-Part-1 batch was cut short for the addition (above).
4. **R1** edits the list where it is defined (`product/`, not `gtl/`). **R2** has one replacement assertion; the tool-call stub was removed. One pin comment in prerequisites was updated to say why `graphs` and `library` moved.

## Residual risks

- `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md` D11 still says a closed Run's `run_status` lists the ended probe in `activeFluents`. That has been false since RR F7. The file is outside P2's grant, so I did not change it.
- The causal guard is untested on retry and fan-out shapes.
- The installed outcomes stated in R2 are unproven by any test here.
- The full suite was not run. The writer and the reviewers are the same model family.

## Decisions for the Executive

1. **Stamp refusal.** Choose one, then rerun from D6 step 3:
   - (a) move the two ignored `test_env/test_runs/` subtrees into scratch, which keeps their bytes; or
   - (b) add `test_env/test_runs` to `stamp-rc12.mjs`'s `ignored`, to match its stated rule.
2. **P3.** Accept RV5's stated equivalence, or commission a fan-out or retry fixture.

## Continuation: stamp, cut, install

Operator continuation, commentary. This section and the `demo/RUN.md` update are committed on top of the cut commit `95da94e72`; that commit changes only `.ai-workspace/`. Scratch: `/private/tmp/abg-rc12-cut-02` (run directories, logs, `post-cut-checks.sh`).

**Stop hit after the cut: a version-derived test pin.** At `95da94e72`, `t287-default-library-prerequisites` is 7/6/1/0 (7/7/0/0 at `eb87782fa`).
- The failing case (test file line 60) pins the `library` and `bindings` digests of constructions over a basis built from `product.ABI5_PRODUCT_ID` and `ABI5_PACKAGE_VERSION` (line 18). On the cut build, the rc.11 identity gives exactly the pinned `ad5051fd…` and `90338211…`; the rc.12 identity gives the observed `0f140619…` and `8ba685c3…`. The stamp caused the red.
- The repair is a test-pin edit, outside the grant. Not made.
- Census gap: K D1 and the stamp's own check search only for the literal version string; neither sees digests derived from it.
- Scope at `95da94e72`, each file alone, of the other files that build a basis from the product identity and pin digests: `t287-default-library-reviews` 10/10/0/0, `t287-default-library-fulfillment` 7/7/0/0, `t287-native-work-reacquisition-normalization` 2/1/0/1 (skip: retained root unset), `t287-recursive-failure-foldback` 8/8/0/0, `t287-default-library` 37/34/0/3 (the B2a-continuation baseline). No other red.
- Facts for the decision: `test_env/` is outside the package `files`, so a test-only repin cannot change the archive bytes. The rc.12 release and install directories exist and are create-once, so any re-cut is rc.13. (A) keep `95da94e72` as the cut and repin in a later commit: same archive, but the cut commit carries the red pin. (B) repin and cut rc.13.

**Script change, `e91bfa6dc`.** `stamp-rc12.mjs` adds `test_env/test_runs` to `ignored` (the repository `.gitignore:38` rule), and the comment names both ignore sources. Dry-run then: `changed` 4 sites, `regeneratedByBuild` 2 (`capability-definition-graph.json`, `product-toolchain-manifest.json`).

**Stamp commit = cut commit** `95da94e725c709b8307b125f20f350861fc1e8a3`, tree `b1586e3c6fb0b553105db7989f10990bb8918f0a`, 8 paths: the 4 census sites (rc.11 → rc.12), the 2 regenerated files, `release-claim.md`, and `abi5-root-candidate-basis.json`, which `scripts/refresh-candidate-basis.mjs` refreshed. The refresher needs no qualification step; it ran with npm offline.
- `npm run build` exit 0. Two further builds left the 8 paths byte-unchanged; the last was compared against the staged content.
- At the staged stamp: `lint:imports` "3 forbidden owner pair(s) hold"; `lint:lifecycle` "291 modules … no offender"; `lint:calculus` "6 modules … no offender"; recipe lint `"passed":true` over 72 files; `lint:evidence` the same five offenders.
- After the commit, `test:r1`'s build left the tree clean.

**Cut.** Package-files branch, both donor and build. Inventory `f28e1d19…`: 4,576 rows, equal.
- Dry-run: `DRY_RUN_COMPLETE_NOTHING_WRITTEN_OUTSIDE_SCRATCH`, `generatedEqual:true`, `outputAbsent:true`.
- Apply: `CUT_COMPLETE_INSTALL_NOT_PERFORMED`.
- Archive `~/Library/Application Support/ABIogenesis/releases/5.0.0-rc.12/abiogenesis-typescript-tenant-5.0.0-rc.12.tgz`: `sha256:db80a5dac52fac5a859daf45a646e21209e538c7093b443ffca6532e6be9e3ca`, 11,062,933 bytes, 5,327 members, 71,976,940 payload bytes. `productContentDigest` `sha256:dcfbcf42…d106`, `manifestDigest` `sha256:644edecc…a3d3`. Verifier `verified`, 5,325 payload files checked.
- Against RC11, from the cut record `comparison`: +`build/code/src/shared/owned_process_state.{js,d.ts}`; −`node_modules/{fast-check,pure-rand}/CHANGELOG.md` (C1: two fewer dependency changelogs); 87 changed, 5,238 unchanged.

**Reproducibility.** The dry-run and the apply each build fresh from a git-archive of the commit, and both gave `db80a5da…`. The worktree pack made by the basis refresh before the commit gave the same digest. The basis's three digests equal the cut record's identity, so r1 and r2 verify the rc.12 bytes. No third cut run (the script refuses an existing `--output`).

**Install.** Dry-run `DRY_RUN_INSTALL_COMPLETE_IN_SCRATCH`; apply `INSTALL_COMPLETE_UNQUALIFIED`.
- Host `~/Library/Application Support/ABIogenesis/installs/5.0.0-rc.12`, installed root `node_modules/@abiogenesis/typescript-tenant`.
- 5,327 installed files = 5,327 members, `installedEqualsArchive:true`. My own walk agrees: 0 missing, 0 extra, 0 differing, no links. Beside the root the host holds only `package.json`, `package-lock.json`, `node_modules/.package-lock.json`.
- To depth 2 under `ABIogenesis/`, the only entries newer than the stamp run are the two rc.12 directories and their parents `releases/` and `installs/`.

**Smoke** (dry-run and apply): `INSTALLED_OWNER_SMOKE_CLOSED`, version `5.0.0-rc.12`, 56 definitions, 15 export paths, 0 events, re-verified, content matches. The closed empty resource is kept in scratch.

**Tests at `95da94e72`,** each file alone with TMPDIR `/private/tmp/abg-x-tmp`, as tests/pass/fail/skip:
- `t287-default-library-recoverable-failure` 5/5/0/0;
- `t287-default-library-prerequisites` 7/6/1/0 (the stop above);
- `t287-amendment-witness` 13/12/0/1 (the gated live case);
- `m5-consensus-module` 17/17/0/0;
- `npm run test:r1` 1/1/0/0;
- `npm run test:r2` 2/2/0/0 (r1 and r2). Both verified `db80a5da…`; r2 materialized it, and the installed export re-verified it.

**`release-claim.md`** opens: "`5.0.0-rc.12` is a local, unqualified, unpublished development candidate. It is cut from the commit on branch `claude/rc12-integration` that adds this text … RC11 remains the pinned builder." It lists X's results, each at the commit where it was observed (`eb87782fa`, `c174b2b44`), and says "The whole suite is not run for this claim; it is reported separately." It does not claim "Qualification … Publication … Evidence from earlier candidates … A live provider run … Any Consensus change: the Consensus sources are unchanged from the base `82ad6639b`." (Checked: no tracked file whose path contains "consensus" differs between `82ad6639b`, or RC11's `e2ba05da5`, and the cut.) Its line "prerequisites 7/7/0/0" at `eb87782fa` is accurate for that commit, but it does not hold at the cut commit.

**Demonstration.** `demo/RUN.md`'s live command now sets:
- `ABI5_WAVE1_FROZEN_ARTIFACT_PATH` = the archive above;
- `ABI5_WAVE1_FROZEN_INSTALL_HOST` = the install host above;
- `ABI5_WAVE1_FROZEN_ARTIFACT_SHA256=db80a5da…e9e3ca`.

The FP limits (300000 and 1800000), `E=$W/qualification-scratch/rc12-executive-01/demo` with `live-01`, and TMPDIR `/private/tmp/abg-demo-tmp` are kept.

The frozen route is verified with no provider call, using one scripted case and the live gate unset. The cut digest gives 1/1/0/0. An all-zero digest gives 1/0/1/0, "frozen artifact digest differs from the authorized subject". The install host inventory is `c80bfef4…` (5,330 rows) before and after, with 0 files newer than the marker. The live case was not started.

**Deviations.**
- npm ran with `npm_config_offline=true` and `npm_config_update_notifier=false`.
- Extra builds and the scope runs were added beyond E4.
- The claim cites only X's results, not every earlier Return's.

**Residual risks.**
- The census misses other version-derived pins outside the files run here.
- The whole suite was not run.
- The writer and the advisor are the same model family.
