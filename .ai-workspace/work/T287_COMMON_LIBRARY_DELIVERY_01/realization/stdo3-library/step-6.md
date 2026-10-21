# Step 6. Calculus fold and rule table

Plan: `.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, step 6.
Executive: Claude Fable. Worker: Opus 5.5, xhigh, fresh context, Writer grant.
Reviewed after the commit (Fable, max). Highest-risk step: one commit,
reverted whole if the gate fails.

## Activation

**Role and outcome.** You are the Worker holding the Writer grant for step 6.
Outcome: `abg/calculus/` holds the pure fold (`effectOf`, `foldStep`,
`holdsAt`) and the declared rule table `ROOT_DERIVED_RULES` with four rules;
`advance` in `event_calculus.ts` is "for each event, state = foldStep(...)"
with the class as the memoized realization; no contextual branch remains in
`advance`; the lifecycle fluents have one producer; the three named readers
decide lifecycle facts only through `holdsAt`. Change class:
`design_reframe` of the Event Calculus realization, decided (D1). One commit
on `main`, no push.

**Subject and frame.** `/Users/jim/src/apps/abiogenesis`, branch `main`, head
= the step 5 commit in the plan's ledger row. Tenant root:
`build_tenants/abiogenesis/typescript`; source: `code/src`. Frames: `f-law`,
`f-checks`, `f-claim`, `f-worksite-causality` from
`build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`.
Design authority: `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`
§4.4 (`project`: the carriers, the four rules, the lifecycle formulas,
counterexamples A and B, the one-producer rule), §5 (composition laws for
the fold), §10.2 D1, §10.5 P-FOLD and the rule part of P-LIFECYCLE, §10.6
row 5; and `design/ABG_EVENT_CALCULUS_IACS.md` (the `DerivedEffectRule`,
`FoldState`, `HoldsAt` entries). Read those, not the whole documents.

**Law that binds this step.** The axiom table declares effects that depend
only on the event kind; the rule table declares every contextual effect; both
are module constants, no caller supplies an axiom or a rule, and `effectOf`
and `foldStep` take no axiom or rule parameter (constitution §10 closed
module law, FS-17). Each rule's `derive` is a module-owned function. Cold
replay equals warm fold at every cut (P-FOLD, PROJECTION-002). `holdsAt` is
the only admitted reader of a lifecycle fact (IACS). Defects keep `throw`.

**Census the Executive already made (at `97b1200bc`; re-verify cheaply).**

- `abg/event_calculus.ts` (2139 lines): `ROOT_EVENT_CALCULUS` axiom table at
  144 to 388; lifecycle axiom entries at 222 to 258 (`actor_process_started`
  initiates `actor_process_active`, `actor_process_live`;
  `actor_process_spawn_failed`, `actor_process_exited` terminate both;
  stdout/stderr observed re-initiate `actor_process_live`;
  `actor_process_termination_unconfirmed` initiates
  `actor_process_termination_unconfirmed`, `actor_cleanup_live`,
  `actor_cleanup_pending`); `eventCalculusDependencies` at 1740; class
  `RuntimeEventCalculusDerivation` at 1790 with `forkAt` at 1836 and
  `advance` at 1880 to 2066. Inside `advance`: the liveness validation
  (1888 to 1893, throws `TypeError` on a missing source/threshold relation),
  the terminal-locus and cleanup-terminal branch (1894 to 1951: initiates
  cleanup fluents for processes still `actor_process_live`, terminates the
  run-scoped active fluents keyed by `contextualFluentRunIds`, with the
  `preservesHeldObligation` exception), the per-process branch (1952 to
  1980: on exit or spawn failure terminates `actor_cleanup_live`; on actor
  close or failure terminates both cleanup fluents and the probe-scoped
  `runtime_invocation_active`), then the generic apply (1982 to 2007) and
  the probe and interruption fact capture (2008 to 2064). Existing exports
  `holdsAt(projection, fluent): boolean` (2107, 14 importers),
  `runtimeFluentHoldsAtPrefix` (2098, 2 importers),
  `deriveRuntimeEventCalculusProjection` (2074, 3),
  `deriveRuntimeHeldFluentProjection` (2083, 15); `ROOT_EVENT_CALCULUS` has
  one importer outside the file.
- Readers: `abg/actor_process.ts:584-660` `projectActorProcessLifecycle`
  re-derives `processLive`, `terminationUnconfirmed`, `cleanupPending`
  (counterexample A at 631: `runTerminal && started.length === 1`) from
  event rows and throws on cardinality defects; `abg/runtime_liveness.ts:813`
  reads `actor_process_spawn_failed` events directly; `abg/replay.ts:317-350`
  classifies fluent names for run quiescence (`actor_cleanup_pending`,
  `actor_process_live` as live-or-consumable; `actor_process_exited`,
  `actor_process_spawn_failed`, `actor_process_termination_unconfirmed` as
  allowed historical). `abg/c_call.ts:2035,2055` consume
  `processTerminalKind` from the actor projection. Event-kind readers that
  are not fluent derivations (`native_worksite_execution.ts:225`,
  `native_work_effect.ts:17`, `runtime_history.ts:568`) are outside this
  step; list them in Return as the census for step 8's lint rule.
- No admitted event or receipt records a digest over the projection's
  `holds` (Executive grep); adding fluent names changes no stored digest.
- Fluent names are checked by `assertFluentName` (1533) only; the two new
  names below need no registry beyond the replay quiescence sets.
- Counterexample B is at 1909: the run-terminal census initiates
  `actor_cleanup_pending` only for processes still live, so a process that
  exited before the Run terminal and whose actor is not closed never holds
  `actor_cleanup_pending` in the calculus while the actor projection says
  pending. Counterexample A is the actor projection's run-terminal clause
  at 631. The rule formulas of §4.4 decide both.

**What changes.**

1. New `code/src/abg/calculus/`: `fold.ts` with `HoldsAt`, `FoldState`,
   `effectOf(state, event, dependencies)`, `foldStep(state, event, dependencies)`,
   and `holdsAt`; `rules.ts` with `DerivedEffectRule` and
   `ROOT_DERIVED_RULES`; `index.ts`. `FoldState` carries `holds`, the
   ordinal, the transition record, `contextualFluentRunIds`, the probe and
   interruption facts and the actor probe scopes (subordinate internals,
   design §3). The axiom table `ROOT_EVENT_CALCULUS` is read by
   `effectOf`; place it so that no import cycle exists between
   `abg/calculus/` and `event_calculus.ts` (moving the table into
   `abg/calculus/axioms.ts` with a re-export from `event_calculus.ts` is
   acceptable; state the cut in Return). `effectOf` applies the axiom effect
   and every applicable rule effect for the event; `foldStep` applies the
   effect in the existing order (terminates, clips, declips, initiates) and
   records the subordinate facts. Both pure; no I/O; no class.
2. `ROOT_DERIVED_RULES`, four rules, each with `ruleRef`, `appliesTo` and a
   module-owned `derive`:
   - `terminal_run_census`: the branch at 1894 to 1951, as a rule over
     `FoldState` (`holds`, `contextualFluentRunIds`), with the
     `preservesHeldObligation` exception unchanged.
   - `process_cleanup`: the per-process branch at 1952 to 1980, except the
     lifecycle fluents the next rule now owns.
   - `liveness`: the validation at 1888 to 1893; it derives no fluent and
     keeps the `throw` (a defect, not a refusal) so behavior is unchanged.
   - `actor_process_lifecycle`: inputs `S`, `T`, `U`, `G`, `O`, `A`, `R`
     exactly as §4.4 lists them, admitted events only, no
     `OwnedProcessFacts`; formulas `processLive = S and not T`,
     `terminationUnconfirmed = not T and U`,
     `cleanupPending = not A and (T or U or (R and formerlyActiveActor))`
     with `formerlyActiveActor` and the token frontier as §4.4 states. It
     is the one producer of `actor_process_live`,
     `actor_process_termination_unconfirmed`, `actor_cleanup_pending` and
     the new `actor_process_terminated(processRef)`; the axiom entries at
     222 to 258 that initiate or terminate those fluents move into it
     (`actor_process_active`, `actor_process_spawn_failed`,
     `actor_process_exited`, `actor_cleanup_live` and the stdout/stderr
     availability fluents stay in the axiom table). It initiates
     `actor_process_terminated` from `actor_process_exited` only when an
     admitted `actor_process_started` for the same `processRef` precedes it
     and no `actor_process_termination_unconfirmed` for it exists: that is
     the context-guarded form of §10.6 row 5. Check the emission premise
     (every emitter of `actor_process_exited` in `code/src`, and the
     recorded stores under `test_env` that the gate and the unit lane
     touch) and record the result in Return; moving the effect to the axiom
     table is a step 8 record, not a step 6 change. The copied
     `terminationConfirmed` check and the `terminationConfirmed_copy_disagrees`
     fluent are step 7; do not add them.
3. `advance` becomes the loop "state = foldStep(state, event, dependencies)"
   over the events after `effectCount`, with the class keeping its memo
   (`recordFluent`, `effectRows`, `effectByEvent`, clip and declip counts,
   `forkAt`, `project`, `held`, `fluentAt`) over the `FoldState` it
   receives. `eventCalculusDependencies` is unchanged. `project` and `held`
   are unchanged in output.
4. `holdsAt` in `abg/calculus/` is overloaded: the existing
   `(projection, fluent) => boolean` form stays for its 14 importers, and
   the design's `(state | projection, pattern: RuntimeFluentPattern) => readonly RuntimeFluent[]`
   form is added; `event_calculus.ts` re-exports it so no importer changes.
5. Readers: `projectActorProcessLifecycle` (`actor_process.ts:584-660`)
   reads `processLive`, `terminationUnconfirmed` and `cleanupPending` from
   `holdsAt` over the calculus projection at the prefix with patterns
   naming the process or actor invocation; it keeps its cardinality
   defects (the `TypeError`s), `processTerminalKind`,
   `processTerminalEventRef`, `actorTerminalEventRef` and
   `cleanupDisposition` with the same output shape. `runtime_liveness.ts:813`
   reads `actor_process_spawn_failed` through `holdsAt`. `replay.ts:317-350`
   adds `actor_process_terminated` to the allowed-historical set. No other
   reader changes.
6. Unit lane, one file: `test_env/tests/t287-calculus-fold.test.mjs` over
   the built modules. P-FOLD: on one recorded store that an existing
   calculus test's support already builds (the cheapest that contains actor
   process events; name it), for every cut, the pure cold fold from the
   empty state and the class's `project` agree on `holds`,
   `clippedFluentRefs` and `declippedPatternRefs`, and `forkAt` at that cut
   agrees with the cold fold. Counterexamples A and B as decision-exact
   falsifiers over synthetic event sequences through `foldStep`: (A) start,
   exit, no actor terminal, then Run stop: `actor_cleanup_pending(process)`
   holds after the exit and still at the Run stop, and `actor_process_terminated`
   holds; (B) start, no exit, Run stop: `actor_cleanup_pending` and
   `actor_process_live` hold, `actor_process_terminated` does not; and the
   two lifecycle negatives at the rule level: spawn failure without start
   yields `actor_process_spawn_failed` and `actor_cleanup_pending` and no
   `actor_process_terminated`; termination unconfirmed yields
   `actor_process_termination_unconfirmed` and `actor_cleanup_pending` and
   no `actor_process_terminated`. Write the expected-effect table for each
   case in the test as data. Under ten cases.

**Grant.** Under `build_tenants/abiogenesis/typescript`: `code/src/abg/calculus/**`
(new), `code/src/abg/event_calculus.ts`, `code/src/abg/actor_process.ts`
(the lifecycle projection only, lines about 564 to 660), `code/src/abg/runtime_liveness.ts`
(the read at 813 only), `code/src/abg/replay.ts` (the quiescence fluent
sets only), `test_env/tests/t287-calculus-fold.test.mjs` (new), and the
build outputs the gate regenerates (`build/**`, `contracts/**/*.json`,
`product-toolchain-manifest.json`), committed with the source. Plus this
file's `## Return`. Nothing else: no design text, no IACS text, no ticket,
no GOALS, no event contract, no event store, no other reader, no
`terminationConfirmed` change.

**Gate** (in `build_tenants/abiogenesis/typescript`, in order, all must
pass): `npm run build`; `npm run lint:imports`;
`node --test test_env/tests/t287-calculus-fold.test.mjs`;
`npm run test:installed:language`. Record exit codes and wall times. The
calculus suites (`m5-event-calculus-runtime`,
`t287-event-calculus-owner-continuation`, `t287-calculus-state-transfer`)
wait for step 8; do not run them unless a gate failure needs localizing,
and then run one.

**Self-check before the commit:** (1) `advance` in `event_calculus.ts`
contains no `event.kind ===` branch that builds an effect: `grep -n "kind === \"run_stopped\"\|kind === \"runtime_failure_observed\"\|actor_cleanup_pending\|actor_process_live" code/src/abg/event_calculus.ts` shows those names only in re-exports or the axiom table's remaining entries; (2) each of the four lifecycle fluents the rule owns is initiated in exactly one place in `code/src/abg`; (3) `grep -rn "ROOT_DERIVED_RULES\|ROOT_EVENT_CALCULUS" code/src` shows both tables read only inside `abg/calculus/` and the `event_calculus.ts` re-export; (4) no export of `abg/calculus/` takes an axiom, a rule or a callback parameter; (5) the gate passed; (6) `git diff --stat` touches only granted paths.

**Return contract.** Stage by path (never `git add -A`), commit on `main`,
no push. Message first line `Step 6: calculus fold and ROOT_DERIVED_RULES; advance over foldStep`,
short body, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
Append to this file:

```
## Return
- commit: <hash>
- module cut: <where the axiom table lives; the re-exports; one paragraph>
- rules: <ruleRef, appliesTo, one line each>
- one-producer table: <fluent -> producing rule or axiom entry>
- emission premise: <emitters found; stores checked; holds / broken, with the site>
- readers changed: <file:line per line>
- unit lane: <store used for P-FOLD; cuts compared; cases>
- gate: build <rc, s>; lint:imports <rc>; unit lane <rc, pass/fail>; test:installed:language <rc, s, pass/fail counts>
- self-check: 1..6 with result
- step 8 census: <event-kind readers of lifecycle facts outside abg/calculus/, file:line per line>
- residuals: anything you could not do inside the grant, with the exact reason
- return route: this file
```

Final report to the Executive: at most eight lines.

**Stop contract.** Stop, revert every change of this step in the working
tree (`git checkout -- .` over the granted paths, `git clean` only for the
new files you created), and write the reason under `## Return` if: (a) the
gate fails after one bounded fix attempt; (b) the fold cannot reproduce the
class's `project` output on the recorded store at some cut (P-FOLD fails)
and the cause is not a defect in your fold; (c) an admitted event, receipt
or stored digest turns out to depend on the fluent set, so adding a fluent
is a profile change; (d) a rule needs a parameter that only a caller can
supply.

ACTION: execute step 6 as activated.

## Executive note (2026-10-22, after steps 2 to 5)

Head for this step is `10efed8b2` (an Executive bookkeeping commit sits on
top; the source tree equals it). The line numbers in the census are from
`97b1200bc`; steps 3 to 5 touched `event_calculus.ts`, `actor_process.ts`,
`replay.ts` and `runtime_liveness.ts` only at comparison, record-guard and
selection sites, so anchors may have shifted by a few lines; re-find them by
name. `isRecord` and `hasExactKeys` come from `shared/admit/`,
`canonicalEquals` from `shared/value/`, `resolveExactMatch` and
`onlyExactMatch` from `shared/select/`; use them in new code rather than
local copies. The carrier's sequencing export is `andThen`.

## Return

- commit: none. **STOP (c).** The step was built, gated and committed as
  `1dea2c79d`. The stop was then found in the post-commit check. `git reset --mixed HEAD~1`
  reverted the commit; it remains reachable by hash. The granted paths were
  restored by explicit path, the new files removed (`code/src/abg/calculus/`,
  the unit lane, the ignored `build/code/src/abg/calculus/`), and `npm run build`
  rerun (rc 0, 32 s). The regenerated contracts and manifest equal HEAD. HEAD is
  `98e0257d0`. This file is uncommitted, and `step-7.md` is untouched.
- stop reason: (c) an admitted event's stored digest depends on the fluent
  set. The chain:
  - `replay.ts:1386` puts `activeFluents: eventCalculus.holds.map(runtimeFluentKey)`, the whole held fluent set, into the replay body.
  - `replay.ts:1445` digests that body through `digestReplayBody` (`:2305`) into `replayDigest`.
  - Admitted payloads store that digest as `replayStateDigest`:
    - the route admission (`event_store.ts:318` field list; written at `traversal_route.ts:689`, `:810`);
    - the c-call judgment and outcome (`event_store.ts:784`; written at `c_call.ts:3279`, `:6119`, `:7280`).
  - `invocation_admission.ts:582` stores `sourceReplayDigest` the same way.
  - Admission compares a candidate's stored digest with the replay recomputed at the predecessor prefix (`traversal_route.ts:4438`, `:5371`; `c_call.ts:7047`).
  - The activation's held-set changes move that digest after any actor process event:
    - `actor_process_terminated(p)` is a new fluent held after every confirmed exit;
    - `actor_process_termination_unconfirmed` now ends at T, where it used to persist after exit;
    - `actor_process_live` now comes from S only, where stdout and stderr used to re-initiate it, so a late stdout after exit could re-hold it;
    - `actor_cleanup_pending` becomes a run-matched census at R.
  - So every replay digest at a post-exit cut changes. Every route or judgment admitted after an actor exit stores a different `replayStateDigest`, and a store recorded before the change no longer reproduces its stored digests. By the stop's own terms, adding the fluent is a profile change.
- cleared: the native liveness `projectionDigest` stored on
  `actor_process_timeout_observed` (`runtime_liveness.ts:657-660`) has no fluent set in its body. Its body holds the scope, policy, retry budget (which reads only `run_active`, `locus_active`, `retry_attempt_active` and `retry_progress_available`), coverage, systems and disposition. `processLive` was value-identical under the change, because spawn failure after a start is a cardinality defect. `ROOT_EVENT_CONTRACT_DIGEST` comes from the event_store profile and was unchanged. The recorded proof store `test_env/proof/abi5-root-r10.events.jsonl` has no actor process events, so it does not break today. The dependence is structural.
- reverted work: `1dea2c79d`. Its copy of this file carries the full success Return: module cut, rules, one-producer table, emission premise, readers changed, unit lane, self-checks 1 to 6 and the step 8 census. The points below are not repeated there:
  - The emission premise holds in `code/src` (single emitter `actor_process.ts` `onProcessFinalized`). It is broken in the U1 support store and in `m5-terminal-quiescence-owner.test.mjs:196-197`, so the context guard is load-bearing.
  - `cleanupDisposition` was unchanged in every case. `cleanupPending` and `terminationUnconfirmed` have no consumer in `code/src`.
- gate as run before the stop:
  - build: rc 0, 32 s.
  - lint:imports: rc 0, under 1 s.
  - unit lane: the literal `node --test test_env/tests/t287-calculus-fold.test.mjs` exits rc 1 in 1 s. The U1 support statically imports `SourceTextModule` from `node:vm`. With `node --experimental-vm-modules --test …` it exits rc 0 in 1 s, 6 of 6 pass (P-FOLD on U1: 22 cuts on each of the validated and owned prefixes).
  - test:installed:language: rc 0, 45 s, 1 pass.
- residuals:
  - (1) The gate's unit-lane command needs `--experimental-vm-modules` for the U1 store.
  - (2) The `runtime_liveness.ts:813` holdsAt read and its before-event cut were argued, not exercised: V8 coverage of the lane shows 0 calls into `deriveRuntimeLivenessSemantics`, and the language smoke has no actor events.
  - (3) Before any re-run, the Executive must choose one of these:
    - (a) declare an event-contract profile change for the lifecycle fluents;
    - (b) keep the rule-owned lifecycle fluents out of the digested `activeFluents` (a design change outside this grant);
    - (c) accept the `replayStateDigest` change as a non-profile change, on stated grounds.
- return route: this file

## Re-activation (Executive decision D7, 2026-10-22)

The stop Return is accepted and the relation is decided under the pen, as
D7 in the plan's Decisions table. Facts: `replay.ts:1386` digests the held
fluent set into the replay body; the digest is stored as `replayStateDigest`
(route and judgment payloads) and `sourceReplayDigest` (the invocation
source-result basis). Of every consumer, only `traversal_route.ts:5371`
compares a stored witness with a recomputation (transition admission against
the predecessor replay); `traversal_route.ts:4438` and `c_call.ts:7047`
compare two fresh values of the same proposal; every other site stores,
propagates, key-lists or shape-checks. No reopen or cold-replay path
compares a stored witness.

**Ruling.** `replayStateDigest` and `sourceReplayDigest` witness derived
state under the calculus law in force at admission. The law changes under
D1 (ratified design §4.4), so the witness changes at every cut after an
actor process event. Consequence, accepted: a route or judgment admitted
under the prior law is not current under the new law and fails closed at
transition admission; history reopens unchanged; no prior law is kept alive
to continue a prior-law run (constitution §4.1: machinery justified only by
an unselected failure model is removed). This is not an event-profile
change: no event contract, payload key or `ROOT_EVENT_CONTRACT_DIGEST`
changes. Jim can reverse D7 in the morning by reverting the one step 6
commit.

**Procedure.** Restore your reverted work with
`git cherry-pick --no-commit 1dea2c79d` (it is reachable by hash), then
apply the three deltas below, rerun the gate, and make one commit.

**Delta 1, design (bounded).** In
`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`, after the
P-FOLD paragraph of §4.4, add one paragraph: the replay state witness
(`abg/replay.ts:1386`, the held fluent set digested into `replayStateDigest`
and `sourceReplayDigest`) witnesses derived state under the law in force at
admission; a law change under D1 moves it at every affected cut; routes and
judgments admitted under the prior law are not current under the new law
and fail closed at transition admission (`abg/traversal_route.ts:5371`);
history reopens unchanged because no reopen path compares a stored witness
with a recomputation; no prior law is retained. In §10.6 row 5, add this
relation as decided by the Executive at step 6 (D7, 2026-10-22). Nothing
else in the design.

**Delta 2, gate.** The unit lane runs as the package scripts run every
suite: `node --experimental-vm-modules --test test_env/tests/t287-calculus-fold.test.mjs`.
The activation's literal command without the flag was the Executive's
error.

**Delta 3, the changed witness seam (SP-06: one integration scenario and
its material negative).** Run once, after the build:
`node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/t287-continuation-causation.test.mjs test_env/tests/m5-consensus-module.test.mjs`.
These two admit transitions over recorded events that carry stored
`replayStateDigest`s (`test_env/fixtures/continuation-causation.json`;
`test_env/proof/abi5-root-r10.*`). Record pass or fail per file. If a
failure is a stored-witness comparison under the new law, say which
assertion, and regenerate the fixture only if its tracked source and
generator make that mechanical (one attempt; name the generator); otherwise
leave it and record "prior-law witness; regenerate at step 8" in Return.
Any other failure in those two files that reproduces at `98e0257d0` is a
baseline failure; record it and stop looking.

**Grant additions:** the design paragraph and row 5 entry; the fixture
files named above and their generator, only under Delta 3's condition.
Everything else as in `## Activation`. Append `## Return 2` with the
activation's fields plus `witness seam: <two files, result, fixture action>`.
Commit message first line `Step 6: calculus fold and ROOT_DERIVED_RULES; advance over foldStep; D7 replay witness`.

ACTION: execute step 6 as re-activated.

## Return 2

- commit: the commit carrying this Return (first line `Step 6: calculus fold and ROOT_DERIVED_RULES; advance over foldStep; D7 replay witness`, parent `4124ec7e0`); its hash is in the final report.
- restore: `git cherry-pick --no-commit 1dea2c79d` applied cleanly to every tenant path. The staged tenant tree equals `1dea2c79d` (`git diff --cached 1dea2c79d -- build_tenants` is empty). Only this file conflicted, because both sides appended to it; it was resolved to HEAD's copy and this section appended. `step-7.md` carries a concurrent Executive edit (the gate flag); it is not staged.
- module cut: unchanged from `1dea2c79d`'s Return. `code/src/abg/calculus/axioms.ts` holds the carriers, `ROOT_EVENT_CALCULUS` (axiom-only), the effect-ref switch and its helpers, the fluent and pattern constructors and validators, and `axiomEffectOf(event, dependencies, context?)`, whose context is fold data only. `rules.ts` holds `ROOT_DERIVED_RULES`; `fold.ts` holds `emptyFoldState`, `effectOf`, `foldStep` and the overloaded `holdsAt`; `index.ts` re-exports. `event_calculus.ts` re-exports every previously public name, so no importer changed, and keeps `eventCalculusDependencies` and the class as the memo; `advance` (`event_calculus.ts:236`) is the `foldStep` loop followed by `memoize`. No import cycle: `abg/calculus/` does not import `event_calculus.ts`.
- rules:
  - `terminal_run_census`: `runtime_failure_observed`, `run_stopped`, `run_closed`; `actor_cleanup_live` for held live processes and the run-matched end of Run-scoped active fluents, with the preserving-stop exception.
  - `process_cleanup`: `actor_process_exited`, `actor_process_spawn_failed`, `actor_invocation_closed`, `actor_invocation_failed`; terminates `actor_cleanup_live(processRef)` and, on an actor terminal, the probe-scoped `runtime_invocation_active`.
  - `liveness`: `runtime_activity_probe_observed`, `runtime_external_interruption_observed`, `actor_process_timeout_observed`; derives nothing, throws on a missing source and threshold relation.
  - `actor_process_lifecycle`: S, T, U, G, O, A, R kinds plus `run_stopped` and `runtime_failure_observed`; the §4.4 formulas from the state before the event; G and O have no effect.
- one-producer table: `actor_process_live`, `actor_process_termination_unconfirmed`, `actor_process_terminated` (context-guarded: exit while live held and unconfirmed not held) and `actor_cleanup_pending` are produced only by `actor_process_lifecycle` (`rules.ts:141-178`). `actor_process_active`, `actor_process_exited`, `actor_process_spawn_failed`, `actor_cleanup_live` and the stdout and stderr availability fluents stay in the axiom table.
- emission premise: holds in `code/src` (single emitter `actor_process.ts:1323` `onProcessFinalized`, exclusive with U at `:1327` and spawn failure at `:1318`). Broken in `test_env/support/t287-native-work-currentness-consumers.mjs:268-274` (U then exit, same process) and `m5-terminal-quiescence-owner.test.mjs:196-197`. The context guard is load-bearing, so the effect stays in the rule; moving it to the axiom table is not a step 6 change.
- design delta (Delta 1): `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` §4.4 gains one paragraph after the P-FOLD paragraph, stating the D7 witness law; §10.6 row 5 gains the witness relation in `U(B)` as decided by the Executive at step 6 (D7, 2026-10-22), and its decider cell names the Executive for it. Nothing else in the design changed. The paragraph cites `abg/replay.ts:1387`, the `activeFluents` line in this commit's tree (it was `:1386` before the one-line `replay.ts:348` addition).
- readers changed: `actor_process.ts:15`, `:627-635` (`holdsAt` with a process-ref pattern; cardinality `TypeError`s, terminal kind and refs and `cleanupDisposition` kept); `runtime_liveness.ts:11-12`, `:813-827` (`actor_process_spawn_failed` through `holdsAt` at the cut before the event); `replay.ts:348` (`actor_process_terminated` allowed historical).
- unit lane: `test_env/tests/t287-calculus-fold.test.mjs`, 6 cases. P-FOLD on the `createU1Fixture` store (`t287-native-work-currentness-consumers.mjs`): 22 cuts on each of the validated and owned prefixes; cold fold, `project` and `forkAt` agree on `holds`, `clippedFluentRefs` and `declippedPatternRefs`. Four expected-effect data tables through `foldStep` (counterexample A, counterexample B, spawn failure without start, termination unconfirmed then exit), and one one-producer case.
- gate (Delta 2 command for the lane):
  - build: rc 0, 32 s. The regenerated tracked outputs equal the cherry-picked index (no unstaged diff under `build/`, `contracts/` or the manifest).
  - lint:imports: rc 0, under 1 s.
  - unit lane `node --experimental-vm-modules --test test_env/tests/t287-calculus-fold.test.mjs`: rc 0, 1 s, 6 pass, 0 fail.
  - test:installed:language: rc 0, 49 s, 1 pass, 0 fail.
- witness seam (Delta 3, one run after the build, rc 1, 1 s):
  - `t287-continuation-causation.test.mjs`: pass (1 of 1). Its fixture `test_env/fixtures/continuation-causation.json` carries one stored `replayStateDigest` and no actor process events, so its witness does not move under the new law.
  - `m5-consensus-module.test.mjs`: fail at module link, before any assertion: `../../build/code/src/public/index.js` does not export `ROOT_PUBLIC_OPERATION_IDS` (imported at `:26`). The name is absent from `code/src` at `98e0257d0` (`git grep` empty; last touched by `adaeede02`), and this step changes nothing under `code/src/public`, so the failure reproduces at `98e0257d0`. Baseline failure; recorded, not pursued.
  - fixture action: none. No failure was a stored-witness comparison.
  - The fail-closed negative at `traversal_route.ts:5371` is argued, not exercised: neither recorded store (`continuation-causation.json`, `abi5-root-r10.events.jsonl`) holds actor process events, and the r10 suite did not load.
- stored-digest check: the regenerated manifest and capability graph drop 47 digests (the `event_calculus.d.ts` declaration digest, the native-runtime-observation contract digest and their dependants). None appears in any tracked file under `test_env` (`proof`, `fixtures`, `tests`, `support`). Two appear only in untracked historical UAT outputs under `test_env/test_runs/sandbox-uat/` (2026-10-08), which no gate or suite reads. `ROOT_EVENT_CONTRACT_DIGEST` is unchanged.
- self-check:
  - (1) Pass: the grep over `event_calculus.ts` returns no line.
  - (2) Pass: each of the four lifecycle fluents is initiated only in `calculus/rules.ts` (`deriveActorProcessLifecycle`); other `code/src/abg` mentions are `holdsAt` reads, name sets or event-kind lists.
  - (3) Pass: outside `abg/calculus/`, only the `event_calculus.ts:64` re-export (plus a comment at `:47`) and the pre-existing `abg/index.ts:191` public re-export name `ROOT_EVENT_CALCULUS`; `ROOT_DERIVED_RULES` is read only inside `abg/calculus/`.
  - (4) Pass: no export of `abg/calculus/` takes an axiom, rule or callback parameter.
  - (5) Pass.
  - (6) Pass: the commit touches the 13 tenant paths of `1dea2c79d`, the design file (Delta 1) and this file.
- step 8 census: unchanged from `1dea2c79d`'s Return: `native_worksite_execution.ts:226`; `native_work_effect.ts:17-20`, `:101`; `runtime_history.ts:568`; `event_calculus.ts:92`, `:109`; `runtime_liveness.ts:823-828`, `:663`, `:382`, `:430`, `:432`; `actor_process.ts:604-621`, `:643-645`; `replay.ts:2411-2412`, `:2417`, `:2448`; `c_call.ts:1872`, `:2001`, `:2017`, `:2036`, `:2054`, `:2058`; `worksite_construction_recovery.ts:243`.
- residuals:
  - (1) The `runtime_liveness.ts:813` `holdsAt` read is argued, not exercised (no lane calls `deriveRuntimeLivenessSemantics` with actor events).
  - (2) `runtime_liveness.ts:823-828` still decides `processLive` from event kinds; only the 813 read was granted.
  - (3) Expected step 8 flips, not run and not edited: `m5-terminal-quiescence-owner.test.mjs:166-167` and `:222`; `t287-native-work-unknown-effect.test.mjs` near `:69`; the `t287-event-calculus-owner-continuation.test.mjs` source patch, whose target now lives in `calculus/axioms.ts`.
  - (4) `m5-consensus-module.test.mjs` cannot load at baseline (`ROOT_PUBLIC_OPERATION_IDS`), so the r10 proof store's stored witnesses are unexercised by this step.
  - The earlier residuals on the gate flag and on the witness are closed by Delta 2 and D7.
- return route: this file

## Review

Reviewer: Claude Fable 5.1, same family as the Worker (Opus) and the Executive (Fable); no Writer grant; subject `c2432eb85` against `c2432eb85^` (`4124ec7e0`). Line numbers are the subject's tree; design = `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`.

Blocking: S0 0, S1 0, S2 1 (design text written from the D7 trace; the code is not wrong). Non-blocking: S3 4, S4 2.
New S2 or above: yes (R1).

**Claim vs evidence (re-run: unit lane and `lint:imports` only).** The lane passes at the subject on the Worker's build: 6 of 6, P-FOLD 22 cuts (`node --experimental-vm-modules --test`, 1.3 s); `lint:imports` rc 0. The tenant tree equals `1dea2c79d` (`git diff --stat 1dea2c79d c2432eb85 -- build_tenants` lists only the design file), so the cherry-pick claim holds. Build outputs are consistent with the final tree: the manifest's `capabilityDefinitionGraph.assetLocator.contentDigest` equals the sha256 of the committed graph; `build/code/src/abg/calculus/*.js` and `build/code/src/abg/event_calculus.js` are dated 10:10:45, after the last source write (10:05:16) and before the commit (10:13:46). Build and language-smoke timings are the Worker's record; not reproduced. `ROOT_PUBLIC_OPERATION_IDS` is absent from `code/src` at `98e0257d0`, `67c333799` and the subject (`git grep`; last touched `adaeede02`): baseline failure confirmed. No fixture changed (`git show --stat`). Self-checks 1 to 6 re-verified by grep: the four rule-owned fluents are initiated or terminated only in `rules.ts:141-178`; `terminal_run_census` reads `actor_process_live` at `rules.ts:54` as an input; `ROOT_DERIVED_RULES` is read only in `fold.ts:24,113`; `ROOT_EVENT_CALCULUS` leaves `abg/calculus/` only through the `event_calculus.ts:64` and `abg/index.ts:191` re-exports.

**Law.** Both tables are module constants; `effectOf(state, event, dependencies)` and `foldStep(state, event, dependencies)` take no axiom, rule or callback (`fold.ts:112,139`); each `derive` is module-owned (`rules.ts:185-210`); `advance` is the `foldStep` loop plus `memoize` with no `event.kind ===` branch (`event_calculus.ts:236-245`); the class keeps the memo and `forkAt` only; defects keep `throw` (`rules.ts:112`; `actor_process.ts:615-627`). The behavior changes in the diff are the D1 reframe (the §4.4 formulas) except R3 below, which is outside the change class but unobservable on admitted prefixes.

**Findings.** `severity | site | claim | evidence | smallest repair`

- R1. S2 | design:189 (the D7 paragraph) and design:644 (§10.6 row 5) | The paragraph names `abg/traversal_route.ts:5371` as "the one site that compares a stored witness with a recomputation" and says a prior-law route or judgment "fails closed at transition admission". Neither is what the code does. | At `traversal_route.ts:5371` the compared `transition.route` is `input.candidate.route`, a `traversal_route_candidate` built in the same transaction from a replay state computed under the current law: `hog/workflow_lifecycle.ts:997-1002,1016-1026` (`fanOutReplay` from `projectOwnedRuntimeTruthAtDurablePrefix` or the retry plan), `hog/interaction_lifecycle.ts:131-152,176-187` (`Routes.proposeHoldRoute(..., plan.replayState, ...)`, `plan.replayState = projectRuntimeReplayGuard(...)` at `c_call.ts:6166`), `hog/structural_transition.ts:195-224` (`replayAtDurable`, `hog/operator_support.ts:45-50`); the digest enters at `hog/route_proposal.ts:131,1378`. So 5371 is the same fresh-against-fresh staleness check as `:4438` and `c_call.ts:7047`. Every other `replayDigest` comparison in `code/src` is also two computed values (`fan_out.ts:222`, `c_call_outcome.ts:1520`, `replay.ts:202`, `product/project_read_definition_bindings.ts:962` against `project_read_ports.ts:871-872,1032-1033`). The stored `replayStateDigest` is read only at `replay.ts:656` into the route read model and propagated or shape-checked (`closure.ts:284`, `traversal_transition.ts:164,182`, `fan_out_projection.ts:1455`); `sourceReplayDigest` is stored (`invocation_admission.ts:582`) and key-listed only. In my words: no admission, reopen or cold-replay path compares a stored witness with a recomputation; a prior-law witness is never re-read, so nothing fails closed on its account; "history reopens unchanged" and "no prior law is retained" hold a fortiori. | Design owner under the pen, no code change: reword the paragraph and the row 5 entry to say that the three `replayStateDigest` comparisons check a proposal built in the same transaction against the current replay, that no path compares a stored witness with a recomputation, and that a prior-law route or judgment is neither re-admitted nor re-checked. The Worker wrote what Delta 1 dictated; the defect is the Executive's trace (D7 Facts), which the stop Return's wording ("a candidate's stored digest") invited.

- R2. S3 | `rules.ts:168-179` | The R branch of `cleanupPending` lacks the formula's `not A` term: every process with `actor_process_live` or `actor_process_active` held in the Run receives `actor_cleanup_pending`, whether or not its actor terminal already holds. | §4.4: `cleanupPending = not A and (T or U or (R and formerlyActiveActor))`; the code applies `not A` on the T, U branches (`rules.ts:150,160`) and terminates on A (`:166`) only. Reaching the gap needs A before R with the process still live or active, i.e. an actor terminal without a process terminal, which the owner never emits (`actor_process.ts:1335-1385`: the actor terminal follows `processTerminalEvent`) and the projection refuses (`actor_process.ts:625-627`). The term is also not realizable from `holds` at R: the Run stop carries no actor ref and the fold state holds no process-to-actor relation. The test's tables (B: `S, R`) do not reach it. | Design note at step 8: state that `not A` is vacuous at R under the emitter's ordering (A after T), or carry the process-to-actor relation in `FoldState` and filter the census; no step 6 code change.

- R3. S3 | `runtime_liveness.ts:816-822` (the granted `:813` read) | The `actor_process_spawn_failed` read is taken at the cut before `events.at(-1)`. In the validator path (`:688-690`, `events = reconstruction.facts(event.admissionOrdinal)`) that is the cut before the liveness event, as intended. In the public path (`deriveRuntimeLiveness`, `:875`; `events = runtimeEventBodiesAtPrefix(prefix)`, `:722`; caller `admitRuntimeThreshold`, `:1030`) `events.at(-1)` is the prefix's last event, so the read excludes it, one event short of the old `any([...])` over `events`; the validator's timeout branch calls the public path at `prefix = reconstruction.cut(ordinal)` (`:656-659`) and reads at N-2. | Unobservable on admitted prefixes: the term runs only after `actor_process_started` matched for the actor (`&&` short-circuit), and a spawn failure after a start is refused at emission (`actor_process.ts:1317`) and by the projection (`:618-619`), so `processLive` is value-identical. | One line: `const cut = reconstruction === undefined ? prefix : validatedRuntimeEventPrefixBeforeEvent(prefix, boundary.eventId)`; take it with R4 at step 8.

- R4. S3 | `runtime_liveness.ts:823-828` | `processLive` is still decided from event kinds (`actor_process_started`, `actor_process_exited`, `actorDone`) outside `abg/calculus/`: a lifecycle derivation that P-LIFECYCLE's last sentence and the step 8 lint fail. Residual (2) admits it; the grant covered the `:813` read only. | Confirmed by reading `:823-828`. | Keep `any(["actor_process_started"])` only to bind `started.processRef`; then `const processLive = actorRef !== null && !actorDone && started.processRef !== null && holdsAt(heldBefore, constructRuntimeFluentPattern({ name: "actor_process_live", identity: started.processRef })).length !== 0;` with `heldBefore` the R3 cut; drop the `spawnFailed` and `actor_process_exited` terms (both inside `actor_process_live = S and not T`); `!actorDone` is a disposition guard, not a lifecycle fact, and stays.

- R5. S3 | `scripts/generate-product-manifest.mjs:139-147`; `contracts/schemas/native-runtime-observation.json:4396-4486` | The published native runtime observation contract embeds `eventCalculus: ROOT_EVENT_CALCULUS`; after the reframe it no longer initiates `actor_process_live`, `actor_process_termination_unconfirmed` or `actor_cleanup_pending` and has no rule member, so the published contract under-states the law. Not in the Return. | No runtime consumer reads the file (`code/src` grep: only the generator); `ROOT_EVENT_CONTRACT_DIGEST` is built from aggregate types, event kinds and payload contracts (`event_store.ts:1182-1188`), so no admitted event depends on it; the manifest and capability graph carry the new digests. | Step 8, outside this grant: publish the rule table's declaration (`ruleRef`, `appliesTo`) beside `eventCalculus`, or record in §4.4 that the published contract carries the axiom table only.

- R6. S4 | design:191-196 (pre-existing §4.4 text) | The design still anchors counterexample B, the unconditional `actor_cleanup_pending` entry and the moved axiom entries to `abg/event_calculus.ts` lines 1909, 258 and 222 to 258; those now live in `abg/calculus/axioms.ts:208-250` and `rules.ts`. | Outside the grant ("Nothing else in the design"). | Design owner, step 8.

- R7. S4 | design:184; `calculus/axioms.ts:809-960` | "The axiom table declares effects that depend only on the event kind" over-states the realization: the effect-ref switch keeps pre-existing context reads (`history.prefix`, the probe scopes: e.g. `c_call_judged` at `:950-958`, the actor terminal at `:880-905`), now passed as `AxiomFoldContext` (`axiomEffectOf`, `axioms.ts:1717-1741`). Not introduced by this step; unchanged behavior. | None at step 6; a design sentence at step 8 if the distinction is to be kept exact.

**The reframe, against §4.4, §5, §10.5.**
- (a) One producer: confirmed by grep (above). The Return's table is right; `actor_process_active`, `actor_process_exited`, `actor_process_spawn_failed`, `actor_cleanup_live` and the stdout and stderr fluents stay in the axiom table (`axioms.ts:208-250`).
- (b) Confirmed (Law above). `axiomEffectOf(event, dependencies, context?)` takes fold data, not a callback.
- (c) Read from `derive`: `processLive = S and not T` (`rules.ts:139-141,152`); `terminationUnconfirmed = not T and U` (`:153,159`); `cleanupPending` as §4.4 on T, U and A, with the R gap of R2. Token frontier: `isRunCleanupTerminal` (`run_stopped`, or `runtime_failure_observed` with `aggregateType === "run"`) matched by `contextualFluentRunIds` against `event.runId` (`:170-174`): the matching Run stop. `actor_process_terminated` from `actor_process_exited` only when `actor_process_live(processRef)` holds and `actor_process_termination_unconfirmed(processRef)` does not (`:145-149`); "live holds" is `S and not T`, a stricter proxy for "an admitted start precedes" that differs only on a duplicate terminal, itself a refused cardinality defect.
- (d) The four tables match the formulas (A: pending and terminated from the exit, unchanged at R; B: pending and live at R, no terminated; spawn failure: spawn_failed and pending, no terminated; U then exit: unconfirmed and pending at U, exit ends live and unconfirmed and initiates no terminated). Retired derivations are gone, not duplicated: the actor projection's run-terminal clause (old `actor_process.ts:626-634`) is replaced by three `holdsAt` reads (`:630-635`); the old census that initiated `actor_cleanup_pending` for live processes (old `event_calculus.ts:1909-1925`) survives only as `actor_cleanup_live` in `terminal_run_census` (`rules.ts:53-56`), while `actor_cleanup_pending` at R comes from the lifecycle rule's live-or-active census (`:168-179`); the axiom entries and the effect-ref switch lost the four names (`axioms.ts:208-250,809-877`).
- (e) `actor_cleanup_pending` is in `RUN_QUIESCENCE_LIVE_OR_CONSUMABLE_FLUENTS` (`replay.ts:321`), so it blocks `quiescent_for_close` (`replay.ts:448-481`). Before the Run terminal nothing changes: an unclosed actor already blocks through `actor_invocation_active`. After the Run terminal (the census ends `actor_invocation_active`, `rules.ts:62`) an exited process whose actor is not closed now blocks closure until the actor terminal, where the old law let the Run close. Readers: `closure.ts:552-557` (root closure refuses `runtime_basis_mismatch`, naming the fluent) and `project_read_ports.ts:1006` (read model); `runtime_liveness.ts` does not read the set; `invocation_admission.ts` has no held-set read (it stores `sourceReplayDigest` only), so the activation's third reader is not a reader. Installed Hello World path (`installed-language-smoke.test.mjs`): a native leaf with no actor process events; no change. The U1 fixture (`S, U, exit, A`, no Run stop): `actor_cleanup_pending` holds from U to A under both laws (the old U entry initiated it unconditionally); same answer, and the lane reads no quiescence. Each `append` in `actor_process.ts:1007-1030` is its own durable transaction, so an exit-without-actor-terminal durable prefix exists; whether a Run stop lands inside that window on a real path I cannot tell from the diff.
- (f) P-FOLD: `createU1Fixture` admits `actor_process_started` (`support/t287-native-work-currentness-consumers.mjs:251`) and the test adds U, exit and the actor failure (`:268-274`); `assertFoldAgreement` compares the cold fold, `project` and `forkAt` at each of the 22 cuts on `holds`, `clippedFluentRefs`, `declippedPatternRefs`, on the validated and the owned prefix, plus each fork advanced to the end (`t287-calculus-fold.test.mjs:39-67`). Confirmed.
- (g) Emitters: `actor_process.ts:1304-1306` (`onSpawnFailed`), `:1317-1320` (no-child failure), `:1322-1325` (exit, requires `processStarted` and the confirmed boundary), `:1327` (U), exclusive through the `processTerminalEvent !== null` guards. Broken in `support:268-274` (U then exit) and `m5-terminal-quiescence-owner.test.mjs:196-197`. The guard in `rules.ts:145-149` makes the premise irrelevant to correctness. Confirmed.
- (h) `projectActorProcessLifecycle` returns the same keys (`processRef` hoisted); `runtime_liveness.ts:820-821` reads spawn failure through `holdsAt`; `replay.ts:348` classifies `actor_process_terminated`; the commit touches only the granted paths plus Delta 1 and this file (15 paths). R3 and R4 for `:816-828`.
- (i) Census: my grep of the five fluent names and the three event kinds over `code/src` outside `abg/calculus/` finds no reader the Return's list lacks (the other hits are the name sets `replay.ts:345-349`, the registry `event_store.ts:83-89,614,663`, the emitters `actor_process.ts:1305-1327`, and `actor_process.ts:573-574,606-607,618,621` inside the listed `:604-621`). Complete.
- (j) The paragraph (design:189) and the row 5 entry (design:644) say what the ruling says and no more; both carry the ruling's wrong trace (R1). The two suites were run once and recorded; the `m5-consensus-module` failure is baseline (above); no fixture changed.
- (k) Confirmed (Claim vs evidence above).

**Proportionality.** `forkRuntimeEventCalculusAtForModuleTest` (`event_calculus.ts:293-298`) and the `emptyFoldState` export serve the lane's fork and cold clauses; `FoldState.source` (`fold.ts:71`) and `AxiomFoldContext` carry what the class's `history` already fed the axiom switch; the `LIVENESS_VALIDATORS` WeakMap (`rules.ts:98`) replaces the per-`advance` local; the `@internal` exports (`stringField`, `stringArrayField`, `frameProbeScopeKey`, `completeEffect`, `ownedRuntimeFluent*`) are the module split. Nothing added beyond the activation.

**Residuals confirmed/refuted.**
- (1) Confirmed, and sharper: the `:813` read nests a fold derivation inside `foldStep` (`deriveLiveness` -> validator -> `deriveRuntimeLivenessSemantics` -> `deriveRuntimeHeldFluentProjection(before)`); sound by inspection (the before-cut's derivation has nothing to advance at `effectCount`, and `held` returns the pre-event `holds`), unexercised at this commit (0 calls in the lane; no actor events in the smoke). First exercise is `m5-event-calculus-runtime` at step 8.
- (2) Confirmed; R3 and R4 give the switch.
- (3) Confirmed: `m5-terminal-quiescence-owner.test.mjs:166-167` asserts `actor_process_termination_unconfirmed` after the exit (now `not T and U`), `:222` expects the axiom effect of U to initiate `actor_cleanup_pending` (now the rule's); neither run nor edited.
- (4) Confirmed (baseline).
- The gate-flag residual is closed by Delta 2. The witness residual is closed as a ruling (D7) but not as a mechanism: R1.

## Disposition of the review (Executive)

R1 (S2) is accepted as `P1`: the D7 trace was the Executive's error; the
code is right and the ruling's conclusion (history reopens unchanged, no
prior law retained, not a profile change) stands with a stronger basis: no
path in `code/src` compares a stored witness with a recomputation at all.
Repaired now, by a fresh Worker, as design wording only, with R3 and R4
(S3, `P2`) folded in because they sit in the granted file and the review
gives the one-line switch. R2, R5, R6 and R7 go to step 8's design notes
(`P3`). The repair is checked by the step 7 Reviewer (one added line in its
activation) rather than by a second Fable pass on this step: the finding is
a factual trace the Reviewer established, and the repair transcribes it.

## Repair activation (Executive, after the review)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Head: `c2432eb85`
plus Executive bookkeeping on top; the source tree equals `c2432eb85`.

1. **Design §4.4, the D7 paragraph** (after P-FOLD; design line about 189):
   rewrite so that it states what the step 6 review established: the replay
   state witness (`abg/replay.ts:1387`, the held fluent set digested into
   `replayStateDigest` and `sourceReplayDigest`) is computed under the law in
   force when the route or judgment is proposed; every comparison of it in
   `code/src` (`abg/traversal_route.ts:4438` and `:5371`, `abg/c_call.ts:7047`)
   compares values computed in the same transaction under the same law, and
   no path compares a stored witness with a recomputation; a stored witness
   is therefore never re-read against a new law, history reopens unchanged
   after a law change under D1, and no prior law is retained. Remove the
   "fails closed at transition admission" sentence. **§10.6 row 5 entry**
   (design line about 644): the same correction in one clause.
2. **`abg/runtime_liveness.ts:816-828`** (R3, R4 of the review): take the
   `holdsAt` read of `actor_process_spawn_failed` at the cut the review names
   for each path (the cut before the liveness event in the validator path;
   the prefix's last event is not excluded in the public path), and decide
   `processLive` through `holdsAt` over `actor_process_live(processRef)`
   with `actor_process_started` read only to bind `processRef`, as the
   review's R4 repair states. No other change in that file.
3. Gate, in `build_tenants/abiogenesis/typescript`: `npm run build`;
   `npm run lint:imports`;
   `node --experimental-vm-modules --test test_env/tests/t287-calculus-fold.test.mjs`;
   `npm run test:installed:language`.

Grant: the two design locations, `code/src/abg/runtime_liveness.ts` lines
816 to 828, the regenerated tracked build outputs, this file's
`## Repair return` (commit, the design lines changed, the two switches,
gate results). Stage by path, one commit on `main`, no push, message first
line `Step 6 repair: D7 witness wording; liveness reads through holdsAt`,
last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stop
if the gate fails after one bounded fix.

ACTION: execute the step 6 repair as activated.

## Repair return

Worker: Opus 5.5, Writer grant. Commit: this commit, parent `4445c4ec3`
(source tree before it equals `c2432eb85`). Paths: the design file,
`code/src/abg/runtime_liveness.ts`, the regenerated
`contracts/capabilities/capability-definition-graph.json` and
`product-toolchain-manifest.json` (digest and provenance values only), this
file. No tracked `build/code/src/` file changed (`runtime_liveness.js` is
not among the 40 tracked); the manifest's graph `contentDigest` equals the
sha256 of the committed graph.

**Design.** Line 189 (§4.4, the D7 paragraph after P-FOLD): the witness is
computed under the law in force when the route or judgment is proposed;
every comparison of it (`abg/traversal_route.ts:4438` and `:5371`,
`abg/c_call.ts:7047`) checks a proposal built in the same transaction
against the current replay under the same law; no admission, reopen or
cold-replay path compares a stored witness with a recomputation, so a
prior-law route or judgment is neither re-admitted nor re-checked; history
reopens unchanged and no prior law is retained. The "fails closed at
transition admission" and "the one site" claims are removed; the sentence
that a D1 law change moves the witness at every affected cut stays.
Line 644 (§10.6 row 5): the same correction in one clause; the row stays
one table line. Nothing else in the design changed.

**Code.** `runtime_liveness.ts` lines 813 to 828 (the granted block plus
its three-line comment, which described the removed read and now
describes the new one; 16 lines become 15).
- R3, the cut. Before: `holdsAt(deriveRuntimeHeldFluentProjection(validatedRuntimeEventPrefixBeforeEvent(prefix, events.at(-1).eventId)), spawn_failed)` on both paths. After: the cut is `reconstruction === undefined ? prefix : validatedRuntimeEventPrefixBeforeEvent(prefix, boundary.eventId)`, so the public path no longer drops the prefix's last event.
- R4, the liveness read. Before: `processLive = actorRef !== null && any(actor_process_started for the actor) && !spawnFailed(processRef) && !actorDone && !any(actor_process_exited for the actor)`. After: `processLive = actorRef !== null && any(actor_process_started for the actor, binding processRef) && !actorDone && processRef !== null && holdsAt(<R3 cut>, actor_process_live(processRef)).length !== 0`; the `spawnFailed` closure and the `actor_process_exited` term are gone. The derivation stays last in the `&&` chain, so it runs only for an actor occurrence with a bound start. Imports unchanged.

**Gate** (`build_tenants/abiogenesis/typescript`, each command run alone):

| command | exit | wall |
|---|---|---|
| `npm run build` | 0 | 32.8 s |
| `npm run lint:imports` | 0 | 0.1 s |
| `node --experimental-vm-modules --test test_env/tests/t287-calculus-fold.test.mjs` | 0 (6 of 6, P-FOLD 22 cuts) | 1.2 s |
| `npm run test:installed:language` | 0 (1 of 1) | 44.3 s |

Neither gate test exercises lines 813 to 828: the P-FOLD lane makes no
liveness call and the smoke has no actor process events. The switch rests
on `tsc` and inspection; the step 7 Reviewer checks it, and
`m5-event-calculus-runtime` at step 8 is its first exercise.
