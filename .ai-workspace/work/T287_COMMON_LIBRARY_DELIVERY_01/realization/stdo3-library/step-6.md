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
