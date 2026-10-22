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
