You are the Writer who closes package TD-77 of the ABIogenesis consolidation wave (ticket T-292). The package lets a reader read a recorded store whose Product lock an earlier cut constructed. Its fold therefore accepts a lock that answers only a relaxed ("recorded") question, and the rule is that no work may be admitted over such a lock: work requires the strict answer. A fix round put that requirement at four entries. An independent re-check found the same gap at six more exported entries (its finding N1) and three smaller items. The Executive (who wrote this brief) has ruled. You apply the rulings, prove them and bring the design text and the Return to a true final state.

## Read first, in full

1. The re-check: `/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T292_CONSOLIDATION_01/REVIEW_TD77_RECHECK.md` (396 lines; on local `main`). Its line numbers are at `ef05a44bc`. Its probes are in `/private/tmp/abg-td77recheck-work/` (read-only input: copy what you use).
2. The package's Return on your branch, `.ai-workspace/work/T292_CONSOLIDATION_01/TD-77_RETURN.md`: the section "Fix round after the independent review", the census table and residuals 22.10 to 22.13.
3. The fix round's brief, for the rulings that stand (R1 to R16) and the working rules: `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/td77d-brief.md`; and the first review, `REVIEW_TD77.md`, finding F1.

Worktree: `/private/tmp/abg-td77` (branch `claude/td77-recorded-lock-truth`, head `ef05a44bc`, clean tree). T = `/private/tmp/abg-td77/build_tenants/abiogenesis/typescript`. Scratch: `/private/tmp/abg-td77-work/td77e/`; `TMPDIR` for tests: `/private/tmp/abg-td77-tmp/`. Never push. Write nothing under `~/Library/Application Support/`. No model call and no credential reading. Run test files in the foreground, one at a time. Do not end your turn while your own background commands are still running.

## Step 0: bring the branch onto current main

Local `main` is at `6464a5d50`, many commits past the branch's last merge of it. `git merge --no-ff main` in the worktree; resolve conflicts keeping both intents, and stop if a resolution would change behaviour on either side. Generated files take main's content in the merge commit and are not yours to commit after it. Build, run the three lints and the TD-77 lane (32 of 32) before you change anything.

## Rulings (the Executive's)

### N1. The strict question is the default wherever a fact is taken from the fold

Two rounds placed the requirement entry by entry, and each review found entries that were missed. The requirement moves from the entries to the accessors that hand out the fold's facts, so that an entry cannot take a fact for work without it.

R1. **Strict by default at the accessors.** Every function through which a caller obtains, from artifact truth, an admitted install, an admitted workspace binding or a workspace environment asks the strict question unless its caller states `recorded`: `hasAdmittedProductInstall`, `hasAdmittedWorkspaceBinding`, `projectAdmittedWorkspaceProductInstall`, `projectAdmittedProductInstallByAdmissionEventRef` and the row rehydration it uses, `projectExactPrefixWorkspaceEnvironment`, `projectWorkspaceEnvironmentFromArtifactTruth`, and any other accessor of the same kind your census finds. Under the strict question the accessor answers as it does today for a fact that is not admitted (null, false or its existing refusal) when a lock involved answers only the recorded question. As with the guards, the exported signature asks strict and takes no new parameter; the question is an internal overload, and no entry takes it by default: each internal caller that needs `recorded` states it.
R2. **`recorded` only for a read of recorded history.** A call site states `recorded` only when what it returns is a read, or a comparison that binds a supplied copy to recorded history, and nothing is appended, admitted, granted, started or continued from it. The fold's own advance is one of them. Give the complete list of call sites that state `recorded`, each with the reason; that list is what the Executive audits. Every other call site asks strict by not stating a question.
R3. **A validated copy keeps working.** Today the accessor of the retained answer says false for a copied projection. A caller that passes a copy which the artifact-truth owner has validated against its own projection of the same prefix (the actor process and any other standalone entry do) must get the answer of the owner's facts for that prefix, not false. Show every entry that receives artifact truth from outside the process and what it gets for a healthy store, before and after.
R4. **The entry checks collapse into the accessors.** Where an entry's own check, added in the fix round, now repeats what its accessor refuses (the admission environment, the worksite execution environment, `admitWorkspaceBinding`), remove the entry's check and keep the refusal code the entry returned; where an entry takes facts without an accessor (the candidate's use of the fold's install map), its check stays. Say which stayed and why.
R5. **The six entries of N1 are refused on a recorded-only store, each shown by a lane case** on the lane's variant store: `./abg admitInvocation`, `admitExecutionBasis` (a root basis with and without a worksite carrier), `admitChildExecutionBasis`, `invokeActorProcess` (refused before a process starts), `admitFhInteractionHold`, `admitProbabilisticResultCandidate`. Each case asserts the refusal the entry already gives for a binding or install that is not admitted, and that nothing is appended. Each passes on the same store with a lock the current build constructs, or on the mixed store's current install.
R6. **Refusals use existing codes** at every entry. If the strict default makes an entry refuse a store of the current build in any kept lane, stop.

### N2 to N4

R7. **The materialization branch** gets the re-check's probe as a lane case (one artifact, one call), and its own text inside the existing refusal, true for its cause.
R8. **The binding branch's text** is given only when a causal install exists and its lock does not answer strict: make the product-set check come first, or ask whether the cause is an admitted install before the strict text.
R9. **Text.** Restate the design sentence that says the fold reads every store whose locks a door admitted, so that it agrees with the release paragraph; name both recorded-history callers of `isReleaseOperationArtifact`; say "module export" where a function is exported by its module and not by a package entry. Then restate the design's and the Return's statements of the rule to R1 and R2: the strict question is the default at the accessors, and the list of `recorded` call sites is the complete set of exceptions.

## Proof you produce

- The list of R2, and a search that shows no accessor of R1 has a default other than strict and no call site states `recorded` outside the list.
- The lane file: counts; the cases of R5 and R7, each red on `ef05a44bc`; the mutant table brought up to date (the fix round's nine, and one mutant per accessor of R1 with its strict requirement removed: each makes at least one named case fail).
- Reads still read: artifact truth projects on all 121 stores with the base digest under the unchanged register and under the register edit; `r10-child-proof`, `t287-historical-source-resource` and `t287-cross-cut-public-read` under the register edit give exactly the outcomes the fix round recorded (the four expected cases, no other).
- Work still works: on a copy of `main` at `6464a5d50` and on your final build, one file at a time, every file of the fix round's battery that exercises an accessor of R1 or an entry of R5, and in any case `t287-default-library` and its four sibling files, `t287-registered-graph-selection`, `t287-recursive-registered-selection`, `t287-recursive-failure-foldback`, `t287-native-workspace-work`, `t287-native-assessment-evidence`, `t287-post-binding-worksite-write`, `t287-observed-worksite-command`, `t287-native-work-currentness-consumers`, `t287-required-operation-bindings`, `steel-basic-cli-public`, `r1-packed-artifact` to `r5-invocation-admission`. No case goes from pass to fail. When you build a scratch copy for lanes, include the `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness` directory of the same commit.
- The first review's and the re-check's probes on the final build and the final build with the register edit: the F1 table with your rows; the re-check's gate probe with the six entries now refused under the edit.
- Cost: whole-lock evaluations for a fold, an admission environment and a binding candidate on the live rc.12 store copy stay at one; the number of retained-answer lookups in one default-library Run, and the median time of that Run before and after.
- Replay comparison over the 23 logs: identical to `main`.
- `npm run build`, `npm run lint:imports`, `lint:lifecycle`, `lint:calculus` pass. Every `.d.ts` file byte-identical to `main`'s. Identity digests of the final build; `catalogDigest` and the capability graph's rows unchanged from `main`'s apart from the content digest.
- Size of this round: `git diff --numstat` from your merge commit of step 0 over `code/src`, `design` and `test_env`.

## Stop and hand back instead of proceeding if

- an accessor of R1 cannot ask strict by default without changing an exported declaration;
- a read of recorded history cannot be told from work at a call site (say which, and what it does next);
- R3 cannot be met for an entry that receives a copy;
- the strict default refuses a store of the current build in a kept lane (R6);
- a merge conflict of step 0 cannot be resolved without changing behaviour.

## The Return

Update `TD-77_RETURN.md` in place: the status line; a section "Closing round after the re-check" (step 0; R1 to R9, each with how it is realized, file and symbol; the list of R2; the entries of R3; what R4 removed and kept; the lane cases; the mutant table; reads and work; cost; lines changed); corrections of the earlier sections that the round makes untrue; residuals. Commit in this order: the merge of main; design; code; lanes; the Return last. Generated files are restored before each commit. End every commit message with these two trailer lines: `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01LduNEwa1BsAk3vSUmjMCAm`. Your final message to the Executive repeats the status line, the complete list of call sites that state `recorded` with their reasons, the R5 table, the mutant table, the lane counts, the cost, the commit list and anything that needs a ruling.
