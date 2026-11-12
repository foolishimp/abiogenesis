# TD-80 Return: a held store checks its log file before and after it appends

**Status:** done, after the closing round of the independent review. A held
event store refuses a transaction and a write when the file at its log path or
behind its descriptor is not the regular file it holds (device and inode) at
the length it retains. After each write and its `fsync` it checks the file
again at that length plus the bytes it wrote; a file that differs fails the
append with no successor. Its rollback truncates only when the file holds
exactly the attempt's bytes past the prior length; otherwise it releases
ownership and reports both causes. A store that no longer owns its log refuses
a transaction before the action. The checks read no byte and no time field.
All 51 lane files pass on head and on final; only `t288-logical-prefix-digest`
changes its counts (5 tests to 20, all passing), and its new cases fail on
head wherever head accepts or runs the action. The replay and artifact-truth
comparisons are identical, and every `.d.ts` file is byte-identical to the
base. A durable append is 0.02-0.04% slower than at head and 0.09-0.16% slower
than at base, inside the 1% bound. For a ruling: the commit trailer, three
further M05_S06 sentences on close (see "Residuals"), and the narrower F3
sentence (see "Deviations").

Base: local `main` at `d2ed7fd58`. *Head*: `6a9c736f8`, the first build and
its Return, which the review read. Final: branch
`claude/td80-append-currentness`, built from the committed source. Terms: a
*held store* is an `AbgEventStore` that owns its log through an open
descriptor and a lock; its *retained length* is the byte length it records as
written (`durableByteLength`); a *change behind the store* is a change to the
log file made by anything other than the store while the store holds it;
*written* is the sum of the byte counts the store's own `writeSync` calls
returned in one append attempt. `T` is `build_tenants/abiogenesis/typescript`.

## Closing round after the independent review

The review (`REVIEW_TD80.md`, on local `main`, line numbers at `6a9c736f8`)
found the package mergeable after fixes F1 to F8, and the Executive ruled on
each. Lines below are of the final build: `event_store.ts` is
`T/code/src/abg/event_store.ts`, `t288` is
`T/test_env/tests/t288-logical-prefix-digest.test.mjs`, and M05_S06 is
`T/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`.

| # | Ruling | How it is realized | Where |
|---|---|---|---|
| F1 | The store checks its file again after the write. | After the rows are written and `fsyncSync` returns, still inside the `try` and before any in-memory step, `appendDurablyBatch` calls `assertDurableFileCurrent(path, descriptor, identity, priorByteLength + written)`. A file that is not the held file at that length throws `prefix_length_mismatch` or `file_identity_mismatch`, and the append returns no successor. The throw takes the rollback path of F2, whose guard makes the same check and fails it too: the store does not truncate, releases ownership and throws `AggregateError` with both causes. The check takes no lock and reads no byte. | `event_store.ts:2451`; t288 case at :265 |
| F2 | The rollback truncates only its own bytes, by count. | `written` (`event_store.ts:2440`) adds the byte count each `writeSync` returns in this attempt (:2445). The rollback guard (:2480) is `assertDurableFileCurrent(…, priorByteLength + written)`: the store truncates (:2481) only while the file at the path and behind the descriptor is the held file at exactly that length. Any other file throws, and the existing branch (:2483) releases ownership and throws `AggregateError([cause, guardError])`. The length range and the helper's second length parameter are gone. | `event_store.ts:2440`, `:2445`, `:2480`; t288 cases at :293 (D5, D7 and three more arms) and :322 (short write, failed first `fsync`) |
| F3 | The sentence on a failure after `fsync` states what happens. | M05_S06 states it: the file is truncated back, the history keeps the row, the store refuses every later append until it is closed and reopened, and inside a transaction the rollback's error replaces the original cause. Behaviour unchanged (register entry TD-86). | M05_S06 :650-656 |
| F4 | The cell on bytes read by an append is exact. | The `DurablePrefixCoordinate` refusal cell says a plain append reads no byte, and an append whose candidate shares an earlier row's body reads that row by location and refuses a changed one with the body reader's refusal. Door table rows below ("Appends whose candidate shares an earlier row's body"). The check before the write stays where it is. | M05_S06 :361; t288 case at :194 |
| F5 | The close sentences say what close does. | Both close sentences: close reads no log byte and checks no state of the log file; it closes the log descriptor and releases the lock. | M05_S06 :624-626, :745-750 |
| F6 | Restate the eight sentences. | Each restated in the present tense with file and symbol; see "Restated design sentences". The lock-namespace sentence of `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md` is left as it is (TD-82). | M05_S06 :212, :347-352, :362, :1879-1891, :2044, :2059-2062 |
| F7 | The two-process case holds before and after the lock is repaired. | The child reports its reopen result and the case branches on it. Refused at reopen: the case asserts `sink_unavailable` with the message prefix "durable event sink cannot acquire exact append ownership: " and the file unchanged, and ends. Reopened: the child appends ordinal 4 and the case asserts the holder's refusal at both entries, as before. The comment says the second branch runs today, because the lock path lies under `TMPDIR` and the child, started with another `TMPDIR`, looks in another lock directory (TD-82). Both branches run: the case as committed takes the second; the same file with the child's `TMPDIR` set to the parent's takes the first and passes. | t288 :214-257 |
| F8 | A store without ownership refuses a transaction before its action. | The start check in `runRuntimeEventTransaction` runs for every store with a log path: `if (state.durableLogPath !== null) assertHeldDurableLogCurrent(state, ownedDurableDescriptor(state))`. A store whose ownership is closed or released throws "ABG durable event sink is not open for append" there, before the action and before anything is staged, at every transaction entry. | `event_store.ts:4525`; t288 case at :342 and `assertReleased` (:97) in the cases at :265 and :293 |

## The rule and its call sites

All in `T/code/src/abg/event_store.ts` on the final build:

| Site | Line | What it does |
|---|---|---|
| `assertDurableFileCurrent(path, descriptor, identity, length)` | :2155 | The one currentness rule for a log file. `statSync` of the path and `fstatSync` of the descriptor when one is given; each must be a regular file with the given device and inode, else `DurablePrefixReadError("file_identity_mismatch", "ABG durable prefix file identity differs from coordinate")`; each length must equal `length`, else `DurablePrefixReadError("prefix_length_mismatch", "ABG durable prefix is not the current durable event-log prefix")`. A failed stat gives `file_identity_mismatch` "ABG durable prefix file is unavailable: …". These are the codes and messages `assertDurableRuntimePrefixCurrent` already gave. |
| `assertDurableRuntimePrefixCurrent` | :2143, call at :2148 | The existing currentness owner calls the rule with no descriptor and `prefixLength`. Codes, messages and order are those of the base. |
| `assertHeldDurableLogCurrent(state, descriptor)` | :2184 | The held-store form: the retained path, device and inode, and the retained length. |
| (i) transaction start, `runRuntimeEventTransaction` | :4525 | After the nesting check and before the prior events are captured, for every store with a log path: `assertHeldDurableLogCurrent(state, ownedDurableDescriptor(state))`. A store that no longer owns its log throws "ABG durable event sink is not open for append" here (F8). Every transaction entry runs through here: `admitRuntimeEventTransaction`, `admitRuntimeEventTransactionAtExpectedPrefix`, `admitRuntimeEventTransactionAtDurablePrefix`, `admitNonEmptyRuntimeEventTransactionAtDurablePrefix`, `admitRootEventProfileUpgrade`. |
| (ii) before the write, `appendDurablyBatch` | :2437 | After `ownedDurableDescriptor` and the row encoding, before the `try`. Every durable write runs through here: the transaction commit (:4544), an admission outside a transaction (`admitRuntimeEventInternal`, :4412, which serves `admitRuntimeEvent`, `admitNativeRuntimeLivenessEvent` and `appendCheckedArtifactEvent`) and `admitRuntimeEventBatch` (:4493). |
| written count | :2440, :2445 | `let written = 0` before the `try`; each `writeSync` return value is added. |
| (iii) after the write, `appendDurablyBatch` | :2451 | After `fsyncSync` (:2447) and before any in-memory step: `assertDurableFileCurrent(path, descriptor, identity, priorByteLength + written)` (F1). A refusal takes the rollback path below. |
| rollback guard, `appendDurablyBatch` catch | :2480 | `assertDurableFileCurrent(path, descriptor, identity, priorByteLength + written)` before `ftruncateSync` (:2481) (F2). See "The rollback". |

`heldRuntimePrefixState` (:2346) is unchanged and carries no check. The first
round's ruling adds the check there only if the checked-artifact door would
otherwise refuse with a less truthful existing code. It does not:
`appendCheckedArtifactEvent` returns `sink_unavailable` with the currentness
owner's message, the code this door already gives when its sink cannot take
the append (the legacy-profile refusal of TD-32 takes the same branch).

## The door table

The probe is `/private/tmp/abg-td80w-work/probe/door-table.mjs`; its outputs are
`probe/out/doors-base.json` (base), `probe/out/doors-final.json` (head) and
`probe/out/doors-closing.json` (final). The final output equals the head
output once the label is removed. Each store row starts from a fresh held store with three admitted rows (2,451 bytes). A
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

Head and final:

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

| Door | Change | Base | Head and final |
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

### A foreign row written between the check before the write and the write

The review's B4, at every appending entry. Probe:
`/private/tmp/abg-td80w-work/round2/probes/probe-race.mjs`; outputs
`round2/probes/out/race-head.json` and `race-final.json`. A fresh held store
has three rows (2,451 bytes). The first `writeSync` on the held inode appends
the 19-byte row `{"foreign":"race"}` through another descriptor, then makes the
store's own write.

| Entry | `6a9c736f8` | Final |
|---|---|---|
| `admitRuntimeEventTransaction`, `admitRuntimeEventTransactionAtExpectedPrefix` | accepted (the expected-prefix entry returns a successor of 3,269 bytes, which names bytes the file does not hold there); the file is 3,288 bytes: prior, foreign row, the store's row; the next append refuses `prefix_length_mismatch` | throws `AggregateError` "ABG durable event append failed and its owned prefix could not be restored" [`prefix_length_mismatch`, `prefix_length_mismatch`]; action ran; file left at 3,288 bytes; digest unchanged; the next append refuses "not open for append" |
| `admitRuntimeEventTransactionAtDurablePrefix`, `admitNonEmptyRuntimeEventTransactionAtDurablePrefix` | same as above | throws `AggregateError` "runtime transaction refused with a changed durable predecessor" [the `AggregateError` above, "ABG durable event sink is not open for append"]; otherwise the same |
| `admitRuntimeEvent`, `admitRuntimeEventBatch`, `compareAndAppendExpectedPrefix` | accepted | the `AggregateError` above; file left; released |
| `appendCheckedArtifactEvent` | accepted with a successor of 3,374 bytes; file 3,393 | returns `sink_unavailable` "AggregateError: ABG durable event append failed and its owned prefix could not be restored"; file left at 3,393; released |

### A store without ownership

A store whose ownership is closed (`closeDurableLog`) or released (after a
rollback that does not truncate) refuses at every transaction entry with "ABG
durable event sink is not open for append" before the action, on the final
build. At `6a9c736f8` the plain and expected-prefix entries ran the action
and then refused with the same message at the write; the two durable-prefix
entries refused before the action with the same message, when they compare
the predecessor with the held store (the review's A9). An admission outside a
transaction and close refuse with the same message on both builds.

### Appends whose candidate shares an earlier row's body

A basis row whose raw input is large is written whole; a later basis with the
same input is written as a reference to it, and encoding or staging that later
row reads the shared row from the file by its recorded location and digest
(`encodeEventBody` and `captureRuntimeEventCandidate` in
`abg/event_body_encoding.ts`). Probe:
`/private/tmp/abg-td80w-work/round2/probes/probe-sharing.mjs`; outputs
`round2/probes/out/sharing-head.json` and `sharing-final.json`. Each store
starts with the shared basis row and one plain row. *Same length* changes one
byte inside the shared row; *truncated into* cuts the file inside the shared
row; *last row cut* cuts the plain row.

| Change | Body-sharing append, outside a transaction (`admitRuntimeEvent`, `admitRuntimeEventBatch`) | Body-sharing append in a transaction, change before the call | Body-sharing append in a transaction, change inside the action | Plain append, any entry |
|---|---|---|---|---|
| same length, in the shared row | `prefix_digest_mismatch` "selected body bytes differ from their authenticated location" | same; action runs | same; action runs | accepted |
| truncated into the shared row | `file_identity_mismatch` "selected body differs from its authenticated resource" (the body read precedes the check before the write) | `prefix_length_mismatch` at the start check; action not run | `file_identity_mismatch` "selected body differs from its authenticated resource" | `prefix_length_mismatch`; in a transaction the action does not run when the change precedes the call |
| last row cut | `prefix_length_mismatch` | `prefix_length_mismatch`; action not run | `prefix_length_mismatch` | `prefix_length_mismatch` |
| extended | `prefix_length_mismatch` | `prefix_length_mismatch`; action not run | `prefix_length_mismatch` | `prefix_length_mismatch` |
| replaced | `file_identity_mismatch` "selected body differs from its authenticated resource" | `file_identity_mismatch` "ABG durable prefix file identity differs from coordinate"; action not run | `file_identity_mismatch` "selected body differs from its authenticated resource" | `file_identity_mismatch` "ABG durable prefix file identity differs from coordinate" |

Every refused call leaves the file unchanged. The head build and the final
build give the same table (274 recorded values, all equal), so F4 corrects
the design text, not the store.

## The rollback

Rule (`appendDurablyBatch`, `event_store.ts:2440-2485`): the store counts in
`written` the bytes its `writeSync` calls return in this attempt. After a
failure inside the `try` (a write, the `fsync`, the check after the write, or
a step before the in-memory commit), it truncates to the prior length only
when the file at the path and behind the descriptor is still the held file and
its length equals the prior length plus `written`. While no one else touches
the file, it holds exactly the attempt's bytes past the prior length, so every
byte the truncate removes is the attempt's. Any other file means bytes that
are not the attempt's, or a file shortened under it: the guard's
`DurablePrefixReadError` enters the existing rollback-failure branch, which
releases ownership and throws `AggregateError([cause, guardError], "ABG
durable event append failed and its owned prefix could not be restored")`. The
bytes stay on disk for reopen to refuse.

| Failure inside the `try` | File at the guard | `6a9c736f8` (range rule) | Final (count rule) | Shown by |
|---|---|---|---|---|
| a short write of 17 bytes, then a failed write | prior + 17, all the attempt's | truncates; store open | truncates; store open | t288 :322 arm 1; review D1 |
| the first `fsync` fails | prior + the attempt | truncates; store open | truncates; store open | t288 :322 arm 2; review D2 |
| a write with no progress | prior | truncates; store open | truncates; store open | `m5-event-store-reopen` "owned append I/O failures…" (`no_progress`) |
| the file truncated during the write | below prior | releases | releases | t288 :293 "truncated" |
| ten foreign bytes appended during a write that wrote nothing (D5) | prior + 10, none the attempt's | truncates the foreign bytes away; store open; the single write error | releases; `AggregateError` [write error, `prefix_length_mismatch`]; file kept | t288 :293 "extended by fewer bytes than the attempt"; probe D5 |
| 4 KiB of foreign bytes appended during the write | beyond prior + the attempt | releases | releases | t288 :293 "extended beyond the attempt" |
| the path replaced during the write | another inode at the path | releases | releases | t288 :293 "replaced" |
| ten bytes cut before a write that lands whole, then the first `fsync` fails (D7) | prior − 10 + the attempt | truncates to prior: the attempt's first 10 bytes stay inside the committed prefix; store open; later reads refuse | releases; `AggregateError` [`fsync` error, `prefix_length_mismatch`]; file kept | t288 :293 last arm; probe D7 |
| a foreign row written between the check before the write and the write (B4) | prior + foreign + the attempt | no failure: accepted with a successor that names the wrong bytes | the check after the write fails; releases; `AggregateError` [`prefix_length_mismatch`, `prefix_length_mismatch`]; file kept | t288 :265; probe B4 |

Every arm that releases also shows, through `assertReleased` (t288 :97), that
the released store refuses each of the four transaction entries before the
action, an admission outside a transaction, and close, with "ABG durable event
sink is not open for append".

How the lane makes the failures without a seam in the store: it replaces
`fs.writeSync` or `fs.fsyncSync` in the test process and calls
`syncBuiltinESMExports()`, so the store's own `node:fs` binding takes the
replacement for one call; `withNative` (t288 :111) restores the originals
after the call. This is how the owned-append I/O case of
`m5-event-store-reopen` already injects its failures. The lane uses the
expected-prefix entry, which rethrows the append's own error; the
durable-prefix entry wraps it once more after release. It asserts the
`AggregateError` message, `errors[0]` the injected failure, `errors[1]` the
expected currentness code and message, and the path's file and the held inode
(through a hard link) unchanged by the rollback.

No kept lane depends on a truncate the count rule no longer makes: the
truncating cases of `m5-event-store-reopen` ("owned append I/O failures…":
`partial_write`, `no_progress`, the failed `fsync`) are the attempt's own
bytes, and that file passes on the final build.

## The review's probes on the final build

`probe-store.mjs` and `probe-d7.mjs`, copied from the review's scratch to
`/private/tmp/abg-td80w-work/round2/probes/`, run on the final build; outputs
`round2/probes/out/store-final.json` and `d7-final.json`.

| Probe | Final | The review's expectation |
|---|---|---|
| B4 | `AggregateError` [`prefix_length_mismatch`, `prefix_length_mismatch`]; the file left at 3,282 bytes; the held `readAll` gives 3 rows; the next append refuses "not open for append" | the same (its sketch) |
| D5 | `AggregateError` ["injected write failure", `prefix_length_mismatch`]; the file left at the prior length plus the 10 foreign bytes; released | the same |
| D7 | `AggregateError` ["injected fsync failure", `prefix_length_mismatch`]; the file left at 3,237 bytes (prior 2,439); released; the output equals the review's `d7-sketch.json` byte for byte | the same |
| A9 | every transaction entry refuses "ABG durable event sink is not open for append" with the action not run; an admission, a batch and a compare-and-append refuse with the same message | refusal before the action at every entry (F8) |

Every other scenario of `probe-store.mjs` gives the result of the review's
sketch once paths, digests, devices and inodes are masked; A2 differs only in
the spelling of its work directory.

## Restated design sentences

### This round (head to final)

M05_S06 is `T/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`
and the constitution `T/design/ABI5_REALIZATION_CONSTITUTION.md`; both status
lines are unchanged. The first column gives the line at head, the second the
line on the final build. "Old" is the text at head.

| At `6a9c736f8` | Final | Finding | Old | New |
|---|---|---|---|---|
| M05_S06 :212, row M7 | :212 | F6 | "close derives both values from one verified byte snapshot under the held descriptor and lock" | "close derives both values from the held store's retained path, device, inode, length, digest and event contract and reads no log byte (`closeHeldEventStoreAtDurablePrefix` in `abg/event_store.ts`)" |
| M05_S06 :347-349 | :347-352 | F6 | "Its process-local state may retain only descriptor, lock, byte-count, and next-envelope mechanics needed to guard an append." | "Its process-local state holds the log path, the file's device and inode, the descriptor and lock, the byte length and running digest it has written, the active event contract, and the admitted history as row envelopes and locations, the locations of the inline bodies later rows may share, and the verified bodies of its current generation (`EventStoreState` in `abg/event_store.ts`)." |
| M05_S06 :357, create cell | :361 | F1 | "successor constructed inside the durable append rollback boundary after write and `fsync`, from …" | "successor constructed inside the durable append rollback boundary after write, `fsync` and the check of the log file's identity and length, from …" |
| M05_S06 :357, refusal cell | :361 | F1, F4 | "… refuses before the transaction's action and before the write (`assertHeldDurableLogCurrent` …); an append reads no byte, so a same-length change in place refuses at reopen and at a cold read of a copied coordinate instead" | "… refuses before the transaction's action and before the write (`assertHeldDurableLogCurrent` …); after the write and its `fsync`, a log file that is not the held file at the prior length plus the bytes written refuses and returns no successor (`appendDurablyBatch`); a plain append reads no byte, so a same-length change in place refuses at reopen and at a cold read of a copied coordinate instead; an append whose candidate shares an earlier row's body reads that row by location and refuses a changed one with the body reader's refusal" |
| M05_S06 :358, `EventStoreReopenAuthority` create cell | :362 | F6 | "no-argument `projectReopenAuthorityAndClose()` derives it and the coordinate from one verified byte snapshot under the held descriptor and lock" | "no-argument `projectReopenAuthorityAndClose()` derives it and the coordinate from the held store's retained path, device, inode, length, digest and event contract while the store still holds the descriptor and lock, and reads no log byte (`closeHeldEventStoreAtDurablePrefix` in `abg/event_store.ts`)" |
| M05_S06 :615-618 | :618-626 | F1, F5, F8 | "A held store requires, before a transaction's action and before each write, the same descriptor/path device/inode and a file length equal to the length it retains, and hashes no byte (`assertHeldDurableLogCurrent` in `abg/event_store.ts`); its close compares coordinates in memory and makes no file call." | "A held store requires, before a transaction's action and before each write, the same descriptor/path device/inode and a file length equal to the length it retains (`assertHeldDurableLogCurrent` in `abg/event_store.ts`), and after each write and its `fsync` the same device/inode at that length plus the bytes written (`appendDurablyBatch`); it hashes no byte. A store that has a log and no longer owns it refuses a transaction before its action. Its close compares coordinates in memory, reads no log byte and checks no state of the log file; it closes the log descriptor and releases the lock." |
| M05_S06 :631-639 | :637-657 | F1, F2, F3 | "It constructs and validates a non-empty commit's successor after write and `fsync`, inside that `try`; nothing is read back after the write. A successor construction or validation failure therefore follows the in-memory rollback and the truncate and `fsync` path, which truncates only while the file at the path and behind the descriptor is the held file and its length lies from the prior length to the prior length plus the attempt's bytes. Otherwise it does not truncate: it releases ownership and reports both causes, and the bytes past the prior length stay for reopen to refuse." | "Inside that `try` it writes the rows, counting the bytes each `writeSync` returns, calls `fsync`, and checks that the file at the path and behind the descriptor is still the held file and that its length equals the prior length plus the bytes written; otherwise the append fails and returns no successor. Only then does it commit the rows in memory and construct and validate the successor from the retained running digest; nothing is read back after the write. After a failure inside that `try` it truncates to the prior length only while the file is the held file and its length equals the prior length plus the bytes this attempt wrote, so every byte it removes is the attempt's. Otherwise it does not truncate: it releases ownership and reports both causes, and the bytes past the prior length stay for reopen to refuse. When a step of the in-memory commit throws after `fsync`, the file is truncated back but the store's history keeps the row: outside a transaction from the first commit step, inside one once `commitCanonicalPrefix` has run, where the transaction's rollback then throws "runtime rollback must restore its committed prefix" in place of the original cause. The store then refuses every later append ("durable append lacks its exact private admitted history") until it is closed and reopened." |
| M05_S06 :730-732, close | :745-750 | F5 | "it makes no file call and reads no byte, and a later reopen validates the persisted bytes" | "it reads no log byte and checks no state of the log file, then closes the log descriptor and releases the lock, and a later reopen validates the persisted bytes" |
| M05_S06 :757, checked artifact append | :776-779 | F1 | (no sentence on a change between the check and the write) | added: "A change between that check and the write fails the check after the write (`appendDurablyBatch`): the door returns `sink_unavailable`, the store releases ownership, and the written row stays in the file for reopen to refuse." |
| M05_S06 :1858-1868, D18 | :1879-1891 | F6 (:1863-1865, the D18 entry sentence, :1867-1868) | "…, and the transaction it enters checks, before its action, that the log file … (`assertHeldDurableLogCurrent` …); no named-byte digest is computed. It then captures the mechanical immutable in-memory event snapshot digest as `expectedPrefixDigest = store.digest()`; this value is not `predecessorPrefix.prefixDigest` or any coordinate digest. D18 synchronously enters `admitRuntimeEventTransactionAtExpectedPrefix(store, expectedPrefixDigest, action)`. There is no `await`, callback, message turn, or other interleaving point between the physical check and transaction entry." | "…; no named-byte digest is computed. D18 captures no event digest. It then calls `admitOwnedTraversalTransition` (`abg/traversal_route.ts`), which enters `admitRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, action)`. That entry compares the predecessor with the retained coordinate again and, before its action, checks that the log file at the path and behind the held descriptor has the held device and inode and the retained length (`assertHeldDurableLogCurrent` in `abg/event_store.ts`). `resumeProjectedRetry` is synchronous: there is no `await`, callback, message turn, or other interleaving point between the in-memory comparison and the log-file check inside the transaction entry." |
| M05_S06 :2021, diagnostic table | :2044 | F6 | "`successorPrefix` is not the held store's exact physical tail" | "`successorPrefix` differs from the call's `predecessorPrefix` (`canonicalEquals`) or from the held store's retained coordinate (`assertHeldEventStoreAtDurablePrefix`, compared in memory), in `enterTraversal` in `hog/entry.ts`" |
| M05_S06 :2036-2038 | :2059-2062 | F6 | "Immediately before entering traversal, it verifies `projectedRetryResume.successorPrefix` is the held store's exact physical tail." | "Immediately before entering traversal, it compares `projectedRetryResume.successorPrefix` with the held store's retained coordinate in memory (`assertHeldEventStoreAtDurablePrefix`, called from `enterTraversal` in `hog/entry.ts`) and reads no file." |
| Constitution :878-879 | :878-883 | F1, F8 | "A same-length change in place passes that check and is refused at reopen and at a cold read of a copied coordinate." | "After each write and its fsync it checks the same file again at the retained length plus the bytes written, and otherwise the append fails and returns no successor (`appendDurablyBatch`). An owner that no longer holds its log refuses a transaction before the action. A same-length change in place passes these checks and is refused at reopen and at a cold read of a copied coordinate." |
| Constitution :886-887 | :890-893 | F2 | "Failed writes or fsync restore the prior owned extent; failed restoration poisons ownership." | "A failed write, fsync or check after the write restores the prior owned extent only while the file is the held file at the prior length plus the bytes the attempt wrote; any other file, and a failed restoration, poison ownership and leave the bytes for reopen to refuse." |

### First round (base to head)

`T/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`
(status line unchanged; line numbers are the base file's). The rows at
:357 (both cells), :612-614, :625-627, :718-720 and :1841-1844 are restated
again this round; the table above gives their final text.

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

## Lane cases

All in `T/test_env/tests/t288-logical-prefix-digest.test.mjs`. *Head* is this
file run on the build at `6a9c736f8` (copied as `t288-closing-round.test.mjs`
into `/private/tmp/abg-td80w-work/head6a9/test_env/tests/`; output
`/private/tmp/abg-td80w-work/round2/red/t288-head.tap`). The file gives 20
tests on both builds: 9 cases, of which three have subtests (5 arms, 2 arms, 4
entries). Head: 10 pass, 10 fail. Final: 20 pass.

| Line | Case | Ruling | What it asserts | Head | Final |
|---|---|---|---|---|---|
| :22 | store logical digest preserves staged guards, unrelated-run staleness and rollback | first round, ruling 7 | the logical arms over the recorded owner history | passes | passes |
| :120 | a truncated, extended or replaced held log is refused at both transaction entries before the action, and the refused call writes nothing | first round, rulings 1, 7 | unchanged from the first round | passes | passes |
| :151 | a same-length change in place is accepted at both entries and refused at a cold read of a copied successor and at reopen … | first round, ruling 4 | unchanged | passes | passes |
| :194 | after a same-length change in a row whose body a later append shares, a plain append is accepted and the body-sharing append reads the row by location and refuses it | F4 | one byte of a shared basis row changed in place; a plain append at the expected-prefix entry runs its action and returns a successor; a body-sharing basis append outside a transaction and inside one refuse `prefix_digest_mismatch` "selected body bytes differ from their authenticated location"; the action flag shows the in-transaction action ran (the same-length change passes the check before the action); file and digest unchanged by the refused calls | passes: head gives the same refusals, so F4 corrects the text, not the store | passes |
| :228 | a second process either is refused at reopen or appends, and then the holder's next append is refused at both entries … | F7 (first round, ruling 8) | branch on the child's reopen result; see F7 | passes (the reopened branch) | passes (the reopened branch); the refused branch passes with the child's `TMPDIR` set to the parent's |
| :265 | a foreign write between the check before the write and the store's own write is refused after the write; the file is left as it is and ownership is released | F1, F8 | the first `writeSync` on the held inode appends a foreign row through another descriptor, then writes; the action flag true (the check before the action passed); `AggregateError` "ABG durable event append failed and its owned prefix could not be restored" with `errors[0]` and `errors[1]` `prefix_length_mismatch` "ABG durable prefix is not the current durable event-log prefix"; the file holds the committed rows, the foreign row, then the store's row; the digest unchanged; then `assertReleased` | fails: "the append was accepted" | passes |
| :293 | a failed append whose file changed during the write is not truncated; ownership is released with both causes | F2, F8 (first round, ruling 5) | five arms, see "The rollback" | 5 arms fail: D5 "extended by fewer bytes than the attempt: Error: injected native write failure" and D7 "…: Error: injected native fsync failure" (head truncates and rethrows the single error); truncated, extended beyond and replaced fail at `assertReleased` "the plain entry refuses before its action" (F8) | 5 pass |
| :322 | a failed append that wrote only its own bytes is truncated back to the prior length and the store stays open | F2 | a short write of 17 bytes then a failed write; a failed first `fsync`: the single error, the file equal to the committed bytes, digest and held prefix unchanged, then an append at the same store succeeds and a cold read gives 3 rows | 2 pass (head truncates these too) | 2 pass |
| :342 | a store whose ownership is closed refuses every transaction entry before its action | F8 | per entry (plain, expected-prefix, durable-prefix, non-empty durable-prefix), after `closeDurableLog()`: "ABG durable event sink is not open for append" and the action flag false | plain and expected-prefix fail: "the … entry refuses before its action" (head runs the action, then refuses); the two durable-prefix entries pass | 4 pass |

Head fails 10: the case at :265; the five arms of the case at :293 and that
case; two entries of the case at :342 and that case. Every failure is where head accepts or runs the action;
the cases that pass on head pass because head already gives that result.

Without `ABI5_EVIDENCE_ROOT` the final file gives 20 tests, 19 pass, 1 skip
(the gated case at :22). The first round's gate catalogue row
`owner-history-logical-digest` is unchanged; its lane
`t292-td60b-evidence-gate-catalogue` passes (3 of 3).

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
that tmpdir path (:4176); the recovery design
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
  path check at `abg/event_store.ts:4176`, which both name the tmpdir
  namespace.

## Cost

On copies of the live rc.12 log (14,506,732 bytes, 1,695 rows;
`/private/tmp/abg-td80-work/rc12/live-rc12.source.jsonl`). Scripts:
`/private/tmp/abg-td80w-work/cost/cost.mjs`, `cost-paired.mjs` and
`/private/tmp/abg-td80w-work/round2/cost-run.sh`; summaries by
`round2/cost-summary.mjs`. Outputs: `round2/cost-head-final/` (head against
final) and `round2/cost-base-final/` (base against final). Another worker's
test processes ran on this machine during the timing.

**Checks per append.** A check is one `statSync` of the path and one
`fstatSync` of the descriptor.

| Append | Base | Head | Final |
|---|---|---|---|
| in a transaction | 0 | 2: (i), (ii) | 3: (i), (ii), (iii) |
| outside a transaction | 0 | 1: (ii) | 2: (ii), (iii) |
| a failure inside the `try` | 0 | 1 more, the rollback guard | 1 more, the rollback guard |

**Checks per default-library Run.** Counted with temporary counters in a copy
of the final source (`/private/tmp/abg-td80w-work/round2/count-tree/`, built
there; the worktree is not instrumented) in one Run of the case "default-library
Run interrupted at the durable entered Testing cursor resumes once…"
(`t287-default-library.test.mjs:2005`), run from `T` with
`ABI5_DEFAULT_LIBRARY_BUILD_ROOT` set to the copy so that the installed
Product, the host and the CLI run the counted build:

| Process | (i) | (ii) | (iii) | Rollback guard | Batches | Rows | `heldRuntimePrefixState` |
|---|---|---|---|---|---|---|---|
| interrupted host (`host.mjs`) | 119 | 119 | 118 | 0 | 119 | 312 | 169 |
| resuming CLI | 125 | 125 | 125 | 0 | 125 | 312 | 176 |
| the Run | 244 | 244 | 243 | 0 | 244 | 624 | 345 |
| test process setup (not the Run) | 0 | 3 | 3 | 0 | 3 | 3 | 14 |
| six cold CLI reads | 0 | 0 | 0 | 0 | 0 | 0 | 2 each |

The row counts match the case's own output (`eventsInterrupted` 315 = 3 + 312,
`eventsFinal` 627). Every append of the Run is a transaction append, so the
Run makes 3 × 244 = 732 checks, against 488 at head. The host's last (iii) is
not recorded: the case kills the host with SIGKILL once its last row is in the
file, after the record of (ii). No check refuses and no rollback runs.

**Time of one append, this round (head against final).**

- One check (`statSync` and `fstatSync` timed in the cost script, 2,000 calls
  per process): median 1.33 µs over the 10 head processes and 1.35 µs over
  the 10 final processes.
- Paired in one process, `fsync` replaced by a no-op so the CPU part is timed
  alone (3 runs × 2,000 pairs per entry, order randomized per pair): final
  adds 1.7-1.8 µs per append at the expected-prefix entry and 1.0-1.4 µs at
  the durable-prefix entry (median pair difference), to a CPU part of
  69-78 µs; final is slower in 69-81% of pairs.
- With `fsync`, as the store runs, paired (3 runs × 300 pairs per entry): the
  median append takes 4.22-4.49 ms at head and 4.24-4.40 ms on final at the
  expected-prefix entry, and 4.99-5.15 ms at head and 4.97-5.12 ms on final at
  the durable-prefix entry. The median pair difference lies from −1.51% to
  +0.14%, and final is slower in 141-151 of 300 pairs.
- Wall clock with `fsync`, 10 head and 10 final processes interleaved, 60
  appends per entry each: expected-prefix 4.269 ms head, 4.221 ms final
  (−1.11%); durable-prefix 4.215 ms head, 4.265 ms final (+1.18%). The two
  halves of the head runs differ by up to 3.7%.

The check added this round costs 1.0-1.8 µs per append, 0.02-0.04% of a
durable append. Wall-clock timing here spreads over ±1.5% in both directions,
so it cannot resolve the difference; the direct measure lies far under 1%.

**Time of one append, the package (base against final).** Paired without
`fsync`: final adds 6.2-7.1 µs at the expected-prefix entry and 5.3-6.4 µs at
the durable-prefix entry, to a CPU part of 65-76 µs (7-11% of the CPU part);
final is slower in 89-96% of pairs. With `fsync`: median appends of 4.53-6.13
ms base and 4.60-6.20 ms final; median pair differences from −1.79% to
+2.87%, final slower in 138-178 of 300 pairs. The added 5.3-7.1 µs is 0.09-0.16%
of a durable append.

**The bound.** A durable append, `fsync` included, is slower by 0.02-0.04%
than at head and by 0.09-0.16% than at base, by the direct measure. The 1%
bound is not passed. Measured against the CPU part alone, without `fsync`, the
package adds 7-11% and this round 1.3-2.6%.

## Lanes before and after

One file at a time, the brief's command, `TMPDIR=/private/tmp/abg-td80w-tmp`,
from `T`. *Base* is the first round's run on the base build with the base test
files (`/private/tmp/abg-td80w-work/lanes/base/`). *Head* is this round's run
on the build at `6a9c736f8` with its test files, before any change of this
round (`/private/tmp/abg-td80w-work/round2/lanes/before/`). *Final* is the
final build with the final test files (`round2/lanes/after/`). Cells are
tests / pass / fail / skip.

| Lane | Base | Head | Final |
|---|---|---|---|
| `t288-logical-prefix-digest` | 1 / 0 / 0 / 1 | 5 / 5 / 0 / 0 | 20 / 20 / 0 / 0 |
| `t288-initial-cursor-entry` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-authenticated-owner-values` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-held-owner-fold-reuse` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-held-operation-bodies` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t292-td60b-evidence-gate-catalogue` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `m5-event-store-reopen` | 27 / 27 / 0 / 0 | 27 / 27 / 0 / 0 | 27 / 27 / 0 / 0 |
| `r5-invocation-admission` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-conformance-owner-reuse` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `m5-event-calculus-runtime` | 18 / 18 / 0 / 0 | 18 / 18 / 0 / 0 | 18 / 18 / 0 / 0 |
| `m5-retry-lifecycle-authority` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `r1-packed-artifact` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r3-workspace-binding` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `steel-basic-cli-public` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-registered-graph-selection` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-recursive-registered-selection` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-default-library` | 35 / 34 / 0 / 1 | 35 / 34 / 0 / 1 | 35 / 34 / 0 / 1 |
| `r10-child-proof` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `t287-calculus-fold` | 25 / 25 / 0 / 0 | 25 / 25 / 0 / 0 | 25 / 25 / 0 / 0 |
| `t287-continuation-causation` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-cross-cut-public-read` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 |
| `t287-event-body-encoding` | 25 / 25 / 0 / 0 | 25 / 25 / 0 / 0 | 25 / 25 / 0 / 0 |
| `t287-held-prefix` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 |
| `t287-historical-source-resource` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t287-interrupted-event-resource-recovery` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-management-stream-drain` | 7 / 4 / 0 / 3 | 7 / 4 / 0 / 3 | 7 / 4 / 0 / 3 |
| `t287-native-event-time` | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 |
| `t287-native-owner-reuse` | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 |
| `t287-public-terminal-projection` | 3 / 0 / 0 / 3 | 3 / 0 / 0 / 3 | 3 / 0 / 0 / 3 |
| `t287-readable-stops-foldback` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 |
| `t287-recursive-failure-foldback` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-result-evidence-lineage-projection` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-route-reconstruction` | 12 / 11 / 0 / 1 | 12 / 11 / 0 / 1 | 12 / 11 / 0 / 1 |
| `t287-selected-action` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-undispatched-diagnostic` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t289-install-event-bodies` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t292-td32-legacy-store-door` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-st1-installed-cross-owner-hello` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-worksite-command-execution` | 13 / 13 / 0 / 0 | 13 / 13 / 0 / 0 | 13 / 13 / 0 / 0 |
| `r10-projection-contracts` | 11 / 11 / 0 / 0 | 11 / 11 / 0 / 0 | 11 / 11 / 0 / 0 |
| `witness-run-stopped-definition-binding` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `witness-reprice-definition-binding` | 15 / 15 / 0 / 0 | 15 / 15 / 0 / 0 | 15 / 15 / 0 / 0 |
| `t287-readable-stops` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 |
| `t287-governance-covered-source-use` | 9 / 7 / 0 / 2 | 9 / 7 / 0 / 2 | 9 / 7 / 0 / 2 |
| `t287-ordered-reconstruction` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t287-exact-prefix-projection-reuse` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-qualification-producer-acquisition-reuse` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-selected-action-authority` | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 |
| `t287-native-assessment-evidence` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `uat/harness` | 33 / 33 / 0 / 0 | 33 / 33 / 0 / 0 | 33 / 33 / 0 / 0 |

Every file passes on head and on final, and every file other than
`t288-logical-prefix-digest` (5 tests on head, 20 on final) gives the same
counts on both. Totals over the 51 files: head 367 tests, 349 pass, 0 fail,
18 skip; final 382, 364, 0, 18. Skips are the files' own gates, the same on
all three builds.

No stop condition holds: no kept lane has an append that the check after the
write refuses; the truncating cases of `m5-event-store-reopen` truncate only
the attempt's own bytes and pass; and no kept lane observes the F8 start check
(no lane opens a transaction on a store it has closed or released, apart from
the new t288 cases).

The first round's reading of the write sites (which lane files write to an
event-log path, and that none writes to a log a store holds while expecting
the store to append) stands; this round adds writes only in
`t288-logical-prefix-digest`.

## Replay comparison

`/private/tmp/abg-td80w-work/replay/replay-log.mjs` over the eleven logs of
TD-25R, as the first round ran it, on the final build
(`/private/tmp/abg-td80w-work/round2/final-tree/`). The output is identical
line for line to the head output and to the base output (11 of 11 logs; every
whole-log and per-Run digest and owner fact). The live rc.12 copy is
byte-identical to its source (`sha256:440994c04f0b…`) before and after.
Outputs: `/private/tmp/abg-td80w-work/replay/{base,final,closing}.jsonl`
(`final` is the head build's output, `closing` the final build's).

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

## Artifact truth over recorded stores

- The lanes `t287-historical-source-resource`, `r10-child-proof`,
  `t287-cross-cut-public-read`, `t287-selected-action-authority` and
  `t287-native-assessment-evidence` give the same counts on base, head and
  final (see the lane table).
- `projectArtifactTruth` over the live rc.12 copy
  (`/private/tmp/abg-td80w-work/replay/probe-artifact-truth.mjs`): on base,
  head and final the projection is `artifact_truth_projection` with digest
  `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f`
  over 1,695 rows and 3 artifact admissions; `truth-final.jsonl` (head) and
  `truth-closing.jsonl` (final) are byte-identical.

## Identity digests of the final build

| Digest | Base (committed generated files at `d2ed7fd58`) | Head (`6a9c736f8` built) | Final |
|---|---|---|---|
| `productContentDigest` | `sha256:00078e2affbecd0862175ed2c6cef201a271dcf9d37120dcc313b95d565e33bf` | `sha256:f0182bffd668832e0c0ee69880a0073babfac9450795685d3c69687134da05a7` | `sha256:1e322500cff8e366b524aab9866615633ca8d1e2adbc82a34c61cf7834fe0817` |
| `contributionManifestDigest` | `sha256:bb085c63f07951f96de93f48aec92da94e557249e7653654d661b3d0277d353b` | `sha256:85e90cb331396005c6c9d17dccd0c6ea3b1ec66a63d367766eaba190d5a0a0cc` | `sha256:90d28e023d52ea03ecb34d8abfaa1f2f44e7247d3360ec559cbd820991d04166` |
| `publicContractCatalog.catalogDigest` | `sha256:0c8b4739120a3a4e6779fd1036a51a9b8ea5c0c8ac9d78b05cc02ee2cd52157c` | same | same |
| capability graph `graphDigest` | `sha256:a1abef81b9ff556545d49dc024d47107421e83777b0510e31d1dbfabab12c99f` | `sha256:708865494ff22baf15f7825d54c9eda3af09498642a518584669a4d666b5abca` | `sha256:65e12ab4fc3be57d851c337a4e224cba7fb995de171e4718c442ed33836777d4` |

The build changes `T/contracts/capabilities/capability-definition-graph.json`
and `T/product-toolchain-manifest.json` in digests only, because each owning
contract reference carries the `productContentDigest`. Neither is committed;
both are restored before each commit.

## Build, lints, declarations

On the final build from the committed source: `npm run build` passes;
`npm run lint:imports` ("3 forbidden owner pair(s) hold"), `lint:lifecycle`
("283 modules under code/src; 7 allow-listed site(s), no offender") and
`lint:calculus` ("6 modules under code/src/abg/calculus/; 0 allow-listed
import(s), no offender") pass. All 488 `.d.ts` files under `build/` are
byte-identical to the base build's (`dts.sha256` of the base and final trees
compare equal): no new export and no exported JSDoc changed.

## Lines changed

`git diff --numstat 6a9c736f8` over `code/src`, `design` and `test_env` (this
round):

| Added | Removed | File |
|---|---|---|
| 26 | 15 | `code/src/abg/event_store.ts` |
| 11 | 4 | `design/ABI5_REALIZATION_CONSTITUTION.md` |
| 58 | 33 | `design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md` |
| 1 | 1 | `test_env/tests/m5-retry-lifecycle-authority.test.mjs` |
| 1 | 1 | `test_env/tests/t287-exact-prefix-projection-reuse.test.mjs` |
| 1 | 1 | `test_env/tests/t287-ordered-reconstruction.test.mjs` |
| 179 | 39 | `test_env/tests/t288-logical-prefix-digest.test.mjs` |

The package as a whole, `git diff --numstat d2ed7fd58`: `event_store.ts`
59/10, the constitution 17/3, M05_S06 78/34, `evidence-gates.json` 7/5,
`t288-logical-prefix-digest.test.mjs` 316/9, and the three citation comments
1/1 each.

Qualification members changed by this round (inventory and recipe not
edited): `code/src/abg/event_store.ts`, the two design notes and the four test
files above.

## Commits

On `claude/td80-append-currentness`, from `d2ed7fd58`; generated files
restored before each commit; nothing pushed.

| Commit | Content |
|---|---|
| `e47b7f6d7` | first round, design: M05_S06 restatements and the constitution's two sentences |
| `e7dd3724d` | first round, code: the rule, its two call sites and the rollback guard |
| `45ff19d04` | first round, lanes: t288 cases, the gate catalogue row, the m5 citation |
| `0a1e2474d`, `6a9c736f8` | first round, the Return and its corrections |
| `79b6bfd5b` | design: the check after the write, the count rule, F3, F4, F5, the eight F6 sentences, the constitution |
| `8fef6a2a8` | code: the check after the write, the count rule, the start check for a store without ownership |
| `f32388512` | lanes: the t288 cases of F1, F2, F4, F7, F8 and three citation comments |
| this Return | `.ai-workspace/work/T292_CONSOLIDATION_01/TD-80_RETURN.md` |

## Deviations

- F3: the design sentence is narrower than the ruling's wording. Inside a
  transaction the history keeps the row only once `commitCanonicalPrefix` has
  run; a step before it is undone in memory too (the review's D4, P2 inside a
  transaction: "file and memory are restored"). The sentence says so: "outside
  a transaction from the first commit step, inside one once
  `commitCanonicalPrefix` has run".
- The commit trailer of this round is `Co-Authored-By: Claude Opus 5.5
  <noreply@anthropic.com>`, the model that wrote this round, not the brief's
  `Claude Fable 5.2`. The Claude-Session line is the brief's. The first
  round's commits carry `Claude Fable 5.2`. For a ruling; an amend changes
  only the trailer.
- Two more citation comments are corrected:
  `t287-exact-prefix-projection-reuse.test.mjs:28` and
  `t287-ordered-reconstruction.test.mjs:84` cited M05_S06 `:361` for "equal
  prefix reconstructs equal result", which stood at :364 on base and head and
  stands at :368 now. `m5-retry-lifecycle-authority.test.mjs:300` cites
  `:2029-2030` (it cited `:2006-2007`).
- The F7 refused branch is shown by a copy of the lane file whose child gets
  the parent's `TMPDIR` (`/private/tmp/abg-td80w-work/round2/t288-f7-same-tmpdir.test.mjs`,
  run on the final build: 20 of 20 pass, the child reports `sink_unavailable`
  "durable event sink cannot acquire exact append ownership: TypeError: ABG
  durable event sink already has an exclusive append lock; abandoned locks
  require explicit operator recovery"). The committed case runs the reopened
  branch.
- The brief counts 52 lanes in the first Return; its table lists 51 files
  (`uat/harness` included). All 51 ran before and after, including those this
  round cannot affect.

## Residuals

- A same-length change in place is accepted at a plain append by contract
  (ruling 4); a cached row returns its old value after such a change until
  reopen. An append whose candidate shares a changed row refuses it (F4).
- A foreign truncation followed by a foreign append that restores the same
  length before this store's write passes both checks: that is the
  same-length class of ruling 4.
- A foreign write that lands after this append's write and `fsync` but before
  the check after the write refuses a row that was placed correctly. It fails
  safe: ownership is released, the bytes stay, and reopen with the last
  handoff refuses the log.
- A row whose append reports a failure can still be in the file (the check
  after the write, D5, D6, D7). Reopen with the last handoff refuses such a
  log; an operator's recovery (`recoverInterruptedEventStore`) admits extra
  rows when they validate, so recovery can admit a row whose append was
  reported as failed. The review states this combination by reading.
- A step of the in-memory commit that throws after `fsync` leaves the history
  with a row the file no longer has, and inside a transaction replaces the
  cause: register entry TD-86. M05_S06 :650-656 states it (F3); the behaviour
  is unchanged.
- An empty transaction (an action that admits nothing) on a closed or released
  store returned the action's value before this round and now refuses "not
  open for append" before the action (F8). No Product caller opens a
  transaction on a store it has closed: every caller of a transaction entry
  (`closure.ts:168`, `c_call.ts:5308` and `:7416`, `retry.ts:4924`,
  `open_call.ts:649`, `child_lifecycle.ts:249`, `execution_basis.ts:2829`)
  appends inside its action, and on those the result was already the same
  refusal, after the action. No kept lane observes the difference.
- A change during a Run door's call (start, continue), with a scripted actor
  changing the log mid-Run, is not built as a lane.
- `T/design/T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md:143-146` states the
  lock namespace following `TMPDIR` as a rule; left as it is (TD-82). When
  TD-82 is repaired, the two-process case takes its refused branch.
- Three further M05_S06 sentences say close works from verified bytes, where
  close derives the pair from the store's retained values and reads no log
  byte. They are of the same class as F6 but not among the eight it names, so
  they are left as they are, for a ruling: :301, row `EventStoreReopenAuthority`
  of the type table, "projected atomically with a coordinate by no-argument
  close from the same verified bytes"; :551, the state diagram, "no-arg close
  held sink; returned pair names verified bytes only"; :1511, axiom
  `AX-W1A-02`, "M7 close/reopen derive equal coordinates from verified bytes".
- Pre-existing, from the review, not changed here:
  - P1. Inside a transaction, `appendCheckedArtifactEvent` returns
    `sink_unavailable`, "checked artifact append produced no durable
    successor", while the outer transaction commits the artifact row. Not
    reachable by the review's reading: no file that opens a runtime
    transaction calls `admitArtifact`, `admitProductInstall*`,
    `admitWorkspaceBinding` or `appendCheckedArtifactEvent`. The two Product
    callers (`product/materialization_definition_bindings.ts:410`,
    `product/release_snapshot_definition_bindings.ts:101`) call the door after
    an `await`.
  - P2. Recovery identifies the log path with `lstat`
    (`recoverInterruptedEventStore`, `event_store.ts:4189` on the final
    build). The held check (`statSync`, :2161), reopen and the cold read follow
    symbolic links. A log path replaced by a symbolic link to the held file is
    accepted by appends, by reopen and by a cold read. Recovery refuses it with
    `resource_identity`, "recovery resource path/descriptor identity differs".

## What a reviewer should try to break

- Find a durable write that does not pass `appendDurablyBatch`, or a
  transaction that does not pass `runRuntimeEventTransaction`, so that a
  change behind the store reaches the disk unrefused.
- Find a failure inside the `try` after which the rollback truncates bytes
  that are not the attempt's: a path where `written` counts bytes that did not
  land, or misses bytes that did.
- Find a healthy append that the check after the write refuses: a store
  whose own write leaves the file at another length than prior plus written
  (the counted default-library Run records 243 such checks and none refuses).
- Find a caller that opens a transaction on a store it closed and relies on
  the action running (F8).
- Check that `assertDurableRuntimePrefixCurrent` refuses exactly as on base
  for every copied coordinate (same code, same message, same order).
- Run the two-process case with the child holding the store open while the
  holder appends, the reverse of the lane.
