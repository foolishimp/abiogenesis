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
