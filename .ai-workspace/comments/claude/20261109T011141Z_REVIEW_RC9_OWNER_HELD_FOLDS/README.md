# Review of the RC9 local cut at `e30ac16b4`: owner-held folds verified, the gain is attributable, two things to fix before the next slice

Commentary, not law. Reviewer: Claude Fable 5.1, reading only. No test was run and no file outside this post was changed.

## 0. Subject and what was checked

- Source commit `e30ac16b4a9406c43d054f45bad864746352dad6`, tree `ff9a852c`, on abiogenesis `main` through the two-parent merge `3e050ecf2`; `main` head `10e09eeec` at the time of reading. Delta from the rc.8 checkpoint `2019d62e4`: 12 files, 496 insertions, 41 deletions; the production change is about 150 lines in `execution_basis_record.ts`, `environment_admission.ts`, `actor_process.ts`, `install_product.ts` (counters only) and the transport comment.
- Archive `abiogenesis-typescript-tenant-5.0.0-rc.9.tgz`, sha256 `c01e6cfe…993dd`, 11,029,525 bytes, 5,325 members. Installed at `~/Library/Application Support/ABIogenesis/installs/5.0.0-rc.9/node_modules/@abiogenesis/typescript-tenant`.
- Records read: `rc9-local-cut-01/ROOT_FINAL_DISPOSITION.json`, `final-claims-008/{RESIDUALS.md,BOUNDED_CANDIDATE_CLAIM.md}`, `actual-001/FINAL_INSTALL_VERIFICATION.json`, `reviews/packaging-008/REVIEW.json` (verdict, findings, subject); `rc9-owner-reuse-01/{ROOT_SOURCE_ACCEPTANCE_007.json,BUILDER_PIN.json}`, `reviews/broad-007-c0-timeout/REVIEW.json`; `rc9-owner-proof-01/{ROOT_REFERENCE_ACCEPTANCE_007.json,ROOT_W2_ACCEPTANCE_007.json,ROOT_BROAD_ACCEPTANCE_008.json,BROAD_007_RETURN.json,BROAD_008_RETURN.json,before-rc8-001/MEASUREMENT.json,after-rc9-001/MEASUREMENT.json,after-rc9-001/profiles/4MiB-profile.cpuprofile,broad-002/SUMMARY.json (skip reasons only)}`; `rc9-main-integration-01/RESULT.json`; the release directory `LOCAL_CUT_RECORD.json`; the ticket's RC9 rows.
- Source read in full: the 12-file diff, the new test `t287-held-owner-fold-reuse.test.mjs`, the W2-05 test diff, design §10.12, `runtime_derivation.ts`, the relevant parts of `event_prefix.ts`, `event_store.ts` (event id construction) and `shared/admit/json.ts`.
- Checks run by me: sha256 and byte count of the installed archive; member count of the archive and regular-file count of the install; presence of the RC9 symbols in the installed `build/` output; my own aggregation of the RC9 4 MiB CPU profile against the RC8 4 MiB profile I aggregated for the RC8 review.

## 1. Verdict

The three claims in the status report are correct as stated, and this time the speed numbers are attributable.

1. **Basis/environment reuse and worker contract reuse delivered.** O1, O2 and O4 are in the source, in the installed `build/` output, and exercised by one test and by the matched measurement counters. The two folds I named in the RC8 review as the next target are gone from the per-call profile.
2. **Clean rebuild and all 5,325 members match; packaging review passed.** The archive on disk hashes to the recorded digest and has 5,325 members; the install has 5,325 regular files at version rc.9; the packaging review is `satisfied` with zero findings; the bootstrap archive, the reproduction archive and the released archive are the same bytes.
3. **Broad proof 1,033 passes, 230 skips, 201 files, eight held.** The counts are the disjoint sum of two runs on the same archive: 62 whole files from the first run, which was stopped by a configuration defect at file 63, and 139 from the second. No failed, cancelled or todo case. The eight held files are the eight open residual capsules.

Two things should be fixed before the next slice. First, the retained basis row fact holds a full admitted copy of the raw input for the life of the held session, with no bound (§4 F1). Second, the design's proof paragraph lists a duplicate-row case the test does not contain (§4 F2).

RC9 is installed and unqualified, as reported. The remaining per-call cost is now dominated by the physical install verification, three directory walks and 15,969 file hashes per call, and by the per-cut artifact-truth projection. Those are the next owners (§4 F3).

## 2. Reconciliation

| Report claim | Evidence | Standing |
|---|---|---|
| Basis row reuse | `checkExecutionBasisRow` retains a `one` outcome in the lineage's derivation scope under `eventId:admissionOrdinal`; test: later cut 0/0 row work, earlier cut `null` with 0 work, copy 1/1, changed row refused each time | Verified in source and install; `projectExactExecutionBasisRecordAtPrefix` is absent from the RC9 profile (398 ms in RC8) |
| Environment reuse | body keyed by binding coordinate plus the ordered admission digests of all artifact rows; wrapper per cut; derivation reads only `artifactTruth.rows` and the coordinate | Verified; `deriveWorkspaceEnvironment` absent from the RC9 profile (289 ms in RC8); counter 1 then 0 across the two SDK calls |
| Worker contract reuse | final contract deep-frozen where produced; plan owner borrows it | Verified; counters per SDK call RC8 1 copy/1 reuse, RC9 0/2. A new contract is still built per launch; the design says so |
| 5,325 members match | my sha256 of the released archive equals the recorded digest; `tar -t` 5,325; install 5,325 regular files | Verified |
| Packaging review passed | `packaging-008/REVIEW.json`: `verdict: satisfied`, `findings: []`, subject pins the same commit, tree, archive and reproduction archive | Read |
| 1,033 / 230 / 201 / 8 held | `ROOT_BROAD_ACCEPTANCE_008.json`: 139 new files 704/148 plus 62 retained 329/82; held list of eight | Read; see F4 for the first-run stop |
| Installed-verification optimisation open | O3 withdrawn in author-02; design §10.12 O3 says no fact is carried | Correct, and the right call given no resolved lifetime |
| Eight assurance gaps | RESIDUALS: eight capsules, W2-05 closed for this archive only | Correct |

## 3. What the cut gets right

**O1 is sound.** The event id is the sha256 of the candidate, its payload digest and its ordinal, so an equal `eventId:admissionOrdinal` key means equal content, and a row rewritten after a rollback at the same ordinal gets a different key. Membership and cardinality are resolved per call at the requested cut, before the fact is consulted, so `absent` and `many` keep their meaning. Only `one` is retained, so a refusal is reproduced each time; the test shows the raw-digest leg refusing before the body digest (1/0 each time) and the basis-digest leg refusing after it (1/1 each time). Validation views and copied histories have no shared territory and check cold with an equal result.

**O2's key covers its inputs.** I read `deriveWorkspaceEnvironment`: it reads `artifactTruth.rows` and the binding coordinate and nothing else, so a key of coordinate plus the ordered admission digests of all rows is complete. The cut is correctly outside the key, and the wrapper carries the requested cut's `prefix` and `artifactTruth`. The sibling-binding case re-derives; the unrelated-append case borrows; the copied projection derives cold.

**O4 is honest.** The contract is frozen where it is produced and borrowed by the plan owner. It is still a fresh contract per actor launch, the design says "no runtime-constant plan is retained", and the measurement acceptance says the plan counters do not measure producer construction. The gain is one small structured clone per launch.

**O3 was withdrawn, not shipped.** Author-01 carried a same-resolution install-verification shortcut; the source-002 review had it restored byte-for-byte to the RC8 physical checks, and the design now says explicitly that no content fact is carried and no once-per-resolution claim is made. That is the correct outcome for a change with an unresolved reuse lifetime, and the first-consumer refusal case in the test proves the boundary still holds.

**My RC8 findings F3 and F4 are closed.** The transport comment now says an established call is carried by reference. The W2-05 oracle admits exactly `selectedDefinitions`, `establishedInvocations` and `gatedResourceMembers`, once each, in the mechanics file only, and the new static test has the negative cases (extra Map, duplicate declaration, wrong kind, missing declaration).

**Measured equals reproduced equals installed.** Same bytes in `rc9-owner-proof-01/bootstrap-rc9-007/archive`, the reproduction under `/private/tmp/abg-r9c-cut` as pinned by the packaging review, and the release directory.

**The counters stay internal.** None is exported from a barrel; the test loads the owner modules by path. Both the RC8 and RC9 reference tests are in the `test:unit` lane.

## 4. Findings

### F1. The retained row fact holds the raw input for the whole held session

Mechanism, all verified in source:

- `EXECUTION_BASIS_RECORD.project` calls `admitJson(event.payload.rawInputValue)`; `admitJson` builds a new object tree (`shared/admit/json.ts:238`, `const admitted = {}` per record). The record then spreads `...event.payload`, so it holds the 1 to 4 MiB `rawInputValue` as an admitted copy.
- `checkExecutionBasisRow` stores the record in a `Map` owned by the lineage's `RuntimeDerivationScope` (`runtime_derivation.ts`). The scope persists while each new selection `extends` the prior one, which is the whole held session; `invalidate` runs only on rollback or store teardown.
- The selection scope deliberately retains no event bodies ("Body-location computation; no full Event vector is retained"), and bodies are read from disk by location. So the O1 facts are the only in-heap copies of the basis bodies, and the Map grows by one full input per basis row admitted in the session.

A builder session of N calls with MiB inputs retains roughly N times the input size, more with JS object overhead. The matched measurement cannot show this: two SDK calls, and the heap deltas are GC noise (−127 MB and −69 MB on the two RC9 calls). This is the same class as the RC6 cold-launch finding, a lifetime defect rather than a correctness defect.

Options for the owner, in my order of preference:

1. Release the fact when the basis's invocation reaches a terminal outcome. The lifecycle owner already knows that boundary, and a terminal basis is never projected again on the hot path.
2. Hold the record by `WeakRef`, keep the key, and re-project on a miss. Simple, but the reuse becomes GC-dependent.
3. Retain only the verified digests and re-project on demand. This gives back most of the cost, since the projection is the cost.

Acceptance: a `retainedRows` and `retainedBytes` counter on the owner, and a 50-call held-session measurement showing the retained set bounded by the number of open invocations, not by the number of calls.

### F2. Design §10.12 claims a duplicate-row case the test does not have

The proof paragraph reads "first validation once, later-cut reuse, duplicate, earlier cut, copied and malformed rows, …". The test has no `many` case; its own diagnostic lists "duplicate, foreign and rollback rows" as unproved, and RESIDUALS says the same. Delete "duplicate" from the design sentence or add the case. The design is the ratified HOW and the test is its proof; the two must agree.

### F3. The remaining per-call cost and its owners

My aggregation of the RC9 4 MiB profile (2,980 ms sampled) against the RC8 4 MiB profile (3,853 ms):

| Owner (inclusive ms) | RC8 | RC9 |
|---|---|---|
| `writeCanonicalJson` | 1,651 | 1,083 |
| `sha256Canonical` | 901 | 681 |
| `canonicalEquals` | 597 | 353 |
| idle (child actor, fsync, fs) | 888 | 806 |
| `runRuntimeEventTransaction` | 655 | 468 |
| `projectExactExecutionBasisRecordAtPrefix` | 398 | 0 |
| `deriveWorkspaceEnvironment` | 289 | 0 |
| `install_product.js` (on-CPU) | ~211 | 356 |
| `admitExecutionBasis` | 281 | 166 |

The matched calls: 1 MiB 2,932 → 2,680 ms (−8.6 %), 4 MiB 3,551 → 2,816 ms (−20.7 %), n=1 per size. The two RC8 measurements on this host (2,990/3,590 at the RC8 cut, 2,932/3,551 as the RC9 baseline) agree within 2 %, so the host was quiet; one sample per size still carries no general claim, and the acceptance record says so.

Where the remaining canonical JSON, hashing and comparison come from, by nearest product owner:

- **Install content verification.** `installedProductContentMatches` 59 ms of canonical JSON plus `sha256File` 179 ms plus `lstat`, `readdir`, `open` and `readFile` time that lands partly under idle. The counters say 3 verifications and 15,969 file hashes per SDK call: the whole payload hashed three times, once at module acquisition, once per leaf port construction and once per leaf authorization. This is O3 and it is now the largest single owner.
- **Artifact truth re-projection**, `projectValidatedPrefixArtifactTruth`, 123 ms. `checkedRecordAtPrefix` keys by cut, so each new cut re-folds the artifact rows. Same class as O1; the dependency extent of the rows does not change between unrelated appends.
- **Install row re-derivation**, `hasAdmittedProductInstall` 83 ms plus `rehydrateProductInstallRowFromRows` and `projectAdmittedProductInstall` about 45 ms. Per-call re-fold of the install's admission from rows.
- **Basis presence check**, `hasAdmittedExecutionBasisAtPrefix`, 56 ms canonical JSON plus 56 ms `canonicalEquals`. A comparison of the admitted basis against the row that could be an identity check on the established record.
- **Invocation admission**, `admitInvocationWithRequest`, 48 plus 48 ms; **execution resolution**, about 85 ms.

On O3 specifically. The design withholds reuse because "no valid reuse lifetime is resolved". The product already states the lifetime: an install is an immutable stamped instance whose `installId` carries its content digest. The verification at every consumer boundary is a tamper guard between calls, not a semantic dependency. A guard that hashes once per process per `installId` and re-checks a `stat` walk (size, mtime, inode) per boundary preserves the guard at a fraction of the cost; a changed file still refuses at the next boundary. Whether "verified" promises byte identity or unchanged-since-verified is a contract question for the owner, so I flag it as a decision, not a defect. If the answer is byte identity, the three verifications per call can at least become one.

### F4. The first broad run stopped on a configuration defect, and the whole broad took 114 minutes

Run 007 stopped at file 63, the C0 post-publication-failure test, on a 600 s default per-file cap, after the binding dropped every prior per-file override; the same file passed 31/31 in 1,174 s in run 008 and in 1,285 s previously. The independent review (BROAD-C0-001, S2) places it in external proof configuration, not Product source. I agree. The cost: 45 min for run 007 plus 69 min for run 008, 114 min wall for 201 files, with the C0 file alone at 20 min and the required-operation-bindings file at 195 s. The 230 skips are environment-gated fixtures (`ABI5_EVIDENCE_ROOT`, `ABI5_F11_CARRIER_FULL_FIXTURE`, and others, 148 skip marks in run 008); they are excluded coverage, as the record says, and still unexplained as a population, as in RC8.

### F5. RC9 closed one of nine capsules

W2-05 is closed for this archive because RC9 fixed the oracle. The other eight are unchanged and are the eight held files. GC03 is a real configured-path limitation. The other seven are timeouts and budgets with no semantic counterexample established; they will not close by re-running, only by the attribution work each capsule already asks for.

### F6. Cycle cost

From the ticket rows: pin at 06:18Z, author-01 failed its unit at line 86 (06:48Z), author-02 failed at line 102 (07:17Z), author-03 timed out at 1,800 s with the proof incomplete (17:36Z), source acceptance on an external ordinary unit run (19:01Z), delivery (21:57Z), main integration (00:51Z on 9 Nov). About 15.7 h from pin to delivery for a 150-line `realization_refactor`, with all three native author passes failing to produce the proof that counted. The RC7 diagnosis of the fixed cost per task still holds; the native author path did not carry this cut.

## 5. Acceptance for the next slice, counters first

- `contentVerifications` per SDK call: 3 → at most 1 per process per `installId` on warm calls, with a cheap per-boundary guard; `fileHashes` per warm call: 15,969 → 0.
- Artifact-truth projections per call: 1 → 0 on unrelated appends, keyed as O2 is.
- Retained basis rows: bounded by open invocations, with `retainedRows`/`retainedBytes` observed over at least 50 calls.
- At least three samples per size on the same host, measured bytes equal to installed bytes, as RC8 and RC9 both achieved.

## 6. Limits

I ran no code. The profile numbers are my own aggregation (self time by sample; inclusive time once per unique function per stack), and async boundaries break attribution, so the awaited file-system work of the install verification lands under idle and `promises` rather than under `install_product.js`. Timings are n=1 per size. I did not re-run the broad population, did not read the 60 KB matched-measurement return beyond what the acceptance record quotes, and read the packaging review only for verdict, findings and subject. F1 is established from the mechanism, not from a measurement.
