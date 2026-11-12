# TD-80 Return: a held store checks its log file before it appends

**Status:** done. A held event store refuses a transaction and a write when the
file at its log path or behind its descriptor is not the regular file it holds
(device and inode) at the length it retains. The check reads no byte and no time
field. Every listed lane passes on the final build, no lane goes from pass to
fail, the replay and artifact-truth comparisons are identical, the base `.d.ts`
files are byte-identical, and an append costs about 5 µs more, 0.1% of a
durable append. Two things need a ruling: the live design sentences listed under
"Other live design that contradicts the store", and the residual on the
rollback range.

Base: local `main` at `d2ed7fd58`, built. Final: branch
`claude/td80-append-currentness`, built from the committed source. Terms: a
*held store* is an `AbgEventStore` that owns its log through an open descriptor
and a lock; its *retained length* is the byte length it records as written
(`durableByteLength`); a *change behind the store* is a change to the log file
made by anything other than the store while the store holds it.

## The helper and its call sites

All in `build_tenants/abiogenesis/typescript/code/src/abg/event_store.ts` (T is
`build_tenants/abiogenesis/typescript`):

| Site | Line | What it does |
|---|---|---|
| `assertDurableFileCurrent(path, descriptor, identity, minLength, maxLength)` | :2155 | The one currentness rule for a log file. `statSync` of the path and `fstatSync` of the descriptor when one is given; each must be a regular file with the given device and inode, else `DurablePrefixReadError("file_identity_mismatch", "ABG durable prefix file identity differs from coordinate")`; each length must lie from `minLength` to `maxLength`, else `DurablePrefixReadError("prefix_length_mismatch", "ABG durable prefix is not the current durable event-log prefix")`. A failed stat gives `file_identity_mismatch` "ABG durable prefix file is unavailable: …". These are the codes and messages `assertDurableRuntimePrefixCurrent` already gave. |
| `assertDurableRuntimePrefixCurrent` | :2143, call at :2148 | The existing currentness owner now calls the helper with no descriptor and `minLength = maxLength = prefixLength`. Its codes, messages and order are unchanged. |
| `assertHeldDurableLogCurrent(state, descriptor)` | :2183 | The held-store form: the retained path, the retained device and inode, the retained length. |
| (i) transaction start, `runRuntimeEventTransaction` | :4514 | After the nesting check and before the prior events are captured, when the store has an open log (`durableDescriptor !== null && !durableAppendClosed`). Every transaction entry runs through here: `admitRuntimeEventTransaction`, `admitRuntimeEventTransactionAtExpectedPrefix`, `admitRuntimeEventTransactionAtDurablePrefix`, `admitNonEmptyRuntimeEventTransactionAtDurablePrefix`, `admitRootEventProfileUpgrade`. |
| (ii) before the write, `appendDurablyBatch` | :2436 | After `ownedDurableDescriptor` (the store-open check) and the row encoding, before the `try`. Every durable write runs through here: the transaction commit (:4533), an admission outside a transaction (`admitRuntimeEventInternal`, :4403, which serves `admitRuntimeEvent`, `admitNativeRuntimeLivenessEvent` and `appendCheckedArtifactEvent`) and `admitRuntimeEventBatch` (:4484). |
| rollback guard, `appendDurablyBatch` catch | :2471 | `assertDurableFileCurrent(path, descriptor, identity, priorByteLength, nextByteLength)` before `ftruncateSync`. See "The rollback". |

`heldRuntimePrefixState` (:2345) is unchanged. The ruling adds the check there
only if the checked-artifact door would otherwise refuse with a less truthful
existing code. It does not: `appendCheckedArtifactEvent` returns
`sink_unavailable` with the currentness owner's message, the code this door
already gives when its sink cannot take the append (the legacy-profile refusal
of TD-32 takes the same branch). In one default-library Run
`heldRuntimePrefixState` is called 345 times (169 in the interrupted host
process, 176 in the resuming CLI process; the test process adds 14 in setup and
each of six cold CLI reads adds 2), against 244 appended batches.

## The door table

The probe is `/private/tmp/abg-td80w-work/probe/door-table.mjs`; its outputs are
`probe/out/doors-base.json` and `probe/out/doors-final.json`. Each store row
starts from a fresh held store with three admitted rows (2,451 bytes). A
*truncated* file has its last row cut off (1,630 bytes); an *extended* file has
a foreign row `{"foreign":true}` appended (2,468 bytes); a *replaced* file is a
copy renamed over the path, so the path names a new inode and the store's
descriptor still names the old one. A hard link to the held inode shows what is
written to the old file.

### Store entries

Base: every entry accepts, on all three changes. What follows on base:

| Change | Where the new row lands | Reopen with the store's close handoff | Whole-log read of the path |
|---|---|---|---|
| truncated | at byte 1,630; the store records byte 2,451 | `durable_log_mismatch` "durable event sink differs from the selected exact prefix" | `admission_ordinal_invalid` |
| extended | at byte 2,468, after the foreign row; the store records 2,451 | `durable_log_mismatch` | `event_envelope_invalid` |
| replaced | in the old inode only; the file at the path keeps three rows | `sink_unavailable` "ABG durable event sink identity differs from authority" | reads 3 rows: the new row is not in the path's file |

Final:

| Entry | truncated | extended | replaced | Action | File |
|---|---|---|---|---|---|
| `admitRuntimeEventTransaction` | throws `prefix_length_mismatch` | throws `prefix_length_mismatch` | throws `file_identity_mismatch` | not run | unchanged |
| `admitRuntimeEventTransactionAtExpectedPrefix` | same | same | same | not run | unchanged |
| `admitRuntimeEventTransactionAtDurablePrefix` | same | same | same | not run | unchanged |
| `admitNonEmptyRuntimeEventTransactionAtDurablePrefix` | same | same | same | not run | unchanged |
| `admitRuntimeEvent` (outside a transaction) | throws `prefix_length_mismatch` at (ii) | same | throws `file_identity_mismatch` at (ii) | no action; the candidate is built | unchanged |
| `admitRuntimeEventBatch` | same | same | same | no action; the factory runs | unchanged |
| `compareAndAppendExpectedPrefix` | same | same | same | no action; the factory runs | unchanged |
| `appendCheckedArtifactEvent` | returns `sink_unavailable` "TypeError: ABG durable prefix is not the current durable event-log prefix" | same | returns `sink_unavailable` "TypeError: ABG durable prefix file identity differs from coordinate" | no action | unchanged |

`admitRootEventProfileUpgrade` enters `runRuntimeEventTransaction`, so it
refuses at (i); its Public door is the L row below.
`admitNativeRuntimeLivenessEvent` writes through `admitRuntimeEventInternal`, so
it refuses at (ii); it has no Public door without a native actor, and I show it
by reading only.

### Public doors

The witness admission door (`abg.operation.witness.admit`, member `reprice`)
runs through `runExactDefinition` over the witness mechanics fixture
(`test_env/support/witness-reprice-mechanics.mjs`), with no provider. *W* is a
store on the current event profile (the admission enters
`admitRuntimeEventTransactionAtDurablePrefix`); *L* is a store on the legacy
profile, where the admission is the profile reprice (`admitRootEventProfileUpgrade`).
A change *before* the call is made after the request is built and before
`run`; a change *during* the call is made by the fixture's `faultNative` hook,
after the door has reopened the store and before the native admission owner
runs.

| Door | Change | Base | Final |
|---|---|---|---|
| W and L | any change, before the call | exit 70 `resource_relation_mismatch` `{acquisition_refused, "durable_log_mismatch: …"}` (truncated, extended) or `{acquisition_refused, "sink_unavailable: … identity differs from authority"}` (replaced); file unchanged | same |
| W and L | truncated, during | exit 70 `sink_unavailable` "witness admission appended no partial truth: TypeError: selected body differs from its authenticated resource" (the owner's body read refuses before its transaction); file unchanged | same |
| W and L | replaced, during | same as truncated | same |
| W | extended, during | the admission appends two rows after the foreign row (889 to 6,496 bytes), then exit 70 `witness_reprice_execution_failure` "selected body bytes differ from their authenticated location" | exit 70 `sink_unavailable` "witness admission appended no partial truth: TypeError: ABG durable prefix is not the current durable event-log prefix"; file unchanged at 889 bytes |
| L | extended, during | the reprice appends (793 to 6,410 bytes), then exit 70 `witness_reprice_execution_failure` | exit 70 `sink_unavailable`, same message; file unchanged at 793 bytes |
| with-resource transport (`assertAcquiredAbgEventResourceSelectionCurrent`, `acquireAbgEventResource` with a selection) | any change after selection | `acquisition_refused` "acquired ABG event source identity or extent differs from its selected prefix" | same |

The Public artifact doors (`abg.operation.product.install`,
`abg.operation.workspace.bind` and the other `appendCheckedArtifactEvent`
members) and the Run doors (start, continue) acquire the store through the same
reopen as the witness door, so a change before the call meets the same reopen
refusal; I did not run them with a change. A change during one of their calls
needs a seam inside the operation or a native actor; I did not build one. Their
appends go through `appendCheckedArtifactEvent` and the transaction entries,
whose rows are above.

## The rollback

Rule (`appendDurablyBatch`, :2463-2476): after a failure inside the `try`, the
store truncates only if the file at the path and behind the descriptor is still
the held regular file and its length lies from the prior length to the prior
length plus this attempt's bytes. Then the bytes past the prior length can only
be this attempt's partial write. Otherwise it does not truncate: the guard's
`DurablePrefixReadError` enters the existing rollback-failure branch, which
releases ownership and throws `AggregateError([error, rollbackError], "ABG
durable event append failed and its owned prefix could not be restored")`. The
bytes stay on disk for reopen to refuse.

How it is shown without a seam in the store: the lane replaces `fs.writeSync`
and calls `syncBuiltinESMExports()`, so the store's own `node:fs` binding takes
the replacement for one call, as the owned-append I/O case of
`m5-event-store-reopen` already does. The replacement restores the original,
changes the file (truncates it, appends 4 KiB beyond the attempt, or renames a
copy over it), and throws `injected native write failure`. The lane uses the
expected-prefix entry, which rethrows the append's own error; the durable-prefix
entry wraps it once more after release. It asserts the `AggregateError`
message, `errors[0]` the injected failure, `errors[1]` the expected currentness
code, the file not truncated, and `/not open/` on the next admission and on
close. The truncating branch (file within the range) stays covered by the
existing `m5-event-store-reopen` case "owned append I/O failures…", which passes
on final.

## Restated design sentences

`T/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`
(status line unchanged; line numbers are the base file's):

| Line | Old | New |
|---|---|---|
| :357, `DurablePrefixCoordinate`, create cell | "successor constructed from verified committed bytes inside the durable append rollback boundary" | "successor constructed inside the durable append rollback boundary after write and `fsync`, from the retained running digest extended by the written rows (`appendDurablyBatch` in `abg/event_store.ts`); no byte is read back" |
| :357, refusal cell | "closed-shape, self-digest, file-URL, identity, contract, length, or byte mismatch refuses before append/read result" | "closed-shape, self-digest, file-URL, identity, contract, length, or byte mismatch refuses before a read result; before an append a coordinate unequal to the held store's retained coordinate refuses, and a log file whose device, inode or length differs from what the store holds refuses before the transaction's action and before the write (`assertHeldDurableLogCurrent` in `abg/event_store.ts`); an append reads no byte, so a same-length change in place refuses at reopen and at a cold read of a copied coordinate instead" |
| :612-614 | "a held-store append/close check or authority-only reopen requires the same descriptor/path device/inode, the selected event contract, and exact-tail equality `fileSize === prefixLength`, then hashes all named bytes." | "an authority-only reopen requires the same descriptor/path device/inode, the selected event contract, and exact-tail equality `fileSize === prefixLength`, then hashes all named bytes. A held store requires, before a transaction's action and before each write, the same descriptor/path device/inode and a file length equal to the length it retains, and hashes no byte (`assertHeldDurableLogCurrent` in `abg/event_store.ts`); its close compares coordinates in memory and makes no file call." |
| :625-627 | "`appendDurablyBatch` constructs and validates a non-empty commit's successor only after write, `fsync`, length check, and byte check, but still inside the same rollback-protected `try`. A successor construction or validation failure therefore follows the existing truncate, `fsync`, in-memory rollback path and cannot leave durable appended bytes while returning refusal or no coordinate." | "`appendDurablyBatch` (`abg/event_store.ts`) checks the held log file's device, inode and length before its rollback-protected `try`, so that refusal writes nothing and never reaches the truncate. It constructs and validates a non-empty commit's successor after write and `fsync`, inside that `try`; nothing is read back after the write. A successor construction or validation failure therefore follows the in-memory rollback and the truncate and `fsync` path, which truncates only while the file at the path and behind the descriptor is the held file and its length lies from the prior length to the prior length plus the attempt's bytes. Otherwise it does not truncate: it releases ownership and reports both causes, and the bytes past the prior length stay for reopen to refuse." |
| :718-720, close | "it verifies descriptor/path identity, reads exactly the held durable length, verifies the bytes and event contract, and derives both values from that single snapshot." | "it compares the selected coordinate with the store's retained coordinate in memory and derives both values from the retained path, device, inode, length, digest and event contract (`closeHeldEventStoreAtDurablePrefix` in `abg/event_store.ts`); it makes no file call and reads no byte, and a later reopen validates the persisted bytes." |
| :739-741, checked artifact append | "Immediately before append, Event Store verifies that the held descriptor, device/inode, durable byte length/digest, and event-contract digest equal expectedPredecessor. A mismatch returns the existing typed prefix refusal and appends nothing." | "Before append, Event Store compares expectedPredecessor with the held store's retained coordinate in memory; a mismatch returns `prefix_mismatch` and appends nothing. Before the write it checks that the log file at the path and behind the held descriptor has the held device and inode and the retained length (`assertHeldDurableLogCurrent` in `abg/event_store.ts`); a file that differs returns `sink_unavailable` with the currentness owner's message, and appends nothing. No named-byte digest is computed." |
| :1841-1844, D18 | "D18 validates the supplied predecessor against the held store in exact-tail mode: descriptor/path identity and contract match, `fileSize === predecessorPrefix.prefixLength`, and the complete named-byte digest matches." | "D18 compares the supplied predecessor with the held store's retained coordinate in memory (`assertHeldEventStoreAtDurablePrefix`, called from `resumeProjectedRetry` in `hog/retry_lifecycle.ts`), and the transaction it enters checks, before its action, that the log file at the path and behind the held descriptor has the held device and inode and the retained length (`assertHeldDurableLogCurrent` in `abg/event_store.ts`); no named-byte digest is computed." |

`T/design/ABI5_REALIZATION_CONSTITUTION.md`, the held-store paragraph (:872),
two sentences added after "Outside edits during that ownership are
unsupported.":

> Before a transaction's action and before each write, the owner checks that
> the file at its path and behind its descriptor is the regular file it holds,
> by device and inode, at the length it retains, and otherwise refuses with the
> currentness codes `file_identity_mismatch` or `prefix_length_mismatch` and
> writes nothing; the check reads no byte and no time field
> (`assertHeldDurableLogCurrent` in `abg/event_store.ts`). A same-length change
> in place passes that check and is refused at reopen and at a cold read of a
> copied coordinate.

No sentence says a changed row is refused at its next read.

### Other live design that contradicts the store (not changed)

- M05_S06 :212, row M7: "close derives both values from one verified byte
  snapshot under the held descriptor and lock". Close makes no file call.
- M05_S06 :358, row `EventStoreReopenAuthority`: "`projectReopenAuthorityAndClose()`
  derives it and the coordinate from one verified byte snapshot under the held
  descriptor and lock". Same.
- M05_S06 :347-349: the store's process-local state "may retain only
  descriptor, lock, byte-count, and next-envelope mechanics". The store retains
  the path, identity, running digest, row locations and the admitted history.
- M05_S06, the sentence after the restated D18 sentence: "D18 synchronously
  enters `admitRuntimeEventTransactionAtExpectedPrefix(store,
  expectedPrefixDigest, action)`". The code enters
  `admitRuntimeEventTransactionAtDurablePrefix` through
  `admitOwnedTraversalTransition` (`abg/traversal_route.ts:5218`).
- M05_S06 :2021 (final numbering), diagnostic table: "`successorPrefix` is not
  the held store's exact physical tail". The comparison is with the retained
  coordinate in memory, not the file's tail.
- `T/design/T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md:143-146`: "the
  event-resource lock namespace follows `TMPDIR`, so the caller scopes … `TMPDIR`".
  True of the code; it is the TD-82 defect stated as a rule.

## Lane cases

All in `T/test_env/tests/t288-logical-prefix-digest.test.mjs`.

| Case | Ruling | What it shows | Base build | Final |
|---|---|---|---|---|
| store logical digest preserves staged guards, unrelated-run staleness and rollback | 7 | the gated case keeps its logical arms; its two bare `assert.throws` calls (the physical arms) are removed; it resolves its input through `evidenceGate` | passes with the root | passes with the root; skips without it |
| a truncated, extended or replaced held log is refused at both transaction entries before the action, and the refused call writes nothing | 1, 7 | per change and entry: the code and exact message, the action flag false, the path's file and the held inode unchanged, digest and held prefix unchanged; an admission outside a transaction refused the same way; a change made inside the action refused at (ii) with nothing written and the staged row rolled back; after the file is put back, the same store appends and a cold read gives four rows | fails: "Missing expected exception: truncated at the expected-prefix entry" | passes |
| a same-length change in place is accepted at both entries and refused at a cold read of a copied successor and at reopen; the original byte written back makes the log read again | 4 | with and without the modification time restored: both entries run their action and return a successor; the new rows land where recorded; a cold read of the copied successor refuses `prefix_digest_mismatch`; reopen with the close handoff refuses `durable_log_mismatch` ("bytes differ from coordinate"); a positional write of the original byte, then the cold read gives five rows and reopen succeeds | passes (the contract is unchanged) | passes |
| after a second process appends to a held log, the holder's next append is refused at both entries and the log keeps one row per ordinal | 8 | a child under another `TMPDIR` reopens the held log and appends ordinal 4; the holder is refused with `prefix_length_mismatch` at both entries, action not run, file unchanged; ordinals on disk `[1,2,3,4]`; the holder's handoff no longer reopens; the child's does | fails: "Missing expected exception: the holder at the expected-prefix entry" (base writes a second ordinal 4) | passes |
| a failed append whose file changed during the write is not truncated; ownership is released with both causes | 5 | see "The rollback" | fails: "truncated: Error: injected native write failure" (base truncates and rethrows the single error) | passes |

The four new cases run in every suite run. The final file on the base build
gives 5 tests, 2 pass, 3 fail
(`/private/tmp/abg-td80w-work/lanes/red-on-base/t288-final-file-on-base-build.tap`).
The original gated case on base with its recorded input fails "Missing expected
exception." (`lanes/red-on-base/t288-original-with-history.tap`).

Gate catalogue (`T/test_env/support/evidence-gates.json`), row
`owner-history-logical-digest`: status `failing_with_input_present` becomes
`runs_with_root`, with `conversion: "done"`, `variables: []` and
`formerVariables: ["ABI5_OWNER_HISTORY"]`, as for the other converted class C
rows; the title follows the case; `suiteSkips` stays 1; `observed` and `note`
are restated. Its lane `t292-td60b-evidence-gate-catalogue` passes unchanged
(3/3).

Also changed: the comment in `T/test_env/tests/m5-retry-lifecycle-authority.test.mjs:300`
cites the M05_S06 sentence it quotes at `:2006-2007`; it cited `:1983-1985`,
already four lines off on base and 23 off after this change.

## Ruling 9: TD-82, by reading

**Processes the Product starts, and their `TMPDIR`.**

- The actor process (`abg/worker_transport.ts` `runProcess`, spawn at :504).
  Its environment is the parent's (`Object.freeze({...process.env})` in
  `abg/actor_process.ts`) passed through `sanitizeWorkerTransportEnvironment`,
  which removes only `CLAUDE_CODE_*` names. Same `TMPDIR`. It runs the native
  agent and opens no store.
- npm (`product/install_product.ts:55`, `execFile`, inherited environment) and
  git (`implementation/release_publication.ts:27`, inherited environment). Same
  `TMPDIR`; no store.
- The worksite command helper (`implementation/worksite_command_helper.ts`),
  which the actor starts as a tool command (`helperPlanForExecutable`,
  `product/worksite_command_execution.ts:756`). Its environment is whatever
  the actor's tool runner gives, so its `TMPDIR` can differ from the parent's.
  Its import closure includes `abg/event_store.js` and
  `abg/definition_event_resource.js`, but it calls none of
  `createNewEmptyAppendSink`, `reopenEventStore`, `acquireAbgEventResource` or
  `recoverInterruptedEventStore`. The counters of the default-library Run
  confirm it: the helper process loads the store module and makes no check and
  no append.
- Worksite commands and HTTP-probe children, started by the helper with the
  declared command environment: `TMPDIR` is the declared value, or else the
  ambient value captured once at the operation boundary
  (`selectedWorksiteCommandAmbientEnvironment`, `abg/actor_process.ts:717`;
  `environmentEntries`, `product/worksite_command_execution.ts:835-860`).
  These are consumer commands, not Product code. One of them could run the
  Product CLI (`public/cli.ts`), which opens a store per invocation under its
  own `TMPDIR`; that is the one route by which Product code would hold a log
  under another `TMPDIR`. The Product itself starts no child that opens a store.

**Readers of the lock namespace.** `durableLockPath` (`abg/event_store.ts:1597`,
`join(tmpdir(), "abiogenesis-event-store-locks-v5", "<dev>-<ino>.lock")`), read
only by `acquireDurableAppendLock` (:1605-1608); the recovery path
`recoverInterruptedEventStore`, which requires the abandoned lock's path to equal
that tmpdir path (:4167); the recovery design
(`T/design/T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md:43`, ":54 …
Require the existing identity-scoped lock namespace"); the call construction
design (`T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md:143-146`). Test readers
that build the lock path themselves: `test_env/uat/harness.test.mjs`,
`t287-interrupted-event-resource-recovery`, `t287-default-library` (:2053),
`m5-event-store-reopen`, `t287-selected-action`,
`test_env/support/installed-qualification-conservation.mjs` and
`test_env/support/t287-s03-automatic.mjs`.

**What a lock file beside the log would meet.** The log path is chosen by the
caller; the test root environment puts it at `scratch/runtime/events.jsonl`. A
lock in the log's directory meets:

- the empty-directory checks: `product/workspace_operations.ts:519` (a clean
  target must be empty) and `product/install_product.ts:368` (an empty install
  target);
- the directory-member checks: `product/worksite_operations.ts:1148-1157` (a
  directory's member list, refused `stale_observation` if it changes during
  observation) and `abg/semantic_job.ts:220` (directory members equal the
  recorded list);
- the tree walks, if the log's directory lies inside a walked root:
  `walkTree` in `implementation/worksite_command_helper.ts:398` and
  `implementation/worksite_file_replace.ts:188`, and `walkTreeSync` in
  `implementation/worksite_command_execution.ts:302` (a root digest). A lock
  there enters observation rows and digests, and its appearance and removal
  change them;
- the recovery design's sentence on the identity-scoped lock namespace and the
  path check at `abg/event_store.ts:4167`, which both name the tmpdir
  namespace.

## Cost

On copies of the live rc.12 log (14,506,732 bytes, 1,695 rows;
`/private/tmp/abg-td80-work/rc12/live-rc12.source.jsonl`). Scripts:
`/private/tmp/abg-td80w-work/cost/cost.mjs` and `cost-paired.mjs`.

**Helper calls.** A transaction append makes two (one at (i), one at (ii)); an
admission outside a transaction makes one; a failed append makes one more at the
rollback guard. Counted with temporary counters in one default-library Run
(`t287-default-library`, the case "default-library Run interrupted at the
durable entered Testing cursor resumes once…", counters reverted and rebuilt
before the final build):

| Process | (i) | (ii) | Batches | Rows | `heldRuntimePrefixState` |
|---|---|---|---|---|---|
| interrupted host (`host.mjs`) | 119 | 119 | 119 | 312 | 169 |
| resuming CLI | 125 | 125 | 125 | 312 | 176 |
| the Run | 244 | 244 | 244 | 624 | 345 |
| test process setup (not the Run) | 0 | 3 | 3 | 3 | 14 |
| six cold CLI reads | 0 | 0 | 0 | 0 | 2 each |
| worksite command helper | 0 | 0 | 0 | 0 | 0 |

The row counts match the case's own output (`eventsInterrupted` 315 = 3 + 312,
`eventsFinal` 627). The Run makes 488 helper calls.

**Time.**

- One check (stat of the path and fstat of the descriptor): median 1.3-1.7 µs
  (2,000 calls in each of 20 processes).
- Paired, in one process, fsync replaced by a no-op so the CPU part is timed
  alone (3 runs x 2,000 pairs per entry, order randomized per pair): final adds
  4.5-6.5 µs per append (median pair difference) to a CPU part of 66-74 µs;
  final is slower in 91-96% of pairs.
- With fsync, as the store runs: a median append takes 4.16-5.17 ms, so the
  added 4.5-6.5 µs is 0.09-0.16%.
- Wall clock with fsync, 10 base and 10 final processes interleaved, 60 appends
  per entry each: expected-prefix entry 4.474 ms base, 4.532 ms final (+1.28%);
  durable-prefix entry 4.451 ms base, 4.493 ms final (+0.94%). The two halves of
  the base runs differ by 15.0% and 6.5%, so these differences lie inside the
  noise. Paired in one process with fsync (3 runs x 300 pairs per entry): the
  median pair difference is -0.84% to +1.18%, and final is slower in 473 of 900
  pairs (expected-prefix) and 445 of 900 (durable-prefix).

The added time is about 5 µs per append, 0.1% of a durable append. Wall-clock
timing on this machine cannot resolve 1%; the direct measure lies an order of
magnitude under it. The ruling 10 bound is not passed.

## Lanes before and after

One file at a time, the brief's command, `TMPDIR=/private/tmp/abg-td80w-tmp`.
Base rows are the base build with the base test files; the base
`t288-logical-prefix-digest` is the base file, whose one case is gated by
`ABI5_OWNER_HISTORY` and skips. Outputs:
`/private/tmp/abg-td80w-work/lanes/{base,final}/`.

| Lane | Base: tests / pass / fail / skip | Final: tests / pass / fail / skip |
|---|---|---|---|
| `t288-logical-prefix-digest` | 1 / 0 / 0 / 1 | 5 / 5 / 0 / 0 |
| `t288-initial-cursor-entry` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-authenticated-owner-values` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-held-owner-fold-reuse` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-held-operation-bodies` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t292-td60b-evidence-gate-catalogue` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `m5-event-store-reopen` | 27 / 27 / 0 / 0 | 27 / 27 / 0 / 0 |
| `r5-invocation-admission` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-conformance-owner-reuse` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `m5-event-calculus-runtime` | 18 / 18 / 0 / 0 | 18 / 18 / 0 / 0 |
| `m5-retry-lifecycle-authority` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `r1-packed-artifact` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r3-workspace-binding` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `steel-basic-cli-public` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-registered-graph-selection` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-recursive-registered-selection` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-default-library` | 35 / 34 / 0 / 1 | 35 / 34 / 0 / 1 |
| `r10-child-proof` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `t287-calculus-fold` | 25 / 25 / 0 / 0 | 25 / 25 / 0 / 0 |
| `t287-continuation-causation` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-cross-cut-public-read` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 |
| `t287-event-body-encoding` | 25 / 25 / 0 / 0 | 25 / 25 / 0 / 0 |
| `t287-held-prefix` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 |
| `t287-historical-source-resource` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t287-interrupted-event-resource-recovery` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-management-stream-drain` | 7 / 4 / 0 / 3 | 7 / 4 / 0 / 3 |
| `t287-native-event-time` | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 |
| `t287-native-owner-reuse` | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 |
| `t287-public-terminal-projection` | 3 / 0 / 0 / 3 | 3 / 0 / 0 / 3 |
| `t287-readable-stops-foldback` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 |
| `t287-recursive-failure-foldback` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-result-evidence-lineage-projection` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-route-reconstruction` | 12 / 11 / 0 / 1 | 12 / 11 / 0 / 1 |
| `t287-selected-action` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-undispatched-diagnostic` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t289-install-event-bodies` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t292-td32-legacy-store-door` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-st1-installed-cross-owner-hello` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-worksite-command-execution` | 13 / 13 / 0 / 0 | 13 / 13 / 0 / 0 |
| `r10-projection-contracts` | 11 / 11 / 0 / 0 | 11 / 11 / 0 / 0 |
| `witness-run-stopped-definition-binding` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `witness-reprice-definition-binding` | 15 / 15 / 0 / 0 | 15 / 15 / 0 / 0 |
| `t287-readable-stops` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 |
| `t287-governance-covered-source-use` | 9 / 7 / 0 / 2 | 9 / 7 / 0 / 2 |
| `t287-ordered-reconstruction` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t287-exact-prefix-projection-reuse` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-qualification-producer-acquisition-reuse` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-selected-action-authority` | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 |
| `t287-native-assessment-evidence` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `uat/harness` (`test_env/uat/harness.test.mjs`) | 33 / 33 / 0 / 0 | 33 / 33 / 0 / 0 |

`t288-logical-prefix-digest` without `ABI5_EVIDENCE_ROOT` on final: 5 tests,
4 pass, 1 skip (the gated case). Skips are the files' own gates, the same on
both builds. The two known reds on main (one case of
`t287-cross-cut-public-read`, one of `witness-reprice-definition-binding`) do
not show on this machine on either build.

The 34 sites of the trace where a lane writes to an event-log path: I read each.
None appends through a held store after changing the log's length or identity
and expects success, so no stop condition holds. Every file among them whose
store appends after the write is in the table.

Files that name `appendDurablyBatch`, `admitRuntimeEventTransactionAtExpectedPrefix`,
`admitRuntimeEventTransactionAtDurablePrefix`, `reopenEventStore` or
`recoverInterruptedEventStore` and are not test files: the falsifier
`test_env/falsifiers/runtime-f09-worker.mjs`, run by the qualification recipe,
not a lane; `runtime-retained-projections-worker.mjs` (run by
`t287-worksite-command-execution`), `r10-projection-family/s01-store.mjs` (run by
`r10-child-proof`, `r10-projection-contracts`, `t287-route-reconstruction`,
`m5-event-store-reopen`), `t287-entry212-reopen-worker.mjs` (run by
`m5-event-store-reopen`, `r3-workspace-binding`) and
`witness-reprice-mechanics.mjs` (run by the witness lanes, `t287-readable-stops`,
`t292-td32-legacy-store-door`); `r10-retained-child-projection.mjs` is a gated
support module of the catalogue. None writes to a log file.

## Replay comparison

`/private/tmp/abg-td25r-work/scripts/replay-log.mjs` (copied to
`/private/tmp/abg-td80w-work/replay/`) over the eleven logs of TD-25R, with the
live rc.12 store read from a copy and the r10 proof log read from this worktree.
The output is identical line for line on base and final (11 of 11 logs; every
whole-log and per-Run digest and owner fact). The live rc.12 copy is
byte-identical to its source (`sha256:440994c04f0b…`) before and after.

| Log | Rows | Whole-log replay digest | Runs |
|---|---|---|---|
| live rc.12 Run (copy) | 1,695 | `sha256:3800fb111acfede513425e706737e1637b7dfd210aac2fe68015eb3b47f5c5a5` | 1 |
| `rc7-held-session-author-02/blocked-testing-diagnostic-001/runtime.events.jsonl` | 44 | `sha256:40028725031a6ab8f143fa7ba6cdff4a8b80e6af2ad3bfe8cd28784295306a11` | 1 |
| `rc11-qualification-01/evidence-generation-03/…/abi5-root-env-MdmivN/runtime/events.jsonl` | 27 | `sha256:6dbf55865ef5692a2ef9b5a43e84a54ab78d1a69c36980568923cd843cf3bc1c` | 1 |
| `rc11-qualification-01/evidence-generation-02/…/abi5-root-env-gjgeWi/runtime/events.jsonl` | 216 | `sha256:0d3923da558e1b89dafabc8eff59521fdb5d164f552fffccca7c29cdcabef091` | 1 |
| `rc8-reference-preservation-01/registered-selection-whole-001/…/events.jsonl` | 282 | refuses: "run_stopped event and run_terminal HoldsAt truth disagree" | 7 |
| `rc11-qualification-01/native-02/runtime-001/…/runtime.events.jsonl` | 421 | `sha256:bc4a919ee1d0d395b11b8487d1c51483efa500422dfe2d01068fed8a510275ae` | 1 |
| `rc4-native-recovery-01/…/hc2-current-intent/continue-events.jsonl` | 166 | refuses: "requires zero or one exact run_stopped event" | 2 |
| `T/test_env/proof/abi5-root-r10.events.jsonl` | | decode refuses: "runtime event payload matches no admitted event-contract variant" | |
| RC1 `s02-installed-continuation-19/…` | | decode refuses: "noncanonical event" | |
| RC1 `s02-installed-continuation-18/…` | | decode refuses: same | |
| RC1 `s02-installed-continuation-04/…` | | decode refuses: "event stamp differs from the exact native profile schedule" | |

These are the values TD-25R recorded. Outputs:
`/private/tmp/abg-td80w-work/replay/{base,final}.jsonl`.

## Artifact truth over recorded stores

- Lanes `t287-historical-source-resource`, `r10-child-proof`,
  `t287-cross-cut-public-read`, `t287-selected-action-authority` and
  `t287-native-assessment-evidence`: identical counts on base and final (see the
  lane table).
- `projectArtifactTruth` over a copy of
  `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`
  (`probe-artifact-truth.mjs` from `/private/tmp/abg-td25m-work/scripts/`):
  on base and final the projection is `artifact_truth_projection` with
  digest `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f`
  over 1,695 rows and 3 artifact admissions; the two outputs are byte-identical.
- `contracts/capabilities/capability-definition-graph.json`: 16 rows on both;
  capability ids, owning contract ids, contract versions and dependent
  capability ids identical. With every digest masked the files are identical,
  and the digests map one to one. They change because each owning contract
  reference carries the `productContentDigest`, which changes with the source.

## Identity digests of the final build

| Digest | Base (committed generated files at `d2ed7fd58`) | Final |
|---|---|---|
| `productContentDigest` | `sha256:00078e2affbecd0862175ed2c6cef201a271dcf9d37120dcc313b95d565e33bf` | `sha256:f0182bffd668832e0c0ee69880a0073babfac9450795685d3c69687134da05a7` |
| `contributionManifestDigest` | `sha256:bb085c63f07951f96de93f48aec92da94e557249e7653654d661b3d0277d353b` | `sha256:85e90cb331396005c6c9d17dccd0c6ea3b1ec66a63d367766eaba190d5a0a0cc` |
| `publicContractCatalog.catalogDigest` | `sha256:0c8b4739120a3a4e6779fd1036a51a9b8ea5c0c8ac9d78b05cc02ee2cd52157c` | same |
| capability graph `graphDigest` | `sha256:a1abef81b9ff556545d49dc024d47107421e83777b0510e31d1dbfabab12c99f` | `sha256:708865494ff22baf15f7825d54c9eda3af09498642a518584669a4d666b5abca` |

Under `T/contracts` the build changes only
`capabilities/capability-definition-graph.json`, and only in digests: rows,
members and schema properties are unchanged. `product-toolchain-manifest.json`
changes in digests only (the graph's content digest, the publication digests
and the refs that embed `productContentDigest`). Neither is committed.

## Build, lints, declarations

`npm run build`, `npm run lint:imports` ("3 forbidden owner pair(s) hold"),
`lint:lifecycle` ("283 modules under code/src; 7 allow-listed site(s), no
offender") and `lint:calculus` ("6 modules …, no offender") pass on final. All
488 `.d.ts` files under `build/` are byte-identical to the base build's: the new
functions are not exported and no exported JSDoc changed.

## Lines changed

`git diff --numstat d2ed7fd58` over `code/src`, `design` and `test_env`:

| Added | Removed | File |
|---|---|---|
| 47 | 9 | `code/src/abg/event_store.ts` |
| 8 | 1 | `design/ABI5_REALIZATION_CONSTITUTION.md` |
| 41 | 22 | `design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md` |
| 7 | 5 | `test_env/support/evidence-gates.json` |
| 1 | 1 | `test_env/tests/m5-retry-lifecycle-authority.test.mjs` |
| 176 | 9 | `test_env/tests/t288-logical-prefix-digest.test.mjs` |

Qualification members changed (inventory and recipe not edited):
`code/src/abg/event_store.ts`, the two design notes,
`test_env/tests/t288-logical-prefix-digest.test.mjs` and
`test_env/tests/m5-retry-lifecycle-authority.test.mjs`.
`test_env/support/evidence-gates.json` is not an inventory member.

## Commits

On `claude/td80-append-currentness`, from `d2ed7fd58`; generated files restored
before each commit; nothing pushed.

| Commit | Content |
|---|---|
| `e47b7f6d7` | design: M05_S06 restatements and the constitution's two sentences |
| `e7dd3724d` | code: the helper, its two call sites and the rollback guard |
| `45ff19d04` | lanes: t288 cases, the gate catalogue row, the m5 citation |
| this Return | `.ai-workspace/work/T292_CONSOLIDATION_01/TD-80_RETURN.md` |

## Deviations

- The physical arms are four cases, not one: the transaction-entry arms, the
  same-length arm, the two-process case of ruling 8 and the rollback case of
  ruling 5. Each needs its own fresh store.
- The same-length arm is its own ungated case, not part of the gated case: it
  needs no recorded input either, and ruling 7 asks that the arms needing none
  run in every suite run.
- The comment citation in `m5-retry-lifecycle-authority.test.mjs:300` is
  corrected; my design edit moves its target.
- The door table's Public rows cover the witness door and the with-resource
  transport. The artifact and Run doors are covered through their store entries
  only (see the door table).

## Residuals

- The rollback range admits a foreign write shorter than the attempt: if
  another writer appends fewer bytes than this attempt's and this attempt's
  write then fails, the file length lies inside the range and the store
  truncates the foreign bytes. Ruling 5 sets that range. Closing it needs a byte
  read, which ruling 1 forbids, or the lock fix of TD-82.
- The check and the write are not atomic: a change between the stat and the
  `writeSync` goes unseen, as on base. The lock (TD-82) is the remedy for a
  second Product writer.
- A same-length change in place is accepted at the append by contract; a cached
  row returns its old value after such a change until reopen.
- A change during a Run door's call (start, continue), with a scripted actor
  changing the log mid-Run, is not built as a lane.
- The live design sentences listed above still contradict the store.

## What a reviewer should try to break

- Find a durable write that does not pass `appendDurablyBatch`, or a transaction
  that does not pass `runRuntimeEventTransaction`, so that a change behind the
  store reaches the disk unrefused.
- Find an entry where the refusal at (ii) leaves staged state, a changed digest
  or a changed held prefix (the in-action arm of the lane covers the
  transaction entries; the outside-a-transaction entries are covered only for
  the refused call itself).
- Make the rollback guard truncate bytes that are not this attempt's, beyond
  the residual above.
- Check that `assertDurableRuntimePrefixCurrent` refuses exactly as on base for
  every copied coordinate (same code, same message, same order), now that it
  runs through the shared helper.
- Check that the checked-artifact door's `sink_unavailable` is the truthful
  code and that no caller maps it to a retry where the file was replaced.
- Run the two-process case with the child holding the store open while the
  holder appends, the reverse of the lane.
