# TD-77 (T-292): independent review

Reviewer: Claude Opus 5.5. I took no part in the work under review. This is commentary, not specification or design.

Subject: branch `claude/td77-recorded-lock-truth`, head `2f14abf03`, base `c1f655735`. `T` means `build_tenants/abiogenesis/typescript`. Code and design line numbers refer to `2f14abf03`.

My copies, probes and outputs are under `/private/tmp/abg-td77review-work/`. The builds are `branch`, `base`, `branch-edit` and `base-edit`, plus five mutants, `mut-M1` to `mut-M5`. The two `-edit` builds carry the package's sim2 register change: `abg.schema.consensus-subject` is removed from `projectedPublicContractIds` of `abg.capability.catalog.invoke-graph-function@5` (`T/code/src/shared/capability_contracts.ts:82`). It is applied by `scripts/apply_edit.py register-edit`. TMPDIR was `/private/tmp/abg-td77review-tmp/`. I wrote nothing in the repository except this file.

**Verdict: not mergeable as it stands; mergeable after the fixes named in F1 to F3.** The fold now establishes install locks under the recorded question. Two admission paths take their lock from the fold and ask no strict question: the `./abg` export `admitWorkspaceBinding`, and the bound environment that `withAdmissionAuthority` admits. `product.materialize`, `result.assess` and `witness.admit` proceed on that environment without a guard of their own. So the branch admits and appends new work where the base refused. This happens on a store recorded under a changed register. It also happens on a store whose install lock had its identities altered among its own graph rows with every digest recomputed, under the reader's unchanged register. The design says the opposite: "Every path that starts or continues work asks the strict question and refuses what it refused before; a recorded value with every digest recomputed grants no work."

## Findings

| # | Severity | What is wrong | Where (`T/code/src` unless stated) | Evidence |
| --- | --- | --- | --- | --- |
| F1 | high | New work is admitted over a lock that only the recorded question accepts. `./abg admitWorkspaceBinding` and the live admission environment take the lock from the fold, which now asks recorded, and ask no strict question. The branch appends a new workspace binding, and admits the admission environment, where the base refused the store. | `abg/environment_admission.ts:1261`, `:1310`, `:1332`, `:1344`, `:1365`; `abg/artifact_truth.ts:315`, `:532`, `:559`, `:573`, `:723`; `product/admission_authority.ts:297`, `:323`, `:467-468`; `product/invocation.ts:942-944` | run (two stores, four builds) and read |
| F2 | medium | The lane does not show what three of its claims say. Removing dependency resolution, removing acyclicity, or removing per-row slot ownership each leaves 24/24 green. Lane 18 passes when the Catalog stage asks recorded. No lane covers F1. | `T/test_env/tests/t292-td77-recorded-product-truth.test.mjs:180-188`, `:241-254`, `:408-419`; `shared/capability_contracts.ts:499-507`, `:510-520`, `:566-581`, `:460` | run (five mutants, one lane variant) |
| F3 | medium | Design and Return sentences state what the code does not do. They say every admission door, the admission candidate and admission grants ask strict, that a door refuses the R1 class, and that "reading is not running". The fold sentence about stores ignores the strict `release.snapshot` branch. The Return's table 12 omits the F1 paths. The Return's deviation 4 says each relation refuses on its own. | `T/design/T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN.md:236-237`, `:248`, `:253`, `:254`, `:305-307`; `TD-77_RETURN.md` table 12, section 13, deviation 4, residual 22.3 | run (F1, F2) and read |

### F1. New work is admitted over a lock only the recorded question accepts (high)

**What is wrong.** The fold advances over recorded rows with the recorded question (`abg/artifact_truth.ts:315`). Two things retain what it establishes: `RuntimeArtifactFacts.admittedInstalls`, and the workspace environments derived from those facts (`abg/environment_admission.ts:511`, `:527`). Two admission paths consume those facts through the `…InResolvedLock` forms and ask no lock guard.

1. **`admitWorkspaceBinding`** (`abg/environment_admission.ts:1261`). It is exported at `abg/index.ts:62` through the package's published `./abg` subpath.
   - It takes the lock from `projectAdmittedProductInstallByAdmissionEventRef` over the fold (`:1310`).
   - It checks the candidate with `constructWorkspaceBindingInResolvedLock` (`:1332`) and `isWorkspaceBindingCandidateInResolvedLock` (`:1344`), then calls `admitArtifact` (`:1365`).
   - The candidate preparation is called with `"strict"` (`abg/artifact_truth.ts:723`). Its workspace.bind branch, however, reads the lock from `this.admittedInstalls` (`:532`) and again uses the `…InResolvedLock` forms (`:559`, `:573`). The question is never asked of the lock.
2. **Live environment admission.** `validateAdmissionCapabilityBasis` admits the bound environment through `admitCapabilityEnvironmentOutcome(…, true)` (`product/admission_authority.ts:467-468`, `:323`). That projects the fold and the environment (`:297`) with no guard.
   - The admission grant then checks only the installs' graphs under strict (`product/invocation.ts:942-944` → `selectedCapabilityOwner`, graph at `:756`). It checks neither the lock nor the identities.
   - After that, these owners ask no Product-truth guard (read). Each declares `workspaceBindingRequirement: "exactly_one"`, so `checkAdmissionScope` requires the bound environment (`product/admission_authority.ts:404-410`).
     - `product.materialize` (`product/materialization_definition_bindings.ts:454`; contract `product/materialization_operation_contracts.ts:52`)
     - `result.assess` (`product/result_definition_bindings.ts:305`; contract `product/interaction_operation_contracts.ts:240`)
     - `witness.admit`, reprice and run-stopped (`abg/witness_definition_bindings.ts:373`, `:378`; contract `abg/witness_operation_contracts.ts:123`)
   - `workspace.create` and `workspace.open` forbid a bound environment (`product/workspace_operation_contracts.ts:37`, `:141`; `product/admission_authority.ts:400-403`), so they are outside F1.
   - The other `exactly_one` admissions ask strict on their own path:
     - `catalog.admit`, `catalog.view` and `catalog.apply`, through a strict Catalog admission;
     - `conformance.evaluate`, through a strict reconstruction;
     - `release.snapshot`, through strict release qualification.

On the base the fold asked strict, so both paths inherited a strictly established lock. On the branch they inherit a recorded one.

Paths that stay safe:
- The Public `workspace.bind` binding asks strict itself (`product/environment_definition_bindings.ts:533`, `:538`) before it calls `admitWorkspaceBinding` (`:722`).
- `catalog.admit`, `product.install` and `product.verify` ask strict on their own resources.
- Run invoke and continue go through a strict Catalog admission.

**How I know (run).** Two probes, each on fresh scratch copies of the store:
- `node scripts/probe-q4.mjs <tenant> <label>` reopens a copy of the RC10 native-assessment fixture.
- `node scripts/probe-forged.mjs <tenant> <label>` reopens a copy of a two-install store. Its inline lock is the lane's `UNDETECTED` alteration: an identity added to a projected-only contract, naming a graph row, with every carried digest consistent. The store's second install is a compact reference to the first. The store is written by `branch/T/test_env/tests/zz-review-forged-store.test.mjs`, which is the lane's helpers plus one case, to `/private/tmp/abg-td77review-tmp/forged/events.jsonl`.

Each probe:
1. folds the store (`projectOwnedPrefixArtifactTruth`);
2. calls `abg.admitWorkspaceBinding` with a new sibling binding (a new workspace id and roots) over the store's installs;
3. calls `admitCapabilityEnvironment(admissionEnvironmentSelection(prefix, binding), null, true)`.

| Build | Store | Fold | Lock: strict / recorded | `./abg admitWorkspaceBinding` | `admitCapabilityEnvironment(…, true)` |
| --- | --- | --- | --- | --- | --- |
| base | RC10 fixture | projects | true / (one question) | `artifact_owner_result`, 1 event appended | admitted, lock strict |
| branch | RC10 fixture | projects | true / true | `artifact_owner_result`, 1 event appended | admitted, lock strict |
| base-edit | RC10 fixture | refused (`event_envelope_invalid`) | false (the probe stops at the fold; this lock is one of the 186 in `scale/diff-guards-edit.json`, where base strict is 0/186) | not reached: the door's own fold (`:1293`) refuses the prefix | not reached |
| branch-edit | RC10 fixture | projects | **false / true** | **`artifact_owner_result`, 1 event appended**, new binding over lock `sha256:1e4b771f…` | **admitted, lock strict false** |
| base | forged store | refused (`event_envelope_invalid`) | false | `artifact_owner_coordinate_refusal`, 0 appended | not reached |
| branch | forged store | projects | **false / true** | **`artifact_owner_result`, 1 event appended**, new binding over the forged lock `sha256:8deed82e…` | **admitted, lock strict false** |

Why the base refuses the forged store: its fold throws "Product install inline body requires one resolved lock and no body cause" at the first event. That is the strict lock check in `establishInlineLock`. The branch folds both events, so the forged events are well formed and the question is the only difference.

The strict constructor `constructWorkspaceBinding` refuses the same inputs on `branch-edit` and on the forged store (`invalid_declared_root`, from strict `isProductSet`). So the strict question is available and refuses; the door does not ask it.

Return residual 22.3 says the doors refuse this R1 class: "A door refuses it (`admitProductInstall`, `scope_mismatch`; the run door, `binding_lock_mismatch`)". That holds only for doors that receive the lock as an argument.

**Reach beyond what I ran (read).** I ran the environment admission, not a full Public `result.assess`, `product.materialize` or `witness.admit` call. By reading, nothing between that admission and those owners' native work asks a Product-truth guard of the environment's lock:
- the grant is graph-only;
- `checkAdmissionScope` compares the caller's slots with the environment's coordinates;
- the owners select contracts by id and digest from `environment.productInstalls`.

Under an identity-only change (sim2, or the R1 class) the graphs stay strict-valid. The package's `c1/check-locks.mjs`, run on my `branch-edit` over my copy of the 186 locks (`scale/check-locks-branch-edit.json`), gives:
- locks: recorded 186, strict 0;
- graphs: 144, of which 143 are non-empty; recorded 144, strict 144.

**What would settle it.**
- Ask the strict question of a fold-established lock wherever new work takes it. There are two places:
  - `RuntimeArtifactFacts.prepare` under `"strict"`, at the workspace.bind branch (`abg/artifact_truth.ts:532-590`). This covers `admitWorkspaceBinding`.
  - The live environment admission (`product/admission_authority.ts:467-468`, or `admitCapabilityEnvironmentOutcome` when `requireCurrent`).
- Or record in the fold facts which question established each lock, so that a strict consumer can require a strictly established one.
- Add lane cases on the forged two-install store and on the fixture under the sim2 register. Each case asserts refusal before append at `./abg admitWorkspaceBinding` and at one `withAdmissionAuthority` owner. The recipe is in the two probe scripts and the scratch test named above.

### F2. The lane does not show three of its claims (medium)

**Mutants (run).** Each mutant removes one relation (`scripts/apply_edit.py`). Each was built with `npm run build` and the lane file run with the brief's test command (`lane-mut-M*.tap`). The unmutated branch passes 24/24 (`lane-branch.tap`, 66.6 s).

| Mutant | Relation removed | Lane cases that fail |
| --- | --- | --- |
| M1 | identity relation, `recordedCapabilityIdentitiesHold` returns true (`product/verify_product.ts:759`) | 6, 11, 12, 14, 16, 22 |
| M2 | acyclicity (`shared/capability_contracts.ts:520`) | none |
| M3 | per-row slot ownership (`shared/capability_contracts.ts:577`) | none |
| M4 | verified-artifact owner-coordinate membership (`product/verify_product.ts:916-919`) | 22 |
| M5 | dependency resolution (`shared/capability_contracts.ts:499-507`) | none |

1. **Acyclicity cannot refuse anything that dependency resolution accepts** (read; consistent with M2 and M5).
   - A row's digest covers its dependencies' references and digests. So a cycle whose dependency digests all resolve would need a hash fixed point.
   - The cycle tamper (`:186`) is therefore refused at dependency resolution (`:499-507`) before the acyclicity check at `:520`.
   - The "dependency that names no row" tamper (`:185`) is refused at dependency resolution too. Under M5 it is refused by something else: `rows.get(…)!` is undefined inside the acyclicity walk (`:514`), which throws a TypeError, and the catch at `:460` swallows it.
   - So no lane case shows dependency resolution or acyclicity refusing on its own. Removing either leaves the lane green.
2. **Per-row slot ownership is exercised by no case** (M3).
   - My differential drops one definition-slot coordinate from one owning row and reseals every digest (below). The recorded question refuses this on all 186 locks, so the relation matters.
   - The lane has no such case.
3. **Lane 12, "each refusal is the named relation"** (`:241-254`), names a relation only for the identity cases. For the four graph tampers it asserts only that the graph guard refuses, which any relation satisfies. Return deviation 4 says the case "shows that each relation refuses on its own". That is not so for items 1 and 2.
4. **Lane 18 does not tell the questions apart** (run).
   - `zz-review-lane18-recorded.test.mjs` in my branch copy is the lane file with both Catalog calls in case 18 changed to `admitGraphFunctionCatalog(basis, 'recorded')`. It passes 1/1: every variant still gets `binding_lock_mismatch`, and the recorded lock still gets `verified_product_mismatch`.
   - The readiness basis uses the recorded bind artifact, whose `lockDigest` names the recorded lock. So `isWorkspaceBindingCandidateInResolvedLock` refuses every variant whatever the question (`product/catalog.ts:489-497`, one refusal code for both checks).
   - The title "refused by the strict Catalog stage" is not what the case shows.
5. **No case covers F1.**

**What would settle it.**
- Add a dependency-resolution tamper that keeps the graph acyclic and the walk total: one dependency digest wrong, its row and graph digests resealed.
- State in the lane and in the Return that acyclicity is defensive only, and drop it from "refuses on its own". Or test it through the unexported relation directly, without digests.
- Add a slot-ownership tamper: drop one slot coordinate from one owning row and reseal.
- In lane 18, use a workspace binding that names the variant lock, so that only the lock question can refuse.
- Add the F1 cases.

### F3. Design and Return sentences that do not state what the code does (medium)

These are read, checked against the code and against F1 and F2 (run):

- **Design `:253`, "the admission candidate … | strict".** True of an inline install lock only. The workspace.bind candidate takes its lock from the fold (F1).
- **Design `:254`, "every admission door and constructor … run and admission grants … | strict | the exported signatures".** Not true of `./abg admitWorkspaceBinding`, an exported door, or of the admission environment. The admission grant is strict on graphs only (F1).
- **Design `:236-237`, "A door refuses such a value with the strict question".** True of `admitProductInstall` and the Public `workspace.bind`. Not true of `./abg admitWorkspaceBinding`, or of the `withAdmissionAuthority` owners that take a bound environment and ask no guard of their own: `product.materialize`, `result.assess` and `witness.admit` (F1, forged-store row).
- **Design `:305-307`, "Every path that starts or continues work asks the strict question and refuses what it refused before; a recorded value with every digest recomputed grants no work".** False on both counts (F1).
- **Design `:248`, "So the fold reads every store whose locks a door admitted".** False for a store holding a `release.snapshot` row under a changed register. The design's own `:284-303` says that branch asks strict. No recorded store holds such a row (Q5 note), so this is unobserved, but the sentence is unconditional.
- **Return.**
  - Table 12 omits `admitWorkspaceBinding`, `validateAdmissionCapabilityBasis` / `admitCapabilityEnvironment`, and the workspace.bind branch of the candidate.
  - Section 13 and residual 22.3 say the doors refuse the R1 class, and cite the run door's `binding_lock_mismatch` as the strict refusal. That refusal comes from the binding relation (F2 item 4).
  - Deviation 4 is covered under F2.

**What would settle it.** Correct the sentences after the F1 fix, or state the exceptions if the Executive keeps the behaviour.

## Where the Return differs from what I found

Before reading the Return I wrote my own view of the diff (`/private/tmp/abg-td77review-work/step1-own-view.md`). It names, as suspicion S1, the fold-established facts reaching admission through the `…InResolvedLock` forms. F1 confirms it.

**Where the Return differs:**
- **Table 12, section 13 and residual 22.3** list every door as strict and say the doors refuse the R1 class. They miss `./abg admitWorkspaceBinding`, the workspace.bind branch of the candidate, and the admission environment (F1).
- **Lane 18's `binding_lock_mismatch`** is cited as the run door's strict refusal. It is the binding relation, under either question (F2 item 4).
- **Deviation 4** says the tamper lane shows "each relation refuses on its own". Three relations are not shown (F2).

**Where the Return agrees with my runs:**
- strict equals base, and strict implies recorded (section "Strict implies recorded", sections 11 and 16.4; my Q1 and Q2);
- the scale result (section 16; my 13 digests equal the package's);
- the four lane cases that refuse under a changed register (section 16.3; my Q5 runs);
- residuals 22.4, 22.5 and 22.7.

## Answers to the eight questions

### 1. Is strict the old guard? Yes, for every value I tried (run and read)

- **Read.**
  - The strict question is `capabilityGraphRelationsHold && canonicalEquals(construct(owners), graph)`; the base was `canonicalEquals && row digests && graph digest`.
  - The constructor builds every register row for a non-empty graph (`shared/capability_contracts.ts:389`). It sorts dependencies, owners, effects and proofs with the same comparators the relations use. The coordinate schema has no transforms. So equality implies the relations.
  - Under strict, the verified artifact's new owner-coordinate membership check (`verify_product.ts:916-919`) is implied by equality with the construction over `graphBasis`.
  - `projectWorkspaceStatus` under strict asks the lock guard first, as on the base.
- **Run.**
  - `scripts/diff-guards.mjs` loads base and branch in one process and applies both guards to all 186 distinct recorded locks (a copy of the package's `c1/distinct-locks.jsonl`), their 144 distinct graphs, and 8 resealed mutation families per toolchain row (1,302 applied values). The families are: identity added, identity removed, identities unsorted, slot coordinate dropped from one row, leaf row removed, forged catalog digest, graph emptied, and duplicate effect ref (skipped: no row has effect refs).
    - Under the unchanged register (`scale/diff-guards.json`), base strict and branch strict disagree on no value. Locks: 186/186 both. Graphs: 144/144 both. Every mutation family gets the same verdict from both.
    - Under the register edit (`scale/diff-guards-edit.json`), base strict and branch strict are 0/186 on locks and 144/144 on graphs, with no disagreement.
  - `scripts/diff-verified.mjs` compares the guards on the lane's 16 verified-artifact values (copy, forged catalog, stale digest, empty graph with and without an identity, three variants, the R1 value, seven tampers). Base and branch strict agree on all 16.
  - The 292 `.d.ts` files of the base and branch builds are byte-identical.

### 2. Does strict imply recorded? Yes; I found no counterexample (run and read)

- **Read.** A non-empty strict graph has a row for every register capability, so register identities name rows. A strict empty graph leaves no identity. `capabilityDefinitionGraphAssetBytes` is `serializeCapabilityDefinitionGraph` after the strict check.
- **Run.**
  - The differential has no value with strict true and recorded false: 186 locks, 1,302 mutated locks, 144 graphs, under both registers.
  - On the 16 verified-artifact values, strict implies recorded.
  - The scale run (Q7) has no store that base folds and branch refuses.
- **The only known door/fold asymmetry** is the `release.snapshot` branch under a changed register (R5). See the note under Q5.

### 3. Can the recorded question make a kept read return a wrong answer? Not for a supplied copy; the fold itself now answers for R1-forged history (read, with lanes 19 and 24 run)

- **`workspace_status`.** The binding owner requires the packet's binding to be the admitted one (`hasAdmittedWorkspaceBinding`, binding identity, admission row, authority basis, `bindingAuthorityMatches`) before `WorkspaceProjectionPort.status(packet, "recorded")` (`product/project_read_definition_bindings.ts:719`). The projection then needs the lock to hold the binding candidate, and the binding names its lock by `lockDigest`, which the guard recomputes. A consistent lock other than the recorded one gets `not_ready`. Lane 19 shows this for three variants and the R1 value.
- **Run read through the historical declaration proof.** The proof Catalog's lock, binding and installs must equal the recorded environment (`product/declaration_closure.ts:80-89`). Its `basisDigest`, which covers the verified products, must equal the recorded root basis's `catalogBasisDigest` (`abg/project_read_ports.ts:390-393`). Otherwise the read is `invalid_history`. Lane 24 passed on my copy.
- **Run-read grant.** The owner is selected among the fold's installs of the source binding, and the supplied slots and grants are compared with them. It is bound.
- **The fold.** There is no supplied copy here. For a store whose install lock is R1-altered with consistent digests, the base refused the store. The branch folds it, and every read over it answers from the altered lock (run: forged store, "projects"). That is the declared R1 residual for reads. What it was not declared to do is feed admissions (F1).

### 4. Does any path that starts or continues work, or admits anything, ask recorded? Yes: F1 (run and read)

- **Retained facts and caches.** `RuntimeArtifactFacts`, shared per prefix by the fold (recorded) and the candidate (strict), serves fold-established installs to the strict candidate (`abg/artifact_truth.ts:436`, `:532`). The derived environments (`WORKSPACE_ENVIRONMENTS`, `ENVIRONMENT_WRAPPERS`) serve them to the admission environment. Both are run-shown in F1.
- **The compact install reference** at `:436` reuses a fold-established lock too. Both doors that can append such a body ask strict on the supplied lock first (`admitProductInstall`; the Public `product.install` at `product/install_definition_bindings.ts:142-143`), so I found no path through it.
- **Catalog retention is clean** (read; one run).
  - Recorded results go to `recordedCatalogs` and never into `ownedCatalogs` (`product/catalog.ts:726-729`).
  - `isAdmittedReadyGraphFunctionCatalog` requires both maps (`:420`).
  - Views over a recorded Catalog are not admitted (`:969-970`).
  - `scripts/catalog-cost.mjs` shows `isAdmittedReadyGraphFunctionCatalog` false on a recorded result.
- **Release-qualification retention is clean** (read). `nativeFacts` (`abg/qualification_proof.ts:109-123`) is kept per prefix.
  - Its `declarations` map is filled only by the strict reconstruction at `:214`. That call passes no question, so `product/declaration_closure.ts:76-78` admits strict.
  - Its `graphs` map (`:163-172`) holds owners from `deriveGraphOwner` (`:177`), which pass through that reconstruction.
  - Its `terminals` map holds a terminal read under recorded (`:448-456`). That read is reached only through such an owner.
- **Defaults and overloads.**
  - Any second argument other than `"recorded"` is strict; the lane's callback-index assertion covers this.
  - The exported signatures default to strict.
  - `prepareRead` requires its question.
  - No caller passes the literal `"recorded"` toward work. The recorded lock reaches work through the fold's retained facts instead (F1).

### 5. Which reads still ask strict under a changed register? I agree with the five the package keeps strict, and found no unlisted strict read (read; lanes and a store count run)

| Read | Strict? | My view |
| --- | --- | --- |
| conformance evaluation (`validator/conformance_definition_bindings.ts:271`, `:294`) | yes | Agree. It is an admission operation judging a Program under the reader's own contracts. |
| historical GraphCall source (`abg/project_read_ports.ts:592-593`) | yes | Agree. Its only caller is `implementation/leaf_invocation_port.ts:499`, input to a new run. |
| closed terminal (`:623-625`) | yes | Agree. Its callers are `abg/worksite_command_forward.ts:130` and `abg/native_work_reacquisition.ts:75`, both continuing work. |
| `catalog_list`, `catalog_describe` | yes | Agree. They admit a supplied Catalog with no binding to recorded history, so recorded would list any internally consistent Catalog. They refuse under a changed register (declared in residual 22.7). |

Every other register read I found on a recorded path is declared:
- **The run-read grant** builds from the reader's own `project.read` `capabilityRefs`, which `capabilityRefsForDefinition` projects at module load (`abg/project_read_operation_contracts.ts:359`, `product/project_read_operation_contracts.ts:195`). This is residual 22.5.
- **The `release.snapshot` branch** (residual 22.4).

A grep of `capabilityRefsForContract`, `capabilityRefsForDefinition` and `DS1_CAPABILITY_CONTRACT_REGISTER` outside the register module finds nothing else on a recorded path.

Lanes on `branch-edit` (run, one file at a time; taps `lane-edit-*.tap`), compared case by case with the package's run of the same edit (`/private/tmp/abg-td77-work/simlanes/sim2-r1-off-*.tap`):

| Lane file | `branch-edit` (mine) | `sim2-r1` (package) | Cases not ok, in both runs |
| --- | --- | --- | --- |
| `r10-child-proof` | 9/10, 117 s | 9/10, 113 s | 9, conformance evaluation: "declaration Catalog differs from its exact admitted workspace, installs or lock" (same message in both) |
| `t287-historical-source-resource` | 1/4, 217 s | 1/4, 208 s | 1, 3, 4: `historicalGraphCallSource()` returns null (`assert.ok(result)`, lane file `:79`) |
| `t287-cross-cut-public-read` | 5/5, 600 s | 5/5, 600 s | none |

- The same cases fail with the same messages, and no other case differs.
- The failing cases are the conformance read and the historical GraphCall source, both kept strict on purpose (rows 1 and 2 of the table above).
- This agrees with Return section 16.3 and residual 22.1.
- I did not run these lanes on `base-edit`. The base columns of Return 16.3 are the package's.

**The Executive's note on `release.snapshot`.**
- **Accurate (read).** `abg/artifact_truth.ts:496-504` runs `isReleaseOperationArtifact`, then `projectReleaseQualification` / `projectReleaseAcceptance`, which reconstruct the proof Catalog strictly (`abg/qualification_proof.ts:214`). If either refuses, `:504` throws. The owned fold turns that throw into `event_envelope_invalid` for the whole prefix (`:892`). So the store is refused, not the row skipped, as on the base.
- **"No recorded store holds such a row" (run).** Of the 121 stores, 0 hold a `release.snapshot` artifact admission. `scripts/release-rows.py` parses every line that names the operation and tests `payload.operationId`. A raw string search is useless here: every lock names the contract.
- **Incomplete.** The branch also reads the reader's register directly at that point: the `capability_grants` slot against the release contract's `capabilityRefs`, and `admitExactDefinitionCall` against the reader's definition. The design (`:298-303`) and residual 22.4 say so.
- **Unfinished in the same way.**
  - The run-read grant (above) is.
  - Nothing else in the fold is (read). `prepare` admits four operations:
    - `product.install` asks the passed question of an inline lock (`:412`). Its candidate check (`:465`) and the compact reference (`:436`) ask no guard.
    - `workspace.bind` uses `constructProductSet`, which is structural, and the `…InResolvedLock` forms (`:546`, `:559`, `:573`).
    - `product.materialize` (`:514-515`) reads the fold-derived environment and compares contract ids and digests (`:201-296`). It asks no guard and reads no register.
    - Only `release.snapshot` asks strict.
  - The 121 stores hold only `product.install` rows (239 admissions) and `workspace.bind` rows (133), each kind in all 121 stores (run: `scripts/artifact-ops.py`, output `scale/artifact-ops-121.txt`). So the scale evidence exercises those two branches only. No store exercises the `product.materialize` branch.
  - Outside the fold, I grepped the call sites of the lock, install, product-set, binding, graph and verified-artifact guards. Each call that defaults to strict is on an admission path (`product.install`, `product.verify`, `catalog.admit`, the Public `workspace.bind`) or on conformance. The recorded literal among them is the `project.read` source binding (`product/project_read_definition_bindings.ts:264` → `abg/environment_admission.ts:411`), which is a read.
  - F1 is not this kind: it is recorded where strict is claimed, the reverse.

### 6. The lanes (run)

| Case | Asserts its title | Vacuous parts | Reaches the named relation | Mutants that fail it |
| --- | --- | --- | --- | --- |
| 1 recorded lock, both questions | yes | none | n/a | none |
| 2-4 register variants | yes | none | n/a | none |
| 5 stale coordinates | yes | the strict half is expected anyway | refused at flat-coordinate correspondence; lane 12 shows identities and graph hold | none |
| 6 identity naming no row | yes | none | yes | M1 |
| 7, 8 row digest, graph digest | yes | none | yes, by construction (`skip`) | none |
| 9 dependency naming no row | yes | none | first refused at dependency resolution; without it, by a TypeError in the acyclicity walk (F2) | none |
| 10 dependency cycle | yes | none | no: refused at dependency resolution; acyclicity is unreachable (F2) | none |
| 11 row dropped while named | yes | none | yes | M1 |
| 12 each refusal is the named relation | partly (F2) | none | identity cases yes; graph cases unnamed | M1 |
| 13 R1 | yes | none | n/a | none |
| 14 empty graph with identity | yes | none | yes | M1 |
| 15 stale lock digest | yes | none | yes | none |
| 16 fold | yes | none | n/a | M1 |
| 17 `admitProductInstall` door | yes; `scope_mismatch` before append discriminates | none | n/a | none |
| 18 run door | no (F2) | the refusal is the binding's, under either question | no | none |
| 19 `workspace_status` | yes; the refusal is the binding's lock digest, as its title says | none | n/a | none |
| 20-21 verified copy, variants | yes | none | n/a | none |
| 22 verified tampers | yes | none | yes | M1, M4 |
| 23 strict implies recorded | yes, on the 6 strict-accepted values it lists | a narrow base; my differential covers 1,302 more | n/a | none |
| 24 run read | yes | none | n/a | none |

I found no bare `assert.throws` around something that throws anyway, and no comparison of a value with itself. Lane 16's `assert.throws` checks the specific message.

### 7. Evidence at scale (run)

- **Sample.** 13 stores from 8 cuts (`scale/sample-cuts.tsv`; cut = toolchain row `packageVersion`, from the package's `lock-graph-census.jsonl`).
- **Probe.** The package's `scale-probe.mjs`, copied unchanged, mode `off`, on four builds.
- **Result.**
  - Base and branch project all 13 with equal digests under the unchanged register.
  - Under the register edit, base refuses all 13 and the branch projects all 13 with the unchanged-register digest.
  - All 13 digests equal the package's own `scale-r1/base-unchanged`, `final-unchanged` and `final-register-edit` outputs.
- **The base refusals** are "Product install artifact truth requires one complete candidate and resolved lock" on the three dev.286 stores (historical complete-candidate bodies), and "Product install inline body requires one resolved lock and no body cause" on the rest.

| Cut | Bytes | Events | Store (under `.ai-workspace/`, abbreviated) | Truth digest: base, branch, branch-edit (all equal) | base-edit |
| --- | ---: | ---: | --- | --- | --- |
| 5.0.0-dev.286 | 2,655,639 | 2 | `comments/codex/20260909_D4_SELF_CONFORMANCE/s01-01/…` | `sha256:a7cea87759dda1bc1ad5d5aa044e1c66aa9b66c6caea01487f9e016d1d2eb8cd` | refused |
| 5.0.0-dev.286 | 4,175,254 | 36 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/installed-witness-01/events-04` | `sha256:2ae43baca8662389655f3e37dd3817d0d9eb7b6672f664bcec8fb4991096bbcc` | refused |
| 5.0.0-dev.286 | 19,058,361 | 913 | `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-witness-continuation-13/execution-01` | `sha256:8cb5904ff28b65b6164d698aa178ece2831d97c8fba663e64a53bc51634ae204` | refused |
| 5.0.0-rc.3 | 3,196,379 | 3 | `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/practical-witness-001/setup-host/…` | `sha256:cb9e6a1d950a3be0a2dc7e1199b8e326b2f458692c5d83fcc232fb65e30883e4` | refused |
| 5.0.0-rc.3 | 4,163,734 | 263 | `…/rc4-native-recovery-01/runtime-003/…/hc2-current-intent/consumed-events.jsonl` | `sha256:360db391950213a231f40d043bf39c4c5b6ec12c3da73f0d9ee7ebcf1fcebb02` | refused |
| 5.0.0-rc.4 | 3,199,163 | 3 | `…/rc4-native-recovery-01/runtime-003/…/sandbox-uat-units/maintained-setup/2026-11-03T03-33-19-564Z-…` | `sha256:e1e5a110fcbf7e968d732acb620f4ec7bd70b5778b334133356bb25cc3dd4857` | refused |
| 5.0.0-rc.6 | 3,177,829 | 2 | `…/release-qualification-rc6-01/rc7-carriage-measurement-01/actual-001` | `sha256:c820ebab8d2f76bf74c80f82a2b3e51a31a6316b2e5ed54921c9f516a1661a8c` | refused |
| 5.0.0-rc.6 | 3,807,167 | 44 | `…/release-qualification-rc6-01/rc7-held-session-author-02/blocked-testing-diagnostic-001` | `sha256:0a5b675c175fd82a78ab5f5c78267d8ff04edc66a8303f754ecb7ce238ab4c28` | refused |
| 5.0.0-rc.8 | 4,187,258 | 282 | `…/rc8-reference-preservation-01/registered-selection-whole-001/actual-001` | `sha256:763147290ab7aeaa3786f306c939947ebc1596190bd26f197456bff31d7cec31` | refused |
| 5.0.0-rc.9 | 5,824,147 | 289 | `…/rc10-retention-01/native-repair-02/runtime-001` | `sha256:f9f1baccae7872589cb059286b399cc0f17b2093c272512391a3d65dae7bdc9a` | refused |
| 5.0.0-rc.10 | 3,188,209 | 3 | `…/rc11-effect-phase1-01/native-01/runtime-001` | `sha256:36e6a9b7b98c005cda5086cfba1141982f8ae298bb94c9119a29a048cdfe953f` | refused |
| 5.0.0-rc.10 | 4,322,248 | 179 | `…/rc11-effect-phase1-01/native-03/runtime-001` | `sha256:03e8d9d51b7377ee577306af5f2d97fcb3f2addf42965cf17f5e9b259465b5df` | refused |
| 5.0.0-rc.12 | 14,506,732 | 1,695 | live rc.12 store copy (`/private/tmp/abg-td77-work/live-rc12.events.jsonl`) | `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` | refused |

The register-edit check over all 186 recorded locks: base strict 0, branch strict 0, branch recorded 186. All 144 graphs are strict on both builds (`scale/diff-guards-edit.json`, `scale/check-locks-branch-edit.json`).

### 8. Does each design sentence the branch adds state what the code does? Mostly; five do not (F3)

- **Hold (read; run where marked):**
  - the two questions and who passes them (`:158-172`);
  - unchanged exported signatures and declarations (`:174-177`; run: `.d.ts` identical, differential clean);
  - no internal default (`:177-183`; the six optional-question owners are exported overloads, as the text says);
  - what both questions check (`:193-205`);
  - the graph relations, and "which implies them" (`:207-222`; run);
  - the identity paragraph up to `:235`;
  - "Everything the strict question accepts, the recorded question accepts" (`:239-247`; run);
  - the read-copy bindings (`:263-276`);
  - Catalog retention (`:272-276`);
  - the run-read grant (`:277-282`);
  - the `release.snapshot` paragraph (`:284-303`). It also says outright that `admitCapabilityEnvironment` "ask[s] no guard again", which is the mechanism of F1.
- **Do not hold:** `:236-237`, `:248`, `:253`, `:254`, `:305-307` (F3).
- **The T289 sentence** ("An inline lock answers the recorded question when the fold advances … and the strict question when admission prepares its candidate") is accurate for inline locks. It is silent on the compact reference (`artifact_truth.ts:436`) and on the workspace.bind branch, which reuse fold-established locks.
- **The README index line** is accurate.

## Requirements read

- **REQ-M-GTL3-CAPABILITY-008** asks replay and qualification evidence to keep the exact manifest identity and digest under which the work ran. It also asks a change of meaning to carry a new versioned claim. Together these support reading recorded truth as recorded, and refusing new work over a recorded meaning the reader no longer constructs. F1 breaks the second part.
- **REQ-P-CATALOG-013** (no change of a resolved lock through re-resolution) supports keeping the recorded lock as read.
- **REQ-P-CATALOG-012** asks a lock selected into a binding to be complete and compatible, refused if not, and "not silently satisfied from … prior workspace". `./abg admitWorkspaceBinding` on `branch-edit` forms a new binding from a prior workspace's installs over a lock the reader's strict question refuses (F1).
- **REQ-P-PUBLIC-CONTRACTS-004, -011, -012 and REQ-M-GTL3-CAPABILITY-014.** These bind identities to one capability-definition graph and to the catalog by identity, version and digest. The recorded question checks only that each identity names a row of the carrier's graph, and does not recompute the catalog digest. The strict question does not recompute it either, and the design states the R1 gap that follows. I found no further conflict.

## What I did not check

- **A full Public `result.assess`, `product.materialize` or `witness.admit` call** over the forged or changed-register store. F1's reach past the admitted environment is by reading.
- **The package's simulated-withdrawal register.** I used the identity edit only.
- **The other 293 stores of the 414-store census** (refused at decode on base, or over 300 MB).
- **The whole suite.** I ran the TD-77 lane, five mutants, and three read lanes on `branch-edit`. I did not run those three lanes on `base-edit`.
- **The merge with current `main`.** I did not re-run it; I took the brief's statement that it is clean.
- **The in-run consumers of the fold-derived environment.** These are in `implementation/native_workspace_work.ts`, `implementation/worksite_file_replace.ts`, `abg/semantic_revision.ts`, `abg/worksite_construction_recovery.ts` and `abg/execution_basis.ts`. By reading they run inside a run admitted through a strict Catalog. I did not trace each to its entry.
- **Cost.** I timed one Catalog admission only: the D2 readiness basis, not deep-frozen, so neither question hits its retention. Strict took 260-280 ms; recorded took 189 ms on the branch and about 240 ms on the base. That is no regression.

## Scratch to remove

`/private/tmp/abg-td77review-work` (1.7 GB: nine tree copies and their builds, scripts, taps and scale outputs) and `/private/tmp/abg-td77review-tmp` (267 MB, including the 226 MB verified-value dump and the probe stores). Both are mine. I deleted nothing.
