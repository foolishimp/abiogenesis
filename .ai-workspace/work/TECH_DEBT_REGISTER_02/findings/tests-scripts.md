# Area findings: tests-scripts

Commentary, not law. Reviewer: Claude Opus 5.5, read-only, 2026-11-12. Area: `T/test_env` (tests, support, fixtures, uat, downstream, falsifiers, proof, evidence, qualification, types), `T/scripts`, `T/package.json`. T = `build_tenants/abiogenesis/typescript`. Entry labels `TS-nn` are local to this file.

## Basis and limits

- Source: `main` at `002035b8a`. The whole-suite run the brief cites ran at `82ad6639b` (an ancestor of `main`, 48 commits earlier) in `/private/tmp/abg-rc12-foldback-20261111`. Its output is `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01-evidence/suite/suite1.tap` (Node spec reporter, not TAP). Between that commit and `main`, 12 test-side files changed: the c0 split (`1cc747533`) and small edits to the amendment-witness and default-library lanes. Suite facts below are read from that output; where `main` differs I say so.
- Per-file times come from my own attribution of the spec reporter's lines to files in glob order (scratch `perfile.py`). Files that build test titles at run time get misattributed, so I corrected the one large case by hand: `t287-c0-post-publication-failure` took about 1,290 s (30 of 31 cases at about 42 s each, then a heap abort at 4 GB). `t287-c0-correction-regressions` took about 85 s. The census file `suite-slow-tests.json` lists that file twice, and `suite-skip-reasons.json` is empty because its regex expects TAP `# SKIP` lines. I parsed the spec reporter's skip lines (`﹣ … # reason`) myself: 236 skips, 235 of them attributed to 94 files.
- The census covers only `code/src` for declarations, compiler-unused and kinds. `clones.json` likewise covers only `code/src`. For named checks 1 to 3 and lead 5, I ran a ten-line window clone hash over `test_env/support`, `test_env/tests`, `test_env/uat` and `scripts`, plus an export-use scan of `test_env/support`. Both are in my scratchpad and were not added to the census.
- I did not run tests, builds or git commands that change state. `test_env/test_runs` was measured, not read. Anything I inferred without reading is marked as inferred.

## Lead 1: the failing fourteen

The fourteen failures come from six files and fall into three kinds:
- **missing-input gates** that assert instead of skip: 10 failures, TS-01;
- **stale tests** for behaviour that a later ratified design changed: 3 failures, TS-02 and TS-03;
- **one assertion that has never passed**: 1 failure, TS-04.

None of the fourteen is shown to be a live Product defect. One correction to the brief's framing: `single-address-space-consolidation` is not an unfinished consolidation. The callers were migrated at RC6 (`e7179b19b`) and RC8 (`2019d62e4`). The file is a measured proof of that migration, and its input is not available where the test looks for it.

| File (failures) | Meant to prove | Why it fails (by reading) | Kind |
|---|---|---|---|
| `t287-single-address-space-consolidation` (7) | The migrated liveness, prefix, classification and semantic-stage callers read the owned prefix with fewer log bytes, no snapshot and no immutability walk, measured against the retained RC5 log (586,361,364 bytes, 25,016 rows). | Six cases get ENOENT on `<repo>/consolidation-inputs/native-02/{EXTERNAL_READ_RESOURCES,MEASURED_BASELINE}.json`. The path is the default in `support/single-address-space-consolidation.mjs:31`, unless `ABI5_CONSOLIDATION_INPUTS` is set. The comment at `:29` says "Absence fails; it never skips". The seventh case (`:1362`) checks that every earlier case recorded its result, so it fails when they do. The inputs exist only inside an archived native Run sandbox under an untracked work record: `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/runtime-001/resources/archives/worksite-command-execution/2b3dea4f…/306d3afd…/sandbox/consolidation-inputs/native-02/`. They were never committed (`git log --all -- consolidation-inputs` is empty). The RC5 log and the rc.4 and rc.5 installs they name do exist on this machine. | Missing-input gate (TS-01) |
| `t287-calculus-fold` HS03 (2) | RC7 HS03 bounded stdout windows replayed against a recorded per-chunk metadata oracle (46,684,229 bytes, pinned digest). | `:1194-1195`: when `ABI5_HS03_STREAM_METADATA` is unset, the test fails an assertion instead of skipping. The oracle exists in the untracked `rc12-executive-01-evidence/liveness-{h,l2}/oracle/hs03-metadata.json`. With it set, the RC12 H Return records `calculus-fold 25/0/0`. | Missing-input gate (TS-01) |
| `t287-framework-handoff-types` exact014 (1) | Per-slot owner schemas of the candidate equal those of the exact014 baseline package. | `:103-115`: when `ABI5_HC1_BASELINE_PACKAGE_PATH` is unset, the test fails an assertion. The package exists on this machine: `~/Library/Application Support/ABIogenesis/toolchains/rc4-hc1-baseline-014/b775014c….tgz` (10,957,749 bytes; `shasum -a 256` matches the pin). Its path is recorded in `rc4-native-recovery-01/attempt-015-r1` to `attempt-019`. The hand-run suite did not set the variable. The file was last committed as "PARTIAL UNACCEPTED HC2 C3 custody" (`0a8d330a3`, 2026-11-03). Even with the archive supplied, the test asserts that the current schemas equal those of a cut from before RC6. That is a conservation claim against a superseded cut, the class C-5 retired. | Missing-input gate plus a superseded-cut claim (TS-01) |
| `t287-route-reconstruction` (2) | The C-10 held history generation projection (`457b5632a`): an open store keeps the verified bodies of its current generation, and a committed row decodes once per generation. | Both fixtures read `basis_admitted` bodies: `:551` takes `full.find(e=>e.kind==='basis_admitted').payload.rawInputValue`, and `:594-600` builds basis rows. The RC10 O1 lifetime (`93a0de75a`; library design `:1062`; `runtime_history.ts:327-336`) keeps a basis body only while a run operation scope holds its invocation. These fixtures open no such scope, so the weak reference dies and the basis row decodes again. | Stale test for a ratified change (TS-02) |
| `t287-governed-context` GC03 (1) | The B05 GC03 recipe: custody digests of the released method sources the witness reads. | `:513-527` pins STDO 3.0.2 standards (`profile …stdo-3.0.2…`, `EVALUATION.md 478fd21f…`). At `:709-712` the test resolves the method root from the project's current basis (`stdo_abiogenesis.json` selects `stdo://releases/v3.0.4/`), so `EVALUATION.md` differs from its pin. | Stale test after the STDO repin (TS-03) |
| `witness-reprice-definition-binding` (1) | Public profile reprice: the L-to-P boundary, cold content checks, and "no later handoff re-reads the complete closed population". | The RC8 review `rc8-reference-preservation-01/reviews/witness-reprice-024/REVIEW.json` found a profile-coordinate mismatch in the fixture and recommended a two-reference repair. That repair is now in the test (`:226`, `:241` use `ROOT_WINDOW_EVENT_PROFILE_REF`). The case now runs past its old stop and fails at its last assertion (`:43`, `:248`): 3 selected body reads against 3 closed rows. I found no recorded run in which it passed after the repair. | Investigate (TS-04) |

The three r1–r3 failures in the same suite are not among the fourteen. They are covered under TS-05.

## Lead 2: skipped and gated tests

Of the 236 skips in the 2026-11-11 suite, I attributed 235, in 94 files. By class:

| Class | Files | Skips | Evidence |
|---|---|---|---|
| A. Needs the evidence root (`ABI5_EVIDENCE_ROOT`); input present on this machine | 15 | 73 | Every named relative path exists under `/Users/jim/src/apps/abiogenesis/.ai-workspace` (checked one by one). The hand-run suite did not set the variable. |
| B. Needs a live provider, or an opt-in installed native run | 11, four of them also in class C | 13 | `ABI5_AMENDMENT_WITNESS_LIVE`, `ABI5_DEFAULT_LIBRARY_LIVE`, `ABI5_GENERIC_JOB_FULL_NATIVE`, `ABI5_GENERIC_JOB_CORRECTION_NATIVE`, `ABI5_T287_C1_LIVE`, `ABI5_CONTEXT_PUBLIC_PROOF`, `ABI5_NATIVE_SELECTION_LIVE`, `ABI5_RECURSIVE_SELECTION_LIVE`, `ABG_TS_CLAUDE_COMMAND`; two heavy opt-ins, `ABG_RC10_BASIS_LIFETIME_MODE=workload50` and `ABI5_COLD_RECORD_MATERIAL` |
| C. Needs a retained Run, fixture or build from an earlier candidate, through its own variable | about 68 | about 150 | Across classes B to D, 145 distinct variables other than the evidence root appear in skip conditions (scratch `skipvars.txt`). 51 of them have a value recorded in tracked or untracked work records, tickets or comments, in shell form (`VAR=value`) or JSON form (`"VAR": "value"`); 94 have none (scratch `skip-recorded-union.json`, `rg` over `.ai-workspace/{work,comments,tickets}`, excluding `test_runs` and copied review subjects). 44 of the recorded values are paths, and for 39 of those variables at least one recorded path still exists. Whether those inputs still satisfy the current gates, several of which pin digests, was not checked. Other inputs sit in machine-local stores such as `~/Library/Application Support/ABIogenesis/candidates/<ticket>/tmp/abi5-root-env-*/` (55 GB, 101 candidates). |
| D. Unsatisfiable as recorded; regeneration unverified | 2 | 3 | `t287-generic-job-revision` (`ABI5_GENERIC_JOB_REVISION_PREFIX_ROOT`, `…_EVIDENCE_PREFIX_ROOT`): the only recorded values are `/private/var/folders/…/abi5-root-env-PaaGmq` and `…-u4YVKX`, both gone. `t287-static-declaration-closure:244` (`ABI5_STATIC_CLOSURE_CAPTURED_INPUT`, "the exact frozen81 input"): the only recorded value is `/private/var/folders/…/abi5-root-env-VaXdLq/st4-81-declared-positive-request.jsonl`, gone. Whether a new native Run could regenerate an equivalent input was not checked. (`t287-d1-requirement-handoff:1138` needs `ABI5_D1_RETAINED_NATIVE_BASIS`, which has no recorded value, so it is class C. `t287-d1-semantic-stage` defaults `ABI5_D1_BUILD_ROOT` to the package root, so that variable is not a gate there.) |
| E. Fails instead of skipping | 3 | (10 failures) | See TS-01. |

For class C I could prove neither "satisfiable" nor "never satisfiable" by reading. A runner can satisfy these gates only by finding, in work records, which path an earlier author passed. For 94 variables no such record exists.

Some gates cite inputs by label. A `find -name` for the labels found nothing, but that proves little, because the labels are not file names. Searching for recorded values worked better:
- `captured34` (`ABG_GOVERNANCE_COVERED_FIXTURE`) and `frozen176` (`ABG_GOVERNANCE_COVERED_DECLARATION_PAIR`) in `t287-governance-covered-source-use:16`, `:103` have recorded paths under `.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/` that still exist;
- `exact014` (class E) exists in the toolchains store (Lead 1 table);
- `frozen81` is gone (class D);
- `original1B` (`t287-predecessor-context`, `ABI5_PREDECESSOR_*`) has no recorded value;
- `stdo-installs.json` (`t287-stdo-run-environment`, `t287-stdo-environment-citation` and `t287-declared-testing-capability`, through `support/stdo-environment-pilot.mjs:158-166`) is a small path map (`stdo`, `representation`, `axiomIndexer`, `python3`) that a runner could write itself; `ABI5_ENV_INPUT_ROOT` has no recorded value.

The gate catalogue in TS-06 settles each of these.

## Lead 3: retired and legacy lanes

- **`test:r1` to `test:r9` are cumulative chains**, not separate lanes: `test:rN` runs `npm run build`, then r1 through rN. `test:r9` equals `test:m4` minus `rival-authority-mutations` and `runtime-scope-regressions`. Each `test:m5:*` entry is `npm run build` plus one file. `test:m5:gtl` alone omits `--test-concurrency=1`, and `test:m5:conservation` alone omits the build. No design note, ticket or RC12 record cites `test:r3` to `test:r9` or any `test:m5:*`; only `test:r1` and `test:r2` are cited once. The qualification recipe's declared commands cite no npm test script.
- **What the r and m5 lanes prove:**
  - r1 to r9 are the install-to-run steel thread (pack and verify, clean install, workspace binding, catalog, invocation, resolution, GTL validation, HoG entry, causal closure). They exercise current owners and pass, except r1 to r3 (TS-05). Their one legacy behaviour is writing `test_env/evidence/abi5-root-r*.json`, which nothing reads (TS-12).
  - The twelve `m5-*` files test current owners under milestone names. For example, `m5-worker-transport` and `m5-event-store-reopen` are the accepted proofs for TD-11 and TD-23.
  - `r10-child-proof` and `r10-projection-contracts` are class A. They are current with the root set (C-5).
  - Fifteen files keep 17 `// Retired (T-290 …)` tombstones in place of deleted bodies, for example `m5-consensus-module.test.mjs:1543`. These are records, not dead code, and I register no entry for them.
- **Lanes with no runner:** the five non-`.test.mjs` proof scripts under `tests/`, run only by hand or by a candidate Worker (TS-07).

## Lead 4: the cost of the suite

The 2026-11-11 suite ran for 8,744 s. 79 test files install the product, directly or through a support helper (`setupInstalledRoot*`, `setupInstalledCliHarness`, `runInstalledLanguageTest`, `populateSandbox`, `runWitness`, `runCase`, or a `prepare*Product` that packs). Between them they hold 464 cases and took about 8,280 s, roughly 95 % of the wall clock. Twelve files took 55 %:

| s | cases | file | setup |
|---|---|---|---|
| 1,290 | 31 | `t287-c0-post-publication-failure` (now split 16 + 15) | `runCase` → `setupInstalledRootExecutionBasis` per case |
| 880 | 13 | `t287-amendment-witness` | `runWitness` → `setupInstalledRootCatalog` per Public case |
| 334 | 12 | `t287-single-address-space-consolidation` | 3 language-test installs plus 2 sandboxes |
| 327 | 37 | `t287-default-library` | 4 catalog setups and 4 registered-selection products |
| 320 | 12 | `t287-worksite-command-execution` | helper at `:665` per case |
| 303 | 1 | `steel-basic-cli-public` | one CLI harness, long Public chain |
| 269 | 1 | `t287-calculus-state-transfer` | compose scenario (TD-22: setup 33,992 ms, of which artifact verification 23,935 ms) |
| 241 | 7 | `t287-recursive-registered-selection` | 3 setups |
| 231 | 7 | `t287-recursive-failure-foldback` | 2 setups |
| 219 | 5 | `t287-readable-stops` | per Public case |
| 201 | 4 | `t287-required-operation-bindings` | language-test install |
| 195 | 19 | `m5-event-calculus-runtime` | 5 setups |

Single slow tests: the 30 B04 cases at 40 to 50 s each, W1 to W6 at 116 to 155 s each, STEEL-BASIC-CLI-01 at 303 s, and compose conservation at 269 s.

Cases that could share one install per file: the c0 pair (`support/c0-post-publication-failure.mjs:458`, `:553` assert that the installed inventory is unchanged and inject faults only into the worksite), the amendment witness's W1 to W6 and its intake case, `t287-default-library-reviews` (`publicReviewsRun`), `t287-readable-stops`, the two recursive files and `m5-event-calculus-runtime`. These cases mutate only their store and worksite (inferred from the setup options for all but c0). Cases that must keep their own install: `r2-clean-install`, `m5-installed-portability`, Product verification of stale bytes (`t287-wave2-installed-product-verification`), `rival-authority-mutations` and r1's tampered archive. The measurement is the RC12 package M Return: about 104 MB retained per case and a 0.93 GB peak (`rc12-executive-01-evidence/memfix/*.tap`). Entry TS-11.

## Lead 5: second owners in support code

- **Installed setup:** `root-installed-environment.mjs` owns it. `root-cli-environment.mjs:12-37` repeats `selectedFrozenArtifact` byte for byte (`root-installed-environment.mjs:30-55`) and its own `npm pack` and extract code. About 20 support and uat modules run `npm pack` themselves. TS-08.
- **Installed Public call construction:** `uat/public-setup.mjs` (`emptyAuthoritySlots`, `authorizeInstalledOperation`) is the owner. Copies of `coordinate`, `actorAuthority`, `authoritySlots` and the CLI call ledger, a 171-line block at the largest match, sit in `t287-d1-requirement-handoff`, `w2-steel-single-start-installed`, `w2-steel-serial-branch-installed`, `steel-consumer-declaration`, `steel-basic-cli-public`, `t287-w2-05-install-catalog-owner-chain`, `tests/d2-frame-installed.mjs` and `tests/t287-stdo-run-environment-installed.mjs`. Test-side clone census: 379 regions and 8,455 normalized lines in all, most of them in this family. TS-09.
- **Small helpers:** 28 files define a local sha256 helper, 27 parse an event-log JSONL file themselves, and 19 write their own executable stand-in worker (`chmod 0o755`). TS-10.
- `single-start-worksite-program.mjs` and `serial-branch-worksite-program.mjs` share 154 lines, and `developer-mini-product.mjs` and `flavored-catalog-product.mjs` share 82. These are fixture-product builders and belong in TS-08.

## Lead 6: trees of unclear purpose

| Tree | Holds | Read by | Last change | Kind |
|---|---|---|---|---|
| `test_env/uat` (110 MB; 10 tracked files) | Runner, harness and continuation helper (tracked); `runs/basic-cli` 110 MB and `runs/preflight` (ignored, `.gitignore:6`) | `scripts/sandbox-uat.mjs`, `npm test` (harness), five tests import `public-setup.mjs` or `runner.mjs` | 2026-11-11 | input (tracked part) and output (`runs/`) |
| `test_env/downstream` (50 MB, 2,905 files, 0 tracked) | `odd_sdlc_t132_frozen/odd_sdlc_typescript/{build,node_modules}` | nothing (the only hit, `m5-consensus-module:974`, is a URI string) | source deleted 2026-07-21 (`9d442b4c8`, 525 files) | residue |
| `test_env/falsifiers` (208 KB, 5 tracked) | worker processes the F09, preparation-refusal and retained-projection tests spawn | `t287-f09-frontier-handoff`, `t287-r4-aba-retry`, `m5-event-calculus-runtime`, `t287-worksite-command-execution`, `support/fresh-process-runtime-proof.mjs` | 2026-11-05 | input (the name says falsifier; they are support workers) |
| `test_env/proof` (508 KB, 4 tracked) | `abi5-m5-live-fp.json`, `abi5-root-governor.json`, `abi5-root-rival-authority-mutations.json`, `abi5-root-r10.events.jsonl` | no test. Only the qualification inventory and recipe list them; `r10.events` is named in a retired-case comment | 2026-08-13 | historical record (TD-19 retention) |
| `test_env/evidence` (35 MB, 8 files, ignored by `.gitignore` line 5 `test_env/evidence/*.json`) | `abi5-root-r1.json` (16 MB), `-r2.json` (21 MB), r3, r6 to r8, the non-root alias selection, the w2-05 generator package | nothing; written by r1 to r3, r5 to r8 and `t287-w2-05-generator-package-reproducibility` | written each run | output nobody reads |
| `test_env/test_runs` (45 GB, 1,310,433 files, ignored) | 30 run roots: `sandbox-uat` 27.7 GB and `qualification` 10.9 GB (both October), `rp2`, `steel-*`, and 20 July roots named after tickets t100 to t223 (about 1.8 GB) | the October roots are written by `uat/runner.mjs`, `support/exact-candidate-qualification.mjs` and four tests; the 20 July roots have no writer at head (no `t1xx` or `t2xx` test exists) | July to 2026-10-30 | output plus residue |
| `test_env/qualification` (1.9 MB, 19 tracked) | inventory (572 KB), recipe (254 KB), dispatch and assessment modules, two fixtures | `support/exact-candidate-qualification.mjs`, rp2 and st1 tests | inventory and recipe 2026-10-29/30 | input, stale (TS-14) |
| `test_env/fixtures` (2.7 MB, 93 tracked) | fixture products, sandbox UAT inputs, candidate basis | tests and support (`fixtures-unreferenced.json` is empty) | 2026-11-11 | input |

## Lead 7: scripts

Every script has a consumer once `.ai-workspace` and the qualification recipe are searched, so no script is unused. The four that no npm script calls:
- `generate-qualification-rule-catalog.mjs` is imported by `generate-product-manifest.mjs:9`, so it runs in the build.
- `node-test-evidence-reporter.mjs` is in the recipe's `declared-commands.json`.
- `prepare-retained-setup-binding.mjs` is imported by `t287-retained-installed-consumer:9`.
- `refresh-candidate-basis.mjs` is run by hand in the cut (RC12 K and X Returns, `demo/RUN.md`).

Two defects:
- `npm run lint` runs `lint-verification.mjs` without the recipe path it reads as `argv[2]`, so it throws.
- `sandbox-uat.mjs` (4 lines) is a launcher for `uat/runner.mjs`, which is fine.

The cut procedure is not maintained. It is copied for each candidate into work records: `rc8-local-cut-01`, `rc9-local-cut-01` and `rc10-local-cut-01` each hold `run-local-cut.mjs`, `install-local-rcN.mjs`, `installed-owner-smoke.mjs` and `exact-artifact-correspondence.py`; `rc12-executive-01/cut/` holds five scripts (836 lines) with `FROM_VERSION = '5.0.0-rc.11'` and `VERSION = '5.0.0-rc.12'` at `cut-common.mjs:12-13`, and four stamp sites hard-coded in `stamp-rc12.mjs`. TS-15.

## Lead 8: tests named by ticket

There are 225 files: 161 `t287-`, 12 `m5-`, 8 `d2-`, 6 `steel-`, 5 `r10-`, 4 `w2-`, 9 `r1-` to `r9-`, and 3 `t288-`. 190 are in no npm script. TS-16.

---

## Candidate entries

### TS-01: Put the three asserting input gates under the evidence-root owner and retire the superseded-cut claim
- Category: test debt
- Evidence (read):
  - `test_env/support/single-address-space-consolidation.mjs:28-39` (`ABI5_CONSOLIDATION_INPUTS`, else `<repo>/consolidation-inputs/native-02`, "Absence fails; it never skips"); `t287-single-address-space-consolidation.test.mjs:67`, `:145`, `:270`, `:316`, `:1225`, `:1281`, `:1362`.
  - `t287-calculus-fold.test.mjs:1192-1198` (`ABI5_HS03_STREAM_METADATA`, pinned 46,684,229 bytes).
  - `t287-framework-handoff-types.test.mjs:101-116`, `:316-361` (`ABI5_HC1_BASELINE_PACKAGE_PATH`, `BASELINE_SHA256 b775014c…`).
  - The C-5 rule is TD-04's row: one variable, read by path, sha256 and bytes through `test_env/support/evidence-root.mjs`, and a lane skips with its reason when the variable is unset.
  - Where the inputs are (by `find`): the native-02 inputs only in an untracked archived sandbox (Lead 1 table); the HS03 oracle in the untracked `rc12-executive-01-evidence/liveness-{h,l2}/oracle/`; the exact014 package in the machine-local toolchains store `~/Library/Application Support/ABIogenesis/toolchains/rc4-hc1-baseline-014/`, digest matching.
  - The consolidation proof also writes `T/artifacts/single-address-space-proof.json` with flag `wx` (`support/…:14`, `:349-353`). `npm run build`'s clean and r1's `rm -rf artifacts` delete that directory.
- Retire:
  - The private input resolution in all three lanes. Each input moves into the evidence-root inventory (path, sha256, bytes) or the lane skips with its reason. For native-02, copy only the two JSON files into the evidence root by digest, plus the read-only RC5 log it names (586 MB, already outside git).
  - The exact014 equality: retire it as a superseded-cut claim, or restate it against the current release's own published schemas. Its input exists, so the decision is whether the claim is still wanted, not whether the lane can run.
  - The proof writer into `T/artifacts`: the measured diagnostics already go to `t.diagnostic`.
  - Ten of the fourteen standing failures become reasoned skips, or passes with the root set.
- Size: M. Three lanes, one support module, about 60 lines changed; the exact014 case (about 50 lines) deleted or restated.
- Risk: qualification mirrors. The inventory lists `t287-calculus-fold` by digest. `t287-framework-handoff-types`, `t287-single-address-space-consolidation` and its support module are not in the inventory (TS-14).
- Change class: realization_refactor
- Confidence:
  - The cause of each failure is verified by reading.
  - HS03 passing with the input is verified (RC12 H Return: 25/0/0).
  - Whether the exact014 case passes with the package supplied is not checked. The schemas are expected to differ after RC6 (inferred).
  - Whether the six single-address-space cases pass with the input needs investigation: they assert `history.length === 25016` under `requireCurrent: true` on a non-current profile, which only a run with `ABI5_CONSOLIDATION_INPUTS` pointed at the archived sandbox can settle.

### TS-02: Restate the two route-reconstruction cases to the RC10 basis-body lifetime and qualify the C-10 closure
- Category: test debt
- Evidence (read):
  - `t287-route-reconstruction.test.mjs:539-583` holds a weak reference to a `basis_admitted` payload and expects the open store to keep it.
  - `:585-602` reads basis rows built by `basis()` and expects one decode per row per generation.
  - `code/src/abg/runtime_history.ts:319-336` keeps a decoded basis body only when `#basisHolds` has its invocation (RC10, `93a0de75a`); `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:1062` ("O1 lifetime (RC10)").
  - Both cases fail at base `b7cf409fc` (`base10.summary`: 8 pass, 2 fail, 3 skip).
- Retire:
  - The two assertions as written. Assert generation retention on a non-basis body.
  - For basis bodies, either open a run operation scope (`retainExecutionBasisLifetime`) and keep the assertions, or assert release without a scope. The release case is already `t287-held-basis-lifetime`'s claim; do not duplicate it.
  - The register's C-10 row ("keeps the verified bodies of its current generation") needs the qualifier "except basis bodies outside a run operation scope (RC10 O1)".
- Size: S, about 20 lines.
- Risk: none. No Product change.
- Change class: realization_refactor
- Confidence: likely. The cause is established by reading the test, `runtime_history.ts` and the design line together; I did not run the cases with a scope open or print the decode counts, which would settle it.

### TS-03: Pin the GC03 recipe's own method release instead of the project's current basis
- Category: test debt
- Evidence (read):
  - `t287-governed-context.test.mjs:513-527` pins the STDO 3.0.2 profile and standards digests.
  - `:709-712` resolves `stdo resolve <project basis>`, which is `stdo://releases/v3.0.4/` in `stdo_abiogenesis.json`.
  - The failure message: `method/EVALUATION.md differs from its custody digest`. The test fails at base too.
- Retire: the coupling of a fixed external recipe to the project's moving basis. Either resolve `stdo://releases/v3.0.2/` explicitly, which the recipe's `profile` and `fd-method-stdo-3.0.2.json` member already name, or re-derive the recipe for 3.0.4 through its owner (`make-gc03-candidate.py`).
- Size: S, one line or one recipe refresh.
- Risk: none.
- Change class: realization_refactor
- Confidence: verified by reading. Whether an installed 3.0.2 release is still resolvable by `stdo` on this host is not checked.

### TS-04: Settle whether the profile reprice re-reads its population or the read bound is wrong
- Category: test debt (or performance, if confirmed as a regression)
- Evidence:
  - `witness-reprice-definition-binding.test.mjs:38-45` asserts `selected < closedRows`; `:229-249` fails with 3/3.
  - The RC8 review `WITNESS-REPRICE-024` (`REVIEW.json`, verdict "S3 fixture profile-coordinate mismatch") found that the case stopped at the profile coordinate. The fixture repair is in place at `:226` and `:241`. I found no recorded run in which this case passed after the repair; that this assertion is reached now for the first time is inferred from that absence.
  - Inferred: the closed population after the reprice is 3 rows, of which 2 are appended by the reprice itself. C-10's commit reads each appended row once, so 3 reads over 3 rows may be the floor, not a re-read.
- Retire: either the bound (restate it as "acquisition of the entry extent plus at most one read per row appended by this call") or, if the stacks show a second population pass, the re-read in the owner.
- Size: S
- Risk: none for the test. If it is the owner, replay digests of recorded Runs are unaffected (a read count only).
- Change class: realization_refactor
- Confidence: investigate. To settle it, print the three `work.reads` stacks the test already captures (`:20`) and compare them with the entry row count.

### TS-05: Stop r1–r3 from reading a committed candidate basis that every source change invalidates
- Category: test debt
- Evidence (read):
  - `support/candidate-basis.mjs:4-23` reads `test_env/fixtures/abi5-root-candidate-basis.json`.
  - `r1-packed-artifact.test.mjs:38-48` verifies a fresh pack against that fixture.
  - The fixture was stale from rc.4 to rc.11 (RC12 K Return line 15; X Return line 87) and is refreshed only by hand with `scripts/refresh-candidate-basis.mjs`.
  - The root harness already derives the basis from the packed artifact by default (`root-installed-environment.mjs:237-246`, `candidateBasisSource` default `packed_artifact`).
  - r1 to r3 failed in the suite with `artifact_digest_mismatch … rc.11.tgz`. They passed after the refresh (`cand3.summary`). The working tree on `main` now has modified `product-toolchain-manifest.json` and `capability-definition-graph.json`, so the fixture is presumably stale again (inferred).
- Retire:
  - The fixture as an input to the ordinary suite. r1 to r3 derive the expected identity as the harness does.
  - The external-identity check against a committed basis moves into the cut procedure (TS-15). That procedure writes the basis and runs r1 to r3 against it once, at the cut.
- Size: S, about 30 lines in three tests plus the cut step.
- Risk: manifest or digest pins. The fixture is a recipe member, and the cut commit carries it (X Return line 135). The change also narrows what r1 proves in the ordinary suite: with the expected identity derived from the pack, r1 shows only that the pack is self-consistent and that a tampered archive is refused. The claim that the pack matches a separately recorded identity then holds only at the cut, so the cut step in TS-15 must run it.
- Change class: realization_refactor
- Confidence: verified.

### TS-06: One gate catalogue for the 236 skips; run class A by default; retire gates only where the catalogue shows the input cannot be named or regenerated
- Category: test debt
- Evidence: the Lead 2 table (scratch `skips.py`, `skips.json`, `env-assign-all.txt`).
  - 73 skips in 15 files need only `ABI5_EVIDENCE_ROOT`, and every input they name is present.
  - About 68 files gate on bespoke variables. Across classes B to D there are 145 distinct skip variables besides the evidence root. 51 have a recorded value somewhere in work records, and for 39 of them a recorded path still exists; 94 have no recorded value at all.
  - Two files hold class D gates whose only recorded inputs were deleted temp roots.
  - The census `env.json` lists 360 variables on the whole test side, 334 of them in `test_env/tests`. 123 test files read the environment; 59 of those have no skip site and use it for an output root such as `ABI5_RP2_*_EVIDENCE_ROOT` or `ABG_C0_PROOF_ROOT`.
- Retire:
  - The per-lane input variables. Fold them into the evidence-root owner (`evidence-root.mjs`) as a catalogue: per gate, the variable, the input path under the root or the producing Run, its sha256 and bytes, and its class (A to D). Each lane skips with its catalogue row, and the suite command sets the root.
  - The class D gates, only after the catalogue shows their input cannot be regenerated, each with its input named (the C-18b precedent). This is the remainder TD-04 sent to T-287 D5-a. The labelled-input gates (Lead 2) are not proposed for retirement; the catalogue decides them. Its first source is the 39 variables whose recorded paths still exist.
  - The output-root variables go to one test-output owner.
- Size: L. About 70 files, several owners, and a catalogue design.
- Risk: qualification mirrors. Most gated files are inventory members with pinned digests.
- Change class: realization_refactor (the catalogue is test infrastructure)
- Confidence:
  - Classes A and B are verified.
  - Class D is verified as unsatisfiable from the recorded values; whether a new Run could regenerate the inputs is investigate.
  - Class C, including the labelled-input gates, is investigate: only the catalogue, built from the recorded values and the producing Runs, can settle each gate.

### TS-07: Give the five hand-run proof scripts under tests/ a runner or retire them with their lanes; delete the seven unused support exports
- Category: test debt (the five scripts); dead code (the seven exports)
- Evidence:
  - The suite glob is `test_env/tests/*.test.mjs`, no npm script names these files, and no test-side file imports or spawns them (`rg` excluding `test_runs`, by file name and by computed path such as `join(…,'tests',…)`). Each appears only in the qualification inventory and recipe. They are proof scripts run by hand or by a candidate Worker, not dead code:
    - `d2-frame-installed.mjs` says "Author-only fixture; opt-in execution belongs to the candidate Worker" and reads its own `ABI5_D2_FRAME_*` variables, which nothing in the repository sets;
    - `t287-stdo-run-environment-installed.mjs` reads its own `ABI5_ENV_ATTEMPT` and related variables, likewise unset anywhere;
    - `r10-retained-child-projection.mjs` was last run by hand at C-5 ("skipped then passed, rc 0"), and T-290 `packages.md` describes the r10 scripts as support for the r10 family.
  - The five files:
    - `tests/d2-frame-installed.mjs` (724 lines, 1 test, last changed 2026-10-26);
    - `tests/t287-stdo-run-environment-installed.mjs` (766, 1 test, 2026-10-26);
    - `tests/r10-fresh-imports.mjs` (10, a script, 2026-09-11);
    - `tests/r10-retained-child-projection.mjs` (69, 2026-10-25);
    - `tests/r10-retained-hello-projection.mjs` (46, 2026-10-27).
  - Unused support exports (named nowhere else, including strings and design):
    - `installed-qualification-conservation.mjs:249 recoverSetup` (69 lines);
    - `root-cli-environment.mjs:40 constructClosedCatalogReadinessBasis` (47);
    - `t287-exact-prefix-projection-reuse.mjs:46 measureRetainedEnvironment`;
    - `t287-declaration-closure-symbol-reuse.mjs:11 loadDiagnosedDeclarationInput`;
    - `t287-native-frame-observation.mjs:6 controlledFrameWorker`;
    - two `…_WORKSITE_SPECIFICATION` alias exports.
  - Another 31 support exports are used only inside their own module. The export keyword can go, which is cosmetic.
  - The two installed modules are the D2 frame and STDO run-environment lanes. Their `.test.mjs` counterparts are in class C. T-290 line 127 records `r10-retained-child-projection.mjs` as a reader of the D2 store.
- Retire:
  - The seven exports (about 200 lines), now.
  - The five scripts (1,615 lines) after TS-06 decides their sibling lanes. A script whose lane is kept becomes a gated `.test.mjs` case with a catalogue row, so a runner reaches it. A script whose lane is retired goes with it. Until then, a hand-run script gives no evidence between cuts unless someone records its run.
- Size: S, about 1,800 lines.
- Risk: qualification mirrors. The inventory and recipe list all five modules by digest.
- Change class: realization_refactor
- Confidence: verified that no runner, import or spawn in the repository reaches the five scripts. That nobody runs them by hand any more is likely: the last recorded hand run is C-5. The seven exports are verified unused by name search, including strings and design notes.

### TS-08: One installed-setup owner: pack once, install once, reuse the frozen-artifact selector
- Category: second owner
- Evidence:
  - `support/root-cli-environment.mjs:12-37` equals `support/root-installed-environment.mjs:30-55` (`selectedFrozenArtifact`, read).
  - Both modules pack and extract the tenant themselves (`root-cli-environment.mjs:105` and `root-installed-environment.mjs:190`).
  - About 20 support and uat modules call `npm pack`: `developer-mini-product` (3 calls), `flavored-catalog-product`, `language-structural-fixture`, `language-smoke-fixture`, `neutral-schema-product`, `single-start-worksite-program`, `serial-branch-worksite-program`, `registered-graph-selection`, `stdo-environment-pilot`, `t287-generic-job-intake`, `t287-wave2-owner-chain-worker`, `d2-frame-fixture`, `d5-authentic-preserved-result-fixture`, `declared-testing-capability`, `uat/consumer`, `uat/harness.test`.
  - Fixture-product builders share 154 lines (single-start and serial-branch) and 82 lines (developer-mini and flavored-catalog), per the test-side clone census.
  - `uat/README.md` and `uat/continuation.mjs` already carry an install-reuse branch for UAT (`current.reuseInstalledPair`).
- Retire: the second frozen-artifact selector and the second tenant pack path, absorbed into `root-installed-environment.mjs`. One `packFixtureProduct(spec)` absorbs the fixture-product pack, extract and install code. The tenant pack is computed once per build tree; its bytes are a function of the tree, so it can be content-addressed by the build's manifest digest.
- Size: M, about 300 lines moved and 150 removed.
- Risk: none. Test infrastructure only; recorded Runs are not affected.
- Change class: realization_refactor
- Confidence: verified for the two selectors. That the pack copies are equivalent is likely, settled by a diff per site.

### TS-09: Replace the copied installed-Public call harness with the uat/public-setup owner
- Category: second owner
- Evidence: from the test-side clone census.
  - A 171-line block (`coordinate`, `actorAuthority`, `authoritySlots`, `keyOf`, CLI ordinal and observed-call ledger) is shared by `t287-d1-requirement-handoff.test.mjs:17`, `w2-steel-serial-branch-installed.test.mjs:16` and `w2-steel-single-start-installed.test.mjs:16`.
  - A 111-line block is shared with `steel-consumer-declaration.test.mjs:16`, 84 lines with `tests/t287-stdo-run-environment-installed.mjs:19`, and 102 lines with `tests/d2-frame-installed.mjs:37`.
  - 70 to 103 lines are shared with `steel-basic-cli-public.test.mjs:489` and `t287-w2-05-install-catalog-owner-chain.test.mjs:76` and `:547`.
  - The owner is `uat/public-setup.mjs:12` (`emptyAuthoritySlots`) and `:33` (`authorizeInstalledOperation`), re-exported by `support/installed-public-definition-call.mjs`.
  - Six of the eight files are class C gated lanes (TS-06).
- Retire: the copies, into `uat/public-setup.mjs`. Do this after TS-06, because lanes retired there drop their copies with them.
- Size: M, about 900 lines removed across eight files.
- Risk: qualification mirrors. The files are inventory members.
- Change class: realization_refactor
- Confidence: verified by census. I did not diff each copy against the owner for drift.

### TS-10: Route local digest helpers, event-log parsers and stand-in workers to their owners
- Category: second owner
- Evidence (by `rg` across `tests`, `support` and `uat`):
  - 28 files define a local sha256 helper. The owners are the product's `sha256Bytes` and `sha256Canonical`, or the support module `retained-installed-consumer.mjs:8 bytesDigest`.
  - 27 files split and `JSON.parse` an event-log JSONL file themselves. The owner is the event store's `readRuntimeEventsAtDurablePrefix`, or the store `readAll` the tests already use elsewhere.
  - 19 files write their own executable stand-in worker (`chmod 0o755`). There is no shared owner; `support/amendment-witness-run.mjs:29 standInActor` is the nearest.
- Retire:
  - A test-side digest helper module.
  - Event-log reads through the store owner, except where an independent byte-level oracle is the point. Some lanes parse bytes deliberately as an independent check, so each site needs a one-line decision.
  - One stand-in worker factory, taking a script and an environment.
- Size: M, about 74 sites and about 400 lines.
- Risk: none.
- Change class: realization_refactor
- Confidence: likely. The counts are by pattern; I sampled sites but did not read every one.

### TS-11: Install once per test file and keep per-case state per case
- Category: performance
- Evidence:
  - Measured: suite 8,744 s, with 79 installer files and 464 cases taking about 8,280 s (Lead 4 attribution of `suite1.tap`).
  - Measured: about 104 MB retained per installing case and a 0.93 GB setup peak (RC12 M Return, `rc12-executive-01-evidence/memfix/`).
  - Measured: one setup takes 33,992 ms, of which artifact verification takes 23,935 ms (TD-22 compose scenario).
  - Structural: `setupInstalledRootCatalog` (`root-installed-environment.mjs:168-260`) packs, extracts, imports the bootstrap Product, verifies, installs and imports the installed Product. It also opens the case's store, and the environment it returns bundles the store and workspace with the install (`:591-626`).
  - `setupInstalledRootExecutionBasis` already accepts `existingEnvironment` (`:647`), and three sites use it to stack a basis on an existing catalog.
  - Node never unloads an ES module, so each install adds two module graphs to the process.
- Retire: setup becomes two phases:
  - `installTenantOnce(file)`: pack, verify, install and import, held in `before()`;
  - `openCaseEnvironment(install, options)`: a new store, workspace, binding and catalog per case.
  
  Apply it to the files whose cases do not tamper with the install, listed in Lead 4. The cases that test install-time behaviour keep their own install. Expected effect (structural): the c0 pair alone drops about 31 setups, roughly 15 minutes and about 3 GB of retained heap.
- Size: L. A support API change and about 12 heavy files.
- Risk: none for the Product. Each changed lane's proof claim must state that the install is shared; a case that checks installed bytes unchanged still checks them.
- Change class: realization_refactor
- Confidence: the cost is verified (measured); which cases can share an install is likely (inferred from the setup options), to be settled per file.
- Related: fixed shared output paths block running files in parallel. `T/artifacts` is written by r1 (`rm -rf`), `single-address-space` and `t287-w2-05-generator-package-reproducibility`; `test_env/evidence` is written by eight lanes. With these moved to per-run scratch (TS-12), `--test-concurrency>1` becomes possible. Structural; not measured.

### TS-12: Delete output and residue trees nothing reads; stop lanes writing unread evidence
- Category: repository
- Evidence: the Lead 6 table.
  - `test_env/downstream` (50 MB): ignored `build/` and `node_modules/` of a fixture whose source was deleted at `9d442b4c8` (2026-07-21). Nothing reads it.
  - `test_env/evidence` (35 MB): written by r1 to r3, r5 to r8 and w2-05 at fixed names (`r1-packed-artifact.test.mjs:103-106`, `r5-invocation-admission.test.mjs:515-518`). Nothing reads it.
  - The 20 July roots in `test_env/test_runs` (about 1.8 GB) have no writer at head.
  - `test_env/proof`: four tracked files that no test reads. TD-19 already owns their retention; cite it, do not re-register it.
  - `falsifiers/`: in use; its name is misleading.
- Retire:
  - The `downstream` tree and the July `test_runs` roots, which are local deletions of ignored residue.
  - The evidence writes in the eight lanes. Use `t.diagnostic`, or the test-output owner from TS-06 when a record is wanted.
  - Optionally, move `falsifiers/` into `support/workers/`.
- Size: S
- Risk: none for the ignored trees. Moving `falsifiers/` touches qualification mirrors (inventory members).
- Change class: realization_refactor
- Confidence: verified (reads and writers by `rg`; tracking state by `git status --ignored`).

### TS-13: Replace the milestone npm script table with tiered entries
- Category: test debt
- Evidence: `package.json` scripts (`npm-scripts.json`).
  - `test:r1` to `test:r9` are cumulative chains, `test:m4` is a superset of `test:r9`, and the eleven `test:m5:*` entries each run a build plus one file.
  - There is no entry for the whole suite; the hand command lives only in records.
  - `npm test` runs 9 files plus the UAT harness.
  - `npm run lint` passes no recipe path to `lint-verification.mjs:9` and throws.
  - Seven design notes cite npm scripts that no longer exist (`test:semantic`, `test:live`, `test:t1xx`), for example `design/M05_RC_LIVE_UAT_DERIVATION.md` and `GTL_TIME_ALGEBRA_FIRST_PROOF_PLAN.md`. That belongs to the design area.
- Retire: the 21 milestone entries. In their place: `test:unit` (no install), `test:installed`, `test:gated` (sets the evidence root), `test:live`, and `test:all` (the hand command with the root set). `lint` passes the recipe path.
- Size: S
- Risk: none. Nothing in the recipe cites these entries.
- Change class: realization_refactor
- Confidence: verified.

### TS-14: Generate the qualification inventory and recipe at the cut instead of editing them by hand
- Category: test debt
- Evidence:
  - `test_env/qualification/inventory.json` (2026-10-29) is missing 24 current test files, added between 2026-10-30 and 2026-11-11 (the RC12 ten, the rp2 five, `t287-governed-context`, `t287-framework-handoff-types`, `t287-single-address-space-consolidation` and others).
  - It is also missing 11 support modules, including `c0-post-publication-failure.mjs`, `single-address-space-consolidation.mjs` and `amendment-witness*.mjs`.
  - The recipe's test vector names 45 files, 43 of them current, against 220 current `.test.mjs` files. Its lint list is 72 files.
  - Every member is pinned by digest, so any test edit stales it. The RC12 M Return lists the member refreshes each split needs.
  - The recipe sets no environment variable, so its vector cannot reach class A gates or HS03 (inferred from the recipe JSON having no `ABI5_` names).
- Retire: the hand-maintained member lists. Generate the inventory, the test vector and the lint list from the lane manifest (TS-16) and the gate catalogue (TS-06) at the cut, and compare them with the committed copy.
- Size: M
- Risk: qualification mirrors. These files are the mirror.
- Change class: realization_refactor (design_reframe only if the recipe's member model changes)
- Confidence: verified (counts by script).

### TS-15: One maintained cut procedure in the tenant, parameterized by version
- Category: repository
- Evidence:
  - Cut tooling is copied per candidate: `rc8-local-cut-01` (with two `run-local-cut.corrected-00N.mjs` variants), `rc9-local-cut-01`, `rc10-local-cut-01` and `rc12-executive-01/cut/` (836 lines).
  - Version constants are hard-coded (`cut-common.mjs:12-13`), and the four stamp sites are code (`stamp-rc12.mjs:16-33`).
  - The candidate basis refresh, the qualification member refresh and r1 to r3 are separate hand steps (RC12 K and X Returns).
- Retire: the per-candidate copies, as the source of future cuts; the copies stay as records. A maintained `T/scripts/cut/` would need:
  - `--from` and `--to` version arguments;
  - the stamp sites as data, with each site's parse check;
  - the generated-file rebuild;
  - `refresh-candidate-basis`, then r1 to r3 against the written basis (TS-05);
  - the inventory and recipe regeneration (TS-14);
  - pack, `exact-artifact-correspondence`, install and `installed-owner-smoke`;
  - the create-once writes and dry-run mode `cut-common.mjs` already has.
- Size: M, about 900 lines consolidated from four copies.
- Risk: manifest or digest pins. The cut writes the product manifest and basis.
- Change class: realization_refactor
- Confidence: verified (copies and constants read). Whether the rc8 to rc10 copies differ in substance was not diffed.

### TS-16: Organise the lanes by owner and cost tier through one lane manifest
- Category: test debt
- Evidence:
  - 190 of 225 files are in no npm script.
  - The names are tickets or milestones: 161 `t287-`, plus `m5-`, `d2-`, `r1-` to `r10-`, `w2-` and `t288-`.
  - `test_env/README.md:3-6` already states that a test's purpose follows its owning contract, not its ticket name.
  - Package acceptances repeatedly select "N lanes identical before and after" by hand (22, 28, 49, 101, 140 lanes in the register's completion record).
- Retire: name-based selection. One `test_env/lanes.json` gives, per file, its owners (for example `abg/event_store`, `abg/calculus`, `product/verify_product`, `hog/default-library`, `gtl`, `public/cli`), its tier (unit, installed, gated with a gate-catalogue row, live) and its expected cost.

  With that manifest the runner can:
  - select the lanes affected by a changed owner;
  - run unit lanes in parallel and installed lanes once per install;
  - set the gates per tier;
  - generate the qualification vector from it (TS-14).

  File renames are optional and can follow later.
- Size: L. A design of the manifest plus classification of 225 files.
- Risk: qualification mirrors, only if files are renamed. The manifest alone changes no member.
- Change class: realization_refactor
- Confidence: likely. The value is inferred from the register's practice.

## Named checks on test support code

1. **Dead declarations:** the census does not cover test code. My export-use scan of `test_env/support` (74 modules) found 7 exports used nowhere and 31 used only in their own module (TS-07). `support-unreferenced.json` and `fixtures-unreferenced.json` are empty. They count basename mentions, not imports. Five modules under `tests/` have no runner (TS-07).
2. **Compiler-unused:** not applicable. The test side is `.mjs`, `tsc` does not compile it, and `compiler-unused.json` has no rows in my area.
3. **Kinds handled but never produced, and produced but never read:** none in my area. The kinds census records test-side mentions only as `testFiles` counts for source kinds, and it records no kind as declared by test code.
4. **Second owners:** TS-08, TS-09 and TS-10.
5. **Failed or superseded features:** TS-01 (the exact014 claim), TS-07 (proof scripts with no runner) and TS-12 (the downstream T132 residue). The single-address-space consolidation is finished, not failed.
6. **Structure:** `support/root-installed-environment.mjs` (1,151 lines) holds four setup phases plus publication helpers. It blocks TS-11 only through the store-and-install bundling at `:591-626`. `falsifiers/runtime-f09-worker.mjs` is 128 KB; it is not registered here.
7. **Performance:** TS-11 (measured), the parallelism blockers inside TS-11 (structural), and TS-04 (investigate).

## Coverage

Generated by script (scratch `coverage.py`): one row for every file in `test_env/tests` (225), `test_env/support` (74) and `scripts` (12), then one row per subtree. "census + grep" means the file was covered by its census row and by my scripted scans: skip attribution, installer calls, the test-side clone hash, inventory membership and export use. It was not read line by line. "TS-06 (A/B/C/D)" gives the gate classes observed in the suite; "labelled input" marks the class C subgroup that cites inputs by label (Lead 2). "TS-14 (not in inventory)" means the file is absent from `test_env/qualification/inventory.json`.

| File | Lines | How read | Findings |
|---|---|---|---|
| `test_env/tests/a5-f02-canonical-gtl-identity.test.mjs` | 936 | census + grep | none |
| `test_env/tests/d1-preserved-result-mechanics.test.mjs` | 73 | census + grep | TS-06 (A) |
| `test_env/tests/d2-acknowledgment.test.mjs` | 88 | census + grep | TS-06 (A) |
| `test_env/tests/d2-binding-query-reuse.test.mjs` | 127 | census + grep | none |
| `test_env/tests/d2-binding-transition.test.mjs` | 337 | census + grep | TS-06 (A) |
| `test_env/tests/d2-bounded-repair.test.mjs` | 69 | census + grep | TS-06 (A) |
| `test_env/tests/d2-evidence-owner-lookup.test.mjs` | 49 | census + grep | TS-06 (A) |
| `test_env/tests/d2-frame-installed.mjs` | 725 | targeted read | TS-07; TS-09 |
| `test_env/tests/d2-historical-design.test.mjs` | 95 | census + grep | TS-06 (A) |
| `test_env/tests/d2-workflow-step.test.mjs` | 114 | census + grep | TS-06 (A) |
| `test_env/tests/forward-command-contracts.test.mjs` | 163 | census + grep | none |
| `test_env/tests/forward-command-owners.test.mjs` | 72 | census + grep | none |
| `test_env/tests/generic-input-retention.test.mjs` | 180 | census + grep | none |
| `test_env/tests/hello-product-boundary.test.mjs` | 58 | census + grep | none |
| `test_env/tests/hog-operator-support.test.mjs` | 168 | census + grep | none |
| `test_env/tests/installed-language-smoke.test.mjs` | 27 | census + grep | none |
| `test_env/tests/integration-shared-seams.test.mjs` | 45 | census + grep | TS-06 (A) |
| `test_env/tests/m5-c-algebra-validation.test.mjs` | 1494 | census + grep | TS-06 (C); TS-13 |
| `test_env/tests/m5-consensus-module.test.mjs` | 2203 | targeted read | TS-13 |
| `test_env/tests/m5-event-calculus-runtime.test.mjs` | 2000 | census + grep | TS-06 (C); TS-11; TS-13 |
| `test_env/tests/m5-event-store-reopen.test.mjs` | 2114 | census + grep | TS-06 (A); TS-13 |
| `test_env/tests/m5-fresh-process-reconstruction.test.mjs` | 106 | census + grep | TS-13 |
| `test_env/tests/m5-installed-graph-edge.test.mjs` | 179 | census + grep | TS-13 |
| `test_env/tests/m5-installed-portability.test.mjs` | 492 | census + grep | TS-13 |
| `test_env/tests/m5-retry-lifecycle-authority.test.mjs` | 577 | census + grep | TS-13 |
| `test_env/tests/m5-s03-authority.test.mjs` | 578 | census + grep | TS-13 |
| `test_env/tests/m5-s06-prime.test.mjs` | 2006 | census + grep | TS-13 |
| `test_env/tests/m5-terminal-quiescence-owner.test.mjs` | 228 | census + grep | TS-13 |
| `test_env/tests/m5-worker-transport.test.mjs` | 2319 | census + grep | TS-13 |
| `test_env/tests/r1-packed-artifact.test.mjs` | 135 | targeted read | TS-05; TS-12; TS-13 |
| `test_env/tests/r10-child-proof.test.mjs` | 185 | census + grep | TS-06 (A) |
| `test_env/tests/r10-fresh-imports.mjs` | 11 | targeted read | TS-07 |
| `test_env/tests/r10-projection-contracts.test.mjs` | 205 | census + grep | TS-06 (A) |
| `test_env/tests/r10-retained-child-projection.mjs` | 70 | targeted read | TS-07 |
| `test_env/tests/r10-retained-hello-projection.mjs` | 47 | targeted read | TS-07 |
| `test_env/tests/r2-clean-install.test.mjs` | 148 | census + grep | TS-05; TS-12; TS-13 |
| `test_env/tests/r3-workspace-binding.test.mjs` | 639 | census + grep | TS-05; TS-12; TS-13 |
| `test_env/tests/r4-catalog-admission.test.mjs` | 508 | census + grep | TS-13 |
| `test_env/tests/r5-invocation-admission.test.mjs` | 804 | census + grep | TS-12; TS-13 |
| `test_env/tests/r6-implementation-resolution.test.mjs` | 218 | census + grep | TS-12; TS-13 |
| `test_env/tests/r7-graph-validation-basis.test.mjs` | 348 | census + grep | TS-12; TS-13 |
| `test_env/tests/r8-direct-hog-entry.test.mjs` | 226 | census + grep | TS-12; TS-13 |
| `test_env/tests/r9-causal-result-closure.test.mjs` | 282 | census + grep | TS-13 |
| `test_env/tests/rc2-assessment-intake.test.mjs` | 75 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/retained-route-cursor-transition.test.mjs` | 165 | census + grep | none |
| `test_env/tests/rival-authority-mutations.test.mjs` | 153 | census + grep | none |
| `test_env/tests/runtime-scope-regressions.test.mjs` | 88 | census + grep | none |
| `test_env/tests/steel-basic-cli-c2.test.mjs` | 147 | census + grep | TS-06 (C) |
| `test_env/tests/steel-basic-cli-projection.test.mjs` | 201 | census + grep | TS-06 (C) |
| `test_env/tests/steel-basic-cli-public.test.mjs` | 854 | census + grep | TS-09 |
| `test_env/tests/steel-basic-cli-source-replay.test.mjs` | 224 | census + grep | TS-06 (C) |
| `test_env/tests/steel-consumer-authority.test.mjs` | 39 | census + grep | TS-06 (C) |
| `test_env/tests/steel-consumer-declaration.test.mjs` | 632 | census + grep | TS-06 (C); TS-09 |
| `test_env/tests/t287-amendment-witness.test.mjs` | 456 | targeted read | TS-06 (B); TS-11; TS-14 (not in inventory) |
| `test_env/tests/t287-authenticated-owner-family.test.mjs` | 53 | census + grep | TS-06 (C) |
| `test_env/tests/t287-authenticated-owner-values.test.mjs` | 150 | census + grep | TS-06 (C) |
| `test_env/tests/t287-c0-correction-regressions.test.mjs` | 125 | census + grep | none |
| `test_env/tests/t287-c0-post-publication-failure-owner-admission-close.test.mjs` | 24 | census + grep | TS-11; TS-14 (not in inventory) |
| `test_env/tests/t287-c0-post-publication-failure.test.mjs` | 25 | census + grep | TS-11 |
| `test_env/tests/t287-c2-child-program.test.mjs` | 88 | census + grep | none |
| `test_env/tests/t287-c2-core-environment.test.mjs` | 223 | census + grep | none |
| `test_env/tests/t287-c2a-fp-source-contract.test.mjs` | 426 | census + grep | none |
| `test_env/tests/t287-calculus-fold.test.mjs` | 1846 | targeted read | TS-01 |
| `test_env/tests/t287-calculus-state-transfer.test.mjs` | 106 | census + grep | none |
| `test_env/tests/t287-cold-record-decoder.test.mjs` | 113 | census + grep | TS-06 (B) |
| `test_env/tests/t287-common-computational-library.test.mjs` | 467 | census + grep | none |
| `test_env/tests/t287-conformance-owner-reuse.test.mjs` | 448 | census + grep | TS-06 (C) |
| `test_env/tests/t287-consensus-ref-shape.test.mjs` | 115 | census + grep | none |
| `test_env/tests/t287-continuation-causation.test.mjs` | 115 | census + grep | TS-06 (A) |
| `test_env/tests/t287-cross-cut-public-read.test.mjs` | 210 | census + grep | TS-06 (A) |
| `test_env/tests/t287-d1-requirement-handoff.test.mjs` | 1161 | census + grep | TS-06 (C); TS-09 |
| `test_env/tests/t287-d1-semantic-stage.test.mjs` | 258 | census + grep | TS-06 (C) |
| `test_env/tests/t287-d5-authentic-preserved-result.test.mjs` | 187 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-declaration-closure-symbol-reuse.test.mjs` | 30 | census + grep | TS-06 (C) |
| `test_env/tests/t287-declared-testing-capability.test.mjs` | 326 | census + grep | TS-06 (BC, labelled input) |
| `test_env/tests/t287-default-library-fulfillment.test.mjs` | 275 | census + grep | none |
| `test_env/tests/t287-default-library-prerequisites.test.mjs` | 225 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-default-library-recoverable-failure.test.mjs` | 199 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-default-library-reviews.test.mjs` | 507 | targeted read | TS-11; TS-14 (not in inventory) |
| `test_env/tests/t287-default-library.test.mjs` | 2851 | census + grep | TS-06 (BC); TS-11 |
| `test_env/tests/t287-deferred-application-restoration.test.mjs` | 137 | census + grep | TS-06 (C) |
| `test_env/tests/t287-environment-projection-conservation.test.mjs` | 48 | census + grep | TS-06 (C) |
| `test_env/tests/t287-event-body-encoding.test.mjs` | 1306 | census + grep | TS-06 (C) |
| `test_env/tests/t287-event-calculus-owner-continuation.test.mjs` | 235 | census + grep | TS-06 (C) |
| `test_env/tests/t287-exact-construction-intent.test.mjs` | 214 | census + grep | none |
| `test_env/tests/t287-exact-prefix-projection-reuse.test.mjs` | 226 | census + grep | TS-06 (C) |
| `test_env/tests/t287-f04a-probabilistic-result-candidate.test.mjs` | 1203 | census + grep | none |
| `test_env/tests/t287-f09-frontier-handoff.test.mjs` | 13 | census + grep | none |
| `test_env/tests/t287-framework-handoff-types.test.mjs` | 366 | targeted read | TS-01; TS-14 (not in inventory) |
| `test_env/tests/t287-generic-job-intake.test.mjs` | 83 | census + grep | TS-06 (C) |
| `test_env/tests/t287-generic-job-lifecycle.test.mjs` | 84 | census + grep | TS-06 (B) |
| `test_env/tests/t287-generic-job-meaning.test.mjs` | 292 | census + grep | TS-06 (C) |
| `test_env/tests/t287-generic-job-parent-audit.test.mjs` | 9 | census + grep | TS-06 (C) |
| `test_env/tests/t287-generic-job-parent-foldback.test.mjs` | 128 | census + grep | TS-06 (C) |
| `test_env/tests/t287-generic-job-read-dependency.test.mjs` | 162 | census + grep | TS-06 (C) |
| `test_env/tests/t287-generic-job-revision.test.mjs` | 331 | census + grep | TS-06 (BD) |
| `test_env/tests/t287-generic-job-worksite.test.mjs` | 213 | census + grep | none |
| `test_env/tests/t287-governance-covered-source-use.test.mjs` | 467 | census + grep | TS-06 (C, labelled input, recorded path present) |
| `test_env/tests/t287-governed-context.test.mjs` | 1036 | targeted read | TS-03; TS-14 (not in inventory) |
| `test_env/tests/t287-gtl-graph-law.test.mjs` | 210 | census + grep | none |
| `test_env/tests/t287-gtl-language-corpus.test.mjs` | 66 | census + grep | none |
| `test_env/tests/t287-gtl-serialization-publication.test.mjs` | 397 | census + grep | none |
| `test_env/tests/t287-held-basis-lifetime.test.mjs` | 198 | census + grep | TS-06 (B); TS-14 (not in inventory) |
| `test_env/tests/t287-held-owner-fold-reuse.test.mjs` | 241 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-held-prefix.test.mjs` | 268 | census + grep | TS-06 (C) |
| `test_env/tests/t287-historical-source-resource.test.mjs` | 173 | census + grep | TS-06 (A) |
| `test_env/tests/t287-installed-dependency-lock.test.mjs` | 221 | census + grep | TS-06 (C) |
| `test_env/tests/t287-installed-product-coordinate.test.mjs` | 188 | census + grep | none |
| `test_env/tests/t287-installed-qualification-conservation.test.mjs` | 374 | census + grep | TS-06 (C) |
| `test_env/tests/t287-interrupted-event-resource-recovery.test.mjs` | 243 | census + grep | none |
| `test_env/tests/t287-json-value-definition.test.mjs` | 22 | census + grep | none |
| `test_env/tests/t287-lifecycle-failure-carrier.test.mjs` | 702 | census + grep | none |
| `test_env/tests/t287-live-worksite-construction.test.mjs` | 292 | census + grep | TS-06 (B) |
| `test_env/tests/t287-liveness-heartbeat.test.mjs` | 173 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-liveness-inactivity.test.mjs` | 143 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-malformed-gtl-gate.test.mjs` | 154 | census + grep | none |
| `test_env/tests/t287-management-context.test.mjs` | 453 | census + grep | TS-06 (BC) |
| `test_env/tests/t287-management-stream-drain.test.mjs` | 245 | census + grep | TS-06 (C) |
| `test_env/tests/t287-management-supervision.test.mjs` | 197 | census + grep | none |
| `test_env/tests/t287-multi-candidate-admission.test.mjs` | 185 | census + grep | none |
| `test_env/tests/t287-native-assembly-retained-input.test.mjs` | 148 | census + grep | TS-06 (C) |
| `test_env/tests/t287-native-assessment-evidence.test.mjs` | 133 | census + grep | none |
| `test_env/tests/t287-native-c2-instruction-assembly.test.mjs` | 121 | census + grep | none |
| `test_env/tests/t287-native-event-time.test.mjs` | 180 | census + grep | TS-06 (C) |
| `test_env/tests/t287-native-frame-observation.test.mjs` | 330 | census + grep | TS-06 (C) |
| `test_env/tests/t287-native-owner-reuse.test.mjs` | 130 | census + grep | TS-06 (C) |
| `test_env/tests/t287-native-registered-selection.test.mjs` | 152 | census + grep | TS-06 (B) |
| `test_env/tests/t287-native-runtime-gate.test.mjs` | 159 | census + grep | TS-06 (C) |
| `test_env/tests/t287-native-selection-profile-scope.test.mjs` | 67 | census + grep | none |
| `test_env/tests/t287-native-semantic-evidence.test.mjs` | 64 | census + grep | TS-06 (C) |
| `test_env/tests/t287-native-semantic-job.test.mjs` | 379 | census + grep | none |
| `test_env/tests/t287-native-semantic-revision.test.mjs` | 577 | census + grep | TS-06 (A) |
| `test_env/tests/t287-native-structural-gates.test.mjs` | 139 | census + grep | none |
| `test_env/tests/t287-native-work-currentness-consumers.test.mjs` | 1455 | census + grep | none |
| `test_env/tests/t287-native-work-reacquisition-normalization.test.mjs` | 49 | census + grep | TS-06 (C) |
| `test_env/tests/t287-native-work-reacquisition.test.mjs` | 449 | census + grep | TS-06 (C) |
| `test_env/tests/t287-native-work-unknown-effect.test.mjs` | 161 | census + grep | none |
| `test_env/tests/t287-native-worksite-execution.test.mjs` | 446 | census + grep | TS-06 (C) |
| `test_env/tests/t287-native-workspace-work.test.mjs` | 1266 | census + grep | TS-06 (C) |
| `test_env/tests/t287-observed-worksite-command.test.mjs` | 334 | census + grep | none |
| `test_env/tests/t287-ordered-reconstruction.test.mjs` | 479 | census + grep | TS-06 (BC) |
| `test_env/tests/t287-owned-call-reference.test.mjs` | 245 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-owned-native-proof.test.mjs` | 142 | census + grep | TS-06 (C) |
| `test_env/tests/t287-owned-process-lifetime.test.mjs` | 1322 | census + grep | none |
| `test_env/tests/t287-pfc-f08a-product-verification-boundary.test.mjs` | 720 | census + grep | none |
| `test_env/tests/t287-post-binding-worksite-write.test.mjs` | 1547 | census + grep | none |
| `test_env/tests/t287-predecessor-context.test.mjs` | 70 | census + grep | TS-06 (C, labelled input) |
| `test_env/tests/t287-public-groups.test.mjs` | 135 | census + grep | none |
| `test_env/tests/t287-public-preparation.test.mjs` | 325 | census + grep | none |
| `test_env/tests/t287-public-terminal-projection.test.mjs` | 100 | census + grep | TS-06 (C) |
| `test_env/tests/t287-publication-observer.test.mjs` | 147 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-qual056-material.test.mjs` | 235 | census + grep | none |
| `test_env/tests/t287-qualification-carrier-resource.test.mjs` | 144 | census + grep | TS-06 (C) |
| `test_env/tests/t287-qualification-contraction.test.mjs` | 122 | census + grep | none |
| `test_env/tests/t287-qualification-fp-proof-delivery.test.mjs` | 153 | census + grep | TS-06 (C) |
| `test_env/tests/t287-qualification-law.test.mjs` | 345 | census + grep | TS-06 (C) |
| `test_env/tests/t287-qualification-parent-alias.test.mjs` | 238 | census + grep | TS-06 (C) |
| `test_env/tests/t287-qualification-producer-acquisition-reuse.test.mjs` | 207 | census + grep | TS-06 (C) |
| `test_env/tests/t287-qualification-producer-context.test.mjs` | 69 | census + grep | none |
| `test_env/tests/t287-qualification-raw-contract-preimage.test.mjs` | 116 | census + grep | TS-06 (C) |
| `test_env/tests/t287-qualification-scopes.test.mjs` | 850 | census + grep | none |
| `test_env/tests/t287-r4-aba-retry.test.mjs` | 13 | census + grep | none |
| `test_env/tests/t287-r6-retry-success-exit.test.mjs` | 313 | census + grep | none |
| `test_env/tests/t287-reacquisition-root-contract.test.mjs` | 73 | census + grep | TS-06 (C) |
| `test_env/tests/t287-readable-stops-foldback.test.mjs` | 203 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-readable-stops.test.mjs` | 237 | census + grep | TS-11; TS-14 (not in inventory) |
| `test_env/tests/t287-reconstruction-conservation.test.mjs` | 80 | census + grep | TS-06 (C) |
| `test_env/tests/t287-recursive-failure-foldback.test.mjs` | 310 | census + grep | TS-11; TS-14 (not in inventory) |
| `test_env/tests/t287-recursive-registered-selection.test.mjs` | 606 | census + grep | TS-06 (B); TS-11 |
| `test_env/tests/t287-registered-graph-selection.test.mjs` | 144 | census + grep | none |
| `test_env/tests/t287-release-acceptance.test.mjs` | 162 | census + grep | none |
| `test_env/tests/t287-release-publication.test.mjs` | 126 | census + grep | TS-06 (C) |
| `test_env/tests/t287-required-operation-bindings.test.mjs` | 539 | census + grep | none |
| `test_env/tests/t287-result-evidence-lineage-projection.test.mjs` | 303 | census + grep | none |
| `test_env/tests/t287-result-evidence-lineage-type-contract.test.mjs` | 112 | census + grep | none |
| `test_env/tests/t287-retained-installed-consumer.test.mjs` | 203 | census + grep | TS-06 (C) |
| `test_env/tests/t287-retry-run-prefix.test.mjs` | 314 | census + grep | none |
| `test_env/tests/t287-route-reconstruction.test.mjs` | 900 | targeted read | TS-02; TS-06 (C) |
| `test_env/tests/t287-rp2-behavior-carriers.test.mjs` | 89 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-rp2-correction-carriers.test.mjs` | 52 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-rp2-fibre-substitution.test.mjs` | 64 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-rp2-material-selection.test.mjs` | 41 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-rp2-resource-memo.test.mjs` | 42 | census + grep | TS-14 (not in inventory) |
| `test_env/tests/t287-runtime-activity-quiescence.test.mjs` | 32 | census + grep | none |
| `test_env/tests/t287-runtime-failure-diagnostic.test.mjs` | 1013 | census + grep | none |
| `test_env/tests/t287-s03-automatic.test.mjs` | 17 | census + grep | TS-06 (C) |
| `test_env/tests/t287-select-family.test.mjs` | 143 | census + grep | none |
| `test_env/tests/t287-selected-action-authority.test.mjs` | 73 | census + grep | TS-06 (C) |
| `test_env/tests/t287-selected-action.test.mjs` | 251 | census + grep | TS-06 (C) |
| `test_env/tests/t287-selected-execution-closure.test.mjs` | 207 | census + grep | TS-06 (C) |
| `test_env/tests/t287-single-address-space-consolidation.test.mjs` | 1368 | targeted read | TS-01; TS-14 (not in inventory) |
| `test_env/tests/t287-st1-installed-cross-owner-hello.test.mjs` | 2348 | census + grep | none |
| `test_env/tests/t287-st2a-e-exact-prefix-workspace-environment.test.mjs` | 237 | census + grep | none |
| `test_env/tests/t287-st2a-g-capability-definition-graph.test.mjs` | 496 | census + grep | none |
| `test_env/tests/t287-static-declaration-closure.test.mjs` | 270 | census + grep | TS-06 (D, labelled input) |
| `test_env/tests/t287-stdo-environment-citation.test.mjs` | 131 | census + grep | TS-06 (C, labelled input) |
| `test_env/tests/t287-stdo-proof-entry.test.mjs` | 81 | census + grep | TS-06 (C) |
| `test_env/tests/t287-stdo-run-environment-installed.mjs` | 767 | targeted read | TS-07; TS-09 |
| `test_env/tests/t287-stdo-run-environment.test.mjs` | 134 | census + grep | TS-06 (C, labelled input) |
| `test_env/tests/t287-stdo3-run-environment.test.mjs` | 211 | census + grep | none |
| `test_env/tests/t287-tv5-rooted-topology-partition.test.mjs` | 200 | census + grep | none |
| `test_env/tests/t287-undispatched-diagnostic.test.mjs` | 345 | census + grep | none |
| `test_env/tests/t287-value-equality.test.mjs` | 242 | census + grep | none |
| `test_env/tests/t287-w2-05-generator-package-reproducibility.test.mjs` | 402 | census + grep | TS-12 |
| `test_env/tests/t287-w2-05-install-catalog-owner-chain.test.mjs` | 1651 | census + grep | TS-09 |
| `test_env/tests/t287-w2-05-release-snapshot-definition-bindings.test.mjs` | 144 | census + grep | none |
| `test_env/tests/t287-w2-05-static-binding-algebra.test.mjs` | 914 | census + grep | TS-06 (C) |
| `test_env/tests/t287-wave2-definition-coordinate.test.mjs` | 60 | census + grep | none |
| `test_env/tests/t287-wave2-installed-product-verification.test.mjs` | 150 | census + grep | none |
| `test_env/tests/t287-wave2-owner-chain.test.mjs` | 142 | census + grep | none |
| `test_env/tests/t287-wave2-owner-contract-source-set.test.mjs` | 1100 | census + grep | none |
| `test_env/tests/t287-worksite-branch-construction.test.mjs` | 778 | census + grep | none |
| `test_env/tests/t287-worksite-command-execution.test.mjs` | 1643 | targeted read | TS-11 |
| `test_env/tests/t287-worksite-construction.test.mjs` | 1015 | census + grep | none |
| `test_env/tests/t288-initial-cursor-entry.test.mjs` | 36 | census + grep | none |
| `test_env/tests/t288-instruction-assembly-owner.test.mjs` | 509 | census + grep | TS-06 (C) |
| `test_env/tests/t288-logical-prefix-digest.test.mjs` | 64 | census + grep | TS-06 (C) |
| `test_env/tests/t289-install-event-bodies.test.mjs` | 497 | census + grep | none |
| `test_env/tests/t291-m6-admission-refusal-surface.test.mjs` | 69 | census + grep | none |
| `test_env/tests/w2-steel-serial-branch-installed.test.mjs` | 735 | census + grep | TS-06 (C); TS-09 |
| `test_env/tests/w2-steel-single-start-closure.test.mjs` | 583 | census + grep | TS-06 (C) |
| `test_env/tests/w2-steel-single-start-installed.test.mjs` | 609 | targeted read | TS-06 (C); TS-09 |
| `test_env/tests/w2-steel-single-start.test.mjs` | 172 | census + grep | TS-06 (C) |
| `test_env/tests/witness-reprice-definition-binding.test.mjs` | 259 | targeted read | TS-04 |
| `test_env/tests/witness-run-stopped-definition-binding.test.mjs` | 125 | census + grep | none |
| `test_env/support/admitted-graph-execution.mjs` | 39 | census + grep | none |
| `test_env/support/amendment-witness-actor.mjs` | 138 | census + grep | TS-14 (not in inventory) |
| `test_env/support/amendment-witness-run.mjs` | 69 | targeted read | TS-11; TS-14 (not in inventory) |
| `test_env/support/amendment-witness.mjs` | 188 | census + grep | TS-14 (not in inventory) |
| `test_env/support/c0-post-publication-failure.mjs` | 728 | targeted read | TS-11; TS-14 (not in inventory) |
| `test_env/support/candidate-basis.mjs` | 35 | full read | TS-05 |
| `test_env/support/d1-preserved-result-harness.mjs` | 55 | census + grep | none |
| `test_env/support/d2-binding-harness.mjs` | 248 | census + grep | none |
| `test_env/support/d2-bounded-harness.mjs` | 104 | census + grep | none |
| `test_env/support/d2-evidence-owner-harness.mjs` | 116 | census + grep | none |
| `test_env/support/d2-frame-fixture.mjs` | 369 | census + grep | TS-08 |
| `test_env/support/d2-historical-design-harness.mjs` | 96 | census + grep | none |
| `test_env/support/d2-static-smoke.mjs` | 120 | census + grep | none |
| `test_env/support/d2-workflow-step-harness.mjs` | 117 | census + grep | none |
| `test_env/support/d5-authentic-preserved-result-fixture.mjs` | 551 | census + grep | TS-08; TS-14 (not in inventory) |
| `test_env/support/declared-testing-capability.mjs` | 568 | census + grep | TS-08 |
| `test_env/support/default-library-fulfillment.mjs` | 65 | census + grep | none |
| `test_env/support/default-library.mjs` | 70 | census + grep | none |
| `test_env/support/developer-mini-product.mjs` | 385 | census + grep | TS-08 |
| `test_env/support/evidence-root.mjs` | 34 | census + grep | TS-06 (owner) |
| `test_env/support/exact-candidate-qualification.mjs` | 898 | census + grep | none |
| `test_env/support/flavored-catalog-product.mjs` | 393 | census + grep | TS-08 |
| `test_env/support/forward-command-harness.mjs` | 41 | census + grep | none |
| `test_env/support/forward-observation-carrier.mjs` | 49 | census + grep | none |
| `test_env/support/forward-owner-lookups.mjs` | 122 | census + grep | none |
| `test_env/support/fresh-process-runtime-proof.mjs` | 239 | census + grep | none |
| `test_env/support/installed-language-test.mjs` | 64 | census + grep | none |
| `test_env/support/installed-public-definition-call.mjs` | 4 | census + grep | TS-09 (owner re-export) |
| `test_env/support/installed-qualification-conservation.mjs` | 477 | census + grep | TS-07 (export) |
| `test_env/support/isolated-compiled-copy.mjs` | 17 | census + grep | none |
| `test_env/support/language-smoke-fixture.mjs` | 78 | census + grep | TS-08 |
| `test_env/support/language-structural-fixture.mjs` | 77 | census + grep | TS-08 |
| `test_env/support/language-structural-gtl.mjs` | 7 | census + grep | none |
| `test_env/support/language-test-gtl.mjs` | 9 | census + grep | none |
| `test_env/support/malformed-gtl-native-fixture.mjs` | 277 | census + grep | none |
| `test_env/support/multi-candidate-admission-owner.mjs` | 386 | census + grep | none |
| `test_env/support/native-runtime-structural-cases.mjs` | 34 | census + grep | none |
| `test_env/support/neutral-schema-product.mjs` | 516 | census + grep | TS-08 |
| `test_env/support/new-empty-append-sink.mjs` | 276 | census + grep | none |
| `test_env/support/owned-call-reference.mjs` | 28 | census + grep | TS-14 (not in inventory) |
| `test_env/support/r10-private-owner-harness.mjs` | 24 | census + grep | none |
| `test_env/support/registered-graph-selection.mjs` | 456 | census + grep | TS-08 |
| `test_env/support/retained-installed-consumer.mjs` | 164 | census + grep | none |
| `test_env/support/root-cli-environment.mjs` | 288 | targeted read | TS-07 (export); TS-08 |
| `test_env/support/root-installed-environment.mjs` | 1152 | targeted read | TS-08; TS-11 |
| `test_env/support/run-exact-candidate-qualification.sh` | 5 | census + grep | TS-14 (not in inventory) |
| `test_env/support/serial-branch-worksite-program.mjs` | 573 | census + grep | TS-07 (export); TS-08 |
| `test_env/support/single-address-space-consolidation.mjs` | 355 | targeted read | TS-01; TS-14 (not in inventory) |
| `test_env/support/single-start-worksite-program.mjs` | 431 | census + grep | TS-07 (export); TS-08 |
| `test_env/support/stdo-environment-pilot.mjs` | 348 | census + grep | TS-08 |
| `test_env/support/stdo3-run-environment.mjs` | 75 | census + grep | none |
| `test_env/support/stdout-component-fixture.mjs` | 64 | census + grep | TS-14 (not in inventory) |
| `test_env/support/steel-consumer-resolution.mjs` | 34 | census + grep | none |
| `test_env/support/t287-current-owner-evidence.mjs` | 40 | census + grep | TS-14 (not in inventory) |
| `test_env/support/t287-declaration-closure-symbol-reuse.mjs` | 119 | census + grep | TS-07 (export) |
| `test_env/support/t287-entry212-reopen-worker.mjs` | 47 | census + grep | none |
| `test_env/support/t287-exact-prefix-projection-reuse.mjs` | 85 | census + grep | TS-07 (export) |
| `test_env/support/t287-generic-job-intake.mjs` | 243 | census + grep | TS-08 |
| `test_env/support/t287-generic-job-lifecycle.mjs` | 154 | census + grep | none |
| `test_env/support/t287-generic-job-parent-audit.mjs` | 102 | census + grep | none |
| `test_env/support/t287-generic-job-readback.mjs` | 58 | census + grep | none |
| `test_env/support/t287-generic-job-revision.mjs` | 161 | census + grep | none |
| `test_env/support/t287-generic-job-worksite.mjs` | 95 | census + grep | none |
| `test_env/support/t287-governed-context.mjs` | 130 | census + grep | TS-14 (not in inventory) |
| `test_env/support/t287-native-event-time.mjs` | 68 | census + grep | none |
| `test_env/support/t287-native-frame-observation.mjs` | 67 | census + grep | TS-07 (export) |
| `test_env/support/t287-native-work-currentness-consumers.mjs` | 595 | census + grep | none |
| `test_env/support/t287-predecessor-context.mjs` | 68 | census + grep | none |
| `test_env/support/t287-publication-observer.mjs` | 159 | census + grep | TS-14 (not in inventory) |
| `test_env/support/t287-s03-automatic.mjs` | 184 | census + grep | none |
| `test_env/support/t287-selected-action-host.mjs` | 110 | census + grep | none |
| `test_env/support/t287-st3-fresh-process-read-worker.mjs` | 64 | census + grep | none |
| `test_env/support/t287-wave2-owner-chain-worker.mjs` | 128 | census + grep | TS-08 |
| `test_env/support/witness-reprice-mechanics.mjs` | 210 | census + grep | none |
| `scripts/check-calculus-boundary.mjs` | 113 | outline (head, consumers by grep) | none |
| `scripts/check-evidence-mirrors.mjs` | 621 | outline (head, consumers by grep) | none |
| `scripts/check-import-direction.mjs` | 100 | outline (head, consumers by grep) | none |
| `scripts/check-lifecycle-boundary.mjs` | 205 | outline (head, consumers by grep) | none |
| `scripts/clean.mjs` | 17 | full read | none |
| `scripts/generate-product-manifest.mjs` | 1278 | targeted read | none |
| `scripts/generate-qualification-rule-catalog.mjs` | 154 | outline (head, consumers by grep) | none |
| `scripts/lint-verification.mjs` | 31 | full read | TS-13 (npm lint passes no recipe) |
| `scripts/node-test-evidence-reporter.mjs` | 29 | outline (head, consumers by grep) | none |
| `scripts/prepare-retained-setup-binding.mjs` | 119 | outline (head, consumers by grep) | none |
| `scripts/refresh-candidate-basis.mjs` | 50 | full read | TS-05; TS-15 |
| `scripts/sandbox-uat.mjs` | 5 | full read | none |

Subtrees and other files, one row each:

| Subtree | How covered | Findings |
|---|---|---|
| `test_env/uat (10 tracked files; runs/ 110 MB ignored)` | targeted read of public-setup.mjs, runner.mjs, README; runs/ measured | TS-09 (owner), TS-12 (runs/ output) |
| `test_env/downstream (2,905 files, 50 MB, untracked)` | measured; git history; readers by rg | TS-12 (residue) |
| `test_env/falsifiers (5 files)` | readers by rg; sizes | TS-12 (name only) |
| `test_env/proof (4 files)` | readers by rg; one retired-case comment read | TD-19 (existing); TS-12 |
| `test_env/evidence (8 files, 35 MB, ignored)` | writers by rg; sizes | TS-12 |
| `test_env/fixtures (93 files)` | listing, sizes; census fixtures-unreferenced (empty); abi5-root-candidate-basis.json full | TS-05 (basis fixture); otherwise none |
| `test_env/qualification (19 files)` | recipe and inventory parsed by script; module consumers by rg | TS-14 |
| `test_env/types (1 file)` | census only | none |
| `test_env/test_runs (45 GB, 1,310,433 files, ignored)` | measured by du and stat only; not read | TS-12 (July roots) |
| `test_env/README.md, test_env/tsconfig.framework-handoff.json` | README head read; tsconfig census only | none |
| `package.json (scripts)` | full read via npm-scripts.json | TS-13 |
