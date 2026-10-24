# T-290 Phase B: the debt wave, package records

Ticket: `.ai-workspace/tickets/active/T-290-close-the-common-library-and-retire-the-registered-debt.md`. Register: `.ai-workspace/TECHNICAL_DEBT_REGISTER.md`. One package at a time; the Executive appends the activation, the Worker appends its Return below it, the Executive appends the disposition. Nothing above a Worker's section is edited while it runs. The Phase A step record is `work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8.md`.

## TD-06 activation (Executive, 2026-10-24; an exact clip reads one held fluent)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Read this section, the register's TD-06 entry, design §5 at `RuntimeEventCalculusDerivation` (the paragraph citing `applyStep`, `fold.ts:191`) and the P-FOLD obligation (design line near 638), and the files named below. Do not read other agents' comment directories.

The debt. `abg/calculus/fold.ts` `applyStep`, the clip loop (`:221` to `:229` at head): for every pattern in `effect.clips` it copies and enumerates every held fluent and tests each with `ownedRuntimeFluentMatchesPattern`. A pattern is exact when its `name` and `identity` are both non-null (`axioms.ts:50`); an exact pattern matches at most the one held fluent whose `fluentRef` is `name(identity)` (`constructRuntimeFluent`, `axioms.ts`, the `fluentRef` member), and `holds` is keyed by `fluentRef`. The native producers clip exactly: `axioms.ts` at about `:850`, `runtime_inactivity_asserted(scopeDigest)` on every observed probe, while every stdout and stderr observation initiates a held fluent keyed by its event id (about `:814`). N observation and probe pairs visit on the order of N squared held entries. A pattern with a null `name` or a null `identity` is a wildcard and needs the enumeration.

Items, in this order. The Return carries one row per item: done or stopped, with lines at head.

1. **An exact clip reads its one key.** In `applyStep`, for a pattern with non-null `name` and `identity`, compute the key as `constructRuntimeFluent` does and read `holds.get(key)`; if held, it is the clipped fluent, with the same transition entry (`{ fluent, held: false }`), the same `holds.delete`, the same `clipped` push, in the same position of the per-pattern sequence as today. Wildcard patterns keep the enumeration. Keep the fluent-to-pattern match as the one test of matching (a held fluent found by key still satisfies `ownedRuntimeFluentMatchesPattern`; do not introduce a second matching rule). The copy `[...holds.entries()]` before the wildcard enumeration stays only if deleting the current entry during a Map iteration changes the visited set or order; the language defines that it does not, so state which you chose and why. Key derivation lives in one place: if `fold.ts` needs the ref of a pattern, take it from the owner (`axioms.ts`, an internal export beside `ownedRuntimeFluentPatternKey`), not from a second string template in `fold.ts`.
2. **Proof, in `test_env/tests/t287-calculus-fold.test.mjs`.** (a) The existing P-FOLD cold, warm, streaming and fork cases unchanged and green: same `holds`, `clippedFluentRefs`, transition `fluents` order and `clipped` order at every cut. (b) A visit counter: a working fold state whose `holds` map counts the entries an `applyStep` visits (a Map subclass or a Proxy that counts `get`, `entries` and `Symbol.iterator` yields; `applyStep` and `workingFoldState` are internal exports of `build/code/src/abg/calculus/fold.js`), holding N unrelated fluents plus one target; an exact clip of the target visits a count independent of N (equal at N = 8 and N = 2048, and at most one entry), with the same transition as the enumerating fold gave before the change (record that transition in the Return from the head before item 1). (c) The negative the repair discriminates: a wildcard clip (`identity` null) over the same states visits a count that grows with N, and clips every matching fluent in held order, as before. (d) Absent and present refusals unchanged: an exact clip of a fluent not held clips nothing and records nothing in `clipped`; the step's effect is unchanged.
3. **Records.** The design's `RuntimeEventCalculusDerivation` paragraph or the P-FOLD obligation: one sentence that an exact clip reads its one key and a wildcard clip enumerates, with the test named. Nothing else in the design. The register is the Executive's.
4. **Lanes.** `npm run build`, `npx tsc --noEmit -p tsconfig.json`, `npm run lint:imports`, `npm run lint:lifecycle`; `t287-calculus-fold`, `m5-event-calculus-runtime`, `t287-calculus-state-transfer`, `t287-event-calculus-owner-continuation`, `t287-generic-job-parent-foldback`, `t287-native-runtime-gate`. Report each as tests/pass/fail/skipped. No broad run (it runs once at the Phase B close).

**Grant.** `code/src/abg/calculus/fold.ts` (the clip loop); `code/src/abg/calculus/axioms.ts` only for one internal export of the exact-pattern ref; `test_env/tests/t287-calculus-fold.test.mjs`; the design sentence of item 3; this file below this section only; build outputs `npm run build` regenerates.

**Stop:** any change to the fold's transition shape, `FoldState`, `WorkingFoldState`, the pattern or fluent types, `ownedRuntimeFluentMatchesPattern`'s rule, or any reader of `holds` outside `applyStep`; any change to the memoized class (`abg/event_calculus.ts`) or to `rules.ts`; a second bounded attempt at any item; any push.

**Return contract.** One commit on `main`, no push. First line `TD-06: an exact clip reads its one held fluent`, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append `## TD-06 return` below this section with: one row per item (done or stopped, lines at head); the transition recorded at head before item 1 and after; the visit counts at N = 8 and N = 2048 for the exact and the wildcard clip; the copy decision and its reason; the lane results as `tests/pass/fail/skipped`; the stop reports, if any, with the counterexample.

## TD-06 return

Worker: Opus 5.5, fresh context. Base `cff4f9dcd`; this package's single commit is the next one on `main`, not pushed. Paths below are relative to `build_tenants/abiogenesis/typescript/`.

| Item | State | Lines at head `cff4f9dcd` | Lines after |
|---|---|---|---|
| 1. An exact clip reads its one key | done | `code/src/abg/calculus/fold.ts:221-229` (clip loop) | `fold.ts:244` calls `applyClip` for each pattern; `applyClip` at `fold.ts:188-207`; `ownedExactRuntimeFluentPatternRef` at `code/src/abg/calculus/axioms.ts:1600-1604`, next to `ownedRuntimeFluentPatternKey` (`:1596`) |
| 2. Proof | done | `test_env/tests/t287-calculus-fold.test.mjs:1-207` | P-FOLD cases unchanged; counter at `:210-265`; cases at `:267` (exact), `:284` (wildcard negative), `:303` (absent) |
| 3. Records | done | design `:191` | One sentence added to the `RuntimeEventCalculusDerivation` paragraph (design `:191`). It names `applyClip`, `ownedExactRuntimeFluentPatternRef` and the `t287-calculus-fold` counter. |
| 4. Lanes | done | | See the lane results below. |

**Item 1.** `applyClip(holds, pattern, fluents, clipped)` handles one clip pattern.
- It takes the pattern's ref from `ownedExactRuntimeFluentPatternRef`. That function returns null for a wildcard. For an exact pattern it returns `fluent(name, identity)`, the existing private template in `axioms.ts:402`. No new string template was added.
- Exact pattern: `applyClip` makes one `holds.get(ref)`. If a fluent is held under that ref, it is the only candidate.
- Wildcard: the candidates are the live `holds`.
- Every candidate passes through the same single test, `ownedRuntimeFluentMatchesPattern`. A match then gets the same three actions as before: `fluents.push({ fluent, held: false })`, `holds.delete(key)`, `clipped.push(key)`.
- `applyStep` still applies patterns in `effect.clips` order, so the per-pattern sequence is unchanged.
- Unchanged: the transition shape, `FoldState`, `WorkingFoldState`, the pattern and fluent types, the matcher, `event_calculus.ts`, `rules.ts`, and every other reader of `holds`.

**Why `applyClip` is an internal export (the seam).** No event can deliver a wildcard pattern to `applyStep`:
- The only non-empty clip row in `ROOT_EVENT_CALCULUS` is `runtime_activity_probe_observed`, with `clips: ["runtime_inactivity_asserted"]` (`axioms.ts:233`).
- `eventCalculusEffectRefs` returns that row only for a kind string (`:656`).
- For an event, its own `runtime_activity_probe_observed` case always clips exactly `runtime_inactivity_asserted(scopeDigest)` (`:854`).
- Every rule effect has empty clips (`rules.ts:23`, `:27`).

So test (c) calls `applyClip` directly, and tests (b) and (d) call `applyStep`. The Stop clause on "any reader of holds outside applyStep" was read as follows: `applyClip` is `applyStep`'s own clip loop, its only production caller is `applyStep`, and no existing reader changed.

**Copy decision: dropped.** The wildcard enumeration iterates the live `holds` and no longer copies `[...holds.entries()]` first. Reason: ECMAScript Map iteration walks the live entry list in insertion order. `delete` empties the current entry where it stands, so a later entry is neither skipped nor visited twice. The clip loop adds no entry. The visited set and order are therefore the same as over the copy, without the O(N) copy per pattern.

A scratch check ran the head loop verbatim against `applyClip`: N = 0, 1, 7 and 64; six patterns (name-only, identity-only, exact present, exact absent, unknown name); each pattern applied twice. All 24 cases gave the same `fluents`, `clipped` and remaining `holds`.

**Transition before item 1 (head `cff4f9dcd`).** Recorded by a scratch run of the head build's `applyStep`.
- Event: an observed native probe. It is outside the root event contract, uses `source` null and has no dependencies.
- Held state: `actor_stdout_available(event id)` fluents, with every fourth one a sibling `runtime_inactivity_asserted(other)`, plus the target `runtime_inactivity_asserted(T)`.
- T is `sha256:0…0abc`. D is `sha256:0…0def`, which is not held.

Present case (identical at N = 8 and N = 2048):
- `fluents`: `[runtime_inactivity_asserted(T), held false]`, `[runtime_activity_recent(T), held true, runId]`, `[runtime_invocation_active(T), held true, runId]`
- `clipped`: `[runtime_inactivity_asserted(T)]`
- `effect`: initiates `runtime_activity_recent(T)` and `runtime_invocation_active(T)`; terminates `[]`; clips `[[runtime_inactivity_asserted, T]]`; declips `[]`
- `declipped`: `[]`; `probe`: null; `interruption`: null

Absent case: `fluents` holds only the two initiates (on D), `clipped` is `[]`, and the effect clips `[[runtime_inactivity_asserted, D]]`.

**After.** The same scratch script on the new build gives identical transitions, holds sizes and `clippedFluentRefs` at both N, in both cases. The lane asserts the same transition, written out literally as `headTransition`, at `:267` and `:303`.

**Visit counts.** Each `get`, `has` or iteration yield counts as one visit.

| Clip | N = 8 before | N = 8 after | N = 2048 before | N = 2048 after |
|---|---|---|---|---|
| exact, target held | 9 | 1 | 2049 | 1 |
| exact, not held | 9 | 1 | 2049 | 1 |
| wildcard (`identity` null) | 9 | 9 | 2049 | 2049 |

The wildcard "before" figures are the head loop's count, which does not depend on the pattern: it copies and tests all N + 1 entries for every pattern. Head has no path that brings a wildcard into `applyStep`.

**Findings.**
- Nothing in `code/src` initiates `runtime_inactivity_asserted`; it appears only as a clip (`axioms.ts:233`, `:854`). In production, every exact clip is therefore the absent case. The quadratic visit cost bought nothing, and the present case exists only by seeding.
- The U1 P-FOLD cases contain no probe event, so no step at any cut has a clip. They compare `holds`, `clippedFluentRefs` and `declippedPatternRefs`, not transition `fluents`. The clip transition is covered by the counter cases against the head transition.
- Design `:191` still cites `fold.ts:191` for `applyStep` (now `:213`), `:261` for `foldStep` (now `:275`) and `:154` for `workingFoldState` (now `:155`). Item 3 allowed one sentence only, so I left these for the Executive. The register's TD-06 evidence line (`fold.ts:222–229`) is also the Executive's.
- `npm run build` regenerated `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json` (content digests). Both are committed.

**Lanes.** Results are tests/pass/fail/skipped.
- `npm run build`: exit 0.
- `npx tsc --noEmit -p tsconfig.json`: exit 0.
- `npm run lint:imports`: exit 0. 28 modules under `code/src/shared/` import only `code/src/shared/` and packages.
- `npm run lint:lifecycle`: exit 0. 284 modules under `code/src`; 10 allow-listed sites; no offender.
- `t287-calculus-fold`: 10/10/0/0.
- `m5-event-calculus-runtime`: 19/13/5/1.
- `t287-calculus-state-transfer`: 8/6/0/0, plus 2 cancelled.
- `t287-event-calculus-owner-continuation`: 1/0/1/0.
- `t287-generic-job-parent-foldback`: 1/0/0/1.
- `t287-native-runtime-gate`: 7/6/0/1.

The m5, state-transfer and owner-continuation results are identical at head. I reran those three lanes with the head `fold.ts` and `axioms.ts` built, and the failing and cancelled test names match:
- m5: four tests fail on `abg.openCall is not a function`. One fails on `runtime_failure_observed/runtime_invocation_active` at `m5-event-calculus-runtime.test.mjs:1453`, a static-versus-dynamic terminates check with no clip involved.
- state-transfer: `identity_end` and its parent test are cancelled with "test did not finish before its parent".
- owner-continuation: module load stops with "exact preimage territory and a digest-bound CLOSED JSONL fixture are required" (`:18`).

**Stops.** None.

## TD-06 disposition (Executive, 2026-10-24)

Accepted at `94ca67abf`. Read: the fold and axioms diff in full (`applyClip`, one `holds.get` for an exact pattern, the live-map enumeration for a wildcard, every candidate still passing `ownedRuntimeFluentMatchesPattern`; `ownedExactRuntimeFluentPatternRef` on the owner's one `fluent()` template); the three counter cases; the Return's transition record before and after. Executive check on the head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 10 allow-listed; `t287-calculus-fold` 10/10; `t287-native-runtime-gate` 7/6/0/1 (`exec_check_TD06.log`). The three red lanes in the Return (`m5-event-calculus-runtime` 5 fail, `t287-calculus-state-transfer` 2 cancelled, `t287-event-calculus-owner-continuation` load failure) are in repair H's 48-file log with the same identities.

| Return item | Disposition |
|---|---|
| 1, `applyClip` | accepted, with the Worker's reading of the stop: `applyClip` is `applyStep`'s own clip loop, exported for the wildcard case that no event can deliver through `applyStep`; its one production caller is `applyStep` |
| 2, counter cases | accepted: exact clip 1 visit at N = 8 and N = 2048 (9 and 2049 at head); wildcard 9 and 2049; absent target 1 visit and nothing clipped |
| 3, design sentence | accepted; the three stale citations in the same paragraph (`fold.ts:191`, `:261`, `:154`) are fixed in this bookkeeping commit |
| 4, lanes | accepted |
| copy dropped | accepted: Map iteration follows live insertion order and deleting the current entry skips and repeats nothing |

Findings. Nothing in `code/src` initiates `runtime_inactivity_asserted`, so every production exact clip is the not-held case: the clip is law with no effect on any admitted history. Removing it from the probe axiom changes the recorded effect rows and so the replay witness under D1; that is the owner's (T-290 Phase C). No fixture in the lanes carries a probe event, so a clip at a cold, warm or fork cut is exercised only through the counter cases on `applyStep`, the one function all three routes call; stated here, not reopened.

Register: TD-06 Closed at `94ca67abf`.

## TD-07 activation (Executive, 2026-10-24; an exact liveness query reads one fluent)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Read this section, the register's TD-07 entry, `## TD-06 return` above (the fold's held map and `applyClip`), the design paragraph on `RuntimeEventCalculusDerivation` (about line 191), and the files named below. Do not read other agents' comment directories.

The debt. `abg/event_calculus.ts` `held(prefix)` (about `:280`) copies every held fluent and sorts the copy on every call; `deriveRuntimeHeldFluentProjection(prefix)` (about `:318`) is that call wrapped as `{ holds }`. `holdsAt(projection, pattern)` (`abg/calculus/fold.ts`, about `:290` to `:308`) filters that list. A point query is a call of the form `holdsAt(deriveRuntimeHeldFluentProjection(p), constructRuntimeFluentPattern({ name, identity }))` with both members set and only `.length` compared, or `holdsAt(projection, constructRuntimeFluent(...))` used as a boolean: `runtime_liveness.ts:840` (`actor_process_live`, at the `at_prefix` or the before-event cut), `actor_process.ts:635` to `:639` (one projection, several names), `c_call.ts:2038` and `:6641`, `replay.ts:2461`, `invocation_admission.ts:523`, `worksite_construction_recovery.ts:56`, `retry.ts:3101`, `graph_application.ts:439`, `runtime_failure.ts:287`, `witness_admission_operation.ts:1072` and the rest of the 65 `holdsAt` call sites (20 files). Each of these materializes and sorts every held fluent to answer one key. The owner already has the exact read: `runtimeFluentHoldsAtPrefix(prefix, fluent, ordinal?)` (about `:333`), which asks the memoized derivation's `fluentAt(key, ordinal)` (a binary search over that key's recorded transitions) and allocates nothing; it has two callers.

Items, in this order. The Return carries one row per item: done or stopped, with lines at head.

1. **Equivalence of the exact read with the point query, proven before any site moves.** In `test_env/tests/t287-calculus-fold.test.mjs` (or a new `t287-exact-held-read.test.mjs`): over the U1 fixture and one fixture carrying actor process events (`actor_process_started`, a terminal, a liveness fluent), at every cut (cold, warm, streaming, a fork at a middle cut, and the before-event cut `validatedRuntimeEventPrefixBeforeEvent` as `runtime_liveness.ts:840` uses it), for every key ever held and for absent keys, `runtimeFluentHoldsAtPrefix(prefix, fluent)` equals `holdsAt(deriveRuntimeHeldFluentProjection(prefix), exactPattern).length !== 0`. Include the nested-read case the design states (a read of an earlier cut during a step) if the existing owner-continuation shape allows it without a new fixture. If any cut disagrees, stop item 2 and report the counterexample: that is a semantic difference, not a cost.
2. **Route the exact point queries to the exact read.** Census every `holdsAt` call site: exact pattern (or fluent) with a boolean use moves to `runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name, identity }))` on the same prefix the site already chose (keep `at_prefix` versus before-event exactly as the site selects it; do not move the cut); a wildcard pattern, or any site reading the list (`replay.ts:397` to `:459`, `:965`, `:1393`, `closure.ts:354`, `project_read_ports.ts:1007` and their kind), stays on the projection. Sites that derive one projection and ask several exact names (`actor_process.ts:635`) ask each name through the exact read. The Return's census table lists every site: file, line at head, pattern shape, use, routed or kept, and why. Nothing else about the site changes: same prefix, same null and throw channels, same evaluation order where an earlier term guards a later one.
3. **The full projection unchanged.** `held()`, `project()`, the order of `holds`, and every list consumer keep their behavior; `t287-calculus-fold`'s P-FOLD cases prove the projection, and item 1's equivalence proves the read. No new function in `event_calculus.ts` unless a routed site needs a read with an explicit ordinal that `runtimeFluentHoldsAtPrefix` cannot express; if so, it is a thin owner read over `fluentAt`, stated in the Return, and no second fold.
4. **Records.** One sentence in the design's `RuntimeEventCalculusDerivation` paragraph: exact point queries read `fluentAt` through `runtimeFluentHoldsAtPrefix`; list consumers read the projection. Nothing else in the design. The register is the Executive's.
5. **Lanes.** `npm run build`, `npx tsc --noEmit -p tsconfig.json`, `npm run lint:imports`, `npm run lint:lifecycle`; `t287-calculus-fold`, `m5-event-calculus-runtime` (5 red at head), `t287-native-frame-observation`, `t287-native-workspace-work`, `t287-fh-hold-open`, `witness-run-stopped-definition-binding`, `t287-route-reconstruction`, `t287-post-binding-worksite-write`, `t287-native-work-unknown-effect`, `t287-authenticated-owner-family`, `t288-native-producer-membership`, `retained-route-cursor-transition`, `t287-undispatched-diagnostic`, `m5-worker-transport`, `t287-lifecycle-failure-carrier`. Report each as tests/pass/fail/skipped; any red lane is attributed against `step-8-run-postclose-h.log` (the same identity there, or a new one, which is a stop for the item that caused it). No broad run.

**Grant.** The routed call sites of item 2 (the one expression at each site); `code/src/abg/event_calculus.ts` only for the thin read of item 3 if needed; the test file of item 1; the design sentence of item 4; this file below this section only; build outputs `npm run build` regenerates.

**Stop:** any change to `held()`, `project()`, `holdsAt`, `fluentAt`, `recordFluent`, the memoized class's transitions, or the fold; any change to a site's prefix, cut, or null and throw channel; a disagreement in item 1; a new red identity in item 5; a second bounded attempt at any item; any push.

**Return contract.** One commit on `main`, no push. First line `TD-07: exact liveness queries read one fluent`, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Add only the files you changed; no `git add -A`. Append `## TD-07 return` below this section with: one row per item (done or stopped, lines at head); the item 1 cut table (fixture, cut, keys asked, agreement); the census table; the lane results as `tests/pass/fail/skipped` with attribution of every red; the stop reports, if any, with the counterexample.

## TD-07 return

Worker: Opus 5.5, fresh context. Base `6ee2cee43`; this package's single commit is the next one on `main`, not pushed. Paths are relative to `build_tenants/abiogenesis/typescript/`; `abg/` is `code/src/abg/`.

| Item | State | Lines at head `6ee2cee43` | Lines after |
|---|---|---|---|
| 1. Equivalence, before any site moved | done; green at head before item 2 | `test_env/tests/t287-calculus-fold.test.mjs:1-318` | Cases at `:322-421`: `askedKeys` `:330`, `agreeAt` `:345`, `exactReadAgreement` `:365`, tests `:409` and `:417`. P-FOLD cases unchanged. |
| 2. Route the exact point queries | partly done: 30 of 61 calls routed. The 7 lifecycle-fluent sites are stopped (see Stops). | the 61 `holdsAt(` calls in the census | the routed calls read `runtimeFluentHoldsAtPrefix` on the prefix each site already chose |
| 3. The full projection unchanged | done | `abg/event_calculus.ts`: `recordFluent` `:225`, `fluentAt` `:229`, `project` `:264`, `held` `:280`, `deriveRuntimeHeldFluentProjection` `:318`; `holdsAt` at `abg/calculus/fold.ts:287-308` | No change to any of them or to the fold. No new function. `runtimeFluentHoldsAtPrefix` (`:333-339`, now `:332-338`) serves every routed site with its default ordinal. |
| 4. Records | done | design `:191` | One sentence added to the `RuntimeEventCalculusDerivation` paragraph. |
| 5. Lanes | done | | See Lanes. |

**Item 1: the cut table.** The test asserts, at each cut, three equal answers for every asked key:
- the exact read `runtimeFluentHoldsAtPrefix(cut, fluent)`;
- the fluent point query `holdsAt(deriveRuntimeHeldFluentProjection(cut), fluent)`;
- for a key with an identity, the exact-pattern point query `holdsAt(deriveRuntimeHeldFluentProjection(cut), constructRuntimeFluentPattern({ name, identity })).length !== 0`.

The exact read is asked first at every cut, so it is the call that advances the derivation. The asked keys are:
- every fluent that any effect row of the complete history initiates or terminates ("ever held");
- each real name with an absent identity;
- an absent name with each real identity, and with no identity.

The test also asserts that every fluent held at the cut is one of the asked keys.

| Fixture | Cut | Cuts | Keys asked | Held answers | Agreement |
|---|---|---|---|---|---|
| U1 store (22 events; 67 keys, 30 ever held) | cold through-event: a freshly selected copy per cut | 22 | 1474 | 305 | all |
| | cold before-event | 22 | 1474 | 282 | all |
| | warm validated through / before: advanced to the end first, so the slow path below the end | 22 / 22 | 1474 / 1474 | 305 / 282 | all |
| | warm owned through / before | 22 / 22 | 1474 / 1474 | 305 / 282 | all |
| | streaming before / through: the fast path, at the folded count | 22 / 22 | 1474 / 1474 | 282 / 305 | all |
| | fork before / through: the owned cut at ordinal 11, extended by `extendRuntimeEventPlanPrefixForValidation` over the 11 remaining rows | 11 / 11 | 737 / 737 | 221 / 230 | all |
| Counterexample A (3 events, 29 keys) | cold, warm, streaming; through and before | 3 per kind | 87 per kind | 9 through, 5 before | all |
| Counterexample B (2 events, 25 keys) | same | 2 | 50 | 6, 2 | all |
| Spawn failure, then the actor terminal (2 events, 17 keys) | same | 2 | 34 | 4, 2 | all |
| Late confirmation (3 events, 16 keys) | same | 3 | 48 | 10, 7 | all |
| S, U, exit, A, R (5 events, 36 keys) | same | 5 | 180 | 17, 13 | all |

Totals: 15660 key reads, with no disagreement.

Discrimination checks:
- In the warm passes, at least one key holds at the through-event cut and not at the before-event cut. U1 has 60 such keys; each lifecycle fixture has 3 to 9.
- Streaming asserts one owned state across the advances. Before each step, that state's ordinal equals the before-event cut's last ordinal.
- The fork asserts that each validation prefix reads a state other than the owned derivation's.
- A scratch mutant of the test read at `lastOrdinal - 1`, and it failed both cases.

Nested read: not constructed. The owner-continuation shape needs its environment fixture (`t287-event-calculus-owner-continuation.test.mjs:18`), so I built no new one. Its state is covered instead. The streaming before-event cut reads the owned state at the folded count, before the step's transition is recorded. That is what a nested read of an earlier cut during a step reads (`advance` returns before it assigns the source). The one production nested read, `runtime_liveness.ts:840` through the liveness rule, is a lifecycle site and stays on `holdsAt`.

**Item 2: the census.** I counted every `holdsAt(` call expression in `code/src` outside `abg/calculus/fold.ts`: 61 calls in 19 files. `fold.ts` adds 5 declaration lines (4 overloads and the implementation), giving 66 lines in 20 files. The activation's "65 in 20" is presumably a line count of that kind.

A call is routed when all four of these hold:
- (a) the query asks one key: a constructed fluent, or a pattern with both members set;
- (b) the projection is `deriveRuntimeHeldFluentProjection(P)`, unmodified, with `P` in scope, and every reader of it is an exact point query;
- (c) every path that ran the derivation still runs it before any exit, or a derivation of the same prefix comes earlier on that path;
- (d) the fluent is not a lifecycle fluent.

A routed call reads `runtimeFluentHoldsAtPrefix(P, fluent)` on the same `P`. Each local derivation with no remaining reader is removed, and so is each import with no remaining reader.

Kept reasons:
- **L**, lifecycle boundary: see Stops.
- **List**: a list reader shares the projection, so the projection is built anyway. Point queries on it stay, under one rule.
- **Carrier**: the projection is a parameter, a context or session carrier, or a filtered composite, so the site has no prefix of its own.
- **Exit**: the derivation precedes an exit that asks no fluent, and no earlier derivation of the same prefix is guaranteed. Moving the derivation would drop a fold refusal on that path.

| File | Lines at head | Query shape | Use | Disposition | Why |
|---|---|---|---|---|---|
| `abg/actor_process.ts` | 637 (projection `:635`) | pattern, `name` from `actor_process_live`, `_termination_unconfirmed`, `actor_cleanup_pending`; identity `processRef` | `.length !== 0`, three names | kept | L |
| `abg/c_call.ts` | 1308, 1316, 1360 (projection `:1293`) | fluents `run_active`, `graph_call_active`, `frame_active`, `locus_active`; `c_call_active`; `c_call_judgment_available` | boolean | routed | Only exact readers. `:1308` always runs after `:1293`. The derivation was removed. |
| `abg/c_call.ts` | 1446 (projection `:1428`) | four active fluents | boolean | routed | Immediate. Inside `try` / `catch → null`. |
| `abg/c_call.ts` | 2038 | pattern `actor_process_terminated`, `source.processRef` | `.length !== 0` | kept | L. The identity is the non-empty `processTerminal.aggregateId` (`:1940`). |
| `abg/c_call.ts` | 5000 | fluent `interaction_pending` | boolean | routed | inline |
| `abg/c_call.ts` | 6641 | pattern `actor_process_terminated`, `candidate.processRef` | `.length !== 0` | kept | L. The identity is checked as a non-empty string (`:6603`). |
| `abg/closure.ts` | 345 (projection `:255`) | fluent `terminal_route_available` | boolean | kept | List: `:354` maps `holds`, and `:291` hands it to `projectFhContinuations`. |
| `abg/deferred_application.ts` | 128 (projection `:116`) | four fluents | boolean | routed | Immediate. The derivation and two imports were removed. |
| `abg/event_calculus.ts` | 353 | `constructWorksiteObservationCurrentFluent` at the before-event cut | boolean | routed | Inline, same `before` prefix. See Findings for the grant reading. |
| `abg/fh_continuation_projection.ts` | 734, 738, 742 | fluents `continuation_open`, `_response_available`, `_terminated` | boolean | kept | Carrier: `eventCalculus` is a parameter of `projectFhContinuations`, and replay passes the filtered composite. |
| `abg/graph_application.ts` | 439, 505 | fluents `child_preparation_refused`, `child_foldback_available` | boolean | routed | inline |
| `abg/graph_application.ts` | 614, 622, 629, 636 (projection `:582`) | fluents `graph_call_closed`, `frame_blocked`, `run_terminal`, `run_active` | boolean | routed | The next statement, `replayValidatedRuntimeEventPrefix(prefix, …)` at `:583`, derives the same prefix (`replay.ts:960`). Its cache return at `replay.ts:959` implies an earlier successful fold at that end. The derivation was removed. |
| `abg/graph_application.ts` | 887 (projection `:876`) | fluent `c_call_judgment_available` | boolean | kept | Exit: `parentJudgmentEvent === undefined` returns a refusal without the query. |
| `abg/invocation_admission.ts` | 523 (projection `:521`) | pattern `actor_process_terminated` | `.length !== 0` | kept | L. If routed, timing would hold: the replay guard at `:442` derives `runPrefix` first. |
| `abg/open_call.ts` | 205, 209, 211 (projection `:201`) | `constructRunTerminalFluent`, `…Closed…`, `…Active…` | boolean | kept | Exit: `return "failed"` at `:202` comes before any query. |
| `abg/open_call.ts` | 250, 257 (projection `:248`) | fluents `graph_call_closed`, `graph_call_active` | boolean | routed | Both branches query immediately. The derivation was removed. |
| `abg/project_read_ports.ts` | 990, 1020 | fluent `graph_call_active` | boolean | kept | Carrier: `context.calculus`, built at `replay.ts:2166` and `:2176`. List: `:1007` publishes `holds`. |
| `abg/replay.ts` | 467, 468, 469 (projection `:395`) | run terminal, closed and active fluents | boolean | kept | List: `:397-459` filter `holds`. |
| `abg/replay.ts` | 966 (projection `:961`) | each held `worksite_observation_current` | boolean inside a filter | kept | List: it builds the `:964` composite. |
| `abg/replay.ts` | 1231, 1242, 1301, 1323, 1356, 1424 | fluents `worksite_observation_current`, run terminal, `operator_run_stopped`, run closed, run active | boolean | kept | Carrier: `eventCalculus` is the filtered composite from `:964`. List: replay body `:1389`. |
| `abg/replay.ts` | 2461 | pattern `actor_process_terminated` | `.length !== 0` | kept | L |
| `abg/retry.ts` | 2035, 2249 (projection `:1997`) | `retry_attempt_active`, `locus_active` | boolean | kept | List: `priorCalculus` reaches `projectFhContinuations` (`:2206`, `:1918`). |
| `abg/retry.ts` | 3015, 3101, 3299, 3310, 3440, 3861 (projection `:3002`) | `run_active`, `locus_active`, `constructScopedRetryFluent` attempt and progress | boolean | routed | Only exact readers. Between `:3002` and the unconditional `:3015` there is only the pure `retryBoundaryRef`. The derivation was removed. |
| `abg/runtime_failure.ts` | 287 | `constructRunActiveFluent` | boolean | routed | Inline. Two imports were removed. |
| `abg/runtime_liveness.ts` | 840 | pattern `actor_process_live`, at-prefix or before-event cut | `.length !== 0` | kept | L |
| `abg/traversal_cursor.ts` | 809, 810, 817 (projection `:807`) | run, graph-call and frame active fluents | boolean | routed | Immediate. The derivation and two imports were removed. |
| `abg/traversal_route.ts` | 910, 916, 922 (projection `:909`) | run, frame and locus active fluents | boolean | routed | Immediate. The derivation and the `holdsAt` import were removed. |
| `abg/witness_admission_operation.ts` | 1074, 1078 (projection `:1072`) | `run_active`, `operator_run_stopped` | boolean | routed | Both ternary arms are immediate. The derivation and two imports were removed. |
| `abg/worksite_construction_recovery.ts` | 56 | pattern `actor_process_terminated` | `.length !== 0` | kept | L |
| `abg/worksite_revision.ts` | 577 | `constructWorksiteObservationCurrentFluent` | boolean | kept | Carrier: `work?.calculus`, the `RetainedOriginSession` member (`:565`, `:610`). Routing would leave that member dead. Removing it changes the carrier, which is outside the grant. |
| `abg/worksite_revision.ts` | 812 (projection `:800`) | `constructWorksiteObservationCurrentFluent` | boolean in `every` | kept | Exit: `:803` returns `false`, and read-basis and retained-dependency rows return before the query (`:804-810`). |

Totals:
- Routed: 30 calls at 14 sites in 10 files.
- Kept: 31 calls.
  - L: 7 sites (7 calls).
  - List: 4 sites (7 calls).
  - Carrier: 4 sites (12 calls).
  - Exit: 3 sites (5 calls).

Unsure:
- `event_calculus.ts:353`, the grant reading below.
- `graph_application.ts:582`: its timing rests on `replay.ts:960` and `:959`.

Unchanged at every routed site:
- the prefix: the before-event prefix object at `event_calculus.ts:353`, and `prefix!` at `c_call.ts:5000`;
- the guards ahead of each query;
- the null and refusal returns.

Evaluation order changed in one respect. Where a local derivation was removed, the fold now runs at the first query, after that query's fluent is constructed, not before. The result differs only if a fold refusal and an invalid fluent construction occur at once: both throw `TypeError`, with different messages.

`holdsAt` validates every held fluent, and the exact read validates only the asked one. The fold constructs held fluents canonically, so that throw channel cannot be reached.

**Stops.** Item 2, the lifecycle class: 7 sites, including the register's evidence site `runtime_liveness.ts:840`.

Counterexample:
- I routed `runtime_liveness.ts:840` in a scratch edit, keeping its at-prefix or before-event prefix unchanged.
- `npm run lint:lifecycle` printed `code/src/abg/runtime_liveness.ts:842: constructRuntimeFluent({ name: "actor_process_live", identity: started.processRef }));` and `check-lifecycle-boundary: 1 offender(s)`, exit 1.
- I reverted the edit.

Blocking lines:
- `scripts/check-lifecycle-boundary.mjs:94-102` (`isHoldsAtPatternName`) and `:169`: outside `abg/calculus/`, a lifecycle fluent name may appear only as the `name` of a pattern passed to `holdsAt`.
- The design law behind the lint: design `:285` (§5 table), `:290` ("`holdsAt` is the only admitted reader of 'is this actor process gone'"), `:536` (§9.1, item 3) and `:641` (P-LAYER).

The other lifecycle sites would fail the same way. `actor_process.ts:635-640` would pass the lint mechanically, because its allow-list matches line text. But the allow-list's stated reason, and design `:203` and `:209`, describe it as a `holdsAt` reader. I kept it with the other six.

Routing this class needs the Executive to admit `runtimeFluentHoldsAtPrefix`, with a `constructRuntimeFluent` `name`, as a lifecycle reader in the lint and in design §5 and §9.1. That is outside this grant. No other stop.

**Lanes.** Each result is tests/pass/fail/skipped, at head before any edit and then after. Head reds that `step-8-run-postclose-h.log` does not cover are attributed to my run at head `6ee2cee43` before any edit, with the same test names.

- `npm run build`: exit 0. I ran it again after the design edit, and the manifest was unchanged.
- `npx tsc --noEmit -p tsconfig.json`: exit 0.
- `npm run lint:imports`: exit 0. 28 modules under `code/src/shared/` import only `code/src/shared/` and packages.
- `npm run lint:lifecycle`: exit 0. 284 modules under `code/src`; 10 allow-listed sites; no offender.

| Lane | Head `6ee2cee43` | After | Reds, all with the same test names and causes at head |
|---|---|---|---|
| `t287-calculus-fold` | 10/10/0/0 | 12/12/0/0 | none; the 2 new tests are TD-07's |
| `m5-event-calculus-runtime` | 19/13/5/1 | 19/13/5/1 | In `step-8-run-postclose-h.log`: four fail on `abg.openCall is not a function`, and one fails on `runtime_failure_observed/runtime_invocation_active` (`:1453`). |
| `t287-native-frame-observation` | 8/1/3/4 | 8/1/3/4 | In the H log (`:535-537`): the three tests named there; causes are a missing proof-local territory and an undefined `path` argument. |
| `t287-native-workspace-work` | 38/37/0/1 | 38/37/0/1 | none |
| `t287-fh-hold-open` | 1/0/1/0 | 1/0/1/0 | Not in the H log; red at head. Module load fails with `ERR_MODULE_NOT_FOUND` on a `.ai-workspace/comments/codex/…/s02-installed-continuation-17` install. |
| `witness-run-stopped-definition-binding` | 7/0/7/0 | 7/0/7/0 | Not in the H log; red at head. All 7 fail at `assert.ok(territory)` (`:31`, `:32`, `:65`): no evidence territory in the environment. |
| `t287-route-reconstruction` | 9/7/0/2 | 9/7/0/2 | none |
| `t287-post-binding-worksite-write` | 2/1/1/0 | 2/1/1/0 | Not in the H log; red at head. "T-287 C0 reaches its owner…" fails with `artifact truth is reachable only through its checked owner ingress`. |
| `t287-native-work-unknown-effect` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-authenticated-owner-family` | 1/0/0/1 | 1/0/0/1 | none; skipped without `ABI5_OWNER_HISTORY` |
| `t288-native-producer-membership` | 1/0/0/1 | 1/0/0/1 | none |
| `retained-route-cursor-transition` | 1/0/1/0 | 1/0/1/0 | Not in the H log; red at head. Fails with `traversal transition differs from its staged successor projection`, caused by `replay retained input has no exact entry/source/foldback provenance`. |
| `t287-undispatched-diagnostic` | 7/5/2/0 | 7/5/2/0 | Not in the H log; red at head. Two tests fail; their causes include `event store was not constructed by this ABG module` and a regular-expression mismatch. |
| `m5-worker-transport` | 21/21/0/0 | 21/21/0/0 | none |
| `t287-lifecycle-failure-carrier` | 5/5/0/0 | 5/5/0/0 | none |

No new red identity. For each red lane, the sorted failing test names and the sorted error lines are identical between the run at head and the run after.

**Findings.**
- **Grant reading for `event_calculus.ts:353`.** I read the grant's routed-call-site clause as covering this call, and the `event_calculus.ts` clause as limiting new functions only. The edit is that one expression plus the now-unused `holdsAt` import (`:33`).
- **Stale citations.** Removing that import line moves `advance` from `:241` to `:240`, which makes the design's citation `abg/event_calculus.ts:241` (`:191`) stale. The register's TD-07 evidence `event_calculus.ts:280–284` is now `:279–283`. Both are the Executive's to fix.
- **Dead code, not edited (outside the grant).**
  - `abg/worksite_input_provenance.ts:517` derives `calculus` and never reads it: a full held projection and sort, for nothing.
  - `holdsAt` is imported and never called in `abg/execution_basis.ts:22`, `abg/fan_out_projection.ts:26`, `abg/continuation.ts:144` and `abg/worksite_input_provenance.ts:10`.
- **Exit-kept sites.** `open_call.ts:201`, `graph_application.ts:876` and `worksite_revision.ts:800` would route if the Executive rules that the fold of these prefixes cannot refuse.
- **Build outputs.** `npm run build` regenerated `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json` (content digests). Both are committed.

## TD-07 disposition (Executive, 2026-10-24)

Accepted at `ea18189e3` for the 30 routed calls; the lifecycle class is stopped as the Worker reports and goes to the owner. Read: the source diff at every routed site (the same prefix the site chose, the same guard order, `deriveRuntimeHeldFluentProjection` removed only where no list reader shared it); the two equivalence tests (15660 reads agreeing at every cut of the U1 store and five lifecycle fixtures, cold, warm, streaming, fork and before-event; a mutant at `lastOrdinal - 1` fails both); the census table; the lint rule (`scripts/check-lifecycle-boundary.mjs:94` to `:102`) and the design sentences it enforces (`:285`, `:290`, `:536`, `:641`). Executive check on the head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 10 allow-listed; `t287-calculus-fold` 12/12; `t287-native-workspace-work` 38/37/0/1; `t287-route-reconstruction` 9/7/0/2; `t287-native-work-unknown-effect` 10/10 (`exec_check_TD07.log`). The five lanes red at head and outside H's 48-file log (`t287-fh-hold-open`, `witness-run-stopped-definition-binding`, `t287-post-binding-worksite-write`, `retained-route-cursor-transition`, `t287-undispatched-diagnostic`) fail identically before and after the package.

| Return item | Disposition |
|---|---|
| 1, equivalence | accepted; the nested read is covered by the streaming before-event cut, which reads the folded-count state a nested read sees |
| 2, routing | accepted for 30 calls at 14 sites; `event_calculus.ts:353` and `graph_application.ts:582` accepted as routed (the owner's own exact read, and a prefix a preceding derivation already holds). The seven lifecycle sites stay on `holdsAt`: the design makes `holdsAt` the only admitted reader of the §4.4 lifecycle fluents and the lint enforces it. Admitting the exact read as a second reader changes §5, §9.1 and §10.5 and the lint's rule: a design decision, the owner's (T-290 Phase C). Recommendation: admit `runtimeFluentHoldsAtPrefix` with a `constructRuntimeFluent` argument as a lifecycle reader on the same terms as `holdsAt` (it reads the same fold's recorded transitions, not a copied field, an event kind, a recomputation or a second store), extend `isHoldsAtPatternName` to it, and route the seven, the liveness observer's `:840` first; reversal: the seven stay as they are, which costs one held-set copy and sort per lifecycle question. |
| 3, projection unchanged | accepted |
| 4, design sentence | accepted; the shifted `advance` citation (`:241` to `:240`) is fixed in this bookkeeping commit |
| 5, lanes | accepted; no new red identity |

Findings carried, not reopened: `worksite_input_provenance.ts:517` derives a held projection nothing reads, and `holdsAt` is imported unused in `execution_basis.ts`, `fan_out_projection.ts`, `continuation.ts` and `worksite_input_provenance.ts`; both are discharged in the next package that touches `abg/` (TD-13's grant names them).

Register: TD-07 Conditional at `ea18189e3` (the 30 routed calls closed; the seven lifecycle sites on the owner's decision).

## TD-17 activation (Executive, 2026-10-24; F_P completion keeps its cause)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Read this section, the register's TD-17 entry, the design's §9.3 (leaf failure diagnostics) and the paragraph on the inline diagnostic reference if one exists (search `constructRuntimeFailureDiagnosticRef` in the design), and the files named below. Do not read other agents' comment directories.

The debt. `implementation/leaf_invocation_port.ts`, the prepared probabilistic (F_P) owner invocation's `complete(exchange)` (about `:762` to `:810` at head): a synchronous throw from `prepared.complete` is caught without its error (`:766`) and a rejected Promise's reason is dropped (`:801`); both return `totalizedFailure("implementation_exception")`, whose `diagnosticRef` is the class reference only. The deterministic (F_D) path already keeps the cause: `deterministicFailure` (`:559` to `:589`) sanitizes the caught error with `sanitizeUndispatchedOwnerError`, takes its own `message` (8192 bytes, truncation flagged), builds an inline diagnostic reference with `constructRuntimeFailureDiagnosticRef({ diagnosticClassRef, computeRegime: "F_D", implementationRef, inputDigest, stage, reason, cause })` (`abg/runtime_failure.ts:94`, a `data:` URI carrying the canonical subject, which the cold projection reads back through `readRuntimeFailureDiagnosticSubject`), and binds it into the result candidate and every evidence candidate's `outputDigest`.

Items, in this order. The Return carries one row per item: done or stopped, with lines at head.

1. **The two F_P completion failures keep their cause by the F_D mechanism.** One producer for the F_P completion failure, built on `deterministicFailure`'s shape (or `deterministicFailure` itself with `computeRegime` and `stage` as parameters, if that is the smaller change): `computeRegime: "F_P"`, `stage: "implementation_completion"`, `reason: "thrown"` for the synchronous throw and `"rejected"` for the rejection, `cause` sanitized by the existing policy with the message taken as F_D takes it, the same `implementationRef` and `inputDigest`, the result candidate and evidence candidates rebound as F_D rebinds them. The `finalize` catch at about `:796` (`malformed_return` on an admission or validation throw) is not in scope unless the same producer covers it for free; say which. No new failure class, no new candidate member, no change to `totalizeLeafImplementationFailure`, `closedProbabilisticOwnerReceipt`, the receipt shape or the admission that consumes it (each is a stop).
2. **Proof on the whole path.** In the lane that already drives an F_P completion failure to an admitted failure (look in `t287-runtime-failure-diagnostic.test.mjs`, `t287-c2a-fp-source-contract.test.mjs`, `t287-qualification-fp-proof-delivery.test.mjs` and `t287-undispatched-diagnostic.test.mjs` before writing a new one; `t287-undispatched-diagnostic` is red at head with "event store was not constructed by this ABG module", not yours): two cases, a `prepared.complete` that throws and one that returns a rejecting Promise, each reaching the admitted failure, whose cold diagnostic subject (read through the existing projection, as the F_D case reads it) carries `computeRegime` `F_P`, the stage, the reason, the sanitized cause with the original message, and the invocation's `implementationRef` and `inputDigest`. The negative the repair discriminates: at head the same two cases yield a diagnostic subject with no cause (record it in the Return). An F_D case stays as it is.
3. **Records.** Design §9.3: the sentence that names F_D's retained cause now covers the F_P completion with its stage and reasons; nothing else. The register is the Executive's.
4. **Lanes.** `npm run build`, `npx tsc --noEmit -p tsconfig.json`, `npm run lint:imports`, `npm run lint:lifecycle`; the lane of item 2, `t287-runtime-failure-diagnostic`, `t287-c2a-fp-source-contract`, `t287-qualification-fp-proof-delivery`, `t287-undispatched-diagnostic` (red at head), `m5-s03-authority`, `t287-native-worksite-execution`. Report each as tests/pass/fail/skipped; every red attributed against `step-8-run-postclose-h.log` or the TD-07 return's list of lanes red at head; a new red identity is a stop. No broad run.

**Grant.** `code/src/implementation/leaf_invocation_port.ts` (the F_P `complete`, the one producer, `deterministicFailure` only if parameterized); the test file of item 2; the design sentence of item 3; this file below this section only; build outputs `npm run build` regenerates.

**Stop:** any change to a failure class, a candidate or receipt member, `totalizeLeafImplementationFailure`, `closedProbabilisticOwnerReceipt`, `sanitizeUndispatchedOwnerError`'s policy, `abg/runtime_failure.ts`, or the admission path; a new red identity; a second bounded attempt at any item; any push.

**Return contract.** One commit on `main`, no push. First line `TD-17: F_P completion failures keep their cause`, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Add only the files you changed; no `git add -A`. Append `## TD-17 return` below this section with: one row per item (done or stopped, lines at head); the diagnostic subject of each case at head and after; the lane results as `tests/pass/fail/skipped` with every red attributed; the stop reports, if any, with the counterexample.

## TD-17 return

Worker: Opus 5.5, fresh context. Base `58e23eec9`; this package's single commit is the next one on `main`, not pushed. Paths are relative to `build_tenants/abiogenesis/typescript/`; the port is `code/src/implementation/leaf_invocation_port.ts`.

| Item | State | Lines at head `58e23eec9` | Lines after |
|---|---|---|---|
| 1. F_P completion keeps its cause by the F_D mechanism | done | `deterministicFailure` `:559-596`; F_P `complete(exchange)` `:762-810`: sync catch `:766`, `finalize` catch `:792`, rejection handler `:801` | producer `:559` comment, `:560-597`; sync-throw call site `:769` (catch `:767`); rejection call site `:804` (handler `:802`); `finalize` catch `:793` unchanged |
| 2. Proof on the whole path | done, in `t287-runtime-failure-diagnostic` | lane `:1-492`; F_D admission case `:303` (now `:306`), unchanged | helpers `:376` (`probabilisticCompletionFailure`) and `:418` (`probabilisticCompletionCauseSurvivesAdmission`); tests `:450` (throws) and `:455` (rejects); imports `:7`, `:16`, `:17` |
| 3. Design §9.3 sentence | stopped: the sentence does not exist | design `:567-577` (§9.3) | no design edit |
| 4. Lanes | done | | see Lanes |

**Item 1.** `deterministicFailure` is the one producer. Its stage union gains `implementation_completion`, its reason union gains `rejected`, the caught-error gate reads `reason === "thrown" || reason === "rejected"`, and `computeRegime` is `resolution.computeRegime` instead of the literal `"F_D"`. The four F_D call sites (head `:653`, `:667`, `:673`, `:688`; now `:654`, `:668`, `:674`, `:689`) are byte-identical: each runs only under `resolution.computeRegime === "F_D"`, so their subjects are unchanged. The two F_P sites call `deterministicFailure("implementation_completion", "thrown", error)` from `catch (error)` and `deterministicFailure("implementation_completion", "rejected", error)` from the rejection handler `(error: unknown) =>`. Sanitization is `sanitizeUndispatchedOwnerError` unchanged; the message is the own `message` data descriptor of a native error, 8192 bytes, truncation flagged, as F_D. The result candidate and every evidence candidate's `outputDigest` are rebound as F_D rebinds them; F_P evidence candidates are `[]`, so that map is empty. Unchanged: failure class (`implementation_exception`), candidate and receipt members, `totalizeLeafImplementationFailure`, `closedProbabilisticOwnerReceipt`, `abg/runtime_failure.ts`, the admission path. The `finalize` catch (`malformed_return` on an admission or validation throw) is not covered: the producer fixes `implementation_exception`, and covering it needs a failure-class parameter and a stage. The name `deterministicFailure` now covers the F_P completion; a rename touches the four F_D call sites and is left to the Executive.

No reader keys on the class reference: `diagnostic://abiogenesis/implementation/implementation-exception@5` occurs in `code/src` only as `totalizeLeafImplementationFailure`'s template (`:258`), so replacing it with the inline reference on the F_P completion changes no admission decision. The undispatched F_P path (`undispatched`, `:598`) already puts a `data:` reference in an F_P failure value's `diagnosticRef`.

**Item 2: diagnostic subjects.** Both cases run the actual F_P boundary (`invokeLeafOwnerBoundary` from source), the actual `complete(exchange)` with a carrier pair validated by `validateActorProcessCarrierPair`, then the fixture's `admitRuntimeFailure` with the decoded subject and the candidate's `diagnosticRef`, then `projectRuntimeFailureEvidenceAtPrefix` over a JSON-cloned cold prefix and the `run_evidence` Public projection. This is the F_D case's route: controlled basis/frame/replay premises; the installed C-call result route (`admitOwnedCCallResult`, `c_call_result_admitted`) is not exercised. A substituted subject (`reason` swapped) refuses before append.

At head (the same two tests run against the unedited port; both red at the cold-read assertion, `:431`):

| Case | `candidate.diagnosticRef` | cold `availability` | cold `diagnosticClassRef` | cold `subject` |
|---|---|---|---|---|
| throws (`TypeError`) | `diagnostic://abiogenesis/implementation/implementation-exception@5` | `not_retained` | `diagnostic://abiogenesis/implementation/implementation-exception@5` | `null` |
| rejects (`Error`, `code: 'ENOENT'`) | same | `not_retained` | same | `null` |

After (both green):

| Case | cold `availability` | cold `subject` members |
|---|---|---|
| throws | `retained` | `diagnosticClassRef: diagnostic://abiogenesis/implementation/implementation-exception@5`, `computeRegime: F_P`, `implementationRef: implementation://diagnostic/probabilistic@5`, `inputDigest: sha256:f40505b2780f9fded56ccbfb5ae4e97ab7cb3a2020ab82c728e768bad10de653`, `stage: implementation_completion`, `reason: thrown`, `cause: { errorClass: TypeError, errorCode: null, message: "selected probabilistic completion cause", messageTruncated: false }` |
| rejects | `retained` | the same with `reason: rejected`, `cause: { errorClass: Error, errorCode: ENOENT, message: "selected probabilistic rejection cause", messageTruncated: false }` |

The F_D cases (`:259`, `:288`, `:306`, `:353`) are unchanged and green.

**Lanes.** `npm run build` exit 0; it regenerated `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json` (one content digest each), both committed; at head it regenerated nothing. `npx tsc --noEmit -p tsconfig.json` clean. `lint:imports`: 28 modules, clean. `lint:lifecycle`: 284 modules, 10 allow-listed, no offender.

| Lane | Head | After | Reds and skips |
|---|---|---|---|
| `t287-runtime-failure-diagnostic` | 12/12/0/0; with the two new cases on the unedited port 14/12/2/0 | 14/14/0/0 | the two head reds are the discriminating negative of item 2 |
| `t287-c2a-fp-source-contract` | 4/4/0/0 | 4/4/0/0 | |
| `t287-qualification-fp-proof-delivery` | 1/0/0/1 | 1/0/0/1 | skip: `ABI5_F11_FP_ASSESSMENT_PACKET` and `ABI5_F11_FP_BASELINE_TENANT` unset |
| `t287-undispatched-diagnostic` | 7/5/2/0 | 7/5/2/0 | `:93` (`false !== true` at `:135`) and `:222` (`event store was not constructed by this ABG module` at `:283`): the lane is on the TD-07 return's list of lanes red at head |
| `m5-s03-authority` | 5/1/4/0 | 5/1/4/0 | `:96`, `:218` (capability grant requires exact workspace, policy, actor, and definition authority), `:285` (`declarationClosure` of undefined), `:415` (invalid envelope): `step-8-run-postclose-h.log:1007-1061` |
| `t287-native-worksite-execution` | 6/3/0/3 | 6/3/0/3 | skips: `ABI5_NATIVE_SOURCE_READY_CATALOG` and `ABG_NATIVE_EXECUTION_RETAINED_LOG` unset |

No new red identity: for each red lane, the sorted failing test names, locations and error lines are identical at head and after.

**Stop: item 3.**
- Counterexample: design §9.3 (`:567-577`) is "Process failure facts"; its seven items cover actor and helper process facts. No sentence in §9.3, or anywhere in the design, names F_D's retained cause: the design has no occurrence of `deterministicFailure`, `sanitizeUndispatchedOwnerError`, `implementation_exception` or `implementation_invocation`, and its one `F_D` (`:696`) is a table row on regime authority.
- Blocking line: the grant names "the design sentence of item 3", and item 3 says "nothing else". Writing a new sentence is outside the grant. No design edit is made.
- Proposed sentence, for the Executive to place: "A leaf owner failure caught at the boundary keeps its first cause inline: at the F_D boundary (stages `authority_verification`, `implementation_load` and `implementation_invocation`) and at the F_P completion after the effect (stage `implementation_completion`, reason `thrown` for a synchronous throw and `rejected` for a rejected Promise), the `implementation_exception` failure's `diagnosticRef` and `resultCandidate.diagnosticRef` are `constructRuntimeFailureDiagnosticRef({ diagnosticClassRef, computeRegime, implementationRef, inputDigest, stage, reason, cause })` (`implementation/leaf_invocation_port.ts:560`), with the cause sanitized by `sanitizeUndispatchedOwnerError` and the native error's own message (8192 bytes, truncation flagged), and `readRuntimeFailureDiagnosticSubject` reads it cold."

**Findings.**
- The activation's head range for `deterministicFailure` (`:559` to `:589`) ends at the `diagnosticRef` construction; the closure ends at `:596`.
- The `finalize` catch (`:793`) still totalizes to the class reference `malformed-return@5` without its cause. Covering it is a failure-class parameter on the producer, outside this grant.

## TD-17 disposition (Executive, 2026-10-24)

Accepted at `4bc5a945a`. Read: the port diff in full (`deterministicFailure` is the one producer; its stage union gains `implementation_completion`, its reason union `rejected`, the caught-error gate admits both, and the regime is the resolution's, so the four F_D sites are byte-identical); the two cases in `t287-runtime-failure-diagnostic` and the head subject (`not_retained`, `subject` null) against the after subject (regime `F_P`, stage, reason, sanitized cause with the original message, `implementationRef`, `inputDigest`); the Worker's reading of the installed route (no format check on `diagnosticRef` refuses the inline reference; the F_D inline reference already takes that path). Executive check on the head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 10 allow-listed; `t287-runtime-failure-diagnostic` 14/14; `t287-c2a-fp-source-contract` 4/4 (`exec_check_TD17.log`).

| Return item | Disposition |
|---|---|
| 1, producer | accepted |
| 2, cases | accepted; the admitted failure is reached on the F_D case's controlled route, as the F_D proof is; the installed route is read, not run, and runs at the Phase B close |
| 3, design sentence | the stop is right: the activation pointed at a sentence that does not exist. The Worker's proposed sentence is placed by the Executive in this bookkeeping commit, as a paragraph closing §9.3 |
| 4, lanes | accepted; no new red identity |

Retained: the `finalize` catch (`malformed_return` on an admission or validation throw) still totalizes without its cause; covering it needs a failure-class parameter on the producer. One site, recorded in the register's completion row as the retained exception; it rides with the next package that touches the port.

Register: TD-17 Closed at `4bc5a945a`.

## TD-13 activation (Executive, 2026-10-24; key-set and record-guard duplicates; the two `unknown` ingresses)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Read this section, the register's TD-13 entry, design §4.3 (the `shared/admit/` atoms: `isRecord`, `hasExactKeys`, `admitJson`, `presentMember`) and §10.3's O-TYPE and O-SHAPE rows, `## TD-07 disposition` above (the carried findings), and the files named below. Do not read other agents' comment directories.

The debt. Two private key-set bodies beside the shared atom `hasExactKeys` (`shared/admit/record.ts:20`): `abg/traversal_transition.ts:86` to `:94` (sort both key lists and compare pairwise) and `abg/artifact_truth.ts:169` to `:170` (length equality and `Object.hasOwn` for every expected key, which admits `{ a, b }` against the expected list `["a", "a"]` where the shared atom refuses it). Seven local `isJsonRecord` guards named in the register, five refining typed JSON, two claiming `Readonly<Record<string, JsonValue>>` from `unknown` after an outer-shape check only: `hog/recursion_lifecycle.ts:140` and `hog/workflow_lifecycle.ts:136`. Carried from TD-07: `abg/worksite_input_provenance.ts:517` derives a held projection nothing reads, and `holdsAt` is imported unused in `abg/execution_basis.ts`, `abg/fan_out_projection.ts`, `abg/continuation.ts` and `abg/worksite_input_provenance.ts`.

Items, in this order. The Return carries one row per item: done or stopped, with lines at head.

1. **Key sets.** Both private bodies go; each caller takes the shared `hasExactKeys`. For `artifact_truth.ts`, decide the duplicate-key counterexample in the Return: list every caller's expected-key list at head; if none carries a duplicate, the shared atom's refusal is the decided behavior and a test case states it (an expected list with a duplicate refuses); if one does, stop the item with the caller and its list. Null and throw channels at every caller unchanged.
2. **Record guards.** Census the seven local `isJsonRecord` guards (file, line, input type, what the caller does with the result). The five over typed JSON take the shared `isRecord` (or the typed narrowing the owner already has) and disappear. The two `unknown` ingresses: trace each to its source, the function that produces the `unknown` value and the boundary it crossed (an admitted event payload, a decoded file, a worker exchange, an owner return); state the premise with the line; then either narrow the parameter to the type the source already guarantees, or admit at that boundary with `admitJson` (the shared recursive admission), whichever the trace supports. A trace that reaches a source outside `code/src` (a file, a process) means admission; a trace that ends at a typed producer means narrowing. No new guard, no copy of `admitJson`'s body.
3. **Carried findings.** `worksite_input_provenance.ts:517`: delete the unread derivation, or name in the Return the effect it has (a derivation can advance the memoized fold; show whether anything after it depends on that). The four unused `holdsAt` imports removed. If `tsc` has no `noUnusedLocals`, say so; do not enable it.
4. **Proof.** For item 1, the existing lanes of `traversal_transition` and `artifact_truth` (find them: grep the tests for the module names), plus the duplicate-key case; for item 2, the lanes of `hog/recursion_lifecycle` and `hog/workflow_lifecycle`, plus, for each `unknown` ingress, one negative the repair discriminates: a nested non-JSON value (a function member, or a cycle) at the ingress is refused after the change where the head guard let it through, or, if narrowing was chosen, the narrowed type makes the case a compile error and the Return shows the `tsc` message on a scratch call. Every red attributed against `step-8-run-postclose-h.log` or the lanes the TD-07 return lists as red at head.
5. **Records.** §10.3 O-SHAPE or O-KEY row: the two bodies and the seven guards retired, the two ingresses admitted or narrowed, in one sentence each. Nothing else in the design. The register is the Executive's.
6. **Lanes.** `npm run build`, `npx tsc --noEmit -p tsconfig.json`, `npm run lint:imports`, `npm run lint:lifecycle`; the lanes of item 4; `t287-native-workspace-work`; `t287-route-reconstruction`. Report each as tests/pass/fail/skipped.

**Grant.** `code/src/abg/traversal_transition.ts`, `code/src/abg/artifact_truth.ts` (the key-set bodies and their callers' call expressions); the seven guard sites and their callers' guard expressions; `code/src/hog/recursion_lifecycle.ts` and `code/src/hog/workflow_lifecycle.ts` at the two ingresses (the parameter type or the admission call); `code/src/abg/worksite_input_provenance.ts:517` and the four import lines; the test files of item 4; the design row of item 5; this file below this section only; build outputs `npm run build` regenerates.

**Stop:** any change to a shared atom's body or signature (`shared/admit/`); any change to an event payload, a candidate shape or a contract; a caller whose expected-key list carries a duplicate (item 1); an `unknown` ingress whose trace is ambiguous between two sources; a new red identity; a second bounded attempt at any item; any push.

**Return contract.** One commit on `main`, no push. First line `TD-13: key-set and record-guard duplicates retired; the two unknown ingresses traced`, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Add only the files you changed; no `git add -A`. Append `## TD-13 return` below this section with: one row per item (done or stopped, lines at head); the guard census table; the two ingress traces with their premise lines and the choice made; the lane results as `tests/pass/fail/skipped` with every red attributed; the stop reports, if any, with the counterexample.

## TD-13 return

Worker: Opus 5.5, fresh context. Base `7e2481d6b`; this package's single commit is the next one on `main`, not pushed. Paths are relative to `build_tenants/abiogenesis/typescript/code/src/` unless they start with `design/` or `test_env/`.

| Item | State | Lines at head `7e2481d6b` | Lines after |
|---|---|---|---|
| 1. Key sets | done | `abg/traversal_transition.ts` body `:86-94`, callers `:103`, `:108`, `:113`, `:117`, `:122`, `:127`, `:134`, `:138`, `:226`, `:276`; `abg/artifact_truth.ts` body `:169-171`, callers `:307`, `:319` | shared atom imported at `traversal_transition.ts:2` and `artifact_truth.ts:23`; callers `traversal_transition.ts:93`, `:98`, `:103`, `:107`, `:112`, `:117`, `:124`, `:128`, `:216`, `:266`; `artifact_truth.ts:303`, `:315` |
| 2. Record guards | done; one parameter narrowing sits outside the two named hog files (see Ingresses) | guards `abg/c_call_outcome.ts:140`, `abg/traversal_route.ts:943`, `abg/c_call.ts:1555`, `abg/execution_basis.ts:949`, `abg/traversal_cursor.ts:109`, `hog/workflow_lifecycle.ts:136`, `hog/recursion_lifecycle.ts:140`; 266 call expressions | no `isJsonRecord` in `code/src`; `isRecord` imported at `c_call_outcome.ts:136`, `traversal_route.ts:7`, `c_call.ts:32`, `execution_basis.ts:74` (existing), `traversal_cursor.ts:8`, `workflow_lifecycle.ts:21`, `recursion_lifecycle.ts:33`; typed bindings `c_call_outcome.ts:187`, `traversal_route.ts:1251`; parameter `execution_basis.ts:961` |
| 3. Carried findings | done | `abg/worksite_input_provenance.ts:517`; imports `abg/execution_basis.ts:22`, `abg/fan_out_projection.ts:26` (declaration `:23-27`), `abg/continuation.ts:144` (declaration `:141-146`), `abg/worksite_input_provenance.ts:10` | derivation deleted (its successor statement is now `:516`); import declarations `execution_basis.ts:22` and `worksite_input_provenance.ts:10` removed; `fan_out_projection.ts:23-26`; `continuation.ts:141-143` |
| 4. Proof | done | `test_env/tests/t287-common-computational-library.test.mjs:135-145` | duplicate-key case `:146-149`; compile negatives in scratch (below) |
| 5. Records | done | `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:615` (O-SHAPE), `:618` (O-KEY) | same lines; one sentence on the bodies appended to O-KEY, two on the guards and the ingresses appended to O-SHAPE |
| 6. Lanes | done | | see Lanes |

**Item 1.** `traversal_transition.ts:86-94` is the shared algorithm byte for byte (sort both lists, compare pairwise); its callers' outcomes are unchanged for every list, including the dynamic list at `:226`, whose parts (`required`, `nextAction`, `graphSpan` and the two optional names) are disjoint literals. `artifact_truth.ts:169-171` differs from the shared atom in two ways. (a) Duplicate expected key: on `{ a: 1, b: 2 }` with `["a", "a"]` the head expression `Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key))` returns `true` and `hasExactKeys` returns `false` (both evaluated in node). The callers' expected lists at head are `:307` `["kind", "schemaVersion", "productId", "installId", "installedRoot"]` and `:319` `["kind", "schemaVersion", "admissionEventRef", "admissionEventDigest", "lockId", "lockDigest"]`: no duplicate, so the shared refusal is the decided behavior and `t287-common-computational-library.test.mjs:149` states it. (b) Non-enumerable own key: `Object.hasOwn` counts one and `Object.keys` does not. Unreachable at both callers: the record is a member of an admitted event payload (`recordPayload`, `artifact_truth.ts:148`), and event payloads come from `JSON.parse` only (`abg/event_body_encoding.ts:123` for appended candidates, `abg/event_store.ts:3333`, `:3534`, `:3614` for decoded rows), which yields own enumerable data members. Both callers keep the throw channel (`TypeError` on mismatch) unchanged.

**Item 2: guard census.** All seven bodies are `typeof value === "object" && value !== null && !Array.isArray(value)`, the body of `isRecord` (`shared/admit/record.ts:9`), so runtime behavior is unchanged at every call; the change is in the type the call claims. Argument types are from the TypeScript checker at each call expression at head.

| Guard at head | Declared input | Call arguments (266) | What callers do with the result | Replaced by |
|---|---|---|---|---|
| `abg/c_call_outcome.ts:140` | `JsonValue \| undefined` | 27: 24 `JsonValue`, 2 `JsonValue \| undefined`, 1 `any` (`:221` `admittedGrant`) | select an event payload or member record and read members; refusal value, `null` or `false` | `isRecord`; `admittedGrant` typed `JsonValue \| undefined \| null` at its binding (head `:193`, after `:187`) |
| `abg/traversal_route.ts:943` | `JsonValue \| undefined` | 114: 56 `JsonValue`, 51 `JsonValue \| undefined`, 7 `any` (`:1120`, `:1188`, `:1259`, `:1475`, `:2473`, `:2484`, `:2512`) | route, projection, basis and ledger shape checks; `null` or `false` | `isRecord`; ledger rows bound as `readonly JsonValue[]` before the loop (head `:1257`, after `:1251`); the other six `any` sites read members only by `typeof` or equality and compile with `unknown` members |
| `abg/c_call.ts:1555` | `JsonValue \| undefined` | 75: 64 `JsonValue`, 7 `JsonValue \| undefined`, 4 typed records (`:3219`, `:6330`, `:6619`, `:6914`) | CCall candidate and payload shape checks; `null`, `false` or the owner's throw | `isRecord` |
| `abg/execution_basis.ts:949` | `unknown` | 21: 18 `JsonValue`, 2 `JsonValue \| undefined`, 1 `unknown` (`:970`) | basis and payload checks; `:970` gates `hasExactWorksiteCommandLeafSourceAtDurablePrefix` on the `false` channel | `isRecord`; the `:967` parameter narrowed to `JsonValue` (after `:961`) |
| `abg/traversal_cursor.ts:109` | `unknown` | 24: 17 `JsonValue`, 6 `JsonValue \| undefined`, 1 `unknown` (`:428` `origin`) | cursor payload checks; `:428` reads six members by `typeof === "string"` and compares them; `null` channel | `isRecord`; `:428` keeps `unknown` members, and nothing downstream claims JSON |
| `hog/workflow_lifecycle.ts:136` | `unknown` | 2: `:642` `child.resultValue`, `:694` `childValue`; both statically JSON | `:642` feeds `childResultValue` of `deriveGraphFunctionActionEvaluationBasis`; `:694` routes a non-record to `failWorkflow`, a record to `resultCandidate` | `isRecord` |
| `hog/recursion_lifecycle.ts:140` | `unknown` | 3: `:673` `restored.resultValue`, `:770` `event.payload`, `:884` `child.resultValue`; all `JsonValue` | `:673` feeds `prepareChildTraversal` `input`; `:770` selects the child result event; `:884` routes a non-record to `recursionFailure` | `isRecord` |

The two `any` arguments that fed JSON consumers (`c_call_outcome.ts:221` into `canonicalEquals`; `traversal_route.ts:1259` into `nonEmptyStringArray`) were `JsonValue` erased by `Array.isArray`, which narrows `readonly JsonValue[]` to `readonly JsonValue[] & any[]`. Without the typed bindings the swap gives two `TS2345` errors. Origins at head: `admission` is `Readonly<Record<string, JsonValue>>` by `PAYLOAD_RECORD` (`c_call_outcome.ts:156`, applied at `:185`, read at `:191`), so `grants` (`:192`) is `JsonValue | undefined` before `Array.isArray`; the ledger is `edgeFulfillmentLedger(value: JsonValue | undefined)` (`traversal_route.ts:1232-1233`). The `traversal_route` binding is a checked assignment of `readonly JsonValue[] & any[]` to `readonly JsonValue[]`. The `c_call_outcome` binding has no `as`, but it accepts `grants[0]` as `any`, so TypeScript does not check that `any` to `JsonValue` step; the origin premise above carries it. Both are O-TYPE (T).

**Ingresses.** The activation's premise does not match head. Neither named guard receives an `unknown` argument; the actual `unknown` arguments are at `execution_basis.ts:970` and `traversal_cursor.ts:428`.

- `hog/recursion_lifecycle.ts:140`. Source: `restoreOwnedDeferredRecursion` (`:634`) and `completeOwnedRecursionChild`'s `child`, both `ExecutableTraversalCompletion`, whose `resultValue` is `JsonValue | null` (premise `hog/traversal_completion.ts:94`, produced from `CompletionValues.resultValue: JsonValue`, `:114`, at `:149`); and `RuntimeEvent.payload: JsonValue` (premise `abg/event_store.ts:1210`). Typed producers in `code/src`: narrowed. The guard is retired into `isRecord`, which over these arguments selects the `JsonValue` record member; no parameter remains to narrow.
- `hog/workflow_lifecycle.ts:136`. Source: `completeOwnedWorkflowLocus`'s `child: OwnedExecutableTraversalCompletion` (`:518`; premise `hog/traversal_completion.ts:94`), `deriveGraphFunctionActionEvaluationBasis`'s return `Readonly<Record<string, JsonValue>> | null` (premise `abg/traversal_route.ts:2155`), and the string-member failure literal at `:688-693`. Narrowed, as above.
- `abg/execution_basis.ts:967` (the `unknown` at `:970`). Source: the one `code/src` caller, `implementation/leaf_invocation_port.ts:1616`, passes `call.input`, declared `Readonly<Record<string, JsonValue>>` (premise `implementation/contracts.ts:426`). Narrowed: the parameter is `JsonValue`, and the runtime `isRecord` check stays, so the JS test callers keep the `false` channel. The exact record type surfaces `TS2345` at head `:992` (`value.capabilityGrant` is `JsonValue | undefined`). At head the guard's union with `WorksiteExecutionTask` hid that `undefined`, and the read sits inside the function's `try`/`catch` → `false`. Changing that expression is outside the grant, so `JsonValue`, the domain of the caller's type, is the narrowing. This parameter is in `execution_basis.ts`, not in the two hog files the grant names for a parameter change.
- `abg/traversal_cursor.ts:426` (the `unknown` at `:428`). Callers pass `p.continuedFrom: JsonValue` (`:478`) and a six-string literal (`:761`). `isRecord` leaves the members `unknown`, the function checks each by `typeof`, and nothing claims JSON. No parameter change.

**Item 4: discriminating negatives** (narrowing, so compile errors). Scratch copies of `code/src` with one appended function per ingress, all passing an `unknown` `{ member: () => 0 }`, or the literal itself, through the head path. With the head guards: `tsc --noEmit` exit 0. After:

```
hog/recursion_lifecycle.ts: error TS2322: Type 'Readonly<Record<string, unknown>>' is not assignable to type 'Readonly<Record<string, JsonValue>>'.
  'string' index signatures are incompatible. Type 'unknown' is not assignable to type 'JsonValue'.
    (return isRecord(raw) ? raw : null, typed Parameters<typeof prepareChildTraversal>[2]["input"] | null)
hog/workflow_lifecycle.ts: error TS2322: the same, typed Parameters<typeof deriveGraphFunctionActionEvaluationBasis>[3]["childResultValue"] | null
td13_scratch.ts: error TS2345: Argument of type '{ member: () => number; }' is not assignable to parameter of type 'JsonValue'.
  Types of property 'member' are incompatible. Type '() => number' is not assignable to type 'JsonValue | undefined'.
    (hasExactWorksiteCommandLeafSourceAtDurablePrefix(prefix, "c-call://scratch", { member: () => 0 }))
```

**Item 3.** `worksite_input_provenance.ts:517` (`const calculus = deriveRuntimeHeldFluentProjection(prefix)`) had two effects: an advance of the memoized fold to `prefix` (`abg/event_calculus.ts:292`) and one held-set copy and sort. The enclosing `projectSameRunWorksiteCommandSourceAtPrefix` returns at `:468` for native and observed tasks. So the next statement, `worksiteExecutionSourcesCurrent(prefix, input.task)`, always reaches `abg/worksite_revision.ts:800`, which derives the same projection on the same `prefix`. Every fold entry advances itself (`event_calculus.ts:292`), so nothing after `:517` depends on it, and a throwing fold step surfaces from `:800` on the same channel. Deleted. The four `holdsAt` imports are removed, along with the other names on those declarations that a one-off `tsc --noUnusedLocals` on a scratch copy reports unused:
- `deriveRuntimeEventCalculusProjection` and `constructWorksiteObservationCurrentFluent` at `execution_basis.ts:22`;
- `deriveRuntimeHeldFluentProjection` (unused once `:517` goes) and `constructWorksiteObservationCurrentFluent` at `worksite_input_provenance.ts:10`;
- `constructRuntimeFluent` and `type RuntimeEventCalculusProjection` at `continuation.ts`.

The `execution_basis.ts` and `worksite_input_provenance.ts` declarations empty and go, which drops each file's only edge to `event_calculus.js`. Each edited module loads as an entry point from `build/` (`execution_basis.js`, `worksite_input_provenance.js`, `continuation.js`, `fan_out_projection.js`, `index.js`), and the lanes load them. `tsconfig.json` has no `noUnusedLocals`; it is not enabled. The same one-off run still reports 24 unused names in these four files on other lines, outside the grant.

**Lanes.** `npm run build` exit 0; it regenerated `build/code/src/abg/c_call_outcome.js` (tracked), `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json`, all committed. At head it regenerated nothing. `npx tsc --noEmit -p tsconfig.json` clean. `lint:imports`: 28 modules, clean. `lint:lifecycle`: 284 modules, 10 allow-listed, no offender.

Every lane ran at head (`7e2481d6b`, rebuilt) and after. Counts, sorted red identities (file:line, test name, first error line) and skip sets are identical at head and after: 32 reds each, no new red identity. Skips are env-gated fixtures that are unset (retained installed prefixes, predecessor roots, proof territories).

| Lane | Head | After | Reds |
|---|---|---|---|
| `t287-common-computational-library` | 9/9/0/0 | 9/9/0/0 | the duplicate-key assert joins test `:135` |
| `generic-input-retention` | 4/2/2/0 | 4/2/2/0 | `:82`, `:132` "Event Calculus requires a nominal validated immutable event prefix": red at head, in neither source |
| `retained-route-cursor-transition` | 1/0/1/0 | 1/0/1/0 | `:26`: TD-07 return's list |
| `t287-fh-hold-open` | 1/0/1/0 | 1/0/1/0 | file load, `ERR_MODULE_NOT_FOUND` under `.ai-workspace/comments/codex/...`: TD-07 return's list |
| `t287-retry-run-prefix` | 3/0/3/0 | 3/0/3/0 | `:59`, `:92`, `:107` "select the immutable s02-installed-continuation-04 carrier": red at head, in neither source |
| `t287-route-reconstruction` | 9/7/0/2 | 9/7/0/2 | |
| `w2-steel-single-start-closure` | 8/0/0/8 | 8/0/0/8 | |
| `t287-recursive-registered-selection` | 4/2/1/1 | 4/2/1/1 | `:129` strict-equal assertion: red at head, in neither source |
| `t287-runtime-failure-diagnostic` | 14/14/0/0 | 14/14/0/0 | |
| `t287-held-prefix` | 6/0/0/6 | 6/0/0/6 | |
| `t287-native-workspace-work` | 38/37/0/1 | 38/37/0/1 | |
| `m5-event-store-reopen` | 18/18/0/0 | 18/18/0/0 | |
| `r3-workspace-binding` | 1/0/1/0 | 1/0/1/0 | `:85` `product_verification_refusal`: red at head, in neither source |
| `r5-invocation-admission` | 3/0/3/0 | 3/0/3/0 | `:15` ENOENT `code/src/public/operations.ts`, `:100`, `:598` `catalog_construction_refusal`: red at head, in neither source |
| `steel-basic-cli-public` | 1/0/1/0 | 1/0/1/0 | `:269` `product.verify` refusal: red at head, in neither source |
| `t287-authenticated-owner-values` | 3/1/1/1 | 3/1/1/1 | `:39` reference-equality assertion: red at head, in neither source |
| `t287-conformance-owner-reuse` | 1/0/1/0 | 1/0/1/0 | file-level: `step-8-run-postclose-h.log:486` |
| `t287-environment-projection-conservation` | 1/0/0/1 | 1/0/0/1 | |
| `t287-exact-prefix-projection-reuse` | 2/0/1/1 | 2/0/1/1 | `:14` "explicit fresh proof territory required": red at head, in neither source |
| `t287-governance-covered-source-use` | 8/2/3/3 | 8/2/3/3 | `:351`, `:386`, `:430` "select the frozen bounded fixture": red at head, in neither source |
| `t287-installed-product-coordinate` | 11/11/0/0 | 11/11/0/0 | |
| `t287-post-binding-worksite-write` | 2/1/1/0 | 2/1/1/0 | `:244`: TD-07 return's list |
| `t287-ordered-reconstruction` | 7/0/4/3 | 7/0/4/3 | `:22`, `:74`, `:103`, `:158`: `step-8-run-postclose-h.log:587`, `:588`, `:589`, `:591` |
| `t287-qualification-producer-acquisition-reuse` | 1/0/1/0 | 1/0/1/0 | file-level "explicit finite copied-history, retained context and exact historical owner fixtures required": red at head, in neither source |
| `t287-reconstruction-conservation` | 2/0/0/2 | 2/0/0/2 | |
| `t287-release-publication` | 1/0/1/0 | 1/0/1/0 | file-level "explicit disposable release-fixture territory required": red at head, in neither source |
| `t287-release-acceptance` | 1/0/1/0 | 1/0/1/0 | file-level "explicit disposable F16 proof territory required": red at head, in neither source |
| `t287-st2a-e-exact-prefix-workspace-environment` | 1/1/0/0 | 1/1/0/0 | |
| `t287-w2-05-install-catalog-owner-chain` | 1/0/1/0 | 1/0/1/0 | `:286`: `step-8-run-postclose-h.log:663` |
| `t288-environment-guard-contraction` | 1/0/0/1 | 1/0/0/1 | |
| `t288-environment-context-reuse` | 1/0/0/1 | 1/0/0/1 | |
| `t289-install-event-bodies` | 4/0/4/0 | 4/0/4/0 | `:121`, `:435` "explicit isolated proof territory / predecessor package ... required", `:323`, `:377` `ERR_INVALID_ARG_TYPE` path: red at head, in neither source |

Thirteen lanes are red at head and outside both named sources: they are outside H's 48 files and outside the TD-07 five. Their reds are identical before and after this package. Seven of them (`t287-retry-run-prefix`, `t287-exact-prefix-projection-reuse`, `t287-governance-covered-source-use`, `t287-qualification-producer-acquisition-reuse`, `t287-release-publication`, `t287-release-acceptance`, `t289-install-event-bodies`) fail on an absent fixture or proof territory. The six identities attributed to H (`:486`, `:587`, `:588`, `:589`, `:591`, `:663`) carry the same first error line here as in H.

**Grant boundary.** Five edits sit outside the grant's literal text: the Executive rules on each.
1. The parameter narrowing at `execution_basis.ts:961`.
2. The typed binding at `c_call_outcome.ts:187`, on a declaration and not a guard expression.
3. The typed binding at `traversal_route.ts:1251`, likewise.
4. The duplicate-key assert in `t287-common-computational-library.test.mjs`, a lane outside the set the item 4 module-name grep produces.
5. The O-SHAPE clause that names `hasExactWorksiteCommandLeafSourceAtDurablePrefix` taking `JsonValue`, which reverts with edit 1.

The alternative for 1 to 3 is to stop the site and keep its local guard, with the swap's error as the counterexample:
- 1: `TS2345` at head `:986` and `:992`, `Readonly<Record<string, unknown>>` and `unknown` into `canonicalEquals`;
- 2: `TS2345` at head `:223` into `canonicalEquals`;
- 3: `TS2345` at head `:1268-1269` into `nonEmptyStringArray`.

**Stops.** None.

**Findings.**
- The register's "five refine typed JSON" holds at the call sites, not the declarations. Four of the seven guards declare `unknown`; two of them (`execution_basis.ts:949`, `traversal_cursor.ts:109`) had the only actual `unknown` arguments.
- Head `execution_basis.ts:992` reads `value.capabilityGrant` without an `undefined` check; the `try`/`catch` makes the outcome `false`. Narrowing the parameter to the caller's exact record type needs that check, a one-expression change outside this grant.

## TD-13 disposition (Executive, 2026-10-24)

Accepted at `50301d557`. Read: the diff at the two key-set bodies and their twelve callers; the seven guard retirements (byte-identical bodies to `isRecord`, so only the claimed type moves); the three ingress traces, each ending at a typed producer with its premise line; the duplicate-key decision (neither `artifact_truth` caller's list carries a duplicate; the shared refusal is asserted in the atom's lane); the dead derivation (the function returns before anything reads it, and the next statement derives the same prefix). Executive check on the head: `tsc --noEmit` clean; `lint:imports` 28 modules; `lint:lifecycle` 284 modules, 10 allow-listed; `t287-common-computational-library` 9/9; `t287-runtime-failure-diagnostic` 14/14; `m5-event-store-reopen` 18/18; `t287-installed-product-coordinate` 11/11 (`exec_check_TD13.log`).

Ruling on the five edits outside the grant's letter: accepted. The `execution_basis.ts` parameter narrowing is item 2's own instruction for a traced `unknown` ingress; the typed bindings in `c_call_outcome.ts` and `traversal_route.ts` are what the `isRecord` swap needs where `Array.isArray` erases `JsonValue`; the duplicate-key assertion belongs in the shared atom's lane; the O-SHAPE clause follows the narrowing. Retained, one line: `execution_basis.ts` at head `:992` reads `value.capabilityGrant` without a record check, and the function's `try/catch` turns the throw into `false`; the `false` channel is the contract, so this is a reading, not a defect. The thirteen lanes red at head outside H's log and TD-07's five are fixture- and territory-gated and identical before and after; they extend the known-red list for the Phase B close.

Register: TD-13 Closed at `50301d557`.

## TD-14 activation (Executive, 2026-10-24; the 55 casts outside repair C's census and the tracer gaps)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Read this section, the register's TD-14 entry, `## Post-close repair return C` in `work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8.md` (the census method, the residuals, the (T), (I), (A) classes and the `stop: channel` marking), the census table `post-close-repair-c-census.tsv` beside it (2951 rows at `0c362da15`; columns file:line, function, expression, static type before the cast, cast form, sink, producer, decision, channel, done; the 55 rows with decision `kept (no sink traced)`), design §4.3 (`admitJson`, `isRecord`, `presentMember`) and §10.3's O-TYPE and O-SCHEMA rows, and the files named below. Do not read other agents' comment directories.

The debt. Repair C decided every cast of the forms `as JsonValue`, `as unknown as JsonValue` and `as Readonly<Record<string, JsonValue>>` whose value reaches a canonical sink, and kept 55 casts the tracer traced to no sink, among them four casts of `JSON.parse` results (`gtl/declarations.ts:49`, `validator/raw_admission.ts:205`, `product/worksite_command_execution.ts:1097`, `implementation/worksite_command_helper.ts:1230`, lines at `0c362da15`) and the `as unknown as` views of typed owner objects in `abg/project_read_ports.ts` and `public/installed_public_definition_call.ts`. The tracer does not resolve method receivers (`product.canonicalJson`), callees outside `code/src`, or flows through a `Map`; the register's counterexample is `validator/raw_admission.ts:204`, whose cast result is hashed at `:209` under a no-sink classification (its input is admitted at `:184`). The tree has moved since `0c362da15` (repairs D to H and three debt packages); the census lines are historical.

Items, in this order. The Return carries one row per item: done or stopped, with lines at head.

1. **The universe at head.** Enumerate every cast of the three forms in `code/src` at head, by the same AST method as repair C (reuse its tracer if it is in the tree or the step record; otherwise a TypeScript-checker walk over the three forms). Join to C's table by file, function and expression: rows C decided and unchanged; rows C decided whose site has since changed; the 55 kept rows; casts new since `0c362da15`. The Return states the four counts and lists the second and fourth classes in full.
2. **The 55 and the new casts, each classified and discharged.** For each row: (T) the value is already typed upstream, so the cast is a view: replace it with the typed value or remove it; (I) the value crosses an ingress (`JSON.parse`, a file, a process exchange, a worker return, a `node:vm` realm): admit there with `admitJson` or the owner's existing admission, once, and drop the cast; (A) the value is compared or digested at the site without an ingress of its own: admit at the site as repair C did, with the same `stop: channel` rule when refusal would be new behavior the owner's contract does not name; (P) a retained owner premise: the cast stays, with one sentence naming the typed source and why no admission applies (a typed owner object viewed as JSON for a read-only projection is the expected (P) case). The `any` results of `JSON.parse` are (I) unless already admitted at the parse. The Return's table has one row per cast: file:line at head, function, expression, class, what changed or the premise.
3. **The tracer gaps, closed by reading.** For the three gap classes, list every cast in the universe whose value reaches a method receiver, a callee outside `code/src`, or a `Map`, with its class from item 2 and the line where the gap was resolved by hand. `validator/raw_admission.ts` `:204` and `:209` (lines at `0c362da15`) are the first row: state the premise `:184` gives and whether the hash at `:209` is over admitted bytes.
4. **Proof.** For each owner boundary that changed under (I): one malformed-input case the repair discriminates (a function member or a cycle in the parsed value refused at the ingress where the head cast let it through) in that owner's existing lane. For (T) and (P): the touched owners' lanes green or red-as-at-head. Every red attributed against `step-8-run-postclose-h.log`, TD-07's five, or TD-13's thirteen.
5. **Records.** §10.3 O-TYPE row: one sentence stating the universe exactly (the three forms in `code/src` at the commit, the four counts, the (T)/(I)/(A)/(P) totals, the three gap classes resolved by hand). If the O-SCHEMA sentence conflicts with an (I) admission you add at a Product boundary, stop item 5 with the sentence and the site. Nothing else in the design. The register is the Executive's.
6. **Lanes.** `npm run build`, `npx tsc --noEmit -p tsconfig.json`, `npm run lint:imports`, `npm run lint:lifecycle`; the lanes of every touched owner (find them by module name in `test_env/tests`), `t287-common-computational-library`, `t287-native-runtime-gate`, `forward-command-contracts`, `t287-consensus-ref-shape`. Report each as tests/pass/fail/skipped.

**Grant.** The cast expressions of item 2 and the one admission call each (I) site adds; the test files of item 4; the design row of item 5; the census join as a new table `work/T290_DEBT_WAVE_01/td-14-census.tsv`; this file below this section only; build outputs `npm run build` regenerates.

**Stop:** any change to a shared atom (`shared/`); any change to an event payload, a contract, a Product output or the failure classes; an (A) site with no refusal channel of its own (`stop: channel`, the cast stays, the row says so); an (I) admission at a Product boundary that the O-SCHEMA sentence forbids; a new red identity; a second bounded attempt at any item; any push.

**Return contract.** One commit on `main`, no push. First line `TD-14: the casts outside repair C's census classified and discharged; the universe stated`, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Add only the files you changed; no `git add -A`. Append `## TD-14 return` below this section with: one row per item (done or stopped, lines at head); the four universe counts; the classification totals; the gap-class table; the lane results as `tests/pass/fail/skipped` with every red attributed; the stop reports with the counterexample.

## TD-14 return

Worker: Opus 5.5, fresh context. Base `6ec91829e`. This package's single commit is the next one on `main`, not pushed. Paths are relative to `build_tenants/abiogenesis/typescript/code/src/` unless they start with `design/`, `test_env/`, `contracts/`, `scripts/` or `.ai-workspace/`. Line numbers in the tables, premises and gap rows are at head `6ec91829e`; lines after the commit are marked as such.

| Item | State | Lines at head `6ec91829e` | Lines after |
|---|---|---|---|
| 1. Universe | done | C's census, 2,951 rows at `0c362da15`; 56 casts at head | `.ai-workspace/work/T290_DEBT_WAVE_01/td-14-census.tsv`, 2,952 rows |
| 2. Classification | done; nine (T) held under stops (three at `shared/`, six at the C2 context pin), one (I) under `stop: channel` | the 56 sites in the table below | 25 casts remain; changed lines under Edits |
| 3. Gaps | done | `validator/raw_admission.ts:184`, `:204`, `:209` | unchanged |
| 4. Proof | done | `test_env/tests/m5-c-algebra-validation.test.mjs` (1,486 lines) | case `:1488-1493` |
| 5. Records | done; no O-SCHEMA stop: the one (I) admission added is not at a Product boundary | `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:613` (O-TYPE) | `:613`, one sentence appended |
| 6. Lanes | done | | see Lanes |

**Item 1: method.** A TypeScript checker walk (`typescript` 5.9.2) visits every `AsExpression` and `TypeAssertion` in `code/src`. A cast is in the universe when its type node resolves to the `JsonValue` alias declared in `shared/canonical_json.ts` (through any import, re-export or `import()` type), or is `Readonly<Record<string, X>>` with `X` such a node. A cast through `as unknown` is its own form. Calibration: on `0c362da15` the walk reproduces all 2,951 rows of C's census by file:line, function, expression and form. It also finds one cast that C's textual matcher missed, present at `0c362da15` and at head: `abg/effectful_invocation_truth.ts:209`, `operation.payload as Readonly<Record<string, import("../shared/canonical_json.js").JsonValue>>`. The join takes file, function, expression, form and line text; all 55 head casts in C's forms join to the 55 kept rows on all five. A site has changed when the text of its enclosing named unit at head differs from that text at C's commit `99b80d6f5`. The changing commits come from the unit text at each later commit: B `d8cf6b5d9`, D `0eacd4668`, E `280f5777f`, F `195b65ddb`, G `68a5397dc`, H `46ed04895`, TD-06 `94ca67abf`, TD-07 `ea18189e3`, TD-17 `4bc5a945a`, TD-13 `50301d557`.

| Universe class | Rows |
|---|---|
| 1. C decided, unchanged | 2,607. This includes two rows whose units C itself removed: `shared/public_function_contracts.ts` `canonicalIdentity` and `abg/default_library.ts` `asJson`. |
| 2. C decided, site changed | 289, in 64 units |
| 3. C kept (no sink traced) | 55, all present at head |
| 4. New since `0c362da15` | 0 |
| Outside C's textual matcher | 1 (`abg/effectful_invocation_truth.ts:209`) |

None of C's 2,896 decided rows has a cast at head. By changing commit, class 2 has: TD-13 alone 147; B 40; D and TD-13 28; TD-07 26; D and E 17; D and F 13; D, F and H 6; F 5; D 3; D and H 3; E 1.

Class 2 in full, one row per unit. Every row of every unit, with its C decision, is in `td-14-census.tsv`.

| file | enclosing unit | C lines (0c362da15) | rows | unit changed by |
| --- | --- | --- | --- | --- |
| `abg/c_call.ts` | `admitEvidenceUsingTransport` | 6453, 6501, 6614, 6649, 6780, 6814 | 6 | TD-13 |
| `abg/c_call.ts` | `admitJudgment` | 7033, 7068 | 2 | TD-13 |
| `abg/c_call.ts` | `admitResult` | 6907, 6927, 6937 | 3 | TD-13 |
| `abg/c_call.ts` | `completeRejectedCCall/admit` | 7201, 7228, 7253, 7289 | 4 | TD-13 |
| `abg/c_call.ts` | `exactCCallEvidenceIdentity` | 2218 | 1 | TD-13 |
| `abg/c_call.ts` | `exactEventBody` | 4567 | 1 | TD-13 |
| `abg/c_call.ts` | `exactRuntimeFailureSource` | 2999 | 1 | TD-13 |
| `abg/c_call.ts` | `planCCallRuntimeFailureClose` | 3101, 3102, 3169, 3213, 3216, 3217, 3223, 3243, 3285, 3325, 3337 | 11 | TD-13 |
| `abg/c_call.ts` | `projectAdmittedActorTransport` | 1908, 1961, 1988, 1989, 1992, 1993, 2019, 2052, 2053 | 9 | TD-13 |
| `abg/c_call.ts` | `projectAdmittedLeafCCallOutcomeFromPrefix` | 4678, 4678, 4702, 4848, 4849, 4850 | 6 | TD-13 |
| `abg/c_call.ts` | `projectAdmittedProbabilisticTransport` | 2088, 2090 | 2 | TD-13 |
| `abg/c_call.ts` | `projectCCallOpeningAuthority` | 1411, 1421, 1421, 1422, 1422 | 5 | TD-07 |
| `abg/c_call.ts` | `projectCCallRuntimeFailureSignal` | 3490, 3496, 3499, 3532 | 4 | TD-13 |
| `abg/c_call.ts` | `projectOpenedLeafCCallCarrier` | 2410 | 1 | TD-13 |
| `abg/c_call.ts` | `projectOpenedWorkflowCCallCarrier` | 2657, 2750, 2771 | 3 | TD-13 |
| `abg/c_call.ts` | `revalidateProbabilisticResultCarrier` | 3701, 3703, 3705, 3716 | 4 | TD-13 |
| `abg/c_call_outcome.ts` | `projectCCallOutcomeReceiptFromTruth` | 906, 907, 908 | 3 | TD-13 |
| `abg/c_call_outcome.ts` | `projectWorksiteBasisObservation` | 187, 223 | 2 | TD-13 |
| `abg/c_call_outcome.ts` | `projectWorksiteFailureResultRequest` | 398 | 1 | TD-13 |
| `abg/c_call_outcome.ts` | `projectWorksiteSelectedOccurrence` | 291, 293 | 2 | TD-13 |
| `abg/event_calculus.ts` | `worksiteSelectedOccurrenceInputCurrent` | 348, 348 | 2 | TD-07 |
| `abg/execution_basis.ts` | `exactC2SourceEnvironment` | 739, 750, 755, 755, 780, 782, 816, 816, 924, 925, 928, 929, 932, 933, 935, 935 | 16 | TD-13 |
| `abg/execution_basis.ts` | `hasAdmittedImplementationResolution` | 1426 | 1 | TD-13 |
| `abg/execution_basis.ts` | `hasAdmittedImplementationSetAtPrefix` | 1212, 1223 | 2 | TD-13 |
| `abg/execution_basis.ts` | `hasAdmittedInteractionSetAtPrefix` | 1310, 1321 | 2 | TD-13 |
| `abg/execution_basis.ts` | `hasExactInvocationObservationBasis` | 1030 | 1 | TD-13 |
| `abg/execution_basis.ts` | `hasExactWorksiteCommandLeafSourceAtDurablePrefix` | 992, 992 | 2 | TD-13 |
| `abg/graph_application.ts` | `projectApplicationChildFoldbackAtPrefix` | 502 | 1 | TD-07 |
| `abg/graph_application.ts` | `projectApplicationChildPreparationRefusalAtPrefix` | 418 | 1 | TD-07 |
| `abg/qualification_proof.ts` | `<module>:sameFact/sameFact` | 115, 115 | 2 | B |
| `abg/qualification_proof.ts` | `projectQualificationRulingForConsumer` | 475 | 1 | B |
| `abg/retry.ts` | `projectDeclaredCRetryFrontier` | 3004, 3151, 3915 | 3 | TD-07 |
| `abg/runtime_failure.ts` | `admitRuntimeFailure` | 252 | 1 | TD-07 |
| `abg/semantic_job.ts` | `validateWorksiteFileParentsPlanAtPrefix` | 261, 261, 274, 274 | 4 | B |
| `abg/semantic_revision.ts` | `semanticJobRevisionInputMatchesBasis` | 568, 568, 569, 569, 569, 570, 570 | 7 | B |
| `abg/semantic_revision.ts` | `semanticRevisionInputMatchesBasis` | 792, 792, 793, 793, 793, 793, 794, 794 | 8 | B |
| `abg/traversal_cursor.ts` | `projectCursorAncestry` | 475 | 1 | TD-13 |
| `abg/traversal_route.ts` | `admitRoute` | 4404, 4404, 4450, 4844, 4845, 4976, 5063, 5069, 5075 | 9 | TD-13 |
| `abg/traversal_route.ts` | `constructionDeltaForAdvance` | 2623, 2636, 2658, 2723, 2731, 2773, 2777, 2782, 2784, 2785, 2786 | 11 | TD-13 |
| `abg/traversal_route.ts` | `constructionIntentForAdvance` | 1655, 1724, 1751 | 3 | TD-13 |
| `abg/traversal_route.ts` | `deriveGraphFunctionActionEvaluationBasis` | 2218, 2243, 2265, 2274 | 4 | TD-13 |
| `abg/traversal_route.ts` | `hasBlockedRouteEvidence` | 3372, 3443, 3444 | 3 | TD-13 |
| `abg/traversal_route.ts` | `hasGovernedConstructionClosure` | 2980 | 1 | TD-13 |
| `abg/traversal_route.ts` | `hasGraphSpanReentryRouteEvidence` | 3961, 3971 | 2 | TD-13 |
| `abg/traversal_route.ts` | `noActionProjectionForStopRoute` | 1942 | 1 | TD-13 |
| `abg/traversal_route.ts` | `projectHistoricalTraversalRoute` | 660, 666, 667 | 3 | TD-13 |
| `abg/witness_admission_operation.ts` | `prepareSemanticEvent` | 737, 811, 814, 835, 851, 854, 938, 941, 970, 1004, 1035, 1037, 1095 | 13 | TD-07 |
| `abg/worksite_construction_recovery.ts` | `nativeWorksiteRecoverySourceAtPrefix` | 404, 408, 413, 415, 415 | 5 | B |
| `abg/worksite_input_provenance.ts` | `projectSameRunWorksiteCommandSourceAtPrefix` | 483, 497, 497, 506, 506, 510, 510, 510, 510, 511, 511, 511, 511, 535, 535 | 15 | TD-13 |
| `hog/recursion_lifecycle.ts` | `beginRecursionApplicationUsing` | 623, 639, 656, 677 | 4 | TD-13 |
| `hog/recursion_lifecycle.ts` | `blockRecursion` | 497, 523, 570 | 3 | D |
| `hog/recursion_lifecycle.ts` | `completeRecursionChildUsing` | 818, 891, 920, 943, 965, 1007, 1027, 1053, 1072 | 9 | D, TD-13 |
| `hog/workflow_lifecycle.ts` | `completeOwnedWorkflowLocus` | 541, 602, 619, 662, 673, 727, 749, 826, 857, 877, 902, 924, 948, 963, 994, 1021, 1066, 1075, 1093 | 19 | D, TD-13 |
| `implementation/worksite_command_execution.ts` | `realizeWorksiteCommandExecution` | 636, 649, 650 | 3 | D, E |
| `implementation/worksite_command_execution.ts` | `realizeWorksiteCommandExecution/complete` | 688, 689, 707, 734 | 4 | D, E |
| `implementation/worksite_command_helper.ts` | `main` | 1377, 1378, 1387, 1399, 1410, 1412, 1429, 1430, 1452, 1469 | 10 | D, E |
| `implementation/worksite_command_helper.ts` | `predicateObservation` | 1248, 1264, 1282 | 3 | F |
| `implementation/worksite_command_helper.ts` | `runCommand` | 765, 802, 816 | 3 | D, H |
| `implementation/worksite_command_helper.ts` | `runHttpProbe` | 1024, 1025, 1026, 1127, 1164, 1170 | 6 | D, F, H |
| `product/worksite_command_execution.ts` | `constructWorksiteExecutionHelperArtifact` | 1837, 1873 | 2 | D, F |
| `product/worksite_command_execution.ts` | `renderWorksiteCommandExecutionPrompt` | 2196 | 1 | E |
| `product/worksite_command_forward.ts` | `constructWorksiteCommandForwardRequest` | 102, 102 | 2 | F |
| `product/worksite_command_forward.ts` | `constructWorksiteCommandForwardTask` | 120, 120, 128, 128, 134, 139, 139, 139, 139, 140, 140 | 11 | D, F |
| `validator/self_conformance_semantics.ts` | `qualificationResultRelation` | 56, 56, 59, 59, 62, 62, 64, 64, 70, 70, 78, 78, 82 | 13 | B |

Class 4 in full: none. No cast of the three forms was added to `code/src` after `0c362da15`.

The universe excludes these neighbouring spellings, and this package does not decide them: at head, 16 casts to `Record<string, JsonValue>`, 8 to `JsonValue[]`, 5 to `readonly JsonValue[]`, the intersections with `JsonValue` or `Readonly<Record<string, JsonValue>>`, and the aliases `JsonRecord`, `IJsonObject`, `MutableJsonRecord` and `PublicJsonSchema`. Implicit-`any` flows from `JSON.parse` that carry no cast are also outside it. The ones met in this reading are listed under Findings.

**Item 2: classification.**

| Casts | (T) | (I) | (A) | (P) | Total | Cast removed | Cast stays |
|---|---|---|---|---|---|---|---|
| C's 55 kept | 38 | 2 | 0 | 15 | 55 | 30 | 25 |
| Outside C's matcher | 1 | 0 | 0 | 0 | 1 | 1 | 0 |
| New | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

The 25 casts that stay are the 15 (P), the nine (T) held under the `shared/` and C2-pin stops, and the one (I) under `stop: channel`. A row reading "unreachable" adds an `isRecord` test whose refusal branch cannot be taken because an upstream guard already requires a record. A row reading "identical" has the same answer for every input. In the form column, RJ is `Readonly<Record<string, JsonValue>>`, and `unknown→` marks a cast through `as unknown`.

| # | Site at `6ec91829e` | Function | Expression → form | Class | Change or premise |
|---|---|---|---|---|---|
| 1 | `shared/public_function_contracts.ts:753` | `visit` | `value` → RJ | T | held: shared/ stop; the (T) discharge is `!isRecord(value)` in place of the `typeof`/`null` guard after the array branch (identical at runtime); the cast stays |
| 2 | `shared/public_function_contracts.ts:773` | `neutral` | `value` → RJ | T | held: shared/ stop; the same one-line discharge; the cast stays |
| 3 | `shared/public_function_contracts.ts:799` | `rewrite` | `value` → RJ | T | held: shared/ stop; the same one-line discharge; the cast stays |
| 4 | `gtl/declarations.ts:49` | `cloneJsonObject` | `JSON.parse(canonicalJson(value))` → RJ | I | `admitJson` at the parse; a refusal takes the existing TypeError `Rule.config must be one JSON object` |
| 5 | `gtl/graph_applications.ts:176` | `recursionTerminationDecision` | `current` → RJ | T | shallow guard retired into `isRecord`; the narrowed reference is read (identical) |
| 6 | `validator/raw_admission.ts:204` | `<anon>` | `JSON.parse(canonicalJson(json))` → JsonValue | P | the value is `json`, admitted at :184 by `admitIJsonValue(value, "$")`; :204 parses its canonical bytes, so the clone writes the same canonical bytes and :209 hashes admitted bytes |
| 7 | `public/binding/public_function_projections.ts:389` | `admittedInvocationBranch` | `exactObject({ kind: { const: "public_invo...` → RJ | T | `exactObject` returns the record it builds (module-local return type); cast removed |
| 8 | `product/semantic_job.ts:574` | `<anon>` | `declaration` → RJ | T | shallow guard retired into `isRecord` (identical) |
| 9 | `abg/fh_continuation_projection.ts:170` | `exactOpenedBasis` | `openedPayload.cCall` → RJ | T | the guarded reference `opened.payload.cCall` (narrowed at :161-165) is read; cast removed |
| 10 | `abg/fh_continuation_projection.ts:171` | `exactOpenedBasis` | `openedPayload.pendingResult` → RJ | T | the guarded reference `opened.payload.pendingResult` is read |
| 11 | `abg/fh_continuation_projection.ts:172` | `exactOpenedBasis` | `openedPayload.pendingJudgment` → RJ | T | the guarded reference `opened.payload.pendingJudgment` is read |
| 12 | `abg/fh_continuation_projection.ts:183` | `exactOpenedBasis` | `openedPayload.openedTraversalScope` → RJ | T | the guarded reference `opened.payload.openedTraversalScope` is read |
| 13 | `abg/effectful_invocation_truth.ts:209` | `projectEffectfulPublicInvocationTruthAtPrefix` | `operation.payload` → RJ | T | `isRecord(p)` joins the existing refusal; unreachable: the :205-207 filter admits only record payloads |
| 14 | `abg/continuation.ts:725` | `projectHeldInteractionCCallOutcomeAtPrefix` | `resultEvent.payload` → RJ | T | `isRecord(resultEvent.payload)` joins the guard at :654; unreachable: `exactPayload` (:622) already requires it |
| 15 | `abg/traversal_cursor.ts:491` | `projectCursorAncestry` | `event.payload` → RJ | T | `if (!isRecord(payload)) return null`; unreachable: origins are pushed only when `isRecord(event.payload)` |
| 16 | `abg/native_work_effect.ts:91` | `projectNativeWorkUnknownEffectTask` | `actor.payload` → RJ | T | `isRecord(ap)` joins the existing refusal; unreachable: `checkExactRecord(..., PAYLOAD_RECORD)` at :88 |
| 17 | `abg/project_read_ports.ts:1000` | `projectRunStatus` | `{ runId: targetRef, executionBasis: conte...` → unknown→JsonValue | P | typed projection of replayed truth; the read port admits it at :1560 (`admitIJsonValue`) before the digest at :1567 |
| 18 | `abg/project_read_ports.ts:1091` | `evidenceProjection` | `{ runId: context.replay.runId, evidenceRe...` → unknown→JsonValue | P | as :1000; the cast now reads `as unknown as Readonly<Record<string, JsonValue>>` so :1110 is typed |
| 19 | `abg/project_read_ports.ts:1110` | `projectRunEvidence` | `evidenceProjection(context, context.repla...` → RJ | T | `evidenceProjection` returns `Readonly<Record<string, JsonValue>>`; cast removed |
| 20 | `abg/project_read_ports.ts:1155` | `projectWorkspaceReplay` | `{ workspaceRef: targetRef, eventContractP...` → unknown→JsonValue | P | as :1000 |
| 21 | `abg/project_read_ports.ts:1170` | `projectRunReplay` | `{ ...context.semanticReplay, runtimeStatu...` → unknown→JsonValue | P | as :1000 |
| 22 | `abg/project_read_ports.ts:1393` | `gapRows` | `deepFreeze({ kind: "abg_admitted_gap", sc...` → unknown→JsonValue | P | as :1000 |
| 23 | `product/default_library_fulfillment.ts:160` | `governanceFulfillmentAssessmentJsonSchema` | `object({ obligations: array(object({ obli...` → RJ | P | constant schema built from literals and valibot `toJsonSchema` output (JSONSchema7 interface); no caller in code/src |
| 24 | `abg/artifact_truth.ts:335` | `prepare` | `{ ...selectedRows[0]!, kind: "product_ins...` → unknown→JsonValue | P | members are one row of the lock body carried in the stored event and string literals; `isProductInstallCandidateInResolvedLock` (:350) checks it before the digest at :363 |
| 25 | `abg/instruction_assembly.ts:444` | `registeredSelectionInstructionResultMatches` | `observations[0]!.payload` → RJ | T | `isRecord(observed)` joins the length refusal; unreachable: runtime-event admission refuses a non-record payload (abg/event_store.ts:2735) |
| 26 | `abg/instruction_assembly.ts:448` | `registeredSelectionInstructionResultMatches` | `closes[0]!.payload` → RJ | T | `isRecord` test before the member read; unreachable: runtime-event admission refuses a non-record payload (abg/event_store.ts:2735) |
| 27 | `abg/instruction_assembly.ts:1117` | `semanticInstructionResultMatches` | `rows[0]!.payload` → RJ | T | `isRecord(o)` joins the length refusal; unreachable: runtime-event admission refuses a non-record payload (abg/event_store.ts:2735) |
| 28 | `abg/instruction_assembly.ts:1130` | `semanticInstructionResultMatches` | `closes[0]!.payload` → RJ | T | `isRecord` test before the member read; unreachable: runtime-event admission refuses a non-record payload (abg/event_store.ts:2735) |
| 29 | `abg/instruction_assembly.ts:1139` | `semanticInstructionResultMatches` | `rows[0]!.payload` → RJ | T | `isRecord(observation)` joins the length refusal; unreachable: runtime-event admission refuses a non-record payload (abg/event_store.ts:2735) |
| 30 | `abg/instruction_assembly.ts:1162` | `semanticInstructionResultMatches` | `closes[0]!.payload` → RJ | T | `isRecord` test before the member read; unreachable: runtime-event admission refuses a non-record payload (abg/event_store.ts:2735) |
| 31 | `abg/actor_process.ts:1063` | `assessNativeResultArtifact` | `raw` → RJ | T | shallow guard retired into `isRecord(raw)`; `raw` is admitted at :1061 (`admitIJsonValue`) |
| 32 | `abg/actor_process.ts:1110` | `<anon>` | `observation` → RJ | T | shallow guard retired into `isRecord(observation)` (identical) |
| 33 | `product/worksite_command_execution.ts:166` | `<anon>` | `predicate.declaration` → RJ | T | held: stop (contract): any emit change to `product/worksite_command_execution.js` moves the C2 context pin (`gtl/worksite_command_execution.ts:37-39`, `:61`) and the inventory contract `contracts/worksite/command-execution-context.inventory.json`; the build refuses a stale pin (`scripts/generate-product-manifest.mjs:101`); the cast stays; the (T) discharge is shallow guard retired into `isRecord` (identical) |
| 34 | `product/worksite_command_execution.ts:170` | `<anon>` | `launch` → RJ | T | held: stop (contract): any emit change to `product/worksite_command_execution.js` moves the C2 context pin (`gtl/worksite_command_execution.ts:37-39`, `:61`) and the inventory contract `contracts/worksite/command-execution-context.inventory.json`; the build refuses a stale pin (`scripts/generate-product-manifest.mjs:101`); the cast stays; the (T) discharge is shallow guard retired into `isRecord` (identical) |
| 35 | `product/worksite_command_execution.ts:170` | `<anon>` | `request` → RJ | T | held: stop (contract): any emit change to `product/worksite_command_execution.js` moves the C2 context pin (`gtl/worksite_command_execution.ts:37-39`, `:61`) and the inventory contract `contracts/worksite/command-execution-context.inventory.json`; the build refuses a stale pin (`scripts/generate-product-manifest.mjs:101`); the cast stays; the (T) discharge is shallow guard retired into `isRecord` (identical) |
| 36 | `product/worksite_command_execution.ts:1129` | `<anon>` | `entry` → RJ | T | held: stop (contract): any emit change to `product/worksite_command_execution.js` moves the C2 context pin (`gtl/worksite_command_execution.ts:37-39`, `:61`) and the inventory contract `contracts/worksite/command-execution-context.inventory.json`; the build refuses a stale pin (`scripts/generate-product-manifest.mjs:101`); the cast stays; the (T) discharge is `isRecord(entry) ? entry.name : undefined`; unreachable: :1114 requires every entry to be a record |
| 37 | `product/worksite_command_execution.ts:1461` | `<anon>` | `row.declaration` → RJ | T | held: stop (contract): any emit change to `product/worksite_command_execution.js` moves the C2 context pin (`gtl/worksite_command_execution.ts:37-39`, `:61`) and the inventory contract `contracts/worksite/command-execution-context.inventory.json`; the build refuses a stale pin (`scripts/generate-product-manifest.mjs:101`); the cast stays; the (T) discharge is `isRecord(declaration)` first; unreachable: `validPredicateDeclaration` (:1083) via `constructPredicate` (:1069) |
| 38 | `product/worksite_command_execution.ts:1502` | `<anon>` | `rawEntry` → RJ | T | held: stop (contract): any emit change to `product/worksite_command_execution.js` moves the C2 context pin (`gtl/worksite_command_execution.ts:37-39`, `:61`) and the inventory contract `contracts/worksite/command-execution-context.inventory.json`; the build refuses a stale pin (`scripts/generate-product-manifest.mjs:101`); the cast stays; the (T) discharge is `isRecord(entry)` first; unreachable: :1114 via `constructPredicate` (:1069) |
| 39 | `product/builtin_semantics.ts:1053` | `admitInput` | `value` → unknown→RJ | P | reached only through `semantics.admitInput` at product/semantics.ts:514, after `admitJson` at :512; the guards narrow to owner interfaces |
| 40 | `hog/route_proposal.ts:737` | `selectedCCallOutcomeRoute` | `value` → RJ | T | shallow guard retired into `isRecord` (identical) |
| 41 | `hog/ccall_lifecycle.ts:613` | `<anon>` | `residue` → unknown→JsonValue | P | `unadmittedPhysicalCommit` builds the residue from literals, the call ref and owner outcomes it guards (implementation/worksite_file_replace.ts:146, :154, :166) |
| 42 | `hog/graph_execute.ts:664` | `<anon>` | `selected.value` → RJ | T | shallow guard retired into `isRecord(selected.value)` (identical) |
| 43 | `product/public_contract_publication.ts:549` | `resolveDefinition` | `selected` → RJ | T | shallow guard retired into `isRecord` (identical) |
| 44 | `abg/c_call.ts:1999` | `projectAdmittedActorTransport` | `timeoutRow.value.payload` → RJ | T | `filter` becomes `flatMap` carrying the `isRecord`-narrowed payload; count at :2040 unchanged |
| 45 | `abg/c_call.ts:2019` | `<anon>` | `event.payload` → RJ | T | `flatMap` carries the narrowed payload into the sum (identical) |
| 46 | `abg/c_call.ts:2317` | `undispatchedResultRelation` | `p.failureValue` → RJ | T | `if (!isRecord(p.failureValue)) return false` after `before`; identical: the callee returns false for a non-record (c_call.ts:6324) |
| 47 | `abg/c_call.ts:3527` | `projectCCallRuntimeFailureSignal` | `sourceEvents[0]!.payload` → RJ | T | `if (!isRecord(sourcePayload)) return null`; unreachable: the :3505 filter requires it |
| 48 | `abg/c_call.ts:4230` | `projectWorkflowCCallInputDigestAtPrefix` | `event.payload` → RJ | T | `evidence[0]` bound once, so the existing `isRecord` test (head `:4229`) narrows it; identical |
| 49 | `abg/event_contract_profiles.ts:99` | `undispatchedDiagnosticMatches` | `value` → RJ | T | shallow guard retired into `isRecord(value)` (identical) |
| 50 | `abg/event_store.ts:1468` | `payloadInvocationRef` | `event.payload` → RJ | T | shallow guard retired into `isRecord` (identical) |
| 51 | `public/installed_public_definition_call.ts:217` | `constructInstalledPublicDefinitionCall` | `invocationAuthorityBody` → unknown→JsonValue | P | typed body of string members and installed catalog coordinates; retyping the coordinate interfaces as aliases is outside the Grant |
| 52 | `public/installed_public_definition_call.ts:256` | `constructInstalledPublicDefinitionCall` | `invocationBody` → unknown→JsonValue | P | typed body; `request: TRequest extends Readonly<Record<string, JsonValue>>`; as :217 |
| 53 | `implementation/consensus.ts:549` | `projectSubmitterRoleResult` | `resultCandidate` → unknown→RJ | P | typed owner construction; the C-call admission admits it by `validateValue` (abg/c_call.ts:6901, leaf product/semantics.ts:620); the digests at c_call.ts:6889 and :1691 precede that admission |
| 54 | `implementation/native_workspace_work.ts:64` | `complete` | `value` → unknown→RJ | P | as consensus.ts:549 |
| 55 | `implementation/worksite_command_execution.ts:791` | `complete` | `observation` → unknown→RJ | P | as consensus.ts:549 |
| 56 | `implementation/worksite_command_helper.ts:1329` | `predicateObservation` | `JSON.parse(JSON.stringify(result))` → JsonValue | I | stop: channel; the cast stays; admission at the site would take the catch channel (`observedValue = null`) instead of the parent's `helper_artifact_contract_failure`; the parent admits at product/worksite_command_execution.ts:1786 |

**Edits beyond the cast expression** (lines after the commit). The Executive rules on each. All are in the 18 source files of the commit.
1. Shallow guards retired into `isRecord`: `typeof v === "object" && v !== null && !Array.isArray(v)` and its negation are the body of `isRecord` (`shared/admit/record.ts:9`), so runtime behavior is identical. Sites: `abg/actor_process.ts:1060`, `:1110`; `abg/event_contract_profiles.ts:99`; `abg/event_store.ts:1465`; `gtl/graph_applications.ts:169`; `hog/graph_execute.ts:652`; `hog/route_proposal.ts:734`; `product/public_contract_publication.ts:544`; `product/semantic_job.ts:574`.
2. `isRecord` tests added where no guard was retired. `abg/c_call.ts:2310` gives the same answer, because the callee returns `false` at `:6324` (head line). The rest are unreachable: `abg/c_call.ts:3526`; `abg/continuation.ts:656`; `abg/effectful_invocation_truth.ts:219`; `abg/instruction_assembly.ts:444`, `:448`, `:1118`, `:1131`, `:1141`, `:1163`; `abg/native_work_effect.ts:92`; `abg/traversal_cursor.ts:492`. Each row of the table names the guard that makes it unreachable. `abg/c_call.ts:4226-4228` binds `evidence[0]` once, so the existing `isRecord` test narrows the payload that is read.
3. `filter` became `flatMap` to carry the narrowed payload: `abg/c_call.ts:1994` (the count read at head `:2040` is unchanged) and `:2016`.
4. Two module-local return types now name the record they build: `exactObject` (`public/binding/public_function_projections.ts:116`) and `evidenceProjection` (`abg/project_read_ports.ts:1081`). The (P) cast at `abg/project_read_ports.ts:1099` changes its target from `JsonValue` to `Readonly<Record<string, JsonValue>>`, so `:1110` needs no cast. Neither function is exported, and no `.d.ts` changed.
5. `abg/fh_continuation_projection.ts:170-172`, `:183` read the guarded `opened.payload.*` members (narrowed at `:161-165`) instead of the unnarrowed alias `openedPayload`.
6. Four import lines: `isRecord` in `abg/event_contract_profiles.ts:5`, `gtl/graph_applications.ts:3` and `product/public_contract_publication.ts:28`; `admitJson` and `isRecord` in `gtl/declarations.ts:6`.
7. The one (I) admission call, `gtl/declarations.ts:50-54`. It refuses on the existing `TypeError("Rule.config must be one JSON object")` channel (`:48` at head).


**Item 3: gaps.** First row, `validator/raw_admission.ts`. The activation's `:184`, `:204` and `:209` are head lines; at `0c362da15` they are `:185`, `:205` and `:210` (census file lines 102, 103 and 104). Premise from `:184`: `json = admitIJsonValue(value, "$")`, which is `admitJson` lifted to a throw (`shared/i_json.ts:63-68`). It refuses functions, accessors, non-plain prototypes, non-finite and unsafe integral numbers and lone surrogates, normalizes `-0` and returns a frozen fresh copy, and the refusal takes the existing `non_canonical_value` channel. `:204` parses `canonicalJson(json)`, the canonical bytes of that admitted value. Over the I-JSON domain, parsing canonical bytes and writing them again gives the same bytes: strings carry no lone surrogate, numbers are finite and safe, and the canonical writer is deterministic. So the hash at `:209`, `sha256Canonical(admittedJson)`, is over admitted bytes. `assertStructuralValue` at `:207` re-checks the parsed value first. The four GTL kinds take `canonicalizeAuthoredGtlCarrier` (`:199`), not the cast. Class (P); the cast stays.

| Cast(s) at `6ec91829e` | Gap path | Class | Resolved by hand at |
|---|---|---|---|
| `validator/raw_admission.ts:204` | IIFE return into `admittedJson` | P | `:209` `sha256Canonical(admittedJson)`, after `assertStructuralValue` `:207`; premise `:184` |
| `abg/actor_process.ts:1063` | method receiver (`owner.port.verifyProbabilisticResultContractPreimage`) | T | `implementation/leaf_invocation_port.ts:1365` (`validateContractValueByRef`), `:1391` (`sha256Canonical`); `raw` admitted at `actor_process.ts:1061` |
| `implementation/consensus.ts:549`, `implementation/native_workspace_work.ts:64`, `implementation/worksite_command_execution.ts:791` | method receiver (prepared `complete()`), then `admitResult` | P | `abg/c_call.ts:6889` (`sha256Canonical`), `:6901` (`validateValue`), `:1691` (rejection digest) |
| `product/builtin_semantics.ts:1053` | method receiver (`semantics.admitInput`) | P | `product/semantics.ts:512` (`admitJson`), `:514` |
| `public/installed_public_definition_call.ts:217`, `:256` | method receiver (`product.sha256Canonical`) | P | at the site |
| `hog/graph_execute.ts:664` | callee outside `code/src` (`Effect.succeed`) | T | `hog/graph_execute.ts:273` (`frame.input`) |
| `implementation/worksite_command_helper.ts:1329` | callee outside `code/src` (`Array.prototype.push`), then the helper artifact | I (`stop: channel`) | helper `canonicalJson` `:1562`; parent `implementation/worksite_command_execution.ts:730`, `:734`; admission `product/worksite_command_execution.ts:1786` |
| `abg/traversal_cursor.ts:491` | member `successorCursor` through `as unknown as TraversalCursorCandidate`, then `Array.prototype.push` (callee outside `code/src`) | T | `traversal_cursor.ts:546` (`next.cursorDigest` against the event's admission digest) before the push at `:547`; the pushed value is a member of an admitted event payload |
| `abg/instruction_assembly.ts:444`, `:1117`, `:1139` | members through `JSON.parse` (callee outside `code/src`) | T | `instruction_assembly.ts:458`, `:1121` (`canonicalEquals`), `:1146`, `:1151` |
| `shared/public_function_contracts.ts:753`, `:773`, `:799` | `Map` (`assigned`), sort comparator, `canonicalJson(neutral(...))` | T (held) | not resolved: held under the `shared/` stop |
| `product/worksite_command_execution.ts:1129` | `Set` | T (held, C2 pin) | the `Set` size only; no canonical sink |

Gap paths outside the three named classes, also resolved by reading:

| Cast(s) | Path | Class | Resolved at |
|---|---|---|---|
| `abg/c_call.ts:2317` | overloaded callee `undispatchedOwnerEvidenceMatches` (`:6298`, `:6305`, `:6311`) | T | `c_call.ts:6324` (`isRecord`), `:6327` (`sha256Canonical`) |
| `abg/fh_continuation_projection.ts:170-172`, `abg/continuation.ts:725` | overloads (`projectPendingInteractionCarrier` `:4911-4924`, `projectAdmittedCCallStateAtPrefix` `:4854-4867`) and `as unknown as` casts outside the forms | T | `c_call.ts:1527` (sinks `:1582`, `:1594`, `:1597`) |
| `abg/artifact_truth.ts:335` | `let` reassignment, then `as unknown as ProductInstallCandidate` | P | `artifact_truth.ts:350`, `:363` |
| `abg/project_read_ports.ts:1000`, `:1091`, `:1110`, `:1155`, `:1170`, `:1393` | return of the closure `projection()` | P (`:1110` T) | `project_read_ports.ts:1529`, `:1560` (`admitIJsonValue`), `:1567` (`sha256Canonical`) |
| `hog/ccall_lifecycle.ts:613` | `as unknown as` inside `completePublicOutcome` (`abg/c_call_outcome.ts:1886`) | P | `hog/recursion_lifecycle.ts:768` |
| `product/default_library_fulfillment.ts:160` | export with no caller in `code/src` (`test_env/tests/t287-native-workspace-work.test.mjs` reads it) | P | no in-tree sink |

The other 24 casts reach none of these paths. Each was read forward from the cast to its last use: member reads compared by `===`, `typeof`, `Number` or `Object.hasOwn`, except `gtl/declarations.ts:49` and `public/binding/public_function_projections.ts:389`, whose values return through typed code into the rule declaration and the published schema body.

**Item 4: proof.** One owner boundary changed under (I): `gtl/declarations.ts` `cloneJsonObject`, reached through `ruleDeclaration` (`:81` at head; also `gtl/consensus.ts:5245`, `:5254`). The case is `test_env/tests/m5-c-algebra-validation.test.mjs:1488-1493`. It is the only lane that calls `gtl.ruleDeclaration`. It imports `build/code/src/gtl/index.js` through `test_env/support/language-structural-gtl.mjs`, so no lane names `gtl/declarations`, and the lane is in the set by that call. A well-formed config is accepted with the same value, and an unsafe integer (`2 ** 60`) and a lone high surrogate (`"\uD800"`) are each refused with `TypeError("Rule.config must be one JSON object")`. At head the build accepts both: `{"limit":1152921504606847000}` and `{"mode":"\ud800"}` (node, against the head `build/`). The activation names a function member or a cycle in the parsed value as the case, but `JSON.parse` output can hold neither. For a caller's config, the canonical writer runs before the parse: it writes a function member as `{}` and overflows the stack on a cycle, at head and after alike. The case therefore discriminates what the admission refuses at the parse, the I-JSON domain. The (T) and (P) owners are covered by the lanes below.

**Item 5: records.** The O-TYPE row (`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:613`) gains one sentence: the three forms, resolved, in `code/src` at the TD-14 commit; the four counts and the one outside C's matcher; the (T)/(I)/(A)/(P) totals and the 25 casts that stay; and the three gap classes traced by hand. Nothing else in the design changed. O-SCHEMA (`:617`) is not a stop: the one (I) admission is in GTL construction (`gtl/declarations.ts:50`), not at a Product boundary. The Executive should still note one sentence of O-SCHEMA: "The I-JSON domain applies to Product input, response and contract values at that boundary only". After this package the same domain also applies to `Rule.config` at its parse, through `admitJson`. That is not stricter than the boundary's policy, but it is an ingress outside "that boundary".


**Lanes.** `npm run build` exits 0 once the pinned module is reverted (Stops, item 2). It regenerated these tracked outputs, all committed: `build/code/src/abg/actor_process.js`, `build/code/src/abg/event_store.js`, `build/code/src/abg/instruction_assembly.js`, `build/code/src/product/semantic_job.js`, `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json`. The regenerated JSON differs from head only in `productContentDigest` and the digests and refs derived from it: 68 fields in the manifest; 310 in the graph (`productContentDigest`, `capabilityDefinitionDigest`, `capabilityDefinitionRef`, `graphDigest`). No `contractDigest` moved, no other contract file changed, and none of the 17 tracked `.d.ts` files changed. `npx tsc --noEmit -p tsconfig.json`: clean. `npm run lint:imports`: 28 modules under `code/src/shared/` import only `code/src/shared/` and packages. `npm run lint:lifecycle`: 284 modules, 10 allow-listed sites, no offender.

The lane set has 102 lanes:
- every lane in `test_env/tests` that names a touched module path: the 18 committed source files, plus `product/worksite_command_execution`, kept in the set after its revert;
- the four named lanes;
- `m5-c-algebra-validation`.

Every lane ran twice: at head (`6ec91829e`, rebuilt, before any edit) and after. Totals are tests/pass/fail/skipped: head 595/393/120/80, after 596/394/120/80, each with 2 cancelled. The one difference is the new case. 52 lanes are red at head and after, with the same 122 failing-test identities (file:line and test name) and the same first error lines. In `t287-worksite-construction` the assertion message differs between runs only in run timings, an inode and the digests over them. No new red identity. Attribution:
- 14 lanes: the H log;
- 5 lanes: TD-07's five;
- 9 lanes: TD-13's thirteen (the other four are not in this lane set);
- 24 lanes: red at head before any edit and in none of the three sources. Most fail on an absent fixture, territory or environment variable.

| Lane | Head `6ec91829e` | After | Reds (identical at head and after) |
|---|---|---|---|
| `d2-acknowledgment` | 4/0/4/0 | 4/0/4/0 | `:17`, `:34`, `:51`, `:81`: red at head before any edit, in none of the three sources; `assert.ok(configuration)` in `test_env/support/d2-workflow-step-harness.mjs:20`: no workflow configuration in the environment |
| `d2-binding-transition` | 10/0/10/0 | 10/0/10/0 | `:6`, `:148`, `:172`, `:191`, `:208`, `:232`, `:247`, `:269`, `:289`, `:303`: red at head before any edit, in none of the three sources; `h.owner.projectWorksiteRevisionBindingCover is not a function` |
| `forward-command-contracts` | 10/10/0/0 | 10/10/0/0 |  |
| `generic-input-retention` | 4/2/2/0 | 4/2/2/0 | `:82`, `:132`: TD-13 return's thirteen |
| `m5-c-algebra-validation` | 21/18/0/3 | 22/19/0/3 | the TD-14 case `:1488` joins and passes |
| `m5-consensus-module` | 1/0/1/0 | 1/0/1/0 | file-level: `step-8-run-postclose-h.log:255` |
| `m5-event-calculus-runtime` | 19/13/5/1 | 19/13/5/1 | `:372`, `:1316`, `:1471`, `:1548`, `:1590`: `step-8-run-postclose-h.log:786` |
| `m5-event-store-reopen` | 18/18/0/0 | 18/18/0/0 |  |
| `m5-retry-lifecycle-authority` | 9/4/5/0 | 9/4/5/0 | `:21`, `:238`, `:281`, `:323`, `:533`: `step-8-run-postclose-h.log:919` |
| `m5-s03-authority` | 5/1/4/0 | 5/1/4/0 | `:96`, `:218`, `:285`, `:415`: `step-8-run-postclose-h.log:1007` |
| `m5-terminal-quiescence-owner` | 7/7/0/0 | 7/7/0/0 |  |
| `m5-worker-transport` | 21/21/0/0 | 21/21/0/0 |  |
| `r10-projection-contracts` | 1/0/1/0 | 1/0/1/0 | file-level: `step-8-run-postclose-h.log:417` |
| `r3-workspace-binding` | 1/0/1/0 | 1/0/1/0 | `:85`: TD-13 return's thirteen |
| `r9-causal-result-closure` | 2/0/2/0 | 2/0/2/0 | `:53`, `:721`: red at head before any edit, in none of the three sources; `abg.openCall is not a function` |
| `retained-route-cursor-transition` | 1/0/1/0 | 1/0/1/0 | `:26`: TD-07 return's five |
| `runtime-scope-regressions` | 2/2/0/0 | 2/2/0/0 |  |
| `steel-basic-cli-c2` | 6/0/0/6 | 6/0/0/6 |  |
| `t287-authenticated-owner-values` | 3/1/1/1 | 3/1/1/1 | `:39`: TD-13 return's thirteen |
| `t287-c2-core-environment` | 3/3/0/0 | 3/3/0/0 |  |
| `t287-c2-owner-coordinate-reuse` | 6/0/6/0 | 6/0/6/0 | `:120`, `:195`, `:212`, `:227`, `:238`, `:266`: `step-8-run-postclose-h.log:1088` |
| `t287-calculus-fold` | 12/12/0/0 | 12/12/0/0 |  |
| `t287-calculus-state-transfer` | 8/6/0/0, 2 cancelled | 8/6/0/0, 2 cancelled | timed out after 300000 ms; `:64`, `:70`: `step-8-run-postclose-h.log:1179` |
| `t287-cold-record-decoder` | 3/1/1/1 | 3/1/1/1 | `:77`: red at head before any edit, in none of the three sources; "retain existing replacement-character admission, without UTF-8 hardening" |
| `t287-common-computational-library` | 9/9/0/0 | 9/9/0/0 |  |
| `t287-consensus-ref-shape` | 2/2/0/0 | 2/2/0/0 |  |
| `t287-continuation-causation` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-cross-cut-public-read` | 5/4/1/0 | 5/4/1/0 | `:105`: `step-8-run-postclose-h.log:1191` |
| `t287-d1-requirement-handoff` | 5/2/0/3 | 5/2/0/3 |  |
| `t287-default-library-fulfillment` | 7/7/0/0 | 7/7/0/0 |  |
| `t287-default-library` | 20/17/0/3 | 20/17/0/3 |  |
| `t287-deferred-application-restoration` | 2/0/2/0 | 2/0/2/0 | `:85`, `:116`: red at head before any edit, in none of the three sources; "select the frozen S02 continuation-03 evidence carrier" |
| `t287-event-body-encoding` | 14/14/0/0 | 14/14/0/0 |  |
| `t287-event-calculus-owner-continuation` | 1/0/1/0 | 1/0/1/0 | file-level: `step-8-run-postclose-h.log:514` |
| `t287-fh-hold-open` | 1/0/1/0 | 1/0/1/0 | file-level: TD-07 return's five |
| `t287-generic-job-lifecycle` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-generic-job-revision` | 4/1/0/3 | 4/1/0/3 |  |
| `t287-generic-job-worksite` | 9/9/0/0 | 9/9/0/0 |  |
| `t287-governance-covered-source-use` | 8/2/3/3 | 8/2/3/3 | `:351`, `:386`, `:430`: TD-13 return's thirteen |
| `t287-held-prefix` | 6/0/0/6 | 6/0/0/6 |  |
| `t287-historical-source-resource` | 2/1/1/0 | 2/1/1/0 | `:64`: red at head before any edit, in none of the three sources; "exact existing basis body is borrowed" |
| `t287-interrupted-event-resource-recovery` | 8/6/2/0 | 8/6/2/0 | `:74`, `:136`: red at head before any edit, in none of the three sources; strict-equal assertion |
| `t287-lifecycle-failure-carrier` | 5/5/0/0 | 5/5/0/0 |  |
| `t287-management-context` | 14/12/0/2 | 14/12/0/2 |  |
| `t287-management-stream-drain` | 8/4/0/4 | 8/4/0/4 |  |
| `t287-native-assessment-evidence` | 4/1/3/0 | 4/1/3/0 | `:551`, `:559`, `:585`: red at head before any edit, in none of the three sources; "profile schedule requires the original gap-free stamped history" |
| `t287-native-c2-instruction-assembly` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-native-runtime-gate` | 7/6/0/1 | 7/6/0/1 |  |
| `t287-native-selection-profile-scope` | 4/4/0/0 | 4/4/0/0 |  |
| `t287-native-semantic-job` | 9/8/1/0 | 9/8/1/0 | `:224`: red at head before any edit, in none of the three sources; "native failure reuses the original derivation" |
| `t287-native-work-currentness-consumers` | 2/2/0/0 | 2/2/0/0 |  |
| `t287-native-work-reacquisition` | 9/6/0/3 | 9/6/0/3 |  |
| `t287-native-work-unknown-effect` | 10/10/0/0 | 10/10/0/0 |  |
| `t287-native-worksite-execution` | 6/3/0/3 | 6/3/0/3 |  |
| `t287-native-workspace-work` | 38/37/0/1 | 38/37/0/1 |  |
| `t287-observed-worksite-command` | 8/7/1/0 | 8/7/1/0 | `:43`: `step-8-run-postclose-h.log:129` |
| `t287-ordered-reconstruction` | 7/0/4/3 | 7/0/4/3 | `:22`, `:74`, `:103`, `:158`: `step-8-run-postclose-h.log:1371` |
| `t287-owned-native-proof` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-owned-process-lifetime` | 18/18/0/0 | 18/18/0/0 |  |
| `t287-pfc-f08a-product-verification-boundary` | 1/0/1/0 | 1/0/1/0 | `:393`: `step-8-run-postclose-h.log:1504` |
| `t287-post-binding-worksite-write` | 2/1/1/0 | 2/1/1/0 | `:244`: TD-07 return's five |
| `t287-predecessor-context` | 1/0/1/0 | 1/0/1/0 | file-level: red at head before any edit, in none of the three sources; file-level "requires exact preserved original1B evidence" |
| `t287-public-terminal-projection` | 4/0/4/0 | 4/0/4/0 | `:34`, `:50`, `:68`, `:87`: red at head before any edit, in none of the three sources; "select the exact frozen S02 episode fixture" |
| `t287-qual056-material` | 7/7/0/0 | 7/7/0/0 |  |
| `t287-qualification-contraction` | 4/4/0/0 | 4/4/0/0 |  |
| `t287-qualification-fp-proof-delivery` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-qualification-parent-alias` | 1/0/1/0 | 1/0/1/0 | `:18`: red at head before any edit, in none of the three sources; "explicit frozen fixture and isolated emitted-owner binding" |
| `t287-qualification-producer-acquisition-reuse` | 1/0/1/0 | 1/0/1/0 | file-level: TD-13 return's thirteen |
| `t287-reconstruction-conservation` | 2/0/0/2 | 2/0/0/2 |  |
| `t287-recursive-registered-selection` | 4/2/1/1 | 4/2/1/1 | `:129`: TD-13 return's thirteen |
| `t287-release-acceptance` | 1/0/1/0 | 1/0/1/0 | file-level: TD-13 return's thirteen |
| `t287-release-publication` | 1/0/1/0 | 1/0/1/0 | file-level: TD-13 return's thirteen |
| `t287-result-evidence-lineage-type-contract` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-retry-run-prefix` | 3/0/3/0 | 3/0/3/0 | `:59`, `:92`, `:107`: TD-13 return's thirteen |
| `t287-route-reconstruction` | 9/7/0/2 | 9/7/0/2 |  |
| `t287-runtime-activity-quiescence` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-runtime-failure-diagnostic` | 14/14/0/0 | 14/14/0/0 |  |
| `t287-stdo-environment-citation` | 2/0/1/1 | 2/0/1/1 | `:16`: red at head before any edit, in none of the three sources; `assert.ok(process.env.ABI5_ENV_PROOF_ROOT)` (unset) |
| `t287-stdo-run-environment` | 2/0/1/1 | 2/0/1/1 | `:87`: red at head before any edit, in none of the three sources; `assert.ok(process.env.ABI5_ENV_PROOF_ROOT)` (unset) |
| `t287-undispatched-diagnostic` | 7/5/2/0 | 7/5/2/0 | `:93`, `:222`: TD-07 return's five |
| `t287-value-equality` | 4/4/0/0 | 4/4/0/0 |  |
| `t287-w2-05-generator-package-reproducibility` | 2/1/1/0 | 2/1/1/0 | `:314`: `step-8-run-postclose-h.log:3146` |
| `t287-w2-05-static-binding-algebra` | 5/3/0/2 | 5/3/0/2 |  |
| `t287-worksite-command-execution` | 10/10/0/0 | 10/10/0/0 |  |
| `t287-worksite-construction` | 3/0/3/0 | 3/0/3/0 | `:217`, `:361`, `:688`: red at head before any edit, in none of the three sources; strict-equal on a `worksite_construction_failure` completion (only run timings and digests differ between runs) |
| `t288-blocked-retry-entry` | 1/0/1/0 | 1/0/1/0 | `:8`: red at head before any edit, in none of the three sources; `assert.ok(roots[0])`: no root fixture |
| `t288-initial-cursor-entry` | 1/0/1/0 | 1/0/1/0 | `:8`: red at head before any edit, in none of the three sources; `ERR_INVALID_ARG_TYPE` path `undefined` |
| `t288-instruction-assembly-owner` | 11/4/0/7 | 11/4/0/7 |  |
| `t288-logical-prefix-digest` | 2/0/2/0 | 2/0/2/0 | `:16`, `:35`: red at head before any edit, in none of the three sources; `ERR_INVALID_ARG_TYPE` path `undefined` |
| `t288-prefix-structure` | 1/0/1/0 | 1/0/1/0 | file-level: red at head before any edit, in none of the three sources; file-level `ERR_INVALID_ARG_TYPE` path `undefined` |
| `t288-scoped-retry-guard` | 1/0/1/0 | 1/0/1/0 | `:12`: red at head before any edit, in none of the three sources; `SyntaxError: Unexpected token 'export'` |
| `w2-steel-serial-branch-installed` | 2/0/0/2 | 2/0/0/2 |  |
| `w2-steel-single-start-closure` | 8/0/0/8 | 8/0/0/8 |  |
| `w2-steel-single-start-installed` | 1/0/0/1 | 1/0/0/1 |  |
| `witness-reprice-definition-binding` | 15/0/15/0 | 15/0/15/0 | `:27`, `:36`, `:67`, `:77`, `:94`, `:102`, `:112`, `:118`, `:124`, `:129`, `:147`, `:162`, `:169`, `:205`, `:226`: red at head before any edit, in none of the three sources; `assert.ok(territory)` in `test_env/support/witness-reprice-mechanics.mjs:72`: no evidence territory |
| `witness-run-stopped-definition-binding` | 7/0/7/0 | 7/0/7/0 | `:31`, `:65`, `:77`, `:89`, `:96`, `:102`, `:117`: TD-07 return's five |
| `r10-child-proof` | 1/0/1/0 | 1/0/1/0 | file-level: red at head before any edit, in none of the three sources; file-level `ENOENT` on `20260911_D2_BOUNDED_REPAIR/installed-continuation-09/…` |
| `t287-conformance-owner-reuse` | 1/0/1/0 | 1/0/1/0 | file-level: `step-8-run-postclose-h.log:486` |
| `t287-installed-product-coordinate` | 11/11/0/0 | 11/11/0/0 |  |
| `t287-native-owner-reuse` | 3/0/0/3 | 3/0/0/3 |  |
| `t287-st1-installed-cross-owner-hello` | 2/0/2/0 | 2/0/2/0 | `:116`, `:737`: red at head before any edit, in none of the three sources; "inherited eventResource" |
| `t288-composition-conservation` | 1/0/1/0 | 1/0/1/0 | file-level: red at head before any edit, in none of the three sources; file-level "exact predecessor and immutable native history required" |

**Stops.** Three, each on its sites only. The casts stay and the census rows say so.
1. `shared/` (3 casts, `shared/public_function_contracts.ts:753`, `:773`, `:799`). Class (T): after the array branch, `!isRecord(value)` in place of `typeof value !== "object" || value === null` narrows `value` to the record member, and runtime behavior is identical. Blocking rule: "any change to a shared atom (`shared/`)". The edit itself is the counterexample.
2. The C2 context pin (6 casts, `product/worksite_command_execution.ts:166`, `:170` twice, `:1129`, `:1461`, `:1502`). Class (T); each row of the table carries its discharge. Counterexample: with the six discharges applied, `npm run build` exits 1 with `Error: C2 declared context member differs from its packaged Product source: build/code/src/product/worksite_command_execution.js` (`scripts/generate-product-manifest.mjs:101`). The pin is the byte count and digest of the built module (`gtl/worksite_command_execution.ts:37-39`) and its renderer span (`:61`). The build checks the pin and does not regenerate it. Refreshing the pin changes `contracts/worksite/command-execution-context.inventory.json`, whose member `digest` is that same digest. Blocking rule: "any change to … a contract". The file was reverted to head, and the build then exits 0.
3. `implementation/worksite_command_helper.ts:1329`, `stop: channel`. Class (I): `JSON.parse(JSON.stringify(result))` is a parse whose result is not admitted at the parse. Counterexample: a module export returning `2 ** 60`. At head the helper writes it into the artifact, the parent's `isPredicateObservation` refuses it at `product/worksite_command_execution.ts:1786` (`admitIJsonValue`), and the completion fails with `helper_artifact_contract_failure` (`implementation/worksite_command_execution.ts:734-735`). With an admission at the site, the refusal would be caught by the site's own `catch` (`:1330-1331`, `observedValue = null`), and the predicate would then be judged on `null` in a valid artifact. That is a different failure class, so the site has no refusal channel that keeps the contract. The ingress admission already exists at the parent, at `:1786`.

**Findings.**
- Lines at head `6ec91829e`. These implicit-`any` `JSON.parse` flows reach JSON consumers without a cast, so they are outside the universe: `abg/runtime_failure.ts:103` (read by `abg/event_contract_profiles.ts:98`), `abg/instruction_assembly.ts:458`, `:1121` (`canonicalEquals`), `:1146` (`const raw: JsonValue`), and `abg/c_call.ts:6927` (`const parsedValue: JsonValue`, over a value already validated at `:6901`). None was decided here.
- `abg/c_call.ts:6889` computes `sha256Canonical(candidate)` before `validateValue` admits the candidate at `:6901`. The rejection digest at `:1691` hashes a refused candidate. Both are over the implementation's typed construction, which is the (P) premise of the three result-candidate casts.
- `gtl/declarations.ts` at head and after: a function member in a JS caller's `Rule.config` is written as `{}` by `canonicalJson` before the parse and is not refused. The TypeScript parameter type excludes it.

## TD-14 disposition (Executive, 2026-10-24)

Accepted at `8387f70b3`. Executive check on that head: `tsc --noEmit` clean; both lints; `npm run build` rc 0 (the C2 pin check passes at head); `m5-c-algebra-validation` 22/19/0/3; `t287-worksite-command-execution` 10/10; `forward-command-contracts` 10/10; `t287-native-c2-instruction-assembly` 1/1; `t287-native-workspace-work` 38/37/0/1; `t287-default-library-fulfillment` 7/7; `m5-event-store-reopen` 18/18; `t287-owned-process-lifetime` 18/18 (`exec_check_TD14.log`).

The Return meets the contract. The universe is stated in the O-TYPE row and joined row by row in `td-14-census.tsv` (2,952 rows: repair C's 2,951 plus the one cast outside C's textual matcher, `abg/effectful_invocation_truth.ts:209`): 2,607 decided and unchanged, 289 decided with the site changed, 55 kept, none new; the 56 take (T) 39, (I) 2, (A) 0, (P) 15; 31 casts removed, 25 stay. Every cast whose value reaches a method receiver, a callee outside `code/src`, a `Map` or a `Set` is traced by hand to its sink or last use. The new case in `m5-c-algebra-validation.test.mjs:1488-1493` shows an unsafe integer and a lone surrogate refused at `Rule.config`'s parse where the head build accepted both. 102 lanes run at head and after with the same red identities; the 24 lanes red in none of the three named sources are attributed to the head run, as TD-13's were.

Stops ruled.

1. `shared/public_function_contracts.ts:753`, `:773`, `:799` (three (T) casts): ruled in. After the `Array.isArray` branch has returned, `!isRecord(value)` in place of `typeof value !== "object" || value === null` adds only the array exclusion already taken, so runtime behavior is identical; it is a use of the shared `isRecord` atom inside a shared module and changes no atom's contract. The stop rule's purpose (no change to a shared atom's contract) is not touched. Carried by TD-15 + TD-16, whose Grant includes `shared/`.
2. The C2 context pin, six (T) casts in `product/worksite_command_execution.ts:166`, `:170` twice, `:1129`, `:1461`, `:1502`: ruled in. The pin (`contracts/worksite/command-execution-context.inventory.json`; `gtl/worksite_command_execution.ts:37-39`, `:61`) is the byte count and digest of the built Product module. Refreshing it after a realization change to that source is the mechanical consequence that repairs E, F and G already took in Phase A; it changes no member of the Product contract. Carried by TD-15 + TD-16: that file imports the throwing lift (`shared/i_json.ts:63`), so TD-16's per-caller migration touches it, and the six discharges and the pin refresh go in the same Grant.
3. `implementation/worksite_command_helper.ts:1329`, `stop: channel`: the keep is correct. The admission of the helper's observed value is the parent's, at `product/worksite_command_execution.ts:1786` (`admitIJsonValue`), whose refusal is `helper_artifact_contract_failure`; an admission at the site would be swallowed by the site's own `catch` (`:1330-1331`) and change the failure class. The cast stays, recorded (I) with that sink in the census. No further action.

Ruled from the Return's flag. `Rule.config` admitted at its parse (`gtl/declarations.ts:50`) refuses the two value classes JSON cannot carry faithfully, an unsafe integer (which `canonicalJson` then `JSON.parse` had already rounded silently at head) and a lone surrogate. That is a defect fix at a declaration ingress, not a Product contract change: no declaration that round-trips was accepted before and refused now. The design's O-SCHEMA sentence stating the I-JSON domain is extended by the Executive in this bookkeeping commit to name the rule-config parse. Reversal: revert `cloneJsonObject` to the typed parse and remove the clause.

Findings noted, no action: the five implicit-`any` `JSON.parse` flows are outside the stated universe (no cast) and each parses bytes this library wrote or a value already validated (`c_call.ts:6927` after `:6901`); `c_call.ts:6889` hashing the candidate before `validateValue` is the rejection digest's purpose (it names what was refused); a function member in a JS caller's `Rule.config` is the compile-negative case the O-TYPE row already states. Errata 1 to 3 stand as the Return records them; the census keys are the Worker's.

Register: TD-14 closed at `8387f70b3` for 47 of the 56; the nine (T) carried by TD-15 + TD-16 are named in the completion record. The O-TYPE sentence's "nine (T) held" clause is corrected when that package discharges them.

## TD-04 + TD-05 activation (Executive, 2026-10-24; one proof family reproducible from a clean checkout, two obsolete-import lanes retired)

Debt (register TD-04, TD-05): `r10-projection-contracts.test.mjs:22` reads one S01 store through the absolute machine path `/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/attempt-01` (a 167 MB, 87-file directory ignored by that directory's own `.gitignore`), and `:24` fails at head with `DurablePrefixReadError file_identity_mismatch` because the coordinate in `call-11.jsonl` binds the original file's device and inode (`storeIdentity`, `eventLogRef` absolute, `prefixLength` 2,797,774, `prefixDigest sha256:d2a677a2…`). `r10-child-proof.test.mjs:15` and `:118` resolve the same store through the displaced relative path `../../../../fixture-program-selection-01/attempt-01`, which does not exist; the lane is red at head (TD-14's head run). `m5-consensus-module.test.mjs:26` imports the retired `ROOT_PUBLIC_OPERATION_IDS` and fails to load (H log `:245`); `t287-wave2-owner-contract-source-set.test.mjs:47` imports the removed `ReleaseSnapshotPort`. `r10-private-owner-harness.mjs` is a `SourceTextModule` loader of emitted private functions used by 24 lanes; `d2-evidence-owner-harness.mjs` and others load through `runInNewContext`.

The family selected for this increment is the R10 projection family: `r10-projection-contracts.test.mjs`, `r10-child-proof.test.mjs`, their support `r10-fresh-imports.mjs`, `r10-retained-child-projection.mjs`, `r10-retained-hello-projection.mjs`, `r10-private-owner-harness.mjs`. TD-05's two load-failing lanes above join it. The other lanes bound to the ignored directory or to a `/Users/` path (`d1-preserved-result-mechanics`, `t287-native-assessment-evidence`, `t288-composition-conservation`, `w2-steel-single-start-installed`, `w2-steel-serial-branch-installed`; support `d2-bounded-harness`, `declared-testing-capability`, `stdo-environment-pilot`; `d2-evidence-owner-harness.mjs:9-10` resolving `implementation-03/work` and `installed-continuation-07/installed-frame-01`, neither present) are the next increments, not this one: list them with their first failing line and cause class in the Return, edit none.

Items.

1. Census first. For each of the four lanes: the first failing line at the head you start from (the commit of this activation; `git rev-parse HEAD`), its cause class (missing input, machine-bound coordinate, displaced path, obsolete API, loader), and the inputs the lane actually reads from the ignored directory (file, bytes, and which assertion needs it). The census is the first section of the Return and bounds items 2 to 4.
2. TD-04, inputs. Package the finite inputs the two R10 lanes need under `test_env/fixtures/r10-projection-family/` in the shape the existing fixture owners use (`test_env/fixtures/t287-management-supervision/retained-api-retry.jsonl` is the precedent for an event log). The inputs are copied byte for byte; historical bytes and the historical digests recorded in `call-11.jsonl` are not rewritten. The lanes obtain a truthful new coordinate over the packaged log through the store owner's own reader (the exported readers in `abg/event_store.ts`; `reopenEventStore` `:3963` and `readRuntimeEventsAtDurablePrefix` `:2065` are the entry points to start from) and assert that the new coordinate's `prefixDigest`, `prefixLength` and `eventContractDigest` equal the historical values, so the packaged bytes are proven to be the same prefix; the historical `storeIdentity` and `eventLogRef` are read from the fixture as historical evidence only, never asserted against the live file. No `/Users/` string and no path above `test_env/` remains in the family; paths resolve from `import.meta.dirname`.
3. TD-05, obsolete assertions. `m5-consensus-module.test.mjs:26` and `t287-wave2-owner-contract-source-set.test.mjs:47`: each assertion that used the retired export either reads the current inventory from its owner (the current export of the same owner module, named in the Return) or is deleted as obsolete with its name listed. No retired production export is restored; no count is replaced by a number written into the test.
4. Loaders. State whether `r10-private-owner-harness.mjs` duplicates another loader in `test_env/support` (the `runInNewContext` and `SourceTextModule` loaders listed with their file and the mechanics each adds). If one loader has the same mechanics and the R10 lanes can move to it by an import change, move them and delete the R10 loader only if no other lane imports it; otherwise keep it with the named reason. The other 22 lanes that import it are not edited.
5. Proof. From a fresh `git worktree add <scratchpad>/td0405-clean <commit>` of your commit: `npm ci` (or the install the README names), `npm run build`, then the four lanes. The Return lists, per lane, tests/pass/fail/skipped at head in this checkout and in the clean worktree after, the formerly load-failing assertions that now execute by name, the assertions deleted as obsolete by name, and the positive and negative owner branches the R10 lanes reach (the refusal cases they assert, by test name). A lane that is still red in the clean worktree after the edit is red for a reason the Return names with its first error line.
6. Lanes. `tsc --noEmit`, `lint:imports`, `lint:lifecycle` unchanged (no `code/src` edit is expected; if one is needed, stop). Every lane that imports a support file you changed runs before and after, with the same identities red before and after or the difference named.

Grant: `test_env/tests/r10-child-proof.test.mjs`, `test_env/tests/r10-projection-contracts.test.mjs`, `test_env/tests/r10-fresh-imports.mjs`, `test_env/tests/r10-retained-child-projection.mjs`, `test_env/tests/r10-retained-hello-projection.mjs`, `test_env/tests/m5-consensus-module.test.mjs`, `test_env/tests/t287-wave2-owner-contract-source-set.test.mjs`, `test_env/support/r10-private-owner-harness.mjs`, new files under `test_env/fixtures/r10-projection-family/`, and this record (append only, your section). No other file.

Stop (write the counterexample and the blocking line in the Return, keep the rest of the package moving): any edit under `code/src`, `build/`, `contracts/`, `design/` or a `.gitignore`; restoring a retired production export; a packaged input over 6 MB in total or a file that is not read by an assertion; rewriting a historical byte, digest or coordinate value; an assertion whose input exists in neither the ignored directory nor the repository (name it; it is a TD-04 next-increment row, not this package's); a change to a Product contract, an event payload key or a failure class; a test whose positive branch needs a retired authority to pass (do not weaken the authority).

Return contract: one commit on `main` with the first line `TD-04 + TD-05: the R10 projection family runs from a clean checkout; two obsolete-import lanes retired` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Add only the files you changed; no `git add -A`. Append `## TD-04 + TD-05 return` at the end of this record with: the census (item 1), the packaged inputs with bytes and the digest equalities (item 2), the assertion lists (items 3 and 5), the loader statement (item 4), the clean-worktree runs (item 5), the lane runs (item 6), stops, and the next-increment rows. Nothing above your section is edited.

## TD-04 + TD-05 return

Worker: Opus 5.5, fresh context. Base `2b585b87f`. This package's single commit is the next one on `main`, not pushed. The code and fixture files were committed first at `b939b3fd1`, and the clean worktree was cut from that commit. This record was then appended and the commit amended. `git diff --stat b939b3fd1 HEAD` touches only this file. Paths are relative to `build_tenants/abiogenesis/typescript/` unless they start with `.ai-workspace/`. "S01" is `.ai-workspace/comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/attempt-01/`. "D2-09" is `.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/`. Counts are tests/pass/fail/skipped.

| Item | State | Lines at head `2b585b87f` | Lines after |
|---|---|---|---|
| 1. Census | done | below | |
| 2. TD-04 inputs | done for `r10-projection-contracts` and `r10-retained-hello-projection.mjs`; stop for `r10-child-proof` and `r10-retained-child-projection.mjs` (Stops) | `r10-projection-contracts.test.mjs:20-24`, `:30`; `r10-retained-hello-projection.mjs:4`, `:7-13` | `r10-projection-contracts.test.mjs:6`, `:10`, `:22-28`, new test `:38-46`, call sites `:53`, `:92`, `:97`, `:167`; `r10-retained-hello-projection.mjs:6`, `:10-14`; new `test_env/fixtures/r10-projection-family/` |
| 3. TD-05 assertions | done | `m5-consensus-module.test.mjs:26`, `:641-646`; `t287-wave2-owner-contract-source-set.test.mjs:46-48`, `:1064-1124` | `m5-consensus-module.test.mjs:26`, `:640-650`; `t287-wave2-owner-contract-source-set.test.mjs:46-48`, `:1064-1077` |
| 4. Loaders | done; R10 loader kept | `test_env/support/r10-private-owner-harness.mjs` | unchanged |
| 5. Proof | done | | Clean worktree |
| 6. Lanes | done | | Lanes |

**Item 1: census at `2b585b87f`** (rebuilt; `npm run build` regenerated no tracked file).

| Lane | Head | First failing line | Cause class | Inputs read from an ignored directory |
|---|---|---|---|---|
| `r10-projection-contracts` | 1/0/1/0 | `:24` `DurablePrefixReadError` `file_identity_mismatch` "ABG durable prefix file identity differs from coordinate" | machine-bound coordinate. `call-11.jsonl` binds device 16777230, inode 449692970; the S01 log stats device 16777231, same inode. `:22` is an absolute `/Users/` path. The load failure hid a second cause at `:30`: the private name `outputFor` no longer exists in `abg/project_read_definition_bindings.js`. It was renamed and exported as `projectAbgReadOutput` in `0b1187c40` (obsolete API). | S01 `call-11.jsonl`, 9,304 bytes: `:23-24` close-handoff `prefix`, which every test uses. S01 `events-01/runtime.events.jsonl`, 2,797,774 bytes: every test through `events` and `prefix`, and `:65` (test "read before Run close is not_ready…") reads its first 19 lines directly. |
| `r10-child-proof` | 1/0/1/0 | `:17` `ENOENT` on `<repo>/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/events-01/runtime.events.jsonl` | displaced path: `:14` resolves D2-09 at the repo root and `:118` resolves S01 at `build_tenants/fixture-program-selection-01`. Behind that, the D2-09 log has grown: `:18` asserts sha256 `4f561cea…`, which is the digest of its first 846 lines, and the file now has 913 lines (19,058,361 bytes, sha256 `f841bba9…`). `:139` is a machine-bound coordinate: it asserts device 16777230 and inode 449590349, and the file stats 16777231 and 449590349. | D2-09 `events-01/runtime.events.jsonl`, first 846 lines = 13,540,472 bytes: `:17-20` at module level, which every test uses; `prefixAt(67)` is 4,989,940 bytes and `prefixAt(831)` (`:77`) is 13,487,870 bytes. D2-09 `attempt-01/program-ready-16.json`, 12,781,893 bytes: `:17-21` `catalog`, `catalogView` and `closeHandoff.prefix`, which every test uses. S01 `call-9.jsonl`, 20,426,253 bytes: `:119`, test "conformance keeps the complete artifact-truth, inventory and Program joins…". S01 `call-11.jsonl`, 9,304 bytes: `:129`, same test. |
| `m5-consensus-module` | 1/0/1/0 | `:26` `SyntaxError`: `public/index.js` does not provide `ROOT_PUBLIC_OPERATION_IDS` | obsolete API (retired in `adaeede02`) | none |
| `t287-wave2-owner-contract-source-set` | 1/0/1/0 | `:47` `SyntaxError`: `product/release_snapshot_operations.js` does not provide `ReleaseSnapshotPort` | obsolete API (retired in `ad2a39f40`) | none |

Support scripts in the family, run with `node --experimental-vm-modules`. No lane imports any of them.
- `r10-retained-hello-projection.mjs`: exit 1, `:11` `ENOENT` on `build_tenants/fixture-program-selection-01/attempt-01/events-01/runtime.events.jsonl` (displaced path at `:7`).
- `r10-retained-child-projection.mjs`: exit 1, `:10` `ENOENT` on D2-09 (displaced path at `:7`). It also asserts the whole-log hash (`:11`) and dev/ino (`:13`).
- `r10-fresh-imports.mjs`: exit 0. It reads no fixture.

A one-off check of each named import in the four lanes against the current exports found nothing missing beyond `:26` and `:47`.

**Item 2: packaged inputs.** Each input is a byte-for-byte copy (`cmp` identical to the source; the committed blobs hash to the same digests). The source layout below S01 is kept.

| File under `test_env/fixtures/r10-projection-family/` | Bytes | sha256 | Source | Read by |
|---|---|---|---|---|
| `s01-attempt-01/call-11.jsonl` | 9,304 | `3d4adcf616337360931993fbd10e42090c989ac24060d56318cd21ea9363f845` | S01 `call-11.jsonl` | `s01-store.mjs` `historical` (`acquisition.closeHandoff`). Its `reopenAuthority.eventContractDigest` selects the profile. Its `prefix` digest and length are asserted in `r10-projection-contracts.test.mjs:40-42` and `r10-retained-hello-projection.mjs:13-14`. |
| `s01-attempt-01/events-01/runtime.events.jsonl` | 2,797,774 | `d2a677a2201dddb5b6f14d82b1c11e5d3cf95e9d369c30742cd750dac198e56c` | S01 `events-01/runtime.events.jsonl` | the owner's reopen; every `r10-projection-contracts` test through `prefix`, and `:78` reads 19 lines directly; `r10-retained-hello-projection.mjs`. |
| `s01-store.mjs` | 28 lines | | new reader module (precedent: `t287-management-supervision/fresh-public-read.mjs`) | imported by both consumers |

Packaged input total: 2,807,078 bytes. `call-11.jsonl` keeps its historical `/Users/` strings (`eventLogRef`, `eventLogPath`) as bytes. No family source file contains `/Users/`.

`reopenPackagedS01Store(eventContractDigest)` builds an `event_store_reopen_authority` from the packaged file itself: its path, `stat` device and inode, byte length, and a sha256 computed with `node:crypto`. It then calls `reopenEventStore`, and on success calls `closeHeldEventStoreAtDurablePrefix` with no append. The close handoff's `prefix` is cold, so later reads authenticate the file again. No lock remains in `tmpdir()/abiogenesis-event-store-locks-v5/` for the two fixture inodes (496933743 here, 497086393 in the clean worktree) after the runs. The fixture is unchanged after the runs (`git status` clean in the worktree).

One property this reader adds: `reopenEventStore` opens the tracked fixture `O_RDWR|O_APPEND` and writes a lock into `tmpdir()`. So the lane and the Hello script need write permission on `s01-attempt-01/events-01/runtime.events.jsonl`; a read-only checkout refuses `sink_unavailable`. A run killed between reopen and close leaves a lock that refuses the next run until it is removed.

Digest equalities in the new test `r10-projection-contracts.test.mjs:38` ("the packaged log is the historical S01 prefix…"):
- `eventLogRef` is the packaged file's URL.
- `prefixDigest` is `sha256:d2a677a2…`, equal to the historical value.
- `prefixLength` is 2,797,774, equal to the historical value.
- `storeIdentity.eventContractDigest` is `sha256:fc3a6350…`, equal to the historical value and to the owner's `LEGACY_ROOT_EVENT_CONTRACT_DIGEST`.
- The supplied profile is the historical one. The negative case shows that the bytes fix it: reopening under `ROOT_EVENT_CONTRACT_DIGEST` (`sha256:6c8a9852…`) refuses `invalid_event_history` "durable coordinate profile differs from authenticated history".

New coordinates:
- This checkout: device 16777231, inode 496933743, `coordinateDigest` `sha256:fdab3154…`.
- Clean worktree: device 16777231, inode 497086393, `coordinateDigest` `sha256:70d4b112…`.

The historical `storeIdentity` (device 16777230, inode 449692970), `eventLogRef` and `coordinateDigest` `sha256:208b0ec1…` are read as evidence only and are never compared with the live file.

**Item 3: assertion lists.**
- `m5-consensus-module`: the assertion at head `:641-646` now reads the Public operation inventory from `PUBLIC_OPERATION_CONTRACT_PROJECTIONS`. That is the current export of the same module, `public/index.js`; its owner is `public/binding/public_function_family.ts:485`. It maps `operationId`, checks that the list is non-empty, and checks that no id contains "consensus" (after `:640-650`). Nothing is deleted. The assertion sits in test `:486` "S05 module publishes the exact Consensus contracts, vocabularies, and ordinary GTL callable", which passes.
- `t287-wave2-owner-contract-source-set`: the import becomes `RELEASE_OPERATION_CONTRACTS`, the current export of the same module, `product/release_snapshot_operations.js`. In test `:1064` the following are deleted as obsolete:
  - the `ReleaseSnapshotPort.published_rc` call (head `:1065-1072`), with `published.outcomeKind === "refusal"` (`:1073`) and `published.value.code === "basis_mismatch"` (`:1074`);
  - the local `finalBasis`, `finalVerdict` and `releaseEvidence` fixtures (`:1077-1100`);
  - the `ReleaseSnapshotPort.tapped_release` call (`:1101-1114`), with `tapped.outcomeKind === "refusal"` (`:1115`) and `tapped.value.code === "installed_rc_authorization_missing"` (`:1116`). That code is absent from the current refusal picklist (`release_snapshot_operations.ts:79`).
- These assertions call the owner. The current owner callable is `RELEASE_SNAPSHOT_DEFINITION_BINDINGS.snapshot.*` (`product/release_snapshot_definition_bindings.ts:157`), which takes an admitted DefinitionCall with admission authority, an acquired event resource and five authority slots. Its `basis_mismatch` branch (`:47`) belongs to that proof, not to this source-set lane.
- The three `gate_incomplete` assertions (`:1075`, `:1117`, `:1118-1123`) now read the inventory: for each member of `RELEASE_OPERATION_CONTRACTS.snapshot`, the source-map packet is the same object, and the strict JSON projection of its refusal schema does not contain `gate_incomplete`.
- The test is renamed from "D15 owner callable uses accepted refusal algebra without gate_incomplete" to "D15 release snapshot refusal algebra excludes gate_incomplete for every member", because it no longer invokes a callable.
- No retired export was restored, and no count was written into either test.

**Item 4: loaders.** `r10-private-owner-harness.mjs` `privateOwner(relative, names, overrides)` reads the emitted `build/code/src/<relative>`, appends `export { names }` to expose bindings the module does not export, sets `import.meta.url`, and links each specifier to a `SyntheticModule` over the real namespace merged with per-specifier overrides, with a link cache. The other loaders in `test_env/support`, and what each adds:
- `witness-reprice-mechanics.mjs:25` `loadMechanism` has the same link, override, names and `import.meta` mechanics, but its body is `ts.transpileModule` of `code/src/<relative>.ts`: current source, not emitted output. It imports `privateOwner` itself (`:19`).
- `t287-native-work-currentness-consumers.mjs:286` `component(name, overrides)` loads emitted output with overrides. It appends no names, sets no `import.meta` and has no link cache. In the same file, `:55` `componentNativeAssessment` has fixed overrides, and `:359` `semanticFixtureHelpers` slices a test file's text and appends exports.
- `forward-owner-lookups.mjs:92` `moduleAt` is not exported; it has fixed overrides and a cache.
- `d1-preserved-result-harness.mjs:190` interposes `node:fs` `readFileSync`.
- `d2-binding-harness.mjs:164-207` has three linked modules with `node:fs` replay interposition.
- `d2-bounded-harness.mjs:82` selects a source root and input profile.
- `d2-historical-design-harness.mjs:76` has fixed overrides.
- `t287-predecessor-context.mjs:56` has one fixed `semantic_stage` override.
- `malformed-gtl-native-fixture.mjs:210-218` links a recursive `SourceTextModule` graph, optionally in a separate `vm.createContext` realm.
- `d2-evidence-owner-harness.mjs:141` and `:161` use `runInNewContext` over function bodies extracted by regex, with a mapped `readFileSync`.

None has the same mechanics. The R10 lanes need appended private names (`terminalResult`, `prepareRead` with an override, `scopeForBasis`, `terminalContract`, `graphCallContext`, `typedTerminalResult`, `reconstructDeclarationBasis`, two schemas), which `component` cannot provide. `loadMechanism` would change the subject from emitted output to transpiled source. Kept, byte-identical. The R10 loader is imported by 21 lanes: 18 directly, plus 3 through `witness-reprice-mechanics.mjs` (`t287-fh-hold-open`, `witness-reprice-definition-binding`, `witness-run-stopped-definition-binding`). That is 19 besides the R10 pair; none was edited.

**Item 5: clean worktree.** `git worktree add --detach <scratchpad>/td0405/td0405-clean b939b3fd1`. Neither `typescript/` nor `build_tenants/abiogenesis/README.md` names an install step, so `npm ci` was run over the committed `package-lock.json` (16 packages added). Then `npm run build` (exit 0), then the four lanes. After the runs, `git status` in the worktree is clean.

| Lane | Head, this checkout | After, this checkout | Clean worktree |
|---|---|---|---|
| `r10-projection-contracts` | 1/0/1/0 | 10/9/1/0 | 10/9/1/0 |
| `r10-child-proof` (unedited, stop) | 1/0/1/0 | 1/0/1/0 | 1/0/1/0 |
| `m5-consensus-module` | 1/0/1/0 | 18/11/7/0 | 18/11/7/0 |
| `t287-wave2-owner-contract-source-set` | 1/0/1/0 | 15/13/2/0 | 15/13/2/0 |
| `r10-retained-hello-projection.mjs` (script) | exit 1 | exit 0 | exit 0 |
| `r10-retained-child-projection.mjs` (script, stop) | exit 1 | exit 1 | exit 1 |
| `r10-fresh-imports.mjs` (script) | exit 0 | exit 0 | exit 0 |

The ok/not-ok identities are the same after the edit in this checkout and in the clean worktree. In the clean worktree, `r10-child-proof` fails at `:17` with `ENOENT` on `<worktree>/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/events-01/runtime.events.jsonl`.

Formerly load-failing assertions that now run, by test:
- `r10-projection-contracts`: the module-level `truth.kind` and `replay.kind` checks run (`:30`, `:36`), and eight of the nine head tests pass:
  - "six current owner outputs preserve the same admitted terminal carrier and the 18/56 Public roster";
  - "legal I-JSON null is not absence…";
  - "held/failed/missing terminal truth cannot become a completed Product result";
  - "read before Run close is not_ready while the actually closed root GraphCall is independently readable";
  - "whole-prefix typed replay summary is conserved on first and empty-end pages; invalid offsets and arithmetic refuse";
  - "scope and packet crossings refuse; root does not accept a caller declarationProof field";
  - "native CCall owner rejects altered value, contract, producer, judgment and pre-result prefix without test-owned admission";
  - "the shared mapper rejects crossed result aliases and keeps failed-command observation data verbatim".

  The ninth runs and is red: "Run reads validate selected liveness while workspace replay retains the complete calculus". It fails at `:142` with `TypeError` "Cannot read properties of undefined (reading 'terminalResult')". The owner refuses the unrelated-scope variant with `abg_project_read_refusal` `invalid_history` "ABG project read owner projectors refused the durable event history", where the test expects the original terminal result. The new packaged-prefix test passes.
- `m5-consensus-module`: all 18 tests run, and 11 pass: `:486`, `:654`, `:692`, `:891`, `:1068`, `:1087`, `:1224`, `:1244`, `:1278`, `:1391`, `:2153`. Red:
  - `:1104`, `:1310`, `:1656`, `:1931` and `:2111` fail first at helper `:385`: `actor_process_carrier_validation_refusal` `invalid_actor_process_observation` "actor process observation must be one exact ordinary closed data object".
  - `:1542` fails first at `:1572`: `event_store_reopen_refusal` `invalid_event_history` "runtime event payload matches no admitted event-contract variant".
  - `:2247` fails first at `:2252`: `ENOENT` on `code/src/public/operations.ts`.
- `t287-wave2-owner-contract-source-set`: all 15 tests run, and 13 pass, including the renamed D15 test. Red:
  - `:609` fails first at `:611`: `isDeeplyFrozen(PUBLIC_FUNCTION_DEFINITION_FAMILY)` is `false`.
  - `:796` fails first at `:798` on "D15": the representative release request is refused by the current request schema, with issue paths under `/lawBasis`, `/qualificationBasis` and `/requestedIdentity`.

Owner branches the R10 lane reaches, by test:
- "the packaged log is the historical S01 prefix…": positive, reopen under the historical profile. Negative, reopen under the current profile refuses `invalid_event_history`.
- "six current owner outputs…": positive, `run_result`, `run_replay`, `graph_call_result` and `graph_call_replay` project, `projectAbgReadOutput` returns `result`, and `constructRunInvocationOutcome` handles `invoke` and `start`.
- "legal I-JSON null…": positive, a null result row is selected. Negative, no row gives `null`.
- "held/failed/missing terminal truth…": negatives give `nonterminal`, `runtime_failed`, `blocked`, and `refusal` both for a null terminal result and for a changed result digest.
- "read before Run close…": negative, `run_result` at the 19-event prefix refuses `target_not_ready`. Positive, `graph_call_result` projects.
- "whole-prefix typed replay…": positive at offsets 0 and the event count. Negatives give `cursor_invalid` and `range_invalid` three times.
- "scope and packet crossings refuse…": negatives give `invalid_packet` for a caller `declarationProof` and `invalid_history` for a changed `coordinateDigest`; GraphCall and Run targets crossed both ways refuse.
- "Run reads validate selected liveness…": positive, the original `run_result` and `workspace_replay` project. It is red at `:142`, so its three `invalid_history` negatives (`:143`, `:145`, `:146`) are not reached.
- "native CCall owner rejects…": positive projection. Negatives give `null` for a changed value, contract, `cCallRef`, judgment `resultRef` and pre-result prefix.
- "the shared mapper rejects…": negative, `projectAbgReadOutput` throws on a crossed result alias. Positive, the carrier schema admits a failed-command observation.
- `r10-child-proof` reaches no branch.

**Item 6: lanes.** `npx tsc --noEmit -p tsconfig.json`: clean. `npm run lint:imports`: 28 modules, clean. `npm run lint:lifecycle`: 284 modules, 10 allow-listed, no offender. There are no `code/src` edits. No file under `test_env/support` changed. The new `s01-store.mjs` is imported only by `r10-projection-contracts` and `r10-retained-hello-projection.mjs`. So no lane beyond the four was required. Paths that leave `test_env/` in the edited files are imports of the tenant's own `build/` output, as in every lane.

**Edits beyond the activation's letter** (for the Executive's ruling).
1. `r10-projection-contracts`: `outputFor` is read through `projectAbgReadOutput`, the current export of the same owner module: one import (`:10`), four call sites, and the `privateOwner` line at head `:30` removed. This is the item 3 rule applied to an R10 lane. The alternative is that the lane stays red at `:30` with `SyntaxError` "Export 'outputFor' is not defined in module".
2. The wave-2 D15 test is renamed (item 3).
3. The reader module `s01-store.mjs` is shared by the lane and the script, so the reopen is not written twice.

**Stops.**
1. `r10-child-proof` and `r10-retained-child-projection.mjs` would need a packaged input over 6 MB. Every test, and the script, reads D2-09 at module level: the 846-line log prefix (13,540,472 bytes, hashed whole at `:18`) and `program-ready-16.json` (12,781,893 bytes; `catalog` and `catalogView` form the declaration proof that every test uses). The smallest prefix any test uses (ordinal 67, 4,989,940 bytes) plus the ready file is 17,771,833 bytes. The `:117` test also needs S01 `call-9.jsonl` (20,426,253 bytes). Blocking lines: `r10-child-proof.test.mjs:14-21` and `r10-retained-child-projection.mjs:7-16`. Both files are unedited. Their paths above `test_env/` (`:14`, `:118`; `:7`) and the dev/ino assertions (`:139`; `:13`) remain.
2. `m5-consensus-module` test `:2247` ("S05 generic Public and ABG invocation basis contain no Consensus branch") reads an input that exists in neither the ignored directory nor the repository. Counterexample: `ENOENT` at `:2252` on `code/src/public/operations.ts`. That file is the tenant's own source, deleted in `adaeede02`. Blocking line: `m5-consensus-module.test.mjs:2252`. The test is unedited.

**Next-increment rows** (first failing line at `2b585b87f` unless stated "after").

| Row | Lane or file | First failing line | Cause class |
|---|---|---|---|
| TD-04, D2-09 store | `r10-child-proof`, `r10-retained-child-projection.mjs` | `:17` and `:10`, `ENOENT` | displaced path; historical log grown past the asserted 846 lines; machine-bound dev/ino; inputs over 6 MB (Stop 1) |
| TD-04, S01 `call-9.jsonl` | `r10-child-proof` test `:117` | not reached (module load) | input over 6 MB (20,426,253 bytes) |
| owner ruling | `r10-projection-contracts` test `:109` | after: `:142` | Run read refuses `invalid_history` for a malformed liveness event in an unrelated Run scope; the test expects selected-scope validation. Not an input. |
| TD-05 | `m5-consensus-module` `:1104`, `:1310`, `:1656`, `:1931`, `:2111` | after: helper `:385` | obsolete fixture contract (actor process observation shape) |
| TD-05 | `m5-consensus-module` `:1542` | after: `:1572` | obsolete fixture contract (event payload variant) |
| TD-04 | `m5-consensus-module` `:2247` | after: `:2252` | input exists nowhere (Stop 2): `code/src/public/operations.ts` was deleted in `adaeede02` |
| TD-05 | `t287-wave2-owner-contract-source-set` `:796` | after: `:798` | obsolete fixture contract (D15 release request shape) |
| owner ruling | `t287-wave2-owner-contract-source-set` `:609` | after: `:611` | `PUBLIC_FUNCTION_DEFINITION_FAMILY` not deeply frozen |
| TD-04 | `d1-preserved-result-mechanics` (1/0/1/0) | `support/d1-preserved-result-harness.mjs:20` `ENOENT` on `build_tenants/abiogenesis/preimages/source-observation.json` | displaced path; also `tests/d1-preserved-result-mechanics.test.mjs:34`, an absolute `/Users/` path to `20260911_D2_BOUNDED_REPAIR/implementation-04/work` |
| TD-05 | `t287-native-assessment-evidence` (4/1/3/0) | `:548` (tests `:551`, `:559`, `:585`) `TypeError` "profile schedule requires the original gap-free stamped history" | obsolete fixture contract (unstamped inline history). The `/Users/` strings at `:118`, `:136-137`, `:173-175` are inline row data. |
| TD-04 | `t288-composition-conservation` (1/0/1/0) | `:12` "exact predecessor and immutable native history required" | missing input (`ABI5_COMPOSITION_PREDECESSOR`, `ABI5_COMPOSITION_SCRATCH` unset); `:62` is an absolute S01 path |
| TD-04 | `w2-steel-single-start-installed` (1/0/0/1) | skip at `:252` | missing input (`ABI5_STEEL03_*`, `ABI5_WAVE1_FROZEN_ARTIFACT_PATH` unset) |
| TD-04 | `w2-steel-serial-branch-installed` (2/0/0/2) | skips at `:254` | missing input (`ABI5_STEEL04_*`, `ABI5_WAVE1_FROZEN_ARTIFACT_PATH` unset) |
| TD-04 | `support/d2-bounded-harness.mjs` | `:9`, `:11` | machine-bound `/Users/` paths (`20260910_D2_FRAME_REPAIR/implementation-01`; `20260909_D1_LIFECYCLE/…/bridge-input.json`) |
| TD-04 | `support/declared-testing-capability.mjs` | `:18` | machine-bound CLI binary path |
| TD-04 | `support/stdo-environment-pilot.mjs` | `:153-155` | machine-bound `~/Library/Application Support/…/v2.5.0-rc.7` install roots |
| TD-04 | `support/d2-evidence-owner-harness.mjs` | `:9-10` | displaced path: `packageRoot/../../implementation-03/work` and `../../installed-continuation-07/installed-frame-01` resolve under `build_tenants/`, and neither exists |

**Errata in the activation.**
1. `r10-child-proof` does not resolve the S01 store at `:15`. `:14` resolves D2-09, a different store, and the first error is at `:17`. Only `:118` resolves S01. TD-14's row (`ENOENT` on `20260911_D2_BOUNDED_REPAIR/installed-continuation-09/…`) already showed this.
2. The R10 loader has 21 importing lanes, not 24 (19 besides the R10 pair, not 22).
3. The `file_identity_mismatch` comes from device drift (16777230 to 16777231). The inode is unchanged.

## TD-04 + TD-05 disposition (Executive, 2026-10-24)

Accepted at `bf117cf92` as the R10 increment of both register rows. Executive check on that head: `tsc --noEmit` clean; both lints; `r10-projection-contracts` 10/9/1/0 (the one red is the Run-read validity ruling below); `m5-consensus-module` 18/11/7/0; `t287-wave2-owner-contract-source-set` 15/13/2/0; the packaged fixture tree unchanged after the lanes (`exec_check_TD0405.log`).

The obligation of Phase B row 6 is met for the selected family: `r10-projection-contracts` went from a load failure to ten tests of which nine pass, in this checkout and in a clean `git worktree` after `npm ci` and `npm run build`; the two obsolete-import lanes load again (18 and 15 tests run where none did) with no retired export restored; the formerly load-failing assertions and the deleted obsolete bodies are listed by name in the Return (`:1014`, `:1039`); the `r10-retained-hello-projection` script exits 0. The packaged inputs are two byte-for-byte copies, 2,807,078 bytes; the lanes obtain a truthful coordinate by reopening the copy through the store owner and closing with no append, and assert `prefixDigest`, `prefixLength` and `eventContractDigest` equal to the historical values while the current profile refuses the historical bytes (`invalid_event_history`), which is the asserted negative. No exported constructor builds a reopen authority from a physical file, so `s01-store.mjs` constructs it in the shape the owner's own close handoff uses (`event_store.ts:2539`); that is proof construction, not production. The reopen opens the copy read-write and takes a lock under `tmpdir()`; a read-only checkout or a stale lock refuses the lane. That is the store owner's behavior and is recorded, not repaired here.

Ruled.

1. The two edits beyond the activation's wording are in: `outputFor` no longer exists and its exported replacement `projectAbgReadOutput` is TD-05's own rule (an obsolete name reads the current owner); the renamed D15 test no longer invokes a callable.
2. Stop 1 (`r10-child-proof`, `r10-retained-child-projection.mjs`: the D2 store at 13,540,472 bytes plus 12,781,893 bytes of `program-ready-16.json`, and S01 `call-9.jsonl` at 20,426,253 bytes) is correct. Packaging 38 MB of historical evidence in the repository, an evidence root outside it, or retiring the lanes is the owner's call: Phase C row "Historical evidence stores for proof lanes", with the recommendation of one evidence root named by one environment variable and lanes that skip with the named reason when it is absent (the two `w2-steel-*-installed` lanes already do this).
3. Stop 2 (`m5-consensus-module:2252` reads `code/src/public/operations.ts`, deleted in `adaeede02`) is an obsolete assertion: TD-05's next increment, not this one.
4. The one red R10 test (`:142`): the test expects a Run read to project while a different Run's scope holds a malformed liveness event, and the workspace replay to refuse; the code refuses the Run read with `invalid_history` as well. Whether a Run read's validity is Run-scoped or whole-prefix is the project-read owner's design question: Phase C row "Run read validity scope", recommendation to keep the whole-prefix refusal (a log holding a malformed event is not admitted history; the event log is the recovery source) and retire the test's unrelated-scope expectation.
5. wave2 `:611` (`isDeeplyFrozen(PUBLIC_FUNCTION_DEFINITION_FAMILY)` false): probed at head; every unfrozen member is a validation-library function or its prototype inside `requestContract.schema` (`reference`, `~run`, `~standard.validate`); the family's data is frozen by `constructFamily`. The assertion's reach is obsolete, not the family: TD-05's next increment, where the assertion names the data projection or `isDeeplyFrozen` is given its intended domain (the second is a shared-atom decision the Executive takes when that increment is activated).
6. The remaining rows the Return lists (m5 `:385` ×5, `:1572`; wave2 `:798`; `t287-native-assessment-evidence:548`; `d1-preserved-result-harness:20`; `t288-composition-conservation:12`; the support files with machine paths; `d2-evidence-owner-harness:9-10`) are the next increments of TD-04 and TD-05 and are written into their register rows. The Phase B order continues with TD-11; the next increments are selectable after the Phase B close or when their owner is next touched.

Errata in the activation (`:14` is the D2 store, 21 importing lanes, device drift only) stand corrected by the Return; the Return's census is the record.

## TD-11 activation (Executive, 2026-10-24; the tool projection maintained incrementally)

Debt (register TD-11): `createWorkerTransportOutputObserver` (`abg/worker_transport.ts:263`) returns `observe(chunk)` (`:339-346`) and `finish()` (`:347-350`), and both end in `snapshot()` (`:313-337`). `snapshot` rebuilds `toolInvocations` from `rawToolInvocations` from scratch at every call: for each raw row a `toolInvocations.find` over the unique rows so far (pairwise, quadratic in the number of tool rows), `conflictingToolUseRef` and `unevidencedToolUse` recomputed, each unique row and the array `deepFreeze`d again. `collectToolUses` (`:171`) appends one raw row per complete `tool_use` block. The consumer at `actor_process.ts:1252` calls `observe` on every stdout chunk and reads `progressEventCount` and `finalOutput` per chunk; a worker with N tool rows arriving one per chunk pays about N²/2 old-row visits over its life.

Items.

1. Census first. Every reader of a `StructuredObservation` member (`structuredEventCount`, `progressEventCount`, `toolCallCount`, `toolInvocations`, `apiRetryCount`, `finalOutput`), with its file and line and the cut at which it reads (per chunk, at `finish`, or later from a retained snapshot). Every reader of `rawToolInvocations` and `rawToolCallCount`. The counted work at head: with N complete `tool_use` rows arriving one per chunk, the number of old-row visits (`find` comparisons) summed over the N `observe` calls, measured by a counter in the test, for N in {1, 64, 512}.
2. Maintain the unique and conflict state in the same observer as rows arrive: a map from `toolUseRef` to its first-seen evidence row, the unique list in first-seen order with the same ordinals as today, `conflictingToolUseRef` set when a later row with the same ref differs in `toolName`, `inputDigest` or `inputByteLength`, and the raw row count. `snapshot()` forms the immutable complete evidence at the cut from that state without revisiting old rows: the returned `StructuredObservation` is deeply frozen as today, and every member equals head's value at every cut. The Return states how the frozen array is produced (one new frozen array per snapshot is acceptable; re-freezing each row is not needed, since rows are frozen at insertion).
3. Proof. In `test_env/tests/m5-worker-transport.test.mjs`: (a) an equivalence case that drives head's observer (kept in the test as a reference copy of the head algorithm, or reconstructed from the raw rows) and the new observer over the same stream and asserts identical snapshots after every chunk, with the stream covering arbitrary chunk splits inside and across lines, duplicate `tool_use` ids with equal and with differing inputs, the `StructuredOutput` exclusion when structured output is expected, `api_retry` rows, partial final line drained by `finish`, and a successful `result` row with and without `structured_output`; (b) the counter case of item 1 showing old-row visits per `observe` independent of N after the change (TD-06's visit counter in `t287-calculus-fold.test.mjs:210-265` is the pattern).
4. Boundaries kept, by reading and by the lanes: no admitted progress or tool row dropped or reordered; `toolCallCount`'s `+ 1` rule for a conflict or an unevidenced call unchanged; `countToolUses` (`:239`) and the partial-block rule (`:292-296`) unchanged; `actor_process.ts` and the probe policy (`:1252-1262`) untouched; `WorkerToolInvocationEvidence` unchanged.
5. Records. The register row is the Executive's. If `build/code/src/abg/worker_transport.js` is tracked (`git ls-files`), commit the regenerated output as TD-13 and TD-14 did. No design edit is expected; the common library design has no row for this owner.
6. Lanes. `tsc --noEmit`, `lint:imports`, `lint:lifecycle`; `m5-worker-transport` (21/21 at head) and the other ten lanes that import `worker_transport` (`t287-default-library`, `t287-declared-testing-capability`, `t287-f04a-probabilistic-result-candidate`, `t287-lifecycle-failure-carrier`, `t287-management-stream-drain`, `t287-management-supervision`, `t287-native-workspace-work`, `t287-management-context`, `t287-owned-process-lifetime`, `t288-instruction-assembly-owner`) before and after, tests/pass/fail/skipped, the same red identities before and after or the difference named.

Grant: `code/src/abg/worker_transport.ts` (the observer, `collectToolUses` and their private helpers only), `test_env/tests/m5-worker-transport.test.mjs`, the tracked `build/code/src/abg/worker_transport.js` if tracked, and this record (append only, your section). No other file.

Stop (write the counterexample and the blocking line in the Return, keep the rest moving): any change to the `StructuredObservation` shape or to any member's value at any cut; any change under `shared/`, to `actor_process.ts`, to liveness or probe policy, or to `WorkerToolInvocationEvidence`; dropping or reordering a row; a change to an event payload key or a failure class.

Return contract: one commit on `main` with the first line `TD-11: the tool projection maintained incrementally; old tool rows no longer revisited per chunk` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Add only the files you changed; no `git add -A`. Append `## TD-11 return` at the end of this record with the census (item 1), the state design and the frozen-array choice (item 2), the equivalence and counter cases with their numbers before and after (item 3), the boundary statement (item 4), the lane table (item 6), and any stops. Nothing above your section is edited.

## TD-11 return

Worker: Opus 5.5, fresh context. Base `d826dd0fc`; this package's single commit is the next one on `main`, not pushed. Paths are relative to `build_tenants/abiogenesis/typescript/`. Head line numbers cite `d826dd0fc`; "now" cites the commit.

| Item | State | Lines at head | Lines now |
|---|---|---|---|
| 1. Census | done | `code/src/abg/worker_transport.ts:263-352` | below |
| 2. Incremental projection | done | `snapshot` `:313-337` | state `:271-278`, `snapshot` `:321-349`; `collectToolUses`, `countToolUses` and `observeLine` unchanged |
| 3. Proof | done | | `test_env/tests/m5-worker-transport.test.mjs`: head reference copy `:1118-1242`, streams and helpers `:1244-1319`, equivalence case `:1321-1360`, counter case `:1362-1423` |
| 4. Boundaries | done | | below |
| 5. Records | done, with one finding | | `build/code/src/abg/worker_transport.js` is not tracked (`git ls-files` prints nothing), so no build output is committed. See the finding on the two regenerated digest files. |
| 6. Lanes | done | | below |

**Item 1. Census.**

Universe: every expression in `code/src` and in the eleven lanes that reads one of the six members from an object that `observe`, `finish` or `observeWorkerTransportOutput` returned (traced by reading), plus a name grep of the six members in `code/src` for the readers of retained copies. Head lines.

First-hop readers of a `StructuredObservation`:

| Reader | Members | Cut |
|---|---|---|
| `abg/actor_process.ts:1252-1256` (native stdout callback; observer made at `:1073`) | `progressEventCount`, `finalOutput` | per chunk |
| `abg/worker_transport.ts:354-358` `observeStructuredOutput` | discards the `observe` snapshot, returns the `finish` snapshot | finish |
| `abg/worker_transport.ts:482-487` `observeWorkerTransportOutput` | returns the `finish` snapshot; callers are tests only | finish |
| `abg/worker_transport.ts:564-577`, `:578`, `:603-605`, `:635-639` `executeWorkerTransport` | `finalOutput` (`:578`); `structuredEventCount`, `toolCallCount`, `apiRetryCount` into `classifyWorkerTransportFailure` (`:603-605`); all six into the result body (`:635-639`), canonical transport bytes (`:651`) and the deep-frozen result (`:653`) | finish, one-shot observer over the complete result-bearing stdout |
| `abg/m03/transport.ts:3` | `export *` of the module, so the observer is public in group `abg.contract.abg.transport` | none |
| `m5-worker-transport.test.mjs:107`; `:109-125` | `finalOutput` per chunk; `finalOutput`, `toolCallCount` at finish | per chunk; finish |
| `t287-management-supervision.test.mjs:26-30`, `:44-51`, `:54` | `structuredEventCount`, `apiRetryCount`, `progressEventCount`, `toolCallCount`, `toolInvocations[0].toolUseRef`, `finalOutput`; `:51` deep-equals the whole finish snapshot at chunk widths 1, 7, 103 and all | finish |
| `t287-management-supervision.test.mjs:89-93` | `progressEventCount` | per chunk |
| `t287-management-stream-drain.test.mjs:153`, `:177-180` | `progressEventCount`, `finalOutput` | per chunk |
| `t287-default-library.test.mjs:297` | `finalOutput` | finish |

Later, from a retained snapshot: the `WorkerTransportResult` members copied at `worker_transport.ts:635-639` are read at `actor_process.ts:1127`, `:1151`, `:1163-1167` and travel into the actor process observation. Records carrying the same member names are read at `actor_process.ts:428-431`, `:473-475`, `:539-542`; `abg/c_call.ts:1824-1827`, `:1972-1975`, `:2032-2034`, `:2098-2101`, `:3856-3859`, `:6636-6642`, `:6736-6739`; `abg/instruction_assembly.ts:398`, `:447`, `:1121`, `:1146`; `abg/worksite_construction_recovery.ts:248-249`, `:282`; `abg/transport_contracts.ts:72-86`; `implementation/qualification.ts:48`; `implementation/semantic_stage.ts:67`; `implementation/default_library.ts:79`; `implementation/worksite_command_execution.ts:263`, `:276`; `implementation/semantic_revision.ts:64`, `:101`; `implementation/worksite_construction.ts:176`; `product/worksite_command_execution.ts:2123`, `:2130`, `:2153`. These are name matches on retained records. I did not trace each one back to the finish snapshot. All of them read values; none compares array identity.

No production reader reads `toolCallCount` or `toolInvocations` from a per-chunk snapshot. The only per-chunk reader in production reads `progressEventCount` and `finalOutput`. At head, every chunk still paid for the full tool projection.

`rawToolInvocations` and `rawToolCallCount` are closure state of the observer and have no reader outside it. They are declared at `:269-270`, written at `:292-293`, and read in `snapshot` at `:316` and `:325`. Now they are written at `:300-301`, read by the cursor fold at `:322-323`, and read for the unevidenced rule at `:339`.

**Counted work at head.** The measure is the number of `find` predicate calls during each `observe`, over N complete `tool_use` rows with distinct refs, one per chunk. Measured by a scratch run of the head build (`d826dd0fc`) before any change:

| N | total over the N observes | the last observe | closed form (N−1)N(N+1)/6 |
|---|---|---|---|
| 1 | 0 | 0 | 0 |
| 64 | 43,680 | 2,016 | 43,680 |
| 512 | 22,369,536 | 130,816 | 22,369,536 |

The k-th observe makes k(k−1)/2 comparisons, so the life total is cubic. See the errata.

**Item 2. State design.** The state lives in the same observer closure (`:271-278`):
- `foldedToolInvocationCount` is a cursor into `rawToolInvocations`.
- `firstSeenToolInvocations` is a `Map` from `toolUseRef` to that ref's first-seen unique row.
- `toolInvocations` holds the unique rows in first-seen order.
- `conflictingToolUseRef` is a sticky flag.
- `frozenToolInvocations` holds the last frozen array.

`snapshot` (`:321-349`) folds only `rawToolInvocations[folded..]`:
- A ref not yet seen becomes `deepFreeze({ ...row, ordinal: toolInvocations.length })`. This is head's expression, with the same ordinal and key order. The row is put into the map and the list.
- A ref already seen is compared with its first-seen row on `toolName`, `inputDigest` and `inputByteLength`, as at head. A difference sets the flag.

The raw row count is `rawToolInvocations.length`. `collectToolUses` still appends to it, unchanged, so the `+ 1` expression is head's text.

Why fold at the cut and not inside `observeLine`: `observeLine` returns early for a retry row (head `:281`, now `:289`) and for a non-success `result` under structured output (head `:301`, now `:309`). A cursor over the raw array admits every collected row whichever path the line took, and it leaves `collectToolUses` and `observeLine` untouched.

**Frozen-array choice.** A cut forms a new array, `Object.freeze(toolInvocations.slice())`, only when the unique count grew since the previous cut. Otherwise it returns the previous frozen array. Rows are frozen when they are inserted, so the array is deeply frozen without being walked again (`isDeeplyFrozen` holds at every cut in the equivalence case).
- A cut with no new raw tool row reads no tool state.
- Each new raw row costs one `Map` lookup.
- A new first-seen row also costs one copy of U references, and no row field is read.
- With one new tool row per chunk, those reference copies still total N(N+1)/2 over a life. This is the "one new frozen array per snapshot" the activation accepts. Successive snapshots may now share one array. At head they never did. Values are equal; no reader compares identity.
- The returned `StructuredObservation` object itself stays unfrozen, as at head (`:326`). See the errata.

**Item 3. Proof** (`m5-worker-transport.test.mjs`).

(a) Equivalence (`:1321`).
- `headWorkerTransportOutputObserver` (`:1165`) is head's observer transcribed from `d826dd0fc` (`:154-210`, `:239-352`) over the built shared helpers.
- Three streams of 20 to 23 lines share 18 common rows:
  - retries, one carrying a nested `tool_use` (excluded);
  - thinking progress;
  - `stream_event` partial tool blocks (excluded);
  - two `tool_use` blocks in one line;
  - a non-BMP character;
  - an equal duplicate;
  - a Bash duplicate differing only in `description` (no conflict);
  - `StructuredOutput`;
  - malformed, blank, array and string rows;
  - a failed `result` carrying a nested `tool_use` (collected);
  - a successful `result` with `structured_output`.
- `conflict` adds a differing input and a differing name under one ref, and ends with a newline.
- `unevidenced` adds a `tool_use` without an id, a Bash input without `command`, and a `tool_use` without `input`. It ends in a partial final success line with `structured_output`, which `finish` drains.
- `plain` ends in a partial final success line without `structured_output`.
- Each stream runs under `structuredOutputExpected` true and false, split at every width from 1 to its full length and at 16 seeded random splits. The random splits mix chunks of 1 to 7 and 1 to 300 characters. Width 1 splits inside the surrogate pair.
- That is 12,394 splittings and 145,530 cuts (each `observe` and each `finish`).
- At every cut the case asserts:
  - `JSON.stringify` equality (key order);
  - `deepStrictEqual`;
  - equal `Object.isFrozen` of the outer object;
  - `isDeeplyFrozen(toolInvocations)` for both.
- After `finish`, every retained snapshot is compared again with its reference, and the finish snapshot with a one-chunk run.
- Literal checks:
  - ordinals 0..U−1;
  - no `toolu_retry`;
  - `toolu_so` present only when structured output is not expected;
  - `toolu_failed` present;
  - `apiRetryCount` 2;
  - `toolCallCount` = U + 1 for `conflict` and `unevidenced` and U for `plain`;
  - the conflict refs in order;
  - the three `finalOutput` selections.
- Mutation check on the build, in scratch and then restored. With `conflictingToolUseRef` never set, or the frozen array refreshed only once, or the raw ordinal and key order kept, the case fails. A no-op edit passes.
- Run time is about 2.7 s.

(b) Counter (`:1365`).
- During each `observe` the case spies on `Array.prototype` `find`, `findIndex`, `findLast`, `findLastIndex`, `some`, `every` and `filter`, counting callback calls on tool-evidence rows. It also spies on `Map.prototype` `get` and `has`, counting lookups of the case's tool refs. All spies are restored in `finally`.
- The in-lane reference copy gives the head figures. They equal the scratch run on the real head build above.

| N | head total | head, last observe | now total | now, max per observe |
|---|---|---|---|---|
| 1 | 0 | 0 | 1 | 1 |
| 64 | 43,680 | 2,016 | 64 | 1 |
| 512 | 22,369,536 | 130,816 | 512 | 1 |

Now every observe makes exactly one lookup: the first-seen check of its one new row. A `stream_event` chunk after 64 tool rows makes zero visits. The lane asserts the closed forms for head and the per-observe value 1 for now.

**Item 4. Boundaries**, read on the diff (`worker_transport.ts`, 26 lines, all inside `createWorkerTransportOutputObserver`) and checked by the lanes:
- No admitted progress or tool row is dropped or reordered. `observeLine`, the framing loop, `progressEventCount` and the raw append are unchanged, and the unique list is head's first-seen order with head's ordinals.
- `toolCallCount`'s `+ 1` rule is head's expression over the same flag and the same raw count.
- `countToolUses` (`:239`), `collectToolUses` (`:171`) and the partial-block rule (head `:289-294`, now `:297-302`) are byte-identical.
- `actor_process.ts`, the probe policy, `shared/`, `WorkerToolInvocationEvidence`, the `StructuredObservation` shape, event payload keys and failure classes are untouched.

**Item 6. Lanes.** Results are tests/pass/fail/skipped. Logs are in the Worker's scratch, `td11/before` and `td11/after`.

| Check or lane | Before (`d826dd0fc`) | After |
|---|---|---|
| `npm run build` | exit 0; no tracked file regenerated | exit 0; two digest files regenerated (finding below) |
| `npx tsc --noEmit -p tsconfig.json` | exit 0 | exit 0 |
| `npm run lint:imports` | exit 0, 28 modules | exit 0, 28 modules |
| `npm run lint:lifecycle` | exit 0, 284 modules, 10 allow-listed, no offender | the same |
| `m5-worker-transport` | 21/21/0/0 | 23/23/0/0 — the two TD-11 cases added; both pass |
| `t287-default-library` | 20/17/0/3 | 20/17/0/3 |
| `t287-declared-testing-capability` | 7/5/1/1 | 7/5/1/1 — same red: `:174` "exact selected RC7 companion release-record directory is required" (`:177`); same skip |
| `t287-f04a-probabilistic-result-candidate` | 2/1/1/0 | 2/1/1/0 — same red: `:356`, `'World'` against `'Hello Ada'` at `:710` |
| `t287-lifecycle-failure-carrier` | 5/5/0/0 | 5/5/0/0 |
| `t287-management-stream-drain` | 8/4/0/4 | 8/4/0/4 |
| `t287-management-supervision` | 5/4/1/0 | 5/4/1/0 — same red: `:105`, `product_install_refusal` / `dependency_lock_mismatch` at `:106` |
| `t287-native-workspace-work` | 38/37/0/1 | 38/37/0/1 |
| `t287-management-context` | 14/12/0/2 | 14/12/0/2 |
| `t287-owned-process-lifetime` | 18/18/0/0 | 18/18/0/0 |
| `t288-instruction-assembly-owner` | 11/4/0/7 | 11/4/0/7 |

No lane reported a cancelled test. The failing and skipped test names, compared line by line, are the same before and after (21 lines). Each of the three red lanes fails at head with the same assertion.

**Item 5 finding: build digests.**
- `npm run build` regenerated `contracts/capabilities/capability-definition-graph.json` (`graphDigest`) and `product-toolchain-manifest.json` (its `contentDigest`). At head it regenerated nothing.
- The Grant names only `worker_transport.js` among build outputs, and says "No other file". Earlier grants added "build outputs `npm run build` regenerates".
- I left both files modified and unstaged in the working tree, not committed. They are the Executive's to commit.

**Errata.**
1. The activation and the register say a worker with N tool rows pays "about N²/2 old-row visits over its life". Counted as `find` comparisons, which is item 1's measure, the life total is (N−1)N(N+1)/6, which is cubic: 22,369,536 at N = 512. N²/2 is the count of raw rows revisited, N(N+1)/2, or the last observe's comparisons, N(N−1)/2.
2. Item 2 says "the returned `StructuredObservation` is deeply frozen as today". At head only `toolInvocations` and its rows are frozen; the outer object is a fresh plain object (`:326`). I kept head's behaviour, and the equivalence case asserts outer frozenness equal to head's at every cut.
3. Line drift in the activation: at head, `createWorkerTransportOutputObserver` is declared at `:264` (its doc comment is at `:262-263`), and `observe` spans `:338-346`.

**Stops.** None.

## TD-11 disposition (Executive, 2026-10-24)

Accepted at `3c91f5200`. Executive check on that head: `tsc --noEmit` clean; both lints; `npm run build` rc 0; `m5-worker-transport` 23/23; `t287-owned-process-lifetime` 18/18; `t287-native-workspace-work` 38/37/0/1; `t287-management-context` 14/12/0/2; `t287-lifecycle-failure-carrier` 5/5 (`exec_check_TD11.log`). The two tracked digest files the build regenerates (`contracts/capabilities/capability-definition-graph.json`, `product-toolchain-manifest.json`) are committed with this disposition, as TD-14's commit carried them; the Grant had not named them.

The Return meets the contract. The observer keeps a cursor into the raw rows, a map from `toolUseRef` to its first-seen row, the unique rows in first-seen order and a sticky conflict flag; a cut folds only the raw rows after the cursor and forms a new frozen array only when the unique count grew (rows are frozen at insertion). The only production reader of a per-chunk snapshot (`actor_process.ts:1252-1256`) reads `progressEventCount` and `finalOutput`; `rawToolInvocations` and `rawToolCallCount` are read inside the observer only. Old-row visits over a worker's life fall from (N−1)N(N+1)/6 `find` comparisons (22,369,536 at N = 512) to one map lookup per raw row (512), and a chunk without a tool row makes none. The equivalence case drives a copy of head's observer and the new one over three streams in both structured-output modes, cut at every chunk width plus sixteen seeded random splits (12,394 splittings, 145,530 cuts), and fails under each of three injected faults. Eleven lanes identical before and after; `m5-worker-transport` 23/23 with the two new cases. Three lanes red at head and after with the same identities, none in H's log: `t287-declared-testing-capability` (the RC7 companion release-record directory), `t287-f04a-probabilistic-result-candidate` (`'World'` where `'Hello Ada'` was expected), `t287-management-supervision` (`dependency_lock_mismatch`); attributed to the head run, as TD-13 and TD-14 did for their lanes outside the three named sources.

Errata ruled: the activation's "about N²/2" undercounted; the cubic count stands as the Return measured it. "Deeply frozen as today" overstated head, which freezes the rows and the array and not the outer object; head's behavior is kept and asserted at every cut. The line drift is noted. No stops.

Register: TD-11 closed at `3c91f5200`.

## TD-08 activation (Executive, 2026-10-24; worksite currentness support acquired once per basis)

Debt (register TD-08): `worksiteBasisMayEstablish` (`abg/calculus/axioms.ts:543-563`), called from the `basis_admitted` axiom at `:660` for every worksite file-replace basis, walks every prior event; for each cause of the four kinds it filters `before` at `:546` (a full scan of `priorEvents`), then calls `worksiteTransitionForResult(cause, before)` (`:452`) or `projectWorksiteSelectedOccurrence(cause, before)` (`c_call_outcome.ts:237`, which filters `priorEvents` by ordinal again at `:246` and resolves each match by scanning the result), and `nativeWorkPhysicalScope(cause, before, …)` (`:512`; for a native-work result a `priorEvents.some` over `c_call_evidenced` at `:529`). The support work for one basis admission is the cause count times the prior list, and it is repeated for every basis admitted in the same prefix. The calculus owner already keeps a memoized per-prefix `RuntimeEventIndex` (`event_prefix.ts:734-742`; keys such as `worksite-observation-dependency`, `aggregate:c_call:<ref>`, `basis:<ref>`; ordinal range `through(key, ordinal)`), which `eventCalculusDependencies` (`event_calculus.ts:90-111`) uses to select a located prefix's exact dependencies, while a validated prefix passes the whole prior list (`:95`).

Items.

1. Census first. Every caller of `worksiteBasisMayEstablish`, `worksiteTransitionForResult`, `projectWorksiteSelectedOccurrence`, `nativeWorkPhysicalScope` and `retiredWorksiteObservations`, with the `priorEvents` each passes (the whole prior list, a located dependency set, or an explicit `before`) and whether that list is ordered by `admissionOrdinal` (the line that guarantees it, or a counterexample). The counted work at head: with one worksite subject carrying N successive file-replace causes (each a selected fibre and an admitted result) and then one basis admission, the prior-event visits made by `worksiteBasisMayEstablish` and the helpers it calls, for N in {1, 32, 256}, measured by a counter in the test (a counting proxy over the prior list is acceptable); the same with N causes on an unrelated subject under another root.
2. Retire the repeated per-cause scan in this one path. `before` becomes an ordinal-ordered prefix view (a slice at the cause's position when item 1 shows the list ordered; one sort per call otherwise). The per-cause supports are served from support acquired once per `worksiteBasisMayEstablish` call inside the calculus owner: the existing per-prefix `RuntimeEventIndex` when `ownedPrefix` is present, or one index built over `priorEvents` for the call. The support is immutable and lives for the call or for the immutable prefix (`runtimePrefixComputation`, as today); nothing treats old history as fresh physical truth. The result (`lastCause`, `lastEstablishment`, the boolean) is identical for every input; the causal relation semantics are preserved exactly, including `Math.max` over out-of-order causes if item 1 finds any.
3. Proof, in `test_env/tests/t287-native-work-currentness-consumers.test.mjs` (generators in its support `t287-native-work-currentness-consumers.mjs` if needed): (a) the equivalence case: head's `worksiteBasisMayEstablish` (a copy kept in the test as the reference) and the new one agree over the U1 fixture (`createU1Fixture`) and over generated histories covering cross-Run isolation (a cause in another Run), path isolation (a cause on another path under the same root), unknown affectedness (`actor_process_termination_unconfirmed` and a `transport_exception` failure, with and without a native task), withdrawal (a failure after an establishment), later re-establishment, and rollback (a fold from a shorter cut agrees with the cold fold at that cut); (b) the counter case of item 1 after the change: visits per basis admission grow with the causes on that subject's root and path and not with N causes on an unrelated subject (TD-06's counter in `t287-calculus-fold.test.mjs:210-265` is the pattern).
4. Boundaries kept, by reading and by the lanes: `eventCalculusDependencies` and the located dependency selection unchanged; the `basis_admitted` axiom's effect refs unchanged; the `RuntimeEventIndex` keys unchanged unless item 2 needs one more, in which case the index owner's lanes stay identical and the Return names the key; no memo survives its prefix.
5. Records. No design edit is expected; if the calculus design names the dependency acquisition, cite the sentence and state whether it still holds. The register row is the Executive's.
6. Lanes. `tsc --noEmit`, `lint:imports`, `lint:lifecycle`, `npm run build`; before and after: `t287-native-work-currentness-consumers`, `t287-native-workspace-work`, `t287-native-work-reacquisition`, `t287-native-work-unknown-effect`, `t287-native-worksite-execution`, `t287-calculus-fold`, `t287-exact-prefix-projection-reuse`, `forward-command-contracts`, `m5-event-calculus-runtime` (five red at head, H log `:786`), `t287-ordered-reconstruction` (red at head, H log `:1371`), `t287-c2-owner-coordinate-reuse` (red at head, H log `:1088`); tests/pass/fail/skipped, the same red identities before and after or the difference named.

Grant: `code/src/abg/calculus/axioms.ts` (the worksite currentness functions only: `worksiteBasisMayEstablish`, `worksiteTransitionForResult`, `nativeWorkPhysicalScope`, `retiredWorksiteObservations`, `projectWorksiteFailureResultRequest`, and a private support helper beside them), `code/src/abg/c_call_outcome.ts` (`projectWorksiteSelectedOccurrence` only), `code/src/abg/event_prefix.ts` (`RuntimeEventIndex` only if a key must be added), `test_env/tests/t287-native-work-currentness-consumers.test.mjs` and `test_env/tests/t287-native-work-currentness-consumers.mjs`, the tracked files `npm run build` regenerates (`contracts/capabilities/capability-definition-graph.json`, `product-toolchain-manifest.json`, any tracked file under `build/code/src`), and this record (append only, your section). No other file.

Stop (write the counterexample and the blocking line in the Return, keep the rest moving): any change to an axiom's effect refs, a fluent name, an event payload key or a failure class; any change under `shared/`; a cache keyed by anything other than the immutable prefix or the call; a change to `eventCalculusDependencies`' selection; a lane whose red identities change.

Return contract: one commit on `main` with the first line `TD-08: worksite currentness support acquired once per basis; the per-cause scans retired` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Add only the files you changed; no `git add -A`. Append `## TD-08 return` at the end of this record with the census (item 1), the support design (item 2), the equivalence and counter cases with their numbers before and after (item 3), the boundary statement (item 4), the lane table (item 6), and any stops. Nothing above your section is edited.

## TD-08 return

Worker: Opus 5.5, fresh context. Base `7e2425376`; this package's single commit is the next one on `main`, not pushed. Paths are relative to `build_tenants/abiogenesis/typescript/`. Head line numbers cite `7e2425376`; "now" cites the commit.

| Item | State | Lines at head | Lines now |
|---|---|---|---|
| 1. Census | done | `code/src/abg/calculus/axioms.ts:539-563` | below |
| 2. Support acquired once | done, with two deviations from the activation's wording (reasons below): the support is always one call-local index over the caller's list, never the `RuntimeEventIndex` of `ownedPrefix`; `before` is the cause's joined sub-list in list order, not a slice or a sort | `worksiteBasisMayEstablish` `:539-563` | `WorksiteCause` `:539-548`, `worksiteCauseSupport` `:562-645`, `worksiteBasisCauseOrdinals` `:651-685`, `worksiteBasisMayEstablish` `:688-691`; the other four Grant functions and `c_call_outcome.ts` unchanged |
| 3. Proof | done; 3(b) holds for the joins, not for total visits (stop below) | | `test_env/tests/t287-native-work-currentness-consumers.test.mjs`: head reference `:1080-1124`, equivalence case `:1126-1213`, counter case `:1215-1256`; support generators `test_env/support/t287-native-work-currentness-consumers.mjs:385-594` |
| 4. Boundaries | kept | | below |
| 5. Records | done, no design edit; one pointer finding | | below |
| 6. Lanes | done; red identities identical | | below |

**Item 1. Census.**

Production callers, by reading `code/src`. Head lines.

| Callee | Caller | List passed | Ordered by `admissionOrdinal`? |
|---|---|---|---|
| `worksiteBasisMayEstablish` | `basis_admitted` axiom, `axioms.ts:660` (now `:789`), with `history?.prefix` | the axiom's dependency list | From the fold, yes. A validated prefix passes `prior` (`event_calculus.ts:95`); the derivation pushes it in fold order (`:259`) over a prefix whose ordinals are checked gap-free (`event_prefix.ts:550`). A located prefix passes the selected subset sorted at `event_calculus.ts:135`. From public `eventCalculusEffect(event, priorEvents)` (`axioms.ts:1698`) and `foldStep(state, event, dependencies)` (`fold.ts:275`), no: both take the caller's list as given. Counterexample: the shuffled and reversed lists of the TD-08 equivalence case are accepted and evaluated. |
| `worksiteTransitionForResult` | `projectWorksiteTransitionForResult`, `axioms.ts:446` | caller's list | Its callers pass prefix lists filtered by ordinal: `replay.ts:1217-1220` (sorted dependencies or the prefix's events), `worksite_revision.ts:411`, `:570`, `:580`, `:685`, `:733`. Yes. |
| | cause loop, `axioms.ts:547` | head `before` = `priorEvents.filter(< cause)` (`:546`) | iff the axiom's list is |
| | result axiom, `axioms.ts:923` | the axiom's dependency list | as for `:660` |
| `projectWorksiteSelectedOccurrence` (`c_call_outcome.ts:237`, filters again at `:246`) | cause loop, `axioms.ts:548` | head `before` | iff the axiom's list is |
| | fibre axiom, `axioms.ts:784` | the axiom's dependency list | as for `:660` |
| | `projectWorksiteFailureBasis`, `c_call_outcome.ts:333` | `projectWorksiteFailureResultRequest`'s list filtered at `:386` | iff its caller's list is |
| | `native_worksite_execution.ts:237`, `event_calculus.ts:347` | `worksiteSelectedOccurrenceDependencies(prefix, e)` | yes, sorted at `c_call_outcome.ts:356` |
| `nativeWorkPhysicalScope` | `projectNativeWorkRetiredObservations`, `axioms.ts:509`; called by the unknown-effect axioms `:865`, `:896` and the result axiom `:944` with `history?.prefix` | the axiom's dependency list | as for `:660` |
| | cause loop, `axioms.ts:556`, with `validatedRuntimeEventPrefixBeforeEvent(ownedPrefix, cause.eventId)` per cause | head `before` | iff the axiom's list is |
| `retiredWorksiteObservations` | `axioms.ts:510`, fibre axiom `:787`, result axiom `:924` | the same list as the caller above | as for `:660` |
| `projectWorksiteFailureResultRequest` (`c_call_outcome.ts:361`) | `worksiteTransitionForResult`, `axioms.ts:464`; `native_worksite_execution.ts:246` | caller's list; `worksiteFailureResultDependencies` | as its caller; yes, sorted at `c_call_outcome.ts:420` |

Every fold route delivers an ordered list. The two public entries do not guarantee order, so `Math.max` stays (`axioms.ts:667`, `:669`, `:682` now).

**Counted work.** One basis admission on `first/target.txt`. Subject: N authenticated C0 file replacements on that subject (each one opened row, one F_D fibre, one evidence row, one Result), then the basis. Unrelated: N C0 replacements on `target.txt` under a second root, then one on the subject, then the basis. A visit is one run of property reads on one row of the dependency list (a counting proxy, `eventVisitCounter`, support `:402-413`). The Head column is the head build `7e2425376` measured in this harness before the change; the test's head reference reproduces it exactly (asserted). "Owned" passes a validated owned prefix over the same rows, its index warmed first, as in the fold; Head, owned is the head reference so run.

| N | Scenario | Rows | Causes | Head | Head, owned | Now | Now, owned | Acquisition | Joins | Boundary |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | subject | 32 | 3 | 588 | 611 | 135 | 140 | 32 | 103 | 5 |
| 1 | unrelated | 38 | 5 | 1,215 | 1,254 | 141 | 150 | 38 | 103 | 9 |
| 32 | subject | 218 | 65 | 73,996 | 74,673 | 3,514 | 3,643 | 218 | 3,296 | 129 |
| 32 | unrelated | 224 | 67 | 78,219 | 78,916 | 327 | 460 | 224 | 103 | 133 |
| 256 | subject | 1,562 | 513 | 3,917,388 | 3,924,241 | 27,930 | 28,955 | 1,562 | 26,368 | 1,025 |
| 256 | unrelated | 1,568 | 515 | 3,947,595 | 3,954,471 | 1,671 | 2,700 | 1,568 | 103 | 1,029 |

- Acquisition: the visits of the support pass alone. It equals the row count at every point: each row is read once.
- Joins: now minus acquisition.
- Boundary: now with an owned prefix minus now without one. It equals 2 × causes − 1 at every point, as asserted.

At head, visits grow as causes × rows. Unrelated causes cost the same as subject causes.

**Item 2. Support design.**

- `worksiteCauseSupport(priorEvents, canonicalRoot, relativePath)` makes one pass over the caller's list. It records:
  - each row a C0 join can select, under its kind, one field and that field's value (nine selectors);
  - each basis row's four links: invocation, implementation set, parent basis, binding artifact;
  - the causes of the four kinds, in list order;
  - `subjectBases`: the bases whose raw request names the subject;
  - `subjectCalls`: the calls whose evidence request names the subject, plus the calls whose fibre has a subject basis. This second source exists because a failure Result's request is its fibre's basis request (`c_call_outcome.ts:331-333`).
- `before(cause)` returns the rows of the cause's own joins with ordinal below the cause, deduplicated, in list order:
  - for a fibre: its basis, opened row and fibre rows, plus each basis row's linked rows;
  - for a Result: its evidence rows, and for a failure Result also the fibre support of each fibre of its call.

  That is the sub-list of head's `before` that the helpers can select. Every read the helpers make of their list is a filter or exact match on a kind and one field equal to one value:
  - `c_call_outcome.ts:175-179`, `:196-214`, `:247-252`, `:256-260`, `:270`, `:282-284`, `:331`, `:368`, `:386`;
  - `axioms.ts:468-475`, `:529`.

  The helpers are called unchanged on that sub-list.
- `worksiteBasisCauseOrdinals` walks the causes once:
  - It joins a Result only when its call is in `subjectCalls`. A Result outside that set has a request that cannot be the subject's, so the match at `:665-666` cannot hold.
  - It joins a fibre only when its basis is in `subjectBases`.
  - It calls the native scope for a Result only when its task root is the subject's root.
  - Unknown-effect causes keep head's call: the cut of `ownedPrefix` when it is present (the task owner then ignores the list), otherwise head's filtered list.
  - The two `Math.max` updates and the final comparison are head's.
- **Boundary refusal kept.** At head, `validatedRuntimeEventPrefixBeforeEvent(ownedPrefix, cause.eventId)` ran for every cause and refused a cause absent from `ownedPrefix`. Now:
  - for a validated prefix, an `id:` lookup (`runtimeEventAtPrefix`) does that refusal for every cause, and the cut is built only where it is read;
  - for a located prefix, the cut is still built per cause (finding 3).
- **Lifetime.** The support lives for the call. No memo is added. The `RuntimeEventIndex` is read only through the existing `id:` key and the existing cut.
- **Why not the `RuntimeEventIndex` of `ownedPrefix`.** It is not the dependency list. Counterexample: `foldStep(emptyFoldState(source), basis, [])` where `source` holds a C0 Result on the subject.
  - Head reads the empty list: `lastCause = 0`, true, so `worksite_observation_current` is initiated.
  - Reading the index finds the Result: false, so that fluent is not initiated.
  - That changes the axiom's effect refs, which is a Stop.

  Design `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:189` says an entry reads "the event, its declared dependencies and the fold's own facts". The variant "no dependencies, owned" in the equivalence case pins this input.
- **Why not a slice or a sort.** A slice, or a sort to make a slice possible, still hands each helper the whole `before`, so the work stays causes × rows. The joined sub-list is what retires the scan.

**Item 3. Proof.**

(a) Equivalence: `TD-08 (a)`, test `:1126-1213`. Two generated histories: preflight fixture rows, and actual EventStore admissions over the U1 store fixture. Both are built on `createU1Fixture` with a second root. The steps are:

- a native observation Result changing the subject;
- an establishment;
- a basis whose predecessor is stale;
- C0 on another root and the same path;
- C0 on the same root and another path;
- C0 in another Run;
- a post-publication failure Result (withdrawal);
- re-establishment in another Run;
- a selected fibre with no Result.

Then, for `actor_process_termination_unconfirmed` and for an `actor_invocation_failed` `transport_exception`: a re-establishment, then the cause in another Run, without a native task, and with the U1 native task.

A basis is admitted on `first/target.txt`, `first/keep.txt` and `second/target.txt` at every step, plus one basis that is not a worksite request.

Each basis is evaluated by the head reference and by the new code over these lists:

- ordered;
- shuffled;
- reversed;
- every row twice;
- with the owned historical cut;
- with an owned cold prefix;
- shuffled with the owned cut;
- no dependencies, with and without the owned cut;
- causes absent from the owned prefix.

The store history adds the located `eventCalculusDependencies` subset with its located cut, and the same subset with causes absent.

Each comparison is a deep equality of `{ordinals: {lastCause, lastEstablishment} | null, value}`, or of the refusal message.

- Total: 1,034 comparisons, all equal. Both values occur. Both refusal routes occur: validated, and located.
- The case also asserts what the steps decide:
  - the native change, the stale predecessor, the withdrawal, the selected fibre and each unknown cause with the native task make the subject false;
  - establishment and re-establishment make it true;
  - unknown causes in another Run or without a task leave it true;
  - the other root and the other path are unaffected.
- Rollback: after the full fold, the fold of the cut through each basis equals the cold fold at that cut, for every basis.
- Mutation check, scratch run on the built module (restored after). Each of these mutations fails the case at its first divergent basis:
  - dropping the boundary lookup;
  - dropping the failure Result's fibre support;
  - dropping `subjectCalls` from fibres.

(b) Counter: `TD-08 (b)`, test `:1215-1256`. It produces the table above and asserts:

- the head reference equals the head build at all six points;
- the new ordinals equal head's, with and without the owned prefix;
- the subject is established;
- acquisition equals the row count;
- unrelated joins are 103 at N = 1, 32 and 256;
- subject joins increase with N;
- the boundary equals 2 × causes − 1.

**Item 4. Boundaries.**

- Unchanged in the diff: `event_calculus.ts` (so `eventCalculusDependencies` and the located selection), `event_prefix.ts` (so the `RuntimeEventIndex` and its keys), `c_call_outcome.ts`, `shared/`.
- The `basis_admitted` axiom body (`:788-800` now) is unchanged. Its input boolean equals head's on every compared input, and the folds through every basis equal their cold folds. So its effect refs are unchanged on the compared inputs.
- No fluent name, payload key or failure class is touched.
- No export is added. The tests read the private names from the built module (`builtModuleExports`, support `:388-397`).
- No memo or module state is added, so nothing survives its prefix or its call.

**Item 5. Records.**

- Design `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:189` ("an entry reads the event, its declared dependencies and the fold's own facts that `axiomEffectOf` receives…") is the sentence on the axiom's reads, and it still holds. The basis entry reads its event and its declared dependency list, which it now acquires once per call. It reads the admitted source cut only for the unknown-effect task and the boundary refusal.
- `:284` ("an admitted event in prefix order with its declared dependencies") also holds.
- No design names the per-cause support, so there is no design edit.
- Finding: the design's line pointers into `axioms.ts` move with this change. The design is outside the Grant and was not edited.
  - `:189` cites `:1722` and `:1731`. These were already off at head: `AxiomFoldContext` was `:1728` and `axiomEffectOf` `:1737`. Now they are `:1857` and `:1866`.
  - `:191` cites `ownedExactRuntimeFluentPatternRef` at `:1602`. That was exact at head; it is now `:1731`.
  - `:203` (`:208-250`) is unaffected.
- `npm run build` regenerated `contracts/capabilities/capability-definition-graph.json` and `product-toolchain-manifest.json` (digests only). No tracked file under `build/` changed.

**Item 6. Lanes.** Checks before and after: `npm run build` rc 0; `tsc --noEmit` rc 0; `lint:imports` rc 0 (28 modules); `lint:lifecycle` rc 0 (284 modules, 10 allow-listed, no offender). Lanes, tests/pass/fail/skipped:

| Lane | Before | After |
|---|---|---|
| `t287-native-work-currentness-consumers` | 2/2/0/0 | 4/4/0/0 (the two TD-08 cases added) |
| `t287-native-workspace-work` | 38/37/0/1 | 38/37/0/1 |
| `t287-native-work-reacquisition` | 9/6/0/3 | 9/6/0/3 |
| `t287-native-work-unknown-effect` | 10/10/0/0 | 10/10/0/0 |
| `t287-native-worksite-execution` | 6/3/0/3 | 6/3/0/3 |
| `t287-calculus-fold` | 12/12/0/0 | 12/12/0/0 |
| `t287-exact-prefix-projection-reuse` | 2/0/1/1 | 2/0/1/1 |
| `forward-command-contracts` | 10/10/0/0 | 10/10/0/0 |
| `m5-event-calculus-runtime` | 19/13/5/1 | 19/13/5/1 |
| `t287-ordered-reconstruction` | 7/0/4/3 | 7/0/4/3 |
| `t287-c2-owner-coordinate-reuse` | 6/0/6/0 | 6/0/6/0 |

Red and skipped test identities are identical before and after, and so are the red failure messages:

- `t287-exact-prefix-projection-reuse`: 1.
- `m5-event-calculus-runtime`: 2, 12, 13, 14, 15.
- `t287-ordered-reconstruction`: 1, 2, 3, 5.
- `t287-c2-owner-coordinate-reuse`: 1 to 6.

The only count change is the currentness lane's two new tests.

**Stops.**

- 3(b), as worded: No. Visits grow with N unrelated causes in total; the joins do not.
  - Acquisition reads each row of the caller's list once (1,568 rows at unrelated N = 256), and with an owned prefix the boundary reads two rows per cause.
  - Lower bound: an exact function of an arbitrary caller list must read each row, since any unread row can be a subject cause. That is Ω(rows) per call, and the validated fold passes the whole prior list (`event_calculus.ts:95`).
  - Two routes would make the visits independent of unrelated causes, and each one meets a Stop:
    - reading `ownedPrefix`'s index instead of the list changes effect refs. Blocking line: `axioms.ts:789` with the `foldStep` counterexample above.
    - narrowing the validated dependency list changes `eventCalculusDependencies`' selection. Blocking line: `event_calculus.ts:95`.
  - Held there; the rest of the package moved.
- No other stop was met.

**Findings.**

1. Grant paths:
   - The support module is `test_env/support/t287-native-work-currentness-consumers.mjs`, not `test_env/tests/…mjs`. The support path was the one changed.
   - `projectWorksiteFailureResultRequest` is in `c_call_outcome.ts:361`, not `axioms.ts`. It was not changed.
2. The activation marks no red for `t287-exact-prefix-projection-reuse`. It is red at head: test 1, `explicit fresh proof territory required`.
3. Residual blocked by the Grant: for a located (owned or validation) `ownedPrefix`, each cause still pays `validatedRuntimeEventPrefixBeforeEvent`'s cut, which is O(1) unscoped and O(scope indices) scoped. Removing it needs an envelope-only presence lookup exported from `event_prefix.ts`. The Grant allows only a `RuntimeEventIndex` key there.
4. Residual outside the Grant: without `ownedPrefix`, an unknown-effect cause still gives `projectNativeWorkUnknownEffectTask` (`native_work_effect.ts`) the full filtered list, which it validates as a prefix. That is O(rows) per unknown cause, as at head.
5. The design pointer drift above.
6. The currentness lane now takes 37 s; it took 5 s at head. The two TD-08 cases build their histories: 23 s for (a), 8 s for (b).
7. The counter case pins the head visit counts (`TD08_HEAD_BUILD_VISITS`, test `:1221-1222`). Those counts depend on the fixture's shape, so a change to `createU1Fixture` or `createWorksiteCauseHistory` needs them re-measured from the test's head reference.

## TD-08 disposition (Executive, 2026-10-24)

Accepted at `f6bdf13bd`. Executive check on that head: `tsc --noEmit` clean; both lints; `npm run build` rc 0; `t287-native-work-currentness-consumers` 4/4; `t287-native-workspace-work` 38/37/0/1; `t287-native-work-reacquisition` 9/6/0/3; `t287-native-work-unknown-effect` 10/10; `t287-native-worksite-execution` 6/3/0/3; `t287-calculus-fold` 12/12; `t287-exact-prefix-projection-reuse` 2/0/1/1; `forward-command-contracts` 10/10; `m5-event-calculus-runtime` 19/13/5/1; `t287-ordered-reconstruction` 7/0/4/3; `t287-c2-owner-coordinate-reuse` 6/0/6/0; the four red lanes with the same identities as the Return and the head (`exec_check_TD08.log`).

The Return meets the contract. `worksiteBasisMayEstablish` now acquires one support in one pass over the caller's dependency list (`worksiteCauseSupport`, `axioms.ts:562-645`): every row a C0 join can select, keyed by kind, field and value (nine selectors), each basis row's four links, the causes in list order, and the bases and calls whose request can name the subject. Each cause is then joined over the sub-list its own joins can select (`before(cause)`), the helpers in `c_call_outcome.ts` and `axioms.ts` called unchanged on it; a C0 cause whose basis or call cannot name the subject is not joined, since the request match at `:665-666` cannot hold. Read against the helpers, every list read they make (`c_call_outcome.ts:175-179`, `:196-214`, `:247-252`, `:256-260`, `:270`, `:282-284`, `:331`, `:368`, `:386`; `axioms.ts:468-475`, `:529`) is a filter or exact match on a kind and one field equal to one value, and every basis link the fibre join follows (invocation, implementation set, parent basis, parent call, binding artifact) is one of the recorded selectors, so the sub-list holds every row the full `before` would have matched and the exact-cardinality matches are unchanged. The boundary refusal for a cause absent from `ownedPrefix` is kept (one `id:` lookup per cause on a validated prefix; the cut on a located one); the unknown-effect task reads the cut, not the list, as at head. Visits per basis admission at N = 256: subject 3,917,388 to 27,930, unrelated 3,947,595 to 1,671; the joins on an unrelated subject are 103 at N = 1, 32 and 256. The equivalence case compares a transcription of head's function with the new one over 1,034 inputs (two histories, nine dependency-list variants, the located selection, both refusal routes) and fails under each of three injected faults; the folds through every cut equal the cold folds. Eleven lanes identical before and after, the currentness lane 4/4 with the two new cases.

Two departures from the activation's wording ruled in. The support is call-local over the caller's list and never the `RuntimeEventIndex` of `ownedPrefix`: the axiom's input is its declared dependency list (design `:189`), and `foldStep(emptyFoldState(source), basis, [])` over a source holding a C0 Result on the subject shows that reading the index would change the axiom's effect refs. `before` is the joined sub-list, not a slice: a slice still hands each helper the whole prior list, so the work would stay causes times rows.

Stop 3(b) ruled. The activation asked that visits not grow with N causes on an unrelated subject; an exact function of an arbitrary caller list reads each row once, so the acquisition is linear in the list and the two routes to a flat total (reading the owned index; narrowing the validated list at `event_calculus.ts:95`) each cross a Stop. The register's closure ("counted support work grows with relevant additions instead of cause-count times the entire dependency list") is met: one pass plus joins that grow only with the subject's own causes. The item's wording is corrected to that; no further work.

Findings ruled. (3) The per-cause cut on a located `ownedPrefix` is the boundary refusal, bounded by the index and not by the list; outside the obligation, no action. (4) Without `ownedPrefix` an unknown-effect cause still has the native-work owner validate the filtered list; the fold passes `history.prefix` at `axioms.ts:789`, so only the public `eventCalculusEffect` without a context reaches it; outside the obligation, no action. (5) The design's line pointers into `axioms.ts` are corrected in this bookkeeping commit: `:189` `:1722`, `:1731` to `:1857`, `:1866`; `:191` `:1602` to `:1731`. (6) The currentness lane takes 37 s for its two history builds; accepted. (7) The pinned head visit counts are the head-build witness at this commit. The Grant-path errata (support module under `test_env/support/`; `projectWorksiteFailureResultRequest` in `c_call_outcome.ts:361`) and the unmarked red of `t287-exact-prefix-projection-reuse` (test 1, red at head, attributed to the head run) stand as the Return records them. No design edit beyond the pointers.

Register: TD-08 closed at `f6bdf13bd`.

## TD-15 + TD-16 activation (Executive, 2026-10-24; three record envelopes through the shared writer, byte for byte; the throwing I-JSON lift migrated per caller; the nine casts TD-14 held)

Debt (register TD-15, TD-16; the TD-14 carry-over). Three hand-rolled canonical record envelopes repeat the record walk `writeCanonicalRecord` owns (`shared/value/record.ts:22-38`): `completedRetryProgressPlanDigest` (`abg/retry.ts:6657-6668`, read at `:6711`), `pendingInteractionBodyDigest` (`abg/c_call.ts:7340-7355`, read at `:6216`, `:6243`, `:6264`) and `writeReplayBody` with `digestReplayBody` (`abg/replay.ts:2312-2328`, read at `:1452-1453`, where `writeReplayBody` also streams the replay state to `output.write`). Each writes `{`, the keys in `compareUnicodeCodeUnits` order as canonical JSON strings, `:`, the member, `,` between members and `}`; each streams some members itself (the retry and C_Call plans their `projectedPrefix` and `replayState` through the prefix and replay-guard owners, the C_Call plan with a validated or materialized branch for each; the replay body its `selected` row iterables as arrays). The design keeps them for digest stability (`ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:165`, `:593`). `admitIJsonValue` (`shared/i_json.ts:63-67`) is a lift over `admitJson` that throws `IJsonAdmissionError` on refusal; design D4 (`:606`; `:132`) keeps it until no caller remains. Its 22 callers in `code/src`: `validator/conformance_operation.ts:248`, `validator/raw_admission.ts:184`, `product/result_assessment_operation.ts:499`, `product/worksite_command_execution.ts:1055`, `:1058`, `:1786`, `:1787`, `:2059`, `:2112`, `abg/event_store.ts:1736`, `:2553`, `abg/execution_basis.ts:249`, `abg/witness_admission_operation.ts:435`, `abg/project_read_ports.ts:599`, `:1560`, `abg/probabilistic_result.ts:285`, `abg/actor_process.ts:370`, `:415`, `:1059`, `implementation/leaf_invocation_port.ts:695`, `:776`, `implementation/worksite_command_execution.ts:169`. `admitIJsonText` (`:115`) and `IJsonAdmissionError` are not this package's. TD-14 held nine (T) casts for this Grant: `shared/public_function_contracts.ts:753`, `:773`, `:799` (`value as Readonly<Record<string, JsonValue>>` after a `typeof`/`null` test that follows an `Array.isArray` branch) and `product/worksite_command_execution.ts:166`, `:170` twice, `:1129`, `:1461`, `:1502` (the same cast after the same manual tests, or on an array member). A realization change to `product/worksite_command_execution.ts` changes the built module, whose byte count, digest and policy-span offsets are pinned in `gtl/worksite_command_execution.ts:37-40` and `:59` and checked by `scripts/generate-product-manifest.mjs:100-104` before it rewrites `contracts/worksite/command-execution-context.inventory.json` (`:127`); repair F (`195b65ddb`) is the precedent for the refresh.

Items.

1. TD-15. Each of the three writers routes its envelope through `writeCanonicalRecord(entries, writeMember, sink)` and keeps its own member writing in `writeMember` (the owner-streamed members and their branches exactly as today; the other members through `writeCanonicalJson`). The entry set per writer is today's key set (retry: `Object.keys(plan)`; C_Call: the finite keys plus `projectedPrefix` and `replayState`; replay: `Object.keys(body)`). State, by reading `writeCanonicalJson` for a string against `JSON.stringify`, that the key bytes are identical for every key these writers can see, or show the one that differs. Proof, in `test_env/tests/t287-value-equality.test.mjs` (the value-family lane) or the owner's lane if the inputs are easier to build there: a transcription of each head writer kept in the test as the reference, and the new writer, produce the same bytes and digest over inputs the owners build (a completed retry progress plan with an owned and with a materialized `projectedPrefix` and `replayState`; a pending interaction plan on both branches of `:7349-7350`; a replay body with and without `selected`, through `digestReplayBody` and through the streaming path of `:1453`), and on a sink that throws after k parts both have emitted the same k parts for k over the whole range. A persisted digest in the repository that one of these writers produced (search `test_env/fixtures` and the tracked `test_env/uat` inputs for `planDigest` and `replayDigest`) is recomputed and equal; if none exists, say so.
2. TD-16, census first. For each of the 22 sites: the function, what the `catch` (or the absence of one) does with the thrown `IJsonAdmissionError` (the fixed refusal it returns; `null` or `false`; a rethrow; propagation to a caller, named with its catching line or the boundary it leaves `code/src` at), and whether the error's class or message is observable past the site (a message copied into a refusal, a payload, a Product response or a log line; an `instanceof` or `.code` read). The census is the first section of the Return and bounds item 3.
3. TD-16, migration. A site whose `catch` encloses only the lift and returns a fixed refusal, `null` or `false` (the message and class unobservable) consumes `admitJson`'s outcome directly: `const outcome = admitJson(value); if (outcome.kind !== "ok") return <the same refusal>;` and the `try`/`catch` is deleted (where the `try` also encloses other work, only the lift leaves it). A site where the throw is the function's contract (the error propagates to a caller that maps or records it, or leaves `code/src`) is kept with that reason and its catching line; it is not rewritten as an admit-then-throw copy. Every migrated site's malformed-value behavior is proved conserved: a function member, an unsafe integer and a lone surrogate reach the same refusal (class, code, message, return) as at head, by an existing case named per site or by one new case in the owner's lane. If no `code/src` caller of `admitIJsonValue` remains, delete it (and nothing else in `i_json.ts`); otherwise it stays, and the Return lists the remaining callers with their reasons.
4. The nine casts. `shared/public_function_contracts.ts:753`, `:773`, `:799`: `!isRecord(value)` replaces the `typeof`/`null` test and the cast, the shared `isRecord` atom inside a shared module (TD-14 disposition, stop 1). `product/worksite_command_execution.ts:166`, `:170` twice, `:1129`, `:1461`, `:1502`: each decided as TD-14 decided its sites ((T) typed through the owner type or `isRecord`; (I) admitted at ingress; (A) admitted at the site with the refusal channel the site already has) and the row added to `td-14-census.tsv` is corrected from `held` to its decision. Then the pin: `npm run build`; the built module's byte count and digest and the policy span's `startByte`/`endByte` (the offsets of `renderWorksiteCommandExecutionPrompt.toString()` in the built module; the `spanDigest` and the policy text are unchanged unless the renderer's source changed, which is a stop) replace the constants at `gtl/worksite_command_execution.ts:37-40` and `:59`; `npm run build` again passes the generator's check and rewrites the inventory. The Return states the four values before and after.
5. Boundaries kept, by reading and by the lanes: no Product contract member, event payload key, fluent name or failure class changes; the three digests are byte-identical on every input of item 1; no refusal observable at a Product boundary changes class or text; `admitIJsonText` and `IJsonAdmissionError` unchanged; `shared/` touched only at the three guards and, if its caller count is zero, the deletion of `admitIJsonValue`.
6. Records. Cite the design rows `:165` and `:593` (the three writers) and D4 `:606` with `:132` (the lift) and state what each should say after this package; the Executive edits them and the O-TYPE row's "nine (T) held" clause at acceptance. No design edit by the Worker.
7. Lanes. `tsc --noEmit`, `lint:imports`, `lint:lifecycle`, `npm run build` (the pin check passes); before and after, every lane whose test or support file imports a module you changed (by `grep -l` of the module basenames over `test_env/tests` and `test_env/support`), plus `t287-value-equality`, `m5-c-algebra-validation`, `t287-worksite-command-execution`, `forward-command-contracts`; tests/pass/fail/skipped, the same red identities before and after or the difference named; a lane red at head is attributed to H's log (`step-8-run-postclose-h.log`) by line or to the head run.

Grant: `code/src/abg/retry.ts` (`completedRetryProgressPlanDigest` and its imports only), `code/src/abg/c_call.ts` (`pendingInteractionBodyDigest` and its imports only), `code/src/abg/replay.ts` (`writeReplayBody`, `digestReplayBody` and their imports only), the enclosing functions of the 22 sites in the files named above and those files' import lines, `code/src/shared/i_json.ts` (the deletion of `admitIJsonValue` only, if no caller remains), `code/src/shared/public_function_contracts.ts` (the three guards only), `code/src/product/worksite_command_execution.ts` (its six casts and its six lift sites), `code/src/gtl/worksite_command_execution.ts:37-40` and `:59` (the pin constants only), `td-14-census.tsv` (the nine rows), the test lanes you add cases to and their `test_env/support` files, the tracked files `npm run build` regenerates (`contracts/worksite/command-execution-context.inventory.json`, `contracts/capabilities/capability-definition-graph.json`, `product-toolchain-manifest.json`, any tracked file under `build/code/src`), and this record (append only, your section). No other file.

Stop (write the counterexample and the blocking line in the Return, keep the rest moving): a byte or digest of one of the three writers differing from head on any input; a change to a Product contract member, an event payload key, a fluent name or a failure class; a refusal observable at a Product boundary changing class or text; a change to the renderer's source or the policy text; a change under `shared/` beyond item 4's three guards and item 3's deletion; a kept site whose discharge needs a function's throw contract to become a refusal return (name it; that is an Executive decision, not this package's); a lane whose red identities change.

Return contract: one commit on `main` with the first line `TD-15 + TD-16: three record envelopes through the shared writer; the I-JSON lift migrated per caller; TD-14's nine casts discharged` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Add only the files you changed; no `git add -A`. Append `## TD-15 + TD-16 return` at the end of this record with the writer equivalence (item 1), the census (item 2), the per-site decisions and proofs (item 3), the nine decisions and the pin values (item 4), the boundary statement (item 5), the records statement (item 6), the lane table (item 7), and any stops. Nothing above your section is edited.

## TD-15 + TD-16 return

Worker: Opus 5.5, fresh context. Base `cf630b55c`. This package's single commit is the next one on `main`, not pushed. Paths are relative to `build_tenants/abiogenesis/typescript/code/src/` unless they start with `test_env/`, `contracts/`, `scripts/`, `build/`, `design/` or `.ai-workspace/`. Line numbers are at head `cf630b55c` unless marked "after".

| Item | State | Evidence |
|---|---|---|
| 1. TD-15 writers | done; same parts, bytes and digest on every input, same parts for every k | case `TD-15: …` in `test_env/tests/t287-route-reconstruction.test.mjs` (after `:564-730`, test `:610`) |
| 2. TD-16 census | done; 22 sites | census table |
| 3. TD-16 migration | done; 13 sites migrated, 9 kept; `admitIJsonValue` stays (`shared/i_json.ts:112` and the 9 kept sites call it) | case `TD-16: …` in `test_env/tests/t287-runtime-failure-diagnostic.test.mjs` (after `:586-713`, test `:636`) |
| 4. Nine casts | done; all nine (T), all nine removed; pin refreshed | `td-14-census.tsv` lines 9, 11, 13, 1908, 1909, 1910, 1925, 1927, 1928 |
| 5. Boundaries | kept | Boundaries |
| 6. Records | stated | Records |
| 7. Lanes | done; same red identities before and after | Lanes |

**Item 1: writers.** Each writer hands its entries to `writeCanonicalRecord` (`shared/value/record.ts:22-38`) and keeps its own member writing in `writeMember`.

| Writer | Entries (head key set) | `writeMember` | Sink |
|---|---|---|---|
| `abg/retry.ts` `completedRetryProgressPlanDigest` (`:6657-6668`; after `:6657-6665`) | `Object.entries(plan)` (`Object.keys(plan)`) | `projectedPrefix` through `writeRuntimeEventPrefixValue`, `replayState` through `writeRuntimeReplayGuardValue`, the rest through `writeCanonicalJson` | `digest.update(part, "utf8")` |
| `abg/c_call.ts` `pendingInteractionBodyDigest` (`:7340-7355`; after `:7340-7353`) | `Object.entries(finite)` plus `["projectedPrefix", undefined]` and `["replayState", undefined]` (the finite keys plus the two names) | the two branches of `:7349-7350`, unchanged; the rest through `writeCanonicalJson` | `hash.update(part)` |
| `abg/replay.ts` `writeReplayBody` (`:2317-2328`; after `:2317-2326`); `digestReplayBody` (`:2312-2316`) unchanged and still writes through it | `Object.entries(body)` (`Object.keys(body)`) | a key in `selected`: `[`, its rows from the iterable, `,` between, `]`; the rest through `writeCanonicalJson` | the caller's `write` |

Key bytes. Head writes each key with `writeCanonicalJson(key, write)`. For a string that is one call, `write(JSON.stringify(value))` (`shared/canonical_json.ts:21-23`). `writeCanonicalRecord` writes `sink(JSON.stringify(key))` (`record.ts:34`). Both sort the keys with `compareUnicodeCodeUnits` and both write `{`, `,`, `:` and `}` as single parts at the same places. The part sequence is therefore identical for every string key, and no key the three writers can see differs. `Object.entries` takes the same own enumerable string keys as `Object.keys`. It reads each member value before the walk, where head read it during the walk. Every plan and body these writers receive is a plain data record (`deepFreeze` literals and object spreads), so no getter runs. Selected rows are still pulled lazily, inside `writeMember`.

Proof: the case is in `t287-route-reconstruction`, the owner lane whose terminal-route fixture builds the owned and materialized prefixes and replay states. `t287-value-equality` has no such fixture. The case keeps a transcription of each head writer as the reference. The built private writers run in module copies over the genuine owners, as `ownedRetryPlanDigest` (`:132-140`) does. Each copy's `node:crypto` hash records every part; with a limit k, it refuses part k+1.

| Input | Parts | Bytes | Digest (head = after) | k checked |
|---|---|---|---|---|
| retry plan, owned `projectedPrefix` + owned guard `replayState` | 2,492 | 39,150 | `sha256:58da7f22680bd531c4738eeaaffa74088f15abb7a6f45f07eb518c34de1505c3` | 0..2,492 |
| retry plan, materialized `projectedPrefix` + complete `replayState` | 2,492 | 39,150 | the same; equals `sha256Canonical` of the materialized plan | 0..2,492 |
| pending plan, 8 inputs: body path (destructure) and plan path (`planRef`), each with owned/owned, validated/complete, validated/owned guard and owned/complete (both sides of `:7349` and of `:7350`) | 2,410 or 2,418 | 37,299 | `sha256:c5cacbc99963cde40d27f651e8587b6b200eb3b5fd64c18241c33cd9ac4cc632` on all 8 | 0..N on each |
| replay body without `selected` (`digestReplayBody`, complete replay) | 331 | 4,387 | `sha256:808ec2fe21730774c15d498eb26f49d3082da52c0eba7036644a6b8f3d1a0b48`, the `replayDigest` | 0..331 |
| replay body with `selected` (the guard) | 331 | 4,387 | the same | 0..331; row pulls equal at k = 0, 7, 165 |
| streaming path of `:1453` (`writeRuntimeReplayGuardValue`) | 347 | 4,622 | `sha256:ccfddc296b9de0f95001ba4c58c2d2e3031036b3621226ad0379aaf1673abed9`; the streamed text is `canonicalJson` of the complete ReplayState | 0..347 |

For every k, both writers emitted the same k parts and both threw. The case passes on the head build and on the build after.

Persisted digests. `test_env/fixtures` and the tracked `test_env/uat` inputs hold no `planDigest` or `replayDigest` key that these writers produced. The retry plan digest is never persisted; it is compared at `:6711` only. No fixture holds a pending `planDigest`. Two persisted `replayStateDigest` values are this writer's output. Both are in the packaged S01 store, `test_env/fixtures/r10-projection-family/s01-attempt-01/events-01/runtime.events.jsonl`: ordinal 15 (`c_call_judged`, `sha256:cc5e176935fba897efe2a3bda46ea1d2fee1d03d56f60d2c1b08aea5539458fb`) and ordinal 16 (`traversal_route_admitted`, `sha256:1357e02a6dbc68630103728c48b38560a0fa5c84ae130f59a346dc41ae27cd17`). They are the complete replay digests at cuts 14 and 15. The case recomputes both through the new writer and through the transcription, and both are equal. `test_env/fixtures/continuation-causation.json` holds a third value, `sha256:f3f89ff4…` at ordinal 64, but the fixture keeps only 8 rows (ordinals 4-10, 64, 66), so its prefix cannot be replayed.

**Item 2: census.** "Observable" means the error's class or message is read past the site. The refusals below are fixed literals: none carries the lift's label or the refusal's `at`/`reason`. No caller reads `instanceof IJsonAdmissionError` or `.code` on these paths. The one such read, `abg/probabilistic_result.ts:513`, is on the `admitIJsonText` path.

| # | Site | Function | What the `catch` does at head | Observable past the site | Decision |
|---|---|---|---|---|---|
| 1 | `validator/conformance_operation.ts:248` | `evaluateWithValidationInput` (via `evaluateGtlProgramConformance` `:201`, `…FromResolvedClosure` `:233`; `ConformancePort` `:344`) | `:249` returns `refusal("invalid_packet", …, "GTL Program conformance requires one exact I-JSON packet")` | no | migrated |
| 2 | `product/result_assessment_operation.ts:499` | `assessResult` | `:500` returns `refusal("value_mismatch", "result assessment requires one exact canonical I-JSON request", ["/"])` | no | migrated |
| 3 | `abg/witness_admission_operation.ts:435` | `validatePacket` (via `admitWitnessedAct` `:1112`) | `:436` returns `refusal(memberKey, null, "content_invalid", "witness admission requires one exact canonical I-JSON packet")` | no | migrated |
| 4 | `abg/project_read_ports.ts:599` | `admitReadPacket` (via `prepareRead` `:640`) | `:600` returns `refusal(key, null, "invalid_packet", "ABG project read requires one exact I-JSON packet")` | no | migrated |
| 5 | `abg/probabilistic_result.ts:285` | `canonicalObject` (callers `:422`, `:429`) | `:288` returns `null` | no | migrated; the `try` also encloses `asIJsonObject` |
| 6 | `abg/actor_process.ts:370` | `validateActorProcessCarrierPair` | `:372` returns `carrierRefusal("invalid_actor_process_request", "actor process request must contain only exact I-JSON data")` | no: `probabilistic_result.ts:415-417` copies the message, which is the fixed literal | migrated |
| 7 | `abg/actor_process.ts:415` | `validateActorProcessCarrierPair` | `:417` returns `carrierRefusal("invalid_actor_process_observation", "… must contain only exact I-JSON data")` | no (as 6) | migrated |
| 8 | `abg/actor_process.ts:1059` | `assessNativeResultArtifact`, a closure in `invokeActorProcessWithAssembly` (`:773`) | `:1066` leaves `disposition` `rejected` | no | migrated; the `try` also encloses `JSON.parse` and the verifier |
| 9 | `product/worksite_command_execution.ts:1786` | `isPredicateObservation` | `:1789` returns `false` | no | migrated |
| 10 | `product/worksite_command_execution.ts:1787` | `isPredicateObservation` | `:1789` returns `false` | no | migrated |
| 11 | `abg/execution_basis.ts:249` | `constructNativeInstructionAssemblyBasis` | `:255` returns `null` | no | migrated; the `try` also encloses the capture and the derivation |
| 12 | `implementation/leaf_invocation_port.ts:695` | `invokeLeafOwnerBoundary` (`:531`), F_D branch | `:699` sets `admittedCandidate = null`; the receipt is then `malformed_return` | no | migrated |
| 13 | `implementation/leaf_invocation_port.ts:776` | `invokeLeafOwnerBoundary`, F_P `finalize` | `:793` returns the `malformed_return` receipt | no | migrated; the `try` also encloses validation and the receipt |
| 14 | `validator/raw_admission.ts:184` | `rawAdmitValue` | the outer `catch` `:226` copies `error.message` into the `non_canonical_value` refusal (`:232`) | yes: the message (`$<at>: <reason>`) | kept: the message is the refusal text |
| 15 | `product/worksite_command_execution.ts:1055` | `constructPredicate` | none; the throw propagates. Callers: `isPredicate` `:1172` (catch `:1177`, `false`); `constructWorksiteCommandConfiguration` `:1440`, then `worksite_preparation.ts:76` (catch `:85`, `false`), `worksite_revision.ts:143` (guard `:163-164`), `worksite_command_forward.ts:150` (guard `:165`) and the task constructors `:375`, `:434`, `:481` | yes, inside leaf implementations: `deterministicFailure` records class and message (`leaf_invocation_port.ts:560-590`) | kept: constructor throw contract; the value is used |
| 16 | `product/worksite_command_execution.ts:1058` | `constructPredicate` | as 15 | as 15 | kept (as 15) |
| 17 | `product/worksite_command_execution.ts:2059` | `constructWorksiteCommandExecutionWorkerResult` (exported from `product/index`) | none; caller `implementation/worksite_command_execution.ts:753`, catch `:754`, `result_contract_failure`; also `:2122` `constructWorksiteExecutionObservation` | inside the leaf, as 15 | kept: constructor throw contract; the value is returned |
| 18 | `product/worksite_command_execution.ts:2112` | `assertWorksiteCommandVectors` | none; callers `:1956` (`constructWorksiteExecutionHelperArtifact`) and `:2258` (`isWorksiteExecutionObservation`, inside its `try`) | inside the leaf, as 15 | kept: an assertion throws by contract |
| 19 | `abg/event_store.ts:1736` | `DurableHistoryDerivation.capture`, via `captureDurablePrefixCoordinate` `:1828` | none. Nine callers: four inside a `try` (`artifact_truth.ts:751`, `project_read_ports.ts:526`, `:568`, `execution_basis.ts:250`, catch `:255`, `null`); five uncaught (`admission_authority.ts:88`, `event_store.ts:1838`, `:2215`, `project_read_ports.ts:901`, `:952`) | yes, on the uncaught paths | kept: capture throws by contract; the value is the captured coordinate |
| 20 | `abg/event_store.ts:2553` | `closeHeldEventStoreAtDurablePrefix` (`:2523`) | none; throws | yes | kept: the value is the detached handoff prefix |
| 21 | `abg/project_read_ports.ts:1560` | `projectPreparedRead` | outside its `try`; callers `:973` (project closure), `:1439` (inside a `try`, catch `:1440`, `invalid_history`), `:1517` `project`, then the ports `:1579-1641` | yes, through the port consumers | kept: the value is the projection; the throw leaves through the ports |
| 22 | `implementation/worksite_command_execution.ts:169` | `exactAuthorityFreeOccurrence` | none; throws | inside the leaf, as 15 | kept: throw contract; the value is returned |

The 22 sites leave out one `code/src` caller, `shared/i_json.ts:112` (`reconstructIJsonNode`). It serves `admitIJsonText`, which is not this package's.

**Item 3: migration.** 13 sites migrated (1-13), 9 kept (14-22). `admitIJsonValue` stays; its remaining `code/src` callers are sites 14-22 and `shared/i_json.ts:112`. Tests call it too: `test_env/tests/t287-ordered-reconstruction.test.mjs:14` and `t287-f04a-probabilistic-result-candidate.test.mjs:1094`.

Form. The activation assumes `admitJson` returns a refusal for every value the lift refused. It does not. `admitJson` throws on a cycle (`RangeError`, the stack bound), on nesting past the stack bound (`RangeError`), and from a proxy trap. Head's bare `catch` turned each of these into the site's fixed refusal. Deleting the `try`, as the activation words it, would let them escape: at sites 1-4 and 6-7 a Product or owner boundary would throw where it now refuses. That would meet the stop "a refusal observable at a Product boundary changing class or text". Counterexample: `evaluateGtlProgramConformance({ member: JSON.parse("[".repeat(200000) + "]".repeat(200000)) })` returns the `invalid_packet` refusal at head and throws `RangeError: Maximum call stack size exceeded` with the `try` deleted. The migrated form keeps a `try` around `admitJson` alone. That is the design's (A) rule (O-TYPE, `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:613`): "an `unknown` value passes `admitJson` at the site, and a refusal or a throw takes the site's own channel".

```ts
let admitted: JsonValue | undefined;
try {
  const outcome = admitJson(supplied);
  if (outcome.kind === "ok") admitted = outcome.value;
} catch { /* admitJson throws on a cycle, at the stack bound and from a proxy trap; these take the same refusal. */ }
if (admitted === undefined) return <the same refusal>;
```

`admitJson` never answers `ok` with `undefined` (`admitJson(undefined)` is the `non_ijson_value` refusal), so the sentinel is exact. Where head's `try` also enclosed other work (sites 5, 8, 11, 12, 13), only the lift left it: the outcome is read in place, inside the existing `try`. Sites 9 and 10 read `admitJson(observedValue).kind === "ok" && admitJson(evidence).kind === "ok"` inside the existing `try`. `liftIJson`'s other throw, a `TypeError` for a refusal code outside its closed set (`i_json.ts:44-45`), was also absorbed by each bare `catch`; the migrated form maps every refusal to the same return.

Proof: one case, `TD-16: the lift's refusal-only callers keep head's refusal for every malformed value`, in `t287-runtime-failure-diagnostic`. That lane already carries the in-memory source owner (`sourceOwner`, with exposure of private functions and import overrides), the leaf boundary harness and the actual carrier pair. Inputs at every site: a function member, `2 ** 60`, `"\uD800"`, a cycle, 200,000-deep nesting from `JSON.parse` and a proxy whose `ownKeys` trap throws, each one member below the site's input. Each control is the same input with that member `1`. The expected results are literals in the case (`td16Head`), read from the head build and source at `cf630b55c`: the whole refusal object (kind, code, message, paths), or `null`/`false`, and for the leaf the whole `malformed_return` candidate. At head the case passes (scratch run against the head build, before any edit); after, it passes in the lane run (Lanes).

| # | Driven through | All six inputs give | Control |
|---|---|---|---|
| 1 | `evaluateGtlProgramConformance` (build) | one refusal, carrying "GTL Program conformance requires one exact I-JSON packet" | differs (shape refusal) |
| 2 | `assessResult` (build) | one refusal, carrying "result assessment requires one exact canonical I-JSON request" | differs |
| 3 | `admitWitnessedAct(packet, {}, {})` (build) | `content_invalid`, "witness admission requires one exact canonical I-JSON packet" | differs |
| 4 | `admitReadPacket` (source, exposed) | `invalid_packet`, "ABG project read requires one exact I-JSON packet" | differs |
| 5 | `canonicalObject` (source, exposed) | `null` | `{ member: 1 }` |
| 6 | `validateActorProcessCarrierPair`, `responseJsonSchema` member (build) | `invalid_actor_process_request`, "… must contain only exact I-JSON data" | differs |
| 7 | the same, `toolInvocations` row (build) | `invalid_actor_process_observation`, "… must contain only exact I-JSON data" | differs |
| 8 | by reading | — | — |
| 9 | `isPredicateObservation`, `observedValue` (source, exposed) | `false` | `true` |
| 10 | the same, `evidence` row | `false` | `true` |
| 11 | `constructNativeInstructionAssemblyBasis` (source; `captureDurablePrefixCoordinate` overridden to count) | `null`, and no capture ran | `null` after one capture |
| 12 | `invokeLeafOwnerBoundary`, F_D, a success candidate whose `resultCandidate.answer` is the input | the receipt of a `null` output (`malformed_return`) | the success candidate |
| 13 | the same, F_P completion | the closed receipt of a `null` completion (`malformed_return`) | the success candidate |

Site 8 is proved by reading, because only a native worker exchange reaches it. Inside the existing `try`, `admitJson(JSON.parse(output))` is read as `raw` when it is `ok` and as `null` otherwise; `isRecord(null)` is false, so a refused artifact keeps `disposition` `rejected`, and a throw still reaches `:1066`. `JSON.parse` output cannot hold a function member or a cycle. An unsafe integer, a lone surrogate or deep nesting in the text takes the same `rejected` as at head.

**Item 4: the nine casts.** All nine are (T), discharged as TD-14 recorded; nine casts removed. Runtime behavior is identical at each.

| `td-14-census.tsv` line | Site | Change |
|---|---|---|
| 9 | `shared/public_function_contracts.ts:753` (`visit`) | `!isRecord(value)` in place of `typeof value !== "object" \|\| value === null`, after the array branch; `const record = value` |
| 11 | `shared/public_function_contracts.ts:773` (`neutral`) | the same |
| 13 | `shared/public_function_contracts.ts:799` (`rewrite`) | the same |
| 1908 | `product/worksite_command_execution.ts:166` | `!isRecord(predicate.declaration)` in place of the three-part guard; `const declaration = predicate.declaration` |
| 1909 | `:170` (`launch`) | `!isRecord(launch) \|\| !isRecord(request)` in place of the six-part guard; `parts = { launch, request }` |
| 1910 | `:170` (`request`) | the same edit |
| 1925 | `:1129` | `isRecord(entry) ? entry.name : undefined`; the `undefined` arm is unreachable, since `:1114` requires every entry to be a record |
| 1927 | `:1461` | `isRecord(declaration) &&` first; unreachable refusal (`validPredicateDeclaration` `:1083` via `constructPredicate` `:1069`) |
| 1928 | `:1502` | `isRecord(entry) &&` first; unreachable refusal (`:1114` via `constructPredicate` `:1069`) |

`isRecord` is `typeof value === "object" && value !== null && !Array.isArray(value)` (`shared/admit/record.ts:6-10`). Each guard it replaces is the same test, or that test after the array branch has already returned. The nine rows now read "TD-15 + TD-16: … cast removed" in column 11 and `removed` in column 14. The two "not resolved" gap entries (lines 9-13: held under the `shared/` stop; line 1925: Set size only) now read "moot: cast removed at TD-15 + TD-16".

The C2 context pin (`gtl/worksite_command_execution.ts`) after the product edits (6 casts and the two lift sites 9-10):

| Constant | Line | Before | After |
|---|---|---|---|
| `byteCount` | `:39` | 115830 | 115562 |
| `digest` | `:37` (`commandSource` reads it at `:39`) | `sha256:3ec989dcea8228026258ea700f9646b0ab8875445ee1d157db6ba0573de234b7` | `sha256:a8d7035f451e9f8459e5ff696ef520d440efc7a32bce2481374cae577e693182` |
| `startByte` | `:61` | 105745 | 105477 |
| `endByte` | `:61` | 108177 | 107909 |
| `spanDigest` | `:61` | `sha256:1fcd71846ed7a57571a96bf3bb6475aeaba3d4f89eafb121969c157904a896bf` | unchanged |

The offsets are those of `renderWorksiteCommandExecutionPrompt.toString()` in `build/code/src/product/worksite_command_execution.js`, found with `Buffer.indexOf`, as the generator reads them. The span occurs once. It is 2,432 bytes before and after and shifts by -268, the module's size change. The renderer (`:2289`) is below every edit, and its source is unchanged.

`npm run build` exits 0 with the new pin; the generator's check (`scripts/generate-product-manifest.mjs:98-107`: member bytes and digest at `:100-101`, span at `:102-105`) passes. The built module is byte-identical to a scratch emit of the same source made before the build. The build regenerated these tracked files, all committed: `build/code/src/abg/actor_process.js`, `build/code/src/gtl/worksite_command_execution.js` (the three pin lines only), `build/code/src/product/worksite_command_execution.js`, `contracts/worksite/command-execution-context.inventory.json` (the member `digest` only, `3ec989dc…` to `a8d7035f…`), `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json`. The other changed modules have no tracked build output. The JSON files differ from head only in `productContentDigest` and the digests and refs derived from it: 68 fields in the manifest and 310 in the graph (`productContentDigest` 241, `capabilityDefinitionDigest` 34, `capabilityDefinitionRef` 34, `graphDigest` 1), the counts TD-14 recorded. `npx tsc --noEmit -p tsconfig.json`: clean. `npm run lint:imports`: 28 modules under `code/src/shared/` import only `code/src/shared/` and packages. `npm run lint:lifecycle`: 284 modules, 10 allow-listed sites, no offender. All four gave the same output at head before any edit.

**Item 5: boundaries.** Read on the diff and checked by the lanes:
- No Product contract member, event payload key, fluent name or failure class changes. No `contractDigest` moved, and none of the 17 tracked `.d.ts` files changed.
- The three writers' bytes and digests are identical on every input of item 1, and so are the persisted S01 digests.
- No refusal observable at a Product boundary changes class or text. Each migrated site returns its head literal for every value head refused, including the values `admitJson` throws on (item 3).
- `admitIJsonText` and `IJsonAdmissionError` are unchanged. `shared/i_json.ts` is unchanged.
- `shared/` changes only at the three guards of `shared/public_function_contracts.ts`.

**Item 6: records.** Proposed text for the Executive; the Worker made no design edit.
- `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:165` (`writeCanonicalRecord` row, third column): "none: it is the record walk of `canonicalRecordDigest` and of the three record writers that produce plan and replay digests (`abg/retry.ts` `completedRetryProgressPlanDigest`, `abg/c_call.ts` `pendingInteractionBodyDigest`, `abg/replay.ts` `writeReplayBody`); each keeps its member writing in `writeMember`, and their bytes and digests are unchanged."
- `:593` (row 3, second column): replace "the 3 record writers that produce persisted plan digests stay (digest stability)" with "the 3 record writers that produce plan and replay digests route their envelope through `writeCanonicalRecord`, byte for byte".
- `:606` (D4): "The throwing entry of `i_json.ts` is a lift over `admitJson` (admit, then throw on refusal). It remains only where the throw is the caller's contract (nine sites: `validator/raw_admission.ts`, `product/worksite_command_execution.ts` ×4, `abg/event_store.ts` ×2, `abg/project_read_ports.ts`, `implementation/worksite_command_execution.ts`) and inside `admitIJsonText`. A caller that consumed only the refusal reads `admitJson`'s outcome and keeps one `catch` for the throws of `admitJson` itself (cycle, stack bound, proxy trap). New callers use `admitJson`."
- `:132` (last sentence): "The throwing entry of `i_json.ts` is a lift over `admitJson`, kept for callers whose contract is the throw (§10.2, D4)."
- `:613` (O-TYPE), the clause "nine (T) held at `shared/` and at the C2 context pin": the nine are discharged at TD-15 + TD-16, so 16 casts remain (the 15 (P) and the one (I) under `stop: channel`).

**Item 7: lanes.** `tsc --noEmit`, `lint:imports`, `lint:lifecycle` and `npm run build` are under item 4.

The set has 148 lanes: 146 by the rule below, plus `t287-value-equality` and `m5-c-algebra-validation`, which are named but match no changed basename (`t287-worksite-command-execution` and `forward-command-contracts` match it). A lane is in it by the rule when its test file, or a `test_env/support` file it imports (two levels), names one of the 13 changed module basenames followed by `.js`, `.ts`, `.mjs` or a quote: `retry`, `c_call`, `replay`, `conformance_operation`, `result_assessment_operation`, `witness_admission_operation`, `project_read_ports`, `probabilistic_result`, `actor_process`, `worksite_command_execution` (the product module and the pinned `gtl` module), `execution_basis`, `leaf_invocation_port`, `public_function_contracts`. Three lanes of a wider first candidate set ran at head only and are outside the set: `r3-workspace-binding`, `steel-consumer-declaration`, `t287-authenticated-owner-family`.

Every lane ran twice: at head (`cf630b55c`, its build, before any edit) and after (the change, built). Totals are tests/pass/fail/skipped: head 880/588/195/95, after 882/590/195/95. Each run also has 2 cancelled, both in `t287-calculus-state-transfer`. The difference is the two new cases. 81 lanes are red at head and after, with the same 197 failing-test identities (file:line and test name) and the same first error class. No new red identity. Attribution:
- 15 lanes: H's log, at the line of the test's first `✖` there;
- 66 lanes: the head run; red at `cf630b55c` before any edit, and not in H's log.

| Lane | Head `cf630b55c` | After | Reds (identical at head and after) |
|---|---|---|---|
| `d1-preserved-result-mechanics` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `d2-acknowledgment` | 4/0/4/0 | 4/0/4/0 | 4: `:17`, `:34`, `:51`, `:81`; head run |
| `d2-binding-transition` | 10/0/10/0 | 10/0/10/0 | 10: `:6`, `:148`, `:172`, `:191`, `:208`, `:232`, `:247`, `:269`, `:289`, `:303`; head run |
| `d2-bounded-repair` | 12/7/5/0 | 12/7/5/0 | 5: `:10`, `:56`, `:66`, `:77`, `:103`; head run |
| `d2-evidence-owner` | 2/0/2/0 | 2/0/2/0 | 2: `:7`, `:27`; head run |
| `d2-evidence-owner-lookup` | 9/0/9/0 | 9/0/9/0 | 9: `:8`, `:8`, `:19`, `:19`, `:22`, `:22`, `:27`, `:27`, `:39`; head run |
| `d2-historical-design` | 14/10/4/0 | 14/10/4/0 | 4: `:8`, `:27`, `:35`, `:89`; head run |
| `d2-historical-owner` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `d2-workflow-step` | 9/0/9/0 | 9/0/9/0 | 9: `:9`, `:22`, `:29`, `:42`, `:52`, `:65`, `:98`, `:108`, `:118`; head run |
| `forward-command-contracts` | 10/10/0/0 | 10/10/0/0 |  |
| `forward-command-owners` | 6/2/4/0 | 6/2/4/0 | 4: `:7`, `:22`, `:37`, `:45`; H log :217, :218, :219, :220 |
| `generic-input-retention` | 4/2/2/0 | 4/2/2/0 | 2: `:82`, `:132`; head run |
| `installed-language-smoke` | 1/1/0/0 | 1/1/0/0 |  |
| `integration-shared-seams` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `m5-c-algebra-validation` | 22/19/0/3 | 22/19/0/3 |  |
| `m5-consensus-module` | 18/11/7/0 | 18/11/7/0 | 7: `:1108`, `:1314`, `:1546`, `:1660`, `:1935`, `:2115`, `:2251`; head run |
| `m5-event-calculus-runtime` | 19/13/5/1 | 19/13/5/1 | 5: `:372`, `:1316`, `:1471`, `:1548`, `:1590`; H log :257, :268, :269, :270, :271 |
| `m5-event-store-reopen` | 18/18/0/0 | 18/18/0/0 |  |
| `m5-fresh-process-reconstruction` | 1/0/1/0 | 1/0/1/0 | 1: `:13`; H log :296 |
| `m5-installed-graph-edge` | 1/0/1/0 | 1/0/1/0 | 1: `:9`; H log :297 |
| `m5-retry-lifecycle-authority` | 9/4/5/0 | 9/4/5/0 | 5: `:21`, `:238`, `:281`, `:323`, `:533`; H log :306, :308, :309, :311, :314 |
| `m5-s03-authority` | 5/1/4/0 | 5/1/4/0 | 4: `:96`, `:218`, `:285`, `:415`; H log :315, :316, :317, :319 |
| `m5-terminal-quiescence-owner` | 7/7/0/0 | 7/7/0/0 |  |
| `m5-worker-transport` | 23/23/0/0 | 23/23/0/0 |  |
| `r10-child-proof` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `r10-projection-contracts` | 10/9/1/0 | 10/9/1/0 | 1: `:109`; head run |
| `r5-invocation-admission` | 3/0/3/0 | 3/0/3/0 | 3: `:15`, `:100`, `:598`; head run |
| `r6-implementation-resolution` | 1/0/1/0 | 1/0/1/0 | 1: `:14`; head run |
| `r7-graph-validation-basis` | 1/1/0/0 | 1/1/0/0 |  |
| `r8-direct-hog-entry` | 1/0/1/0 | 1/0/1/0 | 1: `:19`; head run |
| `r9-causal-result-closure` | 2/0/2/0 | 2/0/2/0 | 2: `:53`, `:721`; head run |
| `retained-route-cursor-transition` | 1/0/1/0 | 1/0/1/0 | 1: `:26`; head run |
| `rival-authority-mutations` | 3/1/2/0 | 3/1/2/0 | 2: `:54`, `:78`; head run |
| `runtime-scope-regressions` | 2/2/0/0 | 2/2/0/0 |  |
| `steel-basic-cli-c2` | 6/0/0/6 | 6/0/0/6 |  |
| `steel-basic-cli-source-replay` | 2/0/0/2 | 2/0/0/2 |  |
| `t287-authenticated-owner-family` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-authenticated-owner-values` | 3/1/1/1 | 3/1/1/1 | 1: `:39`; head run |
| `t287-c0-correction-regressions` | 4/3/1/0 | 4/3/1/0 | 1: `:42`; head run |
| `t287-c0-post-publication-failure` | 31/31/0/0 | 31/31/0/0 |  |
| `t287-c2-child-program` | 4/4/0/0 | 4/4/0/0 |  |
| `t287-c2-core-environment` | 3/3/0/0 | 3/3/0/0 |  |
| `t287-c2-owner-coordinate-reuse` | 6/0/6/0 | 6/0/6/0 | 6: `:120`, `:195`, `:212`, `:227`, `:238`, `:266`; H log :420, :421, :422, :423, :424, :425 |
| `t287-c2a-fp-source-contract` | 4/4/0/0 | 4/4/0/0 |  |
| `t287-calculus-fold` | 12/12/0/0 | 12/12/0/0 |  |
| `t287-calculus-state-transfer` | 8/6/0/0 | 8/6/0/0 | 2 cancelled: `:64`, `:70`; H log :453, :1180 |
| `t287-conformance-owner-reuse` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; H log :486 |
| `t287-cross-cut-public-read` | 5/4/1/0 | 5/4/1/0 | 1: `:105`; H log :491 |
| `t287-d1-requirement-handoff` | 5/2/0/3 | 5/2/0/3 |  |
| `t287-d1-semantic-stage` | 3/1/0/2 | 3/1/0/2 |  |
| `t287-declared-testing-capability` | 7/5/1/1 | 7/5/1/1 | 1: `:174`; head run |
| `t287-default-library` | 20/17/0/3 | 20/17/0/3 |  |
| `t287-default-library-fulfillment` | 7/7/0/0 | 7/7/0/0 |  |
| `t287-deferred-application-restoration` | 2/0/2/0 | 2/0/2/0 | 2: `:85`, `:116`; head run |
| `t287-event-body-encoding` | 14/14/0/0 | 14/14/0/0 |  |
| `t287-exact-construction-intent` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-f04a-probabilistic-result-candidate` | 2/1/1/0 | 2/1/1/0 | 1: `:356`; head run |
| `t287-fh-hold-open` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t287-generic-job-intake` | 2/0/1/1 | 2/0/1/1 | 1: `:12`; head run |
| `t287-generic-job-lifecycle` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-generic-job-meaning` | 5/3/0/2 | 5/3/0/2 |  |
| `t287-generic-job-parent-audit` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-generic-job-parent-foldback` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-generic-job-read-dependency` | 2/1/0/1 | 2/1/0/1 |  |
| `t287-generic-job-revision` | 4/1/0/3 | 4/1/0/3 |  |
| `t287-generic-job-worksite` | 9/9/0/0 | 9/9/0/0 |  |
| `t287-governance-covered-source-use` | 8/2/3/3 | 8/2/3/3 | 3: `:351`, `:386`, `:430`; head run |
| `t287-gtl-language-corpus` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t287-held-prefix` | 6/0/0/6 | 6/0/0/6 |  |
| `t287-historical-source-resource` | 2/1/1/0 | 2/1/1/0 | 1: `:64`; head run |
| `t287-installed-product-coordinate` | 11/11/0/0 | 11/11/0/0 |  |
| `t287-installed-qualification-conservation` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t287-json-value-definition` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-lifecycle-failure-carrier` | 5/5/0/0 | 5/5/0/0 |  |
| `t287-live-worksite-construction` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-malformed-gtl-gate` | 6/5/1/0 | 6/5/1/0 | 1: `:60`; H log :530 |
| `t287-management-context` | 14/12/0/2 | 14/12/0/2 |  |
| `t287-management-supervision` | 5/4/1/0 | 5/4/1/0 | 1: `:105`; head run |
| `t287-multi-candidate-admission` | 75/75/0/0 | 75/75/0/0 |  |
| `t287-native-assembly-retained-input` | 1/0/1/0 | 1/0/1/0 | 1: `:12`; head run |
| `t287-native-assessment-evidence` | 4/1/3/0 | 4/1/3/0 | 3: `:551`, `:559`, `:585`; head run |
| `t287-native-c2-instruction-assembly` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-native-event-time` | 6/0/4/2 | 6/0/4/2 | 4: `:30`, `:66`, `:86`, `:108`; head run |
| `t287-native-frame-observation` | 8/1/3/4 | 8/1/3/4 | 3: `:189`, `:209`, `:237`; H log :535, :536, :537 |
| `t287-native-frame-route-conservation` | 3/0/3/0 | 3/0/3/0 | 3: `:5`, `:10`, `:14`; head run |
| `t287-native-owner-reuse` | 3/0/0/3 | 3/0/0/3 |  |
| `t287-native-registered-selection` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-native-runtime-gate` | 7/6/0/1 | 7/6/0/1 |  |
| `t287-native-semantic-evidence` | 1/0/1/0 | 1/0/1/0 | 1: `:11`; head run |
| `t287-native-semantic-job` | 9/8/1/0 | 9/8/1/0 | 1: `:224`; head run |
| `t287-native-semantic-revision` | 9/4/4/1 | 9/4/4/1 | 4: `:122`, `:270`, `:332`, `:531`; H log :553, :556, :557, :562 |
| `t287-native-structural-gates` | 9/9/0/0 | 9/9/0/0 |  |
| `t287-native-work-currentness-consumers` | 4/4/0/0 | 4/4/0/0 |  |
| `t287-native-work-reacquisition` | 9/6/0/3 | 9/6/0/3 |  |
| `t287-native-work-unknown-effect` | 10/10/0/0 | 10/10/0/0 |  |
| `t287-native-worksite-execution` | 6/3/0/3 | 6/3/0/3 |  |
| `t287-native-workspace-work` | 38/37/0/1 | 38/37/0/1 |  |
| `t287-observed-worksite-command` | 8/7/1/0 | 8/7/1/0 | 1: `:43`; H log :106 |
| `t287-ordered-reconstruction` | 7/0/4/3 | 7/0/4/3 | 4: `:22`, `:74`, `:103`, `:158`; H log :587, :588, :589, :591 |
| `t287-owned-native-proof` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-owned-process-lifetime` | 18/18/0/0 | 18/18/0/0 |  |
| `t287-post-binding-worksite-write` | 2/1/1/0 | 2/1/1/0 | 1: `:244`; head run |
| `t287-predecessor-context` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t287-public-terminal-projection` | 4/0/4/0 | 4/0/4/0 | 4: `:34`, `:50`, `:68`, `:87`; head run |
| `t287-qual056-material` | 7/7/0/0 | 7/7/0/0 |  |
| `t287-qualification-contraction` | 4/4/0/0 | 4/4/0/0 |  |
| `t287-qualification-fp-proof-delivery` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-qualification-parent-alias` | 1/0/1/0 | 1/0/1/0 | 1: `:18`; head run |
| `t287-qualification-producer-acquisition-reuse` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t287-qualification-producer-context` | 4/4/0/0 | 4/4/0/0 |  |
| `t287-qualification-raw-contract-preimage` | 1/0/0/1 | 1/0/0/1 |  |
| `t287-r6-retry-success-exit` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-reconstruction-conservation` | 2/0/0/2 | 2/0/0/2 |  |
| `t287-recursive-registered-selection` | 4/2/1/1 | 4/2/1/1 | 1: `:129`; head run |
| `t287-registered-graph-selection` | 1/0/1/0 | 1/0/1/0 | 1: `:15`; head run |
| `t287-release-acceptance` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t287-release-publication` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t287-result-evidence-lineage-projection` | 1/0/1/0 | 1/0/1/0 | 1: `:215`; head run |
| `t287-result-evidence-lineage-type-contract` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-retry-run-prefix` | 3/0/3/0 | 3/0/3/0 | 3: `:59`, `:92`, `:107`; head run |
| `t287-route-reconstruction` | 9/7/0/2 | 10/8/0/2 | the TD-15 case `:610` joins and passes |
| `t287-runtime-activity-quiescence` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-runtime-failure-diagnostic` | 14/14/0/0 | 15/15/0/0 | the TD-16 case `:636` joins and passes |
| `t287-s03-automatic` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t287-selected-action` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t287-selected-execution-closure` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t287-st1-installed-cross-owner-hello` | 2/0/2/0 | 2/0/2/0 | 2: `:116`, `:737`; head run |
| `t287-st2a-e-exact-prefix-workspace-environment` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-stdo-run-environment` | 2/0/1/1 | 2/0/1/1 | 1: `:87`; head run |
| `t287-undispatched-diagnostic` | 7/5/2/0 | 7/5/2/0 | 2: `:93`, `:222`; head run |
| `t287-value-equality` | 4/4/0/0 | 4/4/0/0 |  |
| `t287-wave2-installed-product-verification` | 1/1/0/0 | 1/1/0/0 |  |
| `t287-wave2-owner-contract-source-set` | 15/13/2/0 | 15/13/2/0 | 2: `:609`, `:796`; head run |
| `t287-worksite-branch-construction` | 2/0/2/0 | 2/0/2/0 | 2: `:584`, `:669`; head run |
| `t287-worksite-command-execution` | 10/10/0/0 | 10/10/0/0 |  |
| `t287-worksite-construction` | 3/0/3/0 | 3/0/3/0 | 3: `:217`, `:361`, `:688`; head run |
| `t287-worksite-file-replace-owner` | 1/0/1/0 | 1/0/1/0 | 1: `:371`; head run |
| `t288-composition-conservation` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t288-instruction-assembly-owner` | 11/4/0/7 | 11/4/0/7 |  |
| `t288-physical-return-conservation` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `t288-scoped-retry-guard` | 1/0/1/0 | 1/0/1/0 | 1: `:12`; head run |
| `t288-workflow-scope-conservation` | 1/0/1/0 | 1/0/1/0 | 1: `:1`; head run |
| `w2-steel-serial-branch-installed` | 2/0/0/2 | 2/0/0/2 |  |
| `w2-steel-single-start` | 8/6/1/1 | 8/6/1/1 | 1: `:118`; head run |
| `w2-steel-single-start-closure` | 8/0/0/8 | 8/0/0/8 |  |
| `w2-steel-single-start-installed` | 1/0/0/1 | 1/0/0/1 |  |
| `witness-reprice-definition-binding` | 15/0/15/0 | 15/0/15/0 | 15: `:27`, `:36`, `:67`, `:77`, `:94`, `:102`, `:112`, `:118`, `:124`, `:129`, `:147`, `:162`, `:169`, `:205`, `:226`; head run |
| `witness-run-stopped-definition-binding` | 7/0/7/0 | 7/0/7/0 | 7: `:31`, `:65`, `:77`, `:89`, `:96`, `:102`, `:117`; head run |

**Errata.**
1. Item 3's form, "the `try`/`catch` is deleted", rests on `admitJson` never throwing. It throws on a cycle, at the stack bound and from a proxy trap (item 3). The `try` stays around `admitJson` alone: a throw takes the site's own channel, as O-TYPE (A) states (`:613`).
2. The 22 sites leave out `shared/i_json.ts:112`, a `code/src` caller of `admitIJsonValue`. With it, and with the nine kept sites, the deletion condition is not met.
3. The pin constants are at `gtl/worksite_command_execution.ts:37` (`digest`), `:39` (`byteCount`) and `:61` (`startByte`, `endByte`, `spanDigest`), as TD-14 cited them, not `:37-40` and `:59`. `:38` is `const commandSource = {`, `:40` is `commandContextRef` and `:59` is the `contextPolicy` selectors.

**Deviation.** Item 3 asks for an existing case per site or one new case in the owner's lane. The proof is one case in one lane, `t287-runtime-failure-diagnostic`, for all 12 driven sites. That lane already holds the source-owner loader, the leaf boundary and the carrier pair the sites need.

**Stops.** None met. Item 3's literal form would have met "a refusal observable at a Product boundary changing class or text". The counterexample and the conserving form are under item 3.

## TD-15 + TD-16 disposition (Executive, 2026-10-24)

Accepted at `a692fb4b9`. Executive check on that head: `tsc --noEmit` clean; both lints; `npm run build` rc 0 with the refreshed pin and no regenerated diff; `t287-value-equality` 4/4; `m5-c-algebra-validation` 22/19/0/3; `t287-worksite-command-execution` 10/10; `forward-command-contracts` 10/10; `t287-route-reconstruction` 10/8/0/2; `t287-runtime-failure-diagnostic` 15/15; `t287-management-supervision` 5/4/1/0; `r10-projection-contracts` 10/9/1/0; the two red lanes with their head identities (`exec_check_TD1516.log`).

The Return meets the contract. TD-15: the three writers hand their entries to `writeCanonicalRecord` and keep their member writing in `writeMember` (the retry and C_Call plans their prefix and replay-guard streaming with both branches of `c_call.ts:7349-7350`; the replay body its `selected` row iterables); the key bytes are identical because head wrote each key as one `JSON.stringify` part (`canonical_json.ts:21-23`) as `record.ts:34` does, and both sort by `compareUnicodeCodeUnits`. The case in `t287-route-reconstruction` (`:610`) compares transcriptions of the three head writers with the new ones over the owner-built inputs: same parts, bytes and digest on every input (retry 2,492 parts, pending 2,410 or 2,418 on eight inputs, replay 331, the streaming path 347) and the same k parts emitted before a sink that refuses part k+1, for every k. The two persisted `replayStateDigest` values in the packaged S01 store recompute equal. TD-16: 22 sites censused; 13 migrated to read `admitJson`'s outcome and return their head literal; 9 kept where the throw is the function's contract (`raw_admission.ts:184` copies the message into its refusal; the constructors and assertions in `product/worksite_command_execution.ts` and `implementation/worksite_command_execution.ts`, the coordinate capture and the close handoff in `event_store.ts`, the projection at `project_read_ports.ts:1560`, whose throws are recorded by leaf failure records or leave through the ports). The case in `t287-runtime-failure-diagnostic` (`:636`) drives 12 migrated sites with six malformed inputs each against literals read from the head build; site 8 (`actor_process.ts:1059`) is reached only through a native worker and is proved by reading. The nine casts: all (T), removed, `isRecord` in place of each manual guard; `td-14-census.tsv` corrected. The pin: byte count 115830 to 115562, digest `3ec989dc…` to `a8d7035f…`, span 105745-108177 to 105477-107909, span digest unchanged, the renderer below every edit; the build's check passes and the regenerated files differ only in the product content digest and its derivatives. 148 lanes at head and after: 882/590/195/95 after (two new cases), 81 lanes red with the same 197 identities (15 in H's log, 66 attributed to the head run).

Ruled from the Return. The activation's migration form ("the `try`/`catch` is deleted") assumed `admitJson` total; it is not: it documents that a throwing proxy trap throws (`admit/json.ts:209-212`) and it overflows the stack on a cycle or deep nesting, and at head the bare `catch` turned each into the site's fixed refusal, so deleting the `try` would have changed a Product-boundary refusal into a throw (the Worker's counterexample: `evaluateGtlProgramConformance` on 200,000-deep nesting). The conserving form, one `catch` around `admitJson` alone, follows O-TYPE (A) ("a refusal or a throw takes the site's own channel"); ruled correct. Whether the shared atom should refuse those inputs instead is an owner question on the atom's contract and goes to Phase C. The nine kept sites are the lift's legitimate callers: at each the throw is the contract and the message is observable, and an admit-then-throw copy at the site would duplicate the lift; D4's end state ("until no caller remains; it is then retired") is restated in this bookkeeping commit to say the lift remains for throw-contract callers and inside `admitIJsonText`. Reversal: convert the nine to refusal returns (a throw-contract change for each owner) and delete the lift. The design rows `:165` and `:593`, which kept the three writers for digest stability, are restated as a mechanism change with the digests unchanged. Reversal: revert the three writers. The O-TYPE row's "nine (T) held" clause is corrected to 16 casts remaining. Errata (the `admitJson` throws; `i_json.ts:112`; the pin lines `:37`, `:39`, `:61`) stand as the Return records them; the one-lane proof is accepted (the lane holds the loaders the sites need). No stops.

Register: TD-15 and TD-16 closed at `a692fb4b9`; TD-14's carried nine recorded as discharged.

## TD-23 activation (Executive, 2026-10-24; one line-boundary mechanism for the two durable history readers)

Debt (register TD-23, "Investigate"): two readers in `abg/event_store.ts` frame the same LF-delimited durable history with two implementations. `decodeHistoricalEvents(bytes, expectedProfileDigest?)` (`:3302`) holds the whole history: it pre-scans the buffer (a CR anywhere or a last byte that is not LF is "an incomplete trailing row"; a leading LF or `\n\n` is "a blank record"), then walks `indexOf(10)` from `:3326`, decoding each row's text and refusing a row whose bytes are not `canonicalJson(value) + "\n"`. `foldRuntimeHistoryDescriptor(descriptor, byteLength, consume, expectedDigest?)` (`:3564`) reads 64 KiB chunks from a descriptor: it hashes every chunk, carries a partial row across chunks (`pending`), walks `indexOf(10)` from `:3577`, hands each complete row with its byte offset to `consume`, retains the first logical error while the remaining bytes establish framing and the digest, and after the extent throws in the order digest mismatch, incomplete trailing row, blank record, retained logical error. The register's other two loops, `abg/worker_transport.ts:353` (strings; a trailing partial line is observed, not refused) and `abg/worksite_construction_recovery.ts:166` (bytes; the incomplete trailing record is left as failure evidence), are not this package's to edit. The design has no sentence on line framing.

Items.

1. Census first. For the four loops: input form (string or bytes), what CR means, what a blank record means, how invalid UTF-8 surfaces, what the trailing partial line means, which error wins when several are present, and which offsets and bytes each reports (the row with or without its LF; the byte offset). For the two event-store readers also the callers (by line) and which error class and message text each failure takes. The census is the first section of the Return and bounds item 2.
2. One mechanism. A private function in `abg/event_store.ts`, beside the two readers, owns the line-boundary mechanics both readers repeat: given the bytes as a sequence of chunks (one chunk is a whole history), it yields each complete row's bytes and byte offset in order, carries a partial row across chunk boundaries, and reports the framing facts the readers decide on (CR seen; a blank record; the last byte; the byte length). The two readers delete their own framing mechanics and keep their policies: `decodeHistoricalEvents` still refuses framing before decoding any row and keeps its error classes, messages and the order of its checks; `foldRuntimeHistoryDescriptor` still hashes every chunk, retains the first logical error and throws in its head order. Every error class, message text, digest and offset either reader reports is identical for every input. No chunk size changes; no row is copied where head did not copy it, or the copy is named.
3. Proof, in `test_env/tests/t287-event-body-encoding.test.mjs` or `m5-event-store-reopen.test.mjs` (the one whose support already builds durable logs; say which). (a) Equivalence: transcriptions of head's two readers (the framing and error parts; `consume` and the row decoder as the shared callee) and the new ones agree on the error (class and message) or the rows (bytes, offsets) and the digest over generated byte streams covering: a well-formed log of several rows; CR inside a row, CR at the end, CRLF endings; a blank record at the start, in the middle, at the end; invalid UTF-8 inside a row (a lone continuation byte; a truncated multibyte sequence; an overlong form); a row that is valid JSON but not canonical; a row that is not JSON; a missing trailing LF; an empty log; a log of one LF; combinations where a framing error and a logical error are both present in either order, and where two logical errors are present (the first wins). (b) Chunk-partition invariance: the mechanism over every partition of each stream into chunks (all cut sets for streams up to 12 bytes; for the longer streams, every single cut position and sixteen seeded random multi-cut partitions) yields the same rows, offsets and framing facts as over the whole stream, including a row and a CR straddling a cut. (c) The 64 KiB path: the packaged S01 store (`test_env/fixtures/r10-projection-family/s01-attempt-01/events-01/runtime.events.jsonl`, 2,797,774 bytes, rows straddling chunk boundaries) reopens through `reopenEventStore` with its historical `prefixDigest` and `prefixLength` as `r10-projection-contracts` asserts today; name the assertion.
4. Extension evidence, no edit. For `worker_transport.ts:353` and `worksite_construction_recovery.ts:166`: state whether the mechanism of item 2, as written, would delete that loop's mechanics with its policy (observe or ignore the trailing partial line; its error precedence) kept at its owner, and what the mechanism would need to change for it. That is the Executive's and the owner's decision (register TD-23: "extend only if it deletes another implementation"); edit neither file.
5. Boundaries kept, by reading and by the lanes: no error class or message text changes; no digest, offset or row bytes change; no export is added to `event_store.ts`; nothing under `shared/`; the physical/logical precedence of each reader is head's.
6. Records. The register row is the Executive's; state what it should record (the mechanism's name and lines, the two loops deleted, the extension evidence). If a design sentence names durable history framing, cite it and state whether it still holds; none was found.
7. Lanes. `tsc --noEmit`, `lint:imports`, `lint:lifecycle`, `npm run build`; before and after: `m5-event-store-reopen`, `t287-event-body-encoding`, `t287-held-prefix`, `r10-projection-contracts` (one red at head, the Run-read validity ruling in Phase C), `r10-child-proof` (red at head, the D2 store), `m5-event-calculus-runtime` (five red at head, H log `:257-:271`), `t287-ordered-reconstruction` (four red, H log `:587-:591`), `t287-c2-owner-coordinate-reuse` (six red, H log `:420-:425`), `t287-calculus-fold`, `t287-native-work-currentness-consumers`, `t287-retry-run-prefix` (three red at head, the head run); tests/pass/fail/skipped, the same red identities before and after or the difference named.

Grant: `code/src/abg/event_store.ts` (`decodeHistoricalEvents`, `foldRuntimeHistoryDescriptor`, the `consume` closure in `decodeRuntimeHistoryDescriptor` if its row form changes, and one private mechanism beside them), the test lane of item 3 and its `test_env/support` file, the tracked files `npm run build` regenerates (`build/code/src/abg/event_store.js`, `contracts/capabilities/capability-definition-graph.json`, `product-toolchain-manifest.json`, any other tracked file under `build/code/src`), and this record (append only, your section). No other file.

Stop (write the counterexample and the blocking line in the Return, keep the rest moving): a change to an error class or message text either reader throws; a change to a digest, an offset or the bytes a reader reports; a change in which error wins; an edit to `worker_transport.ts` or `worksite_construction_recovery.ts`; a new export from `event_store.ts` or any change under `shared/`; a change to a Product contract, an event payload key or a failure class; a lane whose red identities change.

Return contract: one commit on `main` with the first line `TD-23: one line-boundary mechanism for the two durable history readers; framing policies kept at their owners` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Add only the files you changed; no `git add -A`. Append `## TD-23 return` at the end of this record with the census (item 1), the mechanism and what each reader deleted and kept (item 2), the equivalence, partition and S01 results with their numbers (item 3), the extension evidence (item 4), the boundary statement (item 5), the records statement (item 6), the lane table (item 7), and any stops. Nothing above your section is edited.

## TD-23 return

Worker: Opus 5.5, fresh context. Base `c3f308c06`; this package's single commit is the next one on `main`, not pushed. Paths are relative to `build_tenants/abiogenesis/typescript/`. Head line numbers cite `c3f308c06`; "now" cites the commit. Scratch: the Worker's `td23/` (driver, outcome JSON, lane logs).

| Item | State | Lines at head | Lines now |
|---|---|---|---|
| 1. Census | done | `abg/event_store.ts:3302-3416`, `:3561-3600`; `abg/worker_transport.ts:352-364`; `abg/worksite_construction_recovery.ts:160-173` | below |
| 2. One mechanism | done; a private class, not a bare function (Deviation) | | `DurableHistoryLines` `event_store.ts:3302-3350`; `decodeHistoricalEvents` `:3352`, framing `:3363-3371`, row walk `:3375-3376`, `:3386`; `foldRuntimeHistoryDescriptor` `:3609-3636` |
| 3. Proof | done, in `m5-event-store-reopen` | | `test_env/tests/m5-event-store-reopen.test.mjs:1509-1797`: head transcriptions `:1554`, `:1572`; cases (a) `:1626`, (b) `:1716`, (c) `:1765`; streams and partitions `test_env/support/new-empty-append-sink.mjs:153-275` |
| 4. Extension evidence | done, no edit | | below |
| 5. Boundaries | kept | | below |
| 6. Records | statement below; no design sentence on durable history framing | | |
| 7. Lanes | done; red identities identical | | below |

**Item 1. Census** (head lines; `worker_transport.ts` and `worksite_construction_recovery.ts` are unchanged).

| | `decodeHistoricalEvents` (`event_store.ts:3302`) | `foldRuntimeHistoryDescriptor` (`:3564`) | worker observer (`worker_transport.ts:352-364`, `observeLine` `:280`) | `projectPreservedStructuredProposal` (`worksite_construction_recovery.ts:160-173`) |
|---|---|---|---|---|
| Input | one `Uint8Array`, the whole history | descriptor and byte length; 64 KiB `readSync` reads into one reused buffer | string chunks decoded by the child's stream (`setEncoding("utf8")` at `:466`; `runProcess`'s `onStdout` `:449-454` hands them to `onStdoutObserved`, which `actor_process.ts:1232-1254` feeds to the observer) | one `Uint8Array`, the whole preserved stdout |
| CR | any byte 13 refuses before any row: "incomplete trailing row" (`:3314-3319`) | byte 13 in a read sets `framing = "incomplete"` before that read's rows (`:3575`); thrown after the extent | stays in the line; `JSON.parse` takes it as whitespace | stays in the record; `admitIJsonText` takes it as whitespace |
| Blank record | leading LF or `\n\n` refuses before any row (`:3320-3322`) | a row of size 1 sets `framing = "blank"` unless set (`:3580`); thrown after the extent | `line.trim()` empty: skipped, not counted (`:281`) | reaches `admitIJsonText`: `IJsonAdmissionError` "preserved protocol record: ValueExpected at offset 1" |
| Invalid UTF-8 | per row `toString("utf8")` with U+FFFD: inside a JSON string "noncanonical event", outside "invalid JSON" | the same, in `consume` (`:3611-3617`) | not seen: strings | whole buffer decoded `fatal: true` first (`:161`): TypeError "The encoded data was not valid for encoding utf-8"; then a byte round trip (`:162`, e.g. a BOM): "preserved stdout changes Unicode bytes" |
| Trailing partial line | last byte not LF refuses (`:3315-3316`) | `last !== 10` after the extent (`:3595`) | carried in `pending`; `finish()` observes it as a line (`:362`) | ignored (`:168`), "remains failure evidence" |
| Which error wins | incomplete > blank > first failing row > profile (`:3411-3414`) | a no-progress read (thrown at once) > digest mismatch > incomplete > blank > first retained logical error (`:3593-3598`) > profile (in `decodeRuntimeHistoryDescriptor`) | none: a malformed row is skipped, nothing is thrown | UTF-8 decode > round trip > first failing record |
| Offsets and bytes | the row with its LF for the canonical check (`:3338`), no offset; per event a prefix receipt with the cumulative length and sha256 of `line + "\n"` (`:3399-3402`) | `consume(row with its LF, byte offset)`, the row a fresh `Buffer.from` or `Buffer.concat`; returns the hash of all bytes | the line without its LF; no offset | `{line (1-based), startByte, endByte (after the LF), digest of the row with its LF}` (`:172`) |

Callers of the two event-store readers and the channel each failure takes:

| Reader | Caller (head line) | Failure becomes |
|---|---|---|
| `decodeHistoricalEvents` | `validateHistoricalEvents` `:3295-3300`, its only caller | thrown as is |
| `validateHistoricalEvents` | `readRuntimeEventsAtDurablePrefix` `:2074` | a `DurablePrefixReadError` passes; anything else becomes `DurablePrefixReadError("event_envelope_invalid", String(error))` (`:2075-2078`) |
| | `persistEventLog`, `event_log.ts:37` | thrown as is |
| `foldRuntimeHistoryDescriptor` | `decodeRuntimeHistoryDescriptor` `:3610`, its only caller | thrown as is |
| `decodeRuntimeHistoryDescriptor` | `readOwnedRuntimeHistoryAtDurablePrefix` `:3475` | as at `:2074` (`:3485-3487`) |
| | `recoverInterruptedEventStore` `:3917`, stage `history_validation` | `refused_no_recovery` with `code: "history_validation"`, `message: String(error)`, or `recovery_fault` (`:3939-3959`) |
| | `reopenEventStore` `:4017` | `reopenRefusal("durable_log_mismatch")` for `prefix_digest_mismatch`, else `"invalid_event_history"`, message `String(error)` (`:4025-4026`) |

Framing errors: TypeError "durable ABG event log has an incomplete trailing row" and TypeError "durable ABG event log contains a blank record" (both readers); the fold also throws TypeError "durable history read made no progress" and `DurablePrefixReadError` `prefix_digest_mismatch` "ABG durable prefix bytes differ from coordinate". Row errors, the same in `decodeHistoricalEvents`' loop body and the `consume` closure: TypeError "… contains invalid JSON", "… a noncanonical event", "… an invalid logical event", `DurablePrefixReadError` `admission_ordinal_invalid` "… an invalid admission ordinal", TypeError "… an invalid envelope", "event stamp differs from the exact native profile schedule", "… restamped or inconsistent history", "native profile boundary cannot repeat or reverse", and the throws of `decodeEventBody`, `projectRuntimeEventAtContract` and `assertRootEventProfileBoundary`; after the rows TypeError "durable coordinate profile differs from authenticated history".

**Item 2. The mechanism and what each reader deleted and kept.**

`DurableHistoryLines` (`event_store.ts:3302-3350`, private, not exported). One `read(chunk, wanted)` per chunk; a whole history is one chunk.
- It yields each complete row with its LF and its byte offset, in order. A row inside one chunk is a view of that chunk; a row that straddles chunks is `Buffer.concat` of the carried pieces and the last piece, as at head.
- It carries the partial row (`Buffer.from` of the chunk's tail, as at head) and records the facts `carriageReturn`, `blankRecord`, `lastByte`, `byteLength`: a CR before any row of its chunk is yielded, a blank record before that row is offered, as head's fold set `framing`.
- `wanted` is the reader's predicate. Rows are yielded, and a partial row carried, until it first returns false; later rows are framed and not yielded, and no view or copy is made for them. The latch holds the delivery off even if the predicate turns true again; a row after a skipped carry would otherwise be missing its first pieces.

`decodeHistoricalEvents` deleted its pre-scan (`includes(13)`, the last byte, `encoded[0]`, `includes("\n\n")`, head `:3313-3317`, `:3320`) and its `indexOf` walk (`:3326-3328`, `:3338`). It keeps its policy: a first `read` that wants no row yields the facts, and the two refusals are thrown from them in head's order with head's text before any row is decoded (`:3363-3371`); then a second `read` of the same bytes walks the rows (`:3375`), the row body unchanged except that it takes `row` for `encoded.subarray(start, end + 1)` and decodes `row` minus its LF for `encoded.toString("utf8", start, end)`.

`foldRuntimeHistoryDescriptor` deleted its framing state (`rowOffset`, `pending`, `pendingLength`, `framing`, `last`, head `:3566-3569`), its CR check, LF loop and carry (`:3575-3590`) and its `last` update (`:3591`). It keeps its policy: the 64 KiB reads into one reused buffer, the no-progress refusal, `hash.update` of every read, the `consume` call guarded by `wanted = !hasPrimary && !carriageReturn && !blankRecord` (head's `!hasPrimary && framing === null`), the retained first logical error, and the order digest mismatch, incomplete, blank, retained error (`:3629-3634`).

Copies: none added. One removed and named: head handed `consume` a `Buffer.from(piece)` copy of a row inside one read; it now receives a view of the reused 64 KiB buffer, valid until `consume` returns (stated in the fold's doc comment). The `consume` closure of `decodeRuntimeHistoryDescriptor` (unchanged) reads `bytes` by `toString` (head `:3611`), `equals` (`:3616`), `physicalHash.update` (`:3641`), `sha256Bytes` and `.length` (`:3642-3643`); none retains it. Its inline-body callback (`:3619-3620`) reads an earlier row through `readRuntimeHistoryRowBytes`, which reads at the row's own position into its own `Buffer.alloc` (`:3501-3504`), never into the fold's buffer. A row that straddles reads is a fresh `Buffer.concat`, as at head.

Lines. `event_store.ts` is +69/−33, net +36. The 33 removed lines are the two readers' framing mechanics (32 code, 1 comment). The 69 added are the mechanism block (`:3302-3350`, 49 lines: 32 code, 15 comment, 2 blank) and 20 lines in the two readers (15 code, 4 comment, 1 blank). Net code is +15 lines. There is now one implementation of the line-boundary mechanics with two call sites in place of two implementations, at more lines, not fewer. The extensions of item 4 would delete about five lines (recovery) and six (worker) and add their call sites, so the total stays above head's.

Cost. `decodeHistoricalEvents` now makes two CR scans and two LF walks where head made one CR scan, one `\n\n` search and one walk: one more O(n) pass, no copy, no row view in the framing pass. The fold makes the same scans as head and creates no row view after it stops consuming (head created one per row).

Deviation. Item 2 asks for "a private function … given the bytes as a sequence of chunks". It is a private class with one generator method fed one chunk per call. The carried row, the offset and the facts are state across reads that the fold interleaves with its own `readSync` and `hash.update`, and that `wanted` reads during iteration; the class holds them in one declaration. A generator over a chunk iterable would need a facts record declared beside it and initialized by each reader (three initializers).

**Item 3. Proof.** The lane is `m5-event-store-reopen`: its support `test_env/support/new-empty-append-sink.mjs` builds durable logs through `createNewEmptyAppendSink`; `t287-event-body-encoding` imports no support module. The streams are built there (`td23HistoryStreams`, `:178`): seven logs written by the store owner (one of four rows of about 840 bytes; the others with rows sized to put boundaries at exact positions around the first 64 KiB read), recombined into 38 streams:
- well-formed (4 rows); CR inside a row, CR at the end, CRLF endings; a blank record at the start, in the middle, at the end; a lone continuation byte, a truncated 3-byte sequence and an overlong form inside a string, and a lone continuation byte outside one; a row valid JSON but not canonical; a row not JSON; a missing final LF; the empty log; a log of one LF; an ordinal gap (`DurablePrefixReadError`); a logical error then a blank, a CR or a missing LF, and a blank or a CR then a logical error; two logical errors in both orders;
- over 64 KiB (67,536 to 142,000 bytes): a row straddling the first cut with a 4-byte character split 2|2 by it; a bad row in the first read followed in the second by a CR, a blank, a missing final LF, or nothing (and each with a wrong digest); a bad row that straddles the cut; two bad rows, the second after the cut; valid rows across the cut then a bad row, a CR or a blank after it; an LF as byte 0 of the second read; an LF as the last byte of the first read, then a row or a blank; a row of 140,000 bytes carried in two pieces.

Partitions (`td23Partitions`, `:252`): the natural 64 KiB reads; every cut set up to 12 bytes; below 64 KiB every single cut; above it the cuts at 65,534 to 65,537 and at each LF and the two bytes after it; and sixteen seeded random multi-cut partitions. The fold's partitions are applied by capping each `readSync` at the next cut: the private build is loaded through `privateOwner` (`test_env/support/r10-private-owner-harness.mjs`) with `node:fs` `readSync` overridden; the head transcription reads through the same function.

(a) Equivalence, `:1626`, 38 streams, 66,159 partitions, about 8 s:
- `decodeHistoricalEvents`, through `validateHistoricalEvents`: the error (class, code, message) equals the head build's outcome on that stream (`TD23_HEAD_OUTCOME`, `:1536`, read from the head build) and, where head's framing transcription (head `:3313-3328`) refuses, equals that refusal with no row decoded (`JSON.parse` calls under `decodeHistoricalEvents` counted: 0); otherwise the lines decoded are a prefix of head's walk, all of it on success, and the events equal the events the store admitted. Under the legacy profile: head's profile refusal or the same framing or row error.
- `reopenEventStore` over each stream as a file: `invalid_event_history` with `TypeError: <head message>`, or the admitted events; with a wrong digest `durable_log_mismatch` for every stream.
- The fold: head's transcription (head `:3564-3600`) and the new one, with one shared callee that records each row (offset, length, sha256) when handed over and refuses the first row that is not JSON, not canonical or out of ordinal, agree on the calls, the error (class, code, message) or the digest: 66,235 comparisons (every partition; the natural reads also with the right and a wrong expected digest), and a read that makes no progress.
- The real decoder (`decodeRuntimeHistoryDescriptor`, private) gives one outcome over all 66,159 partitions (rows with offset, length, physical digest, prefix length and prefix digest, and the durable hash; or the error), which is head's, and the digest refusal under a wrong digest.

What the fold's consumed set depends on: CR detection works per read, at head and now, so which rows reach `consume` before a CR depends on where the cuts fall (5 of 38 streams have partition-dependent call lists, identical between head and new on every partition). The thrown error does not: framing outranks the retained error.

Head build check, outside the lane: a scratch driver ran the exported `validateHistoricalEvents`, `reopenEventStore` and the private fold and decoder of the head build (`c3f308c06`, copied before the rebuild) and of the new build over the same streams and partitions: 132,696 outcomes, byte-identical JSON (`td23/head_outcomes2.json`, `new_outcomes3.json`). This also checks `TD23_HEAD_OUTCOME` and the transcriptions.

(b) Partition invariance, `:1716`: the built `DurableHistoryLines` with every row wanted, over the 38 streams and 17 short streams (0 to 12 bytes: `""`, `"\n"`, `"\n\n"`, CR alone, CRLF, a row with no LF, `"é\n𝄞\n"`, a 12-byte row across every cut, …), 68,882 partitions, each read copied into one reused buffer that is overwritten after the read: rows (offset and bytes) and facts equal the whole-stream run, which equals head's walk and head's pre-scan predicates. Over every stream, a predicate false from row k yields the first k rows, also when it turns true again, and the facts are unchanged; over cuts the rows are a prefix of at most k rows.

(c) The 64 KiB path, `:1765`: the packaged S01 log (2,797,774 bytes, 43 reads, 20 rows; row 1 is 2,737,643 bytes and spans 42 reads, row 4 crosses one cut, the rest lie inside one read). The mechanism over 64 KiB chunks equals the whole run; head's fold and the new one over the packaged file give the same 20 calls and the historical `prefixDigest`; `reopenPackagedS01Store` under the historical profile gives the historical `prefixDigest` and `prefixLength`, and the cold read of that coordinate (`readRuntimeEventsAtDurablePrefix`, through `decodeHistoricalEvents` on 2.8 MB as one chunk) returns 20 events. The named assertion is `r10-projection-contracts.test.mjs:38`, "the packaged log is the historical S01 prefix…", `:40-41`; its module-level reopen (`:26`) runs the fold on S01 and passes after the change.

Lane coupling. Case (c) loads `test_env/fixtures/r10-projection-family/s01-store.mjs` inside the case, so a moved fixture fails only (c). It reopens the tracked S01 log read-write and takes its lock under `tmpdir()`, so the `m5-event-store-reopen` lane now has the write-permission requirement and the stale-lock hazard that TD-04+05 recorded for `r10-projection-contracts`, and the two lanes would contend for that lock if run concurrently. No lock remained after the runs.

Mutation check, on the new build in scratch, then restored: dropping the blank flag fails (a) and (b); not carrying the partial row fails (a), (b), (c); carrying a view of the reused buffer instead of a copy fails (a), (b), (c); recording the CR after the read's rows instead of before fails (a) (the fold's calls differ from head's); removing the latch fails (b) only, since both readers' predicates never turn true again; a no-op edit passes.

**Item 4. Extension evidence** (no edit to either file).

- `worksite_construction_recovery.ts:166-173`: yes for the mechanics, with the policy kept at its owner, once the mechanism has a home it can be imported from. The stdout is one read; the rows with their LF and offsets are what the loop computes (`raw`, `startByte`, `endByte`; `line` is a counter); the incomplete trailing record it leaves as failure evidence is the carried row the mechanism never yields (design `T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN.md:137-138`). Its policies stay with it: the fatal UTF-8 decode and byte round trip before framing (`:161-162`), a blank row to `admitIJsonText`, CR as JSON whitespace, the first failing record wins. About five lines would go (`:165-170`, `:173`). What would change: the mechanism must be exported from `event_store.ts` (a Stop here) or moved to a module both can import (outside this Grant; under `shared/` a Stop); and the mechanism copies the incomplete trailing record at the end of the read (`Buffer.from` of the tail) where the loop copies nothing, so it needs a final-read mode that does not carry, or that copy is named. It also makes one CR scan the loop does not use.
- `worker_transport.ts:352-364`: no, as written. Its input is strings, decoded by the stream; the mechanism reads `Buffer`s, so the worker would need byte chunks with per-row decoding, or a string variant of the mechanism. Its policy observes the trailing partial line at `finish()` (`:362`); the mechanism keeps the carried row private, so it would need an accessor that yields it. Blank lines (skipped by `trim`) and CR (whitespace) stay with the worker; the facts go unused. It needs the same export or move. The mechanics that would go are six lines (`:353-358`, `:362`). One fact on its cost: it slices `pending` once per line (`:357`), so a chunk of n lines costs O(n × chunk length).

**Item 5. Boundaries.** By reading the diff: no throw site's class or text changed (the one `-`/`+` pair on a throw line, the fold's blank refusal, changes only its condition); the order of each reader's checks is head's; the row body of `decodeHistoricalEvents` and the `consume` closure are unchanged except the two expressions named in item 2. No export was added to `event_store.ts`; nothing under `shared/`, `worker_transport.ts` or `worksite_construction_recovery.ts` changed; no Product contract, event payload key or failure class changed. By the proof: errors, offsets, row bytes and digests equal head's on every compared input; the lanes keep their red identities.

**Item 6. Records.** The register row TD-23 is the Executive's. It should record: the mechanism `DurableHistoryLines` (`event_store.ts:3302-3350`); the two event-store loops deleted (`decodeHistoricalEvents`' pre-scan and walk, the fold's framing state, LF loop and carry), each reader's framing policy kept; the proof (`m5-event-store-reopen.test.mjs:1626`, `:1716`, `:1765`); the extension evidence above (the recovery loop deletable given a home for the mechanism and a no-carry final read; the worker needs bytes or a string variant, a tail accessor and the home). Its evidence line for the worker, `worker_transport.ts:338–349`, is stale: the loop is at `:352-364`. No design sentence names durable history framing (searched `design/*.md` and `build_tenants/abiogenesis/design/`). The nearest is `T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN.md:136-138` on the recovery loop ("Retain an incomplete trailing record as failure evidence without parsing, repairing or using it"); it holds and would hold under the extension, since the mechanism never yields the carried row.

**Item 7. Lanes.** `npm run build` rc 0 before and after; before it regenerated nothing; after it regenerates `build/code/src/abg/event_store.js`, `contracts/capabilities/capability-definition-graph.json` and `product-toolchain-manifest.json` (digests), committed. `tsc --noEmit` rc 0; `lint:imports` rc 0 (28 modules); `lint:lifecycle` rc 0 (284 modules, 10 allow-listed, no offender), before and after. Tests/pass/fail/skipped:

| Lane | Before (`c3f308c06`) | After |
|---|---|---|
| `m5-event-store-reopen` | 18/18/0/0 | 21/21/0/0 (the three TD-23 cases added; about 9 s of the lane's 64 s) |
| `t287-event-body-encoding` | 14/14/0/0 | 14/14/0/0 |
| `t287-held-prefix` | 6/0/0/6 | 6/0/0/6 |
| `r10-projection-contracts` | 10/9/1/0 | 10/9/1/0 |
| `r10-child-proof` | 1/0/1/0 | 1/0/1/0 |
| `m5-event-calculus-runtime` | 19/13/5/1 | 19/13/5/1 |
| `t287-ordered-reconstruction` | 7/0/4/3 | 7/0/4/3 |
| `t287-c2-owner-coordinate-reuse` | 6/0/6/0 | 6/0/6/0 |
| `t287-calculus-fold` | 12/12/0/0 | 12/12/0/0 |
| `t287-native-work-currentness-consumers` | 4/4/0/0 | 4/4/0/0 |
| `t287-retry-run-prefix` | 3/0/3/0 | 3/0/3/0 |
| outside item 7: `witness-run-stopped-definition-binding` (counts decoder `JSON.parse` calls and `readSync` reads) | 7/0/7/0 | 7/0/7/0 |
| outside item 7: `witness-reprice-definition-binding` (the same probe) | 15/0/15/0 | 15/0/15/0 |
| outside item 7: `t287-cold-record-decoder` | 3/1/1/1 | 3/1/1/1 |

No lane reported a cancelled test. The 20 red and 10 skipped identities of the eleven lanes, and the first error line of each red test, are the same before and after (compared line by line):
- `r10-projection-contracts` 8 ("Run reads validate selected liveness…", `terminalResult` of undefined), the Run-read validity ruling;
- `r10-child-proof`, the file (the D2 store, `ENOENT`);
- `m5-event-calculus-runtime` 2, 13, 14, 15 (`abg.openCall is not a function`) and 12 (`runtime_failure_observed/runtime_invocation_active`); 1 skipped;
- `t287-ordered-reconstruction` 1, 2, 3, 5; 4, 6, 7 skipped;
- `t287-c2-owner-coordinate-reuse` 1 to 6;
- `t287-retry-run-prefix` 1 to 3 ("select the immutable s02-installed-continuation-04 carrier");
- `t287-held-prefix` 1 to 6 skipped.

The three lanes outside item 7 were run on the head build (its `event_store.js` copied back, then restored) and the new one: the same red identities and messages (`t287-cold-record-decoder` 2 is red at head, "retain existing replacement-character admission, without UTF-8 hardening").

**Stops.** None met.

**Errata.**
1. The register's evidence lines for the worker loop (`worker_transport.ts:338–349`) predate TD-11; the loop is at `:352-364`. The activation's `:353` is right.
2. Item 3(c) says the S01 log has "rows straddling chunk boundaries": two of its 20 rows do; row 1 alone spans 42 of the 43 reads.
3. Item 7 lists `t287-held-prefix` without a red count: at head it is 6/0/0/6, all six skipped.

## TD-23 disposition (Executive, 2026-10-24)

Accepted at `bc7135549`. Executive check on that head: `tsc --noEmit` clean; both lints; `npm run build` rc 0 and no regenerated diff; `m5-event-store-reopen` 21/21; `t287-event-body-encoding` 14/14; `r10-projection-contracts` 10/9/1/0; `t287-calculus-fold` 12/12; `t287-cold-record-decoder` 3/1/1/1; `m5-event-calculus-runtime` 19/13/5/1; the three red lanes with their head identities; the S01 fixture tree unchanged after the lanes (`exec_check_TD23.log`).

The Return meets the contract. `DurableHistoryLines` (`event_store.ts:3302-3350`, private) owns the line-boundary mechanics both readers repeated: one `read` per chunk yields each complete row with its LF and byte offset, carries a partial row across chunks, and records the framing facts (CR, blank record, last byte, byte length); the reader's predicate stops delivery at its first false and the latch keeps it off. `decodeHistoricalEvents` deleted its pre-scan and its `indexOf` walk and keeps its policy, framing refused before any row is decoded (a first read wanting no row), then the row walk; `foldRuntimeHistoryDescriptor` deleted its framing state, CR check, LF loop and carry and keeps its 64 KiB reads, the hash of every read, the retained first logical error and head's throw order. Read against head: the CR fact is set before a chunk's rows as head set `framing` before its loop; the blank flag is set before the row is offered as head's did; `wanted` is head's `!hasPrimary && framing === null`; the end checks read the same bytes. The proof in `m5-event-store-reopen`: 38 streams (23 under 64 KiB, 15 over, with cuts at the first read's boundary, a 4-byte character split by it and a 140,000-byte row carried in two pieces), 66,159 fold partitions against transcriptions of both head readers (66,235 comparisons of calls, error and digest), one outcome from the real decoder over every partition, 68,882 mechanism partitions with rows, offsets and facts equal to the whole-stream run, and 132,696 head-build versus new-build outcomes byte-identical in a scratch driver; each of five injected faults fails a case. The packaged S01 log (20 rows, 43 reads, row 1 spanning 42 of them) reopens with its historical `prefixDigest` and `prefixLength`. Eleven lanes and three more outside the list identical before and after; the lane gains three cases.

Ruled. The mechanism is a class, not a function: the carried row, the offset and the facts are state across the fold's interleaved reads and belong in one declaration; accepted. The removed copy (a row inside one read is now a view of the reused buffer, valid until `consume` returns, stated in the fold's doc comment) is ruled in: the closure reads the row and retains nothing, a straddling row is still a concatenation, and the mutation that carried a view across reads fails the case. The line count rose (net +15 code lines) because one mechanism now serves two call sites with a predicate and facts; the debt was two implementations of one mechanics, and one remains. The extra O(n) framing pass in `decodeHistoricalEvents` is the price of refusing framing before decoding, as head did; accepted. Extension not taken: the recovery loop (`worksite_construction_recovery.ts:166-173`) would lose about five lines once the mechanism had an importable home (a new `shared/` atom, a catalog change) and a no-carry final-read mode; the worker observer (`worker_transport.ts:352-364`) reads strings, needs the trailing partial line at `finish()` and the same home. Neither deletes an implementation at a cost below a new shared atom, so both are retained with that reason, as the register's closure asks; no design reframe is proposed and nothing goes to Phase C. Lane coupling noted: `m5-event-store-reopen` now reopens the tracked S01 log read-write and takes its lock, as `r10-projection-contracts` does; the lanes run serially and the broad run at the Phase B close is serial by file. Errata (the register's worker-loop lines predate TD-11; two S01 rows straddle a cut; `t287-held-prefix` all skipped at head) stand as the Return records them. No stops.

Register: TD-23 closed at `bc7135549` for the two event-store readers; the other two loops retained with reasons.

## TD-20 activation (Executive, 2026-10-24; T-287 compacted to one current disposition, history retained under its cuts)

Debt (register TD-20): GOALS, T-287, the plan and the step-8 records carried closure statements for different cuts; the status was reconciled on 2026-10-23 (register Completion record) and the compaction of T-287 remains. T-287 (`.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`) is 5,400 lines and 584,815 bytes at head. Its `## Current Delivery Plan` (`:24-66`) says of itself "This section is the sole current delivery schedule. It supersedes earlier current-status fields, launch/retry instructions, management ordering and downstream T-043 ownership in this ticket", yet the ticket keeps ten more headings that claim currency (`## Current integration design constraint` `:728`, `## Current Checkpoint And Installed Continuation` `:836`, `### Current framework-cost correction` `:1213`, `## Current Management Prerequisite Plan` `:1688`, `### Current graph-context re-entry` `:1707`, `### Current RC1 Owner Re-entry` `:1742`, `### Current Management Debt` `:1969`, `## Current Generic Job Binding Repair` `:2170`, `### Current state to preserve` `:166`, `### Current operation boundary` `:286`) and nineteen `current_*` frontmatter fields (`:10-21`) written at 2026-10-21, before the library close and the debt wave. The ticket method (`specification_methodology/v2/specification/standards/TICKET_METHOD.md:184`, `:349`) requires a ticket to preserve its contract, history, state transitions, stable identity, searchability and closure semantics; the register's boundary: do not edit old evidence into a successful outcome. GOALS links `#current-delivery-plan` (`specification/GOALS.md:980`).

Items.

1. Census first. Every heading of T-287 (H2, H3, H4) with its line range; the cut it describes (a date or commit named in its own text, or "undated"); whether it claims currency (a `Current` title, or present-tense status, grant or next-work statements); whether it is superseded by the `## Current Delivery Plan` statement above or by a later section of the ticket (name it); and whether another current surface carries the same fact (GOALS `Current Selection`, `Feature-Wave Status`, `Work And Milestones`; T-290 (`T-290-close-the-common-library-and-retire-the-registered-debt.md`) frontmatter, `Next:` line and ledger; the register's queue table; `packages.md`; the delivery close post `20261022T060245Z_CLOSE_library_consolidation.md`). Every frontmatter field with its value at head and the value the current surfaces establish. Every inbound link into T-287 from any file in the repository (`grep -rn "T-287-deliver" --include=*.md`), with its anchor. The census is the first section of the Return and bounds items 2 to 4.
2. One current disposition. Directly under the frontmatter, one section `## Current disposition` of at most forty lines states: status and the cut (the head commit you start from); what is delivered and closed, as links (the library delivery close in this ticket; T-290's Phase A close at `46ed04895`; the debt wave's accepted packages by a link to T-290's ledger, not a copy of it); the remaining obligations (the HELD candidate/build/P1/P5/P4, L4 partial, L5 acceptance absent, release resumption closed; the owner decisions, by a link to T-290 Phase C); the test limits (by a link to T-290's ledger attribution, not a list of lanes); the next selected work (by a link to T-290's `Next:`). Facts are stated once and linked, not copied. The frontmatter keeps every field; a field whose value at head disagrees with the current surfaces (item 1) is updated and the change listed old to new with the surface that establishes it; `updated_at` becomes 2026-10-24. `## Current Delivery Plan` stays as the delivery schedule and its text is unchanged.
3. History retained under its cuts. Every other section keeps its text unchanged, sentence for sentence. A section that claims currency and is superseded gets its cut in its heading, in the form `## <title> (historical, <cut>)` where `<cut>` is the date or commit from item 1, and one italic line under the heading naming what superseded it (a link). A heading that is an inbound link target (item 1) keeps its exact text and gets the italic line only; list those. A section whose every fact is carried by another current surface at head, and that no other section or file links to, is replaced by one line pointing at that surface; the Return lists each such section by heading and line range at head with the surface that carries it, and nothing else is removed. Where two superseded sections state the same fact at different cuts, both stay (they are history); where a superseded section contradicts the current surfaces, it stays unchanged under its cut heading and the Return names the contradiction. No historical sentence is reworded; no evidence is edited into a successful outcome.
4. Agreement. A table of the shared facts (status; cut; delivered and closed items; remaining obligations; test limits; next selected work) with each surface's statement at head, GOALS, T-290, the register's queue and the new `## Current disposition`, and agree or disagree per cell. Disagreements outside T-287 are listed, not fixed (GOALS is the owner's; T-290 and the register are the Executive's at acceptance).
5. Checks, run as a script and stated with counts: every non-heading, non-blank line of head's T-287 appears unchanged in the compacted ticket or lies in a removed range listed under item 3; every heading of head's T-287 appears either unchanged or in its `(historical, <cut>)` form; every inbound anchor of item 1 resolves after the edit (a heading whose anchor would change is a stop); the byte and line counts before and after; the count of sections retitled, kept verbatim and replaced by a pointer.
6. Lanes. None; `git diff --stat` of your commit shows T-287 and this record only.

Grant: `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md` and this record (append only, your section). No other file.

Stop (write the counterexample and the blocking line in the Return, keep the rest moving): an inbound anchor that cannot be kept (name the heading and the linking file; the Executive updates the link); a fact whose only carrier is a section you would remove, where the surfaces disagree about it (keep the section; name the fact); any edit to GOALS, T-290, the register, a design file, a post or code; a reworded historical sentence.

Return contract: one commit on `main` with the first line `TD-20: T-287 compacted to one current disposition; history retained under its cuts` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Add only the files you changed; no `git add -A`. Append `## TD-20 return` at the end of this record with the census (item 1), the disposition text and the frontmatter changes (item 2), the retitled, kept and pointer-replaced sections (item 3), the agreement table (item 4), the script's counts (item 5), and any stops. Nothing above your section is edited.

## TD-20 return

Worker: Opus 5.5, fresh context. Activation head `962d98a70`; `main` advanced to `aa9f5ac86` during the package (two Executive commits, T-290 Phase C rulings only); T-287, GOALS, the register and this record are identical at both. This package's single commit follows `aa9f5ac86`, not pushed. Line numbers in `T-287` cite `962d98a70`. Scratch: the Worker's `td20/` (`plan.py` holds every decision and generates the edit and the census; `check.py` is item 5).

| Item | State |
|---|---|
| 1. Census | done: 122 headings (H2 to H6), 45 inbound anchors, 20 frontmatter fields |
| 2. One current disposition | done: `## Current disposition`, 38 lines, `:24-61` now; six frontmatter values updated |
| 3. History under its cuts | done: 12 retitled, 21 italic line only, 89 kept verbatim (7 of them the plan), 0 replaced by a pointer |
| 4. Agreement | done: table below; seven disagreements outside T-287 listed, four inside T-287's plan named |
| 5. Checks | done: all pass; counts below |
| 6. Lanes | none; `git diff --stat` shows T-287 and this record |

**Item 1. Census.** Cut: the date a heading names; else the latest date the section's text names, its subsections included (an ISO date, a subsection heading, or the `YYYYMMDD` stamp of a linked record, which is a lower bound); else a commit named; else undated (the last-edit commit from `git blame` is given as a locator only). Claims currency: a `Current`, `Next`, `Immediate` or `Selected` title, or a present-tense status, grant or next-work statement that neither its heading, an enclosing heading nor its opening line disclaims. "plan `:59-64`" is the Current Delivery Plan's statement that it supersedes earlier current-status fields, launch/retry instructions, management ordering and T-043 ownership. GOALS CS is GOALS `## Current Selection`. Inbound counts files of any type (tracked, plus untracked markdown) and links inside T-287.

| Lines | Heading | Cut (source) | Claims currency | Superseded by | Also carried by | Inbound | Action |
|---|---|---|---|---|---|---|---|
| 24-319 | H2 Current Delivery Plan | 2026-10-23 (text) | yes: title | - | GOALS CS; T-290 | 201 files; intra `:2055`, `:3579`, `:3724`, `:3755`, `:3902`, `:3927`, `:4344`, `:4777` | plan, unchanged; states it supersedes earlier current-status fields (`:59-64`) |
| 66-108 | H3 Selected outcome and evidence boundary | 2026-10-21 (text) | yes: present-tense status | - | GOALS CS (L1/L2 acceptance) | - | plan, unchanged; disagrees: `:99-100` "Implementation ... remain open"; `:84` "still requires L3-L5" |
| 109-165 | H3 Common computational library deliverable | 2026-10-23 (text) | yes: present-tense status | - | GOALS CS | 77 files | plan, unchanged; agrees |
| 166-196 | H3 Current state to preserve | undated (last edit `bd336a99b`) | yes: title | - | - | - | plan, unchanged; self-states historical results; agrees |
| 197-223 | H3 Dependency order and exits | 2026-10-23 (text) | yes: present-tense status | - | T-290 Phase D; GOALS CS (L4, L5) | - | plan, unchanged; disagrees: `:210` L3 row "post-close repairs A to D" and "selected after L5" vs the delivery close (A to H) and T-290 Phase B |
| 224-285 | H3 Design and proof controls | undated (last edit `400d763d1`) | yes: present-tense status | - | GOALS CS (controls) | 8 files | plan, unchanged; agrees |
| 286-319 | H3 Current operation boundary | 2026-10-23 (text) | yes: title | - | GOALS CS; T-290 | 11 files | plan, unchanged; disagrees: `:312-317` Next (repairs F and G, TD-06 order) vs T-290 `Next:` |
| 320-721 | H2 Historical Routing Snapshot | 2026-10-06 (text) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 722-727 | H2 Prior Execution And Design Records | undated (last edit `67c333799`) | no: states the records below are historical | plan `:59-64` | - | - | kept |
| 728-741 | H2 Current integration design constraint | 2026-09-28 (path stamp) | yes: title | plan `:59-64` | - | - | retitled `(historical, 2026-09-28)`, italic line |
| 742-760 | H2 Recursive Executive and default graph library | 2026-09-20 (path stamp) | yes: "Current outcome:", "T-287 owns the native default-library increment" | plan `:59-64` | - | 1 file | italic line |
| 761-820 | H2 Framed-governance definition re-entry | 2026-09-28 (path stamp) | yes: "Current grant" row; open checklist items | plan `:59-64` | - | 285 files | italic line |
| 821-835 | H2 Owner rejection of Program-construction revisions | 2026-09-28 (text) | yes: "Implementation, recovery and native attempts remain held" | plan `:59-64` | - | - | retitled `(historical, 2026-09-28)`, italic line |
| 836-1667 | H2 Current Checkpoint And Installed Continuation | 2026-09-28 (text) | yes: title | plan `:59-64` | - | 94 files; intra `:1717` | italic line |
| 886-1158 | H3 Forced-ranked calculus repairs | 2026-09-26 (text) | yes: owner selection of the ranked repair order | plan `:59-64` | - | 1 file; intra `:838` | italic line |
| 1159-1212 | H3 Cross-cutting calculus review | 2026-09-26 (text) | yes: "implementation/live HOLD" | plan `:59-64` | - | 1 file; intra `:838` | italic line |
| 1213-1244 | H3 Current framework-cost correction | 2026-09-28 (path stamp) | yes: title | plan `:59-64` | - | intra `:2005` | italic line |
| 1245-1408 | H3 Historical dispositions — prior selections, not current launch grants | 2026-09-28 (text) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 1409-1562 | H3 Program-construction calculus definition | 2026-09-28 (path stamp) | no: opens "Withdrawn selection" | `:821` owner rejection | - | - | kept |
| 1563-1615 | H3 Execution-calculus Product re-entry | 2026-09-26 (text) | yes: "remain held", "remains open" | plan `:59-64` | - | 121 files | italic line |
| 1616-1667 | H3 Admission-boundary execution checklist | 2026-09-24 (path stamp) | yes: "Current execution is owned by the ticket fields above" | plan `:59-64` | - | 39 files; intra `:842`, `:1823`, `:2029`, `:3264` | italic line |
| 1668-1687 | H2 Hello Test-Boundary Repair | 2026-10-06 (text) | yes: present-tense plan steps | plan `:59-64` | GOALS CS (owner correction 2026-10-06, in part) | 74 files | italic line |
| 1688-2169 | H2 Current Management Prerequisite Plan | 2026-10-06 (text) | yes: title | plan `:59-64` | GOALS CS (odd_glc deselection 2026-10-06, in part) | 81 files; intra `:2173`, `:2299`, `:2837` | italic line |
| 1707-1718 | H3 Current graph-context re-entry | 2026-09-21 (path stamp) | yes: title | plan `:59-64` | - | 2 files; intra `:2048` | italic line |
| 1719-1741 | H3 Retained management repair evidence | 2026-09-19 (path stamp) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 1742-1760 | H3 Current RC1 Owner Re-entry | 2026-09-21 (path stamp) | yes: title | plan `:59-64` | - | 80 files | italic line |
| 1761-1792 | H3 Immediate P0 Reconstruction Repair | 2026-09-19 (path stamp) | yes: title ("Immediate") | plan `:59-64` | - | intra `:1835`, `:1837`, `:2100` | italic line |
| 1793-1819 | H3 First Sunny-Day Increment | 2026-09-19 (text) | yes: "selects the earliest full generic Hello lifecycle" | plan `:59-64` | - | 80 files | italic line |
| 1820-1847 | H3 Management Milestones | 2026-09-19 (path stamp) | no: opens "Historical September19 schedule" | plan `:59-64` | - | 80 files; intra `:2380`, `:2584`, `:3246` | kept |
| 1848-1909 | H3 Management Acceptance Boundaries | 2026-09-13 (path stamp) | no: acceptance rules | - | - | - | kept |
| 1910-1940 | H3 Ingress Handoff And Discriminators | undated (last edit `ad2a39f40`) | no: handoff rules | - | - | intra `:1836` | kept |
| 1941-1968 | H3 Competing-Path Checks | undated (last edit `ad2a39f40`) | no: pruning rules | - | - | intra `:2054` | kept |
| 1969-2114 | H3 Current Management Debt | 2026-09-28 (path stamp) | yes: title | register work queue and crosswalk; T-290 Phase B | register crosswalk (58 of 58 rows named) | 11 files; intra `:872` | italic line |
| 2115-2169 | H3 Management Plan Authority And Recording | 2026-09-19 (text) | no: opens "plan-recording grants are historical" | plan `:59-64` | - | - | kept |
| 2170-2288 | H2 Current Generic Job Binding Repair | 2026-09-18 (path stamp) | yes: title | plan `:59-64` | - | - | retitled `(historical, 2026-09-18)`, italic line |
| 2289-3573 | H2 Historical Delivery Plan Of 2026-09-13 | 2026-09-13 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 2377-3163 | H3 RC7 One-Hour Task Commitment | 2026-09-19 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | intra `:3187` | kept |
| 2415-2445 | H4 1B waste and observation repair | 2026-09-16 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 2446-2496 | H4 Task execution contract | undated (last edit `ad2a39f40`) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 2497-2536 | H4 Selected tasks | 2026-09-16 (path stamp) | yes: title ("Selected"; under `:2289`) | plan `:59-64` | - | - | retitled `(historical, 2026-09-16)`, italic line |
| 2537-3163 | H4 Declared testing-capability reuse | 2026-09-19 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | 80 files | kept |
| 2582-2697 | H5 MVP continuation and readiness | 2026-09-17 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 2698-3163 | H5 MVP bug register | 2026-09-19 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 2710-2736 | H6 TR-PROOF-FIXTURE | 2026-09-16 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 2737-2769 | H6 TR-NATIVE-BASIS-PROJECTION | 2026-09-17 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 2770-2798 | H6 TR-UAT-DECLARATION-CONTEXT | 2026-09-17 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 2799-2914 | H6 TR-NATIVE-EXECUTION-OVERHEAD | 2026-09-19 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | intra `:1835`, `:2097` | kept |
| 2915-2970 | H6 TR-LIVE-ACTOR-TRANSPORT | 2026-09-17 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 2971-3008 | H6 TR-NATIVE-ASSESSOR-STATEMENT-DOMAIN | 2026-09-17 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 3009-3034 | H6 TR-ASSESSOR-ROLE-VIEW-INTERPRETATION | 2026-09-17 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 3035-3072 | H6 TR-PROOF-DOUBLE-ROUTING | 2026-09-16 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 3073-3114 | H6 TR-NATIVE-DESIGN-CONTEXT | 2026-09-17 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 3115-3142 | H6 TR-C1-BINDING-COUNT | 2026-09-16 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 3143-3163 | H6 TR-DOC-RC6-LINK | undated (last edit `ad2a39f40`) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 3164-3243 | H3 STDO Run-Environment Course Correction | 2026-09-15 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | 124 files | kept |
| 3244-3261 | H3 Delivery Order And Exit Conditions | 2026-09-18 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | intra `:2302` | kept |
| 3262-3327 | H3 Next Dependency-Ready Work | 2026-09-13 (path stamp) | yes: title ("Next") | plan `:59-64` | - | intra `:3404` | italic line |
| 3328-3346 | H3 D4 Architecture Correction Status (2026-09-13) | 2026-09-13 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 3347-3380 | H3 Deferred 5.1 Boundary Work | 2026-09-13 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | 1 file | kept |
| 3381-3400 | H3 Feature Assessment And Source Routes | 2026-09-13 (text) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 3401-3432 | H3 Readiness And Next Re-entry | 2026-09-11 (path stamp) | yes: title ("Next") | plan `:59-64` | - | 118 files; intra `:3457`, `:4345` | italic line |
| 3433-3451 | H3 Execution And Evidence Discipline | undated (last edit `ad2a39f40`) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | - | kept |
| 3452-3488 | H3 Deferred Assurance Register | 2026-09-11 (path stamp) | no: under `:2289` (heading dated 2026-09-13) | plan `:59-64` | - | intra `:2705` | kept |
| 3489-3499 | H3 Current D2 Frame-Bound Repair Activation | 2026-09-11 (path stamp) | yes: title | plan `:59-64` | - | - | retitled `(historical, 2026-09-11)`, italic line |
| 3500-3535 | H3 Current D1 Native Design Activation | 2026-09-09 (path stamp) | yes: title | plan `:59-64` | - | - | retitled `(historical, 2026-09-09)`, italic line |
| 3536-3561 | H3 Current D1 Authority Activation | 2026-09-09 (text) | yes: title | plan `:59-64` | - | - | retitled `(historical, 2026-09-09)`, italic line |
| 3562-3573 | H3 Completed Documentation Activation | undated (last edit `adaeede02`) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 3574-3652 | H2 STDO RC6 Migration | 2026-09-06 (path stamp) | no: opens "Completed and Executive-accepted" | plan `:59-64` | - | 12 files | kept |
| 3630-3652 | H3 Superseded Method And Companion Evidence (Historical; Non-Operative) | 2026-09-02 (text) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 3653-4111 | H2 Retained Baseline Selection And Completed Documentation Grant | 2026-09-09 (text) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 3722-3756 | H3 Current Status And Supersession | 2026-09-04 (path stamp) | yes: title | plan `:59-64` | - | 3 files | italic line |
| 3757-3776 | H3 Baseline Workstream Register | undated (last edit `adaeede02`) | no: under `:3653` | plan `:59-64` | - | - | kept |
| 3777-3833 | H3 Completed C2 Helper Acknowledgment | 2026-09-09 (path stamp) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 3834-3898 | H3 Completed C1 Text Output | 2026-09-09 (path stamp) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 3899-3907 | H3 Former Wave 3 Selection (Historical) | 2026-09-09 (text) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 3908-3924 | H3 W2-STEEL-SEQUENCE completed activation | 2026-09-08 (path stamp) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 3925-4111 | H3 Completed STEEL-BASIC-CLI-01 | 2026-09-07 (text) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 3931-3967 | H4 W2-BL-PUBLIC | undated (last edit `29846fc36`) | no: under `:3925` and `:3653` | plan `:59-64` | - | - | kept |
| 3968-3997 | H4 W2-BL-C0 | 2026-09-07 (text) | no: under `:3925` and `:3653` | plan `:59-64` | - | 77 files; intra `:3580`, `:3660`, `:4719` | kept |
| 3998-4027 | H4 W2-BL-C2 | undated (last edit `29846fc36`) | no: under `:3925` and `:3653` | plan `:59-64` | - | - | kept |
| 4028-4068 | H4 W2-BL-PROOF | undated (last edit `29846fc36`) | no: under `:3925` and `:3653` | plan `:59-64` | - | - | kept |
| 4069-4111 | H4 W2-BL-C1-P3: Deferred Assurance Capsule | undated (last edit `adaeede02`) | no: under `:3925` and `:3653` | plan `:59-64` | - | - | kept |
| 4112-4251 | H2 Pre-Baseline Frozen C0 Reframe And Retained I/E (Historical) | undated (last edit `29846fc36`) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4252-4340 | H2 Retained C2 Two-Manifest Outcome (Historical) | undated (last edit `29846fc36`) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4341-4412 | H2 Lawful Re-entry | undated (last edit `adaeede02`) | yes: "The current D1-TAIL-LIVE activation ... own" | plan `:59-64` | - | 125 files | italic line |
| 4413-4451 | H2 Accepted C3 Aggregate | undated (last edit `29846fc36`) | no: accepted relation record | - | - | - | kept |
| 4452-4495 | H2 Retained C0 Causal Atom | undated (last edit `29846fc36`) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4496-4522 | H2 Predecessor Record And Historical Unaccepted C0 Candidate | undated (last edit `adaeede02`) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4523-4672 | H2 Pre-Baseline Evidence Obligations (Retained; Not Activated) | undated (last edit `29846fc36`) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4673-4741 | H2 Explicit Residual | undated (last edit `adaeede02`) | yes: "Questions 1-11 remain open"; "W2-BL-C0 above own current disposition" | plan `:59-64` | - | - | retitled `(historical, undated)`, italic line |
| 4742-4765 | H2 Downstream Reacquisition Gate And odd_glc Boundary | undated (last edit `adaeede02`) | yes: contradicts: `:4744` "T-043 now owns the full lifecycle witness" | plan `:59-64` | - | - | retitled `(historical, undated)`, italic line; contradicts: `:4744` "T-043 now owns the full lifecycle witness" |
| 4766-4805 | H2 Governing Order | undated (last edit `adaeede02`) | yes: "Current B04 HOW and runtime/proof disposition are owned above" | plan `:59-64` | - | - | retitled `(historical, undated)`, italic line |
| 4806-4820 | H2 Retained Historical Evidence | 2026-08-23 (text) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4821-4842 | H2 Prior Accepted Design Review Record | undated (last edit `29846fc36`) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4843-4935 | H2 Pre-Baseline I/E Review Frames (Non-Authorizing) | undated (last edit `adaeede02`) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4861-4935 | H3 Retained Historical Review Frames (Non-Authorizing) | undated (last edit `adaeede02`) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4936-4950 | H2 Deferred Assurance | 2026-09-11 (path stamp) | yes: status registered_open_deferred | register TD-21 | register TD-21 | intra `:2706` | italic line |
| 4951-5039 | H2 Current native applicability repair and bounded S03 acceptance | 2026-10-02 (subsection heading) | yes: title | plan `:59-64` | - | - | retitled `(historical, 2026-10-02)`, italic line |
| 4958-4964 | H3 C05 actual installed setup acceptance — 2026-10-02 | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4965-4971 | H3 Q06 independent acceptance and actual F11 release — 2026-10-02 | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4972-4975 | H3 Execution06 triangulation and bounded F_P/caller repair selection — 2026-10-02 | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4976-4984 | H3 F11 dispatch and external caller repairs accepted; successor C06 selected | 2026-09-28 (path stamp) | no: under `:4951`, in the 2026-10-02 sequence | plan `:59-64` | - | - | kept |
| 4985-4989 | H3 2026-10-02 — C06 accepted; installed continuation selected | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4990-4994 | H3 2026-10-02 — Authentic Setup06 accepted; Q07 selected | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 4995-4999 | H3 2026-10-02 — Q07 exact selector refusal; bounded continuation | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5000-5004 | H3 2026-10-02 — Input08 pure owner-bound delivery; independent review selected | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5005-5011 | H3 2026-10-02 — Q08 independently accepted; actual C06 carrier released | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5012-5018 | H3 2026-10-02 — Runtime07 failure localized; canonical raw-contract producer repair selected | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5019-5025 | H3 2026-10-02 — accepted qualification raw producer; C07 selected | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5026-5032 | H3 2026-10-02 — C07 construction accepted; actual Setup07 selected | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5033-5039 | H3 2026-10-02 — actual Setup07 and generated correspondence accepted; Q09 selected | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5040-5044 | H2 2026-10-02 — Q09 accepted; whole installed Runtime08 released | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5045-5049 | H2 2026-10-02 — Actual Runtime08 stopped; result-admission triangulation selected | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5050-5054 | H2 2026-10-02 — Runtime08 lineage triage CLOSED; realization repair selected | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5055-5059 | H2 2026-10-02 — Result lineage Source/component ACCEPTED; C08 selected | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5060-5089 | H2 2026-10-02 — End-to-end lineage Design frame correction | 2026-10-02 (heading) | no: heading names its cut or status | plan `:59-64` | - | - | kept |
| 5090-5120 | H2 T287-TESTING-PREREQUISITE-20 — selected partial-work Testing boundary | undated (last edit `400d763d1`) | yes: "Selected owning HOW/realization correction"; Writer20 grant | plan `:59-64` | - | - | retitled `(historical, undated)`, italic line |
| 5101-5108 | H3 T287-C2-HOST-TIMER-22 — bounded command-domain realization | undated (last edit `67c333799`) | no: under `:5090` | plan `:59-64` | - | - | kept |
| 5109-5120 | H3 T287-ASSURANCE-MODULE-ORIGIN-01 | undated (last edit `400d763d1`) | no: under `:5090` | plan `:59-64` | - | - | kept |
| 5121-5173 | H2 Final Review Dispositions 01 | undated (last edit `44be3cbce`) | yes: "independent final review and full aggregate remain pending" | plan `:59-64` | - | 4 files | italic line |
| 5174-5400 | H2 STDO 3 Library Re-entry (2026-10-22) | 2026-10-22 (heading) | no: heading names its cut or status | - | close post (D6 to D15 only) | - | kept |
| 5289-5400 | H3 Library delivery close (2026-10-23) | 2026-10-23 (heading) | no: heading names its cut or status | T-290 Ledger and Phase C (status claims) | close post; GOALS CS | 1 file; intra `:37`, `:112`, `:209`, `:210`, `:289` | kept |

Inbound anchors: 45 distinct anchors link into T-287. 42 resolve at head (38 headings; 4 `<a id>` tags at `:3775`, `:3832`, `:3897`, `:3906`) and resolve to the same text after the edit. 3 do not resolve at head and are not caused by this edit: `#current-baseline-selection-and-documentation-grant` (`.ai-workspace/comments/codex/20260905T042941Z_REVIEW_abiogenesis_wave2_stdo_baseline.md`; the heading is now `## Retained Baseline Selection And Completed Documentation Grant` `:3653`), `#re-entry-disposition` and `#accepted-wave-2-goal-reprice-and-design-roadmap` (the two pre-RC4 preimage JSON files under `.ai-workspace/context/axiomatic/history/20260905T025248Z-pre-rc4-adoption/`). They are the "remaining old ticket-navigation links" the register's TR-DOC-RC6-LINK row (`TECHNICAL_DEBT_REGISTER.md:371`) assigns to TD-20; both linking files are outside the grant. The live one could be restored without editing the post by an `<a id="current-baseline-selection-and-documentation-grant"></a>` before `:3653`; not done, item 3 permits no such addition.

Frontmatter (20 fields at `:3-22`; 11 `current_*` at `:9-19`):

| Field | Head | Current surfaces establish | Action |
|---|---|---|---|
| `id`, `status`, `goal`, `owner`, `build_tenant` | `T-287`, `active`, `GOAL-035`, `abiogenesis`, `typescript` | T-290 `:3-8` (parent T-287, GOAL-035); GOALS `:18` active | kept |
| `updated_at` | `2026-10-21` | item 2 | `2026-10-24` |
| `current_method_basis`, `current_method_manifest_sha256` | `stdo://releases/v3.0.0-rc.1/`, `069285ad…` | T-290 `:10-11`, equal | kept |
| `current_activation` | `T287_COMMON_LIBRARY_DELIVERY_01` | T-290 `:12` | `T287_COMMON_LIBRARY_DELIVERY_01 post-close repairs, then the technical debt register` (T-290's value) |
| `current_activation_status` | `BOUNDED_DESIGN_CONJUNCTION_ACCEPTED_VALUE_OWNER_OBLIGATIONS_OPEN_SOURCE_COMPLETION_L4_L5_HELD` | the conjunction is superseded by the design (plan `:293-294`); the value obligations are closed (`:110-113`); delivery close `:5289`; T-290 Ledger `:144` (H: "Phase A closed"); T-290 `:76-77` (review pass and L5: the owner); T-290 `:81` (Phase B started before L5) | `library delivered and closed (delivery close); T-290 Phase A closed at 46ed04895; L5 acceptance absent; T-290 Phase B in progress` |
| `current_handoff` | `.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/CHECKPOINT_HANDOFF.md` | plan `:43-44` ("The checkpoint handoff is historical"); T-290 Scope `:22-31` | `.ai-workspace/tickets/active/T-290-close-the-common-library-and-retire-the-registered-debt.md` |
| `current_next_work` | `authorized_WIP_checkpoint_then_finite_value_owner_decisions_and_separately_granted_dependency_ready_source` | T-290 `Next:` `:157` | `the Next line of T-290 (Phase B packages to the Phase B close; the owner's review pass on 46ed04895; L5)` |
| `current_prerequisite_deliverable` | `common_computational_capability_library` | GOALS `:22-30`; L5 absent (GOALS `:94`) | kept |
| `current_release_resumption_gate` | `CLOSED_until_L5_library_delivery_acceptance` | T-290 `:15`, equal | kept |
| `current_product_target` | `ABIogenesis_5.0.0_fixed_fifteen_families` | GOALS `:18`; plan `:50-51` | kept |
| `current_runtime_frontier` | `…_HELD_pending_design_source_conjunction` | plan `:41-42`, `:309-310` (HELD until L5 acceptance and a later exact grant) | `…_HELD_until_L5_acceptance_and_a_later_exact_grant` (prefix `historical_P1_PASS_P5_TIMEOUT_candidate_P1_P5_P4_and_dependents` kept) |
| `current_qualification` | `OPEN_fifteen_families_F11_sole_AF22_pre_RC_installed_RC_and_human_acceptance` | GOALS `:18` | kept |
| `change_class`, `derived_change_classes`, `re_entry_point` | `goal_reprice`, `product_reprice`, `specification/GOALS.md#current-selection` | the ticket's own triage | kept |

The method's required `type`, `ticket_category` and `change_intent` (TICKET_METHOD `:443-456`) appear only inside the Historical Routing Snapshot (`:329-337`); `triaged_at` and `created_at` appear nowhere. Not added: item 2 keeps the fields and updates the values that disagree.

**Item 2. The disposition** (T-287 `:24-61` now):

```markdown
## Current disposition

Status: active, at `aa9f5ac86` (2026-10-24). This section is the ticket's one
current status; the [Current Delivery Plan](#current-delivery-plan) is the
delivery schedule. Every later section is a record at its own cut and supplies
no current status or grant.

Delivered and closed:
- The common computational library, on local `main` at the cut the
  [library delivery close](#library-delivery-close-2026-10-23) records.
- The post-close repairs E to H of
  [T-290 Phase A](T-290-close-the-common-library-and-retire-the-registered-debt.md#phase-a-close-the-library),
  the last accepted at `46ed04895`, where T-290's Ledger records Phase A closed.
- The debt packages accepted since, each at its commit, in
  [T-290's Ledger](T-290-close-the-common-library-and-retire-the-registered-debt.md#ledger);
  the [technical debt register](../../TECHNICAL_DEBT_REGISTER.md#work-queue)
  links each closure.

Remaining obligations:
- L5 delivery acceptance is absent: the owner's review pass on `46ed04895`
  and the owner's record (T-290 Phase A, rows Review pass and L5). The
  release-resumption gate stays closed until L5.
- The combined candidate, build, P1, P5, P4 and their dependents are HELD
  until L5 acceptance and a later exact grant.
- L4 is partial on older subjects, and release work D1 to D6 follows L5,
  both as the [dependency order](#dependency-order-and-exits) states.
- The owner's rulings and the Phase C packages that follow the Phase B close
  are in [T-290 Phase C](T-290-close-the-common-library-and-retire-the-registered-debt.md#phase-c-the-owners-decisions).

Test limits: the last broad run is at `46ed04895`, attributed against the
earlier runs and the pre-plan baseline
([close post, Test reality](../../comments/claude/20261022T060245Z_CLOSE_library_consolidation.md#test-reality)).
Each package since ran its touched owners' lanes only, red lanes compared with
their head identities ([T-290 Ledger](T-290-close-the-common-library-and-retire-the-registered-debt.md#ledger));
the next broad run is at the Phase B close.

Next selected work: the `Next:` line that closes
[T-290](T-290-close-the-common-library-and-retire-the-registered-debt.md#ledger).
```

**Item 3. Sections.**

- Retitled `(historical, <cut>)` with the italic line (12): `:728-741`, `:821-835`, `:2170-2288`, `:2497-2536`, `:3489-3499`, `:3500-3535`, `:3536-3561`, `:4673-4741`, `:4742-4765`, `:4766-4805`, `:4951-5039`, `:5090-5120` (headings in the census). Four are `undated`: their text names no date or commit.
- Inbound targets that keep their heading text and get the italic line only (21): `:742` Recursive Executive and default graph library, `:761` Framed-governance definition re-entry, `:836` Current Checkpoint And Installed Continuation, `:886` Forced-ranked calculus repairs, `:1159` Cross-cutting calculus review, `:1213` Current framework-cost correction, `:1563` Execution-calculus Product re-entry, `:1616` Admission-boundary execution checklist, `:1668` Hello Test-Boundary Repair, `:1688` Current Management Prerequisite Plan, `:1707` Current graph-context re-entry, `:1742` Current RC1 Owner Re-entry, `:1761` Immediate P0 Reconstruction Repair, `:1793` First Sunny-Day Increment, `:1969` Current Management Debt, `:3262` Next Dependency-Ready Work, `:3401` Readiness And Next Re-entry, `:3722` Current Status And Supersession, `:4341` Lawful Re-entry, `:4936` Deferred Assurance, `:5121` Final Review Dispositions 01. The italic line names the plan and the disposition, except `:1969` and `:4936`, which name the register (all 58 of `:1969`'s rows and D2-UNDISPATCHED-REFUSAL-01 are in its crosswalk).
- Kept verbatim (89): the plan `:24-319` with its six subsections (item 2 freezes it); 82 others whose heading, enclosing heading or opening line already states the cut or historical status, or that state rules or records without a current claim.
- Replaced by a pointer: none. No section lacking inbound links has every fact on a current surface: `:5174-5288` (no inbound) carries the owner's D0 to D5 and their bases, which the close post does not (it lists D6 to D15); `:1969-2114` has every row in the register's crosswalk but 11 files link it.
- Contradictions kept unchanged under their cut: `:4744` "T-043 now owns the full lifecycle witness under the current delivery plan" against plan `:59-64` and GOALS `:159-169` (odd_glc and T-043 deselected; T-287 owns lifecycle proof); `:5311-5313` "its other 21 packages are unselected" against T-290's Ledger, which accepts work on 12 register packages in ten rows and activates TD-20. Both sit under headings that name their cut.

**Item 4. Agreement** (at `aa9f5ac86`; "plan" is T-287 `:24-319`).

| Fact | T-287 at head | GOALS | T-290 | Register queue | Current disposition |
|---|---|---|---|---|---|
| Status | `status: active` agrees; `current_activation_status` (conjunction accepted, value obligations open) disagrees; plan `:36-37` (delivered and closed) agrees | Current Goal `:18` "Active ... delivered on `main` at `562d4515a`", lifecycle implementation open: disagrees; CS `:36-38` (on `main` at repair H's commit) agrees | `status: active` agrees; `current_phase: A, close the library` (`:13`) disagrees with Ledger `:144` "Phase A closed" | TD-20 Open (`:49`) agrees | active; library delivered; Phase A closed; agrees |
| Cut | `updated_at: 2026-10-21` disagrees; plan cites the delivery close agrees | `:36-38` agrees; `:18` `562d4515a` disagrees | `updated_at: 2026-10-24`, Ledger to `bc7135549` agrees | dated snapshot `2f1393061` (`:3`) with Completion record to `bc7135549` agrees | `aa9f5ac86` agrees |
| Delivered and closed | delivery close `:5289` (A to H) agrees; plan `:210` L3 "post-close repairs A to D are accepted" disagrees; `:99-100` "Implementation ... remain open" disagrees | CS `:36-87` agrees; `:18` "Lifecycle implementation ... remain open" disagrees | Phase A rows E to H and Ledger agree | closed rows TD-01 to 03, 06, 08, 11, 13 to 17, 23; TD-04/05 increment; TD-07 partial: agrees with T-290's Ledger | links the delivery close, Phase A and the Ledger: agrees |
| Remaining obligations | plan `:41-43`, `:309-310` (HELD, L4 partial, L5 absent, gate closed) agree; `current_runtime_frontier` (pending conjunction) disagrees | CS `:93-95` agrees; Work And Milestones `:987-988` "T-043 owns the dependent GLC lifecycle" and M5 `:993` (Recovery13, forward Worker20) disagree | `:76-77`, Phase C, gate `:15` agree | Conditional, Investigate and Open rows; Phase C cited: agrees | L5, gate, HELD, L4, D1 to D6, Phase C: agrees |
| Test limits | delivery close baseline attribution at `562d4515a` (dated) agrees | no statement beyond L4/L5 | Rules `:50-52`, Ledger checks agree | Completion record proof returns agree | links the close post and the Ledger: agrees |
| Next selected work | `current_next_work` disagrees; plan `:312-317` (repairs F and G, order from TD-06) disagrees; `:210` "selected after L5" disagrees with T-290 `:81` | CS `:89-95` "the Phase B debt wave from TD-06" names the start, not the position: disagrees | `Next:` `:157` (TD-20; then TD-21/22/24, the Phase B close; the owner's review pass) | TD-20 row "compaction of T-287 remains" agrees | links T-290's `Next:`: agrees |

Disagreements outside T-287, listed and not fixed:

1. GOALS `:18` Current Goal row: delivery at `562d4515a`; "Lifecycle implementation, complete source conjunction ... remain open or held" (the rule `actor_process_lifecycle` is realized, CS `:78-87`); "Current checkpoint handoff owns transport status" (plan `:43-44`: historical).
2. GOALS `:89-90`: "Next ... the Phase B debt wave from TD-06" states the start of Phase B; at head the Ledger accepts ten Phase B rows (12 register packages) and TD-20 is active.
3. GOALS `:987-988` Work And Milestones: "T-043 owns the dependent GLC lifecycle and application outcomes" against GOALS `:159-169` and plan `:59-64`; M5 `:993` describes Recovery13 and forward Worker20, before the library selection.
4. T-290 `:13` `current_phase: A, close the library` against its Ledger `:144` ("Phase A closed") and Phase B `:81`.
5. T-290 `:66` "Ends with L5 delivery acceptance" against the Ledger and the close post, which record Phase A closed at `46ed04895` with the review pass and L5 open; the plan `:38-39` ("whose Phase A exit is L5") follows `:66`. The disposition states what the Ledger records.
6. The register `:5` names `#current-management-debt` "the owning T-287 register" whose decisions and grants "retain authority"; T-290 `:27` owns the packages and their grants, and the section now carries the italic line naming the register.
7. The three unresolved inbound anchors above (register `:371`).

Inside T-287's plan, unchanged under item 2: `:84` and `:99-100` (2026-10-21: L3 to L5 required, implementation open), `:210` (A to D; register selected after L5), `:312-317` (`Next:` before repair F).

**Item 5. Checks** (`check.py`, run on `git show 962d98a70:<T-287>` and the edited file; identical result against `aa9f5ac86`, where T-287 is unchanged): an ordered walk of head against new admits only equal lines, the six listed frontmatter replacements, a heading replaced by itself plus ` (historical, <cut>)` with the planned cut, the disposition block after `:23`, and an italic line with its blank lines under a heading; anything else fails. Five mutations each fail it (a one-character change in a historical line, a wrong cut, a deleted line, a retitled inbound heading, a frontmatter value outside the list).

| Count | Value |
|---|---|
| Lines before / after | 5,400 / 5,505 |
| Bytes before / after | 584,815 / 592,212 |
| Non-blank, non-heading lines at head | 4,629: 4,623 unchanged in order, 6 frontmatter values (item 2), 0 in removed ranges |
| Headings at head (with H1) | 123: 111 unchanged, 12 in `(historical, <cut>)` form |
| Added | 38 disposition lines, 33 italic lines, 34 blank lines |
| Sections retitled / italic only / kept verbatim / pointer-replaced | 12 / 21 / 89 / 0 |
| Inbound anchors resolving to the same text | 42 of 42 (3 unresolved at head, unchanged) |
| Links in the disposition and italic lines resolving (file and anchor) | 11 of 11 |
| Duplicate heading anchors after the edit | 0 |

**Item 6.** No lanes. `git diff --stat` of the commit: T-287 and this record.

**Stops.** None met: every inbound anchor keeps its heading text; nothing is removed; no historical sentence is reworded; no file outside the grant is edited.

**Errata.**

1. The activation gives `## Current Delivery Plan` as `:24-66`; the H2 runs `:24-319` with six H3s, and its schedule is the table at `:203-217`. Item 2 freezes its text, so `:166` and `:286`, which the activation lists among the currency-claiming headings, stay unchanged; `:286`'s stale `Next:` is reported above.
2. "ten more headings that claim currency": there are 15 `Current` titles besides the plan (the ten plus `:3489`, `:3500`, `:3536`, `:3722`, `:4951`), and `Next`, `Immediate` or `Selected` titles at `:1761`, `:2497`, `:3262`, `:3401`.
3. "nineteen `current_*` frontmatter fields (`:10-21`)": the frontmatter has 20 fields at `:3-22`, 11 of them `current_*` at `:9-19`.
4. TICKET_METHOD `:184` is the sprint-record rule (`:182-184`); the ticket rule is `:347-350`.
5. Item 1 names H2 to H4; T-287 also has two H5 and eleven H6 headings (`:2582`, `:2698`, `:2710-3143`). The census includes them.
6. The activation's `grep -rn "T-287-deliver" --include=*.md` misses links from other file types: 125 non-markdown files link `#lawful-re-entry` and three JSON files link `#current-status-and-supersession`. The census counts them.
7. `main` moved from `962d98a70` to `aa9f5ac86` during the package. The disposition names `aa9f5ac86` as its cut and its Phase C bullet reflects the owner's rulings recorded there.

## TD-20 disposition (Executive, 2026-10-24)

Accepted at `602eca3f3`. Executive check: the Worker's `check.py` re-run on `git show` inputs (`962d98a70` and `602eca3f3`): ALL CHECKS PASS, 4,623 of 4,629 body lines unchanged in order, the 6 frontmatter values, 0 removed, 111 headings unchanged and 12 in historical form, 42 of 42 inbound anchors resolve to the same text; an independent set check agrees; the committed file equals the worktree; the commit touches the two granted files only.

The Return meets the contract. T-287 now opens with one `## Current disposition` (38 lines: status and cut, delivered and closed, remaining obligations, test limits, next selected work, each stated once and linked to its owning surface); the twelve superseded sections that claimed currency carry their cut in the heading, twenty-one that are link targets carry the italic line only, eighty-nine are verbatim, none was replaced by a pointer (no section that nothing links to has every fact on a current surface), and no historical sentence changed. Six frontmatter values follow the current surfaces (`updated_at`, activation, activation status, handoff, next work, runtime frontier); the other fourteen agree with GOALS and T-290. Two contradictions stay under their cuts and are named (`:4744` T-043 ownership; `:5311-5313` the unselected count). The ticket grew from 5,400 to 5,505 lines: the debt was competing current narratives, which are now one, not size; the figure is recorded.

Ruled. The cut `aa9f5ac86` in the disposition is correct: it is the head at which the disposition's statements are true, and the Phase C bullet links the rulings recorded there. The three disagreements the Return lists on surfaces the Executive owns are fixed in this bookkeeping commit: T-290's `current_phase` (A against its own Ledger) is B; T-290's Phase A sentence "Ends with L5" is restated as the Ledger records it (the work closed at `46ed04895`; the L5 exit is the owner's acceptance and remains open); the register's opening clause naming T-287's management debt "the owning register" now names it the historical source and T-290 the owner of the packages. The three disagreements on GOALS (`:18` the `562d4515a` cut and the open lifecycle claim; `:89-90` the Phase B start; `:987-993` T-043 ownership and the M5 row) are the owner's surface and are restated once at the Phase B close, as planned. Of the three inbound anchors unresolved before this edit (register `:371`), the one from a live post (`#current-baseline-selection-and-documentation-grant`) is restored by an anchor tag before `## Retained Baseline Selection And Completed Documentation Grant` in this commit; the two from the pre-RC4 preimage JSON history are frozen records of the ticket at their cut and are left. The four stale statements inside the frozen `## Current Delivery Plan` (`:84`, `:99-100`, `:210`, `:312-317`: L3 to L5 required, repairs "A to D", the old `Next:`) are the activation's own constraint; one italic cut line under that heading, added in this commit, names them superseded by the disposition without rewording them. Errata (the plan spans `:24-319`; fifteen `Current` headings; twenty frontmatter fields; the ticket rule at TICKET_METHOD `:347-350`; H5 and H6 headings; 125 JSON files linking `#lawful-re-entry`) stand as the Return records them. No stops.

Register: TD-20 closed at `602eca3f3`.

## TD-21 + TD-22 + TD-24 activation (Executive, 2026-10-24; the inherited rows revalidated at head, each with a disposition and its evidence)

Debt (register TD-21, TD-22, TD-24, all "Revalidate"): the register's inherited crosswalk (`TECHNICAL_DEBT_REGISTER.md`, `## Inherited register crosswalk` and the "Later capsules" table) routes twenty-eight inherited rows to these three packages. They are retained obligations from T-287's management debt and later capsules, written against earlier cuts; the register's own boundary: "these are retained obligations needing refresh, not seven newly verified production defects", "historical costs are not current attribution", "this is triage work". TD-21 (reporting and observation): NW-DEBT-REPORT-COUNT-01, CALLER-PUBLIC-DIAGNOSTIC-01, NW-PREPARATION-OBSERVABILITY-01, NW-NATIVE-ASSESSOR-PROVENANCE-CONTEXT-01, READBACK-ABSENCE helper false failure, GJ-D2-UNDISPATCHED-CURSOR-REPORTING, D2-UNDISPATCHED-REFUSAL-01, and NW-DEBT-ADMISSION-DIAGNOSTIC-01 (shared with TD-17, whose F_D cause capture is closed; the F_P remainder is this row's). TD-22 (caller, install and capacity cost): INSTALL-VERIFY-COMPUTE-01, CALCULUS-SETUP-VOLUME-01, CALLER-DURABLE-CONTEXT-01/LIFE-01, CALLER-EVIDENCE-VOLUME-01, NW-CALLER-PREPARATION-LIFETIME-01/LIFE-01, NW-DEBT-CONFORMANCE-COST-01, NW-DEBT-INVOKE-COST-01, Design execution cost, Mechanical context repetition (input side), Fresh sandbox setup cost, and the conditional rows CALCULUS-BODY-01 (partial envelope), NW-F11-SCOPE-COST-01 and NW-PRODUCT-VERIFICATION-REUSE-01 (broader capacity). TD-24 (inherited assurance questions): NATIVE-EVIDENCE-RECOVERY-01, CALCULUS-PROOF-01, DESIGN-REFERENCE-DR01, NW-CATALOG-ORDER-01, C2 context coordinate maintenance (shared with TD-04), Canonical development dependencies, TR-ASSESSOR-ROLE-VIEW-INTERPRETATION, FRAMED-RECOVERY-01 (shared with TD-18), and the conditional rows C2 fixed-command LLM relay and Preconstruction correction/reuse. The source statements are in T-287 (compacted at TD-20; the management debt rows and the later capsules keep their text under their cut headings) and in the register's TD-21, TD-22 and TD-24 bodies.

Items.

1. Census first. For each of the twenty-eight rows: its source statement (T-287 heading and line at the head you start from, or the register body), the cut it was written at, the obligation in one sentence, and the current code path or surface it concerns (file and line at head). The census is the first section of the Return and is the frame for item 2.
2. Disposition, one per row, from this closed set, each with its evidence: (C) closed: the obligation is met at head; the line, lane or case that shows it (run the lane and give tests/pass/fail/skipped, or quote the code). (O) open defect: a reproduction at head (an existing red case, a new scratch case you ran, or an output that contradicts the obligation), with the owner, the file and line, and a one-paragraph package proposal (what would be deleted or changed, the proof, the Stop risks); no edit is made. (S) out of scope: not ABG library debt under the register's boundary (downstream T-043 ownership, unfinished qualification, excluded sandbox or security scope, a historical observation with no current path), with the sentence of the boundary that applies. (U) not reproducible at head: the old evidence cannot be reacquired (an absent store, an installed product or an environment variable the scenario needs; name it) and the current path shows no defect by reading; closed as no current claim, with the condition under which it would reopen. For TD-22's cost rows the register asks for one measured scenario: take the one installed or steel scenario that runs in this checkout without an absent input (candidates: `w2-steel-single-start`, `t287-installed-product-coordinate`, `steel-basic-cli-c2`, `t287-management-supervision`; state which ran and which are skipped and why), separate its time into initialization, native work, selection, admission, persistence and recovery by the owner's own phase accounting or a counter over the existing lane, and count repeated acquisitions by owner; a repeated acquisition you find is an (O) with its proposal, a cost with no repeated acquisition is (C) or (S) with the measurement. Do not generalize one scenario into a capacity claim.
3. Shared rows. For a row shared with a closed package (NW-DEBT-ADMISSION-DIAGNOSTIC-01 with TD-17; C2 context coordinate maintenance with TD-04 + TD-05), state what the closed package left and dispose of that remainder only. For a row shared with an open package (FRAMED-RECOVERY-01 with TD-18), dispose of this package's share and name what stays with the other.
4. Records. The register rows TD-21, TD-22 and TD-24 and the crosswalk's route column are the Executive's: for each, state the one-line disposition the Executive should record. If a T-287 statement is contradicted by your disposition, cite it and the disposition; T-287 is not edited (it keeps its history under its cuts).
5. Boundaries. No edit outside this record: no code, no test, no ticket, no register, no design. Lanes you run for evidence are existing lanes run unchanged; a scratch case lives in your scratch directory and is quoted in the Return.

Grant: this record (append only, your section). No other file.

Stop (write it in the Return, keep the rest moving): a row whose disposition needs an owner's contract or design decision (name the decision; it is a Phase C row, not yours); a row whose reproduction would need an absent input you would have to fabricate (dispose (U)); any edit outside the Grant.

Return contract: one commit on `main` with the first line `TD-21 + TD-22 + TD-24: the twenty-eight inherited rows revalidated at head; dispositions with evidence` and the last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Add only this record; no `git add -A`. Append `## TD-21 + TD-22 + TD-24 return` at the end of this record with the census (item 1), the disposition table with evidence per row and the (O) proposals (item 2), the shared-row statements (item 3), the records statements (item 4), the lanes you ran (item 5), and any stops. Nothing above your section is edited.

## TD-21 + TD-22 + TD-24 return

Worker, 2026-10-24.
- Base and head: `c21a758fef1347a12c85919e53280f13b848f25f`. The working tree had no tracked change before this append.
- No file outside this section was edited.
- Scratch cases, lane logs, V8 coverage and CPU profiles live under `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/td212224/`, in `cases/`, `lanes/`, `cov-compose/` and `prof-compose/`.
- The outputs this Return relies on are quoted below.

### Errata to the activation

1. **Count.** The activation names 31 rows:
   - TD-21: 8.
   - TD-22: 13 (ten, plus three conditional).
   - TD-24: 10 (eight, plus two conditional).

   The activation's twenty-eight does not match its own list of 31. This Return disposes of all 31. The commit subject keeps the activation's wording.
2. **TD-17.** The activation says TD-17's "F_D cause capture is closed; the F_P remainder is this row's". The record says otherwise:
   - F_D already kept its cause before TD-17.
   - TD-17 (`4bc5a945a`) gave the F_P synchronous throw and the F_P rejection their cause, through `deterministicFailure`.
   - TD-17 left the F_P `finalize` site as a retained exception (this record :399, :412).
   - TD-15 + TD-16 then moved that site onto `admitJson` (this record :1648).

   The remainder is that one site, which now has two paths (O-1).
3. **Candidates.** None of the four candidate scenarios runs an installed or traversal phase in this checkout; the table is in the TD-22 section. The measured scenario is `t287-calculus-state-transfer` with `ABI5_CALCULUS_CASES=compose`, which is outside the list. It is CALCULUS-SETUP-VOLUME-01's own scenario and carries the owner's phase accounting.

### 1. Census

- Source lines are T-287 lines at this head. Rows marked "table" are under `### Current Management Debt` (T-287:2042); the other headings are named.
- The cut is the evidence the row was written against.
- "Path" is the code or surface the row concerns at head. Paths are under `build_tenants/abiogenesis/typescript/code/src/` unless named otherwise.

| # | Row | Source | Cut | Obligation (one sentence) | Path at head |
|---|---|---|---|---|---|
| 1 | NW-DEBT-REPORT-COUNT-01 | table :2121; register TD-21 | failed C2 diagnosis (cut not named in the row) | Report counts agree with supported suite-abort evidence and with ordinary passing reports. | `implementation/worksite_command_helper.ts:936-965` (`reportCounts`), `:1398-1412` (report predicates) |
| 2 | CALLER-PUBLIC-DIAGNOSTIC-01 | table :2090 | successor02 caller (cut not named) | The caller decodes a retained Public `data:application/json;charset=utf-8` diagnostic with the existing complete decoder when it next changes. | ABG decoder `abg/runtime_failure.ts:91-109`; the caller is downstream |
| 3 | NW-PREPARATION-OBSERVABILITY-01 | table :2119 | native-preparation-repair-01 (2026-09-24) | The existing diagnostic URI keeps the bounded native preparation cause, readable cold, with Public `run_evidence` digest checks. | `abg/runtime_failure.ts:94-109` |
| 4 | NW-NATIVE-ASSESSOR-PROVENANCE-CONTEXT-01 | table :2134 | Opus04 review, odd_glc fresh-native-01 (2026-09-24) | The native assessor context carries the existing path, digest and snapshot joins, requirement and binding meaning links, and C2 provenance as compact owner facts. | `abg/instruction_assembly.ts:1094-1095` |
| 5 | READBACK-ABSENCE helper false failure | table :2137 | LIVE07 (2026-09-21) | The qualification helper accepts a lawful `not_found` for a failed or no-result Run and still requires replay, the same prefix and refusal fidelity. | odd_glc `build_tenants/odd_glc/typescript/test/full-sandbox-support.mjs:855-871`; ABG `abg/project_read_ports.ts:1041-1058` |
| 6 | GJ-D2-UNDISPATCHED-CURSOR-REPORTING | :2341, under `## Current Generic Job Binding Repair (historical, 2026-09-18)` (:2245) | Generic Job binding repair (2026-09-18) | The undispatched-evidence matcher accepts the actual cursor origin when the entered cursor advances through an admitted route. | `abg/c_call.ts:6303-6362` (origins `:6341-6348`), `abg/traversal_cursor.ts:176-212`, `abg/runtime_history.ts:571-574` |
| 7 | D2-UNDISPATCHED-REFUSAL-01 | :5036-5050, under `## Deferred Assurance`; debt record `comments/codex/20260911_D2_BOUNDED_REPAIR/deferred-assurance/D2-UNDISPATCHED-REFUSAL-01.md` | Review18 (2026-09-11) | An undispatched refusal keeps its first cause, with zero actors and effects, through fresh result and replay. | `abg/c_call.ts:6303-6362`, `:6459-6470` |
| 8 | NW-DEBT-ADMISSION-DIAGNOSTIC-01 | table :2116 | c0-diagnosis-03, S02 retry implementation-01 (2026-09-23) | Preserve the real cause and its stage or refusal distinction when shared admission fails. | `implementation/leaf_invocation_port.ts:771-793`; `abg/traversal_route.ts:597-603`, `:633-647`; `abg/retry.ts:3070-3077`, `:4958-4970` |
| 9 | INSTALL-VERIFY-COMPUTE-01 | table :2073 | compiled-40 (2026-09-23) | Attribute Product verification compute, or accept a contraction that preserves Product admission. | `product/declaration_exports.ts:1263-1376`, `:1378` |
| 10 | CALCULUS-SETUP-VOLUME-01 | table :2074 | state-transfer-02 (2026-09-26) | Keep the owner's phase-level accounting that separates scenario fixture, Product provisioning and execution. | `test_env/support/root-installed-environment.mjs:25-28`, `:168-520` |
| 11 | CALLER-DURABLE-CONTEXT-01 / LIFE-01 | table :2080 | native44; program-construction installed04 and PC02 (2026-09-26/27) | The caller, runtime and readback path owns its cost; the cost of fresh Public result and replay is attributed. | `abg/project_read_definition_bindings.ts:579-700`, `abg/project_read_ports.ts:695-699` |
| 12 | CALLER-EVIDENCE-VOLUME-01 | table :2097 (sample :2046) | checkpoint29, S2 caller volume (2026-09-28) | Distinguish retained caller output from event history, and keep the necessary facts through existing identities. | evidence packaging (TD-19) |
| 13 | NW-CALLER-PREPARATION-LIFETIME-01 / LIFE-01 | table :2104 | core30/dev15, compiled10 (2026-09-24) | Trace repeated work in the actual install owner and over the preparation lifetime. | `product/install_product.ts:229-254`, `:412`; `abg/runtime_history.ts:486-491` |
| 14 | NW-DEBT-CONFORMANCE-COST-01 | table :2115 | finite05, installed07 (2026-09-23) | Retain conformance costs as observations, with no unchanged large preparation, heap or time increase, or cache. | `validator/conformance_operation.ts:201-260` |
| 15 | NW-DEBT-INVOKE-COST-01 | table :2117 | C9/C10, CW-C01 (2026-09-21) | Measure the removable extent of repeated installed payload verification in execution setup. | `implementation/leaf_invocation_port.ts:968`, `:1599-1600`; `product/semantics.ts:650`; `product/install_product.ts:123-200` |
| 16 | Design execution cost | table :2123 | DESIGN10 (2026-09-21) | Account the actor-facing Design lifecycle's timeout as framework cost; further paid calls are held. | the actor Design lifecycle; `product/semantic_job.ts:197-205` |
| 17 | Mechanical context repetition (input side) | table :2124 | DESIGN08, DESIGN09, DESIGN12 (2026-09-21) | Explicit index display and source-equivalent input contraction; both unselected. | `abg/instruction_assembly.ts` rendering; `product/semantic_job.ts` actor contract |
| 18 | Fresh sandbox setup cost | table :2132 | LIVE05/06 (2026-09-21), fresh-native-01 (2026-09-24) | Attribute fresh-sandbox setup cost; request sizes are not read counters. | the ABG setup path (measured in the TD-22 scenario) |
| 19 | CALCULUS-BODY-01 | table :2079 | body-01, core41 (2026-09-26) | Partial-envelope persistence only on an affected storage path with attributed material cost. | `abg/event_store.ts:2267` (`appendDurablyBatch`) |
| 20 | NW-F11-SCOPE-COST-01 | table :2091 | compiled-01 (2026-09-23) | Independent J, complete applicable coverage and sole AF22 remain open qualification. | qualification, not a code path |
| 21 | NW-PRODUCT-VERIFICATION-REUSE-01 | table :2107 | core03/compiled08 | Keep bounded verifier reuse and per-operation physical checks; broader capacity is a separate question. | `product/declaration_exports.ts:1378` |
| 22 | NATIVE-EVIDENCE-RECOVERY-01 | table :2088; later dispositions :1064-1066 | evidence-context-01, native42/44 (2026-09-26) | Evidence-only recovery is reachable from the operational preparation failure and conserves completed work. | `product/semantic_revision.ts:276-279`, `:312-313` |
| 23 | CALCULUS-PROOF-01 | table :2082 | calculus crosscut rank 1 (2026-09-26) | Full native intake proof, owned by the installed continuation. | qualification, not a code path |
| 24 | DESIGN-REFERENCE-DR01 | table :2099 | core31, native-d2-01 (2026-09-24) | Revision Design rendering and expansion share the exact 29-entry revision domain. | `product/semantic_job.ts:197-205`; `implementation/semantic_revision.ts:68-69`; `abg/instruction_assembly.ts:1150-1153` |
| 25 | NW-CATALOG-ORDER-01 | table :2112 | D5-A01-CASE01 (2026-09-21) | Accepted lock, install and catalog order agree, and a malformed order is refused. | `product/catalog.ts:428` |
| 26 | C2 context coordinate maintenance | table :2105 | compiled-19 (2026-09-23) | On any change to the packaged member, refresh the pinned member and span coordinates and keep the correspondence guard. | `gtl/worksite_command_execution.ts:36-39`, `:61`; `scripts/generate-product-manifest.mjs:94-107` |
| 27 | Canonical development dependencies | table :2130 | TRUST01 (2026-09-21) | The declared ajv and ajv-formats are present in the canonical `node_modules`. | `package.json:87-88`, `:90-96` |
| 28 | TR-ASSESSOR-ROLE-VIEW-INTERPRETATION | :3088-3112, under `##### MVP bug register` (:2777) | LIVE06 (2026-09-17) | A recorded assessor interpretation error; it reopens on role-context tuning or an outcome impact. | assessor role context |
| 29 | FRAMED-RECOVERY-01 | table :2071 | FRAMED_GOVERNANCE source acceptance (2026-09-28) | Select one installed fresh-work discriminator; exact resumption is separate. | the installed retained-work scenario |
| 30 | C2 fixed-command LLM relay | table :2129 | TRUST01 (2026-09-21) | An owner re-ruling comes before any replacement of the relay. | the C2 `worker_executes` route |
| 31 | Preconstruction correction/reuse | table :2138 | design05, LIVE07 (2026-09-21) | A declared early correction in the downstream declaration, selected when needed. | the odd_glc declaration |

### 2. Dispositions

**Totals:** C 10, O 5, S 5, U 11, which makes 31.

| Package | C | O | S | U |
|---|---|---|---|---|
| TD-21 | 4 | 1 | 1 | 2 |
| TD-22 | 3 | 4 | 2 | 4 |
| TD-24 | 3 | 0 | 2 | 5 |

The Phase C column names an owner decision, listed again under Stops.

| # | Row | Class | Evidence at head | Phase C |
|---|---|---|---|---|
| 1 | NW-DEBT-REPORT-COUNT-01 | U | **Absent input:** the retained C2 abort reports. A search of the evidence tree found no suite report with `errors="1"`.<br>**Reading:** `reportCounts` counts testcase children only (`:944`: "aggregate attributes are never trusted, and testcase children alone count"). The T-287 shape, a suite `errors="1"` with no testcase child, therefore still counts 0 errors, by design.<br>**Scratch:** `junit-report-counts.mjs` runs the helper's own `reportCounts` over Node v24.7.0 reports:<br>- A load abort, a describe-body throw, a before-hook abort and a late uncaught error each arrive as testcase failures (1, 1, 2 and 1), exit 1.<br>- An after-hook failure arrives as one passing testcase, exit 0.<br>- The passing report reads 3 tests, 2 pass, 1 skipped.<br>- The synthetic suite-only shape reads `errors: 0`.<br>**Reopens:** when a retained or new report carries a suite-level error with no testcase child. | P1 |
| 2 | CALLER-PUBLIC-DIAGNOSTIC-01 | S | The caller is the downstream successor02 helper. ABG's decoder is `readRuntimeFailureDiagnosticSubject` (`abg/runtime_failure.ts:99-109`), which checks a canonical round trip. The row itself reads "Caller-only diagnostic debt".<br>**Boundary (TD-24):** "Ordinary unfinished feature qualification, downstream-domain work and explicitly excluded sandbox/security scope are not imported as ABG library debt." | |
| 3 | NW-PREPARATION-OBSERVABILITY-01 | C | - `t287-runtime-failure-diagnostic` 15/15/0/0.<br>- Three `t287-undispatched-diagnostic` cases pass: "first preparation exception remains retrievable through the unchanged typed refusal and cold JSON"; "other pre-dispatch catches keep exact stage and native stack"; "existing run_evidence exposes digest-bound undispatched diagnostics and refuses cold substitution".<br>- The row's installed diagnosis is qualification. | |
| 4 | NW-NATIVE-ASSESSOR-PROVENANCE-CONTEXT-01 | U | **Absent input:** a native assessor run on an admitted store, as in the Opus04 run; that is a paid actor call.<br>**Reading:** since `e9402b813` (2026-09-25, after the review), the native assembly's included rows carry `relativePath`, `digest` and `byteLength`, plus the native context ref and digest (`abg/instruction_assembly.ts:1094-1095`).<br>**Not traced:** the requirement and binding meaning links, and C2 provenance.<br>**Reopens:** on the row's own trigger, the next affected assessor-context change or a material recurrence. | |
| 5 | READBACK-ABSENCE helper false failure | C | - **odd_glc** (commit `6d6ce92`, 2026-09-24; odd_glc head `36d40d5`): `full-sandbox-support.mjs:855-871` treats `run_result` `not_found` with exit 1 as the expected absence for `blocked` and `runtime_failed`, and still checks replay.<br>- **ABG at head:** scratch `cross-cut-read-acquisitions` on one store returns `run_result` as refusal `not_found` and `run_replay` as a result (`abg/project_read_ports.ts:1041-1058`). | |
| 6 | GJ-D2-UNDISPATCHED-CURSOR-REPORTING | C | - The matcher resolves origins at `c_call.ts:6341-6348` through `traversalCursorAdmissionEventsAtPrefix` (`traversal_cursor.ts:176-212`).<br>- It admits `traversal_cursor_entered`, `traversal_route_admitted` (target cursor) and `fh_interaction_resume_admitted`, under the `cursor-origin:` key (`runtime_history.ts:571-574`, `2a4dee94c`, 2026-09-26).<br>- The lane case `t287-undispatched-diagnostic:93` is red at head on its fixture (F3).<br>- Scratch `undispatched-cursor-origins.test.mjs` passes 1/1. It is that case with two fixture corrections: the mock index answers the head key families, and it answers the matcher's `runtimeEventBodiesAtPrefix`. | |
| 7 | D2-UNDISPATCHED-REFUSAL-01 | C | - The cause-retention cases pass (row 3).<br>- The matcher accepts the actual origin (row 6).<br>- The closure's "actual undispatched negative" is its own trigger, "before D5 failure/refusal qualification" (T-287:5036-5050). That is qualification, not library debt. | |
| 8 | NW-DEBT-ADMISSION-DIAGNOSTIC-01 | O | O-1. F_D cause retention is closed (TD-17 return). | P2 |
| 9 | INSTALL-VERIFY-COMPUTE-01 | O | O-2 (R1). | P3 |
| 10 | CALCULUS-SETUP-VOLUME-01 | C | - The owner's accounting (`accountSetupPhase`, `root-installed-environment.mjs:25-28`) produced the phase split in the TD-22 section.<br>- T-287:2074 reads: "Current accounting answers that conflation". | |
| 11 | CALLER-DURABLE-CONTEXT-01 / LIFE-01 | O | O-3 (R4). | |
| 12 | CALLER-EVIDENCE-VOLUME-01 | S | - The checkpoint29 volume is a historical observation.<br>- The current mechanism is TD-19 (open; Phase C "stop copying now").<br>- **Crosswalk:** "current tree census is separate from historical caller traffic".<br>- **Boundary (TD-22):** "no heap/timeout increase, arbitrary universal quota, speculative redesign or blanket performance claim follows from old observations." | |
| 13 | NW-CALLER-PREPARATION-LIFETIME-01 / LIFE-01 | O | O-4 (R3). R2, the repeated install-time hashing, is necessary work; see the R table. | P4 |
| 14 | NW-DEBT-CONFORMANCE-COST-01 | U | **Absent input:** the finite05/installed07 installed S02 continuation (odd_glc).<br>The measured scenario reaches no conformance owner; coverage finds zero calls to `evaluateGtlProgramConformance*`.<br>**Reading:** `validator/conformance_operation.ts:201-260` admits the packet once and builds the validation input once from the resolved closure.<br>**Reopens:** when an installed conformance scenario runs in this checkout. | |
| 15 | NW-DEBT-INVOKE-COST-01 | O | O-5 (R5). | P5 |
| 16 | Design execution cost | U | **Absent input:** a paid Design actor run; T-287:2123 holds further paid calls.<br>**Reading:** the typed Design response covers both ordinary and revision Design (`product/semantic_job.ts:197-205`).<br>**Reopens:** when a selected Design run times out again. | |
| 17 | Mechanical context repetition (input side) | U | **Absent input:** a rendering of the retained DESIGN09/DR01 inputs at head. The revision request is refused before rendering (P8; scratch `dr01-probe*.mjs`).<br>The DESIGN09 output contraction stands; the input contraction is unselected (T-287:2124).<br>**Reopens:** when the input contraction is selected, or when a rendered input under an admitted profile shows the repetition. | P6 |
| 18 | Fresh sandbox setup cost | U | **Absent input:** the LIVE05/06 fresh sandbox (odd_glc).<br>ABG's own setup in the measured scenario is 33,991.51 ms of initialization. The repeated acquisition found there is R1; R2 is necessary per-tree hashing plus the harness check.<br>**Reopens:** when a fresh-sandbox scenario runs in this checkout. | |
| 19 | CALCULUS-BODY-01 | C | Persistence in the scenario: 24 `appendDurablyBatch` calls, 0.189 s CPU (profile run); the log grows from 3,223,224 to 3,472,400 B (7 to 87 events). Cold-body reuse is closed (T-287:2079). The partial-envelope trigger, a material storage cost, is not met. | |
| 20 | NW-F11-SCOPE-COST-01 | S | The open items are qualification: "Actual independent J, complete applicable coverage and sole AF22 remain open; no native qualification is inferred."<br>**Boundary:** TD-24's sentence (row 2); the crosswalk reads "TD-22 only if new cost selected". | |
| 21 | NW-PRODUCT-VERIFICATION-REUSE-01 | C | The scenario verifies once per artifact: coverage finds 1 call to `resolveNativeDeclarationClosures`. Per-operation checks are kept (R5). No broader capacity claim is made. | |
| 22 | NATIVE-EVIDENCE-RECOVERY-01 | U | **Absent input:** both pieces of evidence that would show the relation.<br>- The component case `t287-native-semantic-revision:531` is red at `:588`, before its subject: "Event Calculus requires a nominal validated immutable event prefix" on a hand-built prefix. It is a recorded baseline red (this record :1840), in the TD-05 class.<br>- The native44 territory is absent.<br>**Reading:** `product/semantic_revision.ts:276-279` and `:312-313` keep the operational producer's evidence on the Evidence-only suffix, with its construction coordinate checked. The Product-value cases `:472` and `:489` pass but do not exercise that suffix.<br>**Reopens:** when TD-05 retires the hand-built prefix and `:531` reaches its subject, or when an installed Evidence-recovery continuation is reacquired. | |
| 23 | CALCULUS-PROOF-01 | S | "Full native intake is still unproved and belongs to the preserved installed continuation" is qualification.<br>**Boundary:** TD-24's sentence (row 2). | |
| 24 | DESIGN-REFERENCE-DR01 | U | **Reading:** the correction is in place at all three call sites: `product/semantic_job.ts:197-205` takes the revision envelope, and `implementation/semantic_revision.ts:68-69` and `abg/instruction_assembly.ts:1150-1153` expand through it. `t287-management-context` passes 14/12/0/2.<br>**Absent input:** the proving case `t288-instruction-assembly-owner:499`, run with its retained directory, fails at `:516`. Its first refusal is the retained intake's prefix coordinate, stamped `eventContractDigest sha256:4196aaeb…`. Head admits only the legacy `fc3a6350…` and the current `6c8a9852…` (`abg/event_store.ts:1189-1190`).<br>Re-stamping that coordinate would fabricate the input.<br>**Reopens:** when a retained input exists under an admitted profile (P8). | P8 |
| 25 | NW-CATALOG-ORDER-01 | C | **Commit:** closed at `ae57b16bd` (2026-09-27).<br>**Scratch:** `catalog-order-head.mjs` runs the review's actual `catalog.admit` input against the head build:<br>- 5 checks pass: lock-ordered input accepted; install order conserved; reordered installs refused `binding_lock_mismatch`; verified and publication order canonical; missing install refused `installed_product_mismatch`.<br>- The input `sha256:49f803a2…` is unchanged.<br>- `catalog.ts` moved from the reviewed `bd2a160d…` to `69f3462c…`, with the behaviour kept. | |
| 26 | C2 context coordinate maintenance | C | Scratch `c2-pin-check.mjs` transcribes `generate-product-manifest.mjs:94-107` and finds the pin exact at head:<br>- 115,562 B<br>- `sha256:a8d7035f…`<br>- span 105,477-107,909, `sha256:1fcd7184…`, equal to the renderer text at one occurrence<br>The trigger stands for any later change to the member. | |
| 27 | Canonical development dependencies | C | The canonical `node_modules` holds `ajv` 8.20.0 and `ajv-formats` 3.0.1 (`npm ls`), matching `package.json:87-88` and the bundled list `:90-96`. | |
| 28 | TR-ASSESSOR-ROLE-VIEW-INTERPRETATION | U | **Absent input:** the LIVE06 assessor run (a paid actor call). The capsule makes no outcome-loss claim.<br>**Reopens:** on its own trigger, role-context tuning or a demonstrated outcome impact. | |
| 29 | FRAMED-RECOVERY-01 (this share) | U | **Absent input:** the installed retained-work territory (`/private/tmp/abi5-s7-retained-work-s5CZt2` is absent).<br>**Last evidence:** `comments/codex/20260928_FRAMED_GOVERNANCE/execution.md:3144-3154` accepts the bounded installed fresh case: source acquisition from the stopped Run, original producer use, fresh F_P selection, independent assessment and both cold Public reads.<br>The fresh-use code was not traced at head.<br>**Reopens:** when an installed retained-work scenario is reacquired. Exact resumption stays with TD-18. | |
| 30 | C2 fixed-command LLM relay | U | **Absent input:** `ABI5_C2_CARRIER_FIXTURE_PATH` (`steel-basic-cli-c2` 6/0/0/6). A live C2 run is a paid actor call. The relay's cost is unmeasured.<br>**Reopens:** on an owner re-ruling. | P7 |
| 31 | Preconstruction correction/reuse | S | The missing backward edge is in the odd_glc declaration (T-287:2138), and the row calls itself an "Unselected design/composition opportunity".<br>**Boundary:** TD-24's sentence (row 2). | |

#### (O) proposals

No edit is made. Each proposal lives in this Return only.

**O-1. NW-DEBT-ADMISSION-DIAGNOSTIC-01: F_P `finalize` loses its cause.**
- **Owner:** the leaf invocation owner, `implementation/leaf_invocation_port.ts:771-793`.
- **Reproduction:** scratch `fp-finalize-paths.test.mjs` takes the lane's `sourceOwner` pattern and the F_P fixture of `t287-runtime-failure-diagnostic` (`:376-416`), and changes only the value `complete` returns. It covers two paths:
  - A non-I-JSON value (`value: NaN`): `admitJson` refuses at `:773`, and `:783` totalizes the result.
  - A cyclic value: `admitJson` throws `RangeError`, and the catch at `:787` totalizes it.
- **Result:** both give `failureClass: "malformed_return"`, `diagnosticRef: "diagnostic://abiogenesis/implementation/malformed-return@5"` and `coldSubject: null`.
- **Change:** give TD-17's producer (`deterministicFailure`, `:559`) a failure-class parameter. Then `finalize` builds `malformed_return` with a diagnostic subject through `constructRuntimeFailureDiagnosticRef`:
  - on a refusal, the subject carries the admission refusal's `at` and `reason`;
  - on a throw, it carries the error's class and message.

  A shape-guard refusal (`isLeafRealizationCandidate` false) keeps the class-only reference, because the class is its cause.
- **Sequence:** run after the Phase C `admitJson` totality package, which deletes this catch (site 13, this record :1648). After it, a cyclic value takes the refusal path. The same `try` also encloses the success validator and the receipt builder, so how a throw from either is routed is that package's decision, and O-1 follows it.
- **Proof:** both scratch inputs read back a cold subject that names their cause; `t287-runtime-failure-diagnostic` reads 15/15 plus one case; the failure class and the receipt shape are unchanged.
- **Stop risks:** the subject must not carry the private body (TD-17's conventions); any change to the failure class or the receipt shape is a contract change.

**O-2. INSTALL-VERIFY-COMPUTE-01 (R1): the declaration closure is re-walked per exported symbol.**
- **Owner:** Product verification, `product/declaration_exports.ts:1360-1374`.
- **Reproduction, coverage run:**
  - `exportedSymbolPhysicalRelationRefs`: 15 calls.
  - `direct`: 24,951,698 calls, of which 643,478 are analyses (cache misses).
  - Worklist pops: 351.6 M, of which 92.9 % are revisits.
- **Reproduction, profile run:**
  - 12.528 s inclusive and 3.593 s self (the walk) under that function.
  - This sits inside `resolveNativeDeclarationClosures` at 19.023 s, which is inside `provisioning_verify_artifact` at 23,934.78 ms wall (timing run).
- **Change:** delete the per-export `pending`/`visited` walk. Per call, condense the `direct(symbol).dependencies` graph into strongly connected components and compute each component's refs once, in reverse topological order. Each exported symbol then reads its component's sorted refs.
- **Proof:**
  - For the 15 calls of this scenario, the per-root result maps are canonical-JSON equal before and after (scratch harness).
  - The verification lanes are unchanged.
  - The pop count and `provisioning_verify_artifact` drop in the same scenario.
- **Stop risks:**
  - Cycles: the comment at `:1284` forbids caching an incomplete transitive result. A component's union is complete by construction; a memo filled during the DFS would not be.
  - Alias symbol identity: `direct` already follows alias targets.
  - The cache scope stays per call (P3).

**O-3. CALLER-DURABLE-CONTEXT-01 / LIFE-01 (R4): one cold Public read folds the whole history 3 or 4 times.**
- **Owner:** the project-read owner, `abg/project_read_definition_bindings.ts:579-700`.
- **Reproduction:** scratch `cross-cut-read-acquisitions`, `-owners` and `-passes` run over the lane's retained D2 store (13,540,472-byte log) and count `fs.readSync` calls and whole-history passes.
  - A Run read (`run_status`, `run_result`, `run_replay`) reads the history 3 times: 1,899 calls, 40,621,416 B, 1.27-1.30 s each.
  - A GraphCall read reads it 4 times: 2,745 calls, 54,161,888 B, 3.38 s each.
- **The passes:**
  1. The reopen descriptor fold (`reopenEventStore` → `decodeRuntimeHistoryDescriptor`, under `acquireAbgEventResource`, `:579`).
  2. `DurableHistoryDerivation.activeEvents` under `projectExactPrefixWorkspaceEnvironment` (`:605`, artifact truth).
  3. `activeEvents` under `prepareRunReadAtDurablePrefix` (`:694`).
  4. GraphCall reads only: a further materialization in the GraphCall projection (`abg/project_read_ports.ts:695-699`).
- **Change:** one materialization of the acquired prefix per Public read, consumed by the environment projection, the Run-read preparation and the GraphCall projection. The reopen fold stays.
- **Proof:** `t287-cross-cut-public-read` unchanged (5/4/1/0, with `:105` a baseline red), and the scratch counter showing 2 passes per read with identical outcomes and codes.
- **Stop risks:**
  - The shared materialization lives for one read only; there is no side store (the log principle).
  - The environment and the Run read must be checked to be on the same prefix.
  - Phase C's Run-read validity ruling (whole-prefix refusal) holds.
  - If TD-12's ruled "one acquisition per admitted prefix" covers project reads, this rides with TD-12.

**O-4. NW-CALLER-PREPARATION-LIFETIME-01 / LIFE-01 (R3): held history is re-verified on every materialization.** Conditional on P4.

*R2: not a repeat.*
- **Coverage run:** the bootstrap runs `installedPayloadMatchesGraphCarrier` 5 times, with 15,937 `sha256File` calls:
  - the core payload (archive of 5,309 members) three times: at its install (`install_product.ts:412`), by the harness (`root-installed-environment.mjs:311`), and by the dependent Product's dependency check (`installedDependencyMatchesLockRow`, `:229-254`, hash at `:247`);
  - the additional Product twice: at its install and by the harness (`:331`).
- **Reading:** `managedDependencyRoot` (`:207-228`) accepts only a dependency root inside the dependent's own `targetRoot` (`:219-224`). Each install runs its own `npm install` into an empty target (`:351-371`). So the `:247` hash covers the dependent's own physical copy, not the tree `:412` already checked. It is a required physical check of different bytes.
- The only same-tree second hash is the harness's, which is test support. No library change is proposed.

*R3.*
- **Reproduction:**
  - Coverage run: the installed process makes 1,068 `RuntimeHistorySelection.materialize` calls and reads 9,389 rows, for a log of 7 to 87 events.
  - Profile run: 3.622 s CPU under `materialize`. Most of it is re-verification: `hash.update` 1.291 s and `writeCanonicalJson` 1.260 s.
  - First callers: `indexedRuntimeEvents` (`abg/event_prefix.ts:737-738`, a `select(key).materialize()` per call) 1.174 s, `observeNativeFrameLiveness` (`abg/runtime_liveness.ts:255`) 0.961 s, `observeNativeCCallLiveness` (`:313`) 0.659 s.
  - Traversal is 4,373.79 ms wall (timing run). The profile does not split `materialize` by phase.
- **Change, if P4 allows it:** the held store keeps the verified bodies of its current generation and reads them by row location and digest, in place of re-reading and re-hashing.

- **Proof:** the same scenario's materialization and row-read counters drop; the existing lanes are unchanged.
- **Stop risks:** `runtime_history.ts:486` ("Complete historical materialization is explicit and never retained here") and the log principle.

**O-5. NW-DEBT-INVOKE-COST-01 (R5): the installed payload is re-verified on every leaf invocation.** Conditional on P5.
- **Owner:** the leaf invocation owner, `implementation/leaf_invocation_port.ts:968` (port construction) and `:1599-1600` (each invocation's `verifyAuthority`). The call chain is `product/semantics.ts:650` → `installedProductContentMatches` → a full locator hash (`install_product.ts:154-158`).
- **Reproduction:**
  - Coverage run: 5 `verifyInstalledContent` calls in one Run, one per port and four per leaf invocation.
  - The invoked fixture Product has 4 locators: 24 `sha256File` calls in the installed process.
  - Profile run: 0.024 s CPU, negligible here. The cost is linear in the invoked Product's inventory.
- **Change, if P5 allows it:** verify at port construction, and bind each invocation to that verified install identity with a currentness check that does not re-hash.
- **Proof:** the same counter shows 1 full verification per port; the leaf invocation lanes are unchanged.
- **Stop risk:** T-287:2107 keeps "per-operation authorization/currentness and physical checks", so the contract decides.

### TD-22 measured scenario

**Candidates.**

| Candidate | At head | Why it is not the scenario |
|---|---|---|
| `w2-steel-single-start` | 8/6/1/1 | Validation only, with no installed or traversal phase. The `:118` red is attributed (`work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8-run-postclose-attribution.md:78`; this record :1893). The skip has `W2_STEEL_RETAINED_EVENT_PATH` unset. |
| `t287-installed-product-coordinate` | 11/11/0/0 | Coordinates over `fixture://lock`; nothing is installed or run. |
| `steel-basic-cli-c2` | 6/0/0/6 | All six skipped: `ABI5_C2_CARRIER_FIXTURE_PATH` is unset. |
| `t287-management-supervision` | 5/4/1/0 | The installed case refuses at setup with `dependency_lock_mismatch` (`product/install_product.ts:431-434`). This is the recorded `:105` baseline red (this record :1827). |

**Scenario:** `t287-calculus-state-transfer` with `ABI5_CALCULUS_CASES=compose`. It is outside the candidate list.
- It installs a real core (archive 10,795,452 B, 71,207,399 B unpacked, 5,309 members) plus one additional Product.
- It admits the workspace, runs a deterministic traversal with no actor, and returns `seed!!`.

**Runs.** The lane ran unchanged three times, each 2/2/0/0:
- timing, uninstrumented: 43,841.67 ms lane duration;
- V8 coverage (`NODE_V8_COVERAGE`): call and block counts, with distorted timing;
- CPU profile (`--cpu-prof`): 45,239.41 ms.

Each number below names its run.

**Phase split (timing run).** The source is the owner's `accounting.wallMs` from the test's diagnostic line. Wall intervals include I/O; the owner records `cpuAttribution` as "unmeasured".

| Class | Owner phases (ms) | Total ms |
|---|---|---|
| Initialization | pack 3,373.26; extract 529.96; bootstrap owner loading 461.69; artifact verification 23,934.78; install 2,731.17; installed content check (harness) 587.55; additional Products 2,098.01; installed owner loading 275.09 | 33,991.51 |
| Selection | publication, program and catalog 460.21; resolution and program validation 811.92; graph and implementation resolution 214.43; basis and leaf port 59.92 | 1,546.48 |
| Admission | environment install and workspace admission 2,282.27; invocation admission 795.92 | 3,078.19 |
| Native work | open scope 157.04; traversal 4,373.79 | 4,530.83 |
| Persistence | Not separable by wall time; it is inside admission and traversal. Profile run: 24 `appendDurablyBatch` calls, 0.189 s CPU. The log grows from 7 to 87 events (3,223,224 to 3,472,400 B). | (no separate wall interval) |
| Recovery | Not exercised. The compose case has no failure, hold or resume. | 0 |

- `setupMs` is 38,618.07: initialization, selection and admission, with 1.9 ms unaccounted.
- The test took 43,755.15 ms.
- `/usr/bin/time` for the lane: 43.87 s real, 48.11 s user, 8.18 s sys, 2,983,346,176 B maximum resident set.

**Repeated acquisitions by owner.**

| | Owner, file:line | Count (run) | Cost (run) | Row, class |
|---|---|---|---|---|
| R1 | Product verification, `product/declaration_exports.ts:1360-1374` | 15 calls; 24,951,698 `direct` calls, 643,478 of them analyses; 351.6 M pops, 92.9 % revisits (coverage) | 12.528 s inclusive, 3.593 s self (profile), within 23,934.78 ms of verification (timing) | INSTALL-VERIFY-COMPUTE-01, O |
| R2 | install owner, `product/install_product.ts:412` and `:247` | core payload hashed three times; 15,937 bootstrap `sha256File` calls (coverage). `:412` and `:247` hash different physical trees (the `:247` root must lie inside the dependent's own target, `:219-224`). The second hash of the same tree is the harness's (`:311`). | install 2,731.17 ms; additional Products 2,098.01 ms; harness check 587.55 ms (timing) | NW-CALLER-PREPARATION-LIFETIME-01; necessary work, not a library repeat |
| R3 | runtime history, `abg/runtime_history.ts:486-491` | 1,068 materializations and 9,389 row reads, over at most 87 events (coverage) | 3.622 s CPU (profile) | NW-CALLER-PREPARATION-LIFETIME-01, O (P4) |
| R4 | project read, `abg/project_read_definition_bindings.ts:579`, `:605`, `:694`; `abg/project_read_ports.ts:695-699` | 3 whole-history reads per Run read, 4 per GraphCall read (scratch over the lane's D2 store) | 1.27-1.30 s per Run read, 3.38 s per GraphCall read (scratch, counters on) | CALLER-DURABLE-CONTEXT-01, O |
| R5 | leaf invocation, `implementation/leaf_invocation_port.ts:968`, `:1599-1600` | 5 `verifyInstalledContent` calls per Run (coverage) | 0.024 s CPU (profile) | NW-DEBT-INVOKE-COST-01, O (P5) |

Limits:
- No capacity claim follows. This is one fixture scenario: one core and one small Product, deterministic, with no actor.
- Old T-287 times are not compared with these. Artifact verification measured 12.068 s at state-transfer-02 and 23,934.78 ms here; different cuts and archives make that difference unattributed.
- R4 was measured on a separate lane's store, not this scenario's.

### 3. Shared rows

**NW-DEBT-ADMISSION-DIAGNOSTIC-01 with TD-17 (closed).**
- **What TD-17 left:** the F_P `finalize` site (this record :399, :412). TD-15 + TD-16 then moved that site onto `admitJson` (this record :1648).
- **Remainder:** that site, disposed (O) as O-1.
- **The retry half of the T-287 row:** "a replay exception collapsed into null/route_mismatch" is the retained historical-route contract:
  - `abg/traversal_route.ts:597-603` sets `propagateReplayFailure` false, and the catch at `:633-647` returns null.
  - `abg/retry.ts:3070-3077` reads that null, and `:4958-4970` refuses with `route_mismatch`.
  - The lane asserts this contract: `t287-runtime-failure-diagnostic:208`, "historical route projection stays nullable while staged projection conserves its replay cause".
  - Carrying the cause there is an owner contract decision (P2), not this package's.
- **F_D:** cause retention is closed, which contradicts T-287:2116's F_D clause.

**C2 context coordinate maintenance with TD-04 + TD-05 (closed).** TD-04 + TD-05 left nothing for this row (this record :1124-1140; the register's TD-04 remaining increments do not name it). TD-15 + TD-16 refreshed the pin at `a692fb4b9` (this record :1910). The remainder is the standing trigger. At head the pin matches (row 26): (C).

**FRAMED-RECOVERY-01 with TD-18 (open).**
- **This package's share:** the installed fresh-work discriminator in T-287:2071. It is disposed (U) as row 29; its last evidence is the accepted bounded installed fresh case in `execution.md:3144-3154`.
- **What stays with TD-18:** exact execution resumption. "Fresh success does not close exact resumption" (T-287:2071). Phase C has ruled TD-18's recovery trace: "a resumption fact that is not an event in the log is a defect and is repaired; none found means closed".

### 4. Records

**Register rows.**

| Register row | One-line disposition to record |
|---|---|
| TD-21 | Revalidated at head. C: NW-PREPARATION-OBSERVABILITY-01, READBACK-ABSENCE, GJ-D2-UNDISPATCHED-CURSOR-REPORTING, D2-UNDISPATCHED-REFUSAL-01. O: NW-DEBT-ADMISSION-DIAGNOSTIC-01 (F_P `finalize` cause; package O-1, after `admitJson` totality). S: CALLER-PUBLIC-DIAGNOSTIC-01 (downstream caller). U: NW-DEBT-REPORT-COUNT-01 (report-contract decision P1), NW-NATIVE-ASSESSOR-PROVENANCE-CONTEXT-01. |
| TD-22 | One scenario measured, `t287-calculus-state-transfer` compose, with no capacity claim. O: R1 INSTALL-VERIFY-COMPUTE-01 (package O-2); R4 CALLER-DURABLE-CONTEXT-01 (O-3); R3 NW-CALLER-PREPARATION-LIFETIME-01 (O-4, after P4; R2 measured as necessary per-tree hashing); R5 NW-DEBT-INVOKE-COST-01 (O-5, after P5). C: CALCULUS-SETUP-VOLUME-01, CALCULUS-BODY-01, NW-PRODUCT-VERIFICATION-REUSE-01. S: CALLER-EVIDENCE-VOLUME-01 (TD-19), NW-F11-SCOPE-COST-01 (qualification). U: NW-DEBT-CONFORMANCE-COST-01, Design execution cost, Mechanical context repetition (P6), Fresh sandbox setup cost. |
| TD-24 | Triage done. C: NW-CATALOG-ORDER-01 (`ae57b16bd`), C2 context coordinate maintenance, Canonical development dependencies. S: CALCULUS-PROOF-01, Preconstruction correction/reuse. U: NATIVE-EVIDENCE-RECOVERY-01 (its proof waits on TD-05), DESIGN-REFERENCE-DR01 (P8), TR-ASSESSOR-ROLE-VIEW-INTERPRETATION, FRAMED-RECOVERY-01 (TD-18 keeps exact resumption), C2 fixed-command LLM relay (P7). No new package. |

**Crosswalk route column.**

| Row | Route to record |
|---|---|
| NW-DEBT-REPORT-COUNT-01 | U at TD-21; Phase C report contract (P1). |
| CALLER-PUBLIC-DIAGNOSTIC-01 | S: downstream caller; the ABG decoder exists. |
| NW-PREPARATION-OBSERVABILITY-01 | C at TD-21. |
| NW-NATIVE-ASSESSOR-PROVENANCE-CONTEXT-01 | U at TD-21; the row's own trigger. |
| READBACK-ABSENCE helper false failure | C (odd_glc `6d6ce92`). |
| GJ-D2-UNDISPATCHED-CURSOR-REPORTING | C at TD-21; lane `:93` fixture to TD-05. |
| D2-UNDISPATCHED-REFUSAL-01 | C at TD-21; the actual negative is D5 qualification. |
| NW-DEBT-ADMISSION-DIAGNOSTIC-01 | TD-17 closed F_D/F_P completion; `finalize` is O-1 at TD-21; retry route is P2. |
| INSTALL-VERIFY-COMPUTE-01 | O-2 (R1); P3 for cross-call reuse. |
| CALCULUS-SETUP-VOLUME-01 | C; phase accounting preserved and used. |
| CALLER-DURABLE-CONTEXT-01 / LIFE-01 | O-3 (R4), or TD-12 if its acquisition covers project reads. |
| CALLER-EVIDENCE-VOLUME-01 | S here; current mechanism TD-19. |
| NW-CALLER-PREPARATION-LIFETIME-01 / LIFE-01 | O-4 (R3) after P4; R2 is necessary per-tree hashing. |
| NW-DEBT-CONFORMANCE-COST-01 | U at TD-22; reopens with an installed conformance scenario. |
| NW-DEBT-INVOKE-COST-01 | O-5 (R5) after P5. |
| Design execution cost | U at TD-22; paid calls held. |
| Mechanical context repetition | U at TD-22; input contraction selection P6. |
| Fresh sandbox setup cost | U at TD-22; ABG setup measured (R1). |
| CALCULUS-BODY-01 | C; partial-envelope trigger not met (measured). |
| NW-F11-SCOPE-COST-01 | S: qualification. |
| NW-PRODUCT-VERIFICATION-REUSE-01 | C; per-operation checks retained (see P5). |
| NATIVE-EVIDENCE-RECOVERY-01 | U at TD-24; its component proof waits on TD-05's prefix fixture. |
| CALCULUS-PROOF-01 | S: qualification. |
| DESIGN-REFERENCE-DR01 | U at TD-24; correction present by reading; proof needs P8. |
| NW-CATALOG-ORDER-01 | C (`ae57b16bd`; head scratch). |
| C2 context coordinate maintenance | C; standing trigger; TD-04 left no remainder. |
| Canonical development dependencies | C (`ajv` 8.20.0, `ajv-formats` 3.0.1 installed). |
| TR-ASSESSOR-ROLE-VIEW-INTERPRETATION | U at TD-24; the capsule's own trigger. |
| FRAMED-RECOVERY-01 | TD-24 share U (installed fresh case accepted at `execution.md:3144`); exact resumption TD-18. |
| C2 fixed-command LLM relay | U at TD-24; owner re-ruling P7. |
| Preconstruction correction/reuse | S: downstream declaration. |

**T-287 statements contradicted at head.** T-287 is not edited; each statement keeps its cut.

| T-287 line | Statement | Disposition |
|---|---|---|
| :2112 | NW-CATALOG-ORDER-01 "OPEN catalog/environment consistency" | Closed at `ae57b16bd`; row 25. |
| :2130 | "declared ajv/ajv-formats absent from canonical node_modules" | Present at head; row 27. |
| :2137 | "full-sandbox-support.mjs asserts result before its no-result branch" | Corrected at odd_glc `6d6ce92`; row 5. |
| :2341 | "matcher seeks only an equal entered cursor" | Origins via routed and resumed cursors are admitted (`2a4dee94c`); row 6. |
| :2116 | "F_D authority refusal/loading/throw collapse into implementation_exception" | F_D keeps its cause; only F_P `finalize` remains; row 8. |
| :2071 | "OPEN … Prepare and select one installed fresh-work discriminator" | The same ticket's execution record accepts the bounded installed fresh case (`execution.md:3144-3154`); row 29. |
| :2088 | NATIVE-EVIDENCE-RECOVERY-01 "OPEN selected" | Superseded within T-287 by :1064-1066 (Native44 acceptance); U at head, row 22. |

Line drift, not a contradiction: register TD-21 "Known current limit" cites `worksite_command_helper.ts:865–898`; at head that is `:936-965`.

### 5. Lanes and scratch cases

Lanes ran from `build_tenants/abiogenesis/typescript` with `node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000`. The lane files are unchanged. The added flags and environment variables are named.

| Lane | tests/pass/fail/skipped | Used for |
|---|---|---|
| `w2-steel-single-start` | 8/6/1/1 | candidate |
| `t287-installed-product-coordinate` | 11/11/0/0 | candidate |
| `steel-basic-cli-c2` | 6/0/0/6 | candidate; row 30 |
| `t287-management-supervision` | 5/4/1/0 | candidate |
| `t287-calculus-state-transfer`, `ABI5_CALCULUS_CASES=compose`, three runs (plain; `NODE_V8_COVERAGE`; `NODE_OPTIONS=--cpu-prof`) | 2/2/0/0 each | TD-22 scenario |
| `t287-undispatched-diagnostic` | 7/5/2/0 (`:93`, `:222`, baseline) | rows 3, 6, 7 |
| `t287-runtime-failure-diagnostic` | 15/15/0/0 | rows 3, 8 |
| `t287-cross-cut-public-read` | 5/4/1/0 (`:105`, baseline) | rows 5, 11 |
| `t287-native-semantic-revision` | 9/4/4/1 (`:122`, `:270`, `:332`, `:531`, baseline) | row 22 |
| `t287-management-context` | 14/12/0/2 | row 24 |
| `t288-instruction-assembly-owner`, `--test-name-pattern 'actual derived revision successor shares complete typed assets'`, `ABI5_NATIVE_D2_DESIGN_DIRECTORY=…/author-context-policy-01` | 1/0/1/0; unset, 1/0/0/1 | row 24, F1 |

Scratch cases are in `cases/`. Each reads the head build or source and writes nothing into the repository.

| Case | Result |
|---|---|
| `c2-pin-check.mjs` | `"pass": true`; bytes 115,562; digest `sha256:a8d7035f…`; span 105,477-107,909, `sha256:1fcd7184…` |
| `catalog-order-head.mjs` | `{"status":"passed","checks":[5],"inputSha256":"sha256:49f803a2…","sourceSha256":"sha256:69f3462c…"}` |
| `undispatched-cursor-origins.test.mjs` | 1/1 pass: "undispatched refusal retains entered, routed and resumed cursor ownership at raw and cold boundaries" |
| `fp-finalize-paths.test.mjs` | both paths `{"failureClass":"malformed_return","diagnosticRef":"diagnostic://abiogenesis/implementation/malformed-return@5","coldSubject":null}` |
| `cross-cut-read-acquisitions.test.mjs`, `-owners`, `-passes` | the R4 counts and the owners of the passes |
| `junit-report-counts.mjs` and `junit/suites/*.test.mjs` | the row 1 counts; exit codes in `junit/exit-codes.out` |
| `dr01-probe.mjs`, `dr01-probe2.mjs`, `dr01-probe3.mjs` | head: `requestOk:false`, `intake:false`, `knownContract:false`, `digestMatch:true`; the library-delivery baseline build gives the same `requestOk:false` |
| `cov-counts.mjs`, `cov-ranges.mjs`, `prof-attr.mjs`, `prof-callers.mjs`, `prof-chain.mjs` | readers over `cov-compose/` and `prof-compose/` |

### Stops

These rows need an owner's contract or design decision. They are Phase C rows, not this package's.

- **P1, NW-DEBT-REPORT-COUNT-01.** Does a suite-level aggregate error with no testcase child count as an error? Head ignores aggregates by design (`worksite_command_helper.ts:944`).
- **P2, NW-DEBT-ADMISSION-DIAGNOSTIC-01 (retry).** Should the nullable historical route projection (`traversal_route.ts:633-647`, asserted at `t287-runtime-failure-diagnostic:208`) carry its replay cause to `route_mismatch` (`retry.ts:4958-4970`)?
- **P3, INSTALL-VERIFY-COMPUTE-01.** May direct analyses be reused across the 15 calls of one verification? The cache scope comment at `declaration_exports.ts:1284` limits it to "this checker and exact root/relation basis".
- **P4, NW-CALLER-PREPARATION-LIFETIME-01.** May a held store retain the verified row bodies of its current generation? `runtime_history.ts:486` says "never retained here", and the log principle applies.
- **P5, NW-DEBT-INVOKE-COST-01.** Does "per-operation physical checks" (T-287:2107) mean per leaf invocation, as at head (`leaf_invocation_port.ts:1599-1600`), or per port (`:968`)?
- **P6, Mechanical context repetition.** Selection of the input contraction (T-287:2124, unselected).
- **P7, C2 fixed-command LLM relay.** The owner re-ruling that T-287:2129 requires.
- **P8, DESIGN-REFERENCE-DR01 and retained stores.** Does event-profile admission cover the intermediate current profiles that retained stores were written under? An example is `sha256:4196aaeb…`, which stamps the 1,390,576,361-byte odd_glc core18 store that DR01's input and native34 coordinates name. `isKnownRootEventContractDigest` (`event_store.ts:1189-1190`) admits only legacy and current.
  - The profile name `p5-run-environment-role-context@1` is unchanged since `ad2a39f40`. Its digest moved between 2026-09-28 and 2026-10-06. The event-kind set changed at `1535e001b` (2026-09-28), `1aec3999f` (2026-09-29) and `0b1187c40` (2026-10-06); the move was not bisected.
  - The alternative is to retire the lanes that depend on those stores.
  - This bears on Phase C's evidence-root ruling: a store present under that root can still be refused at head.

### Findings outside the 31 rows

- **F1.** `t288-instruction-assembly-owner:499` is red at head when its retained directory is set: it fails at `:516` on P8's refusal.
  - The wave's lane tables ran it with the directory unset (11/4/0/7, this record :893, :1305, :1888), so the red is in no record.
  - The library-delivery baseline build (`work/T287_COMMON_LIBRARY_DELIVERY_01/proof/baseline-build/`) refuses the same input (`dr01-probe.baseline.out`), so the red predates this wave.
- **F2.** `t287-native-semantic-revision:531` fails on a hand-built prefix at `:588`. It is in the TD-05 class and is recorded as baseline (this record :1840).
- **F3.** `t287-undispatched-diagnostic:93` fails at `:135` on fixture drift: its mock index lacks the head key families (the `cursor-origin:` key since `2a4dee94c`) and the matcher's `runtimeEventBodiesAtPrefix`. The scratch copy with both corrections passes. This is a TD-05 increment.
  - `:222` fails with "event store was not constructed by this ABG module", also a fixture. It was not traced further.
- **F4.** `w2-steel-single-start:118` is already attributed (`step-8-run-postclose-attribution.md:78`; this record :1893).

Not done:
- No reproduction was fabricated; the U rows name their absent inputs.
- Rows 4 and 29 rest partly on unread paths, as stated in their cells.
- The 351.6 M and 92.9 % figures in R1 come from block counts in the coverage run. The other R1 figures are function counts.
