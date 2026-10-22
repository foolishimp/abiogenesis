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
`node --experimental-vm-modules --test test_env/tests/t287-lifecycle-failure-carrier.test.mjs`;
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

## Return

- commit: the commit carrying this Return (first line `Step 7: process facts into L; refusal carrier; D5 fold-time copy check`, parent `c6ff45521`); its hash is in the final report.
- design lines changed: 16. `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` (post-edit lines): 213 (item 1, "three pure functions"), 218, 219, 220 (item 1, classifier signature and its two comment lines), 230 (item 1, the §4.6 report paragraph), 531 (item 6, §9.1 item 3), 554 (item 6, §9.2 form 2, S4 reword and helper-route sites), 556 (item 6, §9.2 form 4, helper cleanup checks), 567 (item 2, §9.3 item 2), 568 (item 3, §9.3 item 3), 571 (item 5, §9.3 item 6), 572 (item 4, new §9.3 item 7), 634 (item 7, §10.5 P-LIFECYCLE), 649 (item 8, §10.6 row 6), 666 (item 1, §10.7 row). `design/ABI5_REALIZATION_CONSTITUTION.md:4390` (the §16.14 row (b): three atoms, realized at step 7).
- atoms: `code/src/shared/process/index.ts` exports the three atoms from `./facts.js`: `hasConfirmedOwnedProcessBoundary(facts: OwnedProcessFacts): boolean`, `classifyOwnedProcessTerminal(facts: OwnedProcessFacts): OwnedProcessTerminal`, `encodeOwnedProcessFacts(facts: OwnedProcessFacts): JsonValue`, and `type OwnedProcessTerminal = "spawn_failed" | "exited" | "unconfirmed"`. It also re-exports the lifetime from `../owned_process_lifetime.js`, which keeps its module: `createMonotonicDeadline`, `createOwnedProcessLifetime`, and the types `MonotonicTimerHost`, `OwnedProcessFacts`, `OwnedProcessHost`, `OwnedProcessLifetimeBounds`, `OwnedProcessObservations`, `OwnedProcessScopeAbsence`. `encodeOwnedProcessFacts` returns a frozen object with all 13 members under their own names: `directExit` as `{status, signal}` or `null`; `launchFailure` and `firstError` as `{name, message, code, errno, syscall, path}` with no stack, where a finite number becomes a string; `cleanupDeadlineNs` as `{kind: "bigint", value}` or `null`.
- reporting sites (before -> after):
  - Worker transport:
    - `abg/worker_transport.ts:462` `facts.scopeAbsence === "absent" && facts.directExit !== null` -> `:465` `hasConfirmedOwnedProcessBoundary(facts)`.
    - `abg/worker_transport.ts:552-553` `scopeAbsence !== "absent" || (directExit === null && !noChildEstablished)` -> `:555` `classifyOwnedProcessTerminal(...) === "unconfirmed"`.
  - Actor:
    - `abg/actor_process.ts:1114-1115` (the same formula) -> `:1123` (classifier `=== "unconfirmed"`).
    - `abg/actor_process.ts:1315` (spawn-failed formula) and `:1321` (exit formula) -> `:1323-1340`, which branches on `const terminal = classifyOwnedProcessTerminal(facts)`.
  - Helper:
    - `implementation/worksite_command_helper.ts:768` and `:772` `scopeAbsence === "absent"` -> `:772-774` and `:778` `terminal !== "unconfirmed"`.
    - `:1117` and `:1139` -> `:1126-1127` and `:1149`.
  - Equivalence:
    - Worker and actor: unchanged, because `noChildEstablished` implies `launchFailure !== null` (lifetime `noChild()`).
    - Helper: a group probed absent without an observed exit now reports unconfirmed. The Executive decided this route at step 7 (§10.6 row 6).
- refusal carrier:
  - The type and the function:
    - `ActorProcessEffectRefusal` gains `processFacts: JsonValue | null` (`abg/actor_process.ts:184-185`).
    - `refuseActorProcessEffect(code, message, predecessorPrefix, successorPrefix, processFacts)` (`:192-208`) freezes it into the refusal.
  - The calls:
    - The two pre-launch invocation refusals (`:747`, `:758`) pass `null`.
    - The carrier refusal (`:1374`) and the outer catch (`:1417`) pass `encodedFinalProcessFacts()`.
  - The hoist:
    - `finalProcessFacts` and the closure `encodedFinalProcessFacts` are declared before the outer `try` (`:779-783`).
    - The inner declaration (head `:1002`) is removed.
  - The class reference `diagnostic://abiogenesis/actor-process/<code>@5` (`:204`) is unchanged.
- failCCall reference:
  - The function: `hog/ccall_lifecycle.ts:231-239` `failActorProcessEffect(input, refusal)`:
    - `stage` is `` `leaf-effect-${input.ordinal}` ``;
    - `candidate` is the refusal;
    - it calls `failCCall(input, refusal.successorPrefix, stage, constructRuntimeFailureDiagnosticRef({ stage, candidate }), candidate)`.
    - The branch at `:557` calls it.
  - Stage passthrough is verified at both hops:
    - `failCCall` (`:207-225`) passes `stage` unchanged.
    - `failTraversal` (`hog/traversal_failure.ts:81-94`) admits subject `{ stage: input.stage, candidate }` with admission stage `"hog_traversal"`.
    - Scenario case b shows the subject retained.
  - Consequences on this branch:
    - The traversal failure's `diagnosticRef` and `message` become the `data:` URI.
    - The evidence projection's `diagnosticClassRef` is `null`, because the subject has no such member. The class reference sits at `subject.candidate.diagnosticRef`.
- receipt path:
  - Writing the member:
    - `WorkerTransportResult.processFacts` (`abg/worker_transport.ts:107-108`).
    - The body member is `processFacts: encodeOwnedProcessFacts(processObservation.facts)` (`:643`), written before the canonical write of `${label}-transport.json`. `artifacts.transport.digest` therefore binds it, and so do the observation's `transportDigest` and `artifactDigests.transport`.
    - The `actor_result_artifact_observed` payload is unchanged.
  - Reconstruction:
    - `abg/worksite_construction_recovery.ts:64-71` `transportProcessFactsMatchExit` requires:
      - exactly the 13 members;
      - `directExit` with exactly the keys `signal` and `status`;
      - `classifyOwnedProcessTerminal` over the encoded facts equal to `"exited"`. The encoding keeps the classifier's members and their value domains.
      - `directExit` equal to the artifact's `status` and `signal`.
    - It is used at `:284` with `holdsAt` over `actor_process_terminated`. `:249` reads the fluent in place of the copy.
  - Fixtures: no tracked fixture contains `-transport.json`, so none was regenerated.
- class reference readers:
  - `git grep -n "diagnostic://abiogenesis/actor-process" -- code/src test_env` returns only `code/src/abg/actor_process.ts:204`, the producer in `refuseActorProcessEffect`.
  - Untracked installed copies under `test_env/test_runs/` and `test_env/uat/runs/` hold the same producer line and no reader.
  - The scenario compares the reference by identity, not by literal.
- terminationConfirmed census: 47 sites. Anchors are at the step 6 head, mapped from `97b1200bc`; each entry is head -> post-edit.
  - Edge computation, now the shared atom (3):
    - `abg/worker_transport.ts:462->465`
    - `implementation/worksite_command_helper.ts:772->778`
    - `implementation/worksite_command_helper.ts:1139->1149`
  - Reader switched to `holdsAt` over `actor_process_terminated` (6):
    - `abg/c_call.ts:2034->2036` (classifier input)
    - `abg/c_call.ts:6631->6635` (`exitObserved` is compared to the fluent)
    - `abg/replay.ts:2453->2457`
    - `abg/invocation_admission.ts:512->515`
    - `abg/worksite_construction_recovery.ts:228->249`
    - `abg/worksite_construction_recovery.ts:262->284`
  - Writer or copy kept, the recorded copy the rule checks (10):
    - `abg/actor_process.ts:1152->1160`
    - `abg/worker_transport.ts:599->601`
    - `abg/worker_transport.ts:631->633`
    - `abg/c_call.ts:1979->1980` (copy-to-copy join)
    - `abg/c_call.ts:2103->2106`
    - `abg/c_call.ts:3854->3857`
    - `abg/c_call.ts:6732->6737`
    - `implementation/worksite_command_helper.ts:788->794`
    - `product/worksite_command_execution.ts:1730`
    - `validator/qualification.ts:151`
  - Helper-route consumers that stay, with no actor fluent (§9.3 item 4) (3):
    - `implementation/worksite_command_helper.ts:792->798`
    - `implementation/worksite_command_helper.ts:1370->1380`
    - `implementation/worksite_command_helper.ts:1383->1395`
  - Type declaration (9):
    - `abg/actor_process.ts:119->120`
    - `abg/c_call.ts:590->591`
    - `abg/c_call.ts:732->733`
    - `abg/replay.ts:297->298`
    - `abg/transport_contracts.ts:56`
    - `abg/worker_transport.ts:96->97`
    - `abg/worker_transport.ts:134->137`
    - `implementation/contracts.ts:92`
    - `product/worksite_command_execution.ts:529`
  - Payload or exact key list (4):
    - `abg/event_store.ts:302`
    - `abg/event_store.ts:733`
    - `abg/actor_process.ts:246->251`
    - `product/worksite_command_execution.ts:1694`
  - Typed shape validation (5):
    - `abg/actor_process.ts:460->465`
    - `abg/c_call.ts:1829->1830`
    - `abg/c_call.ts:6630->6633`
    - `product/worksite_command_execution.ts:1710`
    - `validator/qualification_contracts.ts:389`
  - Copy-consistency validation over a candidate with no prefix, left as is (7):
    - `abg/actor_process.ts:490->495`
    - `abg/actor_process.ts:518->523`
    - `abg/actor_process.ts:527->532`
    - `abg/actor_process.ts:531->536`
    - `abg/transport_contracts.ts:72`
    - `abg/transport_contracts.ts:77`
    - `validator/qualification.ts:53`
  - New sites: `abg/calculus/rules.ts:130`, `:191` and `:201`, where the D5 check reads the copy.
- scenario:
  - Harness:
    - It is the component harness of `t287-f04a-probabilistic-result-candidate` (finalized-artifact cases): `SourceTextModule` and `SyntheticModule` link the built owners with named lower premises replaced.
    - It runs over this tenant's build without `setupInstalledRootExecutionBasis`.
    - The rows are legacy-profile rows, with no `eventContractDigest`, so there is no liveness binding, no probe and no native assessment.
    - No new support file; it uses `test_env/support/new-empty-append-sink.mjs`.
  - Case a, worker no-child launch failure: pass.
    - Setup: a controlled child with no pid emits ENOENT `error`, then `close`.
    - Admitted events: `actor_process_spawn_failed` is admitted once, and no start, exit or unconfirmed event is admitted.
    - The transport artifact:
      - The observation payload has no `processFacts` key.
      - The artifact's sha256 equals `transportDigest` and `artifactDigests.transport`.
      - `body.processFacts` equals `encodeOwnedProcessFacts(finalFacts)`, with code `ENOENT`, errno `"-2"` and no stack.
    - The effect is `actor_process_effect_receipt`.
    - `holdsAt` answers:
      - `spawn_failed`: true;
      - `terminated`: false;
      - `live`: false;
      - `copy_disagrees`: false.
  - Case b, worker unresolved cleanup: pass.
    - Setup: spawn, exit 0 and close, with the group probe answering `unknown` and inert signals.
    - Admitted events: `actor_process_started` and `actor_process_termination_unconfirmed` are admitted. No exit, spawn failure, artifact or `actor_invocation_failed` is admitted.
    - The transport throws "worker owned process scope remains unconfirmed".
    - The effect is `actor_process_invocation_refused`. Its `processFacts` equals the encoded final facts (`scopeAbsence: "unknown"`), and its `diagnosticRef` is not a `data:` URI.
    - `holdsAt` answers:
      - `termination_unconfirmed`: true;
      - `terminated`: false;
      - `cleanup_pending`: true.
    - Retained subject:
      - The refusal is rebased onto a second, real append-sink store's held prefix. Only its two prefix coordinates change.
      - It passes through the real built `failActorProcessEffect`, `failCCall` and `failTraversal`.
      - The `runtime_failure` owner instance replaces the execution-basis, opened-scope and replay premises, as in `t287-runtime-failure-diagnostic`.
      - The `runtime_failure_observed` event carries `constructRuntimeFailureDiagnosticRef({ stage: "leaf-effect-3", candidate })`.
      - The evidence is `retained`, and `subject.candidate.processFacts` equals the refusal's.
  - Case c, helper route through the real built `runCommand` (main not run): pass.
    - An absent executable gives exit status 127, `terminationConfirmed: true` and no unresolved diagnostic.
    - `node -e ''` with the group probe answering `unknown` throws "worksite command cleanup unresolved". The thrown JSON carries:
      - `command.terminationConfirmed: false`;
      - the stderr diagnostic;
      - `processFacts` with `scopeAbsence: "unknown"` and `directExit` `{0, null}`.
  - Case d, D5 over `selectValidatedRuntimeEventPrefix` and `deriveRuntimeEventCalculusProjection`: pass.
    - A `true` copy without an exit initiates `terminationConfirmed_copy_disagrees`.
    - start, exit, then `true`: `terminated` holds and there is no disagreement.
    - A `probabilistic_transport` `c_call_evidenced` with `true` and no exit initiates the disagreement.
    - Another evidence class is ignored.
    - No prefix is refused.
  - Files read:
    - the transport artifact, at its admitted digest (case a);
    - the failure store's `L`, through `readRuntimeEventsAtDurablePrefix`;
    - the built module sources, as code.
- gate (final source):
  - `npm run build`: rc 0, 33 s.
  - `npm run lint:imports`: rc 0, under 1 s.
  - Scenario: rc 0, 1 s, 4 pass, 0 fail.
  - `npm run test:installed:language`: rc 0, 45 s, 1 pass, 0 fail.
  - A first full gate also passed: rc 0 at 32 s, 0 s, 1 s and 46 s. Self-check 1 then changed recovery, so the full gate ran again.
  - After a test-only edit that removed the class-reference literal, the scenario ran again: rc 0, 4 pass, 0 fail.
  - No lifecycle suite was run.
- self-check:
  1. pass after one fix. Recovery first repeated the formula; it now calls the classifier. The only matches are `shared/process/facts.ts:15` and `:21`.
  2. pass: `:747` and `:758` pass `null`; `:1374` and `:1417` pass `encodedFinalProcessFacts()`.
  3. pass: no match.
  4. pass: both diffs are empty.
  5. pass: `replay.ts:298` is the type, `:362` the quiescence name, and `:2457` the `holdsAt` read.
  6. pass.
  7. pass. The changed paths, all granted:
     - the shared atoms: `code/src/shared/process/` (new);
     - the ABG owners: `abg/actor_process.ts`, `abg/worker_transport.ts`, `abg/calculus/rules.ts`, `abg/replay.ts`, `abg/c_call.ts`, `abg/worksite_construction_recovery.ts`, `abg/invocation_admission.ts`;
     - the HOG lifecycle: `hog/ccall_lifecycle.ts`;
     - the helper: `implementation/worksite_command_helper.ts`;
     - the two design files;
     - the scenario test;
     - the regenerated tracked outputs: `build/code/src/abg/actor_process.{js,d.ts}`, `build/code/src/hog/ccall_lifecycle.js`, `contracts/capabilities/capability-definition-graph.json`, `product-toolchain-manifest.json`;
     - this file.
- residuals:
  1. Stale design citations outside the eight closure items. "Change no design text beyond the eight items" keeps them unchanged:
     - §9.2 forms 1, 3 and 4 still describe the pre-step-7 forms at their old lines, for example `worker_transport.ts:461`, `actor_process.ts:1318`, `replay.ts:2444` and `worksite_construction_recovery.ts:228`/`:262`.
     - §9.3 item 1 still cites `actor_process.ts:1312-1328` and `:1306`.
     - §10.1 row 6, the §6 prime-atom table and the generated views still name two atoms.
     - §9.3 item 4 contradicts the realization and §10.6 row 6. It says the helper's encoded facts enter `L` as members of `result.json`. As realized, they stay out of `result.json` (an in-memory WeakMap, no Product output contract change), and only the thrown cleanup failure carries them.
     - Case c shows the facts only in the in-process thrown message. The scenario does not exercise the parent admitting that message into a failure subject in `L`.
  2. The helper's HTTP cleanup throw in `main` (`implementation/worksite_command_helper.ts:1395`) carries no `processFacts`. It lies outside the granted helper lines (`:769`, `:1136`, `:1362-1366` at `97b1200bc`).
  3. Transport artifacts written before this step have no `processFacts` member, so they no longer pass reconstruction. Example: the D1 preserved-result source.
  4. Sites that still read the copy:
     - `abg/transport_contracts.ts:72`/`:77` and `validator/qualification.ts:53` are §9.2 form-4 consumers that row 6 replaces with `holdsAt`. Their files are outside the grant.
     - `abg/actor_process.ts:495-536` is granted. It judges a candidate without a prefix, so a switch would change the signature of the exported `validateActorProcessCarrierPair`.
  5. Behavior changes:
     - Helper: a group probed absent without an observed exit reports unconfirmed, both in `terminationConfirmed` and in the stderr diagnostic.
     - `c_call.ts:2036`: the classifier input reads the fluent. With a disagreeing copy, the recomputed failure class can differ from the recorded one, and that projection then yields `null`.
     - On the actor-refusal branch, the traversal failure's `message` and `diagnosticRef` become the `data:` URI.
  6. The lifecycle suites wait for step 8: `t287-owned-process-lifetime`, `m5-worker-transport`, `t287-worksite-command-execution`, `t287-observed-worksite-command`. The gate does not exercise the new recovery check.
  7. Scenario case b uses two stores: the actor runs over controlled prefixes, and failure retention runs in a real append sink.
- return route: this file.

## Review

Reviewer: Claude Fable 5.1, max effort, fresh context, same vendor family as the Worker (Opus 5.5) and the Executive (Fable); no cross-vendor independence. Subject: `ffb767171` (parent `c6ff45521`), one commit; HEAD equals it and the tenant tree is clean. Path keys: `design` = `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` at the subject; `src/` = `build_tenants/abiogenesis/typescript/code/src/`; `test` = `test_env/tests/t287-lifecycle-failure-carrier.test.mjs`. Re-run here: the scenario once (rc 0, 4 pass, 0.4 s; case a's effect printed as `actor_process_effect_receipt`); the two D1 tests once, which stop before the subject on this machine because `build_tenants/abiogenesis/preimages/source-observation.json` is not in the repo. Build, `lint:imports` and `test:installed:language` are taken from the Return.

Summary: S0 0, S1 0, S2 1, S3 6, S4 3.
New S2 or above: yes, one (F1), on the consequence the Return names as residual 3, graded here for its reach over a real recorded store and a tracked Product proof.

### Findings

- F1. S2 | `src/abg/worksite_construction_recovery.ts:64-70`, `:284`; `design:572` (§9.3 item 7) | "Reconstruction verifies the member against the bound digest as it verifies the rest of the artifact." | `transportProcessFactsMatchExit` returns false when `processFacts` is absent (`:65-66`). The member's only writer is `src/abg/worker_transport.ts:643`, added by this commit, so every transport artifact recorded before it makes `projectPreservedWorksiteProposal` return null. `test_env/tests/d1-preserved-result.test.mjs:21-22` asserts non-null over "the actual retained D1 proposal" (a real native store: 1891 events, 784 stdout chunks, 22 files); it fails at the subject wherever its preimage exists, and no gate suite runs it (`d1-*` is in no npm script). What reconstruction is for: `projectPreservedWorksiteProposal` is the historical read projection that recovers a prior attempt's native work, the worker's result files and their proof, for valid reuse by a later attempt without re-running the worker (`src/implementation/worksite_construction.ts:87-92` through `projectWorksitePreservedResultArtifact`). Footing: not D7's. D7 holds because no path re-reads a stored witness under a new law (`design:189`); here stored referenced evidence is re-read under a new structural requirement, so a projection over unchanged history changes with the law and a Product proof of valid reuse over actual history fails. No admitted truth is lost: the events fold unchanged, the digest still verifies, and the consequence is a declined reuse and a reobservation. | Two repairs, the Executive's choice. (a) One line in `transportProcessFactsMatchExit`: `transport.processFacts === undefined` reads as "facts not recorded" and the check passes on the exit members already compared at `:281-284`, with one sentence in §9.3 item 7 saying so. This is a read-only absence rule on one member, with no digest list, validator set or transition (the mechanism D5 rejected), serving a selected outcome (valid reuse of recorded work) rather than a store-failure model, so it is not the resilience GOALS froze; the activation's "not in general" addressed checked-in fixtures, and the D1 source is a real store. (b) Retain the requirement, state in §9.3 item 7 that artifacts recorded without the member are not reusable and the construction reobserves, and re-cut the D1 preimage under the new law.
- F2. S3 | `design:569` (§9.3 item 4) against `design:649` (§10.6 row 6) and `src/implementation/worksite_command_helper.ts:61-63`, `:821` | Item 4: the helper's facts "encoded once by `encodeOwnedProcessFacts`, enter `L` as members of the admitted leaf result (`result.json` ...)". | A contradiction, not a stale citation. Row 6 as decided and the code keep the encoding out of `result.json` (the WeakMap comment at `:61-62`: "never a result.json member"); only the thrown cleanup failure carries it. `design:531` (§9.1 item 3) and `design:285` (§6 contraction) route readers to item 4. | Replace item 4's second sentence with: "Their facts enter `L` through the admitted leaf result (`result.json`, read once by the parent and admitted by `c_call_result_admitted`) as the members the command result already carries (`exitStatus`, `processSignal`, `timedOut`, `signalSequence`, `terminationConfirmed`, and the unconfirmed-scope diagnostic in `stderr`), or, on the helper's thrown cleanup failure, as `encodeOwnedProcessFacts` in the failure's diagnostic subject (§10.6 row 6)."
- F3. S3 | `src/implementation/worksite_command_helper.ts:767`, `:1123`; `design:634` (P-LIFECYCLE, helper clause) | "The same two negatives on the command and HTTP routes yield the admitted leaf result or failure subject with the encoded facts." | The second negative as the proof defines it (`firstError` set) throws the bare `facts.firstError` at `:767` (command) and `:1123` (HTTP), before the classifier and before either cleanup throw; no `processFacts` leaves the helper on that path. Case c drives `firstError` null (`test:320-333`). Outside the grant. | At both sites throw the diagnostic JSON of `:798-804` with `processFacts: encodeOwnedProcessFacts(facts)` and `firstError.message` as `diagnostic`; or narrow P-LIFECYCLE's helper clause to the unresolved-cleanup negative until step 8 proves the route.
- F4. S3 | `src/implementation/worksite_command_helper.ts:1395-1399`; `design:634` | Residual 2: the HTTP cleanup throw carries no `processFacts`. | Confirmed. `runHttpProbe` returns on `unconfirmed` with the seven-member stderr diagnostic (`:713-719`, `:1126-1127`), so `facts` are out of scope at `:1395`; the thrown JSON carries `observation` and that diagnostic only. Outside the grant. | Move the HTTP cleanup throw into `runHttpProbe` beside `facts`, as `runCommand` does at `:798-804`, with `processFacts`; keep `main`'s check as the guard.
- F5. S3 | `test:256-262`; activation case (b); `design:634` | Case b drives "an error after launch with unresolved cleanup (`scopeAbsence` not `"absent"`, `firstError` set)". | The scenario asserts `finalFacts.firstError === null` (`:262`) and drives the sibling path, `TypeError("worker owned process scope remains unconfirmed")` (`src/abg/worker_transport.ts:555-557`). Both paths end at the outer catch (`src/abg/actor_process.ts:1417`) with `encodedFinalProcessFacts()`, so the carrier claim holds by reading, but the stated negative is not the one executed. | In `driveActor('unconfirmed')` emit a stream `error` after `exit` so the lifetime sets `firstError`; assert that the transport threw it and that `effect.processFacts.firstError.message` carries it.
- F6. S3 | `test:199-254`, `:281` | Case b's retained subject. | Two stores: the owner's terminal event is in the recorder's rows; `runtime_failure_observed` is in a second real append sink with the refusal rebased onto its prefix (`:241`), and `failActorProcessEffect` is called directly with a synthetic `ExecutableCCallContext` (`:245`), not from `evaluateOwnedExecutableCCall` (`src/hog/ccall_lifecycle.ts:556-558`). The retention check (`src/abg/runtime_failure.ts:239-241`) and `projectRuntimeFailureEvidenceAtPrefix` are real. Not shown: §9.3 item 6's composition (`holdsAt` with the retained subject) over one prefix. Residual 7 confirmed. | No change now; state in the test header what is not shown, and leave the one-prefix composition to step 8's lifecycle suites.
- F7. S3 | `src/implementation/worksite_command_helper.ts:61-63`, `:821`, `:1380-1386`; `design:649` | Proportionality: the WeakMap `commandProcessFacts` and `main`'s `processFacts` member. | `runCommand` throws at `:798-804` before constructing any result with `terminationConfirmed: false`, so `main`'s branch at `:1380` is unreachable; the WeakMap (`:63`, `:821`) and `:1385` serve that branch only. Row 6 cites `:1380` as a carrier; the closure's cited site (`:1362-1366` at `97b1200bc`) is this branch. | Delete the WeakMap, its `set` and the `:1381`/`:1385` lines; cite `:798` alone in row 6; keep or delete `main`'s guard as the owner prefers.
- F8. S4 | `test:185-190` | The Return: "The effect is `actor_process_effect_receipt`." | The test accepts a refusal or a receipt (`:187-189`) and only prints the kind. | `assert.equal(effect.kind, 'actor_process_effect_receipt')`.
- F9. S4 | `design:549`, `:553-558`, `:566`, `:589`, `:270-285`, `:189`, `:199` | Design lines outside the eight items describe the prior state or cite moved lines. | Form 1 (`:553`): `worker_transport.ts:461`, `actor_process.ts:1318`, helper `:769`/`:1136` no longer hold the formulas (now `shared/process/facts.ts:15`, `:21`, used at `worker_transport.ts:465`, `actor_process.ts:1323`, helper `:772`, `:1126`). Form 2 (`:554`): `c_call.ts:6607` no longer compares the copy (`:6635` compares `exitObserved` with the fluent); `actor_process.ts:1149` is `:1160`; `c_call.ts:2033` is `:2036` and reads the fluent. Form 3 (`:555`): `replay.ts:2444` is `:2457` and reads `holdsAt`. Form 4 (`:556`): recovery `:228`/`:262` are `:249`/`:284` and read `holdsAt`; `transport_contracts.ts:71`/`:76` are a pure classifier's parameter, not a consumer of a recorded copy. `:558` states a completed change as a target. `:549` "No reader consumes the field" over-claims while the candidate validators remain. §9.3 item 1 (`:566`): `:1312-1328` is `:1323-1340`, `:1306` is `:1322`. §10.1 row 6 (`:589`) names two atoms. §6 (`:270-284`) has no row for `classifyOwnedProcessTerminal`. §4.4: `actor_process.ts:1318` (`:199`) is `:1331`; `c_call.ts:7047` (`:189`) is `:7052`, moved by this step's own insertions. | Rewrite §9.2's four forms as the present census (the atom at three sites; the recorded copies; the `holdsAt` readers; the candidate validators left), drop or date the `:558` sentence, refresh the line numbers named here, add a §6 row for the classifier (domain: `OwnedProcessFacts` from one lifetime; falsifier: an outcome other than §4.6's three-case formula, or an adapter keeping its own formula), and name three atoms in §10.1 row 6.
- F10. S4 | `src/abg/worksite_construction_recovery.ts:58-60`, `:68-69` | `PROCESS_FACT_MEMBERS` and the cast `facts as unknown as OwnedProcessFacts`. | A second hand-kept list of the 13 members, and the classifier applied to a decoded record outside its admitted domain. Correct today because the encoding keeps the four members the classifier reads in their value domains (`src/shared/process/facts.ts:52-65`); the list drifts silently if a member is added. The exit-consistency clause (`:69`) exceeds closure item 4's text and matches the neighbouring member checks. | Export the member list from `shared/process/facts.ts` beside the encoder and import it here.

### Evaluations with no finding, in the activated order

1. Claim against evidence. One commit; the changed paths are the granted ones plus the regenerated digests in `capability-definition-graph.json` and `product-toolchain-manifest.json` (digest-only diffs); `build/` is ignored except 40 tracked files, which is why the stat shows two rebuilt modules. Self-checks 1 to 5 and 7 re-run here: (1) the only matches are `facts.ts:15`, `:21`, and no other `scopeAbsence` comparison exists outside `shared/` (the two remaining mentions are the recovery member list and the stderr diagnostic's member copy); (2) `:747`, `:758` pass `null`, `:1374`, `:1417` pass `encodedFinalProcessFacts()`; (3) no match; (4) both diffs empty; (5) `replay.ts:298`, `:362`, `:2457`; (7) as listed. The scenario reruns at rc 0.
2. Law. The changes are within `realization_refactor` plus the eight items. Behavior changes: the helper's reading of a group probed absent without an observed exit (item 1; because `runCommand:798` throws on `unconfirmed`, that case now stops dependent work where it continued, the divergent reading row 6 retires); the refusal member (item 2); the `data:` URI as the traversal failure's `message` and `diagnosticRef` on the actor-refusal branch (item 3, ratified in row 6); the transport artifact member (item 4) and its reconstruction requirement (F1); the six readers on the fluent (D5), which differ from the copies only where a copy disagrees, the emission premise row 5 holds open. The law paragraph holds: the terminal events are the facts' one existence in `L`; the in-memory handoff (`onProcessFinalized`, `finalProcessFacts`) is layer 1; one terminal per owner (`src/abg/actor_process.ts:1318-1341`); the failure carries the encoded facts as its subject (case b); the switched readers use `holdsAt`; the WeakMap is a process-local handoff inside one interface, not a store read back by another; the transport artifact is referenced evidence bound by digest.
3a. Design closure. Each of the eight items is written where the closure says (design hunks at `:213`, `:218-220`, `:230`, `:531`, `:554`, `:556`, `:567-568`, `:571-572`, `:634`, `:649`, `:666`; constitution `:4390`), and the diff touches nothing else under `design/`. Closure item 6's six census sites from the step 1 re-review are in form 2, re-verified at head. Item 4 is F2; the stale citations are F9.
3b. The reporting choice. The actor's three appends branch on the classifier (`:1323-1340`); the worker transport's formulas (`:465`, `:555`) and the actor's artifact premise (`:1123`) are equivalent to the old ones given the lifetime invariant `noChildEstablished` implies `launchFailure !== null` (`src/shared/owned_process_lifetime.ts:171`); the helper's two sites report `terminal !== "unconfirmed"` (`:778`, `:1149`); the transport's field is `hasConfirmedOwnedProcessBoundary(facts)` (`:465`). A no-child launch failure reports 127 and `true` (case c, `test:315-318`).
3c. The encoding. `encodeOwnedProcessFacts` (`src/shared/process/facts.ts:50-67`) emits the 13 members of `OwnedProcessFacts` (`src/shared/owned_process_lifetime.ts:104-118`) under their names; an `Error` becomes the six string-or-null members with no `stack` (`:35-46`; a finite numeric `errno` as its base-10 string, within "string or null"); the `bigint` is tagged; `directExit` is `{status, signal}`; the result is frozen and passes `canonicalJson` (the artifact write at `worker_transport.ts:651`). No member dropped or renamed.
3d. The refusal route. Both post-finalization refusals pass the encoded facts; the hoist at `:779-783` is the only declaration (`finalProcessFacts` at `:781`, `:783`, `:1123`, `:1309`, `:1318`, `:1322`). `failActorProcessEffect` (`src/hog/ccall_lifecycle.ts:231-239`) computes `stage` and `candidate` once and passes the same values to `failCCall` (`:207-225`, passthrough) and into `constructRuntimeFailureDiagnosticRef({ stage, candidate })`; `failTraversal` admits `{ stage: input.stage, candidate: input.candidate }` (`src/hog/traversal_failure.ts:81-94`); `admitRuntimeFailure` requires the `data:` reference to decode canonically to that subject's digest (`src/abg/runtime_failure.ts:239-241`, `:100-105`). The refusal's members are all JSON. No reader keys on the class reference (`git grep` over `code/src test_env`: `actor_process.ts:204` only). The projection's `diagnosticClassRef: null` on this branch is the ratified consequence.
3e. F1.
3f. The copy check lives in the lifecycle rule (`src/abg/calculus/rules.ts:197-205`; `appliesTo` at `:226-230`; dispatch `fold.ts:113`), reads only `actor_result_artifact_observed` and `probabilistic_transport` `c_call_evidenced` (both variants carry `processRef` and `terminationConfirmed`: `src/abg/event_store.ts:301`, `:731-735`), compares against `actor_process_terminated(processRef)` at the cut before the copy's event, initiates `terminationConfirmed_copy_disagrees` and refuses nothing; the fluent is in `RUN_QUIESCENCE_ALLOWED_HISTORICAL_FLUENTS` (`src/abg/replay.ts:362`), so a disagreement blocks no Run close. `replay.ts:2457` reads `holdsAt`, not the exit event. The census sums to 47; the "reader switched" rows read `holdsAt`: `c_call.ts:2036-2037`, `:6635-6636`, `replay.ts:2457-2458`, `invocation_admission.ts:514-516`, recovery `:249`, `:284` (through `:54-57`). Prefix-end reads are sound because no rule terminates `actor_process_terminated`. `transport_contracts.ts:72`/`:77`: correctly left; `classifyWorkerTransportFailure` is pure and reads its parameter, and after this step its callers pass the edge value (`worker_transport.ts:601`), the fluent (`c_call.ts:2036`) or a candidate's own field (`actor_process.ts:532`). `actor_process.ts:495-536`: correctly left; `validateActorProcessCarrierPair` checks a candidate's internal consistency (`terminalPairValid` at `:495`, the expected class from the candidate's fields at `:526-532`) without a prefix and decides no lifecycle fluent, so the §6 `holdsAt` falsifier does not reach it; switching would add a prefix to an exported validator. `validator/qualification.ts:53`: a helper-route consumer, correct by §9.3 item 4.
3g. The harness drives the actor in-process: the real built `invokeActorProcessWithAssembly` (`test:116-137`, `:145`) over the real built worker transport (`:109-112`) and the real lifetime with a controlled host (`:47-54`); the event store is a recorder (`:120-125`) that skips `admitRuntimeEvent`'s payload validation, so case a's "payload key list unchanged" rests on `:174`, not on the store; the `holdsAt` answers run over `selectValidatedRuntimeEventPrefix` of legacy-profile rows (`:56-58`). Case c runs the real built `runCommand` with `main` stripped (`:305-309`) over real children. Case d is a synthetic prefix over the real fold. What weakens a claim: F5, F6, F8.
3h. No contract change: `event_store.ts` and `product/` are untouched; the observation body names its members (`src/abg/actor_process.ts:1134` onward) and case a asserts the key is absent; `result.json` gains nothing. The transport artifact body and `WorkerTransportResult` gain `processFacts` (referenced evidence and an internal interface; item 4).
3i. F3, F4.
3j. D7 wording confirmed. `src/abg/traversal_route.ts:4438` compares the route candidate's `replayStateDigest` with the caller's `replayState.replayDigest` and the current replay; `:5371` compares the transition's `route.replayStateDigest` with `predecessorReplay`, computed in the same call; `src/abg/c_call.ts:7052` (the design's `:7047`, moved by this step) compares the judgment candidate's `replayStateDigest` with `replayState.replayDigest` and the current replay. Every other occurrence writes the field (`hog/route_proposal.ts:131`, `:1378`; `hog/judgment.ts:90`; `c_call.ts:3282`, `:6122`, `:7285`; `invocation_admission.ts:586`) or reads it into a projection (`replay.ts:658`, `:804`; `traversal_transition.ts:164` is a null check). No stored-versus-recomputed comparison.
4. Proportionality: F7, F10.

### Residuals confirmed/refuted

1. Confirmed and extended (F9); §9.3 item 4 is a contradiction (F2); case c's in-process limit is F3 and F6.
2. Confirmed (F4); the bare `firstError` throws are the same class (F3).
3. Confirmed and graded (F1); the D1 tests are the consequence the Return does not name.
4. Confirmed; all three correctly left (3f).
5. Confirmed. On the second bullet: a null from `projectAdmittedActorTransport` reaches `hasAdmittedActorEvidence` (`c_call.ts:2128-2139`, false), the failure-source projection (`:2237-2250`, null) and the live F04 outcome (`c_call_outcome.ts:1414`); none refuses a prefix at replay, and on a live path the copy and the fluent agree, so the only reach is the emission premise row 5 holds open.
6. Confirmed; `m5-worker-transport` is in `test:unit`, which the gate did not run; the D1 tests are in no script.
7. Confirmed (F6).

## Disposition of the review (Executive, 2026-10-23)

Two reviews are disposed here: the Fable review above (subject `ffb767171`)
and a second review Jim pasted on 2026-10-23, reviewer not named, taken at
`c6ff45521` plus the uncommitted step 7 work. The second review's findings
1 and 2 are F3/F4 and F1; its findings 3 to 7 concern steps 4, 5, 6 and 8
and are recorded under `## Items accrued for step 8` in `step-8.md` with
the Executive's verification. Severity is the Reviewer's; priority is the
Executive's. One repair round.

| Finding | Severity | Priority | Disposition |
|---|---|---|---|
| F1 (second review 2) | S2 | P1 | Executive decision D8 (plan post): repair (a). One line in `transportProcessFactsMatchExit`: an absent `processFacts` reads as "facts not recorded" and the check passes on the exit members already compared and the `actor_process_terminated` fluent; a present member is verified in full. One sentence in §9.3 item 7. Reason: unlike D7, a stored artifact is re-read under the new requirement, and a tracked Product proof over a real store (`d1-preserved-result.test.mjs`) would otherwise fail or need its preimage re-cut; no admitted truth is lost either way. The second review's "demonstrate recovery from a pre-change artifact" is that D1 test where its preimage exists; nothing else is built. Reversal: delete the line, re-cut the D1 preimage. This round. |
| F2 | S3 | P1 | §9.3 item 4 replaced by one sentence: on the helper route the encoded facts enter `L` through the admitted failure's diagnostic subject; on success the command result's existing members are the admitted leaf result's members; the encoding is not a `result.json` member. This round. |
| F3 (second review 1, graded S2 there) | S3 | P1 | The two bare `throw facts.firstError` sites (`:767` command, `:1123` HTTP) throw the `:798` diagnostic JSON with `processFacts: encodeOwnedProcessFacts(facts)` and the original error's name and message as `diagnostic`. The grant gap was the Executive's: the activation granted `:769` and `:1136`, not the two lines above them. P-LIFECYCLE's helper clause stays as written; the command route's second negative is exercised by a new scenario case; the HTTP route's exercise is step 8's integrated run, stated in P-LIFECYCLE. This round. |
| F4 | S3 | P1 | The HTTP cleanup throw moves into `runHttpProbe` beside `facts`, with `processFacts`, as `runCommand` does at `:798`; `main`'s check stays as a guard. This round. |
| F5 | S3 | P2 | `driveActor('unconfirmed')` emits a stream `error` after `exit` so the lifetime sets `firstError`; the case asserts the transport threw it and `effect.processFacts.firstError.message` carries it. This round. |
| F6 | S3 | P3 | No code change. The test header states what is not shown (two stores; `failActorProcessEffect` called directly). The one-prefix composition of §9.3 item 6 is step 8's. This round, header only. |
| F7 | S3 | P2 | Delete the WeakMap `commandProcessFacts`, its `set`, and `main`'s `processFacts` member; keep `main`'s guard; row 6 cites `:798` alone. This round. |
| F8 | S4 | P3 | `assert.equal(effect.kind, 'actor_process_effect_receipt')`. This round. |
| F9 | S4 | P4 | Stale citations: step 8b design notes (recorded in `step-8.md`). |
| F10 | S4 | P3 | Export the member list beside the encoder and import it in recovery: step 8a (recorded in `step-8.md`). |

Residuals: all seven confirmed by the review; 1 and 2 are repaired above
(F2, F3, F4); 3 is D8; 4, 5 and 7 stand as recorded; 6
(`m5-worker-transport` not run by the gate) is run once in this repair
round's gate under the step 8 attribution rule.

## Repair activation

Executive: Claude Fable. Worker: Opus 5.5, xhigh, fresh context, Writer grant.
Frozen base: `ffb767171` on `main` (HEAD; the Executive's bookkeeping commit on
top carries only `.ai-workspace/` files). Read `## Activation`, `## Return`,
`## Review` (F1 to F8 and 3b to 3j) and `## Disposition of the review` above
before touching code. Design = `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`.
Tenant root `build_tenants/abiogenesis/typescript`; every test runs with
`node --experimental-vm-modules --test`.

Change class: `realization_refactor` plus the design sentences named here.
Do exactly the eight repairs in the disposition table marked "this round",
in this order:

1. F3: `implementation/worksite_command_helper.ts:767` and `:1123`. Replace
   each bare `throw facts.firstError` with a `TypeError` whose message is
   `worksite command failed; dependent work stopped: ` (command) or
   `worksite HTTP probe failed; dependent work stopped: ` (HTTP) followed by
   the canonical JSON of `{ taskRef, taskDigest, attemptRef, command (or
   request), diagnostic: { name, message } of the original error,
   processFacts: encodeOwnedProcessFacts(facts) }`, the same shape as the
   cleanup throw at `:798-804`. Before changing the message, `grep -rn` the
   parent for any reader that keys on the old thrown message or on
   `firstError` text leaving the helper (`code/src/abg/c_call*.ts`,
   `hog/`, `implementation/worksite_construction*.ts`); if one exists, stop
   and report it. Keep `ownerError` at `:1124` as it is.
2. F4: move the HTTP cleanup throw of `main` (`:1395-1399`) into
   `runHttpProbe` beside `facts`, carrying `processFacts`; `main` keeps its
   `terminationConfirmed !== true` check as a guard that can no longer fire.
3. F7: delete `commandProcessFacts` (`:61-63`), its `set` (`:821`) and the
   `processFacts` member of `main`'s cleanup throw (`:1381`, `:1385`);
   `main`'s guard stays.
4. F1 (D8): in `abg/worksite_construction_recovery.ts:64-70`, one line: if
   `transport.processFacts === undefined` return `true` (the exit members at
   `:281-284` and `actorProcessTerminated` already decide); a present member
   is still checked in full. Add to design §9.3 item 7 (`design:572`) one
   sentence: "A transport artifact recorded before this member exists reads
   as facts not recorded; reconstruction decides on the exit members it
   already compares and on `actor_process_terminated`; a present member is
   verified in full (D8)."
5. F2: replace design §9.3 item 4 (`design:569`) with one sentence stating:
   helper-run processes have no `actor_process_*` events; on the helper
   route their encoded facts enter `L` through the admitted failure's
   diagnostic subject (the thrown cleanup failure and the error-after-launch
   failure of item 1 above); on success the command result's existing
   members (`exitStatus`, `processSignal`, `timedOut`, `signalSequence`,
   `terminationConfirmed`) are the admitted leaf result's members; the
   encoding is not a `result.json` member; the lifecycle question is a
   projection of that admitted event. In §10.6 row 6 (`design:649`) cite the
   helper's throw as `:798` alone (line at your head) and add the two
   error-after-launch throws by line. In P-LIFECYCLE (`design:634`) add after
   the helper sentence: "The command route's second negative is the
   scenario's case e; the HTTP route's is proved by step 8's integrated run."
6. F5: in `test_env/tests/t287-lifecycle-failure-carrier.test.mjs`,
   `driveActor('unconfirmed')` emits a stream `error` after `exit` so the
   lifetime sets `firstError`; case b asserts the transport threw it
   (`assert.match(String(transportError), ...)` on its message) and
   `effect.processFacts.firstError.message` carries it; remove the
   `firstError === null` assertion. If the lifetime's `observe()` suppresses
   the second error (`owned_process_lifetime.ts:216`), emit the stream
   error first and say so in Return.
7. New case e, command route, second negative: through the same component
   harness as case c, run `runCommand` with a lifetime stub whose `facts`
   have `scopeAbsence: 'unknown'` and `firstError` set; assert a `TypeError`
   whose message starts `worksite command failed; dependent work stopped: `,
   whose JSON carries `processFacts.scopeAbsence === 'unknown'` and
   `processFacts.firstError.message` equal to the error's message, and
   `diagnostic.message` the same. No HTTP case.
8. F8 and F6: case a asserts `effect.kind === 'actor_process_effect_receipt'`;
   the test header states in two lines what case b does not show (two
   stores; `failActorProcessEffect` called directly, not from
   `evaluateOwnedExecutableCCall`).

**Grant.** Under `build_tenants/abiogenesis/typescript`:
`code/src/implementation/worksite_command_helper.ts` (the sites above),
`code/src/abg/worksite_construction_recovery.ts` (the one line),
`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` (§9.3 items 4
and 7, §10.5 P-LIFECYCLE helper sentence, §10.6 row 6 citation),
`test_env/tests/t287-lifecycle-failure-carrier.test.mjs`, the build outputs
the gate regenerates. Plus this file's `## Repair return`. Nothing else.

**Gate (in order):** `npm run build`; `npm run lint:imports`;
`node --experimental-vm-modules --test test_env/tests/t287-lifecycle-failure-carrier.test.mjs`
(5 cases); `node --experimental-vm-modules --test test_env/tests/m5-worker-transport.test.mjs`
(report pass/fail per test; a failure present at `97b1200bc` with the same
assertion is baseline, state it and continue; a new failure stops);
`npm run test:installed:language`.

**Self-checks:** (1) `grep -n "throw facts.firstError" code/src/implementation/worksite_command_helper.ts`
returns nothing; (2) `grep -n "commandProcessFacts" code/src` returns
nothing; (3) `git diff --stat` touches only granted paths; (4) the scenario
is 5/5; (5) `git diff code/src/abg/event_store.ts` is empty.

**Stop:** a reader keys on the old thrown message; the lifetime cannot set
`firstError` after exit in the harness; `m5-worker-transport` has a failure
absent at `97b1200bc`; anything outside the grant is needed.

**Return contract.** One commit on `main`, no push. Message first line
`Step 7 repair: helper failures carry processFacts; D8 archive tolerance; §9.3 item 4`,
last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Append:

```
## Repair return
- commit: <hash>
- repairs: <1 to 8, each: done / stopped with reason; the lines at head>
- reader check: <grep result for the old message>
- gate: <build s; lint; scenario 5/5; m5-worker-transport per test with attribution; smoke>
- self-checks: <1 to 5>
- residuals
- return route: this file
```

## Repair return

- commit: `dddb05dfd` (parent `e8f56543b`), first line `Step 7 repair: helper failures carry processFacts; D8 archive tolerance; §9.3 item 4`. Not pushed. This section is uncommitted. Lines below are at `dddb05dfd`; `helper` = `code/src/implementation/worksite_command_helper.ts`.
- repairs:
  1. F3: done.
     - The command throw is at helper `:764-770` (`worksite command failed; dependent work stopped: `). The HTTP throw is at `:1126-1132` (`worksite HTTP probe failed; dependent work stopped: `).
     - Each throw's JSON is `{ taskRef, taskDigest, attemptRef, command | request, diagnostic: { name, message }, processFacts }`.
     - `command` is the declared `task.commands[ordinal]`, because no process observation exists at that point. `request` is the declared request record.
     - `ownerError` is unchanged at `:1133`.
  2. F4: done. The HTTP cleanup throw is at helper `:1163-1169` in `runHttpProbe`. Its JSON is `{ taskRef, taskDigest, attemptRef, observation, diagnostic, processFacts }`.
     - `observation` is now the probe value (the predicate's `observedValue`), not the predicate observation `main` held.
     - `main`'s guard is unchanged at `:1411`.
     - This is the one change beyond the cited lines, and the throw shape requires it so `attemptRef` reaches the probe:
       - `_task` is renamed `task` (`:1019`).
       - `attemptRef: string | null = null` is added to `runHttpProbe` (`:1022`) and to `predicateObservation` (`:1178`).
       - The value is passed at `:1247` and `:1407`.
       - Existing three-argument callers are unaffected.
  3. F7: done.
     - `commandProcessFacts` is gone: the declaration and comment (`:61-63` at `ffb767171`), and the `set` before `return result`.
     - `main`'s `processFacts` member and its `get` are gone. `main`'s guard stays at `:1398`.
     - The `OwnedProcessFacts` import stays because `unconfirmedScopeDiagnostic` uses it.
  4. F1 (D8): done.
     - `abg/worksite_construction_recovery.ts:65` is `if (transport.processFacts === undefined) return true;`. The call site is now `:285`.
     - The design sentence is appended to §9.3 item 7 (`design:572`). In the same item, its reconstruction citation `:284` is refreshed to `:285`, the line this round moved.
  5. F2: done.
     - §9.3 item 4 (`design:569`) is one sentence. It describes the throw as "the failure thrown when the lifetime records a first error after launch" and does not say "item 1 above".
     - The P-LIFECYCLE sentence is added verbatim (`design:634`).
     - §10.6 row 6 (`design:649`) cites:
       - the cleanup throw `:801`, plus the HTTP probe's `:1164`, which carries `processFacts` after repair 2;
       - the two error-after-launch throws `:765` and `:1127`.
     - "of the failing command's facts" now reads "of the failing process's facts".
  6. F5: done.
     - `driveActor('unconfirmed')` emits `child.stdout` `error` between `exit` and `close` (`test:111`; error at `:64`). `fail()` is not gated by `observe()`, so the lifetime sets `firstError` after exit and no reordering was needed.
     - Case b asserts:
       - the transport threw that error (`:263`);
       - `effect.processFacts.firstError.message` carries it (`:274`).
     - The `firstError === null` assertion is removed.
     - Consequences:
       - The refusal message is now the stream error.
       - The lifetime's SIGKILL `onSignalRequested` is suppressed by `observe()`. No assertion reads it.
  7. Case e: done. It is a separate test (`test:337`). It uses:
     - case c's component harness;
     - `spawn` stubbed with a controlled emitter, so no real process is unowned;
     - a lifetime stub with 13-member facts (`scopeAbsence: 'unknown'`, `firstError` set).

     It asserts:
     - the `TypeError` prefix;
     - `taskRef`, `attemptRef` and `command.commandId`;
     - `processFacts.scopeAbsence`;
     - `processFacts.firstError.message` and `diagnostic.message` equal to the error's message;
     - `processFacts` equal to `encodeOwnedProcessFacts(facts)`.
  8. F8 and F6: done.
     - Case a asserts `effect.kind === 'actor_process_effect_receipt'` (`test:191`). The either-branch check and its diagnostic line are removed.
     - The header (`test:25-28`) states that case b uses two stores and calls `failActorProcessEffect` directly, not from `evaluateOwnedExecutableCCall`.
- reader check: `grep -rn "dependent work stopped\|cleanup unresolved\|worksite command failed\|worksite HTTP\|HTTP probe failed\|firstError"` over `code/src/abg/c_call*.ts`, `code/src/hog/` and `code/src/implementation/worksite_construction*.ts` returns nothing.
  - Across all of `code/src`, the messages occur only in the helper.
  - `firstError` occurs only in:
    - `shared/` (the lifetime, the atoms, `i_json.ts`);
    - `abg/worker_transport.ts`;
    - the recovery member list (`abg/worksite_construction_recovery.ts:59`).
  - None of these keys on helper text.
- gate (final source, run once after all eight repairs):
  - `npm run build`: rc 0, 32 s.
  - `npm run lint:imports`: rc 0, under 1 s.
  - Scenario: rc 0, 5 pass, 0 fail, 0.4 s.
  - `m5-worker-transport`: rc 0, 21 tests, 21 pass, 0 fail, 6 s. No baseline attribution was needed. Each test passed:
    - B-001 lane-owned Claude execution posture;
    - native report host schema presentation;
    - schema literal placeholders;
    - structured output final carrier;
    - B-001 append argument bounds;
    - B-001 sandbox binding precedence;
    - transport identity;
    - B-001 real worker process;
    - Bash tool identity;
    - B-001 closed-prompt tool activity;
    - closed-prompt StructuredOutput;
    - selected result text final carrier;
    - force-terminate on SIGTERM;
    - inactivity lease from progress;
    - no renewal from unacknowledged output;
    - output after the timeout boundary;
    - owned process groups descendant cleanup;
    - descendant output after direct-process exit;
    - long inactivity, absolute and grace values;
    - native wakeup above the host timer domain;
    - early stdin close EPIPE.
  - `npm run test:installed:language`: rc 0, 45 s, 1 pass.
  - The regenerated outputs `capability-definition-graph.json` and `product-toolchain-manifest.json` change only in digests and digest-derived refs.
- self-checks:
  1. pass: no match.
  2. pass: no match.
  3. pass: the commit touches only granted paths:
     - recovery;
     - the helper;
     - the design;
     - the scenario;
     - the two regenerated outputs.
  4. pass: 5/5.
  5. pass: the diff is empty.
- residuals:
  1. `t287-owned-process-lifetime` (a step 8 suite, outside this gate) was run once after the repair: rc 1, 15 pass, 3 fail. All three failures come from repair 1. It was not run at `ffb767171`.
     - `:384` (assert `:415`): `ownerFailure` expects the bare error identity.
     - `:443` (assert `:490`): command and HTTP expect the bare error identity.
     - `:509` (assert `:533`): the HTTP `owner-error` mode expects the original message.
     - At `:490` and `:533` the fixture tasks lack `taskDigest`, or are `{}`. `canonicalJson` therefore throws `Cannot convert undefined or null to object`, and that error replaces the first error. Production tasks carry both members.
     - Step 8 updates these tests to the new shape with full tasks, or decides that diagnostic construction must not mask the first error.
     - `m5-worker-transport`'s owned-group test has the same exposure:
       - It calls `runHttpProbe({}, …)`, and `runCommand` with a task that has no `taskRef` or `taskDigest`.
       - An unconfirmed HTTP outcome now throws from `canonicalJson` instead of returning `terminationConfirmed: false` to that test's `!alive(-leaderPid)` check.
       - The HTTP half is new in repair 2. The test passed in this run.
  2. The HTTP route's second negative is not exercised here. P-LIFECYCLE leaves it to step 8's integrated run.
  3. P-LIFECYCLE's helper clause (`design:634`, kept as written by the disposition) says the helper negatives "yield the admitted leaf result or failure subject with the encoded facts".
     - For a helper no-child launch failure the outcome is a leaf result.
     - The new §9.3 item 4 says the encoding is not a `result.json` member.
     - This is the same class as F2. It goes to step 8b.
  4. The parent's admission of the thrown helper failures into a failure subject in `L` is still shown only by reading (step 7 residual 1, F6).
  5. F9 and F10 stand for step 8.
- return route: this file

## Disposition of the repair (Executive, 2026-10-23)

Accepted: `ffb767171` + `dddb05dfd`. The `attemptRef` threading in
`runHttpProbe` and `predicateObservation` is inside the granted file and the
throw shape needs it; row 6 citing the HTTP cleanup throw as well is correct
after F4. Residual 1 (`t287-owned-process-lifetime` 15/18; `m5-worker-transport`
fixtures with `{}` tasks) is a step 8a fix inside the test files: the
helper's input contract carries `taskRef` and `taskDigest`, the fixtures do
not, and the three assertions expect the bare error that F3 retired; no
masking change in the helper. Residual 3 (P-LIFECYCLE's helper clause for a
no-child launch failure) is 8b wording. Residuals 2, 4 and 5 stand as
recorded. Ledger row 7 closed in the plan post.
