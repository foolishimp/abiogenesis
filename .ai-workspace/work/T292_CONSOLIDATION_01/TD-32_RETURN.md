# TD-32 Return: event profile residue, and L stores reprice before they append

Writer: Claude Opus 5.5. Branch `claude/td32-event-profile-residue` from local `main` at `e9d870c02`, worktree `/private/tmp/abg-td32`. Part A is a realization_refactor; part B is a requirement_reprice (the owner's decision in "Decisions for the owner": L stores reprice before appending, and the L writer branches retire). No push, no tag. Here `T` is `build_tenants/abiogenesis/typescript` and the evidence root is `/Users/jim/src/apps/abiogenesis/.ai-workspace`.

**Status: complete, with 8 items for a ruling (section 13). One arguable stop was restated under B6 instead of handed back, and a ruling is asked:** `t287-historical-source-resource` case 3 is a case of an artifact-truth lane that went from pass to fail, which the rules name a stop. No reader changed; the failing step was the case's own append onto L. Deviation 4, ruling item 8. No other stop condition is met.

- Part A: residue removed, renames made with byte-identical values, the home-path input gated, `c_call_open` dropped, W pinned by a lane, profile census done.
- Part B: one door at `appendDurablyBatch` refuses every append to a store on L except its witnessed reprice, before a byte is written. The actor's L writer branches are deleted. Readers are unchanged.
- Results: replay and artifact truth are byte-identical over the 11 TD-25R logs, the 18 L actor logs and the rc.12 store. Capability graph rows are identical. Every lane keeps its per-case outcome except the carrier's new case. Three test cases were restated (section 7).

Commits, in work order:

| Commit | Content |
| --- | --- |
| `d491b419b` | census skeleton |
| `fcb4007d2` | part A |
| `824122e47` | recorded history |
| `f921a1c1b` | specification |
| `7c817ac64` | design |
| `1e1f3b0a7` | code |
| `e929c74d1`, `9965a3104` | tests |
| `963bb4ac8` and the commit holding this text | the completed Return |

## 1. Census

### 1.1 Recorded history read for the census

Every `*.jsonl` under the evidence root: 4,350 files. First and last line of each were read. 892 have a runtime event as the first line; 3,339 are other JSON lines (call records, transcripts); 77 have a first line that is not JSON (pretty-printed requests, placeholder text); 42 are empty. Coverage is complete for first and last rows; no middle row was read for this table. A log whose last row is the profile boundary counts as on the profile the boundary names.

### 1.2 Profile census (A6)

| Profile | Reference string | Digest | Pinned or computed | What selects it in code | Logs, first row | Bytes |
| --- | --- | --- | --- | --- | ---: | ---: |
| L | none (L rows carry no stamp) | `sha256:fc3a635040a6e3d763740ae54b6390944c7ea8cedfa060de110cb36e31ca6e3c` | Pinned (`LEGACY_ROOT_EVENT_CONTRACT_DIGEST`, `event_contract_profiles.ts`); the table is checked at load (`event_store.ts`, `legacyDescriptorDigest`) | A row with no `eventContractDigest` (`runtimeEventProfile`); a coordinate or reopen authority naming the L digest; `constructRootEventContractProfiles` entry `legacy` | 228 | 298,924,725 |
| RC6 | `abg.event-contract.root/p5-run-environment-role-context@1` | `sha256:5b35ab536188aea5b822c4cdf8e962bbaf0fb609fc6da9e6b554187e8a7e0537` | Pinned (`INSTALLED_RC6_EVENT_CONTRACT_DIGEST`); the table built by `stampedRootEventContracts(true)` must reproduce it at load | A row or coordinate stamped with the digest; entry `installed_rc6` | 57 | 4,690,120,753 |
| S2 | `abg.event-contract.root/p5-run-environment-role-context@1` | `sha256:3bcc8488bcfb9396cbc53c85b944df6973bf99200ab93728949853df62cecac0` | Pinned (`FROZEN_S2_EVENT_CONTRACT_DIGEST`); the table built by `stampedRootEventContracts(false)` must reproduce it at load | A row or coordinate stamped with the digest; entry `frozen_s2` | 2 | 6,996,150 |
| W | `abg.event-contract.root/p6-stdout-window-witness@1` | `sha256:51299706fecc4485b039a4169e7b50b30dc04c447fb5cbf3f7366c9caef782cf` | Computed from `ROOT_EVENT_CONTRACTS` at load (`ROOT_EVENT_CONTRACT_DIGEST`); not pinned | Every new store (`createNewEmptyAppendSink`, the module-private `AbgEventStore` constructor) and the reprice target (`admitRootEventProfileUpgrade`); entry `window`, the only one with `current: true` | 26 | 396,654,231 |

Every log keeps the profile of its first row to its last row, except 4 L logs whose last row is a profile boundary (section 1.6) and one `6c8a` log whose last line is not an event. The two S2 logs are `work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-overhead-author-01/affected-proof-001/stage/.../maintained-setup/.../runtime.events.jsonl` and `work/T287_RELEASE_RESUMPTION_01/release-qualification-rc6-01/rc7-held-session-author-02/blocked-testing-diagnostic-001/runtime.events.jsonl` (the second is one of the 11 replay logs).

Digests that no profile selects (first row; each such log keeps that stamp to its last row, except one whose last line is not an event):

| Digest | Logs | Bytes |
| --- | ---: | ---: |
| `sha256:6c8a985284f6976b9a41ad70791c119c7f05cfa75808c0820e162a587441ae64` | 161 | 17,613,199,663 |
| `sha256:4196aaeb231aaf98b5d3da74c9d7eddaff17140cab0e6af5cfd94e3bd17590f0` | 278 | 974,274,367 |
| `sha256:ddc961a2484be150193fa255d7dc7b933e52fb81b7b2c681f2bb97e1f9d5754c` | 19 | 507,059,551 |
| `sha256:a25d2268d4b5fec1467292e36ea68e562f4e166f01d4ffb82da0da52e585d4f3` | 30 | 89,491,300 |
| `sha256:e1160ac7abd48e7de540ceacece2dd9310a022e58157232d437c80a9a19e5a25` | 56 | 82,873,418 |
| `sha256:3e8f2d4cb80c3c263c44fdadf6c23a46a5c510c3466f1f2cf31fe6016e01cc6a` | 34 | 56,042,516 |
| `sha256:f4ff80a5960993dba447e74571ea7f2564c153a75e4d0c54b543011b8c47b842` | 1 | 845 |
| Total | 579 | 19,322,941,660 |

These logs are unreadable by the current build (read: an undeclared stamp refuses at reopen with `contract_mismatch` and at cold read in `nextRootEventProfile`). The review's E2 names the `6c8a` logs (rc4); the others are likewise stamps of earlier current tables that changed without being retained (inferred). Nothing is deleted on the strength of this table.

W-stamped logs (A5; first and last row both W in every case): 26 logs, 396,654,231 bytes, all under `work/T287_RELEASE_RESUMPTION_01/`: `rc10-retention-01` (3), `rc11-effect-phase1-01` (4), `rc11-effect-phase2-01` (7), `rc11-qualification-01` (7, of which 5 under `evidence-generation-0{2,3,4}/raw`), `rc8-reference-preservation-01` (2, one of them 207,795,189 bytes), `rc9-owner-reuse-01` (1), `release-qualification-rc6-01/rc7-carriage-measurement-01` (2). The rc.12 demonstration store used for the artifact-truth check (`/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`, outside the root) is also W.

### 1.3 Append census (B1)

Every durable append passes through one private function, `appendDurablyBatch` (`abg/event_store.ts`), called by `admitRuntimeEventInternal` (outside a transaction), `admitRuntimeEventBatch` (outside a transaction) and `runRuntimeEventTransaction` (at commit). An in-memory store (`durableLogPath === null`) stages without it; every in-memory store is created on W. Public entries of the store and their callers (20 files, 86 call sites outside the store):

| Entry | Callers | On a store on L today |
| --- | --- | --- |
| `admitRuntimeEvent` | `actor_process`, `c_call`, `closure`, `construction_continuation`, `continuation`, `execution_basis`, `fan_out`, `graph_application`, `invocation_admission`, `open_call`, `retry`, `runtime_failure`, `runtime_liveness`, `traversal_cursor`, `traversal_route`, `witness_admission_operation` | Projects the row at the active profile (`projectRuntimeEventAtContract` against the L table) and appends it unstamped. A kind absent from L (`construction_continuation_opened`, `runtime_activity_probe_observed`, `runtime_external_interruption_observed`) or a payload outside its L variant refuses at projection. |
| `admitRuntimeEventTransaction*AtDurablePrefix`, `admitNonEmptyRuntimeEventTransactionAtDurablePrefix` | `actor_process`, `c_call_outcome`, `continuation`, `execution_basis`, `invocation_admission`, `runtime_liveness` | Stages the action's rows at L and commits them through `appendDurablyBatch`. |
| `admitRuntimeEventBatch`, `compareAndAppendExpectedPrefix` | `traversal_route`, `execution_basis`, `child_lifecycle`, `retry`, `product/result_assessment_operation` | Same as `admitRuntimeEvent`, as one batch. |
| `appendCheckedArtifactEvent` | `environment_admission` (Product install, workspace bind, release snapshot, materialize) | Appends the `public_operation_artifact_admitted` row unstamped; any throw returns `event_store_append_refusal` `sink_unavailable`. |
| `admitNativeRuntimeLivenessEvent` | `runtime_liveness` (probes, thresholds, stdout window probes) | Refuses: "liveness admission requires one held current-profile owner context". |
| `admitRootEventProfileUpgrade` | `witness_admission_operation` (the profile reprice) | The reprice; see below. |

Writer branches that exist for a store on L (each keys on the store's profile):

| Site | Branch on L | Shape it writes on L |
| --- | --- | --- |
| `actor_process.ts:951` `configuredIdentity` | null off W | Binding without `configuredIdentity` |
| `actor_process.ts:962` binding body | omits `livenessBinding` off W | L binding row (RC6 and S2 require `livenessBinding`, so on them the row refuses before spawn) |
| `actor_process.ts:1119` `currentProfile` | the predicate the sites below read | |
| `actor_process.ts:1153` `probe` | returns without a probe | No probe rows |
| `actor_process.ts:1273` `stdoutByteLength` | the running per-chunk counter | Artifact byte count from chunks |
| `actor_process.ts:1290` artifact payload | the full observation body | L artifact with the lifecycle copies (`timedOut`, `exitObserved`, `terminationConfirmed`, `signalSequence`, ...) |
| `actor_process.ts:1295` artifact probe | none | |
| `actor_process.ts:1303` native assessment and supervision wakeup | not passed to the transport | Legacy transport timers; no threshold rows |
| `actor_process.ts:1336` start probes | none | |
| `actor_process.ts:1342` stdout windows | no classifier, no window binding | Per-chunk stdout through `onStdoutObserved` (`actor_process.ts:1345-1379`, with `streamOrdinal`, `stdoutEventRefs`, `observedProgressCount`, `observedFinalOutput`) |
| `actor_process.ts:1393` stderr ordinal | the local counter | |
| `actor_process.ts:1483` consumed stdout refs | the per-chunk refs | |
| `worker_transport.ts:801-803` "Legacy transports retain their exception contract" | rethrows the first callback error when no assessor is passed | See section 6 |
| `c_call.ts:6815` probabilistic evidence | lifecycle copies when `lifecycleCopies !== false` (L and RC6) | Evidence row with the copies |
| `c_call.ts:6543` undispatched evidence | requires a stamped profile, so L refuses | (a refusal, not a writer) |
| `runtime_liveness.ts:71`, `:87`, `:144` | frame clock, frame sample and CCall progress return on a non-W row | No liveness side rows (also for RC6 and S2) |
| `runtime_liveness.ts:320` | probes refuse on a non-W prefix | (a refusal) |

Readers of what an L store holds (kept): `transport_contracts.ts` (`RETIRED_ACTOR_LIFECYCLE_COPY_KEYS`, `projectDurableActorObservation`, `durableActorObservationOfArtifact`), the L table and its load check, `c_call.ts:1983`, `:1984`, `:1988`, `:2039`, `:2133`, `:2440`, `worksite_construction_recovery.ts:261`, `qualification_proof.ts:609`, `retry.ts:4018`, `:4362`, `calculus/*`, `runtime_history.ts`, `witness_definition_bindings.ts:162-163`, `:336`.

Rows the reprice appends to a store on L, in order (`admitRootEventProfileUpgrade`, one transaction):

1. `public_operation_admitted`, workspace scope, `operationId: "abg.operation.witness.admit"`, `memberKey: "reprice"`, unstamped (L).
2. `declaration_reprice_admitted`, workspace scope, `declarationRef: "declaration://abiogenesis/runtime/root-event-contract-profile@1"`, `beforeDigest` L, `afterDigest` W, `changeClass: "design_reframe"`, `reason: "admit-current-native-event-contract-profile"`, evidence naming `abg.event-contract.root/p6-stdout-window-witness@1` at W; unstamped (L). This row is the boundary. Inside the transaction, after both rows are staged, the store's active profile becomes W; the commit writes both rows and publishes a W coordinate; a rollback restores L.

`assertRootEventProfileBoundary` refuses the reprice while an actor invocation has no terminal row, or while a leaf `c_call_fibre_selected` has neither `c_call_judged` nor a `run_stopped` of its Run.

### 1.4 Who creates a store on L (B2)

By reading: `createNewEmptyAppendSink` and the `AbgEventStore` constructor set the active profile to W; `new_abg_event_resource` (the only Public way to a new store) calls `createNewEmptyAppendSink`. A store is on L only when an existing L log is reopened (`reopenEventStore`, the `reopen_abg_event_resource` acquisition, `recoverInterruptedEventStore`), or in a test stand-in (`witnessMechanics({legacyProfile:true})` writes an L seed with `projectRuntimeEventAtContract`; `t287-lifecycle-failure-carrier` mocks an L prefix). The packed product ships `build/**`, `contracts/**` and the manifest and no event history; `workspace.create#imported` adopts a directory, not an event log. No kept flow (install, setup, workspace bind, catalog admission, a default-library Run) creates or continues a store on L.

By one run (`/private/tmp/abg-td32-work/scripts/b2-new-store.mjs` on the base build): a new sink's prefix, its first admitted row, the row as stored, its close handoff and a new Public event resource are all stamped `sha256:51299706…` (W). The lanes `r2-clean-install` and `r3-workspace-binding` create their stores the same way and pass.

### 1.5 `c_call_open` in recorded data (A4)

No recorded runtime row carries the stage value. An exact `"c_call_open"` occurs in 2 files under the evidence root, both outputs of the review's own census (`work/TECH_DEBT_REGISTER_02/census/out/kinds.json`, `kinds-never-produced.json`). 3,684 files hold copies of the declaration text of the stage union (`"c_call_open" | "hog_traversal" | ...` inside embedded `.d.ts` source in proof and basis records). The matches in `T/test_env/proof` and `T/test_env/fixtures` are `c_call_opened` and `c_call_open_refusal`, other values.

### 1.6 Recorded L stores (B7)

228 logs under the evidence root start on L. 4 end at a profile boundary to `4196aaeb` (an undeclared digest), so they are not on L and are already unreadable: the four `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-0{1,2}/effects/witness-*/events.jsonl` (3 rows each). 224 end on L (298,899,125 bytes):

| State | Logs |
| --- | ---: |
| No Run (workspace setup, install or witness rows only) | 80 |
| Every Run finished | 115 |
| Every Run finished, but a leaf CCall of a failed Run has no judgment (the reprice refuses today) | 1 |
| A Run open: two-row witness scratch stores (`basis_admitted`, `run_segment_opened`) | 26 |
| A Run open with an unjudged leaf (the reprice refuses today) | 2 |

Every one of the 224 is a recorded copy inside a review or evidence directory (`comments/codex/...`, `work/T287_*/...`): proof fixtures (85 copies of `abi5-root-r10.events.jsonl`, each a finished Run), installed-proof attempts, sandbox runs inside archived worksite commands, and witness scratch. None is a workspace's live store. The two open stores with an unjudged leaf are byte-identical copies of the D2 installed-continuation store (913 rows, 19,058,361 bytes; `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/events-01/runtime.events.jsonl` and `.../installed-witness-continuation-13/execution-01/runtime-events-913.jsonl`); the first is the input of gate `d2-continuation-09-store-late-child-proof`. The full list is Appendix A.

## 2. Recorded history

What retires is the writing of new rows to a store on L; the rows L writers already wrote stay readable. Their recorded values are the rows of the L writer branches (section 1.3). Every row before a boundary of the 228 logs that start on L was read (298,924,725 bytes, no cap): 18 logs (157,773,582 bytes; `comments/codex/20260911_D2_BOUNDED_REPAIR/**` and archived `steel-serial-branch` and `steel-single-start` attempts) hold 89 actor invocations written on L, that is 89 bindings without `livenessBinding`, 2,159 per-chunk `actor_process_stdout_observed` rows, 89 `actor_result_artifact_observed` rows carrying the lifecycle copies and 89 actor terminals. No L log holds an `actor_process_timeout_observed` row. `T/test_env/proof/abi5-root-r10.events.jsonl` (L, 20 rows, a finished Run) holds no actor invocation; `T/test_env/proof/abi5-m5-live-fp.json` lists the kinds of a live run (it is not a log, and no file imports it); `T/test_env/fixtures` holds no runtime log.

Every one of these rows is read by a reader that stays (section 5). On the base build the 18 logs decode, replay (whole-log replay digest and per-Run replay) and project artifact truth (`artifact_truth_projection` for all 18); section 10 repeats both on the final build. No stop: no kept flow produces a store on L (section 1.4), and no reader is removed.

## 3. Specification

The requirements that state the event contract are in `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`; the witness reprice is stated as an act in `REQ-P-POLICY-035` and `REQ-P-PUBLIC-CONTRACTS` (`abg.operation.witness.admit` members), and the reprice-before-continuing rule of the witness requirements agrees with the change. No kept requirement says that a store on L continues to take work; `specification/PRODUCT.md` names no event profile.

One edit, `REQ-R-ABG3-EVENTS-029` (identifier unchanged; no requirement removed). Sentences added after "…not a substitute.":

> A store holds its events under one event-contract profile, a version of this contract. A store on the legacy profile (the unstamped base table) moves to the current profile only by the witnessed reprice that records the profile boundary, and it admits no other append: every other operation that would append to it shall be refused, before anything is written, until the store has been repriced. A store on the legacy profile is read and replayed like any other store.

`specification/GOALS.md:887` ("existing witnessed stop under L before P") is a dated work-wave record, not a requirement; it is listed and left (section 13). The contract mirror `T/contracts/qualification/sources/REQ-R-ABG3-EVENTS.md` is staged only by an explicit `--stage-authorities` action and is not edited (TD-27 precedent).

## 4. Design

Part A (citations of the renamed symbols): `T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md` §2, `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md` (the p4 sentence now says no retained profile carries that ref or its digest D4) and `T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md` §6.1.

Part B, restated mixed passages (each replaced passage cut verbatim to the note's `history/<NAME>__RETIRED_SECTIONS.md`, with a first line naming the note, commit `f921a1c1b` and the lines):

| Note | Lines cut | Restated to |
| --- | --- | --- |
| `T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md` §4 | 170-177, 188-192 | the reprice transaction (`admitRootEventProfileUpgrade`, `assertRootEventProfileBoundary`, called from `admitWitnessedAct`); a store with a live or incomplete dispatch is not repriced and its stop or continuation is refused at the door; a store on L admits no append other than the reprice (`appendDurablyBatch`), and the owner reports the thrown refusal through its existing refusal (`sink_unavailable` for the witness owner and `appendCheckedArtifactEvent`) |
| `T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md` §6 | 259-265, 267-272 | probes only at the current profile (`admitNativeRuntimeLivenessEvent`); recovery (`recoverInterruptedEventStore`) adopts an L store without appending; a run-stopped witness on L is refused like any other append |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` E-A, E-E, Deletion | 872, 878, 907-910 | the per-chunk transport path serves raw transport callers (`runWorkerTransport`); the actor dispatches only on the current profile and always declares windows; recorded L per-chunk rows are read as recorded |
| `T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md` §3 item 3 | 85 | the binding records `configuredIdentity`; the actor dispatches only on the current profile; recorded L and RC6 bindings carry none; S2 and W variants (`configuredIdentityBindingVariants`) admit the member. New retired file and pointer line. |

No note moved. `ABI5_REALIZATION_CONSTITUTION.md` has no passage that lets a store on L take work (its profile passages, lines 880 and 891, state profile validation only); it is not edited.

## 5. Code

Part A (`fcb4007d2`), no stored byte changes:

| Rename (`abg/event_contract_profiles.ts`, `abg/event_store.ts`) | Why |
| --- | --- |
| `ROOT_CURRENT_EVENT_PROFILE_REF` → `ROOT_RUN_ENVIRONMENT_EVENT_PROFILE_REF` (value `abg.event-contract.root/p5-run-environment-role-context@1` unchanged) | it is the ref RC6 and S2 carry, not the current profile's |
| `constructRootCurrentEventContractDescriptor` → `constructRootStampedEventContractDescriptor`, `profileRef` required (default removed; every caller passes it) | it builds RC6, S2 and W |
| `CURRENT_PROBE_CONTRACT` → `STAMPED_PROBE_CONTRACT` | shared by RC6, S2 and W |
| `currentBindingVariants` → `configuredIdentityBindingVariants` | the S2 and W binding variants |
| `currentProfile` (local in `event_store.ts`) → `windowProfile`; `stampedDescriptor` takes `profileRef` as a required argument | the local holds W |
| comments on L, W, the binding variants and D5 | L is the pinned base table every stamped table extends; W is S2 plus the stdout window witness |

The unused import of the p5 ref is gone (A1); `"c_call_open"` leaves the stage union of `abg/runtime_failure.ts` (A4). The string value of every reference is unchanged, and the pinned tables load (their load checks pass on the final build; every lane that opens the store module passes).

Part A source, `git diff --numstat e9d870c02 fcb4007d2 -- T/code/src`: `event_contract_profiles.ts` +11 −7, `event_store.ts` +22 −19, `runtime_failure.ts` +0 −1 (33 added, 27 removed).

Size of the whole package, `git diff --numstat e9d870c02 HEAD` (generated files excluded): `T/code/src` +90 −119; `T/test_env` +321 −37; `T/design` +104 −34, of which +48 are the verbatim retired-section files; `specification` +7 −0.

Part B (`1e1f3b0a7`), source lines removed by file (`git diff --numstat fcb4007d2 1e1f3b0a7`; 57 added, 92 removed):

| File | Added | Removed | What |
| --- | ---: | ---: | --- |
| `abg/actor_process.ts` | 35 | 88 | The L writer branches: the null identity off W, the binding without `livenessBinding`, `currentProfile` and every branch on it (probe skip, per-chunk byte count, full artifact body, no native assessment or supervision wakeup, no window classifier or binding, the stderr local ordinal, the per-chunk consumed refs), the per-chunk stdout path (`streamOrdinal`, `stdoutByteLength`, `stdoutEventRefs`, `observedProgressCount`, `observedFinalOutput`), and the `onTimeoutObserved` writer (reached only without the supervision wakeup, that is only off W; on W the timeout row is the threshold owner's, `runtime_liveness.ts` `admitRuntimeThreshold`). Added: one profile check before the binding (section 6, ruling item 1). |
| `abg/event_store.ts` | 16 | 0 | The door in `appendDurablyBatch` and its predicate `isRootEventProfileRepriceBatch`. |
| `abg/c_call.ts` | 3 | 2 | Comment only: the lifecycle-copy evidence branch (`admitEvidenceUsingTransport`) serves RC6; on L it is now unreachable. |
| `abg/worker_transport.ts` | 3 | 2 | Comment only: the exception rule at `runProcess` serves raw transport callers. |

Kept, with the reason:

- `worker_transport.ts` "the exception contract" (`if (failed && assessNativeResultArtifact === undefined) throw firstError`) and the per-chunk `onStdoutObserved(chunk)` path: reached by every raw caller of `runWorkerTransport` (exported from `abg/index.ts`; `m5-worker-transport` drives it, including its EPIPE case), not only by the actor on L. The comment now says so.
- `c_call.ts` `admitEvidenceUsingTransport` lifecycle copies (`lifecycleCopies !== false`): an RC6 store still takes evidence through a continuation.
- `runtime_liveness.ts:71`, `:87`, `:144` (skip on a non-W row) and `:320` (probes refuse off W): live for RC6 and S2 rows.

Whole-word search on the final tree. It covers `specification`, `T/code`, `T/test_env`, `T/scripts` and `T/design`, excluding `design/history`, `build`, `test_runs`, `downstream` and `evidence`:

- Zero hits: `ROOT_CURRENT_EVENT_PROFILE_REF`, `constructRootCurrentEventContractDescriptor`, `CURRENT_PROBE_CONTRACT`, `currentBindingVariants`, `c_call_open`, `observedProgressCount`, `observedFinalOutput` and "Legacy transports".
- Remaining hits, all kept:
  - `currentProfile`: 2 hits, the parameter of the kept reader `durableActorObservationOfArtifact` (`transport_contracts.ts:79`, `:83`).
  - `stdoutEventRefs`: 2 hits, a reader's local over `consumedStdoutEventRefs` (`calculus/axioms.ts:1030`, `:1046`).
  - `onTimeoutObserved`: the transport observer interface (`worker_transport.ts:115`, `:548`) and its raw callers in `m5-worker-transport` and `t287-liveness-heartbeat`.
  - `streamOrdinal` and `stdoutByteLength`: payload member names of recorded and current rows.

Read paths that handle each deleted writer's shape (all kept):

| Deleted writer | Shape in recorded L stores | Read by |
| --- | --- | --- |
| null `configuredIdentity` | binding without the member | `c_call.ts:1798` (selection reads `identity: null`) |
| binding without `livenessBinding` | L binding | `calculus/liveness.ts:69-70` (no liveness context without a native-liveness binding); `runtime_liveness.ts:71`, `:87`, `:144` |
| per-chunk stdout | unwindowed `actor_process_stdout_observed` rows | `c_call.ts` `projectAdmittedActorTransportLifecycle` (byte sums against `stdoutByteLength`), `calculus/axioms.ts:1030` (consumed refs), `worksite_construction_recovery.ts:315-324`, `replay.ts` |
| full artifact body | artifact with the four lifecycle copies | `transport_contracts.ts` `durableActorObservationOfArtifact` and `RETIRED_ACTOR_LIFECYCLE_COPY_KEYS`, `c_call.ts:1983-1988`, `qualification_proof.ts:609`, `worksite_construction_recovery.ts:261` |
| `onTimeoutObserved` | timeout row without `thresholdObservation` (none recorded on L) | `c_call.ts` `projectAdmittedActorTransportLifecycle` (timeout rows), `calculus/liveness.ts:610`, `replay.ts:2414` |
| no probes, no windows | absence | nothing to read |

## 6. The door

One refusal, at the one durable append owner, before anything is written: `appendDurablyBatch` (`abg/event_store.ts`) throws `TypeError("a store on the legacy event profile admits no append before its witnessed reprice")` when the store's identity is on L and the batch is not the reprice pair (`isRootEventProfileRepriceBatch`: exactly two rows, the `public_operation_admitted` row of `abg.operation.witness.admit` member `reprice`, then the profile boundary caused by it). The check reads the store's durable identity, so it holds for every entry above it (`admitRuntimeEventInternal`, `admitRuntimeEventBatch`, the commit of `runRuntimeEventTransaction`), and a transaction stages, throws at commit and rolls back as any failed commit does. The door adds no code of its own: each owner reports the throw through the refusal it already returns for a failed append (ruling item 6). The reprice rows are told apart from every other batch by their kinds, the operation and member, the boundary's declaration and the causal link; an invalid profile reprice (wrong reason, missing profile evidence, an in-flight actor or leaf) is refused before the door by `assertRootEventProfileBoundary` inside `admitRootEventProfileUpgrade`, as before.

Before is the base build `e9d870c02`; after is `1e1f3b0a7`. "Lane" rows are runs of `t292-td32-legacy-store-door` (each prints a `td32_door_row`) and of `t287-lifecycle-failure-carrier` (`td32_actor_profile_row`) on both builds; the same files were copied into a base checkout for the before column. "By reading" marks a Public code derived from the source at the cited lines, not from a run (section 12, deviation 2).

| Row | Driven through | Before (base) | After | Public code after |
| --- | --- | --- | --- | --- |
| Run start (`run.invoke`) | Lane, owner: the Run opening row through `admitRuntimeEvent` on a reopened L log. The Public path's first append is `admitExactInvocation` (`abg/invocation_admission.ts:1656-1661`, one `admitNonEmptyRuntimeEventTransactionAtDurablePrefix`) at stage `invocation_admission` (`owner_bindings/run_invocation.ts:949`) | appended (an L row) | thrown, bytes and rows unchanged, the store held at its prefix | `invocation_admission_failure` (stage `invocation_admission`; `syncStage`, `owner_bindings/run_invocation.ts:214-228`, maps a throw to `<stage>_failure`); by reading |
| Run continuation (`run.continue` `current_intent`, `selected_action`, `pending_execution`) | Lane, owner: a row through `admitNonEmptyRuntimeEventTransactionAtDurablePrefix`. The Public path's first append is at stage `open_call` (`owner_bindings/run_invocation.ts:1561`, `:1624`) | appended | thrown, bytes and rows unchanged | `open_call_failure`; by reading |
| Traversal and basis batches (inside a Run) | Lane, owner: a row through `admitRuntimeEventBatch` | appended | thrown, bytes and rows unchanged | the stage of the calling Run owner (unreached on L: the Run's first append already refuses) |
| Actor dispatch | Lane: the actor effect driven over a prefix on L, RC6 and S2 | L: binding without `livenessBinding`, `actor_invocation_started`, `actor_process_started`, one spawn. RC6 and S2: the L-shaped binding row is refused by the store's own table ("current actor binding requires its closed native liveness declaration") before a spawn, `actor_process_invocation_refused` (probe `scripts/rc6-s2-binding.mjs`; the carrier's recorder applies no table) | refused at the profile check before the binding, on L, RC6 and S2: rows `[c_call_fibre_selected]`, no spawn | `actor_process_invocation_refused`, message "liveness admission requires one held current-profile owner context" |
| Public operation admission (Product install, workspace bind, materialize, release snapshot) | Lane, owner: the artifact row through `appendCheckedArtifactEvent`. Public paths by reading: `admitArtifact` (`abg/environment_admission.ts:1078-1087`) returns `coordinate_refused` | appended | `event_store_append_refusal` `sink_unavailable`, message "TypeError: a store on the legacy event profile admits no append…", bytes and rows unchanged | install `product_install_coordinate_refusal` (`product/install_definition_bindings.ts:324-327`); bind `workspace_binding_coordinate_refusal` (`product/environment_definition_bindings.ts:728-731`); materialize `product_materialization_artifact_refused` (`product/materialization_definition_bindings.ts:420-421`); release snapshot `release_artifact_failure` (`product/release_snapshot_definition_bindings.ts:104-107`); by reading |
| Catalog admission (`catalog.admit`) | By reading: no append; the owner completes the resource at its entry prefix (`product/catalog_definition_bindings.ts:592`, `:606`, `:635`) | no append | unchanged: no append, no refusal | none (unchanged) |
| Public read (`project.read`) | Lane `t287-cross-cut-public-read` (Public reads over the D2 L store) and by reading: no append (`abg/project_read_definition_bindings.ts:266`) | 5/5 | 5/5, unchanged | none (unchanged) |
| Witness act other than the reprice: `reprice` of a declaration | Lane, Public: `runExactDefinition` over the witness binding (`support/witness-reprice-mechanics.mjs`, store on L) | admitted, exit 0, two L rows | exit 70, `sink_unavailable`, the door message, bytes unchanged, the handoff still acquirable | `sink_unavailable` |
| Witness act other than the reprice: `run-stopped` | Lane, Public, as above, on an L store holding an open operator Run | admitted, exit 0 | exit 70, `sink_unavailable`, the door message, bytes unchanged | `sink_unavailable` |
| The profile reprice | Lane, Public | admitted, exit 0; the close handoff is on W | admitted, exit 0; the close handoff is on W | none (admitted) |
| A witness act after the reprice | Lane, Public | admitted | admitted | none (admitted) |
| Recovery of an interrupted L store | Lane `t287-interrupted-event-resource-recovery` | 8/8 | 8/8 (recovery appends nothing) | unchanged |

## 7. Tests

| File | Change | Why | Before | After |
| --- | --- | --- | --- | --- |
| `t287-lifecycle-failure-carrier` | The actor drive runs on W by default (`driveActor(t, mode, stamp = W)`): the recorder stamps rows with W, the prefix is a validated prefix over the recorder rows, and the W premises are named overrides (leaf port admitted, no stdout window bound, liveness context and probe admission recording the probe signals, the raw result owner). Copy-value asserts on the artifact (the L copies) become: the artifact records no copy, and `nativeResultAssessment.disposition` is `absent`. Added asserts: the binding has a `livenessBinding`; `spawn_failed` records no probe; `termination_unconfirmed` records the start probe. New case: on L, RC6 and S2 the actor is refused before its binding or any start. | The file drove actor work on an L prefix (B6: restate) | 7/7 (new case: fails on base, the L binding is written and one process spawns) | 8/8 |
| `t287-historical-source-resource` case 3 | The D2 fixture (L) is repriced through `admitRootEventProfileUpgrade` (`repriceProfile`, two hand-built rows) before the case's unchanged later append; the ordinal assert moves from `+1` to `+3`. Case 4 (rollback) is unchanged. | Case 3 appended a synthetic `public_operation_admitted` row (`project.read`, a row no kept flow writes: a Public read appends nothing) to the L store only to obtain a later prefix. After the door it failed with the door message (3/4). B6: restate to reprice first. The 846-row prefix has no open actor or leaf, so the reprice is admitted; retention holds across the profile change (the strict-identity and count asserts pass). | 4/4 | 3/4 before the restatement, 4/4 after |
| `support/witness-reprice-mechanics.mjs` | With `legacyProfile` and `operatorRun`, the operator Run row is written raw at L with the seed (as recorded L stores hold it) instead of appended through the store. `closedRun` stays unsupported on L. | The append would be refused; only the new door lane uses this combination | n/a | used by the door lane |
| `t292-td32-legacy-store-door` (new) | The door table rows marked "Lane" above: Public witness rows through `runExactDefinition`, owner rows over a real reopened L log (each asserts the door message, bytes and rows unchanged and the prefix held), and the close and reopen of the refused store. | B6: one new lane showing the door table | 1/3 (fails: base appends) | 3/3 |
| `t287-qualification-scopes` Q23, the subcase "a legacy-profile binding" (commit `9965a3104`) | Asserted the gate's refusal `qualification dispatch refused: unknown: assessor_identity_absent` for a qualification actor on a store off W. Now asserts the profile refusal (code `actor_process_invocation_refused`, message "liveness admission requires one held current-profile owner context"), nothing admitted, no binding or start transaction, zero provider starts. The other Q23 subcases are unchanged. | The subcase dispatches an actor on a store off W, the retired shape; after B it failed on the message (23/24), since the profile check runs before the gate (deviation 3). The subcase is restated to the refusal; a reprice is not applicable to its mocked store. On W the gate's `identity_absent` stays reachable when a plan has no configured identity (`validator/qualification.ts:505`). | 24/24 | 23/24 before the restatement, 24/24 after |
| `witness-reprice-definition-binding` | Unchanged (no assertion edited) | | 15/15 | 15/15 |

Qualification inventory members changed (not edited, `T/test_env/qualification/inventory.json`): `t287-lifecycle-failure-carrier`, `t287-historical-source-resource`, `t287-qualification-scopes`, `m5-event-store-reopen` (part A gate), `witness-reprice-mechanics` (support); new files not in the inventory: `t292-td32-current-profile-pin`, `t292-td32-legacy-store-door`. `support/evidence-gates.json` gained the row `hs03-installed-rc6-owner` (part A).

## 8. Generated contracts and identity digests

Generated files (`T/contracts`, `T/product-toolchain-manifest.json`, `T/test_env/fixtures/abi5-root-candidate-basis.json`) are not committed; every commit was made with them restored to `HEAD`. Identity of each build (`npm run build`, same toolchain):

| Build | productContentDigest | contributionManifestDigest | catalogDigest | capability graphDigest |
| --- | --- | --- | --- | --- |
| Base `e9d870c02` (equal to the committed generated files) | `sha256:c2ff705eebeb47f44774f49683d4814ec8fa6ec4c621572227b8cec8f7bf62de` | `sha256:f03912364e3f0416d15645a74eb1d69b8b985ee444b15649888dd9b8c349baba` | `sha256:a51c0fa3aad607063bf405e1939c817e2eb54929e2bc4dbdbd6bc6ce96153068` | `sha256:12ef369f90f6e079ff1fade5cf19e057484c10528df92e7f664f01c1d3fc408f` |
| Part A `fcb4007d2` | `sha256:1556840043d4d72318b40da749da50f4a26e27813cd261e33b26b1ddc468850e` | `sha256:bb51b7dff2c84fa7c750120589ec67eaaee20b10f9b8041764a730dd00e84c8a` | `sha256:391231013495e09f499b49e72992b78aabee5c9d48fbfab9e414be74d16fb99c` | `sha256:262fec4ca09ff58293053a4ef30b39dbb3548bcd66f5184ef11a29da714c1f3d` |
| Part B `1e1f3b0a7` (and `e929c74d1`, `9965a3104`, tests only) | `sha256:b8f508e90b1670a8d5ea71bf71c56b83f6995d724f9d95c3ffd4f50e6570380e` | `sha256:938023ab9e6481b706a5026ba7a3bfbf7cc512d484f4f2b415f31b4fd2945a7c` | `sha256:391231013495e09f499b49e72992b78aabee5c9d48fbfab9e414be74d16fb99c` | `sha256:2d21f3bf12f4861f2149b9b1a2e9968026722d6730dc8234fbc1f978fbd075cf` |

Content changes under `T/contracts`: only `contracts/capabilities/capability-definition-graph.json` changes, and in it only digest leaves (the owning contracts' `catalogDigest` and `productContentDigest`, 241 each; the capability definition refs and digests, 16 rows and 18 dependents; `graphDigest`). Its rows (capability ids and versions, owning and dependent ids, selectors, effect and proof refs) are identical across the three builds (section 11). In the manifest, part A changes 21 `contractDigest` and 141 `declarationDigest` leaves (declarations whose source carries the stage union without `c_call_open` or the renamed symbols; inferred from the changed files, not traced leaf by leaf) and the catalog digest with them; part B changes no contract or declaration digest and leaves the catalog digest unchanged (only the product content, the 10 publication binding digests over built code, and the refs derived from them). No digest formula and no recorded ref string changes.

## 9. Lanes before and after

Each file was run alone, one at a time, from `T` with the rules' command (evidence root set). Before is the base build `e9d870c02`. After is the part B build (the source of `1e1f3b0a7`; the test files as committed at `9965a3104`). Per-case outcomes were compared by test name (`scripts/tapcmp.py`). The only difference is the carrier's new case. The restated `t287-historical-source-resource` and `t287-qualification-scopes` cases keep their names and pass. Build: `npm run build` exit 0; `lint:imports`, `lint:lifecycle` and `lint:calculus` pass ("no offender", "3 forbidden owner pair(s) hold").

| Lane | Before (tests/pass/fail/skip) | After |
| --- | --- | --- |
| `t287-default-library` | 35/34/0/1 | 35/34/0/1 |
| `t287-native-workspace-work` | 43/43/0/0 | 43/43/0/0 |
| `t287-management-supervision` | 5/5/0/0 | 5/5/0/0 |
| `t287-qualification-scopes` | 24/24/0/0 | 24/24/0/0 (23/24 before the Q23 restatement) |
| `t288-instruction-assembly-owner` | 4/4/0/0 | 4/4/0/0 |
| `t287-lifecycle-failure-carrier` | 7/7/0/0 | 8/8/0/0 (one new case) |
| `t287-held-basis-lifetime` | 2/1/0/1 | 2/1/0/1 |
| `t287-held-operation-bodies` | 1/1/0/0 | 1/1/0/0 |
| `m5-event-store-reopen` | 27/27/0/0 | 27/27/0/0 |
| `witness-reprice-definition-binding` | 15/15/0/0 | 15/15/0/0 |
| `r1-packed-artifact` | 1/1/0/0 | 1/1/0/0 |
| `r2-clean-install` | 1/1/0/0 | 1/1/0/0 |
| `r3-workspace-binding` | 1/1/0/0 | 1/1/0/0 |
| `t287-historical-source-resource` | 4/4/0/0 | 4/4/0/0 (3/4 before the case 3 restatement) |
| `r10-child-proof` | 10/10/0/0 | 10/10/0/0 |
| `t287-cross-cut-public-read` | 5/5/0/0 | 5/5/0/0 |
| `t287-selected-action-authority` | 3/2/0/1 | 3/2/0/1 |
| `t287-native-assessment-evidence` | 4/4/0/0 | 4/4/0/0 |
| `t292-td60b-evidence-gate-catalogue` | 3/3/0/0 | 3/3/0/0 |
| `m5-worker-transport` | 39/39/0/0 | 39/39/0/0 |
| `t287-f04a-probabilistic-result-candidate` | 2/2/0/0 | 2/2/0/0 |
| `t287-calculus-fold` | 25/25/0/0 | 25/25/0/0 |
| `t287-interrupted-event-resource-recovery` | 8/8/0/0 | 8/8/0/0 |
| `t287-cold-record-decoder` | 3/2/0/1 | 3/2/0/1 |
| `t287-undispatched-diagnostic` | 7/7/0/0 | 7/7/0/0 |
| `t287-exact-prefix-projection-reuse` | 2/2/0/0 | 2/2/0/0 |
| `t287-runtime-failure-diagnostic` | 21/21/0/0 | 21/21/0/0 |
| `t287-liveness-inactivity` | 3/3/0/0 | 3/3/0/0 |
| `t287-native-frame-observation` | 3/1/0/2 | 3/1/0/2 |
| `t287-runtime-activity-quiescence` | 1/1/0/0 | 1/1/0/0 |
| `m5-terminal-quiescence-owner` | 7/7/0/0 | 7/7/0/0 |
| `t287-management-context` | 13/12/0/1 | 13/12/0/1 |
| `t287-native-assembly-retained-input` | 1/1/0/0 | 1/1/0/0 |
| `t287-c2-core-environment` | 7/7/0/0 | 7/7/0/0 |
| `t287-management-stream-drain` | 7/4/0/3 | 7/4/0/3 |
| `d2-workflow-step` (consumes an L-log gate) | 8/8/0/0 | 8/8/0/0 |
| `d2-evidence-owner-lookup` (consumes an L-log gate) | 5/2/3/0 | 5/2/3/0 (the same 3 cases red on base: `h.project()` falsy) |
| `r10-projection-contracts` (reopens the S01 L store) | 11/11/0/0 | 11/11/0/0 |
| `t287-route-reconstruction` (reads the S01 L store) | 12/11/0/1 | 12/11/0/1 |
| `t292-td32-current-profile-pin` (new, part A) | n/a | 1/1/0/0 |
| `t292-td32-legacy-store-door` (new) | 1/3 with the final file on base (base appends) | 3/3/0/0 |

The 35 listed first are the brief's named lanes and the census-named files. The four marked lanes are the files outside that list whose evidence gates (`support/evidence-gates.json`) name a recorded L log; by reading, none of them appends to a reopened store. No case timed out. The rules' known reds (one case each of `t287-cross-cut-public-read` and `witness-reprice-definition-binding`) did not occur on this machine, before or after.

## 10. Replay comparison

`scripts/replay-log.mjs` (whole-log replay digest, profile schedule, kind counts, prefix digest, FH continuations and facts, and per-Run replay) was run on the base and final builds over the same inputs, and the outputs were compared byte for byte:

- TD-25R's 11 logs (`replay-logs-base.txt`): identical. 7 replay. 4 refuse identically on both builds at decode: `abi5-root-r10.events.jsonl` ("runtime event payload matches no admitted event-contract variant"), two s02 logs ("durable ABG event log contains a noncanonical event") and one s02 log ("event stamp differs from the exact native profile schedule").
- The 18 L logs holding actor invocations written on L (section 2): identical, and all 18 replay (73 to 913 rows each).

Replay shows that the readers are unchanged; it does not run the writer.

**The writer on W, rows compared.** The carrier's two W drives (`spawn_failed`, `unconfirmed`, with the carrier's named premises) were run once on the base build and once on the final build. An uncommitted copy of the file wrote each drive's rows, effect, probes and spawn count as JSON. Both runs had the same fixed scratch directory and the same minimal environment. The two outputs were compared leaf by leaf. The copies were deleted afterwards.

- The 12 rows are equal in every leaf except three groups:
  - `eventTime`;
  - the cleanup timing of `unconfirmed` (`cleanupDeadlineNs`, `cleanupElapsedMs`);
  - in `spawn_failed`, the transport archive digest (`transportDigest`, `artifactDigests.transport`) and the `payloadDigest` of the two rows that carry it.
- That archive digest also differs between two runs of the same build (base run 1 `sha256:cbf8a1f6…`, base run 2 `sha256:0c92ca70…`; final run 1 `sha256:b07eaced…`, final run 2 `sha256:8615cc82…`), so it is run noise.
- Equal on both builds: the row kinds and order; the binding's `livenessBinding`, `configuredIdentity`, `transportPlanDigest`, `environmentDigest` and every ref derived from them; the artifact payload; the effect.

Together with the rc.12 store's replay and the W lanes (section 9), this shows that an actor invocation on W writes the same rows as before. The carrier stubs its store, so this is a comparison over the actor's rows, not over a live store.

## 11. Artifact truth over recorded stores

- The five lanes, base then final: `t287-historical-source-resource` 4/4 then 4/4, after case 3's restatement (3/4 before it; deviation 4: the failing step was the case's own append onto L, not a read); `r10-child-proof` 10/10 then 10/10; `t287-cross-cut-public-read` 5/5 then 5/5; `t287-selected-action-authority` 3/2/0/1 then the same; `t287-native-assessment-evidence` 4/4 then 4/4.
- Artifact truth over a copy of the live rc.12 store (`/private/tmp/abg-td32-work/rc12-store/events.jsonl`, byte-equal to `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`; 1,695 rows, 3 artifact admissions): `artifact_truth_projection`, digest `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f`, on both builds; the outputs are byte-identical.
- Artifact truth over the 18 L actor logs: `artifact_truth_projection` for all 18 on both builds; the outputs are byte-identical.
- Capability-definition graph rows (`scripts/graph-rows.py`: capability ids and versions, owning contract ids with catalog and selector, dependent ids, effect and proof refs; digests excluded): 16 rows, identical on base, part A and final.

No projection is refused, no digest changes and no graph row changes. Apart from case 3, discussed above, no case goes from pass to fail.

## 12. Deviations

1. **The door message is new.** The brief asks the door to return an existing code. It does: each owner reports the thrown refusal through the refusal it already returns for a failed append (`sink_unavailable`, `invocation_admission_failure`, `open_call_failure`, the coordinate refusals; section 6). The message text "a store on the legacy event profile admits no append before its witnessed reprice" is new, so a caller can tell the door from another failed append. Ruling item 7.
2. **The door table's Public codes for Run start, Run continuation, the environment admissions and catalog admission are by reading.** The new lane drives those rows at the event store's entries (the caller each Public path reaches first) over a real reopened L log, and drives the witness rows through the Public binding. No harness in `test_env` runs `run.invoke`, `run.continue`, `product.install`, `workspace.bind`, `materialize`, `release.snapshot` or `catalog.admit` over a store on L (the witness harness is specific to the witness binding; the others need a workspace, catalog and Program over the store). The cited lines in section 6 carry the mapping.
3. **One check added in `actor_process` (ruling item 1).** The actor refuses off W before its binding, with the existing message "liveness admission requires one held current-profile owner context". It is needed because the RC6 and S2 tables admit the W-shaped binding row (probe `scripts/rc6-s2-binding.mjs`: the binding with `livenessBinding` is admitted on RC6, S2 and W; the binding without it is refused on all three), so without the check an actor on an RC6 or S2 store would write its binding and spawn before the first probe refused. Before, RC6 and S2 refused at the binding row (the store's table) before a spawn; after, at the check, also before a spawn, with the same code `actor_process_invocation_refused` and a different message. The check now runs before the qualification eligibility check, so a qualification dispatch on a store off W sees the profile refusal instead of the gate's `assessor_identity_absent` (`t287-qualification-scopes` Q23, restated; section 7).
4. **A case of an artifact-truth lane went from pass to fail and was restated instead of stopping.** `t287-historical-source-resource` case 3 failed under the door (3/4) because it appended a synthetic row to its L fixture to obtain a later prefix (section 7). The rules name a pass-to-fail case of this lane a stop condition ("do not repair the reader, report it"). No reader changed and none was repaired: the failing step is the retired append itself, not an artifact-truth read, and B6 directs a test that drives new work on L to reprice first. The case was restated that way and passes (4/4). Ruling item 8 asks the Executive to confirm this or rule it a stop.
5. **The legacy-transports exception is kept.** B5 names it for deletion. The rule (`worker_transport.ts`: with no native result assessor, the first callback error is rethrown) and the transport's per-chunk stdout path are reached by every raw caller of the exported `runWorkerTransport`, not only by the actor on L (`m5-worker-transport` drives both, including its EPIPE case), so deleting them would change a kept caller. The actor's legacy stdout path (`actor_process.ts`) is deleted. The transport comment no longer calls the rule a legacy contract. Ruling item 2.
6. **Before columns for new and restated files** were taken by running copies of the final test files against a base checkout (`/private/tmp/abg-td32-work/base-root`, base build), not by checking out the files at base.
7. **Commit order.** The census commit `d491b419b` (this Return's skeleton, holding the B1 append census and the B7 recorded-store census alongside A6) precedes the part A commit `fcb4007d2`; the brief orders part A before part B. The census commit changes no source, specification, design or test, only this Return.
8. **A restatement outside B6's two options.** `t287-qualification-scopes` Q23's off-W subcase was restated to assert the profile refusal, neither losing the case nor repricing first (its store is mocked, so a reprice does not apply). The new assertion keeps the subcase's safety checks (nothing admitted, no binding, zero provider starts). Ruling item 1.

## 13. Residuals and items for a ruling

Residuals (kept, each with its reason in section 5):

- `worker_transport.ts` exception rule and per-chunk `onStdoutObserved(chunk)` path: served by raw `runWorkerTransport` callers (exported; `m5-worker-transport` covers them, including EPIPE).
- `c_call.ts` lifecycle-copy evidence (`lifecycleCopies !== false`): serves RC6; unreachable on L now.
- `runtime_liveness.ts` skips on non-W rows and probe refusal off W: live for RC6 and S2.
- `transport_contracts.ts` `durableActorObservationOfArtifact(payload, currentProfile)`: a reader parameter, kept (the whole-word search for `currentProfile` finds only it).
- `tsc --noUnusedLocals` reports three unused locals in `c_call.ts` (`selectValidatedRuntimeEventPrefix`, `runtimeFailurePlanBody`, `runtimeFailureCloseError`); they are unused on base too and are not TD-32's.
- 579 logs with stamps no profile selects, and the 4 L logs ending at a boundary to `4196aaeb`, are unreadable on base and after (section 1.2, 1.6); not changed here.

Items for a ruling:

1. The actor's profile check before the binding (deviation 3), and with it the restatement of `t287-qualification-scopes` Q23's off-W subcase to assert that refusal, which is neither of B6's options (deviation 8).
2. The `worker_transport` exception rule and per-chunk path stay for raw transport callers; the brief named "the legacy-transports exception" for deletion. Only its comment changed ("Legacy transports retain their exception contract" no longer appears).
3. L stores with an unjudged leaf can be neither repriced (refused by `assertRootEventProfileBoundary`, as before) nor stopped (the `run-stopped` witness is now refused by the door; before, it was admitted on L). Three recorded copies are in this state (section 1.6: the two 913-row D2 copies and one store whose failed Run left a leaf unjudged). None is a live store.
4. `specification/GOALS.md:887` ("existing witnessed stop under L before P") is a dated work-wave record and is left.
5. Design wording outside the restated passages, not edited: the compatibility note's opening says the supplement "selects exactly two event-contract profiles and one forward transition" (`T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md:28`; four tables are retained now, L, RC6, S2 and W), and the pilot note says "Use one successor current descriptor `…/p5-run-environment-role-context@1`" (`T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md:482-483`; the current descriptor is W, p6). Neither lets a store on L take work, so neither is a TD-32 restatement; both are stale history inside live notes.
6. The door adds no code; the code a caller sees depends on the owner (section 6).
7. The door's message is new (deviation 1).
8. `t287-historical-source-resource` case 3 restated to reprice first (deviation 4).

## Appendix A. Recorded stores whose last row is on L

| # | Store (under the evidence root) | Rows | Bytes | State |
| --- | --- | ---: | ---: | --- |
| 1 | `comments/codex/20260908_W2_STEEL_SEQUENCE/b06-thread03/successor-02/fixture/attempt-1788840316534-10743/runtime.events.jsonl` | 3 | 3442032 | no Run |
| 2 | `comments/codex/20260908_W2_STEEL_SEQUENCE/thread-02-implementation/installed-proof/attempt-1788833910338-38933/runtime.events.jsonl` | 3 | 3380366 | no Run |
| 3 | `comments/codex/20260908_W2_STEEL_SEQUENCE/thread-02-implementation/installed-proof/attempt-1788834459621-45337/runtime.events.jsonl` | 3 | 3380225 | no Run |
| 4 | `comments/codex/20260908_W2_STEEL_SEQUENCE/thread-02-implementation/installed-proof/attempt-1788836272649-65671/runtime.events.jsonl` | 21 | 3436178 | finished |
| 5 | `comments/codex/20260908_W2_STEEL_SEQUENCE/thread-02-implementation/installed-proof/attempt-1788837068970-74645/runtime.events.jsonl` | 21 | 3436181 | finished |
| 6 | `comments/codex/20260909_C1_TEXT_OUTPUT/implementation/build-input/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 7 | `comments/codex/20260909_C2_HELPER_ACK/implementation/build-input/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 8 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 9 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-serial-branch/live-attempt-01/events/runtime.events.jsonl` | 275 | 4596838 | finished |
| 10 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-serial-branch/live-attempt-02/events/runtime.events.jsonl` | 310 | 4824110 | finished |
| 11 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-serial-branch/partial-stop-01/events/runtime.events.jsonl` | 163 | 4219566 | finished |
| 12 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-single-start/live-attempt-01/runtime.events.jsonl` | 3 | 3432061 | no Run |
| 13 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-single-start/live-attempt-02/events/runtime.events.jsonl` | 3 | 3432068 | no Run |
| 14 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-single-start/live-attempt-03/events/runtime.events.jsonl` | 6 | 3448222 | no Run |
| 15 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-single-start/live-attempt-04/events/runtime.events.jsonl` | 12 | 3499681 | finished |
| 16 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-single-start/live-attempt-05/events/runtime.events.jsonl` | 330 | 4201065 | finished |
| 17 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-single-start/live-attempt-06/events/runtime.events.jsonl` | 466 | 4451288 | finished |
| 18 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-single-start/live-attempt-07/events/runtime.events.jsonl` | 313 | 4184780 | finished |
| 19 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-single-start/live-attempt-08/events/runtime.events.jsonl` | 460 | 4506832 | finished |
| 20 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-single-start/live-attempt-09/events/runtime.events.jsonl` | 354 | 4309805 | finished |
| 21 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-single-start/live-attempt-10/events/runtime.events.jsonl` | 318 | 4304933 | finished |
| 22 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/build-input/test_env/test_runs/steel-single-start/live-attempt-11/events/runtime.events.jsonl` | 444 | 4604965 | finished |
| 23 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/installed-witness-01/events-02/runtime.events.jsonl` | 3 | 3515215 | no Run |
| 24 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/installed-witness-01/events-03/runtime.events.jsonl` | 18 | 3747548 | finished |
| 25 | `comments/codex/20260909_D1_LIFECYCLE/native-implementation/installed-witness-01/events-04/runtime.events.jsonl` | 36 | 4175254 | finished |
| 26 | `comments/codex/20260909_D1_LIFECYCLE/native-stage-implementation-01/installed-stage-witness-01/events-01/runtime.events.jsonl` | 3 | 3792228 | no Run |
| 27 | `comments/codex/20260909_D1_LIFECYCLE/native-stage-implementation-01/installed-stage-witness-01/events-02/runtime.events.jsonl` | 21 | 4223075 | finished |
| 28 | `comments/codex/20260909_D1_LIFECYCLE/native-stage-implementation-01/installed-stage-witness-01/events-03/runtime.events.jsonl` | 30 | 4498200 | finished |
| 29 | `comments/codex/20260909_D2_LIFECYCLE/implementation-01/installed-01/run-01/events-01/runtime.events.jsonl` | 3 | 3892467 | no Run |
| 30 | `comments/codex/20260909_D2_LIFECYCLE/implementation-01/installed-01/run-02/events-01/runtime.events.jsonl` | 3 | 3892467 | no Run |
| 31 | `comments/codex/20260909_D4_SELF_CONFORMANCE/implementation-01/installed-proof-02/events-01/runtime.events.jsonl` | 13 | 3342121 | finished; an unjudged leaf blocks the reprice |
| 32 | `comments/codex/20260909_D4_SELF_CONFORMANCE/implementation-01/installed-proof-03/events-01/runtime.events.jsonl` | 74 | 5807214 | finished |
| 33 | `comments/codex/20260909_D4_SELF_CONFORMANCE/s01-01/attempt-01/events-01/runtime.events.jsonl` | 2 | 2655639 | no Run |
| 34 | `comments/codex/20260910_D2_FRAME_REPAIR/implementation-01/installed-frame-01/events-01/runtime.events.jsonl` | 3 | 4152507 | no Run |
| 35 | `comments/codex/20260911_ABG5_ACCEPTED_SOURCE_INTEGRATION_01/scratch/witness-15pfap/events.jsonl` | 3 | 6191 | no Run |
| 36 | `comments/codex/20260911_ABG5_ACCEPTED_SOURCE_INTEGRATION_01/scratch/witness-5DXOlB/events.jsonl` | 1 | 776 | no Run |
| 37 | `comments/codex/20260911_ABG5_ACCEPTED_SOURCE_INTEGRATION_01/scratch/witness-CZV0Eb/events.jsonl` | 1 | 776 | no Run |
| 38 | `comments/codex/20260911_ABG5_ACCEPTED_SOURCE_INTEGRATION_01/scratch/witness-LNlvFS/events.jsonl` | 1 | 776 | no Run |
| 39 | `comments/codex/20260911_ABG5_ACCEPTED_SOURCE_INTEGRATION_01/scratch/witness-ReRNIF/events.jsonl` | 1 | 776 | no Run |
| 40 | `comments/codex/20260911_ABG5_ACCEPTED_SOURCE_INTEGRATION_01/scratch/witness-g0bk8I/events.jsonl` | 1 | 776 | no Run |
| 41 | `comments/codex/20260911_ABG5_ACCEPTED_SOURCE_INTEGRATION_01/scratch/witness-hRjsM5/events.jsonl` | 1 | 776 | no Run |
| 42 | `comments/codex/20260911_ABG5_ACCEPTED_SOURCE_INTEGRATION_01/scratch/witness-rmPVGF/events.jsonl` | 3 | 6191 | no Run |
| 43 | `comments/codex/20260911_ABG5_ACCEPTED_SOURCE_INTEGRATION_01/scratch/witness-ztRjLA/events.jsonl` | 1 | 776 | no Run |
| 44 | `comments/codex/20260911_D2_BOUNDED_REPAIR/fixture-producers-10/execution-01/runtime-events-846.jsonl` | 846 | 13540472 | finished |
| 45 | `comments/codex/20260911_D2_BOUNDED_REPAIR/fixture-producers-10/historical/runtime-prefix-831.jsonl` | 831 | 13487870 | finished |
| 46 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-01/installed-frame-01/events-01/runtime.events.jsonl` | 3 | 4154583 | no Run |
| 47 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-7iuMxY/events.jsonl` | 1 | 776 | no Run |
| 48 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-KFA26u/events.jsonl` | 3 | 6191 | no Run |
| 49 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-Lum7tn/events.jsonl` | 3 | 6191 | no Run |
| 50 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-LwyCDW/events.jsonl` | 3 | 6191 | no Run |
| 51 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-Tm2i3r/events.jsonl` | 1 | 776 | no Run |
| 52 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-UJatsp/events.jsonl` | 3 | 6191 | no Run |
| 53 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-UolCjH/events.jsonl` | 1 | 776 | no Run |
| 54 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-VtFN24/events.jsonl` | 1 | 776 | no Run |
| 55 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-Y1zIDO/events.jsonl` | 1 | 776 | no Run |
| 56 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-Y9Py8N/events.jsonl` | 1 | 776 | no Run |
| 57 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-aUAmt7/events.jsonl` | 1 | 776 | no Run |
| 58 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-fxDbMe/events.jsonl` | 1 | 776 | no Run |
| 59 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-hNUyjv/events.jsonl` | 1 | 776 | no Run |
| 60 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-iRcuwD/events.jsonl` | 1 | 776 | no Run |
| 61 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-j5uiL8/events.jsonl` | 1 | 776 | no Run |
| 62 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-lbQwfY/events.jsonl` | 1 | 776 | no Run |
| 63 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-mdEfbp/events.jsonl` | 1 | 776 | no Run |
| 64 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-qJiiWo/events.jsonl` | 1 | 776 | no Run |
| 65 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-u13zaN/events.jsonl` | 3 | 6191 | no Run |
| 66 | `comments/codex/20260911_D2_BOUNDED_REPAIR/implementation-07/scratch/witness-uAzQFP/events.jsonl` | 1 | 776 | no Run |
| 67 | `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-binding-continuation-12/execution-01/runtime-events-846.jsonl` | 846 | 13540472 | finished |
| 68 | `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-binding-continuation-12/execution-01/runtime-events-849.jsonl` | 849 | 17760560 | finished |
| 69 | `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-04/installed-frame-01/events-01/runtime.events.jsonl` | 73 | 5082898 | finished |
| 70 | `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-07/installed-frame-01/events-01/runtime.events.jsonl` | 800 | 12040406 | finished |
| 71 | `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/events-01/runtime.events.jsonl` | 913 | 19058361 | open Run; an unjudged leaf blocks the reprice |
| 72 | `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-first-03/installed-frame-01/events-01/runtime.events.jsonl` | 21 | 4215824 | finished |
| 73 | `comments/codex/20260911_D2_BOUNDED_REPAIR/installed-witness-continuation-13/execution-01/runtime-events-913.jsonl` | 913 | 19058361 | open Run; an unjudged leaf blocks the reprice |
| 74 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-7LtrMS/events.jsonl` | 2 | 2141 | open Run |
| 75 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-EHDROi/events.jsonl` | 2 | 2141 | open Run |
| 76 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-EoSPMa/events.jsonl` | 2 | 2141 | open Run |
| 77 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-J57gS6/events.jsonl` | 2 | 2141 | open Run |
| 78 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-JUWSl9/events.jsonl` | 2 | 2141 | open Run |
| 79 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-L6h3Lj/events.jsonl` | 2 | 2141 | open Run |
| 80 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-Nc5pXy/events.jsonl` | 2 | 2141 | open Run |
| 81 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-NoYMQl/events.jsonl` | 2 | 2141 | open Run |
| 82 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-O7l1sL/events.jsonl` | 2 | 2141 | open Run |
| 83 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-SaSKMb/events.jsonl` | 2 | 2141 | open Run |
| 84 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-UYfurr/events.jsonl` | 2 | 2141 | open Run |
| 85 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-WUDE4p/events.jsonl` | 2 | 2141 | open Run |
| 86 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-XqMnuP/events.jsonl` | 2 | 2141 | open Run |
| 87 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-YCMM29/events.jsonl` | 2 | 2141 | open Run |
| 88 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-aMm6v7/events.jsonl` | 2 | 2141 | open Run |
| 89 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-aizu3U/events.jsonl` | 2 | 2141 | open Run |
| 90 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-b6RXrN/events.jsonl` | 2 | 2141 | open Run |
| 91 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-bdn6MD/events.jsonl` | 2 | 2141 | open Run |
| 92 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-cWAQX1/events.jsonl` | 2 | 2141 | open Run |
| 93 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-ezY6oE/events.jsonl` | 4 | 7332 | finished |
| 94 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-f7u6Jy/events.jsonl` | 2 | 2141 | open Run |
| 95 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-ij2OD1/events.jsonl` | 2 | 2141 | open Run |
| 96 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-qI4cQY/events.jsonl` | 2 | 2141 | open Run |
| 97 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-unm6gh/events.jsonl` | 2 | 2141 | open Run |
| 98 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-vrAqdp/events.jsonl` | 2 | 2141 | open Run |
| 99 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-x50Tr9/events.jsonl` | 4 | 7332 | finished |
| 100 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-x7Wxey/events.jsonl` | 2 | 2141 | open Run |
| 101 | `comments/codex/20260911_D2_INTERRUPTED_RESOURCE_RECOVERY_IMPLEMENTATION_59/scratch/witness-z8adot/events.jsonl` | 2 | 2141 | open Run |
| 102 | `comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/attempt-01/events-01/runtime.events.jsonl` | 20 | 2797774 | finished |
| 103 | `comments/codex/20260911_D4_S01_PROGRAM_OWNER/installed-preparation-01/attempt-01/events-01/runtime.events.jsonl` | 2 | 2742435 | no Run |
| 104 | `comments/codex/20260911_D4_S01_PROGRAM_OWNER/r10-installed-preparation-03/attempt-01/events-01/runtime.events.jsonl` | 20 | 2811536 | finished |
| 105 | `comments/codex/20260911_P3_LIVENESS_PROFILE_IMPLEMENTATION_26/scratch/ancestry-beiFkF/events.jsonl` | 1 | 749 | no Run |
| 106 | `comments/codex/20260911_P3_LIVENESS_PROFILE_IMPLEMENTATION_26/scratch/legacy-XHkonx/events.jsonl` | 1 | 749 | no Run |
| 107 | `comments/codex/20260911_P3_LIVENESS_PROFILE_IMPLEMENTATION_26/scratch/legacy-refuse-OytguX/events.jsonl` | 1 | 749 | no Run |
| 108 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/integration-01/scratch/ancestry-LaZ8Tz/events.jsonl` | 1 | 749 | no Run |
| 109 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/integration-01/scratch/legacy-refuse-GXpQaH/events.jsonl` | 1 | 749 | no Run |
| 110 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/integration-01/scratch/legacy-sHqEiH/events.jsonl` | 1 | 749 | no Run |
| 111 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/integration-01/scratch/nonempty-l-VfnIoK/events.jsonl` | 1 | 744 | no Run |
| 112 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/integration-01/scratch/nonempty-l-wdUUVL/events.jsonl` | 1 | 744 | no Run |
| 113 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/ancestry-2Cb0SW/events.jsonl` | 1 | 749 | no Run |
| 114 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/ancestry-J7pEer/events.jsonl` | 1 | 749 | no Run |
| 115 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/ancestry-T3Ftxz/events.jsonl` | 1 | 749 | no Run |
| 116 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/ancestry-ZOF7p3/events.jsonl` | 1 | 749 | no Run |
| 117 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/ancestry-cfFOIk/events.jsonl` | 1 | 749 | no Run |
| 118 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/ancestry-n5i6kt/events.jsonl` | 1 | 749 | no Run |
| 119 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/ancestry-qNmrrn/events.jsonl` | 1 | 749 | no Run |
| 120 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-6nPh3d/events.jsonl` | 1 | 749 | no Run |
| 121 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-HisIIT/events.jsonl` | 1 | 749 | no Run |
| 122 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-KrmQHp/events.jsonl` | 1 | 749 | no Run |
| 123 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-a1Rqel/events.jsonl` | 1 | 749 | no Run |
| 124 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-g2q4wD/events.jsonl` | 1 | 749 | no Run |
| 125 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-pf5Dj1/events.jsonl` | 1 | 749 | no Run |
| 126 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-refuse-1aQMwP/events.jsonl` | 1 | 749 | no Run |
| 127 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-refuse-5phmJb/events.jsonl` | 1 | 749 | no Run |
| 128 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-refuse-8Eei7Q/events.jsonl` | 1 | 749 | no Run |
| 129 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-refuse-QWxAqN/events.jsonl` | 1 | 749 | no Run |
| 130 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-refuse-hQBOOw/events.jsonl` | 1 | 749 | no Run |
| 131 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-refuse-tiPH0k/events.jsonl` | 1 | 749 | no Run |
| 132 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-refuse-z4mOcy/events.jsonl` | 1 | 749 | no Run |
| 133 | `comments/codex/20260913_ABG5_PLAN_EXECUTION/liveness-01/scratch/legacy-rgnavA/events.jsonl` | 1 | 749 | no Run |
| 134 | `comments/codex/20260921_TRUSTED_DESKTOP_STEEL_THREAD/native-reacquisition-01/held-prefix-01/fixtures/native-hello-prefix.jsonl` | 20 | 2797774 | finished |
| 135 | `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-01/effects/witness-W65lBX/events.jsonl` | 1 | 776 | no Run |
| 136 | `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-01/effects/witness-bQItf1/events.jsonl` | 1 | 776 | no Run |
| 137 | `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-01/effects/witness-eUnRlv/events.jsonl` | 1 | 776 | no Run |
| 138 | `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-01/effects/witness-ohjN8o/events.jsonl` | 1 | 776 | no Run |
| 139 | `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-02/effects/witness-IYxwDZ/events.jsonl` | 1 | 776 | no Run |
| 140 | `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-02/effects/witness-JHjOPJ/events.jsonl` | 1 | 776 | no Run |
| 141 | `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-02/effects/witness-YTtweu/events.jsonl` | 1 | 776 | no Run |
| 142 | `comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/operator-stop-02/effects/witness-yoOgM8/events.jsonl` | 1 | 776 | no Run |
| 143 | `comments/codex/20260928_FRAMED_GOVERNANCE/default-library-publication-repair-01/component/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 144 | `comments/codex/20260928_FRAMED_GOVERNANCE/default-library-publication-review-01/scratch/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 145 | `comments/codex/20260928_FRAMED_GOVERNANCE/f11-carrier-realization-01/copied-tenant/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 146 | `comments/codex/20260928_FRAMED_GOVERNANCE/f11-fp-proof-delivery-realization-01/readiness-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 147 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-01/source-freeze/repo/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 148 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-01/staged-repo/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 149 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-02/source-freeze/repo/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 150 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-02/staged-repo/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 151 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-03/final-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 152 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-03/final-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 153 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-03/source-freeze/repo/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 154 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-03/staged-repo/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 155 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-04/final-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 156 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-04/final-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 157 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-05/final-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 158 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-05/final-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 159 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-06/final-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 160 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-06/final-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 161 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-07/final-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 162 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-07/final-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 163 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-08-continued-01/final-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 164 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-08-continued-01/final-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 165 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-08-continued-02/final-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 166 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-08-continued-02/final-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 167 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-09/final-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 168 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-09/final-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 169 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-10/final-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 170 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-10/final-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 171 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-native-setup-03/resources/worksite/subject/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 172 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-qualification-inputs-05/mechanical-worksite/subject/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 173 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-qualification-inputs-06/mechanical-worksite/subject/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 174 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-qualification-inputs-07/mechanical-worksite/subject/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 175 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-qualification-inputs-08/mechanical-worksite/subject/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 176 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-qualification-inputs-09/mechanical-worksite/subject/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 177 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-qualification-inputs-10/mechanical-worksite/subject/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 178 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-qualification-inputs-11/mechanical-worksite/subject/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 179 | `comments/codex/20260928_FRAMED_GOVERNANCE/final-qualification-inputs-15/mechanical-worksite/subject/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 180 | `comments/codex/20260928_FRAMED_GOVERNANCE/g2-existing-owner-groups-01/stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 181 | `comments/codex/20260928_FRAMED_GOVERNANCE/install-bin-policy-realization-01/readiness-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 182 | `comments/codex/20260928_FRAMED_GOVERNANCE/native-declaration-applicability-realization-01/copied-tenant/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 183 | `comments/codex/20260928_FRAMED_GOVERNANCE/qualification-command-preparation-01/mechanical-worksite/subject/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 184 | `comments/codex/20260928_FRAMED_GOVERNANCE/qualification-raw-contract-realization-01/readiness-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 185 | `comments/codex/20260928_FRAMED_GOVERNANCE/result-lineage-evidence-realization-01/readiness-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 186 | `comments/codex/20260928_FRAMED_GOVERNANCE/result-lineage-evidence-test-fixture-repair-01/readiness-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 187 | `comments/codex/20260928_FRAMED_GOVERNANCE/result-lineage-typed-contract-realization-01/readiness-stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 188 | `work/T287_G2_BUNDLE_STAGE_CONTINUATION_01/stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 189 | `work/T287_G2_CLOSED_TUPLE_PROOF_CONSUMER_REPAIR_01/stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 190 | `work/T287_G2_ENVIRONMENT_SCHEMA_REPAIR_01/stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 191 | `work/T287_G2_GTL_CORE_CANONICAL_SCALAR_CONTINUATION_01/stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 192 | `work/T287_G2_GTL_CORE_REALIZATION_01/stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 193 | `work/T287_G2_SEMANTIC_ASSEMBLY_TUPLE_REPAIR_01/stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 194 | `work/T287_PUBLIC_PREPARATION_BRIDGE_01/stage/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 195 | `work/T287_RELEASE_RESUMPTION_01/rc10-retention-01/native-repair-02/frozen-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 196 | `work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase1-01/native-02/frozen-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 197 | `work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase1-01/native-03/frozen-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 198 | `work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase1-01/native-04/frozen-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 199 | `work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-01/frozen-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 200 | `work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-02/frozen-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 201 | `work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-03/frozen-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 202 | `work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-04/frozen-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 203 | `work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-b01/frozen-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 204 | `work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01/native-b02/frozen-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 205 | `work/T287_RELEASE_RESUMPTION_01/rc11-qualification-01/native-02/frozen-source/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 206 | `work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/setup-001/resources/archives/worksite-command-execution/5ef35a3d98191cde4badd5c7ba38e856c0771c3a5fe5d96bfbd7f5c0a31c5f03/f93bc5c02013c38501b7cd8304c51cf4edec6903902d4cc3b76875bac1ec9e03/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 207 | `work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/setup-002/resources/archives/worksite-command-execution/e1d42323c72c154c0c9ddb3a6d59e237629b76fd14194167f2079f527e06c2cb/fafa41d54cea85cfc03354774c712d4cb4571a450aecf4e866c524737380126c/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 208 | `work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/setup-004/resources/archives/worksite-command-execution/64fc4ac530313f154b0fc23cb040231779e6485240b3e113b66aff94531c79f3/905b3f3e70a43064ba8c49176050adbecd1ed4e07de7271d7a4950abc5d3dbc8/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 209 | `work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/setup-004/resources/archives/worksite-command-execution/a97641c89f20f4d1c2feac5df724a74bdf27971c35bf0dba9e47cdf0a25f9ffb/de49084f7d53e647f8b7ae1d08089053a42439e0fd661373c9790ab52af28e92/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 210 | `work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/setup-005/resources/archives/worksite-command-execution/61ed9667fad5a311b47b08dbb2d3e0673ebd25d2c1bd9509cdf6a2ce81e51b4f/eebe6060f96695f1657503318dfa081ef10e405990ac9845ae2b0f148d093063/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 211 | `work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/setup-006/resources/archives/worksite-command-execution/3c63b42f209f533e11d3616825e89c96a367c4a484c18bb926492282c5518642/b1efb8bf6fd93329acd263e3dde7011e38941914daa2590836cbf42cd7704876/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 212 | `work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/runtime-001/resources/archives/worksite-command-execution/51717170187809060e33cb0af9a7a0d87c0446a4f7661b396c2ac113879d4751/e98da6bc6b049353e1efc9c642358d502b0363b23ca48c0525a62b69cf26f3c8/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 213 | `work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01/runtime-001/resources/archives/worksite-command-execution/d6588659ad08b977845675cfdc0d08284567e7014030d70ef0b6d3b1bd6b6493/ac2bc83ecafaa391c70f600bbb02a6ff84a56d7e3214adf04e3842dcea45fbd8/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 214 | `work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-03/budget-retest-01/runtime-001/resources/archives/worksite-command-execution/faa16d64e8f1eccf61c988968e058f2fc7f659e05ef422bc08e8935539b8aa7d/aad03c7176aaa7223a29794474686f77ec1c5b3e213c71314f818b67dd514d3e/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 215 | `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-001/resources/archives/worksite-command-execution/d393b67b5d6e76ca6ab66406f9f7132287ff33af26991203a61b18ed46db46aa/828561af9ad07a33747728d6dd2bc834377988516954e2a58def83b722a0841b/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 216 | `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-001/resources/archives/worksite-command-execution/f3e6e8ef5a9b33c8607a1b38a5880c7b58eb9587380d708e788036c1ea37d5d3/171046b62eccfadb15c1b877f4ec60a9ae74c38ad41d83b2f0db4289f849d743/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 217 | `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-002/resources/archives/worksite-command-execution/067898610b8e81f257d291b8267df784553fef177c781f02c62e86d61270d8cb/ccff8f23a2eb79d93faab33529ccf8fe9679d5d5f3334802c85d9d249deff488/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 218 | `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-002/resources/archives/worksite-command-execution/c54ee942d3352989a5b8cc6c8d43f3694bde6150762622ed3cb962919d0035d4/5e983cee43acb2b8aeecfe2fc3ff9752816d43e79bbdb35243870f9a4f848840/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 219 | `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-002/resources/archives/worksite-command-execution/f3e91d1ede2f3baef2cca7a3de85d1df1c1243191fe8a686dbaea7dfc1e88d6f/a34013a61d6778f4a08fd4b96af8c1638df18c2aebd3e2aae02be6f4089b49a3/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 220 | `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-003/resources/archives/worksite-command-execution/032de8b31e583eac7c64dd6fd9b338f5d25fbb5c2a9eda12ced6917b28e7e5e5/459bd74ea520820ef2ff0078c93d75598a95c3954317b1c675319cecdab9eca3/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 221 | `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-003/resources/archives/worksite-command-execution/b891c52a2dbdd1d766dc6f95c2e1b704af3afd2639a3e8a1242fe4cf764b1826/f44b3e61bb5391dbb4b7de2dd0935742d3dc60b4450857f9799bf1dc0d1b6fd7/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 222 | `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-003/resources/archives/worksite-command-execution/d98ee797f51734bcfc9d9b2fc173d024871b07721ed822a90e40e24fb774933e/193868e5f2ddfc63bcdd1777234f715f08db143f86c8d2a32968d9a565ed2e21/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 223 | `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-003/resources/archives/worksite-command-execution/e66d5c0f94de2b2049b2623036d7aea5063728fa4b913b480697fcaebfb09b0d/7eff06ce218dabc49007a14424cab4098a600fd1c5ff7db2a1cd25b3f709f476/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
| 224 | `work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/runtime-003/resources/archives/worksite-command-execution/e9f8860eae6c8600d6b57d6a109cf65799194e62eadf3d52d73b23048ce320ba/75b3f81e32736e84cea3939bef299e203e97347cd5626e4412de6d89b311f790/sandbox/build_tenants/abiogenesis/typescript/test_env/proof/abi5-root-r10.events.jsonl` | 20 | 504306 | finished |
