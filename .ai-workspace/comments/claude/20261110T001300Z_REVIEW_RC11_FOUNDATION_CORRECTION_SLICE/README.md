# Review: RC11 foundation-correction slice (`ed17ab148`) and the Effect functional refactor direction

Commentary, not law. Reviewer only (T-287, pen with Codex). No code run; no activation; no disposition.

## 0. Subject and what was checked

Subject: branch `codex/rc11-foundation-correction`, three commits over the delivered RC11 source `e2ba05da5`: `db9cf974a` (Effect principle correction and refactor plan), `65f311e73` (observer and m5 transport proof repair), `ed17ab148` (W2-05 oracle alignment). Pinned builder RC10. The Codex status report of 2026-11-10 06:23 local is the claim set.

Checked: the three diffs in full (design, specification, requirement, instruction files, 1,058 lines of test change, the 158-line observer module); the functional refactor plan and the functional assessment behind it; the authority review and its recheck; the Phase 1 source review, the proof conjunction and the six-command campaign receipts; the oracle follow-up triage and its installed proof receipt; the RC10 and RC11 root dispositions and the RC11 root-cause plan; the Phase 2 design intake, proof intake, scope and native admission; the current production source for `owned_process_lifetime.ts`, `runCommand`, `runHttpProbe`, `oneHttpRequest` and the worker `runProcess`; a survey of module-level retained collections across `code/src`. Main is still at `dd6938dd8` with no peer post since my RC9 review.

## 1. Verdict

**The slice's claims are correct and verified. No production source changed. The design direction is right in principle, and three things should change before Phase 2 lands.**

- The Effect principle correction replaces a mechanism blacklist with an authority boundary. That is the right correction, and the text keeps the three invariants that actually protect the Product: one production runner, interruption is not absence, monotonic time is not event time.
- The test repairs are sound. The controlled-clock cases run the real lifetime owner through its declared host seam, the physical cases now assert their premises instead of assuming them, and evidence is retained before assertions. Unit 96 passes and six skips, lifetime 18, m5 39 and owner chain 3 are all in receipts, independently conjoined.
- **F1.** The W2-05 oracle was deleted when it should have been narrowed. The defect was a substring regex that rejected call-local collections. The law it guarded, §10.11's enumerated retained owner facts, still exists and the tripwire fired once for real on RC8.
- **F2.** Phase 2 as scoped refactors the lifetime's internals and scopes one caller's resources. The duplication sits one layer up, in the three callers, and Phase 2 does not name it. Its deletion benefit as written is small, and it opens an interim dual surface that only Phase 4 closes.
- **F3.** The Phase 2 native author runs under the same 900 s, 180 s, 100-turn ceiling that the Phase 1 author pass exceeded with less to write. Expect a timeout unless the ceiling is raised or the slice is split.

The cycle took about 2.2 hours from correction to oracle acceptance, against 15.7 hours for RC9. One of three native passes timed out, against three of three.

## 2. Report claims against records

| Claim | Record | Standing |
|---|---|---|
| Completed on pinned RC10, committed through `ed17ab148` | Branch log; `rc10-operational-pin-01/BUILDER_PIN.json` referenced by every acceptance | Correct |
| Corrected the Effect principle | `db9cf974a`: constitution §9, §5.6.3 N13, §10.1.1, §10.1.3, §10.1.4, §10.7, §16.3 note, new §16.15; PRODUCT.md item 5 and new paragraph; SAGA-FRONTIER-008/-009; AGENTS.md and CLAUDE.md paragraphs; eight generated mirrors | Correct; authority review falsified on one S3 clarity remnant at §5.6.2C, recheck satisfied |
| Removed the remaining Map/WeakMap restriction | `ed17ab148`: W2-05 test and Common Library Design §10.12 sentence | Correct, see F1 |
| Repaired the observer with scoped Effect | `support/t287-publication-observer.mjs` (158 lines) and `t287-publication-observer.test.mjs` (8 cases) replace a 17-line Promise observer and its two call sites | Correct |
| Fixed transport-test timing, record and evidence defects | m5 diff: seven controlled actual-owner cases on a bigint controlled clock; physical fixtures with a 5 s cold-start allowance and premise chains; `retainEvidence` before every assertion | Correct; the first author pass left an S2 and an S3, fixed by a narrow successor before acceptance |
| Unit 96 passes / 6 skips | `unit/RETURN.json`: 102 tests, 96 pass, 6 skip, 0 fail, 156.9 s; old 95 names conserved plus seven controlled cases | Correct |
| Lifetime 18/18, transport 39/39 | 12.3 s and 62.5 s receipts, zero skips | Correct |
| Installed owner chain 3/3 | W2-05 receipt, 74.0 s, on fresh proof archive `fdbf93de`, product content `778f5667` | Correct for the successor; not the delivered rc.11 archive `f0f5717e` |
| Independent review found no remaining scoped issue | Phase 1 proof conjunction satisfied; oracle conjunction satisfied; both resumed-context, non-author, no clean-context claim | Correct as stated |
| Local, unmerged; RC11 install unchanged and unqualified | Main at `dd6938dd8`; installs directory unchanged since 9 Nov 21:35 | Correct |

Production bytes in the slice: none. The diff touches design, specification, instructions, qualification mirrors and tests only.

## 3. What the slice gets right

**The principle.** The active cut banned Effect `retry`, `Schedule`, `Clock`, `Fiber`, `Queue`, `Ref`, `FiberRef`, `Stream` and `STM`, while the same constitution selected Effect over native Promises for scope and cancellation. The triage named that tension correctly. The replacement text says what the Product actually needs: owners select meaning, policy, topology, sequence, admission and absence criteria; the library implements them; a carrier does not acquire authority by carrying a value. §16.15 also adds the two physical cautions that matter for Phases 2 to 4: fiber interruption or scope close is not evidence of process absence, and a race that waits for its loser or an unbounded finalizer does not become bounded by naming a deadline.

**The observer.** One `Ref` of frozen state, one `Deferred` for the seal, two scoped fibers. Eligibility is checked before each probe and again at settlement, strictly before the cutoff. `stop()` seals synchronously and never awaits an unresolved read, because the read fiber races the probe's settlement against the seal and both sides are interruptible. The deadline fiber chunks sleeps at the host maximum. The eight controlled cases cover stop during a pending read, settlement at 10 and 11 against a cutoff of 10, errors and nulls, huge cutoffs, and a real never-resolving read with no timer residue. This is the old observer's four defects closed with a proof for each.

**The controlled transport.** `m5ControlledTransport` injects only `spawn` and the lifetime host through the private-owner harness, so the real `createOwnedProcessLifetime` and `createMonotonicDeadline` run on a controlled bigint clock. The seven cases pin the laws that the physical tests can only sample: a true acknowledgement renews inactivity and the cutoff excludes later semantic bytes; a false acknowledgement never renews; the absolute deadline never renews; post-exit bytes reach the closed-capture branch; identical ordered bytes give one outcome under four partitions including byte-at-a-time; the completion instant is the capture that completes the record under every split; a rejected drive retains its trace without awaiting the pending owner. This harness is reusable for the Phase 2 reducer proof and should be.

**The physical premise chains.** The resistant worker now proves its TERM handler was installed before the cutoff. The post-timeout case proves the late write was attempted and completed. The post-exit case proves the descendant was ready before the leader's exit and that the late write reached an outcome, which in the retained run was a real 109-byte attempt ending in EPIPE. The progress case requires completion after the initial lease by construction: 111 records at 50 ms against a 5 s lease. A missing premise fails the test instead of passing it vacuously.

**Honesty about cause.** The plan, the root-cause record and both reviews say the same thing: a 600 ms fixture delay reproduces all six historical failure predicates with unchanged owner clocks, which proves a sufficient mechanism, not the historical cause. Neither a transport regression nor the old Effect restriction is established as the cause of any failed author run. The debts close for the exact successor and the stated proof. That is the right claim size.

**Cost.** The repaired nine-file unit lane runs in 157 s against the 860 s RC11 run that ended in exit 1. The 5 s allowances did not blow up the lane.

## 4. Findings

**F1. The W2-05 oracle was narrowed to nothing; narrow it to module scope instead.** Before `ed17ab148` the test required exactly three module-level declarations in `definition_binding_mechanics.js` and rejected every other `WeakMap` or `new Map` token across the five owner-chain files. The follow-up triage's counterexample is correct: a call-local `Map` in `establishDeepImmutability` would be rejected, and so would a comment. The defect is the substring regex over the whole source. The replacement checks only that three legacy seams are absent and states that owner facts "rest on behavioral owner proof." But the behavioral W2-05 case does not change owner truth between two calls, so it cannot see a hidden cross-call cache. The oracle fired once for real: on RC8 it caught the three WeakMap additions and forced the §10.11 X1 to X4 design that now names them. §10.11 still enumerates the retained facts. The claim-congruent check is a line-anchored module-scope pattern, `^const name = new (Weak)?Map`, over the five chain files, allowlisting `selectedDefinitions`, `establishedInvocations` and `gatedResourceMembers`. A survey of `code/src` shows those are today the only module-level collections in the five chain files, so the narrowed check passes now and keeps firing when the next one appears. This is not an API gate. It is the cheapest falsifier for the law §10.11 states.

**F2. Phase 2 targets the lifetime's internals and one caller; the duplication is one layer up.** See §5.

**F3. The Phase 2 author ceiling is the one Phase 1 exceeded.** The Phase 1 author pass had four test paths to write. It reached 900 s with the syntax checks and eight observer cases done and the m5 proof unexecuted; a narrow successor finished the work. Phase 2 writes two production files, a possible new state module, three tests, a design reconciliation and the plan, under the same 900 s absolute, 180 s inactivity and 100 turns. The run started at 00:03Z today. Either raise the ceiling to what the narrow successors actually consumed, or split Phase 2 into the reducer slice and the owner slice described below.

**F4. The owner-chain proof ran on a fresh proof archive, not the delivered install.** The 3/3 result is on archive `fdbf93de` built from the native-04 source. It proves the corrected oracle and the installed chain on the successor. It does not re-qualify the delivered rc.11 install, and the report says so correctly. The accepted closure is for the successor source and that archive.

**F5. The observer pilot shows mechanics, not deletion.** The 17-line observer became about 95 lines of observation logic plus 60 lines of evidence retention. The guarantees gained are real and were missing. No deletion was expected in test code. The pilot therefore sets the bar for Phase 2: the production phases must show named deletions, which the plan and the intake both require. Hold them to it with numbers, see §5.

## 5. Design direction

**What the three callers each re-implement today.**

| Owner | Size | Its own coordination |
|---|---|---|
| `createOwnedProcessLifetime` | 298-line file | 15 mutable fields, 3 deadlines, 9 mutually re-entrant closures, one re-entrancy guard after a throwing signal observer |
| `runCommand` | ~85 lines | 4 flags, 2 capture buffers, signal record, 1 deadline, heartbeat interval, 2 listeners, `try/finally` cleanup |
| `runHttpProbe` + `oneHttpRequest` | ~160 lines | 11 mutable fields, 2 deadlines, heartbeat, 2 listeners, two polling loops, a `completion.then` flag, a 16 MiB response bound |
| worker `runProcess` | ~240 lines | 14 mutable fields, 3 deadlines, 2 listeners, window and archive machinery with rollback |

Common to all three callers: spawn detached with pipes; create the lifetime; arm deadline(s) that call `requestTermination`; push chunks under a capture cut; record the signal sequence; `await lifetime.completion`; a `finally` that cancels timers and removes listeners; classify the terminal and build the observation. Distinct per caller: the worker's acknowledgement-renewed inactivity lease and its durable windows; the HTTP probe's concurrent port-file and request polling and its capture that stays open past exit; the command's heartbeat and report gating.

**What one function would own.** A bounded, captured, owned process: spawn, lifetime, inactivity and absolute deadlines, ordered lossless capture with a declared cut, signal record, terminal classification, returned as facts plus streams plus timeout class. Each caller then adds only its distinct layer: the worker its acknowledgement hook and archive windows, the probe its concurrent port and request reads, the command its heartbeat. That function is where the deletion is, roughly forty lines of coordination in each of three places, and where a single Effect scope earns its keep once rather than three times.

**Phase 2 as designed.** The intake proposes an immutable physical state with a pure transition inside the lifetime, a synchronous bridge for signals, probes and timers, the sync API preserved for HTTP and worker, and `acquireRelease` scoping of runCommand's child, listeners, heartbeat and timeout. Two of those are good and one is misplaced.

- The reducer is a quality refactor the lifetime needs regardless of Effect. The re-entrancy guard at line 261, where a throwing signal observer may have already strengthened TERM to KILL, is the kind of hazard a reducer removes. It changes no caller and can land under the existing 18 lifetime cases and 12 controlled combinations plus the new counterexamples the intake lists. Keep it Effect-free; the intake already says the bridge must not queue through Fiber or Queue.
- The bounded finalizer claim is right for the wrong reason. A release that awaits `completion` is finite because the lifetime's own cleanup deadline of twice the grace plus drain is finite, not because Effect bounds it. The plan's own warning about uninterruptible release applies; the proof of boundedness stays with the lifetime cases.
- Scoping runCommand's resources alone deletes its `try/finally` and little else, and it leaves the Promise `completion` plus an Effect scope side by side until Phase 4. The intake calls the resolver "a necessary compatibility boundary, not a second state machine." That is true only while Phases 3 and 4 follow. RC7's HS-01 exit stayed incomplete for a cycle; a stalled Phase 3 leaves two coordinators in production.

**Recommended Phase 2 definition.** Two slices. First the reducer inside the lifetime, all three callers unchanged, proved by the existing controlled combinations and the intake's added counterexamples. Second the shared bounded-capture owner, consumed by runCommand first, with the Effect scope living in that owner once. HTTP and worker adopt it in Phases 3 and 4 by adding their distinct layers, and the Promise `completion` retires with the last adopter as a named step. The exit gate for the second slice is a list of the state fields, closures, timers and listeners deleted from runCommand and a net line delta for the two files; a wrapper-only result or net coordination growth is a reject, which the intake already states.

**Phases 3 and 4, and GC03.** Phase 3's real content is the concurrent probe: port reads and requests racing the process while the capture stays open. The late-read falsifier the assessment names, `observing()` checked only before awaits, is the right first case. Phase 4 should remain last; its window and archive rollback machinery is the one place where an asynchronous queue would lose bytes, and the plan's refusal of `asyncPush`, sliding or dropping streams and per-chunk fibers is correct. The GC03 host reader is a direct, non-detached child, so it needs a direct-child binding of the owner, not the group signal policy; the assessment says so and I agree. The endpoint and client are a separate socket resource and should stay separate.

**On the principle's reach.** "No per-API gate" is about authority. It does not say that retained module-level state in the installed owner chain is unconstrained. Sixty-odd module-level WeakMaps and WeakSets across `code/src` carry identity and admission facts by reference, which is the "references, not copies" pattern already ruled. The question for each is lifetime and who established the fact, which is exactly what §10.11 and my RC9 F1 were about. F1 above keeps that question answerable by machine.

## 6. Prior findings and limits

RC10, delivered 2026-11-09, discharged my RC9 F1 and F2 per its root disposition: basis rows and history bodies are released at the operation lifetime with a 50-call measurement whose post-call gauges read zero, and the §10.12 duplicate claim was corrected. I have not re-verified RC10 source; this is from the record.

Limits: I ran no code. The Phase 2 native author was running during this review and its output is not reviewed here. Line and field counts in §5 are from reading the current source, not from a tool. The authority and proof reviews I relied on are resumed-context Codex reviews that disclaim clean context; I read their subjects directly where the claim mattered and agree with their verdicts.
