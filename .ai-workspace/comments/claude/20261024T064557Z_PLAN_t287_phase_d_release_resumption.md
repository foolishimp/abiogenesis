# Plan proposal: T-287 Phase D, release resumption after the library and the debt wave

- Author: Claude (Executive, Fable 5.1), 2026-10-24
- Tickets: [T-287](../../tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md) owns Phase D (its `### Dependency order and exits`, rows D1/D4, D2, D3, D5, D6); [T-290](../../tickets/active/T-290-close-the-common-library-and-retire-the-registered-debt.md) owns Phases A to C and does not schedule D.
- Status: commentary. This post proposes the Phase D packages, their order and the owner's decisions. It is not an activation. T-287 schedules Phase D when the owner orders it.
- Basis: T-287's dependency table and `### Current state to preserve`; PRODUCT `## Complete 5.0 Feature Set`, `### ABG5-S07` and `## Product Completion Predicate`; GOALS M5 to M7; the Phase B close attribution; the T-290 Phase C table; the Continuation17 return.

## 1. The answer

Phase D is the six-step release sequence T-287 already states, and it cannot start as release work. It starts as a measurement of the closed source against the release contracts, because three facts stand between the Phase C close and D5:

1. 97 of the 178 lanes run at the Phase B close are red (223 failing identities, all inherited, none lost). D5 withholds qualification on any missing applicable result, so every red lane has to end green, skipped under the evidence root with its named reason, or retired with its reason, before the gate vector is bound.
2. The combined candidate, build, P1, P5, P4 and their dependents are HELD until the owner's exact grant. Nothing in Phase A to C ran the packed install or the P5 lifecycle on the library source. P1 last passed on a pre-library archive (954.636 s); P5 last timed out at 600 s with no cause established.
3. The release is a published cut, and nothing is pushed. Local `main` is 83 commits past the remote `93a4b08df`. D6 publishes annotated `v5.0.0-rc.<n>` tags at the owning repository root, so a push is a D6 prerequisite, not a courtesy.

The proposed order is: Phase C closes; the owner grants the exact candidate cut; D1/D4 in three packages (the red census and discharge, the comparison to the accepted design and Source44, the combined build with P1/P5/P4); D2 on a changed pair over the new candidate; D3 on one prospectively selected witness in a network-enabled context; D5 with the sole reducer; D6 with the push, the tags, the fresh install and the owner's acceptance. Section 5 lists the decisions this needs from the owner. Section 4 lists the packages.

## 2. Current reality

Closed.

- The common library is on `main` at `46ed04895` (T-290 Phase A). L5 delivery acceptance is recorded (the owner, 2026-10-24, on the Codex review with no S0 to S2). The release-resumption gate is open.
- The registered debt wave is closed at `a8937b837` (Phase B, twelve packages). 16 of the 24 register rows are Closed. Open: TD-04 and TD-05 (remaining increments, both routed to the Phase C evidence-root package), TD-09, TD-12, TD-19 (Phase C packages).
- Phase C is running: C-1 returned at `2c9878c3b` (the barrel export, the 40 build files, the Run-read law); 13 packages remain in the ticket's order, ending with TD-12.

Held (T-287 `## Current disposition`).

- The combined candidate, build, P1, P5, P4 and their dependents, until the owner's exact grant. L4 is partial on older subjects: P1 pass on archive `fadd07e…`, P5 successor08 timeout at 600 s/630 s with late C1 completion and C2 admission but no C2 actor result, fresh N2 equality or terminal closure. T-287 forbids a timeout-cause inference.
- Continuation17 (`T287_SANDBOX_UAT_RUN_02/operator/library-joint-proof-237/continuation-17/return-02.md`): physical installation passed; ABG refused admission of an already-held install scope under another invocation; the Testing/C2 red/repair/green/restart path did not run. Its STOP asks the owner to select lawful reuse of the completed installs or another changed-pair entry.
- The seven-UAT campaign of Run 02 is 0/7 executed; its stop was an execution context with network disabled.

Red, by the Phase B close attribution (`work/T290_DEBT_WAVE_01/phase-b-close-attribution.md`).

| Measure | Value |
|---|---|
| Integrated 48-file invocation | 405 tests, 323 pass, 61 fail, 2 cancelled, 19 skipped |
| Lanes run | 178 (48 integrated + 130 one per invocation) |
| Lanes with reds | 97 |
| Failing identities | 223; 0 NEW with an unexplained cause; 0 LOST |
| uat harness | `harness.test.mjs:471` asserts the data-mapper-full scenario's required execution budget is 18015000 ms; the scenario now projects 18025250 |

First-error classes over the 223 identities, as the table groups them:

| Class | Identities | Likely disposition |
|---|---|---|
| Fixture or evidence absent: `ENOENT` under `build/`, path `TypeError` from an unset variable, "select the frozen … fixture", file-level `'test failed'` | about 50 | the Phase C evidence-root package: run under the root, skip with the named reason, or retire |
| Obsolete API: `abg.openCall is not a function`, `projectWorksiteRevisionBindingCover`, `nativeWorkReacquisition` | 11 | TD-05's remaining increments: retire or rewrite the lane |
| Copied-prefix fixtures: "Event Calculus requires a nominal validated immutable prefix" | 6 | TD-05's remaining increments |
| Behavioral assertions: falsy and strict-equal assertions in `d2-*` and `t287-*` lanes | about 70 | per-lane: a stale expectation retired by the law it contradicts, or a defect repaired |
| `m5-event-calculus-runtime`: four cases at about 38 s (durable reopen, termination, `run_stopped`) and one locus-law case | 5 | defects until shown otherwise; these are A5-F10 lanes |
| Named single reds: `t287-management-supervision` `dependency_lock_mismatch`; `t287-f04a` `'World'` for `'Hello Ada'`; the uat budget | 3 | defects or stale constants; each repaired at its cause |
| `r10-projection-contracts:142` Run-read expectation | 1 | closed by C-1 |

The per-lane cause behind the two "about" rows is not established; establishing it is the first Phase D package.

Unpushed: 83 commits on local `main` after the remote `93a4b08df`; both repositories unpushed by the owner's rule.

Tooling in place, not verified end to end in this wave: `validator/qualification.ts` (the sole AF22 verdict), `validator/self_conformance.ts` (F11), `implementation/release_publication.ts` (AF25 `publishReleaseSnapshot`, acceptance recording), `scripts/refresh-candidate-basis.mjs` (pack and candidate basis), `scripts/sandbox-uat.mjs` (the uat runner). `package.json` is at `5.0.0-rc.1`; the only `v5` tag is `v5.0.0-dev.286`, so `v5.0.0-rc.1` is free.

## 3. What changed, and what it does to each D step

The dependency table was written before the library delivery. These are the changes since and their consequence.

| Change | Consequence for Phase D |
|---|---|
| The library (one equality body, the admit family, the select family, the one fold with `ROOT_DERIVED_RULES`, the lifecycle rule `actor_process_lifecycle`, the five typed lifecycle failure subjects, D15's helper failure route) touched nearly every module. | Source44's package and install correspondence (264 Source/528 output, 5,267 archive/installed bodies, twelve Public setup outcomes) is invalidated as bytes. D1/D4's "compare to frozen Source44" collapses to: rerun the Source44 procedure on the new candidate and reuse only the design acceptance and the procedure. |
| D15 is proven in an installed C1 to C2 case (the helper's failure after launch reaches the admitted failure; the worker relays the helper's stdout). | D2's first exit leg, "helper execution gives a failing C2 result with original diagnostics", has installed evidence on the library source. D2 still owes the physical target, the retained failure in the parent, the native repair, the green rerun and the close/reopen conservation. |
| TD-17's convention: a cause rides as a cold diagnostic subject through the refusal's existing diagnostic reference; classes and keys unchanged. | Continuation17 noted that the Public projection did not retain the install refusal's cause. D2 checks that against TD-17; if the cause is still dropped, it rides as a cold subject; if the refusal has no diagnostic member, that is a payload key change and stops for the owner. |
| The log principle (the owner, 2026-10-22 and 2026-10-24): the log is the only source of facts; every reader is a fold; derived models never authority. | D2's "close/reopen and fresh Public reads conserve producer, state and effects" and D3's "fresh readback" are folds over the log; TD-18's recovery trace is the check and precedes D2. D5's witnesses are derived digests (TD-10), so TD-10 precedes D5 or the qualification digests change under it. |
| TD-19's stop: proof packages reference the log by coordinate; no copying into new packages. | D5's proof packaging (`QualificationProofResource`, the evidence selection) binds coordinates and digests and keeps the stores under the evidence root. Nothing over 6 MB enters the repository. |
| The evidence root (Phase C): one root named by one variable; a lane skips with its named reason when the root is absent; P8's intermediate-profile stores regenerate at head or retire; the reader's admission set is not widened. | The fixture-class reds resolve there, not in Phase D. D5 then needs the root present on the qualifying machine, or the gate vector excludes the lane with a scoped disposition. A skipped gate lane is a missing applicable result. |
| The cost packages (TD-08, TD-11, TD-13, TD-23 closed; O-2, O-4, TD-09, TD-12 pending). | P5's timeout is measured again after Phase C, on the combined build. No inference before the measurement, as T-287 states. |
| `terminationConfirmed` stays in payloads until the next root event contract profile change (D5 of the delivery close). | No event profile change in Phase D. An RC with the current profile is the lawful cut; the profile change is a higher RC's. |
| The STDO basis is `stdo://releases/v3.0.0-rc.1/` (PRODUCT `## Governance And Release Boundary`). The STDO 3.0.1 notes in `specification_methodology` are authoring inputs, not operative law. | F11 and D5 bind v3.0.0-rc.1. A basis change is an F_H re-entry outside Phase D. |
| Reviews: Phase A and B took one Codex pass each at the phase close. | D3, D5 and D6 name independent assessment inside their exit, so the owner's pass is per D step, not per phase. D1/D4 and D2 keep the phase-close cadence. |

## 4. Proposed packages and order

One Worker at a time, Opus 5.5 xhigh fresh; the Executive writes records, activations, dispositions and the T-287 ledger; the owner's Codex passes are the independent assessments. Stops as in T-290: Product contract, event contract or payload key, failure class set, design reframe; plus the row-specific stops below. Phase D starts after the Phase C close and the owner's grant (decision 1 and 2).

| Package | Work | Exit (T-287's words where it has them) | Size |
|---|---|---|---|
| D1/D4-a: the red census and discharge | Every red lane of the Phase B close that the evidence-root package did not resolve: the cause named from the first error and the code, then one of three outcomes: repaired at its cause; a stale expectation retired by the law it contradicts, citing the law; a lane retired with its reason. The five `m5-event-calculus-runtime` reds, `dependency_lock_mismatch`, `'World'` and the uat budget are in scope as defects until shown otherwise. Nothing is recorded for later. | The integrated invocation and the 130 lanes are green or skip with a named reason under the evidence root; the uat harness lane is green; the attribution table's 223 identities each carry a disposition. | L (two Workers if the behavioral class is as wide as it looks) |
| D1/D4-b: the comparison to the accepted design and Source44 | The design's completion condition (§10.3) and proofs P-EQUAL to P-LIFECYCLE re-read at the candidate cut; the Source44 procedure (build, pack, clean install, Source/output and archive/installed correspondence, the twelve Public setup outcomes) rerun on the candidate; the delta to the accepted release relations named. | "Focused checks plus exact installed producer/consumer composition establish the changed release relations. Source/package correspondence and authentic setup evidence are retained or renewed only where invalidated." Stop: "Return a failed join to its owning boundary; no blind clean restart or extra controller." | M |
| D1/D4-c: the combined build and P1/P5/P4 | Under the owner's exact grant: P1 (installed Public setup through first and warm execution), then P2/P3 and the local process checks, then P4 (declaration to native selector to external F_D child to fresh readback), then P5 (all three E03 consumers including command and HTTP routes, U1 population, currentness gates). P5's duration is a measurement. | Each proof passes on its original subject, or its exact failure is returned to the owning boundary. A P5 timeout with no cause stops for the owner with the measurement. | L (wall time; P1 was 954 s) |
| D2: controlled correction and restart | On the new candidate: a fresh target root; the install; the helper's failing C2 (D15 route) with its cold diagnostic subject; the parent retains it; one native repair changes the candidate; the same checker passes; close, reopen and fresh Public reads conserve producer, state and effects (TD-18's trace as the check). Admitted16 and Continuation17 stay historical evidence; no Run migration. | T-287's D2 exit verbatim. Stop: "A refusal or uncertain effect stops and is explained." | M |
| D3: the genuine selected lifecycle | Prospective selection, recorded before the run: the exact installed candidate, the original specification, the full selected obligations, the independent oracle, the actual worker and assessor configuration, the execution context. The supported ordinary interface produces and corrects a working application; the owner's pass is the independent assessment; admitted closure and fresh readback. | T-287's D3 exit verbatim. Stop: "No hidden assistance or shrinking of the oracle." | L (one lifecycle run plus assessment) |
| D5-a: the gate roster | The fifteen families, the 4.6 conservation rows and S01/S02/S03/S06 mapped to lanes and native assessments at the candidate cut; 5.1-reserved portions get their scoped disposition from PRODUCT `### Conservation Proof`; the proof packaging shape under TD-19; the witnesses under TD-10. | Every family and conservation row has an explicit disposition and its lane or assessment; no lane in the vector is red or skipped. | M |
| D5-b: the qualification | F11 self-conformance on the exact candidate under v3.0.0-rc.1; the actual native assessments; the sole AF22 verdict over the complete gate vector; negative, recovery and workload evidence. | "Actual independent native assessments and sole AF22 yield the complete non-bypassed pre-RC verdict." Stop: "Missing applicable results, invalid basis or hard-stop violation withholds qualification." | L |
| D6: the immutable release | Push; the annotated `v5.0.0-rc.1` tag and the `v5.0.0` selector at the owning repository root (PRODUCT `### ABG5-S07`); AF25 publishes the qualified bytes unchanged with the release records; fresh install and qualification of the `installed_rc` subject; the owner's acceptance of that same RC; a fresh source-blind post-publication install identifies it. | T-287's D6 exit verbatim. Stop: "Qualifying-byte changes require the proper higher RC." | M |

Milestones: D1/D4 and D2 and D3 close M5; D5 closes M6; D6 closes M7.

What Phase D does not include: odd_glc and T-043; full Data Mapper completion; `A5-F08`, `A5-F12` and the human-response portions reserved for 5.1; the 5.1 realization compression; a root event contract profile change; an STDO basis change.

## 5. Decisions for the owner

Each with the recommendation and what follows from it.

1. **Order.** Recommendation: Phase D after the Phase C close, no interleaving. Reason: the evidence-root package resolves the largest red class, so a red census before it is redone; one Worker at a time holds. Consequence: Phase D starts in about 13 packages' time.
2. **The exact grant.** Recommendation: the candidate cut is the Phase C close commit; the grant covers the combined build, P1, P5, P4 and their dependents on that cut. Consequence: the HOLD in T-287 lifts for that cut only; a later code change makes a new cut and a new grant.
3. **Reconcile17.** Recommendation: a changed pair on the new candidate with a fresh target root; the completed 16/17 installs stay historical evidence. Reason: they install a pre-library package and cannot establish the current candidate; T-287 selects no Run migration. Consequence: Continuation17's STOP is answered; its install-scope refusal is reproduced only if the same root is reused, which the plan avoids.
4. **D3's witness, oracle and context.** The owner names the specification (a bounded real specification for `A5-F17`; the Hello programs are `A5-F14` material, not an F17 witness), the independent oracle, the assessor (the owner's Codex pass qualifies as independent of the Worker and the Executive), the network-enabled execution context, and the provider budget (the harness config carries `maxBudgetUsd` 12.5 as its sample). Consequence: without a network-enabled context D3 cannot run; without the prospective record the run is not a D3 witness.
5. **Publication.** Push authorization for both repositories; the tag namespace `abiogenesis` with `v5.0.0-rc.1`; the owner as the human Product authority who accepts or withholds. Consequence: no push, no D6.
6. **Independent assessment cadence.** D3, D5 and D6 each take the owner's pass inside their exit. Confirm, or name another assessor.

No decision is needed on the 5.1-reserved families: PRODUCT gives them their scoped disposition.

## 6. Next

Phase C continues (C-2, the lifecycle reader, is next). When the owner orders Phase D, the Executive writes the T-287 activation (the ledger, the package records under `work/T287_RELEASE_RESUMPTION_01/`), updates the T-290 Phase D section and GOALS once, and activates D1/D4-a.
