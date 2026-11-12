# TD-80 trace: a held store appends without looking at its file

Ticket T-292, register entry TD-80 (`.ai-workspace/TECHNICAL_DEBT_REGISTER.md:195` and `:880-888`). This is an analyst's trace: commentary for the Executive's ruling. It changes nothing.

Lines cite `main` at `b925470d5ef2` (2026-11-12 21:28). The probes ran on a build of `42eabe9e8`, made in `/private/tmp/abg-td80-work`. `git diff --quiet 42eabe9e8 b925470d5` reports no change over every cited file [run]: `code/src/abg`, `code/src/shared`, `code/src/hog`, `design/`, `specification/`, the t288 and t287 lanes cited and `evidence-gates.json`. Every line number and result below therefore holds at `b925470d5`.

Markers: **[run]** means I executed it and saw the result. **[read]** means I read the code or the text. `T` is `build_tenants/abiogenesis/typescript`. A bare `:N` is a line of `T/code/src/abg/event_store.ts`.

## Terms used

- **Held store**: an `AbgEventStore` that has its log file open for appending and holds the lock. The file is opened `O_RDWR|O_APPEND` (`:1695`). While open, the store is meant to be the file's only writer.
- **Retained state**: what the held store keeps in memory about its file:
  - device and inode
  - byte length (`durableByteLength`)
  - a running SHA-256 of every byte it has written (`durableHash`)
  - its current coordinate
  - each row's offset, length and SHA-256
- **Coordinate** (`DurablePrefixCoordinate`, `:1308-1320`): a record naming the log file (path, device, inode), a byte length, the SHA-256 of the file's first that-many bytes, and a digest of the record itself. An append returns a new coordinate, the **successor**.
- **Held coordinate**: the exact object a held store returned; it reads through that store. **Copied coordinate**: a JSON copy of it; it reads the file cold.
- **Logical digest**: `store.digest()`, a hash of the decoded events kept in memory. **Physical digest**: a SHA-256 of bytes in the file.
- **Body cache**: decoded rows kept in memory after their first read. A non-basis row is kept after its first read; a basis row only while a hold names it (`runtime_history.ts:327-346`).
- **Cold reopen**: `reopenEventStore(authority)`. It opens the file, takes the lock, then hashes and decodes the whole file (`:4217-4283`).
- **Whole-log reader**: `readRuntimeEventsAtDurablePrefix` given a coordinate built from the file as it now is. It shows whether the file on disk is a readable log at all.
- **Entry**: a function a caller uses to ask the store to append. The register names two:
  - the **expected-prefix entry**, `admitRuntimeEventTransactionAtExpectedPrefix` (`:4542-4553`)
  - the **durable-prefix entry**, `admitRuntimeEventTransactionAtDurablePrefix` (`:4560-4567`), with its non-empty twin (`:4585-4597`)

## Answer

1. **What the store does.** No append entry looks at the file before it writes: every door ends in `appendDurablyBatch` (`:2366-2444`), which compares only in-memory state, writes at the file's real end and builds the successor from its retained hash, so each of the six changes, and a second writer started with another `TMPDIR`, was followed by an accepted append that is refused only later, at reopen, cold reads and uncached held reads, while after a replacement by an identical copy a reader of the path sees a valid log without the acknowledged row [read; run].
2. **What the design says.** The row the register cites (`M05_S06…:357`, "byte mismatch refuses before append/read result"; `:612-614`, "then hashes all named bytes") describes the store before `ad2a39f40` (2026-09-23), which read the whole log three times per durable-prefix append, and it sits in a document whose status line says "proposed … not operative" (`:3-4`), while the operative constitution (`:865-882`), the accepted D4/D5 design (`:294-299`) and the requirements' trust boundary (`REQ-L-GTL3-C-ALGEBRA.md:200-206`) call outside edits unsupported and define currentness as path, device, inode and length [read].
3. **What I recommend.** Option (b1): put back the identity-and-length check that `ad2a39f40` removed, at the start of a transaction and in `appendDurablyBatch` before its rollback `try` (3.6 µs median per call, constant as the log grows [run]), and restate the row so that an append refuses a file replaced, truncated or extended behind the store, while a same-length in-place change is refused at reopen, cold reads and uncached held reads instead.

## 1. What each entry checks today

### 1.1 `appendDurablyBatch` (`:2366-2444`), the write behind every door [read]

| What | Compared with | Line |
|---|---|---|
| Store open: path, descriptor, identity, lock and hash present; not closed | in-memory fields | `:2376` → `:2301-2308` |
| A store on the legacy profile admits only its reprice batch | in-memory | `:2372-2375` |
| Retained coordinate length equals retained byte length; staged rows match the admitted history; ordinals are consecutive | in-memory | `:2378-2382` |
| Offset recorded for the new row | the retained length, not the file's size | `:2402` |
| Write | `writeSync` with no position on the `O_APPEND` descriptor, so bytes land at the file's real end | `:2409-2413`, `:1695` |
| Durability | `fsyncSync` | `:2414` |
| Successor coordinate | retained running hash extended by the new bytes; identity from retained state | `:2396`, `:2403-2405`, `:2427-2428` |
| Failure once the `try` has begun | `ftruncateSync(descriptor, priorByteLength)`, with no check of what lies past that length | `:2437` |
| Not compared | device or inode of path or descriptor; file size; modification time; any byte on disk; the logical digest | — |

### 1.2 Expected-prefix entry (`:4542-4553`); `compareAndAppendExpectedPrefix` (`:4662-4673`) is the same [read]

| What | Compared with | Line |
|---|---|---|
| Logical digest | `store.digest()` against the caller's digest; `store.digest()` is a retained value (`runtime_history.ts:182-189`). Refusal: TypeError "runtime event append requires the exact expected immutable prefix" | `:4547-4551`, `:4667-4671` |
| Then | the action runs (`:4484`), then `appendDurablyBatch` (`:4494-4496`) | — |
| Not compared | anything about the file, as M05_S06 `:649-652` states | — |

### 1.3 Durable-prefix entries (`:4560-4567`, `:4585-4597`), through `assertHeldDurableTransactionHistory` (`:4570-4578`) and `heldRuntimePrefixState` (`:2319-2329`) [read]

| What | Compared with | Line |
|---|---|---|
| Coordinate shape and self-digest | `validateDurablePrefixCoordinate`, which does no file I/O (`:1997-2058`) | `:2321` |
| Store open | in-memory | `:2324` |
| Coordinate digest | the store's retained coordinate. Refusal: "ABG held store differs from the selected durable prefix" | `:2325-2326` |
| Nothing staged; the retained selection covers every row | in-memory. Refusal: "runtime event transaction requires the exact durable event predecessor" | `:4575-4576` |
| Then | action `:4484`, append `:4494-4496`. An empty transaction re-checks the coordinate in memory | `:4497-4499` |
| Not compared | anything about the file | — |

### 1.4 `appendCheckedArtifactEvent` (`:4386-4422`) [read]

| What | Compared with | Line |
|---|---|---|
| Operation | an allow-list: Product install, workspace bind, and named members of release snapshot and Product materialize | `:4393-4404` |
| Coordinate against the retained coordinate (as in 1.3) | refusal `prefix_mismatch` | `:4405-4408` |
| Any failure in admission or the write | refusal `sink_unavailable` | `:4419-4420` |

### 1.5 Single admissions and batches outside a transaction [read]

`admitRuntimeEventInternal` (`:4367-4368`) and `admitRuntimeEventBatch` (`:4449`) go straight to 1.1.

### 1.6 Held read of one row: `RuntimeHistory.event` (`runtime_history.ts:321-349`) [read; run in §2]

The read goes through `readRuntimeHistoryRowBytes` (`:3680-3702`).

| Case | Check | Line |
|---|---|---|
| Row cached at the same location | returns the cached value; no file access | `runtime_history.ts:327-331` |
| Row not cached, before reading | fstat of the descriptor and stat of the path: regular file, device and inode against retained, size at least the row's end. Refusal: `file_identity_mismatch` "selected body differs from its authenticated resource" | `:3684-3687` |
| Row not cached, after reading | the same identity and size checks, then the row's SHA-256 against its recorded physical digest. Refusal: `prefix_digest_mismatch` "selected body bytes differ from their authenticated location" | `:3696-3699` |
| What is cached | non-basis rows after their first read; basis rows only under a hold | `runtime_history.ts:340-346` |

### 1.7 Currentness: `assertDurableRuntimePrefixCurrent` (`:2143-2159`) [read; run]

| Case | Check | Line |
|---|---|---|
| Held coordinate of an open store | coordinate digest against the owner's current coordinate, in memory; otherwise `prefix_length_mismatch` | `:2144`, `:1811-1817` |
| Copied coordinate | stat of the path: regular file, and device and inode equal → else `file_identity_mismatch`; size equal to the coordinate's length → else `prefix_length_mismatch` | `:2148-2158` |
| Not compared | bytes. The source comment reads: "Under the trusted-desktop boundary, unchanged prior bytes are not rehashed to detect hostile mutation." | `:2140-2142` |

### 1.8 `assertDurableRuntimePrefixBytes` (`:2136-2138`) [read]

Does nothing for a held coordinate of an open store; otherwise does a full cold read (1.9).

### 1.9 Cold read of a copied coordinate [read; run]

`readRuntimeEventsAtDurablePrefix` (`:2168-2184`), through `readAuthenticatedRuntimePrefixBytes` (`:2186-2286`).

| What | Check |
|---|---|
| Identity, before and after the read | device and inode against the coordinate → `file_identity_mismatch` |
| Size | at least the coordinate's length (exactly that length when current is required) → `prefix_length_mismatch` |
| Bytes | SHA-256 of the first `prefixLength` bytes against `prefixDigest` → `prefix_digest_mismatch` (`:2276-2281`) |
| Events | decoded and validated: envelopes and ordinals |

Bytes past the coordinate's length are permitted and not read (M05_S06 `:606-611`).

### 1.10 Close [read]

`closeHeldEventStoreAtDurablePrefix` (`:2644-2682`) and `projectReopenAuthorityAndClose` (`:2632`):
- compare the coordinate with the retained coordinate, in memory (`:2648`, `:2652-2654`);
- build the reopen authority from retained identity, length and digest (`:2659-2668`);
- make no stat call and read no byte.

M05_S06 `:718-722` says close "reads exactly the held durable length, verifies the bytes".

### 1.11 Reopen: `reopenEventStore` (`:4217-4283`) [read; run]

| What | Check |
|---|---|
| Lock and identity | `openOwnedDurableSink` (`:1687-1722`) opens the file, takes the lock, and compares descriptor and path identity with the authority → `sink_unavailable` (`:4254-4263`) |
| Size | must equal the authority's length → `durable_log_mismatch` "durable event sink differs from the selected exact prefix" (`:4265-4268`) |
| Bytes and events | the whole file is decoded against the authority's digest (`:4272`). A digest mismatch gives `durable_log_mismatch`; any other failure gives `invalid_event_history` (`:4278-4281`) |
| Stability | size and path identity unchanged after the decode (`:4273-4275`) |

On the rc.12 copy a reopen took 831 to 1,670 ms [run].

### 1.12 The lock (`:1597-1662`) [read; run]

- The lock is a file at `join(tmpdir(), "abiogenesis-event-store-locks-v5", "<device>-<inode>.lock")`, created exclusively (`:1597-1601`, `:1605-1662`).
- A second reopen in the same `TMPDIR` is refused: `sink_unavailable` "… already has an exclusive append lock; abandoned locks require explicit operator recovery" [run].
- A process with another `TMPDIR` looks in another directory, finds no lock, and reopens and appends (§2, change 8) [run].

No modification time or change time is read anywhere in `event_store.ts`, `runtime_history.ts` or `event_prefix.ts` [run: grep for `mtime|ctime|birthtime|atime|utimes`, 0 matches].

## 2. Which changes each entry notices, and when

Setup [run]:
- Script: `/private/tmp/abg-td80-work/probe/probe-q2.mjs`. Output: `/private/tmp/abg-td80-work/probe/out/q2.json`, 54 cells.
- The store: a new store with five rows (4,087 bytes), made by `createNewEmptyAppendSink` and five durable-prefix appends.
- Each change was made while the store was open.
- After the change, one of three actions:
  - no append;
  - one expected-prefix append: `admitRuntimeEventTransactionAtExpectedPrefix(s, s.digest(), …)`;
  - one durable-prefix append: `admitNonEmptyRuntimeEventTransactionAtDurablePrefix(s, selectHeldEventStoreDurablePrefix(s), …)`.
- The body cache was either cold (nothing read before the change) or warm (`readAll` before it).
- Change 8 comes from `/private/tmp/abg-td80-work/probe/probe-lock.mjs`: three rows, two processes.

**The two entries gave the same result in every cell, so one column covers both.** Nothing refused before the append in any cell.

| Change | Next append (both entries) | Where the new row landed (store recorded 4,087) | Next held read of the changed row: cold cache / warm cache | Held read of an unchanged row | Cold reopen with the close handoff | Whole-log reader after the accepted append |
|---|---|---|---|---|---|---|
| 1. One byte of row 1, same length, positional write | accepted; successor length 4,917 | 4,087 | `prefix_digest_mismatch` "selected body bytes differ from their authenticated location" / old cached value; `readAll` gives 6 rows, no refusal | read | `durable_log_mismatch` "TypeError: ABG durable prefix bytes differ from coordinate" | `event_envelope_invalid` "durable ABG event log contains restamped or inconsistent history" |
| 1b. Byte 0 rewritten by `writeFile` (the t288 method: same inode, same length) | accepted | 4,087 | as 1 | read | as 1 | `event_envelope_invalid` "durable ABG event log contains invalid JSON" |
| 2. One byte of the last row | accepted | 4,087 | as 1 | read | as 1 | as 1 |
| 3. Last row truncated (file 3,269) | accepted; the store says 4,917, the file is 4,099 | 3,269 | before the append: `file_identity_mismatch` "selected body differs from its authenticated resource"; after it: `prefix_digest_mismatch` / cached value | read; the new row gives `file_identity_mismatch` | `durable_log_mismatch` "durable event sink differs from the selected exact prefix" | `admission_ordinal_invalid` "durable ABG event log contains an invalid admission ordinal" |
| 4. 17 foreign bytes appended (file 4,104) | accepted; the store says 4,917, the file is 4,934 | 4,104 | no row changed | read; the new row gives `prefix_digest_mismatch` | `durable_log_mismatch` "durable event sink differs from the selected exact prefix" | `event_envelope_invalid` "durable ABG event log contains an invalid logical event" |
| 5. Replaced by an identical copy (new inode) | accepted | only in the old inode; the path's file stays 4,087 bytes | no row changed | cold: `file_identity_mismatch`; warm: cached value | `sink_unavailable` "durable event sink cannot acquire exact append ownership: TypeError: ABG durable event sink identity differs from authority" | **5 rows, no refusal: the acknowledged row is gone** |
| 6. Replaced by a copy with one byte changed | accepted | only in the old inode | cold: `file_identity_mismatch` / cached value | cold: `file_identity_mismatch`; warm: cached value | as 5 | `event_envelope_invalid` "restamped or inconsistent history" |
| 7. As 1, with the modification time put back | accepted | 4,087 | as 1 | read | as 1 | as 1 |
| 8. A second process with another `TMPDIR` reopens with the same authority and appends one row | accepted (ordinal 4 again) | the store recorded 2,451; the row landed at 3,275 | the store's own new row: `prefix_digest_mismatch` | not tried | `durable_log_mismatch` "durable event sink differs from the selected exact prefix", with either process's handoff | `admission_ordinal_invalid`; ordinals on disk 1, 2, 3, 4, 4 |

What a copied coordinate sees after the same changes [run]:

| Change | Currentness, `assertDurableRuntimePrefixCurrent` | Cold read of the coordinate from before the change | Cold read of the successor |
|---|---|---|---|
| 1, 1b, 2, 7 (same length) | passes | `prefix_digest_mismatch` | `prefix_digest_mismatch` |
| 3 truncation | `prefix_length_mismatch` | `prefix_length_mismatch` | `prefix_length_mismatch` |
| 4 foreign bytes | `prefix_length_mismatch` | passes, because a later suffix is permitted | `prefix_digest_mismatch` |
| 5, 6 replacement | `file_identity_mismatch` | `file_identity_mismatch` | `file_identity_mismatch` |

Further observations [run]:
- Close succeeded in every cell. It handed off the retained length (4,917 after an append), whatever the file held.
- In changes 1, 1b, 2 and 7 the new row landed where the store recorded it. In one test I made change 1b, let an append through, then wrote the original byte 0 back with a positional write. The successor then read cold, 4 rows, and reopen succeeded, 4 rows (`/private/tmp/abg-td80-work/probe/probe-restore.mjs`). The outside edit damaged the log; the append added no damage.
- In changes 3, 4, 5, 6 and 8 the append itself lost the row or recorded it at the wrong offset.
- rc.12 copy, 1,695 rows (`/private/tmp/abg-td80-work/probe/probe-rc12.mjs`, part B):
  - On a reopened copy, a first `readAll` read 1,663 row bodies (13.3 MB) and a second read 22 (420 KB): non-basis rows stay cached.
  - I then changed one byte in row 7 (`run_segment_opened`, cached) and one in row 6 (`basis_admitted`, not cached).
  - Row 7 returned its old value. Row 6, and `readAll`, gave `prefix_digest_mismatch`.
  - An append was then accepted (successor length 14,507,581), and reopen gave `durable_log_mismatch`.

## 3. What the design and the requirements say

### Status of the sources

**M05_S06.** The brief calls its row ratified. The document's status line reads "proposed Gate 1 bounded-repair subject; not operative realization authority until direct F_H accepts the exact reviewed commit and tree" (`T/design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:3-4`, unchanged since `3f80ba239`) [read].
- Gate 1 accepted candidate `3f80ba239` on 2026-08-01 (`.ai-workspace/comments/codex/20260731T171805Z_DECISION_accept_s06_gate_1_authorize_increment_0a.md`) [read]. The document at that commit had no `DurablePrefixCoordinate` row [run: grep].
- The byte sentences came later [run: `git blame`, `git log -S`]:
  - `378c7f084` (2026-08-02): `:739-742` and `:843-844`.
  - `f6ec72bb6` (2026-08-07): introduced "byte mismatch refuses before append/read result", and wrote `:626-627`, `:718-722` and `:1004-1007`.
  - `2d72e8cc9` (2026-08-07): last edited `:357`, and wrote `:606-614`, `:649-652` and `:1841-1849`.
- I found no acceptance record for those commits under the names I searched: DECISION and ACCEPT files in `.ai-workspace/comments` dated 2026-08-01 to 08-19 [run]. I did not read every comment of that period.

**The other side is also later than its documents' acceptance** [run: `git log -S`; read]:

| Source | Status line | Paragraph cited and when it was added |
|---|---|---|
| Constitution | "Operative local realization authority" (`:3`) | `:865-882`, added in `ad2a39f40` (2026-09-23), the same commit that removed the store's whole-log reads and its identity-and-length check |
| D4/D5 | "Accepted HOW" (`:3`) | `:294-299`, added in `11e03718d` (2026-09-23), after the design's acceptance record of 2026-09-11 |
| W2_R2 | its successor "awaits independent implementation review" (`:3`) | `:89-97`, added in `462de346f` (2026-09-23) |

**Test precedent** [read]. Commit `811bb8f85` (2026-10-27) retired held-store arms in two lanes, citing D4/D5 and W2_R2:
- "A held open store's derivation is current by its own head and is not rehashed" (`T/test_env/tests/t288-initial-cursor-entry.test.mjs:11-14`).
- "the held-store arms of the superseded cut, in which held, active and transactional reads re-authenticated the bytes under an external same-length mutation, append, truncation or inode replacement, and an in-action overwrite was caught by a post-append byte check" (`T/test_env/tests/t287-authenticated-owner-values.test.mjs:92-95`).

Those retired byte re-authentication on reads and a byte check after the append. Neither is a stat check before the write.

### The sentences

Columns:
- **About**: "caller" means a coordinate a caller supplies; "retained" means the store's own retained state against its file; "both" means both.
- **Threat**: "stale" means a caller presents a stale or forged coordinate; "writer" means another process writes despite the lock; "corruption" means storage corruption.

| Where | Sentence | About | Threat | Store today |
|---|---|---|---|---|
| M05_S06 `:357` | "successor constructed from verified committed bytes inside the durable append rollback boundary" | retained | writer, corruption | successor from the retained hash; no byte read (`:2427-2428`) |
| M05_S06 `:357` | "closed-shape, self-digest, file-URL, identity, contract, length, or byte mismatch refuses before append/read result" | both | stale at reads; writer and corruption at append | cold reads refuse all of these (1.9). An append compares the coordinate with the retained coordinate only (1.3) |
| M05_S06 `:359` | "stale named predecessor refuses without append" | caller | stale | holds, in memory (`:2325-2326`) |
| M05_S06 `:365` | "stale/unverifiable predecessor refuses without successor" | caller | stale | holds, in memory (`:4405-4408`) |
| M05_S06 `:372-373` | "verified before transition and immediately before initiated append \| stale/mismatch refuses"; "prefix or stale-preappend refusal returns no successor" | caller | stale | holds |
| M05_S06 `:454-455`, `:540` | "compare exact durable coordinate immediately before append"; "stale coordinate refusal; no append" | caller | stale | holds, in memory |
| M05_S06 `:606-611` | "a pure historical read requires the same stable device/inode before and after reading, `fileSize >= prefixLength`, the selected event contract, and `prefixDigest` equal to the hash of exactly the first `prefixLength` bytes; a later suffix is permitted" | caller | stale, corruption | holds (1.9) [run] |
| M05_S06 `:612-614` | "a held-store append/close check or authority-only reopen requires the same descriptor/path device/inode, the selected event contract, and exact-tail equality `fileSize === prefixLength`, then hashes all named bytes." | retained | writer, corruption | reopen does all of it [run]; append and close do none of it |
| M05_S06 `:625-627` | "`appendDurablyBatch` constructs and validates a non-empty commit's successor only after write, `fsync`, length check, and byte check, but still inside the same rollback-protected `try`." | retained | writer, corruption | no length or byte check after the write. A check placed inside that `try` would reach the truncate at `:2437` (finding F2) |
| M05_S06 `:649-652` | "It does not accept or verify a `DurablePrefixCoordinate`, file identity, descriptor, or physical tail." (the expected-prefix helper) | caller | stale plan | holds |
| M05_S06 `:702-706` | reopen "verifies its canonical path, device, inode, event-contract digest, exact-tail `fileSize === durableByteLength`, and digest of all named bytes" | caller (authority) | writer between sessions, corruption | holds [run] |
| M05_S06 `:718-720` | close "verifies descriptor/path identity, reads exactly the held durable length, verifies the bytes and event contract" | retained | writer, corruption | none of it (1.10) |
| M05_S06 `:739-741` | "Immediately before append, Event Store verifies that the held descriptor, device/inode, durable byte length/digest, and event-contract digest equal expectedPredecessor. A mismatch returns the existing typed prefix refusal and appends nothing." | both | stale; also writer, if "held descriptor" means the file | compares the caller's coordinate with retained values in memory; reads nothing from the descriptor |
| M05_S06 `:843-844` | "a stale coordinate fails at the Event Store comparison immediately before append." | caller | stale | holds |
| M05_S06 `:1004-1007` | "Immediately before an initiated append, Event Store must verify that the supplied `AbgEventStore`'s durable coordinate still equals `predecessorPrefix`; mismatch uses the existing prefix refusal and appends nothing." | both | stale | holds, in memory |
| M05_S06 `:1064-1066` | "On exact-prefix or stale-preappend refusal, the owner cannot assert current durable coordinates and returns `successorPrefix: null`" | caller | stale | holds |
| M05_S06 `:1841-1844` | D18 "validates the supplied predecessor against the held store in exact-tail mode: descriptor/path identity and contract match, `fileSize === predecessorPrefix.prefixLength`, and the complete named-byte digest matches." | both | stale, writer, corruption | in memory (`T/code/src/hog/entry.ts:136`) [read]; no stat, no bytes |
| M05_S06 `:2002`, `:2018-2019` | "`successorPrefix` is not the held store's exact physical tail" → diagnostic; "verifies … is the held store's exact physical tail" | both | stale | in memory |
| M05_S06 `:347-349` | "process-local state may retain only descriptor, lock, byte-count, and next-envelope mechanics needed to guard an append" | retained | none named | the store also retains a running hash, row locations and a body cache. The cache answers held reads after an outside change (§2) |
| Constitution `:865-874` | "A held ABG event store exclusively owns its event log until ownership is released or poisoned. … Ordinary held reads, callbacks, transaction returns, handoffs and close consume that correspondence and check the selected causal predecessor against owner state; they do not authenticate historical file bytes again. Outside edits during that ownership are unsupported." | retained | writer, corruption: declared unsupported | holds |
| Constitution `:876-882` | "The owner advances the existing physical SHA-256 byte digest from its committed continuation and the exact encoded suffix … Successful native writes and fsync require no separate physical readback under this operating model." | retained | none | holds (`:2396-2405`, `:2427-2431`) |
| Constitution `:884-886` | "mutation and require-current reads still bind the owner's current committed predecessor" | both | stale | holds, in memory |
| Constitution `:890-891` | "External reads without applicable owned facts and cold reopen retain full physical/history/profile validation." | caller | stale, corruption | holds [run] |
| Constitution `:905` | "… and unsupported outside-edit scope remain." | retained | writer | — |
| D4/D5 `:294-299` | "Dispatch and realization each check the acquired source's path, device, inode and current length for replacement, advancement or truncation. This currentness check is not authentication and cannot establish a caller-supplied proof. The trusted-desktop boundary does not require rehashing unchanged prior bytes for hostile same-length mutation. Cold/copied ingress still authenticates through the reader" | both | writer (replacement, advancement, truncation); hostile same-length mutation excluded | `assertDurableRuntimePrefixCurrent` applies this rule to copied coordinates; the append path does not |
| W2_R2 `:32` | "The trust boundary is the existing trusted desktop … Hashes detect crossing and inconsistent reconstruction; they do not authenticate a hostile same-user caller" | caller | stale (forged) | — |
| W2_R2 `:89-97` | "… permits existing trusted-desktop path/device/inode/extent currentness instead of rereading all unchanged bytes. Raw/copied/foreign values still reconstruct and authenticate cold. Owned append, interruption, lock and close remain with their existing resource owner; no same-length hostile mutation hardening is added to a single trusted developer laptop." | both | hostile same-length mutation excluded | holds |
| Recovery design `:52` | "One trusted operator reserves the maintenance interval, establishes origin/interruption/quiescence and starts no competing writer/recovery." | retained | writer (a premise) | — |
| Binding `:73` | "Expected-prefix append; no in-place semantic rewrite." | both | — | — |

Files: the constitution is `T/design/ABI5_REALIZATION_CONSTITUTION.md`. D4/D5 is `T/design/T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md`. W2_R2 is `T/design/T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN.md`. The recovery design is `T/design/T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md`. The binding is `T/design/ABI5_STDO3_COMPUTATIONAL_BINDING.md`.

**Requirements.** I searched `specification/requirements` for: `byte mismatch`, `bytes differ` or `bytes change`, `changed log`, `stale coordinate`, `stale prefix` or `stale predecessor`, `in-place`, `append-only`, `tamper`, `outside edit`, `foreign suffix`, `truncat` [run]. No requirement states what a byte mismatch at append must cause. These bear on it:

| Where | Sentence | About | Threat | Store today |
|---|---|---|---|---|
| `abg/REQ-R-ABG3-EVENTS.md:16` | EVENTS-001: "`emit()` shall remain the only lawful write path. The event stream shall be append-only." | retained | writer | the store's own writes append; it does not notice other writes before appending on top of them |
| `abg/REQ-R-ABG3-EVENTS.md:60` | EVENTS-024: "… durable replay-log append shall occur as part of event-sink acceptance before the next effectful runtime step observes downstream state…" | retained | writer | in changes 5, 6 and 8 the store accepts and returns a successor while the log at the path does not hold the row readably [run] |
| `abg/REQ-R-ABG3-PROJECTION.md:24` | PROJECTION-004: "If replay cannot determine admitted runtime state … the event/projection model is constitutionally incomplete." | — | — | after changes 1 to 4 and 6 to 8, replay of the path refuses [run] |
| `abg/REQ-R-ABG3-SUPERVISOR-WITNESS.md:52` | WITNESS-016: "… insertion, removal, or reorder inside an attested span is tamper-evident under cross-process re-derivation from the log alone." | caller (cold re-derivation) | writer, corruption | cold re-derivation refuses every change except the identical-copy replacement [run] |
| `gtl/REQ-L-GTL3-C-ALGEBRA.md:200-206` | "## Operating Trust Boundary … The current product is a single-developer desktop tool. … This requirement does not require tamper-proofing against hostile in-process code, reflected private fields, forged local objects, filesystem attackers, or cryptographic artifact substitution." | both | excludes filesystem attackers | — |
| `product/REQ-P-PUBLIC-CONTRACTS.md:319-322` | PUBLIC-CONTRACTS-014: "… does not require … hostile-local tamper system." | — | — | — |
| `product/REQ-P-QUAL.md:374` | QUAL-065: "… shall not require hostile-local tamper resistance…" | — | — | — |
| `specification/INTENT.md:320-321`, `specification/PRODUCT.md:1637-1638` | out of scope: "hostile-workstation resistance" | — | — | — |

Reading: the requirements ask for no byte check at append, and they exclude hostile tampering. EVENTS-001 and EVENTS-024 are what changes 3, 4, 5, 6 and 8 put at risk, because there the store acknowledges an append the log does not hold where the store says it is. None of those changes needs hostility: a tool that saves by rename, a `cp` over the file, a script that rewrites the log, or a second process with another `TMPDIR` produces them.

## 4. What a check before the append costs

**Basis** [run]:
- File: `/private/tmp/abg-td80-work/rc12/live-rc12.source.jsonl`, a copy of `/private/tmp/abg-td77-work/live-rc12.events.jsonl` (same SHA-256 `440994c04f0b…`). 14,506,732 bytes, 1,695 rows; the largest row is 3,189,373 bytes.
- The page cache was warm.
- Each check: one untimed run, then 30 timed runs. Appends: 40 per entry on a reopened copy.
- Script `/private/tmp/abg-td80-work/probe/probe-rc12.mjs`; output `/private/tmp/abg-td80-work/probe/out/rc12.json`.

| Measured | Median | p90 | Growth as the log grows |
|---|---|---|---|
| One append today, expected-prefix entry | 13.98 ms | 20.38 ms (min 5.36) | constant; fsync dominates |
| One append today, durable-prefix entry | 14.24 ms | 19.96 ms (min 5.06) | constant |
| fsync alone: 830-byte rows to a scratch file, two runs of 60 (`probe/fsync-time.mjs`) | 8.58 ms and 4.08 ms | range 3.5 to 26.8 ms | constant |
| Identity, length, modification and change time: fstat of the descriptor plus stat of the path | 0.0036 ms | 0.0097 ms | constant |
| Last row (822 bytes) hashed, plus the stat | 0.0072 ms | 0.0135 ms | grows with the last row: a 3.19 MB row would take about 2.7 ms at the slope below (computed, not run) |
| 64 KiB tail window hashed, plus the stat | 0.042 ms | 0.053 ms | constant |
| 1 MiB tail window hashed, plus the stat | 0.685 ms | 1.432 ms | constant |
| Whole retained length hashed in 64 KiB reads, plus the stat | 13.55 ms | 15.89 ms | linear: 0.78 to 0.92 ms per MB on 1 to 512 MB files [run]; about 1.7 s per append at 2 GB (computed) |
| Cold reopen (whole-file decode), for comparison | 831 to 1,013 ms (three runs); 1,670 ms in part B | — | linear |

The brief also asks about a retained incremental digest kept with the file's identity, length and modification time. Its cost is the stat row. The store already keeps the running hash and extends it on every append (`:2396`, `:2403`, `:2431`; constitution `:876-879`), so only the stat is new [read; run].

**Which check notices which change** [run]. These are the bounded checks on the five-row store, each evaluated after each change and before any append. 1 means the check still matches retained state, so the change goes unnoticed; 0 means it notices.
- ID: device and inode of the path and the descriptor
- SZ: size
- MT: modification time in nanoseconds
- CT: change time in nanoseconds
- HL: SHA-256 of the last row
- HW: SHA-256 of the last two rows
- HF: SHA-256 of the whole retained length

| Change | ID | SZ | MT | CT | HL | HW | HF |
|---|---|---|---|---|---|---|---|
| 1 earlier row, in place | 1 | 1 | 0 | 0 | 1 | 1 | 0 |
| 1b byte 0 via `writeFile` | 1 | 1 | 0 | 0 | 1 | 1 | 0 |
| 2 last row, in place | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 3 truncation | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 4 foreign bytes | 1 | 0 | 0 | 0 | 1 | 1 | 1 |
| 5 identical copy | 0 | 1 | 0 | 0 | 1 | 1 | 1 |
| 6 changed copy | 0 | 1 | 0 | 0 | 1 | 1 | 0 |
| 7 in place, time put back | 1 | 1 | 1 | 0 | 1 | 1 | 0 |
| 8 second writer | not evaluated; its append grew the file from 2,451 to 3,275 bytes before the store's next append [run], so SZ notices it | | | | | | |

- **ID+SZ** notices 3, 4, 5, 6 and 8.
- **ID+SZ+MT** adds 1, 1b and 2.
- **ID+SZ+CT** and **ID+SZ+HF** notice 1 through 7.
- HL and HW add only change 2 to ID+SZ.

CT reads 0 for changes 5 and 6 partly because the probe kept a hard link to the old inode, and linking changes that inode's change time. ID notices both changes anyway [run; read].

**Growth** [computed from the measured slope and the file's row lengths, run]. A whole-prefix hash before every append grows with the square of the log over its life. Had every row of the rc.12 log been its own append, those hashes would have read 15.18 GB, about 12.9 s in all. The stat check stays at a few microseconds per call at any size.

## 5. The gated case `owner-history-logical-digest`

**Today** [run]:
- With `ABI5_EVIDENCE_ROOT` only, the case skips; its gate is `ABI5_OWNER_HISTORY` (`T/test_env/tests/t288-logical-prefix-digest.test.mjs:11`).
- With `ABI5_OWNER_HISTORY=/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/event-memory-repair-35/owner-history.logical.jsonl` it fails: "Missing expected exception." at `:41:10`; tests 1, pass 0, fail 1 (`/private/tmp/abg-td80-work/probe/out/t288-with-input.tap`).
- The "Shows today" column comes from a replica with the same calls in the same order that records each operand instead of asserting it (`/private/tmp/abg-td80-work/probe/probe-t288.mjs`, output `/private/tmp/abg-td80-work/probe/out/t288-replica.json`).

| Line | Assertion | Bare `assert.throws`? | Shows today [run] |
|---|---|---|---|
| `:18` | `'store' in acquired` | — | a new empty store |
| `:20` | empty digest equals `sha256Canonical([])` | — | true |
| `:24` | digest equals canonical `readAll` | — | true; this also fills the body cache |
| `:25` | four digest calls are equal | — | true |
| `:26` | `p0Work` counters | — | skipped: `globalThis.p0Work` is undefined |
| `:28` | scoped digest kept, full digest changed | — | true |
| `:29` | stale digest refused, with matcher `/exact expected/`; file unchanged | no | a real refusal, "runtime event append requires the exact expected immutable prefix"; the action did not run |
| `:31-35` | inner compare-and-append refused, with matcher `/exact expected/`; outer `/rollback selected/`; digest restored; file unchanged | no | real |
| `:36` | third successor; digest equals canonical `readAll` | — | true |
| `:38` | scoped digest equals canonical `readScope` | — | true |
| `:39` | byte 0 set to `[` by `writeFile`: same inode, same length | — | — |
| `:40` | `assert.throws(()=>store.admitRuntimeEventTransactionAtDurablePrefix(s,third.successorPrefix,()=>assert.fail('physical drift reached effect')))` | yes | **vacuous.** The entry accepted and the action ran; the action's own AssertionError, "physical drift reached effect", satisfied `assert.throws`. The action admits nothing, so no append happens: a check only inside `appendDurablyBatch` could never make this line refuse. |
| `:41` | `assert.throws(()=>store.admitRuntimeEventTransactionAtExpectedPrefix(s,s.digest(),()=>store.admitRuntimeEvent(s,candidate('physical-refusal'))))` | yes | **fails.** The append was accepted, the file grew by 854 bytes, and a cold read of the successor gives `prefix_digest_mismatch` |
| `:41`, rest | `s.readAll().length === 3`; file equals `changed`; `writeFile(path, committed)` | — | not reached. In the replica `readAll` gave 4 rows with row 1 from the cache, and the file no longer equalled `changed` |

What the case must assert under each option. In every option both entries need a message matcher and a flag showing whether the action ran.

- **(a) restate only**:
  - The byte-0 arm asserts that both entries accept and the action runs.
  - The expected-prefix entry returns a successor; a cold read of a copied successor refuses with `prefix_digest_mismatch`; reopen with the close handoff refuses with `durable_log_mismatch`.
  - Writing the original byte back with a positional write makes the successor read cold again [run, `probe-restore.mjs`]. `writeFile(path, committed)` must not be used for this: it would cut off the new row.
- **(b1) identity and length**:
  - The byte-0 arm is as under (a).
  - Add a length-changing arm (truncate, or append foreign bytes) and a replacement arm. In each, both entries refuse before the action, with the new message; the flag stays false; the file is unchanged by the refused call.
- **(b2) plus modification time**:
  - The byte-0 arm refuses at both entries before the action, with the new message, and the file still equals `changed`.
  - `readAll().length === 3` then holds, but it reads the cached old row 1, so the case should not present it as a physical check.
  - After `writeFile(path, committed)` the store still refuses, because the time has changed; the case must close and reopen to go on.
- **(c) whole log**: the byte-0 arm is as under (b2), with a digest-mismatch matcher. Writing the bytes back makes the store accept again.

The physical arms need no owner history: only `:21-28` use the `run_segment_opened` template [read]. They can run ungated in every suite run.

One other lane bears on this [read]. `T/test_env/tests/t287-conformance-owner-reuse.test.mjs:355-358` asserts that a held artifact truth's `requireCurrent` check accepts a same-length overwrite: "Hostile same-size overwrite is not a new duty." That agrees with (a) and (b1). Under (b2) the append would be stricter than this check. I found no lane that changes a held store's log and then expects an append to succeed [run: grep of the test tree for writes to event-log paths found 34 write sites; I read each in context].

## 6. The options

| | (a) Restate the row | (b1) Identity and length before the write | (b2) (b1) plus modification time | (c) Whole log before each append |
|---|---|---|---|---|
| Source lines | None in code. Restate M05_S06 `:357`, `:612-614`, `:625-627`, `:718-720`, `:739-741`, `:1841-1844` to what the store does | A helper like the removed `assertDurableSinkUnchanged` (at `ad2a39f40^`, lines 1801-1831): fstat of the descriptor and stat of the path; regular file; device and inode against retained; size against `durableByteLength`. Called (i) in `runRuntimeEventTransaction` before the action (`:4477-4484`) when the store has a log, covering both transaction entries before any staging; (ii) in `appendDurablyBatch` after `:2376` and before the `try` at `:2408`, covering every door and keeping a refusal away from the truncate at `:2437`. Optionally (iii) in `heldRuntimePrefixState` (`:2319-2329`), so the checked-artifact door refuses with `prefix_mismatch` as M05_S06 `:739-741` asks, not `sink_unavailable` (`:4419-4420`). Restate the M05_S06 sentences to identity and length | As (b1), plus a retained `mtimeNs`, captured at creation and reopen, after each own `fsync` (`:2414`) and after each rollback (`:2437`) | Before the write, hash the first `durableByteLength` bytes and compare with the retained digest. Until `ad2a39f40^` the store did more: `assertHeldEventStoreAtDurablePrefix` hashed the whole file (lines 1855-1863 there), the durable-prefix entry decoded it again (line 3196), and `appendDurablyBatch` hashed it again for the successor (line 1973) [read] |
| Cost per append | 0 | two calls of 3.6 µs median: about 7 µs, against 14 ms per append (0.05 %); constant | same as (b1) | 13.55 ms at 14.5 MB, about the append itself; 0.78 to 0.92 ms per MB; about 1.7 s at 2 GB; quadratic over a log's life |
| Caught before the append (§2 numbering) | none | 3, 4, 5, 6, 8 | 1, 1b, 2, 3, 4, 5, 6, 8 | 1 through 7 with ID+SZ; 8 through SZ |
| Refused later | reopen: all (`durable_log_mismatch`, `sink_unavailable`); cold reads: all except a foreign suffix under the pre-change coordinate; uncached held reads: the changed row; whole-log reader: all except 5. Change 5 is refused at reopen and through every coordinate the store issued, but a reader of the path sees a valid five-row log without the acknowledged row. Cached rows keep returning old values | 1, 1b, 2 and 7 as under (a); the store's row lands where recorded, and undoing the edit restores the log [run] | 7 as under (a) | — |
| Sentences satisfied | Constitution `:865-882`, W2_R2 `:89-97`, C-ALGEBRA `:200-206` | the same, plus D4/D5 `:294-299` (the same currentness rule: "path, device, inode and current length for replacement, advancement or truncation"), and EVENTS-001 and EVENTS-024 for changes 3 to 6 and 8 | as (b1), and M05_S06 `:357` for changes 1, 1b and 2 | M05_S06 as written |
| Sentences to change | M05_S06 rows as listed. It leaves EVENTS-024 exposed in changes 5, 6 and 8 | M05_S06 `:357` (byte), `:612-614` ("then hashes all named bytes", for append and close), `:625-627` (no check after the write; the check sits before the `try`), `:718-720` (close derives from retained state), `:1841-1844` (no named-byte digest) | as (b1), apart from `:357` for in-place changes. It departs from the D4/D5 rule and from `assertDurableRuntimePrefixCurrent`, which accept same-length changes | Constitution `:876-882`; register boundary of TD-50 and TD-51 |

The register's own "restate" branch says "an append checks the store's own identity and length". The store has not done that since `ad2a39f40` [read; run]. That branch is therefore (b1), not (a).

### Recommendation: (b1)

1. It refuses an append exactly when the append itself would lose the row or record it at the wrong offset: changes 3, 4, 5, 6 and 8 [run]. In the same-length changes the row lands where recorded, and undoing the outside edit makes the whole log readable again, the new row included [run]. Those changes are what the constitution calls unsupported, and reopen and cold reads still refuse them.
2. It is the currentness rule that the accepted D4/D5 design and the store's own `assertDurableRuntimePrefixCurrent` already apply, so the store keeps one rule [read].
3. It puts back a check the store had from `21166b118` (2026-07-24) to `ad2a39f40^` (2026-09-23). That check was removed together with the whole-log reads, which were the real cost [read].
4. It costs about 7 µs per append and does not grow with the log [run].
5. Placement matters:
   - The check must also run at a transaction's start, before the action. A durable-prefix transaction whose action admits nothing, as `:40`'s does, never reaches `appendDurablyBatch`. A check only there could not refuse the length-change and replacement arms at that entry, and in other transactions it would let the action run before the refusal.
   - Inside `appendDurablyBatch` it must run before the `try`, or a refusal reaches the unconditional truncate (finding F2).

(b2) adds the same-length changes at no extra cost. It makes the append stricter than the currentness rule used everywhere else, and it needs the retained time captured again after every own write and rollback. Choose it only if the Executive wants the byte-0 arm of the gated case to keep its original meaning. Do not use change time: chmod, chown, extended-attribute writes and hard links also change it, so a metadata touch by a sync or indexing tool would abort a Run. That is general file-system behaviour; I did not run it on this host.

(c) is what the store paid until 2026-09-23, and the TD-50 and TD-51 boundary rules it out.

### What I am unsure of

- **Acceptance of the M05_S06 sentences.** If the 2026-08-02 and 2026-08-07 sentences were accepted somewhere I did not search, then (b1) changes a ratified row rather than restating a proposal. The constitution and D4/D5 paragraphs of 2026-09-23 have the same open question: I found no separate acceptance record for them either.
- **The race.** A check before the write leaves a window of microseconds between the stat and the write. Only a lock closes that window, and the lock fails across `TMPDIR`s (F1).
- **Effects inside transaction actions.** I do not know whether production transaction actions perform external effects before the append. If they do, the check before the action matters beyond the test.
- **Call frequency.** If the check also goes into `heldRuntimePrefixState`, I do not know how often production calls it.
- **Time resolution for (b2).** This volume records nanoseconds [run: the times differed in every changed cell]. A coarser file system could let a write in the same tick pass.

## Findings outside the row

- **F1. The lock does not span `TMPDIR`s** [read `:1597-1601`; run].
  - The lock directory is under `tmpdir()`. A second process with another `TMPDIR` reopened the held log and appended, and both processes wrote ordinal 4 (§2, change 8).
  - The brief's own test command sets `TMPDIR`.
  - The recovery design requires "the existing identity-scoped lock namespace" (`T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md:54`), so moving the lock is a design change.
  - I suggest it as its own register candidate, not part of TD-80.
- **F2. The rollback truncates without looking** [read `:2434-2441`; not run].
  - Any failure after the `try` begins truncates the file to the retained length.
  - After a foreign suffix or a second writer, that deletes the other writer's acknowledged bytes and the store's own row. After a truncation behind the store, it leaves part of the store's row: a torn row.
  - Until `ad2a39f40^` the rollback first checked that the suffix was exactly its own attempt (`exactDurableAppendAttemptSuffix`). Otherwise it poisoned ownership without truncating (lines 1977-1992 there).
  - M05_S06 `:625-627` puts "length check and byte check" inside this `try`, which is where a check is unsafe today.
  - Under (b1) the check sits before the `try`, which narrows the hazard to changes made during the action and the write.
- **F3. The register's Retire text overstates the read side** [run].
  - It says an in-place change "is refused at the next read of those bytes and at reopen".
  - A cached row returns its old value, and `readAll` returned all rows with no refusal (every warm cell in §2; rc.12 row 7).
  - Any restated row should name only the refusal points of §6 (a).

## What I did not check

- Timings with a cold page cache. Every timing above had the file in memory.
- The number of append calls per Run. One append per row, used for the quadratic total, is an upper bound.
- Whether the M05_S06 sentences of 2026-08-02 and 2026-08-07 were accepted outside the files I searched.
- The recovery path `recoverInterruptedEventStore` (`:4102-4215`) under these changes. I only read it; its lock path is at `:4132`.
- Any of (b1), (b2) or (c) in code. I changed no source. The behaviour stated for them is read from the predecessor code or derived from the check matrix.
- Change-time false positives on this host.
- Whether production transaction actions perform external effects before the append.
- The whole suite. To find lanes a change would break I read the 34 sites where a lane writes to an event-log path. I ran no lane other than t288.
- Other operating systems and file systems.

## Scratch

`/private/tmp/abg-td80-work` is 178 MB and `/private/tmp/abg-td80-tmp` is 2.2 MB (`du -sh`, run 2026-11-12 21:47, after the last probe). Nothing was deleted.
