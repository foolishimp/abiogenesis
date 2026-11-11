# RC12 package L Return: worker inactivity liveness (triage only)

Worker Return to the Executive. This is commentary. Worktree `/private/tmp/abg-rc12-liveness-20261111`, branch `claude/rc12-liveness`, base `62fd17271`.
**Outcome: triage only. No source, design or test change.**
- Stop hit: the repair that meets the target relation turns an accepted, currently green test red, and that test is outside my write territory (`t287-management-supervision.test.mjs`).
- Which protective meaning "unknown coverage" has is an owner decision.

Notation: T = `build_tenants/abiogenesis/typescript`. X = `qualification-scratch/rc12-executive-01/l/` (untracked).

## Triage

**Exact failure (bound).** Silent stand-in (`X/before/silent/`): init line, then silence. Policy is startup = inactivity 6000 ms, absolute 12000 ms, grace 1500 ms.
- **Process start (ord 139).** Start probes 140-147: `stdout`, `stderr` and `process_lifecycle` are `observed`; `structured_output`, `tool_progress`, `api_progress`, `archive` and `result_artifact` are `unavailable`. The last activity is elapsed 4.
- **Inactivity wake (ord 148).** At wall 6008 ms the wake flushes a noise window (`lastQualifyingElapsedMs: null`). So the supervisor did ask at the deadline.
- **The relation's answer at the deadline** (recomputed over cut ≤148 at sample 6004): `leaseExpired: true`, `hardCapReached: false`, coverage 3 observed / 5 unknown, `continue_waiting` / `unknown_required_coverage`.
- **Only threshold.** `actor_process_timeout_observed` `absolute` at ord 149, wall 12000 ms (elapsed 12004), followed by the interruption (150), SIGTERM (151) and `actor_invocation_failed` `transport_failure` (154). No inactivity fact.
- **Late** (`X/before/late/`): genuine `assistant` progress rows give stdout activity up to elapsed 1864; at the lease deadline 7864 the projection is `continue_waiting` / `unknown_required_coverage`, and the run ends `absolute` at ord 160 (elapsed 12002).
- **Heartbeat** (`X/before/heartbeat/`): 47 activity probes; it ends `absolute` at ord 226 (elapsed 12003), as it should.

**Is "no output for the declared interval" knowable without full coverage?**
- Yes, on the observed boundaries (`stdout`, `stderr`, `process_lifecycle`): the relation already computes `leaseExpired: true` at 6004 from admitted facts.
- What is not knowable without the five unknown sources is whether unreported tool or API work is still running.

**Violated relation.**
- REQ-R-ABG3-TRANSPORT-027 (liveness is governed by an inactivity lease over admitted probe activity), TRANSPORT-028 (the hard cap exists only as outer safety evidence), TRANSPORT-030 (the lease is preferred over a flat timeout).
- Design `T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md` §4: "An inactivity policy termination and an external absolute safety interruption keep distinct causes."
- Today the absolute ceiling is the only effective bound for every native actor (RC11: 900 s absolute, 180 s inactivity). Downstream, no `inactivity` class ever reaches the RETRY-008 mapping.

**Local cause.** `T/code/src/abg/calculus/liveness.ts:771` defines `completeCoverage` over all required probes. Line 803 gates both containment (`controlled_terminate`, `inactivity_expired` / `startup_expired`, :804) and the no-progress classification (:805-808) on it; otherwise the disposition falls to `unknown_required_coverage` (:809).

**Stand-in sub-case of reading (ii) excluded by code: a real `claude` stream completes coverage no more than the stand-in does.** Reading (ii) itself (coverage is a precondition; the defect lies elsewhere) survives as C2/R2 below, so the choice is (i)/R1 versus (ii)/R2.
- These are all the actor probe producers:
  - the start loop (`actor_process.ts:1501-1503`);
  - the unwindowed stdout and stderr probes (`:1530`, `:1541-1542`, `:1564`);
  - the result asset (`:1313-1339`), which returns with nothing on ENOENT or an empty file;
  - `result_artifact` admitted or rejected (`:1456`);
  - the absolute interruption (`:1475`);
  - stdout windows (`runtime_liveness.ts:422-423`).
- None of them ever emits `observed` coverage for `tool_progress`, `api_progress` or `archive`, under either parser.
- Therefore `completeCoverage` is false throughout every actor's life, and :803 is unreachable for the stand-in and for real workers alike. Nothing in the stand-in is missing that a real stream would supply.
- Corroboration: across 24 recorded real actors, the HS03 oracle test asserts exactly one threshold, and it is `absolute` (`t287-calculus-fold.test.mjs:1380-1383`; not run here).

**Supported causes (alternatives; the evidence fits both).**
- **C1. The calculus applies coverage to containment.** Design §3: the threshold observation "does not by itself establish … no-output"; §4 rule 1: "Unknown coverage cannot produce no-progress"; rule 5 keeps `no_output` behind its preconditions. On that reading, coverage gates classification, not containment.
- **C2. The producer realization is incomplete.** Three declared sources have a boundary that is never observed. Repairing this needs a design for what establishes tool, API and archive coverage.

**Why prior checks missed it.**
- The m5 inactivity tests (`m5-worker-transport` :835-861, :1157, :1211, :2262) run the transport without `onNativeSupervisionWakeup`, so the flat timer decides (`worker_transport.ts:538-539`). Under native supervision that timer only wakes the owner and rearms (`:518-529`).
- The calculus fold fixtures (:579-640, :792-835) and `t287-native-frame-observation` :281-313 assert only hard-cap containment.
- The HS03 scope tests sample below their 10 s lease.
- No test asserts `inactivity_expired`, `startup_expired` or an `inactivity` fact under the native profile.
- `t287-management-supervision` "native unknown coverage preserves a silent actor until hard cap" pins the reported behaviour as accepted T287-MGMT-01 law. It is green at baseline:
  - `hard_cap` mode: a silent worker, lease 100 ms, asserts `absolute` at 600 ms.
  - `blocked` mode: asserts no timeout across a 350 ms post-init pause with a 100 ms lease.
  - It also asserts the five `unavailable` declarations.

**Lawful reading.**
- On the requirement text (027/028/030) and design §3/§4, reading (i) is lawful **for containment**: the lease over admitted activity governs termination, and unknown coverage protects only the no-progress classification.
- The accepted MGMT-01 realization and its test encode the opposite: unknown coverage protects a live silent actor.
- Any repair that meets the target turns both of that test's modes red. That test is outside my write set, and changing it overturns an accepted reading.

## Executive decision

1. **R1 (realization repair, if the owner rules that MGMT-01 "unknown coverage" protects classification only).**
   - In `liveness.ts:803-809`: contain on `leaseExpired && processLive` regardless of coverage, keeping the existing reasons.
   - Classification stays coverage-gated and `unknown_required_coverage` stays.
   - No new event kind, timeout class or Public member. The threshold validation (`liveness.ts:619`) and admission (`runtime_liveness.ts:457-483`) already accept `inactivity`.
   - Requires rewriting the management-supervision test (both modes), and sweeping the installed tests with short leases (`ABG_TS_FP_TIMEOUT_MS` 100/1000; 12 files listed by `grep -l` under `T/test_env`) for stand-in pauses longer than the lease.
   - Risk: a real worker inside a long tool or API interval that emits no stream rows is contained at the declared inactivity. The declared inactivity must exceed that interval.
2. **R2 (design re-entry).** Keep the gate and design how the producers establish `tool_progress`, `api_progress` and `archive` coverage. A worker that is silent after init stays protected until coverage exists, so the target relation is not met for that case.
3. **K.** Keep the current law; then the declared inactivity value is inert for native actors, and the policy should say so.

## B1-F4 (reported, not repaired)

- **Exact failure** (B1 `scenario-c/summary.json`, `run_status`). The frames `executive`, `executive-step`, `construction` and `native-work` report `continue_waiting` / `unknown_watchdog_policy` with `externallyInterrupted: true`. The `native-work` actor reports `block` / `admitted_external_interruption`.
- **Cause.** The same owner and projection, `liveness.ts`:
  - frame contexts always have a null policy (:195);
  - a Run failure or stop sets `interrupted` for frames (:775-776);
  - the `policy === null` check (:794) comes before `interrupted` (:795).
- **Candidate fix.** Test `interrupted` before the null policy, which yields `block` / `admitted_external_interruption`.
- **Why not repaired.**
  - Step 2 was not entered.
  - The fix changes the Public `run_status` liveness value for every frame of a failed or stopped Run.
  - Design §5.1 ("Null frame policy supplies no timeout, retry, or stop inference") leaves the target disposition to the owner.

## Trace obligations (nothing changed; rows give the current reading and the R1 delta)

| | Reading |
|---|---|
| T1 consumers | **Unchanged.**<br>`runtime_liveness.ts:457/483` threshold admission and re-check: R1 admits `inactivity` when the lease expires on a live process.<br>`actor_process.ts:1467-1487` and `worker_transport.ts:518-536` rearm or contain: R1 contains at the lease instead of rearming.<br>`calculus/liveness.ts:610-621` event validation: `timeoutClass` follows `hardCapReached`, as it already does.<br>`retry.ts:4131` and `:4480-4481` read post-`actorDone` state only: no R1 change.<br>Public reads render the projection. |
| T2 timeout class | Produced by `runtime_liveness.ts:458-474` (native) and `actor_process.ts:1567-1579` (legacy L). Validated by `liveness.ts:619-620` and `event_store.ts:631-642`. Consumed at 7 sites: `c_call.ts` (2), `replay.ts`, `actor_process.ts`, `worker_transport.ts` (2), `worksite_construction_recovery.ts`. |
| T3 old instances | **No change.**<br>Under R1, completed recorded Runs replay the same way: a recorded absolute threshold has `hardCapReached`, which precedes the changed branch, and done actors take the budget branch.<br>Only an as-of read of a live actor past its lease changes. |
| T4 identities/pins | None changed. The build regenerated `contracts/capabilities/capability-definition-graph.json` and `product-toolchain-manifest.json`; both left uncommitted. |
| T5 tests | None edited or added (E3 not reached). |

## Evidence

- **E1.** `npm run build` (in T) passes at the base, 32.6 s (`X/build-baseline.txt`).
- **E2 before tables.** `X/before/{silent,late,heartbeat}/actor-events.json` and `summary.json` (projections at the last sample, the lease deadline, one wake later, and the ceiling).
  - Command: `L_SCENARIO=<s> L_TAG=before TMPDIR=/private/tmp/abg-liveness-tmp node --experimental-vm-modules --test --test-concurrency=1 X/liveness-scenarios.test.mjs` (in T).
  - Results: `✔ L scenario silent before (63989ms)`, `✔ … late before (61154ms)`, `✔ … heartbeat before (60710ms)`.
  - No "after" tables: nothing changed.
- **E4 baseline (one file).** `TMPDIR=/private/tmp/abg-liveness-tmp node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/t287-management-supervision.test.mjs` gives `ℹ tests 5 ℹ pass 5 ℹ fail 0 ℹ skipped 0`, 124.8 s (`X/baseline-management-supervision.txt`). The other liveness suites were not run, because there is no candidate.

## Deviations and residual risks

- **Own harness.** `X/liveness-scenarios.test.mjs` is a trimmed B1 harness: the same stand-in, start only, plus a `late` mode, with projections computed through the installed modules. The B1 copy is `X/b1-repro.test.mjs`.
- **Real-stream claim.** It rests on a code reading of every probe producer, not on a live provider stream; no provider calls were made.
- **Timing.** Each scenario ran once under host load. Every threshold landed within 4 ms of its declared instant.
