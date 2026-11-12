# Review of TD-80: the held store checks its log file before it appends

Reviewer: independent (T-292), 2026-11-13. Subject: branch `claude/td80-append-currentness`, head `6a9c736f8`, base `d2ed7fd58`. Commentary for the Executive; it changes nothing.

Markers: **[run]** I executed it and saw the result. **[read]** I read the code or the text. Lines are of `build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts` at `6a9c736f8` unless another file is named. `T` is `build_tenants/abiogenesis/typescript`; `M05_S06` is `T/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md` at head. "Register" is `.ai-workspace/TECHNICAL_DEBT_REGISTER.md` at `6a9c736f8`, unless commit `84279d9c3` on `main` is named. Scratch paths are under `/private/tmp/abg-td80review-work/`. "Base" results come from a build of `d2ed7fd58`.

## Verdict

Mergeable after named fixes: F3 to F6 block, because the design text must state what the code does (they fit the closing round the Executive has already ruled); F1 and F2 need the Executive's ruling first, because the Return's premise that they need TD-82 or a byte read, which the ruling on the rollback range adopted, is wrong.

Behind that sentence:

- The code does what rulings 1, 2, 3, 5 and 8 say. Every truncated, extended or replaced log is refused at all eight appending entries before the action and before the write [run]. Nothing in the code change contradicts a ruling.
- Four sentences the package restated are false against the code (F3, F4, F5), and three sentences it missed still contradict it (F6). These are defects in the package's own deliverable: ruling 6 asked for present-tense sentences that hold.
- F1 and F2 are gaps in the rulings, not deviations by the Writer. The code follows ruling 5 as briefed. Both windows close inside this package with one more file check after the write and a count of the bytes written; I ran that on a copy [run]. That is a third call site, which ruling 2's placement does not name, so it is the Executive's call.
- The Executive's ruling on the rollback range (register at `84279d9c3`, TD-80 status line, :885) adopts the Return's premise that the remaining case needs TD-82. F2 shows that premise is wrong: there are two cases, not one; neither needs a byte read or the lock; and the lock would not stop a writer outside it.

## Findings

| # | Severity | What is wrong | Where (`6a9c736f8`) |
|---|---|---|---|
| F1 | Medium | Nothing checks the file after the write. A write by another writer between the check and `writeSync` misplaces the row, and the append still returns a successor coordinate for it. The Return says this needs TD-82's lock; one check after `fsync` closes it. | `event_store.ts:2436`, `:2440-2443`; Return, Residuals bullet 2 |
| F2 | Medium | The rollback range [prior, prior + attempt bytes] lets two foreign changes through. Foreign bytes appended during a failed write are silently deleted (D5). A foreign truncation before a failed write leaves the attempt's bytes inside the committed prefix, and the store keeps appending on top (D7). The Return says closing this needs a byte read or TD-82, and the Executive's ruling at `84279d9c3` adopts that; an equality with the count of bytes written closes it. | `:2471`; Return :124-126 and Residuals bullet 1 |
| F3 | Medium | A restated sentence claims an in-memory rollback the code does not do. When something throws after `fsync`, the history keeps the row and the store refuses all later appends. Inside a transaction the original cause is also lost. The behaviour predates TD-80; the sentence was restated by it. | `M05_S06:633-635`; code `:2444-2462` |
| F4 | Low-Medium | ":357 an append reads no byte" is false. An append that shares an earlier row's body reads that row from the file and refuses a same-length change in it. On a truncated or replaced file, the bare variant refuses with the body reader's message, not the currentness message. Neither the lane nor the door table covers these appends. | `M05_S06:357`; `:2425-2426`; `event_body_encoding.ts:22-24, 155-227` |
| F5 | Low | "Close makes no file call" is false. Close closes the log descriptor and stats, unlinks and closes the lock. | `M05_S06:617-618`, `:730-731`; `:1664-1685`, `:1728`, `:2715` |
| F6 | Low | Three more live sentences contradict the store and are not in the Return's list. | `M05_S06:1863-1865`, `:1867-1868`, `:2036-2038` |
| F7 | Low | The two-process lane case asserts the TD-82 defect, so it fails when TD-82 is fixed. | `T/test_env/tests/t288-logical-prefix-digest.test.mjs:164` |
| F8 | Low | A released store still runs the transaction's action at two entries. This is pre-existing, and the skip condition of the new start check keeps it. | `:4514` |

Pre-existing and outside TD-80, noted only: P1 and P2 at the end of this section.

### F1. An append can return a coordinate for a row that is not where the coordinate says

**What.** The only file check on the success path runs before the write (:2436). After `writeSync` (:2440) and `fsyncSync` (:2443), nothing compares the file with the expected length. The descriptor is `O_APPEND` (:1695). A write by another writer between :2436 and :2440 therefore shifts this append's rows, and the append returns a successor coordinate whose bytes are not the file's bytes.

Register :889 gives the rule's purpose: "That refuses an append exactly where the append would lose or misplace its row." This case misplaces the row and is accepted.

**How I know [run].** `probes/probe-store.mjs`, scenario B4. `fs.writeSync` is replaced so that its first call on the held inode appends a 19-byte foreign row through another descriptor and then performs the real write. On head:

- The append is accepted: prior length 2,451, returned successor 3,263, file 3,282.
- A cold read of the returned successor refuses with `prefix_digest_mismatch`, "ABG durable prefix bytes differ from coordinate".
- The held `readAll` refuses with `prefix_digest_mismatch`, "selected body bytes differ from their authenticated location".
- The next append is refused with `prefix_length_mismatch`. Base accepts it.

The store before `ad2a39f40` had this check after the write (`git show ad2a39f40^:…/event_store.ts`, :1953-1956: `status.size !== priorByteLength + encoded.byteLength` throws "ABG durable event append length is inconsistent").

**Where the Return goes wrong.** Its Residuals, second bullet, says: "The check and the write are not atomic … The lock (TD-82) is the remedy for a second Product writer." The TD-82 entry's Boundary (register :914) says the same. The lock keeps out a second Product writer. It does not keep out a writer outside the lock, which is the boundary TD-80 names (register :892).

**What settles it [run on a copy].** `fix-sketch/` is head's compiled `event_store.js` with three edits:

1. `assertDurableFileCurrent(path, descriptor, identity, nextByteLength)` after the `fsyncSync` (compiled :1577, TS :2443), inside the `try`.
2. A count of the bytes `writeSync` returned.
3. The rollback range set to exactly prior + that count (F2).

Results on the sketch:

- B4 is refused with `AggregateError` [`prefix_length_mismatch`, `prefix_length_mismatch`]. The file is not truncated (3,282 bytes), the held `readAll` still gives 3 rows, and ownership is released.
- Q3, Q5, Q8 and Q9, and every healthy-store case of Q2, give the same results as head, apart from paths. I compared them with paths and digests normalised.
- `t288-logical-prefix-digest` passes 5/5. `m5-event-store-reopen` passes 25/27; its two failures (cases 7 and 8) are "packed payload digest differs from the manifest", which every compiled-JS edit causes, and my mutants fail them the same way.
- Cost: one more stat/fstat pair per append, 1.3 µs (Q7).

What the sketch leaves open [read]:

- A foreign truncation plus append that keeps the same length still passes. That is the same-length class, which ruling 4 accepts at the append.
- A foreign write that lands after this append's write and `fsync` but before the post-write check refuses a row that was placed correctly. That fails safe: ownership is released, and the bytes stay for reopen to refuse.
- I ran the sketch on two lanes only (see "What I did not check").

Needed: a ruling, then a lane case built like B4.

### F2. The rollback range lets through the two foreign changes it is there to stop

**What.** The guard at :2471 truncates when the file length lies in [prior, prior + the attempt's bytes]. The range stands in for "the bytes past the prior length are this attempt's". Two foreign changes pass it.

**How I know [run].** Base gives the same result; it has no guard and always truncates.

- **D5.** Ten foreign bytes are appended during a write that wrote nothing. The length, prior + 10, is in range, so the guard truncates them away. The caller sees the single write error, the store stays open, and the next append succeeds. The foreign bytes are gone, and nothing reports it.
- **D7** (`probes/probe-d7.mjs`). A foreign truncation of 10 bytes lands before the write, so the full 808-byte write lands 10 bytes early, and then the first `fsync` fails. The length, 2,439 − 10 + 808, is in range, so the guard truncates to 2,439. That keeps the attempt's first 10 bytes inside the committed prefix: 9 bytes now differ from the committed file. The caller sees the single fsync error, the store stays open and accepts the next append. After that, the held `readAll` and a cold read refuse with `prefix_digest_mismatch`, and reopen refuses with `durable_log_mismatch`.

**Where the Return goes wrong.**

- It says (The rollback, :124-126) that inside the range "the bytes past the prior length can only be this attempt's partial write". D5 and D7 contradict this.
- Its first residual says closing the gap "needs a byte read, which ruling 1 forbids, or the lock fix of TD-82". Neither is needed. Count the bytes `writeSync` returned, and truncate only when the length equals prior + that count. On `fix-sketch/` [run]:
  - D5, D6 and D7 refuse with `AggregateError` [cause, `prefix_length_mismatch`]. Nothing is truncated, and ownership is released.
  - D1 (short write) and D2 (failed first fsync) still truncate and keep the store open.
  - `m5-event-store-reopen` case 19 passes.

**The two ruling texts differ.** Register :889 says "no longer than the prior length plus what the attempt wrote". The package brief's ruling 5 says "at most the prior length plus the bytes this attempt had to write". The code follows the brief. Neither upper bound alone refuses D7, because its length lies below prior + written. Only the equality refuses it.

**The ruling already made.** The Executive's record of the build (main, commit `84279d9c3`, register TD-80 status line, :885 there) rules: "the rollback's length range stays as built, and the one case it lets through (a second writer that appends fewer bytes than a failing attempt) closes with TD-82". That rests on the Return's premise, and it fails on three counts:

- There are two cases, not one. D7 is a foreign truncation, not a shorter append, and its result is worse than D5's: the store keeps appending on top of changed committed bytes.
- Closing them needs neither a byte read nor a lock (the count above).
- TD-82 makes Product processes contend for one lock. It does nothing against a writer outside the lock, which is the boundary TD-80 names (register :892 at `6a9c736f8`).

**What settles it.** The Executive either revisits the ruling with D7 and the counter in view, or records D7 by name as accepted. If the counter goes in, D5 and D7 become lane cases.

### F3. A restated sentence claims an in-memory rollback the code does not do

**What.** `M05_S06:633-635` (restated) says: "A successor construction or validation failure therefore follows the in-memory rollback and the truncate and `fsync` path". After `fsyncSync`, the in-memory commit (:2444-2462) is not undone when a later step of it throws.

**How I know [run].** I added throw points to compiled JS in `probe-head/` and `probe-base/`:

| Point | Where it throws |
|---|---|
| P1 | after fsync |
| P2 | before `physicalEventPrefixes.set` |
| P3 | after `commitCanonicalPrefix` |
| P4 | before `durablePrefixCoordinate`, the successor construction |
| P5 | after `bindSelection` |

Results:

- P1, inside or outside a transaction: file and memory are restored, and the next append succeeds.
- P2 to P5 outside a transaction, and P3 to P5 inside one: the file is truncated back to the prior bytes, but the history keeps the row.
  - The digest changes.
  - `readAll` refuses with `file_identity_mismatch`, "selected body differs from its authenticated resource".
  - The next append fails: "durable append lacks its exact private admitted history".
  - Only close followed by reopen recovers (3 rows).
- Inside a transaction (P3 to P5), the caller's error becomes "runtime rollback must restore its committed prefix", and the original cause is lost.
- Base gives the same result for all ten cases.

**What settles it.** Either state what happens: the file is restored, the store refuses appends until reopen, and inside a transaction the cause is replaced. Or repair the commit section under its own register entry and keep the sentence. The Return records no residual for this.

### F4. ":357 an append reads no byte" is false for appends that share an earlier row's body

**What.** The refusal cell at `M05_S06:357` says: "an append reads no byte, so a same-length change in place refuses at reopen and at a cold read of a copied coordinate instead". But `appendDurablyBatch` encodes its rows before the check (:2425-2426), through `encodeEventBody` (`event_body_encoding.ts:212-227`). That function resolves an inline body shared with an earlier row by reading the row from the file by location (`readRuntimeHistoryRowBytes`, :3715-3737, which checks the row's digest). The sharing kinds are (`slotFor`, `event_body_encoding.ts:22-24`):

- `basis_admitted` (slot `basis_input`)
- `c_call_result_admitted` (slot `c_call_result_value`)
- `actor_transport_binding_admitted` (slot `native_definition_material`)
- the retained-route source (`event_body_encoding.ts:155-174`)

**How I know [run].** Head and base behave alike.

- With a same-length change inside the referenced basis row, an unrelated append is accepted. The body-sharing basis append is refused with `prefix_digest_mismatch`, "selected body bytes differ from their authenticated location".
- With the file truncated into that row, or replaced, a bare body-sharing append is refused by the body read with `file_identity_mismatch`, "selected body differs from its authenticated resource". That happens before the check at :2436 can give the currentness message.
- Inside a transaction, (i) refuses first with the currentness message when the change precedes the transaction [run]. For a change made during the action, the body read (at staging, or at the commit-time encode at :2425-2426) runs before (ii), so a body-sharing candidate would get the body reader's message [read, not run].

The Return's door table, the lane and ruling 3 ("the currentness owner's refusal") cover plain candidates only. In the counted default-library Run every append ran inside a transaction (Q7), so the bare variant did not occur there.

Register :889 also says a same-length change "is refused at reopen, at a cold read and at an uncached held read, and the design rows say so". The rows name only reopen and the cold read.

**What settles it.** Reword the cell to say: "a plain append reads no byte; an append whose candidate shares an earlier row's body reads that row by location and refuses a changed one". Add a body-sharing arm to the lane, or state that this is shown by reading.

### F5. "Makes no file call" is false for close

`M05_S06:617-618` says "its close compares coordinates in memory and makes no file call", and `:730-731` says "it makes no file call and reads no byte" [read].

Close ends in `releaseDurableOwnership` (:2715). That function calls `closeSync` on the log descriptor (:1728), and `releaseDurableAppendLock` (:1664-1685) does four file calls on the lock:

- `fstat` of the lock descriptor (:1668, via :1571)
- `stat` of the lock path (:1669, via :1560)
- unlink (:1675)
- close (:1680)

What is true: close reads no log byte and checks no state of the log file. The sentences should say that.

### F6. Three more live sentences contradict the store

I confirmed the Return's list [read]: `M05_S06:212` (M7), `:358`, `:347-349`, the D18 sentence "D18 synchronously enters `admitRuntimeEventTransactionAtExpectedPrefix(...)`" (`:1865-1867`), and `:2021`. It misses three sentences:

- **`:1863-1865`:** "It then captures the mechanical immutable in-memory event snapshot digest as `expectedPrefixDigest = store.digest()`". D18 captures no digest. `resumeProjectedRetry` compares in memory (`hog/retry_lifecycle.ts:443`) and calls `admitOwnedTraversalTransition` (`:457`), which enters `admitRuntimeEventTransactionAtDurablePrefix` (`abg/traversal_route.ts:5218`). In `traversal_route.ts`, `store.digest()` appears only inside the transaction (`:5033`, `:5072`) [read].
- **`:1867-1868`:** "There is no `await` … between the physical check and transaction entry". Under the restated `:1857-1863`, the physical check now runs inside the transaction entry, after it.
- **`:2036-2038`:** "verifies `projectedRetryResume.successorPrefix` is the held store's exact physical tail". This is the prose twin of `:2021`; the comparison is with the coordinate retained in memory.

Ruling 6 says to change nothing else and list such sentences. These three belong on the list, and in the closing round the Executive has ruled for "the five further sentences" (register at `84279d9c3`, :885).

### F7. The two-process lane case asserts the TD-82 defect

`t288-logical-prefix-digest.test.mjs:164` reads `assert.equal(second.reopen,'reopened','a process with another TMPDIR acquires the held log')` [read]. Once TD-82 is fixed, the second process is refused at reopen, and this case fails at :164 before it reaches the rule it exists to show. Ruling 8 asked for this case.

To settle it, record in TD-82's entry that its closure rewrites this case, for example with a writer that takes no lock. Or branch on the reopen result.

### F8. A released store still runs the transaction's action

The start check runs only `if (state.durableDescriptor !== null && !state.durableAppendClosed)` (:4514).

After ownership is released (the `AggregateError` branch, :2474), the plain and expected-prefix entries run the action and then fail with "ABG durable event sink is not open for append". The two durable-prefix entries refuse before the action. Head and base give the same result [run, probe A9].

Ruling 2 states the aim that both entries refuse "before anything is staged or any effect of the action happens". To settle it, refuse at (i) when the store has a log path and no open descriptor, or record why the action may run.

### Pre-existing, outside TD-80

| # | What | Evidence |
|---|---|---|
| P1 | Inside a transaction, `appendCheckedArtifactEvent` returns `sink_unavailable`, "checked artifact append produced no durable successor", while the outer transaction commits the artifact row. | [run, head and base]. Not reachable by my reading: no file that opens a runtime transaction calls `admitArtifact`, `admitProductInstall*`, `admitWorkspaceBinding` or `appendCheckedArtifactEvent`. The two Product callers (`product/materialization_definition_bindings.ts:410`, `product/release_snapshot_definition_bindings.ts:101`) call the door after an `await` [read]. |
| P2 | Recovery identifies the log path with `lstat` (:4180). The held check (`statSync`, :2161), reopen and the cold read follow symlinks. | A log path replaced by a symlink to the held file is accepted by appends, by reopen and by a cold read. Recovery refuses it with `resource_identity`, "recovery resource path/descriptor identity differs" [run, head and base]. |

## Answers

### 1. Is every write covered? [read; the mutant without (ii) run]

| Site | Writes the log | Needs the check | Has it |
|---|---|---|---|
| `appendDurablyBatch`: `writeSync` :2440, `fsyncSync` :2443, `ftruncateSync`/`fsyncSync` :2472 | yes, and it is the only place the log descriptor is written or truncated | yes | (ii) at :2436, before the `try`. The truncate sits behind the guard at :2471. Nothing checks after the write (F1). |
| Its callers: `admitRuntimeEventInternal` :4403 (bare entry; the artifact door through :4446), `admitRuntimeEventBatch` :4484 (batch, and cas through it), the transaction commit :4533 | through the above | yes | yes, all through (ii) |
| Transaction start | no | yes (ruling 2) | (i) at :4514, skipped for a released store (F8) |
| Profile upgrade `admitRootEventProfileUpgrade` (:4009) | through a transaction | yes | (i) and (ii) |
| Creation, `createNewEmptyAppendSink` | writes `""` with `wx` (:2753) before the store holds the file | no | n/a. The first append's (ii) compares against length 0. |
| Reopen (:4252-4318) | no; reads and hashes the whole log | no | n/a |
| Close (:2679-2717) | no log write; it unlinks the lock | no | n/a |
| Recovery (:4137-4250) | opens `O_RDWR\|O_APPEND` (:4178) and writes nothing; checks extents (:4203, :4219) | no | n/a |
| Other writable opens in `code/src` | `worksite_operations.ts:683` (`O_CREAT\|O_EXCL`, not a log), `worker_transport.ts:493` (stdout archive). `event_log.ts` `persistEventLog` only reads. | no | n/a |

Removing (ii) makes `t288` case 2 fail at the bare arm, and at the in-action arm when the bare arm is taken out [run].

### 2. Can the check refuse a healthy store? [run unless marked]

| Case | Head | Base |
|---|---|---|
| Log reached through a symlinked directory | accepted | accepted |
| Path spelled `/tmp/...` for `/private/tmp/...` | accepted | accepted |
| `EVENTS.JSONL` on this case-insensitive volume | accepted; reopen through that spelling works; a cold read gives 8 rows | same |
| Renamed away while held | every entry refuses with `file_identity_mismatch`, "ABG durable prefix file is unavailable: Error: ENOENT …"; the action does not run | accepted; rows go to the renamed file |
| Renamed back | accepted | accepted |
| Hard link added | accepted | accepted |
| Modification time changed (`utimes`); mode 0444 | accepted | accepted |
| Log on another volume | not checked | — |
| Store with no durable log | none can be constructed from outside the module; `appendDurablyBatch` returns before the check when `durableLogPath` is null (:2393) [read] | — |
| Store after release | no false refusal; the action runs at two entries (F8) | same |
| Action that appends through another entry of the same store, inside a transaction | bare, batch and cas stage and commit; a nested transaction refuses with "cannot nest"; the artifact door refuses while its row commits (P1) | same |

No healthy store was refused.

The reverse cases:

| Change the rule should catch | Head |
|---|---|
| File replaced by a hard link to itself (the link renamed over the path) | accepted. It is the same inode, so the held file, and accepting it is right. |
| Path replaced by a symlink to the held file | accepted by appends, reopen and a cold read; refused by recovery (P2) |
| Truncated, then zero-filled back to the same length | accepted at the append (the same-length class, ruling 4); a cold read refuses with `prefix_digest_mismatch`; reopen refuses with `durable_log_mismatch` |
| Another writer between the check and the write | accepted, with the row misplaced (F1) |
| Foreign change during a failed write | truncated by the guard (F2) |

### 3. What state does a refusal leave? [run]

- **Refusal at (i), and at (ii) outside a transaction** (both transaction entries; bare, batch, cas). The code is `prefix_length_mismatch` for the truncated file used. The action does not run, and the call leaves the file unchanged. These are unchanged: the digest, the `readAll` count (3), the held prefix (the same object) and the transaction marker (inactive).
- **Refusal at (ii) of a change made inside the action** (transaction entry). Everything is the same, except that the transaction's rollback replaces the derivation. While the file stays changed, the held `readAll` therefore reads the file and refuses with `file_identity_mismatch`, "selected body differs from its authenticated resource".
- **Rows never written.** No read returned one.
- **After the outside change is undone.** The state equals the state before the call. The next append succeeds (file 3,278 bytes), a cold read of its successor succeeds, and the refused row is absent. That is right: the store's coordinate and the file agree again, and the refused row never reached the file.
- **Stale-prefix refusal, for comparison.** TypeError, "ABG held store differs from the selected durable prefix"; the action does not run and the state is unchanged. The new refusals leave the same state, apart from the in-action renewal of the derivation.

### 4. The rollback guard [run]

| Failure inside the `try` | Guard | File after | Memory after | Next append |
|---|---|---|---|---|
| Short write (17 bytes, then a throw) | in range; truncates | = prior | unchanged | succeeds |
| Write with no progress | m5 `case 19` covers it: passes on head; fails on the `exactMin` and `alwaysRefuse` mutants | — | — | — |
| First `fsync` fails | in range; truncates | = prior | unchanged | succeeds |
| `fsync` and the rollback's `fsync` both fail | truncate runs, its `fsync` fails: `AggregateError` with both causes; ownership released | = prior | unchanged | "not open for append" |
| Throw after `fsync`, before the memory commit (P1) | truncates | = prior | unchanged | succeeds |
| Throw during the memory commit (P2 to P5) | truncates | = prior | history keeps the row (F3) | "durable append lacks its exact private admitted history" |
| Full write, then foreign bytes, then `fsync` fails (D6) | out of range; no truncate; `AggregateError` [fsync, `prefix_length_mismatch`]; released | prior + attempt + foreign | unchanged | "not open for append". Base truncates the foreign bytes away. |
| D5, D7 | in range; truncates | foreign bytes lost (D5), or the attempt's bytes left inside the committed prefix (D7) | unchanged | succeeds (F2) |

**Can a row that is present in the file be reported as not appended?** Yes, whenever the guard refuses (D6 here; B4, D5 and D7 on the sketch). In D6 the `fsync` failed, so the row is present but not known to be durable. The attempt's bytes stay in the file, and the caller gets `AggregateError`. Reopen with the last handoff refuses such a log. Recovery admits extra rows when they validate (Q9, third case). So an operator's recovery can admit a row whose append was reported as failed [the recovery behaviour run; the combination read]. The P2 to P5 cases give the opposite: a row in memory that is not in the file. No read returns that row; it refuses.

**Is the length range the right test?** No (F2). The test that refuses exactly what it should is the held identity plus length == prior + bytes written.

### 5. What each door reports [run; mapping read]

| Entry | Truncated | Extended | Replaced | Base |
|---|---|---|---|---|
| `admitRuntimeEventTransaction`, `…AtExpectedPrefix`, `…AtDurablePrefix`, `admitNonEmptyRuntimeEventTransactionAtDurablePrefix` | `prefix_length_mismatch`, action not run | `prefix_length_mismatch`, action not run | `file_identity_mismatch`, "ABG durable prefix file identity differs from coordinate", action not run | appends; the action runs |
| `admitRuntimeEvent`, `admitRuntimeEventBatch`, `compareAndAppendExpectedPrefix` | `prefix_length_mismatch` | `prefix_length_mismatch` | `file_identity_mismatch` | appends |
| `appendCheckedArtifactEvent` | `sink_unavailable`, "TypeError: ABG durable prefix is not the current durable event-log prefix" | same | `sink_unavailable`, "TypeError: ABG durable prefix file identity differs from coordinate" | appends |

The `prefix_length_mismatch` message is "ABG durable prefix is not the current durable event-log prefix". In every head case the file is unchanged by the call.

How the doors map the refusal [read]:

- `admitArtifactFromOwner` returns `disposition: "coordinate_refused"` carrying the store's refusal (`abg/environment_admission.ts:1083-1088`).
- Product materialization throws `product_materialization_artifact_refused` (`product/materialization_definition_bindings.ts:420-421`).
- Release snapshot throws "release artifact admission refused" (`product/release_snapshot_definition_bindings.ts:103`).
- The witness door returns `sink_unavailable`, "witness admission appended no partial truth: …" (`abg/witness_admission_operation.ts:1207-1213`), and its binding turns that into a definition fault (`abg/witness_definition_bindings.ts:181-183`).

None of these five retries. A later append in the same operation passes (ii) as well, and is refused while the change stays [read; run for B4's next append]. Body-sharing candidates differ (F4).

### 6. The lanes [run]

Case numbers are positions in `t288-logical-prefix-digest.test.mjs` at head. The mutants are compiled-JS edits of head:

| Mutant | Edit |
|---|---|
| `noStart` | (i) removed |
| `noWrite` | (ii) removed |
| `noRollback` | guard removed |
| `alwaysRefuse` | guard always throws |
| `exactMin` | guard upper bound set to prior |

| Case | Asserts its title | Vacuous parts | Head tests on the base build | noStart | noWrite | noRollback | alwaysRefuse | exactMin |
|---|---|---|---|---|---|---|---|---|
| 1, gated logical digest | yes | none | pass | pass | pass | pass | pass | pass |
| 2, truncated, extended or replaced refused at both entries | yes: code, message, action flag, file, inode | none | fail: "Missing expected exception: truncated at the expected-prefix entry" | fail | fail (bare arm; without it, "truncated inside the expected-prefix action") | pass | pass | pass |
| 3, same-length accepted; cold read and reopen refuse | yes | the time-restored arm cannot fail unless the first arm fails, since the check reads no time field | pass | pass | pass | pass | pass | pass |
| 4, second process | yes, but asserts TD-82 (F7) | none | fail: "Missing expected exception: the holder at the expected-prefix entry" | fail | pass | pass | pass | pass |
| 5, file changed during the write; no truncate; released | yes | none | fail: "truncated: Error: injected native write failure" | pass | pass | fail | fail (message matcher) | pass |

- `t288` does not notice the `exactMin` mutant (5/5). `m5-event-store-reopen` `case 19` does: it fails because the file keeps 17 extra bytes (895 against 878), and the lane totals 24/27. Its cases 7 and 8 fail on every compiled-JS edit ("packed payload digest differs from the manifest"). No lane covers B4, D5, D7 or body-sharing appends.
- The gate catalogue row `owner-history-logical-digest` (`T/test_env/support/evidence-gates.json:2298`) changes as follows. Status goes from `failing_with_input_present` to `runs_with_root`, with `conversion: "done"`, `variables: []` and `formerVariables: ["ABI5_OWNER_HISTORY"]`. The title follows the case. The pinned input (sha256 `b22178799d600fbde510…`, 6,341,605 bytes) matches the file [run: `shasum`, `stat`]. `t292-td60b-evidence-gate-catalogue` passes 3/3.
- Also at head: `t288` 5/5, `m5-event-store-reopen` 27/27, `m5-retry-lifecycle-authority` 8/8. The comment at `m5-retry-lifecycle-authority.test.mjs:300` cites `M05_S06:2006-2007`, where the quoted text is [read].

### 7. Cost [run]

**Counts.** I patched counters into the TypeScript of a copy of head, rebuilt it, and ran the `t287-default-library` case "default-library Run interrupted at the durable entered Testing cursor resumes once…" (pass, 1/1):

| Process | (i) | (ii), one per batch | Rows | Rollback guard | Currentness owner | `heldRuntimePrefixState` |
|---|---|---|---|---|---|---|
| Interrupted host (killed) | 119 | 119 | 312 | 0 | 0 | 169 |
| Resuming CLI | 125 | 125 | 312 | 0 | 0 | 176 |
| Test setup, not the Run | 0 | 3 | 3 | 0 | 0 | 14 |
| Six cold reads | 0 | 0 | 0 | 0 | 0 | 2 each |

- The Run makes 488 checks (244 at (i) and 244 at (ii)) for 624 rows; with the setup's 3 rows that is 627, matching the case's `eventsFinal`.
- Batch sizes in rows: host 50×1, 20×2, 11×3, 14×4, 11×5, 13×6; CLI 56×1, 16×2, 15×3, 21×4, 7×5, 10×6.
- This matches the Return's table. My `heldRuntimePrefixState` counts are exact where the Return gives "at least 169".
- A transaction append makes 2 checks, whatever the batch size. A bare admission makes 1, and a failed append adds 1 at the guard. Every transaction in this Run appended, since (i) equals the batch count in each process.

**Time.** The host's load average was 15-18 from other lanes.

- **One check** (`statSync` + `fstatSync`), hot loop, 3 rounds of 20,000 calls: median 1.39, 1.26, 1.26 µs; p90 1.71, 1.50, 1.57 µs.
- **CPU part of an append** (`fsync` replaced by a no-op), head and base paired in one process, 3 × 1,000 pairs: the median pair difference is +5.88, +5.17 and +7.33 µs, on medians of 77.6-93.7 µs. Head was slower in 875, 914 and 866 pairs.
- **With `fsync`**, this host cannot resolve the difference. Same-build controls give median pair differences of +347 µs (head against head) and +157 µs (base against base). Head against base gives +413, −99 and +21 µs, and with the sides swapped head is 406 µs slower; 300 pairs each, medians 4.3-5.1 ms. An earlier block-timed run gave 5.045 ms against 4.510 ms medians, with the p90 the other way round (6.619 against 7.269); that is the same noise.
- **Raw syscalls** (stat + fstat before write + fsync, against write + fsync alone; 1,000 pairs each): control +10.8 µs, check arms −15.2 and +41.3 µs, with the check arm slower in 497-514 of 1,000 pairs. The two calls add nothing measurable to write + fsync.

So the added cost is about 6 µs per append, 0.12-0.16% of a durable append of 4.4-5.1 ms. Ruling 10's 1% bound is not reached.

**Hotter paths [read].**

- (i) runs once per transaction. `admitRuntimeThreshold` opens two transactions per supervision wakeup (`abg/runtime_liveness.ts:440-480`), and wakeups are scheduled at deadlines (`abg/actor_process.ts:1295-1320`).
- `heldRuntimePrefixState`, 345 calls per Run, carries no check.
- The currentness owner ran 0 times in this Run. Its callers are `artifact_truth.ts:901` and `:914`, and `qualification_proof.ts:860`.

No check sits on a path that runs far more often than an append.

### 8. The design text [read; claims run where marked]

| Restated sentence (`M05_S06` at head) | Holds |
|---|---|
| :357, create cell: successor from the retained running digest; no byte read back | yes (:2443-2456) |
| :357, refusal cell | yes, except "an append reads no byte" (F4) |
| :612-617: reopen hashes all named bytes; a held store checks identity and length and hashes no byte | yes, for the check |
| :617-618: close compares coordinates in memory / "makes no file call" | first part yes; second part no (F5) |
| :629-633: the check sits before the `try`; nothing is read back after the write | yes |
| :633-635: "follows the in-memory rollback" | no (F3) |
| :635-639: the guard range; otherwise release and report both causes | yes, as code; the range lets D5 and D7 through (F2) |
| :727-732, close | yes, except "makes no file call" (F5) |
| :751-757, artifact door: `prefix_mismatch` in memory; `sink_unavailable` with the currentness owner's message | yes [run] |
| :1857-1863, D18: in-memory comparison, then (i) inside the transaction | yes (`hog/retry_lifecycle.ts:443`, `:457`; `abg/traversal_route.ts:5218`) |
| Constitution :872-879 (`T/design/ABI5_REALIZATION_CONSTITUTION.md`): the check, its codes, no byte or time field; same-length refused at reopen and at a cold read | yes [run] |

The Return's list of unchanged contradicting sentences is right as far as it goes, and three sentences are missing from it (F6).

### 9. Reopen and recovery [run; head and base identical]

| Log | `reopenEventStore` | `recoverInterruptedEventStore` |
|---|---|---|
| Healthy | 3 rows, `prefixLength` 2,451; an append afterwards succeeds | — |
| Torn tail | `durable_log_mismatch`, "durable event sink differs from the selected exact prefix" | `refused_no_recovery`, `history_validation`, "incomplete trailing row" |
| Longer than its handoff | old handoff: `durable_log_mismatch` | `recovered`, 5 rows; reopen with the recovered handoff gives 5 rows and accepts an append |

The code [read]:

- The diff does not touch `reopenEventStore` or `recoverInterruptedEventStore`.
- `assertDurableRuntimePrefixCurrent` (:2143-2149) gives the same codes, messages and order as base (:2143-2159) for every coordinate that validates.
- Its one difference is that `fileURLToPath` now runs outside the `try`. That call cannot throw for a coordinate `validateDurablePrefixCoordinate` accepts, because the validator itself checks the round-trip (:2024-2031).

## Where the Return differs from what I found

- **Residuals 1 and 2.** Both remedies are wrong: neither needs a byte read or TD-82 (F1, F2). Residual 1 also names one case where there are two (D5, D7). The Executive's ruling at `84279d9c3` carries that premise forward.
- **The rollback, :124-126.** "Can only be this attempt's partial write" is false (F2, D5 and D7).
- **Restated sentences.** It does not flag F3, F4 or F5, and its list of unchanged contradicting sentences misses three (F6).
- **"No sentence says a changed row is refused at its next read."** This follows the package brief's ruling 6. The register's ruling (:889) also names "an uncached held read", which the rows omit (F4).
- **Confirmed [run]:**
  - The door table, for plain candidates.
  - The lane table and the result of the head tests on the base build: 2 pass, 3 fail, with the same messages.
  - The truncating branch being covered by m5 `case 19`.
  - The per-Run counts and the per-check time.
  - The CPU part of an append: +5.2-7.3 µs here, against its +4.5-6.5 µs.

## What I did not check

- A log on another volume; my experiments stayed in the scratch directory.
- A crash or power loss between the write and `fsync`, and whether the rollback's truncate is durable after a failed `fsync`.
- A change during a Run door's call, with a scripted or live actor. The Return lists this too.
- The witness door, the with-resource transport, and the install and bind Public doors, end to end. I read their mapping only.
- The fix sketch beyond `t288-logical-prefix-digest` and `m5-event-store-reopen`: not on the default-library Run, not on the suite.
- The rest of the suite, the replay comparison, the declarations and the lints. These are the Return's claims, not rerun.
- A mutant that hashes bytes or reads a time field at the append, which would show what case 3 catches.
- Whether every caller of the artifact, materialization, release and witness doors maps the refusal without retrying, beyond the five sites in Q5.
- TD-82 itself.

## Repository state

- `git -C /Users/jim/src/apps/abiogenesis status --porcelain` shows no tracked change [run].
- Two untracked files are newer than the start of this review (23:40). One is this report. The other is `.ai-workspace/work/T292_CONSOLIDATION_01/TD-67_TRACE.md`, which is not mine.
- My lanes pointed `ABI5_EVIDENCE_ROOT` at the repository's `.ai-workspace` and wrote nothing there that I can find.
- `main` moved to `7102112b2` during the review. The subject branch is still at `6a9c736f8`. I read the Executive's TD-80 record on `main` (`84279d9c3`) and address it under F2 and F6.

## Scratch

`/private/tmp/abg-td80review-work/` is 1.6 GB: twelve tree copies of 135 MB each (`head`, `base`, `basebuild-headtests`, `count-head`, `fix-sketch`, `probe-head`, `probe-base`, and the five `mut-*`), plus probes, lane TAP files, timing stores and counter logs. `/private/tmp/abg-td80review-tmp/` is 2.8 MB. Nothing was deleted. Scripts: `probes/probe-store.mjs`, `probes/probe-d7.mjs`, `probes/time-check.mjs`, `probes/time-paired.mjs`, `probes/time-raw.mjs`. Outputs: `probes/out-head.json`, `out-base.json`, `out-sketch.json`, `d7-*.json`, `lanes/*.tap`, `counts/*.log`.
