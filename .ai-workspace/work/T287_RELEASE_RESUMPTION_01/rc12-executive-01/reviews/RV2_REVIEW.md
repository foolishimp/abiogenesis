# RV2 review: RC12 readable stops (R) and review repairs (A2)

Independent Reviewer, commentary only, 2026-11-11. Returns read last, as claims. Severity: S1 blocks the cut; S2 repair
before the live demonstration; S3 should repair; S4 note. T = `build_tenants/abiogenesis/typescript`.

## Subject 1: readable stops, `62fd17271..ad287364c`

**Product Frame.** Outcome: a stopped Run reads back from the admitted record alone its typed disposition, reason,
originating failure class and the obligations its last evaluation left unresolved, and never reads as completed
(PRODUCT.md:1027–1030; REQ-P-POLICY-065–068). Authority: specification owns the law, ABG `project.read run_status` owns a
read-time fold, and the log is the only source. The diff touches read modules, contracts, docs and one test, and no event
or runtime. Prohibitions: no stored copy, no label inference, no generic reading of Product values, no erased typed gap
(PRODUCT.md:415, 451), no identity drift without supersession (REQ-P-PUBLIC-CONTRACTS-004). Class: a pure projection.

**Verdict: accept with repairs.** Read-only and lawful on the four exercised stops; no path reads a stopped Run as
completed. Repairs: wording, one dropped field, one requirement guard, and cut bookkeeping.

**R-1 (S3). The evaluation label and the statement claim more than the record shows.** Claim: "the last admitted
evaluation" and "Unresolved obligations are those recorded by the last admitted evaluation …". Evidence: `stopEvaluation`
takes the last success Result of the root GraphCall (`T/code/src/abg/project_read_ports.ts:1191–1194`); `stopStatement`
asserts obligations for any value kind (`:1219–1220`). When that Result is, say, a `worksite_file_replace_output`, the
words claim obligations the record lacks. Sunny path: none. Repair: "the last admitted Result of the root GraphCall is
<kind> <ref>" unless a Product declares the contract an evaluation; align 065. About 10 lines and one test.

**R-2 (S3). An operator stop reads its recorded reason as absent.** Claim: the reason is read back, and typed absence
appears only where the record establishes nothing. Evidence: an operator `run_stopped` carries `reasonKind`,
`reasonDetail` (an exact ref) and `operatorActorRef` (`T/code/src/abg/witness_admission_operation.ts:422–423,
1091–1105`; `event_store.ts:495`). The fold reads only `reasonRef` (`project_read_ports.ts:1244`), so the statement says
"No stop reason reference is admitted." Sunny path: none. Repair: read `reasonDetail` and the actor, and add the case.

**R-3 (S3). The origin descent has no causal guard.** Claim: the descent finds the Result that caused the stop. Evidence:
REQ-P-POLICY-066 and `stopOriginEvent` (`project_read_ports.ts:1126–1145`) descend through any failed or blocked
foldback under the stopping C-call, without checking that the parent's Result was lifted from it. Forward counterexample
(package B): a parent re-evaluated in the same C-call after a child failure, then stopped on the bound, reads the handled
child failure as its origin. Two or more such foldbacks (retry, fan-out) read `not_admitted`. Repair: a
`requirement_reprice` of 066 ("each failed or blocked foldback the parent's Result was lifted from") plus a causation
check; settle it with B.

**R-4 (S3). Contract identity and the cut are larger than one member.** Claim: one optional member is the whole delta,
covered by the one named supersession. Evidence: the shared `sourceModuleDigest` moves six RunProjection definition
digests. Five of them, `run_result`, `run_replay`, `run_gaps`, `run_evidence` and `run_lawful_actions`, move with no
schema change. The family and catalog digests, 18 operation contracts, two schemas, `adapter-projection.json`, the graph
and the manifest move too: 23 files, all explained in the Return. Gaps: the R10 note
(`T/design/T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN.md:624–626`) names only `run_status`. The exact014 per-slot pin
(`T/test_env/tests/t287-framework-handoff-types.test.mjs:316–361`) would drift on `run_status` with its archive, but it
is red at base and after for lack of input, which masks it. Repair (text): record the five co-moved digests, or the
module-digest rule, and the exact014 slot as superseded. Commit all 23 files (23/23 byte-identical on rebuild).
Regenerate the graph and manifest once on the merged tree: R and A2 leave different uncommitted copies.

**R-5 (S3). The stop is readable only through a second read.** Claim: REQ-P-POLICY-068 "so that `abg.cli` output states
them". Evidence: the start output carries no statement (Return deviation 2). The statement is mostly references, lists
no obligations for failure or bound stops, and names no next lawful action. The demonstration therefore shows
`runtime_failed` or `blocked` with no reason. Repair: carry `stop.statement` in the start/continue output line; listing
the obligations themselves needs a Product rendering.

**R-6 (S4). Notes.** Field-name reads (`:1178–1179`) and the GTL `isRegisteredGraphChoice` import (`:54`) are generic;
no library value is interpreted. The evaluation value rides every read (required by 067, unbounded), with a `graph-call:`
scan per read (`:1192`). The throw at `:1232–1237` is unreachable for replay-typed stops (enum `reasonKind`). Every
nullable fold output is nullable in the schema, with one exception. GTL admits a gap's `missingSupportRefs` as any
non-empty string (`gtl/registered_selection.ts:10–11`), but the schema requires non-blank. A whitespace-only reference
would therefore make `runStopFields` refuse the whole read. Align the two predicates.

## Subject 2: review repairs, `a82a365cc..54b95cfdb` (read through git and a scratch archive)

**Product Frame.** Outcome: parent completion is computed over admitted verdicts. Acceptance and every required review
must be satisfied and current, and a verdict stays current while no later admitted effect touches its subject or
declared inputs. Authority: the Product library owns the dependency set, and the ABG adapter owns preparation and
standing. The shared owner `worksiteCommandSourcesInvalidatedAfter` has 10+ consumers; the C2 helper runs in an archive
sandbox; the log is the recovery source. Prohibitions: Executive judgment never replaces declared prerequisites,
permissions or completion; no false completion. An unavailable post-effect observation withdraws currentness
(PRODUCT.md:722); prompt text is not enforcement. Class: library `design_reframe` plus a shared-owner change and a
Product edit.

**Verdict: changes requested.** F2 rests on a false premise. F1 and F3 are wired soundly but under-proved.

**A-1 (S1). F2 reads the C2 sandbox delta as a worksite change.** Claim: "an admitted C2 delta is a worksite effect"
(Return frames), and the design bullet "Invalidation interprets … the `worksiteDelta` of an admitted C2 command execution
Result". Evidence: commands and predicates run with cwd in `<archiveRoot>/worksite-command-execution/<task>/<attempt>/sandbox`
(`T/code/src/implementation/worksite_command_helper.ts:508, 962–975, 1624`). The delta compares two sandbox inventories
(`:1607, 1640–1641`), and no consumer applies it to the canonical root. Probe (real helper, no model): success, with
delta `[["verification","created"],["verification/review.md","created"]]`. The real file's bytes and physical
observation are unchanged, yet the A2 owner returns invalidated=`true` in the exact, directory-root and selected-path
forms. The sandbox delta never evidences a real worksite change. Boundary: the owner branch
(`T/code/src/abg/native_worksite_execution.ts:270–278`) and its key arm (`runtime_history.ts:703–705`). Consumers:
review standing (`default_library.ts:431–432`); preparation (`:274–275`), which refuses while the physical check at
`:272–273` passes; C2 source currency
(`native_worksite_execution.ts:182`); C0 eligibility (`event_calculus.ts:360`); revision, semantic job, provenance, and
re-indexed saved prefixes (Return residual 2). The fluent `worksite_observation_current` (`replay.ts:955–961,
1222–1250`) stays current, so the readers disagree, and the fluent is right. Trigger: a Testing command writes, inside
its territory, at or under a queried path. Sunny path: not on the witness path, whose commands are read-only and whose
`execution-evidence` holds no queried path. The Return's T2 trace (zero branch evaluations) shows the tests cannot see
the defect, not that it is harmless. Why S1: wrong in every case it fires, ratified in design text, changes how live
flows read recorded prefixes (replay derivation untouched), and cheap to withdraw. Repair: remove the branch, the key
arm, the design bullet and the unit file's fabricated premise (about 20 lines). To keep F2's intent, act where the
helper sees real change: its protected observations read the real root (`:1510–1521, 1639`);
`helper_protected_mismatch` and `helper_product_mismatch` arrive as failure Results with no delta (`T/code/src/implementation/worksite_command_execution.ts:759–761`); unconfirmed C2
actor termination is ignored (`native_work_effect.ts:139` accepts only the native implementation). Withdraw currentness
over the task's declared scope on those: one branch plus a real-helper test.

**A-2 (S3). Product and design text promise more than the code keeps.** Claim: P1 "no later admitted effect touches its
subject or the declared inputs…" and the design's C2 bullet. (a) Once A-1 is withdrawn, C2 real-change failures and C2
unknown effects still withdraw nothing: pre-A2 behaviour, now promised. The cwd-only confinement (helper `:962–975`) is
pre-existing and not charged to A2. (b) The Executive sentence drops "never conjoins findings by judgment" and grants
"applicability, conflict, dependency and sufficiency" as judgment, unbounded by declared prerequisites or permissions;
dependency now has a declared owner. (c) Recorded as `design_reframe`, "requirements unchanged", yet it edits PRODUCT.md;
the Return cites P1, not an owner ratification. Repair: state currentness as the code keeps it, or extend the code per
A-1. Bound the sentence with "…where no declared prerequisite, permission or completion condition decides them". Record
the re-entry class and owner authority, or revert.

**A-3 (S3). One verdict is held to three different sets.** Claim: "the declared set is the dependency set" (Return, F1
case). Evidence: preparation requires the producer's whole after-state current, physically and causally
(`default_library.ts:268–275`). The assessor may read all of `context.readRoots` (`product/native_workspace_work.ts:94,
105`). Review currentness covers only readFirst, sources, candidate and rubric (`:431–432`). "Only the declared
read-first material … may support this verdict" (`:253`) is prompt text, not framework enforcement. So a review stays
current after a later construction changes a producer file outside its set, although that change would block
preparation. This is not shown end to end. Repair: hold one set in the framework, either by putting producer paths in
currentness or by narrowing the scope.

**A-4 (S3). The tests prove weaker claims than their names.** F1: the case stubs the owner (reviews test `:190`
reimplements the match) and injects a change (`:329`) instead of admitting an effect, so it proves argument wiring only.
F2: the file fabricates the helper artifact with a synthetic delta (delta test `:42–48`) and never runs the helper, so it
cannot see A-1. F3 covers three of six purposes, which is adequate for common code. Repair: drive F1 through the real
owner with an admitted write, and build F2 on the probe's real-helper shape.

**A-5 (S4). Notes.** (a) The authority line and the review sentence change two relations that re-derive whole tasks,
`governanceResultMatches` prepare-native (`default_library.ts:455–456`) and the fold (`:367`), so a pre-A2 task stops
matching when its Run resumes under the new build. (b) The C2 branch checks the seal on every query. (c) `./product`
gains a member (Return deviation 4).

## Answers

1. **Q1.** A read-time fold over indexed admitted events: no stored copy, no event change. It overstates (R-1) and drops a
   recorded fact (R-2). Of several failure Results, causation picks the one failed route, else `not_admitted`. A failure
   in one branch beside a stop elsewhere reads correctly unless both share the parent C-call (R-3). A retry with two
   failed foldbacks reads `not_admitted`, and a re-evaluated parent falls under R-3.
2. **Q2.** No. `run_result` is unchanged (`not_found`) and the statement always says "did not complete". Completed Runs
   carry no `stop` and keep their values; five definition digests move (R-4).
3. **Q3.** One member, but 23 files move, each explained by the module digest. Commit all 23 and regenerate the graph and
   manifest on the merged tree (R-4).
4. **Q4.** By the code, old stopped Runs gain `stop` and completed Runs are unchanged; schema and fold nullability agree
   except for one pathological gap-ref case (R-6). Operator stops are not refused (R-2 only). The exact014 pin would go
   red (R-4). T3 was not reproduced: its logs are in another agent's directory.
5. **Q5.** Same fold. It claims more (R-1) and less (R-2), and omits the obligations, the failed work in words and the
   next action. The start output carries no statement (R-5).
6. **Q6.** Lawful. `gap_stop` allows a "typed gap or block" (PRODUCT.md:415). The gap survives in the choice Result and
   in `stop.origin`, and `blocked` with `default-library/gap@5` is typed. Residual: `run_gaps` alone shows nothing.
7. **Q7.** No library-owned value is interpreted; R-6 lists the generic field-name reads.
8. **Q8.** Review currentness lacks the producer after-state and the readable scope (A-3); UAT is held by structural
   retirement plus `after.readRoots`. Directories work for native, unknown-native and C0 effects, not in the C2 branch.
   Native work (failed work with attributed changes too), unknown native effects and C0 replacements and failures
   invalidate; C2 success invalidates falsely, while real-change C2 failures and C2 unknown effects do not (A-1).
   Revision commands share the sandbox (`product/worksite_command_execution.ts:2242`), so extending F2 to them repeats
   A-1. Forward commands were not checked.
9. **Q9.** Root, contract, class, seal and ordinal are checked correctly, but over a root the command never wrote (A-1).
   By code reading, fluents and replay digests are unchanged (T1 holds): no replay or calculus path calls the
   invalidator. The readers disagree on every C2 success with a delta; this blocks lawful work, never admits stale verdicts.
10. **Q10.** All six native purposes get the line from common code (`default_library.ts:232–235`). The selector view
    already carried `authorityRefs` (`product/default_library.ts:394`), and Testing has no instruction channel. Two
    re-deriving relations change (A-5a).
11. **Q11.** No; see A-2.
12. **Q12.** By the code each new test fails on the prior build; two pass for weaker reasons than their names (A-4).

## What I ran (T, `TMPDIR=/private/tmp/abg-rv2-tmp/tmp`, `node --experimental-vm-modules --test --test-concurrency=1`)

- Subject 1: worktree `npm run build` exit 0 (33 s); `shasum -c` over the 23 regenerated files: 23 OK.
  `t287-readable-stops.test.mjs`: `ℹ tests 4 ℹ pass 4 ℹ fail 0` (237 s).
- Subject 2: scratch archive of `54b95cfdb`, build exit 0. Delta-invalidation, default-library-reviews and
  rc2-assessment-intake: `ℹ tests 17 ℹ pass 17 ℹ fail 0` (87 s). No red, so no rerun. Contracts: base vs head JSON diff.
- Probe, scratch only: `/private/tmp/abg-rv2-tmp/a2/build_tenants/abiogenesis/typescript/test_env/tests/rv2-probe-sandbox-delta.test.mjs`
  1/1 pass: `{exactReviewedPath:true, directoryDependency:true, selectedPathForm:true, unrelatedSource:false}`.

**Not checked:** the Return's T3 old-log reads; the exact014 pin with its archive; package B; the 24-file consumer suites;
gated D2, revision and semantic flows; HoG `gap_stop` and operator stops end to end; read confinement beyond the prompt;
whether implementation-set identity refuses resuming a pre-A2 Run; no replay was executed. I am a Claude model, as are
the Writers (Opus) and the Executive, so my agreement with them is weaker evidence than an independent family's.
