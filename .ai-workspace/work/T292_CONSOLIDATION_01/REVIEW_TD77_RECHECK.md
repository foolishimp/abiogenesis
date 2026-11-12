# TD-77 fix round: independent re-check

**Subject.** Branch `claude/td77-recorded-lock-truth` at `ef05a44bc`. It merges local `main` `fc818876c` at `d6c3faf50`, whose parents are `2f14abf03` and `fc818876c`.

**Main has moved.** At 02:24 AEDT local `main` is at `45811e339`, 55 commits past `fc818876c` and including the TD-80 merge, and the branch does not contain it (run: `git rev-list --count`, `git merge-base --is-ancestor`). This review is against `fc818876c` only.

**Scratch.** Everything is under `/private/tmp/abg-td77recheck-work/`, with `TMPDIR=/private/tmp/abg-td77recheck-tmp`:
- probe scripts in `scripts/`;
- their outputs in `probes/`;
- lane runs in `taps/`.

**Line numbers.** Code lines are at `ef05a44bc`, under `build_tenants/abiogenesis/typescript/code/src`. The code did not change between `1ae291ca6` and `ef05a44bc` (run: `git diff --stat 1ae291ca6 ef05a44bc -- …/code/src` printed nothing), so the line numbers in the Return still hold.

**Builds.** Each build is a scratch copy that includes the `default-library-witness` directory, and each `npm run build` finished.

| Label | Tree |
| --- | --- |
| branch | `ef05a44bc` |
| branch-edit | `ef05a44bc` with the first review's identity register edit: `abg.capability.catalog.invoke-graph-function@5` removed from the identities of `abg.schema.consensus-subject` |
| main | `fc818876c` |
| main-edit | `fc818876c` with the same edit |
| M1, M3 to M10 | `ef05a44bc` with one of the fix round's mutants, applied with its `apply_edit.py` (copied; the copy also defines M11) |
| M11 | `ef05a44bc` with my mutant, which disables the materialization branch's strict requirement |
| M11-edit | branch-edit with M11 |

## Verdict

No: mergeable only after named fixes. The recorded fold now projects stores that `main` refuses. Six `./abg` exports that admit or continue Run work take the binding, installs or environment from that fold without the retained strict answer (N1), so the class of F1 stays open beyond the four entries the fix covers. N2 to N4 are one missing case and wrong text.

## Findings

| # | Severity | Finding | Evidence |
| --- | --- | --- | --- |
| N1 | high | F1's class is open at six `./abg` exports that the census either leaves to the run owner's strict Catalog (RunC) or does not list | run (gate probe, graph probe), read |
| N2 | medium | The materialization branch of the strict candidate has no case (residual 22.13), and its refusal text is untrue for this cause | run (M11 on three lane files; probe-q12 on four builds) |
| N3 | low | The binding branch's new text is thrown for a cause that is not a lock question, including on a lock that answers strict | run (probe-q11) |
| N4 | low | Design `:253` contradicts the new release paragraph; the Return's R3 row misses a second recorded-history caller | read |

### N1. F1's class is open at six `./abg` exports

**What is wrong.** The fix requires the retained strict answer at four entries:
- the strict candidate;
- `admitWorkspaceBinding`;
- `checkPrefixEnvironment`;
- `exactWorksiteEnvironmentAtPrefix`.

F1 itself was a direct `./abg` call: the first review's probes call `./abg admitWorkspaceBinding`. Six other `./abg` exports admit or continue Run work. Each takes a value from the fold, and none asks for the retained answer (read):

| `./abg` export (`abg/index.ts`) | Where it takes the fold's value | Census |
| --- | --- | --- |
| `admitInvocation` (`:86`) | `admitInvocationWithRequest` (`abg/invocation_admission.ts:862`). At `:888-910` the caller's artifact truth and binding must equal the environment that `projectExactPrefixWorkspaceEnvironment` projects. | row 27, RunC |
| `admitExecutionBasis` (`:104`) | `abg/execution_basis.ts:1990-1992`. Only a basis with a worksite carrier reaches `exactWorksiteEnvironmentAtPrefix`. Any other root basis takes its binding from the invocation admission. | row 38 covers worksite carriers (U4); a basis without a carrier has no row |
| `admitChildExecutionBasis` (`:105`) | `admitChildExecutionBasisUsing` (`:2371`). A worksite-program child without a carrier takes the fold's environment (`:2537-2544`) and uses it (`:2559`) without the retained answer. | row 39 covers carriers (U4) |
| `invokeActorProcess` (`:451`) | `invokeActorProcessWithAssembly` (`abg/actor_process.ts:825`). At `:860-865` it asks `hasAdmittedWorkspaceBinding` of the caller's artifact truth and binding and compares that binding with the execution basis's. It then appends `actor_transport_binding_admitted` (`:1031-1038`). | not listed |
| `admitFhInteractionHold` (`:299`) | `admitOwnedFhInteractionHold` (`abg/continuation.ts:358`) calls `admitFhInteractionOpen` (`:429`, defined at `:104`) inside the append transaction opened at `:386`. At `:140-141` it asks `hasAdmittedProductInstall` and `hasAdmittedWorkspaceBinding` of the caller's product basis. | not listed |
| `admitProbabilisticResultCandidate` (`:469`) | `admitResultCandidate` (`abg/probabilistic_result.ts:334`). At `:605` it takes the install from the caller's artifact truth through `projectAdmittedWorkspaceProductInstall`. | row 46, RunC |

None of `abg/invocation_admission.ts`, `abg/actor_process.ts` or `abg/continuation.ts` calls `isResolvedProductLock`, an `…InResolvedLock` form or `admittedInstallLocksAnswerStrict` (run: `git show ef05a44bc:<file> | grep`).

**What the census selects.** The census selects consumers of a fixed set of accessors (Return `:176-179`):
- `admittedInstalls`;
- `projectAdmittedProductInstallByAdmissionEventRef`;
- the two environment projections;
- the `…InResolvedLock` forms.

It does not select `hasAdmittedProductInstall` or `hasAdmittedWorkspaceBinding`, which have eleven call sites (run: `git grep` at `ef05a44bc`, saved to `probes/hasadmitted-sites.txt`):
- Three are on the exported entries above: `abg/actor_process.ts:860`, `abg/continuation.ts:140` and `:141`.
- Two are in the run owner: `owner_bindings/run_invocation.ts:898`, `:1396`.
- Two are in read bindings: `product/project_read_definition_bindings.ts:619`, `:741`.
- Four are in the leaf port: `implementation/leaf_invocation_port.ts:946`, `:1131`, `:1459`, `:1478`. `worksiteLeafAuthority` builds its authority from the actor runtime binding (`hog/ccall_lifecycle.ts:141`, `:179-181`).

**Where RunC holds** (read). RunC holds on the run owner's call. On each `run.invoke` and `run.continue`, `resolveProductExecution` re-admits the Catalog with the strict `admitGraphFunctionCatalog` (`product/execution_resolution.ts:461`). A direct `./abg` caller does not pass through it:
- `admitInvocationWithRequest` (`abg/invocation_admission.ts:862-1736`) re-admits no Catalog. The file has no call to `admitGraphFunctionCatalog` or `reconstructHistoricalDeclarationCatalog`.
- It accepts the execution resolution on its self-digest alone (`isProductExecutionResolution`, `product/execution_resolution.ts:176-224`, called at `invocation_admission.ts:976`).
- It compares the Catalog basis digest only with other values the caller supplied (`:949`, `:997-998`, `:1526`, `:1564`).
- Its grant validation (`:783-797`) asks the strict graph question (`validateCapabilityGrantForProductBasis`, `product/invocation.ts:1088`, through `selectedCapabilityOwner` at `:756`), not the lock question.
- `invokeActorProcess` is meant for standalone callers that "authenticate the complete assembly from durable input" (`abg/actor_process.ts:818`).

**What the text claims.**
- The Return's status (`:12-20`) says that a lock that answers only the recorded question is never handed to work.
- T287 `:286-287` says: "Every entry that appends, admits or grants on a lock it takes from the fold's facts requires the strict answer".
- T287 `:364-367` says that every path that starts or continues work requires it.

**Why this is new with the package.** On `main` the fold refuses a store whose lock the reader's register no longer constructs. For the store probed here (run: `probes/gates-main-edit.out`), no owner projection exists for these gates to pass. On the branch the fold projects the same store.

**How I know.**
- Run: `scripts/probe-gates.mjs` on the RC10 native-assessment fixture, which holds a whole Run in 79 events: an invocation, a root basis, and two C-calls with actor processes. Outputs are in `probes/gates-*.out`.

  | Build | Fold | Retained strict answer | `hasAdmittedWorkspaceBinding` | `hasAdmittedProductInstall` | Root basis and invocation admission rehydrate, with a binding equal to the actor gate's |
  | --- | --- | --- | --- | --- | --- |
  | branch | projects | true | true | true, true | yes |
  | branch-edit | projects | false | true | true, true | yes |
  | main | projects | (no accessor) | true | true, true | yes |
  | main-edit | refused, `event_envelope_invalid` | | | | |

- Run: `scripts/probe-graph.mjs` (`probes/graph-branch-edit.out`). Under the edit, the strict graph question accepts both install graphs of the fixture's lock (16 rows and 0 rows), while the lock fails the strict question. So the strict grant validation does not stand in for the strict answer.

**Not run.** I did not drive any of the six entries to an append or a process start on a recorded-only store, and I started no worker. N1 rests on the gate run and on the reading above.

**What would settle it.** Either of these:
- **The retained strict answer at each entry, each with one case on the lane's variant store:**
  - for the invocation's installs in `admitInvocationWithRequest`, after `:910`;
  - at `abg/actor_process.ts:860`;
  - at `abg/continuation.ts:140`;
  - at root and child basis admission for every basis, not only for worksite carriers;
  - at `abg/probabilistic_result.ts:605`.

  The census also gains rows for the `hasAdmitted…` call sites. A run that drives `./abg admitInvocation` on the variant store, either to an append or to a refusal that names the lock, settles whether some later check already stops it.
- **A ruling that these exports serve the run owner only.** The design, the census and the Return's status would then say that RunC holds only on that path.

### N2. The materialization branch has no case, and its refusal text is untrue for its cause

**What is wrong.** `abg/artifact_truth.ts:225-228` requires the strict answer for a materialization's environment. When that requirement fails, the candidate throws the existing text at `:546`: "materialization artifact differs from its closed owner result, request, scope or Definition relation". The text names none of the actual cause. No lane fails without the requirement. The Return records the missing case as residual 22.13 (`:371-372`). The smallest case exists and is cheap.

**How I know.**
- Run, M11, with the requirement disabled (`String(question) === "never"`, in the manner of M9). The lane files that pass:
  - the TD-77 lane, 32 of 32 (`taps/lane-mut-M11-r2-materialization.tap`);
  - `t287-required-operation-bindings`, 11 of 11 (`taps/m11-*.tap`);
  - `t287-wave2-owner-contract-source-set`, 15 of 15 (`taps/m11-*.tap`).

  The last two are the kept files that name `product.materialize`.
- Run, `scripts/probe-q12.mjs`. It builds a `context_bootstrap` artifact that corresponds in every relation to the fixture's recorded binding, then calls the module `admitArtifact` with it. Outputs are in `probes/q12-*.out`.

  | Build | Lock strict | Result |
  | --- | --- | --- |
  | branch | yes | admitted, 1 appended |
  | main | yes | admitted, 1 appended |
  | branch-edit | no | `artifact_truth_conflict`, "artifact successor semantics refused before append: TypeError: materialization artifact differs from its closed owner result, request, scope or Definition relation"; 0 appended |
  | M11-edit | no | admitted, 1 appended |

**Reachability** (read). Only the module `admitArtifact` can reach this branch with a recorded-only environment. The `product.materialize` owner first admits its bound environment (R3), and then builds the artifact from that environment's binding (`product/materialization_definition_bindings.ts:396-419`).

**What would settle it.**
- Add the probe's case to the lane: one artifact and one call, on the lane's variant store or on the fixture under the edit.
- Give the branch its own text inside `artifact_truth_conflict`.

### N3. The binding branch's new text is thrown where no lock is in question

**What is wrong.** At `abg/artifact_truth.ts:557-562`, `installLockAnswersStrict` (`:321-323`) is false for any cause that is not an admitted install. The check runs before the product-set check at `:587-601`. So a workspace-binding candidate with a non-install cause now refuses with "workspace binding candidate requires causal installs whose lock answers the strict question", even when both install locks answer strict.

**How I know.** Run, `scripts/probe-q11.mjs` on the fixture, with the binding event as a third cause (`probes/q11-*.out`):
- Through the module `admitArtifact`, the unedited branch, whose install locks answer strict (`installLocksStrict: true`), gives the new text.
- `main` gives "workspace binding artifact truth requires its exact causal Product set".
- Through `./abg admitWorkspaceBinding`, both builds first refuse with `scope_mismatch`, and nothing is appended.

The text is reachable only through the module `admitArtifact`, which no package entry exports (run: `typeof abg.admitArtifact` and `typeof product.admitArtifact` are both `undefined`).

**What would settle it.** Ask `this.admittedInstalls.has(ref)` before the strict text, or move the strict check after the product-set check.

### N4. Design and Return text

- **T287 `:253` against `:354-356`.**
  - `:253` (R15's `:248` at `2f14abf03`, unchanged) reads: "So the fold reads every store whose locks a door admitted."
  - The new release paragraph in the same file (`:354-356`) reads: "When the reader's register no longer constructs the graph a snapshot's lock records, the fold therefore refuses the store that holds the snapshot."
  - The two contradict each other for a store holding a `release.snapshot` row that was admitted under an earlier register (read).
  - `:226-227`, "the fold accepts every lock a door admitted", is about locks, and the install branch does accept them. Run: under the edit the fixture's lock is read (`probes/q4-branch-edit.out`).
- **The Return's R3 row (`:159`).** It reads: "One caller is a read of recorded history: the fold's `release.snapshot` branch".
  - There is a second: `projectReleaseEvidence` (`product/project_read_ports.ts:776`), through `readReleaseArtifactBytes` (`implementation/release_publication.ts:176-178`).
  - `isReleaseOperationArtifact` is also exported on `./product` (`product/index.ts:586`) (read).
  - The behaviour is the same as `main`'s, because the fold already refuses such a store, so only the text needs fixing.
- **"The exported `admitArtifact`"** (T287 `:264`; Return R1, `:157`). It is exported by its module (`abg/environment_admission.ts:845`), not by a package entry (run, above).

**What would settle it.** Restate `:253`, name both recorded-history callers of `isReleaseOperationArtifact`, and say "module export" where the text means it.

## The twelve answers

### 1. Is F1 closed? (run and read)

**The named entry is closed** (run). I copied the first review's two probes and pointed them at my builds (`scripts/probe-q4.mjs`, `scripts/probe-forged.mjs`). Outputs are in `probes/q4-*.out` and `probes/forged-*.out`.

| Build | Store | Fold | Lock: strict / recorded | `./abg admitWorkspaceBinding` | Admission environment |
| --- | --- | --- | --- | --- | --- |
| branch | fixture | projects 3 rows | true / true | `artifact_owner_result`, 1 appended | admitted |
| branch-edit | fixture | projects 3 rows | false / true | `scope_mismatch`, 0 appended | throws "admission requires the exact admitted prefix environment" |
| main | fixture | projects 3 rows | true / true | `artifact_owner_result`, 1 appended | admitted |
| main-edit | fixture | refused, `event_envelope_invalid` | | | |
| branch, branch-edit | forged | projects | false / true | `scope_mismatch`, 0 appended | not reached: the forged store holds two installs and no binding |
| main, main-edit | forged | refused, `event_envelope_invalid` | false (`main` has one question: its `isResolvedProductLock` takes one argument) | `artifact_owner_coordinate_refusal`, `event_envelope_invalid`, 0 appended | |

**One owner end to end** (run, `scripts/probe-witness.mjs`). The probe runs `witness.admit` reprice through the real `WITNESS_DEFINITION_BINDINGS` on the fixture's binding. Outputs are in `probes/witness-*.out`.
- On branch and main it is refused later, at the grant: "admission grant requires the exact admitted workspace, Product set and lock".
- On branch-edit it is refused at the environment: "admission requires the exact admitted prefix environment".
- The log is unchanged on all three builds.

**The census, row by row** (read). I printed about 65 of the Return's code citations, from the census and table 12. Each names the code it describes.
- **R2, R3, the door or HistC.** These rows hold as stated: 1 to 5, 7 to 9, 13, 14, 16, 17, 19 to 21, 23, 26, 42, 44 and 49.
- **RunC.** These rows hold on the run owner's path: 12, 15, 27, 29, 30, 32, 34, 36, 40, 46, 50 to 52, and rows 37 to 39 alongside U4.
  - Rows 27 and 46, and bases without a worksite carrier, can also be reached through `./abg` exports that bypass the run owner (N1).
  - I did not trace the other RunC rows to their package entries.
- **Not listed.** The census does not list the eleven `hasAdmitted…` call sites (N1).

**Each item the brief names:**
- **Compact install reference.** Run: lane 25 passes, and M9 fails lane 25. Through `./abg admitProductInstall`, the door's own strict check refuses first. On branch-edit it gives `scope_mismatch`, "install admission scope differs from the candidate", with 0 appended (`probes/q11-branch-edit.out`, `probes/upgrade-branch-edit.out`).
- **Materialization candidate.** Covered in code, but no case tests it (N2).
- **Release publication.** Read: `isReleaseOperationArtifact` admits the bound environment with `admitCapabilityEnvironment(…, null, false)` (`implementation/release_publication.ts:156`), which is R3. It then reaches qualification, which is strict (HistC). Covered.
- **`run.invoke` and `run.continue` on a recorded-only store.**
  - Read: both go through the strict Catalog re-admission at `product/execution_resolution.ts:461`. The continuation selections return `basis_mismatch` when the execution resolution does not load (`owner_bindings/run_invocation.ts:1432`, `:1461`, `:1491`). These selections serve `runCurrentIntentOwner` (`:1498`), `runSelectedActionOwner` (`:1574`) and `runPendingExecutionOwner` (`:1665`).
  - Run: lane 20 passes on the branch and fails under M6.
- **An actor process.**
  - Inside a run, RunC covers it (read). The actor runtime binding is the setup's binding and truth (`owner_bindings/run_invocation.ts:1194`, `:1560`, `:1628`, `:1724`). `worksiteLeafAuthority` (`hog/ccall_lifecycle.ts:164-173`) requires the execution basis's binding, the actor's binding and the input's binding to be equal.
  - Called directly through `./abg invokeActorProcess`, it is not covered (N1).
- **One in-run consumer traced to its entry** (read). The chain:
  1. the actor process call at `hog/ccall_lifecycle.ts:536`;
  2. `hog/entry.ts:307`, `:429`;
  3. `owner_bindings/run_invocation.ts:1560` (`setup.workspaceBinding`, `setup.artifactTruth`);
  4. `projectSetupTruth` (`:699-726`), which takes the installs and binding from the Catalog's readiness basis;
  5. that readiness basis, which the same call re-admits strictly at `product/execution_resolution.ts:461`.

### 2. Can the retained strict answer be wrong or be served to the wrong lock? (read; run where stated)

**How the answer is stored** (read):
- in `AdmittedInstallFact.lockAnswersStrict` (`abg/artifact_truth.ts:307-314`);
- keyed by the install's admission event id in `RuntimeArtifactFacts.admittedInstalls` (`:318`, set at `:331`);
- in one facts object per store lineage, obtained through `runtimePrefixComputation(prefix, ARTIFACT_FACTS, …)`;
- computed in `prepare`, which asks the strict question first (`:432`) and the recorded question only when strict refuses (`:433`), and sets the answer at `:520`.

| Route | Can a lock established under the recorded question come to carry a strict answer? |
| --- | --- |
| Compact reference | No. The reference takes its source's answer (`:469`), and the strict candidate refuses a recorded-only source (`:464-466`). Run: lane 25, M9. |
| `establishedLock` | It is marked strict without asking (`:422-428`), but every caller asks the strict question first. `admitProductInstall` asks at `abg/environment_admission.ts:1177` and passes the lock at `:1190`. The install owner asks at `product/install_definition_bindings.ts:143` and passes it at `:318-323`. `admitArtifactFromOwner` asks at `:966-976`. Not checked: whether `call.resources.resolvedLock` stays the same across the `await` at `install_definition_bindings.ts:284`; `main` had the same window. |
| A map shared by a recorded reader and a strict one | There is one facts object and one answer per install. The answer does not depend on the question the caller asks, because both the fold and the candidate compute strict first. |
| Two prefixes of one store | The facts are shared. The refs come from the asking prefix's own environment. When a ref is absent, the accessor advances the facts over that projection's own prefix (`:892-894`). |
| A copied projection | Answers false (`:889-890`). Run: lane 22. |
| After an append | `prepareArtifactTruthCandidate` accepts the prepared row only into the facts object it was prepared against (`:753`, `:764-771`). Run: after the appends in my upgrade probe, the new installs answer true and the old ones false (`probes/upgrade-branch-edit.out`). |

I found no route by which a recorded-only lock comes to carry a strict answer.

### 3. Does the fix refuse anything the base admitted on a current-build store? (run)

I found no difference between main and branch:
- **Fixture.** Both builds admit a new binding (1 appended) and the admission environment (`probes/q4-main.out`, `probes/q4-branch.out`).
- **`witness.admit` end to end.** It stops at the same grant check on both builds.
- **`t287-required-operation-bindings`.** It runs owners end to end and passes 11 of 11 on both builds: 240 s on the branch and 239 s on main (`taps/q3-*.tap`).
- **`t287-post-binding-worksite-write`.** It passes 2 of 2 on the branch (`taps/q10-branch-t287-post-binding-worksite-write.tap`). The Return records 2 of 2 on main (`:555`).

### 4. The upgrade path (run, my own construction)

I ran `scripts/probe-upgrade.mjs` on branch-edit (`probes/upgrade-*.out`) with two locks:
- **The first lock** is the fixture's own: the whole 79-event store. Under the edit it answers only the recorded question.
- **The second lock** is the edited register's own: the fixture's lock with `invoke-graph-function@5` removed from the identities of `abg.schema.consensus-subject`, resealed. Its digest is `sha256:14d87b20f0c6…`, and the edited build answers strict for it.

| Step | Result |
| --- | --- |
| Two installs of the edited lock, through `./abg admitProductInstall` | admitted, 1 appended each |
| An install of the fixture's lock | `scope_mismatch`, "install admission scope differs from the candidate"; 0 appended |
| A binding over the new installs, through `./abg admitWorkspaceBinding` | admitted, 1 appended |
| A binding over the fixture's installs | `scope_mismatch`, 0 appended |
| The fold after the appends | 6 rows; strict answer true for the new installs and false for the fixture's |
| The admission environment of the new binding | admitted, with lock `sha256:14d87b20f0c6…` |
| The admission environment of the fixture's binding | throws "admission requires the exact admitted prefix environment" |
| Event count | 79 at open, 82 at close |

On main-edit the fold refuses the fixture's store, so the path does not exist there. On the unedited branch the roles reverse: the install of the edited lock is refused with `scope_mismatch`.

### 5. Cost (run)

I copied the fix round's count script and pointed it at my builds (`scripts/count-locks.mjs`; it differs from `td77d/scripts/count-locks.mjs` only in paths and ids). Each instrumented build counts entries into the whole-lock body: `isResolvedProductLock` on main and `productLockHolds` on the branch.

| Build | Store | Fold | Environment | Binding construction | Binding candidate |
| --- | --- | ---: | ---: | ---: | ---: |
| main | live rc.12 copy | 1 | 0 | 0 | 0 |
| branch | live rc.12 copy | 1 | 0 | 0 | 0 |
| main | fixture | 1 | 0 | 0 | 0 |
| branch | fixture | 1 | 0 | 0 | 0 |
| branch-edit | fixture, recorded-only | 2 | 0 (throws) | 0 | 0 (the door refuses) |

The counts are equal. The design's statement that "a lock that answers only the recorded question costs two evaluations" (T287 `:276-277`) holds.

The branch-edit run on the live store stopped at the environment (`probes/count-live-count-branch-edit.out`): under the edit, that store's lock answers only the recorded question. It is therefore not a cost row.

### 6. F2 (run and read)

I built every mutant in the Return's table and ran the lane file on each (`taps/lane-mut-*.tap`). The failing cases match the Return's table (`:359-369`) exactly:

| Mutant | Cases that fail |
| --- | --- |
| M1 | 6, 13, 14, 16, 18, 30 |
| M3 | 12, 14, 18, 30 |
| M4 | 30 |
| M5 | 9, 10, 11, 14, 18, 30 |
| M6 | 20 |
| M7 | 23, 24 |
| M8 | 23, 24, 26 |
| M9 | 25 |
| M10 | 27 |
| M11 (mine) | none (N2) |

The unmutated branch passes 32 of 32 (`taps/lane-branch.tap`).

**The acyclicity walk is gone, and the design's reason for removing it holds** (read):
1. `shared/capability_contracts.ts:508-510` is now a comment.
2. The row digest is recomputed and compared over the row without its own ref and digest (`:194-201`, `:481-490`), so it covers the digests its dependencies carry.
3. Dependency resolution requires each dependency's ref and digest to equal those of the row it targets (`:498-507`).
4. A cycle would therefore need a digest that contains itself.

**Lane 20 (the brief's lane 18)** fails when the Catalog stage asks the recorded question (M6), and only then.

### 7. F3 (read)

**Table 12.** Every citation I printed names the code it describes.

**Design sentences that state what the code does:**
- T287 `:238-242` on the door and the fold.
- The new subsection from `:255`:
  - strict first, then recorded;
  - the three established-lock paths;
  - the cost sentence (run, Q5);
  - the accessor;
  - the entry table at `:289-294`, whose refusals I confirmed by run in Q1 and Q4.
- The question table at `:306-312`, including the fold's row.
- The release paragraph.
- The HistC paragraph.
- T289 `:41-49`, which names the compact reference and the binding branch as the code has them.

**The exceptions:**
- `:253` (N4);
- the completeness claims at `:238-242`, `:286-287` and `:364-367` (N1);
- "the exported `admitArtifact`" (N4).

### 8. The merge of main (run)

I cloned the repository into scratch with shared objects (`mergeclone/`, whose alternates point to the repository's objects) and ran `git merge-tree --write-tree 2f14abf03 fc818876c` (`probes/merge-tree.out`).
- There is one conflict, in `product/project_read_definition_bindings.ts`.
- `d6c3faf50` differs from git's automatic merge only in that conflict hunk.
- The resolution takes main's removal of `ticket_consensus` and of `admittedAuthorityBinding`, which was its only user of the recorded binding projection. It keeps the branch's `WorkspaceProjectionPort.status(packet, "recorded")` (`:646` at `d6c3faf50`).

Both sides' intent is kept. The commit message's sentence "Generated files take main's content" describes no change, because no file differs from the automatic merge.

### 9. The U4 cover (read and run)

**The cover sits at the right place for worksite carriers** (read). Three callers take the carrier's environment through `exactWorksiteEnvironmentAtPrefix`:
- the worksite command leaf source (`abg/execution_basis.ts:988`);
- root basis admission (`:1992`);
- child basis admission (`:2547`).

**"Nothing else is uncovered" does not hold** (read). A root basis without a worksite carrier never reaches the cover (`:1990`). Neither does a worksite-program child without a carrier, which takes the fold's environment at `:2538-2544`. Both rely on RunC, which a direct `./abg` call does not pass through (N1).

**Can the cover refuse a healthy Run?** (read). No:
- The function projects from a prefix coordinate through `projectOwnedPrefixArtifactTruth` (`abg/environment_admission.ts:493`), so the accessor always receives an owner projection. A copied projection cannot reach it.
- A carrier whose binding is not the invocation's is answered by that binding's own installs, which is true for current-build installs.
- When the facts have not yet reached a prefix, the accessor advances them (`abg/artifact_truth.ts:892-894`).

**Healthy runs pass** (run):
- `t287-post-binding-worksite-write`, 2 of 2 on the branch;
- lane 27;
- the two stub lanes (Q10).

### 10. Test stubs (run and read)

**Counts** (run, `taps/q10-*.tap`). `t287-observed-worksite-command` passes 8 of 8 and `t287-native-work-currentness-consumers` passes 6 of 6, both on main (no stubs) and on the branch (stubs). `802e50b9f` changes no assertion: it adds a premise object, `artifactTruth`, `productInstalls: []` and an `admittedInstallLocksAnswerStrict` override (read: `git show 802e50b9f`).

**What the stubs replace** (read). Both lanes link `abg/execution_basis` against an environment they supply themselves, with no owner projection. The real accessor answers false for such a value. The stub replaces a premise that the lanes already supplied.

**Does a stub hide a case where the real accessor refuses a healthy value?** No (read):
- **A copied projection** cannot arise in production (Q9).
- **Empty install refs.** The stubs carry `productInstalls: []`, which the real accessor refuses. No real binding has zero causal installs, because the candidate throws at `abg/artifact_truth.ts:587-601`.
- **The witness support's stub** (`test_env/support/witness-reprice-mechanics.mjs:159-160`, `admittedInstallLocksAnswerStrict:()=>true`) applies only to the mechanics' own instance of `admission_authority`. Run: the TD-77 lane's end-to-end case and my witness probe both go through the real `WITNESS_DEFINITION_BINDINGS`, and branch-edit is refused there at the environment.

The two lanes still show what they showed before. They do not exercise U4; lane 27 and M10 do.

### 11. The two new error texts (run)

| Text | Thrown at | Carried as | True where thrown? |
| --- | --- | --- | --- |
| "Product install lock reference names a lock that does not answer the strict question" | `abg/artifact_truth.ts:465` | `artifact_truth_conflict`, "artifact successor semantics refused before append: TypeError: …" (`abg/environment_admission.ts:1069-1078`) | yes: the source has already been checked to exist (`:463`), and its retained answer is false |
| "workspace binding candidate requires causal installs whose lock answers the strict question" | `abg/artifact_truth.ts:560` | as above | not for a cause that is not an install (N3) |

Both texts are reachable only through the module `admitArtifact` (run). Each package door asks first and refuses with `scope_mismatch`:
- `./abg admitWorkspaceBinding` on branch and branch-edit (probe-q11);
- `./abg admitProductInstall` on branch-edit (probe-q11, probe-upgrade).

### 12. The materialization branch (run)

The mutant is M11. No lane notices it. The smallest case is the probe-q12 artifact (N2).

## What I did not check

- **N1 entries.** I drove none of them to an append or a process start on a recorded-only store, and I started no worker.
- **Other `./hog` entries.** I did not trace the `./hog` entries that reach the leaf port without the run owner, and I did not trace the RunC census rows other than 27, 38, 39 and 46 to their package entries.
- **The battery.** Of the Return's 83 files I reran only:
  - the TD-77 lane, 32 of 32 on the branch, and once on each mutant;
  - `t287-required-operation-bindings`, on main, branch and M11;
  - `t287-wave2-owner-contract-source-set`, on M11;
  - `t287-observed-worksite-command` and `t287-native-work-currentness-consumers`, on main and branch;
  - `t287-post-binding-worksite-write`, on the branch.

  The other results are the Return's.
- **Other checks.** I did not rerun:
  - the differential (`diff-guards`, `diff-verified`);
  - the 121-store scale run;
  - the replay;
  - the lints;
  - the `.d.ts` identity check;
  - the identity digests.
- **The `await` window.** I did not check whether `call.resources.resolvedLock` stays the same across the `await` at `product/install_definition_bindings.ts:284` (Q2).
- **Other stores and edits.** I used only one register edit, the first review's identity edit. I did not try stores holding `release.snapshot` or `product.materialize` rows under the edit, and I did not try legacy-profile stores.
