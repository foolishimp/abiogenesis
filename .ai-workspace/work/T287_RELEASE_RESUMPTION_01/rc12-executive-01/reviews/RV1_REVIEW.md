# RV1 review: ABIogenesis RC12 `claude/rc12-cutprep` `62fd17271..1b2163bac`

Independent Reviewer RV1 to the Executive. Commentary, not law. I share a model family (Claude) with the authors of L, L2 and K, and no Codex or other-family reader was used.
Paths: W = `/private/tmp/abg-rc12-liveness-20261111`, T = `W/build_tenants/abiogenesis/typescript`, X = `/private/tmp/abg-rv1-tmp`.
The worktree is unchanged by me: `git status` and the hashes of the two build-regenerated files (`cad155a8…`, `c292fb63…`) match before and after.
Peer posts: `62fd17271..main` holds 8 Executive brief commits, and none mentions compaction, status-stream admission or RETRY-008.

## Product Frame

- **Outcome at stake.** ABIogenesis 5.0 (GOAL-035, T-287) has ABG supervise real Claude actors. ABG contains a stalled actor at its declared lease, never kills a working actor, and never invents a no-progress classification. RC12 is a local, unqualified development candidate for a live demonstration.
- **Authority split.** Specification (WHAT) owns TRANSPORT-025..030 and RETRY-008/009; design (HOW) owns §§2–5 and the dated §4.1. ABG alone owns admission, the liveness relation, the fold and thresholds. The host owns the policy values (`ABG_TS_FP_*`). The provider CLI is an external tool whose rows are evidence only. The cut scripts are `.ai-workspace` tools, not Product.
- **Prohibitions.** Interruption is not proof of absence. Clock time is not admitted event time. Replay does not author. There is no hidden default, second runtime or controller. Unknown coverage cannot produce no-progress. No qualification transfers between candidates.

## Verdict: accept with repairs (no S1)

**L** is the lawful reading and is correctly realized as one precedence change (`calculus/liveness.ts:803-805`). It makes the declared inactivity binding on every native actor for the first time, which exposes F1 (S2): admitted activity is narrower than the law, and the shipped values kill recorded working actors. Repair F1 before the live demonstration.

**K** is sound, and its artifact reproduces byte for byte. The open items are record truthfulness (F3, F6) and the Executive's disposition of the known reds.

## The ruling against the requirement and design text

The ruling is the lawful reading.
- **Requirements.** TRANSPORT-027 governs liveness by "an inactivity lease over admitted probe activity". TRANSPORT-028 allows the cap "only as outer safety evidence". TRANSPORT-030 bars a flat timeout as the effective authority.
- **§2 (l.57), "An unavailable probe is unknown coverage, not evidence of silence".** This does not bind containment.
- **Rule 1 (l.161-163).** It refuses a decision that lacks "coverage needed for a claimed decision" and states "Unknown coverage cannot produce no-progress". This does not bind containment either: lease expiry claims nothing about unknown sources, only about admitted activity.
- **§4 (l.192-194) and §3 (l.132).** §4's "keep distinct causes" and "containment never grants no-progress classification" presuppose containment without classification, and so does §3.
- **Base violated 027/028/030 in effect.** No producer ever makes `tool_progress`, `api_progress` or `archive` observed, so the lease was inert and the cap was the only bound. HS03 shows one threshold in 24 actors, and it is `absolute`.
- **What the ruling overturns.** Only the T287-MGMT-01 realization and its test, which are ticket acceptance (`.ai-workspace/tickets/active/T-287-…md:2513`), not Product or requirement law.
- **Change class.** The subject adds a design clause (§4.1), so it is a `design_reframe`, not the "realization repair" of L_RETURN:64.
- **What §4.1 adds without a requirement owner.** An unchecked host "Policy obligation" (F1).

## Findings

### F1 (S2): admitted activity is narrower than TRANSPORT-025/027, and the shipped values kill recorded working actors

**Rejected claim.** §4.1's obligation, "tool, API and archive progress have no producer", explains silent work. L2_RETURN:108 calls 180 s only "maybe too short".

**Evidence.**
- HS03 holds 24 real stream-json actors (RC6 D5, inactivity 1,800,000 ms). They show 8 admitted-activity gaps of 60 s or more, in 5 actors: scope 2 84.6 s (startup); 9 111.9 s; 11 109.0/126.0 s; 21 89.0 s; 22 102.9/129.4/98.2 s.
- I checked all 7 in-run gaps line by line in the RC6 archives and event times. Each is a CLI compaction: `system/status` "compacting" rows at +30.0, +60.0, +90.0 and +120.0 s, then status null, `compact_boundary`, `user`. The CLI heartbeats every 30.0 s throughout.
- Scope 2's gap is the first API request: `init` and status "requesting" at +1.1 s, then the first `stream_event` at +84.6 s, with no heartbeat in between.
- `worker_transport.ts:339-348` renews the lease only on model progress, and `actor_process.ts:1538-1540` classes status rows as "protocol bookkeeping". Three texts say these rows renew:
  - Design §2 (l.84-89): "A genuine declared worker heartbeat/progress signal … does renew its lease. Runtime asset writes attributable to that invocation also renew it", "without a vendor or source-name allowlist that silently excludes valid activity".
  - TRANSPORT-025 lists "heartbeat/status stream".
  - TRANSPORT-027: "Any admitted activity … shall reset the lease".
- The gap was harmless on base because the lease was inert. L makes it reachable.
- Contained HS03 actors by declared value, now versus with the status stream admitted:
  - 60 s default (`actor_process.ts:714` → `plan.timeoutMs` :910/:1067 → policy :1100): 5/24 now, 1/24 admitted (the startup).
  - 120 s live testing (`test_env/support/declared-testing-capability.mjs:52`): 2/24 now (scopes 11, 22), 0 admitted.
  - 180 s (RC11): 0 now, at a 1.39× margin.
- CE1 (X/tests; stream-json, 120/120/600 s, sampled at 130 s): HEAD gives `controlled_terminate/inactivity_expired` and the threshold is admissible. Base gives `continue_waiting` and refuses it.

**Boundary.** The host key is invocation-wide and shared with the worksite command gate (`product/worksite_command_execution.ts:186-189`). The 60 s fallback is recorded in each binding, but it becomes the effective authority whenever the host declares nothing.

**Sunny-day effect.** The four compacting actors (24–101 min) are each contained at their first compaction and fail with `transport_failure`. A retry that reaches the same context size compacts again.

**Repair (small to moderate).**
1. Admit the CLI status stream as lease-renewing activity, distinct from progress, with classification unchanged. This is a realization step under 025/027 and §2. It closes all seven gaps; the longest interval becomes 30.0 s.
2. Until (1) lands, the demonstration host and the live fixture declare an inactivity of at least 300 s. After (1), the floor is at least 120 s, set by the first-request wait.
3. Owner decision: refuse a native stream-json launch below a declared floor rather than fall back silently to 60 s, and give the obligation a requirement.

### F2 (S3): a new test pins a RETRY-008 violation on the now-reachable native inactivity path

- `REQ-R-ABG3-RETRY.md:31` maps `inactivity_timeout` → `no_output`. `transport_contracts.ts:112-135` makes every timeout `transport_failure`.
- `t287-management-supervision.test.mjs:163` now asserts `transport_failure` for native inactivity. The legacy path at :101 already did.
- A literal `no_output` would break rule 1 and §4.1. Retry eligibility is unchanged because all three classes are retryable (`retry_progress.ts:292`), and Public reads show `transport_failure`.
- **Repair.** A `requirement_reprice` of RETRY-008 (owner decision), not code. L2_RETURN:51 disclosed the mismatch; a shipped test now asserts it.

### F3 (S3): the rc.12 commit would carry false present-tense claims

- `T/release-claim.md:1-3,22-23` says "This source selects `5.0.0-rc.7`".
- `T/test_env/fixtures/abi5-root-candidate-basis.json` holds the rc.4 identity, which `test_env/support/candidate-basis.mjs:6` reads for r1–r9 and the root harness.
- The stamp census (`stamp-rc12.mjs:56-62`) looks only for rc.11, so both survive. Neither is packed, so the artifact is unaffected.
- **Repair, in the stamp commit.**
  - Restate the claim per K_RETURN:98-100, or move it to history.
  - Refresh the basis with `scripts/refresh-candidate-basis.mjs` after the build. `test_env` is unpacked, so the digest is unchanged. Require its `artifactDigest` to equal the cut's.
  - Otherwise, record r1–r9 as non-evidence.

### F4 (S4): inactivity containment is not sticky

- CE3 (plain_text, 1000/1000/5000): after the admitted inactivity threshold, a stdout probe at 1050 (inside the TERM grace) is admissible. The as-of read flips from `controlled_terminate` to `continue_waiting/unknown_required_coverage`.
- CE4 (absolute) keeps `absolute_safety_cap`, because only the absolute path sets `interrupted` (fold `liveness.ts:751`; `actor_process.ts:1301/1363`).
- No consumer acts on the flip.
- **Repair.** Refuse later non-artifact activity, or record the asymmetry.

### F5 (S4): `startup_expired` is unreachable for actors

The `process_lifecycle` start probe is activity (`actor_process.ts:1500-1504`), and startupMs equals inactivityMs (:1100). A first-request wait therefore reads `inactivity_expired`. The unit test's startup case uses a shape that no real actor produces.

### F6 (S4): the `--scratch-stamp` record overstates its proof

`cut-local-rc12.mjs:203` says "this archive is the built tree of that commit", but my scratch record shows 4 sites `stamped` and `generated.equal:false`. The record is scratch-only (:41). **Repair:** condition the sentence on `scratchStampDelta`.

### F7 (S4): the lifecycle lint trusts `owned_process_state.ts` by path

`check-lifecycle-boundary.mjs:42-48` rests on the premise "imported only by `owned_process_lifetime.ts`". That holds today (one importer in `code/src`), but the lint does not check it.

## Q1–Q7

**Q1. Admitted activity.**
- Admitted: `assistant`, `user`, `tool_progress`, positive `thinking_tokens`, and six `stream_event` types.
- Not admitted: `init`, `status` (including the 30 s compaction heartbeat), `compact_boundary`, `rate_limit_event`, `api_retry`.
- Longest silences: compactions (89–129 s) and a first request (83.5 s). RC10/RC11 actors (900 s cap) peak at about 41 s with no compactions, and my RC11 census found no `tool_progress` rows.
- Declared values: see F1.

**Q2. Change scope.**
- Only the new branch changes, ordered after the hard cap, archive, null policy, interruption, admitted artifact and `actorDone`.
- Untouched (the diff is `liveness.ts` only): the legacy timer, wake/rearm, TERM/grace/KILL, confirmed termination and absence.
- Inactivity admits no interruption fact (:162). The branch requires fold `processLive`, and no read samples a clock.
- Gaps: F4 and F5.

**Q3. Downstream.**
- Failure class: F2. Retry (`retry.ts:4130/4480`) reads post-close.
- Public `run_status` is `failed`, with no `no_output` or `progress_without_result` (:180).
- Unknown-effect is keyed on `termination_unconfirmed` or `transport_exception` (`event_calculus.ts:92-95`); a confirmed kill adds none.
- Preserved-source recovery excludes `timedOut` (`abg/worksite_construction_recovery.ts:77-79,269`). Currentness is unchanged.

**Q4. Recorded Runs.**
- HS03 passes 25/25 on HEAD and on base. It is non-discriminating, because 1.8 M ms exceeds every gap.
- No recorded store changes: a live actor's last sample is either activity or an absolute threshold. Threshold `projectionDigest`s (`liveness.ts:616-621`) and C1 replay digests are unchanged.
- An interrupted Run with a live actor past its wall-clock lease reads `continue_waiting` under both, so the successor `sourceReplayDigest` still reads. C2 is held.

**Q5. Tests.**
- The unit test fails 2 of 3 cases on base; case 2 is a guard. The installed silent mode fails on base by code and by CE1 (not run there).
- The sweep changed no claim silently. Blocked lease 100→3000 (L2:40), d5 class (L2:92; cancelled before and after) and lifecycle timing (L2:93) are all disclosed.
- The blocked-mode proof was vacuous on base. No test covers a realistic silent working interval.

**Q6. Cut preparation.**
- **(a)** Without the owner line: 4 offenders, red at base (`e134103a2` is an ancestor of `62fd17271`). With it: green. See F7.
- **(b) Mode and writes.**
  - Verified by running the stamp and cut dry-runs: no mode gives exit 2; nothing deletes; writes are create-once, except `stamp --apply`, which rewrites four tracked sites by design.
  - The dry-run wrote only under `--scratch`. Its npm logs stayed in the scratch cache, and nothing under `Application Support/ABIogenesis` is newer than the run.
  - `install-local` and the smoke I read only. `code/src/product` and `code/src/implementation` reference no home path.
  - Apply writes wherever `--output` and `--install-host` point.
- **(c)** F6. K's E3 digests reproduce.
- **(d)** A truthful cut must:
  - record the packlist branch (RC11 hidden-lock has 5,329 members; package-files has 5,327, without two `CHANGELOG.md`);
  - commit the regenerated files (enforced);
  - record `lint:evidence` red with exactly its five pre-existing, unpacked offenders;
  - repair F3.

**Q7. Before the live demonstration.**
- Apply F1 (1) or (2), and record each actor's maximum admitted-activity gap and its compaction count.
- B1-F4/C2: frames of failed or stopped Runs still read `continue_waiting/unknown_watchdog_policy`.
- RC11's 900 s cap contained four working actors.

## Runs

All runs in T, with TMPDIR under X. "Base" is a HEAD mirror that differs only in the base `liveness.js`.
- **`t287-liveness-inactivity`.** HEAD 3/3. Base: cases 1 and 3 fail (`continue_waiting/unknown_required_coverage`), case 2 passes.
- **CE1–CE4** (`X/tests/rv1-counterexamples.test.mjs`): results as stated above.
- **`t287-calculus-fold` with the HS03 oracle.** The pin matches. HEAD 25/25 in 13.6 s; base 25/25 in 14.4 s.
- **`t287-management-supervision` + `t287-liveness-inactivity`, HEAD, one run.** 8/8 pass; the installed case took 107.3 s; no red to rerun.
- **Lints and stamp.** `lint:lifecycle`: HEAD "no offender"; without the owner line "4 offender(s)", exit 1. `check-evidence-mirrors`: exit 1 with the five offenders of K_RETURN:64-68. `stamp-rc12`: no mode exit 2; both modes refused; `--dry-run` 4 changed, 2 regenerated.
- **`cut-local-rc12 --dry-run --scratch-stamp`** at `1b2163bac`, package-files, with the pinned rc10 dependency inventory. Status `DRY_RUN_COMPLETE_NOTHING_WRITTEN_OUTSIDE_SCRATCH`, 57 s. The artifact `sha256:6e1b49b8…` (11,038,992 bytes, 5,327 members) is identical to K_RETURN E3.
- **Python analyses** over the pinned HS03 metadata, the RC6 archives and the RC6 event times: gaps, compactions and heartbeat timing.

## Not checked

- Live provider streams: the current CLI's heartbeat and compaction behaviour, and long Bash `tool_progress`.
- Management-supervision on a rebuilt base; the `install-local` and smoke dry-runs; the d5, f09, w2-steel, UAT and full suites; worksite currentness after a mid-tool kill; C2.
- Independence: same model family; no other-family reader.
