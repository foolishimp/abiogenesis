# Review: RC6 as the builder of RC7, operational profile

Commentary, not law. Reviewer: Claude Fable 5.1 (same model family as the
native actor; this is not the independent assessment the release needs).
Pen stays with Codex. No Product file was changed. Nothing is pushed.

## Subject and pins

| Item | Value |
| --- | --- |
| RC6 source | `e7179b19b50c3b2f918e59425667ed79239e4a68` (worktree `abiogenesis-rc6-local-cut` at `1f62c0095`) |
| RC6 archive | `sha256:e9ffe45c…73c4`, 5,325 members, installed under `release-qualification-rc6-01/runtime-001/sandbox/installed/abg/node_modules/@abiogenesis/typescript-tenant` |
| Campaign | `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/` |
| Event log | `runtime-001/resources/events/runtime.events.jsonl`, 1,016,286,093 B, 170,487 rows, 17.9 h, 14 lifecycle call windows, 12 Runs |
| Owner scope record | `ROOT_RC7_OVERHEAD_SELECTION.json` (2026-11-06T02:04Z): overhead and duplication removal is in the RC7 release set, not deferred |
| Codex attribution records | `d5-author-02/{TIMING_BREAKDOWN,READBACK_LATENCY_OWNER_OBSERVATION,REMAINING_CARRIAGE_OWNER_MAP,RESULT_CARRIAGE_OWNER_OBSERVATION}.json`, `d5-author-03/LAUNCH_TIMING.json` |
| abiogenesis main at review | `228f6b96a` |

Question asked by the owner: analyse RC6 end to end while it builds RC7; red
flag duplicated data, bloated code, and long framework durations between LLM
calls; identify code that fits a distributed graph but not a single-process
builder.

## Verdict

No. RC6 runs the RC7 build correctly, but operationally it is not a
single-address-space builder. Every public call still treats the 1 GB log as
an untrusted remote resource: it reopens it cold, re-parses every row,
re-canonicalizes and re-hashes every row, and folds the whole history, and a
single `run_result` read construction does that work twice. Per Run the
framework spends 500–730 s outside the LLM actor, and 47% of the log is
copies of one 14.7 MB worksite context. Codex's own records already select
the carriage repair and name the readback intervals; the two things they left
unmeasured, CPU attribution and a whole-log census, are measured below and
point at the same owners. The owner's hypothesis holds: the store identity,
re-authentication, liveness-probe and envelope machinery are correct for
multiple writers over a network and are pure cost for one writer on one disk.

RC6 did close one RC5 lead: the liveness fold is incremental
(`abg/calculus/liveness.ts` `advance()` processes only new rows; `forkAt`
layers on a base). The profile confirms it at 9.7% of a cold read, not the
RC5 O(N²) lead.

## Executed and inspected

Executed, this review:

- whole-log census by kind, bytes and ordinal windows (Python over the live log, read only);
- per-lifecycle-call window table: actor, pre-actor, between-actor, post-actor seconds inside the log;
- CPU profile of the operator's in-process read construction (`constructInstalledRunReadCall`) against a byte-identical 1 GB copy with a re-stamped close handoff (device, inode) in the scratchpad, `node --cpu-prof`;
- CPU profile of the installed CLI cold `run_result` read on the same copy, same request shape as `operator-client/runner.mjs` issues;
- subtree digest walk of the 44 MB `run_result` projection;
- source census on the RC6 worktree: lines per directory, largest files, exported symbols referenced only in their own file, declared versus admitted event kinds, subsystem term counts.

Inspected only: the code paths named per finding. Not done: no provider call,
no RC7 source change, no matched A/B, no build.

## End-to-end execution of one native Run

Operator sequence per Run (`operator-client/runner.mjs`, `public-setup.mjs`,
installed `public/cli.js`), with the owner that does the work:

| Phase | What happens | Whole-log passes | Measured |
| --- | --- | --- | --- |
| preflight | fresh process reopens the store, decodes and folds the log | 1 | 38.6 s, 46.5 s, 59.5 s (author-01/02/03) |
| host start → dispatch | `caller.refresh()` = `projectOwnedPrefixArtifactTruth` over the whole prefix, plus `eventResourceIdentity` sha256 of the file | 1 + 1 hash | 42.5 s, 55.0 s |
| dispatch → actor start | `lifecycle-start` CLI reopens cold (`reopenEventStore` → `decodeRuntimeHistoryDescriptor`), admits basis (14.3 MB row) and binding (14.4 MB row) with per-event fsync | 1 | 46.7 s, 59.0 s |
| actor | native Claude Code process; one stdout event plus one probe event per stdout chunk, two fsync'd transactions each | 0 | 788–6,076 s |
| actor exit → outcome | result admitted (43–44 MB row), judged, run closed | 0 | 42.6 s |
| outcome → `run_result` subprocess | `caller.refresh()`, `eventResourceIdentity`, `constructInstalledRunReadCall` (two decodes and two folds, measured 142 s) | 3 + 1 hash | 215 s |
| `run_result` CLI | cold reopen, decode, fold, serialize 44 MB to stdout | 1 | 55.6 s, 85.7 s, 63.9 s |
| between reads | second `constructInstalledRunReadCall` for `run_replay` | 2 | 162 s |
| `run_replay` CLI | same as `run_result` | 1 | 55.7 s, 86.4 s, 65.7 s |
| close | compare projections, write `execution.json`, `fresh-reads.json`, resume files | 0 | 3 s |

About eleven complete passes over the log per Run, none of them needed by
the actor. Framework share per Run (host wall plus preflight minus actor):

| Run | Actor | Framework | Framework share | Log at start |
| --- | --- | --- | --- | --- |
| d5-author-01 | 2,682 s | 500 s | 15.7% | 0.52 GB |
| d5-author-02 | 6,076 s | 729 s | 10.7% | 0.72 GB |
| d5-author-03 | 788 s | 691 s | 46.7% | 0.91 GB |

Inside the log the framework is invisible: pre-actor 1–3 s, post-actor
8–35 s per call window, 6.0% of logged window time in total. The 500–730 s
sit between calls, in the operator's own process and in cold CLI processes,
which is why log-side timers understate it. The 215 s and 162 s intervals
that `READBACK_LATENCY_OWNER_OBSERVATION.json` left unattributed are the two
in-process read constructions (142 s each measured here) plus refresh and the
whole-file hash.

The 23,726 s, 2,962 s and similar gaps between call windows are Root
deliberation between activations, not framework, and are out of scope.

## Where the framework time goes: cold read profile

In-process `constructInstalledRunReadCall` (what the operator runs before
each of the two reads), on the 1 GB copy:

| Measure | Value |
| --- | --- |
| wall / CPU | 141.9 s / 173.3 s (user 162.9, system 10.4) |
| peak RSS / heap | 5.76 GB / 4.79 GB |
| `populateRunReadAtDurablePrefix` | 131.5 s |
| ├ `prepareRunReadAtDurablePrefix` → `prepareRunRead` | 67.6 s |
| │ ├ `canonicalRunContext` → `runContext` | 40.1 s |
| │ └ `prepareRead` → `readOwnedRuntimeEventPrefixAtDurablePrefix` | 27.5 s |
| └ `projectOwnedPrefixArtifactTruth` → `deriveExactPrefixArtifactTruth` | 63.8 s |
| &nbsp;&nbsp;├ `projectValidatedPrefixArtifactTruth` → `projectArtifactTruth` | 37.0 s |
| &nbsp;&nbsp;└ `projectOwnedRuntimeEventPrefixAtDurablePrefix` → `projectOwnedRuntimeHistoryAtDurablePrefix` | 26.8 s |

One call construction decodes the whole prefix twice (27.5 s and 26.8 s) and
folds it twice (40.1 s and 37.0 s). The two halves are separate owners
(`product/project_read_ports.ts` and `abg/artifact_truth.ts`) that each
insist on their own validated prefix.

Installed CLI `run_result` on the same copy: 68.8 s wall, 78.4 s CPU, 4.04 GB
RSS, 44,169,486 B on stdout. `reopenEventStore` → `decodeRuntimeHistoryDescriptor`
26.6 s (38.7%), `projectOwnedPrefixArtifactTruth` 33.7 s (49.1%).

Self time, both profiles:

| Function | In-process | CLI |
| --- | --- | --- |
| `writeCanonicalJson` (`shared/canonical_json`) | 28.8% | 30.2% |
| sha256 `update` (`node:crypto`) | 22.8% | 24.4% |
| garbage collector | 6.6% | 3.9% |
| deep equality (`shared/equality.ts:15`) | 5.3% | 5.9% |
| `deepFreeze`, `defineMember`, `admitRecord` (JSON admission) | 4.6% | 4.4% |
| liveness fold (`livenessReconstruction`/`advance`) | 9.7% incl. | 8.6% incl. |

Half of every cold read is re-canonicalizing JSON the store already wrote in
canonical form and re-hashing bytes whose digest is already in the row
(`payloadDigest`, `eventContractDigest`, prefix digest). The owner is
`decodeRuntimeHistoryDescriptor` (`abg/event_store.ts` ~3700–3770): per row
`JSON.parse`, `canonicalJson`, byte compare, `projectRuntimeEventAtContract`,
sha256. This is the right check for bytes received from another machine. For
a file this process wrote, fsync'd and locked, a prefix-digest check at open
plus per-row parse is sufficient; the per-row re-canonicalization proves
nothing the digest chain does not already prove.

## Where the bytes go: log census

| Kind | Rows | Bytes | Share |
| --- | --- | --- | --- |
| `runtime_activity_probe_observed` | 85,005 | 359.7 MB | 35.4% |
| `c_call_result_admitted` | 68 | 310.0 MB | 30.5% |
| `actor_process_stdout_observed` | 84,498 | 157.6 MB | 15.5% |
| `basis_admitted` | 22 | 80.4 MB | 7.9% |
| `abg_admitted_body_reference_record` | 53 | 70.9 MB | 7.0% |
| `actor_transport_binding_admitted` | 14 | 19.7 MB | 1.9% |
| all 31 other kinds | ~800 | <2% | |

Context carriage per native Run (one 14.7 MB worksite context of 407 files,
base64 inline, from `product/worksite_operations.ts` `observeWorksiteContext`):

| Copy | Row | Owner |
| --- | --- | --- |
| 1 | `basis_admitted.payload.rawInputValue.context` | `abg/instruction_assembly.ts` (contextView requires inline bytes) |
| 2 | `abg_admitted_body_reference_record` for the binding, 12.1–14.8 MB, five rows | `abg/event_body_encoding.ts`: `native_definition_material` slot excludes `rawInputValue`, so the body stays inline |
| 3 | `actor_transport_binding_admitted.instructionAssembly.envelope.nativeBasis` | `abg/actor_process.ts` |
| 4 | `c_call_result_admitted.value.task.context` | `product/native_workspace_work.ts` |
| 5 | `c_call_result_admitted.value.before` ≡ `task.context` (digest-equal) | same, constructor `before: task.context` |
| 6 | `c_call_result_admitted.value.after` (389 of 407 entries unchanged per Codex) | same |

Six copies, about 88 MB per Run, in a log that grows 87–198 MB per Run. The
remaining growth is probes and stdout chunks. Probe rows carry a 355 B
payload inside a ~1.5 KB envelope (14 envelope keys, three of them digests);
the envelope is 75% of each probe row.

Public read result (`run_result`, 44.2 MB): `terminalResult.value` = `task`
14.71 MB + `before` 14.71 MB + `after` 14.74 MB; everything else in the
projection is 0.8 KB. The read answers "what did the Run produce" with three
copies of the input and no selector to ask for less. The operator then stores
each 44 MB result twice (`execution.json` 190–215 MB, `fresh-reads.json`
145–178 MB per Run) and keeps ~30 resume files of 72.5 MB each, in which the
verified artifact (14,358,279 B) appears three times and `publicContracts`
(3.03 MB) at least five times.

Setup and verification carriage: `nativeDeclarationEvidence.sources` holds
325 `.d.ts` source texts (9.58 MB) inside every verified-artifact object and
`isVerifiedProductArtifact` (`product/verify_product.ts` 395–470) re-hashes
every source text on each validation; the 22 MB catalog rides in every
lifecycle request (51 MB request line). Setup: artifact verification 188 s
plus SDK setup 229 s.

Durability: `admitRuntimeEventInternal` calls `appendDurablyBatch(state,[event])`
once per event, so the campaign ran about 170,000 fsync transactions, two per
stdout chunk (`abg/actor_process.ts` `onStdoutObserved` → stdout event, then
`runtime_liveness.ts` probe). Stdout chunk inter-arrival p10/p50/p90 =
43/51/252 ms, 44.8% under 50 ms; whether the 50 ms floor is provider cadence
or the two synchronous fsyncs is not separated here.

## Code that fits a distributed graph, not a single-process builder

| Mechanism | Where | Why it is cost here |
| --- | --- | --- |
| Store identity by device and inode, lock file `tmpdir()/abiogenesis-event-store-locks-v5/<dev>-<ino>.lock`, `event_store_reopen_authority`, identity re-check after lock | `abg/event_store.ts` 1547, 1636–1700, 2016–2083 | Guards against a second writer. The builder is the only writer, and holds the file for the process lifetime |
| Cold re-authentication at every process boundary: full decode, re-canonicalize, re-hash | `event_store.ts` 2111–2260, 3700–3770 | Right for bytes from a peer. Here the peer is the same process a minute ago |
| Liveness probe as a durable event per output chunk | `abg/runtime_liveness.ts` 105, 170, 342; `actor_process.ts` 1380–1520 | Heartbeats exist so a remote scheduler can detect a dead actor. The parent owns the pipe and the pid |
| 14-key envelope with `basisId`, `causationEventRefs`, `correlationId`, `eventContractDigest`, `payloadDigest`, `scopeClass`, `workflowVersion` on every row | `event_store.ts` ROOT_EVENT_CONTRACTS | Replication metadata; 75% of a probe row |
| Context, basis and binding carried by value in every hop | `instruction_assembly.ts`, `event_body_encoding.ts`, `native_workspace_work.ts` | Value carriage is how you ship state to a node without the file system. The actor reads the same disk |
| Public reads return full projections by value across stdout | `public/installed_definition_call_transport.ts`, `installed_public_definition_call.ts` | A remote client needs the value. The operator is on the same disk with the same library loaded |
| Consensus 2,234 lines / 11 files, retry 2,311 lines / 57 files (`abg/retry.ts` 5,816), peer 1,355 / 147, transport 997 / 70, lease 416 / 37 | `gtl/consensus.ts`, `abg/retry.ts`, `hog/retry_lifecycle.ts`, `abg/transport_contracts.ts` | 21 of 57 declared root event kinds were never admitted in 17.9 h: no retry, fan-out, continuation, FH interaction, lease or reprice events. The subsystems are present and unexercised |

Source census (RC6 `build_tenants/abiogenesis/typescript/code/src`):

| Measure | Value |
| --- | --- |
| lines | 169,081 (abg 73k, product 42k, gtl 16k, hog 9.6k) |
| largest files | `abg/c_call.ts` 7,563; `abg/retry.ts` 5,816; `abg/traversal_route.ts` 5,802; `gtl/consensus.ts` 5,267; `abg/event_store.ts` 4,488 |
| exported symbols | 3,857; 679 referenced only in their own file, of which 576 referenced nowhere and 103 only by tests |
| worst files for dead exports | `abg/governed_context.ts` 37, `abg/retry.ts` 32, `validator/qualification_contracts.ts` 27, `product/project_read_ports.ts` 19 |
| declared root event kinds never admitted | `actor_process_spawn_failed`, `actor_process_termination_unconfirmed`, `assessed`, `child_preparation_refused`, `construction_continuation_opened`, `construction_delta_observed`, `construction_intent_selected`, `continuation_abandoned`, `continuation_reentry_link_admitted`, `continuation_superseded`, `declaration_reprice_admitted`, `defect_intake_admitted`, `fan_out_completion_admitted`, `fh_interaction_opened`, `fh_interaction_responded`, `fh_interaction_resume_admitted`, `replay_log_attested`, `retry_attempt_opened`, `retry_progress_recorded`, `run_resumed`, `workspace_hygiene_stamped` |
| design surface | 321 files, 12.8 MB |

The export census matches identifiers by name across files, not by compiler
reference; treat the 576 as candidates, not a deletion list.

## Findings

Severity: S0 blocks any use, S1 must change before RC7 can claim the
single-address-space consolidation, S2 release-set defect, S3 debt, S4 note.

| # | Sev | Finding | Owner | Smallest lawful re-entry |
| --- | --- | --- | --- | --- |
| F1 | S1 | One read construction decodes and folds the whole log twice; one Run performs about eleven whole-log passes. Framework 500–730 s per Run, growing with the log | `product/project_read_ports.ts` `prepareRunRead`/`canonicalRunContext`; `abg/artifact_truth.ts` `projectOwnedPrefixArtifactTruth`; `operator-client/runner.mjs` 261–273; `public-setup.mjs` 127–134 | design_reframe: one open store per builder process, one fold, reads served from the held history; the two projections share one validated prefix |
| F2 | S1 | Read-side re-canonicalization and re-hashing is 52–55% of cold-read CPU, proving what the row digests and prefix digest already prove | `abg/event_store.ts` `decodeRuntimeHistoryDescriptor`, `readAuthenticatedRuntimePrefixBytes` | realization_refactor: verify the prefix digest once at open; parse rows without re-canonicalizing; keep byte-level proof for the cross-machine `replay_log_attested` path only |
| F3 | S1 | Six copies of the 14.7 MB context per Run (47% of the log); `before: task.context` is a literal duplicate; the binding's body-reference record still carries the body | `product/native_workspace_work.ts` 148–180; `abg/instruction_assembly.ts` 1000–1060; `abg/event_body_encoding.ts` `native_definition_material`; `abg/actor_process.ts` | design_reframe already selected by `ROOT_RC7_OVERHEAD_SELECTION.json`: carry the context once by reference, `before` as the basis reference, `after` as changed entries plus physical identities |
| F4 | S2 | One probe event per stdout chunk: 85,005 rows, 35.4% of the log, two fsync'd transactions per chunk | `abg/actor_process.ts` `onStdoutObserved`; `abg/runtime_liveness.ts` 105, 170 | design_reframe: liveness is a property of the held child process; sample on a timer or at turn boundaries, not per chunk; stdout chunks batch per turn |
| F5 | S2 | Per-event fsync, about 170,000 in the campaign | `abg/event_store.ts` `appendDurablyBatch` called from `admitRuntimeEventInternal` with a one-element batch | realization_refactor: batch by transaction (the admit API already takes a batch) |
| F6 | S2 | Public reads return 44 MB by value with no selector; operator stores each twice and keeps 30 × 72.5 MB resume files with triple and quintuple copies | `public/installed_definition_call_transport.ts`; `runner.mjs`; `public-setup.mjs` | design_reframe: result projection returns references plus the 0.8 KB terminal route; bodies on demand by digest |
| F7 | S2 | Verified artifact carries 325 `.d.ts` texts (9.58 MB) and re-hashes them per validation; catalog 22 MB per request; `publicContracts` ×5 in resume; setup 417 s | `product/verify_product.ts` 395–470, 2200–2400; `product/catalog.ts`; `product/declaration_exports.ts` | realization_refactor: evidence by digest, sources on disk; validate once per process |
| F8 | S3 | Device/inode identity, tmpdir lock, reopen authority and full re-authentication for a file with one writer | `abg/event_store.ts` 1547–1700, 2016–2083 | design_reframe with F1: ownership held for the process lifetime; digest ancestry as a log property, not a per-process re-proof |
| F9 | S3 | Unexercised subsystems and 576 unreferenced exports; `retry.ts` 5,816 lines with no retry event in 17.9 h | `abg/retry.ts`, `gtl/consensus.ts`, `hog/retry_lifecycle.ts`, `abg/governed_context.ts`, `validator/qualification_contracts.ts` | realization_refactor: delete or quarantine behind an explicit distributed profile; the owner's standing rule is discharge, not record |
| F10 | S2 | Data volume at 99%, 25 GiB free. Campaign dirs rc3 25.9 GB, rc4 19.4 GB, rc6 9.2 GB, sas 6.8 GB, rc2 6.3 GB, rc5 3.4 GB; RC6 worktree 54 GB of `tmp*` directories | operator | owner decision: prune or archive before the next 1 GB campaign |

F1–F3 together are the single-address-space consolidation the RC6 cut claims
and the campaign does not show. F4–F7 are the bloat the owner asked for by
name. F8–F9 are the distributed-graph residue.

## Relation to Codex's records

Already recorded by Codex and confirmed here: result carriage (three bodies,
389/407 unchanged), binding carriage lead (14.4 MB row, `event_body_encoding`
slot), readback subprocess times (85.7 s, 86.4 s), the 215 s and 162 s
unattributed intervals, and the owner selection that keeps overhead in RC7.

New here: whole-log census (probes 35%, results 30%, stdout 16%); the double
decode and double fold inside one read construction (142 s); CPU attribution
of a cold read (canonical JSON plus sha256 = 52–55%); per-Run framework share
(10.7–46.7%); per-event fsync and probe-per-chunk as owners of 51% of the log;
the unexercised-kind and dead-export census; the disk state.

No new store, serializer, event stream or validation layer is proposed; every
re-entry above lands in an existing owner, as the selection requires.

## Limits

- Same-family review. No independent assessment is established.
- Profiles ran on a byte-identical copy with a re-stamped device/inode handoff under `--cpu-prof`; absolute times carry profiler overhead, the shares do not depend on it. Codex's live timers are within the same range.
- Framework share uses Codex's host and preflight timers (`HOST_RESULT.json`, `LAUNCH_TIMING.json`) and my log windows; no matched A/B.
- Export census is name-based. Term counts count lines containing the word, not semantic ownership.
- The 50 ms stdout floor is not attributed between provider cadence and the two synchronous fsyncs.
- Gaps between lifecycle calls (392–23,726 s) are Root deliberation and were not analysed.
- No provider call was made. No credential was read.
