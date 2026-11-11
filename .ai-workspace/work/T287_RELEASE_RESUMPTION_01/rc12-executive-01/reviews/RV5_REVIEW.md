# RV5 review: RC12 readable stops (RR) and CLI status heartbeat (H)

Commentary, not law. Independent read-only Reviewer; same model family (Claude) as both Writers, no other-family reader.
- Subject 1: `claude/rc12-readback2` `f12472743..9c6886650`.
- Subject 2: `claude/rc12-heartbeat` `1b2163bac..85bd4c030`.
- Paths: T = `build_tenants/abiogenesis/typescript`; P = `T/code/src/abg`. Scratch: `/private/tmp/abg-rv5-tmp/`.
- I read the Returns last.

## Verdicts
- **Subject 1 (RR): changes requested.** One change is required: RR-1, which lands the verified test patch. With that change the subject is acceptable. RR-2 and RR-3 should be repaired. The subject's code is sound.
- **Subject 2 (H): accept with repairs.** The code change is small, correct and guarded. The evidence for the recommended 120 s inactivity is not sound in this package (H-1): repair it, or declare at least 180 s, before the live demonstration. Fix the RETRY-008 wording (H-3).

## Product Frame, subject 1
- **Outcome.** A stopped Run states what stopped it, the Result the stop came from (by the references events carry, never by position), the root's last admitted Result, and the next lawful actions. A child frame ended by a failed or blocked foldback does not read as live.
- **Authority.** REQ-P-POLICY-065–068 and the Public contracts define what. The ABG owner fold (axioms, `replay.ts` quiescence) owns runtime truth. `project_read_ports.ts` is a read-time fold over the log. Generated contracts are derived.
- **Prohibitions.** No store beside the log. No typed outcome erased into a generic flag. No stop claims more than the record shows. Recorded Runs stay readable. Axioms and replay digests do not move.

## Product Frame, subject 2
- **Outcome.** An actor whose CLI is working (model progress, a result, or its own `system`/`status` row) keeps its lease. A silent actor is contained at its declared inactivity. A heartbeat is activity, never progress, a retry, a tool use or a result.
- **Authority.** REQ-R-ABG3-RETRY and the transport requirements define what. The chain is: live classifier (`P/worker_transport.ts`) → window witness → stdout activity probe → liveness fold (`P/calculus/liveness.ts`). Archives are bytes checked by digest only.
- **Prohibitions.** No reclassification of recorded Runs. Progress, retry and failure accounting do not change. No host is left on an unsafe default.

## Findings
**RR-1 (S1): the subject turns a green test red.**
- *Claim rejected:* that `9c6886650` can be cut as frozen. RR defers "F7 vs E3" to the Executive.
- *Evidence:* `t287-recursive-failure-foldback` passes 8/8 on `f12472743` (3:50) and goes 8/7/1 on the branch (3:52). It fails at `T/test_env/tests/t287-recursive-failure-foldback.test.mjs:278` (`TypeError … reading 'disposition'`) because the folded frame's invocation is now omitted. The test pins the old presentation in two places: lines 271–282 pin "probe held, `continue_waiting`", and lines 292–305 pin the folded child as `closed`.
- *Boundary and effect:* Public read presentation against a test outside RR's grant. No runtime effect, but the tree asserts two contradictory presentations. The file is not in `T/test_env/qualification/inventory.json`, so qualification would not catch it.
- *Repair (about 15 minutes plus a 4-minute run):* accept F7. An ended frame reading `continue_waiting` on a closed Run claims more than the record shows, and quiescence already reads it as historical. Apply the Writer's patch `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/rr/foldback-test-F7.patch`.
  - I read the patch. It changes only three expectations, plus comments: probe not held, no native invocation, child `failed`. It keeps the lifecycle-fluent and quiescence assertions.
  - I applied it to my scratch copy of s1 and ran the file alone: 8/8 pass (3:57).

**RR-2 (S3): no test separates the causal descent from the prior rule.**
- *Claim rejected:* that `t287-readable-stops-foldback` proves F3, "causal descent, never by position".
- *Evidence, prior head:* on `f12472743` the new file fails 3 of 3 subtests, none on an origin: the ended probe is active (F7), `operator` is undefined, `stopStatement` is undefined.
- *Evidence, my probe:* `rv5-probe-foldback` gives the same origins on both heads, so position and cause coincide in every exercised shape:
  - fail-then-undeclared → A's second failure (ordinal 113), not the handled first (50);
  - fail-then-parent-fails → recursive-parent's own failure (216), not the handled A failure (183);
  - always-fail → the bound's judged parent Result.
- *Boundary and effect:* the REQ-P-POLICY-066 proof. A regression to a positional rule would pass every test.
- *Repair (about half a day):* add one case where position and cause disagree, for example a sibling's handled failure admitted after the stopping failure. Otherwise state that the two rules are equivalent on every shape this line can produce.

**RR-3 (S3): the ended-frame rule has two owners.**
- *Claim rejected:* F7's "the reader rule Run quiescence already uses". The read side has a copy, not the rule.
- *Evidence:* `P/replay.ts:412-428` keys run-scoped failed or blocked foldbacks by `[childFrameId, childGraphCallId]`. `P/project_read_ports.ts:1061-1100` (`stoppedChildFrames`, `endedFrameProbeFluentRefs`, `withoutEndedFrames`, `graphCallStatus`) does the same and adds a workspace variant and the GraphCall disposition. The predicate is identical today.
- *Boundary and effect:* owner fold against Public projection. Closure and Public reads diverge as soon as either copy changes.
- *Repair (about 2 hours, touches `replay.ts`, outside RR's grant):* export one owner function from `replay.ts` (stopped child frames with keys and disposition, run- or workspace-scoped) and use it in both places. Discharge it rather than record it.

**RR-4 (S4): an ambiguous lift reads as unadmitted.**
- `routeLift` (`project_read_ports.ts:1196-1202`) and `resultLift` (`:1221-1236`) return `lifted_foldback` when more than one stopped foldback is cited. The text then says "the child foldback it was lifted from is not admitted exactly" (`:1333`), although both are admitted.
- Reachability not established.
- *Repair (text only, about 10 minutes):* "names no single admitted child foldback", matching `stopping_route`.

**RR-5 (S4): `graph_call_result` for a failed folded child refuses `not_found`.**
- Readiness now follows `graphCallStatus` (`:1427ff`), so under an active, held or gap-stopped Run the refusal changes from `not_ready` to `not_found` (disclosed).
- `not_ready` was false, since the child can never be ready. `not_found` calls a failed GraphCall absent.
- No refusal code in {invalid_history, invalid_packet, target_not_ready, target_absent} is truthful here. This is an owner contract decision.
- It is S4 rather than higher for three reasons: `graph_call_status` still carries the typed `failed`; the prior `not_ready` was also untrue; and closed or failed Runs already refused with `not_found`.

**RR-6 (S4): the owner `run_replay` viewDigest covers unfiltered liveness.** `P/replay.ts:2262-2290` digests unfiltered `nativeLiveness`/`holdsAt`, while the read side presents the filtered values. Public `run_replay` exposes neither, and nothing recomputes the digest. Record this in the design; filtering before the digest would move recorded semantic digests.

**RR-7 (S4): completed Runs with a stopped foldback move.**
- In RR's T4, hog-fail-once and public-fail-once have 18 of 26 reads equal. `activeFluents`, `nativeLiveness`, the child status (`closed`→`failed`) and the read projectionDigests move.
- The `workspace_replay` Public coordinate moves with them.
- E4 names only hog-success (18/18) and should say this.

**RR-8 (S4): disclosed and confirmed.**
- An operator stop says "No next lawful action is admitted." while native admission accepts `run-resumed`. This is true for the Public surface, which has no binding for it.
- Never run: a stopped `run.continue`, a non-empty `nextActions`, the `missingLink` values `judged_result`/`lifted_foldback`/`child_result`, and fan-out, retry-exhaustion and multi-lift stops.
- 27 regenerated files are uncommitted. No RR test is in the qualification inventory.

**H-1 (S2): the compaction-heartbeat evidence is not sound in this package.**
- *Claims rejected:* `H_RETURN.md:72` "In 196 tracked archives every row of these lengths is `system`/`status` (243 rows)"; `T/design/T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md:210` "a compaction emits a status row every 30 s"; `H_RETURN.md:90` "120 s holds with a 1.44× margin".
- *Evidence:*
  - In those 196 archives, all 243 status rows are `requesting` and exactly 157 bytes. No row is 176, 182, 185 or 186 bytes, and none is `compacting`, so the claim is vacuous for four of the five lengths E3 counts.
  - A `compacting` row in the recorded shape would also be 157 bytes (the two words are the same length). So the 176–186-byte rows have another shape.
  - Their identity rests on RV1's reading of the RC6 archives, outside the grant (D1, last risk).
- *If they are not status rows:* scopes 9, 11, 21 and 22 keep gaps of about 111.9, 126.0, 89.0 and 129.4 s, and 120 s contains 2 of 24. These figures come from H's E3 "before" column; I did not recompute them, because I did not run the HS03 oracle. The same applies to the 180 s figure below.
- *Boundary and effect:* a ratified design sentence against recorded CLI behaviour. A live demonstration at 120 s can end a compacting actor as idle.
- *Repair (1–2 hours, needs the RC6 archives):* quote one row per length by content in §4.1, or replay the classifier over the archived bytes at the recorded capture instants. Until then declare at least 180 s: at 180 s, 0 of 24 are contained, before or after H.

**H-2 (S2): the 60 s fallback still ends a working actor** (pre-existing; disclosed as F1(3)).
- *Evidence:* `P/actor_process.ts:714` defaults `ABG_TS_FP_TIMEOUT_MS` to 60 000 ms, which contains scope 2's 83.5 s first-response wait (1 of 24). Declared-testing live mode uses 120 000 ms. The UAT runner reads its config (`T/test_env/uat/runner.mjs:125`), and `config.example.json:28-29` declares 18 030 000 / 18 040 000 ms, which holds a stalled agent for about 5 hours.
- *Effect:* an undeclared host ends a waiting actor, and the UAT example never ends a stalled one.
- *Repair:* the live configuration declares 120 s after H-1, or 180 s until then. A code floor or launch refusal is an owner decision plus a requirement (about half a day).

**H-3 (S3): the repriced RETRY-008 states a rule the code does not have.**
- *Claims rejected:* `specification/requirements/abg/REQ-R-ABG3-RETRY.md:31` "`no_output` is classified only when probe coverage establishes it", and `H_RETURN.md:86` "The code already says this".
- *Evidence:*
  - `P/transport_contracts.ts:134` returns `no_output` for any clean, zero-exit, retry-free attempt with structured events and an empty final output. It reads no coverage.
  - Coverage gates only the liveness reason (`P/calculus/liveness.ts:810`), a different relation.
  - The inactivity → `transport_failure` half is true on both profiles (`:124`, `worker_transport.ts:142`).
  - Retry eligibility is unchanged: every transport class is retryable (`P/retry.ts:4153`).
  - The old mapping remains in `T/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md:73` and the frozen `T/contracts/qualification/sources/REQ-R-ABG3-RETRY.md:31` (disclosed).
  - A narrower reading does not rescue the clause. The clause sits under "timeout classes", and read that way it is true that a timeout never reaches `:134`, because `:124` returns `transport_failure` first. But then "probe coverage" refers to the liveness reason at `liveness.ts:810`, which is not a failure class. Under either reading the clause needs rewording.
- *Repair (about 1 hour):* state the classifier's real condition, fix M03:73, and restage the authorities.

**H-4 (S4): notes.**
- (a) Profile L ignores status rows (`actor_process.ts:1529-1543`), only for stores whose contract is not current (`:1266`).
- (b) A status row inside the TERM grace flips the as-of read (design `:211`); no consumer acts on it.
- (c) The logged probe does not say whether progress or a heartbeat qualified, so a heartbeat-only actor is bounded only by the absolute cap (default 1 hour).
- (d) The HS03 noise row in `m5-worker-transport` changed from status to `rate_limit_event`. This is the inversion the change requires.
- (e) The new test's 157-byte rows prove the rule, not the identity of the recorded compaction rows.
- (f) The heartbeat test is not in the qualification inventory (disclosed); management-supervision is.

## Answers
- **Q1.** Correct and identical to the prior head (RR-2) for one lift, a handled failure followed by an unhandled one, and a parent failing after a folded failure. Several lifts, fan-out and retry exhaustion were not exercised; a partial stop consumes its row's judgment (`traversal_route.ts:3786-3792`). A missing link is a typed, schema-required `{not_admitted, missingLink}`, and ambiguity maps to it too (RR-4).
- **Q2.** Each clause comes from a typed field. `stopStatement` on start equals the status statement in both probe scenarios. Continue shares `continuationOutcome` but was never run on a stopped Run.
- **Q3.** Public status and replay agree on status, and replay exposes no fluents or liveness. Owner digest: RR-6. Refusal: RR-5. That no stored read digest moves rests on RR's grep; I did not re-verify it.
- **Q4.** The rule is identical but implemented twice (RR-3). A blocked foldback is consistent with `calculus/axioms.ts:1178-1205`, which ends frame and GraphCall fluents but not the probe. Both foldback sites carry the parent runId, so the filter holds under an active Run. Checked by code only.
- **Q5.** The built delta (26 contracts plus the manifest) matches T3: `lastRootResult` replaces `evaluation`; `operator`, `nextActions` and `missingLink` are required; gap items change from `\S` to minLength 1; invoke and continue gain an optional `stopStatement`. Nothing pins `stop.evaluation`, and exact014 is masked by a pre-existing red.
- **Q6.** Completed Runs are byte-identical only without a stopped foldback (RR-7).
- **Q7.** The new file is red on the prior head only through presentation or shape, and its origin assertions pass for a weaker reason (RR-2). The three never-run items are confirmed (RR-8). RR-1 is green turned red.
- **Q8.** A heartbeat is any complete system/status row, checked after the `api_retry` return.
  - Recorded rows: 243, all `requesting`. The three retry archives read `init, status, [commands_changed,] api_retry×10, assistant, result`, with no status row between retries and no pings.
  - False positive: a stuck CLI renews until the absolute cap.
  - Misses: none among recorded kinds; compaction rows are H-1.
- **Q9.** Progress, retry counts and failure class are unchanged, and the heartbeat count is in no snapshot or payload. The retry tests at l.22/33/59/87 are byte-identical (first hunk at l.105) and pass 5/5 on H. l.87 is the non-window path; heartbeat case 4 guards the window path.
- **Q10.** Capture is closed after a direct exit (passes on both heads). TERM grace: H-4(b). Nothing derives qualifying instants from archived bytes; `coldStdoutWindowArchive` checks bytes and digests only.
- **Q11.** The classifier runs only in live window capture (`actor_process.ts:1344/1506`). Windows and probes are admitted events, so replay cannot move. HS03 oracle not run.
- **Q12.** 157 bytes is sound by the corpus. 176–186 bytes is unattested here, so the "after" figures and the 120 s margin rest on RV1 (H-1).
- **Q13.** The transport half holds on both profiles. The `no_output` clause is false (H-3). M03:73 and the frozen copy still state the old mapping.
- **Q14.** Declare at least 120 s after H-1, or 180 s now. The 60 s default and the 5-hour UAT example are unsafe in opposite directions (H-2).

## What I ran
All runs used `TMPDIR=/private/tmp/abg-rv5-tmp`, one file at a time.
- **Builds:** `npm run build` exits 0 in my worktree T (31 s) and in archives of `f12472743`, `9c6886650`, `85bd4c030` and `1b2163bac`.
- **Subject 1, branch:** `t287-readable-stops` 5/5 (3:47); `t287-readable-stops-foldback` 3/3 (68 s); `t287-recursive-failure-foldback` 8/7/1 at l.278 (3:52).
- **Subject 1, branch with the F7 patch** (applied to my scratch copy): `t287-recursive-failure-foldback` 8/8 (3:57).
- **Subject 1, prior head:** `t287-recursive-failure-foldback` 8/8 (3:50); `t287-readable-stops-foldback` 0/3, shape and presentation only (54 s).
- **Subject 1, probe and contracts:** `rv5-probe-foldback` on both heads, plus always-fail on the prior head; origins identical. Prior and s1 contract builds differ in 26 files plus the manifest, the same set as the uncommitted files.
- **Subject 2, H:** `t287-liveness-heartbeat` 6/6; `t287-management-supervision` 5/5 (147 s); `m5-worker-transport` 39/39 (62 s). No red, so nothing was rerun.
- **Subject 2, base:** `t287-liveness-heartbeat` 2/4 (missing key; containment; 4 !== 8; null !== 28.9). Supervision lines 1–104 are unchanged.
- **Census:** the 196 tracked `*-stdout.log` archives in my worktree (43.8 MB): row kinds, byte lengths and retry sequences.

## What I did not check
- The RC6 archives, the HS03 oracle and `t287-calculus-fold`, all outside the grant, so RV1's compaction reading is unchecked.
- The live CLI; no provider calls.
- A stopped `run.continue`, fan-out, retry exhaustion, several lifts, and a blocked or workflow-level foldback under an active Run.
- RR's T4 digests, its "equal and green" list, and `t287-readable-stops` on the prior head.
- H's base-build claims for `t287-management-supervision` (4/5) and `m5-worker-transport`. I did not run either file on the base build.
- Lints, whole suites, and the cut script beyond its diff stat.
