# Step 8. Close

Plan: `.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, step 8.
Executive: Claude Fable. Worker 8a: Opus 5.5, xhigh, fresh context, Writer
grant. Then one independent review of the whole diff (Fable, max,
same-family disclosed). Then Worker 8b closes the ticket section and the
GOAL-035 row on the Executive's disposition.

## Activation 8a

**Role and outcome.** You are the Worker holding the Writer grant for step
8a. Outcome: the D4 decision is executed or recorded; the lifecycle-boundary
check exists and passes; the integrated run has executed once, deduplicated,
with its output recorded; the completion condition on the owner obligations
is stated from the step Returns. Change class: `realization_refactor`. One
commit on `main`, no push.

**Subject and frame.** `/Users/jim/src/apps/abiogenesis`, branch `main`, head
= the step 7 commit in the plan's ledger row. Tenant root:
`build_tenants/abiogenesis/typescript`; source: `code/src`. Frames:
`f-checks`, `f-claim`, `f-end-to-end-interface-integration` from
`design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`. Authority: the step 3 file's
`## Return` (D4 bridge and the O-* closures), the step 4 file's `## Return`
(O-TYPE per site), design §10.3 (owner obligations) and §9.1 (the
invariant the lint realizes). Read those sections only.

**What changes.**

1. **D4.** The step 3 Return states which callers of the throwing `i_json`
   entry (`shared/i_json.ts::admitIJsonValue`, 21 importers at `97b1200bc`)
   kept the bridge and what each caller's contract on a refusal is. Retire
   the throwing entry only for the callers whose contract that Return
   demonstrates (the caller maps the `Outcome` refusal to its own existing
   refusal or fault, or the caller's own tests show the throw is a defect
   channel). For the rest the bridge stays. Record the split in Return,
   caller by caller. No new behavior at any caller.
2. **Lifecycle boundary check.** New `scripts/check-lifecycle-boundary.mjs`
   and `"lint:lifecycle"` in `package.json`. It fails when, outside
   `code/src/abg/calculus/`, any `.ts` file constructs a lifecycle fluent
   name (`actor_process_live`, `actor_process_terminated`,
   `actor_process_termination_unconfirmed`, `actor_cleanup_pending`,
   `terminationConfirmed_copy_disagrees`) for anything other than a
   `holdsAt` pattern argument, or reads `scopeAbsence` or `directExit`
   outside `code/src/shared/process/`, `code/src/shared/owned_process_lifetime.ts`,
   `code/src/abg/worker_transport.ts`, `code/src/abg/actor_process.ts` and
   `code/src/implementation/worksite_command_helper.ts`. Print offenders as
   `path:line: text`; exit 1 on any. It must pass at your commit; if it
   fails on head, the offender is a step 6 or 7 residue: fix it only if the
   fix is a one-line switch to `holdsAt`, else record it and allow-list it
   with the file:line and the reason in the script.
3. **Integrated run, once.** After `npm run build`, one invocation:
   `node --experimental-vm-modules --test --test-concurrency=1` over these
   files under `test_env/tests/`, each once, in this order:
   `m5-c-algebra-validation`, `t287-c2a-fp-source-contract`,
   `m5-installed-graph-edge`, `m5-worker-transport`, `m5-event-store-reopen`,
   `m5-event-calculus-runtime`, `m5-retry-lifecycle-authority`,
   `m5-s03-authority`, `m5-consensus-module`, `m5-s06-prime`,
   `m5-installed-portability`, `m5-terminal-quiescence-owner`,
   `m5-fresh-process-reconstruction`, `t287-native-structural-gates`,
   `t287-native-runtime-gate`, `forward-command-contracts`,
   `forward-command-owners`, `t287-native-semantic-revision`,
   `t287-owned-process-lifetime`, `t287-event-calculus-owner-continuation`,
   `t287-calculus-state-transfer`, `t287-reconstruction-conservation`,
   `t287-ordered-reconstruction`, `t287-worksite-command-execution`,
   `t287-observed-worksite-command`, `t287-runtime-activity-quiescence`,
   `t287-generic-job-lifecycle`, `t287-common-computational-library`,
   `t287-value-equality`, `t287-select-family`, `t287-calculus-fold`,
   `t287-lifecycle-failure-carrier`, `installed-language-smoke`; then
   `npm run test:uat:harness`. Save the full output to
   `.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/stdo3-library/step-8-run.log`
   (committed) and the per-file pass/fail table in Return. A failure
   returns to the first violated seam: name the suite, the assertion and the
   step whose commit introduced it (bisect over the step commits in the
   plan's ledger, running only that suite); fix only if the fix is inside a
   step 2 to 7 grant and bounded (one attempt), else stop. No test
   expansion.
4. **Completion condition.** From the step 3 and step 4 Returns, write the
   table: `O-RESOURCE`, `O-SHAPE`, `O-CODEC`, `O-SCHEMA`, `O-KEY`, each
   closed with its site, or open with the reason; `O-TYPE` per site. The
   library does not close with any of the five open: if one is open, say so
   in Return and the Executive decides.

**Grant.** Under `build_tenants/abiogenesis/typescript`: the callers of
`admitIJsonValue` that rule 1 retires and `code/src/shared/i_json.ts`;
`scripts/check-lifecycle-boundary.mjs` (new); `package.json` (one script
line); one-line `holdsAt` switches rule 2 allows; bounded fixes rule 3
allows (list each); the build outputs the gate regenerates. Plus
`step-8-run.log` and this file's `## Return 8a`. Nothing else: no design,
ticket or GOALS text; those are 8b.

**Gate:** `npm run build`; `npm run lint:imports`; `npm run lint:lifecycle`;
the integrated run of rule 3; `npm run test:uat:harness`.

**Return contract.** Stage by path, commit on `main`, no push. Message first
line `Step 8a: D4 disposition, lifecycle boundary check, integrated run`,
last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
Append to this file:

```
## Return 8a
- commit: <hash>
- D4: <retired for: caller per line with the demonstrated contract; bridge kept for: caller per line with reason>
- lint:lifecycle: <offenders found on head; fixed / allow-listed with reason>
- integrated run: <wall time; per-file pass/fail; failures with seam, assertion, introducing step, fix or stop>
- uat harness: <rc>
- completion condition: <O-RESOURCE, O-SHAPE, O-CODEC, O-SCHEMA, O-KEY: closed at <site> / open: <reason>; O-TYPE: <sites>>
- residuals
- return route: this file
```

Final report to the Executive: at most eight lines.

**Stop contract.** Stop without committing and write the reason if: (a) the
integrated run fails and the bounded fix of rule 3 does not clear it; (b)
`lint:lifecycle` finds an offender that is neither a one-line switch nor a
justified allow-list entry; (c) the D4 retirement would change a caller's
observable refusal.

ACTION: execute step 8a as activated.

## Items accrued for step 8 (Executive, running list)

For 8a's grant (add to rule 1 to 4 above):
- Delete `test_env/support/t288-admission-helper-preimages.json`, orphaned
  by step 4's deletion of `t288-admission-predicates.test.mjs`.
- Attribution rule for the integrated run: suites red at the pre-code
  baseline `97b1200bc` with the same failure set are recorded as baseline
  failures, not returned to a seam; the Executive's baseline run result is
  in the plan's ledger. Only a failure absent at the baseline returns to the
  first violated seam.

For 8b (ticket, GOALS, design closure after the review):
- Design §10.1 row 3 count correction: three record writers that produce
  persisted plan digests stay (digest stability); the installed-codec pair
  stays (installed Product's encoder).
- Design §4.3 wording: inline digest comparisons against stored digests
  stay `===`; comparisons that digest both sides became `canonicalEquals`.
- Design §10.6 row 5 record: the emission premise result from step 6.
- Public surface change in step 4 (`sameQualificationValue` removed from the
  `validator` barrel) recorded in the ticket section for Jim's decision.
- Step 2's `ABI5_OWNED_ADMISSION_PREIMAGE` env-gated test path needs a new
  preimage; record, do not build.
- Step 3's untouched copies: `isRecordEvidence`
  (`release_snapshot_definition_bindings.ts:91`), seven local `isJsonRecord`,
  remaining local `record` guards; `jsonRecord` schema still claims
  `JsonValue` members. Record as the "as touched" remainder.
- Tracked build outputs are a historical accident: `build/` is in
  `.gitignore`, yet 40 files under `build/code/src/` (and the contracts and
  manifest) are tracked from an older force-add, so every code step commits
  regenerated copies of exactly those 40 and a fresh checkout has a partial
  build tree. Record for Jim; the fix (`git rm --cached` of the 40, or
  tracking all of `build/`) is a separate decision outside this plan.
- Step 6 review (Fable) items for 8b's design notes: R2 the lifecycle
  rule's R branch lacks the formula's `not A` (unreachable on admitted
  prefixes; state it or add the term at step 8 with a falsifier); R5 the
  published native-runtime-observation contract embeds `ROOT_EVENT_CALCULUS`
  without the rules (no runtime consumer; state the law's two tables or
  drop the member); R6 §4.4 anchors to `event_calculus.ts` lines that now
  live in `abg/calculus/axioms.ts` and `rules.ts`; R7 "effects that depend
  only on the event kind" over-states the axiom table, which reads
  pre-existing context through `AxiomFoldContext`.
- Step 6 repair wording gap for 8b: the D7 paragraph says the witness is
  computed "when the route or judgment is proposed"; `sourceReplayDigest`
  sits in the invocation source-result basis, which is admitted, not
  proposed. One clause. The repaired `runtime_liveness.ts` lines 813 to 828
  run under no gate test; `m5-event-calculus-runtime` in the 8a run is their
  first execution.
- Second review (pasted by Jim, 2026-10-23; taken at `c6ff45521` plus the
  uncommitted step 7 work), items the Executive verified at `ffb767171`:
  - For 8a, code: (i) `calculus/fold.ts:141` copies the held map on every
    event; the old `advance` mutated in place (`98e0257d0`
    `event_calculus.ts:1985-2002`); each stdout/stderr event adds a distinct
    fluent keyed by event id (unchanged from the old axiom table), so one
    advance over N output events costs O(N²). Repair: `advance`
    (`event_calculus.ts:241`) folds into one working state copied once per
    call and applied in place; `foldStep` stays the pure one-step function
    that `t287-calculus-fold` (P-FOLD) proves against; rerun that lane.
    Grant line: `code/src/abg/event_calculus.ts`, `code/src/abg/calculus/fold.ts`.
    (ii) `gtl/consensus.ts:923` and the other `unknown`-typed validators in
    that file that pass unrefined members to `canonicalEquals`: the old NUL
    join returned false on `[NaN]`; `canonical_json.ts:28` throws. No I-JSON
    ingress produces NaN or undefined, so only an in-process caller reaches
    it, but the design's O-TYPE row is violated at an `unknown` ingress.
    Repair: `admitJson` on the comparand before `canonicalEquals` at the
    `unknown`-typed validators of `gtl/consensus.ts` only (a refusal returns
    false); the typed-carrier casts elsewhere stay and are the O-TYPE per-site
    list of the completion condition. (iii) Add
    `t287-c2-owner-coordinate-reuse` to the integrated run. It is 0/6 at
    `ffb767171` and 0/6 at the pre-code baseline `97b1200bc`, same first
    failure (`child C2 source does not reproduce at its admitted preparation
    cut`, `replay.js:1330`), so it is baseline-red and absent from
    `test:unit`, which is why the attribution never listed it. B14 required
    step 4 to prove the positive C2 path with materialization kept; step 4's
    proof is the unit lane's copy of the sequence and the production
    comparison in `exactC2SourceEnvironment` has zero hits. Repair: one
    bounded passing case that reaches the production comparison through its
    owner (shortest owner path; no campaign). If the baseline defect blocks
    the owner path, stop with the assertion and the cause; the C2 production
    proof stays open in the closing post and whether the baseline defect
    enters this wave is Jim's decision. (iv) Step 7 review F10: export the
    13-member list from `shared/process/facts.ts` beside the encoder and
    import it in `worksite_construction_recovery.ts:58-60`.
  - For 8b, records: (v) O-SCHEMA at `product/default_library.ts:45`
    (`jsonRecord`, shallow `isRecord`): step 3 wrote "closed by decision"
    without the premise. The premise: `isGovernanceWorkState(value: unknown)`
    is reached through the Product's `admitInput` and `validateContractValue`
    with parsed I-JSON, so a function member cannot arrive through the
    boundary; an in-process probe (`{ hidden: () => 7 }`) passes. Record the
    closure as "closed by ingress premise" in the completion table, or, if
    Jim wants refusal at the schema, `admitJson` inside the custom check (one
    line, 8a). O-TYPE was never claimed closed; the completion condition
    carries it per site. (vi) Step 5's reason for the eight readers left
    ("needs a runtime value") is the wrong reason: constitution line 1861
    permits runtime data; the constraint is the atom's static `RecordCheck`
    (design §3, "with a static RecordCheck"), so an expected digest from the
    call has no parameter to flow through; extending the check with typed
    context is a design change to the atom, deferred. Correct the step 5
    wording in the ticket section. (vii) Step 7 review F9: stale citations
    (`design:549`, `:553-558`, `:566`, `:589`, `:270-285`, `:189`, `:199`;
    `c_call.ts:7047` is `:7052`).
- Step 7 repair residuals (`dddb05dfd`): (viii) for 8a, inside the test
  files: `t287-owned-process-lifetime` fails 3 of 18 (`:415`, `:490`,
  `:533`) because the fixtures at `:490` and `:533` pass tasks without
  `taskRef`/`taskDigest` (or `{}`), so the new diagnostic's `canonicalJson`
  throws `Cannot convert undefined or null to object` and masks the first
  error, and all three assertions expect the bare error that F3 retired.
  `m5-worker-transport`'s owned-group test calls `runHttpProbe({}, …)` and
  `runCommand` with the same shape (passed this run; same exposure). Fix:
  give every fixture task `taskRef` and `taskDigest` as the helper's input
  contract requires, and assert the new diagnostic (prefix, `diagnostic.message`,
  `processFacts.firstError.message`); no change in the helper. (ix) for 8b:
  P-LIFECYCLE's helper clause (`design:634`) says the helper negatives
  "yield the admitted leaf result or failure subject with the encoded facts";
  for a no-child launch failure the outcome is a leaf result, and §9.3 item
  4 now says the encoding is not a `result.json` member. Reword: the no-child
  negative yields the leaf result whose existing members (`exitStatus` 127,
  `terminationConfirmed` true) carry the outcome; the encoded facts travel on
  the failure subject only.

## Activation 8a addendum (Executive, 2026-10-23)

Head is the Executive's bookkeeping commit after the step 7 repair
`dddb05dfd`. The items above marked "for 8a" are part of this activation.
Do them in this order after rule 1 (D4) and rule 2 (lint) and before rule 3
(the integrated run): (viii) the two test files' fixtures and assertions;
(i) the fold working state; (ii) `admitJson` at the `unknown`-typed
validators of `gtl/consensus.ts`; (iv) the exported member list; (iii) the
C2 owner-reuse suite in the run and one bounded owner case; and the
preimage file deletion.

For (i): keep one effect law. Add an in-place `applyStep(working, event,
dependencies)` in `calculus/fold.ts` that mutates a working state;
`foldStep` becomes "copy the state once, then `applyStep`" and stays the
exported pure step; `advance` (`event_calculus.ts:241`) copies once per call
and runs `applyStep` per event, then freezes. `t287-calculus-fold` (P-FOLD:
cold pure fold equals the class's `project` at every cut, and `forkAt`)
must pass unchanged; it is the proof that the two drivers agree. No other
structural change (no persistent map, no library).

For (ii): only validators in `gtl/consensus.ts` whose parameter is
`unknown` and that pass a member to `canonicalEquals` without refining it;
`admitJson` on the comparand first, a refusal returns `false`; list each
site in Return under O-TYPE as "closed at <site>". Sites in other files stay
on the O-TYPE per-site list.

For (iii): the shortest owner path that reaches `exactC2SourceEnvironment`
in `abg/execution_basis.ts` with materialization kept. One passing case, in
`t287-c2-core-environment.test.mjs` or a new `t287-c2-owner-path.test.mjs`
(say which). Prove the reach by a temporary counter removed before the
commit, or by an assertion on an effect only that comparison produces. If
the baseline defect of `t287-c2-owner-coordinate-reuse` (`replay.js:1330`,
red at `97b1200bc`) blocks every owner path, stop that item: record the
assertion and the cause in Return, do not fix the baseline defect, and
continue with the rest of the step.

Grant additions: `code/src/abg/event_calculus.ts`, `code/src/abg/calculus/fold.ts`;
`code/src/gtl/consensus.ts`; `code/src/shared/process/facts.ts` and
`code/src/abg/worksite_construction_recovery.ts:58-60` (the list and its
import only); `test_env/tests/t287-owned-process-lifetime.test.mjs`,
`test_env/tests/m5-worker-transport.test.mjs` (fixtures and the three
assertions only); the one C2 case file; `test_env/support/t288-admission-helper-preimages.json`
(delete). Run-list additions: `t287-c2-owner-coordinate-reuse` (expected
baseline-red; attribution rule applies) and the new C2 case file. A built
pre-code baseline for attribution is at
`/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/wt-base-97b1200bc/build_tenants/abiogenesis/typescript`
(`97b1200bc`, `tsc` built, `node_modules` symlinked); run a suite there only
when the attribution of a failure needs it.

Return additions: under `- integrated run`, one line per item (viii), (i)
with the P-FOLD result, (ii) with the sites, (iv), (iii) with the case or
the stop; under `- residuals`, anything left.

## Return 8a

- commit: the commit carrying this Return (first line `Step 8a: D4 disposition, lifecycle boundary check, integrated run`, parent `7deeff589`); its hash is in the final report. Not pushed. Staged by path.
- D4: retired for: none. Bridge kept for all 22 call sites in 12 modules, plus the internal leaf path in `shared/i_json.ts` (`admitIJsonText` -> `reconstructIJsonNode` -> `admitIJsonValue`). The activation's "21 importers" does not match head: 12 modules under `code/src` import it. The step 3 Return proves the lift (`admitIJsonValue` = `liftIJson(admitJson(input), label)`, 202 inputs, 0 differences) but demonstrates no caller contract, so no caller is retired. A retirement must replace a `try`/`catch` on the thrown error with a branch on the `Outcome`. `admitJson` still throws on defects (a proxy trap, a cycle), so dropping the `catch` would change those callers' observable refusal, which stop (c) forbids. Per caller:
  - The `catch` returns the caller's own refusal:
    - `validator/conformance_operation.ts:248` -> `invalid_packet`
    - `product/result_assessment_operation.ts:501` -> `value_mismatch`
    - `abg/witness_admission_operation.ts:436` -> `content_invalid`
    - `abg/project_read_ports.ts:599` -> `invalid_packet`
    - `abg/actor_process.ts:370` -> `invalid_actor_process_request`
    - `abg/actor_process.ts:415` -> `invalid_actor_process_observation`
  - The refusal carries the message: `validator/raw_admission.ts:184`. Its `catch` at `:227` returns `non_canonical_value` with `error.message`, so the lift's label text is observable.
  - The `catch` returns null, false or rejected:
    - `abg/actor_process.ts:1058` (rejected)
    - `abg/probabilistic_result.ts:285` (null)
    - `implementation/leaf_invocation_port.ts:687` (null)
    - `implementation/leaf_invocation_port.ts:768` (`malformed_return`)
    - `abg/execution_basis.ts:250` (null)
    - `product/worksite_command_execution.ts:1749-1750` (false)
  - The throw is the fault:
    - `product/worksite_command_execution.ts:1023`, `:1026`, `:1954` and `:2005`. The file is also pinned through the gtl C2 context pin.
    - `abg/event_store.ts:1736` and `:2544`
    - `abg/project_read_ports.ts:1555`
    - `implementation/worksite_command_execution.ts:168`
  - Two test importers use the export: `t287-ordered-reconstruction` (in the run) and `t287-f04a`.
- lint:lifecycle:
  - New `scripts/check-lifecycle-boundary.mjs` and `npm run lint:lifecycle`. It reads the TypeScript AST of `code/src/**/*.ts`, excluding `code/src/abg/calculus/`. A file fails when:
    - it writes a lifecycle fluent name (`actor_process_live`, `actor_process_terminated`, `actor_process_termination_unconfirmed`, `actor_cleanup_pending`, `terminationConfirmed_copy_disagrees`) anywhere other than the `name` of a pattern passed to `holdsAt`, directly or through `constructRuntimeFluentPattern`. One exception: `actor_process_termination_unconfirmed` is also an event kind, so it passes in event-kind positions.
    - it reads `scopeAbsence` or `directExit` outside the process owners: `shared/process/`, `shared/owned_process_lifetime.ts`, `abg/worker_transport.ts`, `abg/actor_process.ts`, `implementation/worksite_command_helper.ts`.
  - Offenders on head: 10. None is a one-line switch. All 10 are allow-listed by exact line text, each with its reason:
    - `abg/actor_process.ts:638-640`: arguments of the local `lifecycle` reader (`:636-637`), whose only use of the name is the `holdsAt` pattern `name`.
    - `abg/replay.ts:322`, `:329`, `:349`, `:350`, `:362`: the Run quiescence name table. It classifies each fluent of the folded held set as blocking or historical, and constructs no fluent.
    - `abg/worksite_construction_recovery.ts:66`, `:68`: they check the digest-bound transport artifact's encoded facts against that artifact's exit. This is referenced evidence (§9.1), not a lifecycle question.
  - An allow-list entry that matches no line fails the check.
  - Head result: `284 modules under code/src; 10 allow-listed site(s), no offender`.
  - Falsifier: three offenders injected into `replay.ts` exit 1 with 3 offenders. They were an object-literal fluent name, a `facts.scopeAbsence` read and a pattern not passed to `holdsAt`. The file was restored.
- integrated run: `step-8-run.log` is the gate run of the committed tree: build, `lint:imports`, `lint:lifecycle`, one `node --experimental-vm-modules --test --test-concurrency=1` invocation over 34 files, then `test:uat:harness`.
  - Gate steps:
    - build: rc 0, 34 s.
    - `lint:imports`: rc 0.
    - `lint:lifecycle`: rc 0.
    - Run: rc 1, 941 s wall. The node summary, which counts subtests, is tests 286, pass 228, fail 44, cancelled 2, skipped 12.
  - An earlier full run, on the tree before the C2A fix (945 s), differs from this one only in the C2A test (fail -> pass), compared by file and test name over all 241 top-level results.
  - Per file, top-level pass/fail[/skip]:
    - `forward-command-contracts` 8/0, `forward-command-owners` 2/4, `installed-language-smoke` 1/0
    - `m5-c-algebra-validation` 18/0/3, `m5-consensus-module` 0/1 (load), `m5-event-calculus-runtime` 13/5/1, `m5-event-store-reopen` 18/0
    - `m5-fresh-process-reconstruction` 0/1, `m5-installed-graph-edge` 0/1, `m5-installed-portability` 5/3, `m5-retry-lifecycle-authority` 4/5
    - `m5-s03-authority` 1/4, `m5-s06-prime` 10/1, `m5-terminal-quiescence-owner` 5/2, `m5-worker-transport` 21/0
    - `t287-c2-owner-coordinate-reuse` 0/6, `t287-c2a-fp-source-contract` 4/0, `t287-calculus-fold` 6/0
    - `t287-calculus-state-transfer` 0/1 (timeout at 300000 ms), `t287-common-computational-library` 4/0
    - `t287-event-calculus-owner-continuation` 0/1 (load), `t287-generic-job-lifecycle` 0/0/1, `t287-lifecycle-failure-carrier` 5/0
    - `t287-native-runtime-gate` 6/0/1, `t287-native-semantic-revision` 4/4/1, `t287-native-structural-gates` 9/0
    - `t287-observed-worksite-command` 7/1, `t287-ordered-reconstruction` 0/4/3, `t287-owned-process-lifetime` 18/0
    - `t287-reconstruction-conservation` 0/0/2, `t287-runtime-activity-quiescence` 1/0, `t287-select-family` 7/0
    - `t287-value-equality` 4/0, `t287-worksite-command-execution` 3/1
  - Baseline failures are recorded under the attribution rule and not returned to a seam. Each file below fails the same set of tests at `97b1200bc`, with the same first error. The comparison was one invocation over the red files plus the harness in the built baseline worktree, 742 s; `t287-worksite-command-execution` was checked in its own run there.
    - `forward-command-owners` (4)
    - `m5-consensus-module`: fails at load; `ROOT_PUBLIC_OPERATION_IDS` is not exported.
    - `m5-event-calculus-runtime` (5): `abg.openCall is not a function`, and the terminal projection row.
    - `m5-fresh-process-reconstruction` (1)
    - `m5-installed-graph-edge` (1)
    - `m5-installed-portability` (3)
    - `m5-retry-lifecycle-authority` (5): missing source boundaries.
    - `m5-s03-authority` (4)
    - `m5-s06-prime` (1)
    - `t287-c2-owner-coordinate-reuse` (6): "child C2 source does not reproduce at its admitted preparation cut".
    - `t287-calculus-state-transfer` (1): timeout.
    - `t287-event-calculus-owner-continuation`: fails at load at `:18`, "exact preimage territory and a digest-bound CLOSED JSONL fixture are required".
    - `t287-native-semantic-revision` (4)
    - `t287-observed-worksite-command` (1)
    - `t287-ordered-reconstruction` (4)
    - `t287-worksite-command-execution` (1): `:826`, `'failure' !== 'success'`.
  - Failures absent at the baseline. Each was bisected over the ledger's step commits (`10efed8b2`, `c2432eb85`, `8eede7fdb`, `ffb767171`), running only its suite, in a scratch worktree built at each commit.
    - `t287-c2a-fp-source-contract`, "C2A F_P effect handoff is one direct exact-prefix ABG invocation". Fixed.
      - It is 4/0 through `8eede7fdb` and 3/1 at step 7 (`ffb767171`).
      - Cause: the source assertion `:40-43` requires `effectResult.kind === "actor_process_effect_refusal"` followed by `effectResult.successorPrefix`. Step 7 moved the branch body into `failActorProcessEffect(input, refusal)`, above its caller.
      - Fix, one attempt, inside step 7's grant (`hog/ccall_lifecycle.ts`, with its tracked `build/code/src/hog/ccall_lifecycle.js`): the function now sits below `evaluateOwnedExecutableCCall`, and its parameter is named `effectResult`. This changes source order and one parameter name only; the semantics are unchanged.
      - Result: the suite is 4/0. `t287-lifecycle-failure-carrier`, which exports the function into its harness, is 5/0.
    - `m5-terminal-quiescence-owner`: 7/0 at `10efed8b2`, 5/2 from step 6 (`c2432eb85`). Stopped; not fixed.
      - "unconfirmed cleanup stays live until a genuine confirmed Process terminal, including cold replay", `assertCut` called at `:173`, after the `actor_process_exited` that follows `actor_process_termination_unconfirmed`:
        - At step 6 it fails at `:166` (`false !== true`). `actor_process_termination_unconfirmed` no longer holds after the exit, by the law `terminationUnconfirmed = not T and U`.
        - From step 7 it fails earlier, at `:162`: `projectRuntimeActorProcessFactsAtPrefix(...)[0].terminationConfirmed` is `false`. Step 7 switched `abg/replay.ts`'s `terminationConfirmed` to `holdsAt(actor_process_terminated)`. The step 6 rule (`calculus/rules.ts:127-152`) initiates `actor_process_terminated` only when no termination-unconfirmed precedes the exit, and this test expects a later exit to confirm. step-6.md:395 and `:445` record `:166-167` and `:222` as expected step 8 flips. `:162` is not recorded in step 6 or step 7.
      - "unjoined process uncertainty preserves cleanup without claiming a native write scope", `:222`. It expects the axiom effect of `actor_process_termination_unconfirmed` to initiate `actor_cleanup_pending`. Since step 6 the rule initiates it, not the axiom.
      - Why it is stopped:
        - The test file is in no step 2 to 7 grant. Step 6's grant (step-6.md:177-181) names only the new `t287-calculus-fold` test.
        - A code fix would reverse the step 6 lifecycle law and step 7's reader. That is not a bounded fix.
        - Whether a termination-unconfirmed followed by a genuine exit confirms termination is a design question for the Executive. The test says yes; the rule says no.
  - Stop scope. Activation stop (a) reads: "Stop without committing and write the reason if: (a) the integrated run fails and the bounded fix of rule 3 does not clear it". The relayed rule reads: "a failure absent at the baseline returns to its seam and is fixed only if bounded and inside a step 2 to 7 grant, one attempt, else stop that item and record it". I applied the relayed per-item rule. The quiescence item is stopped and recorded, and the step is committed. If the Executive reads (a) as a whole-step stop, the commit is local and unpushed.
  - (viii) Done. Fixtures and the three assertions:
    - `t287-owned-process-lifetime`: fixtures:
      - the stream-failure task gains `taskDigest` and is passed to `runHttpProbe`;
      - the physical HTTP probe gains `taskRef` and `taskDigest`.
    - `t287-owned-process-lifetime`: the assertions on the owner failure, `observed.error` and the HTTP owner error now read the per-owner prefix "... failed; dependent work stopped: ". They parse the JSON body and require `processFacts.firstError.message` to equal `diagnostic.message`.
    - `m5-worker-transport`: the command task gains `taskRef` and `taskDigest`, which are passed to `runHttpProbe`.
    - Results: `t287-owned-process-lifetime` 18/18 (it was 15/18); `m5-worker-transport` 21/21.
  - (i) Done. One effect law:
    - `calculus/fold.ts` adds `applyStep(working, event, dependencies)`. It computes the effect, the declip keys and the probe and interruption facts first, then mutates a `WorkingFoldState` in place and returns the frozen transition.
    - `workingFoldState` copies every carrier once; `frozenFoldState` freezes. `withScope` is removed.
    - `foldStep` is `workingFoldState` -> `applyStep` -> `frozenFoldState` and stays the exported pure step.
    - `RuntimeEventCalculusDerivation.advance` (`event_calculus.ts`) copies once per call, runs `applyStep` per event with `memoize`, and freezes in `finally`.
    - P-FOLD (`t287-calculus-fold`): 6/6 unchanged, in the integrated run.
  - (ii) Done. Each `unknown` comparand is admitted with `admitJson` at its original evaluation position, before `canonicalEquals`; a refusal returns `false`. There is no file-local helper. Closed at `gtl/consensus.ts`:
    - `isConsensusActionCatalog`: `:833`, `:839`, `:845`
    - `isConsensusObservationSnapshot`: `:937`, `:944`
    - `isConsensusNextActionBasis`: `:1115` (`declaredPolicy`) and `:1125`
    - `isConsensusActionEvaluationBasis`: `:1271`
    - `isConsensusRoleInstruction`: `:1920` (`responseSchema`)
    - In-process check: a valid reviewer instruction gives `true`; a `NaN` or `undefined` `responseSchema` gives `false` and does not throw.
    - No green suite runs this file: `m5-consensus-module` fails at load at the baseline.
  - (iv) Done:
    - `shared/process/facts.ts` exports `OWNED_PROCESS_FACT_MEMBERS`: the 13 members of `encodeOwnedProcessFacts`, in default sort.
    - `abg/worksite_construction_recovery.ts` imports it (`:36`); the local `PROCESS_FACT_MEMBERS` (head `:58-60`) is removed. `hasExactKeys(facts, OWNED_PROCESS_FACT_MEMBERS)` is at `:65`.
    - The barrel `shared/process/index.ts` is unchanged.
  - (iii) Stopped. No case file was added. The reach is shown; a passing case is not one bounded case.
    - Reach: the shortest owner path to `exactC2SourceEnvironment` is the installed Public C1 -> C2 run in `t287-worksite-command-execution.test.mjs:407`. A temporary counter in the built `abg/execution_basis.js`, with the manifest regenerated, recorded two production comparisons of the durable source against the view:
      - both sides admitted `ok`; `equal: true`; 186 events;
      - the callers were `admitExecutionBasis` (through `owner_bindings/run_invocation`) and `hasExactWorksiteCommandLeafSourceAtDurablePrefix` (through `leaf_invocation_port` `verifyAuthority`).
      - The counter was then removed and the build and manifest regenerated. `grep c2-probe` over `build/`, `contracts/` and the manifest is empty.
    - Why no passing case: that C2 run closes and its fresh replay passes. The case then fails at `:826` in its owner-local negatives (`'failure' !== 'success'`), and this failure is red at `97b1200bc`. A passing copy would duplicate several hundred lines of that suite's private helpers and phases.
    - `t287-c2-core-environment.test.mjs`, the addendum's other host, has no owner path. It is a component test whose header labels invocation and native-owner authentication as premises. Its assembly case replaces `./execution_basis.js` with a supplied `authenticateOwnedNativeInstructionAssemblyBasis`, so `exactC2SourceEnvironment` never runs there. An owner case in that file would need the same installed Product and run-invocation setup.
    - `t287-c2-owner-coordinate-reuse` runs the native-reacquisition task and returns on the `admittedNativeTask` branch before the C1/C3 comparison. It would not reach this comparison even when green, so step 4's route ("unproven until owner-reuse is green") does not lead here.
    - Executive options: accept the `:407` phases plus the counter as the production proof; authorize a separate case; or take `:826` to Jim as a baseline defect.
  - Preimage file: `test_env/support/t288-admission-helper-preimages.json` is deleted. Only historical binary snapshots name it.
- uat harness: rc 1. 34 tests: 30 pass, 1 fail, 3 skip. The failure is `harness.test.mjs:471`/`:490` "canonical C2 budget fits" (18025250 !== 18015000). It is identical at `97b1200bc`, so it is a baseline failure.
- completion condition: O-RESOURCE is open, so the library does not close.
  - O-RESOURCE open:
    - Seven self-comparison encodability probes `sameJson(resources, resources)` / `sameJson(value, value)` are unchanged since `97b1200bc`:
      - `product/catalog_definition_bindings.ts:290`, `:704`, `:856`
      - `product/environment_definition_bindings.ts:240`, `:535`
      - `product/install_definition_bindings.ts:143`
      - `product/project_read_definition_bindings.ts:128`
    - Each one detects a non-encodable resource by whether `canonicalEquals` throws inside `sameJson`. No step was granted these sites.
    - The closed part is in `public/binding/definition_binding_mechanics.ts` (step 3): `requiredSlot` uses `admitRef` and `exactContractCoordinate` uses `admitContract`.
  - O-SHAPE closed:
    - step 3's `isRecord` retirements;
    - `abg/retry.ts:663` by the D3 ruling (`admitJson`, step 4).
  - O-CODEC closed at `abg/event_body_encoding.ts`: `nativeParts` (`:26`) and `decodeEventBody` (`:163`).
  - O-SCHEMA closed by ingress premise at `product/default_library.ts:45` (`jsonRecord`, shallow `isRecord`):
    - `isGovernanceWorkState` is reached only through the Product's `admitInput` and `validateContractValue` with parsed I-JSON, so a function member cannot cross the boundary. An in-process `{ hidden: () => 7 }` passes the check.
    - `abg/project_read_definition_bindings.ts:152` `asRecord` takes `JsonValue | undefined`.
    - If Jim wants refusal at the schema, the alternative is a one-line `admitJson` inside the custom check.
  - O-KEY closed:
    - the 34 NUL-joined bodies are retired;
    - `product/default_library.ts:133` uses five keys.
  - O-TYPE closed at:
    - `abg/retry.ts` `isProjectedRetryResumeCarrier`
    - `abg/execution_basis.ts` `exactC2SourceEnvironment` (both sides) and `detachJsonRecord`
    - `abg/invocation_execution_truth.ts` (the basis projection)
    - `product/verify_product.ts` `makeCoordinate`
    - `hog/parent_rehydration.ts` (both `application` sites)
    - `gtl/consensus.ts` `:833`, `:839`, `:845`, `:937`, `:944`, `:1115`, `:1125`, `:1271`, `:1920` (8a)
  - O-TYPE open, per step 4's per-file cast list:
    - 867 of 1204 calls are cast;
    - about 65 `unknown`-typed sites still cast;
    - the binding `sameJson` lift;
    - the `parent_rehydration` carrier;
    - the `jsonRecord` consumers `abg/default_library.ts:51`, `abg/instruction_assembly.ts:325` and `product/default_library.ts:224`;
    - the guard-refined `gtl/consensus.ts` sites `:2201`, `:2498`, `:2502`, `:2604`, `:2828`, `:2870`, `:3185`, `:3280`, and the relation evaluators at `:3612-3860`.
- residuals:
  - Stopped items, for the Executive:
    - `m5-terminal-quiescence-owner`, both assertions.
    - (iii), the C2 owner case.
    - O-RESOURCE.
    - Whether stop (a) applies to the whole step, quoted under integrated run.
  - Baseline worktree:
    - For the manifest generator to run, its `node_modules` symlink was replaced by a real copy, because `@standard-schema/spec` resolved outside its package root. Its `product-toolchain-manifest.json` and contracts inventories were regenerated in that worktree.
    - The plan ledger's baseline run used the symlinked tree, so installed suites compare only against the worktree as it is now.
    - The bisect used a separate scratch worktree, removed after use.
  - Step 4's "0 hits" mechanism: a counter edited into compiled JS without regenerating the manifest makes every installed suite refuse with `product_content_mismatch` before it reaches the comparison. Step 4's Return does not say which of the two produced its zero.
  - `t287-native-work-unknown-effect` (step-6.md:395 expected flip near `:69`) is not in the 8a run list and was not run.
  - The `t287-event-calculus-owner-continuation` source patch (step-6.md:395) is still unapplied. The suite fails at load at `:18` on its fixture precondition, both at head and at `97b1200bc`.
  - No green suite exercises `gtl/consensus.ts` (`m5-consensus-module` fails at load on `ROOT_PUBLIC_OPERATION_IDS`, baseline).
  - D4 premise: the activation counts 21 importers; head has 12 modules and 22 call sites.
  - Single-suite runs outside the integrated run were for investigation, attribution, bisect and the pre-commit C2A check (9/9). The committed log is the full rerun of the committed tree. The first full run, before the fix, is not committed.
  - The `m5-terminal-quiescence-owner:162` flip, which step 7's `holdsAt` reader in `replay.ts` caused, is unrecorded in step-6.md and step-7.md. It is the same design question as `:166`: does a genuine exit after a termination-unconfirmed confirm termination?
  - Tracked build output: `build/code/src/hog/ccall_lifecycle.js` is regenerated and committed. It is one of the 40 tracked build files recorded for Jim in the step 8 items. Its `.d.ts` is unchanged.
- return route: this file

## Disposition of 8a (Executive, 2026-10-23)

Accepted: `37ef7d760`. Stop (a) is read per item, as relayed; the commit
stands. Rulings on the stopped items:

1. **`m5-terminal-quiescence-owner` (D9, Executive, recorded in the plan).**
   The step 6 law stands: an `actor_process_exited` after an
   `actor_process_termination_unconfirmed` for the same process does not
   initiate `actor_process_terminated`. The exit event carries no scope
   evidence (`status`, `signal` only); the unconfirmed verdict is about the
   owned scope (§4.6, `hasConfirmedOwnedProcessBoundary`); the owner reports
   one terminal event, so the sequence occurs only in prior-law stores and
   reads as unconfirmed. The test encodes the pre-step-6 law at `:162`,
   `:166-167` and `:222` (the latter two recorded at step 6 as expected
   flips; `:162` is step 7's reader following the fluent under D5). The test
   follows the ratified law. Reversal: drop the `!unconfirmed` guard in
   `calculus/rules.ts` (one line) and restore the three expectations.
2. **C2 production proof (item iii).** Accepted on the Return's evidence:
   the installed Public C1 to C2 run in `t287-worksite-command-execution:407`
   reaches `exactC2SourceEnvironment` twice with both sides admitted and
   equal (186 events), through `admitExecutionBasis` and
   `hasExactWorksiteCommandLeafSourceAtDurablePrefix`; the counter was
   removed and the manifest regenerated. That is the positive C2 path
   through its owner with materialization kept (B14). Step 4's "zero hits"
   was a measurement artifact: a counter in compiled JS without the manifest
   regenerated makes every installed suite refuse with
   `product_content_mismatch`. Record both in 8b (design §10.5 P-EQUAL, step
   4 ticket note). The suite's later `:826` failure is baseline-red and is
   Jim's decision; it does not block the proof. No separate case.
3. **O-RESOURCE.** The seven self-comparison probes are repaired in 8a-2
   below under design §10.3's wording: "require existing checked data or
   resource and handle premises ... An equality probe is not admission."
4. **D4.** Bridge kept at all 22 sites, as the Return demonstrates; the
   activation's "21 importers" was the step 3 count. Closed as recorded.
5. Everything else in the Return stands as recorded. The unapplied
   `t287-event-calculus-owner-continuation` patch is moot while the suite
   fails at load on its fixture at the baseline; 8b records it.

## Activation 8a-2 (Executive, 2026-10-23)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Head is the
Executive's bookkeeping commit after `37ef7d760`. Read this section, the
`## Disposition of 8a` above, and the `## Return 8a` entries it cites
(O-RESOURCE open; `m5-terminal-quiescence-owner`; residuals). Tenant root
`build_tenants/abiogenesis/typescript`; every test runs with
`node --experimental-vm-modules --test`. Change class: `realization_refactor`
plus the two design sentences named here.

1. **O-RESOURCE, seven sites:** `product/catalog_definition_bindings.ts:290`,
   `:704`, `:856`; `product/environment_definition_bindings.ts:240`, `:535`;
   `product/install_definition_bindings.ts:143`;
   `product/project_read_definition_bindings.ts:128` (lines at `37ef7d760`).
   Each is `sameJson(x, x)`, true unless `canonicalEquals` throws, and
   `canonical_json.ts` throws only on a non-finite number. For each site,
   read the producer of `x`. If `x` is already admitted or typed data
   (parsed I-JSON through `admitIJsonText`/`admitJson`, or built from typed
   `JsonValue` members), delete the probe: its false branch is unreachable
   and every outcome is preserved. If the producer cannot be shown, replace
   the probe with `admitJson(x).kind === "ok"` (the admit family's refusal
   set is wider: unsafe integers, lone surrogates, non-I-JSON values) and
   state that the site's refusal set widened. Record each site's answer
   in Return. No new helper.
2. **Quiescence test (D9):** in `test_env/tests/m5-terminal-quiescence-owner.test.mjs`,
   change the three expectations to the ratified law: after the late exit,
   `terminationConfirmed` is `false`, `actor_process_terminated` does not
   hold, `actor_process_termination_unconfirmed` holds, cleanup stays
   pending until the actor terminal (`:162`, `:166-167`); at `:222` the
   `actor_cleanup_pending` initiation is the rule's, not the axiom's:
   assert it through `deriveRuntimeEventCalculusProjection` and `holdsAt`
   over a two-event prefix, not through `eventCalculusEffect` alone. Keep
   every other assertion. Add one sentence to design §10.6 row 5
   (`ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:648`): "An
   `actor_process_exited` after an `actor_process_termination_unconfirmed`
   for the same process initiates no `actor_process_terminated`: the exit
   carries no scope evidence and the owner reports one terminal event, so
   the sequence reads as unconfirmed (D9, Executive, 2026-10-23)."
3. **Run once and record:** `t287-native-work-unknown-effect` (step 6's
   expected flip near `:69`, never run). Attribution rule applies: compare
   with the built baseline worktree at
   `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/wt-base-97b1200bc/build_tenants/abiogenesis/typescript`
   only if it fails; a failure absent at the baseline and caused by the
   step 6 law gets its expectations updated in the same way as item 2 if
   the flip is the one step 6 recorded, else stop that item and record.

**Grant:** the four `product/*_definition_bindings.ts` files (the seven
lines only), `test_env/tests/m5-terminal-quiescence-owner.test.mjs`,
`test_env/tests/t287-native-work-unknown-effect.test.mjs` (item 3 only),
the one design sentence, the build outputs the gate regenerates, this
file's `## Return 8a-2`. Nothing else.

**Gate (in order):** `npm run build`; `npm run lint:imports`;
`npm run lint:lifecycle`; `m5-terminal-quiescence-owner`;
`t287-native-work-unknown-effect`; `t287-calculus-fold`;
`t287-common-computational-library`; `m5-event-store-reopen`;
`npm run test:installed:language`. The full integrated run is not repeated
here; it runs once more at the close.

**Stop:** a probe's producer is neither shown nor replaceable without a
behavior change beyond the stated widening; a gate suite fails with a
failure absent at the baseline that is not the recorded step 6 flip.

**Return contract.** One commit on `main`, no push. First line
`Step 8a-2: O-RESOURCE probes; quiescence expectations under D9`, last line
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append
`## Return 8a-2` with: commit; the seven sites (deleted / replaced, producer
shown); the quiescence changes; item 3's result with attribution; gate per
suite; residuals.

## Return 8a-2

- commit: none. The stop fired at `product/project_read_definition_bindings.ts:128`. The one replacement the activation authorizes there changes behavior beyond the stated widening (see "Stop at `:128`" below).
  - Items 1 to 3 are done, and the gate passed on the full change.
  - The change is saved as a patch: `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/8a2/step-8a-2.patch`. It has 9 files, sha256 `fe89ca2351c325fa3d86fad3c3cd2cd118ed4c127448c0aa29dd540a9d0298f6`, and `git apply --check` is clean at `1ee0265fa`.
  - The tracked tree is restored to `1ee0265fa` and rebuilt, and the manifest and graph regenerate identical.
  - Applying the patch ratifies four decisions, not only the one on `:128`:
    - the ruling on `:128` (options below);
    - the six probes deleted on the wrapper premise rather than replaced. The activation's delete test is admitted or typed data, and the wrapper's digest is neither;
    - `:166` and native-work `:69` following the fold (`not T and U`), not the activation's "`actor_process_termination_unconfirmed` holds";
    - edits outside "the seven lines only": the `admitJson` import at project_read `:37`; the trailing `||` removed from the lines before catalog `:704`, `:856` and environment `:240`; and one added `actor_process_terminated` assertion in m5.
- Premise correction. `writeCanonicalJson` throws on more than a non-finite number:
  - an `undefined` member (`Object.entries(undefined)`);
  - a cycle (RangeError, stack overflow);
  - a throwing accessor or proxy trap.

  `sameJson` returns false for each. `admitJson` refuses `undefined` and accessors (`non_ijson_value`), but it throws on a cycle and on a proxy trap (its documented defects).
- The seven sites. Lines are at `1ee0265fa`, the same as at `37ef7d760`, because the head commit changed only the plan and this file.
  - Producer, for all seven: `call.resources`, the transport's sibling assertion (`shared/effect_definition.ts:35-37`).
    - The installed transport detaches an `unknown` candidate with `structuredClone` (`public/installed_definition_call_transport.ts:238-283`, `:292-294`). That keeps cycles, NaN, `undefined`, Date, Map and BigInt, turns accessors into data and refuses proxies.
    - The CLI parses with `JSON.parse` (`public/cli.ts:101`), not `admitIJsonText`.
    - Nothing admits `call.resources`, so at the transport it is neither admitted nor typed data.
  - Deleted, six sites:
    - catalog `:290` (`validateAdmissionStructure`), `:704` (`allowlist`), `:856` (`createApplyBinding`);
    - environment `:240` (`validateResolveResources`), `:535` (`validateBindResources`);
    - install `:143` (`validateResources`).

    The premise shown for these six:
    - Each owner is reachable only through `withAdmissionAuthority` (catalog `:960-962`, environment `:817-818`, install `:421`). The inner consts and the validators are module-private.
    - Before the owner runs, the wrapper computes `digest(resources)`, which is `sha256Canonical`: the same `writeCanonicalJson` traversal, over the identical object it hands the owner (`product/admission_authority.ts:308-310`, `:334`). It binds that digest to the authority's `resourcesDigest`.
    - Any throw becomes `resource_relation_mismatch` (`:336`).
    - So each probe's false branch is unreachable, and deleting the probe keeps every outcome, cycles included.

    This premise is an existing check, not admission. I deleted the six instead of replacing them, because a replacement would widen six refusal sets without closing any reachable branch. If the Executive reads "admitted or typed" strictly, the alternative is `admitJson(resources).kind === "ok"` at each of the six. Behind the wrapper, that adds only the widening, because the wrapper already rules out every throw case.
  - Replaced, one site: project_read `:128` (`validResources`) now reads `admitJson(value).kind === "ok"`.
    - `admitJson` is added to the existing `../shared/admit/index.js` import at `:37`. That line is outside the seven, and the replacement needs it.
    - The producer is not shown. There is no wrapper, and nothing on the transport path traverses `resources` before this check: `admitExactDefinitionCall` reads only `invocation`, and `validResources` is the first statement in each of the five owners' `Effect.try`.
    - The refusal set widens to unsafe integers, lone surrogates and non-I-JSON values (Date, Map, BigInt, sparse arrays, class instances, accessors, symbol keys).
  - Stop at `:128`.
    - Before the change, a cyclic resource, which `structuredClone` keeps, was refused with `resource_admission`/`invalid_resource_assertion`.
    - With the replacement, `admitJson` throws RangeError. The owner's `catch` maps that to `resource_admission`/`owner_execution_failure`, with the message "RangeError: Maximum call stack size exceeded".
    - Measured on both builds by calling `PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list` with a self-referencing `packet` (`8a2/probe-cycle.mjs`). NaN gives `invalid_resource_assertion` on both builds.
    - A throwing proxy trap changes in the same way. Only direct in-process callers can pass one.
    - 8a kept the D4 bridge on the same defect argument.

    Options:
    - (a) accept the changed fault code for cyclic input and commit the patch as is;
    - (b) keep `sameJson(value, value)` at `:128`, leaving O-RESOURCE open at one site;
    - (c) authorize a guard in the owner, which is outside this grant.
- Quiescence (`m5-terminal-quiescence-owner`): 5/2 before, 7/7 after.
  - `:162`: `terminationConfirmed` is `false` at every cut, with the message "an exit after termination-unconfirmed confirms no termination (D9)". One added line asserts that `holdsAt(actor_process_terminated)` is `false` at every cut.
  - `:166-167`: `actor_process_termination_unconfirmed` holds as `!confirmed`, that is, true before the exit and false after it. The message is "a process terminal ends termination-unconfirmed (not T and U)".
  - Discrepancy with the activation. The activation says this fluent holds after the late exit. The fold says it does not:
    - The rule clips the fluent on the exit (`calculus/rules.ts:156`, beside the D9 guard at `:151`).
    - Design §4.4 (`:195`) states `terminationUnconfirmed = not T and U`.
    - Step 6's review recorded this flip: "`:166-167` asserts `actor_process_termination_unconfirmed` after the exit (now `not T and U`)".

    The test follows the fold. After the late exit, the only lifecycle fluent of the process that holds is `actor_cleanup_pending`. The D9 design sentence, appended verbatim, says "the sequence reads as unconfirmed". Next to §4.4's formula, a reader can take that to mean the fluent holds, which is the same ambiguity, so the Executive may want to settle the wording before the patch lands. The sequence reads as unconfirmed only through `terminationConfirmed: false` and the absence of `actor_process_terminated`. If the Executive means the fluent to keep holding, that is a change to the rule and the design (drop the clip for an exit that follows termination-unconfirmed), outside this grant.
  - `:222`: `actor_cleanup_pending` is now asserted with `holdsAt(deriveRuntimeEventCalculusProjection(prefix([started, unknown])), …)`. The axiom effect's `terminates` and `clips` assertions stay. The started event is bound to the name `started` so it can be reused.
  - Every other assertion is unchanged. `:159-161` and `:163-165` pass as written: `processLive`, the projected `terminationUnconfirmed`, `actor_process_live` and `actor_cleanup_live` all follow the process terminal.
  - Design §10.6 row 5 (`:648`): the sentence is appended verbatim to the `U(B)` cell, after the D7 clause.
- Item 3 (`t287-native-work-unknown-effect`):
  - Head: 4 pass, 6 fail, of 10 (TAP counts). The five scenario subtests of "U1 scope, currentness and cleanup agree…" and their parent fail at `:69` ("historical uncertainty remains recorded", `false !== true`). The other four top-level tests pass.
  - Baseline worktree (`97b1200bc`): 10/10.
  - Cause: the step 6 rule clips `actor_process_termination_unconfirmed` on the exit. This is the flip step 6 recorded ("near `:69`").
  - Change: `:69` now expects `false`, with the item 2 message.
  - Rerun: 10/10. Lines `:71-82`, which never ran at head, pass.
- Gate, on the patched tree, in order:
  - build: rc 0, 33 s. It regenerated `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json`; both are in the patch.
  - `lint:imports`: rc 0.
  - `lint:lifecycle`: rc 0 (284 modules, 10 allow-listed sites, no offender).
  - `m5-terminal-quiescence-owner`: 7/7.
  - `t287-native-work-unknown-effect`: 10/10.
  - `t287-calculus-fold`: 6/6.
  - `t287-common-computational-library`: 4/4.
  - `m5-event-store-reopen`: 18/18.
  - `test:installed:language`: 1/1.
  - No result was baseline-red. The logs are `8a2/gate-*.log` and `8a2/gate-*.tap` in the same scratchpad.
- residuals:
  - The four decisions in the commit bullet. Once they are ruled, the patch is applied and committed with the contract message.
  - The six deletions rely on the wrapper's canonical traversal of the same object. A direct in-process caller whose nested accessor returns a different value on a second read could pass the wrapper and no later check would catch it. On the transport path that cannot happen, because `structuredClone` turns accessors into data.
  - Messages and names in the two tests still describe the exit as confirmation. None of them is an expectation, so all are unchanged:
    - m5: the title at `:148` ("…until a genuine confirmed Process terminal"), the `confirmed` parameter (which now means that a process terminal was admitted) and the comment at `:170`;
    - native-work: `:60`, `:66` and `:68`.
  - No gate suite reaches the six deleted probes or `:128`'s widened refusals. The only evidence for cyclic input is the probe script.
  - Tracked tree: restored to `1ee0265fa` and rebuilt, so `git status` shows no tracked change. The untracked files were not touched.
- return route: this file

## Disposition of 8a-2 (Executive, 2026-10-23)

The stop is answered; the saved patch is applied and committed by 8a-3.

1. `project_read_definition_bindings.ts:128`: (a) accept. A cyclic
   in-process value cannot come through any I-JSON ingress; it is a
   construction defect, and the owner fault `owner_execution_failure` is
   the truthful channel. The prior `invalid_resource_assertion` reported a
   defect as a data refusal. Recorded as the site's O-RESOURCE answer.
   Reversal: restore the probe (one line).
2. The six deletions: ratified. `withAdmissionAuthority` digests the same
   object with the same traversal first (`admission_authority.ts:310`,
   `:336`), so a non-finite number faults there and the probe's false branch
   is unreachable. That is the "existing checked data or resource" premise
   of design §10.3.
3. `:166` follows the formula `not T and U`; under D9 it is `true` at that
   cut, the same reading as the activation's. The D9 sentence in row 5 is
   sharpened in 8a-3: "...so `actor_process_termination_unconfirmed` holds
   and `terminationConfirmed` projects `false`".
4. The import, the three trailing `||` removals and the added assertion are
   the change's own lines; ratified.
5. Residual for the step 8 repair round: the quiescence test's titles and
   messages still describe the late exit as confirmation.

## Activation 8a-3 (Executive, 2026-10-23)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Apply
`/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/8a2/step-8a-2.patch`
at head with `git apply --3way` (if a hunk for this `.ai-workspace` file
fails, apply the rest and skip it). Then one edit: in design §10.6 row 5
(`ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:648`) replace the
clause "so the sequence reads as unconfirmed" with "so
`actor_process_termination_unconfirmed` holds and `terminationConfirmed`
projects `false`". Gate, in order: `npm run build`; `npm run lint:imports`;
`npm run lint:lifecycle`; `m5-terminal-quiescence-owner`;
`t287-native-work-unknown-effect`; `t287-calculus-fold`;
`t287-common-computational-library`; `m5-event-store-reopen`;
`npm run test:installed:language` (every test with
`node --experimental-vm-modules --test`). Commit on `main`, no push, first
line `Step 8a-2: O-RESOURCE probes; quiescence expectations under D9`, last
line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; stage by
path (the patch's files, the regenerated tracked build outputs). Append
`## Return 8a-3` with the commit hash and the gate per suite. Stop without
committing if the patch does not apply or a gate suite fails.

## Return 8a-3

- commit: `cac7802b2` on `main`, not pushed; parent `532928917`.
- patch: `step-8a-2.patch` applied with `git apply --3way`; every hunk applied cleanly; the patch carries no step-file hunk.
- applied files (staged by path, 9 files, +21 −22), under `build_tenants/abiogenesis/typescript/`:
  - `code/src/product/catalog_definition_bindings.ts`
  - `code/src/product/environment_definition_bindings.ts`
  - `code/src/product/install_definition_bindings.ts`
  - `code/src/product/project_read_definition_bindings.ts`
  - `contracts/capabilities/capability-definition-graph.json`
  - `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`
  - `product-toolchain-manifest.json`
  - `test_env/tests/m5-terminal-quiescence-owner.test.mjs`
  - `test_env/tests/t287-native-work-unknown-effect.test.mjs`
- design edit: §10.6 row 5 (`:648`) reads "...so `actor_process_termination_unconfirmed` holds and `terminationConfirmed` projects `false` (D9, Executive, 2026-10-23)". After the edit, `npm run build` left the capability graph and the manifest byte-equal to the patch's regenerated copies.
- gate, in order, every test with `node --experimental-vm-modules --test`:
  1. `npm run build`: pass
  2. `npm run lint:imports`: pass (28 shared modules)
  3. `npm run lint:lifecycle`: pass (284 modules, 10 allow-listed sites, no offender)
  4. `m5-terminal-quiescence-owner`: 7/7
  5. `t287-native-work-unknown-effect`: 10/10
  6. `t287-calculus-fold`: 6/6
  7. `t287-common-computational-library`: 4/4
  8. `m5-event-store-reopen`: 18/18
  9. `npm run test:installed:language`: 1/1
- tracked tree: clean after the commit except for this Return. The 14 untracked entries were not touched.
- return route: this file

## Whole-diff review

Reviewer: Claude Fable 5.1, max effort, fresh context, same vendor family as every Worker (Opus 5.5) and the Executive (Fable); no cross-vendor independence; no Writer grant (this section is the only edit). Subject: the diff `97b1200bc..cac7802b2`, read with the twenty step commits of the plan's ledger as its structure; the tenant tree at HEAD `b9ea40f00` equals `cac7802b2` (HEAD differs in two commentary files only). Path keys: `design` = `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`; `src/` = `build_tenants/abiogenesis/typescript/code/src/`; `test/` = `build_tenants/abiogenesis/typescript/test_env/tests/`; lines at `cac7802b2`. Re-executed here: `lint:imports` (28 modules, rc 0), `lint:lifecycle` (284 modules, 10 allow-listed, rc 0), and one suite, `m5-event-calculus-runtime`, at the baseline worktree `wt-base-97b1200bc` (13 pass, 5 fail, the same five tests with the same first errors as `step-8-run.log:476-520`, including `:1316` `runtime_failure_observed/runtime_invocation_active false !== true` at `:1453`). Build, lanes and the integrated run are taken from the committed log and the Returns. No tracked file changed in this repository during the review.

Summary: S0 0, S1 0, S2 1, S3 6, S4 4.
New S2 or above: yes, one (F1): the ratified D9 sentence in §10.6 row 5 states a fluent holds at a cut where the rule terminates it.

### Findings

- F1. S2 | `design:648` (§10.6 row 5, the D9 clause); `src/abg/calculus/rules.ts:151`, `:156`; `test/m5-terminal-quiescence-owner.test.mjs:168-169`, `:176` | "An `actor_process_exited` after an `actor_process_termination_unconfirmed` for the same process initiates no `actor_process_terminated` ... so `actor_process_termination_unconfirmed` holds and `terminationConfirmed` projects `false`." | The rule terminates `actor_process_termination_unconfirmed` on the exit (`rules.ts:156`, the §4.4 formula `not T and U`), and the test at `cac7802b2` asserts the fluent is `false` after the late exit (`:168-169`, `!confirmed`, "a process terminal ends termination-unconfirmed"). At `37ef7d760` the same lines asserted `true` ("later physical confirmation does not erase the historical uncertainty fact"). The 8a-2 Return said so ("Discrepancy with the activation ... The fold says it does not") and asked for the wording to be settled; `## Disposition of 8a-2` item 3 read `:166` at the pre-exit cut and sharpened the sentence the other way; 8a-3 wrote it. After the sequence the only lifecycle fluent of the process that holds is `actor_cleanup_pending`, a state §4.4's three formulas do not name, and §4.4 (`design:199`) still says the rule initiates `actor_process_terminated` from `actor_process_exited` with no guard. The code and the test agree with each other; the ratified design text disagrees with both. | One sentence: in row 5 replace "so `actor_process_termination_unconfirmed` holds and `terminationConfirmed` projects `false`" with "so no `actor_process_terminated` is initiated, `actor_process_termination_unconfirmed` ends with the terminal (`not T and U`), `actor_cleanup_pending` holds until the actor terminal, and `terminationConfirmed` projects `false`"; and in §4.4 (`design:199`) qualify "initiates `actor_process_terminated(processRef)` from `actor_process_exited`" with "preceded by the process start and by no termination-unconfirmed for it (D9)". The alternative is D9's own reversal: drop `&& !unconfirmed` at `rules.ts:151` and restore the three expectations.

- F2. S3 | `design:46` (§2 row `abg/calculus/`, Imports `shared/*`) and `design:52` (the order); `src/abg/calculus/axioms.ts:15`, `:20-29`; `rules.ts:5-7`; `fold.ts:7-10`; `src/abg/runtime_liveness.ts:12` | "a module imports only modules to its left"; the fold row imports `shared/*`. | `axioms.ts` imports `product/worksite_effect`, `product/native_workspace_work`, `abg/event_store`, `abg/event_prefix`, `abg/runtime_liveness_contracts`, `abg/c_call_outcome`, `abg/native_work_effect`; `rules.ts` imports `abg/runtime_liveness` (the liveness validator), which imports `holdsAt` from `./event_calculus.js`, which imports `./calculus/index.js`: a module cycle `calculus -> runtime_liveness -> event_calculus -> calculus`, created by the step 6 repair's R4 switch. `lint:imports` covers `shared/` only, so nothing checks this row. The `product/` and `abg/` imports were carried over from `event_calculus.ts` by the step 6 split; behavior is unchanged (function-level cycle, no top-level use; build and lanes pass). | Amend the §2 row's Imports cell to the actual set and state the function-level cycle with `runtime_liveness.ts`; or extend `scripts/check-import-direction.mjs` with an allow-listed rule for `abg/calculus/` at the close.

- F3. S3 | `design:629` (P-INGRESS: "`tsc --noEmit` plus a lint rule on the two directories"); `build_tenants/abiogenesis/typescript/scripts/` | A lint rule enforces that no `derive` or `select` export takes `unknown`. | No script checks it; `check-import-direction.mjs` checks specifiers only. The property holds today by grep: no `unknown` in any signature under `src/shared/value/` or `src/shared/select/` (the two hits are comments), and step 5's self-check 3 was the same grep. | A short check in `check-import-direction.mjs` over exported signatures under `shared/value/` and `shared/select/`, or amend P-INGRESS to "tsc plus the grep at close".

- F4. S3 | `src/shared/value/record.ts:46` (`canonicalRecordDigest`); `design:158-164` (§4.3 table), `design:733-746` (§10.7), constitution §16.14 (b) | "Each function this design adds or moves declares one disposition" (§10.7; constitution §10.2). | `canonicalRecordDigest(JsonRecord): Sha256Digest` is a new `shared/value/` export (step 4; the two record-digest copies retired into it; consumers `src/abg/execution_basis.ts` and `src/abg/invocation_execution_truth.ts`) and appears nowhere in the design or in §16.14's row list (grep: 0). | One row in §4.3 (equal to `sha256Canonical` over a record; replaces 2 copies) and `catalog_extension` of `N02` in §10.7 and §16.14 (b), with 8b.

- F5. S3 | `design:127` (§4.1 `admitContract`, "Replaces: inline `v.safeParse` in the three binders and in owners") against `design:586` (§10.1 row 2: "inline `v.safeParse` in `bindStaticOwner`") | Owner `safeParse` sites were replaced. | Eight owner sites remain and no Return lists them as the "as touched" remainder: `src/owner_bindings/run_invocation.ts:1127`, `src/validator/raw_admission.ts:132`, `src/shared/public_function_contracts.ts:685`, `src/shared/capability_contracts.ts:217`, `:401`, `:410`, `src/product/public_contract_publication.ts:517`, `src/product/verify_product.ts:815`. The three binders are clean (`static_definition_bindings.ts:48`, `:67`; none in `exact_prefix_bindings.ts`). | Record the eight as row 2's "as touched" remainder in 8b's ticket section and change the §4.1 cell to "in `bindStaticOwner`; owner sites as touched".

- F6. S3 | `design:632` (P-RECORD whole path: "the execution-basis adapter maps `invalid` to its existing refusal"); `test/t287-select-family.test.mjs:89-134`; `src/abg/invocation_execution_truth.ts:619` | Whole-path proof. | The lane proves the atom (`absent`, `many`, `one`, both null-digest partitions and the digest mismatch as `invalid`, D2 order) and touches no adapter; the adapter's `invalid -> null` mapping rests on reading (step 5 Return, reader 1) and no run-list suite is recorded as reaching its negative. | One case feeding `projectExactExecutionBasisAtPrefix` a prefix whose `basis_admitted` payload carries a forged `basisDigest` and asserting `null`; or restate the clause as "by reading" in 8b.

- F7. S3 | plan step 8 run list; `## Activation 8a` rule 3; `git diff --stat 97b1200bc..cac7802b2 -- test_env/` | "the step 8 review covers their diff once" (plan, Execution configuration) and "the whole diff is read once, at step 8". | Ten suites edited in the range (import paths, `build/` path strings, override keys) are in no recorded run after their edit: `r10-projection-contracts`, `t287-conformance-owner-reuse`, `t287-cross-cut-public-read`, `t287-malformed-gtl-gate`, `t287-pfc-f08a-product-verification-boundary`, `t287-st2a-g-capability-definition-graph`, `t287-w2-05-generator-package-reproducibility`, `t287-w2-05-install-catalog-owner-chain`, `t287-wave2-owner-contract-source-set`, and `t287-w2-05-static-binding-algebra` (run once at step 2, before steps 3 to 8). Step 2's Return says two of them were "checked mechanically; not run". | Add the ten to the close's final integrated run (one invocation; the attribution rule applies).

- F8. S4 | `test/t287-c2a-fp-source-contract.test.mjs:42-44`; `src/hog/ccall_lifecycle.ts` (8a fix, `37ef7d760`) | "C2A F_P effect handoff is one direct exact-prefix ABG invocation" restored. | The assertion is a source-text regex (`effectResult.kind === "actor_process_effect_refusal"[\s\S]*effectResult.successorPrefix`) satisfied by renaming `failActorProcessEffect`'s parameter to `effectResult` and moving the function below its caller; it no longer discriminates the handoff it names. | Assert on `failActorProcessEffect`'s text or behavior explicitly; 8b note.

- F9. S4 | `design:187` (§4.4: "Its `advance` is 'for each event, state = foldStep(...)'") and `design:114` (§3 Lifecycle) | `advance` after 8a item (i) is "copy once, `applyStep` per event, freeze" (`src/abg/event_calculus.ts:238-252`; `fold.ts:191`, `:261`); `applyStep`, `workingFoldState`, `frozenFoldState` are `@internal` exports the design does not name. `foldStep` stays the pure step and P-FOLD proves the two drivers agree. | One clause in §4.4.

- F10. S4 | `design:634` (P-LIFECYCLE, last sentence), `design:635` (P-LAYER) | The checks are realized as `npm run lint:lifecycle` (`scripts/check-lifecycle-boundary.mjs`: fluent-name positions and `scopeAbsence`/`directExit` reads, 10 allow-listed sites in three classes) and `npm run lint:imports`; the design names only `lint:imports` (§2). | Name `lint:lifecycle` in P-LIFECYCLE's last sentence with the allow-list's three classes.

- F11. S4 | `test/m5-terminal-quiescence-owner.test.mjs:148`, `:174` | The title ("until a genuine confirmed Process terminal") and the comment at `:174` ("The owner admits this event only after owned-scope absence, not at raw child exit") state the premise D9 rejected, beside the D9 message at `:163`. The Executive recorded titles and messages as a residual (`## Disposition of 8a-2` item 5); `:174` is the premise itself, not a message. | With that residual.

### Evaluations

2. Retirement §10.1 against the tree. Row 1: the three moves landed as renames (`R090` `definition_binding_mechanics`, `R092` `owner_contract_source_set`, `R094` `public_function_family`, `R099` `public_function_projections`, `R069` `static_definition_bindings -> abg/exact_prefix_bindings`, `A public/binding/static_definition_bindings.ts`; `D product/exact_match.ts`); upward imports 0 (`lint:imports`). Row 2: NUL-joined bodies 0; binders on `admitContract`; owner `safeParse` sites 8 (F5); untouched copies as step 3 recorded: seven local `isJsonRecord` (`c_call_outcome.ts:139`, `traversal_route.ts:944`, `c_call.ts:1558`, `execution_basis.ts:949`, `traversal_cursor.ts:110`, `hog/recursion_lifecycle.ts:139`, `hog/workflow_lifecycle.ts:135`), `release_snapshot_definition_bindings.ts:91` `isRecordEvidence`, the recovery module's local `record` (`worksite_construction_recovery.ts:49`); recorded for 8b. Row 3: `sameCanonical*` bodies 0; the binding `sameJson` lift, the installed-codec pair and the three record writers (`abg/retry.ts:6665`, `abg/c_call.ts:7338`, `abg/replay.ts:2313`) remain and are recorded (step 4 Return and Disposition; 8b row 3 correction); step 4's casts (867 of 1204 calls) recorded per file. Row 4: local `one` helpers 0 (13 retired); checked-record readers 10 of 18, the eight recorded with the corrected reason (8b item vi); `length === 1` in `abg/` 59 lines, all count or arity clauses per step 5's census. Row 5: `advance` holds no contextual branch; the four lifecycle fluents are produced in `rules.ts` only (`lint:lifecycle` 0 offenders); the seven copy-consistency validators left (`actor_process.ts:495-536`, `transport_contracts.ts:72`, `:77`, `validator/qualification.ts:53`) are recorded (step 7 Return residual 4; review 3f). Row 6: `scopeAbsence === "absent"` outside `shared/process/` 0; `replay.ts:2457` reads `holdsAt`; the refusals carry `processFacts` (`actor_process.ts:1374`, `:1417`). Unrecorded remainder: the eight owner `safeParse` sites only (F5).

3. Decisions D6 to D9: see the closing section. D1 (`rules.ts:207-233`), D2 (`exact_record.ts:50-59`, digest after projection), D3 (per site in the step 3 and 4 Returns and 8a item ii), D4 (`i_json.ts:39-47`, `:64-69`, the lift; bridge kept at 22 sites) and D5 (`rules.ts:197-205`) are realized as decided; the eight step 7 closure items are at the design lines the Return names.

3a. C2 production proof: holds by reading. `exactC2SourceEnvironment` (`src/abg/execution_basis.ts:727`) keeps `.materialize()` (`:797`), admits both sides (`:805-806`) and compares with `canonicalEquals` (`:808`). It is reached unconditionally from `admitExecutionBasis` (`:1921`, inside the worksite-carrier branch at `:1905`) and from `hasExactWorksiteCommandLeafSourceAtDurablePrefix` (`:993`, root basis); the callers are `src/owner_bindings/run_invocation.ts:1489` and `src/implementation/leaf_invocation_port.ts:1607`. In `t287-worksite-command-execution:407` the C2 phase closes its Run and passes "fresh replay" (`:794-805`) before the baseline-red `:826` in "owner-local negatives"; a C2 invocation whose `sourceResultBasis` is the C1 result (`:760-762`) can close only if the comparison returned `true`, which requires both sides `ok` and equal. No re-instrumentation was needed; the 8a counter (two hits, equal, 186 events) is consistent with this reading.

3b. O-RESOURCE at the seven probes: the producer argument holds for the six deletions. Each owner is module-private and composed only through `withAdmissionAuthority` (`catalog_definition_bindings.ts:957-959`, `environment_definition_bindings.ts:815-816`, `install_definition_bindings.ts:420`); the wrapper computes `digest(resources)` = `sha256Canonical` (`admission_authority.ts:143-145`, `:309`) over the same shallow-rest object it hands the owner (`:331`), inside `Effect.tryPromise`, so every `writeCanonicalJson` throw (non-finite number, `undefined` member, cycle, throwing accessor) becomes `resource_relation_mismatch` (`:336`) before the probe's false branch could run. Deleting the probes preserves every outcome. At `project_read_definition_bindings.ts:128` the widened refusal set and the fault channel for a cycle (`owner_execution_failure` in place of `invalid_resource_assertion`) are stated in `## Return 8a-2` and ratified in `## Disposition of 8a-2` item 1 with a one-line reversal. No unshown premise.

4. Completion condition against §10.3: O-RESOURCE closed (six by the "existing checked resource" premise, one by admission; the ratified deviation from "preserving ... error outcomes" is the cycle's fault code, recorded with its reversal); O-SHAPE closed (the `retry.ts` site is closed under D3 as ingress admission, which O-SHAPE's "no recursive validator runs at each read" does not cover; wording only); O-CODEC closed (`decodeEventBody` returns `event: unknown`, `event_body_encoding.ts:157-160`); O-SCHEMA closed by the ingress decision §10.3 permits, with the schema-level alternative offered to Jim; O-KEY closed (0 NUL joins; `default_library.ts:133`; P-KEYS lane). O-TYPE is per site and not among the five; its open list is explicit in `## Return 8a`. No obligation the Returns call closed is open.

5. Integrated run: every red file in `step-8-run.log` has an attribution: 16 baseline-red (checked here by reading at both commits: `m5-consensus-module`, `ROOT_PUBLIC_OPERATION_IDS` absent at `97b1200bc`; `t287-event-calculus-owner-continuation`, env-fixture precondition at `:18`; `m5-event-calculus-runtime`, `abg.openCall` absent from the `abg` barrel at both commits; and by rerun at the baseline worktree: all five `m5-event-calculus-runtime` failures reproduce with the same assertions), one step 7 seam fixed (`t287-c2a-fp-source-contract`, F8), one new failure stopped and disposed (`m5-terminal-quiescence-owner`, D9, F1), the uat harness failure baseline. The ledger's baseline paragraph covers `test:unit` only; the e2e attributions rest on the Worker's 742 s run in the baseline worktree, which the rerun above corroborates for the one suite whose failures a design change could have caused. `cac7802b2` after that run: the six deletions can change no outcome (3b); `:128` can change any suite that calls a project-read owner with non-I-JSON `resources` (none known in the run list); the two tests it changed ran at the 8a-3 gate (7/7, 10/10); the final integrated run at the close covers the rest, and should include F7's ten suites.

6. Behavior changes outside `realization_refactor` and the decided items, each recorded: typed-carrier encoding failures now throw `TypeError` where retired try/catch bodies returned `false`, and both operands are evaluated before encoding (step 4 Return; Disposition: the derive family's defect channel); `sameQualificationValue` removed from the `validator` barrel and the package `"."`/`"./validator"` entries (step 4; flagged for Jim); NUL-join sequence comparisons distinguish `["a\0b"]`/`["a","b"]` and `[]`/`[""]` (P-KEYS correction; step 4 Disposition); `requiredSlot`'s discriminator domain narrows to nonblank strings and `detachJsonRecord` admits through `admitJson` instead of `structuredClone` (steps 3, 4); the digest leg runs before later pure checks in readers 4, 5, 8, 10 (step 5); root closure after a Run terminal waits for an exited actor's terminal (step 6 review (e), ledger row 6); the `runtime_liveness.ts` public-path cut (R3; unobservable); the helper reports a group probed absent without an observed exit as unconfirmed, so `runCommand` throws where it continued (§10.6 row 6); the traversal failure's `message` and `diagnosticRef` become the `data:` URI with `diagnosticClassRef: null` on the actor-refusal branch (row 6); `c_call.ts:2036` reads the fluent (step 7 residual 5); the two bare `firstError` throws and the HTTP cleanup throw now carry diagnostic JSON with `processFacts`, with `attemptRef` threaded (step 7 repair); the transport artifact and `ActorProcessEffectRefusal` gain `processFacts` (row 6 items 2, 4; D8 for prior artifacts); nine `gtl/consensus.ts` validators return `false` on a non-I-JSON comparand (8a item ii); `project_read:128`'s widened refusal set and cycle fault code (8a-2); the published `contracts/schemas/native-runtime-observation.json` lost the rule-owned lifecycle fluents (step 6 review R5, P3, 8b). No unrecorded behavior change found; `resolveExactMatch`'s old body (`97b1200bc` `product/exact_match.ts`) already filtered then classified, so move 2 changed no semantics.

7. Proportionality: nothing material beyond the activations. `canonicalRecordDigest` lacks a design row (F4); `forkRuntimeEventCalculusAtForModuleTest`, `emptyFoldState` and the `@internal` fold exports serve the P-FOLD lane (step 6 review); `exactMatchCardinality`'s `RangeError` and `JSON_ADMISSION_CODES` are the atoms' defect channel and the D4 lift's closed set; `OWNED_PROCESS_FACT_MEMBERS` is F10's repair; the C2A rename is F8; the lifecycle lint's event-kind heuristics are proportional to the check it makes.

### Proofs

- P-EQUAL: holds. One body (`shared/value/equality.ts:16`), typed `JsonValue`, no identity shortcut; lane `t287-value-equality` covers `-0`, out-of-order nested keys, empty containers and a generated corpus against `canonicalJson`; the C2 positive path with materialization kept reaches production (3a); 0 `sameCanonical*` bodies; the binding `sameJson` lift kept as recorded.
- P-ADMIT (P-INGRESS and the admit family): holds for the atoms (closed seven codes, `admit/json.ts:12-20`; `admitIJsonValue` is the lift; no `derive` or `select` export takes `unknown`); the lint rule the design names does not exist (F3).
- P-KEYS: holds (`admit/record.ts:20-25`; lane `t287-common-computational-library:65-66` NUL counterexample; 0 NUL joins in the tree).
- P-SELECT: holds (lane: array and view sources, predicate order, no deduplication, throwing predicate). P-RECORD: the atom holds (both null-digest partitions `invalid`, D2 order); the whole-path adapter clause holds by reading only (F6).
- P-FOLD: holds. Lane `t287-calculus-fold` 6/6 at `cac7802b2` compares the cold `foldStep` fold, the class's `project` and `forkAt` at 22 cuts on the validated and owned U1 prefixes on `holds`, `clippedFluentRefs`, `declippedPatternRefs`; after the working-state change `applyStep` computes `effectOf` before any in-place mutation (`fold.ts:192`, `:214-235`), so a nested derivation during `advance` reads the pre-event holds.
- P-BIND: holds. `bindStaticOwner` consumes `admitContract` at `:48` and `:67` and maps to `invalid_resource_assertion` and `invalid_resource_receipt`; the prefix binders are byte-identical moves; exactly one `Effect.run*` site (`shared/effect_definition.ts:102`).
- P-LAYER: holds for `shared/` (`lint:imports`, 28 modules, no upward import; the three moves landed). The §2 order does not hold for `abg/calculus/` (F2).
- P-LIFECYCLE: holds on the worker route (scenario cases a and b through the real `failActorProcessEffect`, `failCCall`, `failTraversal` and `admitRuntimeFailure`; `holdsAt` answers; no file read beyond the digest-bound artifact) and for the D5 check (case d); the command route's second negative is case e and the HTTP route's is `t287-owned-process-lifetime:500-501`, `:547` (18/18 in the integrated run), both at the helper's throw; the parent's admission of the helper's thrown failure into `L` is by reading (step 7 residual 4, F6 recorded); `lint:lifecycle` 0 offenders.

### Decisions D6 to D9

- D6: confirmed. Recorded in the plan's decisions table and design §10.6 row 1; the five modules are in `public/binding/` (renames above), `effect_definition.ts` stays in `shared/`, the prefix binders in `abg/exact_prefix_bindings.ts`; §16.14's migration consequence names the moves. Reversal is one directory move plus import lines.
- D7: confirmed. Recorded in the plan, design §4.4 (`:189`) and §10.6 row 5. Code: the three comparisons are fresh against fresh (`traversal_route.ts:4438` in `admitRoute`; `:5371` against `predecessorReplay` computed in the same call, the candidate guarded as a `traversal_route_candidate`; `c_call.ts:7052`); every writer of `replayStateDigest` takes `replayState.replayDigest` from the proposing transaction (`hog/route_proposal.ts:131`, `:1378`, `hog/judgment.ts:90`); stored reads are projections or key lists (`replay.ts:658`, `:804`; `invocation_admission.ts:586`). The design still cites `c_call.ts:7047` (8b F9).
- D8: confirmed. `worksite_construction_recovery.ts:65` is the one absence line; §9.3 item 7 carries the sentence; reversal as recorded. Not independently demonstrated (the D1 test needs its preimage), as the decision states.
- D9: confirmed as recorded and realized (`rules.ts:151`; the three expectations rewritten; reversal one line plus three expectations), with F1 on the row 5 sentence. The physical argument does not hold as written: an `actor_process_exited` event's scope evidence is its kind, not its payload. §4.6 has the owner report that kind only for `hasConfirmedOwnedProcessBoundary` after an admitted start (`actor_process.ts:1331-1335`), §9.2 says "that kind already records the confirmed boundary", and the test's prior premise ("the owner admits `actor_process_exited` only after owned-scope absence") is the design's own sentence. What D9 decides is how the fold reads a two-terminal sequence that §4.6 forbids and no emitter in `code/src` produces (`actor_process.ts:1317-1340`, exclusive through `finalProcessFacts` and `processTerminalEvent`); the sequence exists in two synthetic fixtures only, and "prior-law stores" with it have not been shown. Under that reading the guard is a conservative policy for a defective store, not a physical fact, and the state it yields is one §4.4 does not name (F1). The test's premise is the better law: it is the design's, it makes the effect depend on the kind alone, and it settles §10.6 row 5's emission-premise clause (the effect then belongs in the axiom table under D1), which D9 leaves open. If D9 stands, §4.4 must carry the guard and row 5 must say what the fold does (F1); either is one bounded change.

## Disposition of the whole-diff review (Executive, 2026-10-23)

Severity is the Reviewer's; priority is the Executive's. One repair round
(code and tests, then the close's final integrated run), then 8b (records).

| Finding | Severity | Priority | Disposition |
|---|---|---|---|
| F1 and the D9 assessment | S2 | P1 | D9 reversed. The Reviewer is right: an `actor_process_exited` event's scope evidence is its kind, which §4.6 has the owner report only for a confirmed boundary after an admitted start, and §9.2 says so; the two-terminal sequence is produced by no emitter. The guard at `rules.ts:151` was a policy for a defective store, and it yielded a state §4.4 does not name. Repair: drop the guard (D9's one-line reversal), so the rule matches §4.4 as written; restore the test's late-exit expectation; replace the row 5 sentence. This round. |
| F7 | S3 | P1 | The ten suites join the close's final integrated run, one invocation, attribution rule. This round. |
| F11 | S4 | P2 | Falls with the D9 reversal: the title and the `:174` comment state the law; the D9 message at `:163` goes. This round. |
| F2 | S3 | P2 | §2 row for `abg/calculus/` amended to the actual import set, with the function-level cycle through `runtime_liveness.ts` stated as a residue of the step 6 repair's R4 switch; `lint:imports` is not extended (breaking the cycle is a design reframe for a later wave). 8b. |
| F3 | S3 | P3 | P-INGRESS amended to "`tsc --noEmit` plus the signature grep at close"; no new script. 8b. |
| F4 | S3 | P2 | `canonicalRecordDigest` gets its §4.3 row and the `catalog_extension` of N02 in §10.7 and §16.14 (b). 8b. |
| F5 | S3 | P3 | The eight owner `safeParse` sites recorded as row 2's "as touched" remainder; §4.1 cell amended. 8b. |
| F6 | S3 | P4 | Recorded: P-RECORD's adapter clause holds by reading. 8b. |
| F8 | S4 | P4 | Recorded: the C2A source regex is satisfied by order and name. 8b. |
| F9, F10 | S4 | P4 | §4.4 `advance` wording; the design names `lint:lifecycle` beside `lint:imports` in P-LAYER. 8b. |

Proofs: P-EQUAL, P-KEYS, P-SELECT, P-FOLD, P-BIND, P-LIFECYCLE hold;
P-ADMIT holds for the atoms (F3 wording); P-RECORD atom holds, whole path
by reading (F6); P-LAYER holds for `shared/`, stated truthfully for
`abg/calculus/` after F2. C2 production proof holds by reading. O-RESOURCE
closed. D6, D7, D8 confirmed; D9 reversed.

## Repair activation (step 8)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Head is the
Executive's bookkeeping commit after `cac7802b2`. Read this section, the
`## Disposition of the whole-diff review` above, and in `## Whole-diff review`
the findings F1, F7, F11 and the "Decisions D6 to D9" paragraph on D9. Tenant
root `build_tenants/abiogenesis/typescript`; every test runs with
`node --experimental-vm-modules --test`. Change class: `realization_refactor`
plus the one design sentence named here.

1. **D9 reversal.** `code/src/abg/calculus/rules.ts:151`: drop the
   `!unconfirmed` conjunct so `actor_process_terminated(processRef)` is
   initiated by `actor_process_exited` given the held `actor_process_live`
   (the admitted start), as design §4.4 (`design:199`) states. Delete the
   now-unused `unconfirmed` binding if nothing else reads it. The formulas
   `terminationUnconfirmed = not T and U` and the cleanup formula are
   untouched.
2. **Quiescence test.** `test_env/tests/m5-terminal-quiescence-owner.test.mjs`:
   after the late exit, `terminationConfirmed` is `true` and
   `actor_process_terminated` holds (restore `:162`'s prior expectation and
   invert the assertion 8a-2 added); `actor_process_termination_unconfirmed`
   follows `not T and U` (the `!confirmed` form 8a-2 wrote stays);
   `actor_cleanup_pending` holds until the actor terminal; the `:222`
   `holdsAt` form stays. Remove the D9 message at `:163`. The title and the
   `:174` comment state the law and stay. Expected 7/7.
3. **Lane check.** Run `t287-calculus-fold`. If a case asserted the guard
   (an exit after an unconfirmed termination yielding no
   `actor_process_terminated`), flip that expectation to the unguarded rule
   and say so in Return; any other failure stops this item.
4. **Row 5 sentence.** In `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:648`
   (§10.6 row 5) replace the D9 sentence (from "An `actor_process_exited`
   after" to "(D9, Executive, 2026-10-23)." inclusive) with: "The emission
   premise holds at every emitter (`actor_process.ts:1317-1340`, exclusive
   through `processTerminalEvent`): an `actor_process_exited` initiates
   `actor_process_terminated` given the admitted start, with no guard on a
   prior `actor_process_termination_unconfirmed`; that sequence is produced
   by no emitter and reads, in a synthetic store, as a late confirmation
   under `not T and U` (D9 reversed by the whole-diff review, 2026-10-23).
   The start context keeps the effect in the rule table."
5. **Final integrated run.** After `npm run build`, `npm run lint:imports`
   and `npm run lint:lifecycle`: one invocation
   `node --experimental-vm-modules --test --test-concurrency=1` over the 34
   files of the 8a run (`step-8-run.log` lists them) plus, each once:
   `r10-projection-contracts`, `t287-conformance-owner-reuse`,
   `t287-cross-cut-public-read`, `t287-malformed-gtl-gate`,
   `t287-pfc-f08a-product-verification-boundary`,
   `t287-st2a-g-capability-definition-graph`,
   `t287-w2-05-generator-package-reproducibility`,
   `t287-w2-05-install-catalog-owner-chain`,
   `t287-wave2-owner-contract-source-set`,
   `t287-w2-05-static-binding-algebra`; then `npm run test:uat:harness`.
   Log to `step-8-run-final.log` beside this file (committed). Attribution
   rule as in `## Activation 8a` rule 3 and the addendum (the built
   baseline worktree is named there): a baseline-red file with the same
   failure set is recorded; a failure absent at the baseline returns to its
   seam and is fixed only if bounded and inside a step 2 to 8 grant, one
   attempt, else stop that item and record it. Expected: the 16 baseline-red
   files of the 8a run unchanged; `m5-terminal-quiescence-owner` 7/7;
   `t287-c2a-fp-source-contract` 4/0; the ten added suites attributed.

**Grant.** `code/src/abg/calculus/rules.ts` (the one conjunct);
`test_env/tests/m5-terminal-quiescence-owner.test.mjs`;
`test_env/tests/t287-calculus-fold.test.mjs` (item 3 only); the one design
sentence; bounded fixes item 5 allows (list each); the build outputs the
gate regenerates; `step-8-run-final.log`; this file's `## Repair return (step 8)`.

**Stop:** item 3's "any other failure"; an unattributed failure in item 5
that is not bounded; anything outside the grant.

**Return contract.** One commit on `main`, no push. First line
`Step 8 repair: D9 reversed; final integrated run`, last line
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append
`## Repair return (step 8)` with: commit; items 1 to 4 (lines at head);
the final run (wall time; per-file pass/fail; every failure with its
attribution; uat rc); residuals.

## Activation 8b (records; after the step 8 repair)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Head is the
Executive's bookkeeping commit after the step 8 repair. No code, no test,
no build. Read: this file's `## Items accrued for step 8` (every "8b"
item), `## Disposition of 8a`, `## Disposition of 8a-2`, `## Whole-diff review`
(F2 to F10), `## Disposition of the whole-diff review`; the plan post's
`## Decisions Jim owns` and `## Ledger`; the step 1 Return's list of the
ticket section and the GOAL-035 row. Writing: the installed
`WRITING_GUIDE` as step 1 applied it (present tense, role not name, no
narration).

1. **Ticket section.** `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`,
   the section step 1 appended: add a closing subsection "Library delivery
   close (2026-10-23)" with, in this order: the commit chain (steps 2 to 8
   from the plan's ledger); the decisions D0 to D9 in one table (decided
   by whom, reversal path), with D9 marked reversed; the completion
   condition (O-RESOURCE, O-SHAPE, O-CODEC, O-SCHEMA by ingress premise,
   O-KEY closed with sites; O-TYPE per site from the 8a Return); the proofs
   P-EQUAL to P-LIFECYCLE with one line each (from the whole-diff review's
   "proofs" lines); the baseline attribution (16 files baseline-red at
   `97b1200bc`, the one step 7 seam fixed, the uat harness failure); the
   C2 production proof route and the step 4 zero-hit correction; the
   "as touched" remainders (step 3's untouched copies; step 4's casts and
   the three record writers; step 5's eight readers with the corrected
   reason: a static `RecordCheck`, not "needs a runtime value"; F5's eight
   owner `safeParse` sites); the items for Jim (D6 to D9 reversals; the
   `sameQualificationValue` barrel removal; the 40 tracked build files;
   the baseline `:826` defect in `t287-worksite-command-execution`;
   O-SCHEMA refusal at the schema if wanted; the F2 cycle). Dates absolute.
2. **GOALS.** `specification/GOALS.md`: the `GOAL-035` row's library
   sentences (line 18) and the paragraph at lines 32 to 40 that still lists
   the six owner obligations as OPEN: state the current reality in present
   tense (library delivered on `main` at the step 8 repair commit; five
   obligations closed, O-TYPE per site recorded; the design's proofs hold;
   not a release). No other row.
3. **Design notes**, each the smallest edit, in
   `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` unless named:
   §10.1 row 3 count (three record writers and the installed-codec pair
   stay); §4.3 wording on inline digest comparisons; §10.6 row 5's
   emission-premise result from step 6 (if not already stated by the
   repair's sentence); §4.4's D7 clause ("proposed" to "proposed or
   admitted" for `sourceReplayDigest`); the step 6 review items R2 (the R
   branch and `not A`), R5 (the published contract embeds the axiom table
   without the rules: state the two tables), R6 (§4.4 anchors to
   `calculus/axioms.ts` and `rules.ts`), R7 ("effects that depend only on
   the event kind" reads pre-existing context through `AxiomFoldContext`);
   step 7's F9 stale citations (`:549`, `:553-558`, `:566`, `:589`,
   `:270-285`, `:189`, `:199`; `c_call.ts:7047` is `:7052`) and (ix)
   P-LIFECYCLE's no-child clause; the whole-diff items F2 (§2 row and the
   cycle), F3 (P-INGRESS wording), F4 (`canonicalRecordDigest` row, §10.7
   and constitution §16.14 (b)), F5 (§4.1 cell), F6 (P-RECORD note), F9
   (`advance` wording), F10 (`lint:lifecycle` named in P-LAYER); the C2
   proof note in P-EQUAL (route through `t287-worksite-command-execution:407`).
   Verify every line number you cite at head.
4. **Step 5 wording** in the ticket (item 1) only; the step file is history.

**Grant.** The ticket file (that section), `specification/GOALS.md` (the
row and the paragraph), the design file, the constitution's §16.14 (b) row
list, this file's `## Return 8b`. Nothing else.

**Gate:** none beyond reading back each edit; `git diff --stat` touches
only the grant.

**Return contract.** One commit on `main`, no push. First line
`Step 8b: ticket close, GOAL-035, design notes`, last line
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append
`## Return 8b` with: commit; each item with the lines edited; residuals.

**Addendum (Executive, after the repair, 2026-10-23).** Item 5 overrides
"no code, no build" for one clause: `code/src/abg/calculus/rules.ts:127-129`,
drop "and by no termination unconfirmed for it" so the comment states the
unguarded rule; then `npm run build` (commit the outputs it regenerates) and
`npm run lint:lifecycle`, both rc 0. Item 1's residual list also carries:
the three F7 suites that fail at load at head and at the baseline
(`r10-projection-contracts:24` fixture coordinate,
`t287-conformance-owner-reuse:20` environment precondition,
`t287-wave2-owner-contract-source-set:47` missing export
`ReleaseSnapshotPort`), whose step 2 path edits are therefore unexercised
past load; and that a baseline attribution of `t287-cross-cut-public-read`
needs its two gitignored fixture files linked into the baseline worktree.
The commit chain in item 1 ends at the repair `562d4515a`; item 2 names that
commit. Grant adds the one comment clause and the regenerated build outputs.

## Repair return (step 8)

- commit: the commit carrying this Return (first line `Step 8 repair: D9 reversed; final integrated run`, parent `068062323`); its hash is in the final report. Not pushed. Staged by path.
- Item 1 (D9 reversal), `code/src/abg/calculus/rules.ts`:
  - `:151` now reads `...(event.kind === "actor_process_exited" && started`. The `&& !unconfirmed` conjunct is gone.
  - The `unconfirmed` binding (`:149`) stays because `:156` still reads it to terminate `actor_process_termination_unconfirmed` on the terminal (`not T and U`). The cleanup formula is untouched.
  - The doc comment at `:127-129` still states the guard ("preceded by the process start and by no termination unconfirmed for it"). It is outside "the one conjunct", so it is left for 8b (see residuals).
- Item 2, `test_env/tests/m5-terminal-quiescence-owner.test.mjs`: 7/7.
  - `:162`: `terminationConfirmed` is `confirmed` again, the expectation before 8a-2. The D9 message is removed.
  - `:163`: `holdsAt(actor_process_terminated)` is `confirmed`. It is `false` before the late exit and `true` after it, including after the actor terminal.
  - Unchanged:
    - `:167-168`: `actor_process_termination_unconfirmed` is `!confirmed`, with the `not T and U` message.
    - `actor_cleanup_pending`: `!actorDone`.
    - The title (`:148`) and the comment at `:171`.
    - The `holdsAt` form of the last test (`:224-226`).
- Item 3, `t287-calculus-fold`:
  - Before the edit it was 4/2. Both failures asserted the guard; there was no other failure.
  - Flipped to the unguarded rule:
    - P-FOLD, the U1 store (`createU1Fixture`: start, termination-unconfirmed, exit, actor failure):
      - `:76-77`: at the exit cut `actor_process_terminated` holds (`[true, false, false, true, true]`). The message is now "...and initiates termination".
      - `:79`: at the end cut `[true, true, false]`. The actor terminal ends `actor_cleanup_pending` only.
      - The comment at `:68-69` now reads "the exit initiates terminated given the start, unguarded".
      - The cold, warm and forked fold agreement above these lines was not touched, and it passes.
    - P-LIFECYCLE case `:127-135`:
      - On the exit step, `actor_process_terminated` is added to both `initiates` and `holds` (`:132-134`).
      - The case name changed from "negative: termination unconfirmed, then an exit" to "late confirmation: termination unconfirmed, then an exit".
      - The actor projection row is unchanged.
  - After the edit: 6/6.
- Item 4: design §10.6 row 5 (`design:648`).
  - The D9 sentence, from "An `actor_process_exited` after" through "(D9, Executive, 2026-10-23).", is replaced with the activation's text, verbatim.
  - The row is still on one line with five `|` separators, as before.
  - §4.4 (`design:199`) is unchanged, and the rule now matches it.
  - The build regenerated `contracts/capabilities/capability-definition-graph.json` and `product-toolchain-manifest.json`, and both are committed.
- Final run: `step-8-run-final.log`, run on the tree of this commit.
  - Gate steps:
    - build: rc 0, 33 s.
    - `lint:imports`: rc 0 (28 modules).
    - `lint:lifecycle`: rc 0 (284 modules, 10 allow-listed sites, no offender).
    - Then one `node --experimental-vm-modules --test --test-concurrency=1` invocation over 44 files: the 34 of the 8a run plus the ten F7 suites.
    - Run result: rc 1, wall 1096 s. Node summary: tests 313, pass 245, fail 52, cancelled 2, skipped 14.
    - Whole log: 04:07:21Z to 04:26:12Z.
  - Per file, top-level pass/fail[/skip], for the 34 files of the 8a run:
    - `forward-command-contracts` 8/0, `forward-command-owners` 2/4, `installed-language-smoke` 1/0
    - `m5-c-algebra-validation` 18/0/3, `m5-consensus-module` 0/1 (load), `m5-event-calculus-runtime` 13/5/1, `m5-event-store-reopen` 18/0
    - `m5-fresh-process-reconstruction` 0/1, `m5-installed-graph-edge` 0/1, `m5-installed-portability` 5/3, `m5-retry-lifecycle-authority` 4/5
    - `m5-s03-authority` 1/4, `m5-s06-prime` 10/1, `m5-terminal-quiescence-owner` 7/0, `m5-worker-transport` 21/0
    - `t287-c2-owner-coordinate-reuse` 0/6, `t287-c2a-fp-source-contract` 4/0, `t287-calculus-fold` 6/0
    - `t287-calculus-state-transfer` 0/1 (timeout), `t287-common-computational-library` 4/0
    - `t287-event-calculus-owner-continuation` 0/1 (load), `t287-generic-job-lifecycle` 0/0/1, `t287-lifecycle-failure-carrier` 5/0
    - `t287-native-runtime-gate` 6/0/1, `t287-native-semantic-revision` 4/4/1, `t287-native-structural-gates` 9/0
    - `t287-observed-worksite-command` 7/1, `t287-ordered-reconstruction` 0/4/3, `t287-owned-process-lifetime` 18/0
    - `t287-reconstruction-conservation` 0/0/2, `t287-runtime-activity-quiescence` 1/0, `t287-select-family` 7/0
    - `t287-value-equality` 4/0, `t287-worksite-command-execution` 3/1
  - Comparison with the committed 8a run:
    - Method: top-level TAP result by file and test name, status, first error and first test-file frame.
    - The only status changes are the two `m5-terminal-quiescence-owner` tests, fail -> pass. The renamed fold case passes under both names.
    - The 16 baseline-red files of the 8a run fail the same tests with the same first errors. Their attribution in `## Return 8a` stands.
    - `t287-c2a-fp-source-contract` is 4/0.
  - The ten F7 suites:
    - `t287-w2-05-static-binding-algebra` is green, 3/0/2.
    - The other nine are red. All nine were run once, in one invocation, in the built baseline worktree, `97b1200bc`, each with its own copy of the test file; one rerun of `t287-cross-cut-public-read` followed (see below).
    - All nine are baseline-red with the same failure set: the same tests, the same first error and the same test-file frame. No seam is opened and nothing was fixed:
      - `r10-projection-contracts` 0/1: fails at load at `:24`, `DurablePrefixReadError` `file_identity_mismatch` (fixture coordinate).
      - `t287-conformance-owner-reuse` 0/1: fails at load at `:20`, `assert.ok(predecessor && territory && process.env.ABI5_CONFORMANCE_METADATA)`. This is an environment precondition.
      - `t287-cross-cut-public-read` 4/1: `:110`, "run_status must retain the acquired prefix through late proof admission", `1899 !== 1`.
        - Its fixture files `events-01/runtime.events.jsonl` and `attempt-01/program-ready-16.json` (under `.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/`) are gitignored, so the baseline worktree lacks them. In the shared baseline run all five tests failed with `ENOENT` at `:38`.
        - The two files were symlinked into the baseline worktree from this checkout, and the suite was rerun there once: 4/1, the same `:110` assertion with `1899 !== 1`.
        - The links were then removed.
      - `t287-malformed-gtl-gate` 5/1: `:107`, `'raw_admission_refused' !== 'validation_failed'`.
      - `t287-pfc-f08a-product-verification-boundary` 0/1: `:398`, `product_verification_refusal` `manifest_malformed`.
      - `t287-st2a-g-capability-definition-graph` 2/2:
        - `:260`: "missing capability projection for abg.asset.gtl.language-conformance-corpus".
        - `:370`: `parseProductPublicContract` returns an object where `null` is expected. The printed declaration inventory is longer at head (314 `./product` rows against 308), which follows the library's added declarations. The assertion and its outcome are the same.
      - `t287-w2-05-generator-package-reproducibility` 1/1: `:99`, "generated declarations must form exact export closures".
      - `t287-w2-05-install-catalog-owner-chain` 0/1: `:328`, `44 !== 39`.
      - `t287-wave2-owner-contract-source-set` 0/1: fails at load at `:47`. `product/release_snapshot_operations.js` does not export `ReleaseSnapshotPort`.
  - uat harness: rc 1. 34 tests: 30 pass, 1 fail, 3 skip. The failure is `harness.test.mjs:471`/`:490`, "canonical C2 budget fits", `18025250 !== 18015000`. It matches the 8a run and `97b1200bc`, so it is baseline.
  - Bounded fixes in item 5: none.
- Residuals:
  - `rules.ts:127-129`: the doc comment still describes the guard. A one-clause edit for 8b or a later grant: drop "and by no termination unconfirmed for it".
  - The quiescence test's title (`:148`) and the comment at `:171` stay as the activation directs. Under the reversal they state the law.
  - Not run, read only:
    - `t287-native-workspace-work` and `t287-f04a-probabilistic-result-candidate` match the termination-unconfirmed and terminated names. Neither asserts `actor_process_terminated` after a termination-unconfirmed. Their `terminationConfirmed` members are carrier fixtures.
    - `t287-native-work-unknown-effect` (8a-2 item 3) asserts only `not T and U` at `:69`.
  - Several F7 suites are red at the baseline on fixture or environment preconditions: `r10-projection-contracts` (`:24`), `t287-conformance-owner-reuse` (`:20`) and `t287-wave2-owner-contract-source-set` (`:47`, a missing export). Their bodies did not run at head or at the baseline, so their step 2 edits (import paths, `build/` path strings) remain unexercised past load.
  - The baseline worktree does not carry the gitignored R10 fixture. Any later baseline attribution of `t287-cross-cut-public-read` needs the same two links.
- return route: this file

## Disposition of the repair (step 8) (Executive, 2026-10-23)

Accepted at `562d4515a`. Items 1 to 4 land as activated: `rules.ts:151`
now states §4.4 (`design:199`) and the row 5 sentence is in place; §4.4
itself is unchanged. Item 3's two flips are the guard's own expectations in
the U1 store and the P-LIFECYCLE case, inside the grant. The final run: the
34 files of the 8a run match it except the quiescence suite, now 7/7; the
nine red F7 suites are baseline-red with the same failure set (the
cross-cut suite attributed with the two fixture links). Three of the nine
fail at load, so their step 2 path edits are unexercised past load:
recorded, not a seam; a suite that cannot load at the baseline is not a
gate of this plan. Residuals: the `rules.ts:127-129` comment to 8b (addendum
above); the fixture-link note and the three load failures to the ticket
close. Ledger row 8 closed.

## Return 8b

- commit: the commit carrying this Return (first line `Step 8b: ticket close, GOAL-035, design notes`, parent `6a161fcbc`); its hash is in the final report. Not pushed. Staged by path. Path key: `design` = `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`; lines are at this commit.
- Item 1, ticket: `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md:5302-5388`, a new subsection `### Library delivery close (2026-10-23)` (`:5303`) at the end of `## STDO 3 Library Re-entry (2026-10-22)`. In order:
  - commit chain (`:5312`), steps 2 to 8, ending at `562d4515a`;
  - decisions D0 to D9 (`:5324`), with decided by and reversal path; D9 marked reversed; "none recorded" where the records give no reversal (D0 to D3);
  - completion condition (`:5339`): O-RESOURCE, O-SHAPE, O-CODEC, O-SCHEMA by ingress premise, O-KEY with sites; O-TYPE closed and open per site;
  - proofs (`:5348`), P-EQUAL to P-LIFECYCLE, one line each;
  - baseline attribution (`:5360`): 16 files, the step 7 seam, the nine F7 suites, the uat harness failure, and a pointer to the review's evaluation 6 for behavior changes (it names the published `native-runtime-observation.json` change);
  - C2 production proof and the step 4 zero-hit correction (`:5362`);
  - remainders migrated as touched (`:5364`);
  - records for later work (`:5371`): the addendum's three load failures and the cross-cut fixture links; also the `ABI5_OWNED_ADMISSION_PREIMAGE` preimage, the unapplied owner-continuation patch, F8, the liveness read and `gtl/consensus.ts` coverage;
  - items for the owner (`:5381`).
- Item 2, `specification/GOALS.md`:
  - `:18`: in the `GOAL-035` row, "Realization proceeds by the eight-step plan." becomes the delivered state at `562d4515a`: five obligations closed, O-TYPE per site, the proofs hold, not a release. The rest of the row is verbatim.
  - `:34-44`: the conjunction sentences with the six obligations OPEN are replaced by the current reality, with a link to the ticket subsection. The first sentence and the closing coverage-critique sentence are verbatim.
- Item 3, design notes:
  - §10.1 row 3 (`design:588`): the change cell adds `canonicalRecordDigest`. The retires cell reads "2 record-digest copies". The 3 record writers and the installed-codec pair stay.
    - Consistency edits: §4.3's `writeCanonicalRecord` Replaces cell (`:163`) carried the same false "3 hand-rolled record writers". §4.3's installed-equality sentence (`:167`) gains the installed-codec pair's exception (`public/installed_definition_call_transport.ts:144`, `public/installed_public_definition_call.ts:65`).
  - §4.3 inline digest comparisons (`:162`): a computed-against-stored digest comparison stays `===`; a comparison that digests both sides is `canonicalEquals`.
  - §10.6 row 5 emission premise: no edit. The repair's sentence (`:650`) states the result.
  - D7 clause: "proposed" becomes "proposed or, for `sourceReplayDigest`, when the source-result basis is admitted".
    - §4.4 (`:190`). The same line also gets `replay.ts:1387` to `:1389` and `c_call.ts:7047` to `:7052`.
    - Consistency edit: §10.6 row 5 (`:650`), which restates the clause.
  - R2 (`:200`): the R branch (`rules.ts:174-185`) has no `not A`. It is vacuous on admitted prefixes: the actor terminal is appended only after a process terminal (`actor_process.ts:1344`, `:1391`), and the projection treats the converse as a defect (`:629-630`).
  - R5 (`:186`): the law is the two tables. The published contract embeds the axiom table alone as `eventCalculus` (`scripts/generate-product-manifest.mjs:145`).
  - R6 (`:200`): counterexamples A and B and the lifecycle fluents' single producer, anchored to `actor_process.ts:636-640`, `calculus/rules.ts:47`, `:133-189`, `:174-185` and `calculus/axioms.ts:208-250`.
  - R7 (`:186`): axiom entries read the event, its dependencies and `AxiomFoldContext` (`axioms.ts:1722`, `:1731`). Rules read the fold state.
  - F9, step 7:
    - `:189` is now `:190` (`:7052`).
    - `:199` is now `:200` (`actor_process.ts:1331`).
    - §6 gains a `classifyOwnedProcessTerminal` row (`:283`).
    - `:549` is now `:551` ("No lifecycle reader consumes the field").
    - §9.2 four forms (`:553-560`): rewritten as the head census. The target sentence becomes "The field of form 2 stays where it is recorded...".
    - §9.3 item 1 (`:568`): `worker_transport.ts:459`, `actor_process.ts:1323-1340`, `:1322`.
    - §10.1 row 6 (`:591`): three atoms, "through the classifier", and the `replay.ts:2444` line cite restated by content.
  - (ix) P-LIFECYCLE (`:636`), the helper clause:
    - The no-child failure yields the leaf result, whose `exitStatus` 127 and `terminationConfirmed` true carry the outcome. The encoded facts travel on the failure subject only.
    - "step 8's integrated run" is replaced by the test locations: `t287-lifecycle-failure-carrier:337`; `t287-owned-process-lifetime:500-501`, `:547`.
  - F2: the §2 row's Imports cell (`:46`) lists the actual set. `:55` states the departure and the function-level cycle through `runtime_liveness.ts`; `lint:imports` is not extended.
  - F3, P-INGRESS (`:631`): "`tsc --noEmit` plus the signature grep ... at the library's close; no lint script checks it".
  - F4: a §4.3 row (`:164`), a §10.7 row (`:661`, `catalog_extension` of `N02`), and constitution §16.14 (b) at `ABI5_REALIZATION_CONSTITUTION.md:4390`.
  - F5, §4.1 `admitContract` (`:127`): "in `bindStaticOwner`; owner sites as touched".
  - F6, P-RECORD (`:634`): holds by reading (`invocation_execution_truth.ts:671`); no lane reaches the negative.
  - F9, review, `advance` (`:188`): copy once, `applyStep` in place, freeze (`event_calculus.ts:238`, `fold.ts:191`, `:261`).
  - F10, P-LAYER (`:638`): names `lint:imports` and `lint:lifecycle` with the allow-list's three classes.
  - C2 note, P-EQUAL (`:630`): the route through `t287-worksite-command-execution:407` to `execution_basis.ts:727` / `:805-806` / `:808`, via `:1921` and `:993`.
- Item 4, step 5 wording: ticket `:5368` gives the static `RecordCheck` reason (design §4.2, §6; constitution line 1861). The step files are unchanged.
- Item 5, `code/src/abg/calculus/rules.ts:128-129`:
  - The comment now reads "...holds from an actor_process_exited preceded by the process start." The guard clause is gone; no code changed.
  - `npm run build`: rc 0. It regenerated `contracts/capabilities/capability-definition-graph.json` and `product-toolchain-manifest.json`, both committed. No tracked `build/` file changed.
  - `npm run lint:lifecycle`: rc 0 (284 modules, 10 allow-listed sites, no offender).
- Gate: each edit read back by diff. Every table touched keeps one line per row and its pipe count. `git diff --stat` touches only the grant.
- Residuals:
  - F5's count is 13 at head, not 8. The five further sites (`product/verify_product.ts:1805`, `abg/terminal_result_contracts.ts:35`, `:55`, `:68`, `implementation/release_publication.ts:149`) exist at `97b1200bc` too. The ticket lists all 13.
  - `## Return 8a` O-TYPE open list, line numbers:
    - The `gtl/consensus.ts` lines sit 16 lower than head. The ticket cites head lines `:2217` to `:3296` and `:3628-3872`.
    - The three `jsonRecord` consumer lines point at no comparison at head. The ticket names those modules only.
  - §9.3 item 7 (`design:574`) cites `worksite_construction_recovery.ts:285`; the call is at `:283`. It is not on the F9 list and is left.
  - `GOALS.md:18`: "Lifecycle implementation, complete source conjunction, combined candidate/P1/P5/P4 and independent L5 remain open or held; release resumption is closed" is kept verbatim. It is not a library sentence and comes from the conjunction frame. `GOALS.md:46` onward (finite selected scope, source freezes) describes that frame too, outside the grant.
  - The plan ledger row 5 ("8 need runtime values") and step-5.md's Disposition keep the superseded reason. Both are outside the grant; the ticket carries the corrected one.
  - §10.6 row 5's "Decided by" and "Sequencing" cells still read as a gate before retention. Not edited.
- return route: this file

## Disposition of 8b (Executive, 2026-10-23)

Accepted at `c8d3f8ecd`; `git show --stat` is inside the grant plus the
addendum's build outputs. Item 5's consistency edits (the §4.3 cell and
sentence, the D7 clause in row 5, stale line numbers inside sentences
already being edited) are the smallest edits that keep one fact consistent
and are accepted. Residuals: F5's count of 13 stands as recorded (the extra
five are at the baseline); O-TYPE at head lines stands; §9.3 item 7's cite,
§10.6 row 5's gate cells and `GOALS.md:18`'s conjunction-frame sentence are
left for the next design or GOALS touch and recorded in the closing post;
plan ledger row 5 is corrected in the close commit; `step-5.md` is history.
Step 8 closed; the plan closes with the post named in the ledger.

## Post-close review (pasted by Jim, 2026-10-23; read-only, in-memory probes; subject `6a161fcbc` with `c8d3f8ecd` read)

Verbatim findings (the reviewer's severities):

1. S2. Helper failure facts still do not reach the promised admitted failure subject. The command and HTTP repairs encode facts into their thrown errors; the helper runs as a separate process through the worker's Bash tool and exits before publishing `result.json`. The parent's completion path (`worksite_command_execution.ts:704`) maps a failed exchange or missing artifact to a generic failure candidate (`:233`) with no process facts. An in-memory probe of that code returned `helper_artifact_absent` and `transport_identity_mismatch` with empty evidence. Repair: complete the helper-to-parent failure handoff and demonstrate its admission; the current tests stop at the helper throw.
2. S2. Public liveness reads one event before the requested prefix. `runtime_liveness.ts:825` selects the predecessor cut whenever a reconstruction is supplied; every public derivation supplies one (`:906`). At a prefix ending in a confirmed `actor_process_exited`, before actor finalization, public liveness reads the process as live; after a hard-cap timeout it can report `controlled_terminate` while the calculus reports termination. Repair: distinguish the validator's predecessor cut from the public reader's requested cut explicitly; reusing the reconstruction must not change the answer.
3. S2. The copying repair fixes batching; streaming advancement remains quadratic. `advance` (`event_calculus.ts:241`) calls `workingFoldState` (`fold.ts:158`) on every advancing read, copying all accumulated maps. Ordinary actor operation admits output chunks and probes incrementally, so successive bounded advancements copy about 1 + 2 + … + N entries. Repair: an exclusively owned incremental accumulator or an equivalent bounded-update representation; verify streaming advancement alongside cold/warm/fork agreement.
4. S2. O-SCHEMA's upstream-admission premise is false for exported APIs. `admitInput` and `validateContractValue` (`product/builtin_semantics.ts:1050`) accept `unknown` and call the state validator directly; a governance state with `{ hidden: () => 7 }` in `original.testing.commands` passed both and `admitInput` returned the same object. Repair: establish JSON membership at the raw owner boundary or enforce a truthful checked-input contract.
5. S2. The consensus refusal repair is incomplete for circular input: `admitJson` before comparison (`gtl/consensus.ts:934`) turns a self-referencing `targetObligationRefs` into `RangeError` where the pre-consolidation source returned `false`. Repair: establish the string-array shape before comparing reference arrays; this owner does not need recursive JSON admission.
6. S2. Delivery is declared while a selected completion obligation remains open: the plan's completion condition (`:319`) includes O-TYPE and prohibits closure with a named obligation open; the ticket (`:5346`) lists about 65 `unknown`-typed comparison sites open, and GOALS declares delivery (`:18`). Recording sites does not discharge them; resolve them or establish an authorized scope change.

Resolved or improved per the reviewer: D8 absence tolerance; the C2 production proof on the positive path; D9's reversal; the consolidation and the actor failure carrier. Limits noted: three edited suites never reach their bodies; P-RECORD's adapter mapping is inspected, not executed. The reviewer's reading of the churn: repairs close a local condition while dropping part of the original obligation (helper throw versus admitted failure; batched fold versus streaming; recorded type debt versus discharged obligations).

## Disposition of the post-close review (Executive, 2026-10-23)

Each finding verified by reading at `c8d3f8ecd`:

| # | Verified | Priority | Route |
|---|---|---|---|
| 1 | Yes. `worksite_command_helper.ts` ends in `await main()` with no catch; the cleanup-unresolved throws at the command and HTTP sites inside `main` are uncaught, so the helper exits before `publishCreateOnly` and the parent returns `failure("helper_artifact_absent")` (`:704-731`), a candidate with `evidenceCandidates: []` and a class `diagnosticRef` only; non-success helper dispositions likewise return `failure(\`helper_${disposition}\`)` without the artifact. Design §9.3 item 4 promises the facts "enter `L` through the admitted failure's diagnostic subject"; no such subject exists on this route. The step 7 repair closed the local loss (facts in the thrown error) and the Executive accepted that as the route without tracing the process boundary. | P1 | repair B item 1, with a contract stop |
| 2 | Yes. `:825-828` chooses `validatedRuntimeEventPrefixBeforeEvent(prefix, boundary)` whenever `reconstruction !== undefined`; `:906` always passes `livenessReconstruction(prefix)`, so the public path reads the predecessor cut, against the comment at `:815-817` ("in the public path at the prefix itself"). A step 6 repair seam (R3/R4). | P1 | repair A item 1 |
| 3 | Yes. `advance` copies every carrier per call (`workingFoldState`, `:241`); the pre-step-6 class advanced in place. Per-event advances (`event_prefix.ts:617`, `runtime_liveness.ts:495`) make the total quadratic. A regression of this plan, outside the sunny-day ruling, which covers resilience, not the cost of the main loop. | P1 | repair A item 2 |
| 4 | Yes. `admitInput` returns `value as unknown as Readonly<Record<string, JsonValue>>` after a shallow guard; `validateContractValue` is a type guard over `unknown`; both are provider methods dispatched from `product/semantics.ts:508` and the leaf port. The ticket's O-SCHEMA sentence states a premise the boundary does not enforce. Executive D10: admit through `admitJson` at the raw owner boundary (the dispatch), refusal on the method's existing channel; reversal: delete the admission lines and reopen O-SCHEMA. | P1 | repair A item 3; ticket sentence corrected |
| 5 | Yes. Seven of the nine `admitJson` comparands are reference arrays (`:830`, `:836`, `:842`, `:934`, `:941`, `:1122`, `:1269`); `Array.isArray` is their only shape check before the recursive walk, so a cycle throws where the baseline answered `false`. `:1112` (`declaredPolicy`) and `:1917` (`responseSchema`) are JSON values and keep `admitJson`. No valid path fails. | P2 | repair A item 4 |
| 6 | Yes on the letter. The plan's condition reads "O-TYPE per site in steps 3 and 4; the library does not close with any of them open"; the ticket lists about 65 `unknown`-typed cast sites from step 4 as open per site. Under D3 these are touched sites whose ingress question was deferred, not decided. The GOALS and ticket claims are corrected to the truthful state in repair A; discharging the sites is a scope decision the plan reserves to Jim: D11, asked in the report with the recommendation to discharge them by one census activation (producer named per site; typed upstream, the cast goes; otherwise `admitJson` at the site with its own refusal channel), the pattern 8a-2 used. | P1 on the claim; D11 on the sites | report |

The closing post's Result paragraph is superseded by its addendum until the repairs land. The reviewer's reading of the churn is accepted as recorded: three repairs closed a local condition and dropped part of the obligation; the Executive accepted each without tracing the whole path. That is the named-check lesson of the closing post applied to the Executive's own dispositions: a repair's Return is verified against the obligation's full path, not its local site.

## Post-close repair activation A (Executive, 2026-10-23)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Head is the Executive's bookkeeping commit after `824ce8fcd`. Read this section, `## Post-close review` items 2 to 5 and `## Disposition of the post-close review` above. Tenant root `build_tenants/abiogenesis/typescript`; every test runs with `node --experimental-vm-modules --test`. Change class: `realization_refactor`; design §10.5 and §10.3 wording as named.

1. **Liveness cut** (`abg/runtime_liveness.ts`). Make the cut explicit: the validator path (`validateRuntimeLivenessEvent`, `:464`, `:686`) evaluates before its own event; the public path (`:906`, `:930` and the three `:288-302` readers) evaluates at the requested prefix. The reconstruction parameter is reuse only and must not select the cut. Keep the comment at `:815-817` true. Test: in the suite that covers `deriveRuntimeLiveness` (find it by grep), a case at a prefix ending in a confirmed `actor_process_exited` before actor finalization with the hard cap reached: `processLive` false, disposition not `controlled_terminate`; and the same prefix through the validator path unchanged. Confirm by reading that the validator's answers at every existing case are unchanged.
2. **Streaming fold** (`abg/event_calculus.ts`, `abg/calculus/fold.ts`). The derivation class owns one mutable working state across `advance` calls; `advance` applies the new events in place and copies nothing; readers (`project`, `fluentAt`) read the owned state; `forkAt` is the one copy (`workingFoldState` of the owned state). Keep the invariant that a nested read of an earlier cut during a step sees the folded count (state the mechanism in the class comment). P-FOLD lane `t287-calculus-fold` unchanged and passing; add one streaming case: N single-event `advance` calls over the U1 store agree with one batched `advance` at every cut and with the cold fold, and a structural check that the per-call copy is gone (a copy count visible to the lane through an `@internal` export not re-exported from the barrel is acceptable; name the mechanism in the Return). Design §10.5 P-FOLD: one sentence stating the cost property (streaming advancement is linear in the new events; `forkAt` copies once).
3. **O-SCHEMA at the raw boundary** (D10). At the dispatch in `product/semantics.ts` (`:508` `admitInput`; the `validateContractValue` dispatch if one exists there, else at the four callers' shared entry, else inside the two providers; say which in the Return), admit the value through `admitJson` before the provider's guard; a refusal takes the method's existing refusal channel (`admitInput` returns whatever the fallback provider returns for an unadmitted value; `validateContractValue` returns `false`). Unit case: a complete governance state with `{ hidden: () => 7 }` in `original.testing.commands` is refused by both; the same state as parsed JSON is admitted. Design §10.3 O-SCHEMA row and the ticket's O-SCHEMA sentence (item 6 below) state the boundary.
4. **Consensus reference arrays** (`gtl/consensus.ts`). At `:830`, `:836`, `:842`, `:934`, `:941`, `:1122`, `:1269` replace `admitJson` with the string-array shape check the contract states (every member a string, or `isRef` where the neighbours use it), then compare without recursion; `:1112` and `:1917` keep `admitJson`. Unit case: a self-referencing array yields `false`; a NaN member yields `false`; the exact baseline answer for the cycle confirmed by one probe against the built baseline worktree named in `## Activation 8a addendum` (record it). Put the cases in `t287-common-computational-library` or one new small lane; say which.
5. **Gate.** `npm run build`; `npm run lint:imports`; `npm run lint:lifecycle`; the lanes touched (`t287-calculus-fold`, the liveness suite, the consensus and governance cases); `m5-event-calculus-runtime` and `m5-worker-transport` once each (the two integrated suites nearest items 1 and 2; compare against `step-8-run-final.log`, same failure set or better); `test:installed:language`. No broad run in this activation (repair B runs it once).
6. **Records.** Ticket `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`, the subsection `### Library delivery close (2026-10-23)`: replace the O-SCHEMA sentence with the realized boundary; add a paragraph "Post-close review (2026-10-23)" listing the six findings in one line each with their state after this commit (1 pending repair B; 2 to 5 repaired here with the test; 6 pending D11). `specification/GOALS.md` paragraph (lines 34 to 44): state the current reality, "the library is on `main` at <this commit>; O-RESOURCE, O-SHAPE, O-CODEC and O-KEY closed with sites; O-SCHEMA closed at the raw owner boundary; O-TYPE open at the step 4 cast sites, decided per site under D3, pending the owner's D11; the post-close review's helper-route finding in repair; not a release". Present tense, no narration.

**Grant.** `abg/runtime_liveness.ts`; `abg/event_calculus.ts`; `abg/calculus/fold.ts`; `product/semantics.ts` (or the providers, item 3); `gtl/consensus.ts` (the seven sites); the test files items 1 to 4 name; design §10.5 P-FOLD sentence and §10.3 O-SCHEMA row; the ticket subsection and the GOALS paragraph (item 6); the build outputs the gate regenerates; this file's `## Post-close repair return A`.

**Stop:** an item whose smallest fix leaves the grant; a gate suite failing with a failure set not in `step-8-run-final.log`; anything a design line contradicts.

**Return contract.** One commit on `main`, no push. First line `Post-close repair A: liveness cut; streaming fold; O-SCHEMA boundary; consensus ref shape`, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append `## Post-close repair return A` with: commit; items 1 to 4 with lines at head and the test names; the gate results; residuals.

## Post-close repair return A

- commit: the commit carrying this Return (first line `Post-close repair A: liveness cut; streaming fold; O-SCHEMA boundary; consensus ref shape`, parent `27912db91`, the Executive's D10 and D11 record, which landed on `main` during this repair and touches no grant file); its hash is in the final report. Not pushed. Staged by path. Path key: `T` = `build_tenants/abiogenesis/typescript`; `design` = `T/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`; lines are at this commit.
- Item 1, liveness cut: done. In `T/code/src/abg/runtime_liveness.ts`, the cut is an explicit argument `ProcessLivenessCut` (`:715`) of `deriveRuntimeLivenessSemantics` (`:719`). The validator passes `"before_event"` (`:687`). The public `deriveRuntimeLiveness` passes `"at_prefix"` (`:914`). The read (`:832-833`) holds `actor_process_live` at `prefix` for `at_prefix`, and at the cut before the boundary event for `before_event`. A supplied reconstruction is reuse only and selects nothing.
  - The public sites the activation names all reach `:914`: `deriveRuntimeLivenessWithPrefixDigest` (`:906`, base `:902`) through `deriveRuntimeLiveness` (`:901`) and through `projectRuntimeLivenessAtPrefixWithDigest` (`:936`, base `:930`, its call at `:943`). The three readers at `:288-302` read only the context. The comment the activation keeps true (base `:815-817`) is at `:821-825`: "read through holdsAt at `cut`: in the validator path at the cut before the event at `ordinal` ... in the public path at the prefix itself".
  - Validator effect: the probe arm is unchanged.
  - The timeout arm and its producer `admitRuntimeThreshold` (`:1027`) now read at the cut immediately before the timeout, not one event earlier. The answer changes only when the immediate predecessor is the start, exit or spawn failure of that process.
  - No retained `*.jsonl` in the repository carries an admitted `actor_process_timeout_observed`.
  - The other public callers (`retry.ts:5009`, `:5430`; `replay.ts:440`, `:1366`; `project_read_ports.ts:1550`) are reads outside a fold step.
  - Case `public liveness reads process liveness at the requested prefix; the validator reads before its own event` (`T/test_env/tests/t287-native-frame-observation.test.mjs:259`) VM-links the built module over a fixed execution basis and retry budget:
    - Process started: `actor_process_live` true, disposition `controlled_terminate`, a timeout validates.
    - Process exited: false, `continue_waiting`, a timeout is refused.
    - On the build at `bec07fe57`, the same harness gives the reverse answers.
- Item 2, streaming fold: STOPPED, no edit. Stop rule: a design line contradicts the fix.
  - design §4.4 (`:188`) states: "Its `advance` (`abg/event_calculus.ts:238`) copies the fold state once per call, applies each event to that copy in place with `applyStep` (`abg/calculus/fold.ts:191`), the in-place form of `foldStep` (`:261`), and freezes the copy when the call ends". The grant names only the §10.5 P-FOLD sentence (`design:635`), which stays unchanged.
  - Replacement sentence for the next grant: "Its `advance` (`abg/event_calculus.ts:238`) applies each new event in place with `applyStep` (`abg/calculus/fold.ts:191`), the in-place form of `foldStep` (`:261`), to the one working state the derivation owns, and copies nothing; `forkAt` copies once for the fork (`workingFoldState`, `:154`); readers read the owned state."
  - Hazards for that worker:
    - (a) `emptyFoldState` (`fold.ts:93`) shares module-constant Maps and Sets, and its freeze is shallow. Start the owned state from `workingFoldState(emptyFoldState(...))`.
    - (b) `forkAt` (`event_calculus.ts:187`) builds a frozen state with frozen clipped and declipped arrays, so the fork needs one `workingFoldState` copy.
    - (c) Successive validated cuts of one source share one `runtimePrefixComputation` owner and one derivation (probe: cut 1, cut 2, cut 3 and the source return the same owner). So N projections over increasing cuts are N single-event advances. A batched advance needs a separately selected copy of the rows, or an internal hook.
    - (d) `foldStep` also calls `workingFoldState`. Count copies only around the advances.
- Item 3, O-SCHEMA boundary: done (D10). The admission sits at the dispatch in `T/code/src/product/semantics.ts`:
  - `admitInstalledProductInput` (`:499`) admits the value with `admitJson` (`:512`) and passes the detached admitted value to the Product's `admitInput` (`:514`). A refused value returns `null`.
  - `evaluateInstalledInteractionResponse` (`:517`) admits the response candidate (`:530`) before the Product's `evaluateInteractionResponse` (`:532`). A refused candidate returns `null`. The census found this third raw dispatch: the built-in providers' `evaluateInteractionResponse` runs `admitInput` on the candidate (`product/builtin_semantics.ts:190`, `:671`).
  - `projectInstalledLeafSemantics` (`:603`) builds the leaf `validateContractValue` (`:616`), which admits (`:620`) before the Product's guard. A refused value is not a contract value.
  - Census of the exported dispatchers in `semantics.ts`: these three take a raw `unknown` into a Product's guard. `validateInstalledInvocationBasis`, `projectInstalledPublicResult` and the two public-result roster reads pass typed bases. No module outside `product/semantics.ts` and `implementation/leaf_invocation_port.ts` dispatches `admitInput`, `evaluateInteractionResponse` or `validateContractValue` into a loaded Product. External callers: `product/run_invocation_operation.ts:531` calls the first; `m5-s03-authority` calls the second through `product/index.ts:144`; `implementation/leaf_invocation_port.ts:1504` and `:1519` call the leaf runtime that `:931` inspects. The built-in providers' compositions call `admitInput` only inside a provider, behind the boundary.
  - The design §10.3 O-SCHEMA row (`design:612`) states the three methods.
  - The admission at `:530` applies D10's rule to a third raw dispatch that the census found. D10 as recorded at `27912db91` names only `admitInput` and `validateContractValue`, so ratifying the extension is the Executive's call. Reversal: delete that admission block.
  - Case `O-SCHEMA: the Product boundary admits input and contract values to I-JSON before the provider guard` (`T/test_env/tests/t287-common-computational-library.test.mjs:81`):
    - A parsed JSON value is admitted detached, frozen and deep-equal, and it validates.
    - With a function pushed into a nested command list, the default-library provider alone accepts, and both boundary methods refuse.
  - Case `O-SCHEMA: the Product boundary admits an interaction response candidate to I-JSON before the provider evaluates it` (same file) loads a spy provider:
    - A parsed candidate reaches the provider detached and deeply frozen.
    - A function-bearing candidate returns `null` and never reaches the provider.
- Item 4, consensus reference arrays: done. In `T/code/src/gtl/consensus.ts`, `isRefArrayEqual` (`:789`) checks the array, its length, and that each member is a reference equal to its counterpart. It does not recurse or encode.
  - The seven sites are `:840`, `:841`, `:842`, `:928`, `:930`, `:1106` and `:1248`. `admitJson` stays at `:1098` (`declaredPolicy`) and `:1894` (`responseSchema`).
  - New lane `T/test_env/tests/t287-consensus-ref-shape.test.mjs`, case `consensus reference arrays: shape-checked and compared without recursion; a cycle or NaN member is unequal`. At six sites, a fresh equal array is true. A cycle, `[NaN]`, a hole, a nested array and an extra member are false and do not throw. The fixture does not reach `:1248`.
  - Baseline probe on a built worktree at `97b1200bc`: every cycle and `[NaN]` answers `false`, and a valid array answers `true`. `bec07fe57` threw `RangeError: Maximum call stack size exceeded` on a cycle. This commit answers `false`.
- Gate, run on the committed tree (tenant root `T`; lanes with `node --experimental-vm-modules --test --test-concurrency=1`; 2026-10-22T06:53:42Z to 06:58:24Z):

  | command | rc | wall | result |
  | --- | --- | --- | --- |
  | `npm run build` | 0 | 32s | manifest and capability graph regenerated |
  | `npm run lint:imports` | 0 | 1s | 28 modules |
  | `npm run lint:lifecycle` | 0 | 0s | 284 modules, 10 allow-listed, no offender |
  | `t287-calculus-fold` | 0 | 1s | 6/6 |
  | `t287-native-frame-observation` | 1 | 1s | new case passes; the other three unskipped cases (`:189` "explicit proof-local territory", an undefined path argument, a falsy assertion) fail on environment preconditions, the same as with the file at `bec07fe57`; 4 skip |
  | `t287-common-computational-library` | 0 | 1s | 6/6 |
  | `t287-consensus-ref-shape` | 0 | 0s | 1/1 |
  | `m5-event-calculus-runtime` | 1 | 156s | 19 tests, 13 pass, 5 fail, 1 skip; fails at `:372`, `:1316`, `:1471`, `:1548`, `:1590` with the same first error lines as `step-8-run-final.log` (`abg.openCall is not a function` four times; `runtime_failure_observed/runtime_invocation_active`): same set |
  | `m5-worker-transport` | 0 | 6s | 21/21; the log has no failure: same set |
  | `m5-s03-authority` (nearest the response dispatch) | 1 | 39s | 5 tests, 1 pass, 4 fail at `:96`, `:218`, `:285`, `:415` with the log's first error lines: same set; the passing `:374` case calls `evaluateInstalledInteractionResponse` (`:396`) |
  | `npm run test:installed:language` | 0 | 45s | 1/1 |

- Residuals:
  - Item 2 is open on design §4.4 `:188`.
  - Leaf validation is now stricter. A worker output that carries a non-I-JSON value (an unsafe integer, a lone surrogate) is not a contract value. No lane exercises a live worker output at that edge.
  - The judgment relation's `evaluate` (`implementation/leaf_invocation_port.ts:1526`) takes `unknown` input and output. It is a predicate, not an admission or contract guard, and is outside D10's three methods.
  - Consensus site `:1248` has no exercising case.
  - Finding 1 is repair B's. Finding 6: O-TYPE is open at the step 4 cast sites; Jim's D11 (recorded at `27912db91`) discharges them by one census activation, post-close repair C.

## Disposition of repair A (Executive, 2026-10-23)

Accepted at `a1349e50b`. Item 1: the explicit cut is the law; the timeout
arm's changed answer when the process's own start, exit or spawn failure is
the immediate predecessor is the correct answer under §4.4, and no retained
log carries an admitted timeout. Item 3: the admission at the third raw
dispatch (`evaluateInstalledInteractionResponse`, `semantics.ts:530`) is
ratified under D10, which now names the three raw dispatches of
`product/semantics.ts`; the stricter leaf validation (a non-I-JSON worker
output is not a contract value) is the I-JSON law at the boundary and gets
its edge case in repair C. Item 4 accepted; `:1248` gets its case in C.
Item 2 stopped correctly on §4.4 `:188`; it moves to repair B with that
sentence in the grant and the four hazards. The three pre-existing failures
of `t287-native-frame-observation` are unattributed at the baseline and go
into B's final run list with attribution.

## Post-close repair activation C (Executive, 2026-10-23; D11)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Head is the Executive's bookkeeping commit after repair A. Read this section; the plan post's decisions D3, D10 and D11 (`.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, `## Decisions Jim owns`); the ticket's O-TYPE bullet in `### Library delivery close (2026-10-23)` (`.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`); step 4's Return and its per-file cast list (`step-4.md`); `## Return 8a-2` and `## Disposition of 8a-2` in this file (the seven-probe pattern this activation scales); design §4.1, §4.3, §10.3 O-TYPE. Tenant root `build_tenants/abiogenesis/typescript`; every test runs with `node --experimental-vm-modules --test`. Change class: `realization_refactor`.

Jim's D11: "the answer is always remove tech debt". O-TYPE closes at every touched site in this activation; nothing is recorded for later except a site whose discharge needs a contract change (stop rule).

1. **Census first, as a table in the Return**, before any edit. Enumerate by AST (as step 4's census did, not grep): every `as JsonValue` or `as unknown as JsonValue` (and `as Readonly<Record<string, JsonValue>>`) cast whose value feeds `canonicalEquals`, `canonicalRecordDigest`, `writeCanonicalRecord`, `sha256Canonical`, `canonicalJson` or an `admit*` atom in `code/src` (the step 4 per-file list is the seed; the census is the authority); plus the ticket's listed sites: the binding `sameJson` lift (`public/binding/`), the carrier site of `hog/parent_rehydration.ts`, the `jsonRecord` consumers in `abg/default_library.ts`, `abg/instruction_assembly.ts`, `product/default_library.ts`, the guard-refined comparisons of `gtl/consensus.ts` (`:2217`, `:2514`, `:2518`, `:2620`, `:2844`, `:2886`, `:3201`, `:3296`) and its relation evaluators (`:3628-3872`). Columns: `file:line | expression | static type before the cast | producer (typed upstream: the type and where; parsed at an admitting ingress: which; unknown: the caller class) | decision | done`. Decisions are exactly three: **(T)** the value is `JsonValue`-compatible by its static type or by a typed producer: remove the cast or widen the signature, no runtime change; **(I)** the value enters through an ingress that already admits (the event store's validators, `admitJson`, `admitContract`, a `v.safeParse` schema that refuses non-JSON): record the ingress and remove the cast where the type flows, else narrow with a typed guard, never `unknown`; **(A)** the value is unknown at the site (native result, in-process caller, `unknown` parameter): `admitJson` at the site, a refusal mapped to the site's own channel (`false` for a predicate, the owner's refusal value, or the owner's fault channel where the 8a-2 ruling applies: a cycle or a non-encodable member in a constructed resource is a construction defect). Variance casts between `JsonValue` subtypes (`Readonly<Record<string, JsonValue>>` to `JsonValue`) are (T) and are counted, not edited one by one, unless the cast hides an `unknown`.
2. **Apply** every (T), (I) and (A) decision. `sameJson` in `public/binding/`: both sides through `admitJson`; both ok → `canonicalEquals`; a refusal → `false`; keep the baseline's answer `false` for a cycle (say how). Each (A) site is listed with its channel in the Return, as 8a-2 listed its seven. No behavior change beyond refusing non-JSON values at (A) sites; name each such site. `tsc` clean without the casts is the check that (T) and (I) are right.
3. **Tests.** `npm run build`; `npm run lint:imports`; `npm run lint:lifecycle`; the lanes of every owner edited (`t287-value-equality`, `t287-common-computational-library`, `t287-select-family`, `t287-calculus-fold`, the consensus and governance cases repair A added, and any lane whose owner the table names); `m5-worker-transport`, `t287-worksite-command-execution`, `t287-observed-worksite-command` once each against `step-8-run-final.log` (same failure set or better); `test:installed:language`. Add to `t287-common-computational-library`: `sameJson` on a function member → `false`; on a cycle → `false`; the leaf `validateContractValue` (`product/semantics.ts:616-620`) refusing a worker output carrying an unsafe integer (repair A's residual). Add to `t287-consensus-ref-shape` a case that reaches `gtl/consensus.ts:1248`. No broad run (repair B runs it once).
4. **Records.** The ticket's O-TYPE bullet: rewritten to "closed" with the census totals by decision and the (A) sites with their channels. Design §10.3 O-TYPE row: closed at every touched site, the three decision classes named. `specification/GOALS.md` paragraph: the O-TYPE clause now reads closed (D11). The plan ledger is the Executive's.

**Grant.** Every `code/src` file the census table names (list them in the Return); the test files item 3 names; design §10.3 O-TYPE row (and §4.1 if a cell states the old premise); the ticket's O-TYPE bullet; the GOALS O-TYPE clause; the build outputs the gate regenerates; this file's `## Post-close repair return C`.

**Stop:** an (A) site with no refusal channel of its own, where refusing would be new behavior the owner's contract does not name: leave the cast, mark the row `stop: channel`, continue with the rest; a site whose discharge needs an event contract, payload key list or Product output contract change: same marking; a gate failure with a failure set not in `step-8-run-final.log`; anything outside the grant. Stopped rows are the only O-TYPE remainder and go to the Executive with the contract delta each needs.

**Return contract.** One commit on `main`, no push. First line `Post-close repair C: O-TYPE discharged at the cast sites (D11)`, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append `## Post-close repair return C` with: commit; the census table; totals by decision; the (A) sites and channels; the stopped rows with their deltas; the gate results; residuals.

## Post-close repair return C

- Commit: the commit carrying this Return (first line `Post-close repair C: O-TYPE discharged at the cast sites (D11)`, parent `0c362da15`); its hash is in the final report. Not pushed. Staged by path. Path key: `T` = `build_tenants/abiogenesis/typescript`; `W` = this folder. Census lines are at `0c362da15`.
- Item 1, census: done, by AST. A path-sensitive tracer over the TypeScript checker enumerates every `as JsonValue`, `as unknown as JsonValue` and `as Readonly<Record<string, JsonValue>>` cast in `T/code/src` at `0c362da15`: 2951 casts in 179 files. Each cast is traced to `canonicalEquals`, `canonicalRecordDigest`, `writeCanonicalRecord`, `sha256Canonical`, `canonicalJson` or an `admit*` atom, through variables, parameters, returns, callbacks, field-matched member and element access, object and array literals, spreads and destructuring, with field stack depth 14. 2735 casts feed a sink. Two more are the operands of the ticket-listed `sameJson` in `public/installed_public_definition_call.ts`, which reach the installed codec through a method receiver the tracer does not resolve. Total: 2737.
  - The table: `W/post-close-repair-c-census.tsv`, one row per cast, with columns `file:line | function | expression | static type before the cast | cast form | sink | producer | decision | channel | done`. The producer cell names each type on the cast's type path that is declared in `code/src`, with its file. It marks `[interface, now alias]` where this repair declares the interface as a type alias, and `[schema, exactOptional]` for the outputs of the self-conformance schemas.
  - The explicit-`undefined` branches that replaced a cast over an optional member: `W/post-close-repair-c-undefined-branches.tsv`, 158 rows (27 (A), 131 (T)), keyed by function. Ten rows come from a completeness scan of the final tree (every `=== undefined`, `!== undefined` and `??` added since `0c362da15`) and are marked so.
  - Ticket-listed sites: binding `sameJson` (`public/binding/definition_binding_mechanics.ts`) and public `sameJson` are (A). The `hog/parent_rehydration.ts` carrier casts (`:195`, `:338`, `:365`) are (T), and its stale O-TYPE comment is removed. The `jsonRecord` consumers in `abg/default_library.ts`, `abg/instruction_assembly.ts` and `product/default_library.ts` are (T), (I) or (A) per row. The guard-refined comparisons and relation evaluators of `gtl/consensus.ts` are (I) behind the module's guards, or (A) where a body is digested.
- Totals by decision:

  | family | (T) | (I) | (A) | stop: contract | stop: channel | no sink: (T) | no sink: (I) | no sink: kept |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | `abg` | 1154 | 146 | 67 | 0 | 3 | 83 | 5 | 29 |
  | `gtl` | 131 | 7 | 19 | 0 | 0 | 0 | 6 | 2 |
  | `hog` | 140 | 2 | 0 | 5 | 0 | 10 | 0 | 3 |
  | `implementation` | 173 | 22 | 12 | 0 | 0 | 8 | 3 | 4 |
  | `owner_bindings` | 5 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
  | `product` | 621 | 19 | 63 | 0 | 0 | 35 | 0 | 10 |
  | `public` | 33 | 0 | 13 | 0 | 0 | 3 | 0 | 3 |
  | `shared` | 21 | 1 | 1 | 0 | 0 | 0 | 0 | 3 |
  | `validator` | 69 | 5 | 4 | 0 | 1 | 5 | 0 | 1 |
  | total | 2347 | 202 | 179 | 5 | 4 | 145 | 14 | 55 |

  - Sink rows: 2737 = 2347 (T) + 202 (I) + 179 (A) + 5 `stop: contract` + 4 `stop: channel`. The (A) rows sit in 94 functions of 52 files.
  - (T) is the cast removed where the static type at `0c362da15` is already JSON-assignable (variance casts included), or where the owner type is retyped. Retyping means an interface declared as a type alias, so that it is `JsonValue`-assignable, or a widened signature.
  - (I) is a typed guard (`isRecord`, `isJsonRecord`, `typeof`) on a value that entered through an admitting validator; where the guard repeats a check the ingress already made, it throws or answers the guard's existing message or value.
  - The 214 casts that feed no traced sink are outside the census. 159 of them went with the sink rows' types; 55 remain (residuals).
- Item 2, apply: done; `tsc` clean. Both `sameJson` admit each side through `admitJson`; ok on both sides compares the canonical encodings; a refusal answers `false`. A cycle answers `false` as at the baseline: `admitJson` throws on a cycle and the surrounding `catch` answers `false`. The (A) sites, by channel. Each refuses a non-JSON value on its own channel. An absent member counts as non-JSON: the 27 (A) `undefined` branches below answer the site's refusal where `0c362da15` threw. Because `admitJson` checks the prototype, each (A) site also refuses a plain record of another realm, which `canonicalEquals` at `0c362da15` compared by structure (residual: realm). These two refusals are the only behavior changes. Function names are given with their census lines:
  - false: 71 functions, 140 rows:
    - [false] abg/runtime_liveness_contracts.ts `isRuntimeWatchdogPolicy` (159,160); abg/runtime_liveness_contracts.ts `isRuntimeSystemProbeContract` (195); product/worksite_construction_recovery.ts `isWorksitePreservedResultArtifact` (130); product/worksite_construction_recovery.ts `<anon>` (150,154); product/worksite_revision.ts `isWorksiteRevisionCommandExecutionTask` (163); product/worksite_command_forward.ts `isWorksiteCommandForwardRequest` (114); product/worksite_command_forward.ts `isWorksiteCommandForwardTask` (151); product/declaration_closure.ts `isResolvedDeclarationClosure` (243); product/worksite_branch_construction.ts `isWorksiteBranchConstructionTask` (436); product/worksite_preparation.ts `evaluate` (234); product/semantic_stage.ts `isSemanticStageEnvelope` (193); product/semantic_revision.ts `<anon>` (250,251); product/semantic_revision.ts `evaluateNativeSemanticRevisionRelation` (392,395,398); product/semantic_job.ts `evaluateNativeSemanticRelation` (970,973,976); validator/qualification.ts `matches` (593); product/implementation_resolution.ts `isPackagedLeafImplementationDescriptor` (260); abg/traversal_transition.ts `isTraversalTransitionCandidate` (302); implementation/leaf_execution_authority.ts `isExactAdmittedImplementationResolution` (175); abg/semantic_job.ts `semanticJobResultMatchesBasis` (386); abg/worksite_command_forward.ts `worksiteCommandForwardResultMatches` (283,284); abg/invocation_admission.ts `isInvocationSourceResultBasis` (405,414); abg/worksite_construction_recovery.ts `worksitePreservedResultMatchesBasis` (391); abg/requirement_handoff.ts `requirementHandoffResultMatches` (86); abg/c_call_outcome.ts `<anon>` (1290,1298,1302,1306); abg/artifact_truth.ts `validateExactPrefixArtifactTruthProjection` (807,808); abg/instruction_assembly.ts `registeredSelectionInstructionResultMatches` (450,453); product/worksite_command_execution.ts `same` (701); product/worksite_command_execution.ts `isExactWorkspaceBinding` (819); product/worksite_command_execution.ts `isPredicate` (1141); product/worksite_command_execution.ts `isCommandResult` (1717); product/worksite_command_execution.ts `isWorksiteExecutionObservation` (2165); abg/definition_event_resource.ts `validateAbgEventResourceOutcome` (156); product/invocation.ts `isInvocationPolicyBasis` (364); product/invocation.ts `isInvocationAuthority` (426); product/invocation.ts `isPublicInvocationCandidate` (524); product/invocation.ts `isCapabilityGrantValue` (702); product/worksite_effect.ts `isWorksiteFileParentsAuthorization` (1804); product/worksite_effect.ts `isWorksiteFileParentsSuccess` (1844); product/environment.ts `isWorkspaceAuthorityBasis` (1095,1096); product/environment.ts `workspaceBindingCandidateMatches` (1272); product/worksite_construction.ts `isExactWorkspaceBinding` (256); product/worksite_construction.ts `isWorksiteConstructionTarget` (387); product/worksite_construction.ts `isWorksiteConstructionTask` (534); product/worksite_construction.ts `isWorksiteCandidateBundle` (725)
    - [false (both sides admitted)] public/binding/definition_binding_mechanics.ts `sameJson` (49)
    - [false: admitJson(body) refused -> return false before the digest] gtl/consensus.ts `isConsensusActionCatalog` (853); gtl/consensus.ts `isConsensusObservationSnapshot` (944); gtl/consensus.ts `isConsensusNextActionBasis` (1105,1109); gtl/consensus.ts `isConsensusActionEvaluationBasis` (1240); gtl/consensus.ts `isConsensusActionEvaluationProjection` (1350); gtl/consensus.ts `isConsensusRoundDecision` (2833); gtl/consensus.ts `isConsensusHumanFinalization` (2881); gtl/consensus.ts `isConsensusEscalationDecision` (2929); gtl/consensus.ts `isTicketConsensusProjection` (2977)
    - [false via local admittedDigestIs(body, digest)] gtl/consensus.ts `isConsensusNextActionProjection` (1199); gtl/consensus.ts `isConsensusRoleInstruction` (1897,1901); gtl/consensus.ts `isConsensusRoleProfile` (1980); gtl/consensus.ts `isConsensusPanel` (2019); gtl/consensus.ts `isConsensusRulingOverlay` (2047); gtl/consensus.ts `isConsensusRoundPolicy` (2076); gtl/consensus.ts `isReviewFindings` (2278)
    - [false via admittedDigestIs (head line 1248)] gtl/consensus.ts `isConsensusActionEvaluationBasis` (1247)
    - [false via local outputIs] abg/semantic_job.ts `semanticJobResultMatchesBasis` (389,390,393); abg/semantic_job.ts `nativeSemanticResultMatchesBasis` (573,574,575)
    - [false / null (existing proof answers)] implementation/leaf_invocation_port.ts `<anon>` (488,489)
    - [false: exactIJson now answers admitJson(value).kind === "ok"] abg/definition_event_resource.ts `exactIJson` (213)
    - [false via local admittedDigestIs] abg/event_store.ts `validateDurablePrefixCoordinate` (1954)
    - [false via admittedDigestIs] abg/event_store.ts `validateEventStoreReopenAuthority` (1999)
    - [false (existing catch)] public/installed_definition_call_transport.ts `sameStructure` (146,147)
    - [false (both sides admitted; throw is false)] public/installed_public_definition_call.ts `sameJson` (66,67)
    - [false (expected now typed)] implementation/worksite_command_helper.ts `isWorksiteCommandExecutionLaunchManifest` (206,207)
  - null: 13 functions, 22 rows:
    - [null (existing catch)] abg/semantic_job.ts `projectSemanticJobEvidence` (379,380)
    - [null] abg/semantic_revision.ts `nativeJobRevisionSubject` (343); abg/semantic_revision.ts `jobRevisionSubjectAtBasis` (413,416); abg/worksite_construction_recovery.ts `projectWorksitePreservedResultArtifact` (363,364); abg/instruction_assembly.ts `constructWorksiteNativeInstructionAssembly` (121,122); abg/worksite_input_provenance.ts `nativePreparationBridge` (621); public/gap_authority.ts `parsePublicGapAuthority` (239,244); public/run_projection_authority.ts `parsePublicRunProjectionAuthority` (191,195)
    - [null (existing digest-mismatch refusals)] product/project_read_ports.ts `digestJson` (305)
    - [null (no admitted failure source); hasAdmittedActorEvidence false] abg/c_call.ts `projectAdmittedProbabilisticTransport` (2090)
    - [null (existing not-owned answer)] product/verify_product.ts `selectOwnedProductVerification` (144)
    - [null (admitJson(body), admitJson(value) inside the existing try)] public/continuation_authority.ts `parsePublicContinuationAuthority` (197,202)
    - [null -> existing refusal (configuration / contract_invalid) and packet guard false] product/materialization_operations.ts `digestJson` (141)
  - refusal: 2 functions, 2 rows:
    - [existing refusal `non_canonical_value` via admitIJsonValue for every kind] validator/raw_admission.ts `rawAdmitValue` (185)
    - [existing refusal stale_basis] abg/instruction_assembly.ts `evaluateRegisteredSelectionInstructionAssembly` (247)
  - TypeError: 9 functions, 12 rows:
    - [TypeError (unreachable: static schema)] validator/qualification.ts `qualificationWorkerRequest` (564)
    - [TypeError -> assembly refusal unknown_dependency] product/default_library.ts `projectFramedSynthesisPromptTask` (283)
    - [existing TypeError "witness event payload is not one exact self-certified actor-attributed act"] abg/event_store.ts `assertRuntimeEventContract` (2991)
    - [existing TypeError] abg/project_read_definition_bindings.ts `<anon>` (320)
    - [TypeError -> existing preparation_invalid failure candidate] implementation/worksite_command_execution.ts `realizePreparation` (813)
    - [existing leaf TypeError] implementation/worksite_command_forward.ts `prepareWorksiteCommandForward` (26,27); implementation/native_work_reacquisition.ts `prepareNativeWorksiteCommandReacquisition` (26,29)
    - [digest of the admitted input (existing TypeError)] implementation/worksite_command_forward.ts `prepareWorksiteCommandForward` (30)
    - [TypeError -> existing transport_failure refusal (exit 2)] public/cli.ts `<module>` (125)
  - other: 2 functions, 3 rows:
    - [uniqueness check false] shared/public_function_contracts.ts `canonicalIdentity` (184)
    - [falls through to isResolvedProductLock (existing path)] abg/artifact_truth.ts `establishInlineLock` (296,297)
  - (A) explicit-`undefined` branches (27 rows in 20 functions of 17 files). At `0c362da15`, an absent member that reached `canonicalEquals` threw a TypeError (`Cannot convert undefined or null to object`). Each such member is in recorded event payloads or input data, not an owner-constructed resource, so the 8a-2 fault channel does not apply. Each branch answers a refusal of the function's whole answer (`false`, `null`, the owner's refusal or TypeError):
    - projectAdmittedActorTransport false (transport mismatch): abg/c_call.ts `projectAdmittedActorTransport`
    - admitResult refusal: abg/c_call.ts `admitResult`
    - projectGovernanceChoice null: abg/default_library.ts `projectGovernanceChoice`
    - exactTaskTruth null: abg/fan_out_projection.ts `exactTaskTruth`
    - exactOpenedBasis null: abg/fh_continuation_projection.ts `exactOpenedBasis`
    - deriveSourceResultBasisAtPrefix null: abg/invocation_admission.ts `deriveSourceResultBasisAtPrefix`
    - coveredGovernancePredecessor null: abg/invocation_execution_truth.ts `coveredGovernancePredecessor`
    - nativeWorkReacquisitionResultMatches false: abg/native_work_reacquisition.ts `nativeWorkReacquisitionResultMatches`
    - projectNativeWorkspaceWorkSourceAtPrefix null: abg/native_worksite_execution.ts `projectNativeWorkspaceWorkSourceAtPrefix`
    - no-action input TypeError (existing refusal): abg/project_read_ports.ts `contents`
    - nativeRuntimeCases null: abg/qualification_proof.ts `nativeRuntimeCases`
    - runtime liveness validator false: abg/runtime_liveness.ts `createRuntimeLivenessEventValidator`
    - semanticInputAtBasisEquals false: abg/semantic_stage.ts `semanticInputAtBasisEquals`
    - completedC3Child null: abg/worksite_input_provenance.ts `completedC3Child`
    - readDependencyPreparationHasNativeBridgeSource false: abg/worksite_input_provenance.ts `readDependencyPreparationHasNativeBridgeSourceAtPrefix`
    - worksiteExecutionSourcesCurrent false: abg/worksite_revision.ts `worksiteExecutionSourcesCurrent`
    - hasExactWorksiteLeafExecutionAuthority false: implementation/leaf_invocation_port.ts `hasExactWorksiteLeafExecutionAuthority`
    - isReleaseOperationArtifact false: implementation/release_publication.ts `isReleaseOperationArtifact`
    - reacquisitionTaskMatches false: product/worksite_command_execution.ts `reacquisitionTaskMatches`
    - helperArtifactPreservesProtectedObservations false: product/worksite_command_execution.ts `helperArtifactPreservesProtectedObservations`
  - Schema (A): 22 members move from `v.optional` to `v.exactOptional`, refusing an explicit `undefined`: `validator/self_conformance_contracts.ts` 9, `validator/qualification_contracts.ts` 9, `product/default_library.ts` 4.
  - Named branches inside (I) rows, and corrections to the undefined-branch table:
    - `validator/qualification.ts` `predicateOutcomes`: a non-record declaration answers `null` through the material's existing `catch`. An absent expected value throws from `expectedEquals()` as the comparison threw at `0c362da15`, so the material still answers `null` (T; three rows).
    - `abg/semantic_revision.ts` `nativeIntakeFacts`: the added `?? null` is unreachable; the operand before it (`!…semanticJobLifecycle`) already refuses `original_job_or_lifecycle_mismatch`, as at `0c362da15` (T).
    - `abg/traversal_route.ts` `admitRoute`: the added `candidate.boundInput === undefined` is unreachable; the clause before it (`(retained === null) !== (candidate.boundInput === undefined)`) already refuses with the bound-input detail, as at `0c362da15` (T).
    - Restored throws (T, 16 sites in 15 functions of 9 files): where an absent-member branch would only drop one element from a set the owner then selects from (a `filter`, `flatMap` or loop `continue`, or a sequence it compares), the drop could turn the owner's refusal or fault at `0c362da15` into an acceptance. Those sites call `presentMember` (new in `shared/canonical_json.ts`, re-exported by `shared/value`), which throws the TypeError the canonical writer throws for `undefined`, so each answers as at `0c362da15`: `abg/c_call.ts` `signals` (at the sequence comparison); `abg/construction_continuation.ts` `deriveConstructionIntentContinuations`; `abg/retry.ts` `opened`; `abg/semantic_job.ts` `predecessor`, `validateWorksiteFileParentsPlanAtPrefix`; `abg/semantic_revision.ts` `semanticJobRevisionInputMatchesBasis`, `semanticRevisionInputMatchesBasis`; `abg/semantic_stage.ts` `exactSources`, `selectedSemanticPredecessor`; `abg/worksite_construction_recovery.ts` `taskBridge`, `nativeWorksiteRecoverySourceAtPrefix`; `abg/worksite_revision.ts` `matching`, `deriveCurrentOrigins`, `worksiteRevisionEntryBindingDisposition` (two); `implementation/release_publication.ts` `prior`. Four of them (`validateWorksiteFileParentsPlanAtPrefix`, both `semantic_revision` lookups, `nativeWorksiteRecoverySourceAtPrefix`) sit inside `catch { return false; }`: one `c_call_result_admitted` event without `value` (the payload contract allows it and does not require it) still answers `false` for the whole lookup (residual).
    - The census channel cells of the casts at these sites now read `absent member throws (presentMember), as at 0c362da15`.
    - Every added `x ?? null` that is compared (`abg/semantic_job.ts` `semanticJobInputMatchesBasis` and `semanticJobReadDependenciesAtPrefix`, `abg/semantic_stage.ts` `semanticInputMatchesBasis`, `abg/semantic_revision.ts` `projectRevisionDesignCoordinates`, the retry and C-call plan checks, `product/environment.ts`, `product/semantic_job.ts`) compares against a record, array or event that is never `null`, so an absent member stays unequal and the site refuses; the census cells say so where the branch is reachable. Every other added `undefined` test sits in a condition whose branch refuses (`return false`, `null`, `[]`, a refusal value, or a throw), is unreachable (`abg/worker_transport.ts` `collectToolUses`: values from `JSON.parse` hold no `undefined`), or is an equivalent restructure (`abg/instruction_assembly.ts`, `implementation/semantic_revision.ts` `result`).
  - Digest identity: `abg/c_call.ts` `pendingInteractionBodyDigest` writes the same key set and bytes without the cast; the root event contract digest stays `sha256:6c8a9852…ae64`. The regenerated contracts (`T/contracts/capabilities/capability-definition-graph.json`, `T/contracts/worksite/command-execution-context.inventory.json`, `T/product-toolchain-manifest.json`) differ from `0c362da15` only in digest and reference fields; the `contractDigest` changes come from the `.d.ts` declaration inventory.
  - Emitted JS of the final tree against `0c362da15`: 94 files, 780 token regions. 279 are admission, 88 explicit `undefined` branches, 57 imports, 44 record guards, 26 restored throws (`presentMember`, with its 9 imports and the helper), 22 `exactOptional`, 19 `??` and 245 other (5 of them multi-line template regions). The other regions are equivalent restructures, hoisted locals, renamed locals and the pin; each was read. Against the emitted JS before the realm restorations and `presentMember`, the only changes are those: `validator/self_conformance_semantics.js` has no token change from `0c362da15`, `abg/qualification_proof.js` keeps 12 of its 24 regions, and each restored site replaces its `undefined` branch with a `presentMember` call.
- Stopped rows, 9. Each keeps its cast.
  - `stop: contract`, 5:
    - The casts: `hog/recursion_lifecycle.ts:570` (`blockRecursion`), `:1027` and `:1053` (`completeRecursionChildUsing`); `hog/workflow_lifecycle.ts:727` and `:1075` (`completeOwnedWorkflowLocus`). Each passes a completion or failure subject to `sha256Canonical`.
    - The subject carries the owned runtime prefix object. The canonical writer encodes the prefix's `RuntimeHistorySelection` class instance, which has private fields, as `{}`, so the subject digest does not bind the selection.
    - Delta: the subject contract carries the prefix's JSON coordinate (reference and digest) in place of the object. That changes a payload and digest contract, which this activation does not grant. The casts stay.
  - `stop: channel`, 4:
    - The casts: `abg/qualification_proof.ts:115` (`sameFact`, both operands; its callers `projectQualificationConsumer`, `projectNativeRuntimeAssessment`, `projectQualificationVerdict` and `graphOwner`), `:475` (`projectQualificationRulingForConsumer`, the response comparison), and `validator/self_conformance_semantics.ts:82` (`qualificationResultRelation`, the ruling predicate).
    - Each compares a caller record that may come from another realm: the qualification lanes load these owners into a separate VM realm (`test_env/support/malformed-gtl-native-fixture.mjs`), and the relation holds across realms at `0c362da15` because `canonicalEquals` reads structure only. `admitJson` refuses a plain record whose prototype is another realm's `Object.prototype`. Admission at these sites turned `t287-native-runtime-gate` `:45` from pass to fail, and the owner's contract names no such refusal.
    - Delta: `admitJson` accepts a plain record of any realm (design §4.1, the `shared/admit` atom), or the Executive rules that a realm-foreign record is refused and the case changes. Then these sites take (A) with `null`/`false`.
- Grant:
  - The hog/* files entered through the corrected census, and the schema files through the producer column.
  - Each producer-only file appears in the producer cells of the rows it types: `shared/public_invocation.ts` 544 rows, `gtl/c_algebra.ts` 208, `gtl/semantic_job.ts` 182, `product/contracts.ts` 166, `gtl/contracts.ts` 162, `abg/terminal_result_contracts.ts` 79, `implementation/contracts.ts` 14, `hog/traversal_completion.ts` 13, `validator/self_conformance_contracts.ts` 7, `abg/effectful_invocation_truth.ts` 2, and `product/registered_selection_native.ts`, `shared/effect_definition.ts` and `shared/i_json.ts` 1 each.
  - `gtl/worksite_command_execution.ts` is the source pin of the built `product/worksite_command_execution.js`, a census file; the build refuses a stale pin.
  - `code/src` files edited, 193:
  - census rows (178 files):
    - `abg/`: `actor_process`, `artifact_truth`, `c_call_outcome`, `c_call`, `closure`, `construction_continuation`, `continuation`, `default_library`, `definition_event_resource`, `environment_admission`, `event_body_encoding`, `event_calculus`, `event_contract_profiles`, `event_log`, `event_prefix`, `event_store`, `execution_basis`, `fan_out_projection`, `fan_out`, `fh_continuation_projection`, `fh_resume_relation`, `graph_application`, `instruction_assembly`, `invocation_admission`, `invocation_execution_truth`, `native_work_effect`, `native_work_reacquisition`, `native_worksite_execution`, `open_call`, `probabilistic_result`, `project_read_definition_bindings`, `project_read_ports`, `qualification_proof`, `registered_selection_provenance`, `replay`, `requirement_handoff`, `retry`, `runtime_failure`, `runtime_history`, `runtime_liveness_contracts`, `runtime_liveness`, `semantic_job`, `semantic_revision`, `semantic_stage`, `stdo_environment`, `transport_contracts`, `traversal_cursor`, `traversal_route`, `traversal_transition`, `witness_admission_operation`, `witness_definition_bindings`, `worker_transport`, `worksite_command_forward`, `worksite_construction_recovery`, `worksite_input_provenance`, `worksite_revision`
    - `gtl/`: `canonicalization`, `consensus`, `graph_applications`, `graph_construction`, `materialize`, `requirement_handoff`, `semantic_revision_publication`, `semantic_stage_publication`, `semantic_stage`, `serialization`, `source_path`, `stdo_run_environment`, `worksite_c0`, `worksite_command_forward`, `worksite_construction_recovery`
    - `hog/`: `ccall_lifecycle`, `entry`, `graph_execute`, `interaction_lifecycle`, `interaction_resume`, `judgment`, `operator_support`, `parent_rehydration`, `recursion_lifecycle`, `retry_lifecycle`, `route_proposal`, `structural_transition`, `traversal`, `workflow_lifecycle`
    - `implementation/`: `consensus`, `default_library`, `leaf_execution_authority`, `leaf_invocation_port`, `native_work_reacquisition`, `native_workspace_work`, `qualification`, `release_publication`, `requirement_handoff`, `self_conformance`, `semantic_revision`, `semantic_stage`, `worksite_branch_construction`, `worksite_command_execution`, `worksite_command_forward`, `worksite_command_helper`, `worksite_construction`, `worksite_file_replace`
    - `owner_bindings/`: `run_invocation`
    - `product/`: `admission_authority`, `builtin_semantics`, `catalog_definition_bindings`, `catalog_operation_contracts`, `catalog`, `declaration_application`, `declaration_closure`, `declaration_exports`, `default_library_fulfillment`, `default_library`, `environment_definition_bindings`, `environment_operation_contracts`, `environment`, `execution_resolution`, `implementation_resolution`, `install_definition_bindings`, `install_product`, `invocation`, `materialization_operations`, `native_workspace_assessment`, `native_workspace_work`, `project_read_definition_bindings`, `project_read_ports`, `public_contract_publication`, `publication`, `release_acceptance`, `release_snapshot_definition_bindings`, `release_snapshot_operations`, `requirement_handoff`, `result_assessment_operation`, `run_invocation_operation`, `semantic_job`, `semantic_revision`, `semantic_stage`, `semantics`, `stdo_environment`, `verification_definition_bindings`, `verify_product`, `worksite_branch_construction`, `worksite_command_execution`, `worksite_command_forward`, `worksite_construction_recovery`, `worksite_construction`, `worksite_effect`, `worksite_operations`, `worksite_preparation_contracts`, `worksite_preparation`, `worksite_revision`, `workspace_definition_bindings`, `workspace_operations`
    - `public/binding/`: `definition_binding_mechanics`, `owner_contract_source_set`, `public_function_family`, `public_function_projections`
    - `public/`: `cli`, `continuation_authority`, `gap_authority`, `installed_definition_call_transport`, `installed_public_definition_call`, `run_projection_authority`
    - `shared/`: `capability_contracts`, `operation_definition_coordinate`, `public_function_contracts`
    - `validator/`: `conformance_definition_bindings`, `conformance_operation`, `graph`, `implementation_resolution`, `qualification_contracts`, `qualification`, `raw_admission`, `self_conformance_basis`, `self_conformance_semantics`, `self_conformance`, `validation`
  - producer column (15 files: owner types that reach census rows, declared as aliases; the schema members of `validator/self_conformance_contracts.ts`; the pin; `shared/canonical_json.ts`, which declares `JsonValue` and is named in 744 producer cells, for `presentMember`):
    - `abg/`: `effectful_invocation_truth`, `terminal_result_contracts`
    - `gtl/`: `c_algebra`, `contracts`, `semantic_job`; and `worksite_command_execution`, whose source pin of `product/worksite_command_execution.js` the build regenerates (digest `sha256:519bb6c5…3306`, byteCount 111262, span 101301-103609)
    - `hog/`: `traversal_completion`
    - `implementation/`: `contracts`
    - `product/`: `contracts`, `registered_selection_native`
    - `shared/`: `canonical_json`, `effect_definition`, `i_json`, `public_invocation`
    - `validator/`: `self_conformance_contracts`
  - The census names `gtl/declarations.ts` (one `any` parse cast, no sink), which is unedited.
  - Tests: `T/test_env/tests/t287-common-computational-library.test.mjs` and `T/test_env/tests/t287-consensus-ref-shape.test.mjs`.
  - Records: design §10.3 O-TYPE row (§4.1 states no old premise and is unchanged); the ticket's O-TYPE bullet and its two O-TYPE sentences in the same subsection (the status paragraph, owner item 6); the GOALS O-TYPE clauses (`GOAL-035` status, the library paragraph).
  - Build outputs and the census files `W/post-close-repair-c-census.tsv` and `W/post-close-repair-c-undefined-branches.tsv`.
- Item 3, tests added:
  - `t287-common-computational-library`: the existing O-SCHEMA test now has a leaf `validateContractValue` case that refuses a worker output carrying an unsafe integer. New test `O-TYPE: sameJson admits both sides; a function member or a cycle is never equal`.
  - `t287-consensus-ref-shape`: new test `consensus evaluation basis: the evidence response digest is checked over the admitted response`. It reaches `admittedDigestIs(evidence.responseValue, evidence.responseDigest)` in `isConsensusActionEvaluationBasis` (`:1248` at `0c362da15`): the right digest gives `true`, a wrong one `false`.
- Gate (tenant root `T`; each lane alone, `node --experimental-vm-modules --test --test-concurrency=1`, `--test-timeout=600000` from batch 2; 2026-10-22T09:53Z to 12:54Z). Batch 1 ran on the tree before the `predicateOutcomes` and realm restorations; batch 2 on the tree before the realm restorations; batch 3 on the tree before the `presentMember` restorations; batch 4 on the final tree; the lanes that load the restored owners ran again on the final tree. Baselines: `step-8-run-final.log` for its 44 files; otherwise the same lane at `0c362da15` in a worktree (built in full, with the ignored fixture a lane reads linked in where it reported ENOENT).

  | command | rc | wall | result | against the baseline |
  | --- | --- | --- | --- | --- |
  | `npx tsc --noEmit` (final tree) | 0 | - | clean | - |
  | `npm run build` (final tree; also before batches 1 to 3) | 0 | 34s | manifest, capability graph and pin regenerated; the regenerated contracts differ from `0c362da15` only in digest and reference fields | - |
  | `npm run lint:imports` (final tree) | 0 | 0s | 28 modules | - |
  | `npm run lint:lifecycle` (final tree) | 0 | 0s | 284 modules, 10 allow-listed, no offender | - |
  | `npm run test:installed:language` (final tree) | 0 | 46s | 1/1 | - |

  Batch 1 (the named lanes and one lane per edited family):

  | lane | rc | wall | result | against the baseline |
  | --- | --- | --- | --- | --- |
  | `t287-value-equality` (shared/value) | 0 | 1s | 4 tests, 4 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-common-computational-library` (shared, product/semantics, public/binding) | 0 | 0s | 7 tests, 7 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-select-family` (shared/select) | 0 | 0s | 7 tests, 7 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-calculus-fold` (abg calculus) | 0 | 2s | 6 tests, 6 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-consensus-ref-shape` (gtl/consensus) | 0 | 0s | 2 tests, 2 pass, 0 fail, 0 skip | includes the new `:1248` case |
  | `m5-consensus-module` (gtl/consensus, implementation/consensus) | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | same set and first error lines as the log |
  | `t287-native-frame-observation` (repair A case; abg/runtime_liveness) | 1 | 1s | 8 tests, 1 pass, 3 fail, 4 skip; fails at :189, :209, :237 | same three failures as repair A's return (`:189` explicit proof-local territory, an undefined path argument, a falsy assertion) |
  | `m5-event-store-reopen` (abg/event_store) | 0 | 61s | 18 tests, 18 pass, 0 fail, 0 skip | no failure in the log: same |
  | `m5-retry-lifecycle-authority` (abg/retry, hog/retry_lifecycle) | 1 | 1s | 9 tests, 4 pass, 5 fail, 0 skip; fails at :21, :238, :281, :323, :533 | same set and first error lines as the log |
  | `t287-lifecycle-failure-carrier` (hog lifecycles) | 0 | 0s | 5 tests, 5 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-native-semantic-revision` (abg/semantic_revision, instruction_assembly) | 1 | 1s | 9 tests, 4 pass, 4 fail, 1 skip; fails at :122, :270, :332, :531 | same set and first error lines as the log |
  | `t287-ordered-reconstruction` (abg/replay) | 1 | 1s | 7 tests, 0 pass, 4 fail, 3 skip; fails at :22, :74, :103, :158 | same set and first error lines as the log |
  | `t287-reconstruction-conservation` (abg/replay) | 0 | 0s | 2 tests, 0 pass, 0 fail, 2 skip | no failure in the log: same |
  | `r10-projection-contracts` (abg/project_read_ports) | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | same set and first error lines as the log |
  | `m5-s03-authority` (product/semantics) | 1 | 65s | 5 tests, 1 pass, 4 fail, 0 skip; fails at :96, :218, :285, :415 | same set and first error lines as the log |
  | `t287-generic-job-lifecycle` (product/semantic_job) | 0 | 1s | 1 tests, 0 pass, 0 fail, 1 skip | no failure in the log: same |
  | `t287-cross-cut-public-read` (public) | 1 | 86s | 5 tests, 4 pass, 1 fail, 0 skip; fails at :105 | same set and first error lines as the log |
  | `t287-w2-05-static-binding-algebra` (public/binding) | 0 | 0s | 5 tests, 3 pass, 0 fail, 2 skip | no failure in the log: same |
  | `t287-st2a-g-capability-definition-graph` (product contracts, capability graph) | 1 | 62s | 4 tests, 2 pass, 2 fail, 0 skip; fails at :74, :271 | same set and first error lines as the log |
  | `t287-malformed-gtl-gate` (validator, gtl) | 1 | 1s | 6 tests, 5 pass, 1 fail, 0 skip; fails at :60 | same set and first error lines as the log |
  | `m5-event-calculus-runtime` (abg/c_call, continuation) | 1 | 274s | 19 tests, 13 pass, 5 fail, 1 skip; fails at :372, :1316, :1471, :1548, :1590 | same set and first error lines as the log |
  | `witness-reprice-definition-binding` (abg/witness_admission_operation) | 1 | 1s | 15 tests, 0 pass, 15 fail, 0 skip; fails at :27, :36, :67, :77, :94, :102, :112, :118, :124, :129, :147, :162, :169, :205, :226 | not in the log; at `0c362da15` the same set and first error lines (fixture preconditions) |
  | `witness-run-stopped-definition-binding` (abg/witness_admission_operation) | 1 | 1s | 7 tests, 0 pass, 7 fail, 0 skip; fails at :31, :65, :77, :89, :96, :102, :117 | not in the log; at `0c362da15` the same set and first error lines (fixture preconditions) |
  | `t287-native-c2-instruction-assembly` (abg/instruction_assembly) | 0 | 0s | 1 tests, 1 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t288-instruction-assembly-owner` (abg/instruction_assembly) | 0 | 0s | 11 tests, 4 pass, 0 fail, 7 skip | not in the log; no failure |
  | `t287-default-library` (product/default_library, abg/default_library) | 0 | 3s | 20 tests, 17 pass, 0 fail, 3 skip | not in the log; no failure |
  | `t287-native-work-unknown-effect` (abg/native_work_effect) | 0 | 2s | 10 tests, 10 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-route-reconstruction` (hog/route_proposal, abg/traversal_route) | 0 | 3s | 9 tests, 7 pass, 0 fail, 2 skip | not in the log; no failure |
  | `t287-retry-run-prefix` (abg/retry) | 1 | 0s | 3 tests, 0 pass, 3 fail, 0 skip; fails at :59, :92, :107 | not in the log; at `0c362da15` the same set and first error lines (fixture preconditions) |
  | `t287-governance-covered-source-use` (governance (abg/invocation_execution_truth)) | 1 | 1s | 8 tests, 2 pass, 3 fail, 3 skip; fails at :351, :386, :430 | not in the log; at `0c362da15` the same set and first error lines (fixture preconditions) |
  | `t287-d1-semantic-stage` (product/semantic_stage) | 0 | 0s | 3 tests, 1 pass, 0 fail, 2 skip | not in the log; no failure |
  | `t287-qualification-law` (validator/qualification) | 0 | 1s | 6 tests, 2 pass, 0 fail, 4 skip | not in the log; no failure |
  | `m5-worker-transport` (abg/worker_transport) | 0 | 6s | 21 tests, 21 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-worksite-command-execution` (product, implementation worksite_command_execution) | 1 | 117s | 4 tests, 3 pass, 1 fail, 0 skip; fails at :407 | same set and first error lines as the log |
  | `t287-observed-worksite-command` (implementation/worksite_command_helper) | 1 | 2s | 8 tests, 7 pass, 1 fail, 0 skip; fails at :43 | same set and first error lines as the log |

  Batch 2: 92 rows. 89 are the lanes that import a module holding an (A) site and were not in batch 1. The other three are reruns on the final tree: `t287-qualification-law`, `t287-qualification-producer-context` and `t287-malformed-gtl-gate`. The nine qualification lanes show their final-tree run, and `t287-worksite-construction` its isolated rerun.

  | lane | rc | wall | result | against the baseline |
  | --- | --- | --- | --- | --- |
  | `d1-preserved-result` | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `d1-preserved-result-mechanics` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `d2-acknowledgment` | 1 | 0s | 4 tests, 0 pass, 4 fail, 0 skip; fails at :17, :34, :51, :81 | not in the log; at `0c362da15` the same set and first error lines |
  | `d2-binding-query-reuse` | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `d2-binding-transition` | 1 | 1s | 10 tests, 0 pass, 10 fail, 0 skip; fails at :6, :148, :172, :191, :208, :232, :247, :269, :289, :303 | not in the log; at `0c362da15` the same set and first error lines |
  | `d2-bounded-repair` | 1 | 2s | 12 tests, 7 pass, 5 fail, 0 skip; fails at :10, :56, :66, :77, :103 | not in the log; at `0c362da15` the same set and first error lines |
  | `d4-s01-program-owner` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `generic-input-retention` | 1 | 0s | 4 tests, 2 pass, 2 fail, 0 skip; fails at :82, :132 | not in the log; at `0c362da15` the same set and first error lines |
  | `integration-shared-seams` | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `m5-terminal-quiescence-owner` | 0 | 0s | 7 tests, 7 pass, 0 fail, 0 skip | no failure in the log: same |
  | `r10-child-proof` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `r3-workspace-binding` | 1 | 5s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :85 | not in the log; at `0c362da15` the same set and first error lines |
  | `r9-causal-result-closure` | 1 | 82s | 2 tests, 0 pass, 2 fail, 0 skip; fails at :53, :721 | not in the log; at `0c362da15` the same set and first error lines |
  | `retained-route-cursor-transition` | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :26 | not in the log; at `0c362da15` the same set and first error lines |
  | `runtime-scope-regressions` | 0 | 79s | 2 tests, 2 pass, 0 fail, 0 skip | not in the log; no failure |
  | `steel-basic-cli-c2` | 0 | 0s | 6 tests, 0 pass, 0 fail, 6 skip | not in the log; no failure |
  | `t287-authenticated-owner-values` | 1 | 1s | 3 tests, 1 pass, 1 fail, 1 skip; fails at :39 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-c0-correction-regressions` | 1 | 88s | 4 tests, 3 pass, 1 fail, 0 skip; fails at :42 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-c0-post-publication-failure` | 0 | 2275s | 31 tests, 31 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-c2-core-environment` | 0 | 1s | 3 tests, 3 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-c2-owner-coordinate-reuse` | 1 | 1s | 6 tests, 0 pass, 6 fail, 0 skip; fails at :120, :195, :212, :227, :238, :266 | same set and first error lines as the log |
  | `t287-calculus-state-transfer` | 1 | 571s | 8 tests, 3 pass, 3 fail, 0 skip; fails at :64, :70 | same set as the log; parent `:64` same first error; subtest `:70` reports "could not be started because its parent finished" where the log reports "did not finish before its parent and was cancelled" |
  | `t287-cold-record-decoder` | 1 | 1s | 3 tests, 1 pass, 1 fail, 1 skip; fails at :77 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-continuation-causation` | 0 | 0s | 1 tests, 1 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-d1-requirement-handoff` | 0 | 1s | 5 tests, 2 pass, 0 fail, 3 skip | not in the log; no failure |
  | `t287-default-library-fulfillment` | 0 | 1s | 7 tests, 7 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-deferred-application-restoration` | 1 | 1s | 2 tests, 0 pass, 2 fail, 0 skip; fails at :85, :116 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-event-body-encoding` | 0 | 14s | 14 tests, 14 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-event-calculus-owner-continuation` | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | same set and first error lines as the log |
  | `t287-generic-job-meaning` | 0 | 0s | 5 tests, 3 pass, 0 fail, 2 skip | not in the log; no failure |
  | `t287-generic-job-parent-foldback` | 0 | 0s | 1 tests, 0 pass, 0 fail, 1 skip | not in the log; no failure |
  | `t287-generic-job-read-dependency` | 0 | 1s | 2 tests, 1 pass, 0 fail, 1 skip | not in the log; no failure |
  | `t287-generic-job-revision` | 0 | 0s | 4 tests, 1 pass, 0 fail, 3 skip | not in the log; no failure |
  | `t287-held-prefix` | 0 | 1s | 6 tests, 0 pass, 0 fail, 6 skip | not in the log; no failure |
  | `t287-historical-source-resource` | 1 | 37s | 2 tests, 1 pass, 1 fail, 0 skip; fails at :64 | not in the log; at `0c362da15`, with the ignored fixture `installed-frame-01` linked in, the same set and first error line |
  | `t287-installed-product-coordinate` | 0 | 1s | 11 tests, 11 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-interrupted-event-resource-recovery` | 1 | 4s | 8 tests, 6 pass, 2 fail, 0 skip; fails at :74, :136 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-json-value-definition` | 0 | 0s | 1 tests, 1 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-management-context` | 0 | 1s | 14 tests, 12 pass, 0 fail, 2 skip | not in the log; no failure |
  | `t287-management-stream-drain` | 0 | 5s | 8 tests, 4 pass, 0 fail, 4 skip | not in the log; no failure |
  | `t287-native-assessment-evidence` | 1 | 0s | 4 tests, 1 pass, 3 fail, 0 skip; fails at :551, :559, :585 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-native-runtime-gate` | 0 | 1s | 7 tests, 6 pass, 0 fail, 1 skip | no failure in the log: same; rerun on the final tree |
  | `t287-native-selection-profile-scope` | 0 | 1s | 4 tests, 4 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-native-structural-gates` | 0 | 3s | 9 tests, 9 pass, 0 fail, 0 skip | no failure in the log: same; rerun on the final tree |
  | `t287-native-work-currentness-consumers` | 0 | 5s | 2 tests, 2 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-native-work-reacquisition` | 0 | 1s | 9 tests, 6 pass, 0 fail, 3 skip | not in the log; no failure |
  | `t287-native-work-reacquisition-normalization` | 1 | 0s | 2 tests, 1 pass, 1 fail, 0 skip; fails at :21 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-native-worksite-execution` | 0 | 1s | 6 tests, 3 pass, 0 fail, 3 skip | not in the log; no failure |
  | `t287-native-workspace-work` | 0 | 2s | 38 tests, 37 pass, 0 fail, 1 skip | not in the log; no failure |
  | `t287-owned-native-proof` | 0 | 1s | 1 tests, 0 pass, 0 fail, 1 skip | not in the log; no failure |
  | `t287-owned-process-lifetime` | 0 | 2s | 18 tests, 18 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-post-binding-worksite-write` | 1 | 78s | 2 tests, 1 pass, 1 fail, 0 skip; fails at :244 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-predecessor-context` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-public-terminal-projection` | 1 | 1s | 4 tests, 0 pass, 4 fail, 0 skip; fails at :34, :50, :68, :87 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-qual056-material` | 0 | 3s | 7 tests, 7 pass, 0 fail, 0 skip | not in the log; no failure; rerun on the final tree |
  | `t287-qualification-carrier-resource` | 0 | 1s | 7 tests, 0 pass, 0 fail, 7 skip | not in the log; no failure |
  | `t287-qualification-contraction` | 0 | 1s | 4 tests, 4 pass, 0 fail, 0 skip | not in the log; no failure; rerun on the final tree |
  | `t287-qualification-fp-proof-delivery` | 0 | 0s | 1 tests, 0 pass, 0 fail, 1 skip | not in the log; no failure |
  | `t287-qualification-parent-alias` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :18 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-qualification-producer-acquisition-reuse` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines; rerun on the final tree |
  | `t287-qualification-raw-contract-preimage` | 0 | 0s | 1 tests, 0 pass, 0 fail, 1 skip | not in the log; no failure |
  | `t287-qualification-scopes` | 0 | 1s | 17 tests, 17 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-r6-retry-success-exit` | 0 | 0s | 1 tests, 1 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-reacquisition-root-contract` | 1 | 1s | 2 tests, 0 pass, 1 fail, 1 skip; fails at :39 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-release-acceptance` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines; rerun on the final tree |
  | `t287-release-publication` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-result-evidence-lineage-projection` | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :215 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-runtime-activity-quiescence` | 0 | 0s | 1 tests, 1 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-runtime-failure-diagnostic` | 0 | 2s | 11 tests, 11 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-selected-action-authority` | 1 | 1s | 3 tests, 2 pass, 1 fail, 0 skip; fails at :35 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-st1-installed-cross-owner-hello` | 1 | 237s | 2 tests, 0 pass, 2 fail, 0 skip; fails at :116, :737 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-stdo-environment-citation` | 1 | 2s | 2 tests, 0 pass, 1 fail, 1 skip; fails at :16 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-stdo-run-environment` | 1 | 2s | 2 tests, 0 pass, 1 fail, 1 skip; fails at :87 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-undispatched-diagnostic` | 1 | 6s | 7 tests, 5 pass, 2 fail, 0 skip; fails at :93, :222 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-w2-05-install-catalog-owner-chain` | 1 | 41s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :286 | same set and first error lines as the log |
  | `t287-wave2-owner-contract-source-set` | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | same set and first error lines as the log |
  | `t287-worksite-construction` | 1 | 81s | 3 tests, 0 pass, 3 fail, 0 skip; fails at :217, :361, :688 | not in the log; at `0c362da15` the same set and first error lines, with digests, timings, temporary paths and inodes masked; rerun alone (the first run timed out at `:361` and `:688` under load) |
  | `t288-blocked-retry-entry` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :8 | not in the log; at `0c362da15` the same set and first error lines |
  | `t288-composition-conservation` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `t288-initial-cursor-entry` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :8 | not in the log; at `0c362da15` the same set and first error lines |
  | `t288-logical-prefix-digest` | 1 | 1s | 2 tests, 0 pass, 2 fail, 0 skip; fails at :16, :35 | not in the log; at `0c362da15` the same set and first error lines |
  | `t288-prefix-structure` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `t288-scoped-retry-guard` | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :12 | not in the log; at `0c362da15` the same set and first error lines |
  | `t288-workflow-scope-conservation` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `t289-install-event-bodies` | 1 | 0s | 4 tests, 0 pass, 4 fail, 0 skip; fails at :121, :323, :377, :435 | not in the log; at `0c362da15` the same set and first error lines |
  | `w2-steel-serial-branch-installed` | 0 | 0s | 2 tests, 0 pass, 0 fail, 2 skip | not in the log; no failure |
  | `w2-steel-single-start` | 1 | 0s | 8 tests, 6 pass, 1 fail, 1 skip; fails at :118 | not in the log; at `0c362da15` the same set and first error lines |
  | `w2-steel-single-start-closure` | 0 | 0s | 8 tests, 0 pass, 0 fail, 8 skip | not in the log; no failure |
  | `w2-steel-single-start-installed` | 0 | 0s | 1 tests, 0 pass, 0 fail, 1 skip | not in the log; no failure |
  | `t287-qualification-law` | 0 | 1s | 6 tests, 2 pass, 0 fail, 4 skip | not in the log; no failure; rerun on the final tree |
  | `t287-malformed-gtl-gate` | 1 | 0s | 6 tests, 5 pass, 1 fail, 0 skip; fails at :60 | same set and first error lines as the log; rerun on the final tree |
  | `t287-qualification-producer-context` | 0 | 1s | 4 tests, 4 pass, 0 fail, 0 skip | not in the log; no failure; rerun on the final tree |

  Batch 3 (the tree before the `presentMember` restorations, which return those sites to the `0c362da15` answer): 36 lanes that batches 1 and 2 did not run. 33 reach a module holding an (A) site through a `test_env/support` helper (a helper that imports the module or names its built path), and three more load owners into a separate VM realm. With batches 1 and 2 this covers every lane that loads owners into a separate realm (77 lanes).

  | lane | rc | wall | result | against the baseline |
  | --- | --- | --- | --- | --- |
  | `d2-evidence-owner` | 1 | 0s | 2 tests, 0 pass, 2 fail, 0 skip; fails at :7, :27 | not in the log; at `0c362da15` the same set and first error lines |
  | `d2-evidence-owner-lookup` | 1 | 0s | 9 tests, 0 pass, 9 fail, 0 skip; fails at :8, :19, :22, :27, :39 | not in the log; at `0c362da15` the same set and first error lines |
  | `d2-historical-design` | 1 | 2s | 14 tests, 10 pass, 4 fail, 0 skip; fails at :8, :27, :35, :89 | not in the log; at `0c362da15` the same set and first error lines |
  | `d2-workflow-step` | 1 | 0s | 9 tests, 0 pass, 9 fail, 0 skip; fails at :9, :22, :29, :42, :52, :65, :98, :108, :118 | not in the log; at `0c362da15` the same set and first error lines |
  | `forward-command-contracts` | 0 | 1s | 8 tests, 8 pass, 0 fail, 0 skip | in the log, no failure there: same |
  | `forward-command-owners` | 1 | 0s | 6 tests, 2 pass, 4 fail, 0 skip; fails at :7, :22, :37, :45 | same set and first error lines as the log |
  | `m5-fresh-process-reconstruction` | 1 | 40s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :13 | same set and first error lines as the log |
  | `r5-invocation-admission` | 1 | 76s | 3 tests, 0 pass, 3 fail, 0 skip; fails at :15, :100, :598 | not in the log; at `0c362da15` the same set and first error lines |
  | `r6-implementation-resolution` | 1 | 42s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :14 | not in the log; at `0c362da15` the same set and first error lines |
  | `r7-graph-validation-basis` | 0 | 158s | 1 tests, 1 pass, 0 fail, 0 skip | not in the log; no failure |
  | `r8-direct-hog-entry` | 1 | 39s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :19 | not in the log; at `0c362da15` the same set and first error lines |
  | `rival-authority-mutations` | 1 | 85s | 3 tests, 1 pass, 2 fail, 0 skip; fails at :54, :78 | not in the log; at `0c362da15` the same set and first error lines |
  | `steel-basic-cli-source-replay` | 0 | 0s | 2 tests, 0 pass, 0 fail, 2 skip | not in the log; no failure |
  | `t287-conformance-owner-reuse` | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | same set and first error lines as the log |
  | `t287-declared-testing-capability` | 1 | 38s | 7 tests, 5 pass, 1 fail, 1 skip; fails at :174 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-exact-construction-intent` | 0 | 72s | 1 tests, 1 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-exact-prefix-projection-reuse` | 1 | 0s | 2 tests, 0 pass, 1 fail, 1 skip; fails at :14 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-f04a-probabilistic-result-candidate` | 1 | 40s | 2 tests, 1 pass, 1 fail, 0 skip; fails at :356 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-fh-hold-open` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-generic-job-intake` | 1 | 32s | 2 tests, 0 pass, 1 fail, 1 skip; fails at :12 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-generic-job-parent-audit` | 0 | 0s | 1 tests, 0 pass, 0 fail, 1 skip | not in the log; no failure |
  | `t287-generic-job-worksite` | 0 | 1s | 9 tests, 9 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-live-worksite-construction` | 0 | 0s | 1 tests, 0 pass, 0 fail, 1 skip | not in the log; no failure |
  | `t287-management-supervision` | 1 | 33s | 5 tests, 4 pass, 1 fail, 0 skip; fails at :105 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-native-event-time` | 1 | 0s | 6 tests, 0 pass, 4 fail, 2 skip; fails at :30, :66, :86, :108 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-native-frame-route-conservation` | 1 | 1s | 3 tests, 0 pass, 3 fail, 0 skip; fails at :5, :10, :14 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-native-owner-reuse` | 0 | 0s | 3 tests, 0 pass, 0 fail, 3 skip | not in the log; no failure |
  | `t287-native-registered-selection` | 0 | 0s | 1 tests, 0 pass, 0 fail, 1 skip | not in the log; no failure |
  | `t287-native-semantic-job` | 1 | 1s | 9 tests, 8 pass, 1 fail, 0 skip; fails at :224 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-recursive-registered-selection` | 1 | 49s | 4 tests, 2 pass, 1 fail, 1 skip; fails at :129 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-registered-graph-selection` | 1 | 37s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :15 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-selected-action` | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-selected-execution-closure` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-st2a-e-exact-prefix-workspace-environment` | 0 | 41s | 1 tests, 1 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-wave2-installed-product-verification` | 0 | 83s | 1 tests, 1 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-worksite-branch-construction` | 1 | 108s | 2 tests, 0 pass, 2 fail, 0 skip; fails at :584, :669 | not in the log; at `0c362da15` the same set and first error lines, with digests, timings and the prefix byte length masked (the byte length differs between two runs of the final tree) |

  Batch 4 (final tree): the lanes of the owners the `presentMember` restorations edit (`shared/canonical_json`, `abg/c_call`, `construction_continuation`, `retry`, `semantic_job`, `semantic_revision`, `semantic_stage`, `worksite_construction_recovery`, `worksite_revision`, `implementation/release_publication`), with the named library lanes and `m5-worker-transport` again, and the lanes whose subject is the `shared/value` surface or the declaration inventory (`t287-json-value-definition`, `t287-event-body-encoding`, `t287-select-family`, `t287-st2a-g-capability-definition-graph`).

  | lane | rc | wall | result | against the baseline |
  | --- | --- | --- | --- | --- |
  | `t287-value-equality` | 0 | 1s | 4 tests, 4 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-common-computational-library` | 0 | 0s | 7 tests, 7 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-consensus-ref-shape` | 0 | 0s | 2 tests, 2 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-native-semantic-revision` | 1 | 2s | 9 tests, 4 pass, 4 fail, 1 skip; fails at :122, :270, :332, :531 | same set and first error lines as the log |
  | `t287-generic-job-revision` | 0 | 0s | 4 tests, 1 pass, 0 fail, 3 skip | not in the log; no failure |
  | `t287-generic-job-worksite` | 0 | 0s | 9 tests, 9 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-native-semantic-job` | 1 | 1s | 9 tests, 8 pass, 1 fail, 0 skip; fails at :224 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-d1-semantic-stage` | 0 | 1s | 3 tests, 1 pass, 0 fail, 2 skip | not in the log; no failure |
  | `t287-generic-job-meaning` | 0 | 0s | 5 tests, 3 pass, 0 fail, 2 skip | not in the log; no failure |
  | `t287-generic-job-read-dependency` | 0 | 1s | 2 tests, 1 pass, 0 fail, 1 skip | not in the log; no failure |
  | `t287-generic-job-parent-foldback` | 0 | 0s | 1 tests, 0 pass, 0 fail, 1 skip | not in the log; no failure |
  | `m5-retry-lifecycle-authority` | 1 | 0s | 9 tests, 4 pass, 5 fail, 0 skip; fails at :21, :238, :281, :323, :533 | same set and first error lines as the log |
  | `t287-retry-run-prefix` | 1 | 0s | 3 tests, 0 pass, 3 fail, 0 skip; fails at :59, :92, :107 | not in the log; at `0c362da15` the same set and first error lines |
  | `m5-worker-transport` | 0 | 6s | 21 tests, 21 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-release-publication` | 1 | 0s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-release-acceptance` | 1 | 1s | 1 tests, 0 pass, 1 fail, 0 skip; fails at :1 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-exact-construction-intent` | 0 | 73s | 1 tests, 1 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-continuation-causation` | 0 | 0s | 1 tests, 1 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-selected-action-authority` | 1 | 2s | 3 tests, 2 pass, 1 fail, 0 skip; fails at :35 | not in the log; at `0c362da15` the same set and first error lines |
  | `t287-native-work-reacquisition` | 0 | 0s | 9 tests, 6 pass, 0 fail, 3 skip | not in the log; no failure |
  | `forward-command-owners` | 1 | 1s | 6 tests, 2 pass, 4 fail, 0 skip; fails at :7, :22, :37, :45 | same set and first error lines as the log |
  | `t287-worksite-construction` | 1 | 80s | 3 tests, 0 pass, 3 fail, 0 skip; fails at :217, :361, :688 | not in the log; at `0c362da15` the same set and first error lines, with digests, timings, temporary paths and inodes masked |
  | `m5-event-calculus-runtime` | 1 | 158s | 19 tests, 13 pass, 5 fail, 1 skip; fails at :372, :1316, :1471, :1548, :1590 | same set and first error lines as the log |
  | `t287-json-value-definition` | 0 | 1s | 1 tests, 1 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-event-body-encoding` | 0 | 13s | 14 tests, 14 pass, 0 fail, 0 skip | not in the log; no failure |
  | `t287-select-family` | 0 | 0s | 7 tests, 7 pass, 0 fail, 0 skip | no failure in the log: same |
  | `t287-st2a-g-capability-definition-graph` | 1 | 34s | 4 tests, 2 pass, 2 fail, 0 skip; fails at :74, :271 | same set and first error lines as the log |

  - No new failure set on the final tree. In batch 2, `t287-native-runtime-gate` `:45` failed (`qualificationResultRelation` answered `false` for a realm-foreign record). The realm restorations (`stop: channel`) repair it, and on the final tree the lane matches the log.
  - Lanes outside the log that fail do so identically at `0c362da15`: fixture preconditions (missing frozen fixtures or ignored carriers), import errors and assertions that hold at both.
- Residuals:
  - 55 casts outside the sink census remain. Among them are four casts of `any` parse results (`gtl/declarations.ts:49`, `validator/raw_admission.ts:205`, `product/worksite_command_execution.ts:1097`, `implementation/worksite_command_helper.ts:1230`) and the `as unknown as` views of typed owner objects in `abg/project_read_ports.ts` and `public/installed_public_definition_call.ts`.
  - The tracer does not resolve method receivers (`product.canonicalJson`), callees outside `code/src`, or flows through a `Map`. The ticket's list covered the receiver case it named.
  - Decision for the Executive, realm: `admitJson` refuses a plain record of another realm, and `canonicalEquals` does not. Every (A) site therefore refuses a realm-foreign record that `0c362da15` compared. `code/src` creates no second realm (no `node:vm`). 161 lanes ran in this gate, 77 of them loading owners or harnesses into a separate VM realm. Only one result changed through a realm-foreign record: the qualification fixture's, at the four `stop: channel` casts. Every other lane keeps the failure set of the log or of `0c362da15`. A realm-foreign record that no lane builds can still reach an (A) site. A realm-independent plain-record check in `shared/admit` (§4.1) discharges the four stops and removes the hazard at every (A) site.
  - Decision for the Executive: design §10.3 O-SCHEMA says "No other ingress takes a stricter I-JSON policy." That now conflicts with the O-TYPE row: the 179 (A) sites admit through `admitJson` at the site under D11, and `validator/raw_admission.ts` `rawAdmitValue` admits every raw kind as I-JSON, where before only the structural kinds were admitted. The O-SCHEMA cell is outside this grant; the sentence needs the Executive's reading (scope it to Product boundary ingress, or name the D11 site admissions).
  - The consensus guard and evaluator edits in `gtl/consensus.ts` rest on `t287-consensus-ref-shape` (2 tests). `m5-consensus-module` fails at import (`ROOT_PUBLIC_OPERATION_IDS` is not exported by `public/index.js`), as in `step-8-run-final.log`.
  - The ticket's step 4 residual line still names "the `JsonValue` casts of the O-TYPE open list"; that line is outside the O-TYPE bullet.
  - 460 interfaces on the census rows' type paths are now type aliases, so they are `JsonValue`-assignable. This changes the exported `.d.ts` declarations, and the declaration-inventory digests with them, with no runtime effect.
  - Shallow record guards remain where the members' owners narrow them (O-SHAPE).
  - Local admission helpers remain duplicated across modules: `admittedDigestIs`, `sameAdmitted`, `projectionIs`, `outputIs`, `preparedFor`.
  - `presentMember` is a new export of `shared/canonical_json.ts`, and `shared/value` re-exports that module whole, so it joins the `derive` family surface. Design §4.3 does not name it and is outside this grant: the Executive ratifies it there or moves it.
  - Decision for the Executive, valueless result events: four lookups (`abg/semantic_job.ts` `validateWorksiteFileParentsPlanAtPrefix`, `abg/semantic_revision.ts` `semanticJobRevisionInputMatchesBasis` and `semanticRevisionInputMatchesBasis`, `abg/worksite_construction_recovery.ts` `nativeWorksiteRecoverySourceAtPrefix`) answer `false` when any `c_call_result_admitted` event in scope lacks `value`, which the payload contract allows; the other restored lookups throw. This repair keeps the `0c362da15` answer. Delta: filter the events without `value` before the comparison, so that such an event does not match and the lookup answers from the rest.
  - The widening check covers each added `undefined` branch and its direct caller: a branch that answers a refusal of its function was checked at each call site for a caller that turns that refusal into a dropped element. Callers further up were not traced.
  - The new explicit-member checks in `abg/witness_admission_operation.ts` (reprice `reason`; run-resumed and run-stopped `reasonKind`/`reasonDetail`) have no passing case: both witness lanes fail on fixture preconditions here and at `0c362da15`.
  - The five stopped subjects encode `RuntimeHistorySelection` as `{}` until their contract carries the prefix coordinate.

## Disposition of repair C (Executive, 2026-10-23)

Accepted at `99b80d6f5`. Read: the Return against the activation's items; the census table's stop rows; the (A) channel at `product/worksite_command_forward.ts:114` and `:152` and both `sameJson` bodies; the five `stop: contract` sites and their `recursionFailure` / `failWorkflow` paths; the design §10.3 O-TYPE row; the ticket and GOALS diffs; the two tests. Executive check on the head: `tsc --noEmit` rc 0; `lint:imports` 28 modules rc 0; `lint:lifecycle` 284 modules, 10 allow-listed, no offender, rc 0; `t287-common-computational-library` 7/7; `t287-consensus-ref-shape` 2/2; `t287-native-runtime-gate` 6 pass, 1 skip; tree clean.

| Return item | Disposition |
|---|---|
| Census: 2951 casts, 2737 sink rows; T 2347, I 202, A 179; 9 stops; 159 no-sink casts typed with them, 55 kept | accepted; the table is the record |
| (A) channels; 27 absent-member refusals; 16 `presentMember` throws; 22 `exactOptional` members | accepted as realized; `presentMember` needs its §4.3 entry (B) |
| Tests: `sameJson` function member and cycle; leaf unsafe integer; consensus `:1248` | accepted |
| Gate: tsc, build, lints, smoke; 161 lanes in four batches | accepted against the final log and `0c362da15`; the lanes outside the 44-file list are attributed to `0c362da15` only, not to the pre-plan baseline (B item 8) |
| Decision 1, realm | D12: `admitJson` admits a plain record or array of any realm by structure; the four `stop: channel` sites take (A) in B |
| Decision 2, the O-SCHEMA sentence | record fix in B (§10.3 O-SCHEMA row) |
| Decision 3, valueless result events | D13: at the four lookups a `c_call_result_admitted` event without `value` is not a candidate; B |
| Decision 4, `presentMember` without a §4.3 entry | B adds the entry; the rule stays as the O-TYPE row states it |
| `stop: contract`, 5 sites | a contract decision, D14, for Jim with the Executive's recommendation; the casts stay until he rules |
| Ticket and GOALS "O-TYPE is closed (D11)" | overstated at `99b80d6f5`: nine casts keep the cast; B restates it as closed at every site but five, which hold D14 |

Order from here: B (items below), then the closing post restated, then the independent review.

## Post-close repair activation B (Executive, 2026-10-23; D12, D13)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Head is the Executive's bookkeeping commit after repair C (`## Disposition of repair C` above). Read this section; `## Post-close review` items 1 and 3 and `## Disposition of the post-close review` rows 1 and 3; `## Post-close repair return C` (its stopped rows, its `presentMember` paragraph, its batch 2 to 4 tables) and `## Disposition of repair C`; the plan post's decisions D12, D13 and D14 (`.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, `## Decisions Jim owns`); design §4.1, §4.3, §4.4, §4.6, §9.3 item 4, §10.3 O-SCHEMA and O-TYPE rows, §10.5 P-FOLD and P-LIFECYCLE, §10.6 row 6; the helper cases of `test_env/tests/t287-lifecycle-failure-carrier.test.mjs` (`:298`, `:337`); `code/src/implementation/worksite_command_helper.ts` `main` (`:1366` to the end) and the throw sites inside `runCommand` and the HTTP probe that carry `processFacts`; `code/src/implementation/worksite_command_execution.ts` `failure` (`:233`) and the completion path (`:690-780`); the helper artifact's constructor and validator (`constructWorksiteExecutionHelperArtifact`, `isWorksiteExecutionHelperArtifact`; find them by grep); the `LeafRealizationCandidate` type and its `evidenceCandidates`; step 7's "no contract change" check (`step-7.md`, review item 3h). Tenant root `build_tenants/abiogenesis/typescript`; every test runs with `node --experimental-vm-modules --test --test-concurrency=1`; `npm run build` before any installed lane (a stale manifest refuses with `product_content_mismatch`); macOS has no `timeout`. The baseline worktree is built at `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/c5e4c12f-3ef0-4d89-89e0-6d0073419181/scratchpad/wt-base-97b1200bc/build_tenants/abiogenesis/typescript` (`97b1200bc`; a lane that reads a gitignored fixture needs it linked in, as return 8a and return C did). Change class: `realization_refactor` with the design wording the items name; a contract change is a stop. D14's five casts (`hog/recursion_lifecycle.ts:570`, `:1027`, `:1053`; `hog/workflow_lifecycle.ts:727`, `:1075`) are Jim's and are not touched.

Items, in this order. The Return carries one row per item: done or stopped, with lines at head.

1. **Streaming fold** (review finding 3; repair A item 2, stopped on the design sentence). Design §4.4 `:188`: replace the sentence from "Its `advance`" through "when the call ends" with: "Its `advance` (`abg/event_calculus.ts:238`) applies each new event in place with `applyStep` (`abg/calculus/fold.ts:191`), the in-place form of `foldStep` (`:261`), to the one working state the derivation owns, and copies nothing; `forkAt` copies once for the fork (`workingFoldState`, `:154`); readers read the owned state". Code: the derivation class owns one mutable working state across `advance` calls; `advance` applies the new events in place; `project` and `fluentAt` read the owned state; `forkAt` is the one copy. Hazards recorded by repair A: (a) `emptyFoldState` (`fold.ts:93`) shares module-constant Maps and Sets and freezes shallowly, so the owned state starts from `workingFoldState(emptyFoldState(...))`; (b) `forkAt` (`event_calculus.ts:187`) builds a frozen state with frozen arrays, so the fork takes one `workingFoldState` copy; (c) successive validated cuts of one source share one derivation, so N projections over increasing cuts are N single-event advances, and a batched comparison needs a separately selected copy of the rows or an internal hook; (d) `foldStep` also calls `workingFoldState`, so count copies only around the advances. P-FOLD lane unchanged and passing plus one streaming case (N single-event advances agree with one batched advance and the cold fold at every cut; a structural check that the per-advance copy is gone, through an `@internal` export not on the barrel). §10.5 P-FOLD: one sentence on the cost property.
2. **Realm admission (D12).** `shared/admit/json.ts` `isJsonObject` (`:57-60`) and the array prototype check in `admitArray` (`:89`) become realm-independent: a record is an object whose prototype is `null`, or whose prototype has a `null` prototype and an own `constructor` that is a function named `Object`; an array is one for which `Array.isArray` holds and whose prototype also satisfies `Array.isArray` (a subclass instance's prototype does not). `isRecord` is unchanged; it tests no prototype. The four `stop: channel` rows then take (A) on their channels: `abg/qualification_proof.ts` `sameFact` (both operands admitted; a refusal or a throw is `false`; `isDeepStrictEqual` stays), the response comparison in `projectQualificationRulingForConsumer` (`null`), and `validator/self_conformance_semantics.ts` `qualificationResultRelation` (`false`); the three "O-TYPE stop: channel" comments go; the census table's four rows read decision `A`, done. Test in `t287-common-computational-library`: a record and an array constructed in a `node:vm` context (`vm.runInNewContext("({ a: [1, { b: 2 }] })")`) are admitted and are `canonicalEquals` to their same-realm twins; a class instance constructed in that context is refused with `non_ijson_value`; the case fails on the head before the change. Design §4.1, one sentence after the table: "A plain record or array of any realm is admitted by structure; a prototype beyond a realm's `Object.prototype` or `Array.prototype` is refused (D12)." §10.3 O-TYPE row: the sentence "A comparison whose operand may be a record of another realm keeps its cast: `admitJson` refuses such a record, and that refusal is not the owner's channel." becomes "A record of another realm is admitted by structure (D12)." Rerun the qualification lanes repair C ran against its batch 2 results: `t287-native-runtime-gate`, `t287-malformed-gtl-gate`, `t287-qualification-law`, `t287-qualification-producer-context`, `t287-qualification-scopes`, `t287-qualification-contraction`, `t287-qual056-material`, `t287-qualification-parent-alias`, `t287-qualification-producer-acquisition-reuse`.
3. **Valueless result events (D13).** At the four lookups inside `catch { return false; }` that repair C named (`abg/semantic_job.ts` `validateWorksiteFileParentsPlanAtPrefix`; `abg/semantic_revision.ts` `semanticJobRevisionInputMatchesBasis` and `semanticRevisionInputMatchesBasis`; `abg/worksite_construction_recovery.ts` `nativeWorksiteRecoverySourceAtPrefix`), a `c_call_result_admitted` event whose payload lacks `value` is not a candidate: the filter tests the member's presence before comparing, and `presentMember` leaves those four sites; the other twelve `presentMember` sites stay. Test: one case, in the lane that already drives one of these lookups (find it by grep on the function name in `test_env/tests`; else in `t287-common-computational-library` over a constructed event set), where a valueless result event sits beside the matching one and the lookup answers the match; it fails on the head before the change. The census and undefined-branch tables: the four rows' channel cells restated. §10.3 O-TYPE row, after the `presentMember` sentence: "At the four result-event lookups a `c_call_result_admitted` event without `value` is not a candidate (D13)."
4. **Contract read first.** Record in the Return: (a) where the helper artifact's shape is pinned (its validator, any contract table, `contracts/capabilities/capability-definition-graph.json`, any stored digest or Product output contract); (b) where `worksite_command_execution_failure` results are consumed (grep `failureClass` and the kind); (c) whether a failure candidate's `evidenceCandidates` admit a record carrying the helper's failure subject. State the exact contract delta the handoff needs. Stop rule: if the delta touches an event contract, a payload key list, or a Product output contract pinned by an owner contract table or a stored digest, stop item 5 and write the delta in the Return for the Executive. If the delta is confined to the helper artifact's own disposition set and members and to the failure candidate the parent itself constructs, proceed.
5. **Handoff.** Helper: `main` catches the failures thrown after launch (the cleanup-unresolved throws and the first-error throw of the command and HTTP routes) and publishes the artifact with a failure disposition carrying the failure subject, `{ failureClass, taskRef, taskDigest, attemptRef, command or observation, diagnostic: { name, message }, processFacts }`, the facts as already encoded at the throw sites (no re-encoding), then exits non-zero as now; pre-launch failures (manifest admission) stay as they are. Parent: on a helper artifact with a failure disposition, return the failure candidate with the artifact's failure subject admitted through `admitJson` as the candidate's subject, in `evidenceCandidates` if (4c) allows, else as a member of the `resultCandidate` the parent constructs; `helper_artifact_absent` stays for a truly absent artifact. Then confirm by reading which admission the leaf failure candidate passes through on the C-call failure path and that the subject survives into the admitted failure event (name the event kind and the member), or state what blocks it.
6. **Scenario.** In `t287-lifecycle-failure-carrier`, one new case that drives the parent's completion path with a real helper child whose command fails after launch with unresolved cleanup (reuse the helper-case fixtures) and asserts: the candidate's disposition `failure`; the subject's `processFacts` present and equal to the helper's own child process facts, not the worker's; and, where the harness reaches it, the admitted failure event carrying the subject. If the full admission is out of the harness's reach, say so and what the case proves instead.
7. **Design records.** §9.3 item 4 restated to the realized mechanism (the helper publishes its failure as the artifact; the parent admits it as the failure subject; a thrown error alone never reaches `L`); §10.5 P-LIFECYCLE's helper clause and §10.6 row 6 consistent with it. §10.3 O-SCHEMA row: "No other ingress takes a stricter I-JSON policy." becomes "The (A) sites of O-TYPE apply the same domain at the site (D11); no other ingress takes a stricter policy." §4.3 table: a row for `presentMember` (`<T>(value: T | undefined) => T`; throws the canonical writer's TypeError for an absent member; used only where an absent member of a selected set must fault the owner rather than drop from the set, as the O-TYPE row states; home `shared/canonical_json.ts`, re-exported by `shared/value`). Smallest edits.
8. **Pre-plan attribution.** Every lane red in repair C's batches 2 to 4 that is not among the 44 files of `step-8-run-final.log`: run once at the baseline worktree; a table `lane | head failure set (test lines, first error line) | baseline failure set | same / seam`, with digests, timings, temporary paths and inodes masked as repair C masked them. A lane red at head and green or differently red at the baseline is a seam of this plan: name the step commit (`git log -S` over the ledger's code commits, or a bisect over them), one bounded attempt inside the grant at a fix, else stop that lane with the seam named. A lane that times out at both: say so. The table goes to `step-8-run-postclose-attribution.md` beside this file (committed); the counts go to the Return.
9. **Final run.** `npm run build`, `npm run lint:imports`, `npm run lint:lifecycle`; the lanes `t287-lifecycle-failure-carrier`, `t287-worksite-command-execution`, `t287-observed-worksite-command`, `m5-worker-transport`; then the 44 files of `step-8-run-final.log` plus `t287-native-frame-observation`, `t287-consensus-ref-shape`, `t287-common-computational-library`, `t287-native-runtime-gate` and `t287-malformed-gtl-gate` in one invocation, and `npm run test:uat:harness`; the three pre-existing failures of the frame-observation suite attributed at the baseline worktree (same failure set, or a seam of this plan with its step named); log to `step-8-run-postclose.log` beside this file (committed). Attribution as `## Activation 8a` rule 3 and the addendum: the final log's failure sets or better; a new failure returns to its seam, one bounded attempt inside the grant, else stop that item.
10. **Records.** The ticket's `### Library delivery close (2026-10-23)` subsection and `specification/GOALS.md`: item 4's state and the §9.3 mechanism; O-TYPE restated as closed at every census site but five (`hog/recursion_lifecycle.ts:570`, `:1027`, `:1053`; `hog/workflow_lifecycle.ts:727`, `:1075`), which hold D14 for the owner, the four realm stops closed under D12; the current reality at this commit. The plan ledger is the Executive's.

**Grant.** `abg/event_calculus.ts`, `abg/calculus/fold.ts`, `test_env/tests/t287-calculus-fold.test.mjs`, design §4.4 `:188` sentence and §10.5 P-FOLD (item 1); `shared/admit/json.ts`, `abg/qualification_proof.ts` (the three named comparisons), `validator/self_conformance_semantics.ts` (`qualificationResultRelation`), `test_env/tests/t287-common-computational-library.test.mjs`, design §4.1 sentence, the §10.3 O-TYPE row sentences items 2 and 3 name (items 2, 3); the four lookup functions items 3 names and the lane that drives one of them; `post-close-repair-c-census.tsv` and `post-close-repair-c-undefined-branches.tsv` (the rows items 2 and 3 name); `implementation/worksite_command_helper.ts` (`main`'s catch and the publication); `implementation/worksite_command_execution.ts` (`failure` and the completion path); the helper artifact constructor and validator modules; the scenario file; design §9.3 item 4, §10.5 P-LIFECYCLE, §10.6 row 6, §10.3 O-SCHEMA row sentence, §4.3 table row (item 7); `step-8-run-postclose-attribution.md`; the ticket subsection; the GOALS paragraph; the build outputs the gate regenerates; `step-8-run-postclose.log`; this file's `## Post-close repair return B`.

**Stop:** item 4's contract rule; a seam in item 8 that one bounded attempt does not close; an unattributable failure in item 9; anything outside the grant; D14's five casts.

**Return contract.** One commit on `main`, no push. First line `Post-close repair B: streaming fold; realm admission; helper failure handoff; final run`, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append `## Post-close repair return B` with: commit; the ten-item table (done or stopped, lines at head); item 4's contract findings; the scenario and what it proves; item 8's counts and any seam; the run with every failure attributed; residuals. The final report's first line is the qualified answer: what landed, what stopped.

## Post-close repair return B

No: the helper failure handoff did not land. Items 5 and 6 are stopped at item 4's contract rule under the Executive's note: the Product failure guard accepts an exact member set, so carrying the helper's failure facts into the parent's failure changes an accepted contract shape. Items 1, 2 and 3 landed (streaming fold without a per-advance state copy; realm admission D12, tightened under the note; valueless result events D13). Item 7 landed for the §4.3 row and the O-SCHEMA sentence; its helper sentences stay at head. Items 8, 9 and 10 are done; item 8 has one seam, stopped outside the grant.

- Commit: the commit carrying this Return (first line `Post-close repair B: streaming fold; realm admission; helper failure handoff; final run`, parent `2f1393061`, the Executive's plan-post commit on `837781a1a` that tightened D12's rule and took D14); its hash is in the final report. Not pushed. Staged by path. Path key: `T` = `build_tenants/abiogenesis/typescript`; `W` = this folder. Lines are at this commit unless marked.

| Item | State | Lines at head |
|---|---|---|
| 1, streaming fold | done | `T/code/src/abg/event_calculus.ts`: the owned working state `RuntimeEventCalculusDerivation.state` (built once per derivation by `workingFoldState`, `abg/calculus/fold.ts:154`); `advance` (`:241`) applies each event in place with `applyStep` (`fold.ts:191`); `forkAt` (`:189`) is the one copy; `@internal` accessor `runtimeEventCalculusStateForModuleTest` (`:306`, not on `abg/index.ts`); design §4.4 (now `:191`; the activation cites `:188`, and `advance` is at `:241`, not `:238`) and §10.5 P-FOLD; `T/test_env/tests/t287-calculus-fold.test.mjs:84` |
| 2, realm admission (D12) | done | `T/code/src/shared/admit/json.ts` `isRealmPrototype`, `isRealmObjectPrototype`, `isJsonObject`, `isRealmArrayPrototype` and `admitArray`; `abg/qualification_proof.ts` `sameFact` and `projectQualificationRulingForConsumer`; `validator/self_conformance_semantics.ts` `qualificationResultRelation`; census rows 1720, 1721, 1726, 1866; design §4.1, §10.3 O-TYPE; `T/test_env/tests/t287-common-computational-library.test.mjs:34` |
| 3, valueless result events (D13) | done | `abg/semantic_job.ts:262`, `abg/semantic_revision.ts:578`, `:812`, `abg/worksite_construction_recovery.ts:421`; census rows 1102-1103, 1524-1525, 1567-1568, 1653-1654; undefined-branch rows 59, 68, 70, 96; design §10.3 O-TYPE; `t287-common-computational-library.test.mjs:81` |
| 4, contract read | done; the delta changes the Product failure contract's accepted shape: stop | findings below |
| 5, handoff | stopped (item 4's rule; the Executive's note 3b) | no change; delta below |
| 6, scenario | stopped with item 5 | no change |
| 7, design records | partly done | design §4.3 `presentMember` row; §10.3 O-SCHEMA sentence. §9.3 item 4, §10.5 P-LIFECYCLE's helper clause and §10.6 row 6 stay at head: they would state the item 5 mechanism, which did not land |
| 8, pre-plan attribution | done; one seam stopped | `W/step-8-run-postclose-attribution.md` |
| 9, final run | done; every failure attributed (`t287-calculus-state-transfer`'s three extra entries by load: run alone at both trees it gives the final log's set) | `W/step-8-run-postclose.log` |
| 10, records | done | ticket `### Library delivery close (2026-10-23)`; `specification/GOALS.md` |

- **Item 1.**
  - `RuntimeEventCalculusDerivation` owns one `WorkingFoldState`. `advance` sets the source once per advancing call and applies each new event with `applyStep`, memoizing each transition; no fold state is copied per call. `forkAt` builds the fork's state with one `workingFoldState`.
  - The P-FOLD case is unchanged and passes. The new case `P-FOLD streaming: single-event advances agree with one batched advance and the cold fold at every cut; one owned state` covers 22 cuts and asserts:
    - one owned state object, not frozen;
    - a fork at a middle cut equals that cut's projection;
    - the fork leaves the source state unchanged.
  - Before and after: on head with only the accessor added the case fails (`22 !== 1`: one state object per cut); after the change the lane is 7/7.
  - What the case proves (the Executive's note 2): one persistent state, and agreement with the batched and cold folds. It does not prove linear growth. Held-fluent clipping still copies and scans the held entries per clip pattern (`abg/calculus/fold.ts:222`, the `[...holds.entries()]` spread at `:223`), reached per probe from `abg/actor_process.ts`, so a long stream's cost stays quadratic.
  - The P-FOLD sentence claims only that the per-advance state copy is gone. The §4.4 sentence the activation gave says "copies nothing"; it reads "copies no fold state" here, because the clip scan copies held entries.
- **Item 2.**
  - `admitJson` admits a record whose prototype is `null` or a realm's `Object.prototype`, and an array whose prototype is a realm's `Array.prototype`. A prototype counts as a realm's when either holds:
    - it is this realm's own prototype;
    - its own data `constructor` is a function whose own data `name` is `Object` or `Array` and whose own data `prototype` is that same object.
  - An `Object.prototype` must have a `null` prototype. An `Array.prototype` must be an array with such an `Object.prototype` above it. Any other prototype is refused with `non_ijson_value`. No getter runs: the probes read only own data descriptors.
  - A prototype confers nothing: admission copies own data members into fresh ordinary containers. The throwing `i_json` entry lifts `admitJson` (`shared/i_json.ts:39`), so it inherits D12.
  - The comparison owners:
    - `sameFact` admits both operands; a refusal or a throw answers `false`; `isDeepStrictEqual` stays as the positive fast path;
    - `projectQualificationRulingForConsumer` admits `input` and answers `null` on refusal;
    - `qualificationResultRelation` admits `output` and answers `false` on refusal.
    - No "O-TYPE stop: channel" comment remains (grep).
  - Case `D12: a plain record or array of another realm is admitted by structure; a class instance of that realm is refused` (`node:vm`):
    - The foreign record and array are admitted and equal their same-realm twins, and `sameJson` holds across realms.
    - Refused: a foreign class instance, a same-realm and a foreign `Array` subclass, an accessor `constructor` (with no getter run), `Object.setPrototypeOf([1], [9])`, and a null-prototype object with an own `constructor` named `Object`.
    - Before and after: on the head build the case fails at its first assertion (the foreign record is refused). The two probes added under the note failed on the looser build ("an array prototype that is a plain array"). The lane is 9/9 after.
  - The nine qualification lanes, rerun on the tightened build, give the same results as repair C's batch 2 and the run before the tightening:
    - green: `t287-native-runtime-gate` (6 pass, 1 skip), `t287-qualification-law` (2 pass, 4 skip), `t287-qualification-producer-context` 4/4, `t287-qualification-scopes` 17/17, `t287-qualification-contraction` 4/4, `t287-qual056-material` 7/7;
    - `t287-malformed-gtl-gate` fails at `:60` (`'raw_admission_refused'` against `'validation_failed'`), as in `step-8-run-final.log`;
    - `t287-qualification-parent-alias` fails at `:18` (`explicit frozen fixture and isolated emitted-owner binding required`);
    - `t287-qualification-producer-acquisition-reuse` fails at `:1` (`'test failed'` after `explicit finite copied-history, retained context and exact historical owner fixtures required`).
- **Item 3.**
  - At the four lookups the filter is `e.payload.value !== undefined && canonicalEquals(e.payload.value, …)`. `presentMember` leaves those sites and stays at the other twelve: `abg/semantic_job.ts:125`, `abg/worksite_construction_recovery.ts:107`, `abg/worksite_revision.ts:419`, `:440`, `:474`, `:488`, `abg/retry.ts:2913`, `abg/construction_continuation.ts:76`, `abg/semantic_stage.ts:167`, `:321`, `abg/c_call.ts:2053`, `implementation/release_publication.ts:201`. `abg/semantic_revision.ts` no longer imports it.
  - No lane drives one of the four functions with its own fixture. `d1-preserved-result-mechanics` fails at load (ENOENT on `build_tenants/abiogenesis/preimages/source-observation.json`), and the generic-job cases skip on their environment gates.
  - The case is therefore in `t287-common-computational-library`: `D13: a valueless result event beside the matching one is not a candidate; the lookup answers the match`. It runs the built `semanticRevisionInputMatchesBasis`, linked with its stage authentication, predecessor projection and envelope guard replaced.
  - Control: the match alone answers `true` on head and after. With a valueless `c_call_result_admitted` beside it, head answers `false` (the caught TypeError) and the changed build answers `true`.
- **Item 4, contract read.**
  - (a) The helper artifact's shape is pinned only by its Product owner:
    - the type `WorksiteCommandHelperArtifact` in `product/worksite_command_execution.ts` (the revision and forward kinds are `Omit` types over it, `product/worksite_revision.ts:73`, `product/worksite_command_forward.ts:71`);
    - `constructWorksiteExecutionHelperArtifact`;
    - the exact-key validator `isWorksiteExecutionHelperArtifact`.
  - (a), what does not pin it:
    - No owner contract table, GTL contract declaration or schema names it, and `contracts/capabilities/capability-definition-graph.json` names neither the artifact nor any command-execution contract.
    - The one stored digest over it is incidental. The C2 renderer context pins the whole built module (`gtl/worksite_command_execution.ts:37-41` digest and byte count, `:61` renderer span; `contracts/worksite/command-execution-context.inventory.json`), and the build checks the pin but does not regenerate it. Steps 3 and 4 and repair C each refreshed it when they touched the module.
    - Recorded runs under `T/test_env/test_runs/` hold old module text as evidence, not as pins.
  - (b) A `worksite_command_execution_failure` value is consumed in three places:
    - its GTL declaration (`gtl/worksite_command_execution.ts:321`: reference, role `failure`, value kind only);
    - the Product guard `isWorksiteCommandExecutionFailure` (`product/worksite_command_execution.ts:2193`), an exact-key guard over `diagnosticRef failureClass kind schemaVersion`, reached through `validateContractValue` (`product/builtin_semantics.ts:251`);
    - test `w2-steel-single-start.test.mjs:165`.
  - (b), the runtime reach:
    - The leaf port's `isLeafRealizationCandidate` (`implementation/leaf_invocation_port.ts:208-245`) checks `kind`, `schemaVersion` and `diagnosticRef`, as does the outcome's failure validator (`abg/c_call_outcome.ts:1364-1376`).
    - None of the six runtime callers of `validateContractValue`/`ByRef` reaches this failure value today: they validate outputs, output vectors, retry inputs and successor inputs.
    - The guard is still the Product's accepted shape for the failure contract. Under the Executive's note (3b), adding a member changes that shape.
  - (c) No:
    - A failure candidate's `evidenceCandidates` must be empty under `F_P` (`implementation/leaf_invocation_port.ts:238`).
    - Dispatched `F_P` admission derives its own transport evidence and does not read `evidenceCandidates` (`abg/c_call_outcome.ts:1116-1137`, `deriveProbabilisticTransportEvidence`; the Executive's note 3a, verified).
    - The subject can therefore travel only as a member of the `resultCandidate` the parent constructs.
  - Delta, for the Executive:
    1. The helper artifact's disposition set gains `failure`, with one member `failure` (the subject `{ failureClass, taskRef, taskDigest, attemptRef, command | request | observation, diagnostic: { name, message }, processFacts }`) present on that disposition only. This part is confined to the artifact, and every other disposition's bytes are unchanged.
    2. The parent's failure value (the `resultCandidate` of `failure`, `implementation/worksite_command_execution.ts:233`) gains `subject` on `failureClass: "helper_failure"`. `isWorksiteCommandExecutionFailure` must then admit that member on that class, which widens the Product failure contract's accepted member set.
    - No event contract or payload key list changes: `c_call_result_admitted` keeps `cCallRef contractRef evidenceRefs resultClass resultDigest resultRef value valueDigest valueKind` (`abg/event_store.ts:771-775`), and the admitted `value` is the candidate. No owner contract table or capability graph entry is involved.
    - Part 2 is a Product output contract shape change. The activation's rule names it only when an owner contract table or stored digest pins it; the note reads the exact-member guard as making it one. So item 5 stops, the guard is not widened, and nothing of item 5 is in this commit.
  - An alternative that keeps every accepted shape: carry the admitted subject inline as the failure's `diagnosticRef`, a `data:` reference as §9.3 item 3 does.
    - The guard needs only a nonempty string there, the port compares the reference, and the outcome takes `failureDiagnosticRef` from the leaf candidate (`abg/c_call_outcome.ts:1072-1074`).
    - It changes what that reference means for this failure class.
  - Either option needs a case that reaches `c_call_result_admitted` through actual parent completion (the note's acceptance for item 5).
- **Items 5 and 6, stopped; the scenario and what it proves.**
  - No scenario is in this commit.
  - Before the note, items 5 and 6 were realized in the working tree and then reverted:
    - the helper published the subject on a `failure` disposition, and the parent returned it as the failure's `subject` through `admitJson`;
    - the case drove a real helper child whose command (`node -e ''`) exits 0 with its scope unresolved (a module hook replaced only the lifetime module the helper imports) through `realizeWorksiteCommandExecution(...).complete(exchange)`.
  - Evidence from that implementation, at the adapter level only:
    - on head the case failed with `helper_artifact_absent`;
    - with the item 5 code it returned `helper_failure`, with subject class `command_cleanup_unresolved`, the helper's exit status 1, and `processFacts` equal to the facts the helper child wrote for its own command process.
  - It did not reach `c_call_result_admitted`: C-call admission needs an opened, evidenced C-call in a store, which that harness lacks. Under the note, a parent return alone does not discharge item 5.
- **Item 8.**
  - Scope: the 68 lanes red in repair C's batches 2 to 4 that are not among the 44 files of `step-8-run-final.log`.
  - Each lane ran alone on this commit's built tree (after the revert of items 5 and 6 and the D12 tightening) and at `97b1200bc`.
  - Result: 67 lanes have the same failure set at both; 1 is a seam; none timed out.
  - The seam, `t287-reacquisition-root-contract` `:39` (`ReferenceError: canonicalEquals is not defined`):
    - Cause: step 4 `5f4a1d4c9` replaced `canonicalJson(a) === canonicalJson(b)` with `canonicalEquals(a, b)` in the span of the built `abg/invocation_admission.js` that the lane evaluates through `new Function`, and the lane's binding list lacks `canonicalEquals`.
    - Bounded fix: one binding in the lane's own test file. A scratch copy with that binding gives the baseline's set on this build (1 pass, 1 skip).
    - The file is outside the grant, so the lane stops with the seam named.
  - `t287-historical-source-resource` fails at load at the baseline on its ignored fixture. With the 218 ignored fixture files linked into the baseline worktree, its rerun gives the head's set (`:64`).
  - The table is in `W/step-8-run-postclose-attribution.md`.
- **Item 9.**
  - Gates, all rc 0: `npm run build`; `npm run lint:imports` (28 shared modules import only `shared` and packages); `npm run lint:lifecycle` (284 modules, 10 allow-listed sites, no offender).
  - The four lanes:
    - `t287-lifecycle-failure-carrier` 5/5;
    - `m5-worker-transport` 21/21;
    - `t287-worksite-command-execution` 3 pass, 1 fail at `:407` (assertion at `:826`, `'failure' !== 'success'`);
    - `t287-observed-worksite-command` 7 pass, 1 fail at `:43` (`18025250 !== 18025000`).
    - Both failures are the final log's sets.
  - The integrated run covers 46 distinct files in one invocation: 329 tests, 251 pass, 58 fail, 2 cancelled, 18 skip, 60 failing entries. Every entry is attributed:
    - 53 entries are entries of `step-8-run-final.log`, matched by file, title and first error.
    - 3 are the frame-observation suite's `:189`, `:209`, `:237`. They are the baseline's `:187`, `:207`, `:235` by title and first error (`explicit proof-local territory`; `ERR_INVALID_ARG_TYPE` on an undefined path; `assert.ok(process.env.ABI5_FRAME_BASELINE_ROOT)`). The 2-line shift is repair A's `a1349e50b` edit of the file.
    - 4 are `t287-calculus-state-transfer` entries; the final log has 1 there:
      - In both runs the parent case at `:64` times out at 300000 ms. In the final log `identity_end` was cancelled.
      - This run was under external load from other applications (load average 8 to 11; the integrated run took 1836 s against 1096 s, and the subtests about twice their standalone time). The timeout fell during `progressed` (cancelled), so `batch_in_batch`, `recovery` and `identity_end` were never started.
      - Run alone back to back, this tree and the baseline worktree each give the final log's set: six subtests pass in 45 to 48 s each, `identity_end` is cancelled, and `:64` times out. Both runs are appended to the log.
      - The two files with the largest slowdowns take the same time alone on both trees: `m5-installed-portability` 111292 / 112480 ms, `t287-w2-05-install-catalog-owner-chain` 6624 / 6540 ms.
    - Every entry is the final log's or the baseline's, except state-transfer's three extra entries. Those are the final log's `:64` timeout reached earlier under load, and running only that suite at both trees gives the final log's set (rule 3's method). The integrated set itself is worse than the final log's at that file.
  - `npm run test:uat:harness`: 34 tests, 30 pass, 1 fail (`harness.test.mjs:471`), 3 skip; this is the final log's set.
- **Item 10.**
  - The ticket subsection states:
    - the commit;
    - O-TYPE closed at every census site but the five D14 sites, with the four realm stops closed under D12 and the D12 rule as realized;
    - the D13 sentence and twelve `presentMember` sites;
    - P-FOLD 7/7, with the per-advance copy gone and the clip scan quadratic;
    - review item 1 stopped with the guard named and the delta here; item 3 repaired; item 6 updated;
    - the `:826` cause by reading;
    - a D14 line: the five sites wait on D14, taken for post-close repair D at `2f1393061`.
  - P-LIFECYCLE stays at head. GOALS states the same.
  - The plan ledger is the Executive's and is untouched.
- **Residuals.**
  - Helper failure facts still do not reach the admitted failure on the command and HTTP routes. The delta and its alternative are above, for the Executive.
  - Held-fluent clipping copies and scans held entries per clip pattern (`abg/calculus/fold.ts:222-223`), so streaming cost stays quadratic in held fluents and probes. This is outside item 1's claim and is not an item of this repair.
  - The module-test fork from a middle cut to the end of a validated prefix (`forkRuntimeEventCalculusAtForModuleTest(source, middle, source)`) differs from the warm projection of the end. It does so at head before item 1 as after: head's `event_calculus.ts` with only the accessor added gave the same `false`. The case asserts the fork at the cut instead. The path is module-test only.
  - The seam lane `t287-reacquisition-root-contract` needs one binding (`canonicalEquals`) in its own test file, which is outside the grant.
  - `t287-worksite-command-execution` `:826` (`'failure' !== 'success'`, at head and at `97b1200bc`) has a likely cause by reading. The suite's `exactHelperExchange` sets `promptDigest` to `sha256Bytes` of the prompt (`:345`), and the parent's `exactExchange` compares `sha256Canonical` (`implementation/worksite_command_execution.ts:267`), so completion answers `transport_identity_mismatch`. The reverted scenario met that refusal with the byte digest and passed with the canonical one. The suite is outside the grant.
  - The parent case of `t287-calculus-state-transfer` (`:64`) exceeds its 300000 ms timeout alone on both trees, as in the final log.
  - D12: the plan's row at `2f1393061` and the realization differ by one refusing condition (a `null` prototype above a realm's `Object.prototype`; probe `new (function Object(){})()`), for the Executive's ruling. Design §4.1 and the ticket state the realization.
  - D14's five casts are untouched.
- **Applied from the Executive's note.**
  1. D12, tightened:
     - a prototype counts only when its own data `constructor` is a function named `Object`/`Array` whose own data `prototype` is that same object;
     - an `Array.prototype` needs such an `Object.prototype` above it; a `null` prototype stays admitted;
     - the probes `Object.setPrototypeOf([1], [9])` and a null-prototype object with own `constructor` named `Object` are `non_ijson_value` refusals in the D12 case; both failed before the tightening;
     - the §4.1 sentence states the rule as realized, and that a prototype confers nothing because admission copies own data into ordinary containers;
     - the nine qualification lanes were rerun;
     - the plan's D12 row at `2f1393061` omits one condition the realization keeps: a realm's `Object.prototype` must itself have a `null` prototype. The probe that separates them is `new (function Object(){})()`. Its prototype has an own data `constructor` named `Object` whose `prototype` is that same object, with this realm's `Object.prototype` above it: the row admits it and the realization refuses it (`non_ijson_value`, checked on this build). The condition only refuses, and every realm's own `Object.prototype` meets it. It is for the Executive's ruling.
  2. P-FOLD, narrowed:
     - the P-FOLD sentence claims only removal of the per-advance state copy;
     - the §4.4 sentence reads "copies no fold state";
     - item 1 above states that the streaming case proves persistent state and cold/batch agreement, not linear growth, and names the clip scan.
  3. Items 4 and 5:
     - (a) is verified at `abg/c_call_outcome.ts:1116-1137`;
     - (b) is verified at `product/worksite_command_execution.ts:2193` (exact keys);
     - the delta changes the accepted shape, so items 5 and 6 stop and the guard is not widened;
     - the item 5 and 6 code (helper, parent, Product module, C2 pin, scenario) was reverted to head;
     - item 7's helper sentences stay at head;
     - the ticket and GOALS state the stop.

## Fourth review (pasted by Jim, 2026-10-23; read-only, source inspection and in-memory probes; subject `837781a1a` with repair B's uncommitted tree inspected)

Verbatim.

> Product Frame: GOAL-035/T-287 selects the common library before resuming the fixed fifteen-family ABG 5.0 release. GTL defines work, HoG traverses it, and ABG owns admitted history; the calculus reconstructs derived truth. This delivery must retire duplicate computation while preserving owner boundaries and failure evidence. Product contract (src/apps/abiogenesis/specification/PRODUCT.md:1238)
>
> Retain Repair C, but repair one confirmed S2 regression before closure. B contains a substantive fold improvement, alongside two narrower design issues. I support taking D14 with the corrections below. I found no S0 or S1.
>
> I reviewed committed 837781a1a, including C at 99b80d6f5, and separately inspected B's moving, uncommitted changes.
>
> 1. S2 — C now constructs a forward task that its own validator rejects.
>
>    worksite_command_forward.ts:134 replaces canonical comparison of bindingCoverEventRefs with equal lengths and .every(). Sparse arrays skip the predicate.
>
>    Starting from the existing valid fixture, change only: `snapshotSources[0].source.bindingCoverEventRefs = Array(bindingCoverEventRefs.length);`
>
>    An independent probe loaded the exact source revisions into memory and exercised the exported constructor with its actual dependencies—no substituted validators:
>
>    | Subject | Dense control | Sparse replacement |
>    |---|---|---|
>    | Before C: 0c362da15 | Accepted | Throws the expected TypeError |
>    | Current: 837781a1a | Accepted | Returns a task that its own validator rejects |
>
>    JSON round-trip validation also rejects the returned task. The native ABG caller currently supplies dense arrays, so this demonstrates a constructor-contract regression, not an established execution-authority bypass.
>
>    The bounded repair is to admit the candidate array and use the shared canonical comparison, preserving the constructor's throwing refusal. Add this negative beside the existing constructor cases. This also avoids introducing another private equality algorithm during consolidation.
> 2. S3 — B's linear-time claim exceeds the implemented improvement.
>
>    The new P-FOLD wording (design `:637`) claims streaming advancement takes time linear in new events.
>
>    B removes the earlier repeated whole-state copy. However, ordinary stdout events accumulate held fluents, and their activity probes cause clipping that copies and scans the held entries. N stdout/probe pairs therefore still produce at least quadratic held-entry visits. See the production callback (`abg/actor_process.ts:1230`) and clip application (`abg/calculus/fold.ts:222`).
>
>    Narrow the claim to eliminating the per-advance state-copy overhead. The new streaming test meaningfully establishes persistent state and cold/batch agreement; it does not establish total linear growth. This is a retained cost and an overstated new claim, not a new runtime regression or an explanation of P5.
> 3. S3 — B's D12 implementation admits more prototype shapes than its design states.
>
>    The proposed test treats an array-valued prototype as a realm's Array.prototype. A read-only probe of B's actual admission source accepts: `Object.setPrototypeOf([1], [9])`
>
>    It also accepts a synthetic null-prototype object carrying a constructor named Object. These contradict the design's blanket refusal of prototypes beyond realm intrinsics. Admission implementation (`shared/admit/json.ts:61`)
>
>    Admission copies own data into ordinary containers, so I established no authority leakage or altered admitted fields. Tighten the checks or state the structural acceptance rule accurately, with these examples in its tests. Ordinary foreign records are correctly admitted, and ordinary class instances are correctly refused.
>
> D14: take the representation repair, but correct its rationale and define the coordinate precisely.
>
> The live prefix is unsuitable diagnostic content. Replacing it with a typed JSON projection is appropriate. Two claims in the proposal need correction:
>
> - The whole subject digest already binds selected history through replayState.eventStoreDigest, with count/ordinal and the durable successor coordinate also present. The live member becoming {} is real, but it does not erase every prefix commitment. Replay commitment (`abg/replay.ts:1369`)
> - These five routes currently record a subject digest and a diagnostic:// class URI. They do not retain the subject bytes. Cold projection reports availability: "not_retained" and subject: null. Replacing the live object alone does not make its diagnostic content recoverable. Admission (`abg/runtime_failure.ts:242`), projection (`abg/runtime_failure.ts:127`)
>
> Use the receipt's own full durable coordinate, Run selector, and existing selected-event digest/count/ordinal. A file reference plus physical digest does not distinguish different Run selections over that file. A nested outcome can also precede its completion: preserve its earlier cut rather than substituting the later transition prefix.
>
> This can remain a prospective diagnostic representation change with unchanged event payload keys and historical bytes/digests. If retained diagnostic content is part of D14, explicitly select the existing inline diagnostic mechanism and prove cold retrieval. Do not imply that retention follows from removing the casts.
>
> Repair D's focused evidence should cover all five projections, both recursion and workflow admission paths, distinct selections over one physical prefix, and preservation of an outcome's earlier cut. No full-history materialization or new registry is needed.
>
> B's helper handoff remains the important outstanding whole-path obligation.
>
> At final inspection, its helper files were unchanged and no B return existed. Two concrete constraints matter:
>
> - Dispatched F_P admission derives transport evidence; it does not consume the leaf's evidenceCandidates. Merely placing helper facts there loses them. Evidence selection (`abg/c_call_outcome.ts:1116`)
> - The Product failure validator accepts exactly four members. Adding processFacts directly changes that accepted shape. Failure validator (`product/worksite_command_execution.ts:2193`)
>
> B's acceptance evidence must reach an admitted failure carrying the original cause and final physical facts through actual parent completion. A helper throw, published artifact, or adapter return alone cannot discharge that obligation.
>
> Several earlier concerns are now materially improved:
>
> - Repair A fixes the public liveness cut; the prior consensus malformed-reference regression is also repaired.
> - D10 covers the three selected framework ingress boundaries before provider dispatch.
> - C's census totals reconcile: 2,347 typed removals + 202 ingress narrowings + 179 site admissions + nine stops = 2,737 traced sink casts.
> - B's accumulator removes the identified state-copy term. I found no supported new aliasing or fork-corruption counterexample.
> - D13's four edits implement the selected policy. Its new test exercises the actual lookup with controlled lower premises; it is component evidence, not an admitted-history execution.
>
> C's outside-list failures are still attributed only to its parent, not the pre-plan baseline. B owns that remaining attribution and the acknowledged overstatement of O-TYPE closure. Neither should be presented as already complete. Recorded limitations and disposition (`step-8.md:1667`)
>
> This review was read-only. I used source inspection and focused in-memory probes; I ran no builds or broad suites and made no edits, commits, or pushes.

## Disposition of the fourth review (Executive, 2026-10-23)

Verified by reading: finding 1 (at `0c362da15` the site compared through `canonicalEquals` over the cast; at head an index `===` loop that a sparse array passes, while `isWorksiteCommandForwardTask` admits the task through `admitJson` and refuses it); findings 2 and 3 against repair B's uncommitted tree were sent to the Worker as input to its items 1 and 2; the D14 corrections against `runtime_failure.ts` (`:127` cold projection reads the subject only from a `data:` diagnostic reference; the five routes carry a `diagnostic://` class URI, so their subject is not retained) and `recursionFailure` / `failWorkflow`; the handoff constraints sent to the Worker as input to its items 4 and 5.

| Finding | Severity (Reviewer) | Priority (Executive) | Disposition |
|---|---|---|---|
| 1: forward task constructor accepts a sparse `bindingCoverEventRefs` that its validator refuses; a private equality loop introduced during consolidation | S2 | P1 | Repair D item 1: admit the candidate array and compare with `canonicalEquals`; the throwing refusal stays; negative case beside the constructor cases. D item 2 extends the check to the class: repair C removed 561 `canonicalEquals` calls and added 541; each removed call whose replacement is not `canonicalEquals` over typed or admitted values is listed with its replacement, and a local algorithm returns to the shared comparison. |
| 2: P-FOLD wording claims linear time; held-fluent clipping remains quadratic in held-entry visits | S3 | P2 | Sent to Worker B (item 1): the sentence claims only the removal of the per-advance copy. If B's Return still claims linear, D corrects the sentence. |
| 3: D12 admission accepts an array whose prototype is an array, and a synthetic null-prototype object with a `constructor` named `Object` | S3 | P2 | Sent to Worker B (item 2): identity both ways between the prototype and its `constructor.prototype`; both examples refused in the test; §4.1 states the rule as realized. D12's plan row restated. If B's Return does not show it, D does it. |
| D14 corrections | — | — | D14 taken as the review Jim forwarded recommends, with the corrections: the five subjects carry a typed JSON projection in which the prefix member is the outcome's own full durable coordinate, Run selector and selected-event digest, count and ordinal, taken from the outcome's own cut (a nested outcome keeps its earlier cut); event payload keys, historical bytes and digests unchanged; no retention claim (the five routes keep their `diagnostic://` class URI and the cold projection keeps answering `not_retained`). Rationale corrected in the plan row: the subject digest already binds selected history through `replayState.eventStoreDigest`; the live member as `{}` is a content defect, not a lost commitment. Repair D item 3. |
| Helper handoff constraints (`c_call_outcome.ts:1116`; the failure validator's exact member set) | — | — | Sent to Worker B (items 4 and 5). The stop rule stands: a validator member change is a contract change; B stops item 5 and writes the delta. |
| Attribution and the O-TYPE overstatement | — | — | As recorded: B items 8 and 10. Not presented as complete until B's Return. |

## Disposition of repair B (Executive, 2026-10-23)

Accepted at `d8cf6b5d9`, with items 5 and 6 stopped as the Return states. Read: the Return against the activation's items and the Executive's note; the D12 and D13 diffs (`shared/admit/json.ts`, the three comparison owners, the four lookups); the `event_calculus.ts` diff (`applyStep` computes the effect, the declip keys and the event's facts before any change, `fold.ts:191`; `project` builds a fresh sorted array from the owned state; `forkAt` is the one `workingFoldState` copy); the design diff (§4.1, §4.3, §4.4, §10.3 O-TYPE and O-SCHEMA, §10.5 P-FOLD); the attribution table; the ticket and GOALS diffs; `capability-definition-graph.json` and the manifest, changed in digest and reference fields only (551 leaf values, every one a `*Digest` or `*Ref`); `build/code/src/gtl/stdo_run_environment.d.ts`, a union-order difference in the emitted declaration. The five D14 casts remain (`hog/recursion_lifecycle.ts:570`, `:1027`, `:1053`; `hog/workflow_lifecycle.ts:726`, `:1074`); no `O-TYPE stop` comment remains in `code/src`. Executive check on the head: `tsc --noEmit` rc 0; `lint:imports` 28 modules rc 0; `lint:lifecycle` 284 modules, 10 allow-listed, no offender, rc 0; `t287-common-computational-library` 9/9; `t287-calculus-fold` 7/7; `t287-lifecycle-failure-carrier` 5/5; `t287-consensus-ref-shape` 2/2; `t287-native-runtime-gate` 6 pass, 1 skip; tree clean but for the untracked uat harness outputs and two untracked Codex files.

| Return item | Disposition |
|---|---|
| 1, streaming fold | accepted. §4.4 "copies no fold state" and the narrowed P-FOLD sentence stand; the held-entry clip scan (`fold.ts:222-223`) stays quadratic and is recorded here, not an item: the plan's claim was the per-advance copy (repair A item 2). The module-test fork from a middle cut to the end differing from the warm projection predates item 1 (head with only the accessor gives the same `false`) and is confined to the module-test path; recorded for Jim. |
| 2, realm admission (D12) | accepted. The realization refuses one shape the plan's row at `2f1393061` admitted: a prototype above this realm's `Object.prototype` whose own `constructor` is a function named `Object` with that prototype (`new (function Object(){})()`). Ruling: the realization stands. A realm's `Object.prototype` has a `null` prototype by the language, so the condition refuses only a constructed shape, a class instance in disguise. The D12 row is restated to the rule as realized, with repair B's probe beside the fourth review's two. |
| 3, valueless result events (D13) | accepted; `presentMember` at the twelve other sites as the §4.3 row states. |
| 4, contract read | accepted; (a) to (c) verified by reading `implementation/leaf_invocation_port.ts:208-245`, `abg/c_call_outcome.ts:1066-1078` and `:1364-1376`, `product/worksite_command_execution.ts:2193`. |
| 5 and 6, handoff and scenario, stopped | the stop was right under the note. Decided here as D15: the mechanism is the one the design ratified at step 7, §9.3 item 4 and §10.6 row 6 (`:654`): the facts enter `L` through the admitted failure's diagnostic subject and no Product output contract changes. The delta's part 2 (a `subject` member on the Product failure value, widening `isWorksiteCommandExecutionFailure`) is refused on that sentence. Part 1 (the artifact's own `failure` disposition) and the inline diagnostic reference (B's alternative, the §9.3 item 3 mechanism) are repair D item 4, with the whole-path case the note requires. |
| 7, design records | the §4.3 row and the O-SCHEMA sentence accepted. §9.3 item 4, P-LIFECYCLE's helper clause and §10.6 row 6 go to D with D15. |
| 8, pre-plan attribution | accepted: 67 lanes the same set at head and baseline; the seam `t287-reacquisition-root-contract:39` (step 4 `5f4a1d4c9`; the lane's `new Function` binding list lacks `canonicalEquals`) is D item 6. |
| 9, final run | accepted. The integrated set at `t287-calculus-state-transfer` is worse than the final log's under load (three subtests never started after the `:64` timeout); the standalone reruns on both trees give the final log's set and are appended to the log. The `:826` cause B found by reading is taken: the suite's `promptDigest` is `sha256Bytes` (`:345`) where the Product's producer digests canonically (`product/worksite_construction.ts:455`) and the parent compares canonically (`implementation/worksite_command_execution.ts:267`); a baseline fixture defect, D item 7. |
| 10, records | accepted; D restates them. |

Order from here: D (items below), then the closing post restated, then the independent review.

## Post-close repair activation D (Executive, 2026-10-23; D14, D15)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Head is the Executive's bookkeeping commit after repair B (`## Disposition of repair B` above). Read this section; `## Fourth review` and `## Disposition of the fourth review` above (finding 1 and the D14 corrections); `## Post-close repair return B` (item 4's contract findings and delta, items 5 and 6's reverted implementation and what it reached, item 8's seam, the `:826` residual) and `## Disposition of repair B`; the plan post's decisions D12 to D15 (`.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, `## Decisions Jim owns`); design §4.1, §9.3 items 3, 4 and 6, §10.3 O-TYPE row, §10.5 P-LIFECYCLE, §10.6 row 6 in both tables (`:594`, `:654`); `code/src/product/worksite_command_forward.ts` `constructWorksiteCommandForwardTask` (`:115-148`) and `isWorksiteCommandForwardTask`; `code/src/hog/recursion_lifecycle.ts` `recursionFailure` and its three call sites (`:570`, `:1027`, `:1053`); `code/src/hog/workflow_lifecycle.ts` `failWorkflow` and its two sites (`:726`, `:1074`); `code/src/hog/traversal_failure.ts` `failTraversal`; `code/src/abg/runtime_failure.ts` (`constructRuntimeFailureDiagnosticRef` `:84`, `readRuntimeFailureDiagnosticSubject` `:89`, the cold projection `:112-135`, admission `:242-250`); `code/src/abg/replay.ts:1369` (`replayState.eventStoreDigest`); `code/src/implementation/worksite_command_helper.ts` `main` (`:1368` to the end) and the four throw sites that carry `processFacts` (`:765`, `:801`, `:1127`, `:1164`, by grep); `code/src/implementation/worksite_command_execution.ts` `failure` (`:233`), `exactExchange` (`:260-272`) and the completion path; `code/src/product/worksite_command_execution.ts` (the helper artifact type, `constructWorksiteExecutionHelperArtifact`, `isWorksiteExecutionHelperArtifact`, `isWorksiteCommandExecutionFailure` `:2193`); `code/src/implementation/leaf_invocation_port.ts:208-245`; `code/src/abg/c_call_outcome.ts:1066-1078` and `:1364-1376`; the lanes `test_env/tests/forward-command-contracts.test.mjs`, `t287-runtime-failure-diagnostic.test.mjs`, `t287-lifecycle-failure-carrier.test.mjs` (`:257`, `:298`, `:337`), `w2-steel-single-start-closure.test.mjs`, `t287-reacquisition-root-contract.test.mjs:30-45`, `t287-worksite-command-execution.test.mjs:340-350` and `:400-410`; `step-8-run-postclose.log`'s summary lines.

Items, in this order. The Return carries one row per item: done or stopped, with lines at head.

1. **Forward-task comparison** (fourth review finding 1, S2). `product/worksite_command_forward.ts:134`: the index loop `!row.source.bindingCoverEventRefs.every((ref, j) => ref === bindingCoverEventRefs[j])` becomes admission of the candidate array and the shared comparison: `admitJson(row.source.bindingCoverEventRefs)` refused, or not `canonicalEquals` to `bindingCoverEventRefs` (typed `readonly string[]`), is the mismatch the surrounding predicate already turns into the constructor's `TypeError`. The length check may stay or go; the throwing refusal stays. Test, in `forward-command-contracts` beside the constructor cases: from the valid fixture, `snapshotSources[0].source.bindingCoverEventRefs = Array(bindingCoverEventRefs.length)` makes the constructor throw; on head it returns a task that `isWorksiteCommandForwardTask` refuses (assert that on head before the change, then the throw after).
2. **Comparison census of repair C.** Over `git diff 0c362da15 99b80d6f5 -- build_tenants/abiogenesis/typescript/code/src`: 561 removed lines carry `canonicalEquals(` and 541 added lines do; the per-file call count fell in `abg/semantic_job.ts` (50 to 45), `abg/semantic_revision.ts` (96 to 84) and `product/worksite_command_forward.ts` (9 to 8) and rose in `abg/retry.ts` (26 to 28). Table `post-close-repair-d-comparison-census.tsv` beside this file: one row per `canonicalEquals(` call present at `0c362da15` and absent at head (`file:line at 0c362da15 | replacement at head | class | action`), class one of: re-typed (the same call with its cast gone), merged (into another `canonicalEquals` call over the same operands), scalar (a string, number, boolean or null operand now compared with `===`, which `canonicalEquals` equals on scalars), structural (an array or record now compared by `===`, `isDeepStrictEqual`, a loop or any other local walk). Every structural row returns to `canonicalEquals` over typed or admitted operands on the site's own channel, as item 1 does; a file whose count did not change still contributes rows if a call was swapped. Counts to the Return. The rule: no private structural equality introduced by the plan remains.
3. **D14, the five lifecycle failure subjects.** At `hog/recursion_lifecycle.ts:570`, `:1027`, `:1053` (`recursionFailure`, through `Abg.admitRuntimeFailure`'s `subject: { stage, candidate }`) and `hog/workflow_lifecycle.ts:726`, `:1074` (`failWorkflow`, through `failTraversal`), the candidate is the admitted transition or result outcome carrying the owned runtime prefix object, which the canonical writer encodes as `{}`. Repair: one projection function in `abg/` (`abg/runtime_failure.ts` or the module that owns prefix coordinates; find the accessors beside `replay.ts:1369` and `reidentifyHistoricalDurablePrefixCoordinate`) that maps a transition or outcome to its typed JSON subject: every member as today except the prefix member, which becomes the outcome's own full durable coordinate, Run selector, and selected-event digest, count and ordinal, taken from the outcome's own cut. A nested outcome (one admitted at an earlier cut and carried inside the later transition) keeps its own earlier cut, not the transition's later prefix. The five sites call it; no cast remains; the subject's other members and the five routes' `diagnostic://` class references are unchanged; no retention is claimed (the cold projection keeps answering `not_retained` for these routes). Event payload keys, historical bytes and digests unchanged; a newly admitted failure's `subjectDigest` is the digest of the projected subject. Evidence, in `t287-runtime-failure-diagnostic` or the lane that drives these routes (grep `recursionFailure`, `failWorkflow`, `admitRuntimeFailure` in `test_env/tests`): all five projections exercised; both admission paths (recursion through `admitRuntimeFailure`, workflow through `failTraversal`) reaching an admitted `runtime_failure_observed` whose `subjectDigest` equals `sha256Canonical` of the projected subject and whose canonical subject text contains no `{}` prefix member; two distinct selections over one physical prefix (one store, two Run selectors or two cuts) giving distinct subject digests; an outcome's earlier cut preserved inside a later transition. The census table's five `stop: contract` rows read decision `A` or `T` as realized, done.
4. **D15, helper failure handoff.** The design's own route (§9.3 item 4; §10.6 row 6 `:654`: "no Product output contract changes"): (a) Helper: `main` catches the failures thrown after launch (the cleanup-unresolved throws and the first-error throws of the command and HTTP routes, which already carry `processFacts`) and publishes the artifact with disposition `failure` carrying one member `failure`, the subject `{ failureClass, taskRef, taskDigest, attemptRef, command | request | observation, diagnostic: { name, message }, processFacts }` with the facts as encoded at the throw site (no re-encoding), present on that disposition only; every other disposition's bytes unchanged; then exits non-zero as now; pre-launch failures (manifest admission) unchanged. The helper artifact type, constructor and exact-key validator in `product/worksite_command_execution.ts` (and the `Omit` types in `product/worksite_revision.ts:73`, `product/worksite_command_forward.ts:71` if they need it) gain that disposition and member. (b) Parent: on an artifact with disposition `failure`, the `helper_failure` candidate carries the subject, admitted through `admitJson`, inline as its diagnostic reference, `constructRuntimeFailureDiagnosticRef(subject)` (`abg/runtime_failure.ts:84`, the §9.3 item 3 mechanism), in both `diagnosticRef` and `resultCandidate.diagnosticRef` (the leaf port requires them equal, `leaf_invocation_port.ts:245`); `isWorksiteCommandExecutionFailure` is unchanged (its `diagnosticRef` stays a nonempty string); `helper_artifact_absent` stays for a truly absent artifact. Confirm by grep over `code/src` and `test_env` that no reader keys on `diagnostic://abiogenesis/worksite/command-execution/` (at head it occurs at `implementation/worksite_command_execution.ts:235` and `:817` only). The C2 renderer pin on the built Product module (`gtl/worksite_command_execution.ts:37-41`; `contracts/worksite/command-execution-context.inventory.json`) is refreshed as steps 3, 4 and repair C refreshed it. (c) Whole path: one case that drives a real helper child whose command fails after launch with unresolved cleanup (repair B's reverted fixture: `node -e ''` with its scope unresolved through a module hook on the lifetime module; the `t287-lifecycle-failure-carrier` helper cases' fixtures) through `realizeWorksiteCommandExecution(...).complete(exchange)` and on through the leaf port and `admitCCallOutcome` to an admitted `c_call_result_admitted` of result class `failure` (an opened, evidenced C-call in a store: reuse the fixture of the worker-route case at `:257` if it opens one, else the lane that admits a leaf failure for this implementation, by grep on `worksite_command_execution_failure` and `c_call_result_admitted` in `test_env/tests`). Acceptance: the admitted event's `value.diagnosticRef`, read cold from the store through `readRuntimeFailureDiagnosticSubject`, is the subject whose `failureClass` is the original cause (`command_cleanup_unresolved`) and whose `processFacts` equal the helper's own child process facts, not the worker's; on head the case fails with `helper_artifact_absent` or the class reference. Report the subject's encoded byte length. If no harness in `test_env` reaches `c_call_result_admitted` for this implementation after one bounded attempt at composing one from the existing fixtures, stop (c) with the blocker named and keep (a) and (b) with the adapter-level case repair B describes (parent completion returns the `helper_failure` candidate with the inline subject).
5. **Design records.** §9.3 item 4 restated to the realized mechanism (the helper publishes its post-launch failure as the artifact's `failure` disposition; the parent admits the subject and carries it inline as the leaf failure's diagnostic reference, item 3's mechanism; a thrown error alone never reaches `L`); §10.5 P-LIFECYCLE's helper clause names the case of item 4(c) (or its stop); §10.6 row 6 in both tables consistent with it ("no Product output contract changes" stays true; the thrown failures become the artifact's `failure` disposition); §10.3 O-TYPE row: after "A subject that carries an owned runtime object instead of its JSON coordinate is a contract change, not a cast." add "The five lifecycle failure subjects carry the typed projection of their transition with the outcome's own durable coordinate and selection (D14); no cast remains." and, if item 2 returned any site, one sentence that the plan introduced no private structural equality. Smallest edits.
6. **Seam lane.** `t287-reacquisition-root-contract.test.mjs`: add `canonicalEquals` to the lane's `new Function` binding list (`:39`), nothing else; the lane gives the baseline's set (1 pass, 1 skip).
7. **`t287-worksite-command-execution` `:826`.** The suite's `exactHelperExchange` sets `promptDigest` to `sha256Bytes` of the prompt (`:345`); the Product's producer digests the prompt canonically (`product/worksite_construction.ts:455`) and the parent compares canonically (`implementation/worksite_command_execution.ts:267`). Fix the fixture to `product.sha256Canonical(request.prompt)`; the case at `:407` then passes, or fails for a second cause, which gets one bounded attempt inside the grant, else a stop with the cause named. It fails at `97b1200bc` too: a baseline fixture defect discharged.
8. **Final run.** `npm run build`, `npm run lint:imports`, `npm run lint:lifecycle`; the lanes `forward-command-contracts`, `forward-command-owners`, `t287-runtime-failure-diagnostic`, `t287-lifecycle-failure-carrier`, `t287-worksite-command-execution`, `t287-observed-worksite-command`, `m5-worker-transport`, `w2-steel-single-start-closure`, `t287-reacquisition-root-contract`, `t287-common-computational-library`, `t287-calculus-fold`, and every lane item 2 touched; then the 46 files of `step-8-run-postclose.log`'s integrated run plus any touched lane not among them, in one invocation; `npm run test:uat:harness`; log to `step-8-run-postclose-d.log` beside this file (committed). Attribution as `## Activation 8a` rule 3: `step-8-run-postclose.log`'s failure sets or better (the `t287-calculus-state-transfer` `:64` timeout as recorded there); a new failure returns to its seam, one bounded attempt inside the grant, else stop that item.
9. **Records.** The ticket's `### Library delivery close (2026-10-23)` subsection and `specification/GOALS.md`: O-TYPE closed at every census site (D11, D12, D13, D14), or the sites that still hold; the helper-route handoff realized (D15) with its case, or 4(c)'s stop; the seam and `:826` lanes; the current reality at this commit. The plan ledger is the Executive's.

**Grant.** `product/worksite_command_forward.ts` (the constructor's comparison, item 1; the `Omit` artifact type, item 4); `test_env/tests/forward-command-contracts.test.mjs`; the sites item 2's table returns, each returned call only; `hog/recursion_lifecycle.ts` (`recursionFailure` and the three sites), `hog/workflow_lifecycle.ts` (`failWorkflow` and the two sites), `hog/traversal_failure.ts` (the subject type, if needed), one projection function in `abg/` and its barrel line if the hog sites need it; `test_env/tests/t287-runtime-failure-diagnostic.test.mjs` or the lane item 3 names; `implementation/worksite_command_helper.ts` (`main`'s catch and the publication), `implementation/worksite_command_execution.ts` (`failure` and the completion path), `product/worksite_command_execution.ts` (the helper artifact type, constructor and validator; `isWorksiteCommandExecutionFailure` unchanged), `product/worksite_revision.ts` (the `Omit` type), the C2 pin (`gtl/worksite_command_execution.ts:37-41`, `contracts/worksite/command-execution-context.inventory.json`), the scenario lane(s) item 4 names; design §9.3 item 4, §10.5 P-LIFECYCLE, §10.6 row 6 (both tables), §10.3 O-TYPE row (item 5); `test_env/tests/t287-reacquisition-root-contract.test.mjs` (one binding); `test_env/tests/t287-worksite-command-execution.test.mjs` (`:345`, and one bounded attempt at a second cause); `post-close-repair-c-census.tsv` (the five D14 rows); `post-close-repair-d-comparison-census.tsv`; `step-8-run-postclose-d.log`; the ticket subsection; the GOALS paragraph; the build outputs the gate regenerates; this file's `## Post-close repair return D`.

**Stop:** `isWorksiteCommandExecutionFailure`'s member set, any event contract or payload key list, the Product failure value's kind or class set; a D14 subject that drops, renames or re-types any member but the prefix member; item 4(c) after one bounded attempt; a seam one bounded attempt does not close; an unattributable failure in item 8; anything outside the grant; `shared/admit/json.ts` (D12 stands as realized).

**Return contract.** One commit on `main`, no push. First line `Post-close repair D: forward-task comparison; lifecycle failure subjects (D14); helper failure handoff (D15); final run`, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append `## Post-close repair return D` with: commit; the nine-item table (done or stopped, lines at head); item 2's counts by class; item 3's evidence (the five projections, both paths, the two selections, the preserved cut); item 4's path (the event kind and member the subject travels in, the cold read, the subject's byte length) or 4(c)'s blocker; items 6 and 7's sets; the run with every failure attributed; residuals. The final report's first line is the qualified answer: what landed, what stopped.

## Post-close repair return D

All nine items landed; nothing stopped. The forward task's cover vector compares through `canonicalEquals` over the admitted vector, and the comparison census returns no other structural site. The five lifecycle failure subjects carry the typed projection with each outcome's own cut (D14). A helper failure after launch reaches the admitted C2 failure as its inline diagnostic subject, proven on the installed whole path (D15). The seam lane and the `:826` fixture are repaired. The final run carries `step-8-run-postclose.log`'s failure sets or better, with no new failing test. This is not a release.

**Commit.** The commit carrying this Return, on `main` over `3dbd3cd2f`, first line `Post-close repair D: forward-task comparison; lifecycle failure subjects (D14); helper failure handoff (D15); final run`; its hash is in the final report. Not pushed; staged by path. `T` is `build_tenants/abiogenesis/typescript`, `W` this folder; lines are at this commit.

| Item | State | Lines at head |
|---|---|---|
| 1, forward-task comparison | done | `T/code/src/product/worksite_command_forward.ts` `sameAdmittedRefs` `:117-120`, called at `:139`; case `T/test_env/tests/forward-command-contracts.test.mjs:77` |
| 2, comparison census | done; one structural row, returned by item 1 | `W/post-close-repair-d-comparison-census.tsv` |
| 3, D14 lifecycle failure subjects | done | `T/code/src/abg/runtime_failure.ts` `projectRuntimeFailureCandidate` `:135` (imported by the two hog modules; no barrel line); `T/code/src/hog/recursion_lifecycle.ts:571`, `:1028`, `:1054`; `T/code/src/hog/workflow_lifecycle.ts:727`, `:1075`; case `T/test_env/tests/t287-runtime-failure-diagnostic.test.mjs:372`; `W/post-close-repair-c-census.tsv` rows 2158, 2169, 2170, 2185, 2197 |
| 4, D15 helper failure handoff | done, (a), (b) and (c) | (a) `T/code/src/implementation/worksite_command_helper.ts` `WorksiteHelperFailure` `:66`, throw sites `:785`, `:824`, `:1151`, `:1190`, `main` `:1420-1421`, catch `:1446-1449`, artifact `:1461-1465`, publication `:1486`, rethrow `:1492`; `T/code/src/product/worksite_command_execution.ts` `WorksiteCommandHelperFailure` `:626`, artifact member `:647`, `isHelperFailure` `:1834`, constructor `:1893-1898`, `:1935`, validator `:1956`, `:1965`, prefix vectors `:2043`. (b) `T/code/src/implementation/worksite_command_execution.ts` `failure` `:236-238`, completion `:744-750`; C2 pin `T/code/src/gtl/worksite_command_execution.ts:37`, `:39`, `:61`, `T/contracts/worksite/command-execution-context.inventory.json`. (c) case `T/test_env/tests/t287-worksite-command-execution.test.mjs:1070` (`installedC2Case` `:507`, `helperFailureTransport` `:193`, `assertHelperFailureAdmitted` `:238`) |
| 5, design records | done | `T/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` §9.3 item 4 `:574`, §10.1 row 6 `:594`, §10.3 O-TYPE `:611`, §10.5 P-LIFECYCLE `:639`, §10.6 row 6 `:654` |
| 6, seam lane | done | `T/test_env/tests/t287-reacquisition-root-contract.test.mjs:9`, `:22`, `:25` |
| 7, `:826` fixture | done | `T/test_env/tests/t287-worksite-command-execution.test.mjs:445` (`:345` at `3dbd3cd2f`) |
| 8, final run | done; every failure attributed | `W/step-8-run-postclose-d.log` |
| 9, records | done | ticket `### Library delivery close (2026-10-23)`; `specification/GOALS.md` library paragraph |

**Item 1.** `sameAdmittedRefs` admits the retained vector through `admitJson`; a refusal, or an admitted vector not `canonicalEquals` to `bindingCoverEventRefs`, is the mismatch the constructor's predicate turns into its `TypeError`. The length check is gone (canonical equality covers it). On the head build, a sparse `Array(n)` cover vector gives a returned `worksite_command_forward_task` that `isWorksiteCommandForwardTask` refuses, directly and after a JSON round trip; the new case fails there with `Missing expected exception (TypeError)` (8 pass, 1 fail). After: 9/9; the dense control constructs and validates.

**Item 2.** 867 rows: every `canonicalEquals(` call at `0c362da15` whose call text is absent at head. Re-typed 846 (765 the cast gone; 41 an operand admitted at the site; 27 an absent member narrowed by `presentMember` or `?? null`; 13 others, each named in its action cell: a typed accessor that throws on absence as the call did, a bound value whose absence is refused before the call, an operand or both admitted at the site, and `abg/retry.ts:5868`, whose whole-plan call is split by member into three `canonicalEquals` calls at `:5784`, which is why that file's count rises from 26 to 28). Merged 20: six in `abg/semantic_job.ts` into `outputIs` (`:391`); nine in `abg/semantic_revision.ts` into `projectionIs` (`:676`); five into `semanticInputAtBasisEquals` (`abg/semantic_stage.ts:151`). Scalar 0. Structural 1: `product/worksite_command_forward.ts:134`, the equal-length index `===` loop, returned to `canonicalEquals` over the admitted vector by item 1. The raw diff count is 624 `canonicalEquals(` calls on 561 removed lines over `0c362da15..99b80d6f5` and 627 on 564 to head; the table counts calls whose full text at `0c362da15` is absent at head. 618 rows have their `canonicalEquals(` line among the removed lines; the other 249 are multi-line calls whose first line is unchanged while an operand line changed (867 = 618 + 249); the 9 removed-line calls that are not rows kept their full text on a moved line. `isDeepStrictEqual` sites are the same set at both ends. No private structural equality introduced by the plan remains.

**Item 3.** `projectRuntimeFailureCandidate` maps an admitted outcome receipt's `runtimePrefix` to `{ kind: "runtime_prefix_selection", coordinate, runId, eventStoreDigest, eventCount, lastAdmissionOrdinal }`: `coordinate` is the receipt's own `successorPrefix`, `runId` the first `run_segment_opened` of the selection (as replay derives it, `abg/replay.ts:1253`), `eventStoreDigest` `runtimeEventPrefixDigest` (as `replay.ts:1369`), count and ordinal from `runtimeEventPrefixExtent`. Coordinate and selection name one cut: a receipt's `runtimePrefix` is its Run's selection of the history at its `successorPrefix`, projected in the transaction that commits to that coordinate (`abg/c_call_outcome.ts:1559-1563`, `:1586-1589`) or at it on rehydration (`:986-1005`), and checked by digest when the receipt is admitted further (`:1522-1525`). A completion admission's `outcome` is projected the same way, so a nested receipt keeps its earlier cut while the transition keeps its later `successorPrefix`; any other value passes through; the result is admitted through `admitJson` and a refusal throws. The five sites call it; the five `as unknown as JsonValue` casts are gone; stage, `diagnostic://` class references and event payload keys are unchanged. Case `:372`, on one store with a second Run opened: (i) the five site shapes (`recursion:571` advanced admission, `:1028` application_ready, `:1054` blocked with a blocked receipt, `workflow:727` retry receipt, `:1075` advanced) each encode `"runtimePrefix":{"kind":"owned_runtime_event_prefix","selection":{}}` unprojected and no `"selection":{}` projected; the projected prefix equals the expected selection; every other member is unchanged; a refusal passes through. (ii) Recursion route: `blockRecursion` from the real module, with the real `admitRuntimeFailure`, admits `runtime_failure_observed` whose `subjectDigest` is `sha256Canonical({ stage: "blocked-completion", candidate: projected })` and not that of the unprojected candidate (`:462-463`). Workflow route: `completeOwnedWorkflowLocus` from the real module through the real `failTraversal` throws `graph_traversal_failure` (`workflow-retry-outcome-invalid`) and admits `runtime_failure_observed` with the projected subject's digest (`:484-485`), on its own store because a failed scope admits no second failure. (iii) Two Run selections over one physical prefix: one coordinate, equal unprojected digests, distinct projected digests, each naming its own Run. (iv) A receipt admitted at the earlier cut keeps that coordinate inside the later transition; earlier count < later count. The cold projection answers `not_retained` with the admitted digest. Before the change: the head hog sources on the current build fail at `:462`; with only the workflow source at head, at `:484`. After: the lane is 12/12.

**Item 4.** (a) The four helper throws after launch become `WorksiteHelperFailure`, a `TypeError` whose message is byte-identical to the head message and which carries the subject, with `processFacts` encoded once at the throw site. `main` catches only that class from the command and HTTP loops, takes the after-observations as before, constructs the artifact with disposition `failure` and member `failure` (the subject, `attemptRef` from the manifest), publishes it create-only, then rethrows: no acknowledgment, non-zero exit. Pre-launch failures and `main`'s own two cleanup throws are unchanged. The Product helper artifact type, constructor and exact-key validator accept `failure` with that member only, prefix-partial vectors allowed on that disposition; every other disposition's bytes are unchanged. `isWorksiteCommandExecutionFailure` is unchanged. (b) On disposition `failure` the parent admits the subject through `admitJson` and returns `failure("helper_failure", constructRuntimeFailureDiagnosticRef(subject))`, which puts the inline reference in both `diagnosticRef` and `resultCandidate.diagnosticRef`; a refused subject or a foreign `attemptRef` is `helper_artifact_contract_failure`; an absent artifact stays `helper_artifact_absent`. `diagnostic://abiogenesis/worksite/command-execution/` occurs at `:238` (the default) and `:828` (preparation-invalid) only; no reader in `code/src` or `test_env` keys on it. The C2 pin: Product module digest `sha256:84555f3f…`, byte count 113382, span `103421-105729` with its span digest unchanged; the inventory digest and the generated `capability-definition-graph.json` and `product-toolchain-manifest.json` follow. (c) Path: an installed Public C1 to C2 run (package packed from this tree), whose fake worker spawns the real installed helper under a module hook on `shared/owned_process_lifetime.js` (group probe `unknown`, grace 5 ms) for one `node -e ''` command, records the hook's final facts, and relays a schema-valid acknowledgment. The helper exits 1 with `worksite command cleanup unresolved; dependent work stopped: …` and no stdout. The subject travels in the `c_call_result_admitted` event, member `payload.value.diagnosticRef` (`resultClass` `failure`, value `worksite_command_execution_failure`, `failureClass` `helper_failure`, accepted by the unchanged guard). Cold read: `readRuntimeEventsAtDurablePrefix` over a JSON copy of the closed prefix, then the installed `readRuntimeFailureDiagnosticSubject`: `failureClass` `command_cleanup_unresolved`, the task refs, `command.terminationConfirmed` `false`, diagnostic `TypeError` `ABI owned process cleanup unresolved…`, and `processFacts` deep-equal to the facts the hook recorded inside the helper for its own command child (`directExit` `{status:0,signal:null}`, `scopeAbsence` `unknown`); the published artifact's `failure` equals the subject. Subject 3561 bytes canonical; inline reference 4887 bytes. With the five D15 sources at head and rebuilt, the case fails at `:253` with `helper_artifact_absent`; after, it passes (75.5 s in the final run). The case has its own installed setup and C1: one C1 source result admits one C2 invocation, because the source basis is rehydrated at the entry prefix and at the source Run's closure and these differ after a first C2 Run (an inline second invocation was refused with `invalid_input /observation`, then `worksite-environment-authority-mismatch`).

**Item 5.** §9.3 item 4 states the realized route; §10.1 row 6 and §10.6 row 6 name the `failure` disposition, the inline reference and the moved helper lines, and keep "no Product output contract changes"; §10.3 O-TYPE carries the D14 sentence and the no-private-structural-equality sentence; §10.5 P-LIFECYCLE names the case of 4(c).

**Item 6.** The lane binds `canonicalEquals` (import, `new Function` parameter, argument). Head: 0 pass, 1 fail (`ReferenceError: canonicalEquals is not defined`), 1 skip. After: 1 pass, 1 skip, the baseline set.

**Item 7.** `promptDigest: product.sha256Canonical(request.prompt)`. Head: the case fails at `:826` (`step-8-run-postclose.log`). After: it passes (84.3 s alone; 82.8 s in the final run); no second cause.

**Item 8.** Build, `lint:imports` (28 modules) and `lint:lifecycle` (284 modules, 10 allow-listed, no offender) pass. Named lanes: `forward-command-contracts` 9/9; `t287-runtime-failure-diagnostic` 12/12; `t287-lifecycle-failure-carrier` 5/5; `t287-worksite-command-execution` 5/5 (the success case 82.8 s, the helper-failure case 75.5 s); `m5-worker-transport` 21/21; `t287-common-computational-library` 9/9; `t287-calculus-fold` 7/7; `t287-reacquisition-root-contract` 1 pass, 1 skip; `w2-steel-single-start-closure` 8 skips (retained installed roots absent, as `## Post-close repair return C` records); `forward-command-owners` 2 pass, 4 fail and `t287-observed-worksite-command` 7 pass, 1 fail (`:43` at `:121`), each its `step-8-run-postclose.log` set. Item 2 touched no lane beyond item 1's. Integrated run, the 46 files plus `t287-runtime-failure-diagnostic` and `t287-reacquisition-root-contract` in one invocation: 345 tests, 270 pass, 54 fail, 2 cancelled, 19 skipped, 1160 s; 25 files red against 26. Attribution compares each failing test's file and line, first error line and first test-file location with `step-8-run-postclose.log`: no failing test is new. Absent here: `t287-worksite-command-execution` `:407` (item 7), and three of the four `t287-calculus-state-transfer` shapes, which now pass; its `:64` timeout recurs as recorded, with `identity_end` cancelled at it. `test:uat:harness`: 30 pass, 1 fail, 3 skip; the failure is the recorded `harness.test.mjs:471` budget (18025250 against 18015000). No `lifecycle failure subject is not JSON after projection` refusal occurs. The attribution is appended to the log.

**Residuals.**

- The projected prefix's Run member is the selection's first `run_segment_opened` Run, as replay derives it; no accessor was added to the owned prefix.
- The helper's two cleanup-unresolved subjects carry `diagnostic: { name: "TypeError", message }` with the decoded stderr as message, as their head message text does.
- The artifact's four failure classes (`command_failed`, `command_cleanup_unresolved`, `http_probe_failed`, `http_cleanup_unresolved`) are the helper artifact's own; the Product failure value's kind and class set are unchanged, `helper_failure` being the class the parent's `helper_${disposition}` path already yields.
- On a helper failure the artifact's disposition is `failure` whatever the after-observations show; the parent compares protected observations and the product inventory itself before it reads the artifact.
- The whole path covers `command_cleanup_unresolved`. The other three classes (`command_failed`, `http_probe_failed`, `http_cleanup_unresolved`) are checked by a scratch probe outside the lanes: each subject, as its throw site builds it under a stubbed lifetime, constructs a `failure` artifact through the Product constructor and passes `isWorksiteExecutionHelperArtifact` directly and after a JSON round trip, and a subject missing its members is refused. No lane drives those three into an artifact.
- `t287-worksite-command-execution` runs about 75 s longer for the second installed setup.

## Disposition of repair D (Executive, 2026-10-23)

Accepted at `0eacd4668`. Read: the Return against the activation's nine items; the diffs of `product/worksite_command_forward.ts` (`sameAdmittedRefs`), `abg/runtime_failure.ts` (`projectRuntimeFailureCandidate`), the five hog sites (no cast remains; the class references unchanged), `implementation/worksite_command_helper.ts` (`WorksiteHelperFailure`, the four throw sites, `main`'s catch, publication and rethrow), `product/worksite_command_execution.ts` (the `failure` disposition and member, `isHelperFailure`'s exact member set, the prefix-vector rule; `isWorksiteCommandExecutionFailure` unchanged), `implementation/worksite_command_execution.ts` (`failure` with the inline reference; the completion path returns on the artifact it read, before parsing the acknowledgment, as it did for every non-success disposition); the C2 pin; the design diff (§9.3 item 4, §10.1 row 6, §10.3 O-TYPE, §10.5 P-LIFECYCLE, §10.6 row 6); the comparison census (867 rows: 846 re-typed, 20 merged, 1 structural returned); the five D14 census rows; the three test diffs and the whole-path case (`t287-worksite-command-execution.test.mjs:193-300`, `:1070`); the attribution appended to `step-8-run-postclose-d.log`; the ticket and GOALS diffs; `capability-definition-graph.json` and the manifest, changed in digest and reference fields only. Executive check on the head: `tsc --noEmit` rc 0; `lint:imports` 28 modules rc 0; `lint:lifecycle` 284 modules, 10 allow-listed, no offender, rc 0; `forward-command-contracts` 9/9; `t287-runtime-failure-diagnostic` 12/12; `t287-reacquisition-root-contract` 1 pass, 1 skip; `t287-common-computational-library` 9/9; `t287-calculus-fold` 7/7; `t287-lifecycle-failure-carrier` 5/5; `t287-worksite-command-execution` 5/5; tree clean but for the untracked uat harness outputs and two untracked Codex files.

| Return item | Disposition |
|---|---|
| 1, forward-task comparison | accepted; the fourth review's S2 closed with its negative case |
| 2, comparison census | accepted; one structural row, item 1's; the §10.3 sentence stands |
| 3, D14 | accepted; the evidence covers the five shapes, both routes, two selections over one prefix, the preserved earlier cut; the cold projection still answers `not_retained`. Residual recorded: the Run member is the selection's first `run_segment_opened`, as replay reads it |
| 4, D15 | accepted on the whole path: a real installed helper under a lifetime hook, the real parent, leaf port and C-call admission, the subject read cold from the store. The case fakes the worker, as the suite's success case does; the acknowledgment it relays carries placeholder artifact-digest members, which the parent does not read on any non-success disposition (pre-existing; for the Reviewer). The other three helper failure classes are validator-checked by a probe outside the lanes; no lane drives them into an artifact (for Jim) |
| 5, design records | accepted |
| 6, seam lane | accepted; the baseline's set |
| 7, `:826` fixture | accepted; the baseline defect listed for Jim since step 8 is discharged in the test |
| 8, final run | accepted; no new failing test against `step-8-run-postclose.log`; two lanes better |
| 9, records | accepted |

The library closes here: the plan's completion condition is met (no O-* open), the design's proofs hold on their whole paths as the closing post restates, and the claim is restated in `20261022T060245Z_CLOSE_library_consolidation.md`. Next: the independent review.

## Fifth review (pasted by Jim, 2026-10-24; read-only, frozen-source inspection, in-memory probes and log comparison; subject `b5b8d0e24`, range `837781a1a..b5b8d0e24`)

Verbatim.

> Changes required at b5b8d0e24: one S2 and one S3. No S0, S1 or S4 findings. All locations below refer to that frozen cut. The requested range contains both repair B (d8cf6b5d9) and repair D (0eacd4668).
>
> 1. S2 — D15’s declared failure path still cannot supply the acknowledgment required to reach the retained facts.
>
>    The helper publishes its failure artifact, then throws at worksite_command_helper.ts:1492, before acknowledgment construction and output.
>
>    The worker’s instruction requires it to return that acknowledgment unchanged, and forbids another tool call. product/worksite_command_execution.ts:2263
>
>    Parent completion requires successful transport before reading the artifact. With absent or rejected worker output, it returns transport_identity_mismatch at implementation/worksite_command_execution.ts:708; the failure subject at lines 744–749 is never consumed.
>
>    The new test supplies the missing prerequisite: it manufactures an acknowledgment with zero-filled artifact coordinates and reports success at t287-worksite-command-execution.test.mjs:229, while line 243 explicitly verifies that the helper emitted no acknowledgment.
>
>    Consequently, the test proves the downstream admission and cold-read path under a supplied successful exchange. It does not discharge the declared helper→worker→parent failure handoff. This is distinct from the known unread acknowledgment digest.
>
>    Bounded repair: emit the truthful artifact acknowledgment before rethrowing, retain the non-zero exit, and make the controlled worker relay actual helper stdout unchanged. Alternatively, explicitly design authenticated artifact consumption on failed transport.
> 2. S3 — Current-status records disagree at the frozen cut.
>
>    GOALS.md:79 still describes lifecycle implementation and helper failure retention as unimplemented, contradicting its updated Current Selection. T-287:5371 still calls the retained casts the “O-TYPE open list,” despite the later closure statements.
>
>    This condition is not discharged at b5b8d0e24. The later documentation commit bd336a99b addresses these stale passages; it is outside the reviewed cut.
>
> The fourth-review conditions resolve as follows:
>
> | Condition | Verdict | Evidence |
> |---|---|---|
> | Forward-task sparse regression | Discharged | Independent probes of the exported constructor accept dense and foreign-realm dense controls; sparse, undefined and mismatching references throw TypeError. Returned controls pass their guard and JSON round trip. |
> | Comparison census | Supported by sampling | Exactly 867 rows: 846 retyped, 20 merged, one structural. Sixteen source-pair samples agree with their classifications. This is not exhaustive behavioral verification. |
> | Fold claim | Discharged | B removes the per-advance state copy, and the design now makes that bounded claim. The recorded clip-scan cost is excluded from findings. |
> | D12 realm rule | Discharged | Code and decision agree. Independent probes accept foreign records/arrays and refuse the fourth-review prototype counterexamples and the named-Object instance. |
> | D14 representation | Discharged | All five sites project through the failure owner. The outcome’s own coordinate, Run selection, digest, count and ordinal survive; nested outcomes retain their earlier cut. Event construction is unchanged and no retention is introduced. Tests use controlled upstream receipts and real failure-admission paths. |
> | D15 whole-path handoff | Partially discharged | Artifact publication, downstream inline diagnostic admission and cold retrieval work under the supplied exchange. The actual acknowledgment handoff remains broken as described above. |
> | Final-run attribution | Discharged within its stated scope | All 46 B files remain, with two additions. No new failing identity appears. Shared errors match; identity_end’s changed cancellation matches B’s recorded standalone current/baseline reruns. Load failures remain coverage limitations. |
> | Records | Not fully discharged at this cut | S3 above, plus the D15 closure claim needs narrowing until its protocol repair holds. |
>
> The artifact contract expansion is explicitly selected by D15 and the design. It preserves success rules; isWorksiteCommandExecutionFailure remains unchanged. I found no separate unauthorized Product failure-value change.
>
> Review used frozen-source inspection, in-memory probes and log comparison. No builds, suite reruns, edits, commits or pushes.

## Disposition of the fifth review (Executive, 2026-10-24)

Verified by reading at `bd336a99b`: `implementation/worksite_command_helper.ts:1486-1504`, where `main` publishes the artifact, checks it under the archive root, and then `if (failed !== null) throw failed;` precedes the construction and `process.stdout.write` of `workerReturnProjection`, so a failed helper prints no acknowledgment; `implementation/worksite_command_execution.ts:708`, where `exactExchange` (`:255-281`) requires `observation.disposition === "success"`, one Bash invocation and the planned tool-input digest before the artifact is read, so a worker that returns nothing never reaches the `disposition === "failure"` branch at `:744-749`; `product/worksite_command_execution.ts:2263-2266`, where the worker must return the acknowledgment unchanged and may make no other tool call; the test's controlled worker, which manufactures the acknowledgment with zero-filled artifact coordinates (`:229-231`) and asserts the helper's stdout empty (`:243`). The Executive's disposition of repair D recorded the fake worker and the placeholder digest and took the proof as whole-path; that was wrong: the proved path begins at the artifact, not at the helper's exit.

| Finding | Severity (Reviewer) | Priority (Executive) | Disposition |
|---|---|---|---|
| 1: the helper prints no acknowledgment on failure; the parent refuses the exchange before the artifact; the case supplies the acknowledgment the helper never emitted | S2 | P1 | Repair E, items 1 to 4: the helper prints its acknowledgment for every disposition before its non-zero exit; the worker instruction says a non-zero helper exit after its acknowledgment is an observation; the parent binds the acknowledgment to the artifact on every disposition (the unread-digest item for Jim, discharged with it); the controlled worker relays the helper's stdout unchanged. D15's row restated when E lands; until then the claim is narrowed in place (ledger, closing post, GOALS, ticket). |
| 2: GOALS `:79` and T-287 "O-TYPE open list" | S3 | P2 | GOALS and T-287's current surfaces restated at `bd336a99b`; the "O-TYPE open list" wording fixed with this disposition; the D15 sentences narrowed with this disposition and restated by E item 7. |
| Fourth-review conditions | — | — | Six discharged or supported as the table says; D15 partially, E; records, this row. |

## Post-close repair activation E (Executive, 2026-10-24; D15 route)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Head is the Executive's bookkeeping commit after the fifth review (this section). Read this section, `## Fifth review` and `## Disposition of the fifth review` above, `## Post-close repair activation D` item 4 and `## Post-close repair return D` item 4, design §9.3 items 3 and 4 and §10.6 row 6, and the files named below. Do not read other agents' comment directories.

Items, in this order. The Return carries one row per item: done or stopped, with lines at head.

1. **The helper prints its acknowledgment for every disposition.** `implementation/worksite_command_helper.ts` `main`, `:1486-1504`: after `publishCreateOnly` and the archive-root check, construct `workerReturnProjection` from the published artifact and write it to stdout exactly as the success path does, for every disposition; await the write's completion (`process.stdout.write(line, callback)` wrapped in a promise; a pipe is asynchronous on macOS, and an uncaught rejection does not drain it) and only then `if (failed !== null) throw failed;`. The exit stays non-zero on failure and the stderr message the installed case asserts stays. No other change to `main`.
2. **The worker instruction.** `product/worksite_command_execution.ts` `renderWorksiteCommandExecutionPrompt`, after "A nonzero subject-command exit is an observation, not a transport failure." (`:2264`): add the one sentence "A nonzero helper exit after it has printed its acknowledgment is also an observation; return that acknowledgment unchanged." Nothing else in the prompt. Regenerate the C2 pin in `gtl/worksite_command_execution.ts:37-61` (source digest, byte count, span bytes, span digest) the way repair D did; `npm run build` regenerates the manifest and contract digests. This is the Executive's decision under D15; reversal for Jim: delete the sentence and refresh the pin.
3. **The parent binds the acknowledgment to the artifact on every disposition.** `implementation/worksite_command_execution.ts` completion, `:736-770`: after the artifact is read, validated and byte-checked (`:736-742`) and before the disposition branch (`:744`), parse `exchange.observation.finalOutput` and construct the worker result as the success path does (`:753-765`), and require `helperArtifactRef` and `helperArtifactDigest` of the acknowledgment to equal the artifact's `artifactRef` and `artifactDigest` (read `constructWorksiteCommandExecutionWorkerResult` first: if it already binds them, say so and add nothing). A malformed or non-binding acknowledgment returns `result_contract_failure` as today; no new failure class. The success path keeps its order after that point. Report which existing lanes, if any, change an expected failure class under this ordering; if one does, stop item 3 and report it, do not edit the expectation, and let items 1, 2 and 4 land.
4. **The controlled worker relays the helper's stdout.** `test_env/tests/t287-worksite-command-execution.test.mjs` `helperFailureTransport` (`:193-235`): replace the zero-filled acknowledgment (`:229-231`) with the helper's own stdout: exactly one JSON line, parsed and emitted unchanged as `structured_output`; the worker still refuses a helper exit of 0. `assertHelperFailureAdmitted` (`:238-`): replace the empty-stdout assertion (`:243`) with: stdout is exactly one line, it parses to the acknowledgment, its `attemptRef` is the admitted subject's, and its `helperArtifactRef` and `helperArtifactDigest` equal the published artifact file's (locate the artifact from the acknowledgment or the helper plan, read its bytes, digest them); the exit is non-zero; the admitted failure, its class, the Product guard and the cold read of the subject are asserted as before. Add two component cases beside the suite's existing harness (`exactHelperExchange`, `:345`): (a) an acknowledgment whose `helperArtifactDigest` is not the artifact's, with a failed artifact, returns the class item 3 settles; (b) an exchange whose observation disposition is not success, with a failed artifact, returns `transport_identity_mismatch` (the fifth review's trace, as a pinned refusal). If the harness cannot supply a failed artifact in one bounded attempt, land (b) only and say so.
5. **Design records.** §9.3 item 4 and §10.6 row 6: the helper prints its acknowledgment for every disposition before its exit; the worker returns it regardless of the helper's exit; the parent binds the acknowledgment to the artifact before it reads the disposition. §10.5 P-LIFECYCLE if it names the helper route. State what is realized, nothing prospective.
6. **Final run.** `npm run build`, `npm run lint:imports`, `npm run lint:lifecycle`, `npx tsc --noEmit -p tsconfig.json`; the lanes `t287-worksite-command-execution`, `t287-observed-worksite-command`, `forward-command-contracts`, `forward-command-owners`, `t287-runtime-failure-diagnostic`, `t287-lifecycle-failure-carrier`, `m5-worker-transport`, `t287-reacquisition-root-contract`; then the same 48-file run as repair D (`step-8-run-postclose-d.log` lists the files and the command shape) into `step-8-run-postclose-e.log`, attributed file by file against D's log: no failing identity that D's log does not carry, each difference explained.
7. **Records.** GOALS Current Selection (the D15 sentence) and the ticket's `### Library delivery close (2026-10-23)` D15 sentence: the realized route from the helper's exit through the worker's acknowledgment to the admitted failure, or the stop. The ticket subsection's test-reality line for the final run.

**Grant.** `implementation/worksite_command_helper.ts` (`main`'s tail, item 1); `product/worksite_command_execution.ts` (the one sentence, item 2); `gtl/worksite_command_execution.ts` (the pin, item 2); `implementation/worksite_command_execution.ts` (the completion's acknowledgment binding, item 3); `test_env/tests/t287-worksite-command-execution.test.mjs`; the design §9.3, §10.5, §10.6; `specification/GOALS.md` Current Selection and the ticket's close subsection; `step-8.md` below this section only; `step-8-run-postclose-e.log`; build outputs `npm run build` regenerates.

**Stop:** a new failure class; any change to `isWorksiteCommandExecutionFailure`, to an event contract or payload key list, or to the helper's exit semantics (non-zero on failure); prompt text beyond the one sentence; an existing lane whose expected class changes under item 3 (stop item 3 only); a second bounded attempt at any item; any push.

**Return contract.** One commit on `main`, no push. First line `Post-close repair E: helper acknowledgment on failure (D15); acknowledgment bound to the artifact; final run`, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append `## Post-close repair return E` with: one row per item (done or stopped, lines at head); the whole-path case's acknowledgment and artifact digests as printed; the lane results as `tests/pass/fail/skipped`; the final-run table (files, tests, pass, fail, cancelled, skipped) and the attribution against D's log; the stop reports, if any, with the counterexample.

## Post-close repair return E

All seven items landed; nothing stopped. The helper prints its acknowledgment for every disposition and drains the write before it rethrows a failure, so it still exits non-zero with the same stderr message. The worker instruction carries the one sentence. The parent binds the acknowledgment to the artifact before it reads the disposition. The controlled worker relays the helper's one stdout line unchanged. `T` is `build_tenants/abiogenesis/typescript`; `W` is this directory.

**Commit.** The commit carrying this Return, on `main` over `1fafd137a`, first line `Post-close repair E: helper acknowledgment on failure (D15); acknowledgment bound to the artifact; final run`.

| Item | State | Lines at head |
|---|---|---|
| 1, helper acknowledgment for every disposition | done | `T/code/src/implementation/worksite_command_helper.ts` `main`: acknowledgment `:1494-1502`, awaited write `:1503-1508`, rethrow `:1509` |
| 2, worker instruction | done | `T/code/src/product/worksite_command_execution.ts:2265`; C2 pin `T/code/src/gtl/worksite_command_execution.ts:37`, `:39`, `:61`; `T/contracts/worksite/command-execution-context.inventory.json` |
| 3, acknowledgment bound to the artifact | done; no lane changes class | `T/code/src/implementation/worksite_command_execution.ts` completion: parse `:745-750`, construct `:751-756`, binding `:757-760`, disposition branch `:761` |
| 4, controlled worker relays the helper's stdout | done, (a) and (b) | `T/test_env/tests/t287-worksite-command-execution.test.mjs`: relay `:232-234` in `helperFailureTransport` (`:196`); `assertHelperFailureAdmitted` (`:239`) acknowledgment `:244-251`, relay `:259-263`, artifact binding `:283-295`; `assertHelperFailureExchanges` (`:308`), (a) `:342-348`, (b) `:349-352`, called at `:933-934`; case `:1151` |
| 5, design records | done | `T/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` §9.3 item 4 `:574`, §10.5 P-LIFECYCLE `:639`, §10.6 row 6 `:654` |
| 6, final run | done; no failing identity beyond D's log | `W/step-8-run-postclose-e.log` |
| 7, records | done | `specification/GOALS.md:37`, `:46-55`; ticket `### Library delivery close (2026-10-23)` `:5290-5291`, `:5297-5301`, P-LIFECYCLE `:5353`, baseline attribution `:5355`, post-close review finding 1 `:5387` |

**Item 1.** The construction of `workerReturnProjection` and its write move above `if (failed !== null) throw failed;`. The write is `process.stdout.write(line, callback)` wrapped in a promise and awaited, on the success path as well; then the rethrow. Nothing else in `main` changes. Pre-launch failures and `main`'s two publication checks still throw before any output.

**Item 2.** The sentence is appended to the paragraph string `"A nonzero subject-command exit is an observation, not a transport failure."` after one space, so the prompt keeps its paragraph count and the controlled workers' `split('\n\n')[1]` still selects the command object. Pin, from the built module: digest `sha256:3266a85c7c58a0280eb97c951517f0a891f8bfd8b9c17f2f6122d75e137ff2fe`, byte count 113506 (was 113382), span `103421-105853` (was `103421-105729`), span digest `sha256:1fcd71846ed7a57571a96bf3bb6475aeaba3d4f89eafb121969c157904a896bf`. The start byte is unchanged; the byte count and the end byte each grow by the 124 inserted bytes. The span occurs once in the module. `npm run build` regenerated the inventory, `contracts/capabilities/capability-definition-graph.json` and `product-toolchain-manifest.json`.

**Item 3.** `constructWorksiteCommandExecutionWorkerResult` does not bind the acknowledgment to the artifact. It checks the shape (the ref derived from the digest in the task's namespace), the task ref and digest, and the attempt. At `1fafd137a` the comparison with the artifact's `artifactRef` and `artifactDigest` existed only inside `constructWorksiteExecutionObservation`, on the success path. The parse and construction move from the success path to before the disposition branch, the binding follows them, and the success path reuses `workerResult` in its existing order. Every refusal is `result_contract_failure`; no class is added. No lane changes its expected class. The only lane that asserts this completion's classes is `t287-worksite-command-execution` (grep over `test_env` for `helper_(protected|territory|product)_mismatch`, `/helper_`, `helper_failure`, `helper_artifact` and `result_contract_failure`). Its nine raw-acknowledgment negatives answered `result_contract_failure` before and still do. Its artifact, manifest, absent-artifact and protected-source negatives are decided before the new point. The final run confirms both.

**Item 4.** The controlled worker refuses a helper exit of 0, requires exactly one stdout line, and emits it parsed as `structured_output`. The schema and zero-filled lines are removed. `assertHelperFailureAdmitted` checks five things:

- the stdout is one canonical line naming the task;
- the C2 `actor_result_artifact_observed` carries that line as `finalOutput`;
- its `attemptRef` is the admitted subject's;
- its `helperArtifactRef` and `helperArtifactDigest` equal those of the published artifact file. The file is located through the helper plan for that attempt. The test checks that its bytes are canonical and recomputes the digest as `sha256Canonical` of the artifact body without `kind`, `schemaVersion`, `artifactRef` and `artifactDigest`, which is how the Product constructor digests it; the file's byte digest is a different value and is printed separately;
- the exit is non-zero, and the stderr message, the admitted failure, its class, the Product guard and the cold read are unchanged.

(a) and (b) run over a second failed artifact. In the same installed case, the installed helper runs again for a direct occurrence under the same hook, with its own facts file. Three exchanges go to that occurrence's real `complete`:

- the relayed acknowledgment answers `helper_failure`, and its inline subject is the artifact's `failure`;
- (a) a coherent acknowledgment naming another artifact, the zero-filled one the earlier worker manufactured, which `isWorksiteCommandExecutionWorkerResult` accepts, answers `result_contract_failure`;
- (b) the relayed acknowledgment under an observation of disposition `failure` answers `transport_identity_mismatch`.

Discrimination probes (scratch, restored and rebuilt before the final run). With the binding at `:757-760` removed, the case fails at `:347`: (a) answers `helper_failure`. With the rethrow before the write, the case fails at `:246`: the helper prints nothing and the worker refuses.

Whole-path digests as printed by the case in the named lane run (`W/step-8-run-postclose-e.log:40`):

| Member | Value |
|---|---|
| acknowledgment line `sha256Bytes` | `sha256:29cc9031b90563a26b51fb4537d453a1899403bd860b773c88b00fa8c8310f09` |
| `ack.helperArtifactDigest` | `sha256:563c8a785955149d805e7b54cd6b79f8b7f282efe49e1ed9edd9ed470edf8dc4` |
| recomputed artifact digest | `sha256:563c8a785955149d805e7b54cd6b79f8b7f282efe49e1ed9edd9ed470edf8dc4` |
| artifact file `sha256Bytes` | `sha256:6abaff97b50b03880b8d78aeb67d0119ea96ebcb03995c4e54c2b8615782106e` (6806 bytes) |
| subject | 3561 bytes canonical |
| inline reference | 4887 bytes |

The values are per run, because the artifact carries its sandbox root. The integrated run printed `sha256:a847d4a0eea81616a2ab6eabf0a693ba3d994216310cd2659ca10905ad6b13aa`, `sha256:6050f1d5ffeee3ce8ea7ef3a61862ab049d0fe4315d03c0a989c18e3b22f311d` twice, and `sha256:b8ad495479b9460564ef46ab14251ad7b888b52c0be7b9eb5129756db6d9eafd`.

**Item 5.** §9.3 item 4 states the realized route. The helper prints its acknowledgment for every disposition and waits for the write before it rethrows. The worker returns the acknowledgment whatever the helper's exit, as the renderer's sentence instructs. The parent accepts only a successful transport with the planned Bash invocation. After it checks the artifact and before it reads the disposition, the parent requires the acknowledgment's ref and digest to equal the artifact's, `result_contract_failure` otherwise. P-LIFECYCLE names the case at `:1151` and `:239` and the exchanges at `:308`. §10.6 row 6 adds the acknowledgment sentence and keeps "no Product output contract changes".

**Item 6.** `npm run build`, `lint:imports` (28 modules), `lint:lifecycle` (284 modules, 10 allow-listed, no offender) and `npx tsc --noEmit -p tsconfig.json` pass.

| Lane | tests/pass/fail/skipped |
|---|---|
| `t287-worksite-command-execution` | 5/5/0/0 (the success case 86.7 s; the helper-failure case with its exchanges 80.1 s) |
| `t287-observed-worksite-command` | 8/7/1/0 (`:43`, D's set) |
| `forward-command-contracts` | 9/9/0/0 |
| `forward-command-owners` | 6/2/4/0 (D's set) |
| `t287-runtime-failure-diagnostic` | 12/12/0/0 |
| `t287-lifecycle-failure-carrier` | 5/5/0/0 |
| `m5-worker-transport` | 21/21/0/0 |
| `t287-reacquisition-root-contract` | 2/1/0/1 |

| Run | Files | Tests | Pass | Fail | Cancelled | Skipped | Wall |
|---|---|---|---|---|---|---|---|
| E, 48 files, one invocation | 48 (25 red) | 345 | 270 | 54 | 2 | 19 | 1224 s |
| D (`W/step-8-run-postclose-d.log`) | 48 (25 red) | 345 | 270 | 54 | 2 | 19 | 1160 s |

Attribution, by failing test file and line, first error line and first test-file location: 56 identities in each log, none only in E and none only in D. The `t287-calculus-state-transfer` `:64` timeout and the `identity_end` cancellation at `:70` recur as in D. `t287-worksite-command-execution` is green in both. Its installed cases move from `:1063`/`:1070` to `:1144`/`:1151` and pass in the run (93.2 s, 86.4 s). `test:uat:harness`: 34 tests, 30 pass, 1 fail, 3 skip; the failure is the recorded `harness.test.mjs:471` budget (18025250 against 18015000). No `not JSON after projection` refusal occurs. The attribution is appended to the log.

**Item 7.** GOALS Current Selection points at this Return and states the realized route: the helper's failure artifact and acknowledgment, the worker's unchanged return, the parent's binding and the inline subject. It states that the installed case drives the route from the helper's exit, through a controlled worker relaying the helper's stdout, to the admitted result. The ticket subsection points at this Return. Its D15 sentence states the route from the helper's exit on. Its P-LIFECYCLE bullet names the binding and the case at `:1151`. Its baseline attribution carries E's final run. Its post-close review finding 1 names repair E for the acknowledgment handoff.

**Residuals.**

- The Executive's narrowing at `1fafd137a` in the plan post's Ledger (`:389`) and in the closing post (`20261022T060245Z_CLOSE_library_consolidation.md`), both under `.ai-workspace/comments/claude/`, says D15's row and the post are restated when E lands. Both posts are outside this grant and are not restated.
- The worker in both installed cases is still a controlled worker; no model reads the new sentence.
- The other three helper failure classes (`command_failed`, `http_probe_failed`, `http_cleanup_unresolved`) still reach an artifact only in repair D's scratch probe. They share item 1's write and item 3's binding.

## Disposition of repair E (Executive, 2026-10-24)

Accepted at `280f5777f`. Read: the Return against the activation's items; the helper's `main` tail (the acknowledgment built for every disposition, the write awaited, the rethrow after it); the parent's completion (the acknowledgment parsed and bound to the artifact's `artifactRef` and `artifactDigest` before the disposition branch, `result_contract_failure` on a mismatch, the failure branch unchanged after it); the one sentence in the renderer and the C2 pin; the test's controlled worker (relays the helper's one stdout line, refuses exit 0), `assertHelperFailureAdmitted` (the acknowledgment line, its relay as `finalOutput` of the C2 result event, the binding to the published artifact's recomputed digest) and `assertHelperFailureExchanges` ((a) and (b) over a second failed artifact against the real `complete`); the design §9.3 item 4, §10.5 and §10.6 row 6 word diff; GOALS and the ticket subsection. Executive check on the head: `tsc --noEmit` rc 0; `lint:imports` 28 modules rc 0; `lint:lifecycle` 284 modules, 10 allow-listed, no offender, rc 0; `t287-worksite-command-execution` 5/5; `forward-command-contracts` 9/9; `t287-runtime-failure-diagnostic` 12/12; `t287-lifecycle-failure-carrier` 5/5; `m5-worker-transport` 21/21; `t287-reacquisition-root-contract` 1 pass, 1 skip; `t287-calculus-fold` 7/7; `t287-common-computational-library` 9/9; tree clean.

| Return item | Disposition |
|---|---|
| 1, acknowledgment for every disposition | accepted; the fifth review's S2 closed at the helper |
| 2, worker instruction and pin | accepted; Executive decision under D15, reversal recorded in T-290 Phase C |
| 3, acknowledgment bound to the artifact | accepted; the unread-digest item for the owner is discharged; no lane changed class |
| 4, controlled worker and the exchanges | accepted; the case discriminates (the Worker's two probes); (a) and (b) inside the installed case because a failed artifact needs the installed helper, stated |
| 5, design records | accepted |
| 6, final run | accepted; 56 failing identities equal to D's log, none only on either side |
| 7, records | accepted |

Residuals the Return names: the worker in both installed cases is a controlled worker, so no model has read the new sentence (a model-driven C2 run is release qualification, not this plan); the other three helper failure classes reach an artifact only in a scratch probe (T-290 package G). The fifth review's S2 is closed; its S3 was closed at `bd336a99b`. The sixth review follows. The plan for the close and the debt wave is `T-290`.

## Sixth review (pasted by Jim, 2026-10-24; read-only, inspection and in-memory probes; subject `b5b8d0e24`)

Verbatim.

> Changes requested: one S2 implementation regression, one S3 artifact-validation defect, and S3/S4 record inconsistencies. No S0 or S1 found.
>
> Product frame: the common library supports the fixed fifteen-family ABG 5.0. GTL owns program meaning, HoG traverses it, and ABG owns admission; diagnostics must preserve those boundaries.
>
> Reviewed b5b8d0e24. Line numbers below refer to that cut. Current main has two later bookkeeping commits.
>
> 1. S2 — Forward construction still returns a task its validator rejects.
>    worksite_command_forward.ts:119 admits only the retained candidate. The expected vector passes .every() and Set checks despite containing a hole:
>
>    input.bindingCoverEventRefs = Array(1);
> for (const row of input.snapshotSources)
>   row.source.bindingCoverEventRefs = [];
>
>    With otherwise valid fixture data, D’s immediate parent throws TypeError; D returns a task for which isWorksiteCommandForwardTask returns false. I independently reproduced this with both frozen source graphs and actual dependencies.
>
>    The weak top-level guard predates D, but this rejection-to-invalid-return change is introduced by D. Admit and validate the expected vector before comparison. The originally reported retained-vector negative is repaired.
> 2. S3 — The new failure artifact accepts an operation the task never declares.
>    worksite_command_execution.ts:1834 checks failure class and record shape without binding the failure to the next operation in the completed prefix.
>
>    An in-memory probe of the actual constructor and validator accepted a task with one command and zero predicates, but a failure subject containing failureClass: "http_probe_failed" and request: {}. Both completed vectors were empty.
>
>    The parent completion branch (implementation/worksite_command_execution.ts:744) adds no operation-binding check before wrapping that subject inline. This demonstrates malformed diagnostic attribution, not an execution-authority bypass.
>
>    The artifact extension is explicitly authorized by D15; preserving the Product failure value does not make this new artifact arm sufficiently validated. Bind command failures to the next command, and HTTP failures to the next HTTP predicate after commands complete.
> 3. S3 — Frozen current-status records contradict the delivered implementation.
>    At b5b8d0e24, GOALS.md:79 still calls lifecycle/helper work design-only and unimplemented. T-287:110 still lists owner obligations as open. These contradict the closing sections. Later commit bd336a99b corrects the relevant prose; that correction lies outside the reviewed cut.
> 4. S4 — The closing post misclassifies the reacquisition seam as baseline-red.
>    Closing post:132 groups it with baseline failures. The attribution records show baseline green and a missing canonicalEquals binding introduced at step 4. Its repair is real; this historical classification is inaccurate.
>
> Fourth-review conditions:
>
> | Condition | Disposition |
> |---|---|
> | Forward comparison and throwing refusal | Partial. Original negative fixed; opposite-operand admission remains defective, S2 above. |
> | Comparison census | Sample supported. 867 rows reconcile as 846 re-typed, 20 merged, one structural. No additional private structural replacement established; counts do not discharge the typed-input defect. |
> | D14 | Discharged at bounded component-route scope. Five projections, both admission routes, distinct Run selections, nested earlier cut, unchanged event keys and continued not_retained behavior are supported. |
> | D15 actual handoff | Whole-path evidence supported; contract condition remains open. The installed case reaches real helper, parent, leaf admission and cold subject retrieval. The new artifact arm has the S3 defect above. |
> | Final-run attribution | Discharged. Failure identities/errors reconcile when B’s appended standalone cancellation evidence is included. Comparing only integrated invocations changes the identity_end cancellation signature. |
> | Closing records | Not fully discharged at b5b8d0e24. S3/S4 above. |
> | Earlier fold-cost and D12 conditions | Discharged. The growth claim is narrowed; the structural prototype rule and supplied negative cases agree with actual admission probes. |
>
> The acknowledged digest, missing-class lanes and TD-06 clipping cost were not treated as findings.
>
> No builds, suites, edits, commits or pushes ran. Inspection and in-memory probes only.

## Disposition of the sixth review (Executive, 2026-10-24)

Verified by reading at `1fafd137a`. Finding 1: `shared/canonical_json.ts:34-42` writes an array by index and skips a hole, so `canonicalJson(Array(1))` is `[]` and `canonicalEquals([], Array(1))` is true; in `constructWorksiteCommandForwardTask` (`product/worksite_command_forward.ts:124-127`) the guard over the typed `bindingCoverEventRefs` is `.every(text)` and a `Set` size check, both of which a one-hole array passes, and only the row's candidate is admitted (`sameAdmittedRefs`, `:117-119`); the task then carries the holey vector, which `isWorksiteCommandForwardTask` admits through `admitJson` and refuses. The same class holds for `protectedObservations` in `constructWorksiteCommandForwardRequest` (`:100-104`: `.some`, `.map` and the `Set` check) and for `snapshotSources` (`:128`: `.some`). Finding 2: `isHelperFailure` (`product/worksite_command_execution.ts:1834-1844`) checks the class, the member set and the carrier's record shape; the failure branch of the artifact validator (`:1893-1897`) bounds the two completed vectors by length and nothing binds the subject to `task.commands[commandResults.length]` or to the next `http_response_exact` predicate after the commands complete. Finding 3: discharged at `bd336a99b`, outside the cut. Finding 4: the closing post's test-reality paragraph calls the reacquisition seam a baseline-red lane; repair B's attribution has it baseline green and broken at step 4.

| Finding | Severity (Reviewer) | Priority (Executive) | Disposition |
|---|---|---|---|
| 1: the forward constructors trust their typed array inputs; a one-hole vector passes the guards, digests as empty and yields a task or request the validator refuses | S2 | P1 | Repair F item 1: the three array inputs are admitted at the constructor's ingress and the admitted values are validated, compared and carried; negatives beside the sparse case. The class beyond this module (typed arrays validated with `.every`, `.some` or a `Set` over caller input) is routed to the register's TD-14 as a named class for the owner's selection, not censused here. |
| 2: the failure artifact's subject is not bound to the next undone operation of the completed prefix | S3 | P1 | Repair F item 2: command classes bind to `task.commands[commandResults.length]` with no predicate observed; HTTP classes require all commands complete and bind to the next `http_response_exact` predicate; the parent needs no change if the artifact validator binds. A member added to the two HTTP subjects, if the carriers cannot name the predicate, is inside D15's artifact arm (Executive; reversal for Jim). |
| 3: records at the frozen cut | S3 | P2 | Discharged at `bd336a99b` and `1fafd137a`. |
| 4: the seam classified as baseline-red in the closing post | S4 | P3 | Fixed in the closing post's restatement with repair E: one baseline-red lane (the prompt-digest fixture) and one lane the plan broke at step 4 (the reacquisition binding). |
| Fourth-review conditions | — | — | As the table says; the two partials are E (acknowledgment handoff, fifth review) and F. |

## Post-close repair activation F (Executive, 2026-10-24; forward ingress admission; failure subject binding)

Worker: Opus 5.5, xhigh, fresh context, Writer grant. Head is the Executive's bookkeeping commit after repair E. Read this section, `## Sixth review` and `## Disposition of the sixth review` above, `## Post-close repair return D` items 1 and 4, `## Post-close repair return E`, design §9.3 items 3 and 4, §10.3 O-TYPE row and §10.6 row 6, and the files named below. Do not read other agents' comment directories.

Items, in this order. The Return carries one row per item: done or stopped, with lines at head.

1. **The forward constructors admit their array inputs.** `product/worksite_command_forward.ts`: in `constructWorksiteCommandForwardTask`, admit `bindingCoverEventRefs` and `snapshotSources` through `admitJson` before the guard; the guard validates the admitted values (non-empty, every element `text`, distinct; the rows as today); rows compare against the admitted vector; the task carries the admitted values. In `constructWorksiteCommandForwardRequest`, admit `protectedObservations` the same way before `.some`, `.map` and the `Set` check, and build the body from the admitted value. A refusal is the constructor's existing TypeError. Nothing else in the two constructors changes. `forward-command-contracts.test.mjs`, beside the sparse case (`:77`): for each of the three inputs, the one-hole vector `Array(1)` (and for `bindingCoverEventRefs` the sixth review's exact mutation with empty row vectors) throws TypeError, and the dense control passes `isWorksiteCommandForwardTask` or `isWorksiteCommandForwardRequest` and its JSON round trip.
2. **The failure subject binds to the next undone operation.** `product/worksite_command_execution.ts`, the artifact validator's failure branch (`:1893-1897`) and `isHelperFailure` (`:1834-1844`): for `command_failed` and `command_cleanup_unresolved`, `predicateObservations.length === 0`, `commandResults.length < task.commands.length`, and the `command` carrier is canonically equal to `task.commands[commandResults.length]`; for `http_probe_failed` and `http_cleanup_unresolved`, `commandResults.length === task.commands.length`, `predicateObservations.length < task.outcomePredicates.length`, the next predicate `task.outcomePredicates[predicateObservations.length]` has `predicateKind === "http_response_exact"`, and the carrier names it. Read the helper's two HTTP details first (`implementation/worksite_command_helper.ts`, the `detail` objects before `:1151` and `:1190`, and `probe` at `:1158`): if the carrier's members identify the declared request (hostname, method, path, timeout of the predicate's declaration) bind through them; if not, add `predicate: { ordinal, predicateId }` to the two HTTP subjects at the helper and to `isHelperFailure`'s exact keys for those classes, and say so (inside D15's artifact arm; the Product failure value is untouched). Check what `request` carries when the port was never observed (`requestInput === null`, `:1140`): if the helper's own `constructWorksiteExecutionHelperArtifact` would refuse that subject, the carrier becomes a record stating the declared request and the port state, and the Return names the line. Confirm by reading that the parent's `:744` branch needs no change because `isWorksiteExecutionHelperArtifact(input, helperValue)` runs first (`:736`). Cases in `t287-worksite-command-execution.test.mjs` against the exported constructor and validator: the sixth review's probe (one command, zero predicates, `http_probe_failed` with `request: {}`) refused; a `command_failed` subject naming a command other than the next refused; an HTTP class with a command still undone refused; the installed whole-path case (its class `command_cleanup_unresolved`, bound to the next command) still admits.
3. **Design records.** §10.6 row 6 and §9.3 item 4: the failure subject is bound to the next undone operation of the completed prefix. §10.3 O-TYPE row: a constructor admits a caller's typed array at its ingress before `.every`, `.some` or a `Set` check; the sentence names the forward module as realized and TD-14 for the class.
4. **Lanes.** `npm run build`, `npx tsc --noEmit -p tsconfig.json`, `npm run lint:imports`, `npm run lint:lifecycle`; `forward-command-contracts`, `forward-command-owners`, `t287-worksite-command-execution`, `t287-observed-worksite-command`, `m5-worker-transport`. If item 2 changed a subject's member set, also the 48-file run as repair E (`step-8-run-postclose-e.log`) into `step-8-run-postclose-f.log`, attributed against E's log; otherwise no broad run.
5. **Records.** The ticket's `### Library delivery close (2026-10-23)` subsection: the forward ingress admission and the subject binding, with their cases; GOALS Current Selection only if it names the forward fix.

**Grant.** `product/worksite_command_forward.ts` (the two constructors' ingress, item 1); `product/worksite_command_execution.ts` (the failure branch and `isHelperFailure`, item 2); `implementation/worksite_command_helper.ts` (the two HTTP `detail` objects only, item 2, if needed); `gtl/worksite_command_execution.ts` (the pin, if the Product module changed its bytes; `npm run build` regenerates digests); `test_env/tests/forward-command-contracts.test.mjs`; `test_env/tests/t287-worksite-command-execution.test.mjs`; the design §9.3, §10.3, §10.6; the ticket's close subsection; GOALS Current Selection; `step-8.md` below this section only; `step-8-run-postclose-f.log` if run.

**Stop:** any change to `isWorksiteCommandExecutionFailure`, to an event contract or payload key list, or to the Product failure value's classes; a validator loosened anywhere; a constructor that converts a hole instead of refusing it; a member added to a non-HTTP subject; a second bounded attempt at any item; any push.

**Return contract.** One commit on `main`, no push. First line `Post-close repair F: forward ingress admission; helper failure subject bound to the next operation`, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append `## Post-close repair return F` with: one row per item (done or stopped, lines at head); the lane results as `tests/pass/fail/skipped`; the broad-run table and attribution if run; the stop reports, if any, with the counterexample.
