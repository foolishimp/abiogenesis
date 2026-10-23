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
