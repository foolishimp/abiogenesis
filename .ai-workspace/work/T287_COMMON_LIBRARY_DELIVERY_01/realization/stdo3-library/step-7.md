# Step 7. Lifecycle failure carrier and projection

Plan: `.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, step 7.
Executive: Claude Fable. Worker: Opus 5.5, xhigh, fresh context, Writer grant.
Reviewed after the commit (Fable, max): the review checks design §9.3, §10.5
and §10.6 row 6 against the design closure below and the code.

## Activation

**Role and outcome.** You are the Worker holding the Writer grant for step 7.
Outcome: process facts reach `L` once, as the owner's terminal event on every
path and, on a failure, inside the admitted failure's retained diagnostic
subject; the reporting choice is one function in `shared/process/`; every
actor refusal after finalization carries the encoded facts; the copied
`terminationConfirmed` stays recorded and is checked against the fluent at
fold time (D5, alternative); readers of lifecycle facts use `holdsAt`; no
file is written beside the log and no inspector reads one. Change class:
`realization_refactor`, with the bounded design closure below written first.
One commit on `main`, no push.

**Subject and frame.** `/Users/jim/src/apps/abiogenesis`, branch `main`, head
= the step 6 commit in the plan's ledger row. Tenant root:
`build_tenants/abiogenesis/typescript`; source: `code/src`. Frames: `f-law`,
`f-checks`, `f-claim`, `f-worksite-causality`, `f-end-to-end-interface-integration`
from `design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`. Design authority:
`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` §4.6
(`shared/process/`), §9.1 to §9.3 (the three layers; the worked example;
process failure facts), §10.2 D5, §10.5 P-LIFECYCLE, §10.6 row 6; and the
Executive's B14 addendum and its ratified correction in
`.ai-workspace/comments/claude/20261021T135156Z_REVIEW_compute_calculus_and_library_design.md`
(sections "B14 addendum" and "B14 addendum, ratified correction", after
line 666). Read those, not the whole documents.

**Law that binds this step** (PRODUCT.md live-state law; design §9.1). A
fact exists once, as an event. Physical observation lands in immutable
`OwnedProcessFacts` and is handed in memory to the owner that admits it;
that handoff is permitted. The owner admits one process terminal event. On a
failure, the encoded facts are admitted with the failure as its diagnostic
subject. Derived state is answered by `holdsAt` over the fold and is never
recomputed from copied fields. A second store written by one interface and
read back by another is forbidden; evidence referenced from `L` by digest is
not a second store. No event contract, event profile or Product output
contract changes in this step.

**Census the Executive already made (at `97b1200bc`; re-verify cheaply).**

- The owner's report: `abg/actor_process.ts:1306-1328` inside
  `onProcessFinalized`: no-child launch failure (`scopeAbsence === "absent"
  && noChildEstablished && launchFailure !== null`) appends
  `actor_process_spawn_failed` with `diagnosticDigest` of the message;
  confirmed boundary after start (`scopeAbsence === "absent" && directExit
  !== null && processStarted`) appends `actor_process_exited`; otherwise
  after start appends `actor_process_termination_unconfirmed`. The facts are
  retained as `finalProcessFacts` (declared inside the inner scope; the outer
  catch at 1403 cannot see it today).
- Two edge formulas: `abg/worker_transport.ts:461`
  (`scopeAbsence === "absent" && directExit !== null`);
  `implementation/worksite_command_helper.ts:769` and `:1136`
  (`scopeAbsence === "absent"` alone, so a no-child launch failure reports
  `terminationConfirmed: true` with status 127, and a group probed absent
  without an observed exit also reports `true`).
- Refusals built from the message alone: `refuseActorProcessEffect`
  (`actor_process.ts:186-201`; `diagnosticRef` is the class reference
  `diagnostic://abiogenesis/actor-process/<code>@5`), called at `:1362`
  (carrier refusal) and `:1403` (outer catch). `ActorProcessEffectRefusal`
  at `:171-180`.
- The receipt path: after `onProcessFinalized`, `admitTransportArtifact`
  (`:1109`) admits `actor_result_artifact_observed` whenever the facts show
  an absent scope with an exit or no child, so a no-child launch failure
  ends in a receipt, not a refusal (step 1 re-review, S2 1 residue). The
  observation payload keys are fixed by the root event contract
  (`abg/event_store.ts:301`, `ACTOR_OBSERVATION_PAYLOAD`); the payload
  binds the transport artifact by `transportDigest` and
  `artifactDigests.transport` (`:1142`, `:1121`). The worker transport writes
  that artifact (`worker_transport.ts:647-655`, `${label}-transport.json`,
  canonical JSON of the transport body) and verifies its digest after
  persistence (`:657`). `abg/worksite_construction_recovery.ts:258-262`
  validates that artifact's members on reconstruction.
- The C-call failure branch: `hog/ccall_lifecycle.ts:541-548`
  `failCCall(input, effectResult.successorPrefix, \`leaf-effect-${ordinal}\`, effectResult.diagnosticRef, effectResult)`;
  `:551` the completion-throw branch. `failTraversal`
  (`hog/traversal_failure.ts:70-96`) admits `subject: { stage, candidate }`
  with the given `diagnosticRef`. `admitRuntimeFailure` retains a `data:`
  reference inline only when it decodes to that exact subject
  (`abg/runtime_failure.ts:84`, `:100-105`, `:239-241`);
  `constructRuntimeFailureDiagnosticRef(subject)` builds it.
  `projectRuntimeFailureEvidenceAtPrefix` (`:112`) reads it back.
- The unresolved-cleanup path: after start, `firstError` set and
  `scopeAbsence` not `"absent"`: the owner appends
  `actor_process_termination_unconfirmed`; the transport throws
  `firstError` (`worker_transport.ts:553`, `:558`, `:663`);
  `admitTransportArtifact` refuses ("lacks final confirmed physical facts");
  the actor's inner catch (`:1377`) appends no actor terminal because
  `processTerminalEvent` is null; the outer catch (`:1403`) returns the
  refusal from the message alone.
- `terminationConfirmed`: 47 occurrences in 13 files. Writers of the copy
  (stay under D5): `worker_transport.ts:461,598,630`,
  `actor_process.ts:1149`, `c_call.ts:2100,3842,6708`, the helper `:769,:1136`,
  and the Product command-result contract
  (`product/worksite_command_execution.ts:528,1693,1709,1729`). Readers to
  retire to `holdsAt` (design §9.2 forms 3 and 4): `replay.ts:2444`
  (sets it from the presence of `actor_process_exited`),
  `c_call.ts:2033` (feeds `classifyWorkerTransportFailure`, whose
  `terminationConfirmed` input is `transport_contracts.ts:71,76`),
  `worksite_construction_recovery.ts:228,262`, `invocation_admission.ts:512`
  (through replay's projection at `:2392`), and the copy-to-copy comparison
  `c_call.ts:6607`. Helper-route consumers stay on the admitted result
  (`validator/qualification.ts:52`). Census the rest and classify each.
- The lifecycle rule and `holdsAt(state | projection, pattern)` exist since
  step 6 in `abg/calculus/`; `actor_process_terminated(processRef)` is its
  fluent. No `inspectWorksiteCommandExecutionProcessFailure` and no
  `process-failure.json` exist in `code/src`; nothing to retire there.
- The C-call's leaf failure for a spawn-failed receipt is classified at
  `c_call.ts:2033-2036` from the actor projection's `processTerminalKind`.

**Design closure (write first, bounded to these edits; the Executive's
decisions).**

1. **§4.6** gains a third atom beside the two: `classifyOwnedProcessTerminal(facts): "spawn_failed" | "exited" | "unconfirmed"`,
   the one three-outcome report the section already states in prose
   (`spawn_failed` when `scopeAbsence === "absent"`, `noChildEstablished`
   and `launchFailure !== null`; `exited` when
   `hasConfirmedOwnedProcessBoundary(facts)`; `unconfirmed` otherwise), used
   by the worker owner and by the command and HTTP adapters so no adapter
   keeps its own formula. Amend the "adds two pure functions" sentence and
   the code block; add the atom to the §10.7 row of the two process atoms
   (same disposition, `catalog_addition_proposal`). State in the §4.6 text
   that on the helper route `terminationConfirmed` is `kind !== "unconfirmed"`
   (a spawn failure has no child to clean up and reports status 127 as
   today), so the helper's divergent reading of a group probed absent
   without an observed exit is retired and reports `unconfirmed`.
2. **§9.3 item 2**: `refuseActorProcessEffect` takes the encoded facts as a
   fifth parameter and the refusal carries them as member `processFacts`
   (`JsonValue | null`); its `diagnosticRef` stays the class reference.
3. **§9.3 item 3**: as the ratified correction states: at `failCCall`
   (`ccall_lifecycle.ts:541`) the C-call passes
   `constructRuntimeFailureDiagnosticRef({ stage, candidate: effectResult })`
   with the same `stage` string `failTraversal` receives, so the retained
   subject is the refusal with its `processFacts`. No reader keys on the
   class reference (verify by `grep -rn "diagnostic://abiogenesis/actor-process" code/src test_env`
   and state the result).
4. **§9.3 new item**, the receipt path: when the carrier admits a reported
   outcome as a receipt (an exit, or a no-child launch failure that reaches
   `admitTransportArtifact`), the encoded facts enter referenced evidence
   as member `processFacts` of the transport artifact
   (`${label}-transport.json`) that the worker transport already writes and
   whose digest the admitted observation event binds. The observation event
   payload is unchanged. Reconstruction (`worksite_construction_recovery.ts`)
   verifies the member against the bound digest as it verifies the rest.
5. **§9.3 item 6**: failure inspection is the composition of `holdsAt`
   (lifecycle) with `projectRuntimeFailureEvidenceAtPrefix` (retained facts on
   a refusal) or the transport artifact at its admitted digest (facts on a
   receipt); no dedicated inspector exists or is added.
6. **§9.2**: add the census sites the step 1 Review named that are still
   absent (the step 1 file's `## Review` lists them under its P-LIFECYCLE and
   §9.2 findings; copy the file:line coordinates, re-verified at head).
   **§9.1 item 3** (design:522): scope the sentence: lifecycle questions
   about actor processes, over the fluents §4.4 closes, are answered through
   `holdsAt`; helper-run processes have no actor-process fluents and their
   question is a projection of the admitted leaf result or failure subject.
7. **§10.5 P-LIFECYCLE**: restate the no-child launch failure negative on
   the worker route: it yields `actor_process_spawn_failed` in `L`, the
   admitted observation whose bound transport artifact carries the encoded
   facts, and `holdsAt` reports `actor_process_spawn_failed` and no
   `actor_process_terminated`. The unresolved-cleanup negative stays the
   refusal route (`actor_process_termination_unconfirmed`, the refusal with
   `processFacts`, the retained subject at `failCCall`).
8. **§10.6 row 6**: record the three decided relations: the site (item 3)
   ratified by the Executive at step 7 (2026-10-22); the addition proposal
   for the process atoms accepted through the constitution §16.14 record
   (step 2, extended for the third atom in this step); the helper route:
   facts enter `L` as the members the command result already carries
   (`exitStatus`, `processSignal`, `timedOut`, `signalSequence`,
   `terminationConfirmed`, and the unconfirmed-scope diagnostic in
   `stderr`), the three-outcome report through `classifyOwnedProcessTerminal`,
   and on the helper's thrown cleanup failure (`worksite_command_helper.ts:1362-1366`)
   `encodeOwnedProcessFacts` as a member of the thrown diagnostic JSON; no
   Product output contract changes. List every changed design line in Return.

**What changes (code).**

1. New `shared/process/`: `facts.ts` with `hasConfirmedOwnedProcessBoundary`,
   `classifyOwnedProcessTerminal`, `encodeOwnedProcessFacts` (encoding
   exactly as §4.6 and the B14 addendum ratify: every member keeps its name;
   `Error` → `{ name, message, code, errno, syscall, path }` strings or
   `null`, no `stack`; `bigint` → `{ "kind": "bigint", "value": "<digits>" }`;
   `null`, booleans, numbers, strings pass through; output is a `JsonValue`
   that `canonicalJson` accepts); `index.ts` re-exporting them and the
   existing `shared/owned_process_lifetime.ts` exports (which does not move).
   Pure, frozen, no I/O.
2. Reporting through the classifier: `actor_process.ts:1312-1328` branches
   on `classifyOwnedProcessTerminal(facts)` with the same three events and
   payloads and the same `processStarted` defects; `worker_transport.ts:461`
   `terminationConfirmed: hasConfirmedOwnedProcessBoundary(facts)`; the
   helper `:769` and `:1136` `terminationConfirmed: classifyOwnedProcessTerminal(facts) !== "unconfirmed"`.
3. Refusal carrier: hoist `finalProcessFacts` so both refusal sites see it;
   `refuseActorProcessEffect(code, message, pre, succ, processFacts)`;
   `ActorProcessEffectRefusal.processFacts: JsonValue | null`; both call
   sites pass `finalProcessFacts === null ? null : encodeOwnedProcessFacts(finalProcessFacts)`.
4. `ccall_lifecycle.ts:541-548`: the diagnostic reference becomes
   `constructRuntimeFailureDiagnosticRef({ stage: \`leaf-effect-${input.ordinal}\`, candidate: effectResult })`,
   built from the same values `failCCall` passes on, so `admitRuntimeFailure`
   retains the subject inline. Check that `failCCall` passes the stage string
   through unchanged to `failTraversal`; if it transforms it, build the
   reference inside `failCCall` from the exact `{ stage, candidate }` it
   admits, and state that in Return.
5. Receipt path: `worker_transport.ts` transport body gains
   `processFacts: encodeOwnedProcessFacts(processObservation.facts)` before
   the canonical write at `:647`; `worksite_construction_recovery.ts:258-262`
   accepts and verifies the member. If a checked-in archive fixture lacks
   the member, say so in Return and accept its absence only for that
   fixture's digest-bound artifact, not in general.
6. D5 alternative, in `abg/calculus/rules.ts`: the `actor_process_lifecycle`
   rule compares the copied `terminationConfirmed` in
   `actor_result_artifact_observed` and in `c_call_evidenced` with evidence
   class `probabilistic_transport` against `actor_process_terminated(processRef)`
   at the same cut; a disagreement initiates
   `terminationConfirmed_copy_disagrees(processRef)`; no prefix is refused.
   Readers: `replay.ts:2444` sets the projection's field from
   `holdsAt(actor_process_terminated)`; `c_call.ts:2033` feeds the
   classifier from `holdsAt`; `worksite_construction_recovery.ts:228,262`,
   `c_call.ts:6607` and `invocation_admission.ts:512` read the fluent where
   a prefix is in hand; where a validation runs over a candidate with no
   prefix, leave it and list it. Helper-route readers stay on the admitted
   result. Record the full census table in Return.
7. Helper thrown cleanup failure (`worksite_command_helper.ts:1362-1366`):
   the thrown diagnostic JSON gains `processFacts: encodeOwnedProcessFacts(facts)`
   for the failing command (the facts are in scope through the command
   result; if not, carry them on the command observation object in memory,
   not in `result.json`).
8. Constitution §16.14 (b): append the third process atom to the row that
   lists `hasConfirmedOwnedProcessBoundary` and `encodeOwnedProcessFacts`,
   same class, realized at step 7. No other constitution text.
9. Integration scenario, one file: `test_env/tests/t287-lifecycle-failure-carrier.test.mjs`,
   through the cheapest existing harness that drives the actor or the worker
   transport in-process (`m5-worker-transport.test.mjs`,
   `t287-owned-process-lifetime.test.mjs` and `test_env/support/` are the
   candidates; name the one used). Cases: (a) worker route, no-child launch
   failure: `actor_process_spawn_failed` is in the store; the admitted
   observation's bound transport artifact decodes to a body whose
   `processFacts` equals `encodeOwnedProcessFacts` of the facts handed to
   `onProcessFinalized`; `holdsAt` reports `actor_process_spawn_failed` and
   no `actor_process_terminated`; (b) worker route, error after launch with
   unresolved cleanup (`scopeAbsence` not `"absent"`, `firstError` set):
   `actor_process_termination_unconfirmed` is in the store; the refusal
   carries `processFacts`; the admitted `runtime_failure_observed`'s
   retained subject (via `projectRuntimeFailureEvidenceAtPrefix`) decodes to
   the refusal with those facts; `holdsAt` reports
   `actor_process_termination_unconfirmed` and no `actor_process_terminated`;
   (c) command route, the same two negatives through the helper's command
   runner: a nonexistent executable yields status 127 and
   `terminationConfirmed: true`; an injected unconfirmed scope yields
   `terminationConfirmed: false`, the stderr diagnostic, and the thrown
   cleanup failure whose JSON carries `processFacts`; (d) the copy check: a
   synthetic prefix whose `actor_result_artifact_observed` copies
   `terminationConfirmed: true` without `actor_process_terminated` yields
   `terminationConfirmed_copy_disagrees` and the fold does not throw. No
   case reads a file other than the digest-bound transport artifact in (a).
   If the harness cannot drive the actor in-process at bounded cost, drive
   the worker transport with an observer that reproduces the owner's three
   appends into a test store through the same `append` path, say so, and
   keep (a) and (b) assertions on the store and the refusal.

**Grant.** Under `build_tenants/abiogenesis/typescript`: `code/src/shared/process/**`
(new), `code/src/abg/actor_process.ts` (the sites named), `code/src/abg/worker_transport.ts`,
`code/src/hog/ccall_lifecycle.ts` (the failure branch), `code/src/abg/calculus/rules.ts`
(the copy check), `code/src/abg/replay.ts` (`:2444` and the quiescence set
for the new diagnostic fluent), `code/src/abg/c_call.ts` (the reader sites
named), `code/src/abg/worksite_construction_recovery.ts`,
`code/src/abg/invocation_admission.ts` (the read at 512),
`code/src/implementation/worksite_command_helper.ts` (`:769`, `:1136`,
`:1362-1366`), the eight design edits, the one constitution row,
`test_env/tests/t287-lifecycle-failure-carrier.test.mjs` (new), any test
support file the scenario needs (list it), and the build outputs the gate
regenerates, committed with the source. Plus this file's `## Return`.
Nothing else: no event contract or payload key list in `event_store.ts`, no
Product output contract, no `result.json` member, no ticket, no GOALS.

**Gate** (in `build_tenants/abiogenesis/typescript`, in order, all must
pass): `npm run build`; `npm run lint:imports`;
`node --test test_env/tests/t287-lifecycle-failure-carrier.test.mjs`;
`npm run test:installed:language`. Record exit codes and wall times. The
lifecycle suites (`t287-owned-process-lifetime`, `m5-worker-transport`,
`t287-worksite-command-execution`, `t287-observed-worksite-command`) wait
for step 8; run one only to localize a gate failure.

**Self-check before the commit:** (1) `grep -rn 'scopeAbsence === "absent"' code/src` matches only inside `shared/process/` and `shared/owned_process_lifetime.ts`; (2) `grep -rn "refuseActorProcessEffect(" code/src/abg/actor_process.ts` shows every call passing a fifth argument; (3) `grep -rn "process-failure\|processFailure.json" code/src` returns nothing; (4) `git diff code/src/abg/event_store.ts` is empty and `git diff code/src/product/worksite_command_execution.ts` is empty; (5) `grep -n "terminationConfirmed" code/src/abg/replay.ts` shows no derivation from `actor_process_exited`; (6) the gate passed; (7) `git diff --stat` touches only granted paths.

**Return contract.** Stage by path (never `git add -A`), commit on `main`,
no push. Message first line `Step 7: process facts into L; refusal carrier; D5 fold-time copy check`,
short body, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
Append to this file:

```
## Return
- commit: <hash>
- design lines changed: <file:line per line, with the closure item number>
- atoms: <exports of shared/process/index.ts with signatures>
- reporting sites: <file:line per line, before -> after>
- refusal carrier: <sites; the hoist>
- failCCall reference: <how built; stage passthrough verified or the in-failCCall form>
- receipt path: <transport body member; reconstruction check; fixtures>
- class reference readers: <grep result>
- terminationConfirmed census: <47 sites: writer kept / reader switched to holdsAt / helper-route stays / validation left, file:line per line>
- scenario: <harness used; cases a..d pass/fail; files read>
- gate: build <rc, s>; lint:imports <rc>; scenario <rc>; test:installed:language <rc, s, pass/fail counts>
- self-check: 1..7 with result
- residuals: anything you could not do inside the grant, with the exact reason
- return route: this file
```

Final report to the Executive: at most eight lines.

**Stop contract.** Stop without committing, revert this step's working-tree
changes, and write the reason under `## Return` if: (a) the gate fails after
one bounded fix attempt; (b) carrying the facts on any path would require a
root event contract, payload key list, event profile or Product output
contract change; (c) a reader keys on the actor refusal's class reference
and switching it is outside the grant; (d) the scenario cannot drive either
negative on the worker route at bounded cost, even with the fallback in
item 9.

ACTION: execute step 7 as activated.

## Executive note (2026-10-22, after steps 2 to 6)

Head for this step is the step 6 commit in the plan's ledger (an Executive
bookkeeping commit sits on top; the source tree equals it). The line numbers
in the census are from `97b1200bc`; steps 3 to 6 touched the named files at
comparison, record-guard, selection and lifecycle-derivation sites, so
re-find every anchor by name before editing. Available atoms: `isRecord`,
`hasExactKeys`, `admitJson` (`shared/admit/`), `canonicalEquals`
(`shared/value/`), `resolveExactMatch`, `onlyExactMatch` (`shared/select/`),
`ok`, `refused`, `andThen` (`shared/refusal.ts`), and from step 6
`abg/calculus/` with `holdsAt(state | projection, pattern)` and
`ROOT_DERIVED_RULES` (whose `actor_process_lifecycle` rule you extend with
the copy check). Read the step 6 `## Return` section of `step-6.md` for the
module cut and the rule's shape before touching `abg/calculus/rules.ts`;
read nothing else of that file.
