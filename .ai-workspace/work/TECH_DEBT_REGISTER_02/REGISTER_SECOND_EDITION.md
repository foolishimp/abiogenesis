## Second edition (2026-11-12)

This edition walks the 291 source files and 171,563 lines under `code/src`, together with the tests, scripts, design notes, specification and repository around them, at `main` `002035b8a`. The method is a mechanical census, twelve read-only area reviews, an adversarial refutation pass over the review findings, and a whole-suite coverage run whose results follow this edition. The owner's direction for this wave is consolidation and clean-up before any new feature. On 2026-11-12 the owner authorised the work ("i authorise the work"). The Executive reads that as covering the wave and every entry that needs no decision; each Decision entry, and each Decision part of an Open entry, waits for the owner's word. Entries TD-25 to TD-74 are new, and TD-19 is updated in place.

### Method and limits

**Census.** A script census (`.ai-workspace/work/TECH_DEBT_REGISTER_02/census/`) lists 7,162 declarations spanning 152,973 lines and assigns each a reachability tier. The tiers are corrected for two census faults described below.

| Tier | Meaning | Declaration lines |
|---|---|---|
| runtime | reachable from a `bin` entry, a process entry or a module the runtime loads by path | 144,003 |
| sdk | reachable only through the `./public` SDK export | 1,191 |
| package | reachable only through another package export, usually only by tests | 6,529 |
| none | reachable from no root | 1,250 |

The census also counts 31 compiler-unused names, 2,400 event and value kinds (54 never produced, 23 of those with no test mention; 694 produced and never typed or tested), 225 test files (190 in no npm script) and 360 environment variables read on the test side. Design holds 327 notes, about 102,700 lines: 82 notes (9,682 lines) are mentioned nowhere, 23 cite paths that no longer exist, and 103 were last committed in April. These counts locate candidates; they are not findings by themselves.

**Review coverage.** 290 of the 291 source files appear in an area review's coverage table. The root `code/src/index.ts` appears in none. About 122 files (about 45,000 lines) were read in full, 99 (about 100,000 lines) in part, and 69 (about 28,000 lines) by outline or census only. `hog-shared-bindings` read all 49 of its files in full. The tests review lists 323 test-side files: 5 read in full, 35 targeted or partial, 283 by census, grep or outline.

**Census limits.**
- Root resolution matched named roots by bare name, so a dead declaration that shares a name with a live root looks live (corrected in the tiers above where a reviewer found it; for example `PRODUCT_PROJECT_READ_CONTRACTS`, product-run 6).
- The sdk `./public` export was first counted as package-only; the `sdk` tier corrects this.
- The census program reports a type error (TS2322) at `validator/conformance_operation.ts:325`. `npm run build` on `main` exits 0 (run twice by the Executive on 2026-11-12), so the error exists only inside the census program.
- The environment regex misses keys read through named constants, for example `ABG_TS_FP_TIMEOUT_MS` at `abg/actor_process.ts:714`.
- Namespace imports are not counted as use, aliases look like use, and type-only use is tiered `package` (hog-shared-bindings).
- `suite-skip-reasons.json` is empty because its regex expects TAP skip lines, and `suite-slow-tests.json` lists one file twice (tests-scripts).

**Review limits.**
- `hog-shared-bindings` records its head as `b4b6095df`. That is the head of the `specification_methodology` repository, not of this one; its line references agree with `main`.
- The tests review reads suite facts from a whole-suite run at `82ad6639b`, 48 commits before `main`, in `/private/tmp/abg-rc12-foldback-20261111`; 12 test-side files changed since.
- `design-spec-repo` observed a concurrent build rewriting tracked contracts during its review.
- `performance` measured a built copy at `34aafb2c6` (`/private/tmp/abg-rc12-consensus-20261111`) and the installed `5.0.0-rc.12` candidate, not `main`. A whole-suite run shared the machine (load average 14 to 27 on 16 cores), so its wall-clock times are under load; its CPU-profile milliseconds, counters, bytes and ratios are the figures to rely on.
- Repository sizes differ by source: the census gives `.ai-workspace/comments` 45,600 entries and 33.3 GB, `work` 81,994 entries and 10.7 GB, product code 292 entries and 7.8 MB; `design-spec-repo` gives comments 34.94 GB and work 11.18 GB by `git ls-tree -l` at HEAD. The two methods are not reconciled here.

**What the refutation pass could not check** (`findings/REFUTATION.md`).
- Whether replay re-runs request admission over recorded requests (GV-03's open question; TD-34).
- GV-01's inference that a gate refusal never stops the Run (TD-27).
- `T/test_env/test_runs` (45 GB), AT-04's `test_runs/rp2` statement and the wider `.ai-workspace/work` campaign logs, for claims 1, 15 and 16 (TD-25, TD-26, TD-29).
- Runtime confirmation of the double decode (claim 8; TD-40, TD-51) and of the verification-coordinate cost (claim 20; TD-52); both rest on reading.
- A `graph_function` start run end to end against a supervised Program (claim 14; TD-35).
- Whether any route builds a `WorksiteExecutionTask` subject without `constructWorksiteSubject` (claim 13; TD-37).
- Design notes outside the 18 sampled (claim 17; TD-64).
- Native admission of the witness acts `intake` and `run-resumed`, which no test exercises (claim 2; TD-28).
- The contents of the 75 branch-only commits (TD-73).

**Error patterns the refutation pass found across the reviews.**
1. Users outside the import graph were missed: tests load built modules as namespaces or by dynamic `import()` and call members by property (TD-28, TD-44).
2. Manifest reach was checked against `productRelativeLocators` only, not the 47 `publicContractCatalog` rows (TD-44, TD-47).
3. String-named locators were missed: `nativeTypedLocator` names a symbol by string and throws if it is unexported (TD-30).
4. Uses through valibot `.entries` spreads were missed: a schema that looks dead is read at module load by a live one (TD-31).
5. Drift was asserted from combinator names without evaluating what each accepts (TD-34).
6. Types were called "the same" without a type check; mutual assignability is not identity (TD-47).
7. A live-path guard was classed as legacy-only: `priorGap` refuses on the exact path (TD-30).
8. "Shipped composition" was conflated with "default library", and an implementation binding was counted as composition (TD-28).
9. Call sites were counted instead of executions: two of seven sites sit in a per-row loop (TD-52).
10. The invocation variant `direct` was read as `rootMode: direct`, and schema defaults were assumed to reach the record (TD-35).
11. A classifier blind spot was not disclosed, and the classifier's per-note output was not saved (TD-64).
12. Duplicate counts were taken from the first few copies found (TD-37).

**Earlier performance findings at this head** (performance, status table).

| Earlier finding | Status at this head |
|---|---|
| About eleven whole-log passes per Run (RC6) | Repaired on the Run path; still present on reads |
| The same prefix decoded and folded twice per read construction (RC6) | Still present on the reopen path; on the held path the decode is gone and bodies are re-read |
| Canonical JSON and SHA-256 over half of cold-read CPU (RC6, 52 to 55%) | Still present, 64 to 68%; the work moved into the per-body reader |
| Six context copies per Run (RC6) | Partly repaired |
| Probes a third of the log (RC6) | Still present, 28 to 30%; the cause changed |
| Whole-call `structuredClone` in the definition-call transport (RC7) | Repaired |
| Installation verification hashing every member three times per call (RC9 F3) | Still present and larger per Run |
| Cold CLI launch grows with log size (RC7) | Still present, proportional to rows; not re-measured at GB scale |
| One cold read 142 s on 1 GB in-process, 68.8 s by CLI (RC6) | Not re-measured at that size |
| About 0.93 GB heap peak per installed test case (`M_RETURN.md`) | Confirmed |
| About 50 MB retained per loaded Product graph, 11 MB of it `.d.ts` text (`M_RETURN.md`) | Not re-measured as such; the 11 MB agrees |
| About 2.4 ms per status read (`M_RETURN.md`) | Correct only for the near-empty fixture |

**The boundary that applies to almost every entry.** Editing any exported declaration changes the emitted `.d.ts` text, and the manifest generator digests declaration files (`scripts/generate-product-manifest.mjs:610`); the packed declaration closure puts many of those files into each of 47 contract rows (the `publicContractCatalog` declaration inventories), and `productRelativeLocators` lists each file once more, so the manifest names such a file 48 times (refutation pass, parsed). So nearly every removal moves manifest and digest pins, and tests pin those digests. Entries say "manifest pins" without repeating this. The wave refreshes pins per package and cuts once at the end.

**Terms used below.**
- Risk classes: "none"; "replay digests" (the digests of recorded Runs that replay must reproduce); "Public contract"; "manifest pins" (manifest or digest pins); "qualification mirrors" (files the qualification inventory and recipe pin by digest).
- F_H, F_P and F_D are the human, probabilistic and deterministic regimes of a step. A hold is an F_H step waiting for a person.
- One Surface is the construction composition protocol (`constructionComposition` on a Program): a system program that selects construction intent and observes construction deltas.
- A package barrel is a module that only re-exports. A public twin is an exported variant of an owner function kept beside the owned one.
- An overload triple is a function declared three times: an owned guard overload, a public overload over the replay state, and the implementation.
- L and P are the legacy and current root event contracts (`LEGACY_ROOT_EVENT_CONTRACT_DIGEST`, `ROOT_EVENT_CONTRACT_DIGEST`); an L store takes appends until the witness reprice moves it across the L-to-P bound (abg-workers). abg-events names the event profiles L, RC6, S2 and W. A successor profile is a new profile under which changed event shapes or digests are written while recorded Runs replay under their own.
- W1 is the first amendment-witness workload (`t287-amendment-witness`), a scripted governed Run of ten Executive steps; "the live Run" is the RC12 live Executive Run in `rc12-executive-01-evidence/live-01/` (7 Executive steps, 14 actor calls) (performance).
- C-n names a closure record of the first edition (for example C-5 `afcb3be58`). RCn Fm names finding m of the review of release candidate n (for example RC9 F3). O2 is the earlier repair that keys the environment projection by the admission digests of its rows (performance P4).

**Refutation pass and coverage run.** The refutation pass (`findings/REFUTATION.md`) re-tests twenty of the strongest review claims on `main` from `002035b8a`; by its end HEAD is `59fbaf8a0`, which differs by one ledger line and in no source, test, script, contract, design or specification file. Twelve claims hold, claim 18 among them except for its branch count, which the pass corrects by one commit. Eight are narrowed (claims 3, 4, 6, 11, 12, 14, 17 and 19), and inside claims 3, 12, 14 and 19 the pass refutes sub-claims. The pass shares a model family with the area reviewers and the Executive, so blind spots common to that family may survive it. It samples TD-25 to TD-31, TD-34, TD-35, TD-37, TD-40, TD-44, TD-47, TD-51, TD-52, TD-64 and TD-73, and each of those entries names its claim and verdict in Evidence; every other entry is unchecked by the pass. The coverage outputs (`census/out/coverage-*.json`) do not exist yet; TD-46 holds their place.

### Decisions for the owner

| ID | Decision | Outcomes | Executive's recommendation | Precedent |
|---|---|---|---|---|
| TD-25 | What happens to the five `interaction.respond` Public members, given that 5.0 reserves human response and resume to 5.1 | Withdraw them from the 5.0 surface; or keep them as declared members that always refuse | Withdraw | The Product's own reservation of response and resume to 5.1; "always remove tech debt" |
| TD-26 | Whether One Surface stays now that the Executive supersedes Consensus | (a) Keep One Surface and wrap the Executive in it; (b) make the Executive the standard system program, reprice `A5-F07`, and retire One Surface with Consensus | (b); the first recommendation, from the trace alone, was (a), and the area reviews changed it | The owner's direction to consolidate and remove failed and redundant features; "consensus has been replaced by executive"; independent review 4 established that repricing a selected feature is the owner's decision |
| TD-27 | Whether the `gate` relation gets runtime meaning | Implement it (ABG evaluates the gate rule before continuing past its target); or retire it and reprice `REQ-L-GTL3-HOF-003` | Retire in this wave; author process prerequisites later as a first-class relation from its own requirement | The owner's direction to remove failed and redundant features; no shipped publication carries a gate |
| TD-28 | For each capability the default library does not use: supported 5.0 building block or residue | Per capability: building block (name the consumer) or residue (retire from 5.0) | Keep what the default library and the bound Public surface use; for the rest the owner names the consumer or it is retired; no recommendation where a reviewer marked "investigate" | The same direction to remove failed and redundant features; the default library is the current way work is driven; each withdrawal is a Product change, so each needs the owner's word |
| TD-29 | The budget and rule granularity of the qualification and self-conformance gate | Keep the gate and discharge what makes it unrunnable, at a budget and granularity the owner sets | Keep the gate; present-tense requirements (TD-65), assessor dispatch from the worker binding, rule granularity | On 2026-10-29 the owner chose repair over deferral for this gate |
| TD-32 (part) | Whether L-profile stores must reprice before appending, which releases the L writer branches | Require the reprice and retire the branches; or keep L appends | Require the reprice; recorded L stores stay readable, and only new appends to them stop | The first edition's boundary that recorded history stays readable |
| TD-33 | Names of milestone-named Public subpaths, npm scripts and a ticket-named key | Rename; or keep | Rename by owner, keeping aliases for one cut | The repository's writing rule that live surfaces carry no milestone or version names |
| TD-40 (part) | Which side changes, since the published outcome schemas do not describe what the transport returns | The schema follows the transport; or the transport produces the published envelope | Publish what the transport returns, because every caller and recorded receipt already uses those shapes and the four published envelopes that differ have never been produced | None; it is a Public contract change either way |
| TD-52 (part) | What "installed verified" promises | Byte identity at each consumer boundary; or unchanged since verified | Unchanged since verified, within one process, proved by a cheap check at each consumer boundary | The held-session design the owner accepted on 2026-11-06, which allows reuse within one operator lifetime with a same-boundary proof; product-install also cites the P5 ruling under which the register closed reuse, and RC9's withdrawal of O3 for want of a resolved reuse lifetime |
| TD-66 | When a successor event profile is cut to take derived liveness out of the replay digest | Cut a successor profile now for this correction alone; or batch | Batch every digest-affecting correction in this register into one successor profile | A change to the digested event body is an event-contract change, which the owner's standing rules reserve to him; profile succession is the existing mechanism (abg-events cites the `lifecycleCopies` flag as an earlier successor profile) |
| TD-19 (part) | Whether the forward-only retention rule for tracked evidence is adopted | Adopt the rule; or keep the current practice | Adopt | The first edition leaves retention to the owner |
| TD-44 (part) | Whether the two unused gap-authority types leave the `./public` SDK export | Withdraw `PublicGapAuthority` and `PublicGapSource`; or keep them exported | Withdraw | The owner's direction to remove failed and redundant features; it is a type change on the SDK export, so it needs the owner's word |

### Ruled from existing rules

These entries looked like owner decisions; a rule already in force answers each, so each is Open.

- **TD-35.** `REQ-P-POLICY-013` makes a `graph_function` start a direct start: `direct` "selects one admitted entry traversal without that Product policy overlay". Such a start goes through the one start-law owner and is refused under a supervised Program.
- **TD-45.** The first edition already rules that a package barrel is not the Product contract; the manifest's declared locators are. Package exports that serve only tests move to test support or go.
- **TD-64.** The repository's method moves historical material out of live design.
- **TD-65.** The method keeps live requirement text in present tense and moves lineage to history, and the owner's standing rule applies the writing guide to specification text without asking. A requirement whose truth changes returns as its own decision.
- **TD-73.** The `v5.0.0` tag is the latest-RC selector the Product defines (`specification/PRODUCT.md:1552`, `:1772`), and rc.1 is the last published cut, so the tag is correct. Branch names that alone keep commits alive stay, as the repository's `archive/*` branches do. Pushing and pruning are the owner's.
- **TD-34.** Where the hand copy is stricter than the GTL owner, the stricter check moves to its owner. This wave loosens no Public admission; loosening one needs its own ruling.

### Work queue

| ID | Status | Retirement or decision | Size (approximate lines) | Risk | Change class | Dependency or trigger |
|---|---|---|---|---|---|---|
| TD-25 | Decision | Retire the resume readers, the uncalled response admission and the uncalled provider member; decide the five Public members | L; about 2,650 now, 150 after the decision | Public contract; manifest pins | realization_refactor; Public withdrawal by decision | Residue now; members after the decision |
| TD-26 | Decision | (a) wrap the Executive in One Surface, or (b) retire One Surface with Consensus | L; about 11,050 under (b) | Public contract; manifest pins; qualification mirrors | product_reprice of `A5-F07` under (b); design_reframe under (a) | Owner decision |
| TD-27 | Decision | Implement or retire `gate` | M; about 240 after | Public contract; manifest pins | requirement_reprice, then realization_refactor | Owner decision |
| TD-28 | Decision | Per capability: building block or residue | L; about 20 now, up to about 2,680 after | Public contract; manifest pins; qualification mirrors | product_reprice | Owner decision per capability |
| TD-29 | Decision | Keep the gate; make it runnable | none removed | qualification mirrors | requirement_reprice through TD-65 | TD-65; budget |
| TD-30 | Open | Retire the legacy run request family and the gap re-entry start; keep the exact-path `priorGap` refusal | M; about 400 | manifest pins | realization_refactor | Five test files move to the current request first |
| TD-31 | Open | Move the shared schema entries, then retire the STDO-only environment evidence and the old run-environment shape | M; about 450 | Public contract; manifest pins; qualification mirrors | realization_refactor | None |
| TD-32 | Open, one part Decision | Name profiles truthfully; drop dead imports and the never-produced stage; L writer branches by decision | S; about 11 now, 60 after | manifest pins; replay digests for the L part | realization_refactor; requirement_reprice for the L part | Decision part |
| TD-33 | Decision | Rename by owner with aliases for one cut | S; renames only | Public contract; manifest pins | product_reprice of names | Owner decision |
| TD-34 | Open | One GTL schema owner for run invocation; the drifted copy carries defects on the fallback path (a caller-supplied catalog the owner did not establish) | M; 1,110 removed, 330 moved | Public contract (fallback-path admission); manifest pins | realization_refactor | None; carries defects on the fallback path |
| TD-35 | Open | One start-law owner; a `graph_function` start under a supervised Program is refused | S; about 40 | Public contract | realization_refactor | None; ruled by `REQ-P-POLICY-013` |
| TD-36 | Open | One strict workspace-binding and admitted-row check | M; about 250 | none | realization_refactor | None; correctness risk |
| TD-37 | Open | One owner each for worksite path confinement (five predicates, about ten inline checks), launch identity, tree inventory and leaf authority | M; about 660 | replay digests | realization_refactor | None; correctness risk |
| TD-38 | Open | Move Product law out of ABG, HoG, the leaf port and the validator | L; about 2,150 moved | replay digests (refusal order) | design_reframe | TD-26 and TD-28 first |
| TD-39 | Open | One owner for route-target relations and the projections HoG rebuilds | M; 395 removed, 210 moved | replay digests if a copy diverges | realization_refactor | None |
| TD-40 | Open, one part Decision | One owner for call admission, the read envelope and the operation-family tables; outcome schemas by decision | L; about 415 removed, 771 moved | Public contract; manifest pins | realization_refactor; the schema part by decision | Decision part |
| TD-41 | Open | One classifier and closed label set; separate the three timeouts | M; about 40 | replay digests | realization_refactor; design_reframe for the profile boundary | Successor profile (TD-66) for the timeout bindings |
| TD-42 | Open | Derive the closure sequence, C-term law, single-leaf resolution and descriptors from one owner each | M; about 750 | manifest pins; Public contract on diagnostic codes | realization_refactor | None |
| TD-43 | Open | One sweep of small second owners | M; about 335 | none; manifest pins for exported names | realization_refactor | None |
| TD-44 | Open, one part Decision | One sweep of unreached declarations, unused locals and never-produced kinds; the two `./public` types by decision | M; about 650 | Public contract (`./public` types); manifest pins (47 contract rows) | realization_refactor | The tests that reach the HoG twins and `isClosedProbabilisticLeafInvocation` change with them |
| TD-45 | Open | Move package exports that serve only tests into test support | M; 350 removed, 300 moved | Public contract (package API); manifest pins | realization_refactor | Retention of observation-only counters |
| TD-46 | Investigate | Functions and branches no test executes | to be set | to be set | to be set | Coverage run |
| TD-47 | Open | Re-sync the pasted types, then name the six spelled-out return types | M; about 1,330 | manifest pins (47 contract rows) | realization_refactor | Build and `.d.ts` diff |
| TD-48 | Open | One owner for overload parameters and CCall envelopes | L; about 900 | manifest pins | realization_refactor | After TD-25 and TD-26 |
| TD-49 | Open | Move release code out of the runtime barrel and the leaf implementations | S; about 251 moved | none | realization_refactor | TD-71 |
| TD-50 | Open | Authenticate each row once per cold read | M; about 110 | none | realization_refactor | None; measured |
| TD-51 | Open | One acquisition per read; hold the derived read context per prefix | L; about 20 plus the design | replay digests | design_reframe | Retention-lifetime decision; measured |
| TD-52 | Open, one part Decision | One verification fact per install; one declaration analysis; evidence by digest | L | Public contract; manifest pins; replay digests | requirement_reprice for the promise, then realization_refactor and design_reframe | Decision part; measured |
| TD-53 | Open | Identity shortcuts at callers holding owner-admitted values; artifact truth keyed by row admissions | M; about 100 | none if digests are kept | realization_refactor | Retention of `canonicalEquals`; measured in part |
| TD-54 | Open | One incremental replay fold per transaction; stop whole-view scans | M; about 40 | replay digests | realization_refactor | Byte-equal proof against the cold path; measured in part |
| TD-55 | Open | Decode worker stdout once; stop copying streams; window stderr rows | S; about 30 | replay digests | realization_refactor | Successor profile for row changes |
| TD-56 | Open | Reference probe contracts, work state and publications instead of copying them | L | replay digests; qualification mirrors | design_reframe | Successor profile (TD-66); measured |
| TD-57 | Open | One suite command, lanes by owner and tier, one lane manifest | L | qualification mirrors if files are renamed | realization_refactor | None |
| TD-58 | Open | One installed-setup owner; install once per test file | L; 150 removed, 300 moved (test side) | qualification mirrors | realization_refactor | None; measured |
| TD-59 | Open | Classify and discharge the fourteen failures and the r1 to r3 basis | M | qualification mirrors; manifest pins (r1 to r3) | realization_refactor | TD-60, TD-71 |
| TD-60 | Open | One gate catalogue for the 236 skips | L | qualification mirrors | realization_refactor | None |
| TD-61 | Open | Route copied harness and helpers to their owners | M; about 1,300 (test side) | qualification mirrors | realization_refactor | After TD-60 |
| TD-62 | Open | Give hand-run scripts a runner or retire them; delete unread trees and evidence writes | S; about 1,800 (test side) | qualification mirrors | realization_refactor | TD-60 for the five scripts |
| TD-63 | Open | Generate the qualification inventory and recipe at the cut | M | qualification mirrors | realization_refactor | TD-57, TD-60 |
| TD-64 | Open | Move design history out of live design | L; about 66,000 design lines moved | qualification mirrors (16 link edits; the qualification subject inventory names the notes) | design_reframe | None |
| TD-65 | Open | Present-tense, traceable requirements | L | qualification mirrors | requirement_reprice | None; sets TD-29's cost |
| TD-66 | Decision | Successor profile for derived liveness and every digest-affecting correction | L; about 120 | replay digests | design_reframe | Owner decision |
| TD-67 | Investigate | Module-export predicate outside its lifetime and budget | S | replay digests | realization_refactor | None |
| TD-68 | Investigate | Public refusal code `mutable_default` with no producer | S | Public contract; manifest pins | realization_refactor or product_reprice | Design owner |
| TD-69 | In flight | Derive the product payload list from declared files and the lockfile | S to M | manifest pins | realization_refactor | None; the first package of the wave |
| TD-70 | Open | Stop tracking generated contracts and the manifest; settle the mirror route | M; L for the mirror route | manifest pins | realization_refactor; design_reframe for the mirror route | TD-69 |
| TD-71 | Open | One maintained cut procedure in the tenant | M; about 900 consolidated from work records | manifest pins | realization_refactor | TD-63, TD-69 |
| TD-19 | Open, one part Decision (first edition) | Forward-only retention rule for tracked evidence | L | replay digests | realization_refactor (repository policy) | Owner decision on the retention rule |
| TD-72 | Open | Remove withdrawn tenants and residue directories | S | none | realization_refactor | None |
| TD-73 | Conditional | Branches and unpushed history; the `v5.0.0` tag is as the Product defines it | S | none | none (repository) | When the owner prunes or publishes |
| TD-74 | Open | Clean the main checkout's ignored output and merged worktrees | S | none | none (local) | None |

### Recommended sequence

1. **Make the clean-up cheap.** Deterministic product identity (TD-69) goes first and is in flight: until the payload rule is deterministic, a build on `main` and a build in a cut worktree disagree on the product's identity. Then a suite that runs by one command, in lanes by feature, with one install per file where that proves the same (TD-57, TD-58); the coverage census kept as a tenant script (TD-46); the cut procedure in the tenant (TD-71).
2. **Take the decisions in one sitting.** TD-25 to TD-29, the L-profile part of TD-32, TD-33, the outcome-schema part of TD-40, the verification promise of TD-52, the successor profile (TD-66), the retention rule (TD-19) and the two `./public` types of TD-44.
3. **Remove what the decisions release,** largest first: Consensus and One Surface (TD-26), human response and resume (TD-25), the unused capabilities (TD-28).
4. **One owner per rule,** starting with the four that carry defects or correctness risk: TD-34 (on the fallback path), TD-35, TD-36 and TD-37.
5. **Performance,** measured costs first (TD-50 to TD-56).
6. **Design, requirements and repository** (TD-64, the requirements rewrite TD-65, TD-70, TD-72 to TD-74, TD-19).

### Entry details

#### A. Failed, unfinished or superseded features

#### TD-25 — Human response and resume ship in 5.0 source without a producer

Status Decision. Sources: abg-calls E1, E10; abg-traversal AT-01; hog-shared-bindings "Retire the F_H interaction-resume route residue"; product-run 1; product-install E3; design-spec-repo E5; implementation-public "Nine declared Public members have no binding".

- **Evidence:**
  - The Product reserves native response and resume to 5.1: "In 5.0, a required human response yields a truthful blocked handoff."
  - Producer side (read, grep): `prepareFhInteractionResponse` (`abg/continuation.ts:1511`) and `commitFhInteractionResponseAtExpectedPrefix` have no source caller. `admitContinuationTerminal` (`:79`) is dead. `projectHeldInteractionCCallOutcomeAtPrefix` (`:318-650`) is dead and duplicates `c_call.ts`; a second `public_operation_admitted` builder sits at `:994`. The `interaction.respond` module-source row names `INTERACTION_DEFINITION_BINDINGS` (`public/binding/owner_contract_source_set.ts:190`), which no module exports (census `unresolvedNamedRoots`).
  - Reader side, for a kind nothing produces (read): `abg/fh_resume_relation.ts` (283 lines); `fh_continuation_projection.ts:112`, `:302`, `:360-550`, `:575-701`, `:818-1128`; `retry.ts:1849` with its `fh_resume_success` arms; `retry_progress.ts:566`; `retry_lifecycle.ts:33`; `c_call.ts:2601`, `:4351`, `:6439`; `c_call_outcome.ts:1802-1818` (abg-calls E1). In the route code `traversal_route.ts:478`, `:2435-2446`, `:2887`, `:3543-3647`, `:4394`, `:4426`, `:4434`, and nine sites in `traversal_cursor.ts` from `:190` to `:688` (AT-01). In HoG the refusal code `resume_not_admitted` (`hog/route_proposal.ts:75`) and `deriveInteractionSuccessorInputCarrierRef` (`hog/traversal.ts:386`, 48 lines, no source caller); `hog/interaction_resume.ts` was deleted at C-18a `a0829a298`, and only `hog/interaction_lifecycle.ts` remains (read by the Writer).
  - `ProductSemanticsProvider.evaluateInteractionResponse` is required of every provider and called by nothing at runtime (product-install E3, read). The five `interaction.respond` members are published in the adapter projection and schemas with no binding (implementation-public); their packet lines are `framework-handoff.compile.ts:103-129` (product-run 1).
  - No recorded Run holds `fh_interaction_resume_admitted`: a grep of `test_env`, `test_runs` included, finds no admitted event (AT-01), and the RC6 whole-log census found none in 17.9 hours of Runs (abg-calls E1). Confidence: verified for "no producer"; investigate for campaign logs outside the repository.
  - design-spec-repo E5 keeps `fh_resume_relation.ts` as hold behaviour; abg-calls E1 retires it. Its exports derive the resume successor input and are imported only by `fh_continuation_projection.ts:28-30`, for the resume validation at `:360` applied to resumed continuations at `:700`, and by `continuation.ts:170-182`, for package-tier derive wrappers (read by the Writer). The file serves only the resume, so abg-calls E1 holds.
  - Refutation pass (claims 1 and 2): holds. No mention of `fh_interaction_resume_admitted` in source constructs the event; `commitFhInteractionResponseAtExpectedPrefix` (`abg/continuation.ts:1564`) has no caller besides its barrel export (`abg/index.ts:302-306`). The pass adds the test users: `t287-single-address-space-consolidation.test.mjs:1094`, `:1133` calls the prepare half, and `generic-input-retention.test.mjs:49` and `t287-undispatched-diagnostic.test.mjs:176` build the resume event by hand. Its store scan (`test_env/proof`, `test_env/evidence`, `test_env/uat/runs` and the live RC12 Run) finds no resume, response or open event. On the build, the five `interaction.respond` locators resolve to no callable, and the transport refuses them with `installed_binding_unavailable` (`public/installed_definition_call_transport.ts:240-298`).
- **Retire:** Under either outcome, by realization_refactor: the resume readers in ABG and HoG, the uncalled response admission and outcome projection, the duplicate admitted-event builder, and the required provider member with its wrapper. The decision covers only the five Public members: withdraw them from the 5.0 surface (recommended) or keep them as declared members that always refuse. abg-calls E10 (`fh_interaction_opened` copies facts the log already holds) belongs to the hold, which stays; it is a design_reframe, L, and waits for the successor profile (TD-66).
- **Owner / frame:** `abg/continuation.ts` keeps `admitFhInteractionOpen` (`:1115`) and `admitOwnedFhInteractionHold` (`:1369`); `hog/interaction_lifecycle.ts` keeps the hold. realization_refactor for the residue; the member decision is Public contract.
- **Closure:** No source reads `fh_interaction_resume_admitted` except its declaration and generated schema; the three tests above are rewritten or retired with the readers they exercise; `INTERACTION_DEFINITION_BINDINGS` is either exported or no longer named; the build and the F_H hold lanes pass.
- **Boundary:** Keep the hold, the blocked handoff, and the declared kinds with their generated schema (`abg/event_store.ts:103`; `native-runtime-observation.json:67`, `:3635`, `:4756`) until 5.1 is authored (AT-01). Risk: Public contract for the members; manifest pins (`route_proposal.d.ts` and `traversal.d.ts` are in 47 contract rows).

#### TD-26 — Standalone Consensus and the One Surface loop

Status Decision. Sources: gtl-validator GV-02; design-spec-repo E1; abg-traversal AT-04, AT-03; product-install E2; implementation-public "Consensus surface in this area waits on the owner's A5-F07 decision"; product-run 14; `rc12-executive-01/O1_TRACE.md`; RC12 ledger rows C, CB and O1.

- **Evidence:**
  - The owner has ruled Consensus superseded by the Executive. The shipped standard system program is the Consensus One Surface program. No test starts it at runtime, and outside test output no recorded Run admits `construction_intent_selected` or `construction_delta_observed`; the only recorded events are test outputs in `test_runs/rp2` (AT-04).
  - `gtl/consensus.ts` is 5,267 lines, about 1,150 of them One Surface and about 4,100 Consensus proper; `gtl/consensus_schema.ts` (1,839 lines) is a hand-written JSON Schema literal at `:276-1765` with 13 Public schema rows (GV-02, read). `implementation/consensus.ts` (819 lines) is loaded by module-path string from `gtl/consensus.ts:4937`, and `public/run_projection_authority.ts` (189 lines) has no source caller (implementation-public). `product/builtin_semantics.ts:66-89` and `:430-785` are Consensus-only (product-install E2). `project.read#ticket_consensus` (`product/project_read_definition_bindings.ts:1019`) has no positive test (product-run 14). The One Surface carriers in ABG are `abg/traversal_route.ts:952-3002` and `:5035-5143`, about 2,100 lines, including the next-action basis reader that AT-03 finds read twice.
  - The prepared retirement on `claude/rc12-consensus` changes no file under `code/src/abg`. Its commit `fb86974e3` removes 15,349 lines in 81 files: 8,760 in 14 files under `code/src` and 2,543 under `test_env` (`git show --shortstat`, read by the Writer). It deletes `gtl/consensus.ts` whole, One Surface lines included. What it leaves of One Surface is the contract type (`gtl/contracts.ts:120`), its schema arm (`gtl/serialization_contracts.ts:199`), the validator's eight-locus law (`validator/validation.ts:1553-1666`) and the ABG carriers in the route code (about 2,100 lines) (read by the Writer). `f4aad7d5e` retires Consensus from Product, requirements and design (62 files, 5,489 lines). The branch is contained in `main`, where reverts restored the code (AT-04 names `b0327828e`, `10cb10e89`, `d4ffd8923`).
  - Refutation pass (claim 15): holds for the stores it scanned (`test_env/proof`, `test_env/evidence`, `test_env/uat/runs` and the live RC12 Run), which hold no One Surface event. The `test_runs/rp2` statement rests on AT-04 alone.
- **Retire:** Outcome (a): keep One Surface and wrap the Executive in it (O1 option b), about 0.6 to 0.9 thousand new lines, no Product sentence changed, two selection mechanisms (registered selection inside, construction intent outside), the ABG carriers stay. Outcome (b), recommended: make the Executive the standard system program, reprice `A5-F07`, and retire One Surface with Consensus, which removes the One Surface GTL, the ABG carriers and the validator law as well and leaves one selection mechanism.
- **Owner / frame:** GTL (`gtl/`), the route owner (`abg/traversal_route.ts`), the validator and the Product semantics. Under (b) a product_reprice of `A5-F07`, then realization_refactor; under (a) a design_reframe.
- **Closure:** Under (b), no source names Consensus or `constructionComposition`, the Executive is the standard system program, and the manifest is regenerated once.
- **Boundary:** Public contract (the published program, `consensus.schema.json` and the One Surface kinds in `native-runtime-observation`), manifest pins and qualification mirrors. If any admitted Run selected the Consensus implementation, its replay resolves that module path (implementation-public). Repricing a selected feature is the owner's decision (independent review 4).

#### TD-27 — The `gate` relation is constructed, serialized and validated, and nothing executes it

Status Decision. Sources: gtl-validator GV-01; hog-shared-bindings "Settle whether the gate relation has runtime meaning"; abg-traversal lead 2.

- **Evidence:** Construction at `gtl/graph_applications.ts:219-229`; schema arm at `gtl/serialization_contracts.ts:135`, emitted into `contracts/schemas/gtl-serialization.schema.json`; validation at `validator/validation.ts:405`, `:1197-1210`, `:1241-1294`, `:1364`; six copies of the application union in `abg/construction_continuation.ts` (`:475`, `:663`, `:850`, `:1169`, `:1376`, `:1582`) (GV-01, read). `grep -w gate hog/` finds nothing, and runtime relation dispatch in `abg/` and `hog/` covers only `recurse`, `fan_out`, `re_enter` and `fan_in` (hog-shared-bindings).
  - Refutation pass (claim 5): holds. `gateApplication` (`gtl/graph_applications.ts:219`) is exported only through `gtl/index.ts:104`, and the contracts carry only the schema arm. The pass adds the test-side producers: the fixture `test_env/fixtures/language-structural/program.mjs:92-97` builds a gate application and its default case list (`:49`) includes it, so many tests install and validate the gate Program, though none starts it; its leaf (`leaf.mjs:11`) passes input through and the gate rule's config is never read. GV-01 missed a static producer at `t287-gtl-serialization-publication.test.mjs:373`. GV-01's inference that a gate refusal never stops the Run is unchecked.
- **Retire:** Implement it, or retire it and reprice `REQ-L-GTL3-HOF-003`; recommended: retire in this wave, with the fixture's gate case and the static test producer. For the next feature wave: RC12's process prerequisites are an opaque policy string the validator never reads (RC12 review 3, F2-4); a first-class relation is where that law belongs, authored from its own requirement.
- **Owner / frame:** GTL and the validator. requirement_reprice, then realization_refactor.
- **Closure:** No source, schema, fixture or test names `gate`, or ABG executes it with a runtime lane.
- **Boundary:** Public contract (`GateApplication` is a GTL contract type and the schema bytes change); manifest pins. No shipped publication carries a gate (GV-01).

#### TD-28 — Capabilities the default library does not use

Status Decision. Sources: product-run 12, 5, 11; abg-workers "Choose the carrier for A5-F17", "Decide GC03 governed context", "Close the witness gap"; implementation-public "Nine declared Public members have no binding" (the four witness acts), "Published adapter metadata that nothing executes", "`abg.codex` is a pass-through second CLI"; product-install "Release snapshot: required, never run for a 5.x cut".

- **Evidence:**
  - The default library's only external workflow targets are native workspace work (`worksite/native-work@5`), native workspace assessment (`worksite/native-work/assessment@5`) and C2 command execution (`worksite/command-execution@5`) (product-run 12, read; confirmed by the refutation pass). The other capabilities are installed, startable and tested; the default library does not compose them.
  - Refutation pass (claim 11): narrowed, by evaluating the ten shipped publication constructors (`scripts/generate-product-manifest.mjs:1203-1214`). Other shipped modules compose some of these capabilities. Inside the construction module (`module://abiogenesis/worksite/construction@5`), C3 composes C1 (`branch-construction@5` → `branch-construction/branch-application@5` → `construction@5`), and C1 composes the C0 file-replace function (`construction@5` → `construction/vector-application@5` → `file-replace@5`), which the construction module publishes from the C0 parts constructor. The standalone C0 module (`module://abiogenesis/worksite/c0@5`) is not shipped: it is absent from the generator's module list and from the manifest's ten `publicationBindings`. The C2 module binds the C1 and C3 selectors (`select-construction-fd@5`, `select-branch-construction-fd@5`, `prepare-branch-task-fd@5`) and holds the supervised, start-free `revision-command-execution@5` Program. The semantic stage binds `semantic-stage/job-intake@5` to the requirement-handoff implementation (`requirement_handoff.js`), an implementation binding rather than a composition; its job-graph constructors compose C0 file parents by contract (`gtl/semantic_stage_publication.ts:27-28`, `:87-88`) and are exported for consumers, and the shipped publication does not call them. Nothing composes the command-forward, requirement-handoff and C3 Programs; Consensus and self-conformance compose only their own graph functions. The refutation pass removed product-run 12's statement that no shipped program composes the other capabilities, because it holds only for the default library.
  - Refutation pass (claims 2, 9 and 10): holds. Witness acts: `admitWitnessedAct` (`abg/witness_admission_operation.ts:1113`) has branches for all four, its only runtime caller is `abg/witness_definition_bindings.ts:302`, and the four locators resolve to no callable on the build; `witness-reprice-definition-binding.test.mjs:193-213` admits `attest` and `hygiene-stamp` natively, and no test admits `intake` or `run-resumed`, so "implemented" for those two rests on reading. Governed context: the policy key (`abg/governed_context.ts:812`) is set only in `t287-governed-context.test.mjs` and `support/t287-governed-context.mjs`, and the actor runtime passes `queryArtifacts: () => null` (`abg/actor_process.ts:1031`). Registered selection: the producers of `registered_selection_task` are three tests (`t287-native-registered-selection`, `t287-recursive-registered-selection`, `t287-native-selection-profile-scope`) and the fixture Product `test_env/fixtures/registered-selection-product/`, whose `native.mjs` imports the three route functions from `@abiogenesis/typescript-tenant/product` as a consumer would; the live RC12 Run holds 14 `framed_synthesis_task` and no `registered_selection_task`. The pass adds what product-run 5 omits: framed synthesis requires `abg.framed_synthesis_locus` and the default-library bindings, so for a consumer F_P `registered_selection` this route is the only native selector, and its `./product` exports are a consumer surface.

| Capability | What invokes it at runtime | Cost to keep | Reviewer's verdict |
|---|---|---|---|
| Worksite construction (C1) | Composed by C3 inside the construction module; its selector is bound by C2; tests | `worksite_construction*.ts`, contracts, tests | Investigate; `T287_NATIVE_WORKSPACE_WORK_DESIGN.md:35-36` keeps C1 available when its protocol is selected |
| Construction recovery | Part of the C1 set | `product/worksite_construction_recovery.ts` (158 lines), `abg/worksite_construction_recovery.ts` (456) | Investigate, with C1 |
| Branch construction (C3) | Composes C1; its own Program is composed by nothing; its selectors are bound by C2; support `serial-branch-worksite-program.mjs` | `worksite_branch_construction.ts`, contracts, tests | Investigate; its design note is still "pending independent review" |
| Preparation | Part of C3 (`worksite_preparation.ts`) | Module, contracts, tests | Investigate, with C3 |
| Command execution (C2) | The default library's testing purpose; qualification dispatch; binds the C1 and C3 selectors | `product/worksite_command_execution.ts` (2,498 lines) | Used; keep |
| Command forward (C2 forward re-entry) | The forward module, whose Program is composed by nothing; tests `forward-command-*` | `worksite_command_forward` (317 lines), tests in 9 files | Investigate |
| Revision | The C2 `revision-command-execution@5` Program, supervised and start-free; semantic revision | `worksite_revision.ts`, contracts, tests | Investigate |
| Semantic job, stage and revision, with requirement handoff | Stage and revision compose each other with native work and C2; the stage binds its job intake to the requirement-handoff implementation; no shipped program composes them, and nothing composes the requirement-handoff Program | 2,125 lines in ABG; `semantic_job.ts` 1,041 lines; tests in 22 to 40 files | Owner chooses the `A5-F17` carrier: these modules or the default library |
| Native registered-selection task | `abg/instruction_assembly.ts:320` (route `:298-345`) when the input is `registered_selection_task`; no shipped program produces that kind; three tests and a consumer-shaped fixture Product do | 74 lines plus about 80; three tests; three `./product` route exports | Retire if the owner confirms it is not an authoring surface; it is the only native selector for a consumer F_P `registered_selection`, so retirement is a Public contract change; correct `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:629` either way |
| Result assessment (`result.assess`) | A Public operation only; no shipped graph calls it; its fluent `result_assessment_admitted` (`abg/calculus/axioms.ts:1121-1128`) is read by nothing | About 1,100 lines | Investigate |
| Governed context (GC03) with its Python adapter | Selected only by `Program.policies["abg.governed_context"]`; no source or shipped Program sets it | About 1,350 source and 1,160 test lines; `host_adapter.py` (199 lines) | Activate or retire from the package |
| Four witness acts (attest, hygiene-stamp, intake, run-resumed) | Implemented natively (`witness_admission_operation.ts:727-1111`); `attest` and `hygiene-stamp` tested natively, `intake` and `run-resumed` by reading only; unbound (`witness_definition_bindings.ts:378-382`) | Public schemas; about 20 lines of dead residue | Bind them or reserve them; the residue goes now |
| Release snapshot | Never run for a 5.x cut | `release_snapshot_operations.ts`, bindings; tests outside every gate | Required; keep and gate its tests (TD-57) |
| `abg.codex` second CLI | Pass-through spawn of `./cli.js` (`public/codex_cli.ts`, 77 lines) | `bin` entry, inventory and recipe rows | Retire |
| Adapter exit metadata | Nothing reads it (`shared/public_function_contracts.ts:40-62`) | Published in the adapter projection (69,025 bytes) | Retire, or make it the source of exit codes |

- **Retire:** For each row the owner decides: supported building block of 5.0 (name the consumer) or residue (retire from 5.0). C3, C1 and the C0 parts inside the construction module are decided together, because C3 composes C1, C1 composes C0, and C2 binds the C1 and C3 selectors; retiring any of them also edits the C2 module's bindings. The witness residue (a dead interface, a const and a duplicate map, about 20 lines) goes now.
- **Owner / frame:** The Product feature owners per row. product_reprice. product-run 5 classes registered selection as a design_reframe unless registered-selection tasks were meant to stay a consumer capability; the consumer-shaped fixture and the `./product` route exports show they are one.
- **Closure:** Each row is either named in the Product with its consumer and a runtime lane, or absent from source, manifest and schemas.
- **Boundary:** Public contract and manifest pins for every module in the product manifest, and for the `./product` registered-selection exports; qualification mirrors for GC03 and `abg.codex`; replay digests for registered selection if any recorded Run used it (the live RC12 Run holds none; test runs do).

#### TD-29 — Qualification and self-conformance have never completed a run

Status Decision. Sources: design-spec-repo E2, E3; gtl-validator GV-13; abg-workers "Agent profiles the actor runtime cannot dispatch".

- **Evidence:** `A5-F11` and `A5-F15` have produced no judgment; the F11 run failed on ENOTFOUND, and D5-c sized it at 408 slots and 520 to 952 USD (design-spec-repo E2). The rule catalog requires 2,116 paid judgments: 1,643 from requirement files, 60 from PRODUCT, 22 from INTENT and 391 from standards; the requirement text is lineage, not present-tense law. The qualification rules declare a peer assessor of another model family (`validator/qualification_contracts.ts:127-133`); the actor runtime declares codex, gemini and generic profiles but constructs only the Claude transport (`abg/actor_process.ts:1050`) (abg-workers). The only invoker is `test_env/support/exact-candidate-qualification.mjs`, whose live mode was authored and not run in D5-c (GV-13). `qualificationMaterialMatches` (`validator/qualification.ts:570-614`) searches material once per member and re-hashes every material byte per call (GV-13, read; structural). Refutation pass (claim 16): holds. The F11 return (`.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/final-f11-native-assessment-execution-01/return.md:5-9`) records `ENOTFOUND`, no qualification judgment and a `runtime_failed` Run; every one of the 2,116 rules in `T/contracts/qualification/rule-catalog.json` has `applicability: requires_admitted_judgment`; `specification/GOALS.md:2` reads "local, unqualified, unpublished"; a search of five RC campaign directories finds no verdict record. The other `.ai-workspace/work` campaign directories and `test_runs` were not searched.
- **Retire:** Nothing. Keep the gate and discharge what makes it unrunnable: requirement text in present tense (TD-65), assessor dispatch from the worker binding, and rule granularity. The owner sets the budget and the granularity.
- **Owner / frame:** `validator/qualification.ts` and `validator/self_conformance`; the worker binding in `abg/actor_process.ts`. requirement_reprice through TD-65.
- **Closure:** One qualification and one self-conformance run complete with judgments at the chosen granularity.
- **Boundary:** Qualification mirrors: the self-conformance assets are Public rows (manifest script `:745`), and any change of rule granularity changes them.

#### TD-30 — The legacy run request family and the unfinished gap re-entry start

Status Open. Sources: abg-traversal AT-06; product-run 3.

- **Evidence:** The legacy request family and `InvocationReentryBasis` remain beside the current request (AT-06, read). `admitInvocation` is the `nativeTypedLocator` of `abg.contract.abg.invocation-root-admission` (`scripts/generate-product-manifest.mjs:846-849`); `nativeTypedLocator` (`:617-634`) names the symbol by string and throws if it is not exported, so a grep for callers misses this user. The legacy constructors are `product/invocation.ts:1234-1322` (product-run 3, read). The kind `invocation_reentry_basis` is the unfinished gap re-entry (AT-06). Test producers (grep by the Writer): `admitInvocation` is used by `support/root-installed-environment.mjs`, `m5-event-store-reopen`, `r5-invocation-admission` and `t287-post-binding-worksite-write`; the legacy constructors by the same files except `m5-event-store-reopen`, plus `t287-c2-child-program`.
  - Refutation pass (claim 3): narrowed. What holds: the legacy family's producers are tests and support only; no `reentryBasis` value is ever constructed; on the exact path the re-entry branch always refuses, because `suppliedReentryAuthority` (`abg/invocation_admission.ts:1047-1050`) comes only from the legacy payload. Recorded evidence uses the legacy family: `proof/abi5-root-r10.events.jsonl`, `evidence/r1` and `evidence/r2`. What is narrowed: `priorGap` is live on the exact path. It is read on every admission (`abg/invocation_admission.ts:1288-1291`), and when there is no re-entry basis a non-null `priorGap` is refused with `authority_mismatch` (`abg/invocation_admission.ts:1354-1360`); the fixture `developer-mini-product/src/index.ts` declares `priorGap` in its input (`:754`, `:790-804`, `:902-932`, `:2387`, `:3058`), null in every test. `ExactInvocationAdmissionInput` inherits the optional `reentryBasis` field (`abg/invocation_admission.ts:132`, `:141-146`). The refutation pass removed AT-06's statement that `priorGap` is read only on the legacy path, because the exact path reads and refuses it.
- **Retire:** The legacy family, the re-entry basis, the inherited `reentryBasis` field and the legacy constructors, after the five test files build the current request. The exact-path `priorGap` refusal stays, or moves to the current request's owner; the `admitInvocation` locator is re-pointed to the current admission or deleted.
- **Owner / frame:** `abg/invocation_admission.ts` and `product/invocation.ts`. realization_refactor.
- **Closure:** One request family; the exact path still refuses a non-null `priorGap`; the manifest locator names an exported current admission, and the manifest build does not throw.
- **Boundary:** Manifest pins (the locator moves); the Public contract is unchanged if the exact admission and its `priorGap` refusal stay. The recorded r10 proof and the r1 and r2 evidence hold legacy requests.

#### TD-31 — The STDO-only environment evidence and the old run-environment shape

Status Open. Sources: abg-traversal AT-07; product-install E1; gtl-validator GV-04.

- **Evidence:** The STDO-only environment evidence is `none` tier (`abg/stdo_environment.ts:37`, `:69`, `:144`, `:151`); `isStdoEnvironmentEvidence` has one caller, `product/stdo_environment.ts:186`, inside `observeStdoEnvironment`, itself `none` (AT-07, census and read). `product/stdo_environment.ts` holds the specialisation, superseded by the generic run environment the runtime imports (product-install E1, read). In GTL the STDO run environment shape is still admitted and always refused: `runEnvironmentForProgram` (`gtl/stdo_run_environment.ts:229`) and `validRunEnvironmentPublication` (`:300`) refuse any `stdoRunEnvironments` member; `constructStdoRunEnvironmentDeclaration` (`:215`) and `stdoRoleForDeclaredLeaf` (`:105`) are still live (GV-04).
  - Refutation pass (claim 4): narrowed. What holds: no runtime code reads the STDO evidence functions, and the payload field `stdoEnvironment` (`abg/stdo_environment.ts:159`) is in no event-store key list. The shape is always refused, at `validator/validation.ts:178`, `:754` and `gtl/stdo_run_environment.ts:228-229`, `:241`, `:298-302`, reached through `product/catalog_operations.ts:291` and `product/execution_resolution.ts:763`; raw admission still accepts the field (`validator/raw_admission.ts:125`); recorded stores hold `stdoRunEnvironments` only as declaration text. What is narrowed: live schemas read the STDO schema objects at module load. `RUN_ENVIRONMENT_EVIDENCE_SCHEMA` borrows `contexts` and `accesses` (`abg/stdo_environment.ts:187`, `:190`); the live `RUN_ENVIRONMENT_SCHEMA` spreads `STDO_RUN_ENVIRONMENT_SCHEMA.entries.roles.item.entries` (`gtl/stdo_run_environment.ts:172`); the published owner names it too (`gtl/serialization_contracts.ts:218`, `gtl/canonicalization.ts:141`). In `product/stdo_environment.ts:24-197` the helpers `ref`, `path`, `digest`, `hash`, `encoded`, `inside`, `fileAt` and `ObservationFailure` are live, used 18 times after line 197. The STDO-only items in that range are the resource schema and types (`:29-41`), `inventoryPaths` (`:55`), `verifyCompanion` (`:65`) and `observeStdoEnvironment` (`:85`). The refutation pass removed GV-04's "delete the old schema" and product-install E1's "delete lines 24-197" as stated, because each would delete what live code reads.
- **Retire:** First move the shared role, `contexts` and `accesses` entries into the run-environment schemas; then delete the STDO schema, the STDO-only evidence and its observation, the admitted-then-refused shape, and their tests. In `product/stdo_environment.ts` delete only the STDO-only items above and keep the helpers (its `inside` is one of the path-confinement copies TD-37 consolidates). Keep the two live wrappers over the generic declaration or fold them into it.
- **Owner / frame:** The generic run environment owner. realization_refactor.
- **Closure:** No source admits `stdoRunEnvironments`; the generic run environment is the only shape; the run-environment schemas own their role, `contexts` and `accesses` entries.
- **Boundary:** Keep the `stdo_environment` correspondence atom label in replay (retention list). Public contract: removing the member changes the bytes of `gtl-serialization.schema.json` (GV-04). Manifest pins for the next package; qualification mirrors if a qualification record names the two tests.

#### TD-32 — Event profile residue

Status Open, one part Decision. Sources: abg-events E2; abg-workers "Retire the L-profile writer branches once L stores must reprice before appending", "Remove the never-produced runtime failure stage `c_call_open`".

- **Evidence:** Event profiles name the event-store formats a log may carry: L, RC6, S2 and W. W is unpinned, and the rc4 logs are stamped `6c8a9852`, which no profile selects (inferred) (abg-events E2). `ROOT_CURRENT_EVENT_PROFILE_REF` is an unused import at `abg/event_store.ts:42`; `m5-event-store-reopen.test.mjs:2051` imports from a home path (abg-events E2). The runtime failure stage `c_call_open` is never produced (abg-workers, read). The L-profile writer branches serve appends to L stores (abg-workers).
- **Retire:** Now: the unused import, the home-path import, the never-produced stage, and truthful profile names. After the decision: the L writer branches, once L stores must reprice before appending.
- **Owner / frame:** `abg/event_store.ts`. realization_refactor; requirement_reprice for the L part, which is the Decision part.
- **Closure:** Every profile in the registry has a truthful name and a selecting log; L stores reprice before any append.
- **Boundary:** Manifest pins: the descriptor's `profileRef` is inside every RC6 and S2 digest, so a rename keeps the referenced bytes. Replay digests for the L part: readers of L artifacts stay. Runs recorded before 2026-08-16 may carry `c_call_open` (inferred).

#### TD-33 — Milestone-named Public export subpaths, npm scripts and a ticket-named key

Status Decision (naming is Public contract). Sources: abg-events E8; design-spec-repo E9; implementation-public "Milestone-named contract barrels `app/m04` and `qualification/m05`"; gtl-validator check 5.

- **Evidence:** The m03 subpaths and the key `Symbol("r10_historical_graph_call_sources")` carry milestone and ticket names (abg-events E8). `app/m04.ts` (10 lines) and `qualification/m05.ts` (9 lines) only re-export; they are package exports and are pinned by the `REQ-P-PUBLIC-CONTRACTS-005` rows `abg.contract.app.m04` and `abg.contract.qualification.m05` (`contracts/qualification/sources/REQ-P-PUBLIC-CONTRACTS.md:93-94`) (implementation-public). `m01`, `m02` and `requirements` are manifest locators (manifest script `:693-695`, `:722-724`), so they are live and only their names are debt (gtl-validator check 5).
- **Retire:** Rename by owner, with the old names kept as aliases for one cut (recommended).
- **Owner / frame:** The owning modules of each subpath. A rename of Public names.
- **Closure:** Every subpath and key names its owner; aliases leave after one cut.
- **Boundary:** Public contract and manifest pins. `m01`, `m02` and `requirements` stay as locators (retention list).

#### B. One owner per rule

#### TD-34 — The run invocation owner restates the GTL schema family, and the copy has drifted

Status Open; carries defects on the fallback path (missing minimum-length rules, truncated tuples). Sources: gtl-validator GV-03; hog-shared-bindings "Consolidate run_invocation's restated GTL schemas…", "Split run_invocation and the two longest HoG functions…", "Consolidate the shared Public contract vocabulary and drop its residue"; product-run 9; implementation-public "One schema source for the invocation contract and one authority-slot list".

- **Evidence:**
  - `owner_bindings/run_invocation.ts:247-718` re-declares the C-term, application, graph function and module publication schemas and imports only `FOLDBACK_DECLARATION_SCHEMA` from the owner; the copy has drifted from `gtl/serialization_contracts.ts`, and no generated contract is built from it (GV-03, read). `:719-1052` holds Product shapes that have no other schema owner (hog-shared-bindings, read).
  - Refutation pass (claim 12): narrowed; it is a hand copy, and the pass evaluated both sides on the repository's valibot. The real drifts, given as copy lines in `owner_bindings/run_invocation.ts` against owner lines in `gtl/serialization_contracts.ts`: the copy is looser where `c_compose.terms` lacks `minLength(2)` (copy `:298`, owner `:60`), `c_batch.tasks` lacks `minLength(1)` (copy `:321`, owner `:69`), and three tuple sites (`authorities` and both `eventKindRefs`, copy `:549`, `:686`, `:707`) use `v.tuple` where the owner uses `v.strictTuple` (owner `:191`, `:165`, `:167`), so the copy accepts an over-long tuple and returns it truncated, because `admitContract` returns the schema output (`shared/admit/contract.ts:13`, `:27`). The copy is stricter where it requires nonblank `declarations` and `policies` values (copy `:485`, `:516`; owner `v.string()` at `:147`, `:198`), refuses `stdoRunEnvironments` in a strict object (copy `:620-717`; optional at owner `:218`), and checks `semanticJobLifecycle.stages` with `SEMANTIC_JOB_LIFECYCLE_SCHEMA` (copy `:624`), which adds the stage invariants (`gtl/semantic_job.ts:38`, `gtl/semantic_stage.ts:114-120`), where the owner uses `STAGE_SCHEMA` alone (owner `:209-211`). So adopting the owner makes admission stricter in five places and looser in four: blank declaration values, blank policy values, `stdoRunEnvironments` and the stage invariants. The refutation pass removed two drift items, `vectorIndex` (and `budget`, `bound`, `maxApplications`) having no maximum and `v.union` against `variant`, because evaluation shows each accepts exactly the values the owner accepts; it also removed hog-shared-bindings' "a correction toward the owner, not a weakening", which fails for the four looser places.
  - Where the copy runs (refutation pass, read): on the shipped path it never runs on the catalog or the view, because `RUN_INVOCATION_ESTABLISHED_RESOURCE_MEMBERS` (`run_invocation.ts:2309-2312`) passes an owner-established catalog and view by identity before any schema run (`public/binding/static_definition_bindings.ts:76-90`), and the copy is reachable only through those two members (`GRAPH_FUNCTION_SCHEMA` at `run_invocation.ts:926`, `MODULE_PUBLICATION_SCHEMA` at `run_invocation.ts:1015`, `:1017`). On the fallback path, a caller-supplied catalog the owner did not establish, a one-term compose or an empty batch passes the copy; inside the selected Program's declaration closure it is refused later with `incompatible_or_unproven` at `declaration_closure` (`product/execution_resolution.ts:763-775`, `validator/validation.ts:992`, `validator/c_algebra.ts:283` or `:404`), and outside it passes and is never read. An over-long tuple passes truncated. Resolution also binds each publication by `modulePublicationSemanticDigest` to an admitted install's contribution-manifest row (`execution_resolution.ts:378-389`, `:785-799`). The copy's `C_PROGRAM_TERM_SCHEMA` rebuilds a seven-member union inside `v.lazy` on every nested term parse (`run_invocation.ts:287-330`); the owner's lazy getter returns one prebuilt schema (`serialization_contracts.ts:37`).
  - Four owners repeat one setup sequence: `runInvocationOwner` (`:1250-1778`, 529 lines), `runCurrentIntentOwner` (`:1935-2009`), `runSelectedActionOwner` (`:2011-2079`) and a fourth; the root preparation at `:1442-1590` mirrors `hog/child_traversal.ts:154-302` (hog-shared-bindings, read).
  - The SDK start helper `populateProductRunInvocation` (`product/run_invocation_operation.ts:916-1077`) repeats `prepareProductRunInvocation` (`:606-835`), so an SDK start resolves execution twice (product-run 9, read; likely).
  - The published JSON Schema builders and the valibot `admittedInvocationRuntimeSchema` (`public/binding/definition_binding_mechanics.ts:367`) are two schema sources; `AUTHORITY_SLOTS` (`public_function_projections.ts:29`) duplicates `PUBLIC_AUTHORITY_SLOTS` (`shared/public_function_contracts.ts:78`), which also restates `InvocationAuthoritySlotName` (implementation-public; hog-shared-bindings).
- **Retire:** The restated GTL schemas (GTL is the owner), the repeated setup sequence, the second SDK preparation, the second schema source and the duplicate slot lists. The Product shapes move to the Product owners. Each of the four places where the copy is stricter is kept as an explicit check at its owner; this wave loosens no Public admission. The `stdoRunEnvironments` one disappears if TD-31 removes the member from the owner first.
- **Owner / frame:** `gtl/serialization_contracts.ts`; the Product schema owners; `prepareProductRunInvocation`; `shared/public_function_contracts.ts`. realization_refactor.
- **Closure:** Run invocation imports every GTL schema it checks; a fallback-path lane refuses a one-term compose, an empty batch and an over-long tuple; each of the four stricter checks is kept at its owner; one setup sequence; one SDK preparation per start; one slot list.
- **Boundary:** On the shipped path admission does not change, because the copy never runs there. On the fallback path adopting the owner refuses in five places what the copy accepts (repairing the defect) and accepts in four what it refuses, so it is a Public contract change in both directions there. Whether replay re-runs request admission over recorded requests is unchecked (GV-03's open question). Manifest pins (`run_invocation.d.ts` is in 47 contract rows if exported types move).

#### TD-35 — Start law has two owners, and a `graph_function` start bypasses root mode

Status Open; likely defect; the fix is ruled from existing rules (`REQ-P-POLICY-013`). Sources: abg-traversal AT-05; product-run 2.

- **Evidence:** A `graph_function` start target skips `resolveProgramStart`, confirmed in the Product (`product/execution_resolution.ts:561-575`) and independently in ABG admission (`abg/invocation_admission.ts:955-963`, `:1093-1126`, `:1293-1313`). The Program's root-mode policy is never checked for that target kind (product-run 2 and AT-05, read).
  - Refutation pass (claim 14): narrowed. The bypass holds, by reading: `abg/invocation_admission.ts:955-963` and `product/invocation.ts:1138-1146` key on the invocation variant `direct`, not on `rootMode`, and a `graph_function` start has variant `start`; `resolvedPublicStart` excludes `graph_function` targets (`abg/invocation_admission.ts:1093-1126`); Product's `startSelection` (`product/run_invocation_operation.ts:224-251`) carries `rootMode` without reading Program policy; `publicStart` (`abg/invocation_admission.ts:1293-1313`) records `rootMode: exactRequest.rootMode`, checking only `callableMembership` and the catalog's `programMembershipRefs` (`abg/invocation_admission.ts:1175-1194`). No HoG file reads root mode; the projection at `abg/instruction_assembly.ts:443` does, so the recorded value reaches F_P instructions. The recorded `rootMode` is always the value the caller stated: the shipped start constructor requires it (`ProductRunInvocationSelectionIntent`, `run_invocation_operation.ts:839-848`, copied into the request at `:1041`), and a hand-built request that omits it fails call identity, because `admitExactDefinitionCall` re-admits the request with the schema, which inserts the default (`public/binding/definition_binding_mechanics.ts:454-466`), and then compares `requestDigest` with the digest of the admitted request (`:477`). A caller can still state `supervised` against a direct Program, or `direct` against a supervised one, and it is recorded as stated. No test or support module starts a `graph_function` under a supervised Program, and the live RC12 Run does not: the tests and support that start by `graph_function` name direct Programs with `rootMode: "direct"` (`t287-st1-installed-cross-owner-hello.test.mjs:2015-2021`, `:2303`; `support/installed-qualification-conservation.mjs:387`), and the live RC12 Run's only public start is target `next` with `rootMode: direct`. The refutation pass removed two statements: that such a start without an explicit `rootMode` records the schema default `supervised`, because the default never reaches a record (call identity fails first), and that nothing downstream reads root mode, because the F_P instruction projection does.
- **Retire:** The second start-law owner. `resolveProgramStart` becomes the only owner. Under `REQ-P-POLICY-013` a `graph_function` start is a direct start, so it goes through that owner and is refused under a supervised Program.
- **Owner / frame:** `resolveProgramStart`. realization_refactor.
- **Closure:** Every start target passes through one owner, and a lane shows a `graph_function` start under a supervised Program refused.
- **Boundary:** Public contract: a `graph_function` start under a supervised Program, admitted today, is refused; no test or support module makes one, and neither does the live RC12 Run.

#### TD-36 — Workspace-binding identity and the admitted-row check are copied and have diverged

Status Open; carries a correctness risk (the weaker copy still guards native work and semantic revision). Sources: product-run 4; product-install SO-A.

- **Evidence:**
  - The identity rule is a body of nine fields, its canonical digest and the identity `workspace-binding://abiogenesis/<hex>`; `product/environment.ts:1109-1178` constructs it and `:1199-1288` checks it (product-run 4, read). product-install SO-A counts seven places, including `catalog.ts:468-488` and `materialization_operations.ts`.
  - The strict copies `isExactWorkspaceBinding` (`worksite_command_execution.ts:835-870`, `worksite_construction.ts:201-264`) are textually identical. The exported `exactWorkspaceBinding` (`worksite_effect.ts:445-487`) is weaker and guards `native_workspace_work.ts:33`, `semantic_revision.ts:73` and `worksite_effect.ts:493`, `:1253`. `exactWorkspaceAuthorityJoin` is copied three times and `isExactDirectGrant` twice. The admitted implementation-row check is copied in `implementation/leaf_execution_authority.ts:56-175` (with `admitJson`) and `worksite_effect.ts:610-695` (without) (product-run 4, read).
  - The reviewers disagree: SO-A finds identical field lists with byte-equal output; product-run 4 finds the `worksite_effect.ts` copy weaker. Both hold, for different parts. The nine-field digest body is the same in both functions. The guard is not: `environment.ts` checks `isRecord(value)`, the exact thirteen top-level keys (`:1206-1222`) and digests `admitJson(body)`, while `worksite_effect.ts:445-487` checks no record shape and no top-level key set and digests the body directly (read by the Writer). Nothing in the weaker guard refuses an extra top-level field; no test shows it (product-run 4 marks this inferred).
- **Retire:** The local copies. `product/environment.ts` exports one strict `isExactWorkspaceBinding` and `exactWorkspaceAuthorityJoin`; `abg/execution_basis.ts`, the row constructor (`:1927`), exports one strict admitted-row check; `isExactDirectGrant` moves to the run-invocation grant owner. The consolidated form is the strictest existing copy.
- **Owner / frame:** `product/environment.ts`; `abg/execution_basis.ts`. realization_refactor.
- **Closure:** One check per rule; a lane passes a binding with one extra key to native work input admission and sees a refusal.
- **Boundary:** Risk none: the checks write no bytes. The strict form may refuse a value `worksite_effect.ts` accepts today, which tightens a check.

#### TD-37 — Worksite filesystem and authority rules are written several times

Status Open; carries a correctness risk (the path confinement copies disagree). Sources: implementation-public "Worksite path confinement…", "The command helper restates the launch identity rules…", "Installed-tree inventory: one walker…", "Worksite leaf authority: one currentness gate…".

- **Evidence:**
  - Path confinement: the parent process and the command helper process each keep their own path rules, and a third set lives in `implementation/release_publication.ts:37-38` (`inside`, `safeRelative`, which assume `/` separators). The rules differ, for example on names such as `..x` (read).
  - Refutation pass (claim 13): holds, evaluated on verbatim copies of the predicates, and the scope is wider than stated. Under a root `/w/root`, the parent's `containsPath` (`implementation/worksite_command_execution.ts:320-323`) refuses `/w/root/..x`, `/w/root/..x/f` and `/w/root/...`, while the helper's `containsAbsolutePath` (`implementation/worksite_command_helper.ts:349-353`) and the release `inside` (`implementation/release_publication.ts:37`) accept them; the release `inside` also refuses the root itself (strictly inside). Two more predicates use the helper's rule: `product/worksite_effect.ts:500-504` and `inside` at `product/stdo_environment.ts:46-48` (strictly inside). About ten inline `rel.startsWith("..")` checks use the parent's rule: `abg/worksite_construction_recovery.ts:153`, `abg/semantic_revision.ts:965`, `abg/worksite_revision.ts:794`, `:822`, `abg/transport_contracts.ts:577`, `abg/semantic_stage.ts:294`, `:381`, `abg/semantic_job.ts:403`, `implementation/leaf_invocation_port.ts:1099` and `validator/self_conformance.ts:185`. The owners disagree on a real subject: Product's subject normalizer (`product/worksite_effect.ts:741-765`) admits a top-level `..x/f` and Product's protected-root check does not flag it, and the parent then refuses the same subject at Worker dispatch (`implementation/worksite_command_execution.ts:337`, "protected subject escapes the canonical worksite root"). The parent's exclusion checks fail open (`implementation/worksite_command_execution.ts:342` on `.abg/events/..x/f`; `:449`, `:459` on a root at `/p/..x/state`), but not through `constructWorksiteSubject`, because Product's `protectedWorksitePath` (`worksite_effect.ts:506-515`, used at `:799-803`) flags that subject first; whether any route builds a `WorksiteExecutionTask` subject without that constructor is unchecked.
  - Launch identity: the helper (`worksite_command_helper.ts:234-242`, launched per `worksite_command_execution.ts:274-276`) restates the launch identity rules, although it already imports Product worksite modules; that it avoids `abg/` to keep its start-up graph small is inferred.
  - Inventory: three copies of one recursive walk read and hash every file; `product/install_product.ts:181` is the related manifest-based check.
  - Leaf authority: one currentness gate body is written three times, with the same comment word for word (port `:1162-1163`, file replace `:332-333`); the row validator `implementation/leaf_execution_authority.ts:57-150` duplicates `product/worksite_effect.ts:610-698`.
- **Retire:** The copies: one path-confinement owner that the five predicates and the inline checks call, the helper imports the launch identity rules, one walker, one currentness gate called where it is needed.
- **Owner / frame:** The worksite owners in `product/`. realization_refactor.
- **Closure:** One rule per question, with lanes for `..x`, `..x/f` and `...` as top-level names and for the root itself.
- **Boundary:** Replay digests: the helper's attempt reference, its archive path digest and its `productDelta` rows enter recorded artifacts, and refusal order is recorded. Choosing one rule for `..x` changes behaviour, so the strictest rule wins. The parent's rule is the stricter one when it checks containment and the looser one when it checks exclusion (refutation pass), so "strictest" is judged per use.

#### TD-38 — Product law inside ABG and HoG

Status Open, design_reframe. Sources: abg-traversal AT-14; abg-calls E8; hog-shared-bindings "Move product-specific leaf dispatch out of hog/ccall_lifecycle"; implementation-public "Leaf invocation port: features are branches inside one closure"; gtl-validator GV-08.

- **Evidence:**
  - Product worksite and governance law sits in ABG admission (AT-14, read).
  - C0 authentication sits in the CCall outcome owner, `abg/c_call_outcome.ts:138-500`; whether its hash is the right strength is to be investigated (abg-calls E8).
  - `hog/ccall_lifecycle.ts` imports Product identities (`:1`, `:3-4`, `:15-17`, `:45-52`), lists Product implementation refs in `receivesCommandAmbientEnvironment` (`:78-81`) and builds worksite authority in `worksiteLeafAuthority` (`:142-215`) (hog-shared-bindings, read).
  - `implementation/leaf_invocation_port.ts` (1,700 lines) dispatches per feature inside one closure (for example `:675-680`, `:1175-1192`), and `LeafExecutionOccurrence` is a bag of optional per-feature members (implementation-public).
  - `validateProgramSubject` (`validator/validation.ts:732-1954`, about 1,220 lines) holds every relation law and imports Product owners, so retiring a Product feature edits the language validator (GV-08, read).
- **Retire:** Nothing is removed; the law moves to the feature owners: about 500 lines from ABG admission, 400 from the CCall outcome owner, 250 from HoG, 1,000 from the validator, and the port's branches.
- **Owner / frame:** Each Product feature owner. design_reframe.
- **Closure:** ABG, HoG and the generic validator import no Product feature module.
- **Boundary:** Replay digests if a refusal text or order changes; the move keeps refusal codes and order, shown by a writer probe as at C-15. Do this after TD-26 and TD-28, which remove features the move would otherwise carry.

#### TD-39 — Route targets and other relations are derived again by HoG, ABG admission, cursor ancestry and replay

Status Open. Sources: abg-traversal AT-02, AT-13, AT-15; hog-shared-bindings "Stop HoG re-deriving values ABG already established…", "Give ABG the projections HoG builds from raw event envelopes", "Read the no-action disposition set and the graph-span projection from ABG".

- **Evidence:**
  - Route-target relations are computed in four places and belong in `gtl/source_path.ts` (AT-02). Root and child admission build the execution basis body separately (AT-13). `isDeclaredStructuralTarget` (`abg/traversal_route.ts:3142`) recomputes the cursor computed at `:3114` and compares it with itself (AT-15, read).
  - HoG hashes the whole `GtlProgram` on every `traverse` call (`hog/traversal.ts:587`), compares an object with itself through `canonicalEquals` (`:654-667`), and rehashes the admitted input at entry (`hog/entry.ts:119-122`) (read).
  - HoG builds projections from raw event envelopes (`workflow_lifecycle.ts:582-593`; `recursion_lifecycle.ts:747-757`, `:825-830`), hard-codes the no-action disposition set that ABG owns as `NO_ACTION_DISPOSITIONS` (`route_proposal.ts:552-578`), and casts to `GraphSpanReentryProjection` where ABG has the parser (`:781`, `:889`) (read).
- **Retire:** The re-derivations. About 150 lines of relations and 60 lines of projections move to their owners; about 395 lines go.
- **Owner / frame:** `gtl/source_path.ts`; ABG's route and replay owners. realization_refactor.
- **Closure:** HoG reads relations and projections from ABG; one basis body builder.
- **Boundary:** Keep the current-cursor comparison in `admitRoute`: it is a currentness gate, and only its data source changes (retention list). Replay digests if a moved relation is not byte-identical, or if the shared basis builder changes field order. Each HoG removal cites the owner check that already holds.

#### TD-40 — The Public operation layer: outcome schemas, call admission and the read ports

Status Open, one part Decision. Sources: implementation-public "Make the published outcome schemas describe what the transport returns", "One owner for DefinitionCall admission", "Public members that nothing executes"; abg-events E4 (routing part), E7, E11; product-run 6, 7; product-install ST-A, ST-B.

- **Evidence:**
  - The transport and CLI return `installed_definition_call_transport_result`, `installed_definition_call_transport_refusal`, `public_transport_refusal` and the receipt `definition_host_receipt`; the published schemas declare four envelope kinds no source produces, for example `indexed_invocation_admission_refusal` (`public/binding/public_function_projections.ts:427`) (grep and read).
  - `admitExactDefinitionCall` (`definition_binding_mechanics.ts:433`) admits a call; bound owners admit it again inside the callable (`static_definition_bindings.ts`, `bindStaticOwner`, `admitResources`) (implementation-public, read).
  - No executing test was found for seven `project.read` members, and four more are named only in roster or inventory assertions (implementation-public, likely).
  - Twelve reads outside the run-read owner (`product/project_read_definition_bindings.ts:992-1001`, `legacyBindings`) accept only a reopen assertion and skip the held owner; seven of them appear only in the capability-inventory test, and `assessment_evidence` and `witness_evidence` always return `target_absent` (abg-events E4, read). The second `ABG_PROJECT_READ_CONTRACTS` is dead (E11). `persistEventLog` persists nothing (E7).
  - Refutation pass (claims 7 and 8): holds. `abg/event_log.ts` (57 lines) reads, decodes, compares and returns, and `readAll` (`abg/event_store.ts:2590`) writes nothing; `persistEventLog`'s users are the barrel (`abg/index.ts:395`), `t287-event-body-encoding.test.mjs:10`, `:285` and two design notes. The built read module has 18 members, 12 legacy reads and 6 run reads; `binding()` (`abg/project_read_definition_bindings.ts:894-990`) accepts only a reopen resource for the twelve (by reading).
  - Function-map `*_CONTRACTS` exports and `*Port` interfaces with no implementer remain from the pre-packet owner tables, and one name means two things (`workspace_operations.ts:679-686` against `workspace_operation_contracts.ts:157`) (product-run 6, read; ST-A). The read envelope is built twice (`product/project_read_operation_contracts.ts:129-209`, `abg/project_read_operation_contracts.ts:294`) (product-run 7). `public_contract_publication.ts` (771 lines) is build-time code that every runtime import of `product/index.js` loads (ST-B).
- **Retire:** The second call admission, the dead read contracts, the function maps and unimplemented ports, the second envelope builder and `persistEventLog`; route the twelve reads through the held owner. `public_contract_publication.ts` moves to the build. Members that nothing executes get one lane each through the installed CLI or are withdrawn with their read owner. Decision: the schema follows the transport, or the transport produces the published envelope.
- **Owner / frame:** `public/binding/`; the packet tables and `*_DEFINITION_BINDINGS`; the read port. realization_refactor; requirement_reprice for any withdrawal.
- **Closure:** Every published outcome schema describes a produced envelope; one admission per call; one name per table.
- **Boundary:** Public contract (schemas, barrel names, `./abg` exports); manifest pins (generated packets stay byte-equal).

#### TD-41 — Worker outcome classification and the three timeouts behind one setting

Status Open, design_reframe for the profile boundary. Sources: abg-workers "Give the worker failure classifier one set of inputs and one closed label set", "Separate the F_P actor's timeouts from the C2 command limits…"; RC12 ledger rows L, L2 and H (the 60 s default).

- **Evidence:** The classifier (`abg/transport_contracts.ts:112`) has three call sites and a hard-coded parser, `transport_exception` falls outside its label set, and the salvage rule is written twice (`worksite_construction.ts:232-233`, `consensus.ts:613-615`) (read). `ABG_TS_FP_TIMEOUT_MS` (60,000 ms, `abg/actor_process.ts:712-715`) serves as the F_P actor's start-up limit, its inactivity limit and the C2 command limit, and `liveness.ts:102` enforces their equality; a first response was measured at 83.5 s (abg-workers, measured in RC12; not re-measured at head).
- **Retire:** One classifier input set and one closed label set; three separate settings.
- **Owner / frame:** `abg/transport_contracts.ts`; `abg/actor_process.ts`. realization_refactor; design_reframe for the profile boundary.
- **Closure:** Every outcome label is in the closed set; each limit has its own setting and lane.
- **Boundary:** Replay digests: the verifier at `actor_process.ts:536` keeps its result on historical artifacts, and `liveness.ts:102` keeps accepting the recorded equal-value bindings, so new bindings need a profile boundary (TD-66).

#### TD-42 — Program law stated in several places

Status Open. Sources: gtl-validator GV-05, GV-06, GV-09; implementation-public "Implementation descriptors and leaf candidates are hand-built in every module".

- **Evidence:** The closure event sequence has four computing owners and eleven publication modules with the literal list (GV-05, grep and read). C-term local law has three owners in sequence: the schemas in `serialization_contracts.ts`, `assertCProgramLocalRelations` (`gtl/c_algebra.ts:264-318`) and `inspectTerm` (`validator/c_algebra.ts:250-461`) (GV-06, read). The single-leaf implementation resolution duplicates the set path (`validator/implementation_resolution.ts:130` against `:230`); `resolveImplementation` is a live manifest locator (`:852-867`) (GV-09). Fifteen files build `packaged_leaf_implementation_descriptor` by hand, while `implementation/semantic_stage.ts:27-31` and `semantic_revision.ts:31-33` already derive theirs from the GTL binding (implementation-public, grep).
- **Retire:** The literal lists (derived from one owner), the repeated C-term checks, the single-leaf duplicate behind the locator, and the hand-built descriptors.
- **Owner / frame:** GTL for program law; the GTL binding for descriptors. realization_refactor.
- **Closure:** Each law is stated once and derived elsewhere; published closure contracts keep identical bytes.
- **Boundary:** Public contract on diagnostic codes (manifest script `:8` publishes them); manifest pins and replay digests for descriptor and evidence-candidate digests.

#### TD-43 — Small second owners

Status Open; one sweep. Sources: abg-calls E7; abg-events E9, E12; abg-workers "Small schema and helper duplicates"; hog-shared-bindings "Keep one nonblank-string predicate", "Merge the duplicate prefix helpers in hog/operator_support", "Adopt or drop the unadopted shared Outcome atoms"; product-install SO-B, SO-C, SO-D.

- **Evidence:**
  - Exact key sets: `shared/admit/record.ts:20` `hasExactKeys` owns the rule; `c_call.ts:3665` and `retry_progress.ts:155` restate it (abg-calls E7). The cursor-origin input digest and the F_H continuation identity each have a second owner (E7).
  - The stricter `hasExactDataFields` is defined six times: `validator/conformance_operation.ts:84`, `abg/witness_admission_operation.ts:282`, `abg/project_read_ports.ts:208`, `abg/probabilistic_result.ts:136`, `implementation/leaf_invocation_port.ts:178` and `implementation/leaf_execution_authority.ts:91` (grep by the Writer). abg-calls counts six; abg-workers counts three and cites `probabilistic_result.ts:146`, which lies inside the declaration that starts at `:136`; its three are the pairs the clone census reports.
  - Event Calculus has two export lists and states its axioms twice (E9); vocabularies and record shapes are stated twice (E12); `ActorProcessRequest` duplicates `ProbabilisticWorkerRequest` (abg-workers).
  - One nonblank rule is written three times (`shared/admission_predicates.ts:17`, `shared/references.ts:1`, `shared/admit/contract.ts:42`); prefix helpers in `hog/operator_support` are duplicated; `refused`, `andThen` (`shared/refusal.ts:22`, `:33`), `selectRefusal` and `exactMatchOutcome` (`shared/select/exact_match.ts:57`, `:68`) are declared by the common-library design and unadopted (hog-shared-bindings).
  - The Public contract catalog digest rule has three definitions (`verify_product.ts:1120`, `public_contract_publication.ts:415`, `scripts/generate-product-manifest.mjs:1068`); the native declaration relation shape has two schema copies and a hand validator; the Product identity row is declared four times (product-install SO-B, SO-C, SO-D, read).
- **Retire:** The second owners; one data-descriptor variant of `hasExactKeys` in `shared/admit`; adopt or drop the unadopted atoms.
- **Owner / frame:** `shared/admit`, `abg/calculus`, `product/` identity contracts. realization_refactor.
- **Closure:** Each rule has one definition; digests unchanged where the bodies were equal.
- **Boundary:** Risk none for type-level and pure-helper changes; manifest pins where an exported name leaves (`refusal.d.ts`, `operator_support.d.ts` are in 47 contract rows).

#### C. Dead code

#### TD-44 — Declarations that no runtime path reaches, unused locals and never-produced kinds

Status Open, one part Decision (the two types exported through `./public`); one sweep, grouped by the feature each belonged to. Sources: abg-calls E6; abg-events E10; abg-traversal AT-10; abg-workers "Compiler-unused locals and parameters in this area", "Remove package-only wrappers whose only consumers are tests" (the two with no consumer); gtl-validator GV-11, GV-12 (the unused local only); hog-shared-bindings "Delete HoG's dead public twins…", "Delete the orphan shared barrel", "Compiler-unused in this area"; implementation-public "Dead residue, grouped by feature", "Compiler-unused names in this area"; product-install K-A, K-B, K-C, the unused type parameter; product-run 6, 10.

- **Evidence:** census `none` tier or compiler-unused, then grep, unless stated.
  - ABG: `isCCallRuntimeFailureCloseError`'s dead arm, `plan_mismatch`, `AbgHistoricalTerminalSelection`, `vector_contract_mismatch`, `priorDerivation` (abg-calls E6); declarations reached only by tests, by feature (abg-events E10); compiler-unused names (AT-10; abg-workers); two package wrappers with no consumer (abg-workers).
  - GTL and validator: `CONFORMANCE_CONTRACTS` (`validator/conformance_operation.ts:345`); the interface `ConformancePort` (`conformance_operation_contracts.ts:101`), whose name collides with the live const at `conformance_operation.ts:341`; `GTL_SERIALIZATION_SCHEMA_FAMILY` (GV-11); the unused local `normalized` (`validator/qualification.ts:456`, GV-12). GV-12's reported type error is a census artifact (Method and limits).
  - HoG and shared: public twins whose declarations appear only in the file inventory (`workflow_lifecycle.ts:1129`, `:1142`; `recursion_lifecycle.ts:1128`, `:1134`, `:1163`; `structural_transition.ts:63`, identical to `:70`); the orphan barrel `shared/index.ts` (16 lines); `boundInput` and `definitionDigests` parameters (`hog/route_proposal.ts:200`, `:1043-1044`); the type parameter of `ReferenceDigest<T>` (`shared/public_invocation.ts:9`).
  - Implementation and Public: `public/gap_authority.ts` (144 lines), a superseded start seam with no runtime caller and no test, which `public/index.ts:1-4` re-exports type-only (`PublicGapAuthority`, `PublicGapSource`) into the `./public` SDK export (`T/package.json:36-39`), so it is `sdk` tier, not `none`; `ProbabilisticLeafImplementation` (`implementation/contracts.ts:218`); `isClosedProbabilisticLeafInvocation` (`leaf_invocation_port.ts:138-176`); the never-produced `direct_owner_primitive` (`owner_contract_source_set.ts:51`); two unused parameters (`worksite_command_helper.ts:379`, `worksite_construction.ts:151`).
  - Refutation pass (claim 19): narrowed for both the implementation-public residue and the HoG twins. Manifest reach: `public/gap_authority.d.ts`, `implementation/contracts.d.ts` (which holds `ProbabilisticLeafImplementation`), `public/binding/owner_contract_source_set.d.ts` (which holds `direct_owner_primitive`) and `public/binding/public_function_family.d.ts` (which holds `IntrinsicOwnerNativeSchemaIdentity`) each appear in 47 contract rows and in `productRelativeLocators`, so each deletion moves 47 contract-row digests and `productContentDigest` (parsed). Test users: `t287-c2a-fp-source-contract.test.mjs:47-81`, named in `T/package.json`, imports `isClosedProbabilisticLeafInvocation` from the built module and asserts that it refuses missing and forged carrier pairs. The HoG twins have no runtime caller, no barrel export and no contract row (each `.d.ts` appears once, in `productRelativeLocators`), but tests reach them as members of the built modules: `beginRecursionApplication`, `completeRecursionChild` and `restoreDeferredRecursion` from `t287-route-reconstruction.test.mjs:381`, `:388`, `:393`, which asserts that `publicStep` equals `completePublicOutcome(ownedStep)`; `completeWorkflowLocus` from `t287-held-prefix.test.mjs:129-130`; `advanceStructuralTransition` from `t287-retry-run-prefix.test.mjs:97`, `:153`, `:287` and the F09 falsifier (`falsifiers/runtime-f09-worker.mjs:1084-1086`, `:1565`); and the "dead" `complete` branch of `deferredRecursionCompletionsMatch` is asserted at `t287-route-reconstruction.test.mjs:384-385`. None of those test files is in an npm script. The refutation pass removed implementation-public's Risk "none" and "no manifest row", because four of the files sit in 47 contract rows, and hog-shared-bindings' reading of the test hits as words rather than imports, because the tests load the built modules as namespaces or by dynamic `import()`.
  - Product: refusal codes left from refusal-shaped readiness (`publication_not_bound`, `unresolved_readiness_prerequisite`, K-A), `set_mismatch` (`implementation_resolution.ts:145`, K-B), `workspace_not_ready` (`materialization_operations.ts:72`, K-C), the unused `<T>` (`contracts.ts:196`), the unused import at `product/worksite_operations.ts:17` (product-run 10). The function maps of product-run 6 are owned by TD-40.
- **Retire:** All of the above. For `RefDigest<T>` (`product/result_assessment_operation.ts:34`), remove the parameter and every type argument or keep it as a documented phantom type; do not delete `T` alone. The source-contract test `t287-c2a-fp-source-contract` moves or goes with `isClosedProbabilisticLeafInvocation`, and the public-equivalence assertions in `t287-route-reconstruction`, `t287-held-prefix`, `t287-retry-run-prefix` and the F09 falsifier are rewritten or deleted with the HoG twins and the `complete` branch.
- **Owner / frame:** Each declaring module. realization_refactor.
- **Closure:** The census `none` tier and compiler-unused list hold only intentional retentions, and no test loads a deleted member from a built module.
- **Boundary:** Not dead: the `Assert<Equal<…>>` agreement types in `worksite_preparation_contracts.ts:78-119` (product-run, refuted as dead) and `observeWorkspaceEnvironmentWork` (`environment_admission.ts:561`, an observation counter; AT check 1). Public contract: removing `PublicGapAuthority` and `PublicGapSource` is a type change on `./public`. Manifest pins: 47 contract-row digests and `productContentDigest` for each of the four `.d.ts` files above; five HoG locator digests; `priorDerivation` is on an exported signature.

#### TD-45 — Package exports that serve only tests

Status Open. Sources: abg-calls E5; abg-traversal AT-12; abg-workers "Remove package-only wrappers…" (the three with test consumers); hog-shared-bindings "Decide the public twins inside the packed declaration closure"; product-run 13.

- **Evidence:** Public complete-output and store wrappers in ABG serve tests (abg-calls E5); store-based wrappers over the `…AtPrefix` owners and complete-mode variants are package tier and named nowhere under `contracts/` (AT-12; `admitInvocation` is the exception and belongs to TD-30). `route_proposal.ts` gives every proposer a public `ReplayState` overload beside the `@internal` guard overload, and these files are in 47 contract rows each (hog-shared-bindings; the row count as in Method and limits). Observation-only probes sit in production modules (`run_invocation_operation.ts:580-604`, `execution_resolution.ts:428-438`, `catalog.ts:438-444`) and are read only by `test_env/support/owned-call-reference.mjs` (product-run 13, read; investigate for the §10.11 text).
- **Retire:** Ruled from existing rules: the first edition already rules that a package barrel is not the Product contract; the manifest's declared locators are. So these wrappers move to test support or go (about 300 lines moved, 350 removed).
- **Owner / frame:** Test support; the owning `…AtPrefix` functions. realization_refactor.
- **Closure:** No package export exists only for a test.
- **Boundary:** Observation-only counters that a proof test reads stay until one owner module holds them (retention list). Public contract in the weak sense: `./abg` is a package export. Manifest pins (47 contract rows change their declaration-closure digests; the C-15b lesson applies to a retyping's reach).

#### TD-46 — Functions and branches that no test executes

Status Investigate until the coverage run reports. Source: the whole-suite coverage run.

- **Evidence:** Method (read by the Writer): `census/coverage-aggregate.mjs` folds the raw V8 coverage that each test process writes under `NODE_V8_COVERAGE` and keeps only scripts under `/build/code/src/` whose length matches the build; `census/coverage-report.mjs` maps the aggregate onto TypeScript spans through a sourcemap build and writes `coverage-never-executed.json`, `coverage-by-declaration.json` and `coverage-summary.json`. "Never executed" means executed by no process of the run; a gated test that skips executes nothing, so code reached only by gated lanes reads as never executed. The coverage run started on 2026-11-12 at 01:27. No `coverage-*.json` exists when this edition is written; the results follow, and the Executive fills this entry.
- **Retire:** To be set from the results.
- **Owner / frame:** To be set.
- **Closure:** Every never-executed function is either covered by a named lane, recorded as a gated lane's subject, or retired.
- **Boundary:** Results follow; nothing retires on this entry before they do.

#### D. Structure

#### TD-47 — `construction_continuation.ts` is more than half pasted return types

Status Open. Source: abg-calls E2.

- **Evidence:** `abg/construction_continuation.ts` spells out six return types in full; about 1,330 of its 2,480 lines go if they are named, and about 1,460 signature lines become about 130. The pattern dates from `67c333799` (read). A build and a `.d.ts` diff settle the line figure.
  - Refutation pass (claim 6): narrowed, by type-identity checks (`Equal<A,B>` and one-way assignability) under the repository's compiler options. The pasted types are mutually assignable with their named types, not all identical. The pasted `childFunction` is mutually assignable with `Readonly<GraphFunction>` but lacks the optional `failedChildDiagnosticClassRefs` on the recurse `foldback` (`gtl/serialization_contracts.ts:99-102`), which `9ad8d7e83` added on 2026-11-11, after the paste in `67c333799` on 2026-10-21: the drift is already in the paste. Identical: the embedded prepared type and `PreparedConstructionIntentContinuation`, `request` and `SelectedActionUseRequest`, and the two `prepareConstructionIntentContinuation` overload copies. Not identical: the `prepareConstructionContinuationOperation` overload copies, because the public copy types `prefix` as `ValidatedRuntimeEventPrefix | DurablePrefixCoordinate` in the `duplicate` and `invalid_history` variants while the internal copy and the implementation type it as `RuntimeEventPrefix | DurablePrefixCoordinate`, so one named type needs a prefix type parameter. The projector type is a mutable `EffectfulPublicInvocationPriorAdmission` with `operationId` narrowed to `"abg.operation.run.continue"`; abg-calls E2's replacement widens `operationId` to seven literals, and its one caller (`abg/effectful_invocation_truth.ts:241-245`) still compiles. With `stripInternal` the 708-line `.d.ts` keeps only the public overloads. The manifest names `abg/construction_continuation.d.ts` in 47 `publicContractCatalog` declaration inventories and in `productRelativeLocators`, so a text change moves 47 `declarationDigest` values, each of those rows' `contractDigest` (`sha256Canonical(declarationInventory)`, `scripts/generate-product-manifest.mjs:610-615`) and `productContentDigest`; the emitted JavaScript does not change. The refutation pass removed abg-calls E2's statement that the pasted types are the same as the named types, because one has drifted and two overload copies differ.
- **Retire:** First re-sync the pasted `childFunction` with `GraphFunction`; then replace the spelled-out types with six named types, the operation result taking a prefix type parameter, and keep the projector's narrowed `operationId` or accept the widening knowingly.
- **Owner / frame:** `abg/construction_continuation.ts`. realization_refactor.
- **Closure:** The build passes, the emitted JavaScript is unchanged, and the emitted declarations differ from today's only by the named types and the re-synced `foldback` field.
- **Boundary:** Manifest pins: 47 contract-row digests and `productContentDigest` move, because the emitted `.d.ts` text changes for a package-exported module.

#### TD-48 — Overload triples, repeated parameter bundles and hand-written event envelopes

Status Open. Sources: abg-calls E4; product-install ST-C; abg-traversal check 6.

- **Evidence:** 64 overload triples in the call area and about 236 in the codebase, 15 hand-written CCall envelopes, and a cloned opening guard (`abg/c_call.ts:5465-5488` against `:5616-5639`) (abg-calls E4, clone census and read). Functions over 200 lines block consolidation, for example `linkNativeContractSet` (`product/declaration_exports.ts:2068`, 1,304 lines) (ST-C), `admitRoute` (843 lines) and `admitInvocationWithRequest` (872 lines) (abg-traversal check 6).
- **Retire:** One owner for each triple's parameters (about 650 lines in the call area) and one CCall envelope builder with the shared guard (about 250).
- **Owner / frame:** The owning modules. realization_refactor.
- **Closure:** No hand-written CCall envelope; triples share one parameter bundle.
- **Boundary:** The envelope change must not change event bytes, proven by byte-equal candidates; manifest pins for the declaration text. Do this after TD-25 and TD-26, which remove many of the triples.

#### TD-49 — Build-time and release code in runtime modules

Status Open. Source: implementation-public "`release_publication.ts`: version-line literals and a misplaced owner". product-install ST-B is owned by TD-40, whose sources name it.

- **Evidence:** `implementation/release_publication.ts` hard-codes the 5.0.0 line, although the request carries `requestedIdentity.versionLine` (`:54`). It is a release owner, not a leaf implementation (it has no descriptor), yet `abg/artifact_truth.ts:4`, `product/index.ts:595` and `product/project_read_ports.ts:5` import it from the implementation tree (read).
- **Retire:** The literals, read from the request; the module moves to a release owner.
- **Owner / frame:** The release owner (TD-71). realization_refactor.
- **Closure:** No version literal in release code; no runtime module imports it from `implementation/`.
- **Boundary:** Risk none for bytes, provided the 5.0.0 behaviour is preserved.

#### E. Performance

Measured entries come from `findings/performance.md` (P1 to P8) and keep its units and load note: wall-clock times were taken under a load average of 14 to 27 on 16 cores, so CPU, counters, bytes and ratios are the figures to rely on. Its subject is the build at `34aafb2c6` and the installed `5.0.0-rc.12`. P1 maps to TD-54, P2 and P5 to TD-52, P3 to TD-50 and TD-51, P4 and P8 to TD-53, P6 to TD-56, and P7 (test-side) to TD-58. TD-55 has no measurement.

#### TD-50 — Cold decode of the event log

Status Open. Sources: abg-events E3; performance P3 (the per-body part) and M2; the RC6 to RC7 operational review.

- **Evidence:**
  - Structural, by read: `decodeRuntimeHistoryDescriptor` (`abg/event_store.ts:3773-3833`) runs `foldRuntimeHistoryDescriptor` (`:3747-3771`), which hashes the log in 64 KiB chunks for the prefix check while a per-row callback parses, re-serializes and hashes each row, so each byte is hashed three times and two of those compute the same digest. The body reader built in `constructRuntimeHistory` (`:3698-3741`) re-reads a body by location and on every read parses, re-serializes, compares, hashes and re-digests it. `decodeHistoricalEvents` (`:3465-3574`) is a second row decoder (E3).
  - Measured per cold CLI read on a 2,198-row, 17.4 MB store (P3, M2): one decode, 7,113 body reads (92.2 MB, 5.3 times the log) and 14,230 `stat` calls, two per body read, because `readRuntimeHistoryRowBytes` (`:3670`) checks `fstat` and the path identity before and after each read. Canonical JSON and hashing are 64.5% (`run_status`) and 67.6% (`run_replay`) of CPU; 6.2 to 6.6 s CPU against 1.23 s on a 50-row, 3.9 MB store.
  - Measured earlier, not re-measured at GB scale: canonical JSON and SHA-256 at 52 to 55% of cold-read CPU (RC6 F2); cold launch rising from 120 s to 487 s on a 2 GB log (RC7 build-cycle diagnosis).
- **Retire:** Per-row re-canonicalization of bodies this process has already authenticated, since the prefix digest and the physical digest already prove the bytes (RC6 F2 stands); one prefix hash stream; one row decoder (about 110 lines).
- **Owner / frame:** `abg/event_store.ts`. realization_refactor.
- **Closure:** A cold read authenticates each row once; the body-read counter is at most the row count.
- **Boundary:** Risk none for bytes: no digest formula or stored byte changes. Cold re-authentication stays for copied or foreign bytes, and the cold path stays the qualification oracle.

#### TD-51 — Reads that decode the whole log twice

Status Open. Sources: abg-events E4 (performance part), E13; performance P3 (the reopen and held-read parts) and M3.

- **Evidence:**
  - Structural, by read: each of the twelve reads outside the run-read owner reopens the store, which decodes the whole log (`acquireAbgEventResource`, `definition_event_resource.ts:331`; `event_store.ts:4254`), and then `admitJson` returns a detached copy of the packet with its prefix, so the identity cache misses and the log is decoded again (E4). `projectRunStatus` computes `projectEndedChildFrames` twice per call (`project_read_ports.ts:1061-1095`, `replay.ts:449`), and that function reads every probe body once any frame has ended (`replay.ts:350-374`) (E13, structural, not measured).
  - Measured per in-process read on the W1 store (P3, M3, CPU): a reopen read costs about 11 s, with 2 full decodes and 14,170 body reads (183 MB, 10.5 times the log), and calls 2 to 6 cost the same. A held read costs 3.8 s, with no decode but 2 by 2,845 body reads. The double decode comes from construction (`populateRunReadAtDurablePrefix`, `project_read_definition_bindings.ts:680`) and the call's own reopen in `runInstalledDefinitionCallTransport` (counters per phase). The recurring folds are `projectOwnedRunReplayContext` (`abg/replay.ts:2195`), `projectRetainedWorksiteInputAtPrefix` (`abg/worksite_input_provenance.ts:279`, 2.5 s per read) and the liveness fold over 1,225 probe rows (17% of a cold read).
  - That the 2,845 held re-reads are basis bodies is likely, inferred from the retention rule at `abg/runtime_history.ts:330-341`; a per-kind body-read counter settles it.
  - Refutation pass (claim 8): holds, by reading; nothing was run. The first decode comes from `binding()` (`abg/project_read_definition_bindings.ts:894-990`), which accepts only a reopen resource; the second from `project()` (`abg/project_read_ports.ts:1837`), where `prepareRead` (`:686`) runs without a retained prefix, `admitJson` copies the packet, the `activeSelection` WeakMap misses, `coldHistoryReads` increments and `decodeRuntimeHistoryDescriptor` runs again (`abg/event_store.ts:3637-3661`). The two members that always return `target_absent` also decode twice; the basis-mismatch refusal decodes once.
- **Retire:** The second decode on the reopen path (construction and the call share one acquisition); the per-read re-derivation of the run-read context, held per prefix coordinate for the life of the held resource; the second `projectEndedChildFrames`. Routing the twelve reads through the held owner is TD-40's.
- **Owner / frame:** `abg/project_read_ports.ts`. design_reframe (the read port, the event store reader and the transport).
- **Closure:** A held read makes no full decode and no per-read refold; read projections stay byte-equal to cold reads.
- **Boundary:** Do not re-retain basis bodies: RC10 released them at the operation lifetime to discharge RC9 F1, so the held fact is the derived projection, bounded by open prefixes. Replay digests: projections stay byte-equal to cold reads. A retention-lifetime decision is needed.

#### TD-52 — Product verification and install repeat their own work

Status Open, one part Decision. Sources: product-install PERF-A, PERF-B, PERF-C, PERF-D; `rc12-executive-01/M_RETURN.md`; performance P2, P5 and M4.

- **Evidence:**
  - Measured per Run, from the counters of one W1 start CLI (P2): 139 content verifications, 378,415 file hashes, 420,080 `lstat` calls and 41,526 directory lists. That is 71 full verifications of the 5,325-file, 68.5 MB root product plus 68 of a 5-file fixture, about 4.9 GB read and hashed (derived). Each verification parses and digests the 3.28 MB toolchain manifest (`installedProductContentMatches`, `product/install_product.ts:181`). On-thread CPU is 4.5 s plus 2.1 s; the start CLI used 23.9 s of system CPU against 52.3 s user, most of it likely thread-pool file work. Call sites: `prepareInstalledProductModules` (`product/installed_module.ts:28`), reached from `loadInstalledProductSemantics` (`product/semantics.ts:395`), `execution_resolution.ts:879` and `implementation_resolution.ts:179`; and `verifyInstalledContent` (`semantics.ts:714`) at leaf-port construction (`implementation/leaf_invocation_port.ts:973`) and at every leaf authorization (`:1649`). About three per leaf invocation (inferred). Earlier: 3 verifications and 15,969 hashes per SDK call (RC9 F3).
  - Measured per verify and install of the release archive (P5, M4): `verifyProduct` uses 23.9 to 24.8 s CPU, 18.1 s of it in `resolveNativeDeclarationClosures`, which builds a TypeScript program and runs semantic diagnostics (`product/declaration_exports.ts:1485`, `:1733`). `constructResolvedProductLock` builds a second program and runs diagnostics again through `linkNativeContractSet` (`:2068`, `:2530`), 6.1 to 7.3 s CPU. Declaration analysis is about 80% of 21.4 GB allocated; the live heap after a full GC peaks at 889.8 MB during verify, which confirms `M_RETURN.md`'s 0.93 GB. `nativeDeclarationEvidence` is 11,006,206 B of the 14.3 MB verified artifact and rides into the lock, the install candidate, the setup event row and every artifact-truth digest.
  - Refutation pass (claim 20): holds, and the cost is larger than the seven call sites suggest. `productVerificationCoordinates` (`product/verify_product.ts:229-310`) canonicalizes and hashes three bodies per call, one embedding the whole `nativeDeclarationEvidence` (`:270`) and one `checkedPayloadFiles` (`:299`), and `sha256Canonical` keeps no cache (`shared/digests.ts:25-29`). The seven sites are `catalog_definition_bindings.ts:344`, `:435`, `:511`, `:546`, `install_definition_bindings.ts:156`, `verification_operation.ts:58` and `environment_definition_bindings.ts:151`. Two of them, `catalog_definition_bindings.ts:435` (`inputRow`) and `:511` (row provenance), run inside `projectAdmissionRows` once per contribution-manifest row of each verified product (`catalog_definition_bindings.ts:465-531`); the ABIogenesis manifest has 49 rows, so one catalog admission computes the three bodies about 100 times for that product, on the order of 1 GB of canonical JSON hashed at the measured 9.6 to 11 MB of native evidence (by reading and arithmetic, not measured). Within one catalog admission the per-product result computed at `catalog_definition_bindings.ts:344` is discarded and recomputed per row; `environment_definition_bindings.ts:151` keeps only fields of the artifact itself.
  - Structural, by read (product-install): archive members are copied and payload files hashed more than once in one verification (PERF-A); declaration text is retained per loaded Product (PERF-C, measured in `M_RETURN.md`); catalog admission hashes inside a sort comparator (`admitGraphFunctionCatalog`) and compares install rows quadratically (`reconstructHistoricalDeclarationCatalog`) (PERF-D).
- **Retire:** One verified-content fact per `installId` per process, with a cheap per-boundary guard, consulted by all five call sites (P2); verification coordinates computed once when the verifier mints the artifact and read by owned callers, including the per-row sites (PERF-A); the second type check, with the lock consuming verify's closure facts and linking across Products only (P5); evidence carried as digests and locations rather than source text; publication digests computed once before sorting. PERF-D also proposes a `left === right` shortcut inside the shared `canonicalEquals`; that form is not adopted, because the helper keeps no identity shortcut by design (`shared/value/equality.ts`, read by the Writer; retention list), and the caller-side form is TD-53's. Decision: does "installed verified" promise byte identity at each consumer boundary, or unchanged since verified? Under byte identity, three verifications per leaf can still become one: Size M, about 6 s CPU and 3.3 GB per Run (derived, P2).
- **Owner / frame:** `product/install_product.ts`; `product/declaration_exports.ts`, with `verify_product.ts` producing the closure fact once. requirement_reprice for the promise, then realization_refactor; design_reframe for the evidence shape.
- **Closure:** Verification count per Run equals installs (or leaves, under byte identity); one TypeScript program per verify and install.
- **Boundary:** Public contract (the verification guarantee is a stated product property); manifest pins and qualification mirrors (`verificationDigest`, lock digests, setup row bytes); replay digests for the evidence shape. Whether the lock can reuse verify's diagnostics without weakening the cross-Product check needs a reading of `isZeroOwnerPhysicalRelationDiagnostic` (P5).

#### TD-53 — Owner-established values are serialized and hashed again where identity would do

Status Open. Sources: abg-traversal AT-09, AT-16; abg-events E5, E6; abg-calls E9; product-run 8; implementation-public "Per-invocation hashing of deep-frozen carriers…", "Transport still copies every serialized call…", "The Public projection payloads… are built on every process start"; hog-shared-bindings "Validate the capability definition graph once per graph…"; gtl-validator GV-07; performance P4, P8.

- **Evidence:**
  - Measured per W1 Run (P4): `projectValidatedPrefixArtifactTruth` (`abg/artifact_truth.ts:767`) costs 6.9 s, 6.6 s of it canonical and hash time; 5.8 s is reached through `constructNativeInstructionAssemblyBasis` (`abg/execution_basis.ts:247`) once per actor launch, a flat 198 to 289 ms each. `deriveExactPrefixArtifactTruth` (`:859`) caches by `coordinateDigest`, so every append misses; a cold read pays 1.6 s of 6.2 s. This is the cost RC9 F3 measured at 123 ms per call (abg-events E5).
  - Measured per call (P8): a refused CLI call costs 0.34 to 0.38 s and 201 MB, 19% of it digests computed at import, which is the projection payload build including the 2.88 MB common schema (`public/binding/public_function_projections.ts:797`, builder `:681`, `projectionAsset` `:610-619`; implementation-public). Every Public read re-reads, admits and digests the 3.28 MB toolchain manifest in `readExecutingToolchainIdentity` (`product/declaration_exports.ts:519`), about 30 ms. `hasAdmittedProductInstall` (`abg/environment_admission.ts:689`) costs 2.0 s per Run (P1 profile).
  - Measured earlier, not re-measured at head: the branded execution basis serialized at 56 plus 56 ms at 4 MiB (`execution_basis.ts:1424-1438`; AT-09, RC9 F3); install rows re-hashed at 83 ms plus about 45 ms (`environment_admission.ts:302`, `:709`, `:719`; AT-16, RC9); the transport copying 23.6 and 32.0 MB per call (implementation-public, rc.7).
  - Structural, not measured: `canonicalEquals` over owner-admitted values that are often one object (E6, inferred); `isAdmittedCCallResult` hashing twice (`abg/c_call.ts:1580-1592`, E9); `sameJson` with no identity guard, so a catalog read walks the catalog four times on a cache hit (`definition_binding_mechanics.ts:47-52`; product-run 8, likely); per-invocation hashing of deep-frozen carriers (`leaf_execution_authority.ts:201-297`; port `:676`, `:1110-1121`, `:1254`); `isCapabilityDefinitionGraph` re-validating per call and serializing inside its sort comparator (`shared/capability_contracts.ts:366-369`, `:407`); cold validation re-parsing and re-hashing raw-admitted values and filtering all edges per edge (`validation.ts:941`, `:975`, `:1908`, `:1924`; GV-07).
- **Retire:** Identity shortcuts at the callers that hold an owner-admitted value, before any deep compare or digest; artifact truth keyed by the ordered admission digests of the artifact rows, as O2 does for the environment (P4); `readExecutingToolchainIdentity` memoized per process (P8); one capability-graph validation per graph; digests taken once at admission and reused.
- **Owner / frame:** `abg/artifact_truth.ts`; `product/declaration_exports.ts`; each calling owner. realization_refactor.
- **Closure:** Counters show one digest per admitted value per process, and artifact truth is computed once per new artifact row.
- **Boundary:** `canonicalEquals` keeps no identity shortcut by design; its docstring reads "there is no identity shortcut" (`shared/value/equality.ts`, read by the Writer; retention list). Risk none if `projectionDigest` is kept and only memoized; it is consumed outside ABG (`install_definition_bindings.ts:374`, `environment_definition_bindings.ts:785`, `product/declaration_application.ts:247`). Leave the import-time digests unless start-up becomes the bound (P8); manifest pins if the projection `contentDigest` values change.

#### TD-54 — Whole-view scans and state re-derived per route

Status Open. Sources: abg-calls E3; abg-traversal AT-08, AT-11; performance P1.

- **Evidence:**
  - Measured per W1 Run, start CLI (P1): `deriveReplayPrefixFacts` 13.7 s and `digestReplayBody` 10.8 s, 18 to 23% of busy time. Per interval between actor processes, the replay-digest cost rises from 26 ms to 1,680 ms while the log grows from 4.6 to 17.4 MB; the reviewer fits no exponent from one Run. The path is `projectOwnedActiveRuntimeTransaction` (`abg/replay.ts:189`) to `projectRuntimeReplayGuard` (`:127`), which calls `deriveReplayPrefixFacts(…, true)` (`:939`) over the whole prefix through `digestReplayBody` (`:2339`). Callers by profile: `admitOwnedCCallResult` (`abg/c_call_outcome.ts:1424`) 3.6 s, `admitOwnedCCallJudgment` (`:1528`) 3.1 s, `admitTraversalTransitionInActiveTransaction` (`abg/traversal_route.ts:5323`) 3.2 s, `admitOwnedScopeClosure` (`abg/closure.ts:349`) 1.2 s, `projectOwnedRuntimeTruthAtDurablePrefix` 1.0 s. Held reads pay the same derivation per read.
  - Structural, by read (AT-08): `admitRoute` recomputes the guard at `:4420`, then filters every `run:` event and reverse-scans for the current cursor (`:4421-4439`); each transition derives the replay four times (`:5283-5297`, `:5323-5462`); `projectHistoricalTraversalRoutesAtPrefix` (`:727-753`) replays once per route event; `hasResolvedRunConstructionIntentLineage` (`:2789-2844`) is quadratic in intents and events. P1 measures the per-transition cost AT-08 describes.
  - Structural, not measured: body view scans that need only envelopes or an existing selector (`c_call.ts:2071`, `:2468`; `child_lifecycle.ts:83`; `retry_lifecycle.ts:99`, `:244`; `retry.ts:1857`; `fan_out_projection.ts:776`, `:1418`, `:1496`, `:1507`; `retry_progress.ts:993`; abg-calls E3, likely); the whole event array copied per complete-mode append (AT-11).
- **Retire:** The per-call re-derivation: one incremental replay fold in `abg/replay.ts` keeps the guard facts and the running digest state for the active transaction's prefix and extends them by the appended rows, and the admitting owners and held reads take it (P1). The body view scans, through envelope selectors; the per-append copy (about 40 lines).
- **Owner / frame:** `abg/replay.ts`. realization_refactor; design_reframe if the streaming digest needs a resumable state the design does not name.
- **Closure:** Replay-digest cost per transaction stays flat as a Run grows, and the incremental digest equals the cold one on the W1 and live stores.
- **Boundary:** Replay digests: the cold `deriveReplayPrefixFacts` stays as the oracle. Whether `writeReplayBody` can be made resumable without changing digest bytes is to be investigated (P1). Keep the current-cursor comparison in `admitRoute` (retention list).

#### TD-55 — Worker output is decoded twice and copied into the transport record

Status Open. Sources: abg-workers "Decode worker stdout once…", "Per-chunk stderr rows…". Structural, not measured at this head.

- **Evidence:** `executeWorkerTransport` decodes worker stdout a second time instead of taking the final observation from the observer that consumed every row, and `transport.json` copies the stdout and stderr text; the live reader of those copies is the recovery verifier (`abg/worksite_construction_recovery.ts:296-302`), which requires them to equal the archive files (read). In the P profile each stderr chunk appends a row and a probe (`abg/actor_process.ts:1545-1566`) and recomputes its ordinal by filtering every stream row of the process (`runtime_liveness.ts:375-378`), which is quadratic in one process's rows; stdout is windowed (30 s) and stderr is not (read). The RC6 to RC7 shares (stdout 15.5%, probes 35.4% of the log) predate windowing.
- **Retire:** The second decode; stream text in new transport artifacts (digests and byte lengths instead, behind a profile boundary); per-chunk recounting (window stderr, or carry the ordinal from the last admitted row).
- **Owner / frame:** `abg/worker_transport.ts` and `abg/actor_process.ts`. realization_refactor.
- **Closure:** One decode per process; the recovery verifier accepts both artifact shapes.
- **Boundary:** Replay digests: historical transport artifacts keep their bytes and digests, and the verifier keeps text equality for them. The log stays the source of the ordinal.

#### TD-56 — Log carriage: probe contracts inlined, one probe per scope, work state copied per step

Status Open. Source: performance P6 and M5 (measured).

- **Evidence:** Measured per Run on the live Run's logical events (1,692 events, 12.7 MB) and the W1 physical log (2,198 rows, 17.4 MB) (M5):
  - Probes are 29.1% of the live Run's bytes and 55% of its rows (931 probes against 113 stdout rows), and 30.4% logical and 27.7% physical in W1. One probe is written per enclosing scope per progress event: 219 events emit 3 each and 21 actor lifecycles emit 8 each (read from the data, not the source). Each probe inlines its whole contract, 39% of probe bytes (565 distinct contracts in 1,225 probes, declared by 126 declaration events). Writing probes costs `admitNativeRuntimeLivenessEvent` 2.1 s per W1 Run; reading them costs the liveness fold, 17% of a cold read.
  - The governance work state is copied 72 times in the live Run (2.40 MB) and 105 times in W1; its unchanging `original` block (14.1 KB) adds 1.0 MB of excess. A step costs 1.27 to 1.86 MB; because each step copies a state that holds every prior observation, work-state carriage grows with the square of the Run's length (derived). The 40 KB publication is carried 10 times in bindings.
  - Owners: `abg/runtime_liveness.ts`, `abg/runtime_liveness_contracts.ts` (`constructRuntimeSystemProbeContract`) and `abg/actor_process.ts` for probes; `basis_admitted.rawInputValue`, `c_call_result.value` and `traversal_route.boundInput` for the work state; `abg/instruction_assembly.ts` for the publication (read).
- **Retire:** Probes reference their admitted contract by `probeRef` and digest; one probe per progress event with its scope set; the work state carried once per step by reference to its admitting result, and `original` by digest; bindings reference the publication by digest.
- **Owner / frame:** The event body encoder `abg/event_body_encoding.ts`, which already de-duplicates whole bodies through body-reference records; sub-body references belong with it. design_reframe.
- **Closure:** Probe bytes per step stay flat and work-state bytes per step stop growing with the step number.
- **Boundary:** Replay digests: new event shapes need a contract version and recorded Runs keep replaying under their own contract, so this waits for the successor profile (TD-66). Probe semantics are qualification mirrors.

#### F. Tests

None of the fourteen tests that fail at the release base is shown to be a Product defect: ten are input gates that assert instead of skipping, three are stale tests for behaviour a later ratified design changed, and one is to be investigated (tests-scripts lead 1). About 95% of the suite's 8,744 s is spent in the 79 test files that install the Product per case (tests-scripts lead 4). The cut procedure and its copies (tests-scripts TS-15, executive-notes E5) are owned by TD-71.

#### TD-57 — The suite as an instrument: one command, lanes by owner and tier

Status Open. Sources: tests-scripts TS-13, TS-16; gtl-validator GV-10; executive-notes E6; product-install "Release snapshot…" (the gating part).

- **Evidence:**
  - The whole suite runs only as a hand-typed glob over `test_env/tests/*.test.mjs` and takes about 2.5 hours (E6; 8,744 s at `82ad6639b`). No npm entry runs it; `npm test` runs 9 files plus the UAT harness; `test:r1` to `test:r9` are cumulative chains, `test:m4` is a superset of `test:r9`, and the eleven `test:m5:*` entries each run a build plus one file (TS-13, read). `npm run lint` passes no recipe path to `lint-verification.mjs:9`, which reads it as `argv[2]`, so it throws (TS-13, read).
  - 190 of 225 test files are in no npm script, and their names are tickets or milestones (161 `t287-`), while `test_env/README.md:3-6` says a test's purpose follows its owning contract; package acceptances select "N lanes identical" by hand (TS-16).
  - `substitute`, `promote`, `identity` and `same_object` have no shipped producer and only static tests; the only runtime test of `compose` (`t287-single-address-space-consolidation`) and the `registered_selection` runtime tests (`t287-default-library*`) are in no npm script (GV-10). The release snapshot tests sit outside every gate (product-install).
- **Retire:** The 21 milestone entries, replaced by `test:unit`, `test:installed`, `test:gated` (sets the evidence root), `test:live` and `test:all`; `lint` passes the recipe path. One `test_env/lanes.json` gives each file its owners, tier and expected cost, so the runner selects the lanes a changed owner affects, runs unit lanes in parallel and installed lanes once per install, sets gates per tier and generates the qualification vector (TD-63). The GV-10 runtime tests and the release snapshot tests get a tier.
- **Owner / frame:** `T/package.json` scripts and the lane manifest. realization_refactor.
- **Closure:** One command runs the whole suite with the evidence root set, and every test file has a lane row.
- **Boundary:** Risk none for the scripts, since the recipe cites no npm test script; qualification mirrors only if files are renamed. The value of the manifest is likely, inferred from the register's practice.

#### TD-58 — One installed-setup owner, and one install per test file

Status Open. Sources: tests-scripts TS-08, TS-11; performance P7.

- **Evidence:**
  - Measured per suite (TS-11, from `suite1.tap` at `82ad6639b`): 8,744 s, of which the 79 installer files with 464 cases take about 8,280 s. Twelve files take 55%, led by `t287-c0-post-publication-failure` (1,290 s for 31 cases, now split 16 plus 15) and `t287-amendment-witness` (880 s).
  - Measured per installed test case (P7, W1 driver, under load): about 43 s of setup (pack 4.2 s, verify 24.8 s, install 3.9 s, the fixture product 5.3 s), a live heap peak of about 0.89 GB and about 21 GB allocated; 25 to 28 s of test-process CPU plus 7 to 15 s of npm CPU, against 52 to 60 s for the Run itself. Measured earlier: about 104 MB retained per case and a 0.93 GB peak (RC12 M Return), whose cumulative form is the heap abort at case 31.
  - Structural, by read: `setupInstalledRootCatalog` (`test_env/support/root-installed-environment.mjs:168-260`) packs, extracts, verifies, installs and imports per case and bundles the case's store and workspace with the install (`:591-626`); `setupInstalledRootExecutionBasis` already accepts `existingEnvironment` (`:647`). `root-cli-environment.mjs:12-37` repeats `selectedFrozenArtifact` (`root-installed-environment.mjs:30-55`) and packs the tenant itself; about 20 support and uat modules run `npm pack`; fixture builders share 154 and 82 lines (TS-08).
- **Retire:** Setup in two phases: `installTenantOnce(file)` in `before()` and `openCaseEnvironment(install, options)` per case, for files whose cases do not tamper with the install. Cases that test install-time behaviour keep their own install (`r2-clean-install`, `m5-installed-portability`, `t287-wave2-installed-product-verification`, `rival-authority-mutations`, r1's tampered archive). The second selector and pack path fold into `root-installed-environment.mjs`, and one `packFixtureProduct(spec)` serves the fixtures. Expected effect (structural): the c0 pair alone drops about 31 setups, about 15 minutes and about 3 GB of retained heap.
- **Owner / frame:** `test_env/support/root-installed-environment.mjs`. realization_refactor, test side only.
- **Closure:** One install per file for the listed files, and the suite time measured again.
- **Boundary:** None for the Product. Each changed lane's proof claim states that the install is shared, and a case that checks installed bytes unchanged still checks them. Qualification mirrors: the support module is an inventory and recipe member, and each case's independence is a proof claim. Which cases can share an install is likely, settled per file. Fixed shared output paths (`T/artifacts`, `test_env/evidence`) block running files in parallel until TD-62 moves them.

#### TD-59 — The fourteen failures at the release base, and the r1 to r3 basis

Status Open. Sources: tests-scripts TS-01 to TS-05.

- **Evidence:** each cause established by reading.
  - Ten failures are input gates that assert instead of skipping (TS-01). `t287-single-address-space-consolidation` (7) gets ENOENT on `<repo>/consolidation-inputs/native-02/…`, the default at `support/single-address-space-consolidation.mjs:31` ("Absence fails; it never skips"); its inputs exist only in an untracked archived sandbox under `T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/`. `t287-calculus-fold` HS03 (2) fails at `:1194-1195` when `ABI5_HS03_STREAM_METADATA` is unset; with it set, the RC12 H Return records 25 passes. `t287-framework-handoff-types` exact014 (1) fails at `:103-115` when `ABI5_HC1_BASELINE_PACKAGE_PATH` is unset; the package exists in the machine-local toolchains store with a matching digest, and the claim is equality with a cut from before RC6, the superseded-cut class C-5 retired.
  - Three failures are stale tests. `t287-route-reconstruction` (2) expects basis bodies kept outside a run operation scope (`:539-602`), which the RC10 O1 lifetime releases (`93a0de75a`; `abg/runtime_history.ts:319-336`); likely (TS-02). `t287-governed-context` GC03 (1) pins STDO 3.0.2 digests (`:513-527`) while resolving the project's current basis, `stdo://releases/v3.0.4/` (`:709-712`) (TS-03).
  - One is to be investigated: `witness-reprice-definition-binding` asserts fewer selected reads than closed rows (`:38-45`) and sees 3 against 3 (`:229-249`); 3 reads over 3 rows may be the floor rather than a re-read (inferred) (TS-04).
  - Outside the fourteen, r1 to r3 read the committed `test_env/fixtures/abi5-root-candidate-basis.json` (`support/candidate-basis.mjs:4-23`), stale from rc.4 to rc.11 and refreshed only by hand, although the root harness already derives the basis from the packed artifact (`root-installed-environment.mjs:237-246`) (TS-05).
- **Retire:** The private input resolution of the three gated lanes: each input enters the evidence-root inventory or the lane skips with its reason. The exact014 equality, as a superseded-cut claim, or restated against the current release. The proof writer into `T/artifacts`. The two route-reconstruction assertions, restated on a non-basis body (basis release is `t287-held-basis-lifetime`'s claim). The GC03 coupling: resolve `stdo://releases/v3.0.2/` explicitly or re-derive the recipe. The TS-04 bound, or the re-read if the captured stacks show a second pass. The committed basis as an input to the ordinary suite; the external-identity check moves into the cut (TD-71).
- **Owner / frame:** `test_env/support/evidence-root.mjs`, under the C-5 rule: one variable, inputs read by path, sha256 and bytes, and a lane skips with its reason. realization_refactor.
- **Closure:** The fourteen are passes or reasoned skips, and r1 to r3 pass in the ordinary suite and against the written basis at the cut.
- **Boundary:** Qualification mirrors (`t287-calculus-fold` and the basis fixture are members). The first edition's C-10 row needs the qualifier "except basis bodies outside a run operation scope (RC10 O1)". With the identity derived from the pack, r1 shows only self-consistency in the ordinary suite, so the cut must run the external check.

#### TD-60 — One gate catalogue for the 236 skips

Status Open. Source: tests-scripts TS-06.

- **Evidence:** The 2026-11-11 suite skipped 236 cases, 235 of them attributed to 94 files (parsed from the spec reporter by the reviewer). Class A: 73 skips in 15 files need only `ABI5_EVIDENCE_ROOT`, and every named input exists on this machine. Class B: 13 skips need a live provider or an opt-in native run. Class C: about 150 skips in about 68 files need a retained Run, fixture or earlier build through a bespoke variable. Class D: 3 skips in 2 files whose only recorded inputs were deleted temporary roots (`t287-generic-job-revision`, `t287-static-declaration-closure:244`). Class E: the three asserting files of TD-59. Across classes B to D there are 145 skip variables besides the evidence root; 51 have a recorded value in work records, 39 of those with a path that still exists, and 94 have none.
- **Retire:** The per-lane input variables, folded into `evidence-root.mjs` as a catalogue that gives per gate the variable, the input path or producing Run, sha256, bytes and class; the suite command sets the root. Class D gates only after the catalogue shows their inputs cannot be regenerated, each with its input named (the C-18b precedent; this is the remainder TD-04 sent to T-287 D5-a). Output-root variables go to one test-output owner.
- **Owner / frame:** `test_env/support/evidence-root.mjs`. realization_refactor.
- **Closure:** Every skip cites a catalogue row, and class A runs by default.
- **Boundary:** Qualification mirrors: most gated files are inventory members pinned by digest. Classes A and B are verified; class D is verified unsatisfiable from recorded values, with regeneration to investigate; class C is to investigate.

#### TD-61 — Copied installed-Public harness and local helpers

Status Open. Sources: tests-scripts TS-09, TS-10.

- **Evidence:** A 171-line block (`coordinate`, `actorAuthority`, `authoritySlots`, `keyOf`, the CLI ordinal and observed-call ledger) is shared by `t287-d1-requirement-handoff.test.mjs:17`, `w2-steel-serial-branch-installed.test.mjs:16` and `w2-steel-single-start-installed.test.mjs:16`, and blocks of 70 to 111 lines by five more files; the owner is `uat/public-setup.mjs:12` (`emptyAuthoritySlots`) and `:33` (`authorizeInstalledOperation`). Six of the eight files are class C lanes (TS-09, clone census; copies not diffed for drift). 28 files define a local sha256 helper, 27 parse an event-log JSONL file themselves, and 19 write their own stand-in worker (TS-10, by `rg`; likely).
- **Retire:** The harness copies, into `uat/public-setup.mjs`, after TD-60 (retired lanes take their copies with them); one test-side digest module; event-log reads through the store owner, except where an independent byte-level oracle is the point (one decision per site); one stand-in worker factory.
- **Owner / frame:** `uat/public-setup.mjs`; `support/amendment-witness-run.mjs:29` `standInActor` is the nearest worker owner. realization_refactor.
- **Closure:** No copy of the call harness outside its owner.
- **Boundary:** Qualification mirrors for the harness files (inventory members); none for the helpers.

#### TD-62 — Test code no runner reaches, and trees nothing reads

Status Open. Sources: tests-scripts TS-07, TS-12.

- **Evidence:** Five proof scripts under `tests/` are reached by no runner, import or spawn and appear only in the qualification inventory and recipe: `d2-frame-installed.mjs` (724 lines), `t287-stdo-run-environment-installed.mjs` (766), `r10-fresh-imports.mjs` (10), `r10-retained-child-projection.mjs` (69) and `r10-retained-hello-projection.mjs` (46); the last recorded hand run is at C-5 (verified for reachability; likely for disuse). Seven support exports are named nowhere, for example `installed-qualification-conservation.mjs:249` `recoverSetup` (verified by name search). `test_env/downstream` (50 MB) is ignored residue of a fixture deleted at `9d442b4c8`; `test_env/evidence` (35 MB) is written by eight lanes at fixed names (for example `r1-packed-artifact.test.mjs:103-106`) and read by nothing; the 20 July roots in `test_env/test_runs` (about 1.8 GB) have no writer at head (TS-12, verified). `test_env/proof` is TD-19's.
- **Retire:** The seven exports now; the five scripts after TD-60 decides their sibling lanes (a kept lane becomes a gated `.test.mjs` case, a retired lane takes its script); the downstream tree and the July roots, which are local deletions of ignored residue; the evidence writes, replaced by `t.diagnostic` or the test-output owner. Optionally move `falsifiers/`, which is in use, to `support/workers/`.
- **Owner / frame:** The test-output owner (TD-60). realization_refactor.
- **Closure:** Every test-side file has a runner or is gone, and no lane writes unread evidence.
- **Boundary:** Qualification mirrors: the five scripts are members by digest, and so is `falsifiers/`. The 17 `// Retired (T-290 …)` tombstones in fifteen files are records, not dead code.

#### TD-63 — The qualification inventory and recipe are maintained by hand

Status Open. Sources: tests-scripts TS-14; executive-notes E6.

- **Evidence:** `test_env/qualification/inventory.json` (2026-10-29) misses 24 current test files, including RC12's ten new ones, and 11 support modules. The recipe's test vector names 45 files, 43 of them current, against 220 current `.test.mjs` files. Every member is pinned by digest, so any test edit stales it. The recipe sets no environment variable, so its vector cannot reach class A gates (inferred) (counts by script).
- **Retire:** The hand-maintained member lists: the inventory, the test vector and the lint list are generated at the cut from the lane manifest (TD-57) and the gate catalogue (TD-60) and compared with the committed copy.
- **Owner / frame:** The cut procedure (TD-71). realization_refactor; design_reframe only if the recipe's member model changes.
- **Closure:** At each cut the generated inventory equals the committed one.
- **Boundary:** Qualification mirrors: these files are the mirror.

#### G. Design and specification

#### TD-64 — The design directory is mostly history

Status Open; ruled from existing rules (the repository's method moves historical material out of live design). Source: design-spec-repo E4 and its Lead 1.

- **Evidence:** Of 327 notes (102,692 lines), 48 are current (36,729 lines), 17 superseded (17,333), 189 stale (34,079) and 73 record (14,551), by a mechanical classifier (likely; it misplaces a few notes). `T/design/README.md` (583 lines, cited by 16 specification files) is a historical narrative that lists no current notes and predates RC1 to RC12. Stale notes describe the retired compiled-plan HoG; for example `M03_C_RETRY_RUNTIME_BEHAVIOR_DESIGN.md` names `CompiledCRetryPlan`, which no code defines. Seven notes cite npm scripts that no longer exist (tests-scripts TS-13), and `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:629` still names `registered_selection_task` as the Executive's invocation (product-run 5).
  - Refutation pass (claim 17): narrowed. The classifier's per-note output is not saved (`census/out/design.json` holds no per-note class), so the pass re-implemented the stated rule: it gives 50 current, 17 superseded, 187 stale and 73 record, because its source tokenizer reads 20,438 identifiers against the reviewer's 19,074, and two notes sit on the 60% line, so the result depends on the threshold. In a seeded sample, 11 of 12 stale notes and 6 of 6 current notes hold. The twelfth stale note, `M02_M04_CAPABILITY_DECLARATION_GRAPH_PRIME_CONTRACTION_BEHAVIOR_DESIGN`, designs live code (its carrier `DS1_CAPABILITY_CONTRACT_REGISTER` is at `shared/capability_contracts.ts:75`, with the Consensus rows the note designs) and was misfiled because the token rule counts only lowerCamel and lower_snake names. Every sampled note is a member of the qualification subject inventory (`T/test_env/qualification/inventory.json`, 1,191 members with digests) and of `recipe/verification-recipe.json`, as whole-tree snapshots rather than readers of note content; 309 of the 1,191 member digests already differ from the current files. The stale class is mostly right, but a note scored only on lowerCamel and lower_snake tokens can still hold live PascalCase or UPPER_SNAKE carriers.
- **Retire:** Move the non-current notes (about 279), unchanged, to a design-history location, after reading every stale note that names an UPPER_SNAKE or PascalCase symbol found in source; rewrite the README as a present-tense index of current notes; repair the notes that mix current and stale bodies; update the 16 specification links.
- **Owner / frame:** The design surface. design_reframe, with no realization change.
- **Closure:** Live design holds only current notes, indexed by the README, and no moved note names a live UPPER_SNAKE or PascalCase carrier as current design.
- **Boundary:** Qualification mirrors: the 16 specification link edits enter the mirrored corpus, and moving or deleting notes changes the qualification subject inventory, which names them.

#### TD-65 — Requirements are not present tense and are not traceable from code

Status Open (requirement_reprice); ruled from existing rules; it also sets the cost of TD-29. Source: design-spec-repo E3.

- **Evidence:** 84 requirement files: 61 cite STDO 2.5.x, 23 carry T-283 status lines, and no `REQ-R`, `REQ-L` or `REQ-M` identifier appears in code. Requirement files source 1,643 of the 2,116 qualification judgments (TD-29). The repository's method keeps live requirement text in present tense and moves lineage to history, and the owner's standing rule applies the writing guide to specification text without asking.
- **Retire:** Rewrite the requirement set in present tense, move the lineage text to history and make each requirement traceable from code, as TD-29 needs. A requirement whose truth changes in the rewrite returns as its own decision.
- **Owner / frame:** `specification/requirements/`. requirement_reprice.
- **Closure:** Each requirement states present-tense law and is cited by the code that realizes it.
- **Boundary:** Qualification mirrors: every edit needs a restage commit (TD-70), and about 1,600 requirement-sourced rules change their span digests.

#### TD-66 — Derived liveness is inside the replay digest

Status Decision. Sources: abg-events E1; RC12 ledger rows L2 and RR; executive-notes E8.

- **Evidence:** The digested replay body includes derived liveness (`abg/replay.ts:1411-1470`). The digest is persisted in `traversal_route_admitted` and `c_call_judged.replayStateDigest`, and as `sourceReplayDigest` (`abg/invocation_admission.ts:591`), and re-derived in `projectOwnerFacts` (`replay.ts:1972-2006`). The RC12 B2a ruling chose (b), filtering in the readers: `projectEndedChildFrames` (`replay.ts:350-374`), `childFrameKey` repeating `endedChildFrameKey`, `liveness.ts:640-645` and `:775-778`, and the quiescence sets at `replay.ts:281-335` (read).
- **Retire:** Derived liveness leaves the digested body under a successor profile, narrowed (a) or by class (b). Decision: when the successor profile is cut; recommended: batch every digest-affecting correction in this register into one successor profile (TD-25's E10, TD-41, TD-55, TD-56 and this entry).
- **Owner / frame:** `abg/replay.ts` and the event profile registry. design_reframe; L, about 120 lines.
- **Closure:** New Runs digest only admitted facts, and every recorded digest still re-derives under its own profile.
- **Boundary:** Replay digests: under W every recorded `sourceReplayDigest` must still re-derive, so the old digest form stays readable.

#### TD-67 — The helper's module-export predicate runs outside its lifetime and budget

Status Investigate. Source: implementation-public "The `module_export_return_exact` predicate runs outside the per-command lifetime and budget, and a throw reads as null".

- **Evidence:** `implementation/worksite_command_helper.ts:1392-1412` imports a module from under the sandbox root into the helper process itself. The import runs outside the owned process lifetime and its deadlines (`createOwnedProcessLifetime`, `:9`), the task budget (`product/worksite_command_execution.ts:166`) counts only command timeouts and HTTP probes, and a throw reads as null (read).
- **Retire:** The predicate runs inside an owned process with its own deadline, and a throw is recorded as a throw.
- **Owner / frame:** The command helper. realization_refactor.
- **Closure:** A hanging or throwing module ends within a recorded budget with a typed observation.
- **Boundary:** Replay digests: the predicate observation bytes change for throwing modules.

#### TD-68 — A Public refusal code with no producer

Status Investigate. Source: product-install K-C (the `mutable_default` part).

- **Evidence:** `mutable_default_forbidden` (`product/materialization_operations.ts:77`) is never produced, so its Public code `mutable_default` has no producer (read).
- **Retire:** The design owner decides whether the refusal is reachable; if not, the code leaves the owner union and the Public tables.
- **Owner / frame:** The materialization owner and its design owner. realization_refactor, or product_reprice if the Public code leaves.
- **Closure:** The code has a producer and a lane, or it is gone.
- **Boundary:** Public contract and manifest pins if `mutable_default` leaves the Public union.

#### H. Build, release and repository

#### TD-69 — The product's identity depends on npm's private state

Status In flight; the first package of the wave. Source: executive-notes E1.

- **Evidence:** `T/scripts/generate-product-manifest.mjs:504-547` takes the payload file list from `npm pack --dry-run --json` and digests it into `productContentDigest`. On `main` at `002035b8a`, with source, build output, contracts, lockfile and `node_modules` byte-equal to the cut worktree, `npm run build` gives `sha256:4428e0d0…` against the committed `sha256:dcfbcf42…`, because the payload gains the `CHANGELOG.md` files of `fast-check` and `pure-rand` (5,327 locators against 5,325); reproduced twice (command). The Executive established the trigger by experiment on 2026-11-12: in a fresh worktree with the dependencies copied, so that their file times are new, the build reproduces the committed manifest, 5,325 locators and `sha256:dcfbcf42…`; after `touch node_modules/.package-lock.json` the same tree builds 5,327 locators and `sha256:4428e0d0…`. So the product's payload depends on whether npm trusts its hidden lockfile, `node_modules/.package-lock.json`. The trigger is established; what npm does differently inside is not traced. The same commit therefore yields two product identities.
- **Retire:** The npm projection as the source of the list: derive it from the package `files` and the dependency inventory of `package-lock.json`.
- **Owner / frame:** `scripts/generate-product-manifest.mjs`. realization_refactor.
- **Closure:** A plain build on `main` and in a cut worktree give the same `productContentDigest`.
- **Boundary:** Manifest pins.

#### TD-70 — Generated contracts, the manifest and the specification mirror are tracked, and every specification edit forces a new cut

Status Open. Sources: design-spec-repo E6; executive-notes E4.

- **Evidence:** `T/contracts` holds 202 files (9.1 MB, 212 commits) and `T/product-toolchain-manifest.json` is 3,276,114 bytes (188 commits); `npm run build` deletes and regenerates both, so the working tree is dirty during every build, as observed live during the review. `T/.gitignore:4` lists the manifest, yet it is tracked. The mirror `contracts/qualification/sources/` (95 files, 1.7 MB) is byte-equal to its live sources (verified by script) and sits inside the package `files`, so every specification edit forces a new cut (E4); 15 commits are restages. `t287-qualification-law.test.mjs:110-118` checks live against staged only when two environment variables are set.
- **Retire:** Stop tracking `contracts/` and the manifest, keep them in the package `files`, and record the built package and manifest digests in the release record; resolve the `.gitignore` contradiction. For the mirror, either keep it with an ungated live-equals-staged check, or reference sources by digest and read them from the selected source root at qualification. design-spec-repo E6 says the second route needs an owner choice. In either route a specification edit still needs a new cut, because the law basis is digest-bound to the specification bytes by design.
- **Owner / frame:** The build (`clean.mjs`, `generate-product-manifest.mjs`) and the qualification catalog generator. realization_refactor for untracking; design_reframe for the mirror route.
- **Closure:** A build leaves the working tree clean, and mirror drift fails in `npm test`.
- **Boundary:** Manifest pins: RC records pin built-artifact digests, not the tracked copy, so untracking does not change them (inferred). 46 test files name the manifest and were not traced.

#### TD-71 — Release mechanics live outside the tenant

Status Open. Sources: executive-notes E5; tests-scripts TS-15 (with the `npm run lint` and inventory facts of TS-13 and TS-14). `release_publication.ts` is owned by TD-49.

- **Evidence:** The RC12 stamp, cut, install and smoke scripts are under `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/cut/` (five scripts, 836 lines), written for `rc.11` to `rc.12` (`FROM_VERSION` and `VERSION` at `cut-common.mjs:12-13`), with four stamp sites hard-coded in `stamp-rc12.mjs:16-33`. The stamp refused on git-ignored test output until patched, and a test pinned two version-derived digests and went red at the stamp (E5). Cut tooling is copied per candidate (`rc8-local-cut-01`, with two corrected variants, `rc9-local-cut-01`, `rc10-local-cut-01`); the candidate basis refresh, the qualification member refresh and r1 to r3 are separate hand steps (TS-15, read; the rc8 to rc10 copies were not diffed). Two facts from the tests review bear on the cut: `npm run lint` throws (TD-57), and the qualification inventory and recipe are maintained by hand with digest pins (TD-63).
- **Retire:** The per-candidate copies as the source of future cuts (they stay as records), replaced by a maintained `T/scripts/cut/` with `--from` and `--to` arguments, stamp sites as data with a parse check each, the generated-file rebuild, the basis refresh followed by r1 to r3 against the written basis (TD-59), the inventory and recipe regeneration (TD-63), pack, artifact correspondence, install and smoke, and the create-once writes and dry-run mode `cut-common.mjs` already has.
- **Owner / frame:** The tenant's `scripts/`. realization_refactor.
- **Closure:** The next cut runs from the tenant script with version arguments only.
- **Boundary:** Manifest pins: the cut writes the product manifest and basis.

TD-19 (first edition, still open) is updated in place; its replacement text is in "TD-19 update" below.

#### TD-72 — Withdrawn tenants and residue directories

Status Open. Source: design-spec-repo E8.

- **Evidence:** `build_tenants/TENANT_REGISTRY.md` lists an `abiogenesis/codex` tenant whose directory does not exist and marks `python` withdrawn, while `build_tenants/abiogenesis/README.md` says paused. Root `pyproject.toml` packages the withdrawn Python tenant. `release_snapshots/abiogenesis-typescript-tenant/` (361 files, 54 MB, 3.8.0-rc.2 to 4.6.0-rc.3, no 5.x cut), `docs/` (16 files) and six `.ai-workspace` directories (`features`, `modules`, `reviews`, `agents`, `sprints`, `release-notes`) are referenced by nothing (`git grep` at HEAD).
- **Retire:** Make the registry match reality; retire or move `pyproject.toml` with the Python tenant; mark the unreferenced trees as record or move them under one history root; retire `.claude-plugin` if nothing loads it.
- **Owner / frame:** The repository root and tenant registry. realization_refactor; product_reprice of the registry if python moves from paused to withdrawn.
- **Closure:** The registry lists only existing tenants with one status each.
- **Boundary:** Risk none, except that 24 design notes and `test_env/qualification/classification.json` cite the Python tenant, so those links follow a move. Whether anything outside the repository loads `.claude-plugin` or `pyproject.toml` is to be investigated.

#### TD-73 — Branches, tags and unpushed history

Status Conditional: nothing is retired until the owner prunes or publishes. Source: design-spec-repo E10, its Lead 7 and its surprises.

- **Evidence:** 106 local branches; 75 commits are reachable from 25 local branch names (19 `codex/*`, 6 `donor/*`) and from no `main`, origin branch or tag; `main` is 429 commits ahead of `origin/main` (`origin/main` is `93a4b08df`, 2026-10-22); 9 stashes and 4 extra worktrees; the `v5.0.0` tag selects the unqualified rc.1 (`git rev-list`, `git merge-base`). The owner rule is never to push.
  - Refutation pass (claim 18): holds for the tag and the ahead count, and narrows the branch count by one commit. 74 commits are reachable only through 24 local branch names (18 `codex/*`, 6 `donor/*`); the 75th, `594d7fbf1` on `codex/t280-impl` (2026-07-16), is also held by `stash@{7}`. At HEAD `59fbaf8a0` `main` is 430 ahead and 0 behind. `v5.0.0` (tag `70cec304a`) and `v5.0.0-rc.1` (tag `29a22e18c`) both peel to commit `5b793c65e`; the `v5.0.0` message calls it the latest published 5.0 RC discovery selector, a development preview, and `specification/PRODUCT.md:1552` and `:1772` define a mutable `v5.0.0` latest-RC selector. The second passage says that no second final cut, retag or package-version rename occurs and that `v5.0.0` "remains the publication-driven latest-RC selector" (read by the Writer).
- **Retire:** Nothing now. The tag is not debt: the Product defines `v5.0.0` as the publication-driven selector of the latest published RC, and rc.1 is the last cut that was published, so the tag names what the Product says it names. The 24 branch names that alone keep 74 commits alive stay, as the repository's `archive/*` branches already keep rejected and superseded lines. The 47 branches merged into `main` hold nothing unique and can go whenever the owner prunes.
- **Owner / frame:** The repository owner. No Product change.
- **Closure:** When the owner prunes or publishes: every unmerged commit is either kept under an archive name or knowingly dropped.
- **Boundary:** Risk none. Pushing and pruning are the owner's. The contents of the 74 commits were not read.

#### TD-74 — The main checkout

Status Open. Source: executive-notes E7.

- **Evidence:** `T/test_env/test_runs` holds 45 GB of git-ignored run output in the main checkout: 584,472 files by the Executive's count (executive-notes E7) and 1,310,433 by the tests review's count (TS-12); the two counts are not reconciled here. Three Codex worktrees under `/private/tmp` are merged into `main` and hold untracked directories (verified 2026-11-12). The Executive established on 2026-11-12 that a sparse worktree, one whose checkout holds only named directories, here `build_tenants`, `specification` and the tickets, is 49 MB against about 50 GB for a full one, is created in seconds, and builds to the cut's identity. The wave's packages use sparse worktrees.
- **Retire:** The ignored run output that no writer at head produces (TD-62 names the July roots), and the merged worktrees once their untracked directories are inspected.
- **Owner / frame:** The local checkout. No Product change.
- **Closure:** The checkout holds only output a current lane writes, and no merged worktree remains.
- **Boundary:** Risk none for the Product. Some October roots are written by `uat/runner.mjs` and the qualification driver and may be wanted as evidence (TS-12).

### Additions to the retention list

These join "Closures and intentional retention that must not become new debt".

- The F_H hold and the blocked handoff, and the declared resume event kinds with their generated schema, until 5.1 is authored (TD-25).
- `canonicalEquals` without an identity shortcut; the shortcut belongs at callers that hold an owner-admitted value (TD-53).
- The current-cursor comparison in `admitRoute`: it is a currentness gate, and only its data source changes (TD-39, TD-54).
- Observation-only counters read by the reuse proofs, until one owner module holds them (TD-45).
- The `stdo_environment` correspondence atom label in replay (TD-31).
- `m01`, `m02` and `requirements` as manifest locators: live; only the names are debt (TD-33).
- Complete recorded witnesses and digest-bound prefix projections (first edition), unchanged.

### Line totals

The three figures count source lines under `code/src` only, from the reviewers' approximate figures unless marked, each line once. Test-side, specification and design lines are listed separately below them.

- **Removable now: about 11,100 lines.** TD-25 residue 2,650; TD-28 witness residue 20; TD-30 400; TD-31 450; TD-32 11; TD-34 1,110; TD-35 40; TD-36 250; TD-37 660; TD-39 395; TD-40 415; TD-41 40; TD-42 750; TD-43 335; TD-44 650; TD-45 350; TD-47 1,330; TD-48 900; TD-50 110; TD-51 20; TD-53 100; TD-54 40; TD-55 30.
- **Removable after an owner decision: about 14,200 lines.** TD-25 Public packets 150; TD-26 under outcome (b) 11,050; TD-27 240; TD-28 up to 2,680; TD-32 L writer branches 60.
- **Moved, not removed: about 4,000 lines.** TD-34 330; TD-38 2,150; TD-39 210; TD-40 771 (`public_contract_publication.ts`); TD-45 300; TD-49 251.

Where sources overlap:
- TD-25: abg-calls E1's about 2,000 lines cover design-spec-repo E5's about 700 and product-run 1's about 300 ABG lines. AT-01's about 600 lines (four route files plus `fh_continuation_projection.ts:541`, `c_call_outcome.ts:1803` and `replay.ts`) are added with HoG's about 50; the two abg-calls sites inside AT-01's figure are not subtracted, because AT-01 gives no split. The provider member (product-install E3, size M) carries no line figure and is not counted. The residue counts as removable now although the entry is a Decision, because it is retired under either outcome; only the five members' packets wait on the decision.
- TD-30 adds AT-06's about 250 lines in ABG and product-run 3's about 150 in `product/invocation.ts`.
- TD-26: `fb86974e3`'s 8,760 source lines (command) already include GV-02's about 5,900, `implementation/consensus.ts` and the Consensus lines of `builtin_semantics.ts`; the ABG carriers (about 2,100) and `public/run_projection_authority.ts` (189) are added. Under outcome (a) the figures would be about 7,600 removed, about 1,150 moved and 0.6 to 0.9 thousand added.
- TD-31 uses GV-04's 150 plus 320, which subsumes AT-07 and product-install E1, less about 20 lines of live helpers at `product/stdo_environment.ts:24-26`, `:41-54` that the refutation pass keeps (derived from its item list and the file's line numbers). TD-28 counts GC03 1,350, result assessment 1,100, registered selection about 154 and `abg.codex` about 80; the agent profiles (TD-29) are not counted, because the recommendation keeps the gate and needs dispatch. TD-40 holds ST-B, so TD-49 holds only `release_publication.ts`.
- Not subtracted: code counted both by TD-38 or TD-48 and by TD-25 or TD-26, for example the construction-composition law at `validation.ts:1574-1692` inside GV-08's range, and AT-01's `traversal_route.ts:2435-2446` and `:2887` inside AT-04's `:952-3002`. The reviewers give no split, so the "now" and "moved" figures are upper bounds by those amounts.
- Not counted: changes that move no line count (TD-35's root-mode refusal, TD-41's settings, the folds of TD-51, TD-52 and TD-54, TD-56's references) and TD-46 until the coverage run reports.
- Figures the refutation pass changed: TD-31 falls from about 470 to about 450, because the helpers stay. The pass widens TD-37 (five predicates and about ten inline checks, not three copies) and TD-52 (per-row executions) and shifts TD-30 (the `priorGap` read stays) without a line figure, so their figures stand as the reviewers gave them; TD-47's removable figure stands. The three totals do not move at their rounding (removable now sums to about 11,060).

Outside `code/src`: test side about 3,265 removable now (TD-58 150, TD-61 1,300, TD-62 1,815), about 1,200 moved (TD-58 300; TD-71's about 900 consolidated from work records) and about 3,700 after decisions (`fb86974e3`'s 2,543 under `test_env`, GC03's 1,160). Design: about 66,000 lines move to history (TD-64). Specification and design under TD-26 (b): `f4aad7d5e`, 5,489 lines in 62 files (command).

### TD-19, current text

TD-19 is the first edition's one open entry. This is its current text, built from the repository review; the first edition's entry below is kept as written.

#### TD-19 — Stop recursive evidence copying; inventory historical retention

- **Evidence:** tree census at 2f1393061, restricted to .ai-workspace/comments and work/T287_COMMON_LIBRARY_DELIVERY_01: 85,492 paths, 40,256,058,637 logical bytes, 36,689,352,631 distinct-blob bytes, 3,566,706,006 bytes of additional identical-blob copies. Second edition, by `git ls-tree -l` at HEAD (design-spec-repo E7): HEAD tracks 130,481 paths and 46.56 GB (43.37 GiB), of which `.ai-workspace/comments` is 34.94 GB and `.ai-workspace/work` 11.18 GB; the `.git` pack is 9.86 GiB. Inside `.ai-workspace`, captured state and input JSON of 1 MB or more is 43.3%, run output 25.0%, archives 16.9%, mirrors 8.0% and authored `.md` text 0.2%. `.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT` (8.26 GB, 1,645 paths) commits the whole working tree, untracked runtime, sandbox and test-run files included, as 49 MiB tarball parts across 42 commits from 2026-09-23 to 2026-10-21. A full worktree materializes the whole tree, about 50 GB, and four exist under `/private/tmp` (size inferred). A sparse worktree, one whose checkout holds only `build_tenants`, `specification` and the tickets, is 49 MB, is created in seconds and builds to the cut's identity (established by the Executive, 2026-11-12); the wave's packages use sparse worktrees. The second-edition census measures comments at 33.3 GB and work at 10.7 GB by a different method.
- **Retire first:** recursive copying of prior proof/build trees into new cuts. Retain finite required inputs through immutable manifests/references and existing collectors. Historical relocation/deletion is a separate L task after reference inventory. For L, a forward-only retention rule is proposed for the owner: (1) git tracks authored text, small records under 1 MB, and for each larger file a digest record `{path, sha256, bytes, storeLocator}`; (2) files of 1 MB or more go to a content-addressed store keyed by sha256, and readers fall back to the tracked path for existing Runs; (3) no working-tree checkpoint archives are committed; (4) no copies of the repository's own trees are committed when the source is a commit; (5) toolchain binaries are recorded by version and digest. Whether existing files leave HEAD is a separate owner decision this register does not propose; history rewriting is excluded because it changes commit identities.
- **Owner / frame:** evidence packaging and proof owners; CALLER-EVIDENCE-VOLUME-01 / LIFE-01. Trigger: next proof package, with TD-04's reproducibility requirement. The retention rule is the owner's; realization_refactor (repository policy, no Product change).
- **Closure:** one exact package opens and reruns with declared finite inputs; repeated packaging does not copy unrelated predecessor trees; references, digests and needed recovery evidence remain resolvable. Inventory before any deletion. Under the rule, no new file of 1 MB or more enters git.
- **Boundary:** logical tree bytes are not pack size, runtime elapsed time or disposable bytes. No historical cleanup is authorized by this register. Replay digests: receipts address evidence by repository path, so moving bytes out of HEAD breaks resolution unless readers resolve by digest; which receipts address by path and which by digest is to be investigated.
- **Stop closed:** `cc8e796a6` (T-290 C-4); **S done:** `afcb3be58` (T-290 C-5: the 6 MB rule mechanical, `contracts/` by content, authored patches visible); see the row and the Completion record. Retention of the historical rows is the owner's decision, now with the proposed rule.

### Sources

- `.ai-workspace/work/TECH_DEBT_REGISTER_02/SYNTHESIS_PLAN.md`: the Executive's ruling on grouping, status, recommendation and precedent.
- `findings/INDEX.md`: 147 candidates (it lists tests-scripts as 0 because that file's format differs).
- Area reviews in `findings/`: `abg-calls.md`, `abg-events.md`, `abg-traversal.md`, `abg-workers.md`, `design-spec-repo.md`, `gtl-validator.md`, `hog-shared-bindings.md` (its recorded head `b4b6095df` is the `specification_methodology` head), `implementation-public.md`, `product-install.md`, `product-run.md`, `tests-scripts.md` (suite facts from `82ad6639b`), and `performance.md` (measured on `34aafb2c6` and the installed `5.0.0-rc.12`, under load), which section E, TD-56 and TD-58 use.
- `findings/executive-notes.md`: census totals and E1 to E9.
- `REVIEW_BRIEF.md`: tier definitions, candidate format and named checks.
- The census: `census/` scripts and `census/out/*.json` (`summary.json` for the corrected tiers).
- The first edition, `.ai-workspace/TECHNICAL_DEBT_REGISTER.md`: entry format, statuses, TD-19 and the retention list.
- `findings/REFUTATION.md`: the refutation pass over twenty claims, at `002035b8a` (HEAD `59fbaf8a0` by its end), applied in the entries it samples.
- The Executive's experiments of 2026-11-12: the hidden-lockfile trigger (TD-69) and the sparse worktree (TD-74, TD-19).
- Not available when this edition was written: `census/out/coverage-*.json` (TD-46).
- Read by the Writer to settle disagreements: the importers of `abg/fh_resume_relation.ts` and the contents of `code/src/hog/` (TD-25); `git show --shortstat` of `fb86974e3` and `f4aad7d5e`, and the GTL tree and One Surface names on `claude/rc12-consensus` (TD-26); the test producers of the legacy request (TD-30); `product/worksite_effect.ts:445-487` against `product/environment.ts:1199-1288` (TD-36); a grep for `hasExactDataFields` (TD-43); `census/coverage-aggregate.mjs` and `coverage-report.mjs` (TD-46); `shared/value/equality.ts` (TD-52, TD-53); the top-level declarations of `product/stdo_environment.ts` (TD-31's line figure); the manifest's mentions of five `.d.ts` files, 48 each, which agree with 47 contract rows plus one locator (Method and limits); `specification/PRODUCT.md:1550-1554`, `:1770-1774` (TD-73); `specification/requirements/product/REQ-P-POLICY.md:59-67` (TD-35).
