You are the Writer for package TD-26 P5 of the ABIogenesis consolidation wave (ticket T-292): the fifth code package of the retirement of standalone Consensus and the One Surface loop. P5 removes the read side of the loop and the gap family: the replay, calculus and projection arms that read One Surface events, the frontier reads, gap re-entry and the `gap_stop` outcomes. From this package on, a recorded One Surface log is refused by its readers. The Executive (who wrote this brief) reviews and merges your branch.

## Authority

The owner decided on 2026-11-12 that the Executive is the standard system program and that One Surface retires with standalone Consensus. The specification and the design notes already state the Product that way. The code follows in the packages of the retirement plan, in sequence. You carry out one package and you do not reopen the decision, the plan's order or the Executive's rulings.

## Read first, in full

1. `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/retirement-rules.md`: the rules every retirement package follows. The design step of this retirement is done by another package: you edit no design note; list any kept design sentence that still describes what you remove. The specification step is done except for the rename of ruling 6 below.
2. The retirement plan, `.ai-workspace/work/T292_CONSOLIDATION_01/TD-26_RETIREMENT_PLAN.md`: section 0; section 2 (2.4 the read-side table, 2.5 HoG, 2.7 Public, 2.8, 2.10 tests); section 3 (3.4 lists the constants that stay); section 4; section 5 in full (recorded history: which logs are One Surface logs, and 5.4 on the register); section 6 "Common to every package" and "P5"; section 7, open point 2. The plan's line numbers are at `c1f655735`; many packages have merged since, so find each site again.
3. The register entries "TD-26" (the bullet "Plan and rulings") and "TD-30" in `.ai-workspace/TECHNICAL_DEBT_REGISTER.md`.
4. The Returns of the packages before yours, under `.ai-workspace/work/T292_CONSOLIDATION_01/`: `TD-26_P0_RETURN.md` to `TD-26_P4_RETURN.md`, and `TD-25S_RETURN.md` for the precedent of a value removed from the store's accepted lists.

## Where you work

- Worktree: `/private/tmp/abg-td26p5` (sparse checkout; branch `claude/td26-p5-readers-and-gap-family`, from local `main` at `2ac9b96bf`). Use `abg-td26p5` wherever the rules say `<name>`. Your Return is `.ai-workspace/work/T292_CONSOLIDATION_01/TD-26_P5_RETURN.md`.
- Run test files in the foreground, one at a time. Do not end your turn while your own background commands are still running. No lane that needs a live provider is run.

## Scope

The plan's section "P5": the read side of `abg/traversal_route.ts` and `abg/construction_continuation.ts`; the One Surface arms of replay, of the calculus derivations, of the F_H continuation projection, of effectful invocation truth and of the runtime history; the gap family (re-entry, `public/gap_authority.ts`, the `gap_stop` outcomes and dispositions, the store's accepted value lists, the frontier reads' ports and bindings); the remaining exported types. Tests as the plan lists them.

## Rulings specific to this package

1. **No register row changes.** `shared/capability_contracts.ts`, the corpus ids and the Consensus schema contracts are untouched. The three frontier reads (`run_gaps`, `workspace_gaps`, `run_lawful_actions`) stay declared and refuse `installed_binding_unavailable`; their definitions, their contracts and `ABG_ADMITTED_GAP_SCHEMA` stay published, because register rows name their keys. The count pins move to 42 callable and 14 unavailable of 56. If the build or a lane requires a register change, stop.
2. **The digest-carried constants stay.** The six One Surface fields of every execution basis; `constructionIntentRef: null` in the F_H hold identity; `constructionDeltas: []` in the replay body; the three declared event kinds with their payload variants and their calculus rows, which the completeness check requires; `reentryBasis` as a constant `null` where a recorded body carries it. They enter digests of recorded bodies, and a change to them is a successor profile, which is the owner's decision. The event contract digest and every profile digest are unchanged after your build: show them.
3. **Every kept log reads byte for byte as before.** The plan's replay census over its 23 logs: the 21 that are not One Surface logs give identical output on base and final. The live rc.12 store, the artifact-truth lanes of the rules and the Public replay and status reads over kept stores give identical results, the Public `workspace_replay` and `run_replay` digests included. If any kept log, store or read changes, stop.
4. **A One Surface log is refused, by the owning reader, with its existing message.** For each retired shape (the three construction kinds; a `continuation_superseded` or `public_operation_admitted` of kind `construction_intent` or `selected_action`; a `gap_stop` route; a no-action `run_stopped`): which reader refuses it, at which entry, with which existing message or code, and what each Public read and each appending operation over such a store then returns. A `gap_stop` value is refused at decode, as the precedent removed its value from the store's lists. One hand-built log per shape shows the refusal, red on your base. The two One Surface subjects of the census are expected "refused"; say at which reader each stops. No new refusal code and no new message.
5. **The stop reading keeps working.** The Executive's gap is a `blocked` stop with origin `gap`; `t287-readable-stops` shows that the stop reading reports it after your change. Its `nextActions`, `gaps` and `frontiers` assertions change only as the plan's test edits say.
6. **The conservation rows named `gap_stop`.** The specification step kept them because the rule-catalogue generator requires rows by that literal. Rename them, in the specification and in the generator's list together, to what the kept Product has (the blocked stop with a gap origin); this is the only specification edit of the package and it comes first, in its own commit, with the generator change in the code commit. The Executive restages the qualification mirrors at merge. Say which rule-catalogue rows change and that the row count is unchanged or by how many it moves.
7. **Gap re-entry goes; the refusal of a prior gap stays.** `InvocationReentryBasis` and the re-entry block of the invocation admission are removed. A request on the exact path that carries a non-null `priorGap` is refused `authority_mismatch`, as today; a lane shows it on base and final. The legacy request family, its constructors and the `admitInvocation` locator are register entry TD-30's and are not yours.
8. **Exports and pins.** Say which exported names leave which package paths (`./abg`, `./abg/m03`, `./hog`, `./public`), which definition and contract digests move, and which manifest pins move with them.
9. **The continuation kind `current_intent` leaves the closed result domain.** Since the continuation package no kept path produces it; it stayed in `CURRENT_EXECUTION_KINDS` so that the result and non-terminal contracts did not move there. Remove it here, with the two schema references and the pins that move (`t287-recursive-registered-selection`), and show that a pending-execution continuation returns the same result as before.
10. **Two value kinds of the loop are refused, not ignored** (the route package asked this; ruled here). Since that package a Product whose input contract admits an `observation_snapshot` runs, and a leaf that returns a `next_action_projection` with disposition `no_action` routes as an ordinary result; on that package's base the first was refused `invalid_input` and the second failed the call. Both are retired shapes: refuse each by its kind at the door that refused it before, with a code that door already has, and show it in the refusal lane. If the only way is a new code, stop.
11. **What the route package left for you** (its Return): the `gap_stop` completion arm in `hog/ccall_lifecycle.ts` and the `gap_stop` member of `hog/traversal_completion.ts`; the recorded payload field names read in `event_store.ts` and `replay.ts`.
12. **Kept code that imported from what you delete.** For each kept importer say what it needs and where that now lives; never leave a stub or a re-export shell.

## Verification

On your final build only, one file at a time (the baseline is local `main`'s own results; run a file on a base build only to attribute a failure): the test files you edit or add; the replay census over the 23 logs (this one on base and final: the 21 kept logs identical, the two One Surface subjects refused); the four hand-built refusal logs, red on your base; `m5-event-calculus-runtime`, `t287-route-reconstruction`, `t287-readable-stops`, `t287-recursive-registered-selection`, `t287-registered-graph-selection`, `t287-native-assessment-evidence`, `t287-cross-cut-public-read`, `r5-invocation-admission`, `t287-framework-handoff-types`, `t287-default-library`, `r1-packed-artifact`, `r2-clean-install`, and the artifact-truth probe over the live rc.12 store copy. `npm run build` and the three lints pass. The Return is tables, counts and rulings, with no narrative.

## Stop and hand back instead of proceeding if

- a register row, a corpus id or a Consensus schema contract would have to change;
- the event contract digest or a profile digest moves (ruling 2);
- a kept log, store or Public read changes (ruling 3);
- a retired shape cannot be refused with an existing message or code (ruling 4);
- kept code needs behaviour of what you remove, not just a helper;
- any stop condition of the rules holds.

Your final message to the Executive repeats the status line, the lines removed by layer, the commit list, the table of retired shapes with their refusing reader and message, the census result, the counts at the pin sites, the digests of ruling 2, the renamed rows, the exported names that left, and anything that needs a ruling.
