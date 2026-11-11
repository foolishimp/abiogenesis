# RC12 package L2 Return: worker inactivity liveness repair

This is a Writer Return to the Executive and is commentary only. Worktree `/private/tmp/abg-rc12-liveness-20261111`, branch `claude/rc12-liveness`, base `aebc02fdd`. T = `build_tenants/abiogenesis/typescript`; X = `qualification-scratch/rc12-executive-01/` (untracked).

**Outcome.**
- C1 is done with green evidence.
- **C2 is held under the stop "a recorded Run's replay changes"**; the counterexample follows.
- C3 to C5 cover C1 only.

## C2 stop: counterexample
- **The replay digest includes frame liveness.** `replay.ts:1368-1370` puts `nativeLiveness` in the replay body, and `:1447` digests that body.
- **The digest is persisted.** A successor invocation over a failed, stopped or blocked source Run is admitted under `inactiveRetainedWork` (`invocation_admission.ts:547-549`). Its basis persists the source Run's guard digest as `sourceReplayDigest` (`:439`, `:591`).
- **Ordinary reads re-check it.** Every Public read of the successor goes `project_read_ports.ts:731/1211` → `projectRunSemanticReplay` → `projectOwnerFacts` (`replay.ts:1947-1963`). That path re-derives the basis, requires it to be equal, and otherwise throws "run semantic relation requires one exact admitted external source-result basis". `execution_basis.ts:756/812` re-derive it as well.
- **Measured** with `X/l2/cross-build-read.mjs` on the baseline management-supervision store (old build, 252 events). The C1+C2 build was built once for this and then reverted.

| Run | Old build guard digest | C1+C2 build | Frame dispositions |
|---|---|---|---|
| blocked | `sha256:5b0b2dfb…` | `sha256:e95dfc3b…` | 3 frames: `continue_waiting/unknown_watchdog_policy` → `block/admitted_external_interruption` |
| failed | `sha256:e01522b7…` | `sha256:602ee498…` | the same 3-frame change |

  The C1-only build reads identically to the old build (`X/l2/cross-build-{old,c1,c1c2}.json`).
- **Consequence:** stores recorded before C2 that hold a successor over an inactive source would stop reading. Design §6.1 sends "altered old-history meaning" back to the profile HOW owner.
- **Options (your decision; I chose none):**
  - (a) Accept the break, which needs a §6.1 owner decision.
  - (b) Exclude frame liveness from the replay digest, which is a replay design_reframe.
  - (c) Keep null-policy precedence, so B1-F4 stands.
- **C-calls:** C-call contexts also have a null policy, but none is ever interrupted (the only `external_interruption` producer is `actor_process.ts:1475`, at actor scope), so the swap would not move them.

## What changed (C1)
- **`T/code/src/abg/calculus/liveness.ts` (+4/−2).** `leaseExpired && processLive` now derives `controlled_terminate` with `startup_expired` or `inactivity_expired`, ahead of the coverage gate. The non-live classification stays under `leaseExpired && completeCoverage`, and `unknown_required_coverage` is unchanged. The rest of the precedence is unchanged: hard cap, `inspect_archive`, null policy, interruption, admitted artifact, `actorDone`.
- **`T/design/T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md` (+10).** §4.1 (2026-11-11) is a compact record of the C1 clauses only.
- **`T/test_env/tests/t287-management-supervision.test.mjs` (+20/−7).** Renamed to "native lease contains a silent actor at inactivity before its hard cap without a no-progress classification under unknown coverage; an active blocked child reaches Public unchanged".
  - **`silent` mode** (the fixture's `hard_cap` worker): lease 100 ms; absolute cap 600 → 10000 ms. It asserts:
    - one threshold, `inactivity`/100, at elapsed below 5000;
    - as of that sample, `controlled_terminate`/`inactivity_expired` with five unknown sources;
    - no interruption fact;
    - `transport_failure` and no `transport_relation_mismatch`;
    - Public causation reaches the inactivity fact;
    - no Public `no_output` or `progress_without_result`.
  - **`blocked` mode:** lease 100 → 3000 ms. Every prior claim is kept, including zero timeouts; this is the active-worker case.
  - **Both modes:** the five `unavailable` declarations are still asserted.
- **`T/test_env/tests/t287-liveness-inactivity.test.mjs` (new, 142 lines).** Three cases:
  - containment under unknown coverage, with the inactivity, absolute and startup thresholds;
  - classification withheld under unknown coverage, contrasted with complete coverage;
  - the lease reset by activity.

## Trace obligations
| | Old reading → new reading |
|---|---|
| T1 consumers (C1) | `runtime_liveness.ts:455-474`: `not_reached` → stages an `inactivity` threshold (`timeoutMs` = `inactivityMs`); the `:482-483` re-check holds because the process is still live.<br>`liveness.ts:610-621` validation: code unchanged; it now admits `inactivity`.<br>`actor_process.ts:1467-1487` wake: rearm → returns `inactivity`, with no interruption probe (absolute-only, `:1474`).<br>`worker_transport.ts:518-536`: rearm → `timedOut`, TERM/grace.<br>`retry.ts:4130` (needs `retry`) and `:4480` (needs `block` or `retry`): a live actor past its lease moves `continue_waiting` → `controlled_terminate`; both still refuse.<br>`replay.ts:400` reads frame `externallyInterrupted` and `activeSystems` only: unchanged.<br>Public `nativeLiveness` (`replay.ts:1368`, `project_read_ports.ts:1590`): renders `controlled_terminate`/`inactivity_expired` only as of an inactivity threshold sample. |
| T2 timeout class | Producers: native `runtime_liveness.ts:458-474`, which now emits `inactivity`; L `actor_process.ts:1567-1579`, which already did.<br>Validators: `liveness.ts:619-620`, `event_store.ts:631-642`.<br>Consumers:<br>- `worker_transport.ts:536` → `classifyWorkerTransportFailure` (`transport_contracts.ts:122-128`): any timeout is `transport_failure`.<br>- `c_call.ts:2082-2090`: an inactivity `timeoutMs` must equal the binding's (both are `plan.timeoutMs`; there is no mismatch).<br>- `c_call.ts:1903-1924/2057/2152/2209/3946/6711-6817`, `actor_process.ts:470-526` and `replay.ts:2437-2441` validate or carry it.<br>- `worksite_construction_recovery.ts:79` recovers only a null class.<br>**RETRY-008:** the requirement maps `inactivity_timeout` to `no_output`. Both the L and native paths give `transport_failure` (both classes are retryable by default). This is pre-existing and now natively reachable. It is not repaired and is your decision. |
| T3 old instances | C1: none change. The recorded store reads identically across builds, and the HS03 oracle passes unedited. As-of samples are activity or threshold instants, and recorded thresholds are absolute.<br>C2: see the stop above. |
| T4 identities and pins | None changed.<br>- The HS03 pin is unchanged.<br>- `test_env/qualification/inventory.json` was not regenerated; it is already stale at the base (289/1191) and the qualification route owns it.<br>- The two build-regenerated files are uncommitted. |
| T5 tests | `t287-management-supervision`: edited (parameters as above).<br>`t287-liveness-inactivity`: new.<br>Result lines are in E4. No swept file needed an edit. |

## Evidence
Each file runs alone: `TMPDIR=/private/tmp/abg-liveness-tmp node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/<f>.test.mjs` in T, via `X/l2/run-set.sh`. Outputs are in `X/l2/{baseline,baseline-rerun,after,after-fix}/`.
- **E1.** `npm run build` passes at the base (33.5 s), on C1+C2 and on C1 (32.3 s).
- **E2.** `after` sits beside `before` in `X/l/after/{silent,late,heartbeat}/`; all three pass (`✔ L scenario <s> after`, 54.0, 55.5 and 59.1 s).
  - Silent: `inactivity`/6000 at elapsed 6003 ms (wall 6001); no absolute fact; 0 interruptions.
  - Late: `inactivity` at 7882 ms (last output 1865, deadline 7865).
  - Heartbeat: no inactivity fact; `absolute` at 12003 ms.
- **E3.** `t287-liveness-inactivity` passes 3/3. A copy run against the old build fails both C1 cases and passes the classification-gate case. The frame case is dropped with C2.
- **E4.** Results as tests/pass/fail/skip, baseline → after:

| File | Baseline | After |
|---|---|---|
| management-supervision | 5/5/0/0 | 5/4/1/0; rerun 5/5/0/0 |
| calculus-fold (with oracle) | 25/25/0/0 | 25/25/0/0 |
| native-frame-observation | 7/1/0/6 | 7/1/0/6 |
| lifecycle-failure-carrier | 7/7/0/0 | 7/7/0/0 |
| m5-worker-transport | 39/39/0/0 | 39/39/0/0 |
| owned-process-lifetime | 34/34/0/0 | 34/34/0/0 |
| default-library-reviews | 7/7/0/0 | 7/7/0/0 |
| native-semantic-job | 9/9/0/0 | 9/9/0/0 |
| worksite-command-execution | 12/12/0/0 | 12/12/0/0 |
| declared-testing-capability | 7/3/0/4 | 7/3/0/4 |
| installed-qualification-conservation | 1/0/0/1 | 1/0/0/1 |
| d5-authentic-preserved-result | cancelled, twice | cancelled |

  - **management-supervision:** the red was my own assertion; `selectValidatedRuntimeEventPrefix` needs a frozen array. I added `Object.freeze`, and the solo rerun passes in 118 s.
  - **calculus-fold:** the first baseline was missing `ABI5_HS03_STREAM_METADATA` (2 environmental fails); that row is from the rerun with the oracle.
  - **d5:** `test timed out after 117000ms` on both baselines and on the after run. This is **pre-existing; reported, not repaired**. Its `timeout` negative completes in every run, and that segment shortens from 13.3–14.8 s to 12.5 s.
- **E5.** The HS03 recorded-actor oracle passes unedited after the change.
  - The oracle exists only in the main repo's untracked `…/rc7-stdout-window-author-01/historical-metadata-001/metadata.json`.
  - I copied it read-only to `X/l2/oracle/`. The copy has 46,684,229 bytes and sha256 `2c9328e4…`, matching the pin.
  - I read nothing else there.

## Sweep (C4)
The native lease is `ABG_TS_FP_TIMEOUT_MS` (default 60000, `actor_process.ts:714`), or a binding's `timeoutMs`. The triage's count of 12 files does not reproduce, so I covered all 16 files under `T/test_env` that name the key, plus the binding route and the library Runs. I looked for pauses via `setTimeout`, `setInterval`, `Atomics.wait` and `sleep`.
- **`management-supervision`** (fixture `semantic-worker.mjs`): lease 100; the worker pauses 350 ms after init, or stays silent. Handled by C3, as above.
- **`d5-authentic-preserved-result`**: lease 1000 in its `timeout` run, whose stand-in hangs after 3 rows (`d5-…-fixture.mjs:334`). No edit. Its claim ("a timeout is observed", class not fixed) is kept. Old reading: `absolute` at 2500 ms. New reading: `inactivity` at about 1000 ms.
- **`lifecycle-failure-carrier`** (binding `timeoutMs` 1000): its wake comes milliseconds after a qualifying row. No edit, but its "no threshold" claim now relies on that timing margin rather than on coverage.
- **No pause longer than the lease; no edit:**
  - `declared-testing-capability` (support and test, 60000/120000);
  - `native-semantic-job` and `worksite-command-execution` (limit readers);
  - `installed-qualification-conservation` (skips);
  - `d2-frame-installed.mjs` (a helper);
  - the default-library scripted stand-ins (default 60000; the live variant skips).
- **Not run:** `runtime-f09-worker`, `execution-material`, `exact-candidate-qualification` and the d5 selector list (qualification route); `w2-steel-*-installed` and `uat/*` (live provider).
- **Never reach the calculus:** `m5-worker-transport`, `management-stream-drain` and `owned-process-lifetime` use the flat timer or their own wake stubs.

## Deviations and residual risks
- **Held scope:** C2, the E3 frame case and the C2 design clause are held (see the stop). The Public frame value for failed or stopped Runs is still `continue_waiting/unknown_watchdog_policy`.
- **Weaker active-worker proof:** the C3 active worker shows "not contained" with a single silent gap under the lease. The multi-interval reset is proved by E3 and by the E2 heartbeat.
- **Stale fixture comment:** `semantic-worker.mjs:31`, "Deliberately exceeds the test lease", is now false. The file is outside my write set, so I left it unedited.
- **Silent actor's final read:** its post-close Public read is `block/closed_attempt_without_admitted_result`, the existing post-close branch, not a no-progress classification.
- **Host obligation:** a native worker is now contained once its declared inactivity passes without admitted activity, whatever its coverage. Tool, API and archive progress have no producer, so a worker inside a long tool call, API wait or retry storm that emits no stream rows is contained at that bound. Each host must declare an inactivity longer than its longest silent working interval. RC11's 180 s may be too short for long builds or tests run as one tool call.
- **Timing sensitivity:** `lifecycle-failure-carrier`'s "no threshold" claim and the C3 "elapsed below 5000" bound now depend on timing; both hold with wide margins. The d5 suite times out under the current host load, independent of this change.
