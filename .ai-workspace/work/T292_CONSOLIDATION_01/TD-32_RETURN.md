# TD-32 Return: event profile residue, and L stores reprice before they append

Writer: Claude Opus 5.5. Branch `claude/td32-event-profile-residue` from local `main` at `e9d870c02`, worktree `/private/tmp/abg-td32`. Part A is a realization_refactor; part B is a requirement_reprice (the owner's decision in "Decisions for the owner": L stores reprice before appending, and the L writer branches retire). No push, no tag. Here `T` is `build_tenants/abiogenesis/typescript` and the evidence root is `/Users/jim/src/apps/abiogenesis/.ai-workspace`.

**Status: pending.** (This skeleton holds the census; the remaining sections are filled in work order.)

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

Pending.

## 4. Design

Pending.

## 5. Code

Pending.

## 6. The door

Pending.

## 7. Tests

Pending.

## 8. Generated contracts and identity digests

Pending.

## 9. Lanes before and after

Pending.

## 10. Replay comparison

Pending.

## 11. Artifact truth over recorded stores

Pending.

## 12. Deviations

Pending.

## 13. Residuals and items for a ruling

Pending.

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
