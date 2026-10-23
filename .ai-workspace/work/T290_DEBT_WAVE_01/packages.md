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
