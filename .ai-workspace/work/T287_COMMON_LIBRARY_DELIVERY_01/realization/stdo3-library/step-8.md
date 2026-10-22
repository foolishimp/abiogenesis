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
