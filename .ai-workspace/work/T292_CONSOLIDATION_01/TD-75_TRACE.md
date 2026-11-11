# TD-75 trace: the terminal-quiescence note against the lifecycle rule at head

**Entry:** TD-75 (`.ai-workspace/TECHNICAL_DEBT_REGISTER.md:760-768`).
**Subject:** `abiogenesis`, branch `main`, head `c6530d986`, with a clean tenant code tree.
**Shorthand:** `T` = `build_tenants/abiogenesis/typescript`.
**Method:** an independent read-only trace. No test was run and no other file was written.

In this file:
- "Read" means the cited lines were opened during this trace.
- "Inferred" marks a conclusion drawn from lines that were read, which no single line states.

## Verdict

**No.** The answer is a mixture. The 2026-10-22 library re-entry replaced the note's decider, the meaning of `actor_cleanup_pending` and the census at the Run terminal (library design §4.4, decision D1, the T-287 supersession), while claiming its formulas unchanged. Four other clauses differ with no record at all.

| Class | Clauses |
|---|---|
| Equal in substance (A) | Ten |
| Changed by the 2026-10-22 library re-entry (B) | Three: the carrier form, the meaning and start of `actor_cleanup_pending`, and the Run census |
| No record (C) | Four (below) |

The re-entry changed the carrier form from a decider module to the fold rule `actor_process_lifecycle`. Its records are:
- library design §4.4, lines 201-211;
- owner decision D1;
- supersession at T-287 lines 1006-1012 and 6025-6028.

That record presents the change as continuity. It says "formulas unchanged" and "the cleanup token frontier is the matching Run stop", and no owner decision names the moved frontier.

The four clauses with no record are:
- `actor_process_termination_unconfirmed` initiates `actor_cleanup_live` before any Run terminal;
- the cleanup-live census at a Run terminal is not filtered to that Run;
- the post-Run cleanup protocol of the ratified posts was never realized;
- two Run-quiescence labels differ.

In every traced history the closure decision and the Run-quiescence disposition are equal. The differences are confined to:
- the held fluent set, and therefore the replay witness (`T/code/src/abg/replay.ts:1433`);
- the `blockingFluents` contents;
- which event initiates the cleanup fluent;
- the lifecycle projection of an actor that has no process row;
- the absence of any lawful event that ends cleanup when a Run terminal follows an unconfirmed termination.

TD-75's second hypothesis does not hold. It proposed that the RC10 to RC12 liveness packages replaced the design, but the lifecycle rule is unchanged from the L5 acceptance cut `46ed04895` to head. The replacing work is the 2026-10-22 library re-entry.

## 1. Classification rule

- **A:** the forms differ, and every traced history yields the same fluents, projection outputs and quiescence disposition.
- **B:** a rule differs, and accepted text dated after the note states the realized rule. The record is that text plus the decision that adopted it.
- **C:** a rule differs, and no accepted text states the realized rule.

L5 is supporting context only. The record is the owner's PASS on `46ed04895`, 2026-10-24 (T-287:329-331; T-287:821 still shows L5 as pending). It accepted the delivered library, but it states no lifecycle rule and never compared the rule with C1, so it is not the record for any clause.

## 2. The accepted rule, as clauses

The note (`T/design/T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN.md`) ratifies three layers:
1. The C1 lifecycle HOW and its retirement map (lines 3-45, 2026-10-21).
2. The lifetime HOW with supplement-02 (lines 47-64).
3. Four Codex posts, by digest (lines 72-94, accepted 2026-08-04). A later post supersedes only what it names (lines 91-93).

Each post file's sha256 equals its ratified digest (read).

Names used below:
- **C1** = `.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/e03-common-lifecycle-law-design-02/HOW-proposal.md`.
- **proof map** = `retirement-and-proof.md` in the same folder.
- **c295, b058, d3, 49ca** = the four posts under `.ai-workspace/comments/codex/`, timestamped `20260804T072110Z`, `T090750Z`, `T105623Z` and `T111837Z`.

Symbols (C1:25, :33):

| Symbol | Meaning |
|---|---|
| S | The admitted process start |
| T | A confirmed exit or spawn failure |
| U | A termination-unconfirmed observation |
| A | The actor terminal |
| R | The matching Run's `run_stopped`, or its `runtime_failure_observed` with aggregate type `run` |
| formerlyActiveActor | The actor is started and not terminal at R's predecessor |

| Id | Accepted clause | Source |
|---|---|---|
| N1 | One pure EC-owned decider, `decideActorProcessLifecycle(actorInvocationRef, actorRows, runTerminalRows)`, lives in the new module `abg/event_calculus_actor_lifecycle.ts`. It supplies the actor, EC, replay and liveness consumers. EC transition/holds remains the sole truth derivation. | note:13-15; C1:11-23, :86-94 |
| N2 | processLive = S and not T. It maps to `actor_process_live`. | C1:41, :90 |
| N3 | terminationUnconfirmed = not T and U. | C1:43 |
| N4 | Projected cleanupPending = not A and (T or U or (R and formerlyActiveActor)). This is the remaining actor obligation, which the projection presents. It is not the EC token, and the two "must not be silently conflated at a preterminal cut". | C1:23, :39, :45; note:17-18 |
| N5 | The token, cleanupTokenPending = not A and R and formerlyActiveActor, is `actor_cleanup_pending`. It begins only at R. It persists through uncertainty and later confirmation until the actor consumes it. A pre-Run U or confirmed exit initiates no token. | note:15-18; C1:47, :90; proof map:17-18, :26 |
| N6 | cleanupLive = cleanupTokenPending and processLive, held as `actor_cleanup_live`. It is false before R (C1 table rows at :54-55 and :62) and true at R for a live process (:60). The early cleanup initiation leaves the static uncertainty axiom. | C1:49, :90, :92; d3:103-105; proof map:17 |
| N7 | The census at R is the exact pre-event Actor census of the matching Run. It includes actors whose process exited, failed to spawn or has no admitted process row; the last are keyed by the canonical logical processRef. Each member gets one token. Actors already terminal are excluded. Tokens are attributed to the source Run-terminal event. This supersedes only b058's payload `cleanupPendingRows`. | note:22-30; C1:37, :70, :88 |
| N8 | A foreign Run terminal cannot affect an actor. Census and effects, cleanup-live included, use the exact Run join. | C1:25, :88, :90; proof map:22 |
| N9 | R ends `actor_invocation_active` and `actor_process_active` but not `actor_process_live`. Live and cleanup-live persist until a confirmed process terminal, and an actor failure does not prove the process absent. | d3:95-99, :107-110 |
| N10 | There is one start, at most one confirmed process terminal and at most one actor terminal. An exit needs a start, and a spawn failure forbids one. The actor terminal needs an earlier confirmed process terminal. | C1:27; b058:194-235 |
| N11 | Final physical facts and the admitted confirmed process witness govern terminality. Raw exit only ends capture. A transport-exception actor terminal invents no consumed artifact. | note:55-61 |
| N12 | A process start after the matching Run stop or failure is prohibited. Nothing is fabricated for an actor that has no process row. | note:32-38 |
| N13 | After R, only exact cleanup observations may append (c295:271-278). These are the `.cleanup` variants of the timeout, signal, spawn-failed, exited and termination-unconfirmed events. A later confirmed `actor_process_exited.cleanup` may follow an unconfirmed one (d3:166-170). Then one `actor_invocation_failed.run_cleanup`, or `actor_invocation_closed.cleanup`, consumes the token once. The actor terminal payload closes the stream, timeout and signal counts. | b058:213-218, :237-274; d3:122-192; 49ca:29-47 |
| N14 | The qualified actor terminal consumes the token once. cleanupDisposition takes the first rule that applies: actor terminal → complete; uncertainty → termination_unconfirmed; projected pending or live → pending; otherwise not_required. | C1:68; d3:152-156 |
| N15 | Replay renders terminationConfirmed as confirmed exit only, using the decision's exact witnesses. Liveness uses processLive and the actor-terminal witness. | C1:94 |
| N16 | `quiescent_for_close` holds only for an active Run with the exact closure spine and empty live, consumable and cleanup sets. `actor_process_live`, `actor_cleanup_live` and `actor_cleanup_pending` block; fresh repair successor eligibility requires the same three to be absent. An unknown Run-scoped fluent makes the projection `invalid_unknown_fluent`. | c295:239-242; b058:178-180, :190-193; d3:118-120 |

## 3. The realized rule at head, as clauses

Code paths are under `T/code/src/abg/`. All lines below were read.

| Id | Realized clause | Source |
|---|---|---|
| H1 | The decision is the rule `actor_process_lifecycle`, implemented by `deriveActorProcessLifecycle` and registered in `ROOT_DERIVED_RULES`. The fold is the only derivation. `projectActorProcessLifecycle` reads three fluents. No decider module exists, and `git log -S` finds none ever existed. | `calculus/rules.ts:126-182`, `:218-225`; `actor_process.ts:642-651` |
| H2 | A start initiates `actor_process_live` unless a process terminal is held. An exit or spawn failure terminates it. No axiom produces it. | `rules.ts:135-137`, `:148`; `calculus/axioms.ts:209-215` |
| H3 | U initiates `actor_process_termination_unconfirmed` unless a process terminal is held. An exit or spawn failure terminates it. | `rules.ts:152-155`, `:149` |
| H4/H5 | `actor_cleanup_pending` equals not A and (T or U or (R and census)). It is initiated at exit or spawn failure (`:146`) and at U (`:156`) unless the actor terminal is held, and at R for the census (`:167-177`). Any actor terminal carrying a processRef terminates it (`:159-162`). There is no separate token, and the projection's `cleanupPending` is this fluent. | `rules.ts`; `actor_process.ts:650-651` |
| H6 | `actor_cleanup_live` has three producers:<br>- U initiates it unconditionally (`axioms.ts:248-251`, `:1008-1013`);<br>- R initiates it for every held `actor_process_live` (`rules.ts:53-56`);<br>- an exit, a spawn failure or an actor terminal terminates it (`rules.ts:85-95`, `:206-211`). | as cited |
| H7 | The R census for pending is every process with `actor_process_live` or `actor_process_active` held and stamped with R's Run. An actor with no process row is not in it. | `rules.ts:170-176` |
| H8 | The pending census and the Run-scoped terminations are filtered to R's Run (`rules.ts:173`, `:78`). The cleanup-live census is not (`rules.ts:53-56`). | as cited |
| H9 | R ends `actor_invocation_active`, `actor_process_active` and the other Run-scoped active fluents of its Run. It does not end live. | `rules.ts:57-79` |
| H10 | The projection throws on a duplicate start or terminal, a spawn failure after a start, an exit without a start, and an actor terminal without a process terminal. The owner reports one terminal. | `actor_process.ts:628-641`, `:1591-1623` |
| H11 | `classifyOwnedProcessTerminal` selects the reported outcome (`actor_process.ts:1606-1623`). The actor terminal is appended only after a spawn failure or confirmed exit (`:1627`, `:1675`). The transport-exception terminal carries no `consumedArtifactEventRef` (`:1677-1694`). | as cited |
| H12 | No validator refuses a start after a Run terminal: `event_store.ts` has none, and `onProcessStarted` checks no Run (`actor_process.ts:1489-1497`). The one producer appends through the held-prefix assertion (`actor_process.ts:1232-1265`; `event_store.ts:2307-2324`). | as cited |
| H13 | There is no post-Run cleanup protocol: no `.cleanup` variant, no `run_cleanup` and no count closure (`git log -S` finds none ever existed). No post-R append restriction exists. | `event_store.ts` (searched) |
| H14 | Any actor terminal with a processRef ends pending. The disposition rules apply in the order complete, termination_unconfirmed, pending, not_required. | `rules.ts:159-162`; `actor_process.ts:666-672` |
| H15 | Replay reads `terminationConfirmed` from `actor_process_terminated` (`replay.ts:2491-2493`) and selects start and exit first-found (`:2448-2449`). Liveness reads the live fluent and the actor-done guard (`calculus/liveness.ts:786-789`; `runtime_liveness.ts:52-53`). | as cited |
| H16 | Live, cleanup-live and pending block (`replay.ts:281-290`). An unknown fluent blocks and gives `non_quiescent` (`:450-462`). A Run holding `run_terminal` or `run_closed` with no blockers is `quiescent_for_close` (`:476-479`). | as cited |

## 4. Trace table

| Clause | Equal? | Class | Record or absence (section 6) | What differs |
|---|---|---|---|---|
| N1 / H1 carrier | No (form) | B | Library design §4.4:187, :201-215; T-287 D1 | Decider module and transient decision versus a fold rule and fluent reads |
| N2 / H2 processLive | Yes | A | — | — |
| N3 / H3 terminationUnconfirmed | Yes | A | — | — |
| N4 / H4 projected cleanupPending | Yes, except h4 | A (h4: see D4) | — | Projection outputs are equal in h1, h2, h3 and h6 |
| N5 / H5 token frontier and meaning of `actor_cleanup_pending` | No | B, with a defective record | §4.4:206, :209-211 state it; the record claims continuity | The fluent holds before R after T, U or spawn failure, and attribution goes to that event rather than R (D2) |
| N6 / H6 cleanup-live before R | No | C | None later than the note | U initiates cleanup-live before R (D3) |
| N7 / H7 census | No | B | §4.4:209 | Actors with no process row are excluded (D4, h4) |
| N8 / H8 Run join for cleanup-live | No | C, latent | None | A foreign Run's terminal initiates cleanup-live (D5, h5) |
| N9 / H9 R effects on active and live | Yes | A | — | H6 also ends cleanup-live on an actor terminal; this is vacuous, because the owner appends an actor terminal only after a confirmed process terminal (`actor_process.ts:1627`, `:1675`; inferred) |
| N10 / H10 cardinality | Yes | A | — | The projection refuses where C1's decider refused |
| N11 / H11 physical confirmation | Yes | A | — | — |
| N12 / H12 post-Run start | Yes in effect | A (inferred, untested) | — | A Run terminal admitted by another writer moves the durable prefix, so the owner's next append fails the held-prefix check (`event_store.ts:2322-2323`). There is no Run rule, and cross-process store ownership was not traced. |
| N13 / H13 post-Run cleanup protocol | No | C | None | The protocol is absent (D6, h6) |
| N14 / H14 consumption and disposition | Yes | A | — | The ordinary actor terminal consumes pending; the variant grammar is D6 |
| N15 / H15 readers | Yes, on owner-produced prefixes | A | — | Replay's first-found selection differs only on a duplicate-terminal prefix. The owner never writes one, and the projection refuses it (`actor_process.ts:628-641`). |
| N16 / H16 blocking set | Yes | A | — | — |
| N16 / H16 unknown-fluent and terminal-Run labels | No (label) | C | None | Labels differ; the closure decision is equal (D7) |

## 5. Differing histories

Each history is one Run with actor A1 and process P1, except h5. The quiescence disposition is derived from these lines:
- `replay.ts:476-487`;
- `axioms.ts:1391-1409`: a Run failure ends `run_active` and initiates no `run_terminal`;
- `axioms.ts:1411-1444`: only a `run_stopped` without `reasonKind` initiates `run_terminal`.

Before R, the disposition is `active` under both rules, because no terminal route exists during an actor invocation. After a Run failure or an operator stop it is `invalid` under both, and after a stop without `reasonKind` it is `non_quiescent`. C1 changes only cleanup fluents, so the disposition is equal in every row (inferred from the lines above).

### Disposition is equal

| History and cut | Note: pending / cleanup-live / live / unconfirmed | Head: pending / cleanup-live / live / unconfirmed | Projection: cleanupPending, disposition |
|---|---|---|---|
| h1 `[S, T]`, before R | F / F / F / F | **T** / F / F / F | Note T, pending; head T, pending |
| h1 then R | T (R) / F / F / F | T (T) / F / F / F | Equal |
| h2 `[S, U]`, before R | F / F / T / T | **T** / **T** / T / T | Note T, termination_unconfirmed; head the same |
| h2 then R | T / T / T / T | T / T / T / T | Equal |
| h3 `[spawn_failed]`, before R | F / F / F / F | **T** / F / F / F | Note T, pending; head T, pending |
| h3 then R | T (R) / F / F / F | T (spawn) / F / F / F | Equal |
| h4: binding, actor started, no process row, then R | **T** on the canonical ref / F / F / F | F / F / F / F | Note T, pending (C1:61); head **F, not_required** |

### Blocking and witness differences

| History and cut | Blocking-list difference (head minus note) | Witness at this cut |
|---|---|---|
| h1 `[S, T]`, before R | + `actor_cleanup_pending(P1)` | Differs |
| h1 then R | none | Equal; attribution differs |
| h2 `[S, U]`, before R | + pending(P1), + cleanup-live(P1) | Differs |
| h2 then R | none | Equal |
| h3 `[spawn_failed]`, before R | + pending(P1) | Differs |
| h3 then R | none | Equal; attribution differs |
| h4 then R | − `actor_cleanup_pending(canonical)` | Differs |

### History notes

- **Attribution.** "(R)", "(T)" and "(spawn)" name the event whose step initiated the fluent. The fold records this in each step's transition effect, which `t287-calculus-fold.test.mjs:211-214` reads as `state.transition.effect`. Whether any reader outside tests exposes attribution was not traced.
- **Witness.** The held set enters the replay body at `replay.ts:1433` (`activeFluents: eventCalculus.holds.map(runtimeFluentKey)`).
- **h1 and h3 reachability.** Each `append` in the actor owner is its own durable transaction (`actor_process.ts:1232-1265`). The cut between the process terminal and the actor terminal therefore exists.
- **h4 reachability (read):**
  1. The owner admits the binding and `actor_invocation_started` (`actor_process.ts:1161-1206`).
  2. The governed-context check throws (`:1215-1217`).
  3. The inner catch appends no terminal while `processTerminalEvent` is null (`:1674-1698`).
  4. The outer catch returns a refusal (`:1700-1707`).
  5. HoG routes it through `failActorProcessEffect` (`hog/ccall_lifecycle.ts:558-559`), `failCCall` (`:843-850`, `:217-235`) and `failTraversal` (`hog/traversal_failure.ts:62-87`).
  6. `admitRuntimeFailure` appends `runtime_failure_observed` with aggregate type `run` (`abg/runtime_failure.ts:314-316`).
- **h4 blocking at head.** Quiescence still blocks through `actor_transport_binding_admitted`. Only an actor terminal consumes it (`axioms.ts:258`, `:262`, `:1045`). Neither the Run-terminal census (`rules.ts:57-79`) nor the Run-terminal axioms (`axioms.ts:345-360`, `:1391-1444`) end it.
- **h4 consumers.** The two consumers of the projection in `code/src` require `complete` (`c_call.ts:1941`; `worksite_construction_recovery.ts:285`), so no production decision changes. `projectActorProcessLifecycle` is exported from the ABG barrel (`index.ts:476`), so its output reaches outside callers.
- **h4 and T-287:1014-1015.** That clause keeps "a physical child without admitted start retains unresolved cleanup". If `onProcessStarted`'s append fails after a spawn, head reports `not_required` for that actor, though the binding still blocks (inferred; this failure path was not traced).
- **h5: two Runs in one prefix.** Run X stops while P2 of Run Y is live. The note gives cleanup-live(P2) = F (C1:25); head gives T (`rules.ts:53-56`), and pending stays filtered (`:173`). No reader I traced observes this:
  - quiescence requires a one-Run prefix (`replay.ts:386-390`);
  - the replay body uses the Run-scoped `runCalculus` (`:997`);
  - the whole-log `physicalCalculus` filters only `worksite_observation_current` (`:998-1003`);
  - scoped selection refuses a cross-Run causation (`event_store.ts:1548-1549`).
- **h6: `[S, U]`, then R, then anything.** This history is reachable (read): an unconfirmed outcome is reported (`actor_process.ts:1618-1620`) without setting `processTerminalEvent`, so no actor terminal follows (`:1627`, `:1675`). The refusal reaches `failCCall` and a Run failure, as in h4. The owner hands back final facts once (`:1600-1603`), and no other producer of actor or process events exists in `code/src`.
  - At head, live, cleanup-live, pending and unconfirmed hold at every later cut, and no event can end them.
  - The fold itself would end them if an ordinary exit and actor terminal were appended after R; `m5-terminal-quiescence-owner.test.mjs:148-178` appends both by hand. What is missing is a producer and the post-R grammar.
  - The projection's disposition stays `termination_unconfirmed`, so the two readers that require `complete` return null at every later cut (`c_call.ts:1933-1942`; `worksite_construction_recovery.ts:282-286`).
  - Whether either reader is the successor-eligibility gate of d3:118-120 is not established. The second recovers only a `no_output` failure with exit status 0.
  - Under the note the same state is lawful only while no confirmation arrives (d3:166-169). The note supplies `actor_process_exited.cleanup` followed by `actor_invocation_failed.run_cleanup` to end it, and head has neither.

## 6. The record, or its absence, behind each difference

The chronology was read from git and the records:

| Date | Commit or record | What it did |
|---|---|---|
| 2026-08-04 | Posts accepted | Note status block at lines 66-70 |
| 2026-08-06 | `785cfa9cc` (note file created) and `07004b977` | Added the quiescence terminal-Run branch (`replay.ts:476-479`) and the unknown-fluent blocking (`:450-462`) |
| 2026-10-09 | `727f1dbca` | Made the static and contextual U axiom initiate `actor_cleanup_live` and `actor_cleanup_pending`. Before it, the axiom initiated only `actor_process_termination_unconfirmed` (`git show 727f1dbca^`). The same commit added design text at `T/design/T287_NATIVE_WORKSPACE_WORK_DESIGN.md:327-330`, still live: "The existing cleanup-live/pending fluents retain it across Run failure and cold projection". |
| 2026-10-21 | C1 ratified by Root (note:3-20) | Named that initiation "the competing decision to retire, not authority" (C1:39) and ordered "Remove the obsolete early cleanup initiation from the static uncertainty axiom declaration too" (C1:92). C1 also recorded the missing Run filter on the live-process census (C1:90). |
| 2026-10-22 | Design post B3 (`.ai-workspace/comments/claude/20261021T135156Z_REVIEW_compute_calculus_and_library_design.md:316-328`) | Moved C1 into one rule "with its formulas unchanged", listing three of C1's five formulas. It kept the U initiation of pending in the rule (:324-326) and took the census over `actor_process_active or actor_process_live` (:326-328). |
| 2026-10-22 | Library design §4.4 (`T/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:201-211`) | Wrote that rule into the active tenant design. T-287 records D1 as decided by the owner (T-287:6001-6003, :6113), and the re-entry as a `design_reframe` superseding C1 to C5 (T-287:5955-5957, :6025-6028, :1006-1012). |
| 2026-10-22 | Step 6, `c2432eb85` | Realized the rule. |
| 2026-10-22 | Step 8b, `c8d3f8ecd` | Dropped the D9 guard and added the copy check. |
| 2026-10-24 | L5 (T-287:329-331) | Accepted the library at `46ed04895`. |
| After `46ed04895` | — | Changed `rules.ts` in liveness plumbing only (`git diff 46ed04895 HEAD`). |
| RC10 to RC12 | Records | Changed no lifecycle rule. The RC12 ledger row B2a says "axioms and derived fluents unchanged" (`.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/LEDGER.md:12`). |

**D1 carrier (B).** The record is library design §4.4:187 and :201-215, T-287 D1, and T-287:1010-1012 ("The lifecycle law is realized as the rule `actor_process_lifecycle` in the one fold"). `T/design/ABG_EVENT_CALCULUS_IACS.md:67-79` states the same form. The note was not updated.

**D2 meaning and start of `actor_cleanup_pending` (B, with a defective record).**
- **What §4.4 states.** It gives `cleanupPending = not A and (T or U or (R and formerlyActiveActor))` (:206), says this rule initiates and terminates `actor_cleanup_pending` (:209), and lists it as a closed lifecycle fluent (:211). That maps C1's presentation formula onto the fluent and drops cleanupTokenPending and cleanupLive. C1:23 forbids this conflation.
- **The two origins.**
  - Pre-Run U → pending dates from `727f1dbca` and was named for retirement by C1:39.
  - Pre-Run T and spawn failure → pending are new at `c2432eb85`. Before it, the EC created no pending on exit; that was C1's counterexample B (C1:7).
- **The defect.** The record claims continuity. B3 says "with its formulas unchanged" (post:317) and "cleanup token frontier at the matching Run stop" (:319). §4.4:209 keeps "The cleanup token frontier is the matching Run stop". Under §4.4's own formula no separate token exists, so that sentence can only describe the R term's Run match. Step 6's review reads it that way (`.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-6.md:430`). A C1 reader takes it as C1's frontier.
- **What the steps compared against.**
  - Step 6's activation sets the frontier "as §4.4 states" (`step-6.md:115-127`), and its falsifier asserts pending after the exit, before R (`step-6.md:164-174`).
  - Step 6's review compares the U fixture with the pre-Step-6 code ("under both laws (the old U entry initiated it unconditionally)", `step-6.md:432`), not with C1.
  - Step 8 rewrites `m5-terminal-quiescence-owner.test.mjs:222` to assert pending before R "through `holdsAt`" (`step-8.md:533-540`, `:637`). C1's proof map:26 requires that expectation to become "no cleanup token".
- **The decision record.** No decision names the frontier. D0 to D9 do not (T-287:6110-6121). D10 to D15 concern O-SCHEMA, O-TYPE and the helper failure (T-287:6079-6080, :6128, :1013).

**D3 cleanup-live before R on U (C).** The only carriers are these:
- Step 6's activation keep-list: "`actor_cleanup_live` and the stdout/stderr availability fluents stay in the axiom table" (`step-6.md:124-127`);
- the earlier native-work text at `T287_NATIVE_WORKSPACE_WORK_DESIGN.md:327-330` (2026-10-09). C1 retired that decision, and nothing later restates it.

§4.4 states no rule for `actor_cleanup_live`. Its closed lifecycle list omits it (:211), as does the IACS list (`ABG_EVENT_CALCULUS_IACS.md:67-71`).

**D4 census (B by text; the narrowing is unacknowledged).**
- §4.4:209 states the realized census: "`formerlyActiveActor` holds when the invocation's actor is in the matching Run's census of actors for which `actor_process_active` or `actor_process_live` held". B3 is its origin (post:326-328).
- The note (:25-27) and C1:88 name actors with no process row explicitly. §4.4 does not mention them and gives no projection for them.
- The h4 label `not_required` sits against T-287:1014-1015, the superseding record's own retained clause.

**D5 cleanup-live census not filtered to the Run (C; latent).**
- The pre-Step-6 census over all held `actor_process_live` initiated both fluents without a Run filter (`event_calculus.ts` at `c2432eb85^`, lines 1909-1925). C1:90 called the missing filter a defect.
- Step 6 split the census and left the unfiltered half for cleanup-live. Its review records the survival but not the filter (`step-6.md:431`).
- §4.4:209 says "`terminal_run_census` keeps [that census] for `actor_cleanup_live` alone" without a Run scope.
- The code's own pending census and terminations filter by Run (`rules.ts:173`, `:78`).

**D6 post-Run cleanup protocol (C).**
- The protocol is in the ratified posts: b058:213-218 and :237-274, d3:122-192, 49ca:29-47, c295:271-278.
- No code ever carried it. The fold applies the ordinary exit and actor-terminal effects at any position, before or after R (`rules.ts:138-163`). No admission rule restricts post-R events, and no producer appends them after the owner finalizes.
- No record retires it:
  - T-287:6025-6028 supersedes "the K01 to K12 catalog and the conjunction's bounded C1 to C5 contracts", not the posts;
  - the note's own amendment supersedes only b058's payload census (note:22-24) and b058 R3.2's zero-artifact rule (note:56-59);
  - a search of the workspace records finds the variants only in the posts and in the L2 reference to that payload supersession (`.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/L2-execution-contract.md:313`).
- h6 shows the consequence.

**D7 quiescence labels (C; label only).**
- **Unknown fluent.** b058:178-180 gives `invalid_unknown_fluent`; head gives `non_quiescent` (`replay.ts:450-462`, from `07004b977`). Closure refuses either way (`closure.ts:187`).
- **Terminal Run.** c295:239-242 and b058:190-193 require an active Run with its spine. Head labels a Run with `run_terminal` and no blockers `quiescent_for_close` (`replay.ts:476-479`, from `785cfa9cc`).
  - Closure needs that label plus a root frame and GraphCall equal to the CCall's (`closure.ts:187-192`). The stop terminates its frame's `frame_active` and its `graph_call_active` (`axioms.ts:1428-1440`), so closure refuses a stopped Run (inferred).
  - The read model shows the label (`project_read_ports.ts:1093`).
- **Other partition changes, recorded (B).** These partition members are recorded:
  - `actor_process_terminated` and `terminationConfirmed_copy_disagrees` as historical (§4.4:209-213);
  - the closing frame's own observation in the spine (`T/design/T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md:246`);
  - ended child-frame probes as historical (RC12 B2a, LEDGER.md:12).

**Intent sources by binding order.**
- The Product and requirements do not fix the frontier, the census or the post-Run grammar:
  - `specification/requirements/abg/REQ-R-ABG3-EVENTS.md:38-44` requires the actor and process event family as authoritative replayable facts;
  - `REQ-R-ABG3-PROJECTION.md:48` requires one replay-derived liveness projection;
  - `specification/requirements/product/REQ-P-POLICY.md:585-588` names "the reader rule Run quiescence applies" for an ended child frame.
- `ABI5_REALIZATION_CONSTITUTION.md` has no lifecycle-token law (searched).
- `T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md:246` keeps "All actor cleanup" blocking, which holds under both rules.
- `M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION.md` and `ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md` do not state these clauses (searched).
- The intent therefore sits in design text alone: the note on one side; §4.4 and the IACS on the other.

**TD-66 and TD-41 (context).**
- TD-66 (register:730-738) records that the held set is inside the replay digest. That is why D2 to D5 move the witness.
- TD-41 (register:422-430) concerns timeouts and labels, not these clauses. It shares TD-66's batching of digest-affecting corrections.

## 7. What the tests prove

Tests are under `T/test_env/tests/`. Every lane below asserts what head does; none asserts the note where the two differ.

| Clause | Lane and lines | Proves | Under the note |
|---|---|---|---|
| N2, N3 | `t287-calculus-fold.test.mjs:168-200` (CASES), `:96-106` | Live and unconfirmed follow the formulas | Pass |
| N4 (projection) | `m5-terminal-quiescence-owner.test.mjs:83-134`, `:148-213`; calculus-fold CASES `actor` rows | Projection outputs for h1, h2, h3 and the U-then-exit history | Pass |
| N5 frontier | `m5-terminal-quiescence-owner.test.mjs:224-226`; `t287-calculus-fold.test.mjs:101-105`, `:172-174` (exit initiates pending, R initiates nothing), `:185-186`, `:193-197`; `t287-native-work-unknown-effect.test.mjs:56-57`, `:67-68`; `t287-lifecycle-failure-carrier.test.mjs:290-293` (rows are the actor owner's appends only, `:73-83`, `:95`; no Run terminal) | Pending holds before R | Fail |
| N5 and N6 after R | `m5-terminal-quiescence-owner.test.mjs:148-178` (S, U, Run failure, then an ordinary exit and actor failure); `t287-calculus-fold.test.mjs:180` | After R, live, cleanup-live and pending follow C1 rows :60 and :63; a later exit ends live and cleanup-live; the actor terminal consumes pending | Pass |
| N6 before R | `t287-native-work-unknown-effect.test.mjs:56-57` | U initiates cleanup-live | Fail |
| N6 after T | `t287-native-work-unknown-effect.test.mjs:65-66` | Exit ends cleanup-live | Pass |
| N10 | `m5-terminal-quiescence-owner.test.mjs:136-146` | Duplicate terminals and an actor terminal before confirmation refuse | Pass |
| N16 | `t287-runtime-activity-quiescence.test.mjs`; `t287-recursive-failure-foldback.test.mjs:212-217` | Runtime and frame-probe membership, the closed spine, and unknown fluents blocking | No cleanup fluent is asserted |
| N7 (h4), N8 (h5), N12, N13, two actors with one token each (proof map:22), attribution | None | — | — |

`t287-calculus-fold.test.mjs` names its cases "counterexample A" (exit then R, :169) and "counterexample B" (no exit then R, :177). These are C1's B and A respectively (C1:7). Its `LIFECYCLE` list omits `actor_cleanup_live` (:16-17), so its tables never observe D3 or D5.

## 8. The Writer's claims (TD-64R ruling 4)

| Claim (`TD-64R_RETURN.md:85-129`) | Finding |
|---|---|
| The note designs a decider in its own module with a consumer | True, through the ratified C1 (C1:11-23, :94) |
| Head decides by `deriveActorProcessLifecycle`, and the projection reads fluents | True (`rules.ts:126`; `actor_process.ts:642-651`) |
| Head contradicts the token frontier | True (`rules.ts:146`, `:156`). It also contradicts cleanup-live (`axioms.ts:248-251`), which the Writer omits. |
| Lines 47-106 are records | True: 47-64 is the amendment, 66-70 the status block, 72-94 the ratification and 96-106 the authorization |
| Post-Run start refusal is unverified | There is no Run rule. The refusal holds in effect for the one producer through the held prefix (H12, inferred) and has no lane. |
| "Superseded or contradicted by head" (:123) | Both, clause by clause, as in section 4 |

## 9. What would close the entry

TD-75's closure needs one statement of the rule in the note and in the code, with its lanes named. Either route below gets there, and the owner chooses which statement is intended. This file does neither.

**Text route (`design_reframe`: head is the intended law).** This reverses Root's ratified disposition at C1:39, so it needs an owner decision.
1. Restate note lines 3-45 from the rule at head, citing:
   - §4.4;
   - T-287 D1 and lines 1006-1015 and 6025-6028;
   - Steps 6 and 8;
   - L5.
   Keep lines 47-106 as dated records.
2. In library design §4.4:201-211:
   - say that `actor_cleanup_pending` is the remaining actor obligation, initiated at T, U, spawn failure or R;
   - replace "The cleanup token frontier is the matching Run stop";
   - state that actors with no process row are outside the census, and what carries their obligation (today, the binding);
   - add `actor_cleanup_live` with its three producers and its Run scope.
3. Make the same additions to `ABG_EVENT_CALCULUS_IACS.md:67-79`.
4. Dispose of the posts' post-Run protocol (b058:213-218, :237-274; d3:122-192; 49ca:29-47; c295:271-278): retire it, or record it as unrealized. State what head does after h6.
5. State the two quiescence labels (D7).

D5 does not fit this route: the text would have to say that any Run's terminal marks every live process. A one-line Run filter at `rules.ts:53-56` closes it under either route.

**Code route (`realization_refactor` to the note).**
1. In `rules.ts`:
   - remove the T, U and spawn-failure initiations of pending (`:146`, `:156`);
   - take the R census over actors of the matching Run that are started and not terminal, keying actors with no process row by the canonical ref (`actor_process.ts:1156-1157`);
   - initiate cleanup-live only at R for a live process, Run-filtered (`:53-56`).
2. Remove `actor_cleanup_live` from the U axiom (`axioms.ts:248-251`, `:1008-1013`).
3. Realize the post-Run protocol, or retire it by text.
4. Reverse the pending and cleanup-live expectations at these lanes:
   - `m5-terminal-quiescence-owner.test.mjs:224-226`;
   - `t287-calculus-fold.test.mjs:101-105`, `:172-174`, `:185-186`, `:193-197`;
   - `t287-native-work-unknown-effect.test.mjs:56-57`, `:67-68`;
   - `t287-lifecycle-failure-carrier.test.mjs:293`.
5. Add lanes for h4, h5, two actors, attribution and post-Run start.

The projection outputs stay as they are, except in h4. The witness is computed under the law in force, and no stored witness is re-read (§4.4:199). This route therefore changes future witness values at the pre-R cuts of h1, h2, h3 and h4 and does not break reopen. If the owner wants the change bounded by a profile, it joins TD-66's single successor-profile batch.
