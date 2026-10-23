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
